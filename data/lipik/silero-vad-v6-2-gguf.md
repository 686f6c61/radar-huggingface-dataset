# lipik/silero-vad-v6.2-gguf

## Resumen

Silero VAD v6.2 en formato GGUF es una conversión del detector de actividad de voz (VAD) de referencia del equipo Silero, empaquetada para su uso con el motor de inferencia transcribe.cpp. No es un modelo de transcripción ni un LLM: es un clasificador de audio binario por trama que estima la probabilidad de que un fragmento de audio contenga habla, con un total de 309.633 parámetros y un peso de aproximadamente 1 MB en cuantización F32. Su relevancia radica en que permite segmentar audio de forma fiable y con un coste computacional mínimo antes de pasarlo a un sistema de reconocimiento de voz, lo que reduce drásticamente el tiempo de proceso y el consumo de recursos en pipelines ASR.

La ficha corresponde a la copia publicada por el usuario lipik del repositorio original handy-computer/silero-vad-v6.2-gguf, mantenida para descarga desde su propia infraestructura. El modelo hereda la licencia MIT del proyecto original y está validado contra la referencia TorchScript de silero-vad 6.2.3 en CPU con precisión F32. El soporte es tanto offline (segmentación de audio completa) como en streaming (probabilidades por trama en tiempo real), lo que lo hace adecuado para aplicaciones de voz interactivas y para el preprocesado por lotes.

Al tratarse de un modelo de 309.633 parámetros, su huella es negligible frente a cualquier modelo de reconocimiento de voz o de lenguaje, y puede ejecutarse íntegramente en CPU con un rendimiento muy superior al tiempo real. La integración con transcribe.cpp lo sitúa en el ecosistema de herramientas C/C++ para transcripción local, junto con los formatos ggml-silero-v5.1.2.bin y v6.2.0.bin que el mismo motor también carga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de clasificación de audio por trama; la model card no detalla la topología interna) |
| Parámetros totales | 309.633 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa audio por tramas; el motor gestiona el streaming) |
| Tipos de cuantización | F32 (única cuantización publicada) |
| Idiomas soportados | No disponible (la detección de voz es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Tamaño del repositorio | 0,0 GB (peso F32 de aproximadamente 1 MB) |
| Versión upstream | silero-vad 6.2, commit 5cd7945 (fijado el 2026-10-09) |
| Librería de inferencia | transcribe.cpp |
| Pipeline | audio-classification |
| RTF en M4 (CPU) | 1630,87 |
| Streaming | Sí |
| Timestamps | Ninguno |
| Detección de idioma | No |
| Traducción | No |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo más allá de su función: producir probabilidades de habla por trama, con modos offline (segmentos de habla) y streaming (probabilidades en vivo). El dato disponible es el número de parámetros (309.633) y el hecho de que la conversión se validó contra la implementación de referencia silero-vad 6.2.3 en TorchScript, CPU y precisión F32, en el commit 2674b95d de transcribe.cpp el 2026-10-10. No se especifican detalles sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo ajuste fino con RLHF o DPO.

La innovación relevante de esta ficha no está en el modelo en sí, sino en el empaquetado: la conversión a GGUF permite cargar el VAD en transcribe.cpp mediante el rol VAD de su API C (`include/transcribe/vad.h`), con dos puntos de entrada: `transcribe_vad_run` para segmentos offline y `transcribe_vad_stream_feed` para probabilidades por trama en streaming. El motor también acepta los binarios ggml-silero-v5.1.2.bin y v6.2.0.bin de whisper.cpp. El backend por defecto es CPU, elegido por fidelidad a la referencia.

## Capacidades

- Detección de actividad de voz: genera probabilidades de habla por trama sobre audio mono al sample rate del modelo.
- Segmentación offline: produce segmentos de habla delimitados sobre un fichero de audio completo mediante `transcribe_vad_run`.
- Streaming en tiempo real: alimenta probabilidades por trama con `transcribe_vad_stream_feed` para aplicaciones interactivas.
- Independencia de idioma: al ser un detector acústico de voz, no depende del idioma del hablante (aunque la model card no lo declara explícitamente).
- Integración en pipelines ASR: actúa como etapa de preprocesado para recortar silencios antes de la transcripción.
- No realiza transcripción, traducción, detección de idioma ni generación de timestamps.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un LLM).

## Casos de uso

