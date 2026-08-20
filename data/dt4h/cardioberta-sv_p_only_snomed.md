# DT4H/CardioBERTa.sv_P_only_snomed

## Resumen

CardioBERTa.sv_P_only_snomed es un encoder de terminología biomédica en sueco, especializado en normalización de conceptos clínicos y entity linking. Desarrollado por el proyecto DataTools4Heart (DT4H), se inicializa desde el modelo base CardioBERTa.sv, un BERT adaptado al dominio cardiológico mediante continuo preentrenamiento con Masked Language Modeling. La especialización se realiza con tripletas supervisadas por conceptos UMLS y metric learning, lo que permite obtener embeddings de términos que agrupan sinónimos y relaciones ontológicas de tipo padre.

El modelo resuelve el problema de vincular términos clínicos en texto libre a conceptos estandarizados (CUIs de UMLS), un paso clave para la interoperabilidad de datos sanitarios y la investigación federada. Su relevancia radica en cubrir un idioma poco atendido (sueco) en el dominio biomédico, y en su diseño compacto (124 millones de parámetros) que permite su despliegue en entornos con recursos limitados. La arquitectura es un BERT estándar, con una longitud de contexto no especificada explícitamente, aunque el entrenamiento se realizó con secuencias de hasta 25 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 124.690.944 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (entrenado con max_length=25) |
| Tipos de cuantizacion | no disponible (pesos en FP32) |
| Idiomas soportados | sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | safetensors (F32, I64) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT base, con 12 capas, 768 dimensiones de embedding y 12 cabezas de atención. Se inicializa desde CardioBERTa.sv, que a su vez es un BERT adaptado al sueco y al dominio cardiológico mediante preentrenamiento continuado con MLM sobre corpus monolingües. La especialización posterior se realiza con un objetivo de metric learning: se generan tripletas (ancla, positivo, negativo) a partir de pares de términos que comparten el mismo concepto UMLS (CUI), enriquecidas con relaciones ontológicas de nivel "padre" (padre del CUI). Se usan 1.024.243 tripletas que cubren 398.217 CUIS y 389.241 términos únicos. El entrenamiento emplea Multi-Similarity Loss, minería de todas las tripletas con margen 0,2, pooling de la capa CLS, 1 época, tamaño de batch 256, tasa de aprendizaje 2e-5 y longitud máxima de 25 tokens. La terminología de entrenamiento no se distribuye con el modelo por restricciones de licencia de UMLS.

## Capacidades

- Normalización de conceptos clínicos: mapea términos en sueco (incluidos términos cardiológicos) a conceptos UMLS estandarizados (CUIS).
- Entity linking: vincula menciones en texto clínico a conceptos normalizados, útil para extracción de información estructurada.
- Recuperación de candidatos (candidate retrieval): genera embeddings de términos que permiten búsqueda por similitud en un espacio vectorial.
- Embeddings de terminología: produce vectores densos normalizados (L2) para términos o frases cortas.
- Soporte de texto en sueco: entrenado específicamente para este idioma, con vocabulario y dominio biomédico.
- No soporta generación de texto, tool calling ni agentes; es un modelo de representación (feature extraction).

## Casos de uso

- Normalización de diagnósticos en registros clínicos suecos: el modelo puede transformar expresiones libres (p.ej., "hjärtinfarkt") en el CUI correspondiente de UMLS, facilitando la agregación de datos para estudios epidemiológicos.
- Entity linking en textos de historias clínicas electrónicas: se integra en pipelines de NLP para anotar menciones de enfermedades, síntomas y procedimientos con identificadores estándar, mejorando la interoperabilidad.
- Búsqueda de conceptos en ontologías: dado un término coloquial o variante, el modelo recupera los conceptos UMLS más cercanos mediante similitud de coseno, acelerando la revisión manual de anotaciones.
- Enriquecimiento de terminología: los embeddings pueden usarse para agrupar términos sinónimos o relacionados en un sistema de gestión de vocabularios, detectando duplicados o variantes.
- Soporte a la integración de datos federados: al normalizar conceptos en sueco, el modelo permite armonizar datos de múltiples centros dentro de la plataforma DataTools4Heart, que trabaja con análisis federado y preservación de privacidad.
- Preprocesamiento para sistemas de recomendación clínica: los embeddings de conceptos pueden alimentar sistemas de recomendación de tratamientos o de análisis de cohortes en el dominio cardiológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124 millones de parámetros × 4 bytes). En FP16 se reduce a ~0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso CPU es viable para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como GTX 1650, RTX 3060, etc.
- Opciones de despliegue: se puede usar con la librería transformers (AutoModel) en Python, o con servidores de embedding compatibles con la API de Hugging Face (text-embeddings-inference). No se recomienda vLLM porque no es un modelo generativo.
- Latencia y throughput: no se disponen de mediciones publicadas; para un modelo de 124 M parámetros, la latencia por secuencia corta (25 tokens) es del orden de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (encoders de terminología biomédica en sueco). Como referencia, el modelo base CardioBERTa.sv tiene la misma arquitectura y parámetros, pero sin la especialización en normalización de conceptos. Otros modelos como SapBERT (para inglés) o BioBERT no cubren sueco ni el enfoque de entity linking con tripletas UMLS. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Entrenado solo en sueco: no funciona correctamente en otros idiomas.
- No apto para decisiones clínicas directas: la model card indica explícitamente que no se debe usar para diagnóstico o tratamiento.
- Longitud de entrada limitada: aunque la ventana del modelo BERT es de 512 tokens, el entrenamiento se hizo con 25 tokens; los términos más largos pueden no representarse bien.
- Riesgo de alucinación en conceptos fuera de la terminología de entrenamiento: los embeddings pueden dar falsos positivos en la recuperación de conceptos para términos no vistos.
- La terminología de entrenamiento no se distribuye, lo que limita la reproducibilidad del proceso de especialización.
- Licencia no especificada: no se indica si el uso comercial está permitido; hay que contactar con DT4H para aclararlo.
- Dependencia de UMLS: el modelo se basa en conceptos UMLS, cuyas restricciones de licencia pueden afectar al uso del modelo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.sv_P_only_snomed
- Modelo base: https://huggingface.co/DT4H/CardioBERTa.sv
- Organización DataTools4Heart: https://huggingface.co/DT4H
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- GitHub del proyecto: https://github.com/DataTools4Heart/
