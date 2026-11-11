# darkmaniac7/TokForge-SD15-LCM-Style-Ghibli-b1

## Resumen

TokForge-SD15-LCM-Style-Ghibli-b1 es un paquete de inferencia en formato MNN para generacion de imagenes text-to-image, derivado de Stable Diffusion 1.5. Lo publica el desarrollador darkmaniac7 bajo la marca TokForge, con el objetivo de ejecutar generacion de imagenes completamente en local en telefonos Android, sin conexion a red una vez descargado el modelo. Combina tres componentes fusionados en el UNet: el checkpoint DreamShaper 7 de Lykon como base, el adaptador LCM-LoRA de SD1.5 para muestreo en pocos pasos y el LoRA de estilo de ilustracion de libro infantil de osmr.

La relevancia del modelo es practica: reduce la generacion de una imagen 512x512 a 4 pasos de muestreo sin classifier-free guidance (CFG 1.0), lo que hace viable la inferencia en CPU de un telefono de gama media-alta. El bundle ocupa 1.21 GB repartidos en 9 ficheros, con el UNet cuantizado a 8 bits asimetricos y el text encoder CLIP y el decoder VAE en f16.

Este repositorio concreto es la variante batch-1 del bundle, con UNet exportado con altura y anchura dinamicas, pensada para las versiones de TokForge 3.6.0 beta 24 en adelante y las releases 1.3.x. La variante sin sufijo `-b1` mantiene los mismos pesos pero con un grafo UNet de batch fijo 2, destinado a builds antiguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (text encoder CLIP ViT-L/14, UNet, decoder VAE) |
| Parametros totales | no disponible (checkpoint SD1.5, aproximadamente 860M en UNet segun arquitectura de referencia; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; limite de 77 tokens del tokenizer CLIP |
| Tipos de cuantizacion | UNet en 8 bits asimetricos; text encoder y VAE decoder en f16 |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | CreativeML OpenRAIL-M, mas los terminos de Civitai de Lykon para DreamShaper (prohibida la venta) |
| Formato de pesos | MNN (grafos `.mnn` con pesos `.mnn.weight`), tokenizer CLIP en `vocab.json`, `merges.txt` y `alphas.txt` |
| Resolucion de salida | 512x512 |
| Pasos de muestreo | 4 por defecto, hasta 8 para refinamiento |
| CFG | 1.0 (guidance-free, sin prompt negativo) |
| Tamano del repo | 1.2 GB (9 ficheros) |
| Libreria | mnn |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es una fusion de pesos. El procedimiento declarado por el autor consiste en cargar `Lykon/dreamshaper-7` en diffusers, fusionar encima el LCM-LoRA de SD1.5 (`latent-consistency/lcm-lora-sdv1-5`) y, sobre el resultado, el LoRA de estilo `osmr/stable-diffusion-v1-5-lora-iv-ghibli`, aplicando `fuse_lora` en fp32 un LoRA cada vez. Posteriormente el UNet fusionado se exporta a ONNX trazado en batch 1 con altura y anchura dinamicas, y de ahi a MNN. El text encoder y el decoder VAE se toman como ficheros MNN de referencia de SD1.5 en f16.

La innovacion tecnica relevante es la combinacion de LCM con muestreo sin guidance. Como CFG es 1.0, la pasada incondicional del UNet no aporta nada, de modo que el motor de TokForge ejecuta una sola pasada condicional por paso en lugar de un batch de dos. Eso justifica el export batch-1 y explica por que los builds antiguos, que siempre alimentan un batch de 2, fallarian con este grafo. El UNet se cuantiza a 8 bits asimetricos para reducir el peso a 862 MB, mientras que el text encoder (170 MB en f16) y el VAE decoder (99 MB en f16) se mantienen en precision reducida pero no entera. No se documenta el dataset de entrenamiento original de DreamShaper ni el del LoRA de estilo; son pesos de terceros reutilizados.

## Capacidades

- Generacion de imagenes text-to-image a 512x512 en 4 pasos, con calidad coherente gracias al adaptador LCM.
- Estilo fijo de ilustracion de libro infantil: aspecto de pelicula de animacion dibujada a mano, con color y luz suaves, impuesto por el LoRA fusionado en el UNet. No es un estilo opcional ni conmutable.
- Inferencia totalmente local en Android sobre CPU, sin llamadas a servidor una vez descargado el bundle.
- Funcionamiento offline: tras la descarga no requiere conexion.
- Prompts exclusivamente en ingles; el tokenizer CLIP de SD1.5 no esta adaptado a otros idiomas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: es un generador de imagenes puro.
- Sin prompt negativo utilizable, ya que a CFG 1.0 la rama incondicional se descarta.

## Casos de uso

- Ilustracion de cuentos infantiles en una app movil: el modelo genera escenas 512x512 con el estilo de libro ilustrado de forma consistente, lo que permite crear ilustraciones bajo demanda dentro de una aplicacion de lectura o creacion de historias sin coste de servidor.
- Prototipado rapido de arte conceptual en Android: un disenador puede iterar prompts en el propio telefono, con 4 pasos por imagen, para explorar variaciones de una escena antes de encargar arte final.
- Generacion de avatares y cabeceras con estetica de animacion: util para apps de personalizacion que necesitan resultados estilizados y homogeneos sin depender de una API externa.
- Funcionalidad offline en entornos sin conectividad: aplicaciones de campo, educativas o de viaje donde no se garantiza red, aprovechando que el bundle funciona integramente en el dispositivo.
- Material de apoyo para docentes y creadores de contenido: generacion de ilustraciones para fichas, presentaciones o publicaciones con un estilo reconocible y coherente entre imagenes.
- Demostraciones de inferencia on-device: sirve como referencia tecnica para evaluar el rendimiento de SD1.5 con LCM cuantizado a 8 bits en CPU de telefono, y como base para experimentos de despliegue MNN en movil.
- Integracion en el ecosistema TokForge: el modelo se consume desde la app TokForge (Android en Google Play, iOS en TestFlight) seleccionandolo como modelo de imagen en el catalogo de dispositivos con 8 GB de RAM o mas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de calidad (FID, CLIP score) ni de latencia o throughput por dispositivo.

## Requisitos de hardware

- VRAM o memoria: el bundle completo pesa 1.21 GB en disco; en ejecucion el UNet en 8 bits (862 MB) mas text encoder y VAE en f16 suponen una huella de memoria del orden de 1.2 a 1.5 GB, aunque el autor no publica la cifra exacta de RAM en ejecucion.
- Clase de dispositivo declarada: telefonos Android con 8 GB de RAM o mas, segun el catalogo de TokForge.
- GPU: no aplica; la inferencia esta pensada para CPU de telefono. No se documenta soporte de GPU movil ni de aceleradores de escritorio.
- Cabe en GPU consumer: no es el objetivo del bundle; esta empaquetado en MNN para Android y no se distribuye en formatos GGUF, safetensors ni diffusers.
- Opciones de despliegue: app TokForge (Android via Google Play, iOS via TestFlight) y el runtime MNN. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un modelo de difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Solo se conoce el ajuste de 4 pasos por imagen, que reduce el coste frente a los 20-50 pasos tipicos de SD1.5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-SD15-LCM-Style-Ghibli-b1 | SD1.5 (~860M en UNet, no declarado) | 512x512, 4 pasos, CFG 1.0 | MNN on-device Android, estilo fusionado | CreativeML OpenRAIL-M + terminos Civitai de DreamShaper | Hugging Face, app TokForge |
| TokForge-SD15-LCM-Style-Ghibli (variante sin `-b1`) | Identicos | 512x512, batch fijo 2 | MNN on-device, builds antiguas de TokForge | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face |
| Lykon/dreamshaper-7 | SD1.5 | 512x512, muestreo estandar multi-paso | Checkpoint base en diffusers | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face |
| latent-consistency/lcm-lora-sdv1-5 | Adaptador LoRA | Acelera SD1.5 a pocos pasos | LoRA de consistencia latente | CreativeML OpenRAIL-M | Hugging Face |

La comparacion con modelos de difusion de mayor tamano (SDXL, Flux) no esta disponible en la informacion proporcionada, y en cualquier caso no serian alternativas directas para inferencia en CPU de telefono con este perfil de memoria.

## Limitaciones y advertencias

- Estilo no configurable: el LoRA de ilustracion esta fusionado en los pesos, por lo que todas las imagenes salen con esa estetica. No se puede desactivar ni cambiar sin reexportar el modelo.
- Solo ingles: los prompts deben escribirse en ingles; el tokenizer CLIP de SD1.5 no maneja bien otros idiomas y la calidad cae con prompts en castellano.
- Limite de 77 tokens de prompt por el tokenizer CLIP, lo que restringe la complejidad de las instrucciones.
- Sin prompt negativo efectivo: a CFG 1.0 no hay rama incondicional, de modo que no se pueden suprimir elementos indeseados mediante negative prompt.
- Resolucion fija de 512x512; no se documenta soporte de otras resoluciones ni de upscaling interno.
- Riesgo de sesgos y alucinaciones visuales heredado de SD1.5 y DreamShaper: posibles representaciones estereotipadas, anatomia incorrecta, texto ilegible en la imagen y artefactos en escenas complejas.
- Restricciones de licencia: CreativeML OpenRAIL-M impone condiciones de uso (prohibicion de usos daninos listados en la licencia) y, ademas, los terminos de Civitai de Lykon para DreamShaper prohiben la venta. Conviene revisar ambas antes de cualquier uso comercial.
- Ficha con muy poca traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa y de reportes de calidad.
- Dependencia del runtime: el bundle solo es utilizable con MNN y con versiones concretas de TokForge; no es portable a diffusers, ComfyUI u otras herramientas sin conversion.
- Sin datos publicados de latencia, memoria en ejecucion ni benchmarks de calidad, lo que dificulta planificar capacidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Ghibli-b1
- Variante batch fijo 2: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Ghibli
- Coleccion TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Coleccion TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- LoRA de estilo Ghibli de osmr: https://huggingface.co/osmr/stable-diffusion-v1-5-lora-iv-ghibli
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- App en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- TestFlight iOS: https://testflight.apple.com/join/jnufjzRr
