# fanqi-robo/diffusion_insert_gear_in_gripper_lr1x_s1000

## Resumen

`fanqi-robo/diffusion_insert_gear_in_gripper_lr1x_s1000` es una politica robotica basada en modelos de difusion (DDPM) entrenada especificamente para la tarea de manipulacion `insert_gear_in_gripper` sobre un robot bimanual YAM. El modelo consume un estado articular de 14 dimensiones y tres camaras de 720x1280, y produce secuencias de acciones (action chunks) de 14 dimensiones. Lo publica el usuario `fanqi-robo` dentro del ecosistema LeRobot, con el repositorio del conjunto de datos asociado `fanqi-robo/insert_gear_in_gripper`.

Se trata de un modelo pequeno en terminos de parametros (293 millones, 2,3 GB de repositorio) pero entrenado desde cero salvo los codificadores de imagen, sin ningun preentrenamiento especifico de robot. El checkpoint publicado corresponde a la actualizacion 20000 de un entrenamiento de 12,3 horas en una unica NVIDIA H100 de 80 GB. La relevancia de esta ficha es doble: documenta una receta reproducible de entrenamiento de politicas de difusion en LeRobot y sirve como punto de comparacion del benchmark del propio autor frente al checkpoint `best` (menor perdida de validacion, actualizacion 6808).

No se dispone de licencia declarada, idiomas soportados ni informacion sobre cuantizacion. El modelo no es un modelo de lenguaje: no genera texto ni mantiene dialogos, y todas sus capacidades se limitan al control motor de la tarea para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de difusion DDPM (prediccion de ruido) con codificadores de imagen ResNet18 preentrenados en ImageNet, uno por camara |
| Parametros totales | 293.206.638 (safetensors); la model card declara 293.174.382 entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens (no es un modelo de lenguaje); horizonte de accion de 64 pasos, 32 acciones ejecutadas, 2 pasos de observacion |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en precision completa) |
| Idiomas soportados | no disponible (modelo de control robotico, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.5.1 |
| Tarea | `insert_gear_in_gripper` sobre robot bimanual YAM |
| Dimension de estado y accion | 14-D (estado articular y accion) |
| Entradas | tres camaras de 720x1280 (redimensionadas a 576x1024 dentro de los codificadores) |
| Normalizacion | min/max de estado y accion del conjunto de entrenamiento; imagenes con media/desviacion de ImageNet |

## Arquitectura y entrenamiento

La arquitectura es una politica de difusion de tipo DDPM: el modelo aprende a predecir el ruido anadido a una secuencia de acciones, condicionada por el estado articular y por las representaciones visuales de tres camaras. Cada camara se procesa con su propio codificador ResNet18 preentrenado en ImageNet; el resto del modelo se inicializa desde cero, sin ningun preentrenamiento sobre datos de robot (embodiment-specific pretraining: none). La perdida de validacion reportada es el MSE de prediccion de ruido de `policy.forward` en modo evaluacion, calculada como media de 4 muestras de ruido por lote con semilla fija; el autor advierte que, al mantener los codificadores BatchNorm, se usan estadisticas acumuladas y el valor no es comparable entre politicas distintas.

El entrenamiento uso 50 episodios y 27.228 fotogramas del dataset `fanqi-robo/insert_gear_in_gripper` (revision `acdc9ac8`), con validacion sobre 5 episodios retenidos y 2.245 fotogramas de `villekuosmanen/insert_gear_in_gripper_val` (revision `7c4d62f3`). El optimizador fue Adam con un schedule coseno de diffusers, 500 actualizaciones de warmup y decaimiento hasta cero en la ultima actualizacion, con `optimizer_lr=0.0001`, 20000 actualizaciones a lote efectivo 32 (32 x 1, una GPU) y semilla 1000. No se aplico aumentacion de imagenes. El entrenamiento consumio 12,3 GPU-horas en una H100 de 80 GB, con un pico de VRAM de 71,1 GB (lote 32 con todo el modelo entrenable y estados de Adam). No se documenta en la informacion disponible ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, RLHF o DPO no aplican ni se mencionan).

