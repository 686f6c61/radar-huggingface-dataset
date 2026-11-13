# moonbox-dev/flux-3-image-klein-GGUF

## Resumen

FLUX 3 Image Klein GGUF es una colección de pesos cuantizados en formato GGUF del modelo de difusión FLUX 3 Image Klein, desarrollado originalmente por Black Forest Labs y convertido por el usuario moonbox-dev para su uso en dispositivo. El modelo base es un transformer de difusión de 5.548.681.984 parámetros (5,6B) diseñado para edición de imágenes por instrucción, generación texto-a-imagen y composición multi-referencia con hasta 10 imágenes de entrada. Esta conversión a GGUF permite ejecutar el modelo en hardware de consumo mediante runtimes como stable-diffusion.cpp o ComfyUI con el nodo ComfyUI-GGUF.

La relevancia de esta ficha radica en que ofrece el transformer de difusión en múltiples precisiones (desde F16/BF16 de 11,10 GB hasta Q4_K_M de 3,51 GB), lo que facilita el despliegue local en GPUs de 8 GB o menos. El modelo emplea Qwen3-VL-4B-Instruct como codificador de texto y el VAE de FLUX.2, ambos distribuidos por separado. Está destilado para 16 pasos de inferencia con CFG 1, lo que reduce sustancialmente el coste computacional frente a modelos de difusión no destilados.

