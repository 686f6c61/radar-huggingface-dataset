# GuiAworld/zen-image-edit-SDNQ-uint4-turboplus

## Resumen

Zen Image Edit es un modelo de difusion para generacion de imagen, edicion de imagen y generacion con transparencia (RGBA) construido sobre el DiT de Qwen-Image-2.1. La variante aqui descrita, `GuiAworld/zen-image-edit-SDNQ-uint4-turboplus`, es una cuantizacion uint4 con un modo "turbo" de pocos pasos derivada del modelo original `AiArtLab/zen-image-edit`, cuyo objetivo es reducir el peso en disco y en VRAM para hacerlo desplegable en tarjetas de consumo. El repositorio ocupa 6,0 GB y el recuento de parametros de safetensors es de 3.971.855.366.

La innovacion principal del modelo base es la sustitucion del codificador de texto nativo (Qwen3-VL-8B, 17,5 GB en fp16) por un Qwen3.5-0.8B (1,7 GB en fp16) acompanado de un adaptador de fusion de texto de 158M parametros integrado dentro del propio DiT. Esto reduce drasticamente el coste de despliegue. El adaptador reproduce la salida del codificador nativo con un coseno de 0,95 en texto y 0,97 en las posiciones de vision de las instrucciones de edicion. El modelo base tambien incluye un VAE decodificador reentrenado que elimina el enrejado de 2 px que deja el decodificador original.

Es relevante ahora porque combina tres tareas (texto-a-imagen, edicion multi-referencia con hasta tres imagenes de condicion y generacion RGBA) en un unico pipeline de diffusers autocontenido, sin depender de un codificador de texto externo de gran tamano. Sus autores lo publican bajo licencia `qwen-research`, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de Qwen-Image-2.1, 32 capas, con adaptador interno de fusion de texto de 158M |
| Parametros totales | 3.971.855.366 (recuento de safetensors del repo segun los metadatos de HuggingFace) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de contexto de lenguaje; las condiciones de texto/imagen se procesan en torno a 2000 tokens a 1024 px segun la model card |
| Tipos de cuantizacion | uint4 (SDNQ) en esta variante; version GGUF Q5_K disponible en otro repo; fp16 en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | `qwen-research` (license: other) |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La columna vertebral es un transformer de difusion (DiT) de Qwen-Image-2.1 con 32 capas que, en fp16, pesa 14,5 GB, mas un adaptador de fusion de texto de 158M parametros alojado dentro del propio DiT como su bloque de fusion. El codificador de texto es un Qwen3.5-0.8B (1,7 GB en fp16), un checkpoint re-guardado a fp16 con tokenizer y processor sin cambios respecto al original; a el se le anade el adaptador, afinado para reproducir lo que producia el codificador nativo tanto desde texto plano como desde texto leido junto a las imagenes de referencia. El VAE es de Qwen-Image-2.1 con factor espacial 16x, cargado en fp32, y el scheduler es un `FlowMatchEulerDiscreteScheduler` con un desplazamiento estatico de 5.0 (sin dynamic shifting).

El VAE incluido no es el original: es un decodificador reentrenado a partir de `madebyollin/texture-fix-vae-for-qwen-image-2.1`, entrenado durante 5300 pasos para eliminar el enrejado de 2 px que el decodificador de serie fija en la salida. La perdida combina lpips, mse, mae y edge, mas un termino extra que penaliza la diferencia pico a pico entre las subreticulas 2x2 de la reconstruccion y del objetivo; el codificador es identico bit a bit, por lo que el espacio latente no cambia. La revision v12 del adaptador cubre 2304 posiciones en su tabla de posiciones de la rama de atencion y se afino con la geometria real de inferencia, lo que elevo el coseno de vision frente al codificador nativo de 0,93 a 0,97. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se uso RLHF o DPO.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) a resolucion configurable via `output_resolution`, 1024 px por defecto.
- Edicion de imagen con una o varias imagenes de condicion: la primera actua como objetivo de edicion y las siguientes como referencias, invocadas en el prompt mediante etiquetas `<image1>`, `<image2>`, etc.
- Edicion con tres imagenes de condicion simultaneas (objetivo y composicion desde `<image1>`, sujeto desde `<image2>`, color e iluminacion desde `<image3>`).
- Sustitucion de personajes manteniendo pose, ropa y escena del objetivo, copiando la identidad desde una referencia.
- Generacion con transparencia (RGBA).
- Ajuste de la resolucion de salida a la relacion de aspecto de la imagen de condicion.
- Fusion de texto mediante adaptador interno, sin codificador externo grande.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Edicion de producto para comercio electronico: sustituir el fondo de una fotografia manteniendo el producto intacto usando una unica imagen de condicion, util para catalogos con miles de referencias que necesitan fondos homogeneos.
- Creacion de material grafico con transparencia: generar imagenes RGBA listas para composicion en diseno, evitando el paso manual de recorte y recorte alfa.
- Prototipado de personajes para videojuegos o animacion: usar dos imagenes de condicion para conservar la pose y la escena del objetivo mientras se copia la identidad de una referencia de personaje.
- Direccion de arte y previsualizacion: con tres imagenes de condicion se puede fijar composicion, sujeto e iluminacion por separado, lo que sirve para generar variaciones coherentes en fase de concepto.
- Retoque fotografico asistido: cambiar fondo o entorno de un retrato conservando al sujeto, sin edicion manual capa por capa.
- Generacion de ilustraciones editoriales a partir de una descripcion textual, usando la rama text-to-image a 1024 px y 30 pasos.
- Despliegue en equipos de gama de consumo: al estar cuantizado en uint4, permite generar y editar en tarjetas de 16 GB o menos (con las reservas de VRAM indicadas mas abajo), lo que facilita su uso en estaciones de trabajo locales sin GPU de centro de datos.

