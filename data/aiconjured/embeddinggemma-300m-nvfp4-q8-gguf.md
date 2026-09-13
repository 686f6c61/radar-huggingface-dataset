# AIconjured/embeddinggemma-300M-NVFP4-Q8-GGUF

## Resumen

EmbeddingGemma-300M NVFP4+Q8 es una recuantizacion de precision mixta del modelo de embeddings EmbeddingGemma-300M de Google, publicada por el usuario AIconjured sobre el repositorio base ggml-org/embeddinggemma-300M-GGUF. No se trata de un modelo nuevo, sino de una reconstruccion del fichero GGUF que combina tensores NVFP4 en las capas feed-forward con Q8_0 en atencion y token embedding, manteniendo las normas en F32. El objetivo es aprovechar las operaciones nativas de tensor core FP4 de las GPU Blackwell (RTX 50-series) sin degradar de forma apreciable la calidad del embedding.

El modelo conserva los 307.581.696 parametros del original en una arquitectura transformer densa de 24 bloques, dimension de embedding 768, dimension FFN 1.152 y atencion con 3 cabezas y GQA de 1 cabeza KV. La ventana de contexto se mantiene en 2.048 tokens y el fichero final ocupa 286 MB frente a los 333 MB de la version Q8_0, lo que supone una reduccion del 14 % y 7,62 bits por peso.

Su relevancia practica es doble: por un lado reduce el espacio en disco y los requisitos de memoria para indexacion masiva de vectores; por otro, habilita aceleracion por hardware en GPUs Blackwell para la parte compute-heavy del modelo. El autor reporta una similitud coseno media de 0,9703 frente a los embeddings de la version Q8_0 original, con un minimo de 0,9653 en 10 prompts de dominios semanticos diversos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (gemma-embedding), 24 bloques, GQA con 1 cabeza KV |
| Parametros totales | 307.581.696 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Mixta: NVFP4 (74 tensores, FFN y dense_2/dense_3), Q8_0 (97 tensores, atencion y token embedding), F32 (145 tensores, normas). 7,62 bits por peso |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (segun la model card del autor; la metadata de HuggingFace no declara licencia) |
| Formato de pesos | GGUF en un unico fichero (file_type 39, MOSTLY_NVFP4) |
| Dimension de embedding | 768 |
| Dimension FFN | 1.152 |
| Cabezas de atencion | 3 (GQA con 1 cabeza KV) |
| Tamano del fichero | 286 MB (frente a 333 MB de la version Q8_0) |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

La arquitectura es la del modelo original google/embedding-gemma-300m, un transformer denso de 24 bloques con dimension de embedding 768, dimension FFN 1.152 y atencion con 3 cabezas de consulta y una unica cabeza KV (GQA). El autor no ha reentrenado ni ajustado el modelo: la ficha describe exclusivamente un proceso de recuantizacion sobre los pesos GGUF ya publicados por ggml-org.

La innovacion tecnica reside en la receta de precision mixta. Las normas (attn_norm, post_attention_norm, attn_q_norm, attn_k_norm, ffn_norm, post_ffw_norm y output_norm) se mantienen en F32 porque el cargador de modelos de embedding de llama.cpp exige ese tipo para los tensores de normalizacion. La atencion (attn_q, attn_k, attn_v, attn_output) y el token embedding se mantienen en Q8_0 por ser las capas mas sensibles al ruido de cuantizacion; el token embedding representa por si solo 204 MB, el 64 % del modelo. Las capas feed-forward (ffn_gate, ffn_up, ffn_down) mas dense_2 y dense_3 se cuantizan a NVFP4, que dispone de operaciones nativas de tensor core FP4 en hardware Blackwell con escalas de entrada calibradas.

El autor no emplea imatrix, argumentando que los modelos de embedding no se benefician de la calibracion de escalas de entrada como los modelos generativos. La receta se reproduce con `llama-quantize --allow-requantize --tensor-type-file recipe-nvfp4-mild.txt` partiendo del Q8_0 original, seguido de un parcheo manual del campo file_type a 39, ya que el cuantizador no lo establece.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones para similitud coseno, busqueda semantica y recuperacion de informacion.
- Codificacion de fragmentos de hasta 2.048 tokens por pasada.
- Procesamiento por lotes (batching) para indexacion masiva, con soporte de `-b 32` en llama.cpp.
- Recuperacion semantica multilingue: no confirmada en la informacion disponible para esta recuantizacion concreta; depende de las capacidades del modelo base.
- Aceleracion de las capas FFN mediante operaciones NVFP4 en GPU Blackwell.
- No es un modelo generativo: no produce texto, no soporta tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica sobre corpus documentales: el modelo convierte consultas y documentos en vectores de 768 dimensiones que se indexan en una base vectorial; con 286 MB puede desplegarse en el mismo nodo que el indice sin competir por VRAM con un LLM generativo.
- Recuperacion aumentada (RAG): se usa como codificador de retrieval para seleccionar los fragmentos relevantes antes de pasarlos a un modelo generativo, con la ventaja de que la cuantizacion NVFP4 acelera la fase de codificacion en GPUs RTX 50-series.
- Deduplicacion y near-duplicate detection: al calcular similitud coseno entre embeddings de un gran volumen de registros, el reducido tamano del modelo permite procesar millones de entradas en una sola GPU consumer o incluso en CPU.
- Clustering y topic modeling: los vectores de 768 dimensiones sirven para agrupar documentos, tickets o resenas por similitud semantica sin necesidad de etiquetas previas.
- Clasificacion zero-shot y few-shot: comparando el embedding de un texto con embeddings de descripciones de clase se puede construir un clasificador ligero sin entrenamiento adicional.
- Filtrado de contenido y moderacion: la similitud contra un conjunto de ejemplos etiquetados permite detectar textos proximos a categorias problematicas en tiempo casi real.
- Sistemas de recomendacion basados en contenido: codificar el historial o el perfil del usuario y compararlo con el catalogo mediante similitud vectorial.
- Indexacion de codigo y documentacion tecnica: busqueda semantica sobre repositorios para localizar funciones o fragmentos relevantes a partir de una descripcion en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; se trata de un modelo de embeddings y esos conjuntos no aplican. El autor si reporta una verificacion de calidad mediante similitud coseno frente a los embeddings de la version Q8_0 original, sobre 10 prompts de dominios diversos (animales, comida, reparaciones, ciencia, meteorologia, entretenimiento y reposteria):

