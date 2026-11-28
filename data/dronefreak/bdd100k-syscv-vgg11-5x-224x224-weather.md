# dronefreak/bdd100k-syscv-vgg11-5x-224x224-weather

## Resumen

El modelo `dronefreak/bdd100k-syscv-vgg11-5x-224x224-weather` es un clasificador de imágenes basado en VGG-11 que asigna a cada fotograma de conducción una única etiqueta meteorológica entre siete posibles: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` y `foggy`. No es un modelo de lenguaje: es un checkpoint de visión por computador orientado a etiquetado automático de escenas de conducción, entrenado sobre el conjunto de datos BDD100K.

El autor del repositorio, `dronefreak`, no ha entrenado el modelo desde cero, sino que publica un espejo (mirror) de un checkpoint del zoo de modelos de SysCV (ETH Zurich), cuyo servidor de descargas original (`dl.cv.ethz.ch`) está fuera de servicio. Los pesos se recuperaron de una captura de Wayback Machine del 29 de enero de 2025, y la configuración y los resultados provienen del repositorio GitHub de SysCV. El repositorio añade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10) y un script de inferencia (`infer.py`) que acepta imágenes, carpetas, vídeo o webcam.

La relevancia del modelo es práctica: proporciona una pieza reproducible de un pipeline de etiquetado de escenas de conducción con verificación exacta frente a las predicciones publicadas por SysCV. Con 128.795.015 parámetros, una entrada de 224x224 píxeles y un rendimiento de 0,005 s/imagen en una RTX 4070 SUPER, es un componente ligero y bien caracterizado para tareas de preprocesado o filtrado por condiciones meteorológicas en datasets de automoción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG-11 (red convolucional profunda, paper ICLR 2015) con `ClsHead` de mmcls |
| Parametros totales | 128.795.015 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `other` / `bdd100k` (uso educativo, investigación y sin ánimo de lucro) |
| Formato de pesos | safetensors (`model.safetensors`, equivalentes al `.pth` original) |
| Entrada | lado corto redimensionado a 256, recorte central 224x224, RGB con media y desviación estándar de ImageNet |
| Tarea | `image-classification` (etiquetado meteorológico, 7 clases) |
| Librería | mmcls 0.25.0 |
| Tamaño del repo | 1,0 GB |

## Arquitectura y entrenamiento

La arquitectura es una VGG-11 clásica: una pila de bloques convolucionales 3x3 con activaciones ReLU y max-pooling, seguida de capas completamente conectadas y una cabeza de clasificación (`ClsHead`) de mmcls que produce las siete etiquetas meteorológicas. El backbone no parte de pesos preentrenados: la configuración de SysCV no fija inicialización en ImageNet, de modo que el entrenamiento se realiza desde cero sobre BDD100K.

El entrenamiento usa las 70.000 imágenes de entrenamiento de BDD100K durante 60 épocas (el sufijo "5x" del nombre indica un calendario de entrenamiento extendido, cinco veces el esquema base), con SGD de tasa de aprendizaje 0,01, momento 0,9, decaimiento de peso 0,0001, reducciones de tasa en las épocas 30 y 45, y un tamaño de lote de 128 (4 GPU x 32 imágenes). La aumentación se limita a recortes aleatorios redimensionados a 224x224 y volteos horizontales. En inferencia se aplica el pipeline determinista descrito en la tabla: redimensionado del lado corto a 256 y recorte central de 224x224.

El repositorio incluye verificación de reproducibilidad: sobre las 10.000 imágenes de validación, esta copia produce la misma etiqueta que las predicciones publicadas por SysCV para cada imagen, con diferencias máximas de 2e-06 en las puntuaciones por clase (GPU, CUDA 11.8, RTX 4070 SUPER, TF32 desactivado). El MD5 de los pesos (`7da26bebf07334a9a9049ef61932ea8c`) coincide con el de SysCV.

## Capacidades

- Clasificación de imágenes de escenas de conducción en una de siete etiquetas meteorológicas: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy`, `foggy`.
- Salida de puntuaciones por clase (no solo la etiqueta ganadora), útil para umbrales y análisis de confianza.
- Procesamiento de imágenes individuales, carpetas de imágenes, archivos de vídeo y flujo de webcam mediante `infer.py`.
- Exportación de resultados a JSON con etiqueta y puntuaciones de todas las clases por imagen o fotograma (`--json`).
- Limitación opcional del número de fotogramas procesados en vídeo (`--max-frames`).
- Ejecución en GPU (CUDA 11.8) y en CPU (entorno separado), con resultados equivalentes verificados.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni visión general más allá del etiquetado meteorológico.

## Casos de uso

