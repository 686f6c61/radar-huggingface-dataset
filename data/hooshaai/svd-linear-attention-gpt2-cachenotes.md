# Hooshaai/svd-linear-attention-gpt2-cachenotes

## Ficha: Hooshaai/svd-linear-attention-gpt2-cachenotes

## Resumen

Hooshaai/svd-linear-attention-gpt2-cachenotes es un modelo experimental de clasificación de texto desarrollado por Hooshaai. Se basa en GPT-2, pero sustituye la atención estándar (cuadrática) por un módulo llamado "cachenotes", que aplica aproximaciones lineales de bajo rango calibradas con SVD y recupera el rendimiento mediante 50 pasos de fine-tuning con LoRA. El modelo se evalúa en la tarea de análisis de sentimiento SST-2 del conjunto GLUE.

Esta variante supone una contribución al campo de las arquitecturas de atención eficiente, ya que explora cómo reducir el coste computacional de los transformers manteniendo la capacidad de razonamiento. El modelo está disponible bajo licencia MIT y su pipeline es text-classification. No se han publicado detalles sobre el número total de parámetros ni la longitud de contexto de esta versión comprimida, aunque hereda la estructura base de GPT-2 (modelo de 124 millones de parámetros en su versión original). El repositorio en Hugging Face indica un tamaño de 0.0 GB, lo que sugiere que los pesos preentrenados podrían no estar efectivamente alojados o son de tamaño reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 con atención lineal de bajo rango (cachenotes) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (usa compresión SVD, no cuantización estándar) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch (weights.pt) - repositorio de 0.0 GB |

## Arquitectura y entrenamiento

El modelo reemplaza la atención cuadrática estándar o las capas de proyección densas de GPT-2 por una atención lineal de bajo rango. El módulo "cachenotes" se calibra mediante descomposición en valores singulares (SVD) y se recupera aplicando 50 pasos de fine-tuning con LoRA. Esta aproximación busca mantener la expresividad de un transformer con una complejidad O(N) en lugar de O(N²) para secuencias largas. Los datos de entrenamiento se limitan a la tarea de clasificación de sentimientos SST-2 de GLUE, donde el modelo alcanza un accuracy de validación del 81.88%. No se mencionan procesos de RLHF ni DPO. Tampoco se proporciona información sobre el número de tokens ni la composición del dataset de preentrenamiento.

## Capacidades

- Clasificación de texto binaria (análisis de sentimiento) en inglés, con accuracy del 81.88% sobre SST-2.
- Inferencia de bajo consumo de memoria: pico de VRAM de 402.87 MB y tiempo de evaluación de 23.49 s (en hardware no especificado).
- Compresión de pesos mediante SVD lineal, con ratio de compresión reportado de 1.0 (es decir, sin reducción neta del número de parámetros en este caso).
- Recuperación de precisión tras la compresión mediante fine-tuning con LoRA.
- Integración con la API de Transformers de Hugging Face (`AutoModelForSequenceClassification`).
- No soporta tool calling, agentes, visión, audio ni generación de texto libre.
- No dispone de capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación en atención eficiente: el modelo permite comparar empíricamente el coste y la precisión de una atención lineal de bajo rango frente a la atención cuadrática original de GPT-2 en una tarea de clasificación. Es adecuado para verificar la viabilidad de la sustitución por SVD + LoRA en pipelines académicos.
- Prototipado rápido con GPU limitada: gracias a su bajo pico de VRAM (402.87 MB), se puede ejecutar en GPUs de consumo como una RTX 3060 o incluso en entornos de CPU ampliados. Sirve para explorar ideas de compresión sin necesidad de hardware profesional.
- Benchmarking de técnicas de compresión: se puede utilizar como punto de referencia para evaluar otros métodos de eficiencia en atención (por ejemplo, atención lineal con kernels u otras variantes de linear attention) en la misma tarea SST-2.
- Docencia en deep learning: el modelo es útil para ilustrar en cursos o talleres cómo se implementa la descomposición SVD y el fine-tuning con LoRA sobre un transformer, ya que su código es sencillo de leer y depurar.
- Evaluación de modelos recuperados tras compresión: permite estudiar el impacto de distintos números de pasos de fine-tuning en la recuperación de precisión tras degradar la atención, lo que resulta relevante para laboratorios que optimizan modelos.
- Integración en pipelines de clasificación de sentimientos en inglés para aplicaciones de bajo consumo, como análisis de redes sociales o sistemas de monitorización de opiniones, siempre que se acepte un accuracy moderado (~82%) y se maneje la dependencia de un repositorio con pesos posiblemente no alojados.

