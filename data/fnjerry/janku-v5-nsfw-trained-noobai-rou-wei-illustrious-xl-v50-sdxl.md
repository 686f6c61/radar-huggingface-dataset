# fnjerry/janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl

## Resumen

Janku v5 NSFW es un modelo de difusion texto-a-imagen derivado de Stable Diffusion XL, publicado por el usuario fnjerry en Hugging Face y creado originalmente por janxd en Civitai. Se trata de un merge (fusion de pesos) que combina tres lineas base: OnomaAIResearch/Illustrious-xl-early-release-v0, Laxhar/noobai-XL-1.1 y Minthy/RouWei-0.8, todos ellos modelos SDXL orientados a ilustracion de estilo anime. El resultado es un checkpoint especializado en generar personajes femeninos de estilo anime con acabado estilizado: ojos mas definidos, mayor brillo y contraste, iluminacion de sombras mejorada, colores mas saturados, lineas mas nitidas y detalles tipo particulas en pelo y ojos.

El modelo esta afinado adicionalmente sobre un dataset propio (el autor lo etiqueta como "trained") para reforzar contenido NSFW y estilos de personaje. No es un modelo de proposito general: su ambito es la generacion de ilustracion anime, con enfasis en retratos y figuras de cuerpo entero de personajes femeninos. La model card es extremadamente escueta y no aporta informacion sobre datos de entrenamiento, hiperparametros ni evaluaciones.

Su relevancia practica es limitada fuera del nicho de la ilustracion anime para adultos: no hay benchmarks publicados, no hay adopcion en la comunidad (0 descargas y 0 likes en el momento de la consulta) y la licencia FAIPL-1.0-SD impone restricciones que conviene revisar antes de cualquier uso. Aun asi, para flujos de trabajo de generacion de personajes anime con SDXL, el modelo es tecnicamente compatible con el ecosistema diffusers y con las herramientas habituales de SDXL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion model (UNet + VAE + text encoder), base SDXL |
| Parametros totales | no disponible (repo de 0.2 GB, pesos probablemente en precision fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (prompt de texto; limite practico de 77 tokens por bloque en CLIP, ampliable con tecnicas de prompt largo) |
| Tipos de cuantizacion | no disponible en la model card; al ser SDXL es compatible con fp16, fp32 y cuantizaciones de la comunidad (GGUF, fp8) mediante herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | faipl-1.0-sd (Fair AI Public License 1.0-SD) |
| Formato de pesos | safetensors; pipeline diffusers StableDiffusionXLPipeline |

## Arquitectura y entrenamiento

El modelo es un checkpoint SDXL, es decir, una red de difusion latente compuesta por una UNet con bloques de atencion, un VAE para codificar y decodificar imagenes y dos text encoders CLIP (uno de ellos OpenCLIP ViT-bigG). La resolucion nativa de SDXL es 1024x1024, con soporte de relaciones de aspecto habituales (832x1216, 1216x832, etc.). No hay innovaciones arquitectonicas propias: el modelo hereda la estructura estandar de SDXL.

El entrenamiento documentado se limita a indicar que es un merge de tres checkpoints (Illustrious XL early release, NoobAI-XL 1.1 y RouWei 0.8) con un afinado adicional sobre un dataset propio no especificado. La model card no indica numero de pasos, tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni hiperparametros de merge. No se dispone de informacion sobre el metodo de fusion (por ejemplo, weighted sum, block merge o model soup) ni sobre la proporcion de cada modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen en estilo anime/ilustracion, con resolucion nativa SDXL (1024x1024 y relaciones de aspecto equivalentes).
- Especializacion en personajes femeninos: retratos, figuras de cuerpo entero y composiciones con multiples personajes.
- Estilizacion marcada: ojos brillantes y detallados, pelo con brillo y particulas, lineas nitidas, colores saturados e iluminacion con sombras reforzadas.
- Soporte de prompts negativos, como es habitual en SDXL.
- Contenido NSFW explicito (la model card incluye la etiqueta not-for-all-audiences y hentai).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.
- Capacidades multilingues limitadas al ingles en los prompts.

## Casos de uso

- Ilustracion de personajes anime para proyectos personales: el modelo genera retratos y figuras completas con un acabado estilizado (ojos brillantes, pelo con particulas) que reduce el trabajo de postprocesado en comparacion con checkpoints SDXL genericos.
- Prototipado rapido de personajes para narrativa visual o juegos: al ser compatible con diffusers, se puede integrar en scripts de generacion por lotes para explorar variaciones de diseno de personaje antes de encargar el arte final.
- Generacion de key visuals y banners para proyectos de fan art: la mayor saturacion de color y el contraste reforzado producen imagenes llamativas a tamano de miniatura, utiles para portadas o cabeceras.
- Creacion de assets para comunidades de rol o novelas visuales: el modelo permite iterar sobre variaciones de un mismo personaje manteniendo el estilo mediante prompts descriptivos y, si se desea, tecnicas de consistencia como IP-Adapter o LoRA externos.
- Experimentacion con merges de modelos: para investigadores interesados en como la fusion de checkpoints (Illustrious, NoobAI, RouWei) afecta al estilo de salida, este checkpoint sirve como caso de estudio reproducible dentro del ecosistema SDXL.
- Contenido para adultos con control de acceso: en entornos con verificacion de edad y cumplimiento legal, el modelo puede emplearse para generar ilustracion NSFW de personajes ficticios, siempre que se respete la licencia y la legislacion aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6-8 GB para SDXL a 1024x1024, segun el backend y el uso de optimizaciones (attention slicing, VAE tiling).
- VRAM estimada en fp32: aproximadamente 12-16 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para generacion por lotes a gran escala.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti y superiores). En GPUs con 6 GB puede funcionar con cuantizacion y resoluciones reducidas.
- Opciones de despliegue: diffusers (StableDiffusionXLPipeline), ComfyUI, Automatic1111/Forge, InvokeAI, Fooocus y backends con soporte SDXL como TensorRT o ONNX Runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Janku v5 NSFW (este modelo) | no disponible (SDXL, repo 0.2 GB) | 1024x1024 nativo | faipl-1.0-sd | Hugging Face, Civitai |
| Laxhar/noobai-XL-1.1 | no disponible (SDXL) | 1024x1024 nativo | no disponible en la informacion proporcionada | Hugging Face |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | no disponible (SDXL) | 1024x1024 nativo | no disponible en la informacion proporcionada | Hugging Face |
| Minthy/RouWei-0.8 | no disponible (SDXL) | 1024x1024 nativo | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks, evaluaciones humanas) entre estos modelos en la informacion proporcionada. Los tres modelos base son los componentes directos de este merge, por lo que la comparativa se limita a la genealogia y no a metricas.