## Capacidades

- Generacion de secuencias de acciones de 14 dimensiones para control bimanual del robot YAM en la tarea `insert_gear_in_gripper`.
- Ejecucion por chunks de accion: horizonte de prediccion de 64 pasos con 32 acciones ejecutadas por inferencia.
- Percepcion visual multimodal: procesa tres camaras de 720x1280 de forma simultanea mediante codificadores independientes.
- Condicionamiento por estado: consume el estado articular de 14 dimensiones y las dos observaciones previas.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso simbolico ni planificacion explicita; el comportamiento multi-paso emerge de la politica de difusion y del encadenamiento de chunks.
- Capacidades multilingues: no aplica.
- No dispone de modo de razonamiento (thinking), vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Automatizacion de ensamblaje industrial: el modelo ejecuta la insercion de una pieza tipo engranaje en una pinza sobre un robot bimanual, una tarea de contacto con tolerancias ajustadas donde una politica aprendida puede sustituir a la programacion manual de trayectorias.
- Investigacion en imitacion de politicas de difusion: sirve como referencia reproducible al publicarse junto con el dataset, la configuracion de entrenamiento, el registro de W&B y las curvas de perdida, lo que permite replicar o variar la receta.
- Benchmark de checkpoints: el autor lo usa como punto de comparacion frente al checkpoint `best`; es util para estudiar el compromiso entre perdida de validacion y error de accion en bucle abierto.
- Evaluacion offline de politicas: la tabla de error MAE sobre episodios retenidos permite medir el efecto del numero de actualizaciones sin necesidad de acceso al hardware robotico.
- Transferencia a tareas similares de insercion: al carecer de preentrenamiento especifico de robot, es un punto de partida claro para estudiar cuanta generalizacion aporta un reentrenamiento con otro dataset de la misma familia de tareas.
- Docencia y prototipado en robotica: con 293 millones de parametros y 2,3 GB de repositorio, es manejable para laboratorios que quieran experimentar con LeRobot y politicas de difusion sin infraestructura de gran escala para inferencia.
- Analisis de robustez ante cambios de camara o calibracion: el modelo depende de tres vistas fijas de 720x1280, por lo que es util para estudiar la sensibilidad a variaciones de montaje en entornos controlados.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados son la evaluacion offline en bucle abierto sobre `villekuosmanen/insert_gear_in_gripper_val` (423 consultas, un fotograma de cada 5), en unidades articulares del dataset. La referencia `hold` (mantener la pose actual) obtiene MAE@30 de 2,60. Se reproduce una seleccion de la tabla completa:

| Actualizacion | MAE@10 | MAE@30 | k=1 | k=30 | arm | grip rec | grip dt |
|---|---|---|---|---|---|---|---|
| 851 | 21,22 | 25,09 +/- 4,07 | 20,14 | 29,41 | 0,87 | 0,41 | 5,6 |
| 6808 (mejor validacion) | 2,41 | 3,63 +/- 0,43 | 1,93 | 5,34 | 0,96 | 0,56 | 3,7 |
| 10212 | 1,95 | 2,64 +/- 0,25 | 1,62 | 3,62 | 0,96 | 0,48 | 4,0 |
| 15318 | 1,55 | 2,11 +/- 0,26 | 1,23 | 2,84 | 0,98 | 0,59 | 4,9 |
| 20000 (checkpoint publicado) | 1,51 | 2,16 +/- 0,38 | 1,16 | 3,02 | 0,97 | 0,62 | 4,5 |
| `hold` (referencia) | no disponible | 2,60 | no disponible | no disponible | no disponible | no disponible | no disponible |

