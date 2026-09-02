# graf/science_gemma_1b_mix_bt_qwen4b-bt-0091fc01-1-142-on

## Resumen

Este modelo es un checkpoint de fine-tuning del modelo base Qwen/Qwen3-4B, entrenado con un objetivo pairwise ranking de tipo Bradley-Terry (BT) sobre un conjunto de datos de ciencia derivado de Gemma. Lo desarrolla el usuario `graf` y se publica bajo licencia Apache 2.0. Su propósito no es la generación de texto, sino la puntuación de secuencias: produce un único valor escalar por entrada, lo que lo convierte en un reward model o clasificador de preferencias para tareas de evaluación y alineación.

El modelo se entrenó con el framework BonVoyage, usando como datos de entrenamiento el dataset `graf/gemma_1b_it_science_mix_train` y como validación `graf/gemma_1b_it_science_sciknowsci_val`. El checkpoint final corresponde a la época 141 de 142, con una tasa de aprendizaje de 1e-5. Arquitectónicamente hereda los 4.022 millones de parámetros de Qwen3-4B, con una cabeza de salida de un solo escalar (`num_labels=1`). Su relevancia actual radica en ser un ejemplo de reward model específico para dominios científicos, útil para pipelines de RLHF o para reordenar respuestas generadas por otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B base) con cabeza de regresión escalar |
| Parametros totales | 4.022.470.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, probablemente 32.768 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only con atención causal estándar y mecanismos de atención con RoPE. Sobre esta base se añade una cabeza de regresión que produce un único valor escalar por secuencia, típico de los modelos de recompensa. El entrenamiento se realizó con un objetivo pairwise (Bradley-Terry), donde el modelo aprende a asignar puntuaciones más altas a las respuestas preferidas frente a las no preferidas dentro de pares. El framework utilizado es BonVoyage, orientado a fine-tuning de reward models.

Los datos de entrenamiento provienen de `graf/gemma_1b_it_science_mix_train`, un dataset de mezcla científica basado en Gemma 1B IT, y la validación se realizó sobre `graf/gemma_1b_it_science_sciknowsci_val`. No se especifica el número total de tokens ni la composición exacta del dataset. El entrenamiento duró 142 épocas, con el checkpoint final en la época 141, y una tasa de aprendizaje de 1e-5. El tokenizer guardado durante el entrenamiento usa `pad_token_id=151643`. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Puntuación de secuencias: genera un valor escalar por texto de entrada, indicando la calidad o preferencia según los datos de entrenamiento.
- Recompensa en pipelines de RLHF: puede usarse como reward model para optimizar políticas con PPO u otros algoritmos.
- Reranking de respuestas: dado un conjunto de respuestas candidatas, puede ordenarlas por su puntuación.
- Clasificación de preferencias: entrenado con objetivo pairwise, es adecuado para distinguir entre respuestas buenas y malas en dominios científicos.
- Especialización en ciencia: los datos de entrenamiento provienen de una mezcla de contenido científico (derivado de Gemma 1B IT), por lo que su comportamiento está sesgado hacia ese dominio.
- Integración con transformers: compatible con la librería `transformers` y con `text-embeddings-inference` (según las tags del repositorio).

## Casos de uso

- Reward model para RLHF en dominios científicos: el modelo puede integrarse en un pipeline de PPO para alinear un modelo generativo con preferencias humanas sobre contenido científico, proporcionando la señal de recompensa por cada respuesta generada.
- Reranking de respuestas en sistemas de QA científica: dado un conjunto de respuestas candidatas producidas por un LLM, el modelo las puntúa y selecciona la mejor antes de mostrarla al usuario final.
- Evaluación automática de calidad de respuestas: puede usarse como métrica proxy para medir la calidad de respuestas generadas por otros modelos en tareas de ciencia, sin necesidad de anotación humana.
- Filtrado de datasets: para limpiar corpus científicos, puntuando cada entrada y descartando aquellas con baja puntuación, mejorando la calidad del conjunto de entrenamiento.
- Comparación de modelos: permite comparar dos versiones de un mismo modelo generativo puntuando sus salidas sobre un mismo prompt y decidiendo cuál es preferible.
- Optimización de búsqueda en agentes científicos: en un agente que genera hipótesis o explicaciones, el modelo puede guiar la selección de la mejor hipótesis entre varias generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con BF16 y 4.022 millones de parámetros, se necesitan aproximadamente 8 GB de VRAM solo para los pesos. Con activaciones y overhead, se recomienda al menos 12 GB para inferencia en lote pequeño.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100. En GPUs con 16 GB puede funcionar con cuidado en la gestión de memoria.
- Si cabe en consumer GPU: sí, en GPUs de 24 GB (RTX 3090/4090) puede ejecutarse sin cuantización; en GPUs de 16 GB (RTX 4080) podría requerir cuantización o reducción de batch.
- Opciones de despliegue: al ser un modelo `transformers` estándar, puede servirse con vLLM, Hugging Face TGI, o mediante `text-embeddings-inference` (indicado en las tags). También puede usarse con `transformers` directamente en Python.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa con otros modelos de la misma categoría (reward models científicos). Se puede mencionar que comparte arquitectura con Qwen3-4B, pero no se dispone de modelos comparables específicos en la información disponible.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado exclusivamente con datos científicos derivados de Gemma 1B IT, por lo que su rendimiento fuera de este dominio puede ser deficiente.
- Riesgo de sobreajuste: el entrenamiento duró 142 épocas, lo que sugiere un posible sobreajuste al dataset de entrenamiento; la validación solo se realizó sobre un conjunto específico (`sciknowsci_val`).
- No es un modelo generativo: no puede generar texto; solo produce puntuaciones escalares. Usarlo como chatbot o generador dará resultados incorrectos.
- Datos de entrenamiento no documentados en detalle: no se especifica el número de tokens, la composición exacta ni el proceso de anotación de preferencias.
- Contexto no confirmado: aunque hereda de Qwen3-4B una ventana de contexto probable de 32.768 tokens, no se ha verificado en la documentación del modelo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a otros reward models.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento podrían tener restricciones adicionales no especificadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/graf/science_gemma_1b_mix_bt_qwen4b-bt-0091fc01-1-142-on
- Dataset de entrenamiento: https://huggingface.co/datasets/graf/gemma_1b_it_science_mix_train
- Dataset de validación: https://huggingface.co/datasets/graf/gemma_1b_it_science_sciknowsci_val
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Página de Gemma (Google DeepMind): https://deepmind.google/models/gemma/
- Repositorio Gemma (GitHub): https://github.com/google-deepmind/gemma
- Página de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
