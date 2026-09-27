# RaymondJ/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

RaymondJ/Qwen-Image-2.1-Uncensored-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1, publicado por el usuario RaymondJ. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local: la model card indica explicitamente que se parte de los pesos base originales de Qwen-Image 2.1 y que la variante "uncensored" se distribuye sin el filtrado de contenido del autor original. El repositorio incluye tambien los ficheros acompanantes necesarios para su uso en ComfyUI: el text encoder Qwen3-VL 8B (en BF16 e Int8) y el VAE del modelo base.

El interes practico de esta publicacion esta en el empaquetado, no en la arquitectura. Al ofrecer el transformer en GGUF con cuantizaciones que van de BF16 (14,23 GB) hasta Q4_0 (4,15 GB), permite ejecutar un modelo de generacion de imagenes de gran tamano en GPUs de consumo, algo inviable con los pesos en precision completa. La recomendacion del autor para el equilibrio tamano/calidad es Q4_K_M (4,60 GB).

El modelo base declara 7.115.124.736 parametros en los metadatos de safetensors y un tamano de repositorio de 105 GB. Conviene senalar dos inconsistencias detectadas en la informacion: el tamano del repositorio no cuadra con la suma de los ficheros listados, y los enlaces de descarga de la model card apuntan a un espacio de nombres distinto (`abenzerps`) en lugar del repositorio del autor. La licencia es `qwen-research`, con las restricciones que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (cuantizacion de un modelo de difusion texto-a-imagen; la model card no detalla la arquitectura interna de Qwen-Image 2.1) |
| Parametros totales | 7.115.124.736 (segun metadatos de safetensors del modelo base) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (los prompts se procesan mediante el text encoder Qwen3-VL 8B, que es multilingue, pero la model card no declara lista de idiomas) |
| Licencia | `other` con `license_name: qwen-research` |
| Formato de pesos | GGUF y safetensors (el VAE y los text encoders van en safetensors) |
| Pipeline | text-to-image |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Libreria | gguf |
| Tamano del repositorio | 105,0 GB |
| Fecha de creacion | 26 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

Ficheros de cuantizacion del transformer (variante uncensored):

| Cuantizacion | Fichero | Tamano |
|---|---|---:|
| BF16 | qwen-image-2.1-UC-BF16.gguf | 14,23 GB |
| FP8 | qwen-image-2.1-UC-fp8.safetensors | 6,63 GB |
| INT8 ConvRot | qwen-image-2.1-UC-int8_convrot.safetensors | 6,76 GB |
| NVFP4 | qwen-image-2.1-UC-NVFP4.gguf | 4,05 GB |
| MLX 4-bit | qwen-image-2.1-UC-MLX-4bit.safetensors | 4,00 GB |
| MLX 6-bit | qwen-image-2.1-UC-MLX-6bit.safetensors | 5,78 GB |
| MLX 8-bit | qwen-image-2.1-UC-MLX-8bit.safetensors | 7,56 GB |
| Q8_0 | qwen-image-2.1-UC-Q8_0.gguf | 7,59 GB |
| Q6_K | qwen-image-2.1-UC-Q6_K.gguf | 5,88 GB |
| Q5_K_M | qwen-image-2.1-UC-Q5_K_M.gguf | 5,22 GB |
| Q4_K_M | qwen-image-2.1-UC-Q4_K_M.gguf | 4,60 GB |
| Q4_0 | qwen-image-2.1-UC-Q4_0.gguf | 4,15 GB |

Ficheros acompanantes:

| Tipo | Fichero | Precision | Tamano |
|---|---|---|---:|
| Text encoder | text_encoders/qwen3vl_8b_bf16.safetensors | BF16 | 17,53 GB |
| Text encoder | text_encoders/qwen3vl_8b_int8_convrot.safetensors | Int8 | 9,35 GB |
| VAE | vae/qwen_image_2.1_vae_bf16.safetensors | BF16 | 676 MB |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura ni sobre el proceso de entrenamiento en la documentacion proporcionada. La model card se limita a indicar que se trata de cuantizaciones GGUF del modelo Qwen/Qwen-Image-2.1, realizadas a partir de los pesos base originales ("using the original upstream base weights"), sin procesos adicionales de ajuste fino, RLHF, DPO ni destilacion. Tampoco se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de difusion empleadas por el modelo base.

