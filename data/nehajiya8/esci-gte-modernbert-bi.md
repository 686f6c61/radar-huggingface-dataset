# nehajiya8/esci-gte-modernbert-bi

## Resumen

esci-gte-modernbert-bi es un bi-encoder de recuperación densa para búsqueda de productos en comercio electrónico, desarrollado por nehajiya8 (proyecto de Neha Nambiar) mediante fine-tuning de Alibaba-NLP/gte-modernbert-base. Codifica consultas y fichas de producto en vectores de 768 dimensiones comparables por similitud coseno, de forma que una consulta corta como "canon 5d mark iv" se puede resolver sobre un catálogo completo de productos sin coincidencia léxica exacta.

El modelo tiene 149.014.272 parámetros y se ha afinado sobre la parte en inglés del dataset Amazon ESCI (Shopping Queries), con 17.678 pares Exact y un esquema de negativos en dos niveles: negativos juzgados por ESCI (Substitute, Complement, Irrelevant) y negativos minados con el propio modelo base. Frente al modelo base sin ajustar, sube Recall@100 de 0,5979 a 0,6483 y NDCG@10 de 0,7392 a 0,7543 sobre 8.956 consultas de test y un catálogo de 482.105 productos.

Su interés práctico es doble: es un ejemplo reproducible y económico (un solo epoch, 35 pasos, unos 12 minutos en una RTX 4090) de cuánto aporta la selección de negativos en retrieval de producto, y publica ablaciones por rama (A, B, C, D y `prefixed`) con las métricas de cada configuración. La licencia Apache-2.0 y el tamaño de 149M lo hacen apto para despliegue en CPU o GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT), bi-encoder de dos torres con embedding compartido |
| Parámetros totales | 149.014.272 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | La model card fija `max_seq_length = 256` para productos y 64 para consultas; el modelo base ModernBERT soporta ventanas mayores, aunque el valor nativo no se confirma en la información proporcionada |
| Tipos de cuantización | No se publican checkpoints cuantizados; pesos en safetensors (bf16 en entrenamiento). Cuantización int8/ONNX factible con herramientas estándar, no evaluada en la información disponible |
| Idiomas soportados | Inglés (`en`); evaluación únicamente sobre productos y consultas en inglés de EE. UU. |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con `sentence-transformers`); repositorio de 4,8 GB con varias revisiones/ramas |
| Dimensión del embedding | 768 |
| Función de similitud | Coseno (se recomienda `normalize_embeddings=True`) |
| Modelo base | Alibaba-NLP/gte-modernbert-base |
| Pipeline | sentence-similarity / feature-extraction |
| Descargas / likes | 51 descargas, 0 likes (a fecha de actualización 2026-10-20) |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT de 149M parámetros y 768 dimensiones de salida, usado como bi-encoder: consulta y producto se codifican por separado y se comparan por similitud coseno, lo que permite precalcular los embeddings de todo el catálogo e indexarlos en un motor ANN. El texto de producto se compone como `title | brand | color | bullet points | description`, omitiendo campos vacíos y truncando a 256 tokens; las consultas se truncan a 64 tokens.

El entrenamiento usa la parte inglesa de ESCI (Task 1 reducida): 17.678 pares Exact procedentes de 3.585 consultas, elegidos para que todas las configuraciones pudieran llenar sus negativos. Los negativos son juzgados (productos etiquetados Substitute, Complement o Irrelevant para la consulta) y minados (vecinos más próximos de la consulta bajo el modelo base, excluyendo los Exact). La pérdida es multiple negatives ranking loss con GradCache, batch efectivo de 512 en trozos de 32, un epoch (35 pasos), learning rate 2e-5, bf16 y una única RTX 4090 (unos 12 minutos). No hay fase de RLHF ni DPO: es un ajuste supervisado puro de retrieval.

La innovación metodológica está en la ablación de negativos: la rama A usa solo in-batch, la B añade 3 negativos juzgados, la C suma 4 negativos minados filtrados y la D (rama `main`) usa 4 negativos minados sin filtrar. Existe además una rama `prefixed` idéntica a D pero con los prefijos `"query: "` y `"document: "`, que obtiene las mejores cifras publicadas.

## Capacidades

- Generación de embeddings de frase y de documento para recuperación densa (dense retrieval) en dominios de producto.
- Búsqueda semántica consulta-producto sobre catálogos grandes: Recall@100 de 0,6483 y Recall@1000 de 0,8435 en el test de ESCI.
- Codificación de fichas de producto heterogéneas (título, marca, color, bullets, descripción) en un único vector de 768 dimensiones.
- Similitud semántica entre productos (útil para "productos relacionados", sustitutos y complementarios).
- Extracción de features para clasificación o clustering sobre embeddings (tag `feature-extraction`).
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso: no es un modelo instructivo.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Sin capacidades multilingües: solo inglés.
- Compatible con Hugging Face Text Embeddings Inference (tag `text-embeddings-inference`), lo que permite servirlo como endpoint de embeddings.

## Casos de uso

- Búsqueda semántica en catálogo de e-commerce: precalcular los embeddings de las 482.105 fichas con `max_seq_length = 256`, indexarlos en un motor ANN (FAISS, Qdrant, Milvus) y codificar la consulta en línea; el modelo recupera el producto Exact en el top-100 en el 64,8 % de las consultas de test, muy por encima de BM25 ajustado (57,8 %).
- Hybrid search con BM25: la fusión por reciprocal rank fusion de BM25 y este modelo alcanza Recall@100 de 0,6867 y Recall@1000 de 0,8650, la mejor combinación publicada; se implementa lanzando ambas recuperaciones en paralelo y fusionando rankings.
- Re-ranking de resultados de un buscador existente: usar los embeddings como segunda etapa sobre el top-100 de un motor léxico, ordenando por similitud coseno para mejorar el NDCG@10 (0,7543 frente a 0,7062 de BM25).
- Recomendación de sustitutos y complementarios: los negativos juzgados Substitute y Complement del dataset ESCI alinean el espacio con relaciones de sustituibilidad, de modo que la similitud entre fichas sirve para bloques de "alternativas" y "accesorios".
- Deduplicación y control de calidad de catálogo: agrupar fichas casi idénticas por umbral de similitud coseno y detectar duplicados entre marketplaces o proveedores antes de publicar.
- Minería de negativos para otros modelos de ranking: usar el modelo para generar vecinos próximos por consulta y alimentar el entrenamiento de un cross-encoder o de un sistema de re-ranking posterior.
- Enrutado de consultas y atención al cliente: mapear una consulta en lenguaje natural a una categoría o ficha concreta comparando su embedding con prototipos, para derivar la conversación al flujo adecuado.
- Evaluación de gaps de catálogo: codificar un listado de consultas reales y medir la similitud máxima contra el catálogo para detectar demandas sin cobertura (productos inexistentes o mal indexados).

## Benchmarks y rendimiento

Evaluación sobre 8.956 consultas de test de ESCI y el catálogo completo de 482.105 productos. Recall cuenta productos Exact encontrados en el top-k de todo el catálogo; NDCG@10 ordena los productos juzgados de cada consulta con ganancias Exact 1, Substitute 0,1, Complement 0,01, Irrelevant 0.

| Modelo | Recall@100 | Recall@1000 | NDCG@10 |
|---|---|---|---|
| BM25 (ajustado) | 0,5775 | 0,7727 | 0,7062 |
| gte-modernbert-base sin ajustar | 0,5979 | 0,8097 | 0,7392 |
| Este modelo (rama D, `main`) | 0,6483 | 0,8435 | 0,7543 |
| BM25 + este modelo (RRF) | 0,6867 | 0,8650 | 0,7409 |

Ablación por configuración de negativos (mismos 17.678 pares y mismos hiperparámetros en todas las ramas):

