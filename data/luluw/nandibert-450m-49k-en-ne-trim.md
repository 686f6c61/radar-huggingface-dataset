# luluw/NandiBERT-450M-49k-en-ne-trim

## Resumen

NandiBERT-450M es un encoder bidireccional de tipo BERT desarrollado por FrontiersMind, disenado para cubrir simultaneamente ingles y lenguas indicas con un unico modelo. La version publicada en `luluw/NandiBERT-450M-49k-en-ne-trim` es un checkpoint derivado (recortado a ingles y nepalí, con vocabulario de 49K) del modelo original de FrontiersMind, con 418,4 millones de parametros almacenados en safetensors y licencia Apache-2.0.

El modelo resuelve el problema de tener que mantener encoders separados para ingles y para lenguas indicas: la familia NandiBERT apunta a un rendimiento estado del arte en ambos dominios a su tamano, con una ventana de contexto de 32K tokens que permite procesar documentos completos en una sola pasada. Su arquitectura incluye QK-norm, SwiGLU, atencion con grouped-query attention (8 cabezas de query, 2 de key-value) y embeddings factorizados de rango 512, lo que reduce la tabla de embeddings de 103M a 52M parametros.

Es relevante para desarrolladores que necesitan un encoder solido como base para fine-tuning en clasificacion, NER, reranking y recuperacion de documentos largos, especialmente en escenarios multilingues ingles-nepalí. El checkpoint esta pensado para `transformers` y se usa con pipeline `fill-mask`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT-style) con QK-norm, SwiGLU y grouped-query attention |
| Parametros totales | 418.447.360 (safetensors del checkpoint derivado); el modelo original declara 445M en el encoder y 548M con la capa MLM no atada |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (32K) en el modelo original; no disponible para el checkpoint recortado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ne (checkpoint derivado); el modelo original cubre ingles, 11 lenguas indicas en escritura nativa y romanizada, sudeste asiatico y Oriente Medio |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NandiBERT-450M es un encoder transformer bidireccional de 28 capas con tamano oculto de 1.024. Incorpora QK-norm y SwiGLU en las capas feed-forward, y usa grouped-query attention con 8 cabezas de query y 2 de key-value para reducir el consumo de memoria en secuencias largas. El vocabulario multilingue de 100K tokens del modelo original se almacena como embedding factorizado de rango 512, lo que rebaja la tabla de embeddings de 103M a 52M parametros y libera capacidad para las capas del encoder. El checkpoint tambien guarda la capa de salida MLM no atada (103M parametros), de ahi la diferencia entre los 445M del encoder y los 548M del fichero original.

El modelo se entrena con masked language modeling (MLM) sobre un corpus multilingue que cubre ingles, 11 lenguas indicas en escritura nativa y romanizada, lenguas del sudeste asiatico y de Oriente Medio. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables en un encoder MLM). El checkpoint `luluw/NandiBERT-450M-49k-en-ne-trim` es una variante recortada a ingles y nepalí con vocabulario de 49K; no se especifica en la informacion disponible el procedimiento exacto de recorte ni el volumen de datos adicional usado.

## Capacidades

- Extraccion de caracteristicas y representaciones contextuales bidireccionales (`feature-extraction`).
- Masked language modeling y `fill-mask` sobre texto en ingles y nepalí.
- Clasificacion de secuencias (sentimiento, inferencia, parafrasis) tras fine-tuning.
- Reconocimiento de entidades nombradas (NER) y etiquetado de slots tras fine-tuning.
- Question answering extractivo tras fine-tuning.
- Reranking y recuperacion de documentos largos gracias a la ventana de 32K del modelo original.
- Procesamiento de documentos completos en una sola pasada (contratos, informes, articulos).
- Soporte multilingue ingles-nepalí en el checkpoint derivado; cobertura indico ampliada en el modelo original.
- No soporta generacion autoregresiva, tool calling ni razonamiento multi-paso: es un encoder, no un modelo causal.

## Casos de uso

