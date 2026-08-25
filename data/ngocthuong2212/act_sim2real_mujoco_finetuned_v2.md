# ngocthuong2212/act_sim2real_mujoco_finetuned_v2

## Resumen

El modelo `act_sim2real_mujoco_finetuned_v2` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Está diseñada para controlar un robot manipulador tipo `so_follower` en la tarea de recoger un objeto y colocarlo en una caja, con un enfoque específico de transferencia sim2real (de simulación MuJoCo a robot real). El modelo fue desarrollado por ngocthuong2212 y se distribuye bajo licencia Apache 2.0.

El modelo consume observaciones de estado (6 dimensiones) y dos imágenes RGB (cámara superior y frontal, 480x640) para producir acciones de 6 dimensiones. Con 51,7 millones de parámetros, es una política relativamente ligera que puede ejecutarse en tiempo real en hardware de consumo. Su relevancia radica en que es un ejemplo de política ACT entrenada con datos de simulación con un desplazamiento de retardo (delay shift) para mejorar la transferencia a entornos reales, un problema común en robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo procesa observaciones fijas de estado e imágenes, no texto) |
| Tipos de cuantización | no disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | no aplicable (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (a través de LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias (chunks) de acciones de longitud fija en lugar de un solo paso. La arquitectura se basa en un transformer encoder-decoder que procesa observaciones visuales y de estado, y genera una secuencia de acciones que luego se ejecuta en el robot. La técnica reduce el error de acumulación y mejora la estabilidad de la ejecución en tareas de manipulación.

El entrenamiento se realizó con el dataset `vasco281204/so101_sim2real_delay_shift_v2_spaced_200`, que contiene 200 episodios y 83.428 frames a 30 FPS. La configuración de entrenamiento incluyó 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. La versión de LeRobot usada fue la 0.6.2. No se indica si se aplicaron técnicas de RLHF o DPO, ya que es un método de imitación supervisada. La particularidad del dataset (delay shift) sugiere una estrategia para abordar la brecha sim2real, aunque los detalles técnicos no se detallan en la información disponible.

## Capacidades

- Generación de acciones de control para un robot manipulador de 6 grados de libertad (acciones de posición y orientación del efector final).
- Procesamiento de imágenes de dos cámaras (top y front) de resolución 480x640, además del estado del robot.
- Predicción de secuencias de acciones (chunking) para una ejecución suave y estable.
- Enfoque específico para transferencia sim2real, entrenado con datos simulados de MuJoCo y ajustado para manejar retardos en el mundo real.
- No soporta tool calling, agentes ni razonamiento de lenguaje; es un modelo puramente de control robótico.

## Casos de uso

- Manipulación robótica en entornos de simulación: el modelo puede usarse en MuJoCo para evaluar políticas de control antes de desplegarlas en un robot físico.
- Transferencia sim2real en robótica: al estar entrenado con un dataset con desplazamiento de fase (delay shift), es útil para probar estrategias que reducen la brecha entre simulación y realidad.
- Automatización de tareas de pick-and-place en celdas de trabajo: el modelo está entrenado para "recoger el objeto y colocarlo en la caja", una tarea industrial común.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos con ACT, comparando arquitecturas o técnicas de entrenamiento.
- Despliegue en robots reales tipo `so_follower` con LeRobot: el script `lerobot-rollout` permite ejecutar la política en hardware real con las cámaras y el puerto adecuados.
- Evaluación de políticas en entornos controlados: se puede usar para validar la robustez de la política ante variaciones de iluminación, posición de objetos o ruido de sensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de tasas de éxito ni métricas comparativas con otros modelos.

## Requisitos de hardware

- El modelo tiene 51,7 millones de parámetros, lo que implica un peso de aproximadamente 200 MB en fp32. La VRAM requerida para inferencia es mínima, del orden de 1-2 GB si se usan las imágenes y el estado.
- Cabe en cualquier GPU de consumo moderna, como una RTX 3060 o superior. También podría ejecutarse en CPU, aunque la inferencia sería más lenta.
- No se han publicado requisitos específicos de VRAM ni latencia en la información disponible.
- Opciones de despliegue: LeRobot ofrece scripts de entrenamiento y rollout (`lerobot-train`, `lerobot-rollout`). No se mencionan otros motores de inferencia como vLLM u Ollama, ya que el modelo no es de lenguaje.
- El modelo se ejecuta en PyTorch a través de LeRobot, por lo que se requiere CUDA para un rendimiento óptimo.

## Comparativa con modelos similares

No se dispone de modelos comparables específicos en la información proporcionada. ACT es un método estándar en robótica, y existen otros modelos de la comunidad LeRobot con arquitecturas similares, pero no hay datos públicos de rendimiento para esta política concreta. Se recomienda consultar el repositorio de LeRobot para otros modelos ACT.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea concreta (pick-and-place) y con un tipo de robot específico (`so_follower`). No es generalizable a otras tareas o robots sin reentrenamiento.
- No se han publicado evaluaciones en robot real, por lo que el rendimiento en el mundo real es desconocido y puede verse afectado por variaciones de iluminación, calibración de cámaras o física.
- El dataset de entrenamiento se basa en simulación con desplazamiento de fase; puede no funcionar correctamente si el robot real no tiene un sistema de control con compensación de retardo adecuado.
- Riesgo de alucinación no aplica (no es un modelo de lenguaje).
- Licencia Apache 2.0 permite uso comercial, pero se debe citar el método ACT y LeRobot según la información de la model card.
- No hay información sobre sesgos, pero al ser un sistema de control, no tiene sesgos lingüísticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngocthuong2212/act_sim2real_mujoco_finetuned_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/vasco281204/so101_sim2real_delay_shift_v2_spaced_200
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Perfil del autor: https://huggingface.co/ngocthuong2212
- MuJoCo: https://mujoco.org/
