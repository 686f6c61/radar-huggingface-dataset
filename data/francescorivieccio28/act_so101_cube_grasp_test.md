# FrancescoRivieccio28/act_so101_cube_grasp_test

## Resumen

El modelo `act_so101_cube_grasp_test` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), entrenada para controlar un brazo robótico SO-101 en una tarea de pick-and-place. El modelo fue desarrollado por FrancescoRivieccio28 utilizando el framework LeRobot de Hugging Face, que facilita el entrenamiento y despliegue de políticas robóticas en hardware real.

ACT, presentado en el paper arxiv:2304.13705, predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la precisión y suavidad del movimiento en tareas de manipulación. Esta política concreta fue entrenada con 64 episodios teleoperados (25.938 frames a 30 FPS) para la tarea de recoger un cubo y colocarlo sobre un objetivo naranja. El modelo cuenta con 51,6 millones de parámetros y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo reside en su uso como ejemplo práctico del flujo de trabajo completo de LeRobot: recolección de datos por teleoperación, entrenamiento de una política ACT y posterior ejecución en el robot. Es un punto de partida útil para desarrolladores que quieren implementar aprendizaje por imitación en brazos robóticos de bajo coste como el SO-101, aunque no incluye evaluación en robot real ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (política robótica, sin contexto de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en Transformer diseñada específicamente para aprendizaje por imitación en robótica. En lugar de predecir una sola acción por paso de tiempo, el modelo genera un chunk de acciones futuras, lo que reduce la acumulación de errores y produce movimientos más coherentes. La entrada es multimodal: una imagen RGB de cámara de 480x640 píxeles y un vector de estado del robot de 6 dimensiones (posiciones articulares). La salida es un vector de acción de 6 dimensiones (targets articulares).

El entrenamiento se realizó con el dataset `FrancescoRivieccio28/lerobot_so101_cube_grasp_fixed`, que contiene 64 episodios teleoperados de la tarea "Pick up the cube and place it on the orange target". La configuración de entrenamiento fue de 100 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitación puro sobre datos teleoperados.

## Capacidades

- Control de brazo robótico SO-101 en tareas de pick-and-place: la política recibe la imagen de la cámara y el estado articular, y genera comandos de posición para los 6 motores del robot.
- Aprendizaje por imitación con chunks de acción: el modelo predice secuencias de acciones, lo que permite movimientos más suaves y robustos frente a perturbaciones.
- Ejecución en tiempo real: diseñado para inferencia a 30 FPS, compatible con el flujo de rollout de LeRobot.
- No soporta procesamiento de lenguaje natural, tool calling ni capacidades de visión general: su entrada es específica para la cámara del robot y el estado articular.
- Multilingüe: no aplica, no es un modelo de texto.
- Sin modo de razonamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- Automatización de tareas repetitivas de pick-and-place en entornos de laboratorio: el modelo puede mover objetos de una posición a otra de forma autónoma, como en el escenario de cubo sobre objetivo naranja.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentar con el método ACT, variar hiperparámetros o ampliar el dataset de entrenamiento.
- Prototipado rápido de políticas robóticas: gracias al flujo de LeRobot, un desarrollador puede recolectar datos con teleoperación, entrenar la política y desplegarla en el robot en pocos pasos.
- Demostraciones educativas de robótica: el modelo se puede ejecutar en simulación o en hardware SO-101 para ilustrar conceptos de imitación learning y control basado en visión.
- Benchmark de control en brazo SO-101: la tarea de cubo sobre objetivo naranja es un escenario estándar para comparar diferentes métodos de aprendizaje (ACT, Diffusion Policy, etc.).
- Integración en pipelines de robótica industrial ligera: el modelo puede integrarse en sistemas que requieran manipulación de objetos pequeños en espacios acotados, siempre que la tarea se mantenga dentro de la distribución del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación: "No evaluation results have been provided for this policy yet". Por tanto, no se dispone de datos de tasa de éxito en robot real ni de comparación con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,6 millones de parámetros, lo que en FP32 requiere aproximadamente 207 MB de VRAM. En FP16 o BF16, unos 103 MB. Es perfectamente viable en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, como NVIDIA GTX 1650, RTX 2060, RTX 3060, RTX 4060, etc. No se requiere GPU de datacenter (A100, H100).
- Cabe en consumer GPU: sí, incluso en tarjetas de gama de entrada.
- Opciones de despliegue: LeRobot (PyTorch) es la vía principal. El modelo se puede cargar con la librería `lerobot` y ejecutar con `lerobot-rollout`. También se puede exportar a formatos como ONNX para optimizaciones de inferencia, aunque no está documentado en el repo.
- Latencia y throughput estimados: no disponibles. Al ser un modelo pequeño y con un chunk de acciones fijo, la latencia esperada es baja (del orden de milisegundos en GPU), pero no se han publicado mediciones.

## Comparativa con modelos similares

Se han encontrado modelos con el mismo propósito y arquitectura en Hugging Face, todos entrenados con LeRobot para el mismo tipo de robot SO-101 y tarea de pick-and-place:

| Modelo | Parametros | Contexto | Licencia | Evaluacion publicada |
|---|---|---|---|---|
| FrancescoRivieccio28/act_so101_cube_grasp_test | 51,6 M | No disponible | Apache 2.0 | No |
| EPITECH-LILLE/act_so101_grab_cube_v1 | No disponible | No disponible | Apache 2.0 (previsible) | No |
| giacomoran/so101-cube-test_act | No disponible | No disponible | Apache 2.0 (previsible) | No |

Los tres modelos son políticas ACT para el SO-101 con tareas similares (agarrar un cubo). No se dispone de datos comparativos de rendimiento entre ellos. La principal diferencia es el dataset de entrenamiento y la configuración de hiperparámetros, que en este caso está documentada (64 episodios, 100 pasos, lr 1e-5).

## Limitaciones y advertencias

- Entrenamiento muy corto: con solo 100 pasos de entrenamiento, la política puede no haber convergido por completo y podría fallar en generalizar a posiciones del cubo o iluminación diferentes a las del dataset.
- Sin evaluación en robot real: la model card indica que no hay resultados de evaluación, por lo que no se conoce la tasa de éxito real en el hardware.
- Dataset limitado: 64 episodios es un número reducido para tareas de manipulación, lo que aumenta el riesgo de sobreajuste y baja robustez ante variaciones.
- Riesgo de alucinación: no aplica directamente (no es un modelo de texto), pero en el contexto robótico, el modelo puede generar acciones erróneas si recibe una imagen fuera de la distribución.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del dataset asociado (`FrancescoRivieccio28/lerobot_so101_cube_grasp_fixed`) antes de usar en producción.
- Dependencia de la cámara y calibración: el modelo requiere que la cámara y el robot estén calibrados de la misma manera que durante la recolección de datos; cualquier cambio en la disposición de la cámara o el robot degradará el rendimiento.
- Limitación de tarea: la política solo ejecuta la tarea específica de cuboger y colocar el cubo; no es reutilizable para otras tareas sin reentrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/FrancescoRivieccio28/act_so101_cube_grasp_test)
- [Dataset de entrenamiento](https://huggingface.co/datasets/FrancescoRivieccio28/lerobot_so101_cube_grasp_fixed)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación completa de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de ACT para SO-101](https://trelis.substack.com/p/train-an-act-policy-for-an-so-101)
