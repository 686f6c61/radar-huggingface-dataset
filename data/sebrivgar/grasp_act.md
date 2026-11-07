# SebRivGar/grasp_ACT

## Resumen

`SebRivGar/grasp_ACT` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación publicado por Zhao et al. (2023) que predice trozos cortos de acciones (*action chunks*) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está pensado para controlar un robot de tipo `so_follower` (brazo tipo SO-100/SO-101) equipado con dos cámaras: una en la muñeca y otra cenital.

La tarea concreta para la que se ha entrenado es "Grasp cube and put it in box" (coger un cubo y depositarlo en una caja), a partir de 100 episodios de teleoperación que suman 119.529 fotogramas a 30 FPS. El modelo consume el estado articular (6 dimensiones) y dos imágenes RGB de 480×640, y produce un vector de acción de 6 dimensiones. Con 51,6 millones de parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto, incluso en CPU o en GPUs de consumo.

Su relevancia es la de un ejemplo práctico y reproducible de *imitation learning* aplicado a manipulación robótica: sirve como referencia para quien quiera entrenar sus propias políticas ACT con LeRobot, y como punto de partida para experimentar con el pipeline completo (grabación de datos, entrenamiento, despliegue en robot real). No es un modelo de propósito general ni un LLM: es una política específica de tarea, con un ámbito de aplicación muy acotado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la arquitectura ACT) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; la instrucción de tarea es una cadena de texto fija) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot 0.6.2 |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist`, `top` (480×640, 3 canales) |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida de acción | `action`, shape (6,) |
| Pipeline | robotics |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un *chunk* de acciones futuras (típicamente varias decenas de pasos) a partir de la observación actual. Esta estrategia reduce el error de acumulación y mejora la estabilidad del control, además de mitigar el problema de la ambigüedad temporal en demostraciones humanas. La arquitectura combina un backbone visual (encoder de imágenes) con un transformer que fusiona las representaciones visuales y el estado propioceptivo para generar la secuencia de acciones. El modelo aquí publicado tiene 51,6 millones de parámetros, coherente con una implementación ACT de tamaño moderado.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `SebRivGar/dataset2`, compuesto por 100 episodios y 119.529 fotogramas a 30 FPS de la tarea "Grasp cube and put it in box". La configuración reportada es: 20.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se especifica en la información disponible si hubo aumento de datos, qué backbone visual se empleó exactamente ni la composición detallada del dataset más allá del número de episodios y fotogramas. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; el método se limita al esquema ACT estándar.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so_follower` a partir de observaciones visuales y de estado articular.
- Aprendizaje por imitación: reproduce la tarea "Grasp cube and put it in box" aprendida de 100 episodios de teleoperación.
- Percepción visual multi-cámara: procesa simultáneamente una vista de muñeca y una vista cenital a 480×640.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos individuales, lo que aporta estabilidad al control.
- Ejecución en tiempo real: el modelo está pensado para ejecutarse a 30 FPS, la frecuencia de los datos de entrenamiento.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingües: es una política específica de tarea, no un modelo de lenguaje.

## Casos de uso

