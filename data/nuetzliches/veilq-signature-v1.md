# nuetzliches/veilq-signature-v1

## Resumen

veilq-signature-v1 es un detector de firmas manuscritas en imagenes de documentos y capturas de pantalla, publicado por el usuario nuetzliches. Se trata de un ajuste fino (fine-tuning) del modelo mdefrance/yolos-tiny-signature-detection, un detector de objetos basado en la arquitectura YOLOS en su variante "tiny" (aproximadamente 6 millones de parametros, segun la familia YOLOS-tiny de Hugging Face). El modelo se distribuye exclusivamente en formato ONNX (opset 17) y forma parte del proyecto veilq, una herramienta que localiza firmas en documentos para posteriormente censurarlas o taparlas.

El problema que resuelve es concreto: el modelo base confundia marcas de agua diagonales (como "DRAFT", "ENTWURF" o "COPY"), sellos y logotipos con firmas manuscritas. Este ajuste se entrena especificamente para distinguir trazos manuscritos reales de esos elementos superpuestos, reduciendo de forma notable los falsos positivos en documentos con marcas de agua.

Es relevante para desarrolladores que necesiten anonimizar o procesar documentos de forma automatizada, ya que ofrece una deteccion de firmas mas precisa que su modelo base y se integra en un pipeline reproducible (veilq fija el modelo por su hash SHA-256). La informacion publicada no incluye datos sobre longitud de contexto (no aplica, es un modelo de vision) ni sobre idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOS (transformer de deteccion de objetos, variante tiny) |
| Parametros totales | no disponible (familia YOLOS-tiny, aprox. 6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 640 x 640) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX float32) |
| Idiomas soportados | no disponible (no procesa texto de forma nativa) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, fichero model.onnx) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura YOLOS-tiny, un transformer de deteccion de objetos que aplica un encoder tipo ViT sobre parches de la imagen y produce directamente cajas y logits mediante cabezas de prediccion. La entrada es un tensor float32 de forma [1, 3, 640, 640] con normalizacion ImageNet (media [0.485, 0.456, 0.406], desviacion [0.229, 0.224, 0.225]). Las salidas son logits [1, 100, 2] (firma / nada, con softmax) y pred_boxes [1, 100, 4] (centro x, centro y, ancho y alto como proporciones de la entrada).

El ajuste fino se realizo sobre 1.200 imagenes sinteticas generadas artificialmente (ninguna de personas reales): cartas y capturas de cartas junto a una ventana de aplicacion, con firmas en fuentes manuscritas (Caveat, Dancing Script, Great Vibes, Homemade Apple, Reenie Beanie, Allura, Sacramento, Kalam, Nothing You Could Do) y trazos dibujados, a veces superpuestos al nombre o cargo impreso, junto con marcas de agua diagonales, sellos, logotipos, tablas y lineas. El entrenamiento consistio en 16 epocas en CPU, batch 8, optimizador AdamW con tasa de aprendizaje 2e-5, manteniendo congelados los embeddings de parches y las 6 primeras de las 12 capas del encoder. La mejor epoca (13) se selecciono sobre 200 imagenes sinteticas reservadas, evaluadas con el mismo criterio de lectura que usa veilq (imagen completa y en cuadrados del lado menor cuando la imagen no es cuadrada; umbral de score 0,5; cajas desde 40 px de ancho).

## Capacidades

- Deteccion de firmas manuscritas en imagenes de documentos y capturas de pantalla.
- Distincion entre firmas y marcas de agua diagonales (DRAFT, ENTWURF, COPY), sellos y logotipos.
- Salida de hasta 100 cajas delimitadoras con puntuacion de confianza por caja.
- Procesamiento de imagenes completas y de recortes cuadrados para imagenes no cuadradas.
- No realiza verificacion ni comparacion de firmas: solo localiza su posicion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente de vision).
- No dispone de modo de razonamiento (thinking), vision generativa, audio ni generacion de texto.

## Casos de uso