## Limitaciones y advertencias

- Modelo especializado en anime y contenido NSFW: no es adecuado para generacion fotorrealista ni para tareas generales de imagen.
- Riesgo de sesgos: al estar entrenado sobre datasets de anime con predominio de personajes femeninos, la representacion de genero, etnia y corporalidad es limitada y estereotipada.
- Alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (manos, extremidades), texto ilegible y artefactos en composiciones complejas.
- Idiomas: los prompts deben redactarse en ingles; el rendimiento con otros idiomas no esta documentado y probablemente sea deficiente.
- Licencia FAIPL-1.0-SD: es una licencia con restricciones especificas (uso comercial condicionado, obligaciones de atribucion y clausulas de uso responsable); es imprescindible revisar el texto completo en freedevproject.org antes de cualquier despliegue en produccion.
- Contenido para adultos: requiere verificacion de edad, cumplimiento de la legislacion local sobre contenido NSFW y politicas de las plataformas donde se publique.
- Sin adopcion ni validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes que respalden la calidad del checkpoint.
- Model card incompleta: no documenta el dataset de entrenamiento, los hiperparametros del merge ni el proceso de afinado, lo que dificulta la reproducibilidad.
- Fecha de creacion futura en los metadatos (2026-11-16): conviene verificar la integridad del repositorio antes de confiar en el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fnjerry/janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl
- Modelo original en Civitai: https://civitai.com/models/1277670/janku-v5-nsfw-trained-noobai-rouwei-illustrious-xl?modelVersionId=1896532
- Perfil del autor original (janxd): https://civitai.com/user/janxd
- Licencia FAIPL-1.0-SD: https://freedevproject.org/faipl-1.0-sd/
- Modelo base Illustrious XL: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Modelo base NoobAI-XL 1.1: https://huggingface.co/Laxhar/noobai-XL-1.1
- Modelo base RouWei 0.8: https://huggingface.co/Minthy/RouWei-0.8
