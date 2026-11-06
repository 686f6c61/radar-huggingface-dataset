# felsager/pi05_cube2cross_fast_tok

## Resumen

`felsager/pi05_cube2cross_fast_tok` es un checkpoint de política robótica de tipo Vision-Language-Action (VLA) publicado en Hugging Face por el usuario felsager. Se trata de un ajuste fino del modelo base `lerobot/pi05_base`, que implementa π₀.₅ (Pi05), la arquitectura VLA de Physical Intelligence en su versión para LeRobot, adaptada del repositorio OpenPI. El modelo consume observaciones multimodales (estado del robot y dos cámaras) y produce acciones de control de 10 dimensiones.

El checkpoint está especializado en una tarea concreta de manipulación: recoger un cubo de un color determinado (verde, azul, amarillo o rojo) y colocarlo sobre una cruz roja. Se ha entrenado sobre el dataset `felsager/vla_cubes_cross_dr`, con 999 episodios y 510.363 fotogramas a 30 FPS, recogidos con un robot `ur5e_hand_e` equipado con cámaras `top` y `wrist`. Su relevancia es la de un ejemplo reproducible de ajuste fino de π₀.₅ para una tarea de pick-and-place con dominio aleatorizado.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un tamaño de repositorio de 27 GB. La model card menciona la extensión FineART-VLA (con cabecera de lenguaje para predicción de subtareas), pero el checkpoint concreto se presenta como un ajuste fino estándar de π₀.₅ sobre LeRobot, sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, con experto de acciones por flow matching (System 1) y, según la model card, cabecera de lenguaje para subtareas (System 2) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Cámaras | top, wrist (3×480×640 cada una) |
| Dimensión de estado | 10 |
| Dimensión de acción | 10 |
| Dataset de entrenamiento | felsager/vla_cubes_cross_dr (999 episodios, 510.363 frames, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 4 |
| Optimizador | AdamW |
| Learning rate | 5e-05 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence: un VLM preentrenado que actúa como sistema de percepción y razonamiento, acoplado a un experto de acciones entrenado con flow matching que genera trayectorias de acción continuas. La variante implementada en LeRobot se adapta del repositorio OpenPI. La model card describe además la extensión FineART-VLA, que añade una cabecera de lenguaje entrenada para predecir la siguiente subtarea en lenguaje natural (System 2) y ejecutarla con el experto de acciones (System 1), empleando "knowledge insulation" para proteger el VLM preentrenado durante el ajuste.

El entrenamiento se realizó mediante ajuste fino supervisado (imitation learning) sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 fotogramas a 30 FPS con cuatro instrucciones de tarea (recoger cubo verde, azul, amarillo o rojo y colocarlo sobre la cruz roja). La configuración reportada es de 30.000 pasos, batch size 4, optimizador AdamW con learning rate 5e-05 y semilla 0, usando LeRobot 0.6.2. No se documentan detalles sobre el número total de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de acciones de control robótico de 10 dimensiones a partir de observaciones de estado y dos vistas de cámara.
- Ejecución de tareas de pick-and-place condicionadas por instrucción en lenguaje natural (en inglés): recoger un cubo de color y colocarlo sobre una cruz roja.
- Percepción visual multimodal con dos cámaras simultáneas (`top` y `wrist`) a resolución 640×480.
- Condicionamiento por tarea mediante prompt de texto (`--task="pick up the green cube and place it on the red cross."`).
- Según la model card, planificación de subtareas en lenguaje (System 2) mediante cabecera de lenguaje entrenada, con ejecución por el experto de acciones (System 1).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso genérico fuera del bucle percepción-acción robótico.
- Capacidades multilingües: no disponibles; las instrucciones de entrenamiento están en inglés.

## Casos de uso

- Pick-and-place industrial con UR5e: el modelo puede integrarse en una celda con robot Universal Robots UR5e y pinza Hand-E para tareas de recogida y colocación de piezas sobre posiciones marcadas, usando las cámaras `top` y `wrist` como entrada.
- Clasificación y manipulación por color: las cuatro instrucciones del dataset permiten seleccionar el objeto correcto según su color (verde, azul, amarillo, rojo), útil en líneas de clasificación de piezas.
- Base para ajuste fino en nuevas tareas: al derivar de `lerobot/pi05_base`, sirve como punto de partida para entrenar políticas con `lerobot-train` sobre datasets propios con el mismo formato de observaciones.
- Evaluación de dominio aleatorizado: el dataset `vla_cubes_cross_dr` incluye variaciones (el sufijo `dr` sugiere domain randomization), lo que permite estudiar la robustez de π₀.₅ frente a cambios de posición, iluminación o distractores.
- Prototipado de investigación en VLA: útil para reproducir el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) con un modelo de 4,14 mil millones de parámetros y una tarea acotada.
- Docencia y demostraciones: el comando `lerobot-rollout` permite ejecutar la política en un robot real durante una duración fija (`--duration=60`), lo que facilita demostraciones reproducibles en laboratorio.
- Referencia para pipelines de imitation learning: la configuración de entrenamiento documentada (30.000 pasos, AdamW, lr 5e-05, batch 4) sirve como línea base para comparar hiperparámetros en tareas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4,14 mil millones de parámetros, en precisión completa (fp32) los pesos ocuparían aproximadamente 16,6 GB; en bf16/fp16, unos 8,3 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar que una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100, H100) pueda alojar los pesos en bf16, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos en bf16 sería viable en GPUs de consumo con 16 GB o más, sujeto a los requisitos reales de LeRobot y del pipeline de visión.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para entrenamiento). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El control se ejecuta a la frecuencia del robot y de las cámaras (30 FPS en el dataset), pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_fast_tok | 4.143.404.816 | no disponible | Pick-and-place de cubos sobre cruz (UR5e) | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA base π₀.₅ para ajuste fino | no disponible en la información | Hugging Face (modelo base) |
| felsager/pi05_cube2cross_dr | no disponible en la información | no disponible | Pick-and-place de cubos (variante del mismo autor) | no disponible en la información | Hugging Face |

