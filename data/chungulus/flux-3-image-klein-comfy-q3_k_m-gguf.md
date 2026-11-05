# Chungulus/flux-3-image-klein-comfy-Q3_K_M-GGUF

## Resumen

FLUX 3 Image Klein distilled es un modelo de difusion para generacion y edicion de imagenes desarrollado por Black Forest Labs (BFL). Este repositorio concreto, publicado por el usuario Chungulus, es una cuantizacion GGUF Q3_K_M del transformer de imagenes destilado, extraido del paquete original BF16 para ComfyUI. El transformer cuantizado tiene 5.548.681.984 parametros y el repositorio ocupa 2,5 GB. No es una release oficial de BFL, sino un derivado comunitario modificado e independiente.

El modelo resuelve dos tareas principales: generacion de imagenes a partir de texto (text-to-image) y edicion de imagenes con imagenes de referencia (image-to-image / image editing). Su relevancia radica en que permite ejecutar el transformer de FLUX 3 en formato GGUF de 3 bits dentro de ComfyUI mediante la extension ComfyUI-GGUF, reduciendo los requisitos de memoria frente al checkpoint BF16 original, a costa de una perdida de calidad no cuantificada.

La cuantizacion afecta unicamente al transformer de difusion. El text encoder, el prompt upsampler y el VAE no estan cuantizados en este repositorio y deben tomarse del paquete original. La licencia aplicable es la FLUX Kommunity License, no una licencia permisiva, y el autor no reclama derechos de uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (image transformer) destilado, integrado en el pipeline FLUX 3 |
| Parametros totales | 5.548.681.984 (transformer cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen) |
| Tipos de cuantizacion | GGUF Q3_K_M (unica variante en este repositorio) |
| Idiomas soportados | no disponibles |
| Licencia | FLUX Kommunity License (flux-kommunity-license) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 2,5 GB |
| Pipeline | image-to-image |
| Libreria | gguf |
| Modelo base | black-forest-labs/flux-3-image-klein-comfy |
| Companion models | text_encoders/qwen3vl_4b_bf16.safetensors, vae/flux2-vae.safetensors (no cuantizados, del paquete original) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion destilado (distilled image transformer) que forma parte del pipeline FLUX 3 de Black Forest Labs. La cuantizacion Q3_K_M se aplico exclusivamente a los pesos de este transformer; el resto de componentes del pipeline (text encoder Qwen3-VL 4B en BF16, VAE flux2-vae y prompt upsampler) se mantienen en su precision original.

Segun la model card, los pesos BF16 originales se usaron de forma independiente para cada formato de cuantizacion, sin recuantizar a partir de fuentes de baja precision y sin matriz de calibracion ni de importancia. Se verificaron los nombres y formas de todos los tensores cuantizados y los payloads del origen durante la conversion. ComfyUI detecta la red FLUX 3 real a partir de los nombres de tensores preservados. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el pipeline FLUX 3.
- Edicion de imagenes con imagenes de referencia (image-to-image), adjuntando referencias a traves de ReferenceMultiLatent.
- Integracion nativa con ComfyUI mediante la extension ComfyUI-GGUF y el nodo Unet Loader (GGUF).
- Soporte de prompt upsampling para prompts cortos mediante el upsampler original o un LLM de expansion de caption.
- Acepta captions de escena completamente expandidos de forma directa.
- No es un modelo de generacion de texto: el GGUF de difusion se consume desde ComfyUI-GGUF, no desde la CLI de llama.cpp.
- Soporte de tool calling, agentes, razonamiento o capacidades multilingues: no disponible (no aplica a un modelo de difusion de imagenes).

## Casos de uso

