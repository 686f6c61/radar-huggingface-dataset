# gwd200/orena-frame-weights

## Resumen

`gwd200/orena-frame-weights` es un conjunto de adaptadores LoRA desarrollados por el usuario gwd200 para el track FRAME del ORena SAVE FOCUS Challenge (MICCAI 2026). El objetivo de este track es evaluar la capacidad de un modelo para responder preguntas clínicamente relevantes a partir de una única imagen quirúrgica, cubriendo tareas como detección de objetos extraños, identificación, reconocimiento de atributos y localización espacial. Los adaptadores se construyen sobre los modelos multimodales `Qwen/Qwen3.5-9B` (9B) y `Qwen/Qwen3.8-27B` (27B) de la familia Qwen, entrenados con LoRA en todos los módulos lineales, incluidos el vision tower y el aligner.

El modelo resuelve un problema específico de comprensión de escena quirúrgica a partir de una sola imagen, un área de creciente interés para la automatización de la documentación clínica y la asistencia en quirófano. Su relevancia actual se debe a que participa en un reto de referencia (MICCAI 2026) y a que demuestra que un adaptador LoRA sobre un modelo base de 9B puede superar a una variante de 27B en precisión, lo que reduce los requisitos de despliegue. El mejor checkpoint (`9b-3225`) alcanza un 69,40% de precisión media en el evaluador oficial, con un 77,11% en reconocimiento de objetos y un 60,07% en agregación.

