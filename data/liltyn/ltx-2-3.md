# liltyn/LTX-2.3

## Resumen

LTX-2.3 es un modelo de fundación audiovisual de código abierto desarrollado por Lightricks, presentado como una actualización significativa de LTX-2. Se trata de un modelo basado en Diffusion Transformer (DiT) capaz de generar vídeo y audio sincronizados dentro de un único modelo, sin necesidad de módulos separados. Con 22 000 millones de parámetros, está diseñado para ejecutarse localmente y ofrece pesos abiertos, lo que lo convierte en una opción relevante para investigadores y desarrolladores que necesitan generación de vídeo con audio integrado.

El modelo destaca por su eficiencia y flexibilidad: admite múltiples modalidades de entrada (texto, imagen, vídeo, audio) y produce salidas de vídeo y audio coherentes. La versión 2.3 introduce mejoras en la calidad visual y de audio, así como una mayor adherencia a las instrucciones del prompt. Su licencia comunitaria permite uso comercial bajo ciertas condiciones, y el código fuente está disponible en GitHub, con soporte para Diffusers y ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) |
| Parametros totales | 22 000 millones (22B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de vídeo; no se especifica un contexto textual) |
| Tipos de cuantizacion | no disponible (se pueden generar cuantizaciones GGUF/AWQ a partir de los pesos, pero no se publican oficialmente) |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt (segun etiquetas de HuggingFace; la model card indica solo ingles) |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | safetensors (repositorio Diffusers) |

## Arquitectura y entrenamiento

LTX-2.3 emplea una arquitectura de Diffusion Transformer (DiT) que procesa de forma conjunta las modalidades de vídeo y audio. A diferencia de modelos que generan audio y vídeo por separado, LTX-2.3 integra ambas señales en un espacio latente compartido, lo que permite una sincronización natural entre movimiento y sonido. El modelo se publica en varias versiones: un checkpoint completo (`ltx-2.3-22b-dev`) entrenable en bf16, una versión destilada (`ltx-2.3-22b-distilled`) que requiere solo 8 pasos de inferencia con CFG=1, y una variante destilada 1.1 con estética y audio mejorados. Tambien se incluyen LoRAs para aplicar la destilacion al modelo completo y upscalers espaciales y temporales para pipelines multiescala.

El entrenamiento se describe en el paper "LTX-2: Efficient Joint Audio-Visual Foundation Model" (arXiv:2601.03233). No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset. El modelo base es totalmente entrenable, y Lightricks proporciona un paquete de entrenamiento (`ltx-trainer`) que permite reproducir LoRAs e IC-LoRAs en menos de una hora para tareas de movimiento, estilo o apariencia.

## Capacidades

- Generacion de video a partir de texto (text-to-video), imagen (image-to-video), video (video-to-video) y audio (audio-to-video).
- Generacion de audio sincronizado con el video, incluyendo audio-to-audio y video-to-audio.
- Generacion conjunta de audio y video desde texto o imagen (text-to-audio-video, image-to-audio-video).
- Soporte de resoluciones hasta 4K (2160p) y duraciones de hasta 20 segundos, segun fuentes externas.
- Adherencia mejorada a prompts en la version 2.3 respecto a LTX-2.
- Capacidad de upscaling espacial (x1.5, x2) y temporal (x2) mediante checkpoints adicionales.
- Entrenable: el modelo dev permite fine-tuning completo, y se pueden crear LoRAs e IC-LoRAs.
- No incluye soporte de tool calling ni funciones de agente, al ser un modelo generativo de video/audio.

## Casos de uso

