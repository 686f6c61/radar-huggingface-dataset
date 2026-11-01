# augustaklug/pp-ocrv6-tiny-onnx

## Resumen

PP-OCRv6 tiny en ONNX es un paquete de modelos de reconocimiento óptico de caracteres (OCR) derivado del pipeline PP-OCRv6 tiny de PaddleOCR, publicado por el usuario augustaklug como repositorio de apoyo para la extensión Epryx (automatización de procesos judiciales en el sistema eproc brasileño). No se trata de un modelo entrenado por el autor: los pesos son los oficiales de PaddlePaddle, y el trabajo propio consiste en la conversión a float16 y en la modificación de la salida del modelo de reconocimiento para incluir ArgMax y ReduceMax.

El repositorio agrupa tres componentes: un modelo de detección de texto, un modelo de reconocimiento de texto y un clasificador de orientación de página (PP-LCNet_x1_0_doc_ori) que corrige giros de 0, 90, 180 y 270 grados antes de la detección. Todos se distribuyen en formato ONNX, con variantes en fp32 y fp16, y están pensados para ejecutarse en el navegador mediante ONNX Runtime Web, incluyendo aceleración por WebGPU.

La relevancia del paquete es práctica: ofrece un conjunto de modelos OCR ligeros (el mayor de los fp32 ronda los 6,8 MB) con checksums verificables, listos para descarga y ejecución local sin depender de servicios en la nube. Está orientado a los idiomas portugués, inglés y chino, y se publica bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de tres etapas: detección de texto (PP-OCRv6 tiny det), reconocimiento de texto (PP-OCRv6 tiny rec) y clasificación de orientación de documento (PP-LCNet_x1_0_doc_ori); grafos ONNX |
| Parametros totales | No disponible (no se publica el recuento de parámetros; los tamaños de fichero ONNX van de 0,9 MB a 6,8 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión); el reconocimiento emite secuencias de longitud T con vocabulario de 6.906 clases |
| Tipos de cuantizacion | fp32 y fp16 (no se publican variantes int8: según el autor, en WebGPU se bloquean y en CPU no aceleran) |
| Idiomas soportados | Portugués (pt), inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ficheros `.onnx`), más `dict.txt` y ficheros `config.json` de pre/post-procesamiento |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo: reproduce los pesos oficiales de PaddleOCR. La etapa de detección localiza regiones de texto; la de reconocimiento aplica decodificación CTC gulosa sobre una salida de forma `[N, T, 6906]`, donde las clases son `[blank] + dict + [espacio]` con un diccionario de 6.904 caracteres; y la etapa `doc_ori` clasifica la orientación de la página en 0, 90, 180 o 270 grados para corregirla antes de la detección.

Las modificaciones propias son dos. Primero, la conversión a float16 mediante `onnxconverter_common.float16.convert_float_to_float16` con `keep_io_types=True`, manteniendo entradas y salidas en float32 y bloqueando en float32 los seis nodos `Resize` de la detección con `Cast` alrededor. Segundo, en las variantes `rec/*-argmax.onnx`, la salida `[N, T, 6906]` se sustituye por dos salidas `indices` (ArgMax sobre el eje 2) y `probabilidades` (ReduceMax sobre el eje 2), ambas de forma `[N, T]`; la decodificación CTC resultante se verificó posición a posición contra la salida completa. El objetivo es evitar leer de vuelta 6.906 clases por paso en GPU. Los tres ficheros fp32 son byte a byte idénticos a los originales, con sha256 coincidente con el `lfs.oid` de origen.

## Capacidades

- Detección de regiones de texto en imágenes de documentos.
- Reconocimiento de texto con vocabulario de 6.904 caracteres más blank y espacio (6.906 clases de salida).
- Corrección de orientación de página en incrementos de 90 grados (0, 90, 180, 270).
- Ejecución local en navegador mediante ONNX Runtime Web, con rutas de CPU (fp32) y GPU vía WebGPU (fp16).
- Procesamiento por lotes en la etapa de reconocimiento (el autor cita lotes de 16 líneas).
- Soporte multilingüe limitado a portugués, inglés y chino.
- No dispone de tool calling, razonamiento multi-paso ni modo thinking: es un pipeline OCR, no un modelo generativo de propósito general.

## Casos de uso

