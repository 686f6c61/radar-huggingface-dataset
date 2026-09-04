# PID0930/groot-n1d7-openarm-bottle-sort-ckpt20000

## Resumen

El modelo `PID0930/groot-n1d7-openarm-bottle-sort-ckpt20000` es un fine-tuning de `nvidia/GR00T-N1.7-3B` desarrollado por PID0930 para una tarea de manipulacion bimanual en robotica: colocar dos botellas situadas a la izquierda en un cuenco izquierdo y dos botellas situadas a la derecha en un cuenco derecho. Se trata de un modelo de vision-lenguaje-accion (VLA) que parte de un modelo base generalista y lo adapta a un embodiment concreto (OpenArm bimanual) mediante un dataset de 600 episodios y 224.608 frames a 30 fps.

La arquitectura combina un backbone VLM congelado (`nvidia/Cosmos-Reason2-2B`) con un proyector y una cabeza de accion flow-matching DiT entrenables. El modelo tiene 3.144.016.000 parametros totales, aunque el backbone de 2B permanece congelado durante el entrenamiento. La longitud de contexto no se especifica en la informacion disponible. Este checkpoint corresponde al paso 20.000 de un run de 20.000 pasos (2,97 epocas) y presenta una perdida de entrenamiento de 0,0229, pero no se ha medido ninguna metrica de validacion.

La relevancia de este modelo radica en que demuestra como adaptar un VLA de proposito general a una tarea robotica especifica con pocos datos, manteniendo congelado el backbone y entrenando solo el proyector y la cabeza de accion. Es un artefacto de investigacion util para estudiar la transferencia de conocimiento en robotica, aunque su rendimiento real en robot no ha sido evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basado en transformer; backbone VLM congelado + proyector + cabeza de accion flow-matching DiT |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (precision de entrenamiento); no se publican cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas config.json, processor_config.json, statistics.json, embodiment_id.json; incluye optimizer.pt para reanudar entrenamiento) |

## Arquitectura y entrenamiento

El modelo se basa en `nvidia/GR00T-N1.7-3B`, que a su vez utiliza el backbone VLM `nvidia/Cosmos-Reason2-2B`. Durante el fine-tuning, el backbone se mantiene congelado (no se usaron las opciones `--tune-llm` ni `--tune-visual`), y solo se entrenan el proyector y la cabeza de accion flow-matching DiT. La representacion de accion es de 16 dimensiones: brazos en modo `RELATIVE`, manos en modo `ABSOLUTE`, ambos con `NON_EEF`. El horizonte de accion es de 16 pasos a 30 fps, lo que equivale a aproximadamente 0,53 segundos.

El entrenamiento se realizo sobre un dataset de una sola tarea con 600 episodios y 224.608 frames a 30 fps. Se uso un batch size global de 32 en una unica GPU A100 80GB, con optimizador AdamW, learning rate 1e-4, decaimiento coseno, warmup ratio 0,05 y weight decay 1e-5. La precision fue bf16 y el run completo de 20.000 pasos tardo unas 5 horas. No se menciona ningun proceso de RLHF ni DPO; el modelo se entrena exclusivamente mediante supervision de acciones.

El checkpoint incluye el estado completo de entrenamiento con `optimizer.pt`, lo que permite reanudar el entrenamiento. Para la inferencia solo se necesitan los shards safetensors junto con `config.json`, `processor_config.json`, `statistics.json` y `embodiment_id.json`. Es necesario registrar previamente la configuracion de modalidad para el embodiment `NEW_EMBODIMENT` (brazos `RELATIVE`, manos `ABSOLUTE`, horizonte de accion 16) mediante un archivo de configuracion propio.

## Capacidades

- Ejecuta la tarea especifica de clasificacion de botellas: colocar dos botellas de la izquierda en el cuenco izquierdo y dos de la derecha en el cuenco derecho.
- Control bimanual de 16 dimensiones (brazos y manos) con un horizonte de accion de 16 pasos a 30 fps.
- Entrada multimodal compuesta por tres camaras (vista de pecho, vista de muneca izquierda y vista de muneca derecha, 480x640) mas una instruccion de lenguaje.
- Generacion de acciones continuas mediante flow matching, capaz de producir trayectorias suaves para manipulacion.
- Hereda del modelo base la comprension de lenguaje y vision, aunque el backbone esta congelado.
- No soporta tool calling ni function calling: es un policy de robot, no un LLM de proposito general.
- No ofrece soporte de agentes en el sentido de razonamiento multi-paso conversacional; su razonamiento esta limitado a la tarea de manipulacion.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en manipulacion bimanual: el modelo sirve para estudiar como un VLA generalista se adapta a un nuevo embodiment con pocos datos. Se puede ejecutar en bucle abierto sobre episodios held-out para analizar la precision de las trayectorias generadas.
- Evaluacion reproducible con OpenArm: dado que OpenArm ofrece una celula de evaluacion estandarizada, este checkpoint puede utilizarse para comparar el rendimiento de distintas politicas bajo condiciones identicas de iluminacion, camaras y posicion de los brazos.
- Comparacion de checkpoints intermedios: al existir checkpoints en los pasos 5.000, 10.000, 15.000 y 20.000, se puede estudiar la evolucion de la perdida de entrenamiento y seleccionar el mejor punto de parada mediante evaluacion en bucle abierto.
- Reanudacion de entrenamiento: el checkpoint incluye `optimizer.pt`, por lo que se puede continuar el entrenamiento con mas datos o ajustar hiperparametros sin partir de cero.
- Prototipado de tareas de sorting en entornos controlados: el modelo puede servir como base para tareas similares de clasificacion de objetos en una linea de produccion, aunque se requeriria reentrenamiento para nuevas disposiciones.
- Docencia y demostracion del pipeline Isaac-GR00T: es util en cursos de robotica para mostrar el flujo completo de fine-tuning de un VLA, desde la configuracion del embodiment hasta la inferencia.
- Estudio de transferencia de conocimiento: permite analizar que caracteristicas visuales y de lenguaje se conservan del backbone congelado y cuales se adaptan mediante el proyector y la cabeza de accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha medido ninguna metrica de validacion ni tasa de exito real en robot. La siguiente tabla muestra la perdida de entrenamiento de los checkpoints de la misma run, pero no constituye una metrica de rendimiento generalizacion:

