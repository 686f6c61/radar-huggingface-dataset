# HaomingSong/Cosmos3-Nano

## Resumen

Cosmos3-Nano (conversión LeRobot) es un paquete de pesos publicado por HaomingSong que adapta el checkpoint base `nvidia/Cosmos3-Nano` de NVIDIA al formato de política de LeRobot. No se trata de un modelo nuevo ni de un ajuste fino específico de tarea: es una conversión estructural que empaqueta los componentes necesarios para que la interfaz de políticas de LeRobot pueda cargar el modelo y usarlo como punto de partida para posentrenamiento en robótica. El autor original del modelo es NVIDIA; esta conversión solo reorganiza los pesos y añade los ficheros de tokenizador, VAE y procesadores serializados.

La política predice conjuntamente *chunks* de acciones robóticas y latentes de vídeo futuro a partir de instrucciones en lenguaje y observaciones de cámara actuales, con condicionamiento opcional sobre el estado actual del robot. El backbone es un Qwen3-VL MoT (mixture-of-transformers) de 36 capas y anchura oculta 4096, con un VAE Wan2.2 para la parte visual. El recuento de escalares almacenados es de 16.454.213.580, pero el propio autor advierte que esa cifra incluye componentes congelados y el VAE, por lo que no equivale al número de parámetros entrenables o activos.

