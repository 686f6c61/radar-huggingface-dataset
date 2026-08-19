# DT4H/CardioBERTa.en_P_translations_only

## Resumen

CardioBERTa.en_P_translations_only es un codificador de terminología biomédica en inglés, especializado en normalización de conceptos clínicos y entity linking, desarrollado por el proyecto DataTools4Heart (DT4H). Se inicializa desde el modelo base CardioBERTa.en, perteneciente a la familia CardioBERTa, una suite de modelos de lenguaje pequeños adaptados al dominio de la cardiología mediante entrenamiento continuado con MLM sobre corpus biomédicos y cardiológicos monolingües. Este modelo concreto se entrena con tripletas supervisadas por conceptos UMLS (CUI) y estrategia de relaciones padre-hijo, usando metric learning con Multi-Similarity Loss.

El modelo está pensado para integrarse en pipelines de procesamiento de lenguaje natural clínico, especialmente en tareas de recuperación de candidatos biomédicos, normalización de conceptos y entity linking en textos cardiológicos. Su arquitectura es RoBERTa con 124,6 millones de parámetros, lo que lo hace ligero y desplegable en entornos con recursos limitados. La licencia no está disponible en la información publicada, y el modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 124.645.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 25 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en FP32, safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura RoBERTa, un transformer encoder con atención bidireccional. Se inicializa desde CardioBERTa.en, que fue adaptado al dominio cardiológico mediante MLM sobre corpus biomédicos y cardiológicos en inglés. El entrenamiento de este modelo específico emplea tripletas de términos clínicos supervisadas por conceptos UMLS (CUI), enriquecidas con relaciones ontológicas de tipo "padre" (parent-level). Se usan 1.699.553 tripletas que cubren 477.290 CUIs y 550.651 términos únicos normalizados.

La función de pérdida es Multi-Similarity Loss con minería de todas las tripletas y margen 0,2. El pooling se realiza sobre el token CLS, con una longitud máxima de 25 tokens, batch size de 256 y learning rate de 2e-5 durante una época. La terminología de entrenamiento no se distribuye con el repositorio por restricciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de términos clínicos normalizados (vectores densos de 768 dimensiones, típico de RoBERTa-base).
- Entity linking y normalización de conceptos: asigna términos clínicos a conceptos UMLS (CUIs) mediante similitud coseno en el espacio de embeddings.
- Recuperación de candidatos biomédicos: dado un término o frase clínica, recupera los conceptos más cercanos de una ontología.
- Soporte de búsqueda semántica en terminología cardiológica y biomédica general.
- Capacidades multilingües: no, el modelo solo procesa inglés.
- No soporta tool calling, agentes ni generación de texto; es exclusivamente un codificador de características (feature extraction).

## Casos de uso

- Normalización de conceptos en informes de cardiología: dado un término libre como "myocardial infarction", el modelo produce un embedding que permite mapearlo al CUI correcto (p. ej., C0027051) consultando una base de conceptos UMLS precomputada.
- Entity linking en registros electrónicos de salud (EHR): extraer menciones de enfermedades, fármacos o procedimientos cardiológicos y vincularlas a ontologías estandarizadas para interoperabilidad.
- Recuperación de información clínica: indexar documentos médicos con embeddings de términos y permitir búsquedas semánticas por concepto, no solo por coincidencia de texto.
- Deduplicación de terminología: agrupar variantes léxicas de un mismo concepto (sinónimos, abreviaturas, errores ortográficos) en un espacio vectorial unificado.
- Enriquecimiento de pipelines de NLP clínico: combinar con modelos de reconocimiento de entidades (NER) para normalizar las entidades detectadas a CUIs estándar.
- Investigación en fenotipado: convertir términos clínicos de múltiples fuentes a una representación común para análisis federados multicéntricos, como los planteados en el proyecto DT4H.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o similares, ya que se trata de un modelo de embeddings y no de generación. No hay datos comparativos con otros modelos de normalización de conceptos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124M parámetros × 4 bytes). Con cuantización FP16 o int8, puede reducirse a ~0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA T4, GTX 1650, RTX 3060). También funciona en CPU para lotes pequeños.
- Cabe en GPUs de consumo: sí, cualquier GPU moderna con 2 GB o más.
- Opciones de despliegue: transformers (PyTorch), Hugging Face Inference Endpoints, ONNX Runtime, o librerías de embeddings como sentence-transformers (adaptando el pooling).
- Latencia y throughput estimados: al ser un encoder pequeño, la inferencia es rápida; en GPU T4 se pueden procesar cientos de términos por segundo. En CPU, decenas por segundo. No hay cifras oficiales publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| CardioBERTa.en_P_translations_only | 124M | 25 tokens | Metric learning sobre UMLS | no disponible |
| SapBERT | 110M (PubMedBERT) | 512 tokens | Metric learning sobre UMLS | CC BY-NC-SA 4.0 |
| BioBERT | 110M | 512 tokens | MLM sobre PubMed | MIT |
| PubMedBERT | 110M | 512 tokens | MLM sobre PubMed | MIT |

No se dispone de comparativa directa de rendimiento porque no hay benchmarks publicados para este modelo. SapBERT es el más similar en enfoque (metric learning sobre UMLS), pero con contexto mayor y licencia conocida. CardioBERTa está especializado en cardiología, lo que puede dar ventaja en ese dominio, pero no hay datos que lo confirmen.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el modelo puede usarse comercialmente; se recomienda contactar con los autores antes de usarlo en producción.
- Longitud de contexto limitada a 25 tokens: solo acepta términos o frases muy cortas; no es adecuado para párrafos completos.
- Solo inglés: no soporta otros idiomas, a pesar de que la familia CardioBERTa es multilingüe.
- La terminología de entrenamiento no se distribuye por restricciones de UMLS, lo que limita la reproducibilidad.
- No está diseñado para toma de decisiones clínicas directas; es solo un componente de NLP.
- Posibles sesgos derivados de los corpus de entrenamiento (textos biomédicos en inglés, posible infrarrepresentación de ciertas poblaciones o variantes lingüísticas).
- Riesgo de alucinación: al ser un encoder, no genera texto, pero puede producir embeddings que mapeen términos ambiguos a conceptos incorrectos si el término no está bien representado en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.en_P_translations_only
- Modelo base CardioBERTa.en: https://huggingface.co/DT4H/CardioBERTa.en
- Organización DT4H en Hugging Face: https://huggingface.co/DT4H/
- Proyecto DataTools4Heart (GitHub): https://github.com/DataTools4Heart/
- Web del proyecto: https://www.datatools4heart.eu/
- Proyecto en CORDIS: https://cordis.europa.eu/project/id/101057849