## Benchmarks y rendimiento

La informacion disponible incluye metricas de reconstruccion del VAE y del enrejado de salida, medidas sobre el modelo base, no sobre esta variante cuantizada. No se han publicado resultados de benchmarks de generacion (FID, CLIP, HumanEval, MMLU ni equivalentes) en la informacion disponible, por lo que no se aportan.

Reconstruccion sobre 32 imagenes reservadas a 512 px:

| Decodificador | PSNR | LPIPS | Enrejado (/255) |
|---|---:|---:|---:|
| Qwen-Image-2.1 original | 33,073 | 0,05316 | 2,631 |
| texture-fix | 32,840 | 0,05388 | 0,125 |
| VAE de este modelo | 33,397 | 0,05291 | 0,000 |

Generacion a 768x1280, 50 pasos, semilla fija, solo cambiando el VAE:

| Decodificador | Enrejado (/255) |
|---|---:|
| Original | 1,78 / 1,70 / 2,59 |
| VAE de este modelo | 0,09 / 0,25 / 0,17 |

## Requisitos de hardware

- VRAM del modelo base segun su model card: aproximadamente 17,5 GB residentes en fp16, incluyendo el DiT de 14,5 GB mas el decodificador VAE en fp32.
- `enable_model_cpu_offload()` esta recomendado por el autor porque el DiT de 14,5 GB y el decodificador VAE en fp32 no coexisten en 32 GB de VRAM.
- Version GGUF Q5_K del transformer (`recoilme/zen-image-edit-gguf`): reduce el transformer de 13,55 GiB a 4,52 GiB y permite un pico de 8,9 GB que cabe en una tarjeta de 16 GB sin descargar a CPU en cada paso; en ese repo `text_fusion` queda sin cuantizar.
- Esta variante uint4 deberia reducir aun mas el peso del transformer, pero no se proporciona una cifra de VRAM concreta para ella: no disponible.
- GPU recomendadas: no se listan modelos concretos (A100, H100, RTX 4090) en la informacion disponible; los datos de VRAM permiten inferir compatibilidad con tarjetas de 16 GB o mas cuando se usa la version GGUF, y con tarjetas de 24-32 GB o mas para el modelo base en fp16 con offload.
- Opciones de despliegue: libreria diffusers con `DiffusionPipeline.from_pretrained` y `custom_pipeline="pipeline"`, mas `trust_remote_code=True`; existe version GGUF para llama.cpp/entornos de bajo consumo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento frente a otros modelos en la informacion proporcionada. Como referencias de la misma categoria (edicion de imagen con diffusion):

| Modelo | Parametros | Contexto / condicion | Licencia | Disponibilidad |
|---|---|---|---|---|
| zen-image-edit (este linaje) | 3,97B segun safetensors | hasta 3 imagenes de condicion, ~2000 tokens a 1024 px | qwen-research | HuggingFace (diffusers) |
| Variante uint4 de GuiAworld | 3,97B segun safetensors | igual que el anterior, cuantizada a uint4 | qwen-research | HuggingFace (este repo) |
| Version GGUF Q5_K | transformer 4,52 GiB | igual, transformer cuantizado | qwen-research | HuggingFace |
| Alternativas de edicion de imagen de otros proveedores | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia `qwen-research`: es una licencia de investigacion, no una licencia permisiva; el uso comercial esta restringido y debe revisarse el texto completo en el enlace de licencia antes de cualquier despliegue productivo.
- El modelo se publica como variante cuantizada (uint4) y con modo "turbo"; la cuantizacion suele degradar la fidelidad de generacion respecto al modelo en fp16, y no hay metricas publicadas en este repositorio que cuantifiquen esa perdida.
- No se documentan sesgos concretos ni composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, culturales o de estilo.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede inventar detalles, alterar identidades o producir artefactos en las regiones editadas, especialmente con multiples imagenes de condicion.
- Al ser un modelo de imagen, no soporta razonamiento, codigo ni texto generativo; confundir su ambito de uso llevaria a expectativas erroneas.
- Los idiomas soportados no estan documentados; el comportamiento con prompts en castellano no esta verificado en la informacion disponible.
- Los requisitos de VRAM de esta variante concreta no estan publicados; las cifras de 17,5 GB y 8,9 GB corresponden al modelo base y a la version GGUF respectivamente.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GuiAworld/zen-image-edit-SDNQ-uint4-turboplus
- Modelo base original: https://huggingface.co/AiArtLab/zen-image-edit
- Licencia: https://huggingface.co/AiArtLab/zen-image-edit/blob/main/LICENSE
- Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- VAE original de Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1/vae
- Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Version GGUF de bajo consumo: https://huggingface.co/recoilme/zen-image-edit-gguf
- VAE texture-fix: https://huggingface.co/madebyollin/texture-fix-vae-for-qwen-image-2.1
