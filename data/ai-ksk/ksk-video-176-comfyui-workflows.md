# AI-KSK/ksk-video-176-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-176-comfyui-workflows` no es un modelo de IA en sentido estricto, sino un repositorio de tutoriales y flujos de trabajo de ComfyUI para postproducción de vídeo generado con Seedance 2.0. El autor, AI-KSK, publica la documentación en inglés de una cadena de dos grafos orientada a eliminar la marca de agua de los clips generados con Seedance 2.0, interpolar fotogramas y reescalar el resultado. El repositorio no contiene pesos, JSON de workflows ni imágenes de portada: solo el README con el tutorial y una tabla de parámetros extraída del grafo original.

El interés técnico reside en la combinación de herramientas: un removedor basado en los primeros trabajos de Wan 2.1 (etiquetado como "MiniMax remover"), una pasada de interpolación GIMM y un upscale con FlashVSR. El autor reporta que la marca de agua queda "casi eliminada" y que el resultado reescalado alcanza aproximadamente 2K tras aplicar una restricción de 960 píxeles. No se trata de un modelo entrenado específicamente para esta tarea, sino de un pipeline de postprocesado construido sobre componentes existentes.

Es relevante como referencia práctica para quien genere clips con Seedance 2.0 y necesite un flujo repetible de limpieza y mejora antes de edición, aunque su utilidad está acotada por la dependencia de máscaras manuales y por la naturaleza temprana del removedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de workflows ComfyUI; no contiene modelo propio) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (documentación) |
| Licencia | other |
| Formato de pesos | No disponible (el repositorio no incluye pesos ni JSON) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal propia. Describe dos grafos de ComfyUI. El primero, "minimax remover 视频去水印", consta de 26 nodos e incluye `MaskToImage`, `WanVideoEncode`, `PreviewImage`, `VHS_VideoCombine`, `WanVideoMiniMaxRemoverEmbeds`, `LoadWanVideoT5TextEncoder`, `GrowMaskWithBlur` y `WanVideoVAELoader`; no contiene cadena de sampler UNET/CLIP/VAE, por lo que es un grafo de procesado o composición. El segundo, "视频补帧+放大", consta de 7 nodos: `GIMMVFI_interpolate`, `LayerUtility: ImageScaleByAspectRatio V2`, `DownloadAndLoadGIMMVFIModel`, `FlashVSRNode`, `VHS_LoadVideo`, `PreviewImage` y `VHS_VideoCombine`.

No se proporcionan datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO, porque el repositorio no entrena ningún modelo. El removedor se describe explícitamente como una build temprana de MiniMax/Wan 2.1, no como un removedor entrenado específicamente en 2026. La innovación práctica es la orquestación: encadenar un grafo de eliminación por máscara con un grafo de interpolación y reescalado.

## Capacidades

- Eliminación de marcas de agua mediante enmascarado manual y prompt sobre la zona enmascarada.
- Interpolación de fotogramas 2x para pasar de una fuente de 16 fps a 32 o 60 fps.
- Re escalado 3x tras aplicar una restricción de 960 píxeles, con resultado reportado de aproximadamente 2K.
- Encadenamiento de dos grafos separados: el clip limpio del primero alimenta el segundo.
- Procesado por lotes repetible mediante grafos de ComfyUI, en lugar de corrección manual puntual.
- No incluye detección automática de marcas de agua, tool calling, agentes, razonamiento multimodal ni capacidades de lenguaje.

## Casos de uso

- Limpieza de clips propios generados con Seedance 2.0: se carga el clip, se congela el primer fotograma si es necesario, se pinta la máscara sobre la marca de agua, se escribe un prompt para la zona enmascarada y se ejecuta el grafo de 26 nodos.
- Conversión de 16 fps a 32 fps para entregas que exigen esa tasa: se usa la interpolación 2x de GIMM sobre el clip ya limpio.
- Conversión a 60 fps para contenido de movimiento rápido: misma pasada de interpolación, asumiendo el riesgo de smear en movimiento muy rápido u ocluido.
- Re escalado a aproximadamente 2K para entrega: se aplica FlashVSR con restricción de 960 píxeles y factor 3x.
- Estandarización de un pipeline de postproducción: los dos grafos se guardan como plantillas reutilizables en ComfyUI para procesar lotes de clips con los mismos parámetros.
- Integración en un flujo de edición previo al montaje: el clip limpio, interpolado y reescalado se entrega al editor sin necesidad de retoques manuales de marca de agua.
- Evaluación de la viabilidad de un removedor basado en Wan 2.1 temprano antes de invertir en una solución dedicada: el tutorial documenta los límites reales del enfoque por máscara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica requisitos ni pesos, por lo que no se puede calcular.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI con los nodos `WanVideo*`, `GIMMVFI_interpolate`, `FlashVSRNode` y `VHS_*`; los grafos también están disponibles en las páginas de RunningHub enlazadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo comparable con otros modelos de IA; es un conjunto de workflows de postproducción. Como alternativas funcionales dentro del ecosistema ComfyUI cabría citar otros pipelines de eliminación de marcas de agua, interpolación o upscale, pero no se dispone de datos de rendimiento en la información proporcionada para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El removedor requiere una máscara: no detecta marcas de agua de forma automática.
- El modelo subyacente es una build temprana de MiniMax/Wan 2.1, no un removedor entrenado específicamente para esta tarea.
- La interpolación no inventa detalle: el movimiento muy rápido u ocluido produce smear.
- La cuota gratuita de Xiaoyunque (un clip al día, 15 s) y la ausencia de referencia facial limitan el material de origen.
- La eliminación de marcas de agua solo es apropiada sobre material propio o con licencia para procesarlo; la herramienta no incorpora un modelo de derechos.
- La licencia es "other" y no se detallan sus términos; conviene verificar las condiciones antes de un uso comercial.
- El repositorio no incluye los JSON de los workflows ni los pesos: hay que obtenerlos a través del episodio o de RunningHub.
- El tamaño del repositorio es de 0.0 GB y no contiene artefactos ejecutables, solo documentación.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-176-comfyui-workflows
- RunningHub - 视频补帧+放大: https://www.runninghub.ai/post/2021549838894108674/?inviteCode=rh-v1111
- RunningHub - minimax remover 视频去水印: https://www.runninghub.ai/post/2021475821034151938/?inviteCode=rh-v1111
- Tutorial en YouTube: https://www.youtube.com/watch?v=yp0dcysS4XY
- Original en Bilibili: https://www.bilibili.com/video/BV1REcbzdEdn
