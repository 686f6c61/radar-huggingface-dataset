# JoaoZaokk/P-H3-Image-W4A16

## Resumen
P-H3-Image-W4A16 es una cuantizacion de 4 bits del modelo de difusion P-H3-Image de Pruna AI, publicada por el usuario JoaoZaokk en Hugging Face. Concretamente, toma los pesos de 4 bits del build `p-h3-image_w4a8` de Pruna AI y vuelve a configurar las activaciones en 16 bits (multiplicacion de matrices en precision completa), manteniendo los pesos intactos byte a byte. El resultado es un unico archivo de difusion de 12,44 GiB pensado para ComfyUI, orientado a generacion de texto a imagen y edicion de imagenes.

El modelo base P-H3-Image pertenece a la familia MiniMax H3 y se distribuye bajo la MiniMax H3 Community License Agreement. Esta version concreta no es un producto oficial ni de MiniMax ni de Pruna AI: es una modificacion de terceros que solo cambia la configuracion por capa dentro del archivo. Su proposito declarado es experimental: comprobar si mantener las activaciones en 16 bits mejora la calidad de un modelo de difusion cuantizado a 4 bits.

La relevancia de esta ficha es fundamentalmente practica y critica. El propio autor documenta que este build no supera al W4A8 del que parte: consume la misma memoria, es entre un 39 % y un 62 % mas lento en una RTX 3090 y su PSNR frente a INT8 no mejora. Ademas, la licencia impone una restriccion territorial severa que excluye a la Union Europea, el Reino Unido, Corea del Sur y Estados Unidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion para texto a imagen (detalles de la red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos INT4 (W4), activaciones FP16 (A16) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (con restriccion territorial) |
| Formato de pesos | diffusion-single-file para ComfyUI (12,44 GiB) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo de difusion P-H3-Image: no se especifican el tipo de backbone (UNet, transformer de difusion u otro), el numero de parametros ni la composicion del dataset de entrenamiento. Lo que si se documenta es el proceso de cuantizacion: se parte de los pesos de 4 bits del build W4A8 de Pruna AI y se reconfigura la multiplicacion de matrices para operar en 16 bits (`full_precision_matrix_mult`), sin tocar los pesos. El archivo incorpora configuraciones de cuantizacion por capa inline en formato `.comfy_quant`.

El modelo requiere ComfyUI v0.44.0 o superior, con soporte para P-H3, los nodos `PH3ImageConditioning` y `MiniMaxH3SigmaShift`. El text encoder, el VAE y los flujos de trabajo no forman parte de este repositorio: provienen de `PrunaAI/P-H3-Image-Comfy`. No se dispone de informacion sobre tecnicas de alineacion (RLHF, DPO) ni sobre innovaciones de decodificacion.

## Capacidades
- Generacion de imagenes a partir de texto (text-to-image) en resoluciones de 4 MP (2048²) y 8 MP.
- Edicion de imagenes y modos multi-imagen, segun la model card del modelo base; el autor indica que estas variantes no fueron probadas en este build.
- Integracion con ComfyUI mediante nodos especificos de la familia P-H3.
- Soporte de prompt upsampler en el pipeline (aunque las mediciones se hicieron con el upsampler desactivado).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking, dado que es un modelo de difusion y no un LLM.
- Capacidades multilingues: no disponibles.

## Casos de uso
- Evaluacion comparativa de cuantizaciones: el modelo sirve como brazo de control en experimentos que miden el efecto de mantener activaciones en 16 bits frente a cuantizaciones W4A8, usando las mismas semillas y prompts.
- Generacion de imagenes de alta resolucion en ComfyUI: permite producir renders a 4 MP y 8 MP en GPUs de 24 GB, donde el archivo BF16 de 40 GB no cabe.
- Prototipado de pipelines de difusion cuantizada: util para desarrolladores que quieran validar la compatibilidad de sus nodos y flujos con los pesos INT4 de P-H3 antes de adoptar el build W4A8.
- Reproduccion de benchmarks de cuantizacion: junto con las herramientas del repositorio `comfy-quant-bench`, permite replicar las mediciones de tiempo por paso y VRAM pico documentadas por el autor.
- Estudio de la relacion entre PSNR y calidad percibida: los datos publicados (PSNR de 14,5 a 17,2 dB frente a INT8) sirven para analizar los limites de las metricas objetivas en difusion.
- Docencia e investigacion sobre cuantizacion post-entrenamiento: un caso real de conversion de pesos con configuracion por capa inline en un formato propietario de ComfyUI.

## Benchmarks y rendimiento
Los datos publicados por el autor se midieron en una RTX 3090 (sm86), con 8 pasos, sin CFG, text encoder INT8 y VAE INT8, y prompt upsampler desactivado. Se realizaron 6 renders por variante.

| Metrica | INT8 ConvRot (Pruna AI) | W4A8 (Pruna AI) | W4A16 (este repo) |
|---|---|---|---|
| Tamano de archivo | 19,8 GiB | 12,44 GiB | 12,44 GiB |
| Tiempo por paso, 4 MP (2048²) | 1,26 s | 1,31 s | 2,12 s (+62 %) |
| Tiempo por paso, 8 MP | 3,26 s | 3,31 s | 4,61 s (+39 %) |
| VRAM pico | 22,7 GB | 22,0 GB | 22,1 GB |
| PSNR frente a INT8 (6 imagenes) | — | 15,1–17,6 dB | 14,5–17,2 dB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de difusion.

## Requisitos de hardware
- VRAM estimada: aproximadamente 22,1 GB de pico en las mediciones del autor, practicamente identica al build W4A8 (22,0 GB).
- GPU recomendadas: RTX 3090 verificada por el autor; se requiere una GPU con al menos 24 GB de VRAM para el pipeline completo con text encoder y VAE en INT8.
- Cabe en GPUs de consumo con 24 GB (RTX 3090, RTX 4090), pero no en tarjetas de 16 GB o menos con esta configuracion.
- El archivo BF16 de 40 GB no cabe en 24 GB, por lo que la referencia de comparacion es el build INT8.
- Opciones de despliegue: ComfyUI v0.44.0 o superior con soporte P-H3. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de difusion en formato single-file.
- Latencia: 2,12 s por paso a 4 MP y 4,61 s por paso a 8 MP en RTX 3090, con 8 pasos por render. No se proporcionan datos de throughput agregado ni de otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P-H3-Image W4A16 (este repo) | no disponible | no disponible | 2,12 s/paso a 4 MP; PSNR 14,5–17,2 dB vs INT8 | MiniMax H3 Community (restringida por territorio) | Hugging Face, 0 descargas |
| P-H3-Image W4A8 (Pruna AI) | no disponible | no disponible | 1,31 s/paso a 4 MP; PSNR 15,1–17,6 dB vs INT8 | MiniMax H3 Community | Hugging Face |
| P-H3-Image INT8 ConvRot (Pruna AI) | no disponible | no disponible | 1,26 s/paso a 4 MP; archivo de 19,8 GiB | MiniMax H3 Community | Hugging Face |
| P-H3-Image BF16 (referencia) | no disponible | no disponible | no medido (no cabe en 24 GB) | MiniMax H3 Community | Hugging Face |

No se dispone de datos para comparar con modelos de difusion de otras familias (por ejemplo, Flux o SDXL), ya que la informacion proporcionada no incluye sus especificaciones ni resultados.

## Limitaciones y advertencias
- Restriccion territorial de licencia: la MiniMax H3 Community License Agreement solo concede derechos fuera de la Union Europea, el Reino Unido, Corea del Sur y Estados Unidos. Si el usuario se encuentra en uno de esos territorios, el repositorio no le esta licenciado.
- Se aplican ademas la Acceptable Use Policy (Exhibit A) y los terminos comerciales (Seccion IV) de la licencia.
- El archivo fue modificado por JoaoZaokk y no es un producto oficial de MiniMax ni de Pruna AI; debe consultarse el archivo `NOTICE`.
- Rendimiento inferior al W4A8 de origen: entre un 39 % y un 62 % mas lento en RTX 3090, con la misma memoria y sin mejora de PSNR.
- El autor advierte explicitamente que este build no es mejor que el W4A8 y que no encontro razon para preferirlo.
- No se probaron el modo de edicion de imagenes, los modos multi-imagen, el LoRA ni otras GPUs distintas de la RTX 3090.
- La validacion visual se limita a seis imagenes revisadas por una sola persona; el PSNR no mide calidad percibida.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, aunque son inherentes a los modelos generativos de imagen.
- Con 0 descargas y 0 likes, no existe validacion de la comunidad sobre este build.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento del text encoder en castellano.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/JoaoZaokk/P-H3-Image-W4A16
- Modelo base: https://huggingface.co/PrunaAI/P-H3-Image-Comfy
- Herramientas y registro de mediciones: https://github.com/JoaoZaokk/comfy-quant-bench
- Datasets del autor: https://huggingface.co/JoaoZaokk/datasets
