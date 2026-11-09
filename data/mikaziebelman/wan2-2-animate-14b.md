# mikaziebelman/Wan2.2-Animate-14B

## Resumen

Wan2.2-Animate-14B es un modelo de difusión de vídeo especializado en animación de personajes y sustitución de movimiento, desarrollado por el equipo Wan (Alibaba). Se publica como un derivado del modelo base Wan-AI/Wan2.2-I2V-A14B, adaptado para la tarea de video-to-video: toma un vídeo de referencia con movimiento y una imagen de personaje, y replica el movimiento y las expresiones faciales sobre el personaje objetivo. La ficha corresponde a la réplica alojada por el usuario mikaziebelman, no al repositorio oficial.

El modelo se apoya en la arquitectura Wan2.2, que introduce una arquitectura Mixture-of-Experts (MoE) en difusión de vídeo: el proceso de denoising se separa por tramos de timesteps con expertos especializados, lo que amplía la capacidad efectiva sin incrementar proporcionalmente el coste computacional. El repositorio declara 17.274.817.108 parámetros en formato safetensors y un tamaño de 72,4 GB, coherente con pesos en precisión alta (bf16/fp32) más componentes auxiliares.

Es relevante ahora porque Wan2.2-Animate-14B se presentó en septiembre de 2025 como un modelo unificado para animación y reemplazo de personajes con replicación holística de movimiento y expresión, disponible en pesos abiertos bajo licencia Apache 2.0. La réplica aquí descrita no incluye resultados de benchmarks ni métricas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo transformer con Mixture-of-Experts (MoE) por tramos de timesteps (Wan2.2) |
| Parámetros totales | 17.274.817.108 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión de vídeo; no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible en la información proporcionada (el repo incluye ONNX y safetensors; se menciona soporte FP8 en herramientas de la comunidad) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, diffusers |

## Arquitectura y entrenamiento

Wan2.2 emplea una arquitectura de difusión de vídeo con Mixture-of-Experts: el proceso de denoising se divide por tramos de timesteps con modelos expertos especializados, lo que aumenta la capacidad total manteniendo un coste computacional comparable al de un modelo denso de menor tamaño. El modelo base Wan2.2-I2V-A14B es un modelo image-to-video; la variante Animate-14B lo adapta a video-to-video para animación de personajes, replicando movimiento y expresiones sobre una identidad objetivo.

Según la model card del proyecto Wan2.2, el entrenamiento incorpora datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color, y amplía el corpus respecto a Wan2.1 con un 65,6 % más de imágenes y un 83,2 % más de vídeos. No se detallan en la información proporcionada el número exacto de tokens, la composición del dataset ni si hubo etapas de RLHF/DPO. Tampoco se especifican innovaciones de decodificación especulativa o atención lineal para esta variante.

## Capacidades

- Animación de personajes: transferencia de movimiento y expresión desde un vídeo de referencia a un personaje dado.
- Sustitución de personaje (character replacement) en vídeo con replicación holística de movimiento.
- Generación de vídeo video-to-video (pipeline declarado: `video-to-video`).
- Estilo cinematográfico controlable: la model card del proyecto base destaca datos estéticos etiquetados para control de iluminación, composición, contraste y tono.
- Generación de movimiento complejo: mayor generalización en movimiento, semántica y estética respecto a Wan2.1.
- Integración con Diffusers y ComfyUI (según la model card del proyecto).
- Soporte de cuantización FP8 y offload por capas mediante herramientas de la comunidad (DiffSynth-Studio), según la model card.
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no aplica (modelo generativo de vídeo).
- Modo thinking o razonamiento multi-paso: no aplica.

## Casos de uso

