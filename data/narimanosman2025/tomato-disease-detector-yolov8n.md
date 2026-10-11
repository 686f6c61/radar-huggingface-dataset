# NarimanOsman2025/tomato-disease-detector-yolov8n

## Resumen

Tomato Disease Detector (YOLOv8n) es un modelo de detección de objetos de una sola etapa, obtenido mediante ajuste fino (*fine-tuning*) de la arquitectura YOLOv8n de Ultralytics, orientado a identificar nueve afecciones distintas en hojas de tomate a partir de imágenes. Lo desarrolla Nariman Osman (Nar) como proyecto de aprendizaje en visión por computador, y se distribuye bajo licencia CC BY 4.0, la misma que los conjuntos de datos de origen.

El modelo resuelve una tarea concreta de agricultura de precisión: clasificar y localizar visualmente enfermedades y plagas del tomate (mildiu, alternaria, septoriosis, virus del mosaico, ácaros, etc.) a partir de fotografías. Se entrenó durante 100 épocas en una GPU Tesla T4 (Google Colab) sobre un conjunto combinado de 2 977 imágenes (2 226 de entrenamiento, 449 de validación y 302 de prueba), y reporta un mAP50 global de 0,686 y un mAP50-95 de 0,465.

Es relevante porque ofrece un detector muy ligero, propio de la variante "nano" de la familia YOLOv8, pensado para desplegarse en entornos con recursos limitados (móvil, dron o dispositivo de borde) en tareas de diagnóstico fitosanitario. La información disponible no especifica el número de parámetros ni los requisitos de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (detector de objetos de una etapa, familia Ultralytics YOLOv8) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (.pt); el autor referencia el archivo `best.pt` |

## Arquitectura y entrenamiento

Se trata de un detector de objetos YOLOv8n, la variante "nano" de la familia YOLOv8 de Ultralytics, una arquitectura de detección de una sola etapa (single-stage) que predice simultáneamente cajas delimitadoras y clases sobre la imagen. El ajuste fino se realizó durante 100 épocas sobre una GPU Tesla T4 en Google Colab. No se documentan en la información disponible detalles como la función de pérdida, la resolución de entrada, el optimizador ni técnicas de aumento de datos.

El conjunto de entrenamiento proviene de dos fuentes combinadas. La base es el *Crop Disease Computer Vision Model* de Aryan Rajvanshi (Roboflow Universe, CC BY 4.0) y se le añadieron 145 imágenes adicionales de araña roja tomadas del modelo *tomato spider mite* de "tomato leaf disease" (Roboflow Universe, CC BY 4.0), incorporadas para corregir un desequilibrio de clases severo (el conjunto base contenía solo una imagen etiquetada de araña roja). El conjunto final consta de 2 977 imágenes, repartidas en 2 226 para entrenamiento, 449 para validación y 302 para prueba. No se mencionan fases de RLHF ni DPO (no aplicables a un modelo de detección).

## Capacidades