El repositorio incluye únicamente los pesos de los adaptadores LoRA (29,1 GB en formato safetensors), no el modelo base completo. El autor proporciona instrucciones para cargar los adaptadores con `PeftModel` y para fusionarlos con el modelo base mediante `merge_and_unload()` para su uso en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-9B y Qwen3.8-27B (modelo multimodal visión-lenguaje) |
| Parametros totales | no disponible (solo se publican los adaptadores LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | bf16 (entrenamiento); no se publican cuantizaciones GGUF/AWQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo se compone de un adaptador LoRA entrenado sobre los modelos base multimodales `Qwen/Qwen3.5-9B` y `Qwen/Qwen3.8-27B`. La configuración LoRA utiliza `rank=64`, `alpha=128`, `dropout=0.05` y se aplica a todos los módulos lineales (`target_modules=all-linear`), lo que incluye tanto la torre de visión como el aligner. No se congelan ni el LLM ni la torre de visión (`freeze_llm/vit/aligner=false`). En el caso del modelo de 9B se entrenan 205,06 millones de parámetros (2,13% del total), mientras que en el de 27B se entrenan 499 millones (1,79%).

El entrenamiento se realizó con el framework ms-swift (`swift sft`) durante 15 épocas, con un tamaño de lote efectivo de 64 (9B) y 128 (27B) distribuido en 8 GPUs. Se usó `max_length=4096`, `max_pixels=1048576` (resolución nativa de ~921K píxeles sin reducción), tasa de aprendizaje `1e-4` con scheduler coseno, optimizador `adamw_torch_fused` y precisión bf16. El prompt incluye un sistema quirúrgico («You are a surgical assistant … Be precise and concise.») junto con el token `<image>` y la pregunta. En inferencia se añade el prefijo no-thinking ` thinking\n\n response\n\n`, característico de Qwen3.5. No se inyectan definiciones de objetos (`fo_definitions`) en estos runs.

## Capacidades

- Comprensión de escenas quirúrgicas a partir de una única imagen, incluyendo detección de objetos extraños, identificación de instrumentos y reconocimiento de atributos.
- Localización espacial de objetos dentro de la imagen, útil para tareas de guiado y auditoría.
- Conteo de objetos presentes en la escena, aunque con rendimiento limitado (precisión alrededor del 50%).
- Razonamiento visual-clínico multimodal, al combinar la torre de visión con el LLM base.
- Respuesta a preguntas de opción múltiple y preguntas abiertas sobre contenido quirúrgico, con formato de respuesta conciso.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; se asume que el modelo base Qwen3.5 soporta múltiples idiomas, pero no se documenta para este adaptador.

## Casos de uso

- **Asistencia quirúrgica en tiempo real**: el modelo puede procesar una imagen del campo operatorio y responder si hay objetos extraños o instrumentos no esperados, ayudando a prevenir complicaciones. La ventana de 4096 tokens es suficiente para preguntas y respuestas breves, y la baja latencia del modelo de 9B permite integración en sistemas de quirófano con hardware moderado.
- **Auditoría de seguridad en quirófanos**: revisión de imágenes capturadas durante procedimientos para verificar la presencia y localización de instrumentos, gasas o esponjas, reduciendo el riesgo de retención de objetos.
- **Formación y simulación quirúrgica**: análisis de imágenes de entrenamiento para evaluar si un estudiante identifica correctamente los elementos de una escena quirúrgica, con retroalimentación automática.
- **Documentación clínica automatizada**: generación de descripciones estructuradas de imágenes quirúrgicas (qué objetos hay, dónde están, cuántos hay) para registros médicos y sistemas de información hospitalaria.
- **Investigación en visión por computador médica**: uso como baseline en benchmarks de comprensión de escenas quirúrgicas, comparando con otros modelos multimodales en el track FRAME del SAVE FOCUS Challenge.
- **Sistemas de triage de imágenes**: clasificación automática de imágenes de quirófano para priorizar revisión humana en caso de detección de anomalías, aprovechando la capacidad de reconocimiento de objetos del modelo.
- **Despliegue en entornos con recursos limitados**: gracias a que el adaptador LoRA de 9B solo añade 205 millones de parámetros, el modelo puede ejecutarse en GPUs de consumo (24 GB VRAM) tras fusionar los pesos, lo que facilita su uso en hospitales o laboratorios con infraestructura reducida.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación con el evaluador oficial del challenge (`focus.evaluation.Evaluator`), usando inferencia vLLM y un juez Qwen3.5-4B. La métrica es precisión micro (aciertos correctos / total) sobre los grupos de reconocimiento de objetos (rec) y agregación (agg), más el grupo de número (number). Los resultados de los checkpoints principales son:

| ckpt | overall | micro rec | micro agg | number |
|---|---|---|---|---|
| 9b-400 | 61.46 | 68.40 | 53.07 | 43.65 |
| 9b-600 | 57.32 | 61.33 | 52.47 | 44.56 |
| 9b-800 | 61.67 | 68.49 | 53.43 | 43.98 |
| 9b-1000 | 64.26 | 71.82 | 55.12 | 46.56 |
| 9b-1200 | 63.80 | 71.38 | 54.63 | 46.18 |
| 9b-1400 | 66.98 | 75.36 | 56.86 | 47.56 |
| 9b-1600 | 66.65 | 74.25 | 57.46 | 47.99 |
| 9b-1800 | 66.92 | 75.07 | 57.07 | 47.90 |
| 9b-2000 | 68.49 | 76.62 | 58.66 | 50.00 |
| 9b-2200 | 68.55 | 76.35 | 59.12 | 50.24 |
| 9b-2400 | 68.95 | 76.94 | 59.29 | 50.57 |
| 9b-2600 | 69.40 | 77.05 | 60.14 | 51.48 |
| 9b-2800 | 69.20 | 76.85 | 59.96 | 51.29 |
| 9b-3000 | 69.36 | 77.00 | 60.14 | 51.53 |
| 9b-3200 | 69.32 | 77.05 | 59.96 | 51.19 |
| **9b-3225** | **69.40** | **77.11** | **60.07** | **51.34** |
| 9c-1000 | 66.04 | 73.57 | 56.93 | 48.04 |
| 9c-1100 | 66.61 | 74.28 | 57.35 | 49.81 |
| 9c-1200 | 67.56 | 74.51 | 59.15 | 50.43 |
| 9c-1300 | 67.97 | 75.21 | 59.22 | 50.14 |
| 9c-1400 | 68.13 | 75.39 | 59.36 | 50.91 |
| 9c-1500 | 68.49 | 75.77 | 59.68 | 51.00 |
| 9c-1600 | 68.34 | 75.68 | 59.47 | 50.67 |
| **9c-1620** | **68.41** | **75.65** | **59.65** | **50.81** |

El mejor checkpoint es `9b-3225` (overall 69,40%, rec 77,11%, agg 60,07%). El modelo de 9B supera al de 27B en aproximadamente 1 punto porcentual en overall. Los puntos débiles detectados son el conteo de objetos (`number`, ~51%, subconteo sistemático) y la agregación (`agg`, ~60%).

## Requisitos de hardware

- El adaptador LoRA de 9B añade 205 millones de parámetros al modelo base `Qwen/Qwen3.5-9B`. En bf16, el modelo base ocupa aproximadamente 18 GB de VRAM, por lo que se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A6000) para inferencia con el adaptador fusionado.
- El adaptador LoRA de 27B añade 499 millones de parámetros al modelo base `Qwen/Qwen3.8-27B`. En bf16, el modelo base ocupa aproximadamente 54 GB de VRAM, por lo que se recomienda una GPU de 80 GB (A100, H100) o distribución en varias GPU.
- El entrenamiento se realizó con 8 GPU, pero la inferencia puede hacerse en una sola GPU si se dispone de la VRAM suficiente.
- Para despliegue, se recomienda fusionar el LoRA con el modelo base usando `merge_and_unload()` y servir con vLLM, ya que el autor indica que el `PunicaWrapper` de vLLM no soporta LoRA sobre la torre de visión. También se puede usar el pipeline de Hugging Face Transformers con `PeftModel`.
- La latencia y el throughput no se han publicado, pero al ser un modelo de 9B en bf16 se espera una inferencia razonable en GPUs de 24 GB, con throughput del orden de decenas de tokens por segundo en vLLM.
- No se proporcionan cuantizaciones GGUF o AWQ, por lo que el despliegue en CPU o en GPUs de baja VRAM no está optimizado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El autor no publica resultados de otros modelos multimodales de la misma categoría (por ejemplo, otros adaptadores LoRA sobre Qwen2.5-VL o LLaVA) para el track FRAME del SAVE FOCUS Challenge. Por tanto, la comparativa directa no está disponible. Se puede contextualizar que el modelo de 9B supera al de 27B en precisión, lo que sugiere que el tamaño del modelo base no es el factor dominante en esta tarea, sino el diseño del adaptador y los datos de entrenamiento.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no indica la licencia de los pesos LoRA, lo que impide determinar si se puede usar comercialmente. Se debe consultar la licencia de los modelos base Qwen3.5 y Qwen3.8, que tienen términos propios de Alibaba Cloud.
- **Puntos débiles conocidos**: el conteo de objetos (`number`) tiene una precisión de solo ~51%, con subconteo sistemático; la agregación (`agg`) se queda en ~60%. Esto limita su uso en escenarios donde se requiera precisión alta en estas tareas.
- **Contexto limitado**: la ventana de 4096 tokens es corta para tareas que requieran contexto largo, aunque es suficiente para preguntas sobre una sola imagen.
- **Sesgo y alucinación**: no se han publicado análisis de sesgos ni tasas de alucinación. Como modelo entrenado sobre datos quirúrgicos, puede heredar sesgos de los datos de entrenamiento y puede generar respuestas plausibles pero incorrectas, especialmente en el conteo de objetos.
- **Idioma**: no se documentan los idiomas soportados; aunque Qwen3.5 es multilingüe, el adaptador puede estar optimizado solo para inglés, dado que el prompt del sistema está en inglés.
- **Requiere modelo base**: el repositorio solo contiene adaptadores LoRA, no el modelo completo. Es necesario descargar el modelo base de Qwen para usarlo, lo que aumenta el tamaño y la complejidad del despliegue.
- **Integración con vLLM**: la fusión previa del LoRA es obligatoria para vLLM; no se soporta LoRA dinámico sobre la torre de visión, lo que limita la flexibilidad de servir múltiples adaptadores.
- **Sin garantía de producción**: el modelo es un resultado de investigación para un challenge académico; no ha sido validado clínicamente y no debe usarse como dispositivo médico sin evaluación adicional.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/gwd200/orena-frame-weights
- Perfil del autor en Hugging Face: https://huggingface.co/gwd200
- Página oficial del ORena Focus Challenge: https://orena-focus-challenge.org/
- Documento del track FRAME (PDF): https://or-arena.org/wp-content/uploads/2026/03/FINAL_TRACK-1_document.pdf
- Repositorio de pesos ORENA (otro autor, referencia): https://huggingface.co/ahnaf1393/ORENA_weights
