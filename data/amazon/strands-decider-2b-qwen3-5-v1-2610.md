# amazon/strands-decider-2B-qwen3.5-v1-2610

## Resumen

Strands decider es un modelo de decisión de ~2.000 millones de parámetros desarrollado por Amazon, publicado como adaptador LoRA (PEFT) sobre `Qwen/Qwen3.5-2B-Base`. A diferencia de un LLM generativo, no produce texto libre: elige entre un conjunto de opciones y puntúa elementos en una escala, y cada respuesta va acompañada de una confianza calibrada. Está diseñado específicamente para insertarse en flujos de trabajo agénticos donde hay que resolver decisiones acotadas sin invocar a un LLM completo.

La versión v1 (`strands-decider-2B-qwen3.5-v1-2610`) introduce una mezcla de datos equilibrada de 246.678 filas (aproximadamente el doble que hobson-v21), con nuevas tareas de código y de aplicación de reglas, y con la eliminación de las 20.000 filas de conjuntos cuyos términos restringen el uso comercial. El entrenamiento usa las distribuciones de salida de `google/gemma-4-31B-it` como objetivo cuando su respuesta coincide con la etiqueta dorada, mantiene un anclaje KL (peso 0,3) respecto al checkpoint publicado `strands-decider-2B-hobson-v19` y promedia tres ejecuciones con semillas 0, 1 y 2 (model soup).

El modelo resuelve decisiones tipadas —preguntas sí/no (`noul`), elección entre N opciones (`choice`) y puntuación en una escala (`score`)— y encaja en tareas como enrutamiento de modelos, selección de herramientas, verificación de argumentos, triaje, guardarraíles y evaluaciones automatizadas. Su relevancia actual radica en que reduce coste y latencia frente a delegar cada decisión rutinaria a un LLM grande dentro de un agente híbrido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5) con adaptador LoRA PEFT y cabeza de lectura que puntúa las opciones de una pregunta tipada (`noul`, `choice`, `score`); base: `Qwen/Qwen3.5-2B-Base` |
| Parámetros totales | No disponible de forma explícita; el nombre indica 2B y el modelo base Qwen3.5-2B-Base ronda los 2.000 millones de parámetros. El repositorio solo contiene el adaptador LoRA y la cabeza de lectura (0,2 GB) |
| Longitud de contexto | 4096 tokens como ventana de servicio en la evaluación JevBench (`w4096`); no se especifica la longitud máxima del modelo base |
| Tipos de cuantización | No disponible; el repositorio distribuye pesos en safetensors sin cuantizar (adaptador PEFT). Al fusionar el adaptador se pueden aplicar esquemas estándar (int8/int4) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre `Qwen/Qwen3.5-2B-Base`, un transformer decoder de ~2B parámetros. Sobre la representación del modelo base se añade una cabeza de lectura ("readout head") que puntúa cada opción de una pregunta tipada, lo que convierte la tarea en una clasificación sobre conjuntos de opciones restringidos en lugar de una generación autoregresiva. El entrenamiento se realizó con una mezcla equilibrada de 246.678 filas procedentes de datasets públicos de clasificación, NLI, QA, atención al cliente, código, función de llamada y preferencias humanas (entre otros: `SetFit/sst5`, `google/boolq`, `stanfordnlp/snli`, `hotpotqa/hotpot_qa`, `theatticusproject/cuad-qa`, `bigcode/commitpackft`, `glaiveai/glaive-function-calling-v2`, `nvidia/HelpSteer`, `Anthropic/hh-rlhf`, `tasksource/jev-typed-decisions`).

La receta de v1 incluye tres elementos destacables. Primero, la destilación desde `google/gemma-4-31B-it`: las distribuciones de salida del profesor se usan como objetivo allí donde su respuesta coincide con la etiqueta dorada. Segundo, un anclaje KL con peso 0,3 hacia el checkpoint publicado `strands-decider-2B-hobson-v19`, lo que preserva el comportamiento ya liberado en lugar de arrastrar el modelo hacia la base sin entrenar. Tercero, un model soup que promedia tres ejecuciones independientes de la misma receta (semillas 0, 1 y 2). Respecto a hobson-v21, v1 añade tareas de código y filas de aplicación de reglas (aplicar una política escrita a un caso) y descarta las filas de datasets que restringen el uso comercial.

## Capacidades

