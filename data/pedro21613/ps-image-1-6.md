# Pedro21613/PS-IMAGE-1.6

## Resumen

PS-IMAGE-1.6 es un adaptador LoRA para el UNet de SDXL (Stable Diffusion XL) desarrollado por el usuario Pedro21613, presentado como evolucion de su version anterior PS-IMAGE-1.5. No se trata de un modelo de lenguaje ni de un modelo completo, sino de un ajuste fino ligero que se acopla sobre `stabilityai/stable-diffusion-xl-base-1.0` para mejorar el realismo fotografico en areas concretas y, sobre todo, la generacion de texto legible dentro de la imagen (rotulos, neon, posters, etiquetas y escaparates).

El problema que aborda es una de las limitaciones historicas de los modelos de difusion: la aparicion de letras deformadas o ilegibles en carteles y textos cortos. Para ello el autor entrena con imagenes sinteticas de rotulos y etiquetas con leyendas en cinco idiomas (EN/PT/ES/FR/DE), ademas de reforzar el realismo de coches (Stanford Cars) y de personas (FFHQ 1024px) y de mantener realismo general con Flickr30k filtrado.

La relevancia actual es limitada y de nicho: se publica como LoRA drop-in compatible con el codigo del 1.5, con un repositorio de apenas 0,2 GB, cero descargas y cero likes en el momento de la consulta, y sin licencia declarada. Es una experimentacion personal verificable (incluye checkpoints intermedios, comparativas A/B con las mismas semillas y log de progreso) mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre el UNet de SDXL; difusion latente text-to-image |
| Parametros totales | No disponible (pesos del adaptador LoRA; repositorio de 0,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como en un LLM; limitada por los text encoders de SDXL (heredada del modelo base) |
| Tipos de cuantizacion | No disponibles; pesos LoRA en safetensors (entrenamiento en fp16) |
| Idiomas soportados | No disponible; las leyendas de entrenamiento incluyen ingles, portugues, espanol, frances y aleman |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA para el UNet de SDXL) |

Modulos objetivo del LoRA: `to_q`, `to_k`, `to_v`, `to_out.0`, `ff.net.0.proj` y `ff.net.2` del UNet.

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 que se inyecta en las capas de atencion y en las capas feed-forward del UNet de SDXL. El entrenamiento se realiza por continuacion desde el LoRA de PS-IMAGE-1.5, de modo que es intercambiable (drop-in): el mismo codigo de inferencia funciona cambiando el identificador del repositorio. Los pesos se fusionan con `merge_and_unload()` sobre el UNet base.

El conjunto de entrenamiento combina cuatro fuentes: aproximadamente 800 imagenes de Stanford Cars con leyendas de clase (marca, modelo, ano) y atributos como "glossy paint, reflections"; unas 800 imagenes de FFHQ a 1024 px con leyendas centradas en piel, luz natural y lente; unas 520 imagenes sinteticas de placas, neon, posters, etiquetas y escaparates con texto corto y numeros y leyendas en cinco idiomas; y unas 500 imagenes de Flickr30k filtradas por resolucion con sus leyendas humanas originales. En total, del orden de 2600 muestras.

La configuracion de entrenamiento registrada es: 1047 pasos con batch efectivo de 8, resolucion de 768 px, latentes y embeddings precalculados, learning rate 4e-5 con scheduler cosine, min-SNR con gamma=5, optimizador AdamW, precision fp16 con GradScaler, gradient checkpointing y una Tesla T4 en Kaggle. El tiempo total fue de 158 minutos. La loss final reportada en la ventana aparece como `nan`, un dato que conviene tratar con cautela. Se conservan checkpoints por paso (`checkpoints/step_*`) y un archivo `status.json` con el progreso.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts, con resolucion de trabajo de 768 px y refino posterior hasta 1152 px.
- Realismo fotografico de vehiculos, apoyado en el dataset Stanford Cars con leyendas de marca, modelo y ano.
- Realismo de retratos y personas, con especial atencion a la textura de piel, la iluminacion natural y el efecto de lente.
- Renderizado de texto corto y numeros en imagen: rotulos de tienda, letras de neon, posters, etiquetas y escaparates.
- Cobertura multilingue en las leyendas de entrenamiento (ingles, portugues, espanol, frances y aleman), sin garantia de calidad homogenea.
- Edicion y transformacion de imagen mediante un flujo separado (notebook "PS Image 1.6 Edicao"): img2img, inpainting por mascara, ControlNet (canny, depth, pose), IP-Adapter para imagen de referencia y refino de 768 a 1152.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, pensamiento explicito, audio ni comprension multimodal de entrada: es un modelo de generacion de imagen y no un LLM.

## Casos de uso

