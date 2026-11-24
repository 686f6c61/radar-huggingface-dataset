# s2naito/qwen3.5-0.8b-rag-sft-v4d

## Resumen

s2naito/qwen3.5-0.8b-rag-sft-v4d es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario s2naito. El modelo está especializado en respuesta corta a preguntas (short-answer QA) sobre Wikipedia en japonés dentro de un pipeline de generación aumentada por recuperación (RAG). No se trata de un modelo de propósito general, sino de un componente afinado para una etapa concreta de un sistema de recuperación y respuesta en producción.

El ajuste se realizó sobre contextos construidos con un pipeline de recuperación específico: fusión de rankings (RRF) de 4 vías con top-100, reranker Ruri, salto de dos pasos (2-hop) basado en reglas, selección de artículos mediante el modelo auxiliar s2naito/qwen3.5-0.8b-rag-selector-v2 y una estrategia de recorte de títulos (rerank_title_tail) con CONTEXT_TOP_K=5. La receta de entrenamiento corresponde a SFT v4 Plan C, con refuerzo de rangos limpios 2-5, un máximo de 3 repeticiones por pregunta y semilla de entrenamiento 42.

Con 873.438.784 parámetros reales (según safetensors) y un repositorio de 1,8 GB, el modelo es extremadamente ligero y está pensado para desplegarse en entornos con recursos limitados. Su relevancia radica en demostrar cómo un modelo de menos de mil millones de parámetros, afinado con LoRA sobre un pipeline RAG concreto, puede especializarse en tareas de QA documental en japonés con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17), un transformer decoder-only de la familia Qwen3.5. El ajuste se realizó con LoRA configurado con target_modules="all-linear", es decir, aplicando adaptadores de bajo rango a todas las capas lineales del modelo base. No se especifica el rango, el alpha ni la tasa de aprendizaje empleados.

Los datos de entrenamiento provienen de cuatro fuentes, todas ellas con licencia CC BY-SA 4.0 y modificadas (filtradas y reformateadas) para el entrenamiento: JEMHopQA, JSQuAD/JGLUE, NIILC QA y los fragmentos de Wikipedia japonesa distribuidos en bumbuboon/llm-course-final-2026 (estos últimos usados sin modificar como contextos de recuperación). La receta SFT v4d aplica el Plan C de SFT v4: refuerzo de rangos limpios 2-5, un máximo de 3 repeticiones por pregunta y semilla 42, sobre contextos generados por el selector de artículos s2naito/qwen3.5-0.8b-rag-selector-v2. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de respuestas cortas a preguntas (short-answer QA) en japonés sobre contextos recuperados de Wikipedia.
- Comprensión de contextos multi-documento: el pipeline de recuperación entrega hasta 5 fragmentos (CONTEXT_TOP_K=5) y el modelo está entrenado para responder a partir de ellos.
- Razonamiento de dos pasos (2-hop) sobre entidades y relaciones, derivado del uso de JEMHopQA en el entrenamiento.
- Especialización en el pipeline de recuperación concreto del autor (RRF de 4 vías, reranker Ruri, selector de artículos y rerank_title_tail).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso genérico más allá del 2-hop del pipeline.
- Capacidades multilingües limitadas al japonés según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Respuesta a preguntas sobre Wikipedia japonesa en producción: el modelo está afinado específicamente para recibir los 5 fragmentos recuperados por el pipeline del autor y devolver una respuesta corta, lo que lo hace adecuado como etapa final de un sistema RAG japonés.
- Sistemas de búsqueda con respuesta directa: integrado tras un recuperador BM25/embedding y un reranker, puede transformar los documentos recuperados en respuestas concisas para interfaces de búsqueda tipo "answer engine".
- Asistentes de consulta documental interna: con un pipeline de recuperación equivalente adaptado a corpus propios en japonés, el modelo puede responder preguntas factuales sobre manuales, normativas o bases de conocimiento.
- Preguntas multi-salto sobre entidades: gracias al entrenamiento con JEMHopQA, puede resolver preguntas que requieren combinar información de dos artículos relacionados (por ejemplo, persona y obra, organización y sede).
- Despliegue en entornos con recursos limitados: con menos de 900 millones de parámetros y 1,8 GB de pesos, cabe en GPUs de consumo y en CPUs, lo que permite ejecutar la etapa de generación en el mismo nodo que el recuperador.
- Evaluación y prototipado de pipelines RAG: sirve como modelo de referencia para medir el impacto de cambios en el recuperador, el reranker o el selector de artículos, ya que su comportamiento está condicionado al pipeline exacto con el que fue entrenado.
- Filtrado y validación de respuestas en pipelines de QA: puede emplearse para generar respuestas candidatas que luego se validen contra el contexto recuperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 6 GB o más; también es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: transformers con PEFT (el modelo es un ajuste LoRA), vLLM y TGI tras fusionar los adaptadores; llama.cpp/Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Especializacion |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v4d | 873 M | No disponible | Japonés | Apache 2.0 | QA corta sobre RAG de Wikipedia japonesa |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe | Apache 2.0 | Propósito general |
| s2naito/qwen3.5-0.8b-rag-selector-v2 | No disponible | No disponible | Japonés | No disponible | Selección de artículos en pipeline RAG |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para un pipeline de recuperación muy concreto; su rendimiento puede degradarse si se usa con otro recuperador, otro número de fragmentos (distinto de CONTEXT_TOP_K=5) u otro formato de contexto.
- Solo soporta japonés según la model card; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño, puede producir respuestas plausibles pero no sustentadas en el contexto recuperado, especialmente si el contexto es irrelevante o contradictorio.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de entrenamiento provienen de Wikipedia japonesa y de datasets de QA, con los sesgos propios de esas fuentes.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, pero los datos de entrenamiento derivan de fuentes CC BY-SA 4.0 (JEMHopQA, JSQuAD/JGLUE, NIILC QA y Wikipedia japonesa), lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas según la jurisdicción.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con contextos largos más allá de los 5 fragmentos del pipeline de entrenamiento.
- Sin datos de benchmarks publicados: no es posible comparar su calidad de forma objetiva con alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4d
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Selector de artículos auxiliar: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-selector-v2
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset de fragmentos de Wikipedia: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
