# prathamrajbhar/smart-attendance-liveness-detection

## Resumen

`smart-attendance-liveness-detection` es un modelo de visión por computador desarrollado por el usuario prathamrajbhar para detección de vivacidad facial (liveness detection) o anti-spoofing, pensado como componente del sistema "Smart Attendance System". Su función es determinar si la cara presentada ante una cámara corresponde a una persona real o a un intento de suplantación mediante fotografía, vídeo reproducido o impresión. El modelo resuelve un problema clásico en sistemas de reconocimiento facial biométrico: evitar que un atacante burle la autenticación mostrando una imagen estática.

Técnicamente se trata de un clasificador binario construido sobre una columna vertebral MobileNetV2 con entrada de 224x224x3, seguido de GlobalAveragePooling, BatchNormalization, Dropout, una capa Dense de 128 unidades con activación ReLU, otro Dropout y una capa de salida Dense(1) con sigmoid. La salida representa la probabilidad de que la cara sea real. El repositorio incluye dos versiones: v2 (formato Keras 3 `.keras`, entrada RGB, umbral calibrado en 0.9297) y v1 (pesos Keras 2 `.h5`, entrada BGR, sin calibrar).

El modelo es relevante por su enfoque práctico y ligero: MobileNetV2 permite despliegue en dispositivos con recursos limitados, y la inclusión de un umbral calibrado y métricas de test (accuracy 0.9697, ROC-AUC 0.9934, PR-AUC 0.9662) facilita su integración en producción. No obstante, el repositorio no documenta el dataset de entrenamiento ni el proceso de calibración, lo que limita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (backbone) + GlobalAveragePooling2D + BatchNormalization + Dropout + Dense(128, ReLU) + Dropout + Dense(1, Sigmoid) en v2; en v1: MobileNetV2 + GlobalAveragePooling2D + Dropout(0.001) + Dense(1, Sigmoid) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224x3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Keras 3 (`.keras`) para v2; Keras 2 weights (`.h5`) para v1 |

## Arquitectura y entrenamiento

El modelo es un clasificador binario de imágenes basado en una red neuronal convolucional. La versión v2 utiliza MobileNetV2 como extractor de características, seguida de GlobalAveragePooling, BatchNormalization, Dropout, una capa densa de 128 unidades con ReLU, otro Dropout y una capa final Dense(1) con activación sigmoid. La entrada es de 224x224x3 y el preprocesamiento emplea `tf.keras.applications.mobilenet_v2.preprocess_input`, que escala los píxeles al rango [-1.0, 1.0]. La salida es la probabilidad de que la cara sea real, con un umbral calibrado de 0.9297. La versión v1, más simple, usa MobileNetV2 con pesos inicializados (no se especifica si preentrenados en ImageNet o desde cero; la model card indica `weights=None` en la reconstrucción, aunque menciona "pretrained on ImageNet, fine-tuned"), seguida de GlobalAveragePooling, Dropout(0.001) y Dense(1, Sigmoid); opera sobre imágenes en orden BGR.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de técnicas de aumento de datos, ni si se aplicaron procesos de ajuste fino supervisado, RLHF o DPO (no aplicables en un modelo de clasificación de imágenes). La model card no documenta el procedimiento de calibración del umbral ni la procedencia de las imágenes de entrenamiento y test.

## Capacidades

- Clasificación binaria de vivacidad facial: distingue entre cara real ("Real") y suplantación ("Spoof").
- Detección de ataques de presentación: fotografía impresa, reproducción de vídeo y otros intentos de spoofing.
- Procesamiento de imágenes RGB de 224x224 píxeles.
- Salida de una probabilidad continua (sigmoid) que permite ajustar el umbral según el caso de uso.
- Integración con pipelines de OpenCV para captura y recorte de caras.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la clasificación de imagen.

## Casos de uso

