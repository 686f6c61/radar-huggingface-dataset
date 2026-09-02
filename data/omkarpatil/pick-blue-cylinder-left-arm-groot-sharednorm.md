# omkarpatil/pick-blue-cylinder-left-arm-groot-sharednorm

## Resumen

El modelo `omkarpatil/pick-blue-cylinder-left-arm-groot-sharednorm` es un fine-tune del modelo fundacional de robótica `nvidia/GR00T-N1.7-3B`, desarrollado por Omkar Patil para la plataforma bimanual ROBOTIS FFW SG2 Rev1. Se trata de un modelo de tipo Vision-Language-Action (VLA) que recibe imágenes de cámaras y una instrucción en lenguaje natural ("Pick up the blue cylinder") y genera acciones de articulaciones para el brazo izquierdo del robot. El fine-tune se ha realizado con la receta "shared-norm", que unifica la normalización de las estadísticas de observación y acción entre un grupo de tres tareas relacionadas, permitiendo componer las políticas en el espacio de puntuaciones.

El modelo tiene 3.144.016.000 parámetros (3,14 B), de los cuales 1,62 B son entrenables, y se distribuye en pesos fp32 en formato safetensors (≈12,6 GB). Está entrenado sobre 26 episodios y 4.666 frames de la tarea de recoger un cilindro azul con el brazo izquierdo, a 15 fps y con un horizonte de acción de 16 pasos (≈1,07 s). La licencia es Apache-2.0, lo que permite uso comercial y modificación. Su relevancia radica en que demuestra un enfoque de composición de políticas robóticas mediante normalización compartida, una técnica que facilita la combinación de habilidades entrenadas por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en transformer, backbone Cosmos-Reason2-2B vía Qwen3-VL (según repositorio NVIDIA Isaac-GR00T) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos fp32) |
| Idiomas soportados | no disponible (instrucción en inglés en el entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GR00T N1.7 de NVIDIA, un VLA que combina un backbone de visión-lenguaje (Cosmos-Reason2-2B, integrado vía Qwen3-VL) con un módulo de acción que predice trayectorias de articulaciones. En este fine-tune, el backbone se mantiene congelado y solo se entrenan los módulos de acción (1,62 B parámetros entrenables). La entrada incluye tres cámaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) y el estado del robot (22 dimensiones: brazos, cabeza, elevador y odometría), mientras que la salida son 16 dimensiones de acción (articulaciones de ambos brazos, cabeza, elevador y odometría).

El entrenamiento se realizó con la receta "shared-norm", que calcula estadísticas de normalización (q01/q99 min-max con clipping al 2% de cola) agrupando los frames de tres tareas relacionadas (recoger cilindro con brazo izquierdo, con brazo derecho y handover). Esto produce un `statistics.json` idéntico (hash `c89d17a12a2d8642`) en los tres checkpoints, permitiendo componer sus puntuaciones directamente. Se usaron 20.000 pasos de optimización con learning rate 1e-4, warmup del 5%, weight decay 1e-5 y batch global de 32, alcanzando una pérdida final de 0,03555. La atención se implementó con PyTorch sdpa (no flash-attention-2) por limitaciones del host de entrenamiento, lo que afecta a la reproducibilidad bit a bit.

## Capacidades

