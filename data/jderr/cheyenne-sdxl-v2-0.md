# jderr/Cheyenne-SDXL-v2.0

## Resumen

Cheyenne v2.0 es un checkpoint fusionado (*merge*) de Stable Diffusion XL 1.0 orientado a ilustracion, comic de estilo europeo, novela grafica, *concept art* y diseno de personajes. No es un modelo de lenguaje ni un modelo de difusion entrenado desde cero: se trata de una mezcla de pesos derivada de `stabilityai/stable-diffusion-xl-base-1.0`, publicada originalmente por el autor Aurety en Civitai (AIR `civitai:198051@1055511`) y redistribuida en HuggingFace por el usuario `jderr` bajo el identificador `jderr/Cheyenne-SDXL-v2.0`.

El modelo resuelve un problema muy concreto de los flujos de produccion visual: conseguir acabados de ilustracion entintada, *lineart* y pintura mate sin derivar hacia un resultado fotografico. La version 2.0 introduce, segun su model card, un render mas maduro y pictorico, linework mas preciso y mayor versatilidad, con soporte explicito para prompts cortos y literales a los que se anaden terminos de estilo (`graphic novel`, `comics`, `lineart`, `ink`, `matte painting`).

La relevancia de esta ficha es sobre todo practica: el repositorio tiene 0 descargas y 0 *likes*, no publica benchmarks ni documenta idiomas, y su unico artefacto es un checkpoint `fp16` de aproximadamente 6,5-6,9 GB con el VAE incrustado (*baked*). Es, por tanto, un modelo a evaluar por prueba directa, no por metricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (U-Net + dos text encoders CLIP), base Stable Diffusion XL 1.0; checkpoint resultante de un *merge* de pesos |
| Parametros totales | No indicado en la model card. La base SDXL 1.0 ronda los 2,6 mil millones en el U-Net y ~3,5 mil millones contando los text encoders (dato de la arquitectura base, no verificado para este merge) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de un LLM. La base SDXL codifica el prompt con dos text encoders CLIP de 77 tokens cada uno; el autor no documenta ninguna extension de contexto |
| Tipos de cuantizacion | El repositorio solo distribuye el checkpoint en `fp16`. No se documentan versiones GGUF, INT8 ni FP8 oficiales |
| Idiomas soportados | No disponibles. El autor no documenta idiomas; los terminos de prompt sugeridos estan en ingles |
| Licencia | CreativeML Open RAIL++-M (`openrail++`) |
| Formato de pesos | SafeTensors (`_Cheyenne_2.0_VAE_Baked_.fp16.safetensors`), VAE incrustado, precision fp16 |
| Tamano del repositorio | 6,9 GB |
| Pipeline declarado | text-to-image |
| Version | 2.0 |
| Autor original | Aurety (publicacion original en Civitai) |
| Repositorio | `jderr/Cheyenne-SDXL-v2.0` (redistribucion) |

## Arquitectura y entrenamiento

La arquitectura es la de SDXL 1.0 sin modificaciones estructurales: un U-Net de difusion latente que opera sobre el autoencoder VAE de SDXL, condicionado por dos text encoders CLIP (uno de ellos OpenCLIP de mayor tamano) y con *conditioning* adicional de tamano y recorte. Cheyenne v2.0 no aporta capas nuevas, destilacion ni atencion lineal; es un *checkpoint merge*, es decir, una combinacion de pesos de modelos SDXL preexistentes ajustada para sesgar la distribucion de salida hacia estetica de ilustracion y comic.

