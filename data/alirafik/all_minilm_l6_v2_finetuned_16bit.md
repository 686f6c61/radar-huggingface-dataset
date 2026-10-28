# aliRafik/all_minilm_l6_v2_finetuned_16bit

## Resumen

`all_minilm_l6_v2_finetuned_16bit` es un modelo de embeddings de frases publicado por el usuario aliRafik en Hugging Face. Se trata de un fine-tune de `unsloth/all-MiniLM-L6-v2`, un transformer de tipo BERT de 6 capas y 22.713.216 parámetros, que proyecta frases y párrafos a un vector denso de 384 dimensiones normalizado, orientado a similitud semántica y recuperación de información.

El ajuste se ha realizado sobre el conjunto `sentence-transformers/all-nli` (100.000 pares ancla-positivo) con la pérdida `MultipleNegativesRankingLoss`, el esquema contrastivo clásico de Sentence-BERT, y se ha ejecutado con la librería Unsloth. El resultado es un codificador pequeño que cabe en cualquier GPU e incluso en CPU, y que encaja como pieza base en pipelines de búsqueda semántica, deduplicación o clustering.

Conviene contextualizar su madurez: en el momento de la consulta el repositorio acumula 0 descargas y 0 likes, no declara licencia y no publica resultados de benchmarks. Debe tratarse, por tanto, como un experimento reproducible y no como una alternativa validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SentenceTransformer: `BertModel` (feature-extraction, 6 capas) + pooling medio + normalización L2 |
| Parámetros totales | 22.713.216 (recuento real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de secuencia máxima |
| Tipos de cuantización | no disponible; se distribuyen pesos safetensors y el nombre del repositorio sugiere 16 bits, sin confirmar |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (la model card indica "Unknown") |
| Formato de pesos | safetensors (librería `sentence-transformers`) |
| Dimensión de salida | 384 |
| Función de similitud | coseno (vectores normalizados, producto escalar) |
| Tarea de pipeline | `sentence-similarity` / `feature-extraction` |
| Modelo base | `unsloth/all-MiniLM-L6-v2` (revisión 0f79ca30c044e92859f5852d3a29fb6e976741cd) |
| Dataset de entrenamiento | `sentence-transformers/all-nli`, 100.000 muestras, columnas `anchor` y `positive` |
| Función de pérdida | MultipleNegativesRankingLoss |
| Autor | aliRafik |
| Fecha de creación / actualización | 2026-10-28 |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0.0 GB reportado por la plataforma (redondeo) |

## Arquitectura y entrenamiento

La arquitectura es la de un `SentenceTransformer` en tres módulos: (0) un `BertModel` configurado en modo `feature-extraction` que devuelve `last_hidden_state` y expone `token_embeddings`; (1) una capa de pooling con `pooling_mode: mean`, `embedding_dimension: 384` e `include_prompt: true`; y (2) una capa de normalización sin parámetros. La similitud se calcula sobre vectores normalizados, de modo que el producto escalar equivale al coseno. El sufijo `L6` del nombre corresponde a las 6 capas transformer del backbone MiniLM y la configuración declara 512 tokens de longitud máxima de secuencia.

El entrenamiento consiste en un fine-tune del checkpoint `unsloth/all-MiniLM-L6-v2` sobre `sentence-transformers/all-nli` (revisión `d482672`), con 100.000 muestras y pérdida `MultipleNegativesRankingLoss`, que usa los positivos del resto del lote como negativos implícitos. La model card no documenta hiperparámetros (epochs, batch size, learning rate, warmup, precisión de entrenamiento), ni si hubo evaluación intermedia, destilación adicional o una etapa de cuantización asociada al sufijo `16bit`; tampoco se justifica la elección de `all-nli` frente a otros datasets.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para frases y párrafos de hasta 512 tokens.
- Similitud semántica entre pares de textos (STS) mediante coseno.
- Búsqueda semántica y recuperación densa sobre índices vectoriales.
- Minería de paráfrasis y detección de duplicados casi idénticos.
- Clustering y agrupación temática de corpus de texto.
- Clasificación por similitud con etiquetas o prototipos (zero-shot por comparación de embeddings).
- Extracción de características (`feature-extraction`) para pipelines posteriores.
- Compatible con Text Embeddings Inference y con los endpoints de Hugging Face según las etiquetas del repositorio.
- No genera texto: no es un modelo decoder, por lo que no soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Monolingüe en inglés; no se declara soporte multilingüe.

## Casos de uso

- Búsqueda semántica en documentación interna: indexar los fragmentos con este modelo y consultar por similitud coseno; sus 512 tokens permiten indexar párrafos completos sin trocear en exceso, y los 384 dimensiones reducen el coste del índice vectorial.
- Deduplicación de tickets de soporte o preguntas frecuentes: comparar cada ticket entrante contra el histórico y fusionar los que superen un umbral de similitud, con un coste de cómputo muy bajo por par.
- Clustering de feedback de usuarios: generar embeddings de encuestas o reseñas y agrupar con k-means o HDBSCAN para descubrir temas recurrentes sin etiquetado previo.
- Reranking ligero en pipelines de RAG: usar el modelo como primera etapa de filtrado sobre los candidatos de un retriever léxico (BM25) antes de un cross-encoder más caro.
- Detección de contenido duplicado en scrapers o agregadores: comparar titulares y cuerpos de noticia para descartar republicaciones, apoyándose en la normalización L2 para umbrales estables entre lotes.
- Clasificación few-shot mediante kNN sobre embeddings: etiquetar pequeñas muestras de textos con prototipos por clase, útil cuando no hay datos suficientes para entrenar un clasificador supervisado.
- Filtrado y moderación por proximidad: comparar mensajes contra una lista de patrones o textos de referencia previamente vectorizados.

En todos los casos conviene validar el umbral de similitud con datos propios: la model card solo aporta un ejemplo cualitativo (pares relacionados ≈ 0,63; no relacionados ≈ 0,005–0,058), no una calibración sistemática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones en MTEB, STS Benchmark ni tareas de recuperación, y tampoco se aportan comparaciones con el checkpoint base que permitan determinar si el fine-tune mejora o degrada el rendimiento original.

El único dato numérico publicado es el ejemplo del widget de la model card, que no constituye un benchmark: para las frases "Five men, one wearing a white shirt standing on something, hanging up a picture of a child." frente a "A group of men are hanging a picture on a wall." y "Two workers are opening a utility box." se obtienen similitudes de 0,6305 y 0,0055 respectivamente.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 45 MB en fp16 y 91 MB en fp32, calculados a partir de los 22.713.216 parámetros (estimación aritmética, no un dato publicado).
- VRAM estimada para inferencia: por debajo de 1 GB incluyendo overhead del runtime y lotes de trabajo habituales; el modelo es viable en CPU para volúmenes moderados.
- GPU recomendadas: cualquier GPU consumer reciente sirve (GTX 1650, RTX 3060, RTX 4090); A100 o H100 solo tienen sentido para servir grandes volúmenes en paralelo, no por requisitos de memoria.
- Cabe holgadamente en GPU consumer: sí, en todas las gamas actuales, e incluso en entornos sin GPU.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (etiqueta `text-embeddings-inference`), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportación a ONNX vía Optimum. No se publican pesos GGUF ni integración con Ollama o llama.cpp.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de salida | Contexto máximo | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| `aliRafik/all_minilm_l6_v2_finetuned_16bit` | 22.713.216 | 384 | 512 | no disponible | en | Fine-tune sobre `all-nli` con MNRL; sin benchmarks publicados |
| `unsloth/all-MiniLM-L6-v2` (base) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Checkpoint de partida del fine-tune |
| Otras variantes MiniLM de `sentence-transformers` (por ejemplo `all-MiniLM-L12-v2`, `paraphrase-MiniLM-L6-v2`) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Alternativas de la misma familia y tamaño; requieren consultar sus fichas y resultados MTEB para una comparación cuantitativa |

No se dispone de datos verificados de rendimiento ni de licencia de los modelos comparables dentro de la información proporcionada, por lo que la comparación cuantitativa queda pendiente de consultar las fichas oficiales y los resultados públicos de MTEB.

## Limitaciones y advertencias

- Licencia no declarada: la model card marca la licencia como "Unknown", lo que impide asumir permiso de uso comercial. Es imprescindible contactar con el autor antes de integrarlo en un producto.
- Monolingüe en inglés: no se ha entrenado ni evaluado en castellano; su uso en otros idiomas producirá embeddings de calidad no garantizada.
- Ventana de 512 tokens: textos más largos se truncan, con pérdida de información en documentos extensos.
- Capacidad limitada por el tamaño: con 6 capas y 22,7 M de parámetros es previsible un rendimiento inferior a modelos de 100-400 M en dominios técnicos, jerga especializada o pares con matices finos; no hay benchmarks que lo confirmen.
- Riesgo de falso positivo en similitud: textos léxicamente próximos pero semánticamente distintos pueden superar el umbral; requiere calibración y, en su caso, un cross-encoder de segunda etapa.
- Sesgos heredados: al derivar de `all-nli` y del backbone MiniLM, puede reproducir sesgos presentes en los corpus de origen (no documentados en la ficha).
- Sin validación independiente: 0 descargas y 0 likes implican ausencia de uso comunitario y de informes externos de calidad.
- Posible sobreajuste al dominio NLI: el fine-tune se limita a pares de inferencia natural; no se demuestra que mejore tareas de recuperación abierta.
- Tamaño de repositorio reportado como 0.0 GB: conviene verificar la integridad y el contenido real de los pesos antes de desplegar.
- No apto para generación de texto, razonamiento, agentes ni tool calling: es exclusivamente un codificador de embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aliRafik/all_minilm_l6_v2_finetuned_16bit
- Modelo base: https://huggingface.co/unsloth/all-MiniLM-L6-v2
- Dataset `all-nli`: https://huggingface.co/datasets/sentence-transformers/all-nli
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Catálogo de modelos Sentence Transformers: https://huggingface.co/models?library=sentence-transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Referencia arXiv 1908.10084 (Sentence-BERT): https://arxiv.org/abs/1908.10084
- Referencia arXiv 1807.03748 (citada en las etiquetas del repositorio): https://arxiv.org/abs/1807.03748
