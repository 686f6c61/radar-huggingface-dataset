# lerobot/cosmos3-edge

## Resumen

Cosmos3-Edge (publicado en Hugging Face como `lerobot/cosmos3-edge`) es la conversión a formato de política de LeRobot del checkpoint base Cosmos3-Edge de NVIDIA. No se trata de un modelo de lenguaje general, sino de un modelo de fundación para robótica: predice conjuntamente *chunks* de acciones del robot y latentes de vídeo futuros a partir de instrucciones en lenguaje y observaciones de cámara actuales, con condicionamiento opcional por el estado actual del robot. Su propósito es servir como punto de partida para post-entrenamiento de políticas robóticas, sin ningún fine-tuning específico de tarea incluido.

El backbone es un Nemotron 3 Dense VL MoT (Mixture-of-Transformers) con 28 capas de decodificador y anchura oculta de 2048, y almacena 4.563.688.396 pesos escalares (incluyendo componentes congelados y un VAE Wan2.2). Es relevante ahora porque integra en el ecosistema LeRobot las capacidades de generación de vídeo y acción de la familia Cosmos de NVIDIA, permitiendo a desarrolladores de robótica hacer post-entrenamiento sobre un modelo base multimodal con recetas documentadas (DROID y LIBERO).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Dense VL MoT (Mixture-of-Transformers), política de vídeo-acción conjunta con UniPC sampler |
| Parametros totales | 4.563.688.396 (pesos escalares almacenados, incluye componentes congelados y VAE) |
| Parametros activos | no disponible (el recuento almacenado no corresponde a parámetros entrenables o activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (mayoría de los tensores), FP32 (4 tensores del time-embedder y dtype guardado para master weights) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (1188 tensores: 1184 BF16 y 4 FP32), tamaño del repo 9,2 GB |

## Arquitectura y entrenamiento

El modelo es una política de robótica basada en un backbone Nemotron 3 Dense VL MoT de 28 capas y anchura 2048, que predice de forma conjunta chunks de acciones del robot y latentes de vídeo futuro (modo `wam`, video-and-action) a partir de lenguaje y una única observación de cámara por paso. La generación usa el sampler UniPC; el paquete incluye además un VAE Wan2.2, ficheros de tokenizador y procesadores serializados de LeRobot. No expone las APIs upstream de razonamiento, audio o generación de vídeo independiente.

Sobre el entrenamiento del checkpoint base original de NVIDIA no hay datos publicados en la información disponible (tokens, composición del dataset, RLHF/DPO). Este repositorio de LeRobot añade exclusivamente la conversión al interfaz de política de LeRobot, sin fine-tuning de tarea. Ofrece dos recetas de post-entrenamiento: la receta DROID guardada (dominio 8, chunks de 32 pasos, condicionamiento por estado, normalización identidad, UniPC con 4 pasos de inferencia y guidance 3) y la receta LIBERO por defecto de la clase de tamaño (dominio 5, chunks de 16 pasos, sin condicionamiento por estado, normalización cuantil de acciones, UniPC con 30 pasos y guidance 1). También permite reinicializar los módulos de acción (`load_action_modules=false`) para post-entrenamiento de estilo nativo.

## Capacidades

- Predicción conjunta de chunks de acciones de robot y latentes de vídeo futuro (modo video-and-action `wam`).
- Condicionamiento por instrucciones en lenguaje y observaciones de cámara actuales.
- Condicionamiento opcional por el estado actual del robot (según receta, por ejemplo en DROID).
- Muestreo de acciones mediante UniPC (configurable en pasos y guidance).
- Integración completa con el interfaz de políticas de LeRobot: carga, post-entrenamiento y evaluación.
- No soporta (no expuesto en este paquete): razonamiento upstream, audio, generación de vídeo independiente, tool calling ni capacidades de agente de propósito general.

## Casos de uso

- Punto de partida para post-entrenamiento de políticas robóticas: se parte del checkpoint base y se ajusta sobre un dataset propio (DROID o LIBERO) para obtener una política específica de manipulación.
- Investigación en modelos de política multimodales: la predicción conjunta de vídeo y acción permite estudiar cómo la predicción de futuros visuales mejora el control del robot.
- Reproducción de recetas LIBERO: usando `--policy.type=cosmos3_edge` se puede entrenar y evaluar en el benchmark LIBERO con la receta por defecto (chunks de 16 pasos, normalización cuantil).
- Fine-tuning con datos DROID: la receta guardada (32 pasos, condicionamiento por estado, guidance 3) facilita replicar el flujo de post-entrenamiento estilo Policy-DROID.
- Reentrenamiento de los módulos de acción desde cero: con `load_action_modules=false` se reinicializan las proyecciones de entrada/salida de acción y el embedding de modalidad, útil para adaptar a layouts de acción nuevos.
- Evaluación comparativa de backbones de política: permite comparar Cosmos3-Edge frente a otras políticas de LeRobot bajo el mismo framework de entrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en LIBERO en bucle cerrado para esta conversión base, y que los resultados de checkpoints LIBERO fine-tuneados por separado o de modelos NVIDIA Policy-DROID no miden este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; como referencia, con 4,56 mil millones de parámetros en BF16 los pesos ocupan del orden de 9 GB, por lo que una GPU con 16 GB de VRAM es un mínimo razonable (estimación, no dato oficial).
- GPU recomendadas: no disponible; para entrenamiento con master weights FP32 se recomienda hardware de gama alta tipo A100/H100 (estimación).
- Consumer GPU: dada la huella de ~9 GB en BF16, modelos como RTX 4090 (24 GB) deberían ser suficientes para inferencia (estimación no verificada).
- Despliegue: a través de la librería LeRobot (`library_name: lerobot`); no hay soporte documentado de vLLM, llama.cpp, Ollama o TGI para este tipo de política.
- Latencia y throughput: no disponible; la receta DROID usa UniPC con 4 pasos de inferencia y la LIBERO con 30 pasos, lo que afecta directamente al coste de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| lerobot/cosmos3-edge | 4,56 mil millones (pesos almacenados) | Política vídeo-acción para robótica (MoT) | OpenMDW 1.1 | Hugging Face, LeRobot |
| nvidia/Cosmos3-Edge (checkpoint original) | no disponible | Modelo base Cosmos3 upstream | OpenMDW 1.1 | Hugging Face |
| Otras políticas de LeRobot (p. ej. pi0, SmolVLA) | no disponible | Políticas de manipulación VLA | no disponible | Hugging Face, LeRobot |

No hay datos de rendimiento comparables publicados para esta conversión base, por lo que la comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Los parámetros almacenados (4,56 mil millones) no representan parámetros entrenables o activos; el paquete incluye componentes congelados y un VAE Wan2.2.
- Las características de observación y acción guardadas están vacías: el frame rate y el tamaño de cámara no están resueltos y deben proporcionarse desde un dataset objetivo antes de construir la política.
- No se ha reportado tasa de éxito en LIBERO para este checkpoint base; los resultados de otros checkpoints no lo miden.
- El layout de estado y acción debe coincidir exactamente con la receta elegida (DROID o LIBERO); la receta LIBERO exige que el dataset coincida con su layout de cámaras y acciones.
- No expone razonamiento, audio ni generación de vídeo independiente del modelo upstream.
- Para evaluación se recomienda desactivar TF32 (`--tf32=false`) y usar BF16 en inferencia; el dtype guardado FP32 es para master weights de entrenamiento.
- La licencia OpenMDW 1.1 exige retener la licencia, avisos de copyright y de origen al redistribuir; conviene revisar el fichero NOTICE y las notas upstream de seguridad, sesgo, privacidad y explicabilidad de NVIDIA.
- Sesgos, riesgo de alucinación y limitaciones de idioma: no disponibles en la información proporcionada; remitirse a los documentos BIAS.md y SAFETY.md del modelo original de NVIDIA.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/lerobot/cosmos3-edge
- Checkpoint original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge/tree/344d602b128d1bbdacb43b08d0a3626f46343e29
- Model card original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/README.md
- Notas de seguridad upstream: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/SAFETY.md
- Notas de sesgo upstream: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/BIAS.md
- Notas de privacidad upstream: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/PRIVACY.md
- Notas de explicabilidad upstream: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/EXPLAINABILITY.md
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
