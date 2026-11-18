# adventists-ai/Sophon-Realtime-4B-Flash-MLX

## Resumen

Sophon-Realtime-4B-Flash-MLX es la version para Apple Silicon del modelo de voz full-duplex Sophon-Realtime-4B-Flash, desarrollado por adventists-ai. Se trata de un modelo any-to-any (audio de entrada, audio de salida) que procesa conversaciones habladas en tiempo real de extremo a extremo: escucha, decide por si mismo cuando el interlocutor ha terminado de hablar, responde con voz propia y etiquetas de sonido, se detiene si le interrumpen y continua si recibe un "mm-hmm". Todo el pipeline (audicion, gestion de turnos y sintesis de voz) se ejecuta en la GPU del Mac sin paso intermedio de speech-to-text ni dependencia de la nube.

La arquitectura combina un "thinker" (modelo de lenguaje de 4B parametros cuantizado a 8 bits con `mlx_lm`, grupo 64) con una torre de audio y proyector (modulo "ear") y una etapa de voz ("talker"). Los pesos del tower de audio, proyector y etapa de voz son identicos a los del build CUDA; solo el LM del thinker esta cuantizado. El contexto y el numero exacto de tokens de entrenamiento no se detallan en la informacion disponible.

Es relevante porque demuestra inferencia de voz conversacional full-duplex local en hardware de consumo Apple (16 GB de memoria unificada, unos 11 GB en uso durante la conversacion), con latencias de respuesta de 0,3-0,5 s en un M4 Max cuando el modelo esta seguro de que el usuario ha terminado. La version 1.5.0 se publico el 18 de noviembre de 2026 bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech: thinker (LM) + torre de audio/proyector (ear) + etapa de voz (talker); pesos MLX |
| Parametros totales | 4B (build "4B Flash"); desglose por modulo no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits del LM del thinker via `mlx_lm` (group 64); tower de audio, proyector y etapa de voz sin cuantizar (mismos pesos que el build CUDA) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (codigo y pesos; ver `NOTICE` para fuentes) |
| Formato de pesos | safetensors (libreria `mlx`); carpetas `thinker_mlx/`, `ear/`, `talker/`, `voices/` |
| Tamano del repo | 9,2 GB (descarga aproximada de 9 GB) |
| Pipeline | any-to-any |
| Hardware objetivo | Apple Silicon (M1 o posterior), macOS 14 o posterior, 16 GB de memoria unificada o mas |

## Arquitectura y entrenamiento

El modelo es un sistema de voz full-duplex compuesto por tres etapas acopladas: un "thinker" que es un modelo de lenguaje de 4B parametros (cuantizado a 8 bits con `mlx_lm`, group 64), una torre de audio con proyector que actua como "oido" y una etapa de voz ("talker") que genera la salida hablada con etiquetas de sonido. A diferencia de los pipelines clasicos ASR + LLM + TTS, aqui no hay transcripcion intermedia: el audio entra en el tower, el thinker razona y decide el turno, y el talker sintetiza la respuesta. La gestion de turnos se implementa mediante una pregunta de cuatro opciones ("finished / still talking / back-channel / hesitating") formulada en un prompt corto propio del modelo, seleccionable mediante `turn_question` en `config.json`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Los pesos de audio y voz son los mismos que los del build CUDA Sophon-Realtime-4B-Flash; la unica transformacion para esta version MLX es la cuantizacion del LM del thinker. La innovacion principal es la ejecucion local full-duplex con cancelacion de eco integrada y capacidad de barge-in (el modelo se detiene al ser interrumpido) sobre la GPU de un Mac.

## Capacidades

- Conversacion de voz full-duplex en tiempo real: escucha, decide el turno y responde con voz propia sin paso de speech-to-text.
- Gestion de turnos con cuatro estados (terminado, sigue hablando, back-channel, duda); si no esta seguro de que el usuario ha terminado, espera hasta 2 s de silencio antes de responder.
- Barge-in: se detiene cuando el usuario le interrumpe.
- Back-channels: responde a senales como "mm-hmm" y continua la conversacion.
- Etiquetas de sonido en la respuesta (sound tags) para expresividad vocal.
- Voces integradas (carpeta `voices/`); seleccionables con `--voice`.
- Cancelacion de eco integrada (desactivable con `--no-aec` para auriculares).
- Soporte bilingue chino e ingles, seleccionable con `--lang en`.
- No incluye (en la version Mac): entrada de camara, tool calls ni clonacion de voz zero-shot.

## Casos de uso

- Demos locales de voz conversacional: el modelo permite montar una demo de chat de voz full-duplex en un Mac con 16 GB de memoria unificada, sin nube ni GPU dedicada, usando `mac/install.sh` y el binario `sophon-4b`.
- Companeros y personajes interactivos: la combinacion de gestion de turnos, back-channels y etiquetas de sonido permite crear personajes que mantienen conversaciones naturales, reaccionan a interrupciones y usan voces integradas.
- Prototipado de asistentes de voz en ingles o chino: util para validar flujos de atencion conversacional (turn-taking, barge-in) antes de migrar a un build de mayor capacidad o a la API hosted.
- Investigacion en interaccion humano-maquina: el modelo expone una pregunta de turno de cuatro opciones y permite medir precision y AUC en conjuntos como Smart Turn v3.2 (90,3/0,961 en ingles y 89,7/0,953 en chino en la muestra reportada).
- Evaluacion de latencia en hardware Apple: con 0,3-0,5 s de latencia de respuesta en un M4 Max, sirve para estudiar el rendimiento de pipelines full-duplex en GPU integrada.
- Desarrollo de interfaces manos libres en macOS: con microfono USB o headset en Mac mini y Mac Studio, el modelo puede integrarse en aplicaciones de escritorio que requieran conversacion por voz sin conexion.
- Pruebas de despliegue MLX: util para equipos que quieran validar la libreria `mlx` y la cuantizacion 8-bit en cargas de trabajo de audio en tiempo real.

