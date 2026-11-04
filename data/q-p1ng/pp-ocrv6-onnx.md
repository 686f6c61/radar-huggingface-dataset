# Q-P1NG/pp-ocrv6-onnx

## Resumen

`Q-P1NG/pp-ocrv6-onnx` es un repositorio espejo que redistribuye sin modificaciones los modelos ONNX oficiales de PaddleOCR PP-OCRv6 (publicados por PaddlePaddle en junio de 2026), en sus variantes `small` y `tiny`, tanto el detector como el reconocedor de texto. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia byte a byte de los artefactos oficiales, mantenida para que las "packs" de lectura de texto de la aplicacion Q-P1NG descarguen desde una ubicacion estable. El autor verifica la integridad de cada fichero mediante SHA-256.

La relevancia practica del repositorio es la de un espejo de distribucion: ofrece un punto de descarga fijo y verificable de los modelos de OCR de PaddleOCR, con licencia Apache 2.0 y formato ONNX, lo que permite su uso en entornos de inferencia sin dependencia del framework Paddle. No aporta pesos nuevos, ni fine-tuning, ni cambios en la arquitectura respecto a los originales de PaddlePaddle.

El repositorio tiene un tamano practico muy reducido (el conjunto de ficheros ONNX suma aproximadamente 37,6 MB en total entre las cuatro variantes), y esta pensado para tareas de deteccion y reconocimiento de texto en imagenes (pipeline `image-to-text`), no para generacion de lenguaje natural ni para razonamiento multimodal general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de deteccion y reconocimiento de texto de PaddleOCR PP-OCRv6 (detector + reconocedor), exportadas a ONNX |
| Parametros totales | no disponible (no se publica el recuento de parametros en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision para OCR, no procesa secuencias de texto de entrada) |
| Tipos de cuantizacion | no disponible (se distribuyen los ficheros ONNX oficiales; no se documentan variantes cuantizadas en la informacion proporcionada) |
| Idiomas soportados | no disponible (la model card no detalla la lista de idiomas; los reconocedores PP-OCRv6 de PaddleOCR suelen cubrir multiples idiomas, pero no se confirma en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`inference.onnx`) acompanado de `inference.yml` por cada submodelo |

Detalle de ficheros y tamanos:

| Variante | Fichero | Bytes |
|---|---|---|
| small/det | `inference.onnx` | 9.880.512 |
| small/det | `inference.yml` | 885 |
| small/rec | `inference.onnx` | 21.159.378 |
| small/rec | `inference.yml` | 150.579 |
| tiny/det | `inference.onnx` | 1.780.590 |
| tiny/det | `inference.yml` | 883 |
| tiny/rec | `inference.onnx` | 4.462.639 |
| tiny/rec | `inference.yml` | 55.571 |

## Arquitectura y entrenamiento

El modelo subyacente es PP-OCRv6 de PaddleOCR, un sistema de OCR compuesto por dos etapas: un detector de cajas de texto (det) y un reconocedor de secuencias de caracteres (rec). El repositorio distribuye ambas etapas en dos escalas, `small` y `tiny`, exportadas a formato ONNX. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, el tipo de backbone, el mecanismo de atencion ni la composicion del dataset de entrenamiento.

El autor del repositorio indica explicitamente que los ficheros son copias sin modificar de los modelos oficiales de PaddlePaddle, identificando el commit exacto de origen de cada uno (`28fe5895...`, `b8f84f0b...`, `2ba1506c...`, `2612ab37...`). Por tanto, no hay entrenamiento adicional, ni RLHF, ni DPO, ni ajuste alguno por parte de Q-P1NG; la unica aportacion es la verificacion de integridad mediante SHA-256 y la fijacion de una ubicacion de descarga estable.

## Capacidades

- Deteccion de regiones de texto en imagenes (submodelo `det`), en variantes `small` y `tiny`.
- Reconocimiento de texto a partir de las regiones detectadas (submodelo `rec`), en variantes `small` y `tiny`.
- Extraccion de texto de imagenes en un pipeline de dos etapas (deteccion + reconocimiento), propio del flujo de PaddleOCR.
- Ejecucion mediante runtime ONNX, sin necesidad de instalar PaddlePaddle para la inferencia.
- Verificacion de integridad de los ficheros mediante SHA-256, documentada en la model card.
- No se documentan en la informacion proporcionada capacidades de tool calling, razonamiento multi-paso, agentes, vision general, audio ni modo "thinking"; se trata de un sistema de OCR, no de un modelo de lenguaje.

## Casos de uso

