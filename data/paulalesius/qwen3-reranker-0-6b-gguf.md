# paulalesius/Qwen3-Reranker-0.6B-GGUF

## Resumen

Qwen3-Reranker-0.6B-GGUF es una cuantizacion GGUF del modelo Qwen3-Reranker-0.6B de Qwen Team, preparada por paulalesius para ejecutarse con llama.cpp en tareas de reranking de texto. El modelo original es un cross-encoder de 595,8 millones de parametros que forma parte de la serie Qwen3 Embedding, disenada especificamente para tareas de embedding y ranking sobre los modelos densos fundacionales de Qwen3. Esta version cuantizada emplea una estrategia hibrida: comprime las capas lineales grandes y la tabla de embeddings en NVFP4 o Q6_K, pero mantiene la cabeza de relevancia en BF16 y todos los tensores de normalizacion en F32, reduciendo el tamano del archivo entre 2,4 y 3,5 veces respecto al BF16 con una perdida minima de fidelidad.

La relevancia de este modelo radica en que permite desplegar un reranker de calidad en hardware modesto, incluso en CPU, manteniendo la precision de las puntuaciones de relevancia. Las pruebas de fidelidad del autor demuestran que la version Q6_K es practicamente indistinguible del BF16 (Spearman ρ de 0,9962 sobre 60 rerankings), mientras que la version NVFP4 preserva las decisiones binarias de relevancia pero distorsiona las puntuaciones intermedias en documentos ambiguos. El repositorio se publico en agosto de 2026 y es una opcion reciente dentro del ecosistema de cuantizaciones GGUF para rerankers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder, cross-encoder) |
| Parametros totales | 595.778.560 (0,6B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4,58 bpw efectivos), Q6_K (6,65 bpw efectivos) |
| Idiomas soportados | mas de 100 idiomas, incluyendo lenguajes de programacion |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF v3 (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Reranker-0.6B es un cross-encoder basado en la arquitectura Qwen3 que procesa pares consulta-documento de forma conjunta y emite una puntuacion de relevancia binaria (sí/no) a traves de una cabeza de clasificacion de 2 salidas (cls.output.weight, 1024 × 2). La serie Qwen3 Embedding, descrita en el articulo arXiv:2506.05176, se construye sobre los modelos densos fundacionales de Qwen3 y esta orientada a tareas de recuperacion de informacion, con soporte multilingue y de codigo.

La cuantizacion GGUF de paulalesius es deliberadamente hibrida: los 197 tensores correspondientes a las capas de atencion y FFN (28 bloques × 7) mas la tabla de embeddings (1024 × 151.669) se comprimen en NVFP4 o Q6_K, mientras que la cabeza de relevancia se mantiene en BF16 y los 113 tensores de normalizacion (attn_norm, ffn_norm, attn_q_norm, attn_k_norm y output_norm) se conservan en F32. El archivo contiene 311 tensores en total. Esta distribucion de precisiones busca proteger los tensores que mas influyen directamente en la puntuacion final de relevancia, a diferencia de una cuantizacion uniforme generada con llama-quantize.

## Capacidades

- Reranking de documentos: puntua pares consulta-documento con una salida binaria de relevancia mediante el endpoint /rerank de llama.cpp (llama-server --reranking).
- Multilingue: soporta mas de 100 idiomas, incluyendo recuperacion cross-lingual entre idiomas distintos.
- Recuperacion de codigo: capaz de rerankear resultados de busqueda en repositorios de codigo fuente, segun la documentacion de la serie Qwen3 Embedding.
- Cuantizacion hibrida de alta fidelidad: la cabeza de relevancia permanece en BF16 y las normalizaciones en F32, preservando la precision de las puntuaciones.
- Ejecucion en CPU: al ser un modelo de 0,6B cuantizado, puede ejecutarse en CPU con llama.cpp sin necesidad de GPU.
- Compatibilidad con el ecosistema GGUF: integrable con cualquier runtime que soporte GGUF v3 y la arquitectura qwen3.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): rerankear los resultados obtenidos por un retriever denso o BM25 antes de pasarlos al LLM generativo. El modelo es adecuado porque su tamano reducido permite ejecutarlo como paso intermedio sin penalizar la latencia total del pipeline, y la version Q6_K mantiene un orden de relevancia practicamente identico al BF16.
- Busqueda semantica multilingue: rerankear resultados de busqueda en documentos escritos en distintos idiomas, aprovechando el soporte de mas de 100 idiomas del modelo para aplicaciones de busqueda corporativa internacional.
- Busqueda de codigo en repositorios: rerankear resultados de busqueda en codebases grandes, util en herramientas de desarrollo asistido o motores de busqueda internos de equipos de ingenieria.
- Filtrado de candidatos en pipelines de recuperacion: reducir una lista amplia de candidatos (por ejemplo, 100 documentos) a los 5-10 mas relevantes antes de una etapa de generacion costosa, gracias a la baja latencia del modelo cuantizado en CPU o GPU consumer.
- Sistemas de preguntas y respuestas sobre documentacion corporativa: rerankear fragmentos de documentacion interna para responder consultas de empleados, desplegable en infraestructura local sin GPU gracias al formato GGUF y la compatibilidad con llama.cpp.
- Evaluacion de calidad de retrievers: utilizar las puntuaciones de relevancia del modelo para auditar y comparar la calidad de diferentes retrievers sobre un corpus determinado, aprovechando la consistencia de las puntuaciones de la version Q6_K respecto a la referencia BF16.

