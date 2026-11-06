# mrysh/qwen3.5-4b-prune_depth_30

## Resumen

`mrysh/qwen3.5-4b-prune_depth_30` es una versión podada en profundidad del modelo `Qwen/Qwen3.5-4B` de Alibaba Qwen, publicada por el usuario mrysh como parte de un benchmark interno de poda (4 modelos x 8 variantes) que compara distintas técnicas de compresión frente a la cuantización. La poda se realizó con NVIDIA ModelOpt (Minitron) en su versión 0.46.0rc1, reduciendo el número de capas del transformer de 32 a 22 y eliminando el 26,7 % de los parámetros del checkpoint original.

El resultado es un modelo de 3.081.952.064 parámetros (frente a los aproximadamente 4.200 millones del base), con la anchura intacta y sin destilación ni fine-tuning posterior. Se trata, por tanto, de un artefacto de investigación orientado a medir la degradación de calidad introducida por la poda, no de un modelo listo para producción. El autor indica explícitamente que debe esperarse una caída de rendimiento frente al modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una técnica concreta de compresión estructural (depth pruning con selección de capas por importancia) aplicada a un modelo Qwen 3.5; por otro, sirve como referencia de qué esperar cuando se recorta profundidad sin recuperar capacidad mediante destilación. Solo se conserva la parte lingüística: la torre de visión y la cabeza de predicción multi-token han sido eliminadas, por lo que el modelo es exclusivamente de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5 text), podado en profundidad de 32 a 22 capas |
| Parámetros totales | 3.081.952.064 (3,08 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-4B; no confirmada en la model card) |
| Tipos de cuantización | no disponible (el autor menciona que el benchmark compara contra cuantizaciones, pero no lista formatos soportados) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño en disco | 6,184 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Método de poda | Depth pruning, nivel 0,3, NVIDIA ModelOpt Minitron |
| Reducción de parámetros | 26,7 % del checkpoint |
| Calibración | 512 muestras mixtas |
| Fecha de publicación | 2026-11-04 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 en su variante de 4 B, un transformer decoder-only con atención estándar (no se documenta en la model card el uso de atención lineal ni mecanismos híbridos). La intervención consiste en una poda estructural de profundidad: se eliminan 10 de las 32 capas del bloque lingüístico, seleccionando cuáles conservar mediante una medida de importancia calculada sobre un conjunto de calibración de 512 muestras mixtas. La anchura (dimensión de los estados ocultos y de las proyecciones) permanece sin cambios, lo que significa que los tensores supervivientes conservan la forma original y el checkpoint resultante es directamente cargable con la arquitectura del base menos las capas eliminadas.

No se realizó destilación ni fine-tuning después de la poda, un detalle crítico: el modelo no ha tenido oportunidad de recuperar la capacidad perdida por la eliminación de capas. Tampoco se documentan en la información disponible los datos de entrenamiento originales de Qwen3.5-4B (número de tokens, composición del corpus, uso de RLHF/DPO), más allá de lo que declare la model card del modelo base. Además, se han eliminado la torre de visión y la cabeza de predicción multi-token, de modo que el checkpoint es estrictamente de texto y no soporta entradas multimodales ni decodificación especulativa basada en MTP.

## Capacidades

- Generación de texto en modo texto únicamente; no hay soporte de visión tras la eliminación de la torre visual.
- Razonamiento y respuesta a preguntas en formato conversacional, heredado del base Qwen3.5-4B, con la degradación esperable por la poda.
- Generación de código y matemáticas: capacidad presumible por herencia del base, aunque no verificada en la información disponible.
- Tool calling / function calling: no confirmado en la model card; el benchmark del autor evalúa BFCL, lo que sugiere que el formato de herramientas es compatible, pero no se garantiza su calidad tras la poda.
- Modo thinking: el autor indica que la evaluación se hizo con "thinking off" en vLLM; no se documenta el comportamiento con thinking activado.
- Capacidades multilingües: no disponibles; la model card no declara idiomas y no se ha verificado el comportamiento fuera del inglés.
- Capacidades de agente multi-paso: no documentadas.

## Casos de uso

