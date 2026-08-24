# resoajoe/camera-motion-nano

## Resumen

`camera-motion-nano` es un modelo de clasificación de vídeo ultraligero desarrollado por resoajoe (Joe Cox) que determina el movimiento de la cámara en un clip: si permanece estática, hace un paneo horizontal o vertical, realiza un zoom (acercamiento o alejamiento) o si presenta sacudida. Su principal innovación es que no analiza píxeles, sino los vectores de movimiento que el códec de vídeo ya ha calculado y almacenado en el bitstream durante la codificación. Esto lo convierte en una solución extremadamente eficiente para dispositivos con recursos limitados, ya que solo necesita procesar una rejilla de 16×16×2 de desplazamientos medios por celda.

El modelo tiene 47.238 parámetros y ocupa 189 KB en formato ONNX, lo que lo hace apto para ejecutarse en CPU de bajo consumo o incluso en microcontroladores. El autor es un desarrollador independiente que se centra en nano-modelos para aplicaciones industriales. Aunque no se especifica una arquitectura concreta en la ficha, se describe como una red convolucional de 4 capas con BatchNorm y agrupación global, con una cabeza de clasificación de 6 clases. El modelo fue entrenado con datos sintéticos generados aplicando transformaciones afines a imágenes del dataset COCO y codificándolas con un códec H.264 real.

La relevancia de este modelo radica en su enfoque poco convencional: aprovecha información que normalmente se descarta para obtener una precisión superior a la de un modelo que procesa píxeles, con un coste computacional mucho menor. Su licencia MIT permite su uso comercial sin restricciones, y su tamaño lo convierte en una opción atractiva para aplicaciones de vigilancia, indexación de metraje y control de estabilizadores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional de 4 capas (16→32→48→64) con BatchNorm, pooling global y cabeza de 6 clases |
| Parámetros totales | 47.238 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificación de vídeo, sin contexto de texto) |
| Tipos de cuantización | no disponible (formato ONNX, sin cuantización especificada) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no indicado) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional pequeña de 4 capas (16→32→48→64 filtros), con normalización por lotes (BatchNorm) tras cada capa, un pooling global promedio y una cabeza totalmente conectada que produce 6 salidas correspondientes a las clases: `static`, `pan_x`, `pan_y`, `zoom_in`, `zoom_out` y `shake`. La entrada es un campo de vectores de movimiento de 16×16×2 (desplazamientos horizontales y verticales) que se redimensiona a 64×64 y se normaliza mediante el parámetro `motion_scale` del códec.

El entrenamiento se realizó sobre 1.096 clips de entrenamiento y 368 de test, divididos por fotografía fuente para evitar fugas de datos. Los clips se generaron aplicando transformaciones afines a imágenes reales de COCO val2017 y codificándolas con H.264 (CRF 23, resolución 320×320, 15 fps, 14 frames por clip). La amplitud del movimiento se aleatorizó por clip para evitar que el modelo dependiera únicamente de la magnitud del desplazamiento. Se usó el optimizador Adam con tasa de aprendizaje 3e-3, 30 épocas y tamaño de batch 64.

No se menciona el uso de RLHF, DPO u otras técnicas de ajuste fino; es un entrenamiento supervisado estándar. La innovación clave es el uso de vectores de movimiento del códec en lugar de píxeles, lo que aprovecha el trabajo de estimación de movimiento ya realizado por el codificador.

## Capacidades

- Clasificación de movimiento de cámara en seis categorías: estática, paneo horizontal, paneo vertical, zoom-in, zoom-out y sacudida.
- No procesa píxeles, solo vectores de movimiento extraídos del bitstream, lo que lo hace extremadamente ligero (189 KB, 47 K parámetros).
- Precisión reportada del 99,2% sobre el conjunto de test, con recall por clase que varía entre 0,983 y 1,000.
- Funciona en hardware sin GPU: solo requiere CPU y la biblioteca ONNX Runtime.
- Es inmune a variaciones de iluminación, color o textura, ya que no analiza el contenido visual.
- No soporta tool calling, ni razonamiento multilingüe, ni generación de texto o código.

## Casos de uso

