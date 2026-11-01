# AI-KSK/minimax-h3-depth-video-311

## Resumen

`AI-KSK/minimax-h3-depth-video-311` no es un modelo de pesos en sentido estricto, sino un repositorio de artefactos para ComfyUI publicado por el usuario AI-KSK. Contiene dos flujos de trabajo JSON independientes orientados a la generación de vídeo guiada por profundidad con el modelo MiniMax H3 (variante OpenVDN) y a la extracción de mapas de profundidad a partir de vídeo mediante dos rutas alternativas: VDA (Video Depth Anything) y DepthCrafter.

El primer flujo (01, 35 nodos y 47 enlaces) utiliza una secuencia de profundidad revisada como referencia de vídeo nativa dentro de MiniMax H3, combinando los compositores OpenVDN/vdn-minimax-h3 y la etapa `stage_dmd_8nfe`. El segundo flujo (02, 9 nodos y 10 enlaces) exporta clips de profundidad en H.264 MP4 (yuv420p, CRF 19) que después se cargan manualmente en el primer flujo; no existe transferencia automática entre grafos.

El interés del repositorio es acotado: sirve como plantilla reproducible de un pipeline de profundidad a vídeo para usuarios de ComfyUI que ya dispongan de los modelos MiniMax H3 y de los nodos personalizados necesarios. El autor advierte explícitamente de que no se han realizado verificaciones de inferencia, tiempos, calidad visual o sonora, ni comprobaciones de licencia, y de que los archivos de modelo y los medios de entrada no están incluidos en el repositorio, cuyo tamaño es de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene flujos de ComfyUI, no pesos de un modelo propio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los flujos referencian checkpoints int8, nvfp4_awq, fp32 e int8_convrot) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los archivos referenciados son `.safetensors` y `.pth`; el repositorio en si contiene JSON y PNG) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo propia en el repositorio. Los flujos hacen referencia a componentes externos: `minimax_h3_hybrid_fl2va_ref2va_zs05_b25-49_int8.safetensors`, `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`, `minimax_h3_video_vae_int8_convrot.safetensors`, `minimax_h3_audio_vae_fp32.safetensors` y `video_depth_anything_vits.pth`. El flujo 01 emplea el compositor `OpenVDN/vdn-minimax-h3` con la etapa `stage_dmd_8nfe`; el autor aclara que DMD8 no es una medida de NFE ni un resultado de tiempos, sino una etiqueta de etapa.

