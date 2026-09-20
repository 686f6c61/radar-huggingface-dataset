# dronefreak/uavdt-yolov9t

## Resumen

dronefreak/uavdt-yolov9t es un detector de objetos YOLOv9t afinado sobre el conjunto de datos UAVDT (vehículos aéreos no tripulados, *Unmanned Aerial Vehicle Benchmark*). Lo publica el usuario dronefreak como parte de DetectionBench, un marco de trabajo cuyo objetivo es comparar detectores modernos bajo recetas de entrenamiento y métricas de evaluación idénticas sobre varios conjuntos de datos reales. El modelo base es Ultralytics/YOLOv9 en su variante "t" (tiny), la más pequeña de la familia.

Se trata de un detector de una sola etapa, con 2,1 millones de parámetros y 8,5 GFLOPs a 640 píxeles de resolución de entrada, entrenado para tres clases: coche, camión y autobús. Su interés principal es la detección de objetos pequeños en imágenes aéreas captadas desde dron, un escenario con fuerte desequilibrio de clases, oclusiones y movimiento de cámara, donde los detectores genéricos de imagen natural rinden peor.

En el split de test de UAVDT declara 29,42 % de mAP@50, 17,03 % de mAP@50-95, 35,75 % de precisión y 36,47 % de recuerdo. Son cifras modestas en términos absolutos, pero competitivas dentro del "model zoo" de UAVDT recopilado por el propio autor, donde supera a YOLOv8n, YOLOv10n, YOLOv11n y YOLOv26n, y queda por detrás de YOLOv9s y de RF-DETR Nano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv9t (detector convolucional de una etapa, familia YOLOv9 de Ultralytics); variante *tiny* |
| Parámetros totales | 2,1 M |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de detección de objetos, no generativo de texto) |
| Tipos de cuantización | no disponibles en la model card; el framework Ultralytics permite exportar a FP16/INT8 y a formatos como ONNX o TensorRT |
| Idiomas soportados | no aplicable (visión por computador); no disponible en los metadatos |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, archivo `best.pt`); el repositorio figura con 0.0 GB en los metadatos de HuggingFace |
| Tarea | object-detection |
| Modelo base | Ultralytics/YOLOv9 |
| Conjunto de datos de entrenamiento | dronefreak/UAVDT |
| Clases | car, truck, bus |
| Resolución de entrada asociada a los FLOPs | 640 px |
| FLOPs | 8,5 B a 640 px |
| Librería | ultralytics |

## Arquitectura y entrenamiento

La arquitectura es YOLOv9 en su variante tiny, un detector denso de una sola etapa con cabeza de detección anclada libre (*anchor-free*) y asignación dinámica de etiquetas, tal como se implementa en el paquete Ultralytics. El modelo base es Ultralytics/YOLOv9 y el resultado publicado es un ajuste fino (*fine-tuning*) sobre UAVDT; no se describe en la información disponible ningún cambio estructural respecto al modelo base.

El entrenamiento y la evaluación se realizan dentro de DetectionBench con una receta de entrenamiento común al resto de modelos comparados, y las métricas se calculan con la herramienta `detectionbench-evaluate` sobre el split de test de UAVDT. La model card no detalla el número de tokens o de imágenes vistas, la composición exacta del dataset, el número de épocas, el optimizador ni si hubo aumento de datos o técnicas de regularización específicas: esos datos no están disponibles. Tampoco aplica ningún tipo de ajuste por RLHF o DPO, al no ser un modelo generativo de lenguaje. Como innovaciones destacables sólo puede citarse la propia metodología de DetectionBench, orientada a la reproducibilidad: misma receta y mismas métricas para todos los detectores comparados.

## Capacidades

- Detección de objetos en imágenes aéreas con tres clases: coche (`car`), camión (`truck`) y autobús (`bus`).
- Detección de objetos pequeños en escenas aéreas, escenario para el que está específicamente ajustado.
- Inferencia de una sola pasada (*single-shot*), apta para procesamiento en tiempo real o casi real de fotogramas de vídeo.
- Salida de cajas delimitadoras con puntuaciones de confianza por clase, utilizable para conteo, seguimiento posterior o generación automática de etiquetas.
- Integración directa con el ecosistema Ultralytics (`YOLO(...)`, `model(...)` con `results`).
- No dispone de *tool calling* ni de *function calling*: no es un modelo de lenguaje.
- No dispone de razonamiento multi-paso ni de capacidades de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (*thinking*), audio ni entrada multimodal más allá de la imagen.

