# seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step2000

## Resumen

OpenWAM-Alpha RoboDojo es un modelo de mundo y accion (world-action model) para robotica, desarrollado por el autor de Hugging Face seungkukim como un post-entrenamiento del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo. El modelo predice acciones de manipulacion robotica en simulacion y se distribuye dentro del ecosistema OpenWAM, una iniciativa abierta y modular para el preentrenamiento sistematico de modelos world-action descrita en el preprint arXiv:2609.07398. Resuelve el problema de generar politicas de control para tareas concretas de manipulacion a partir de rollouts simulados de alta calidad.

Este checkpoint concreto se ha afinado sobre un dataset de 72 episodios (24 por tarea) de tres tareas del benchmark RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` y `general_pickup`. Los episodios se han filtrado para conservar solo ejecuciones limpias (exito del benchmark y de todos los sub-objetivos al primer intento) y con restricciones de movimiento (limites de velocidad y jerk tomados de las demostraciones expertas de RoboDojo). El entrenamiento se realizo en 4 GPU H200 con un learning rate de 1e-4 y parada en el step 2000 de un maximo de 5000.

La relevancia del modelo radica en que es un drop-in replacement del modelo base: misma estructura de directorios, mismos nombres de tensores y mismos ficheros auxiliares, solo cambian los pesos. Esto permite evaluar el efecto del post-entrenamiento con datos filtrados por movimiento sin modificar el pipeline de despliegue. El repositorio ocupa 24,8 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo world-action del ecosistema OpenWAM; el base usa un video backbone Wan2.2-TI2V-5B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_*.safetensors`) |
| Tamano del repositorio | 24,8 GB |
| Modelo base | OpenWAM/OpenWAM-Alpha-Sim-RoboDojo |
| Libreria | openwam |
| Pipeline | robotics |
| Tareas entrenadas | `play_tic_tac_toe`, `pour_balls_into_vase`, `general_pickup` |
| Dataset de post-entrenamiento | 72 episodios (24 por tarea), 29.736 frames, RoboDojo HDF5, simulacion arx_x5 |
| Hardware de entrenamiento | 4x H200 |
| Batch global | 64 (16 x grad_accum 1 x 4 GPU) |
| Learning rate | 1e-4, scheduler cosine con `lr_min_ratio` 0.01 |
| Steps | 2000 de un maximo de 5000 |
| Precisión de entrenamiento | bf16, ZeRO stage 2 |
| Normalizacion | min-max, `normalization_stats.npy` reutilizado del modelo base (md5 `855296b406a1d16fbc92318564d6152d`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que pertenece a la familia OpenWAM de modelos world-action y de que el backbone de video configurado en `config.yaml` es Wan2.2-TI2V-5B (el usuario debe apuntar `model.video_backbone.model_path` a una copia local de ese modelo). El modelo base se describe en el preprint OpenWAM (arXiv:2609.07398) como una exploracion abierta y modular hacia el preentrenamiento sistematico de modelos world-action, pero la model card de este checkpoint no reproduce los detalles de arquitectura, numero de parametros ni composicion del corpus de preentrenamiento.

El post-entrenamiento parte de OpenWAM/OpenWAM-Alpha-Sim-RoboDojo y modifica solo el dataset y los hiperparametros de optimizacion. Se usan 72 episodios (24 por tarea) con 29.736 frames en formato HDF5 de RoboDojo sobre el robot simulado arx_x5. Los episodios se retienen solo si son limpios (exito del benchmark y de cada sub-objetivo al primer intento) y estan limitados en movimiento: el brazo se mueve dentro de los limites de velocidad y jerk extraidos de las demostraciones expertas de RoboDojo, comprobados durante la grabacion y revalidados por episodio. Respecto al modelo base, se sube `batch_size` de 4 a 16, se reduce `max_steps` de 60.000 a 5.000, se fija `save_steps` en 1.000 y `warmup_ratio` en 0,10 (500 steps) frente a 0,05. Se mantienen ZeRO stage 2, bf16, cosine scheduler y `lr_min_ratio` 0,01. La normalizacion min-max reutiliza el `normalization_stats.npy` del modelo base sin cambios, de modo que la desnormalizacion de acciones en inferencia coincide exactamente con la del entrenamiento.

Este checkpoint forma parte de un barrido de dos learning rates (1e-4 y 5e-5) con dos puntos de guardado (step 2000 y step 5000); el resto de la configuracion es identica entre las cuatro ejecuciones. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de acciones de manipulacion robotica para tareas de simulacion del benchmark RoboDojo.
- Control de brazo robotico en las tareas `play_tic_tac_toe`, `pour_balls_into_vase` y `general_pickup`.
- Modelado world-action: el modelo aprende la dinamica del entorno y la politica de accion de forma conjunta, segun la descripcion de la familia OpenWAM.
- Ejecucion de trayectorias con restricciones cinematicas: el post-entrenamiento usa rollouts limitados en velocidad y jerk, lo que orienta las acciones generadas hacia perfiles de movimiento suaves.
- Integracion como drop-in replacement del modelo base: misma interfaz de carga (`openwam.deploy.model_loader.load_from_checkpoint_dir`) y mismos nombres de tensores.
- Capacidades de lenguaje, vision general, tool calling, agentes multi-paso, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion controlada de post-entrenamiento: comparar este checkpoint (lr 1e-4, step 2000) con las otras tres ejecuciones del barrido (lr1e4/step5000, lr5e5/step2000, lr5e5/step5000) para aislar el efecto del learning rate y del numero de pasos sobre el exito en RoboDojo. Es adecuado porque todas las ejecuciones comparten dataset, normalizacion y configuracion salvo esos dos hiperparametros.
- Investigacion en aprendizaje por imitacion con datos filtrados: usar los 72 episodios limpios y limitados en movimiento como referencia para estudiar si el filtrado por velocidad y jerk mejora la estabilidad de la politica en tareas de vertido y recogida.
- Vertido de bolas en un jarrón (`pour_balls_into_vase`): el modelo puede ejecutar la secuencia de aproximacion, agarre y vertido en simulacion arx_x5, aprovechando que el entrenamiento incluye 24 episodios especificos de esta tarea con movimientos suaves.
- Recogida generica de objetos (`general_pickup`): util como politica base para tareas de pick-and-place en simulacion, con la ventaja de que las acciones respetan limites cinematicos derivados de demostraciones expertas.
- Manipulacion en entornos interactivos tipo juego (`play_tic_tac_toe`): permite estudiar la coordinacion visomotora del modelo en una tarea con estado discreto y feedback visual continuo.
- Base para fine-tuning en nuevos dominios roboticos: al ser un drop-in replacement del modelo base con la misma estructura y normalizacion, se puede partir de estos pesos para adaptar la politica a otras tareas o morfologias sin reescribir el pipeline de carga.
- Benchmarking reproducible en simulacion: el uso de RoboDojo HDF5 y del robot arx_x5 facilita repetir experimentos y comparar checkpoints bajo las mismas condiciones de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de error de accion ni comparaciones numericas con otros modelos; solo describe el criterio de filtrado de datos (exito del benchmark y de todos los sub-objetivos al primer intento) y los hiperparametros de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 24,8 GB en safetensors, pero la model card no indica el numero de parametros ni la precision de los pesos, por lo que no se puede calcular una estimacion fiable.
- GPU recomendadas: no disponible. El entrenamiento se realizo en 4x NVIDIA H200 con bf16 y ZeRO stage 2, lo que da una referencia del orden de magnitud del coste de entrenamiento, no de inferencia.
- Compatibilidad con GPU de consumo: no disponible. No se documenta si el modelo cabe en RTX 4090, RTX 3090 u otras GPU consumer.
- Dependencia adicional: se requiere una copia local de Wan2.2-TI2V-5B y ajustar `model.video_backbone.model_path` en `config.yaml` antes de cargar el modelo.
- Opciones de despliegue: la unica via documentada es la libreria `openwam`, mediante `openwam.deploy.model_loader.load_from_checkpoint_dir`, que selecciona el `checkpoint_step_*.safetensors` de mayor step en el directorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (lr1e4, step2000) | no disponible | no disponible | 3 tareas RoboDojo | Apache 2.0 | Hugging Face, 0 descargas |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | corpus RoboDojo completo | no disponible en la informacion | Hugging Face |
| seungkukim/...-lr1e4-step5000 | no disponible | no disponible | 3 tareas RoboDojo | Apache 2.0 | Hugging Face |
| seungkukim/...-lr5e5-step2000 | no disponible | no disponible | 3 tareas RoboDojo | Apache 2.0 | Hugging Face |

La comparacion mas directa es con el modelo base y con las otras tres ejecuciones del mismo barrido, ya que comparten arquitectura, dataset y normalizacion. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas, ni se han identificado en la informacion proporcionada modelos de otros autores comparables en la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse solo con episodios limpios y limitados en movimiento, la politica puede estar sesgada hacia trayectorias suaves y puede no generalizar a ejecuciones rapidas o con perturbaciones.
- Riesgo de alucinacion: en modelos world-action el riesgo equivalente es generar acciones fisicamente inviables o inconsistentes con el estado observado; la model card no cuantifica este riesgo.
- Ambito limitado: el post-entrenamiento cubre solo tres tareas de RoboDojo (`play_tic_tac_toe`, `pour_balls_into_vase`, `general_pickup`) y el simulador arx_x5; no hay evidencia de transferencia a robot real ni a otras morfologias.
- Tamano de datos reducido: 72 episodios y 29.736 frames son un volumen pequeno, lo que aumenta el riesgo de sobreajuste a las condiciones exactas de recogida.
- Dependencia del modelo base: requiere Wan2.2-TI2V-5B como backbone de video y reutiliza el `normalization_stats.npy` del modelo base; cambiar la normalizacion invalidaria la correspondencia entre entrenamiento e inferencia.
- Rutas placeholder: `config.yaml` contiene rutas del tipo `/path/to/...` que deben sustituirse antes de usar el modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las licencias del modelo base y del backbone Wan2.2-TI2V-5B, no detalladas en esta ficha.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step2000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de rollouts: https://huggingface.co/datasets/seungkukim/robodojo-motion-rollouts-openwam-hdf5-ttt-pour-pickup-24ep
- Checkpoint hermano lr1e4 step5000: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step5000
- Checkpoint hermano lr5e5 step2000: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step2000
- Checkpoint hermano lr5e5 step5000: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000
- Paper OpenWAM: arXiv:2609.07398 (https://arxiv.org/abs/2609.07398)