- Digitalizacion de documentos escaneados: el pipeline det+rec permite extraer el texto de facturas, contratos o formularios en imagen; la variante `small` ofrece mayor capacidad y la `tiny` menor coste computacional, lo que permite elegir segun el hardware disponible.
- Lectura de texto en aplicaciones moviles o de escritorio: al distribuirse en ONNX y con un peso de pocos megabytes (especialmente `tiny`, con deteccion de ~1,8 MB y reconocimiento de ~4,5 MB), es viable integrarlo en clientes ligeros que ejecutan inferencia en CPU.
- Procesamiento por lotes de imagenes en servidores: el formato ONNX permite desplegar el modelo con runtimes de inferencia estandar (ONNX Runtime) en pipelines de ingesta documental, sin dependencia del ecosistema Paddle.
- Preprocesado para sistemas RAG sobre documentos fisicos: el texto extraido por el OCR puede alimentar un pipeline de indexacion y busqueda semantica, usando la variante `small` cuando la precision de reconocimiento sea prioritaria.
- Verificacion de integridad en despliegues: el uso de los hashes SHA-256 documentados permite validar que los ficheros descargados coinciden con los originales de PaddlePaddle, util en entornos con requisitos de supply chain.
- Extraccion de texto en aplicaciones de accesibilidad: lectura en voz alta de documentos o carteles capturados con camara, donde la variante `tiny` reduce la latencia en dispositivos con recursos limitados.
- Automatizacion de la digitalizacion de tickets y recibos: el pipeline de dos etapas separa la localizacion de lineas de texto y su transcripcion, lo que facilita el postprocesado estructurado de los campos extraidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los ficheros ONNX (del orden de megabytes), la inferencia es viable en CPU y en GPUs de gama baja, pero no se documentan cifras de VRAM.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano de los modelos (el conjunto `tiny` completo ronda los 6,2 MB de pesos ONNX), aunque no se confirma con datos oficiales.
- Opciones de despliegue: al estar en formato ONNX, es desplegable con ONNX Runtime; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Q-P1NG/pp-ocrv6-onnx | OCR (det + rec) | no disponible | no aplica | Apache 2.0 | ONNX | HuggingFace (espejo) |
| PaddlePaddle/PP-OCRv6_small_det_onnx | Detector OCR | no disponible | no aplica | Apache 2.0 | ONNX | HuggingFace (original) |
| PaddlePaddle/PP-OCRv6_small_rec_onnx | Reconocedor OCR | no disponible | no aplica | Apache 2.0 | ONNX | HuggingFace (original) |
| PaddlePaddle/PP-OCRv6_tiny_det_onnx | Detector OCR | no disponible | no aplica | Apache 2.0 | ONNX | HuggingFace (original) |
| PaddlePaddle/PP-OCRv6_tiny_rec_onnx | Reconocedor OCR | no disponible | no aplica | Apache 2.0 | ONNX | HuggingFace (original) |

La comparativa relevante es contra los repositorios originales de PaddlePaddle, que son la fuente de estos mismos ficheros. No se dispone de datos de rendimiento (precision, F1, CER) en la informacion proporcionada para establecer una comparacion cuantitativa con otras soluciones de OCR como Tesseract o EasyOCR.

## Limitaciones y advertencias

- El repositorio no aporta ninguna mejora, ajuste ni correccion respecto a los modelos originales de PaddlePaddle; cualquier limitacion de PP-OCRv6 aplica integramente.
- No se documentan en la informacion disponible los sesgos del modelo, el riesgo de alucinacion en el reconocimiento (errores de transcripcion) ni las limitaciones de contexto o idioma.
- La lista de idiomas soportados no se detalla en la model card; no debe asumirse cobertura multilingue sin verificacion contra la documentacion oficial de PaddleOCR.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribucion y conservacion del aviso de licencia; el fichero `LICENSE` incluido corresponde a la licencia de PaddleOCR en el commit `dab3fe35...`.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-03); se trata de un espejo reciente sin historial de uso publico.
- Al ser un espejo, su mantenimiento depende del autor del repositorio; para produccion conviene contrastar los hashes SHA-256 documentados con los ficheros oficiales de PaddlePaddle antes de desplegar.
- No se documentan requisitos de hardware, latencias ni regimen de cuantizacion; cualquier estimacion de rendimiento en produccion debe validarse empiricamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Q-P1NG/pp-ocrv6-onnx
- Detector small original: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det_onnx
- Reconocedor small original: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec_onnx
- Detector tiny original: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx
- Reconocedor tiny original: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx
- Repositorio PaddleOCR en GitHub: https://github.com/PaddlePaddle/PaddleOCR
