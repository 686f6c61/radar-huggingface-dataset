# AI-KSK/krea2-advanced-cleanup-280

## Resumen

AI-KSK/krea2-advanced-cleanup-280 no es un modelo de lenguaje ni un checkpoint de difusión, sino un paquete de tres grafos de ComfyUI exportados en formato JSON para una tarea concreta de restauración y ampliación de imágenes ("cleanup" o "洗图"). Los tres flujos comparten la misma receta: invertir el prompt a partir de la imagen de entrada, reconstruirla mediante tres etapas de control de profundidad con un único LoRA estructural y aplicar un reescalado final con 4x-UltraSharp. La diferencia entre ellos está únicamente en la capa de entrada/salida: imagen única, bucle sobre carpeta local o lote ZIP en la plataforma RunningHub.

El autor, AI-KSK, distribuye los archivos como exportaciones fuente más un manifiesto SHA256, sin incluir el checkpoint Krea 2, el LoRA de estructura, el modelo de profundidad, el upscaler ni las rutas VLM necesarias para ejecutarlos. La model card declara explícitamente que no se ha ejecutado ninguna inferencia para este paquete: no hay renders, tiempos, cifras de VRAM ni comparativas de calidad visual. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

Por tanto, la relevancia de esta ficha es acotada: sirve para documentar un artefacto de orquestación reproducible en ComfyUI, no para evaluar un modelo generativo. Cualquier evaluación de capacidades, rendimiento o hardware debe remitirse a los componentes externos que los grafos invocan y que no forman parte de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene grafos de ComfyUI en JSON, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el componente VLM Qwen3VL 4B se referencia externamente) |
| Tipos de cuantizacion | no disponible como modelo; los grafos referencian `krea2_turbo_fp8.safetensors`, `qwen3vl_4b_fp8_scaled.safetensors` y `qwen_image_HDR_vae_fp32_comfy.safetensors` |
| Idiomas soportados | no disponible (los nombres de nodos y notas internas estan en chino e ingles) |
| Licencia | no disponible; la model card indica que no se afirma ninguna licencia comercial o de redistribucion global |
| Formato de pesos | JSON de ComfyUI (grafos); el manifiesto `SHA256SUMS.json` cubre workflows y portadas |

## Arquitectura y entrenamiento

No aplica en sentido estricto: el artefacto no contiene un modelo entrenado. Lo que define la "arquitectura" es la topologia de los grafos. Los tres flujos comparten un `UNETLoader` sobre `krea2_turbo_fp8.safetensors`, un `CLIPLoader` sobre `qwen3vl_4b_fp8_scaled.safetensors` con tipo `krea2` y un `VAELoader` sobre `qwen_image_HDR_vae_fp32_comfy.safetensors`. El control estructural se implementa con un único LoRA (`depth-control-lora.safetensors`) cargado mediante `Krea2ControlLoRALoader` a fuerza 1.0, aplicado en tres pares `Krea2ControlImageEncode` → `Krea2ControlApply` con nodos de profundidad DA3 y preprocesado configurado en match-latent-size, lanczos, center, escala de grises y min-max por imagen.

El muestreo se reparte en tres KSamplers con 8 pasos, CFG 1, sampler `euler` y scheduler `simple`, con valores de denoise de 0.55 o 0.95 en la etapa base, 0.35 en la intermedia y 0.25 en la final. Los nodos `LatentUpscale` heredados quedan guardados como deshabilitados; el reescalado efectivo se hace con `UpscaleModelLoader` sobre 4x-UltraSharp más `ImageUpscaleWithModel`. La inversión de prompt se resuelve por dos rutas alternativas seleccionables desde la consola: `Qwen3VLProcessor` (ruta abierta) o `RH_LLMAPI_Pro_Node` (ruta cerrada, etiquetada GLM-4.6V). No hay información sobre datos de entrenamiento, tokens, RLHF o DPO porque no se entrena ningún componente en este paquete.

## Capacidades

- Restauración y reconstrucción de imágenes guiada por profundidad en tres etapas con un LoRA estructural único, sin juego de presets.
- Inversión automática de prompt a partir de la imagen de entrada, con dos rutas VLM conmutables (Qwen3VL abierta o GLM-4.6V vía API).
- Control de etapas de render (dos o tres), borde largo final (2048, 3072 o 4096, con aspect ratio preservado y alineación a 64), bloqueo de estructura y refuerzo de píxel.
- Procesamiento por imagen única (grafo 01, 51 nodos y 89 enlaces).
- Procesamiento por lotes sobre carpeta local con bucle `easy loadImagesForLoop` + `easy forLoopEnd` + `easy batchAnything`, con prompt, dimensionado y codificación de profundidad independientes por imagen (grafo 02, 57 nodos y 98 enlaces).
- Procesamiento por lotes ZIP en RunningHub mediante `RHUploadZip`, `RHBatchImages` y `RH_ExtractImage` (grafo 03, 66 nodos y 109 enlaces).
- No incluye tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo thinking propios; esas capacidades dependerían de los componentes externos referenciados.

## Casos de uso

