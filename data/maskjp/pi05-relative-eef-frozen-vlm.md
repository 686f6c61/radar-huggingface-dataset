# maskjp/pi05-relative-eef-frozen-vlm

## Resumen

Este modelo es un fine-tuning del VLA (Vision-Language-Action) `lerobot/pi05_base` para control robótico, desarrollado por el usuario `maskjp` y publicado bajo licencia Apache-2.0. Se entrena sobre un conjunto de 949 episodios multi-tarea (8 tareas, 3 cámaras, 50 Hz) con una variante de bajo coste: el VLM (vision-language model) se congela por completo (`freeze_vision_encoder=true`, `train_expert_only=true`), de modo que solo se optimizan el experto de acciones y las proyecciones. La representación de acciones es relativa en el espacio del efector final (13 dimensiones de pose, rotación 6D), con el gripper como comando absoluto.

El modelo tiene 4.143.404.816 parámetros (4,14 B) y se publica como un snapshot intermedio en el paso 5000 de 30000, con una pérdida held-out aún en descenso. No es un checkpoint convergido ni el mejor de su ejecución. Su relevancia radica en servir como brazo experimental para comparar la estrategia de congelar el VLM frente al fine-tuning completo, abordando el problema de overfitting en conjuntos de datos pequeños de robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en pi0.5 (flow-based, con VLM congelado y experto de acciones entrenable) |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se menciona bfloat16 para entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (vía LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, que a su vez se basa en pi0.5, un VLA de tipo flow matching desarrollado por Physical Intelligence. En este fine-tuning, el VLM (incluyendo el codificador de visión) se congela por completo; solo se entrenan el experto de acciones y las proyecciones. Esto reduce drásticamente los parámetros entrenables y busca mitigar el overfitting observado al ajustar los ~4 B parámetros completos sobre solo 900 episodios de entrenamiento.

El entrenamiento usa acciones relativas: cada objetivo es `action[t+k] - state[anchor]` con un ancla por chunk (tamaño 50), y el gripper se mantiene como comando absoluto (`relative_exclude_joints=['gripper']`). La normalización emplea cuantiles recalculados sobre offsets de chunk-50 (`l5vel-peng/multitask-eefrel-h50`), ya que pi0.5 aplica la conversión relativa antes de normalizar. El resto de hiperparámetros: `chunk_size=50`, `n_action_steps=10`, `n_obs_steps=1`, `gradient_checkpointing=true`, `dtype=bfloat16`, `optimizer_lr=2.5e-5` con warmup de 1000 pasos y decaimiento coseno a `2.5e-6` durante 30K pasos, `batch=64`, una sola GPU y semilla 1000.

## Capacidades

- Control robótico end-to-end: genera acciones de efector final (13 dimensiones, incluyendo rotación 6D) a partir de observaciones visuales y de estado.
- Acciones relativas en espacio de efector final, con anclaje por chunk y gripper absoluto, lo que puede mejorar la precisión en tareas de manipulación.
- Percepción multi-cámara: entrenado con 3 cámaras, aunque el modelo congelado no adapta sus características visuales al robot.
- Entrenado para tareas multi-tarea (8 tareas en el conjunto de datos), lo que sugiere cierta capacidad de generalización entre tareas.
- Compatible con la biblioteca LeRobot para entrenamiento e inferencia.
- No se reportan capacidades de tool calling, agentes ni procesamiento de lenguaje general.

## Casos de uso

- Investigación en fine-tuning eficiente de VLA: este checkpoint sirve para estudiar cómo afecta congelar el VLM en el rendimiento final frente al ajuste completo, especialmente en conjuntos de datos pequeños (900 episodios).
- Evaluación de representaciones de acción: permite comparar acciones relativas en espacio de efector final frente a otras representaciones (absolutas o de articulaciones) en tareas de manipulación.
- Estudio de transferencia de características visuales congeladas: al no adaptar el codificador de visión, se puede analizar si las representaciones preentrenadas son suficientes para control robótico en dominios específicos.
- Desarrollo de pipelines con LeRobot: sirve como ejemplo de configuración con `freeze_vision_encoder`, `train_expert_only` y normalización por cuantiles para acciones relativas.
- Validación de técnicas de normalización: el uso de estadísticas de offset por chunk es un caso práctico para probar métodos de normalización en VLA con acciones relativas.
- Benchmark de generalización: aunque no convergido, puede usarse como punto de comparación intermedio en métricas de pérdida held-out frente a otros checkpoints del mismo proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de robótica. La model card solo reporta la pérdida held-out en el paso 5000, comparada con el fine-tuning completo en el mismo paso:

| Metrica | Paso 5000 (este modelo) | Mismo paso, fine-tuning completo |
|---|---|---|
| Pérdida held-out | 0.0355 | 0.0306 |

El autor indica que el brazo congelado va por detrás en ese punto, lo cual es esperable al tener muchos menos parámetros entrenables. No se proporciona una métrica de sensibilidad a cámara porque el codificador de visión está congelado y la pérdida aún no se ha estabilizado.

## Requisitos de hardware

- No hay requisitos oficiales publicados para este modelo. Según el tamaño (4,14 B parámetros), se estima:
  - Inferencia en bfloat16/FP16: ~8-10 GB de VRAM, por lo que cabría en GPUs de consumo como RTX 3080/4080 (12-16 GB) o RTX 4090 (24 GB).
  - Con cuantización a 8 bits podría reducirse a ~4-5 GB, y a 4 bits a ~2-3 GB, aunque no se han publicado pesos cuantizados.
- Para entrenamiento, el autor usó una sola GPU (no especificada) con batch 64 y gradient checkpointing, lo que sugiere una GPU con al menos 24 GB de VRAM (p. ej., A100, RTX 4090).
- Opciones de despliegue: LeRobot es la biblioteca principal; también podría usarse con vLLM u otros motores si se convierte a formatos compatibles, aunque no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Acciones | Estado | Licencia |
|---|---|---|---|---|
| `lerobot/pi05_base` | ~4 B | Absolutas (por defecto) | Preentrenado base | Apache-2.0 |
| `maskjp/pi05-relative-eef-frozen-vlm` (este) | ~4 B (VLM congelado) | Relativas en efector final | Snapshot intermedio (no convergido) | Apache-2.0 |
| Fine-tuning completo del mismo proyecto (no publicado) | ~4 B (todo entrenable) | Relativas en efector final | Convergido (según la card) | Apache-2.0 |

No se dispone de comparaciones con otros VLA como OpenVLA o RT-2 en cuanto a rendimiento, ya que no hay datos de benchmarks.

## Limitaciones y advertencias

- Es un snapshot intermedio (paso 5000 de 30000) y no convergido; la pérdida held-out aún está cayendo, por lo que no es adecuado para uso en producción.
- El VLM congelado impide que el modelo adapte sus características visuales al robot concreto, lo que puede limitar el rendimiento en entornos no vistos.
- No se ha calculado la sensibilidad a cámara, por lo que se desconoce su robustez ante cambios de cámara.
- La normalización depende de estadísticas de cuantiles específicas del conjunto de datos; usarla con otros datos puede degradar el rendimiento.
- No se reportan sesgos específicos, pero al ser un modelo de robótica entrenado en un conjunto limitado de tareas, puede no generalizar fuera de ese dominio.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no está listo para ello por su estado incompleto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/maskjp/pi05-relative-eef-frozen-vlm)
- [Modelo base `lerobot/pi05_base`](https://huggingface.co/lerobot/pi05_base)
- [Paper de pi0.5](https://arxiv.org/abs/2504.16054)
- [Repositorio openpi (Physical Intelligence)](https://github.com/Physical-Intelligence/openpi)
- [Documentación de pi0.5 en LeRobot](https://github.com/huggingface/lerobot/blob/main/docs/source/policy_pi05_README.md)
