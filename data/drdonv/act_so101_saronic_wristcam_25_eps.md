# drdonv/act_so101_saronic_wristcam_25_eps

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `drdonv/act_so101_saronic_wristcam_25_eps`, es una política entrenada con LeRobot sobre el robot SO-101 (variante `so_follower`) que resuelve una única tarea: recoger un objeto y colocarlo en una zona objetivo.

El modelo consume el estado articular de 6 dimensiones y dos cámaras (superior y de muñeca) a resolución 480x640, y produce un vector de acción de 6 dimensiones. Se entrenó sobre un dataset propio de 25 episodios y 8454 fotogramas a 30 FPS, con 40 000 pasos de entrenamiento y batch de 8. Con 51,7 millones de parámetros y 2,5 GB de repositorio, es un modelo compacto orientado a inferencia en tiempo real en hardware de consumo.

Su relevancia es práctica: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue) para un brazo robótico de bajo coste, y sirve como referencia reproducible para quien quiera entrenar sus propias políticas de imitación sin infraestructura pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por fotograma) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo robótico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `top`, `wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | drdonv/so101_saronic_wristcam_25_eps (25 episodios, 8454 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 40 000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

ACT combina un codificador visual (procesa las dos imágenes de 480x640 de las cámaras superior y de muñeca) con un transformer que fusiona la observación del estado articular de 6 dimensiones y genera un *chunk* de acciones futuras en lugar de una sola acción por paso. Esta predicción por fragmentos es la innovación central del método: mitiga el error compuesto típico de las políticas que predicen paso a paso y permite un control más suave en tareas de manipulación.

El entrenamiento es de imitación supervisada sobre 25 episodios teleoperados (8454 fotogramas a 30 FPS) de la tarea "Pick up the object and place it in the target zone". Se usaron 40 000 pasos con AdamW, learning rate 1e-05, batch de 8 y semilla 1000, sobre LeRobot 0.6.1. La model card no documenta uso de RLHF, DPO ni aumentos de datos, ni detalla la composición exacta del dataset más allá del número de episodios y la tarea.

## Capacidades

- Generación de acciones de control para un brazo robótico SO-101 (`so_follower`) a partir de estado articular y dos vistas de cámara.
- Predicción de fragmentos de acción (action chunking), que reduce el error acumulado frente a políticas paso a paso.
- Percepción visual multimodal: integra cámara superior y cámara de muñeca para localizar el objeto y la zona objetivo.
- Ejecución de una tarea concreta de manipulación: recoger un objeto y depositarlo en la zona objetivo.
- Inferencia en tiempo real a 30 FPS (frecuencia del dataset de entrenamiento).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de lenguaje; es una política de imitación puramente visomotora.

## Casos de uso

- Recogida y colocación automatizada en línea de montaje: la política ejecuta la tarea "pick and place" sobre el SO-101 con las dos cámaras como única entrada, adecuada para ciclos repetitivos de clasificación de piezas.
- Base para entrenar políticas propias con LeRobot: sirve como referencia reproducible del flujo `lerobot-train` con ACT, útil para equipos que quieran adaptar el método a sus propios objetos y posiciones.
- Prototipado de robótica de bajo coste: con 51,7 M de parámetros y 2,5 GB de pesos, se puede desplegar en una estación de trabajo con GPU de consumo para validar tareas de manipulación antes de invertir en hardware mayor.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del action chunking y de la configuración de cámaras (superior + muñeca) en la tasa de éxito de tareas de agarre.
- Docencia y demostraciones: el comando `lerobot-rollout` permite ejecutar la política en un robot real en menos de un minuto de configuración, lo que facilita talleres prácticos de imitación.
- Evaluación de robustez ante cambios de iluminación y posición: al ser una política entrenada con 25 episodios, sirve para medir la sensibilidad de ACT a variaciones del entorno y decidir si hace falta más datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de ensayos, éxitos ni tasas de acierto en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el modelo ocupa aproximadamente 0,2 GB, por lo que la mayor parte de la memoria la consumen los buffers de imagen (dos flujos de 3x480x640) y el runtime de PyTorch.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060 o superior permite inferencia a 30 FPS con margen. Para entrenamiento, una RTX 4090 o A100 acelera los 40 000 pasos, aunque el tamaño del modelo permite entrenar en GPUs más modestas.
- Cabe en GPU de consumo: sí, con holgura; el cuello de botella es el pipeline de cámaras y la latencia de control, no la memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=drdonv/act_so101_saronic_wristcam_25_eps`), PyTorch con safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles de forma medida; el dataset y el comando de despliegue usan 30 FPS, que es la frecuencia de referencia esperada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drdonv/act_so101_saronic_wristcam_25_eps | 51,7 M | ACT (LeRobot) | Pick and place SO-101 | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (genéricas) | variable | ACT | Manipulación diversa | Apache 2.0 | Hugging Face / docs LeRobot |
| Políticas Diffusion Policy | variable | Difusión | Manipulación diversa | variable | Repositorios de investigación |
| Políticas VLA (p. ej. OpenVLA) | miles de millones | VLA | Manipulación guiada por lenguaje | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tipo y licencia.

## Limitaciones y advertencias

- Entrenada para una única tarea ("Pick up the object and place it in the target zone") y un único robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeño (25 episodios, 8454 fotogramas): alta probabilidad de sobreajuste a posiciones, iluminación y objetos concretos del entorno de grabación.
- Sin resultados de evaluación en robot real publicados; no hay evidencia cuantitativa de tasa de éxito.
- Requiere que los nombres y la configuración de las cámaras coincidan exactamente con los usados en entrenamiento (`top`, `wrist`, 480x640, 30 FPS); cualquier desviación degrada el rendimiento.
- No procesa lenguaje ni instrucciones textuales; el parámetro `--task` es informativo y no condiciona la política.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción exige validación propia.
- Riesgo de comportamiento errático ante objetos fuera de distribución o distracciones en la escena, sin mecanismo de seguridad integrado en la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drdonv/act_so101_saronic_wristcam_25_eps
- Dataset de entrenamiento: https://huggingface.co/datasets/drdonv/so101_saronic_wristcam_25_eps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=drdonv/so101_saronic_wristcam_25_eps
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
