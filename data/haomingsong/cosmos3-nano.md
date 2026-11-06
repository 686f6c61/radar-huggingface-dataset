# HaomingSong/cosmos3-nano

## Resumen

Cosmos3-Nano es un modelo fundacional de NVIDIA orientado a robótica, concretamente a la predicción conjunta de acciones motoras y latentes de vídeo futuro a partir de observaciones de cámara y lenguaje. El repositorio `HaomingSong/cosmos3-nano` no es el checkpoint original, sino una conversión al formato de política de LeRobot del checkpoint base `nvidia/Cosmos3-Nano` (revisión `e59a53c25979a090fa8706c9acc0c254a6e89b92`), pensada como punto de partida para post-entrenamiento de políticas robóticas. La conversión no añade ningún ajuste específico de tarea.

El modelo emplea un backbone Qwen3-VL en configuración MoT (Mixture of Transformers) con 36 capas de decodificador y anchura oculta de 4096. El paquete almacena 16.454.213.580 escalares en 1356 tensores (1352 en BF16 y 4 en FP32), aunque esa cifra incluye componentes congelados y un VAE Wan2.2, por lo que no equivale al número de parámetros entrenables o activos. La salida del modelo combina chunks de acciones con latentes de vídeo, con condicionamiento opcional al estado actual del robot.

Su relevancia radica en que expone, mediante la interfaz de LeRobot, un modelo de mundo para robótica que puede post-entrenarse con datasets propios (recetas DROID o LIBERO). No obstante, se trata de un checkpoint base sin evaluación de éxito en bucle cerrado publicado, con solo 14 descargas y sin likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL MoT (Mixture of Transformers), 36 capas de decodificador, anchura oculta 4096 |
| Parametros totales | 16.454.213.580 escalares almacenados (incluye componentes congelados y VAE Wan2.2; no equivale a parametros entrenables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16, 4 tensores del time-embedder en FP32) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (1356 tensores: 1352 BF16, 4 FP32) |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone Qwen3-VL en configuración MoT, con 36 capas de decodificador y anchura oculta de 4096. La política predice de forma conjunta chunks de acciones del robot y latentes de vídeo futuro, condicionada por lenguaje y observaciones actuales de cámara, con condicionamiento opcional al estado actual. El paquete incluye además un VAE Wan2.2, ficheros de tokenizer y procesadores de LeRobot serializados. El decodificador de acciones y el muestreo se apoyan en el sampler UniPC.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni si hubo etapas de RLHF o DPO. La conversión a LeRobot no añade fine-tuning específico de tarea: es un checkpoint base. El repositorio documenta dos recetas de post-entrenamiento: la de DROID (dominio 8, chunks de 32 pasos, condicionamiento de estado, normalización identidad, UniPC con 4 pasos de inferencia y guidance 3) y la de LIBERO (dominio 5, chunks de 16 pasos, sin condicionamiento de estado, normalización por cuantiles de acción, UniPC con 30 pasos y guidance 1). El flag `load_action_modules` permite reinitializar las proyecciones de acción para post-entrenamiento nativo.

## Capacidades

- Predicción conjunta de chunks de acciones robóticas y latentes de vídeo futuro (modo `wam`).
- Condicionamiento por lenguaje natural y por observaciones de cámara actuales.
- Condicionamiento opcional al estado actual del robot.
- Soporte de un único paso de observación en la implementación de LeRobot.
- Muestreo mediante sampler UniPC con número de pasos y guidance configurables.
- Post-entrenamiento sobre datasets propios mediante las recetas DROID o LIBERO de LeRobot.
- No expone las APIs upstream de razonamiento, audio ni generación de vídeo autónoma.
- No se documentan capacidades de tool calling, agentes ni multilingüismo en esta conversión.

## Casos de uso

