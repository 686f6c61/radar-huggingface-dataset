# makkold/hf_act_policy

## Resumen

El modelo `makkold/hf_act_policy` es un policy de robótica entrenado con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El autor es `makkold` y se distribuye a través de Hugging Face, entrenado con la librería LeRobot. El modelo está diseñado para controlar un robot de tipo `so_follower` con dos cámaras (top y wrist) y resuelve la tarea de recoger un ladrillo amarillo y colocarlo en una caja.

Este modelo es relevante porque demuestra el uso de ACT en un escenario real de manipulación robótica con un dataset propio de 51 episodios, y se publica bajo licencia Apache-2.0, lo que facilita su uso y adaptación en entornos de investigación y desarrollo. La arquitectura de ACT combina un transformer con un encoder de visión y un módulo de variación condicional (CVAE), lo que permite aprender políticas robustas a partir de demostraciones teleoperadas.

El modelo tiene 51.668.614 parámetros, lo que lo hace ligero y desplegable en hardware modesto, y su ventana de contexto se limita a la información de observación (estado del robot y dos imágenes de 480×640 píxeles) y a la salida de acciones de 6 dimensiones. No se han publicado resultados de evaluación en robot real en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) con encoder de visión y CVAE |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de estado 6-d y dos imágenes de 3×480×640) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; entrada visual y de estado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error acumulado durante la ejecución. La arquitectura combina un transformer que procesa observaciones visuales (dos cámaras) y el estado del robot, con un módulo CVAE (Conditional Variational Autoencoder) que aprende la distribución de acciones condicionada a las observaciones. Esto permite que el policy genere acciones coherentes a lo largo de un horizonte temporal, mejorando la estabilidad en tareas de manipulación.

El entrenamiento se realizó con el dataset `makkold/so101_dataset_20260821_215200`, que contiene 51 episodios y 22.644 frames a 30 FPS. La configuración de entrenamiento incluye 10.000 pasos, batch size de 16, optimizador AdamW con learning rate de 1e-5 y semilla 1000, usando LeRobot v0.6.2. No se menciona el uso de RLHF o DPO; es un entrenamiento de imitación supervisada. El modelo se publica como un policy listo para inferencia con LeRobot.

## Capacidades

- Generación de acciones de control para robot: produce una secuencia de 6 dimensiones de acciones (por ejemplo, posiciones del efector final) a partir de observaciones de estado y visión.
- Percepción visual: procesa dos imágenes (cámara superior y cámara de muñeca) de resolución 480×640 píxeles.
- Imitación de tareas de manipulación: aprende a realizar la tarea específica de recoger un ladrillo amarillo y colocarlo en una caja.
- Ejecución en tiempo real: diseñado para inferencia en robot real con LeRobot, con soporte para estrategias base (sin grabación) y duración configurable.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue.
- Multilingüe: no aplica (no es un modelo de lenguaje).
- Tool calling o agentes: no aplica (es un policy de robótica, no un LLM).

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el policy puede ejecutarse en un robot `so_follower` para realizar la tarea de recogida y colocación de objetos, útil para investigación en robótica de manipulación.
- Automatización de tareas de picking and placing en línea de producción: aunque entrenado para una tarea específica, el método ACT puede adaptarse a tareas similares con datos teleoperados, reduciendo el tiempo de programación.
- Prototipado rápido de políticas de imitación: sirve como ejemplo de referencia para investigadores que quieran entrenar sus propios policies con LeRobot, ya que incluye la configuración completa y el dataset.
- Evaluación de algoritmos de aprendizaje por imitación: se puede usar para comparar ACT con otros métodos como Diffusion Policy en la misma tarea y robot.
- Educación en robótica: como modelo abierto y ligero, permite a estudiantes y desarrolladores experimentar con el control de robots sin necesidad de hardware de gama alta.
- Desarrollo de sistemas de teleoperación asistida: el policy puede integrarse en sistemas de control compartido donde el robot ejecuta la tarea aprendida y el humano supervisa o interrumpe.

## Benchmarks y rendimiento

No se han publicado resultados de evaluación en la model card (sección "Evaluation" indica "No evaluation results have been provided for this policy yet"). Por lo tanto, no hay datos de éxito en robot real ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con ~51 millones de parámetros, la inferencia puede caber en GPUs de consumo como una RTX 3060 (12 GB) o incluso en CPU para inferencia lenta; se recomienda al menos 4 GB de VRAM para el procesamiento de las imágenes de 480×640.
- GPUs recomendadas: NVIDIA RTX 3060, RTX 4090, A100 (para entrenamiento o inferencia a alta velocidad); el modelo es ligero y no requiere hardware especializado.
- Compatible con GPUs de consumo: sí, cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en tiempo real con LeRobot.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), Python API, y se puede exportar a ONNX o TensorRT para optimización.
- Latencia y throughput: no disponible en la información proporcionada; depende del hardware y del procesamiento de imágenes (2 cámaras).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `makkold/hf_act_policy` | ACT (Transformer + CVAE) | 51.668.614 | No aplica | No evaluado | Apache-2.0 | Hugging Face |
| Diffusion Policy (ej. LeRobot) | Diffusion model | No disponible | No aplica | No disponible | Apache-2.0 | Hugging Face |
| ACT original (Zhao et al. 2023) | Transformer + CVAE | ~50-100M (depende) | No aplica | 80-100% en tareas simuladas | MIT (paper) | Código abierto |

La comparativa es cualitativa: ACT y Diffusion Policy son métodos populares de aprendizaje por imitación en robótica. ACT tiende a ser más estable para tareas de manipulación cortas, mientras que Diffusion Policy puede manejar distribuciones multimodales más complejas. No hay datos concretos de este modelo específico para comparar.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia de éxito en robot real; el usuario debe validar el policy antes de usarlo en producción.
- Especialización de tarea: entrenado solo para la tarea de recoger un ladrillo amarillo y colocarlo en una caja; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de cámaras: requiere dos cámaras (top y wrist) con las mismas especificaciones que las de entrenamiento (resolución, orientación, etc.).
- Riesgo de fallos en entornos cambiantes: la iluminación, la posición de objetos o distracciones pueden degradar el rendimiento, como es común en imitación.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se distribuye sin garantías; el usuario es responsable del cumplimiento de las normativas de seguridad robótica.
- No apto para tareas de lenguaje: no es un modelo de texto ni de razonamiento general; no debe usarse como LLM.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/makkold/hf_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/makkold/so101_dataset_20260821_215200
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot ACT: https://huggingface.co/docs/lerobot/act
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Blog explicativo sobre ACT: https://www.roboticscenter.ai/blog/act-policy-explained
