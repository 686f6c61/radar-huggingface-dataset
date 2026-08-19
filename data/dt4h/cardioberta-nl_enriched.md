# DT4H/CardioBERTa.nl_enriched

## Resumen

`DT4H/CardioBERTa.nl_enriched` es un codificador de terminología biomédica en neerlandés desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto europeo financiado por el programa Horizon Europe (Grant Agreement 101057849) que construye una plataforma federada para el análisis de datos cardiológicos. El modelo se especializa en la normalización de conceptos clínicos y el entity linking, particularmente en el dominio de la cardiología. Se inicializa desde `UMCU/CardioBERTa.nl`, un modelo de la familia CardioBERTa, y se ajusta mediante triplets supervisados por CUIs (Concept Unique Identifiers) del sistema UMLS usando metric learning con Multi-Similarity Loss.

El modelo tiene 125.978.112 parámetros, lo que lo sitúa en la categoría de tamaño base de los modelos RoBERTa. Se entrena con 79.985 triplets que cubren 79.985 CUIs y 156.019 términos normalizados únicos, con una estrategia de minería de triplets basada en sinónimos. Su pipeline es `feature-extraction`, es decir, genera embeddings de texto que pueden usarse para recuperación de candidatos y comparación de similitud semántica. No se distribuye la terminología de entrenamiento porque contiene recursos sujetos a las condiciones de licencia de UMLS, lo que limita la reproducibilidad del entrenamiento.