- Digitalización de expedientes judiciales: la extensión Epryx descarga estos modelos en la primera lectura y ejecuta el OCR localmente sobre documentos del sistema eproc, evitando enviar contenido sensible a servicios externos.
- Extracción de texto en aplicaciones web sin backend: al ejecutarse con ONNX Runtime Web, el OCR puede correr íntegramente en el navegador del usuario, lo que reduce costes de infraestructura y latencia de red.
- Preprocesamiento de documentos escaneados: la etapa `doc_ori` corrige páginas giradas antes de la detección, lo que mejora la tasa de acierto en escaneos con orientación irregular.
- Indexación y búsqueda sobre archivos PDF o imágenes: el texto reconocido puede alimentar índices de búsqueda o sistemas de recuperación documental.
- Automatización de flujos administrativos: integración en pipelines que necesitan leer formularios, sellos o encabezados en portugués, inglés o chino.
- Despliegue en entornos con conectividad restringida: el autor menciona un espejo propio para cuando Hugging Face no es accesible, lo que facilita su uso en redes corporativas o judiciales cerradas.
- Verificación de integridad en producción: los checksums sha256 publicados permiten validar cada fichero antes de cargarlo en `InferenceSession.create`.

## Benchmarks y rendimiento

El autor publica una única medición sobre un corpus sintético de 115 páginas, en su máquina de desarrollo con ONNX Runtime Web 1.22:

| Configuración | CER |
|---|---|
| fp32 en CPU | 2,2 % |
| fp16 en GPU (WebGPU), lote de 16 líneas en reconocimiento | 2,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros motores OCR.

## Requisitos de hardware

- VRAM estimada: muy baja; los ficheros ONNX individuales pesan entre 0,9 MB (det fp16) y 6,8 MB (doc_ori fp32), por lo que el conjunto completo cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican modelos concretos; el autor valida la ruta fp16 sobre WebGPU en su máquina de desarrollo. Cualquier GPU con soporte de WebGPU en el navegador es candidata.
- GPU de consumo: sí, cabe en cualquier GPU integrada o dedicada moderna; también funciona en CPU con las variantes fp32.
- Opciones de despliegue: ONNX Runtime Web (CPU y WebGPU). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; solo se publica el CER de las dos configuraciones citadas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| PP-OCRv6 tiny ONNX (este repo) | Pipeline OCR det + rec + doc_ori | pt, en, zh | ONNX fp32/fp16 | Apache-2.0 | Variantes fp16 y ArgMax embebido para WebGPU; checksums publicados |
| PaddleOCR PP-OCRv6 tiny (original) | Pipeline OCR | pt, en, zh | Paddle / ONNX | Apache-2.0 | Pesos de origen sin conversión fp16 ni ArgMax embebido |
| Tesseract | Motor OCR | Amplio (según modelos) | Propio | Apache-2.0 | No se dispone de datos comparativos en la información proporcionada |
| EasyOCR | Pipeline OCR | Amplio | PyTorch | Apache-2.0 | No se dispone de datos comparativos en la información proporcionada |

No se han publicado comparaciones de rendimiento frente a estas alternativas en la información disponible.

## Limitaciones y advertencias

- El repositorio no es oficial de PaddlePaddle y no cuenta con su aval; es un empaquetado de terceros.
- La cobertura lingüística se limita a portugués, inglés y chino; otros idiomas no están soportados por el diccionario de 6.904 caracteres.
- El CER medido (2,2 % fp32, 2,5 % fp16) procede de un corpus sintético de 115 páginas y de una única máquina; no debe extrapolarse sin validación propia.
- Las variantes int8 no se publican porque, según el autor, se bloquean en WebGPU y no aceleran en CPU.
- La ruta fp16 depende de WebGPU; en navegadores o entornos sin soporte hay que usar las variantes fp32 en CPU.
- No se documentan sesgos específicos ni tasas de alucinación (no es un modelo generativo), pero el OCR puede producir errores de reconocimiento en imágenes de baja calidad, tipografías atípicas o texto manuscrito.
- La licencia Apache-2.0 permite uso comercial; debe conservarse la atribución a PaddlePaddle incluida en `LICENCA.txt`.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y su tamaño reportado es 0.0 GB pese a contener ficheros de varios MB; conviene verificar los checksums antes de usarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/augustaklug/pp-ocrv6-tiny-onnx
- Extensión Epryx: https://github.com/MagnumMF/Epryx
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Modelo de detección de origen: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx
- Modelo de reconocimiento de origen: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx
- Modelo de orientación de origen: https://huggingface.co/PaddlePaddle/PP-LCNet_x1_0_doc_ori_onnx
