# DT4H/cardio-ner-en-procedure-biomed-roberta-base-multiclass

## Resumen

El modelo `DT4H/cardio-ner-en-procedure-biomed-roberta-base-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) diseñado específicamente para identificar procedimientos en textos clínicos de cardiología en inglés. Ha sido desarrollado por el consorcio DT4H (DataTools4Heart), un proyecto financiado por el programa Horizon Europe de la Unión Europea, con el objetivo de facilitar el análisis automatizado de historias clínicas electrónicas y literatura médica en el ámbito cardiovascular.

El modelo se basa en BioMed-RoBERTa-base, una adaptación de RoBERTa-base preentrenada exclusivamente sobre literatura biomédica por el Allen Institute for AI. Sobre esta base se ha realizado un ajuste fino (fine-tuning) para la tarea de clasificación de tokens, lo que permite etiquetar cada token de un texto como parte de una entidad de tipo procedimiento (por ejemplo, "angioplastia", "cateterismo", "bypass"). Con 124,6 millones de parámetros, se sitúa en la gama de modelos encoder de tamaño medio, adecuado para despliegue en entornos con recursos computacionales moderados.

La relevancia de este modelo radica en su especialización: mientras que los modelos NER clínicos genéricos suelen cubrir múltiples categorías (enfermedades, medicamentos, síntomas), esta variante se centra exclusivamente en procedimientos, lo que puede mejorar la precisión en tareas donde esta categoría es la prioritaria, como la codificación clínica o la extracción de información para ensayos clínicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (BioMed-RoBERTa) con cabeza de clasificación de tokens |
| Parametros totales | 124.647.939 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (típico de RoBERTa-base: 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BioMed-RoBERTa-base, que a su vez es una variante de RoBERTa-base preentrenada sobre un corpus de literatura biomédica (PubMed y artículos de acceso abierto). La arquitectura es un transformer encoder con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, configurada para la tarea de clasificación de tokens. Sobre esta base se añade una capa de clasificación que asigna a cada token una etiqueta de entidad (probablemente en formato BIO: B-procedure, I-procedure, O).

No se han publicado detalles sobre el dataset de entrenamiento específico para el ajuste fino, ni el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. El framework declarado es PyTorch, y el modelo se carga mediante la API estándar de Hugging Face (`AutoModelForTokenClassification`). La ausencia de información sobre el proceso de entrenamiento limita la reproducibilidad, aunque el código de uso es sencillo y directo.

## Capacidades

- Reconocimiento de entidades nombradas (NER) para procedimientos médicos en textos de cardiología en inglés.
- Clasificación de tokens a nivel de palabra, permitiendo identificar menciones de procedimientos en oraciones completas.
- Especialización en el dominio cardiológico, lo que puede mejorar la precisión frente a modelos NER clínicos genéricos.
- Integración sencilla con el ecosistema Hugging Face Transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- No se han documentado capacidades adicionales como generación de texto, tool calling, soporte de agentes o procesamiento multimodal.

## Casos de uso

- Extracción de procedimientos de informes de alta hospitalaria: el modelo puede procesar automáticamente informes de pacientes cardiológicos y extraer menciones de procedimientos como "angioplastia coronaria", "implante de marcapasos" o "revascularización", facilitando la creación de bases de datos estructuradas.
- Codificación clínica automatizada: en entornos hospitalarios, la identificación de procedimientos es un paso previo a la asignación de códigos CIE-10 o CPT; este modelo puede reducir el trabajo manual de los codificadores.
- Minería de literatura científica: los investigadores pueden aplicar el modelo a abstracts de artículos de cardiología para identificar qué procedimientos se mencionan, apoyando revisiones sistemáticas o meta-análisis.
- Soporte a sistemas de decisión clínica: al extraer procedimientos de la historia clínica, el modelo puede alimentar sistemas que sugieran protocolos de seguimiento o alerten sobre intervenciones previas.
- Análisis de cohortes para ensayos clínicos: permite filtrar pacientes según los procedimientos que se les han realizado, ayudando a seleccionar poblaciones de estudio.
- Normalización de terminología: aunque el modelo no normaliza directamente, las entidades extraídas pueden mapearse posteriormente a vocabularios estándar como SNOMED-CT o UMLS, mejorando la interoperabilidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como precisión, recall o F1 sobre conjuntos de datos estándar (p. ej., i2b2, MIMIC) ni comparaciones con otros modelos NER clínicos. Se recomienda evaluar el modelo en el corpus de interés antes de su uso en producción.

## Requisitos de hardware

- Tamaño del modelo: 124,6 millones de parámetros, lo que equivale a aproximadamente 500 MB en FP32, 250 MB en FP16 y unos 125 MB en cuantización de 8 bits.
- VRAM estimada: para inferencia en FP16, se necesitan al menos 1-2 GB de VRAM, dependiendo del tamaño del lote y la longitud de los textos. Con cuantización a 8 bits, puede caber en GPUs con 1 GB o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060, RTX 4090) es suficiente. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo encoder, se puede servir con Hugging Face Transformers, ONNX Runtime, TensorRT o mediante contenedores Docker. No es adecuado para vLLM o llama.cpp, orientados a modelos generativos.
- Latencia y throughput: no disponibles. En una GPU media, la inferencia sobre un texto de 512 tokens suele completarse en decenas de milisegundos, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Categorías NER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DT4H/cardio-ner-en-procedure-biomed-roberta-base-multiclass | 124,6 M | no disponible | Procedimientos | no disponible | Hugging Face |
| DT4H/cardio-ner-en-biomed-roberta-base-multiclass | 124,6 M (estimado) | no disponible | Enfermedades, medicación, procedimientos, síntomas | no disponible | Hugging Face |
| DT4H/cardio-ner-en-biomed-roberta-base-multilabel | 124,6 M (estimado) | no disponible | Enfermedades, medicación, procedimientos, síntomas (multilabel) | no disponible | Hugging Face |
| BioMed-RoBERTa-base (sin ajuste fino) | 124,6 M | 512 | No específico para NER | Apache 2.0 | Hugging Face |

Los dos modelos hermanos del mismo autor cubren un espectro más amplio de entidades, mientras que este se centra únicamente en procedimientos. BioMed-RoBERTa-base es el modelo base sin ajuste fino, que requiere entrenamiento adicional para tareas específicas. No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- Solo soporta inglés; no es aplicable a textos en otros idiomas sin un nuevo ajuste fino.
- Especializado en cardiología; su rendimiento en otros dominios médicos (oncología, neurología) probablemente sea inferior.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión, recall o F1 en datos reales.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o la redistribución.
- No se han documentado los datos de entrenamiento, lo que impide evaluar posibles sesgos (p. ej., sobrerrepresentación de ciertos tipos de procedimientos o de poblaciones específicas).
- Riesgo de alucinación: como todo modelo NER, puede etiquetar tokens como procedimientos cuando no lo son, especialmente en textos con terminología ambigua.
- El contexto máximo no se ha confirmado; si se hereda de RoBERTa-base, es de 512 tokens, lo que limita el procesamiento de documentos largos sin truncamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-en-procedure-biomed-roberta-base-multiclass
- Repositorio GitHub del proyecto DT4H NER: https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
- Página de BioMed-RoBERTa en OpenPHR: https://openphr.org/models/biomed-roberta.html
- Paper del taller SMM4H-HeaRD 2026 (sistema DT4H): https://aclanthology.org/2026.smm4h-1.14.pdf
