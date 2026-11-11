# darkmaniac7/tokforge-ios-coreml-image-models

## Resumen

TokForge iOS CoreML Image Models es un repositorio que empaqueta dos modelos de generación de imágenes texto-a-imagen convertidos a Core ML de 6 bits para su ejecución en el Neural Engine de Apple: ReV Animated (un fine-tune de Stable Diffusion 1.5 orientado a arte semi-realista, fantástico y estilizado) y SDXL-Turbo (la variante destilada adversarialmente de SDXL de Stability AI, optimizada para generación en pocos pasos). El autor es darkmaniac7 y el repositorio se publica como catálogo de modelos para la aplicación TokForge, disponible en iOS mediante TestFlight y en Android a través de Google Play.

El interés del repositorio es práctico: no contiene pesos en formato PyTorch ni diffusers, sino bundles de Core ML ya compilados y palettizados a 6 bits, listos para descargar y ejecutar en local en iPhone e iPad. Esto permite generación de imágenes sin conexión una vez descargado el modelo, con requisitos de memoria diferenciados: 4 GB de RAM o más para ReV Animated y 12 GB o más para SDXL-Turbo, ambos sobre iOS 17 o superior.

Ambos modelos generan exclusivamente imágenes de 512 x 512 píxeles, un tamaño fijado en los modelos compilados. La conversión se realizó con `ml-stable-diffusion` 1.1.0 y coremltools 9.0, con cuantización palettizada de 6 bits en UNet y codificadores de texto, y decodificador VAE en fp16 (ReV Animated) o float32 (SDXL-Turbo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet + text encoder(s) + VAE decoder) convertida a Core ML; ReV Animated basada en SD 1.5, SDXL-Turbo basada en SDXL destilado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusión; prompt de texto) |
| Tipos de cuantizacion | Palettización de 6 bits (`--quantize-nbits 6`) en UNet y text encoder(s); VAE decoder en fp16 (ReV Animated) y float32 (SDXL-Turbo) |
| Idiomas soportados | en (inglés) |
| Licencia | Dual: CreativeML OpenRAIL-M + términos de Zovya en Civitai (ReV Animated); Stability AI Community License (SDXL-Turbo) |
| Formato de pesos | Core ML (`Resources/` compilado, `.mlpackage` sin compilar en SDXL-Turbo, zips compilados) |
| Modelo base | stabilityai/sdxl-turbo; ReV Animated de Zovya (fine-tune de SD 1.5) |
| Resolución de salida | 512 x 512 (fija en los modelos compilados) |
| Pasos de inferencia | ReV Animated: 20 (rango 8-40), guidance 7.0; SDXL-Turbo: 2 (rango 1-4), guidance 1.0 |
| Componentes | ReV Animated: TextEncoder, Unet, VAEDecoder (sin VAE encoder); SDXL-Turbo: TextEncoder, TextEncoder2, Unet, VAEDecoder |
| Atención | SPLIT_EINSUM_V2 (ReV Animated), SPLIT_EINSUM (SDXL-Turbo) |
| Batch del UNet | 2 (layout de los pipelines de Apple) |
| Requisitos de dispositivo | ReV Animated: 4 GB RAM o más; SDXL-Turbo: 12 GB RAM o más; iOS 17 o superior |
| Tamaño del repo | 7.4 GB (10.2 GB descomprimido, 56 archivos) |
| Descarga por modelo | ReV Animated: 854 MB (zip); SDXL-Turbo: 2.74 GB (zip) |
| Librería | ml-stable-diffusion |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos: convierte y cuantiza dos modelos preexistentes. ReV Animated es un fine-tune de Stable Diffusion 1.5 creado por Zovya, orientado a estética semi-realista, fantasía y arte estilizado. SDXL-Turbo es la variante de SDXL destilada adversarialmente por Stability AI, diseñada para generar imágenes en uno a cuatro pasos sin classifier-free guidance (de ahí que su ajuste de guidance sea 1.0 en el pipeline de Apple).

