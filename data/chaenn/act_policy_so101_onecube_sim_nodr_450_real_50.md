# Chaenn/act_policy_so101_onecube_sim_nodr_450_real_50

## Resumen

`Chaenn/act_policy_so101_onecube_sim_nodr_450_real_50` es una política de imitación entrenada con el método Action Chunking with Transformers (ACT) y distribuida a través de la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir del estado articular de un brazo robótico SO-101 y de dos cámaras (lateral y de muñeca), predice directamente comandos de acción de 6 dimensiones para ejecutar una tarea de manipulación concreta. El autor del repositorio es el usuario Chaenn y la licencia declarada es Apache 2.0.

El modelo resuelve una única tarea de picking: "Pick up the red cube and place it inside the black boundary" (coger el cubo rojo y colocarlo dentro del límite negro). Se entrenó sobre un dataset de 500 episodios y 218.753 fotogramas a 30 FPS, que combina 450 episodios de simulación sin domain randomization y 50 episodios reales, según se deduce del identificador del repositorio y del nombre del dataset. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero pensado para inferencia en tiempo real sobre hardware modesto.

Su relevancia es acotada pero clara: sirve como referencia reproducible para quienes trabajan con el robot educativo SO-101 y quieren evaluar el efecto de mezclar datos simulados y reales en una política ACT. No hay métricas de éxito publicadas ni resultados de benchmarks, por lo que su utilidad práctica debe validarse empíricamente antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; recibe una instrucción de tarea como texto en la CLI, pero no genera lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de acumulación y permite un control más suave. La política consume `observation.state` con forma `(6,)` y dos imágenes RGB de `(3, 480, 640)` procedentes de las cámaras `side` y `wrist`, y produce una acción de `(6,)`. El backbone es un transformer con encoder visual; el repositorio no detalla la configuración interna de capas, dimensiones ocultas ni mecanismo de atención más allá de lo que especifica el paper de referencia (arXiv:2304.13705).

El entrenamiento se realizó con LeRobot 0.6.2 durante 170.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset contiene 500 episodios y 218.753 fotogramas a 30 FPS; el nombre del repositorio sugiere 450 episodios simulados sin domain randomization y 50 reales, aunque la model card no desglosa esa composición ni documenta el procedimiento de mezcla. No se menciona RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento supervisado por imitación.

## Capacidades

- Control visuomotor de un brazo SO-101 (`so_follower`) para una tarea de pick-and-place concreta.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado articular y dos vistas RGB.
- Fusión de información de cámara lateral y de muñeca para localizar el cubo y el límite de destino.
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- Entrenamiento y reentrenamiento reproducibles con `lerobot-train` sobre el dataset asociado.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni generación de texto.
- No tiene capacidades multilingües ni modo de pensamiento; la instrucción de tarea es solo una cadena de texto usada por la CLI.

## Casos de uso

- Validación de políticas ACT en el robot SO-101: ejecutar `lerobot-rollout` con la tarea "Pick up the red cube and place it inside the black boundary" para comprobar el comportamiento del checkpoint antes de entrenar variantes propias.
- Estudio del transfer sim-to-real: al combinar 450 episodios simulados sin domain randomization con 50 reales, sirve para medir cuánta brecha existe entre simulación y realidad en una tarea sencilla de manipulación.
- Línea base para comparativas de datos: reentrenar con el mismo dataset y variar la proporción sim/real permite aislar el efecto de la mezcla sobre la tasa de éxito.
- Docencia y prototipado en robótica de imitación: su tamaño (0,2 GB, ~51,7 M de parámetros) permite iterar rápido en laboratorios con GPUs de gama media.
- Pruebas de pipeline de inferencia: útil para verificar la integración de cámaras OpenCV, calibración del SO-101 y el flujo de `lerobot-rollout` antes de pasar a políticas más costosas.
- Generación de datos de evaluación: ejecutar la política repetidamente para recolectar trayectorias y analizar modos de fallo (agarre, alineación, colisión con el límite).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet_", por lo que no existe tasa de éxito, número de ensayos ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 los pesos ocupan en torno a 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, asumiendo memoria adicional para las dos imágenes de 480x640 y el grafo de inferencia.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060 o superior permite ejecutar a 30 FPS sin dificultad.
- Cabe en GPU consumer: sí, previsiblemente en cualquier tarjeta moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset y la inferencia están configurados a 30 FPS, pero no se publica latencia por paso ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Chaenn/act_policy_so101_onecube_sim_nodr_450_real_50` | 51.668.614 | no aplica | Pick-and-place de cubo rojo con SO-101 | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Tareas de manipulación diversas | Apache 2.0 (segun LeRobot) | Hugging Face / docs de LeRobot |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación visuomotora | Apache 2.0 (segun LeRobot) | Hugging Face / docs de LeRobot |

No se dispone de datos de rendimiento de este checkpoint ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay evaluación publicada: se desconoce la tasa de éxito real, tanto en simulación como en el robot físico.
- Entrenada para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- El nombre del repositorio indica entrenamiento sin domain randomization en la parte simulada, lo que puede reducir la robustez frente a cambios de iluminación, posición de cámara o texturas en el entorno real.
- Solo 50 episodios reales frente a 450 simulados: posible sesgo hacia la distribución simulada y brecha sim-to-real no cuantificada.
- No procesa lenguaje natural de forma generativa; la instrucción de tarea es una cadena fija usada por la CLI.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erróneas o inseguras sin mecanismos de parada documentados más allá de `--duration`.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación hace desaconsejable su uso en producción sin validación previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso comunitario ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_policy_so101_onecube_sim_nodr_450_real_50
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_onecube_sim_nodr_450_real_50
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Chaenn/so101_onecube_sim_nodr_450_real_50
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
