# christopherthompson81/VibeVoice-ASR-Streaming-1.5B-GGUF

## Resumen

VibeVoice-ASR-Streaming-1.5B-GGUF es una conversión a formato GGUF del modelo de reconocimiento automático de voz microsoft/VibeVoice-ASR-Streaming-1.5B, publicada por el usuario christopherthompson81 y orientada específicamente al runtime audio.cpp. Se trata de un modelo de ASR de aproximadamente 1.500 millones de parámetros, diseñado para transcripción tanto offline como en streaming continuo, con soporte para transcripción con atribución de hablante (speaker-attributed transcription) y cobertura de diez idiomas: inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso e italiano.

El interés principal de esta publicación no está en el modelo base, sino en el empaquetado: los tres ficheros GGUF (BF16, Q8_0 y Q4_K) son autocontenidos, embeben la especificación de paquete de audio.cpp y los sidecars necesarios, y se cargan con el mismo loader que la variante de 7B sin cambios de código, ya que el número de capas, el tamaño oculto y el número de cabezas se leen del config.json del checkpoint y los nombres de tensor son idénticos. Esto permite desplegar ASR en streaming con un binario CLI o un servidor HTTP que acepta PCM s16le mono a 16 kHz por chunked transfer.

Es relevante ahora porque reduce el coste de despliegue de ASR con atribución de hablante a ficheros de entre 2,12 GB (Q4_K) y 5,64 GB (BF16), ejecutables tanto en CPU como en CUDA, y porque la licencia MIT del modelo original se preserva en la conversión, lo que facilita su integración en productos comerciales. La contrapartida es que la validación publicada es muy limitada: solo cuatro clips de LibriSpeech, 69 palabras en total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de ASR de la familia VibeVoice; el loader de audio.cpp toma numero de capas, tamano oculto y cabezas del config.json del checkpoint) |
| Parametros totales | 1,5 mil millones (aproximado, segun el nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K |
| Idiomas soportados | en, zh, es, pt, de, ja, ko, fr, ru, it |
| Licencia | MIT |
| Formato de pesos | GGUF (un fichero autocontenido por cuantizacion) |
| Tarea (pipeline) | automatic-speech-recognition |
| Modos de ejecucion | offline y streaming |
| Runtime objetivo | audio.cpp (backend CUDA o CPU) |
| Revision upstream fijada | 4262d23d8a539a6530cf64fbd0b1751ef9a30853 |
| Tamano del repositorio | 22,2 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: no se especifica si el codificador de audio es un transformer convolucional, un encoder tipo Whisper u otra variante, ni como se acopla al decodificador. Lo unico documentado es que la variante de 1,5B comparte la topologia de carga con la de 7B en audio.cpp, leyendo los parametros estructurales desde el config.json del checkpoint y empleando exactamente los mismos nombres de tensor, lo que implica que ambas variantes pertenecen a la misma familia arquitectonica con distinto escalado.

Tampoco hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. La model card del repositorio GGUF es puramente operativa: describe la instalacion, los comandos de ejecucion y la validacion de WER, y delega cualquier detalle de entrenamiento a la model card original de Microsoft, que no forma parte de la informacion proporcionada.

En el plano del empaquetado, la aportacion tecnica verificable es la conversion a GGUF nativo de audio.cpp: cada fichero embebe la especificacion de paquete y los sidecars requeridos, y el sistema soporta decodificacion greedy con metricas y log opcionales mediante los flags `--metrics` y `--log` del CLI.

## Capacidades

- Reconocimiento automatico de voz offline sobre ficheros de audio, con salida a fichero de texto mediante `--text-out`.
- ASR en streaming: el servidor de audio.cpp expone un endpoint en vivo que acepta flujo PCM de 16 kHz, mono, entero con signo de 16 bits, enviado con transferencia chunked.
- Transcripcion con atribucion de hablante (etiqueta declarada por el autor: speaker-attributed-transcription), es decir, separacion e identificacion de interlocutores en la transcripcion.
- Cobertura multilingue de diez idiomas: ingles, chino, espanol, portugues, aleman, japones, coreano, frances, ruso e italiano.
- Despliegue como servidor HTTP con multiples modelos cargados simultaneamente mediante fichero de configuracion JSON, con identificacion por `id`, `family`, `path`, `task` y `mode`.
- Ejecucion en backend CUDA o CPU con seleccion de numero de hilos.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, traduccion, diarizacion mas alla de la atribucion de hablante declarada, ni modo de pensamiento explicito.

## Casos de uso

- Transcripcion por lotes de archivos de audio largos: el CLI de audio.cpp procesa un fichero de entrada y vuelca el resultado a `transcript.txt`; con la cuantizacion Q4_K en 2,12 GB es viable ejecutar la transcripcion completa en CPU sin GPU dedicada, lo que abarata el procesado de grandes volumenes de grabaciones archivadas.
- Subtitulado en directo de reuniones y webinars: el endpoint `/v1/audio/transcriptions/live` acepta PCM de 16 kHz por streaming, de modo que una herramienta de captura de audio puede canalizar el flujo de un sistema de videoconferencia y obtener transcripcion incremental con atribucion de hablante para identificar quien habla en cada turno.
- Analisis de llamadas de atencion al cliente: la separacion por hablante permite distinguir agente y cliente en cada transcripcion, lo que habilita la extraccion posterior de metricas de calidad, deteccion de motivos de contacto y supervision de cumplimiento sobre conversaciones grabadas.
- Generacion de actas y resumenes de reuniones: al transcribir con identificacion de interlocutor, el texto resultante se puede segmentar por participante y alimentar un pipeline de resumen o de busqueda sobre actas sin necesidad de post-procesar una transcripcion plana sin estructura.
- Accesibilidad en tiempo real: el modo streaming permite alimentar sistemas de subtitulado en vivo para personas con discapacidad auditiva en entornos presenciales o retransmisiones, con latencia dependiente del chunking de audio que decida el cliente.
- Indexacion y busqueda semantica sobre archivos de audio: transcripcion masiva de un catalogo de podcasts o grabaciones internas en cualquiera de los diez idiomas soportados, seguida de indexacion del texto para busqueda posterior.
- Procesamiento multilingue en un unico pipeline: al cubrir en, zh, es, pt, de, ja, ko, fr, ru e it, un mismo despliegue de audio.cpp puede atender contenido en diez idiomas sin cambiar de modelo ni mantener varios servicios.
- Despliegue en servidor con varios modelos: el fichero de configuracion JSON permite registrar la variante de 1,5B con `mode: streaming` junto a otros modelos, de modo que una organizacion puede ofrecer transcripcion en tiempo real y por lotes desde un unico proceso.

## Benchmarks y rendimiento

Los unicos datos publicados son las tasas de error de palabra (WER) medidas sobre los cuatro clips de LibriSpeech incluidos en `assets/asr_validation/librispeech/`, con decodificacion greedy. El propio autor advierte que cuatro clips equivalen a 69 palabras, por lo que la medicion solo distingue entre "funciona y esta en la clase correcta" y "esta roto", sin resolucion mas fina.

| Paquete | Tamano | WER (CUDA) | WER (CPU) |
|---|---:|---:|---:|
| vibevoice-asr-streaming-7b-q4_k.gguf | 5,86 GB | 4,35% | 4,35% |
| vibevoice-asr-streaming-1.5b-bf16.gguf | 5,64 GB | 4,35% | 4,35% |
| vibevoice-asr-streaming-1.5b-q8_0.gguf | 3,34 GB | 5,80% | 4,35% |
| vibevoice-asr-streaming-1.5b-q4_k.gguf | 2,12 GB | 7,25% | 5,80% |

Consideraciones sobre esta tabla, segun el propio autor:

- La comparacion homogenea es entre las dos filas Q4_K, donde la variante de 7B obtiene mejor WER que la de 1,5B.
- El empate entre 7B Q4_K y 1,5B BF16 no debe interpretarse como paridad: son clips distintos que casualmente suman el mismo total.
- El WER de un paquete cuantizado solo es interpretable junto a su backend, porque CPU y CUDA cuantizan las activaciones de forma distinta en ggml. Por eso las filas cuantizadas difieren entre backends, mientras que BF16, que no cuantiza activaciones, coincide exactamente.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes de ASR sobre otros corpus) en la informacion disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano de fichero mas el margen de activaciones y buffers del runtime):
  - Q4_K: aproximadamente 2,12 GB de pesos; margen recomendado de 0,5 a 1 GB adicional.
  - Q8_0: aproximadamente 3,34 GB de pesos; margen recomendado de 0,5 a 1 GB adicional.
  - BF16: aproximadamente 5,64 GB de pesos; margen recomendado de 1 a 1,5 GB adicional.
