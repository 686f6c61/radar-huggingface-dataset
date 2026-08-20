# Rebine/Qwen3.5-Embedding-0.8B

## Resumen

Qwen3.5-Embedding-0.8B es un modelo de embeddings bilingüe (chino-inglés) desarrollado por Rebine, obtenido mediante fine-tuning de 5 épocas sobre el modelo base Qwen/Qwen3.5-0.8B-Base. El modelo está diseñado específicamente para la recuperación semántica de memoria en el asistente OpenClaw, un escenario de búsqueda sobre pasajes almacenados con consultas cortas de tipo palabra clave y preguntas en lenguaje natural.

Su relevancia reside en que cubre un nicho concreto: la búsqueda de memoria de agentes conversacionales, donde se necesita un modelo ligero (752 millones de parámetros) capaz de ejecutarse en hardware modesto y de producir vectores de dimensión variable mediante dimensiones estilo Matryoshka (128, 256, 512, 768 y 1024). El modelo no incluye un wrapper de pooling integrado; el usuario debe implementar el protocolo de codificación descrito por el autor: prefijo de instrucción en la consulta, pooling del último token y normalización L2.

En las pruebas de validación publicadas, el modelo supera al oficial Qwen/Qwen3-Embedding-0.6B en dimensiones altas (768 y 1024) en los tres conjuntos de evaluación, aunque queda por detrás en dimensiones bajas (128 y 256) en los escenarios de memoria de OpenClaw.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-0.8B-Base) adaptado a embeddings |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino e ingles (según model card) |
| Licencia | apache-2.0 (pendiente de confirmacion de la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base Qwen/Qwen3.5-0.8B-Base y se somete a un proceso de fine-tuning de 5 épocas para la tarea de recuperación semántica. El resultado es un modelo denso de tipo encoder para embeddings, sin cabezales de generación de texto, que se usa exclusivamente para extraer representaciones vectoriales de consultas y pasajes.

El protocolo de codificación exige un tratamiento diferenciado entre consultas y pasajes: las consultas llevan el prefijo de instrucción `Instruct: Given a query, retrieve relevant passages that answer the query\nQuery: {query}`, mientras que los pasajes (memorias) se codifican sin prefijo. El vector final se obtiene con pooling del último token y normalización L2. El modelo soporta dimensiones Matryoshka de 128, 256, 512, 768 y 1024, lo que permite ajustar el compromiso entre calidad de ranking y coste de almacenamiento.

No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Recuperación semántica bilingüe (chino/inglés) para búsqueda de memoria en agentes como OpenClaw.
- Generación de embeddings de similitud de frases con dimensiones configurables mediante la técnica Matryoshka (128, 256, 512, 768 y 1024).
- Protocolo de codificación explícito y reproducible: prefijo de instrucción en consultas, pooling del último token y normalización L2.
- Adecuado para consultas cortas (palabras clave) y preguntas en lenguaje natural.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio; es un modelo exclusivo de extracción de características.

## Casos de uso

- Búsqueda de memoria en agentes conversacionales: el modelo permite indexar la memoria de un asistente (OpenClaw) y recuperar los fragmentos relevantes ante una consulta del usuario, mejorando la coherencia de las respuestas con contexto histórico.
- Recuperación de información en documentos bilingües: puede usarse para construir un índice vectorial sobre una base de documentos chino-inglesa y responder consultas en cualquiera de los dos idiomas.
- Sistema de preguntas y respuestas sobre conocimiento interno: las consultas se convierten en vectores con el prefijo de instrucción y se comparan contra una base de pasajes pre-indexados.
- Deduplicación y agrupación de contenido: los embeddings de 768 o 1024 dimensiones permiten agrupar fragmentos de texto por similitud semántica para detectar duplicados o temas recurrentes.
- RAG (Retrieval-Augmented Generation) en entornos de hardware limitado: con 752 M de parámetros, el modelo puede ejecutarse en GPU de consumo para alimentar un pipeline de generación aumentada por recuperación.
- Experimentación con embeddings Matryoshka: permite evaluar el compromiso entre dimensiones reducidas (128, 256) para ahorro de almacenamiento y dimensiones altas (768, 1024) para mayor calidad de ranking.

## Benchmarks y rendimiento

La model card del autor incluye tres conjuntos de evaluación comparando este modelo (S2) con Qwen/Qwen3-Embedding-0.6B (Official), usando la misma tokenización, instrucción, pooling, corpus y conjunto de consultas.

### OpenClaw fine-tuning validation

| Dim | S2 R@1 | Official R@1 | S2 R@3 | Official R@3 | S2 R@5 | Official R@5 | S2 R@10 | Official R@10 | S2 MRR | Official MRR |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 128 | 8,96% | 17,19% | 19,57% | 31,84% | 25,82% | 37,98% | 35,32% | 46,49% | 17,57% | 27,38% |
| 256 | 15,04% | 20,12% | 30,74% | 35,99% | 38,58% | 43,67% | 50,14% | 52,35% | 26,46% | 31,25% |
| 512 | 21,67% | 22,33% | 40,57% | 39,19% | 49,75% | 47,21% | 62,02% | 57,16% | 34,84% | 34,11% |
| 768 | 23,88% | 22,94% | 44,67% | 40,57% | 53,45% | 48,31% | 65,06% | 58,71% | 37,60% | 34,97% |
| 1024 | 25,21% | 23,66% | 45,55% | 41,46% | 54,62% | 49,36% | 66,56% | 59,92% | 38,86% | 35,66% |

### Unseen OpenClaw memory (382 fragmentos posteriores a 2026-08-08, 1.048 consultas generadas por Gemini)

| Dim | S2 R@1 | Official R@1 | S2 R@3 | Official R@3 | S2 R@5 | Official R@5 | S2 R@10 | Official R@10 | S2 MRR | Official MRR |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 128 | 12,02% | 18,80% | 26,15% | 40,55% | 35,50% | 49,43% | 47,81% | 59,73% | 23,76% | 33,14% |
| 256 | 17,08% | 20,32% | 35,40% | 43,89% | 45,99% | 51,91% | 61,83% | 62,02% | 31,00% | 35,07% |
| 512 | 20,42% | 23,09% | 43,23% | 45,32% | 54,87% | 54,10% | 68,61% | 63,93% | 36,48% | 37,40% |
| 768 | 21,56% | 22,04% | 45,80% | 45,80% | 59,06% | 54,39% | 72,23% | 63,84% | 38,22% | 36,91% |
| 1024 | 22,33% | 21,09% | 46,47% | 45,52% | 58,59% | 53,91% | 72,04% | 64,31% | 38,80% | 36,25% |

### Conventional content validation sample (382 consultas, 761 pasajes únicos)

| Dim | S2 R@1 | Official R@1 | S2 R@3 | Official R@3 | S2 R@5 | Official R@5 | S2 R@10 | Official R@10 | S2 MRR | Official MRR |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 128 | 80,37% | 81,41% | 93,46% | 93,19% | 96,60% | 96,34% | 98,43% | 97,91% | 87,45% | 87,93% |
| 256 | 87,70% | 85,86% | 96,60% | 93,98% | 98,43% | 96,34% | 99,74% | 97,64% | 92,42% | 90,43% |
| 512 | 89,53% | 85,34% | 97,91% | 93,72% | 99,21% | 96,34% | 99,74% | 98,43% | 93,71% | 90,22% |
| 768 | 91,10% | 84,82% | 97,64% | 95,03% | 99,21% | 97,38% | 99,74% | 98,69% | 94,58% | 90,34% |
| 1024 | 91,36% | 84,29% | 97,64% | 95,29% | 98,95% | 97,12% | 99,74% | 98,69% | 94,74% | 90,13% |

No se han publicado resultados en benchmarks estándar de la comunidad (MTEB, MIRACL, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 752 millones de parámetros; en precisión FP16 ocupa aproximadamente 1,5 GB, por lo que cabe en GPU de consumo con 4 GB o más de VRAM.
- GPUs recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.); para despliegues de alta concurrencia, una A10 o A100.
- Opciones de despliegue: al ser un modelo de la familia `transformers`, puede ejecutarse con `transformers` (pipeline de feature-extraction), `sentence-transformers` (implementando manualmente el pooling), o servirse con herramientas como vLLM o TGI si se configura como encoder.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, la latencia por lote será baja en GPU moderna, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones Matryoshka | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rebine/Qwen3.5-Embedding-0.8B | 752 M | no disponible | 128, 256, 512, 768, 1024 | apache-2.0 | HuggingFace |
| Qwen/Qwen3-Embedding-0.6B | 600 M aprox. | no disponible | sí | apache-2.0 | HuggingFace |
| BGE-M3 (BAAI) | 568 M | 8192 | sí (hasta 1024) | MIT | HuggingFace |

En los benchmarks publicados por el autor, el modelo supera al Qwen/Qwen3-Embedding-0.6B en dimensiones de 768 y 1024 en los tres conjuntos de evaluación, pero queda por debajo en dimensiones de 128 y 256 en los escenarios de memoria de OpenClaw. No se dispone de comparación directa con otros modelos de la categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para recuperación semántica de memoria en OpenClaw; no es un modelo de propósito general para tareas de clasificación o búsqueda sobre dominios muy distintos.
- En dimensiones de 128 y 256, el rendimiento (Recall@1, MRR) es notablemente inferior al del modelo oficial Qwen/Qwen3-Embedding-0.6B, tanto en la validación de fine-tuning como en memoria no vista; si se necesita calidad en dimensiones bajas, se debe evaluar el modelo alternativo.
- La model card indica que el protocolo de pooling (último token) y el prefijo de instrucción deben implementarse manualmente; no hay un wrapper de `sentence-transformers` incluido, por lo que un uso incorrecto degrada el rendimiento.
- La licencia se declara como apache-2.0, pero el autor indica que debe verificarse la licencia del modelo base Qwen/Qwen3.5-0.8B-Base para uso comercial.
- No se han publicado detalles del dataset de entrenamiento ni métricas de sesgos; el modelo está entrenado principalmente con datos de memoria de OpenClaw, por lo que su comportamiento fuera de ese dominio no está validado.
- Riesgo de alucinación no aplica directamente (no genera texto), pero la calidad de recuperación puede ser baja si las consultas son muy diferentes del estilo de las consultas de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rebine/Qwen3.5-Embedding-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Modelo comparado (Qwen3-Embedding-0.6B): https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
