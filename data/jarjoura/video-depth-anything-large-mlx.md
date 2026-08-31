# jarjoura/video-depth-anything-large-mlx

## Resumen

Video Depth Anything Large (MLX) es una conversión al ecosistema MLX del modelo homónimo desarrollado por ByteDance, presentado como destacado en CVPR 2025. Se trata de un modelo de estimación de profundidad monocular en video, es decir, dado un vídeo de entrada, produce un mapa de profundidad por cada fotograma manteniendo consistencia temporal entre ellos, evitando parpadeos o saltos bruscos. Esta capacidad es fundamental para aplicaciones de robótica, realidad aumentada, edición de vídeo o conducción autónoma, donde se necesita una percepción 3D estable a lo largo del tiempo.

La arquitectura combina un backbone DINOv2 con una cabeza DPT temporal, lo que permite procesar secuencias de vídeo de forma eficiente. El modelo tiene 384,5 millones de parámetros y un tamaño de repositorio de 1,5 GB. La conversión MLX, realizada por el usuario jarjoura, reproduce fielmente el comportamiento del modelo original en PyTorch, con un error relativo máximo de aproximadamente 1e-5 en CPU y 1% en GPU (Metal fast-math). Está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 backbone + temporal DPT head (Video Depth Anything Large) |
| Parametros totales | 384.554.177 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa secuencias de video, hasta 300 frames en el ejemplo de uso) |
| Tipos de cuantizacion | No disponible (formato MLX nativo, probablemente FP16/BF16) |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original fue desarrollado por ByteDance y presentado en CVPR 2025. Se basa en Depth Anything V2, extendido con módulos temporales que permiten propagar información entre fotogramas para lograr una profundidad consistente a lo largo del vídeo. La conversión MLX reproduce exactamente esta arquitectura, utilizando el mismo backbone DINOv2 y la cabeza DPT temporal. No se dispone de detalles específicos sobre el dataset de entrenamiento en la información proporcionada, pero el modelo original fue entrenado con una combinación de datos de imagen y vídeo para garantizar generalización y consistencia temporal. Una ventaja clave frente a otros enfoques basados en difusión es su inferencia más rápida y su menor número de parámetros, manteniendo una alta precisión en la profundidad.

## Capacidades

- Estimación de profundidad monocular en video, generando un mapa de profundidad por fotograma.
- Consistencia temporal: los mapas de profundidad son estables entre frames consecutivos, sin parpadeos.
- Manejo de videos de longitud arbitraria, según la documentación del repositorio original.
- Inferencia rápida en comparación con modelos de difusión (como DepthCrafter).
- Salida en formato float32, con dimensiones (T, H, W) para T frames.
- No incluye capacidades de tool calling, agentes, ni procesamiento de lenguaje natural; es un modelo puramente visual.

## Casos de uso

- Navegación de robots móviles: el robot puede estimar la profundidad de su entorno en tiempo real a partir de la cámara, permitiendo evitar obstáculos y planificar rutas. La consistencia temporal evita errores de percepción durante el movimiento.
- Realidad aumentada: integración de objetos virtuales en escenas reales con oclusión correcta, usando la profundidad para saber qué elementos están delante o detrás. El modelo puede procesar vídeo en directo para una experiencia fluida.
- Edición de video profesional: aplicación de efectos como desenfoque de profundidad, reiluminación o composición de planos, donde se necesita un mapa de profundidad estable para cada fotograma.
- Conducción autónoma: estimación de distancia a objetos (vehículos, peatones, señales) a partir de secuencias de vídeo de cámaras monoculares, complementando otros sensores como LiDAR.
- Reconstrucción 3D de escenas: a partir de un vídeo, se pueden generar nubes de puntos o mallas 3D utilizando los mapas de profundidad, útil para arquitectura, arqueología o inspección industrial.
- Vigilancia y seguridad: análisis de profundidad en secuencias de cámaras fijas para detectar intrusiones o medir distancias en entornos controlados.
- Postproducción cinematográfica: creación de efectos de cámara lenta o cambio de perspectiva usando la profundidad para generar interpolación de frames.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original reporta métricas en su página de HuggingFace, pero no se incluyen en la información proporcionada. La conversión MLX ha sido validada contra la referencia PyTorch, con un error relativo máximo de aproximadamente 1e-5 en CPU y 1% en GPU (Metal fast-math), lo que indica una alta fidelidad numérica.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB en FP32, menos en FP16/BF16 (típico en MLX). Cabe en cualquier Mac con 8 GB de RAM unificada o superior.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con soporte Metal. También puede ejecutarse en CPU, aunque con menor rendimiento.
- No requiere GPU NVIDIA; está optimizado para el ecosistema Apple.
- Opciones de despliegue: mediante la librería `mlx_vlm`, que incluye cargadores y predictores específicos. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada, pero al ser un modelo de 384M parámetros, se espera un rendimiento en tiempo real en hardware Apple Silicon moderno para resoluciones moderadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Video Depth Anything (MLX) | Estimacion de profundidad en video | 384M | Secuencias de video | Apache 2.0 | HuggingFace (MLX) |
| Video Depth Anything (PyTorch) | Estimacion de profundidad en video | 384M | Secuencias de video | Apache 2.0 | HuggingFace (PyTorch) |
| DepthCrafter | Estimacion de profundidad en video (difusion) | No disponible | Secuencias de video | No disponible | GitHub / HuggingFace |
| Depth Anything V2 | Estimacion de profundidad en imagen | No disponible | Imagen estatica | Apache 2.0 | HuggingFace |

La comparación cualitativa indica que Video Depth Anything supera a DepthCrafter en velocidad de inferencia y número de parámetros, manteniendo una precisión comparable. Depth Anything V2, al ser solo para imágenes, no ofrece consistencia temporal, por lo que no es adecuado para vídeo. La versión MLX ofrece la ventaja de ejecutarse en hardware Apple sin necesidad de GPU NVIDIA.

## Limitaciones y advertencias

- Posibles errores en regiones con oclusiones, superficies reflectantes o texturas ambiguas, comunes en modelos de profundidad monocular.
- La calidad de la estimación depende de la calidad del vídeo de entrada (resolución, iluminación, movimiento de cámara).
- La conversión MLX puede presentar pequeñas diferencias numéricas respecto al modelo original, especialmente en GPU con Metal fast-math (error relativo ~1%).
- No soporta otros idiomas ni tareas de lenguaje; es exclusivamente un modelo de visión.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo original y de los datos de entrenamiento si se utiliza en productos comerciales.
- No se han publicado benchmarks específicos para esta conversión MLX, por lo que el rendimiento en tareas concretas debe validarse en el entorno de despliegue.

## Enlaces

- Modelo MLX en HuggingFace: https://huggingface.co/jarjoura/video-depth-anything-large-mlx
- Modelo original en HuggingFace: https://huggingface.co/depth-anything/Video-Depth-Anything-Large
- Repositorio GitHub del proyecto: https://github.com/DepthAnything/Video-Depth-Anything
- Página del proyecto: https://videodepthanything.github.io/
