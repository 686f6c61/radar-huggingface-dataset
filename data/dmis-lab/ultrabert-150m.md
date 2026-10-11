# dmis-lab/UltraBERT-150M

## Resumen

UltraBERT-150M es un encoder bidireccional en inglés desarrollado por dmis-lab (el laboratorio detrás de PubMedBERT, en KAIST) que forma parte de la familia UltraBERT, junto a UltraBERT-380M y UltraBERT-Embed-150M. Se distribuye como checkpoint de masked language modeling con un contexto nativo de 32.000 tokens, una ventana muy superior a la de los encoders clásicos (512 tokens en BERT/RoBERTa) y al doble de la de ModernBERT (8K). Su propuesta diferencial es cubrir simultáneamente dos familias de tareas que históricamente obligaban a elegir: clasificación (GLUE, NER, Reward-Bench) y recuperación densa (BEIR, MLDR, LongEmbed).

El modelo se entrenó inicialmente a 2.000 tokens y después se extendió a 32K, manteniendo un 99% de acierto en el test passkey de LongEmbed en todas las longitudes hasta 32K. Incorpora dos innovaciones técnicas reseñables: cabezas LM desacopladas (cada lote mezcla secuencias enmascaradas al 5% y al 50%, y cada ratio tiene su propia cabeza para evitar interferencias) y un esquema de pruning de anchura más destilación KL desde un teacher de 1.300 millones de parámetros, del que derivan tanto el modelo de 380M como este de 150M.

Es relevante ahora porque los encoders pequeños siguen siendo la opción coste-eficiente para clasificación, NER, reranking y embeddings en producción, y UltraBERT-150M logra el mejor resultado de su categoría en las diez tareas evaluadas del bloque base (menos de 200M de parámetros) según los datos publicados por el autor, incluyendo BEIR (45,2), RARb Code (39,1) y LongEmbed (72,0). El repositorio se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional para masked language modeling (familia UltraBERT); soporta FlashAttention 2, SDPA y atención eager |
| Parametros totales | 189.960.960 según los pesos safetensors del repositorio; la model card y la tabla de evaluación del autor indican 150M / 152M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32K tokens nativos (preentrenado a 2K y extendido a 32K) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con `custom_code` (requiere `trust_remote_code=True` y `transformers >= 5`, probado con 5.16.1) |
| Dimensión oculta | 768 |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

UltraBERT-150M es un encoder bidireccional (no generativo) entrenado con objetivo de masked language modeling. La innovación central es el uso de cabezas LM desacopladas: cada lote de preentrenamiento mezcla secuencias enmascaradas al 5% y al 50%, y cada ratio de enmascaramiento tiene su propia cabeza de predicción. Según el autor, los ratios bajos favorecen las tareas de clasificación y los altos favorecen la recuperación, de modo que cabezas separadas permiten a un único encoder aprender ambos regímenes sin la interferencia que provocaría una cabeza compartida. El modelo se entrenó primero con contexto de 2.000 tokens y después se extendió a 32.000. Para entradas largas se recomienda FlashAttention 2, aunque también se admiten SDPA y atención eager.

El checkpoint se obtiene por pruning de anchura y destilación: el modelo de 380M se poda desde un encoder teacher de 1,3B parámetros y el de 150M se poda a su vez desde el de 380M. Ambos se destilan desde el teacher de 1,3B con una pérdida KL aplicada únicamente a las secuencias enmascaradas al 5%, mientras que las secuencias al 50% usan la pérdida MLM estándar. Los datos de preentrenamiento declarados en la model card abarcan diez corpus: mlfoundations/dclm-baseline-1.0, HuggingFaceFW/fineweb-edu, HuggingFaceTB/stack-edu, allenai/peS2o, LLM360/MegaMath, HuggingFaceTB/finemath, HuggingFaceTB/smollm-corpus, allenai/dolma, Open-Orca/FLAN y facebook/natural_reasoning. El número total de tokens de entrenamiento, la composición exacta del dataset y la existencia de fases de RLHF o DPO no se detallan en la información disponible (el objetivo es MLM, por lo que RLHF no resultaría de aplicación directa).

## Capacidades

- Relleno de máscaras (fill-mask) y modelado de lenguaje enmascarado en inglés.
- Clasificación de secuencias mediante `AutoModelForSequenceClassification` (por ejemplo, análisis de sentimiento, detección de toxicidad, clasificación de temas).
- Recuperación densa de información (dense retrieval) tras fine-tuning con mean pooling y pérdida contrastiva.
- Reconocimiento de entidades nombradas (NER) en dominios generales y pocos ejemplos (Few-NERD, MultiCoNER v2).
- Razonamiento evaluado mediante Reward-Bench (preferencias) y tareas de código y matemáticas de RARb.
- Manejo de contextos largos de hasta 32K tokens con alta precisión en recuperación de información tipo passkey (99% en LongEmbed a todas las longitudes).
- Soporte multilingüe: no disponible; el modelo está etiquetado únicamente como inglés.
- Tool calling / function calling: no disponible (es un encoder MLM, no un modelo generativo con chat template).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa.

