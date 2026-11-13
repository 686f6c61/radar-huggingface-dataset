# hubnemo/so101_smolvla_exp07_fixed_bs16_steps15k_cosine_warmup1k

## Resumen

`so101_smolvla_exp07_fixed_bs16_steps15k_cosine_warmup1k` es un adaptador LoRA de SmolVLA (vision-language-action) publicado por el usuario `hubnemo` en Hugging Face. Se trata de un fine-tuning de la política base `lerobot/smolvla_base` para la tarea concreta de manipulación robótica "coger el cubo morado y meterlo en la caja de cartón, ignorando el resto de objetos", sobre un brazo robótico de tipo `so101_follower` con una única cámara frontal.

SmolVLA, referenciado en el paper arXiv:2506.01844, es un modelo compacto y eficiente de visión-lenguaje-acción diseñado para lograr rendimiento competitivo con un coste computacional reducido y desplegable en hardware de consumo. El nombre del repositorio codifica la configuración de entrenamiento: batch size fijo de 16, 15 000 pasos, scheduler coseno y 1 000 pasos de warmup.

Este adaptador es relevante como ejemplo reproducible de un pipeline de imitación con LeRobot: entrena sobre un dataset pequeño (77 episodios, 54 777 frames a 30 FPS) y muestra cómo adaptar una política generalista a una tarea física concreta con recursos limitados. No obstante, no aporta resultados de evaluación en robots reales ni métricas cuantitativas de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; adaptador sobre `lerobot/smolvla_base` |
| Parametros totales | no disponible (no declarado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea se define en inglés como prompt de instrucción) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so101_follower` |
| Camaras | `front`, resolución `(3, 480, 640)` |
| Observación de estado | `observation.state`, shape `(6,)` |
| Acción de salida | `action`, shape `(6,)` |
| Dataset de entrenamiento | `Orellius/so101_sort_cubes_no_top` (77 episodios, 54 777 frames, 30 FPS) |
| Pasos de entrenamiento | 15 000 |
| Batch size | 16 |
| Optimizador | adamw, LR 0.0001 |
| Seed | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

El modelo es un adaptador sobre SmolVLA, un VLA compacto que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para mapear observaciones (imagen frontal y estado articular de 6 dimensiones) a comandos de acción de 6 dimensiones. La model card no detalla la arquitectura interna (número de capas, dimensión del modelo, mecanismo de atención), por lo que esos datos se consideran no disponibles.

El entrenamiento se realizó con LeRobot 0.7.1 mediante imitación supervisada sobre el dataset `Orellius/so101_sort_cubes_no_top`: 77 episodios, 54 777 frames a 30 FPS, para la tarea de recoger un cubo morado e introducirlo en una caja de cartón ignorando el resto de objetos. La configuración fija batch size 16, 15 000 pasos, LR 1e-4 con AdamW, scheduler coseno con 1 000 pasos de warmup y seed 1000. No se indica en la información disponible si hubo RLHF, DPO ni ninguna innovación técnica adicional más allá del propio método SmolVLA.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones a partir de una imagen frontal y el estado articular del brazo `so101_follower`.
- Ejecución de una tarea concreta de picking and placing guiada por instrucción en lenguaje natural ("Grab the purple cube and put it into the cardboard box, ignore the other objects").
- Comprensión visuo-lingüística: integra la instrucción textual con la observación visual para seleccionar el objeto objetivo entre distractores.
- Despliegue en hardware de consumo según la descripción de SmolVLA en la model card.
- Integración con el ecosistema LeRobot mediante `lerobot-rollout` y `lerobot-train`.
- No se declaran capacidades de tool calling, agentes multi-paso, matemáticas, código ni multilingüismo general; el modelo está especializado en la política robótica entrenada.

## Casos de uso

- Clasificación de cubos en línea de montaje: el adaptador ejecuta la política de recogida del cubo morado y depósito en la caja de cartón, ignorando distractores, adecuado para tareas de sorting con objetos de color identificable.
- Prototipado rápido de políticas de imitación: sirve como plantilla para entrenar adaptadores sobre `lerobot/smolvla_base` con datasets pequeños (77 episodios) y un solo comando `lerobot-train`.
- Investigación en manipulación robótica de bajo coste: permite reproducir el pipeline completo (grabación de datos, entrenamiento con LeRobot 0.7.1, rollout) en un brazo SO-101 con una cámara frontal.
- Evaluación de configuraciones de entrenamiento: el nombre del repositorio documenta hiperparámetros (bs16, 15k pasos, coseno, warmup 1k), útil para comparar variantes en experimentos de ablación.
- Demostraciones educativas de VLA: ilustra cómo un modelo visión-lenguaje-acción traduce una instrucción textual y una imagen a acciones articulares de 6 dimensiones.
- Base para fine-tuning adicional en tareas relacionadas: al ser un adaptador Apache-2.0 sobre `smolvla_base`, se puede reentrenar o combinar con otros datasets de manipulación del mismo robot.
- Automatización de tareas pick-and-place en laboratorio: con despliegue mediante `lerobot-rollout` en un `so101_follower` con cámara `front` a 640x480 y 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no se dispone de tasas de éxito en robot real ni métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada (el tamaño del repo figura como 0.0 GB y no se declara el número de parámetros).
- GPU recomendadas: no disponible de forma específica; la model card de SmolVLA indica que puede desplegarse en hardware de consumo.
- Compatibilidad con GPU de consumo: la descripción de SmolVLA afirma que puede ejecutarse en hardware de consumo, pero no se detallan modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: `lerobot-rollout` para ejecución en robot y `lerobot-train` para fine-tuning, ambos del paquete `lerobot` (versión usada en entrenamiento: 0.7.1).
- Latencia y throughput: no disponibles; la captura de datos es a 30 FPS, pero no se declara la frecuencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_exp07_fixed_bs16_steps15k_cosine_warmup1k` | no disponible | no disponible | sin evaluación publicada | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| `lerobot/smolvla_base` (modelo base) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Otras políticas LeRobot del mismo robot (`so101_follower`) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre este adaptador y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación: el autor no ha publicado resultados de éxito en robot real, por lo que su rendimiento efectivo es desconocido.
- Dataset muy pequeño: 77 episodios y una única tarea; es probable un sobreajuste a posiciones, iluminación y objetos concretos del dataset original.
- Tarea restringida: la política solo se ha entrenado para "coger el cubo morado y meterlo en la caja de cartón, ignorando el resto de objetos"; no generaliza a otras instrucciones.
- Configuración de hardware rígida: requiere un robot `so101_follower` y una cámara llamada exactamente `front` con resolución 640x480 y 30 FPS; los nombres de cámara deben coincidir con las claves de observación.
- Riesgo de alucinación/fallo físico: como toda política de imitación, puede fallar ante objetos no vistos, distractores nuevos o cambios de iluminación; no se documenta robustez.
- Idiomas: la instrucción de tarea está en inglés; no se declaran capacidades multilingües.
- Licencia Apache-2.0 permite uso comercial, pero al ser un adaptador sobre `smolvla_base` conviene verificar la licencia y condiciones del modelo base antes de producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_exp07_fixed_bs16_steps15k_cosine_warmup1k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
