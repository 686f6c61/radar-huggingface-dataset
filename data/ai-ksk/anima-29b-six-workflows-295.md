# AI-KSK/anima-29b-six-workflows-295

## Resumen

`AI-KSK/anima-29b-six-workflows-295` no es un modelo de pesos, sino un paquete de seis grafos de ComfyUI exportados para el checkpoint de difusion `Anima-2.9B-preview-v1.safetensors`. El repositorio contiene unicamente los ficheros JSON de los workflows, seis imagenes promocionales de portada y un manifiesto SHA256; el checkpoint, el VAE, el text encoder y los modelos auxiliares (upscalers, detectores YOLO/SAM, tagger WD14, procesador Qwen3-VL) no estan incluidos. El tamano del repo es de 0.0 GB, coherente con un conjunto de grafos y no con pesos.

El paquete cubre el ciclo completo de trabajo alrededor de un modelo de texto-a-imagen de 2.9B parametros: la linea base oficial de texto-a-imagen, un pase de upscale latente a 1.5x, un render en tres etapas con dos upscales de 1.25x, un redibujado por mosaicos (tiled) a alta resolucion, un flujo de reparacion de caras y manos con detailers, y un image-to-image guiado por caption generado con Qwen3-VL. El autor declara explicitamente que no se ha ejecutado inferencia para este paquete: no hay renders, tiempos, cifras de VRAM ni comparativas de calidad visual.

La relevancia es practica para quien ya trabaja con el checkpoint Anima 2.9B en ComfyUI y quiere reproducir pipelines de muestreo y postprocesado con parametros concretos (28 pasos, CFG 5, sampler `res_multistep`, scheduler `linear_quadratic`) en lugar de partir de cero. No aporta informacion sobre el entrenamiento del modelo base ni sobre su licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete contiene grafos de ComfyUI; el checkpoint base es un modelo de difusion de 2.9B, arquitectura no detallada) |
| Parametros totales | 2.9B (segun el nombre del checkpoint `Anima-2.9B-preview-v1.safetensors`; no verificado en la informacion) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los grafos usan safetensors en fp32 para el VAE; no se documentan cuantizaciones del UNET) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles y los nombres de fichero en chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint, text encoder y VAE); JSON para los workflows; `.pth` para upscaler y SAM; `.pt` para detectores YOLO |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura ni el entrenamiento del checkpoint `Anima-2.9B-preview-v1`. Lo unico documentado es el stack de inferencia que los grafos esperan: el UNET se carga con `UNETLoader`, el text encoder es `qwen_3_06b_base.safetensors` cargado mediante `CLIPLoader` con tipo `stable_diffusion`, y el VAE es `qwen_image_vae.safetensors` cargado con `VAELoaderKJ` en `main_device` y fp32. Es decir, el modelo de difusion se apoya en un encoder de texto basado en Qwen3 de 0.6B y en el VAE de Qwen-Image, lo que sugiere una integracion con el ecosistema Qwen para texto-a-imagen, aunque el autor no lo confirma.

Los grafos documentan los hiperparametros de muestreo oficiales del baseline 2.9B: 28 pasos, CFG 5, sampler `res_multistep` y scheduler `linear_quadratic`. No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas del modelo base. El workflow 01 incluye ademas una ruta alternativa con `SamplerCustomAdvanced`, `KSamplerSelect` euler, `BasicScheduler` `sgm_uniform` a 50 pasos y CFG 8, guardada como referencia pero no activa.

## Capacidades

- Generacion de texto-a-imagen con el checkpoint Anima 2.9B en dos lienzos preconfigurados (1216x832 y 1152x1536) conmutables mediante `ImpactSwitch`.
- Upscale latente a 1.5x con `LatentUpscaleBy` (nearest-exact) y segundo pase de baja denoise (0.35).
- Render en tres etapas con dos upscales de 1.25x y denoise decreciente (1.0, 0.35, 0.3).
- Redibujado por mosaicos a alta resolucion: upscale con `4x_NMKD-Siax_200k`, reescalado a 4.0 MP con lanczos, division en mosaicos 2x2 con solapamiento 0.35 y decodificacion con `VAEDecodeTiled`.
- Reparacion de caras y manos mediante dos nodos `FaceDetailer` con detectores `face_yolov8n`, `hand_yolov8s` y `PitHandDetailer-v2-Test-v9c`, mas `sam_vit_b_01ec64`.
- Image-to-image guiado por caption generado con un procesador Qwen3-VL, con denoise 0.7 y reescalado a ~1.05 MP multiple de 64.
- Etiquetado automatico de imagenes con `WD14Tagger|pysssss` (wd-eva02-large-tagger-v3) para construir prompts en el flujo de redibujado.
- No se documenta soporte de tool calling, agentes, audio ni modo de razonamiento; son capacidades ajenas al proposito del paquete.

