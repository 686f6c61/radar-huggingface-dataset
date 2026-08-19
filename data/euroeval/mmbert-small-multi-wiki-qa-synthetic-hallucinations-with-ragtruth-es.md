# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-es

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-es` es un encoder transformer especializado en la detección de alucinaciones a nivel de token en respuestas generadas por sistemas de retrieval-augmented generation (RAG) en español. Desarrollado por el grupo EuroEval, se basa en la arquitectura mmBERT-small, una variante compacta del modelo multilingüe mmBERT, y ha sido ajustado mediante fine-tuning con datos sintéticos de alucinaciones generados a partir de los corpus MultiWikiQA y RAGTruth. El modelo está diseñado para la tarea de token-classification, es decir, asigna una etiqueta a cada token de una respuesta para indicar si forma parte de una alucinación o no.

Este modelo aborda un problema crítico en la adopción de sistemas RAG: la verificación de la fidelidad de las respuestas generadas. Al identificar qué fragmentos de texto son inventados o infieles a la fuente, permite implementar controles de calidad automáticos en pipelines de generación aumentada por recuperación. Su relevancia actual radica en la creciente dependencia de arquitecturas RAG en aplicaciones empresariales y de investigación, donde la precisión factual es esencial. Con 140,6 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware de consumo, lo que facilita su integración en entornos de producción con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT-small (basada en ModernBERT) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | español (fine-tuning específico para este idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en mmBERT-small, un encoder multilingüe moderno desarrollado por JHU-CLSP que emplea una arquitectura de transformer con atención eficiente (similar a ModernBERT). El modelo base fue preentrenado con 3 billones de tokens en 1833 idiomas mediante un método de aprendizaje de idiomas con annealing en cascada, lo que le permite capturar representaciones lingüísticas robustas. Para este fine-tuning específico, se utilizaron datos sintéticos de alucinaciones generados a través del framework LettuceDetect, que produce respuestas etiquetadas a nivel de token a partir de contextos de MultiWikiQA y el corpus RAGTruth. El entrenamiento se realizó para la tarea de clasificación de tokens, optimizando la capacidad del modelo para distinguir entre contenido fiel e infiel a la fuente. No se han publicado detalles específicos sobre hiperparámetros, régimen de entrenamiento o composición exacta del dataset de fine-tuning en la información disponible.

## Capacidades

- Detección de alucinaciones a nivel de token: el modelo etiqueta cada token de una respuesta como alucinado o no, permitiendo identificar fragmentos específicos problemáticos.
- Clasificación de tokens (token-classification): pipeline de transformers para anotación de secuencias, con salida de etiquetas por token.
- Procesamiento de texto en español: entrenado específicamente para este idioma, aunque el modelo base es multilingüe.
- Integración con sistemas RAG: diseñado para evaluar la fidelidad de respuestas generadas con recuperación de documentos.
- Compatibilidad con el ecosistema Hugging Face: se carga fácilmente con la librería `transformers` y es compatible con endpoints de inferencia.

## Casos de uso

- Control de calidad en sistemas RAG en español: el modelo puede integrarse en un pipeline posterior a la generación para marcar automáticamente las partes de la respuesta que no están respaldadas por los documentos recuperados, permitiendo a los desarrolladores filtrar o corregir contenido antes de mostrarlo al usuario final.
- Auditoría de respuestas generadas por LLMs: en aplicaciones donde se requiere trazabilidad de la información, este modelo ayuda a verificar si las afirmaciones del modelo se basan en las fuentes proporcionadas, reduciendo el riesgo de difundir información falsa.
- Investigación en robustez de sistemas RAG: los investigadores pueden utilizar el modelo como herramienta de evaluación para medir la tasa de alucinaciones en diferentes configuraciones de recuperación y generación, facilitando la comparación de arquitecturas.
- Filtrado de contenido en producción: en chatbots o asistentes virtuales que usan RAG, el modelo puede actuar como un filtro en tiempo real que descarta respuestas con alta proporción de tokens alucinados, mejorando la fiabilidad del servicio.
- Análisis de faithfulness en generación de texto: más allá de RAG, puede aplicarse a cualquier tarea de generación donde se requiera verificar la consistencia con un texto fuente, como resúmenes o paráfrasis.
- Desarrollo de datasets anotados: el modelo puede usarse para pre-anotar grandes volúmenes de texto, acelerando la creación de corpus de entrenamiento para otros sistemas de detección de alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (MultiWikiQHalluA) describe la evaluación del modelo, pero los números concretos no están accesibles en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140 millones de parámetros y pesos en safetensors (probablemente fp32, 1.2 GB), la inferencia requiere aproximadamente 2-3 GB de VRAM en modo de precisión completa. Con cuantización a int8 (no documentada pero posible), podría reducirse a ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, como NVIDIA GTX 1650, RTX 3060, o superiores. También puede ejecutarse en CPU para tareas por lotes pequeñas.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja, así como en Apple Silicon con MPS.
- Opciones de despliegue: se puede servir con la librería `transformers` mediante pipelines, o exportar a ONNX para inferencia optimizada. También es compatible con Hugging Face Inference Endpoints.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de este tamaño, se espera una latencia de decenas de milisegundos por lote en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de alucinaciones en español con la misma arquitectura. El modelo base mmBERT-small compite con otros encoders multilingües como XLM-R, pero este fine-tuning es único en su tarea y no se han encontrado alternativas directas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos sintéticos generados por LLMs, el modelo puede heredar sesgos presentes en los modelos generativos utilizados para crear los ejemplos de entrenamiento.
- Riesgo de alucinación: aunque el modelo detecta alucinaciones, no es infalible; puede haber falsos positivos (marcar texto correcto como alucinado) o falsos negativos (no detectar alucinaciones sutiles).
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto soportada; para textos largos, puede ser necesario truncar o segmentar la entrada.
- Restricciones de licencia: la licencia no está disponible, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar con los autores antes de usarlo en producción.
- Específico para español: aunque el modelo base es multilingüe, el fine-tuning se ha realizado solo en español, por lo que su rendimiento en otros idiomas no está garantizado.
- Dependencia de la calidad de los datos de entrenamiento: los datos sintéticos pueden no capturar la variedad de alucinaciones que ocurren en escenarios reales, limitando la generalización.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-es)
- [HuggingFace - versión en inglés](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en)
- [GitHub - mmBERT](https://github.com/JHU-CLSP/mmBERT/)
- [Paper - MultiWikiQHalluA (arXiv)](https://arxiv.org/pdf/2605.02504v2)
- [GitHub - RAGTruth](https://github.com/ParticleMedia/RAGTruth)
