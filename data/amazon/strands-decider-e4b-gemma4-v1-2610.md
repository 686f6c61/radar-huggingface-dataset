# amazon/strands-decider-E4B-gemma4-v1-2610

## Resumen

strands-decider-E4B-gemma4-v1-2610 es un adaptador LoRA (PEFT) publicado por Amazon sobre el modelo base google/gemma-4-E4B-it, orientado a la clasificación de texto y a la emisión de decisiones tipadas ("typed decisions"). No es un modelo de generación autónoma, sino un cabezal de decisión ajustado que se apoya en las representaciones del modelo base para resolver tareas de etiquetado sobre conjuntos muy heterogéneos: desde detección de spam y análisis de sentimiento hasta revisión de código, detección de bugs, atribución en contratos o clasificación de intenciones.

El propósito del modelo es servir como componente de decisión determinista dentro de un pipeline mayor, de ahí el nombre "strands-decider" y la etiqueta calibration. En lugar de producir texto libre, el sistema devuelve una clase o decisión calibrada, lo que lo hace apto para integrarse como etapa de enrutado, moderación, verificación o evaluación automática. El pipeline declarado en HuggingFace es text-classification y la librería asociada, peft.

El repo ocupa 0,5 GB, lo que corresponde al adaptador LoRA y no al modelo completo. Se distribuye bajo licencia Apache 2.0. No se especifican en la información disponible ni la arquitectura interna, ni el número de parámetros totales, ni la longitud de contexto del modelo base, por lo que estos datos se marcan como no disponibles. Tampoco consta ningún resultado verificado de forma independiente: todas las métricas publicadas son declaradas por el autor (verified: false).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA/PEFT sobre google/gemma-4-E4B-it) |
| Parametros totales | no disponible (el adaptador ocupa 0,5 GB en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA montado sobre google/gemma-4-E4B-it, según declara la propia model card con base_model_relation: adapter. No se aporta información sobre el rango de LoRA, los módulos objetivo, la composición exacta del dataset de ajuste ni la técnica de alineación empleada (RLHF, DPO u otra). Tampoco se detalla la arquitectura interna del modelo base más allá de su identificador.

La lista de datasets asociados en la model card es amplia y cubre dominios muy distintos: clasificación de noticias y temas (ag_news, dbpedia_14, yahoo_answers_topics), intenciones y atención al cliente (banking77, clinc_oos), spam (sms_spam), moderación básica (civil_comments), tareas de lenguaje natural (glue, boolq, paws, vitamin_c, sst5, yelp_review_full, app_reviews, formality-scores), razonamiento y QA multi-salto (ruletaker, Boardgame-QA, hotpotqa, musique, PubMedQA), preferencias y calidad de respuesta (HelpSteer2), y un bloque relevante de código y seguridad (cubert_ETHPy150Open, commitpackft, codereviewer, juliet_test_suite_c_1_3, code_contests). Esta selección indica que el adaptador se ha entrenado para actuar como clasificador multiuso y como evaluador de decisiones, incluyendo la detección de patrones de bug y la verificación de soluciones.

## Capacidades

- Clasificación de texto multietiqueta y tipada sobre entradas cortas y largas ("typed decisions").
- Decisiones calibradas, aptas para umbrales de confianza en producción.
- Etiquetado de temas y categorías (noticias, DBpedia, Yahoo Answers).
- Detección de intenciones en dominios de atención al cliente (banking77, clinc_oos).
- Moderación y análisis de toxicidad básica (civil_comments).
- Análisis de sentimiento y valoraciones (yelp_review_full, sst5, app_reviews).
- Detección de spam (sms_spam).
- Inferencia de lenguaje natural (glue, boolq, paws).
- Razonamiento deductivo y reglas (ruletaker, Boardgame-QA).
- QA multi-salto y atribución (hotpotqa, musique, contractnli).
- Clasificación de calidad de respuesta de QA biomédica (PubMedQA) y de adecuación de respuestas (HelpSteer2).
- Tareas sobre código: mensajes de commit, coincidencia de docstrings, elección de CWE, tipo de excepción, entrada y salida de ejecución, y detección de bugs concretos (operandos intercambiados, uso indebido de variables, operador binario incorrecto).
- Soporte de tool calling, agentes y modo "thinking": no disponible en la información proporcionada.
- Capacidades multimodales: no disponibles.

## Casos de uso

- Enrutado de intenciones en atención al cliente: el modelo puede clasificar la intención de una consulta entrante (dominio banking77/clinc_oos) y dirigirla al flujo o al agente adecuado, aprovechando que devuelve decisiones tipadas y calibradas en lugar de texto libre.
- Moderación de comentarios: clasificación de comentarios en categorías de toxicidad o civismo (civil_comments) para aplicar políticas automáticas en foros, redes o secciones de comentarios.
- Triaje de spam: detección de mensajes no deseados (sms_spam) en pasarelas de mensajería o formularios de contacto.
- Clasificación temática de contenidos: etiquetado automático de artículos y publicaciones (ag_news, dbpedia_14, yahoo_answers_topics) para indexado, recomendación o taxonomía editorial.
- Análisis de sentimiento y reseñas: clasificación de valoraciones de producto, aplicaciones o restaurantes (yelp_review_full, app_reviews, sst5) para paneles de calidad y alertas tempranas.
- Verificación de atribución en contratos: clasificación de relaciones entre cláusulas y evidencias (contractnli) para asistentes de revisión legal que señalan coincidencias o contradicciones.
- QA con verificación de suficiencia: determinar si una pregunta es respondible o no (musique answerable/unanswerable) antes de invocar un modelo generativo, reduciendo alucinaciones.
- Revisión automática de código: detección de patrones de bug concretos, elección de tipo de CWE y comprobación de docstrings (juliet_test_suite_c_1_3, codereviewer) como paso previo en pipelines de revisión o CI.
- Evaluación de calidad de respuestas: uso de las tareas de adecuación (HelpSteer2) para puntuar salidas de otros modelos en sistemas de evaluación automática (LLM-as-judge acotado a clasificación).

## Benchmarks y rendimiento

Todos los resultados proceden del model-index de la model card y están marcados con `verified: false`, es decir, son declarados por el autor y no verificados de forma independiente. La tarea declarada en todos los casos es text-classification y la métrica es accuracy.

| Dataset / evaluacion | Configuracion | Accuracy | Muestra |
|---|---|---|---|
| JevBench public, served at 4096 | w4096 | 0.8095 | 187/231 |
| eval: held-out short tasks | - | 0.684 | n=6000 |
| eval: boardgame | - | 0.844 | n=900 |
| eval: contractnli | - | 0.872 | n=1026 |
| eval: hotpotqa (held out) | - | 0.829 | n=959 |
| eval: musique | - | 0.922 | n=1199 |
| eval: musique, answerable | - | 0.922 | n=599 |
| eval: musique, unanswerable | - | 0.923 | n=600 |
| eval: [4] adequacy_hs2 | - | 0.786 | n=234 |
| eval: [5] gen:adequacy | - | 0.838 | n=302 |
| eval: [6] code/bug_swapped_operands | - | 0.843 | n=89 |
| eval: [6] code/bug_variable_misuse | - | 0.73 | n=89 |
| eval: [6] code/bug_wrong_binary_operator | - | 0.719 | n=89 |
| eval: [6] code/commit_message | - | 0.989 | n=89 |
| eval: [6] code/correct_solution | - | 0.371 | n=89 |
| eval: [6] code/cwe_choice | - | 0.933 | n=89 |
| eval: [6] code/docstring_match | - | 0.955 | n=89 |
| eval: [6] code/exception_type | - | 0.787 | n=89 |
| eval: [6] code/exec_input | - | 0.782 | n=142 |
| eval: [6] code/exec_output | - | 0.775 | n=662 |
| eval: [6] code/needle_function | - | no disponible (truncado en la info) | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K, etc.) para este adaptador.

