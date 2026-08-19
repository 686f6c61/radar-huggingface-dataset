# 2usang/act_trihouse-sandwich

## Resumen

El modelo `2usang/act_trihouse-sandwich` es una política de imitación basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT, presentado en el artículo arXiv 2304.13705, predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica. Este modelo concreto ha sido entrenado sobre el dataset `2usang/trihouse-sandwich`, que recoge demostraciones teleoperadas de una tarea de manipulación relacionada con sándwiches.

El modelo tiene 51.668.614 parámetros, un tamaño contenido que lo hace adecuado para ejecutarse en GPUs de consumo. Está publicado bajo licencia Apache-2.0 y distribuido en formato safetensors a través del Hub de Hugging Face. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT a una tarea robótica concreta, utilizando el ecosistema LeRobot para entrenamiento e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un mecanismo de predicción de chunks de acciones. En lugar de emitir una única acción por paso temporal, el modelo genera una secuencia de acciones futuras (por ejemplo, 50 pasos) que luego se ejecutan de forma cerrada, reduciendo la acumulación de errores. La arquitectura incluye un codificador de observaciones (imágenes y estados del robot) y un decodificador autoregresivo que produce los chunks.

El entrenamiento se realizó con el framework LeRobot, que gestiona el dataset, la carga de datos y el bucle de entrenamiento. El dataset `2usang/trihouse-sandwich` contiene demostraciones teleoperadas de la tarea de montar un sándwich, aunque no se especifican el número de episodios ni la composición exacta de las observaciones (número de cámaras, resolución, etc.). No se menciona el uso de RLHF ni DPO; el método se basa únicamente en aprendizaje por imitación supervisado.

## Capacidades

- Ejecución de tareas de manipulación robótica mediante aprendizaje por imitación.
- Predicción de secuencias de acciones (action chunking) que permiten ejecutar movimientos suaves y coordinados.
- Integración nativa con el ecosistema LeRobot, incluyendo pipelines de entrenamiento, evaluación y registro de episodios.
- Soporte para robots SO-100 (follower) como se indica en los comandos de evaluación, aunque podría adaptarse a otros brazos con configuraciones similares.
- Capacidad de procesar observaciones multimodales (imágenes y estados del robot) si el dataset lo incluye, aunque no se detalla en la información disponible.
- No se han documentado capacidades de tool calling, razonamiento general ni procesamiento de lenguaje natural, ya que es un modelo puramente robótico.

## Casos de uso

- Manipulación robótica de precisión: el modelo puede controlar un brazo robótico para realizar tareas como ensamblar objetos, apilar piezas o manipular alimentos, gracias a su predicción de chunks de acciones que suavizan la trayectoria.
- Automatización de líneas de producción: en entornos controlados, puede replicar tareas repetitivas de montaje o empaquetado aprendidas de demostraciones humanas, reduciendo el coste de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos con ACT, permitiendo comparar hiperparámetros, arquitecturas o estrategias de recolección de datos.
- Desarrollo de robots colaborativos: puede integrarse en sistemas donde un operador teleopera el robot unas pocas veces y el modelo aprende a imitar, facilitando la puesta en marcha de celdas de trabajo.
- Benchmarking de políticas robóticas: al estar disponible en el Hub con licencia abierta, permite reproducir resultados y comparar con otras políticas entrenadas en datasets similares.
- Educación y prototipado: con hardware de bajo coste como el brazo SO-100, se puede usar en laboratorios docentes para demostrar conceptos de aprendizaje por imitación y control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparativas con otros modelos. Para evaluar el rendimiento, sería necesario ejecutar el protocolo de evaluación incluido en LeRobot sobre el dataset de evaluación correspondiente.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros, el modelo es ligero. En FP32 ocupa aproximadamente 207 MB, y en FP16 unos 103 MB. La VRAM necesaria para inferencia dependerá del tamaño de lote y de la resolución de las imágenes de entrada, pero es plausible que quepa en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA y al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060 o superior. Para entrenamiento, se recomienda al menos 8 GB.
- Sí cabe en GPUs de consumo: es adecuado para tarjetas como RTX 3060, RTX 4060 o incluso integradas si se usan cuantizaciones ligeras (aunque no se han publicado pesos cuantizados).
- Opciones de despliegue: el modelo se usa principalmente a través del framework LeRobot, que permite entrenar y ejecutar inferencia en Python. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la configuración de las cámaras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT entrenadas con LeRobot para tareas similares). Existen otros checkpoints públicos de ACT en el Hub, pero no se han encontrado datos suficientes para una comparación rigurosa en cuanto a rendimiento y características. Se recomienda consultar el repositorio de LeRobot para ver otras políticas entrenadas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un modelo entrenado con demostraciones de un operador concreto, puede heredar sesgos en la forma de ejecutar la tarea (velocidad, trayectorias, preferencias).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero puede ejecutar acciones no deseadas si las observaciones difieren mucho de las del entrenamiento (falta de generalización).
- Limitaciones de contexto: el modelo no procesa texto ni lenguaje; su contexto son las observaciones robóticas (imágenes y estados). No se especifica el tamaño de la ventana de observación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y distribución, siempre que se mantenga el aviso de licencia.
- Caveat para producción: al ser un modelo entrenado con un dataset específico, su rendimiento fuera de la tarea de "trihouse-sandwich" no está garantizado. Es necesario validar en el robot real antes de cualquier despliegue.
- Dependencia de LeRobot: para reproducir el entrenamiento o la inferencia, es imprescindible usar la versión correcta de LeRobot y del entorno de simulación o hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2usang/act_trihouse-sandwich
- Dataset de entrenamiento: https://huggingface.co/datasets/2usang/trihouse-sandwich
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
