# Chaenn/act_policy_so101_cube_place_dirty300sim_real_0908_1170

## Resumen

El modelo Chaenn/act_policy_so101_cube_place_dirty300sim_real_0908_1170 es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por el usuario Chaenn con la librería LeRobot de Hugging Face. ACT es un método propuesto en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705) que predice tramos cortos de acciones en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación robótica. Este modelo concreto se entrena para la tarea de colocar un cubo (cube placement) sobre el robot SO101, combinando datos simulados y reales. Cuenta con 51.668.614 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Aunque su tamaño es reducido, la política está especializada en una tarea concreta, lo que la hace útil para investigación en aprendizaje por imitación y para transferencia de simulación a real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | No aplica (modelo de robótica sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura de transformer para aprendizaje por imitación que genera "chunks" de acción: dado un conjunto de observaciones (por ejemplo, imágenes y estado del robot), predice una secuencia de varias acciones futuras. En la implementación de LeRobot, el modelo combina un encoder visual de tipo ResNet con un transformer que actúa como decodificador de acciones. El entrenamiento se realiza mediante demostraciones teleoperadas incluidas en el dataset Chaenn/so101_cube_place_dirty300sim_real_0908_1170, que mezcla entornos simulados y un conjunto real (según el nombre del dataset). No se han proporcionado detalles sobre el número de tokens de entrenamiento ni sobre la composición completa del dataset. Tampoco se ha indicado el uso de RLHF ni DPO; el modelo se entrena con objetivos de imitación clásicos.

## Capacidades

- Predicción de secuencias de acción (chunks) para el robot SO101, incluyendo movimientos del efector final.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, con datos simulados y reales combinados.
- Ejecución de la tarea de colocación de cubos en el robot SO101 a través de LeRobot.
- Inferencia en tiempo de ejecución mediante el comando `lerobot-record` con un robot tipo `so100_follower`.
- No soporta tool calling, razonamiento multi-paso, ni procesamiento de lenguaje.

## Casos de uso

- Automatización de tareas de ensamblaje: el modelo actúa como una política de bajo nivel que coloca objetos en posiciones objetivo, adecuada para células robóticas de investigación.
- Transferencia simulación a real: al estar entrenado con datos mixtos, permite evaluar cómo una política aprendida en simulación se comporta en un robot físico.
- Benchmarking de métodos de imitación: sirve como referencia para comparar ACT con otros algoritmos como Diffusion Policy en la misma tarea de colocación de cubos.
- Investigación en manipulación con robots de bajo coste: el robot SO101 es asequible y la política puede reutilizarse como base para extender comportamientos.
- Generación de nuevos datasets de demostración: al ejecutar la política en el robot, se pueden capturar nuevos episodios mediante LeRobot y ampliar el dataset original.
- Educación en robótica: en cursos avanzados, los estudiantes pueden desplegar la política en un robot SO101 real para practicar control por imitación y entender los límites de la generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los parámetros en FP32 ocupan aproximadamente 207 MB; en FP16 o BF16, alrededor de 103 MB. Con el overhead de PyTorch y la captura de imágenes, se recomiendan al menos 1-2 GB de VRAM.
- GPU recomendada: cualquier GPU dedicada con 2 GB o más de VRAM, como una NVIDIA RTX 3060, RTX 4090 o T4.
- Cabe en GPUs de consumo: sí, el modelo es lo suficientemente pequeño como para ejecutarse en tarjetas como RTX 3060 o superiores.
- También se puede ejecutar en CPU para pruebas no críticas, aunque se recomienda GPU para control robótico en tiempo real.
- Opciones de despliegue: LeRobot con PyTorch (para entrenamiento e inferencia) y Hugging Face Hub para distribución de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Chaenn/act_policy_so101_cube_place_dirty300sim_real_0908_1170 | 51.668.614 | No disponible | Colocación de cubo en robot SO101 | Apache 2.0 |
| Chaenn/act_policy_so101_cube_multitask_real_sim_0824 | No disponible | No disponible | Multitarea de cubo en robot SO101 | Apache 2.0 |
| Chaenn/act_policy_so101_cube_multitask_realsim_0827 | No disponible | No disponible | Multitarea de cubo en robot SO101 | Apache 2.0 |

## Limitaciones y advertencias

- La política está entrenada específicamente para la tarea de colocación de cubos en el robot SO101; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- El dataset incluye un conjunto "dirty300sim_real" que podría contener datos ruidosos, lo que puede afectar al rendimiento en entornos muy diferentes a los del entrenamiento.
- No es un modelo de lenguaje: no procesa texto ni genera respuestas en lenguaje natural.
- No se han publicado evaluaciones formales en benchmarks estandarizados de robótica, por lo que su rendimiento en condiciones de producción no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero los autores no ofrecen garantías de seguridad ni de fiabilidad en entornos de producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Chaenn/act_policy_so101_cube_place_dirty300sim_real_0908_1170
- Artículo original: https://arxiv.org/abs/2304.13705
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelos relacionados:
  - https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_real_sim_0824
  - https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_realsim_0827
