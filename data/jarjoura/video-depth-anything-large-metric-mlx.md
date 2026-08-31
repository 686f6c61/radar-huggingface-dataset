# jarjoura/video-depth-anything-large-metric-mlx

## Resumen

Video Depth Anything Large (Metric) en su conversión a MLX es un modelo de estimación de profundidad monocular para video desarrollado originalmente por ByteDance (CVPR 2025 highlight) y convertido por el usuario jarjoura al formato MLX para su ejecución eficiente en hardware Apple Silicon. El modelo produce mapas de profundidad métrica (en metros) por cada fotograma de un vídeo, manteniendo consistencia temporal entre frames, algo crítico para aplicaciones como robótica, realidad aumentada o postproducción.

La arquitectura combina un backbone DINOv2 con una cabeza DPT temporal que procesa secuencias de fotogramas, logrando resultados consistentes en vídeos arbitrariamente largos sin degradación de calidad. Con 384,5 millones de parámetros y un tamaño de repositorio de 1,5 GB, es un modelo relativamente ligero en comparación con alternativas basadas en difusión, y su conversión MLX permite inferencia en CPU y GPU de Apple con una precisión validada frente a la referencia PyTorch (error relativo máximo de ~1e-5 en CPU y ~1% en GPU con fast-math). La licencia declarada en la conversión es Apache 2.0, aunque el modelo original usa CC-BY-NC-4.0, un matiz importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 backbone + temporal DPT head (Video Depth Anything) |
| Parametros totales | 384.554.177 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de video, no texto) |
| Tipos de cuantizacion | no disponible (conversion MLX en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 (conversion MLX); el modelo original es CC-BY-NC-4.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Video Depth Anything, que extiende Depth Anything V2 con una cabeza DPT (Dense Prediction Transformer) modificada para procesar secuencias temporales. El backbone es DINOv2, un transformer de vision preentrenado de forma autosupervisada, que extrae caracteristicas densas de cada fotograma. La cabeza temporal DPT agrega informacion de multiples frames mediante atencion cruzada y convoluciones temporales, produciendo mapas de profundidad metricos (escala absoluta en metros) consistentes a lo largo del tiempo.

El entrenamiento original utilizo una combinacion de datos de video con anotaciones de profundidad metrica y tecnicas de consistencia temporal, aunque los detalles exactos del dataset y el proceso de entrenamiento no estan disponibles en la informacion proporcionada. La conversion a MLX se realizo con la herramienta `mlx_vlm.models.video_depth_anything.convert`, que transpila los pesos de PyTorch al formato MLX manteniendo la arquitectura y los pesos originales. No se menciona ningun proceso de fine-tuning posterior a la conversion.

## Capacidades

- Estimacion de profundidad monocular metrica (en metros) para secuencias de video, no solo imagenes individuales.
- Consistencia temporal entre fotogramas, evitando parpadeos o saltos en la profundidad estimada.
- Manejo de videos de longitud arbitraria (el codigo de ejemplo limita a 300 frames, pero el modelo no tiene una restriccion inherente).
- Inferencia rapida en hardware Apple Silicon gracias a la conversion MLX, con validacion numerica frente a la referencia PyTorch.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales mas alla de la vision.
- No se especifican capacidades multilingues (no aplica a un modelo de vision puro).

## Casos de uso

- Robotica y navegacion autonoma: el modelo puede estimar distancias metricas a objetos en tiempo real a partir de una camara monocular, permitiendo a un robot evitar obstaculos o planificar rutas. Su consistencia temporal es clave para evitar errores de profundidad entre frames consecutivos.
- Realidad aumentada y mixta: para anclar objetos virtuales en el mundo real, se necesita profundidad metrica precisa y estable. Este modelo puede alimentar aplicaciones AR en dispositivos Apple, aprovechando la aceleracion MLX.
- Postproduccion de video: en edicion, se puede usar para separar elementos en primer plano y fondo, aplicar desenfoque de profundidad (bokeh) o reiluminar escenas. La salida metrica facilita la integracion con herramientas de composicion 3D.
- Conduccion autonoma y ADAS: aunque no es un sistema completo, puede proporcionar estimaciones de profundidad para camaras de vehiculos, complementando otros sensores como LiDAR. Su naturaleza metrica es esencial para calcular distancias de frenado.
- Analisis de video para vigilancia: estimar la distancia de personas u objetos en escenas de seguridad, ayudando a detectar intrusiones o medir velocidades aproximadas.
- Generacion de contenido 3D: a partir de un video monocular, se pueden reconstruir mallas o nubes de puntos para crear modelos 3D de escenas, util en fotogrametria o captura de entornos para videojuegos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion mencionada es la comparacion con la referencia PyTorch: error relativo maximo de ~1e-5 en CPU y ~1% en GPU (Metal fast-math), lo que confirma la fidelidad de la conversion, pero no proporciona metricas estandar como RMSE, delta1 o comparaciones con otros modelos en datasets como KITTI o NYUv2.

## Requisitos de hardware

- VRAM estimada: con 384 millones de parametros en FP32, el modelo ocupa aproximadamente 1,5 GB en memoria. En MLX, la inferencia puede realizarse en CPU o GPU unificada de Apple Silicon; se recomienda al menos 8 GB de RAM unificada para videos de longitud media.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con Metal. No se requiere GPU NVIDIA, ya que MLX esta disenado para el ecosistema Apple.
- En consumer GPU: no aplica directamente, pero el modelo original PyTorch podria ejecutarse en GPUs NVIDIA con 4-6 GB de VRAM en FP16.
- Opciones de despliegue: el codigo de ejemplo usa `mlx_vlm` para cargar el modelo y ejecutar la inferencia. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La velocidad dependera del hardware Apple y de la resolucion de los frames; el modelo procesa secuencias de hasta 300 frames a 15 fps en el ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Video Depth Anything Large (Metric) MLX | 384M | Video, metrico | Profundidad en metros | Apache 2.0 (conversion) / CC-BY-NC-4.0 (original) | HuggingFace |
| Video Depth Anything Large (original PyTorch) | 384M | Video, metrico | Profundidad en metros | CC-BY-NC-4.0 | HuggingFace |
| DepthCrafter | no disponible | Video, relativo | Profundidad relativa | no disponible | GitHub |

DepthCrafter es una alternativa basada en difusion que produce profundidad relativa (no metrica) y es mas lenta y pesada. Video Depth Anything ofrece mayor velocidad y consistencia, ademas de salida metrica. No se dispone de datos de rendimiento comparativo en benchmarks publicos.

## Limitaciones y advertencias

- La licencia del modelo original es CC-BY-NC-4.0, que restringe el uso comercial. Aunque la conversion MLX declara Apache 2.0, es recomendable verificar la legalidad de usar el modelo en productos comerciales, ya que los pesos derivados pueden estar sujetos a la licencia original.
- No se proporcionan datos sobre sesgos o limitaciones eticas. Como modelo de vision, puede tener errores en superficies reflectantes, objetos transparentes o condiciones de poca luz, aunque no se documentan casos concretos.
- Riesgo de alucinacion en profundidad: en regiones sin textura o con oclusiones, el modelo puede producir estimaciones incorrectas. La salida metrica puede ser especialmente peligrosa en aplicaciones de seguridad donde se requiera precision absoluta.
- Limitaciones de contexto: el modelo procesa secuencias de video, pero el ejemplo limita a 300 frames y 15 fps; videos mas largos pueden requerir dividir la secuencia en segmentos, lo que podria afectar la consistencia temporal entre segmentos.
- No hay informacion sobre cuantizacion disponible; la conversion MLX parece estar en FP32, lo que limita la reduccion de memoria en dispositivos con poca RAM.
- No se especifican requisitos de version de MLX o dependencias; es posible que se necesite una version reciente de `mlx_vlm` para cargar el modelo correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jarjoura/video-depth-anything-large-metric-mlx
- Modelo original (PyTorch): https://huggingface.co/depth-anything/Metric-Video-Depth-Anything-Large
- Repositorio oficial de Video Depth Anything: https://github.com/DepthAnything/Video-Depth-Anything
- Pagina del proyecto: https://videodepthanything.github.io/
