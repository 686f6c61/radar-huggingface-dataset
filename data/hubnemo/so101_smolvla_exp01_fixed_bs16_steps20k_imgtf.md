# hubnemo/so101_smolvla_exp01_fixed_bs16_steps20k_imgtf

## Resumen

`hubnemo/so101_smolvla_exp01_fixed_bs16_steps20k_imgtf` es un checkpoint de politica vision-lenguaje-accion (VLA) obtenido por ajuste fino de `lerobot/smolvla_base` sobre el dataset `Orellius/so101_sort_cubes_no_top`. Lo desarrolla el usuario de Hugging Face hubnemo y esta pensado para controlar un brazo robotico SO-101 en la tarea concreta de coger un cubo morado e introducirlo en una caja de carton, ignorando el resto de objetos de la escena. No es un modelo de lenguaje general, sino un adaptador de politica entrenado con LeRobot 0.7.1 para imitacion sobre robot real.

El modelo hereda la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: un VLA compacto que combina un codificador visual, un modelo de lenguaje pequeno y un modulo de accion, disenado para ejecutarse en hardware de consumo. El checkpoint se distribuye en formato safetensors, con licencia Apache 2.0 y un unico idioma de interaccion definido por la instruccion de tarea en ingles.

La relevancia de esta ficha es acotada: se trata de un experimento de ajuste fino con 20 000 pasos y batch de 16 sobre solo 77 episodios, sin resultados de evaluacion publicados. Su interes es practico para quien quiera reproducir el pipeline de entrenamiento de SmolVLA en un SO-101 o comparar configuraciones de entrenamiento, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), politica de imitacion sobre `lerobot/smolvla_base` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instruccion de tarea en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | `so101_follower` |
| Camaras | `front` (una sola camara) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.front`, shape `(3, 480, 640)` |
| Salida | `action`, shape `(6,)` |
| Dataset de entrenamiento | `Orellius/so101_sort_cubes_no_top` (77 episodios, 54 777 frames, 30 FPS) |
| Pasos de entrenamiento | 20 000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, la implementacion de SmolVLA en LeRobot. SmolVLA es un VLA compacto que procesa observaciones multimodales (una imagen RGB de 480x640 y un vector de estado de 6 dimensiones correspondiente a las articulaciones del SO-101) junto con una instruccion en lenguaje natural, y emite directamente un vector de accion de 6 dimensiones. La politica se ejecuta a la frecuencia del dataset de entrenamiento, 30 FPS. No se dispone de detalles adicionales sobre el numero de parametros, la composicion exacta del backbone visual o del modelo de lenguaje, ni sobre el contexto maximo, ya que la model card no los incluye.

El entrenamiento es de imitacion supervisada sobre el dataset `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54 777 frames grabados a 30 FPS con una unica camara frontal. La tarea es "Grab the purple cube and put it into the cardboard box, ignore the other objects". Se realizaron 20 000 pasos con batch de 16, AdamW y learning rate 1e-4, semilla 1000, usando LeRobot 0.7.1. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores; es un ajuste por comportamiento puro. El sufijo `imgtf` del nombre del repositorio sugiere una transformacion de imagen aplicada durante el entrenamiento, pero la model card no la describe.

## Capacidades

- Control de robot por imitacion: genera acciones de 6 dimensiones para el brazo SO-101 a partir de una imagen frontal y el estado de las articulaciones.
- Seguimiento de instrucciones de tarea en lenguaje natural: la politica condiciona su comportamiento a la frase de tarea proporcionada en el rollout.
- Manipulacion de objetos especifica: recoger un cubo morado y depositarlo en una caja de carton, ignorando otros objetos presentes en la escena.
- Ejecucion en bucle cerrado a 30 FPS sobre hardware de consumo, segun las caracteristicas de SmolVLA.
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni modos de razonamiento extendido: es una politica de accion, no un modelo conversacional.
- Capacidades multilingues: no disponibles; la unica instruccion documentada esta en ingles.

## Casos de uso

