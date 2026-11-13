# hubnemo/so101_smolvla_exp14_exp5_naction10

## Resumen

`hubnemo/so101_smolvla_exp14_exp5_naction10` es un checkpoint de política robótica (vision-language-action, VLA) obtenido por ajuste fino del modelo base `lerobot/smolvla_base`, publicado por el usuario hubnemo en Hugging Face. No se trata de un modelo de lenguaje generalista, sino de un adaptador de imitación entrenado para controlar un brazo robótico de tipo `so101_follower` equipado con una cámara frontal, resolviendo una tarea concreta de manipulación: coger un cubo morado e introducirlo en una caja de cartón ignorando el resto de objetos.

El modelo se apoya en SmolVLA, una arquitectura VLA compacta presentada en el artículo arXiv 2506.01844, diseñada para lograr un rendimiento competitivo en control robótico con un coste computacional reducido y desplegable en hardware de consumo. El checkpoint se distribuye en formato `safetensors` dentro del ecosistema LeRobot, con licencia Apache 2.0, y su relevancia radica en que ejemplifica el flujo de trabajo de ajuste fino de políticas VLA sobre datasets de demostración de tamaño reducido (77 episodios, 54 777 fotogramas a 30 FPS).

El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y fue creado el 13 de noviembre de 2026. Se trata, por tanto, de un experimento de investigación reproducible más que de un artefacto con validación comunitaria. No se han publicado resultados de evaluación en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en el paper arXiv 2506.01844) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de relacion | adapter (ajuste fino) |
| Robot objetivo | so101_follower |
| Camaras | front |
| Entrada `observation.state` | STATE, shape (6,) |
| Entrada `observation.images.front` | VISUAL, shape (3, 480, 640) |
| Salida `action` | ACTION, shape (6,) |
| Libreria | lerobot |
| Version de LeRobot | 0.7.1 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `lerobot/smolvla_base`, que implementa la arquitectura SmolVLA descrita en el artículo arXiv 2506.01844. SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual y un backbone de lenguaje con un cabezal de acciones, orientado a generar comandos motores de baja dimensión a partir de observaciones visuales y del estado propioceptivo del robot. En este checkpoint concreto, la entrada es una imagen RGB de 480×640 píxeles junto con un vector de estado de 6 dimensiones, y la salida es un vector de acción de 6 dimensiones, correspondiente al espacio de control del brazo `so101_follower`.

El entrenamiento se realizó mediante imitación supervisada sobre el dataset `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54 777 fotogramas grabados a 30 FPS. La tarea única es "Grab the purple cube and put it into the cardboard box, ignore the other objects". La configuración de entrenamiento reportada es de 15 000 pasos, batch size de 16, optimizador AdamW, tasa de aprendizaje 0.0001 y semilla 1000. No se especifica en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO, algo por otra parte poco habitual en políticas de imitación robótica.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so101_follower` a partir de una imagen frontal y del estado del robot.
- Ejecución de una tarea específica de pick-and-place: coger un cubo morado y depositarlo en una caja de cartón, ignorando otros objetos presentes en la escena.
- Percepción visual integrada: procesa imágenes RGB de 480×640 píxeles a 30 FPS mediante el codificador visual del modelo VLA.
- Condicionamiento por instrucción en lenguaje natural: la política acepta una descripción textual de la tarea, tal como se observa en el comando `lerobot-rollout` con el parámetro `--task`.
- Despliegue sobre hardware de consumo: según la model card, SmolVLA está diseñado para ejecutarse en hardware asequible.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede controlar un brazo `so101_follower` para recoger un cubo morado y colocarlo en una caja, usando la cámara frontal como única fuente visual, lo que lo hace adecuado para bancos de pruebas de manipulación de bajo coste.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar cómo afecta el número de episodios (77 en este caso) y de pasos de entrenamiento (15 000) al éxito en tareas de manipulación.
- Ajuste fino sobre nuevos datasets con LeRobot: al ser un adaptador de `lerobot/smolvla_base`, puede reentrenarse con `lerobot-train` sobre datasets propios, lo que facilita experimentos comparativos con la misma receta de entrenamiento.
- Docencia y formación en robótica: el flujo completo de grabación de datos, entrenamiento y despliegue con LeRobot permite ilustrar un pipeline de VLA de extremo a extremo en cursos prácticos.
- Evaluación de robustez ante distractores: la tarea exige explícitamente ignorar otros objetos, por lo que el checkpoint es útil para medir la capacidad de discriminación visual de la política en escenas con distractores.
- Prototipado de control visual para brazos de bajo coste: el modelo se ejecuta con `lerobot-rollout` sobre el robot `so101_follower` y una cámara OpenCV, lo que permite validar rápidamente una política antes de invertir en hardware más caro.
- Reproducción de experimentos: dado que se documentan semilla, hiperparámetros y versión de LeRobot (0.7.1), el checkpoint sirve como referencia para replicar resultados en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita de que no se han proporcionado resultados para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de un modelo VLA compacto (SmolVLA), la model card del método base indica que está pensado para hardware de consumo, pero no se especifican cifras concretas para este checkpoint.
- GPU recomendadas: no disponible. No se detallan modelos de GPU concretos en la información proporcionada.
- Compatibilidad con GPU de consumo: la model card del método base afirma que SmolVLA puede desplegarse en hardware de consumo; no se confirma para este checkpoint específico.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--policy.path=hubnemo/so101_smolvla_exp14_exp5_naction10`, robot `so101_follower`, cámaras OpenCV a 640×480 y 30 FPS, y duración configurable con `--duration`. El entrenamiento se realiza con `lerobot-train`.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 30 FPS, pero no se reporta la frecuencia de inferencia ni el tiempo por paso de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hubnemo/so101_smolvla_exp14_exp5_naction10 | no disponible | no aplica (política de control) | Pick-and-place de cubo morado en caja | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible | no aplica (política de control) | Base VLA general para ajuste fino | no disponible en la información | Hugging Face (modelo base) |
| Otras políticas LeRobot | no disponible | no aplica | Manipulación robótica | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card indica explícitamente que no se han proporcionado resultados de evaluación, por lo que se desconoce la tasa de éxito real de la política.
- Tarea única y altamente específica: el modelo está entrenado exclusivamente para "coger el cubo morado e introducirlo en la caja de cartón, ignorando otros objetos"; no generaliza a otras tareas sin reentrenamiento.
- Dataset reducido: 77 episodios y 54 777 fotogramas constituyen un conjunto pequeño, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y disposición concretas del entorno de grabación.
- Dependencia de la cámara frontal: solo se entrena con `observation.images.front`; cambios de cámara, encuadre o iluminación pueden degradar el rendimiento.
- Dependencia del robot `so101_follower`: el espacio de acción de 6 dimensiones y el estado de 6 dimensiones están ligados a esa morfología; no es trasladable directamente a otros robots.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual aplicado a un entorno físico, puede heredar sesgos de los datos de demostración (posiciones, colores, objetos presentes).
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones plausibles pero incorrectas en estados fuera de distribución, con riesgo de colisiones o fallos de agarre.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin validación por parte de la comunidad.
- Idiomas: no aplica; el condicionamiento textual de la tarea está en inglés y no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_exp14_exp5_naction10
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
