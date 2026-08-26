# leejaehot/piper-vita-hanyang-v2

## Resumen

El modelo `leejaehot/piper-vita-hanyang-v2` es una política de robótica basada en VITA (Vision-Action Transformer) diseñada para controlar un robot manipulador de un solo brazo Piper. Ha sido entrenado mediante aprendizaje por imitación sobre un conjunto de 100 demostraciones normalizadas, convertidas de 30 Hz a 10 Hz, correspondientes a la tarea de colocar un objeto (spam) dentro de una caja blanca. El autor, leejaehot, ha publicado este modelo como parte de un proyecto de investigación en robótica, probablemente en colaboración con la Universidad de Hanyang (HYU), como sugiere el nombre del dataset y el propio título del modelo.

La relevancia de este modelo reside en su aplicación directa en el campo del aprendizaje robótico por imitación, un área activa de investigación que busca transferir habilidades demostradas por humanos a robots. Al ser una política VITA, se espera que el modelo procese entradas visuales de dos cámaras (frontal y derecha) y genere acciones de control del brazo robótico a una frecuencia de 10 Hz. El modelo tiene aproximadamente 31,2 millones de parámetros, un tamaño relativamente compacto que lo hace adecuado para despliegues en sistemas embebidos o de bajo coste, aunque no se han publicado especificaciones detalladas de arquitectura interna ni de rendimiento.

A pesar de ser un modelo de nicho, su publicación en HuggingFace con formato safetensors y pipeline de robótica lo convierte en un recurso útil para investigadores y desarrolladores que trabajan con el robot Piper o que desean estudiar políticas VITA en tareas de manipulación de precisión. No obstante, la documentación disponible es muy limitada, y gran parte de los detalles técnicos (arquitectura exacta, proceso de entrenamiento, benchmarks) no están accesibles públicamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITA (Vision-Action Transformer) |
| Parametros totales | 31.215.718 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no aplicable (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no está documentada en la información disponible. Por el nombre "VITA" y el contexto de robot-learning, se trata de una política de visión-acción que probablemente emplea un transformer para procesar imágenes y generar acciones de control del robot. El modelo fue entrenado con 50.000 pasos sobre un dataset de 100 demostraciones normalizadas (transformadas de 30 Hz a 10 Hz) correspondientes a la tarea de colocar un objeto (spam) dentro de una caja blanca. El dataset se identifica como `oms524/place_spam_into_the_white_box_30hz_normalized` y fue capturado con dos cámaras (frontal y derecha). La frecuencia de control de salida es de 10 Hz, con un horizonte de acción de 4. No se han publicado detalles sobre el optimizador, la función de pérdida, ni si se emplearon técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Ejecución de tareas de manipulación robótica mediante imitación, específicamente la colocación de un objeto en una caja blanca con un robot Piper de un solo brazo.
- Procesamiento de entradas visuales de dos cámaras (frontal y derecha) para generar comandos de acción a 10 Hz.
- Control de acciones con un horizonte de 4 pasos temporales, lo que permite planificación a corto plazo en el movimiento del brazo.
- No se documentan capacidades de razonamiento general, generación de texto, visión semántica ni interacción multimodal más allá de la tarea de control.
- No se indica soporte de tool calling ni de agentes autónomos; el modelo está especializado en una tarea concreta de robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un sistema robótico Piper para colocar objetos pequeños (como latas) en contenedores, útil para validar algoritmos de aprendizaje por imitación.
- Investigación en robot-learning: sirve como punto de partida para comparar políticas VITA con otras arquitecturas (p. ej., Diffusión Policy) en tareas de manipulación de precisión.
- Desarrollo de sistemas de control en tiempo real: gracias a su frecuencia de 10 Hz y horizonte de acción corto, puede desplegarse en bucles de control de bajo nivel para robots de bajo coste.
- Generación de datos de entrenamiento para simulaciones: las acciones predichas por el modelo pueden utilizarse para generar trayectorias de referencia en entornos simulados (p. ej., MuJoCo o Isaac Sim).
- Estudio de transferencia de dominio: el modelo fue entrenado con datos normalizados de 30 Hz a 10 Hz, lo que permite investigar cómo afecta la frecuencia de muestreo al rendimiento de políticas robóticas.
- Evaluación de robustez visual: al usar dos cámaras, puede emplearse para probar la sensibilidad del control ante cambios de iluminación o posiciones de cámara en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, éxito de tarea ni comparación con otras políticas robóticas.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos para este modelo.
- Dado el tamaño de 31 millones de parámetros, podría ejecutarse en GPUs de consumo medio (p. ej., RTX 3060 con 12 GB VRAM) o incluso en CPU para inferencia, aunque la latencia dependería de la complejidad de la red y la resolución de las imágenes.
- El modelo se distribuye en formato PyTorch/safetensors, por lo que es compatible con frameworks de inferencia estándar (PyTorch, ONNX, etc.). No se mencionan herramientas de despliegue específicas como vLLM o llama.cpp, ya que no es un modelo de lenguaje.
- Para entrenamiento, se desconoce el hardware utilizado; se recomienda al menos una GPU con 16 GB de VRAM para reproducir el entrenamiento, pero no está confirmado.

## Comparativa con modelos similares

No se dispone de datos comparativos. Existe otro modelo del mismo autor, `leejaehot/piper-dp-hanyang-v1`, que parece ser una política de difusión para la misma tarea, pero no se publican especificaciones ni rendimiento comparado. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (colocar un objeto en una caja blanca) y no generaliza a otras tareas de manipulación sin reentrenamiento.
- El dataset de entrenamiento es pequeño (100 demostraciones) y específico de un entorno de laboratorio, lo que limita la robustez frente a variaciones de iluminación, texturas o posiciones de cámara.
- No se documenta la licencia de uso; debe asumirse que no está permitido su uso comercial sin permiso explícito del autor.
- No se han publicado análisis de sesgos ni de alucinación, aunque al ser un modelo de control no lingüístico, el riesgo de alucinación no es aplicable.
- La ausencia de especificaciones técnicas detalladas (arquitectura exacta, hiperparámetros, datos de entrenamiento completos) dificulta la reproducción y evaluación independiente.
- El modelo está en fase temprana de desarrollo (versión v2), por lo que puede presentar comportamientos inestables en entornos no controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leejaehot/piper-vita-hanyang-v2
- Dataset de entrenamiento (mencionado en la model card): `oms524/place_spam_into_the_white_box_30hz_normalized` (no se ha encontrado URL pública)
- Modelo relacionado del mismo autor: https://huggingface.co/leejaehot/piper-dp-hanyang-v1