- Espacio en disco: el repositorio completo ocupa 22,2 GB, aunque para un unico paquete basta con el fichero correspondiente (2,12 GB, 3,34 GB o 5,64 GB).
- GPU recomendadas: no disponibles, la model card no publica requisitos minimos. El unico backend de aceleracion documentado es CUDA; no se mencionan ROCm, Metal ni Vulkan.
- Cabe en GPU de consumo: con Q4_K (2,12 GB) y Q8_0 (3,34 GB) el modelo es desplegable en tarjetas de gama media y alta con 6-8 GB de VRAM o mas; el paquete BF16 (5,64 GB) requiere al menos 8 GB y es mas comodo en 12 GB o mas. No se especifica ninguna GPU concreta en la documentacion.
- Ejecucion en CPU: soportada explicitamente, con seleccion de numero de hilos mediante `--threads`. Los paquetes Q4_K y Q8_0 estan pensados para este escenario.
- Opciones de despliegue: audio.cpp en sus dos modos documentados, CLI (`audiocpp_cli`) y servidor (`audiocpp_server`); instalacion mediante el gestor de modelos de audio.cpp (`tools/model_manager_v2.py install vibevoice_asr_streaming_1_5b_q8_0`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros runtimes, y dado que el modelo requiere el loader especifico de la familia `vibevoice_asr_streaming` y sidecars propios, no debe asumirse que funcionara en otros motores.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni metricas de rendimiento en tiempo real, aunque el CLI permite activar metricas con `--metrics`.
- Entrada de audio para streaming: 16 kHz, mono, PCM entero con signo de 16 bits (`s16le`).

## Comparativa con modelos similares

La informacion disponible solo permite comparar con la propia variante de 7B de la misma familia, empaquetada en este mismo repositorio y ejecutada con el mismo loader.

| Modelo | Parametros | Contexto | WER Q4_K (CUDA) | Licencia | Formato |
|---|---|---|---|---|---|
| VibeVoice-ASR-Streaming-1.5B GGUF (este) | 1,5B | no disponible | 7,25% | MIT | GGUF |
| VibeVoice-ASR-Streaming-7B GGUF (misma familia) | 7B | no disponible | 4,35% | MIT (upstream) | GGUF |

No se dispone de datos publicados en esta informacion para comparar con alternativas externas de ASR (por ejemplo Whisper, Parakeet o Canary) en parametros, contexto, WER o rendimiento: no disponible. La busqueda web realizada no aporto ninguna referencia util sobre el modelo ni sobre modelos comparables.

## Limitaciones y advertencias

- La validacion es estadisticamente irrelevante: cuatro clips de LibriSpeech y 69 palabras. No hay evidencia publicada sobre audio espontaneo, ruidoso, con solapamiento de hablantes, acentos diversos, audio telefonico ni audio de larga duracion.
- El WER de los paquetes cuantizados depende del backend: CPU y CUDA cuantizan activaciones de forma distinta en ggml, por lo que los numeros no son intercambiables entre entornos. Solo BF16 coincide entre backends.
- El paquete Q4_K es el que peor WER presenta (7,25% en CUDA) y el autor no lo recomienda como opcion por defecto; el paquete recomendado para audio.cpp es Q8_0. Q8_0 tambien empeora en CUDA (5,80%) frente a CPU (4,35%), lo que sugiere que para maxima precision conviene evaluar BF16.
- Riesgo de alucinacion: no se documenta ningun estudio al respecto. Como en cualquier modelo de ASR, existe riesgo de inserciones, omisiones y sustituciones de palabras, especialmente en audio con ruido o silencios largos. No se debe asumir fidelidad literal sin verificacion en contextos sensibles.
- Atribucion de hablante: la etiqueta esta declarada, pero no se publican metricas de precision de diarizacion, ni limites de numero de hablantes simultaneos, ni comportamiento ante voces solapadas.
- Idiomas: se declaran diez idiomas, pero no hay ninguna evaluacion publicada por idioma. Es previsible un rendimiento dispar y no verificado fuera del ingles.
- Dependencia del runtime: el modelo esta construido para audio.cpp y usa nombres de tensor y sidecars especificos. La compatibilidad con otros motores GGUF no esta documentada ni garantizada.
- Restricciones de licencia: la conversion preserva la licencia MIT del modelo original, lo que permite uso comercial, pero la model card remite a la documentacion de Microsoft VibeVoice y a sus guias de uso responsable, que no se incluyen en la informacion disponible y conviene revisar antes de un despliegue en produccion.
- Reproductibilidad de la conversion: se fija la revision upstream `4262d23d8a539a6530cf64fbd0b1751ef9a30853`, lo que permite reconstruir los GGUF a partir de un commit concreto, pero el repositorio de conversion no aclara si se publicaran actualizaciones al cambiar el modelo upstream.
- El modelo no esta pensado para tareas generativas de texto, codigo, matematicas o razonamiento; intentar usarlo fuera de ASR no tiene sentido tecnico.
- Adopcion practicamente nula en el momento de la consulta: cero descargas y cero me gusta, sin comunidad que haya reportado problemas de integracion.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/christopherthompson81/VibeVoice-ASR-Streaming-1.5B-GGUF
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-1.5B
- Repositorio de Microsoft VibeVoice: mencionado en la model card sin URL concreta (no disponible)
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
- Resultados de la busqueda web: no relevantes (los resultados devueltos corresponden a marcadores deportivos de la NBA y no guardan relacion con el modelo)
