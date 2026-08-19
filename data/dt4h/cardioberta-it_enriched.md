# DT4H/CardioBERTa.it_enriched

## Resumen

`DT4H/CardioBERTa.it_enriched` es un codificador de terminología biomédica en italiano desarrollado por el proyecto DataTools4Heart (DT4H), un consorcio europeo financiado por Horizon Europe (Grant Agreement 101057849) que trabaja en herramientas federadas y privadas para el análisis de datos de cardiología. El modelo se especializa en la normalización de conceptos clínicos y el entity linking, es decir, en asignar menciones de texto a conceptos normalizados del sistema UMLS (Unified Medical Language System).

El modelo se inicializa desde `DT4H/CardioBERTa.it`, un modelo de la familia CardioBERTa basado en arquitectura BERT (RoBERTa) adaptado al dominio cardiológico mediante entrenamiento continuado con MLM sobre corpus monolingües italianos. La especialización se realiza con aprendizaje métrico (metric learning) sobre 69.631 tripletas de sinónimos supervisadas por CUI, con un objetivo Multi-Similarity Loss. Tiene 109,9 millones de parámetros y una ventana de contexto de 25 tokens, pensado para representar términos cortos, no texto largo. Su relevancia radica en que aborda la normalización de conceptos clínicos en un idioma de baja representación como el italiano, dentro de un dominio tan crítico como la cardiología.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (RoBERTa) |
| Parámetros totales | 109.927.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 25 tokens (configurado en entrenamiento; el máximo del tokenizador puede ser mayor) |
| Tipos de cuantización | no disponible (repo solo con safetensors en FP32) |
| Idiomas soportados | Italiano (`it`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `DT4H/CardioBERTa.it` pertenece a la familia CardioBERTa de CardioLM, una suite multilingüe de pequeños modelos de lenguaje para el dominio cardiológico. La arquitectura es un transformer encoder tipo BERT (concretamente RoBERTa), adaptado al dominio mediante continued pretraining con Masked Language Modeling (MLM) sobre corpus biomédicos y cardiológicos italianos.

La especialización de `_enriched` se realiza mediante aprendizaje métrico (metric learning) sobre tripletas de sinónimos supervisadas por CUI. Se utilizan 69.631 tripletas que cubren 69.631 CUIs y 136.720 términos normalizados únicos. El objetivo es Multi-Similarity Loss, con minería de todos los tripletes y margen 0.2. El pooling se realiza sobre el token `[CLS]`, con una época, tamaño de batch 256, learning rate 2e-5 y longitud máxima de 25 tokens. La terminología de entrenamiento no se distribuye con el repositorio por restricciones de licencia del UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Normalización de conceptos clínicos: asigna términos biomédicos en italiano a conceptos UMLS normalizados (CUIs).
- Entity linking: enlaza menciones en texto clínico (especialmente cardiología) a entidades de una base de conocimiento.
- Recuperación de candidatos: genera embeddings de términos que permiten buscar conceptos similares por similitud de coseno.
- Representación semántica de terminología biomédica: útil para pipelines de NLP clínico.
- No es un modelo generativo: no genera texto, sino representaciones vectoriales (feature extraction).
- Capacidad multilingüe: solo italiano.

## Casos de uso

- Normalización de terminología en historias clínicas electrónicas: el modelo puede mapear términos italianos como "infarto miocardico" o "scompenso cardiaco" a los CUIs correspondientes del UMLS, facilitando la codificación estandarizada de diagnósticos.
- Entity linking en artículos científicos de cardiología: permite enlazar menciones de conceptos en textos de investigación a entidades de ontologías biomédicas, mejorando la búsqueda y la minería de literatura.
- Recuperación de información clínica (IR): al generar embeddings de términos, se puede implementar búsqueda semántica de documentos clínicos por conceptos, en lugar de por palabras exactas.
- Enriquecimiento de datos clínicos para modelos aguas arriba: sirve como módulo de preprocesamiento para pipelines de NLP que requieren conceptos normalizados antes de análisis posteriores.
- Soporte a sistemas de codificación de diagnósticos (ICD-9/10): al enlazar términos a CUIs, se facilita la transición a códigos de clasificación estándar.
- Análisis de cohortes en investigación cardiología: al normalizar términos de múltiples fuentes heterogéneas, se pueden unificar criterios para estudios de federados o multicéntricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Modelo de ~110 millones de parámetros (tamaño equivalente a BERT-base). Estimación de VRAM: entre 0.5 y 1 GB en FP32 para inferencia (sin cuantización); con cuantización INT8 o FP16, puede bajar a menos de 0.5 GB.
- Cabe en cualquier GPU de consumo moderno: NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- El repositorio es de 0.4 GB (solo pesos safetensors).
- Despliegue recomendado: Transformers (Hugging Face) con PyTorch, o Text Embeddings Inference (TEI) ya que el modelo es compatible con `endpoints_compatible`.
- No se dispone de datos de latencia o throughput específicos del autor.

## Comparativa con modelos similares

| Modelo | Idioma | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| DT4H/CardioBERTa.it_enriched | Italiano | 109,9 M | 25 tokens (entrenamiento) | no disponible | Normalización de entidades cardiológicas |
| BioBERT (inglés) | Inglés | 110 M | 512 tokens | MIT | NER y normalización biomédica |
| PubMedBERT (inglés) | Inglés | 110 M | 512 tokens | MIT | Representación biomédica |
| BioSapBERT (inglés) | Inglés | 110 M | 512 tokens | MIT | Entity linking biomédico |

No se dispone de resultados de benchmarks comparativos entre estos modelos. La comparación se limita a parámetros y enfoque. El modelo de DT4H es específico para italiano y cardiología, mientras que los demás son multidisciplinares o en inglés.

## Limitaciones y advertencias

- La terminología de entrenamiento no se distribuye por restricciones de licencia del UMLS; el usuario debe obtener la licencia correspondiente para acceder a los datos de entrenamiento.
- Modelo diseñado para términos cortos (longitud máxima de entrenamiento de 25 tokens), no para documentos completos.
- Solo soporta idioma italiano; no hay versiones para otros idiomas en esta variante específica.
- No es apto para toma de decisiones clínicas directas; su uso es de investigación y procesamiento de datos.
- No se han documentado sesgos específicos, pero al estar entrenado en terminología médica puede reflejar sesgos de los corpus de origen (por ejemplo, subrepresentación de ciertas poblaciones).
- Riesgo de alucinación en la asignación de conceptos si se usa fuera de su dominio de entrenamiento (cardiología).

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/DT4H/CardioBERTa.it_enriched)
- [HuggingFace del modelo base](https://huggingface.co/DT4H/CardioBERTa.it)
- [Organización DT4H en HuggingFace](https://huggingface.co/datasets/DT4H/)
- [Web del proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [GitHub del proyecto DataTools4Heart](https://github.com/DataTools4Heart/)
- [Folletto del proyecto DT4H (PDF)](https://www.datatools4heart.eu/wp-content/uploads/2023/08/DT4H-booklet_A4-web.pdf)
