# jarjoura/video-depth-anything-small-metric-mlx

## Resumen

Video Depth Anything Small (Metric) en formato MLX es una conversión del modelo homónimo desarrollado por ByteDance, presentado como destacado en CVPR 2025. Se trata de un modelo de estimación de profundidad monocular para video que produce mapas de profundidad métrica absoluta (en metros) con consistencia temporal. La conversión a MLX, realizada por el usuario jarjoura, permite ejecutar el modelo de forma nativa en hardware Apple Silicon (MPS) con un rendimiento optimizado.

El modelo original combina un backbone DINOv2 con una cabeza DPT temporal, lo que le permite procesar secuencias de video de longitud arbitraria sin degradar la calidad ni la consistencia. Con solo 29 millones de parámetros, es significativamente más ligero que las alternativas basadas en difusión, ofreciendo una inferencia más rápida y un menor coste computacional. Esta versión MLX mantiene la misma arquitectura y pesos, validada contra la referencia PyTorch con un error relativo máximo de aproximadamente 1e-5 en CPU y 1% en GPU (Metal fast-math).

La relevancia actual de este modelo radica en su capacidad para abordar tareas de percepción 3D en tiempo real sobre hardware de consumo, como robótica, realidad aumentada o edición de video, donde la profundidad consistente y métrica es esencial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 backbone + cabeza DPT temporal |
| Parametros totales | 29.080.193 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (procesa video, no texto) |
| Tipos de cuantizacion | no disponible (formato MLX nativo, sin cuantizacion documentada) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Video Depth Anything, presentada en el CVPR 2025 como destacado. Se basa en Depth Anything V2, que utiliza un backbone DINOv2 preentrenado para extraer características visuales robustas, y una cabeza DPT (Dense Prediction Transformer) modificada para procesar secuencias temporales. La variante "metric" produce profundidad absoluta en metros, a diferencia de la variante relativa que normaliza la salida.

El entrenamiento del modelo original se realizó con un enfoque de aprendizaje supervisado sobre datos de video con anotaciones de profundidad métrica, aunque no se han publicado detalles específicos sobre el número de tokens o la composición exacta del dataset en la información disponible. No se menciona el uso de RLHF o DPO, ya que es un modelo puramente visual. La conversión a MLX se realizó mediante la herramienta `mlx_vlm.models.video_depth_anything.convert`, preservando los pesos originales sin reentrenamiento.

## Capacidades

- Estimacion de profundidad monocular en video con salida metrica absoluta (metros).
- Consistencia temporal a lo largo de secuencias de video de longitud arbitraria.
- Inferencia rapida en comparacion con modelos de difusion (menos parametros y menor latencia).
- Generalizacion a escenas y entornos variados gracias al backbone DINOv2.
- Soporte para procesamiento de video en tiempo real en hardware Apple Silicon via MLX.
- No incluye capacidades de tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Robotica y navegacion autonoma: el modelo puede estimar la profundidad de obstaculos en tiempo real a partir de una camara monocular, permitiendo a un robot evitar colisiones. Su bajo coste computacional (29M parametros) lo hace adecuado para sistemas embebidos con GPU limitada.
- Realidad aumentada y mixta: la profundidad metrica permite anclar objetos virtuales al mundo real con precision, por ejemplo en aplicaciones de medicion de distancias o colocacion de muebles. La consistencia temporal evita parpadeos al mover el dispositivo.
- Conduccion autonoma y asistencia al conductor: la estimacion de profundidad en video ayuda a detectar la distancia a vehiculos y peatones. La salida metrica es directamente utilizable para sistemas de frenado o alerta.
- Postproduccion de video y efectos visuales: permite generar mapas de profundidad para aplicar desenfoque de fondo, reiluminacion o composicion 3D. La consistencia temporal es critica para evitar artefactos en secuencias largas.
- Analisis de deportes y biomecanica: estimar la posicion 3D de atletas a partir de video monocular para analisis de rendimiento o arbitraje asistido. La profundidad metrica facilita calculos de velocidad y distancia recorrida.
- Creacion de contenido 3D: generar mapas de profundidad para convertir video 2D en estereoscopico o para reconstruccion de escenas en fotogrametria. La salida en metros simplifica la integracion con herramientas de modelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion mencionada es la comparacion con la referencia PyTorch: error relativo maximo de ~1e-5 en CPU y ~1% en GPU (Metal fast-math), lo que indica una conversion fiel pero no proporciona metricas estandar como abs rel error, delta1, etc.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 29M parametros, la inferencia requiere menos de 1 GB de VRAM en precision FP32. Con cuantizacion (si se aplicara) podria reducirse aun mas, aunque no se documenta.
- GPU recomendadas: cualquier GPU Apple Silicon (M1, M2, M3, M4) gracias a la implementacion MLX. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas integradas modernas.
- Opciones de despliegue: MLX (nativo en Apple Silicon), tambien se puede convertir a otros formatos como ONNX o CoreML para despliegue en otras plataformas. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos concretos, pero dado el tamano del modelo, se espera una inferencia en tiempo real (30+ FPS) en GPU Apple Silicon para videos de resolucion moderada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Video Depth Anything Small (Metric) | 29M | Metrica (metros) | Apache 2.0 | HuggingFace (original y MLX) |
| Depth Anything V2 (base) | ~25M | Relativa | Apache 2.0 | HuggingFace |
| DepthCrafter | ~600M | Relativa | Apache 2.0 | HuggingFace |

La comparativa se basa en parametros y tipo de salida. DepthCrafter es un modelo de difusion con muchos mas parametros y mayor latencia, mientras que Depth Anything V2 produce profundidad relativa sin escala metrica. Video Depth Anything Small ofrece una ventaja en velocidad y consistencia temporal, pero no se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- La salida metrica puede tener errores en escenas con condiciones de iluminacion extremas, superficies reflectantes o texturas repetitivas, como es comun en modelos de profundidad monocular.
- La conversion MLX introduce una pequena diferencia numerica (~1% en GPU con fast-math), que podria ser relevante en aplicaciones de alta precision.
- No se han documentado sesgos especificos, pero el modelo puede generalizar peor en dominios no representados en su dataset de entrenamiento (no disponible).
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la atribucion requerida.
- El modelo no soporta procesamiento de audio ni texto; es exclusivamente para estimacion de profundidad en video.
- No se proporcionan garantias de rendimiento en hardware no Apple Silicon, ya que la conversion MLX esta optimizada para MPS.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jarjoura/video-depth-anything-small-metric-mlx
- Modelo original (PyTorch): https://huggingface.co/depth-anything/Metric-Video-Depth-Anything-Small
- Repositorio oficial de Video Depth Anything: https://github.com/DepthAnything/Video-Depth-Anything
- Pagina del proyecto: https://videodepthanything.github.io/
- Herramienta de generacion de video metrico 3D: https://github.com/houjiaxxin/metric_video_depth_anything
