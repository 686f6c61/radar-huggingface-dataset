# dogeum/classify_demo_train3

## Resumen

dogeum/classify_demo_train3 es un modelo de politica robotica basado en ACT (Action Chunking with Transformers), desarrollado por el usuario dogeum (Park) utilizando el framework LeRobot de Hugging Face. El modelo implementa el metodo de aprendizaje por imitacion descrito en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arxiv:2304.13705), que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que permite un control robotico mas estable y preciso.

Con 51,7 millones de parametros y un tamano de repositorio de 0,2 GB, este modelo esta disenado para tareas de control robotico mediante teleoperacion. Se distribuye bajo licencia Apache 2.0 y se ha entrenado con el dataset dogeum/classify_dataset_demo. Es relevante para la comunidad de robotica open source porque demuestra el flujo completo de entrenamiento y publicacion de politicas de aprendizaje por imitacion con LeRobot, un framework que esta ganando adopcion en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robotica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers que utiliza un enfoque de autoencoder variacional condicional (CVAE) para modelar la distribucion de acciones. En lugar de predecir una sola accion por paso de tiempo, el modelo predice un fragmento de acciones (action chunk) de longitud fija, lo que reduce la acumulacion de errores y mejora la estabilidad del control. La arquitectura combina un encoder de observaciones (imagenes y estados de las articulaciones) con un decoder que genera las secuencias de acciones, condicionado por una variable de estilo latente que captura la variabilidad de las demostraciones.

El modelo se ha entrenado con el framework LeRobot utilizando el dataset dogeum/classify_dataset_demo, que contiene demostraciones teleoperadas. El entrenamiento se realizo siguiendo el flujo estandar de LeRobot, que incluye la configuracion del policy type como "act" y el uso de CUDA para el entrenamiento. No se dispone de informacion detallada sobre el numero de demostraciones, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que estos datos no se incluyen en la model card.

## Capacidades

- Control robotico mediante aprendizaje por imitacion: el modelo aprende a replicar acciones demostradas por teleoperacion.
- Prediccion de action chunks: genera secuencias de acciones en lugar de acciones individuales, mejorando la estabilidad del control.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot.
- Inferencia en tiempo real: disenado para ejecutarse en GPU durante la operacion robotica.
- Compatibilidad con robots SO-100: el flujo de evaluacion documentado utiliza el robot so100_follower.
- No tiene capacidades de generacion de texto, vision, audio ni tool calling, ya que es un modelo de politica robotica especializado.

## Casos de uso

- Control de robots manipuladores: el modelo puede utilizarse para controlar brazos roboticos SO-100 en tareas de manipulacion aprendidas por demostracion, como recoger y colocar objetos.
- Automatizacion de tareas repetitivas: en entornos industriales o de laboratorio, el modelo puede replicar tareas repetitivas que previamente requerian teleoperacion humana.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para investigadores que quieran experimentar con ACT y LeRobot sin entrenar un modelo desde cero.
- Prototipado rapido de politicas robotica: el flujo de LeRobot permite iterar rapidamente entre recopilacion de datos, entrenamiento y evaluacion.
- Benchmarking de algoritmos de imitacion: puede utilizarse como referencia para comparar el rendimiento de ACT frente a otras arquitecturas de politica robotica.
- Educacion en robotica: el modelo y su flujo de entrenamiento documentado son utiles para cursos y talleres sobre robotica y aprendizaje automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en FP32 (51,7 millones de parametros), lo que cabe en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 1 GB de VRAM (GTX 1050 Ti o superior). Para control robotico en tiempo real se recomienda una GPU con baja latencia, como una RTX 3060 o superior.
- Compatibilidad con GPU de consumo: si, el modelo es lo suficientemente pequeno para ejecutarse en cualquier GPU consumer.
- Opciones de despliegue: LeRobot (comandos `lerobot-record` para evaluacion e inferencia), con soporte para robots SO-100 y otros compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos
