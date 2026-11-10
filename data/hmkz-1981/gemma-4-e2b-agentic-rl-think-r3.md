# hmkz-1981/gemma-4-e2b-agentic-rl-think-r3

## Resumen

Gemma-4-e2b-agentic-rl-think-r3 es un ajuste fino del modelo google/gemma-4-E2B-it, desarrollado por el usuario hmkz-1981, orientado a mejorar el cumplimiento de instrucciones, el uso de herramientas en varios pasos, la salida estructurada y el razonamiento con modo thinking. El modelo parte de una base de aproximadamente 5.100 millones de parametros (5.104.297.539 segun los pesos en safetensors) y se distribuye bajo licencia Apache 2.0, con soporte para japones e ingles.

El entrenamiento combina una fase de SFT con destilacion de pistas desde el propio modelo base y un modelo profesor (hmkz-1981/gemma-4-e4b-agentic-rl-think-r2), seguida de dos rondas de GRPO con LoRA r=32 fusionada. La innovacion principal reside en el uso de recompensas verificadas programaticamente y en la ejecucion real de herramientas durante el aprendizaje, lo que refuerza comportamientos como la prioridad de reglas del system prompt, la gestion de identificadores inexistentes, la deteccion de inyecciones y la aclaracion de peticiones ambiguas.

Es relevante ahora porque demuestra que un modelo pequeno de la familia Gemma 4 puede especializarse en comportamiento agentico mediante RL verificado, alcanzando mejoras notables en tareas de tool use (de 0.715 a 0.895 en la evaluacion propia) sin modificar los codificadores de imagen y audio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), con codificadores de imagen y audio del modelo base |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor documenta despliegue con vLLM) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-4-E2B-it |
| Tamano del repositorio | 10,2 GB |
| Metodo de ajuste | SFT con destilacion de pistas + GRPO (TRL, perdida tipo DAPO, LoRA r=32 fusionada) |
| Modo thinking | Si, entrenado con thinking habilitado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer Gemma 4-E2B-it, incluyendo sus codificadores de imagen y audio, que no han sido entrenados ni modificados en este ajuste. El proceso de post-entrenamiento se estructura en tres fases. La primera es un SFT con destilacion de pistas a partir del modelo base: se seleccionan unicamente respuestas que superan la verificacion y que no filtran las pistas, y los prompts que el modelo no logra resolver se completan con respuestas verificadas del modelo profesor hmkz-1981/gemma-4-e4b-agentic-rl-think-r2. La segunda y tercera fases aplican GRPO con TRL sobre problemas filtrados por dificultad, anadiendo en la tercera ronda practica de respuestas dentro de rango para corregir el exceso de rechazos.

La innovacion tecnica destacable es el uso de recompensas verificadas programaticamente y la ejecucion real de herramientas durante el entrenamiento, lo que permite al modelo aprender a manejar identificadores inexistentes, peticiones ambiguas, inyecciones de prompt y cambios de reglas en conversaciones multiturno. El modo thinking esta habilitado durante el entrenamiento y la cantidad de razonamiento puede controlarse mediante peticiones en dos etapas (truncar el pensamiento a un numero de tokens y continuar con la respuesta). El autor documenta un modo conversacional (`conversational_mode`) que produce respuestas cortas de dos frases como maximo y sin Markdown, orientado a lectura en voz alta.

## Capacidades

- Generacion de texto y conversacion multiturno en japones e ingles.
- Razonamiento con modo thinking entrenado y control del presupuesto de pensamiento mediante peticiones en dos etapas.
- Uso de herramientas (tool calling) en varios pasos, con ejecucion real durante el entrenamiento.
- Cumplimiento de instrucciones y jerarquia de instrucciones, incluyendo prioridad de reglas del system prompt y respeto a reglas revocadas.
- Salida estructurada (JSON, CSV y otros formatos) con verificacion programatica.
- Respuestas con fundamento (grounded answers) para escenarios tipo RAG.
- Aclaracion de peticiones ambiguas y gestion de identificadores inexistentes.
- Deteccion y manejo de inyecciones de prompt en el contexto de herramientas.
- Modo conversacional para respuestas breves sin Markdown.
- Capacidades de vision y audio heredadas del modelo base, aunque no entrenadas en este ajuste.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multiturno respetando reglas del system prompt y cambios de reglas a lo largo del dialogo, con una puntuacion de 0.888 en la tarea mt de la evaluacion propia.
- Agentes con tool calling en produccion: el soporte de `--enable-auto-tool-choice` en vLLM y el parser `gemma4` permiten integrarlo en pipelines de agentes que invocan funciones externas, con mejora de 0.715 a 0.895 en la tarea tool.
- Generacion de salida estructurada: util para extraer datos en JSON o CSV con verificacion programatica, con puntuaciones de 1.000 en struct y struct/csv en la evaluacion propia.
- Sistemas RAG con respuestas fundamentadas: la tarea rag alcanza 1.000 en las rondas 2 y 3, lo que lo hace adecuado para responder citando el contexto recuperado.
- Asistentes de voz o lectura: el modo conversacional con respuestas de dos frases y sin Markdown encaja en interfaces de sintesis de voz.
- Agentes que operan sobre APIs con identificadores: la mejora de 0.328 a 1.000 en tool/bad_id indica buen manejo de identificadores inexistentes en llamadas a herramientas.
- Filtrado y rechazo controlado: con el system prompt limitando el alcance, responde el 98 % de las preguntas en alcance y rechaza el 100 % de las fuera de tema.
- Entornos multilingues japones-ingles: adecuado para flujos de trabajo que alternan ambos idiomas, aunque con margen de mejora en cambio de idioma (ih/lang 0.744).

