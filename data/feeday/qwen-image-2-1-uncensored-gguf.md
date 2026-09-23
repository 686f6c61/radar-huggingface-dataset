# feeday/Qwen-Image-2.1-Uncensored-GGUF

## Resumen
Qwen-Image-2.1-Uncensored-GGUF es un repositorio de cuantizaciones del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1, publicado por el usuario feeday en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversion de los pesos base upstream a formatos GGUF y safetensors cuantizados, distribuida junto con los ficheros complementarios necesarios para su uso local (text encoder y VAE). El objetivo declarado es permitir la generacion de imagenes en local mediante ComfyUI, ademas de ofrecer variantes etiquetadas como "uncensored".

El recuento de parametros del transformador de difusion es de 7.115.124.736 (aproximadamente 7,1 mil millones), segun los datos de safetensors. El repositorio ocupa 83.6 GB e incluye ocho cuantizaciones de la variante "uncensored" (BF16, FP8, INT8 convrot, Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0) y cinco de la variante base (Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0). El text encoder asociado es un Qwen3-VL de 8B, disponible en BF16 (17,53 GB) e INT8 (9,35 GB).

Su relevancia es practica: reduce el coste de hardware para ejecutar un modelo de generacion de imagenes de ~7,1B en equipos de consumo, algo que los pesos en precision completa no permiten. La licencia declarada es qwen-research (license: other), y el repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que carece de validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo de difusion texto-a-imagen; emplea un text encoder Qwen3-VL-8B y un VAE propios) |
| Parametros totales | 7.115.124.736 (~7,1 B), recuento de safetensors del transformador de difusion |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible (no aplica en el sentido habitual de modelos de lenguaje) |
| Tipos de cuantizacion | BF16, FP8, INT8 convrot, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF (transformador) y safetensors (FP8, INT8, text encoder, VAE) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Pipeline | text-to-image |
| Text encoder | Qwen3-VL 8B en BF16 (17,53 GB) o INT8 convrot (9,35 GB) |
| VAE | qwen_image_2.1_vae_bf16.safetensors (676 MB) |
| Tamano del repositorio | 83,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento
La informacion proporcionada no detalla la arquitectura interna del modelo base ni su proceso de entrenamiento. Por la estructura de ficheros publicada se deduce que se trata de un modelo de difusion texto-a-imagen con tres componentes desacoplados: un transformador de difusion (~7,1 B de parametros) que se cuantiza a GGUF, un text encoder Qwen3-VL de 8B y un VAE especifico (qwen_image_2.1_vae_bf16). No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El trabajo realizado por el autor del repositorio es de cuantizacion y empaquetado, no de entrenamiento: la model card indica explicitamente que las cuantizaciones GGUF se generan "using the original upstream base weights" de Qwen/Qwen-Image-2.1. Se ofrecen dos familias de ficheros, una etiquetada como "uncensored" (prefijo `UC` en el nombre) y otra sin ese sufijo, pero no se documenta que modificacion concreta se aplico para obtener la variante sin censura, ni si hubo fine-tuning, ablacion de filtros o simple eliminacion de metadatos de seguridad.

El repositorio incluye una imagen de benchmark (assets/Qwen-Image-2.1-Benchmark.png) referenciada en la model card, pero sin valores numericos legibles en la informacion disponible. La model card esta truncada en la seccion de notas de memoria y rendimiento, por lo que parte de las recomendaciones de despliegue no son recuperables.

