# DT4H/cardio-ner-es-procedure-cardioberta-multiclass

## Resumen

El modelo `DT4H/cardio-ner-es-procedure-cardioberta-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) de tipo multiclase, especializado en la detección de procedimientos en textos clínicos de cardiología en español. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto europeo financiado por Horizon Europe (Grant Agreement No. 101057849) cuyo objetivo es estandarizar la estructuración de informes cardiológicos mediante técnicas de procesamiento de lenguaje natural (NLP) en varios idiomas europeos.

El modelo se basa en CardioBERTa, una adaptación de la arquitectura RoBERTa al dominio biomédico y cardiológico en español, y ha sido ajustado (fine-tuning) para la tarea específica de clasificación de tokens. Con 125,4 millones de parámetros, se trata de un modelo de tamaño medio, adecuado para su despliegue en entornos con recursos computacionales limitados. Su relevancia radica en la necesidad de extraer automáticamente procedimientos de informes clínicos no estructurados, un paso clave para la reutilización de datos de salud en investigación y práctica clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (CardioBERTa) |
| Parametros totales | 125.389.827 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (FP32/FP16, sin cuantizacion publicada) |
| Idiomas soportados | Español (es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa, un transformer encoder basado en BERT con optimizaciones en el preentrenamiento (eliminación de la predicción de siguiente oración, mayor cantidad de datos y entrenamiento más largo). CardioBERTa es una adaptación de RoBERTa al dominio clínico y cardiológico en español, preentrenada con corpus biomédicos y posteriormente ajustada para la tarea de NER multiclase sobre procedimientos. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset de ajuste ni el uso de técnicas como RLHF o DPO. El modelo se entrena con el framework PyTorch y se distribuye mediante la librería Transformers de Hugging Face.

## Capacidades

- Reconocimiento de entidades nombradas (NER) de tipo token-classification, específicamente para la identificación de procedimientos en textos de cardiología en español.
- Clasificación multiclase: el modelo distingue entre diferentes tipos de entidades relacionadas con procedimientos (aunque no se especifican las etiquetas exactas en la documentación disponible).
- Procesamiento de texto clínico: adaptado al vocabulario y las expresiones propias de informes médicos y registros cardiológicos.
- Integración sencilla con el ecosistema Hugging Face mediante `AutoModelForTokenClassification` y `AutoTokenizer`.
- No soporta generación de texto, tool calling, agentes, visión ni modos de razonamiento especiales; es un modelo puramente discriminativo para etiquetado de secuencias.

## Casos de uso

- Extracción de procedimientos de informes de alta hospitalaria: el modelo puede procesar automáticamente informes de pacientes cardiológicos y extraer los procedimientos realizados (p. ej., angioplastia, bypass, cateterismo), facilitando la codificación y el análisis retrospectivo.
- Estandarización de datos clínicos para investigación: al estructurar los procedimientos en formato de entidades, permite construir bases de datos normalizadas para estudios observacionales o ensayos clínicos.
- Soporte a sistemas de codificación automática (p. ej., CIE-10): las entidades extraídas pueden mapearse a códigos estandarizados, reduciendo el trabajo manual de codificadores clínicos.
- Análisis de grandes volúmenes de historias clínicas electrónicas: el modelo puede ejecutarse sobre corpus completos para identificar tendencias en la realización de procedimientos cardiológicos, útil para gestión sanitaria y planificación de recursos.
- Integración en pipelines de NLP clínico multilingüe: forma parte de la suite NLP de DataTools4Heart, que incluye modelos para otros idiomas europeos; puede combinarse con otros componentes para procesar informes en diferentes lenguas.
- Asistencia a la revisión de calidad de datos: en entornos federados como la plataforma DT4H, el modelo ayuda a verificar que los informes contengan la información de procedimientos necesaria para su reutilización, señalando posibles omisiones o errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de validación estándar (p. ej., MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos NER clínicos en español.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (125M parámetros × 4 bytes), reducible a ~0,25 GB en FP16. Con cuantización de 8 bits, podría bajar a ~0,13 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas de consumo como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- Compatible con hardware de gama baja: cabe en GPUs integradas o en entornos sin GPU, aunque la latencia será mayor.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con vLLM, TGI, Hugging Face Inference Endpoints, o mediante scripts personalizados con PyTorch. También es posible exportarlo a ONNX para optimización.
- Latencia y throughput estimados: no disponibles en la documentación; en una GPU moderna (p. ej., RTX 3090) se esperan latencias de milisegundos por secuencia corta, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos NER clínicos en español. Sin embargo, el proyecto DataTools4Heart publica modelos equivalentes para otros idiomas (p. ej., `DT4H/cardio-ner-en-cardioberta-multiclass` para inglés) y existe una variante similar en español (`DT4H/es-procedure-cardioberta-multiclass-ner`). Estos modelos comparten la misma arquitectura base y filosofía de entrenamiento, pero no se han publicado métricas comparativas. Alternativas comerciales o académicas como `PlanTL-GOB-ES/roberta-base-biomed-es` o `mBERT` podrían usarse para NER clínico, pero no se dispone de datos de rendimiento en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos clínicos, puede heredar sesgos presentes en los corpus de origen (p. ej., sobrerrepresentación de ciertas poblaciones o procedimientos). No se ha documentado una evaluación específica de sesgos.
- Riesgo de alucinación: aunque es un modelo discriminativo (no generativo), puede producir etiquetas incorrectas si el texto de entrada contiene terminología no vista o ambigua. La precisión depende de la calidad del dataset de ajuste.
- Limitaciones de contexto: la longitud máxima de secuencia no está especificada; los modelos RoBERTa base suelen soportar 512 tokens, por lo que documentos largos deberán truncarse o dividirse.
- Restricciones de licencia: la licencia no está indicada en la ficha de Hugging Face, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con los autores antes de utilizarlo en producción.
- Especialización limitada: el modelo está diseñado exclusivamente para procedimientos cardiológicos en español; su rendimiento en otros dominios clínicos o en otras variantes del español puede ser deficiente.
- Dependencia del ecosistema: requiere el uso de la librería Transformers y el tokenizador correspondiente; no se proporcionan pesos en formatos alternativos (GGUF, ONNX) de forma oficial.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DT4H/cardio-ner-es-procedure-cardioberta-multiclass)
- [Proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [Organización GitHub de DataTools4Heart](https://github.com/DataTools4Heart/)
- [Publicaciones del proyecto](https://www.datatools4heart.eu/publications/) (incluye referencia a SMM4H-HeaRD 2026)
- [Modelo similar en inglés: cardio-ner-en-cardioberta-multiclass](https://huggingface.co/DT4H/cardio-ner-en-cardioberta-multiclass)
