# maskjp/pi05-relative-eef-full-ft-30k

## Resumen

`maskjp/pi05-relative-eef-full-ft-30k` es un checkpoint de fine-tuning completo del modelo de robótica pi0.5, desarrollado por el usuario maskjp sobre la base `lerobot/pi05_base` de LeRobot. Se trata de un ajuste fino con todos los parámetros entrenables (4.143.404.816), incluyendo torre de visión, modelo de lenguaje y experto de acciones, sobre un conjunto de datos multi-tarea de 949 episodios (900 de entrenamiento y 49 de validación) que abarca 8 tareas, 3 cámaras y una frecuencia de 50 Hz.

El modelo está diseñado para predecir acciones relativas del efector final en un espacio de 13 dimensiones (pose 6D), con el gripper en modo absoluto. Sin embargo, este checkpoint concreto es el punto final del programa de entrenamiento (paso 30.000) y presenta un claro sobreajuste: la pérdida en validación es de 0,0388, un 36 % peor que el mínimo de 0,0286 obtenido en el paso 5.000. El autor lo publica explícitamente como un artefacto de investigación para documentar dónde termina el programa, no como un modelo recomendado para despliegue.

La relevancia de esta publicación radica en que ilustra un problema práctico en robótica: con conjuntos de datos pequeños (900 episodios), un fine-tuning completo de 4.14B parámetros memoriza los datos de entrenamiento en menos de media época, mientras que un enfoque con el VLM congelado (693M parámetros entrenables) no sufre este problema. La licencia es Apache-2.0, heredada de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (torre de visión + modelo de lenguaje + experto de acciones) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y se somete a un fine-tuning completo: todos los parámetros (torre de visión, modelo de lenguaje y experto de acciones) son entrenables. La configuración de entrenamiento incluye `chunk_size=50`, `n_action_steps=10`, `n_obs_steps=1`, `freeze_vision_encoder=false`, `train_expert_only=false`, `gradient_checkpointing=true`, `compile_model=true` y dtype `bfloat16`. El optimizador usa una tasa de aprendizaje de 2.5e-5 con warmup de 1000 pasos y decaimiento coseno hasta 2.5e-6 en 30.000 pasos; la torre de visión y el proyector multimodal se entrenan a 0.1x esa tasa (2.5e-6). El batch efectivo es de 63 (21 por rango × 3 GPUs) con DDP y semilla 1000.

La representación de acciones es relativa: `action[t+k] - state[anchor]`, con un ancla por chunk, y el gripper se mantiene en modo absoluto (`relative_exclude_joints=['gripper']`). La normalización se basa en identidad visual, cuantiles de estado y cuantiles de acción. Los estadísticos de normalización están integrados en `policy_preprocessor_step_3_normalizer_processor.safetensors` y los nombres de características de acción en `config.json`, por lo que no se necesita el dataset de entrenamiento para la inferencia.

## Capacidades

- Control robótico de efector final: predice acciones de 13 dimensiones (pose 6D) en espacio relativo.
- Soporte multi-tarea: entrenado en 8 tareas distintas con 3 cámaras.
- Observación multimodal: combina entradas visuales de múltiples cámaras con estado del robot.
- Acciones relativas con gripper absoluto: permite movimientos relativos al ancla manteniendo control fino del gripper.
- Inferencia sin dataset: los estadísticos de normalización están incrustados en el repositorio.
- No incluye capacidades de lenguaje general, generación de texto, tool calling ni razonamiento simbólico; es un modelo puramente orientado a robótica.

## Casos de uso

- Investigación sobre sobreajuste en fine-tuning robótico: este checkpoint sirve como ejemplo documentado de cómo un programa de 30.000 pasos con 4.14B parámetros memoriza 900 episodios, permitiendo estudiar curvas de pérdida y estrategias de regularización.
- Comparación de estrategias de entrenamiento: puede usarse como contrapunto al modelo `frozen-VLM` del mismo autor, que con 693M parámetros entrenables no sobreajusta, para evaluar el impacto de congelar la torre de visión.
- Benchmarking de schedules de aprendizaje: los datos de pérdida en validación (pasos 5K a 30K) permiten calibrar la duración óptima de entrenamiento en datasets pequeños.
- Desarrollo de pipelines de despliegue robótico: aunque no es el checkpoint recomendado, su configuración de normalización y representación de acciones relativas puede servir de referencia para integrar pi0.5 en sistemas de control.
- Validación de técnicas de regularización: al ser un punto de sobreajuste conocido, es útil para probar métodos como early stopping, dropout o aumento de datos.
- Educación y documentación: como artefacto de investigación, ilustra de forma concreta el fenómeno de overfitting en modelos de robótica de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de robótica, no de lenguaje. El único dato de rendimiento disponible es la pérdida en el conjunto de validación (held-out loss) a lo largo del entrenamiento:

| Paso | Pérdida held-out |
|---:|---:|
| 5K | 0.0286 (mejor) |
| 10K | 0.0293 |
| 15K | 0.0312 |
| 20K | 0.0346 |
| 25K | 0.0375 |
| 30K | 0.0388 |

La pérdida de entrenamiento cae a ~0.008 durante todo el proceso, mientras que la de validación sube a partir del paso 5.000, confirmando el sobreajuste. No se midió la sensibilidad al cambio de cámara para este modelo; los modelos hermanos con VLM congelado obtienen una ratio de 0.088-0.091, muy por debajo del umbral de 0.5.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Como referencia orientativa, un modelo de 4.14B parámetros en bfloat16 ocupa aproximadamente 8.3 GB solo en pesos, por lo que una GPU con 16 GB de VRAM (por ejemplo, RTX 4080 o superior) podría ser suficiente para inferencia, aunque no hay datos confirmados.
- El entrenamiento se realizó con 3 GPUs (batch 21 por rango, 63 efectivo), lo que sugiere que el fine-tuning completo requiere al menos 3 GPUs de alta capacidad (probablemente A100 o H100).
- El despliegue se realiza mediante la librería LeRobot, usando `PreTrainedConfig.from_pretrained` y `get_policy_class`. No se mencionan opciones como vLLM, llama.cpp u Ollama, que son específicas de modelos de lenguaje.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

La comparación más directa es con el modelo hermano `maskjp/pi05-relative-eef-frozen-vlm`, que utiliza el mismo dataset y programa de entrenamiento pero con la torre de visión y el VLM congelados (693M parámetros entrenables). También se puede comparar con el modelo base `lerobot/pi05_base`.

| Modelo | Parámetros entrenables | Pérdida held-out (paso 30K) | Sobreajuste |
|---|---|---|---|
| `pi05-relative-eef-full-ft-30k` | 4.143.404.816 | 0.0388 | Sí, empeora desde paso 5K |
| `pi05-relative-eef-frozen-vlm` | 693M | 0.0283 | No, mejora monótonamente |
| `lerobot/pi05_base` | no disponible | no disponible | no aplica (modelo base) |

No se dispone de datos de otros modelos comparables de la misma categoría (robótica con pi0.5) en la información proporcionada.

## Limitaciones y advertencias

- Este checkpoint es un punto de sobreajuste deliberado: la pérdida en validación es un 36 % peor que el mínimo del mismo entrenamiento. No debe usarse para despliegue en producción; el autor recomienda el checkpoint del paso 5.000 (`maskjp/pi05-relative-eef-full-ft`).
- El modelo memoriza los 900 episodios de entrenamiento, lo que implica una generalización muy pobre a nuevas situaciones o variaciones de las tareas.
- No se ha medido la sensibilidad al cambio de cámara para este modelo, a diferencia de los modelos con VLM congelado.
- El dataset de entrenamiento es pequeño (949 episodios, 8 tareas), por lo que las capacidades están limitadas a esas tareas específicas.
- No tiene capacidades de lenguaje, visión general ni razonamiento simbólico; es exclusivamente un controlador robótico.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte explícitamente que este checkpoint es un artefacto de investigación y no el modelo recomendado.
- El `config.json` subido difiere del usado en entrenamiento: se eliminó el campo `vision_encoder_lr_multiplier` porque draccus rechaza claves desconocidas; esto no afecta a la inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/pi05-relative-eef-full-ft-30k
- Checkpoint recomendado (paso 5K): https://huggingface.co/maskjp/pi05-relative-eef-full-ft
- Modelo hermano con VLM congelado: https://huggingface.co/maskjp/pi05-relative-eef-frozen-vlm
- Modelo base pi0.5: https://huggingface.co/lerobot/pi05_base
- Otro modelo del autor: https://huggingface.co/maskjp/pi05_piper
