# jasongyn/vietlegal-embed-mrl-v2

## Resumen

vietlegal-embed-mrl-v2 es un modelo de embeddings de frases (sentence embedding) especializado en dominio legal vietnamita, publicado por el usuario jasongyn en Hugging Face. Se construye mediante fine-tuning supervisado sobre AITeamVN/Vietnamese_Embedding, un modelo basado en la arquitectura XLM-RoBERTa, y está diseñado para tareas de similitud semántica y recuperación densa de pasajes legales. El modelo tiene 567.754.752 parámetros y un tamaño de repositorio de 2,3 GB en formato safetensors.

La relevancia del modelo reside en su especialización: los ejemplos de la model card muestran consultas en lenguaje natural sobre derecho laboral y bancario vietnamita emparejadas con artículos concretos de códigos y circulares, lo que indica un uso previsto de recuperación (retrieval) sobre corpus normativos. Incorpora MatryoshkaLoss, lo que permite truncar las dimensiones del embedding y obtener representaciones de menor tamaño con degradación controlada, útil para indexación a gran escala con costes de almacenamiento reducidos.

El entrenamiento se realizó con un conjunto de datos de 1.600 ejemplos y combina MatryoshkaLoss con CachedMultipleNegativesRankingLoss y MultipleNegativesRankingLoss. No se dispone de información sobre licencia, idiomas declarados ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer), fine-tuning sobre AITeamVN/Vietnamese_Embedding |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; compatible con cuantizacion posterior a GGUF/ONNX, no documentada por el autor) |
| Idiomas soportados | no disponibles (los ejemplos de la model card son en vietnamita) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo XLM-RoBERTa, la familia multilingüe de RoBERTa, afinado a partir de AITeamVN/Vietnamese_Embedding, que a su vez es un modelo de embeddings para vietnamita. La salida es un vector denso por texto, adecuado para similitud coseno y búsqueda por vecino más cercano. El pipeline declarado es sentence-similarity y la librería es sentence-transformers.

El entrenamiento utiliza tres funciones de pérdida combinadas: MatryoshkaLoss, que entrena representaciones anidadas de dimensión decreciente para permitir truncamiento del embedding; CachedMultipleNegativesRankingLoss, variante de contrastive learning con negativos en caché que reduce el coste de memoria en batches grandes; y MultipleNegativesRankingLoss, el objetivo contrastivo estándar con negativos in-batch. El dataset de entrenamiento contiene 1.600 ejemplos, un volumen reducido que sugiere un ajuste fino específico de dominio más que un entrenamiento desde cero. No se documentan el número de tokens de entrenamiento, la composición del corpus ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de embeddings).

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica y recuperación densa.
- Recuperación de fragmentos legales relevantes a partir de consultas en lenguaje natural, según los ejemplos de la model card (derecho laboral y normativa bancaria vietnamita).
- Soporte de Matryoshka: el embedding puede truncarse a dimensiones menores para indexación eficiente, manteniendo parte de la calidad.
- Extracción de características (feature-extraction) para clasificación, clustering y deduplicación de textos.
- Compatibilidad con text-embeddings-inference y endpoints, según los tags del repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un encoder, no un modelo generativo.
- Capacidades multilingües: no disponibles; el modelo base es vietnamita y los ejemplos son en vietnamita.

## Casos de uso

- Búsqueda semántica sobre corpus normativo vietnamita: indexar artículos, decretos y circulares como embeddings y recuperar los fragmentos más relevantes para una consulta en lenguaje natural, como muestran los ejemplos de la model card con el código laboral y la normativa del Banco Estatal.
- Asistente legal de recuperación aumentada (RAG): usar el modelo como retriever en un pipeline que alimente a un LLM generativo con los artículos pertinentes, reduciendo alucinaciones al anclar la respuesta en texto normativo recuperado.
- Deduplicación y clustering de documentos legales: agrupar versiones o fragmentos equivalentes de normativa mediante similitud coseno sobre los embeddings.
- Clasificación de consultas ciudadanas: asignar consultas entrantes a áreas del derecho (laboral, bancario, etc.) entrenando un clasificador ligero sobre los embeddings.
- Indexación a gran escala con Matryoshka: truncar los embeddings a 128 o 256 dimensiones para reducir el almacenamiento del índice vectorial y acelerar la búsqueda, a cambio de una pérdida controlada de precisión.
- Detección de similitud entre cláusulas contractuales: comparar cláusulas de contratos con artículos de referencia para señalar posibles incumplimientos o cláusulas abusivas.
- Enrutamiento de consultas en atención al ciudadano: decidir qué base de conocimiento o departamento debe atender una consulta según su embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 567,7 millones de parámetros, en fp32 ocupa aproximadamente 2,3 GB de pesos; en fp16 unos 1,1 GB; en int8 unos 0,6 GB. A ello hay que sumar memoria para activaciones y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con batches pequeños; A100, H100 o L4 para indexación masiva de corpus y throughput alto.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más, incluso en fp32.
- Opciones de despliegue: sentence-transformers (nativo), text-embeddings-inference (soportado según los tags), y exportación a ONNX o GGUF para llama.cpp/Ollama mediante conversión propia no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jasongyn/vietlegal-embed-mrl-v2 | 567,7 M | no disponible | no disponible | Especializado en legal vietnamita; Matryoshka |
| AITeamVN/Vietnamese_Embedding | no disponible | no disponible | no disponible | Modelo base; embeddings generales en vietnamita |
| BAAI/bge-m3 | no disponible | no disponible | MIT (según su model card pública) | Multilingüe generalista, no especializado en legal vietnamita |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial sin contactar con el autor; tratar como restringido a la espera de aclaración.
- Dataset de entrenamiento pequeño (1.600 ejemplos): el ajuste fino puede no cubrir toda la variabilidad del dominio legal vietnamita y generalizar peor fuera de las áreas ejemplificadas (laboral, bancaria).
- Idiomas no declarados: el modelo base es vietnamita y los ejemplos son en vietnamita; el rendimiento en otros idiomas, incluido el castellano, es incierto.
- Longitud de contexto no documentada: XLM-RoBERTa tiene un límite típico de 512 tokens, pero el autor no lo confirma; los pasajes legales largos pueden requerir fragmentación.
- Riesgo de recuperación incorrecta: como retriever, puede devolver artículos semánticamente próximos pero jurídicamente inaplicables; requiere validación humana en contextos legales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Sesgos: no documentados por el autor; al entrenar sobre normativa, puede heredar sesgos del corpus legal y de la selección de ejemplos.
- Sin garantía de actualización normativa: el corpus de entrenamiento puede no reflejar reformas legislativas posteriores.

## Enlaces

- Hugging Face: https://huggingface.co/jasongyn/vietlegal-embed-mrl-v2
- Modelo base: https://huggingface.co/AITeamVN/Vietnamese_Embedding
- Paper XLM-R (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper Matryoshka Representation Learning (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper Sentence-BERT (arXiv:1908.10084, referenciado en los tags): https://arxiv.org/abs/1908.10084
- Paper SimCSE (arXiv:2104.08821, contexto de contrastive learning): no referenciado directamente en los tags
- Paper de MultipleNegativesRankingLoss (arXiv:1705.00652): no referenciado directamente en los tags
- Referencias de los tags restantes: arXiv:2101.06983 y arXiv:1807.03748 (consultables en https://arxiv.org/abs/2101.06983 y https://arxiv.org/abs/1807.03748)
