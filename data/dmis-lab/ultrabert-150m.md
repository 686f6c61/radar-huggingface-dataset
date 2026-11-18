# dmis-lab/UltraBERT-150M

## Resumen

UltraBERT-150M es un encoder bidireccional en inglés desarrollado por el laboratorio dmis-lab (KAIST), diseñado para cubrir simultáneamente tareas de clasificación y de recuperación de información con una ventana de contexto nativa de 32.000 tokens. La familia UltraBERT se presenta como la primera generación de encoders que alcanza el estado del arte en ambas familias de tareas al mismo tamaño, superando la dicotomía clásica entre modelos optimizados para GLUE (clasificación) y modelos optimizados para BEIR (retrieval).

El modelo aquí descrito cuenta con 189.960.960 parámetros reales según los pesos en safetensors, aunque el autor lo etiqueta comercialmente como "150M" (hidden de 768). Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y soporte nativo en `transformers >= 5.20` (en versiones 5.x anteriores requiere `trust_remote_code=True`). Es relevante ahora porque ofrece contexto largo real (32K) en un encoder pequeño, un nicho tradicionalmente dominado por modelos de 8K como ModernBERT o Ettin, y porque su doble cabeza LM desacoplada permite un único checkpoint para clasificación y búsqueda densa.

La relevancia práctica está en pipelines de búsqueda semántica, NER, clasificación de documentos largos y evaluación de razonamiento, donde un encoder de menos de 200M parámetros con 32K de contexto reduce costes de inferencia frente a alternativas generativas. No es un modelo generativo: su pipeline es `fill-mask` y su uso principal es como backbone para fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (estilo BERT/RoBERTa) con cabezas LM desacopladas |
| Parametros totales | 189.960.960 (etiquetado comercial: 150M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrenado a 2K y extendido a 32K) |
| Tipos de cuantizacion | no disponible (pesos safetensors en bfloat16 recomendado; no se documentan GGUF ni otras) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension oculta | 768 |
| Libreria | transformers (>= 5.20 nativo; 5.16.1 con `trust_remote_code=True`) |
| Atencion | FlashAttention 2 (recomendada), SDPA y eager |
| Tamano del repo | 0.9 GB |

## Arquitectura y entrenamiento

UltraBERT-150M es un encoder bidireccional tipo transformer con 768 dimensiones ocultas y 32K de contexto nativo. La innovación arquitectónica central son las **cabezas LM desacopladas**: cada batch de preentrenamiento mezcla secuencias enmascaradas al 5% y al 50%, y cada ratio de enmascaramiento tiene su propia cabeza de modelado de lenguaje. Según el autor, los ratios bajos favorecen la clasificación y los altos favorecen el retrieval, de modo que cabezas separadas permiten aprender ambas sin la interferencia que provoca una cabeza compartida.

