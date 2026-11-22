# dronefreak/brackish-yolo26s

## Resumen

`dronefreak/brackish-yolo26s` es un detector de objetos YOLO26s afinado por el usuario dronefreak sobre el conjunto de datos **Brackish Underwater**, un benchmark de imágenes submarinas de agua salobre con seis clases marinas (crab, fish, jellyfish, shrimp, small_fish, starfish). El modelo parte de los pesos preentrenados de `Ultralytics/YOLO26` y se entrena y evalúa dentro de **DetectionBench**, un framework que busca reproducir recetas de entrenamiento idénticas para comparar detectores modernos sobre datos reales.

Se trata de un modelo pequeño (9,99 millones de parámetros, 22,8 GFLOPs a 640 px) orientado a detección en tiempo real sobre hardware modesto, lo que lo hace candidato para despliegue en vehículos submarinos, boyas de monitorización o estaciones de borde. Su relevancia actual radica en que ofrece una línea base reproducible y comparable frente a otras familias (YOLOv8, YOLO11) bajo la misma receta, con métricas declaradas muy altas en el split de test del benchmark.

La licencia AGPL-3.0 y la ausencia de datos sobre idiomas (no es un modelo de lenguaje) delimitan su ámbito: es una pieza de visión por computador para investigación y para productos que puedan asumir las obligaciones copyleft de la AGPL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26s (familia YOLO de Ultralytics, detector denso de una etapa) |
| Parámetros totales | 9.990.492 (≈10,0 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen a 640 px) |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en safetensors y `best.pt` de PyTorch) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, PyTorch (`best.pt`) |
| FLOPs | 22,8 B a 640 px |
| Tarea | object-detection |
| Librería | ultralytics |
| Dataset de entrenamiento | dronefreak/Brackish (Brackish Underwater) |

## Arquitectura y entrenamiento

El modelo es un YOLO26s, es decir, un detector de una sola etapa de la familia YOLO mantenida por Ultralytics, con backbone y cuello convolucionales y una cabeza de detección que predice cajas y clases directamente sobre una rejilla multi-escala. El tamaño "s" (small) de la familia YOLO26 se traduce en 9,99 M de parámetros y 22,8 GFLOPs a 640 px, un punto de equilibrio entre precisión y coste computacional pensado para inferencia en tiempo real.

El ajuste fino se realizó con el toolkit DetectionBench sobre el split de entrenamiento de Brackish Underwater, con una configuración declarada de 500 épocas (sin parada temprana efectiva, paciencia 100), batch de 32, resolución de 640 px, optimizador automático, learning rate inicial de 0,001 y semilla 0. La model card no documenta el número de tokens ni la composición exacta del dataset más allá de las seis clases (crab, fish, jellyfish, shrimp, small_fish, starfish), ni si se aplicaron técnicas de aumento de datos específicas o destilación. Tampoco se indica si hubo fases de RLHF/DPO, algo que no aplica a un detector.

## Capacidades

- Detección de objetos en imágenes submarinas de agua salobre para seis clases: crab, fish, jellyfish, shrimp, small_fish y starfish.
- Predicción de cajas delimitadoras con puntuaciones de confianza y etiquetas de clase, en el formato estándar de Ultralytics.
- Inferencia sobre imágenes individuales, lotes y flujos de vídeo mediante `model.predict(source=...)`.
- Integración con el ecosistema Ultralytics: exportación a formatos de despliegue (ONNX, TensorRT, etc., sujeto a la herramienta) y utilidades de visualización (`results[0].show()`).
- Capacidad de ejecutarse en CPU y GPU de consumo gracias a su reducido tamaño.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión.

## Casos de uso

- Monitorización de ecosistemas de agua salobre: el modelo puede procesar imágenes de cámaras fijas o boyas y contar ejemplares de cada clase (cangrejos, peces, medusas, camarones, estrellas de mar) para series temporales de biodiversidad, gracias a su bajo coste de inferencia (22,8 GFLOPs por imagen a 640 px).
- Inspección con vehículos submarinos (ROV/AUV): integrado en la carga útil de un drone submarino, detecta fauna en tiempo real para evitar colisiones o para inventariar especies durante transectos, con un modelo de 10 M de parámetros que cabe en GPUs embebidas.
- Acuicultura: detección de medusas y depredadores en piscinas y esteros para alertar sobre proliferaciones que afecten a los cultivos, usando el modelo sobre flujos de vídeo con umbral de confianza ajustable (`conf=0.25` por defecto).
- Análisis automatizado de datasets de biología marina: preetiquetado de grandes volúmenes de imágenes submarinas para revisión humana, reduciendo el trabajo manual de anotación antes de entrenar modelos mayores.
- Educación y divulgación científica: aplicación de demostración que identifica especies en imágenes capturadas por ciudadanos o en acuarios, con visualización directa de las detecciones.
- Benchmarking reproducible: servir como referencia en DetectionBench para comparar recetas de entrenamiento y familias de detectores bajo métricas idénticas, dado que el repositorio incluye `results.csv`, `args.yaml` y curvas de precisión-recall.
- Vigilancia ambiental en plantas de tratamiento o estuarios: detección de organismos indicadores en muestras de agua salobre capturadas con cámaras sumergidas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card, evaluados sobre el split de test de Brackish Underwater con el pipeline `detectionbench-evaluate`. No están verificados de forma independiente (`verified: false`).

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 99,1 |
| mAP@50-95 | 85,77 |
| Precision | 99,45 |
| Recall | 97,83 |
| F1 | 98,63 |

