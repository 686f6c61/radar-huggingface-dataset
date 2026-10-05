# laazuri/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es un repositorio de cuantizaciones del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicado por el usuario laazuri en Hugging Face. Se distribuye principalmente en formato GGUF, con variantes adicionales en safetensors (FP8, INT8 ConvRot, NVFP4 y MLX 4/6/8 bits), y está pensado para su uso con ComfyUI mediante el nodo ComfyUI-GGUF. El repositorio incluye también los ficheros complementarios necesarios para el pipeline: un text encoder basado en Qwen3-VL de 8.000 millones de parámetros y una VAE específica del modelo.

El modelo subyacente, Qwen-Image-2.1, es un generador de imágenes texto-a-imagen desarrollado por el equipo Qwen (Alibaba). El transformador de difusión cuenta con 7.115.124.736 parámetros según los datos reales de safetensors, y el pipeline completo combina ese DiT con el text encoder Qwen3-VL y la VAE. El repositorio ocupa 105,2 GB en total, ya que aloja todas las cuantizaciones y los ficheros complementarios en un único lugar.

La etiqueta "Uncensored" del nombre es relevante porque, según las fuentes externas consultadas, los pesos distribuidos son los originales sin modificar; lo que cambia no es el modelo, sino el hecho de ejecutarlo en local sin el filtrado de prompts que aplican las versiones alojadas por Alibaba. Es decir, la eliminación de rechazos depende del pipeline de inferencia y no de un reentrenamiento. La licencia es qwen-research, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para texto-a-imagen; text encoder Qwen3-VL 8B y VAE dedicada |
| Parametros totales | 7.115.124.736 (transformador de difusion, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (etiquetada como "other"); uso no comercial segun fuentes externas |
| Formato de pesos | GGUF y safetensors (FP8, INT8, NVFP4, MLX) |
| Ficheros complementarios | Text encoder qwen3vl_8b (BF16 17,53 GB / INT8 9,35 GB) y VAE qwen_image_2.1_vae_bf16 (676 MB) |
| Tamano del repositorio | 105,2 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. Los datos disponibles indican que se trata de un transformador de difusion (DiT) para generacion de imagenes a partir de texto, integrado en un pipeline de tres componentes: el transformador de difusion cuantizado, un text encoder Qwen3-VL de 8.000 millones de parametros y una VAE especifica (qwen_image_2.1_vae_bf16). Las fuentes externas consultadas se refieren al componente principal como "GGUF DiT". En ComfyUI, el transformador se carga mediante el nodo `Unet Loader (GGUF)`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo base. Tampoco se documenta ninguna innovacion tecnica adicional en la model card. El repositorio de laazuri no describe ningun proceso de reentrenamiento o ajuste: segun las fuentes externas, se trata de pesos originales cuantizados, no de una variante reentrenada sin filtros.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con el pipeline completo de Qwen-Image-2.1.
- Ejecucion local en GPU de consumo gracias a las cuantizaciones GGUF de 4 a 8 bits.
- Integracion nativa con ComfyUI mediante el nodo `Unet Loader (GGUF)` y el cargador `CLIPLoader` configurado con el tipo `qwen_image`.
- Uso del text encoder Qwen3-VL 8B, que aporta comprension multimodal de prompts textuales (y, potencialmente, de entradas visuales, aunque esto no se documenta en la informacion disponible).
- Despliegue en Apple Silicon mediante las variantes MLX de 4, 6 y 8 bits.
- Aceleracion en hardware NVIDIA Blackwell mediante la cuantizacion NVFP4.
- Ejecucion sin filtrado de prompts por parte del modelo, al operar en local con los pesos originales.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento explicito, ya que se trata de un modelo de generacion de imagenes.

## Casos de uso

- Ilustracion y arte conceptual sin restricciones de prompt: al ejecutarse en local con los pesos originales, el modelo no aplica el filtrado de peticiones que si realizan las versiones alojadas por el proveedor, lo que resulta util para artistas que trabajan con tematicas que los filtros suelen bloquear.
- Prototipado de pipelines text-to-image en ComfyUI: la variante Q4_K_M (4,60 GB) permite iterar rapidamente en una GPU de gama alta de consumo, con los ficheros de text encoder y VAE alojados en el mismo repositorio, lo que simplifica la puesta en marcha.
- Investigacion sobre filtrado y alineacion en modelos de difusion: al disponer de los mismos pesos que la version oficial, permite comparar el comportamiento del modelo con y sin capas de moderacion externas en el pipeline de inferencia.
- Generacion de assets para proyectos no comerciales: ilustraciones para prototipos, demos, trabajos academicos o proyectos personales, dentro de los limites que impone la licencia qwen-research.
- Despliegue en equipos Apple Silicon: las variantes MLX 4-bit (4,00 GB) y MLX 8-bit (7,56 GB) permiten ejecutar el modelo en Mac con memoria unificada, sin necesidad de GPU dedicada.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes del transformador, lo que permite medir la perdida de calidad frente al ahorro de memoria en un mismo hardware.
- Generacion de imagenes en entornos aislados o sin conectividad: al ser ficheros locales, el modelo puede desplegarse en maquinas sin acceso a APIs externas, util en contextos con requisitos de confidencialidad.
- Pruebas de integracion en herramientas creativas: desarrollo de plugins o nodos personalizados sobre ComfyUI que consuman el transformador en formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) que no aporta cifras consultables en el texto extraido.

