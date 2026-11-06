# bigshanedogg/Prompt-Depth-Anything-Large

## Resumen

Prompt-Depth-Anything-Large es un port no oficial al formato transformers del modelo Prompt Depth Anything (PromptDA), desarrollado originalmente por Haotong Lin, Sida Peng y colaboradores (DepthAnything/PromptDA) y publicado en CVPR 2025 bajo el título *"Prompting Depth Anything for 4K Resolution Accurate Metric Depth Estimation"*. Este repositorio, mantenido por el usuario bigshanedogg, empaqueta el checkpoint original (`model.ckpt`) en safetensors y expone la arquitectura mediante clases compatibles con la API de transformers, ejecutando el código original con `trust_remote_code=True`.

El modelo resuelve un problema concreto de visión por computador: la estimación de profundidad métrica a alta resolución (hasta 4K) a partir de una imagen RGB y una indicación de profundidad de baja resolución (por ejemplo, LiDAR de iPhone a 192 × 256 píxeles, en metros). Combina un backbone DINOv2 ViT-L/14 con una cabeza DPT condicionada por el prompt de profundidad, de modo que la señal dispersa de baja resolución guía la predicción densa y métricamente precisa.

Es relevante para desarrolladores que necesitan integrar estimación de profundidad métrica en pipelines de transformers sin depender del repositorio original de PyTorch Lightning: el port verifica que las salidas (preprocesado, `predicted_depth`, `predict`, estados ocultos y autocast fp16) son bit-idénticas al código oficial. El modelo tiene 340.046.535 parámetros y un tamaño de repositorio de 1,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-L/14 (backbone) + cabeza DPT condicionada por prompt de profundidad |
| Parametros totales | 340.046.535 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor verifica fp16 autocast) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `processor_config.json` |

## Arquitectura y entrenamiento

La arquitectura replica la del PromptDA oficial: un backbone DINOv2 ViT-L/14 preentrenado (`pretrained`), una cabeza DPT condicionada por el prompt de profundidad (`depth_head`) y los buffers de normalización `_mean` / `_std`. La inferencia ejecuta el `PromptDA.forward` original y devuelve un `DepthEstimatorOutput` estándar con `predicted_depth` de forma (B, H, W) en metros. El port incorpora el código de DepthAnything/PromptDA (commit 9161547c) en los ficheros `promptda_dinov2.py` y `promptda_model.py`, con cambios limitados a imports y a la sustitución de `Block` por `NestedTensorBlock` donde el original lo importaba con alias.

El preprocesado lo realiza `PromptDepthAnythingProcessor`, que envuelve el `PromptDepthAnythingImageProcessor` original y conserva las funciones `load_image` / `load_depth`. La imagen se redimensiona de modo que el lado mayor no supere 1008 píxeles y sea múltiplo de 14, y la salida de profundidad se entrega a esa misma resolución procesada, sin reescalado posterior. El prompt de profundidad puede proporcionarse como fichero PNG (en milímetros), NPZ o directamente en metros.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables a un modelo de profundidad). El autor indica que los pesos son los del checkpoint original, verificados tensor a tensor, y que el modelo es el evaluado en el paper.

## Capacidades

- Estimación de profundidad métrica densa a partir de una imagen RGB y un prompt de profundidad de baja resolución (por ejemplo, LiDAR de iPhone a 192 × 256).
- Predicción a alta resolución: el paper reporta estimación métrica precisa hasta 4K.
- Salida en metros con la forma estándar `DepthEstimatorOutput` (`predicted_depth` de dimensiones B, H, W).
- Soporte de `output_hidden_states=True` para obtener las características de DINOv2 que consume la cabeza.
- Compatibilidad con `AutoModelForDepthEstimation` y `AutoProcessor` de transformers.
- Ejecución con autocast fp16 verificada bit-idéntica respecto al código oficial.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de profundidad.

## Casos de uso