## Casos de uso

- Clasificación de documentos largos: contratos, informes o expedientes de decenas de miles de tokens pueden procesarse en una sola pasada sin truncar ni fragmentar, gracias a la ventana nativa de 32K y al 89,5 de GLUE del modelo.
- Búsqueda semántica y recuperación densa: fine-tuneando con mean pooling y pérdida contrastiva, el modelo sirve como primer estadio de un pipeline RAG, con un 45,2 en BEIR y 43,5 en MLDR, superior a ModernBERT y Ettin Encoder del mismo tamaño.
- Reranking de resultados de búsqueda: al ser un encoder bidireccional puede puntuar pares consulta-documento con atención cruzada completa, una configuración típicamente más precisa que los bi-encoders puros para la segunda etapa de ranking.
- Extracción de entidades en textos largos: con Few-NERD 67,4 y MultiCoNER v2 57,9, es adecuado para pipelines de anonimización, extracción de cláusulas legales o etiquetado de entidades en artículos científicos completos.
- Moderación de contenido y filtrado de abuso en plataformas: la ventana de 32K permite clasificar hilos de conversación completos en lugar de mensajes aislados, capturando contexto que los modelos de 512 tokens pierden.
- Indexación de código y documentación técnica: con 39,1 en RARb Code, sirve para construir índices semánticos sobre repositorios y documentación, alimentando asistentes de código que recuperan fragmentos relevantes.
- Evaluación de calidad y preferencias: 73,0 en Reward-Bench lo hace utilizable como modelo de recompensa o filtro de calidad en pipelines de curación de datos de entrenamiento.
- Análisis de literatura científica: el corpus peS2o y la longitud de contexto permiten clasificar y agrupar artículos completos por temática, metodología o hallazgos.
- Deduplicación semántica de corpus a gran escala: la combinación de embeddings densos y ventana larga permite comparar documentos completos en lugar de párrafos sueltos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Cada modelo se fine-tunea por tarea con la misma búsqueda en rejilla. La columna Params corresponde a lo indicado por el autor (la fila UltraBERT es la del modelo de 152M, equivalente a este checkpoint de 150M).

| Modelo | Parametros | GLUE | SQuAD 2.0 | MultiCoNER v2 | Few-NERD | Reward-Bench | BEIR | RARb Code | RARb Math | MLDR | LongEmbed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT | 110M | 84,7 | 76,3 | 53,8 | 66,6 | 59,4 | 36,7 | 6,6 | 27,5 | 29,0 | 29,3 |
| RoBERTa | 125M | 86,4 | 83,7 | 56,5 | 67,1 | 63,2 | 39,6 | 11,7 | 33,4 | 28,7 | 33,8 |
| MosaicBERT | 137M | 85,4 | 79,4 | 57,8 | 65,7 | 62,5 | 41,4 | 12,7 | 30,9 | 29,6 | 40,5 |
| NomicBERT | 137M | 84,0 | 82,7 | 60,1 | 66,9 | 64,1 | 42,0 | 13,8 | 30,2 | 29,9 | 45,0 |
| GTE-en-MLM | 137M | 85,6 | 82,7 | 59,2 | 66,4 | 63,4 | 42,4 | 12,0 | 33,6 | 37,1 | 58,5 |
| ModernBERT | 149M | 88,4 | 86,7 | 57,4 | 66,7 | 68,0 | 42,6 | 29,6 | 46,1 | 37,7 | 63,2 |
| Ettin Encoder | 149M | 88,9 | 87,4 | 57,4 | 66,5 | 70,3 | 42,4 | 31,8 | 47,1 | 35,9 | 60,1 |
| UltraBERT | 152M | 89,5 | 89,2 | 57,9 | 67,4 | 73,0 | 45,2 | 39,1 | 55,4 | 43,5 | 72,0 |

En el bloque de tamaño medio (hasta 500M de parámetros) la model card solo muestra la fila de BERT (334M: GLUE 85,2; SQuAD 2.0 81,8; MultiCoNER v2 57,7; Few-NERD 67,8; Reward-Bench 62,6; BEIR 38,6). El resto de resultados de ese bloque (incluido UltraBERT-380M) no están disponibles en la información proporcionada. No hay datos de latencia, throughput ni coste por token.

## Requisitos de hardware

