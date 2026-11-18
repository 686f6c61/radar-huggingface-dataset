# budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290

## Resumen

`qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base Qwen/Qwen3.5-4B, desarrollado por el grupo anónimo `budget-internalization-iclr2027` como parte de una submission a ICLR 2027. El objetivo del entrenamiento es el razonamiento matemático bajo un presupuesto de generación fijo de 8.192 tokens, es decir, el modelo aprende a resolver problemas de matemáticas produciendo cadenas de razonamiento que caben dentro de esa ventana y que terminan con la respuesta extraída de etiquetas `\boxed{}`.

El modelo forma parte de un estudio de ablación de semillas: la misma receta se entrena con tres semillas (42, 43 y 44), y este repositorio concreto corresponde a la semilla 44, checkpoint 290 (el mejor por precisión de validación de esa ejecución). El checkpoint final del paso 300 se publica en un repositorio separado. El pipeline declarado es `image-text-to-text`, heredado del modelo base multimodal Qwen3.5-4B, aunque el ajuste se centra en matemáticas.

Con 4.539.265.536 parámetros totales y pesos en BF16 (repo de 9,1 GB), es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con cuantización. Su interés radica en estudiar cómo el RL con recompensa binaria de corrección internaliza un presupuesto de tokens, un fenómeno relevante para controlar el coste de inferencia en modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B, multimodal image-text-to-text) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generación entrenado: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con pipeline `image-text-to-text`, y se ajusta mediante GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria: se extrae la respuesta de las etiquetas `\boxed{}` y se compara con la solución correcta. Las respuestas que alcanzan el presupuesto de 8.192 tokens se truncan y se puntúan tal cual, lo que penaliza implícitamente las cadenas de razonamiento demasiado largas.

El dataset de entrenamiento es DeepScaleR (matemáticas, `agentica-org/DeepScaleR-Preview-Dataset`), con un máximo de 3 épocas. La configuración usa lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup. El entrenamiento se detiene en el paso 290 (mejor checkpoint por precisión de validación, medida cada 10 pasos sobre 480 problemas retenidos de DeepScaleR). El prompt de entrenamiento pide razonamiento paso a paso y salida dentro de `\boxed{}`. Los pesos se publican en BF16.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento paso a paso, optimizado para producir la respuesta final dentro de `\boxed{}`.
- Generación de texto conversacional (heredada del modelo base y del chat template de Qwen3.5).
- Capacidades multimodales imagen-texto heredadas del modelo base (pipeline `image-text-to-text`), aunque el ajuste RL se centra en matemáticas.
- Internalización de un presupuesto de generación de 8.192 tokens: el modelo ha sido entrenado para completar razonamientos dentro de ese límite.
- Tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el razonamiento paso a paso está orientado a matemáticas.
- Capacidades multilingües: no disponibles (no se documentan idiomas).

## Casos de uso

- Resolución de problemas matemáticos con coste controlado: el modelo está entrenado para responder dentro de 8.192 tokens, lo que permite presupuestar latencia y coste por consulta en pipelines de evaluación matemática.
- Generación de soluciones paso a paso para datasets tipo DeepScaleR: útil para producir trazas de razonamiento con respuesta final en `\boxed{}` y validación automática por extracción.
- Investigación en RL y ablación de semillas: sirve como checkpoint de referencia (semilla 44, paso 290) para comparar estabilidad de entrenamiento frente a las semillas 42 y 43 y frente al paso 300.
- Estudio de internalización de presupuesto de tokens: permite analizar si el modelo aprende a ajustar la longitud de su razonamiento al límite de 8k sin truncamiento.
- Fine-tuning posterior o destilación: al ser un modelo de 4,5B con licencia Apache 2.0, puede servir de base para ajustes específicos de dominio o para generar datos de razonamiento.
- Despliegue en entornos con GPU de consumo: con cuantización (aunque no se publican versiones GGUF), el tamaño de 4,5B permite servir el modelo en GPUs de gama alta de consumo para pruebas de razonamiento matemático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas retenidos de DeepScaleR, pero no se incluyen las cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB de pesos más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 12-16 GB de VRAM para contexto de 8k.
- En cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones, no se publican cuantizaciones oficiales).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con contexto completo; RTX 4090 (24 GB) para BF16 con holgura.
- GPU de consumo: cabe en RTX 4090 en BF16; en RTX 3090 (24 GB) también; en GPUs de 12-16 GB requeriría cuantización.
- Opciones de despliegue: `transformers` (código de ejemplo en la model card), vLLM (`vllm serve ...`), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B GRPO 8k, seed 44) | 4,54B | no disponible (presupuesto 8k) | Razonamiento matemático con RL | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Modelo multimodal general | apache-2.0 | Hugging Face |
| Checkpoints hermanos (seed 42, seed 43, paso 300) | 4,54B | no disponible (presupuesto 8k) | Misma receta, distinta semilla/checkpoint | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks para comparar el rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint de una submission anónima a ICLR 2027, no un modelo de producción validado.
- Especializado en matemáticas: el ajuste RL se centra en DeepScaleR y recompensa binaria de corrección; su rendimiento en otras tareas no está documentado.
- Riesgo de alucinación: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos; la extracción de `\boxed{}` no garantiza corrección.
- Truncamiento a 8.192 tokens: las respuestas que superan el presupuesto se truncan y se puntúan tal cual, lo que puede degradar la calidad en problemas muy largos.
- Idiomas: no se documentan idiomas soportados; no se garantiza un buen rendimiento multilingüe.
- Licencia: Apache 2.0 heredada del modelo base, lo que permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3.5-4B.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin trabajo adicional.
- Sin datos de benchmarks públicos: no es posible evaluar su calidad frente a alternativas sin ejecutar evaluaciones propias.

## Enlaces

- Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint hermano seed 42, paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Checkpoint hermano seed 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Checkpoint hermano seed 43, paso 160: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Checkpoint hermano seed 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Checkpoint hermano seed 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
