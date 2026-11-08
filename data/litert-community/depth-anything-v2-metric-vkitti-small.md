# litert-community/Depth-Anything-V2-Metric-VKITTI-Small

## Resumen

Depth-Anything-V2-Metric-VKITTI-Small es un modelo de estimación de profundidad monocular métrica desarrollado originalmente por Lihe Yang y colaboradores (Depth Anything V2) y exportado a LiteRT/TFLite por la comunidad `litert-community`. Se trata de un checkpoint ViT-S (Small) afinado sobre el conjunto sintético Virtual KITTI 2 para escenas de conducción en exterior, que devuelve mapas de profundidad en metros reales en lugar de profundidad relativa.

Este repositorio concreto no contiene los pesos originales en PyTorch, sino una conversión FP32 a un fichero TFLite de 98,91 MB con formas fijas, pensada para inferencia en CPU y despliegue en dispositivos de borde. La interfaz es minimalista: una entrada `pixel_values` de `[1, 3, 518, 518]` y una salida `depth_metres` de `[1, 518, 518]`.

Su relevancia práctica reside en que permite incorporar estimación de profundidad métrica en pipelines ligeros (móvil, embebido, navegador) sin depender de frameworks de deep learning pesados, manteniendo la escala métrica del modelo fuente con `max_depth=80`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S) con cabecera de regresión densa de profundidad (Depth Anything V2, variante métrica) |
| Parametros totales | no disponible (backbone ViT-S, tamaño Small; cifra exacta no publicada en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 518 × 518 píxeles) |
| Tipos de cuantizacion | FP32 (única variante publicada en este repo) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite / LiteRT (`.tflite`), FP32, formas fijas, firma `main` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Depth Anything V2: un backbone transformer de visión (ViT-S en esta variante) que produce características densas y una cabecera de decodificación que las transforma en un mapa de profundidad por píxel. En esta versión métrica, la salida está calibrada en metros, con configuración `max_depth=80` heredada del checkpoint fuente.

El checkpoint original fue afinado sobre Virtual KITTI 2, un dataset sintético de escenas de conducción en exterior. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF/DPO (no aplicable en un modelo de regresión densa). La innovación relevante de la familia Depth Anything V2 es el uso de datos sintéticos etiquetados de alta calidad combinados con pseudo-etiquetado sobre imágenes reales no etiquetadas, que permite obtener profundidad métrica robusta sin depender exclusivamente de sensores LiDAR. La exportación LiteRT conserva los pesos preentrenados originales y fija las formas para permitir inferencia en CPU.

## Capacidades

- Estimación de profundidad monocular métrica: devuelve un mapa `[518, 518]` con valores en metros.
- Escenas de exterior orientadas a conducción: afinado específicamente sobre Virtual KITTI 2.
- Inferencia en CPU sin GPU: el fichero TFLite funciona con el intérprete `ai-edge-litert`.
- Entrada de imagen fija 518 × 518 con preprocesado estándar (center-crop, normalización ImageNet, NCHW).
- Salida en escala métrica real, apta para mediciones de distancia, no solo para visualización.
- No soporta tool calling, agentes, texto, audio ni razonamiento multi-paso: es exclusivamente un modelo de visión para regresión densa.
- No tiene capacidades multilingües (no procesa lenguaje).

## Casos de uso

