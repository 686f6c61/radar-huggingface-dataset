# JoaoZaokk/FLUX.3-klein-FP8-NVFP4-W4A16-W4A4

## Resumen

FLUX.3 klein es un modelo de difusión texto-a-imagen de 5.600 millones de parámetros desarrollado por Black Forest Labs. Está diseñado para cubrir tres tareas en un único checkpoint: generación texto-a-imagen, edición con hasta 10 imágenes de referencia y control de composición mediante cajas delimitadoras, con resoluciones de salida de hasta 4K. Según las evaluaciones internas publicadas por BFL, ocupa el primer puesto en generación texto-a-imagen, generación multi-referencia y edición de imagen frente a modelos abiertos de mayor tamaño como Qwen-Image 2.1 (7B) y Krea 2 (12,9B), y también por delante de modelos cerrados como Ideogram V4.5 y FLUX.2 [pro].

El repositorio analizado, `JoaoZaokk/FLUX.3-klein-FP8-NVFP4-W4A16-W4A4`, no contiene el modelo original, sino cuatro builds cuantizados del transformer de FLUX.3 klein preparados específicamente para ComfyUI. El autor, JoaoZaokk, ha empaquetado los pesos en los formatos nativos de cuantización de ComfyUI (FP8 e4m3, NVFP4, Q4_1 W4A16 y ConvRot W4A4) de forma que el nodo estándar `UNETLoader` los lee sin necesidad de nodos personalizados. El text encoder y el VAE no se incluyen en el repositorio y deben obtenerse de los archivos oficiales de Black Forest Labs.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de imagen de última generación en GPUs de consumo con requisitos de VRAM reducidos (de 16,5 GB en BF16 a 9,0 GB en la variante W4A4) y con distintos compromisos entre velocidad, memoria y fidelidad visual. La licencia es la FLUX Kommunity License, de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo de imagen texto-a-imagen), cuantizado en un único archivo safetensors |
| Parametros totales | 5.600 millones (5,6B) en el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | FP8 e4m3 per-tensor; NVFP4 con escala de activación dinámica; Q4_1 grupo 32 con activaciones bf16 (W4A16); ConvRot W4A4 |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (no comercial) |
| Formato de pesos | safetensors (single-file para ComfyUI) |
| Tamano del repo | 16,4 GB |
| Tarea (pipeline) | text-to-image |
| Modelo base | black-forest-labs/flux-3-image-klein-comfy |
| Libreria | diffusion-single-file |

Desglose de los cuatro archivos incluidos:

| Archivo | Formato | Tamano | VRAM pico | Tiempo/imagen (RTX 3090) | PSNR vs BF16 |
|---|---|---|---|---|---|
| `flux3-image-klein_fp8.safetensors` | fp8 e4m3, per-tensor | 5,42 GiB | 11,5 GB | 7,95 s | 24,4–30,7 dB |
| `flux3-image-klein_nvfp4.safetensors` | nvfp4, escala de activación dinámica | 3,27 GiB | 9,4 GB | 8,12 s | 15,5–23,2 dB |
| `flux3-image-klein_w4a16.safetensors` | Q4_1 grupo 32, activaciones bf16 | 3,58 GiB | 9,9 GB | 11,85 s (+55 %) | 18,6–22,2 dB |
| `flux3-image-klein_w4a4.safetensors` | ConvRot W4A4 | 2,97 GiB | 9,0 GB | 4,16 s (−45 %) | 10,6–18,9 dB |

## Arquitectura y entrenamiento

El modelo base FLUX.3 klein es un transformer de difusión de 5,6B parámetros para generación y edición de imágenes. Black Forest Labs no detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens o imágenes vistas, ni si se emplearon técnicas de alineamiento como RLHF o DPO. Lo que sí se documenta es su funcionalidad: un único modelo que cubre texto-a-imagen, edición con hasta 10 imágenes de referencia y control de layout mediante bounding boxes, con salida de hasta 4K.

Sobre esta base, el repositorio de JoaoZaokk aplica cuantización post-entrenamiento (PTQ) a las 258 capas lineales del transformer, sin calibración en ninguno de los cuatro formatos. FP8 usa una escala per-tensor; NVFP4 y Q4_1 usan escalas min/max; W4A4 emplea la técnica ConvRot del propio autor. Un detalle técnico relevante es que FP8 y NVFP4 en ComfyUI no son solo de pesos: también cuantizan las activaciones, por lo que equivalen a W8A8-fp8 y W4A4-fp4 con escala de activación dinámica. Solo W4A16 mantiene las activaciones en bf16, y requiere la opción `full_precision_matrix_mult` (ya fijada en los metadatos de cada capa) para evitar NaN y renderizados en negro con comfy-kitchen 0.2.40 y grupo 32. La variante NVFP4 oficial de BFL usa una `input_scale` estática calibrada y mantiene algunos bloques en bf16, por lo que los tamaños de archivo no son directamente comparables.