- Control de acceso biométrico en oficinas: el modelo se ejecuta sobre el recorte facial capturado por la cámara y rechaza intentos con fotos o vídeos, complementando el reconocimiento facial de identidad.
- Registro de asistencia en entornos educativos o corporativos: integrado en la aplicación "Smart Attendance System", evita que un estudiante o empleado pueda fichar con una imagen de otra persona.
- Kioscos de autoservicio con verificación de identidad: antes de validar una identidad, se comprueba la vivacidad para evitar suplantaciones con pantallas o impresiones.
- Autenticación en aplicaciones móviles o web: al ser un modelo ligero basado en MobileNetV2, puede desplegarse en dispositivos con recursos limitados o en el navegador mediante TensorFlow.js.
- Sistemas de videovigilancia con verificación de presencia real: filtra falsos positivos provocados por carteles o pantallas que muestran caras.
- Pruebas de penetración y evaluación de seguridad biométrica: sirve como referencia para medir la resistencia de un sistema de reconocimiento facial frente a ataques de presentación.
- Filtrado previo en pipelines de análisis facial: descarta imágenes no vivas antes de pasarlas a modelos más costosos de reconocimiento o análisis.

## Benchmarks y rendimiento

| Metrica | Valor (v2) |
|---|---|
| Accuracy | 0.9697 |
| ROC-AUC | 0.9934 |
| PR-AUC | 0.9662 |
| Umbral calibrado | 0.9297026991844177 |

No se han publicado resultados comparativos con otros modelos de liveness detection en la información disponible. Las métricas corresponden al conjunto de test del autor, cuya composición no se detalla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño típico de MobileNetV2 (unos pocos millones de parámetros), la inferencia cabe holgadamente en GPUs de gama baja e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 o H100 pueden ejecutar el modelo sin problemas, aunque el modelo no aprovechará la capacidad de las GPU de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en dispositivos integrados.
- Opciones de despliegue: TensorFlow/Keras (nativo), TensorFlow Lite para móviles y edge, TensorFlow.js para navegador, ONNX Runtime tras conversión, y servidores de inferencia compatibles con TensorFlow Serving.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Métricas publicadas | Disponibilidad |
|---|---|---|---|---|---|
| smart-attendance-liveness-detection (v2) | MobileNetV2 + cabecera densa | 224x224x3 RGB | MIT | Accuracy 0.9697, ROC-AUC 0.9934, PR-AUC 0.9662 | Hugging Face |
| Alternativas de liveness detection (p. ej. Silent-Face-Anti-Spoofing, DeepPixBiS) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría. Se recomienda evaluar el modelo sobre un conjunto de validación propio antes de adoptarlo en producción.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento: se desconoce la diversidad demográfica, de iluminación, de dispositivos y de condiciones de captura, lo que impide evaluar sesgos.
- Riesgo de sesgo demográfico: al no especificarse la composición del dataset, no puede descartarse un rendimiento desigual entre distintos grupos étnicos, edades o géneros.
- Riesgo de falsos negativos y falsos positivos: el umbral calibrado (0.9297) está ajustado a un conjunto de test concreto; en dominios distintos puede requerir recalibración.
- Diferencia entre versiones: v1 y v2 esperan órdenes de color distintos (BGR y RGB respectivamente) y tienen cabeceras diferentes; mezclar pesos y preprocesamiento produce resultados incorrectos.
- Limitación de contexto e idioma: el modelo no procesa texto ni lenguaje natural; la etiqueta "en" del repositorio no implica capacidades lingüísticas.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero sin garantías; el autor no ofrece soporte ni mantenimiento documentado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad ni de uso en producción a gran escala.
- No se documenta el proceso de calibración del umbral ni la metodología de evaluación, lo que dificulta la reproducibilidad.
- No se especifica la procedencia de los pesos de MobileNetV2 en v1 (la reconstrucción usa `weights=None`, aunque la model card menciona preentrenamiento en ImageNet).

## Enlaces

- Hugging Face: https://huggingface.co/prathamrajbhar/smart-attendance-liveness-detection
- Árbol de archivos: https://huggingface.co/prathamrajbhar/smart-attendance-liveness-detection/tree/main
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web proporcionada.
