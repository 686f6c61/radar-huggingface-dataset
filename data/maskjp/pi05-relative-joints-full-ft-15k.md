# maskjp/pi05-relative-joints-full-ft-15k

## Resumen

`maskjp/pi05-relative-joints-full-ft-15k` es un checkpoint intermedio de un fine-tune completo del modelo de robótica π₀.₅ (pi0.5) de LeRobot, entrenado sobre una mezcla multi-tarea de 949 episodios (8 tareas, 3 cámaras, 50 Hz). El autor lo publica explícitamente como artefacto de investigación para comparar puntos de la curva de sobreajuste: en el paso 15.000 la pérdida en el conjunto de validación es de 0,0309, un 11 % peor que el mínimo de 0,0278 alcanzado en el paso 10.000. No es el checkpoint recomendado para despliegue; el modelo final es `maskjp/pi05-relative-joints-full-ft`.

El modelo fine-tunea los 4.143.404.816 parámetros completos de π₀.₅ (torre de visión, modelo de lenguaje y experto de acciones) a partir de `lerobot/pi05_base`. La representación de acciones es relativa: el modelo predice offsets respecto al estado actual del robot, con la pinza (gripper) en modo absoluto. La licencia es Apache-2.0, heredada de LeRobot. Su relevancia radica en documentar el comportamiento de sobreajuste de un modelo de 4,14 B de parámetros sobre un dataset pequeño, y en servir como punto de comparación con variantes que congelan el VLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (vision-language-action, VLM + experto de acciones) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (modelo de robótica, sin especificación de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es una arquitectura vision-language-action (VLA) que combina una torre de visión, un modelo de lenguaje y un experto de acciones. En este checkpoint, todos los parámetros son entrenables: la torre de visión, el modelo de lenguaje y el experto de acciones. El entrenamiento se realizó sobre la mezcla `base4` de 949 episodios (900 de entrenamiento, 49 de validación) con 8 tareas, 3 cámaras y una frecuencia de 50 Hz. La configuración incluye `chunk_size=50`, `n_action_steps=10`, `n_obs_steps=1`, `gradient_checkpointing=true`, `compile_model=true` y dtype bfloat16. El optimizador usó una tasa de aprendizaje de 2,5e-5 con warmup de 1000 pasos y decaimiento coseno hasta 2,5e-6 en 30.000 pasos; la torre de visión y el proyector multimodal se entrenaron a 0,1× esa tasa (2,5e-6). La normalización usa identidad visual, cuantiles de estado y cuantiles de acción. El lote efectivo fue de 63 (21 por rango × 3 GPUs) con DDP y semilla 1000.

La representación de acciones es relativa: el modelo predice `action[t+k] - state[anchor]` con un ancla por chunk, y la pinza se mantiene en absoluto (`relative_exclude_joints=['gripper']`). El autor señala que 4,14 B de parámetros memorizan 900 episodios en menos de media época: la pérdida de entrenamiento cae a ~0,008 mientras que la de validación sube a partir del paso 10.000. La lección principal es que el esquema de 30.000 pasos es incorrecto para fine-tune completo en este dataset, no que la arquitectura sea deficiente.

## Capacidades

- Control robótico multi-tarea: el modelo predice acciones de articulaciones (10 dimensiones de motores) a partir de observaciones visuales y de estado.
- Acciones relativas: aprende offsets respecto al estado actual, lo que puede mejorar la generalización frente a posiciones absolutas (similar a OpenPI DeltaActions).
- Fine-tune completo: la torre de visión, el VLM y el experto de acciones se adaptan conjuntamente a las tareas del dataset.
- Inferencia sin dataset de entrenamiento: las estadísticas de normalización están incrustadas en `policy_preprocessor_step_3_normalizer_processor.safetensors` y `action_feature_names` en `config.json`, permitiendo despliegue directo.
- Integración con LeRobot: compatible con la API estándar de políticas de LeRobot (`PreTrainedConfig`, `get_policy_class`, `make_pre_post_processors`).
- No incluye capacidades de lenguaje general, tool calling ni razonamiento simbólico: es un modelo puramente orientado a control robótico.

## Casos de uso

- Investigación sobre sobreajuste en VLA: este checkpoint sirve para estudiar cómo la pérdida de validación evoluciona con el número de pasos en fine-tune completo sobre datasets pequeños, y para comparar con variantes que congelan el VLM.
- Comparación de puntos de la curva de entrenamiento: al publicar checkpoints en los pasos 5K, 10K, 15K, 20K, 25K y 30K, permite analizar la dinámica de memorización y generalización.
- Evaluación de estrategias de regularización: los resultados documentados (pérdida de validación mínima en 10K) sirven como referencia para probar early stopping, aumento de datos o congelación parcial de capas.
- Despliegue de políticas robóticas en entornos controlados: aunque no es el mejor checkpoint, puede usarse en laboratorio para probar el pipeline de inferencia de LeRobot con acciones relativas.
- Benchmark de sensibilidad a cámaras: el autor no midió la sensibilidad a cambio de cámara para este brazo, pero el modelo puede servir para replicar experimentos similares a los realizados con la variante frozen-VLM (ratios 0,088-0,091).
- Reproducción de experimentos de fine-tune completo: el repositorio incluye `train_config.json` con la configuración exacta, permitiendo reproducir el entrenamiento y verificar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo se evalúa mediante la pérdida en el conjunto de validación (held-out loss) durante el entrenamiento:

| Paso | Pérdida en validación |
|---:|---:|
| 5K | 0,0291 |
| 10K | 0,0278 |
| 15K | 0,0309 |
| 20K | 0,0350 |
| 25K | 0,0382 |
| 30K | 0,0392 |

El mínimo se alcanza en el paso 10.000 (0,0278). Este checkpoint (15K) es un 11 % peor que el mínimo y un 27 % mejor que el endpoint de 30K. La pérdida de entrenamiento cae a ~0,008, indicando memorización casi perfecta de los 900 episodios de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente, pero con 4,14 B de parámetros en bfloat16, el peso del modelo ocupa aproximadamente 8,3 GB (el repo total es 9,4 GB). La inferencia requiere al menos 10-12 GB de VRAM para el modelo y los tensores de entrada/salida.
- GPU recomendadas: una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100) es adecuada para inferencia. El entrenamiento usó 3 GPUs con lote 21 por rango.
- Cabe en GPUs de consumo: sí, una RTX 4090 (24 GB) puede ejecutar inferencia en bfloat16 sin cuantización.
- Opciones de despliegue: LeRobot (API nativa), con soporte para `make_pre_post_processors`. No se mencionan vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles. Dependen de la GPU y del tamaño de chunk (50 pasos de acción).