## Capacidades
- Generacion de imagenes a partir de descripciones textuales (text-to-image), con el transformador de difusion cuantizado como componente principal.
- Edicion de imagenes: el repositorio apunta a una plantilla oficial de flujo de trabajo de edicion (`image_qwen_image_2_1_image_edit.json`) ademas de la de texto-a-imagen.
- Integracion nativa en ComfyUI mediante el nodo `Unet Loader (GGUF)` y el cargador `CLIPLoader` configurado con `type = qwen_image`.
- Ejecucion local con soporte de cuantizaciones de 4 a 16 bits, lo que permite ajustar el compromiso entre VRAM y calidad.
- Comprension de prompts delegada a un text encoder Qwen3-VL de 8B, que aporta codificacion multimodal de texto (y potencialmente imagen, por la naturaleza VL del encoder), aunque sus capacidades concretas no se detallan.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso y generacion de texto: no aplicables, ya que no es un modelo de lenguaje.
- Capacidades multilingues: no disponibles; no se documenta el rendimiento del text encoder con prompts en castellano.

## Casos de uso
- Ilustracion y concept art en local: un estudio puede generar bocetos e imagenes de concepto sin enviar prompts a servicios en la nube, usando la cuantizacion Q4_K_M (4,60 GB) junto con el text encoder INT8 para reducir el consumo de VRAM.
- Prototipado de assets para videojuegos: generacion rapida de variaciones de personajes, entornos y objetos para iterar sobre la direccion artistica antes de encargar el trabajo final a un artista.
- Edicion de imagenes existentes: el flujo de trabajo oficial de edicion permite tomar una imagen de entrada y modificarla mediante prompt, util para retoque, cambio de estilo o variaciones controladas sobre material ya producido.
- Generacion de material de marketing y redes sociales: produccion de banners, ilustraciones y fondos a medida en un equipo pequeno, con la ventaja de que no hay coste por imagen ni limite de peticiones.
- Aumento de datasets sinteticos: creacion de imagenes etiquetadas para entrenar o evaluar otros modelos de vision, aprovechando que el pipeline es totalmente local y reproducible.
- Investigacion sobre modelos generativos sin alineacion: la variante etiquetada como "uncensored" es util para estudiar el efecto de los filtros de seguridad en la distribucion de salidas, o para pruebas de red teaming, siempre que se respete la licencia.
- Flujos creativos con requisitos de privacidad: sectores con datos sensibles (salud, legal, defensa) que no pueden usar APIs externas pueden desplegar el modelo en infraestructura propia.
- Integracion en pipelines automatizados de diseno: generacion por lotes de variantes graficas a partir de una plantilla de prompts, orquestada con los nodos de ComfyUI.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) y el repositorio hereda la condicion de cuantizacion del modelo base, pero no se proporcionan valores numericos de metricas como FID, CLIPScore, GenEval, DPG-Bench o similares, ni comparaciones cifradas con otros modelos. La busqueda web realizada tampoco devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware
- VRAM estimada para el pipeline completo (transformador + text encoder + VAE), calculada a partir de los tamanos de fichero publicados: con Q4_K_M (4,60 GB) + text encoder INT8 (9,35 GB) + VAE (0,68 GB) el minimo ronda los 14,6 GB, sin contar activaciones ni buffers de muestreo.
- Con el text encoder en BF16 (17,53 GB) el mismo pipeline supera los 22,8 GB, por lo que no cabe en GPUs de 16 GB sin descarga parcial a RAM.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para el pipeline completo con text encoder BF16; RTX 4080 / 4070 Ti Super (16 GB) con text encoder INT8 y cuantizaciones Q4; A100 o H100 para generacion por lotes o resoluciones altas.
- Cabe en GPU de consumo: si, en el rango de 12 a 24 GB, siempre que se use una cuantizacion Q4 y se acepte mover el text encoder a RAM o a CPU. En GPUs de 8 GB no hay margen suficiente con los ficheros listados.
- La model card recomienda mantener el modelo de difusion GGUF en VRAM (donde la velocidad es critica durante el muestreo) y delegar el resto de componentes a RAM, aunque el texto esta truncado y no se detalla la configuracion completa.
- Opciones de despliegue: ComfyUI con el nodo `Unet Loader (GGUF)` y la extension ComfyUI-GGUF. El repositorio exige explicitamente el fork `leejet/ComfyUI-GGUF`, con soporte nativo de Qwen-Image 2.1; el fork antiguo `city96/ComfyUI-GGUF` provoca el error `Unknown model architecture!` salvo parcheo manual de `tools/convert.py`.
- Formatos alternativos de despliegue (vLLM, TGI, Ollama, llama.cpp, diffusers) no estan documentados en la informacion proporcionada para estos ficheros.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 83,6 GB, aunque basta con descargar una cuantizacion, el text encoder y el VAE (por ejemplo, ~15 GB en el caso Q4_K_M + INT8).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-GGUF (este repositorio) | ~7,1 B (transformador de difusion) | GGUF y safetensors cuantizados | qwen-research (license: other) | HuggingFace, 0 descargas | Incluye text encoder y VAE empaquetados; variante "uncensored" sin documentar |
| Qwen/Qwen-Image-2.1 (modelo base) | no disponible | no disponible | qwen-research | HuggingFace (repositorio oficial) | Origen de los pesos; el autor declara usarlos sin modificar el entrenamiento |
| Qwen-Image-2.1-Uncensored-GGUF, ficheros sin sufijo UC | ~7,1 B | GGUF (Q4_0 a Q8_0) | qwen-research | Mismo repositorio | Misma quantizacion, sin la etiqueta "uncensored" |
| Otras alternativas de difusion de tamano similar (FLUX.1, SD 3.5) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | No se aportan datos comparativos en esta busqueda |

