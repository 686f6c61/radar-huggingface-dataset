# omkarpatil/move-soft-toy-right-groot-sharednorm

## Resumen

Este modelo es un fine-tune del VLA (Vision-Language-Action) `nvidia/GR00T-N1.7-3B` de NVIDIA, adaptado para ejecutar la tarea de mover un juguete suave hacia la derecha con el brazo robótico ROBOTIS FFW SG2 Rev1. Ha sido desarrollado por Omkar Patil y publicado bajo licencia Apache 2.0, utilizando la librería LeRobot para el entrenamiento y la inferencia. El interés de este modelo radica en que forma parte de un grupo de composición (grupo C) donde varios fine-tunes comparten las mismas estadísticas de normalización, lo que permite combinar políticas entrenadas por separado sin necesidad de reentrenamiento. Con 3.144 millones de parámetros y un tamaño de repositorio de 12,6 GB (fp32), es un modelo denso orientado exclusivamente a la robótica de manipulación, no a tareas de lenguaje general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en transformer (modelo base: nvidia/GR00T-N1.7-3B) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (procesa imágenes y estado del robot, no texto) |
| Tipos de cuantizacion | no disponible (pesos en fp32 según tamaño del repo) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del VLA GR00T N1.7-3B de NVIDIA, que combina visión, lenguaje y acción para control robótico. La arquitectura interna del modelo base no se detalla en la información proporcionada, pero se trata de un transformer multimodal que procesa imágenes de tres cámaras (izquierda de cabeza, muñeca izquierda y muñeca derecha) junto con el estado del robot (22 dimensiones) y genera acciones de 16 pasos (16 dimensiones por paso) a 15 fps, lo que equivale a un chunk de acción de aproximadamente 1,07 segundos.

El entrenamiento se realizó con la receta estándar de GR00T, sin parches de código, sobre 21 episodios y 2.674 frames. Se aplicó normalización min-max por percentiles (q01/q99) a [-1, 1] con recorte de valores atípicos, y se usó precisión fp32. El entrenamiento duró 20.000 pasos con learning rate 1e-4, warmup del 5%, weight decay 1e-5 y batch size 32, alcanzando una pérdida final de 0,042. La atención se implementó con PyTorch sdpa en lugar de flash-attention-2 por restricciones del sistema, aunque ambos métodos son equivalentes en precisión. El modelo se publica solo para inferencia, sin estado de optimizador ni checkpoints intermedios.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones de 16 pasos para mover un objeto (juguete suave) hacia la derecha.
- Percepción visual multimodal: procesa simultáneamente tres vistas de cámara (cabeza izquierda, muñeca izquierda, muñeca derecha).
- Integración con el brazo ROBOTIS FFW SG2 Rev1: utiliza un espacio de estado de 22 dimensiones y un espacio de acción de 16 dimensiones.
- Composición de políticas: al pertenecer al grupo C con normalización compartida (hash `a9a2b7939222c30e`), puede combinarse con el modelo `move-soft-toy-left` para ejecutar ambas tareas de forma secuencial o condicional.
- Inferencia en tiempo real: opera a 15 fps con un chunk de acción de ~1,07 segundos, adecuado para control en bucle cerrado.
- No incluye capacidades de lenguaje, generación de texto, tool calling ni razonamiento simbólico; es un modelo puramente motor.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios de robótica: el modelo puede integrarse en un sistema LeRobot para que un brazo FFW SG2 Rev1 mueva objetos blandos de forma autónoma, útil en experimentos de agarre y desplazamiento.
- Entrenamiento de políticas componibles: gracias a la normalización compartida del grupo C, se pueden combinar este modelo con el de `move-soft-toy-left` para crear un repertorio de comportamientos sin reentrenar, ideal para entornos de investigación en aprendizaje por refuerzo.
- Benchmarking de VLA en hardware real: sirve como punto de partida para evaluar el rendimiento de GR00T N1.7-3B en tareas específicas, comparando la pérdida de entrenamiento y la tasa de éxito en el robot físico.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede generar acciones de referencia que un operador humano puede supervisar o corregir, reduciendo la carga cognitiva en entornos de demostración.
- Pruebas de robustez frente a variaciones de iluminación y perspectiva: al usar tres cámaras, se puede estudiar cómo afectan los cambios en el entorno a la precisión del movimiento, útil para calibrar sistemas de visión.
- Educación en robótica: como ejemplo de fine-tune de un VLA con LeRobot, permite a estudiantes reproducir el pipeline de entrenamiento y entender el impacto de la normalización en la composición de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida final de entrenamiento (0,042), que no es comparable con otros modelos sin un protocolo de evaluación estandarizado. No se dispone de tasas de éxito en el robot real, tiempos de inferencia ni comparaciones con otros VLA.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 12,6 GB, por lo que se necesita al menos 16 GB de VRAM para cargar el modelo sin cuantización. Si se convierte a bf16 (6,3 GB) o int8 (3,2 GB), podría ejecutarse en GPUs con menos memoria, pero no se proporcionan versiones cuantizadas.
- GPU recomendadas: para fp32, una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) es suficiente. Para bf16, una RTX 3080 (10 GB) o superior podría ser viable.
- Despliegue: el modelo está diseñado para usarse con la librería LeRobot, que gestiona la carga de pesos, la inferencia y la comunicación con el robot. No se mencionan otros frameworks como vLLM o TGI, que no son aplicables a modelos de robótica.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño del modelo y el uso de sdpa, se espera una inferencia en tiempo real a 15 fps en una GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omkarpatil/move-soft-toy-right-groot-sharednorm | 3,14B | no disponible | Mover juguete suave a la derecha (FFW SG2 Rev1) | Apache 2.0 | Hugging Face |
| omkarpatil/move-soft-toy-left-groot-sharednorm | 3,14B | no disponible | Mover juguete suave a la izquierda (FFW SG2 Rev1) | Apache 2.0 | Hugging Face |
| nvidia/GR00T-N1.7-3B | 3,14B | no disponible | VLA general para manipulación | Licencia NVIDIA (ver repositorio) | Hugging Face |

