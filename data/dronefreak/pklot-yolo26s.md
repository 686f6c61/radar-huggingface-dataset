# dronefreak/pklot-yolo26s

## Resumen

YOLO26s finetuneado sobre PKLot es un detector de objetos de la familia YOLO26 de Ultralytics, especializado en la clasificación de ocupación de plazas de aparcamiento. Lo publica el usuario dronefreak dentro del proyecto DetectionBench, un marco de trabajo orientado a evaluar detectores modernos con recetas de entrenamiento y métricas idénticas, de modo que las comparaciones entre arquitecturas sean reproducibles. El modelo resuelve una tarea muy concreta: detectar cada plaza de parking y etiquetarla como `vacant` u `occupied` en imágenes cenitales de aparcamientos.

Con 9.987.396 parámetros y 22,8 GFLOPs a 640 px, es un modelo pequeño pensado para inferencia en tiempo real sobre hardware modesto, no un modelo de propósito general. Su relevancia actual radica en que forma parte de un zoo comparativo público (YOLO11n, YOLO26n, YOLOv8n/s/m, RF-DETR Nano) entrenado bajo las mismas condiciones, lo que permite aislar el efecto de la arquitectura y del tamaño del modelo en una tarea de detección densa.

La ficha se centra en el uso del checkpoint `best.pt` con la librería Ultralytics. No es un modelo de lenguaje ni multimodal: no genera texto, no razona y no soporta tool calling. Cualquier expectativa en ese sentido queda fuera del alcance del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26s (detector de una etapa, familia Ultralytics YOLO26) |
| Parámetros totales | 9.987.396 (≈10,0 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (el repo solo publica `best.pt` en PyTorch; no se documentan variantes GGUF, ONNX, TensorRT ni INT8) |
| Idiomas soportados | no disponible (no procesa texto; las clases son `vacant` y `occupied`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), cargable con `ultralytics.YOLO`; el repo incluye además `results.csv`, `args.yaml` y curvas de evaluación |

## Arquitectura y entrenamiento

YOLO26s es un detector de objetos de una sola etapa, con backbone y cabeza de detección densa propios de la familia YOLO26 de Ultralytics. El checkpoint se obtiene por finetuning del modelo base `Ultralytics/YOLO26` sobre el dataset PKLot, que contiene imágenes de aparcamientos con anotaciones por plaza en dos clases: `vacant` y `occupied`. El entrenamiento se ejecutó con la herramienta DetectionBench, que fija una receta común para todos los modelos del zoo.

La configuración declarada es: máximo de 60 épocas configuradas, 35 épocas realmente entrenadas por parada temprana con paciencia 15, tamaño de imagen 960 px, optimizador AdamW con learning rate inicial 0,001, batch automático (Ultralytics AutoBatch) y semilla 0. No se documenta el número de tokens ni la composición detallada del dataset más allá de la referencia a la dataset card de PKLot, ni se indica si hubo aumento de datos específico, destilación o técnicas de decodificación especulativa. Tampoco se detalla el mecanismo de atención interno de YOLO26 más allá de la denominación de la familia.

## Capacidades

- Detección de objetos en imágenes: localiza cada plaza de aparcamiento con su caja delimitadora y la clasifica como `vacant` u `occupied`.
- Detección densa: maneja escenas con muchas instancias pequeñas y próximas entre sí, típicas de una vista cenital de aparcamiento.
- Procesamiento de imagen a resolución de entrada de 960 px durante el entrenamiento (22,8 GFLOPs medidos a 640 px).
- Salida estándar de Ultralytics: cajas, clases y puntuaciones de confianza, con umbral configurable (`conf`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de la detección sobre imagen.

## Casos de uso

- Gestión de ocupación de aparcamientos en tiempo real: el modelo se ejecuta sobre el flujo de una cámara cenital y cuenta plazas `occupied` frente a `vacant`, alimentando un panel de disponibilidad. Su tamaño de 10 M de parámetros permite desplegarlo en el propio dispositivo de captura.
- Señalización dinámica de plazas libres: integrado en paneles de entrada de un parking, actualiza el número de plazas disponibles a partir de las detecciones por zona, sin necesidad de sensores individuales por plaza.
- Analítica histórica de ocupación: procesar en lote imágenes archivadas para calcular curvas de ocupación por franja horaria y optimizar tarifas o rotación.
- Control de accesos y detección de uso indebido: identificar plazas reservadas ocupadas por vehículos no autorizados, combinando la detección con reglas de negocio sobre la zona.
- Auditoría de obra o reforma de aparcamientos: verificar mediante imágenes la ocupación real de un aparcamiento antes y después de una intervención, con métricas comparables entre capturas.
- Despliegue en dispositivos de borde: al ser un modelo de 10 M de parámetros, puede exportarse y ejecutarse en GPUs de consumo o en hardware embebido para vigilancia distribuida, reduciendo el ancho de banda frente a enviar vídeo a la nube.
- Generación de datasets de ocupación a escala: usar el modelo como etiquetador automático previo a revisión humana para ampliar el conjunto de entrenamiento con nuevas localizaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de PKLot, evaluados con el pipeline `detectionbench-evaluate`. La columna `verified` está marcada como falsa en el model-index, por lo que son cifras no verificadas de forma independiente.

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 99,31 |
| mAP@50-95 | 94,32 |
| Precisión | 99,52 |
| Recall | 92,31 |
| F1 | 95,78 |
| Parámetros | 10,0 M |
| FLOPs | 22,8 B (a 640 px) |

Rendimiento por clase:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| vacant | 99,44 | 96,76 |
| occupied | 99,17 | 91,87 |

Comparativa dentro del zoo de DetectionBench sobre PKLot (cifras del autor):

| Modelo | mAP@50 | mAP@50-95 | Precisión | Recall |
|---|---|---|---|---|
| YOLO11n | 99,42 | 94,99 | 99,78 | 99,92 |
| YOLO26n | 99,42 | 94,60 | 99,66 | 99,37 |
| YOLOv8n | 99,42 | 94,85 | 99,49 | 98,68 |
| YOLO26m | 99,41 | 94,92 | 99,60 | 99,64 |
| YOLOv8s | 99,33 | 95,33 | 99,50 | 96,18 |
| **YOLO26s** | **99,31** | **94,32** | **99,52** | **92,31** |
| RF-DETR Nano | 98,93 | 91,63 | 99,66 | 99,81 |
| YOLOv8m | 98,41 | 95,40 | 99,55 | 97,67 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 10 M de parámetros en FP32, los pesos ocupan aproximadamente 40 MB, por lo que la memoria necesaria la dominan las activaciones y el tamaño de lote más que el propio modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo está pensado para GPUs de consumo. No se documentan recomendaciones específicas (A100, H100, RTX 4090) ni cifras de latencia o throughput.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del modelo y los 22,8 GFLOPs a 640 px.
- Opciones de despliegue: la model card solo documenta inferencia con `ultralytics` y `huggingface_hub` (`best.pt`). No se publican exportaciones a ONNX, TensorRT, OpenVINO ni formatos GGUF, ni se mencionan vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 (PKLot) | mAP@50-95 (PKLot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26s (este) | 10,0 M | 99,31 | 94,32 | AGPL-3.0 | Hugging Face, `best.pt` |
| YOLO26n | no disponible | 99,42 | 94,60 | AGPL-3.0 (familia Ultralytics) | Zoo DetectionBench |
| YOLO11n | no disponible | 99,42 | 94,99 | AGPL-3.0 (familia Ultralytics) | Zoo DetectionBench |
| YOLOv8s | no disponible | 99,33 | 95,33 | AGPL-3.0 (familia Ultralytics) | Zoo DetectionBench |
| RF-DETR Nano | no disponible | 98,93 | 91,63 | no disponible | Zoo DetectionBench |

En PKLot las diferencias entre modelos son muy estrechas: todos los YOLO superan el 99 % de mAP@50 y se sitúan entre 94,3 y 95,4 de mAP@50-95. La elección entre ellos depende más del coste computacional y del recall que de la precisión bruta; este YOLO26s presenta el recall más bajo del grupo (92,31), mientras que YOLO26n y YOLO11n ofrecen mejor equilibrio con presumiblemente menos cómputo. No se dispone de datos de parámetros ni de licencia de las alternativas más allá de la referencia al zoo.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo detecta plazas de aparcamiento en las dos clases de PKLot. No es un detector de objetos general ni reconoce vehículos, personas u otras categorías.
- Sesgo de dominio: entrenado sobre las condiciones de captura de PKLot (vistas cenitales, iluminación y climatología del dataset). El rendimiento puede degradarse con ángulos oblicuos, cámaras distintas, oclusión severa, lluvia o nieve no representadas.
- Riesgo de falsos negativos: el recall declarado es del 92,31 %, el más bajo del zoo comparado, lo que implica plazas ocupadas no detectadas; en un sistema de señalización esto puede traducirse en información de disponibilidad incorrecta.
- Métricas no verificadas: el model-index marca las métricas como `verified: false`; proceden del propio autor y no de una evaluación independiente.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes. El uso comercial en un servicio en red puede obligar a liberar el código fuente del servicio; conviene revisarlo con asesoría legal antes de producción.
- Sin datos de cuantización ni de exportación: el repo solo ofrece `best.pt`, por lo que el despliegue en producción requiere convertir el modelo por cuenta propia y validar la pérdida de precisión.
- Sin información sobre sesgos demográficos o sociales: al no procesar personas ni texto, los sesgos relevantes son los de dominio y de anotación del dataset, no documentados en la model card.
- Sin garantías de mantenimiento: 83 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación dentro de un benchmark, no un modelo con soporte de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/pklot-yolo26s
- Dataset PKLot: https://huggingface.co/datasets/dronefreak/PKLot
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Paper referenciado en los tags (arXiv:2606.03748): https://arxiv.org/abs/2606.03748