- Preprocesado de pipelines ASR: eliminar silencios y ruido no vocal antes de pasar el audio a un modelo de reconocimiento de voz, reduciendo el tiempo de inferencia del ASR proporcionalmente a la fracción de audio no hablado.
- Atención al cliente con voz: detectar cuándo el usuario habla y cuándo calla en una conversación telefónica o VoIP, para activar la captura de audio solo en los turnos de habla y ahorrar ancho de banda y cómputo.
- Transcripción por lotes de reuniones y podcasts: segmentar grabaciones largas en fragmentos de habla antes de transcribirlos, lo que facilita el troceado y mejora la precisión en modelos con ventanas de contexto limitadas.
- Asistentes de voz embebidos: ejecutar el VAD en CPU con un coste mínimo (RTF de 1630,87 en M4) para activar la escucha solo cuando hay habla, reduciendo el consumo energético en dispositivos con batería.
- Moderación y análisis de audio: filtrar automáticamente fragmentos sin habla en grandes volúmenes de audio para centrar el análisis posterior en los tramos relevantes.
- Subtitulado en directo: usar el modo streaming para detectar los límites de los turnos de habla y alinear la generación de subtítulos con la actividad vocal real.
- Sistemas de diarización: como etapa previa que separa regiones con voz de regiones de silencio antes de aplicar un modelo de segmentación por hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es el RTF (real-time factor) medido en CPU sobre un Apple M4: 1630,87, lo que indica que el modelo procesa audio más de mil seiscientas veces más rápido que el tiempo real en ese hardware.

| Métrica | Valor | Plataforma |
|---|---|---|
| RTF (real-time factor) | 1630,87 | CPU, Apple M4 |

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el peso F32 ocupa aproximadamente 1 MB y el modelo está pensado para ejecutarse en CPU.
- GPU recomendadas: no aplica; el backend por defecto es CPU por fidelidad a la referencia.
- ¿Cabe en GPU de consumo? Sí, con un consumo de memoria despreciable, aunque no es el caso de uso previsto.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y API C con el rol VAD), además de los binarios ggml-silero-v5.1.2.bin y v6.2.0.bin que el mismo motor también carga.
- Latencia y throughput: RTF de 1630,87 en CPU Apple M4, es decir, procesa audio muy por encima del tiempo real. No se dispone de datos de latencia por trama en streaming.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| silero-vad-v6.2-gguf (este) | 309.633 | GGUF | MIT | No aplica | Conversión para transcribe.cpp; RTF 1630,87 en M4 |
| silero-vad 6.2.3 (referencia) | No disponible | TorchScript | MIT | No aplica | Implementación de referencia en CPU, F32 |
| ggml-silero-v5.1.2.bin | No disponible | Binario ggml | MIT (heredada) | No aplica | Variante cargable por whisper.cpp y transcribe.cpp |
| ggml-silero-v6.2.0.bin | No disponible | Binario ggml | MIT (heredada) | No aplica | Variante cargable por whisper.cpp y transcribe.cpp |

## Limitaciones y advertencias

- No es un modelo de transcripción: solo detecta actividad de voz; no transcribe, traduce ni genera timestamps.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser un detector acústico, puede comportarse de forma distinta con ruido de fondo, música o habla superpuesta.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede haber falsos positivos y falsos negativos en la detección de habla.
- Limitaciones de contexto o idioma: la model card no declara idiomas soportados ni restricciones de longitud de audio; el modo streaming está pensado para tramas.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución; se hereda del modelo base y se mantiene sin cambios en esta copia.
- Caveats para producción: el audio debe ser mono y estar al sample rate del modelo; la única cuantización publicada es F32; el modelo se distribuye como copia de un repositorio ajeno, por lo que conviene verificar la revisión upstream antes de desplegar.
- Repositorio con muy pocas descargas (13) y sin likes, lo que sugiere poca validación comunitaria de esta copia concreta.

## Enlaces

- Hugging Face (esta copia): https://huggingface.co/lipik/silero-vad-v6.2-gguf
- Repositorio original en Hugging Face: https://huggingface.co/handy-computer/silero-vad-v6.2-gguf
- Proyecto Silero VAD (upstream): https://github.com/snakers4/silero-vad
- Commit upstream fijado: https://github.com/snakers4/silero-vad/commit/5cd7945
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/silero-vad-v6.2.md
- Documentación de uso del VAD: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/vad.md
- Revisión de transcribe.cpp usada para la validación: https://github.com/handy-computer/transcribe.cpp/tree/2674b95d
- Peso F32: https://huggingface.co/handy-computer/silero-vad-v6.2-gguf/resolve/main/silero-vad-v6.2-F32.gguf
- Sitio del autor de la copia: https://lipik.refflux.dev
