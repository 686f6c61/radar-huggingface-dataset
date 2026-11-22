# dronefreak/pklot-yolo26n

## Resumen

`dronefreak/pklot-yolo26n` es un detector de objetos YOLO26n afinado sobre el conjunto de datos PKLot para la tarea de ocupación de plazas de aparcamiento. Lo publica el autor `dronefreak` como parte de DetectionBench, un marco de trabajo para comparar detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas sobre varios conjuntos de datos del mundo real. El modelo resuelve un problema muy concreto: clasificar y localizar plazas de aparcamiento como `vacant` u `occupied` en imágenes de vigilancia de parkings.

Se trata de una red neuronal convolucional de detección de objetos de la familia YOLO (Ultralytics), con 2.523.572 parámetros totales según los pesos en safetensors y 6,1 GFLOPs a 640 px según la model card. Es un modelo de visión puro: no procesa texto ni tiene ventana de contexto lingüístico, por lo que las filas de especificaciones relativas a contexto, idiomas o cuantización de LLM se marcan como no aplicables o no disponibles.

Su relevancia actual es doble: por un lado, ofrece un punto de referencia reproducible y de código abierto para ocupación de parkings con métricas declaradas muy altas en el split de test de PKLot (mAP@50 de 99,42 %); por otro, forma parte de un zoo de modelos comparables (YOLO11n, YOLOv8n, YOLO26m, RF-DETR Nano, entre otros) entrenados con la misma receta, lo que permite evaluar la arquitectura sin sesgos de configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics YOLO), red convolucional de detección de objetos |
| Parametros totales | 2.523.572 (2,6 M según la model card) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en `best.pt`; no se documentan variantes GGUF, ONNX ni TensorRT) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`); el repo declara safetensors en los tags, con 2.523.572 parámetros |
| Tarea | Object detection (pipeline `object-detection`) |
| Clases | `vacant`, `occupied` |
| Resolución de entrenamiento | 960 px |
| FLOPs | 6,1 B a 640 px |
| Framework | Ultralytics (entrenado con DetectionBench) |
| Dataset | PKLot (`dronefreak/PKLot`) |

## Arquitectura y entrenamiento

El modelo es un YOLO26n, la variante nano de la familia YOLO26 de Ultralytics, una arquitectura convolucional de detección en una sola etapa con cabeza de predicción densa. Se ha afinado desde el checkpoint base `Ultralytics/YOLO26` sobre el conjunto PKLot, que contiene imágenes de parkings etiquetadas con dos clases: plaza vacía (`vacant`) y plaza ocupada (`occupied`). La tarea es, por tanto, de detección densa de objetos pequeños y repetitivos, típica de escenarios de vigilancia e infraestructura.

La configuración de entrenamiento documentada es: 60 épocas configuradas y 60 efectivamente ejecutadas, paciencia de early stopping de 15, batch size automático (Ultralytics AutoBatch), tamaño de imagen de 960 px, optimizador AdamW con learning rate inicial de 0,001 y semilla 0. El entrenamiento y la evaluación se realizaron con DetectionBench, que estandariza la receta para que los resultados sean comparables entre arquitecturas. No se documentan en la información disponible detalles sobre composición exacta del dataset, aumentos de datos ni técnicas de destilación o decodificación especulativa.

## Capacidades

- Detección de objetos en imágenes: localiza plazas de aparcamiento y las clasifica como `vacant` u `occupied`.
- Detección densa: adecuada para escenas con muchas instancias pequeñas y próximas entre sí, como filas de plazas en un parking.
- Salida con cajas delimitadoras y puntuaciones de confianza por instancia, consumible mediante la API de Ultralytics (`model.predict`).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni agentes: es un modelo perceptivo de una sola pasada.
- No tiene capacidades multilingües, de audio, de vídeo nativo ni modo de razonamiento explícito.
- Integrable en pipelines de visión por computador convencionales (Python, PyTorch, Ultralytics).

## Casos de uso

- Gestión de ocupación de parkings en tiempo real: el modelo detecta cada plaza y su estado (`vacant`/`occupied`) en imágenes de cámaras fijas, lo que permite calcular la tasa de ocupación por zona y alimentar paneles de control. Su tamaño de 2,6 M de parámetros facilita el despliegue en dispositivos de borde.
- Señalización dinámica de plazas libres: integrado en paneles o aplicaciones móviles, el detector actualiza el número de plazas disponibles a partir de capturas periódicas, reduciendo el tiempo que los conductores pasan buscando aparcamiento.
- Analítica histórica de uso: procesando imágenes archivadas de PKLot o de cámaras propias, el modelo genera series temporales de ocupación para estudiar patrones horarios y estacionales en un parking concreto.
- Vigilancia de infraestructura: detección de plazas ocupadas de forma indebida (zonas reservadas, pasos de peatones, áreas de carga) mediante la comparación entre la detección y el plano de plazas permitidas.
- Control de acceso y cumplimiento: combinado con un sistema de matrículas, el detector aporta la señal de presencia de vehículo en una plaza concreta y permite auditar la ocupación de plazas reservadas.
- Benchmarking reproducible de detectores: al formar parte del zoo de DetectionBench, sirve como referencia para comparar arquitecturas (YOLO11n, YOLOv8n, RF-DETR Nano) bajo la misma receta y el mismo split de evaluación.
- Prototipado rápido en investigación: su reducido coste computacional (6,1 GFLOPs a 640 px) permite iterar sobre aumentos de datos, umbrales de confianza y post-procesado sin grandes recursos de GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de PKLot, evaluados con el pipeline estándar de DetectionBench (`detectionbench-evaluate`). Ninguno de los valores está verificado de forma independiente (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 99,42 |
| mAP@50-95 | 94,60 |
| Precision | 99,66 |
| Recall | 99,37 |
| F1 | 99,52 |

Rendimiento por clase:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| vacant | 99,49 | 97,03 |
| occupied | 99,36 | 92,17 |

Comparación dentro del zoo de PKLot de DetectionBench (mismos datos y receta, según el autor):

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| YOLO11n | 99,42 | 94,99 | 99,78 | 99,92 |
| YOLO26n (este modelo) | 99,42 | 94,60 | 99,66 | 99,37 |
| YOLOv8n | 99,42 | 94,85 | 99,49 | 98,68 |
| YOLO26m | 99,41 | 94,92 | 99,60 | 99,64 |
| YOLOv8s | 99,33 | 95,33 | 99,50 | 96,18 |
| YOLO26s | 99,31 | 94,32 | 99,52 | 92,31 |
| RF-DETR Nano | 98,93 | 91,63 | 99,66 | 99,81 |
| YOLOv8m | 98,41 | 95,40 | 99,55 | 97,67 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,6 M de parámetros, el modelo ocupa del orden de decenas de MB en FP32 y menos de 10 MB en FP16, además del espacio de activaciones a la resolución de entrada.
- GPU recomendadas: cualquier GPU moderna sirve; para producción con muchas cámaras en paralelo se recomienda una GPU de datacenter (A100, H100, L4, T4) o una consumer de gama media-alta (RTX 3060 en adelante). Para una sola cámara, una GPU integrada o una Jetson es suficiente.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Ultralytics (PyTorch) de forma nativa; exportación a ONNX, TensorRT, OpenVINO o CoreML mediante las utilidades de Ultralytics (no se documentan exportaciones pregeneradas en el repo). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia de coste, 6,1 GFLOPs a 640 px sitúan al modelo en el rango de milisegundos por imagen en GPU moderna, pero no se aportan mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / dataset | mAP@50 (PKLot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26n (este modelo) | 2,6 M | Detección, PKLot | 99,42 % | AGPL-3.0 | Hugging Face (`dronefreak/pklot-yolo26n`) |
| YOLO11n | no disponible en la información | Detección, PKLot | 99,42 % | no disponible en la información | Zoo de DetectionBench |
| YOLOv8n | no disponible en la información | Detección, PKLot | 99,42 % | no disponible en la información | Zoo de DetectionBench |
| RF-DETR Nano | no disponible en la información | Detección, PKLot | 98,93 % | no disponible en la información | Zoo de DetectionBench |

La comparación se limita a los modelos publicados en el zoo de PKLot de DetectionBench; no se dispone de parámetros, licencias ni disponibilidad individuales para las alternativas más allá de los resultados de la tabla del autor.

## Limitaciones y advertencias

- Modelo de dominio específico: entrenado únicamente sobre PKLot para dos clases (`vacant`, `occupied`); no generaliza a otras categorías de objetos ni a otros tipos de escena sin reentrenamiento.
- Sesgos del dataset: PKLot contiene parkings con condiciones de captura concretas (cámaras, iluminación, perspectivas y regiones geográficas limitadas). El rendimiento puede degradarse con ángulos, climas o resoluciones distintos de los del conjunto de entrenamiento.
- Riesgo de falsos positivos y negativos en condiciones adversas: oclusiones, sombras, vehículos parcialmente fuera de plaza o reflejos pueden confundir la clasificación `vacant`/`occupied`.
- Métricas no verificadas: todos los resultados proceden del autor y están marcados como `verified: false`; conviene reproducirlos con el pipeline de DetectionBench antes de usarlos como referencia en producción.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el código fuente del servicio que integra el modelo; es una restricción relevante para productos propietarios.
- Sin datos de calibración ni de robustez: no se documentan evaluaciones out-of-distribution, ni curvas de calibración de confianza, ni umbrales recomendados por escenario.
- Sin soporte documentado de cuantización ni exportaciones listas para producción: habrá que generar los artefactos (ONNX, TensorRT) y validar su precisión por cuenta propia.
- Dependencia del framework Ultralytics: la inferencia está pensada para la librería `ultralytics`, lo que condiciona el stack técnico y su licencia asociada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/pklot-yolo26n
- Dataset PKLot en Hugging Face: https://huggingface.co/datasets/dronefreak/PKLot
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Paper de referencia citado en los tags: arXiv:2606.03748 (https://arxiv.org/abs/2606.03748)
