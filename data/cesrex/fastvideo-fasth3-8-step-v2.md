# Cesrex/FastVideo-FastH3-8-Step-V2

## Resumen

FastVideo-FastH3-8-Step-V2 es un checkpoint destilado de generación texto-a-vídeo-y-audio, derivado del modelo base MiniMaxAI/MiniMax-H3. Lo publica el usuario Cesrex como réplica del checkpoint oficial de FastVideo (hao-ai-lab), el proyecto de investigación de la Universidad de Harvard que desarrolla infraestructura de inferencia rápida para modelos de difusión. El modelo genera vídeo y audio sincronizados a partir de una descripción textual empleando únicamente ocho pasadas del transformer, frente a las decenas de pasos que requiere el modelo base.

La relevancia de este checkpoint reside en la reducción drástica del coste computacional: la destilación DMD2 (data-free) junto con el mecanismo de atención VSA-H3 al 80 % de sparsity permite obtener una salida audiovisual completa en ocho forwards, lo que abarata la inferencia en producción. El modelo conserva la arquitectura del H3 base (transformer de difusión con 35.049.751.296 parámetros) y hereda su licencia comunitaria.

Se trata de un artefacto de investigación (0 descargas, 0 likes en el momento de la consulta) orientado a entornos con GPUs de数据中心 como la B200, y no a inferencia en hardware de consumo. Requiere el backend de atención propietario de FastVideo y un planificador de vídeo con shift 10, distinto del 12 del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para generación conjunta de vídeo y audio; atención VSA-H3 (sparse, 80 % sparsity) |
| Parámetros totales | 35.049.751.296 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantización declarada) |
| Idiomas soportados | no disponible (el prompt textual se procesa con el codificador del modelo base) |
| Licencia | minimax-h3-community (licencia comunitaria de MiniMax H3, categoría "other") |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) que genera de forma conjunta vídeo y audio a partir de texto, heredando la arquitectura de MiniMax-H3. Sobre esa base se aplicó una destilación few-step mediante DMD2 (Distribution Matching Distillation 2, arXiv:2405.14867) en su variante *data-free*, combinada con el mecanismo de atención VSA-H3 operando al 80 % de sparsity. El checkpoint corresponde al paso de entrenamiento 1300 y ha sido entrenado para producir la salida audiovisual con exactamente ocho forwards del transformer.

