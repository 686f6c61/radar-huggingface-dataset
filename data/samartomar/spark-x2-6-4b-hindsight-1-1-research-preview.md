# samartomar/spark-x2.6-4b-hindsight-1.1-research-preview

## Resumen

Spark-x2.6-4b-hindsight-1.1-research-preview es un adaptador LoRA (rsLoRA) de rango 128 publicado por el usuario samartomar sobre el modelo base XHToken/Spark-X2.6-4B, un transformer denso de 4.112 millones de parametros. El adaptador esta especializado en tareas de memoria estructurada para el sistema Hindsight (Vectorize), un motor de memoria de agentes que extrae hechos, consolida observaciones, actualiza paginas de memoria, retrae afirmaciones retiradas y produce respuestas estructuradas en JSON. La release incluye el adaptador PEFT, cuatro exportaciones GGUF para llama.cpp y un gateway compatible con la API de OpenAI (`spark_prod_server.py`).

El modelo resuelve un problema concreto: convertir un LLM generalista de 4B en un ejecutor fiable de tareas de memoria con salida estructurada verificable. Segun la model card, el adaptador se entrena sobre cuatro especialistas destilados y una cadena de iteraciones (v1.0 con 7.606 ejemplos, C3 con 1.298 + 273 ejemplos adicionales), alcanzando una tasa de aprobacion del 99,0% sobre 495 casos de desarrollo frente al 25,1% del modelo base, medido con el rule-checker v5 incluido en el repositorio.

Es relevante ahora porque demuestra que un modelo de 4B con un adaptador pequeno (259M parametros, 1,04 GB) puede igualar o superar a modelos mucho mayores en tareas de extraccion y consolidacion de memoria, y porque empaqueta todo el stack de inferencia (pesos, cuantizaciones, gateway y verificadores) en un unico repositorio reproducible. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Spark-X2.6-4B) + adaptador LoRA rsLoRA de rango 128 |
| Parametros totales | 4.112.079.360 (modelo base); adaptador: 259M parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF); adaptador en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (cuatro variantes) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 4.112 millones de parametros (XHToken/Spark-X2.6-4B, revision `64ca8f2a295b`). Sobre el se aplica un adaptador rsLoRA de rango 128 entrenado desde cero en BF16 puro, sin partir del checkpoint de la version anterior (V14). El entrenamiento combina cuatro especialistas, un proceso de destilacion, una primera version v1.0 con 7.606 ejemplos y una fase C3 con 1.298 + 273 ejemplos adicionales. La cadena de entrenamiento cubre 11 roles de tarea distintos dentro del pipeline de Hindsight.

La innovacion tecnica principal no esta en la arquitectura del transformer sino en el stack de serving: decodificacion ordenada con XGrammar para forzar salida JSON valida, pensamiento (`<think>`) activado por rol, y un `HindsightWriterGateway` que aplica hasta un reintento de reparacion sobre las respuestas del modelo. Las exportaciones GGUF se generaron fusionando el adaptador con el base en BF16 y cuantizando con una matriz de importancia (`imatrix`) de 512 prompts, manteniendo las puertas de atencion en BF16. La model card reporta que el gateway aporta una mejora de 97,8% a 99,0% en la tasa de aprobacion agregada.

## Capacidades

- Extraccion de hechos (retain) a partir de conversaciones, con salida estructurada.
- Consolidacion de observaciones en paginas de memoria.
- Creacion inicial de paginas de memoria.
- Actualizacion de paginas existentes.
- Retraccion de afirmaciones retiradas (claim retraction).
- Reescritura de consultas (query rewriting).
- Generacion de argumentos de herramientas para llamadas de seguimiento (follow-up tool arguments).
- Acortamiento de respuestas (response shortening).
- Deduplicacion de entradas de memoria.
- Extraccion final estructurada en JSON.
- Generacion de respuestas de cierre (closing answer).
- Soporte de tool calling / function calling mediante el gateway compatible con la API de OpenAI.
- Modo de pensamiento (`<think>`) activado por rol.
- Salida estructurada garantizada mediante decodificacion XGrammar.
- Capacidad multilingue: solo ingles declarado.

## Casos de uso

