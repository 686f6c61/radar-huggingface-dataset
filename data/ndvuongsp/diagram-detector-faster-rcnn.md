# ndvuongsp/diagram-detector-faster-rcnn

## Resumen

`diagram-detector-faster-rcnn` es un detector de entidades visuales basado en Faster R-CNN con backbone ResNet-50 y cuello FPN, ajustado por el autor `ndvuongsp` para operar sobre diagramas educativos y cientificos. Forma parte de EduSGG, un framework neuro-simbolico descrito por su autor como "Stage 1 (Diagram Entity Perception)": el modelo se encarga de localizar los elementos graficos del diagrama (formas, etiquetas de texto, flechas y puntas de flecha) que despues alimentarian una etapa de generacion de grafos de escena y razonamiento.

El modelo no es un LLM ni un modelo generativo: es un detector de objetos de dos etapas con propuesta de regiones (RPN) y cabezas de clasificacion y regresion de cajas. Detecta cuatro clases de primer plano (`blob`, `text`, `arrow`, `arrowHead`) mas el fondo, con relaciones de aspecto de ancla ajustadas a `[0.2, 0.5, 1.0, 2.0, 5.0]` para capturar etiquetas horizontales largas y flechas verticales estrechas.

Es relevante para quien trabaje en comprension de diagramas, parsing de figuras cientificas o pipelines multimodales que necesiten una etapa de percepcion estructurada previa al razonamiento. El repositorio ocupa 0,2 GB y la licencia es Apache 2.0. No se han publicado datos sobre numero de parametros, contexto (no aplica) ni composicion del dataset de entrenamiento mas alla de la evaluacion sobre el split de test de AI2D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone ResNet-50 + FPN y Region Proposal Network |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint `.pth` en FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, vi (etiquetas del modelo card; el modelo procesa imagenes, no texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (`faster_rcnn_ai2d_detector.pth`), compatible con `torchvision` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estandar de Faster R-CNN: un backbone convolucional ResNet-50 con Feature Pyramid Network extrae mapas de caracteristicas multiescala; una Region Proposal Network genera propuestas de region; y una cabeza ROI (RoIAlign + clasificador + regresor) refina las cajas y asigna clase. La unica modificacion estructural documentada es la sustitucion de la cabeza de prediccion (`FastRCNNPredictor`) para 5 clases (fondo + 4 entidades) y el ajuste de las relaciones de aspecto de las anclas a `[0.2, 0.5, 1.0, 2.0, 5.0]`.

El autor indica que el modelo se ha ajustado para diagramas educativos y cientificos y lo evalua sobre el split de test del dataset Allen Institute AI2D, lo que sugiere que AI2D es al menos parte de los datos de entrenamiento o evaluacion. No se especifican en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del dataset, el numero de iteraciones, la estrategia de aumento de datos ni si se empleo inicializacion desde pesos preentrenados en COCO. Tampoco se documenta ninguna innovacion de decodificacion, atencion lineal ni tecnica de inferencia especulativa (no aplicables a este tipo de modelo).

## Capacidades

- Deteccion de objetos en imagenes de diagramas con cuatro clases de entidad: `blob` (graficos e ilustraciones), `text` (bloques de texto explicativo y etiquetas), `arrow` (conectores direccionales) y `arrowHead` (puntas de flecha).
- Localizacion con cajas delimitadoras y puntuacion de confianza por deteccion; umbral de score configurable en la inferencia (el ejemplo del model card usa 0,5).
- Manejo de objetos con geometrias extremas gracias a las relaciones de aspecto de ancla ampliadas (etiquetas horizontales largas y flechas verticales estrechas).
- Inferencia sobre imagenes RGB individuales mediante `torchvision`; no se documenta procesamiento por lotes ni soporte de video.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es una etapa de percepcion dentro de un pipeline mayor (EduSGG).
- No es un modelo multilingue en sentido estricto: procesa pixeles y devuelve etiquetas de clase; los idiomas `en` y `vi` del model card reflejan el contexto del proyecto, no capacidades linguisticas.
- No dispone de modo "thinking", vision generativa, audio ni generacion de texto.

## Casos de uso

- Parsing de figuras cientificas: extraer cajas de texto, formas y flechas de figuras en papers para reconstruir la estructura del diagrama antes de aplicar un modelo multimodal de razonamiento. La deteccion de `text` y `arrow` permite construir un grafo aproximado de relaciones.
- Generacion de grafos de escena educativos: servir como etapa 1 de EduSGG, alimentando las detecciones a un modulo neuro-simbolico que infiera relaciones entre entidades y produzca un scene graph utilizable para responder preguntas sobre el diagrama.
- Indexacion y busqueda de material didactico: procesar lotes de imagenes de libros de texto y catalogar que diagramas contienen flechas, etiquetas y graficos, habilitando busqueda por estructura visual.
- Preprocesado para OCR selectivo: usar las cajas de clase `text` para recortar regiones y enviarlas a un motor OCR, reduciendo coste frente a aplicar OCR a la imagen completa.
- Accesibilidad de contenido STEM: localizar y describir la estructura de diagramas para generar descripciones alternativas o transcripciones textuales destinadas a lectores con discapacidad visual.
- Control de calidad de figuras en publicacion: detectar diagramas con flechas mal conectadas o etiquetas de texto sin forma asociada como paso previo a revision editorial automatizada.
- Investigacion en comprension de diagramas: emplear el checkpoint como baseline reproducible (mAP@0.5 = 74,2 % en AI2D test) para comparar nuevas arquitecturas de deteccion de entidades en diagramas.

## Benchmarks y rendimiento

Resultados reportados por el autor en el model card sobre el split de test de Allen Institute AI2D:

| Metrica | Valor |
|---|---|
| mAP@0.5 | 74,2 % |
| Precision | 76,8 % |
| Recall | 71,9 % |

No se han publicado en la informacion disponible resultados desglosados por clase, mAP@[0.5:0.95], ni comparaciones con otros detectores sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa para Faster R-CNN con ResNet-50-FPN en FP32, una imagen individual suele requerir del orden de 2-4 GB de VRAM; el dato exacto para este checkpoint no esta publicado.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en FP32; para procesamiento por lotes o entrenamiento adicional, se recomienda A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, previsiblemente en GTX 1660 Super (6 GB), RTX 3060 (12 GB), RTX 4060 (8 GB) y superiores, aunque el requisito exacto no esta documentado.
- Opciones de despliegue: inferencia directa con `torchvision` y PyTorch (unico metodo documentado en el model card). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo; seria posible exportar a TorchScript u ONNX, pero no esta verificado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores evaluados sobre el mismo split de AI2D con las mismas cuatro clases, por lo que la comparacion cuantitativa no esta disponible. A modo de referencia estructural:

| Modelo | Arquitectura | Clases | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ndvuongsp/diagram-detector-faster-rcnn` | Faster R-CNN ResNet-50-FPN | 4 + fondo | Imagen RGB | Apache 2.0 | Hugging Face |
| Faster R-CNN ResNet-50-FPN (torchvision, COCO) | Faster R-CNN ResNet-50-FPN | 80 + fondo | Imagen RGB | BSD-3 (torchvision) | torchvision |
| Detectores de diagramas tipo LayoutLM/DiT | Transformer multimodal | variable | Imagen + texto | variable | variable |

La comparacion con alternativas especificas de deteccion de entidades en diagramas educativos no esta disponible en la informacion consultada.

## Limitaciones y advertencias

- El modelo solo detecta cuatro clases de entidad; cualquier elemento de diagrama fuera de `blob`, `text`, `arrow` y `arrowHead` (por ejemplo, iconos especificos, ejes de graficas o formulas) no sera reconocido.
- No se documenta el dominio exacto de entrenamiento ni la composicion del dataset, por lo que el rendimiento fuera de AI2D y de diagramas educativos/cientificos es incierto.
- Riesgo de falsos positivos y negativos en diagramas con solapamientos densos, texto muy pequeno o flechas curvas; el recall reportado (71,9 %) implica que aproximadamente una de cada cuatro instancias no se detecta.
- El umbral de confianza (0,5 en el ejemplo) afecta directamente a precision y recall; no se publican curvas precision-recall para elegir umbrales alternativos.
- Sesgos: no se documenta analisis de sesgo por tipo de diagrama, idioma del texto embebido ni origen del material; el modelo puede comportarse peor en diagramas de dominios no representados en AI2D.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; no se documentan restricciones adicionales.
- El checkpoint se distribuye como `.pth` de PyTorch, lo que requiere `torch.load`; conviene cargar con `map_location` y verificar la integridad del fichero, ya que `torch.load` sobre pesos no confiables puede ejecutar codigo.
- No hay garantia de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada (2026-11-08) es posterior a la de esta ficha, lo que conviene verificar antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ndvuongsp/diagram-detector-faster-rcnn
- Repositorio del proyecto EduSGG: https://github.com/vuongndlst/edusgg-dashboard
- Demo interactiva: https://vuongndlst.github.io/edusgg-dashboard/
- Referencia general de Faster R-CNN (GeeksforGeeks): https://www.geeksforgeeks.org/machine-learning/faster-r-cnn-ml/
- Guia de Faster R-CNN en PyTorch: https://www.codegenes.net/blog/object-detection-faster-rcnn-pytorch/
- Documentacion de `torchvision.models.detection`: https://pytorch.org/vision/stable/models.html#object-detection
