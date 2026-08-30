# CMB-ClimateModernBERT/Merge_Norm_LRD

## Resumen

ClimateModernBERT es una familia de codificadores de dominio climático obtenidos mediante continued pretraining de ModernBERT-Base sobre un corpus especializado de 6.420 millones de tokens. El modelo `Merge_Norm_LRD` es un checkpoint concreto dentro de esta familia, resultado de fusionar tres modelos entrenados por separado sobre distintos corpus (académico, web climática y sintético) mediante el método de mezcla lineal con pesos inversos a la norma L2 del task-vector. Esta técnica busca equilibrar la contribución de cada corpus especializado, aunque el propio autor reconoce que no supera a la mezcla uniforme (Soup).

El modelo tiene 149,6 millones de parámetros, arquitectura transformer encoder de 22 capas con contexto de 8.192 tokens, y está diseñado para tareas de procesamiento de lenguaje natural climático: clasificación, etiquetado multi-etiqueta y recuperación de información sobre textos de ciencia, políticas y divulgación climática. Se distribuye en formato safetensors y es compatible con Transformers desde la versión 4.48, sin necesidad de `trust_remote_code`.

La relevancia de este modelo radica en que aborda un problema metodológico: cómo componer corpus heterogéneos para adaptación de dominio. Su evaluación interna reporta un F1 promedio de 74,6 en nueve benchmarks climáticos, superando al baseline de ModernBERT-Base (73,5) y a ClimateBERT (72,1), aunque queda por detrás del modelo hermano `Merge_Soup_LRD` (76,3). El paper asociado está bajo revisión y aún no tiene DOI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Base) |
| Parámetros totales | 149.655.232 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-Base, un codificador transformer de 22 capas, dimensión oculta 768, 12 cabezas de atención y vocabulario de 50.368 tokens. Sobre esta base se aplicó una adaptación continua en dos fases siguiendo la receta de ModernBERT: la Fase 1 extiende el contexto a 8.192 tokens con 3 épocas, tasa de aprendizaje constante de 3e-4, batch global de 576 y enmascaramiento del 30% (MLM); la Fase 2, denominada LRD specialization, añade 3 épocas adicionales con un programa de decaimiento `1 − √t` desde LR 3e-4 y factor final 1e-3. El entrenamiento se realizó en 4 GPUs NVIDIA A100 con MosaicML Composer y StableAdamW en BF16.

El checkpoint `Merge_Norm_LRD` se obtiene fusionando tres modelos entrenados por separado sobre los corpus 𝒜 (académico, ~1,28B tokens), ℱ (web climática, ~5B tokens) y 𝒮 (sintético, ~0,14B tokens). La mezcla es lineal, con pesos inversos a la norma L2 de los task-vectors: 𝒜 2.7, ℱ 1.0 y 𝒮 2.7. Esta configuración reduce la influencia del corpus web, que presenta el vector de tarea con mayor norma (≈43 por capa frente a ≈16 de los otros). El autor indica que este procedimiento no supera a la mezcla uniforme (Soup) en los benchmarks climáticos.

## Capacidades

- Modelo de lenguaje enmascarado (fill-mask) para representaciones contextuales de texto climático.
- Genera embeddings de secuencias de hasta 8.192 tokens, aptos para tareas de clasificación, etiquetado multi-etiqueta y recuperación.
- Soporta fine-tuning para clasificación de secuencias mediante `AutoModelForSequenceClassification`.
- Capacidad de recuperación semántica (retrieval) gracias a sus representaciones densas, evaluada en el benchmark ClimRetrieve.
- Multilingüe: no, solo inglés.
- No es un modelo generativo ni conversacional; no soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de visión ni audio.

## Casos de uso

- Análisis de informes corporativos de sostenibilidad: el modelo puede clasificar párrafos de informes ESG para detectar compromisos de reducción de emisiones (net zero, reducción de alcances 1 y 2), gracias a su entrenamiento en corpus de clima y finanzas. Se usaría como encoder para fine-tuning sobre datasets etiquetados de divulgaciones corporativas.

- Detección de contenido climático en noticias y artículos: permite filtrar grandes volúmenes de texto web para identificar si un artículo trata sobre cambio climático, con la ventaja de su contexto largo de 8.192 tokens para procesar artículos completos sin truncar.

- Recuperación de literatura científica: sus embeddings pueden indexar abstracts y párrafos de artículos revisados por pares (corpus 𝒜) para sistemas de búsqueda semántica, por ejemplo en portales de ciencia climática o repositorios institucionales.

- Clasificación de sentimiento climático: el modelo puede fine-tunearse para análisis de opinión en textos de redes sociales o prensa, distinguiendo entre sentimiento positivo, negativo o neutral respecto a políticas climáticas.

- Etiquetado multi-etiqueta de documentos de políticas: permite asignar categorías como "adaptación", "mitigación", "financiación" o "justicia climática" a párrafos de documentos gubernamentales o de organismos internacionales, facilitando la organización de corpus legales.

