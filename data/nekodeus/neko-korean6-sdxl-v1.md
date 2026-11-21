# Nekodeus/neko-korean6-sdxl-v1

## Resumen

Neko Korean6 SDXL v1 es un adaptador LoRA de tipo character para Stable Diffusion XL, desarrollado por el usuario Nekodeus bajo licencia Apache 2.0. Su función es reproducir el rostro de la actriz surcoreana Song Hye-kyo en generaciones de imagen texto-a-imagen a 1024 px, mediante un token disparador específico (`korean6`) que debe incluirse en el prompt. El modelo base sobre el que se aplica es `stabilityai/stable-diffusion-xl-base-1.0`.

Se trata de un LoRA de red pequeña (dimensión 16, alpha 16, solo UNet), entrenado en 1500 pasos sobre un conjunto de 43 imágenes verificadas facialmente con OpenCV. Forma parte del conjunto "Korean Top-10" del mismo autor, con el dataset público `nekodeus/korean-top10-v2` (subcarpeta `korean6/`). El repositorio ocupa 0,2 GB y contiene los pesos en formato safetensors junto con imágenes de muestra del set de entrenamiento.

Su relevancia es acotada: no es un modelo fundacional ni compite en benchmarks generales, sino una pieza de personalización para pipelines de generación de retratos consistentes con una identidad concreta. Resulta útil para quien necesite integrar esa identidad facial en flujos de trabajo con diffusers o ComfyUI sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion XL (difusión latente) |
| Parametros totales | no disponible (dimensión de red 16 / alpha 16, solo UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de entrenamiento 1024 px, bucketing 256-2048) |
| Tipos de cuantizacion | no disponible (pesos en fp16 para el adaptador; el base admite fp16/fp32) |
| Idiomas soportados | no disponible (los prompts se interpretan vía el text encoder de SDXL, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`korean6.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado exclusivamente al UNet de Stable Diffusion XL, con dimensión de red y alpha de 16. Se entrenó con la herramienta `sdxl_train_network.py` de kohya-ss, a resolución 1024 px con bucketing entre 256 y 2048, durante 1500 pasos, con learning rate 1e-4, optimizador Adafactor, batch 1, precisión fp16, gradient checkpointing y atención sdpa. El entrenamiento se realizó en una GPU de Kaggle, de forma totalmente offline y sin tokens.

El dataset consta de 43 imágenes curadas de Song Hye-kyo, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of korean6 person`). No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; tampoco se especifica el número de tokens de entrenamiento ni la composición detallada del dataset más allá de las 43 imágenes citadas.

## Capacidades

- Generación de retratos e imágenes de la identidad Song Hye-kyo mediante el token disparador `korean6`.
- Personalización de estilo fotográfico (iluminación de estudio, retrato, etc.) combinable con el prompt.
- Integración como adaptador LoRA sobre SDXL en diffusers y ComfyUI.
- Compatible con el ecosistema de SDXL: controlnet, img2img y otros adaptadores, sujeto a la compatibilidad del pipeline.
- No soporta tool calling, agentes, razonamiento multi-step ni modalidades de audio o vídeo.
- Capacidad multilingüe de prompts: no documentada; se asume el comportamiento del text encoder de SDXL.

## Casos de uso

- Retratos consistentes de personaje: usar `korean6` junto con el prompt de identidad para generar retratos fotorrealistas a 1024 px en pipelines de diffusers, manteniendo coherencia facial entre imágenes.
- Ilustración editorial y storyboards: generar variaciones de una misma figura en distintas escenas y encuadres para maquetas o previsualizaciones.
- Pruebas de concepto en ComfyUI: cargar el safetensors en `models/loras/` y encadenar nodos de LoRA loader para experimentar con estilos y composiciones.
- Prototipado de personajes para juegos o narrativa visual: obtener referencias rápidas de una identidad concreta antes de encargar arte final.
- Investigación sobre personalización de difusión: usar el adaptador como caso de estudio de LoRA de baja dimensión (dim 16) entrenado con pocos pasos (1500) y dataset reducido (43 imágenes).
- Docencia y demostraciones de SDXL: ejemplo práctico de entrenamiento offline en GPU de Kaggle con kohya-ss.
- Generación de avatares y material promocional ficticio: siempre que se respeten las consideraciones legales sobre el uso de la imagen de personas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (repo de 0,2 GB); el requisito real lo marca el modelo base SDXL.
- Inferencia en fp16 del base SDXL: aproximadamente 8-10 GB de VRAM para 1024 px; con optimizaciones (attention slicing, VAE tiling) puede reducirse.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para comodidad a 1024 px; A100/H100 para lotes grandes o despliegue concurrente.
- Cabe en GPU de consumo: RTX 3060 12 GB y superiores con fp16 y optimizaciones; en 8 GB requiere cuantización o resolución reducida.
- Opciones de despliegue: diffusers (carga con `load_lora_weights`), ComfyUI (nodo LoRA loader), Automatic1111/Forge (compatible con LoRA SDXL), y servidores de inferencia basados en diffusers.
- Latencia y throughput: no disponibles; dependen del hardware y del scheduler elegido.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Neko Korean6 SDXL v1 | LoRA de personaje | SDXL 1.0 | dim 16 (UNet) | 1024 px (bucket 256-2048) | Apache 2.0 | Hugging Face |
| Otros LoRA de personaje SDXL | LoRA de personaje | SDXL 1.0 | variable (dim 8-128) | 1024 px | variable (a menudo Apache 2.0 o CreativeML) | Hugging Face / Civitai |
| IP-Adapter (SDXL) | Adaptador de imagen | SDXL 1.0 | no disponible | 1024 px | Apache 2.0 (según variante) | Hugging Face |
| SDXL base 1.0 | Modelo fundacional | — | ~3.5B (UNet + text encoders) | 1024 px | CreativeML Open RAIL++-M | Hugging Face |

No se dispone de datos de rendimiento comparativo para este adaptador concreto.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre 43 imágenes de una única persona, el adaptador puede reproducir sesgos de iluminación, ángulo y estilo presentes en ese conjunto reducido.
- Riesgo de alucinación: como todo modelo de difusión, puede generar rasgos faciales inconsistentes o artefactos, especialmente fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no hay información sobre el comportamiento con prompts en castellano; el text encoder de SDXL está optimizado para inglés.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el modelo base SDXL 1.0 tiene licencia CreativeML Open RAIL++-M, con restricciones de uso; conviene revisarlas antes de un uso comercial.
- Uso de imagen de persona real: la generación de la imagen de Song Hye-kyo plantea riesgos legales y éticos (derecho de imagen, deepfakes, suplantación); su uso comercial o difamatorio puede ser ilícito.
- Dataset pequeño y entrenamiento corto (1500 pasos): la fidelidad puede ser limitada frente a LoRA entrenados con más datos y pasos.
- No hay métricas publicadas de calidad ni evaluaciones independientes; el rendimiento real debe validarse en el pipeline concreto.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-korean6-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/korean-top10-v2
- Repositorio de entrenamiento kohya-ss: https://github.com/kohya-ss/sd-scripts
- Diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
