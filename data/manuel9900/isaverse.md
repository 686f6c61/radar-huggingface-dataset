# Manuel9900/isaverse

## Resumen

isaverse es un LoRA (Low-Rank Adaptation) de texto a imagen entrenado por el usuario Manuel9900 sobre Stable Diffusion XL 1.0 (SDXL). Su proposito es capturar la identidad visual de un sujeto concreto, denominado "Isa" mediante la palabra de activacion `ohwx woman`, de modo que el modelo base pueda generar representaciones coherentes de esa persona en estilos y escenarios arbitrarios (fotografia cinematografica, ilustracion de comic, caracterizaciones fantasia, etc.).

El modelo no es una red neuronal completa, sino un conjunto de pesos adaptadores de bajo rango que se cargan junto al checkpoint base `stabilityai/stable-diffusion-xl-base-1.0`. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un LoRA de SDXL (frente a los varios GB de un checkpoint completo). Se entreno con el cuaderno Kohya LoRA Trainer XL Colab, una herramienta de referencia en la comunidad para el ajuste fino de SDXL.

La relevancia de esta ficha es acotada: se trata de un adaptador personal de un autor individual, sin descargas ni interacciones en el momento de la consulta, y sin documentacion tecnica sobre el dataset de entrenamiento, el numero de pasos o los hiperparametros mas alla de la configuracion de inferencia recomendada. Resulta util como ejemplo de flujo de trabajo de personalizacion de SDXL y como recurso para quien quiera reproducir la metodologia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion XL 1.0 (UNet + doble text encoder CLIP) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SDXL 1.0 tiene 3.500 millones de parametros en la UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen; el prompt se tokeniza con CLIP, limite de 77 tokens por bloque) |
| Tipos de cuantizacion | no disponible de forma explicita; los LoRA de SDXL se usan habitualmente en fp16, bf16 y en pipelines cuantizados (fp8, GGUF para ComfyUI) |
| Idiomas soportados | no disponible (los prompts se procesan en el idioma que entienden los text encoders de CLIP, principalmente ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible de forma explicita; los LoRA de Kohya se distribuyen tipicamente en `.safetensors` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que inyecta matrices de bajo rango en las capas del UNet de SDXL 1.0. SDXL combina un UNet de aproximadamente 3.500 millones de parametros con dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG) y emplea una arquitectura de difusion latente con refinamiento opcional mediante un modelo de refiner. El LoRA modifica los pesos del UNet para asociar la palabra de activacion `ohwx woman` con los rasgos faciales y de identidad del sujeto de entrenamiento, sin alterar el resto de capacidades del modelo base.

El entrenamiento se realizo con el Kohya LoRA Trainer XL Colab sobre SDXL 1.0 base. No se especifican en la model card el numero de imagenes del dataset, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni la resolucion de entrenamiento. Tampoco se documenta el uso de regularizacion, tecnicas de aumento de datos ni procesos de RLHF o DPO, que no aplican a este tipo de adaptador. La unica innovacion tecnica reseñable es la propia metodologia LoRA, que permite personalizacion con un coste de almacenamiento muy bajo (0,1 GB) y sin reentrenar el modelo base.

## Capacidades

- Generacion de imagenes fotorrealistas del sujeto de identidad con la palabra de activacion `ohwx woman`; se recomienda anadir `glasses` para su apariencia habitual.
- Transferencia de estilo: funciona en estilos fotografico y de ilustracion (comic, halftone, lineas de tinta) ajustando el peso del LoRA entre 0,65 y 0,85 para estilos cartoon y entre 0,9 y 1,0 para fotografia.
- Composicion de escenas y caracterizaciones: los ejemplos de la model card incluyen una transformacion a personaje Na'vi de Pandora con piel azul, pecas bioluminiscentes y joyeria tribal.
- Control de encuadre: mejor rendimiento en planos medios y cercanos; en planos generales la cara ocupa pocos pixeles y la semejanza se degrada.
- Integracion con el ecosistema SDXL: admite ControlNet, IP-Adapter, img2img, inpainting y outpainting a traves del pipeline base.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es un modelo puramente generativo de imagen.
- Capacidades multilingues no documentadas; el prompt debe formularse preferentemente en ingles por las limitaciones de CLIP.

## Casos de uso