- Generacion de imagenes en local con ComfyUI: cargar el GGUF en `ComfyUI/models/unet/` con Unet Loader (GGUF) y generar imagenes text-to-image con el pipeline FLUX 3, reduciendo el uso de memoria del transformer frente al BF16.
- Edicion de imagenes con referencia: adjuntar imagenes de referencia mediante ReferenceMultiLatent para modificar escenas manteniendo coherencia con la referencia, con los ajustes validados de 512 x 512, 16 pasos, Euler/simple, CFG 1.0 y alpha 16.
- Prototipado rapido en estaciones de trabajo con VRAM limitada: la cuantizacion Q3_K_M y el tamano de 2,5 GB del repositorio permiten iterar sobre prompts y ediciones sin cargar el checkpoint BF16 completo del transformer.
- Creacion de assets para desarrollo de videojuegos o aplicaciones: generacion de conceptos visuales y variaciones de imagen a partir de captions expandidos, integradas en flujos de ComfyUI.
- Automatizacion de pipelines de imagen en ComfyUI: encadenar nodos de carga GGUF, text encoder y VAE para producir lotes de imagenes o ediciones de forma reproducible.
- Experimentacion e investigacion: comparar la calidad de la cuantizacion Q3_K_M frente al BF16 original en tareas de generacion y edicion, usando los ficheros `validation.json` y `quantizatia-manifest.json` como referencia de ajustes y limites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comprobaciones de validacion son pruebas funcionales limitadas (una muestra text-to-image y una edicion por artefacto) y no un benchmark ni una garantia de calidad de imagen sin cambios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El transformer cuantizado ocupa aproximadamente 2,5 GB, a lo que hay que sumar el text encoder Qwen3-VL 4B en BF16, el VAE y el prompt upsampler, que no estan cuantizados.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el formato GGUF y el tamano reducido del transformer sugieren que puede ser viable en GPU de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: ComfyUI con soporte nativo de FLUX 3 y la extension ComfyUI-GGUF (nodo Unet Loader (GGUF)). No es compatible con llama.cpp para generacion de texto.
- Latencia y throughput: no disponibles.
- Ajustes de inferencia validados: 512 x 512, 16 pasos, sampler Euler/simple, CFG 1.0, alpha 16 (ModelSamplingFlux shift `log(16)`).

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chungulus/flux-3-image-klein-comfy-Q3_K_M-GGUF | 5.548.681.984 | GGUF | Q3_K_M | FLUX Kommunity License | HuggingFace (comunidad) |
| black-forest-labs/flux-3-image-klein-comfy (BF16 original) | 5.548.681.984 | safetensors (BF16) | Sin cuantizar | FLUX Kommunity License | HuggingFace (oficial BFL) |
| Otras cuantizaciones GGUF del mismo transformer | 5.548.681.984 | GGUF | Distintos niveles (no disponibles en esta informacion) | FLUX Kommunity License | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un derivado comunitario modificado e independiente; no es una release oficial ni esta respaldado por Black Forest Labs.
- La cuantizacion Q3_K_M puede degradar la calidad de imagen frente al BF16 original; no se ha cuantificado esa perdida y la validacion realizada es una comprobacion funcional limitada.
- No se uso matriz de calibracion ni de importancia en la cuantizacion.
- Solo se cuantiza el transformer; el text encoder, el VAE y el prompt upsampler deben obtenerse del paquete original y se ejecutan en su precision original, lo que incrementa los requisitos de memoria totales.
- La licencia FLUX Kommunity License impone condiciones de uso y distribucion; el autor no reclama uso comercial sin restricciones. Los terceros reciben los derechos directamente de Black Forest Labs, no como sublicencia de Chungulus.
- El modelo no es un modelo de texto: no soporta generacion de texto, tool calling ni agentes, y no debe usarse con llama.cpp.
- Riesgo de sesgos y alucinacion visual: no disponible en la informacion proporcionada; aplican los sesgos propios del dataset de entrenamiento original de FLUX 3, no documentados aqui.
- Idiomas soportados: no disponibles.
- En el momento de la consulta el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/flux-3-image-klein-comfy-Q3_K_M-GGUF
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Revision del paquete original referenciada: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy/tree/9d36114cf7a2e03a45c28f5cc4987d20ebfdb6c1
- Extension ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Licencia (LICENSE.md en el repositorio): https://huggingface.co/Chungulus/flux-3-image-klein-comfy-Q3_K_M-GGUF/blob/main/LICENSE.md
- Aviso de atribucion (NOTICE.md en el repositorio): https://huggingface.co/Chungulus/flux-3-image-klein-comfy-Q3_K_M-GGUF/blob/main/NOTICE.md
