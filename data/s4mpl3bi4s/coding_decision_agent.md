# S4MPL3BI4S/Coding_Decision_Agent

## Resumen

Coding_Decision_Agent es un modelo de decisión desarrollado por S4MPL3BI4S (James Utley PhD) a partir de un ajuste fino supervisado y por refuerzo sobre `convaiinnovations/laya`, un encoder ModernBERT-large de 421 millones de parámetros. No genera código ni texto libre: recibe un estado del dominio (un diff, una llamada a herramienta, una traza de agente o una petición de usuario) junto con un conjunto fijo de preguntas tipadas, y devuelve en una sola pasada hacia delante una etiqueta y una probabilidad calibrada para cada opción posible.

El problema que resuelve es la evaluación y el enrutado automático dentro de pipelines de agentes de código. En lugar de invocar a un LLM generativo como juez, este modelo clasifica decisiones concretas: calidad de un parche, si una llamada a herramienta es correcta, si una traza debe continuar o requerir revisión humana, o qué nivel de modelo conviene para una tarea. Al ser un clasificador de 421M parámetros, el coste computacional por decisión es muy inferior al de un juez generativo.

Es relevante porque el ajuste incorpora calibración explícita (ECE de 0,050 y Brier de 0,141 sobre el conjunto de test), lo que permite usar el umbral de confianza como criterio de enrutado en producción. El checkpoint se distribuye bajo licencia Apache-2.0, ocupa 0,8 GB y está orientado exclusivamente al idioma inglés, con una ventana de contexto de 2048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, familia ModernBERT-large |
| Parametros totales | 421.293.830 (aprox. 421 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (de los cuales `head_max_len` = 320 para las opciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya`, un encoder ModernBERT-large de 421M parametros. Sobre esa base se aplica RLCD (reinforcement learning from calibrated decisions): un gradiente de politica estilo GRPO contra reglas de puntuacion propias (proper scoring rules), combinado con entropia cruzada suave sobre la distribucion del profesor. La temperatura se ajusta de forma independiente por tipo de pregunta (las categorias `choice`, `score` y `noul`) sobre una particion reservada antes del entrenamiento, y el parametro `temperature_by_options` heredado del checkpoint base se descarta para que no enmascare el nuevo ajuste. Las etiquetas suaves provienen de senales del dataset (puntuaciones programaticas, votos multi-juez, resultados de tests y distribuciones gold) mezcladas con un profesor local `Qwen/Qwen3-32B-AWQ` servido con vLLM, sin APIs de pago.

Los datos de entrenamiento se reparten por familias: `agent_trace` usa `LocalLLaMA/typed-decisions` (subset `agent_trace_observability`) con probabilidades gold; `tool_call` combina `ServiceNow-AI/AgentJudgeBench` y `nvidia/When2Call`; `code_review` emplea `coseal/CodeUltraFeedback` y `nebius/SWE-agent-trajectories`; y `routing` usa `withmartian/routerbench` y, opcionalmente, `ynulihao/LLMRouterBench`. El dataset de casos generado por esta ejecucion es `S4MPL3BI4S/coding-decision-cases`. El codigo de entrenamiento se publica bajo licencia MIT.

## Capacidades

- Clasificacion de decisiones tipadas: devuelve etiqueta y probabilidad calibrada por opcion en una sola pasada, sin generar texto.
- Familia `code_review`: evalua `code_quality` (0-4), `instruction_followed` (no/yes), `likely_correct` (no/yes) y `merge_action` (accept / request_changes / needs_tests / reject).
- Familia `tool_call`: evalua `tool_selection`, `parameter_structure`, `sequence_accuracy`, `query_coverage` (0-2), `should_call_tool` (call_tool / ask_followup / answer_directly / cannot_answer) y `call_verdict` (execute / fix_args / wrong_tool / abstain).
- Familia `agent_trace`: evalua `action` (continue / observe / human_review / stop), `needs_review` (no/yes), `outcome` (success / partial / failure / harmful), `risk` (0-3) y `urgency` (0-3).
- Familia `routing`: estima `model_tier` (small_fast / mid / frontier / reasoning), `task_difficulty` (0-3) y `skill` (code_edit / debug / write_tests / refactor / explain / shell_ops / research / plan).
- Calibracion de confianza: expone un campo `answer_confidence` calibrado, apto para umbrales de decision, distinto del campo `confidence` de tipo entropia.
- Integracion con la libreria `laya` mediante `laya.load(...)` y el wrapper `CodingDecisionAgent`, con metodos como `grade_code` y `route_model`.
- Soporte multilingue: no disponible; el modelo esta entrenado y evaluado unicamente en ingles.

## Casos de uso

- Puerta de calidad en CI/CD: antes de fusionar un parche, el modelo recibe el diff y los resultados de tests y devuelve `merge_action` con su probabilidad; si `merge_action` es `request_changes` o `needs_tests` y la confianza calibrada supera el umbral, se bloquea la fusion automaticamente.
- Validacion de llamadas a herramientas en agentes: cada `tool_call` propuesto por un agente se clasifica con `call_verdict` y `should_call_tool`, de forma que las llamadas con veredicto `wrong_tool` o `fix_args` se desvian a revision antes de ejecutarse.
- Supervision de trazas de agentes: sobre flujos multi-paso, la familia `agent_trace` decide entre continuar, observar, escalar a revision humana o detener, usando `risk` y `urgency` para priorizar la cola de supervision.
- Enrutado de coste por dificultad: la familia `routing` asigna `model_tier` y `skill` a cada peticion, permitiendo enviar tareas sencillas a modelos pequenos y reservar los modelos frontier para tareas con `task_difficulty` alto.
- Evaluacion automatica de asistentes de codigo: `code_quality` e `instruction_followed` permiten puntuar respuestas de otros modelos sin emplear un juez generativo costoso, util para construir leaderboards internos o filtros de destilacion.
- Moderacion de acciones peligrosas: la combinacion de `outcome` = harmful y `risk` alto en `agent_trace` sirve como senal de alerta para abortar una ejecucion autonoma antes de que cause dano.
- Filtrado previo en pipelines RAG o de datos: `query_coverage` y `should_call_tool` pueden usarse para decidir si una consulta requiere recuperacion externa o puede responderse directamente.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test reservado (metricas globales):

| Metrica | Valor |
|---|---|
| Accuracy (argmax vs. gold) | 0.781 |
| Soft accuracy (producto punto gold/predicha) | 0.617 |
| Brier (menor es mejor) | 0.141 |
| ECE (menor es mejor) | 0.050 |
| Score MAE | 0.287 |

Desglose por particion (slice):

| Slice | n | Accuracy | Soft acc | Brier | ECE |
|---|---:|---:|---:|---:|---:|
| agent_trace | 500 | 0.738 | 0.447 | 0.046 | 0.176 |
| code_review | 13905 | 0.601 | 0.438 | 0.205 | 0.032 |
| routing | 2121 | 0.645 | 0.434 | 0.163 | 0.101 |
| tool_call | 25031 | 0.894 | 0.735 | 0.106 | 0.059 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es generativo y no aplica ese tipo de evaluacion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,85 GB en fp16/bf16 (el repositorio pesa 0,8 GB), en torno a 1,7 GB en fp32 y unos 0,42 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; se puede ejecutar comodamente en NVIDIA T4, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU para cargas ligeras.
- Opciones de despliegue: `transformers` (libreria declarada), `laya` (wrapper oficial) y, segun la model card, vLLM para servir el profesor; el soporte de llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tarea | Disponibilidad |
|---|---|---|---|---|---|
| Coding_Decision_Agent | 421 M | 2048 | Apache-2.0 | Clasificacion de decisiones de agentes de codigo | HuggingFace (`S4MPL3BI4S/Coding_Decision_Agent`) |
| convaiinnovations/laya (modelo base) | 421 M (ModernBERT-large) | no disponible | Apache-2.0 | Modelo de decision generico con preguntas tipadas | HuggingFace |
| Jueces generativos tipo `Qwen/Qwen3-32B-AWQ` | ~32 000 M | no disponible | no disponible | Evaluacion generica como LLM-as-judge | HuggingFace / vLLM |

No se dispone de datos de benchmarks comparativos con otros clasificadores de decision de agentes de codigo en la informacion proporcionada; la comparacion directa con alternativas de la misma categoria no esta disponible.

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens: los diffs y las listas de herramientas se compactan antes de puntuarse, y los parches grandes se truncan alrededor de las lineas modificadas.
- Idioma: unicamente ingles; no hay soporte multilingue declarado, lo que puede degradar el rendimiento en estados o peticiones en otros idiomas.
- Riesgo de alucinacion: al ser un clasificador no genera texto, pero sus etiquetas pueden ser incorrectas; la particion `code_review` muestra la precision mas baja (0,601) y el Brier mas alto (0,205), por lo que es la familia menos fiable.
- Las preguntas de si/no se implementan como items de tipo `choice` de dos opciones con claves `no` y `yes`, no como `noul` de Laya, para evitar que el checkpoint en ingles siga las etiquetas de opcion en lugar del estado.
- Maximo de 8 opciones por pregunta; las etiquetas de `skill` y `model_tier` son deliberadamente gruesas y no representan una taxonomia fina.
- La calibracion esta ajustada al estilo de etiquetas de este dataset; es imprescindible medir el ECE sobre trafico propio antes de usar la confianza como puerta de produccion.
- Para el enrutado hay que usar `answer_confidence` (la calibrada) y no el campo `confidence` de tipo entropia; un umbral de 0,7 es un punto de partida razonable, que debe validarse con trazas propias.
- El sesgo de los datos de entrenamiento (votos de jueces, resultados de tests, distribuciones gold de los datasets citados) puede propagarse a las decisiones del modelo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un derivado de `convaiinnovations/laya` conviene revisar las condiciones de ese checkpoint base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/S4MPL3BI4S/Coding_Decision_Agent
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Perfil del autor: https://huggingface.co/S4MPL3BI4S
- Dataset de casos: https://huggingface.co/datasets/S4MPL3BI4S/coding-decision-cases
- Otro modelo del autor: https://huggingface.co/S4MPL3BI4S/gemma4-coding-agent
- Repositorio de codigo de entrenamiento (MIT): enlazado desde la barra lateral de la model card, no disponible en la informacion proporcionada.
