# NYSgpt/nsr-encoder

## Resumen

NSR Encoder es un modelo de retrieval denso (bi-encoder) desarrollado por NYSgpt para la búsqueda semántica sobre el corpus Nuclear Science References (NSR), que contiene 277.068 referencias de literatura de física nuclear. Está basado en el modelo BAAI/bge-m3 y cuenta con aproximadamente 568 millones de parámetros. El modelo se entrena con pares de consultas escritas por indexadores expertos (abstracts de palabras clave estructuradas) y los artículos correspondientes, más enlaces de experimentos EXFOR, para mejorar significativamente la recuperación de documentos científicos especializados frente al modelo base.

La relevancia de este modelo radica en que aborda un dominio muy específico (física nuclear) donde los modelos de retrieval generalistas rinden mal, especialmente en documentos antiguos o con títulos únicamente. Según los datos publicados, NSR Encoder casi triplica el R@10 del modelo base BAAI/bge-m3 en consultas de expertos (0,487 frente a 0,171), con mejoras especialmente notables en documentos de solo título (+262%) y en artículos anteriores a 1970 (+307%). Se distribuye bajo licencia MIT, con pesos en formato safetensors y es compatible con el servidor Text Embeddings Inference (TEI) de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Bi-encoder denso (single vector) basado en BAAI/bge-m3 |
| Parámetros totales | 568 millones (567.754.752) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens para consultas / 256 tokens para pasajes |
| Tipos de cuantización | No disponible (pesos en bf16) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un bi-encoder denso que produce un único vector normalizado de 1024 dimensiones por texto, usando similitud coseno para la recuperación. Su backbone es BAAI/bge-m3, un modelo de embeddings multilingüe basado en XLM-RoBERTa, que ha sido ajustado para la tarea específica de búsqueda en el dominio de la física nuclear. La arquitectura es la estándar de los modelos de retrieval denso: dos encoders (o uno compartido) que procesan consulta y documento por separado, y la similitud se calcula mediante el producto escalar de los vectores normalizados.

El entrenamiento se realizó con el objetivo de contraste in-batch, sin unificación de tareas (`--unified_finetuning False`), usando el trainer FlagEmbedding `finetune.embedder.encoder_only.m3`. Se emplearon 39.568 pares de consulta-documento: todos los enlaces EXFOR y abstracts de palabras clave estratificados por era, riqueza de información y tipo de referencia. Para cada par se minaron 7 negativos difíciles desde el espacio de embeddings del modelo base, además de un componente léxico, con un tamaño de grupo de 8. El entrenamiento se hizo con batch de 16, una sola época, tasa de aprendizaje de 1e-5 y temperatura de 0.02, en precisión bf16. Se utilizó una GPU NVIDIA L40S (tipo `g6e.xlarge`) durante 33.5 minutos. Los datos de evaluación se separaron por artículo, excluyendo todos los documentos del benchmark como fuente de consultas o positivos.

## Capacidades

- Recuperación densa de documentos sobre el corpus Nuclear Science References (NSR), con 277. 068 artículos.
- Genera embeddings de 1024 dimensiones normalizados para similitud cosines.
- Soporta consultas en inglés (idioma principal del corpus).
- Mejora notable en documentos con solo título y artículos antiguos (pre-1970), donde los modelos generalistas fallan.
- Especificado para búsqueda de consulta→documento, no para clasificación ni generación.
- No soporta tool calling ni funciones de agente.
- No tiene capacidades multimodales (visión, audio).
- No es un modelo de generación de texto, solo de extracción de características (feature-extraction).
- Compatible con servidores TEI (Text Embeddings Inference) para despliegue en producción.

## Casos de uso

- **Búsqueda semántica en literatura de física nuclear**: el modelo permite a investigadores encontrar artículos relevantes mediante consultas en lenguaje natural, como "92Zr(n,γ) cross section, stellar nucleosynthesis", obteniendo resultados con mejor relevancia que un modelo generalista. Es adecuado por su entrenamiento específico sobre el corpus NSR.
- **Recuperación de datos experimentales EXFOR**: puede asociar experimentos con sus publicaciones, ya que se entrenó con enlaces EXFOR experiment→paper. Útil para bases de datos de reacciones nucleares.
- **Indexación de bibliotecas digitales**: dado que el modelo produce embeddings de 1024 dimensiones, puede usarse para indexar colecciones de documentos de física nuclear y construir sistemas de búsqueda híbrida (combinando búsqueda léxica con densa, como RRF).
- **Sistema de recomendación de artículos**: a partir de un artículo de referencia, se pueden recuperar documentos similares en el corpus NSR, facilitando la revisión bibliográfica y la detección de trabajos relacionados.
- **Análisis de tendencias históricas**: al mejorar la recuperación de artículos pre-1970, el modelo permite estudiar la evolución de la investigación nuclear a lo largo del tiempo, con consultas sobre temas históricos.
- **Integración en pipelines de IA**: al ser un bi-encoder estándar de sentence-transformers, puede integrarse en sistemas de retrieval-augmented generation (RAG) para responder preguntas sobre física nuclear, siempre que se combine con un modelo generativo.
- **Despliegue en entornos de producción**: al ser compatible con TEI y con formato safetensors, puede servirse en infraestructura de Hugging Face o en servidores propios con vLLM o similar.

