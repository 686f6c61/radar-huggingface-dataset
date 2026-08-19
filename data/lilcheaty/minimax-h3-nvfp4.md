# lilcheaty/MiniMax-H3-NVFP4

## Resumen

MiniMax-H3-NVFP4 es una cuantización NVFP4 (4 bits) del modelo MiniMax-H3, un diffusion transformer (DiT) de generación de vídeo desarrollado por MiniMax. Esta versión, publicada por el usuario lilcheaty en Hugging Face, está específicamente empaquetada para su uso en ComfyUI e incluye las dos variantes de tarea del modelo original: `ref2va` (imágenes de referencia a vídeo) y `fl2va` (primer/último fotograma a vídeo). El objetivo principal es reducir el tamaño del modelo y el consumo de VRAM manteniendo un rendimiento competitivo, lo que permite ejecutarlo en GPUs de consumo como la RTX 5090 (32 GB) con descarga del text encoder a CPU.

El modelo base MiniMax-H3 es un DiT de aproximadamente 33 000 millones de parámetros en su versión bf16, pero la variante `pruned` sobre la que se aplica esta cuantización reduce drásticamente el peso de las capas AdaLN mediante una refactorización estructural, pasando a unos 20 000 millones de parámetros. La cuantización NVFP4 se aplica únicamente a las capas de atención y MLP, dejando el camino de modulación AdaLN en precisión completa, lo que minimiza la pérdida de calidad. El resultado es un archivo de 12,5 GB (frente a los 21 GB de la versión int8 de Comfy-Org) y una reducción del 40 % en tamaño, 8 GB menos de VRAM y un 12,4 % menos de tiempo de muestreo.

Esta cuantización es relevante porque democratiza el acceso a un modelo de vídeo de última generación, permitiendo su ejecución en hardware más asequible. Sin embargo, requiere una GPU NVIDIA Blackwell (RTX 50-series, RTX PRO 6000, B200) para aprovechar la aceleración NVFP4 nativa; en arquitecturas más antiguas (Ada, Hopper) el camino NVFP4 se emula y se recomienda usar las versiones int8 de Comfy-Org.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con AdaLN refactorizado |
| Parametros totales | 20,11 mil millones (versión pruned) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) para attn/mlp; variantes mixtas con FP8 e INT8 ConvRot |
| Idiomas soportados | No disponibles |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El MiniMax-H3 es un diffusion transformer diseñado para generación de vídeo a partir de texto, imágenes y audio. El modelo original en bf16 tiene 33,12 mil millones de parámetros, de los cuales el 39,4 % corresponden a la proyección AdaLN (`adaln_proj`), que genera las modulaciones de escala y desplazamiento para cada bloque. La versión `pruned` (de la que deriva esta cuantización) sustituye esa proyección de 5376 dimensiones por una tabla de timesteps de 8 dimensiones (`adaln_t_table`, forma `[1025, 8]`) que alimenta una capa lineal de forma `[96768, 8]`. Esto reduce los parámetros de AdaLN de 13,04 mil millones a 0,04 mil millones (una reducción de ~326 veces), pasando el total a 20,11 mil millones.

La cuantización NVFP4 se aplica en una sola pasada desde los pesos bf16 de la versión pruned, sobre las 200 capas de atención y MLP. Estas capas son relativamente tolerantes al error de cuantización, mientras que AdaLN se mantiene en precisión completa porque su error sería multiplicativo y se propagaría a través de los 50 bloques y cada paso de muestreo. El autor también ofrece variantes mixtas (NVFP4 + FP8 + INT8 ConvRot) desarrolladas por rockerBOO, que priorizan la fidelidad a costa de un mayor tamaño de archivo.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). El modelo original fue entrenado por MiniMax y su arquitectura está documentada en el repositorio oficial.

## Capacidades

- Generación de vídeo a partir de texto con dos modos: `ref2va` (hasta 9 imágenes de referencia, más vídeos y audio) y `fl2va` (interpolación entre primer y último fotograma).
- Soporte para entrada de imágenes de referencia que condicionan la identidad del sujeto en el vídeo generado.
- Capacidad de encadenar clips: en modo `fl2va`, se puede alimentar el último fotograma del clip anterior para generar una continuación.
- Integración nativa con ComfyUI, con flujos de trabajo oficiales disponibles.
- Requiere entrada estructurada según el formato H3-Context-IR (secciones etiquetadas) para obtener resultados óptimos, tal como indica el modelo base.
- No se especifican capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente generativo de vídeo.
- Idiomas soportados no documentados; el modelo base es multilingüe, pero no hay confirmación para esta cuantización.

## Casos de uso

- **Creación de contenido para redes sociales**: generar clips cortos de vídeo a partir de prompts de texto o imágenes de referencia, con la ventaja de poder ejecutarse en una RTX 5090 (32 GB) gracias a la reducción de VRAM a ~12 GB para el DiT.
- **Prototipado de animaciones**: usar el modo `fl2va` para interpolar entre dos fotogramas clave, lo que permite a diseñadores y animadores explorar movimientos rápidamente sin necesidad de un pipeline complejo.
- **Generación de vídeo de producto**: con el modo `ref2va`, se pueden pasar varias imágenes de un producto y generar un vídeo que lo muestre en movimiento, útil para catálogos o demostraciones.
- **Producción de vídeo con control de identidad**: el modo `ref2va` acepta hasta 9 imágenes de referencia, lo que permite mantener la coherencia del sujeto a lo largo del vídeo, adecuado para retratos o avatares.
- **Postproducción y edición**: encadenar clips alimentando el último fotograma de una generación como entrada para la siguiente, creando secuencias largas de forma incremental.
- **Investigación en generación de vídeo**: la cuantización NVFP4 permite a investigadores con GPUs Blackwell ejecutar el modelo en local para experimentar con prompts, parámetros de muestreo y arquitecturas, sin depender de servicios en la nube.
- **Integración en flujos de ComfyUI**: el modelo viene empaquetado para ComfyUI, por lo que puede combinarse con otros nodos de la plataforma (upscaling, interpolación, edición) para construir pipelines creativos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como FVD, CLIP score, etc.) en la información disponible. El autor únicamente proporciona mediciones de velocidad y uso de VRAM en una RTX PRO 6000 Blackwell (96 GB), con ComfyUI 0.30.0, resolución 864x480, 39 fotogramas, 20 pasos, scheduler `res_multistep`/`beta`. Estos datos se resumen a continuación:

