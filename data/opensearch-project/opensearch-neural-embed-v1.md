# opensearch-project/opensearch-neural-embed-v1

## Resumen

opensearch-neural-embed-v1 es un modelo de embeddings de texto denso (vector unico) desarrollado por el OpenSearch Project, el primer modelo de embeddings densos publicado por este proyecto. Se inicializa a partir de Qwen3-Embedding-0.6B y se entrena mediante destilacion de dos modelos profesores para producir vectores de 2048 dimensiones normalizados en L2, donde la relevancia se mide por similitud coseno. Su proposito es servir como motor de recuperacion de pasajes y similitud semantica para busqueda vectorial en OpenSearch, con un equilibrio favorable entre tamano y calidad.

El modelo destaca por su eficiencia: con 598 millones de parametros (596M de backbone mas 2,1M de cabeza de proyeccion) alcanza el primer puesto entre modelos densos de vector unico por debajo de 1000 millones de parametros en el benchmark MTEB BEIR, con un promedio de 58,37 NDCG@10 sobre 15 tareas, y el segundo puesto en MTEB(eng, v2) con 73,76 de media por tarea, a solo 1,5 puntos de Qwen3-Embedding-8B, un modelo casi 13 veces mayor.

Una caracteristica tecnica relevante es que el entrenamiento no utiliza datos etiquetados: solo emplea aproximadamente 17 millones de textos en ingles sin etiquetar y los embeddings de los profesores, sin etiquetas de relevancia, sin mineria de negativos duros y sin ajuste contrastivo especifico de recuperacion. La longitud maxima de secuencia es de 8192 tokens, aunque el entrenamiento se realizo con entradas de hasta 1024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sentence Transformer (transformer denso, vector unico, basado en Qwen3-Embedding-0.6B) |
| Parametros totales | 598M (596M backbone + 2,1M cabeza de proyeccion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (entrenado con entradas de hasta 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 2048 |
| Funcion de similitud | similitud coseno (vectores normalizados en L2) |
| Pooling | mean pooling |
| Prompt de consulta | `Instruct: {task description}\nQuery:` (documentos sin prompt) |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |

## Arquitectura y entrenamiento

El modelo es un Sentence Transformer denso de vector unico que codifica consultas y documentos de forma independiente en vectores de 2048 dimensiones normalizados en L2. Parte del backbone de Qwen3-Embedding-0.6B y anade una cabeza de proyeccion de 2,1M de parametros que lo lleva al espacio de 2048 dimensiones. El estudiante se entrena para aprender un espacio profesor de 2048 dimensiones construido concatenando las 1024 dimensiones principales del embedding de cada uno de los dos profesores.

El entrenamiento se realiza en dos etapas con tres objetivos complementarios: alineacion absoluta de representacion (perdida coseno que acerca cada vector del estudiante al vector profesor del mismo texto), alineacion de similitud por pares (perdida sobre la matriz de similitudes intra-lote que reproduce la estructura de similitud de los profesores sin exigir coincidencia exacta de salidas) y alineacion de ranking relativo (perdida de ranking que usa las puntuaciones de similitud de los profesores como etiquetas suaves para preservar que pares de textos consideran mas relacionados). Todo el pipeline prescinde de datos etiquetados: usa unos 17 millones de textos en ingles sin etiquetar y los embeddings de los profesores, sin mineria de negativos duros ni ajuste contrastivo de recuperacion.

## Capacidades

- Generacion de embeddings de texto densos de 2048 dimensiones para recuperacion de pasajes y similitud semantica.
- Codificacion asimetrica de consultas y documentos: las consultas usan un prompt de instruccion (`Instruct: {task description}\nQuery:`), los documentos se codifican sin prompt.
- Recuperacion de pasajes (passage retrieval) en ingles, con soporte para instrucciones de tarea personalizables en la consulta.
- Similitud de frases y textos mediante similitud coseno entre embeddings normalizados.
- Soporte de secuencias de hasta 8192 tokens, adecuado para pasajes largos.
- Integracion con la libreria sentence-transformers y con text-embeddings-inference (tag `text-embeddings-inference` y `endpoints_compatible`).
- Orientado a busqueda vectorial con indices k-NN en OpenSearch.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No dispone de tool calling, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en OpenSearch: el modelo se integra con la busqueda vectorial k-NN de OpenSearch para indexar documentos como vectores de 2048 dimensiones y recuperar pasajes relevantes ante consultas en lenguaje natural, aprovechando su primer puesto en BEIR entre modelos densos de menos de 1000M de parametros.
- Recuperacion aumentada por generacion (RAG): actua como recuperador en pipelines RAG en ingles, codificando la consulta del usuario con el prompt de instruccion y los fragmentos de documentos sin prompt para alimentar el contexto de un modelo generativo.
- Similitud semantica y deduplicacion: calcula similitud coseno entre embeddings para agrupar documentos similares, detectar duplicados o medir cercania tematica en corpus en ingles.
- Busqueda empresarial interna: desplegado con text-embeddings-inference o sentence-transformers para indexar documentacion corporativa y ofrecer busqueda por significado en lugar de coincidencia exacta de palabras clave.
- Clasificacion y clustering de textos por embedding: los vectores de 2048 dimensiones sirven como representacion de entrada para clasificadores ligeros o algoritmos de clustering sobre corpus en ingles.
- Filtrado y ranking de candidatos en motores de busqueda: al ser un modelo de 598M de parametros, permite un coste de inferencia contenido en comparacion con modelos de embeddings de mayor tamano, lo que facilita su uso en etapas de recuperacion a gran escala.
- Sistemas de recomendacion de contenido textual: la similitud entre embeddings de articulos, productos o descripciones permite construir recomendaciones basadas en contenido.

## Benchmarks y rendimiento

| Modelo | Parametros | Dimension de embedding | BEIR-15 AVG NDCG@10 (MTEB) | MTEB(eng, v2) Mean (Task) |
|---|---|---|---|---|
| opensearch-neural-embed-v1 | 598M | 2048 | 58,37 | 73,76 |
| Qwen3-Embedding-8B | no disponible | 4096 | no disponible | 75,23 |
| Jasper-Token-Compression-600M | 607M | no disponible | no disponible | 74,75 |
| jina-embeddings-v5-text-small | 596M | no disponible | 56,67 | 71,78 |
| Yuan-embedding-2.0-en | 596M | no disponible | no disponible | 71,74 |
| Qwen3-Embedding-0.6B | 596M | no disponible | 55,52 | 70,47 |
| stella_en_400M_v5 | 435M | no disponible | 57,86 | no disponible |
| snowflake-arctic-embed-l-v2.0 | 568M | no disponible | 55,22 | no disponible |

Las puntuaciones de opensearch-neural-embed-v1 proceden de la evaluacion propia del autor; las del resto de modelos provienen del leaderboard de MTEB o de sus model cards.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de aproximadamente 2,4 GB en el repositorio, la inferencia en precision completa (fp32) requiere del orden de 2,4 GB de pesos mas memoria para activaciones; en fp16/bf16 se reduce a aproximadamente 1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM puede ejecutar el modelo en fp16; las GPU de datacenter (A100, H100) permiten mayor throughput en indexacion por lotes.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con suficiente VRAM para el tamano de lote deseado.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (el modelo incluye el tag correspondiente), transformers, y despliegue como endpoint compatible con la API de embeddings.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BEIR-15 AVG NDCG@10 | MTEB(eng, v2) | Licencia |
|---|---|---|---|---|---|
| opensearch-neural-embed-v1 | 598M | 8192 tokens | 58,37 | 73,76 | Apache 2.0 |
| Qwen3-Embedding-0.6B | 596M | no disponible | 55,52 | 70,47 | no disponible |
| jina-embeddings-v5-text-small | 596M | no disponible | 56,67 | 71,78 | no disponible |
| stella_en_400M_v5 | 435M | no disponible | 57,86 | no disponible | no disponible |
| snowflake-arctic-embed-l-v2.0 | 568M | no disponible | 55,22 | no disponible | no disponible |

Frente a Qwen3-Embedding-0.6B, del que deriva, mejora tanto en BEIR (58,37 frente a 55,52) como en MTEB(eng, v2) (73,76 frente a 70,47) con practicamente el mismo numero de parametros. Frente a Qwen3-Embedding-8B, casi 13 veces mayor, queda a 1,5 puntos en MTEB(eng, v2) con la mitad de dimension de embedding.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: no esta entrenado para otros idiomas, por lo que su rendimiento fuera del ingles no esta garantizado.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Entrenado con entradas de hasta 1024 tokens aunque soporta secuencias de 8192; el rendimiento en secuencias mas largas de lo visto en entrenamiento puede degradarse.
- Entrenado sin datos etiquetados mediante destilacion: puede heredar los sesgos de los modelos profesores y de los 17 millones de textos no etiquetados utilizados.
- Riesgo de que las representaciones reflejen sesgos presentes en el corpus de entrenamiento en ingles.
- Las puntuaciones de benchmarks son de evaluacion propia del autor; las comparaciones con otros modelos usan datos de terceros (leaderboard o model cards) que pueden no ser directamente comparables.
- Para uso en produccion conviene validar el rendimiento en el dominio concreto, ya que las metricas agregadas de BEIR y MTEB no garantizan el comportamiento en corpus especializados.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3-Embedding-0.6B del que deriva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opensearch-project/opensearch-neural-embed-v1
- Modelo base Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio del OpenSearch Project: https://github.com/opensearch-project
- Documentacion de busqueda vectorial k-NN en OpenSearch: https://opensearch.org/docs/latest/vector-search/
- Paper de referencia (arXiv:2412.19048): https://arxiv.org/abs/2412.19048
