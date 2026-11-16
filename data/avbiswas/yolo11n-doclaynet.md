# avbiswas/yolo11n-doclaynet

## Resumen

YOLO11n DocLayNet es un modelo de deteccion de objetos especializado en analisis de maquetacion de documentos (document layout analysis), desarrollado por el usuario avbiswas y publicado en Hugging Face. Se trata de un fine-tuning del modelo YOLO11n de Ultralytics, preentrenado originalmente sobre COCO, que ha sido reentrenado para localizar once tipos de regiones estructurales en paginas de documentos: Caption, Footnote, Formula, List-item, Page-footer, Page-header, Picture, Section-header, Table, Text y Title.

El modelo resuelve un problema concreto dentro de los pipelines de extraccion de informacion de PDFs: identificar que partes de una pagina corresponden a cada elemento estructural antes de aplicar OCR o extraccion de texto. Con solo 2,6 millones de parametros, alcanza un mAP50-95 de 0,760 sobre un subconjunto de 2.500 paginas del split de test de DocLayNet v1.2, superando ligeramente al modelo publico YOLO11s DocLayNet (0,744) pese a tener aproximadamente 3,5 veces menos parametros.

Su relevancia actual radica en que ofrece un rendimiento competitivo con un coste computacional muy bajo, lo que lo hace adecuado para procesar grandes volumenes de documentos en entornos con recursos limitados, incluidos navegadores mediante la version ONNX complementaria. La licencia AGPL-3.0, heredada de Ultralytics, es un factor determinante para su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector de objetos de una etapa, familia Ultralytics YOLO11) |
| Parametros totales | 2,6 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (existe version ONNX para navegador, sin detalle de cuantizacion) |
| Idiomas soportados | no disponible (modelo de vision; el idioma afecta solo al contenido de los documentos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt); version ONNX disponible en repositorio separado |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11n, un detector de objetos de una sola etapa con backbone y cabeza de deteccion caracteristicos de la familia YOLO11 de Ultralytics. El entrenamiento parte de los pesos preentrenados en COCO (`yolo11n.pt`) y se realiza un fine-tuning sobre el dataset DocLayNet v1.2 completo, que comprende 69.375 paginas e incluye las seis categorias documentales del dataset (informes financieros, manuales, articulos cientificos, leyes y regulaciones, patentes y licitaciones gubernamentales).

La estrategia de entrenamiento incluye un sobremuestreo de las paginas que contienen clases raras (Title, Footnote, Formula), repetidas tres veces, lo que eleva el total a 88.463 entradas por epoca. Se entreno a 1024 px de resolucion, con batch de 64, programacion de learning rate coseno y 22 epocas sobre una unica GPU A100, en aproximadamente 3 horas, conservando la mejor epoca de validacion. La aumentacion de datos se adapto al dominio documental: sin volteos ni rotaciones, con color jitter ligero, mosaic activado y escala de ±25%.

## Capacidades

- Deteccion de once clases de regiones de maquetacion en paginas de documentos: Caption, Footnote, Formula, List-item, Page-footer, Page-header, Picture, Section-header, Table, Text y Title.
- Localizacion de bounding boxes con coordenadas y puntuacion de confianza por region.
- Procesamiento de imagenes de paginas renderizadas a aproximadamente 144 DPI, con inferencia a `imgsz=1024`.
- Funcionamiento sobre paginas de PDF convertidas previamente a imagen (por ejemplo, con PyMuPDF).
- Version ONNX para ejecucion en navegador o entornos sin PyTorch.
- No realiza lectura de orden de lectura ni extraccion de texto: solo localiza regiones.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas; es exclusivamente un modelo de vision para deteccion.

## Casos de uso

- Digitalizacion masiva de PDFs: el modelo identifica las regiones estructurales de cada pagina y permite enrutar cada tipo de bloque (texto, tabla, figura) a la herramienta de OCR o extraccion adecuada, gracias a su bajo coste computacional.
- Extraccion de tablas en informes financieros: al detectar la clase Table con mAP50-95 de 0,789, se pueden recortar las regiones tabulares y enviarlas a un parser especializado, reduciendo falsos positivos en el resto de la pagina.
- Segmentacion de articulos cientificos: la deteccion de Title, Section-header, Caption y Formula (0,802, 0,708, 0,785 y 0,746 respectivamente) permite reconstruir la estructura de papers para indexacion academica o resumenes automatizados.
- Procesamiento de patentes y normativa: entrenado sobre las categorias del dataset DocLayNet, que incluye patentes y legislacion, resulta adecuado para pipelines de analisis de documentos legales y tecnicos.
- Procesamiento en el navegador o en el borde: la version ONNX permite ejecutar la deteccion de maquetacion en el cliente sin infraestructura de servidor, util para visores de PDF con analisis estructural en tiempo real.
- Preprocesamiento en pipelines RAG sobre documentos: la deteccion de Page-header y Page-footer (0,761 y 0,699) permite eliminar encabezados y pies repetidos antes de trocear el texto, mejorando la calidad de los fragmentos indexados.
- Automatizacion de accesibilidad documental: la identificacion de figuras, tablas y formulas facilita la generacion de descripciones alternativas y etiquetado estructural de PDFs para lectores de pantalla.

