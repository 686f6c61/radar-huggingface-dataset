# ivantostand/one-obsession-branch-v4-mature-sdxl

## Resumen

One Obsession Branch v4 Mature SDXL es un modelo de difusion texto-a-imagen derivado de Stable Diffusion XL, publicado por el usuario ivantostand en Hugging Face y creado originalmente por maxfeifei8 en Civitai. Se trata de un merge (fusion de pesos) que combina tres modelos base de la familia SDXL orientados a ilustracion anime: Illustrious-XL-v2.0 de OnomaAIResearch, NoobAI-XL-1.1 de Laxhar y RouWei-0.8 de Minthy. El resultado es un checkpoint especializado en ilustracion de personajes con enfasis declarado en manos, pies, iluminacion, sombras, texturas y fondos.

El modelo resuelve el problema tipico de los merges de la comunidad: mejorar rasgos anatomicos y calidad de render sobre los checkpoints base sin necesidad de reentrenar. Al estar construido sobre Illustrious y NoobAI, hereda el vocabulario de etiquetas estilo Danbooru y la capacidad de generar ilustraciones con composicion compleja, ahora reforzada en detalles que suelen fallar en SDXL vanilla.

Es relevante para quien trabaja con pipelines de generacion de imagen autoalojados y busca un checkpoint SDXL listo para diffusers con etiquetado maduro explicito. El repositorio ocupa 6,9 GB con pesos en safetensors (2.567.463.684 parametros, formato UNet SDXL mas text encoders), licencia FAIPL-1.0-SD y soporte declarado solo en ingles. No hay descargas ni likes registrados en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (UNet latente + dual text encoder CLIP, VAE) |
| Parametros totales | 2.567.463.684 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto; SDXL usa 77 tokens por encoder, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de precision completa; no se documentan variantes fp16/GGUF) |
| Idiomas soportados | en |
| Licencia | faipl-1.0-sd (Fair AI Public License 1.0-SD) |
| Formato de pesos | safetensors (libreria diffusers, clase StableDiffusionXLPipeline) |

## Arquitectura y entrenamiento

La arquitectura es la de SDXL: un UNet de difusion latente con atencion cruzada hacia dos text encoders CLIP (uno de ellos OpenCLIP ViT-bigG), un VAE para codificar y decodificar imagenes y un scheduler de ruido configurable. El modelo no se ha entrenado desde cero: es un merge de pesos de Illustrious-XL-v2.0, NoobAI-XL-1.1 y RouWei-0.8, los tres checkpoints SDXL de ilustracion anime. La model card no documenta la receta de fusion (ratios por bloque, metodo de interpolacion, si hubo fine-tuning posterior), el numero de tokens de entrenamiento ni el dataset utilizado.

No se declara uso de RLHF, DPO ni tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal; el interes del autor se centra en los tags de capacidades: manos, pies, luz, sombra, textura y fondo. Al ser un merge, las mejoras provienen de la combinacion de distribuciones aprendidas por los modelos base, no de un proceso de entrenamiento nuevo verificable.

## Capacidades

- Generacion de imagenes texto-a-imagen con pipeline `StableDiffusionXLPipeline` de diffusers.
- Ilustracion estilo anime y personajes, con etiquetado tipo Danbooru heredado de Illustrious y NoobAI.
- Render de manos y pies con enfasis declarado por el autor (tags `hands`, `feet`).
- Control de iluminacion y sombras (`light`, `shadow`) y texturas (`texture`).
- Generacion de fondos y composiciones de escena (`background`).
- Contenido para adultos (`not-for-all-audiences`, `mature`), con etiquetas de genero y personajes.
- Soporte de prompts negativos, CFG, schedulers y control de semilla propios de SDXL.
- Capacidades de inpainting, img2img y ControlNet no confirmadas en la model card; dependen de la compatibilidad con el ecosistema SDXL.
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni audio.

## Casos de uso

