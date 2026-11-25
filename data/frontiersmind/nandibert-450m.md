# FrontiersMind/NandiBERT-450M

## Resumen

NandiBERT-450M es un codificador bidireccional (encoder) de tipo BERT desarrollado por FrontiersMind, diseñado para cubrir simultáneamente inglés, lenguas índicas y un conjunto adicional de idiomas de Asia meridional y Oriente Medio. El modelo resuelve un problema concreto: hasta ahora los encoders existentes solían ser fuertes en inglés o en índico, pero rara vez en ambos, lo que obligaba a mantener dos modelos separados en pipelines multilingües. NandiBERT unifica ambos mundos en un único checkpoint con licencia Apache-2.0.

La arquitectura es un transformer bidireccional de 28 capas con tamaño oculto de 1.024, atención de consultas agrupadas (GQA) con 8 cabezas de consulta y 2 de clave-valor, QK-norm y SwiGLU. El encoder propiamente dicho tiene 445M de parámetros, aunque el checkpoint completo almacena 548M porque incluye la capa de salida MLM no atada (103M). Su ventana de contexto alcanza los 32.768 tokens, lo que lo sitúa en la categoría de encoders de contexto largo.

El modelo está pensado como base para fine-tuning en tareas de clasificación, reconocimiento de entidades, reranking y recuperación de documentos largos. Su vocabulario multilingüe de 100K tokens, compartido con el resto de la familia NandiBERT, y sus embeddings factorizados de rango 512 lo hacen especialmente adecuado para escenarios donde se necesita procesar documentos completos en una sola pasada sin segmentar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (estilo BERT) con GQA, QK-norm y SwiGLU |
| Parametros totales | 548.471.808 (445M encoder + 103M capa MLM no atada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, hi, mr, pa, ta, te, kn, ml, bn, gu, as, or, ur, ne, ar, id, ms |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NandiBERT-450M es un encoder bidireccional de 28 capas con dimensión oculta de 1.024. Incorpora atención de consultas agrupadas (8 cabezas de consulta, 2 de clave-valor) para reducir el coste de memoria en secuencias largas, QK-norm para estabilizar el entrenamiento y SwiGLU como activación en las capas feed-forward. El vocabulario de 100K tokens se almacena como embedding factorizado de rango 512, lo que reduce la tabla de embeddings de 103M a 52M parámetros y libera capacidad para las capas del encoder. La capa de salida MLM está desatada del embedding de entrada, de ahí que el checkpoint completo tenga 548M de parámetros frente a los 445M del encoder fine-tuneable.

El modelo se preentrenó con objetivo de modelado de lenguaje enmascarado (MLM) sobre un corpus multilingüe que cubre 13 lenguas índicas en escritura nativa (asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, nepalí, odia, punyabí, tamil, telugu y urdu), además de inglés, árabe, indonesio y malayo. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa, ya que se trata de un encoder y no de un modelo generativo autorregresivo. El informe técnico está anunciado como "coming soon" en la model card.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre texto multilingüe.
- Codificación bidireccional de secuencias de hasta 32.768 tokens en una sola pasada.
- Cobertura de 13 lenguas índicas en escritura nativa más inglés, árabe, indonesio y malayo.
- Soporte de formas romanizadas de las lenguas índicas según la model card.
- Base para fine-tuning en clasificación de texto, NER, reranking y recuperación de documentos largos.
- Capacidad de representación para código y matemáticas, evaluada en los benchmarks RAR-b Code y RAR-b Math.
- No es un modelo generativo: no soporta tool calling, function calling ni razonamiento multi-step por sí mismo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación de sentimiento multilingüe: fine-tuning sobre IndicSentiment o datasets propios para moderación de comentarios en hindi, tamil, bengalí y otras lenguas índicas, aprovechando que un único modelo cubre todos los idiomas sin cambiar de checkpoint.
- Reconocimiento de entidades nombradas en documentos legales o periodísticos: el contexto de 32K permite procesar contratos o artículos completos y extraer entidades con coherencia global, algo que un encoder de 512 tokens no puede hacer sin segmentar.
- Recuperación de documentos largos (long-document retrieval): usar los embeddings del modelo como base para un sistema de búsqueda sobre informes anuales, papers o expedientes, con la ventana de 32K alineada con las necesidades de LongEmbed.
- Reranking en pipelines RAG: fine-tuning como cross-encoder para reordenar candidatos recuperados por un retriever bi-encoder, con la ventaja de evaluar pares consulta-documento largos sin truncar.
- Análisis de contratos y cumplimiento normativo: clasificación de cláusulas y detección de riesgos en documentos legales multilingües (inglés, hindi, árabe, indonesio) en una sola pasada por documento.
- Procesamiento de atención al cliente en mercados asiáticos: clasificación de tickets y extracción de entidades en conversaciones multi-turno en lenguas índicas y del sudeste asiático, reduciendo la necesidad de mantener modelos separados por idioma.
- Etiquetado de datos para entrenamiento de LLMs: uso del modelo como anotador o filtro de calidad en corpus multilingües, aprovechando su cobertura de 17 idiomas y su licencia permisiva.

## Benchmarks y rendimiento

Resultados publicados en la model card. La columna "Average" es la media de las métricas reportadas por el autor.

### Benchmarks en índico

| Modelo | Params | IndicSentiment | IndicXNLI | IndicCOPA | IndicXParaphrase | Naamapadam NER (f1) | MASSIVE Slot-fill (f1) | IndicQA (f1) | Media |
|---|---|---|---|---|---|---|---|---|---|
| IndicBERT-v2 | 272M | 88,3 | 74,3 | 63,0 | 57,0 | 72,4 | 57,3 | 49,2 | 65,93 |
| NandiBERT-450M | 445M | 92,9 | 81,3 | 76,1 | 77,8 | 72,5 | 61,0 | 51,0 | 73,23 |

### Benchmarks en inglés

| Modelo | Idiomas | Params | GLUE | SQuAD 2.0 | MUltiCoNERv2 | few-nerd | Reward Bench | BEIR | RAR-b Code | RAR-b Math | MLDR | LongEmbed | Media |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT-large | English | 334M | 85,2 | 81,8 | 57,7 | 67,8 | 62,6 | 38,6 | 12,2 | 33,0 | 29,8 | 30,0 | 49,87 |
| RoBERTa-large | English | 355M | 88,9 | 89,4 | 62,3 | 68,1 | 68,5 | 42,8 | 20,3 | 37,8 | 29,5 | 32,2 | 53,98 |
| GTE-en-MLM-large | English | 434M | 87,6 | 87,2 | 63,0 | 67,1 | 62,2 | 39,4 | 13,5 | 32,0 | 40,8 | 57,0 | 54,98 |
| NeoBERT | English | 222M | 89,0 | 86,6 | 57,4 | 66,4 | 57,6 | 42,9 | 17,3 | 33,4 | 21,7 | 32,4 | 50,47 |
| LFM2.5-Encoder-350M | English | 355M | 89,2 | 87,2 | 62,7 | 67,9 | 68,5 | 47,3 | 38,6 | 50,2 | 44,5 | 71,7 | 62,78 |
| Ettin-Encoder-400M | English | 395M | 90,8 | 90,4 | 62,3 | 67,8 | 76,7 | 45,9 | 38,5 | 54,0 | 40,9 | 64,3 | 63,16 |
| ModernBERT-large | English | 395M | 90,4 | 89,8 | 60,9 | 67,6 | 72,8 | 45,2 | 34,0 | 46,1 | 39,9 | 63,5 | 61,02 |
| UltraBERT-380M | English | 380M | 91,0 | 90,9 | 63,5 | 68,3 | 78,8 | 47,7 | 47,0 | 61,7 | 44,1 | 74,9 | 66,79 |
| NandiBERT-450M | Multi-Lingual | 445M | 89,9 | 89,7 | 61,4 | 68,5 | 74,7 | 46,1 | 37,4 | 52,8 | 41,46 | 71,4 | 63,34 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB para los 548M de parámetros.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB.
- VRAM estimada en int8: aproximadamente 0,55 GB.
- Cabe holgadamente en cualquier GPU de consumo con al menos 4 GB de VRAM (RTX 3050, GTX 1660, RTX 4060, etc.).
- GPU recomendadas para producción: A100, H100 o L40S para alto throughput con lotes grandes y secuencias de 32K; RTX 4090 o RTX 3090 para desarrollo y despliegues de baja latencia.
- La ventana de 32K incrementa el uso de memoria de activaciones; con GQA (2 cabezas KV) el coste es menor que en un encoder con atención multi-cabeza completa, pero conviene monitorizar el batch size en secuencias largas.
- Opciones de despliegue: `transformers` (carga directa con `AutoModel`), vLLM no aplica para encoders, Text Embeddings Inference (TEI) de Hugging Face es la opción recomendada para servir embeddings, ONNX Runtime para CPU, y llama.cpp/Ollama no soportan encoders BERT de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Idiomas | Licencia | Media (índico) | Media (inglés) |
|---|---|---|---|---|---|---|
| NandiBERT-450M | 445M (548M checkpoint) | 32K | 17 (índico + inglés + árabe + SEA) | Apache-2.0 | 73,23 | 63,34 |
| IndicBERT-v2 | 272M | No disponible | Índico (13 lenguas) | No disponible en la información | 65,93 | No evaluado |
| ModernBERT-large | 395M | No disponible en la información | Inglés | Apache-2.0 | No evaluado | 61,02 |
| UltraBERT-380M | 380M | No disponible en la información | Inglés | No disponible en la información | No evaluado | 66,79 |
| Ettin-Encoder-400M | 395M | No disponible en la información | Inglés | No disponible en la información | No evaluado | 63,16 |

NandiBERT-450M es el único de la comparativa que cubre simultáneamente índico e inglés con rendimiento competitivo en ambos. En índico supera a IndicBERT-v2 por 7,3 puntos de media. En inglés queda por debajo de UltraBERT-380M (66,79) y Ettin-Encoder-400M (63,16 frente a 63,34, prácticamente empatado) y por encima de ModernBERT-large (61,02), a costa de un tamaño ligeramente mayor.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chat, generación de texto libre, tool calling ni razonamiento multi-step sin fine-tuning específico y una cabeza adicional.
- La model card no documenta sesgos conocidos ni la composición exacta del corpus de entrenamiento, lo que dificulta evaluar riesgos de sesgo lingüístico o cultural.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas en fill-mask y en tareas downstream si el dominio de fine-tuning difiere del corpus de preentrenamiento.
- El rendimiento en lenguas no índicas del conjunto (árabe, indonesio, malayo) no se reporta en los benchmarks publicados; la cobertura declarada no equivale a calidad verificada.
- La ventana de 32K es teórica: no se documenta la degradación del rendimiento en longitudes cercanas al límite ni se publican resultados de LongEmbed desglosados por longitud.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni soporte.
- El informe técnico está pendiente de publicación, por lo que faltan detalles sobre datos de entrenamiento, tokens vistos y recetas de fine-tuning recomendadas.
- El checkpoint incluye la capa MLM no atada (103M parámetros); quien solo necesite el encoder debe descartarla al cargar el modelo para ahorrar memoria.

## Enlaces

- Hugging Face: https://huggingface.co/FrontiersMind/NandiBERT-450M
- Modelo hermano NandiBERT-150M: https://huggingface.co/FrontiersMind/NandiBERT-150M
- Organización en Hugging Face: https://huggingface.co/FrontiersMind
- GitHub: https://github.com/FrontiersMindAI/
- Blog de lanzamiento: https://www.frontiersmind.ai/blog/nandibert/
- Sitio web: https://www.frontiersmind.ai/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Informe técnico: anunciado como "coming soon", no disponible
