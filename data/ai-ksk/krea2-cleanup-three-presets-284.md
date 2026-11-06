# AI-KSK/krea2-cleanup-three-presets-284

## Resumen

Krea 2 Cleanup 2.6 es un paquete de tres flujos de trabajo (workflows) para ComfyUI publicados por el usuario AI-KSK en Hugging Face bajo el identificador `AI-KSK/krea2-cleanup-three-presets-284`. No se trata de un modelo de pesos entrenado, sino de un conjunto de grafos JSON de ComfyUI orientados a la limpieza y repintado de imágenes ("洗图", literalmente "lavado de imagen") mediante control de profundidad en tres etapas. Los tres grafos comparten una misma receta de limpieza construida sobre un pase RAW de alto ruido y pases Turbo de ruido medio y bajo, con un único número de preset que modifica simultáneamente los valores de denoise, los checkpoints Split, el CFG del pase RAW y las intensidades del LoRA de profundidad.

El repositorio tiene un tamaño de 0.0 GB y contiene únicamente los archivos JSON de los flujos de trabajo, tres imágenes promocionales de portada y un manifiesto SHA256. Los pesos del modelo base (`krea2_raw`, `krea2_turbo_fp8`), el LoRA de control de profundidad y el modelo de profundidad DA3 no están incluidos en el paquete, por lo que el repositorio no es autosuficiente para ejecutar inferencia. La model card indica explícitamente que no se ha ejecutado ninguna inferencia para este paquete: no hay renders, ni mediciones de tiempo, ni cifras de VRAM, ni comparativas de calidad visual.

La relevancia de este paquete es documental y de automatización: ofrece tres variantes de entrada/salida (lote desde carpeta local, lote en línea mediante RunningHub y una sola imagen) sobre un mismo núcleo técnico de tres etapas con control de profundidad, lo que permite a desarrolladores e investigadores inspeccionar una implementación concreta de un pipeline de repintado condicionado por profundidad en ComfyUI. No obstante, al carecer de pesos, licencia declarada y métricas, su utilidad práctica queda limitada a servir como referencia de estructura de grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (paquete de flujos de trabajo ComfyUI en JSON; no es un modelo con pesos propios) |
| Parametros totales | No disponible (los pesos no estan incluidos en el repositorio) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los flujos referencian `krea2_raw`, `krea2_raw_bf16_0630`, `krea2_turbo_fp8`, CLIP `qwen3vl_4b_fp8_scaled.safetensors` y VAE `qwen_image_HDR_vae_fp32_comfy.safetensors`, pero no se incluyen) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No aplica (el repositorio contiene JSON de workflows, imagenes PNG de portada y `SHA256SUMS.json`; tamano del repo: 0.0 GB) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura de red neuronal propia, sino que orquesta modelos externos dentro de ComfyUI. La columna vertebral compartida por los tres grafos consta de tres etapas condicionadas por profundidad, cada una con un par `Krea2ControlImageEncode` → `Krea2ControlApply` (alto ruido, ruido medio y tamano final) y tres nodos `Krea2ControlLoRALoader` sobre `depth-control-lora.safetensors` con intensidades de 1.00, 0.85 y 0.65, valores dirigidos por el preset. Además, cada grafo incluye tres nodos `LoraLoaderModelOnly` apuntando al mismo archivo LoRA con intensidad 0, que son ranuras vacías y desactivadas, no LoRAs activos.

El modelo base es dual: `krea2_raw` (o `krea2_raw_bf16_0630` en la variante en línea) ejecuta la etapa de conformación de alto ruido, mientras que `krea2_turbo_fp8` ejecuta las etapas media y baja. El texto y el VAE se gestionan con CLIP `qwen3vl_4b_fp8_scaled.safetensors` (tipo `krea2`) y VAE `qwen_image_HDR_vae_fp32_comfy.safetensors`. La generación de profundidad se realiza dentro del grafo mediante los nodos DA3 (`LoadDA3Model`, `DA3Inference`, `DA3Render`), con codificación `match_latent_size`, lanczos, centrado, escala de grises y normalización min/max por imagen. El muestreo usa tres nodos `SamplerCustomAdvanced` que comparten un `SamplerEulerAncestral` (1, 1) con un programa RAW/Turbo de 36 pasos y denoise 0.92, un refinamiento de upscale Turbo de 10 pasos y denoise 0.35, y un KSampler intermedio activo de 10 pasos, CFG 1, `euler_ancestral`, `simple` y denoise 0.40. Los KSamplers heredados (8 pasos 0.95/0.90, 10 pasos 0.30, 8 pasos 0.34) se guardan desactivados. El upscale combina `UpscaleModelLoader` 4x-UltraSharp con `ImageUpscaleWithModel` y dos nodos `LatentUpscale`.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, ya que el paquete no entrena ningún modelo. La innovación técnica destacable es el "dial de preset": un entero (0 = control estricto y fiel, 1 = equilibrado por defecto, 2 = repintado divergente de alto ruido) que conmuta automáticamente los tres valores de denoise, los checkpoints Split, el CFG del pase RAW y las intensidades del LoRA de profundidad; el preset 2 fija el LoRA de profundidad a 0.

## Capacidades

