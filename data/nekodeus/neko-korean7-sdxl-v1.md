# Nekodeus/neko-korean7-sdxl-v1

## Resumen

neko-korean7-sdxl-v1 es un adaptador LoRA de tipo personaje para Stable Diffusion XL, desarrollado por Nekodeus bajo licencia Apache 2.0. El modelo se entrena sobre `stabilityai/stable-diffusion-xl-base-1.0` para reproducir el rostro de la actriz surcoreana Jun Ji-hyun, activado mediante el token disparador `korean7`. Se enmarca dentro del conjunto "Korean Top-10" del mismo autor, del que forma parte como séptima entrada.

Técnicamente, se trata de un LoRA de red de rango bajo (dimensión y alpha de 16) aplicado exclusivamente a las capas del UNet, entrenado a 1024 px durante 1500 pasos con el script `sdxl_train_network.py` de kohya-ss. El repositorio ocupa 0,2 GB y distribuye los pesos en formato `safetensors` para su carga directa con la librería `diffusers` o en ComfyUI.

Su relevancia es acotada: no es un modelo de lenguaje ni un modelo fundacional, sino un adaptador de personalización visual orientado a la generación de retratos fotorrealistas de una identidad concreta. Resulta útil para quien necesite integrar dicha identidad en flujos de generación de imágenes con SDXL sin reentrenar, aunque su dataset de entrenamiento es reducido (43 imágenes) y su adopción pública es nula en el momento del análisis.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre UNet de Stable Diffusion XL |
| Parametros totales | no disponible (adaptador de rango 16; el repo ocupa 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión text-to-image; resolución de 1024 px) |
| Tipos de cuantizacion | no disponible (pesos fp16; admite cuantización del modelo base por parte del usuario) |
| Idiomas soportados | no disponible (prompts en inglés según los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`korean7.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango bajo inyectado en el UNet del modelo base SDXL. La configuración declarada es de dimensión de red y alpha de 16, entrenada únicamente sobre el UNet (sin adaptación del text encoder), con learning rate de 1e-4, optimizador Adafactor, batch size de 1, precisión fp16, gradient checkpointing y atención sdpa. El entrenamiento se realizó con `sdxl_train_network.py` de kohya-ss sobre una GPU de Kaggle, en modo completamente offline.

El dataset consta de 43 imágenes curadas de Jun Ji-hyun, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of korean7 person`). Las imágenes se entrenaron a 1024 px con bucketing entre 256 y 2048, durante 1500 pasos. El dataset público asociado es `nekodeus/korean-top10-v2`, en la subcarpeta `korean7/`. No se documenta uso de RLHF, DPO ni técnicas de preferencia, algo esperable en un adaptador de difusión de este tipo.

## Capacidades

- Generación text-to-image de retratos de la identidad Jun Ji-hyun mediante el token `korean7`.
- Personalización de identidad sobre SDXL sin reentrenar el modelo base.
- Compatibilidad con la API `load_lora_weights` de `diffusers` y con el nodo LoRA Loader de ComfyUI.
- Composición con otros LoRA y con el pipeline estándar de SDXL (resolución nativa de 1024 px).
- Control de estilo y escena mediante el prompt (iluminación, encuadre, vestuario), según el ejemplo de la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo.
- Capacidad multilingüe en prompts: no documentada; los ejemplos usan inglés.

## Casos de uso

- Generación de retratos fotorrealistas: con el prompt `korean7 Jun Ji-hyun, portrait photo, studio lighting` a 1024x1024 se obtienen imágenes de la identidad con control de iluminación y encuadre, aprovechando el entrenamiento específico sobre ese rostro.
- Prototipado de personajes para narrativa visual: el adaptador permite mantener consistencia de identidad entre viñetas o escenas de un guion, combinándolo con otros LoRA de estilo.
- Pruebas de concepto en pipelines de difusión: sirve para validar flujos de carga de LoRA en `diffusers` o ComfyUI antes de invertir en adaptadores propios, dado su reducido tamaño (0,2 GB).
- Investigación sobre personalización de identidad: útil como caso de estudio de LoRA de personaje con dataset pequeño (43 imágenes) y caption uniforme, para comparar estrategias de entrenamiento.
- Generación de material editorial simulado: para maquetas o demostraciones internas donde se requiera una figura reconocible, siempre que se respeten las consideraciones legales sobre imagen de personas reales.
- Integración en herramientas creativas de escritorio: al ser un `safetensors` de pequeño tamaño, se puede distribuir y cargar en instalaciones locales de ComfyUI sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la del modelo base SDXL en fp16, en torno a 8-10 GB con optimizaciones; el LoRA añade una sobrecarga mínima (0,2 GB en disco).
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para generación a 1024 px con margen; GPUs de 8 GB pueden funcionar con atención eficiente y offloading.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, con posible offloading en modelos de 8 GB.
- Opciones de despliegue: `diffusers` (StableDiffusionXLPipeline + `load_lora_weights`), ComfyUI (nodo LoRA Loader), y en general cualquier runtime compatible con SDXL y LoRA en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del modelo base y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| neko-korean7-sdxl-v1 | LoRA de personaje | SDXL 1.0 | rango 16, UNet | 1024 px | Apache 2.0 | Hugging Face (0 descargas) |
| Otros LoRA de personaje SDXL | LoRA de personaje | SDXL 1.0 | variable | 1024 px | variable según autor | Hugging Face / Civitai |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base | — | no disponible | 1024 px | CreativeML Open RAIL++-M | Hugging Face |
| Modelos de identidad alternativos (p. ej. IP-Adapter) | Adaptador de imagen | SDXL | no disponible | 1024 px | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (43 imágenes) y caption uniforme, lo que puede limitar la variedad de poses, expresiones y ángulos.
- Riesgo de sobreajuste a las imágenes de entrenamiento y de degradación de la identidad fuera del dominio retratado.
- El token `korean7` es obligatorio; sin él, el LoRA puede no activarse o introducir artefactos.
- Uso sobre una persona real: implica consideraciones éticas y legales sobre derechos de imagen y consentimiento, no cubiertas por la licencia Apache 2.0 del adaptador.
- Licencia Apache 2.0 del adaptador, pero el modelo base SDXL se rige por CreativeML Open RAIL++-M, con restricciones de uso adicionales que deben respetarse.
- Sin datos de benchmarks, evaluación de calidad ni adopción pública (0 descargas, 0 likes) que permitan validar su rendimiento en producción.
- Idiomas de prompt no documentados; los ejemplos usan inglés.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-korean7-sdxl-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/korean-top10-v2
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Script de entrenamiento (kohya-ss): https://github.com/kohya-ss/sd-scripts
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
