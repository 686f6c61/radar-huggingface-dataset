# MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558_act-policy-v1

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de composición y permite obtener tasas de éxito elevadas en tareas de manipulación robótica a partir de datos de teleoperación. Este repositorio concreto, `MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558_act-policy-v1`, es una política ACT entrenada con LeRobot para el robot `rebot_b601_follower` y la tarea "pick the nut on the scale" (recoger la tuerca de la báscula).

El modelo consume el estado articular de 7 dimensiones y dos cámaras RGB de 480x640 (`top` y `left`), y produce un vector de acción de 7 dimensiones. Cuenta con 51.670.663 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors, lo que lo sitúa en el rango de políticas ligeras desplegables en hardware de consumo.

Es relevante como ejemplo reproducible de un pipeline completo de imitación con LeRobot 0.6.0: dataset de 40 episodios y 6.070 fotogramas a 30 FPS, 50.000 pasos de entrenamiento con AdamW y learning rate 1e-5. No obstante, el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; ventana de observación definida por la configuración de entrenamiento, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (modelo de robótica; la instrucción de tarea es una cadena de texto fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que, en lugar de predecir una única acción por paso, genera un chunk de acciones futuras. La arquitectura combina un codificador de imágenes (típicamente ResNet) que procesa las dos cámaras (`observation.images.top` y `observation.images.left`, 3x480x640), un codificador del estado articular (`observation.state`, 7 dimensiones) y un decodificador transformer que produce secuencias de acciones de 7 dimensiones. La innovación clave del método es el *action chunking* junto con el *temporal ensembling*, que suaviza las transiciones entre chunks y mitiga el error acumulado.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558`: 40 episodios, 6.070 fotogramas a 30 FPS, una única tarea ("pick the nut on the scale"). Se ejecutaron 50.000 pasos con batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni refuerzo; es aprendizaje por imitación supervisado puro a partir de teleoperación. Tampoco se detalla la composición del dataset más allá del número de episodios ni si hubo aumentos de datos.

## Capacidades

- Control robótico de manipulación: predice acciones de 7 grados de libertad (vector `action` de forma `(7,)`) a partir de estado y visión.
- Percepción visual multi-cámara: procesa simultáneamente dos flujos RGB de 480x640 (`top` y `left`).
- Aprendizaje por imitación de una tarea concreta: "pick the nut on the scale".
- Generación de chunks de acción con ensamblado temporal para trayectorias más suaves.
- Ejecución en bucle cerrado sobre el robot `rebot_b601_follower` mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política visuomotora, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto libre.

## Casos de uso

- Automatización de una celda de pick-and-place: la política ejecuta la tarea "pick the nut on the scale" de forma autónoma sobre el robot `rebot_b601_follower`, sustituyendo la teleoperación repetitiva por inferencia directa.
- Prototipado rápido de políticas de imitación: sirve como referencia reproducible para validar el pipeline de LeRobot (grabación, entrenamiento y rollout) antes de escalar a tareas propias.
- Benchmark interno de hardware robótico: al ser ligera (51,7 M de parámetros, 0,2 GB), permite medir latencia de inferencia y estabilidad de control en el robot objetivo.
- Base para fine-tuning con datos propios: el checkpoint ACT puede reentrenarse con `lerobot-train` sobre un dataset nuevo de la misma morfología para adaptar la tarea.
- Docencia y formación en robótica de imitación: ejemplo completo y de licencia permisiva para enseñar action chunking, temporal ensembling y evaluación en robot real.
- Investigación en generalización visual: al usar dos cámaras, es útil para estudiar robustez ante cambios de iluminación, posición de objetos o distractores en la mesa.
- Integración en pipelines de evaluación automatizada: el script `lerobot-rollout` con `--duration` permite lanzar episodios acotados y registrar tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de trials, éxitos ni tasa de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros, ~0,2 GB en safetensors), la inferencia en FP32 requiere del orden de 0,2-0,3 GB para pesos, más activaciones de las dos imágenes 480x640; en la práctica cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no especificadas por el autor. Dado el tamaño, una RTX 3060/4060 o superior es suficiente; A100/H100 no son necesarias para inferencia, aunque pueden usarse para reentrenar.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM; no se documenta un mínimo oficial.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); el entrenamiento se realiza con `lerobot-train --policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El dataset está a 30 FPS, lo que sugiere que el bucle de control opera a esa frecuencia, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, MakinoKF) | 51,7 M | 2 camaras 480x640 + estado 7D | pick the nut on the scale (rebot_b601_follower) | Apache 2.0 | Hugging Face, 0 descargas |
| ACT (paper original, Zhao et al.) | no disponible | no disponible | manipulacion general (ALOHA) | no disponible | paper arXiv:2304.13705 |
| Otras politicas LeRobot (p. ej. Diffusion Policy, SmolVLA) | no disponible en esta ficha | no disponible | manipulacion general | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables publicados para este checkpoint, por lo que la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito medida en robot real; el rendimiento es desconocido y no debe asumirse.
- Dataset muy pequeño: 40 episodios y 6.070 fotogramas para una única tarea, lo que limita la generalización a posiciones, iluminación o distractores no vistos.
- Especialización estrecha: solo ejecuta "pick the nut on the scale"; no es un modelo general ni transferible sin reentrenamiento.
- Dependencia de hardware concreto: requiere el robot `rebot_b601_follower` y dos cámaras con nombres `top` y `left` que coincidan con las claves de observación del entrenamiento.
- Riesgo de sobreajuste y de fallo silencioso ante cambios de calibración, iluminación o fondo.
- Sin soporte multilingüe ni de texto: no debe emplearse como modelo de lenguaje; la tarea es una cadena fija.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia de las dependencias de LeRobot y de los pesos base.
- Sesgos: no documentados por el autor; en robótica de imitación, los sesgos provienen de la distribución de demostraciones (posiciones, velocidad del operador, condiciones de la celda).
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
