# Pedro21613/PS-IMAGE-1.1

## Resumen

PS-IMAGE-1.1 es un adaptador LoRA de rango 8 entrenado sobre el UNet de Stable Diffusion 1.5 (`runwayml/stable-diffusion-v1-5`) para la generacion de imagenes fotorrealistas de perros y gatos de 37 razas concretas. Lo publica el usuario Pedro21613 en Hugging Face y sustituye al PS IMAGE 1.0, que era un clasificador MobileNetV2 sobre CIFAR-10; la version 1.1 cambia por completo de tarea, pasando de clasificacion a generacion de imagen texto-a-imagen en 512x512 px.

Tecnicamente es un adaptador PEFT muy ligero: aproximadamente 1,6 millones de parametros entrenables y unos 6,2 MB en `adapter_model.safetensors`, mas un `adapter_config.json`. Se entreno durante 1800 pasos con batch efectivo 4, learning rate 1e-4 con scheduler coseno, precision fp16 y gradient checkpointing sobre una GPU Tesla T4, usando el dataset publico Oxford-IIIT Pet (3680 imagenes de alta resolucion, 37 razas de gato y perro).

Su relevancia es limitada y muy de nicho: no es un modelo fundacional ni compite con SDXL o los modelos de difusion actuales, sino un ejemplo reproducible de fine-tuning LoRA de bajo coste para un dominio cerrado (mascotas) sobre una base de 2022. A fecha de la informacion disponible acumula 0 descargas y 0 likes, y el repositorio figura con un tamano de 0,0 GB pese a declarar un adaptador de 6,2 MB, lo que sugiere que los pesos pueden no estar efectivamente subidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8) sobre el UNet de Stable Diffusion 1.5; difusion latente con U-Net y atencion cruzada sobre text encoder CLIP |
| Parametros totales | ~1,6 millones de parametros entrenables en el LoRA (~6,2 MB); parametros del modelo base no disponibles en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion); resolucion nativa de generacion 512x512 px |
| Tipos de cuantizacion | No disponible; el adaptador se entreno en fp16 y se distribuye en safetensors |
| Idiomas soportados | No disponible; los prompts de entrenamiento estan en ingles (`a photo of a {Breed} {cat/dog}, high quality, detailed fur, sharp`) |
| Licencia | No disponible en el repositorio; el modelo base `runwayml/stable-diffusion-v1-5` usa CreativeML Open RAIL-M |
| Formato de pesos | safetensors (PEFT LoRA: `adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El modelo no es una red completa, sino un adaptador de bajo rango (LoRA rank 8) insertado en las capas del UNet de Stable Diffusion 1.5. La generacion sigue el esquema clasico de difusion latente en 512x512 px: el texto se codifica con el text encoder de CLIP, el UNet predice el ruido en el espacio latente del VAE, y el VAE decodifica la imagen final. Al ser un LoRA, la inferencia requiere cargar la base SD1.5 y fusionar el adaptador sobre el UNet (`merge_and_unload`), lo que implica que el coste computacional y de memoria es practicamente identico al de la base.

El entrenamiento se realizo sobre el dataset publico Oxford-IIIT Pet (3680 imagenes, 37 razas de gato y perro), con prompts plantilla del tipo `a photo of a {Breed} {cat/dog}, high quality, detailed fur, sharp`. La configuracion declarada es de 1800 pasos, batch efectivo 4, learning rate 1e-4 con decaimiento coseno, precision fp16, gradient checkpointing y una unica GPU Tesla T4. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo generativo de imagen; tampoco se detallan tecnicas de decodificacion acelerada ni schedulers especificos mas alla de la inferencia estandar de `StableDiffusionPipeline`.

## Capacidades

- Generacion de imagenes texto-a-imagen en 512x512 px dentro del dominio de mascotas (perros y gatos).
- Cobertura de las 37 razas presentes en Oxford-IIIT Pet, incluyendo las validadas en la model card: gato abisinio, beagle, gato persa y golden retriever.
- Interpretacion de prompts descriptivos en ingles con modificadores de estilo de la plantilla de entrenamiento ("high quality", "detailed fur", "sharp").
- Fusion del adaptador sobre el UNet mediante PEFT, lo que permite reutilizar cualquier pipeline de SD1.5 (`StableDiffusionPipeline`) sin cambiar el resto del grafo.
- Nivel de detalle orientado a pelo y textura, segun la descripcion del autor.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso, vision de entrada ni modo "thinking".
- Capacidades multilingues: no disponibles; el entrenamiento se hizo con prompts en ingles.
- No se documentan capacidades de edicion (inpainting, img2img guiado) ni de control estructural (ControlNet).

## Casos de uso

- Generacion de ilustraciones de razas concretas para fichas de producto: el LoRA permite producir imagenes consistentes de una raza (por ejemplo, beagle o golden retriever) para catalogos de alimentacion, accesorios o seguros de mascotas, reutilizando la plantilla de prompt con la que se entreno.
- Prototipado rapido de material grafico para refugios y protectoras: generar imagenes de apoyo para campanas de adopcion cuando no hay fotografia disponible, siempre etiquetando la imagen como generada.
- Aumento de datos sinteticos para clasificadores de razas: el modelo puede producir muestras sinteticas de las mismas clases que el PS IMAGE 1.0 (gato/perro) para complementar datasets de vision por computador, aunque requeriria validacion de sesgo por raza.
- Demostracion docente de fine-tuning LoRA: dado su tamano (6,2 MB, 1800 pasos en una T4), es un caso practico para explicar adaptacion de bajo rango sobre difusion en cursos y talleres, con un coste de computo minimo.
- Personalizacion ligera en aplicaciones de ocio: generacion de avatares o ilustraciones de mascotas dentro de una app, cargando SD1.5 fp16 y fusionando el adaptador en tiempo de arranque del servicio.
- Pruebas de integracion de pipelines PEFT + diffusers: sirve como banco de pruebas para validar el flujo `PeftModel.from_pretrained` + `merge_and_unload` antes de portarlo a adaptadores mayores.
- Investigacion sobre sobreajuste en LoRA de dominio cerrado: con 1800 pasos y 3680 imagenes, es un caso util para estudiar como un adaptador de rango 8 se especializa en un dominio estrecho y pierde generalidad fuera de el.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion reportada por el autor es cualitativa: 4 de 4 generaciones nitidas a 512 px validadas con las clases gato abisinio, beagle, gato persa y golden retriever. No hay metricas objetivas tipo FID, CLIP score, IS ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- El adaptador en si ocupa ~6,2 MB, por lo que su carga no condiciona la memoria: el requisito real lo marca la base SD1.5.
- Estimacion orientativa para SD1.5 en fp16: del orden de 4 GB de VRAM para inferencia a 512 px sin optimizaciones, y aproximadamente 2-3 GB activando attention slicing u offload a CPU. Estas cifras son estimaciones, no datos publicados por el autor.
- GPU validada por el autor para entrenamiento: Tesla T4. Para inferencia, cualquier GPU consumer con 6 GB o mas es suficiente en la practica (serie RTX 30/40, e incluso GTX 1660).
- GPU recomendadas para servicio en produccion: NVIDIA T4, L4, A10G o superiores; A100/H100 si se necesita alto throughput por lote.
- Cabe en GPU consumer; se recomienda al menos 8 GB de VRAM para trabajar con comodidad a 512 px y 30 pasos.
- Opciones de despliegue: `diffusers` (el flujo documentado con `StableDiffusionPipeline` + `peft`), WebUI de Automatic1111 o Forge, ComfyUI, y servidores de inferencia compatibles con SD1.5.
- Latencia y throughput: no disponibles. Dependen de la GPU, del numero de pasos y del scheduler; el ejemplo de la model card usa 30 pasos y guidance scale 7,5.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PS-IMAGE-1.1 | LoRA sobre SD1.5 | ~1,6 M entrenables (6,2 MB) | 512x512 px | No disponible en el repo (base CreativeML Open RAIL-M) | Publico en Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | Modelo de difusion completo | No disponible en la informacion proporcionada | 512x512 px | CreativeML Open RAIL-M | Ampliamente disponible |
| PS IMAGE 1.0 (version previa del mismo autor) | Clasificador MobileNetV2 | No disponible en la informacion proporcionada | Entrada 128 px, 10 clases CIFAR | No disponible | Version anterior, sustituida por la 1.1 |
| Adaptadores LoRA de mascotas de terceros | LoRA sobre SD1.5 u otras bases | No disponible | No disponible | No disponible | No se han encontrado alternativas concretas en la busqueda web realizada |

No se dispone de datos cuantitativos para comparar rendimiento entre estas opciones; la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre adaptadores comparables.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo perros y gatos de las 37 razas de Oxford-IIIT Pet; fuera de ese conjunto la calidad no esta documentada.
- Riesgo alto de sobreajuste a la plantilla de prompt de entrenamiento; prompts con estructura muy distinta pueden degradar el resultado.
- El repositorio figura con 0,0 GB de tamano pese a declarar un adaptador de 6,2 MB, lo que sugiere que los pesos podrian no estar subidos o no ser accesibles. Conviene verificar antes de depender del modelo.
- Licencia del adaptador no especificada: no hay autorizacion explicita de uso comercial por parte del autor. La base SD1.5 usa CreativeML Open RAIL-M, con restricciones de uso (incluida la prohibicion de usos daninos y la obligacion de compartir las mismas restricciones en obras derivadas).
- Idiomas: los prompts de entrenamiento estan en ingles; no hay evidencia de que responda bien a prompts en castellano u otros idiomas.
- Riesgo de sesgo por raza: el dataset Oxford-IIIT Pet no esta balanceado por raza ni por contexto fotografico, por lo que la representacion de algunas razas puede ser notablemente peor.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomias incorrectas, texturas irreales o mezclas de razas no solicitadas.
- Ausencia total de evaluacion cuantitativa (FID, CLIP score) y de validacion con un conjunto de test independiente; las unicas muestras reportadas son 4 imagenes.
- Uso en produccion no recomendado sin un paso previo de evaluacion propia: 0 descargas y 0 likes implican que no existe validacion por parte de la comunidad.
- Consideraciones eticas y legales: no se documenta el filtro de seguridad (`safety_checker=None` en el ejemplo de inferencia), y no hay informacion sobre consentimiento, procedencia de datos mas alla del dataset publico, ni sobre la generacion de imagenes de animales reales identificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pedro21613/PS-IMAGE-1.1
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Dataset citado en la model card: Oxford-IIIT Pet (enlace no incluido en la informacion proporcionada)
- Paper, blog, repositorio o demo adicionales: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente resultados no relacionados sobre foros de vehiculos).