## Requisitos de hardware

Las siguientes estimaciones de VRAM se derivan de los tamanos de archivo publicados en el repositorio y no incluyen el consumo adicional del runtime, las activaciones ni los buffers de inferencia. En todos los casos hay que sumar el text encoder y la VAE.

| Componente | Tamano |
|---|---|
| Transformador BF16 | 14,23 GB |
| Transformador Q8_0 | 7,59 GB |
| Transformador Q6_K | 5,88 GB |
| Transformador Q5_K_M | 5,22 GB |
| Transformador Q4_K_M (recomendado) | 4,60 GB |
| Transformador Q4_0 | 4,15 GB |
| Transformador FP8 | 6,63 GB |
| Transformador INT8 ConvRot | 6,76 GB |
| Transformador NVFP4 | 4,20 GB |
| Transformador MLX 8-bit | 7,56 GB |
| Transformador MLX 6-bit | 5,78 GB |
| Transformador MLX 4-bit | 4,00 GB |
| Text encoder Qwen3-VL 8B BF16 | 17,53 GB |
| Text encoder Qwen3-VL 8B INT8 | 9,35 GB |
| VAE BF16 | 676 MB |

- Combinacion mas ligera: Q4_0 (4,15 GB) + text encoder INT8 (9,35 GB) + VAE (0,68 GB) = aproximadamente 14,2 GB, sin contar overhead del runtime.
- Combinacion recomendada por el autor: Q4_K_M (4,60 GB) + text encoder INT8 (9,35 GB) + VAE (0,68 GB) = aproximadamente 14,6 GB.
- Configuracion de mayor calidad en precision reducida: Q8_0 (7,59 GB) + text encoder INT8 (9,35 GB) + VAE (0,68 GB) = aproximadamente 17,6 GB.
- Configuracion BF16 completa: 14,23 GB + 17,53 GB + 0,68 GB = aproximadamente 32,4 GB.
- Cabe en GPU de consumo: con cuantizacion Q4_K_M o Q4_0 y text encoder INT8, la huella estimada ronda los 15 GB, por lo que es viable en tarjetas de 16 GB o mas, como la RTX 4090 (24 GB) o la RTX 4080 (16 GB). La combinacion BF16 completa requiere tarjetas de 40 GB o mas (A100 40/80 GB, H100).
- Despliegue: ComfyUI con el fork mantenido leejet/ComfyUI-GGUF para el transformador en GGUF, mas CLIPLoader y VAELoader estandar. Las variantes MLX estan pensadas para Apple Silicon.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Aspecto | laazuri/Qwen-Image-2.1-Uncensored-GGUF | Qwen/Qwen-Image-2.1 (oficial) | Otros espejos (0xSojalSec, Manusagents) |
|---|---|---|---|
| Parametros del transformador | 7.115.124.736 | No disponible | No disponible |
| Formato | GGUF y safetensors cuantizados | Pesos originales (no especificado) | GGUF |
| Cuantizaciones incluidas | Si (12 variantes) | No disponible | No disponible |
| Ficheros complementarios | Text encoder y VAE incluidos | No disponible | No disponible |
| Filtrado de prompts | Ninguno en local | Filtrado en las versiones alojadas por Alibaba | Ninguno en local |
| Licencia | qwen-research | qwen-research | No disponible |
| Descargas / likes | 0 / 0 | No disponible | No disponible |