Es relevante ahora porque permite a la comunidad de LeRobot partir de un modelo base de NVIDIA para políticas robóticas sin tener que reconstruir la conversión, aunque con caveats importantes: no hay fine-tuning de tarea, no se reportan tasas de éxito en bucle cerrado y las características de observación y acción guardadas están vacías, por lo que el dataset objetivo debe aportarlas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL MoT (mixture-of-transformers); política `cosmos3_nano` sobre LeRobot |
| Parámetros totales | 16.454.213.580 escalares almacenados (incluye componentes congelados y VAE Wan2.2; no equivale a parámetros entrenables) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en BF16 mayoritariamente y 4 tensores FP32; el autor recomienda `bfloat16` para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw1.1-license`) |
| Formato de pesos | safetensors (1356 tensores: 1352 BF16 y 4 FP32) |

## Arquitectura y entrenamiento

El modelo es una política multimodal que combina un backbone de visión-lenguaje Qwen3-VL en configuración MoT con 36 capas de decoder y anchura oculta 4096, junto con un VAE Wan2.2 para codificar y decodificar latentes de vídeo. La política opera en modo conjunto vídeo-acción (`wam`), con un único paso de observación y muestreo UniPC. Predice simultáneamente *chunks* de acciones y latentes de vídeo futuro, condicionada por lenguaje y observaciones de cámara, con condicionamiento de estado opcional.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card indica explícitamente que la conversión no añade fine-tuning específico de tarea. El paquete preserva dos recetas de posentrenamiento: la receta DROID (dominio 8, chunks de 32 pasos, condicionamiento de estado, normalización identidad, UniPC con 4 pasos de inferencia y guidance 3) y la receta por defecto LIBERO de la clase de tamaño (dominio 5, chunks de 16 pasos, sin condicionamiento de estado, normalización por cuantiles de acción, UniPC con 30 pasos y guidance 1). El flag `load_action_modules` permite conservar los módulos de acción liberados o reinicializar las proyecciones de entrada/salida de acción y el embedding de modalidad de acción para posentrenamiento estilo nativo.

## Capacidades

- Predicción conjunta de *chunks* de acciones robóticas y latentes de vídeo futuro.
- Condicionamiento por lenguaje natural e imágenes de cámara actuales.
- Condicionamiento opcional sobre el estado actual del robot.
- Muestreo con UniPC configurable en número de pasos y guidance.
- Compatibilidad con la interfaz de políticas de LeRobot (`cosmos3_nano`).
- Soporte de dos recetas de posentrenamiento preconfiguradas (DROID y LIBERO).
- No expone las APIs upstream de razonamiento, audio ni generación de vídeo independiente.
- No se documentan capacidades de tool calling, agentes ni multilingüismo.

## Casos de uso

- Posentrenamiento de políticas robóticas con la receta DROID: usar `--policy.path=HaomingSong/Cosmos3-Nano` para conservar la receta guardada (dominio 8, chunks de 32 pasos, condicionamiento de estado, UniPC con 4 pasos, guidance 3) sobre un dataset cuyo layout de estado y acción coincida exactamente.
- Posentrenamiento con la receta LIBERO por defecto: usar `--policy.type=cosmos3_nano --policy.pretrained_path=HaomingSong/Cosmos3-Nano` para aplicar la receta de la clase de tamaño (dominio 5, chunks de 16 pasos, sin condicionamiento de estado, normalización por cuantiles, UniPC con 30 pasos, guidance 1) sobre un dataset compatible con su layout de cámara y acción.
- Investigación en modelos de mundo para robótica: el modelo predice latentes de vídeo futuro junto con acciones, lo que permite estudiar la coherencia entre planificación visual y ejecución motora en entornos simulados.
- Reentrenamiento nativo de módulos de acción: con `--policy.load_action_modules=false` se reinicializan las proyecciones de acción y el embedding de modalidad, útil para adaptar el modelo a una nueva morfología o espacio de acciones.
- Evaluación comparativa de recetas: al soportar dos configuraciones de posentrenamiento distintas sobre los mismos pesos base, sirve para aislar el efecto de la receta (pasos de UniPC, guidance, condicionamiento de estado) en el rendimiento final.
- Integración en pipelines de LeRobot: al cargarse mediante `PreTrainedConfig.from_pretrained` y la clase de política `cosmos3_nano`, se puede incorporar en flujos de entrenamiento y evaluación existentes de LeRobot, siempre que el dataset aporte las features de observación y acción que el paquete deja vacías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reporta tasa de éxito en bucle cerrado de LIBERO para esta conversión base, y que los resultados de checkpoints LIBERO ajustados por separado o de los modelos NVIDIA Policy-DROID no miden este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los 16.454.213.580 escalares almacenados en BF16 suponen del orden de 33 GB solo en pesos, a los que hay que sumar activaciones, el VAE y los buffers de muestreo; el tamaño del repo es de 33,0 GB.
- GPU recomendadas: no especificadas por el autor. Por el volumen de pesos en BF16, se requiere al menos una GPU con 40-80 GB de VRAM (A100 80 GB, H100) para carga completa sin cuantización; no hay datos publicados de despliegue en RTX 4090.
- ¿Cabe en GPU de consumo? No hay información que lo confirme; con 33 GB en BF16 no cabe en GPUs de 24 GB sin cuantización, y no se documentan tipos de cuantización para este paquete.
- Opciones de despliegue: la vía documentada es LeRobot con una versión que incluya los tipos de política Cosmos3; para inferencia se recomienda `--policy.dtype=bfloat16` y, en evaluación, `--tf32=false`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaomingSong/Cosmos3-Nano (esta conversión) | 16.454.213.580 escalares almacenados (incluye VAE y congelados) | no disponible | sin benchmarks publicados para esta conversión | OpenMDW 1.1 | HuggingFace, 14 descargas |
| nvidia/Cosmos3-Nano (original) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | OpenMDW 1.1 (según la conversión) | HuggingFace (checkpoint fuente) |
| NVIDIA Policy-DROID | no disponible | no disponible | resultados no aplicables a este checkpoint | no disponible | mencionado en la model card |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría (políticas robóticas vídeo-acción) más allá del checkpoint original de NVIDIA y de los modelos Policy-DROID citados.

## Limitaciones y advertencias

- No incluye fine-tuning específico de tarea; es un punto de partida para posentrenamiento, no un modelo listo para producción.
- Las features guardadas de observación y acción están vacías: el dataset objetivo debe aportar frame rate, tamaño de cámara y layout de acción antes de construir la política.
- No se reporta tasa de éxito en bucle cerrado; los resultados de otros checkpoints (LIBERO ajustados, Policy-DROID) no son válidos para medir este.
- El recuento de parámetros almacenados incluye componentes congelados y el VAE, por lo que no debe interpretarse como tamaño efectivo del modelo.
- El paquete no expone las APIs upstream de razonamiento, audio ni generación de vídeo independiente.
- Solo soporta modo conjunto vídeo-acción (`wam`), un único paso de observación y el muestreador UniPC.
- La licencia OpenMDW 1.1 exige conservar la licencia y los avisos de copyright y procedencia al redistribuir; conviene revisar sus términos para uso comercial.
- Riesgo de sesgos y alucinaciones: no evaluado en esta conversión; la model card remite a los documentos de seguridad, sesgo, privacidad y explicabilidad del modelo original de NVIDIA.
- Idiomas soportados no documentados.

## Enlaces

- [HuggingFace: HaomingSong/Cosmos3-Nano](https://huggingface.co/HaomingSong/Cosmos3-Nano)
- [Checkpoint original: nvidia/Cosmos3-Nano (revisión e59a53c25979a090fa8706c9acc0c254a6e89b92)](https://huggingface.co/nvidia/Cosmos3-Nano/tree/e59a53c25979a090fa8706c9acc0c254a6e89b92)
- [Model card original de NVIDIA](https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/README.md)
- [SAFETY.md del modelo original](https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/SAFETY.md)
- [BIAS.md del modelo original](https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/BIAS.md)
- [PRIVACY.md del modelo original](https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/PRIVACY.md)
- [EXPLAINABILITY.md del modelo original](https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/EXPLAINABILITY.md)
- [Licencia OpenMDW 1.1](https://openmdw.ai/license/1-1/)