| Metrica (similitud coseno vs Q8_0) | Valor |
|---|---|
| Media | 0,9703 |
| Minimo | 0,9653 |
| Maximo | 0,9756 |
| Prompts evaluados | 10 |
| Umbral considerado aceptable | 0,95 |

Comparacion con una receta alternativa mas agresiva (NVFP4 tambien en los pesos de atencion):

| Receta | Similitud coseno media | Similitud coseno minima | Tamano |
|---|---|---|---|
| NVFP4+Q8 mixta (esta publicacion) | 0,9703 | 0,9653 | 286 MB |
| NVFP4 agresiva | 0,9517 | 0,9401 | ~268 MB |
| Q8_0 original (referencia) | 1,0000 | 1,0000 | 333 MB |

No se proporcionan medidas de latencia ni de throughput (tokens por segundo o embeddings por segundo) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 300 MB para el modelo, segun la propia ficha.
- Memoria en CPU: aproximadamente 300 MB de RAM; funciona en modo CPU only.
- GPU recomendadas: cualquier GPU moderna. Las capas NVFP4 se benefician de tensor cores FP4 nativos, disponibles en la familia Blackwell (RTX 50-series). En GPUs anteriores las capas NVFP4 se ejecutan sin esa aceleracion especifica.
- Cabe en cualquier GPU consumer: si, con margen amplio, incluidas GPUs integradas y equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp mediante `llama-embed`, Ollama (`ollama pull aiconjured/embeddinggemma-300M-NVFP4-Q8-GGUF`) y cualquier runtime compatible con GGUF. El tag del repositorio incluye `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia alojados.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor indica que la velocidad depende del hardware y la carga, y que NVFP4 es significativamente mas rapido que Q8_0 en hardware compatible, sin cifras concretas.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta recuantizacion con el GGUF Q8_0 del que deriva y con la variante de receta agresiva. No se han proporcionado datos de otros modelos de embeddings de la competencia, por lo que esa comparacion externa queda como no disponible.

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Similitud vs Q8_0 | Licencia |
|---|---|---|---|---|---|---|
| AIconjured/embeddinggemma-300M-NVFP4-Q8-GGUF | 307,6 M | 2.048 | NVFP4 + Q8_0 + F32 mixta | 286 MB | 0,9703 (media) | Apache 2.0 (segun model card) |
| ggml-org/embeddinggemma-300M-GGUF (Q8_0) | 307,6 M | 2.048 | Q8_0 | 333 MB | 1,0000 (referencia) | no disponible |
| Variante de receta NVFP4 agresiva (no publicada como repo) | 307,6 M | 2.048 | NVFP4 en atencion y FFN | ~268 MB | 0,9517 (media) | no disponible |
| Otros modelos de embeddings de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia declarada en la model card es Apache 2.0, heredada del modelo base, pero la metadata de HuggingFace del repositorio no la declara; conviene verificar la licencia del modelo original google/embedding-gemma-300m antes de un uso comercial.
- Se trata de una recuantizacion no oficial: no ha sido validada por Google ni por ggml-org, y la verificacion de calidad se limita a 10 prompts y a una unica metrica (similitud coseno) frente a Q8_0.
- La similitud coseno de 0,9703 no garantiza que el rendimiento en tareas concretas (retrieval, clasificacion, clustering) se mantenga en la misma proporcion; no se aportan metricas de tarea.
- La aceleracion NVFP4 solo se materializa en hardware con tensor cores FP4 nativos (Blackwell); en otras GPUs el beneficio es menor o nulo.
- El contexto esta limitado a 2.048 tokens, insuficiente para documentos largos sin fragmentacion previa.
- La informacion disponible no especifica los idiomas soportados; no se puede asumir cobertura multilingue sin verificacion.
- No es un modelo generativo: no debe usarse para completar texto, razonar ni invocar herramientas.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que carece de validacion por parte de la comunidad y de un historial de uso en produccion.
- Requiere parchear manualmente el campo file_type a 39 al reproducir la cuantizacion, un paso propenso a errores si se automatiza mal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AIconjured/embeddinggemma-300M-NVFP4-Q8-GGUF
- Modelo base GGUF (ggml-org): https://huggingface.co/ggml-org/embeddinggemma-300M-GGUF
- Modelo original (Google): https://huggingface.co/google/embedding-gemma-300m

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces obtenidos corresponden a herramientas de widgets de cuestionarios y no guardan relacion con la ficha.