- VRAM para inferencia (estimación a partir del recuento real de parámetros, 189,96M): aproximadamente 0,4 GB en bf16/fp16 y 0,8 GB en fp32 solo para los pesos. La memoria adicional depende de la longitud de secuencia; con 32K tokens y atención densa las activaciones pueden dominar el consumo, por lo que se recomienda FlashAttention 2.
- GPU recomendadas: cualquier GPU con soporte de bf16 y FlashAttention 2 (serie RTX 30/40, A100, H100, L40S, H200). Para contextos de 32K en producción, una A100 40/80 GB o L40S permite lotes mayores.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB o superior es suficiente para los pesos y para secuencias largas con lotes pequeños; para 32K tokens conviene una RTX 4090 (24 GB) o una GPU con más memoria si se necesita batch alto.
- CPU: es viable en x86 moderno para secuencias cortas, aunque la ventana de 32K encarece mucho el cómputo por atención completa.
- Opciones de despliegue: `transformers >= 5` con `trust_remote_code=True` (ruta oficial). Para servir a escala, vLLM o TGI si admiten el `custom_code` del modelo; llama.cpp y Ollama no son compatibles de forma directa porque no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible (no hay mediciones publicadas en la información proporcionada).
- Nota operativa: al requerir `trust_remote_code=True`, hay que auditar el código remoto antes de desplegarlo en entornos de producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GLUE | BEIR | LongEmbed | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| UltraBERT-150M | 152M (autor) / 189,96M (safetensors) | 32K | 89,5 | 45,2 | 72,0 | Apache 2.0 | HuggingFace, requiere `transformers >= 5` |
| ModernBERT | 149M | 8K | 88,4 | 42,6 | 63,2 | Apache 2.0 | HuggingFace |
| Ettin Encoder | 149M | 8K (no confirmado en la información disponible) | 88,9 | 42,4 | 60,1 | no disponible | HuggingFace |
| GTE-en-MLM | 137M | no disponible | 85,6 | 42,4 | 58,5 | no disponible | HuggingFace |
| RoBERTa | 125M | 512 | 86,4 | 39,6 | 33,8 | MIT | HuggingFace |

UltraBERT-150M es el único de la comparativa con 32K de contexto nativo y el que obtiene las mejores cifras en las diez tareas del bloque base salvo MultiCoNER v2, donde NomicBERT queda por delante (60,1 frente a 57,9). La ventaja es especialmente amplia en recuperación (BEIR, MLDR, LongEmbed), que es justamente donde los encoders clásicos de 512 tokens se quedan cortos.

## Limitaciones y advertencias

- Es un encoder MLM, no un modelo generativo: no produce texto libre, no tiene modo chat ni plantilla de conversación, y no soporta tool calling de forma nativa.
- Idiomas: solo inglés. No hay evidencia de capacidades multilingües y la etiqueta oficial es `en`.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad o evaluación de equidad en la información disponible. Los corpus de preentrenamiento (DCLM, FineWeb-Edu, Dolma, entre otros) son rastreados de web y arrastran los sesgos habituales de ese tipo de datos.
- Alucinación: al ser un modelo de relleno de máscaras, el riesgo no es la alucinación conversacional, sino la predicción de tokens plausibles pero incorrectos en fill-mask; en recuperación, el riesgo es devolver pasajes semánticamente cercanos pero factualmente irrelevantes.
- Dependencia de código remoto: el checkpoint requiere `trust_remote_code=True` y `transformers >= 5`, lo que implica ejecutar código del autor y rompe la compatibilidad con versiones anteriores de la librería.
- Ajuste de hiperparámetros inusual: el autor advierte que UltraBERT prefiere tasas de aprendizaje hasta 10 veces más bajas que otros encoders (5e-5 para el modelo de 150M frente a los 3e-4/5e-4 habituales). Ignorar esto degrada el fine-tuning.
- Cifras de recuperación con matices: los resultados de BEIR, MLDR y LongEmbed provienen de fine-tuning sobre subconjuntos de MS MARCO o MLDR con una rejilla común, no de un entrenamiento con cientos de millones de pares como los modelos de embeddings dedicados. El autor lo señala explícitamente: son indicativos del potencial del encoder, no comparables de forma directa con modelos como GTE o E5 entrenados a gran escala.
- Discrepancia en el recuento de parámetros: la model card declara 150M/152M, pero safetensors reporta 189.960.960 parámetros. Conviene verificar antes de dimensionar infraestructura.
- Repositorio recién publicado y con 0 descargas en el momento de la consulta: no hay validación independiente ni reportes de terceros.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, sin cláusulas de uso aceptable adicionales documentadas.
- El enlace al paper en la model card está vacío, por lo que no es posible revisar la metodología completa ni los detalles de datos y cómputo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dmis-lab/UltraBERT-150M
- UltraBERT-380M: https://huggingface.co/dmis-lab/UltraBERT-380M
- UltraBERT-Embed-150M: https://huggingface.co/dmis-lab/UltraBERT-Embed-150M
- Paper: no disponible (el enlace de la model card está vacío)
- La búsqueda web no devolvió resultados relacionados con el modelo; los enlaces encontrados tratan sobre el avión Sukhoi Su-27 y no son pertinentes para esta ficha.
