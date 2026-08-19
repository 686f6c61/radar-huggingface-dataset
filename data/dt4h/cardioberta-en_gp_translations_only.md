# DT4H/CardioBERTa.en_GP_translations_only

## Resumen

CardioBERTa.en_GP_translations_only es un codificador de terminología biomédica en inglés desarrollado por el proyecto europeo DataTools4Heart (DT4H), especializado en normalización de conceptos clínicos y entity linking. El modelo se inicializa desde CardioBERTa.en, un encoder RoBERTa adaptado al dominio de la cardiología mediante preentrenamiento continuado con masked language modeling sobre corpus biomédicos y cardiológicos monolingües.

El modelo se entrena con tripletas supervisadas por conceptos UMLS (CUI) usando metric learning con Multi-Similarity Loss, enriqueciendo las relaciones de sinonimia con relaciones ontológicas de nivel "grandparent" (abuelo). Con 124,6 millones de parámetros y una ventana de contexto máxima de 25 tokens, está diseñado para generar embeddings de términos clínicos normalizados y recuperar candidatos en pipelines de entity linking, particularmente en el dominio cardiológico.

Su relevancia reside en que aborda un problema específico de la NLP clínica: la variabilidad terminológica entre documentos sanitarios europeos. Al estar entrenado exclusivamente con pares de términos en inglés y relaciones ontológicas UMLS, permite mapear expresiones clínicas heterogéneas a conceptos estandarizados, facilitando la interoperabilidad de datos de salud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 124.645.632 (0,1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 25 tokens (máximo usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16 en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tensores I64 y F32) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder con atención bidireccional, adaptado al dominio cardiológico mediante preentrenamiento continuado con MLM sobre corpus biomédicos y cardiológicos en inglés. El backbone pertenece a la familia CardioBERTa, que cubre siete idiomas europeos (checo, neerlandés, inglés, italiano, rumano, español y sueco).

El entrenamiento de especialización utiliza tripletas de términos clínicos supervisadas por conceptos UMLS (CUI), con una estrategia de minería "grandparents" que enriquece las relaciones de sinonimia con relaciones ontológicas de nivel abuelo. Se emplea Multi-Similarity Loss con minería de todas las tripletas y margen 0,2, pooling sobre el token CLS, una sola época, tamaño de lote 256, tasa de aprendizaje 2e-5 y longitud máxima de secuencia de 25 tokens. El dataset de entrenamiento comprende 4.952.020 tripletas, 477.293 CUIs y 550.651 términos normalizados únicos. La terminología de entrenamiento no se distribuye con el repositorio por restricciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de términos clínicos normalizados para recuperación de conceptos biomédicos.
- Normalización de conceptos clínicos (concept normalization) y entity linking en el dominio de la cardiología.
- Alineación de expresiones terminológicas heterogéneas con conceptos UMLS mediante similitud coseno en el espacio de embeddings.
- Recuperación de candidatos (candidate retrieval) para pipelines de NLP clínica.
- Soporte de metric learning con pooling CLS y normalización L2 de los embeddings de salida.
- Capacidad multilingüe limitada: solo inglés, aunque el backbone pertenece a una familia multilingüe (los modelos hermanos cubren otros seis idiomas europeos).
- No soporta generación de texto ni tool calling: es un modelo exclusivamente de representación (feature extraction).

## Casos de uso

- Normalización de conceptos en historiales clínicos cardiovasculares: el modelo puede mapear términos libres extraídos de informes médicos a conceptos UMLS estandarizados, facilitando el análisis agregado de datos heterogéneos entre hospitales.
- Entity linking en pipelines de NLP clínica: integrado como módulo de recuperación de candidatos, permite resolver menciones de entidades cardiológicas (fármacos, procedimientos, diagnósticos) contra una ontología UMLS.
- Desambiguación terminológica en ensayos clínicos: al comparar embeddings de términos de distintos documentos, ayuda a identificar que dos expresiones distintas refieren al mismo concepto clínico.
- Indexación semántica de literatura cardiológica: genera representaciones vectoriales de términos que permiten búsquedas por similitud en corpus de artículos científicos.
- Armonización de datos entre sistemas sanitarios europeos: como parte de la suite CardioLM del proyecto DT4H, contribuye a estandarizar la estructuración de informes de cardiología entre regiones europeas.
- Construcción de bases de conocimiento clínicas: el modelo puede usarse para enlazar términos extraídos de fuentes no estructuradas (notas clínicas, informes de alta) con ontologías formales como UMLS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta métricas de evaluación como precisión en entity linking, recall en recuperación de conceptos ni comparativas con otros codificadores biomédicos (p. ej., SapBERT, BioBERT o PubMedBERT).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 y 0,25 GB en FP16, dado el tamaño de 125M de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior ofrece margen amplio. No requiere hardware de datacenter.
- Compatible con GPUs de consumo: sí, cabe holgadamente en tarjetas de gama media e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: compatible con transformers (PyTorch), Hugging Face Inference Endpoints, y servidores de embeddings como text-embeddings-inference (el modelo está etiquetado como compatible con endpoints).
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un encoder de 125M de parámetros con secuencias de 25 tokens, la latencia por lote en GPU moderna es del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| CardioBERTa.en_GP_translations_only | 125M | 25 tokens | Entity linking cardiológico con metric learning UMLS | no disponible |
| SapBERT | 110M (base BERT) | 512 tokens | Normalización de conceptos UMLS con self-alignment | MIT (base BERT) |
| BioBERT | 110M (base BERT) | 512 tokens | NLP biomédica general (NER, RE, QA) | MIT (base BERT) |
| PubMedBERT | 110M (base BERT) | 512 tokens | NLP biomédica desde cero | MIT (base BERT) |

La comparativa es orientativa: no se dispone de datos de rendimiento publicados para CardioBERTa.en_GP_translations_only que permitan contrastar numéricamente con estas alternativas. A diferencia de SapBERT, que se entrena con minería de tripletas a gran escala sobre UMLS, este modelo se limita al dominio cardiológico y a relaciones de nivel grandparent, con una ventana de contexto mucho más corta (25 tokens).

## Limitaciones y advertencias

- El modelo está restringido al idioma inglés; no procesa términos en otros idiomas europeos a pesar de que la familia CardioBERTa los cubre.
- La ventana de contexto de 25 tokens limita su uso a términos o frases cortas; no es adecuado para codificar documentos completos o descripciones extensas.
- La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, lo que dificulta la reproducibilidad completa del entrenamiento.
- La licencia del modelo no está especificada, lo que genera incertidumbre sobre las condiciones de uso comercial.
- No está destinado a la toma de decisiones clínicas directas; es una herramienta de procesamiento de lenguaje natural.
- No se han publicado evaluaciones de sesgos ni estudios de robustez ante terminología no vista.
- El modelo puede alucinar asociaciones semánticas entre términos que no comparten concepto UMLS real, especialmente con expresiones poco frecuentes fuera del dominio cardiológico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.en_GP_translations_only
- Modelo base CardioBERTa.en: https://huggingface.co/DT4H/CardioBERTa.en
- Organización DT4H en HuggingFace: https://huggingface.co/DT4H
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Organización GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
