# laion/tt-x2_clip-hi0p05-10-30B

## Resumen

El modelo `laion/tt-x2_clip-hi0p05-10-30B` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base **Qwen/Qwen3-Coder-30B-A3B-Instruct**, desarrollado por LAION. Forma parte del barrido TaskTrove X2, que explora variantes de clipping superior (PPO upper-clip) en el algoritmo GRPO. El objetivo es mejorar el rendimiento del modelo en tareas de codificación agéntica mediante entrenamiento con recompensas basadas en `pass_ratio` sobre el dataset `DCAgent/exp_rpt_multifile`.

El checkpoint corresponde al paso global 10, seleccionado por la EMA de recompensa de las últimas 5 iteraciones (alpha = 1/3) como el mejor punto del run. Sin embargo, el entrenamiento se terminó prematuramente en el paso 76 de 80 debido a un aumento de la entropía de la política (~8x), lo que indica que el run no alcanzó convergencia. A pesar de ello, el paso 10 muestra métricas de recompensa y pass@8 razonables (0.2344 y 0.4516 respectivamente), aunque con una entropía baja (0.1184).

Se trata de un modelo de investigación, no un producto final. Su arquitectura es la de Qwen3-Coder-30B-A3B-Instruct, un transformer MoE con 30.5B parámetros totales y 3B activos. El checkpoint está disponible en formato safetensors y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) basado en Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30.532.122.624 (30.5B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | No disponible (el modelo base Qwen3-Coder-30B-A3B-Instruct soporta hasta 256K, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible (repositorio en safetensors, probablemente fp16/bf16) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-Coder-30B-A3B-Instruct: un transformer con capas de atención estándar y mezcla de expertos (MoE), donde solo 3B de los 30.5B parámetros se activan por token. Esto permite una inferencia relativamente eficiente en comparación con un modelo denso del mismo tamaño total.

El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) con un verifier de campaña basado en `pass_ratio` shaping, utilizando el framework SkyRL y la librería Terminus-2. El dataset de entrenamiento fue `DCAgent/exp_rpt_multifile`, orientado a tareas de codificación multi-archivo. El run completo estaba planificado para 80 pasos, pero se detuvo en el paso 76 por el aumento de entropía (de 0.11 a 0.90, acercándose al límite de 10x). El checkpoint del paso 10 fue seleccionado como el mejor según la EMA de recompensa de las últimas 5 iteraciones, con valores de EMA 0.2094, recompensa de paso 0.2344, pass@8 0.4516 y entropía 0.1184.

No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni técnicas adicionales como RLHF o DPO, más allá del RL con GRPO.

## Capacidades

- Generación de texto y código: hereda las capacidades del modelo base Qwen3-Coder-30B-A3B-Instruct, que está especializado en tareas de programación y razonamiento.
- Razonamiento multi-step: el modelo base soporta razonamiento encadenado y el entrenamiento con RL sobre tareas de codificación agéntica puede reforzar esta capacidad, aunque no hay evidencia directa en este checkpoint.
- Tool calling / function calling: el modelo base tiene soporte para tool calling, pero no se ha verificado específicamente en este checkpoint.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base soporta múltiples idiomas.
- Sin capacidades multimodales: es un modelo de solo texto.

## Casos de uso

- Investigación en RL para codificación: este checkpoint es útil para estudiar el efecto del clipping superior en GRPO sobre tareas de código. Los investigadores pueden analizar las métricas de entrenamiento y comparar con otros checkpoints del barrido.
- Evaluación de métodos de alineación: permite comparar el comportamiento de un modelo entrenado con RL frente al modelo base en tareas de generación de código.
- Generación de código asistida en entornos controlados: aunque no es un modelo de producción, puede usarse en prototipos para evaluar si el ajuste con RL mejora la calidad del código generado en tareas multi-archivo.
- Análisis de estabilidad de entrenamiento: el run terminado prematuramente ofrece datos sobre cómo la entropía afecta la convergencia, útil para diseñar mejores estrategias de early stopping.
- Reproducción de experimentos: los training traces están disponibles en un dataset público, permitiendo reproducir y validar los resultados.
- Benchmark de agentes de código: puede servir como punto de referencia para comparar el rendimiento de modelos MoE ajustados con RL frente a alternativas densas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento provienen de las métricas de entrenamiento:

| Metrica | Valor (step 10) |
|---|---|
| Recompensa de paso | 0.2344 |
| EMA de recompensa (trailing-5) | 0.2094 |
| pass@8 | 0.4516 |
| Entropia | 0.1184 |

Estas métricas no son comparables con benchmarks públicos y reflejan el rendimiento durante el entrenamiento, no en evaluación estándar.

## Requisitos de hardware

- Tamaño del repositorio: 61.1 GB, lo que sugiere pesos en fp16/bf16 (30.5B x 2 bytes ≈ 61 GB).
- Para inferencia sin cuantización se necesitan al menos 61 GB de VRAM, requiriendo múltiples GPUs (por ejemplo, 2x A100 40GB o 2x RTX 4090 24GB con offloading).
- Con cuantización 4-bit (por ejemplo, mediante bitsandbytes o GPTQ), el modelo podría caber en una GPU consumer de 24 GB (RTX 3090/4090), aunque no se ha probado oficialmente.
- Opciones de despliegue: al ser un modelo transformers, se puede usar con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No hay configuraciones específicas publicadas.
- Latencia y throughput: no disponibles. Al ser MoE con 3B activos, la latencia por token debería ser significativamente menor que un modelo denso de 30B, pero no hay mediciones.

## Comparativa con modelos similares

El modelo base es Qwen3-Coder-30B-A3B-Instruct. Se puede comparar con otras alternativas de codificación de tamaño similar, pero no hay datos de benchmarks para este checkpoint. Comparación a nivel de características:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (base) | 30.5B | 3B | 256K (no confirmado) | Apache 2.0 | Instruct, codigo |
| Este checkpoint (tt-x2_clip-hi0p05) | 30.5B | 3B | No disponible | Apache 2.0 | RL sobre codigo |
| DeepSeek-Coder-V2-Lite | 16B | 2.4B | 128K | MIT | Codigo, MoE |
| Qwen2.5-Coder-32B (denso) | 32B | 32B | 128K | Apache 2.0 | Codigo, denso |

La comparativa es orientativa; no hay datos de rendimiento para este checkpoint en benchmarks estándar.

## Limitaciones y advertencias

- Checkpoint intermedio de un run terminado prematuramente: el entrenamiento se detuvo en el paso 76/80 por elevada entropía, lo que sugiere que el modelo puede tener comportamiento inestable o degradado en comparación con el modelo base.
- Solo inglés: la model card indica que el entrenamiento se realizó en inglés, por lo que el rendimiento en otros idiomas puede ser deficiente.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar; las métricas de entrenamiento no garantizan calidad en producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código incorrecto o inventar APIs.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental sin garantías, no se recomienda para producción sin evaluación exhaustiva.
- Dependencia del modelo base: las limitaciones de Qwen3-Coder-30B-A3B-Instruct (sesgos, alucinaciones, etc.) se heredan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/tt-x2_clip-hi0p05-10-30B
- Dataset de training traces: https://huggingface.co/datasets/penfever/tt-x2_clip-hi0p05
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
