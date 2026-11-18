# budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300

## Resumen

Qwen3.5-4B-4k-GRPO es un ajuste fino por aprendizaje reforzado del modelo Qwen/Qwen3.5-4B, publicado por el colectivo anónimo `budget-internalization-iclr2027` como parte de una propuesta de artículo para ICLR 2027. El objetivo del entrenamiento es que el modelo internalice un presupuesto de generación de 4.096 tokens al resolver problemas de matemáticas: aprende a razonar y cerrar la respuesta dentro de esa ventana, en lugar de truncarse de forma arbitraria. Se entrena con GRPO sobre el conjunto DeepScaleR de problemas matemáticos, con recompensa binaria basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`.

Se trata de una ablación de semilla: la misma receta se ejecuta con las semillas 42, 43 y 44. Este repositorio corresponde a la semilla 42, ejecución con nombre en clave `maturebass`, y contiene el checkpoint final (paso 300). El modelo base Qwen3.5-4B es multimodal (pipeline `image-text-to-text`), aunque el ajuste se centra exclusivamente en razonamiento matemático.

Con 4.539 millones de parámetros y pesos en BF16, es un modelo compacto pensado para experimentación en investigación sobre internalización de presupuestos de cómputo en RL, no como modelo de producción generalista. Licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, multimodal image-text-to-text); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | No aplica (no es MoE; dato no disponible en la información proporcionada) |
| Longitud de contexto | No disponible (el presupuesto de generación entrenado es de 4.096 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal de 4.539 millones de parámetros, y se ajusta mediante GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 4.096 tokens se truncan y se puntúan tal cual, lo que incentiva al modelo a completar el razonamiento dentro de esa ventana. La recompensa es binaria: 1 si la respuesta extraída de `\boxed{}` coincide con la solución, 0 en caso contrario.

Los datos de entrenamiento provienen del conjunto DeepScaleR (matemáticas) con un máximo de 3 épocas. El entrenamiento usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup, durante 300 pasos. La precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento pide razonamiento paso a paso y la respuesta dentro de etiquetas `\boxed{}`.

## Capacidades

- Razonamiento matemático paso a paso bajo un presupuesto de generación de 4.096 tokens.
- Extracción de respuesta final en formato `\boxed{}`.
- Generación de texto conversacional mediante la plantilla de chat del modelo base.
- Capacidad multimodal de entrada (image-text-to-text) heredada de Qwen3.5-4B, no reforzada específicamente durante el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, visión o audio como capacidad destacada: no disponible en la información proporcionada.

## Casos de uso

- Investigación en internalización de presupuestos de cómputo: reproducir la ablación de semillas y comparar los checkpoints (semillas 42, 43, 44) para estudiar la varianza del entrenamiento con GRPO.
- Evaluación de razonamiento matemático acotado: usar el modelo como baseline que resuelve problemas de DeepScaleR en menos de 4.096 tokens, útil para medir la relación entre presupuesto y precisión.
- Generación de cadenas de razonamiento matemático para destilación: producir soluciones paso a paso con respuesta en `\boxed{}` que sirvan como datos de entrenamiento para modelos menores.
- Servicio de inferencia vía vLLM para experimentos a escala: el tamaño de 4,54 mil millones de parámetros permite desplegar múltiples réplicas en una sola GPU para barridos de hiperparámetros.
- Estudio de robustez ante truncamiento: analizar cómo se comporta el modelo cuando la respuesta excede el presupuesto, ya que el entrenamiento penaliza implícitamente no cerrar a tiempo.
- Reproducción de resultados de un artículo en revisión: el repositorio publica los checkpoints intermedios y finales de cada semilla para facilitar la verificación independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV (el repositorio ocupa 9,1 GB).
- Cuantización a 8 bits: ~4,5-5 GB de pesos; a 4 bits: ~2,3-2,8 GB (estimación a partir del número de parámetros; no hay versiones GGUF publicadas en la información disponible).
- GPU recomendadas: A100, H100 o L40S para servir con vLLM a throughput alto; RTX 4090 o RTX 3090 suficientes para inferencia en BF16 de una sola instancia.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en BF16; en 8 GB sería necesario cuantizar.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve`). Otras opciones como llama.cpp, Ollama o TGI no están confirmadas en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-4k-GRPO (este) | 4,54 B | No disponible (presupuesto de generación 4.096) | GRPO sobre DeepScaleR | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | No disponible | No disponible | Preentrenamiento + post-entrenamiento del autor original | Apache 2.0 (heredada) | Hugging Face |
| Checkpoints de otras semillas (43, 44) de la misma receta | 4,54 B | Presupuesto 4.096 | Misma receta, semilla distinta | Apache 2.0 | Hugging Face |
| Otros modelos de razonamiento matemático de ~4 B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación significativa es contra el modelo base y contra los checkpoints de las otras semillas, que permiten medir la varianza del entrenamiento. No se dispone de datos de benchmarks para comparar el rendimiento numérico con alternativas.

## Limitaciones y advertencias

- Modelo de investigación: es parte de una propuesta anónima para ICLR 2027 y no está pensado como modelo de producción.
- Entrenado exclusivamente en matemáticas (DeepScaleR): el ajuste por RL puede degradar capacidades generales del modelo base, aunque la información disponible no cuantifica este efecto.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base Qwen3.5-4B.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el entrenamiento con recompensa binaria puede favorecer respuestas plausibles aunque incorrectas si el formato `\boxed{}` se cumple.
- Presupuesto de 4.096 tokens: las respuestas que lo exceden se truncan; problemas que requieran cadenas de razonamiento más largas pueden quedar sin resolver correctamente.
- Idiomas soportados: no disponibles; el entrenamiento se realizó sobre problemas en inglés, por lo que el rendimiento en castellano no está verificado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado conviene revisar los términos del modelo base Qwen3.5-4B.
- Sin checkpoints en formato GGUF ni cuantizaciones publicadas: el despliegue en hardware limitado requiere convertir los pesos manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300
- Checkpoint anterior de la misma semilla (paso 290): https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290
- Semilla 43, paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290
- Semilla 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300
- Semilla 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper o blog del artículo: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
