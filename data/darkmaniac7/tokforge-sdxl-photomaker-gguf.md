# darkmaniac7/TokForge-SDXL-PhotoMaker-GGUF

## Resumen

TokForge-SDXL-PhotoMaker-GGUF es un paquete de pesos para generación de imágenes con identidad de referencia, publicado por TokForge (darkmaniac7) para su aplicación de inferencia en dispositivo. Combina el modelo base SDXL RealVisXL V4.0 (finetune fotorrealista de SG161222) con el adaptador PhotoMaker v1 de TencentARC, que permite introducir a la persona de una fotografía de referencia en escenas descritas mediante texto. El resultado es un pipeline text-to-image e image-to-image que mantiene el rostro reconocible mientras el prompt controla la escena completa.

A pesar del sufijo "GGUF" en el nombre del repositorio, la model card indica explícitamente que no hay archivos GGUF: el modelo base debe permanecer sin cuantizar en f16, porque la fusión de la identidad de PhotoMaker se aplica estilo LoRA sobre los pesos del UNet de SDXL y requiere pesos promovibles a F32. Sobre una base cuantizada, el helper de stable-diffusion.cpp falla con la aserción `src1 must be F32` tanto en CPU como en OpenCL.

El paquete está pensado para ejecutarse en teléfonos Android con chip Snapdragon mediante el motor stable-diffusion.cpp sobre CPU, en la gama de 16 GB de RAM o más. Se distribuye como cuatro archivos safetensors que suman 7,87 GB: base f16 con doble codificador CLIP, UNet y VAE; adaptador PhotoMaker; decodificador TAESDXL; y sumas MD5. La licencia es una combinación de CreativeML OpenRAIL++-M, los términos de Civitai de SG161222, Apache-2.0 y MIT según el componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDXL (UNet + doble CLIP + VAE) con adaptador PhotoMaker v1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; prompt de texto) |
| Tipos de cuantizacion | f16 únicamente para la base; sin GGUF ni cuantización (la fusión de identidad requiere F32 promovible) |
| Idiomas soportados | en |
| Licencia | openrail++ (CreativeML OpenRAIL++-M) + términos Civitai de SG161222 + Apache-2.0 (PhotoMaker) + MIT (TAESDXL) |
| Formato de pesos | safetensors para stable-diffusion.cpp (f16) |
| Resolución nativa | 1024x1024 |
| Tamano del repo | 7,9 GB (4 archivos) |
| Modelo base | SG161222/RealVisXL_V4.0 |
| Adaptador | TencentARC/PhotoMaker v1 |
| Pipeline | text-to-image, image-to-image |

## Arquitectura y entrenamiento

El paquete no entrena un modelo nuevo: ensambla un SDXL completo (RealVisXL V4.0, finetune fotorrealista multi-paso) con el adaptador PhotoMaker v1. PhotoMaker apila la imagen de referencia dentro del token de activación `img` y fusiona un embedding de identidad en el UNet de SDXL mediante una operación estilo LoRA. Esta fusión se aplica según un calendario `start_merge_step` a lo largo de los 20 a 30 pasos de denoising, por lo que el autor insiste en usar una base multi-paso y no un checkpoint Lightning de pocos pasos: en 6 pasos no hay margen suficiente para que converja la fusión de identidad.

La base se mantiene en f16 porque la fusión LoRA necesita pesos promovibles a F32; con pesos cuantizados, la ruta nativa `--photo-maker` de stable-diffusion.cpp aborta por aserción. El bundle incluye un decodificador TAESDXL en f16 (2,45 MB) para la opción de decodificación rápida. No se documentan en la model card datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) ni innovaciones adicionales más allá de la integración de PhotoMaker en el motor de inferencia en dispositivo.

## Capacidades

