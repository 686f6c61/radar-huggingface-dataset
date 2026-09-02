# graf/science_gemma_1b_mix_metropolis16_qwen4b-metropolis16-88473243-1-142-on

## Resumen

El modelo `graf/science_gemma_1b_mix_metropolis16_qwen4b-metropolis16-88473243-1-142-on` es un clasificador de secuencias (sequence-scoring) desarrollado por el usuario `graf` sobre la base del modelo generativo Qwen3-4B de Alibaba. Está diseñado para emitir una puntuación escalar para cada secuencia de texto, lo que lo convierte en un candidato natural para tareas de ranking de respuestas, reward modeling o evaluación automática de calidad de contenido. El entrenamiento se ha realizado con el framework BonVoyage y el método Metropolis16, utilizando un conjunto de datos de ciencia derivado de Gemma, lo que sugiere un enfoque experimental orientado a dominios científicos.

Con 4.022 millones de parámetros y pesos en BF16, el modelo ocupa unos 8 GB en disco y se distribuye bajo licencia Apache 2.0. Su pipeline es `text-classification`, y aunque no se publican métricas de rendimiento, su arquitectura y datos de entrenamiento lo posicionan como una herramienta para evaluación automatizada de respuestas en contextos técnicos y científicos. Es un modelo de nicho, sin descargas ni popularidad, que probablemente forma parte de una línea de experimentos sobre métodos de entrenamiento de reward models.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B (transformer decoder-only) con cabeza de regresión lineal (num_labels=1) |
| Parametros totales | 4.022.470.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible (solo BF16 safetensors publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B`, un transformer decoder-only con atención estándar y mecanismos de atención multi-consulta (GQA), aunque no se especifican detalles adicionales en la documentación disponible. Sobre esta base se añade una cabeza de salida que produce un único valor escalar por secuencia, lo que permite utilizarlo como modelo de puntuación o reward model. El entrenamiento se realizó con el framework BonVoyage y la técnica Metropolis16, de la que no se ofrecen detalles técnicos en la model card, pero que probablemente introduce una variante de optimización o muestreo para mejorar la convergencia en tareas de ranking.

Los datos de entrenamiento provienen de `graf/gemma_1b_it_science_mix_train`, una mezcla de instrucciones científicas, y la validación se realizó sobre `graf/gemma_1b_it_science_sciknowsci_val`. Se utilizó una tasa de aprendizaje de `1e-5` y se guardó el checkpoint final en la época 141 de 142. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el objetivo parece ser puramente el aprendizaje de una puntuación de calidad sobre secuencias.

## Capacidades

- Emisión de una puntuación escalar para cada secuencia de texto, útil para ranking y evaluación automática.
- Clasificación de pares de respuestas (pairwise ranking) si se comparan las puntuaciones de dos secuencias.
- Funciona como reward model para pipelines de RLHF o filtrado de datos.
- Al estar basado en Qwen3-4B, hereda la capacidad de procesar texto en múltiples idiomas, aunque no se especifica el alcance multilingüe.
- No es un modelo generativo: no produce texto, solo puntuaciones.
- No soporta tool calling ni agentes, ya que su salida es un único número.

## Casos de uso

- Evaluación automática de respuestas científicas: el modelo puede puntuar la calidad de respuestas generadas por LLMs en dominios técnicos, permitiendo filtrar las mejores en un pipeline de generación aumentada.
- Reward model para RLHF: integrable en bucles de aprendizaje por refuerzo para optimizar políticas de generación, asignando recompensas según la puntuación emitida.
- Filtrado de datasets de entrenamiento: puntuar ejemplos de un corpus y descartar aquellos con baja calidad, mejorando la señal de entrenamiento de modelos generativos.
- Ranking de candidatos en sistemas de pregunta-respuesta: dada una pregunta y varias respuestas candidatas, el modelo ordena las respuestas por su puntuación para seleccionar la más adecuada.
- Detección de alucinaciones en contenido científico: puntuaciones bajas pueden correlacionarse con respuestas inexactas o inventadas, aunque no hay evidencia empírica publicada.
- Benchmarking de generadores de texto: comparar la calidad media de las salidas de distintos LLMs sobre un conjunto fijo de prompts científicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. La model card no incluye comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en BF16 (4.022M parámetros × 2 bytes), más overhead de activaciones y cabecera. Con cuantización a 8 bits cabría en ~4 GB, y a 4 bits en ~2 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM para trabajar cómodamente en BF16 (por ejemplo, RTX 3060 12GB, RTX 4070, A10, A100). En cuantización ligera podría ejecutarse en GPUs de 8 GB.
- Compatibilidad con hardware de consumo: sí, en cuantización 8 bits o 4 bits mediante herramientas como llama.cpp o bitsandbytes, aunque no hay archivos GGUF publicados.
- Opciones de despliegue: al ser un modelo de clasificación de secuencias, puede servirse con la librería `transformers` estándar, o mediante `text-embeddings-inference` (mencionado en las etiquetas) para endpoints de alta concurrencia. También es posible usar `vLLM` para inferencia de clasificación, aunque no es su uso principal.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. Existe un modelo hermano `graf/science_gemma_1b_mix_bt_qwen4b-bt-0091fc01-1-142-on` con el mismo tamaño y datos, pero entrenado con un objetivo pairwise BT en lugar de Metropolis16, lo que podría servir para estudios comparativos internos. No se conocen reward models públicos de tamaño similar con los mismos datos de entrenamiento.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y sin validación externa; su rendimiento real es desconocido.
- Entrenado exclusivamente con datos de ciencia en inglés (presumiblemente), lo que limita su aplicación a otros dominios e idiomas.
- Riesgo de sobreajuste al conjunto de entrenamiento, dado el elevado número de épocas (141) y la ausencia de regularización documentada.
- No es un modelo generativo; no puede producir texto y su uso se limita a puntuación de secuencias.
- La técnica Metropolis16 no está documentada públicamente, lo que dificulta la reproducibilidad y comprensión de sus efectos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene su propia licencia (Qwen Research License) que puede imponer restricciones adicionales; conviene verificar ambas.
- No se han publicado análisis de sesgos ni de robustez ante entradas adversarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/graf/science_gemma_1b_mix_metropolis16_qwen4b-metropolis16-88473243-1-142-on
- Modelo hermano con objetivo BT: https://huggingface.co/graf/science_gemma_1b_mix_bt_qwen4b-bt-0091fc01-1-142-on
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