## Benchmarks y rendimiento

Evaluacion propia del autor (7 tareas x 40 preguntas, no usadas en entrenamiento):

| Tarea | base | sft | round2 | round3 |
|---|---|---|---|---|
| conv | 0.980 | 1.000 | 1.000 | 0.990 |
| if | 0.880 | 0.842 | 0.936 | 0.921 |
| ih | 0.700 | 0.875 | 0.975 | 0.975 |
| mt | 0.900 | 0.888 | 0.862 | 0.888 |
| rag | 0.915 | 0.918 | 1.000 | 1.000 |
| struct | 0.965 | 0.980 | 1.000 | 0.995 |
| tool | 0.715 | 0.795 | 0.845 | 0.895 |
| media | 0.865 | 0.900 | 0.946 | 0.952 |

Evaluacion focalizada en debilidades (25 preguntas por tipo):

| Tarea/tipo | base | sft | round2 | round3 |
|---|---|---|---|---|
| if/5c | 0.780 | 0.800 | 0.904 | 0.891 |
| ih/json | 0.000 | 0.960 | 1.000 | 1.000 |
| ih/lang | 0.160 | 0.400 | 0.720 | 0.744 |
| ih/prefix | 0.600 | 0.880 | 0.960 | 0.948 |
| mt/persist | 1.000 | 0.960 | 1.000 | 1.000 |
| mt/rule_change | 0.520 | 0.760 | 0.760 | 0.760 |
| struct/csv | 1.000 | 1.000 | 1.000 | 1.000 |
| tool/ambiguous | 0.000 | 0.280 | 0.320 | 0.880 |
| tool/bad_id | 0.328 | 1.000 | 1.000 | 1.000 |
| tool/fx_cross | 0.200 | 0.200 | 0.200 | 0.200 |
| tool/injection | 0.400 | 0.680 | 1.000 | 0.960 |
| tool/no_tool | 0.976 | 0.904 | 1.000 | 1.000 |

IFEval (lm-evaluation-harness, sin thinking):

| Metrica | base | trained |
|---|---|---|
| prompt_level_strict_acc | 0.778 | 0.780 |
| inst_level_strict_acc | 0.838 | 0.847 |
| prompt_level_loose_acc | 0.795 | 0.799 |
| inst_level_loose_acc | 0.856 | 0.862 |

Control de rechazos (system con alcance limitado, 20 preguntas por tipo):

| Tipo | base | trained |
|---|---|---|
| in-scope (debe responder) | 1.000 | 0.980 |
| off-topic (debe rechazar) | 1.000 | 1.000 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 5.100 millones de parametros, los pesos en safetensors ocupan aproximadamente 10,2 GB en precision de entrenamiento; las necesidades reales dependen de la cuantizacion, que el autor no documenta.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor documenta despliegue con vLLM, lo que requiere GPU compatibles con este framework.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el tamano del repositorio (10,2 GB) sugiere que podria caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: vLLM con `--enable-auto-tool-choice --tool-call-parser gemma4 --reasoning-parser gemma4`. No se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gemma-4-e2b-agentic-rl-think-r3 | 5.104.297.539 | no disponible | Apache 2.0 | Ajuste agentico con GRPO; evaluacion propia limitada |
| google/gemma-4-E2B-it | no disponible | no disponible | Apache 2.0 | Modelo base; puntuacion media 0.865 en la evaluacion del autor |
| hmkz-1981/gemma-4-e4b-agentic-rl-think-r2 | no disponible | no disponible | no disponible | Modelo profesor usado en la destilacion de pistas |

No se dispone de datos de benchmarks publicos comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La mayor parte de la evaluacion es propia del autor (excepto IFEval); las mejoras en entornos propios no implican necesariamente mejoras generales.
- La conversion de divisas a traves de JPY (dos obtenciones de tipo de cambio y calculo) sigue siendo debil, con 0.200 en la evaluacion focalizada.
- El cambio de idioma (ih/lang) alcanza 0.744, con margen de mejora en entornos multilingues.
- La gestion de cambios de reglas en conversaciones multiturno (mt/rule_change) se estanca en 0.760 desde la ronda 2.
- Los codificadores de imagen y audio no se han entrenado, por lo que las capacidades multimodales son las del modelo base sin mejoras.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo esta entrenado para responder con fundamento en RAG, pero no se documentan tasas de alucinacion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia del modelo base Gemma 4.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- El autor reconoce que el entrenamiento se realizo con colaboracion de Claude (Anthropic), lo que puede influir en el estilo de las respuestas.

## Enlaces

- Hugging Face: https://huggingface.co/hmkz-1981/gemma-4-e2b-agentic-rl-think-r3
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo profesor: https://huggingface.co/hmkz-1981/gemma-4-e4b-agentic-rl-think-r2
- Referencia citada por el autor: NVIDIA Nemotron-3.5-Bolt-E4B (no se proporciona URL en la informacion disponible)
- TRL: no se proporciona URL en la informacion disponible
- vLLM: no se proporciona URL en la informacion disponible