- Ejecución de la tarea específica de recoger un cilindro azul con el brazo izquierdo del robot FFW SG2 Rev1, siguiendo la instrucción "Pick up the blue cylinder".
- Procesamiento de imágenes de tres cámaras (cabeza izquierda, muñeca izquierda y muñeca derecha) para percibir el entorno y localizar el objeto.
- Generación de acciones de articulaciones (16 dimensiones) con un horizonte de 1,07 segundos a 15 fps, adecuado para control en bucle cerrado.
- Composición con otros modelos del mismo grupo (derecha y handover) gracias a la normalización compartida, permitiendo combinar políticas en el espacio de puntuaciones.
- No incluye capacidades de chat, generación de texto general ni razonamiento simbólico; es un modelo puramente de control robótico.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede integrarse en un sistema de control para que el robot FFW SG2 Rev1 recoja objetos cilíndricos de una superficie, útil en entornos de investigación de robótica manipulativa.
- Composición de habilidades: al compartir normalización con los modelos de brazo derecho y handover, se pueden combinar las tres políticas para ejecutar secuencias complejas (recoger con un brazo, pasar a la otra mano, etc.) sin reentrenar.
- Benchmarking de VLA en plataformas bimanuales: sirve como referencia para comparar estrategias de normalización (shared-norm vs. no-norm) en fine-tunes de GR00T N1.7.
- Desarrollo de pipelines de aprendizaje por imitación: el flujo de datos (ROS 2 MCAP → conversión a 15 fps → estadísticas agrupadas) puede replicarse para otras tareas y robots.
- Evaluación de la transferencia de GR00T N1.7 a nuevos embodiments: este fine-tune demuestra la adaptación del modelo base a un robot con 22 dimensiones de estado y 16 de acción, con cámaras específicas.
- Investigación en composición de políticas: el hash compartido de estadísticas permite verificar la compatibilidad entre modelos del mismo grupo, un requisito para la composición segura en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (0,03555), que no es comparable con otros modelos debido a la escala de normalización compartida. No hay datos de éxito en tareas reales ni comparaciones con otros VLA.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos fp32 ocupan ≈12,6 GB, por lo que se recomienda al menos 16 GB de VRAM para cargar el modelo completo. Con cuantización (no disponible en el repo) se podría reducir, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: una A100-80GB (usada para entrenamiento) o GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) pueden alojar el modelo en fp32.
- No cabe en GPUs consumer de 8-12 GB sin cuantización.
- Opciones de despliegue: al ser un modelo LeRobot, se puede cargar con la librería `lerobot` y ejecutar en PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponibles. El entrenamiento tardó 4 horas en una A100-80GB, lo que sugiere que la inferencia es rápida (un paso de acción de 16 frames), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `omkarpatil/pick-blue-cylinder-left-arm-groot-sharednorm` | 3,14 B | no disponible | Recoger cilindro azul (brazo izquierdo) | Apache-2.0 | HuggingFace |
| `nvidia/GR00T-N1.7-3B` (base) | 3,14 B | no disponible | Generalista (múltiples tareas) | Apache-2.0 | HuggingFace |
| `nvidia/GR00T-N1.5` (versión anterior) | no disponible | no disponible | Generalista (humanoides) | no disponible | research.nvidia.com |

La comparativa es limitada porque este modelo es un fine-tune muy específico. Frente al modelo base GR00T N1.7, este fine-tune está especializado en una única tarea y plataforma, con normalización compartida para composición. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea (recoger cilindro azul con brazo izquierdo) y no generaliza a otros objetos, posiciones o instrucciones sin reentrenamiento.
- Depende de la plataforma ROBOTIS FFW SG2 Rev1; no es transferible a otros robots sin adaptar el embodiment y las estadísticas.
- La normalización compartida solo es válida dentro del grupo con el mismo hash (`c89d17a12a2d8642`); componer con modelos de otros grupos puede producir comportamientos incorrectos.
- El entrenamiento usó sdpa en lugar de flash-attention-2, por lo que los resultados pueden diferir ligeramente de una implementación con flash-attention.
- No incluye `optimizer.pt` ni checkpoints intermedios, por lo que no se puede reanudar el entrenamiento desde este repo.
- No se han publicado evaluaciones en el mundo real (simulación o robot físico), por lo que el rendimiento real no está verificado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base GR00T N1.7 también es Apache-2.0, sin restricciones adicionales conocidas.
- Riesgo de alucinación: al ser un modelo de acción, puede generar movimientos no deseados si la entrada visual o de estado difiere del dominio de entrenamiento; se recomienda supervisión humana en pruebas físicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/pick-blue-cylinder-left-arm-groot-sharednorm
- Dataset asociado: https://huggingface.co/datasets/omkarpatil/pick-blue-cylinder-left-arm
- Repositorio del autor: https://huggingface.co/omkarpatil/models
- Repositorio NVIDIA Isaac-GR00T (GitHub): https://github.com/NVIDIA/Isaac-GR00T
- Página de GR00T N1.5 (investigación): https://research.nvidia.com/labs/gear/gr00t-n1_5/
- Documentación de Isaac GR00T (VLA): https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/10-groot.html
