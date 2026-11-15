# sachinyerrawar/sbert_qlora_finmodern_pair_merged

## Resumen

`sachinyerrawar/sbert_qlora_finmodern_pair_merged` es un modelo de embeddings de frases (sentence embeddings) publicado por el usuario sachinyerrawar en Hugging Face. Se trata de un derivado de la familia Sentence-BERT (SBERT), concretamente una fusión de pesos ("merged") de un ajuste fino mediante QLoRA sobre una base BERT, orientado a tareas de similitud semántica y extracción de características. El modelo mapea frases y párrafos a un espacio vectorial denso de 768 dimensiones, con 109.482.240 parámetros totales en formato safetensors y un tamaño de repositorio de 0,2 GB.

El modelo se distribuye con licencia Apache 2.0 y es compatible con la librería `sentence-transformers` y con `transformers` estándar, además de estar etiquetado como compatible con Text Embeddings Inference (TEI) y endpoints. Su pipeline declarado es `sentence-similarity`. La arquitectura subyacente es un transformer BERT con pooling de media de tokens (mean pooling) sobre las representaciones contextuales, con una longitud máxima de secuencia de 128 tokens según la configuración heredada de la model card de referencia.

La relevancia de este modelo es limitada: la model card, que parece heredada de `sentence-transformers/bert-base-nli-mean-tokens`, incluye un aviso explícito de que el modelo está obsoleto ("deprecated") y produce embeddings de baja calidad. Además, el repositorio no registra descargas ni likes en el momento de la consulta, y no se aportan datos sobre el dataset de ajuste fino, el proceso QLoRA ni evaluaciones. Debe tratarse, por tanto, como un experimento de ajuste fino personal más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT con pooling de media (SentenceTransformer) |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_seq_length declarada en la model card de referencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un `SentenceTransformer` compuesto por un `Transformer` (BertModel) seguido de una capa de `Pooling` con `pooling_mode_mean_tokens` activado, dimensión de embedding de 768 y `max_seq_length` de 128. No se emplea pooling por token CLS ni por máximo. El nombre del repositorio sugiere un ajuste fino con QLoRA (cuantización de bajo rango) sobre un par de frases ("pair") y posterior fusión de pesos ("merged"), pero no se documenta en la model card ni el dataset de entrenamiento, ni el número de tokens, ni la configuración de LoRA, ni si hubo etapas de contraste o hard negatives.

La model card incluida es la de `sentence-transformers/bert-base-nli-mean-tokens`, un modelo de referencia de SBERT entrenado sobre NLI, y no describe el proceso de ajuste fino específico de este repositorio. No se dispone de información sobre composición del dataset, técnicas de alineación (RLHF/DPO) ni innovaciones técnicas adicionales. El propio autor advierte que el modelo está obsoleto y produce embeddings de baja calidad.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio vectorial denso de 768 dimensiones.
- Similitud semántica entre pares de frases (pipeline `sentence-similarity`).
- Extracción de características (`feature-extraction`) para tareas downstream.
- Búsqueda semántica y recuperación de información mediante similitud de coseno.
- Agrupamiento (clustering) de textos por proximidad en el espacio de embeddings.
- Integración con `sentence-transformers`, `transformers` y Text Embeddings Inference (TEI).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Búsqueda semántica en corpus pequeños: indexar documentos y consultar por similitud de coseno usando los embeddings de 768 dimensiones, siempre que las secuencias no superen los 128 tokens.
- Deduplicación de textos: agrupar documentos o registros casi idénticos calculando distancias entre embeddings.
- Clustering de tickets o reseñas: agrupar quejas o comentarios por temática para análisis exploratorio.
- Clasificación zero-shot por prototipos: comparar embeddings de textos con embeddings de etiquetas descriptivas y asignar la clase más cercana.
- Filtrado de pares en datasets de entrenamiento: detectar pares de frases redundantes o duplicados antes de usarlos en ajuste fino.
- Prototipado educativo o de investigación: experimentar con pipelines SBERT y QLoRA en entornos con recursos limitados, dado el reducido tamaño del modelo (0,2 GB).
- Baseline en evaluaciones internas: servir como referencia mínima frente a la que comparar modelos de embeddings más modernos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,5 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- En fp16: aproximadamente 0,22 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para cargas moderadas.
- Despliegue posible con `sentence-transformers`, `transformers`, Text Embeddings Inference (TEI), `vLLM` (soporte de embeddings limitado) y `llama.cpp` no aplica (no es un modelo GGUF).
- Latencia y throughput: no disponibles; al ser un BERT-base con secuencias de 128 tokens, el throughput esperado es alto en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Estado |
|---|---|---|---|---|---|
| sachinyerrawar/sbert_qlora_finmodern_pair_merged | 109,5 M | 128 tokens | 768 | Apache 2.0 | Experimental, sin descargas |
| sentence-transformers/bert-base-nli-mean-tokens | ~109 M | 128 tokens | 768 | Apache 2.0 | Obsoleto según su model card |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | 384 | Apache 2.0 | Ampliamente usado, recomendado por SBERT.net |
| sentence-transformers/all-mpnet-base-v2 | ~109 M | 384 tokens | 768 | Apache 2.0 | Recomendado por SBERT.net |

Los dos últimos se citan como alternativas de referencia en la propia documentación de SBERT.net enlazada desde la model card. No se dispone de métricas comparativas de rendimiento para este repositorio concreto.

## Limitaciones y advertencias

- La model card declara explícitamente que el modelo está obsoleto y produce embeddings de baja calidad; no se recomienda su uso.
- Longitud de contexto muy limitada (128 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- No se documenta el dataset de ajuste fino ni el proceso QLoRA, lo que impide evaluar sesgos y calidad.
- Riesgo de alucinación no aplica directamente (no es un modelo generativo), pero sí de recuperación semántica incorrecta por embeddings de baja calidad.
- Idiomas soportados no declarados; no hay garantía de buen rendimiento en castellano.
- Sin descargas ni validación comunitaria; no hay evidencia de uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable su despliegue en producción sin evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/sachinyerrawar/sbert_qlora_finmodern_pair_merged
- Modelo de referencia en la model card: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Paper SBERT: https://arxiv.org/abs/1908.10084
- Modelos recomendados por SBERT.net: https://www.sbert.net/docs/pretrained_models.html
- Documentación de Sentence-Transformers: https://www.SBERT.net
