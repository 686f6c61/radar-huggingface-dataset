# julienkay/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusión latente para generación de imágenes a partir de texto, desarrollado originalmente por Robin Rombach y Patrick Esser (CompVis/Stability AI) y publicado bajo licencia CreativeML OpenRAIL-M. Esta ficha concreta corresponde a una re-subida del repositorio `julienkay/stable-diffusion-v1-5`, que recupera la versión ONNX del checkpoint original alojado en `runwayml/stable-diffusion-v1-5`, retirado de Hugging Face. El autor mantiene esta copia principalmente para experimentos de inferencia de modelos de difusión con Unity Sentis, aunque el modelo es compatible con cualquier librería que soporte ONNX.

El modelo parte de los pesos de Stable Diffusion v1-2 y se afinó durante 595 000 pasos a resolución 512x512 sobre el subconjunto "laion-aesthetics v2 5+", aplicando un 10 % de dropout en el condicionamiento textual para mejorar el muestreo con classifier-free guidance. La arquitectura es un modelo de difusión latente (LDM) con un autoencoder variacional, una U-Net de denoising y un codificador de texto CLIP ViT-L/14 congelado.

Su relevancia actual es fundamentalmente práctica: se trata de una de las versiones más ligeras y ampliamente soportadas de la familia Stable Diffusion, útil como referencia para pipelines ONNX, despliegues en entornos con recursos limitados y experimentación con herramientas de inferencia alternativas a PyTorch. No obstante, es un modelo de 2022, superado en calidad por generaciones posteriores (SDXL, SD 3, Flux).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (LDM): VAE + U-Net + codificador de texto CLIP ViT-L/14 |
| Parametros totales | no disponible (la model card no desglosa el recuento; la U-Net de SD 1.5 ronda los 860 M y el VAE y el text encoder suman varios cientos de millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens de prompt (límite del codificador CLIP ViT-L/14) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repo contiene pesos ONNX; el ecosistema admite fp16, fp32 y variantes ONNX optimizadas) |
| Idiomas soportados | inglés (la model card indica "English" como idioma de entrenamiento) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | ONNX (pipeline `OnnxStableDiffusionPipeline` de diffusers) |

## Arquitectura y entrenamiento

Stable Diffusion v1-5 es un modelo de difusión latente: un autoencoder variacional comprime las imágenes a un espacio latente de menor dimensión, una U-Net aprende a eliminar ruido en ese espacio latente condicionada por embeddings de texto, y un decodificador VAE reconstruye la imagen final. El condicionamiento textual lo proporciona un codificador CLIP ViT-L/14 congelado, siguiendo el enfoque introducido en el paper de Imagen y descrito en el paper de Latent Diffusion Models (Rombach et al., CVPR 2022).

El entrenamiento partió de los pesos de Stable Diffusion v1-2 y consistió en 595 000 pasos de fine-tuning a 512x512 sobre "laion-aesthetics v2 5+", con un 10 % de dropout en el texto de condicionamiento para habilitar classifier-free guidance. No se documenta en la información disponible el uso de RLHF, DPO ni preferencias humanas; el ajuste es puramente de difusión supervisada sobre pares imagen-texto. La innovación principal del modelo es la propia formulación de difusión latente, que reduce drásticamente el coste computacional frente a la difusión en píxeles.

## Capacidades

- Generación de imágenes fotorrealistas e ilustraciones a partir de prompts en inglés a resolución nativa de 512x512.
- Modificación de imágenes mediante pipelines derivados (img2img, inpainting) usando el mismo checkpoint.
- Control fino de la generación mediante prompts negativos, escalas de guidance y schedulers de muestreo.
- Compatibilidad con la librería `diffusers` y con el pipeline ONNX (`OnnxStableDiffusionPipeline`).
- Ejecución en entornos sin PyTorch a través de runtimes ONNX, incluido Unity Sentis.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente generativo de imagen.
- No tiene capacidades multilingües: el codificador CLIP está entrenado principalmente con texto en inglés.
- No dispone de modo "thinking", visión de entrada ni audio.

## Casos de uso

