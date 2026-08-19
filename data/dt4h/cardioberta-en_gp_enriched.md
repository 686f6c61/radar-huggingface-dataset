# DT4H/CardioBERTa.en_GP_enriched

## Resumen

`DT4H/CardioBERTa.en_GP_enriched` es un codificador de terminología biomédica en inglés, especializado en normalización de conceptos clínicos y entity linking. Desarrollado por el consorcio DataTools4Heart (DT4H) dentro del proyecto europeo homónimo, este modelo se inicializa desde `DT4H/CardioBERTa.en`, un modelo de la familia CardioBERTa, y se ajusta mediante tripletes supervisados por CUIs (Concept Unique Identifiers) de UMLS con estrategia de "grandparents" y metric learning. Con 124,6 millones de parámetros, está diseñado para producir embeddings de términos clínicos que permiten recuperar y normalizar conceptos en dominios de cardiología y NLP clínico. Su relevancia radica en abordar la heterogeneidad terminológica de los informes médicos europeos, facilitando la interoperabilidad semántica en entornos federados de datos de salud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 124.645.632 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, con un backbone de la familia CardioBERTa, que a su vez proviene de CardioLM, una suite multilingüe de pequeños modelos de lenguaje adaptados al dominio de la cardiología mediante preentrenamiento continuado con Masked Language Modeling (MLM) sobre corpus biomédicos y cardiológicos. Para esta variante, el ajuste fino se realizó con 4.952.020 tripletes (pares de términos positivos y negativos) que cubren 477.293 CUIs y 550.651 términos normalizados únicos. El entrenamiento empleó Multi-Similarity Loss con minería de todos los tripletes (margen 0.2), pooling sobre el token CLS, una época, batch size de 256, learning rate 2e-5 y longitud máxima de secuencia de 25 tokens. La estrategia "grandparents" enriquece los pares de sinónimos con relaciones ontológicas de nivel superior, aumentando la cobertura semántica. La terminología de entrenamiento no se distribuye con el repositorio por restricciones de licencia de UMLS.

## Capacidades

- Generación de embeddings de términos clínicos normalizados (pooling CLS, normalización L2).
- Entity linking y normalización de conceptos biomédicos, especialmente en cardiología.
- Recuperación de candidatos (candidate retrieval) para pipelines de NLP clínico.
- Soporte de búsqueda semántica por similitud coseno entre embeddings.
- Integración con librerías de Hugging Face (transformers) y text-embeddings-inference.
- Multilingüismo a nivel de familia: aunque este modelo es solo inglés, la familia CardioBERTa incluye variantes en checo, neerlandés, español, italiano, rumano y sueco.

## Casos de uso

- Normalización de terminología en informes de cardiología: el modelo convierte términos libres (p. ej., "MI", "infarto de miocardio") en representaciones vectoriales que pueden mapearse a CUIs de UMLS, estandarizando datos clínicos no estructurados.
- Entity linking en registros electrónicos de salud (EHR): integrado en pipelines de extracción de entidades, asigna cada mención a un concepto ontológico, facilitando la agregación de datos multicéntricos.
- Búsqueda semántica de conceptos en bases de datos biomédicas: permite consultar términos coloquiales o abreviados y recuperar conceptos normalizados relacionados, útil para herramientas de ayuda al diagnóstico.
- Soporte a sistemas de codificación automática (p. ej., ICD-10): el embedding de un término clínico puede usarse como característica para clasificadores que asignan códigos estándar.
- Desambiguación de sinónimos y acrónimos: al entrenarse con tripletes de sinónimos y relaciones jerárquicas, distingue entre usos contextuales de términos ambiguos.
- Interoperabilidad semántica en plataformas federadas de salud: los embeddings generados permiten alinear vocabularios de diferentes hospitales o regiones, como plantea el proyecto DT4H para el análisis federado de datos cardiovasculares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 124M parámetros, en FP32 ocupa ~500 MB, en FP16 ~250 MB. Con una secuencia de 25 tokens, el consumo es mínimo, por lo que puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060) es suficiente. También es viable en CPU para inferencia por lotes.
- Opciones de despliegue: compatible con Hugging Face Transformers, text-embeddings-inference (TEI) y endpoints gestionados. No se requiere vLLM ni llama.cpp al ser un encoder.
- Latencia y throughput: no se dispone de datos oficiales, pero por su tamaño reducido y longitud máxima de 25 tokens, la latencia por consulta es del orden de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Dominio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioBERTa.en_GP_enriched | 124M | Cardiología, UMLS | Entity linking, embeddings | No disponible | Hugging Face |
| BioBERT (base) | 110M | Biomédico general | MLM, NER, RE | MIT | Hugging Face |
| PubMedBERT (base) | 110M | Biomédico, abstracts | MLM, NER, RE | MIT | Hugging Face |
| SapBERT | 110M | UMLS, entity linking | Metric learning | MIT | Hugging Face |

La comparativa se basa en características generales; no hay benchmarks comunes publicados para este modelo. CardioBERTa.en_GP_enriched se distingue por su especialización en cardiología y su entrenamiento con relaciones de "grandparents", que amplía la cobertura semántica frente a modelos de entity linking estándar como SapBERT.

## Limitaciones y advertencias

- No está diseñado para decisiones clínicas directas; su uso previsto es exclusivamente como componente de NLP.
- Entrenado únicamente en inglés; no soporta otros idiomas en esta variante.
- La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, lo que limita la reproducibilidad completa del ajuste.
- Al ser un modelo encoder, no genera texto; su salida son vectores, por lo que no hay riesgo de alucinación textual, pero sí de errores en la asignación de conceptos si el término no está bien representado en el espacio de embeddings.
- Posibles sesgos derivados de los corpus de preentrenamiento y de la terminología UMLS, que pueden infrarepresentar ciertas poblaciones o variantes lingüísticas.
- La longitud máxima de secuencia es de 25 tokens (configuración de entrenamiento), lo que restringe su uso a términos o frases cortas, no a contextos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.en_GP_enriched
- Modelo base: https://huggingface.co/DT4H/CardioBERTa.en
- Organización DT4H en Hugging Face: https://huggingface.co/DT4H
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- GitHub del proyecto: https://github.com/DataTools4Heart/
- Ficha del proyecto en CORDIS: https://cordis.europa.eu/project/id/101057849
