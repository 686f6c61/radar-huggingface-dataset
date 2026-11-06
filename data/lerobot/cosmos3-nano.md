# lerobot/cosmos3-nano

## Resumen

Cosmos3-Nano (conversión LeRobot) es la adaptación al formato de políticas de LeRobot del checkpoint base Cosmos3-Nano de NVIDIA, un modelo de robótica que predice conjuntamente fragmentos de acciones del robot y latentes de vídeo futuro a partir de instrucciones en lenguaje y observaciones de cámara actuales, con condicionamiento opcional del estado del robot. No se trata de un modelo afinado para tareas concretas: es un punto de partida para post-entrenamiento de políticas robóticas.

El backbone es un Qwen3-VL MoT con 36 capas de decodificador y ancho oculto de 4096, e incluye un VAE de Wan2.2, ficheros de tokenizador y procesadores serializados de LeRobot. El paquete almacena 16.454 millones de parámetros escalares (incluyendo componentes congelados y el VAE) en 1356 tensores, la mayoría en BF16.

Su relevancia reside en que permite a desarrolladores de robótica usar el ecosistema LeRobot para post-entrenar sobre un modelo fundacional de NVIDIA sin escribir código de conversión propio, con recetas de post-entrenamiento preconfiguradas (DROID y LIBERO) listas para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3-VL MoT con VAE Wan2.2; política de vídeo-acción conjunta (modo `wam`) |
| Parametros totales | 16.454.213.580 (incluye componentes congelados y VAE) |
| Parametros activos | no disponible (no se especifica si el MoT es MoE con enrutamiento) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (mayoría de pesos), FP32 (4 tensores del time-embedder y master weights); sin cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (1356 tensores: 1352 BF16, 4 FP32), tamaño de repo 33,0 GB |

## Arquitectura y entrenamiento

La política combina un backbone Qwen3-VL MoT (36 capas, ancho oculto 4096) con un VAE de Wan2.2 para codificar y predecir latentes de vídeo. El modelo genera de forma conjunta *action chunks* (fragmentos de acciones del robot) y latentes de vídeo futuro, condicionados por lenguaje, observaciones de cámara en un único paso de observación y, opcionalmente, el estado actual del robot. El muestreo se realiza con el sampler UniPC. No expone las APIs de razonamiento, audio ni generación de vídeo independiente del modelo upstream de NVIDIA.

No se han publicado detalles del preentrenamiento original (tokens, composición del dataset, RLHF/DPO) en la información disponible. La conversión de LeRobot no añade ningún ajuste fino específico de tarea. El checkpoint guarda `dtype=float32` para soportar master weights en FP32 durante el entrenamiento. La configuración guardada incluye una receta de post-entrenamiento DROID (dominio 8, chunks de 32 pasos, condicionamiento por estado, normalización identity, UniPC con 4 pasos de inferencia y guidance 3) y una receta LIBERO por defecto para la clase de tamaño (dominio 5, chunks de 16 pasos, sin condicionamiento por estado, normalización cuantil de acciones, UniPC con 30 pasos y guidance 1).

## Capacidades

- Predicción conjunta de action chunks del robot y latentes de vídeo futuro (modo `wam` de vídeo y acción).
- Condicionamiento por instrucciones en lenguaje y observaciones de cámara actuales.
- Condicionamiento opcional por el estado actual del robot (según receta).
- Interfaz de política compatible con LeRobot (`policy type: cosmos3_nano`) para post-entrenamiento y evaluación.
- Muestreo con UniPC (configurable entre 4 y 30 pasos de inferencia según receta).
- Reinicialización opcional de los módulos de acción (`load_action_modules=false`) para post-entrenamiento de estilo nativo.
- No soporta: razonamiento upstream, audio, generación de vídeo independiente, tool calling ni agentes (no expuestos en este paquete).

## Casos de uso

