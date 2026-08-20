# DT4H/CardioBERTa.sv_translations_only

## Resumen

`DT4H/CardioBERTa.sv_translations_only` es un codificador de terminología biomédica en sueco, desarrollado por el proyecto europeo DataTools4Heart (DT4H), especializado en normalización de conceptos clínicos y entity linking. Se inicializa desde el modelo base `DT4H/CardioBERTa.sv` —un BERT adaptado al dominio cardiológico mediante preentrenamiento continuado con masked language modeling— y se afina con pares de sinónimos supervisados por conceptos UMLS (CUIs) usando metric learning. El resultado es un modelo de embeddings que mapea términos clínicos suecos a representaciones vectoriales normalizadas, facilitando la vinculación con ontologías biomédicas.

Con 124,7 millones de parámetros, es un modelo compacto orientado a tareas de recuperación y normalización de conceptos, no a generación de texto. Su relevancia radica en cubrir un idioma de baja representación en NLP clínico (sueco) dentro de una suite multilingüe que abarca siete lenguas europeas, y en su integración con pipelines de extracción de información en cardiología. Está diseñado para ser usado como componente de feature extraction en sistemas de entity linking, no para decisiones clínicas directas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only) |
| Parametros totales | 124.690.944 (0,1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 25) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32) |
| Idiomas soportados | sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia CardioBERTa, una serie de encoders específicos por idioma adaptados a cardiología mediante preentrenamiento continuado con MLM sobre corpus biomédicos y cardiológicos monolingües. La arquitectura es un transformer encoder estándar tipo BERT, con 124M de parámetros y pooling sobre el token `[CLS]` para generar embeddings de secuencia.

El entrenamiento de esta variante (`translations_only`) se realizó a partir del checkpoint `DT4H/CardioBERTa.sv` y consistió en un ajuste fino con tripletes de sinónimos supervisados por CUIs, usando la función de pérdida Multi-Similarity Loss. Se emplearon 71.919 tripletes que cubren 71.919 CUIs y 141.369 términos únicos normalizados, con una estrategia de minería de todos los tripletes (margen 0,2). El entrenamiento duró 1 época, con batch size 256, learning rate 2e-5 y longitud máxima de 25 tokens. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de terminología biomédica sueca, normalizados con norma L2.
- Normalización de conceptos clínicos (entity linking) mediante mapeo a CUIs de UMLS.
- Recuperación de candidatos biomédicos por similitud coseno entre embeddings.
- Soporte para pipelines de NLP clínico en cardiología, como extracción de entidades y codificación automática.
- Integración con librerías de transformers y con text-embeddings-inference para despliegue en endpoints.
- No es generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Normalización de términos en informes de cardiología suecos: el modelo convierte expresiones clínicas libres (p. ej., "hjärtinfarkt") en embeddings que se comparan contra un diccionario de conceptos UMLS para asignar el CUI correcto.
- Entity linking en registros electrónicos de salud (EHR): permite enlazar menciones de enfermedades, medicamentos o procedimientos a ontologías estandarizadas, facilitando la interoperabilidad de datos clínicos.
- Búsqueda semántica de conceptos clínicos: al indexar términos normalizados, se pueden recuperar documentos o fragmentos que mencionan conceptos relacionados aunque usen sinónimos distintos.
- Soporte a codificación automática (p. ej., ICD-10): los embeddings sirven como entrada para clasificadores que asignan códigos de facturación o estadística a partir de texto clínico.
- Integración en pipelines de extracción de información: combinado con un reconocedor de entidades, el modelo normaliza las entidades extraídas a CUIs, mejorando la precisión de sistemas de minería de textos biomédicos.
- Investigación en cardiología con datos suecos: permite construir cohortes fenotípicas a partir de registros clínicos no estructurados, al unificar terminología heterogénea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~0,5 GB en FP32 (124M parámetros), ~0,25 GB en FP16; cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: NVIDIA GTX 1060 o superior, RTX 2060, RTX 4090, o incluso inferencia en CPU con latencia aceptable para tareas por lotes.
- Despliegue: compatible con `transformers`, `text-embeddings-inference` (TEI) y endpoints de Hugging Face; también puede ejecutarse con `sentence-transformers` si se adapta.
- Latencia: muy baja para un encoder de este tamaño; en GPU moderna, inferencia de un solo texto en milisegundos; throughput alto en procesamiento por lotes.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Existen variantes de la misma familia, como `DT4H/CardioBERTa.sv_GP_enriched` (entrenada con relaciones de padres y abuelos), pero no se han publicado especificaciones detalladas ni resultados de rendimiento. El modelo base `DT4H/CardioBERTa.sv` comparte arquitectura y tamaño, pero no está especializado en entity linking.

## Limitaciones y advertencias

- No está diseñado para decisiones clínicas directas; su uso es exclusivamente para tareas de NLP e investigación.
- Entrenado únicamente con sinónimos (estrategia `translations_only`), por lo que no captura relaciones jerárquicas (padres, abuelos) que otras variantes sí incluyen; esto puede limitar su capacidad para generalizar a términos fuera del vocabulario de sinónimos.
- Vocabulario restringido a terminología cardiológica y biomédica sueca; no cubre otros dominios ni idiomas.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o redistribución.
- La terminología de entrenamiento no se distribuye por restricciones de UMLS, lo que impide auditar o ampliar el vocabulario sin licencias adicionales.
- Riesgo de alucinación en la asignación de CUIs si se usa fuera de su dominio de entrenamiento; se recomienda validar los resultados con un diccionario de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.sv_translations_only
- Modelo base: https://huggingface.co/DT4H/CardioBERTa.sv
- Variante con relaciones jerárquicas: https://huggingface.co/DT4H/CardioBERTa.sv_GP_enriched
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio GitHub del proyecto: https://github.com/DataTools4Heart/