La conversión se realizó con Apple `ml-stable-diffusion` 1.1.0 y coremltools 9.0, según el `metadata.json` de cada modelo. Se aplicó palettización de 6 bits al UNet y a los codificadores de texto, manteniendo el decodificador VAE en mayor precisión (fp16 en ReV Animated, float32 en SDXL-Turbo). Para ReV Animated se usó atención `SPLIT_EINSUM_V2`; para SDXL-Turbo, `SPLIT_EINSUM` con latentes de 64 x 64 (`--latent-h 64 --latent-w 64`). Los UNet están compilados para batch de dos, el layout que los pipelines de Apple alimentan en cada paso. Los pesos no se reentrenaron ni se fine-tunearon durante la conversión. ReV Animated se ejecuta sobre `StableDiffusionPipeline` y SDXL-Turbo sobre `StableDiffusionXLPipeline` (iOS 17 o superior).

## Capacidades

- Generación de imágenes texto-a-imagen en local (on-device) en iPhone e iPad mediante Core ML y el Apple Neural Engine.
- ReV Animated: estética semi-realista, fantasía y arte estilizado, con 20 pasos por defecto (ajustable entre 8 y 40) y guidance 7.0.
- SDXL-Turbo: generación en muy pocos pasos (2 por defecto, rango 1-4) con guidance 1.0, adecuada para respuestas rápidas en dispositivos de 12 GB de RAM o más.
- Funcionamiento sin conexión una vez descargado el modelo: la inferencia no requiere red.
- Integración con la app TokForge para iOS (TestFlight) y Android (Google Play), que descarga, descomprime y ejecuta el modelo en el Neural Engine.
- Salida fija de 512 x 512 píxeles.
- Prompts en inglés (idioma declarado: en).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un pipeline de difusión puro.

## Casos de uso

- Generación de arte estilizado y fantasía en dispositivos Apple: ReV Animated, con su fine-tune de SD 1.5, permite crear ilustraciones semi-realistas directamente en el iPhone o iPad sin conexión, útil para artistas que trabajan en movilidad.
- Prototipado rápido de conceptos visuales: SDXL-Turbo con 2 pasos y guidance 1.0 ofrece iteraciones muy rápidas en dispositivos de 12 GB de RAM o más, adecuado para explorar variaciones de una idea antes de pasar a un pipeline de mayor resolución.
- Aplicaciones iOS de creación de contenido offline: al ejecutarse en el Neural Engine y no requerir red tras la descarga, encaja en apps de edición o generación de imágenes para entornos sin conectividad (viajes, zonas rurales, aviación).
- Demos y pruebas de concepto de IA on-device: el repositorio sirve como referencia de conversión Core ML con palettización de 6 bits para equipos que quieran medir el rendimiento del Neural Engine con modelos de difusión.
- Generación de avatares e ilustraciones para apps sociales o de mensajería: la salida fija de 512 x 512 es suficiente para thumbnails y avatares, y el modelo corre en el propio dispositivo del usuario.
- Educación y experimentación con modelos de difusión: al incluir los `.mlpackage` sin compilar de SDXL-Turbo, el repositorio permite inspeccionar la estructura convertida y estudiar el efecto de la cuantización palettizada.
- Integración en la app TokForge: los modelos se listan en el catálogo de la app y se descargan bajo demanda (854 MB o 2.74 GB según el modelo), lo que facilita su distribución a usuarios finales sin empaquetar los pesos en la app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ReV Animated requiere un dispositivo con 4 GB de RAM o más; SDXL-Turbo requiere 12 GB de RAM o más (según la model card, en el contexto de TokForge para iOS).
- GPU recomendadas: Apple Neural Engine en iPhone e iPad; no se mencionan GPUs de escritorio (A100, H100, RTX 4090) porque el formato es Core ML, no PyTorch.
- Compatibilidad con GPU de consumo: el modelo está pensado para hardware Apple móvil; no se indica soporte para GPUs NVIDIA o AMD.
- Sistema operativo: iOS 17 o superior.
- Opciones de despliegue: app TokForge para iOS (TestFlight) y Android (Google Play); ejecución mediante `ml-stable-diffusion` de Apple con `StableDiffusionPipeline` (ReV Animated) y `StableDiffusionXLPipeline` (SDXL-Turbo). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusión Core ML.
- Latencia y throughput: no disponibles. La model card solo indica el número de pasos por defecto (20 para ReV Animated, 2 para SDXL-Turbo), sin tiempos medidos.
- Tamaño de descarga: 854 MB (zip de ReV Animated) y 2.74 GB (zip de SDXL-Turbo); el repositorio completo ocupa 7.4 GB (10.2 GB descomprimido, 56 archivos).

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto/prompt | Resolución | Licencia | Formato/despliegue |
|---|---|---|---|---|---|---|
| TokForge ReV Animated CoreML 6-bit | SD 1.5 fine-tune (Zovya) | no disponible | prompt de texto (inglés) | 512 x 512 | CreativeML OpenRAIL-M + términos de Zovya | Core ML, on-device iOS |
| TokForge SDXL-Turbo CoreML 6-bit | stabilityai/sdxl-turbo | no disponible | prompt de texto (inglés) | 512 x 512 | Stability AI Community License | Core ML, on-device iOS |
| stabilityai/sdxl-turbo (original) | SDXL destilado | no disponible en la información | prompt de texto | 512 x 512 (nativa) | Stability AI Community License | PyTorch/diffusers |
| Stable Diffusion 1.5 (original) | — | no disponible en la información | prompt de texto | 512 x 512 | CreativeML OpenRAIL-M | PyTorch/diffusers |

