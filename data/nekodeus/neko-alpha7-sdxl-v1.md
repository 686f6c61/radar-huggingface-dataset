# Nekodeus/neko-alpha7-sdxl-v1

## Resumen

Neko Alpha7 SDXL v1 es un adaptador LoRA de tipo personaje (character LoRA) para Stable Diffusion XL, publicado por el usuario Nekodeus en Hugging Face. El adaptador se entrena sobre `stabilityai/stable-diffusion-xl-base-1.0` y está diseñado para generar imágenes fotorrealistas de una persona concreta (identificada como Chris Evans en la model card) mediante el token de activación `alpha7`. No es un modelo de lenguaje, sino un módulo de difusión para generación de imágenes texto-a-imagen.

El modelo resuelve un problema muy acotado: la personalización de un modelo de difusión base para reproducir de forma consistente el rostro de un sujeto concreto a partir de un conjunto reducido de imágenes (~100). Con un tamaño de repositorio de 0,2 GB y una dimensión de red de 8, el LoRA es extremadamente ligero y se puede cargar sobre el pipeline SDXL estándar sin reentrenar el modelo base.

Su relevancia es limitada pero práctica: sirve como ejemplo de pipeline de entrenamiento de character LoRAs de bajo coste (GPU P100 de Kaggle, 1500 pasos, 8-bit Adam) y como componente reutilizable dentro de flujos de generación de imágenes con ComfyUI o diffusers. La licencia Apache 2.0 facilita su uso y redistribución, aunque el contenido generado puede estar sujeto a consideraciones de derechos de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Stable Diffusion XL (UNet transformer + VAE + text encoders CLIP) |
| Parametros totales | no disponible (dimensión de red 8/8; tamaño del repo 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión texto-a-imagen; resolución nativa 1024x1024) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors; el modelo base admite fp16/fp32) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`alpha7.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango bajo (network dim 8, alpha 8) aplicado sobre el modelo base Stable Diffusion XL 1.0. SDXL es un modelo de difusión latente con un UNet de mayor tamaño que SD 1.5, doble text encoder (CLIP ViT-L y CLIP ViT-bigG) y un VAE que opera a 1024x1024 píxeles nativos. El LoRA inyecta matrices de bajo rango en las capas del UNet para adaptar la generación al sujeto objetivo sin modificar los pesos del modelo base.

El entrenamiento se realizó con 1500 pasos a resolución 1024, learning rate 1e-4, optimizador AdamW de 8 bits con batch 2, y xformers, sobre una GPU NVIDIA P100 de Kaggle en modo offline. El dataset consta de aproximadamente 100 imágenes de Chris Evans verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of alpha7 person`). No se documenta uso de RLHF, DPO ni técnicas de preferencia; es un ajuste supervisado puro sobre pares imagen-texto.

## Capacidades

- Generación de imágenes texto-a-imagen fotorrealistas de un sujeto concreto mediante el token `alpha7`.
- Personalización de personaje: reproduce el rostro del sujeto entrenado en distintos prompts de escena, iluminación y estilo.
- Compatible con el pipeline `StableDiffusionXLPipeline` de diffusers mediante `load_lora_weights`.
- Compatible con ComfyUI mediante nodo LoRA loader y el token `alpha7` en el prompt.
- Resolución nativa de 1024x1024 píxeles.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Generación de retratos de personaje consistentes: usar `alpha7` junto con prompts de iluminación y encuadre para obtener variaciones fotorrealistas del sujeto en estudios de fotografía sintética.
- Creación de storyboards y previsualización: integrar el LoRA en un pipeline diffusers para generar frames con un personaje recurrente en secuencias narrativas.
- Prototipado de personajes para videojuegos o cómics: generar hojas de personaje con distintas expresiones y ángulos usando el token de activación como ancla de identidad.
- Pruebas de concepto de personalización de difusión: servir como referencia de bajo coste para evaluar la viabilidad de character LoRAs en flujos internos antes de invertir en entrenamientos mayores.
- Composición en ComfyUI: encadenar el LoRA con nodos de ControlNet o img2img para mantener la identidad del sujeto en ediciones controladas.
- Investigación sobre sesgos y derechos de imagen: analizar cómo los LoRAs de personajes reales reproducen rostros y qué salvaguardas son necesarias antes de publicar contenido.
- Docencia y demostraciones: ejemplo didáctico de entrenamiento LoRA con dataset pequeño, caption uniforme y hardware consumer/cloud de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el LoRA en sí ocupa ~0,2 GB; el pipeline SDXL base en fp16 requiere aproximadamente 8-10 GB de VRAM para 1024x1024.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para lotes grandes; el entrenamiento documentado se hizo en una P100 de Kaggle (16 GB).
- Cabe en GPU consumer: sí, en RTX 3060 12 GB o superiores con fp16 y optimizaciones (xformers, attention slicing); en 8 GB puede requerir offloading o resolución reducida.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI (nodo LoRA loader), Automatic1111/Forge con soporte SDXL, y otros frontends compatibles con safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de los pasos de muestreo configurados.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Parametros / tamaño | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha7-sdxl-v1 | SDXL 1.0 | LoRA de personaje | dim 8/8, repo 0,2 GB | 1024x1024 | Apache 2.0 | Hugging Face (0 descargas) |
| Nekodeus/neko-hollywood-alpha-sdxl-v1 | SDXL 1.0 | LoRA de personaje (serie) | no disponible | 1024x1024 | no disponible | Hugging Face |
| Nekodeus/neko-hollywood-alpha-sd15-v1 | SD 1.5 | LoRA de personaje (serie) | no disponible | 512x512 (SD 1.5) | no disponible | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | — | Modelo base de difusión | ~3,5B (UNet + text encoders) | 1024x1024 | CreativeML Open RAIL++-M | Hugging Face |

## Limitaciones y advertencias

- El modelo está entrenado sobre un único sujeto; no generaliza a otras identidades ni a estilos artísticos amplios.
- Dataset de ~100 imágenes con caption uniforme: riesgo de sobreajuste y de baja diversidad en poses, expresiones e iluminación.
- Posible reproducción de sesgos presentes en las imágenes de entrenamiento (edad, género, etnia, encuadre).
- Riesgo de generar imágenes no fieles al sujeto real (alucinación visual) en prompts alejados del dominio de entrenamiento.
- Uso de la imagen de una persona real: la licencia Apache 2.0 cubre los pesos, pero no exime de obligaciones sobre derechos de imagen, publicidad o privacidad en la jurisdicción de uso.
- Sin datos de benchmarks ni evaluaciones de calidad objetivas; no se recomienda para producción sin validación previa.
- Idiomas soportados no documentados; los ejemplos de la model card usan prompts en inglés.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso comunitario ni validación externa.
- No es un modelo de lenguaje: no admite tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-alpha7-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/nekodeus/alpha7-chris-evans
- Serie Hollywood alpha (SD1.5): https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Serie Hollywood alpha (SDXL): https://huggingface.co/Nekodeus/neko-hollywood-alpha-sdxl-v1
- Librería diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