- Clasificación con conjuntos de opciones cerrados: preguntas sí/no (`noul`), elección de una opción entre N (`choice`) y puntuación en una escala (`score`).
- Confianza calibrada en cada respuesta, apta para umbrales y decisiones de enrutamiento.
- Selección de herramientas y enrutamiento de modelos dentro de agentes (decidir qué herramienta o qué LLM invocar).
- Verificación de argumentos antes de ejecutar una llamada a herramienta (validación de parámetros).
- Aplicación de reglas o políticas escritas a un caso concreto (rule application), incluidas en la mezcla de v1.
- Triaje y clasificación de textos cortos: intención, sentimiento, spam, Temas, moderación de comentarios.
- NLI y entailment, con buen rendimiento declarado en contractnli (0,878) y en tareas de contratos (`cuad-qa`, `maud`).
- QA y respuesta sobre contexto con rendimiento declarado en hotpotqa y musique (incluyendo casos sin respuesta).
- Evaluación de adecuación de respuestas generadas (`adequacy`), útil como juez automático ligero.
- Capacidad declarada sobre tareas de código y competiciones (`commitpackft`, `deepmind/code_contests`) a nivel de decisión/clasificación.
- No es un modelo generativo: no produce texto libre, resúmenes ni conversación abierta.

## Casos de uso

- Enrutamiento de modelos en una plataforma multi-LLM: dado un prompt entrante, el modelo decide (`choice`) qué modelo convocar según coste, dominio y complejidad, con una confianza que permite recurrir al LLM grande solo cuando baja el umbral.
- Selección de herramientas en un agente: el modelo puntúa cada herramienta disponible (`score`) para el siguiente paso, reduciendo llamadas innecesarias al LLM principal en bucles agénticos.
- Verificación de argumentos antes de invocar una API: clasifica si los parámetros extraídos por el LLM son válidos para el esquema de la herramienta (`noul`) y bloquea ejecuciones incorrectas.
- Triaje de tickets de soporte y atención al cliente: clasificación de intención y urgencia sobre textos cortos; su ventana de 4096 tokens y su tamaño de 2B permiten atender grandes volúmenes con coste bajo.
- Guardarraíles y moderación: clasificar comentarios y salidas del modelo (`google/civil_comments`, `measuring-hate-speech`) como permitidos o no antes de mostrarlos al usuario.
- Revisión de contratos: detección de cláusulas y de entailment entre fragmentos (`contractnli`, `cuad-qa`, `maud`) para preclasificar documentos legales antes de una revisión humana o de un LLM mayor.
- Evaluación automática de calidad de respuestas: usar la salida `score`/`noul` como juez ligero de adecuación en pipelines de evaluación continua de agentes.
- Aplicación de políticas escritas en procesos internos: dada una política y un caso, decidir la acción correspondiente (tarea de rule application incorporada en v1).
- Filtrado de spam y clasificación de mensajes cortos (`ucirvine/sms_spam`, `sealuzh/app_reviews`) en canales de mensajería o reseñas.

## Bench y rendimiento

Todos los resultados siguientes son los declarados por el autor en el `model-index` de la model card; ninguno está verificado de forma independiente (`verified: false`).

| Evaluación | Métrica | Resultado | N |
|---|---|---|---|
| JevBench public, servido a 4096 (`w4096`) | accuracy | 0,7792 | 180/231 |
| eval: held-out short tasks | accuracy | 0,653 | 6000 |
| eval: boardgame | accuracy | 0,81 | 900 |
| eval: contractnli | accuracy | 0,878 | 1026 |
| eval: hotpotqa (held out) | accuracy | 0,832 | 959 |
| eval: musique | accuracy | 0,882 | 1199 |
| eval: musique, answerable | accuracy | 0,876 | 599 |
| eval: musique, unanswerable | accuracy | 0,887 | 600 |
| eval: [4] adequacy_hs2 | accuracy | 0,709 | 234 |
| eval: [5] gen:adequacy | accuracy | 0,828 | 302 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas, ni comparaciones directas con modelos de su misma categoría.

## Requisitos de hardware