- Producción audiovisual y doblaje visual: sustituir al actor de una secuencia por otro personaje manteniendo el movimiento original, útil para localización de contenido o corrección de reparto sin regrabar.
- Animación de avatares para marketing: animar una imagen de personaje con el movimiento de un vídeo de referencia para generar piezas publicitarias consistentes con una identidad de marca.
- Previsualización de animación en videojuegos: aplicar capturas de movimiento reales sobre modelos de personaje para validar animaciones antes de la producción final.
- Contenido para redes sociales: reemplazar el personaje de un clip manteniendo la expresividad facial, con control de estética cinematográfica gracias a los datos etiquetados del modelo base.
- Investigación en transferencia de movimiento: usar los pesos abiertos (Apache 2.0) como base para experimentos de re-targeting de movimiento y expresión facial.
- Postproducción de vídeo: integrar el modelo en pipelines de DiffSynth-Studio o ComfyUI con offload por capas y FP8 para trabajar en GPUs de menor VRAM.
- Creación de demos interactivas: desplegar el modelo en espacios de Hugging Face o ModelScope (existen espacios oficiales de Wan2.2-Animate) para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 17,27 mil millones de parámetros, los pesos en bf16 ocupan aproximadamente 34,5 GB, por lo que la inferencia completa requiere GPUs de 40-80 GB o cuantización/offload.
- El repositorio ocupa 72,4 GB, lo que incluye pesos y componentes auxiliares; se recomienda almacenamiento local holgado.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia completa en bf16; RTX 4090 (24 GB) viable con FP8 y offload por capas según las herramientas de la comunidad (DiffSynth-Studio).
- Cabe en GPU de consumo: sí, con cuantización FP8 y offload por capas; no de forma directa en bf16 en GPUs de 24 GB.
- Opciones de despliegue: Diffusers, ComfyUI (con Kijai's ComfyUI WanVideoWrapper), DiffSynth-Studio; el repo incluye además formato ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-Animate-14B (esta ficha) | 17,27 B | no aplica | video-to-video, animación de personajes | Apache 2.0 | Hugging Face (réplica de usuario) |
| Wan-AI/Wan2.2-I2V-A14B | no disponible en la información | no aplica | image-to-video | Apache 2.0 | Hugging Face (oficial) |
| Wan-AI/Wan2.2-S2V-14B | no disponible en la información | no aplica | speech-to-video | Apache 2.0 | Hugging Face (oficial) |
| Wan-AI/Wan2.2-TI2V-5B | 5 B (según model card) | no aplica | text/image-to-video 720p@24fps | Apache 2.0 | Hugging Face (oficial) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ficha corresponde a una réplica alojada por un usuario (mikaziebelman) con 0 descargas y 0 likes; no es el repositorio oficial de Wan-AI, por lo que conviene verificar la integridad de los pesos antes de usarlos en producción.
- No se han publicado benchmarks ni métricas de calidad para esta variante en la información disponible.
- Riesgo de artefactos en la transferencia de movimiento y expresión, especialmente en movimientos rápidos o identidades muy distintas a las del entrenamiento; no cuantificado.
- Sesgos de los datos de entrenamiento no documentados en la información proporcionada.
- Idiomas soportados no especificados.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los componentes base y de terceros incluidos.
- El pipeline declarado es video-to-video; no debe asumirse soporte de text-to-video o image-to-video en esta variante concreta.
- Requiere hardware de gama alta o configuraciones de cuantización/offload para inferencia práctica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mikaziebelman/Wan2.2-Animate-14B
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Paper Wan2.2: https://arxiv.org/abs/2503.20314
- GitHub Wan2.2: https://github.com/Wan-Video/Wan2.2
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Blog Wan: https://wan.video/welcome
- Demo Wan2.2-Animate en Hugging Face Space: https://huggingface.co/spaces/Wan-AI/Wan2.2-Animate
- Página del proyecto Wan2.2-Animate: https://humanaigc.github.io/wan-animate
- Discord: https://discord.gg/AKNgpMK4Yj
- DiffSynth-Studio: https://github.com/modelscope/DiffSynth-Studio
- ComfyUI WanVideoWrapper (Kijai): https://github.com/kijai/ComfyUI-WanVideoWrapper
- Documentación ComfyUI Wan2.2: https://docs.comfy.org/tutorials/video/wan/wan2_2
