# cutiepienagger/nosql-rag-vector-search-hnsw-ivf

## Resumen

El repositorio `cutiepienagger/nosql-rag-vector-search-hnsw-ivf` no contiene un modelo de lenguaje entrenado en el sentido habitual, sino un conjunto de implementaciones de referencia para pipelines de RAG (Retrieval-Augmented Generation) y búsqueda vectorial aproximada (ANN) sobre bases de datos NoSQL. Lo publica el usuario cutiepienagger como parte de un experimento de laboratorio ("Laboratory Experiment 17: Semantic Vector Search & RAG Pipeline") dentro de un curso de sistemas de bases de datos NoSQL avanzados.

El material incluye tres componentes: un chunker de documentos con ventanas de 50 palabras y proyección densa a 384 dimensiones con normalización L2, dos índices ANN (HNSW con grafo multicapa tipo skip-list e IVF con particionado por centroides) y una capa de recuperación que construye prompts de contexto para un LLM externo. El objetivo declarado es didáctico: comparar el compromiso entre latencia, recall y consumo de memoria de HNSW frente a IVF, tomando una búsqueda exhaustiva por fuerza bruta como verdad de referencia.

La relevancia práctica es limitada como "modelo" (no hay pesos entrenados publicados, pipeline declarado `feature-extraction` pero sin checkpoint verificable), aunque sí resulta útil como referencia de código para entender cómo se comportan los índices vectoriales en un corpus pequeño (3.000 vectores) y cómo se estructura un pipeline RAG con recuperación top-k. La licencia MIT y la ausencia de dependencias pesadas (solo NumPy) facilitan su reutilización con fines educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal entrenado; es un conjunto de implementaciones de referencia (chunker + embeddings densos de 384 dimensiones + índices ANN HNSW/IVF + pipeline RAG) |
| Parametros totales | no disponible (no se publican pesos de modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (chunking fijo de 50 palabras por fragmento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene código Python, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no describe el entrenamiento de una red neuronal. La componente de representación es una "proyección densa de tokens semánticos de 384 dimensiones con normalización unitaria L2" y similitud coseno, pero la model card no especifica qué encoder genera esos embeddings (no se indica si es un modelo preentrenado como Sentence-BERT, un hashing aleatorio o una proyección determinista). El chunker divide documentos en ventanas acotadas de 50 palabras.

La parte técnica más detallada son los índices ANN. HNSW se implementa como grafo de proximidad multicapa tipo skip-list, con parámetros M (conexiones por nodo) y ef (tamaño de la lista de candidatos en búsqueda), y se presenta como equivalente al operador `$vectorSearch` de MongoDB Atlas. IVF particiona el espacio en `nlist` centroides y explora `nprobe` clústeres por consulta. La búsqueda Flat por fuerza bruta actúa como ground truth. No se documentan datos de entrenamiento, número de tokens, ni fases de RLHF/DPO, porque no aplica a este artefacto.

## Capacidades

- Recuperación semántica densa sobre documentos textuales mediante similitud coseno en espacio de 384 dimensiones.
- Chunking de documentos en ventanas de 50 palabras con metadatos de título de fuente.
- Indexación ANN con HNSW (parámetros M y ef configurables) y con IVF (parámetros nlist y nprobe configurables).
- Búsqueda exhaustiva por fuerza bruta como referencia exacta (recall 100%).
- Construcción de prompts de contexto "grounded" a partir de los top-k fragmentos recuperados, orientados a reducir alucinaciones en un LLM externo.
- Benchmark reproducible de ANN (función `run_ann_benchmark(n_vectors, dim, n_queries, k)`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: no es un LLM.

## Casos de uso

- Docencia de bases de datos NoSQL: el repositorio sirve como material de laboratorio para que estudiantes comparen HNSW e IVF sobre el mismo corpus y midan latencia, recall y memoria con NumPy.
- Prototipado de un pipeline RAG mínimo: `SimpleRAG().ingest(DOCUMENTS)` y `retrieve(query, top_k=2)` permiten montar una demo de recuperación aumentada sin dependencias externas pesadas.
- Evaluación de compromisos de índice antes de migrar a producción: los datos de benchmark (HNSW M=16/ef=64 con 98,4% de recall a 2,15 ms frente a IVF nlist=50/nprobe=10 con 89,2% a 1,45 ms) orientan la elección inicial de parámetros en MongoDB Atlas u otros motores vectoriales.
- Referencia para implementar `$vectorSearch` en MongoDB Atlas: el HNSW del repositorio replica conceptualmente el comportamiento del operador, útil para entender qué hace internamente antes de ajustar `numCandidates`.
- Generación de contexto para un LLM externo en dominios acotados (taxonomía NoSQL, caché WiredTiger, quórum de réplicas, sharding), donde el corpus es pequeño y controlado.
- Base para ejercicios de evaluación de recuperación: comparar recall@k de HNSW e IVF contra la búsqueda Flat para fijar umbrales de calidad aceptables.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 3.000 vectores densos, 20 consultas de prueba y k=10:

| Índice | Parámetros | Tiempo de construcción (s) | Latencia media (ms) | Recall (%) | Memoria |
|---|---|---|---|---|---|
| Flat brute-force | Escaneo exhaustivo | 0,01 | 14,85 | 100,0 | Baseline |
| HNSW (Atlas default) | M=16, ef=64 | 2,45 | 2,15 | 98,4 | Alta (aristas del grafo) |
| HNSW (alto recall) | M=32, ef=128 | 4,10 | 2,68 | 99,6 | Alta |
| IVF (clusterizado) | nlist=50, nprobe=10 | 0,85 | 1,45 | 89,2 | Baja (listas invertidas) |
| IVF (sondeo profundo) | nlist=100, nprobe=25 | 1,15 | 1,95 | 94,8 | Baja |

No se aportan resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque el artefacto no es un LLM.

## Requisitos de hardware

- No requiere GPU: la implementación depende únicamente de NumPy y opera sobre 3.000 vectores de 64 dimensiones en el benchmark (384 en la proyección declarada), por lo que cabe en CPU y memoria RAM convencional.
- Instalación mínima: `pip install numpy`.
- Despliegue: ejecución directa de los módulos `rag_pipeline.py` y `hnsw_ivf_benchmark.py`; no se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de modelo que servir.
- Latencia observada: entre 1,45 ms (IVF clusterizado) y 14,85 ms (Flat) por consulta en el entorno de prueba descrito; el throughput no se publica.
- Para escalar a corpus reales habría que sustituir la proyección de embeddings por un encoder preentrenado y migrar los índices a un motor como FAISS, hnswlib o MongoDB Atlas.

## Comparativa con modelos similares

| Artefacto | Tipo | Pesos publicados | Índices ANN incluidos | Licencia | Uso principal |
|---|---|---|---|---|---|
| nosql-rag-vector-search-hnsw-ivf (este) | Referencia educativa RAG/ANN | No | HNSW, IVF, Flat | MIT | Docencia y prototipos |
| FAISS (Meta) | Librería de búsqueda vectorial | No aplica | HNSW, IVF, PQ, Flat y variantes | MIT | Producción a gran escala |
| hnswlib | Librería HNSW | No aplica | HNSW | Apache 2.0 | Búsqueda ANN de alto rendimiento |
| MongoDB Atlas Vector Search | Servicio gestionado | No aplica | HNSW propietario | Comercial | RAG en producción sobre MongoDB |

La comparación con modelos de lenguaje no procede: este repositorio no compite con LLM, sino con librerías de indexación vectorial, frente a las cuales ofrece menos funcionalidad (sin cuantización de producto, sin GPU, sin persistencia) pero mayor valor didáctico por su simplicidad y ausencia de dependencias.

## Limitaciones y advertencias

- No se publican pesos de modelo; el pipeline `feature-extraction` declarado no tiene checkpoint verificable, por lo que no puede usarse como encoder listo para producción.
- El origen de los embeddings de 384 dimensiones no está documentado: no se especifica si provienen de un modelo preentrenado, de hashing o de una proyección aleatoria, lo que impide evaluar su calidad semántica real.
- Los benchmarks se limitan a 3.000 vectores y 20 consultas, un régimen muy pequeño que no extrapola a corpus de millones de documentos.
- Solo se declara soporte de inglés (`en`); no hay validación multilingüe.
- El recall de IVF (89,2%–94,8%) es sensiblemente inferior al de HNSW (98,4%–99,6%); usar IVF en producción exige ajustar nprobe y validar el recall contra la verdad de referencia.
- La afirmación de "zero hallucinations" en la capa RAG es una garantía del prompt de contexto, no del LLM que lo consume; no debe interpretarse como una propiedad del artefacto.
- Licencia MIT permite uso comercial, pero al no haber pesos ni servicio, el valor comercial es el código de referencia, no un modelo desplegable.
- Repositorio con 0 descargas y 1 like: sin comunidad ni mantenimiento verificable; tratar como material educativo congelado.

## Enlaces

- Hugging Face: https://huggingface.co/cutiepienagger/nosql-rag-vector-search-hnsw-ivf
- FAISS (referencia de comparación): https://github.com/facebookresearch/faiss
- hnswlib (referencia de comparación): https://github.com/nmslib/hnswlib
- Documentación de MongoDB Atlas Vector Search: https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/
- Paper original de HNSW (Malkov y Yashunin): https://arxiv.org/abs/1603.09320
