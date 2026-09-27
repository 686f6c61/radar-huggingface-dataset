# chase2x/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una familia de cuantizaciones del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario chase2x. El repositorio no introduce pesos nuevos ni un reentrenamiento: redistribuye el modelo base en formatos GGUF (y algunos safetensors) listos para su uso local en ComfyUI mediante el nodo ComfyUI-GGUF, ademas de empaquetar el codificador de texto y el VAE necesarios para ejecutar el pipeline completo.

El transformador de difusion del modelo tiene 7.115.124.736 parametros (unos 7,1 mil millones), segun los datos de safetensors del propio repositorio, y se distribuye junto a un text encoder multimodal Qwen3-VL de 8B y un VAE especifico de Qwen-Image 2.1. La propuesta resulta relevante porque permite ejecutar un generador de imagenes de gran tamano en hardware de consumo: la cuantizacion Q4_K_M ocupa 4,60 GB y, con el codificador de texto en int8, el conjunto cabe en GPUs de 16-24 GB.

La etiqueta "uncensored" indica que estos ficheros estan pensados para reducir los filtros de contenido del modelo base, un aspecto que el autor no detalla tecnicamente mas alla del propio nombre. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (catalogado como diffusion_model en ComfyUI); arquitectura interna del base no detallada en el repositorio |
| Parametros totales | 7.115.124.736 (~7,1 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica ventana de contexto de texto; longitud de prompt no especificada) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como license:other con license_name qwen-research) |
| Formato de pesos | GGUF y safetensors |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Tamano del repositorio | 105,0 GB |
| Pipeline | text-to-image |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-27 / 2026-09-27 |

## Arquitectura y entrenamiento

Se trata de una redistribucion cuantizada del modelo base Qwen/Qwen-Image-2.1, no de un modelo entrenado desde cero. El pipeline que describe el autor consta de tres componentes: el transformador de difusion (los ficheros GGUF principales, que se cargan mediante el nodo "Unet Loader (GGUF)" de ComfyUI-GGUF), un codificador de texto multimodal Qwen3-VL de 8B (en BF16, 17,53 GB, o en int8, 9,35 GB) y un VAE especifico, qwen_image_2.1_vae_bf16.safetensors (676 MB). El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que ese detalle corresponderia a la model card del modelo base.

En cuanto a la innovacion tecnica, el aporte del repositorio es de despliegue, no de arquitectura: ofrece una matriz amplia de cuantizaciones (desde BF16 completo hasta Q4_0, NVFP4 y variantes MLX para Apple Silicon) y empaqueta todos los ficheros complementarios en un solo lugar para simplificar la instalacion. El autor recomienda Q4_K_M como el mejor equilibrio entre tamano y calidad, y advierte de que es necesario el fork mantenido leejet/ComfyUI-GGUF, que incorpora soporte nativo para esta arquitectura, en lugar del antiguo city96/ComfyUI-GGUF. No se documenta en el repositorio en que consiste el proceso "uncensored".

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), integrable en un grafo de ComfyUI.
- Ejecucion completamente local, sin depender de APIs externas, gracias a los pesos en GGUF.
- Compresion de prompts mediante un codificador de texto multimodal Qwen3-VL de 8B, que en teoria acepta entradas de texto (y potencialmente multimodales, segun sus capacidades propias).
- Amplio abanico de cuantizaciones para adaptarse a distintos presupuestos de memoria (de 14,23 GB en BF16 a 4,05 GB en NVFP4/Q4_0).
- Variante etiquetada como "uncensored", orientada a reducir las restricciones de contenido respecto al modelo base.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un modelo de difusion, no un modelo de lenguaje.
- No soporta tool calling, function calling ni flujos de agentes.
- Capacidades multilingues: no disponibles (el autor no especifica idiomas).
- No se documentan capacidades de imagen-a-imagen, edicion o control adicionales en la informacion proporcionada.

## Casos de uso