## Benchmarks y rendimiento

La información disponible incluye únicamente los resultados reportados por el autor en la model card para la tarea SST-2. No se han publicado comparaciones con modelos similares.

| Metrica | Valor |
|---|---|
| Exactitud de validación (SST-2) | 81.88% |
| F1 score | 0.8394 |
| Ratio de compresión | 1.0 |
| Pico de VRAM | 402.87 MB |
| Tiempo de evaluacion | 23.49 s |

## Requisitos de hardware

- VRAM estimada para inferencia: según la métrica reportada, el pico de VRAM es de 402.87 MB para evaluación, lo que la hace viable en GPUs con 1 GB o menos de memoria.
- GPU recomendadas: RTX 3060, RTX 4060, T4, o cualquier GPU con 2 GB o más de VRAM. También puede ejecutarse en CPU con suficiente RAM.
- Es apto para ejecución en GPU de consumo.
- Opciones de despliegue: se carga con la biblioteca `transformers` de Hugging Face. No se han reportado integraciones con vLLM, llama.cpp, Ollama ni TGI. Dado que el pipeline es text-classification, las herramientas de inferencia optimizadas para generación no son aplicables.
- Latencia y throughput: el tiempo de evaluación reportado es de 23.49 s en hardware desconocido, sin que se indique el tamaño del batch o la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar este modelo con alternativas. A continuación se comparan características cualitativas con GPT-2 base y BERT-base.

| Modelo | Parametros | Contexto | Licencia | Pipeline | Datos benchmark SST-2 |
|---|---|---|---|---|---|
| Hooshaai/svd-linear-attention-gpt2-cachenotes | no disponible | no disponible | MIT | text-classification | 81.88% (accuracy) |
| GPT-2 base | 124M | 1024 tokens | MIT | text-generation | no reportados en esta ficha |
| BERT-base | 110M | 512 tokens | Apache 2.0 | text-classification | no reportados en esta ficha |

No se han encontrado benchmarks comparativos publicados en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0.0 GB, lo que indica que los pesos del modelo podrían no estar efectivamente subidos o que el archivo de pesos es demasiado pequeño para contener el modelo completo. Esto impide verificar su funcionamiento real fuera del entorno del autor.
- El ratio de compresión reportado es 1.0, lo que sugiere que esta variante no reduce el número de parámetros con respecto al modelo base, a pesar de su nombre.
- La evaluación se limita a SST-2, una tarea de clasificación binaria sencilla. No se han probado tareas de razonamiento complejo, generación ni traducción.
- Solo soporta inglés; cualquier uso en otros idiomas no es viable.
- Al estar basado en GPT-2, hereda los sesgos y alucinaciones típicos del modelo original entrenado sobre WebText, sin que se mencionen medidas de mitigación.
- No existe documentación sobre restricciones adicionales al uso comercial, aunque la licencia MIT en principio lo permite.
- La atención lineal de bajo rango puede degradar la captura de dependencias de largo alcance en comparación con la atención completa, un aspecto no evaluado en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/svd-linear-attention-gpt2-cachenotes
- Artículo sobre atención lineal: https://hooshaai.substack.com/p/scaling-transformers-how-linear-attention
- Artículo sobre atención lineal en modelado bidireccional: https://hooshaai.substack.com/p/the-rise-of-linear-attention-in-bidirectional
