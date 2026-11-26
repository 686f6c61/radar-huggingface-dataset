# harims95/hobbylm-embed-140m

## Resumen

HobbyLM-Embed-140M es un modelo de embeddings de texto en ingles desarrollado por Fuel Labs (publicado bajo el identificador `harims95`). Se trata de un encoder transformer bidireccional construido sobre una arquitectura de mezcla de expertos (MoE) dispersa y entrenado desde cero, sin partir de BERT, ModernBERT ni ningun otro encoder existente. Con 139.983.200 parametros totales y 36.370.432 parametros activos por token (excluyendo la tabla de embeddings), produce vectores densos de 512 dimensiones normalizados en L2 para busqueda semantica, RAG, similitud, clustering y clasificacion.

Su relevancia radica en dos factores. Primero, aplica la eficiencia de los MoE al terreno de los modelos de embeddings, un nicho dominado tradicionalmente por encoders densos, logrando un coste computacional por token reducido (8 de 32 expertos activos en cada capa MoE). Segundo, ofrece una puntuacion oficial en MTEB(eng, v2) de 62,33 sobre las 41 tareas, con un contexto por defecto de 512 tokens ampliable a 2.048, lo que mejora la busqueda en documentos largos de 36,1 a 49,3 nDCG@10 en LongEmbed.

El modelo se distribuye con licencia Apache-2.0 (pesos, codigo y herramientas) y cuenta con variantes en safetensors float32, GGUF (F16 y Q8_0), MLX para Apple Silicon y una version en Ollama, ademas de integraciones con Sentence Transformers, LangChain, LlamaIndex y Chroma. Esta pensado para despliegues ligeros tanto en CPU como en GPU, incluidos equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional con MoE dispersa (12 capas, anchura 512) |
| Parametros totales | 139.983.200 |
| Parametros activos | 36.370.432 por token (excluyendo embeddings, convencion MTEB); 62.126.080 incluyendo embeddings |
| Longitud de contexto | 512 tokens por defecto; hasta 2.048 probados |
| Tipos de cuantizacion | float32 (referencia), float16 (MLX), GGUF F16 y Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32), GGUF, MLX |

Datos adicionales: parametros de embedding 25.755.648; salida vectorial densa de 512 dimensiones normalizada en L2; tokenizador GPT-2 byte-level BPE con vocabulario de 50.304 (con padding) y un token de fin de texto anadido; tamano del repo 0,6 GB.

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 12 capas con pre-norm RMSNorm y anchura 512. La atencion es bidireccional, agrupada por consultas (grouped-query: 8 cabezas de consulta y 2 de clave-valor de tamano 64), con QK-norm y RoPE. La capa 0 usa una feed-forward densa SwiGLU con hidden de 1.536; las capas 1 a 11 usan MoE dispersa con 32 expertos SwiGLU (hidden 192), top-8 por token y sin experto compartido. El router emplea puntuaciones sigmoideas en float32 con sesgo de equilibrado sin perdida auxiliar (usado solo para seleccion) y es dropless. El pooling es la media sobre tokens, excluyendo padding y el token final de fin de texto, seguida de normalizacion L2.

El entrenamiento se realizo desde cero (pesos iniciales aleatorios) sobre 50.000 millones de tokens, sin adaptacion de encoders preexistentes. La model card no detalla la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion principal es la aplicacion de MoE dispersa a un encoder de embeddings, que reduce los parametros activos por token a aproximadamente el 26 % del total (excluyendo embeddings) manteniendo la salida como un vector denso compatible con cualquier base de datos vectorial. Para retrieval requiere prefijos de prompt: `query: ` para consultas y `passage: ` para documentos.

## Capacidades

