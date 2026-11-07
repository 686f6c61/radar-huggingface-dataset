# hubnemo/so101_smolvla_exp02_fixed_bs16_steps10k_lr5e-4

## Resumen

`hubnemo/so101_smolvla_exp02_fixed_bs16_steps10k_lr5e-4` es un adaptador de politica vision-lenguaje-accion (VLA) obtenido por fine-tuning de `lerobot/smolvla_base` mediante la libreria LeRobot. No es un modelo de lenguaje general: es un controlador de robot entrenado para una tarea de manipulacion concreta sobre el robot `so101_follower`, equipado con una unica camara frontal. El modelo recibe el estado articular (6 dimensiones) y una imagen RGB de 480x640, y emite un vector de accion de 6 dimensiones.

SmolVLA, la arquitectura subyacente descrita en el paper arXiv:2506.01844, es un VLA compacto disenado para ejecutarse en hardware de consumo manteniendo un rendimiento competitivo frente a modelos VLA de mayor tamano. Este checkpoint concreto es un experimento de ajuste fino (experimento 02) con batch size 16, 10 000 pasos y learning rate 1e-4, entrenado sobre el dataset `Orellius/so101_sort_cubes_no_top`, que contiene 77 episodios y 54 777 frames a 30 FPS.

Su relevancia es acotada y practica: sirve como referencia reproducible de un pipeline de imitation learning end-to-end con LeRobot sobre un robot de bajo coste, y como punto de partida para quien quiera replicar o comparar recetas de entrenamiento en tareas de pick-and-place con distractores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), implementada en LeRobot |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en texto; el entrenamiento se realizo con una unica instruccion en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.front` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

Configuracion de entrenamiento:

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 10 000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |
| Robot | `so101_follower` |
| Camaras | `front` |

## Arquitectura y entrenamiento

El modelo es un adaptador (relacion `base_model_relation: adapter`) sobre `lerobot/smolvla_base`. SmolVLA combina un codificador visual y un codificador de lenguaje con un decodificador de acciones que produce comandos motores de 6 grados de libertad a partir de la observacion multimodal. La model card no detalla la composicion interna de capas, el numero de parametros ni la estrategia exacta de fusion vision-lenguaje; esos datos deben consultarse en el paper arXiv:2506.01844.

El entrenamiento es de imitacion supervisada (behavior cloning) sobre el dataset `Orellius/so101_sort_cubes_no_top`: 77 episodios, 54 777 frames a 30 FPS, con la instruccion "Grab the purple cube and put it into the cardboard box, ignore the other objects". Se realizaron 10 000 pasos con AdamW, batch 16 y lr 1e-4, semilla 1000. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de refinamiento por preferencias, algo esperable en un pipeline de imitation learning robotico. Tampoco se especifica el numero de tokens ni la composicion del corpus de preentrenamiento del modelo base.

## Capacidades

- Control robotico visuomotor: genera acciones de 6 dimensiones para el robot `so101_follower` a partir de una imagen frontal y del estado articular.
- Ejecucion de una tarea de pick-and-place: coger un cubo morado e introducirlo en una caja de carton, ignorando otros objetos presentes en la escena.
- Seguimiento de instrucciones en lenguaje natural: la tarea se pasa como cadena de texto en el comando `lerobot-rollout`, aunque el entrenamiento solo cubre una instruccion concreta en ingles.
- Percepcion visual con una unica camara a 640x480 y 30 FPS.
- Despliegue en hardware de consumo, segun la descripcion del modelo base SmolVLA.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo de pensamiento; no es un modelo de proposito general.

## Casos de uso

- Replicacion de experimentos de imitation learning: sirve como checkpoint de referencia para comparar recetas de entrenamiento (batch size, pasos, learning rate) sobre el mismo dataset y robot, gracias a que la configuracion esta completamente documentada.
- Clasificacion de cubos con distractores: el modelo esta entrenado especificamente para seleccionar el cubo morado entre otros objetos, lo que lo hace util como banco de pruebas de robustez frente a distractores visuales en tareas de picking.
- Automatizacion de laboratorio docente: con un SO-101 y una camara USB se puede montar una demo funcional de VLA en entornos educativos con hardware de bajo coste.
- Base para fine-tuning en tareas propias: al ser un adaptador sobre `lerobot/smolvla_base` y licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio de pocos centenares de episodios.
- Evaluacion de pipelines LeRobot: util para validar la cadena completa de `lerobot-rollout`, calibracion de camaras y mapeo de observaciones antes de invertir en datasets mayores.
- Prototipado de pick-and-place industrial ligero: como prueba de concepto de manipulacion guiada por vision en celdas con objetos de color conocido y posiciones acotadas.
- Referencia para comparativas de VLA pequenos: permite contrastar el rendimiento de SmolVLA frente a otros adaptadores publicados para el mismo robot, como `Temmp1e/so101_smolVLA` o `davychens/so101-smolvla-model`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, ni de metricas de perdida, ni de comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un VLA compacto disenado para hardware de consumo, se espera que quepa en GPUs de gama media, pero no se proporciona una cifra concreta.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda` sin especificar modelo de GPU.
- GPU de consumo: SmolVLA se describe como desplegable en hardware de consumo; no se detalla que tarjetas concretas son suficientes.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles. La tarea se ejecuta a 30 FPS en el dataset, pero no se publica la frecuencia de inferencia alcanzable ni el tiempo por paso.

