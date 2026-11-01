# Marcellus-Zhao/TTT2Reel-Wan2.1-I2V-14B-480P

## Resumen

TTT2Reel-Wan2.1-I2V-14B-480P es una variante del modelo de generacion de video imagen-a-video Wan2.1-I2V-14B de Alibaba, publicada por el usuario Marcellus-Zhao. El modelo anade un LoRA de rango 128 (denominado phi_0) meta-entrenado mediante FOMAML sobre el backbone DiT original, con el objetivo de habilitar la generacion de video de larga duracion mediante test-time training (TTT) por chunks. El backbone se distribuye en bf16 (aproximadamente 32,8 GB en siete shards de safetensors) y los parametros totales ascienden a 16.394.878.784.

La propuesta tecnica consiste en aplicar adaptacion en tiempo de inferencia: el LoRA phi_0 actua como punto de partida meta-aprendido que se ajusta durante la generacion para mantener la coherencia entre chunks de 81 frames a 16 fps y resolucion 480x832. Esto aborda el problema clasico de los modelos de difusion para video, que degradan la consistencia temporal y la identidad cuando se generan secuencias mas alla de su ventana de entrenamiento.

El modelo es relevante para investigadores interesados en tecnicas de test-time training aplicadas a generacion de video, y para desarrolladores que necesiten producir clips largos a partir de una imagen inicial sin reentrenar el modelo base. Requiere el text encoder T5, el VAE y la torre CLIP originales de Wan2.1, que no se redistribuyen en este repositorio. La licencia es Apache-2.0 tanto para el backbone como para el LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre Wan2.1-I2V-14B, con LoRA rank 128 meta-entrenado (FOMAML) |
| Parametros totales | 16.394.878.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa chunks de 81 frames a 16 fps, 480x832) |
| Tipos de cuantizacion | bf16 (pesos distribuidos en bf16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el text encoder subyacente es UMT5-XXL y CLIP XLM-RoBERTa, pero no se detalla cobertura linguistica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (7 shards + index.json) y LoRA safetensors (1,23 GB) |

## Arquitectura y entrenamiento

El backbone es el DiT de Wan2.1-I2V-14B, un transformer de difusion para generacion de video condicionada por imagen y texto. Sobre el se aplica un LoRA de rango 128 y alpha 128 (scaling 1.0) con inicializacion cero en la matriz B, que cubre las proyecciones q, k, v, o, ffn.0 y ffn.2 en los 40 bloques del DiT, sumando 800 tensores. El LoRA se entrena con FOMAML (First-Order MAML) con gradientes internos desconectados, siguiendo una ruta de anclaje i2v estilo SVI: num_motion_frames=1, ref_pad_num=-1, ref_frame_source=first y p_motion_threshold=1.0.

El entrenamiento se realiza por chunks de 81 frames a 16 fps y 480x832. El bucle interno usa AdamW con lr 1e-5, dos pasos de gradiente por chunk y max_inner_grad_norm=1, memorizando la condicion nula pero manteniendo el texto. El bucle externo usa AdamW con lr 1e-4 durante una epoca sobre 6.000 clips de UltraVideo-Long. Se emplea reciclado de error con ratios noise/latent/y/clean de 0.01/0.9/0.9/0.2, buffer de 500 elementos, 50 rejillas y warmup de 50 pasos. La innovacion principal es el uso de test-time training: el LoRA phi_0 se ajusta en inferencia para mantener coherencia entre chunks sucesivos.

## Capacidades

- Generacion de video imagen-a-video: produce secuencias de video a partir de una imagen de referencia y un prompt textual.
- Generacion de video de larga duracion mediante chunking con test-time training, manteniendo coherencia entre fragmentos de 81 frames.
- Control de movimiento inicial mediante la ruta de anclaje i2v (un frame de movimiento, referencia al primer frame).
- Integracion con el ecosistema Diffusers y con un fork de DiffSynth-Studio para el pipeline de video.
- Carga de LoRA sobre el DiT mediante `pipe.load_lora` con alpha configurable.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de clips largos a partir de una sola imagen: el modelo permite producir secuencias de varios chunks encadenados, usando el LoRA phi_0 para mantener la consistencia temporal entre fragmentos de 81 frames.
- Prototipado de animaciones para previsualizacion: estudios y creadores pueden animar storyboards o concept arts con un prompt y una imagen semilla, a resolucion 480x832 y 16 fps.
- Investigacion en test-time training: el repositorio sirve como referencia reproducible de un pipeline FOMAML aplicado a difusion de video, con hiperparametros documentados.
- Experimentacion con LoRAs sobre Wan2.1: al ser un LoRA independiente del backbone, se puede combinar o sustituir por otros adaptadores para tareas especificas.
- Generacion de video para entornos con recursos limitados: al no requerir reentrenamiento del backbone, el coste de adaptacion se limita al bucle interno de dos pasos de gradiente por chunk.
- Benchmarking de consistencia temporal: util para comparar tecnicas de chunking y reciclado de error frente a generacion directa sin TTT.
- Educacion y divulgacion: ejemplo practico de meta-aprendizaje aplicado a modelos generativos de video con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone en bf16 ocupa aproximadamente 32,8 GB, por lo que se necesita al menos una GPU de 40 GB para cargar los pesos sin cuantizacion; con el text encoder T5, el VAE y la torre CLIP adicionales, el requisito agregado es mayor.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs profesionales con 48 GB o mas (por ejemplo, RTX A6000). No se documenta soporte para GPUs de consumo de 24 GB sin cuantizacion adicional.
- Cabe en consumer GPU: no de forma directa en bf16; requeriria cuantizacion no documentada en este repositorio.
- Opciones de despliegue: Diffusers y el fork de DiffSynth-Studio indicado en la model card (`diffsynth.pipelines.wan_video.WanVideoPipeline`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TTT2Reel-Wan2.1-I2V-14B-480P | 16.394.878.784 | 81 frames @ 16 fps, 480x832 | Apache-2.0 | HuggingFace (9 descargas) | LoRA phi_0 con FOMAML para video largo |
| Wan-AI/Wan2.1-I2V-14B | no disponible en la informacion | no disponible | Apache-2.0 | HuggingFace (modelo base) | Backbone original sin TTT |
| Wan-AI/Wan2.1-I2V-14B-480P | no disponible en la informacion | no disponible | Apache-2.0 | HuggingFace | Variante 480P del backbone, fuente del text encoder, VAE y CLIP |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas variantes.

## Limitaciones y advertencias

- El repositorio no incluye el text encoder T5, el VAE ni la torre CLIP; es obligatorio descargarlos de Wan-AI/Wan2.1-I2V-14B-480P y colocarlos junto a los shards.
- Los flags de muestreo deben replicar exactamente la configuracion de entrenamiento (`ttt_steps_per_chunk 1`, `num_motion_frames 1`, `ref_pad_num -1`, `optimizer adamw`, `inner_lr_init 1e-5`, `num_gradient_steps 2`, `lora_rank 128`); desviarse puede degradar la coherencia entre chunks.
- El modelo tiene 9 descargas y 0 likes, sin validacion externa documentada; el autor no publica evaluaciones cuantitativas.
- Riesgo de alucinacion visual y deriva de identidad en secuencias muy largas, aunque el TTT busca mitigarlo; no se documentan limites maximos de duracion.
- No se detalla la cobertura linguistica efectiva de los prompts, aunque el text encoder subyacente es multilingue.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion requiere validacion propia.
- El modelo base Wan2.1 puede arrastrar sesgos de sus datos de entrenamiento (no documentados en esta ficha).
- No se documentan cuantizaciones alternativas, por lo que el despliegue en hardware de consumo no esta soportado de forma oficial.

## Enlaces

- HuggingFace: https://huggingface.co/Marcellus-Zhao/TTT2Reel-Wan2.1-I2V-14B-480P
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B
- Variante 480P del backbone: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
- Dataset de entrenamiento citado: UltraVideo-Long (no se proporciona enlace directo en la informacion disponible)
- Repositorio de despliegue citado: DiffSynth-Studio fork (no se proporciona URL en la informacion disponible)
