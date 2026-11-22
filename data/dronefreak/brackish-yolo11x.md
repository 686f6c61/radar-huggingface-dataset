# dronefreak/brackish-yolo11x

## Resumen

dronefreak/brackish-yolo11x es un detector de objetos YOLO11x afinado (fine-tuned) sobre el conjunto de datos Brackish Underwater, un benchmark de imágenes submarinas de aguas salobres. Lo desarrolla el autor de Hugging Face `dronefreak` en el marco de DetectionBench, un proyecto que busca reproducir recetas de entrenamiento idénticas para comparar detectores modernos sobre múltiples conjuntos de datos del mundo real. El modelo parte de los pesos preentrenados Ultralytics/YOLO11 y se especializa en la detección de fauna marina: cangrejos, peces, medusas, camarones, peces pequeños y estrellas de mar.

La relevancia de este modelo es doble. Por un lado, ofrece un detector de alta precisión (mAP@50 de 98,89 % y mAP@50-95 de 86,3 % en el split de test) para un dominio difícil como es la visión submarina, donde la turbidez, la iluminación variable y la oclusión complican la detección. Por otro, forma parte de un zoo de modelos comparables bajo una misma receta, lo que permite evaluar de forma justa arquitecturas como YOLOv8, YOLO11 y YOLO26 sobre el mismo conjunto de datos.

Con 56.974.210 parámetros y 196 GFLOPs a 640 píxeles, es un modelo de tamaño medio-grande dentro de la familia YOLO, pensado para despliegues donde la precisión prima sobre la latencia extrema. La licencia AGPL-3.0 condiciona su uso comercial, un aspecto clave a tener en cuenta antes de integrarlo en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11x (detector de objetos de una etapa, familia Ultralytics YOLO11) |
| Parametros totales | 56.974.210 (57,0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | best.pt (PyTorch); el repositorio incluye safetensors como tag, ademas de results.csv, args.yaml y curvas de precision-recall |
| Resolucion de entrada | 640 px (entrenamiento e inferencia) |
| FLOPs | 196,0 B a 640 px |
| Clases | crab, fish, jellyfish, shrimp, small_fish, starfish |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

YOLO11x es un detector de objetos de una sola etapa basado en una red neuronal convolucional con cuello de botella CSP y un cabezal de detección anclado libre (anchor-free), tal como define la familia YOLO11 de Ultralytics. La variante "x" es la de mayor capacidad de la familia, con 57,0 M de parámetros y 196,0 GFLOPs a 640 px, lo que la sitúa en el extremo de precisión frente a las variantes n, s, m y l.

El entrenamiento se realizó con el toolkit DetectionBench sobre el conjunto Brackish Underwater, con un máximo configurado de 500 épocas y 477 épocas efectivas, parada temprana con paciencia de 100, tamaño de lote 32, resolución de imagen 640, optimizador automático, tasa de aprendizaje inicial de 0,001 y semilla 0. No se especifica en la información disponible el número de tokens ni la composición detallada del dataset más allá de las seis clases de fauna marina, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un detector de objetos). La innovación principal del proyecto es metodológica: una receta de entrenamiento y evaluación idéntica para todos los modelos del zoo, lo que permite comparaciones reproducibles entre arquitecturas.

## Capacidades

- Detección de objetos en imágenes submarinas de aguas salobres, con seis clases: crab, fish, jellyfish, shrimp, small_fish y starfish.
- Localización con cajas delimitadoras y puntuaciones de confianza por clase.
- Inferencia sobre imágenes individuales, lotes y flujos de vídeo mediante la API de Ultralytics (`model.predict`).
- Ajuste del umbral de confianza en inferencia (por ejemplo, `conf=0.25`) para equilibrar precisión y recall.
- Integración con el ecosistema Ultralytics: exportación a otros formatos, validación y entrenamiento adicional.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural: es exclusivamente un modelo de visión por computador.
- No dispone de modo thinking, visión generalista, audio ni capacidades multilingües.

## Casos de uso

- Monitorización de ecosistemas marinos: el modelo puede procesar imágenes de cámaras subacuáticas para contar y clasificar fauna (cangrejos, peces, medusas, camarones, estrellas de mar) en estudios de biodiversidad, aprovechando su mAP@50-95 de 86,3 % en el dominio objetivo.
- Acuicultura: detección automática de peces y camarones en piscinas y estanques para estimar densidad de población, detectar mortalidad o supervisar el crecimiento, con la ventaja de que el modelo está entrenado específicamente en aguas salobres.
- Vigilancia de especies invasoras o indicadoras: identificación de medusas y estrellas de mar en zonas costeras para alertar de proliferaciones, usando el modelo sobre flujos de vídeo con umbral de confianza ajustable.
- Investigación científica reproducible: servir como línea base dentro del zoo de DetectionBench para comparar YOLOv8, YOLO11 y YOLO26 bajo la misma receta, facilitando publicaciones con resultados comparables.
- Análisis de imágenes de drones o ROV submarinos: integración del detector en pipelines de procesamiento por lotes de capturas aéreas o subacuáticas, dado su rendimiento a 640 px y su formato PyTorch compatible con Ultralytics.
- Educación y divulgación: aplicaciones interactivas que muestren detecciones en tiempo real sobre imágenes submarinas, con la API sencilla de Ultralytics y pesos descargables desde Hugging Face.
- Automatización de anotación: uso del modelo para preetiquetar imágenes nuevas del dominio y acelerar el etiquetado humano en proyectos de visión submarina.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Brackish Underwater (no verificados de forma independiente, `verified: false`):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 98,89 |
| mAP@50-95 | 86,3 |
| Precision | 98,84 |
| Recall | 98,25 |
| F1 Score | 98,55 |

