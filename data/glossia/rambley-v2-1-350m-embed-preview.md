# glossia/Rambley-V2.1-350M-Embed-Preview

## Resumen

Rambley-V2.1-350M-Embed-Preview es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario glossia. Se trata de un fine-tuning supervisado del checkpoint base glossia/Rambley-V2.1-350M-Embed-Pretrain-Preview, entrenado sobre el dataset nomic-embed-supervised-data. Su funcion es mapear entradas de texto a un espacio vectorial denso de 896 dimensiones, pensado para similitud semantica, busqueda semantica, mineria de parafrasis, clasificacion y clustering.

El modelo cuenta con 348.583.480 parametros totales (aproximadamente 350M), lo que lo situa en la gama media de modelos de embeddings, y utiliza la arquitectura propia RambleyV2Model dentro del ecosistema sentence-transformers. La longitud maxima de secuencia es de solo 256 tokens, un limite notablemente corto para tareas de recuperacion sobre documentos largos. La similitud se calcula por coseno y el pooling es de tipo lasttoken con inclusion del prompt.

Es relevante ahora como una opcion ligera y de bajo coste computacional para pipelines de recuperacion aumentada (RAG), deduplicacion y busqueda semantica en entornos con recursos limitados. No obstante, se trata de un modelo en estado de preview, con informacion publica escasa: no se declaran idiomas, licencia ni resultados de benchmarks, y su numero de descargas es muy bajo, lo que limita la evidencia empirica sobre su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (RambleyV2Model) + Pooling lasttoken + Normalize, via sentence-transformers |
| Parametros totales | 348.583.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un SentenceTransformer compuesto por tres modulos encadenados: un transformer de extraccion de caracteristicas de arquitectura RambleyV2Model que devuelve el last_hidden_state, una capa de pooling de tipo lasttoken con dimension de embedding de 896 y include_prompt activado, y una capa de normalizacion final. La similitud entre embeddings se calcula mediante coseno. El checkpoint parte del modelo de preentrenamiento glossia/Rambley-V2.1-350M-Embed-Pretrain-Preview (revision 41ec4ca69c73ecdd31e200618338c020b4ce942a).

El fine-tuning se realizo sobre el dataset nomic-embed-supervised-data, con columnas anchor, positive y negative_1 a negative_4, empleando la funcion de perdida CachedMultipleNegativesRankingLoss con escala 20.0, similitud coseno, mini_batch_size de 16, direccion query_to_doc y particion joint. Los hiperparametros principales incluyen batch size por dispositivo de 32, 52.995 pasos maximos, learning rate de 2e-05, scheduler coseno, warmup del 5 %, optimizador adamw_torch_fused, weight decay 0.0 y entrenamiento en bf16. No se documenta el numero total de tokens de entrenamiento ni la composicion completa del dataset, y no se indica el uso de RLHF o DPO (no aplica a un modelo de embeddings).

## Capacidades

- Generacion de embeddings de frases de 896 dimensiones con normalizacion y similitud coseno.
- Similitud semantica de texto (semantic textual similarity).
- Busqueda semantica sobre corpus indexados.
- Mineria de parafrasis.
- Clasificacion de texto mediante embeddings como caracteristicas.
- Clustering y deduplicacion semantica de documentos.
- Extraccion de caracteristicas (feature-extraction) a nivel de token y de frase.
- No soporta tool calling ni function calling: es un modelo de embeddings, no generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no declaradas).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica en bases de conocimiento internas: indexar documentos y consultas con embeddings de 896 dimensiones y recuperar por similitud coseno; adecuado por su bajo coste de inferencia, aunque limitado a fragmentos de hasta 256 tokens.
- Recuperacion aumentada (RAG) en produccion: generar embeddings de chunks cortos para un retriever denso en pipelines con vLLM o sentence-transformers; su tamano de 350M permite desplegarlo en GPU de gama media.
- Deduplicacion de registros y catalogos: calcular embeddings de titulos o descripciones breves y agrupar por umbral de similitud coseno para eliminar duplicados.
- Mineria de parafrasis en corpus de soporte: detectar preguntas equivalentes en tickets o FAQs comparando embeddings de enunciados cortos.
- Clustering de opiniones o resenas: agrupar feedback de usuario por tematica usando los embeddings como entrada a algoritmos como k-means o HDBSCAN.
- Clasificacion de texto ligera: usar los embeddings como caracteristicas de entrada a un clasificador supervisado (regresion logistica, SVM) en tareas de moderacion o etiquetado.
- Filtrado previo en sistemas de recomendacion: generar embeddings de items y usuarios para recuperacion por vecindad en etapas de candidate generation.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB solo para pesos (348,6M x 4 bytes), mas overhead de activaciones y runtime.
- VRAM estimada en bf16/fp16: aproximadamente 0,7 GB para pesos, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 en adelante con 6 GB o mas).
- Opciones de despliegue: sentence-transformers (nativo), Hugging Face Text Embeddings Inference (TEI), integracion en pipelines de RAG con FAISS, Chroma, Qdrant o pgvector. No se documentan pesos GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano (350M) y la secuencia corta (256 tokens) se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glossia/Rambley-V2.1-350M-Embed-Preview | 348,6M | 256 tokens | 896 | no disponible | Hugging Face (preview) |
| Alternativas de referencia (p. ej. modelos de embeddings de ~300-400M) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ventana de contexto muy corta (256 tokens): inadecuado para documentos largos sin troceado previo; los chunks deben ser breves.
- Estado preview: el modelo puede cambiar sin aviso y no se garantiza estabilidad de API ni de pesos.
- Licencia no declarada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de usarlo en produccion.
- Idiomas no declarados: se desconoce si el modelo rinde bien en castellano u otros idiomas distintos del ingles del dataset de entrenamiento.
- Sin benchmarks publicados: no hay evidencia empirica de calidad frente a alternativas consolidadas.
- Riesgo de sesgo y alucinacion: al derivar de un dataset supervisado no auditado publicamente, pueden heredarse sesgos de los datos; en recuperacion, un embedding erroneo puede devolver documentos irrelevantes.
- Adopcion muy baja (37 descargas, 0 likes): escasa validacion por parte de la comunidad.
- No es un modelo generativo: no debe usarse para tareas de generacion de texto, razonamiento ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/glossia/Rambley-V2.1-350M-Embed-Preview
- Modelo base de preentrenamiento: https://huggingface.co/glossia/Rambley-V2.1-350M-Embed-Pretrain-Preview
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos sentence-transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de CachedMultipleNegativesRankingLoss / GradCache (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Paper de SimCSE (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
