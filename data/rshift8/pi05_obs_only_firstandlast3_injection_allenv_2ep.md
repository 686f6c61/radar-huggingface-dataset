# rshift8/pi05_obs_only_firstandlast3_injection_allenv_2ep

## Resumen

El modelo `pi05_obs_only_firstandlast3_injection_allenv_2ep` es un fine-tune de 2 épocas sobre el modelo RoboPRO π₀.₅, un modelo fundacional de robótica que combina visión, lenguaje y acción (VLA) para ejecución de tareas físicas. El autor, rshift8, ha realizado un ajuste específico en el que la atención del modelo se limita únicamente a los obstáculos, desactivando la atención a objetivos y destinos. Este checkpoint se publica como un conjunto completo de pesos en formato JAX/orbax, pensado para reanudar entrenamiento o ejecutar evaluación.

La relevancia de este modelo radica en su enfoque experimental: al aislar la atención únicamente a obstáculos, permite estudiar cómo el modelo prioriza la información espacial de su entorno durante la manipulación robótica. El repositorio incluye no solo los pesos, sino también el estado del optimizador, estadísticas de normalización y la configuración de entrenamiento, lo que facilita la reproducibilidad y la continuación del entrenamiento. Es un recurso útil para investigadores en robótica que trabajen con la familia π₀.₅ y quieran explorar variantes de atención selectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ / RoboPRO, con atención solo a obstáculos |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints JAX/orbax en precisión original) |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | JAX/orbax (directorios `params/`, `train_state/`, `assets/`, `_CHECKPOINT_METADATA`) |

## Arquitectura y entrenamiento

El modelo parte de los pesos iniciales `mzxuan/robopro_jax_30000` y se fine-tunea durante 230.934 pasos (2 épocas de 115.467 pasos cada una) con un batch de 32 y paralelismo de datos en 2 GPUs. La modificación principal consiste en restringir el mecanismo de atención a los obstáculos únicamente, desactivando la atención a objetivos y destinos. Esto se aplica en todos los entornos (`allenv`). El entrenamiento se realizó con JAX y orquestado con orbax, guardando checkpoints cada 25.000 pasos y al final de cada época. Cada directorio de paso contiene los pesos, el estado del optimizador, las estadísticas de normalización (`norm_stats.json`) y un fragmento de configuración (`train_config.py`) para integrar en `src/openpi/training/config.py`.

No se dispone de detalles sobre el dataset de entrenamiento, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO. La información proporcionada no especifica la arquitectura interna completa (número de capas, dimensiones, etc.) más allá de su origen en π₀.₅.

## Capacidades

- Ejecución de tareas de manipulación robótica con atención focalizada en obstáculos.
- Capacidad de reanudar entrenamiento desde cualquier checkpoint guardado (cada 25k pasos y al final de cada época).
- Evaluación directa sobre el entorno de RoboPRO con las estadísticas de normalización incluidas.
- Integración con el framework OpenPI (config snippet proporcionado).
- Soporte para paralelismo de datos en 2 GPUs durante el entrenamiento.
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento simbólico, al ser un modelo puramente robótico.

## Casos de uso

- Investigación en atención selectiva para robótica: permite estudiar cómo el modelo se comporta cuando solo atiende a obstáculos, comparando con variantes que atienden a objetivos o destinos.
- Fine-tuning continuado: los checkpoints incluyen el estado del optimizador, por lo que se puede reanudar el entrenamiento con nuevos datos o hiperparámetros sin partir de cero.
- Evaluación de robustez en entornos con obstáculos: útil para probar la capacidad del modelo de evitar colisiones en escenarios simulados o reales.
- Benchmarking de variantes de π₀.₅: sirve como punto de comparación para otras modificaciones de atención en la misma familia de modelos.
- Desarrollo de políticas de control para brazos robóticos: el modelo puede servir como base para tareas de manipulación que requieran priorizar la información de obstáculos.
- Reproducción de experimentos: al incluir la configuración de entrenamiento y las estadísticas, otros investigadores pueden replicar el fine-tune o adaptarlo a sus propios entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de manipulación robótica (como tasa de éxito en tareas específicas). El repositorio no incluye tablas comparativas ni evaluaciones cuantitativas.

## Requisitos de hardware

- El tamaño del repositorio es de 226.9 GB, lo que indica que los checkpoints completos requieren un almacenamiento considerable.
- No se especifica la VRAM necesaria para inferencia o entrenamiento. Dado que el entrenamiento se realizó con 2 GPUs en paralelo de datos, se asume que cada GPU debe tener suficiente memoria para el modelo completo (probablemente GPUs de alta gama como A100 o H100, pero no confirmado).
- No se indica si es posible ejecutar el modelo en GPUs de consumo (RTX 4090, etc.) ni en CPU.
- Opciones de despliegue: al ser checkpoints JAX/orbax, se requiere el ecosistema JAX y el framework OpenPI. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base π₀.₅ es un VLA de robótica, pero no se conocen otros fine-tunes con la misma modificación de atención. Se podría comparar con el modelo original `mzxuan/robopro_jax_30000` (del que parte) y con la variante `pi05_obs_only_firstandlast3_injection_allenv` (sin el fine-tune de 2 épocas), pero no se dispone de métricas de rendimiento para ninguna de ellas.

## Limitaciones y advertencias

- La atención está restringida únicamente a obstáculos, lo que puede degradar el rendimiento en tareas que requieran comprender objetivos o destinos.
- No se han publicado evaluaciones cuantitativas, por lo que se desconoce su eficacia real en entornos robóticos.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- El formato JAX/orbax limita su uso a entornos que soporten JAX; no es directamente compatible con frameworks de inferencia estándar como PyTorch o TensorFlow.
- El tamaño del repositorio (226.9 GB) puede dificultar su descarga y almacenamiento en infraestructuras modestas.
- No se documentan sesgos, riesgos de alucinación (al no ser un modelo de lenguaje) ni limitaciones de idioma.
- La fecha de creación (2026-08-31) es futura en relación a la fecha actual, lo que sugiere que el modelo es muy reciente o que la fecha es incorrecta.

## Enlaces

- [HuggingFace: rshift8/pi05_obs_only_firstandlast3_injection_allenv_2ep](https://huggingface.co/rshift8/pi05_obs_only_firstandlast3_injection_allenv_2ep)
- [HuggingFace: rshift8/pi05_obs_only_firstandlast3_injection_allenv (modelo base del fine-tune)](https://huggingface.co/rshift8/pi05_obs_only_firstandlast3_injection_allenv)
- [HuggingFace: mzxuan/robopro_jax_30000 (inicialización)](https://huggingface.co/mzxuan/robopro_jax_30000)
- [Qualcomm AI Hub: Pi0.5 (modelo base)](https://aihub.qualcomm.com/models/pi05)
- [GitHub: HUIXI-AI/RhinoForge - ejemplo pi05.py](https://github.com/HUIXI-AI/RhinoForge/blob/main/examples/pi05.py)
