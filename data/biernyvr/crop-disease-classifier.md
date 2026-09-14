# BiernyVR/crop-disease-classifier

## Resumen

El modelo crop-disease-classifier es un clasificador de imágenes desarrollado por el usuario BiernyVR, especializado en la detección de enfermedades en hojas de cultivos agrícolas. Se trata de un fine-tuning de EfficientNetV2-S sobre el conjunto de datos de referencia PlantVillage, que abarca 54.306 imágenes distribuidas en 38 clases (enfermedades y estados saludables) correspondientes a 14 especies de cultivos. El modelo resuelve una tarea de clasificación multiclase cerrada: dada una fotografía de una hoja, devuelve una de las 38 categorías posibles junto con su probabilidad asociada.

La relevancia de esta ficha radica en su orientación a producción: el autor publica tanto los pesos en PyTorch como una exportación a ONNX con datos externos, junto con el script de inferencia, el fichero de mapeo de clases y utilidades de explicabilidad mediante Grad-CAM. El modelo declara una precisión de validación del 99,89% y una latencia de inferencia en GPU del orden de 3,9 ms sobre una RTX 5080, con 21,5 millones de parámetros.

Con licencia MIT y un tamaño de repositorio de 0,2 GB, el modelo se posiciona como una pieza reutilizable para pipelines de agricultura de precisión, con la advertencia de que no se trata de un modelo generativo ni de un modelo de lenguaje: no dispone de ventana de contexto, capacidades multilingües ni soporte de tool calling, por lo que las filas correspondientes de la tabla de especificaciones se marcan como no aplicables o no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (red convolucional con bloques MBConv y Fused-MBConv, escalado compuesto) |
| Parámetros totales | 21,5 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen de 224 x 224 píxeles) |
| Tipos de cuantización | no disponible (se publican pesos PyTorch y exportación ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes; las etiquetas de clase están en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) y ONNX (.onnx + .onnx.data) |
| Pipeline | image-classification |
| Clases | 38 (14 especies de cultivo) |
| Resolución de entrada | 224 x 224, normalización ImageNet (media 0.485/0.456/0.406, desviación 0.229/0.224/0.225) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un EfficientNetV2-S, una red neuronal convolucional que combina bloques Fused-MBConv en las primeras etapas y MBConv en las posteriores, con escalado compuesto de profundidad, anchura y resolución. En esta ficha no se detalla la configuración exacta de bloques ni el número de canales, pero el recuento declarado de 21,5 millones de parámetros es coherente con la variante S de la familia EfficientNetV2. La entrada es una imagen RGB redimensionada a 224 x 224 píxeles y normalizada con estadísticas de ImageNet.

Según la model card, el entrenamiento se realizó sobre el conjunto PlantVillage (54.306 imágenes, 38 clases) en una NVIDIA GeForce RTX 5080 con CUDA 13.2 y SM_120, utilizando el optimizador AdamW, un schedule de learning rate coseno, label smoothing de 0,1 y un tamaño de lote de 64. El autor no especifica el número de épocas, el desglose exacto del split de entrenamiento/validación ni si se aplicó data augmentation, por lo que esos datos quedan como no disponibles. No se menciona ningún tipo de ajuste por refuerzo (RLHF, DPO) ni destilación, algo esperable en un clasificador de visión supervisado. Como elemento diferencial, se incluye soporte de explicabilidad mediante Grad-CAM, con el objetivo declarado de que las activaciones se alineen con lesiones patológicas, pústulas de roya y zonas de necrosis en lugar de con artefactos del fondo.

## Capacidades