## Casos de uso

- Monitorización de tráfico desde dron: el modelo detecta coches, autobuses y camiones en fotogramas aéreos y permite estimar densidad de vehículos por carril o por zona; su tamaño de 2,1 M de parámetros hace viable el procesamiento a bordo.
- Conteo y aforo de vehículos: procesando secuencias de vídeo de UAVDT o de vuelos propios, las detecciones por fotograma se pueden agregar para obtener conteos por intervalo temporal en vías urbanas o interurbanas.
- Vigilancia de infraestructuras viarias: detección de vehículos parados o acumulaciones anómalas en autopistas, túneles o áreas de servicio, usando la clase `car` (la que mejor rinde, 69,56 % de mAP@50).
- Despliegue en hardware embebido a bordo de UAV: con ~8,4 MB de pesos en FP32, cabe en módulos como Jetson Orin o Nano y en placas con GPU integrada, lo que permite inferencia local sin enlace de comunicaciones.
- Preetiquetado y anotación asistida: usar el modelo para generar cajas candidatas sobre nuevo material aéreo y que un anotador humano sólo revise y corrija, reduciendo el coste de construir nuevos conjuntos de datos de vehículos.
- Punto de partida para ajuste fino específico: al ser un *checkpoint* pequeño y ya adaptado a dominio aéreo, sirve como inicialización para dominios relacionados (carreteras, puertos, estacionamientos) con menos datos y cómputo.
- Integración en pipelines de evaluación comparativa: forma parte del "model zoo" de UAVDT de DetectionBench, por lo que puede usarse como referencia base al evaluar nuevos detectores con la misma receta y métricas.
- Analítica de movilidad agregada: combinado con un módulo de seguimiento, permite estimar flujos y direcciones de tráfico a partir de las detecciones, sin necesidad de transmitir vídeo a un servidor central.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de **test** de UAVDT (métricas no verificadas de forma independiente, `verified: false`):

| Métrica | Valor (%) |
|---|---|
| mAP@50 (test) | 29,42 |
| mAP@50-95 (test) | 17,03 |
| Precisión (test) | 35,75 |
| Recuerdo (test) | 36,47 |
| F1 | 36,1 |
| Parámetros | 2,1 M |
| FLOPs | 8,5 B (a 640 px) |

Rendimiento por clase (UAVDT, test):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 69,56 | 38,11 |
| truck | 3,58 | 2,34 |
| bus | 15,11 | 10,63 |

Comparativa dentro del "model zoo" de UAVDT publicado por el autor en la propia model card:

| Modelo | mAP@50 | mAP@50-95 | Precisión | Recuerdo |
|---|---|---|---|---|
| RF-DETR Nano | 32,78 | 20,31 | 73,6 | 66,98 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| **YOLOv9t (este modelo)** | **29,42** | **17,03** | **35,75** | **36,47** |
| YOLOv26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv11n | 28,56 | 16,3 | 38,04 | 32,26 |
| YOLOv8n | 27,8 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,3 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 1 GB. Con 2,1 M de parámetros, los pesos ocupan aproximadamente 8,4 MB en FP32 y 4,2 MB en FP16, a lo que hay que sumar activaciones y memoria del *runtime*. Es una estimación derivada del número de parámetros, no un dato publicado por el autor.
- GPU recomendadas: no se especifica ninguna en la información disponible. Dado el tamaño, cualquier GPU sirve; modelos como RTX 4090, T4, L4, A100 o H100 quedan muy sobredimensionados para este *checkpoint*.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y en CPU. También es apto para módulos embebidos tipo Jetson Orin o Nano.
- Opciones de despliegue: la model card documenta el uso mediante `huggingface_hub.hf_hub_download` para descargar `best.pt` y la clase `YOLO` de Ultralytics. El framework Ultralytics permite además exportar a otros formatos (ONNX, TensorRT, OpenVINO, entre otros), aunque esto no se detalla en la model card. vLLM, Ollama y TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de FPS en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | mAP@50 (UAVDT) | mAP@50-95 (UAVDT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dronefreak/uavdt-yolov9t | 2,1 M | no aplicable | 29,42 | 17,03 | AGPL-3.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| YOLOv9s (misma receta, DetectionBench) | no disponible | no aplicable | 31,82 | 18,71 | no disponible en la información | Reportado en el model zoo de DetectionBench |
| RF-DETR Nano (misma receta, DetectionBench) | no disponible | no aplicable | 32,78 | 20,31 | no disponible en la información | Reportado en el model zoo de DetectionBench |
| YOLOv11n (misma receta, DetectionBench) | no disponible | no aplicable | 28,56 | 16,3 | no disponible en la información | Reportado en el model zoo de DetectionBench |

La ventaja de este *checkpoint* no está en la precisión absoluta, sino en la combinación de tamaño mínimo (2,1 M de parámetros) con un resultado por encima de varias alternativas más conocidas de la misma familia. RF-DETR Nano obtiene mejores métricas de mAP, pero con una precisión notablemente superior (73,6 % frente a 35,75 %), lo que sugiere un comportamiento distinto en el umbral de decisión y, presumiblemente, un coste computacional mayor.

## Limitaciones y advertencias

- Rendimiento muy bajo en la clase `truck`: 3,58 % de mAP@50 y 2,34 % de mAP@50-95, valores que en la práctica hacen la detección de camiones poco fiable. Muy probablemente refleja el fuerte desequilibrio de clases de UAVDT.
- La clase `bus` también es débil (15,11 % de mAP@50), frente al 69,56 % de `car`. El modelo es en la práctica un detector de coches con capacidad marginal para el resto.
- Métricas no verificadas: todos los resultados declarados están marcados como `verified: false`. Proceden del propio autor y no de una evaluación independiente.
- Riesgo elevado de falsos positivos y falsos negativos: con precisión del 35,75 % y recuerdo del 36,47 %, en aplicaciones críticas se requiere un umbral de confianza ajustado y validación sobre datos propios. No hay riesgo de "alucinación" en el sentido lingüístico, pero sí de detecciones espurias.
- Sesgo de dominio: entrenado exclusivamente sobre UAVDT (imágenes aéreas de tráfico con clases de vehículos), por lo que no se debe esperar un buen comportamiento en imágenes a nivel de suelo, en otros tipos de objeto o en condiciones muy distintas de captura (altitud, ángulo, iluminación, sensor).
- Cobertura de idiomas y multimodalidad: no aplicable. El modelo sólo procesa imágenes y no genera texto, por lo que no admite prompts ni instrucciones.
- Sin validación de la comunidad: el repositorio presenta 0 descargas y 0 likes en los metadatos consultados, por lo que no existe retroalimentación externa sobre su comportamiento en producción.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el código derivado bajo la misma licencia en determinados escenarios de distribución o de servicio en red; conviene revisar las implicaciones legales antes de integrarlo en un producto propietario. El modelo base Ultralytics/YOLOv9 está sujeto a la misma familia de licencias.
- Licencia del conjunto de datos UAVDT: no disponible en la información proporcionada; debe consultarse la ficha del dataset antes de reutilizar los pesos con fines comerciales.
- Restricciones de entrada: los FLOPs declarados corresponden a 640 px; no se documenta el comportamiento a otras resoluciones ni el impacto en precisión.
- Repositorio con tamaño declarado de 0.0 GB en HuggingFace, dato que probablemente no refleja el tamaño real de los pesos (los 2,1 M de parámetros implican varios megabytes como mínimo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolov9t
- Conjunto de datos UAVDT (ficha del autor): https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: Ultralytics/YOLOv9 (referenciado como `base_model` en la model card; no se proporciona URL directa en la información disponible)
- Referencias arXiv incluidas como etiquetas del repositorio: arXiv:1804.00518, arXiv:2402.13616, arXiv:2511.09554, arXiv:2304.07193, arXiv:2405.14458, arXiv:2410.17725, arXiv:2606.03748
- Recursos visuales incluidos en el repositorio del modelo (según la model card): `assets/demo_banner.mp4`, `BoxPR_curve.png`, `BoxF1_curve.png`, `confusion_matrix.png`, `confusion_matrix_normalized.png`
- Búsqueda web: no se han encontrado resultados relevantes. Las consultas realizadas devolvieron únicamente páginas de un restaurante sin relación con el modelo, por lo que no hay enlaces adicionales verificables más allá de los anteriores.
