# lllyasviel/ControlNet-v1-1

## Resumen

ControlNet 1.1 es un conjunto de 14 modelos de control espacial para Stable Diffusion 1.5, desarrollados por Lvmin Zhang (lllyasviel) junto con Maneesh Agrawala en el marco del proyecto ControlNet. Su funcion es anadir condiciones de control geometrico o estructural a un modelo de difusion texto-a-imagen: profundidad, bordes Canny, poses humanas, segmentacion semantica, normales de superficie, lineart, garabatos, tile, shuffle o inpainting. El repositorio de HuggingFace `lllyasviel/ControlNet-v1-1` agrupa los pesos de esta version, publicada en abril de 2023 y actualizada por ultima vez el 25 de abril de 2023, con 4131 me gusta y un tamano total de 28,1 GB.

Tecnicamente, ControlNet no es un modelo generativo autonomo: es un adaptador que se acopla a un UNet de Stable Diffusion 1.5 congelado mediante copias entrenables de los bloques del encoder, conectadas con convoluciones de cero inicializadas. Esto permite reutilizar la capacidad generativa del modelo base sin reentrenarlo, anadiendo un control espacial preciso que el prompt de texto por si solo no puede expresar.

Su relevancia actual es historica y practica: ControlNet 1.1 consolido el paradigma de condicionamiento estructural en difusion, fue la base de la mayoria de los flujos de trabajo con Stable Diffusion 1.5 en AUTOMATIC1111, ComfyUI o diffusers, y sigue siendo el estandar de referencia con el que se comparan alternativas posteriores como T2I-Adapter, ControlNet-XS o los ControlNet de SDXL. No incorpora un modelo de lenguaje ni una ventana de contexto conversacional: el unico "contexto" textual es el encoder CLIP de 77 tokens heredado de Stable Diffusion 1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet (copias entrenables de bloques encoder de un UNet de difusion latente) sobre Stable Diffusion 1.5 |
| Parametros totales | No disponible en la informacion proporcionada; el paper de ControlNet cifra en aproximadamente 361 M los parametros adicionales por checkpoint sobre un UNet de SD 1.5 de unos 860 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; el encoder de texto CLIP asociado a SD 1.5 admite 77 tokens por prompt |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; los checkpoints se usan en fp32 y, en la practica, en fp16/bf16 |
| Idiomas soportados | No disponible; el condicionamiento textual heredado de CLIP esta dominado por el ingles |
| Licencia | openrail (Open RAIL) |
| Formato de pesos | safetensors en el repositorio de HuggingFace; los pesos originales tambien se distribuyen en formato PyTorch (.pth) en el repositorio de GitHub |

Otros datos del repositorio: autor `lllyasviel`, fecha de creacion 12 de abril de 2023, ultima actualizacion 25 de abril de 2023, tamano del repositorio 28,1 GB (los 14 checkpoints), 4131 me gusta, pipeline declarado no disponible.

## Arquitectura y entrenamiento

ControlNet clona los bloques del encoder del UNet de Stable Diffusion 1.5 en una rama entrenable paralela, manteniendo el UNet original congelado. La condicion externa (mapa de profundidad, Canny, pose, segmentacion, etc.) se inyecta en esa rama y se reincorpora al UNet mediante conexiones de convolucion 1x1 inicializadas a cero, de modo que en el paso inicial la red se comporta exactamente como el modelo base y el entrenamiento no degrada la capacidad generativa previa. La version 1.1 mantiene la resolucion nativa de entrenamiento de 512x512 de SD 1.5 y anade modos de condicionamiento mas robustos y variados que la 1.0.

Los 14 checkpoints incluidos en este repositorio son: `control_v11e_sd15_ip2p`, `control_v11e_sd15_shuffle`, `control_v11f1e_sd15_tile`, `control_v11f1p_sd15_depth`, `control_v11p_sd15_canny`, `control_v11p_sd15_inpaint`, `control_v11p_sd15_lineart`, `control_v11p_sd15_mlsd`, `control_v11p_sd15_normalbae`, `control_v11p_sd15_openpose`, `control_v11p_sd15_scribble`, `control_v11p_sd15_seg`, `control_v11p_sd15_softedge` y `control_v11p_sd15s2_lineart_anime`. El detalle de volumen de tokens de entrenamiento, composicion exacta del dataset, uso de RLHF/DPO (no aplicable a un modelo de difusion de este tipo) y proceso de anotacion no esta disponible en la informacion proporcionada; la model card original indica explicitamente que se completaria mas adelante, tras la fusion oficial de 1.1 en ControlNet.

