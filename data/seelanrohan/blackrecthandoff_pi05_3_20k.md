# seelanrohan/blackRectHandoff_pi05_3_20k

## Resumen

`seelanrohan/blackRectHandoff_pi05_3_20k` es un checkpoint de politica robotica entrenado con LeRobot sobre la base `lerobot/pi05_base` (familia Pi0.5). No es un modelo de lenguaje: es un modelo vision-lenguaje-accion (VLA) que recibe imagenes de camaras y el estado del robot y emite comandos motores en forma de chunks de 50 acciones. La configuracion declara un backbone PaliGemma `gemma_2b` para la parte de vision-lenguaje y un experto de accion `gemma_300m` que genera las acciones mediante un esquema de flow matching con 10 pasos de inferencia.

El entrenamiento es un ajuste fino de 20.000 pasos con batch de 16 sobre cinco datasets de demostracion centrados en una tarea concreta: el traspaso de un objeto rectangular negro entre dos brazos (`black_rectangular_object_two_arm_handoff_1/2/3_384`), complementados con dos conjuntos de correcciones humanas DAgger HIL (`dagger_2_hil_segmented_384`, `dagger_4_hil_segmented_384`). Es, por tanto, una politica especializada en una tarea bimanual, no un modelo generalista.

Su relevancia es de laboratorio: ilustra el flujo de trabajo actual de post-entrenamiento de politicas VLA con LeRobot, incluyendo el uso de DAgger con intervencion humana y de checkpoints intermedios cada 8.000 pasos. El repo pesa 73,5 GB y no tiene descargas ni likes, y la model card no publica evaluacion (el parametro `eval_freq` esta en 0, es decir, no se ejecuto evaluacion periodica durante el entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA); backbone PaliGemma `gemma_2b` + experto de accion `gemma_300m`; generacion de acciones por flow matching con 10 pasos de inferencia |
| Parametros totales | no disponible (la configuracion declara PaliGemma `gemma_2b` y experto de accion `gemma_300m`; no se indica el total agregado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana conversacional; `tokenizer_max_length` = 200 tokens de texto |
| Tipos de cuantizacion | no disponible; los pesos se entrenan y publican en `bfloat16` (safetensors) |
| Idiomas soportados | no disponible (no se declaran idiomas; el uso previsto son instrucciones de tarea y datos de robot) |
| Licencia | no disponible (en la configuracion el campo `license` aparece como `None`) |
| Formato de pesos | safetensors (tag del repo); tamano total del repositorio 73,5 GB |
| Preentrenamiento de partida | `lerobot/pi05_base` |
| Resolucion de imagen | 224 x 224 |
| Dimension de estado / accion | `max_state_dim` = 32, `max_action_dim` = 32 |
| Chunk de acciones | `chunk_size` = 50, `n_action_steps` = 50, `n_obs_steps` = 1 |
| Normalizacion | QUANTILES para estado y accion; IDENTITY para visual |

## Arquitectura y entrenamiento

El modelo sigue el patron de Pi0.5: un backbone vision-lenguaje PaliGemma que codifica las imagenes (224x224) y las instrucciones de texto (hasta 200 tokens), acoplado a un experto de accion de tipo transformer de 300M de parametros. Las acciones no se generan de forma autorregresiva discreta, sino como un chunk continuo de 50 pasos de control producido mediante flow matching, con 10 pasos de inferencia y muestreo temporal configurado con `time_sampling_beta_alpha` = 1.5, `beta` = 1.0, `scale` = 0.999 y `offset` = 0.001. La separacion de joints del gripper (`relative_exclude_joints: ['gripper']`) indica que el modelo produce acciones relativas para el resto de articulaciones.

El entrenamiento consiste en un ajuste fino de 20.000 pasos con batch de 16 sobre `lerobot/pi05_base`, con AdamW (betas 0.9/0.95, eps 1e-8, weight decay 0.01, grad clip 1.0), learning rate 2.5e-5 con `cosine_decay_with_warmup` (1.000 pasos de warmup) decayendo hasta 2.5e-6. Se uso `bfloat16`, `gradient_checkpointing` activado, `torch.compile` en modo `max-autotune` (sin compilar el modelo), sin PEFT, sin congelar el encoder de vision (`freeze_vision_encoder: False`) y entrenando tambien el experto (`train_expert_only: False`). El pipeline de datos aplica aumentos aleatorios de imagen (RandomAffine de +-5 grados y traslacion 0.05, ColorJitter de brillo, contraste, tono y saturacion, y SharpnessJitter), con hasta 3 transformaciones y estadisticas de ImageNet. No se declara uso de RLHF ni DPO; la componente de correccion humana proviene de los datasets DAgger HIL incorporados al conjunto de entrenamiento.

## Capacidades

- Generacion de acciones motoras en chunks de 50 pasos de control a partir de observaciones visuales 224x224 y del estado del robot.
- Ejecucion de una tarea bimanual especifica: traspaso de un objeto rectangular negro entre dos brazos.
- Aprendizaje a partir de correcciones humanas en el bucle (los datasets `dagger_2_hil_segmented_384` y `dagger_4_hil_segmented_384` forman parte del entrenamiento).
- Condicionamiento por instruccion textual, limitado a `tokenizer_max_length` = 200 tokens.
- Manejo de estado y accion de hasta 32 dimensiones, con normalizacion por cuantiles.
- No dispone de soporte declarado de tool calling, function calling ni comportamiento de agente multi-paso.
- No se declaran capacidades de generacion de texto, codigo, matematicas, vision general, audio ni modo de razonamiento explicito.
- No se declaran capacidades multilingues.

## Casos de uso

- Reproduccion de investigacion en manipulacion bimanual: cargar el checkpoint en LeRobot y evaluar el exito del traspaso de objeto en un banco de pruebas real o simulado, comparando contra `lerobot/pi05_base`.
- Estudio de DAgger con intervencion humana: analizar como las dos tandas de correcciones HIL (`dagger_2` y `dagger_4`) modifican la politica frente a un ajuste fino solo con demostraciones de teleoperacion.
- Punto de partida para nuevos ajustes finos: al derivar de `lerobot/pi05_base` y publicarse en safetensors, sirve como inicializacion para variaciones de la misma tarea (posiciones, geometrias de objeto, utillajes).
- Comparacion de checkpoints intermedios: el autor guarda checkpoints cada 8.000 pasos, lo que permite estudiar la evolucion del rendimiento entre los 8k, 16k y 20k pasos.
- Docencia y formacion en VLA: ejemplo completo de configuracion de entrenamiento LeRobot (optimizador, aumentos de imagen, flow matching, compilacion) para explicar el pipeline de post-entrenamiento de politicas.
- Reutilizacion del experto de accion: experimentos de transferencia donde se conserva el experto `gemma_300m` y se cambia el backbone o los datos de condicionamiento.
- Validacion de despliegue en hardware embebido: la familia Pi0.5 cuenta con soporte en Qualcomm AI Hub, por lo que el checkpoint puede usarse como referencia para estudiar despliegue en dispositivos Snapdragon con las herramientas de conversion correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, y `eval_freq` esta configurado a 0, por lo que no se ejecuto evaluacion periodica durante el entrenamiento (la configuracion de evaluacion define 50 episodios con batch de 50, pero no se activo).

## Requisitos de hardware

- Tamano de pesos: el repositorio completo ocupa 73,5 GB, lo que corresponde a varios checkpoints y estados de optimizador; un unico checkpoint en `bfloat16` de la configuracion declarada (backbone `gemma_2b` + experto `gemma_300m`) se situa aproximadamente en el rango de 5 GB.
- VRAM estimada para inferencia: del orden de 8 a 12 GB en `bfloat16` con imagenes de 224x224 y chunk de 50 acciones; es una estimacion derivada de la configuracion, no confirmada por el autor.
- GPU recomendadas: A100 o H100 para reproducir el entrenamiento con batch 16, `bfloat16` y gradient checkpointing; RTX 4090 o RTX 3090 para inferencia y ajustes finos con batch reducido.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) con holgura; en tarjetas de 16 GB es probable que funcione en inferencia, aunque no hay confirmacion del autor.
- Opciones de despliegue: LeRobot (`pip install lerobot`) con el `pretrained_path` apuntando a este repo, PyTorch con safetensors, `torch.compile` en modo `max-autotune` (ya previsto en la configuracion) y, para hardware embebido, Qualcomm AI Hub, que publica soporte para la familia Pi0.5.
- Latencia y throughput: no disponible; cada chunk de 50 acciones requiere 10 pasos de inferencia de flow matching.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros declarados | Contexto / tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `seelanrohan/blackRectHandoff_pi05_3_20k` | VLA especializado en traspaso bimanual | PaliGemma `gemma_2b` + experto `gemma_300m` (total no disponible) | 200 tokens de texto; chunk de 50 acciones | no disponible | Repo publico; 0 descargas y 0 likes |
| `lerobot/pi05_base` | VLA generalista Pi0.5 (modelo base) | no disponible | no disponible | no disponible | Referenciado como `pretrained_path` de este checkpoint |
| Pi0.5 (Qualcomm AI Hub) | VLA generalista coentrenado con demostraciones, datos web y subtareas semanticas | no disponible | no disponible | no disponible | Catalogado en Qualcomm AI Hub y en `qualcomm/ai-hub-models` |
| `seelanrohan/blackRectHandoff_pi05_2` | Ejecucion previa del mismo autor sobre la misma tarea | no disponible | no disponible | no disponible | Repo publico |

