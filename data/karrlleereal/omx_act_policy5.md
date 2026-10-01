# karrlleereal/omx_act_policy5

## Resumen

omx_act_policy5 es una politica de aprendizaje por imitacion para robotica entrenada con LeRobot y publicada por el usuario karrlleereal. Se trata de una implementacion de Action Chunking with Transformers (ACT), el metodo presentado en el paper arXiv:2304.13705, que en lugar de predecir una unica accion por paso predice trozos (chunks) de acciones futuras de corto plazo. El modelo aprende a partir de datos de teleoperacion y esta pensado para ejecutarse sobre brazos roboticos tipo SO-100/SO-101 dentro del ecosistema LeRobot.

El modelo tiene 51.668.614 parametros totales y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB. Es, por tanto, una politica compacta, muy alejada del tamano de un modelo de lenguaje, y su objetivo no es generar texto sino producir comandos de control motor a partir de observaciones visuales y de estado del robot.

Su relevancia es practica: permite reproducir un flujo de entrenamiento y evaluacion estandarizado en LeRobot, con licencia Apache 2.0, sin necesidad de hardware de gama alta para inferencia. Al ser un artefacto con cero descargas y cero likes, y sin datos de benchmarks publicados en la informacion disponible, debe considerarse un checkpoint de experimentacion mas que una politica validada a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con cabeza CVAE para prediccion de chunks de acciones |
| Parametros totales | 51.668.614 |
| Longitud de contexto | no disponible (no aplica el concepto de contexto de tokens; la ventana se define por el historial de observaciones y la longitud del chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | karrlleereal/test1_final_fixed |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion (imitation learning / behavior cloning) que combina un backbone visual convolucional (tipo ResNet) para extraer caracteristicas de las imagenes de las camaras con un transformer encoder-decoder. La innovacion central es la prediccion de chunks de acciones: en lugar de emitir una accion por paso de control, el modelo genera una secuencia corta de acciones futuras, lo que reduce el error de compounding y mejora la estabilidad de la politica. Ademas incorpora un componente CVAE (autoencoder variacional condicional) con una variable latente que modela la variabilidad en los datos de teleoperacion, mitigando problemas de multimodalidad en las demostraciones.

En cuanto a los datos de entrenamiento, la model card indica que se ha entrenado con el dataset karrlleereal/test1_final_fixed mediante el flujo `lerobot-train`. No se especifica el numero de episodios, el numero de tokens ni la composicion exacta del dataset, ni se documenta el uso de RLHF o DPO, que en cualquier caso no aplican a este tipo de politica. Tampoco se detalla si hubo aumentos de datos, normalizacion de estado o estrategias de regularizacion concretas mas alla de lo que el propio framework LeRobot aplica por defecto.

## Capacidades

- Generacion de comandos de control motor a partir de observaciones visuales y de estado del robot.
- Prediccion de chunks de acciones (varias acciones futuras por inferencia) en lugar de pasos individuales.
- Aprendizaje por imitacion a partir de datos de teleoperacion.
- Ejecucion de tareas manipulativas de un solo brazo sobre hardware tipo SO-100/SO-101 en LeRobot.
- Integracion directa con el ecosistema LeRobot para entrenamiento, evaluacion y registro de episodios (`lerobot-train`, `lerobot-record`).
- No dispone de capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, vision semantica general, tool calling ni agentes multi-paso.

## Casos de uso

- Manipulacion robotica de laboratorio: ejecutar tareas de pick-and-place aprendidas de teleoperacion, aprovechando la prediccion de chunks para suavizar la trayectoria y reducir el error acumulado.
- Investigacion en aprendizaje por imitacion: servir como linea base reproducible dentro de LeRobot para comparar variantes de ACT frente a otras politicas sobre el mismo dataset.
- Prototipado rapido en robotica de bajo coste: desplegar sobre brazos SO-100/SO-101 con una GPU de gama media, gracias a los 51,6 millones de parametros del modelo.
- Evaluacion de generalizacion visual: comprobar como responde la politica ante cambios de iluminacion, posicion de objetos o nuevos elementos en la escena, usando el flujo `lerobot-record` con el prefijo `eval_`.
- Automatizacion de tareas repetitivas de recogida y colocacion en entornos controlados, donde el dominio coincide con el de los datos de teleoperacion.
- Fine-tuning sobre dominios especificos: reentrenar o ajustar la politica con nuevos datasets teleoperados para adaptarla a una celda de trabajo concreta.
- Docencia y formacion: utilizar el checkpoint como ejemplo didactico del ciclo completo de entrenamiento y despliegue de una politica ACT en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 51,6 millones de parametros, el modelo ocupa del orden de cientos de MB en memoria; cabe holgadamente en cualquier GPU de consumo actual, incluso en iGPU para inferencia de baja frecuencia.
- GPU recomendadas: no se especifican en la informacion. Para entrenamiento se recomienda una GPU NVIDIA con CUDA (el flujo de ejemplo usa `--policy.device=cuda`); para inferencia basta una GPU de gama media o una RTX de la serie 30/40.
- Cabe en GPU de consumo: si, con margen amplio, dado el reducido tamano del checkpoint (0,2 GB de repositorio).
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) como via principal; el formato safetensors permite cargarlo en PyTorch, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a politicas de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omx_act_policy5 | ACT (behavior cloning con chunks) | 51.668.614 | no disponible | apache-2.0 | HuggingFace (LeRobot) |
| Diffusion Policy | Politica generativa por difusion | no disponible | no disponible | no disponible | Implementacion disponible en LeRobot; datos concretos no disponibles en esta informacion |
| VQ-BeT | Behavior transformer con cuantizacion vectorial | no disponible | no disponible | no disponible | Implementacion disponible en LeRobot; datos concretos no disponibles en esta informacion |

No se dispone de resultados comparativos de rendimiento entre estas politicas en la informacion proporcionada, por lo que la comparativa se limita a categoria y formato.

## Limitaciones y advertencias

- El modelo no procesa lenguaje natural: no tiene capacidades de texto, razonamiento ni dialogo, por lo que no debe evaluarse con criterios de LLM.
- Al ser una politica de imitacion, hereda los sesgos y las limitaciones del dataset de teleoperacion karrlleereal/test1_final_fixed; su comportamiento fuera de la distribucion de entrenamiento es incierto.
- Riesgo elevado de fallo ante cambios de iluminacion, posicion de camara, fondo o tipo de objeto no vistos durante el entrenamiento.
- No hay datos publicados de tasa de exito, benchmarks ni evaluaciones independientes en la informacion disponible.
- El repositorio registra cero descargas y cero likes, por lo que no existe validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y licencia correspondientes; conviene revisar igualmente las condiciones del dataset de entrenamiento.
- Para uso en produccion es imprescindible validar la politica en el hardware objetivo y con protocolos de seguridad fisica, dado que un fallo de control puede provocar danos materiales o personales.
- Las fechas de creacion y actualizacion del repositorio (2026) aparecen en el futuro respecto a la informacion disponible, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/karrlleereal/omx_act_policy5
- Dataset de entrenamiento: https://huggingface.co/datasets/karrlleereal/test1_final_fixed
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas IL: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
