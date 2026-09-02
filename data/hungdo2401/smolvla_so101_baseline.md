# hungdo2401/smolvla_so101_baseline

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto desarrollado por Hugging Face, disenado para control robotico por aprendizaje por imitacion. Este checkpoint concreto, `hungdo2401/smolvla_so101_baseline`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 50 episodios para la tarea de recoger una lata y colocarla en una papelera, ejecutada en un brazo robotico SO-101 simulado en MuJoCo. El modelo procesa multiples vistas de camara, el estado sensoriomotor del robot y una instruccion en lenguaje natural para generar acciones de 6 grados de libertad.

Su relevancia radica en que SmolVLA demuestra que es posible obtener un rendimiento competitivo en control robotico con una fraccion de los parametros de modelos VLA mas grandes (450 millones frente a los miles de millones de modelos como OpenVLA), lo que permite su despliegue en hardware de consumo. Este checkpoint en particular sirve como ejemplo de fine-tuning rapido y economico para tareas de manipulacion especificas, con una licencia Apache 2.0 que facilita su uso comercial y academico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de control robotico, no de texto generativo) |
| Tipos de cuantizacion | safetensors (sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo transformer multimodal que combina un codificador de vision (que procesa multiples vistas de camara), un codificador de lenguaje para la instruccion textual y un experto de accion que genera los comandos motores. El modelo toma como entrada tres imagenes de camara de 256x256 píxeles, una imagen adicional de 480x640 (etiquetada como `empty_camera_0`), el estado del robot (vector de 6 dimensiones) y la instruccion en lenguaje natural, y produce un vector de accion de 6 dimensiones.

Este checkpoint se ha obtenido mediante fine-tuning del modelo base `lerobot/smolvla_base` utilizando el framework LeRobot (version 0.6.2). El entrenamiento se realizo sobre el dataset `hungdo2401/so101_baseline`, que contiene 50 episodios y 37.095 frames a 20 FPS, con la tarea unica "pick up the can and place it in the bin". La configuracion de entrenamiento fue de 4000 pasos con batch size 8, optimizador AdamW, learning rate 0.0001 y seed 1000. No se menciona el uso de tecnicas como RLHF o DPO; se trata de un entrenamiento supervisado de imitacion.

## Capacidades

- Control robotico de manipulacion: genera acciones continuas de 6 grados de libertad para un brazo robotico SO-101.
- Percepcion multimodal: procesa simultaneamente hasta cuatro entradas visuales (tres camaras de 256x256 y una de 480x640) junto con el estado propioceptivo del robot.
- Instrucciones en lenguaje natural: la tarea se especifica textualmente ("pick up the can and place it in the bin"), lo que permite condicionar el comportamiento del modelo.
- Aprendizaje por imitacion: entrenado mediante demostraciones, sin necesidad de ingenieria de recompensas ni aprendizaje por refuerzo.
- Fine-tuning eficiente: al partir de un modelo base preentrenado, puede adaptarse a nuevas tareas con pocos episodios (50 en este caso) y en pocos miles de pasos.
- No es un modelo de generacion de texto o chat; su unica salida es el vector de accion.

## Casos de uso

- Automatizacion de tareas pick-and-place en entornos simulados: el modelo puede integrarse en pipelines de robotica simulada (MuJoCo) para validar politicas de control antes de transferirlas a hardware real.
- Prototipado rapido de politicas robotica: con 50 episodios y 4000 pasos de entrenamiento, sirve como punto de partida para experimentar con nuevas tareas de manipulacion sin necesidad de grandes recursos computacionales.
- Investigacion en modelos vision-language-action: este checkpoint puede utilizarse como referencia o baseline en estudios comparativos de arquitecturas VLA compactas, dado su tamano reducido y licencia permisiva.
- Ensenanza y formacion en robotica: al ejecutarse en hardware de consumo y con la integracion con LeRobot, es adecuado para cursos universitarios o bootcamps de robotica con aprendizaje por imitacion.
- Desarrollo de sistemas de manipulacion con instrucciones en lenguaje natural: el modelo demuestra como condicionar politicas de control mediante texto, util para interfaces humano-robot.
- Evaluacion de estrategias de aumento de datos y generalizacion: al estar entrenado con un dataset pequeno, puede usarse para estudiar el impacto de variaciones en la iluminacion, posicion de objetos o distractores en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. No se dispone de datos de tasa de exito en el robot real o simulado, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parametros en precision FP32, el modelo ocupa aproximadamente 1,8 GB en memoria. Con cuantizacion a FP16 o BF16, se reduce a unos 0,9 GB. Sin embargo, el proceso de inferencia incluye el procesamiento de multiples imagenes, por lo que la VRAM total necesaria puede superar los 4 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) deberia ser suficiente para inferencia. El entrenamiento completo (4000 pasos) se puede realizar en una GPU de 24 GB como la RTX 3090 o RTX 4090, segun las experiencias documentadas en la comunidad.
- El blog de ggando.com menciona que ACT (arquitectura alternativa) sufria OOM con batch_size 64 en 24 GB VRAM, mientras que SmolVLA no presentaba ese problema, lo que sugiere que SmolVLA es mas eficiente en memoria.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece los comandos `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. Tambien puede cargarse directamente con la libreria `transformers` de Hugging Face.
- Latencia y throughput: no hay datos publicados especificos para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Entrenamiento | Licencia | Uso |
|---|---|---|---|---|---|
| hungdo2401/smolvla_so101_baseline | 450M | VLA | 50 episodios, 4000 pasos | Apache-2.0 | SO-101 pick-and-place |
| lerobot/smolvla_base | 450M | VLA | Preentrenamiento general | Apache-2.0 | Base para fine-tuning |
| ACT (Action Chunking with Transformers) | variable | Transformer de acciones | Depende del dataset | MIT | Control robotico por imitacion |

La comparativa con ACT se basa en las observaciones del blog de ggando.com: ACT requiere el doble de pasos de entrenamiento para igualar a SmolVLA y presenta problemas de memoria con imagenes grandes, mientras que SmolVLA maneja mejor el resize de imagenes y es mas eficiente en VRAM. No hay datos de rendimiento en tareas reales comparables entre ambos.

## Limitaciones y advertencias

- El modelo ha sido entrenado con solo 50 episodios y una unica tarea; su capacidad de generalizacion a otras tareas, objetos o disposiciones del entorno es muy limitada.
- No se han publicado resultados de evaluacion en robot real ni en simulacion; se desconoce la tasa de exito real de la politica.
- El dataset de entrenamiento es propio del autor y puede contener sesgos de captura (iluminacion, angulos de camara, posiciones de objetos) que afecten al rendimiento fuera de esas condiciones.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo depende de LeRobot y de los pesos base de `lerobot/smolvla_base`, que deben verificarse por separado.
- No es un modelo de proposito general: no genera texto, no responde preguntas ni realiza razonamiento; su unica funcion es producir acciones motoras para el robot SO-101 en MuJoCo.
- Las fechas de creacion y actualizacion del repositorio (septiembre de 2026) son posteriores a la fecha actual del documento, lo que sugiere que el modelo es muy reciente y puede carecer de validacion externa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hungdo2401/smolvla_so101_baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/hungdo2401/so101_baseline
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Blog de fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
- Repositorio de ejemplo SmolVLA en SO-101 (GitHub): https://github.com/RajatDandekar/SmolVLA_MRL2Bootcamp