- Memoria de agentes conversacionales: el modelo extrae hechos de cada turno de una conversacion y los consolida en paginas de memoria, permitiendo que un agente mantenga contexto persistente entre sesiones sin reenviar todo el historial al LLM principal.
- Atencion al cliente con memoria de cliente: integrado en el gateway, procesa cada interaccion para actualizar el perfil del cliente (preferencias, incidencias, reclamaciones) y retrae afirmaciones que el cliente haya corregido.
- Pipelines RAG con memoria estructurada: sustituye o complementa la indexacion vectorial clasica, generando paginas de memoria consolidadas y deduplicadas que reducen el ruido en la recuperacion.
- Automatizacion de CRM: extrae hechos de correos y notas de reuniones, actualiza registros y deduplica entradas repetidas, con salida JSON validada por el verificador incluido.
- Ejecucion local en hardware de consumo: las variantes Q4_K_M (2,58 GiB) y Q6_K (3,22 GiB) caben en GPUs de 8 GB y permiten desplegar el pipeline de memoria sin enviar datos a la nube, relevante por privacidad.
- Generacion de argumentos para herramientas en agentes multi-paso: el modelo produce los argumentos JSON de llamadas de seguimiento (100% de aprobacion en la tarea de follow-up tool arguments con gateway), lo que lo hace util como planificador de herramientas ligero.
- Investigacion sobre memoria en LLMs: el repositorio incluye verificadores, recibos de cualificacion y datos de comparacion entre versiones, lo que facilita reproducir y extender los experimentos.

## Benchmarks y rendimiento

Resultados del rule-checker v5 sobre los mismos 495 casos de desarrollo expuestos (la categoria `uncertain` no cuenta como aprobado). Datos extraidos de la model card:

| Tarea | Casos | Base Spark-X2.6-4B | V14 | 1.1 (raw) | 1.1 (+ gateway) |
|---|---:|---:|---:|---:|---:|
| Fact extraction (retain) | 68 | 0,0% | 82,4% | 98,5% | 98,5% |
| Consolidation | 103 | 19,4% | 95,1% | 98,1% | 98,1% |
| Closing answer | 54 | 0,0% | 100,0% | 98,1% | 98,1% |
| Initial page creation | 54 | 0,0% | 94,4% | 98,1% | 98,1% |
| Structured final extraction | 48 | 50,0% | 100,0% | 100,0% | 100,0% |
| Query rewriting | 24 | 33,3% | 91,7% | 100,0% | 100,0% |
| Follow-up tool arguments | 24 | 16,7% | 66,7% | 83,3% | 100,0% |
| Response shortening | 24 | 83,3% | 100,0% | 100,0% | 100,0% |
| Deduplication | 8 | 87,5% | 100,0% | 100,0% | 100,0% |
| Page updates | 40 | 65,0% | 95,0% | 100,0% | 100,0% |
| Claim retraction | 48 | 31,2% | 100,0% | 95,8% | 100,0% |

Agregado global (pass / uncertain / fail):
- Base Spark-X2.6-4B: 25,1% (124 / 12 / 359, 246 criticos).
- Hindsight V14: 93,5% (463 / 3 / 29, 11 criticos).
- Hindsight 1.1 (raw): 97,8% (484 / 2 / 9, 3 criticos).
- Hindsight 1.1 (+ gateway): 99,0% (490 / 2 / 3, 2 criticos).

Suites adicionales para 1.1 (+ gateway): Dev-v2 380/0/0 (380/380 en raw Attempt-1); Qual-v3-300 660/0/0 sobre 300 escenarios sin cadena; smoke check 3/3 JSON exacto.

Rendimiento GGUF sobre una muestra estratificada de 60 casos de Dev-v2 (5 por rol, 12 roles), evaluado con `llama-server`:

| Variante | Fichero | Tamano | Smoke | Muestra 60 casos (pass/unc/fail) |
|---|---|---:|---:|---:|
| BF16 | Spark-X2.6-4B-Hindsight-1.1-BF16.gguf | 7,66 GiB | 3/3 | 60/0/0 |
| Q8_0 | Spark-X2.6-4B-Hindsight-1.1-Q8_0.gguf | 4,07 GiB | 3/3 | 60/0/0 |
| Q6_K | Spark-X2.6-4B-Hindsight-1.1-Q6_K.gguf | 3,22 GiB | 3/3 | 60/0/0 |
| Q4_K_M | Spark-X2.6-4B-Hindsight-1.1-Q4_K_M.gguf | 2,58 GiB | 3/3 | 60/0/0 |

