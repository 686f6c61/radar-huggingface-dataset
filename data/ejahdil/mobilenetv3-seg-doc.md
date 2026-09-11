# ejahdil/mobilenetv3-seg-doc

## Resumen

mobilenetv3-seg-doc es un modelo de segmentacion de imagenes especializado en la deteccion del contorno de documentos en fotografias. Dada una foto de una pagina, el modelo predice la region que ocupa el documento y emite una mascara binaria de la que se puede ajustar un cuadrilatero de cuatro puntos, que es la salida que consume el pipeline posterior. Lo desarrolla el usuario ejahdil y se publica en HuggingFace bajo licencia CC BY 4.0, con la libreria PyTorch y la etiqueta de pipeline image-segmentation.

Arquitecturalmente combina un encoder MobileNetV3-Large preentrenado en ImageNet con un decoder tipo U-Net. La entrada es de 384x384 con letterboxing y la salida es un logit por pixel. Se entreno sobre el SmartDoc 2015 Challenge 1 (segmentacion de captura de documentos con smartphone) con recomposicion sintetica de fondos, sumando 19834 fotogramas de entrenamiento repartidos en 24 documentos distintos.

Su relevancia practica es acotada pero clara: resuelve el paso previo de cualquier pipeline de digitalizacion (escaner movil, OCR, correccion de perspectiva) en el que hay que localizar la pagina antes de enderezarla y leerla. El modelo declara un Quad IoU mediano de 0.991 y un 98.5 por ciento de fotogramas correctos, y su tamano reducido (encoder MobileNetV3) lo hace desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MobileNetV3-Large (preentrenado en ImageNet) + decoder U-Net |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | entrada de imagen fija de 384x384 con letterboxing |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | checkpoint PyTorch (segmenter.pt) |
| Tarea | segmentacion de imagen (document-segmentation) |
| Salida | 1 logit por pixel (mascara binaria; cuadrilatero de 4 puntos ajustado) |
| Funcion de perdida | BCE + 0.5 x soft Dice |
| Checkpoint | epoca 6 |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder para segmentacion semantica binaria. El encoder es un MobileNetV3-Large con pesos iniciales de ImageNet, lo que aporta un extractor de caracteristicas ligero y eficiente en computo. El decoder es de tipo U-Net y reconstruye la resolucion espacial hasta la mascara de salida. La imagen de entrada se redimensiona con letterboxing a 384x384 y la red devuelve un unico logit por pixel. El entrenamiento optimiza una combinacion de entropia cruzada binaria (BCE) mas 0.5 veces la perdida soft Dice, una eleccion habitual para mitigar el desbalance entre pixeles de documento y de fondo.

Los datos de entrenamiento provienen del SmartDoc 2015 Challenge 1, un conjunto de video de captura de documentos con movil, sobre el que se aplico una recomposicion sintetica de fondos: la pagina se deforma fuera de su fotograma original y se coloca sobre superficies generadas. El conjunto final contiene 19834 fotogramas de entrenamiento en 24 documentos. La distribucion de fondos incluye paper_match (5051), light_desk (3183), wood_desk (2376), denim (2367), background01 (1521), background02 (1440), background03 (1435), background04 (1016), tile_floor (812) y background05 (633). El sesgo deliberado hacia fondos con el mismo tono de papel que la pagina (paper_match) responde a que ese es el caso que un umbral de brillo global no puede resolver. El autor declara que no se uso imagen de produccion ni de beneficiarios, y que la procedencia queda registrada en el checkpoint.

La evaluacion se hizo sobre documentos retenidos, no sobre fotogramas retenidos, porque SmartDoc es video y fotogramas consecutivos de una misma captura son casi duplicados; una particion a nivel de fotograma daria una metrica enganosa. Por el mismo motivo, la metrica de referencia es el Quad IoU (cuadrilatero ajustado a la mascara), no el IoU de pixel.

## Capacidades

- Segmentacion de contorno de documento: genera una mascara binaria (uint8, valores 0/255) de la region ocupada por la pagina.
- Ajuste de cuadrilatero: la mascara se puede convertir en un poligono de 4 puntos mediante funciones auxiliares del pipeline (detect_document_region).
- Robustez a fondos variados: se entreno con superficies como papel de tono similar, escritorio claro, madera, denim, suelo de baldosas y varios fondos sinteticos.
- Entrada de imagen fija: acepta fotografias de pagina y las procesa a 384x384 con letterboxing.
- Inferencia en CPU o GPU: la funcion pick_device del pipeline selecciona el dispositivo disponible.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de vision, sin componente de lenguaje.
- No tiene capacidades multilingues, de audio ni de thinking mode.

## Casos de uso

