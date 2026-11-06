# nebula2wx/smolvla_standard34_ds13

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face como parte del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. La ficha que nos ocupa, `nebula2wx/smolvla_standard34_ds13`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario nebula2wx, orientado a una tarea concreta de manipulación robótica: recoger un bloque (rojo o verde) y depositarlo sobre un plato.

El modelo cuenta con aproximadamente 450 millones de parametros (0,45B) almacenados en formato safetensors, lo que lo situa en la categoria de modelos ligeros capaces de ejecutarse en hardware de consumo. A diferencia de los modelos de lenguaje generativo, este modelo no produce texto libre sino acciones motoras de 6 dimensiones, consumiendo observaciones compuestas por el estado del robot y varias camaras (hasta cuatro flujos visuales, incluida una camara vacia de 480x640).

Su relevancia actual radica en que demuestra el flujo de trabajo de imitation learning sobre LeRobot: partiendo de un modelo base preentrenado, un usuario puede afinarlo con un dataset propio de 50 episodios y desplegarlo con el comando `lerobot-rollout`. Es, por tanto, un ejemplo practico de como llevar la robotica basada en VLA a entornos de investigacion con recursos limitados. El repositorio ocupa 19,8 GB, lo que refleja la presencia de checkpoints intermedios del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA |
| Parametros totales | 450.046.176 (aproximadamente 0,45B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Camaras | head, wrist (y entradas visuales adicionales) |
| Entrada de estado | observation.state de forma (6,) |
| Salida de accion | action de forma (6,) |
| Frecuencia de entrenamiento | 30 FPS |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, un diseno VLA compacto que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones. La politica consume observaciones multimodales: el estado del robot (vector de 6 dimensiones), tres camaras de 256x256 y una camara adicional de 480x640, y produce un vector de accion de 6 dimensiones. El entrenamiento se realizo mediante imitation learning supervisado sobre dos datasets de LeRobot: `Whyynnot/standard_3_4_red_pick_up_20261031_220542` y `Whyynnot/standard_3_4_greed_pick_up_20261031_232848`, que suman 50 episodios y 34.626 frames grabados a 30 FPS.

La configuracion de entrenamiento reportada incluye 200.000 pasos, batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. Las tareas cubiertas son "pick up the red block and put it on the plate" y "pick up the green block and put it on the plate". No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de refinamiento por preferencias; se trata de un fine-tuning puramente de imitacion sobre el modelo base. Tampoco se detalla la composicion exacta del dataset de preentrenamiento del modelo base.

## Capacidades

- Control robotico de manipulacion: genera acciones de 6 dimensiones para un robot tipo `so_follower` a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa simultaneamente multiples camaras (head, wrist y flujos adicionales) para construir una representacion del entorno.
- Seguimiento de instrucciones en lenguaje natural: acepta una descripcion textual de la tarea (por ejemplo, "pick up the red block and put it on the plate").
- Ejecucion de tareas de pick-and-place: especializado en recoger bloques de color y depositarlos sobre un plato.
- Despliegue en hardware de consumo: el tamano de 0,45B permite ejecucion en GPUs de gama media.
- Integracion con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; las instrucciones de tarea del dataset estan en ingles.

## Casos de uso

- **Automatizacion de pick-and-place en laboratorio**: el modelo puede ejecutar la tarea de recoger un bloque rojo o verde y colocarlo sobre un plato, usando las camaras head y wrist para localizar el objeto y planificar la accion. Es adecuado porque fue entrenado especificamente sobre 50 episodios de esa tarea a 30 FPS.
- **Prototipado rapido de politicas roboticas**: un investigador puede partir de `lerobot/smolvla_base`, grabar su propio dataset con LeRobot y afinar el modelo con `lerobot-train` en pocas horas, gracias a los 0,45B parametros y al flujo documentado.
- **Docencia y formacion en robotica de imitacion**: el modelo sirve como ejemplo completo de un pipeline de imitation learning (grabacion, entrenamiento, rollout) en un curso o taller, ya que toda la cadena esta soportada por LeRobot y la licencia Apache 2.0 permite uso academico y comercial.
- **Validacion de hardware de bajo coste**: al caber en GPUs de consumo, permite probar politicas VLA en robots de sobremesa tipo `so_follower` sin necesidad de infraestructura de centro de datos.
- **Benchmark de referencia para nuevas tecnicas de VLA**: sirve como linea base contra la que comparar variantes de arquitectura o de aumento de datos en tareas de manipulacion simples.
- **Integracion en lineas de montaje educativas o de demostracion**: la tarea de clasificar bloques por color y depositarlos en una ubicacion fija es representativa de operaciones de seleccion y colocacion en entornos controlados.
- **Recoleccion de datos asistida**: el modelo puede ejecutar la politica mientras se graban nuevas trayectorias, generando datos adicionales para iterar el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), por lo que no se dispone de tasas de exito en robot real ni de metricas comparativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 0,45B parametros en precision completa (fp32) se requieren aproximadamente 1,8 GB solo para pesos; en fp16/bf16 alrededor de 0,9 GB. Sumando activaciones y buffers de vision, un despliegue tipico se situa en el rango de 2 a 4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente; se recomiendan RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor margen y throughput.
- **Cabe en GPU de consumo**: si, en tarjetas como RTX 3060/4060/4090 y equivalentes.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`) es el metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas roboticas.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. La frecuencia de entrenamiento es de 30 FPS, pero no se documenta la latencia de inferencia en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nebula2wx/smolvla_standard34_ds13 | 0,45B | VLA (fine-tuning) | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | VLA (base) | no disponible | Apache 2.0 | Hugging Face |
| nebula2wx/pi05_standard_task_pick_red_block_plate | 4B | VLA (pi0.5) | no disponible | no disponible | Hugging Face |

El modelo base `lerobot/smolvla_base` es la referencia directa: comparte arquitectura y licencia, pero no esta especializado en la tarea de pick-and-place de bloques. La variante `pi05_standard_task_pick_red_block_plate` del mismo autor emplea una arquitectura distinta (pi0.5) con 4B parametros, lo que implica mayores requisitos de hardware a cambio, presumiblemente, de mayor capacidad. No se dispone de datos de rendimiento comparativo entre estas opciones.

## Limitaciones y advertencias

- **Especializacion estrecha**: el modelo solo ha sido entrenado para dos tareas concretas (recoger bloque rojo o verde y ponerlo en el plato); no generaliza a otras tareas sin reentrenamiento.
- **Sin evaluacion publicada**: no hay tasas de exito ni validacion en robot real, por lo que su fiabilidad en produccion es desconocida.
- **Dependencia de la configuracion de camaras**: las entradas visuales deben coincidir con las claves de observacion del entrenamiento (incluida `observation.images.empty_camera_0` de 480x640); un montaje distinto degradara el rendimiento.
- **Dependencia del robot**: disenado para `so_follower`; usarlo en otro robot requiere recalibracion y probablemente reentrenamiento.
- **Riesgo de alucinacion motora**: como politica de imitacion, puede generar acciones fuera de distribucion ante objetos, iluminacion o posiciones no vistas durante el entrenamiento.
- **Idioma**: las instrucciones de tarea estan en ingles; no se documenta soporte multilingue.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de los datasets y del modelo base.
- **Sesgos**: no documentados; al entrenarse con un conjunto reducido de 50 episodios, puede heredar sesgos de posicion, color e iluminacion del dataset.
- **Repositorio pesado**: 19,8 GB, lo que puede dificultar la descarga y el almacenamiento en entornos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebula2wx/smolvla_standard34_ds13
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset rojo: https://huggingface.co/datasets/Whyynnot/standard_3_4_red_pick_up_20261031_220542
- Dataset verde: https://huggingface.co/datasets/Whyynnot/standard_3_4_greed_pick_up_20261031_232848
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor: https://huggingface.co/nebula2wx
- Modelo relacionado del autor: https://huggingface.co/nebula2wx/pi05_standard_task_pick_red_block_plate
