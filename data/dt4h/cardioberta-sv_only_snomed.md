# DT4H/CardioBERTa.sv_only_snomed

## Resumen

CardioBERTa.sv_only_snomed es un codificador de terminología biomédica en sueco, especializado en normalización de conceptos clínicos y entity linking. Desarrollado por el proyecto DataTools4Heart (DT4H), forma parte de la familia CardioBERTa, una suite de modelos de lenguaje pequeños específicos para cardiología. El modelo se inicializa desde el backbone CardioBERTa.sv y se ajusta mediante aprendizaje métrico con tripletas supervisadas por CUIs (Concept Unique Identifiers) de UMLS.

Con 124,7 millones de parámetros, este modelo está diseñado para generar embeddings de términos clínicos que permiten recuperar candidatos y vincular menciones a conceptos estandarizados, especialmente en el dominio cardiológico. Su relevancia radica en abordar la variabilidad terminológica de los textos clínicos en sueco, facilitando la interoperabilidad semántica en pipelines de procesamiento de lenguaje natural clínico. El entrenamiento se realizó con 71.919 tripletas que cubren 71.919 CUIs y 141.369 términos únicos normalizados, usando una longitud máxima de 25 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 124.690.944 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 25 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT estándar, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, tal como corresponde a la familia CardioBERTa. El backbone CardioBERTa.sv se obtuvo mediante preentrenamiento continuado con enmascaramiento de lenguaje (MLM) sobre corpus biomédicos y cardiológicos monolingües en sueco. Posteriormente, este modelo se especializó para normalización de conceptos usando tripletas de sinónimos supervisadas por CUIs de UMLS, con el objetivo de Multi-Similarity Loss y minería de todas las tripletas con margen 0,2. El pooling se realiza sobre el token CLS, y el entrenamiento se ejecutó durante 1 época con batch size de 256 y learning rate de 2e-5. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de términos clínicos normalizados, capaces de representar sinónimos y variantes terminológicas en el espacio vectorial.
- Entity linking y concept normalization: asocia menciones de texto a conceptos UMLS (CUIs) mediante recuperación de candidatos por similitud coseno.
- Recuperación de terminología biomédica en sueco, especialmente en el dominio de cardiología.
- Soporte para integración en pipelines de NLP clínico como módulo de normalización previo a tareas downstream.
- Funciona como codificador de secuencias cortas (hasta 25 tokens), optimizado para términos y frases breves.
- No incluye capacidades generativas ni de razonamiento; es exclusivamente un modelo de representación.

## Casos de uso

- Normalización de diagnósticos en historias clínicas electrónicas suecas: el modelo convierte descripciones libres de enfermedades cardíacas en códigos UMLS estandarizados, facilitando la agregación de datos para investigación.
- Entity linking en artículos científicos de cardiología: permite enlazar menciones de fármacos, procedimientos o patologías a conceptos UMLS, mejorando la búsqueda semántica en literatura médica.
- Desambiguación de terminología clínica en registros de salud: al generar embeddings cercanos para sinónimos, ayuda a resolver variaciones lingüísticas (p. ej., "hjärtinfarkt" vs. "myokardinfarkt").
- Construcción de grafos de conocimiento clínico: los embeddings sirven para conectar términos de diferentes fuentes (ensayos, informes, ontologías) mediante similitud vectorial.
- Preprocesamiento para extracción de información: en pipelines de NLP clínico, el modelo normaliza entidades extraídas antes de su almacenamiento en bases de datos estructuradas.
- Búsqueda de pacientes para ensayos clínicos: al normalizar criterios de inclusión y datos de pacientes a UMLS, facilita la comparación automática de elegibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo pesa ~0,5 GB en disco), por lo que cabe en cualquier GPU moderna, incluidas las de gama de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060) o incluso CPU para inferencia por lotes pequeños.
- Es compatible con despliegue en CPU gracias a su tamaño reducido; la latencia por embedding es del orden de milisegundos en hardware moderno.
- Opciones de despliegue: puede servirse con Hugging Face Inference Endpoints, o mediante librerías como sentence-transformers, FAISS para indexación de vectores, o TEI (Text Embeddings Inference).
- Al ser un modelo BERT pequeño, el throughput es alto: cientos de secuencias por segundo en una GPU media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Uso principal |
|---|---|---|---|---|---|
| CardioBERTa.sv_only_snomed | 124,7M | 25 | Sueco | no disponible | Entity linking cardiológico |
| CardioBERTa.sv (base) | 124,7M | 512 (aprox.) | Sueco | no disponible | Embeddings clínicos generales |
| SapBERT (base) | 110M | 512 | Multilingüe (ajustado a UMLS) | MIT | Normalización de conceptos biomédicos |

No se dispone de comparativas de rendimiento publicadas para este modelo específico. La comparación se basa en características arquitectónicas y de entrenamiento.

## Limitaciones y advertencias

- No está diseñado para toma de decisiones clínicas directas; su uso es exclusivamente para tareas de representación y normalización de terminología.
- La licencia no está especificada, lo que puede limitar su uso comercial sin consulta legal previa.
- La terminología de entrenamiento no se distribuye por restricciones de UMLS, lo que impide reproducir el ajuste fino.
- Longitud de contexto limitada a 25 tokens: no es adecuado para procesar documentos completos, solo términos o frases cortas.
- Entrenado únicamente en sueco; no soporta otros idiomas.
- Puede presentar sesgos derivados del corpus de entrenamiento (dominio cardiológico, posible infrarrepresentación de ciertas poblaciones).
- Riesgo de alucinación en la generación de embeddings no aplica, pero la recuperación de conceptos puede fallar ante términos muy novedosos o fuera de vocabulario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.sv_only_snomed
- Modelo base CardioBERTa.sv: https://huggingface.co/DT4H/CardioBERTa.sv
- Organización DataTools4Heart en Hugging Face: https://huggingface.co/DT4H/
- Proyecto DataTools4Heart (web): https://www.datatools4heart.eu/
- Repositorio GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
