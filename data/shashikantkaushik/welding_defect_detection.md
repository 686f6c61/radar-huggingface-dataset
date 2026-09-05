# shashikantkaushik/welding_defect_detection

## Resumen

El modelo `shashikantkaushik/welding_defect_detection` es un sistema de detección de objetos basado en YOLOv8m, desarrollado para la inspección visual automatizada de soldaduras. Su objetivo es identificar y clasificar regiones de soldadura en tres categorías: `Bad Weld`, `Good Weld` y `Defect`, sustituyendo la inspección manual por un proceso más rápido y consistente en entornos industriales.

El modelo fue creado con la herramienta Aargus-DIY Visual Inspection Tool y entrenado sobre conjuntos de datos pre-divididos en formato YOLO, partiendo de pesos preentrenados en ImageNet/COCO. La arquitectura es un detector de una etapa (single-stage) con backbone CNN, optimizado para inferencia en tiempo real. No se dispone de información sobre el número de parámetros, la longitud de contexto ni los idiomas soportados, ya que se trata de un modelo de visión por computadora y no de un modelo de lenguaje.

La relevancia del modelo radica en su aplicación directa al control de calidad en líneas de producción de soldadura, donde la detección temprana de defectos puede reducir costes, mejorar la seguridad y aumentar la eficiencia. Aunque el rendimiento general es moderado (mAP50 de 0.734), la clase `Bad Weld` alcanza una precisión de 0.920, lo que lo hace útil para escenarios donde la detección de soldaduras defectuosas es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por computadora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica para vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura YOLOv8m de Ultralytics, un detector de objetos en una sola etapa basado en redes neuronales convolucionales. Fue entrenado a partir de pesos preentrenados en ImageNet y COCO, aplicando aumentaciones de datos integradas en Ultralytics, como mosaico, desenfoque, desenfoque mediano, conversión a escala de grises y ecualización adaptativa de histograma (CLAHE).

El entrenamiento se realizó en múltiples ejecuciones con extensión progresiva de épocas, pasando de 150 a 200 épocas, e incluyendo ajuste de hiperparámetros como tasa de aprendizaje, momento y decaimiento de peso. La validación se llevó a cabo sobre un conjunto de prueba de 126 imágenes con 301 instancias, evaluando precisión, recall, mAP50 y mAP50-95, junto con análisis de matriz de confusión.

## Capacidades

- Detección de objetos en imágenes de soldaduras, clasificando regiones como `Bad Weld`, `Good Weld` y `Defect`.
- Inferencia en tiempo real gracias a la arquitectura YOLOv8m, adecuada para integración en sistemas de visión industrial.
- Soporte para visualización de cajas delimitadoras y coordenadas mediante la API de Ultralytics.
- No soporta tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo de visión.
- Capacidades multilingües no aplicables; el modelo procesa imágenes, no texto.
- Sin capacidades especiales como thinking mode, visión adicional o audio.

## Casos de uso

- Control de calidad en líneas de producción de soldadura: el modelo puede integrarse en cámaras industriales para inspeccionar cada soldadura de forma automática, detectando defectos en tiempo real y reduciendo la necesidad de inspección manual.
- Detección de soldaduras defectuosas en estructuras metálicas: en puentes, edificios o maquinaria pesada, el modelo puede analizar imágenes de uniones soldadas para identificar fallos que comprometan la integridad estructural.
- Automatización de inspección en plantas de fabricación de tuberías: el modelo puede clasificar soldaduras en tuberías de acero, permitiendo un filtrado rápido de piezas que requieren reparación.
- Soporte a sistemas de visión robótica: al devolver cajas delimitadoras y clases, el modelo puede guiar brazos robóticos o sistemas de pulido/soldadura para corregir defectos de forma autónoma.
- Auditoría de calidad en talleres de soldadura: los inspectores pueden usar el modelo para revisar lotes de imágenes capturadas durante el proceso, generando informes automáticos de defectos.
- Investigación y desarrollo en inspección visual: el modelo sirve como base para experimentar con técnicas de aumento de datos, ajuste de hiperparámetros o transferencia de aprendizaje en el dominio de soldadura.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al conjunto de prueba (126 imágenes, 301 instancias):

| Metrica | Valor |
|---|---|
| Precision | 0.736 |
| Recall | 0.699 |
| F1-Score | 0.717 |
| mAP50 | 0.734 |
| mAP50-95 | 0.535 |

Rendimiento por clase:

| Clase | Precision | Recall | F1-Score | mAP50 | mAP50-95 | Instancias |
|---|---|---|---|---|---|---|
| Bad Weld | 0.920 | 0.726 | 0.812 | 0.833 | 0.624 | 95 |
| Good Weld | 0.787 | 0.821 | 0.804 | 0.842 | 0.667 | 117 |
| Defect | 0.500 | 0.551 | 0.524 | 0.526 | 0.313 | 89 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se carga mediante la librería Ultralytics, por lo que puede ejecutarse en entornos Python con PyTorch. No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado datos de rendimiento de otras alternativas para comparar.

## Limitaciones y advertencias

- La clase `Defect` presenta un rendimiento notablemente inferior (mAP50 de 0.526) en comparación con `Bad Weld` y `Good Weld`, probablemente debido al solapamiento visual con las otras clases. Esto puede provocar falsos negativos en la detección de defectos específicos.
- El modelo fue entrenado con un conjunto de datos limitado (126 imágenes de prueba), por lo que su generalización a condiciones de iluminación, ángulos o materiales diferentes puede ser reducida.
- No se han documentado sesgos específicos, pero al ser un modelo de visión entrenado en un dominio concreto, es posible que falle en contextos fuera de la soldadura industrial.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar la procedencia de los datos de entrenamiento y el cumplimiento de normativas aplicables.
- El formato de pesos es `.pt` (PyTorch), lo que requiere el entorno de Ultralytics y PyTorch para la inferencia. No se ofrecen versiones cuantizadas ni exportaciones a ONNX o TensorRT en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/shashikantkaushik/welding_defect_detection
