# hubnemo/so101_smolvla_exp11_exp5_full_proj

## Resumen

`hubnemo/so101_smolvla_exp11_exp5_full_proj` es una política de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base`, que a su vez implementa la arquitectura SmolVLA presentada en el paper arXiv:2506.01844. El modelo está empaquetado en formato LeRobot y se distribuye como un adaptador sobre el modelo base, con licencia Apache 2.0. Su propósito es controlar un brazo robótico de tipo `so101_follower` mediante imitación, recibiendo como entrada el estado articular y una imagen frontal de 480x640 y emitiendo un vector de acción de 6 dimensiones.

El ajuste se ha realizado sobre el dataset `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54.777 fotogramas a 30 FPS, para una única tarea: coger un cubo morado e introducirlo en una caja de cartón ignorando el resto de objetos. El entrenamiento se ejecutó durante 15.000 pasos con batch de 16, optimizador AdamW y tasa de aprendizaje 1e-4, usando LeRobot 0.7.1.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación de un autor individual, sin descargas ni valoraciones, y sin resultados de evaluación publicados. SmolVLA es relevante en el ecosistema porque propone un VLA compacto desplegable en hardware de consumo, pero este artefacto concreto debe tratarse como una política de tarea única, no como un modelo generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA, arXiv:2506.01844); detalles internos de capas y atención no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de control por paso, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea se especifica en inglés mediante prompt de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/smolvla_base` (relación: adapter) |
| Tipo de robot | `so101_follower` |
| Cámaras | `front` |
| Entrada: estado | `observation.state`, shape `(6,)` |
| Entrada: visión | `observation.images.front`, shape `(3, 480, 640)` |
| Salida: acción | `action`, shape `(6,)` |
| Dataset de entrenamiento | `Orellius/so101_sort_cubes_no_top` (77 episodios, 54.777 frames, 30 FPS) |
| Tarea entrenada | "Grab the purple cube and put it into the cardboard box, ignore the other objects" |
| Pasos de entrenamiento | 15.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |
| Tamaño del repo | 0.0 GB (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: un VLA compacto y eficiente orientado a despliegue en hardware de consumo. La información disponible no detalla el número de capas, la dimensión oculta, el codificador visual concreto ni el mecanismo de fusión visión-lenguaje-acción; únicamente se confirma que es un modelo de visión-lenguaje-acción y que se carga a través de la librería LeRobot. La política consume un vector de estado de 6 dimensiones y una imagen RGB de 3x480x640, y produce un vector de acción de 6 dimensiones, lo que corresponde a un espacio de control de 6 grados de libertad del brazo SO-101.

El entrenamiento es de imitación supervisada sobre 77 episodios teleoperados (54.777 fotogramas a 30 FPS) de una única tarea de manipulación. Se ejecutaron 15.000 pasos con batch 16, AdamW y learning rate 1e-4, semilla 1000, sobre LeRobot 0.7.1. No se documenta en la información proporcionada el uso de RLHF, DPO ni de decodificación especulativa; tampoco se especifica el número de tokens de entrenamiento en el sentido de un LLM, ya que el paradigma es de aprendizaje por imitación sobre trayectorias.

## Capacidades

- Control robótico de manipulación de un brazo `so101_follower` con 6 dimensiones de acción a partir de una imagen frontal y el estado articular.
- Ejecución de una tarea concreta de pick-and-place: coger el cubo morado e introducirlo en la caja de cartón, ignorando otros objetos presentes en la escena.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como prompt de texto (`--task="Grab the purple cube and put it into the cardboard box, ignore the other objects"`), lo que sugiere que el modelo acepta una descripción textual de la tarea como parte de la política VLA.
- Política de un solo paso por fotograma a 30 FPS, adecuada para control reactivo en bucle cerrado.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, modo thinking, audio ni otras modalidades distintas de la visión RGB frontal.

## Casos de uso

- Clasificación de cubos en línea de montaje educativa: el modelo ejecuta la secuencia de coger el cubo morado y depositarlo en la caja de cartón sobre un SO-101, aprovechando que fue entrenado exactamente para esa tarea y ese robot, lo que permite validar el pipeline completo de LeRobot en un aula o laboratorio.
- Reproducción de experimentos de imitación con SmolVLA: sirve como checkpoint de referencia para comparar el efecto de distintos hiperparámetros (pasos, learning rate, composición del dataset) frente a `lerobot/smolvla_base`, dado que el autor documenta la configuración exacta de entrenamiento.
- Base para ajuste fino en tareas de pick-and-place con distractores: el dataset de entrenamiento incluye instrucción explícita de ignorar otros objetos, por lo que es un punto de partida razonable para políticas que deban discriminar el objeto diana entre varios.
- Prototipado de control visual con una sola cámara: al requerir únicamente una cámara frontal a 480x640 y 30 FPS, encaja en montajes de bajo coste donde no se dispone de visión multi-cámara ni de sensores de profundidad.
- Docencia de visión-lenguaje-acción: el modelo permite ilustrar el flujo completo `lerobot-rollout` con `--strategy.type=base`, la grabación de episodios y el ajuste fino desde un modelo base, sin necesidad de infraestructura de GPU de gama alta según la premisa de SmolVLA de desplegarse en hardware de consumo.
- Evaluación de robustez ante cambios de iluminación o posición de objetos: al no haber resultados de evaluación publicados, el modelo es útil precisamente como sujeto de pruebas para medir la degradación de una política de imitación ante variaciones del entorno no cubiertas en los 77 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota literal «_No evaluation results have been provided for this policy yet._», por lo que no existen tasas de éxito en robot real ni métricas de ningún tipo para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el número de parámetros del modelo no se especifica.
- GPU recomendadas: no disponible. La premisa de SmolVLA es el despliegue en hardware de consumo, pero este checkpoint no documenta requisitos concretos.
- Compatibilidad con GPU de consumo: no confirmada para este artefacto; la arquitectura base está diseñada para hardware de consumo según la model card, sin especificar modelos.
- Opciones de despliegue: LeRobot 0.7.1 mediante `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento y ajuste fino). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de control robótico.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que fija la frecuencia de operación esperada del bucle de control, pero no se publica latencia de inferencia medida.
- Almacenamiento: el repositorio figura con 0.0 GB en los metadatos de Hugging Face, dato que probablemente refleja un redondeo y no el tamaño real de los pesos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_exp11_exp5_full_proj` | VLA (SmolVLA) ajustado para SO-101 | no disponible | no aplica | Apache 2.0 | Hugging Face, 0 descargas, 0 likes | Tarea única, sin evaluación publicada |
| `lerobot/smolvla_base` | VLA (SmolVLA) base | no disponible | no aplica | no disponible en la información proporcionada | Hugging Face (modelo base citado) | Punto de partida del ajuste; requiere ajuste fino para tareas concretas |
| Políticas de imitación tipo ACT / Diffusion Policy en LeRobot | Políticas de imitación | no disponible | no aplica | no disponible | Ecosistema LeRobot | Alternativas habituales en LeRobot; no se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada, por lo que la comparación se limita a aspectos de licencia, disponibilidad y naturaleza del artefacto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre 77 episodios de un único montaje, la política hereda los sesgos de posición, iluminación, fondo y apariencia de los objetos presentes en ese dataset.
- Riesgo de sobreajuste a la escena: la tarea se limita a un cubo morado y una caja de cartón concretos; cambios de color, forma, posición inicial o fondo pueden degradar el comportamiento sin que existan métricas publicadas que cuantifiquen esa degradación.
- Ausencia total de evaluación: no hay tasas de éxito en robot real, ni número de ensayos, ni condiciones de prueba documentadas. No debe asumirse ningún nivel de fiabilidad en producción.
- Dependencia estricta del hardware: requiere un robot `so101_follower` y una cámara configurada con el nombre de observación `front`; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Limitación de modalidad: solo visión RGB frontal y estado articular de 6 dimensiones; no hay entrada de profundidad, táctil ni multi-cámara.
- Idiomas: no disponible. La instrucción de tarea está en inglés y no se documenta comportamiento multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base y el dataset de origen pueden tener condiciones propias que conviene verificar antes de un despliegue comercial.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-13, sin demo ni vídeo de validación en la model card.
- Advertencia de producción: al ser una política de imitación de tarea única sin evaluación, su uso en entornos reales con personas u objetos frágiles requiere supervisión y protocolos de parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_exp11_exp5_full_proj
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
