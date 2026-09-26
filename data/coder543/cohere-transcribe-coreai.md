# coder543/cohere-transcribe-coreai

## Resumen

Cohere Transcribe — Core AI es una conversión del modelo de reconocimiento automático de voz Cohere Transcribe (CohereLabs/cohere-transcribe-03-2026) al formato de grafos de Apple Core AI, publicada por el usuario coder543. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado de los pesos upstream fijados a la revisión `76b8b23e8607f35f0265a23d481b338fb0e26aea`, orientado a ejecución local sobre neural engine (ANE) en silicio de Apple.

El modelo resuelve transcripción de audio offline multilingüe en 15 idiomas (inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano) con una arquitectura encoder-decoder: 48 capas en el encoder y 8 en el decoder, cuantizadas en W8A16 con proyecciones seleccionadas retenidas en FP16. Los grafos no aceptan audio en crudo: el runtime anfitrión debe aportar el frontend log-mel, el prompt de idioma, los embeddings de tokens, la gestión de la caché autorregresiva y la tokenización.

Su relevancia actual es doble. Por un lado, demuestra que es viable ejecutar un modelo ASR de cierta envergadura íntegramente en el ANE de un portátil de consumo: en un MacBook Air M3 de 16 GB transcribe 18 minutos y 15 segundos de audio en 12,186 s (factor 89,9×) con un WER normalizado estilo Whisper del 1,89 % en la muestra JFK en inglés. Por otro, es una conversión temprana: solo el inglés ha sido validado y no se publican benchmarks para el resto de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer; encoder de 48 capas y decoder de 8 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de tokens; procesamiento por chunks con fronteras silenciosas de hasta 35 s y capacidades de cache de decoder de 64/128/256/512/1024 |
| Tipos de cuantizacion | W8A16 en encoder y decoder, con salidas de convolucion seleccionadas y proyecciones de posicion relativa retenidas en FP16; tablas de embedding del host en FP32 |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, vi, ko (15 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Grafos Apple Core AI (`.aimodel`) acompanados de `metadata.json`, `decoder-graph.json`, `prompts.json` y `SHA256.json` |
| Pipeline | automatic-speech-recognition |
| Modelo base | CohereLabs/cohere-transcribe-03-2026 |
| Tamano del repositorio | 2,2 GB |
| Revision upstream fijada | 76b8b23e8607f35f0265a23d481b338fb0e26aea |

## Arquitectura y entrenamiento

La conversión mantiene la topologia del modelo upstream: un encoder de 48 capas que conserva contexto bidireccional completo dentro de cada chunk, y un decoder autorregresivo de 8 capas. Cuatro etapas del encoder emplean la formulacion completa de posicion relativa de Fourier. La cuantizacion aplicada es W8A16 (pesos de 8 bits, activaciones de 16 bits), con excepciones en FP16 para determinadas salidas de convolucion y proyecciones de posicion relativa, y embeddings del host en FP32. Tanto encoder como decoder estan optimizados para ejecutarse preferentemente en el ANE.

No se dispone de informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO), ya que la model card de esta conversión solo documenta el proceso de conversion y su rendimiento. La innovacion tecnica destacable no esta en el entrenamiento sino en la ejecucion: el runtime cualificado mantiene dos peticiones de encoder en vuelo, decodifica hasta ocho chunks de forma independiente, reutiliza buffers de salida y emplea chunks de frontera silenciosa de como maximo 35 segundos, reteniendo todas las muestras de entrada sin descartar palabras ni posiciones de atencion de forma intencionada.

## Capacidades

- Transcripcion de voz a texto offline (no streaming) en 15 idiomas declarados.
- Procesamiento por chunks con contexto bidireccional completo dentro de cada chunk, lo que favorece la coherencia local de la transcripcion.
- Ejecucion integra en el ANE de Apple, sin uso de GPU en el proceso medido (756 predicciones ANE y cero intervalos de GPU en la traza registrada).
- Dos tamanos de lote soportados en el decoder (1 y 8) y cinco capacidades de cache (64, 128, 256, 512 y 1024), lo que permite ajustar memoria y latencia.
- Frontend log-mel, prompt de idioma, embeddings de tokens, gestion de cache y tokenizacion delegados al runtime anfitrion.
- No proporciona marcas temporales por palabra (word timing) en estos grafos.
- No acepta audio en crudo directamente: requiere el host runtime especifico del modelo.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la propia tarea ASR.

## Casos de uso

- Transcripcion local de reuniones en Mac: el modelo procesa audio largo por chunks (36 chunks para 18 minutos) con contexto bidireccional dentro de cada chunk, lo que permite generar actas en el propio portatil sin enviar audio a la nube.
- Archivado de podcasts y entrevistas: con un factor de tiempo real de 89,9× medido en audio largo, un catalogo de horas de audio se transcribe en minutos sobre un MacBook Air M3.
- Dictado en aplicaciones de escritorio y moviles: al integrarse en macOS 27 e iOS 27 mediante Core AI, habilita entrada por voz en apps nativas manteniendo el audio en el dispositivo.
- Transcripcion de llamadas de atencion al cliente: el hecho de que la inferencia sea on-device simplifica el cumplimiento de requisitos de privacidad y residencia de datos en grabaciones con informacion personal.
- Documentacion clinica o legal con datos sensibles: al no requerir conectividad ni servicios externos, encaja en entornos donde el audio no puede salir del equipo del profesional.
- Preprocesado para pipelines de recuperacion sobre audio (RAG): convierte grandes volumenes de grabaciones en texto indexable en local antes de pasarlo a un sistema de busqueda o resumen.
- Subtitulado por segmentos: util para generar subtitulos a nivel de fragmento, teniendo en cuenta que no se suministran tiempos por palabra y que habria que derivar los cortes del chunking del host.
- Transcripcion en entornos sin red: dispositivos iOS 27 o Macs desconectados pueden transcribir sin depender de APIs externas.