- Retratos de identidad consistentes: generar retratos del sujeto en distintos entornos y vestuarios manteniendo la semejanza facial, con peso de LoRA en 0,9-1,0 y CFG 7.
- Ilustracion editorial y comic: producir viñetas con el personaje en estilo comic book (lineas de tinta marcadas, tramado halftone) usando pesos de 0,65-0,85 y planos medios.
- Caracterizaciones tematicas: crear versiones del personaje en universos de fantasia o ciencia ficcion (por ejemplo, Na'vi) para proyectos creativos o cosplay de referencia.
- Storyboarding y previsualizacion: generar frames de referencia para cortometrajes o animaciones donde aparezca el personaje, aprovechando la coherencia de identidad entre imagenes.
- Prototipado de avatares: producir un banco de imagenes del sujeto para seleccionar un avatar de perfil o material promocional, iterando con img2img sobre las salidas.
- Pruebas de flujo de personalizacion: servir como caso de estudio reproducible del pipeline Kohya LoRA Trainer XL para quien quiera entrenar su propio adaptador de identidad sobre SDXL.
- Composicion con ControlNet: fijar la pose o la estructura de la escena con ControlNet y usar el LoRA para imponer la identidad del personaje en el resultado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud facial) ni comparaciones con otros LoRA de identidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste minimo sobre SDXL 1.0; en fp16 el pipeline completo requiere aproximadamente 8-10 GB de VRAM, y con el refiner activo se acerca a 12-16 GB. En fp8 o con optimizaciones de memoria puede bajar de 8 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) y H100 para lotes grandes o generacion de alta resolucion; RTX 3090 (24 GB) y RTX 4080 (16 GB) son suficientes para uso individual.
- GPU de consumo: cabe en tarjetas de 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) usando fp16 con atencion eficiente o cuantizacion; en 6 GB requiere offloading a CPU y la latencia se dispara.
- Opciones de despliegue: Diffusers (pipeline `StableDiffusionXLPipeline` con `load_lora_weights`), ComfyUI, Automatic1111/Forge, InvokeAI y Fooocus; tambien es posible exportar a GGUF para ComfyUI en equipos con poca VRAM.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la GPU, los pasos (24-30 recomendados) y la resolucion. Como referencia general de SDXL, una RTX 4090 genera una imagen de 1024x1024 en 24 pasos en torno a 2-4 segundos, pero este dato no procede de la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto/prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| isaverse (Manuel9900) | LoRA de identidad | SDXL 1.0 | Adaptador de bajo rango (repo 0,1 GB) | Prompt CLIP, 77 tokens por bloque | creativeml-openrail-m | Hugging Face, 0 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | Checkpoint texto a imagen | SDXL | 3.500 M (UNet) | Prompt CLIP, 77 tokens por bloque | creativeml-openrail-m | Hugging Face, ampliamente usado |
| Otros LoRA de identidad de SDXL (comunidad) | LoRA de identidad | SDXL 1.0 | Adaptador de bajo rango | Prompt CLIP, 77 tokens por bloque | variable (habitualmente creativeml-openrail-m) | Hugging Face, miles de adaptadores |
| FLUX.1-dev (Black Forest Labs) | Checkpoint texto a imagen | FLUX | 12.000 M | Prompt T5, hasta 512 tokens | licencia no comercial para dev | Hugging Face, muy popular |

La comparativa es cualitativa: no existen metricas publicadas para isaverse que permitan una comparacion cuantitativa con alternativas. Frente a un checkpoint completo, la ventaja del LoRA es el almacenamiento minimo y la composicion con otros adaptadores; la desventaja es que depende del modelo base y no mejora sus capacidades generales.

## Limitaciones y advertencias

- Sobreajuste de identidad: el LoRA esta entrenado sobre un unico sujeto; no generaliza a otras personas y puede degradar la diversidad de las caras generadas si se aplica con pesos altos.
- Perdida de semejanza en planos generales: la propia model card advierte que en planos amplios la cara ocupa pocos pixeles y la identidad no se conserva.
- Sesgos: al derivar de SDXL 1.0, hereda los sesgos de su dataset de entrenamiento en cuanto a genero, etnia, edad y representacion corporal; el sesgo adicional introducido por el dataset del LoRA no esta documentado.
- Alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (manos, dedos, ojos) y texto ilegible en la imagen; no es un modelo de conocimiento factual.
- Idiomas: no hay soporte multilingue documentado; los prompts en castellano pueden producir resultados menos fieles que en ingles por las limitaciones de los text encoders CLIP.
- Licencia: CreativeML Open RAIL-M permite uso comercial con restricciones de uso (prohibicion de usos ilicitos, dano, desinformacion y suplantacion), pero la licencia no aclara los derechos sobre la identidad representada; el uso comercial de la imagen de una persona real exige su consentimiento expreso.
- Caveat de produccion: el repositorio no documenta el origen de las imagenes de entrenamiento ni si existe consentimiento del sujeto; conviene verificar este extremo antes de cualquier uso publico.
- Madurez: 0 descargas y 0 interacciones en el momento de la consulta; no hay evidencia de comunidad ni de validacion externa.
- Fecha de creacion registrada: 2026-11-07, dato que conviene contrastar con la fecha real de publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Manuel9900/isaverse
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Cuaderno de entrenamiento Kohya LoRA Trainer XL Colab: https://colab.research.google.com/github/hollowstrawberry/kohya-colab/blob/main/Lora_Trainer_XL.ipynb
- Repositorio de referencia de Kohya (kohya-ss/sd-scripts): https://github.com/kohya-ss/sd-scripts
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
