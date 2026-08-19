# DT4H/CardioBERTa.cs_enriched

## Resumen

CardioBERTa.cs_enriched es un encoder de terminología biomédica en checo, especializado en normalización de conceptos clínicos y entity linking. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H) dentro del proyecto europeo del mismo nombre, que busca construir una plataforma federada y respetuosa con la privacidad para el análisis de datos de cardiología. El modelo se inicializa desde CardioBERTa.cs, un encoder RoBERTa adaptado al dominio cardiológico mediante preentrenamiento continuado con MLM sobre corpus biomédicos y cardiológicos en checo, y se ajusta con tripletas supervisadas por conceptos UMLS (CUI) usando metric learning.

Con 125,9 millones de parámetros y una arquitectura basada en transformer encoder, el modelo está diseñado para generar embeddings de términos clínicos que permiten recuperar conceptos candidatos, normalizar entidades y enlazar menciones a ontologías como UMLS. Su relevancia actual radica en la necesidad de sistemas de NLP clínico multilingüe que funcionen con lenguas de menor representación como el checo, y en su integración en pipelines de extracción de información clínica donde la normalización de conceptos es un paso crítico. El modelo está disponible en formato safetensors y es compatible con la librería Transformers y con Text Embeddings Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) |
| Parametros totales | 125.975.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de entrenamiento: 25 tokens) |
| Tipos de cuantizacion | no disponible (pesos en FP32 y I64, sin cuantizaciones publicadas) |
| Idiomas soportados | Checo (cs) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia CardioBERTa, una suite multilingüe de modelos pequeños para el dominio de la cardiología. El backbone es un encoder RoBERTa adaptado mediante preentrenamiento continuado con Masked Language Modeling (MLM) sobre corpus biomédicos y cardiológicos en checo. La especialización se realiza con un entrenamiento de tripletas supervisadas por conceptos UMLS (CUI): se construyen pares de sinónimos normalizados a partir de terminología clínica y se optimiza una función de pérdida Multi-Similarity Loss con minería de tripletas (todas las tripletas, margen 0,2). El pooling se realiza sobre el token CLS y la salida se normaliza L2.

El conjunto de entrenamiento incluye 68.973 tripletas que cubren 68.973 CUIs y 135.148 términos únicos normalizados. La terminología de entrenamiento no se distribuye con el repositorio debido a restricciones de licencia de UMLS; solo se publican estadísticas agregadas. El entrenamiento se realizó durante 1 época, con batch size de 256, learning rate de 2e-5 y longitud máxima de secuencia de 25 tokens.

## Capacidades

- Generación de embeddings de términos clínicos en checo, normalizados y listos para búsqueda de similitud coseno.
- Entity linking y normalización de conceptos clínicos: asigna menciones de texto a conceptos UMLS (CUIs) mediante recuperación de candidatos.
- Recuperación de conceptos biomédicos (candidate retrieval) en pipelines de NLP clínico.
- Soporte de integración con librerías estándar de embeddings (Transformers, sentence-transformers, Text Embeddings Inference).
- Funcionamiento específico para el dominio de cardiología y terminología clínica general.
- No incluye capacidades generativas, de tool calling ni de agentes; es exclusivamente un encoder para representación de texto.

## Casos de uso

- Normalización de entidades clínicas en historiales electrónicos checos: el modelo convierte menciones de enfermedades, medicamentos o procedimientos cardiológicos en identificadores UMLS estandarizados, facilitando la integración de datos entre sistemas hospitalarios.
- Construcción de índices semánticos para búsqueda de literatura biomédica en checo: permite indexar artículos o informes clínicos por conceptos normalizados y recuperar documentos relevantes mediante similitud de embeddings.
- Enriquecimiento de ontologías y terminologías: dado un término nuevo, el modelo sugiere conceptos UMLS cercanos, ayudando a mantener actualizados vocabularios clínicos.
- Pipelines de extracción de información clínica: combinado con un NER, el modelo normaliza las entidades extraídas, mejorando la precisión de tareas posteriores como codificación automática de diagnósticos (p. ej., CIE-10).
- Soporte a la interoperabilidad de datos de salud: al estandarizar conceptos de distintos centros checos, facilita el análisis federado y la reutilización de datos en proyectos de investigación cardiológica.
- Generación de embeddings para modelos de clasificación clínica: las representaciones del modelo pueden usarse como características de entrada en clasificadores de fenotipos o predicción de riesgos cardiovasculares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 125,9 millones de parámetros en FP32, el modelo ocupa aproximadamente 0,5 GB en memoria. Con cuantización a FP16 o int8, el uso de VRAM se reduce a unos 0,25 GB y 0,13 GB respectivamente (estimación orientativa).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en lotes pequeños. Tarjetas como NVIDIA T4, RTX 3060 o superiores funcionan sin problema.
- El modelo cabe en GPUs de consumo (RTX 2060, GTX 1660, etc.) e incluso en CPU con memoria RAM suficiente.
- Opciones de despliegue: compatible con Hugging Face Transformers, Text Embeddings Inference (TEI), sentence-transformers, y puede exportarse a ONNX para entornos de producción.
- Latencia y throughput estimados: al ser un modelo de tamaño pequeño, la latencia por embedding es del orden de milisegundos en GPU y decenas de milisegundos en CPU, pero no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. El modelo pertenece a la familia CardioBERTa, que incluye variantes para otros idiomas (inglés, holandés, italiano, rumano, español, sueco), pero no se han publicado resultados comparativos entre ellas. Tampoco hay comparación con otros encoders biomédicos como BioBERT o PubMedBERT, aunque estos no están adaptados al checo ni al dominio cardiológico específico.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en checo; no soporta otros idiomas y su uso fuera del contexto lingüístico checo producirá resultados incorrectos.
- La longitud máxima de secuencia de entrenamiento es de 25 tokens, lo que limita su uso a términos o frases cortas. No es adecuado para procesar documentos completos.
- La terminología de entrenamiento no se distribuye debido a restricciones de licencia UMLS, lo que puede dificultar la reproducibilidad completa.
- No está diseñado para toma de decisiones clínicas directas; es una herramienta de procesamiento de lenguaje natural y debe usarse como componente de sistemas supervisados por profesionales.
- No se han publicado evaluaciones de sesgos ni de rendimiento en poblaciones diversas; puede heredar sesgos presentes en los corpus de preentrenamiento.
- Riesgo de alucinación en la normalización: si el término de entrada no tiene un concepto UMLS cercano, el modelo puede devolver un embedding que se asocie a un concepto incorrecto.
- La licencia no está especificada, por lo que se recomienda contactar con los autores antes de un uso comercial o de redistribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.cs_enriched
- Modelo base CardioBERTa.cs: https://huggingface.co/DT4H/CardioBERTa.cs
- Organización DataTools4Heart en Hugging Face: https://huggingface.co/datasets/DT4H/
- Repositorio GitHub del proyecto DataTools4Heart: https://github.com/DataTools4Heart/
- Web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Documentación de DataTools4Heart: https://datatools4heart.github.io/documentation-hub/
