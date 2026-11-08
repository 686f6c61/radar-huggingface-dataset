# litert-community/Depth-Anything-V2-Metric-Hypersim-Small

## Resumen

Depth-Anything-V2-Metric-Hypersim-Small es un modelo de estimación de profundidad monocular métrica desarrollado originalmente por Lihe Yang y colaboradores (Depth Anything V2). Esta ficha concreta corresponde al export en formato LiteRT/TFLite (FP32) publicado por la comunidad litert-community, que empaqueta el checkpoint ViT-S fine-tuneado sobre el dataset sintético Hypersim para escenas de interior. El modelo devuelve profundidad en metros con la configuración `max_depth=20` del checkpoint original.

El modelo resuelve el problema de obtener un mapa de profundidad denso a partir de una única imagen RGB, con escala métrica real (no solo relativa), lo que permite mediciones absolutas en metros. Es relevante para despliegue en dispositivos de borde y aplicaciones móviles porque el export TFLite elimina la dependencia de PyTorch y permite ejecutar inferencia en CPU con el intérprete de LiteRT, manteniendo un tamaño de fichero de 98,91 MB.

La arquitectura subyacente es un backbone ViT-Small (Vision Transformer pequeño) con una cabeza DPT que regresa la profundidad. El export tiene formas fijas (entrada `[1, 3, 518, 518]`, salida `[1, 518, 518]`) y todos los tensores son `float32`. El modelo está pensado exclusivamente para escenas de interior, ya que el fine-tuning métrico se realizó sobre Hypersim.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-S (Vision Transformer small) con cabeza DPT para regresión de profundidad |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 518 × 518) |
| Tipos de cuantización | FP32 (único artefacto publicado en este repo) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (LiteRT), `Depth-Anything-V2-Metric-Hypersim-Small-fp32.tflite`, 98,91 MB |

## Arquitectura y entrenamiento

El modelo sigue la receta de Depth Anything V2 para profundidad métrica: un encoder ViT-S preentrenado en profundidad relativa y fine-tuneado con una cabeza DPT simple que regresa profundidad absoluta. El fine-tuning métrico se realiza sobre el dataset sintético Hypersim, orientado a escenas de interior, con la configuración `max_depth=20` del checkpoint original. El export LiteRT conserva los pesos preentrenados originales y solo cambia el formato y la interfaz de ejecución a un grafo TFLite de formas fijas.