## Benchmarks y rendimiento

Los resultados publicados se obtuvieron sobre el conjunto de evaluación NSR Eval, que contiene 4.998 consultas de palabras clave expertas (KW) y 4.997 consultas EXFOR (EX), evaluadas contra los 277. 068 documentos del corpus. Se comparan varios sistemas:

| Sistema | R@1 | R@10 | nDCG@10 |
|---|---|---|---|
| RRF(FTS + nsr-encoder) (producción) | 0.344 | 0.542 | 0.437 |
| **nsr-encoder (este modelo)** | **0.252** | **0.487** | **0.363** |
| RRF(FTS + stock bge-m3) | 0.212 | 0.282 | 0.244 |
| Postgres FTS (búsqueda léxica) | 0.161 | 0.165 | 0.163 |
| BAAI/bge-m3 (stock) | 0.080 | 0.171 | 0.121 |

En las consultas EXFOR, el modelo alcanza R@1 de 0.911 frente a 0.871 del stock bge-m3, y R@10 de 0.966 frente a 0.958. La mejora es mayor en documentos de solo título (+262% R@10) y en artículos pre-1970 (+307%). El modelo cumple el criterio pre-registrado de superar al stock en R@10 y nDCG@10 en todos los segmentos.

## Requisitos de hardware

- El modelo tiene 568 millones de parámetros, lo que en bf16 ocupa aproximadamente 1. 136 GB en memoria (sin contar overhead). Con cuantizaciones no disponibles, el peso completo es de 2.3 GB en disco.
- Para inferencia en GPU: una tarjeta con al menos 4 GB de VRAM es suficiente para el modelo en bf16, aunque se recomienda 8 GB para margen.
- GPU recomendadas: NVIDIA L40S (usada en entrenamiento), A100, H100, o incluso RTX 4090 y RTX 3080 para inferencia.
- Es viable en GPU de consumo (por ejemplo, RTX 3060 con 12 GB) para uso local.
- Opciones de despliegue: servidor TEI de Hugging Face (`--model-id NYSgpt/nsr-encoder`), sentence-transformers en Python, o cualquier framework compatible con embeddings (vLLM, etc.).
- La latencia y el throughput dependen del hardware y del tamaño de los textos; no se han publicado cifras concretas. En una L40S se entrenó en 33.5 minutos, lo que sugiere inferencia rápida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | R@10 (KW) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **nsr-encoder** | 568M | 128/256 tokens | 0.487 | MIT | Hugging Face |
| BAAI/bge-m3 (stock) | 568M | 8192 tokens (original) | 0.171 | MIT | Hugging Face |
| Postgres FTS (léxico) | — | — | 0.165 | — | Software libre |

El modelo es una adaptación de BAAI/bge-m3, por lo que comparte la misma arquitectura y tamaño. La diferencia clave es el ajuste específico para el dominio de física nuclear, que logra una mejora de +186% en R@10 sobre el base. Otros modelos de retrieval generalistas como `ncbi/MedCPT` se mencionan en el README como inspiración, pero no se comparan directamente. No hay disponible una comparativa con otros modelos de retrieval de física nuclear.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que las consultas en otros idiomas no serán efectivas.
- Su rendimiento está optimizado para el dominio de la física nuclear (NSR y EXFOR). Para otras áreas científicas, el modelo base BAAI/bge-m3 puede ser más adecuado.
- La longitud máxima de secuencia es de 128 tokens para consultas y 256 para pasajes, por lo que documentos muy largos deben truncarse o segmentarse.
- No es un modelo de generación: no produce texto, solo embeddings. Para respuestas completas se requiere un sistema RAG.
- Riesgo de alucinación en retrieval: puede devolver documentos irrelevantes si la consulta está fuera del dominio o es ambigua.
- Aunque la licencia MIT permite uso comercial, no hay garantías sobre la precisión de las recuperaciones en producción.
- El modelo se entrenó con un solo epoch y un conjunto de datos limitado (39.568 pares), por lo que puede haber sesgos en las coberturas temáticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NYSgpt/nsr-encoder
- NSR Reranker (segunda etapa): https://huggingface.co/NYSgpt/nsr-reranker
- Dataset de evaluación NSR Eval: https://huggingface.co/datasets/NYSgpt/nsr-eval
- Colección NSR: https://huggingface.co/collections/NYSgpt/nsr-6a83f426fd0a4b01d54af471
- Perfil del autor: https://huggingface.co/NYSgpt

No se han encontrado papers académicos adicionales ni blogs oficiales más allá de la model card.
