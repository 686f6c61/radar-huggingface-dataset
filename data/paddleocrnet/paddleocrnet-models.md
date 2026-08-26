# PaddleOcrNet/PaddleOcrNet-models

## Resumen

PaddleOcrNet-models es un repositorio de modelos de OCR (reconocimiento óptico de caracteres) publicados por el usuario PaddleOcrNet en Hugging Face. Forma parte del proyecto PaddleOcrNet, una implementación nativa en .NET del pipeline completo de PaddleOCR que se ejecuta sobre ONNX Runtime, sin necesidad de Python ni de la librería nativa PaddlePaddle. El repositorio contiene modelos convertidos a formato ONNX para tareas de detección y reconocimiento de texto, análisis de diseño de página (layout), tablas y fórmulas.

El modelo es relevante porque permite integrar capacidades de OCR en aplicaciones .NET (C#, F#, etc.) de forma ligera y multiplataforma, aprovechando el ecosistema ONNX Runtime. Según la documentación del proyecto, soporta más de 80 idiomas con detección automática de escritura, lo que facilita el procesamiento de documentos multilingües. El repositorio tiene un tamaño de 1,6 GB e incluye al menos los modelos PP-DocLayoutV3 (layout) y SLANet_plus (tablas), aunque no se proporcionan detalles sobre la arquitectura interna de cada uno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos ONNX convertidos desde PaddleOCR) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, es un modelo de visión/OCR) |
| Tipos de cuantizacion | no disponible (se asume FP32 o FP16, no confirmado) |
| Idiomas soportados | 80+ (segun documentacion del proyecto PaddleOcrNet) |
| Licencia | apache-2.0-and-mit (declarada como "other" en la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura de los modelos incluidos en este repositorio. Por el contexto del proyecto PaddleOcrNet, se trata de modelos originalmente entrenados dentro del ecosistema PaddleOCR (que utiliza arquitecturas como PP-OCRv4 para deteccion y reconocimiento, y PP-DocLayout para analisis de layout) y posteriormente exportados a formato ONNX para su uso en .NET. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens o el proceso de optimizacion (RLHF, DPO, etc.). La unica innovacion tecnica destacable es la conversion a ONNX, que permite ejecutar estos modelos sin dependencias de PaddlePaddle.

## Capacidades

- Deteccion y reconocimiento de texto en imagenes, con soporte para mas de 80 idiomas.
- Deteccion automatica del idioma: el usuario puede pasar `OcrLanguage.Auto` y el sistema identifica la escritura y carga el modelo adecuado.
- Analisis de diseño de pagina (layout) mediante el modelo PP-DocLayoutV3.
- Reconocimiento de estructuras de tablas con el modelo SLANet_plus.
- Reconocimiento de formulas matematicas (segun la descripcion del proyecto en GitHub).
- Integracion nativa en .NET a traves de ONNX Runtime, sin necesidad de Python.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente de vision/OCR.

## Casos de uso

- Digitalizacion de documentos en aplicaciones empresariales .NET: integrar OCR en un sistema de gestion documental escrito en C# para extraer texto de escaneos y PDFs, aprovechando la ejecucion local con ONNX Runtime.
- Extraccion de datos de tablas en facturas o formularios: usar SLANet_plus para identificar celdas y estructuras tabulares, y luego combinar con el reconocimiento de texto para poblar bases de datos.
- Procesamiento de documentos multilingues: con la deteccion automatica de idioma, una aplicacion puede procesar documentos mixtos (por ejemplo, contratos con clausulas en varios idiomas) sin configuracion manual.
- Analisis de layout en imagenes de paginas: PP-DocLayoutV3 permite clasificar regiones (titulos, parrafos, imagenes, tablas) para reordenar o resumir documentos.
- OCR en aplicaciones de escritorio o servicios Windows: al ser .NET nativo, se puede empaquetar en un ejecutable sin requerir un entorno Python en el servidor.
- Reconocimiento de formulas en documentos cientificos o educativos: extraer expresiones matematicas para convertirlas a formato LaTeX u otro estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de precision, velocidad o comparaciones con otros modelos OCR en el repositorio ni en la documentacion accesible.

## Requisitos de hardware

- El repositorio completo ocupa 1,6 GB en disco, pero los modelos se cargan individualmente segun la tarea.
- Al ser modelos ONNX, pueden ejecutarse en CPU o GPU mediante ONNX Runtime. No se especifican requisitos minimos de VRAM.
- Para tareas de OCR en lotes, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior), aunque en CPU tambien es viable para volumenes moderados.
- Opciones de despliegue: integracion en aplicaciones .NET (ASP.NET Core, servicios de Windows, aplicaciones de consola) usando el paquete PaddleOcrNet de NuGet, o directamente con ONNX Runtime en cualquier lenguaje que lo soporte.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo forma parte del ecosistema PaddleOCR, que compite con alternativas como Tesseract (OCR tradicional) o EasyOCR, pero no hay datos publicados de rendimiento relativo en este repositorio. Se recomienda consultar la documentacion oficial de PaddleOCR para comparativas generales.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos o limitaciones eticas especificas de estos modelos.
- Al ser modelos convertidos a ONNX, puede haber una ligera perdida de precision respecto a los originales de PaddlePaddle, aunque no se ha cuantificado.
- La licencia declarada es "apache-2.0-and-mit", pero la model card indica "other" y enlaza a un archivo LICENSE dentro del repositorio. Es imprescindible revisar ese archivo antes de un uso comercial.
- No se garantiza la exactitud del OCR en imagenes de baja calidad, textos manuscritos o fuentes muy decorativas.
- El repositorio tiene pocas descargas (0) y un solo like, lo que sugiere que es un proyecto reciente o poco validado por la comunidad.
- No se proporcionan instrucciones de uso ni ejemplos en la model card; la documentacion principal esta en el repositorio de GitHub del proyecto PaddleOcrNet.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PaddleOcrNet/PaddleOcrNet-models
- Proyecto PaddleOcrNet en GitHub: https://github.com/FarhanLodi/PaddleOcrNet
- Documentacion de modelos PaddleOCR (referencia): https://www.paddleocr.ai/v2.10.0/en/ppocr/model_list.html
