# hugasloth/act_so101_task

## Resumen

El modelo `hugasloth/act_so101_task` es una política de robótica basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Está diseñada para controlar un brazo robótico SO101 mediante aprendizaje por imitación, aprendiendo a partir de datos teleoperados para ejecutar una tarea específica registrada como "task". El modelo consume observaciones de dos cámaras (escena y muñeca) junto con el estado del robot, y produce acciones de 6 grados de libertad.

Este modelo es relevante porque representa un caso práctico de aplicación de transformadores a la robótica de manipulación, un campo en crecimiento dentro de la IA open source. Con aproximadamente 51,7 millones de parámetros, es una política compacta que puede ejecutarse en hardware de consumo, lo que la hace accesible para laboratorios y desarrolladores que trabajan con el brazo SO101. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La arquitectura combina un codificador de visión (para procesar las imágenes de las cámaras) con un transformador que genera los chunks de acción. El modelo fue entrenado con el framework LeRobot (versión 0.6.1) sobre el dataset `hugasloth/so101_task`, que contiene 110 episodios y 41.781 fotogramas a 30 FPS. La configuración de entrenamiento incluye 40.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se menciona el uso de RLHF o DPO; el entrenamiento es puramente por imitación supervisada.

## Capacidades

- Control de brazo robótico SO101: genera acciones de 6 grados de libertad (posición y orientación del efector final).
- Percepción visual multimodal: procesa simultáneamente imágenes de cámara de escena y cámara de muñeca, ambas a 480x640 píxeles.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Ejecución en tiempo real: diseñado para inferencia a 30 FPS, compatible con el ciclo de control del robot.
- Integración con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para robótica (entrenamiento, evaluación y despliegue).
- Sin capacidades de lenguaje: no es un modelo multimodal de lenguaje; su salida es exclusivamente acciones de robot.

## Casos de uso

- Automatización de tareas repetitivas en laboratorio: el modelo puede ejecutar tareas de pick-and-place o ensamblaje simple en un brazo SO101, reduciendo la intervención humana en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre diferentes tareas o robots, gracias a su tamaño compacto y licencia permisiva.
- Prototipado rápido en robótica educativa: permite a estudiantes y desarrolladores desplegar una política funcional en un SO101 sin necesidad de entrenar desde cero, usando los comandos de LeRobot.
- Evaluación de algoritmos de control: el modelo puede usarse como baseline para comparar nuevas arquitecturas o métodos de entrenamiento en tareas de manipulación.
- Teleoperación asistida: combinado con un sistema de supervisión humana, el modelo puede asistir en operaciones de manipulación delicada donde se requiere precisión.
- Desarrollo de sistemas de robotización para pymes: empresas que utilizan brazos SO101 pueden integrar esta política para automatizar procesos productivos sencillos, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, precisión o latencia.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~51,7M parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32, y significativamente menos en cuantización (aunque no se especifican formatos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una NVIDIA RTX 3060 o superior sería adecuada para entrenamiento e inferencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060 o incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que gestionan la conexión con el robot y las cámaras. También es posible usar el modelo con PyTorch directamente.
- Latencia y throughput: no se proporcionan datos específicos, pero al operar a 30 FPS con dos cámaras, se espera una latencia de inferencia inferior a 33 ms en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hugasloth/act_so101_task | 51,7M | No aplica | Manipulación SO101 | Apache 2.0 | Hugging Face |
| aiden-li/so101-act | No disponible | No aplica | Manipulación SO101 | No disponible | Hugging Face |
| Modelos VLA (p.ej. OpenVLA) | 7B | No aplica | Manipulación general | MIT | Hugging Face |

El modelo se compara con otras políticas ACT para SO101, como `aiden-li/so101-act`, aunque no se dispone de datos de rendimiento para establecer comparaciones cuantitativas. Frente a modelos VLA más grandes (como OpenVLA), este modelo es mucho más ligero y específico para una tarea concreta, lo que lo hace más adecuado para despliegue en hardware limitado.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos teleoperados de un solo operador, la política puede reflejar los sesgos y estilos de ese operador, lo que podría afectar la generalización.
- Riesgo de alucinación: en robótica, el equivalente a la alucinación es la ejecución de acciones incorrectas o inseguras. No se han reportado evaluaciones de seguridad.
- Limitaciones de contexto: el modelo está entrenado para una tarea específica ("task") y no generaliza a otras tareas sin reentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Caveat para producción: no hay resultados de evaluación en robot real, por lo que el rendimiento en entornos no controlados es incierto. Se recomienda validar exhaustivamente antes de usar en producción.
- Dependencia de hardware: el modelo requiere el brazo SO101 y las cámaras configuradas exactamente como en el entrenamiento (mismas posiciones, iluminación, etc.) para funcionar correctamente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hugasloth/act_so101_task)
- [Dataset de entrenamiento](https://huggingface.co/datasets/hugasloth/so101_task)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Guía de entrenamiento SO101 con SOLO CLI](https://github.com/omkarputti/SO101_ACT_Training)
- [Workshop de sim-to-real para SO-101](https://github.com/isaac-sim/Sim-to-Real-SO-101-Workshop)
