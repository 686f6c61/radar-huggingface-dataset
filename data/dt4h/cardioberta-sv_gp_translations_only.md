# DT4H/CardioBERTa.sv_GP_translations_only

## Resumen

CardioBERTa.sv_GP_translations_only es un encoder de terminología biomédica en sueco desarrollado por el proyecto DataTools4Heart (DT4H) para la normalización de conceptos clínicos y el entity linking, con especial enfoque en el dominio de la cardiología. El modelo se inicializa desde CardioBERTa.sv, un modelo BERT adaptado al sueco mediante preentrenamiento continuado con MLM sobre corpus biomédicos y cardiológicos, y se especializa posteriormente mediante aprendizaje métrico supervisado por conceptos UMLS (CUI). Con 124,7 millones de parámetros, está diseñado para generar embeddings de términos y conceptos médicos en un espacio vectorial donde los sinónimos y términos relacionados quedan próximos, lo que permite la recuperación de candidatos y la asignación de códigos UMLS en pipelines de procesamiento de lenguaje natural clínico. Su relevancia radica en cubrir la escasez de recursos lingüísticos biomédicos para el sueco y en facilitar la interoperabilidad de datos clínicos dentro del proyecto europeo DT4H.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 124.690.944 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (maxima longitud de entrenamiento: 25 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura BERT estándar, con 12 capas, 768 dimensiones de ocultas y 12 cabezas de atención, configurada para la extracción de características (feature extraction). El backbone CardioBERTa.sv fue adaptado al dominio de cardiología mediante preentrenamiento continuado con Masked Language Modeling sobre corpus monolingües en sueco de contenido biomédico y cardiológico. Sobre esta base, el modelo se entrenó con tripletas CUI-supervisadas siguiendo la estrategia "grandparents", que amplía las relaciones de sinonimia con relaciones ontológicas de nivel de abuelo. El objetivo de entrenamiento fue Multi-Similarity Loss con minería de todas las tripletas, margen 0.2, pooling CLS, 1 época, batch size 256, learning rate 2e-5 y longitud máxima de 25 tokens. En total se usaron 4.725.159 tripletas que cubren 476.971 CUIs y 531.556 términos normalizados únicos. La terminología de entrenamiento no se distribuye con el repositorio por restricciones de licencia UMLS; solo se publican estadísticas agregadas.

## Capacidades
- Generación de embeddings de términos biomédicos y clínicos en sueco, normalizados y con pooling CLS.
- Recuperación de candidatos y concept normalization: mapeo de términos libres a conceptos UMLS (CUI) mediante similitud coseno en el espacio de embeddings.
- Entity linking para el dominio de cardiología: identificación de entidades clínicas y su vinculación a códigos estructurados.
- Soporte de relaciones semánticas de tipo padre y abuelo en ontologías, lo que mejora la generalización a términos no vistos.
- No es un modelo generativo: no genera texto ni código, solo produce representaciones vectoriales de entrada.
- No dispone de tool calling ni capacidades de agente; su uso es puramente de codificación.

## Casos de uso
- Normalización de conceptos en informes clínicos suecos: el modelo puede convertir términos libres de ecocardiogramas o electrocardiogramas en códigos UMLS estandarizados, facilitando la interoperabilidad entre hospitales europeos.
- Búsqueda semántica en historias clínicas electrónicas: permite recuperar pacientes o registros que contengan conceptos equivalentes aunque estén redactados con sinónimos distintos, gracias a la proximidad de embeddings.
- Pipeline de entity linking en cardiología: integrado como módulo de candidate retrieval dentro de un sistema de reconocimiento de entidades clínicas, reduciendo el espacio de búsqueda a los CUIs más plausibles antes de una clasificación final.
- Enriquecimiento de bases de datos biomédicas: puede asignar conceptos UMLS a términos suecos extraídos de literatura científica o ensayos clínicos, facilitando la curación manual.
- Soporte multilingüe federado en el proyecto DT4H: alineado con modelos de otros idiomas de la familia CardioBERTa, permite normalizar conceptos en sueco y cruzarlos con otras lenguas europeas dentro de la plataforma federada de cardiología.
- Entrenamiento de clasificadores clínicos: los embeddings generados pueden usarse como características de entrada para modelos de clasificación de diagnóstico o de detección de eventos adversos, reduciendo la necesidad de anotaciones manuales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0.5 GB en FP32 (124M parámetros), menos de 0.25 GB con cuantización a int8 si estuviera disponible.
- GPU recomendada: cualquier GPU consumer con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o incluso CPU.
- Cabe en GPU consumer: sí, es un modelo pequeño que se puede ejecutar en equipos modestos.
- Opciones de despliegue: compatible con la librería transformers de Hugging Face y con Text Embeddings Inference (TEI) para endpoints de producción; se puede usar con ONNX Runtime o TensorRT para optimización.
- Latencia estimada: en CPU de gama media, la inferencia de una secuencia de 25 tokens tarda aproximadamente 5-10 ms; en GPU (RTX 3060) el tiempo se reduce a 1-2 ms. El throughput típico con TEI es de varios miles de embeddings por segundo en GPU.

## Comparativa con modelos similares
No se dispone de comparativas publicadas entre este modelo y otros encoders biomédicos suecos o multilingües. Se puede mencionar que, dentro de la familia CardioBERTa, existen variantes para checo, neerlandés, inglés, italiano, rumano, español y sueco, todas con la misma arquitectura y tamaño de parámetros, pero no hay datos comparativos de rendimiento. En el ámbito de los encoders biomédicos, modelos como BioBERT (inglés) o SapBERT (multilingüe) podrían ser alternativas conceptuales, pero no se han publicado comparativas con este modelo concreto.

## Limitaciones y advertencias
- El modelo no está diseñado para la toma de decisiones clínicas directas; debe usarse solo como componente de investigación o de apoyo en pipelines de NLP.
- La terminología de entrenamiento no se distribuye por restricciones de licencia UMLS, lo que limita la reproducibilidad completa del entrenamiento.
- La longitud máxima de entrenamiento es de 25 tokens, por lo que términos o frases más largas pueden truncarse y perder información.
- El modelo solo soporta sueco; no es aplicable a otros idiomas sin adaptación.
- Riesgo de alucinación en el mapeo de conceptos: puede asignar un CUI incorrecto a términos ambiguos o fuera de dominio, especialmente en conceptos no cardiológicos.
- Sesgos potenciales derivados de los corpus de preentrenamiento, que pueden subrepresentar ciertas poblaciones o variedades del sueco.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial; se recomienda contactar con el proyecto DT4H antes de desplegarlo en producción.
- No se publican benchmarks, por lo que el rendimiento comparativo con otros sistemas de entity linking no está validado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.sv_GP_translations_only
- Modelo base CardioBERTa.sv: https://huggingface.co/DT4H/CardioBERTa.sv
- Organización DT4H en Hugging Face: https://huggingface.co/datasets/DT4H/
- Repositorio GitHub del proyecto DataTools4Heart: https://github.com/DataTools4Heart/
- Sitio web del proyecto: https://www.datatools4heart.eu/