- Ilustracion conceptual y arte digital: un ilustrador puede generar bocetos base a partir de descripciones y refinar sobre ellos; la cuantizacion Q4_K_M (4,60 GB) permite iterar rapido en una estacion de trabajo con GPU de gama alta.
- Prototipado de assets para diseno de producto: generar variaciones visuales de un concepto (envases, interfaces, escenarios) antes de invertir en produccion, aprovechando que el pipeline completo corre en local sin coste por peticion.
- Concept art para videojuegos: producir de forma por lotes ideas de personajes, entornos y paletas, integrando el modelo en un grafo automatizado de ComfyUI que genere cientos de variaciones.
- Investigacion en cuantizacion y eficiencia: comparar la calidad de salida entre BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M para estudiar la degradacion introducida por cada nivel de cuantizacion en un modelo de difusion de ~7,1B parametros.
- Red-teaming y estudio de alineacion: la variante "uncensored" resulta util para equipos que investigan el comportamiento de los filtros de seguridad y quieren medir el tipo de contenido que un modelo sin restricciones puede generar.
- Generacion de contenido creativo sin restricciones tematicas: produccion de imagenes artisticas en generos que los filtros convencionales suelen bloquear; requiere que el usuario asuma la responsabilidad legal y etica del resultado.
- Canalizacion de pipelines de generacion por lotes: montar un flujo en ComfyUI que combine el `Unet Loader (GGUF)`, el `CLIPLoader` con Qwen3-VL y el VAE para generar imagenes de forma desatendida en un servidor con GPU.
- Aprendizaje y experimentacion: punto de entrada de bajo coste para desarrolladores que quieren entender como se despliega un modelo de difusion de gran tamano en ComfyUI con cuantizacion GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`), pero no se reproduce como tabla ni se proporcionan valores numericos, por lo que no es posible citar cifras concretas de MMLU, FID, CLIP-score ni de ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para el transformador de difusion (solo los pesos, sin overhead): BF16 14,23 GB; FP8 6,63 GB; INT8 ConvRot 6,76 GB; NVFP4 4,05 GB; MLX 4-bit 4,00 GB; MLX 6-bit 5,78 GB; MLX 8-bit 7,56 GB; Q8_0 7,59 GB; Q6_K 5,88 GB; Q5_K_M 5,22 GB; Q4_K_M 4,60 GB; Q4_0 4,15 GB.
- VRAM adicional obligatoria: el codificador de texto Qwen3-VL 8B ocupa 17,53 GB en BF16 o 9,35 GB en int8, y el VAE anade 676 MB. El consumo total en ejecucion es la suma del transformador, el codificador y el VAE, mas las activaciones.
- Configuracion con INT8 en el codificador y Q4_K_M en el difusor: aproximadamente 4,60 + 9,35 + 0,68 = 14,6 GB, lo que cabe con margen en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) y con comodidad en 24 GB (RTX 3090, RTX 4090).
- Configuracion con el codificador en BF16 y Q4_K_M: aproximadamente 4,60 + 17,53 + 0,68 = 22,8 GB, al limite de una GPU de 24 GB.
- Configuracion BF16 completa: aproximadamente 14,23 + 17,53 + 0,68 = 32,4 GB, lo que exige GPUs de 40-80 GB (A100 40 GB, H100) o descarga parcial de capas a CPU.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para las cuantizaciones medias-altas con codificador en int8; A100 40 GB o H100 para BF16; GPUs de 16 GB para Q4_K_M con codificador int8.
- Despliegue: ComfyUI con el fork leejet/ComfyUI-GGUF (soporte nativo de Qwen-Image 2.1). No se contemplan vLLM, TGI ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Uso comercial |
|---|---|---|---|---|
| Qwen-Image-2.1 Uncensored GGUF | ~7,1B (transformador de difusion) | GGUF, safetensors | qwen-research (license:other) | Sujeto a los terminos de la licencia qwen-research; restringido |
| Qwen-Image-2.1 (base) | heredado del base (no especificado en este repositorio) | safetensors | qwen-research | Sujeto a los terminos de la licencia qwen-research |
| FLUX.1 [dev] | ~12B | safetensors, GGUF | FLUX.1 [dev] Non-Commercial License | No permitido |
| Stable Diffusion XL (SDXL) | ~3,5B | safetensors, GGUF | CreativeML Open RAIL++-M | Si, con restricciones de uso |

Los datos de parametros de FLUX.1 [dev] y SDXL corresponden a informacion publica de sus respectivos proyectos y no se han verificado contra la documentacion del repositorio analizado. No se dispone de comparativas de rendimiento (FID, CLIP-score, calidad percibida) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia qwen-research (declarada como license:other) impone restricciones; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia abierta permisiva.
- La variante "uncensored" esta disenada para reducir los filtros de seguridad, lo que implica un riesgo elevado de generar contenido NSFW, ofensivo o potencialmente ilegal. El autor no documenta como se ha realizado esa modificacion.
- El usuario es el unico responsable del contenido generado y de su conformidad con la legislacion aplicable.
- Al ser un modelo de difusion, existe riesgo de artefactos visuales, deformaciones anatomicas, textos ilegibles y fidelidad imperfecta al prompt (alucinacion visual).
- No se especifican los idiomas soportados; la calidad de la comprension del prompt puede variar segun el idioma.
- No hay resultados de benchmarks publicados en la informacion disponible, por lo que no es posible cuantificar la calidad frente al modelo base ni frente a alternativas.
- El repositorio registra 0 descargas y 0 "likes", de modo que no existe validacion de la comunidad y su fiabilidad no esta contrastada.
- Requiere un fork especifico de ComfyUI-GGUF (leejet); con versiones antiguas aparece el error "Unknown model architecture!".
- La cuantizacion Q4_K_M y otras reducidas pueden degradar la calidad respecto a BF16; el autor solo la recomienda por equilibrio tamano/calidad, sin datos objetivos.
- El consumo de memoria total (transformador + codificador de texto + VAE) es muy superior al tamano del fichero GGUF aislado; conviene planificar la VRAM sumando todos los componentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/chase2x/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado, leejet): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork original, city96): https://github.com/city96/ComfyUI-GGUF
- Repositorio referenciado en los enlaces internos de la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
