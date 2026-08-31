# jarjoura/video-depth-anything-small-mlx

## Resumen

Video Depth Anything Small (MLX) es una conversión al ecosistema MLX del modelo original Video-Depth-Anything-Small desarrollado por ByteDance, presentado como destacado en CVPR 2025. El modelo resuelve el problema de estimación de profundidad monocular en vídeo con consistencia temporal, es decir, produce mapas de profundidad por fotograma que mantienen coherencia entre frames consecutivos, algo crítico para aplicaciones como robótica, realidad aumentada o edición de vídeo. Esta versión MLX, creada por el usuario jarjoura, permite ejecutar el modelo en hardware Apple Silicon con aceleración Metal, manteniendo una precisión equivalente a la referencia PyTorch (error relativo máximo del orden de 1e-5 en CPU y ~1% en GPU con fast-math).

La arquitectura combina un backbone DINOv2-vits (versión pequeña) con una cabeza DPT temporal, lo que da un total de 29.080.193 parámetros, un tamaño muy reducido que lo hace adecuado para despliegue en dispositivos con recursos limitados. El modelo acepta secuencias de vídeo de hasta 300 fotogramas a una tasa de 15 fps en la implementación de referencia, y genera mapas de profundidad en formato float32. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2-vits backbone + cabeza DPT temporal |
| Parametros totales | 29.080.193 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa secuencias de vídeo, hasta 300 fotogramas en la implementación de referencia) |
| Tipos de cuantizacion | No disponible (formato MLX nativo, sin cuantización documentada) |
| Idiomas soportados | No disponible (modelo de visión, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en Depth Anything V2, que utiliza un backbone DINOv2 preentrenado (variante small, vits) y una cabeza DPT (Dense Prediction Transformer) modificada para procesar secuencias temporales. La innovación principal reside en la cabeza temporal, que incorpora información de fotogramas adyacentes para mantener consistencia en la profundidad a lo largo del vídeo, evitando parpadeos o saltos entre frames. A diferencia de enfoques basados en difusión, este modelo es determinista y mucho más ligero, lo que permite inferencia en tiempo real en hardware modesto.

El entrenamiento se realizó sobre el mismo conjunto de datos y estrategia que Depth Anything V2, aunque los detalles específicos del dataset (número de tokens, composición) no se han publicado en la información disponible. No se menciona el uso de RLHF o DPO, ya que es un modelo puramente de visión. La conversión a MLX se realizó con la herramienta oficial de mlx-vlm, y se validó contra la referencia PyTorch con un error relativo máximo de ~1e-5 en CPU y ~1% en GPU (Metal fast-math).

## Capacidades

- Estimación de profundidad monocular en vídeo: genera un mapa de profundidad por fotograma (formato float32, dimensiones HxW) para secuencias de vídeo.
- Consistencia temporal: mantiene coherencia entre fotogramas consecutivos, reduciendo artefactos de parpadeo.
- Generalización a vídeos del mundo real: basado en Depth Anything V2, que demostró robustez en escenas abiertas.
- Inferencia eficiente: al ser un modelo pequeño (29M parámetros), es adecuado para ejecución en tiempo real en dispositivos con aceleración Metal (Apple Silicon) o incluso CPU.
- Integración con MLX: compatible con el ecosistema mlx-vlm, permitiendo cargar y ejecutar el modelo con pocas líneas de código.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multimodal; es exclusivamente un modelo de visión para profundidad.

## Casos de uso

- Robótica móvil: el modelo puede proporcionar estimaciones de profundidad en tiempo real para navegación y evitación de obstáculos, gracias a su bajo coste computacional y consistencia temporal.
- Realidad aumentada y mixta: permite ocluir objetos virtuales correctamente en escenas dinámicas, usando la profundidad por fotograma para ajustar la perspectiva.
- Edición de vídeo y postproducción: facilita la separación de planos, efectos de desenfoque (bokeh) o inserción de elementos 3D con profundidad coherente.
- Conducción autónoma y asistencia al conductor: puede estimar la distancia a objetos en secuencias de vídeo de cámaras monocular, complementando sensores LiDAR.
- Análisis de vídeo deportivo o de vigilancia: permite medir distancias o dimensiones de objetos en movimiento, útil para análisis de rendimiento o seguridad.
- Generación de contenido 3D: los mapas de profundidad pueden usarse para reconstrucción de escenas o generación de nubes de puntos a partir de vídeo, con aplicaciones en fotogrametría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es la comparación con la referencia PyTorch: error relativo máximo de ~1e-5 en CPU y ~1% en GPU (Metal fast-math), lo que confirma la fidelidad de la conversión MLX, pero no hay métricas estándar como RMSE, δ1 o comparaciones con otros modelos en conjuntos como KITTI o Sintel.

## Requisitos de hardware

- VRAM estimada: al tener solo 29M parámetros, el modelo ocupa aproximadamente 116 MB en float32 (29M × 4 bytes). Con cuantización a 8 bits (si se aplicara) bajaría a ~29 MB, aunque no hay cuantización documentada.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon M1 o superior) para máxima eficiencia; también funciona en CPU, aunque con mayor latencia.
- Cabe en cualquier GPU de consumo: sí, incluso en iGPUs o GPUs integradas de portátiles modernos.
- Opciones de despliegue: se integra con mlx-vlm (Python), y puede usarse con la API de carga de modelos de MLX. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de visión específico.
- Latencia y throughput: no hay datos publicados, pero dado el tamaño reducido, se espera inferencia en tiempo real (varios fps) en Apple Silicon; en CPU puede ser más lento, pero aún viable para procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Consistencia temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Video Depth Anything Small (MLX) | 29M | DINOv2 + DPT temporal | Sí | Apache-2.0 | HuggingFace (MLX) |
| Video Depth Anything Small (original) | 29M | DINOv2 + DPT temporal | Sí | Apache-2.0 | HuggingFace (PyTorch) |
| DepthCrafter | No disponible | Basado en difusión | Sí (pero más lento) | No disponible | No disponible |

La comparativa se basa en información cualitativa de la página del proyecto: Video Depth Anything es más rápido, con menos parámetros y mayor precisión consistente que modelos de difusión como DepthCrafter. No hay datos numéricos de benchmarks para una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos de vídeo del mundo real, puede presentar errores en escenas con texturas repetitivas, superficies reflectantes o condiciones de iluminación extremas, aunque no se documentan sesgos específicos.
- Riesgo de alucinación: en visión, el equivalente sería generar profundidades incorrectas en regiones ambiguas; no hay datos sobre la frecuencia de estos fallos.
- Limitaciones de contexto: la implementación de referencia limita a 300 fotogramas y 15 fps; secuencias más largas requieren dividir el vídeo, lo que puede afectar la consistencia global.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la licencia en redistribuciones.
- Caveat para producción: la conversión MLX está validada contra la referencia PyTorch, pero el error en GPU con fast-math (~1%) puede ser relevante en aplicaciones de alta precisión; se recomienda validar en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jarjoura/video-depth-anything-small-mlx
- Modelo original (PyTorch): https://huggingface.co/depth-anything/Video-Depth-Anything-Small
- Repositorio GitHub oficial: https://github.com/DepthAnything/Video-Depth-Anything
- Página del proyecto: https://videodepthanything.github.io/