No se dispone de datos verificados de rendimiento, contexto ni parametros de los modelos alternativos dentro de la informacion consultada, por lo que la comparacion se limita a aspectos de formato, licencia y procedencia.

## Limitaciones y advertencias
- Licencia qwen-research (declarada como `license: other`): los terminos exactos no se transcriben en la informacion disponible. Antes de cualquier uso comercial es imprescindible leer el texto completo de la licencia del modelo base, ya que las licencias de investigacion de la familia Qwen suelen restringir la explotacion comercial.
- La variante "uncensored" no documenta como se obtuvo ni que filtros se eliminaron. Esto implica riesgo de generar contenido inapropiado, ofensivo o ilegal segun la jurisdiccion, y traslada toda la responsabilidad de moderacion al usuario.
- No hay resultados de benchmarks publicados ni comparacion cifrada con el modelo base, por lo que se desconoce la degradacion de calidad introducida por cada cuantizacion.
- El repositorio registra 0 descargas y 0 likes: no existe validacion por parte de la comunidad, ni issues resueltos que permitan anticipar problemas de integracion.
- Discrepancia de rutas: el identificador del repositorio es `feeday/Qwen-Image-2.1-Uncensored-GGUF`, pero todos los enlaces de ficheros de la model card apuntan a `abenzerps/Qwen-Image-2.1-Uncensored-GGUF`. Los enlaces pueden estar rotos o corresponder a un espejo.
- La model card esta truncada en la seccion de memoria y rendimiento, de modo que las recomendaciones de despliegue estan incompletas.
- Dependencia de un fork concreto (leejet/ComfyUI-GGUF): con el fork alternativo mas extendido (city96) el modelo no carga sin parcheo manual.
- Idioma: no se documenta que idiomas soporta el pipeline; el rendimiento con prompts en castellano no esta verificado.
- Sesgos: no documentados en la informacion proporcionada. Al derivar de un modelo entrenado con datos web a gran escala, es esperable la reproduccion de sesgos de representacion, pero no hay evaluacion publicada al respecto.
- Riesgo de falta de fidelidad al prompt y de artefactos visuales: no hay datos publicados que permitan cuantificarlo en estas cuantizaciones.
- Consumo de disco y ancho de banda elevados: 83,6 GB de repositorio completo y 17,53 GB solo para el text encoder en BF16.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/feeday/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork requerido, leejet): https://github.com/leejet/ComfyUI-GGUF
- Plantilla oficial de flujo texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla oficial de flujo de edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Enlaces de ficheros citados en la model card (apuntan al usuario `abenzerps`): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos sin relacion con la ficha.
