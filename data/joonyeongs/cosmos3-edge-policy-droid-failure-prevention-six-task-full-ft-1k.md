# joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID failure-prevention six-task es un ajuste fino (fine-tuning) completo del modelo de politica robotica `nvidia/Cosmos3-Edge-Policy-DROID`, desarrollado por el usuario de Hugging Face `joonyeongs`. El modelo parte de la base de NVIDIA y se especializa en seis tareas del entorno RoboLab orientadas a la prevencion de fallos, entrenado sobre el dataset `joonyeongs/cosmos3-edge-failure-prevention-200`. Concretamente, cubre las tareas Toy, Canned Food, Red Items, Cartons, Bottles y Stack, con 25 demostraciones exitosas por tarea (150 episodios en total y 92.009 inicios elegibles).

La relevancia de esta publicacion es doble. Por un lado, demuestra un flujo reproducible de ajuste fino de un modelo de politica vision-lenguaje-accion (VLA) sobre hardware asequible: dos A100 de 80 GB durante 6,7 horas. Por otro, documenta con detalle el proceso (receta, hiperparametros, convencion del gripper, comprobacion de exportacion) y expone explicitamente que la evaluacion en bucle cerrado de RoboLab aun no se ha realizado, lo que lo convierte en un artefacto de investigacion mas que en un modelo listo para produccion.