- Prototipado de pipelines ONNX: el formato ONNX del repo permite validar flujos de inferencia en runtimes ligeros (ONNX Runtime, Unity Sentis) sin depender de PyTorch, útil para integraciones en motores de videojuegos o aplicaciones de escritorio.
- Generación de arte conceptual y bocetos: con prompts cortos en inglés y 512x512 de resolución, sirve para iterar rápidamente ideas visuales en estudios de diseño, aunque la calidad queda por debajo de modelos posteriores.
- Docencia e investigación sobre difusión: al ser un modelo pequeño y bien documentado, es adecuado para explicar el funcionamiento de LDM, classifier-free guidance y schedulers en cursos y laboratorios.
- Pruebas de sesgo y seguridad: la model card lo recomienda explícitamente para estudiar limitaciones y sesgos de modelos generativos, dado su tamaño manejable y su naturaleza de código abierto.
- Generación de assets para entornos interactivos: la versión ONNX puede integrarse en aplicaciones Unity para producir texturas o ilustraciones en tiempo de ejecución o pre-generación.
- Baseline en comparativas de modelos: sirve como referencia histórica al evaluar modelos de difusión más recientes (SDXL, SD 3, Flux) en términos de calidad, latencia y requisitos de hardware.
- Filtrado y aumento de datos visuales: generación de imágenes sintéticas controladas para experimentos de visión por computador en los que se necesita un generador ligero y local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 4-6 GB para generar una imagen a 512x512 con el pipeline completo (U-Net, VAE y CLIP); en fp32 se duplica aproximadamente.
- La versión ONNX puede ejecutarse en CPU con ONNX Runtime, a costa de latencias notablemente mayores (decenas de segundos por imagen).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 2060, RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos profesionales, A100 o H100 aportan margen para lotes grandes, aunque el modelo está sobredimensionado para ellas.
- Cabe holgadamente en GPU consumer; es uno de los puntos fuertes del modelo frente a generaciones posteriores.
- Opciones de despliegue: `diffusers` (PyTorch), ONNX Runtime, Unity Sentis vía `com.doji.diffusers`; también es compatible con herramientas comunitarias como Automatic1111 o ComfyUI a partir de los pesos originales.
- Latencia y throughput: no disponibles en la información proporcionada; dependen fuertemente del hardware y del número de pasos de muestreo (típicamente 20-50).

## Comparativa con modelos similares

| Modelo | Parametros (aprox.) | Contexto de prompt | Resolucion nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stable Diffusion v1-5 (esta ficha) | U-Net ~860 M + VAE + CLIP | 77 tokens | 512x512 | CreativeML OpenRAIL-M | ONNX en este repo; pesos originales en múltiples mirrors |
| Stable Diffusion v1-4 | Similar a v1-5 | 77 tokens | 512x512 | CreativeML OpenRAIL-M | Pesos originales en CompVis |
| Stable Diffusion 2.1 | U-Net ~865 M + OpenCLIP | 77 tokens | 768x768 | CreativeML OpenRAIL++-M | Disponible en Stability AI |
| Stable Diffusion XL | U-Net ~2.6 B + refiner | 77 tokens (con pooling) | 1024x1024 | CreativeML OpenRAIL++-M | Disponible en Stability AI |

La comparativa se limita a la familia SD porque la información proporcionada no incluye datos de benchmarks que permitan contrastar calidad objetivamente. Frente a v1-4, v1-5 ofrece un afinamiento más largo y mejor adherencia al prompt; frente a SD 2.1 y SDXL, queda por detrás en resolución nativa y calidad, pero es más ligero y ampliamente soportado en formatos ONNX.

## Limitaciones y advertencias

- No alcanza fotorrealismo perfecto y no renderiza texto legible en las imágenes.
- Dificultades con composiciones complejas (por ejemplo, relaciones espaciales entre varios objetos) y con rostros y figuras humanas, que pueden generarse de forma defectuosa.
- Entrenado principalmente con leyendas en inglés: los prompts en otros idiomas producen resultados pobres.
- Riesgo de sesgos sociales y estereotipos heredados de los datos de entrenamiento (LAION); la model card recomienda no usarlo para representar personas o eventos de forma factual.
- Riesgo de generar contenido dañino, discriminatorio o sexual no consentido; el uso responsable recae en el desplegador.
- La licencia CreativeML OpenRAIL-M permite uso comercial con restricciones de uso responsable; conviene revisar sus cláusulas antes de integrarlo en productos.
- La model card original indica que el modelo está pensado para investigación; el uso en producción requiere evaluación adicional de seguridad y calidad.
- Es un modelo de 2022: para nuevas aplicaciones de generación de imagen conviene evaluar alternativas más recientes con mejor calidad y resolución.
- Este repositorio concreto es una re-subida no oficial; la disponibilidad y el mantenimiento dependen del autor `julienkay`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/julienkay/stable-diffusion-v1-5
- Repositorio original (offline): https://huggingface.co/runwayml/stable-diffusion-v1-5
- Repositorio de pesos base: https://huggingface.co/CompVis/stable-diffusion-v1-2
- Integración Unity Sentis del autor: https://github.com/julienkay/com.doji.diffusers
- Paper de Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Paper de classifier-free guidance: https://arxiv.org/abs/2207.12598
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Paper de Imagen: https://arxiv.org/abs/2205.11487
- Paper de DDPM: https://arxiv.org/abs/1910.09700
- Repositorio GitHub de CompVis: https://github.com/CompVis/stable-diffusion
- Blog de Stable Diffusion en Hugging Face: https://huggingface.co/blog/stable_diffusion
- Documentación de diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