- Post-entrenamiento de políticas robóticas sobre datasets propios: el modelo sirve como base para afinar con datos de teleoperación del usuario mediante `--policy.path=lerobot/cosmos3-nano` (receta DROID) o `--policy.type=cosmos3_nano` (receta LIBERO).
- Investigación en VLA (vision-language-action): permite estudiar la predicción conjunta de vídeo futuro y acciones, útil para análisis de consistencia entre lo que el robot "imagina" y lo que ejecuta.
- Evaluación en simulación LIBERO: la receta LIBERO preconfigurada permite montar pipelines de evaluación closed-loop, siempre que el dataset respete el layout de cámaras y acciones de la receta.
- Aprendizaje por imitación con condicionamiento de estado: la receta DROID incluye condicionamiento por estado y chunks de 32 pasos, adecuada para manipulación con horizonte largo.
- Comparación de recetas de post-entrenamiento: los dos puntos de entrada (`--policy.path` frente a `--policy.type`) permiten contrastar hiperparámetros (pasos UniPC, guidance, normalización) sobre los mismos pesos.
- Reentrenamiento de los módulos de acción desde cero: con `load_action_modules=false` se reinicializan las proyecciones de entrada/salida de acción y el embedding de modalidad, útil para adaptar el modelo a espacios de acción nuevos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito closed-loop en LIBERO para esta conversión base, y que los resultados de checkpoints LIBERO afinados por separado o de los modelos NVIDIA Policy-DROID no miden este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 16,45 mil millones de parámetros mayoritariamente en BF16, cabría estimar del orden de decenas de GB en BF16, pero no hay cifra oficial.
- GPU recomendadas: no disponible. Para entrenamiento con master weights FP32 se requiere hardware de gama alta; no se especifican modelos concretos.
- Consumer GPU: no disponible; el tamaño del repo (33,0 GB) y el recuento de parámetros hacen improbable su uso en GPUs de consumo, pero no hay dato oficial.
- Despliegue: vía librería LeRobot (versión que incluya los policy types de Cosmos3; baseline de compatibilidad `b8f060837ced0a4ce4b136ea65b4d56bc7894bed`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Para evaluación se recomienda `--tf32=false` y `--policy.dtype=bfloat16` en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lerobot/cosmos3-nano | 16.454 M (incluye congelados y VAE) | no disponible | Política robótica (vídeo + acción) | OpenMDW 1.1 | HF, safetensors, 33 GB |
| nvidia/Cosmos3-Nano (upstream) | no disponible | no disponible | Modelo base Cosmos3 de NVIDIA | OpenMDW 1.1 | HF, revisión `e59a53c2` |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa detallada con otros VLA de tamaño similar; la referencia directa es el checkpoint upstream `nvidia/Cosmos3-Nano`, del cual esta ficha es una conversión sin ajuste fino.

## Limitaciones y advertencias

- No es un modelo afinado: la conversión no incluye ajuste para tareas concretas y no se reporta tasa de éxito en LIBERO para este checkpoint; los resultados de otros checkpoints no lo miden.
- Las características de observación y acción guardadas están vacías: la frecuencia de frames y el tamaño de cámara no están resueltos, y un dataset objetivo debe proporcionarlos antes de construir la política.
- El recuento de 16.454 M de parámetros no representa parámetros entrenables ni activos: incluye componentes congelados y el VAE.
- Estado y acción deben usar el mismo layout y ancho al usar la receta DROID; la receta LIBERO exige que el dataset coincida con su layout de cámaras y acciones.
- Las limitaciones upstream (sesgo, seguridad, privacidad, explicabilidad) deben consultarse en los documentos de NVIDIA (SAFETY.md, BIAS.md, PRIVACY.md, EXPLAINABILITY.md); no se resumen datos concretos aquí.
- Licencia OpenMDW 1.1: al redistribuir hay que conservar la licencia, los avisos de copyright y de origen (ver NOTICE); el software de ejecución instalado por separado conserva sus propias licencias.
- No expone razonamiento, audio ni APIs de generación de vídeo independiente del modelo upstream.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/lerobot/cosmos3-nano
- Checkpoint original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano/tree/e59a53c25979a090fa8706c9acc0c254a6e89b92
- Model card original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/README.md
- Nota de seguridad upstream: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/SAFETY.md
- Nota de sesgo upstream: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/BIAS.md
- Nota de privacidad upstream: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/PRIVACY.md
- Nota de explicabilidad upstream: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/EXPLAINABILITY.md
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
