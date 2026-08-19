# DT4H/CardioBERTa.nl_GP_only_snomed

## Resumen

`DT4H/CardioBERTa.nl_GP_only_snomed` es un encoder de terminología biomédica en neerlandés, especializado en normalización de conceptos clínicos y entity linking. Desarrollado por el proyecto DataTools4Heart (DT4H), se inicializa desde el modelo base `UMCU/CardioBERTa.nl`, un RoBERTa adaptado al dominio de la cardiología mediante entrenamiento continuado con masked language modeling. El modelo se entrena con tripletas supervisadas por conceptos UMLS (CUI) y metric learning, usando la estrategia "grandparents" que explota relaciones ontológicas de nivel abuelo para enriquecer las tripletas.

Con 125,9 millones de parámetros y una arquitectura transformer encoder, este modelo está diseñado para generar embeddings de términos clínicos que permiten recuperar conceptos candidatos, normalizar entidades y enlazar términos a sistemas de codificación como SNOMED CT. Es relevante porque aborda la falta de recursos de NLP clínico para el neerlandés, un idioma con escasa cobertura en el ámbito biomédico, y forma parte de una suite multilingüe que cubre siete idiomas europeos. Su uso principal es en pipelines de procesamiento de informes de cardiología, donde la normalización de entidades es crítica para la interoperabilidad de datos clínicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) |
| Parametros totales | 125.978.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 25) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | neerlandés (nl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder con atención bidireccional. El backbone pertenece a la familia CardioBERTa, desarrollada por el proyecto CardioLM, que adapta modelos de lenguaje monolingües al dominio de la cardiología mediante entrenamiento continuado con MLM sobre corpus biomédicos y cardiológicos. En este caso, el modelo base `UMCU/CardioBERTa.nl` es la variante neerlandesa de dicha familia.

La especialización se realiza mediante metric learning con tripletas CUI-supervisadas. El conjunto de entrenamiento usa la estrategia "grandparents", que amplía las relaciones padre-hijo con relaciones de nivel abuelo en la ontología UMLS, generando 2.608.186 tripletas que cubren 290.766 conceptos únicos (CUIs) y 288.527 términos normalizados únicos. El objetivo de entrenamiento es Multi-Similarity Loss, con minería de todas las tripletas y margen 0.2. Se emplea pooling CLS para obtener el embedding de la secuencia, una época de entrenamiento, batch size de 256, learning rate de 2e-5 y longitud máxima de 25 tokens. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de términos clínicos normalizados, adecuados para búsqueda de similitud coseno y recuperación de conceptos candidatos.
- Entity linking: enlaza menciones de texto a conceptos UMLS (CUIs) y potencialmente a SNOMED CT mediante la proyección en el espacio de embeddings.
- Concept normalization: mapea variantes léxicas y sinónimos a un concepto canónico, útil para estandarizar terminología en informes clínicos.
- Candidate retrieval: dado un término de entrada, recupera los conceptos más cercanos en el espacio de embeddings, facilitando pipelines de entity linking.
- Multilingüe: no, está entrenado exclusivamente para neerlandés. No soporta tool calling, agentes, visión ni generación de texto libre.
- Compatible con la librería `transformers` y con `text-embeddings-inference` (TEI) para despliegue como servicio de embeddings.

## Casos de uso

- Normalización de diagnósticos en informes de cardiología: el modelo puede convertir menciones libres como "hartfalen" o "decompensatio cordis" en embeddings que se asignan al mismo CUI, permitiendo agrupar registros clínicos con terminología heterogénea.
- Entity linking en historias clínicas electrónicas: integrado en un pipeline de NLP, el modelo asigna cada entidad detectada a su concepto UMLS, facilitando la codificación automática a SNOMED CT u otros estándares.
- Búsqueda semántica de literatura médica en neerlandés: al indexar abstracts y artículos con los embeddings generados, se pueden recuperar documentos relevantes a partir de consultas en lenguaje natural.
- Deduplicación de registros de pacientes: al normalizar términos de diagnóstico y procedimientos, se pueden identificar registros duplicados que usan distintas expresiones para el mismo concepto.
- Construcción de ontologías o tesauros clínicos: el modelo ayuda a agrupar sinónimos y variantes ortográficas, asistiendo en la creación o mantenimiento de recursos terminológicos en neerlandés.
- Análisis de cohortes en investigación cardiovascular: al enlazar conceptos de forma consistente, los investigadores pueden agregar datos de múltiples centros con criterios unificados, como se plantea en la plataforma federada de DT4H.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o tareas específicas de entity linking (p. ej., accuracy en normalización de conceptos). No se dispone de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 125M parámetros, en fp32 ocupa aproximadamente 500 MB de memoria, por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA, incluyendo NVIDIA GTX 1060, RTX 2060, RTX 3090, etc. También puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- Despliegue: compatible con `transformers` (Python), `sentence-transformers` (para generar embeddings de frases), y `text-embeddings-inference` (TEI) para servir endpoints de alta concurrencia.
- Latencia y throughput: no se proporcionan datos oficiales. Como referencia, un encoder de este tamaño procesa cientos de secuencias cortas por segundo en una GPU moderna (p. ej., RTX 3090), con latencias de pocos milisegundos por secuencia.
- Almacenamiento: el repo ocupa 0.5 GB, lo que incluye los pesos en safetensors y los archivos de configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con alternativas. Sin embargo, se pueden mencionar modelos de referencia en el ámbito de embeddings clínicos:

| Modelo | Idioma | Arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| DT4H/CardioBERTa.nl_GP_only_snomed | neerlandés | RoBERTa | 125M | no disponible | no disponible |
| UMCU/CardioBERTa.nl (modelo base) | neerlandés | RoBERTa | 125M | no disponible | no disponible |
| BioBERT (inglés) | inglés | BERT | 110M | 512 | MIT |
| ClinicalBERT (inglés) | inglés | BERT | 110M | 512 | MIT |

La principal diferencia con BioBERT y ClinicalBERT es el idioma (neerlandés vs. inglés) y el enfoque de entrenamiento: este modelo está específicamente optimizado para entity linking mediante metric learning, mientras que los otros son modelos de lenguaje generalistas del dominio biomédico. No hay comparables públicos en neerlandés con la misma especialización.

## Limitaciones y advertencias

- Idioma: solo soporta neerlandés. No funciona con otros idiomas, por lo que no es adecuado para pipelines multilingües.
- Longitud de contexto: el entrenamiento se realizó con secuencias de máximo 25 tokens, por lo que su rendimiento puede degradarse con términos o frases más largas. No se especifica la longitud máxima de contexto del modelo base, pero se recomienda limitar las entradas a fragmentos cortos.
- Licencia: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. Además, la terminología de entrenamiento proviene de UMLS, que tiene restricciones de licencia; aunque no se distribuyen los datos, los usuarios deben verificar la compatibilidad de su uso con los términos de UMLS.
- Sesgos: al entrenarse con corpus biomédicos y cardiológicos, puede heredar sesgos presentes en esos textos (p. ej., sobrerrepresentación de ciertas poblaciones). No se han publicado evaluaciones de sesgo.
- Alucinación: al ser un encoder, no genera texto, por lo que no hay riesgo de alucinación en ese sentido. Sin embargo, los embeddings pueden producir falsos positivos en la recuperación de conceptos si los términos son ambiguos.
- Uso previsto: no está diseñado para toma de decisiones clínicas directas. Debe usarse como componente de un pipeline más amplio, con validación humana en entornos clínicos.
- Distribución de datos: los datos de entrenamiento no se publican, lo que limita la reproducibilidad y la auditoría del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.nl_GP_only_snomed
- Colección de la familia CardioBERTa: https://huggingface.co/collections/DT4H/cardioberta-family
- Proyecto DataTools4Heart (GitHub): https://github.com/DataTools4Heart/
- Web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Referencia del paper: Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain* (no se dispone de enlace directo al paper).
