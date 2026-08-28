# SeanWang0027/student_prefix_polaris_15K_qwen3-4b_continual_Q_qwen3-32b_cutoff4096_epoch_1_mask

## Resumen

Este modelo es un checkpoint de fine-tuning del modelo Qwen3-4B, entrenado con el método Online ROSE (una variante de distillation on-policy) sobre el dataset `SeanWang0027/polaris_hard`, compuesto por 15.368 problemas de matemáticas de competición. El procedimiento consiste en que el profesor (Qwen3-32B) genera continuaciones a partir de los prefijos de 4096 tokens producidos por el estudiante (Qwen3-4B), y el estudiante se entrena con cross-entropy únicamente sobre los tokens del profesor.

El autor es explícito y honesto en la model card: el objetivo de entrenamiento no se movió durante las 240 iteraciones (la NLL pasó de 0.6010 a 0.6026, un cambio de +0.3% dentro del ruido), y solo el 12.32% de los parámetros cambiaron respecto al modelo base, con un drift L2 relativo de 1.75e-3. La causa más probable, según el propio autor, es que el launcher forzó `model_dtype=bfloat16` en el actor, lo que impide que los pesos se actualicen correctamente con un learning rate de 1e-5. No se ha realizado ninguna evaluación downstream. Por tanto, este checkpoint debe tratarse como un artefacto de reproducción de un experimento de investigación, no como un modelo con capacidades mejoradas respecto a Qwen3-4B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B base) |
| Parametros totales | 4.411.424.256 (4.41B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens de prefijo + 1024 tokens de continuación (5120 en total durante el entrenamiento); el modelo base soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3-4B, un transformer decoder-only con atención causal estándar, sin mecanismos MoE ni SSM. El entrenamiento utilizó el método Online ROSE (una variante de distillation on-policy asíncrona): el estudiante genera un prefijo de 4096 tokens, el profesor (Qwen3-32B, con el mismo tokenizador) continúa ese prefijo con 1024 tokens, y la pérdida se calcula como NLL enmascarada solo sobre los tokens del profesor. El dataset es `polaris_hard`, con 15.368 problemas de matemáticas de competición.

El entrenamiento se ejecutó en 8 × NVIDIA GH200 durante 10 horas y 52 minutos, con 4 réplicas del profesor (vLLM TP=1) y 4 ranks de entrenamiento (FSDP). Se usó AdamW con lr constante de 1e-5, sin warmup, weight decay 0.01 y grad clip 1.0. El autor señala que el launcher pasó `model_dtype=bfloat16` al actor, lo que contradice la recomendación de verl de usar fp32 para el modelo y el optimizador; esto explica que el 87.7% de los parámetros permanecieran bit-idénticos al modelo base. No se aplicó RLHF ni DPO; el objetivo fue exclusivamente la NLL enmascarada.

## Capacidades

- Generación de texto: el modelo puede generar texto en inglés, pero no se ha verificado ninguna mejora respecto al base.
- Razonamiento matemático: el dataset de entrenamiento es de problemas de competición, pero no hay evidencia de que el modelo haya aprendido nada nuevo (el objetivo no se movió).
- Tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes: no disponible.
- Multilingüe: solo inglés declarado.
- Thinking mode: no disponible (el modelo base Qwen3-4B tiene modo thinking, pero este checkpoint no lo modifica).

En resumen, las capacidades son esencialmente las del modelo base Qwen3-4B, sin ninguna verificación adicional.

## Casos de uso

Dado que el autor declara explícitamente que no se ha realizado evaluación downstream y que el entrenamiento no produjo cambios significativos, no se recomienda su uso en ningún escenario práctico. Los únicos casos de uso razonables son:

- Reproducción de experimentos: sirve como artefacto para reproducir el pipeline de Online ROSE y verificar el comportamiento del entrenamiento con precisión bf16.
- Investigación sobre fallos de entrenamiento: útil para estudiar por qué un objetivo de NLL no se mueve cuando el optimizador opera en bf16 con lr bajo.
- Comparación de checkpoints: puede usarse como punto de partida para comparar el efecto de diferentes configuraciones de precisión en el mismo pipeline.
- Análisis de drift de pesos: permite estudiar qué capas y tensores cambian mínimamente (por ejemplo, `layers.34.self_attn.k_proj` con drift 3.36e-3).
- Desarrollo de métodos de distillation: el código y la configuración documentada pueden servir de referencia para implementar Online ROSE en otros modelos.
- Benchmarking de infraestructura: el registro de tiempos (163 s/step) y métricas de sistema (pool_failures, teacher_hidden_frac) son útiles para evaluar el rendimiento de hardware en cargas de trabajo de RL/distillation.

No se recomienda su uso en producción, atención al cliente, generación de código, ni ninguna tarea que requiera calidad garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación downstream (ni AIME 2025 ni otros). La única métrica registrada durante el entrenamiento es `critic/score/mean` (≈0.06–0.14), que el autor aclara que es solo de log y no refleja el rendimiento real del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.41B parámetros. En bf16, los pesos ocupan ~8.8 GB (tamaño del repo). Con overhead de activaciones y KV cache, se recomiendan al menos 12-16 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: cualquier GPU con ≥16 GB de VRAM (RTX 4090, A100 40GB, L40S, etc.). En consumer, una RTX 3090/4090 es suficiente para inferencia en bf16.
- Si cabe en consumer GPU: sí, en GPUs con 16 GB o más. Para cuantizaciones de 8 bits o 4 bits (no disponibles en el repo), cabría en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF), o directamente con transformers. No se han publicado configuraciones específicas.
- Latencia y throughput: no disponible. Dado que es un modelo de 4B, se espera un throughput del orden de 100-200 tokens/s en una A100 con vLLM, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3-4B (base) | 4.41B | 32.768 | Apache-2.0 | Modelo de referencia, con evaluación pública |
| Este checkpoint | 4.41B | 32.768 (heredado) | Apache-2.0 | Artefacto de reproducción, sin evaluación |
| Qwen3-32B (profesor) | 32B | 32.768 | Apache-2.0 | Modelo de referencia, con evaluación pública |

