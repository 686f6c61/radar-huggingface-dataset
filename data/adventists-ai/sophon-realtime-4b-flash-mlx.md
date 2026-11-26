# adventists-ai/Sophon-Realtime-4B-Flash-MLX

## Resumen

Sophon-Realtime-4B-Flash-MLX es la version cuantizada a 8 bits y adaptada a MLX del modelo de voz full-duplex Sophon-Realtime-4B-Flash, desarrollado por adventists-ai. Se trata de un modelo speech-to-speech que escucha, decide por si mismo cuando el interlocutor ha terminado de hablar, responde con voz propia y se detiene cuando se le interrumpe, todo ello sin una etapa intermedia de speech-to-text. Esta version esta pensada para ejecutarse localmente en Apple Silicon (M1 o posterior) con 16 GB o mas de memoria unificada.

El modelo combina un "thinker" (un modelo de lenguaje de 4B parametros cuantizado a 8 bits con `mlx_lm`, grupo 64), una torre de audio con su proyector y una etapa de voz ("talker") que conserva los mismos pesos que la build CUDA. El resultado es un pipeline audio-to-audio completo que corre sobre la GPU del Mac mediante MLX, sin nube.

Su relevancia actual radica en que permite conversacion de voz en tiempo real y full-duplex en hardware de consumo Apple, con latencias de 0,3-0,5 s entre el fin del turno del usuario y el inicio de la respuesta en un M4 Max. Es una opcion para demos locales, companeros conversacionales y personajes, aunque su capacidad de conocimiento y razonamiento es notablemente inferior a la variante de 32B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech: thinker (LLM) + torre de audio + proyector + etapa de voz (talker); inferencia via MLX |
| Parametros totales | 4B (el "thinker" es un LLM de 4B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (cuantizacion del LLM con `mlx_lm`, group 64); torre de audio, proyector y etapa de voz sin cuantizar (mismos pesos que la build CUDA) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (codigo y pesos; ver `NOTICE` para fuentes) |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo es un sistema speech-to-speech full-duplex compuesto por varias etapas: un "thinker" basado en un modelo de lenguaje de 4B parametros que razona y decide el turno, una torre de audio con proyector que procesa la entrada de voz, y una etapa de voz ("talker") que sintetiza la respuesta hablada. La percepcion, la gestion de turnos y la locucion se ejecutan integramente en la GPU del Mac via MLX, sin paso intermedio de transcripcion.

La gestion de turnos se resuelve mediante una pregunta de cuatro opciones ("terminado / sigue hablando / back-channel / dudando") que el cerebro de 4B responde en su propio prompt corto; esta configuracion se selecciona con `turn_question` en `config.json`. Cuando el modelo no esta seguro de que el usuario haya terminado, espera hasta 2 s de silencio antes de responder. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Conversacion de voz full-duplex en tiempo real: escucha, decide el fin de turno, responde con voz propia y se detiene ante interrupciones (barge-in).
- Gestion autonoma de turnos con cuatro estados (terminado, sigue hablando, back-channel, dudando).
- Back-channels: responde a senales como "mm-hmm" y continua la conversacion.
- Etiquetas de sonido (sound tags) integradas en la respuesta de voz.
- Cancelacion de eco incorporada (se puede desactivar con `--no-aec` para auriculares).
- Voces integradas seleccionables mediante `--voice`.
- Soporte de chino e ingles, seleccionable con `--lang en`.
- No incluye en esta version Mac: entrada de camara, tool calls ni clonacion de voz zero-shot.

## Casos de uso

- Demos locales de voz en Apple Silicon: el modelo permite montar una demo conversacional completa en un Mac con 16 GB, sin GPU dedicada ni servicios en la nube, usando el script `mac/install.sh` y el binario `sophon-4b`.
- Companeros conversacionales y personajes: la variante 4B conserva las habilidades de conversacion (turn-taking, back-channels, barge-in, sound tags) y su baja latencia (0,3-0,5 s en M4 Max) la hace adecuada para interaccion fluida con voces integradas.
- Asistentes de voz con interrupcion natural: la deteccion de fin de turno (90,0 de accuracy en ingles y 89,7 en chino sobre la muestra de Smart Turn v3.2) permite conversaciones donde el usuario puede interrumpir y el modelo se detiene.
- Practica de conversacion en ingles o chino: con `--lang en` o el modo por defecto en chino, sirve como interlocutor para practicar idiomas en local, aceptando back-channels y turnos naturales.
- Prototipado de interfaces de voz full-duplex: investigadores y desarrolladores pueden evaluar el comportamiento de turn-taking y barge-in sobre MLX antes de pasar a la build CUDA de 32B o a la API alojada.
- Evaluacion de despliegue en hardware de consumo: con memoria MLX limitada a 10,5 GB (lo que un Mac de 16 GB asigna a la GPU) la conversacion completa corrio con un pico de 11,3 GB, lo que permite validar requisitos de memoria antes de produccion.

## Benchmarks y rendimiento

| Metrica | 4B (este repo) | 4B con pregunta corta del build 32B | 32B Mac build |
|---|---|---|---|
| Precision / AUC en ingles (muestra Smart Turn v3.2) | 90,0 / 0,961 | 72,3 / 0,888 | 91,7 / 0,961 |
| Precision / AUC en chino (muestra Smart Turn v3.2) | 89,7 / 0,954 | 74,0 / 0,851 | 92,7 / 0,973 |
| VoiceBench (build CUDA) | 62,4 | No disponible | 82,8 |
| Latencia fin de turno a inicio de respuesta (M4 Max) | 0,3-0,5 s | No disponible | 0,9-1,1 s |

La muestra de evaluacion de turn-taking consta de 300 clips por idioma, la mitad de ellos con turno terminado, usando los ultimos 8 s de cada clip.

## Requisitos de hardware

- Apple Silicon (M1 o posterior) con macOS 14 o posterior.
- Memoria unificada: 16 GB funciona (unos 11 GB en uso durante la conversacion); se recomiendan 24 GB o mas. Con 16 GB conviene cerrar otras aplicaciones.
- Descarga: aproximadamente 9 GB (tamano del repo: 9,2 GB).
- Microfono obligatorio: Mac Studio y Mac mini no lo incluyen; se necesita microfono USB o auriculares. Los altavoces son validos gracias a la cancelacion de eco integrada.
- Probado en un M4 Max (36 GB) con audio simulado en tiempo real y memoria MLX limitada a 10,5 GB; pico de 11,3 GB. No probado aun en un Mac fisico de 16 GB.
- Despliegue: MLX mediante el repositorio `sophon-realtime` (carpeta `mac/`), con instalacion via `SIZE=4B bash mac/install.sh` y ejecucion con `~/sophon-mac/sophon-4b`.
- Una conversacion simultanea como maximo.

## Comparativa con modelos similares

| Modelo | Parametros | Memoria / descarga | Latencia de turno (M4 Max) | VoiceBench | Licencia |
|---|---|---|---|---|---|
| Sophon-Realtime-4B-Flash-MLX (este) | 4B | 16 GB funciona; ~9 GB descarga | 0,3-0,5 s | 62,4 (build CUDA) | Apache-2.0 |
| Sophon-Realtime-32B-Flash-4bit-MLX | 32B | 32 GB funciona; ~24 GB descarga | 0,9-1,1 s | 82,8 | Apache-2.0 |
| Sophon-Realtime-4B-Flash (CUDA) | 4B | No disponible (GPU CUDA) | No disponible | 62,4 | Apache-2.0 |

No se dispone en la informacion proporcionada de comparativas con modelos de terceros de la misma categoria.

## Limitaciones y advertencias

- Conocimiento y razonamiento mucho mas debiles que la variante de 32B: puede afirmar hechos erroneos con seguridad. Para respuestas que deban ser correctas se recomienda el build de 32B o la API alojada.
- Una sola conversacion a la vez.
- Sin entrada de camara, sin tool calls y sin clonacion de voz zero-shot en la version Mac (solo voces integradas).
- Solo chino e ingles.
- No probado en un Mac fisico de 16 GB; el soporte esta verificado con memoria MLX limitada a 10,5 GB en un M4 Max.
- La pregunta de turno de cuatro opciones esta ajustada al cerebro de 4B; usar la pregunta corta del build de 32B degrada notablemente la precision (72,3 en ingles y 74,0 en chino).
- Riesgo de sesgos y alucinaciones inherente a un LLM de 4B; no se documentan sesgos especificos en la informacion disponible.
- Licencia Apache-2.0 para codigo y pesos, con la salvedad de consultar `NOTICE` para las fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash-MLX
- Modelo base: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- Build de 32B para Mac: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-4bit-MLX
- Repositorio de codigo: https://github.com/adventists-ai/sophon-realtime
- Codigo para Mac: https://github.com/adventists-ai/sophon-realtime/tree/main/mac
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/adventists-ai/Sophon-Realtime
- API alojada (consola): https://api.adventists.ai/console/
- Documentacion de la API: https://api.adventists.ai/console/docs
- Issue de pruebas en Mac de 16 GB: https://github.com/adventists-ai/sophon-realtime/issues/1
