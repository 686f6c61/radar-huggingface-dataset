# mtaelp/koharu-nvfp4-qwen-image-2.1-turbo-gguf

## Resumen

Koharu NVFP4 es una cuantización en formato GGML NVFP4 del transformer de difusión de Qwen-Image 2.1 Turbo, un modelo de edición y generación de imágenes desarrollado por el equipo Qwen (Alibaba). La conversión la mantiene el usuario mtaelp y está pensada específicamente para stable-diffusion.cpp y para la etapa de limpieza de texto del traductor de manga Koharu. No se trata de un modelo nuevo, sino de un artefacto de pesos optimizado para las unidades tensoras FP4 nativas de las GPU NVIDIA Blackwell (serie RTX 50 y gama B).

El modelo base resuelve tareas de image-to-image, inpainting y edición de imágenes guiada por texto. Esta versión cuantizada reduce el transformer de difusión a 5,69 GB y acelera la inferencia respecto a F16 y a Q4_K_M en hardware Blackwell: en las mediciones del autor alcanza unas 19 iteraciones por segundo frente a 13,8 de F16 y 12 de Q4_K_M en una RTX 5090. El repositorio no incluye el codificador de texto ni el VAE, que deben obtenerse por separado.

La relevancia de esta ficha es doble: por un lado, documenta un formato de cuantización emergente (NVFP4 en GGML) con un compromiso calidad/velocidad medido; por otro, advierte de que la licencia Qwen Research limita el uso a investigación y evaluación, lo que condiciona cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo base Qwen-Image 2.1 Turbo); cuantización GGML NVFP4 con bloques de 64 pesos y una escala UE4M3 por cada 16 pesos |
| Parametros totales | 7.115.124.736 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (144 matrices del transformer); el resto de 121 tensores conserva F16/BF16 del origen |
| Idiomas soportados | no disponible (el pipeline es de imagen; el codificador de texto Qwen3-VL-8B sí es multilingüe, pero no se incluye) |
| Licencia | Qwen Research License Agreement (qwen-research), solo uso no comercial |
| Formato de pesos | GGUF (archivo `qwen-image-2.1-turbo-NVFP4.gguf`, 5,69 GB) |

## Arquitectura y entrenamiento

El artefacto es una cuantización del transformer de difusión de Qwen-Image 2.1 Turbo. Se parte del archivo `qwen-image-2.1-turbo-F16.gguf` de unsloth (revisión `5d1f9f7`) y se cuantizan 144 matrices de pesos a GGML NVFP4, manteniendo los 121 tensores restantes en F16/BF16. La selección de qué matrices se cuantizan sigue el esquema selectivo de BennyDaBall/Qwen-Image-2.1-Turbo-NVFP4, pero los pesos se cuantizan directamente desde F16 en lugar de reempaquetarse desde ese archivo, porque GGML NVFP4 no tiene escala por tensor y el reempaquetado introduciría doble redondeo.

El conversor (`nvfp4_repack.py`) prueba varias escalas UE4M3 cercanas a `amax / 6` por cada bloque de 16 pesos y conserva la de menor error cuadrático. El error relativo medio de pesos resultante es 0,088 (máximo 0,092), frente a 0,094 del archivo NVFP4 de ComfyUI medido contra los mismos pesos F16. No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que no se pueden detallar aquí.

## Capacidades

- Edición de imágenes guiada por texto (image-to-image) mediante el transformer de difusión cuantizado.
- Inpainting: reparación de regiones enmascaradas, probado específicamente en limpieza de texto de manga.
- Limpieza y sustitución de texto en páginas de cómic/manga, integrable en la etapa de text-cleanup de Koharu.
- Generación de imágenes por difusión con muestreo de 8 pasos en configuraciones de prueba.
- Compatibilidad con stable-diffusion.cpp (build `master-1043-3be2378` en las mediciones del autor).
- Aceleración por unidades tensoras FP4 en GPU NVIDIA Blackwell.
- No incluye codificador de texto ni VAE; requiere aportarlos externamente (por ejemplo, Qwen3-VL-8B-Instruct GGUF con su `mmproj` y el VAE `qwen_image_2.1_vae_bf16.safetensors`).
- Soporte de tool calling, agentes, razonamiento multi-paso o audio: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Limpieza de texto en traducción de manga: el modelo se usa para inpintar los bocadillos y rótulos antes de reinsertar el texto traducido; el autor lo probó en un trabajo de 13 páginas que tardó 127 s con este archivo frente a 136 s con Q4_K_M y con resultados visualmente equivalentes.
- Edición de imágenes por regiones en flujos de prensa o diseño: permite sustituir objetos o fondos enmascarados manteniendo el resto de la imagen, aprovechando la ventana de edición del pipeline image-to-image.
- Restauración de material escaneado: eliminación de marcas, sellos o texto superpuesto en digitalizaciones de documentos y publicaciones antiguas mediante inpainting.
- Prototipado rápido en investigación de difusión: al ser un GGUF de 5,69 GB, permite experimentar con Qwen-Image 2.1 Turbo en una sola GPU consumer Blackwell sin cargar los pesos F16 completos.
- Integración en pipelines de stable-diffusion.cpp: servir como componente de difusión dentro de herramientas CLI o scripts de automatización de edición por lotes.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de NVFP4 frente a F16 y K-quants en tareas de inpainting con máscara.