La licencia es la FLUX Kommunity License, que restringe el uso comercial a empresas con ingresos anuales inferiores a 5 millones de dólares. Esta conversión no es un lanzamiento oficial de Black Forest Labs y hereda la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo de imagen); codificador de texto Qwen3-VL-4B-Instruct separado; VAE de FLUX.2 |
| Parametros totales | 5.548.681.984 (5,6B, solo el transformer de imagen) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (flux-kommunity-license) |
| Formato de pesos | GGUF (diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión de 5,6B parámetros orientado a edición y generación de imágenes. Según la model card original, acepta un prompt y hasta 10 imágenes de referencia y devuelve una imagen; edición, texto-a-imagen y composiciones multi-referencia se ejecutan a través del mismo modelo. Utiliza Qwen3-VL-4B-Instruct como codificador de texto, lo que aporta capacidad de comprensión multimodal al pipeline. El VAE es el de FLUX.2 (`ae.safetensors` en el repositorio original).

El checkpoint de este repositorio es la versión destilada para edición y generación de imágenes; para fine-tuning, entrenamiento de LoRA e investigación, el autor remite a FLUX 3 Image Klein Base. La destilación permite inferencia en 16 pasos con CFG 1,0 y muestreo Euler. La model card original indica que el modelo fue entrenado con leyendas de escena completas (full scene captions), por lo que recomienda encarecidamente usar un ampliador de prompts (prompt upsampler) como `flux-3-image-klein-pup` o cualquier LLM con un system prompt que expanda la petición a una leyenda de escena completa. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

La conversión a GGUF se realizó a partir de la revisión `09561231f4` del modelo original: los pesos BF16 se convirtieron a GGUF F16/BF16 y después se cuantizaron con `llama-quantize` de llama.cpp. Cada archivo fue verificado contra el original antes de la subida, con el error RMS relativo indicado en la tabla de archivos.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de una descripción textual.
- Edición de imágenes por instrucción: se añade `-r input.png` y un prompt de instrucción para modificar una imagen existente.
- Composición multi-referencia: combina hasta 10 imágenes de referencia en una sola salida.
- Guiado de composición mediante bounding boxes, según la model card original.
- Comprensión multimodal del prompt gracias al codificador de texto Qwen3-VL-4B-Instruct.
- Inferencia destilada en 16 pasos con CFG 1,0, lo que reduce el coste frente a modelos no destilados.
- Ejecución en dispositivo mediante stable-diffusion.cpp y ComfyUI con ComfyUI-GGUF.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni generación de audio.

## Casos de uso

- Edición de imágenes por instrucción en local: un usuario puede cargar una fotografía con `-r input.png` y describir el cambio deseado; el modelo aplica la edición en 16 pasos, adecuado para retoque rápido sin depender de servicios en la nube.
- Generación de ilustraciones para prototipado de producto: con Q8_0 (6,15 GB) en una GPU de 8-12 GB se pueden generar imágenes a 1024x1024 para maquetas y wireframes, usando un ampliador de prompts para obtener resultados detallados.
- Composición multi-referencia para diseño gráfico: combinar hasta 10 imágenes de referencia permite crear collages o variaciones coherentes de estilo, útil en estudios de diseño que necesitan explorar variantes sin salir del entorno local.
- Guiado por bounding boxes para maquetación: la capacidad de guiar layouts con cajas delimitadoras sirve para generar banners, thumbnails o composiciones con posiciones controladas, integrándose en pipelines de generación automatizada.
- Despliegue en hardware de consumo con Q4_K_M (3,51 GB): permite ejecutar el modelo en GPUs de 8 GB o incluso en configuraciones con el codificador de texto descargado a CPU, adecuado para entornos de investigación con recursos limitados.
- Integración en ComfyUI para flujos de trabajo creativos: cargando el archivo en `models/unet` con Unet Loader (GGUF) dentro de un workflow de FLUX 3, se pueden encadenar nodos de upscaling, inpainting o postprocesado.
- Evaluación comparativa de precisiones: los archivos verificados con error RMS permiten a un equipo medir el impacto de la cuantización en la calidad de imagen antes de elegir una precisión para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente el error RMS relativo de los pesos dequantizados frente a BF16, promediado sobre todos los parámetros:

| Precision | Tamano | Error RMS relativo vs BF16 |
|---|---|---|
| F16 | 11,10 GB | 0,0000001 % (1,5e-9) |
| BF16 | 11,10 GB | exacto |
| Q8_0 | 6,15 GB | 0,53 % |
| Q6_K | 4,87 GB | 1,8 % |
| Q5_K_M | 4,17 GB | 3,5 % |
| Q4_K_M | 3,51 GB | 7,0 % |

La model card indica que se añadirán puntuaciones de calidad de imagen frente a salidas BF16 a medida que cada precisión pase la evaluación de imagen, pero no se proporcionan dichas puntuaciones en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer de difusión: F16/BF16 requiere unos 11,10 GB solo para los pesos; Q8_0 unos 6,15 GB; Q6_K unos 4,87 GB; Q5_K_M unos 4,17 GB; Q4_K_M unos 3,51 GB. Hay que sumar la memoria del codificador de texto Qwen3-VL-4B-Instruct y del VAE.
- El codificador de texto puede descargarse a CPU: la model card indica que Q6_K y Q5_K_M caben en tarjetas de 8 GB con el codificador de texto offloaded.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño de pesos, Q4_K_M y Q5_K_M son aptos para GPUs de consumo de 8 GB; Q8_0 encaja en GPUs de 12-16 GB; F16/BF16 requiere 16 GB o más.
- Opciones de despliegue: stable-diffusion.cpp (runtime usado en el benchmark del autor, commit 465adf3) y ComfyUI con ComfyUI-GGUF (nodo Unet Loader GGUF, archivo en `models/unet`).
- Latencia y throughput: no disponibles. La inferencia está destilada a 16 pasos con CFG 1,0 y muestreo Euler, lo que reduce el número de evaluaciones del transformer frente a modelos no destilados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / referencias | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein GGUF (esta ficha) | 5,6B (transformer de imagen) | Hasta 10 imagenes de referencia | FLUX Kommunity License | GGUF (F16 a Q4_K_M) | Hugging Face, 56 descargas, 1 like |
| FLUX 3 Image Klein (original) | 5,6B (transformer de imagen) | Hasta 10 imagenes de referencia | FLUX Kommunity License | BF16, FP8, NVFP4 | Hugging Face (Black Forest Labs) |
| FLUX 3 Image Klein Base | no disponible | no disponible | no disponible | no disponible | Hugging Face (Black Forest Labs) |

No se dispone en la información proporcionada de datos de benchmarks ni de otros modelos comparables de la misma categoría con los que establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia FLUX Kommunity License: uso no comercial, o uso comercial de las salidas solo para empresas con ingresos anuales inferiores a 5 millones de dólares. Es una licencia gated y estos archivos son un derivado no oficial del modelo original.
- Estos archivos no son un lanzamiento oficial de Black Forest Labs; la conversión la realiza moonbox-dev.
- Solo se convierten los pesos del transformer de difusión: el codificador de texto (Qwen3-VL-4B-Instruct) y el VAE (FLUX.2, `ae.safetensors`) deben obtenerse por separado.
- Es imprescindible usar un ampliador de prompts: el modelo fue entrenado con leyendas de escena completas y un prompt corto enviado tal cual produce resultados genéricos.
- La cuantización introduce degradación medible: Q4_K_M presenta un error RMS relativo del 7,0 % frente a BF16, lo que puede afectar a la calidad de imagen; no se han publicado puntuaciones de calidad de imagen para validar el impacto real.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma en la información disponible.
- El checkpoint es la versión destilada; para fine-tuning, LoRA e investigación el autor remite a FLUX 3 Image Klein Base.
- El repositorio tiene un tamaño de 40,9 GB, por lo que la descarga completa requiere espacio de almacenamiento considerable.
- No se dispone de información sobre latencia, throughput ni requisitos exactos de VRAM para el pipeline completo (transformer + codificador de texto + VAE).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/flux-3-image-klein-GGUF
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Modelo base para fine-tuning: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Ampliador de prompts: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del ampliador: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Codificador de texto GGUF: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
- Repositorio de código de inferencia: https://github.com/black-forest-labs/flux-3-image-klein
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Variantes FP8 del original: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/fp8r
- Variantes NVFP4 del original: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/nvfp4