Lo unico verificable es la cadena de dependencias del pipeline: el transformer de difusion en GGUF, un text encoder basado en Qwen3-VL 8B (que aporta comprension de texto e imagen) y un VAE especifico (`qwen_image_2.1_vae_bf16`). La innovacion tecnica del repositorio es, por tanto, de ingenieria de despliegue: la publicacion simultanea de cuantizaciones en GGUF, safetensors, FP8, INT8 ConvRot, NVFP4 y MLX, lo que cubre tanto el ecosistema llama.cpp/ComfyUI como el de Apple Silicon. Se menciona en la model card una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) sin cifras asociadas.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), ejecutable en local.
- Comprension de prompts mediante un text encoder multimodal Qwen3-VL 8B, lo que permite descripciones textuales detalladas y potencialmente referencias visuales, aunque la model card no especifica capacidades de imagen-a-imagen.
- Integracion nativa con ComfyUI mediante el nodo `Unet Loader (GGUF)` y el nodo estandar `CLIPLoader` para el text encoder.
- Ejecucion en GPUs de consumo gracias a las cuantizaciones de 4 bits (Q4_0, Q4_K_M, NVFP4, MLX 4-bit).
- Ejecucion en hardware Apple Silicon mediante las variantes MLX de 4, 6 y 8 bits.
- Variante sin filtrado de contenido ("uncensored"), que elimina la censura aplicada en el modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modos de "thinking". Tampoco se declara soporte multilingue explicito.

## Casos de uso

- Generacion de ilustraciones para publicaciones: con la cuantizacion Q4_K_M (4,60 GB) el modelo cabe en GPUs de gama media y permite producir ilustraciones editoriales por lotes integradas en un flujo de ComfyUI, sin enviar los prompts a servicios en la nube.
- Prototipado de assets para videojuegos: generacion rapida de conceptos de personajes, entornos y objetos para iterar sobre direcciones artisticas antes de encargar el trabajo final a un artista.
- Creacion de material de marketing: banners, fondos y variaciones visuales de producto generadas en local, con la ventaja de poder ajustar el estilo mediante el prompt sin coste por imagen.
- Fotografia de producto para comercio electronico: generacion de escenas y fondos sinteticos sobre los que componer imagenes de catalogo, usando el VAE y el text encoder del propio repositorio.
- Flujos de trabajo sensibles a la privacidad: al ejecutarse enteramente en local (transformer, text encoder y VAE descargados en disco), es adecuado para entornos donde no se permite enviar material grafico a APIs externas.
- Investigacion en seguridad de modelos generativos: la variante uncensored permite estudiar el comportamiento del modelo sin las capas de rechazo del modelo base, util para auditar sesgos, evaluar riesgos de contenido y desarrollar clasificadores de seguridad.
- Ilustracion anatomica y figura humana: generacion de referencias de figura desnuda para dibujo artistico o estudios medicos, escenario en el que el filtrado de contenido del modelo base suele producir falsos positivos.
- Despliegue en portatiles Apple Silicon: las variantes MLX de 4 y 6 bits (4,00 GB y 5,78 GB) permiten generar imagenes en un Mac sin GPU dedicada.
- Experimentacion con pipelines de cuantizacion: el repositorio publica simultaneamente GGUF, safetensors, FP8, INT8 ConvRot y NVFP4, lo que lo convierte en un banco de pruebas para comparar calidad y velocidad entre formatos sobre el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una referencia a una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) sin valores, metricas ni modelos de comparacion asociados, por lo que no es posible extraer cifras.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones aritmeticas a partir de los tamanos de fichero publicados en la model card, sumando transformer + text encoder + VAE. No proceden de mediciones del autor.

- Q4_0 + text encoder Int8 + VAE: aproximadamente 14,0 GB.
- Q4_K_M + text encoder Int8 + VAE: aproximadamente 14,6 GB.
- Q5_K_M + text encoder Int8 + VAE: aproximadamente 15,2 GB.
- Q6_K + text encoder BF16 + VAE: aproximadamente 24,1 GB.
- Q8_0 + text encoder BF16 + VAE: aproximadamente 25,8 GB.
- BF16 completo + text encoder BF16 + VAE: aproximadamente 32,4 GB.
- Uso exclusivo del text encoder en BF16 (17,53 GB) en lugar de Int8 (9,35 GB): incrementa el consumo en unos 8,2 GB. La model card recomienda explicitamente la variante Int8 ConvRot para equipos con menos memoria.
- GPU de consumo: las configuraciones Q4 requieren del orden de 14-15 GB, por lo que encajan en tarjetas de 16 GB, como la RTX 4080, la RTX 4060 Ti de 16 GB o la RTX 4090 con margen amplio. Las configuraciones Q6 y Q8 quedan fuera del rango de 16 GB.
- GPU de gama profesional: las cuantizaciones Q8_0 y BF16 son adecuadas para A100 de 40/80 GB, H100 o L40S.
- Apple Silicon: las variantes MLX 4-bit y 6-bit estan pensadas para memoria unificada; con el text encoder Int8, el conjunto ronda los 14 GB, viable en equipos con 24 GB o mas de memoria unificada.
- Opciones de despliegue: ComfyUI con el nodo `Unet Loader (GGUF)` y el plugin ComfyUI-GGUF. La model card advierte de que hay que usar el fork mantenido de leejet, que incluye soporte nativo de Qwen-Image 2.1; con el fork antiguo de city96 se produce el error `Unknown model architecture!`. Como alternativa, la model card sugiere anadir `ModelQwenImage` a `tools/convert.py`.
- Latencia y throughput: no disponibles. Dependen del modelo de GPU, de la cuantizacion y de la resolucion de salida, y no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos de generacion de imagenes en la informacion proporcionada. La unica comparacion que puede establecerse con datos verificables es entre las propias variantes del repositorio:

| Variante | Tamano del transformer | Precision | Caso de uso recomendado |
|---|---:|---|---|
| BF16 | 14,23 GB | 16 bits (referencia de calidad) | GPU profesionales con 40 GB o mas |
| Q8_0 | 7,59 GB | 8 bits | Equipos con 24 GB o mas |
| Q6_K | 5,88 GB | 6 bits | Equipos con 24 GB |
| Q5_K_M | 5,22 GB | 5 bits | Equipos con 16-24 GB |
| Q4_K_M | 4,60 GB | 4 bits (recomendada por el autor) | Equipos con 16 GB |
| Q4_0 | 4,15 GB | 4 bits | Equipos con 12-16 GB |
| NVFP4 | 4,05 GB | 4 bits FP | GPUs con soporte NVFP4 |
| MLX 4/6/8-bit | 4,00 / 5,78 / 7,56 GB | 4, 6 y 8 bits | Apple Silicon |

Frente a alternativas de la misma categoria (modelos de difusion texto-a-imagen de gran tamano como FLUX.1-dev o Stable Diffusion 3.5), no hay en la informacion proporcionada datos de parametros, contexto, rendimiento ni licencia que permitan una comparacion rigurosa. Se indica, por tanto: comparativa con modelos externos no disponible.

## Limitaciones y advertencias

- Contenido sin filtrar: la variante "uncensored" elimina los filtros de contenido del modelo base. El usuario es responsable del uso que haga del modelo y de cumplir la legislacion aplicable en su jurisdiccion, incluida la relativa a contenido sexual, proteccion de menores y derechos de imagen.
- Licencia restrictiva: la licencia es `qwen-research` (declarada como `other` en los metadatos). Se trata de una licencia de investigacion, no de una licencia permisiva; es imprescindible revisar los terminos completos antes de cualquier uso comercial. La disponibilidad comercial no esta garantizada por la informacion proporcionada.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos incorrectos, texto ilegible en las imagenes, manos deformadas y elementos inconsistentes con el prompt. No hay metricas publicadas que cuantifiquen este comportamiento en esta version cuantizada.
- Perdida de calidad por cuantizacion: las variantes de 4 bits reducen la fidelidad respecto a BF16. La model card no publica comparativas de calidad entre cuantizaciones, por lo que la eleccion de Q4_K_M es una recomendacion de compromiso, no un resultado medido.
- Idiomas no declarados: no se especifica la lista de idiomas soportados. El text encoder Qwen3-VL 8B es multilingue por diseno, pero la calidad de generacion con prompts en castellano no esta documentada.
- Dependencia de ComfyUI: el flujo de uso descrito exige ComfyUI y un fork concreto del plugin GGUF. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp estandar, herramientas orientadas a modelos de lenguaje y no a difusion.
- Inconsistencias en el repositorio: los enlaces de descarga de la model card apuntan al espacio de nombres `abenzerps` en lugar de a `RaymondJ`, y el tamano declarado del repositorio (105 GB) no coincide con la suma de los ficheros listados. Conviene verificar la integridad de las descargas.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, sin issues ni discusion publica. No hay evidencia externa de que las cuantizaciones funcionen correctamente mas alla de lo que afirma el autor.
- Sin datos de rendimiento: no hay mediciones de latencia, throughput ni consumo de VRAM reales, solo los tamanos de fichero.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RaymondJ/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Plugin ComfyUI-GGUF (fork mantenido con soporte de Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces obtenidos no guardan relacion con el contenido tecnico de la ficha y se han descartado.
