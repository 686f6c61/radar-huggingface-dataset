# prakharsinghAI/data266-lab2-team07-pokemon-rank8

## Resumen

El modelo `prakharsinghAI/data266-lab2-team07-pokemon-rank8` es un adaptador LoRA (Low-Rank Adaptation) de rango 8 entrenado sobre Stable Diffusion v1.5 para generación y transformación de imágenes estilo Pokémon mediante el pipeline image-to-image. Lo desarrollan Prakhar Kumar Singh y Kanika en el contexto del laboratorio DATA266, y no constituye un modelo de difusión completo: es un conjunto de pesos de adaptación de 1.594.368 parámetros entrenables que se cargan sobre el modelo base congelado.

El adaptador se entrena sobre el dataset `reach-vb/pokemon-blip-captions`, con 833 imágenes originales a resolución 512x512, de las cuales 749 se usan para entrenamiento y 84 para test. El entrenamiento consistió en 1000 pasos del optimizador con learning rate 1e-4, batch de 1 y acumulación de gradiente de 4, durante aproximadamente 2006 segundos, con un pico de memoria GPU asignada de 3,01 GiB.

Su relevancia es acotada y de carácter didáctico: no se publican resultados de benchmarks estándar ni evaluación humana, la evaluación automática se basa en solo 20 imágenes generadas y el modelo está restringido a uso no comercial. Resulta útil como referencia para quienes quieran reproducir un flujo de fine-tuning LoRA sobre Stable Diffusion 1.5 con un dataset de dominio concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Stable Diffusion v1.5 (UNet de difusión latente) |
| Parámetros totales | 1.594.368 parámetros entrenables (adaptador LoRA) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible (pesos en fp16 para el base) |
| Idiomas soportados | no disponible (prompts en inglés por el dataset de captions) |
| Licencia | creativeml-openrail-m (base); dataset `cc-by-nc-sa-4.0`; uso no comercial |
| Formato de pesos | `pytorch_lora_weights.safetensors` (safetensors) |
| Rango LoRA | 8 |
| Modelo base | `stable-diffusion-v1-5/stable-diffusion-v1-5` (revisión `451f4fe16113bff5a5d2269ed5ad43b0592e9a14`) |
| Dataset | `reach-vb/pokemon-blip-captions` (revisión `3790f29981f74ca26bf11662048342e19c5b615e`) |
| Resolución de entrenamiento | 512x512 |
| Pasos del optimizador | 1000 (batch 1, acumulación 4, lr 1e-4, seed 266) |
| Tiempo de entrenamiento | 2006,8 s |
| Memoria GPU pico | 3,01 GiB |
| Pipeline | image-to-image |
| Librería | diffusers |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 8 sobre el UNet de Stable Diffusion v1.5, que es una arquitectura de difusión latente con encoder de texto CLIP congelado. Al mantener congelados los pesos del modelo base y entrenar únicamente 1.594.368 parámetros, el coste computacional y de memoria se reduce drásticamente: el pico de memoria GPU asignada durante el entrenamiento fue de 3,01 GiB, lo que permite entrenar en GPUs de consumo.

El entrenamiento se realizó sobre 749 imágenes del dataset Pokémon con captions automáticas, a resolución 512x512, durante 1000 pasos del optimizador con learning rate 1e-4, batch de 1 y acumulación de gradiente de 4 (batch efectivo de 4). La semilla fue 266 y el entrenamiento completo duró 2006,8 segundos. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación; tampoco se detalla la composición exacta de los captions más allá de que son automáticos, lo que limita la fidelidad del condicionamiento textual.

## Capacidades

- Generación de imágenes image-to-image: transforma una imagen de entrada en una variante con estética Pokémon condicionada por un prompt de texto.
- Adaptación de dominio: especializa el modelo base en criaturas tipo Pokémon mediante los pesos LoRA.
- Condicionamiento por texto: acepta prompts de criatura en inglés (limitado por los captions del dataset).
- Control de reproducibilidad: admite fijación de semilla para resultados deterministas, como se indica en la model card.
- Integración con `diffusers`: se carga mediante `StableDiffusionImg2ImgPipeline` y `load_lora_weights`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada semántica ni audio: es exclusivamente un adaptador de generación de imagen.

## Casos de uso

