# iurievichh/st-pete-door_style_LoRA

## Resumen

st-pete-door_style_LoRA es un adaptador LoRA para el modelo de difusion Stable Diffusion XL base 1.0, publicado por el usuario iurievichh en HuggingFace. Su proposito es especializar la generacion text-to-image en un dominio visual muy concreto: puertas de entrada del centro historico de San Petersburgo. Se trata, por tanto, de un modelo de nicho orientado a la generacion de imagenes con un estilo arquitectonico especifico, no de un modelo de lenguaje ni de un modelo generalista.

El adaptador se entreno mediante DreamBooth sobre SDXL base 1.0, con el text encoder desactivado (LoRA solo en el UNet) y utilizando el VAE `madebyollin/sdxl-vae-fp16-fix` durante el entrenamiento. La unica palabra de activacion documentada es la frase "a photo of an entrance door in Saint Petersburg historical center". El repositorio ocupa aproximadamente 0,1 GB y los pesos se distribuyen en formato Safetensors.

La relevancia de este modelo es limitada y muy acotada: resulta util para proyectos creativos, editoriales o de documentacion visual que necesiten generar variaciones coherentes de puertas historicistas de San Petersburgo. No cuenta con descargas significativas (6 en el momento de la consulta), no tiene likes y su model card esta generada automaticamente con secciones sin completar, lo que indica un nivel de documentacion bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de SDXL; text encoder sin LoRA |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SDXL tiene ~3.500 M en UNet y ~817 M en text encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos Safetensors; el modelo base admite fp16, fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (prompts en ingles por convencion de SDXL) |
| Licencia | openrail++ |
| Formato de pesos | Safetensors |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| VAE de entrenamiento | madebyollin/sdxl-vae-fp16-fix |
| Metodo de entrenamiento | DreamBooth |
| Palabra de activacion | "a photo of an entrance door in Saint Petersburg historical center" |
| Tamano del repositorio | ~0,1 GB |
| Libreria | diffusers |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Stable Diffusion XL, un modelo de difusion latente compuesto por un UNet, un text encoder dual (CLIP ViT-L y OpenCLIP ViT-bigG) y un VAE. Sobre el UNet se aplica una adaptacion LoRA de bajo rango entrenada con DreamBooth, una tecnica de fine-tuning personalizado que asocia un concepto o estilo concreto a una frase de activacion. En este caso, el LoRA del text encoder esta desactivado (`LoRA for the text encoder was enabled: False`), de modo que la especializacion recae unicamente en el UNet.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje ni la composicion del dataset. La model card indica explicitamente que los detalles de entrenamiento estan pendientes de documentar (`[TODO: describe the data used to train the model]`). Tampoco se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, algo por otra parte inusual en modelos de difusion. El VAE empleado durante el entrenamiento es la variante fp16-fix de madebyollin, habitual para evitar artefactos numericos en precision media.

## Capacidades

- Generacion de imagenes text-to-image condicionada por prompt, heredada de SDXL base 1.0.
- Especializacion en un dominio visual concreto: puertas de entrada del centro historico de San Petersburgo.
- Activacion mediante la frase "a photo of an entrance door in Saint Petersburg historical center".
- Compatible con el ecosistema diffusers (pipeline `StableDiffusionXLPipeline` con carga de adaptadores LoRA).
- Posibilidad de combinarse con otros LoRA de SDXL, siempre que se gestionen los pesos de adaptadores en el pipeline.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision, audio ni capacidades multimodales mas alla de la generacion de imagen.
- Capacidades multilingues de prompt: no documentadas; SDXL funciona principalmente con prompts en ingles.

## Casos de uso

