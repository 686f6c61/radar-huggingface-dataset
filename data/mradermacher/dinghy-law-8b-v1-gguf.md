# mradermacher/dinghy-law-8b-v1-GGUF

## Resumen

dinghy-law-8b-v1-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF, publicado por el usuario mradermacher, del modelo base Hanno-Labs/dinghy-law-8b-v1. El modelo original es un modelo de embeddings de unos 8.000 millones de parámetros (7.952.683.008 según safetensors), especializado en el dominio jurídico: retrieval legal, búsqueda semántica y tareas evaluadas mediante MTEB. Está construido sobre una arquitectura de tipo Nemotron y ha sido entrenado con pares de recuperación legal de Hanno-Labs.

La relevancia de este repositorio no radica en el modelo en sí, sino en la disponibilidad de cuantizaciones que van desde Q2_K (3,3 GB) hasta f16 (16 GB), lo que permite ejecutar un modelo de embeddings de 8B en hardware de consumo. Esto es útil para construir sistemas RAG legales o motores de búsqueda semántica sobre corpus jurídicos sin necesidad de GPUs de datacenter.

Cabe destacar que se trata de un modelo de embeddings (feature extraction), no de generación de texto: su función es producir vectores para comparar similitud semántica entre consultas y documentos legales. Soporta inglés, alemán y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron (modelo de embeddings tipo sentence-transformers) |
| Parametros totales | 7.952.683.008 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en), alemán (de), chino (zh) |
| Licencia | openmdw-1.1 (tipo "other", con enlace a https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (el base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Hanno-Labs/dinghy-law-8b-v1, emplea una arquitectura basada en Nemotron adaptada como modelo de embeddings mediante la librería sentence-transformers. Con casi 8.000 millones de parámetros, es un modelo de embeddings de gran tamaño, muy por encima de los habituales en retrieval (que suelen situarse entre 100M y 7B parámetros), lo que sugiere mayor capacidad de representación semántica en textos jurídicos complejos a cambio de requisitos de hardware superiores.

El entrenamiento se ha realizado con tres datasets publicados por Hanno-Labs: legal-retrieval-pairs-v1, legal-retrieval-pairs-v2 y legal-retrieval-pairs-dewiki. Los dos primeros contienen pares de consulta-documento orientados a recuperación legal, y el tercero incorpora pares derivados de la Wikipedia en alemán, lo que explica el soporte multilingüe (en, de, zh). No hay información disponible sobre el número de tokens de entrenamiento, el uso de RLHF/DPO (habitualmente no aplicable a modelos de embeddings) ni otras innovaciones técnicas concretas.

## Capacidades

- Generación de embeddings de texto (feature extraction) para tareas de recuperación de información.
- Búsqueda semántica sobre corpus documentales, con especialización en textos legales.
- Retrieval para sistemas RAG: puede actuar como componente de embedding en pipelines de generación aumentada por recuperación.
- Evaluación en benchmarks MTEB (aparece como tag del modelo).
- Soporte multilingüe en inglés, alemán y chino.
- Integrable con la librería transformers y con frameworks de sentence-transformers.
- No genera texto: no es adecuado para chat, razonamiento conversacional, código ni generación de contenido.

## Casos de uso

- Búsqueda semántica en bases de datos jurídicas: indexar sentencias, contratos o normativa y recuperar los documentos más relevantes ante una consulta en lenguaje natural, aprovechando el fine-tuning específico en retrieval legal.
- Componente de embeddings en sistemas RAG legales: como modelo de embeddings dentro de un pipeline RAG, permite recuperar pasajes legales relevantes que un LLM posterior usa para redactar respuestas fundamentadas.
- Clasificación y agrupamiento de documentos legales: clustering de contratos o resolución de casos por similitud semántica mediante los vectores generados.
- Detección de precedentes: encontrar casos o resoluciones previas semánticamente afines a un caso nuevo, tarea donde el retrieval denso supera al léxico tradicional (BM25).
- Búsqueda multilingüe en corpus jurídicos: gracias al soporte de alemán (y chino), permite consultas cruzadas entre idiomas sobre documentación legal europea o internacional.
- Reordenación (reranking) en dos etapas: usar el modelo para reordenar candidatos recuperados por un retriever más ligero, mejorando la precisión del sistema final.
- Deduplicación y detección de variaciones de cláusulas: identificar cláusulas contractuales equivalentes redactadas de forma distinta mediante similitud de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo incluye la etiqueta "mteb", lo que sugiere que ha sido evaluado en MTEB, pero no se proporcionan puntuaciones concretas ni comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,3 GB; Q4_K_M ~5,0 GB; Q6_K ~6,6 GB; Q8_0 ~8,6 GB; f16 ~16 GB (añadir margen para overhead de ejecución).
- Cabe en GPUs de consumo: con Q4_K_M (5 GB) funciona en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090; con f16 se necesita una GPU de 24 GB (RTX 3090/4090) o superior.
- También es ejecutable en CPU mediante llama.cpp, con mayor latencia proporcional al tamaño del modelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Al tratarse de un modelo de embeddings, no aplica el despliegue típico de servidores de generación como vLLM o TGI en su formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Hanno-Labs/dinghy-law-8b-v1 (este) | 7,95B | en, de, zh | Retrieval legal | openmdw-1.1 | GGUF (este repo), safetensors (base) |
| BAAI/bge-m3 | ~0,57B | ~100 | Retrieval general multilingüe | MIT | safetensors, GGUF |
| Alibaba-NLP/gte-Qwen2-7B-instruct | ~7,6B | multilingüe | Retrieval general instruct | Apache 2.0 | safetensors, GGUF |

Comparado con bge-m3, dinghy-law-8b-v1 es mucho mayor (7,95B frente a ~0,57B) y está especializado en el dominio legal, a costa de requisitos de hardware superiores. Frente a gte-Qwen2-7B-instruct, de tamaño similar, dinghy-law se diferencia por su fine-tuning específico en retrieval jurídico y su licencia openmdw-1.1 en lugar de Apache 2.0.

## Limitaciones y advertencias

- No es un modelo generativo: produce embeddings, no texto. No sirve para chat, redacción o razonamiento.
- La licencia openmdw-1.1 es de tipo "other": conviene revisar sus términos en https://openmdw.ai/license/1-1/ antes de cualquier uso comercial, ya que no es una licencia estándar permisiva.
- Soporte de idiomas limitado a inglés, alemán y chino; no está indicado soporte para castellano, lo que puede degradar el rendimiento en corpus jurídicos en español.
- Las cuantizaciones disponibles son estáticas; no hay versiones imatrix/weighted, lo que puede suponer una ligera pérdida de calidad en los quants bajos.
- El riesgo de alucinación no aplica directamente al modelo de embeddings, pero sí al pipeline RAG completo si se combina con un LLM generativo.
- No hay benchmarks publicados en la ficha, por lo que el rendimiento real debe validarse en el caso de uso concreto antes de producción.
- Longitud de contexto máxima no documentada: verificarla antes de indexar documentos jurídicos largos.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/dinghy-law-8b-v1-GGUF
- Modelo base: https://huggingface.co/Hanno-Labs/dinghy-law-8b-v1
- Página de descargas de mradermacher: https://hf.tst.eu/model#dinghy-law-8b-v1-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Dataset legal-retrieval-pairs-v2: https://huggingface.co/datasets/Hanno-Labs/legal-retrieval-pairs-v2
- Dataset legal-retrieval-pairs-v1: https://huggingface.co/datasets/Hanno-Labs/legal-retrieval-pairs-v1
- Dataset legal-retrieval-pairs-dewiki: https://huggingface.co/datasets/Hanno-Labs/legal-retrieval-pairs-dewiki
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
