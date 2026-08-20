# DT4H/CardioBERTa.ro_P_translations_only

## Resumen

`DT4H/CardioBERTa.ro_P_translations_only` es un encoder de terminología biomédica en rumano, especializado en normalización de conceptos clínicos y entity linking. El modelo se inicializa desde `DT4H/CardioBERTa.ro`, un modelo de la familia CardioBERTa del proyecto CardioLM, y se ajusta mediante aprendizaje métrico supervisado con pares de terminología asociados a conceptos UMLS (CUI). Su objetivo principal es convertir términos clínicos en representaciones vectoriales densas que permitan recuperar y enlazar entidades biomédicas, especialmente en el dominio de la cardiología.

El modelo pertenece a la iniciativa europea DataTools4Heart (DT4H), cuyo fin es construir una plataforma federada de análisis de datos cardiovasculares. Esta ficha concreta usa la estrategia de entrenamiento `parents`, que enriquece los pares de sinónimos con relaciones ontológicas de jerarquía (términos padre), generando 1.607.064 triplets sobre 476.350 CUIs. La arquitectura es un transformer encoder tipo XLM-RoBERTa con 278 millones de parámetros, y está pensado para tareas de extracción de características y recuperación de información, no para generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) |
| Parámetros totales | 278.043.648 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (entrenado con `max_length=25`; el backbone XLM-RoBERTa soporta 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Rumano (`ro`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, preentrenado en dominios biomédicos y cardiología mediante Masked Language Modeling (MLM) como parte de la familia CardioBERTa. Posteriormente se ajusta con aprendizaje métrico supervisado por CUIs, utilizando triplets anclas, positivos y negativos construidos a partir de terminología UMLS y enriquecidos con relaciones ontológicas de tipo `parent` (términos). El entrenamiento emplea Multi-Similarity Loss con minería de todos los triplets y margen 0,2, pooling sobre el token CLS, una sola época, batch de 256, learning rate 2e-5 y longitud máxima de 25 tokens.

Se utilizaron 1.607.064 triplets, que cubren 476.350 CUIs y 531.693 términos normalizados únicos. La terminología de entrenamiento no se distribuye con el repositorio por estar sujeta a las licencias de UMLS; solo se publican estadísticas agregadas. Esta especialización permite que el modelo aprenda una representación semántica del vocabulario clínico rumano, priorizando relaciones de sinonimia y jerarquía.

## Capacidades

- Generación de embeddings de términos clínicos en rumano, aptos para recuperación de candidatos (candidate retrieval).
- Normalización de conceptos: mapea términos libres a conceptos UMLS mediante similitud de vectores.
- Entity linking en textos biomédicos, especialmente en el dominio de cardiología.
- Soporte de tareas de extracción de características (feature extraction) vía pipeline `transformers`.
- Compatible con librerías de embeddings como `sentence-transformers` (por su formato de salida) y con `text-embeddings-inference` para despliegue eficiente.
- No es generativo: no produce texto libre ni respuestas conversacionales.

## Casos de uso

- Normalización de conceptos en informes de cardiología: permite transformar términos clínicos en rumano (p. ej., "infarct miocardic") a CUIs UMLS, facilitando la codificación estandarizada de registros médicos.
- Entity linking en historiales clínicos electrónicos: integrado en un pipeline de NLP, puede identificar y enlazar menciones de enfermedades, fármacos y procedimientos con ontologías biomédicas.
- Búsqueda semántica de documentación médica: indexando embeddings de términos, se pueden recuperar documentos relevantes por similitud vectorial sin depender de coincidencias léxicas exactas.
- Construcción de pipelines de normalización multilingüe: dentro del proyecto DT4H, sirve como componente para el idioma rumano, junto con modelos para otros idiomas europeos.
- Análisis de datos de ensayos clínicos: normalización de variables y eventos adversos para su agregación en plataformas federadas.
- Soporte a sistemas de codificación automática (ICD, SNOMED) en cardiología: como paso previo a la asignación de códigos, el modelo reduce la variabilidad de la terminología libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 278 millones de parámetros, en precisión FP32 se requieren ~1,1 GB de memoria (tamaño del repositorio); en FP16 ~0,6 GB y en INT8 ~0,3 GB. Es viable en GPUs de consumo.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM para inferencia en FP32; una RTX 3060 o superior permite ejecutar con margen.
- Cabe en GPU consumer: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: compatible con `transformers`, `sentence-transformers`, `text-embeddings-inference` (indicado en los tags) y herramientas de serialización como `llama.cpp` (si se convierte a GGUF, aunque no está previsto de forma nativa).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Dentro de la familia CardioBERTa para rumano, existen variantes según la estrategia de triplets:

| Modelo | Estrategia | Triplets | CUIs | Términos únicos |
|---|---|---|---|---|
| `CardioBERTa.ro_P_translations_only` | `parents` | 1.607.064 | 476.350 | 531.693 |
| `CardioBERTa.ro_GP_translations_only` | `grandparents` | 4.734.361 | 476.970 | 531.980 |
| `CardioBERTa.ro_S_translations_only` | `synonyms` | 70.817 | 70.817 | 139.248 |

El modelo `parents` ofrece un equilibrio entre cobertura de términos (531.693) y tamaño de triplets, frente a la variante `synonyms` que solo cubre sinónimos directos y a la `grandparents` que amplía la jerarquía con un volumen mayor. No se dispone de datos comparativos de rendimiento en benchmarks estándar (MMLU, etc.) para estos modelos.

## Limitaciones y advertencias

- No está diseñado para toma de decisiones clínicas directas; su uso debe ser complementario a revisión humana.
- Solo soporta rumano; no es multilingüe.
- La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, lo que limita la reproducibilidad del entrenamiento.
- Entrenado con longitud máxima de 25 tokens, por lo que no captura contexto extenso; es adecuado para términos o frases cortas, no para documentos completos.
- Riesgo de embeddings inexactos para términos fuera del dominio de cardiología o con variaciones dialectales.
- No se han publicado evaluaciones de sesgo o alucinación; como encoder, el riesgo de alucinación es menor que en modelos generativos, pero la calidad de los embeddings depende de la representatividad de los datos de entrenamiento.
- La licencia no está especificada, lo que puede generar incertidumbre para su uso en producción comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.ro_P_translations_only
- Modelo base: https://huggingface.co/DT4H/CardioBERTa.ro
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio GitHub de DT4H: https://github.com/DataTools4Heart/
- Publicaciones del proyecto: https://www.datatools4heart.eu/publications/
