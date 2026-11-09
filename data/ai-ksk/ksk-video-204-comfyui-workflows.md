# AI-KSK/ksk-video-204-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-204-comfyui-workflows` no es un modelo de pesos en sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI asociados al episodio 204 del canal AI-KSK, centrado en el modelo de generacion de imagenes Anima Preview 2. El repositorio contiene las notas del tutorial y los grafos JSON que reproducen cuatro pipelines: text-to-image, image-to-image, tiled upscale y un test por lotes de estilos de artista. Segun la model card, el repositorio ocupa 0.0 GB, por lo que no aloja los pesos del UNET, CLIP ni VAE, sino unicamente la documentacion y la configuracion de los nodos.

El modelo subyacente, Anima Preview 2, es un modelo de difusion text-to-image orientado a la generacion de ilustracion anime. Segun los datos del repositorio, utiliza un UNET `anima-preview2.safetensors`, un encoder de texto Qwen 3 0.6B base (`qwen_3_06b_base.safetensors`, declarado con tipo `stable_diffusion`) y el VAE de Qwen Image (`qwen_image_vae.safetensors`). Se trata, por tanto, de un pipeline de difusion que combina un text encoder de la familia Qwen con un VAE de Qwen Image.

La relevancia de este repositorio es practica: documenta parametros concretos de muestreo (pasos, CFG, denoise, samplers) y advierte de conflictos entre lo que dice el video y lo que traen los JSON, ademas de fijar limites claros de resolucion (modelo de clase 1024, con degradacion por encima de ~1 megapixel). No se dispone de informacion sobre arquitectura interna del UNET, numero de parametros ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion text-to-image (UNET + text encoder Qwen 3 0.6B + VAE Qwen Image); detalles internos del UNET no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el text encoder es Qwen 3 0.6B base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | other (sin terminos concretos especificados en la informacion disponible) |
| Formato de pesos | safetensors para UNET, CLIP y VAE; grafos en JSON para ComfyUI |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del UNET de Anima Preview 2 ni su proceso de entrenamiento. Lo que si se documenta es el stack de inferencia: un UNET `anima-preview2.safetensors`, un text encoder `qwen_3_06b_base.safetensors` (0.6B parametros, declarado con tipo `stable_diffusion` en ComfyUI) y el VAE `qwen_image_vae.safetensors`. La combinacion de un text encoder Qwen con un VAE de Qwen Image sugiere una integracion con la familia Qwen Image, aunque la model card no lo confirma explicitamente.

Los grafos incluidos fijan los parametros de muestreo. El grafo text-to-image tiene 14 nodos y dos configuraciones: 20 pasos / CFG 2.5 / denoise 0.65 y 30 pasos / CFG 3 / denoise 1, con sampler `dpmpp_2m_sde_gpu`, scheduler `sgm_uniform` y scale 1.6. El grafo image-to-image tiene 13 nodos con 40 pasos / CFG 3 / denoise 0.75 y scale 1.0486. El tiled upscale tiene 25 nodos con 20 pasos / CFG 2 / denoise 0.25, upscaler `4x_NMKD-Siax_200k` y 3 MP lanczos. El batch style test tiene 16 nodos con dos configuraciones (30 pasos / CFG 3 / denoise 1 y 20 pasos / CFG 2.5 / denoise 0.65). El nodo comunitario Anima-Enhancer se documenta con `block_indices` 345, denoise de 0.5 a 1 (o 0.95/0.9), `enable_spectrum` desactivado por defecto, spectrum 0.2/0.22, 8-12, 0.5 y warm-up 6.

## Capacidades

- Generacion de imagenes text-to-image orientada a ilustracion anime.
- Image-to-image con denoise 0.75 y scale 1.0486 para refinamiento o variacion de imagenes existentes.
- Tiled upscale con upscaler `4x_NMKD-Siax_200k` y objetivo de 3 MP mediante lanczos, para ampliar imagenes por teselas.
- Test por lotes de estilos de artista, con soporte de tags de artista que requieren el prefijo `@`.
- Integracion con el nodo comunitario Anima-Enhancer para mejora adicional con control de `block_indices` y denoise.
- Flujos listos para importar en ComfyUI (grafos JSON con nodos y parametros preconfigurados).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking; no es un modelo de lenguaje.

## Casos de uso

- Generacion de ilustraciones anime desde prompt: usar el grafo text-to-image con 30 pasos / CFG 3 / denoise 1 para obtener una imagen base a partir de una descripcion textual, aprovechando el sampler `dpmpp_2m_sde_gpu` y el scheduler `sgm_uniform`.
- Refinado de bocetos o imagenes existentes: el grafo image-to-image con denoise 0.75 permite reinterpretar una imagen de entrada manteniendo parte de su estructura, util para iterar sobre un concepto ya dibujado.
- Ampliacion de arte final para impresion o publicacion: el grafo tiled upscale con denoise 0.25 y `4x_NMKD-Siax_200k` permite escalar por teselas hasta 3 MP sin rehacer la composicion, evitando costuras si se mantiene el denoise bajo.
- Exploracion de estilos de artista: el grafo batch style test aplica dos configuraciones de muestreo en lote para comparar variantes estilisticas, usando tags con prefijo `@`.
- Produccion de assets para videojuegos o ilustracion editorial: al ser un modelo de clase 1024, es adecuado para sprites, retratos y escenas de hasta ~1 megapixel, que luego se pueden ampliar con el flujo de tiled upscale.
- Prototipado rapido en ComfyUI: importar los JSON directamente para reproducir el episodio sin reconfigurar nodos, util para docencia o para comparar resultados entre las dos configuraciones de muestreo documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (los grafos JSON estan disenados para este entorno); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un pipeline de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de Anima Preview 2 frente a otras alternativas de generacion de imagenes anime.

## Limitaciones y advertencias

- Modelo de clase 1024: la calidad se degrada por encima de aproximadamente 1 megapixel, segun la propia model card.
- Los tags de artista requieren el prefijo `@`; sin el, el tag no se interpreta correctamente.
- En el tiled upscale, un denoise alto provoca costuras visibles entre teselas; se recomienda mantenerlo bajo (0.25 en el JSON).
- Existe un conflicto documentado entre el video (30-50 pasos, CFG 4-5) y los JSON (20-40 pasos, CFG 2.5-3); la propia model card indica reproducir desde el JSON.
- Licencia `other` sin terminos concretos especificados: es necesario consultar las condiciones del autor antes de un uso comercial.
- El repositorio no contiene los pesos del modelo (tamano 0.0 GB); solo incluye notas y grafos, por lo que hay que obtener el UNET, CLIP y VAE por separado.
- No hay informacion sobre sesgos, riesgo de alucinacion visual, limitaciones multilingues (el repo declara solo `en`) ni caveats adicionales de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-204-comfyui-workflows
- RunningHub post 1: https://www.runninghub.ai/post/2033542967683715074/?inviteCode=rh-v1111
- RunningHub post 2: https://www.runninghub.ai/post/2033542974574956546/?inviteCode=rh-v1111
- RunningHub post 3: https://www.runninghub.ai/post/2033542982825152514/?inviteCode=rh-v1111
- RunningHub post 4: https://www.runninghub.ai/post/2033542990416846849/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=lt9sOQ5uD1Y
- Bilibili: https://www.bilibili.com/video/BV1Q1w1zKEwk