## Benchmarks y rendimiento

Mediciones del autor en una RTX 5090 con stable-diffusion.cpp `master-1043-3be2378`, tarea de inpainting de texto de manga, 8 pasos, strength 1.0 y Flash Attention:

| Transformer | Velocidad de muestreo sostenida | Diferencia media de píxel frente a F16 (enmascarado) |
|---|---|---|
| Q4_K_M | ~12 it/s | 0,50 |
| F16 | ~13,8 it/s | 0 |
| NVFP4 (este archivo) | ~19 it/s | 0,64 |

En un trabajo completo de limpieza de 13 páginas de manga: 127 s con este archivo frente a 136 s con Q4_K_M, con salidas visualmente equivalentes. Solo se probó en Blackwell.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el transformer ocupa 5,69 GB en disco y hay que sumar el codificador de texto (Qwen3-VL-8B-Instruct, varios GB según cuantización) y el VAE en BF16.
- GPU recomendadas: NVIDIA Blackwell con tensoras FP4 nativas (RTX 5090, gama RTX 50 y serie B). En GPUs sin soporte FP4 nativo, el autor recomienda usar una K-quant en su lugar.
- Cabe en GPU consumer: sí, al menos en RTX 5090 según las mediciones; no se documentan pruebas en otras consumer.
- Opciones de despliegue: stable-diffusion.cpp (probado); otros runners GGUF no están documentados en la información disponible.
- Latencia y throughput: ~19 it/s en RTX 5090 para el muestreo; ~127 s para un lote de 13 páginas de limpieza de manga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Koharu NVFP4 Qwen-Image 2.1 Turbo (este) | 7.115 M (transformer) | no disponible | GGUF NVFP4 | Qwen Research (no comercial) | Hugging Face, 0 descargas |
| Qwen-Image-2.1-Turbo F16 (unsloth) | 7.115 M | no disponible | GGUF F16 | Qwen Research | Hugging Face |
| Qwen-Image-2.1-Turbo Q4_K_M (unsloth) | 7.115 M | no disponible | GGUF Q4_K_M | Qwen Research | Hugging Face |
| BennyDaBall Qwen-Image-2.1-Turbo NVFP4 | 7.115 M | no disponible | NVFP4 (ComfyUI) | Qwen Research | Hugging Face |

Las diferencias medidas entre estas variantes se limitan a velocidad y error de pesos: NVFP4 alcanza ~19 it/s con error relativo medio 0,088, Q4_K_M ~12 it/s con diferencia de píxel 0,50 y F16 ~13,8 it/s sin pérdida. No se dispone de comparaciones con modelos de difusión de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente no comercial (investigación o evaluación); el uso comercial requiere licencia separada del equipo Qwen (model-business@notice.qwencloud.com).
- Conversión no oficial de la comunidad: no está afiliada ni respaldada por Qwen ni Alibaba.
- Solo probado en GPU Blackwell; en hardware sin tensoras FP4 nativas el rendimiento puede ser peor que una K-quant y el autor recomienda evitarlo.
- No incluye codificador de texto ni VAE; un uso incorrecto o con componentes desalineados puede degradar la calidad.
- Pérdida de calidad respecto a F16: diferencia media de píxel de 0,64 en la prueba de inpainting enmascarado (frente a 0,50 de Q4_K_M), con error relativo de pesos de hasta 0,092.
- Sin datos publicados sobre sesgos, alucinaciones visuales o comportamiento multilingüe del pipeline completo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.
- El sha256 del archivo es `0ac8acb9cfe4e85bbc2272416e31f1d92a89e272553e827770ef7f2ff7efdd80`; conviene verificarlo tras la descarga.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/mtaelp/koharu-nvfp4-qwen-image-2.1-turbo-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- GGUF F16 de origen (unsloth): https://huggingface.co/unsloth/Qwen-Image-2.1-Turbo-GGUF
- Codificador de texto Qwen3-VL-8B-Instruct GGUF: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-GGUF
- VAE y pesos FP8: https://huggingface.co/unsloth/Qwen-Image-2.1-FP8
- Layout NVFP4 de referencia: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-Turbo-NVFP4
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Koharu (traductor de manga): https://github.com/koharu-rs/koharu
