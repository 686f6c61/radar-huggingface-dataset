# amazon/strands-decider-26B-A4B-gemma4-v1-2610

## Resumen

strands-decider-26B-A4B-gemma4-v1-2610 es un adaptador LoRA publicado por Amazon sobre el modelo base google/gemma-4-26B-A4B-it, orientado a la toma de decisiones tipadas ("typed-decisions") y a la clasificacion. No es un modelo generativo de proposito general: se distribuye como adaptador PEFT (0,3 GB de repositorio) que se monta sobre los pesos del modelo base, y su pipeline declarado en HuggingFace es text-classification.

El modelo pertenece a la familia interna "strands-decider" y su etiquetado sugiere que actua como componente de decision dentro de una arquitectura de agentes: recibe una entrada (una tarea, una respuesta candidata o un fragmento de codigo) y emite una decision calibrada y tipada en lugar de texto libre. Los tags "calibration" y "typed-decisions" apuntan a ese uso como modulo de enrutado, verificacion o validacion dentro de pipelines mayores.

El modelo base, gemma-4-26B-A4B-it, sigue la convencion de nombres de Google para arquitecturas MoE, lo que implica 26.000 millones de parametros totales y aproximadamente 4.000 millones activos por token, con ajuste instruccional. La ficha se publica con licencia Apache 2.0, cero descargas y cero likes en el momento de la consulta, y una fecha de creacion declarada de 2026-10-09.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE del modelo base gemma-4-26B-A4B-it |
| Parametros totales | 26B en el modelo base (segun convencion de nomenclatura "26B-A4B"); parametros del adaptador no disponibles |
| Parametros activos | Aproximadamente 4B por token en el modelo base (segun nomenclatura "A4B"); no confirmado en la informacion disponible |
| Longitud de contexto | No disponible. La evaluacion declarada se sirvio a 4096 tokens (config "w4096") |
| Tipos de cuantizacion | No disponible. El repositorio contiene pesos en safetensors (adaptador LoRA) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base google/gemma-4-26B-A4B-it, no un modelo completo. El repositorio ocupa 0,3 GB, coherente con un conjunto de matrices de bajo rango mas los ficheros de configuracion de PEFT, y no con pesos completos de un modelo de 26.000 millones de parametros. La relacion con el modelo base esta declarada explicitamente como base_model_relation: adapter.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO sobre el adaptador. La model card enumera un conjunto amplio de datasets de ajuste que cubren clasificacion de topicos y noticias (ag_news, dbpedia_14, yahoo_answers_topics), intenciones conversacionales (banking77, clinc_oos), analisis de sentimiento y adecuacion (yelp_review_full, sst5, HelpSteer2, pavlick-formality-scores), moderacion (civil_comments), inferencia de lenguaje natural (glue, boolq, paws, vitamin_c, ruletaker), razonamiento multi-salto (PubMedQA, Boardgame-QA) y un bloque sustancial de codigo (commitpackft, codereviewer, juliet_test_suite_c_1_3, deepmind/code_contests, cubert_ETHPy150Open). El objetivo declarado en los tags es producir decisiones tipadas y calibradas, lo que encaja con un entrenamiento supervisado sobre tareas de clasificacion heterogeneas. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Emision de decisiones tipadas y calibradas sobre entradas de texto, en lugar de generacion de texto libre.
- Clasificacion de texto en dominios multiples: noticias, consultas bancarias, intenciones de usuario, sentimiento, toxicidad y formalidad.
- Evaluacion de adecuacion y calidad de respuestas generadas (tareas "adequacy" sobre HelpSteer2).
- Razonamiento sobre contextos multi-salto y verificacion de respuesta: resultados declarados en HotpotQA y MuSiQue, incluyendo el subconjunto de preguntas no respondibles.
- Analisis de codigo: deteccion de tipos de bug (operandos intercambiados, uso incorrecto de variables, operador binario erroneo), identificacion de CWE, correspondencia entre docstring y funcion y prediccion de tipo de excepcion.
- Evaluacion de mensajes de commit y de soluciones candidatas a problemas de programacion.
- Inferencia de lenguaje natural (NLI) y deteccion de implicacion o contradiccion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita, si bien el nombre "decider" y el uso previsto apuntan a un rol de decision dentro de un agente; no se detalla el mecanismo.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Enrutado de peticiones en un agente: dado un mensaje de usuario, el modelo emite una decision tipada sobre que herramienta o subagente debe atender la peticion, aprovechando su entrenamiento sobre intenciones (banking77, clinc_oos) y su enfasis en calibracion.
- Moderacion de contenido en plataformas: clasificacion de comentarios por nivel de toxicidad o civilidad, apoyandose en el ajuste declarado sobre google/civil_comments y en la salida calibrada.
- Triage de revision de codigo: dado un fragmento de pull request o un diff, decidir si contiene un bug del tipo operando intercambiado, variable mal usada o operador incorrecto, y clasificar la categoria CWE aplicable, con precisiones declaradas superiores al 85% en varias de estas tareas.
- Verificacion de respuestas en un sistema RAG: comprobar si la respuesta generada por otro modelo es adecuada respecto al contexto recuperado, usando el adaptador como juez binario o categorico; el resultado declarado en tareas de adecuacion (0,911 en gen:adequacy) respalda este uso.
- Filtrado de preguntas no respondibles: decidir si el contexto proporcionado permite responder a la pregunta antes de invocar al modelo generativo, aprovechando el 0,928 declarado en el subconjunto no respondible de MuSiQue.
- Analisis de sentimiento y clasificacion tematica a escala: procesar de forma masiva resenas, tickets o noticias con una etiqueta tipada y una puntuacion de confianza, integrable en pipelines de datos.
- Clasificacion de commits y documentacion: generar o validar decisiones sobre mensajes de commit y correspondencia docstring-funcion, con el 0,989 declarado en commit_message.
- Validacion de soluciones en plataformas de evaluacion de codigo: el rendimiento declarado en correct_solution es notablemente inferior (0,562), por lo que este caso de uso debe abordarse con cautela y con umbrales de confianza explicitos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card. Todos aparecen marcados como `verified: false` y no han sido verificados de forma independiente.