- Limpieza y repintado de imágenes condicionado por mapas de profundidad generados en el propio grafo mediante los nodos DA3.
- Control de fidelidad mediante un único parámetro de preset (0, 1, 2) que ajusta denoise, checkpoints, CFG y fuerza del LoRA de profundidad de forma conjunta.
- Procesamiento por lotes desde una carpeta local, con nodos `easy loadImagesForLoop`, `easy forLoopEnd` y `easy batchAnything`.
- Procesamiento por lotes en línea a través de la plataforma RunningHub, con nodos `RHUploadZip`, `RHBatchImages:`, `RH_ExtractImage` y `RH_LLMAPI_Pro_Node` para carga de ZIP, extracción por lotes y ruta de caption/LLM.
- Procesamiento de una sola imagen con un nodo `LoadImage`.
- Upscale integrado con el modelo 4x-UltraSharp y dos nodos `LatentUpscale`.
- Rebalanceo de condicionamiento mediante `ConditioningKrea2Rebalance`, activo en la variante de lote local y desactivado en la variante de imagen única.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Restauración por lotes de un archivo fotográfico: la variante 01 apunta el cargador de bucle a una carpeta y aplica la receta de tres etapas con el preset deseado, permitiendo procesar colecciones completas sin intervención manual por imagen.
- Limpieza de imágenes individuales en un flujo de edición: la variante 03 carga una sola imagen, permite elegir el preset y suministrar o extraer el prompt, adecuada para retoque puntual con control de fidelidad.
- Automatización en la nube sin infraestructura local: la variante 02 sube un ZIP a RunningHub, extrae las imágenes por lotes y ejecuta el mismo núcleo de tres etapas, útil para equipos sin GPU propia.
- Generación de mapas de profundidad como subproducto: los nodos DA3 (`LoadDA3Model`, `DA3Inference`, `DA3Render`) producen mapas de profundidad dentro del grafo, reutilizables en otros pipelines de condicionamiento.
- Estudio de pipelines de repintado condicionado: los tres JSON permiten inspeccionar cómo se estructura un control de profundidad multi-etapa con conmutación de presets, sirviendo como referencia para desarrolladores que diseñen grafos similares.
- Integración de captioning automático: la variante 02 incluye `RH_LLMAPI_Pro_Node`, que abre una ruta de generación automática de descripciones para alimentar el condicionamiento de texto.
- Comparación de estrategias de entrada/salida: disponer de las tres variantes (local, en línea, imagen única) facilita evaluar el mismo núcleo técnico bajo distintos modos de operación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ejecutó inferencia para este paquete y que no hay render, tiempos, cifras de VRAM ni comparativas de calidad visual.

## Requisitos de hardware

- VRAM estimada: no disponible; la model card no proporciona cifras de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (los tres grafos son archivos JSON de ComfyUI); la variante 02 requiere además la plataforma RunningHub y sus nodos específicos, que no se resuelven fuera de ella.
- Latencia y throughput: no disponibles.
- Dependencias no incluidas: pesos `krea2_raw`, `krea2_raw_bf16_0630` y `krea2_turbo_fp8`, LoRA `depth-control-lora.safetensors`, CLIP `qwen3vl_4b_fp8_scaled.safetensors`, VAE `qwen_image_HDR_vae_fp32_comfy.safetensors`, modelo de profundidad DA3 y modelo de upscale 4x-UltraSharp.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada paquetes de flujos de trabajo comparables con parámetros, contexto, rendimiento, licencia y disponibilidad verificables.

## Limitaciones y advertencias

- El repositorio no incluye pesos, LoRA ni modelo de profundidad; sin ellos los flujos no son ejecutables.
- No se declara licencia, lo que impide determinar las condiciones de uso comercial.
- No se han ejecutado inferencias ni publicado métricas: no hay evidencia de calidad, latencia o consumo de VRAM.
- La variante 02 depende de nodos propios de RunningHub (`RHUploadZip`, `RHBatchImages:`, `RH_ExtractImage`, `RH_LLMAPI_Pro_Node`) que no se resuelven fuera de esa plataforma; es una instantánea guardada, no una garantía de instalación.
- Los enlaces de RunningHub incluyen el código de invitación del autor (`rh-v1111`); inspeccionar los flujos no requiere cuenta, pero ejecutarlos en línea sí.
- Los tres nodos `LoraLoaderModelOnly` con intensidad 0 son ranuras vacías y desactivadas; no deben describirse como LoRAs activos.
- Los KSamplers heredados están guardados desactivados; su presencia en el JSON no implica que se ejecuten.
- La model card advierte de que el encuadre del vídeo tutorial sobre "flujo de trabajo comercial de nivel miembro", tres presets y "RAW+Turbo alto/bajo ruido" es descripción del autor y no fue reproducido de forma independiente.
- Debe verificarse por separado la titularidad de derechos del flujo de trabajo, los nodos, el modelo, el LoRA, el modelo de profundidad, la imagen de entrada y la portada.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, al no ser un modelo de lenguaje; el riesgo relevante es la falta de validación empírica del pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/krea2-cleanup-three-presets-284
- RunningHub internacional (01, lote local): https://www.runninghub.ai/zh-cn/post/2080681468573085697?inviteCode=rh-v1111
- RunningHub China (01, lote local): https://www.runninghub.cn/post/2080681468573085697/?inviteCode=rh-v1111
- Civitai (01): https://civitai.com/models/3033105
- RunningHub internacional (02, lote en línea): https://www.runninghub.ai/zh-cn/post/2080681462248071170?inviteCode=rh-v1111
- RunningHub China (02, lote en línea): https://www.runninghub.cn/post/2080681462248071170/?inviteCode=rh-v1111
- Civitai (02): https://civitai.com/models/3033108
- RunningHub internacional (03, imagen única): https://www.runninghub.ai/zh-cn/post/2080681456040501249?inviteCode=rh-v1111
- RunningHub China (03, imagen única): https://www.runninghub.cn/post/2080681456040501249/?inviteCode=rh-v1111
- Civitai (03): https://civitai.com/models/3033112
- Tutorial en YouTube: https://www.youtube.com/watch?v=aCEuir7zy-w
- Tutorial en Bilibili: https://www.bilibili.com/video/BV1GBgi6JEwL