No se dispone de datos de rendimiento comparativo (tasa de éxito, precisión) entre estos modelos. La principal diferencia entre los dos fine-tunes es la dirección del movimiento y las estadísticas de normalización, que son idénticas dentro del grupo C para permitir composición.

## Limitaciones y advertencias

- Es un modelo de inferencia exclusiva: no incluye estado de optimizador ni checkpoints intermedios, por lo que no puede reanudarse el entrenamiento.
- Dependencia del hardware específico: está entrenado para el brazo ROBOTIS FFW SG2 Rev1 con una configuración de cámaras concreta; usarlo en otro robot o con otra disposición de sensores requerirá reentrenamiento o adaptación.
- Riesgo de acciones inseguras: como todo modelo de control robótico, puede generar movimientos erráticos o colisiones si el entorno difiere del de entrenamiento. Es imprescindible supervisión humana y mecanismos de parada de emergencia en pruebas reales.
- Sin capacidades de lenguaje: no puede interpretar instrucciones verbales ni generar explicaciones; su entrada se limita a imágenes y estado del robot.
- Normalización compartida solo dentro del grupo C: combinar este modelo con otros grupos (push, pick-handover, soft-toy) no es válido y puede producir acciones incorrectas.
- Licencia del modelo base: aunque el fine-tune es Apache 2.0, el modelo base GR00T N1.7-3B tiene su propia licencia de NVIDIA que puede imponer restricciones adicionales para uso comercial. Se recomienda revisar los términos del repositorio base.
- Sin datos de robustez: no se han publicado pruebas de generalización a nuevos objetos, iluminación o posiciones de cámara, por lo que su rendimiento fuera del conjunto de entrenamiento es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omkarpatil/move-soft-toy-right-groot-sharednorm
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Modelo gemelo del grupo C (move-soft-toy-left): https://huggingface.co/omkarpatil/move-soft-toy-left-groot-sharednorm
- Perfil del autor: https://huggingface.co/omkarpatil/models
