# EclipseAidge/SuperPoint

## Resumen

EclipseAidge/SuperPoint es una exportación a ONNX del modelo original SuperPoint, un detector y descriptor de puntos de interés de imágenes desarrollado por el equipo de SuperPoint en el repositorio `rpautrat/SuperPoint`. La exportación ha sido realizada por PrunaAI y se publica bajo licencia MIT, con el objetivo de servir como modelo base en un tutorial de poda (pruning) para el framework Aidge.

SuperPoint es una red neuronal convolucional completamente convolucional que opera sobre la imagen completa y predice simultáneamente la ubicación de puntos clave (keypoints) y sus descriptores. El modelo resuelve problemas de correspondencia múltiple en visión por computador, como SLAM, odometría visual o reconstrucción 3D. Esta versión específica fue creada el 8 de septiembre de 2026 y exportada con ONNX opset 18, presentando una entrada única de forma `[1, 1, 768, 1024]` y tres salidas: keypoints, scores y descriptores.

Dado que se trata de un modelo de visión por computador, no de un modelo de lenguaje, no dispone de ventana de contexto ni soporte de idiomas. Su renombre en el campo de la geometría multivista y su licencia permisiva lo hacen relevante para integraciones en pipelines de visión embebida y móvil, así como para estudios de compresión y poda.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional completamente convolucional (Fully-convolutional network) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No aplica (modelo de visión por computador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18) |

## Arquitectura y entrenamiento

SuperPoint es una arquitectura completamente convolucional compuesta por un encoder compartido (basado en VGG) y dos cabezales de salida: uno para detección de puntos de interés (interest point detector) y otro para la generación de descriptores (descriptor head). Esto permite procesar la imagen en una única pasada hacia adelante, obteniendo salidas densas a nivel de píxel. El modelo fue entrenado de forma auto-supervisada, tal y como se describe en el repositorio original y en la documentación de edge-ai-suites, sin necesidad de anotaciones manuales para los puntos clave.

La exportación a ONNX se realizó con el objetivo de facilitar la ejecución en entornos como Aidge, y el modelo se ofrece como base para un tutorial de poda. Los datos de entrenamiento (composición del dataset, número de épocas, etc.) no se detallan en la información disponible. No se menciona el uso de RLHF, DPO ni técnicas de alineación, ya que no es un modelo generativo.

## Capacidades

- Detección de puntos clave (keypoints) en imágenes, devolviendo hasta 512 coordenadas `(x, y)` por imagen.
- Cálculo de puntuaciones (scores) de confianza para cada keypoint, en un tensor de forma `[1, 512]`.
- Generación de descriptores de 256 dimensiones por cada keypoint, útiles para matching de características.
- Operación sobre la imagen completa sin necesidad de parches, lo que permite obtener salidas densas.
- Compatibilidad con frameworks de inferencia ONNX y librerías de poda como Aidge.
- Adecuado para tareas de geometría multivista: correspondencia entre vistas, estimación de pose, reconstrucción 3D, etc.

## Casos de uso

- SLAM visual: el modelo detecta y describe puntos característicos en cada fotograma, permitiendo el seguimiento de la cámara y la construcción de mapas 3D en tiempo real.
- Odometría visual: los keypoints y descriptores se emparejan entre fotogramas consecutivos para estimar el movimiento del sensor.
- Reconstrucción 3D (Structure from Motion): los descriptores permiten encontrar correspondencias entre imágenes candidatas para crear nubes de puntos y modelos tridimensionales.
- Emparejamiento de imágenes (image matching): se utiliza para localizar una imagen dentro de una base de datos de imágenes, útil en aplicaciones de realidad aumentada o búsqueda visual.
- Tracking de objetos: los puntos clave estables permiten seguir regiones de interés en secuencias de vídeo, incluso con cambios de perspectiva o iluminación.
- Estudio de compresión de modelos: al estar diseñado como base para un tutorial de poda, sirve para experimentar con técnicas de reducción de parámetros manteniendo la precisión de detección y descripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se ha proporcionado información sobre requisitos de hardware en la documentación consultada. Los datos de VRAM, GPU recomendadas, latencia o throughput no están disponibles. Al tratarse de un modelo convolucional de tamaño moderado (aunque no se especifica el número de parámetros), es probable que pueda ejecutarse en hardware de consumo, pero esta afirmación no puede confirmarse sin datos concretos.

## Comparativa con modelos similares

No se dispone de una comparativa oficial con otros modelos en la información proporcionada. A efectos de contexto, los sistemas tradicionales de extracción de características como SIFT y ORB son alternativas de referencia en tareas de geometría multivista, mientras que otras redes neuronales como D2-Net o R2D2 compiten en el mismo ámbito. La licencia MIT de SuperPoint y su exportación ONNX lo distinguen de soluciones propietarias o de acceso restringido.

## Limitaciones y advertencias

- Al ser un modelo de visión, no puede usarse para generación de texto, razonamiento simbólico ni tareas de lenguaje.
- La información disponible no detalla sesgos específicos, pero los modelos de detección de puntos clave pueden mostrar menor robustez ante cambios extremos de iluminación, texturas repetitivas o imágenes sintéticas.
- No se documentan restricciones de uso comercial. La licencia MIT permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright.
- La exportación a ONNX está vinculada a un tutorial de poda de Aidge; el modelo consumido fuera de ese ecosistema puede requerir adaptaciones en el preprocesado de la entrada (`[1, 1, 768, 1024]`).
- La salida de keypoints está limitada a un máximo de 512 puntos, lo que puede ser insuficiente para escenas muy ricas en texturas si se necesitan más correspondencias.

## Enlaces

- HuggingFace: https://huggingface.co/EclipseAidge/SuperPoint
- Repositorio del modelo original: https://github.com/rpautrat/SuperPoint
- Tutorial de edge-ai-suites sobre SuperPoint: https://github.com/open-edge-platform/edge-ai-suites/blob/main/robotics-ai-suite/docs/embodied/model_tutorials/model_superpoint.rst