La información disponible no permite comparar rendimiento numérico entre estos modelos, ya que ninguno publica resultados de evaluación en las fuentes consultadas. La comparativa se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo se ha entrenado para cuatro instrucciones de pick-and-place sobre una cruz roja; no generaliza a otras tareas sin ajuste fino adicional.
- Sin evaluación publicada: no hay tasas de éxito ni resultados en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere un robot `ur5e_hand_e` con cámaras `top` y `wrist` en las posiciones e índices exactos usados en el entrenamiento; cambios de montaje o calibración pueden degradar el rendimiento.
- Sesgos conocidos: no documentados; el dataset procede de un único entorno y configuración de robot, lo que puede introducir sesgos de posición, iluminación y apariencia de objetos.
- Riesgo de alucinación: en el contexto VLA, el equivalente es la generación de acciones inválidas o inseguras ante situaciones fuera de distribución; no se documentan mecanismos de seguridad.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia `gemma`: impone restricciones de uso comercial según los términos de la licencia Gemma; debe revisarse antes de un despliegue productivo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.
- El tamaño del repositorio (27 GB) implica requisitos de almacenamiento y descarga considerables.
- La model card menciona FineART-VLA y "knowledge insulation", pero no queda claro en la información disponible si este checkpoint concreto incorpora la cabecera de lenguaje entrenada o solo el ajuste fino estándar de π₀.₅.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_fast_tok
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Guía FineART-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/fineart_vla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Modelo relacionado del mismo autor: https://huggingface.co/felsager/pi05_cube2cross_dr
- Repositorio OpenPI (implementación de referencia de π₀/π₀.₅): https://gitee.com/fuxey/pi05
