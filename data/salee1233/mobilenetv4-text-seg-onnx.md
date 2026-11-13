# salee1233/mobilenetv4-text-seg-onnx

## Resumen

`mobilenetv4-text-seg-onnx` es una conversión no oficial a ONNX del modelo de segmentación de texto del proyecto [daominhwysi/manga-translator](https://github.com/daominhwysi/manga-translator), publicada por el usuario `salee1233`. El modelo predice máscaras de texto (probabilidad por píxel) sobre recortes de imagen de 256×256, y no realiza OCR ni traducción: su única función es aislar las regiones que contienen texto para que otros componentes del pipeline puedan procesarlas. Está construido sobre una columna vertebral MobileNetV4, lo que sugiere un diseño orientado a eficiencia computacional en lugar de máxima precisión.

La relevancia de esta publicación es limitada y muy específica: se trata de un artefacto de compatibilidad para integrar el modelo en entornos que consumen ONNX Runtime (por ejemplo, aplicaciones de escritorio, móviles o servicios ligeros en CPU) sin depender del framework original. El autor declara explícitamente que la validación se realizó sobre un conjunto fijo de 23 imágenes con 229 bloques de texto, y que los resultados constituyen "evidencia de compatibilidad, no un benchmark de calidad general". No hay métricas publicadas, ni datos de entrenamiento propios, ni información sobre el proceso de conversión más allá del tamaño del fichero (48.103.781 bytes).

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño declarado es de 0,0 GB (lo cual es inconsistente con el tamaño del fichero ONNX indicado, probablemente por un redondeo de la plataforma) y la licencia se declara como "other" con un aviso de licencia upstream en `NOTICE.txt`. No se dispone de información sobre idiomas soportados ni sobre el rendimiento del modelo en términos de IoU, precisión o recall.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 (red convolucional) como columna vertebral del segmentador; detalles exactos del cabezal de segmentación no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 256×256 píxeles) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es un ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de segmentación de texto, independiente del idioma del contenido) |
| Licencia | other (`upstream-license-notice`), con aviso en `NOTICE.txt` |
| Formato de pesos | ONNX (`mbnv4_text_seg.onnx`, 48.103.781 bytes) |

Especificaciones de entrada y salida:

| Parametro | Valor |
|---|---|
| Nombre de entrada | `image` |
| Forma de entrada | `[1, 3, 256, 256]` |
| Tipo de entrada | uint8 RGB, valores 0–255 |
| Nombre de salida | `prob` |
| Forma de salida | `[1, 1, 256, 256]` |
| Tipo de salida | float32, valores 0–1 |
| Normalizacion incluida | sí (no volver a aplicarla) |
| Sigmoide incluida | sí (no volver a aplicarla) |
| Umbral recomendado | 0,3 (según el autor, uso en PuriPuly) |

## Arquitectura y entrenamiento

La información disponible indica únicamente que el modelo se apoya en MobileNetV4 como arquitectura base y que se trata de una conversión ONNX de un modelo de segmentación de texto del proyecto manga-translator. No se especifican el número de capas, el ancho de los canales, la variante concreta de MobileNetV4 (por ejemplo, Small, Medium o Large), el mecanismo de decodificación del cabezal de segmentación ni si se emplea alguna técnica de atención ligera (como Universal Inverted Bottleneck) propia de la familia MobileNetV4.

Tampoco se documentan los datos de entrenamiento: no hay información sobre el número de tokens o imágenes, la composición del dataset, el uso de RLHF/DPO (no aplicable en un modelo de visión) ni sobre el proceso de conversión a ONNX (herramienta utilizada, versión de opset, verificación numérica frente al modelo original). El autor declara explícitamente que no hubo entrenamiento adicional ("No additional training") y que la validación se limitó a comprobar que las 23 imágenes del conjunto existente con 229 bloques de texto fijos completaban la inferencia con ONNX Runtime 1.28.0 en CPU. Cualquier innovación técnica más allá de la propia arquitectura MobileNetV4 no está disponible en la información proporcionada.

## Capacidades

- Segmentación de texto en imágenes: genera una máscara de probabilidad por píxel (`prob`, float32 en [0,1]) que indica la probabilidad de que cada píxel pertenezca a una región de texto.
- Entrada de imagen RGB de tamaño fijo 256×256: el pipeline debe redimensionar los recortes a esa resolución y reasignar las probabilidades al tamaño original.
- Normalización y sigmoide integradas en el grafo ONNX: el consumidor no debe aplicar ninguna transformación adicional a la entrada ni a la salida.
- Umbralización configurable: el autor recomienda un umbral de 0,3 para obtener la máscara binaria final en el contexto de PuriPuly.
- Inferencia en CPU mediante ONNX Runtime: validado con la versión 1.28.0.
- No realiza OCR: no extrae texto ni reconoce caracteres.
- No realiza traducción: no genera texto traducido a partir de la imagen.
- No soporta tool calling ni function calling: es un modelo puramente visual sin interfaz de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica; la segmentación de texto es independiente del idioma del contenido.
- No dispone de modo "thinking", visión general, audio ni otras capacidades especiales.

## Casos de uso