| Evaluacion | Tipo | Precision | n |
|---|---|---|---|
| JevBench public, servido a 4096 | jevbench | 0,8961 | 207/231 |
| Held-out short tasks | hobson-internal | 0,708 | 6000 |
| Boardgame | hobson-internal | 0,869 | 900 |
| ContractNLI | hobson-internal | 0,870 | 1026 |
| HotpotQA (held out) | hobson-internal | 0,897 | 959 |
| MuSiQue | hobson-internal | 0,922 | 1199 |
| MuSiQue, respondible | hobson-internal | 0,917 | 599 |
| MuSiQue, no respondible | hobson-internal | 0,928 | 600 |
| Adequacy (HelpSteer2) | hobson-internal | 0,808 | 234 |
| gen:adequacy | hobson-internal | 0,911 | 302 |
| code/bug_swapped_operands | hobson-internal | 0,921 | 89 |
| code/bug_variable_misuse | hobson-internal | 0,854 | 89 |
| code/bug_wrong_binary_operator | hobson-internal | 0,775 | 89 |
| code/commit_message | hobson-internal | 0,989 | 89 |
| code/correct_solution | hobson-internal | 0,562 | 89 |
| code/cwe_choice | hobson-internal | 0,933 | 89 |
| code/docstring_match | hobson-internal | 0,955 | 89 |
| code/exception_type | hobson-internal | 0,899 | 89 |
| code/exec_input | hobson-internal | 0,796 | 142 |
| code/exec_output | hobson-internal | 0,834 | 662 |

No se han publicado comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible, ni resultados del modelo base sin el adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador es ligero, pero requiere cargar el modelo base completo de 26B parametros. Estimaciones orientativas segun el tamano declarado: en BF16, aproximadamente 52 GB; en cuantizacion de 8 bits, aproximadamente 26-30 GB; en 4 bits, aproximadamente 14-18 GB. Son calculos derivados del recuento de parametros, no cifras publicadas.
- GPU recomendadas: para BF16, GPU de 80 GB como A100 o H100. Para cuantizacion de 8 bits, GPU de 40-48 GB como A6000 o L40S. Para 4 bits, tarjetas de 24 GB como RTX 4090 o L4.
- Cabe en GPU de consumo: con cuantizacion de 4 bits, es plausible en una RTX 4090 (24 GB) o RTX 3090, aunque sin confirmacion oficial en la informacion disponible.
- Opciones de despliegue: al ser un adaptador PEFT, requiere un runtime compatible con PEFT, como Transformers con PEFT, vLLM con soporte LoRA, TGI o similar. El despliegue en llama.cpp u Ollama exigiria convertir el adaptador y cuantizar el modelo base a GGUF; no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay informacion disponible sobre modelos directamente comparables en cuanto a parametros, contexto, rendimiento y licencia. La unica comparacion documentada es con el propio modelo base google/gemma-4-26B-A4B-it, para el cual la informacion proporcionada no incluye resultados de benchmarks, por lo que no es posible cuantificar la ganancia aportada por el adaptador.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| strands-decider-26B-A4B-gemma4-v1-2610 | Adaptador sobre 26B (aprox. 4B activos) | No disponible (evaluado a 4096) | Apache 2.0 | HuggingFace, 0 descargas |
| google/gemma-4-26B-A4B-it (modelo base) | 26B (aprox. 4B activos) | No disponible | No disponible en esta informacion | No disponible |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Todos los resultados de benchmarks estan marcados como no verificados (`verified: false`) y proceden del propio autor. No hay validacion independiente.
- Varias evaluaciones clave son conjuntos internos ("hobson-internal") cuyo contenido, metodologia de construccion y posible solapamiento con los datos de entrenamiento no se detallan. El riesgo de contaminacion no puede descartarse.
- El rendimiento en la tarea code/correct_solution es de 0,562, cercano al azar en un escenario binario, y el de held-out short tasks es de 0,708. Esto indica que el adaptador no es fiable de forma uniforme en todas las tareas.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento fuera de los dominios de entrenamiento. La ausencia de esta informacion impide evaluar riesgos de sesgo sistematico.
- Riesgo de alucinacion: al tratarse de un modelo de decision que no genera texto libre, el riesgo se traslada a decisiones erroneas con alta confianza; no hay informacion sobre la calibracion real de las probabilidades emitidas.
- Licencia Apache 2.0 en el adaptador, lo que permite uso comercial de este artefacto, pero el uso queda sujeto a los terminos del modelo base (google/gemma-4-26B-A4B-it), que no se detallan en la informacion proporcionada y deben verificarse por separado.
- El repositorio tiene cero descargas y cero likes, y la fecha de creacion declarada (2026-10-09) resulta inusual; conviene tratar la ficha como material reciente y sin validacion de la comunidad.
- Limitacion practica de despliegue: el adaptador no es autonomo, requiere el modelo base completo, lo que impone los requisitos de memoria del apartado anterior.
- No hay informacion sobre longitud de contexto real, por lo que no puede confirmarse el comportamiento mas alla de los 4096 tokens usados en la evaluacion.

## Enlaces

- HuggingFace: https://huggingface.co/amazon/strands-decider-26B-A4B-gemma4-v1-2610
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Resultados de busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repos o demos) en la informacion disponible.