Una innovación técnica destacable es la modificación del planificador: el shift del scheduler de vídeo es 10, en lugar del 12 del modelo base, y el ejemplo de inferencia lee el schedule entrenado directamente del checkpoint. Además, el modelo exige el backend de atención VSA-H3 de FastVideo y, en sistemas CUDA distintos de la ruta B200 probada, requiere flags específicas (`--no-replicated-dit --vsa-kernel triton --no-fa4`). El número de GPUs debe dividir los 56 cabezales de atención de H3.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado (text-to-audio-video).
- Generación de audio asociado al vídeo en la misma pasada de inferencia.
- Inferencia few-step: ocho forwards del transformer por muestra.
- No cubre las tareas FL2VA (first-last frame to video-audio) ni Ref2VA (reference to video-audio), que no fueron destiladas.
- Soporte de tool calling / function calling: no aplica (modelo generativo de medios, no un LLM).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Generación rápida de clips publicitarios: con solo ocho forwards, el modelo permite producir borradores de vídeo con audio para iterar creativamente en ciclos cortos, algo inviable con el modelo base de decenas de pasos.
- Prototipado de storyboards animados: equipos de preproducción pueden convertir guiones textuales en secuencias audiovisuales preliminares para validar ritmo y montaje antes de la producción final.
- Creación de contenido para redes sociales: la reducción de coste por muestra hace rentable generar variantes de un mismo prompt y seleccionar la mejor, manteniendo audio sincronizado.
- Generación de material audiovisual para videojuegos y simulaciones: clips cortos con pista de audio asociada para prototipos de escenas o cinemáticas internas.
- Investigación en destilación de modelos de difusión: el checkpoint sirve como referencia reproducible de DMD2 data-free combinado con atención sparse VSA-H3 al 80 %.
- Evaluación comparativa de pipelines de inferencia: útil para medir throughput y latencia de FastVideo frente a otros backends (vLLM no aplica aquí; el ecosistema es diffusers/FastVideo) en clústeres multi-GPU.
- Generación de audiodescripciones y doblaje sintético preliminar: el audio sincronizado permite generar pistas de referencia para doblaje o accesibilidad antes de la mezcla final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 35.049.751.296 parámetros en safetensors, los pesos en precisión completa superan los 70 GB, por lo que se requiere un entorno multi-GPU o cuantización no documentada.
- GPUs recomendadas: el autor valida la ruta CUDA 13 / Blackwell con cuatro NVIDIA B200 y el schedule entrenado de ocho forwards.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) sin cuantización y sharding no documentados.
- Despliegue: FastVideo (repositorio hao-ai-lab/FastVideo), instalación vía `uv` con `fastvideo-kernel` y extra `.[fasth3]`; requiere el backend de atención VSA-H3. No se documenta soporte para llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- En sistemas multi-GPU CUDA distintos de B200: añadir `--no-replicated-dit --vsa-kernel triton --no-fa4`; el número de GPUs debe dividir los 56 cabezales de atención.
- Latencia y throughput: no disponibles; el autor solo indica que se usan ocho forwards del transformer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastVideo-FastH3-8-Step-V2 | 35.049.751.296 | no disponible | 8 forwards | minimax-h3-community | Hugging Face (Cesrex y FastVideo) |
| MiniMaxAI/MiniMax-H3 (base) | 35.049.751.296 (heredado) | no disponible | decenas de pasos (no especificado) | minimax-h3-community | Hugging Face (MiniMaxAI) |
| FastVideo-FastH3 (otros checkpoints de la colección) | no disponible | no disponible | variable | minimax-h3-community | Hugging Face (colección FastVideo) |

No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre estas variantes.

## Limitaciones y advertencias

- El propio autor advierte de que el movimiento difícil, el detalle fino y parte del audio pueden quedar por debajo del modelo base MiniMax H3.
- No cubre FL2VA ni Ref2VA, tareas que no fueron destiladas.
- Requiere el backend de atención VSA-H3 de FastVideo; no es un checkpoint portable a otros pipelines sin adaptación.
- El shift del scheduler (10) difiere del base (12); usar el ejemplo oficial que lee el schedule del checkpoint.
- Licencia comunitaria MiniMax H3: revisar los términos comerciales antes de usar en producción; el autor la clasifica como "other" con nombre `minimax-h3-community`.
- Riesgo de alucinación visual y de artefactos en audio no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma: no disponibles.
- Repositorio con 0 descargas y 0 likes; es una réplica de un checkpoint oficial, sin validación comunitaria documentada.
- Despliegue exigente: validado en cuatro B200; no apto para hardware de consumo sin cuantización ni sharding no documentados.

## Enlaces

- Hugging Face (réplica de Cesrex): https://huggingface.co/Cesrex/FastVideo-FastH3-8-Step-V2
- Hugging Face (checkpoint oficial de FastVideo): https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2
- Réplica adicional (FanzCEO): https://huggingface.co/FanzCEO/FastVideo-FastH3-8-Step-V2
- Repositorio FastVideo: https://github.com/hao-ai-lab/FastVideo
- Blog FastH3: https://haoailab.com/blogs/fasth3-preview/
- Colección FastH3: https://huggingface.co/collections/FastVideo/fastvideo-fasth3
- Guía de instalación de FastVideo: https://hao-ai-lab.github.io/FastVideo/getting_started/installation/
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Paper DMD2: https://arxiv.org/abs/2405.14867
- Framework DMD2 (NVIDIA FastGen): https://github.com/NVlabs/FastGen
- Nuva Lab: https://nuvalab.ai/
- vLLM: https://vllm.ai/
- NVIDIA: https://www.nvidia.com/en-us/
- MBZUAI: https://mbzuai.ac.ae/
