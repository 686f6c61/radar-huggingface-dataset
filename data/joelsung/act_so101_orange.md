# joelsung/act_so101_orange

## Resumen

El modelo `joelsung/act_so101_orange` es una política de robótica basada en el método Action Chunking with Transformers (ACT), entrenada mediante aprendizaje por imitación con datos teleoperados. Fue desarrollada por el usuario joelsung y publicada en Hugging Face bajo la licencia Apache-2.0, integrada en el ecosistema LeRobot de Hugging Face. El modelo está diseñado para controlar un brazo robótico SO-101 en una tarea de pick-and-place de objetos naranjas, como indica el dataset asociado `joelsung/so101_orange_pickplace`.

La arquitectura ACT predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica. Con 51.668.662 parámetros y un peso total de 0,2 GB, es un modelo ligero que puede ejecutarse en hardware de consumo. Su relevancia radica en ser un ejemplo práctico de aprendizaje por imitación aplicado a robots de bajo coste, como el brazo SO-101, dentro de la plataforma LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.668.662 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesamiento de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Action Chunking with Transformers (ACT), una arquitectura basada en Transformer que aprende a predecir secuencias de acciones futuras (chunks) en lugar de acciones individuales. Este enfoque reduce la acumulación de errores durante la ejecución y mejora la suavidad del control. El modelo fue entrenado con LeRobot, la biblioteca de aprendizaje por refuerzo e imitación de Hugging Face, sobre el dataset `joelsung/so101_orange_pickplace`, que contiene demostraciones teleoperadas de tareas de pick-and-place de un objeto naranja con el brazo robótico SO-101.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se utilizaron técnicas de optimización adicionales como RLHF o DPO. El modelo se entrena mediante imitación directa (behavior cloning) sobre las demostraciones, sin componentes de refuerzo. Tampoco se han publicado detalles sobre innovaciones técnicas específicas más allá de la arquitectura ACT.

## Capacidades

- Control robótico de precisión: predice secuencias de acciones de baja latencia para ejecutar tareas de pick-and-place.
- Aprendizaje por imitación: aprende de demostraciones teleoperadas, sin necesidad de programación explícita de trayectorias.
- Integración con LeRobot: compatible con el entrenamiento y evaluación mediante la CLI de LeRobot (`lerobot-train`, `lerobot-record`).
- Soporte de ejecución en tiempo real: diseñado para ser desplegado en el robot SO-100/SO-101 con inferencia en GPU.
- No soporta procesamiento de lenguaje natural, visión ni tool calling: es un modelo puramente motor (policy) para control de actuadores.
- Capacidades multilingües: no aplicable, al no procesar texto.

## Casos de uso

- **Control de brazo robótico en entornos educativos**: el modelo puede desplegarse en un brazo SO-101 para enseñar conceptos de robótica y aprendizaje por imitación en cursos universitarios, como los que NVIDIA documenta en su guía de sim-to-real para SO-101.
- **Automatización de tareas de pick-and-place en laboratorios**: permite que un brazo robótico mueva objetos naranjas de una posición a otra, por ejemplo, en montajes de pruebas o líneas de ensamblaje de bajo coste.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para experimentos con ACT, comparando variantes de entrenamiento o modificaciones del dataset.
- **Prototipado rápido en robótica**: al integrarse con LeRobot, se puede reentrenar con nuevos datos de demostración para adaptar el modelo a otras tareas o configuraciones de objetos.
- **Evaluación de políticas en simulación**: el modelo puede utilizarse en entornos simulados para validar la robustez de ACT antes de desplegar en hardware físico.
- **Demostraciones educativas de transformadores aplicados a robótica**: permite explicar cómo los Transformers se usan en problemas de control continuo, no solo en NLP o visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de éxito, precisión ni comparativas con otros enfoques en la model card o en los resultados de búsqueda.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente, pero con 61,6 millones de parámetros, un modelo de este tamaño en FP32 requiere aproximadamente 0,2 GB de VRAM; con cuantización a INT8 o FP16, el requisito se reduce aún más, siendo viable en GPUs de consumo como la RTX 3060 o superiores.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o superior. Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM (RTX 3070, RTX 4070, etc.).
- **Cabe en consumer GPU**: sí, es un modelo ligero que se ejecuta sin problemas en GPUs de gama media de consumo.
- **Opciones de despliegue**: LeRobot ofrece soporte nativo para inferencia y evaluación con la CLI (`lerobot-record`), y el modelo puede ejecutarse en entornos Python con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible. Se espera latencia baja en ejecución en tiempo real para control robótico, pero no hay mediciones públicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Tarea | Licencia |
|---|---|---|---|---|
| joelsung/act_so101_orange | 51,7 M | ACT (Transformer) | Pick-and-place SO-101 | Apache-2.0 |
| Choikichang/act_so101_orange_500 | no disponible | ACT | Pick-and-place SO-101 (500 episodios) | Apache-2.0 |
| aiden-li/so101-act | no disponible | ACT | Pick-and-place SO-101 | Apache-2.0 |

Todos los modelos comparados son variantes de ACT para el mismo brazo robótico SO-101 y la misma tarea de pick-and-place, diferenciándose principalmente en el número de episodios de entrenamiento (por ejemplo, 500 en el caso de `Choikichang/act_so101_orange_500`) y en la configuración del dataset. No hay datos públicos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- **Alcance limitado**: el modelo está entrenado específicamente para la tarea de pick-and-place de objetos naranjas con el brazo SO-101; no es generalizable a otras tareas u objetos sin reentrenamiento.
- **Sesgos del dataset**: la calidad del modelo depende de la calidad de las demostraciones teleoperadas; si el dataset contiene trayectorias subóptimas, la política heredará esos errores.
- **Riesgo de alucinación**: en el contexto robótico, se puede interpretar como la ejecución de acciones imprevistas o inestables ante estados no vistos; el modelo puede fallar en situaciones fuera de la distribución de entrenamiento.
- **Sin procesamiento de lenguaje**: no soporta instrucciones en texto; la tarea está fijada por el dataset y no es configurable dinámicamente.
- **Restricciones de uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, siempre que se mantenga la atribución y se respete la licencia.
- **Sin métricas de robustez**: no se han publicado tasas de éxito ni evaluaciones en entornos con perturbaciones, lo que limita la confianza para despliegues en producción.
- **Dependencia de LeRobot**: el modelo requiere la infraestructura de LeRobot para entrenar y evaluar, lo que añade una capa de complejidad en la integración.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/joelsung/act_so101_orange)
- [Dataset asociado (joelsung/so101_orange_pickplace)](https://huggingface.co/datasets/joelsung/so101_orange_pickplace)
- [Paper original de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Modelo similar: Choikichang/act_so101_orange_500](https://huggingface.co/Choikichang/act_so101_orange_500)
- [Modelo similar: aiden-li/so101-act](https://huggingface.co/aiden-li/so101-act)
- [Guía de sim-to-real de NVIDIA para SO-101](https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/datasets-and-models.html)
- [DreamZero-SO101, world model para SO-101](https://vizuara-ai-lab.github.io/dreamzero-so101/index.html)
