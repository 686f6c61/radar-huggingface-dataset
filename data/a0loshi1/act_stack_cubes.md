# a0loshi1/act_stack_cubes

## Resumen

El modelo `a0loshi1/act_stack_cubes` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por Altin Loshi y publicada en Hugging Face bajo licencia Apache-2.0. Está entrenada para ejecutar la tarea de apilar un cubo rojo sobre un cubo azul usando un robot tipo SO-100 (so_follower) con dos cámaras (frontal y de muñeca). El modelo fue entrenado con el framework LeRobot (versión 0.6.1) y el dataset `a0loshi1/stack_cubes_v3_rgb`, que contiene 51 episodios teleoperados con 45.820 fotogramas a 30 FPS.

ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en ser un ejemplo práctico de entrenamiento de políticas robóticas con datos teleoperados, reproducible con herramientas open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (tarea de robótica, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer para predecir un chunk de acciones futuras (por ejemplo, 10-20 pasos) a partir de observaciones actuales. En este modelo, las observaciones consisten en el estado del robot (6 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara frontal y de muñeca). La salida es una acción de 6 dimensiones (posiciones articulares o comandos de movimiento).

El entrenamiento se realizó con el framework LeRobot, utilizando el dataset `a0loshi1/stack_cubes_v3_rgb` con 51 episodios teleoperados. La configuración de entrenamiento incluye 100.000 pasos, batch size de 32, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente de imitación supervisada. No se reportan innovaciones técnicas adicionales más allá del método ACT original.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de apilar un cubo rojo sobre un cubo azul con un robot SO-100.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (frontal y de muñeca) junto con el estado articular del robot.
- Predicción de acciones por chunks: genera secuencias de acciones coherentes en lugar de pasos individuales, lo que reduce la acumulación de errores.
- Aprendizaje por imitación: reproduce comportamientos teleoperados con alta fidelidad en la tarea específica.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- No incluye capacidades de tool calling, agentes, razonamiento simbólico ni procesamiento de lenguaje natural.

## Casos de uso

- Automatización de tareas de apilado en entornos de laboratorio: el modelo puede integrarse en un robot SO-100 para realizar apilado de cubos de forma autónoma, útil en investigación de manipulación robótica.
- Benchmark de aprendizaje por imitación: sirve como referencia para comparar métodos de imitación en tareas de precisión, gracias a su tamaño compacto y reproducibilidad.
- Prototipado rápido de políticas robóticas: al estar entrenado con LeRobot, permite iterar sobre el pipeline de recolección de datos y entrenamiento sin necesidad de hardware especializado.
- Educación en robótica: puede utilizarse en cursos de robótica y aprendizaje automático para demostrar el flujo completo de teleoperación, entrenamiento y despliegue.
- Evaluación de generalización: al ser una tarea específica, permite estudiar la robustez del modelo ante variaciones de iluminación, posición de objetos o perturbaciones.
- Base para fine-tuning: los pesos preentrenados pueden servir como punto de partida para tareas similares de manipulación con pocos datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de tasa de éxito, precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,7 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 200 MB de pesos). Es compatible con cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 1060 o superior, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU para pruebas, aunque con mayor latencia.
- Hardware robótico: requiere un robot SO-100 (so_follower) y dos cámaras compatibles con OpenCV (por ejemplo, webcams USB) configuradas a 640x480 y 30 FPS.
- Opciones de despliegue: el modelo se ejecuta mediante el comando `lerobot-rollout` de LeRobot, que gestiona la captura de imágenes, el control del robot y la inferencia. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo pequeño, la inferencia en GPU es del orden de milisegundos por paso, permitiendo control en tiempo real a 30 FPS.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas de apilado con ACT). El repositorio del autor incluye otros datasets y modelos relacionados (por ejemplo, `a0loshi1/stack_cubes_v2`), pero no se han publicado comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de un único entorno y robot, puede no generalizar a otros robots, iluminaciones o disposiciones de objetos.
- Riesgo de alucinación: no aplica, ya que no genera texto ni contenido simbólico; las salidas son comandos de control.
- Limitaciones de contexto: el modelo no procesa lenguaje ni contexto textual; su funcionamiento está restringido a la tarea de apilado con las cámaras y estado articular especificados.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios.
- Caveat para producción: no se han realizado evaluaciones formales de robustez ni seguridad. Antes de un despliegue en entornos reales, es necesario validar el comportamiento en condiciones variadas y considerar mecanismos de supervisión humana.
- Dependencia del hardware: el modelo requiere un robot SO-100 y cámaras específicas; no es un modelo autónomo de software, sino una política integrada en un sistema robótico físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a0loshi1/act_stack_cubes
- Dataset de entrenamiento: https://huggingface.co/datasets/a0loshi1/stack_cubes_v3_rgb
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Perfil del autor: https://huggingface.co/a0loshi1