La comparación relevante es de formato y despliegue: los modelos de este repositorio son bundles Core ML palettizados a 6 bits para el Neural Engine, mientras que los originales son checkpoints PyTorch/diffusers. No se dispone de datos de rendimiento comparativo (FID, CLIP score, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Resolución fija de 512 x 512: el tamaño está incorporado en los modelos compilados y no es configurable.
- SDXL-Turbo exige iOS 17 o superior y un dispositivo con 12 GB de RAM o más en TokForge, lo que restringe su uso a modelos de iPhone/iPad de gama alta.
- ReV Animated no incluye VAE encoder, por lo que solo hace texto-a-imagen (no image-to-image ni inpainting).
- Los archivos son bundles de runtime Core ML, no checkpoints de diffusers ni PyTorch: no se pueden cargar directamente en pipelines de Python habituales sin conversión.
- Idioma: prompts en inglés (idioma declarado: en); no se garantiza buen rendimiento en otros idiomas.
- Licencia dual y restrictiva: ReV Animated exige atribución, prohíbe vender el modelo o fusiones del mismo y prohíbe su uso en otros servicios de generación de imágenes; SDXL-Turbo permite uso comercial gratuito solo a individuos y organizaciones con menos de 1 millón de dólares de ingresos anuales, exige registro con Stability AI para uso comercial y aplica los términos de aviso de la licencia.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión: no se documentan evaluaciones de sesgo en la información disponible.
- Sin benchmarks publicados: no hay métricas objetivas de calidad, latencia ni throughput en la model card.
- Repositorio con muy baja adopción (15 descargas, 0 likes) y autor individual; no hay garantía de mantenimiento ni soporte.
- La fecha de creación indicada (2026-06-25) y la de actualización (2026-11-11) figuran en los metadatos; verificar su coherencia antes de citarlas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/darkmaniac7/tokforge-ios-coreml-image-models
- Colección TokForge iOS Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-models-6a38cca9b57803e6168ce232
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight (TokForge): https://testflight.apple.com/join/jnufjzRr
- Modelo base SDXL-Turbo: https://huggingface.co/stabilityai/sdxl-turbo
- Licencia SDXL-Turbo (Stability AI Community License): https://huggingface.co/stabilityai/sdxl-turbo/blob/main/LICENSE.md
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- ReV Animated en Civitai (Zovya): https://civitai.com/models/7371
- Apple ml-stable-diffusion: https://github.com/apple/ml-stable-diffusion