La innovación principal de Depth Anything V2 es el uso de datos sintéticos etiquetados para el ajuste métrico, combinado con un encoder robusto preentrenado en grandes volúmenes de imágenes no etiquetadas. El export de litert-community no introduce cambios algorítmicos: es una conversión FP32 con firma `main`, entrada `pixel_values` NCHW normalizada y salida `depth_metres` en metros a la resolución del recorte cuadrado (518 × 518). El preprocesado (recorte central cuadrado, conversión a RGB, división por 255, redimensionado cúbico y normalización con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`) se ejecuta en el host, no dentro del grafo.

## Capacidades

- Estimación de profundidad monocular métrica: devuelve un mapa denso de profundidad en metros para una imagen RGB de entrada.
- Salida con escala métrica real (no relativa), adecuada para mediciones absolutas dentro del rango configurado (`max_depth=20`).
- Especializado en escenas de interior gracias al fine-tuning sobre Hypersim.
- Inferencia en CPU mediante el intérprete `ai_edge_litert`, sin necesidad de GPU ni de PyTorch.
- Interfaz TFLite de formas fijas con firma `main`, apta para integración en pipelines móviles y de borde.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye decodificación de imagen/vídeo ni postprocesado de aplicación: estas etapas corren en el host.

## Casos de uso

- Medición de distancias en interiores: integrado en una app móvil que captura una imagen, recorta al cuadrado central y ejecuta el intérprete LiteRT para obtener distancias en metros a paredes, muebles y obstáculos, útil en herramientas de medición o realidad aumentada.
- Navegación asistida para robots de interior: el modelo proporciona un mapa de profundidad métrico por fotograma que puede alimentar módulos de evitación de obstáculos, aprovechando que la salida está en metros y no requiere calibración adicional de escala.
- Reconstrucción 3D y nubes de puntos: a partir de la profundidad métrica y la intrínseca de la cámara se pueden proyectar píxeles a puntos 3D para generar nubes de puntos de habitaciones, tal como documenta el proyecto original.
- Segmentación por profundidad en edición de imágenes: usar el mapa de profundidad para separar primer plano y fondo, aplicar desenfoque selectivo o efectos de bokeh en fotografía de interiores.
- Automatización de inventario y escaneo de espacios: estimar dimensiones aproximadas de estancias o volúmenes de objetos en capturas de interior sin hardware de profundidad dedicado.
- Prototipado en dispositivos de borde: al ser un TFLite FP32 de ~99 MB ejecutable en CPU, sirve para validar productos de visión en móviles, Raspberry Pi o dispositivos embebidos antes de invertir en hardware especializado.
- Preprocesado para modelos downstream: generar mapas de profundidad como entrada auxiliar para detectores, planificadores de trayectoria o sistemas de captura de escenas en interiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el export TFLite, que está pensado para ejecución en CPU; el fichero FP32 ocupa 98,91 MB.
- GPU recomendadas: no disponible; el flujo documentado usa el intérprete LiteRT en CPU con `num_threads=4`.
- ¿Cabe en GPU consumer? No disponible como dato de rendimiento; el tamaño del artefacto (menos de 100 MB) es compatible con cualquier GPU consumer si se ejecuta mediante un runtime compatible con TFLite.
- Opciones de despliegue: `ai-edge-litert` (intérprete LiteRT/TFLite) con la firma `main`; el preprocesado y postprocesado se ejecutan en el host con OpenCV y NumPy. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tipo de profundidad | Entrada | Formato | Licencia |
|---|---|---|---|---|---|
| Depth-Anything-V2-Metric-Hypersim-Small (este export) | ViT-S + DPT | Métrica (metros), interior | 518 × 518 fija | TFLite FP32 | Apache 2.0 |
| depth-anything/Depth-Anything-V2-Metric-Hypersim-Small (checkpoint original) | ViT-S + DPT | Métrica (metros), interior | Resolución variable (múltiplo de 14) | PyTorch (safetensors/bin) | Apache 2.0 |
| Depth-Anything-V2-Metric-VKITTI-Small (checkpoint original) | ViT-S + DPT | Métrica (metros), exterior | Resolución variable (múltiplo de 14) | PyTorch | Apache 2.0 |
| Depth-Anything-V2-Small (profundidad relativa) | ViT-S + DPT | Relativa (sin escala métrica) | Resolución variable | PyTorch / otros | Apache 2.0 |

## Limitaciones y advertencias

- El modelo está fine-tuneado sobre Hypersim (interior); su precisión métrica en escenas de exterior o dominios muy distintos puede degradarse notablemente.
- La salida cubre solo el recorte cuadrado central; los márgenes descartados de la imagen original no tienen predicción.
- La normalización min/max por imagen solo debe usarse para visualización: destruye la escala métrica y no debe aplicarse si se necesitan distancias en metros.
- Las formas de entrada y salida son fijas (518 × 518); no admite resolución variable sin reconvertir el modelo.
- Riesgo de alucinación de profundidad en superficies reflectantes, transparentes, texturas repetitivas o regiones con poca textura, habitual en estimación monocular.
- Sesgos heredados de los datos sintéticos de Hypersim: distribución de escenas, iluminación y geometría típicas del dataset, no necesariamente representativas de entornos reales diversos.
- Licencia Apache 2.0, que permite uso comercial; conviene conservar los avisos de atribución del proyecto original y del export.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni validación externa del export.
- No se documentan métricas de error (AbsRel, RMSE) para este artefacto concreto; no debe asumirse la precisión del checkpoint original sin verificación propia.

## Enlaces

- Repositorio Hugging Face del export: https://huggingface.co/litert-community/Depth-Anything-V2-Metric-Hypersim-Small
- Checkpoint original: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-Hypersim-Small
- Repositorio GitHub del proyecto: https://github.com/DepthAnything/Depth-Anything-V2
- Implementación de profundidad métrica: https://github.com/DepthAnything/Depth-Anything-V2/tree/a561b849ebae10a6f5ef49e26c83cbbcd36c71bf/metric_depth
- README de profundidad métrica: https://github.com/DepthAnything/Depth-Anything-V2/blob/main/metric_depth/README.md
- Paper (arXiv): https://arxiv.org/abs/2406.09414
