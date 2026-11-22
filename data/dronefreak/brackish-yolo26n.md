# dronefreak/brackish-yolo26n

## Resumen

brackish-yolo26n es un detector de objetos YOLO26n afinado por el usuario dronefreak sobre el conjunto de datos Brackish Underwater, un benchmark de imágenes submarinas de agua salobre. El modelo parte de los pesos preentrenados de Ultralytics/YOLO26 y se entrena y evalúa dentro de DetectionBench, un marco de trabajo que aplica recetas de entrenamiento idénticas y métricas de evaluación homogéneas a varios detectores modernos sobre múltiples conjuntos de datos del mundo real, con el objetivo de permitir comparaciones reproducibles.

Se trata de un modelo de visión por computador puramente convolucional (familia YOLO), con 2.525.132 parámetros y 6,1 GFLOPs a 640 píxeles, pensado para detección en tiempo real en entornos con recursos limitados. Detecta seis clases de fauna marina: cangrejo, pez, medusa, camarón, pez pequeño y estrella de mar. Su relevancia actual radica en que ofrece un punto de referencia reproducible y ligero para tareas de detección submarina, un dominio con condiciones de imagen difíciles (turbidez, baja iluminación, oclusión) y escasez de modelos públicos especializados.

El modelo declara un mAP@50 del 98,95 % y un mAP@50-95 del 83,66 % en el split de test del dataset, resultados no verificados de forma independiente y publicados por el propio autor. La licencia AGPL-3.0 condiciona su uso en productos propietarios, un aspecto crítico a evaluar antes de integrarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector de objetos de la familia YOLO, Ultralytics) |
| Parámetros totales | 2.525.132 (2,6 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen; entrenado a 640 px) |
| Tipos de cuantización | no disponible (el repo distribuye `best.pt` en PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`); el repo incluye además `results.csv`, `args.yaml` y curvas de precisión-recall |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO26n, la variante "nano" de la familia YOLO26 de Ultralytics, un detector de una sola etapa con backbone y cabeza convolucionales. Con 2,6 M de parámetros y 6,1 GFLOPs a 640 px, está diseñado para inferencia de baja latencia en hardware modesto. El modelo se distribuye como checkpoint de PyTorch compatible con la librería `ultralytics` y se carga mediante `YOLO(weights)`.

El ajuste fino se realizó con la herramienta DetectionBench sobre el dataset Brackish Underwater, con imágenes redimensionadas a 640 px, lote de 32, optimizador automático, tasa de aprendizaje inicial de 0,001 y semilla 0. Se configuraron 500 épocas máximas y se completaron las 500, con paciencia de parada temprana de 100 épocas. No se documentan en la información disponible detalles sobre composición del dataset, número de imágenes, aumentos de datos, función de pérdida ni técnicas de destilación o RLHF (no aplicables a un detector). La innovación metodológica principal es la reproducibilidad: receta idéntica y pipeline de evaluación común (`detectionbench-evaluate`) para todos los modelos del zoo, lo que permite comparaciones justas entre arquitecturas.

## Capacidades

- Detección de objetos en imágenes submarinas de agua salobre para seis clases: `crab`, `fish`, `jellyfish`, `shrimp`, `small_fish` y `starfish`.
- Localización con cajas delimitadoras y puntuaciones de confianza por clase, con umbral de confianza configurable en inferencia (`conf`).
- Inferencia en tiempo real gracias a su tamaño reducido (2,6 M de parámetros, 6,1 GFLOPs a 640 px).
- Integración directa con el ecosistema Ultralytics: `predict`, `show`, exportación a otros formatos y evaluación con el pipeline estándar de la librería.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo "thinking"; es exclusivamente un modelo de visión.
- Capacidad multilingüe: no aplica.
- Capacidades especiales: ninguna documentada más allá de la detección; no se declaran tareas de segmentación, pose ni clasificación.

## Casos de uso

- Monitorización de ecosistemas de agua salobre: el modelo puede procesar secuencias de cámaras subacuáticas fijas y contar individuos por clase (cangrejos, peces, medusas) para estudios de abundancia y biodiversidad, aprovechando su bajo coste computacional para despliegue continuo.
- Inspección de piscifactorías y estanques: detección de `shrimp` y `small_fish` para estimar densidad y detectar anomalías en la población, con inferencia a 640 px en hardware de borde.
- Vigilancia de especies invasoras o indicadoras: identificación de `jellyfish` y `starfish` en imágenes de arrastre o ROV para alertar de proliferaciones, dado el buen rendimiento declarado en `starfish` (mAP@50-95 de 99,12).
- Análisis automatizado de vídeo de ROVs y drones submarinos: preprocesado de fotogramas para etiquetado asistido y triaje de material grabado, reduciendo el trabajo manual de revisión.
- Investigación marina reproducible: uso como línea base en experimentos de DetectionBench para comparar nuevas arquitecturas o recetas de entrenamiento bajo métricas idénticas.
- Prototipado rápido de aplicaciones de visión submarina: al ser un checkpoint de 2,6 M de parámetros, se puede integrar en demos y pruebas de concepto en portátiles o dispositivos embebidos sin GPU dedicada.
- Etiquetado semiautomático de nuevos datasets: generar preanotaciones con `conf` bajo y revisión humana, acelerando la curación de datos en dominios subacuáticos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Brackish Underwater, con el pipeline `detectionbench-evaluate`. No verificados de forma independiente (`verified: false`).

| Métrica | Valor |
|---|---|
| mAP@50 | 98,95 % |
| mAP@50-95 | 83,66 % |
| Precisión | 98,17 % |
| Recall | 97,23 % |
| F1 | 97,7 % |
| Parámetros | 2,6 M |
| FLOPs | 6,1 B (a 640 px) |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crab | 99,49 | 91,15 |
| fish | 99,32 | 87,29 |
| jellyfish | 97,68 | 74,44 |
| shrimp | 99,40 | 76,94 |
| small_fish | 98,30 | 73,03 |
| starfish | 99,49 | 99,12 |

Comparativa dentro del zoo de DetectionBench sobre el mismo dataset (datos del autor):

| Modelo | mAP@50 | mAP@50-95 | Precisión | Recall |
|---|---|---|---|---|
| YOLOv8s | 99,30 | 85,65 | 99,36 | 98,53 |
| YOLOv8m | 99,19 | 86,04 | 98,69 | 98,71 |
| YOLO26s | 99,10 | 85,77 | 99,45 | 97,83 |
| YOLO26n (este modelo) | 98,95 | 83,66 | 98,17 | 97,23 |
| YOLO11x | 98,89 | 86,30 | 98,84 | 98,25 |
| YOLO11n | 98,87 | 83,27 | 98,76 | 96,69 |
| YOLO26m | 98,74 | 85,93 | 98,74 | 97,32 |
| YOLOv8n | 98,41 | 83,01 | 99,51 | 96,95 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el checkpoint en FP32 (2,6 M de parámetros, ~10 MB de pesos), más el consumo de activaciones a 640 px; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; también funciona en CPU y en aceleradores de borde (Jetson, NPU integradas) dada su baja carga computacional.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; incluso en iGPU modernas.
- Opciones de despliegue: librería `ultralytics` (PyTorch), exportación a ONNX, TensorRT, OpenVINO y TFLite mediante las utilidades de Ultralytics; no se documentan despliegues con vLLM, TGI o llama.cpp (no aplicables).
- Latencia y throughput: no disponibles en la información proporcionada; los 6,1 GFLOPs a 640 px sitúan el coste por imagen en el rango típico de los detectores "nano", apto para tiempo real en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | mAP@50-95 (Brackish) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brackish-yolo26n | 2,6 M | 640 px | 83,66 | AGPL-3.0 | Hugging Face |
| YOLO11n (Brackish) | no disponible en la información | 640 px | 83,27 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLOv8n (Brackish) | no disponible en la información | 640 px | 83,01 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO26s (Brackish) | no disponible en la información | 640 px | 85,77 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |

Frente a las variantes "nano" de generaciones anteriores, el modelo mejora ligeramente el mAP@50-95 (83,66 frente a 83,27 de YOLO11n y 83,01 de YOLOv8n) con un coste de parámetros comparable. Las variantes "s" y "m" alcanzan mayor precisión media (85,77 y 85,93) a costa de más parámetros y FLOPs.

## Limitaciones y advertencias

- Resultados no verificados: todas las métricas proceden del autor y figuran con `verified: false`; no hay evaluación independiente publicada.
- Dominio restringido: el modelo está especializado en imágenes submarinas de agua salobre con seis clases concretas; su rendimiento fuera de ese dominio (otra iluminación, turbidez, cámaras o especies) no está documentado y probablemente degrade.
- Clases débiles: `small_fish` (73,03) y `jellyfish` (74,44) presentan mAP@50-95 notablemente inferior al resto, lo que sugiere dificultades con objetos pequeños o de contorno difuso.
- Riesgo de falsos positivos y negativos en condiciones de baja visibilidad; se recomienda calibrar el umbral `conf` por caso de uso y validar con datos propios.
- Sesgos: no se documenta la composición del dataset (distribución geográfica, especies, condiciones de captura), por lo que no es posible evaluar sesgos de muestreo.
- Licencia AGPL-3.0: el uso en servicios en red o productos propietarios exige cumplir con las obligaciones de copyleft de la AGPL, incluida la publicación del código modificado; evaluar con asesoría legal antes de uso comercial.
- Sin información sobre cuantizaciones oficiales, versiones ONNX/TensorRT verificadas ni latencias medidas; el despliegue en producción requiere validación propia.
- No apto para tareas distintas de la detección (segmentación, clasificación, texto); no dispone de tool calling ni de capacidades de agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/brackish-yolo26n
- Dataset Brackish: https://huggingface.co/datasets/dronefreak/Brackish
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Paper referenciado (arXiv:2606.03748): https://arxiv.org/abs/2606.03748
- Documentación de Ultralytics: https://docs.ultralytics.com
