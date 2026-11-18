# budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280

## Resumen

`gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280` es un ajuste fino por refuerzo (GRPO) del modelo multimodal `google/gemma-4-E2B-it` de Google, publicado por el colectivo anónimo `budget-internalization-iclr2027` como parte de una submission al ICLR 2027. El objetivo del entrenamiento es que el modelo aprenda a resolver problemas de razonamiento matemático operando bajo un presupuesto de generación estricto de 1.024 tokens: las respuestas que agotan el límite se truncan y se puntúan tal cual, de modo que el modelo internaliza la restricción en lugar de ignorarla.

Se trata de una ablación de semilla: la misma receta se ejecutó con tres semillas (42, 43 y 44) y este repositorio corresponde a la semilla 44, en su mejor checkpoint por precisión de validación (paso 280 de 300). El modelo base es un Gemma 4 de la variante E2B, con 5.123.178.051 parámetros totales según los safetensors del repositorio, y conserva la pipeline `any-to-any` del modelo original (entrada imagen-texto, salida de texto).

La relevancia de esta ficha es acotada: no es un modelo de producción, sino un artefacto de investigación que demuestra cómo el RL con recompensa binaria puede forzar al modelo a razonar de forma eficiente en tokens. Su interés principal reside en el estudio de la "internalización del presupuesto" y en la reproducibilidad de recetas GRPO sobre modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, variante E2B); detalles internos no disponibles |
| Parámetros totales | 5.123.178.051 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación es de 1.024 tokens, no la ventana de contexto) |
| Tipos de cuantización | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la licencia de Gemma 4, con license_link a ai.google.dev) |
| Formato de pesos | safetensors, F32; librería `transformers` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 con pipeline `any-to-any`. Sobre esa base se aplicó GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria: se extrae la respuesta de las etiquetas `\boxed{}` y se compara con la solución correcta. Las respuestas que alcanzan el límite de 1.024 tokens se truncan y se evalúan tal cual, lo que penaliza implícitamente la verbosidad excesiva.

Los datos de entrenamiento provienen de `agentica-org/DeepScaleR-Preview-Dataset` (problemas matemáticos), con un máximo de 3 épocas. La configuración de entrenamiento usa 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup. El run de esta semilla (44) se detuvo en el paso 280, seleccionado como mejor checkpoint por precisión de validación medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento usa la plantilla de chat del modelo base e instruye a pensar paso a paso y emitir la respuesta dentro de `\boxed{}`.

## Capacidades

- Razonamiento matemático con presupuesto de generación fijo de 1.024 tokens.
- Generación de cadenas de razonamiento paso a paso ("Think step-by-step").
- Extracción de respuesta final en formato `\boxed{}`.
- Entrada multimodal imagen-texto (heredada del modelo base `any-to-any`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el entrenamiento se centra en problemas matemáticos de un solo turno.
- Capacidades multilingües: no disponible.
- Modo "thinking" explícito: no disponible como capacidad separada; el razonamiento se induce vía prompt.

## Casos de uso

- Investigación sobre eficiencia en tokens: comparar la semilla 44 con las semillas 42 y 43 para medir la varianza de la receta GRPO bajo el mismo presupuesto de 1.024 tokens; el repositorio está diseñado precisamente para esta ablación.
- Evaluación de internalización de presupuesto: analizar si el modelo reduce la longitud de sus cadenas de razonamiento tras el RL y cómo afecta eso a la precisión en problemas de DeepScaleR.
- Reproducción de experimentos de RL: servir como checkpoint de referencia (paso 280) para validar pipelines de GRPO con recompensa binaria y extracción `\boxed{}`.
- Generación de soluciones matemáticas acotadas: en entornos donde el coste por token es crítico, el modelo está entrenado para no exceder 1.024 tokens de salida.
- Estudio de robustez entre semillas: usar los tres runs para cuantificar la sensibilidad del entrenamiento a la inicialización aleatoria.
- Base para ablaciones adicionales: punto de partida para experimentos con presupuestos distintos (p. ej. 512 o 2.048 tokens) manteniendo la misma receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que la selección del checkpoint se basó en precisión de validación sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numéricos de esa métrica ni resultados de MMLU, GSM8K, HumanEval u otros.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos (5.123 millones de parámetros × 4 bytes), más overhead de activaciones y KV cache.
- En BF16/FP16 (si se convierte): unos 10,3 GB de pesos; en cuantización de 8 bits, unos 5,1 GB; en 4 bits, unos 2,6 GB (estimaciones teóricas, no verificadas en la información proporcionada).
- GPU recomendadas: A100 40/80 GB o H100 para F32 sin cuantizar; RTX 4090 (24 GB) podría alojar el modelo en F32 con margen ajustado, y con holgura en BF16 o cuantizado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 (24 GB) en BF16 o cuantizado; en 4 bits podría caber en GPUs de 8-12 GB, aunque no se confirma en la documentación.
- Opciones de despliegue: `transformers` (snippet oficial) y vLLM (`vllm serve <repo>`); llama.cpp/Ollama no se mencionan y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (seed 44, s280) | 5.123 M | no disponible | GRPO sobre Gemma 4 E2B, presupuesto 1k | Apache 2.0 | Hugging Face, 0 descargas |
| `gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250` | misma base | no disponible | misma receta, semilla 42, paso 250 | Apache 2.0 | Hugging Face |
| `gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300` | misma base | no disponible | misma receta, semilla 43, paso 300 | Apache 2.0 | Hugging Face |
| `google/gemma-4-E2B-it` (base) | misma base | no disponible | SFT/alineamiento de Google | Gemma 4 License | Hugging Face |

La comparación más informativa es contra los otros checkpoints de la misma ablación, ya que comparten receta y solo difieren en semilla y paso. Frente al modelo base, la diferencia clave es el ajuste GRPO con recompensa binaria y presupuesto de 1.024 tokens. No se dispone de comparaciones con modelos de otros autores.

## Limitaciones y advertencias

- Modelo de investigación: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni validación externa.
- Entrenado exclusivamente con problemas matemáticos de DeepScaleR; el rendimiento fuera de ese dominio (código, conocimiento general, visión) no está evaluado y probablemente se degrade respecto al base.
- Riesgo de alucinación: el RL con recompensa binaria de corrección puede incentivar atajos o respuestas plausibles sin razonamiento válido; no se documentan análisis de este fenómeno.
- Sesgos: no disponibles; al heredar el modelo base, arrastra los sesgos de Gemma 4, no evaluados en esta ficha.
- Idiomas: no se especifican; el prompt de entrenamiento está en inglés, por lo que el rendimiento en castellano es incierto.
- Licencia: Apache 2.0 según la model card, pero con `license_link` a la licencia de Gemma 4 de Google; conviene verificar los términos de uso comercial de Gemma 4 antes de desplegar, ya que pueden imponer restricciones adicionales.
- Pesos en F32: el repositorio ocupa 20,5 GB, lo que encarece el almacenamiento y la inferencia frente a una versión BF16.
- Checkpoint intermedio (paso 280): no es el checkpoint final del run; el paso 300 está en un repositorio separado.
- Presupuesto de 1.024 tokens: las respuestas se truncan al alcanzarlo, lo que puede cortar razonamientos válidos en problemas especialmente largos.
- Sin información sobre tool calling, agentes ni multilingüismo; no debe asumirse su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint semilla 42, paso 250: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250
- Checkpoint semilla 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300
- Checkpoint semilla 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300
- Checkpoint semilla 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