- Investigación sobre poda de modelos: el caso de uso principal es servir como punto de comparación en estudios de compresión. Un investigador puede cargar este checkpoint junto con el base y las otras siete variantes del benchmark para medir la curva de degradación en BFCL, MedQA y sesgo de contratación.
- Evaluación de técnicas de recuperación post-poda: dado que no hubo destilación, este modelo es una línea base ideal para medir cuánto mejora un fine-tuning o una destilación posterior sobre el mismo recorte de capas.
- Despliegue en entornos con restricciones de memoria muy estrictas: con 3,08 B de parámetros y 6,2 GB en safetensors, cabe en GPUs de consumo con cuantización adicional, aunque la calidad no está garantizada para producción.
- Pruebas de regresión de pipelines de inferencia: útil para validar que un servidor vLLM o un harness de evaluación maneja correctamente checkpoints con arquitecturas modificadas (menos capas que el base).
- Experimentos académicos de sesgo: el benchmark incluye una prueba de sesgo de contratación (hiring-bias), por lo que el modelo puede emplearse para estudiar cómo la poda afecta a sesgos demográficos en decisiones automatizadas.
- Docencia sobre compresión de modelos: ejemplo didáctico de poda por importancia de capas con ModelOpt, reproducible con la receta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo forma parte de un benchmark que evalúa BFCL, hiring-bias y MedQA con vLLM, pero no incluye las cifras obtenidas ni la comparación con el base o con las cuantizaciones. No se inventan números.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,2 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, 10-12 GB para contextos moderados.
- VRAM estimada en FP8/INT8: alrededor de 3,1-3,5 GB de pesos; viable en GPUs de 8 GB con contexto corto.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,6-2 GB de pesos; cabe en GPUs de consumo de 4-6 GB con contexto limitado.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con throughput alto; RTX 4090, RTX 3090, RTX 4080 y GPUs de 8 GB o más para inferencia local.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 8 GB requiere cuantización.
- Opciones de despliegue: vLLM (usado por el autor en el benchmark), llama.cpp y Ollama si se generan pesos GGUF (no confirmado en la información disponible), TGI (compatibilidad no verificada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_depth_30 | 3,08 B | no disponible | Apache 2.0 | Hugging Face | Poda de profundidad sin destilación; calidad degradada |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | no disponible | Apache 2.0 | Hugging Face | Modelo original; referencia de calidad |
| Otras variantes del benchmark del autor | no disponible | no disponible | Apache 2.0 | Hugging Face | Siete variantes de poda adicionales y cuantizaciones |
| Qwen3-4B (generación anterior) | ~4 B | 32k (según versión) | Apache 2.0 | Hugging Face | Alternativa de tamaño similar de la familia Qwen |

La comparación con modelos de otras familias (Llama 3.2 3B, Phi-3.5-mini, Gemma 2 2B) no se incluye porque la información disponible no permite contrastar rendimiento ni contexto de forma verificable.

## Limitaciones y advertencias

- Degradación de calidad esperada: el autor advierte explícitamente de una caída de rendimiento frente al base al no haberse aplicado destilación ni fine-tuning tras la poda.
- Modelo de investigación, no de producción: es un artefacto de benchmark con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.
- Solo texto: la torre de visión y la cabeza de predicción multi-token han sido eliminadas, por lo que no acepta imágenes ni soporta decodificación especulativa MTP.
- Idiomas no declarados: se desconoce el comportamiento multilingüe tras la poda; el base podría cubrir varios idiomas, pero no está verificado.
- Riesgo de alucinación: no medido en la información disponible; la poda puede agravar la pérdida de coherencia en contextos largos.
- Sesgos: el benchmark incluye una prueba de hiring-bias precisamente porque se espera que la poda afecte a los sesgos; no se publican resultados.
- Contexto: no se confirma la longitud de contexto soportada; asumir la del base sin verificación es arriesgado.
- Licencia Apache 2.0: permite uso comercial, pero el autor remite a la model card del base para condiciones completas; conviene revisar las obligaciones de atribución.
- Sin garantías de soporte: el repositorio no incluye pipeline declarado, demo ni documentación de inferencia más allá de la receta de poda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA ModelOpt (herramienta de poda): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Metodología Minitron (referencia de la técnica): no disponible en la información proporcionada
- Paper o blog del benchmark del autor: no disponible en la información proporcionada
