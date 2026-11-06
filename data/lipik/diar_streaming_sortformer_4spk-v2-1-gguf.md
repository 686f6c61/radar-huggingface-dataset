# lipik/diar_streaming_sortformer_4spk-v2.1-gguf

## Resumen

`lipik/diar_streaming_sortformer_4spk-v2.1-gguf` es una conversión al formato GGUF del modelo `nvidia/diar_streaming_sortformer_4spk-v2.1`, un diarizador de hablantes en streaming desarrollado por NVIDIA. El modelo resuelve el problema de "quién habla y cuándo" en audio conversacional, identificando hasta cuatro hablantes simultáneos y emitiendo segmentos con marcas temporales de inicio y fin. No es un modelo de transcripción: produce segmentos de hablante, no texto.

La arquitectura combina un encoder FastConformer con una cabeza Transformer de 18 capas que emite probabilidades de actividad de hablante por frame. Incorpora un mecanismo de Arrival-Order Speaker Cache (AOSC) junto con una cola FIFO que permite el procesamiento online, manteniendo embeddings acústicos de hablantes previamente observados. Con 117,7 millones de parámetros, es un modelo compacto diseñado para despliegue eficiente en CPU y GPU.

Esta conversión GGUF está pensada para su uso con `transcribe.cpp`, una implementación en C++ que permite ejecutar el modelo sin dependencias de Python ni de NeMo. El interés actual radica en la posibilidad de integrar diarización en tiempo real en pipelines ligeros, con cuantizaciones que van desde 471 MB (F32) hasta 139 MB (Q8_0) y una degradación mínima del DER respecto al modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + Transformer de 18 capas (cabeza de diarización) |
| Parametros totales | 117.711.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento streaming por frames) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | NVIDIA Open Model License (heredada del modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Sortformer, un enfoque end-to-end para diarización de hablantes que resuelve el problema de permutación ordenando los hablantes según su orden de llegada (arrival-time order). El encoder FastConformer extrae representaciones acústicas frame a frame, y una cabeza Transformer de 18 capas transforma esas representaciones en probabilidades de actividad de hablante para cada uno de los cuatro hablantes posibles.

La versión streaming incorpora un Arrival-Order Speaker Cache (AOSC) que almacena embeddings acústicos a nivel de frame de los hablantes ya observados, combinado con una cola FIFO para gestionar la memoria de forma acotada. Esto permite procesar audio de forma online sin necesidad de disponer de la señal completa. El modelo está entrenado con objetivos no convencionales respecto a los diarizadores end-to-end habituales, según se describe en el paper de Sortformer (arXiv:2409.06656) y su extensión streaming (arXiv:2507.18446). No se dispone en la información proporcionada del número de tokens de entrenamiento ni de la composición exacta del dataset.

## Capacidades

- Diarización de hablantes en streaming: identifica hasta 4 hablantes y emite segmentos con `t0_ms`, `t1_ms` y `speaker_id` en orden de llegada.
- Procesamiento online: soporta distintos puntos de operación (latencia/precisión), incluyendo `very_high_latency`.
- Detección de actividad de voz (VAD) implícita en las probabilidades por frame.
- Entrada de audio: WAV mono a 16 kHz.
- Salida en JSONL con segmentos de hablante; la línea `text:` queda vacía por diseño (no transcribe).
- No soporta traducción (`translate: false`) ni detección de idioma (`lang_detect: false`).
- No genera timestamps de transcripción (`timestamps: none`).
- Integración mediante API C (`transcribe_n_speaker_segments`, `transcribe_get_speaker_segment`) y extensión de ejecución en `include/transcribe/sortformer.h`.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.

## Casos de uso

- Diarización en reuniones y actas automáticas: el modelo segmenta las intervenciones de hasta cuatro participantes en una reunión grabada o en directo, permitiendo etiquetar cada fragmento con su hablante antes de pasarlo a un sistema de transcripción (ASR) separado.
- Análisis de llamadas de atención al cliente: al procesar audio de centros de contacto, se pueden separar las intervenciones del agente y del cliente para calcular tiempos de habla, turnos y silencios, con la ventaja de que el streaming permite monitorización en cuasi tiempo real.
- Integración en voice agents: tal como indica la model card original, el diarizador puede habilitar el reconocimiento de hablantes en el NeMo Voice Agent, permitiendo que un agente conversacional sepa quién está hablando en cada momento.
- Investigación en lingüística conversacional: extracción de patrones de turnos de palabra, solapamientos y distribución de habla en corpus de audio, con la ventaja de un modelo compacto (139 MB en Q8_0) que se ejecuta en CPU.
- Preprocesado para pipelines de transcripción: los segmentos de hablante generados pueden alimentar un ASR que añada el texto, obteniendo transcripciones con etiquetas de hablante sin necesidad de un diarizador pesado basado en clustering.
- Despliegue en dispositivos con recursos limitados: gracias a las cuantizaciones F16 (237 MB) y Q8_0 (139 MB) y a la implementación en C++ de `transcribe.cpp`, puede ejecutarse en entornos sin GPU o en hardware embebido para monitorización de audio en tiempo real.
- Moderación y análisis de contenido en audio: detección de cuántos hablantes intervienen y cuándo, útil para filtrar o clasificar contenido antes de un análisis más profundo.

## Benchmarks y rendimiento

DER (Diarization Error Rate) sobre el conjunto completo AMI IHM test (16 reuniones), con RTTM de alineación forzada y post-procesado dihard3-dev, collar 0.0, solapamiento puntuado, en el punto de operación `very_high_latency`:

| Cuantizacion | Tamano | DER (AMI IHM test) |
|---|---:|---:|
| F32 | 471 MB | 14,59 % |
| F16 | 237 MB | 14,23 % |
| Q8_0 | 139 MB | 14,73 % |
| Referencia NeMo | no disponible | 14,83 % |

La referencia NeMo medida bajo el mismo protocolo obtiene 14,83 % DER y 19,89 % JER; el port en C++ F32 puntúa 14,59 % DER y 19,51 % JER. Las cifras publicadas de DER varían según la fuente de RTTM y el post-procesado, por lo que deben compararse con protocolos idénticos.

Rendimiento (RTF, Real-Time Factor, sobre hardware M4):

| Dispositivo | RTF |
|---|---:|
| CPU | 76,34 |
| Metal | 141,79 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (471 MB en F32, 237 MB en F16, 139 MB en Q8_0), sin contar overhead del runtime.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 1 GB de memoria libre es suficiente. El modelo se ha validado en hardware Apple M4 con backend Metal.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.) e incluso en iGPU y CPU.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli` y API C). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: RTF de 76,34 en CPU y 141,79 en Metal sobre M4; el punto de operación `very_high_latency` prioriza precisión sobre latencia. No se proporcionan cifras de latencia absoluta en milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DER (AMI IHM) | Licencia | Formato |
|---|---|---|---|---|---|
| diar_streaming_sortformer_4spk-v2.1 (GGUF, este) | 117,7 M | streaming | 14,59 % (F32) | NVIDIA Open Model License | GGUF |
| Referencia NeMo (mismo modelo, framework Python) | 117,7 M | streaming | 14,83 % | NVIDIA Open Model License | NeMo |
| Otros diarizadores end-to-end | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos alternativos comparables (por ejemplo, pyannote o diarizadores basados en clustering) con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo solo admite inglés según los metadatos; no se garantiza un rendimiento adecuado en otros idiomas.
- No transcribe audio: la salida de texto está vacía por diseño; requiere un ASR separado para obtener transcripciones.
- Límite de 4 hablantes simultáneos; conversaciones con más participantes no se modelan correctamente.
- Entrada restringida a WAV mono a 16 kHz; es necesario convertir el audio previamente con herramientas como ffmpeg.
- Riesgo de confusión entre hablantes con voces similares o en condiciones de solapamiento intenso; el DER de referencia en AMI IHM es de aproximadamente 14-15 %, lo que implica errores no despreciables en producción.
- Las cifras de DER dependen fuertemente de la fuente de RTTM y del post-procesado; comparar siempre con protocolos idénticos.
- La licencia es la NVIDIA Open Model License, no una licencia permisiva estándar; es necesario revisar los términos completos del modelo base para uso comercial.
- Solo se distribuyen las cuantizaciones cercanas a la referencia (F32, F16, Q8_0); las k-quants fueron retiradas por política de cuantización de la familia.
- El repositorio tiene un tamaño de 0,1 GB y un número de descargas muy bajo (31 en el momento de la consulta), lo que sugiere poca validación comunitaria independiente.
- La fecha de creación indicada (2026-10-28) es posterior a la fecha actual, lo que puede indicar un error en los metadatos del repositorio.

## Enlaces

- [Hugging Face: lipik/diar_streaming_sortformer_4spk-v2.1-gguf](https://huggingface.co/lipik/diar_streaming_sortformer_4spk-v2.1-gguf)
- [Modelo base: nvidia/diar_streaming_sortformer_4spk-v2.1](https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Documentación del modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/diar_streaming_sortformer_4spk-v2.1.md)
- [Commit de validación transcribe.cpp d42c3bb](https://github.com/handy-computer/transcribe.cpp/tree/d42c3bb)
- [Paper Sortformer (arXiv:2409.06656)](https://arxiv.org/abs/2409.06656)
- [Paper Streaming Sortformer (arXiv:2507.18446)](https://arxiv.org/abs/2507.18446)
- [NeMo Voice Agent](https://github.com/NVIDIA-NeMo/NeMo/tree/main/examples/voice_agent)