No hay informacion publica en el repositorio sobre el dataset de entrenamiento o ajuste, el numero de tokens o imagenes vistas, ni sobre el uso de RLHF, DPO o *fine-tuning* supervisado: al ser un merge, su comportamiento procede de los modelos fuente, que no se detallan. El VAE esta insertado en el checkpoint, pero la propia model card advierte de que el autor original reporto posibles problemas con ese VAE y recomienda usar externamente el *SDXL VAE FP16 Fix* (por ejemplo `sdxl_vae.safetensors` en `ComfyUI/models/vae/`) en lugar de confiar en el integrado. La unica guia de inferencia documentada es de muestreo: sampler DPM++ 2M, entre 10 y 30 pasos y CFG entre 1 y 5, con DPM++ 2M SDE y DPM++ 3M SDE como alternativas que producen resultados mas nitidos pero con menor fidelidad al prompt.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts cortos y literales, sin palabra de activacion obligatoria.
- Renderizado con estetica de novela grafica, comic europeo, *lineart*, entintado (*ink*), boceto y *matte painting*.
- *Concept art* y diseno de personajes con acabado pictorico y linework mas preciso que en la version 1.x, segun el autor.
- Control del estilo mediante terminos de prompt explicitos (`graphic novel`, `comics`, `European comics`, `illustration`, `concept art`, `character design`, `painting`).
- Ajuste fino del resultado mediante sampler, numero de pasos y CFG, con sensibilidad alta a estos parametros.
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades de vision, audio, video ni generacion de codigo.
- No documenta soporte multilingue de prompts; los unicos terminos de estilo facilitados estan en ingles.

## Casos de uso

- Ilustracion de comic europeo: el modelo esta sesgado hacia *lineart* y entintado, por lo que generar paginas o viñetas con prompts que incluyan `European comics`, `ink` y `lineart` produce un acabado mas cercano al mercado franco-belga que un SDXL generico.
- *Concept art* para produccion audiovisual o videojuegos: con CFG bajo (1-3) y prompts literales, el autor indica que se obtienen resultados mas creativos y pictoricos, utiles en fases de exploracion visual.
- Diseno de personajes: la capacidad de mantener un estilo de ilustracion declarado permite iterar variaciones de un mismo personaje anadiendo descriptores fisicos y de vestuario al prompt base.
- *Matte painting* y fondos: los terminos `matte painting` y `painting` dirigen la salida hacia entornos pintados, aprovechables como fondos en *storyboards* o previsualizacion.
- Bocetado y *lineart* para posterior entintado manual o por otras herramientas: el modelo puede generar lineas limpias que se usen como base de un flujo de postproduccion.
- Portadas e ilustracion editorial: con prompts cortos y estilo comic, sirve para generar propuestas de portada de novela grafica o fanzine antes de un render final.
- Previsualizacion rapida en estudio: al funcionar con 10-30 pasos y CFG bajo, permite ciclos de iteracion cortos para validar direccion artistica antes de encargar ilustracion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de `jderr/Cheyenne-SDXL-v2.0` no incluye FID, CLIP score, evaluacion humana ni comparativas numericas frente a otros checkpoints SDXL.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas para un checkpoint SDXL 1.0 en fp16, no medidas sobre este modelo concreto:

- VRAM en fp16: en torno a 8 GB como minimo con la pipeline estandar de SDXL a 1024x1024; 10-12 GB para trabajar con comodidad y margen para *batch* o resoluciones superiores.
- VRAM reducida: con *offloading* de modulos a CPU y VAE en *tiling*, puede ejecutarse en GPUs de 6 GB, a costa de latencia notablemente mayor.
- GPUs recomendadas: A100 40/80 GB y H100 para inferencia por lotes o despliegues multi-usuario; RTX 4090, RTX 4080, RTX 3090 y RTX 3060 12 GB para uso individual en *workstation*.
- GPU de consumo: si cabe en GPUs de consumo de gama media-alta (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante). En GPUs de 8 GB o menos requiere *offloading* o cuantizacion externa.
- Opciones de despliegue: ComfyUI (flujo documentado por el autor, con el checkpoint en `ComfyUI/models/checkpoints/`), Automatic1111/Forge, InvokeAI, SD.Next y Diffusers. Para cuantizacion en GPUs pequenas puede convertirse a GGUF y usarse con stable-diffusion.cpp o el nodo GGUF de ComfyUI, aunque esa conversion no la documenta el autor.
- Latencia y throughput: no hay mediciones publicadas para este checkpoint. Como referencia de la arquitectura base en fp16, un 1024x1024 con 25-30 pasos suele resolverse en el orden de segundos en una RTX 4090 o A100, y en varios minutos en CPU. Estos valores no estan verificados para Cheyenne v2.0.

