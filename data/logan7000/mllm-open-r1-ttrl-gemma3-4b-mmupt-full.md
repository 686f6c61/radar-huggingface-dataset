# logan7000/mllm-open-r1-ttrl-gemma3-4b-mmupt-full

## Resumen

El modelo `logan7000/mllm-open-r1-ttrl-gemma3-4b-mmupt-full` es un fine-tuning del modelo base Gemma-3-4B-it de Google, desarrollado por el usuario logan7000 en el marco de un proyecto de investigación sobre razonamiento matemático multimodal. El entrenamiento combina dos técnicas: TTRL (Test-Time Reinforcement Learning) con auto-etiquetado por mayoría de votos, y la receta OpenR1, aplicada sobre el conjunto de datos mmupt (multimodal math understanding and problem solving). El objetivo es mejorar la capacidad del modelo para resolver problemas matemáticos que requieren comprensión de imágenes y texto.

El modelo se publicó en septiembre de 2026 y el repositorio ocupa 17,2 GB, lo que sugiere pesos en precisión completa (fp32) o en formato sin cuantizar. La model card indica que se entrenó en hardware A100 de la Universidad Johns Hopkins (JHU) durante un día, con una configuración de hiperparámetros detallada. No se proporcionan licencia, idiomas soportados ni resultados de benchmarks en la información disponible, por lo que esta ficha se basa únicamente en los datos publicados y en las características conocidas del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-4B-it) |
| Parametros totales | 4.000 millones (inferido del nombre, no confirmado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma-3-4B-it soporta hasta 128K tokens, pero no se especifica para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se indica para este fine-tuning) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Gemma-3-4B-it, un transformer decoder-only con atención multi-cabeza y capacidades multimodales (texto e imágenes). El fine-tuning se realizó con la receta mmupt en su variante Gemma, que emplea TTRL (Test-Time Reinforcement Learning) con auto-etiquetado por mayoría de votos. Los hiperparámetros reportados son: beta 0.01, K 10, temperatura 1.0, cap 1024, learning rate 1e-6, weight decay 0.01, max_grad_norm 1.0, y 12 prompts por paso con un effective batch de 120. Se utilizó el método bnpo (presumiblemente una variante de optimización) y escalado de recompensas por grupo.

El entrenamiento se ejecutó durante un epoch (checkpoint-640) en hardware A100 de JHU. La selección del mejor checkpoint se realizó mediante validación en MathVista-150 (step 220). El protocolo de evaluación para las tablas del paper usa temperatura 0, contexto de 16K, prompt con "boxed" y un juez basado en reglas más Qwen2.5-32B. No se detalla la composición del dataset de entrenamiento más allá de la referencia a mmupt.

## Capacidades

- Razonamiento matemático multimodal: el entrenamiento específico en mmupt sugiere que el modelo está optimizado para resolver problemas que combinan texto e imágenes (por ejemplo, gráficos, diagramas o figuras geométricas).
- Generación de texto: al estar basado en Gemma-3-4B-it, conserva las capacidades de generación de texto del modelo base, aunque no se han verificado tras el fine-tuning.
- Comprensión de imágenes: el modelo base es multimodal, por lo que puede procesar entradas visuales, pero no se confirma que esta capacidad se haya mantenido o mejorado.
- No se dispone de información sobre tool calling, function calling, capacidades de agente o modos de razonamiento explícitos (thinking mode) en este fine-tuning concreto.

## Casos de uso

Dado que la información pública es limitada, los siguientes casos de uso son hipotéticos y basados en el propósito declarado del entrenamiento (razonamiento matemático multimodal). No se han validado con pruebas reales.

- Resolución de problemas matemáticos con soporte visual: el modelo podría utilizarse en entornos educativos para resolver ejercicios que incluyan gráficos, tablas o figuras, aprovechando el entrenamiento en mmupt.
- Análisis de datos científicos: podría procesar figuras y tablas de artículos de investigación para extraer conclusiones matemáticas, aunque no hay evidencia de su rendimiento en este ámbito.
- Generación de explicaciones paso a paso: al estar entrenado con RL, podría producir razonamientos más estructurados, pero no se ha demostrado.
- Asistencia en tareas de ingeniería que requieran interpretación de planos o diagramas técnicos: hipotético, sin validación.
- Evaluación de modelos en benchmarks de razonamiento matemático: el propio modelo se entrenó con MathVista-150 como validación, por lo que podría usarse como referencia en investigaciones similares.
- Investigación en RL aplicada a modelos multimodales: el repositorio incluye logs de entrenamiento y checkpoints, lo que permite reproducir o estudiar el proceso de TTRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la validación se realizó con MathVista-150 para seleccionar el mejor checkpoint, pero no se proporcionan las puntuaciones obtenidas. Tampoco hay comparaciones con otros modelos en el repositorio ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 4B parámetros en fp32 (17,2 GB de pesos), se necesitarían al menos 20 GB de VRAM solo para los pesos, más overhead de activaciones. Con cuantización a 8 bits (unos 4 GB) o 4 bits (unos 2 GB) cabría en GPUs de consumo, pero no se han publicado versiones cuantizadas.
- GPU recomendadas: para fp32, una A100 (40 GB) o RTX 4090 (24 GB) serían suficientes. Para cuantizaciones, una RTX 3060 (12 GB) o superior podría bastar.
- Si cabe en consumer GPU: en fp32 no cabe en GPUs de 8-12 GB; con cuantización sí, pero no hay archivos GGUF ni AWQ publicados.
- Opciones de despliegue: al ser safetensors, se puede cargar con transformers, vLLM o TGI, pero no hay configuraciones específicas documentadas. No se ha publicado en Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un fine-tuning de Gemma-3-4B-it, por lo que se puede comparar con el modelo base y con otros fine-tunings de razonamiento matemático, pero no hay datos de rendimiento publicados. Se indica "no disponible" para cualquier métrica comparativa.

## Limitaciones y advertencias

- No se ha publicado licencia, por lo que el uso comercial y la redistribución son inciertos. Se recomienda contactar al autor antes de cualquier uso en producción.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma específicas de este fine-tuning.
- El modelo se entrenó con un dataset concreto (mmupt) y puede tener un rendimiento degradado fuera de ese dominio.
- El tamaño del repositorio (17,2 GB) sugiere pesos en fp32, lo que dificulta su despliegue en entornos con recursos limitados.
- No se han proporcionado resultados de evaluación independientes, por lo que cualquier afirmación sobre su calidad es especulativa.
- La fecha de creación (2026) y la falta de descargas y likes indican que es un modelo de investigación, no validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/mllm-open-r1-ttrl-gemma3-4b-mmupt-full
- Resultados de búsqueda web (sin información específica sobre este modelo):
  - https://computingforgeeks.com/ollama-models-cheat-sheet/
  - https://huggingface.co/
  - https://huggingface.co/google
  - https://llm-stats.com/
  - https://llm-stats.com/leaderboards/llm-leaderboard