- Tamaño efectivo: ~2B parámetros del modelo base más el adaptador y la cabeza de lectura. En fp16 el modelo fusionado ocupa aproximadamente 4-5 GB de pesos; en int8, en torno a 2 GB; en int4, en torno a 1-1,5 GB (estimaciones de ingeniería a partir del tamaño, no cifras publicadas por el autor).
- GPU profesionales: A100, H100, L40S, A10G y similares con 16-24 GB son suficientes con margen para servir en fp16 con batching.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB) y RTX 3060 (12 GB) en fp16 con contextos moderados, y en tarjetas de 8 GB si se cuantiza a int8/int4.
- Despliegue: al tratarse de un adaptador PEFT con cabeza de clasificación, la vía natural es `transformers` + `peft` (o fusionar el adaptador). El soporte de vLLM o TGI como modelo de secuencia/clasificación depende de que la cabeza personalizada sea compatible con el servidor; llama.cpp y Ollama no están pensados para este tipo de adaptador de decisión.
- Latencia y throughput: no se publican cifras. Por el tamaño (~2B) y una ventana de servicio de 4096 tokens, es previsible una latencia del orden de milisegundos por lote en GPU moderna, muy por debajo de un LLM generativo de decenas de miles de millones de parámetros, pero es una estimación cualitativa y no un dato del autor.

## Comparativa con modelos similares

No hay en la información disponible comparativas frente a otros modelos de decisión tipada de terceros. La única comparación documentada es con la propia familia anterior.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| strands-decider-2B-qwen3.5-v1-2610 | ~2B (base Qwen3.5-2B) | 4096 (ventana de evaluación) | Apache 2.0 | HuggingFace (amazon y StrandsAgents) | Mezcla de 246.678 filas, destilación de gemma-4-31B-it, anclaje KL a v19, model soup de 3 semillas |
| strands-decider-2B-hobson-v19 | ~2B | No disponible | No disponible | HuggingFace | Checkpoint anterior; se usa como ancla KL (peso 0,3) en v1 |
| strands-decider-2B-hobson-v21 | ~2B | No disponible | No disponible | HuggingFace | Checkpoint anterior con la mitad de filas que v1 y sin las nuevas tareas de código y de aplicación de reglas |

## Limitaciones y advertencias

- Los resultados de benchmark están declarados por el autor y no están verificados de forma independiente (`verified: false`); deben tomarse como referencia, no como medida neutral.
- Varias evaluaciones (`hobson-internal`) proceden de conjuntos internos no publicados, por lo que no son reproducibles externamente.
- Es un modelo de decisión cerrada: no genera texto libre, no mantiene conversaciones abiertas ni produce resúmenes. Usarlo como LLM general daría resultados incorrectos.
- La confianza está calibrada según la receta de entrenamiento, pero no se documentan estudios de calibración fuera de la distribución de entrenamiento; conviene validar los umbrales en el dominio propio.
- Idiomas soportados: no disponible. La mayor parte de los datasets de entrenamiento son en inglés, lo que hace previsible un rendimiento inferior en castellano y otros idiomas; debe verificarse antes de usarlo en producción multilingüe.
- Tamaño limitado (~2B): en tareas de razonamiento complejo o de conocimiento amplio no puede competir con LLM grandes, y está pensado precisamente para descargarles las decisiones rutinarias.
- Riesgo de alucinación reducido al no generar texto, pero la elección forzada entre opciones puede producir respuestas incorrectas cuando ninguna opción es válida; debe preverse una clase de abstención o un umbral de confianza.
- Sesgos: la mezcla incluye datasets de moderación, sentimiento y preferencias que pueden arrastrar sesgos de anotación; no se documenta una auditoría de sesgos en la información disponible.
- Licencia Apache 2.0 sobre el adaptador, pero el uso queda sujeto también a la licencia del modelo base `Qwen/Qwen3.5-2B-Base`; verificar los términos de ambos antes de un despliegue comercial. La receta v1 ya excluye explícitamente filas de datasets que restringen el uso comercial.
- El repositorio solo contiene el adaptador y la cabeza de lectura; es necesario descargar el modelo base por separado para poder ejecutarlo.
- Existe un repositorio espejo (`StrandsAgents/...`) que el autor identifica como la ubicación principal; verificar cuál se usa como fuente para evitar divergencias de versión.

## Enlaces

- HuggingFace (Amazon): https://huggingface.co/amazon/strands-decider-2B-qwen3.5-v1-2610
- HuggingFace (ubicación principal, StrandsAgents): https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Checkpoint anterior usado como ancla: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19
- Repositorio de código de Strands Agents (referenciado en la model card a través de `docs/naming.md`): no disponible como URL directa en la información proporcionada
- Profesor de destilación: https://huggingface.co/google/gemma-4-31B-it
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (solo páginas comerciales de Amazon sin relación); no se han localizado papers, blogs ni demos adicionales en la información disponible.