La comparacion cuantitativa de rendimiento no es posible: ninguno de los modelos comparables publica tasas de exito ni resultados de benchmark en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada (campo `license` con valor `None`): no puede asumirse permiso de uso comercial ni condiciones de redistribucion. Es necesario contactar con el autor antes de cualquier uso productivo.
- Modelo especializado: esta ajustado para el traspaso de un objeto rectangular negro entre dos brazos; es previsible un rendimiento pobre fuera de esa tarea, esa geometria de objeto o esa configuracion de robot.
- Sin evaluacion publicada: no hay tasas de exito ni comparaciones controladas, y la evaluacion periodica estaba desactivada (`eval_freq` = 0). Cualquier cifra de rendimiento deberia obtenerse por cuenta propia.
- Sin datos de sesgo ni de composicion demografica del dataset: al tratarse de datos de robot, el sesgo relevante es de escena, iluminacion, posicion de camara y utillaje, no de lenguaje.
- Riesgo de sobreajuste a la distribucion de entrenamiento: los aumentos de imagen estan acotados (afines de +-5 grados, jitter moderado), por lo que cambios fuertes de iluminacion, fondo o punto de vista pueden degradar la politica.
- Limitacion de contexto textual: 200 tokens, suficiente para instrucciones cortas de tarea, insuficiente para prompts largos o conversacion.
- Sin soporte declarado de agentes, tool calling ni razonamiento multi-paso; no debe emplearse como sustituto de un LLM.
- El tamano del repositorio (73,5 GB) implica costes de descarga, almacenamiento y, si se cargan varios checkpoints en memoria, presion de VRAM; conviene cargar un unico checkpoint.
- El checkpoint fue subido sin `push_to_hub` activado en la configuracion y con 0 descargas: no ha pasado por una validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seelanrohan/blackRectHandoff_pi05_3_20k
- Perfil del autor (Rohan Seelan): https://huggingface.co/seelanrohan/datasets
- Ejecucion previa del autor sobre la misma tarea: https://huggingface.co/seelanrohan/blackRectHandoff_pi05_2
- Ficha de Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Implementacion de pi05 en Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
- Espejo del repositorio anterior: https://github.com/fork-the-planet/qualcomm___ai-hub-models/tree/main/src/qai_hub_models/models/pi05
- Modelo base referenciado en la configuracion: https://huggingface.co/lerobot/pi05_base
