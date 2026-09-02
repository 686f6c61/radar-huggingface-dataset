# DT4H/cardio-ner-en-symptom-cardioberta-multiclass

## Resumen

El modelo `DT4H/cardio-ner-en-symptom-cardioberta-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de síntomas en textos clínicos de cardiología en inglés. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto financiado por el programa Horizon Europe de la Unión Europea (acuerdo de subvención nº 101057849) cuyo objetivo es construir una plataforma federada y respetuosa con la privacidad para el análisis de datos cardiovasculares.

El modelo se basa en CardioBERTa, una variante de la arquitectura RoBERTa preentrenada con corpus clínicos, y ha sido ajustado específicamente para la clasificación de spans con etiquetado IOB (Inside, Outside, Beginning). Con aproximadamente 124,6 millones de parámetros, corresponde a un modelo de tamaño base, lo que lo hace ligero y adecuado para su integración en pipelines de procesamiento de lenguaje natural en entornos sanitarios. Su creación se registró en septiembre de 2026 y está disponible en formato safetensors.

La relevancia de este modelo radica en su capacidad para extraer de forma automática menciones de síntomas de informes médicos, historiales clínicos electrónicos o notas de consulta, facilitando tareas posteriores como el análisis de cohortes, la vigilancia epidemiológica o la investigación clínica. Al estar especializado en el dominio cardiológico, supera las limitaciones de los modelos NER genéricos cuando se aplican a terminología médica específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-based, CardioBERTa) |
| Parametros totales | 124.647.939 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512, no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un transformer encoder basado en RoBERTa, concretamente la variante CardioBERTa, preentrenada con textos clínicos en inglés. Sobre esta base se ha realizado un ajuste fino (fine-tuning) para la tarea de clasificación de tokens (token-classification) con el objetivo de identificar menciones de síntomas en el dominio de la cardiología. El etiquetado emplea el esquema IOB, donde cada token se clasifica como inicio de entidad (B), interior de entidad (I) o fuera de entidad (O).

No se han proporcionado detalles específicos sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. Dado que se trata de un modelo NER supervisado, se asume que el entrenamiento se realizó con datos clínicos anotados, probablemente extraídos de historiales y literatura cardiológica. Tampoco se mencionan innovaciones técnicas adicionales más allá del ajuste específico sobre el dominio.

## Capacidades

- Reconocimiento de entidades nombradas para síntomas en textos clínicos de cardiología en inglés.
- Clasificación de tokens mediante etiquetado IOB, permitiendo la extracción de menciones de síntomas con precisión a nivel de token.
- Procesamiento de texto clínico no estructurado, como notas de consulta, informes de alta o registros electrónicos de salud.
- Integración sencilla con la biblioteca `transformers` de Hugging Face mediante `AutoModelForTokenClassification`.
- Capacidad multilingüe limitada: el modelo está entrenado exclusivamente en inglés, sin soporte documentado para otros idiomas.
- No se indica soporte para tool calling, agentes o razonamiento multi-paso; su función es exclusivamente de extracción de entidades.

## Casos de uso

- Extracción de síntomas de historiales clínicos electrónicos: el modelo puede procesar automáticamente notas médicas para identificar menciones de síntomas como dolor torácico, disnea o palpitaciones, facilitando la creación de bases de datos estructuradas para investigación.
- Análisis de ensayos clínicos en cardiología: permite cribar documentos de ensayos para extraer criterios de inclusión basados en síntomas, agilizando la revisión sistemática.
- Vigilancia epidemiológica de enfermedades cardiovasculares: al detectar síntomas en grandes volúmenes de informes, puede apoyar la monitorización de tendencias de salud pública.
- Soporte a la codificación médica: asiste en la asignación de códigos CIE (Clasificación Internacional de Enfermedades) al identificar síntomas relevantes en el texto clínico.
- Construcción de cohortes de pacientes para estudios retrospectivos: el modelo permite seleccionar automáticamente pacientes que presentan ciertos síntomas, reduciendo el esfuerzo manual.
- Mejora de la interoperabilidad de datos sanitarios: al estandarizar la extracción de síntomas, facilita el intercambio y la reutilización de datos entre distintas instituciones bajo el marco federado de DT4H.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de datos estándar (p. ej., i2b2, MedMentions) ni comparaciones cuantitativas con otros modelos NER clínicos.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 124,6 millones de parámetros, su huella de memoria es reducida. En precisión FP32, los pesos ocupan unos 500 MB; con cuantización a 8 bits, se reduce a unos 125 MB.
- Es viable ejecutarlo en GPUs de consumo como una NVIDIA RTX 3060 (12 GB VRAM) o incluso en CPU, aunque con mayor latencia.
- No se han especificado requisitos oficiales de hardware por parte de los desarrolladores.
- Para despliegue en producción, se puede servir mediante librerías como Hugging Face Inference Endpoints, vLLM o TGI, aunque al ser un modelo encoder, también es compatible con `transformers` en modo batch.
- La latencia típica para inferencia en GPU es del orden de milisegundos por secuencia (dependiendo de la longitud), y en CPU puede ser de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de una comparativa cuantitativa publicada. No obstante, se pueden citar alternativas cualitativas en el ámbito de NER clínico:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DT4H/cardio-ner-en-symptom-cardioberta-multiclass | RoBERTa (CardioBERTa) | 124,6M | no disponible | no disponible | Hugging Face |
| BioBERT (base) | BERT | 110M | 512 | MIT | Hugging Face |
| ClinicalBERT (base) | BERT | 110M | 512 | MIT | Hugging Face |
| PubMedBERT (base) | BERT | 110M | 512 | MIT | Hugging Face |

Estos modelos son referencias habituales para NER biomédico, pero no se han comparado directamente con el modelo DT4H en los documentos disponibles.

## Limitaciones y advertencias

- Sesgos potenciales: al estar entrenado con datos clínicos, puede reflejar sesgos presentes en la práctica médica o en la documentación histórica, como infrarrepresentación de ciertos grupos poblacionales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar etiquetas incorrectas o identificar entidades que no corresponden a síntomas reales, especialmente en textos ambiguos o con errores ortográficos.
- Limitaciones de idioma: solo soporta inglés; su uso en otros idiomas requeriría un reentrenamiento o adaptación.
- Longitud de contexto no confirmada: aunque se asume 512 tokens por la arquitectura RoBERTa, no se ha documentado explícitamente; secuencias más largas podrían truncarse.
- Licencia no especificada: no se indica la licencia de uso, lo que genera incertidumbre sobre restricciones comerciales o de redistribución.
- Sin información sobre datos de entrenamiento: no se detalla la procedencia ni el volumen de los datos clínicos utilizados, lo que dificulta evaluar posibles problemas de privacidad o sesgos.
- No apto para uso clínico sin supervisión: el modelo es una herramienta de investigación y no debe utilizarse como único criterio para decisiones médicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-en-symptom-cardioberta-multiclass
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Organización GitHub de DT4H: https://github.com/DataTools4Heart/
- Repositorio de código para NER multilingüe (nlp4bia-bsc): https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER/tree/main/
- Modelo similar en italiano: https://huggingface.co/DT4H/cardio-ner-it-symptom-cardioberta-multiclass