- Ilustracion de personajes para proyectos de ficcion: el modelo genera retratos y figuras completas con etiquetas Danbooru, adecuado para concept art y storyboards donde se necesita variedad rapida de poses y expresiones.
- Correccion de anatomia en flujos de produccion: el enfasis en manos y pies permite usarlo como checkpoint principal o como paso de refinado en img2img para reducir artefactos tipicos de SDXL en extremidades.
- Composicion de escenas con iluminacion controlada: los tags de luz y sombra permiten iterar sobre atmósferas (interior, contraluz, hora dorada) mediante prompts, util para ilustracion editorial y portadas.
- Generacion de fondos y texturas: el tag `background` y `texture` lo orientan a producir entornos y materiales reutilizables en matte painting o assets de videojuego.
- Prototipado de contenido para adultos con control de estilo: al ser un modelo `mature`, sirve para pipelines privados de ilustracion adulta donde se requiere consistencia de personaje y anatomia, siempre bajo la licencia FAIPL-1.0-SD.
- Experimentacion con merges en investigacion de difusion: sirve como caso de estudio de como la interpolacion de checkpoints SDXL afecta a rasgos concretos (anatomia, iluminacion) sin reentrenamiento.
- Generacion por lotes en local: con 6,9 GB de pesos y formato diffusers, se integra en scripts Python de generacion masiva con seeds fijas para catalogos de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en fp16, el UNet SDXL mas los text encoders y el VAE ocupan aproximadamente 6-7 GB de pesos; la inferencia completa suele requerir entre 8 y 12 GB de VRAM segun resolucion y batch. Con cuantizacion a fp8 o mediante `enable_model_cpu_offload` puede reducirse por debajo de 8 GB, aunque estas variantes no estan documentadas en la model card.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para batches grandes y alta resolucion; RTX 4090 (24 GB) para inferencia comoda a 1024x1024; RTX 3090 (24 GB) equivalente.
- Consumer GPU: cabe en RTX 4090, 3090, 4080 (16 GB) y 4070 Ti Super (16 GB) con fp16. En GPUs de 8 GB (RTX 3060 Ti, 4060) es posible con offload a CPU y batches de 1, a costa de latencia.
- Despliegue: diffusers (`StableDiffusionXLPipeline`), Automatic1111/Forge, ComfyUI, InvokeAI y Fooocus mediante carga de checkpoint SDXL. vLLM, TGI, llama.cpp y Ollama no aplican a modelos de difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de GPU, scheduler, pasos y resolucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/prompt | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| One Obsession Branch v4 Mature SDXL | 2.567.463.684 | no disponible | Merge anime/maduro sobre Illustrious, NoobAI y RouWei | faipl-1.0-sd | Hugging Face, Civitai |
| Illustrious-XL-v2.0 (OnomaAIResearch) | no disponible en la informacion | no disponible | SDXL anime/base para ilustracion | no disponible en la informacion | Hugging Face |
| NoobAI-XL-1.1 (Laxhar) | no disponible en la informacion | no disponible | SDXL anime con etiquetado Danbooru/e621 | no disponible en la informacion | Hugging Face |
| RouWei-0.8 (Minthy) | no disponible en la informacion | no disponible | SDXL anime, merge de la comunidad | no disponible en la informacion | Hugging Face |

Los tres modelos base son los componentes directos del merge; sus parametros y licencias no se detallan en la informacion proporcionada. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado `not-for-all-audiences` y `mature`; no es apto para productos dirigidos a menores ni para plataformas con politicas de contenido restrictivas.
- Licencia FAIPL-1.0-SD: impone condiciones especificas para uso comercial y para el tratamiento de contenido generado; es responsabilidad del integrador revisar el texto completo antes de desplegar en produccion.
- Solo idioma ingles declarado: los prompts en castellano pueden degradar la calidad; se recomienda traducir o usar etiquetas Danbooru en ingles.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible y artefactos, especialmente en manos y pies pese al enfasis del autor.
- Sesgos: al derivar de datasets de ilustracion anime con etiquetado Danbooru, hereda sesgos de representacion de genero, etnia y cuerpo, ademas de posibles sesgos de estilo.
- Sin receta de merge documentada: no se puede auditar la composicion exacta de pesos ni reproducir el proceso; dificulta el analisis de procedencia.
- Cero adopcion registrada: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de comunidad ni de validacion externa.
- Compatibilidad de ecosistema no confirmada: inpainting, ControlNet, LoRA y IP-Adapter no se documentan; deben probarse caso por caso.
- Sin benchmarks: no hay metricas objetivas de calidad (FID, CLIP score) ni comparativas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivantostand/one-obsession-branch-v4-mature-sdxl
- Modelo original en Civitai: https://civitai.com/models/1368727/one-obsession-branchmaturenoobaivpred?modelVersionId=1872530
- Perfil del creador original en Civitai: https://civitai.com/user/maxfeifei8
- Licencia FAIPL-1.0-SD: https://freedevproject.org/faipl-1.0-sd/
- Modelo base Illustrious-XL-v2.0: https://huggingface.co/OnomaAIResearch/Illustrious-XL-v2.0
- Modelo base NoobAI-XL-1.1: https://huggingface.co/Laxhar/noobai-XL-1.1
- Modelo base RouWei-0.8: https://huggingface.co/Minthy/RouWei-0.8
