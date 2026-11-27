# hubnemo/so101_smolvla_lora_v2_04_qv_only_fullheads_r32_bs16_25k

## Resumen

`so101_smolvla_lora_v2_04_qv_only_fullheads_r32_bs16_25k` es un adaptador LoRA sobre el modelo vision-language-action (VLA) SmolVLA, desarrollado por el usuario `hubnemo` y publicado en Hugging Face. Se trata de una política de robótica entrenada mediante aprendizaje por imitación para el robot `so101_follower`, cuyo objetivo es ejecutar la tarea de recoger un cubo morado e introducirlo en una caja de cartón, ignorando el resto de objetos de la escena.

El modelo hereda la arquitectura compacta de SmolVLA, presentada en el paper arXiv:2506.01844, un VLA eficiente diseñado para desplegarse en hardware de consumo. En este caso concreto, el autor ha aplicado un ajuste fino con LoRA (rango 32, batch size 16, 25.000 pasos) sobre el modelo base `lerobot/smolvla_base`, empleando el dataset `Orellius/so101_sort_cubes_no_top` compuesto por 77 episodios y 54.777 frames a 30 FPS.

La relevancia de esta ficha radica en que ejemplifica el flujo de trabajo de ajuste fino de políticas robóticas con LeRobot: un adaptador ligero y de licencia Apache 2.0 que puede ejecutarse sobre un robot SO-101 de bajo coste. No obstante, el repositorio no incluye resultados de evaluación en robot real ni métricas de éxito, por lo que su rendimiento efectivo no está validado públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; adaptador LoRA sobre `lerobot/smolvla_base` |
| Parametros totales | no disponible (el repositorio reporta 0.0 GB; solo se publican los pesos del adaptador LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acción robótica, no a generación de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so101_follower` |
| Cámaras de entrada | `front` (una cámara) |
| Entrada de estado | `observation.state` con shape `(6,)` |
| Salida de acción | `action` con shape `(6,)` |
| Resolución de imagen | 480x640 (3 canales) |
| Dataset de entrenamiento | `Orellius/so101_sort_cubes_no_top` (77 episodios, 54.777 frames, 30 FPS) |
| Pasos de entrenamiento | 25.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 0,0005 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rango 32, según el nombre del repositorio) aplicado sobre SmolVLA, un VLA compacto que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para mapear observaciones multimodales (imagen frontal y estado del robot de 6 dimensiones) a comandos de acción de 6 dimensiones. SmolVLA está diseñado explícitamente para reducir el coste computacional y permitir el despliegue en hardware de consumo, según se describe en el paper arXiv:2506.01844.

El entrenamiento se realizó con LeRobot 0.7.1 mediante aprendizaje por imitación supervisado sobre el dataset `Orellius/so101_sort_cubes_no_top`, que contiene 77 episodios y 54.777 frames grabados a 30 FPS para la tarea "Grab the purple cube and put it into the cardboard box, ignore the other objects". Se emplearon 25.000 pasos con batch size 16, optimizador AdamW y learning rate 0,0005. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, ni la composición detallada del dataset más allá de los episodios y frames indicados. El sufijo del nombre (`qv_only_fullheads`) sugiere una configuración LoRA aplicada a las proyecciones query/value y a los cabezales completos, aunque el autor no lo detalla explícitamente.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para el robot `so101_follower` a partir de una imagen frontal y del estado del robot.
- Percepción visual: procesa imágenes de 480x640 píxeles de una cámara frontal para localizar objetos en la escena.
- Ejecución de tareas de manipulación: entrenado específicamente para la tarea de recoger un cubo morado e introducirlo en una caja de cartón, ignorando el resto de objetos.
- Seguimiento de instrucciones en lenguaje natural: acepta una descripción textual de la tarea mediante el parámetro `--task` en el flujo de LeRobot.
- Despliegue en hardware de consumo: al estar basado en SmolVLA, está pensado para ejecutarse en equipos de gama de consumo.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general, matemáticas, generación de código ni procesamiento de audio.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede ejecutar la secuencia de recoger un cubo morado y depositarlo en una caja, sirviendo como base para experimentos de manipulación con el robot SO-101 en entornos controlados.
- Investigación en aprendizaje por imitación: al ser un adaptador LoRA sobre SmolVLA, permite estudiar el efecto del ajuste fino ligero sobre un VLA base sin necesidad de reentrenar el modelo completo, comparando configuraciones de rango y pasos.
- Prototipado rápido de políticas robóticas: con 25.000 pasos y batch size 16, el coste de entrenamiento es acotado, lo que facilita iterar sobre datasets pequeños (77 episodios) antes de escalar a producción.
- Docencia y formación en robótica: el flujo completo de LeRobot (grabación, entrenamiento, rollout) con un robot de bajo coste como el SO-101 permite montar prácticas reproducibles con licencia Apache 2.0.
- Evaluación de robustez ante distractores: la tarea incluye explícitamente "ignore the other objects", por lo que puede emplearse para medir la capacidad del modelo de discriminar el objeto objetivo en escenas con objetos adicionales.
- Despliegue en hardware de consumo: al heredar la eficiencia de SmolVLA, puede ejecutarse en estaciones de trabajo con GPU de gama media para demostraciones y validaciones en robot real.
- Base para ajuste fino posterior: el adaptador puede servir como punto de partida para nuevas tareas con el mismo robot y cámara, reutilizando la infraestructura de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio reporta un tamaño de 0.0 GB, correspondiente únicamente a los pesos del adaptador LoRA; la VRAM real depende del modelo base `lerobot/smolvla_base` y de la precisión de carga, datos no especificados.
- GPU recomendadas: no disponible en la información proporcionada. SmolVLA se describe como desplegable en hardware de consumo, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: probable según la premisa de SmolVLA, pero no confirmada con datos concretos para este adaptador.
- Opciones de despliegue: LeRobot 0.7.1 mediante el comando `lerobot-rollout` con `--policy.path=hubnemo/so101_smolvla_lora_v2_04_qv_only_fullheads_r32_bs16_25k`. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. La ejecución está limitada por la frecuencia de la cámara (30 FPS) y por el bucle de control del robot, pero no se publican cifras de latencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_lora_v2_04_qv_only_fullheads_r32_bs16_25k` | Adaptador LoRA sobre SmolVLA para SO-101 | no disponible (solo adaptador) | no disponible | Apache 2.0 | No |
| `lerobot/smolvla_base` | VLA base SmolVLA | no disponible | no disponible | no disponible en la información | Paper arXiv:2506.01844 |
| Otras políticas LeRobot para SO-101 | Políticas de imitación (ACT, Diffusion Policy, etc.) | no disponible | no disponible | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Ausencia de evaluación: el autor no ha publicado tasas de éxito ni resultados en robot real, por lo que el rendimiento efectivo es desconocido.
- Especificidad de la tarea: el modelo está entrenado únicamente para "Grab the purple cube and put it into the cardboard box, ignore the other objects"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: requiere el robot `so101_follower` y una cámara frontal con la configuración exacta de observaciones (`observation.state` de shape `(6,)` e imagen `front` de 480x640); cambios en la cámara o en la morfología del robot invalidan la política.
- Dataset pequeño: 77 episodios y 54.777 frames son un volumen reducido, lo que puede limitar la robustez ante variaciones de iluminación, posiciones de objetos o distractores no vistos.
- Sesgos conocidos: no documentados, pero al ser un modelo entrenado con un dataset concreto de un único entorno, hereda los sesgos de distribución de dichos datos (posiciones, colores y objetos específicos).
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones erráticas o inseguras cuando la escena se aleja de la distribución de entrenamiento.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea se proporciona en inglés en los ejemplos.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `lerobot/smolvla_base` y del dataset de entrenamiento antes de un despliegue en producción.
- Caveat de producción: al ser un adaptador LoRA, requiere cargar el modelo base; el repositorio no incluye los pesos completos, y el tamaño reportado (0.0 GB) refleja solo el adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_lora_v2_04_qv_only_fullheads_r32_bs16_25k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
