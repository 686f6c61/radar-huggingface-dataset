# FrontiersMind/NandiBERT-450M

## Resumen

NandiBERT-450M es un codificador bidireccional (encoder) de tipo BERT desarrollado por FrontiersMind, diseñado para cubrir simultáneamente inglés y lenguas índicas en un único modelo. Resuelve el problema clásico de tener que mantener codificadores separados para inglés (RoBERTa, ModernBERT) y para lenguas índicas (IndicBERT, MuRIL), ofreciendo un rendimiento competitivo en ambos frentes con un solo checkpoint.

El modelo forma parte de la familia NandiBERT, que incluye una variante de 150M de parámetros con contexto de 16K y esta versión de 450M con contexto extendido de 32K tokens. La arquitectura consta de 28 capas con tamaño oculto de 1024, atención de consultas agrupadas (GQA) con 8 cabezas de consulta y 2 de clave-valor, QK-norm y SwiGLU. Emplea embeddings factorizados de rango 512 sobre un vocabulario multilingüe de 100K tokens compartido con el resto de la familia.

Es relevante porque combina tres características poco habituales en codificadores de este tamaño: cobertura de 17 idiomas (inglés, 13 lenguas índicas, indonesio, malayo y árabe), ventana de contexto de 32K tokens para documentos largos, y licencia Apache-2.0 sin restricciones para uso comercial. Está pensado como base para fine-tuning en clasificación, NER, reranking y recuperación de documentos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (estilo BERT) con QK-norm, SwiGLU y grouped-query attention |
| Parametros totales | 548.471.808 (445M encoder + 103M capa MLM no atada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 17: en, hi, mr, pa, ta, te, kn, ml, bn, gu, as, or, ur, ne, ar, id, ms (11 de las índicas también en forma romanizada) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NandiBERT-450M es un encoder bidireccional de 28 capas con tamaño oculto de 1024. Incorpora varias innovaciones respecto al BERT clásico: normalización QK para estabilizar el entrenamiento en contextos largos, activación SwiGLU en las capas feed-forward, y atención de consultas agrupadas con 8 cabezas de consulta y solo 2 de clave-valor, lo que reduce el consumo de memoria en secuencias de hasta 32K tokens. El vocabulario de 100K tokens se almacena como embedding factorizado de rango 512, lo que reduce la tabla de embeddings de 103M a 52M parámetros y redirige esa capacidad hacia las capas del encoder.

El modelo se pre-entrena con objetivo de modelado de lenguaje enmascarado (MLM) sobre datos multilingües que cubren inglés, 13 lenguas índicas en escritura nativa, indonesio, malayo y árabe. La model card no especifica el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO (habitualmente no aplicables a encoders MLM). El checkpoint incluye la capa de salida MLM no atada (103M parámetros) que no es necesaria para fine-tuning, por lo que el modelo efectivo a ajustar es de 445M parámetros.

## Capacidades

- Generación de representaciones contextuales bidireccionales para clasificación de texto, análisis de sentimiento, inferencia en lenguaje natural y paráfrasis.
- Relleno de máscaras (fill-mask) como tarea de pre-entrenamiento nativa.
- Reconocimiento de entidades nombradas (NER) y etiquetado de slots en 13 lenguas índicas.
- Respuesta a preguntas extractiva (QA) sobre contextos multilingües.
- Retrieval y reranking de documentos, con soporte de contexto largo hasta 32K tokens.
- Procesamiento de documentos completos (contratos, informes, artículos) en una sola pasada.
- Capacidades multilingües en 17 idiomas, incluyendo formas romanizadas de 11 lenguas índicas.
- Procesamiento de código y matemáticas en tareas de recuperación (evaluado en RAR-b Code y RAR-b Math).
- No soporta tool calling, function calling ni razonamiento agéntico multi-paso: es un encoder, no un modelo generativo.

## Casos de uso

- Clasificación de documentos legales largos: con 32K tokens de contexto, el modelo puede procesar contratos completos en una sola pasada y clasificarlos por tipo, riesgo o cláusulas relevantes, evitando la fragmentación que exigen encoders de 512 tokens.
- Reconocimiento de entidades en textos multilingües índicos: útil para pipelines de extracción de información en banca, seguros o administración pública que operen en hindi, tamil, bengalí o telugu, con un único modelo en lugar de uno por idioma.
- Recuperación aumentada (RAG) sobre corpus multilingües: el modelo puede servir como encoder base para indexación y reranking de documentos en inglés, árabe, indonesio y lenguas índicas, con ventana de 32K que permite indexar pasajes largos sin truncado agresivo.
- Moderación de contenido en plataformas del sur de Asia: clasificación de toxicidad, spam o contenido sensible en 13 lenguas índicas nativas y romanizadas, con fine-tuning sobre datasets etiquetados.
- Análisis de sentimiento de reseñas de producto: fine-tuning sobre IndicSentiment y datasets propios para opiniones en e-commerce que operen en múltiples idiomas índicos.
- Respuesta a preguntas sobre documentación técnica o financiera: fine-tuning extractivo sobre SQuAD 2.0 o IndicQA para asistentes de atención al cliente que necesiten localizar respuestas en informes largos.
- Reranking en motores de búsqueda multilingües: uso del encoder como cross-encoder para reordenar resultados de búsqueda en inglés y lenguas índicas, aprovechando el rendimiento en BEIR y MLDR.
- Etiquetado de slots para asistentes de voz: fine-tuning sobre MASSIVE para extracción de intenciones y entidades en comandos de usuario en lenguas índicas.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

### Benchmarks índicos

| Modelo | Params | IndicSentiment | IndicXNLI | IndicCOPA | IndicXParaphrase | Naamapadam NER (f1) | MASSIVE Slot-fill (f1) | IndicQA (f1) | Media |
|---|---|---|---|---|---|---|---|---|---|
| IndicBERT-v2 | 272M | 88,3 | 74,3 | 63,0 | 57,0 | 72,4 | 57,3 | 49,2 | 65,93 |
| NandiBERT-450M | 445M | 92,9 | 81,3 | 76,1 | 77,8 | 72,5 | 61,0 | 51,0 | 73,23 |

### Benchmarks en inglés

| Modelo | Params | GLUE | SQuAD 2.0 | MUltiCoNERv2 | few-nerd | Reward Bench | BEIR | RAR-b Code | RAR-b Math | MLDR | LongEmbed | Media |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT-large | 334M | 85,2 | 81,8 | 57,7 | 67,8 | 62,6 | 38,6 | 12,2 | 33,0 | 29,8 | 30,0 | 49,87 |
| RoBERTa-large | 355M | 88,9 | 89,4 | 62,3 | 68,1 | 68,5 | 42,8 | 20,3 | 37,8 | 29,5 | 32,2 | 53,98 |
| GTE-en-MLM-large | 434M | 87,6 | 87,2 | 63,0 | 67,1 | 62,2 | 39,4 | 13,5 | 32,0 | 40,8 | 57,0 | 54,98 |
| NeoBERT | 222M | 89,0 | 86,6 | 57,4 | 66,4 | 57,6 | 42,9 | 17,3 | 33,4 | 21,7 | 32,4 | 50,47 |
| LFM2.5-Encoder-350M | 355M | 89,2 | 87,2 | 62,7 | 67,9 | 68,5 | 47,3 | 38,6 | 50,2 | 44,5 | 71,7 | 62,78 |
| Ettin-Encoder-400M | 395M | 90,8 | 90,4 | 62,3 | 67,8 | 76,7 | 45,9 | 38,5 | 54,0 | 40,9 | 64,3 | 63,16 |
| ModernBERT-large | 395M | 90,4 | 89,8 | 60,9 | 67,6 | 72,8 | 45,2 | 34,0 | 46,1 | 39,9 | 63,5 | 61,02 |
| UltraBERT-380M | 380M | 91,0 | 90,9 | 63,5 | 68,3 | 78,8 | 47,7 | 47,0 | 61,7 | 44,1 | 74,9 | 66,79 |
| NandiBERT-450M | 445M | No disponible en la información proporcionada | | | | | | | | | | |

Nota: la tabla de benchmarks en inglés de la model card aparece truncada en la información disponible; no se han podido extraer los valores de NandiBERT-450M para esa sección.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB para los pesos completos (548M parámetros a 2 bytes), más memoria de activaciones que crece con la longitud de secuencia; para 32K tokens se recomienda al menos 8-16 GB de VRAM según el tamaño de batch.
- VRAM estimada en FP32: aproximadamente 2,2 GB solo para pesos.
- GPU recomendadas: A100, H100 o L40S para procesamiento de lotes grandes con contexto de 32K; RTX 4090 o RTX 3090 para inferencia en FP16 con batches moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) e incluso RTX 4060 Ti (16 GB) para secuencias cortas; para 32K tokens se recomienda 16 GB o más.
- Opciones de despliegue: Hugging Face `transformers` (soporte nativo), vLLM (soporte de encoders), TGI, y exportación a ONNX para inferencia optimizada. No se menciona soporte GGUF ni llama.cpp en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Idiomas | Licencia | Media índica | Media inglesa |
|---|---|---|---|---|---|---|
| NandiBERT-450M | 445M | 32K | 17 | Apache-2.0 | 73,23 | No disponible |
| IndicBERT-v2 | 272M | No disponible | 12 índicas | No disponible | 65,93 | No aplica |
| ModernBERT-large | 395M | 8K (típico) | Inglés | Apache-2.0 | No aplica | 61,02 |
| UltraBERT-380M | 380M | No disponible | Inglés | No disponible | No aplica | 66,79 |
| Ettin-Encoder-400M | 395M | No disponible | Inglés | No disponible | No aplica | 63,16 |