- Rotulistica y carteleria comercial: generar escaparates o carteles con nombres y numeros legibles (por ejemplo, el propio autor usa el prompt `storefront sign that says "PADARIA 123"`), aprovechando el entrenamiento especifico con texto sintetico.
- Fotografia de producto de automocion: crear imagenes de vehiculos con acabado brillante y reflejos para catalogos o material promocional, gracias al ajuste con Stanford Cars.
- Retratos sinteticos y avatares: generar personas con aspecto fotografico para prototipos de aplicacion, partiendo del ajuste con FFHQ a 1024 px.
- Diseno grafico y maquetas de marca: producir posters, etiquetas y letreros de neon con texto corto legible para validar conceptos antes de la produccion final.
- Edicion y retoque de fotografias existentes: usar el flujo img2img o inpainting por mascara para sustituir elementos o texto sin rehacer la imagen completa.
- Packaging y etiquetado de producto: generar envases con etiquetas y numeros legibles para presentaciones o pruebas de concepto.
- Generacion de datos sinteticos con texto: crear pares imagen-texto de rotulos y placas que sirvan para aumentar datasets de OCR o de deteccion de texto, dado el control sobre el contenido textual de las leyendas.
- Refinado de bocetos o composiciones: emplear ControlNet (canny, depth, pose) para respetar la estructura de una imagen de referencia y aplicar despues el refino a 1152 px.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente aporta una comparacion A/B cualitativa entre PS-IMAGE-1.5 (`exemplos_15/`) y PS-IMAGE-1.6 (`exemplos_16/`) usando los mismos prompts y las mismas semillas, sin metricas cuantitativas (FID, CLIP score ni similares).

## Requisitos de hardware

- Entrenamiento: se realizo en una Tesla T4 de 16 GB en Kaggle, con gradient checkpointing y latentes precalculados.
- Inferencia: el adaptador LoRA pesa 0,2 GB, pero requiere cargar el UNet y los text encoders completos de SDXL. Se recomienda una GPU con al menos 8-12 GB de VRAM en fp16 a 768 px; el propio codigo de ejemplo activa `vae.enable_slicing()` para reducir el consumo de memoria.
- GPU de consumo: es viable en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y ajustado en GPUs de 8 GB con VAE slicing y menor resolucion. Las estimaciones de VRAM deben considerarse orientativas al no estar publicadas por el autor.
- Despliegue: el flujo de referencia usa `diffusers` con `StableDiffusionXLPipeline`, `DPMSolverMultistepScheduler` (Karras sigmas, dpmsolver++) y `peft` para cargar el LoRA. Tambien puede integrarse en interfaces como ComfyUI o Automatic1111 cargandolo como LoRA estandar de SDXL.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia.
- Ajustes recomendados en el codigo de ejemplo: `num_inference_steps=24`, `guidance_scale=6.5`, `height=768`, `width=768`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|---|
| PS-IMAGE-1.6 | LoRA sobre UNet de SDXL | No disponible (repo de 0,2 GB) | Limitado por los text encoders de SDXL | No disponible | HuggingFace, 0 descargas | Sin datos de benchmark |
| PS-IMAGE-1.5 | LoRA sobre UNet de SDXL | No disponible | Igual que 1.6 | No disponible | HuggingFace (version previa) | Base de la que parte 1.6; comparacion A/B cualitativa favorable a 1.6 |
| stable-diffusion-xl-base-1.0 | Modelo completo de difusion SDXL | No disponible en esta informacion | Limitado por sus text encoders | OpenRAIL++ (segun el modelo base) | HuggingFace, ampliamente usado | Sin datos de benchmark aportados por el autor |

No se dispone de comparativas cuantitativas frente a otros modelos de generacion de imagen con especialidad en texto (por ejemplo alternativas de la familia SD 3.5 o FLUX.1) en la informacion proporcionada.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda en un estado juridico indeterminado y no se recomienda en produccion sin aclararlo antes.
- El autor reporta que la loss final en la ventana es `nan`, lo que sugiere posibles inestabilidades numericas durante el entrenamiento y aconseja validar la calidad real de los pesos.
- Zero descargas y cero likes en el momento de la consulta: no existe validacion externa de la comunidad ni evaluaciones independientes.
- Ausencia total de benchmarks cuantitativos; solo hay comparativas visuales A/B seleccionadas por el propio autor.
- Los metadatos indican una fecha de creacion de 2026-10-12, posterior a la fecha habitual de consulta, lo que puede indicar una inconsistencia en el registro del repositorio.
- Riesgo de alucinacion grafica: como todo modelo de difusion, puede generar texto deformado, letras falsas o incoherencias en detalles finos, especialmente en cadenas de texto largas.
- El realismo de personas entrenado con FFHQ hereda los sesgos demograficos de ese dataset, con posible sobrerrepresentacion de determinados rasgos y edades.
- El dataset Stanford Cars y Flickr30k introducen sesgos de composicion, iluminacion y contexto geografico y cultural.
- SDXL no dispone de entrada de imagen nativa: la funcionalidad de edicion ("vision") no forma parte del LoRA y depende de flujos externos (ControlNet, IP-Adapter, inpainting) documentados por separado.
- Limitacion de idioma: aunque las leyendas se escribieron en cinco idiomas, no hay garantia de rendimiento equivalente en todos ellos ni de comprension de prompts fuera de ese conjunto.
- La longitud de prompt esta acotada por los text encoders de SDXL, lo que restringe la cantidad de detalle textual que se puede especificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pedro21613/PS-IMAGE-1.6
- Version anterior PS-IMAGE-1.5: https://huggingface.co/Pedro21613/PS-IMAGE-1.5
- Modelo base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
