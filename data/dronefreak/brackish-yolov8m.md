# dronefreak/brackish-yolov8m

## Resumen

brackish-yolov8m es un detector de objetos YOLOv8m afinado por el usuario dronefreak sobre el conjunto de datos Brackish Underwater, un benchmark de imágenes submarinas en aguas salobres. El modelo parte de los pesos preentrenados de Ultralytics/YOLOv8 y se entrena y evalúa dentro de DetectionBench, un marco de trabajo del mismo autor diseñado para comparar detectores modernos con recetas de entrenamiento y métricas idénticas. Resuelve la tarea de localizar y clasificar seis clases de fauna marina (cangrejo, pez, medusa, camarón, pez pequeño y estrella de mar) en condiciones de visibilidad reducida típicas de aguas salobres.

Arquitectónicamente es una CNN de detección en una sola etapa con 25,9 millones de parámetros y 78,9 GFLOPs a 640 píxeles, lo que lo sitúa en la gama media de la familia YOLOv8. El contexto no aplica en el sentido de los modelos de lenguaje: la entrada es una imagen redimensionada a 640 px y la salida es un conjunto de cajas delimitadoras con clase y confianza. El modelo es relevante ahora porque ofrece una referencia reproducible y con métricas publicadas para una tarea de nicho (detección submarina) donde escasean los pesos afinados y las comparativas honestas entre familias de detectores.