## Requisitos de hardware

- El repositorio pesa 0,5 GB y contiene únicamente el adaptador LoRA en safetensors; para inferir es imprescindible cargar también el modelo base google/gemma-4-E4B-it.
- VRAM estimada para el modelo base: no disponible con precisión, ya que no se especifican sus parámetros totales ni activos. Como referencia aproximada, un modelo con nomenclatura "E4B" apunta a un orden de parámetros activos en torno a miles de millones, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería peft sobre el modelo base; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos equivalentes en la información proporcionada. La model card no incluye una comparativa con otros adaptadores o clasificadores.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amazon/strands-decider-E4B-gemma4-v1-2610 | no disponible (adaptador LoRA) | no disponible | ver tabla de benchmarks (declarados por el autor) | apache-2.0 | HuggingFace, 0 descargas |
| google/gemma-4-E4B-it (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clasificacion comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Todos los resultados de benchmarks están declarados por el autor con `verified: false`; ninguno ha sido validado de forma independiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de adopción y validación por parte de la comunidad.
- La información de la model card está truncada en el propio model-index (la última entrada, eval: [6] code/needle_function, aparece incompleta).
- El rendimiento en la tarea code/correct_solution es notablemente bajo (0,371 de accuracy con n=89), lo que sugiere que la verificación de soluciones correctas no es fiable y no debería usarse sin revisión humana.
- Al ser un adaptador LoRA, cualquier cambio en el modelo base google/gemma-4-E4B-it puede degradar el comportamiento; la reproducibilidad depende de la versión exacta de dicho modelo.
- No se especifican idiomas soportados, por lo que la cobertura multilingüe es desconocida; muchas de las tareas de entrenamiento (ag_news, sst5, etc.) son predominantemente en inglés.
- Riesgo de alucinación: aunque la salida es de clasificación y no generativa, la calibración de probabilidades no está garantizada ni verificada, y los umbrales de decisión deberían validarse en cada dominio.
- Sesgos conocidos: no disponibles; los datasets incluidos (civil_comments, HelpSteer2, etc.) pueden introducir sesgos propios de su composición, pero no se documenta ningún análisis al respecto.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero el uso comercial depende también de la licencia del modelo base google/gemma-4-E4B-it, que debe verificarse por separado.

## Enlaces

- HuggingFace: https://huggingface.co/amazon/strands-decider-E4B-gemma4-v1-2610
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