| Modelo | Tamaño | VRAM (DiT) | s/it |
|---|---|---|---|
| `pruned_int8_convrot` (Comfy-Org) | 21,0 GB | 19 995 MB | 2,17 |
| **`pruned_nvfp4` (este repo)** | **12,5 GB** | **11 944 MB** | **1,90** |

La tabla muestra una reducción del 40 % en tamaño, 8,0 GB menos de VRAM y un 12,4 % menos de tiempo de muestreo frente a la versión int8 de Comfy-Org. El autor advierte que estos números son solo de velocidad/tamaño y que la comparación de calidad se retractó por usar un scheduler incorrecto (`beta` en lugar de `simple`).

## Requisitos de hardware

- **GPU requerida**: NVIDIA Blackwell (RTX 50-series, RTX PRO 6000, B200) para aceleración NVFP4 nativa. En GPUs Ada, Hopper o anteriores, el camino NVFP4 se emula y se recomienda usar los archivos `int8_convrot` de Comfy-Org.
- **VRAM**: el DiT cuantizado ocupa ~11,9 GB en VRAM (medido en RTX PRO 6000). Con un total de ~12 GB para el DiT, una GPU de 32 GB (RTX 5090) es viable si el text encoder se descarga a CPU tras la codificación del prompt (se ejecuta una vez, no por paso de muestreo).
- **Opciones de despliegue**: ComfyUI es el entorno principal. No se mencionan alternativas como vLLM, llama.cpp u Ollama; el formato safetensors y la naturaleza del modelo (DiT de vídeo) hacen que ComfyUI sea la vía estándar.
- **Latencia y throughput**: aproximadamente 1,90 s/it en RTX PRO 6000 para la configuración descrita (864x480, 39 fotogramas, 20 pasos), lo que implica unos 38 segundos por generación completa en ese hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Tamaño archivo | VRAM (DiT) | s/it | Licencia |
|---|---|---|---|---|---|---|
| MiniMax-H3 (bf16 original) | 33,12B | bf16 | ~66 GB (aprox.) | no disponible | no disponible | minimax-h3-community |
| Comfy-Org MiniMax-H3 pruned int8_convrot | 20,11B | INT8 ConvRot | 21,0 GB | 19 995 MB | 2,17 | minimax-h3-community |
| **MiniMax-H3-NVFP4 (este repo)** | **20,11B** | **NVFP4 (4-bit)** | **12,5 GB** | **11 944 MB** | **1,90** | minimax-h3-community |

No se dispone de comparativas con otros modelos de generación de vídeo (p. ej., Stable Video Diffusion, Mochi) en términos de calidad o rendimiento. La comparación se limita a las variantes del propio MiniMax-H3.

## Limitaciones y advertencias

- **Hardware específico**: la cuantización NVFP4 está optimizada para GPUs Blackwell; en arquitecturas anteriores el rendimiento puede degradarse y el autor recomienda usar las versiones int8 de Comfy-Org.
- **Pérdida de calidad de movimiento**: el autor admite que los pesos de 4 bits pueden costar algo de calidad de movimiento en comparación con la versión int8 de Comfy-Org, aunque no aporta métricas cuantitativas.
- **Entrada estructurada obligatoria**: el modelo base fue entrenado con la salida de H3-Context-IR, un preprocesador que reescribe el prompt en secciones etiquetadas. ComfyUI pasa la cadena de texto directamente al DiT, por lo que el usuario debe escribir esa estructura manualmente para obtener buenos resultados.
- **Licencia restrictiva**: la licencia `minimax-h3-community-license-agreement` puede limitar el uso comercial; es necesario revisar los términos exactos en el repositorio original de MiniMax.
- **Idiomas no documentados**: no se especifican los idiomas soportados, lo que puede afectar a la calidad en idiomas distintos del inglés.
- **Tamaño del repositorio**: el repo ocupa 154,9 GB en total (incluye todas las variantes), lo que requiere un ancho de banda y almacenamiento considerables para descargar los archivos necesarios.
- **Sin benchmarks de calidad**: no hay métricas públicas de evaluación de la calidad del vídeo generado (FVD, CLIP score, etc.), por lo que la decisión de usar esta cuantización debe basarse en pruebas empíricas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lilcheaty/MiniMax-H3-NVFP4
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio GitHub de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Repackage de Comfy-Org (base para esta cuantización): https://huggingface.co/Comfy-Org/MiniMax-H3
- Variante mixta de rockerBOO: https://huggingface.co/rockerBOO/minimax-h3-nvfp4
- Guía de archivos y descargas (no oficial): https://minimaxh3.run/minimax-h3-model-files-downloads
- Noticia sobre quants comunitarios: https://comfyui-wiki.com/en/news/2026-08-03-minimax-h3-community-quants
