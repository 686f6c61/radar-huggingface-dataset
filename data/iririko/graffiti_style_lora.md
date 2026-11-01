# iririko/GRAFFITI_style_LoRA

## Resumen

GRAFFITI_style_LoRA es un adaptador LoRA de bajo rango entrenado mediante DreamBooth sobre Stable Diffusion XL Base 1.0 (stabilityai/stable-diffusion-xl-base-1.0). Lo publica el usuario iririko en HuggingFace y su funcion es inyectar un estilo visual concreto, descrito por el autor como "3d render in GRAFFITI style", en el proceso de generacion texto-a-imagen del modelo base. No es un modelo autonomo: requiere cargar SDXL Base 1.0 y aplicar los pesos del adaptador encima.

El adaptador se distribuye en formato Safetensors y se integra a traves de la libreria diffusers. La model card indica que el LoRA del text encoder esta desactivado, por lo que el entrenamiento se limita a las capas de atencion del UNet de SDXL. El VAE empleado durante el entrenamiento fue madebyollin/sdxl-vae-fp16-fix, una variante en fp16 que evita desbordamientos numericos en precision media.

La relevancia de esta ficha es acotada: se trata de un adaptador de estilo de nicho, con cero descargas y cero likes en el momento de la consulta, creado en octubre de 2026. La model card es practicamente la plantilla autogenerada por el script de entrenamiento, con secciones marcadas como TODO y sin datos de dataset, hiperparametros ni evaluacion. Cualquier uso en produccion exige validacion propia del estilo y de la calidad de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre UNet de SDXL; text encoder sin adaptar |
| Parametros totales | no disponible (pesos del adaptador; el modelo base SDXL ronda los 2.600 M en UNet y 817 M en text encoder dual) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen; el prompt se tokeniza hasta 77 tokens por encoder, ampliable con tecnicas de prompt weighting) |
| Tipos de cuantizacion | no especificado por el autor; al ser Safetensors fp16/fp32 puede combinarse con cuantizaciones del modelo base (fp16, bf16, fp8) segun el runtime |
| Idiomas soportados | no disponibles (el prompt trigger esta en ingles) |
| Licencia | openrail++ |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth aplicado sobre Stable Diffusion XL Base 1.0. SDXL es un modelo de difusion latente con un UNet de aproximadamente 2.600 millones de parametros y un text encoder dual (CLIP ViT-L y OpenCLIP ViT-bigG). El LoRA se inserta en las capas de atencion del UNet; la model card especifica explicitamente que el LoRA del text encoder esta desactivado ("LoRA for the text encoder was enabled: False"), de modo que el condicionamiento textual no se modifica y el estilo se aprende exclusivamente en el denoising del UNet.

El entrenamiento se realizo con DreamBooth, la tecnica de ajuste con pocas imagenes de un sujeto o estilo y un prompt trigger. El VAE usado durante el entrenamiento fue madebyollin/sdxl-vae-fp16-fix, que corrige los problemas de NaN del VAE original de SDXL en fp16. La model card no documenta el numero de imagenes, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni la composicion del dataset: la seccion de detalles de entrenamiento esta marcada como TODO. Tampoco se indica si hubo regularizacion por clase, aumento de datos o validacion cruzada del estilo.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el prompt trigger "3d render in GRAFFITI style".
- Transferencia de estilo visual: aplica una estetica de graffiti con acabado de render 3D sobre las descripciones del prompt.
- Composicion con el modelo base SDXL: hereda las capacidades de SDXL (resoluciones nativas de 1024x1024, aspect ratios multiples, negative prompts, CFG, img2img e inpainting si el pipeline lo soporta).
- Compatibilidad con pipelines de diffusers: se carga como adaptador LoRA sobre StableDiffusionXLPipeline.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo generativo de imagen, no un LLM.
- Capacidades multilingues: no documentadas; el trigger y la model card estan en ingles.
- No dispone de modo thinking, vision de entrada, audio ni otras capacidades multimodales mas alla de la generacion de imagen.

## Casos de uso

