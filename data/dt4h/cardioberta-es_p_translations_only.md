# DT4H/CardioBERTa.es_P_translations_only

## Resumen

`DT4H/CardioBERTa.es_P_translations_only` es un codificador de terminología biomédica en español, desarrollado por el proyecto europeo DataTools4Heart (DT4H), especializado en normalización de conceptos clínicos y entity linking. Se inicializa desde el modelo base `DT4H/CardioBERTa.es`, perteneciente a la familia CardioBERTa de CardioLM, una suite de modelos encoder multilingües adaptados al dominio de la cardiología mediante preentrenamiento continuo con enmascaramiento de lenguaje (MLM). El modelo se ajusta con pares de terminología supervisados por conceptos UMLS (CUI) y aprendizaje métrico, usando la estrategia de tripletes "parents" que enriquece las relaciones de sinonimia con relaciones ontológicas de nivel padre.

Con aproximadamente 126 millones de parámetros, es un modelo compacto orientado a tareas de recuperación de candidatos, normalización de conceptos y entity linking en pipelines de NLP clínico, particularmente en cardiología. Su relevancia actual radica en la necesidad de estandarizar y estructurar informes clínicos multilingües en Europa, y este modelo cubre específicamente el español con una ventana de contexto limitada a 25 tokens durante el entrenamiento, lo que lo hace adecuado para términos y frases cortas. No está diseñado para generación de texto ni para decisiones clínicas directas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con max_length=25) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder con atención bidireccional, adaptado al dominio cardiológico mediante preentrenamiento continuo con MLM sobre corpus biomédicos y cardiológicos en español. El ajuste fino se realiza con tripletes de terminología CUI-supervisados, donde cada triplete contiene un ancla, un positivo (término sinónimo o relacionado por ontología) y un negativo. Se emplea la estrategia "parents", que añade relaciones de nivel padre a las sinonimias, generando 1.593.029 tripletes que cubren 476.344 CUIs y 529.722 términos únicos. El entrenamiento usa Multi-Similarity Loss, minería de todos los tripletes con margen 0.2, pooling CLS, una época, batch size 256, learning rate 2e-5 y longitud máxima de 25 tokens. La terminología de entrenamiento no se distribuye por restricciones de licencia UMLS.

## Capacidades

- Generación de embeddings de terminología biomédica en español, normalizados con norma L2.
- Entity linking y normalización de conceptos clínicos a identificadores UMLS (CUI).
- Recuperación de candidatos (candidate retrieval) para términos médicos y cardiológicos.
- Búsqueda semántica de conceptos en ontologías y vocabularios controlados.
- Soporte para pipelines de extracción de información clínica, como preprocesamiento de entidades.
- Capacidad multilingüe limitada al español; no soporta otros idiomas en este modelo concreto.
- No es generativo: solo produce representaciones vectoriales (feature extraction).

## Casos de uso

- Normalización de entidades clínicas en informes de cardiología: el modelo puede mapear menciones como "infarto de miocardio" a su CUI correspondiente, facilitando la estandarización de historiales clínicos.
- Entity linking en literatura científica: permite enlazar términos de artículos biomédicos a conceptos UMLS para construir bases de conocimiento estructuradas.
- Búsqueda semántica en terminologías médicas: al generar embeddings de conceptos, se pueden recuperar términos relacionados o sinónimos en consultas de sistemas de información clínica.
- Agrupación de sinónimos en ontologías: el modelo agrupa variantes terminológicas (p. ej., "cardiopatía isquémica" vs. "enfermedad coronaria") en un mismo concepto, mejorando la consistencia de datos.
- Preprocesamiento para pipelines de NER y extracción de relaciones: los embeddings generados pueden alimentar modelos downstream para tareas de análisis de texto clínico.
- Codificación automática de diagnósticos: ayuda a asignar códigos CIE o UMLS a partir de descripciones libres en español, reduciendo trabajo manual en entornos hospitalarios.
- Soporte a sistemas de recomendación de tratamientos: al normalizar conceptos, facilita la integración de datos heterogéneos en plataformas de salud digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de razonamiento general sino a embeddings de terminología. Tampoco se reportan comparativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~126M parámetros, la inferencia con batch pequeño requiere aproximadamente 1-2 GB de VRAM en GPU, o puede ejecutarse en CPU con memoria RAM suficiente (alrededor de 2-4 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. También es viable en GPUs de datacenter como A10 o T4.
- Compatible con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: compatible con Hugging Face Transformers, text-embeddings-inference (según tags), y puede usarse con sentence-transformers para generar embeddings. También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se dispone de datos medidos, pero por su tamaño reducido, la latencia por consulta es baja (del orden de milisegundos en GPU).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. Como referencia, el modelo base `DT4H/CardioBERTa.es` es un encoder de cardiología sin ajuste para entity linking, mientras que este modelo añade la capa de terminología. Otros codificadores biomédicos en español como `BioBERT` o `ClinicalBERT` no están especializados en cardiología ni en normalización UMLS, pero no se han encontrado datos comparativos en la información disponible.

## Limitaciones y advertencias

- No está destinado a la toma de decisiones clínicas directas; su uso es exclusivamente para tareas de NLP e investigación.
- La longitud de contexto efectiva está limitada a 25 tokens durante el entrenamiento, lo que puede degradar el rendimiento con términos o frases más largas.
- La terminología de entrenamiento se basa en traducciones (translations_only), lo que puede no capturar matices del lenguaje clínico real en español.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial y redistribución.
- La terminología UMLS no se distribuye, por lo que el modelo no puede ser reentrenado con los mismos datos sin licencias adicionales.
- Posibles sesgos derivados de la fuente de terminología y de la estrategia de tripletes "parents", que pueden sobre-representar relaciones jerárquicas.
- No soporta generación de texto ni tareas de razonamiento complejo; es exclusivamente un codificador de embeddings.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/DT4H/CardioBERTa.es_P_translations_only)
- [Modelo base DT4H/CardioBERTa.es](https://huggingface.co/DT4H/CardioBERTa.es)
- [Proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [GitHub de DataTools4Heart](https://github.com/DataTools4Heart/)
- Referencia: Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain* (proyecto DT4H, Grant Agreement 101057849).