- Clasificacion de documentos legales y administrativos: fine-tuning sobre el encoder para etiquetar contratos o expedientes completos en una sola pasada gracias a la ventana de 32K del modelo base, sin necesidad de truncar ni dividir el texto.
- NER en textos en nepalí e ingles: el checkpoint derivado permite entrenar un cabezal de etiquetado sobre noticias, formularios o registros medicos bilingues, aprovechando las representaciones contextuales del encoder.
- Recuperacion de informacion y reranking: usar los embeddings del encoder como base para un cross-encoder de reranking en un pipeline RAG bilingue ingles-nepalí, con coste de inferencia bajo frente a un modelo generativo.
- Analisis de sentimiento y moderacion de contenido: clasificacion de resenas o comentarios en nepalí e ingles con un cabezal ligero sobre el encoder, adecuado para volumenes altos por su tamano moderado.
- Extraccion de respuestas en QA documental: fine-tuning para question answering extractivo sobre bases documentales internas en ambos idiomas, con contexto largo que evita la fragmentacion agresiva.
- Filtrado y deduplicacion semantica de corpus: calcular embeddings de parrafos o documentos para agrupar y deduplicar contenido bilingue en pipelines de curación de datos.
- Base para modelos de codigo o matematicas tras fine-tuning: el modelo original reporta resultados en RAR-b Code y RAR-b Math, por lo que el encoder puede adaptarse a tareas de recuperacion de fragmentos de codigo o expresiones matematicas.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo original (media de 3 semillas). No se han publicado resultados especificos del checkpoint recortado `luluw/NandiBERT-450M-49k-en-ne-trim`.

Benchmarks indicos:

| Modelo | Parametros | IndicSentiment | IndicXNLI | IndicCOPA | IndicXParaphrase | Naamapadam NER (F1) | MASSIVE Slot-fill (F1) | IndicQA (F1) | Media |
|---|---|---|---|---|---|---|---|---|---|
| IndicBERT-v2 | 272M | 88,3 | 74,3 | 63,0 | 57,0 | 72,4 | 57,3 | 49,2 | 65,93 |
| NandiBERT-450M | 445M | 92,9 | 81,3 | 76,1 | 77,8 | 72,5 | 61,0 | 51,0 | 73,23 |

Benchmarks en ingles:

| Modelo | Idiomas | Parametros | GLUE | SQuAD 2.0 | MUltiCoNERv2 | few-nerd | Reward Bench | BEIR | RAR-b Code | RAR-b Math | MLDR | LongEmbed | Media |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT-large | Ingles | 334M | 85,2 | 81,8 | 57,7 | 67,8 | 62,6 | 38,6 | 12,2 | 33,0 | 29,8 | 30,0 | 49,87 |
| RoBERTa-large | Ingles | 355M | 88,9 | 89,4 | 62,3 | 68,1 | 68,5 | 42,8 | 20,3 | 37,8 | 29,5 | 32,2 | 53,98 |
| GTE-en-MLM-large | Ingles | 434M | 87,6 | 87,2 | 63,0 | 67,1 | 62,2 | 39,4 | 13,5 | 32,0 | 40,8 | 57,0 | 54,98 |
| NeoBERT | Ingles | 222M | 89,0 | 86,6 | 57,4 | 66,4 | 57,6 | 42,9 | 17,3 | 33,4 | 21,7 | 32,4 | 50,47 |
| LFM2.5-Encoder-350M | Ingles | 355M | 89,2 | 87,2 | 62,7 | 67,9 | 68,5 | 47,3 | 38,6 | 50,2 | 44,5 | 71,7 | 62,78 |
| Ettin-Encoder-400M | Ingles | 395M | 90,8 | 90,4 | 62,3 | 67,8 | 76,7 | 45,9 | 38,5 | 54,0 | 40,9 | 64,3 | 63,16 |
| ModernBERT-large | Ingles | 395M | 90,4 | 89,8 | 60,9 | 67,6 | 72,8 | 45,2 | 34,0 | 46,1 | 39,9 | 63,5 | 61,02 |
| UltraBERT-380M | Ingles | 380M | 91,0 | 90,9 | 63,5 | 68,3 | 78,8 | 47,7 | 47,0 | 61,7 | 44,1 | 74,9 | 66,79 |
| NandiBERT-450M | Multilingue | 445M | 89,9 | 89,7 | 61,4 | 68,5 | 74,7 | 46,1 | 37,4 | 52,8 | 41,46 | 71,4 | 63,34 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB para los 418M parametros del checkpoint (mas activaciones, que dependen de la longitud de secuencia).
- VRAM estimada en fp16/bf16: aproximadamente 0,9 GB de pesos; las activaciones con contexto largo de 32K pueden dominar el consumo.
- Cabe en cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090), incluso con secuencias largas moderadas.
- GPU recomendadas para entrenamiento o fine-tuning con contexto largo: A100 40/80 GB, H100, L40S; para fine-tuning con batches pequenos basta una RTX 4090 de 24 GB.
- Opciones de despliegue: `transformers` (libreria nativa), vLLM no aplica de forma directa al ser encoder; ONNX Runtime, TorchScript y `optimum` para exportacion; servidores de inferencia tipo TGI para embeddings si se adapta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NandiBERT-450M | 445M | 32K | Ingles + indico + otros | 63,34 (ingles) / 73,23 (indico) | Apache-2.0 | Hugging Face |
| ModernBERT-large | 395M | 8K | Ingles | 61,02 (ingles) | Apache-2.0 | Hugging Face |
| UltraBERT-380M | 380M | no disponible | Ingles | 66,79 (ingles) | no disponible | Hugging Face |
| Ettin-Encoder-400M | 395M | no disponible | Ingles | 63,16 (ingles) | no disponible | Hugging Face |
| IndicBERT-v2 | 272M | no disponible | Indico | 65,93 (indico) | no disponible | Hugging Face |

NandiBERT-450M destaca por combinar cobertura multilingue con contexto de 32K, mientras que los encoders comparables en ingles (ModernBERT-large, UltraBERT, Ettin) obtienen mejores medias en tareas puramente inglesas pero no cubren lenguas indicas. Frente a IndicBERT-v2, NandiBERT supera en todas las tareas indicas reportadas con una media de 73,23 frente a 65,93.

## Limitaciones y advertencias

- El checkpoint `luluw/NandiBERT-450M-49k-en-ne-trim` es una variante recortada no oficial del modelo original de FrontiersMind; su rendimiento puede diferir del reportado en la model card original.
- Al ser un encoder MLM, no genera texto libre ni soporta tool calling, agentes o razonamiento multi-paso.
- Riesgo de alucinacion bajo en tareas extractivas, pero presente en cabezales de QA o clasificacion mal calibrados.
- Cobertura linguistica del checkpoint limitada a ingles y nepalí; el resto de lenguas indicas del modelo original no estan garantizadas en esta variante.
- Sesgos potenciales heredados del corpus de entrenamiento multilingue, no documentados en la informacion disponible.
- Aunque la licencia es Apache-2.0, conviene verificar los terminos del modelo original de FrontiersMind si se redistribuye o se usa comercialmente.
- No se han publicado resultados de benchmarks del checkpoint recortado; los numeros de la tabla corresponden al modelo original.
- La model card original menciona un technical report "coming soon"; no hay paper disponible a fecha de la informacion.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/luluw/NandiBERT-450M-49k-en-ne-trim
- Hugging Face de FrontiersMind: https://huggingface.co/FrontiersMind
- Modelo original NandiBERT-450M: https://huggingface.co/FrontiersMind/NandiBERT-450M
- Modelo NandiBERT-150M: https://huggingface.co/FrontiersMind/NandiBERT-150M
- GitHub de FrontiersMind: https://github.com/FrontiersMindAI/
- Blog de lanzamiento: https://www.frontiersmind.ai/blog/nandibert/
- Web oficial: https://www.frontiersmind.ai/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
