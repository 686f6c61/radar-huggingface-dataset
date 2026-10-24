# Kvs2026/strata-excavator-detector

## Resumen

Strata excavator detector es un modelo de detección de objetos publicado en HuggingFace por el usuario Kvs2026. Consiste en un fine-tune del detector RF-DETR en su variante nano, un transformer de detección en tiempo real derivado de la familia DETR, distribuido en formato ONNX y con licencia Apache-2.0. El modelo está especializado en maquinaria de obra y minería: detecta cuatro clases concretas (cuchara o *bucket*, brazo o *arm*, pluma o *boom* y camión o *truck*).

El problema que resuelve es acotado pero práctico: identificar piezas de una excavadora y camiones en imágenes, lo que habilita tareas de conteo, monitorización de flotas y análisis de seguridad en obra. Al estar exportado a ONNX y partir de una variante nano, está pensado para inferencia ligera y despliegue en entornos con recursos limitados, no para servidores de gran escala.

Su relevancia actual es limitada: el repositorio no tiene descargas ni valoraciones, la model card es mínima y no se publican métricas de validación, hiperparámetros de entrenamiento ni requisitos de hardware. Debe tratarse, por tanto, como un modelo experimental de nicho cuya calidad real no puede evaluarse sin una validación propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR variante nano (detector transformer basado en DETR); fine-tune del modelo base RF-DETR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; las clases estan etiquetadas en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Pipeline | object-detection |
| Clases detectadas | bucket, arm, boom, truck (4 clases) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-24 |

## Arquitectura y entrenamiento

El modelo parte de RF-DETR, un detector de objetos basado en transformer (familia DETR) orientado a inferencia en tiempo real, en su variante nano, la de menor coste computacional de la familia. La model card indica que el fine-tune mantiene la licencia Apache-2.0 y cita textualmente "Fine-tuned RF-DETR (Apache-2.0) by Vertichem", sin aclarar si Vertichem es el autor del ajuste fino, del modelo base o de ambos; ese dato no está disponible.

El entrenamiento se realizó sobre una agregación de cuatro conjuntos de datos de Roboflow, con la siguiente atribución declarada por el autor: CC BY 4.0 (universe.roboflow.com/angelicas-workspace-55uyb/yolo__3rd_june), CC BY 4.0 (universe.roboflow.com/falih-magna-agali/excavator-detection-bmo2), dominio público (universe.roboflow.com/construction-zt4tt/excavators_kamaz_kirill) y CC BY 4.0 (universe.roboflow.com/a-eaiqj/excavadoras). No se especifican el número de imágenes, la resolución de entrada, el número de épocas, las técnicas de aumento de datos, la estrategia de congelación de capas ni si hubo ajuste de hiperparámetros. Tampoco se documenta ninguna innovación técnica adicional más allá del propio diseño de RF-DETR.

## Capacidades

- Detección de objetos en imágenes con cuatro clases: cuchara (bucket), brazo (arm), pluma (boom) y camión (truck).
- Salida de cajas delimitadoras y etiquetas de clase en formato ONNX, consumible por runtimes estándar de inferencia.
- Inferencia ligera: la variante nano y el tamaño del repositorio (0,3 GB) apuntan a despliegue en CPU o GPU de gama baja, aunque el autor no publica latencias.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso, agentes ni generación de texto.
- No dispone de modo *thinking*, visión-lenguaje, audio ni capacidades multimodales más allá de la detección de imágenes.
- Capacidades multilingües: no aplica; las etiquetas de clase están en inglés.

## Casos de uso