- Percepción en vehículos autónomos y ADAS de bajo coste: el modelo estima distancias métricas a objetos en escenas de conducción, lo que permite alimentar módulos de planificación o alerta de colisión sin LiDAR, usando solo una cámara monocular.
- Robótica móvil en interiores y exteriores: integración en robots con CPU embebida para evitar obstáculos, aprovechando el tamaño reducido del TFLite (98,91 MB) y la inferencia en CPU.
- Realidad aumentada y reconstrucción 3D: generación de mapas de profundidad métrica por fotograma para anclar objetos virtuales a distancias reales, con preprocesado determinista y salida en metros.
- Drones y dispositivos de borde: despliegue en hardware con recursos limitados gracias al formato LiteRT y a la ausencia de dependencias de CUDA o PyTorch.
- Análisis de vídeo de tráfico: estimación de distancias entre vehículos y peatones en grabaciones de cámaras fijas o móviles, útil para métricas de seguridad vial.
- Prototipado rápido en Python: el ejemplo de la model card permite ejecutar el modelo en pocas líneas con `ai-edge-litert`, `huggingface_hub` y OpenCV, lo que facilita validar la viabilidad antes de invertir en infraestructura.
- Aumento de datos sintéticos: uso del modelo como generador de profundidad de referencia en pipelines de entrenamiento con imágenes sintéticas o aumentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para la variante TFLite FP32, que está pensada para CPU; en GPU el consumo sería mínimo (modelo de ~99 MB), pero no se documenta.
- GPU recomendadas: no disponible; el export está orientado a CPU.
- ¿Cabe en GPU de consumo? Sí, con holgura, al tratarse de un modelo de ~99 MB en FP32, aunque la ruta oficial es CPU.
- Opciones de despliegue: intérprete LiteRT (`ai-edge-litert`) en Python; el formato TFLite también es compatible con runtimes LiteRT en Android, iOS y Linux embebido.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything-V2-Metric-VKITTI-Small (este repo, LiteRT) | ViT-S, cifra exacta no disponible | Imagen fija 518 × 518 | Profundidad métrica en metros | Apache 2.0 | TFLite FP32 |
| depth-anything/Depth-Anything-V2-Metric-VKITTI-Small (original) | ViT-S, cifra exacta no disponible | Imagen variable (resize a múltiplo de 14) | Profundidad métrica en metros | Apache 2.0 | PyTorch (safetensors) |
| Depth-Anything-V2 (variantes Base/Large métricas) | ViT-B / ViT-L, cifras no disponibles | Imagen variable | Profundidad métrica en metros | Apache 2.0 | PyTorch |
| Otros estimadores monoculares métricos (p. ej. ZoeDepth, Metric3D) | no disponible | Imagen variable | Profundidad métrica | varía según modelo | varía según modelo |

La diferencia principal frente al checkpoint original es el formato: el original es PyTorch con formas dinámicas, mientras que esta exportación LiteRT fija la entrada a 518 × 518 y elimina dependencias de PyTorch, a cambio de perder flexibilidad de resolución.

## Limitaciones y advertencias

- La entrada es de forma fija 518 × 518: cualquier imagen debe recortarse a cuadrado y redimensionarse, lo que descarta los márgenes de la imagen original (sin predicciones en esas zonas).
- El modelo está afinado sobre Virtual KITTI 2 (sintético, conducción en exterior); su generalización a interiores, escenas no viales o dominios muy distintos puede degradarse.
- La escala métrica depende de la calibración del checkpoint fuente (`max_depth=80`); no se garantiza precisión absoluta en dominios alejados del entrenamiento.
- La normalización min/max por imagen destruye la escala métrica: solo debe usarse para visualización.
- Riesgo de sesgos y errores en objetos poco representados en el dataset sintético (peatones, motocicletas, condiciones meteorológicas extremas).
- No se documentan métricas de error (AbsRel, RMSE) en este repositorio, por lo que no es posible cuantificar su precisión sin evaluarla.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset Virtual KITTI 2.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Depth-Anything-V2-Metric-VKITTI-Small
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-VKITTI-Small
- Revisión del checkpoint fuente: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-VKITTI-Small/tree/c725b8589bdf6ab04072cab74c0467830db80d6d
- Proyecto Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Implementación de profundidad métrica: https://github.com/DepthAnything/Depth-Anything-V2/tree/a561b849ebae10a6f5ef49e26c83cbbcd36c71bf/metric_depth
- Paper: https://arxiv.org/abs/2406.09414
- Fichero del modelo: https://huggingface.co/litert-community/Depth-Anything-V2-Metric-VKITTI-Small/blob/main/Depth-Anything-V2-Metric-VKITTI-Small-fp32.tflite
- Sumas de verificación: https://huggingface.co/litert-community/Depth-Anything-V2-Metric-VKITTI-Small/blob/main/SHA256SUMS