Comparativa dentro del zoo de modelos del mismo autor sobre Brackish Underwater:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv8s | 99,3 | 85,65 | 99,36 | 98,53 |
| YOLOv8m | 99,19 | 86,04 | 98,69 | 98,71 |
| **YOLO26s (este modelo)** | **99,1** | **85,77** | **99,45** | **97,83** |
| YOLO26n | 98,95 | 83,66 | 98,17 | 97,23 |
| YOLO11x | 98,89 | 86,3 | 98,84 | 98,25 |
| YOLO11n | 98,87 | 83,27 | 98,76 | 96,69 |
| YOLO26m | 98,74 | 85,93 | 98,74 | 97,32 |
| YOLOv8n | 98,41 | 83,01 | 99,51 | 96,95 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crab | 99,5 | 94,53 |
| fish | 99,44 | 90,17 |
| jellyfish | 97,76 | 75,73 |
| shrimp | 99,5 | 78,22 |
| small_fish | 98,88 | 76,55 |
| starfish | 99,5 | 99,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 10 M de parámetros, el modelo en FP32 ocupa del orden de 40 MB de pesos, y en FP16 alrededor de 20 MB. El consumo real depende del tamaño de lote y de la resolución de entrada.
- GPU recomendadas: cualquier GPU moderna sirve; para máxima throughput, A100/H100 o L4; para despliegue en borde, Jetson Orin, RTX 4090 o incluso GPUs integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- También es viable en CPU para inferencia de baja frecuencia (imágenes sueltas o flujos a baja cadencia).
- Opciones de despliegue: Ultralytics (PyTorch), exportación a ONNX y TensorRT mediante las utilidades de Ultralytics, y ejecución con `huggingface_hub` + `ultralytics` como se documenta en la model card. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplican a un detector).
- Latencia y throughput: no disponibles en la información proporcionada; con 22,8 GFLOPs a 640 px se espera un throughput alto en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26s (este modelo) | 9,99 M | 99,1 | 85,77 | AGPL-3.0 | Hugging Face |
| YOLOv8s | no disponible | 99,3 | 85,65 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLOv8m | no disponible | 99,19 | 86,04 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO11x | no disponible | 98,89 | 86,3 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO26n | no disponible | 98,95 | 83,66 | AGPL-3.0 | Hugging Face |

En mAP@50 el modelo queda ligeramente por debajo de YOLOv8s (99,3) y YOLOv8m (99,19), pero supera a YOLO11x y YOLO26m en esa métrica. En mAP@50-95 es superado por YOLOv8m (86,04) y YOLO11x (86,3), aunque con un coste de parámetros presumiblemente mayor. La ventaja principal de este YOLO26s es su relación precisión/tamaño y su integración con la receta reproducible de DetectionBench.

## Limitaciones y advertencias

- Métricas no verificadas de forma independiente: el model-index marca todos los resultados como `verified: false`; proceden del propio autor.
- Riesgo de sobreajuste al dominio: el modelo está afinado exclusivamente sobre Brackish Underwater; su rendimiento en otras aguas, iluminaciones o especies no representadas puede degradarse notablemente.
- Clases limitadas: solo detecta seis clases; cualquier organismo fuera de crab, fish, jellyfish, shrimp, small_fish y starfish se ignorará o se clasificará erróneamente.
- Rendimiento desigual por clase: jellyfish (75,73 mAP@50-95), small_fish (76,55) y shrimp (78,22) están muy por debajo de starfish (99,4), lo que indica dificultades con objetos pequeños, translúcidos o de bajo contraste.
- Riesgo de falsos positivos y alucinaciones de detección en imágenes con turbidez, burbujas o artefactos submarinos; el umbral de confianza debe calibrarse por escenario.
- Licencia AGPL-3.0: el uso comercial en servicios en red exige liberar el código fuente derivado bajo la misma licencia; conviene revisar las obligaciones antes de integrarlo en productos propietarios.
- No hay información sobre sesgos demográficos (no aplica), pero sí sobre sesgos de dominio: la composición del dataset no está detallada en la model card.
- No se documentan tasas de error en condiciones de baja visibilidad ni pruebas de robustez frente a perturbaciones.
- El repositorio tiene un tamaño declarado de 0,0 GB y muy pocas descargas (14) y likes (4), lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/brackish-yolo26s
- Dataset Brackish: https://huggingface.co/datasets/dronefreak/Brackish
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Paper referenciado (arXiv:2606.03748): https://arxiv.org/abs/2606.03748
