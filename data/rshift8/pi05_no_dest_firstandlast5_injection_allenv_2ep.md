# rshift8/pi05_no_dest_firstandlast5_injection_allenv_2ep

## Resumen

El modelo `rshift8/pi05_no_dest_firstandlast5_injection_allenv_2ep` es un checkpoint de fine-tuning de un modelo de robótica vision-language-action (VLA) basado en π₀.₅, desarrollado por el usuario rshift8. Se trata de un ajuste de dos épocas sobre el modelo `pi05_no_dest_firstandlast5_injection_allenv`, que a su vez es una variante de RoboPRO con atención a obstáculos. El objetivo es modificar el comportamiento de atención del modelo para tratar el destino como obstáculo, con la atención al destino desactivada y la atención al objetivo activada. Este checkpoint está pensado para investigación en robótica, específicamente para evaluar estrategias de atención en entornos con obstáculos.

El modelo se publica como un conjunto de checkpoints completos en formato JAX/orbax, que permiten reanudar el entrenamiento o ejecutar evaluación. No se proporcionan métricas de rendimiento ni detalles sobre el dataset de entrenamiento más allá de la configuración de pasos y batch. Es relevante para la comunidad de robótica que trabaja con modelos VLA de código abierto, ya que ofrece una variante específica de π₀.₅ con una configuración de atención particular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flujo, derivada de π₀.₅ (no se especifican detalles de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se guardan en formato JAX/orbax, sin cuantización) |
| Idiomas soportados | no disponible (modelo multimodal, probablemente inglés, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | JAX/orbax checkpoints (directorios con `params/`, `train_state/`, `assets/`, `_CHECKPOINT_METADATA`, `train_config.py`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π₀.₅, un VLA que combina visión, lenguaje y acción para control robótico. La arquitectura exacta no se detalla en la información proporcionada, pero se sabe que π₀.₅ se basa en un modelo de flujo (flow matching) que genera acciones a partir de observaciones visuales y instrucciones en lenguaje. Este checkpoint concreto aplica una configuración de atención específica: "dest-as-obstacle beta caches, target attention on, destination attention off", lo que sugiere una modificación en los mecanismos de atención para tratar el destino como un obstáculo y desactivar la atención al destino.

El entrenamiento se realizó con JAX/orbax, durante 230934 pasos (2 épocas × 115467 pasos), con un batch size de 32 y paralelismo de datos en 2 GPUs. Se guardaron checkpoints cada 25k pasos y al final de cada época. La inicialización se hizo desde el modelo `mzxuan/robopro_jax_30000`. No se mencionan técnicas como RLHF o DPO; el proceso parece ser un fine-tuning supervisado estándar.

## Capacidades

- Control robótico end-to-end: genera acciones de actuadores a partir de observaciones visuales y comandos en lenguaje.
- Percepción visual: procesa imágenes de cámaras para entender el entorno.
- Seguimiento de instrucciones: interpreta comandos en lenguaje natural para ejecutar tareas.
- Atención a obstáculos: configuración específica para priorizar la detección de obstáculos y tratar el destino como uno de ellos.
- Multimodalidad: combina visión y lenguaje para la toma de decisiones.
- Reanudación de entrenamiento: los checkpoints incluyen el estado del optimizador, lo que permite continuar el entrenamiento.

## Casos de uso

- Investigación en robótica manipuladora: el modelo puede usarse para estudiar cómo la atención a obstáculos afecta el rendimiento en tareas de manipulación con objetos en el entorno.
- Evaluación de estrategias de atención: permite comparar el comportamiento de este checkpoint con otras variantes de π₀.₅ que usan diferentes configuraciones de atención.
- Desarrollo de políticas de evitación de obstáculos: en entornos simulados o reales, el modelo puede servir como base para probar algoritmos de planificación de movimiento.
- Fine-tuning adicional: al ser un checkpoint completo, se puede reanudar el entrenamiento con nuevos datos para adaptarlo a tareas específicas.
- Benchmarking de modelos VLA: útil para comparar el rendimiento de diferentes variantes de π₀.₅ en tareas estandarizadas de robótica.
- Educación y experimentación: para investigadores que quieran explorar el impacto de la atención en modelos de acción visual-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ya que este modelo no está orientado a tareas de lenguaje general sino a control robótico. Tampoco se incluyen evaluaciones en entornos robóticos estándar (p. ej., RLBench, LIBERO) en la información del modelo.

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPUs en paralelo de datos, lo que sugiere que se necesitan al menos 2 GPUs con suficiente memoria para el modelo y el batch.
- Para inferencia, se requiere un entorno con JAX y orbax instalados, así como las dependencias de openpi.
- No se especifica la VRAM necesaria, pero al ser un modelo VLA de tamaño similar a π₀.₅ (probablemente varios miles de millones de parámetros), se recomienda una GPU con al menos 24 GB de VRAM (p. ej., RTX 3090, RTX 4090, A100) para inferencia en precisión completa.
- El despliegue puede hacerse mediante el framework openpi, que soporta JAX. No se mencionan opciones como vLLM u Ollama, ya que no es un LLM estándar.
- La latencia y el throughput dependen del hardware y de la longitud de las secuencias de acción; no se proporcionan datos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Sin embargo, existen otros checkpoints de rshift8 con configuraciones similares, como `rshift8/pi05_no_dest_firstandlast5_injection_allenv` (el modelo base de este fine-tune) y `rshift8/pi05_obs_only_firstandlast3_injection_allenv`. También está el modelo original `mzxuan/robopro_jax_30000` y el π₀.₅ de Physical Intelligence. Las diferencias principales radican en la configuración de atención y el número de épocas de entrenamiento, pero no se publican métricas comparativas.

| Modelo | Configuración de atención | Épocas | Pasos | Inicialización |
|---|---|---|---|---|
| `pi05_no_dest_firstandlast5_injection_allenv_2ep` | Dest como obstáculo, atención a destino off | 2 | 230934 | `mzxuan/robopro_jax_30000` |
| `pi05_no_dest_firstandlast5_injection_allenv` | Dest como obstáculo, atención a destino off | 1 (presumible) | 115467 | `mzxuan/robopro_jax_30000` |
| `pi05_obs_only_firstandlast3_injection_allenv` | Solo observaciones, inyección en primeros/últimos 3 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones, ya que es un modelo de control robótico y no un LLM conversacional.
- El modelo está diseñado para entornos robóticos específicos; su generalización a otros dominios no está garantizada.
- La licencia no está especificada, por lo que el uso comercial puede ser incierto. Se recomienda contactar al autor.
- Los checkpoints están en formato JAX/orbax, lo que limita su uso a entornos que soporten esta pila tecnológica.
- No se proporcionan métricas de rendimiento, por lo que no se puede evaluar su eficacia en tareas concretas.
- La configuración de atención "dest-as-obstacle" puede no ser adecuada para todas las tareas; es una variante experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rshift8/pi05_no_dest_firstandlast5_injection_allenv_2ep
- Modelo base (1 época): https://huggingface.co/rshift8/pi05_no_dest_firstandlast5_injection_allenv
- Modelo similar (obs-only): https://huggingface.co/rshift8/pi05_obs_only_firstandlast3_injection_allenv
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Modelo de inicialización: https://huggingface.co/mzxuan/robopro_jax_30000
