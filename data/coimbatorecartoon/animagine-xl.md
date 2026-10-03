# Coimbatorecartoon/animagine-xl

## Resumen

Animagine XL es un modelo de difusion latente texto-a-imagen derivado de Stable Diffusion XL 1.0, ajustado para generar ilustraciones de estilo anime de alta resolucion a partir de prompts basados en etiquetas tipo Danbooru. El desarrollo original corre a cargo de Linaqruf, mientras que el repositorio Coimbatorecartoon/animagine-xl es una reproduccion alojada por un tercero, con cero descargas y cero likes en el momento de la consulta, y sin variaciones documentadas respecto al modelo original.

El ajuste fino se realizo con un learning rate de 4e-7 durante 27000 pasos globales y un batch size de 16, sobre un dataset curado de imagenes anime (Linaqruf/animagine-datasets). El entrenamiento se hizo a 1024x1024 con la herramienta de aspect ratio bucketing de NovelAI, lo que permite generar en resoluciones no cuadradas sin degradar la composicion.

Su relevancia practica es la de un generador especializado: frente a SDXL base, que tiende a producir resultados fotograficos, Animagine XL prioriza estetica anime y responde mejor a vocabulario de etiquetado (personaje, plano, iluminacion, calidad). El recuento de parametros en los pesos safetensors es de 2.567.463.684, correspondiente al modulo UNet de la arquitectura SDXL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (UNet) sobre SDXL 1.0, con doble text encoder CLIP y VAE |
| Parametros totales | 2.567.463.684 (pesos safetensors del repositorio, correspondientes al UNet) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; heredada de SDXL (limite de 77 tokens por text encoder) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors, sin variantes cuantizadas documentadas |
| Idiomas soportados | en (ingles; los prompts funcionan mejor en ingles con etiquetas Danbooru) |
| Licencia | openrail++ (CreativeML Open RAIL++-M) |
| Formato de pesos | safetensors; compatible con diffusers (StableDiffusionXLPipeline) |

Otros datos del repositorio: tamano de 27,8 GB, pipeline text-to-image, biblioteca diffusers, creado y actualizado el 2026-10-03.

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion XL 1.0: un modelo de difusion latente con un UNet de aproximadamente 2.600 millones de parametros, dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG) y un VAE que opera en el espacio latente. El ajuste se aplico sobre esta base con learning rate 4e-7, 27000 pasos globales y batch size 16. No se documenta en la informacion disponible si hubo etapas de RLHF, DPO ni tecnicas de decodificacion especulativa, algo poco habitual en modelos de difusion.

La innovacion practica esta en los datos y en el regimen de resolucion: el modelo se entreno a 1024x1024 usando el aspect ratio bucketing de NovelAI, lo que permite entrenar y generar a relaciones de aspecto no cuadradas. El dataset, Linaqruf/animagine-datasets, es una seleccion curada de imagenes anime de alta calidad. El resultado es un modelo que responde a vocabulario de etiquetado Danbooru y que reproduce el estilo anime con mayor fidelidad que SDXL base, aunque no introduce cambios arquitectonicos respecto al modelo del que deriva.

## Capacidades

