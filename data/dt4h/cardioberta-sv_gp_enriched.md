# DT4H/CardioBERTa.sv_GP_enriched

## Resumen

CardioBERTa.sv_GP_enriched es un encoder de terminología biomédica en sueco, desarrollado por el proyecto DataTools4Heart (DT4H), especializado en normalización de conceptos clínicos y entity linking en el dominio de la cardiología. El modelo se inicializa desde CardioBERTa.sv, un BERT adaptado al dominio cardiológico mediante continuacion del pretraining con masked language modeling sobre corpus biomédicos suecos, y se afina con tripletas supervisadas por CUIs (Concept Unique Identifiers) de UMLS usando metric learning con Multi-Similarity Loss. Su objetivo es generar embeddings de términos clínicos que permitan recuperar y enlazar conceptos normalizados en pipelines de NLP clínico.

Con 124 millones de parámetros, es un modelo compacto y eficiente para tareas de recuperación de candidatos y normalización de entidades. Su relevancia radica en cubrir un idioma poco representado en recursos biomédicos (sueco) y en ofrecer una solución de código abierto para la interoperabilidad semántica en cardiología, alineada con los objetivos del proyecto europeo DT4H. No es un modelo generativo, sino un extractor de características diseñado para producir embeddings de términos mediante pooling CLS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 124.690.944 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max_length 25) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP32) |
| Idiomas soportados | sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT base, con 12 capas, 768 dimensiones de ocultación y 12 cabezas de atención, configuracion estándar para 124M parámetros. Se inicializa desde CardioBERTa.sv, que a su vez proviene de la familia CardioBERTa del proyecto CardioLM, una suite de modelos lingüísticos pequeños multilingües para el dominio de la cardiología. CardioBERTa.sv fue adaptado mediante continuacion del pretraining con MLM sobre corpus biomédicos y cardiológicos en sueco.

El afinamiento se realiza con tripletas CUI-supervisadas enriquecidas con relaciones ontológicas de nivel "grandparent" (abuelo), utilizando Multi-Similarity Loss y minería de todas las tripletas con margen 0,2. El pooling se hace sobre el token CLS, con una época, batch size de 256, learning rate de 2e-5 y longitud máxima de 25 tokens. En total se usaron 4.915.580 tripletas que cubren 476.972 CUIs y 539.362 términos normalizados únicos. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings semánticos para términos clínicos suecos, optimizados para similitud coseno.
- Normalización de conceptos y entity linking: mapea menciones textuales a identificadores UMLS (CUIs).
- Recuperación de candidatos biomédicos en el dominio de cardiología.
- Extracción de características para pipelines de NLP clínico (feature extraction).
- Compatible con la libreria transformers y con Text Embeddings Inference (TEI) para despliegue en producción.
- Soporte multilingüe limitado al sueco, aunque el backbone CardioBERTa cubre otros idiomas (checo, neerlandés, inglés, italiano, rumano, español, sueco) no se garantiza el rendimiento fuera del sueco.
- No es generativo ni conversacional; no admite tool calling ni razonamiento multi-paso.

## Casos de uso

- Normalización de entidades clínicas en historiales médicos electrónicos suecos: el modelo convierte menciones libres (p. ej. "hjärtinfarkt") en CUIs estandarizados, facilitando la integración de datos heterogéneos.
- Entity linking en literatura cardiológica: permite enlazar términos extraídos de artículos científicos a ontologías UMLS para construir bases de conocimiento.
- Recuperación de conceptos en sistemas de búsqueda semántica: al indexar embeddings de términos, se pueden encontrar sinónimos y conceptos relacionados mediante similitud coseno.
- Enriquecimiento de ontologías y vocabularios controlados: el modelo puede sugerir relaciones entre términos basándose en la proximidad de sus embeddings, complementando recursos como SNOMED CT o UMLS.
- Soporte a pipelines de extracción de información clínica: combinado con un NER (p. ej. cardio-ner-sv-cardioberta-multilabel), permite normalizar las entidades detectadas en un flujo completo.
- Análisis de datos federados en cardiología: dentro del ecosistema DT4H, el modelo facilita la armonización semántica de datos distribuidos entre instituciones sin centralizar la información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se reportan métricas como MMLU, HumanEval o similares, ya que el modelo es un encoder de terminología y no un LLM generativo. Tampoco se ofrecen comparativas cuantitativas con otros modelos de embedding biomédicos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124M parámetros y pesos en FP32, el modelo ocupa aproximadamente 500 MB; en FP16 se reduce a ~250 MB. Es viable en GPUs de consumo con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060, o superiores. También puede ejecutarse en CPU para inferencia por lotes pequeños.
- Despliegue: compatible con la libreria transformers, Text Embeddings Inference (TEI) para endpoints de embeddings, y con frameworks como Hugging Face Inference Endpoints.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo pequeño, la inferencia es rápida; en una GPU consumer se pueden procesar cientos de términos por segundo.
- Alternativa ligera: se puede cuantizar a int8 o int4 con herramientas como bitsandbytes para reducir aún más el consumo de memoria.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente en la documentación proporcionada. El modelo base CardioBERTa.sv es el punto de partida, y este afinamiento añade capacidad de normalización de conceptos. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| CardioBERTa.sv_GP_enriched | 124M | no disponible | Embeddings de terminología sueca | no disponible |
| CardioBERTa.sv | 124M | no disponible | MLM cardiológico sueco | no disponible |
| BioBERT (en inglés) | 110M | 512 | MLM biomédico inglés | Apache 2.0 |

No se dispone de benchmarks comparativos entre estos modelos.

## Limitaciones y advertencias

- No está diseñado para toma de decisiones clínicas directas; su uso se limita a tareas de NLP y gestión de información.
- Solo soporta sueco; el rendimiento en otros idiomas no está garantizado, aunque el backbone sea multilingüe.
- La longitud máxima de entrenamiento es de 25 tokens, lo que limita la captura de contexto en términos o frases largas; el contexto máximo del modelo no está documentado.
- La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, lo que puede dificultar la reproducibilidad completa.
- Riesgo de alucinación en la generación de embeddings no aplica directamente, pero sí puede haber errores de normalización para términos poco frecuentes o fuera del dominio cardiológico.
- No se ha publicado información sobre sesgos; como modelo entrenado con terminología médica, puede heredar sesgos de los corpus de origen.
- Licencia no especificada; antes de un uso comercial conviene contactar con el proyecto DT4H para aclarar los términos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.sv_GP_enriched
- Modelo base CardioBERTa.sv: https://huggingface.co/DT4H/CardioBERTa.sv
- Modelo NER relacionado: https://huggingface.co/DT4H/cardio-ner-sv-cardioberta-multilabel
- Organización GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Documentación del proyecto: https://datatools4heart.github.io/documentation-hub/