## Capacidades

- Generación de imagen a partir de texto (text-to-image) con resoluciones de hasta 4K.
- Edición de imagen con hasta 10 imágenes de referencia en una sola pasada.
- Control de composición y layout mediante cajas delimitadoras (bounding boxes).
- Cuatro variantes de cuantización para distintos equilibrios de VRAM, velocidad y fidelidad.
- Compatibilidad nativa con ComfyUI mediante el nodo estándar `UNETLoader`, sin nodos personalizados.
- Ejecución en GPUs de consumo gracias a la reducción de VRAM (hasta 9,0 GB en W4A4).
- No se documentan capacidades de tool calling, agentes, audio ni texto conversacional; es un modelo exclusivamente de imagen.

## Casos de uso

- Generación de imágenes en equipos de consumo: la variante FP8 permite renderizar a 1024² en una RTX 3090 con 11,5 GB de VRAM pico y una fidelidad de 24,4–30,7 dB de PSNR respecto a BF16, adecuada para prototipado y producción ligera.
- Iteración rápida de conceptos de diseño: W4A4 reduce el tiempo por imagen a 4,16 s (−45 % frente a BF16) con solo 9,0 GB de VRAM, útil para explorar muchas variantes de prompt antes de fijar una dirección, aceptando su menor fidelidad estructural.
- Despliegue en entornos con VRAM limitada: NVFP4 ocupa 3,27 GiB y 9,4 GB de pico, lo que permite ejecutar el modelo en GPUs de gama media sin renunciar a un estilo cercano al BF16 según la revisión cualitativa del autor.
- Edición de imágenes con múltiples referencias: el modelo base admite hasta 10 imágenes de referencia, aplicable a tareas de sustitución de producto, variación de estilo o composición guiada.
- Control de layout en pipelines automatizados: el soporte de bounding boxes permite generar composiciones con posiciones controladas, útil para maquetación publicitaria o generación de assets con restricciones espaciales.
- Investigación en cuantización de modelos de difusión: el repositorio y su herramienta asociada (`tools/quant_fp.py`, perfil `flux3`) sirven para reproducir y comparar formatos de cuantización sobre un transformer de imagen moderno.
- Generación de fondos y paisajes: el autor señala que W4A4, pese a degradar manos y estructura, podría ser aceptable para contenido tipo paisaje, lo que lo hace útil en generación de fondos a máxima velocidad.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor sobre una RTX 3090 (sm86), 1024², 16 pasos, sampler euler/simple, cfg 1.0, con el mismo text encoder INT8 y VAE en todas las ejecuciones. Se realizaron 6 renders por variante (el primero calienta el servidor; los tiempos usan los otros cinco). El PSNR se mide contra el render BF16 del mismo prompt y semilla; el propio autor advierte que el PSNR no equivale a calidad y que distintas cuantizaciones se sitúan en un suelo de unos 28 dB por el caos del sampler.

| Variante | Tamano | VRAM pico | Tiempo/imagen | PSNR vs BF16 |
|---|---|---|---|---|
| BF16 (BFL, referencia) | 10,3 GiB | 16,5 GB | 7,62 s | — |
| INT8 ConvRot (BFL, no en este repo) | 5,4 GiB | 11,5 GB | 5,23 s | 20,5–31,3 dB |
| NVFP4 oficial (BFL, no en este repo) | 4,9 GiB | 11,1 GB | 7,96 s | 16,3–24,9 dB |
| FP8 (este repo) | 5,42 GiB | 11,5 GB | 7,95 s | 24,4–30,7 dB |
| NVFP4 (este repo) | 3,27 GiB | 9,4 GB | 8,12 s | 15,5–23,2 dB |
| W4A16 (este repo) | 3,58 GiB | 9,9 GB | 11,85 s | 18,6–22,2 dB |
| W4A4 (este repo) | 2,97 GiB | 9,0 GB | 4,16 s | 10,6–18,9 dB |

