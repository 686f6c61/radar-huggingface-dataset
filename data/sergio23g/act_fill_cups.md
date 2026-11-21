# Sergio23g/act_fill_cups

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación robótica. El modelo `Sergio23g/act_fill_cups` es una política concreta entrenada con LeRobot sobre el dataset `Sergio23g/fill_cups_final`, orientada a la tarea "Put one cube from the box into each empty cup" con un robot de tipo `so_follower` (SO-100/101 de bajo coste).

Se trata de una política visual-motora pequeña (51.668.614 parámetros, ~0,2 GB en safetensors) que consume el estado articular de 6 dimensiones y dos cámaras RGB de 480x640 (`wrist` y `top`), y produce un vector de acción de 6 dimensiones. No es un modelo de lenguaje ni un VLM: es un controlador neuronal entrenado específicamente para una tarea y un robot concretos, por lo que su relevancia es práctica para quien quiera reproducir o adaptar un pipeline de imitation learning con LeRobot en hardware asequible.

El modelo es relevante ahora porque ejemplifica el flujo completo de LeRobot 0.7.1: grabación de datos con teleoperación, entrenamiento con ACT y despliegue con `lerobot-rollout`. Su utilidad es demostrativa y de referencia; no está pensado como política generalista ni como base para múltiples tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se pasa como string al runner) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `top` (RGB 3x480x640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | `Sergio23g/fill_cups_final` (33 episodios, 54.830 frames, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un transformer que, en cada paso de inferencia, recibe las observaciones (estado articular y dos imágenes RGB) y predice un chunk de acciones futuras en lugar de una única acción. Este diseño, propuesto en el paper arXiv:2304.13705, mitiga el problema de la acumulación de errores en políticas paso a paso y suele traducirse en tasas de éxito más altas en manipulación fina. La implementación concreta aquí es la de LeRobot (`policy.type=act`), con un encoder visual para cada cámara y un decodificador que emite el vector de acción de 6 dimensiones.

El entrenamiento se realizó sobre 33 episodios teleoperados (54.830 frames a 30 FPS) del dataset `fill_cups_final`, con 20.000 pasos, batch de 8, AdamW y learning rate 1e-05. No se documenta en la información disponible el uso de RLHF, DPO ni aumentos de datos; tampoco se especifican detalles del backbone visual ni del número de capas del transformer. No hay innovaciones técnicas adicionales declaradas más allá del propio mecanismo de action chunking.

## Capacidades

- Control visual-motor para una tarea de manipulación concreta: colocar un cubo de una caja en cada vaso vacío.
- Predicción de chunks de acción de 6 dimensiones a partir de estado articular y dos vistas RGB.
- Aprendizaje por imitación a partir de datos teleoperados (no requiere recompensa ni RL).
- Integración nativa con el ecosistema LeRobot: entrenamiento (`lerobot-train`) y despliegue (`lerobot-rollout`).
- Soporte de ejecución en tiempo real a 30 FPS según la configuración del dataset y del runner.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Reproducción de un pipeline de imitation learning: usar el modelo como referencia para validar la instalación de LeRobot, la calibración del SO-100/101 y la grabación de datos antes de entrenar políticas propias.
- Automatización de una celda de pick-and-place de laboratorio: la política ejecuta la secuencia "cubo a vaso" de forma autónoma durante episodios de hasta 60 segundos, útil para demostraciones y pruebas de repetibilidad.
- Benchmark interno de hardware de bajo coste: comparar tasas de éxito y latencia entre distintas configuraciones de cámaras y brazos `so_follower` usando la misma política como carga de trabajo fija.
- Docencia y formación en robótica: ilustra de extremo a extremo el ciclo teleoperación-dataset-entrenamiento-despliegue con 33 episodios y 20.000 pasos, un coste de entrenamiento asumible en una GPU de consumo.
- Base para fine-tuning en tareas similares: al ser una política ACT pequeña (~51,7 M de parámetros), se puede reentrenar con `lerobot-train` sobre un dataset propio de manipulación de objetos pequeños.
- Pruebas de integración de `lerobot-rollout` en CI: validar que el runner arranca, conecta cámaras y ejecuta la política con la tarea declarada, como smoke test de despliegue robótico.
- Investigación en action chunking: servir como punto de partida para estudiar el efecto del tamaño de chunk y de la frecuencia de control sobre la estabilidad de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, números de trials ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en safetensors el modelo ocupa ~0,2 GB, por lo que cabe holgadamente en cualquier GPU con 4 GB o más, e incluso en CPU para pruebas lentas.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060/4060 en adelante) es suficiente para inferencia a 30 FPS; para entrenamiento se recomienda RTX 3090/4090 o A100/H100 si se amplía el dataset.
- Cabe en GPU de consumo: sí, en todas las RTX modernas e incluso en iGPU con suficiente memoria compartida para inferencia a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (runner oficial), scripts propios con PyTorch + safetensors, y el stack de LeRobot 0.7.1. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; la configuración del dataset es de 30 FPS y el runner está pensado para control en tiempo real, pero no se publican medidas de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sergio23g/act_fill_cups | 51,7 M | estado (6,) + 2 camaras 480x640 | "cubo a vaso" con `so_follower` | no disponible | Hugging Face |
| Politicas ACT genericas de LeRobot | variable (tipicamente decenas de M) | configurable | multiples tareas segun dataset | Apache-2.0 (LeRobot) | Hugging Face / GitHub |
| Diffusion Policy (referencia) | variable | configurable | manipulacion por imitacion | variable segun implementacion | repos de investigacion |
| VLA generalistas (p. ej. RT-2, OpenVLA) | miles de M | lenguaje + vision | multiples tareas | variable | publicaciones / HF |

La comparación directa con VLA generalistas no es equitativa: `act_fill_cups` es una política especializada de un solo task y un solo robot, mientras que los VLA apuntan a generalización entre tareas. Frente a otras políticas ACT de LeRobot, la diferencia principal es el dataset y la tarea, no la arquitectura.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea "Put one cube from the box into each empty cup" con el robot `so_follower` y las cámaras `wrist` y `top`; no generaliza a otras tareas, objetos ni configuraciones de cámara.
- Sin evaluación publicada: no hay tasas de éxito ni número de trials, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no disponible: la model card marca la licencia como "More Information Needed", lo que impide confirmar el uso comercial; hay que contactar con el autor antes de desplegarla en un producto.
- Dataset pequeño: 33 episodios y 54.830 frames son una base limitada; es probable que la política sea sensible a cambios de iluminación, posiciones de objetos y distractores.
- Sin datos de sesgo, alucinación o multilingüismo: al no ser un modelo de lenguaje, estas categorías no aplican, pero tampoco hay análisis de robustez frente a variaciones del entorno.
- Dependencia del stack LeRobot 0.7.1: cambios de versión en el runner o en el formato de observaciones pueden romper la compatibilidad.
- Sin cuantizaciones publicadas: no hay variantes GGUF/INT8, por lo que el despliegue en hardware muy limitado requiere exportación manual.
- Riesgo de sobreajuste al operador y al montaje físico: los datos provienen de teleoperación de un único usuario y una única celda, lo que puede introducir sesgos de trayectoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sergio23g/act_fill_cups
- Dataset de entrenamiento: https://huggingface.co/datasets/Sergio23g/fill_cups_final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Sergio23g/fill_cups_final
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