- Digitalizacion de documentos con movil: se captura una foto de una hoja y el modelo devuelve la mascara del documento, que el pipeline usa para recortar y enderezar la pagina antes de pasarla a OCR. Es su caso de uso central y para el que fue explicitamente entrenado.
- Preprocesado de OCR a escala: en un flujo por lotes que recibe fotografias de formularios o facturas, el modelo localiza la region del documento para que el motor de OCR no procese el fondo ni elementos ajenos al papel.
- Correccion de perspectiva: a partir del cuadrilatero ajustado a la mascara se puede calcular la homografia que rectifica la pagina a un rectangulo, paso critico para que el OCR lea lineas horizontales.
- Escaneo en aplicaciones moviles: integrable en una app que, en tiempo real o al capturar, detecte el borde de la hoja y guie al usuario en el encuadre.
- Clasificacion y archivado de capturas: filtrar imagenes de entrada segun si contienen un documento detectable, descartando fotos sin pagina o con la pagina fuera de encuadre.
- Control de calidad en pipelines de captura: verificar que la region detectada cumple un area o forma minima y rechazar capturas malas antes de gastar recursos en OCR.
- Automatizacion de back-office: en la recepcion de documentos por movil, usar la mascara para normalizar la imagen y alimentar un sistema de extraccion de datos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Quad IoU (mediana) | 0.991 |
| Fotogramas clasificados como correctos (IoU >= 0.95) | 98.5 por ciento |
| Cuadrantes de error | positive: 197, ignore: 3 |

La evaluacion se realizo sobre documentos retenidos (no fotogramas), segun indica el autor, y la metrica de referencia es el Quad IoU en lugar del IoU de pixel. No se han publicado en la informacion disponible resultados en benchmarks generales (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo de segmentacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por la arquitectura (encoder MobileNetV3-Large mas decoder U-Net ligero, entrada 384x384), es un modelo de muy bajo consumo, del orden de cientos de MB en fp32, aunque el dato exacto no esta publicado.
- GPU recomendadas: no especificadas por el autor. Por su tamano, cabe en cualquier GPU moderna, incluidas las de gama de entrada.
- Cabe en GPU de consumo: si, con margen amplio; es esperable que funcione incluso en CPU para inferencia por lotes moderados (no confirmado con cifras por el autor).
- Opciones de despliegue: el modelo es un checkpoint PyTorch (segmenter.pt) cargado mediante load_segmenter y predict_mask del pipeline imgquality.smartdoc_pipeline. No se documentan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado en la informacion disponible datos de modelos comparables, ni especificaciones de alternativas de segmentacion de documentos (parametros, contexto, rendimiento o licencia). Por tanto:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilenetv3-seg-doc | no disponible | entrada 384x384 | Quad IoU mediano 0.991 | CC BY 4.0 | HuggingFace (ejahdil/mobilenetv3-seg-doc) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo de alucinacion de mascara: en capturas con el documento parcialmente fuera de encuadre o con fondos muy atipicos, el modelo puede generar una mascara sin cuadrilatero ajustable; segun el propio autor, una mascara a la que no se puede ajustar un cuadrilatero es un fallo en el nivel que importa.
- Dominio de entrenamiento acotado: solo 24 documentos de origen en el conjunto de entrenamiento, lo que limita la diversidad de tipos de pagina, iluminacion y superficies reales.
- Fondos sinteticos: buena parte de los fondos de entrenamiento son recomposiciones generadas, no capturas reales, por lo que puede haber una brecha entre el rendimiento declarado y el comportamiento en escenas del mundo real no representadas.
- Evaluacion limitada: las metricas publicadas (Quad IoU 0.991, 98.5 por ciento de fotogramas correctos) no se acompanan de una comparacion con lineas base ni de intervalos de confianza en la informacion disponible.
- Rendimiento por documento, no por fotograma: la metrica puede ocultar mal rendimiento en documentos concretos, ya que un documento con muchas capturas faciles puede dominar la mediana.
- Sin idiomas ni capacidades de lenguaje: no procesa texto ni instrucciones; la utilidad depende de un pipeline externo de OCR y post-procesado.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion. Ademas, el modelo hereda la obligacion de atribucion del dataset SmartDoc 2015 Challenge 1, cuya cita se reproduce en la model card y debe mantenerse.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, y repositorio de 0.0 GB registrados, lo que sugiere una publicacion reciente y sin validacion independiente por parte de la comunidad.
- No se documentan cuantizaciones ni formatos de despliegue alternativos, lo que puede complicar la integracion en entornos que no sean Python/PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ejahdil/mobilenetv3-seg-doc
- Dataset SmartDoc 2015 Challenge 1 (citado en la model card): Jean-Christophe Burie, Joseph Chazalon, Mickael Coustaty, Sebastien Eskenazi, Muhammad Muzzamil Luqman, Maroua Mehri, Nibal Nayef, Jean-Marc Ogier, Sophea Prum y Marcal Rusinol. "ICDAR2015 Competition on Smartphone Document Capture and OCR (SmartDoc)". 13th International Conference on Document Analysis and Recognition (ICDAR), 2015.
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) asociados a este modelo.
