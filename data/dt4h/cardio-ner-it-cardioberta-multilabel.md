# DT4H/cardio-ner-it-cardioberta-multilabel

## Resumen

El modelo `DT4H/cardio-ner-it-cardioberta-multilabel` es un sistema de reconocimiento de entidades nombradas (NER) de ámbito clínico especializado en cardiología y entrenado exclusivamente para texto en italiano. Ha sido desarrollado por el proyecto DataTools4Heart (DT4H) como parte de la colección CardioNER, que aborda la extracción de información estructurada a partir de historiales clínicos cardiológicos. Se trata de un ajuste fino (finetune) del modelo lingüístico biomédico CardioBERTa.it, también publicado por DT4H, y está diseñado para la clasificación de tramos de texto (span classification) con etiquetado IOB.

El modelo resuelve el problema de identificar de forma automática cuatro tipos de entidades en informes clínicos cardiológicos italianos: enfermedades (DISEASE), medicamentos (MEDICATION), procedimientos (PROCEDURE) y síntomas (SYMPTOM). Su carácter multilabel permite que un mismo token pertenezca a varias categorías simultáneamente, lo que refleja la complejidad del lenguaje clínico real. Con aproximadamente 110 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que facilita su integración en entornos hospitalarios o de investigación con recursos limitados. Su relevancia actual radica en la creciente necesidad de automatizar la codificación y el análisis de datos clínicos no estructurados, especialmente en el ámbito cardiovascular, donde la interoperabilidad y la reutilización de datos son prioritarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tipo BERT, basado en CardioBERTa.it) |
| Parametros totales | 109.934.601 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Italiano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de CardioBERTa.it, un modelo de lenguaje preentrenado específico para el dominio biomédico en italiano, y se ajusta mediante aprendizaje supervisado para la tarea de clasificación de tramos con etiquetado IOB (Inside-Outside-Beginning). La arquitectura subyacente es un transformer encoder de tipo BERT, aunque la documentación no especifica detalles concretos como el número de capas o cabezas de atención. El entrenamiento se realizó sobre la porción italiana del corpus CardioCCC (Cardiology Clinical Case Corpus), concretamente los lotes 1 y 2, con un total de 508 documentos clínicos. Se empleó una validación cruzada de 10 particiones, y el checkpoint publicado corresponde a la media aritmética de los 10 modelos resultantes, una técnica de promediado de pesos descrita en el artículo CardioLM. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es puramente supervisado para la tarea de NER.

## Capacidades

- Reconocimiento de entidades clínicas en texto cardiológico italiano: enfermedades, medicamentos, procedimientos y síntomas.
- Clasificación multilabel por token, lo que permite que una misma entidad pertenezca a varias categorías (por ejemplo, un término que sea a la vez síntoma y enfermedad).
- Salida con etiquetado IOB, compatible con pipelines estándar de Hugging Face para token-classification.
- Soporte para textos largos mediante ventana deslizante (stride) en la inferencia, aunque la longitud máxima de secuencia no está documentada.
- Integración sencilla con la librería `transformers` mediante la clase `pipeline` de NER.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un extractor de entidades.

## Casos de uso

- Extracción de entidades de informes de alta hospitalaria cardiológica: el modelo puede procesar automáticamente los textos de los informes para identificar diagnósticos, fármacos prescritos, procedimientos realizados y síntomas reportados, facilitando la creación de bases de datos estructuradas.
- Codificación clínica asistida: al detectar las entidades, el modelo puede alimentar sistemas de codificación automática (p. ej., CIE-10) reduciendo el trabajo manual de los codificadores.
- Investigación retrospectiva en cardiología: permite analizar grandes volúmenes de historiales clínicos para estudios epidemiológicos o de efectividad terapéutica, extrayendo variables de interés de forma consistente.
- Soporte a ensayos clínicos: ayuda a seleccionar pacientes candidatos mediante la identificación de criterios de inclusión/exclusión expresados en texto libre.
- Monitorización de seguridad farmacológica: detección de eventos adversos o síntomas asociados a medicamentos en notas clínicas, contribuyendo a la farmacovigilancia.
- Integración en sistemas de historia clínica electrónica: como módulo de procesamiento de lenguaje natural para enriquecer los registros con metadatos semánticos, mejorando la búsqueda y la interoperabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el entrenamiento se evaluó mediante validación cruzada de 10 particiones sobre el corpus CardioCCC, pero no se proporcionan métricas concretas (F1, precisión, recall) ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 110 millones de parámetros, su huella de memoria es reducida: en precisión fp32, los pesos ocupan unos 440 MB, y en cuantización de 8 bits se reduciría a unos 110 MB.
- Puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños, aunque la velocidad será moderada.
- Cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp32; una GPU consumer como una NVIDIA GTX 1060 o superior es más que adecuada.
- Para despliegue en producción, se recomienda usar `transformers` con PyTorch, o servidores de inferencia como vLLM o TGI, aunque al ser un modelo de encoder, la opción más habitual es la integración directa en pipelines de Python.
- También es posible exportar a ONNX para optimizar la inferencia en entornos sin GPU.
- No se dispone de datos de latencia o throughput medidos; en una GPU moderna, la inferencia sobre un texto de 512 tokens debería completarse en decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Idioma | Parametros | Contexto | Licencia | Tarea |
|---|---|---|---|---|---|
| DT4H/cardio-ner-it-cardioberta-multilabel | Italiano | 110M | no disponible | MIT | NER cardiológico multilabel |
| DT4H/cardio-ner-multilingual-xlm-roberta-large-multilabel | Multilingue | 560M (aprox.) | no disponible | no disponible | NER cardiológico multilabel |
| DT4H/cardio-ner-cs-cardioberta-multilabel | Checo | 110M (aprox.) | no disponible | no disponible | NER cardiológico multilabel |

La comparativa se limita a otros modelos de la misma colección CardioNER. El modelo italiano es específico para un solo idioma, mientras que el multilingüe cubre varios idiomas a costa de un mayor tamaño. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con texto clínico cardiológico en italiano; su rendimiento en otros idiomas o dominios médicos será muy deficiente.
- La longitud de contexto no está documentada, pero al ser un modelo tipo BERT es probable que esté limitada a 512 tokens; para textos más largos se requiere usar ventanas deslizantes, lo que puede afectar a la coherencia de las entidades.
- Al ser un modelo de NER, no genera texto ni razona; solo extrae entidades predefinidas.
- Existe riesgo de alucinación en la detección de entidades, especialmente en textos con terminología ambigua o poco frecuente; se recomienda supervisión humana en aplicaciones clínicas.
- El modelo puede reflejar sesgos presentes en los datos de entrenamiento, como sobrerrepresentación de ciertos tratamientos o subrepresentación de poblaciones específicas.
- Aunque la licencia es MIT y permite uso comercial, el uso en entornos clínicos reales debe cumplir con la normativa de protección de datos (p. ej., GDPR) y no debe utilizarse como único criterio para decisiones médicas.
- No se han publicado métricas de evaluación detalladas, por lo que su rendimiento real en producción no está cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-it-cardioberta-multilabel
- Colección CardioNER: https://huggingface.co/collections/DT4H/cardioner
- Repositorio GitHub de CardioNER: https://github.com/DataTools4Heart/CardioNER
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Organización GitHub de DT4H: https://github.com/DataTools4Heart/
