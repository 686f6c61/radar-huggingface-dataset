# DT4H/CardioBERTa.es_GP_enriched

## Resumen

CardioBERTa.es_GP_enriched es un codificador de terminología biomédica en español, especializado en normalización de conceptos clínicos y entity linking, desarrollado por el proyecto europeo DataTools4Heart (DT4H). El modelo se inicializa desde CardioBERTa.es, un encoder de la familia CardioLM adaptado al dominio cardiológico mediante entrenamiento continuado con masked language modeling sobre corpus biomédicos monolingües.

Su contribución principal es el entrenamiento con tripletas CUI-supervisadas enriquecidas con relaciones ontológicas de nivel "grandparent", utilizando metric learning con Multi-Similarity Loss. Esto permite generar embeddings de términos clínicos donde sinónimos y conceptos relacionados quedan próximos en el espacio vectorial, facilitando tareas de candidato retrieval y normalización de conceptos UMLS.

El modelo tiene 125,98 millones de parámetros, es de tipo RoBERTa, soporta exclusivamente español y está pensado para pipelines de procesamiento de lenguaje natural clínico, especialmente en cardiología. Su relevancia actual radica en la necesidad de estandarizar informes clínicos heterogéneos en sistemas sanitarios europeos, donde la terminología libre debe mapearse a vocabularios controlados como UMLS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 25 tokens (máximo usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con quantización estándar de transformers) |
| Idiomas soportados | Español (es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa, un encoder transformer basado en BERT con optimizaciones de entrenamiento como dynamic masking y eliminación de la tarea de next sentence prediction. El backbone pertenece a la familia CardioBERTa, que adapta modelos de lenguaje a cardiología mediante continued pretraining con masked language modeling sobre corpus biomédicos y cardiológicos monolingües.

El entrenamiento especializado se realizó con tripletas CUI-supervisadas extraídas de terminología UMLS en español, enriquecidas con relaciones ontológicas de nivel "grandparent" (abuelo) para ampliar el conjunto de positivos. Se usó Multi-Similarity Loss con mining de todas las tripletas y margen 0,2, pooling sobre el token CLS, una época, batch size de 256 y learning rate de 2e-5. El dataset final contiene 4.944.387 tripletas, cubriendo 476.973 CUIs y 545.308 términos normalizados únicos. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS.

## Capacidades

- Generación de embeddings de terminología clínica en español, normalizados con norma L2.
- Entity linking y normalización de conceptos: mapea términos libres a conceptos UMLS (CUIs).
- Candidate retrieval: dado un término clínico, recupera conceptos candidatos de una base de terminología.
- Similaridad semántica entre términos biomédicos, incluyendo sinónimos y relaciones jerárquicas.
- Especialización en cardiología, aunque cubre terminología biomédica general.
- No genera texto: es exclusivamente un modelo de feature extraction.
- No soporta tool calling ni funciones de agente.

## Casos de uso

- Normalización de informes de cardiología: dado un informe clínico en español, el modelo permite mapear términos libres (p. ej. "infarto de miocardio") a conceptos UMLS estandarizados, facilitando la estructuración de datos no estructurados.
- Indexación semántica de historiales clínicos electrónicos: embeddings de términos permiten agrupar registros por concepto, habilitando búsquedas por similaridad semántica en lugar de coincidencia exacta.
- Detección de duplicados en bases de datos clínicas: al normalizar sinónimos y variantes terminológicas, se pueden identificar registros que se refieren al mismo concepto.
- Enriquecimiento de ontologías biomédicas: el modelo puede sugerir relaciones entre términos basándose en proximidad de embeddings, apoyando la curación de vocabularios controlados.
- Pipeline de entity linking en español: integrable como componente de retrieval en sistemas que necesitan vincular menciones clínicas a bases de conocimiento UMLS.
- Armonización de datos multicéntricos: en proyectos europeos federados, permite estandarizar terminología de distintos hospitales y regiones hacia un vocabulario común.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o tareas de normalización de conceptos con las que comparar objetivamente el rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (125M parámetros), reducible a ~0,25 GB con cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Modelos como NVIDIA T4, GTX 1660, RTX 3060 o superiores son suficientes.
- Corre en GPU de consumo: sí, incluso en CPUs modernas con suficiente RAM.
- Opciones de despliegue: transformers de Hugging Face, sentence-transformers, endpoints compatibles con text-embeddings-inference (mencionado en tags).
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de 125M parámetros y secuencias máximas de 25 tokens, la inferencia es de pocos milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|
| CardioBERTa.es_GP_enriched | 125,98M | 25 tokens | es | no disponible | Normalización de conceptos UMLS en cardiología |
| SapBERT | 110M (base) | 512 tokens | en | Apache 2.0 | Entity linking biomédico en inglés |
| BioBERT | 110M (base) | 512 tokens | en | MIT | NLP biomédico general en inglés |
| BETO (Spanish BERT) | 110M | 512 tokens | es | MIT | NLP general en español |

El modelo se diferencia de SapBERT y BioBERT por estar especializado en español y en cardiología, aunque su contexto de 25 tokens es significativamente menor que los 512 de las alternativas, lo que limita su uso a términos y frases cortas. No se dispone de comparativas de rendimiento publicadas.

## Limitaciones y advertencias

- No está destinado a la toma de decisiones clínicas directas; es una herramienta de soporte para pipelines de NLP.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial y redistribución.
- La terminología de entrenamiento no se distribuye por restricciones de UMLS, lo que limita la reproducibilidad.
- El contexto máximo de 25 tokens restringe su uso a términos y frases cortas; no procesa documentos completos.
- Solo soporta español; no es multilingüe.
- Riesgo de alucinación en entity linking: términos ambiguos o poco frecuentes pueden mapearse a conceptos UMLS incorrectos.
- No se han publicado evaluaciones de sesgos; el modelo puede reflejar sesgos presentes en los corpus biomédicos de entrenamiento.
- No hay información sobre versiones cuantizadas oficiales ni soporte para frameworks de inferencia optimizada como vLLM u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.es_GP_enriched
- Modelo base CardioBERTa.es: https://huggingface.co/DT4H/CardioBERTa.es
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Organización DT4H en Hugging Face: https://huggingface.co/datasets/DT4H/
- GitHub del proyecto: https://github.com/DataTools4Heart/
- Ficha del proyecto en CORDIS: https://cordis.europa.eu/project/id/101057849