## Comparativa con modelos similares

| Modelo | Parámetros | Entrenamiento | Pérdida validación (mejor) | Licencia |
|---|---|---|---|---|
| `maskjp/pi05-relative-joints-full-ft-15k` (este) | 4,14 B (todos entrenables) | Fine-tune completo, 15K pasos | 0,0309 (en 15K) | Apache-2.0 |
| `maskjp/pi05-relative-joints-full-ft` (recomendado) | 4,14 B (todos entrenables) | Fine-tune completo, 10K pasos | 0,0278 (en 10K) | Apache-2.0 |
| `maskjp/pi05-relative-joints-frozen-vlm` | 693 M entrenables (VLM congelado) | Fine-tune solo experto, 30K pasos | 0,0296 (monótono decreciente) | Apache-2.0 |

La variante frozen-VLM no sobreajusta con el mismo esquema de 30K pasos, lo que sugiere que congelar el VLM actúa como regularización. No se dispone de comparativas con otros modelos de robótica fuera de esta familia.

## Limitaciones y advertencias

- Checkpoint intermedio, no óptimo: el autor advierte explícitamente que no es el mejor checkpoint y que está publicado solo para comparación por pasos. Para despliegue real, usar `maskjp/pi05-relative-joints-full-ft`.
- Sobreajuste severo: 4,14 B de parámetros memorizan 900 episodios; la pérdida de validación empeora a partir del paso 10.000. No usar con datasets pequeños sin estrategias de regularización.
- Sensibilidad a cámaras no medida: a diferencia de la variante frozen-VLM (ratio 0,088-0,091), este modelo no tiene medición de sensibilidad a cambio de cámara, por lo que su robustez ante cambios de sensor es desconocida.
- Configuración alterada: el `config.json` subido no incluye `vision_encoder_lr_multiplier` (eliminado por incompatibilidad con draccus), aunque `train_config.json` lo conserva. No afecta a inferencia, pero puede confundir al reproducir el entrenamiento.
- Dependencia de LeRobot: el despliegue requiere la librería LeRobot y sus dependencias; no es un modelo autónomo.
- Sin capacidades de lenguaje general: no soporta conversación, generación de texto ni razonamiento simbólico; es exclusivamente para control robótico.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir acciones inconsistentes si las observaciones difieren del dominio de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/pi05-relative-joints-full-ft-15k
- Modelo recomendado (checkpoint óptimo): https://huggingface.co/maskjp/pi05-relative-joints-full-ft
- Variante frozen-VLM: https://huggingface.co/maskjp/pi05-relative-joints-frozen-vlm
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Documentación de π₀.₅ en LeRobot: https://github.com/yuheng-li-ai/lerobot/blob/main/docs/source/policy_pi05_README.md
- Implementación de π₀.₅ con acciones relativas: https://github.com/ZhenghaoFei/lerobot-umi-relative-ee/tree/main/src/lerobot/policies/pi05