El entrenamiento parte de un teacher de 1.3B parámetros. El modelo de 380M se obtiene por *width pruning* del teacher, y el de 150M por pruning del de 380M. Ambos se destilan del teacher de 1.3B con pérdida KL aplicada únicamente a las secuencias enmascaradas al 5%, mientras que las secuencias al 50% usan la pérdida MLM estándar. El corpus de preentrenamiento combina datasets documentados en la model card: `mlfoundations/dclm-baseline-1.0`, `HuggingFaceFW/fineweb-edu`, `HuggingFaceTB/stack-edu`, `allenai/peS2o`, `LLM360/MegaMath`, `HuggingFaceTB/finemath`, `HuggingFaceTB/smollm-corpus`, `allenai/dolma`, `Open-Orca/FLAN` y `facebook/natural_reasoning`. No se especifica en la información disponible el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO (no aplicables a un encoder MLM).

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) en inglés, con contexto de hasta 32K tokens.
- Clasificación de secuencias (GLUE, NER, Reward-Bench) mediante fine-tuning con `AutoModelForSequenceClassification`.
- Recuperación densa (retrieval) con mean pooling y pérdida contrastiva, orientada a BEIR, MLDR y RARb.
- Manejo de documentos largos: 99% de precisión en el test passkey de LongEmbed a todas las longitudes hasta 32K.
- Capacidad de razonamiento evaluada vía Reward-Bench y RARb (Code y Math) tras fine-tuning.
- Soporte de atención eficiente con FlashAttention 2 y SDPA para entradas largas.
- No soporta tool calling, function calling, agentes ni generación de texto libre (es un encoder, no un decoder).
- Multilingüe: no, únicamente inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- **Búsqueda semántica sobre documentación técnica larga**: con 32K de contexto, un único pasaje puede cubrir manuales o contratos completos sin truncado, y el modelo mantiene precisión de passkey hasta 32K, lo que reduce la pérdida de información en fragmentación.
- **Clasificación de documentos extensos**: actas, informes o expedientes de hasta 32K tokens se clasifican en una sola pasada con `AutoModelForSequenceClassification`, evitando arquitecturas jerárquicas o chunking.
- **Reconocimiento de entidades nombradas (NER)**: los resultados en MultiCoNER v2 (57,9) y Few-NERD (67,4) lo sitúan como backbone competitivo para extracción de entidades en textos largos.
- **Reranking en pipelines RAG**: como encoder de retrieval con BEIR 45,2 y MLDR 43,5, puede usarse para reordenar candidatos recuperados por un retriever de primera fase, con coste bajo por su tamaño.
- **Evaluación automática de respuestas y preferencias**: Reward-Bench 73,0 permite usarlo como modelo de recompensa o juez ligero en pipelines de evaluación de LLMs, con fine-tuning específico.
- **Detección de similitud y deduplicación de corpus**: mean pooling sobre embeddings de 768 dimensiones con contexto largo permite comparar documentos completos sin truncar, útil en curación de datasets.
- **Moderación y clasificación de contenido en inglés**: fine-tuning sobre datasets etiquetados para clasificación binaria o multietiqueta con contexto largo, desplegable en una sola GPU consumer.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (fine-tuning por tarea con la misma búsqueda de hiperparámetros). Tamaño base (≤200M parámetros):

| Modelo | Params | GLUE | SQuAD 2.0 | MultiCoNER v2 | Few-NERD | Reward-Bench | BEIR | RARb Code | RARb Math | MLDR | LongEmbed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT | 110M | 84,7 | 76,3 | 53,8 | 66,6 | 59,4 | 36,7 | 6,6 | 27,5 | 29,0 | 29,3 |
| RoBERTa | 125M | 86,4 | 83,7 | 56,5 | 67,1 | 63,2 | 39,6 | 11,7 | 33,4 | 28,7 | 33,8 |
| MosaicBERT | 137M | 85,4 | 79,4 | 57,8 | 65,7 | 62,5 | 41,4 | 12,7 | 30,9 | 29,6 | 40,5 |
| NomicBERT | 137M | 84,0 | 82,7 | 60,1 | 66,9 | 64,1 | 42,0 | 13,8 | 30,2 | 29,9 | 45,0 |
| GTE-en-MLM | 137M | 85,6 | 82,7 | 59,2 | 66,4 | 63,4 | 42,4 | 12,0 | 33,6 | 37,1 | 58,5 |
| ModernBERT | 149M | 88,4 | 86,7 | 57,4 | 66,7 | 68,0 | 42,6 | 29,6 | 46,1 | 37,7 | 63,2 |
| Ettin Encoder | 149M | 88,9 | 87,4 | 57,4 | 66,5 | 70,3 | 42,4 | 31,8 | 47,1 | 35,9 | 60,1 |
| **UltraBERT** | **152M** | **89,5** | **89,2** | 57,9 | **67,4** | **73,0** | **45,2** | **39,1** | **55,4** | **43,5** | **72,0** |

UltraBERT-150M lidera en GLUE, SQuAD 2.0, Few-NERD, Reward-Bench, BEIR, RARb Code, RARb Math, MLDR y LongEmbed, y solo queda por detrás de NomicBERT en MultiCoNER v2. La mejora es especialmente marcada en LongEmbed (72,0 frente a 63,2 de ModernBERT) y en RARb Math (55,4 frente a 47,1 de Ettin). El autor advierte que las tareas de retrieval se entrenan sobre un subconjunto de MS MARCO o MLDR, por lo que reflejan el potencial del encoder, no el de un modelo de embeddings dedicado.

## Requisitos de hardware