## Benchmarks y rendimiento

| Metrica | 4B (este repo) | 4B con pregunta corta del build 32B | 32B Mac build |
|---|---|---|---|
| Precision / AUC en ingles (Smart Turn v3.2, 300 clips) | 90,3 / 0,961 | 72,3 / 0,888 | 91,7 / 0,961 |
| Precision / AUC en chino (Smart Turn v3.2, 300 clips) | 89,7 / 0,953 | 74,0 / 0,851 | 92,7 / 0,973 |
| VoiceBench (build CUDA) | 62,4 | no disponible | 82,8 |
| Latencia de respuesta tras dejar de hablar (M4 Max) | 0,3-0,5 s | no disponible | 0,9-1,1 s |
| Memoria en uso durante la conversacion | unos 11 GB (pico 11,3 GB con MLX limitado a 10,5 GB) | no disponible | unos 26 GB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento en la informacion disponible. La cifra de VoiceBench 62,4 corresponde al build CUDA del mismo modelo base, no a esta version MLX.

## Requisitos de hardware

- Memoria unificada: 16 GB funciona (unos 11 GB en uso durante la conversacion); se recomienda 24 GB o mas. Con 16 GB conviene cerrar otras aplicaciones.
- Descarga: aproximadamente 9 GB.
- GPU: Apple Silicon M1 o posterior; probado en un M4 Max (36 GB) con audio simulado en tiempo real y con la memoria MLX limitada a 10,5 GB (equivalente a lo que un Mac de 16 GB asigna a la GPU), con pico de 11,3 GB. No probado aun en un Mac fisico de 16 GB.
- No cabe en GPU consumer NVIDIA para esta version MLX; para CUDA existe el build Sophon-Realtime-4B-Flash.
- Sistema: macOS 14 o posterior.
- Audio: microfono obligatorio (Mac Studio y Mac mini no lo llevan integrado; usar USB o headset); altavoces validos gracias a la cancelacion de eco integrada.
- Despliegue: `mlx` mediante el repositorio `adventists-ai/sophon-realtime` (`SIZE=4B bash mac/install.sh`, binario `~/sophon-mac/sophon-4b`). Opciones `--no-aec`, `--in`, `--out`, `--list`, `--voice`, `--lang`.
- Concurrencia: una conversacion a la vez.
- Latencia: 0,3-0,5 s desde que el usuario deja de hablar hasta que el modelo empieza a responder en un M4 Max (cuando esta seguro de que ha terminado); espera hasta 2 s de silencio en caso de duda. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophon-Realtime-4B-Flash-MLX (este) | 4B (LM a 8 bits) | no disponible | VoiceBench 62,4 (build CUDA); turnos 90,3/89,7 de precision | Apache-2.0 | MLX para Apple Silicon |
| Sophon-Realtime-4B-Flash | 4B | no disponible | VoiceBench 62,4 (CUDA) | Apache-2.0 | CUDA |
| Sophon-Realtime-32B-Flash-4bit-MLX | 32B (4 bits) | no disponible | VoiceBench 82,8; turnos 91,7/92,7 de precision | Apache-2.0 | MLX, 32 GB de memoria (36 GB recomendado) |
| Sophon-Realtime-32B-Flash (CUDA, referenciado) | 32B | no disponible | no disponible | Apache-2.0 | CUDA |

No se dispone de datos de otros modelos de voz full-duplex comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Conocimiento y razonamiento mucho mas debiles que el build de 32B: puede afirmar hechos erroneos con confianza; para respuestas que deban ser correctas, usar el 32B o la API hosted.
- Riesgo de alucinacion factual elevado por el reducido tamano del thinker (4B).
- Solo una conversacion simultanea.
- Sin entrada de camara, sin tool calls y sin clonacion de voz zero-shot en la version Mac; solo voces integradas.
- Idiomas limitados a chino e ingles.
- No probado en un Mac fisico de 16 GB: el test se hizo con MLX limitado a 10,5 GB y audio simulado; conviene consultar el issue #1 del repositorio para reportes.
- La pregunta de turno de cuatro opciones es especifica del 4B; usar la pregunta corta del build 32B degrada la precision (72,3/74,0 frente a 90,3/89,7).
- Requiere microfono externo en Mac mini y Mac Studio.
- Licencia Apache-2.0 permite uso comercial, pero debe revisarse el fichero `NOTICE` para las fuentes de los pesos.
- Memoria: con 16 GB y otras aplicaciones abiertas puede haber presion de memoria; el pico medido fue de 11,3 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash-MLX
- Modelo base (CUDA): https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- Build 32B para Mac: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-4bit-MLX
- Repositorio de codigo: https://github.com/adventists-ai/sophon-realtime
- Codigo para Mac: https://github.com/adventists-ai/sophon-realtime/tree/main/mac
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Issue de pruebas en Mac de 16 GB: https://github.com/adventists-ai/sophon-realtime/issues/1
- API hosted (compatible con OpenAI Realtime): https://api.adventists.ai/console/
- Documentacion de la API: https://api.adventists.ai/console/docs
- README en chino: `README_CN.md` en el repositorio del modelo
