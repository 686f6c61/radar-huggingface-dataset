# learner1119/act_vine2_real_200_dee

## Resumen

El modelo `learner1119/act_vine2_real_200_dee` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollado por learner1119 (Doyoung Kim), este modelo aprende a generar secuencias de acciones (chunks) a partir de observaciones de sensores y cámaras, lo que permite ejecutar tareas de manipulación robótica mediante imitación de demostraciones teleoperadas. Con un tamaño de 51,6 millones de parámetros, es un modelo compacto diseñado para ejecutarse en sistemas con recursos limitados, como robots de investigación tipo SO-100. La arquitectura se basa en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), que propone el uso de Transformers para la predicción de acciones de forma robusta y precisa.

El modelo está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación, y su formato de pesos es safetensors. Aunque no se especifican los datos de entrenamiento, el dataset se identifica como `local/VINE2_real_200_dee`, lo que sugiere un conjunto de 200 episodios de demostraciones reales. Este modelo se integra en el ecosistema LeRobot, lo que facilita su entrenamiento, evaluación y despliegue en robots físicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.620.487 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, que se basa en un codificador de vision (para procesar imágenes del entorno) y un decodificador de acciones que produce secuencias de acciones de longitud fija (chunks). A diferencia de los métodos que predicen acciones paso a paso, ACT genera bloques de acciones completas, lo que mejora la estabilidad y la precisión en tareas de manipulación. El entrenamiento se realiza mediante imitación, utilizando demostraciones teleoperadas del dataset `VINE2_real_200_dee`. No se dispone de información sobre el número de tokens de entrenamiento, el uso de RLHF/DPO ni otras técnicas de optimización. El modelo se entrena con la librería LeRobot, que proporciona herramientas de entrenamiento, evaluación y despliegue.

## Capacidades

- Generación de secuencias de acciones para control de robots (action chunking).
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones visuales y del estado del robot para decidir acciones.
- Compatible con el robot SO-100, como se indica en el comando de evaluación (`--robot.type=so100_follower`).
- Integración con el framework LeRobot para entrenamiento, evaluación y registro de episodios.
- Sin soporte de tool calling, agentes, visión general o procesamiento de lenguaje natural; el modelo está especializado en control robótico.

## Casos de uso

- Tareas de pick-and-place en entornos de laboratorio: el modelo puede aprender a recoger y colocar objetos con precisión mediante demostraciones, adecuado para automatizar procesos repetitivos.
- Control de robots educativos (SO-100): por su tamaño reducido, puede ejecutarse en sistemas de bajo coste, facilitando experimentos en robótica educativa.
- Investigación en aprendizaje por imitación: el modelo sirve como base para comparar técnicas de action chunking o para estudiar el efecto de diferentes datasets.
- Automatización de tareas de ensamblaje ligero: al generar secuencias de acciones, puede realizar tareas de inserción o ajuste de piezas pequeñas.
- Prototipado rápido de políticas robóticas: con LeRobot, se puede entrenar y evaluar en horas, ideal para iteraciones de diseño.
- Integración en pipelines de robótica con ROS o ROS2: aunque no se documenta explícitamente, el modelo puede integrarse como módulo de control en sistemas de automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de lenguaje o código. No hay datos de éxito en tareas robóticas específicas.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo tiene 51,6 millones de parámetros, se estima que ocupa aproximadamente 200 MB en pesos float32, por lo que puede caber en GPUs de consumo con al menos 2 GB de VRAM, como una RTX 2060 o superior.
- GPU recomendada: cualquier GPU con soporte CUDA (p. ej., RTX 3090, A100) o incluso CPU con PyTorch para inferencia de baja velocidad.
- Compatibilidad con hardware de consumo: sí, el tamaño reducido permite ejecutarlo en tarjetas gráficas de gama media o en sistemas embebidos.
- Opciones de despliegue: LeRobot ofrece herramientas de entrenamiento y evaluación; también se puede usar con librerías de inferencia como PyTorch o TensorRT para optimización.
- Latencia y throughput: no se dispone de datos específicos, pero al ser un modelo pequeño, la inferencia es rápida (esperable en el orden de milisegundos en GPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo contexto (políticas de robótica). La arquitectura ACT es una técnica conocida, pero no hay datos de rendimiento de este modelo frente a otros.

## Limitaciones y advertencias

- El modelo está entrenado en un dataset específico (VINE2_real_200_dee) que puede no representar la diversidad de escenarios reales; su rendimiento fuera de ese dominio puede degradarse.
- No se ha documentado la robustez frente a perturbaciones o cambios en el entorno; puede requerir datos de calibración adicionales.
- No hay información sobre sesgos o alucinaciones, pero al ser un modelo de control robótico, no genera texto, por lo que el riesgo de alucinación es no aplicable.
- La licencia Apache 2.0 permite uso comercial y modificación, pero es responsabilidad del usuario verificar la procedencia de los datos de entrenamiento.
- No se especifican los idiomas soportados, ya que el modelo no procesa texto; las observaciones son imágenes y estados.
- El modelo está diseñado para un robot específico (SO-100); para otros robots se requeriría reentrenamiento o adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner1119/act_vine2_real_200_dee
- Paper de referencia: https://huggingface.co/papers/2304.13705
- LeRobot GitHub: https://github.com/huggingface/lerobot
- LeRobot Docs: https://huggingface.co/docs/lerobot/index
- Perfil del autor: https://huggingface.co/learner1119
