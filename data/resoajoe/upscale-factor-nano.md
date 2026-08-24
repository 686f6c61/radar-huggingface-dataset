# resoajoe/upscale-factor-nano

## Resumen

`upscale-factor-nano` es un modelo de clasificación de imágenes extremadamente compacto, desarrollado por resoajoe (Joe Cox), que determina si un parche de 64×64 píxeles ha sido reescalado desde un original más pequeño y, en caso afirmativo, estima el factor de ampliación (2×, 3× o 4×). Con solo 46.899 parámetros y un peso de 187 KB, está diseñado para ejecutarse en hardware de bajo coste, como dispositivos de borde, y se distribuye en formato ONNX bajo licencia MIT.

El modelo aborda un problema concreto: distinguir si una imagen "4K" procede realmente de una fuente de menor resolución, basándose en la periodicidad que deja el interpolación al reescalar. Según los datos del autor, supera ampliamente a cualquier estadístico escalar (como la varianza del Laplaciano o la entropía) en la tarea de estimar el factor de ampliación, alcanzando una precisión de 0.980 en datos no vistos. Se posiciona como una herramienta de triaje para auditoría de calidad, higiene de datasets y análisis forense básico, aunque no detecta deepfakes ni genera imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional (4 capas conv 16→32→48→64, BatchNorm, global average pool) |
| Parametros totales | 46.899 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no textual) |
| Tipos de cuantizacion | no disponible (formato ONNX estándar, sin cuantización documentada) |
| Idiomas soportados | no disponible (modelo de imagen, sin soporte de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional sencilla de cuatro capas con canales 16→32→48→64, normalización por lotes (BatchNorm) y una capa de pooling global que precede a la salida de clasificación. Se entrenó sobre 2.600 imágenes reales de COCO val2017, de las que se extrajeron parches nativos de 64×64, con una separación estricta por imagen fuente (75% entrenamiento, 25% validación). El proceso de aumento consistió en reducir la resolución original con interpolación por área (INTER_AREA) y restaurarla con un kernel seleccionado aleatoriamente entre cinco opciones: nearest, linear, cubic, Lanczos4 y area. El entrenamiento se realizó con Adam a una tasa de aprendizaje de 3e-3, durante 22 épocas y con un tamaño de lote de 64.

La innovación clave no está en la arquitectura, sino en la tarea: el modelo aprende a identificar la firma periódica que deja el reescalado, algo que ningún estadístico univariable logra capturar. La verificación de la implementación muestra una concordancia perfecta entre ONNX y PyTorch (100% de coincidencia en argmax y una diferencia relativa máxima de logits de 2.8e-07), lo que garantiza la fiabilidad del artefacto exportado.

## Capacidades

- Clasificación de parches de 64×64 en escala de grises como reescalados por factor 2×, 3× o 4×.
- Clasificación binaria adicional (implícita en el modelo) para detectar si la imagen fue reescalada o no.
- Detección de la firma periódica de interpolación, que no es capturable con medidas simples como la varianza o la entropía.
- Ejecución en CPU sin GPU, gracias a su tamaño mínimo (187 KB) y su formato ONNX.
- Inferencia rápida sobre múltiples parches de una misma imagen, permitiendo votación por mayoría para robustez.
- Entrenado exclusivamente sobre imágenes reales (COCO val2017) con reescalado real, lo que reduce el sesgo hacia artefactos sintéticos.
- Compatible con entornos de despliegue ligero (edge AI, Raspberry Pi, dispositivos móviles) mediante ONNX Runtime.

## Casos de uso

- Triage de flujos de video en streaming: decidir si merece la pena gastar presupuesto de decodificación en un stream que no tiene detalle real. Se pueden extraer varios parches de cada frame y aplicar una votación mayoritaria para clasificar la fuente como 720p reescalada a 4K.
- Higiene de datasets de entrenamiento: detectar imágenes que han sido reescaladas dentro de un corpus para evitar que el modelo aprenda artefactos de interpolación. El modelo puede procesar cada imagen por parches y marcar las sospechosas.
- Auditoría de calidad en hardware barato: verificar la resolución efectiva de imágenes en dispositivos de borde (cámaras IP, sensores industriales) sin necesidad de GPU, gracias a su tamaño y dependencias mínimas.
- Control de calidad en pipelines de generación de imágenes: comprobar si un proceso de upscaling automático ha introducido reescalado en lugar de reconstrucción de detalle, ayudando a identificar fallos en el flujo.
- Verificación de resolución en archivos históricos: analizar digitalizaciones de documentos o fotografías antiguas para saber si fueron ampliadas artificialmente, útil en conservación y archivo.
- Análisis forense básico de imágenes: como herramienta complementaria en investigaciones donde se sospeche que una imagen fue ampliada más allá de su resolución original, aunque el autor advierte que no es un detector de autenticidad ni de manipulación.

## Benchmarks y rendimiento

El modelo incluye métricas publicadas en la model card, comparando su rendimiento con el mejor estadístico escalar ajustado de forma optimista (in-sample) y con la probabilidad aleatoria:

| Tarea | upscale-factor-nano (held out) | Mejor escalar (in-sample) | Azar |
|---|---|---|---|
| Factor de reescalado (2×/3×/4×) | 0.980 | 0.489 | 0.344 |
| Imagen reescalada o no (binario) | 0.977 | 0.847 | 0.514 |

La verificación de la implementación ONNX frente a PyTorch reporta una diferencia relativa máxima de logits de 2.8e-07 y un 100% de concordancia en la clase predicha para 256 entradas de prueba. No se han publicado resultados en benchmarks estándar de clasificación de imágenes (ImageNet, etc.), ya que el modelo no está diseñado para esa tarea.

## Requisitos de hardware

- Tamaño del modelo: 187 KB, por lo que cabe en cualquier dispositivo con un mínimo de memoria.
- VRAM estimada para inferencia: 0 MB (se ejecuta en CPU; no requiere GPU).
- GPU recomendada: ninguna. El modelo está pensado para CPU y dispositivos de borde.
- Compatible con hardware de consumo: sí, incluyendo Raspberry Pi, teléfonos móviles y microcontroladores con soporte ONNX Runtime.
- Opciones de despliegue: ONNX Runtime con CPUExecutionProvider, o cualquier entorno que acepte modelos ONNX (OpenCV, TensorFlow Lite mediante conversión, etc.).
- Latencia y throughput: no se proporcionan mediciones oficiales, pero dado el tamaño (46.899 parámetros) y la arquitectura de 4 capas convolucionales, la inferencia por parche es del orden de microsegundos en CPU moderna; se recomienda procesar varios parches por imagen para obtener una votación robusta.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de detección de upscaling comparables en la documentación proporcionada. La model card no menciona alternativas ni benchmarks de referencia. En la búsqueda web no se encontraron otros modelos del mismo tipo con métricas comparables. Por tanto, la comparativa se limita a los datos internos del propio modelo frente a estadísticos clásicos (media, desviación, varianza del Laplaciano, relación HF, gradiente, entropía), que logran entre 0.357 y 0.489 en la tarea de factor, muy por debajo del 0.980 del modelo.

## Limitaciones y advertencias

- El modelo asume que la imagen fue reescalada: la cabeza de tres clases siempre responde 2×, 3× o 4×. Para una clasificación binaria fiable, hay que usar la cabeza binaria o un control adicional antes de interpretar el resultado.
- Solo está entrenado con cinco kernels de interpolación (nearest, linear, cubic, Lanczos4, area). Un upscaler neuronal o un kernel fuera de ese conjunto no está testeado y es probable que falle.
- Trabaja exclusivamente en escala de grises con parches de 64×64; no utiliza artefactos de upsampling de croma, lo que limita su sensibilidad en imágenes en color.
- La compresión fuerte posterior al reescalado puede atenuar la firma periódica; no se ha probado con material muy recomprimido.
- Las regiones planas (cielo, paredes, desenfocados) no contienen información útil para el modelo; hay que seleccionar parches con textura para obtener resultados significativos.
- No es un detector de deepfakes, ni de generación por IA, ni un índice de calidad de imagen general. Un upscaling no implica manipulación, y el modelo no debe usarse como prueba de autenticidad.
- Licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías de exactitud en casos extremos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/resoajoe/upscale-factor-nano
- Perfil del autor (resoajoe): https://huggingface.co/resoajoe
- No se proporcionan papers, repositorios adicionales o demos en la documentación disponible.