## Benchmarks y rendimiento

Resultados sobre el subconjunto de test de DocLayNet v1.2 (2.500 paginas, shards 0, 2 y 4), a 1024 px:

| Clase | Este modelo (YOLO11n) | hantian/yolo-doclaynet (YOLO11s) |
|---|---|---|
| Todas (mAP50-95) | 0,760 | 0,744 |
| Todas (mAP50) | 0,903 | 0,906 |
| Caption | 0,785 | 0,793 |
| Footnote | 0,642 | 0,620 |
| Formula | 0,746 | 0,714 |
| List-item | 0,819 | 0,816 |
| Page-footer | 0,699 | 0,569 |
| Page-header | 0,761 | 0,698 |
| Picture | 0,758 | 0,787 |
| Section-header | 0,708 | 0,711 |
| Table | 0,789 | 0,819 |
| Text | 0,851 | 0,852 |
| Title | 0,802 | 0,803 |

Ambos modelos se evaluaron con el mismo script sobre las mismas paginas, procedentes del split de test oficial de DocLayNet, no visto en entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB a 1-2 GB con frames de 1024 px en FP32; no se dispone de cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU moderna es suficiente; una A100 se uso para el entrenamiento (22 epocas en unas 3 horas), pero la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.), e incluso en CPU para volumenes moderados.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime mediante el repositorio `avbiswas/yolo11n-doclaynet-onnx`, y exportaciones adicionales que soporte Ultralytics (no detalladas en la informacion disponible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el tamano de 2,6 millones de parametros sugiere inferencia muy rapida.

## Comparativa con modelos similares

| Modelo | Parametros | mAP50-95 (DocLayNet test) | Licencia | Disponibilidad |
|---|---|---|---|---|
| avbiswas/yolo11n-doclaynet | 2,6 M | 0,760 | AGPL-3.0 | Hugging Face (PyTorch y ONNX) |
| hantian/yolo-doclaynet (YOLO11s) | ~3,5× mas | 0,744 | no disponible en la informacion | Hugging Face |
| YOLO11n base (COCO) | 2,6 M | no aplica (no entrenado en DocLayNet) | AGPL-3.0 | Ultralytics |

La comparacion directa disponible es con el modelo YOLO11s de hantian: el modelo de avbiswas obtiene mejor mAP global con muchas menos parametros, con ventajas claras en Page-footer, Page-header y Formula, y desventajas en Picture y Table.

## Limitaciones y advertencias

- Distribucion de dominio limitada: entrenado sobre las categorias de DocLayNet (informes financieros, manuales, articulos cientificos, leyes, patentes y licitaciones); presentaciones, formularios, recibos y escritura manuscrita quedan fuera de distribucion.
- Picture y Table son sus clases mas debiles en comparacion con el modelo YOLO11s mas grande.
- Solo detecta regiones: no realiza lectura de orden ni extraccion de texto, que deben abordarse en pasos separados del pipeline.
- Licencia AGPL-3.0 heredada de Ultralytics: el uso comercial en servicios en red puede obligar a liberar el codigo del servicio; conviene revisar las condiciones antes de desplegarlo en produccion.
- Riesgo de falsos positivos y negativos en paginas con maquetaciones atipicas o baja calidad de renderizado; se recomienda validar con un umbral de confianza adecuado (el ejemplo usa `conf=0.25`).
- Sin datos publicados sobre sesgos especificos, rendimiento multilingue ni comportamiento con documentos escaneados de baja calidad.
- El repositorio no incluye informacion sobre cuantizaciones ni metricas de latencia, lo que limita la planificacion precisa de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avbiswas/yolo11n-doclaynet
- Version ONNX para navegador: https://huggingface.co/avbiswas/yolo11n-doclaynet-onnx
- Modelo comparable YOLO11s DocLayNet: https://huggingface.co/hantian/yolo-doclaynet
- Dataset DocLayNet (IBM Research): https://github.com/DS4SD/DocLayNet
- Dataset en Hugging Face: https://huggingface.co/datasets/docling-project/DocLayNet-v1.2
- Ultralytics YOLO11: https://github.com/ultralytics/ultralytics