| Checkpoint | Perdida de entrenamiento |
|---|---|
| ckpt5000 | 0,0636 |
| ckpt10000 | 0,0440 |
| ckpt15000 | 0,0282 |
| ckpt20000 | 0,0229 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El checkpoint contiene 3.144 millones de parametros; en bf16, los pesos ocupan aproximadamente 6,3 GB. El repositorio completo pesa 25,5 GB porque incluye `optimizer.pt`. No se especifica el peso de los shards de inferencia.
- GPU recomendadas: el entrenamiento se realizo en una unica A100 80GB. Para inferencia no se proporcionan requisitos oficiales.
- Compatibilidad con GPU de consumo: no disponible. Dado el tamano de los pesos en bf16, podria caber en una RTX 4090 de 24GB con cuantizacion, pero no se ofrecen cuantizaciones publicadas.
- Opciones de despliegue: requiere el framework Isaac-GR00T (version N1.7 / `gr00t_n1d7`) y acceso al backbone gated `nvidia/Cosmos-Reason2-2B`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas para LLMs y no para politicas de robot.
- Latencia y throughput: no disponible. El horizonte de accion es de 16 pasos a 30 fps (~0,53 s), pero no se indica la latencia de inferencia ni el throughput.

## Comparativa con modelos similares

La comparativa se limita al modelo base y a los checkpoints de la misma run, ya que no se dispone de datos de otros modelos VLA comparables en la informacion proporcionada.

| Modelo | Parametros | Tarea | Perdida de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/GR00T-N1.7-3B (base) | 3.144.016.000 | Generalista (multi-tarea) | No disponible | Apache 2.0 | HuggingFace (gated) |
| PID0930/groot-n1d7-openarm-bottle-sort-ckpt5000 | 3.144.016.000 | Clasificacion de botellas | 0,0636 | Apache 2.0 | HuggingFace |
| PID0930/groot-n1d7-openarm-bottle-sort-ckpt10000 | 3.144.016.000 | Clasificacion de botellas | 0,0440 | Apache 2.0 | HuggingFace |
| PID0930/groot-n1d7-openarm-bottle-sort-ckpt15000 | 3.144.016.000 | Clasificacion de botellas | 0,0282 | Apache 2.0 | HuggingFace |
| PID0930/groot-n1d7-openarm-bottle-sort-ckpt20000 | 3.144.016.000 | Clasificacion de botellas | 0,0229 | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Entrenado en una sola tarea con un diseno de escena fijo. Los episodios son inusualmente uniformes (357-386 frames, 11,9-12,9 segundos), por lo que la robustez a cambios de disposicion, iluminacion u objetos no ha sido probada.
- No se ha medido ninguna metrica de validacion ni tasa de exito real en robot. El modelo debe tratarse como un artefacto de investigacion.
- El backbone VLM esta congelado, por lo que las caracteristicas visuales no se adaptaron a las camaras especificas de este robot.
- Una perdida de entrenamiento mas baja no establece una mejor generalizacion. Se requiere evaluacion en bucle abierto antes de seleccionar un checkpoint para uso real.
- El acceso al backbone gated `nvidia/Cosmos-Reason2-2B` es necesario para la inferencia, lo que puede limitar su disponibilidad.
- No se especifican los idiomas soportados. La instruccion de la tarea esta en ingles, pero no hay garantia de funcionamiento multilingue.
- El repositorio incluye `optimizer.pt` (25,5 GB), lo que puede complicar el despliegue si no se seleccionan unicamente los archivos necesarios para la inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt20000
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Isaac-GR00T (GitHub): https://github.com/NVIDIA/Isaac-GR00T
- OpenArm: https://openarm.dev/
- Checkpoint 5.000: https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt5000
- Checkpoint 10.000: https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt10000
- Checkpoint 15.000: https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt15000
