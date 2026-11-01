# pavannanjunda333/act_so101_sim_v3_fixed

## Resumen

`act_so101_sim_v3_fixed` es una política de imitación (imitation learning) para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. El modelo lo ha entrenado y publicado el usuario `pavannanjunda333` mediante la librería LeRobot de Hugging Face, y su función es controlar un brazo robótico de tipo `so_follower` (SO-101) en una tarea concreta: depositar un cubo azul en una caja azul. No es un modelo de lenguaje, sino un modelo de política visomotora que mapea observaciones (estado articular y dos cámaras) a acciones motoras de 6 dimensiones.

La arquitectura es un transformer ACT con 51.668.614 parámetros, que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. Consume imágenes de dos cámaras a 480x640 y un vector de estado de 6 componentes, y produce un vector de acción de 6 componentes. El modelo se ha entrenado sobre un dataset simulado de 50 episodios y 25.289 fotogramas a 30 FPS.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue) para una tarea de pick-and-place en simulación. No obstante, al estar entrenado solo en simulación y con un dataset muy pequeño, su transferencia a un robot físico real no está validada y no se han publicado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); ventana de observación basada en el historial de la política ACT |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo de robótica sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual (típicamente ResNet) para procesar las imágenes de cámara y un decodificador transformer que genera un chunk de acciones futuras de forma conjunta. La predicción por chunks, en lugar de paso a paso, mitiga el problema de cambio de distribución (compounding error) típico de las políticas de clonación de comportamiento. El modelo recibe `observation.state` (6 dimensiones), `observation.images.front` (3x480x640) y `observation.images.gripper` (3x480x640), y emite `action` (6 dimensiones).

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `pavannanjunda333/so101_sim_cube_v3_fixed`: 50 episodios, 25.289 fotogramas a 30 FPS, una única tarea ("put the blue cube in the blue box"). La configuración fue de 60.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni datos reales de robot; el dataset es simulado. No se especifica el número de tokens ni la composición detallada del dataset más allá de la tarea y las métricas citadas.

## Capacidades

- Control visomotor de un brazo robótico SO-101 (`so_follower`) con 6 grados de libertad de acción.
- Predicción de chunks de acciones para ejecución estable en tareas de manipulación.
- Fusión de dos vistas de cámara (frontal y de pinza) con el estado articular.
- Ejecución de una tarea concreta de pick-and-place: "put the blue cube in the blue box".
- Integración con el ecosistema LeRobot mediante `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de un pipeline de imitación en simulación: usar el modelo como referencia para validar la instalación de LeRobot, la grabación de datos y el entrenamiento de una política ACT antes de pasar a un robot real.
- Benchmark interno de tareas pick-and-place: comparar la política con otras variantes ACT entrenadas sobre el mismo dataset simulado para medir la sensibilidad a hiperparámetros.
- Docencia y formación en robótica: ilustrar el ciclo completo observación-acción con dos cámaras y estado articular en un entorno controlado.
- Pruebas de integración de hardware SO-101: verificar la calibración de cámaras y puertos del robot usando una política conocida antes de desplegar políticas propias.
- Generación de datos sintéticos de control: emplear las trayectorias predichas como baseline para aumentar un dataset de imitación con variaciones de posición del cubo.
- Investigación en transferencia sim-a-real: usar el modelo como punto de partida para estudiar el gap de dominio entre simulación y robot físico, dado que fue entrenado exclusivamente en simulación.
- Automatización de tareas de clasificación simple en entornos simulados: integrar la política en un simulador para evaluar robustez ante cambios de iluminación o posición de objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 millones de parámetros; en FP32 ocupa aproximadamente 0,2 GB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, incluyendo GTX 1650, RTX 3050 o superiores.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; para entrenamiento se recomienda RTX 3060/4060 o superior, y para despliegue en robot real una Jetson Orin Nano es viable por el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas, e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), con soporte de PyTorch y safetensors; no hay variantes GGUF ni soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; dependen del robot, las cámaras y la frecuencia de control (30 FPS en el dataset de entrenamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_sim_v3_fixed | 51,7 M | Estado 6D + 2 cámaras 480x640 | Pick-and-place simulado SO-101 | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot oficiales | Variable (típicamente 10-80 M) | Estado + cámaras | Tareas diversas grabadas con LeRobot | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (Chi et al.) | Variable | Estado + cámaras | Manipulación por difusión de acciones | MIT / Apache 2.0 según implementación | Repos públicos y LeRobot |
| RT-1 / RT-2 (Google) | Cientos de M a miles de M | Imagen + instrucción textual | Manipulación multi-tarea | No comercial / restringida | No público en su mayoría |

No se dispone de datos de rendimiento comparativo para este modelo concreto, por lo que la comparación se limita a parámetros, entradas, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: no hay evidencia de que funcione en un robot SO-101 físico sin ajuste fino adicional.
- Dataset muy pequeño (50 episodios, 25.289 fotogramas) y una única tarea, lo que limita la generalización a variaciones de posición, iluminación u objetos.
- Sin resultados de evaluación publicados: no se puede afirmar una tasa de éxito; la model card lo indica explícitamente.
- Especializado en una sola instrucción ("put the blue cube in the blue box"); no acepta instrucciones en lenguaje natural ni otras tareas.
- Riesgo de sobreajuste al entorno simulado y a la configuración exacta de cámaras (nombres `front` y `gripper`, resolución 480x640).
- No es un modelo de lenguaje: no tiene sesgos lingüísticos ni riesgo de alucinación textual, pero sí puede fallar silenciosamente en el control motor si las observaciones difieren de las de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en real hace desaconsejable su uso en producción sin evaluación previa.
- Dependencia de la versión de LeRobot (0.6.1) y de la compatibilidad de la API de `lerobot-rollout`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pavannanjunda333/act_so101_sim_v3_fixed
- Dataset de entrenamiento: https://huggingface.co/datasets/pavannanjunda333/so101_sim_cube_v3_fixed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=pavannanjunda333/so101_sim_cube_v3_fixed
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
