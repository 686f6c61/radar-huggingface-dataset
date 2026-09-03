# fecasado/gfm-cubes-21a

## Resumen

El modelo `fecasado/gfm-cubes-21a` es una política de robótica entrenada con la librería LeRobot de Hugging Face, desarrollada por el usuario fecasado. Está diseñada para la tarea de manipulación de cubos en cestas, utilizando un enfoque de *gaze flow matching* (coincidencia de flujo de mirada), una técnica que combina la predicción de trayectorias con la atención visual del robot. El modelo se publica bajo licencia Apache-2.0 y está disponible en formato safetensors, con un total de 75.220.954 parámetros.

La relevancia de este modelo radica en su aplicación directa en robótica de manipulación, un campo donde los modelos de aprendizaje por imitación están ganando tracción. Al estar integrado en el ecosistema LeRobot, permite reproducir entrenamiento e inferencia de forma estandarizada, facilitando su uso en entornos de investigación y desarrollo. Sin embargo, la información pública disponible es escasa: la model card es un template genérico y no se detallan arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_flow_matching (flujo de coincidencia de mirada) |
| Parametros totales | 75.220.954 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe como *gaze flow matching*, un enfoque que combina la generación de trayectorias mediante *flow matching* con la información de mirada (gaze) del robot, probablemente para guiar la atención visual durante la manipulación. No se dispone de detalles sobre la implementación concreta (si es un transformer, una red convolucional, etc.) ni sobre el proceso de entrenamiento. El modelo fue entrenado con el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que sugiere una tarea de apilar o mover cubos a cestas con imágenes de 320x240 píxeles. No se especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La integración con LeRobot indica que se utilizó el pipeline estándar de esta librería para el entrenamiento de políticas de imitación.

## Capacidades

- Control de robot para manipulación de objetos (cubos en cestas) mediante aprendizaje por imitación.
- Predicción de trayectorias de movimiento basadas en *flow matching*.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- Soporte para grabación de episodios de evaluación con robots SO-100 (según la documentación de LeRobot).
- No se han documentado capacidades de generación de texto, razonamiento, código, visión general o tool calling, ya que es un modelo específico de robótica.

## Casos de uso

- **Manipulación robótica en entornos de laboratorio**: el modelo puede controlar un brazo robótico para tareas de recogida y colocación de cubos, útil en investigación de robótica de manipulación.
- **Aprendizaje por imitación para tareas repetitivas**: se puede utilizar como política base para enseñar a un robot a realizar tareas de clasificación o apilado de objetos en entornos controlados.
- **Evaluación de algoritmos de *flow matching* en robótica**: sirve como punto de referencia para comparar el rendimiento de este enfoque frente a otros métodos (como ACT o diffusion policies) en tareas de manipulación.
- **Desarrollo de sistemas de control visual**: al incorporar la mirada (gaze), puede ser útil para estudiar cómo la atención visual mejora la precisión en tareas de agarre y colocación.
- **Prototipado rápido con LeRobot**: al estar integrado en LeRobot, permite a desarrolladores e investigadores reproducir el entrenamiento y la inferencia con comandos estándar, acelerando la experimentación.
- **Educación en robótica**: como ejemplo de política entrenada con LeRobot, puede usarse en cursos para demostrar el flujo de trabajo de entrenamiento y despliegue de modelos de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como éxito en la tarea, precisión de agarre o comparación con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: con 75 millones de parámetros, el modelo es ligero. En FP32 ocuparía aproximadamente 300 MB, y en FP16 unos 150 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs de consumo como la GTX 1060 o superiores.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente. No se requieren GPUs de alta gama para inferencia.
- **Compatibilidad con consumer GPU**: sí, es totalmente viable en GPUs de consumo.
- **Opciones de despliegue**: al ser un modelo de LeRobot, se puede ejecutar con los scripts de inferencia de LeRobot (`lerobot-record`). También es posible exportar a otros formatos si se desea, aunque no se documenta.
- **Latencia y throughput**: no se dispone de datos medidos. Dado el tamaño, se espera una latencia baja (del orden de milisegundos) en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Existen modelos relacionados en el mismo repositorio del autor, como `fecasado/gfm-cubes-baseline` y `fecasado/gact-cubes-21a`, pero no se han publicado sus especificaciones ni resultados. Se recomienda consultar estos modelos para posibles comparaciones, aunque los datos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- **Información limitada**: la model card es un template genérico y no se detallan arquitectura, datos de entrenamiento, ni rendimiento. Esto dificulta evaluar su idoneidad para casos de uso específicos.
- **Sesgos y alucinaciones**: al ser un modelo de robótica, no genera texto, por lo que el riesgo de alucinación lingüística no aplica. Sin embargo, puede presentar errores en la ejecución de tareas si el entorno difiere del de entrenamiento.
- **Dependencia del dataset**: el modelo fue entrenado con un dataset específico (`Ncubes-to-Nbaskets-320x240`); su generalización a otras tareas o entornos no está garantizada.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios. No hay restricciones adicionales conocidas.
- **Caveat para producción**: al no haber benchmarks publicados, no se recomienda su uso en producción sin una validación exhaustiva en el entorno objetivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fecasado/gfm-cubes-21a)
- [Modelo relacionado: gfm-cubes-baseline](https://huggingface.co/fecasado/gfm-cubes-baseline)
- [Modelo relacionado: gact-cubes-21a](https://huggingface.co/fecasado/gact-cubes-21a)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
