# ndaly/Voxtral-Mini-4B-Realtime-2602

## Resumen

Voxtral-Mini-4B-Realtime-2602 es un modelo de reconocimiento automático del habla (ASR) desarrollado por Mistral AI, empaquetado y publicado por el usuario ndaly para su ejecución sobre hardware Tenstorrent p300x2. El modelo combina un codificador de audio causal de 970 millones de parámetros con un decodificador de texto Ministral de 3,4 mil millones de parámetros, sumando aproximadamente 4,4 mil millones de parámetros totales. Su rasgo diferencial es la naturaleza en tiempo real: emite un token de texto por cada 80 milisegundos de audio procesado.

Este repositorio no contiene una modificación de los pesos, sino un paquete de despliegue que permite servir el modelo original de Mistral AI mediante vLLM sobre aceleradores Tenstorrent, exponiendo un endpoint compatible con la API de transcripciones de OpenAI. Cubre 13 idiomas y está pensado para transcripción de voz mono con latencias bajas, con una ventana de contexto de 131.072 tokens y soporte de hasta 32 secuencias concurrentes.

Su relevancia actual radica en que demuestra la viabilidad de ejecutar modelos ASR de última generación en hardware alternativo a las GPU de NVIDIA, con métricas de rendimiento medidas y reproducibles, y con una licencia permisiva Apache-2.0 que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio causal (970M) + decodificador de texto Ministral (3,4B) |
| Parametros totales | Aproximadamente 4,4B (970M codificador + 3,4B decodificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | bfp4 con proyecciones internas LoFi, bfp8 en LM head y caché KV (en este paquete); pesos originales en bf16 |
| Idiomas soportados | 13 idiomas (no se detalla la lista completa) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (descargados desde mistralai/Voxtral-Mini-4B-Realtime-2602, commit 2769294da9567371363522aac9bbcfdd19447add) |

## Arquitectura y entrenamiento

La arquitectura es un sistema encoder-decoder específico para voz. El codificador de audio es causal, con 970 millones de parámetros, y procesa la señal de audio a una tasa de un token de texto cada 80 ms, lo que habilita la transcripción en streaming con baja latencia. El decodificador de texto es un Ministral de 3,4 mil millones de parámetros que genera la transcripción a partir de las representaciones del codificador. El audio se remuestrea a 16 kHz y se aceptan formatos decodificables por soundfile (wav, flac, mp3 y otros).

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El paquete de ndaly no modifica los pesos originales: se limita al port y al código de servicio, e indica que la model card original de Mistral AI contiene los detalles de entrenamiento y evaluación. La innovación técnica destacable es la decodificación en tiempo real (un token por 80 ms de audio) y la integración con vLLM como plugin para hardware Tenstorrent, con decodificación greedy por defecto y soporte de streaming mediante server-sent events.

## Capacidades

- Transcripción de voz a texto en 13 idiomas, con salida en streaming token a token.
- Endpoint compatible con la API de OpenAI: `POST /v1/audio/transcriptions` en formato multipart.
- Soporte de streaming mediante `stream=true`, con deltas de texto a medida que se decodifican.
- Compatibilidad con cualquier cliente OpenAI (`client.audio.transcriptions.create`).
- Decodificación greedy por defecto; la decodificación muestreada está soportada pero no evaluada en precisión.
- Procesamiento de audio mono remuestreado a 16 kHz en formatos wav, flac, mp3 y otros decodificables por soundfile.
- Atención a hasta 32 peticiones concurrentes en el hardware validado.
- No soporta chat, completado de texto, traducción, diarización de hablantes ni respuesta a preguntas sobre audio; `/v1/chat/completions` no está montado.

## Casos de uso

- Subtitulado en directo de reuniones y videoconferencias: el modelo emite un token cada 80 ms de audio, lo que permite generar subtítulos con retardo mínimo en 13 idiomas, integrándolo en la infraestructura mediante el endpoint compatible con OpenAI.
- Transcripción de llamadas de atención al cliente: con hasta 32 peticiones concurrentes y una latencia media de extremo a extremo de 3,63 s a esa concurrencia, puede procesar lotes de grabaciones o llamadas en curso para generar actas y análisis posteriores.
- Dictado por voz en aplicaciones de productividad: la API de transcripciones permite integrar el dictado en editores de texto o herramientas internas sin cambiar el código de cliente si ya se usa el SDK de OpenAI.
- Generación de actas y resúmenes de audio corporativo: transcripción de grabaciones de hasta 35 s validadas (y audio más largo por la misma ruta de streaming, aunque sin medir), como base para pipelines de resumen con un LLM posterior.
- Accesibilidad y transcripción de contenido multimedia: conversión de podcasts, clases y vídeos a texto en los 13 idiomas soportados, aprovechando el contexto de 131.072 tokens del servidor para gestionar sesiones largas.
- Despliegue en infraestructura Tenstorrent: organizaciones que ya operan aceleradores p300x2 pueden servir ASR de última generación sin depender de GPU NVIDIA, usando `tt serve ndaly/Voxtral-Mini-4B-Realtime-2602`.
- Evaluación comparativa de hardware: el paquete incluye métricas reproducibles (WER, TTFT, throughput) que permiten comparar el rendimiento de Tenstorrent frente a otras plataformas en cargas ASR.

## Benchmarks y rendimiento

| Evaluación | Este paquete | Referencia | Muestras |
|---|---|---|---|
| LibriSpeech test-other, WER (greedy) | 5,64 % | No disponible | 2.939 enunciados |
| Transcripción idéntica a la referencia de Hugging Face | 8 de 10 clips | — | 10 clips |
| Acuerdo top-1 de token con la referencia bf16 | 99,5 % | — | 200 posiciones (199 de 200) |
| Fleurs, WER medio a 480 ms de retardo | No ejecutado aquí | 8,72 % (model card original) | No disponible |
| Inglés, WER a 480 ms de retardo | No ejecutado aquí | 4,90 % (model card original) | No disponible |

| Perfil | ISL | OSL | Concurrencia | TTFT (ms) | Decode tok/s/u | E2EL (s) |
|---|---|---|---|---|---|---|
| default | 5,28 s de audio | 78 | 1 | 37,5 | 49,7 | 1,59 |
| default | — | — | 32 | — | 18,9 (606 agregado) | 3,63 (mediana) |

Las mediciones se realizaron en p300x2 a través del endpoint servido el 2026-09-23, con decodificación greedy y streaming. El decode es de 20,14 ms por paso para un usuario, y las 32 peticiones concurrentes se completaron en su totalidad. El WER se puntuó con lmms-eval a través del endpoint servido.

## Requisitos de hardware

- Hardware validado: Tenstorrent p300x2 (malla P300x2), como una réplica tensor-parallel sobre cuatro chips; sin paralelismo de datos y sin otras placas validadas.
- Espacio en caché de Hugging Face: aproximadamente 9 GB para los pesos.
- Requisito de host: 1 GB de hugepages configurado.
- Software: CLI de Tenstorrent (`uv tool install tenstorrent`) y Docker.
- Despliegue: `tt serve ndaly/Voxtral-Mini-4B-Realtime-2602` o `tt-model serve`; servidor compatible con OpenAI en el puerto 20000 (o el siguiente libre).
- Arranque: la primera ejecución compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- VRAM estimada para GPU: no disponible (el paquete está orientado a Tenstorrent).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue alternativas (vLLM estándar, llama.cpp, Ollama, TGI): no disponibles en la información proporcionada.
- Latencia y throughput: TTFT de 37,5 ms y 49,7 tok/s por usuario con concurrencia 1; 18,9 tok/s por usuario y 606 tok/s agregados con 32 peticiones concurrentes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, el propio modelo base `mistralai/Voxtral-Mini-4B-Realtime-2602` es la alternativa directa en GPU convencionales, con pesos en bf16 y sin las limitaciones de precisión reducida de este paquete; sin embargo, no se han proporcionado cifras comparativas de rendimiento entre ambas implementaciones más allá del acuerdo top-1 del 99,5 % y las 8 de 10 transcripciones idénticas.

| Modelo | Parámetros | Contexto | Licencia | Hardware |
|---|---|---|---|---|
| Voxtral-Mini-4B-Realtime-2602 (este paquete) | ~4,4B | 131.072 tokens | Apache-2.0 | Tenstorrent p300x2 |
| mistralai/Voxtral-Mini-4B-Realtime-2602 (original) | ~4,4B | No disponible | Apache-2.0 | GPU (bf16) |
| Otros modelos ASR comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo transcripción: no admite chat, completado de texto, traducción, diarización de hablantes ni respuesta a preguntas sobre audio; `/v1/chat/completions` no está montado.
- Validado exclusivamente en p300x2 como una réplica tensor-parallel sobre cuatro chips; no hay paralelismo de datos ni validación en otras placas.
- Máximo de 32 peticiones concurrentes; las pruebas se hicieron con enunciados de hasta unos 35 s, y el audio más largo no se midió.
- Los pesos se ejecutan en precisión reducida (bfp4 con proyecciones internas LoFi, bfp8 en LM head y caché KV), no en bf16: en LibriSpeech test-other esto provoca la pérdida del inicio de una palabra en 1 de 2.939 enunciados y, en concurrencia, una transcripción vacía en 1 de 2.939.
- La decodificación muestreada está soportada pero no evaluada en precisión; se recomienda el modo greedy por defecto.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; al ser un modelo ASR, los errores se manifiestan como sustituciones, omisiones o inserciones de palabras.
- La lista completa de los 13 idiomas soportados no se detalla en la información disponible.
- Licencia Apache-2.0 tanto para los pesos (Mistral AI) como para el código de port y servicio, lo que permite uso comercial sin restricciones adicionales documentadas.
- El servidor responde únicamente a peticiones de transcripción; una petición de chat completion devuelve 404.

## Enlaces

- Repositorio del paquete: https://huggingface.co/ndaly/Voxtral-Mini-4B-Realtime-2602
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Commit de pesos referenciado: 2769294da9567371363522aac9bbcfdd19447add
- Herramienta de empaquetado tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- CLI de Tenstorrent y prerrequisitos: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Discusiones y soporte del paquete: https://huggingface.co/ndaly/Voxtral-Mini-4B-Realtime-2602/discussions
- Contacto de producto Tenstorrent: support@tenstorrent.com
