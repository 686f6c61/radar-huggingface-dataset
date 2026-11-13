# 360ZhiNao/Zhinao-ChineseModernBert

## Resumen

Zhinao-ChineseModernBert es un modelo de lenguaje de tipo encoder (bidireccional) especializado en chino, desarrollado por 360ZhiNao (Qihoo 360) y entrenado desde cero sobre la arquitectura ModernBERT. Está diseñado para escenarios industriales con requisitos estrictos de alta velocidad de inferencia y bajo consumo de memoria, y se distribuye como base para tareas de comprensión del lenguaje natural (NLU) en chino. Su objetivo es ofrecer una alternativa de tamaño Base (~110M de parámetros excluyendo embeddings) que supere en rendimiento a modelos de mayor tamaño como RoBERTa-wwm-large en la evaluación CLUE.

El modelo emplea el tokenizador de Qwen2, lo que reduce la tasa de palabras fuera de vocabulario (OOV) en textos chinos y en mezclas chino-inglés, y se ha preentrenado con 1T de tokens de corpus chino-inglés (más del 65 % en chino). Soporta una longitud máxima de secuencia de 1536 tokens, lo que lo hace adecuado para tareas de clasificación, reconocimiento de entidades, análisis de sentimiento, extracción de relaciones y comprensión de textos largos.

