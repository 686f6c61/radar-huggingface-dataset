# omkarpatil/ffw_sg2_blue-cylinder-handover-aug_dp_sharednorm_3cam

## Resumen

El modelo `ffw_sg2_blue-cylinder-handover-aug_dp_sharednorm_3cam` es una política de difusión (Diffusion Policy) entrenada con la librería LeRobot 0.6.1 para controlar un robot manipulador en la tarea de entrega de un cilindro azul (blue-cylinder-handover). Ha sido desarrollado por el usuario omkarpatil y está publicado bajo licencia Apache 2.0. Se trata de un modelo de aprendizaje por imitación que genera acciones de 16 dimensiones (brazos) a 15 Hz a partir de un estado de 22 dimensiones y tres imágenes de cámara de 224×224 píxeles. El repositorio ocupa 1.2 GB y contiene los pesos en formato safetensors.

La relevancia de este modelo radica en que es un ejemplo de implementación de Diffusion Policy con LeRobot, con una configuración de normalización compartida (shared-norm) y tres cámaras. Está orientado a la investigación en robótica y al estudio de políticas de control basadas en difusión, especialmente en tareas de manipulación y entrega de objetos. No se dispone de información sobre el número de parámetros ni sobre el contexto, ya que no es un modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot 0.6.1, valores por defecto) |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de control robótico) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales de la configuración:

| Parámetro | Valor |
|---|---|
| Tarea | blue-cylinder-handover (entrega de cilindro azul) |
| Entorno | FFW SG2 rev1 |
| Observaciones | Estado 22-D + 3 cámaras (cam_left_head y ambas muñecas), 224×224 |
| Acciones | 16-D (brazos) |
| Frecuencia de control | 15 Hz |
| Normalización | MIN_MAX |
| Configuración de observación | n_obs_steps=1 (un solo fotograma en inferencia) |
| Pasos de entrenamiento | 100 000 |
| Checkpoint | 100000/ (pretrained_model) |
| Librería | LeRobot 0.6.1 |
| Tamaño del repositorio | 1.2 GB |

## Arquitectura y entrenamiento

El modelo utiliza una política de difusión (Diffusion Policy), una arquitectura de aprendizaje por imitación que genera secuencias de acciones mediante un proceso de denoising. En lugar de predecir directamente la acción, el modelo aprende a reconstruir la acción a partir de ruido, condicionado por las observaciones. En este caso, las observaciones son un estado de 22 dimensiones y tres imágenes de 224×224 píxeles procedentes de una cámara en la cabeza y dos cámaras en las muñecas. La salida es una acción de 16 dimensiones para los brazos, a una frecuencia de 15 Hz.

El entrenamiento se realizó con la librería LeRobot 0.6.1, con los valores por defecto y `n_obs_steps=1` (single-frame runtime), durante 100 000 pasos. La normalización de las observaciones y acciones es de tipo MIN_MAX. El modelo forma parte de un grupo de composición B, cuyas estadísticas de normalización están congeladas: se calculan a partir de los datos de pick izquierdo/derecho y handover, y no cambian a pesar de haber añadido 43 episodios adicionales de handover-play. El autor verifica que el normalizador es idéntico entre los miembros del grupo en los checkpoints guardados. No se menciona el uso de RLHF ni DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Generación de acciones de control para manipulación robótica: produce acciones de 16 dimensiones para los brazos a 15 Hz.
- Percepción multimodal: procesa tres imágenes de cámara (cam_left_head y dos muñecas) a 224×224, junto con un estado de 22 dimensiones.
- Aprendizaje por imitación: la política ha sido entrenada con demostraciones para la tarea de entrega de un cilindro azul.
- Inferencia en un solo fotograma: `n_obs_steps=1` permite ejecutar el modelo en tiempo real sin necesidad de una ventana temporal larga.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No es un modelo de lenguaje, por lo que no tiene capacidades multilingües ni de generación de texto.
- No es un modelo de visión general; su percepción está limitada a las entradas específicas de la tarea.

## Casos de uso

- Investigación en aprendizaje por imitación: utilizar el modelo como base para estudiar la transferencia de políticas entre tareas de pick-and-place y handover en el mismo robot.
- Benchmarking de políticas de difusión: comparar el rendimiento de esta política con otras arquitecturas como SmolVLA o Groot-N1.7 en el entorno FFW SG2 rev1.
- Desarrollo de robots de servicio: integrar la política en un brazo robótico FFW SG2 para tareas de entrega de objetos en entornos de laboratorio controlados.
- Educación en robótica: emplear el checkpoint como ejemplo práctico de entrenamiento y despliegue de Diffusion Policy con LeRobot.
- Estudio de normalización en robótica: analizar el efecto de compartir estadísticas de normalización entre cámaras y de congelarlas frente a la incorporación de nuevos episodios de entrenamiento.
- Investigación en composición de datos: evaluar cómo la adición de episodios de handover-play afecta al rendimiento cuando las estadísticas de normalización permanecen congeladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se puede cargar con la librería LeRobot en Python, pero no se especifican integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Se han identificado dos modelos del mismo autor para el mismo entorno FFW SG2 rev1:

| Modelo | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| ffw_sg2_blue-cylinder-handover-aug_dp_sharednorm_3cam | Diffusion Policy | blue-cylinder-handover | Apache 2.0 | HuggingFace |
| ffw_sg2_blue-cylinder-handover_smolvla_nonorm | SmolVLA | blue-cylinder-handover | no disponible | HuggingFace |
| ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7 | Groot-N1.7 | pick-blue-cylinder-left-arm | no disponible | HuggingFace |

No se dispone de información sobre parámetros, contexto ni benchmarks para realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea muy específica (entrega de cilindro azul) en un entorno concreto (FFW SG2 rev1); no es generalizable a otras tareas sin reentrenamiento.
- La configuración `n_obs_steps=1` limita la información temporal disponible, lo que puede provocar fallos en movimientos que requieran memoria de pasos anteriores.
- Las estadísticas de normalización congeladas del grupo de composición B pueden no adaptarse a nuevos datos fuera de la distribución original.
- No se han publicado métricas de rendimiento, por lo que no es posible evaluar la calidad de la política ni su robustez.
- El modelo puede ser sensible a cambios en la iluminación, la posición del objeto o la calibración de las cámaras, ya que no se especifica un entrenamiento robusto a estas variaciones.
- La licencia Apache 2.0 permite el uso comercial, pero exige mantener el aviso de licencia y las atribuciones correspondientes.

## Enlaces

- HuggingFace: https://huggingface.co/omkarpatil/ffw_sg2_blue-cylinder-handover-aug_dp_sharednorm_3cam
- Modelo SmolVLA del mismo autor: https://huggingface.co/omkarpatil/ffw_sg2_blue-cylinder-handover_smolvla_nonorm
- Modelo Groot-N1.7 del mismo autor: https://huggingface.co/omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7
