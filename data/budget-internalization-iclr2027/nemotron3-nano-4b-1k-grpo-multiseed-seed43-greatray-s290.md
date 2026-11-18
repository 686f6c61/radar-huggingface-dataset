# budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290

## Resumen
Este repositorio contiene un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por el grupo anónimo `budget-internalization-iclr2027` como parte de una submission al congreso ICLR 2027. El objetivo del entrenamiento es que el modelo internalice un presupuesto de generación fijo de 1.024 tokens al resolver problemas matemáticos, es decir, que aprenda a razonar y producir la respuesta final dentro de esa ventana sin necesidad de truncar la salida. El checkpoint publicado corresponde al paso 290 de una ejecución con semilla 43, apodada `greatray`, y es el mejor checkpoint de esa ejecución según precisión de validación.

El modelo parte de la arquitectura `nemotron_h` de NVIDIA y cuenta con 3.973.556.832 parámetros totales (aproximadamente 4 mil millones), con pesos almacenados en F32. Se trata de un modelo de texto especializado en razonamiento matemático y generación de cadenas de pensamiento, entrenado sobre el dataset DeepScaleR-Preview con un máximo de 3 épocas. Su relevancia radica en el estudio de la "internalización de presupuesto": cómo un modelo pequeño puede aprender a ajustar la longitud de su razonamiento a un límite predefinido, un problema práctico para despliegues con latencia y coste acotados.

El repositorio forma parte de un ablation multi-semilla (semillas 42, 43 y 44) con el mismo recetario, lo que permite evaluar la varianza del entrenamiento. No se han publicado datos de benchmarks en la información disponible, y el modelo no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (transformer, según tag de la librería) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (F32), con `custom_code` y `trust_remote_code` requerido |

## Arquitectura y entrenamiento
El modelo es un ajuste fino del checkpoint `NVIDIA-Nemotron-3-Nano-4B-BF16` de NVIDIA, cuya arquitectura se etiqueta como `nemotron_h` en la librería `transformers`. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensionalidad, mecanismo de atención) en la información proporcionada. El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 1.024 tokens se truncan y se puntúan tal cual.

El entrenamiento usa el dataset DeepScaleR (matemáticas) con un máximo de 3 épocas, lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno y LR pico de 2e-6, 10 pasos de warmup y 290 pasos totales. La recompensa es binaria según la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonar paso a paso y emitir la respuesta dentro de `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades
- Generación de texto y razonamiento matemático con cadena de pensamiento explícita.
- Resolución de problemas matemáticos con formato de respuesta `\boxed{}`.
- Internalización de un presupuesto de generación de 1.024 tokens: el modelo está entrenado para completar el razonamiento dentro de esa ventana.
- Generación conversacional (tag `conversational`), usando la plantilla de chat del modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking separado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Evaluación de investigación sobre internalización de presupuesto: sirve como checkpoint de referencia para estudiar cómo un modelo de 4B aprende a ajustar la longitud de su razonamiento a 1.024 tokens, comparando con las otras semillas del ablation.
- Razonamiento matemático con latencia acotada: al estar entrenado con un límite fijo de tokens, es adecuado para entornos donde el coste por consulta debe ser predecible, como pipelines de corrección automática de ejercicios.
- Generación de soluciones paso a paso para datasets educativos: puede producir cadenas de razonamiento con respuesta final en formato `\boxed{}`, útil para generar datos de entrenamiento o material didáctico.
- Baseline en experimentos de RL: su recetario GRPO documentado (recompensa binaria, truncado a presupuesto) permite reproducir y comparar variantes de entrenamiento.
- Fine-tuning posterior para dominios matemáticos específicos: al ser un modelo de 4B con licencia abierta de NVIDIA, puede adaptarse con recursos moderados.
- Despliegue en investigación con vLLM: el autor documenta el comando `vllm serve` con `--trust-remote-code`, lo que facilita servir el modelo en entornos de experimentación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numéricos.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos en F32 ocupan aproximadamente 15,9 GB (tamaño del repo), por lo que la inferencia en F32 requiere alrededor de 16 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: A100, H100 o GPUs con al menos 24 GB de VRAM para F32; una RTX 4090 (24 GB) podría ser justa para F32 y requeriría cuantización para mayor margen.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 (24 GB) en F32 con contexto corto; no se documentan cuantizaciones oficiales, por lo que no se puede confirmar compatibilidad con GGUF o formatos de 4/8 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y vLLM (`vllm serve ... --trust-remote-code`), según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B GRPO 1k, seed 43) | ~4B | no disponible | nvidia-nemotron-open-model-license | Ajuste GRPO para presupuesto de 1.024 tokens; checkpoint de investigación |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | nvidia-nemotron-open-model-license | Modelo base sin ajuste GRPO; disponible en Hugging Face |
| Otras semillas del mismo ablation (seed 42, 44) | ~4B | no disponible | nvidia-nemotron-open-model-license | Mismo recetario, distinta semilla; permiten medir varianza |

No se dispone de datos de benchmarks para comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias
- Modelo de investigación anónimo asociado a una submission a ICLR 2027; no hay validación independiente ni benchmarks publicados.
- Entrenado exclusivamente en matemáticas (DeepScaleR) con recompensa binaria; el rendimiento fuera de ese dominio no está documentado y puede degradarse respecto al modelo base.
- El presupuesto de 1.024 tokens es una restricción de entrenamiento: fuera de ese régimen el comportamiento no está caracterizado.
- Riesgo de alucinación en razonamientos matemáticos y en la extracción de respuestas `\boxed{}`; la recompensa binaria no penaliza explícitamente razonamientos incorrectos que acierten la respuesta.
- Idiomas soportados no documentados; no se garantiza buen rendimiento en castellano.
- Licencia `nvidia-nemotron-open-model-license`: es necesario revisar sus términos para uso comercial, ya que no es una licencia OSI estándar.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio.
- Pesos en F32 (15,9 GB), lo que encarece el despliegue frente a versiones BF16 o cuantizadas.
- Sin descargas ni likes en Hugging Face; sin comunidad que valide su comportamiento en producción.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint final step 300 (misma semilla): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Semilla 42, step 290: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Semilla 42, step 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Semilla 44, step 240: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Semilla 44, step 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Dataset DeepScaleR-Preview: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