## Comparativa con modelos similares

| Modelo | Base | Robot | Dataset | Licencia | Estado |
|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_exp02_fixed_bs16_steps10k_lr5e-4` | `lerobot/smolvla_base` | `so101_follower` | `Orellius/so101_sort_cubes_no_top` (77 episodios) | Apache 2.0 | Publicado, sin evaluacion |
| `Temmp1e/so101_smolVLA` | SmolVLA | SO-101 | no disponible | no disponible | Publicado |
| `davychens/so101-smolvla-model` | SmolVLA | SO-101 | no disponible | no disponible | Publicado |
| `lerobot/smolvla_base` | SmolVLA | generico | preentrenamiento del paper | Apache 2.0 | Modelo base oficial |

No se dispone de datos de rendimiento comparables entre estos checkpoints; la comparativa se limita a procedencia, robot objetivo y licencia.

## Limitaciones y advertencias

- Especificidad de tarea: el modelo solo ha sido entrenado para una instruccion concreta ("Grab the purple cube and put it into the cardboard box, ignore the other objects"); fuera de ese objetivo su comportamiento no esta garantizado.
- Dependencia del hardware: asume el robot `so101_follower` con una camara llamada `front` a 640x480 y 30 FPS; cambios de camara, montaje o calibracion pueden degradar el rendimiento.
- Ausencia de evaluacion: no hay tasas de exito publicadas, por lo que no se puede afirmar que la politica funcione de forma fiable en robot real.
- Riesgo de sobreajuste: 77 episodios y 10 000 pasos con batch 16 es un regimen propenso a memorizar posiciones y condiciones de iluminacion del dataset; la generalizacion a nuevas posiciones de objetos es incierta.
- Sin datos sobre sesgos: al no ser un modelo de lenguaje general, no aplican sesgos sociales tipicos, pero si sesgos de dataset (colores, fondos, disposicion de objetos).
- Idiomas: la instruccion de entrenamiento esta en ingles; no hay evidencia de que el modelo responda a instrucciones en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset deben verificarse por separado antes de un despliegue en produccion.
- Repositorio vacio: el tamano del repo figura como 0.0 GB en la informacion disponible, lo que sugiere que los pesos podrian no estar subidos o no ser accesibles; conviene verificar la descarga antes de integrarlo en un pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_exp02_fixed_bs16_steps10k_lr5e-4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Checkpoint alternativo: https://huggingface.co/Temmp1e/so101_smolVLA
- Checkpoint alternativo: https://huggingface.co/davychens/so101-smolvla-model