La licencia AGPL-3.0 y el tamaño reducido del repositorio (0,1 GB) facilitan su inspección y reproducción, aunque la licencia impone obligaciones importantes para uso comercial y de red. El modelo declara métricas muy altas en el split de test del propio dataset, con mAP@50 de 99,19 % y mAP@50-95 de 86,04 %, si bien estas cifras no están verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (CNN de detección en una sola etapa, familia Ultralytics YOLO) |
| Parametros totales | 25.892.914 (25,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen a 640 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y best.pt; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors y best.pt (Ultralytics/PyTorch) |
| FLOPs | 78,9 GFLOPs a 640 px |
| Tarea | object-detection |
| Dataset de entrenamiento | dronefreak/Brackish (Brackish Underwater) |
| Clases | crab, fish, jellyfish, shrimp, small_fish, starfish |
| Modelo base | Ultralytics/YOLOv8 |
| Framework | Ultralytics YOLO / DetectionBench |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un YOLOv8m, la variante media de la familia YOLOv8 de Ultralytics: una red neuronal convolucional de detección en una sola etapa con cuello de agregación de características y cabezas de predicción ancladas libres, optimizada para equilibrio entre precisión y coste computacional. No emplea mecanismos de atención de tipo transformer ni arquitecturas híbridas; es una CNN pura orientada a inferencia de baja latencia. El modelo se inicializa desde los pesos preentrenados de Ultralytics/YOLOv8 y se afina sobre el dataset Brackish Underwater.

El entrenamiento se realizó con la herramienta DetectionBench, con un máximo configurado de 500 épocas y 500 épocas efectivamente completadas, paciencia de early stopping de 100, tamaño de lote 32, resolución de imagen 640 px, optimizador automático, tasa de aprendizaje inicial de 0,001 y semilla 0. No se documentan en la información disponible el número de tokens (no aplica), la composición exacta del dataset, ni si hubo técnicas de aumento de datos específicas más allá de las del pipeline estándar de Ultralytics. Tampoco se indica si se aplicó ajuste fino con refuerzo o preferencias, algo que no corresponde a esta familia de modelos.

## Capacidades

- Detección de objetos en imágenes submarinas de aguas salobres para seis clases: crab, fish, jellyfish, shrimp, small_fish y starfish.
- Localización con cajas delimitadoras y puntuación de confianza por detección, con umbral configurable en inferencia (por ejemplo, conf=0.25).
- Inferencia sobre imágenes individuales mediante la API de Ultralytics (`model.predict(source=...)`).
- Integración con el ecosistema Ultralytics: exportación a formatos habituales del framework y ejecución en CPU o GPU.
- No dispone de soporte de tool calling ni de function calling: no es un modelo de lenguaje.
- No dispone de razonamiento multi-paso ni capacidades de agente.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades distintas de la imagen.
- Capacidad de servir como referencia reproducible dentro de DetectionBench para comparar familias de detectores bajo la misma receta.

## Casos de uso

- Monitorización de fauna en cultivos marinos: el modelo permite detectar cangrejos, camarones y estrellas de mar en imágenes de tanques o piscinas de agua salobre, con una precisión declarada del 98,69 % que facilita el conteo automatizado y la alerta temprana.
- Inspección de infraestructura sumergida: con 78,9 GFLOPs a 640 px, puede ejecutarse en tiempo casi real sobre vídeo de cámaras subacuáticas para localizar organismos adheridos a estructuras y programar limpiezas.
- Investigación en biología marina: sirve como línea base afinada para estudios de abundancia relativa de medusas y peces pequeños, aprovechando que el modelo ya está entrenado sobre el dominio de aguas salobres y evita partir de cero.
- Análisis automatizado de transectos con ROV o dron submarino: el detector procesa fotogramas individuales y genera cajas que se agregan posteriormente para estimar densidades por clase y por zona.
- Clasificación y filtrado de grandes archivos de imágenes de cámaras trampa: el modelo descarta fotogramas sin organismos de interés y etiqueta los que contienen las seis clases, reduciendo el trabajo manual de revisión.
- Educación y divulgación: integrado en aplicaciones que muestran detecciones en directo sobre imágenes submarinas, con la ventaja de que el modelo es pequeño (0,1 GB) y puede desplegarse en equipos modestos.
- Benchmarking de detectores: al formar parte del zoo de modelos de DetectionBench, permite comparar YOLOv8m con YOLOv8s, YOLO11 y YOLO26 bajo métricas idénticas en el mismo dataset.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Brackish Underwater, evaluados con el pipeline estándar de DetectionBench (`detectionbench-evaluate`). Ninguna de las métricas está verificada de forma independiente (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 99,19 |
| mAP@50-95 | 86,04 |
| Precision | 98,69 |
| Recall | 98,71 |
| F1 Score | 98,7 |

Comparativa dentro del zoo de modelos de Brackish Underwater declarado por el autor:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv8s | 99,3 | 85,65 | 99,36 | 98,53 |
| **YOLOv8m** | **99,19** | **86,04** | **98,69** | **98,71** |
| YOLO26s | 99,1 | 85,77 | 99,45 | 97,83 |
| YOLO26n | 98,95 | 83,66 | 98,17 | 97,23 |
| YOLO11x | 98,89 | 86,3 | 98,84 | 98,25 |
| YOLO11n | 98,87 | 83,27 | 98,76 | 96,69 |
| YOLO26m | 98,74 | 85,93 | 98,74 | 97,32 |
| YOLOv8n | 98,41 | 83,01 | 99,51 | 96,95 |

Rendimiento por clase declarado por el autor:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crab | 99,5 | 95,2 |
| fish | 99,49 | 90,19 |
| jellyfish | 97,86 | 73,83 |
| shrimp | 99,5 | 79,27 |
| small_fish | 99,27 | 78,37 |
| starfish | 99,5 | 99,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 25,9 M de parámetros y 78,9 GFLOPs a 640 px, el modelo es ligero y cabe holgadamente en GPUs de consumo, pero no se publican cifras medidas de VRAM.
- GPU recomendadas: no se indican modelos concretos en la información disponible. Por tamaño, es apto para GPUs de consumo tipo RTX 3060/4060 en adelante, así como para A100 o H100 en despliegues por lotes.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros y el tamaño del repositorio (0,1 GB), aunque no se aportan mediciones oficiales.
- Opciones de despliegue: Ultralytics YOLO (API `model.predict`) y `huggingface_hub` para descarga de pesos. La información no documenta integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50 (Brackish) | mAP@50-95 (Brackish) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| brackish-yolov8m | 25,9 M | no aplica | 99,19 | 86,04 | AGPL-3.0 | Hugging Face (dronefreak/brackish-yolov8m) |
| YOLOv8s (Brackish) | no disponible | no aplica | 99,3 | 85,65 | AGPL-3.0 (Ultralytics) | Zoo de DetectionBench |
| YOLO11x (Brackish) | no disponible | no aplica | 98,89 | 86,3 | AGPL-3.0 (Ultralytics) | Zoo de DetectionBench |
| YOLO26m (Brackish) | no disponible | no aplica | 98,74 | 85,93 | no disponible | Zoo de DetectionBench |

Las cifras de los modelos comparables proceden de la tabla del zoo declarada por el autor en la model card; no se dispone de parámetros ni licencias específicas para esas variantes en la información proporcionada.

## Limitaciones y advertencias

- Las métricas declaradas (mAP@50 de 99,19 %, mAP@50-95 de 86,04 %) no están verificadas de forma independiente y proceden del propio autor; deben tomarse como referencia y no como garantía en producción.
- El modelo está afinado exclusivamente sobre Brackish Underwater, con seis clases concretas; su rendimiento fuera de ese dominio (otras aguas, otras especies, otras condiciones de iluminación) no está documentado y probablemente degrade.
- La clase jellyfish presenta el mAP@50-95 más bajo (73,83 %), seguida de small_fish (78,37 %) y shrimp (79,27 %), lo que indica mayor dificultad para localizar con precisión estos objetos pequeños o translúcidos.
- No se documentan sesgos conocidos ni análisis de subgrupos demográficos o ambientales; al ser un modelo de visión, los sesgos relevantes serían de composición del dataset (especies, profundidad, turbidez), no documentados.
- Riesgo de alucinación en el sentido de detecciones falsas positivas: no se publican curvas precisión-exhaustividad completas ni análisis de falsos positivos por clase más allá de la matriz de confusión normalizada incluida en el repositorio.
- Licencia AGPL-3.0: impone obligaciones de liberación de código fuente para obras derivadas y para uso en red; no es apta para productos comerciales cerrados sin cumplir dichas obligaciones. Verificar con asesoramiento legal antes de uso comercial.
- No se documentan limitaciones de idioma porque el modelo no procesa texto; la ausencia de metadatos de idioma en Hugging Face es esperable.
- No se dispone de información sobre latencia, throughput ni consumo de VRAM medidos, lo que dificulta el dimensionamiento de despliegues en producción.
- El repositorio tiene un uso muy bajo (24 descargas, 4 likes) y fue creado en 2026-08-12; la madurez y el mantenimiento del modelo no están contrastados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/brackish-yolov8m
- Dataset Brackish: https://huggingface.co/datasets/dronefreak/Brackish
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