| Rama | Negativos por par | Recall@100 | NDCG@10 |
|---|---|---|---|
| A | solo in-batch | 0,6204 | 0,7364 |
| B | + 3 juzgados no Exact | 0,6396 | 0,7499 |
| C | + 3 juzgados + 4 minados filtrados | 0,6428 | 0,7480 |
| D (`main`) | + 3 juzgados + 4 minados sin filtrar | 0,6483 | 0,7543 |
| `prefixed` | como D, con prefijos `query: `/`document: ` | 0,6587 | 0,7581 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de modelos generativos en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- Huella de pesos: 149M parámetros, aproximadamente 596 MB en fp32 y 298 MB en bf16/fp16 (estimación por tamaño de parámetros).
- VRAM para inferencia: por debajo de 1 GB en bf16 para el modelo; el consumo real lo domina el tamaño de batch y la longitud de secuencia (256 tokens por producto).
- GPU de consumo: cabe holgadamente en RTX 4090, RTX 4080, RTX 3090, RTX 3060 (12 GB) e incluso en GPUs de 4-6 GB; una RTX 4090 entrenó esta rama en unos 12 minutos.
- CPU: viable para servir consultas sueltas y para indexación por lotes, dado el tamaño reducido del encoder.
- Índice vectorial: 482.105 productos × 768 dimensiones ≈ 1,48 GB en fp32 y ≈ 0,74 GB en fp16 (estimación aritmética), antes de la sobrecarga del motor ANN.
- Opciones de despliegue: `sentence-transformers`, Hugging Face Text Embeddings Inference (tag `text-embeddings-inference` en el repo), exportación a ONNX y motores de búsqueda vectorial (FAISS, Qdrant, Milvus, pgvector).
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento se midió (12 minutos en RTX 4090), pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión | Recall@100 (ESCI) | NDCG@10 (ESCI) | Licencia |
|---|---|---|---|---|---|
| Este modelo (`main`) | 149,0 M | 768 | 0,6483 | 0,7543 | Apache-2.0 |
| Este modelo (`prefixed`) | 149,0 M | 768 | 0,6587 | 0,7581 | Apache-2.0 |
| Alibaba-NLP/gte-modernbert-base | 149,0 M | 768 | 0,5979 | 0,7392 | Apache-2.0 |
| BM25 ajustado (base léxica, no neuronal) | No aplica | No aplica | 0,5775 | 0,7062 | No aplica |
| BM25 + este modelo (RRF) | No aplica | No aplica | 0,6867 | 0,7409 | Apache-2.0 (modelo) |

Alternativas habituales de la misma categoría (bi-encoders ligeros tipo all-MiniLM-L6-v2 o bge-base-en-v1.5) no tienen resultados publicados sobre ESCI en la información disponible, por lo que no se pueden comparar numéricamente aquí. Frente al modelo base, la ganancia es de +0,0504 en Recall@100 y +0,0151 en NDCG@10; frente a BM25 ajustado, +0,0708 y +0,0481.

## Limitaciones y advertencias

- Una sola semilla por rama: el autor advierte que las diferencias entre C y D, y la mejora por prefijos, están dentro del ruido estadístico; no se deben tratar como mejoras consolidadas.
- Evaluación restringida a productos y consultas en inglés de EE. UU. del dataset ESCI; el comportamiento en otros idiomas, mercados o dominios (moda, alimentación, marketplace generalista) no está medido.
- El ajuste se hizo con 3.585 consultas y 17.678 pares: es un conjunto pequeño y el modelo puede sobreajustar al estilo de título y bullets de Amazon.
- Truncado agresivo: 256 tokens para productos y 64 para consultas; descripciones largas, especificaciones técnicas o variantes quedan fuera del embedding.
- Riesgo de recuperación léxicamente plausible pero semánticamente incorrecta en consultas ambiguas o muy cortas (marcas, modelos con nomenclatura confusa); conviene combinarlo con BM25 o con un cross-encoder de re-ranking.
- No es un modelo generativo: no responde preguntas, no cita fuentes y no puede usarse para generar texto, seguir instrucciones ni ejecutar herramientas; cualquier caso de uso conversacional exige un LLM adicional.
- Las métricas NDCG@10 dependen de la jerarquía de ganancias de ESCI (Substitute 0,1, Complement 0,01); no son comparables con NDCG de otros conjuntos con juicios binarios.
- No se documentan evaluaciones de sesgo, robustez adversarial ni comportamiento ante consultas tóxicas.
- Licencia Apache-2.0, que permite uso comercial; los datos de entrenamiento proceden de ESCI (Apache-2.0) y de fichas de producto de Amazon, por lo que conviene revisar los términos de uso de los datos subyacentes antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nehajiya8/esci-gte-modernbert-bi
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Repositorio del proyecto, código y resultados completos: https://github.com/neha-nambiar/esci-product-search
- Dataset Amazon Shopping Queries (ESCI): https://github.com/amazon-science/esci-data
- Dataset en Hugging Face (`tasksource/esci`): https://huggingface.co/datasets/tasksource/esci
- Librería sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Rama con prefijos: https://huggingface.co/nehajiya8/esci-gte-modernbert-bi/tree/prefixed
