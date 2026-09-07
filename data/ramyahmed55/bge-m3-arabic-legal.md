# RamyAhmed55/bge-m3-arabic-legal

## Resumen

RamyAhmed55/bge-m3-arabic-legal es un modelo de embeddings de tipo sentence-transformers, desarrollado por RamyAhmed55, que parte del modelo base BGE-M3 de BAAI y lo ajusta para el dominio legal en árabe. Está diseñado para tareas de similitud de oraciones, recuperación semántica y extracción de características en textos jurídicos árabes, lo que lo hace útil en sistemas de búsqueda y en pipelines de generación aumentada por recuperación (RAG) especializados en derecho.

El modelo se basa en la arquitectura XLM-RoBERTa, con 567.754.752 parámetros y una ventana de contexto de hasta 8192 tokens. Al tratarse de un modelo de embeddings, no genera texto, sino representaciones vectoriales de 1024 dimensiones, y hereda del modelo base las capacidades de recuperación densa, sparse y multi-vector. Su relevancia actual radica en la escasez de modelos de embeddings específicos para el ámbito legal árabe, un área con demanda creciente en aplicaciones de búsqueda jurídica, análisis de contratos y asistentes legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa (BGE-M3) |
| Parametros totales | 567.754.752 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la ficha; el modelo base BGE-M3 soporta más de 100 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura del modelo BGE-M3, que es un encoder basado en XLM-RoBERTa. El modelo base fue entrenado para ampliar la longitud máxima de XLM-RoBERTa a 8192 tokens mediante un preentrenamiento adicional con RetroMAE, y posteriormente se sometió a un ajuste unificado de recuperación densa, sparse y multi-vector (ColBERT). Esto le permite generar embeddings densos de 1024 dimensiones, pesos por token para recuperación sparse y representaciones multi-vector, sin necesidad de modelos adicionales.

En cuanto al entrenamiento específico de este fine-tuning, la información proporcionada no detalla el dataset utilizado ni el proceso de ajuste. Por tanto, no se dispone de datos sobre la composición del corpus de textos legales árabes, el número de tokens de entrenamiento ni si se emplearon técnicas como RLHF o DPO. Tampoco se especifica si el ajuste mantiene las tres funcionalidades del modelo base o si se limita a la recuperación densa.

## Capacidades

- Recuperación densa: genera embeddings de 1024 dimensiones para consultas y documentos, aptos para búsqueda semántica y similitud de oraciones.
- Recuperación sparse: produce pesos por token (similar a BM25) sin coste adicional, lo que permite implementar recuperación híbrida.
- Recuperación multi-vector (ColBERT): ofrece representaciones de mayor granularidad para tareas de re-ranking.
- Similitud de oraciones y párrafos: mapea textos a un espacio vectorial para comparar su similitud semántica.
- Multilingüe en el modelo base: BGE-M3 soporta más de 100 idiomas, aunque este fine-tuning está orientado al dominio legal árabe.
- No es generativo: no produce texto; su salida son vectores, por lo que requiere un modelo generativo adicional para tareas de RAG.
- Compatibilidad con pipelines de recuperación híbrida y re-ranking, tal y como se recomienda en la documentación original de BGE-M3.

## Casos de uso

- Búsqueda semántica en jurisprudencia árabe: el modelo permite recuperar sentencias y dictámenes legales relevantes a partir de consultas en lenguaje natural, mejorando la precisión respecto a la búsqueda por palabras clave.
- RAG para asistentes legales: integrado en un pipeline de generación aumentada por recuperación, proporciona contexto jurídico árabe a un LLM, permitiendo respuestas fundamentadas en textos legales.
- Clasificación de documentos legales: mediante los embeddings, se pueden clasificar contratos, leyes o resoluciones según su contenido, por ejemplo, para organizar un corpus jurídico.
- Deduplicación de textos legales: identifica documentos duplicados o casi duplicados en grandes repositorios, lo que resulta útil en la gestión de bases de datos jurídicas.
- Recuperación híbrida en sistemas de búsqueda: combina la recuperación densa con la sparse para obtener mayor precisión y generalización, como se recomienda en la documentación de BGE-M3.
- Re-ranking en pipelines de recuperación: al ser un bi-encoder, puede usarse en una primera fase de recuperación, seguida de un cross-encoder (por ejemplo, bge-reranker) para filtrar y reordenar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 567.754.752 parámetros, en float32 se requieren aproximadamente 2,3 GB de VRAM; en float16, alrededor de 1,2 GB. El tamaño del repositorio (9,1 GB) sugiere que puede incluir múltiples archivos o pesos en varios formatos, por lo que la VRAM real de inferencia puede variar.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia con sentence-transformers, como RTX 3060, T4 o A10.
- Despliegue: compatible con sentence-transformers, Hugging Face Inference Endpoints y text-embeddings-inference. También puede utilizarse con la biblioteca FlagEmbedding.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| RamyAhmed55/bge-m3-arabic-legal | 567.754.752 | 8192 | MIT | Fine-tuning para texto legal árabe |
| BAAI/bge-m3 | 568M | 8192 | MIT | Modelo base multilingüe |
| mhaseeb1604/bge-m3-law | 568M | 8192 | MIT | Fine-tuning para texto legal árabe e inglés |

La comparativa se basa en los datos disponibles en las fichas de HuggingFace. No se dispone de resultados de benchmarks para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en benchmarks públicos, por lo que no existe evidencia de su rendimiento real en tareas de recuperación legal.
- No se especifica el dataset de fine-tuning, lo que genera incertidumbre sobre la cobertura del dominio legal árabe y la calidad del ajuste.
- Puede heredar sesgos presentes en los datos legales utilizados durante el entrenamiento, especialmente en un dominio tan sensible como el derecho.
- Al ser un modelo de embeddings, no genera texto; su uso en RAG requiere un modelo generativo adicional.
- La ventana de contexto de 8192 tokens corresponde al modelo base, pero el fine-tuning podría haberla reducido si se entrenó con secuencias más cortas; este dato no está confirmado.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad y podría contener errores no detectados.

## Enlaces

- HuggingFace: https://huggingface.co/RamyAhmed55/bge-m3-arabic-legal
- Repositorio de BGE-M3 (FlagOpen/FlagEmbedding): https://github.com/FlagOpen/FlagEmbedding
- Paper de BGE-M3: https://arxiv.org/pdf/2402.03216.pdf
- Modelo similar de referencia (mhaseeb1604/bge-m3-law): https://huggingface.co/mhaseeb1604/bge-m3-law
