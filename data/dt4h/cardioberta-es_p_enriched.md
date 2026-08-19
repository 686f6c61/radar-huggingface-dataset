# DT4H/CardioBERTa.es_P_enriched

## Resumen

`DT4H/CardioBERTa.es_P_enriched` es un codificador de terminología biomédica en español, especializado en cardiología, desarrollado por el proyecto europeo DataTools4Heart (DT4H). Su función principal es la normalización de conceptos clínicos y el entity linking: dado un término o mención textual, produce un embedding normalizado que permite recuperar el concepto UMLS (CUI) correspondiente mediante búsqueda de similitud. Se inicializa desde `DT4H/CardioBERTa.es`, un modelo de la familia CardioBERTa (basado en RoBERTa) adaptado al dominio cardiológico mediante pre-entrenamiento continuado con masked language modeling, y se afina con tripletas de terminología supervisadas por CUI y metric learning.

El modelo tiene 125,98 millones de parámetros, lo que lo sitúa en la gama de los encoders pequeños tipo RoBERTa-base. Está entrenado con 1,7 millones de tripletas que cubren 476.638 conceptos UMLS y 545.019 términos normalizados, utilizando la estrategia "parents" que enriquece las relaciones de sinonimia con relaciones ontológicas de nivel padre. Su relevancia actual radica en la necesidad de estandarizar la terminología clínica en español para interoperabilidad de datos de salud, especialmente en el ámbito cardiovascular, donde los informes clínicos suelen contener variaciones terminológicas que dificultan el análisis automatizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con max_length 25) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Español (es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa-base, un transformer encoder con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. El backbone `CardioBERTa.es` fue pre-entrenado de forma continuada sobre corpus biomédicos y cardiológicos monolingües en español mediante masked language modeling, dentro de la suite multilingüe CardioLM. Sobre este backbone, el modelo se afina con un objetivo de metric learning: se construyen tripletas (ancla, positivo, negativo) a partir de términos clínicos asociados al mismo concepto UMLS (CUI), enriquecidas con relaciones de tipo "padre" en la ontología. El entrenamiento utiliza Multi-Similarity Loss, mining de todas las tripletas con margen 0,2, pooling sobre el token CLS, una época, batch size 256, learning rate 2e-5 y longitud máxima de secuencia 25. La terminología de entrenamiento no se distribuye con el repositorio por estar sujeta a las condiciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings normalizados (L2) para términos y frases clínicas en español, orientados a similitud semántica.
- Normalización de conceptos clínicos: mapeo de menciones textuales a conceptos UMLS (CUIs) mediante recuperación de candidatos.
- Entity linking en dominios biomédicos y cardiológicos, con soporte para pipelines de procesamiento de lenguaje natural clínico.
- Búsqueda semántica de terminología: dado un término, recupera términos equivalentes o relacionados en la ontología.
- No es un modelo generativo: no produce texto libre, solo representaciones vectoriales (feature extraction).
- No soporta tool calling, agentes ni razonamiento multi-paso; su uso es exclusivamente como encoder de embeddings.

## Casos de uso

- Normalización de informes de cardiología: el modelo puede convertir menciones como "insuficiencia cardíaca" o "fallo cardiaco" en el mismo embedding, permitiendo agrupar variantes terminológicas en un único concepto CUI para su posterior análisis.
- Entity linking en historiales clínicos electrónicos: integrado en un pipeline de NLP, asigna identificadores UMLS a los términos extraídos de notas clínicas, facilitando la estandarización de datos para investigación.
- Recuperación de información clínica: permite buscar en grandes colecciones de documentos médicos en español por concepto, no por palabra exacta, mejorando la precisión en consultas como "pacientes con fibrilación auricular".
- Codificación automática de diagnósticos y procedimientos: los embeddings pueden alimentar sistemas de asignación de códigos CIE-10 o SNOMED CT a partir de texto libre en español.
- Deduplicación de registros de pacientes: al normalizar conceptos, ayuda a identificar registros duplicados que usan terminología distinta para la misma condición.
- Enriquecimiento de ontologías biomédicas: el modelo puede sugerir sinónimos en español para conceptos existentes en UMLS, comparando embeddings de términos candidatos con los ya conocidos.
- Análisis de literatura científica en cardiología: extracción de conceptos clave de artículos y su agrupación por CUI para revisiones sistemáticas o meta-análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Al tratarse de un encoder de embeddings, las métricas relevantes serían de recuperación (precision@k, MRR) sobre tareas de entity linking, pero no se proporcionan en la documentación.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 125,98 millones de parámetros. En FP32 ocupa aproximadamente 504 MB; en FP16, unos 252 MB. Cabe holgadamente en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- Compatible con despliegue en text-embeddings-inference (mencionado en los tags) y con endpoints compatibles de Hugging Face.
- Opciones de despliegue: transformers (Python), text-embeddings-inference, ONNX Runtime, o mediante contenedores Docker.
- Latencia y throughput: al ser un modelo pequeño, la latencia por lote es baja (del orden de milisegundos en GPU), aunque no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (encoders de terminología biomédica en español con metric learning). La familia CardioBERTa incluye variantes para otros idiomas, pero no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo no está diseñado para decisiones clínicas directas; su uso previsto es como componente de investigación y procesamiento de datos.
- Solo cubre español; no soporta otros idiomas, aunque la familia CardioBERTa tiene versiones para otros idiomas europeos.
- La terminología de entrenamiento está sujeta a licencias UMLS y no se distribuye, lo que puede limitar la reproducibilidad completa del entrenamiento.
- La longitud máxima de secuencia en entrenamiento fue de 25 tokens, lo que puede limitar su eficacia con frases largas o contextos extensos.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas downstream es incierto.
- Al ser un modelo entrenado con datos biomédicos, puede heredar sesgos presentes en los corpus de origen, como infrarrepresentación de ciertas poblaciones o variaciones dialectales del español.
- La licencia no está especificada, lo que genera incertidumbre sobre las condiciones de uso comercial y redistribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.es_P_enriched
- Modelo base CardioBERTa.es: https://huggingface.co/DT4H/CardioBERTa.es
- Organización DT4H en Hugging Face: https://huggingface.co/DT4H/
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Documentación del catálogo de metadatos: https://datatools4heart.github.io/documentation-hub/metadata-catalogue/
