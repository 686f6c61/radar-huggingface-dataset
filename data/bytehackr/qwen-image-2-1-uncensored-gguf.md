# bytehackr/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una redistribución en formato GGUF del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario bytehackr. Se trata de una cuantización del componente de difusión original, orientada a su ejecución local mediante ComfyUI con el nodo ComfyUI-GGUF. El componente visual de Qwen-Image-2.1 es un transformer de difusión de 7.115.124.736 parámetros (7,1B) organizado en 32 capas Single-Stream DiT, complementado por un text encoder Qwen3-VL de 8B y un VAE propio.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar localmente un modelo de generación y edición de imágenes de última generación en GPUs de consumo gracias a las múltiples cuantizaciones disponibles (desde BF16 hasta Q4_0, pasando por FP8, INT8, NVFP4 y variantes MLX). Por otro, el calificativo "Uncensored" hace referencia a que los pesos upstream de Qwen-Image-2.1 no incluyen safety checker integrado, algo relevante tanto técnica como legalmente.

Es importante señalar que este repositorio no es un modelo original: es una conversión y cuantización derivada del modelo base de Alibaba (Qwen). No se han publicado resultados de benchmarks numéricos en la información disponible, y la licencia qwen-research impone restricciones de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) Single-Stream, 32 capas; text encoder Qwen3-VL 8B; VAE dedicado |
| Parametros totales | 7.115.124.736 (7,1B) en el componente de generacion visual |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponibles (prompts en lenguaje natural, sin lista oficial) |
| Licencia | qwen-research (license: other); uso no comercial |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

Qwen-Image-2.1 es, segun la documentacion del proyecto upstream, un modelo unificado de generacion texto-a-imagen y edicion de imagenes. Su componente de generacion visual consta de 32 capas Single-Stream DiT con aproximadamente 7B de parametros, una arquitectura compacta disenada para equilibrar calidad, eficiencia de inferencia y versatilidad. El pipeline completo requiere tres piezas: el transformer de difusion (el que se cuantiza en este repo en formato GGUF), un text encoder Qwen3-VL de 8B y un VAE especifico (qwen_image_2.1_vae_bf16).

Esta publicacion concreta no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco documenta innovaciones tecnicas propias mas alla de las del modelo base. La contribucion de este repositorio es exclusivamente la conversion a GGUF y la generacion de multiples niveles de cuantizacion para facilitar el despliegue local en ComfyUI mediante el fork mantenido leejet/ComfyUI-GGUF, que anade soporte nativo para la arquitectura ModelQwenImage.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Edicion de imagenes, segun la descripcion del modelo base como modelo unificado de generacion y edicion.
- Ejecucion local en ComfyUI mediante el nodo Unet Loader (GGUF), con text encoder Qwen3-VL y VAE dedicados.
- Soporte de multiples niveles de cuantizacion para adaptarse a distintos presupuestos de VRAM.
- Compatibilidad con variantes MLX para hardware Apple Silicon.
- Al no incorporar safety checker en los pesos, acepta prompts que las versiones alojadas por Alibaba filtrarian.

## Casos de uso

- Generacion local de ilustraciones y concept art: el modelo permite crear imagenes a partir de prompts en una GPU de consumo usando la cuantizacion Q4_K_M (4,60 GB), sin depender de servicios en la nube.
- Edicion de imagenes en flujos de diseno: al tratarse de un modelo unificado de generacion y edicion, puede integrarse en pipelines de retoque y variacion de imagenes dentro de ComfyUI.
- Prototipado rapido de assets para videojuegos y UI: las cuantizaciones ligeras (Q4_0, 4,15 GB) permiten iterar rapidamente en equipos modestos.
- Investigacion en modelos de difusion: la disponibilidad de pesos en distintos niveles de precision (BF16, FP8, INT8, NVFP4, MLX) facilita estudiar el impacto de la cuantizacion en la calidad de salida.
- Automatizacion de generacion por lotes: ComfyUI permite construir grafos con entrada de texto programatica, util para generar lotes de imagenes en servidores propios.
- Despliegue en hardware Apple: las variantes MLX 4-bit (4,00 GB) y 6-bit (5,78 GB) estan pensadas para ejecucion eficiente en equipos con chip de Apple.
- Experimentacion artistica sin restricciones de filtrado de prompt, dentro de los limites legales aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye unicamente una referencia grafica (assets/Qwen-Image-2.1-Benchmark.png) sin datos textuales que puedan citarse, por lo que no se reproduce ninguna cifra.