La model card advierte que la paridad 60/0/0 solo establece equivalencia en esos 60 casos, no ausencia universal de perdida por cuantizacion. No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: adaptador PEFT en BF16 sobre base de 4B, aproximadamente 8-9 GB (4,1B parametros en BF16 mas overhead de activaciones y KV cache).
- GGUF Q4_K_M: 2,58 GiB de pesos, apto para GPUs de 6-8 GB.
- GGUF Q6_K: 3,22 GiB, apto para GPUs de 8 GB.
- GGUF Q8_0: 4,07 GiB, apto para GPUs de 8-10 GB.
- GGUF BF16: 7,66 GiB, requiere 10-12 GB de VRAM.
- GPU probadas segun la model card: RTX 3090 con llama.cpp.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para el adaptador PEFT en BF16; RTX 3060 12 GB o superior para las variantes GGUF cuantizadas.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y RTX 3090.
- Opciones de despliegue: llama.cpp (`llama-server`), PEFT con el loader portable incluido (`portable_spark_adapter.load`), gateway compatible con OpenAI (`spark_prod_server.py`). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisitos de software: Linux, Python 3.12, CUDA (el ejemplo usa cu128). El loader descarga el modelo base en la revision fijada `64ca8f2a295b8ceb2757b9d4749a6558c4759e5b`.
- Nota de seguridad: la model card advierte que las dependencias fijadas tienen avisos de seguridad conocidos y que la carga ejecuta codigo personalizado del publicador con `trust_remote_code=True`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tareas Hindsight | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-x2.6-4b-hindsight-1.1 (este) | 4,1B + adaptador 259M | no disponible | 99,0% (495 casos) | Apache 2.0 | HF, GGUF, gateway |
| Spark-x2.6-4b-hindsight-v14 | 4,1B + adaptador 65M | no disponible | 93,5% (495 casos) | Apache 2.0 | HF, PEFT |
| Spark-X2.6-4B (base) | 4,1B | no disponible | 25,1% (495 casos) | Apache 2.0 | HF |

No se dispone de datos de benchmarks generales ni de comparaciones con modelos de la misma categoria (por ejemplo, otros modelos de 4B especializados en memoria o salida estructurada) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo declara soporte para ingles; el rendimiento en otros idiomas no esta documentado.
- El modelo esta especializado en tareas de Hindsight; su rendimiento en tareas generales de generacion, razonamiento o codigo no esta evaluado en la model card.
- Riesgo de alucinacion inherente a los LLM; el gateway y el rule-checker mitigan pero no eliminan errores, y la propia card reporta 2 casos criticos fallidos en la evaluacion agregada.
- La evaluacion se realizo sobre 495 casos de desarrollo expuestos, lo que puede sobreestimar el rendimiento en distribuciones no vistas.
- La paridad entre cuantizaciones solo se verifico en 60 casos; no hay garantia de ausencia de perdida en Q4_K_M.
- La carga del adaptador ejecuta codigo personalizado del publicador con `trust_remote_code=True` y las dependencias fijadas tienen avisos de seguridad conocidos; revisar SECURITY.md antes de desplegar.
- El repositorio ocupa 19,9 GB; descargar excluyendo los GGUF si solo se necesita el adaptador.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base XHToken/Spark-X2.6-4B debe verificarse por separado (la card no detalla su licencia original).
- Estado de research preview: la version 1.1 es una vista previa de investigacion, no una release estable de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samartomar/spark-x2.6-4b-hindsight-1.1-research-preview
- Version anterior V14: https://huggingface.co/samartomar/spark-x2.6-4b-hindsight-v14-research-preview
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Hindsight (Vectorize): https://hindsight.vectorize.io/
- Datos de comparacion V14 vs 1.1: V14_VS_1_1_COMPARISON.json (incluido en el repositorio)
- Recibo de cualificacion: QUALIFICATION_RECEIPT.json (incluido en el repositorio)
- Notas de seguridad: SECURITY.md (incluido en el repositorio)