NandiBERT-450M supera a IndicBERT-v2 en la media de benchmarks índicos (73,23 frente a 65,93) con un modelo de mayor tamaño. Frente a codificadores ingleses especializados como UltraBERT-380M o Ettin-Encoder-400M, la comparación directa no es posible con los datos disponibles porque la tabla inglesa de NandiBERT aparece truncada; los modelos ingleses puros obtienen medias de 61-67 en la suite inglesa, por lo que NandiBERT necesitaría acercarse a ese rango para ser competitivo en inglés puro, algo que la model card no permite verificar.

## Limitaciones y advertencias

- Es un encoder MLM, no un modelo generativo: no puede usarse para generación de texto libre, chat ni razonamiento agéntico.
- La model card no documenta sesgos específicos; al entrenarse sobre datos web multilingües es probable que herede sesgos de género, religión, casta y región presentes en corpus índicos, pero no se aportan evaluaciones.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas en tareas de clasificación y NER cuando el dominio de fine-tuning difiere del de pre-entrenamiento.
- La cobertura de 17 idiomas no implica calidad uniforme: la model card solo reporta benchmarks para 13 lenguas índicas y evalúa inglés por separado; no hay datos de rendimiento para árabe, indonesio o malayo.
- El contexto de 32K está soportado arquitectónicamente, pero no se documenta la degradación de rendimiento en longitudes cercanas al límite.
- La capa MLM no atada (103M parámetros) se incluye en el checkpoint pero no es necesaria para fine-tuning; conviene descartarla para reducir el tamaño en producción.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni soporte.
- No se documentan requisitos de atribución más allá de los habituales de Apache-2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrontiersMind/NandiBERT-450M
- Variante de 150M: https://huggingface.co/FrontiersMind/NandiBERT-150M
- Modelo de embeddings relacionado: https://huggingface.co/FrontiersMind/EmbeddingNandi-450M
- Organización en Hugging Face: https://huggingface.co/FrontiersMind
- GitHub: https://github.com/FrontiersMindAI/
- Blog de lanzamiento: https://www.frontiersmind.ai/blog/nandibert/
- Sitio web: https://www.frontiersmind.ai/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