- Generación de imágenes text-to-image a 1024x1024 con estética fotorrealista (herencia de RealVisXL V4.0).
- Image-to-image con identidad de referencia: introduce a la persona de una foto adjunta en la escena descrita.
- Condicionamiento de identidad de un solo sujeto mediante el token de activación `img`, que debe colocarse tras la palabra de clase (`a man img`, `a woman img`).
- Mantenimiento de rostro reconocible mientras el prompt controla escena, vestuario y composición.
- Decodificación rápida opcional mediante TAESDXL.
- Inferencia en dispositivo (offline una vez descargado el modelo) en Android con Snapdragon.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Retratos personalizados en móvil: el usuario adjunta una foto de su rostro y describe una escena ("me as a superhero, face visible") para obtener una imagen donde su identidad se mantiene reconocible, sin enviar datos a la nube.
- Aplicaciones de consumo con privacidad por diseño: al ejecutarse en el dispositivo con stable-diffusion.cpp, las fotos de referencia no salen del teléfono, lo que resulta adecuado para apps de avatares o recuerdos personales.
- Generación de avatares y retratos de perfil: la combinación de RealVisXL V4.0 (fotorrealismo) y PhotoMaker permite producir retratos consistentes con la misma persona en distintos estilos y encuadres.
- Pruebas de vestuario o previsualización de estilismo: describir cambios de ropa o ambientación manteniendo el rostro de referencia, útil en apps de moda o creación de contenido.
- Prototipado de apps de imagen generativa en Android: sirve como tier de referencia para desarrolladores que quieran evaluar la ruta `--photo-maker` de stable-diffusion.cpp en hardware móvil de gama alta.
- Ilustración de contenido editorial o de marketing con modelo de persona concreto: generar variaciones de una misma figura en escenas distintas para campañas o material promocional, siempre que la licencia lo permita.
- Sustituto ligero en dispositivos de 8 GB: no aplica directamente; para esa gama el autor remite al tier `darkmaniac7/TokForge-SD15-IPAdapter`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el autor indica que la base f16 completa de SDXL a 1024x1024 es pesada y requiere telefonos de clase 16 GB de RAM o mas; no se especifica VRAM para GPU de escritorio.
- GPU recomendadas: no disponible en la informacion proporcionada; el bundle esta orientado a CPU de Snapdragon en Android.
- Consumer GPU: no se documenta compatibilidad ni encaje en GPUs de consumo (RTX 4090, etc.); el formato esta pensado para stable-diffusion.cpp.
- Opciones de despliegue: stable-diffusion.cpp con la ruta nativa `--photo-maker` (equivalente a `sd -M img_gen -m realvisxl-v40-fp16.safetensors --photo-maker photomaker-v1.safetensors --input-id-images-dir <dir> -p "..."`), y la app TokForge en Android (Google Play) e iOS TestFlight.
- Ajustes de render documentados: sampler `euler`, 20 pasos, cfg-scale 5.0, 1024x1024.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion | Identidad de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-SDXL-PhotoMaker-GGUF | no disponible (SDXL completo) | no aplica | 1024x1024 | Si (PhotoMaker v1) | openrail++ + terminos Civitai + Apache-2.0 + MIT | Hugging Face, app TokForge |
| darkmaniac7/TokForge-SD15-IPAdapter | no disponible (SD 1.5) | no aplica | no disponible | Si (IP-Adapter) | no disponible | Hugging Face, tier para 8 GB |
| SG161222/RealVisXL_V4.0 | no disponible (SDXL) | no aplica | 1024x1024 | No (solo texto) | terminos Civitai de SG161222 | Hugging Face |
| TencentARC/PhotoMaker | no disponible (adaptador) | no aplica | depende del SDXL base | Si | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El nombre del repositorio menciona GGUF, pero no contiene archivos GGUF; la base debe permanecer en f16 sin cuantizar por la aserción `src1 must be F32` de stable-diffusion.cpp.
- Solo admite identidad de un único sujeto; no esta documentado el soporte multi-sujeto.
- El rostro de referencia debe estar visible y sin obstrucciones para que la identidad sea reconocible.
- El token `img` debe mantenerse en el prompt tras la palabra de clase; la app lo inserta automáticamente, pero en uso manual es un paso propenso a error.
- Requiere base multi-paso (20 a 30 pasos); los checkpoints Lightning de pocos pasos no permiten que converja la fusión de identidad.
- Idioma de prompt: solo en.
- Licencia compuesta: OpenRAIL++-M con restricciones de uso, mas los términos de Civitai de SG161222; el uso comercial debe revisarse contra ambas licencias.
- Riesgo de alucinación visual y de artefactos en rostros, manos y detalles finos propio de SDXL; no hay datos de benchmarks publicados que cuantifiquen la fidelidad de identidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- Rendimiento en móvil dependiente del chip Snapdragon y de la clase de 16 GB de RAM; no se documentan latencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SDXL-PhotoMaker-GGUF
- Modelo base RealVisXL V4.0: https://huggingface.co/SG161222/RealVisXL_V4.0
- Adaptador PhotoMaker: https://huggingface.co/TencentARC/PhotoMaker
- Licencia CreativeML OpenRAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
- Motor stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Tier ligero para 8 GB: https://huggingface.co/darkmaniac7/TokForge-SD15-IPAdapter
- Coleccion de modelos de imagen para Android: https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
