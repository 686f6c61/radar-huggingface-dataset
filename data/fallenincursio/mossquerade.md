# FallenIncursio/Mossquerade

## Resumen

Mossquerade v1 es un checkpoint de generacion de imagenes especializado en estilo anime, publicado por el creador FallenIncursio en HuggingFace en octubre de 2026. Se trata de un ajuste fino sobre MOSS-Image-SFT, el modelo base de difusion del equipo OpenMOSS, y se distribuye como repositorio compatible con la libreria diffusers, con un tamano total de 5,4 GB.

El propio autor define el estilo del modelo como "anime semipintado suave, con colores luminosos y acabado satinado", lo que lo situa en el nicho de checkpoints esteticos para ilustracion anime, un segmento muy activo en plataformas como Civitai, donde FallenIncursio acumula mas de 500 modelos publicados y unos 14.600 seguidores. Su interes radica en combinar una base entrenada por un equipo de investigacion (OpenMOSS) con un estilo concreto y diferenciado.

La model card es deliberadamente minimalista: no documenta arquitectura, numero de parametros ni datos de entrenamiento, y se limita a indicar la configuracion de inferencia recomendada (sampler Euler a, scheduler Moss, 30 pasos) junto con seis imagenes de muestra incluidas en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image (detalle no disponible) |
| Parametros totales | no disponible (repositorio de 5,4 GB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (terminos especificos no documentados en la model card) |
| Formato de pesos | no disponible (repositorio diffusers de 5,4 GB) |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT |
| Libreria | diffusers |
| Configuracion de inferencia recomendada | Sampler: Euler a; Scheduler: Moss; Steps: 30 |
| Fecha de publicacion | 24 de octubre de 2026 |

## Arquitectura y entrenamiento

Mossquerade es un finetune de MOSS-Image-SFT, el modelo de difusion de imagenes publicado por OpenMOSS Team. La model card no especifica si la arquitectura subyacente es un U-Net de difusion latente clasico o un modelo de difusion basado en transformer (DiT), ni el metodo de ajuste fino empleado (entrenamiento completo, LoRA fusionado u otro). El tamano del repositorio (5,4 GB) es compatible con un checkpoint completo en precision media, aunque el formato exacto de los pesos no esta documentado.

El proceso de entrenamiento tampoco se ha publicado: no se conocen el dataset utilizado, el numero de pasos de entrenamiento ni la resolucion de trabajo. El unico dato tecnico relevante es la configuracion de inferencia recomendada, que incluye un scheduler denominado "Moss"; esto indica que el modelo depende de un scheduler especifico del ecosistema MOSS integrado en diffusers, por lo que podria requerir una version concreta de la libreria o de la configuracion del pipeline para reproducir los resultados de las muestras oficiales.

## Capacidades

- Generacion de imagenes text-to-image en estilo anime semipintado, con colores luminosos y acabado satinado, segun las muestras incluidas en el repositorio.
- Compatibilidad con la libreria diffusers de HuggingFace.
- Configuracion de inferencia documentada por el autor: sampler Euler a, scheduler Moss y 30 pasos.
- No aplica: tool calling, function calling, agentes ni razonamiento multi-paso, al tratarse de un modelo generativo de imagenes y no de un LLM.
- Capacidades multilingues en los prompts: no documentadas.
- Compatibilidad con pipelines img2img, inpainting o ControlNet: no documentada en la model card.

## Casos de uso

- Ilustracion de novelas visuales y novelas ligeras: el estilo semipintado con acabado satinado es adecuado para generar ilustraciones de escena y retratos de personaje con una estetica coherente entre imagenes, usando prompts de personaje y composicion.
- Concept art y exploracion estetica: el enfoque en colores luminosos lo hace util como generador rapido de variaciones de color y ambiente durante fases de ideacion, antes de pasar a trabajo manual.
- Assets para juegos indie: generacion de retratos de personajes, ilustraciones de eventos y fondos en estilo anime para novelas visuales o juegos de cartas, donde el acabado pictorico suave encaja mejor que el estilo de captura de pantalla de otros checkpoints.
- Contenido para redes sociales y fan art: produccion de ilustraciones anime listas para publicar con un flujo simple de prompt mas la configuracion recomendada del autor.
- Generacion de datasets sinteticos para entrenar LoRAs: el checkpoint puede servir como base para producir imagenes de entrenamiento de estilos o personajes concretos, aprovechando la coherencia estetica del finetune.
- Avatares e ilustraciones para VTubers y creadores de contenido: creacion de arte de personaje y escenas para banners, fondos de stream y emotes en estilo anime.
- Estudio comparativo de estilos: util para investigadores y creadores de merges que quieran analizar como un finetune sobre MOSS-Image-SFT modifica la estetica respecto al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ademas, al tratarse de un modelo de difusion de imagenes, las metricas habituales de LLM (MMLU, HumanEval, GSM8K) no son aplicables; la evaluacion de este tipo de modelos suele ser cualitativa, mediante muestras visuales. En este caso, el repositorio incluye seis imagenes de preview (archivos Preview/1.png a Preview/6.png) como referencia del estilo resultante.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Dado el tamano del repositorio (5,4 GB), una estimacion razonable es un minimo de 8 GB de VRAM para inferencia basica en precision media, y 12 GB recomendados para trabajar con comodidad (resoluciones altas y VAE decode). Se trata de estimaciones, no de requisitos oficiales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 en consumo; en la nube, T4, L4 o A10G deberian ser suficientes para la configuracion de 30 pasos.
- Consumer GPUs: en principio si, cualquier GPU con 8 GB o mas de VRAM deberia ejecutar el modelo, aunque sin confirmacion oficial del autor.
- Despliegue: la via documentada es la libreria diffusers de HuggingFace. La compatibilidad con ComfyUI, Automatic1111 u otras interfaces no esta documentada. Ollama, vLLM y TGI no son aplicables, al ser herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles; dependeran de la resolucion, del numero de pasos (30 segun la configuracion recomendada) y de la GPU empleada.

## Comparativa con modelos similares

| Modelo | Base | Estilo | Tamano aprox. | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mossquerade v1 | MOSS-Image-SFT (OpenMOSS) | Anime semipintado, colores luminosos | 5,4 GB (repositorio) | other (sin detalle) | HuggingFace |
| Animagine XL 3.1 | SDXL 1.0 (~3,5B parametros) | Anime generalista | ~6,9 GB (fp16) | faipl-1.0 | HuggingFace, Civitai |
| Illustrious XL v1.0 | SDXL 1.0 (~3,5B parametros) | Anime, alta calidad de ilustracion | ~6,9 GB (fp16) | faipl-1.0-SD | HuggingFace, Civitai |

Mossquerade se diferencia de estas alternativas en su modelo base: mientras los checkpoints anime dominantes del ecosistema parten de SDXL 1.0, este finetune parte de MOSS-Image-SFT, lo que puede aportar una estetica distinta a cambio de un ecosistema de herramientas y LoRAs menos maduro. La documentacion de Mossquerade es notablemente mas limitada que la de sus alternativas.

## Limitaciones y advertencias

- Documentacion minima: la model card no incluye informacion sobre arquitectura, dataset de entrenamiento, metodo de ajuste fino ni resoluciones soportadas, lo que dificulta evaluar el modelo antes de probarlo.
- Sesgos: se heredan los del modelo base MOSS-Image-SFT y los del dataset de ajuste fino, no publicado. Los checkpoints de estilo anime suelen sobre-representar ciertas esteticas, demografias y composiciones recurrentes del genero.
- Errores tipicos de difusion: posibles fallos de anatomia (manos, extremidades), texto ilegible dentro de las imagenes y problemas de coherencia en escenas complejas o con multiples personajes.
- Licencia "other": los terminos concretos no estan detallados en la model card. Es imprescindible revisar la licencia completa antes de cualquier uso comercial o redistribucion.
- Dependencia del scheduler "Moss": la configuracion recomendada usa un scheduler propio del ecosistema MOSS; con otras combinaciones de sampler y scheduler los resultados pueden variar sustancialmente, y podria requerir una version concreta de diffusers.
- Adopcion inicial: en el momento de redaccion el modelo registra 0 descargas y 0 likes, por lo que carece de validacion comunitaria amplia y de prompts de referencia aportados por otros usuarios.
- Sin informacion sobre mecanismos de seguridad, filtros NSFW o políticas de uso incluidos en el pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FallenIncursio/Mossquerade
- Modelo base (OpenMOSS-Team/MOSS-Image-SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Perfil del autor en HuggingFace: https://huggingface.co/FallenIncursio
- Perfil del autor en Civitai: https://civitai.com/user/fallenincursio
- Indice de modelos del autor con hashes criptograficos: https://modelindex.dev/orgs/FallenIncursio
- Archivo de modelos del autor (CivArchive): https://civarchive.com/users/FallenIncursio?platform=civitai