La relevancia de este modelo radica en que forma parte de una suite multilingüe de modelos para cardiología que cubre checo, neerlandés, inglés, italiano, rumano, español y sueco, con el objetivo de estandarizar la estructuración de informes cardiológicos en Europa. Su utilidad principal es servir como componente en pipelines de NLP clínica para la normalización de conceptos y el enlace a bases de conocimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) |
| Parámetros totales | 125.978.112 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (por configuración RoBERTa base) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | neerlandés (nl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa de la familia CardioBERTa, un conjunto de modelos de lenguaje de tamaño pequeño (base) adaptados al dominio cardiológico mediante entrenamiento continuado con masked language modeling (MLM) sobre corpus biomédicos y cardiológicos monolingües. La familia CardioBERTa cubre siete idiomas europeos. El backbone concreto es `UMCU/CardioBERTa.nl`, un modelo neerlandés de esta familia.

El ajuste fino se realiza con un objetivo de metric learning: se utilizan triplets generados a partir de pares de sinónimos supervisados por CUI (Concept Unique Identifier) de UMLS. El entrenamiento usa Multi-Similarity Loss, con pooling sobre el token CLS, una época, batch size de 256, learning rate de 2e-5 y longitud máxima de 25 tokens. La estrategia de minería de triplets es `synonyms`, con un margen de 0.2. Se generan 79.985 triplets que cubren 79.985 CUIs y 156.019 términos únicos normalizados, con una media de 1.98 términos por CUI.

El modelo no distribuye la terminología de entrenamiento por restricciones de licencia de UMLS. Solo se publican estadísticas agregadas. La estrategia de entrenamiento con triplets de sinónimos y metric learning es una innovación clave para la normalización de conceptos en el dominio clínico, ya que permite aprender una representación donde términos sinónimos del mismo CUI quedan cerca en el espacio de embeddings.

## Capacidades

- Generación de embeddings de términos clínicos normalizados para comparación de similitud semántica.
- Normalización de conceptos clínicos: mapeo de términos de texto libre a conceptos UMLS (CUI).
- Entity linking en el dominio cardiológico y biomédico neerlandés.
- Recuperación de candidatos (candidate retrieval) en pipelines de entity linking.
- Soporte de entrada de texto con truncamiento a un máximo de 25 tokens en el entrenamiento, aunque la arquitectura base permite más.
- Integración con el ecosistema Hugging Face Transformers y compatible con Text Embeddings Inference (TEI) para despliegue en endpoints.
- No soporta tool calling ni agentes, ya que es un modelo encoder puro de embeddings.

## Casos de uso

- Normalización de informes cardiológicos: el modelo puede convertir términos clínicos no estructurados en los informes de cardiología neerlandeses a conceptos UMLS normalizados, lo que facilita el análisis agregado y la reutilización de datos clínicos.
- Entity linking en registros médicos electrónicos: integrado en un pipeline de NLP clínica, permite asociar menciones de entidades (enfermedades, medicamentos, procedimientos) a sus CUIs correspondientes, habilitando consultas semánticas sobre datos de pacientes.
- Recuperación de información biomédica: se puede usar para buscar documentos o pasajes clínicos relevantes mediante similitud de embeddings, comparando términos de consulta con términos de un corpus de documentos cardiológicos.
- Soporte a la interoperabilidad de datos clínicos: al normalizar términos a una ontología estándar (UMLS), facilita el intercambio de datos entre instituciones sanitarias europeas que usan vocabularios distintos.
- Enriquecimiento de ontologías: puede usarse para sugerir nuevos términos candidatos para una ontología cardiológica a partir de textos clínicos, calculando la similitud con términos ya existentes.
- Búsqueda semántica en literatura científica: permite buscar artículos o ensayos clínicos en neerlandés sobre cardiología usando consultas en lenguaje natural y recuperando documentos por similitud de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y tampoco se reportan métricas de entity linking sobre conjuntos de datos estándar como MedMentions o NCBI Disease. No se puede evaluar el rendimiento cuantitativo del modelo frente a alternativas sin datos adicionales.

## Requisitos de hardware

- El modelo tiene 125.978.112 parámetros, lo que en precisión FP32 ocupa aproximadamente 504 MB de VRAM; en FP16 o BF16, unos 252 MB.
- Es viable en GPUs de consumo: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar la inferencia con comodidad.
- Para despliegue en producción, se puede servir con Hugging Face Inference Endpoints, Text Embeddings Inference (TEI) o vLLM, aunque al ser un modelo de embeddings puro, TEI es la opción más natural.
- La latencia por consulta será muy baja (del orden de milisegundos) en una GPU moderna, dado el tamaño del modelo y la longitud máxima de secuencia de 256 tokens.
- También puede ejecutarse en CPU con una latencia aceptable para aplicaciones no en tiempo real, ya que el modelo es pequeño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DT4H/CardioBERTa.nl_enriched | 125,98M | 512 | neerlandés | no disponible | Hugging Face |
| UMCU/CardioBERTa.nl | ~125M | 512 | neerlandés | no disponible | Hugging Face |
| DT4H/cardio-ner-nl-cardioberta-multilabel | ~125M | 512 | neerlandés | GPL-3.0 | Hugging Face |
| BioBERT (base) | 110M | 512 | inglés | Apache 2.0 | Hugging Face |

El modelo se compara directamente con su base, `UMCU/CardioBERTa.nl`, del que hereda la arquitectura pero añade la especialización en metric learning para normalización de conceptos. El modelo `cardio-ner-nl-cardioberta-multilabel` de la misma organización se especializa en reconocimiento de entidades (NER) multietiqueta, mientras que este modelo se centra en entity linking y normalización. BioBERT es un modelo en inglés de propósito general biomédico, no específico de cardiología ni de neerlandés. La comparación con alternativas en neerlandés es limitada porque hay pocos modelos de dominio cardiológico en este idioma.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con terminología de sinónimos de UMLS, por lo que su capacidad de generalización a términos fuera de esa terminología puede ser limitada.
- La licencia exacta no está disponible en la model card; aunque el repositorio no indica restricciones, la terminología de entrenamiento no se distribuye por licencias UMLS.
- No está diseñado para la toma de decisiones clínicas directas; el autor indica que no es apto para ese propósito.
- La longitud máxima de secuencia en el entrenamiento fue de 256 caracteres, lo que puede no ser suficiente para textos clínicos largos si se usa en inferencia sin truncamiento.
- El modelo solo cubre neerlandés; no tiene capacidades multilingües.
- El uso en producción requiere verificar que la licencia de la terminología UMLS subyacente cumple con los requisitos del despliegue comercial.
- No se publican benchmarks ni métricas de evaluación, por lo que no hay evidencia cuantitativa de su rendimiento en tareas de entity linking.

## Enlaces

- Hugging Face: https://huggingface.co/DT4H/CardioBERTa.nl_enriched
- Organización DT4H en Hugging Face: https://huggingface.co/datasets/DT4H/
- GitHub del proyecto: https://github.com/DataTools4Heart/
- Sitio web del proyecto: https://www.datatools4heart.eu/
- Documentación: https://datatools4heart.github.io/documentation-hub/
- Modelo base: https://huggingface.co/UMCU/CardioBERTa.nl
