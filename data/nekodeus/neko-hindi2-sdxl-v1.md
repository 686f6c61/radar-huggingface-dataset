# Nekodeus/neko-hindi2-sdxl-v1

## Resumen

`Nekodeus/neko-hindi2-sdxl-v1` es un LoRA de personaje para Stable Diffusion XL (SDXL) entrenado por el usuario Nekodeus. Su objetivo es reproducir el rostro y la apariencia del actor indio Salman Khan mediante el token de activación `hindi2`, que debe incluirse en el prompt para que el adaptador se active. No es un modelo generativo autónomo, sino un adaptador que se carga sobre `stabilityai/stable-diffusion-xl-base-1.0` y modifica únicamente el UNet.

El adaptador se entrenó con 51 imágenes verificadas facialmente mediante OpenCV y un pie de foto uniforme (`a photo of hindi2 person`), a resolución de 1024 px con bucketing entre 256 y 2048, durante 1500 pasos. Forma parte del conjunto "Hindi Top-10" del autor, cuya versión pública de datos es `nekodeus/hindi-top10-v2`.

Es relevante para quienes necesitan generar retratos consistentes de una identidad concreta en flujos SDXL sin reentrenar el modelo base. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0, aunque el uso comercial de la imagen de una persona real plantea consideraciones adicionales ajenas a la licencia del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de SDXL (diffusion transformer-like, base SDXL) |
| Parametros totales | no disponible (dim/alpha de red 16/16, solo UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de entrenamiento 1024 px, bucketing 256-2048) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors; el base admite fp16/fp32) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`hindi2.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA de bajo rango aplicado exclusivamente al UNet de SDXL, con dimensión de red y alpha de 16. Se entrenó con `kohya-ss/sdxl_train_network.py`, precisión fp16, gradient checkpointing y atención sdpa, optimizador Adafactor con batch 1 y learning rate 1e-4 durante 1500 pasos. El entrenamiento se realizó en una GPU de Kaggle, de forma totalmente offline.

El dataset consta de 51 imágenes de Salman Khan verificadas con OpenCV y etiquetadas con un stub uniforme (`a photo of hindi2 person`). No se documenta uso de RLHF, DPO ni técnicas de preferencia, algo esperable en un LoRA de personaje. La innovación técnica es limitada por diseño: se trata de un adaptador de identidad, no de un modelo con cambios arquitectónicos.

## Capacidades

- Generación de imágenes text-to-image de retratos de Salman Khan al activarse el token `hindi2`.
- Control de estilo y composición mediante el prompt (por ejemplo, iluminación de estudio, tipo de plano).
- Integración con el pipeline `StableDiffusionXLPipeline` de diffusers y con ComfyUI mediante nodo LoRA loader.
- Compatibilidad con el ecosistema SDXL: samplers, schedulers y otros LoRA combinables (no documentado explícitamente).
- No soporta tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio.
- Capacidad multilingüe de prompts no documentada; los ejemplos usan inglés.

## Casos de uso

- Retratos de personaje consistentes: cargar el LoRA sobre SDXL y usar `hindi2 Salman Khan, portrait photo` para obtener rostros coherentes entre generaciones, útil en ilustración editorial o fan art.
- Pruebas de concepto de identidad en pipelines de difusión: validar cómo un LoRA de bajo rango captura una identidad con solo 51 imágenes y 1500 pasos.
- Composición de escenas temáticas: combinar el token con descripciones de vestuario, iluminación y encuadre para generar variaciones controladas del personaje.
- Integración en ComfyUI para prototipado rápido: colocar `hindi2.safetensors` en `models/loras/` y encadenar nodos de upscale o ControlNet (compatibilidad no verificada).
- Investigación sobre sesgo y representación: analizar cómo un dataset pequeño y un caption uniforme afectan a la diversidad de salidas.
- Educación y demostraciones de fine-tuning: ejemplo reproducible de entrenamiento LoRA SDXL con kohya en hardware gratuito (Kaggle).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en sí ocupa 0,2 GB; el requisito real lo marca SDXL base.
- Inferencia SDXL a 1024 px en fp16: aproximadamente 10-12 GB de VRAM como referencia habitual del modelo base (dato no aportado por el autor; estimación de la familia SDXL).
- GPU recomendadas: A100, H100 o RTX 4090 para generación rápida a 1024 px; RTX 3090/4080 también suficientes.
- Cabe en GPU de consumo con 12 GB o más en fp16; por debajo, requiere optimizaciones (CPU offload, fp16 con atención eficiente) no documentadas en la model card.
- Despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`) y ComfyUI. No se documenta soporte para vLLM, TGI ni llama.cpp (no aplicables a difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| neko-hindi2-sdxl-v1 | LoRA de personaje | SDXL 1.0 | dim/alpha 16 | 1024 px | Apache 2.0 | Hugging Face |
| LoRA de personaje SDXL genérico | LoRA de personaje | SDXL 1.0 | variable | 1024 px | variable | Hugging Face / Civitai |
| SDXL base 1.0 | Modelo completo | — | no disponible | 1024 px | CreativeML Open RAIL++-M | Hugging Face |

No se dispone de datos de rendimiento comparativo entre alternativas.

## Limitaciones y advertencias

- Dataset muy pequeño (51 imágenes) y caption uniforme: riesgo de sobreajuste y de que el token `hindi2` arrastre rasgos del conjunto de entrenamiento.
- Sin datos de benchmarks ni evaluaciones de calidad o fidelidad de identidad.
- El LoRA solo modifica el UNet; no se entrena el text encoder, lo que puede limitar el control fino del prompt.
- Uso de la imagen de una persona real: la licencia Apache 2.0 no cubre derechos de imagen ni publicidad; el uso comercial requiere evaluación legal específica.
- Riesgo de sesgos derivados del dataset (composición demográfica, iluminación, encuadres) no documentado.
- Posible alucinación visual (artefactos faciales, manos, coherencia anatómica) inherente a SDXL y no evaluada por el autor.
- Idiomas de prompt no documentados; los ejemplos están en inglés.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-hindi2-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset público del autor: https://huggingface.co/datasets/nekodeus/hindi-top10-v2
- Herramienta de entrenamiento: https://github.com/kohya-ss/sd-scripts
- diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