## Benchmarks y rendimiento

Unicas mediciones publicadas, realizadas en un MacBook Air M3 (16 GB) con macOS 27 build 26A428, con transcripcion en caliente (mediana de tres iteraciones tras el calentamiento), incluyendo frontend, encoder y decoder, y excluyendo preparacion, E/S de fichero de audio y planificacion de chunks.

| Prueba | Duracion de audio | Tiempo de transcripcion | Factor audio/tiempo | WER |
|---|---:|---:|---:|---:|
| JFK corto | 20 s | 0,518 s | 38,6× | no disponible |
| JFK largo | 1.095,320125 s (18:15) | 12,186 s | 89,9× | 1,89 % (42/2.220, normalizado estilo Whisper) |

La grabacion larga se proceso en 36 chunks. El WER coincide con la referencia independiente en FP32 tras la normalizacion. Una traza separada registro 756 predicciones en ANE y cero intervalos de GPU en el proceso medido, lo que establece la ubicacion de la ejecucion, no la utilizacion de las ALU. El ingles JFK es la validacion inicial de la conversion; el resto de idiomas soportados no han sido cualificados. No hay resultados de MMLU, HumanEval, GSM8K ni equivalentes, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- Plataforma: exclusivamente silicio de Apple (physical Apple silicon) con macOS 27 o iOS 27 y un runtime anfitrion especifico del modelo.
- No hay soporte para CUDA, ROCm ni aceleradores de NVIDIA o AMD.
- Memoria: el unico equipo cualificado en la documentacion es un MacBook Air M3 con 16 GB, por lo que cabe en hardware de consumo de gama portatil.
- VRAM estimada para inferencia: no disponible (depende del reparto entre ANE y memoria unificada del host).
- GPU recomendadas: no aplica; la ejecucion se delega al ANE y los grafos no usan GPU en el proceso medido.
- Opciones de despliegue: los propios grafos Core AI (`.aimodel`) mas un host runtime que implemente log-mel, prompt de idioma, embeddings, cache autorregresiva y tokenizacion. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 0,518 s para 20 s de audio (38,6×) y 12,186 s para 18:15 de audio (89,9×) en M3.
- Notas de despliegue: los ficheros `.aimodel` de origen se especializan en el dispositivo objetivo y la primera preparacion puede tardar varios minutos; no se incluyen artefactos AoT especificos de arquitectura porque no se demostro una mejora significativa en la primera carga. Se eliminan las ubicaciones de depuracion de origen, conservando firmas de grafo y conteos de operaciones. `SHA256.json` contiene sumas de verificacion de todos los ficheros distribuidos excepto de si mismo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Rendimiento | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| coder543/cohere-transcribe-coreai | no disponible | chunks de hasta 35 s; cache de decoder 64-1024 | 89,9× en audio de 18:15; WER 1,89 % en JFK (ingles) | Apache 2.0 | Grafos Core AI (`.aimodel`) para Apple silicon, macOS 27 / iOS 27 |
| CohereLabs/cohere-transcribe-03-2026 (upstream) | no disponible | no disponible | no disponible en la informacion proporcionada | Apache 2.0 | Pesos originales del modelo base; revision `76b8b23e…` |
| OpenAI Whisper large-v3 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No se dispone de datos comparativos de WER ni de latencia frente a otras alternativas ASR en la informacion proporcionada.

## Limitaciones y advertencias

- Solo el ingles (muestra JFK) ha sido validado en esta conversion; el resto de los 14 idiomas declarados no han sido cualificados por el autor.
- No se suministran marcas temporales por palabra en estos grafos, lo que limita el subtitulado fino y la alineacion forzada.
- Los grafos no aceptan audio en crudo: sin un host runtime que aporte log-mel, prompt de idioma, embeddings, cache y tokenizacion, el modelo no es utilizable.
- Dependencia estricta de plataforma: requiere silicio Apple fisico con macOS 27 o iOS 27, lo que excluye servidores x86 y GPUs de NVIDIA.
- La primera preparacion del modelo puede tardar varios minutos por la especializacion en el dispositivo objetivo.
- Riesgo de alucinacion inherente a los modelos ASR, especialmente en audio con ruido, solapamiento de hablantes o dominios muy alejados de los datos de entrenamiento; no se documentan mitigaciones especificas.
- No se documentan sesgos demograficos, acusticos ni dialectales para esta conversion.
- El proceso medido no descarta palabras ni posiciones de atencion de forma intencionada, pero no hay garantia formal de que no se pierda contenido en fronteras de chunk.
- No hay informacion sobre el dataset de entrenamiento original ni sobre posibles sesgos heredados del modelo upstream.
- Licencia Apache 2.0, tanto en el modelo upstream como en los pesos convertidos, lo que permite uso comercial; conviene verificar igualmente las condiciones de la revision fijada y de los artefactos de Apple Core AI que intervengan en el despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre esta conversion.
- Para produccion, la ausencia de benchmarks multiidioma y de medidas de latencia en equipos distintos del M3 hace recomendable una evaluacion propia antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coder543/cohere-transcribe-coreai
- Modelo base upstream: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Revision upstream fijada: `76b8b23e8607f35f0265a23d481b338fb0e26aea`
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) asociados a este modelo.
