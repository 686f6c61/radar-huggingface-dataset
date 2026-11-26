# rbtrprjkt/cut-short_tape-on-box_act75

## Resumen

`rbtrprjkt/cut-short_tape-on-box_act75` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705 y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de cuatro cámaras RGB y el estado articular de un brazo WidowX AI, predice directamente las acciones del robot para ejecutar una tarea física concreta. El repositorio tiene 51.645.063 parámetros en formato safetensors y ocupa 0,2 GB.

La tarea aprendida es específica: "Pick the custom utility knife and cut the black tape on the cardboard box". El modelo se entrenó sobre el dataset `rbtrprjkt/cut-short_tape-on-box`, compuesto por 70 episodios de teleoperación a 30 FPS, lo que suma 62.809 fotogramas. Con 75.000 pasos de entrenamiento, batch de 32 y tasa de aprendizaje de 1e-5, se trata de un artefacto de investigación reproducible más que de un producto listo para producción.

Su relevancia es acotada pero clara para quien trabaja en manipulación robótica con aprendizaje por imitación: sirve como referencia de cómo se entrena y despliega una política ACT con LeRobot 0.6.2 en un robot WidowX AI, y como punto de partida para replicar el flujo con datos propios. No hay resultados de evaluación publicados ni métricas de éxito en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.645.063 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `widowxai_follower_robot` |
| Cámaras de entrada | `cam_high`, `cam_low`, `cam_left_wrist`, `cam_right_wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (7,) |
| Salida de acción | `action` (7,) |
| Librería | LeRobot 0.6.2 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador de observaciones (cuatro imágenes RGB de 480x640 más un vector de estado de 7 dimensiones) con un transformer que genera secuencias de acciones de 7 dimensiones. El detalle exacto de capas, dimensiones ocultas y número de cabezas de atención no se especifica en la información disponible.

El entrenamiento se realizó sobre 70 episodios teleoperados (62.809 fotogramas a 30 FPS) durante 75.000 pasos con optimizador AdamW, batch de 32, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo; ACT es puramente supervisado sobre demostraciones. Tampoco se detalla la composición del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Control visomotor para una tarea de manipulación concreta: coger un cúter y cortar cinta negra sobre una caja de cartón.
- Fusión de cuatro vistas de cámara (alta, baja y dos muñecas) para estimar la pose de objetos y del efector final.
- Predicción de secuencias de acciones (action chunking) a partir del estado articular de 7 dimensiones.
- Ejecución en tiempo real sobre el robot `widowxai_follower_robot` mediante `lerobot-rollout`.
- Entrenamiento reproducible con `lerobot-train` y el tipo de política `act`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de aprendizaje por imitación: sirve como referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) en un WidowX AI antes de abordar tareas propias.
- Automatización de una celda de corte de precintos: el modelo puede ejecutar la secuencia de coger el cúter y cortar la cinta en un entorno controlado con la misma disposición de cámara y robot.
- Generación de datos sintéticos de política: al ser un checkpoint reproducible con semilla y configuración documentadas, se puede usar como baseline para comparar variantes de ACT (distinto número de pasos, batch, learning rate).
- Docencia y formación en robótica: el repositorio de 0,2 GB y 51,6 M de parámetros es ligero y cabe en una GPU de consumo, lo que facilita su uso en laboratorios y cursos.
- Pruebas de integración de hardware: el comando `lerobot-rollout` permite verificar la calibración de cámaras y del brazo antes de entrenar políticas nuevas.
- Benchmark interno de éxito de tareas: aunque el autor no publica tasa de éxito, el modelo puede emplearse como referencia para medir la mejora de políticas entrenadas con más episodios o datos aumentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros en safetensors, el peso en FP32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, con margen amplio; el cuello de botella real son las cuatro cámaras RGB a 30 FPS y el bus del robot, no el modelo.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=rbtrprjkt/cut-short_tape-on-box_act75`; el ecosistema LeRobot usa PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control viene fijada por los 30 FPS del dataset y por el bucle de rollout de LeRobot.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rbtrprjkt/cut-short_tape-on-box_act75` | ACT (LeRobot) | 51,6 M | no aplica | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT (LeRobot) | variable | no aplica | Apache 2.0 | Hugging Face / docs |
| Políticas Diffusion Policy | difusión | variable | no aplica | variable | Hugging Face |
| Políticas π0 / OpenVLA | VLA | miles de millones | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación relevante es metodológica: ACT es más ligero y rápido de entrenar que las políticas VLA de gran escala, pero está especializado en una única tarea y no generaliza a instrucciones en lenguaje natural.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea "Pick the custom utility knife and cut the black tape on the cardboard box"; no se espera que funcione en otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que se desconoce su fiabilidad real en el robot.
- Dependencia del hardware: requiere un `widowxai_follower_robot` y exactamente las cuatro cámaras (`cam_high`, `cam_low`, `cam_left_wrist`, `cam_right_wrist`) con la resolución y disposición usadas en el entrenamiento.
- Sensibilidad a cambios de entorno: iluminación, posición de objetos, fondo o calibración distinta pueden degradar el comportamiento; no se documenta robustez.
- Dataset pequeño: 70 episodios y 62.809 fotogramas son una base limitada; el riesgo de sobreajuste a posiciones concretas es alto.
- Sin capacidades de lenguaje: no procesa instrucciones textuales ni mantiene diálogo; el campo `--task` es solo una etiqueta para el rollout.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sesgos: no se documentan sesgos específicos; en robótica, los sesgos provienen de la distribución de demostraciones (posiciones, objetos y condiciones limitadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rbtrprjkt/cut-short_tape-on-box_act75
- Dataset de entrenamiento: https://huggingface.co/datasets/rbtrprjkt/cut-short_tape-on-box
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rbtrprjkt/cut-short_tape-on-box
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