- **Detección de manipulación de cámaras fijas**: un sistema de vigilancia puede ejecutar `camera-motion-nano` en un dispositivo edge para detectar si una cámara ha sido movida o sacudida, sin necesidad de transmitir vídeo a un servidor central. Al procesar solo vectores de movimiento, el consumo de CPU es mínimo y puede funcionar en un Raspberry Pi o similar.
- **Triaje e indexación de metraje**: en un archivo de vídeo, este modelo puede clasificar rápidamente cada clip según el tipo de movimiento (paneo, zoom, estático) para facilitar búsquedas por contenido cinematográfico. Por ejemplo, un editor podría filtrar todas las tomas con zoom-in para una secuencia concreta.
- **Activación de estabilizador**: en drones o cámaras de acción, el modelo puede decidir si activar el estabilizador electrónico de imagen cuando detecta sacudida o paneo excesivo, ahorrando energía al no estabilizar en tomas estáticas.
- **Análisis de actividad en entornos fijos**: en tiendas o espacios públicos, el modelo puede diferenciar entre una cámara estática y una que está siendo movida, lo que ayuda a detectar vandalismo o robo de cámaras.
- **Optimización de almacenamiento**: en sistemas de grabación continua, se puede usar el modelo para descartar automáticamente clips que son completamente estáticos (sin movimiento), reduciendo el espacio de almacenamiento al no conservar horas de vídeo sin eventos.
- **Clasificación de tomas en postproducción**: en un flujo de edición de vídeo, el modelo puede etiquetar automáticamente cada clip como paneo, zoom o estático, ahorrando tiempo a los editores al buscar la toma deseada.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es de lenguaje. El autor reporta los siguientes datos de precisión en su model card, comparando con un modelo de píxeles de la misma arquitectura y con un clasificador escalar simple:

| Método | Precisión |
|---|---|
| **camera-motion-nano (vectores de movimiento)** | **0.992** |
| Modelo de píxeles (dos frames 64×64, misma arquitectura) | 0.785 |
| Mejor clasificador escalar ajustado en el conjunto de entrenamiento | 0.467 |
| Azar (6 clases) | 0.167 |

La precisión por clase reportada es: estática 1.000, pan-x 0.984, pan-y 1.000, zoom-in 0.983, zoom-out 1.000, shake 0.984. El modelo supera al modelo de píxeles en +0.207 puntos de precisión, y al clasificador escalar en +0.524 puntos, lo que justifica su uso en lugar de un umbral simple.

## Requisitos de hardware

- **VRAM**: no requiere VRAM dedicada; el modelo se ejecuta en CPU con menos de 200 MB de memoria RAM (peso de 189 KB).
- **GPU**: no se necesita ninguna GPU. Funciona en cualquier procesador x86, ARM o incluso microcontroladores con soporte ONNX Runtime.
- **Consumer GPU**: no aplica, pero se puede ejecutar en cualquier hardware con CPU.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, WebAssembly), también se podría convertir a TensorFlow Lite o TFLite para móviles, aunque no se especifica en la documentación.
- **Latencia**: en un CPU moderno, la inferencia debería ser inferior a 1 ms por clip, dado el tamaño del modelo y la entrada de 64×64×2. No se proporcionan mediciones exactas.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de clasificación de movimiento de cámara basados en vectores de movimiento del códec. El propio autor no menciona alternativas comparables. Los modelos tradicionales de clasificación de vídeo (como I3D o SlowFast) usan píxeles y requieren mucha más computación, pero no son comparables en tamaño ni en enfoque. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Entrenamiento específico**: el modelo fue entrenado con clips de 14 frames a ~15 fps, resolución 320×320, H.264 CRF 23. Cambios en la estructura GOP, la tasa de fotogramas o la resolución pueden alterar las estadísticas de los vectores de movimiento y degradar la precisión. Es necesario re-evaluar antes de usarlo en otros entornos.
- **Frames intra sin vectores**: los fotogramas intra (I-frames) no contienen vectores de movimiento. Un clip que consista solo en I-frames produce un campo vacío y el modelo fallará. En la práctica, solo una pequeña proporción de frames son intra, pero hay que tenerlo en cuenta.
- **Confusión con objetos en movimiento**: el modelo no separa el movimiento de la cámara del movimiento de objetos grandes. Un sujeto cercano que se mueve a la izquierda puede producir un campo de vectores similar a un paneo, lo que puede llevar a falsos positivos.
- **Movimiento sintético**: los datos de entrenamiento son generados sintéticamente (transformaciones afines sobre imágenes reales) y no incluyen el desplazamiento de rolling shutter ni componentes no rígidos del movimiento real de mano. La precisión en vídeo real puede ser menor.
- **Clases gruesas**: solo distingue 6 tipos de movimiento, no proporciona desplazamiento en píxeles ni parámetros de transformación.
- **Licencia**: MIT permite uso comercial y modificación, pero no se incluye garantía ni responsabilidad del autor.
- **No es un modelo de seguimiento de objetos**: no identifica personas u objetos, solo describe el movimiento global de la cámara.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/resoajoe/camera-motion-nano)
- [Perfil del autor en Hugging Face](https://huggingface.co/resoajoe)

No se encontraron otros enlaces (papers, blogs, repos) en la búsqueda web.