- Documentacion visual de patrimonio arquitectonico: generar variaciones de puertas historicistas de San Petersburgo para ilustrar articulos, guias o catalogos, usando la frase de activacion para mantener coherencia estilistica.
- Ilustracion editorial y de ficcion ambientada en la Rusia imperial o en el centro historico de San Petersburgo: el LoRA aporta un estilo reconocible que un SDXL generico no reproduce con fidelidad.
- Concept art para videojuegos o producciones audiovisuales: generar paneles de referencia de fachadas y accesos con un estilo consistente para departamentos de arte.
- Prototipado rapido de assets para escenografia virtual: producir imagenes de puertas para entornos 3D o maquetas digitales antes de modelar en detalle.
- Experimentacion con DreamBooth y LoRA en SDXL: el adaptador sirve como ejemplo practico de fine-tuning de estilo sobre un concepto acotado, util para quienes investigan personalizacion de modelos de difusion.
- Generacion de datasets sinteticos de fachadas: crear conjuntos de imagenes etiquetadas de puertas de un estilo concreto para entrenar o evaluar clasificadores y detectores visuales.
- Pruebas de composicion de pipelines diffusers: validar la carga de adaptadores LoRA, el uso del VAE fp16-fix y la integracion con otros LoRA en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud perceptual) ni comparaciones con otros adaptadores. Tampoco se documentan curvas de entrenamiento pese a la etiqueta `tensorboard` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en si ocupa ~0,1 GB, pero requiere cargar SDXL base 1.0 completo. En fp16, SDXL necesita aproximadamente 8-10 GB de VRAM para inferencia en resolucion 1024x1024.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB).
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080, 4070 Ti Super y modelos con 12-16 GB o mas, especialmente con optimizaciones de memoria de diffusers.
- Opciones de despliegue: diffusers (pipeline nativo), ComfyUI, Automatic1111 / Forge, InvokeAI; tambien es posible exportar a otros formatos si la comunidad lo requiere.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran de la GPU, la resolucion y el numero de pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iurievichh/st-pete-door_style_LoRA | LoRA DreamBooth | SDXL base 1.0 | 1024x1024 (resolucion nativa SDXL) | openrail++ | HuggingFace, 6 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base completo | — | 1024x1024 | openrail++ | HuggingFace, ampliamente adoptado |
| Adaptadores LoRA de estilo arquitectonico en la comunidad SDXL | LoRA DreamBooth | SDXL base 1.0 | 1024x1024 | variable (openrail++ o CreativeML) | HuggingFace / Civitai, muy numerosos |

No se dispone de datos de rendimiento comparativo (FID, CLIP score) entre este adaptador y alternativas de la comunidad, por lo que la comparacion se limita a parametros estructurales y de licencia.

## Limitaciones y advertencias

- Documentacion incompleta: la model card contiene secciones marcadas como `[TODO]` y un ejemplo de codigo sin implementar; no hay guia de uso detallada.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre imagenes de un estilo arquitectonico concreto, puede reproducir sesgos de representacion del dataset original.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar elementos arquitectonicos plausibles pero inexistentes; no debe usarse como fuente documental sin verificacion.
- Limitaciones de dominio: el adaptador esta especializado en puertas de San Petersburgo; fuera de ese dominio su efecto sera marginal o contraproducente.
- Limitaciones de idioma: no se documenta soporte multilingue; los prompts en ingles son la convencion para SDXL.
- Restricciones de licencia: openrail++ permite uso comercial con condiciones (atribucion, restricciones sobre contenido ilegal o danino, obligaciones de compartir mejoras bajo ciertas circunstancias); conviene revisar los terminos completos antes de un despliegue en produccion.
- Caveat de produccion: con solo 6 descargas y sin validacion de la comunidad, la calidad y estabilidad del adaptador no estan contrastadas; se recomienda evaluacion propia antes de integrarlo en pipelines comerciales.
- Fecha de creacion inusual (2026-10-28 segun metadatos): conviene verificar la integridad del repositorio y la coherencia de los metadatos antes de confiar en ellos.

## Enlaces

- HuggingFace: https://huggingface.co/iurievichh/st-pete-door_style_LoRA
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE de entrenamiento: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Paper de DreamBooth: https://dreambooth.github.io/
- Documentacion de diffusers: https://huggingface.co/docs/diffusers
- Repositorio de diffusers: https://github.com/huggingface/diffusers
