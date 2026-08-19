# junshin02/smolvla_so101_v2trim_aug_b16

## Resumen

El modelo `junshin02/smolvla_so101_v2trim_aug_b16` es un fine-tuning del modelo base `lerobot/smolvla_base`, un vision-language-action (VLA) compacto desarrollado por Hugging Face con 450 millones de parámetros. Está diseñado para control robótico en tareas de manipulación, concretamente para la tarea de recoger un cubo verde y colocarlo en una caja utilizando un robot SO-101. Este modelo se distribuye bajo licencia Apache-2.0 y se integra con el ecosistema LeRobot para entrenamiento e inferencia.

La relevancia de este modelo radica en que SmolVLA ofrece un rendimiento competitivo en tareas de robótica con un coste computacional reducido, permitiendo su despliegue en hardware de consumo. Este fine-tuning específico está entrenado sobre un dataset propio de 50 episodios con 23.985 fotogramas, lo que lo convierte en un ejemplo práctico de adaptación de un modelo fundacional a una tarea concreta de pick-and-place. Su tamaño reducido (450 M de parámetros) lo hace accesible para desarrolladores e investigadores que no disponen de infraestructura de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (transformador multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (solo se menciona safetensors) |
| Idiomas soportados | no disponible (la tarea esta en ingles, pero no se documenta soporte multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual, un modelo de lenguaje y un "action expert" para generar comandos de control del robot. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face, y este fine-tuning se realizó con LeRobot (versión 0.6.0) sobre el dataset `junshin02/so101_pickplace_v2trim`. El dataset contiene 50 episodios con 23.985 fotogramas a 30 FPS, con dos cámaras (frontal y muñeca) y la tarea "Pick up the green cube and place it in the box". La configuración de entrenamiento incluye 45.000 pasos, batch size de 16, optimizador AdamW con learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF ni DPO; se trata de un entrenamiento supervisado de imitación (behavior cloning).

## Capacidades

- Generación de acciones de control robótico: el modelo toma como entrada imágenes de múltiples cámaras (3 vistas de 256x256), el estado del robot (vector de 6 dimensiones) y una instrucción en lenguaje natural, y produce un vector de acción de 6 dimensiones.
- Soporte de instrucciones en lenguaje natural para especificar la tarea (por ejemplo, "recoge el cubo verde y colócalo en la caja").
- Específico para tareas de pick-and-place en el robot SO-101; no se documentan capacidades de tool calling, agentes o razonamiento multi-paso fuera del ámbito robótico.
- Capacidades multilingües no documentadas; la instrucción está en inglés.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede controlar un brazo robótico SO-101 para recoger objetos y colocarlos en posiciones definidas, reduciendo la intervención humana en entornos industriales repetitivos.
- Prototipado rápido de políticas robóticas: al ser un fine-tuning de un modelo base, los desarrolladores pueden usarlo como punto de partida para adaptar SmolVLA a nuevas tareas con pocos datos, gracias a su tamaño compacto y compatibilidad con LeRobot.
- Investigación en aprendizaje por imitación: sirve como ejemplo de entrenamiento de un VLA con un dataset pequeño (50 episodios), útil para estudiar la generalización y el sobreajuste en robótica.
- Educación y demostraciones: su bajo coste computacional permite ejecutarlo en hardware de consumo, facilitando su uso en laboratorios docentes o proyectos de robótica a pequeña escala.
- Integración en sistemas de control en tiempo real: la inferencia puede ejecutarse en bucle cerrado con el robot, como se muestra en el comando `lerobot-rollout` de la documentación, con una duración configurable.
- Benchmarking de VLA en tareas específicas: al no tener resultados de evaluación publicados, este modelo puede utilizarse como referencia para comparar el rendimiento de otros VLA en la misma tarea y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo tiene 450 M de parámetros, lo que sugiere un consumo moderado, pero no se proporcionan cifras exactas).
- GPU recomendadas: no especificadas en la documentación; SmolVLA está diseñado para hardware de consumo, por lo que GPUs como RTX 3060 o superiores podrían ser suficientes, pero no se confirma.
- Si cabe en consumer GPU: sí, según la descripción del modelo base, pero no se detalla la VRAM mínima.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), con soporte para ejecución en bucle cerrado con el robot SO-101. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. Aunque existen otros VLA como OpenVLA (7B) o RT-2, no se dispone de datos comparativos de rendimiento ni de características específicas en la información proporcionada. Este modelo es un fine-tuning de SmolVLA, que se distingue por su tamaño reducido y su enfoque en hardware de consumo, pero no se pueden establecer comparaciones cuantitativas sin datos adicionales.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que el rendimiento real en el robot no está verificado.
- El dataset de entrenamiento es pequeño (50 episodios), lo que aumenta el riesgo de sobreajuste a las condiciones específicas del entorno de captura (posición de objetos, iluminación, etc.).
- La tarea está muy acotada (recoger un cubo verde y colocarlo en una caja); el modelo no generaliza a otras tareas u objetos sin un fine-tuning adicional.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos de un único entorno, puede fallar ante variaciones no vistas.
- Riesgo de alucinación en acciones: al ser un modelo de control, podría generar acciones no válidas si las condiciones de entrada difieren de las de entrenamiento, aunque no se ha evaluado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo está vinculado al hardware SO-101 y a las cámaras específicas; su uso en otros robots requeriría adaptación.
- No se especifica la longitud de contexto ni los idiomas soportados, lo que limita su uso en escenarios multilingües o con instrucciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junshin02/smolvla_so101_v2trim_aug_b16
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/junshin02/so101_pickplace_v2trim
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Página oficial de SmolVLA: https://smolvla.net/index_en
