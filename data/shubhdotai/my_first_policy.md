# shubhdotai/my_first_policy

## Resumen

El modelo `shubhdotai/my_first_policy` es una política de control robótico basada en el método **Action Chunking with Transformers (ACT)**, desarrollada por shubhdotai (Shubham Agarwal) y publicada en Hugging Face. Se trata de un modelo de aprendizaje por imitación que, a partir de observaciones del estado del robot y de imágenes de una cámara frontal, predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Esta técnica, introducida en el paper [arXiv:2304.13705](https://huggingface.co/papers/2304.13705), busca mejorar la estabilidad y la precisión del control en tareas de manipulación robótica teleoperada.

El modelo ha sido entrenado y publicado utilizando la librería **LeRobot** de Hugging Face, y está destinado a ejecutar una tarea concreta: recoger un dado y colocarlo dentro de una taza azul. Cuenta con aproximadamente **51,7 millones de parámetros** en formato `safetensors`, con un tamaño de repositorio de 0,2 GB. Al ser un modelo de política robótica, no es un modelo de lenguaje: no procesa texto ni mantiene una ventana de contexto en el sentido tradicional. Su relevancia radica en servir como ejemplo práctico de entrenamiento y despliegue de políticas de imitación con LeRobot, así como en su potencial como baseline para experimentos en robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), basada en Transformer |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de imágenes y estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa **ACT**, un método de aprendizaje por imitación que utiliza un Transformer para predecir un chunk de acciones (una secuencia de N pasos de control) a partir del estado actual del robot y de imágenes de la cámara. Esta estrategia de "action chunking" reduce el error acumulativo típico de las políticas que predicen un solo paso, lo que se traduce en movimientos más suaves y robustos.

Según la model card, el entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio (`shubhdotai/record-test_20260906_011033`) que contiene 50 episodios y 18.601 frames a 30 FPS. La tarea registrada es "Pick up the dice and place it inside the blue mug". La configuración de entrenamiento incluye 20.000 pasos, batch size de 4, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se menciona ningún proceso de RLHF, DPO ni ajuste por preferencias; el aprendizaje es puramente por imitación a partir de demostraciones teleoperadas.

## Capacidades

- Genera acciones de control en 6 dimensiones (posiblemente posición y orientación del efector final) a partir de observaciones de estado y de imágenes.
- Predice chunks de acciones completas en lugar de pasos individuales, lo que mejora la coherencia temporal de los movimientos.
- Procesa imágenes de cámara frontal con resolución de 1080x1920 y estados del robot de dimensión 6.
- Aprende por imitación a partir de demostraciones humanas teleoperadas.
- Ejecuta la tarea específica para la que fue entrenado: recoger un dado y colocarlo dentro de una taza azul.
- No es un modelo de lenguaje: no soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- **Manipulación de objetos en laboratorio**: el modelo puede controlar un brazo robótico para realizar la tarea de pick-and-place para la que fue entrenado. Se desplegaría con `lerobot-rollout` en un robot compatible con la configuración `so_follower`.
- **Automatización de tareas repetitivas en ensamblaje ligero**: gracias a la predicción de chunks, los movimientos son más fluidos y estables, lo que resulta útil en operaciones de montaje que requieren precisión.
- **Investigación en aprendizaje por imitación**: sirve como baseline concreto para comparar el rendimiento de ACT frente a otros métodos (por ejemplo, Diffusion Policy) sobre la misma tarea y dataset.
- **Robótica educativa**: los estudiantes pueden utilizar este modelo como ejemplo práctico de cómo entrenar, evaluar y desplegar una política con LeRobot, siguiendo la guía de ACT.
- **Teleoperación asistida**: en entornos donde un operador humano realiza demostraciones, el modelo puede aprender y replicar la tarea, reduciendo la carga de trabajo en operaciones prolongadas.
- **Integración en pipelines de datos de robótica**: el modelo puede incorporarse a flujos de registro de datos, donde se capturan nuevas demostraciones y se reentrenan políticas para tareas similares.
- **Pruebas de robustez en entornos controlados**: al ser un modelo pequeño, permite experimentar rápidamente con variaciones de posición, iluminación o distracciones, siempre que se reentrene con datos adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. Por tanto, no se dispone de datos de tasa de éxito, precisión ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El entrenamiento se realizó con `--policy.device=cuda`, por lo que se requiere una GPU NVIDIA compatible con PyTorch.
- Si cabe en GPU de consumo: probablemente, dado el tamaño de 51,7 millones de parámetros, pero no hay datos oficiales. El procesamiento de imágenes a 1080x1920 puede aumentar notablemente el consumo de memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con PyTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información disponible. El modelo pertenece a la categoría de políticas de imitación basadas en ACT; para una comparación metodológica se puede consultar el paper original (arXiv:2304.13705), pero no se han publicado resultados específicos para este modelo concreto.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea y una configuración de robot específica (`so_follower` con cámara frontal). No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- El dataset de entrenamiento es pequeño (50 episodios), lo que puede provocar sobreajuste y una baja robustez ante variaciones en la posición de los objetos, iluminación o distracciones.
- No se han publicado resultados de evaluación en el robot real, por lo que se desconoce la tasa de éxito efectiva.
- El comportamiento depende de la calidad de las demostraciones teleoperadas; si los datos contienen ruido o errores, la política resultante puede heredar esos fallos.
- El procesamiento de imágenes a alta resolución (1080x1920) puede ser computacionalmente costoso en comparación con políticas que usan resoluciones menores.
- La licencia Apache 2.0 permite uso comercial, pero exige incluir la atribución correspondiente y respetar los avisos de licencia en las redistribuciones.
- No es un modelo de lenguaje: no puede interpretar instrucciones en lenguaje natural ni realizar razonamiento simbólico.

## Enlaces

- Hugging Face: [https://huggingface.co/shubhdotai/my_first_policy](https://huggingface.co/shubhdotai/my_first_policy)
- Paper original de ACT: [https://huggingface.co/papers/2304.13705](https://huggingface.co/papers/2304.13705)
- LeRobot (GitHub): [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Documentación de LeRobot: [https://huggingface.co/docs/lerobot/index](https://huggingface.co/docs/lerobot/index)
- Guía de ACT en LeRobot: [https://huggingface.co/docs/lerobot/main/en/act](https://huggingface.co/docs/lerobot/main/en/act)
- Dataset de entrenamiento: [https://huggingface.co/datasets/shubhdotai/record-test_20260906_011033](https://huggingface.co/datasets/shubhdotai/record-test_20260906_011033)