## Comparativa con modelos similares

No se han publicado datos de rendimiento de Cheyenne v2.0, por lo que la comparativa se limita a parametros estructurales, licencia y disponibilidad.

| Modelo | Base | Parametros | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cheyenne v2.0 | SDXL 1.0 (*merge*) | ~2,6 mil millones en U-Net (base SDXL) | 77 tokens por text encoder CLIP (base SDXL) | CreativeML Open RAIL++-M | HuggingFace (`jderr/Cheyenne-SDXL-v2.0`) y Civitai; 0 descargas, sin benchmarks |
| Juggernaut XL | SDXL (*merge*) | ~2,6 mil millones en U-Net (base SDXL) | 77 tokens por text encoder CLIP | CreativeML Open RAIL++-M | HuggingFace y Civitai; ecosistema amplio de usuarios y ejemplos |
| DreamShaper XL | SDXL (*merge*) | ~2,6 mil millones en U-Net (base SDXL) | 77 tokens por text encoder CLIP | CreativeML Open RAIL++-M | HuggingFace y Civitai; muy difundido para ilustracion y fantasia |
| Animagine XL 3.x | SDXL (*fine-tune*) | ~2,6 mil millones en U-Net (base SDXL) | 77 tokens por text encoder CLIP | CreativeML Open RAIL++-M (con condiciones adicionales del autor) | HuggingFace; orientado a estetica anime, no a comic europeo |

La diferencia funcional de Cheyenne v2.0 frente a estas alternativas no esta en arquitectura ni licencia, sino en el sesgo estetico declarado hacia comic europeo, *lineart* y *matte painting*. No existe evidencia publicada que permita afirmar que supere o iguale a ninguno de ellos en calidad: cualquier comparacion de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Anatomia imperfecta: la model card reconoce generacion ocasional de manos y anatomia defectuosas.
- Deriva fotografica: la salida puede resultar mas fotografica de lo deseado si no se anaden terminos de estilo explicitos.
- Alta sensibilidad a parametros: sampler, numero de pasos y CFG alteran notablemente el resultado; CFG bajo da un acabado mas pictorico y CFG alto, mas literal.
- Menor adherencia al prompt con samplers SDE (DPM++ 2M SDE, DPM++ 3M SDE), que a cambio producen imagenes mas nitidas.
- VAE integrado problematico: el autor original reporto posibles fallos del VAE incrustado y recomienda usar el SDXL VAE FP16 Fix externo.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de calidad, ni FID, ni CLIP score, ni evaluacion humana.
- Idiomas no documentados: no hay garantia de que el modelo responda correctamente a prompts en castellano; los terminos de estilo facilitados estan en ingles.
- Linaje incompleto: al ser un *checkpoint merge*, no se detallan los modelos fuente, el dataset ni el proceso de mezcla, lo que dificulta reproducir o auditar su comportamiento.
- Licencia CreativeML Open RAIL++-M: permite uso comercial, pero impone las restricciones de uso de la licencia RAIL++ (prohibicion de usos daninos, desinformacion, suplantacion, contenido ilegal y demas supuestos enumerados). Es responsabilidad del usuario cumplirla, asi como las leyes aplicables y los derechos de terceros.
- Atribucion: la model card indica que el modelo original es de Aurety y que el repositorio de HuggingFace no es la publicacion original ni reclama autoria de los pesos. Conviene mantener esa atribucion.
- Repositorio sin traccion: 0 descargas y 0 *likes*, sin issues ni ejemplos de la comunidad que permitan validar su comportamiento en produccion.
- Metadato inconsistente: las fechas de creacion y actualizacion declaradas (2026-09-23) son posteriores a la fecha actual, lo que sugiere un error de metadatos en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/jderr/Cheyenne-SDXL-v2.0
- Publicacion original en Civitai (referencia derivada del AIR `civitai:198051@1055511`): https://civitai.com/models/198051
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Repositorio de ComfyUI (entorno de despliegue documentado por el autor): https://github.com/comfyanonymous/ComfyUI
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo: los resultados obtenidos no guardan relacion con la ficha y no se incluyen.
