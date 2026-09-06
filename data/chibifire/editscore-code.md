# chibifire/EditScore-code

## Resumen

EditScore-code es un modelo de la familia EditScore, desarrollada por VectorSpaceLab, cuyo objetivo es evaluar y mejorar la edición de imágenes instruida mediante recompensas de calidad. La familia incluye modelos de 4B a 72B parámetros construidos sobre los vision-language models Qwen2.5-VL y Qwen3-VL, y ha sido aceptada en ICLR 2026. No se dispone de especificaciones técnicas concretas para el modelo EditScore-code; la información disponible se refiere a la familia completa EditScore, que actúa como estándar de evaluación para modelos de edición de imágenes.

La relevancia de EditScore radica en que ofrece una señal de recompensa fiable para el fine-tuning por reinforcement learning y un benchmark público, EditReward-Bench, con 13 subtareas y anotaciones humanas expertas. Según la información proporcionada, el mayor modelo de la familia, con una estrategia de auto-ensamblaje, supera a GPT-5 en dicho benchmark.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (VLM) basada en Qwen2.5-VL y Qwen3-VL |
| Parametros totales | 4B, 7B, 8B, 32B, 72B según variante (no disponible para EditScore-code) |
| Parametros activos | No es un modelo MoE; no aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

Los modelos EditScore se basan en VLMs de la familia Qwen, que combinan un codificador visual con un modelo de lenguaje para procesar instrucciones textuales e imágenes. El entrenamiento se realizó con LLaMA-Factory mediante configuraciones YAML, y los datasets de recompensa y de reinforcement learning (EditScore-Reward-Data y EditScore-RL-Data) están publicados. Se aplica una estrategia de auto-ensamblaje en los modelos más grandes para mejorar la consistencia y el rendimiento como evaluador.

## Capacidades

- Puntuación de calidad de ediciones de imágenes instruidas, devolviendo un valor numérico que refleja la fidelidad a la instrucción.
- Reranking de salidas generadas por modelos de edición como OmniGen2, Flux-dev-Kontext y Qwen-Image-Edit.
- Señal de recompensa para fine-tuning por reinforcement learning de modelos de edición.
- Integración como reward model en pipelines de entrenamiento y evaluación de modelos generativos visuales.
- Compatibilidad con el benchmark EditReward-Bench para comparar modelos de edición.
- Soporte de procesamiento conjunto de texto e imagen (instrucciones de edición en lenguaje natural).

## Casos de uso

- Reranking en pipelines de edición de imágenes: se generan múltiples candidatos con un modelo de edición y EditScore los puntúa para seleccionar el resultado más fiel a la instrucción.
- Fine-tuning por reinforcement learning de modelos de edición: se utiliza EditScore como función de recompensa para optimizar políticas de generación, como en OmniGen2-EditScore7B.
- Evaluación automática de modelos de edición: se emplea EditReward-Bench para medir la calidad de distintos editores de imagen de forma reproducible.
- Curaduría de datasets de edición: se filtran o reordenan pares de imágenes editadas según la puntuación de EditScore para entrenar modelos de generación.
- Control de calidad en producción de imágenes: validación automática de resultados en aplicaciones que generan o modifican imágenes mediante instrucciones.
- Investigación en recompensas y alineación: estudio de reward models para tareas visuales y su impacto en el entrenamiento por RL.

## Benchmarks y rendimiento

EditScore se evalúa en EditReward-Bench, un benchmark diseñado específicamente para reward models en edición de imágenes, con 13 subtareas y 11 modelos de edición, incluyendo propietarios. Según la información disponible, el mayor modelo de la familia con auto-ensamblaje supera a GPT-5 en este benchmark, y las variantes de 4B y 8B basadas en Qwen3-VL igualan o superan a las versiones de 32B y 72B originales. No se han proporcionado cifras numéricas concretas en la información consultada.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos para EditScore-code.
- La familia abarca modelos desde 4B hasta 72B parámetros, por lo que la VRAM necesaria varía considerablemente según la variante.
- No se dispone de datos confirmados sobre GPUs recomendadas, latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la fuente consultada. La comparación con modelos propietarios mencionada en la documentación (GPT-5) no incluye datos numéricos que permitan una comparativa rigurosa.

## Limitaciones y advertencias

- No se han publicado limitaciones específicas para EditScore-code.
- La licencia del modelo no está indicada en la información disponible, por lo que el uso comercial debe verificarse con el autor antes de su adopción.
- Al tratarse de un reward model, su puntuación puede estar sesgada hacia los estilos de edición presentes en los datos de entrenamiento.
- La ausencia de especificaciones técnicas concretas para este modelo impide garantizar su comportamiento en entornos de producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/chibifire/EditScore-code
- Colección de modelos EditScore: https://huggingface.co/collections/EditScore/editscore-68d8e27ee676981221db3cfe
- Repositorio GitHub: https://github.com/VectorSpaceLab/EditScore
- Paper principal: https://arxiv.org/abs/2509.23909
- Paper TempFlow: https://arxiv.org/abs/2508.04324
- Página del proyecto: https://vectorspacelab.github.io/EditScore
- Dataset EditReward-Bench: https://huggingface.co/datasets/EditScore/EditReward-Bench
- Dataset EditScore-Reward-Data: https://huggingface.co/datasets/EditScore/EditScore-Reward-Data
- Dataset EditScore-RL-Data: https://huggingface.co/datasets/EditScore/EditScore-RL-Data