## Benchmarks y rendimiento

El autor proporciona pruebas de fidelidad comparando las cuantizaciones Q6_K y NVFP4 contra una referencia BF16, sobre 12 consultas × 5 pasajes = 60 rerankings (2 relevantes, 1 casi-acierto, 2 fuera de tema por consulta), en CPU con 32 hilos, flash-attention activada y contexto 1024:

| Metrica (vs BF16) | Q6_K | NVFP4 |
|---|---|---|
| Spearman ρ (todos los 60) | 0,9962 | 0,9323 |
| Kendall τ (todos los 60) | 0,9616 | 0,7977 |
| Kendall τ (media por consulta) | 0,9500 | 0,9333 |
| Media \|Δscore\| | 0,0022 | 0,0196 |
| Max \|Δscore\| | 0,091 | 0,419 |
| Coincidencia de decision en umbral 0,5 | 60/60 | 58/60 |
| Coincidencia del top-1 | 11/12 | 11/12 |
| Desplazamiento medio de rango por documento | 0,100 | 0,133 |

No se han publicado resultados de benchmarks estandar de retrieval (MTEB, BEIR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo NVFP4 ocupa 325,5 MiB y el Q6_K 472,0 MiB, por lo que ambos caben en cualquier GPU consumer con al menos 1 GB de VRAM (GTX 1050, RTX 3050, etc.).
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal; el modelo tambien funciona en CPU pura con llama.cpp.
- Ejecucion en CPU: viable gracias al tamano reducido; las pruebas de fidelidad del autor se realizaron en CPU con 32 hilos.
- Opciones de despliegue: llama.cpp (llama-server --reranking), o cualquier runtime compatible con GGUF v3 y arquitectura qwen3.
- Latencia: no disponible en la informacion proporcionada; el tamano de 0,6B sugiere latencias de decenas de milisegundos por par consulta-documento en hardware moderno, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Qwen3-Reranker-0.6B (BF16) | 595,8M | safetensors | Apache-2.0 | no disponible | Modelo original de Qwen Team, referencia de precision |
| Qwen3-Reranker-0.6B-GGUF (paulalesius) | 595,8M | GGUF (NVFP4/Q6_K) | Apache-2.0 | no disponible | Cuantizacion hibrida con cabeza BF16 y normas F32 |
| QuantFactory/Qwen3-Reranker-0.6B-GGUF | 595,8M | GGUF | Apache-2.0 | no disponible | Cuantizacion GGUF alternativa del mismo modelo base |

La serie Qwen3 Embedding incluye tambien variantes de 4B y 8B parametros, aunque no se dispone de informacion detallada sobre ellas en los datos proporcionados.

## Limitaciones y advertencias

- La version NVFP4 distorsiona las puntuaciones intermedias en documentos casi-relevantes: un documento con puntuacion 0,89 en BF16 puede caer a ~0,47 en NVFP4, lo que afecta a umbrales de decision cercanos al limite.
- La version Q6_K es practicamente indistinguible del BF16 en las pruebas realizadas, pero estas se limitan a 60 rerankings sobre 12 consultas; no se ha validado en corpus mas amplios ni en benchmarks estandar.
- No se dispone de informacion sobre la longitud de contexto maxima del modelo en la documentacion proporcionada.
- El modelo es un cross-encoder: requiere procesar cada par consulta-documento por separado, lo que puede ser costoso si la lista de candidatos es muy larga.
- No se han publicado resultados en benchmarks estandar de retrieval (MTEB, BEIR) para esta cuantizacion especifica.
- Aunque la licencia es Apache-2.0, los pesos y la arquitectura originales son de Qwen Team; conviene revisar los terminos del modelo base para usos comerciales especificos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la publicacion, por lo que es una cuantizacion reciente sin validacion comunitaria amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/paulalesius/Qwen3-Reranker-0.6B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Cuantizacion alternativa: https://huggingface.co/QuantFactory/Qwen3-Reranker-0.6B-GGUF
- Version en ModelScope: https://www.modelscope.cn/models/dengcao/Qwen3-Reranker-0.6B-GGUF
- Imagen Docker: https://hub.docker.com/r/ai/qwen3-reranker
- Articulo arXiv (Qwen3 Embedding): https://arxiv.org/abs/2506.05176
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