- Generacion de imagenes texto-a-imagen en estilo anime a partir de prompts con etiquetas Danbooru (por ejemplo, `1girl`, `looking at viewer`, `upper body`, `outdoors`).
- Generacion a alta resolucion, con entrenamiento a 1024x1024 y soporte de relaciones de aspecto predefinidas: 768x1344 (9:16), 915x1144 (4:5), 1024x1024 (1:1), 1182x886 (4:3), 1254x836 (3:2), 1365x768 (16:9) y 1564x670 (21:9).
- Control de calidad mediante prompts negativos sugeridos (`lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry`) y prefijos de calidad (`masterpiece, best quality`).
- Estilizado de personajes y escenas anime; el modelo card incluye ejemplos tanto para `1girl` como para `1boy`.
- Integracion con pipelines de difusion estandar: diffusers (`StableDiffusionXLPipeline`), Stable Diffusion WebUI (AUTOMATIC1111), ComfyUI (recomendado por el autor) y Gradio/Colab.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modos de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Ilustracion de personajes originales: un estudio o ilustrador puede generar bocetos y variaciones de personajes anime con prompts de etiquetas, usando el aspecto 915x1144 o 1024x1024 para retratos y bustos.
- Arte conceptual para videojuegos o novelas visuales: generar assets de estilo consistente (fondos, retratos, escenas nocturnas) a partir de plantillas de prompt reutilizables, apoyandose en el aspect ratio widescreen 1365x768 o cinematic 1564x670.
- Prototipado rapido de keyframes en animacion: producir frames de referencia por composicion e iluminacion antes de pasar a produccion manual, con control de encuadre mediante etiquetas de plano (`upper body`, `full body`, `close-up`).
- Generacion de avatares y arte para redes o comunidades: pipelines automatizados que crean avatares anime a partir de unos pocos descriptores, con prompts negativos fijos para filtrar artefactos de calidad.
- Contenido para fan art y proyectos derivados: creacion de ilustraciones de personajes con vocabulario Danbooru, ampliamente extendido en la comunidad de arte anime, lo que reduce la curva de aprendizaje del prompt.
- Integracion en herramientas de escritorio y nodos de generacion: al ser un modelo SDXL estandar, se puede cargar en ComfyUI, WebUI o InvokeAI y encadenar con LoRAs, ControlNet o inpainting dentro del mismo grafo.
- Generacion por lotes en backend de difusion: uso con `StableDiffusionXLPipeline` en un servicio interno para producir variaciones masivas a partir de una plantilla de prompt (por ejemplo, catalogos de personajes o ilustraciones para un blog).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Inferencia en precision fp16: los pesos ocupan aproximadamente 6-7 GB, por lo que se recomienda un minimo de 8 GB de VRAM para 1024x1024.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090. En tarjetas de 6-8 GB puede requerir atencion eficiente en memoria (xFormers, SDPA) o reduccion de resolucion.
- GPU de datacenter: A100, H100 o L40S, adecuadas para generacion por lotes y despliegues concurrentes.
- En consumer GPU: si, cabe en la mayoria de GPU modernas con 8 GB o mas; con 6 GB conviene usar optimizaciones de memoria o resoluciones menores.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline`), ComfyUI (recomendado por el autor), Stable Diffusion WebUI (AUTOMATIC1111), InvokeAI y Gradio/Colab. No se documenta soporte especifico para vLLM, llama.cpp u Ollama, que no aplican a modelos de difusion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen de la GPU, la resolucion, el numero de pasos y el sampler.

## Comparativa con modelos similares

| Modelo | Base | Parametros (UNet) | Resolucion de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coimbatorecartoon/animagine-xl | SDXL 1.0 | 2.567.463.684 | 1024x1024 con aspect ratio bucketing | openrail++ | HuggingFace (repositorio con 0 descargas) |
| Linaqruf/animagine-xl | SDXL 1.0 | mismo modelo original | 1024x1024 con aspect ratio bucketing | openrail++ | HuggingFace (original) |
| stabilityai/stable-diffusion-xl-base-1.0 | SDXL 1.0 | ~2.600 millones | 1024x1024 | CreativeML Open RAIL++-M | HuggingFace |
| Modelos anime SDXL alternativos (por ejemplo, variantes de la familia Animagine o Pony Diffusion) | SDXL 1.0 | ~2.600 millones | 1024x1024 | habitualmente openrail++ o similar | HuggingFace |

Rendimiento comparado: no disponible. No se aportan metricas objetivas que permitan situar este modelo frente a SDXL base ni frente a otras alternativas de estilo anime.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset de imagenes anime, puede reproducir estereotipos de genero, cuerpo y representacion presentes en ese corpus; no se documentan auditorias de sesgo.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir anatomia incorrecta, manos deformes, texto ilegible o elementos incoherentes; el propio autor recomienda un prompt negativo extenso para mitigarlo.
- Dependencia del prompt: el modelo espera etiquetas tipo Danbooru y no lenguaje natural; con prompts conversacionales tiende a generar resultados de aspecto fotografico en lugar de anime.
- Limitaciones de idioma: solo se declara soporte para ingles; prompts en castellano o en otros idiomas pueden degradar el resultado.
- Licencia: CreativeML Open RAIL++-M, que impone restricciones de uso (incluidas limitaciones de uso comercial derivadas de la clausula de uso responsable). Conviene revisar el texto completo de la licencia antes de explotarlo en produccion.
- Repositorio de origen dudoso: Coimbatorecartoon/animagine-xl presenta cero descargas y cero likes y no documenta cambios respecto al modelo original; para uso serio es preferible referenciar el repositorio original de Linaqruf y verificar la integridad de los pesos.
- Fecha de creacion registrada: 2026-10-03, sin mas trazabilidad ni historial de versiones en la informacion disponible.
- Requisitos de resolucion: fuera de las resoluciones recomendadas el modelo puede producir duplicaciones de sujetos o composiciones degeneradas.
- No se documentan pesos cuantizados, versiones ONNX ni optimizaciones especificas, lo que puede complicar el despliegue en entornos de bajos recursos.

## Enlaces

- Repositorio en HuggingFace (copia): https://huggingface.co/Coimbatorecartoon/animagine-xl
- Repositorio original del autor: https://huggingface.co/Linaqruf/animagine-xl
- Pesos safetensors del modelo original: https://huggingface.co/Linaqruf/animagine-xl/resolve/main/animagine-xl.safetensors
- Dataset de entrenamiento: https://huggingface.co/datasets/Linaqruf/animagine-datasets
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Licencia CreativeML Open RAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-2/blob/main/LICENSE-MODEL
- Documentacion de diffusers: https://huggingface.co/docs/diffusers/index
- ComfyUI (recomendado por el autor): https://github.com/comfyanonymous/ComfyUI
- Stable Diffusion WebUI (AUTOMATIC1111): https://github.com/AUTOMATIC1111/stable-diffusion-webui
- Herramienta de aspect ratio bucketing de NovelAI: https://github.com/NovelAI/novelai-aspect-ratio-bucketing
- Perfil del desarrollador original: https://github.com/Linaqruf
- Imagenes de ejemplo: https://huggingface.co/Linaqruf/animagine-xl/tree/main/sample_images