El checkpoint conserva la arquitectura y el layout del modelo base: un generador de difusion con un tower de comprension congelado, pesos en `safetensors` y 3.859.003.312 parametros totales. Solo difieren del modelo base los tensores del generador (`transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`). La licencia es OpenMDW-1.1, heredada del modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de politica VLA basada en difusion (Cosmos3 Omni); generador de difusion con tower de comprension congelado |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por instruccion de tarea, 15 fps) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (instrucciones de tarea en ingles en los ejemplos) |
| Licencia | OpenMDW-1.1 (`openmdw1.1-license`) |
| Formato de pesos | safetensors (layout del checkpoint base, dividido en 2 shards) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del lado del generador de `nvidia/Cosmos3-Edge-Policy-DROID` (revision `0110e64ca982589f1a3d856cbdd7d465dccb79bc`). Se entrenan todos los pesos del generador: atencion, MLP y normas del generador, los proyectores `vae2llm` y `llm2vae`, el time embedder, y los limites de accion DROID y el embedding de modalidad. El tower de comprension y `k_norm_und_for_gen` permanecen congelados, de modo que las claves y valores de texto se cachean. La inferencia descarga ademas el VAE de Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`), igual que el modelo base.

El entrenamiento se realizo sobre 6 tareas del dataset `joonyeongs/cosmos3-edge-failure-prevention-200` (revision `3fb6ca0`), con 25 episodios por tarea y 32 frames/acciones futuras por inicio, lo que suma 92.009 inicios elegibles. Se dieron 1.000 pasos (checkpoint `iter_000001000`), aproximadamente 0,70 pasadas sobre los inicios elegibles, con batch global de 64 (2 GPUs x 32), LR de 2e-5 con warmup lineal de 50 pasos y decaimiento lineal hasta 0, FusedAdam, BF16, FSDP a 2 vias, checkpointing selectivo de activaciones y `torch.compile`. El entrenamiento consumio 2x A100-80GB durante 6,7 horas. Las tareas `ToolsPickingDrillTask` y `SpoonsInPotTask` se excluyeron asignandoles rangos de inicio vacios. La receta coincide con la del checkpoint de 2k pasos salvo en el numero de pasos y el warmup.

## Capacidades

- Generacion de politicas de accion robotica: predice chunks de 32 pasos de posiciones articulares conjuntas a partir de observaciones visuales e instrucciones de tarea.
- Condicionamiento por instruccion en lenguaje natural (por ejemplo, "Put the canned food in the grey bin").
- Control de brazo robotico DROID en el dominio `droid_lerobot` con condicionamiento a 15 fps.
- Prevencion de fallos: el ajuste se orienta a demostraciones exitosas que evitan errores en las seis tareas cubiertas.
- Servido como servidor de politica para evaluacion en RoboLab mediante `cosmos_framework.scripts.action_policy_server_robolab`.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Evaluacion de investigacion en RoboLab: servir el checkpoint con el servidor de politica y medir la tasa de exito en bucle cerrado en las seis tareas entrenadas, una vez que el autor o terceros completen la evaluacion pendiente.
- Manipulacion robotica de objetos cotidianos: colocar comida enlatada, articulos rojos, cartones reciclables, botellas y apilar objetos en el entorno de laboratorio, usando las instrucciones de tarea del dataset.
- Estudio de prevencion de fallos: comparar el comportamiento de este modelo con el base para analizar como el ajuste sobre demostraciones exitosas reduce errores en las tareas objetivo.
- Reproduccion de recetas de ajuste fino VLA: reutilizar la configuracion (`robolab_droid_edge_full.toml`) y el codigo de la rama `robolab-droid-train-edge-privileged-phases` para entrenar variantes sobre otros subconjuntos de tareas.
- Generacion de datos sinteticos de trayectorias: usar los chunks de accion predichos como referencia para aumentar datasets de imitacion en las seis tareas.
- Validacion de pipelines de exportacion: emplear el checkpoint para probar la carga con `RobolabPolicyService` y la comparacion de acciones predichas frente a demostradas (MAE en radianes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de exito en tarea en la informacion disponible. La unica metrica publicada es una comprobacion de exportacion (no una evaluacion de politica) con el servidor de evaluacion de RoboLab sobre el dataset `joonyeongs/cosmos3-edge-harness-privileged-phases-150`:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0.0628 |
| 0 | 154 | Put the canned food in the grey bin | 0.0607 |
| 25 | 0 | Put the lizard away in the bin | 0.0973 |
| 25 | 139 | Put the lizard away in the bin | 0.0521 |
| 50 | 0 | Put all the red things in the grey bin | 0.1224 |
| 50 | 326 | Put all the red things in the grey bin | 0.1098 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0.1377 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0.0542 |
| | | **Media** | **0.0871** |

Todas las salidas fueron finitas. El autor indica explicitamente que esto no mide el exito en tarea y que la evaluacion en bucle cerrado de RoboLab no se ha realizado.

## Requisitos de hardware

- Entrenamiento: 2x A100-80GB, 6,7 horas, con BF16, FSDP a 2 vias y checkpointing selectivo de activaciones.
- Inferencia: el autor no publica requisitos de VRAM. Con 3.859 millones de parametros en BF16, los pesos ocupan aproximadamente 7,7 GB; a esto se suma el VAE de Wan2.2 que se descarga en inferencia.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar ejecucion en GPUs de 24 GB o mas, pero no esta confirmado por el autor.
- Despliegue: servidor de politica `cosmos_framework.scripts.action_policy_server_robolab` (libreria `cosmos`). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (six-task full-ft-1k) | 3.859.003.312 | no disponible | OpenMDW-1.1 | 1.000 pasos, 6 tareas, sin evaluacion en bucle cerrado |
| `joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-2k` | no disponible | no disponible | OpenMDW-1.1 (heredada) | Misma receta con 2.000 pasos; sin datos de rendimiento publicados |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | no disponible | no disponible | OpenMDW-1.1 | Modelo de politica DROID original de NVIDIA; sin ajuste especifico de prevencion de fallos |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el exito en tarea en bucle cerrado de RoboLab; la unica metrica publicada es un MAE de exportacion (0,0871 rad de media), que no mide si el robot completa las tareas.
- Convencion del gripper: el dataset en revision `3fb6ca0` almacena el gripper invertido respecto al lector DROID; es obligatorio servir el checkpoint con `--no-flip-gripper`. Usarlo sin esa opcion produce acciones incorrectas.
- Cobertura limitada a seis tareas; `ToolsPickingDrillTask` y `SpoonsInPotTask` quedaron excluidas del entrenamiento.
- Entrenamiento corto: 1.000 pasos, aproximadamente 0,70 pasadas sobre los inicios elegibles, lo que puede implicar infraajuste respecto al checkpoint de 2k pasos.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser un modelo de politica, el riesgo se traduce en acciones fisicas incorrectas en el robot.
- Idiomas: no se documenta soporte multilingue; los ejemplos de instruccion estan en ingles.
- Licencia OpenMDW-1.1 heredada del modelo base; deben revisarse sus terminos antes de cualquier uso comercial.
- Dependencia externa: la inferencia descarga el VAE de Wan2.2, lo que anade requisitos de red y almacenamiento.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Checkpoint de 2k pasos: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-2k
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-failure-prevention-200
- Dataset de comprobacion de exportacion: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Codigo de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- VAE de Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
