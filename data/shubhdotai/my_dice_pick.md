# shubhdotai/my_dice_pick

## Resumen

`shubhdotai/my_dice_pick` es una política robótica de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por Shubham Agarwal (usuario de HuggingFace `shubhdotai`) y entrenada con la librería LeRobot. El modelo está diseñado para controlar un robot manipulador tipo `so_follower` y ejecutar una tarea concreta: recoger un dado y colocarlo dentro de una taza azul. Pertenece a la categoría de políticas de manipulación visual, donde las entradas son imágenes de una cámara frontal y el estado del robot, y la salida son acciones de control de 6 dimensiones.

La arquitectura ACT predice "chunks" de acciones en lugar de pasos individuales, lo que mejora la estabilidad de la ejecución en tareas de manipulación. El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y se distribuye en formato `safetensors`. Fue entrenado sobre un dataset teleoperado de 30 episodios y 14.350 frames a 30 FPS. Aunque es un modelo pequeño y ligero, su utilidad principal es servir como ejemplo y baseline dentro del ecosistema LeRobot, no como un sistema de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), una arquitectura basada en un transformer encoder-decoder con decodificación por chunks de acciones. En lugar de predecir una única acción por paso de tiempo, ACT predice una secuencia corta de acciones a partir de las observaciones actuales. Esta estrategia reduce el error acumulado y mejora la suavidad de la ejecución en robótica de imitación. La entrada al modelo es una imagen RGB de 480x640 de la cámara frontal (`observation.images.front`) combinada con un vector de estado de 6 dimensiones (`observation.state`). La salida es un vector de acción de 6 dimensiones (`action`).

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `shubhdotai/dice_to_blue_mug_300_20260908_164310`, que contiene 30 episodios teleoperados y 14.350 frames a 30 FPS. La tarea se define como "Pick up the dice and place it inside the mug". La configuración de entrenamiento fue de 40.000 pasos, con un tamaño de lote de 4, optimizador AdamW, tasa de aprendizaje de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de alineamiento, ya que se trata de una política de control, no de un modelo de lenguaje.

## Capacidades

- Generación de acciones de control robótico de 6 dimensiones a partir de entradas visuales y de estado.
- Predicción de chunks de acciones, que permite ejecutar secuencias de movimiento coordinadas en lugar de decisiones paso a paso.
- Procesamiento de imágenes RGB de 480x640 procedentes de una única cámara frontal.
- Control de un robot manipulador tipo `so_follower` mediante la integración nativa con LeRobot.
- Ejecución de la tarea específica de pick-and-place: recoger un dado y depositarlo en una taza azul.
- Entrenamiento por imitación a partir de demostraciones teleoperadas, sin necesidad de diseñar recompensas manuales.
- Despliegue mediante el comando `lerobot-rollout` del ecosistema LeRobot.
- Capacidad de ser utilizado como referencia para reentrenar o adaptar la política a tareas similares con fine-tuning.
- No dispone de capacidades de tool calling, generación de lenguaje, razonamiento simbólico ni visión general fuera del contexto robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como política de referencia para estudiar el método ACT dentro del ecosistema LeRobot. Permite comparar variantes de chunking, ensamblado temporal y representaciones visuales en tareas de manipulación.
- Validación de sistemas robóticos de pick-and-place: la tarea de recoger un dado y colocarlo en una taza es un escenario típico en laboratorios para evaluar la precisión y robustez de políticas de manipulación fina.
- Desarrollo de prototipos con robots so_follower: LeRobot ofrece una integración nativa para este tipo de robot, lo que permite cargar la política directamente y probarla en hardware real sin modificaciones sustanciales.
- Benchmark de control visual-motor: el modelo puede utilizarse para investigar cómo afectan cambios de iluminación, oclusión o posición de la cámara al rendimiento de una política entrenada con una única vista frontal.
- Generación de datos para autoentrenamiento: la política puede desplegarse en el robot para recopilar nuevos episodios bajo condiciones ligeramente variadas, ampliando el dataset original y mejorando la robustez mediante iteraciones de aprendizaje.
- Educación y formación en robótica: el repositorio incluye el código y la documentación completa de LeRobot, por lo que sirve como ejemplo práctico del ciclo completo de entrenamiento, exportación y despliegue de una política de imitación en un robot real.
- Prototipado rápido en automatización de almacenes: la política se puede adaptar con fine-tuning para recoger objetos pequeños y colocarlos en contenedores, una tarea repetitiva común en entornos logísticos, aunque el modelo base está restringido a la tarea original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, métricas de precisión ni comparativas numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 207 MB en FP32 (51.668.614 parámetros × 4 bytes). En FP16 sería alrededor de 104 MB. El modelo puede ejecutarse en cualquier GPU con al menos 512 MB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA de la serie RTX 20, 30, 40, o GPUs de datacenter como A100 o H100. También es viable la ejecución en CPU, ya que el modelo es muy pequeño.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en tarjetas como GTX 1650, RTX 3050 o superiores, e incluso en hardware integrado muy limitado.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), scripts Python con la librería `lerobot`, y Docker si se quiere contenerizar el entorno. No es aplicable el uso de vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el pequeño tamaño del modelo, la latencia esperada en GPU sería del orden de milisegundos por iteración, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el momento de la consulta. El repositorio es una política específica para una tarea concreta, y no se han encontrado en la información proporcionada otros modelos de la misma categoría que puedan compararse de forma cuantitativa. Por tanto, no hay datos de comparativa disponibles.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta: recoger un dado y colocarlo en una taza azul. No generaliza a otros objetos, posiciones ni entornos sin un reentrenamiento específico.
- Solo utiliza una cámara frontal de 480x640. Cambios en el punto de vista, iluminación, fondo o presencia de distractores pueden degradar significativamente el rendimiento de la política.
- El dataset de entrenamiento es pequeño (30 episodios, 14.350 frames), lo que aumenta el riesgo de sobreajuste al escenario y a las condiciones específicas de recogida de datos.
- No se han publicado resultados de evaluación, por lo que la robustez del modelo bajo condiciones nuevas no está cuantificada.
- La política requiere un robot manipulador tipo `so_follower` con la configuración exacta de observaciones (estado de 6 dimensiones y cámara frontal). No es portable a otros robots sin adaptar el espacio de acción y observación.
- La licencia Apache 2.0 permite uso comercial, pero no ofrece garantías de seguridad, fiabilidad ni rendimiento. El despliegue en entornos de producción exige una validación exhaustiva previa.
- Al tratarse de un modelo de imitación, hereda los sesgos y errores de las demostraciones teleoperadas. Una mala calidad de los datos de entrenamiento se traduce en comportamientos erráticos o inseguros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shubhdotai/my_dice_pick
- Dataset de entrenamiento: https://huggingface.co/datasets/shubhdotai/dice_to_blue_mug_300_20260908_164310
- Perfil del autor: https://huggingface.co/shubhdotai
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Referencia de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
