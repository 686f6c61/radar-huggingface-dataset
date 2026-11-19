# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300

## Resumen
El modelo `budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 4.096 tokens para tareas de razonamiento matemático, de modo que el modelo produzca respuestas correctas dentro de ese límite en lugar de depender de cadenas de pensamiento arbitrariamente largas. El modelo se enmarca en el artículo "Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy".

La arquitectura subyacente es la del Qwen3.5-4B, un transformer multimodal con pipeline `image-text-to-text` y 4.539.265.536 parámetros totales en pesos safetensors. El ajuste emplea GRPO (Group Relative Policy Optimization) con un presupuesto de `max_new_tokens` de 4.096, recompensa binaria de corrección de respuesta y entrenamiento sobre el dataset DeepScaleR (matemáticas) durante un máximo de tres épocas. Se trata de una ablación de semilla: este repositorio corresponde a la semilla 43 y al checkpoint final (paso 300) de una receta replicada con las semillas 42, 43 y 44.

Es relevante ahora porque aborda un problema práctico de producción: el coste y la latencia del test-time scaling en modelos de razonamiento. Al entrenar con refuerzo para que el modelo respete un presupuesto fijo de tokens, se busca mejorar la precisión dentro de ese presupuesto, sacrificando parte de la ganancia que se obtendría dejando al modelo generar indefinidamente. El modelo está publicado con licencia Apache 2.0 y pesos en safetensors, listo para usarse con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B, pipeline `image-text-to-text`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16), librería `transformers` |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de aproximadamente 4,54 mil millones de parámetros. El ajuste fino se realiza mediante GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 4.096 tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a resolver dentro del límite en lugar de extender la cadena de pensamiento. La recompensa es binaria según la corrección de la respuesta extraída de las etiquetas `\boxed{}`.

Los datos de entrenamiento provienen de agentica-org/DeepScaleR-Preview-Dataset (matemáticas), con un máximo de tres épocas, lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule cosine, LR pico de 5e-7, 10 pasos de warmup y 300 pasos totales. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento usa el template de chat del modelo base con la instrucción "Think step-by-step to solve the following problem. Output your answer inside of \boxed{} tags." No se documentan innovaciones adicionales como decodificación especulativa o attention linear.

## Capacidades
- Generación de texto y razonamiento paso a paso orientado a problemas matemáticos.
- Resolución de problemas de matemáticas con formato de respuesta `\boxed{}`.
- Razonamiento bajo un presupuesto fijo de generación de 4.096 tokens (budget internalization).
- Capacidad multimodal heredada del modelo base (pipeline `image-text-to-text`), aunque el ajuste se centra en matemáticas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: el prompt de entrenamiento induce razonamiento paso a paso, pero no se documenta un modo thinking separado.

## Casos de uso
- Resolución de problemas matemáticos en entornos con límite de tokens: el modelo está entrenado para producir respuestas correctas dentro de 4.096 tokens, lo que encaja en pipelines con presupuesto de generación acotado y coste controlado.
- Evaluación académica de razonamiento matemático: útil para reproducir experimentos de budget internalization y comparar semillas (42, 43, 44) sobre problemas de DeepScaleR.
- Generación de soluciones con formato verificable: la extracción de `\boxed{}` permite validación automática de respuestas en sistemas de corrección.
- Tutoría automatizada de matemáticas: puede generar explicaciones paso a paso acotadas en longitud, adecuadas para interfaces con latencia limitada.
- Investigación en RLVR y GRPO: sirve como checkpoint de referencia para estudiar el efecto del presupuesto fijo en la precisión dentro de presupuesto.
- Integración en pipelines de evaluación con `transformers`: al publicarse en safetensors y BF16, puede cargarse directamente para inferencia y benchmarking.
- Experimentos de ablación de semilla: permite comparar variabilidad entre semillas del mismo recipe en tareas de matemáticas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan cifras concretas.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 4,54 mil millones de parámetros en BF16, el peso ronda los 9,1 GB (tamaño del repo), por lo que se requiere al menos esa cantidad más overhead de activaciones.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; por tamaño, cabría en GPUs con suficiente VRAM, pero no se confirma.
- Opciones de despliegue: `transformers` (librería indicada); vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300 | 4.539.265.536 | no disponible | Apache 2.0 | Hugging Face (JetBrains-Research) |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Apache 2.0 (heredada) | Hugging Face |
| budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300 | ~4B | no disponible | Apache 2.0 | Hugging Face (JetBrains-Research) |
| budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300 | ~4B | no disponible | Apache 2.0 | Hugging Face (JetBrains-Research) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- Entrenado específicamente para matemáticas con DeepScaleR; su rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación inherente a modelos generativos; no se reportan métricas de fiabilidad.
- El presupuesto de 4.096 tokens trunca respuestas que lo superan, lo que puede penalizar problemas que requieran cadenas de pensamiento más largas.
- Idiomas soportados no disponibles; no se confirma cobertura multilingüe.
- Longitud de contexto no disponible; no se puede garantizar comportamiento con entradas largas.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y deben respetarse sus términos.
- Es un checkpoint de investigación (ablación de semilla, paso 300); no se documenta validación en producción ni robustez frente a entradas adversarias.
- La model card indica "Citation: TODO", por lo que la referencia académica completa no está disponible.

## Enlaces
- [Hugging Face: JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300](https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Checkpoint seed42 paso 290](https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290)
- [Checkpoint seed42 paso 300](https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300)
- [Checkpoint seed43 paso 290](https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290)
- [Checkpoint seed44 paso 300](https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300)
- [Dataset: agentica-org/DeepScaleR-Preview-Dataset](https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset)
