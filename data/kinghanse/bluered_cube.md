# kinghanse/BlueRed_Cube

## Resumen

BlueRed_Cube es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705 y desarrollado por el autor kinghanse mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de tres cámaras y del estado articular de un robot bimanual, predice directamente comandos de acción para una tarea concreta de manipulación (recoger un cubo rojo y otro azul con los brazos izquierdo y derecho).

El modelo tiene 51.685.006 parámetros y está empaquetado en safetensors con un tamaño de repositorio de 0,2 GB. La entrada combina un vector de estado de 14 dimensiones con tres imágenes RGB de 480x640 píxeles (cámara cenital y dos cámaras de muñeca), y la salida es un vector de acción de 14 dimensiones. Fue entrenado sobre el dataset kinghanse/Cube_PickUp, compuesto por 34 episodios y 19.421 fotogramas a 30 FPS.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot 0.6.0, desde la teleoperación hasta el despliegue con `lerobot-rollout`. Es un artefacto de investigación y demostración, no un modelo de propósito general, y no incluye resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acción |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica con una cadena fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | dual_so102_client (bimanual, tipo SO-102) |
| Cámaras de entrada | cam_top, cam_wrist_left, cam_wrist_right |
| Entrada de estado | observation.state, shape (14,) |
| Salida de acción | action, shape (14,) |
| Resolución de imagen | 3 x 480 x 640 por cámara |
| Dataset de entrenamiento | kinghanse/Cube_PickUp (34 episodios, 19.421 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 50.000 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones cortos en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. La arquitectura combina un backbone visual (encoder de imágenes por cámara) con un transformer que fusiona las representaciones visuales y el vector de estado, y un decodificador que emite la secuencia de acciones del chunk. El modelo está condicionado por la tarea mediante la cadena `red_blue_cube_pick_up_left_right_arm`.

El entrenamiento se realizó con LeRobot 0.6.0 durante 50.000 pasos, batch size 4, optimizador AdamW, learning rate 1e-05 y semilla 1000, sobre 34 episodios teleoperados (19.421 fotogramas a 30 FPS). No se documenta el número total de tokens ni composición del dataset más allá de la tarea, ni se indica si hubo aumento de datos, RLHF o DPO (no aplica en este paradigma). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal; el modelo sigue la implementación estándar de ACT en LeRobot.

## Capacidades

- Control visomotor bimanual: genera comandos de 14 dimensiones para dos brazos a partir de tres vistas de cámara.
- Aprendizaje por imitación: reproduce la política demostrada en teleoperación para la tarea de recogida de cubos rojo y azul.
- Predicción por chunks de acción: emite secuencias cortas de acciones, lo que mejora la estabilidad frente a políticas paso a paso.
- Condicionamiento por tarea: acepta una cadena de tarea fija (`red_blue_cube_pick_up_left_right_arm`) para seleccionar el comportamiento.
- Integración con LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No se documentan modos especiales (thinking, visión general, audio) más allá del uso robótico descrito.

## Casos de uso

- Demostración de pipeline de imitación con LeRobot: servir como referencia reproducible para validar la instalación, el formateo de datasets y el flujo `lerobot-train` → `lerobot-rollout` en un robot bimanual.
- Recogida de cubos en laboratorio: ejecutar la tarea `red_blue_cube_pick_up_left_right_arm` sobre un robot dual_so102_client con las tres cámaras configuradas, como banco de pruebas de control visomotor.
- Base para fine-tuning en nuevas tareas: reutilizar los pesos como inicialización y reentrenar con un dataset propio de pocos episodios, aprovechando el bajo coste computacional de 51,7 M de parámetros.
- Evaluación de robustez visual: probar la política bajo cambios de iluminación, posiciones de objetos o distracciones para medir la degradación del éxito, dado que no hay evaluación publicada.
- Comparación de métodos de imitación: usar este checkpoint como línea base ACT frente a otros métodos (por ejemplo, diffusion policy) en el mismo robot y dataset.
- Docencia y formación: ilustrar en cursos de robótica el ciclo completo de teleoperación, grabación de episodios y despliegue de una política aprendida con hardware asequible tipo SO-102.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de trials/successes vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors, el modelo ocupa del orden de 0,2 GB, por lo que la VRAM necesaria es muy baja (una GPU consumer de 8 GB es holgada).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; no se requiere A100 ni H100. Para entrenamiento se recomienda al menos una RTX 3060/4060 o superior.
- Cabe en GPU consumer: sí, en cualquier GPU con 4-8 GB de VRAM; también podría ejecutarse en CPU, aunque la latencia de control a 30 FPS sería el factor limitante.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=kinghanse/BlueRed_Cube`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el bucle de control debe sostener 30 FPS según la tasa del dataset, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlueRed_Cube (kinghanse) | ACT / imitación robótica | 51,7 M | no aplica | apache-2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT / imitación robótica | del orden de decenas de millones (no confirmado) | no aplica | apache-2.0 (según repo) | Hugging Face / GitHub |
| Diffusion Policy (referencia) | Imitación robótica basada en difusión | no disponible | no aplica | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset muy pequeño: 34 episodios y 19.421 fotogramas limitan la generalización; cambios de posición, iluminación o distracciones pueden degradar el comportamiento.
- Específico de hardware y tarea: entrenado para `dual_so102_client` con tres cámaras concretas y la tarea `red_blue_cube_pick_up_left_right_arm`; no es transferible sin reentrenamiento.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural, no soporta tool calling ni agentes; la cadena de tarea es fija.
- Riesgo de sobreajuste y alucinación de acciones: al ser imitación, puede producir movimientos fuera de distribución ante estados no vistos.
- Sesgos: dependen del operador que teleoperó los datos (estilo, velocidad, posiciones); no se documenta análisis de sesgo.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; verificar la licencia de LeRobot y del dataset asociado antes de producción.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinghanse/BlueRed_Cube
- Dataset: https://huggingface.co/datasets/kinghanse/Cube_PickUp
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kinghanse/Cube_PickUp
