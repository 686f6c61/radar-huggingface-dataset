# maskjp/pi05-relative-joints-frozen-vlm

## Resumen

Este modelo es un checkpoint intermedio de fine-tuning de π₀.₅ (pi0.5), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y adaptado a LeRobot. El autor `maskjp` ha realizado un fine-tuning sobre la mezcla multi-tarea `base4` (949 episodios, 8 tareas, 3 cámaras, 50 Hz) con una configuración particular: el VLM (incluido el vision encoder) se congela completamente, entrenando únicamente el action expert y las proyecciones. La acción se representa en espacio de joints con 10 dimensiones de targets de motor, usando acciones relativas por chunk.

Se trata de un snapshot a mitad del entrenamiento (paso 5000 de 30000), no convergido, y el propio autor advierte que la pérdida en validación aún está bajando. El objetivo de esta variante es probar la capacidad de la variante de menor capacidad descrita en la guía de LeRobot para pi0.5, comparándola con el fine-tuning completo sobre los mismos datos y la misma representación de acción. El modelo tiene 4.143.404.816 parámetros, licencia Apache-2.0 y está alojado en Hugging Face con formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π₀.₅, con VLM congelado y action expert entrenable |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo VLA que combina un modelo de visión-lenguaje (VLM) con un "action expert" que genera comandos de control. En esta variante, el VLM (incluido el vision encoder) se congela (`freeze_vision_encoder=true`, `train_expert_only=true`), de modo que solo se entrenan las proyecciones y el action expert. El entrenamiento se realiza sobre 949 episodios de la mezcla `base4` (900 train / 49 held-out, 8 tareas, 3 cámaras, 50 Hz) con chunk size 50, 10 pasos de acción y 1 paso de observación. Se usa gradient checkpointing, dtype bfloat16, learning rate 2.5e-5 con warmup de 1000 pasos y cosine decay hasta 2.5e-6 en 30K pasos, batch 64 en una sola GPU.

La representación de acción es relativa: `action[t+k] - state[anchor]` con un ancla por chunk, añadido de nuevo tras la inferencia. El gripper se mantiene absoluto (`relative_exclude_joints=['gripper']`). La normalización usa cuantiles de offsets de chunk-50 (dataset `l5vel-peng/multitask-relative-h50`). Este checkpoint es el paso 5000, no convergido.

## Capacidades

- Control robótico end-to-end: genera comandos de articulación (10 dimensiones) a partir de observaciones visuales y de estado.
- Acciones relativas: predice offsets respecto al estado actual, lo que puede mejorar la generalización en tareas de manipulación.
- Soporte multi-tarea: entrenado sobre 8 tareas diferentes, aunque con VLM congelado no adapta características visuales específicas del robot.
- Visión: utiliza 3 cámaras para observaciones.
- Compatible con LeRobot: pipeline `robotics` y librería `lerobot`.
- Capacidades del modelo base π₀.₅ (generalización open-world) no garantizadas debido al congelamiento del VLM y al entrenamiento incompleto.

## Casos de uso

- Investigación en fine-tuning de VLA: permite estudiar el efecto de congelar el VLM frente a fine-tuning completo, comparando curvas de pérdida y rendimiento final.
- Evaluación de representaciones de acción relativa: útil para validar si las acciones relativas en espacio de joints mejoran la estabilidad del entrenamiento en tareas de manipulación.
- Benchmarking de estrategias de regularización: al ser un snapshot intermedio, sirve para analizar dinámicas de sobreajuste en datasets pequeños (900 episodios).
- Pruebas de inferencia en robots reales con LeRobot: puede desplegarse para ejecutar tareas simples de pick-and-place o empujar objetos, aunque con precaución por no estar convergido.
- Comparación de arquitecturas de action expert: al entrenar solo el experto, se puede aislar el impacto de esta parte del modelo.
- Desarrollo de pipelines de entrenamiento con recursos limitados: al congelar el VLM, se reduce significativamente la memoria necesaria, permitiendo experimentos en una sola GPU.

## Benchmarks y rendimiento

El autor reporta la pérdida en validación (held-out loss) en el paso 5000, comparada con el fine-tuning completo al mismo paso:

| Metrica | Valor (este modelo) | Valor (full fine-tune) |
|---|---|---|
| Held-out loss @ step 5000 | 0.0365 | 0.0303 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque es un modelo de robótica y el checkpoint no está convergido. La métrica de sensibilidad a cámara no se proporciona, ya que el vision encoder está congelado y la pérdida aún no se ha estabilizado.

## Requisitos de hardware

- Parámetros: 4.143M, en bfloat16 ocupa aproximadamente 8.3 GB en memoria (solo pesos). Con gradientes y optimizador para entrenamiento, se requiere más (estimación ~16-20 GB).
- Inferencia: cabe en GPUs consumer con 12-16 GB VRAM (RTX 3080/3090, RTX 4070/4080/4090) en bfloat16. Con cuantización (no disponible en este repo) podría reducirse.
- Entrenamiento: el autor usó una sola GPU (no especificada), con gradient checkpointing y batch 64. Se recomienda al menos 24 GB VRAM para reproducir la configuración.
- Opciones de despliegue: LeRobot (librería `lerobot`), compatible con vLLM o TGI si se exporta a formatos estándar, aunque el pipeline es robótico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Held-out loss (step 5000) | Licencia |
|---|---|---|---|---|---|
| Este modelo (frozen VLM) | 4.143M | no disponible | 949 episodios, VLM congelado | 0.0365 | Apache-2.0 |
| `lerobot/pi05_base` (full fine-tune) | ~4.1B | no disponible | 949 episodios, fine-tuning completo | 0.0303 | Apache-2.0 |
| π₀ (original) | ~3.3B | no disponible | pre-entrenamiento en datos heterogéneos | no comparable | Apache-2.0 (según LeRobot) |

El modelo base `pi05_base` es el punto de partida; este checkpoint es una variante experimental con el VLM congelado. No se dispone de comparativas con otros VLA en benchmarks estándar.

## Limitaciones y advertencias

- Checkpoint intermedio no convergido: la pérdida en validación sigue cayendo; no es el mejor checkpoint del run ni un modelo final.
- VLM congelado: el vision encoder no se adapta a las características específicas del robot, lo que puede limitar la generalización visual.
- Sobreajuste potencial: el fine-tuning completo sobre 900 episodios muestra overfitting; esta variante busca mitigarlo, pero no está confirmado.
- Sin métrica de sensibilidad a cámara: no se puede comparar con otros checkpoints del proyecto.
- Acciones relativas requieren normalización específica: usar el normalizador incorrecto puede arruinar las predicciones.
- Entrenamiento limitado: solo 949 episodios, 8 tareas; no es representativo de entornos diversos.
- No apto para producción: es un artefacto de investigación, no un modelo desplegable sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maskjp/pi05-relative-joints-frozen-vlm
- Documentación de LeRobot para π₀.₅: https://huggingface.co/docs/lerobot/pi05
- Repositorio LeRobot (implementación pi05): https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/pi05
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Modelo base: https://huggingface.co/lerobot/pi05_base
