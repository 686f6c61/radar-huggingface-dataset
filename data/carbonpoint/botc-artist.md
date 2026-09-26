# carbonpoint/botc-artist

## Resumen

botc-artist es un modelo de 135 millones de parametros (134.515.008 exactamente) desarrollado por carbonpoint y afinado a partir de HuggingFaceTB/SmolLM2-135M-Instruct. Su funcion es muy concreta: traducir una pregunta de si/no formulada por un jugador en el juego de mesa *Blood on the Clocktower* a una consulta en un pequeno lenguaje JSON que el motor del juego puede evaluar contra el estado real de la partida. No responde preguntas por si mismo; solo genera la consulta estructurada que el engine interpreta. Se utiliza dentro del proyecto [botc-automod](https://github.com/Carbonpoint/botc-automod) cuando el narrador automatizado contesta al rol Artist.

El modelo esta disenado para una tarea de extraccion de intencion en un dominio cerrado, con salida estrictamente estructurada. El prompt de sistema es fijo (`Translate the Blood on the Clocktower yes/no question into a JSON query.`) y la entrada combina el orden de jugadores, el preguntador, el mapa de personajes y la pregunta en lenguaje natural. La salida es un objeto JSON como `{"query":{"op":"is_team","player":"cw:me","team":"evil"}}` o bien `{"query":{"op":"unanswerable"}}` cuando la pregunta no encaja en el dominio.

Es relevante por su tamano reducido y su enfoque de ingenieria: demuestra que un modelo de 135M con solo 30.000 ejemplos generados y un LoRA puede alcanzar un 90-94% de aciertos en una tarea de structured output de nicho, corriendo en CPU a latencias de 0,3-0,8 segundos. La licencia Apache 2.0 y el formato GGUF de 145 MB lo hacen desplegable en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de SmolLM2-135M-Instruct; no detallada en la informacion proporcionada) |
| Parametros totales | 134.515.008 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits); otros no disponibles |
| Idiomas soportados | no disponible (el contenido del juego y el prompt estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`botc-artist.gguf`); el repo incluye `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct y se afina mediante LoRA de rango 64 aplicado a todas las capas lineales. El entrenamiento usa 30.000 ejemplos generados, 2 epocas y una tasa de aprendizaje de 2e-4. Los ejemplos combinan mundos de partida aleatorios (con 3.288 nombres de jugador reales e inventados, y las tres ediciones base del juego) con preguntas generadas a partir de plantillas y aumentadas con erratas, aperturas conversacionales y charla de mesa. Aproximadamente el 12% de las preguntas son etiquetadas como no respondibles (`unanswerable`).

La innovacion tecnica principal no esta en la arquitectura, sino en el diseno del pipeline: el modelo nunca responde directamente. Solo traduce la pregunta a una consulta JSON, el motor del juego la evalua contra el estado verdadero y el jugador confirma la lectura en lenguaje natural antes de recibir la respuesta. Esto reduce el riesgo de respuestas falsas, ya que una pregunta mal interpretada se puede reformular y no puede producir una respuesta incorrecta sin que el jugador vea antes la lectura del engine. En los ficheros publicados se incluye unicamente el GGUF de 8 bits (145 MB); no se detallan en la informacion proporcionada otros artefactos de entrenamiento ni el dataset.

## Capacidades

- Traduccion de preguntas de si/no en *Blood on the Clocktower* a consultas JSON estructuradas con operadores como `is_team`.
- Deteccion de preguntas fuera de dominio, emitiendo `{"query":{"op":"unanswerable"}}`.
- Manejo de entradas con erratas, aperturas coloquiales y charla de mesa gracias a la aumentacion de datos.
- Reconocimiento del contexto de partida proporcionado en el mensaje de usuario: orden de jugadores en sentido horario, jugador que pregunta, mapa de personajes.
- Salida estrictamente estructurada, adecuada para consumo directo por un motor de reglas.
- NO genera texto libre, NO responde preguntas, NO razona sobre el estado del juego, NO soporta tool calling general ni agentes multi-paso, NO tiene vision ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Automatizacion del rol Artist en partidas de *Blood on the Clocktower*: el modelo traduce la pregunta del jugador a una consulta JSON que botc-automod evalua contra el estado real de la partida, con confirmacion previa de la lectura por parte del jugador.
- Extraccion de intencion en dominios cerrados: sirve como plantilla para convertir lenguaje natural acotado en consultas estructuradas sobre un esquema fijo, replicando el patron en otros juegos o sistemas de reglas.
- Base para fine-tuning de structured output: por su tamano (135M) y su pipeline de datos sinteticos, es un punto de partida economico para tareas de text-to-JSON con vocabulario y gramatica restringidos.
- Despliegue en edge o CPU: con 145 MB en Q8_0 y latencias de 0,3-0,8 s en un CPU de 4 nucleos, es viable en servidores modestos o incluso en dispositivos sin GPU.
- Router de intenciones en asistentes de dominio restringido: dado un conjunto acotado de operaciones, el modelo decide a cual corresponde la consulta o si es no respondible.
- Evaluacion de robustez ante ruido textual: su desempeno con erratas y lenguaje coloquial lo hace util como referencia en pruebas de extraccion semantica bajo entradas imperfectas.
- Prototipado rapido de pipelines LLM+reglas: la separacion entre modelo (traduccion) y motor (evaluacion) es un patron reutilizable para sistemas donde no se puede tolerar alucinacion en la respuesta final.

## Benchmarks y rendimiento

Datos publicados en la model card para la tarea especifica de traduccion a JSON:

| Conjunto | Aciertos | Malinterpretadas | Rechazadas |
|---|---|---|---|
| Test generado (300; redaccion y nombres no vistos) | 90,0% | 4,0% | 6,0% |
| Escrito a mano (103; coloquial, erratas, 20 no respondibles) | 94,2% | 3,9% | 1,9% |

Notas del autor: algunos patrones de fallo del conjunto escrito a mano informaron plantillas de entrenamiento posteriores (no las preguntas en si), por lo que el test generado es la medida mas independiente. El modelo hermano de 360M obtiene 91,3% / 95,1%, con algo mas de malinterpretaciones (6,7% / 3,9%) y 2,5 veces la latencia. La latencia medida en un CPU de 4 nucleos con llama.cpp y el GGUF Q8_0 es de 0,3 a 0,8 segundos por pregunta (mediana). No hay datos de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 269 MB (134,5M parametros x 2 bytes); dato estimado, no publicado.
- VRAM estimada en Q8_0: 145 MB (tamano real del fichero publicado).
- VRAM estimada en Q4_K_M: en torno a 85-90 MB (estimacion a partir del numero de parametros).
- GPU recomendadas: no aplica; el modelo esta pensado para CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) lo ejecuta sin problema, pero es innecesaria.
- Cabe en cualquier GPU consumer, y en la practica corre en CPU.
- Opciones de despliegue: llama.cpp (validado en la model card con GGUF Q8_0), y cualquier runtime compatible con GGUF (Ollama, llama-cpp-python, servidores GGUF). vLLM y TGI no estan documentados para este modelo en la informacion disponible.
- Latencia observada: mediana de 0,3 a 0,8 segundos por pregunta en un CPU de 4 nucleos con llama.cpp.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Aciertos | Malinterpretadas | Latencia | Licencia |
|---|---|---|---|---|---|---|
| botc-artist | 135M | Traduccion pregunta a JSON (BotC) | 90,0% (gen.) / 94,2% (manual) | 4,0% / 3,9% | 0,3-0,8 s (CPU, Q8_0) | Apache 2.0 |
| Hermano 360M (mismo autor) | 360M | Traduccion pregunta a JSON (BotC) | 91,3% (gen.) / 95,1% (manual) | 6,7% / 3,9% | 2,5x la del 135M | no disponible |
| SmolLM2-135M-Instruct (base) | 135M | Asistente general | no disponible | no disponible | no disponible | Apache 2.0 |

El modelo hermano de 360M esta descrito por el autor dentro de la propia model card, pero no se proporciona su identificador ni su licencia en la informacion disponible. SmolLM2-135M-Instruct es el modelo base y no esta evaluado en esta tarea concreta.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: no funciona como asistente general ni responde preguntas; fuera del dominio *Blood on the Clocktower* su salida carece de sentido.
- Riesgo de malinterpretacion del 4,0-3,9% en los conjuntos evaluados; en esos casos el diseno mitiga el dano porque el jugador confirma la lectura del engine antes de recibir la respuesta.
- El autor advierte que el test escrito a mano informo parcialmente plantillas de entrenamiento posteriores, de modo que el test generado es la medida mas independiente.
- Datos no disponibles: longitud de contexto, idiomas soportados formalmente, sesgos conocidos y detalles de composicion del dataset.
- La salida depende del esquema JSON definido por el engine; cualquier cambio en el esquema requeriria reentrenamiento o ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el proyecto depende de un vocabulario y reglas especificos del juego *Blood on the Clocktower*, cuyo uso puede estar sujeto a las condiciones de sus titulares.
- No se han detectado descargas ni likes en el momento de la consulta; el modelo tiene adopcion practicamente nula y no hay validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/carbonpoint/botc-artist
- Repositorio del proyecto botc-automod: https://github.com/Carbonpoint/botc-automod
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
