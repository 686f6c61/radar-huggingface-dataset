# omkarpatil/move-soft-toy-right-dp-wristnp-diffusion

## Resumen

El modelo `omkarpatil/move-soft-toy-right-dp-wristnp-diffusion` es una política de difusión (Diffusion Policy) entrenada con LeRobot para el robot manipulador ROBOTIS FFW SG2 Rev1. Desarrollado por el usuario omkarpatil, resuelve la tarea de mover un juguete blando hacia la derecha utilizando exclusivamente dos cámaras de muñeca (izquierda y derecha) y sin información de propriocepción (observation.state a cero). Es un modelo de control robótico basado en aprendizaje por imitación, relevante para la comunidad de robótica open source por su integración con el ecosistema LeRobot y su enfoque en normalización compartida entre tareas del mismo grupo.

La arquitectura es una política de difusión (DDPM) con 274.492.048 parámetros, entrenada durante 100.000 pasos con un batch de 8 sobre un dataset convertido al formato v3.0 de LeRobot. La licencia es Apache 2.0, lo que permite uso comercial y modificación. El modelo está diseñado para ejecutarse en el pipeline de robótica de HuggingFace y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) sobre LeRobot 0.6.1 |
| Parametros totales | 274.492.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una política de difusión clásica: dado un conjunto de observaciones (imágenes de dos cámaras de muñeca), genera acciones de control a través de un proceso de denoising iterativo. En este caso, la observación de estado (posición articular) se anula deliberadamente, forzando al modelo a depender únicamente de la información visual. Las dos cámaras tienen resoluciones nativas distintas (cabeza 376x672, muñecas 424x240), por lo que fue necesario re-codificar todas las vistas a un tamaño común para cumplir con el requisito de resolución uniforme de Diffusion Policy.

El entrenamiento siguió los valores por defecto de LeRobot: 100.000 pasos, batch de 8, optimizador Adam con lr 1e-4, betas (0.95, 0.999) y weight decay 1e-6. El scheduler de ruido fue DDPM. Los datos provienen de la tarea `move-soft-toy-right` dentro del grupo de composición C, que incluye también `move-soft-toy-left`. Las estadísticas de normalización se agruparon sobre 5.249 fotogramas de todos los miembros del grupo y se almacenaron de forma idéntica en cada dataset miembro, verificadas mediante el hash `sha256(...)[:12] = bbd29ed19fbe`. El conjunto de datos se convirtió de v2.1 a v3.0 de LeRobot, restaurando después las estadísticas agrupadas que el conversor habría sobrescrito con valores por tarea.

## Capacidades

- Control robótico de manipulación: genera trayectorias de acción para mover un objeto blando hacia la derecha.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Percepción visual multicámara: procesa simultáneamente imágenes de dos cámaras de muñeca.
- Robustez a la falta de propriocepción: funciona sin información de estado articular, lo que simplifica la integración en robots con encoders poco fiables.
- Compatibilidad con LeRobot: integración nativa con el framework de entrenamiento y despliegue de LeRobot.
- Normalización compartida: utiliza estadísticas agrupadas de su grupo de composición, lo que facilita la composición con otras políticas del mismo grupo.

## Casos de uso

- Manipulación de objetos deformables en entornos industriales: el modelo puede controlar un brazo robótico para reposicionar piezas blandas (por ejemplo, en líneas de embalaje) sin necesidad de sensores de fuerza o propriocepción.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar políticas de difusión con observaciones visuales únicamente y normalización agrupada.
- Desarrollo de robots de bajo coste: al prescindir de la información de estado, se puede desplegar en plataformas con encoders de baja calidad o sin ellos, siempre que las cámaras proporcionen la información necesaria.
- Composición de políticas: al pertenecer al grupo C, puede combinarse con la política hermana `move-soft-toy-left` para crear políticas compuestas que manejen múltiples tareas de manipulación.
- Benchmarking de arquitecturas de control: su entrenamiento con hiperparámetros estándar de LeRobot permite comparar el rendimiento de Diffusion Policy frente a otras arquitecturas (como GR00T) en la misma tarea.
- Educación en robótica: útil para enseñar a estudiantes el flujo completo de entrenamiento de políticas con LeRobot, desde la captura de datos hasta la inferencia en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (como MMLU, HumanEval o similares) en la información disponible, ya que se trata de un modelo de control robótico y no de lenguaje. El único dato reportado es la pérdida de entrenamiento final: **0.004**. No hay métricas de éxito en tarea, precisión de trayectoria ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño de parámetros (274M) y el formato de difusión, una GPU con al menos 4-6 GB de VRAM podría ser suficiente para inferencia en tiempo real, pero no hay datos oficiales.
- GPU recomendadas: no hay especificación oficial. Para entrenamiento se usó una GPU de gama media-alta (no especificada). Para inferencia en tiempo real se recomienda una GPU NVIDIA moderna (RTX 3060 o superior) si se requiere latencia baja.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño moderado del modelo, pero no confirmado.
- Opciones de despliegue: LeRobot soporta inferencia con PyTorch y puede integrarse con ROS o sistemas de control propios. No se mencionan vLLM, llama.cpp u Ollama porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del hardware y del número de pasos de denoising (por defecto en LeRobot suele ser 50 pasos).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente en la documentación proporcionada. La model card menciona que las políticas GR00T para las mismas tareas usan estadísticas de normalización diferentes (percentiles en lugar de min/max), lo que impide la composición entre arquitecturas. Sin embargo, no se ofrecen datos de rendimiento cuantitativos de GR00T ni de otras políticas de difusión para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado en un conjunto de datos limitado (5.249 fotogramas agrupados), puede no generalizar a variaciones del objeto, iluminación o configuraciones del robot.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede producir acciones inconsistentes si las observaciones visuales difieren mucho del dataset de entrenamiento.
- Limitaciones de contexto: el modelo no procesa lenguaje ni tiene contexto de texto; depende exclusivamente de las imágenes de entrada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y los avisos de copyright.
- Dependencia de cámaras: requiere las dos cámaras de muñeca con la resolución re-codificada; si las cámaras difieren de las usadas en entrenamiento, el rendimiento puede degradarse.
- Composición limitada: solo se puede componer con políticas que compartan el mismo hash de normalización y la misma arquitectura (diffusion con diffusion, no con GR00T).
- Conversión de dataset: el dataset se convirtió de v2.1 a v3.0, y las estadísticas agrupadas se restauraron manualmente; cualquier modificación del dataset podría invalidar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/omkarpatil/move-soft-toy-right-dp-wristnp-diffusion
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://lerobot.readthedocs.io/
