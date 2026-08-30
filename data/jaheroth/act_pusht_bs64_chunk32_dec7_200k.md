# jaheroth/act_pusht_bs64_chunk32_dec7_200k

## Resumen

El modelo `jaheroth/act_pusht_bs64_chunk32_dec7_200k` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por el usuario jaheroth y publicada en Hugging Face bajo licencia Apache 2.0. Está entrenado sobre el dataset `lerobot/pusht`, un entorno de simulación de empuje de objetos (PushT) ampliamente utilizado para evaluar políticas robóticas. El modelo forma parte del ecosistema LeRobot de Hugging Face, que facilita el entrenamiento, evaluación y despliegue de políticas de control para robots.

ACT aborda el problema de la predicción de acciones de baja frecuencia y alta dimensionalidad en robótica mediante el uso de "chunks" de acciones: en lugar de predecir una única acción por paso, el modelo predice una secuencia de acciones futuras, lo que mejora la estabilidad y la precisión en tareas de manipulación. Este modelo concreto tiene 83,9 millones de parámetros, un tamaño moderado que lo hace viable para inferencia en GPU de consumo. Su relevancia radica en ser un ejemplo práctico de entrenamiento de una política ACT con LeRobot, reproducible y listo para ser evaluado en el entorno PushT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 83.899.796 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de chunking, tipicamente 32 pasos de accion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que combina un transformer encoder-decoder con un mecanismo de "chunking" temporal. En lugar de predecir una sola accion por cada observacion, el modelo predice un bloque (chunk) de acciones futuras, tipicamente de 32 pasos en este caso (segun el nombre del repositorio `chunk32`). Esto reduce el error de acumulacion y mejora la consistencia de la ejecucion. El modelo se entrena con datos teleoperados del dataset `lerobot/pusht`, que contiene demostraciones de empuje de un objeto hacia una region objetivo. El entrenamiento se realizo con un tamaño de lote de 64 (`bs64`) y un decodificador con 7 capas (`dec7`), segun la nomenclatura del repositorio. Se utilizo la libreria LeRobot de Hugging Face, que implementa el pipeline completo de entrenamiento, evaluacion y despliegue. No se especifican detalles sobre el numero total de tokens de entrenamiento ni sobre el uso de RLHF o DPO, ya que es un modelo de robotica y no un LLM.

## Capacidades

- Generacion de secuencias de acciones para control robotico: el modelo predice chunks de 32 acciones futuras a partir de observaciones (imagenes y estados del robot).
- Aprendizaje por imitacion: reproduce comportamientos demostrados en el dataset PushT, incluyendo el empuje de un objeto a una posicion objetivo.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluacion y despliegue en robots reales o simulados.
- Soporte para evaluacion en simulacion: puede ejecutarse en el entorno PushT para medir la tasa de exito.
- No tiene capacidades de lenguaje natural, vision general ni tool calling; es una politica especifica para tareas de manipulacion.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del chunking, el tamaño de lote o la profundidad del decodificador en el rendimiento de ACT sobre PushT.
- Benchmarking de politicas robotica: permite comparar el rendimiento de ACT con otras arquitecturas (diffusion policies, etc.) en el entorno estandar PushT.
- Desarrollo de sistemas de control para robots manipuladores: puede adaptarse a otros datasets o entornos similares mediante fine-tuning con LeRobot.
- Educacion en robotica y aprendizaje automatico: ejemplo reproducible de entrenamiento de una politica ACT con herramientas open source.
- Evaluacion de robustez: se puede probar la politica en variantes del entorno PushT (cambios de posicion inicial, ruido) para analizar su generalizacion.
- Despliegue en robots reales: aunque entrenado en simulacion, el modelo puede transferirse a un robot fisico con la configuracion adecuada (por ejemplo, un brazo SO-100) usando LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de tasa de exito en el entorno PushT ni comparaciones con otros modelos. Para obtener datos de rendimiento, seria necesario ejecutar la evaluacion con el script de LeRobot (`lerobot.record` con `--episodes=10`).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 83,9 millones de parametros, la inferencia en precision FP32 requiere aproximadamente 335 MB de VRAM (83,9M * 4 bytes). Con cuantizacion a FP16 o BF16, se reduce a unos 168 MB. Esto cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8-12 GB (por ejemplo, RTX 3060, RTX 4070) para manejar el lote de 64 y el chunking.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama baja como GTX 1650 o RTX 3050.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia. Tambien se puede exportar a ONNX o TensorRT para optimizacion, aunque no esta documentado en el repositorio.
- Latencia y throughput: no disponibles. Depende del hardware y de la implementacion, pero al ser un modelo pequeno, la latencia por paso deberia ser inferior a 10 ms en una GPU moderna.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos en el repositorio. Sin embargo, en el ecosistema LeRobot existen otras politicas entrenadas sobre PushT, como las basadas en Diffusion Policy o en otras variantes de ACT. Dado que no se proporcionan datos de rendimiento ni configuraciones exactas, no es posible realizar una comparativa cuantitativa fiable. Se recomienda consultar el leaderboard de LeRobot para obtener comparaciones actualizadas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo esta entrenado exclusivamente en el entorno PushT, por lo que su comportamiento no generaliza a otras tareas de manipulacion sin fine-tuning.
- Riesgo de alucinacion: no aplica, ya que no genera texto, pero puede producir acciones incorrectas si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto: la ventana de contexto esta limitada al chunk de acciones (32 pasos) y a las observaciones historicas que el modelo recibe; no maneja secuencias largas de razonamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se debe mantener el aviso de copyright y la atribucion.
- Caveat para produccion: el modelo fue entrenado en simulacion; su transferencia a un robot real requiere calibracion y posiblemente fine-tuning con datos reales. Ademas, no se han publicado metricas de robustez ni evaluaciones exhaustivas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jaheroth/act_pusht_bs64_chunk32_dec7_200k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
