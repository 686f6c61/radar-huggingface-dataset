# ania3000/ossbert-morph-2-1

## Resumen

El modelo `ania3000/ossbert-morph-2-1` es un ajuste fino (fine-tune) de un modelo BERT multilingüe preentrenado en datos no etiquetados del dominio oncológico (`AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs`). Está diseñado para tareas de clasificación de tokens (token classification), como el reconocimiento de entidades nombradas, el etiquetado de partes de la oración o el análisis morfológico, aunque la tarea concreta del ajuste no está documentada. El nombre "morph" sugiere una posible orientación a morfología, pero no se confirma en la información disponible.

Con 177,6 millones de parámetros, se trata de un modelo de tamaño base, similar a BERT-base, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Su relevancia radica en ser un ejemplo de adaptación de un modelo preentrenado en un dominio especializado (oncología) a una tarea de etiquetado de secuencias, aunque la falta de documentación sobre el dataset y la tarea limita su aplicabilidad directa en producción sin una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 177.641.965 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), un encoder transformer con atención bidireccional. El modelo base `AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs` fue preentrenado de forma no supervisada sobre un corpus multilingüe relacionado con oncología, aunque no se dispone de detalles sobre el tamaño o la composición del corpus.

El ajuste fino se realizó con el framework Hugging Face Transformers, utilizando un dataset desconocido. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 5e-5, tamaño de lote de 8, optimizador AdamW (con betas 0.9 y 0.999), scheduler lineal y 25 épocas. No se mencionan técnicas de alineación como RLHF o DPO, ni innovaciones arquitectónicas adicionales. La pérdida de validación final fue de 0.3130, con una precisión (accuracy) del 95.87% y una precisión por frase del 60.18%.

## Capacidades

- Clasificación de tokens: el modelo está entrenado para asignar etiquetas a cada token de una secuencia, lo que lo hace apto para tareas como NER, POS tagging, chunking o análisis morfológico.
- Adaptación a dominio especializado: al partir de un modelo preentrenado en textos oncológicos, puede capturar terminología médica específica, aunque no se ha verificado su rendimiento en dichos textos.
- Compatibilidad con el ecosistema Transformers: se puede cargar con `AutoModelForTokenClassification` y `AutoTokenizer` de Hugging Face.
- Formato safetensors: pesos seguros y eficientes para carga en producción.
- Licencia permisiva: Apache 2.0 permite uso comercial, modificación y redistribución.

No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio. El modelo es exclusivamente de tipo encoder, por lo que no genera texto libre.

## Casos de uso

Dado que la tarea específica del fine-tuning no está documentada, los siguientes casos de uso son potenciales y dependen de la naturaleza real del dataset de entrenamiento. Se recomienda validar el modelo en cada escenario antes de su despliegue.

- Extracción de entidades clínicas en informes oncológicos: si el fine-tuning se realizó sobre anotaciones de entidades médicas, el modelo podría identificar términos como fármacos, diagnósticos o procedimientos en texto clínico. Su base preentrenada en oncología podría mejorar la precisión en ese dominio.
- Análisis morfológico de palabras en textos biomédicos: el nombre "morph" sugiere una posible tarea de etiquetado morfológico (lemas, categorías gramaticales). Podría aplicarse a corpus médicos para normalización de términos.
- Etiquetado de partes de la oración (POS tagging) en dominios técnicos: útil para pipelines de procesamiento de lenguaje natural que requieran análisis sintáctico previo.
- Reconocimiento de entidades en literatura científica: para extraer genes, proteínas o enfermedades de artículos de investigación oncológica.
- Preprocesamiento para sistemas de búsqueda semántica: al etiquetar tokens, se pueden construir índices más precisos para recuperación de información en bases de datos médicas.
- Análisis de ensayos clínicos: identificación de criterios de inclusión/exclusión, efectos adversos o medicamentos en documentos de ensayos.

En todos los casos, el modelo debe evaluarse con datos propios, ya que no se han publicado benchmarks externos que confirmen su eficacia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GLUE, etc.) en la información disponible. El `model-index` de la model card está vacío. Sin embargo, el autor reporta las siguientes métricas de evaluación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de validación | 0.3130 |
| Accuracy (token) | 95.8657% |
| Sentence accuracy | 60.1835% |

Estas métricas corresponden al conjunto de evaluación utilizado durante el fine-tuning, pero no se especifica la naturaleza de dicho conjunto ni la tarea exacta. No son comparables con benchmarks generales de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: con 177,6 millones de parámetros, en FP32 los pesos ocupan aproximadamente 710 MB. Con una longitud de contexto de 512 tokens y un batch de 1, el consumo total de VRAM se estima entre 1 y 2 GB. En cuantización INT8, el consumo se reduce a unos 500-700 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A10 o T4. No requiere hardware especializado.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con Hugging Face Inference Endpoints, ONNX Runtime, o mediante frameworks como vLLM (aunque vLLM está optimizado para decodificación, no para encoders; para clasificación de tokens se recomienda usar `transformers` con `pipeline` o TorchServe). También es posible exportarlo a ONNX para inferencia en CPU.
- Latencia y throughput: no se dispone de datos oficiales. En una GPU moderna, la inferencia sobre un texto de 512 tokens debería completarse en milisegundos, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo base `ossbert-onc-unlab` no tiene una página de documentación pública detallada, y no se han encontrado benchmarks comparativos. Como referencia genérica, otros BERT fine-tuned para token classification en el dominio biomédico incluyen BioBERT, ClinicalBERT o PubMedBERT, pero no se dispone de datos de rendimiento de `ossbert-morph-2-1` frente a ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifica el dataset de fine-tuning, la tarea concreta ni los idiomas soportados. Esto impide conocer el alcance real del modelo.
- Riesgo de alucinación: al ser un modelo encoder, no genera texto libre, por lo que el riesgo de alucinación es bajo en ese sentido. Sin embargo, las etiquetas predichas pueden ser incorrectas si el modelo no ha sido entrenado adecuadamente para la tarea.
- Sesgos potenciales: el preentrenamiento en un corpus oncológico multilingüe puede introducir sesgos relacionados con la terminología médica, la demografía de los pacientes o las variaciones dialectales. No se han realizado auditorías de sesgo.
- Limitaciones de contexto: si sigue la arquitectura BERT estándar, la longitud máxima de entrada es de 512 tokens. Textos más largos requerirán truncamiento o estrategias de ventana deslizante.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se ofrecen garantías sobre el rendimiento o la seguridad del modelo en aplicaciones médicas reales.
- Sin benchmarks externos: no hay evidencia independiente de su calidad. Cualquier uso en producción debe ir precedido de una evaluación exhaustiva con datos propios.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/ania3000/ossbert-morph-2-1
- Modelo base: https://huggingface.co/AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs
- Repositorio de demostración (relacionado): https://huggingface.co/ania3000/demo-ossbert