En el flujo 02, la ruta DepthCrafter se configura con `max_res` 512, 10 pasos de inferencia, `guidance_scale` 1.2, `window_size` 110 y solapamiento 25; la ruta VDA usa `video_depth_anything_vits.pth` con valores de procesador `[518, 1280, fp16, gray]`. El cargador VHS solicita 24 fps con un tope de 124 fotogramas, y el nodo de redimensionado fija `total_pixel` en 1048 kilopíxeles con redondeo 16. Todos estos son controles configurados, no resultados medidos. No se aportan datos sobre tokens de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de vídeo guiada por una secuencia de profundidad usada como referencia nativa de vídeo en MiniMax H3.
- Descripción de sujeto, escenario, movimiento y sonido mediante prompt enlazado en los nodos de prompt 3062/6062, que sobrescriben el texto antiguo de los condicionadores.
- Extracción de profundidad por vídeo con dos rutas independientes: Video Depth Anything (VDA) y DepthCrafter.
- Exportación de clips de profundidad en H.264 MP4, yuv420p, CRF 19, sin audio conectado.
- Generación de audio dentro del flujo 01: las imágenes y el audio generados alimentan los wrappers de vídeo.
- Soporte de referencias de apariencia mediante imagen en el segundo ejemplo de generación del flujo 01.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Transferencia de estructura y movimiento: usar un clip de profundidad como referencia para que MiniMax H3 genere un vídeo nuevo que conserve la geometría y la trayectoria de cámara del original, describiendo el sujeto y el escenario en el prompt.
- Previsualización de animática con control de cámara: extraer profundidad de un plano rodado o renderizado y reutilizarla para probar movimientos de cámara alternativos sin volver a rodar.
- Prototipado de efectos de sustitución de fondo: emplear la profundidad como guía para regenerar la escena manteniendo la silueta y la oclusión del sujeto principal.
- Generación de vídeo con audio sincronizado en el flujo 01, útil para pruebas de concepto de clips cortos con sonido generado.
- Evaluación comparativa de extractores de profundidad: el flujo 02 permite ejecutar VDA y DepthCrafter sobre el mismo clip para inspeccionar estabilidad temporal, orden de fotogramas y regiones sin profundidad antes de elegir una exportación.
- Construcción de datasets de profundidad para fine-tuning o evaluación: exportar secuencias MP4 de profundidad con parámetros fijos (24 fps, tope de 124 fotogramas, CRF 19) como material de referencia.
- Docencia y reproducción de pipelines en ComfyUI: los JSON sirven como plantilla para explicar la composición de grafos de profundidad a vídeo, siempre que el usuario aporte sus propios modelos y medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que no se realizó ninguna inferencia, medición de tiempos, aceptación visual o sonora, certificación de instalación ni verificación de licencia, y que las portadas seleccionadas no son muestras de salida verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende de los checkpoints externos referenciados (MiniMax H3 en int8, Qwen3-VL 32B en nvfp4_awq, VAE de vídeo int8 y VAE de audio fp32), cuyos requisitos no se documentan en el repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el uso de un componente de 32B en nvfp4_awq sugiere que se necesita hardware con soporte para formatos de cuantización de baja precisión, pero no se confirma.
- Opciones de despliegue: ComfyUI con los nodos personalizados correspondientes (VHS para carga de vídeo, nodos de DepthCrafter y VDA, compositores OpenVDN). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la etiqueta `stage_dmd_8nfe` no constituye una medición de NFE ni de tiempos según el propio autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-KSK/minimax-h3-depth-video-311 | Repositorio de flujos ComfyUI (profundidad a vídeo) | no disponible | no disponible | no disponible | HuggingFace, RunningHub, Civitai |
| MiniMax H3 (OpenVDN) | Modelo de generación de vídeo referenciado | no disponible | no disponible | no disponible | referenciado en los flujos, no incluido |
| DepthCrafter | Modelo de estimación de profundidad por vídeo | no disponible | no disponible | no disponible | referenciado en el flujo 02 |
| Video Depth Anything (ViT-S) | Modelo de estimación de profundidad por vídeo | no disponible | no disponible | no disponible | `video_depth_anything_vits.pth` referenciado |

No se dispone de datos de rendimiento ni de licencia de estas alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni medios de entrada; su tamaño es de 0,0 GB y solo incluye JSON de flujos y portadas PNG.
- No se ha verificado la licencia de los flujos, de los modelos referenciados ni de los medios; el autor no afirma permiso comercial general y exige comprobaciones separadas de derechos sobre flujos, nodos, modelos, portadas, metraje, identidad y audio.
- No hay transferencia automática de archivos entre los flujos 01 y 02: la exportación de profundidad debe cargarse manualmente.
- En el flujo 01, el segundo segmento de vídeo está desactivado (bypass), por lo que su petición almacenada de diez segundos no debe interpretarse como un recorte aplicado.
- Los nombres de archivo subidos no demuestran que los clips seleccionados contengan imágenes de profundidad.
- Las etiquetas de prompt como `fully_preserved` son peticiones, no resultados de evaluación.
- El nodo `DownloadAndLoadDepthCrafterModel` no identifica un nombre de checkpoint explícito en los controles guardados; debe resolverse la implementación instalada antes de ejecutar.
- Ambos prefijos de salida del flujo 02 dicen DepthCrafter, pero la exportación 28 recibe VDA y la 17 recibe DepthCrafter; los resultados deben identificarse por rama real.
- No se ha realizado calibración métrica de profundidad, benchmark ni determinación de qué ruta ofrece mejor calidad.
- El tutorial enlazado no ha sido verificado en vivo y la página de Bilibili no se leyó.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AI-KSK/minimax-h3-depth-video-311
- Tutorial en YouTube: https://www.youtube.com/watch?v=ETAVoT2e8pM
- Tutorial en Bilibili: https://www.bilibili.com/video/BV1pPhU6XERp
- RunningHub internacional, flujo 01: https://www.runninghub.ai/zh-cn/post/2103500778686521345?inviteCode=rh-v1111
- RunningHub China, flujo 01: https://www.runninghub.cn/post/2103416786740924418/?inviteCode=rh-v1111
- Civitai, flujo 01: https://civitai.com/models/2968483
- RunningHub internacional, flujo 02: https://www.runninghub.ai/zh-cn/post/2103499769275752450?inviteCode=rh-v1111
- RunningHub China, flujo 02: https://www.runninghub.cn/post/2103330601007927298/?inviteCode=rh-v1111
- Civitai, flujo 02: https://civitai.com/models/2968482