La relevancia actual del modelo radica en su eficiencia: la arquitectura ModernBERT está optimizada para alto throughput y manejo de textos largos, y el modelo se posiciona como una base ligera para pipelines de NLP en producción. El repositorio incluye además una variante de embeddings (Zhinao-ChineseModernBert-Embedding) orientada a recuperación semántica y RAG, que según la model card alcanza el estado del arte en la categoría Base de CMTEB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder bidireccional) |
| Parámetros totales | 344.743.169 (safetensors); ~110M excluyendo embeddings según la model card |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1536 tokens (preentrenamiento con secuencias de 8192 para el corte de datos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Chino (zh); corpus de entrenamiento con inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura transformer de tipo encoder con optimizaciones para inferencia de alto rendimiento y procesamiento de textos largos. Utiliza el tokenizador de Qwen2, con un vocabulario amplio que reduce el OOV en chino y en textos mixtos chino-inglés. El preentrenamiento se realizó desde cero, sin dependencia de pesos de terceros, mediante Masked Language Modeling (MLM) sobre 1T de tokens de corpus chino-inglés de alta calidad, con más del 65 % de contenido en chino y cobertura de dominios como noticias, enciclopedias, libros, diálogos, código, legal y literatura especializada. Se aplicó una estrategia de enmascaramiento WWM dinámico, precisión mixta y acumulación de gradientes, con corte de datos a 8192 tokens para adaptarse a la comprensión de textos largos.

La model card describe una segunda fase de preentrenamiento con el objetivo RetroMAE sobre corpus de longitud media y corta, con secuencias de hasta 1536 tokens, orientada a mejorar la representación semántica a nivel de frase. La variante de embeddings se entrena en dos etapas adicionales: preentrenamiento contrastivo sobre cientos de millones de pares de recuperación y traducción chino-inglés, y ajuste supervisado multitarea sobre los conjuntos de CMTEB y MTEB (recuperación, clustering, clasificación, STS y reranking). No se menciona el uso de RLHF ni DPO, lo cual es coherente con un modelo encoder de comprensión y no generativo.

## Capacidades

- Comprensión del lenguaje natural en chino: clasificación de textos, análisis de sentimiento, reconocimiento de entidades nombradas y extracción de relaciones.
- Relleno de máscaras (fill-mask), que es la tarea declarada en el pipeline del repositorio.
- Comprensión de textos largos gracias a su ventana de 1536 tokens.
- Manejo de textos mixtos chino-inglés y de terminología especializada, vocabulario de internet y términos técnicos, gracias al tokenizador de Qwen2.
- Base para ajuste fino en tareas NLU descendentes (el modelo base requiere fine-tuning para uso en producción).
- La variante Embedding añade generación de representaciones vectoriales para búsqueda semántica, similitud, clustering, clasificación y reranking.
- No se documentan capacidades de generación de texto, razonamiento generativo, código, matemáticas, visión, audio, tool calling ni agentes; se trata de un encoder de comprensión, no de un modelo generativo.

## Casos de uso

- Clasificación de textos en producción: el modelo base puede ajustarse para categorización de noticias, tickets de soporte o documentos legales, con bajo coste de inferencia gracias a su tamaño Base y a la eficiencia de ModernBERT.
- Reconocimiento de entidades nombradas en dominios especializados (finanzas, medicina, legal): su corpus de preentrenamiento cubre estos dominios y el tokenizador de Qwen2 mejora la segmentación de términos técnicos.
- Análisis de sentimiento y moderación de contenido en chino: adecuado para procesar grandes volúmenes de comentarios y reseñas con latencia reducida.
- Extracción de relaciones y construcción de grafos de conocimiento: la ventana de 1536 tokens permite procesar párrafos completos sin truncamiento agresivo.
- Recuperación semántica y RAG: mediante la variante Zhinao-ChineseModernBert-Embedding, que genera embeddings para indexación en bases de datos vectoriales y recuperación de documentos en sistemas de preguntas y respuestas.
- Búsqueda y similitud semántica en comercio electrónico: la variante Embedding permite emparejar consultas de usuarios con descripciones de productos, incluyendo consultas mixtas chino-inglés.
- Clustering y deduplicación de documentos: la variante Embedding facilita agrupar textos similares en corpus grandes con coste computacional bajo.
- Reranking en pipelines de búsqueda: la variante Embedding puede reordenar resultados candidatos de un retrieval inicial para mejorar la precisión final.

## Benchmarks y rendimiento

Resultados en CLUE (modelo base):

| Modelo | Parámetros | afqmc | tnews | iflytek | cmnli | wsc | csl | ocnli | c3 | Media |
|---|---|---|---|---|---|---|---|---|---|---|
| ChineseModernBERT (large) | ~310M | 73,87 | 56,90 | 60,15 | 83,96 | 52,10 | 86,20 | 79,10 | 82,65 | 71,87 |
| RoBERTa-wwm-large | ~310M | 76,55 | 58,61 | 62,98 | 82,12 | 74,60 | 82,13 | 78,20 | 73,82 | 73,63 |
| RoBERTa-wwm-ext (base) | ~90M | 74,04 | 56,94 | 60,31 | 80,51 | 67,80 | 81,00 | 74,72 | 66,50 | 70,23 |
| Zhinao-ChineseModernBERT (base) | ~110M | 76,99 | 57,51 | 59,56 | 83,82 | 78,95 | 85,70 | 79,08 | 75,42 | 74,63 |

Resultados en CMTEB (variante Embedding):

| Modelo | Parámetros | Dimensión | Classification | Clustering | Pair Classification | Reranking | Retrieval | STS | Media |
|---|---|---|---|---|---|---|---|---|---|
| bge-base-zh-v1.5 | ~90M | 1024 | 71,79 | 47,49 | 73,18 | 65,02 | 69,41 | 51,67 | 63,07 |
| piccolo-base-zh | ~90M | 768 | 70,05 | 47,12 | 70,17 | 66,68 | 71,20 | 54,39 | 63,27 |
| setlla-base-zh-v3-1792d | ~90M | 1792 | 74,40 | 53,29 | 82,50 | 67,84 | 72,28 | 61,92 | 68,71 |
| setlla-large-zh-v3.5-1792d | ~310M | 1792 | 74,66 | 54,31 | 82,92 | 68,45 | 73,52 | 51,93 | 69,30 |
| Qwen3-Embedding-0.6B | ~596M | 1024 | 71,40 | 68,74 | 76,42 | 62,58 | 71,03 | 54,52 | 67,45 |
| 360Zhinao-Embedding-Base | ~110M | 768 | 73,50 | 65,36 | 86,15 | 67,99 | 69,32 | 60,29 | 70,16 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no está orientado a generación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB para los 344,7M de parámetros del checkpoint; en fp16/bf16, en torno a 0,7 GB. Excluyendo embeddings, el modelo base ronda los 110M de parámetros (~0,44 GB en fp16).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia del modelo base; para fine-tuning se recomiendan GPU de 16 GB o superiores (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, incluso con margen para batches grandes.
- Opciones de despliegue: transformers (versión recomendada >= 4.56.2), sentence-transformers (>= 5.1.2) para la variante Embedding, y soporte de flash attention 2 recomendado por el autor. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la model card destaca mejoras significativas de velocidad e inferencia frente a BERT tradicional, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CLUE (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zhinao-ChineseModernBert | ~110M (344,7M con embeddings) | 1536 | 74,63 | Apache 2.0 | Hugging Face |
| RoBERTa-wwm-ext (base) | ~90M | 512 | 70,23 | Apache 2.0 | Hugging Face |
| RoBERTa-wwm-large | ~310M | 512 | 73,63 | Apache 2.0 | Hugging Face |
| ChineseModernBERT (large) | ~310M | No disponible | 71,87 | No disponible | Hugging Face |

En la comparativa de embeddings (CMTEB), la variante Zhinao-ChineseModernBert-Embedding (~110M, 768 dimensiones) obtiene una media de 70,16, frente a 67,45 de Qwen3-Embedding-0.6B (~596M), 69,30 de setlla-large-zh-v3.5-1792d (~310M) y 63,07 de bge-base-zh-v1.5 (~90M).

## Limitaciones y advertencias

- El modelo base no es generativo: no puede usarse para generación de texto, razonamiento generativo, código ni matemáticas sin un cabezal de tarea específico.
- Requiere ajuste fino para la mayoría de tareas descendentes; no está listo para uso directo en producción como clasificador o extractor.
- Idioma limitado al chino (con soporte de inglés en el corpus); no se documenta cobertura multilingüe amplia.
- Ventana de contexto de 1536 tokens, inferior a la de modelos generativos modernos con decenas de miles de tokens; los textos más largos deben truncarse o segmentarse.
- Riesgo de sesgos derivado del corpus de preentrenamiento (noticias, enciclopedias, código, legal, etc.), sin documentación específica sobre mitigación de sesgos.
- Riesgo de alucinación no aplica en el mismo sentido que en modelos generativos, pero sí existe riesgo de predicciones erróneas en tareas NLU sin validación humana.
- La licencia Apache 2.0 permite uso comercial, pero el autor no proporciona garantías ni documentación sobre evaluación en dominios regulados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria; la model card referencia la variante Embedding bajo el identificador qihoo360/360Zhinao-Embedding-Base, mientras que el repositorio de esta ficha es 360ZhiNao/Zhinao-ChineseModernBert, lo que puede generar confusión sobre la organización oficial.
- No se documentan resultados de benchmarks para el checkpoint exacto de este repositorio; los datos de CLUE y CMTEB provienen de la model card del autor y pueden corresponder a variantes o configuraciones no idénticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/360ZhiNao/Zhinao-ChineseModernBert
- Repositorio de la variante Embedding (referenciado en la model card): https://huggingface.co/qihoo360/Zhinao-ChineseModernBert-Embedding
- Repositorio de embeddings 360Zhinao (referenciado en el ejemplo de código): https://huggingface.co/qihoo360/360Zhinao-Embedding-Base
- Leaderboard CMTEB: https://huggingface.co/spaces/mteb/leaderboard
- Dataset CLUE: https://huggingface.co/datasets/clue/clue
- Búsqueda en ModelScope: https://modelscope.cn/search?search=ModernBERT