Comparativa dentro del zoo de Brackish Underwater (mismos datos y receta, según el autor):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv8s | 99,3 | 85,65 | 99,36 | 98,53 |
| YOLOv8m | 99,19 | 86,04 | 98,69 | 98,71 |
| YOLO26s | 99,1 | 85,77 | 99,45 | 97,83 |
| YOLO26n | 98,95 | 83,66 | 98,17 | 97,23 |
| **YOLO11x (este modelo)** | **98,89** | **86,3** | **98,84** | **98,25** |
| YOLO11n | 98,87 | 83,27 | 98,76 | 96,69 |
| YOLO26m | 98,74 | 85,93 | 98,74 | 97,32 |
| YOLOv8n | 98,41 | 83,01 | 99,51 | 96,95 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crab | 99,5 | 95,63 |
| fish | 99,48 | 89,23 |
| jellyfish | 96,4 | 74,85 |
| shrimp | 99,43 | 80,17 |
| small_fish | 99,04 | 78,51 |
| starfish | 99,5 | 99,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa para un modelo de 57,0 M de parámetros en FP32, el peso de los pesos ronda los 228 MB, por lo que la VRAM necesaria para inferencia en FP32 se sitúa en el rango de 1-2 GB, y en FP16 en torno a 0,5-1 GB, sin contar memoria para activaciones y lotes.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, así como para GPU de datacenter (A100, H100) en escenarios de alto throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM para inferencia a 640 px, aunque el dato exacto no está publicado.
- Opciones de despliegue: Ultralytics (PyTorch), exportación a ONNX, TensorRT, OpenVINO y otros formatos soportados por Ultralytics; el repositorio incluye `best.pt` para carga directa con `ultralytics.YOLO`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen de la GPU, del tamaño de lote y del backend de exportación.

## Comparativa con modelos similares

Comparación con alternativas del mismo zoo (mismos datos y receta) y con la variante base:

| Modelo | Parametros | Contexto/resolucion | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11x (este modelo) | 57,0 M | 640 px | 86,3 | AGPL-3.0 | Hugging Face (dronefreak) |
| YOLOv8m | no disponible | 640 px | 86,04 | AGPL-3.0 (Ultralytics) | Hugging Face (dronefreak) |
| YOLO26m | no disponible | 640 px | 85,93 | no disponible | Hugging Face (dronefreak) |
| YOLOv8s | no disponible | 640 px | 85,65 | AGPL-3.0 (Ultralytics) | Hugging Face (dronefreak) |
| YOLO11n | no disponible | 640 px | 83,27 | AGPL-3.0 (Ultralytics) | Hugging Face (dronefreak) |

El modelo destaca por obtener el mejor mAP@50-95 del zoo (86,3 %), ligeramente por encima de YOLOv8m (86,04 %) y YOLO26m (85,93 %), a costa de un mayor número de parámetros y FLOPs. Para despliegues con restricciones de cómputo, las variantes n y s ofrecen un compromiso mejor entre precisión y coste.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente en el dominio de aguas salobres del dataset Brackish; su rendimiento puede degradarse en aguas oceánicas, dulces, con distinta turbidez, iluminación o cámaras diferentes.
- Riesgo de alucinación: como todo detector, puede producir falsos positivos en objetos con apariencia similar a las clases entrenadas (por ejemplo, formas ambiguas o artefactos de imagen).
- Limitaciones de contexto o idioma: no aplica procesamiento de lenguaje; no admite instrucciones en lenguaje natural ni razonamiento. La resolución de entrada está fijada en 640 px en el entrenamiento, y objetos muy pequeños o muy grandes pueden detectarse peor.
- Clases limitadas: solo detecta seis clases (crab, fish, jellyfish, shrimp, small_fish, starfish); cualquier otra especie u objeto no será reconocido correctamente.
- Restricciones de licencia: AGPL-3.0 impone obligaciones copyleft para uso en red y distribución; el uso comercial en productos propietarios requiere revisión legal o una licencia comercial de Ultralytics.
- Caveats para producción: los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente; conviene validar el modelo sobre el conjunto de datos propio antes de desplegarlo. El repositorio es pequeño (0,2 GB) y tiene pocas descargas (17) y likes (1), lo que sugiere poca validación comunitaria.
- Fecha de creación y actualización: creado el 2026-08-12 y actualizado el 2026-11-21, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/brackish-yolo11x
- Dataset Brackish: https://huggingface.co/datasets/dronefreak/Brackish
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Paper de referencia (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
