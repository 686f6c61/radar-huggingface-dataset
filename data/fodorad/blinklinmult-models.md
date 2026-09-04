# fodorad/blinklinmult-models

## Resumen

BlinkLinMulT es un conjunto de modelos de visión por computadora especializados en la detección de parpadeos y el reconocimiento del estado ocular, desarrollado por fodorad como parte del proyecto BlinkLinMulT. El repositorio incluye cuatro modelos: tres versiones publicadas en el paper *BlinkLinMulT: Transformer-Based Eye Blink Detection* (J. Imaging, 2023), exportadas como grafos ONNX congelados, y una cuarta versión v2 en pesos PyTorch. Estos modelos resuelven dos tareas complementarias: la clasificación por frame de si el ojo está cerrado o abierto, y la detección de eventos temporales de parpadeo (intervalos de inicio y fin). La relevancia actual radica en su aplicabilidad a sistemas de análisis de fatiga, interfaces humano-computador y estudios de comportamiento, con un tamaño de repositorio de 0.1 GB que sugiere modelos ligeros y desplegables en entornos con recursos limitados. Las arquitecturas incluyen DenseNet121, una combinación de DenseNet121 con el módulo LinT (Transformer) y ConvNeXt-Femto, todas orientadas a procesar secuencias de imágenes de la región ocular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet121 (frame-wise), DenseNet121 + LinT (secuencia), ConvNeXt-Femto (v2 frame-wise) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX y PyTorch (.pt) |

## Arquitectura y entrenamiento

Los cuatro modelos son redes neuronales de visión que operan sobre recortes de la región ocular, no sobre imágenes completas. Los modelos 1.x (`densenet121-union`, `blinklint-union` y `blinklinmult-union`) se basan en una arquitectura DenseNet121 para la extracción de características por frame; `blinklint-union` añade el módulo LinT (Transformer) para modelar dependencias temporales, mientras que `blinklinmult-union` es un modelo two-stream que combina los recortes oculares con un descriptor de 160 dimensiones (landmarks de iris, distancias de párpados, EAR y pose de cabeza). El modelo v2 (`blinkcnn`) utiliza ConvNeXt-Femto y opera únicamente sobre recortes oculares.

Los datos de entrenamiento provienen de corpus públicos de parpadeos, aunque no se especifican en la información disponible el número de muestras ni la composición exacta. Los modelos 1.x fueron exportados desde los pesos PyTorch originales publicados y verificados contra ellos en longitudes de ventana de 1, 15, 30 y 45 frames, con una desviación máxima observada de 3.4e-05, consistente con el redondeo float32. No se menciona ningún proceso de RLHF o DPO. Una innovación destacable es la inclusión de archivos JSON sidecar que registran la normalización, el opset y la tolerancia de paridad, lo que facilita la reproducibilidad.

## Capacidades

- Detección de parpadeos como eventos temporales, devolviendo intervalos de inicio y fin en índices de frame.
- Reconocimiento del estado ocular por frame, con una probabilidad de cierre para cada frame de la secuencia.
- Procesamiento de secuencias de longitud variable: el eje temporal es dinámico, admitiendo desde un único frame (`T=1`) hasta vídeos completos.
- Dos generaciones de modelos: los 1.x (ONNX) y la v2 (PyTorch), con convenciones de normalización distintas que el usuario debe respetar.
- Exportación a ONNX para los modelos 1.x, lo que permite su despliegue en entornos sin PyTorch.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de fatiga del conductor: el modelo puede procesar vídeo de la región ocular y generar una señal de probabilidad de cierre por frame, permitiendo detectar parpadeos prolongados o microsueños en tiempo real. Es adecuado porque su salida de intervalos (`(start, end)`) permite calcular la duración y frecuencia de los parpadeos.
- Interfaces humano-computador (HCI): el parpadeo puede utilizarse como comando de entrada en sistemas de accesibilidad, por ejemplo para seleccionar opciones en un menú mediante un parpadeo intencionado. El modelo ofrece detección por frame y eventos, lo que facilita distinguir parpadeos voluntarios de los involuntarios.
- Investigación en psicología experimental: los investigadores pueden cuantificar la tasa de parpadeo y la duración del cierre ocular en vídeos de participantes, utilizando la salida de intervalos para análisis estadístico. La compatibilidad con secuencias de longitud variable permite analizar clips de duración arbitraria.
- Diagnóstico y seguimiento en neurología: ciertos trastornos neurológicos alteran los patrones de parpadeo. El modelo puede usarse para monitorizar estos patrones en vídeos clínicos, siempre que se disponga de recortes oculares con la geometría adecuada.
- Seguridad y vigilancia en entornos laborales: en puestos de trabajo que requieren atención visual sostenida, el modelo puede integrarse en sistemas de vídeo para alertar sobre estados de somnolencia o baja alerta, gracias a su capacidad de detectar parpadeos y cierres oculares.
- Automatización de análisis de vídeo en investigación de visión por computador: los modelos pueden emplearse como componentes en pipelines de clasificación de vídeo para etiquetar automáticamente secuencias de ojos, por ejemplo en la construcción de datasets de entrenamiento o en la anotación de vídeos de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (MDPI, J. Imaging 2023) y el repositorio de GitHub mencionan un rendimiento comparable o superior al estado del arte en dos tareas sobre siete bases de datos públicas, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Los modelos son ligeros (repositorio de 0.1 GB) y pueden ejecutarse en CPU mediante ONNX Runtime, aunque no hay datos publicados de latencia o throughput.
- Los modelos 1.x requieren `blinklinmult[onnx]`; el modelo `blinkcnn` requiere PyTorch.
- Opciones de despliegue: ONNX Runtime para los modelos 1.x, PyTorch para `blinkcnn`, y la librería `blinklinmult` como interfaz unificada.
- No se proporcionan datos de VRAM ni de rendimiento específicos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de detección de parpadeos.

## Limitaciones y advertencias

- Los modelos puntúan recortes de ojos, no imágenes completas de la cara. La geometría del recorte es crítica: la v2 fue entrenada con un recorte cuadrado de 2.0 × la distancia entre esquinas del ojo. Una convención diferente degrada la precisión.
- El modelo `blinklinmult-union` requiere el flujo de descriptores de 160 dimensiones (landmarks de iris, distancias de párpados, EAR, pose de cabeza) además de los recortes. Producir este flujo requiere la dependencia extra `[preprocess]`.
- Los modelos 1.x están congelados y no pueden afinarse. Esto es deliberado, ya que son artefactos publicados.
- Los umbrales de detección de parpadeos para los modelos 1.x son marcadores de posición, no mediciones ajustadas. Solo `blinkcnn` tiene un umbral calibrado (0.53 con low ratio 0.25). Por tanto, las salidas de `detect()` no son directamente comparables entre generaciones; se recomienda ajustar el punto de operación con datos de validación propios mediante `fit_operating_point`.
- Los modelos fueron entrenados con corpora públicos que se inclinan hacia vídeo frontal de interiores con webcam. Se espera degradación en vistas laterales pronunciadas, oclusiones severas o imágenes infrarrojas.
- No se redistribuyen los corpus de entrenamiento; cada corpus tiene su propia licencia.

## Enlaces

- HuggingFace: https://huggingface.co/fodorad/blinklinmult-models
- Repositorio GitHub: https://github.com/fodorad/BlinkLinMulT
- Paper original: https://www.mdpi.com/2313-433X/9/10/196