- Replicacion del experimento de entrenamiento: sirve como referencia para reproducir un ajuste fino de SmolVLA sobre el dataset `so101_sort_cubes_no_top` con la misma configuracion (20 000 pasos, batch 16, lr 1e-4) y comparar curvas de aprendizaje.
- Despliegue de demostracion en un SO-101 real: mediante `lerobot-rollout` con `--strategy.type=base`, el modelo ejecuta la tarea de clasificacion de cubos durante un tiempo acotado por `--duration`, util para validar la cadena hardware-software antes de entrenar politicas propias.
- Base para ajuste fino con mas datos: al ser un adaptador sobre `lerobot/smolvla_base`, puede partirse de este checkpoint para entrenar variantes con mas episodios o con objetos adicionales.
- Pruebas de calibracion de camara y robot: dado que la politica espera una unica camara `front` a 480x640 y 30 FPS, es util para verificar la configuracion de OpenCV, el puerto del robot y la correspondencia de nombres de camara con las claves de observacion.
- Comparacion de configuraciones de entrenamiento: el nombre del repositorio codifica batch 16 y 20 000 pasos, lo que permite contrastarlo con otros checkpoints de la comunidad sobre el mismo dataset y aislar el efecto de hiperparametros.
- Docencia y divulgacion en robotica de imitacion: un checkpoint pequeno y con licencia permisiva es adecuado para talleres donde se ensena el ciclo completo de grabacion de datos, entrenamiento y rollout con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion vacia con la nota "No evaluation results have been provided for this policy yet", por lo que no hay tasas de exito en robot real ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. SmolVLA se describe como desplegable en hardware de consumo, pero no se detalla el consumo concreto de este checkpoint.
- GPU recomendadas: no disponibles. Por la naturaleza de SmolVLA, cabria esperar ejecucion en GPUs de consumo, pero no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: probable segun la descripcion generica de SmolVLA, sin cifras verificables en esta ficha.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--policy.path=hubnemo/so101_smolvla_exp01_fixed_bs16_steps20k_imgtf` y `--robot.type=so101_follower`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de accion.
- Latencia y throughput: la politica opera a 30 FPS, la frecuencia del dataset de entrenamiento; no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Episodios | Pasos | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|---|
| hubnemo/so101_smolvla_exp01_fixed_bs16_steps20k_imgtf | smolvla_base | Orellius/so101_sort_cubes_no_top | 77 | 20 000 | Apache 2.0 | No |
| Askel1419/smolvla_so101_100EP | smolvla_base | no disponible | 100 (segun nombre) | no disponible | no disponible | No |
| AndrewNoviello/so101-smolvla | smolvla_base | no disponible | no disponible | no disponible | no disponible | No |

Los tres checkpoints son ajustes de la misma base SmolVLA para el robot SO-101. La comparacion cuantitativa de rendimiento no es posible porque ninguno publica tasas de exito en robot real.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito ni pruebas en robot real, por lo que se desconoce la fiabilidad de la politica.
- Dataset muy pequeno: 77 episodios y una sola tarea restringen la generalizacion a variaciones de posicion, iluminacion, distractores o instancias distintas del cubo.
- Dependencia de una unica camara frontal y de un robot concreto (`so101_follower`): no funcionara con otra morfologia, otro numero de articulaciones o camaras con nombres distintos a `observation.images.front`.
- Instruccion de tarea fija en ingles; no hay evidencia de soporte multilingue ni de generalizacion a otras tareas.
- Riesgo de sobreajuste al entorno de grabacion: al entrenar solo 20 000 pasos sobre 54 777 frames de una unica escena, es esperable un comportamiento fragil fuera de las condiciones del dataset.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Al ser un experimento (`exp01`) sin documentacion de transformaciones de imagen (`imgtf`), la reproducibilidad exacta del entrenamiento no esta garantizada.
- No es un modelo de lenguaje: no debe emplearse para generacion de texto, codigo, razonamiento ni tareas conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_exp01_fixed_bs16_steps20k_imgtf
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Checkpoint comparable Askel1419/smolvla_so101_100EP: https://huggingface.co/Askel1419/smolvla_so101_100EP
- Checkpoint comparable AndrewNoviello/so101-smolvla: https://huggingface.co/AndrewNoviello/so101-smolvla
