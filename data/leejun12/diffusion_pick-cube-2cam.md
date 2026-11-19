# LeeJun12/diffusion_pick-cube-2cam

## Resumen

`LeeJun12/diffusion_pick-cube-2cam` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub mediante LeRobot. El modelo resuelve una tarea de manipulación concreta —coger un cubo y depositarlo en una caja— a partir de dos cámaras (muñeca y cenital) y del estado propioceptivo del robot. Lo desarrolla el usuario LeeJun12 y se distribuye con licencia Apache 2.0. No es un modelo de lenguaje: es una política de imitación para robótica, por lo que sus entradas son imágenes y estado articular, y su salida es una trayectoria de acciones de 6 dimensiones.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducido sobre un robot `so_follower` (familia SO-100/SO-101 de LeRobot) con un dataset propio de 50 episodios y 15 000 fotogramas a 30 FPS. No hay resultados de evaluación publicados ni métricas de éxito, de modo que debe considerarse un punto de partida reproducible más que un componente listo para producción.

El modelo tiene 277 840 110 parámetros (dato real de los safetensors) y un repositorio de 1,1 GB. Diffusion Policy trata el control visuomotor como un proceso generativo: en lugar de predecir una acción única, genera una secuencia de acciones multimodal y suave, lo que mejora el desempeño en tareas con contacto rico como el agarre de objetos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor; backbone no especificado en la model card) |
| Parametros totales | 277 840 110 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política, no documentada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje, solo la instrucción de tarea como texto fijo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `overhead` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.wrist` | VISUAL, shape `(3, 480, 640)` |
| Entrada `observation.images.overhead` | VISUAL, shape `(3, 480, 640)` |
| Salida `action` | ACTION, shape `(6,)` |
| Dataset de entrenamiento | `LeeJun12/pick-cube-2cam_20261028_193431` (50 episodios, 15 000 fotogramas, 30 FPS) |
| Tarea | "Pick up the cube and put it in the box." |
| Pasos de entrenamiento | 100 000 |
| Batch size | 8 |
| Optimizador | Adam |
| Learning rate | 0.0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.0 |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Diffusion Policy formula el control visuomotor como un problema de generación: la política aprende a denoising una trayectoria de acciones condicionada a la observación (imágenes de las cámaras de muñeca y cenital más el estado de 6 dimensiones). El resultado es una distribución multimodal de acciones que produce trayectorias suaves y consistentes, lo que resulta ventajoso en manipulación con contacto. La model card no detalla el backbone visual ni el número de pasos de difusión empleados, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó con LeRobot 0.6.0 sobre un dataset propio de 50 episodios teleoperados (15 000 fotogramas a 30 FPS) para la tarea de recoger un cubo y meterlo en una caja. Se ejecutaron 100 000 pasos con Adam, batch size 8, learning rate 0,0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni ajuste por refuerzo; se trata de aprendizaje por imitación supervisado. Tampoco se especifica la composición del dataset más allá del número de episodios y la tarea.

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para un robot `so_follower` a partir de dos vistas de cámara y del estado articular.
- Control visuomotor de manipulación con contacto (agarre y colocación de objetos).
- Política de imitación entrenada para una única tarea: "Pick up the cube and put it in the box.".
- Ejecución en bucle mediante `lerobot-rollout` con `--strategy.type=base`, con duración configurable.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general ni audio: las cámaras son entradas de observación del robot, no un módulo de comprensión visual de propósito general.

## Casos de uso

- Reproducción de la tarea de pick-and-place en un robot SO-100/SO-101: ejecutar la política con `lerobot-rollout` sobre el robot `so_follower` para validar el pipeline completo de LeRobot (calibración, cámaras, inferencia) antes de abordar tareas propias.
- Base para aprendizaje por imitación con datos propios: reentrenar con `lerobot-train --policy.type=diffusion` sobre un dataset nuevo manteniendo la configuración de referencia (100 000 pasos, batch 8, lr 1e-4) como línea base comparable.
- Benchmark interno de manipulación con dos cámaras: usar la tarea de cubo y caja como prueba estandarizada para medir tasa de éxito de variantes de política (diffusion frente a ACT o VLA) bajo las mismas condiciones de cámara y robot.
- Docencia y talleres de robótica: al ser un repositorio pequeño (1,1 GB) y con licencia permisiva, sirve para ilustrar el flujo completo de LeRobot desde la grabación de datos hasta el despliegue en hardware real.
- Estudio de robustez de Diffusion Policy en contacto rico: evaluar cómo varía el éxito al cambiar posiciones del cubo, iluminación o presencia de distractores, aprovechando que la política genera trayectorias multimodales.
- Punto de partida para comparativas de eficiencia de datos: con solo 50 episodios y 15 000 fotogramas, permite estudiar cuántos datos de demostración son necesarios para una tarea de manipulación simple con dos vistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni número de ensayos, ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Con 277,8 M de parámetros, los pesos en FP32 ocupan aproximadamente 1,1 GB (coincide con el tamaño del repositorio); en FP16 rondarían 0,56 GB, sin contar activaciones ni buffers de difusión.
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento de referencia usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA con CUDA.
- ¿Cabe en GPU de consumo? Por tamaño de pesos sí sería viable en tarjetas con 4-8 GB de VRAM, pero el dato no está confirmado por el autor y debe verificarse empíricamente.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política debe ejecutarse a la frecuencia de control del robot; el dataset se grabó a 30 FPS, pero no se publica la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LeeJun12/diffusion_pick-cube-2cam` | 277,8 M | 2 imagenes 480x640 + estado (6,) | Pick-and-place de cubo en caja | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (paper original, 2303.04137) | no disponible | no disponible | Metodo general de control visuomotor | no disponible | Paper y codigo de referencia |
| Politicas ACT de LeRobot | no disponible | no disponible | Imitacion visuomotora (alternativa a diffusion) | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no puede afirmarse que la política funcione de forma fiable.
- Especialización extrema: entrenada para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Dataset pequeño: 50 episodios y 15 000 fotogramas son una base limitada; es probable sobreajuste a posiciones, iluminación y disposición concretas de las cámaras.
- Dependencia de la configuración de cámaras: los nombres y la resolución (`wrist`, `overhead`, 480x640) deben coincidir exactamente con los de entrenamiento; cualquier cambio invalida la política.
- Riesgo de alucinación en sentido amplio: como política generativa, puede producir trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, sin señal de incertidumbre documentada.
- Sesgos: no documentados; al derivarse de demostraciones humanas, heredará los sesgos de posicionamiento y estilo de agarre del operador.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo en producción.
- Sin soporte de lenguaje natural: la instrucción de tarea es una cadena fija; no hay comprensión de órdenes variables.
- Fecha de creación del repositorio (2026-11-19) y cero descargas/likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeJun12/diffusion_pick-cube-2cam
- Dataset de entrenamiento: https://huggingface.co/datasets/LeeJun12/pick-cube-2cam_20261028_193431
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=LeeJun12/pick-cube-2cam_20261028_193431
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