Observaciones del autor: solo INT8 y W4A4 son más rápidos que BF16 en Ampere (sm86); FP8 y NVFP4 no tienen kernel nativo en esa arquitectura y ComfyUI los emula dequantizando, por lo que ahorran memoria pero no tiempo (+4 a +6 %). W4A16 es un 55 % más lento. No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,5 GB (FP8), 9,4 GB (NVFP4), 9,9 GB (W4A16), 9,0 GB (W4A4) y 16,5 GB (BF16 de referencia).
- GPU recomendadas: RTX 3090 (mediciones reales del autor, sm86). En Ada, Hopper o Blackwell el panorama de velocidad para FP8 y NVFP4 cambia al existir kernels nativos, aunque el autor no lo ha probado.
- Caben en GPU de consumo: las cuatro variantes cuantizadas caben en GPUs de 12 GB o más; NVFP4 y W4A4 se acercan a los 9 GB, lo que abre la puerta a GPUs de 10–12 GB.
- Opciones de despliegue: ComfyUI con el nodo estándar `UNETLoader` (los metadatos por capa se leen automáticamente). Requiere comfy-kitchen 0.2.40 o compatible para W4A16. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de imagen en este formato).
- Latencia y throughput: 4,16 s/imagen (W4A4), 7,95 s (FP8), 8,12 s (NVFP4), 11,85 s (W4A16) y 7,62 s (BF16) en RTX 3090 a 1024² y 16 pasos.
- No probado por el autor: otras GPUs, edición de imagen y otras resoluciones.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FLUX.3 klein | 5,6B | hasta 4K | FLUX Kommunity (no comercial) | Pesos abiertos en BFL y variantes cuantizadas en este repo | Primero en evaluaciones internas de BFL en T2I, multi-referencia y edición |
| Qwen-Image 2.1 | 7B | no disponible | no disponible | no disponible | Mayor tamaño que FLUX.3 klein según BFL |
| Krea 2 | 12,9B | no disponible | no disponible | no disponible | El mayor de la comparativa de BFL |
| Ideogram V4.5 | no disponible (cerrado) | no disponible | propietaria | API cerrada | Modelo cerrado; BFL lo sitúa por debajo de FLUX.3 klein |
| FLUX.2 [pro] | no disponible (cerrado) | no disponible | propietaria | API cerrada | Modelo cerrado de BFL; superado por FLUX.3 klein según su propia evaluación |

Los datos de comparación provienen de la evaluación interna de Black Forest Labs y no de benchmarks independientes; no se dispone de métricas objetivas (FID, CLIP score) en la información proporcionada.

## Limitaciones y advertencias

- Licencia FLUX Kommunity License: uso no comercial. Cualquier uso comercial requiere revisar `LICENSE.md` y `NOTICE.md` y obtener los derechos directamente de Black Forest Labs.
- Los archivos son derivados modificados por JoaoZaokk, no productos oficiales de BFL ni respaldados por la compañía.
- W4A4 rompe la imagen: según la propia revisión del autor, manos y estructura se descomponen; puede ser aceptable solo para contenido tipo paisaje. Se publica por completitud y por velocidad.
- FP8 y NVFP4 en ComfyUI cuantizan también las activaciones (W8A8-fp8 y W4A4-fp4 con escala dinámica), lo que afecta a la fidelidad frente a un esquema solo de pesos.
- W4A16 requiere `full_precision_matrix_mult`; sin él, la ruta cuantizada devuelve NaN (imágenes en negro).
- En Ampere (sm86) FP8 y NVFP4 no ofrecen ganancia de velocidad, solo de memoria; el rendimiento puede diferir en Ada, Hopper y Blackwell.
- PSNR no es una medida de calidad visual; el autor lo usa solo para ordenar variantes.
- No se han probado otras GPUs, edición de imagen ni otras resoluciones; los resultados no son extrapolables sin validación.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base, no documentado en la información disponible.
- El repositorio no incluye text encoder ni VAE; deben obtenerse de los archivos oficiales de BFL, lo que añade dependencias externas al despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JoaoZaokk/FLUX.3-klein-FP8-NVFP4-W4A16-W4A4
- Modelo base en Hugging Face: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Blog oficial de BFL sobre FLUX.3 Image Klein: https://bfl.ai/blog/flux-3-image-klein
- Herramientas y registro de mediciones del autor: https://github.com/JoaoZaokk/comfy-quant-bench
- Ficha en Civitai: https://civitai.com/models/3003556/flux3-klein