- Inferencia en bfloat16: ~380 MB de pesos (189,96M parámetros × 2 bytes), más activaciones que crecen con la longitud de secuencia.
- Contexto de 32K con FlashAttention 2: el coste de activaciones puede superar varios GB; se recomienda GPU con al menos 16-24 GB para secuencias completas de 32K.
- Cabe en GPU consumer: sí. Una RTX 4090 (24 GB), RTX 4080 (16 GB) o incluso RTX 3090/4070 Ti manejan el modelo en bf16; para secuencias cortas (<8K) cabe en GPUs de 8-12 GB.
- GPU recomendadas: A100/H100 para throughput alto y batches grandes; RTX 4090 para desarrollo y despliegue de baja latencia.
- Opciones de despliegue: `transformers` nativo (>=5.20), vLLM no aplica (no es generativo), TGI soporta encoders, ONNX Runtime y TorchScript para producción. llama.cpp/Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada. Con 150M parámetros y FlashAttention 2, se espera throughput alto en clasificación con batches grandes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | GLUE | BEIR | LongEmbed | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| UltraBERT-150M | 152M | 32K | 89,5 | 45,2 | 72,0 | Apache 2.0 | Hugging Face |
| ModernBERT | 149M | 8K | 88,4 | 42,6 | 63,2 | Apache 2.0 | Hugging Face |
| Ettin Encoder | 149M | 8K | 88,9 | 42,4 | 60,1 | Apache 2.0 | Hugging Face |
| GTE-en-MLM | 137M | 8K | 85,6 | 42,4 | 58,5 | Apache 2.0 | Hugging Face |

UltraBERT-150M ofrece el doble o cuádruple de contexto que sus competidores directos (32K frente a 8K), con ventajas claras en LongEmbed (+8,8 sobre ModernBERT) y en retrieval (BEIR 45,2). La licencia Apache 2.0 es equivalente a la de ModernBERT y Ettin, por lo que la elección se reduce a rendimiento y contexto. La contrapartida es que requiere `transformers >= 5.20` o `trust_remote_code=True`, y que su sensibilidad a learning rates bajos exige ajustar hiperparámetros en fine-tuning.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que descarta su uso en pipelines multilingües sin traducción previa.
- No es generativo: no puede usarse para chat, tool calling ni agentes; su pipeline es `fill-mask`.
- Riesgo de sesgo heredado de los corpus de preentrenamiento (DCLM, FineWeb-Edu, Dolma, etc.), no evaluado en la información disponible.
- Riesgo de alucinación limitado al no generar texto, pero los clasificadores fine-tuneados pueden producir falsos positivos en dominios fuera de distribución.
- Sensibilidad a learning rates: el autor advierte que prefiere tasas hasta 10× más bajas que otros encoders (1e-5 en MNLI para 150M, 5e-5 en retrieval denso), lo que puede provocar infraentrenamiento si se reutilizan recetas estándar.
- Los benchmarks de retrieval se obtienen con fine-tuning sobre subconjuntos de MS MARCO/MLDR, no equivalen a un modelo de embeddings dedicado entrenado con cientos de millones de pares.
- Requiere `transformers >= 5.20` o `trust_remote_code=True` en 5.16.1, lo que puede complicar despliegues con versiones fijadas.
- No hay datos publicados sobre cuantización (GGUF, AWQ, GPTQ) ni sobre latencia/throughput en producción.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la procedencia de los datasets de preentrenamiento para cumplimiento normativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dmis-lab/UltraBERT-150M
- Modelo hermano 380M: https://huggingface.co/dmis-lab/UltraBERT-380M
- Modelo de embeddings: https://huggingface.co/dmis-lab/UltraBERT-Embed-150M
- Paper: https://arxiv.org/abs/2610.15028
- Dataset DCLM: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Stack-Edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset peS2o: https://huggingface.co/datasets/allenai/peS2o
- Dataset MegaMath: https://huggingface.co/datasets/LLM360/MegaMath
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset Dolma: https://huggingface.co/datasets/allenai/dolma
- Dataset FLAN: https://huggingface.co/datasets/Open-Orca/FLAN
- Dataset Natural Reasoning: https://huggingface.co/datasets/facebook/natural_reasoning
