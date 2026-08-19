# DT4H/cardio-ner-es-medication-cardioberta-multiclass

## Resumen

Cardio-Ner-Es-Medication-Cardioberta-Multiclass es un modelo de reconocimiento de entidades nombradas (NER) de tipo multiclase, especializado en la detección de medicamentos en textos clínicos de cardiología en español. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto financiado por el programa Horizon Europe de la Unión Europea (Grant Agreement No. 101057849) que tiene como objetivo construir una plataforma federada y respetuosa con la privacidad para la reutilización de datos de cardiología.

El modelo se basa en CardioBERTa, una arquitectura RoBERTa adaptada al dominio clínico, y está ajustado específicamente para la tarea de token-classification sobre entidades de medicación. Con 125 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto que puede desplegarse en hardware de gama media. Su relevancia radica en que aborda un problema concreto del procesamiento de lenguaje natural clínico en español: la extracción estructurada de información farmacológica a partir de notas médicas, historiales electrónicos y literatura científica, un paso previo imprescindible para tareas de análisis clínico, farmacovigilancia o investigación observacional.

El modelo se publica bajo el marco del proyecto DataTools4Heart, que también ha liberado variantes para checo y una versión multilingüe basada en XLM-RoBERTa, lo que sugiere una estrategia coordinada de cobertura lingüística para el mismo dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (CardioBERTa, variante clínica) |
| Parametros totales | 125.389.827 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Español (es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa, una variante de BERT optimizada que elimina la predicción de la siguiente frase y utiliza un entrenamiento con máscaras dinámicas y mayores lotes. CardioBERTa es la adaptación de RoBERTa al dominio biomédico y clínico, preentrenada con corpus médicos en español. Sobre esta base, el modelo se ha ajustado (fine-tuning) para la tarea de token-classification multiclase, lo que implica que cada token de la secuencia de entrada se clasifica como parte de una entidad de medicación o como no-entidad.

Los detalles específicos del entrenamiento —número de tokens, composición del dataset, uso de técnicas de alineación como RLHF o DPO— no están disponibles en la información publicada. El framework utilizado es PyTorch, y el modelo se carga mediante la API estándar de Transformers con `AutoModelForTokenClassification`. No se han documentado innovaciones técnicas particulares más allá del ajuste de CardioBERTa para la tarea NER de medicamentos en cardiología.

## Capacidades

- Reconocimiento de entidades nombradas (NER) de medicación en textos clínicos de cardiología en español, con clasificación multiclase.
- Procesamiento de texto clínico: el modelo está ajustado para el dominio médico, por lo que reconoce terminología farmacológica, nombres comerciales y principios activos en contexto clínico.
- Token-classification: etiqueta cada token de la secuencia, lo que permite extraer spans de entidades con precisión a nivel de subpalabra.
- Integración con el ecosistema Hugging Face Transformers: se puede cargar con `AutoModelForTokenClassification` y `AutoTokenizer` para su uso directo en pipelines de NER.
- Soporte monolingüe: está especializado en español, sin capacidades multilingües documentadas.
- No se han documentado capacidades de generación de texto, tool calling, agentes, visión o audio: es un modelo exclusivamente discriminativo para clasificación de tokens.

## Casos de uso

- Extracción de medicación de historiales clínicos electrónicos: el modelo puede procesar notas de evolución, informes de alta o resúmenes de consulta para extraer automáticamente los fármacos mencionados, facilitando la creación de listados estructurados de medicación activa.
- Farmacovigilancia: a partir de textos clínicos o de literatura científica en cardiología, el modelo permite identificar menciones de medicamentos para correlacionarlas con eventos adversos, contribuyendo a la detección de señales de seguridad.
- Investigación observacional retrospectiva: los investigadores pueden aplicar el modelo sobre grandes volúmenes de historiales para construir cohortes de pacientes según la medicación prescrita, sin necesidad de revisión manual.
- Normalización de datos para ensayos clínicos: la extracción de entidades de medicación es un paso previo para mapear menciones a vocabularios controlados como RxNorm o ATC, lo que facilita la interoperabilidad de datos entre centros.
- Soporte a la prescripción electrónica asistida: integrado en sistemas de ayuda a la decisión clínica, el modelo puede verificar que la medicación mencionada en una nota coincide con la prescrita, reduciendo errores de transcripción.
- Análisis de adherencia terapéutica: procesando notas de seguimiento, el modelo permite identificar menciones de medicación y su evolución temporal, lo que ayuda a estudiar patrones de adherencia en pacientes cardiovasculares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de evaluación estándar (p. ej., MedNER, PharmaCoNER o similares). Tampoco se han documentado comparaciones con otros modelos NER clínicos en español.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 125M de parámetros en precisión FP32, el uso de memoria aproximado es de 0,5 GB. Con cuantización a int8, podría reducirse a unos 0,25 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en lotes pequeños. Una NVIDIA T4, GTX 1660 o RTX 3060 son opciones adecuadas. Para fine-tuning, se recomienda al menos 8 GB de VRAM (RTX 3070/3080, A10, V100).
- Compatibilidad con GPU de consumo: sí, el modelo cabe holgadamente en GPUs de consumo como la RTX 3060 (12 GB) o incluso en una GTX 1050 Ti (4 GB) para inferencia.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con Hugging Face Inference Endpoints, vLLM (aunque está orientado a generación, soporta modelos encoder), o mediante un contenedor FastAPI con la librería Transformers. También es posible exportarlo a ONNX para optimización en CPU.
- Latencia y throughput estimados: no se han publicado datos. Para un modelo de este tamaño en una GPU moderna, la inferencia por secuencia suele estar en el rango de 5-20 ms, dependiendo de la longitud del texto y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idioma | Tarea | Licencia |
|---|---|---|---|---|---|
| DT4H/cardio-ner-es-medication-cardioberta-multiclass | RoBERTa (CardioBERTa) | 125M | Español | NER medicación | no disponible |
| DT4H/cardio-ner-cs-medication-cardioberta-multiclass | RoBERTa (CardioBERTa) | 125M (estimado) | Checo | NER medicación | no disponible |
| DT4H/cardio-ner-multilingual-xlm-roberta-large-multilabel | XLM-RoBERTa large | 560M | Multilingüe | NER multilabel | no disponible |

La comparativa se limita a los modelos del mismo proyecto DT4H, ya que no se dispone de información suficiente sobre alternativas externas específicas para NER de medicación en cardiología en español. El modelo multilingüe del mismo proyecto (XLM-RoBERTa large) ofrece mayor cobertura de idiomas y un enfoque multilabel, pero con el triple de parámetros. La variante checa es el equivalente directo para otro idioma.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no declara una licencia explícita, lo que genera incertidumbre legal para su uso comercial. Se recomienda contactar con los autores antes de desplegarlo en producción.
- Datos de entrenamiento no documentados: no se ha publicado información sobre el corpus de entrenamiento, su tamaño, procedencia o posibles sesgos. Esto impide evaluar la generalización a dominios distintos del de entrenamiento.
- Riesgo de alucinación en entidades: como todo modelo NER, puede etiquetar como medicación términos que no lo son, especialmente en textos con jerga local o abreviaturas no estándar.
- Sesgos potenciales: al ser un modelo entrenado probablemente con datos clínicos, puede presentar sesgos relacionados con la demografía de los pacientes representados en los corpus de origen, aunque no se ha documentado.
- Alcance limitado a cardiología: el modelo está especializado en el dominio cardiovascular; su rendimiento en otras especialidades médicas puede ser significativamente inferior.
- Sin soporte multilingüe: solo procesa español. Para otros idiomas, es necesario usar las variantes checa o multilingüe del mismo proyecto.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF, ONNX o cuantizadas, lo que puede limitar el despliegue en entornos con restricciones de memoria o en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-es-medication-cardioberta-multiclass
- Variante checa: https://huggingface.co/DT4H/cardio-ner-cs-medication-cardioberta-multiclass
- Colección CardioNER en Hugging Face: https://huggingface.co/collections/DT4H/cardioner
- Organización GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Sitio web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Publicaciones del proyecto: https://www.datatools4heart.eu/publications/
