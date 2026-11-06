# hmzprover/hpsearch-embed-8b-nl

## Resumen

hpsearch-embed-8b-nl es un modelo de embeddings de frases especializado en recuperación de información sobre Mathlib, la biblioteca formal de matemáticas en Lean 4. Lo desarrolla hmzprover como parte del proyecto hpsearch, una herramienta de búsqueda semántica de lemas y declaraciones matemáticas. El modelo parte de Qwen3-Embedding-8B, un transformer denso de 7.567 millones de parámetros, y se afina mediante LoRA para mapear preguntas en lenguaje natural (inglés) a declaraciones de Mathlib.

El problema que resuelve es concreto: un usuario que pregunta "¿existe un lema en Mathlib que...?" o "¿cómo puedo demostrar... en Lean?" necesita localizar la declaración formal correcta entre cientos de miles de entradas. Los embeddings genéricos rinden mal en este dominio porque el lenguaje matemático formal y el informal tienen distribuciones muy distintas. Este modelo se entrena con 398.000 pares pregunta/declaración generados localmente, con negativos duros minados por un modelo anterior de la misma familia.

Es relevante para quien construye asistentes de demostración interactiva (tácticas, autocompletado, búsqueda de lemas) sobre Lean 4 y Mathlib. La licencia Apache 2.0 y el formato safetensors facilitan su integración en pipelines de retrieval. El contexto de entrenamiento se limita a frases y preguntas cortas, y el modelo no está pensado para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-Embedding-8B), afinado con LoRA (r=32) |
| Parametros totales | 7.567.295.488 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; se puede cuantizar con herramientas estándar) |
| Idiomas soportados | No disponible (las consultas de entrenamiento están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen3-Embedding-8B, adaptado mediante LoRA con rango 32 durante una época. El objetivo de entrenamiento es contrastivo, con negativos en el lote (in-batch) y un negativo duro por ejemplo. Los documentos se codifican como la declaración Lean seguida de su enunciado en lenguaje natural; en la mitad de los pares de pregunta de usuario solo se muestra el enunciado Lean. Las consultas usan las instrucciones de hpsearch con el formato `Instruct: ...\nQuery: `.

Los datos de afinado son públicos y generados localmente: preguntas de usuario redactadas por Qwen3-30B-A3B-Instruct-2507 para unas 450.000 declaraciones del corpus LeanSearch v2 de Mathlib (FrenzyMath/lsv2-mathlib-v4.28.0-rc1-jsonl), en cuatro estilos (preguntar si Mathlib tiene un resultado, tarea de demostración, discusión amplia tipo Zulip, usuario atascado en una prueba). Los negativos duros se minaron con hpsearch-embed-4b-v2, consciente de positivos. Se añadieron consultas de seis estilos y pares públicos del conjunto de entrenamiento de hmzprover/hpsearch-embed-4b-v2. El conjunto final son 398.000 pares pregunta/declaración.

El autor declara descontaminación: ninguna declaración que sea gold de los conjuntos de evaluación usados por hpsearch (MathlibQR / MathlibMPR, Lean Finder, LeanStateSearch, LeanDojo, MIRB, TheoremSearch, TBPS, hmzprover, HPSB y HPSB v2, en todos sus splits) se usa como prompt, positivo o negativo, ni por nombre ni por enunciado, y se descartan las consultas normalizadas idénticas a una consulta de evaluación.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación (pipeline sentence-similarity).
- Búsqueda de lemas y declaraciones de Mathlib a partir de preguntas en lenguaje natural en inglés.
- Manejo de consultas con instrucción previa (formato Instruct/Query de hpsearch).
- Representación conjunta de enunciados Lean y su informalización en lenguaje natural.
- Compatible con Text Embeddings Inference (tag text-embeddings-inference) y con endpoints compatibles.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de embeddings.
- Capacidades multilingües: no documentadas; el entrenamiento se centra en inglés.

## Casos de uso

- Búsqueda de lemas en asistentes Lean 4: dado un objetivo de demostración escrito en inglés, el modelo recupera las declaraciones de Mathlib más cercanas semánticamente para que el usuario las inspeccione o las aplique.
- Autocompletado en editores de Lean: al escribir una táctica o un nombre parcial, el sistema consulta el índice de embeddings y sugiere lemas relevantes según el enunciado del objetivo actual.
- Construcción de índices de recuperación sobre Mathlib: el modelo genera embeddings de las ~450.000 declaraciones del corpus LeanSearch v2 y se indexan en una base vectorial (FAISS, Qdrant, Milvus) para búsqueda por similitud coseno.
- Asistentes de demostración interactiva: integrado en un pipeline de RAG, alimenta a un LLM generador con los lemas candidatos recuperados, reduciendo alucinaciones de nombres de lemas inexistentes.
- Herramientas de estudio de matemáticas formales: un estudiante formula una pregunta informal y obtiene declaraciones formales equivalentes para aprender la correspondencia entre lenguaje natural y Lean.
- Detección de duplicados y agrupación de declaraciones: los embeddings permiten agrupar declaraciones de Mathlib con enunciados semánticamente próximos para auditoría o curación del corpus.
- Búsqueda en documentación matemática informal: al codificar también el enunciado en lenguaje natural, sirve para localizar la formalización de un resultado descrito en prosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 15 GB solo para los pesos (7.567 millones de parámetros × 2 bytes), más overhead de activaciones y del tokenizador.
- En cuantización de 8 bits: unos 8 GB; en 4 bits: unos 4-5 GB (estimación a partir del número de parámetros; no confirmada por el autor).
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o RTX 6000 Ada. Cabe en una RTX 4090 de 24 GB en fp16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: Text Embeddings Inference (etiqueta oficial), sentence-transformers, vLLM con soporte de embeddings, y servidores compatibles con la API de endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hpsearch-embed-8b-nl | 7.567 M | No disponible | Mathlib / Lean 4 | Apache 2.0 | Hugging Face (26 descargas) |
| hmzprover/hpsearch-embed-4b-v2 | No disponible en la información | No disponible | Mathlib / Lean 4 | No disponible | Hugging Face |
| Qwen/Qwen3-Embedding-8B | 8B (aproximado) | No disponible | General | No disponible en la información | Hugging Face |

El modelo base Qwen3-Embedding-8B es de propósito general y no está especializado en matemáticas formales; hpsearch-embed-4b-v2 es la iteración anterior de la misma familia, usada para minar negativos duros en el entrenamiento de este modelo. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es un modelo de embeddings: no genera texto ni razona; cualquier uso generativo requiere un LLM adicional.
- El entrenamiento se centra en consultas en inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no está especificada; las consultas de entrenamiento son preguntas cortas, por lo que entradas largas pueden degradar la calidad del embedding.
- Riesgo de sesgo hacia el corpus LeanSearch v2 de Mathlib v4.28.0-rc1: declaraciones fuera de esa versión o de otras bibliotecas Lean pueden recuperarse peor.
- Las preguntas de entrenamiento fueron generadas por un LLM (Qwen3-30B-A3B-Instruct-2507), lo que puede introducir estilos y sesgos propios de ese generador.
- Riesgo de falsos positivos en la recuperación: la similitud semántica no garantiza que el lema recuperado sea aplicable al objetivo formal.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-Embedding-8B y de los datos de entrenamiento derivados de Mathlib.
- El modelo tiene muy poca adopción (26 descargas, 0 likes) y no se han publicado evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmzprover/hpsearch-embed-8b-nl
- Repositorio del proyecto hpsearch: https://github.com/humanfia/hpsearch
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Modelo anterior de la familia: https://huggingface.co/hmzprover/hpsearch-embed-4b-v2
- Corpus LeanSearch v2 de Mathlib: https://huggingface.co/datasets/FrenzyMath/lsv2-mathlib-v4.28.0-rc1-jsonl