- Preprocesado en pipelines de traducción de manga o cómic: el modelo aísla las regiones con texto para que un OCR posterior (por ejemplo, Tesseract o un detector específico) procese únicamente los recortes relevantes, reduciendo falsos positivos en zonas de dibujo. Es adecuado porque su salida es una máscara de probabilidad directamente consumible y el autor lo validó en el contexto del proyecto manga-translator.
- Integración en aplicaciones de escritorio o móviles que ya usan ONNX Runtime: al ser un único fichero ONNX de ~48 MB, se puede empaquetar junto con la aplicación sin arrastrar dependencias de PyTorch, lo que simplifica la distribución y reduce el tamaño del binario.
- Servicios ligeros de segmentación en CPU: al estar validado con ONNX Runtime 1.28.0 en CPU y tener una entrada fija de 256×256, encaja en despliegues sin GPU donde el coste por inferencia debe ser bajo y predecible.
- Limpieza o enmascarado de texto en digitalización de documentos escaneados: la máscara permite eliminar o difuminar regiones de texto antes de un procesamiento posterior (por ejemplo, para anonimizar o para preparar imágenes para impresión).
- Detección de presencia de texto como paso previo a un OCR condicional: usando el umbral 0,3 recomendado, se puede decidir si un recorte contiene texto suficiente como para invocar un OCR más costoso, ahorrando cómputo en imágenes sin texto.
- Prototipado rápido de pipelines de visión: al ser un artefacto ONNX autocontenido con normalización y sigmoide incluidas, permite a un desarrollador probar la etapa de segmentación de texto sin tener que replicar el preprocesado del modelo original.
- Filtrado de regiones en herramientas de anotación: la máscara de probabilidad puede servir como sugerencia inicial para anotadores humanos que marcan bloques de texto en imágenes, acelerando el etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica únicamente que la conversión se comprobó con ONNX Runtime 1.28.0 en CPU sobre un conjunto de 23 imágenes con 229 bloques de texto fijos, y que "todas las tareas se completaron". Se trata de evidencia de compatibilidad, no de una evaluación de calidad (IoU, precisión, recall, F1) ni de latencia o throughput. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del fichero (48,1 MB en ONNX), el modelo es muy pequeño y podría ejecutarse en GPUs con muy poca memoria; sin embargo, esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponibles. El autor solo valida explícitamente CPU con ONNX Runtime 1.28.0; no se documenta ejecución en GPU.
- ¿Cabe en GPU de consumo? No hay datos oficiales. Por el tamaño del artefacto, es plausible que quepa en cualquier GPU de consumo moderna, pero no está verificado ni documentado.
- Opciones de despliegue: ONNX Runtime (versión validada: 1.28.0, CPU). No se documentan otras opciones como TensorRT, OpenVINO, vLLM, llama.cpp, Ollama o TGI (estas últimas no aplican a un modelo de segmentación de imágenes).
- Latencia y throughput: no disponibles. No se publican tiempos por inferencia ni imágenes por segundo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación de texto (por ejemplo, variantes de U-Net, SegFormer o Detectron2 aplicadas a texto), ni datos de rendimiento que permitan establecer una comparación rigurosa. El único punto de referencia mencionado es el modelo original del proyecto manga-translator, del cual esta publicación es una conversión, pero no se ofrecen métricas comparativas entre ambos.

## Limitaciones y advertencias

- Conversión no oficial: el autor declara explícitamente que es una conversión ONNX no oficial y que no ha realizado entrenamiento adicional; la calidad depende enteramente del modelo upstream.
- Licencia "other" con aviso upstream: la licencia se declara como `other` con `license_name: upstream-license-notice` y un enlace a `NOTICE.txt`. Es imprescindible revisar dicho aviso antes de cualquier uso comercial o redistribución, ya que las condiciones reales pueden provenir del proyecto original y no están resumidas en la model card.
- Validación limitada: la comprobación se realizó sobre 23 imágenes y 229 bloques de texto fijos; no constituye una evaluación de calidad general ni garantiza el comportamiento en otros dominios (idiomas, tipografías, layouts, resoluciones).
- Limitaciones de enmascarado y layout reconocidas por el autor: la model card indica que "existen limitaciones de enmascarado y layout", sin detallarlas.
- Riesgo de falsos positivos y negativos en la máscara: al no publicarse métricas de IoU ni curvas precisión-recall, no se puede caracterizar el error del modelo; el umbral 0,3 es una recomendación del autor en un contexto concreto (PuriPuly) y puede no ser óptimo en otros.
- Dependencia del redimensionado: el modelo opera a 256×256 y requiere reescalar los recortes y reasignar las probabilidades al tamaño original; un redimensionado inadecuado puede degradar la máscara.
- No apto para OCR ni traducción: el modelo solo segmenta; cualquier expectativa de extracción o traducción de texto queda fuera de su alcance.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un dataset no especificado, podrían existir sesgos hacia ciertos estilos de texto o layouts.
- Idiomas: no se declara ningún conjunto de idiomas soportados; la segmentación es visual, pero el rendimiento podría variar según la tipografía y el sistema de escritura.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Inconsistencia en el tamaño del repo: la plataforma indica 0,0 GB mientras que el fichero ONNX declarado pesa 48,1 MB; conviene verificar el contenido real del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salee1233/mobilenetv4-text-seg-onnx
- Aviso de licencia upstream: https://huggingface.co/salee1233/mobilenetv4-text-seg-onnx/blob/main/NOTICE.txt
- Proyecto original (modelo upstream): https://github.com/daominhwysi/manga-translator
- ONNX Runtime (runtime validado, versión 1.28.0): https://onnxruntime.ai/
- Paper de MobileNetV4 (referencia de arquitectura, no enlazado en la model card): no disponible en la información proporcionada.
