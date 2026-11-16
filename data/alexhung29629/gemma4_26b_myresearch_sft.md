# AlexHung29629/gemma4_26b_myresearch_sft

## Resumen

`gemma4_26b_myresearch_sft` es un ajuste fino supervisado (SFT) del modelo Gemma 4 de 26B de parámetros, publicado por el usuario AlexHung29629 en Hugging Face. El modelo parte de la familia Gemma 4 de Google DeepMind y ha sido entrenado sobre un dataset propio en formato JSONL (`data/myresearch-sft.jsonl`), presumiblemente orientado a tareas de investigación y conversación multimodal, dado que su pipeline declarado es `image-text-to-text`. El repositorio tiene un tamaño de 53,1 GB y los pesos están en formato safetensors, con 25.805.933.872 parámetros reales verificados.

El modelo se distribuye con acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo. No se especifica licencia ni idiomas soportados en la información disponible, y el autor no ha publicado resultados de benchmarks en la model card (el bloque model-index aparece vacío). Por tanto, se trata de un artefacto de investigación de nicho, con cero descargas y cero likes en el momento de la consulta, sin validación externa conocida.

Su relevancia es limitada fuera del contexto del autor: es un ejemplo de fine-tuning de un modelo multimodal grande sobre datos propios, útil para quienes quieran reproducir el pipeline o evaluar el efecto del SFT sobre Gemma 4 en tareas de investigación. No obstante, la ausencia de licencia, idiomas, benchmarks y documentación detallada lo convierte en un modelo no apto para producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4; detalles no disponibles |
| Parametros totales | 25.805.933.872 (≈25,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 53,1 GB |
| Acceso | restringido (gated) |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Dataset de entrenamiento | data/myresearch-sft.jsonl (SFT supervisado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de Gemma 4, la familia de modelos abiertos de Google DeepMind. La arquitectura base es un transformer multimodal con capacidad de procesar imagen y texto (pipeline `image-text-to-text`), aunque la información proporcionada no detalla la configuración interna (número de capas, dimensiones, mecanismo de atención, tokenizador visual, etc.). El entrenamiento se realizó con la librería `transformers` y se generó con `Trainer` (`generated_from_trainer`), con registro en TensorBoard, lo que sugiere un pipeline estándar de SFT sobre un dataset conversacional propio en formato JSONL.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El nombre del checkpoint de salida (`gemma4-26b-ebft-mix-noeaft-cp-myresearch`) sugiere una mezcla de datos ("mix") y posiblemente variantes de entrenamiento ("ebft", "noeaft"), pero no hay documentación que aclare estas siglas. Tampoco se indica si el SFT afectó a la torre visual o solo al decodificador de texto.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Gemma 4.
- Procesamiento de imagen y texto (image-text-to-text), según el pipeline declarado.
- Razonamiento y respuesta a instrucciones, presumiblemente reforzado por el SFT sobre el dataset `myresearch-sft.jsonl`.
- Soporte de tool calling / function calling: no disponible (no confirmado en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación académica sobre fine-tuning multimodal: el modelo sirve como referencia para estudiar cómo un SFT sobre un dataset propio (JSONL conversacional) modifica el comportamiento de Gemma 4 en tareas de imagen-texto, comparando con el checkpoint base.
- Asistente de análisis de documentos con imágenes: al ser image-text-to-text, puede emplearse para extraer y resumir información de figuras, tablas o capturas, siempre que se valide su calidad con datos propios antes de usarlo en producción.
- Prototipado de chatbots de dominio específico: el dataset `myresearch-sft.jsonl` sugiere un ajuste orientado a un nicho concreto; el modelo puede servir para experimentar con respuestas especializadas en ese dominio, con evaluación manual obligatoria.
- Generación de descripciones y anotaciones de imágenes: útil en pipelines de etiquetado semiautomático, con revisión humana posterior dada la ausencia de benchmarks.
- Reproducción de pipelines de entrenamiento: al estar generado con `Trainer` y TensorBoard, es un ejemplo práctico para quienes quieran replicar un SFT sobre Gemma 4 con `transformers`.
- Evaluación comparativa de checkpoints: sirve como punto de comparación frente al Gemma 4 original en pruebas internas de razonamiento multimodal, midiendo regresiones o mejoras introducidas por el SFT.
- Docencia y experimentación: adecuado para entornos educativos donde se analice el impacto del SFT y la gestión de repositorios gated, no para despliegues comerciales.

## Benchmarks y rendimiento

El bloque `model-index` de la model card declara una entrada (`outputs/gemma4-26b-ebft-mix-noeaft-cp-myresearch`) pero con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado | Modelo comparable | Resultado comparable |
|---|---|---|---|
| MMLU | no disponible | no disponible | no disponible |
| HumanEval | no disponible | no disponible | no disponible |
| GSM8K | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 52 GB solo para pesos (25,8B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 80 GB para comodidad.
- VRAM estimada en cuantización de 8 bits: ~26 GB para pesos; en 4 bits: ~13-14 GB para pesos, más overhead. No se publican variantes GGUF/AWQ/GPTQ oficiales, por lo que la cuantización requeriría convertir los safetensors manualmente.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples GPU de 24 GB (RTX 4090, L40S) con tensor parallelism o sharding.
- ¿Cabe en GPU de consumo? En FP16 no cabe en una sola GPU de 24 GB; en cuantización 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen ajustado y dependiendo de la longitud de contexto.
- Opciones de despliegue: `transformers` (librería declarada), vLLM, TGI o llama.cpp tras conversión a GGUF; no se proporcionan configuraciones oficiales para ninguno.
- Latencia y throughput: no disponibles (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| gemma4_26b_myresearch_sft | 25,8B | no disponible | no disponible | gated, 0 descargas | no |
| Gemma 4 (base, 26B) | ~26B (según familia) | no disponible en esta ficha | licencia Gemma (según familia) | pública en Hugging Face | sí (según familia) |
| Gemma 2 27B | 27B | 8K tokens (según familia) | licencia Gemma | pública | sí (según familia) |
| Qwen2.5-VL 32B | ~32B | 128K tokens (según familia) | Apache 2.0 (según familia) | pública | sí (según familia) |

Nota: los datos de las filas comparativas corresponden a las familias de modelos citadas y pueden variar según la variante concreta; se indican como referencia orientativa, no como especificación verificada en esta ficha.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el SFT mejore al modelo base; podría haber regresiones en razonamiento, código o matemáticas.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; además, al derivar de Gemma 4, probablemente herede las condiciones de la licencia Gemma, que no se detallan aquí.
- Idiomas no declarados: se desconoce el soporte multilingüe real tras el SFT; el dataset `myresearch-sft.jsonl` podría haber sesgado el modelo hacia un idioma o dominio concreto.
- Riesgo de alucinación: sin evaluación, no se puede descartar que el SFT haya incrementado la confianza en respuestas incorrectas en el dominio de investigación.
- Sesgos conocidos: no documentados; el dataset de entrenamiento es privado y no se describe su composición.
- Acceso restringido (gated): requiere aceptar condiciones y autenticación, lo que complica la reproducibilidad y el despliegue automatizado.
- Cero tracción comunitaria: 0 descargas y 0 likes implican ausencia de validación externa, informes de errores o casos de uso verificados.
- Tamaño del repo (53,1 GB) y 25,8B de parámetros: coste de almacenamiento e inferencia elevado para experimentación.
- Sin variantes cuantizadas oficiales: el despliegue en hardware modesto exige conversión manual y validación de la calidad tras cuantizar.
- Fecha de creación futura (2026-11-16): metadato anómalo que conviene verificar antes de confiar en la cronología del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlexHung29629/gemma4_26b_myresearch_sft
- Documentación de Gemma (familia base): no disponible en la información proporcionada
- Paper de Gemma 4: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
- Dataset `data/myresearch-sft.jsonl`: no disponible públicamente en la información proporcionada
