# dronefreak/brackish-yolov8n

## Resumen

`dronefreak/brackish-yolov8n` es un detector de objetos YOLOv8n afinado por el usuario dronefreak sobre el conjunto de datos Brackish Underwater, un benchmark de imágenes submarinas de agua salobre. El modelo parte de los pesos preentrenados de Ultralytics YOLOv8 y se ha entrenado y evaluado dentro del marco DetectionBench, un proyecto que estandariza recetas de entrenamiento y métricas de evaluación para comparar detectores modernos sobre múltiples conjuntos de datos reales.

Se trata de un modelo de visión por computador puro, no de un modelo de lenguaje: la arquitectura es una CNN de detección de una sola etapa con 3.022.418 parámetros y 8,7 GFLOPs a 640 píxeles, pensada para inferencia en tiempo real incluso en hardware modesto. Detecta seis clases de fauna marina: cangrejo, pez, medusa, camarón, pez pequeño y estrella de mar.

Su relevancia es doble. Por un lado, ofrece un detector especializado y muy ligero para un dominio difícil (imágenes submarinas con turbidez, poca luz y oclusiones). Por otro, forma parte de un zoo de modelos comparables bajo la misma receta, lo que permite evaluar de forma justa el compromiso entre precisión y coste computacional dentro de la familia YOLO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (CNN de deteccion de una etapa, familia Ultralytics YOLO) |
| Parametros totales | 3.022.418 (3,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen a 640 px) |
| Tipos de cuantizacion | no disponible (el repo solo publica `best.pt` en formato PyTorch) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`); no se publican safetensors ni GGUF utilizables directamente, pese a la etiqueta `safetensors` del repo |
| FLOPs | 8,7 B a 640 px |
| Tarea | Deteccion de objetos (`object-detection`) |
| Clases | crab, fish, jellyfish, shrimp, small_fish, starfish |
| Libreria | ultralytics |
| Modelo base | Ultralytics/YOLOv8 |
| Dataset de entrenamiento | dronefreak/Brackish (Brackish Underwater) |

## Arquitectura y entrenamiento

El modelo es un YOLOv8n, la variante "nano" de la familia YOLOv8 de Ultralytics: un detector de una etapa con backbone CSPDarknet, cuello PAN-FPN y cabeza de deteccion desacoplada (anchor-free), que predice cajas y clases directamente en varias escalas. Con 3,2 M de parametros y 8,7 GFLOPs a 640 px, esta disenado para latencia baja en GPUs de consumo e incluso en CPU.

El ajuste fino se realizo con la herramienta DetectionBench sobre el split de entrenamiento de Brackish Underwater, con una receta fija y documentada: 500 epocas configuradas y efectivamente ejecutadas, paciencia de early stopping de 100, tamano de lote 32, imagenes a 640 px, optimizador `auto` de Ultralytics, tasa de aprendizaje inicial de 0,001 y semilla 0. No se documenta en la informacion disponible el numero de imagenes del dataset, la composicion exacta del split ni si hubo aumento de datos mas alla del pipeline por defecto de Ultralytics. Tampoco se indica ninguna innovacion arquitectonica propia: el valor del modelo esta en el ajuste al dominio, no en cambios de arquitectura.

## Capacidades

- Deteccion de objetos en imagenes submarinas de agua salobre para seis clases: cangrejo, pez, medusa, camarón, pez pequeño y estrella de mar.
- Inferencia de una sola etapa a 640 px, adecuada para procesamiento en tiempo real o casi real.
- Salida estandar de Ultralytics: cajas delimitadoras, etiquetas de clase y puntuaciones de confianza, con umbral de confianza configurable.
- Integracion directa con la API de `ultralytics` (`YOLO(...).predict(...)`), incluida visualizacion con `results[0].show()`.
- Capacidad de ejecutarse sobre imagenes sueltas, directorios, video o flujos de camara a traves de los `source` de Ultralytics (segun la API de la libreria, no documentado especificamente en la model card).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo "thinking": es exclusivamente un modelo de vision.
- Multilingue: no aplica.

## Casos de uso

- Monitorizacion de ecosistemas de agua salobre: procesar lotes de imagenes de camaras subacuaticas para contar cangrejos, peces, camarones y estrellas de mar, aprovechando el mAP@50-95 de 83,01 y el bajo coste por imagen del modelo nano.
- Analisis de video submarino en tiempo real: con 8,7 GFLOPs a 640 px, el modelo puede ejecutarse sobre fotogramas de video en una GPU de consumo o en un dispositivo embebido, permitiendo alertas tempranas de presencia de especies.
- Acuicultura: deteccion de camarones y peces pequenos en piscinas o estanques para estimar densidad y actividad, usando la clase `shrimp` (mAP@50 de 99,5) y `small_fish` (mAP@50 de 97,88).
- Ciencia ciudadana y anotacion asistida: preanotar imagenes submarinas con las seis clases para acelerar el etiquetado manual posterior por biologos marinos, dado el alto recall de 96,95.
- Investigacion reproducible en deteccion: servir como referencia "nano" dentro del zoo de DetectionBench para comparar recetas, aumentos de datos y variantes YOLO bajo metricas identicas.
- Despliegue en drones o ROVs de bajo consumo: el reducido numero de parametros (3,2 M) permite embeber el detector en plataformas con recursos limitados para inspeccion de habitats costeros.
- Filtrado previo en pipelines de analisis de imagen: usar el detector como etapa de criba para descartar imagenes sin fauna relevante antes de pasar a modelos mas costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Brackish Underwater, con el pipeline `detectionbench-evaluate`. Ninguno de los valores esta verificado de forma independiente (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 98,41 |
| mAP@50-95 | 83,01 |
| Precision | 99,51 |
| Recall | 96,95 |
| F1 | 98,21 |

Rendimiento por clase (declarado por el autor):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crab | 99,5 | 90,88 |
| fish | 99,48 | 88,06 |
| jellyfish | 94,6 | 69,79 |
| shrimp | 99,5 | 77,75 |
| small_fish | 97,88 | 72,42 |
| starfish | 99,5 | 99,16 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para lotes pequenos; el modelo (3,2 M de parametros) ocupa unos pocos MB en pesos, y el consumo dominante es el de las activaciones a 640 px.
- GPU recomendadas: cualquier GPU moderna sirve; para maxima velocidad, A100, H100, L4 o RTX 4090; para despliegue de borde, Jetson Orin, Jetson Nano o incluso CPU.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1650 y similares; tambien en Apple Silicon via MPS.
- Opciones de despliegue: `ultralytics` (PyTorch, `best.pt`), exportacion a ONNX, TensorRT, OpenVINO u otros formatos soportados por Ultralytics (no se publican artefactos exportados en el repo); no hay soporte nativo de vLLM, llama.cpp ni Ollama, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; como referencia cualitativa, 8,7 GFLOPs a 640 px es un coste propio de un detector nano de tiempo real.

## Comparativa con modelos similares

Comparativa dentro del zoo de Brackish Underwater publicado por el autor (mismas metricas y receta):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv8s | 99,3 | 85,65 | 99,36 | 98,53 |
| YOLOv8m | 99,19 | 86,04 | 98,69 | 98,71 |
| YOLO26s | 99,1 | 85,77 | 99,45 | 97,83 |
| YOLO26n | 98,95 | 83,66 | 98,17 | 97,23 |
| YOLO11x | 98,89 | 86,3 | 98,84 | 98,25 |
| YOLO11n | 98,87 | 83,27 | 98,76 | 96,69 |
| YOLO26m | 98,74 | 85,93 | 98,74 | 97,32 |
| YOLOv8n (este modelo) | 98,41 | 83,01 | 99,51 | 96,95 |

Lectura: este YOLOv8n obtiene la precision mas alta del zoo (99,51) y un recall competitivo, pero queda por detras de las variantes mayores en mAP@50-95 (83,01 frente a 86,3 de YOLO11x y 86,04 de YOLOv8m). Frente a otros modelos nano, YOLO26n lo supera ligeramente en mAP@50 (98,95) y mAP@50-95 (83,66), mientras que YOLO11n queda por debajo en mAP@50-95 (83,27). El compromiso es claro: precision casi maxima con el menor coste computacional de la familia.

## Limitaciones y advertencias

- Dominio muy restringido: solo seis clases de fauna de agua salobre; no debe esperarse generalizacion a otras especies, ambientes o condiciones de iluminacion no representadas en el dataset.
- Clases debiles: `jellyfish` (mAP@50-95 de 69,79) y `small_fish` (72,42) rinden bastante peor que el resto, lo que sugiere dificultades con objetos translucidos o de pequeno tamano.
- Metricas no verificadas: todos los resultados proceden del autor (`verified: false`) y no hay evaluacion independiente publicada.
- Riesgo de falsos positivos y negativos en imagenes con turbidez, baja visibilidad o solapamiento de individuos; conviene calibrar el umbral de confianza (`conf`) por caso de uso.
- Sesgos potenciales derivados de la distribucion del dataset Brackish Underwater: no se documenta su composicion por clase, localizacion geografica ni condiciones de captura en la informacion disponible.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el codigo fuente derivado; revisar con atencion antes de integrarlo en productos propietarios. Ademas, hereda las condiciones de Ultralytics YOLOv8.
- El repo no publica pesos en safetensors ni GGUF, solo `best.pt`; la etiqueta `safetensors` del repositorio no implica artefactos listos para otros runtimes.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier descripcion de capacidades conversacionales seria incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/brackish-yolov8n
- Dataset Brackish: https://huggingface.co/datasets/dronefreak/Brackish
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base YOLOv8 (Ultralytics): https://huggingface.co/Ultralytics/YOLOv8
- Documentacion de Ultralytics: https://docs.ultralytics.com/
