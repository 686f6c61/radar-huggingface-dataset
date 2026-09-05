# OmakaseAI/act_d1_gripper_joint_pickupkettle_trim2_10k

## Resumen

OmakaseAI/act_d1_gripper_joint_pickupkettle_trim2_10k es un policy de robótica desarrollado por OmakaseAI, basado en Action Chunking with Transformers (ACT). Se trata de un modelo de aprendizaje por imitación que predice ráfagas cortas de acciones (action chunks) en lugar de pasos individuales, entrenado con datos de teleoperación. El modelo está especializado en la tarea de recoger una tetera (pickup kettle) utilizando un brazo robótico con pinza (gripper), perteneciente a la categoría de control de robots en el framework LeRobot.

La arquitectura es un Transformer (encoder-decoder, según el diseño ACT) con aproximadamente 74 millones de parámetros, un tamaño compacto que lo hace apto para ejecutarse en hardware robótico embebido. El modelo se distribuye con licencia Apache-2.0 y sus pesos están en formato safetensors. Su publicación está orientada a la comunidad de robótica y aprendizaje por imitación, facilitando la reproducción y el fine-tuning de políticas de control sobre datasets de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT - Action Chunking with Transformers) |
| Parametros totales | 73.989.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa el metodo Action Chunking with Transformers (ACT), tal como se describe en el paper 2304.13705. Se trata de un policy de aprendizaje por imitacion que, en lugar de predecir una unica accion por paso de tiempo, genera una secuencia completa de acciones (chunk). Esta estrategia reduce la acumulacion de errores en la ejecucion de movimientos y suele alcanzar tasas de exito elevadas en tareas de manipulacion con robots teleoperados.

El entrenamiento se ha realizado con la libreria LeRobot, utilizando el dataset `OmakaseAI/d1_gripper_joint_pickupkettle_trim2`, que contiene demostraciones teleoperadas de la tarea de recoger una tetera con una pinza. No se especifican el numero de muestras, la composicion exacta del dataset ni si se aplicaron tecnicas posteriores como RLHF o DPO; para un policy de control de robots estas no son habituales.

## Capacidades

- Control de manipulacion robótica: predice secuencias de acciones de bajo nivel para mover un brazo con pinza.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas.
- Prediccion por bloques (action chunking), en lugar de un solo paso, lo que ofrece una ejecucion mas estable.
- Se integra directamente con el framework LeRobot para entrenamiento, evaluacion e inferencia.
- No es un modelo de lenguaje, vision o generacion de texto: no admite prompts en lenguaje natural ni generacion de codigo, y no tiene capacidades de tool calling, razonamiento abstracto ni analisis multimodal.

## Casos de uso

- Investigacion en manipulacion robotica: el modelo sirve como policy de referencia para comparar el rendimiento de ACT con otros algoritmos de imitacion en la tarea de recoger objetos.
- Automatizacion de tareas de pick-and-place en entornos controlados: en una celula industrial donde el robot conoce la posicion del objeto, el modelo puede ejecutar la recogida de una tetera siguiendo la trayectoria aprendida.
- Fine-tuning para nuevos objetos o robots: gracias a LeRobot, los investigadores pueden reentrenar el modelo con datos propios y adaptarlo a diferentes pinzas o tareas sin partir de cero.
- Evaluacion en simulacion antes del despliegue: el modelo puede cargarse en entornos simulados via LeRobot para validar comportamiento sin necesidad de hardware fisico.
- Demostraciones en educacion o ferias de robotica: el tamaño compacto (~74M parametros) permite ejecutarlo en robots de bajo coste, mostrando la tarea de recoger una tetera como caso de uso clasico de imitacion.
- Despliegue en robots embebidos: el modelo se puede ejecutar en dispositivos como NVIDIA Jetson, aprovechando el soporte de PyTorch y la baja demanda de computo.
- Baseline para el framework LeRobot: sirve como punto de partida para probar configuraciones de entrenamiento, datasets o metricas en el pipeline de ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 300 MB en fp32 (74M de parametros), lo que permite ejecutarlo en GPUs modestas con 1-2 GB de VRAM.
- GPU recomendadas: NVIDIA GTX 1060 o superior, RTX 3060, RTX 4090, A100 o H100. Cualquier GPU moderna con soporte CUDA es valida.
- Si cabe en consumer GPU: si, en cualquier GPU de consumo con 2 GB o mas de VRAM.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. Se despliega mediante LeRobot y PyTorch, usando los scripts `lerobot-record` o `lerobot-train` para inferencia y entrenamiento.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. En el hub de OmakaseAI existen otros policies entrenados sobre datasets de LeRobot, pero no se han facilitado sus especificaciones ni resultados, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados; no se dispone de informacion sobre sesgos de comportamiento en el control del robot.
- Riesgo de alucinacion: no aplica, ya que el modelo no genera lenguaje natural ni contenido creativo.
- Limitaciones de contexto o idioma: no aplica; es un policy de control de bajo nivel.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificacion, pero requiere conservar los avisos de copyright y licencia en las redistribuciones.
- Caveat importante para produccion: el modelo esta entrenado especificamente para la tarea de recoger una tetera con un robot equipado con pinza, presumiblemente el robot D1. No se espera que generalice a otros objetos, robots o configuraciones de hardware sin un reentrenamiento adecuado sobre nuevos datos.
- El modelo no es autonomo en entornos no controlados: necesita informacion de posicion del robot y del objeto, y esta disenado para funcionar dentro del framework LeRobot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmakaseAI/act_d1_gripper_joint_pickupkettle_trim2_10k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Organizacion OmakaseAI: https://huggingface.co/OmakaseAI
