# DT4H/CardioBERTa.cs_translations_only

## Resumen

`DT4H/CardioBERTa.cs_translations_only` es un codificador de terminología biomédica en checo desarrollado por el proyecto europeo DataTools4Heart (DT4H), especializado en normalización de conceptos clínicos y entity linking. El modelo se inicializa desde `DT4H/CardioBERTa.cs`, un modelo de la familia CardioBERTa adaptado al dominio de la cardiología mediante preentrenamiento continuado con MLM sobre corpus biomédicos y cardiológicos monolingües en checo. La especialización final se realiza mediante aprendizaje métrico supervisado por CUIs (Concept Unique Identifiers de UMLS), utilizando pares de sinónimos terminológicos.

Con 125,9 millones de parámetros y arquitectura RoBERTa, este modelo está diseñado específicamente para generar embeddings de términos clínicos que permiten recuperar candidatos y normalizar conceptos en pipelines de procesamiento de lenguaje natural clínico. Su relevancia actual radica en la necesidad de estandarizar informes de cardiología en distintos idiomas europeos, un objetivo central del proyecto DT4H, que busca crear una caja de herramientas federada y respetuosa con la privacidad para la reutilización de datos de salud cardiovascular. El modelo se entrenó con 68.923 tripletes que cubren 68.923 CUIs y 135.129 términos normalizados únicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.975.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max. longitud de entrenamiento: 25 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | checo (cs) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa estándar, un encoder transformer con enmascaramiento de lenguaje. Pertenece a la familia CardioBERTa, desarrollada dentro del proyecto CardioLM, que comprende modelos específicos por idioma (checo, neerlandés, inglés, italiano, rumano, español y sueco) adaptados al dominio de la cardiología mediante preentrenamiento continuado con Masked Language Modeling sobre corpus biomédicos y cardiológicos monolingües.

La especialización final se realizó mediante aprendizaje métrico con estrategia de sinónimos supervisados por CUI. Se utilizó Multi-Similarity Loss con minería de todos los tripletes y margen 0,2, pooling sobre el token CLS, una época de entrenamiento, batch size de 256, learning rate de 2e-5 y longitud máxima de 25 tokens. El conjunto de tripletes incluye 68.923 muestras que cubren 68.923 CUIs y 135.129 términos normalizados únicos, con una media de 2,00 términos por CUI. La terminología de entrenamiento no se distribuye con el repositorio por condiciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de terminología biomédica en checo, específicamente en el dominio de la cardiología.
- Normalización de conceptos clínicos mediante representaciones vectoriales normalizadas con norma L2.
- Entity linking y recuperación de candidatos biomédicos a partir de términos clínicos.
- Asociación de términos a CUIs de UMLS mediante similitud de coseno en el espacio de embeddings.
- Integración en pipelines de NLP clínico para estandarización de informes médicos.
- Soporte de búsqueda por similitud semántica entre términos clínicos checos.
- Capacidad multilingüe indirecta: al pertenecer a la familia CardioBERTa, puede combinarse con modelos de otros idiomas para proyección en un espacio semántico compartido (no verificado en este modelo concreto).

## Casos de uso

- Normalización de conceptos en informes de cardiología en checo: el modelo puede mapear términos clínicos libres a CUIs estandarizados de UMLS, facilitando la interoperabilidad de datos entre centros hospitalarios checos y europeos.
- Recuperación de candidatos para entity linking: en un pipeline de reconocimiento de entidades nombradas (NER), el modelo genera embeddings de los términos extraídos y los compara contra una base de conceptos UMLS para asignar el identificador correcto.
- Construcción de índices semánticos de literatura cardiológica: permite indexar artículos científicos y ensayos clínicos en checo por conceptos normalizados, facilitando búsquedas basadas en significado y no solo en coincidencia de texto.
- Armonización de datos clínicos para investigación federada: dentro de la plataforma DT4H, el modelo permite estandarizar terminología cardiológica de diferentes hospitales checos antes de que los datos se compartan en análisis federados, preservando la privacidad.
- Detección de sinónimos y variantes terminológicas: el modelo puede identificar que dos términos distintos en checo se refieren al mismo concepto clínico, útil para deduplicar registros de pacientes o consolidar bases de datos.
- Análisis retrospectivo de historiales clínicos: permite agrupar pacientes por condiciones cardiológicas normalizadas a partir de texto libre en checo, habilitando estudios epidemiológicos sin intervención manual.
- Soporte a traducción y transferencia entre idiomas: combinado con los modelos CardioBERTa de otros idiomas, puede servir para alinear conceptos cardiológicos entre checo y otras lenguas europeas en entornos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones cuantitativas como precisión en entity linking, recall@k o comparaciones con otros modelos de normalización de conceptos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 125,9 millones de parámetros, el uso en FP32 requiere aproximadamente 0,5 GB de VRAM; en FP16 se reduce a unos 0,25 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- Compatibilidad con GPU consumer: sí, es plenamente compatible con GPUs de consumo.
- Opciones de despliegue: compatible con Hugging Face Transformers, Text Embeddings Inference (TEI), y cualquier framework que soporte modelos RoBERTa estándar. Al ser un modelo de embeddings, puede integrarse en sistemas de búsqueda vectorial como FAISS o Qdrant.
- Latencia y throughput: no disponible en la información proporcionada, pero por el tamaño del modelo y la longitud máxima de 25 tokens, la latencia por consulta debería ser de pocos milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Dominio | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| DT4H/CardioBERTa.cs_translations_only | 125,9 M | checo | Cardiología | Metric learning con CUIs | no disponible |
| DT4H/CardioBERTa.cs | 125,9 M | checo | Cardiología | MLM continuado | no disponible |
| DT4H/CardioBERTa.en | 125,9 M | inglés | Cardiología | MLM continuado | no disponible |
| BioBERT (base) | 110 M | inglés | Biomédico general | MLM sobre PubMed | Apache 2.0 |

No se dispone de datos comparativos de rendimiento entre estos modelos en tareas de normalización de conceptos. La comparativa se limita a características arquitectónicas y de entrenamiento.

## Limitaciones y advertencias

- La terminología de entrenamiento no se distribuye con el modelo por restricciones de licencia de UMLS, lo que limita la reproducibilidad completa del entrenamiento.
- El modelo no está destinado a la toma de decisiones clínicas directas; su uso previsto es exclusivamente para pipelines de NLP e investigación.
- La longitud máxima de entrenamiento es de 25 tokens, por lo que el modelo puede tener un rendimiento subóptimo con términos o frases clínicas más largas.
- Solo soporta checo; no es aplicable directamente a otros idiomas sin adaptación.
- No se han publicado evaluaciones de sesgos ni pruebas de robustez ante variaciones dialectales o registros clínicos informales.
- La licencia no está especificada, lo que genera incertidumbre sobre las condiciones de uso comercial y redistribución.
- El modelo se entrenó con una sola época y una estrategia de sinónimos únicamente; las estrategias alternativas (parents, grandparents) descritas en la documentación podrían ofrecer mayor cobertura terminológica pero no se incluyen en esta versión.
- Riesgo de alucinación en la asociación de términos a CUIs: como cualquier modelo de embeddings, puede generar representaciones cercanas para conceptos que no son semánticamente equivalentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.cs_translations_only
- Modelo base CardioBERTa.cs: https://huggingface.co/DT4H/CardioBERTa.cs
- Organización DT4H en Hugging Face: https://huggingface.co/DT4H/
- Repositorio GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Noticia sobre la segunda fase del proyecto: https://www.datatools4heart.eu/2025/03/25/eu-project-combining-european-cardiology-data-in-different-formats-and-languages-to-create-easy-to-use-cardiology-toolbox-moves-into-second-phase/
