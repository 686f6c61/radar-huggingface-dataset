# finvector/Test_sbert_lora_finsent-finmodern-investo-ccdb-finder_4chunks_pair-tri_merged

## Resumen

Este repositorio contiene un modelo de embeddings de frases derivado de BERT-base, publicado por el usuario `finvector` bajo el identificador `Test_sbert_lora_finsent-finmodern-investo-ccdb-finder_4chunks_pair-tri_merged`. El nombre sugiere un experimento de ajuste fino mediante LoRA sobre un corpus financiero (componentes "finsent", "finmodern", "investo", "ccdb") con pares y tripletas de entrenamiento, posteriormente fusionado en los pesos base. La model card, sin embargo, es la plantilla genérica de `sentence-transformers/bert-base-nli-mean-tokens`, por lo que la documentación específica del autor no está disponible.

El modelo cuenta con 109.482.240 parámetros en formato safetensors (aproximadamente 0,2 GB) y produce embeddings densos de 768 dimensiones mediante mean pooling sobre la salida de un `BertModel`. Está etiquetado para `sentence-similarity` y `feature-extraction`, y es compatible con `text-embeddings-inference` y endpoints de Hugging Face. Su relevancia es limitada: se trata de un artefacto de prueba con cero descargas y cero likes, sin métricas publicadas, y la propia model card heredada advierte que el modelo base está obsoleto.

No debe confundirse con un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Su única función es transformar frases o párrafos en vectores para búsqueda semántica, clustering o reranking, presumiblemente en el dominio financiero según indica el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (SentenceTransformer con capa de Pooling) |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (`max_seq_length: 128` en la model card heredada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el nombre sugiere dominio financiero, posiblemente ingles y/o fines) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es un `SentenceTransformer` compuesto por un `Transformer` (BertModel, `do_lower_case: False`, `max_seq_length: 128`) seguido de una capa `Pooling` con `word_embedding_dimension: 768` y `pooling_mode_mean_tokens: True`. El resto de modos de pooling (CLS, max, mean_sqrt_len) están desactivados. La dimensión de salida es, por tanto, 768.

El nombre del repositorio indica un ajuste fino con LoRA (`lora`) sobre una tarea de similitud de frases en dominio financiero, con datos organizados en "4chunks" y entrenamiento con pares y tripletas (`pair-tri`), y una posterior fusión de los adaptadores en los pesos base (`merged`). No obstante, no se dispone de información verificable sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable a un encoder de similitud) ni detalles del procedimiento de fusión. La model card incluida es la plantilla estándar del modelo base `bert-base-nli-mean-tokens`, que además aparece marcada como obsoleta y de baja calidad de embeddings.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio denso de 768 dimensiones.
- Similitud semántica entre textos (pipeline `sentence-similarity`).
- Extracción de características (`feature-extraction`) para downstream tasks.
- Búsqueda semántica y recuperación densa mediante similitud coseno o producto escalar.
- Clustering de textos por similitud de embeddings.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no disponibles/documentadas.

## Casos de uso

- Búsqueda semántica en documentación financiera: indexar informes, notas o filings y recuperar fragmentos por similitud vectorial; el modelo está etiquetado para `sentence-similarity` y el nombre sugiere ajuste al dominio financiero, aunque sin métricas publicadas que lo confirmen.
- Deduplicación de noticias o comunicados: generar embeddings de titulares y agrupar por distancia coseno para detectar duplicados o versiones de una misma noticia.
- Clustering de feedback de clientes: agrupar tickets o reseñas en temas recurrentes usando los vectores de 768 dimensiones y algoritmos como k-means o HDBSCAN.
- Reranking ligero en pipelines RAG: como segunda etapa tras una recuperación BM25, comparando la similitud entre la consulta y los candidatos; su tamaño reducido (0,2 GB) permite desplegarlo en CPU.
- Clasificación de sentimiento por proximidad a prototipos: codificar frases de referencia por clase y asignar la clase del prototipo más cercano, coherente con el componente "finsent" del nombre.
- Detección de similitud entre pares de frases en control de calidad de datos: filtrar pares casi duplicados en un corpus antes de entrenar otros modelos.
- Servicio de embeddings en producción: al ser compatible con `text-embeddings-inference` y endpoints de Hugging Face, puede exponerse como API HTTP para generar vectores bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (109 M parámetros, ~0,44 GB de pesos); en fp16 ~0,22 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX 10xx), así como en iGPU y CPU.
- Opciones de despliegue: `sentence-transformers`, `transformers`, `text-embeddings-inference` (etiqueta `text-embeddings-inference` presente), endpoints de Hugging Face; `llama.cpp`/Ollama no aplican al no existir pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo se espera procesamiento por lotes en CPU a decenas o cientos de frases por segundo, pero no hay mediciones publicadas.
- Limitación de contexto: 128 tokens por secuencia, lo que restringe el tamaño de los fragmentos a codificar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finvector/Test_sbert_lora_...merged (este) | 109,5 M | 128 tokens | 768 | apache-2.0 | Hugging Face, 0 descargas |
| sentence-transformers/bert-base-nli-mean-tokens | 109,5 M | 128 tokens | 768 | apache-2.0 | Hugging Face (marcado obsoleto por el autor) |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | 384 | apache-2.0 | Hugging Face, ampliamente usado |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | 768 | MIT | Hugging Face, con benchmarks MTEB publicados |

Los datos de los modelos alternativos provienen de conocimiento general de esos repositorios; no se dispone de comparaciones directas publicadas con este modelo concreto.

## Limitaciones y advertencias

- La model card incluida es la plantilla de `bert-base-nli-mean-tokens`, marcada explícitamente como obsoleta y de baja calidad de embeddings; no documenta el ajuste fino realizado.
- No hay métricas de evaluación publicadas: se desconoce si el ajuste LoRA mejora o degrada la calidad respecto al modelo base.
- Contexto máximo de 128 tokens, insuficiente para documentos largos sin fragmentación previa.
- Idiomas soportados no declarados; el rendimiento fuera del dominio financiero (y potencialmente fuera del inglés) es incierto.
- Riesgo de alucinación no aplicable (no es generativo), pero sí riesgo de similitudes espurias por embeddings de baja calidad.
- Sesgos: no documentados; al derivar de BERT-base, puede heredar sesgos de género, raza o dominio presentes en los corpus de preentrenamiento y de ajuste.
- Licencia apache-2.0 permite uso comercial, pero sin garantías de calidad ni soporte del autor.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por la comunidad.
- El nombre del repositorio incluye "Test", lo que sugiere un artefacto experimental no destinado a producción.

## Enlaces

- Hugging Face: https://huggingface.co/finvector/Test_sbert_lora_finsent-finmodern-investo-ccdb-finder_4chunks_pair-tri_merged
- Paper Sentence-BERT: https://arxiv.org/abs/1908.10084
- Modelo base referenciado en la model card: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Documentación SBERT: https://www.sbert.net
- Modelos recomendados por SBERT: https://www.sbert.net/docs/pretrained_models.html