- Etiquetado automático de datasets de conducción: dado un conjunto de imágenes de dashcam, el modelo asigna la etiqueta meteorológica de cada fotograma, lo que permite filtrar o estratificar por condiciones (por ejemplo, separar las muestras `rainy` y `snowy` para entrenar detectores robustos a mal tiempo).
- Preprocesado en pipelines de percepción: la etiqueta meteorológica puede actuar como señal de enrutamiento para activar modelos o parámetros específicos según la condición (por ejemplo, un detector ajustado para lluvia cuando la etiqueta es `rainy`), con un coste de 0,005 s/imagen en una RTX 4070 SUPER.
- Análisis de vídeo de flotas o vehículos: `infer.py` acepta archivos de vídeo y produce una etiqueta por fotograma con puntuaciones, lo que permite construir líneas temporales de condiciones meteorológicas a lo largo de un trayecto.
- Control de calidad de datasets: detectar imágenes mal etiquetadas o ambiguas comparando la etiqueta declarada con la predicha y las puntuaciones por clase; las clases con confianza baja pueden enviarse a revisión humana.
- Investigación en robustez: usar el modelo como referencia reproducible (verificada contra las predicciones de SysCV) para estudiar el efecto de la meteorología en otros modelos de visión, sin depender del servidor original caído.
- Demostraciones y prototipos en vivo: el modo webcam (`python infer.py 0 --show`) permite mostrar en tiempo real la etiqueta meteorológica sobre el flujo de una cámara, útil para demos de sistemas de asistencia a la conducción.
- Balanceo de datasets: contar la distribución de condiciones meteorológicas en un corpus de imágenes para remuestrear o ponderar las clases minoritarias antes del entrenamiento de otros modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuaciones de SysCV; precisión, exhaustividad y F1 son medias macro sobre las 7 clases, incluida `undefined`):

| Conjunto | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val (BDD100K) | 80,92 % | 64,39 % | 61,28 % | 62,59 % |
| test (BDD100K) | 80,62 % | 63,94 % | 60,33 % | 61,85 % |

El autor indica que la métrica de validación está marcada como no verificada (`verified: false`) en el model-index, aunque la reproducibilidad de las etiquetas y puntuaciones sí se verificó contra las predicciones publicadas. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 128,8 M de parámetros y pesos en precisión original, la huella de pesos ronda los 0,5 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor reporta 0,005 s/imagen (incluida la decodificación JPEG) en una RTX 4070 SUPER; cualquier GPU NVIDIA con soporte CUDA 11.8 es suficiente. No se documentan requisitos para A100 o H100.
- Cabe en GPU de consumo: sí; el entorno CUDA 11.8 está pensado para tarjetas NVIDIA convencionales.
- CPU: 0,05 s/imagen con 8 hilos de CPU; existe un entorno CPU separado (`env/requirements-cpu.txt`) con resultados equivalentes verificados sobre 20 imágenes de validación.
- Despliegue: mmcls 0.25.0 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10, en un entorno virtual nuevo; script `infer.py` para imagen, carpeta, vídeo o webcam. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 0,005 s/imagen en RTX 4070 SUPER y 0,05 s/imagen en CPU de 8 hilos, según el autor.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de etiquetado meteorológico comparables en la información proporcionada. Como referencia contextual, el propio modelo se basa en VGG-11 (paper ICLR 2015) y se compara implícitamente con el resto de entradas del zoo de modelos de SysCV para BDD100K, pero no se aportan métricas de esos otros checkpoints.

| Modelo | Parametros | Contexto/entrada | Top-1 (val BDD100K) | Licencia |
|---|---|---|---|---|
| Este modelo (VGG-11, 5x, 224x224) | 128,8 M | imagen 224x224 | 80,92 % | bdd100k (uso educativo/investigación) |
| Otros modelos del zoo SysCV | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo con BDD100K (70k imágenes de conducción), el modelo puede generalizar mal a dominios distintos (otras cámaras, países, condiciones de iluminación extremas) y hereda los sesgos de muestreo del dataset.
- Riesgo de error en clases ambiguas: la etiqueta `undefined` y las fronteras entre `overcast`, `partly cloudy` y `foggy` son intrínsecamente difusas; la precisión y el recall macro (64,39 % y 61,28 % en validación) son notablemente inferiores a la accuracy top-1, lo que indica desequilibrio entre clases.
- Limitación de entrada: solo clasifica meteorología; no detecta objetos, no segmenta, no estima profundidad y no procesa texto ni audio.
- Restricciones de licencia: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, investigación y sin ánimo de lucro; el uso comercial requiere revisar los términos del dataset. La configuración de SysCV es Apache-2.0, pero eso no cubre los pesos entrenados.
- Entorno frágil: depende de versiones fijadas (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10); se recomienda un entorno virtual nuevo y no mezclar con instalaciones existentes.
- Origen de los pesos: al ser un espejo recuperado de Wayback Machine, conviene verificar el MD5 (`7da26bebf07334a9a9049ef61932ea8c`) antes de usarlo en producción.
- Sin datos de benchmarks adicionales ni de cuantización: no se documentan variantes GGUF, ONNX u otras, lo que limita el despliegue en entornos no PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-vgg11-5x-224x224-weather
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-vgg11-5x-224x224-weather/blob/main/LICENSE.txt
- Zoo de modelos SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración de SysCV usada: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/vgg11_5x_224x224_weather_tag_bdd100k.py
- Paper de VGG (ICLR 2015): https://arxiv.org/abs/1409.1556
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687 (referencia de la cita incluida en la model card)
