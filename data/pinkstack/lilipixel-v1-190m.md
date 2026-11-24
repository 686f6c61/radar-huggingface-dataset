# Pinkstack/LiliPixel-V1-190M

## Resumen

LiliPixel-V1-190M es un modelo de difusión texto-a-imagen desarrollado por Pinkstack, especializado en la generación de pixel art y sprites a resoluciones nativas de 16x16, 32x32 y 64x64 píxeles. Se trata de un Diffusion Transformer (DiT) de un solo flujo entrenado desde cero, con 190,58 millones de parámetros totales, que emplea flow matching rectificado como objetivo de entrenamiento. Su propuesta diferencial frente a modelos de imagen generalistas es la generación nativa en resoluciones de pixel art, sin necesidad de downscaling posterior, y el soporte de canal alfa (RGBA) en las resoluciones de 16 y 32 píxeles.

El modelo utiliza un codificador de texto congelado, MongoDB/voyage-4-nano (~346M parámetros, no incluido en los pesos y descargado automáticamente en el primer uso), que proyecta las características textuales al ancho del transformer. La arquitectura comparte un único transformer entre las tres resoluciones, con capas de patch-in/patch-out separadas: patch size 1 para 16x16 y 32x32, y patch size 2 para 64x64. Con inferencia en BF16 sin pérdida requiere aproximadamente 1 GB de memoria, lo que lo hace muy ligero para despliegue.

Es relevante ahora porque cubre un nicho concreto —la generación de assets de pixel art para videojuegos y prototipado— con un modelo abierto de pequeño tamaño, licencia OpenMDW-1.1 y pesos compatibles con Hugging Face y diffusers, además de una integración específica para ComfyUI mediante un nodo personalizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de un solo flujo, flow matching rectificado |
| Parámetros totales | 190.580.500 (191M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 tokens de texto (prompts más largos se truncan) |
| Tipos de cuantización | BF16 (inferencia sin pérdida); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (compatible con diffusers; pesos EMA) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión de un solo flujo (single-stream DiT) con 24 capas, ancho 768 y 16 cabezas de atención. Los tokens de texto y los tokens de imagen comparten una única secuencia con self-attention completa. El texto se codifica con un encoder congelado (MongoDB/voyage-4-nano, ~346M parámetros) cuyas características se proyectan al ancho del modelo; se emplea un null caption aprendido para classifier-free guidance. La salida es RGBA con valores en [-1, 1].

El objetivo de entrenamiento es rectified flow matching con timesteps de distribución logit-normal y predicción de velocidad (velocity target). El muestreo por defecto usa sampler Euler con 30 pasos (50 para 64x64) y CFG 3.0. El modelo se entrenó con los datasets Pinkstack/LiliPixel-710K-Flux-64pixelart, Angais/pixel-art-atlas-1.4m, azyg0s/pixelart-172k y Chan-Y/pixelart-308k. La transparencia solo se observó durante el entrenamiento en 16x16 y 32x32; las salidas a 64x64 son RGB opacas. Los pesos publicados son pesos EMA compatibles con Hugging Face.

## Capacidades

- Generación de pixel art y sprites a resolución nativa de 16x16, 32x32 y 64x64 píxeles.
- Salida con canal alfa (RGBA) a 16x16 y 32x32, con fondos transparentes.
- Modo realismo a 64x64 activable anteponiendo "realistic photo, " al prompt.
- Generación de escenas descriptivas a 64x64 con captions más largos sobre sujeto y composición.
- Generación por lotes con semillas independientes (seed + i) para seleccionar la mejor imagen.
- Integración con ComfyUI mediante nodo personalizado con modos auto/realistic y control de alpha_cutoff.
- No soporta tool calling, agentes ni capacidades multimodales de entrada.

## Casos de uso

- Generación de sprites para videojuegos 2D: el modelo produce sprites con fondo transparente a 16x16 y 32x32, listos para importar en motores como Godot o Unity, gracias a su salida RGBA nativa.
- Prototipado rápido de assets: para equipos de arte que necesitan bocetos de personajes u objetos a baja resolución, el modelo genera lotes de 4 a 16 imágenes por prompt con semillas distintas para elegir la mejor.
- Creación de iconos y elementos de interfaz retro: a 16x16 o 32x32 se pueden generar iconos de inventario, monedas, pociones u objetos simples describiendo el objeto y añadiendo ", transparent background".
- Generación de fondos y escenas pixel art: a 64x64 el modelo produce escenas con sujeto, acción y fondo de color, útiles para pantallas de título o tiles de ambiente en prototipos.
- Integración en pipelines de ComfyUI: mediante el nodo ComfyUI_LiliPixel.py se puede encadenar la generación con upscaling nearest-neighbour a 512x512 y guardado como PNG transparente dentro de un flujo de trabajo automatizado.
- Iteración artística asistida: con solo ~1 GB de memoria en BF16, el modelo puede ejecutarse en estaciones de trabajo modestas para generar variaciones rápidas de un mismo concepto antes de que un artista las refine manualmente.
- Generación de datasets sintéticos de pixel art: útil para aumentar corpus de entrenamiento de clasificadores o detectores de sprites con etiquetas controladas por prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB con inferencia BF16 sin pérdida, según la model card.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos ~1 GB de VRAM libre y soporte BF16 debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con soporte BF16 (el dato concreto de modelos no está disponible en la información proporcionada).
- Opciones de despliegue: diffusers (DiffusionPipeline con custom_pipeline y trust_remote_code=True), ComfyUI mediante nodo personalizado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM).
- Latencia y throughput: no disponibles. Se recomienda generar lotes de al menos 4 imágenes simultáneamente y seleccionar la mejor.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de pixel art comparables ni resultados de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo se entrenó con una cantidad limitada de imágenes y tiene un tamaño reducido; no genera escenas complejas ni objetos o lugares de nicho. Se recomienda describir con palabras simples (por ejemplo, "cute light blue colored shark plushy" en lugar de "Blahaj").
- En modo 64x64 hay mayor probabilidad de alucinar sujetos; se aconseja generar lotes de 8 a 16 imágenes y seleccionar la mejor.
- Los prompts superiores a 96 tokens se truncan; los prompts muy largos no funcionan bien.
- Solo soporta inglés como idioma de prompt.
- A 64x64 la salida es RGB opaca, no RGBA; no debe usarse para fondos transparentes.
- La frase ", transparent background" debe usarse exactamente como se entrenó para sprites a 16x16 y 32x32.
- Requiere trust_remote_code=True y conexión a internet en la primera carga para descargar el encoder de texto.
- ComfyUI no puede abrir el modelo con sus cargadores de checkpoint integrados; requiere el nodo personalizado.
- Licencia OpenMDW-1.1: deben revisarse sus términos para uso comercial; la información proporcionada no detalla las restricciones concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pinkstack/LiliPixel-V1-190M
- Encoder de texto: https://huggingface.co/MongoDB/voyage-4-nano
- Dataset Pinkstack/LiliPixel-710K-Flux-64pixelart: https://huggingface.co/datasets/Pinkstack/LiliPixel-710K-Flux-64pixelart
- Dataset Angais/pixel-art-atlas-1.4m: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Dataset azyg0s/pixelart-172k: https://huggingface.co/datasets/azyg0s/pixelart-172k
- Dataset Chan-Y/pixelart-308k: https://huggingface.co/datasets/Chan-Y/pixelart-308k
- Nodo ComfyUI: comfyui-workflow/ComfyUI_LiliPixel.py (incluido en el repositorio del modelo)
- Workflow ComfyUI: comfyui-workflow/LiliPixel_V1.json (incluido en el repositorio del modelo)