## Capacidades

- Control espacial de la generacion: permite fijar la estructura de la imagen generada a partir de una condicion externa en lugar de depender solo del prompt de texto.
- Deteccion de bordes (Canny): condiciona la generacion a los contornos de una imagen de referencia.
- Profundidad (depth, MiDaS y variante f1p): preserva la geometria 3D estimada de una escena.
- Pose humana (OpenPose): transfiere la postura de una persona o de un esqueleto dibujado a la imagen generada.
- Segmentacion semantica (seg): control por regiones etiquetadas por clase.
- Normales de superficie (normalbae): condiciona a mapas de normales para iluminacion y relieve coherentes.
- Lineart y lineart_anime: control a partir de dibujos lineales, con un modelo especifico para ilustracion anime (`sd15s2_lineart_anime`).
- Garabatos (scribble) y bordes suaves (softedge, basado en HED): control a partir de bocetos rapidos.
- MLSD: deteccion de lineas rectas, util para arquitectura e interiores.
- Tile, shuffle e ip2p (instruct pix2pix): superresolucion y refinado por teselas, recomposicion de estilo y edicion guiada por instrucciones.
- Inpainting: generacion condicionada dentro de una mascara sobre la imagen original.
- Compatibilidad con todo el ecosistema SD 1.5: LoRA, textual inversion, schedulers, samplers y pipelines de `diffusers`.
- No dispone de tool calling, function calling, razonamiento multi-paso, vision para comprension de imagenes, audio ni modo "thinking"; son capacidades fuera del alcance de este tipo de modelo.

## Casos de uso

- Ilustracion profesional con boceto: un dibujante entrega un lineart y el modelo `control_v11p_sd15_lineart` lo convierte en una ilustracion acabada respetando exactamente las lineas, algo que un prompt de texto no garantiza.
- Arquitectura e interiorismo: a partir de un render de bloqueo o un mapa MLSD de lineas rectas se generan variaciones fotorrealistas manteniendo la perspectiva y la estructura del edificio.
- Transferencia de pose en publicidad y moda: usando `control_v11p_sd15_openpose`, se reutiliza la postura de una modelo de referencia para generar variaciones de producto o vestuario sin repetir sesiones fotograficas.
- Rotoscopia y postproduccion de video: procesando fotograma a fotograma con Canny o softedge se aplica un estilo consistente sobre metraje real, con estructura temporal estable.
- Superresolucion y ampliacion por teselas: `control_v11f1e_sd15_tile` permite ampliar una imagen por bloques manteniendo coherencia local, util en restauracion y en pipelines de upscaling de 512 px a resoluciones mayores.
- Edicion guiada por instrucciones: `control_v11e_sd15_ip2p` realiza transformaciones tipo "convierte esto en aquello" sobre una imagen existente, util para retoque y variaciones controladas.
- Control de calidad de datasets sinteticos: la combinacion de segmentacion, profundidad y normales permite generar imagenes con anotaciones geometricas coherentes para entrenar otros modelos.
- Prototipado en herramientas interactivas: integrado en AUTOMATIC1111, ComfyUI o Forge, permite flujos de trabajo de "pintar y generar" donde el usuario controla la composicion en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio esta practicamente vacia (indica que se completara tras la fusion oficial de 1.1 en ControlNet) y los resultados de busqueda web proporcionados no contienen datos tecnicos del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay cifras oficiales publicadas en la informacion disponible. De forma orientativa, la tuberia SD 1.5 con ControlNet en fp16 ocupa del orden de 5 a 8 GB de VRAM a 512x512, dependiendo del backend, del numero de unidades de atencion simultaneas y de si se aplican atencion segmentada o carga por capas.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 40/80 GB, H100 para servicio en lote de alta concurrencia; RTX 3060 12 GB, RTX 4070 y tarjetas de 8 GB pueden ejecutar el modelo con fp16 y optimizaciones de memoria.
- Cabe en GPU de consumo: si, en la mayoria de GPU de 8 GB o mas con fp16; en tarjetas de 4-6 GB es posible con carga por capas y atencion segmentada, a costa de latencia.
- Opciones de despliegue: `diffusers` (`StableDiffusionControlNetPipeline` y variantes), AUTOMATIC1111 WebUI, ComfyUI, Forge, InvokeAI, y exportacion a ONNX o TensorRT para entornos de produccion.
- Latencia y throughput estimados: no disponibles de forma oficial en la informacion proporcionada. En la practica, cada paso de muestreo anade una pasada por la copia del encoder de ControlNet, por lo que el coste por imagen es superior al de SD 1.5 sin control, en funcion del sampler y del numero de pasos.