- **Automatización de una tarea de pick-and-place en laboratorio**: el modelo ejecuta la secuencia de coger un cubo y dejarlo en una caja sobre un brazo SO-100/SO-101, lo que permite validar el pipeline completo de LeRobot antes de escalar a tareas más complejas.
- **Punto de partida para reentrenamiento con datos propios**: sirve como referencia de configuración (20.000 pasos, batch 8, lr 1e-5, AdamW) para entrenar políticas ACT con `lerobot-train` sobre nuevos datasets y comparar curvas de aprendizaje.
- **Docencia y formación en imitation learning**: al ser un modelo pequeño (51,6 M de parámetros) y con un dataset público de 100 episodios, es adecuado para cursos y talleres donde se explique el ciclo completo de grabación, entrenamiento y despliegue en robótica.
- **Benchmark de referencia para políticas ACT**: permite comparar el rendimiento de nuevas implementaciones o variantes de ACT contra una política ya entrenada y publicada, usando la misma tarea y el mismo robot.
- **Pruebas de integración de hardware**: útil para verificar la calibración de cámaras, la latencia del bus del robot y la frecuencia de control antes de abordar proyectos de mayor envergadura.
- **Prototipado rápido de demos robóticas**: con un repositorio de 0,2 GB y un modelo de 51,6 M de parámetros, se puede desplegar en un equipo de laboratorio sin necesidad de GPUs de gama alta, lo que facilita demos presenciales.
- **Investigación en robustez visual**: al depender de dos cámaras, permite estudiar cómo afectan cambios de iluminación, oclusiones o posiciones de objeto a la tasa de éxito de una política ACT entrenada con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 51,6 M de parámetros en safetensors (aproximadamente 200 MB en fp32), la inferencia cabe holgadamente en cualquier GPU con 2 GB o más de VRAM; en la práctica, el cuello de botella suele ser el procesamiento de las dos imágenes de 480×640, no el modelo.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento, una RTX 3090/4090 o superior acelera los 20.000 pasos; para inferencia, una GPU de gama media es suficiente.
- **¿Cabe en GPU de consumo?**: sí, con margen amplio. También es viable en CPU para pruebas de latencia, aunque a 30 FPS puede requerir optimización.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`) es la vía documentada. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- **Latencia y throughput**: no disponibles. La model card no reporta tiempos de inferencia ni FPS efectivos en robot real.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Tarea | Robot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `SebRivGar/grasp_ACT` | ACT | 51,6 M | Grasp cube and put it in box | `so_follower` | no disponible | Hugging Face |
| `QianGroup/act_grasp` | ACT | no disponible | Tarea de grasping | no disponible | no disponible | Hugging Face |
| `Neil7281/Grasp_ACT_1` | ACT | no disponible | Tarea de grasping | no disponible | no disponible | Hugging Face |

Los tres modelos comparten el mismo método (ACT) y una tarea de agarre, pero no se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa rigurosa. No se han identificado en la búsqueda alternativas de otros métodos (por ejemplo, Diffusion Policy o VQ-BeT) con datos verificables para incluir en la tabla.

## Limitaciones y advertencias

- **Especificidad de tarea extrema**: el modelo solo ha sido entrenado para "Grasp cube and put it in box"; no generaliza a otras tareas, objetos ni entornos sin reentrenamiento.
- **Dependencia del robot y las cámaras**: está calibrado para un `so_follower` con cámaras `wrist` y `top` a 480×640 y 30 FPS. Cambiar la configuración de hardware o la posición de las cámaras degradará el rendimiento.
- **Sin evaluación publicada**: no hay tasas de éxito en robot real, lo que impide estimar su fiabilidad en producción.
- **Riesgo de sobreajuste al dataset**: con 100 episodios y 119.529 fotogramas, la política puede memorizar posiciones y condiciones de iluminación concretas; se desconoce su robustez ante cambios de posición del cubo o de la caja.
- **Licencia no disponible**: no se especifica licencia en la model card ni en los metadatos, lo que impide confirmar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier despliegue comercial.
- **Idiomas y sesgos**: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos derivados de las demostraciones humanas (por ejemplo, trayectorias y velocidades idiosincrásicas del operador).
- **Alucinación**: no aplica en el sentido habitual; el riesgo equivalente es generar acciones fuera de distribución que pueden provocar colisiones o fallos de agarre.
- **Mantenimiento**: el repositorio tiene 0 descargas y 0 likes, creado y actualizado el 7 de noviembre de 2026, sin señales de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SebRivGar/grasp_ACT
- Dataset de entrenamiento: https://huggingface.co/datasets/SebRivGar/dataset2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SebRivGar/dataset2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo comparable `QianGroup/act_grasp`: https://huggingface.co/QianGroup/act_grasp
- Modelo comparable `Neil7281/Grasp_ACT_1`: https://huggingface.co/Neil7281/Grasp_ACT_1
