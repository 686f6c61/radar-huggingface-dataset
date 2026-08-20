# shubhamrgandhi/Qwen3-4B-DPO-prm-pairs

## Resumen

Qwen3-4B-DPO-prm-pairs es un fine-tuning del modelo Qwen/Qwen3-4B-Instruct-2507 (4.02B parámetros) mediante DPO (Direct Preference Optimization) sobre pares de preferencias de *feedback* de supervisor para un agente de codificación LLM. El objetivo es que el modelo, dada la trayectoria de un agente, produzca un análisis de errores a nivel de trayectoria y una guía correctiva, prefiriendo críticas de mayor calidad. El entrenamiento se realizó con TRL `DPOTrainer` sobre 1.541 pares de preferencias (split 90/10) con una ventana de contexto de 8.192 tokens.

Los resultados reportados por el autor son honestos y revelan que el modelo **no supera el azar** en precisión de preferencia por pares (0.4375 frente a 0.5), aunque el margen de recompensa crece hasta +0.131. El autor lo describe como un "checkpoint de registro" sub-entrenado (solo 44 pasos de optimizador) y no como un modelo que supere de forma fiable a su base en esta tarea. No se han publicado benchmarks de capacidades generales, por lo que no se puede afirmar que el fine-tuning no haya degradado el rendimiento del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B-Instruct-2507 base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en bf16, safetensors) |
| Idiomas soportados | no disponible (heredados del modelo base, no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning DPO sobre Qwen3-4B-Instruct-2507, un transformer denso de 4.02B parámetros. El entrenamiento utilizó `trl.DPOTrainer` con β = 0.1 (valor por defecto). El dataset consta de 1.541 pares de preferencias en formato ShareGPT (`messages` + `chosen`/`rejected`), pre-filtrados para caber en 8.192 tokens (mediana ≈ 7.7k tokens). El split fue 90/10 (1.386 train / 155 eval, seed 42). Se usó precisión mixta bf16, DeepSpeed ZeRO-3 sin offload ni gradient checkpointing, en 8 × NVIDIA L40S (46 GB). El batch efectivo fue de 32 (per_device_train_batch_size=1 × gradient_accumulation_steps=4 × 8 GPUs), lo que resultó en 44 pasos de optimizador para 1 época. La tasa de aprendizaje fue 5e-7. El entrenamiento duró 1 h 09 m.

No se reportan innovaciones técnicas más allá del uso estándar de DPO. El autor indica que el modelo está sub-entrenado (44 pasos) y que la curva de métricas aún estaba subiendo al final de la época, sugiriendo que más pasos o una LR mayor podrían mejorar el resultado.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3-4B-Instruct-2507, aunque no se han verificado tras el fine-tuning.
- Tarea específica: análisis de errores a nivel de trayectoria y generación de guía correctiva para agentes de codificación, basado en preferencias de supervisor.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información, aunque el modelo base podría soportarlo).
- Soporte de agentes y multi-step reasoning: el entrenamiento se centra en trayectorias de agentes, pero no se ha evaluado su capacidad real.
- Capacidades multilingües: no disponible (no especificadas).
- Capacidades especiales: ninguna adicional documentada.

## Casos de uso

Dado el rendimiento sub-chance en la tarea objetivo, **no se recomienda su uso en producción**. Los siguientes casos son ilustrativos de la tarea prevista, pero con la advertencia explícita de que el modelo no supera el azar en preferencia por pares:

- Investigación en preferencia de feedback: puede servir como baseline en experimentos académicos sobre DPO aplicado a trayectorias de agentes, comparando su comportamiento con el modelo base.
- Análisis de trayectorias en entornos controlados: en un pipeline de investigación donde se quiera estudiar el efecto de la señal de preferencia, aunque su precisión sea baja.
- Generación de críticas sintéticas: podría usarse para generar ejemplos de análisis de errores, pero con revisión humana obligatoria debido a su baja fiabilidad.
- Estudio de sub-entrenamiento: útil para analizar cómo afecta el número de pasos de optimizador a la convergencia en DPO con contextos largos.
- Comparación de métricas de evaluación: permite explorar la discrepancia entre margen de recompensa y precisión por pares (fenómeno observado en este modelo).
- Desarrollo de pipelines de DPO: como ejemplo de integración con TRL y DeepSpeed ZeRO-3 para fine-tuning de modelos de 4B en contextos largos.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación (en un holdout de 155 pares):

| epoch | eval_loss | eval_rewards/accuracies | eval_rewards/margins |
|------:|----------:|------------------------:|---------------------:|
| 0.00 (baseline) | 0.6914 | 0.0000 * | 0.0000 |
| 0.23 | 0.7172 | 0.3187 | −0.0073 |
| 0.46 | 0.6926 | 0.3875 | +0.0746 |
| 0.69 | 0.6925 | 0.4562 | +0.0866 |
| 0.92 | 0.6949 | 0.4313 | +0.0877 |
| **1.00 (final)** | **0.6680** | **0.4375** | **+0.1310** |

\* En el paso 0 la política es el modelo de referencia, por lo que las recompensas son exactamente 0 y la comparación estricta `chosen > rejected` es falsa para todos los pares (empate degenerado).

No se han publicado benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no se midió la regresión sobre las capacidades del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (2 bytes por parámetro), se necesitan aproximadamente 8 GB de VRAM para los 4.02B parámetros, más overhead de activaciones y KV cache. Con cuantización 4-bit (no disponible en el repo), se podría reducir a ~2.5 GB, pero no hay archivos GGUF ni AWQ publicados.
- GPU recomendadas: cualquier GPU con al menos 8-10 GB de VRAM (RTX 3080/3090, RTX 4000 series, A10, L4, etc.). Para despliegue con contexto largo (8k tokens), se recomienda al menos 12 GB.
- Si cabe en consumer GPU: sí, en GPUs de 12 GB o más (RTX 3060 12GB, RTX 4070, etc.) con bf16 y posiblemente con cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se convierte), o directamente con Hugging Face Transformers.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión preferencia (eval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-DPO-prm-pairs (este) | 4.02B | 8.192 | 0.4375 (sub-chance) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.02B | 32.768 (según documentación del base) | no aplicable | Apache-2.0 | HuggingFace |
| Otros fine-tunes DPO de Qwen3-4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la misma tarea. La comparación con el base es la más relevante: el fine-tuning no logra superar el azar en la tarea de preferencia, y no se ha medido si degrada las capacidades generales del base.

## Limitaciones y advertencias

- Precisión de preferencia por pares sub-chance (0.4375): el modelo no supera el azar en la tarea para la que fue entrenado. No debe asumirse que supera al modelo base en esta tarea.
- Sub-entrenamiento: solo 44 pasos de optimizador con LR 5e-7; la curva de métricas aún subía al final, lo que sugiere que el modelo no está convergido.
- Sin benchmarks de capacidades generales: no se ha medido la regresión sobre razonamiento, código, matemáticas, etc. del modelo base.
- Evaluación limitada: solo se evaluó en un holdout de 155 pares in-distribution; no hay pruebas en otros dominios.
- Comportamiento en prompts cortos no probado: el entrenamiento se realizó con trayectorias largas (≈7.7k tokens); el rendimiento en entradas cortas es desconocido.
- Riesgo de alucinación: no evaluado; al ser un modelo de lenguaje, puede generar críticas plausibles pero incorrectas.
- Sesgos: no se han analizado; el dataset de preferencias puede contener sesgos del supervisor.
- Licencia: Apache-2.0 permite uso comercial, pero el rendimiento sub-chance hace desaconsejable su uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shubhamrgandhi/Qwen3-4B-DPO-prm-pairs
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio TRL (librería de entrenamiento): https://github.com/huggingface/trl