## Casos de uso

- Reproduccion del baseline oficial de Anima 2.9B: cargar el workflow 01 con el checkpoint, el encoder y el VAE indicados para obtener una linea base de texto-a-imagen con los hiperparametros oficiales (28/5/res_multistep/linear_quadratic) y comparar contra variantes propias.
- Produccion de ilustraciones a resolucion media-alta: encadenar el workflow 02 (base 1024x1024 mas upscale 1.5x con denoise 0.35) para obtener imagenes de mayor tamano sin reentrenar ni cambiar de checkpoint.
- Render final de alta calidad: usar el workflow 03 con tres pases y dos upscales de 1.25x cuando se necesita detalle fino y se dispone de tiempo de GPU suficiente para tres pasadas de muestreo.
- Restauracion y ampliacion de imagenes existentes: el workflow 04 permite subir una imagen a 4.0 MP, dividirla en mosaicos con solapamiento y redibujar a denoise 0.20, util para recuperar detalle en material de baja resolucion sin rehacer la composicion.
- Retoque de retratos y figuras humanas: el workflow 05 aplica detailers de cara y manos tras el pase base y el upscale, adecuado para corregir artefactos tipicos en manos y rostros en ilustracion de personajes.
- Variaciones controladas de una imagen de referencia: el workflow 06 genera un caption con Qwen3-VL y lo usa como prompt efectivo en un img2img a denoise 0.7, lo que sirve para explorar variaciones manteniendo la estructura de la imagen original.
- Construccion de pipelines propios en ComfyUI: los seis grafos sirven como plantilla de referencia para integrar upscalers, taggers y detectores en cadenas mas largas, reutilizando los valores de sampler ya validados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto inferencia para este paquete: no hay tiempos, cifras de VRAM ni comparativas de calidad visual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras. Como referencia estructural, un UNET de 2.9B en fp16 ronda los 6 GB de pesos, a los que hay que sumar el encoder Qwen3 de 0.6B y el VAE de Qwen-Image en fp32; el workflow 04 ademas trabaja a 4.0 MP con decodificacion por mosaicos, lo que incrementa el pico de memoria. Estas cifras son estimaciones por tamano, no medidas del paquete.
- GPU recomendadas: no disponible en la informacion. No se documenta ninguna GPU concreta.
- Viabilidad en GPU de consumo: no confirmada. Por tamano de pesos, un UNET de 2.9B es candidato a caber en GPUs de consumo con 12-16 GB, pero los pases de upscale a 4.0 MP y la decodificacion por mosaicos pueden exceder esa capacidad; no hay datos que lo confirmen.
- Opciones de despliegue: ComfyUI es el unico entorno soportado por los grafos. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento del checkpoint Anima 2.9B frente a alternativas. El paquete es un conjunto de workflows, no un modelo publicable con metricas propias.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin `Anima-2.9B-preview-v1.safetensors`, `qwen_3_06b_base.safetensors` y `qwen_image_vae.safetensors` los grafos no se pueden ejecutar. Tampoco se incluyen el upscaler `4x_NMKD-Siax_200k`, los detectores YOLO/SAM ni el tagger WD14.
- No se ha ejecutado inferencia: no hay evidencia de que los grafos funcionen tal cual, ni de la calidad de los resultados.
- Licencia no disponible: no se puede determinar si el uso comercial del checkpoint o de los workflows esta permitido. Verificar antes de cualquier despliegue en produccion.
- Los prompts de ejemplo son residuos de demostracion del autor (escena de dos personajes estilo Genshin en el workflow 01, "dog" en el 06) y deben sustituirse.
- El workflow 06 depende de un nodo Qwen3-VL para generar el caption; sin ese componente el flujo de img2img no produce el prompt efectivo.
- El workflow 03 referencia en el texto original un identificador de publicacion obsoleto; el autor indica que el id vigente es `2089668746540572673`.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados para el checkpoint base en la informacion disponible.
- Idiomas: no se documenta soporte multilingue; los prompts de ejemplo estan en ingles y los nombres de fichero en chino.
- El paquete esta marcado como preview (`preview-v1`), lo que implica que el checkpoint subyacente puede cambiar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AI-KSK/anima-29b-six-workflows-295
- RunningHub internacional, workflow 01: https://www.runninghub.ai/zh-cn/post/2089581532066443265?inviteCode=rh-v1111
- RunningHub China, workflow 01: https://www.runninghub.cn/post/2089581532066443265/?inviteCode=rh-
- RunningHub, workflow 03 (id vigente): https://www.runninghub.cn/post/2089668746540572673
- Enlaces de RunningHub internacional y China para los workflows 02, 04, 05 y 06, y enlace de Civitai: no disponibles en la informacion proporcionada.
