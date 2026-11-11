# MakinoKF/rebot_pick_nut_on_scale_dataset_20261111_183325_act-policy-v1

## Resumen

`MakinoKF/rebot_pick_nut_on_scale_dataset_20261111_183325_act-policy-v1` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir del estado articular de un brazo robótico y de dos cámaras RGB, predice directamente comandos de acción de 7 dimensiones. El autor es el usuario de Hugging Face MakinoKF y la política está especializada en una única tarea: "pick the nut" (recoger una tuerca) sobre un robot `rebot_b601_follower`.

El modelo resuelve el problema clásico de la manipulación robótica por aprendizaje por imitación: en lugar de programar a mano una secuencia de agarre, aprende de 83 episodios teleoperados (14.896 fotogramas a 30 FPS) cómo mover el efector final. ACT predice trozos (chunks) de acciones futuras en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la publicación y el despliegue de políticas robóticas en formato abierto. Con 51,67 millones de parámetros y solo 0,2 GB de pesos, es un ejemplo de política ligera, reproducible y ejecutable en hardware de consumo, lo que la hace útil como referencia para quien quiera replicar el flujo completo de LeRobot con un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume una observación por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un cuello de botella variacional (VAE) y un cabezal de predicción de chunks de acción. La política consume `observation.state` (vector de 7 dimensiones), dos imágenes RGB de 3x480x640 (`observation.images.top` y `observation.images.left`) y produce un vector `action` de 7 dimensiones. El entrenamiento se realizó con LeRobot 0.6.0 durante 50.000 pasos, batch de 32, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre el dataset `MakinoKF/rebot_pick_nut_on_scale_dataset_20261111_183325` (83 episodios, 14.896 fotogramas, 30 FPS, tarea "pick the nut").

No se documenta en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un pipeline de imitación supervisada). La innovación principal del método, descrita en el paper arXiv 2304.13705, es la predicción de chunks de acción que mitigan el error compounding y permiten un control más suave, junto con una arquitectura de atención que fusiona observaciones visuales y propioceptivas.

## Capacidades

- Control visuomotor de un brazo robótico `rebot_b601_follower` para la tarea de recoger una tuerca.
- Predicción de acciones de 7 dimensiones (posición/orientación del efector y pinza) a partir de estado articular y dos vistas de cámara.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita.
- Predicción de chunks de acción que reducen la acumulación de error en secuencias largas.
- Ejecución en tiempo real mediante `lerobot-rollout` con cámaras OpenCV a 640x480 y 30 FPS.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, visión general, audio ni capacidades multilingües: es una política robótica especializada, no un modelo de propósito general.

## Casos de uso

- Replicación de experimentos de imitación: usar la política como referencia para validar el flujo completo de LeRobot (grabación, entrenamiento y despliegue) sobre un robot `rebot_b601_follower` con dos cámaras.
- Automatización de una celda de pick-and-place: la política ejecuta la secuencia de agarre de una tuerca sobre una balanza, adecuada para tareas repetitivas de laboratorio o línea de montaje ligera.
- Base para fine-tuning: partir de estos pesos y reentrenar con un dataset propio para adaptar la política a nuevas posiciones de objeto o iluminación, aprovechando el bajo coste computacional (51,67 M de parámetros).
- Docencia y formación en robótica: sirve como ejemplo didáctico de un pipeline completo de aprendizaje por imitación con hardware asequible y código abierto.
- Benchmark interno de políticas ACT: comparar variantes de arquitectura o hiperparámetros contra esta línea base en la misma tarea y robot.
- Pruebas de integración de sensores: validar la sincronización de dos cámaras (top y left) y el estado articular en un lazo de control a 30 FPS.
- Prototipado rápido de demos: al pesar 0,2 GB y ejecutarse con `lerobot-rollout`, permite montar demostraciones en minutos sin infraestructura de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, MMLU, HumanEval, GSM8K ni métricas equivalentes (no aplicables a una política robótica).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,67 M de parámetros y pesos en safetensors de 0,2 GB, la inferencia cabe holgadamente en GPUs de consumo (estimación orientativa por debajo de 1-2 GB, sin dato oficial).
- GPU recomendadas: cualquier GPU compatible con CUDA para `lerobot-rollout`; el entrenamiento se realizó con `--policy.device=cuda`, por lo que se recomienda al menos una GPU NVIDIA consumer (RTX 3060 o superior) para reentrenar.
- Cabe en GPU de consumo: sí, por el tamaño del modelo y del repositorio (0,2 GB).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput estimados: no disponibles; el lazo de control opera a 30 FPS según el dataset y la configuración de cámaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, MakinoKF) | 51,67 M | no aplica | pick the nut con `rebot_b601_follower` | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable (del orden de decenas de M) | no aplica | manipulación por imitación | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | manipulación por imitación | según repo | Hugging Face / LeRobot |
| Políticas π0 / OpenVLA | miles de M | no aplica | manipulación generalista | según modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenada solo para la tarea "pick the nut"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de hardware: requiere el robot `rebot_b601_follower` y las cámaras `top` y `left` con los mismos nombres e índices de observación; cualquier cambio de montaje o calibración puede degradar el comportamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que no se puede garantizar su fiabilidad en producción.
- Dataset pequeño: 83 episodios y 14.896 fotogramas son una base limitada; posibles problemas de sobreajuste a posiciones, iluminación y fondo del dataset original.
- Riesgo de fallo silencioso: al ser una política de imitación sin mecanismo de verificación, puede ejecutar acciones incorrectas sin señal de error; se recomienda supervisión humana y parada de emergencia.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con un único operador y entorno, hereda sus sesgos motores y de escena.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; verificar la licencia de los datos y del robot subyacente.
- No es un modelo de lenguaje: no debe usarse para generación de texto, razonamiento, código ni tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MakinoKF/rebot_pick_nut_on_scale_dataset_20261111_183325_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/rebot_pick_nut_on_scale_dataset_20261111_183325
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/rebot_pick_nut_on_scale_dataset_20261111_183325