- Post-entrenamiento de políticas de manipulación con datasets propios: partiendo de `--policy.path=HaomingSong/cosmos3-nano` se conserva la receta DROID y se ajusta el modelo a un robot concreto, siempre que estado y acción compartan layout y anchura.
- Investigación en modelos de mundo para robótica: la predicción conjunta de latentes de vídeo y acciones permite estudiar la relación entre dinámica visual y control motor en un mismo backbone.
- Adaptación a entornos tipo LIBERO: usando `--policy.type=cosmos3_nano --policy.pretrained_path=...` se aplica la receta LIBERO por defecto (chunks de 16 pasos, normalización por cuantiles, UniPC con 30 pasos) sobre datasets compatibles con su layout de cámara y acción.
- Reentrenamiento desde cero de módulos de acción: con `--policy.load_action_modules=false` se reinitializan las proyecciones de entrada/salida de acción y el embedding de modalidad, útil para transferir el backbone a una morfología de robot distinta.
- Evaluación comparativa de recetas de post-entrenamiento: al soportar dos recetas con hiperparámetros distintos (DROID frente a LIBERO), sirve para medir el impacto del condicionamiento de estado, el tamaño de chunk y el número de pasos de UniPC.
- Base para pipelines de imitación con condicionamiento visual-lenguaje: integrable en flujos de LeRobot para entrenar políticas que combinen instrucciones en lenguaje con observaciones de cámara en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en bucle cerrado de LIBERO para esta conversión base, y que los resultados de checkpoints LIBERO ajustados por separado o de los modelos NVIDIA Policy-DROID no miden este checkpoint. Las únicas verificaciones realizadas son de conversión y carga estricta en CPU con features de dataset resueltas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 16.454 millones de escalares en BF16 suponen aproximadamente 33 GB solo de pesos, a lo que hay que sumar el VAE Wan2.2, el tokenizer y los procesadores, por lo que se requiere una GPU con al menos 40-48 GB de memoria para inferencia en BF16.
- GPU recomendadas: no disponibles en la documentación. Por el tamaño del paquete, se necesitan GPUs de clase profesional (A100 40/80 GB, H100, L40S) para BF16.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en BF16 sin cuantización, y no se documentan formatos cuantizados (GGUF, AWQ, GPTQ) para este repositorio.
- Opciones de despliegue: LeRobot (versión que incluya los tipos de política Cosmos3); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles.
- Nota de configuración: para inferencia se recomienda `--policy.dtype=bfloat16` y, en evaluación, `--tf32=false`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaomingSong/cosmos3-nano | 16.454 M escalares almacenados (incluye VAE y componentes congelados) | no disponible | Política robótica vídeo+acción (LeRobot) | OpenMDW 1.1 | Hugging Face, 14 descargas |
| nvidia/Cosmos3-Nano | no disponible en la información proporcionada | no disponible | Modelo fundacional de NVIDIA (upstream) | OpenMDW 1.1 | Hugging Face (checkpoint original) |
| NVIDIA Policy-DROID | no disponible | no disponible | Política robótica ajustada | no disponible | Referenciado en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint base sin fine-tuning de tarea: no se reporta tasa de éxito en bucle cerrado, por lo que no debe asumirse un rendimiento de política listo para producción.
- Las features de observación y acción guardadas están vacías; la tasa de frames y el tamaño de cámara no están resueltos y el dataset objetivo debe proporcionarlos antes de construir la política.
- El recuento de 16.454 millones de escalares incluye componentes congelados y el VAE Wan2.2; no debe interpretarse como parámetros entrenables o activos.
- La implementación de LeRobot solo soporta el modo `wam` conjunto, un único paso de observación y el sampler UniPC; no expone razonamiento, audio ni generación de vídeo autónoma del modelo upstream.
- Licencia OpenMDW 1.1: es obligatorio conservar la licencia y los avisos de copyright y origen al redistribuir; deben revisarse los términos para uso comercial.
- Riesgo de alucinación y sesgos: no documentados en esta conversión; la model card remite a los documentos SAFETY, BIAS, PRIVACY y EXPLAINABILITY del modelo original de NVIDIA.
- Idiomas soportados: no disponibles.
- Requiere una versión de LeRobot que incluya los tipos de política Cosmos3; la compatibilidad se validó contra el commit `b8f060837ced0a4ce4b136ea65b4d56bc7894bed`.
- El repositorio tiene un tamaño de 33 GB y solo 14 descargas, sin likes, lo que sugiere una validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HaomingSong/cosmos3-nano
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano/tree/e59a53c25979a090fa8706c9acc0c254a6e89b92
- Model card original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/README.md
- Notas de seguridad: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/SAFETY.md
- Notas de sesgo: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/BIAS.md
- Notas de privacidad: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/PRIVACY.md
- Notas de explicabilidad: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/EXPLAINABILITY.md
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
