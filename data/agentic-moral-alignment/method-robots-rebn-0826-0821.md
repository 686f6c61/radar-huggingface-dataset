# agentic-moral-alignment/method-robots-rebn-0826-0821

## Resumen

El modelo `method-robots-rebn-0826-0821` es un conjunto de adaptadores LoRA desarrollado por la organización Agentic Moral Alignment, un grupo de investigación que trabaja en la alineación de agentes de IA con principios morales. El modelo se basa en `Qwen/Qwen3.5-4B-Base` y se entrena mediante aprendizaje por refuerzo (RL) para enseñar a un agente a tomar decisiones moralmente alineadas en entornos de juego. La organización está vinculada al proyecto SPAR (sparai.org) y al trabajo de investigación "Moral Alignment for LLM Agents" presentado en ICLR 2025.

El modelo resuelve un problema específico: la alineación de agentes de IA con principios morales (deontológicos, en este caso) mediante el uso de entornos de juego como campo de entrenamiento. En lugar de depender únicamente de la alineación del modelo base, este enfoque entrena al agente para que aprenda principios morales a través de la toma de decisiones en juegos. El modelo está disponible en varios checkpoints (pasos 20, 25, 30, 35 y 40) que representan diferentes momentos del entrenamiento.

La relevancia actual de este modelo radica en su enfoque experimental para la alineación de agentes, un área crítica en el desarrollo de sistemas de IA autónomos. El modelo es un LoRA de rango 32 con alpha 64, entrenado sobre una base de 4B parámetros, con una longitud de contexto de hasta 45.056 tokens según la configuración de entrenamiento. Se encuentra disponible bajo una licencia no especificada en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B-Base (transformador decoder-only) |
| Parámetros totales | no disponible (solo adaptadores LoRA, ~0.6 GB de repo) |
| Parámetros activos | no disponible (adaptadores LoRA, rango 32, alpha 64) |
| Longitud de contexto | 45.056 tokens (configuración de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo consiste en adaptadores LoRA entrenados sobre el modelo base `Qwen/Qwen3.5-4B-Base` mediante aprendizaje por refuerzo (RL). La configuración de entrenamiento incluye un pipeline de RL con las siguientes características principales: se utiliza un entorno de juego (`GAMES: robots`) con 8 agentes en paralelo (`N: 8`), un límite de 64 turnos por episodio (`TURN_CAP: 64`), y una función de recompensa basada en `reward_to_go` con normalización por batch. El entrenamiento usa el algoritmo de RL con ventaja calculada sobre la media del batch (`BASELINE_FN: batch_mean`) y normalización por desviación estándar (`NORMALIZE_FN: batch_std`), con `GAMMA: 1.0` y `TD_LAMBDA: 0.8`.

El marco de entrenamiento es `verl` (RL framework de origen FSDP), con los adaptadores convertidos desde shards de FSDP. El entrenamiento incluye un componente de "thinking" (`THINKING: True`) con `MAX_TURN_TOKENS: 4096`, lo que sugiere que el modelo genera razonamiento interno antes de responder. La configuración incluye un componente de moral deontológica (`MORAL: deon_soft`) con `LAM: 1` y `TASK_WEIGHT: 0`, lo que indica que la recompensa se basa principalmente en el comportamiento moral y no en la tarea específica.

El entrenamiento se realizó en un solo GPU (GPUS: 1) con `TP: 1`, y el dataset de logs por episodio está disponible en Hugging Face. Los checkpoints se guardan cada 5 pasos (`SAVE_FREQ: 5`), y se ofrecen 5 checkpoints: step_20, step_25, step_30, step_35 y step_40.

## Capacidades

- **Alineación moral**: el modelo está entrenado para tomar decisiones que se alinean con principios morales deontológicos (reglas basadas en el deber) en entornos de juego.
- **Razonamiento en cadena**: la configuración `THINKING: True` y `MAX_TURN_TOKENS: 4096` indica que el modelo genera razonamiento interno antes de emitir una respuesta.
- **Aprendizaje por refuerzo**: el modelo ha sido entrenado con RL para optimizar la recompensa acumulada, lo que le permite aprender de las consecuencias de sus acciones.
- **Toma de decisiones en juegos**: el modelo se ha entrenado específicamente en el entorno "robots", lo que le permite navegar y tomar decisiones en escenarios de juego.
- **Capacidades del modelo base**: al basarse en Qwen3.5-4B-Base, hereda las capacidades de generación de texto, razonamiento y comprensión del lenguaje del modelo base (aunque no se especifican en la información disponible).
- **Capacidades multilingües**: no disponible (depende del modelo base).
- **Tool calling / function calling**: no disponible (no se menciona en la información).

## Casos de uso

- **Investigación en alineación de IA**: el modelo sirve como un caso de estudio para investigar cómo se puede enseñar principios morales a agentes de IA mediante aprendizaje por refuerzo en entornos de juego. Los investigadores pueden analizar los checkpoints para estudiar la evolución del comportamiento moral durante el entrenamiento.
- **Desarrollo de agentes de juego éticos**: los adaptadores pueden aplicarse a modelos base para crear agentes de juego que toman decisiones considerando principios morales, útil para simulación de comportamientos éticos en entornos de juego.
- **Experimentos de RL para alineación**: el modelo es un recurso para reproducir experimentos de alineación mediante RL, ya que la configuración de entrenamiento está completamente documentada en el README y los logs de cada episodio están disponibles en Hugging Face.
- **Evaluación de robustez del alineamiento**: los múltiples checkpoints (step 20 a 40) permiten evaluar cómo la robustez del alineamiento moral cambia con el número de pasos de entrenamiento.
- **Comparación de marcos morales**: al usar `MORAL: deon_soft` (deontología suave), el modelo puede compararse con otros entrenados con marcos morales distintos (utilitarismo, ética de virtudes) para estudiar diferencias de comportamiento.
- **Integración en pipelines de investigación**: los adaptadores pueden fusionarse con el modelo base y desplegarse para evaluación en entornos de juego específicos, siempre que se respete la advertencia sobre la incompatibilidad con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La información proporcionada no incluye métricas de rendimiento estándar (MMLU, HumanEval, GSM8K, etc.), ni comparaciones con otros modelos de la misma categoría. El modelo está diseñado para la investigación en alineación moral, no para tareas generales de lenguaje, por lo que no se dispone de datos de rendimiento en tareas convencionales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Como adaptadores LoRA sobre un modelo base de 4B parámetros, la inferencia requiere la memoria del modelo base más la de los adaptadores. El modelo base Qwen3.5-4B-Base requiere aproximadamente 8-10 GB de VRAM en FP16.
- **GPU recomendadas**: el entrenamiento se realizó en un solo GPU con `GPU_MEM_UTIL: 0.72`. Para inferencia, una GPU con 12-16 GB de VRAM (como una RTX 3080/4080, o una A10G) sería suficiente.
- **Capacidad en GPU de consumo**: sí, el modelo base de 4B parámetros con adaptadores LoRA cabe en GPU de consumo con 12-16 GB de VRAM (RTX 3080, 4080, 4090).
- **Opciones de despliegue**: se puede usar con `transformers` + `peft` (cargando los adaptadores con `PeftModel.from_pretrained`). No se recomienda vLLM (ver advertencias en README: "vLLM cannot serve these adapters on Qwen3.5 -- hybrid-GDN LoRA is a silent no-op (vllm#49354)"). Se debe fusionar el modelo con `merge_and_unload()` antes de usar con vLLM.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. La información proporcionada no incluye comparaciones con otros modelos de alineación moral o agentes RL. Los datos disponibles solo mencionan el trabajo de "Moral Alignment for LLM Agents" (ICLR 2025) como base del proyecto, pero no se proporcionan métricas comparativas.

## Limitaciones y advertencias

- **Incompatibilidad con vLLM**: según el README, vLLM no puede servir estos adaptadores en Qwen3.5; la LoRA híbrida-GDN es un "no-op" silencioso. Es necesario fusionar el modelo antes de usarlo con vLLM.
- **Estado de investigación**: el modelo es un resultado de un experimento de investigación (una ejecución de entrenamiento específica), no un modelo de producción. Los adaptadores son específicos del entorno `robots` y pueden no generalizar a otras tareas.
- **Licencia no especificada**: la licencia no está disponible, lo que limita el uso comercial del modelo sin autorización explícita.
- **Sesgos potenciales**: al ser un modelo entrenado en entornos de juego, el comportamiento puede estar sesgado hacia las dinámicas de esos juegos y no generalizarse a escenarios del mundo real.
- **Riesgo de alucinación**: el modelo base (Qwen3.5-4B-Base) puede presentar alucinaciones, y el entrenamiento con RL puede exacerbar este comportamiento si no se controla.
- **Limitaciones de idioma**: los idiomas soportados no están especificados; se heredan del modelo base.
- **Soporte de contexto**: la configuración de entrenamiento usa un contexto de hasta 45.056 tokens, pero no se garantiza que el modelo funcione correctamente fuera de este rango.

## Enlaces

- Hugging Face: https://huggingface.co/agentic-moral-alignment/method-robots-rebn-0826-0821
- Organización: https://huggingface.co/agentic-moral-alignment
- Logs de entrenamiento por episodio: https://huggingface.co/datasets/agentic-moral-alignment/mtma/tree/main/runs/train/method-robots-rebn-0826-0821
- Paper sobre alineación moral híbrida: https://arxiv.org/abs/2312.01818
- Paper completo (HTML): https://arxiv.org/html/2312.01818v3
- Repo de GitHub (experimentos originales): https://github.com/lfranceschetti/agentic-moral-alignment/blob/main/documents/running_original_experiments.md
- Proyecto SPAR: https://sparai.org/projects/sp26/recEYzIkRgbkqJWWF/
