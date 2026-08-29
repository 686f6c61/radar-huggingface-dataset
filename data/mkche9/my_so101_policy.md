# mkche9/my_so101_policy

## Resumen

El modelo `mkche9/my_so101_policy` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. Está diseñada para el brazo robótico SO-101 (tipo `so_follower`) y resuelve la tarea de manipulación "place box inside box" (colocar una caja dentro de otra) mediante aprendizaje por imitación a partir de demostraciones teleoperadas. El modelo predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

Con 51,6 millones de parámetros, es un modelo compacto que procesa observaciones multimodales: el estado articular del robot (6 dimensiones) y dos imágenes de cámaras (muñeca y vista superior) a resolución 480×640. Fue entrenado con 50 episodios (25.329 fotogramas a 30 FPS) durante 80.000 pasos. Su relevancia radica en ser un ejemplo práctico de cómo aplicar ACT con LeRobot en hardware real de bajo coste, y en servir como punto de partida para investigar y desarrollar políticas de imitación en robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con codificador de visión y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje; procesa observaciones de estado e imágenes) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice un chunk de acciones (una secuencia de pasos futuros) en lugar de una única acción. La arquitectura combina un codificador de visión (para procesar las imágenes de las cámaras `wrist` y `overhead`) con un transformer que integra el estado del robot (`observation.state`, 6 dimensiones) y genera una secuencia de acciones de 6 dimensiones. Este enfoque reduce el error de acumulación típico de los métodos paso a paso y mejora la coherencia temporal de los movimientos.

El entrenamiento se realizó con el dataset `mkche9/box_in_box50final`, compuesto por 50 episodios teleoperados (25.329 fotogramas a 30 FPS) de la tarea "place box inside box". Se usaron 80.000 pasos de entrenamiento con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, bajo la versión 0.6.1 de LeRobot. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente supervisado por imitación.

## Capacidades

- Aprendizaje por imitación para manipulación robótica: reproduce la tarea demostrada (colocar una caja dentro de otra) a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones: genera secuencias de acciones de 6 dimensiones, lo que permite movimientos más suaves y robustos que la predicción paso a paso.
- Entrada multimodal: combina estado articular (6D) con dos flujos de imagen (muñeca y vista superior) a 480×640 píxeles.
- Salida de control directo: produce comandos de acción de 6 dimensiones (probablemente posiciones o velocidades articulares) listos para el robot SO-101.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot (comandos `lerobot-rollout`, `lerobot-train`).
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes conversacionales ni capacidades multilingües.

## Casos de uso

- Automatización de tareas de ensamblaje: el modelo puede controlar un brazo SO-101 para insertar o colocar componentes dentro de contenedores, replicando la tarea "box in box" en entornos de producción sencillos.
- Investigación en aprendizaje por imitación: sirve como base para estudiar la transferencia de políticas ACT entre distintos robots o configuraciones de cámara, gracias a su tamaño reducido y su integración con LeRobot.
- Prototipado rápido de manipulación robótica: desarrolladores pueden clonar el repositorio, adaptar el dataset y reentrenar el modelo para nuevas tareas de colocación o apilado sin escribir controladores manuales.
- Demostraciones educativas en robótica: permite a estudiantes y docentes experimentar con políticas de imitación en hardware de bajo coste (SO-101) y visualizar el flujo completo de LeRobot (grabación, entrenamiento, rollout).
- Evaluación de robustez visual: al usar dos cámaras (muñeca y overhead), el modelo puede probarse bajo diferentes condiciones de iluminación o posiciones de objetos para medir su generalización.
- Desarrollo de sistemas de control híbridos: combinable con planificadores clásicos (p. ej., MoveIt2) para tareas que requieran precisión, usando la política ACT como generador de trayectorias de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras, ya que no es un modelo de lenguaje ni se han reportado pruebas estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño del modelo (51,6 M parámetros) y la entrada de imágenes 480×640, se estima que cabe en GPUs con 4 GB o menos, pero no hay datos confirmados.
- GPU recomendadas: no hay especificación oficial. Por su tamaño, debería ejecutarse en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en GPUs de datacenter (A10, A100) si se requiere mayor throughput.
- Compatibilidad con consumer GPU: sí, probablemente en cualquier GPU moderna con soporte CUDA y al menos 4 GB de VRAM, aunque no se ha verificado.
- Opciones de despliegue: LeRobot ofrece el comando `lerobot-rollout` para ejecutar la política en el robot. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la resolución de las cámaras; al ser un modelo pequeño, se espera una inferencia en tiempo real (30 FPS) en GPUs de gama media, pero sin confirmación oficial.

## Comparativa con modelos similares

Existen otros repositorios en Hugging Face con políticas ACT para el robot SO-101, como `Soulaimakhammari/model-so-101` y `bukoi/so101_policy_01`. Sin embargo, no se dispone de datos técnicos (parámetros, rendimiento, configuración) de estos modelos para realizar una comparación cuantitativa. La información disponible solo confirma que utilizan la misma arquitectura ACT y la librería LeRobot. No se han encontrado modelos comparables con métricas publicadas en la misma tarea.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| mkche9/my_so101_policy | 51,6 M | no disponible | sin evaluación publicada | Apache-2.0 |
| Soulaimakhammari/model-so-101 | no disponible | no disponible | no disponible | no disponible |
| bukoi/so101_policy_01 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento con solo 50 episodios: la generalización a nuevas posiciones de objetos, iluminación o variaciones de la tarea puede ser limitada.
- Tarea específica: el modelo solo ha sido entrenado para "place box inside box"; no es apto para otras tareas sin reentrenamiento con datos adicionales.
- Dependencia de la configuración de cámaras: las observaciones requieren exactamente dos cámaras (`wrist` y `overhead`) con las mismas posiciones y calibración que en el entrenamiento; cambios en la disposición pueden degradar el rendimiento.
- Sin evaluación en robot real: no se han reportado tasas de éxito ni pruebas en hardware, por lo que su comportamiento en producción es incierto.
- Riesgo de sobreajuste: el dataset es pequeño (50 episodios) y el modelo tiene 51,6 M parámetros, lo que aumenta la probabilidad de memorizar las demostraciones en lugar de aprender una política generalizable.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar que el hardware y los datos utilizados no tengan restricciones adicionales.
- Fecha de creación futura (2026-08-29): el modelo fue subido con una fecha posterior a la actual, lo que sugiere que puede ser un artefacto de prueba o un error de metadatos; se recomienda verificar su validez.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mkche9/my_so101_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/mkche9/box_in_box50final
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mkche9/box_in_box50final
