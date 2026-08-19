# DT4H/CardioBERTa.es_P_only_snomed

## Resumen

CardioBERTa.es_P_only_snomed es un modelo de embeddings de terminología biomédica en español, desarrollado por el proyecto DataTools4Heart (DT4H) dentro del programa europeo Horizon Europe (Grant Agreement 101057849). Su propósito es la normalización de conceptos clínicos y el entity linking, especialmente en el dominio de la cardiología. Se inicializa desde CardioBERTa.es, un encoder de la familia CardioBERTa, que a su vez se basa en RoBERTa y se adapta al dominio cardiológico mediante entrenamiento continuado con MLM sobre corpus biomédicos en español.

El modelo se especializa mediante aprendizaje métrico supervisado por CUIs (Concept Unique Identifiers) de UMLS, usando tripletas enriquecidas con relaciones ontológicas de nivel "parent". Con 125,9 millones de parámetros, está diseñado para tareas de recuperación de candidatos y vinculación de entidades en pipelines de procesamiento de lenguaje natural clínico. Su relevancia actual radica en la necesidad de estandarizar informes cardiológicos multilingües en Europa, y este modelo cubre específicamente el español.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (máximo de entrenamiento: 25 tokens, aunque el tokenizador puede soportar más) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Español (es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa, un transformer encoder con atención bidireccional. El backbone CardioBERTa.es se obtuvo mediante entrenamiento continuado con Masked Language Modeling sobre corpus biomédicos y cardiológicos en español, dentro de la familia CardioBERTa que cubre siete idiomas europeos. La especialización para entity linking se realizó con aprendizaje métrico: se usaron tripletas (ancla, positivo, negativo) construidas a partir de pares de términos supervisados por CUIs de UMLS, enriquecidas con relaciones ontológicas de nivel "parent" (es decir, incluyendo términos de conceptos padre). El objetivo de entrenamiento fue Multi-Similarity Loss, con minería de todas las tripletas (margen 0,2), pooling sobre el token CLS, una época, batch size de 256, learning rate 2e-5 y longitud máxima de 25 tokens. Se usaron 1.174.222 tripletas que cubren 474.227 CUIs y 467.722 términos normalizados únicos. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS.

## Capacidades

- Generación de embeddings de terminología biomédica en español, normalizados con norma L2.
- Recuperación de candidatos para concept normalization: dado un término clínico, produce un vector que permite buscar el CUI más cercano en un espacio de embeddings.
- Entity linking y vinculación de entidades clínicas a conceptos UMLS, especialmente en el dominio de cardiología.
- Soporte para integración en pipelines de NLP clínico como etapa de candidate retrieval previa a un re-ranker.
- Funciona como modelo de feature extraction (pipeline_tag: feature-extraction) y es compatible con text-embeddings-inference.
- No soporta generación de texto ni razonamiento conversacional; es exclusivamente un encoder.

## Casos de uso

- Normalización de diagnósticos en informes de cardiología: el modelo puede convertir términos libres como "insuficiencia cardíaca congestiva" en vectores que se comparan contra un índice de conceptos UMLS para asignar el CUI correcto, facilitando la estandarización de historiales clínicos.
- Entity linking en textos de ensayos clínicos: permite enlazar menciones de fármacos, procedimientos y enfermedades a ontologías biomédicas, mejorando la interoperabilidad de datos de investigación.
- Recuperación de información clínica: al indexar documentos médicos con estos embeddings, se pueden buscar informes relevantes por similitud semántica de conceptos, sin depender de coincidencia exacta de términos.
- Soporte a sistemas de codificación automática (p. ej., SNOMED CT): al generar embeddings de términos, se puede mapear texto libre a códigos estandarizados, reduciendo la codificación manual en entornos hospitalarios.
- Construcción de grafos de conocimiento clínico: los embeddings permiten agrupar términos sinónimos y relacionar conceptos, facilitando la creación de ontologías específicas de cardiología.
- Preprocesamiento para pipelines de extracción de información: como etapa de candidate retrieval en sistemas de question answering o extracción de relaciones, donde se necesita identificar rápidamente conceptos relevantes antes de un análisis más fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como accuracy en entity linking, recall@k o comparaciones con otros modelos de normalización de conceptos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 125,9 millones de parámetros, en FP32 ocupa aproximadamente 0,5 GB (según el tamaño del repo). En inferencia con batch pequeño, cabe en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060, T4). Para producción con alto throughput, se recomienda A10, A100 o similares.
- Es viable en CPU para inferencia por lotes pequeños, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con Hugging Face Inference Endpoints, Text Embeddings Inference (TEI), o mediante frameworks como ONNX Runtime o TensorRT si se exporta. También es compatible con la librería `transformers` en Python.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un encoder de este tamaño suele procesar cientos de secuencias cortas por segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Uso principal |
|---|---|---|---|---|---|
| CardioBERTa.es_P_only_snomed | 125,9 M | no disponible | Metric learning sobre UMLS (es) | no disponible | Entity linking en cardiología (es) |
| SapBERT (base) | 110 M | 512 | MLM + metric learning sobre UMLS (en) | CC BY-NC-SA 4.0 | Entity linking biomédico (en) |
| BioBERT (base) | 110 M | 512 | MLM sobre PubMed (en) | CC BY-NC-SA 3.0 | NLP biomédico general (en) |
| BETO (base) | 110 M | 512 | MLM sobre corpus generales (es) | MIT | NLP general en español |

Nota: no se dispone de comparativas directas con modelos específicos de normalización de conceptos en español. SapBERT y BioBERT son referencias en inglés; BETO es un modelo general en español sin especialización clínica. La comparativa es orientativa.

## Limitaciones y advertencias

- No está diseñado para toma de decisiones clínicas directas; su uso es exclusivamente como componente de procesamiento de lenguaje.
- La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, lo que limita la reproducibilidad completa del entrenamiento.
- La licencia del modelo no está especificada, por lo que se debe contactar con los autores antes de uso comercial.
- El contexto de entrenamiento es de solo 25 tokens, lo que puede limitar su eficacia con términos o frases largas; aunque el tokenizador puede manejar secuencias mayores, el rendimiento fuera de ese rango no está garantizado.
- No se han publicado evaluaciones de sesgos ni de rendimiento en poblaciones diversas; como modelo entrenado en dominios clínicos, puede heredar sesgos de los corpus biomédicos.
- Riesgo de alucinación: al ser un encoder, no genera texto, pero puede producir embeddings que no correspondan correctamente a conceptos si el término de entrada es ambiguo o está fuera del dominio de entrenamiento.
- No soporta otros idiomas; está limitado al español.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.es_P_only_snomed
- Modelo base CardioBERTa.es: https://huggingface.co/DT4H/CardioBERTa.es
- Organización DataTools4Heart en Hugging Face: https://huggingface.co/datasets/DT4H/
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio GitHub del proyecto: https://github.com/DataTools4Heart/
- Información del proyecto en CORDIS: https://cordis.europa.eu/project/id/101057849