- Detección de objetos sobre imágenes de hojas de tomate, con localización mediante cajas delimitadoras.
- Identificación de nueve clases: *Tomato Early blight leaf*, *Tomato Septoria leaf spot*, *Tomato leaf (healthy)*, *Tomato leaf bacterial spot*, *Tomato leaf late blight*, *Tomato leaf mosaic virus*, *Tomato leaf yellow virus*, *Tomato mold leaf* y *Tomato two spotted spider mites leaf*.
- Inferencia directa mediante la API de Ultralytics (`model = YOLO("best.pt"); model("imagen.jpg")`), con visualización de resultados (`results[0].show()`).
- No soporta *tool calling* ni *function calling* (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües: no procesa ni genera texto.
- Capacidad restringida a visión por computador; no incluye modos de audio, *thinking* ni generación de texto.

## Casos de uso

- Diagnóstico fitosanitario en campo con aplicación móvil: el usuario fotografía una hoja de tomate y el modelo devuelve la clase de enfermedad detectada, sirviendo como primera orientación antes de consultar a un especialista.
- Monitorización de invernaderos con cámaras fijas: capturas periódicas de las plantas permiten detectar de forma temprana la aparición de mildiu o alternaria y activar avisos.
- Inspección con dron en explotaciones extensivas: al ser una variante nano, es candidata a ejecutarse en dispositivos de borde embarcados para sobrevolar cultivos y generar mapas de incidencia.
- Etiquetado asistido de imágenes de campo: el modelo puede preanotar grandes volúmenes de fotografías para acelerar la creación de nuevos conjuntos de datos.
- Seguimiento temporal de un foco concreto: comparando detecciones sucesivas sobre la misma planta se puede estimar si una afección se extiende o remite.
- Detección específica de araña roja: es la clase con mejor rendimiento (mAP50 de 0,995 y recall de 1,000), por lo que resulta adecuada para el seguimiento de esta plaga en particular.
- Investigación agronómica y docencia: sirve como base ligera y reentrenable para estudios de visión aplicada a fitopatología.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (métricas por clase):

| Clase | Precision | Recall | mAP50 | mAP50-95 |
|---|---|---|---|---|
| **Global (todas)** | 0,680 | 0,675 | **0,686** | 0,465 |
| Tomato two spotted spider mites leaf | 0,982 | 1,000 | 0,995 | 0,886 |
| Tomato Septoria leaf spot | 0,817 | 0,794 | 0,849 | 0,561 |
| Tomato mold leaf | 0,685 | 0,813 | 0,798 | 0,539 |
| Tomato Early blight leaf | 0,674 | 0,626 | 0,685 | 0,408 |
| Tomato leaf yellow virus | 0,591 | 0,682 | 0,654 | 0,464 |
| Tomato leaf | 0,614 | 0,594 | 0,590 | 0,329 |
| Tomato leaf late blight | 0,570 | 0,611 | 0,562 | 0,364 |
| Tomato leaf mosaic virus | 0,611 | 0,544 | 0,567 | 0,359 |
| Tomato leaf bacterial spot | 0,578 | 0,413 | 0,478 | 0,272 |

No se han publicado en la información disponible resultados comparativos con otros modelos (por ejemplo, otros detectores de la familia YOLO o de arquitecturas alternativas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU utilizada para entrenamiento: una Tesla T4 (Google Colab), durante 100 épocas.
- GPU recomendadas para inferencia: no disponible. Al tratarse de la variante nano de YOLOv8, en principio está pensada para entornos ligeros, pero no se aportan cifras concretas.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: la model card solo documenta el uso mediante la librería Ultralytics (carga del archivo `best.pt`); no se especifican vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). Otros formatos de exportación (ONNX, TensorRT, etc.) no se mencionan.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de detección de enfermedades del tomate ni con otras variantes de la familia YOLOv8.

## Limitaciones y advertencias

- Primera versión (v1): la precisión varía de forma notable entre clases (mAP50-95 desde 0,272 en *bacterial spot* hasta 0,886 en araña roja).
- La mancha bacteriana (*bacterial spot*) y el virus del mosaico presentan el *recall* más bajo (0,413 y 0,544 respectivamente), por lo que el modelo puede no detectar instancias reales de estas dos afecciones.
- Entrenado específicamente con hojas de tomate; no está validado en otros cultivos, por lo que no debe extrapolarse su uso a otras especies.
- Riesgo de falsos positivos y negativos inherente a un mAP50 global de 0,686; no conviene usar sus salidas como diagnóstico definitivo sin validación experta.
- Sesgos conocidos: no documentados explícitamente; el desequilibrio de clases del conjunto original (una sola imagen de araña roja antes del refuerzo) evidencia una posible distribución desigual de los datos.
- El rendimiento sobre *bacterial spot* y el virus del mosaico podría mejorar con más datos en una versión futura, según el propio autor.
- Licencia CC BY 4.0: permite uso comercial y obra derivada siempre que se atribuya la autoría; conviene conservar la atribución a Nariman Osman y a los conjuntos de datos de Roboflow de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NarimanOsman2025/tomato-disease-detector-yolov8n
- Conjunto base: https://universe.roboflow.com/aryan-rajvanshi-xvuyg/crop-disease-axhjj (Crop Disease Computer Vision Model, Aryan Rajvanshi, Roboflow Universe, CC BY 4.0)
- Conjunto suplementario: https://universe.roboflow.com/tomato-leaf-disease-brnbi/tomato-spider-mite-febhx (tomato spider mite Computer Vision Model, "tomato leaf disease", Roboflow Universe, CC BY 4.0)