## Requisitos de hardware

Estimaciones a partir de los tamanos de fichero publicados (transformer + text encoder + VAE), en VRAM:

- Q4_K_M (recomendado): transformer 4,60 GB + text encoder Qwen3-VL 8B int8 9,35 GB + VAE 0,676 GB ≈ 15 GB. Cabe en GPU de 16 GB (RTX 4080, RTX 4090 en modo ajustado).
- Q4_0: transformer 4,15 GB; con text encoder int8, aproximadamente 14 GB.
- Q8_0: transformer 7,59 GB; con text encoder int8, aproximadamente 18 GB, requiere GPU de 24 GB (RTX 3090, RTX 4090).
- BF16: transformer 14,23 GB; con text encoder Qwen3-VL 8B en BF16 (17,53 GB), el pipeline completo supera los 32 GB, por lo que requiere GPU de 40-48 GB (A100 40GB, A6000 48GB) o segmentacion por capas.
- El text encoder Qwen3-VL de 8B es, por si solo, el componente que mas VRAM consume; usar la variante int8 (9,35 GB) reduce notablemente los requisitos.
- Fuentes externas citan un minimo de "16 GB+ de VRAM" para esta publicacion.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork leejet/ComfyUI-GGUF). No aplican vLLM ni TGI al tratarse de un modelo de difusion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros del componente visual | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1 (base) | 7,1B (32 capas DiT) | safetensors | qwen-research | HuggingFace (Qwen) |
| Qwen-Image-2.1-Uncensored-GGUF (este) | 7,1B (cuantizado) | GGUF, safetensors | qwen-research | HuggingFace |
| Otras alternativas de texto-a-imagen open source (p. ej. FLUX.1-dev, SD 3.5) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. Se indica "no disponible" para los modelos alternativos por no poder verificar sus especificaciones con las fuentes consultadas.

## Limitaciones y advertencias

- Licencia qwen-research: el uso comercial esta restringido. No es una licencia de codigo abierto permisiva. Cualquier despliegue en produccion debe revisar los terminos de la licencia del modelo base Qwen.
- El termino "Uncensored" implica la ausencia de safety checker en los pesos; es responsabilidad del usuario cumplir la legislacion aplicable sobre contenido generado.
- Aunque el modelo base de Alibaba no filtra prompts a nivel de pesos, las versiones alojadas por Alibaba si aplican filtrado; este repositorio elimina esa capa de moderacion.
- Es un modelo de difusion, no un modelo de lenguaje: no ofrece contexto conversacional, tool calling ni razonamiento multi-paso.
- No hay documentacion sobre sesgos del dataset de entrenamiento ni sobre tasas de alucinacion visual (artefactos, deformaciones), aunque son riesgos habituales en modelos generativos.
- Las cuantizaciones agresivas (Q4_0, Q4_K_M) pueden degradar la fidelidad respecto a BF16; el autor recomienda Q4_K_M como compromiso.
- Discrepancia de autor: el ID del repositorio es bytehackr, pero los enlaces de ficheros de la model card apuntan a repositorios de otros usuarios (abenzerps, rayss868123) con contenido equivalente; conviene verificar la integridad de los ficheros antes de su uso.
- Repositorio con 0 descargas y 0 likes en la fecha de consulta, por lo que no hay validacion de la comunidad.
- El text encoder Qwen3-VL 8B debe descargarse en formato compatible (BF16 o int8 ConvRot); no se ofrecen cuantizaciones GGUF del text encoder.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/bytehackr/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork leejet): https://github.com/leejet/ComfyUI-GGUF
- Articulo sobre requisitos de hardware (Local Model Watch): https://localmodelwatch.tsuchitsuchi.com/en/2026/09/21/uncensored-qwen-image-2-1-gguf-released/
- Articulo sobre filtrado, licencia y legalidad: https://blog.laozhang.ai/en/posts/qwen-image-2-1-nsfw
- Repositorio espejo (rayss868123): https://huggingface.co/rayss868123/Qwen-Image-2.1-Uncensored-GGUF