- Verificación de cumplimiento de recomendaciones TCFD: el modelo puede identificar si los informes financieros cumplen con las recomendaciones del Task Force on Climate-related Financial Disclosures, una tarea evaluada en el benchmark TCFD Recommendations.

- Análisis de impacto meteorológico extremo: con el benchmark WXImpactBench, el modelo puede clasificar textos que describen impactos de fenómenos meteorológicos, útil para sistemas de alerta temprana o análisis de riesgos.

## Benchmarks y rendimiento

El modelo reporta un F1 promedio de 74,6 en nueve benchmarks climáticos (Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve). Las puntuaciones son medias sobre tres semillas de fine-tuning con una configuración de hiperparámetros compartida. Se comparan con dos referencias del paper:

| Modelo | F1 promedio (9 benchmarks) |
|---|---|
| `Merge_Norm_LRD` (este modelo) | 74,6 |
| ModernBERT-Base (baseline estable) | 73,5 |
| ClimateBERT | 72,1 |
| `Merge_Soup_LRD` (modelo hermano) | 76,3 |

No se han publicado resultados de benchmarks adicionales en la información disponible. El modelo no supera a la mezcla uniforme (Soup), como se indica en el paper.

## Requisitos de hardware

- Inferencia: al ser un modelo de 150M de parámetros, requiere menos de 1 GB de VRAM en FP32, y menos de 500 MB en BF16 o cuantización int8. Es viable en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) y también en CPU con Transformers.
- Fine-tuning: con batch pequeño (por ejemplo, batch 8-16) cabe en GPUs de 8-12 GB VRAM. El paper recomienda batch efectivo de 64, lo que puede requerir acumulación de gradientes en GPUs más pequeñas.
- Opciones de despliegue: al ser un encoder no generativo, se puede servir con frameworks de inferencia estándar como Hugging Face Transformers, ONNX Runtime o TensorRT. No es compatible con vLLM ni TGI (orientados a decodificadores), aunque puede usarse en pipelines de clasificación con `pipeline("feature-extraction")` o `pipeline("fill-mask")`.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de este tamaño, la latencia de inferencia por secuencia de 512 tokens suele estar en el rango de 10-30 ms en una GPU moderna, pero esto depende del hardware y del batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 climático medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Merge_Norm_LRD` (este) | 149,6M | 8.192 | 74,6 | no disponible | Hugging Face |
| ModernBERT-Base | 149,6M | 8.192 | 73,5 | Apache 2.0 (según repo original) | Hugging Face |
| ClimateBERT (RoBERTa-base) | 125M | 512 | 72,1 | no disponible | Hugging Face |
| `Merge_Soup_LRD` | 149,6M | 8.192 | 76,3 | no disponible | Hugging Face |

El modelo comparte arquitectura y tamaño con ModernBERT-Base, pero se diferencia por la adaptación al dominio climático. ClimateBERT es un codificador más antiguo (RoBERTa) con contexto corto de 512 tokens. La mezcla uniforme (`Merge_Soup_LRD`) es superior en rendimiento dentro de la misma familia.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- Es un modelo de lenguaje enmascarado (MLM), no un sistema de instrucciones ni un generador de texto. No produce respuestas conversacionales ni tiene capacidades de razonamiento explícito.
- Los benchmarks climáticos actuales se centran en nivel de frase o pasaje, por lo que la capacidad de contexto largo de 8.192 tokens no se ha explotado plenamente en la evaluación reportada.
- La inclusión de datos sintéticos tiene efectos dependientes de la tarea: mejora tareas basadas en taxonomías y marcos, pero degrada tareas que requieren comprensión matizada del discurso y los compromisos.
- No hay garantías de exactitud factual sobre ciencia climática; el modelo puede alucinar o producir representaciones incorrectas si se usa como fuente de conocimiento.
- Licencia no disponible: no se especifican términos de uso comercial. Se recomienda contactar al autor antes de usar en producción.
- El paper está bajo revisión y no tiene DOI ni cita formal; los resultados deben considerarse preliminares.
- El método de mezcla normalizado no supera a la mezcla uniforme, por lo que para uso general se recomienda preferir `Merge_Soup_LRD`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMB-ClimateModernBERT/Merge_Norm_LRD
- Colección ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Colección CMB all (checkpoints de fases de entrenamiento): https://huggingface.co/collections/sraj/cmb-all
- Repositorio original del merge (sraj/Merge_Linear_NormBalanced): https://huggingface.co/sraj/Merge_Linear_NormBalanced
- Modelo hermano recomendado (Merge_Soup_LRD): https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Página del proyecto (paper en PDF): https://michaelyya.github (incompleto en la información proporcionada)
- Herramienta de fusión usada (mergekit): https://github.com/arcee-ai/mergekit