- Generacion de arte urbano conceptual: usar el trigger "3d render in GRAFFITI style" junto con descripciones de escenas para producir ilustraciones con estetica de graffiti 3D, util en moodboards y exploracion visual temprana.
- Prototipado de portadas y carteles: generar variantes de una composicion con el estilo aplicado y seleccionar las mejores para retoque posterior en herramientas de diseno grafico.
- Contenido para redes sociales de tematica urbana: producir imagenes de forma por lotes con el pipeline de diffusers, controlando seed y CFG para mantener coherencia entre publicaciones.
- Exploracion de estilo para proyectos de videojuegos o animacion: generar referencias visuales de entornos o personajes con acabado graffiti 3D antes de encargar el trabajo final a un artista.
- Pruebas de concepto en investigacion de personalizacion: servir como ejemplo de LoRA de estilo entrenado con DreamBooth para comparar tecnicas de adaptacion de bajo rango en SDXL.
- Integracion en flujos de img2img: aplicar el estilo sobre bocetos o fotografias existentes para convertirlos en renders con estetica graffiti, siempre que el pipeline cargue el adaptador y respete el trigger.
- Generacion de material para impresion de pequeno formato: producir ilustraciones a 1024x1024 y reescalar con upscalers externos para usos de baja tirada, previa revision de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluacion humana) ni comparaciones con otros LoRA de estilo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA anade un coste marginal sobre SDXL Base 1.0. Con el modelo base en fp16 se requieren aproximadamente 10-12 GB de VRAM para generar a 1024x1024; con cuantizacion del base a fp8 o con offloading secuencial puede bajar a 6-8 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para lotes grandes y alta concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia comoda a 1024x1024; RTX 4080 (16 GB) y RTX 4070 Ti (12 GB) para generacion individual.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 12 GB con fp16 y atencion eficiente; en GPUs de 8 GB requiere offloading o cuantizacion del base.
- Opciones de despliegue: diffusers con StableDiffusionXLPipeline y load_lora_weights; ComfyUI y Automatic1111/Forge mediante carga de LoRA; vLLM y TGI no aplican (no son runtimes de difusion); llama.cpp y Ollama no aplican.
- Latencia y throughput: no disponibles. Dependen del modelo base, la GPU y el scheduler; en una RTX 4090 con 30 pasos y scheduler Euler a 1024x1024 se situa tipicamente en el rango de 1-2 segundos por imagen, pero no hay medicion publicada para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| iririko/GRAFFITI_style_LoRA | LoRA de estilo | SDXL Base 1.0 | no disponible | no aplica | openrail++ | HuggingFace, 0 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base texto-a-imagen | propio | ~3.500 M (UNet + text encoders) | no aplica | openrail++ | HuggingFace, ampliamente usado |
| madebyollin/sdxl-vae-fp16-fix | VAE auxiliar | SDXL | ~84 M | no aplica | openrail++ | HuggingFace |
| LoRA de estilo genericos sobre SDXL (p. ej. adaptadores de estilo publicos) | LoRA de estilo | SDXL Base 1.0 | variable | no aplica | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo entre este adaptador y otros LoRA de estilo, por lo que la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada por el script de entrenamiento: las secciones de uso, sesgos y detalles de entrenamiento estan sin completar (TODO), lo que impide auditar el dataset y el proceso.
- No hay datos publicados sobre sesgos del estilo ni sobre el contenido del dataset de entrenamiento; existe riesgo de reproducir sesgos visuales o culturales presentes en las imagenes usadas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible y artefactos, especialmente fuera de la resolucion nativa de 1024x1024.
- El estilo depende del prompt trigger exacto "3d render in GRAFFITI style"; sin el, el efecto puede ser debil o inexistente.
- Al no haberse entrenado el text encoder, la fidelidad al prompt depende del modelo base y no del adaptador.
- Licencia openrail++: permite uso comercial con condiciones (entre ellas, obligaciones de atribucion y restricciones sobre usos daninos y sobre el contenido generado en determinados contextos); conviene revisar el texto completo antes de desplegar en produccion.
- Con 0 descargas y 0 likes, no hay evidencia de uso comunitario ni validacion externa de calidad; se recomienda evaluacion propia antes de integrarlo en cualquier flujo.
- Fecha de creacion y actualizacion en octubre de 2026, posteriores a la mayoria de versiones de SDXL y de sus ecosistemas; verificar compatibilidad con la version de diffusers instalada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iririko/GRAFFITI_style_LoRA
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE usado en entrenamiento: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Paper de DreamBooth: https://dreambooth.github.io/
- Documentacion de diffusers para LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- Repositorio de diffusers: https://github.com/huggingface/diffusers