- Monitorización de flota en obra: contar camiones (`truck`) por fotograma en imágenes de cámara fija o dron para estimar el volumen de material transportado por turno. La clase está explícitamente entrenada, lo que evita entrenar un detector desde cero.
- Análisis de ciclos de excavación: detectar de forma conjunta brazo, pluma y cuchara permite segmentar visualmente las fases de carga y descarga, útil para medir tiempos de ciclo y detectar cuellos de botella operativos.
- Seguridad en zonas de exclusión: verificar la presencia de maquinaria en áreas restringidas mediante inferencia sobre flujos de vídeo muestreados; el coste bajo del modelo nano permite procesar muchos flujos en paralelo en un solo servidor.
- Inspección con dron: procesar ortofotos o vídeo aéreo de canteras en lotes con ONNX Runtime en CPU, sin necesidad de GPU, para inventariar maquinaria presente en el terreno.
- Etiquetado asistido (*pre-labeling*): usar el modelo como preanotador para acelerar el etiquetado de nuevas imágenes de excavadoras, con revisión humana posterior; el formato ONNX facilita integrarlo en scripts de anotación.
- Despliegue en dispositivo *edge*: al ser una variante nano en ONNX, es candidato para placas o mini-PC industriales junto a la cámara, reduciendo el ancho de banda necesario al enviar solo eventos en lugar de vídeo continuo.
- Mantenimiento y telemetría visual: registrar la frecuencia de aparición y la posición relativa de las partes de la máquina para detectar patrones de uso anómalos (por ejemplo, una parte que deja de detectarse y podría indicar una avería u oclusión).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye mAP, precisión, recall, curvas precisión-recall, matriz de confusión ni comparación con el modelo base RF-DETR. Tampoco se aportan métricas de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica requisitos. Como referencia indirecta, el repositorio completo ocupa 0,3 GB, por lo que el conjunto de pesos es manejable en cualquier GPU consumer, pero no se documenta la resolución de entrada ni el consumo real.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, cualquier GPU con unos pocos GB de memoria libre debería poder cargarlo; no hay datos oficiales.
- GPU consumer: previsiblemente sí, dado el formato ONNX y la variante nano, pero el dato no está confirmado por el autor.
- Opciones de despliegue: al distribuirse en ONNX, es compatible con ONNX Runtime (CPU y GPU), TensorRT y OpenVINO como runtimes de ejecución. No aplica soporte en vLLM, TGI, llama.cpp u Ollama, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura / variante | Parametros | Formato | Licencia | Clases | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Strata excavator detector (Kvs2026) | RF-DETR nano fine-tune | no disponible | ONNX | Apache-2.0 | 4 (bucket, arm, boom, truck) | no disponible |
| RF-DETR nano (modelo base) | Detector transformer en tiempo real | no disponible en la informacion proporcionada | no disponible | Apache-2.0 (heredada por el fine-tune) | clases del dataset de origen | no disponible en la informacion proporcionada |
| Familia YOLO (YOLOv8n, YOLO11n) | Detector CNN en tiempo real | no disponible en la informacion proporcionada | PyTorch, ONNX, TensorRT | AGPL-3.0 en Ultralytics | configurable | no disponible en la informacion proporcionada |
| Detectores entrenados sobre excavator-detector (keremberke) | YOLO sobre 2.656 imagenes anotadas en COCO | no disponible | no disponible | no disponible | clase excavadora | no disponible |

La comparación cuantitativa no es posible con la información disponible: no se han publicado métricas de ninguno de los artefactos en las fuentes consultadas. La diferencia principal frente a la familia YOLO no es de rendimiento, sino de licencia (Apache-2.0 frente a AGPL-3.0 en Ultralytics), lo que puede ser determinante en productos comerciales cerrados.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay mAP, precisión ni recall publicados, por lo que la calidad del fine-tune es desconocida hasta que se valide sobre datos propios.
- Riesgo de falsos positivos y falsos negativos: al ser un detector especializado con cuatro clases muy concretas, es probable que confunda maquinaria similar (retroexcavadoras, grúas, camiones de otra tipología) o que falle ante oclusiones parciales; no hay datos que cuantifiquen este riesgo.
- Sesgo de dominio desconocido: se desconoce la distribución de los cuatro conjuntos de Roboflow empleados (geografía, tipo de maquinaria, condiciones de iluminación, ángulos de cámara). El rendimiento puede degradarse fuera de ese dominio.
- Sin información sobre el proceso de entrenamiento: no se documentan épocas, resolución, divisiones train/val/test ni criterios de parada, lo que impide reproducir el ajuste.
- Licencias de los datos de entrenamiento: tres de los cuatro conjuntos son CC BY 4.0, lo que exige atribución. La licencia Apache-2.0 cubre los pesos, pero la procedencia de los datos impone obligaciones de atribución que conviene revisar antes de un uso comercial.
- Idiomas: las etiquetas de salida están en inglés; cualquier capa de localización debe construirse por fuera del modelo.
- Madurez: cero descargas y cero valoraciones en el momento de la consulta, sin validación por parte de la comunidad ni issues públicos que permitan contrastar su comportamiento.
- No apto como detector general: el vocabulario de clases está limitado a cuatro categorías de maquinaria; no debe usarse como sustituto de un detector abierto.
- Advertencia de producción: conviene fijar la versión del archivo ONNX por hash y validar el modelo con un conjunto propio etiquetado antes de integrarlo en cualquier pipeline automatizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kvs2026/strata-excavator-detector
- Dataset de entrenamiento (CC BY 4.0): https://universe.roboflow.com/angelicas-workspace-55uyb/yolo__3rd_june
- Dataset de entrenamiento (CC BY 4.0): https://universe.roboflow.com/falih-magna-agali/excavator-detection-bmo2
- Dataset de entrenamiento (dominio publico): https://universe.roboflow.com/construction-zt4tt/excavators_kamaz_kirill
- Dataset de entrenamiento (CC BY 4.0): https://universe.roboflow.com/a-eaiqj/excavadoras
- Dataset relacionado de excavadoras (2.656 imagenes, COCO): https://www.modelscope.cn/datasets/keremberke/excavator-detector
- Conjunto de imagenes y modelo de excavacion en Roboflow: https://universe.roboflow.com/excavator-sampling/excava
- Enlace encontrado en la busqueda con el nombre "Strata" (producto de IA local, no consta relacion con este modelo): https://www.stratat.com/en
