# heyunzhenwhat/pi0_so101-single-transfer-150ep-mixedpos-2x

## Resumen

Este modelo es un fine-tune del modelo base `lerobot/pi0_base`, desarrollado por el usuario `heyunzhenwhat` para una tarea concreta de manipulación robótica: mover una cinta adhesiva a una zona marcada en el lado derecho. Pi0 (π₀) es un modelo fundacional de robótica de Physical Intelligence, una política generalista de visión-lenguaje-acción (VLA) que combina un modelo de lenguaje y visión preentrenado con un mecanismo de flow matching para generar acciones de control. La implementación utilizada aquí es la de LeRobot, adaptada del repositorio OpenPI.

El modelo tiene 4.028.019.472 parámetros (aproximadamente 4 mil millones) y está entrenado sobre 150 episodios con 42.950 fotogramas a 30 FPS, recogidos con un robot tipo `so_follower` y dos cámaras (vista cenital y muñeca). Es un ejemplo de fine-tuning de un modelo VLA para una tarea específica, lo que lo hace relevante para quienes trabajan en aprendizaje por imitación y control robótico con LeRobot. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching sobre un VLM preentrenado |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (el modelo base Pi0 soporta instrucciones en ingles, pero no se especifica para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pi0 es un modelo de flujo (flow matching) construido sobre un modelo de lenguaje y visión (VLM) preentrenado, que hereda conocimiento semántico de Internet. La arquitectura convierte observaciones multimodales (imagenes y estado del robot) e instrucciones en texto en acciones de control. En este fine-tune, el modelo base `lerobot/pi0_base` se ajusta con el dataset `heyunzhenwhat/so101-single-transfer-150ep-mixedpos`, que contiene 150 episodios de una tarea de transferencia de cinta adhesiva. El entrenamiento se realizó con 9000 pasos, batch size 8, optimizador AdamW, learning rate 2.5e-05 y semilla 1000, usando la librería LeRobot versión 0.6.1. No se menciona el uso de RLHF ni DPO; es un entrenamiento de imitación supervisada.

## Capacidades

- Control robótico de un robot tipo `so_follower` (seguidor) con 6 grados de libertad, generando acciones de posición/velocidad.
- Percepción visual a través de dos cámaras: una cenital (720x1280) y otra en la muñeca (360x640).
- Interpretación de instrucciones en lenguaje natural (en este caso, la tarea "Move the tape into the taped area on the right").
- Ejecución de una tarea específica de manipulación: transferir una cinta adhesiva a una zona marcada.
- Capacidad de generalización limitada a la tarea y al robot con los que fue entrenado; no es un modelo generalista en este fine-tune.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.

## Casos de uso

- Automatización de tareas repetitivas en líneas de producción: el modelo puede ejecutar una tarea de pick-and-place concreta, como mover un objeto a una posición determinada, reduciendo la intervención humana en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA base para una tarea específica, permitiendo estudiar la transferencia de conocimiento de un modelo fundacional a una tarea particular.
- Prototipado rápido de políticas robóticas: con LeRobot, se puede entrenar y desplegar este modelo en un robot `so_follower` en pocos pasos, útil para validar hipótesis en laboratorio.
- Benchmarking de modelos VLA: al ser un fine-tune de Pi0, puede usarse como referencia para comparar el rendimiento de otras arquitecturas o métodos de entrenamiento en la misma tarea.
- Educación y formación en robótica: el modelo y su dataset están disponibles públicamente, lo que permite a estudiantes y desarrolladores experimentar con políticas de visión-lenguaje-acción sin necesidad de entrenar desde cero.
- Evaluación de robustez en entornos controlados: al no tener resultados de evaluación publicados, puede usarse para probar la repetibilidad y estabilidad de la política en diferentes condiciones de iluminación, posición de objetos, etc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero al tener ~4 mil millones de parámetros, se estima que en precisión FP32 necesitaría al menos 16 GB de VRAM. Con cuantización (no disponible en este repo) podría reducirse, pero no hay datos.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100, H100) para inferencia en precisión completa. No se especifican requisitos mínimos en la documentación.
- No cabe en GPUs de consumo con menos de 16 GB sin cuantización, y no se proporcionan versiones cuantizadas.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). No se menciona compatibilidad con vLLM, llama.cpp u otras herramientas de inferencia de modelos de lenguaje, ya que es un modelo de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Pi0 es un modelo VLA de flujo, mientras que alternativas como OpenVLA o RT-2 usan arquitecturas autoregresivas, pero no se han publicado resultados comparativos específicos para este fine-tune. Se recomienda consultar el paper de Pi0 (arXiv:2410.24164) para comparaciones con otros modelos en tareas generales de robótica.

## Limitaciones y advertencias

- Es un fine-tune para una tarea muy específica (mover una cinta adhesiva a una zona concreta); no generaliza a otras tareas u objetos sin reentrenamiento.
- No se han publicado resultados de evaluación, por lo que se desconoce su tasa de éxito en el mundo real.
- El modelo depende de las cámaras y la configuración del robot con las que fue entrenado; cambios en la iluminación, posición de la cámara o el robot pueden degradar el rendimiento.
- Riesgo de alucinación o acciones erróneas en entornos no vistos, lo que puede ser peligroso en aplicaciones reales sin supervisión.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Pi0 puede tener restricciones adicionales; se recomienda revisar la licencia del modelo base.
- No se especifican idiomas soportados; aunque Pi0 entiende inglés, este fine-tune no documenta soporte multilingüe.

## Enlaces

- Repositorio del modelo: https://huggingface.co/heyunzhenwhat/pi0_so101-single-transfer-150ep-mixedpos-2x
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-150ep-mixedpos
- Paper de Pi0: https://arxiv.org/html/2410.24164v1
- Blog de Physical Intelligence sobre Pi0: https://www.physicalintelligence.company/blog/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de Pi0 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