- Creacion de contenido para redes sociales: generar clips cortos con audio sincronizado a partir de una descripcion textual, ideal para TikTok, Reels o Shorts, gracias a su capacidad de producir video y sonido coherentes en un solo paso.
- Doblaje y locucion automatizada: dado un video de entrada, el modelo puede generar audio sincronizado (video-to-audio), lo que permite doblar contenido a otros idiomas o anadir narracion sin herramientas externas.
- Prototipado rapido de anuncios publicitarios: los equipos de marketing pueden generar storyboards animados con audio a partir de un guion, acelerando la validacion de conceptos antes de la produccion final.
- Educacion y formacion: crear videos explicativos con voz sintetizada y animaciones simples a partir de texto, reduciendo costes de produccion para cursos online.
- Postproduccion cinematografica: usar los upscalers espaciales y temporales para aumentar la resolucion y la fluidez de clips generados, integrandolos en flujos de trabajo profesionales.
- Investigacion en generacion audiovisual: el modelo base entrenable permite experimentar con fine-tuning para dominios especificos (por ejemplo, animacion estilizada o contenido cientifico), gracias a su licencia permisiva y al codigo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con otros modelos, ni metricas como FVD, CLIP score o MOS de audio. Se recomienda consultar el paper de LTX-2 (arXiv:2601.03233) para posibles evaluaciones academicas, aunque no se han reproducido aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22B parametros en bf16, se necesitan aproximadamente 44 GB solo para los pesos, mas overhead de activaciones y VAE, por lo que se recomienda al menos 48-80 GB de VRAM. Con cuantizacion de 8 bits, la VRAM se reduce a unos 22-24 GB; con 4 bits, a unos 11-12 GB, aunque la calidad puede degradarse.
- GPU recomendadas: para el modelo completo en bf16, se requieren GPUs profesionales como NVIDIA A100 (80 GB), H100 (80 GB) o A6000 (48 GB). Para versiones cuantizadas, una RTX 4090 (24 GB) podria ejecutar una cuantizacion de 8 bits, y una RTX 3090 (24 GB) con 4 bits.
- En consumer GPU: es posible ejecutar el modelo destilado con cuantizacion 4-bit en GPUs de 24 GB, aunque con limitaciones de resolucion y duracion.
- Opciones de despliegue: el codigo oficial soporta PyTorch (>=3.12, CUDA >12.7) y Diffusers (soporte proximo). Tambien se integra con ComfyUI mediante nodos LTXVideo. No se menciona soporte explicito para vLLM, llama.cpp u Ollama, al ser un modelo de video.
- Latencia y throughput: no disponibles. La version destilada requiere 8 pasos de inferencia, lo que reduce significativamente el tiempo de generacion respecto al modelo dev, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3 (Lightricks) | 22B | no disponible | video + audio | ltx-2-community | open weights |
| LTX-2 (Lightricks) | 22B (estimado) | no disponible | video + audio | ltx-2-community | open weights |
| Open-Sora (HPC-AI) | 7B-11B | no disponible | video (sin audio) | Apache 2.0 | open weights |
| Mochi 1 (Genmo) | 10B | no disponible | video (sin audio) | Apache 2.0 | open weights |

No se dispone de datos de rendimiento comparativos publicados en la informacion proporcionada. LTX-2.3 se diferencia de alternativas como Open-Sora o Mochi 1 por su capacidad nativa de generar audio sincronizado, lo que lo posiciona como una opcion unica en el ecosistema open source.

## Limitaciones y advertencias

- El modelo no esta disenado para proporcionar informacion factual; puede generar contenido falso o inventado.
- Puede amplificar sesgos sociales existentes, como cualquier modelo estadistico.
- La adherencia al prompt no es perfecta; la calidad del resultado depende fuertemente del estilo de prompting.
- Puede generar contenido inapropiado u ofensivo, por lo que se recomienda moderacion en despliegues publicos.
- La generacion de audio sin voz (efectos de sonido, musica) puede tener calidad inferior a la del audio con habla.
- La licencia ltx-2-community-license-agreement impone restricciones de uso comercial; es necesario revisar los terminos completos en el repositorio de GitHub antes de utilizarlo en produccion.
- El tamaño del repositorio (157.6 GB) implica una descarga considerable y requisitos de almacenamiento elevados.
- No se especifica la longitud de contexto temporal maxima; las limitaciones de resolucion y duracion dependen de la VRAM disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liltyn/LTX-2.3
- Coleccion oficial de LTX-2.3: https://huggingface.co/collections/Lightricks/ltx-23
- Repositorio de codigo: https://github.com/Lightricks/LTX-2
- Paper (arXiv): https://huggingface.co/papers/2601.03233
- Demo online: https://app.ltx.studio/ltx-2-playground/i2v
- Guia de prompting: https://ltx.video/blog/how-to-prompt-for-ltx-2
- Documentacion de ComfyUI: https://docs.ltx.video/open-source-model/integration-tools/comfy-ui
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