No se dispone de datos de rendimiento para este checkpoint. La comparación con otros modelos de 4B (como Llama-3.2-3B, Gemma-2-9B, etc.) no es posible sin benchmarks. El único dato objetivo es que el checkpoint es prácticamente idéntico al base (drift L2 1.75e-3), por lo que su rendimiento esperado es el de Qwen3-4B, sin ninguna mejora verificada.

## Limitaciones y advertencias

- El entrenamiento no produjo cambios significativos: el objetivo de NLL no se movió (0.6010 → 0.6026) y solo el 12.32% de los parámetros cambiaron, con un drift L2 de 1.75e-3. El modelo es prácticamente idéntico al base.
- No se ha realizado ninguna evaluación downstream. No hay datos de rendimiento en tareas de razonamiento, matemáticas, código ni lenguaje general.
- El autor atribuye el fallo a la precisión bf16 en el optimizador, lo que impide actualizaciones efectivas con lr=1e-5. Esto es una advertencia importante para quien intente reproducir el experimento.
- El dataset de entrenamiento es solo en inglés; no se ha verificado el comportamiento en otros idiomas.
- El modelo no ha sido probado en producción. No se recomienda su uso en aplicaciones reales.
- La licencia Apache-2.0 permite uso comercial, pero dado que no hay garantías de calidad, el usuario asume todo el riesgo.
- El autor advierte que la métrica `critic/score/mean` registrada durante el entrenamiento no es indicativa del rendimiento real, ya que se calcula sobre prefijos truncados y continuaciones parciales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/student_prefix_polaris_15K_qwen3-4b_continual_Q_qwen3-32b_cutoff4096_epoch_1_mask
- Dataset `polaris_hard`: https://huggingface.co/datasets/SeanWang0027/polaris_hard
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del código Online ROSE: https://github.com/cl-from-nothing/online-rose
- Repositorio POLARIS (receta de post-entrenamiento): https://github.com/ChenxinAn-fdu/POLARIS
