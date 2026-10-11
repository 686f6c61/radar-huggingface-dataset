# myflow-ai/nemotron-speech-streaming-en-0.6b-gguf

## Resumen

Nemotron-speech-streaming-en-0.6b-gguf es una conversion a formato GGUF del modelo de reconocimiento automatico del habla (ASR) nvidia/nemotron-speech-streaming-en-0.6b, publicada por el usuario myflow-ai para su uso con el runtime transcribe.cpp. El modelo original lo desarrolla NVIDIA y esta disenado para transcripcion de ingles con puntuacion y capitalizacion nativas, con una arquitectura Cache-Aware FastConformer (encoder) mas un decodificador RNN-T (transducer) de 618.079.745 parametros (aproximadamente 0,6B).

El interes de esta ficha concreta esta en el empaquetado: se ofrecen seis niveles de cuantizacion (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que comprimen el modelo desde 2,30 GB hasta 453 MB con una degradacion de WER muy contenida en LibriSpeech test-clean (2,31 % en F32 frente a 2,38 % en Q4_K_M). Esto lo hace util para inferencia local en hardware modesto, incluido CPU, sin necesidad de GPU dedicada.

La relevancia actual viene de que el modelo base esta pensado para streaming de baja latencia con tamanos de chunk configurables (80, 160, 560 y 1120 ms), pero esta conversion GGUF se ejecuta unicamente en modo offline porque transcribe.cpp todavia no expone una API de sesion en streaming. Es, por tanto, una opcion orientada a transcripcion por lotes y de alto rendimiento mas que a dictado en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNN-T transducer (decoder) |
| Parametros totales | 618.079.745 (aproximadamente 0,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No es contexto de tokens: mascara de atencion cache-aware con att_context_size=[70, 13], equivalente a 1,12 s de ventana |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | nvidia-open-model-license (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF |
| Tarea | Automatic-speech-recognition (ASR) |
| Entrada de audio | WAV mono a 16 kHz (se requiere conversion previa con ffmpeg para otras fuentes) |
| Puntuacion y mayusculas | Si, nativas |
| Timestamps | A nivel de token |
| Traduccion | No soportada |
| Deteccion de idioma | No soportada |
| Runtime soportado | transcribe.cpp (libreria declarada: transcribe.cpp) |
| Tamano del repo | 0,7 GB segun la API de HuggingFace (los ficheros individuales publicados suman mas) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Cache-Aware FastConformer-RNNT. El encoder es un FastConformer con mascara de atencion cache-aware que preserva integramente el att_context_size=[70, 13] del modelo original de NVIDIA, lo que equivale a una ventana de 1,12 s. El decodificador es un transducer RNN-T que genera la transcripcion con puntuacion y capitalizacion de forma nativa, decodificada en modo greedy en las mediciones publicadas. El modelo base admite tamanos de chunk configurables de 80 ms, 160 ms, 560 ms y 1120 ms para escenarios de streaming, aunque la conversion GGUF funciona en modo offline.

La conversion fue realizada a partir del commit upstream ef3bf40, fijado el 2026-05-11, y validada contra la referencia NeMo en el commit 12f1076 de transcribe.cpp el 2026-05-11. Segun la model card upstream, en marzo de 2026 se publico un checkpoint actualizado entrenado con corpus mas amplios; el checkpoint anterior de enero de 2026 queda en la rama nemotron-speech-streaming-jan2026. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento, el numero de tokens de audio ni si hubo etapas de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto en ingles con puntuacion y capitalizacion nativas.
- Timestamps a nivel de token, utiles para alineacion con audio o generacion de subtitulos.
- Inferencia offline de alto rendimiento sobre ficheros de audio completos.
- Ejecucion en CPU y en GPU mediante backends Metal, Vulkan y CPU dentro de transcribe.cpp.
- Cuantizacion agresiva con impacto minimo en WER: la version Q4_K_M (453 MB) rinde a 2,38 % de WER frente al 2,31 % de F32 en LibriSpeech test-clean.
- No soporta traduccion.
- No soporta deteccion de idioma.
- No expone API de sesion en streaming en transcribe.cpp: aunque la arquitectura base es cache-aware y admite chunks de 80 a 1120 ms, esta conversion se ejecuta en modo offline.
- Capacidades multimodales o de vision: no disponibles.
- Tool calling, function calling y comportamiento agentico: no aplica, es un modelo ASR puro.

## Casos de uso

- Transcripcion por lotes de reuniones y entrevistas: con un factor de tiempo real de 154,5 en Metal sobre un M4 Max, un solo equipo puede procesar horas de audio en minutos; el modo offline encaja bien en pipelines nocturnos o por colas.
- Generacion de subtitulos con marcas temporales: los timestamps a nivel de token permiten segmentar la transcripcion y alinearla con la pista de video sin necesidad de un forzado de alineamiento externo.
- Indexado y busqueda sobre archivos de audio: convertir podcasts, grabaciones de clase o archivos de atencion telefonica a texto para alimentar motores de busqueda o sistemas RAG, con un coste de almacenamiento bajo gracias a las cuantizaciones de 453 a 696 MB.
- Transcripcion en portatiles sin GPU dedicada: en un Ryzen 4750U la conversion alcanza factores de 13x en Vulkan y 7,5x en CPU respecto al tiempo real, lo que permite transcribir en local sin acelerador dedicado.
- Generacion de datasets de audio-texto para entrenamiento o evaluacion de modelos de lenguaje: la salida ya incluye puntuacion y mayusculas, lo que reduce el preprocesado necesario antes de usar el texto como corpus.
- Analitica de voz y cumplimiento normativo en despliegue local: al ejecutarse en hardware propio y no requerir servicios externos, encaja en flujos donde el audio no puede salir de la infraestructura de la organizacion.
- Accesibilidad y subtitulado en directo: la arquitectura base soporta chunks de 80 a 1120 ms, pero este empaquetado GGUF no permite streaming con transcribe.cpp en la version documentada, por lo que solo seria viable en modo offline o esperando soporte de sesion en streaming.
- Normalizacion de transcripciones para post-procesado: la salida con mayusculas y puntuacion se puede enviar directamente a un LLM para resumen, extraccion de acciones o clasificacion sin una etapa previa de restauracion de formato.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversion, medidos sobre la particion completa de LibriSpeech test-clean (2620 enunciados) con decodificacion RNN-T greedy en modo offline.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,30 GB | 2,31 % |
| F16 | 1,16 GB | 2,31 % |
| Q8_0 | 696 MB | 2,31 % |
| Q6_K | 573 MB | 2,29 % |
| Q5_K_M | 514 MB | 2,34 % |
| Q4_K_M | 453 MB | 2,38 % |

El baseline de referencia en F32 es 2,31 % de WER. NVIDIA reporta 2,32 % en la misma particion con att_context_size=[70, 13] (chunk de 1,12 s, sin puntuacion ni capitalizacion), lo que situa la conversion dentro del margen esperado respecto al modelo original. El valor de Q6_K (2,29 %) es ligeramente inferior al de F32, algo atribuible a la variabilidad de la cuantizacion y no a una mejora real.

Rendimiento en velocidad, expresado como factor de tiempo real (un valor mas alto implica procesar mas rapido que el tiempo real):

| Plataforma | Backend | Factor de tiempo real |
|---|---|---:|
| Apple M4 Max | Metal | 154,5 |
| Apple M4 Max | CPU | 32 |
| AMD Ryzen 4750U | Vulkan | 13 |
| AMD Ryzen 4750U | CPU | 7,5 |

No se han publicado resultados de benchmarks en la informacion disponible para tareas distintas de ASR (no hay MMLU, HumanEval, GSM8K ni equivalentes, ya que el modelo no es generativo de texto).

## Requisitos de hardware

- VRAM o memoria residente aproximada segun cuantizacion: 2,30 GB en F32, 1,16 GB en F16, 696 MB en Q8_0, 573 MB en Q6_K, 514 MB en Q5_K_M y 453 MB en Q4_K_M, mas el overhead del runtime y los buffers de audio.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas no tendrian ninguna limitacion; incluso GPUs integradas pueden asumir la cuantizacion Q4_K_M.
- Funciona en CPU sin GPU: en un AMD Ryzen 4750U mantiene 7,5x el tiempo real en CPU y 13x con Vulkan.
- Apple Silicon: en un M4 Max alcanza 154,5x el tiempo real con Metal y 32x en CPU, lo que lo hace apto para transcripcion local en portatiles de gama alta.
- Opciones de despliegue: transcribe.cpp es el runtime soportado y debe compilarse desde el codigo fuente con CMake. No hay indicios en la informacion disponible de soporte en vLLM, TGI, llama.cpp u Ollama, dado que se trata de un modelo ASR con decodificador RNN-T y no de un modelo de lenguaje.
- Requisito de entrada: audio WAV mono a 16 kHz; para otras fuentes hay que convertir previamente con ffmpeg (-ar 16000 -ac 1).
- Latencia: no disponible para streaming. En modo offline, la latencia efectiva depende del factor de tiempo real de la plataforma y de la duracion del fichero completo.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks comparativos en la informacion disponible, por lo que las celdas de rendimiento se dejan como no disponibles. La comparacion se limita a caracteristicas estructurales de referencia publica.

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Formato | WER comparativo |
|---|---:|---|---|---|---|---|
| nemotron-speech-streaming-en-0.6b (esta conversion GGUF) | 0,618B | Ingles | FastConformer cache-aware + RNN-T | nvidia-open-model-license | GGUF (transcribe.cpp) | 2,31-2,38 % en LibriSpeech test-clean (publicado en la model card) |
| nvidia/nemotron-speech-streaming-en-0.6b (original) | 0,6B | Ingles | FastConformer cache-aware + RNN-T | nvidia-open-model-license | NeMo / safetensors (no confirmado en la informacion disponible) | 2,32 % segun NVIDIA en la misma particion |
| Whisper large-v3 | Aproximadamente 1,55B | Multilingue | Encoder-decoder transformer | MIT | Distintos formatos | No disponible en la informacion proporcionada |
| distil-whisper-large-v3 | Aproximadamente 0,76B | Ingles | Encoder-decoder transformer destilado | MIT | Distintos formatos | No disponible en la informacion proporcionada |

Nota: los datos de los modelos alternativos provienen de conocimiento publico general y no de la informacion suministrada en esta busqueda; no se dispone de una comparacion de WER en condiciones equivalentes, por lo que no debe interpretarse como una evaluacion directa.

## Limitaciones y advertencias

- Solo ingles: no admite otros idiomas, ni traduccion, ni deteccion automatica de idioma.
- No hay streaming real en este empaquetado: aunque la arquitectura base es cache-aware y soporta chunks de 80 a 1120 ms, transcribe.cpp no expone todavia una API de sesion en streaming, por lo que el uso documentado es offline.
- Riesgo de alucinacion y de transcripciones plausibles pero incorrectas en audio con ruido, solapamiento de hablantes, acentos marcados fuera del dominio de entrenamiento o vocabulario muy especializado. No se han publicado tasas de error por dominio.
- Sesgos: no se documenta en la informacion disponible ninguna evaluacion de sesgo por acento, genero, edad o variedad dialectal del ingles.
- Requisito de formato de entrada estricto: audio WAV mono a 16 kHz. Omitir la conversion puede degradar el resultado sin aviso.
- Licencia heredada del modelo base (nvidia-open-model-license): es una licencia "other", no una licencia abierta estandar tipo Apache o MIT. Antes de un uso comercial o de redistribuir el modelo o sus derivados hay que revisar los terminos completos en el enlace de NVIDIA incluido mas abajo.
- Trazabilidad de la conversion: es un repositorio de terceros (myflow-ai) con 0 descargas y 0 likes en el momento de la consulta. Aunque se indica validacion frente a la referencia NeMo, el mantenimiento y las actualizaciones dependen del autor y no de NVIDIA.
- Discrepancia de tamanos: HuggingFace reporta un tamano de repo de 0,7 GB, inferior a la suma de los ficheros listados en la model card (que llega a 2,30 GB en F32). Conviene verificar el artefacto descargado antes de desplegarlo.
- Ausencia de datos de entrenamiento: no se especifica composicion del dataset, numero de horas de audio ni proceso de alineacion o filtrado, lo que dificulta estimar el comportamiento fuera de LibriSpeech.
- Sin soporte confirmado en ecosistemas habituales: no hay evidencia de integracion con vLLM, TGI, Ollama o llama.cpp, lo que limita las opciones de despliegue estandarizadas.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/myflow-ai/nemotron-speech-streaming-en-0.6b-gguf
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Commit upstream de referencia: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/commit/ef3bf40
- Rama del checkpoint de enero de 2026: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/tree/nemotron-speech-streaming-jan2026
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/12f1076
- Pagina del modelo en transcribe.cpp (rendimiento, validacion numerica y reproduccion): https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-speech-streaming-en-0.6b.md
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2312.17279
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2305.05084
- Repositorio espejo alternativo citado en la model card: https://huggingface.co/handy-computer/nemotron-speech-streaming-en-0.6b-gguf
