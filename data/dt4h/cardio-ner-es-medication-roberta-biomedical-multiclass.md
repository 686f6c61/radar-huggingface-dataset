# DT4H/cardio-ner-es-medication-roberta-biomedical-multiclass

## Resumen

El modelo `DT4H/cardio-ner-es-medication-roberta-biomedical-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) de tipo multiclase, especializado en la detección de medicamentos en textos clínicos de cardiología en español. Ha sido desarrollado por el proyecto DataTools4Heart (DT4H), una iniciativa financiada por el programa Horizon Europe de la Unión Europea, cuyo objetivo es construir una plataforma federada y respetuosa con la privacidad para el análisis de datos cardiológicos. El modelo se basa en una arquitectura RoBERTa preentrenada en dominios biomédicos y se ha ajustado específicamente para la tarea de clasificación de tokens en el ámbito de la cardiología.

Con 125 millones de parámetros, el modelo se enmarca en la categoría de tamaño base, lo que lo hace viable para despliegues en entornos con recursos moderados. Su salida es una etiqueta por token, permitiendo identificar menciones de fármacos en narrativas clínicas, historiales de pacientes o literatura médica. Aunque el repositorio no especifica la longitud de contexto, la arquitectura RoBERTa base suele soportar secuencias de hasta 512 tokens, un límite razonable para la mayoría de los documentos clínicos fragmentados.

La relevancia de este modelo radica en su enfoque específico para el español, un idioma con escasez de recursos NER en el ámbito clínico, y en su integración dentro del ecosistema DT4H, que busca estandarizar y reutilizar datos cardiológicos en múltiples países europeos. Su publicación en Hugging Face con formato safetensors y compatibilidad con la biblioteca Transformers facilita su adopción en pipelines de procesamiento de lenguaje natural clínico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (base, ajustada para clasificación de tokens) |
| Parametros totales | 125.389.827 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (típico de RoBERTa base: 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Español (es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, una variante de BERT que optimiza el preentrenamiento mediante la eliminación de la predicción de la siguiente frase y el uso de máscaras dinámicas. En este caso, se parte de un checkpoint preentrenado en textos biomédicos (indicado por el sufijo "biomedical" en el nombre), lo que proporciona una base semántica adecuada para el vocabulario clínico. Sobre esta base se añade una capa de clasificación de tokens que asigna una etiqueta a cada token de la secuencia, permitiendo el reconocimiento de entidades de medicación en un contexto multiclase.

El ajuste fino se ha realizado para la tarea de token-classification, con un conjunto de datos específico de cardiología en español. No se han publicado detalles sobre el tamaño del dataset, el número de épocas, la tasa de aprendizaje o si se emplearon técnicas de aumento de datos. Tampoco se indica si se utilizó algún método de alineamiento como RLHF o DPO; el proceso se limita a un ajuste supervisado estándar. La ausencia de información sobre el preentrenamiento exacto (por ejemplo, si se partió de un modelo como `PlanTL-GOB-ES/roberta-base-biomedical-clinical-es` o similar) impide confirmar la procedencia del checkpoint base, aunque el nombre sugiere una especialización biomédica.

## Capacidades

- Reconocimiento de entidades nombradas (NER) para medicamentos en textos de cardiología en español.
- Clasificación multiclase de tokens, lo que permite distinguir diferentes tipos de entidades relacionadas con medicación (por ejemplo, nombres de fármacos, dosis, vías de administración, aunque las etiquetas exactas no están documentadas).
- Procesamiento de secuencias de hasta 512 tokens (límite típico de RoBERTa base), adecuado para párrafos o fragmentos de historias clínicas.
- Integración sencilla con la biblioteca Transformers de Hugging Face mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Compatibilidad con pipelines de NER estándar, permitiendo extraer entidades y sus posiciones en el texto.
- Soporte para español, un idioma con menos recursos en el ámbito clínico que el inglés.

## Casos de uso

- Extracción de medicamentos de historias clínicas electrónicas: el modelo puede procesar notas de consulta o informes de alta para identificar automáticamente los fármacos prescritos, facilitando la creación de bases de datos estructuradas para investigación clínica.
- Análisis de literatura científica cardiológica: permite localizar menciones de medicamentos en artículos de investigación, ayudando a revisiones sistemáticas o meta-análisis sobre tratamientos cardiovasculares.
- Monitorización de efectos adversos: al detectar nombres de medicamentos en textos de pacientes o foros de salud, se pueden correlacionar con síntomas reportados para identificar posibles reacciones adversas.
- Soporte a la codificación clínica: la identificación de entidades de medicación puede asistir en la asignación de códigos estandarizados (como ATC) en sistemas de información hospitalaria.
- Investigación en farmacoepidemiología: el modelo permite procesar grandes volúmenes de texto clínico en español para estudiar patrones de prescripción y uso de fármacos en poblaciones cardiológicas.
- Integración en pipelines de procesamiento de lenguaje natural clínico: al ser un componente NER, puede combinarse con otros módulos (extracción de relaciones, normalización de entidades) para construir sistemas de información completos sobre medicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como precisión, recall o F1 sobre conjuntos de validación o test, ni comparaciones con otros modelos NER en español o en el ámbito clínico. Tampoco se proporcionan evaluaciones sobre conjuntos de datos públicos como el Spanish Clinical NER o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 125M parámetros en FP32 ocupa aproximadamente 500 MB; en FP16, unos 250 MB. Con una secuencia de 512 tokens, el uso de memoria adicional es moderado, por lo que puede ejecutarse en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti, RTX 2060 o superior. También es viable en GPUs integradas o en CPU, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de las GPUs de consumo actuales, incluidas las de gama baja.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI (Text Generation Inference), o mediante la API de Hugging Face. Para entornos ligeros, se puede convertir a formato ONNX o usar `transformers` directamente en Python.
- Latencia y throughput estimados: no se dispone de datos concretos. En una GPU moderna (por ejemplo, RTX 3090), la inferencia para una secuencia de 512 tokens debería completarse en milisegundos, permitiendo procesar cientos de documentos por segundo. En CPU, la latencia puede ser de decenas de milisegundos por secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos. Sin embargo, se identifica un modelo hermano en checo: `DT4H/cardio-ner-cs-medication-cardioberta-multiclass`, que sigue la misma metodología pero para el idioma checo y con una base CardioBERTa. Ambos forman parte de la colección CardioNER del proyecto DT4H. No se han encontrado otros modelos NER de medicación en español con características comparables en la información proporcionada.

| Modelo | Idioma | Arquitectura | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| cardio-ner-es-medication-roberta-biomedical-multiclass | Español | RoBERTa biomédica | 125M | no disponible | no disponible |
| cardio-ner-cs-medication-cardioberta-multiclass | Checo | CardioBERTa | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado en dominios clínicos, puede reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, subrepresentación de ciertos grupos de pacientes o variaciones dialectales del español).
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, no genera texto libre, por lo que el riesgo de alucinación es bajo. Sin embargo, puede producir etiquetas incorrectas en contextos ambiguos o con terminología no vista durante el entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está especificada, pero si se basa en RoBERTa base, el límite es de 512 tokens. Documentos clínicos más largos requerirán segmentación previa.
- Limitaciones de idioma: el modelo está entrenado únicamente en español; no es adecuado para textos en otros idiomas sin adaptación.
- Restricciones de licencia: la licencia no está disponible en el repositorio, lo que impide conocer las condiciones de uso comercial o redistribución. Se recomienda contactar con los autores antes de un despliegue en producción.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido ampliamente validado por la comunidad. Se recomienda evaluar su rendimiento en un conjunto de datos propio antes de utilizarlo en entornos clínicos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-es-medication-roberta-biomedical-multiclass
- Modelo hermano en checo: https://huggingface.co/DT4H/cardio-ner-cs-medication-cardioberta-multiclass
- Colección CardioNER en Hugging Face: https://huggingface.co/collections/DT4H/cardioner
- Organización DataTools4Heart en GitHub: https://github.com/DataTools4Heart/
- Página web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Folleto informativo del proyecto (PDF): https://www.datatools4heart.eu/wp-content/uploads/2023/08/DT4H-booklet_A4-web.pdf
