# DT4H/cardio-ner-it-procedure-cardioberta-multiclass

## Resumen

El modelo `cardio-ner-it-procedure-cardioberta-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de procedimientos médicos en textos clínicos de cardiología escritos en italiano. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto europeo centrado en la creación de herramientas de inteligencia artificial para el análisis de datos cardiológicos con preservación de la privacidad. El modelo se basa en `CardioBERTa.it`, un transformer preentrenado específicamente para el dominio biomédico y cardiológico en italiano, y se ha ajustado mediante fine-tuning para la clasificación de spans con etiquetado IOB.

Con 109 millones de parámetros, este modelo está diseñado para identificar exclusivamente la entidad `PROCEDURE` (procedimientos como angioplastias, cateterismos, etc.) en informes clínicos, historiales y notas médicas. Su relevancia radica en que permite extraer información estructurada de textos no estructurados, un paso clave para la reutilización de datos clínicos en investigación y en sistemas de apoyo a la decisión. El checkpoint publicado es el resultado de un promedio de pesos de 10 modelos entrenados mediante validación cruzada sobre el corpus CardioCCC, lo que aporta robustez y estabilidad al modelo final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en BERT, variante CardioBERTa.it) |
| Parametros totales | 109.339.395 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se recomienda usar stride para textos largos) |
| Tipos de cuantizacion | no disponible (formato safetensors original) |
| Idiomas soportados | Italiano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `CardioBERTa.it`, un transformer encoder basado en la arquitectura BERT adaptada al dominio clínico cardiológico en italiano. Sobre esta base se ha realizado un fine-tuning para la tarea de clasificación de spans (span classification) con etiquetado IOB (Inside, Outside, Beginning), prediciendo únicamente la entidad `PROCEDURE`. El entrenamiento se llevó a cabo mediante 10-fold cross-validation sobre la parte italiana del corpus CardioCCC (DataTools4Heart Cardiology Clinical Case Corpus), concretamente los batches 1 y 2, con 508 documentos en su versión `1_validated_without_sugs`. El checkpoint publicado es la media aritmética de los pesos de los 10 modelos entrenados en cada fold, una técnica de weight-averaging que mejora la generalización. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que se trata de un ajuste supervisado clásico.

## Capacidades

- Detección de entidades de tipo `PROCEDURE` en texto clínico de cardiología en italiano.
- Clasificación de spans con etiquetado IOB, devolviendo el inicio y fin de cada entidad.
- Integración sencilla con la librería `transformers` mediante el pipeline de token-classification.
- Soporte para textos largos mediante el uso de ventanas deslizantes (stride).
- Modelo multiclase de una sola entidad, optimizado para precisión en el dominio cardiológico.
- Compatible con `trust_remote_code=True` para cargar el código personalizado del autor.
- No incluye capacidades de generación de texto, tool calling, agentes ni visión; es exclusivamente un extractor de entidades.

## Casos de uso

- Extracción de procedimientos en informes de alta hospitalaria: el modelo identifica automáticamente los procedimientos cardiológicos mencionados (p. ej., "angioplastia coronaria", "implantación de stent") en informes de pacientes, facilitando la codificación y el análisis retrospectivo.
- Construcción de bases de datos clínicas estructuradas: a partir de textos no estructurados, se pueden poblar campos específicos de procedimientos en registros electrónicos de salud, mejorando la interoperabilidad.
- Anonimización selectiva de datos: al localizar los procedimientos, se pueden enmascarar o eliminar esas menciones en documentos compartidos para cumplir normativas de privacidad.
- Investigación epidemiológica: permite analizar grandes volúmenes de historiales clínicos en italiano para estudiar la frecuencia y distribución de procedimientos cardiológicos sin intervención manual.
- Soporte a sistemas de codificación automática (p. ej., ICD-9/10): el modelo puede pre-etiquetar los procedimientos para que un sistema posterior los asigne a códigos estandarizados, reduciendo el trabajo de los codificadores.
- Integración en pipelines de procesamiento de lenguaje natural clínico: se puede combinar con otros modelos NER (p. ej., para medicamentos o síntomas) para obtener una visión completa del contenido de un documento clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall o F1 sobre el corpus CardioCCC, ni comparaciones con otros modelos. Se recomienda consultar el repositorio GitHub de CardioNER para posibles evaluaciones adicionales.

## Requisitos de hardware

- Al tratarse de un modelo de 109 millones de parámetros, su huella de memoria es reducida: en FP32 ocupa aproximadamente 440 MB, en FP16 unos 220 MB y en int8 alrededor de 110 MB.
- Es ejecutable en GPUs de consumo como la serie NVIDIA RTX 3060, 4060 o superiores, así como en GPUs de datacenter como A10, T4 o V100.
- También puede ejecutarse en CPU, aunque con mayor latencia; para inferencia en tiempo real se recomienda GPU.
- El despliegue puede realizarse con librerías estándar como `transformers` (pipeline de token-classification), o mediante servidores de inferencia como Hugging Face Inference Endpoints, vLLM (aunque está más orientado a generación) o TGI. Dado que es un modelo encoder, también es compatible con frameworks como ONNX Runtime para optimización.
- La latencia estimada en GPU es del orden de milisegundos por documento corto, aunque no se dispone de cifras exactas.

## Comparativa con modelos similares

| Modelo | Idioma | Entidad | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cardio-ner-it-procedure-cardioberta-multiclass (este) | Italiano | PROCEDURE | 109M | MIT | Hugging Face |
| cardio-ner-es-procedure-cardioberta-multiclass | Español | PROCEDURE | no disponible | MIT | Hugging Face |
| es-procedure-cardioberta-multiclass-ner | Español | PROCEDURE | no disponible | MIT | Hugging Face |

Los tres modelos comparten la misma arquitectura base (CardioBERTa) y el mismo enfoque de clasificación de spans, diferenciándose únicamente en el idioma. No se dispone de datos comparativos de rendimiento entre ellos. Otros modelos NER clínicos en italiano, como los basados en BioBERT o en modelos multilingües, podrían ser alternativas, pero no se han encontrado comparaciones directas en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el idioma italiano y para el dominio de la cardiología; su rendimiento en otros idiomas o especialidades médicas será deficiente.
- Solo reconoce la entidad `PROCEDURE`; no detecta medicamentos, síntomas, diagnósticos u otras entidades clínicas.
- Al ser un modelo de clasificación de spans, puede cometer errores de segmentación o etiquetado en textos con estructuras complejas o jerga no estándar.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión real en entornos clínicos.
- El uso de `trust_remote_code=True` implica ejecutar código arbitrario del repositorio; se recomienda revisar el código antes de usarlo en entornos de producción.
- La licencia MIT permite uso comercial, pero el modelo se basa en datos clínicos que pueden estar sujetos a restricciones de privacidad; el usuario es responsable de cumplir la normativa aplicable (p. ej., GDPR).
- El modelo no ha sido evaluado en tareas de generación de texto ni en interacciones conversacionales; es un extractor de información, no un asistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-it-procedure-cardioberta-multiclass
- Repositorio CardioNER en GitHub: https://github.com/DataTools4Heart/CardioNER
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Organización DT4H en Hugging Face: https://huggingface.co/DT4H
- Modelo base CardioBERTa.it: https://huggingface.co/DT4H/CardioBERTa.it
- Modelo equivalente en español: https://huggingface.co/DT4H/cardio-ner-es-procedure-cardioberta-multiclass