Los repositorios 0xSojalSec/Qwen-Image-2.1-Uncensored-GGUF y Manusagents/Qwen-Image-2.1-Uncensored-GGUF aparecen en los resultados de busqueda como espejos del mismo tipo de artefacto, pero no se dispone de sus especificaciones detalladas.

## Limitaciones y advertencias

- La licencia qwen-research figura como "other" en las etiquetas y, segun las fuentes externas consultadas, restringe el uso comercial. Conviene revisar el texto completo de la licencia antes de cualquier despliegue en produccion.
- El termino "Uncensored" no implica que los pesos hayan sido modificados: fuentes externas indican que son los pesos originales. El comportamiento sin filtros depende de ejecutar el modelo en local y de las capas de moderacion que anada el usuario.
- La ausencia de safety checker integrado implica que el modelo puede generar contenido sensible, ofensivo o ilegal. La responsabilidad legal del uso recae en el usuario.
- La model card enlaza los ficheros de cuantizacion a URLs del repositorio `abenzerps/Qwen-Image-2.1-Uncensored-GGUF`, distinto del autor que figura en el repositorio analizado (laazuri). Esta discrepancia introduce riesgo de confusion sobre la procedencia real de los ficheros y deberia verificarse antes de descargar.
- El repositorio registra 0 descargas y 0 likes, sin validacion de la comunidad. La fecha de creacion indicada (2026-10-04) es anomalamente futura respecto a la informacion del modelo base.
- No se dispone de informacion sobre sesgos del modelo base, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion visual: en generacion de imagenes se manifiesta como anatomia incorrecta, texto ilegible dentro de la imagen o incoherencias con el prompt.
- Compatibilidad limitada en ComfyUI: es necesario el fork leejet/ComfyUI-GGUF; con el fork antiguo city96 puede aparecer el error "Unknown model architecture!". El text encoder debe cargarse con el tipo `qwen_image`.
- Los ficheros GGUF no son adecuados para reentrenamiento o fine-tuning directo; para ello habria que partir del modelo en BF16.
- El repositorio completo ocupa 105,2 GB, por lo que la descarga selectiva de una sola cuantizacion es recomendable.
- No se documentan idiomas soportados ni longitud de contexto para el text encoder dentro de esta ficha; no disponible en la informacion analizada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/laazuri/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork mantenido, leejet): https://github.com/leejet/ComfyUI-GGUF
- Espejo alternativo: https://huggingface.co/0xSojalSec/Qwen-Image-2.1-Uncensored-GGUF
- Espejo alternativo: https://huggingface.co/Manusagents/Qwen-Image-2.1-Uncensored-GGUF
- Analisis sobre ejecucion local: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Analisis sobre filtros y licencia: https://blog.laozhang.ai/en/posts/qwen-image-2-1-nsfw
- Guia de uso con ComfyUI y Heretic Text Encoder: https://hoangyell.com/qwen-image-2-1-uncensored-comfyui/