- Clasificación de imágenes de hojas de cultivo en 38 categorías (enfermedad concreta o estado saludable).
- Cobertura de 14 especies: manzana, arándano, cereza, maíz, uva, naranja, melocotón, pimiento, patata, frambuesa, soja, calabaza, fresa y tomate.
- Detección de patologías específicas como sarna del manzano, podredumbre negra, roya del manzano, oídio, cercospora, roya común, tizón norteño, esca, huanglongbing, mancha bacteriana, tizón temprano y tardío, moho de la hoja, septoriosis, araña roja, mancha diana, virus del rizado amarillo, virus del mosaico y quemadura de la hoja, entre otras.
- Inferencia sobre CPU mediante ONNX Runtime y sobre GPU con PyTorch, sin dependencia obligatoria de PyTorch en el camino ONNX.
- Generación de mapas de calor Grad-CAM para justificar visualmente la predicción.
- Salida de probabilidades normalizadas mediante softmax y recuperación de las k clases más probables a través del script de línea de comandos.
- Integración en pipelines de visión por computador mediante exportación ONNX apta para TensorRT y despliegue en dispositivos móviles o de borde.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente, multilingüismo ni modo de pensamiento.

## Casos de uso

- Diagnóstico asistido en campo: una aplicación móvil captura la hoja, ejecuta el modelo ONNX en el dispositivo y devuelve la enfermedad detectada y su probabilidad, permitiendo al agricultor decidir el tratamiento antes de desplazarse a un técnico.
- Triaje en estaciones de inspección: cámaras fijas en invernaderos que clasifican hojas de forma continua con una latencia de pocos milisegundos en GPU, generando alertas tempranas cuando aparece una clase patológica.
- Seguimiento de la evolución de un foco: comparando clasificaciones sucesivas de hojas de la misma planta se puede observar la transición entre clases, por ejemplo de mancha bacteriana a tizón tardío.
- Validación de material vegetal en viveros: clasificación automatizada de lotes de plántulas para descartar individuos con síntomas compatibles con virus como el del rizado amarillo del tomate.
- Apoyo a la extensión agraria: el mapa Grad-CAM sirve como material didáctico para mostrar a los agricultores en qué zona de la hoja se ha detectado el síntoma, aumentando la confianza en la recomendación.
- Investigación agronómica y reproducción de experimentos: dado que la arquitectura, el dataset y la licencia MIT están documentados, el modelo sirve como línea base reutilizable para comparar nuevas propuestas sobre PlantVillage.
- Preprocesado en pipelines de análisis de cultivos: el clasificador actúa como primer filtro para segmentar imágenes por estado sanitario antes de tareas más costosas, como segmentación de lesiones o estimación de severidad.
- Control de calidad en laboratorios de fitopatología: catalogación semiautomática de muestras fotografiadas para su incorporación a bases de datos de seguimiento.

## Benchmarks y rendimiento

Los resultados siguientes están declarados por el autor en la model card del modelo. La métrica principal figura con el indicador `verified: false`, es decir, no ha sido validada de forma independiente en la información disponible.

| Modelo | Precisión de validación | Macro F1 | Latencia (RTX 5080) | Parámetros | Formato |
|---|---|---|---|---|---|
| EfficientNetV2-S (este modelo) | 99,89% | ~0,999 | ~3,9 ms | 21,5 M | PyTorch + ONNX |
| ResNet50 (baseline del autor) | 97,10% | 0,969 | ~3,8 ms | 25,6 M | PyTorch |

| Conjunto de datos | Tarea | Métrica | Valor | Verificado |
|---|---|---|---|---|
| PlantVillage | Image classification | Validation accuracy | 0,9989 | No |

No se han publicado en la información disponible resultados desagregados por clase, precisión/recall por patología, ni evaluaciones sobre conjuntos distintos de PlantVillage.

## Requisitos de hardware

