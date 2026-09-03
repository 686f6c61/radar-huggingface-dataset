# omkarpatil/move-soft-toy-left-dp-wrist-diffusion

## Resumen

El modelo `omkarpatil/move-soft-toy-left-dp-wrist-diffusion` es una política de difusión (Diffusion Policy) entrenada con LeRobot para controlar un robot ROBOTIS FFW SG2 Rev1 en la tarea de mover un juguete blando hacia la izquierda. Desarrollado por Omkar Patil, este modelo forma parte de un conjunto de políticas robóticas open source que utilizan exclusivamente las cámaras de muñeca del robot (izquierda y derecha) a resolución nativa de 424x240 píxeles.

El modelo resuelve el problema de manipulación de objetos deformables mediante aprendizaje por imitación, generando acciones de control a partir de observaciones visuales. Su relevancia radica en que demuestra la viabilidad de entrenar políticas de difusión con normalización de estadísticas agrupadas entre tareas similares (grupo de composición C), lo que mejora la generalización. Con 278,8 millones de parámetros y licencia Apache-2.0, es un modelo accesible para la comunidad robótica.

La arquitectura es una Diffusion Policy estándar con scheduler DDPM, entrenada durante 100 000 pasos con un batch size de 8. El modelo está disponible en formato safetensors y se integra con el ecosistema LeRobot, permitiendo su despliegue en el robot mencionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot 0.6.1, fork ROBOTIS `lerobot-cyclo`) |
| Parametros totales | 278 792 848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión-accion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una Diffusion Policy, un enfoque generativo que modela la distribución de acciones condicionada a observaciones. Utiliza un scheduler DDPM (Denoising Diffusion Probabilistic Models) para generar secuencias de acciones a partir de ruido, refinándolas iterativamente. Las observaciones provienen de dos cámaras de muñeca (izquierda y derecha) a resolución 424x240, que se procesan para extraer características visuales que condicionan el proceso de difusión.

El entrenamiento se realizó con los parámetros por defecto de LeRobot: 100 000 pasos, batch size 8, optimizador Adam con learning rate 1e-4, betas (0.95, 0.999) y weight decay 1e-6. La tasa de datos fue de 15 fps y la pérdida final de entrenamiento alcanzó 0.001. Un aspecto técnico destacable es el uso de estadísticas de normalización agrupadas (shared-norm) sobre 5 249 fotogramas de los dos miembros del grupo de composición C (`move-soft-toy-left` y `move-soft-toy-right`), lo que permite que políticas de la misma familia compartan la misma normalización. El dataset se convirtió al formato LeRobot v3.0 desde v2.1, restaurando las estadísticas agrupadas tras la conversión.

## Capacidades

- Control robótico de manipulación: genera acciones de movimiento para el brazo del robot FFW SG2 Rev1, específicamente para desplazar un juguete blando hacia la izquierda.
- Percepción visual con cámaras de muñeca: procesa imágenes de dos cámaras (izquierda y derecha) a 424x240 para condicionar la generación de acciones.
- Aprendizaje por imitación: reproduce comportamientos demostrados, sin necesidad de ingeniería de recompensas.
- Generalización dentro del grupo de composición: al compartir estadísticas de normalización con la tarea `move-soft-toy-right`, puede beneficiarse de datos de ambas tareas.
- Integración con LeRobot: compatible con el framework LeRobot para despliegue y evaluación en el robot.
- Formato de datos v3.0: utiliza el formato de dataset más reciente de LeRobot, con estadísticas de normalización restauradas.

## Casos de uso

- Manipulación de objetos deformables en investigación: el modelo permite estudiar cómo las políticas de difusión manejan objetos blandos, un reto abierto en robótica. Se usaría en laboratorios con el robot FFW SG2 Rev1 para validar algoritmos de aprendizaje por imitación.
- Automatización de tareas de picking y placing en entornos controlados: aunque la tarea es específica (mover un juguete a la izquierda), sirve como base para transferir el enfoque a otras tareas de manipulación con objetos similares.
- Benchmarking de políticas de difusión: al ser un modelo open source con métricas de entrenamiento publicadas, puede usarse como referencia para comparar arquitecturas de políticas robóticas (por ejemplo, frente a GR00T o SmolVLA).
- Desarrollo de sistemas de control con visión de muñeca: el modelo demuestra que es posible operar solo con cámaras de muñeca, lo que reduce la dependencia de cámaras externas y simplifica la calibración.
- Entrenamiento multi-tarea con normalización agrupada: el esquema de shared-norm puede replicarse en otros robots y tareas para mejorar la eficiencia de datos, usando este modelo como ejemplo de implementación.
- Educación en robótica con LeRobot: sirve como caso práctico para enseñar a estudiantes cómo entrenar y desplegar políticas de difusión en hardware real, gracias a su licencia permisiva y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (0.001) y los parámetros de configuración, pero no hay comparaciones con otros modelos ni métricas de éxito en tareas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de 278,8 millones de parámetros y la entrada de dos cámaras a 424x240, una GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia en tiempo real, aunque no hay datos confirmados.
- GPU recomendadas: no especificadas por el autor. Por el tamaño, GPUs consumer como RTX 3060 (12 GB) o superiores serían adecuadas; para entrenamiento se necesitaría al menos una RTX 3090 o A100.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño moderado, pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot proporciona herramientas de evaluación y despliegue; también es posible usar el framework de inferencia de LeRobot con PyTorch. No se mencionan vLLM, llama.cpp u Ollama porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de difusión para el mismo robot y tarea). El autor ha publicado otros modelos para el mismo robot (por ejemplo, `ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7` y `ffw_sg2_pick-blue-cylinder-left-arm_smolvla`), pero son de arquitecturas diferentes (GR00T y SmolVLA) y no se proporcionan métricas comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado para una tarea muy concreta (mover un juguete blando a la izquierda) y no generaliza a otras tareas sin reentrenamiento.
- Dependencia de las cámaras de muñeca: si las cámaras se desalinean o cambian las condiciones de iluminación, el rendimiento puede degradarse.
- Sin datos de robustez: no se han publicado pruebas de generalización a nuevos objetos, posiciones o entornos.
- Riesgo de sobreajuste: la pérdida de entrenamiento de 0.001 sugiere un posible sobreajuste al dataset de demostración, aunque no hay evidencia concluyente.
- Compatibilidad de normalización: el modelo solo compone correctamente con otros modelos que compartan el mismo hash de normalización (`bbd29ed19fbe`); mezclar con políticas de otras arquitecturas (GR00T) no es válido.
- Requiere el robot específico: el modelo está diseñado para el ROBOTIS FFW SG2 Rev1; no es portable a otros robots sin adaptación.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar que el hardware y el software asociados (LeRobot, ROBOTIS) no tengan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omkarpatil/move-soft-toy-left-dp-wrist-diffusion
- Dataset asociado: https://huggingface.co/datasets/omkarpatil/move-soft-toy-left
- Perfil del autor: https://huggingface.co/omkarpatil/models
- Publicaciones del autor: https://omkarpatil18.github.io/publications/