- Restauración de fotografía de producto: cargar una imagen en el grafo 01, fijar borde largo en 2048 y dejar que la inversión de prompt y las tres pasadas de profundidad reconstruyan detalle antes del upscale 4x-UltraSharp. Es el punto que la propia nota del grafo describe como mejor relación calidad-coste.
- Ampliación de material de archivo para impresión: usar el grafo 01 con borde largo 3072 o 4096 cuando se necesite resolución alta, asumiendo el aumento de VRAM y coste que advierte la nota interna.
- Procesado por lotes de un catálogo de imágenes en una máquina propia: emplear el grafo 02 con el bucle `easy loadImagesForLoop`, que trata cada imagen de forma independiente en prompt, tamaño y codificación de profundidad, con salida en `Krea2_本地批量洗图/Krea2_batch`.
- Limpieza masiva en infraestructura ajena sin GPU local: usar el grafo 03 subiendo un ZIP que contenga solo jpg, jpeg, png o webp e indicando el número exacto de imágenes para que el grafo derive el rango 0..(n-1).
- Integración en un pipeline de preprocesado de datasets visuales: los JSON pueden inspeccionarse y versionarse, y el manifiesto SHA256 permite verificar que los grafos y las portadas no han sido alterados antes de incorporarlos a un repositorio interno.
- Evaluación comparativa de rutas VLM: la consola permite alternar entre `Qwen3VLProcessor` y `RH_LLMAPI_Pro_Node` sobre el mismo conjunto de imágenes para medir diferencias de calidad en la inversión de prompt.
- Docencia o replicación de flujos ComfyUI: los tres grafos sirven como referencia de una topología concreta (tres etapas de control de profundidad, un LoRA, upscale final) sin necesidad de ejecutar inferencia para estudiar su estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se ejecutó inferencia para este paquete: no hay render, ni tiempos, ni cifra de VRAM, ni comparación de calidad visual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no aporta cifras y advierte que 3072 y 4096 de borde largo elevan la VRAM y el coste de forma notable frente a 2048.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende de los componentes externos (`krea2_turbo_fp8`, `qwen3vl_4b_fp8_scaled`, VAE fp32 y modelo de profundidad DA3), no incluidos en el repositorio.
- Opciones de despliegue: ComfyUI con los nodos `Krea2ControlLoRALoader`, `Krea2ControlImageEncode`, `Krea2ControlApply`, `ConditioningKrea2Rebalance`, `ComfyUI-Krea2T-Enhancer` y los nodos `easy` para el bucle de lote. El grafo 03 requiere además la plataforma RunningHub, fuera de la cual los nodos `RH*` no resuelven.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Criterio | AI-KSK/krea2-advanced-cleanup-280 | Alternativas de restauracion/upscale en ComfyUI | Modelos de difusion completos |
|---|---|---|---|
| Naturaleza | Grafos JSON de orquestacion | Flujos publicados en Civitai o foros | Checkpoints con pesos |
| Pesos incluidos | No | Habitualmente no | Si |
| Parametros | no disponible | no disponible | Depende del modelo |
| Contexto | no disponible | no disponible | no disponible |
| Licencia | no disponible; sin licencia comercial afirmada | Variable por autor | Variable por modelo |
| Reproducibilidad | Manifiesto SHA256 de workflows y portadas | Rara vez verificable | Verificable por hash de pesos |
| Ejecucion online | Solo el grafo 03, via RunningHub | Depende del autor | Segun plataforma |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El repositorio no contiene ningún peso: sin el checkpoint Krea 2, el LoRA de estructura, el modelo de profundidad DA3, el upscaler 4x-UltraSharp y las rutas VLM, los grafos no se pueden ejecutar.
- No se ha ejecutado inferencia para este paquete; no existen evidencias publicadas de calidad visual, tiempos ni consumo de VRAM.
- La licencia no está disponible y la model card indica que no se afirma ninguna licencia comercial o de redistribución global. Deben verificarse por separado los derechos del workflow, los nodos, el modelo, el LoRA, el modelo de profundidad, el upscaler, la ruta VLM, la imagen de entrada y las portadas.
- Las portadas promocionales son fotogramas fuente, no salidas de estos grafos; no deben usarse como muestra de resultados.
- El grafo 02 es solo local y no tiene página en RunningHub; la nota interna del grafo dice "线上批量版" (lote online), lo que constituye una inconsistencia de estado guardado: el grafo es la fuente autoritativa y la nota está obsoleta.
- El grafo 03 depende de RunningHub: fuera de esa plataforma los nodos `RH*` no resuelven y el flujo no funciona.
- Los enlaces a RunningHub incluyen el código de invitación del autor (`rh-v1111`); inspeccionar los flujos no requiere cuenta, pero ejecutarlos online sí.
- La ruta cerrada `RH_LLMAPI_Pro_Node` (GLM-4.6V) introduce una dependencia de API externa cuya disponibilidad, coste y política de datos no se documentan.
- Riesgo de alucinación en la inversión de prompt: el texto reconstruido por el VLM puede introducir elementos no presentes en la imagen original y condicionar la reconstrucción.
- No hay información sobre sesgos, cobertura idiomática ni comportamiento en dominios distintos del fotográfico.
- El repositorio registra 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que es coherente con un paquete de solo grafos pero no aporta señal de validación por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AI-KSK/krea2-advanced-cleanup-280
- RunningHub internacional, grafo 01 (imagen única): https://www.runninghub.ai/zh-cn/post/2078868402176872450?inviteCode=rh-v1111
- RunningHub China, grafo 01: https://www.runninghub.cn/post/2078868402176872450/?inviteCode=rh-v1111
- Civitai, grafo 01: https://civitai.com/models/3033257
- Civitai, grafo 02 (lote local): https://civitai.com/models/3033259
- RunningHub internacional, grafo 03 (lote online): https://www.runninghub.ai/zh-cn/post/2078868414222913537?inviteCode=rh-v1111
- RunningHub China, grafo 03: https://www.runninghub.cn/post/2078868414222913537/?inviteCode=rh-v1111
- Civitai, grafo 03: https://civitai.com/models/3033261
- Tutorial en YouTube: https://www.youtube.com/watch?v=j6EZ2I07fYs
- Tutorial en Bilibili: https://www.bilibili.com/video/BV1i7KU62Esg
- DeepAI (resultado de búsqueda web, sin relación directa con el paquete): https://deepai.org/