- Generacion de embeddings de texto en ingles: vectores densos de 512 dimensiones normalizados en L2 para similitud semantica y feature extraction.
- Busqueda semantica y recuperacion de informacion (retrieval) con prefijos `query:` y `passage:`.
- Busqueda en documentos largos: contexto ampliable a 2.048 tokens con mejora medida en LongEmbed (36,1 a 49,3 nDCG@10).
- Clustering de textos a partir de los embeddings generados.
- Clasificacion de texto mediante embeddings como caracteristicas de entrada.
- Deteccion de duplicados y near-duplicates (caso demostrado en la demo oficial).
- Enrutamiento de tickets y categorizacion (caso demostrado en la demo oficial).
- Integracion con tooling de RAG: Sentence Transformers, LangChain, LlamaIndex y Chroma.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica en base de conocimiento: indexar documentos con el prefijo `passage:` y consultar con `query:`; los vectores de 512 dimensiones encajan en cualquier base de datos vectorial (Chroma, FAISS, pgvector) sin adaptadores.
- RAG sobre documentacion tecnica: usar el modelo como retriever en un pipeline LangChain o LlamaIndex; su contexto de 2.048 tokens permite indexar fragmentos mas largos y mejorar la recuperacion en documentos extensos.
- Enrutamiento de tickets de soporte: clasificar y asignar incidencias por similitud con tickets historicos; la demo oficial incluye este escenario y el coste por token es bajo gracias a los 8 de 32 expertos activos.
- Deduplicacion de contenido: detectar near-duplicates en catalogos o corpus mediante similitud coseno sobre los embeddings normalizados.
- Clustering de feedback de usuarios: agrupar resenas o comentarios por tematica para analisis de producto, aprovechando la salida densa y normalizada.
- Despliegue en CPU o portatiles: con GGUF Q8_0 (179 MB) en llama.cpp u Ollama, o MLX float16 (280 MB) en Apple Silicon (probado en M4), el modelo cabe en cualquier equipo sin GPU dedicada.
- Filtrado previo en pipelines de moderacion o recomendacion: generar embeddings de baja latencia para prefiltrar candidatos antes de un modelo mas costoso.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MTEB(eng, v2), 41 tareas | 62,33 |
| LongEmbed, contexto 512 | 36,1 nDCG@10 |
| LongEmbed, contexto 2.048 | 49,3 nDCG@10 |
| Fidelidad GGUF F16 vs referencia | coseno medio 0,99997 |
| Fidelidad GGUF Q8_0 vs referencia | coseno medio 0,9994 |
| Fidelidad MLX float16 vs referencia (M4) | coseno minimo 0,99965 |

No se han publicado en la informacion disponible resultados desglosados por tarea ni comparaciones numericas con otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (139,98 M de parametros, repo de 0,6 GB); aproximadamente 335 MB en GGUF F16, 179 MB en GGUF Q8_0 y 280 MB en MLX float16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo no requiere A100 ni H100. Funciona en GPU de consumo (RTX 4090 y gamas inferiores) sin problema.
- Cabe en GPU de consumo: si, en cualquier GPU moderna; tambien en CPU y en Apple Silicon via MLX (probado en Apple M4).
- Opciones de despliegue: Sentence Transformers (CPU/GPU), llama.cpp (GGUF con script auxiliar del autor), Ollama (`hariharanms95/hobbylm-embed-140m`), MLX en Apple Silicon, LangChain, LlamaIndex y Chroma.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Advertencia de despliegue: no mezclar vectores de distintos runtimes (por ejemplo, Ollama y Sentence Transformers) en un mismo indice; la version de Ollama es cercana pero no identica a la referencia.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones directas con otros modelos de embeddings. Como referencia de categoria, el modelo compite con encoders densos de tamano similar (por ejemplo, familia BERT-base de ~110 M de parametros y salida de 768 dimensiones, o MiniLM de ~22 M), pero no se dispone de datos numericos comparativos en la informacion proporcionada para establecer una tabla rigurosa.

| Criterio | HobbyLM-Embed-140M | Alternativas de la categoria |
|---|---|---|
| Parametros | 139,98 M (36,37 M activos) | no disponible |
| Contexto | 512 por defecto, 2.048 probado | no disponible |
| Dimension de salida | 512 | no disponible |
| MTEB(eng, v2) | 62,33 | no disponible |
| Licencia | Apache-2.0 | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su rendimiento en otros idiomas.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- El contexto por defecto es de 512 tokens; los textos mas largos requieren configurar 2.048 tokens, y no se han probado longitudes superiores.
- El retrieval exige usar los prefijos `query: ` y `passage: ` de forma consistente en indexacion y busqueda; omitirlos degrada la calidad.
- No mezclar vectores generados por distintos runtimes (Ollama frente a Sentence Transformers) en un mismo indice, ya que las representaciones no son identicas.
- La model card no detalla la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos conocidos ni riesgos de alucinacion en la recuperacion; como todo modelo de embeddings, puede recuperar pasajes irrelevantes si la consulta es ambigua.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con atribucion; no se especifican restricciones adicionales.
- La model card advierte que los snippets automaticos de "Use this model" de Hugging Face no estan validados para este modelo; deben usarse los ejemplos de la propia pagina.
- No se han publicado datos de latencia ni throughput, lo que impide garantizar objetivos de rendimiento en produccion sin medicion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harims95/hobbylm-embed-140m
- Variante GGUF: https://huggingface.co/harims95/hobbylm-embed-140m-gguf
- Variante MLX: https://huggingface.co/harims95/hobbylm-embed-140m-mlx
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/harims95/hobbylm-embed-140m-demo
- Cookbooks: https://github.com/fuellabs-ai/cookbooks
- Ollama: https://ollama.com/hariharanms95/hobbylm-embed-140m
- Repositorio GitHub: https://github.com/fuellabs-ai/hobbylm-embed-140m
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Sitio de Fuel Labs: https://fuellabs.in
- Paper (referencia arXiv indicada en los tags): arXiv:2610.34582