- VRAM estimada: con 21,5 millones de parámetros, los pesos en FP32 ocupan aproximadamente 86 MB. La inferencia en FP32 requiere del orden de 1 GB de VRAM incluyendo activaciones y buffers, y puede reducirse por debajo de 1 GB con lotes pequeños o ejecución en CPU.
- GPU recomendadas: el autor reporta la latencia sobre una RTX 5080. Por la arquitectura y el tamaño, cualquier GPU moderna es suficiente, incluidas RTX 3060, RTX 4070, RTX 4090, A100, H100 y L4.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso en iGPU modernas con presupuesto de memoria compartida.
- Ejecución en CPU: viable mediante ONNX Runtime con el proveedor de CPU, tal y como muestra el ejemplo de la model card; el rendimiento será inferior al de GPU pero adecuado para uso por petición.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), TensorRT a partir del modelo ONNX, PyTorch nativo y cualquier runtime compatible con ONNX.
- Latencia y throughput: el autor declara ~3,9 ms por inferencia en una RTX 5080, lo que equivale a unos 256 fotogramas por segundo en condiciones ideales de cómputo, sin contabilizar el preprocesado ni el postprocesado. No se proporcionan cifras de latencia en CPU ni de throughput con batching.
- Almacenamiento: el repositorio completo ocupa 0,2 GB, incluyendo pesos PyTorch, exportación ONNX, scripts y gráficas de evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de entrada | Precisión en PlantVillage | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNetV2-S (este modelo) | 21,5 M | 224 x 224 | 99,89% (validación declarada) | MIT | HuggingFace, PyTorch + ONNX |
| ResNet50 (baseline del autor) | 25,6 M | no especificada (se asume 224 x 224) | 97,10% | no disponible | citado solo como referencia interna |
| Otros clasificadores sobre PlantVillage | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos verificados de otros modelos comparables en la información suministrada, por lo que la comparación se limita al baseline ResNet50 que el propio autor incluye en su model card.

## Limitaciones y advertencias

- La precisión del 99,89% está declarada por el autor y marcada como no verificada (`verified: false`); no se ha validado de forma independiente.
- El rendimiento sobre PlantVillage no es extrapolable a fotografías de campo sin evaluar el dominio: el conjunto contiene imágenes con fondo relativamente controlado, por lo que la generalización a imágenes con iluminación variable, oclusiones, varias hojas o fondo complejo puede degradarse.
- No hay información sobre el split exacto de entrenamiento y validación, lo que dificulta reproducir la métrica y comprobar que no existe fuga de datos entre ambos conjuntos.
- El modelo solo reconoce las 38 clases y las 14 especies contempladas. Una hoja de una especie no incluida se clasificará forzosamente en alguna de las categorías existentes, con riesgo de falsos positivos.
- La clase "saludable" está presente para varias especies, pero no para todas (por ejemplo, la naranja solo aparece con huanglongbing, y la calabaza solo con oídio), lo que introduce un desequilibrio en la cobertura del espacio de etiquetas.
- No se documentan sesgos demográficos ni geográficos, pero al proceder de un único conjunto de datos, cabe esperar un sesgo hacia las condiciones de captura de PlantVillage.
- No hay información sobre robustez frente a imágenes adversarias, compresión JPEG agresiva, baja resolución o imágenes fuera de distribución.
- La licencia MIT permite uso comercial y modificación, pero no se especifican condiciones adicionales sobre los datos de entrenamiento más allá de la procedencia de PlantVillage; conviene revisar la licencia del propio conjunto de datos si se va a redistribuir.
- Al ser un clasificador de visión, no gestiona conversaciones, no genera texto y no admite instrucciones en lenguaje natural: cualquier integración debe colocar una capa de lógica alrededor para traducir la predicción en una recomendación agronómica.
- El autor no documenta el número de épocas, estrategia de aumento de datos ni criterio de selección del mejor checkpoint, lo que limita la reproducibilidad estricta del entrenamiento.
- El uso en producción debe tratar la salida como una señal de apoyo y no como un diagnóstico fitosanitario definitivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BiernyVR/crop-disease-classifier
- Fichero de pesos PyTorch: efficientnet_v2_s_best.pth (dentro del repositorio de HuggingFace)
- Exportación ONNX: efficientnet_v2_s_best.onnx y efficientnet_v2_s_best.onnx.data (dentro del repositorio de HuggingFace)
- Mapeo de clases: classes.json (dentro del repositorio de HuggingFace)
- Script de inferencia: infer.py (dentro del repositorio de HuggingFace)
- Conjunto de datos PlantVillage: no se proporciona enlace directo en la información disponible
- Paper o publicación asociada: no disponible
- Repositorio de código adicional o demo: no disponible

No se han encontrado enlaces relevantes adicionales en la búsqueda web; los resultados devueltos no guardan relación con este modelo.