## Comparativa con modelos similares

| Modelo | Parametros adicionales | Resolucion nativa | Condiciones soportadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ControlNet 1.1 (SD 1.5) | No disponible en la informacion proporcionada; aproximadamente 361 M por checkpoint segun el paper | 512x512 | 14 checkpoints: canny, depth, hed/softedge, mlsd, normal, openpose, scribble, seg, lineart, lineart anime, tile, shuffle, ip2p, inpaint | openrail | Repositorio HuggingFace de 28,1 GB, 4131 me gusta; integrado en diffusers, ComfyUI y AUTOMATIC1111 |
| T2I-Adapter | No disponible | 512x512 | Varias condiciones por adaptador (sketch, depth, seg, keypose), mas ligero | No disponible en la informacion proporcionada | Repositorios publicos del equipo Tencent ARC |
| ControlNet-XS | No disponible | 512x512 | Condiciones similares, disenado para menor latencia en el control | No disponible en la informacion proporcionada | Repositorio publico |
| ControlNet para SDXL / ControlNet-Union | No disponible | 1024x1024 | Multiples condiciones en un unico checkpoint | No disponible en la informacion proporcionada | Repositorios de terceros en HuggingFace |

La comparacion cuantitativa de rendimiento entre estas alternativas no puede completarse con la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere obligatoriamente un checkpoint base de Stable Diffusion 1.5. No es compatible con SD 2.x ni con SDXL sin adaptaciones.
- No soporta conversacion, razonamiento ni generacion de codigo; es exclusivamente un modelo de generacion y edicion de imagen.
- El condicionamiento textual heredado de CLIP esta dominado por el ingles; el rendimiento con prompts en castellano es peor y no hay datos oficiales de cobertura multilingue.
- Resolucion nativa de 512x512: a resoluciones mayores sin tile o upscaling aparecen duplicaciones de sujetos y artefactos anatomicos.
- Riesgo de alucinacion visual: el modelo puede inventar detalles plausibles que no existen en la imagen de condicion, especialmente en zonas ambiguas o poco informativas del mapa de control.
- Sesgos de datos: al derivar de Stable Diffusion 1.5, hereda los sesgos de su dataset de entrenamiento (representacion de genero, etnia, profesion y cultura), agravados porque el condicionamiento estructural no corrige esos sesgos.
- La licencia Open RAIL impone restricciones de uso en su anexo de prohibiciones; es imprescindible revisarlas antes de un uso comercial y verificar la licencia del checkpoint base empleado.
- La model card oficial esta practicamente vacia, por lo que no hay documentacion del autor sobre datos de entrenamiento, limites conocidos ni evaluacion cuantitativa.
- El repositorio no declara un pipeline ni idiomas, y el numero de descargas figura como 0, lo que sugiere que las metricas del repositorio pueden no estar actualizadas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/lllyasviel/ControlNet-v1-1
- Repositorio de GitHub de ControlNet 1.1 (nightly): https://github.com/lllyasviel/ControlNet-v1-1-nightly
- Repositorio original de ControlNet: https://github.com/lllyasviel/ControlNet
- Paper "Adding Conditional Control to Text-to-Image Diffusion Models": https://arxiv.org/abs/2302.05543
- Pagina del proyecto ControlNet: https://lllyasviel.github.io/ControlNet/
- Documentacion de diffusers sobre ControlNet: https://huggingface.co/docs/diffusers/using-diffusers/controlnet
