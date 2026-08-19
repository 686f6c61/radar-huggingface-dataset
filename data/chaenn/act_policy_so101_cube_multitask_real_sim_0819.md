# Chaenn/act_policy_so101_cube_multitask_real_sim_0819

## Resumen

Este modelo es una política de control robótico basada en Action Chunking with Transformers (ACT), entrenada por Chaenn para el brazo robótico SO-101. Se trata de un sistema de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite una manipulación más suave y robusta en tareas de pick-and-place y manipulación de cubos. El modelo ha sido entrenado con datos teleoperados que combinan entornos simulados y reales, y se distribuye a través del ecosistema LeRobot de Hugging Face.

La relevancia de este modelo radica en su aplicación práctica de transferencia sim-to-real: demuestra cómo una política entrenada con datos mixtos (simulación y realidad) puede ejecutar tareas de manipulación en un robot físico SO-101. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios de robótica y desarrolladores que trabajan con brazos articulados de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones visuales y estados del robot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, descrita en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arxiv:2304.13705). ACT utiliza un transformer que condiciona la generación de acciones en observaciones visuales (imágenes de cámaras) y estados del robot (posición de las articulaciones). En lugar de predecir una sola acción, el modelo genera un chunk de acciones futuras (típicamente de 50 a 100 pasos), lo que reduce la acumulación de errores y mejora la estabilidad del movimiento.

El entrenamiento se realizó con el framework LeRobot, utilizando el dataset `Chaenn/so101_cube_multitask_real_sim_0819_fixed`, que combina demostraciones teleoperadas en simulación (probablemente con Isaac Sim) y en el robot real SO-101. No se especifica el número exacto de épocas, el tamaño del dataset ni si se aplicaron técnicas de aumento de datos. Al ser un método de aprendizaje por imitación, no se emplearon técnicas de RLHF ni DPO; el entrenamiento es supervisado directamente sobre las demostraciones.

## Capacidades

- Control robótico de un brazo SO-101 para tareas de manipulación de cubos (pick-and-place, reposicionamiento).
- Ejecución de acciones multi-paso mediante la predicción de chunks de acción, lo que permite movimientos fluidos y coordinados.
- Generalización entre entornos simulados y reales gracias al entrenamiento con datos mixtos (sim-to-real).
- Integración con el ecosistema LeRobot, lo que facilita la evaluación, el registro de episodios y el despliegue en robots compatibles.
- No soporta tool calling, agentes conversacionales ni procesamiento de lenguaje natural; es exclusivamente una política de control motor.

## Casos de uso

- Automatización de tareas repetitivas en laboratorio: el modelo puede gestionar la manipulación de cubos o viales en entornos de investigación, liberando a los operarios de tareas monótonas. Gracias a su entrenamiento sim-to-real, es adecuado para entornos donde la simulación permite iterar rápidamente antes de desplegar en el robot físico.
- Prototipado rápido de políticas robóticas: investigadores pueden utilizar este modelo como punto de partida para entrenar nuevas tareas con LeRobot, aprovechando la arquitectura ACT probada y los pesos preentrenados.
- Educación y formación en robótica: al ser un modelo compacto y de código abierto (Apache 2.0), es ideal para cursos universitarios donde los estudiantes aprenden a entrenar y desplegar políticas de aprendizaje por imitación en hardware de bajo coste como el SO-101.
- Evaluación de transferencia sim-to-real: el modelo sirve como referencia para estudiar cómo las políticas entrenadas en simulación se comportan en el mundo real, un problema central en robótica. Los desarrolladores pueden comparar el rendimiento de este modelo con otras variantes (por ejemplo, las versiones 0716 o 0710 del mismo autor).
- Integración en pipelines de control industrial a pequeña escala: para tareas de clasificación o ensamblaje ligero, el modelo puede ejecutarse en tiempo real en una GPU de consumo, permitiendo su uso en celdas de trabajo compactas sin necesidad de hardware especializado.
- Investigación en aprendizaje por imitación: el modelo y su dataset asociado proporcionan un banco de pruebas para estudiar el efecto del chunking de acciones, la robustez frente a perturbaciones y la influencia de los datos mixtos en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de éxito, tasas de acierto ni comparaciones cuantitativas con otros modelos en la model card. Para evaluar su rendimiento, sería necesario ejecutar el modelo en el robot SO-101 siguiendo las instrucciones de LeRobot (por ejemplo, con `lerobot-record` y 10 episodios de evaluación).

## Requisitos de hardware

- VRAM estimada para inferencia: al tener ~51,7 millones de parámetros, el modelo es ligero. En precisión FP32 ocuparía aproximadamente 207 MB de memoria, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. Con cuantización (si estuviera disponible) podría reducirse aún más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, por ejemplo RTX 2060 o superior. También puede ejecutarse en CPU, aunque la inferencia sería más lenta (la latencia exacta no está disponible).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja como la GTX 1650 o la RTX 3050.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Para despliegue en tiempo real se recomienda una GPU NVIDIA y el uso de `lerobot-record` para evaluación.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia de pocos milisegundos por paso de control en una GPU moderna, pero esto depende del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Autor | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| act_policy_so101_cube_multitask_real_sim_0819 (este) | Chaenn | 51,7 M | no aplica | Manipulación de cubos SO-101 (sim+real) | Apache 2.0 |
| act_policy_so101_cube_multitask_0716 | Chaenn | no disponible | no aplica | Manipulación de cubos SO-101 | Apache 2.0 |
| act_policy_so101_cube_multitask_0710 | Chaenn | no disponible | no aplica | Manipulación de cubos SO-101 | Apache 2.0 |

Los tres modelos pertenecen al mismo autor y comparten la misma arquitectura ACT y el mismo robot. La diferencia principal es la fecha de entrenamiento y probablemente la composición del dataset (el modelo actual incluye datos reales y simulados, mientras que los anteriores podrían ser solo simulados, aunque no se especifica). No se dispone de métricas comparativas entre ellos.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el robot SO-101 y la tarea de manipulación de cubos. No es transferible directamente a otros robots o tareas sin un reentrenamiento completo.
- Al ser un método de aprendizaje por imitación, su rendimiento depende en gran medida de la calidad y diversidad de las demostraciones. Si las demostraciones tienen sesgos o errores, el modelo los replicará.
- No se han publicado evaluaciones formales de robustez ante perturbaciones, cambios de iluminación o variaciones en la posición de los objetos. Su comportamiento en condiciones no vistas podría degradarse.
- El dataset combina datos reales y simulados, pero no se detalla la proporción ni si se aplicó algún método de regularización para evitar el desajuste sim-to-real. Esto podría afectar la generalización en entornos reales no contemplados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y de los componentes de hardware del SO-101, cuyos términos de uso deben verificarse por separado.
- No se proporcionan instrucciones de seguridad ni certificaciones para uso en entornos industriales de alto riesgo. Se recomienda supervisión humana durante el despliegue inicial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_real_sim_0819
- Dataset asociado: https://huggingface.co/datasets/Chaenn/so101_cube_multitask_real_sim_0819_fixed
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelo similar (versión 0716): https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_0716
- Modelo similar (versión 0710): https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_0710
- Taller sim-to-real SO-101 (NVIDIA): https://github.com/isaac-sim/Sim-to-Real-SO-101-Workshop
- Implementación de referencia de ACT para SO-101: https://github.com/Jaskaran3010/so101-act-policy