- Anonimizacion de documentos legales: el modelo localiza las firmas en contratos escaneados para que un pipeline posterior las tape o ennegrezca, evitando exponer datos personales en procesos de publicacion o comparticion.
- Procesamiento de facturas y albaranes: en capturas de previsualizacion de facturas con marca de agua, el modelo identifica unicamente la firma y no la marca, lo que permite censurar solo la informacion sensible.
- Cumplimiento de proteccion de datos (RGPD): integrado en herramientas de redaccion documental, permite eliminar firmas de expedientes antes de archivarlos o cederlos a terceros.
- Automatizacion de flujos de digitalizacion: en un sistema de gestion documental, el detector marca las zonas con firma para su revision o tratamiento posterior (OCR selectivo, sellado digital).
- Preprocesado para OCR: al aislar las regiones de firma, se puede excluir ese contenido del reconocimiento optico de caracteres, mejorando la precision del texto extraido.
- Filtrado en plataformas de tramitacion electronica: deteccion de firmas en formularios y solicitudes subidas por usuarios para aplicar politicas de privacidad antes de almacenarlas.
- Uso como componente en el proyecto veilq: el modelo se descarga mediante `veilq models fetch signature` y se emplea directamente para tapar las firmas detectadas, con integridad verificada por SHA-256.

## Benchmarks y rendimiento

Los datos publicados en la model card son los siguientes:

| Conjunto de evaluacion | Modelo base | veilq-signature-v1 |
|---|---|---|
| 200 imagenes reservadas (137 firmas) | recall 0,91; 132 cajas falsas | recall 1,00; 24 cajas falsas |
| 20 cartas con marca de agua (otro generador) | 12/20 encontradas; 55 cajas falsas | 20/20 encontradas; 14 cajas falsas |
| 20 cartas sin marca de agua (otro generador) | 19/20 encontradas; 0 cajas falsas | 20/20 encontradas; 0 cajas falsas |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, COCO, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; un modelo YOLOS-tiny en ONNX float32 ocupa del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer (incluso en CPU).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) acelera la inferencia pero no es necesaria.
- Cabe en GPU consumer: si, en practicamente todas (incluidas GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo), integracion en el proyecto veilq, y conversion a otros runtimes compatibles con ONNX (TensorRT, OpenVINO) si se requiere.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un modelo tiny y entrenado en CPU, se espera una latencia baja por imagen, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veilq-signature-v1 | no disponible (YOLOS-tiny) | 640 x 640 | recall 1,00; 24 cajas falsas en 200 imagenes | Apache-2.0 | ONNX en Hugging Face |
| mdefrance/yolos-tiny-signature-detection (base) | no disponible (YOLOS-tiny) | 640 x 640 | recall 0,91; 132 cajas falsas en 200 imagenes | Apache-2.0 | Hugging Face |
| Otros detectores de firmas (p. ej. basados en Faster R-CNN o YOLO) | no disponible | variable | no disponible | variable | no disponible |

La comparativa se limita al modelo base, ya que la informacion proporcionada no incluye datos de otros detectores de firmas comparables.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: las firmas reales, los escaneos y las marcas de agua presentan mas variabilidad de la cubierta, por lo que el rendimiento en produccion puede degradarse.
- No verifica ni compara firmas: solo detecta su ubicacion; no sirve para autenticacion ni peritaje.
- Las marcas de agua pueden generar aun alguna caja falsa pequena (14 cajas falsas en 20 cartas con marca de agua).
- Riesgo de falsos negativos en firmas muy pequenas (el criterio de evaluacion parte de cajas de 40 px de ancho) o con estilos de escritura no representados en el entrenamiento.
- No procesa texto de forma nativa ni soporta multiples idiomas; cualquier tarea linguistica debe resolverse con otro modelo.
- Licencia Apache-2.0, que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique que se trata de una modificacion del modelo base.
- El modelo base se entreno a su vez sobre tech4humans/signature-detection (Tobacco800, Roboflow signatures-xc8up), cuyas condiciones deben consultarse en su propia model card.
- Para produccion, conviene validar el modelo con documentos reales del dominio objetivo antes de confiar en el, dado el caracter sintetico del conjunto de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuetzliches/veilq-signature-v1
- Modelo base: https://huggingface.co/mdefrance/yolos-tiny-signature-detection
- Proyecto veilq: https://github.com/nuetzliches/veilq
- Dataset usado por el modelo base: https://huggingface.co/datasets/tech4humans/signature-detection
- Fuentes tipograficas (google/fonts): https://github.com/google/fonts