Metricas adicionales del entrenamiento: perdida de validacion final 0,0339572 en la actualizacion 20000 y mejor valor 0,0149422 en la actualizacion 6808; perdida de entrenamiento en la ultima ventana 0,0038125; latencia de inferencia medida de 272,8 ms. El autor no detalla el significado exacto de las columnas `arm`, `grip rec` y `grip dt`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark de lenguaje, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM de entrenamiento: medida y reportada por el autor, 71,1 GB de pico en una NVIDIA H100 de 80 GB HBM3 con lote efectivo 32 y todo el modelo entrenable.
- VRAM de inferencia: no disponible como medida. Estimacion aritmetica a partir del numero de parametros (no verificada): en fp32 los 293 millones de parametros ocupan aproximadamente 1,2 GB y en fp16/bf16 aproximadamente 0,6 GB, a lo que hay que sumar activaciones de los tres codificadores ResNet18 sobre entradas de 576x1024 y el buffer de acciones; el pico real dependera del backend y no se documenta.
- GPU recomendadas: para entrenamiento, H100 80 GB segun la configuracion publicada. Para inferencia no hay datos publicados; por tamano de parametros, una GPU consumer con 8-16 GB de VRAM deberia ser suficiente en teoria, aunque no esta validado en la informacion disponible.
- Despliegue: integracion con LeRobot 0.5.1. No se documentan opciones de servido tipo vLLM, TGI, llama.cpp u Ollama, que no aplican a una politica de difusion.
- Latencia: 272,8 ms por inferencia, medida por el autor (no se especifica el hardware de medida).
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras politicas en la informacion proporcionada. La model card unicamente compara este checkpoint con el checkpoint `best` del mismo entrenamiento (actualizacion 6808), no con modelos externos. El nombre del repositorio (`lr1x_s1000`) sugiere la existencia de otras variantes de la misma familia con distinta tasa de aprendizaje o semilla, pero no hay informacion sobre ellas en los datos disponibles, por lo que la comparativa se marca como no disponible.

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre permisos de uso comercial, modificacion o redistribucion. En ausencia de licencia explicita, no debe asumirse uso comercial libre.
- Modelo de unica tarea: entrenado exclusivamente para `insert_gear_in_gripper` sobre robot bimanual YAM. No es un modelo de proposito general ni transferible sin reentrenamiento.
- Especificidad de embodiment: no hubo preentrenamiento especifico de robot, por lo que el modelo depende por completo de las 50 trayectorias de entrenamiento; cualquier cambio de robot, cinematica o utilaje invalida la politica.
- Dependencia de la configuracion de camaras: requiere tres vistas de 720x1280 en la disposicion del dataset original. Variaciones de calibracion, iluminacion o montaje no se han evaluado.
- Riesgo de error acumulado: en bucle abierto el error MAE crece con el horizonte (1,51 a MAE@10 frente a 2,16 a MAE@30 en el checkpoint final), lo que anticipa deriva y fallos compuestos en ejecucion real encadenada.
- Sobreajuste relativo: la mejor perdida de validacion es la de la actualizacion 6808 (0,0149422), casi la mitad que la final (0,0339572) pese a que el error de accion en bucle abierto mejora hasta la actualizacion 20000; la eleccion de checkpoint debe hacerse segun la metrica que interese.
- Sesgos: no se documenta ningun analisis de sesgo, demografico ni de dominio. El dataset procede de un unico entorno de recogida, por lo que el modelo hereda sus sesgos de posicion, iluminacion y objetos.
- Idiomas y alucinacion linguistica: no aplican, al no ser un modelo de lenguaje.
- Cifras de parametros discrepantes: el archivo safetensors reporta 293.206.638 parametros y la model card 293.174.382; la diferencia no se explica en la documentacion.
- Trazabilidad: las fechas de creacion y actualizacion del repositorio (2026-10-10) son las registradas por HuggingFace; no se dispone de mas contexto sobre el estado del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/diffusion_insert_gear_in_gripper_lr1x_s1000
- Dataset de entrenamiento: https://huggingface.co/datasets/fanqi-robo/insert_gear_in_gripper
- Dataset de validacion: https://huggingface.co/datasets/villekuosmanen/insert_gear_in_gripper_val
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/fanqi-robo-saferobotics/insert_gear_in_gripper_benchmark/runs/r4urrden
- Libreria LeRobot: https://github.com/huggingface/lerobot