- Prototipado de estilos de criatura: usar el adaptador para transformar bocetos o imágenes base en variantes con estética Pokémon, útil en fases exploratorias de diseño de personajes en entornos educativos.
- Docencia de fine-tuning con LoRA: sirve como ejemplo reproducible de entrenamiento de un adaptador de rango 8 sobre Stable Diffusion 1.5 con un dataset pequeño, dado que se publican los registros de entrenamiento y evaluación.
- Experimentación con image-to-image: permite comparar el efecto del condicionamiento por prompt y de la fuerza de transformación sobre una imagen de entrada en un dominio controlado.
- Generación de variaciones a partir de una referencia: dado que el pipeline es image-to-image, se puede partir de una imagen existente y generar alternativas manteniendo la composición general.
- Investigación sobre evaluación automática de difusión: los valores de KID, CLIP score y LPIPS publicados permiten reproducir y discutir métricas automáticas en un caso de dominio concreto.
- Reproducción de experimentos académicos: el repositorio incluye los registros originales de datos y entrenamiento sin modificar, lo que facilita la verificación de resultados en un contexto de laboratorio.

## Benchmarks y rendimiento

| Métrica | Valor | Notas |
|---|---|---|
| KID (mean) | 0,022173522040247917 | std 0,003734318073838949; solo 20 imágenes generadas in-domain, ruidoso |
| CLIP score | 31,803126074373722 | Medición automática existente del Part 2 |
| LPIPS | 0,7489002048969269 | Medición automática existente del Part 2 |
| Evaluación humana | no disponible | No incluida en la subida del modelo |
| Tasa de éxito Part 3 | no reclamada | El autor indica explícitamente que no se reclama |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de imagen y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Stable Diffusion v1.5 en fp16 requiere aproximadamente 4-6 GB de VRAM para image-to-image a 512x512; el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 6-8 GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060 Ti, RTX 4070 y superiores.
- Opciones de despliegue: `diffusers` con `StableDiffusionImg2ImgPipeline` y `load_lora_weights`; también es compatible con interfaces que carguen LoRA de SD 1.5 (por ejemplo, A1111/Forge o ComfyUI, aunque no se documenta explícitamente en la información disponible).
- Latencia y throughput: no disponibles; el autor solo publica el tiempo de entrenamiento (2006,8 s) y el pico de memoria (3,01 GiB), no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-lab2-team07-pokemon-rank8 | LoRA rango 8 sobre SD 1.5 | 1.594.368 entrenables | no aplica | creativeml-openrail-m (uso no comercial) | Hugging Face, 0 descargas |
| Stable Diffusion v1.5 (base) | Difusión latente completa | no disponible en la información | no aplica | creativeml-openrail-m | Ampliamente disponible |
| Otros LoRA de Pokémon sobre SD 1.5 | LoRA sobre SD 1.5 | variable | no aplica | variable | Disponibles en comunidades como Civitai |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset se concentra en un dominio único (Pokémon), lo que reduce la generalización a otros estilos o categorías visuales.
- Riesgo de alucinación visual: la model card advierte de posibles artefactos, conteos de objetos incorrectos, baja adherencia al prompt y patrones repetidos.
- Limitaciones de contexto e idioma: los captions son automáticos y en inglés; no se documentan capacidades multilingües.
- Restricciones de licencia: uso exclusivamente no comercial y de investigación/aula; el modelo base usa CreativeML OpenRAIL-M y el dataset reporta `cc-by-nc-sa-4.0`. Los personajes Pokémon siguen protegidos por copyright y el acceso al dataset no concede derechos sobre ellos.
- Evaluación limitada: KID se calculó con solo 20 imágenes generadas y es ruidoso; no hay evaluación humana ni tasa de éxito del Part 3.
- Métricas automáticas: CLIP, KID y LPIPS no son juicios humanos de calidad.
- Producción: se recomienda mantener activados los controles de seguridad de salida; no se recomienda su uso en entornos comerciales ni en aplicaciones donde la fidelidad al prompt sea crítica.
- Integridad: el SHA-256 de `pytorch_lora_weights.safetensors` es `1f4a49bbc95af7e8441e4c2f94c6f0979d036af9fde819284020e2e809329983`.

## Enlaces

- Hugging Face: https://huggingface.co/prakharsinghAI/data266-lab2-team07-pokemon-rank8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Librería diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de Stable Diffusion (Latent Diffusion): https://arxiv.org/abs/2112.10752