- Reconstrucción 3D y captura volumétrica: combinar la profundidad métrica densa con la imagen RGB para generar nubes de puntos o mallas en aplicaciones de escaneo con LiDAR de móvil, aprovechando que el prompt de baja resolución ancla la escala métrica real.
- Realidad aumentada en dispositivos móviles: usar la profundidad del sensor LiDAR del iPhone como prompt y obtener mapas de profundidad densos y métricos para oclusión y colocación de objetos virtuales.
- Robótica y navegación: alimentar el modelo con imágenes de cámara y medidas de un sensor de profundidad de bajo coste para obtener mapas de profundidad densos que sirvan a la planificación de trayectorias.
- Síntesis de vistas y efectos de desenfoque: generar mapas de profundidad precisos para post-procesado fotográfico (bokeh sintético) o para *novel view synthesis* en pipelines de renderizado.
- Automoción y percepción: estimación de distancias métricas en escenas exteriores a partir de una imagen y un sensor de profundidad de baja resolución, útil para sistemas de asistencia a la conducción.
- Digitalización de interiores y gemelos digitales: captura de habitaciones con LiDAR de móvil y generación de mapas de profundidad densos para modelado arquitectónico.
- Investigación en visión por computador: evaluación y reproducción de los resultados del paper con un pipeline transformers estándar, sin depender de PyTorch Lightning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de métricas (AbsRel, RMSE, δ1, etc.) y solo remite al paper original para los resultados del modelo evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,4 GB en safetensors; con 340 millones de parámetros, la inferencia en fp16 requiere aproximadamente 1,5-2 GB de VRAM, más memoria para activaciones de la cabeza DPT a resoluciones de hasta 1008 píxeles de lado.
- GPU recomendadas: el autor verificó el port en una V100; cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia en fp16.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` (único método documentado). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.
- Dependencias adicionales en tiempo de ejecución: `opencv-python` e `imageio`, además de torch y transformers.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Depth-Anything-Large (este repo) | 340 M | Profundidad métrica condicionada por prompt | Hasta 4K (procesado a 1008 px de lado mayor) | Apache-2.0 | Hugging Face, port no oficial |
| depth-anything/prompt-depth-anything-vitl | no disponible | Profundidad métrica condicionada por prompt | Hasta 4K | Apache-2.0 | Hugging Face, oficial |
| Depth Anything V2 (familia) | no disponible en la informacion | Profundidad relativa (y métrica en variantes) | no disponible | no disponible | Hugging Face |

La comparación detallada con alternativas de la misma categoría (por ejemplo, Depth Anything V2 o Metric3D) no está disponible en la información proporcionada; el propio autor identifica `depth-anything/prompt-depth-anything-vitl` como modelo base y referencia oficial.

## Limitaciones y advertencias

- Es un port no oficial: el autor lo declara explícitamente y recomienda citar el trabajo original de Lin et al.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de usarlo en producción.
- Depende de un prompt de profundidad de baja resolución; sin esa señal (LiDAR u otro sensor), el modelo no está diseñado para operar como estimador de profundidad puramente monocular.
- La salida se entrega a la resolución procesada (lado mayor de hasta 1008 píxeles, múltiplo de 14); no se reescala a la resolución original, lo que puede requerir post-procesado en aplicaciones de alta resolución.
- No se han publicado datos de sesgos ni de robustez fuera de las condiciones del paper; el rendimiento puede degradarse con prompts de profundidad ruidosos o mal calibrados.
- Licencia Apache-2.0 para código y pesos, incluida la copia de DINOv2 del repositorio (Apache-2.0); no se indican restricciones adicionales para uso comercial, pero debe conservarse la atribución del NOTICE y citar el paper.
- El repositorio tiene un uso muy bajo (14 descargas, 0 likes) y fue creado en 2026; no hay evidencia de mantenimiento continuado ni de comunidad que lo valide más allá de la verificación bit-idéntica del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigshanedogg/Prompt-Depth-Anything-Large
- Modelo base oficial: https://huggingface.co/depth-anything/prompt-depth-anything-vitl
- Repositorio oficial PromptDA: https://github.com/DepthAnything/PromptDA
- Paper: Lin et al., *"Prompting Depth Anything for 4K Resolution Accurate Metric Depth Estimation"*, CVPR 2025 (arXiv, referencia `lin2024promptda` en la model card)
