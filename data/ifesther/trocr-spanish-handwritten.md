# ifesther/trocr-spanish-handwritten

## Resumen

TrOCR Spanish Handwritten es un modelo de reconocimiento optico de caracteres (OCR) especificamente entrenado para texto manuscrito en espanol. Se basa en la arquitectura TrOCR, compuesta por un codificador visual (ViT) y un decodificador de texto, lo que permite un enfoque de imagen a texto sin etapas intermedias de segmentacion o procesamiento de caracteres. El modelo fue desarrollado por el usuario `ifesther` y publicado en HuggingFace bajo licencia MIT, con un total de 333,9 millones de parametros en formato safetensors.

La relevancia de este modelo radica en su especializacion linguistica y tipografica: el OCR en espanol manuscrito es un nicho donde los modelos genericos multilingues suelen perder precision. Aunque la model card publicada no incluye detalles de entrenamiento ni evaluaciones, el trabajo de fine-tuning sobre TrOCR base para español (documentado en investigaciones como la de Qantev) demuestra que esta adaptacion mejora notablemente el reconocimiento frente a herramientas genericas como EasyOCR o la API de Microsoft Azure. Este modelo esta pensado para aplicaciones que necesitan digitalizar documentos escritos a mano en castelano de forma local y sin dependencias externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) como encoder + Transformer como decoder (TrOCR) |
| Parametros totales | 333.921.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en FP32/FP16 via safetensors) |
| Idiomas soportados | espanol (especializado en texto manuscrito) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un vision-encoder-decoder (VED) que combina un encoder de vision preentrenado (ViT) con un decoder de texto basado en Transformer. Esta estructura no requiere un modelo externo de deteccion de texto ni una etapa de segmentacion de caracteres: el codificador procesa la imagen completa y el decodificador genera la secuencia de tokens directamente. El intermedio visual se proyecta como embeddings de posicion y se alimenta al decoder mediante cross-attention.

No se han publicado en la model card los datos especificos de entrenamiento: numero de tokens, composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Sin embargo, es un fine-tuning de TrOCR base, que originalmente fue entrenado con IAM, COCO-Text y otros corpus OCR. Para el caso hispano, existen trabajos comparables como el realizado por Qantev, que genero 2 millones de imagenes sinteticas y entreno durante 2 epocas en una GPU A100 de 80 GB, partiendo de los checkpoints de la etapa 1 en ingles. No se puede confirmar que este modelo concreto use ese procedimiento.

## Capacidades

- Reconocimiento de texto manuscrito en español: es su funcion principal, enfocada a escritura a mano, no a tipografia impresa.
- Generacion de texto autoregresiva: el decoder produce la transcripcion token a token, lo que permite manejar secuencias variables de longitud.
- Entrada multimodal: acepta imagenes como entrada, gracias al encoder ViT.
- No soporta function calling ni tool calling.
- No dispone de capacidades de razonamiento logico, agentes ni multi-step reasoning; es un modelo puramente transductivo.
- No soporta vision multiclase ni deteccion de objetos; solo OCR.
- No se han documentado capacidades de audio ni modo "thinking".
- Multilinguismo: el modelo esta limitado al español; no ha sido evaluado para otros idiomas.

## Casos de uso

- Digitalizacion de archivos historicos manuscritos: bibliotecas y archivos pueden procesar cartas, diarios y documentos legales antiguos escritos a mano en español. El modelo se integraria en un pipeline de OCR donde cada imagen se pasa al modelo y la salida se guarda como texto buscable o XML con coordenadas si se combina con un modelo de bounding boxes.
- Transcripcion de notas clinicas manuscritas: en entornos hospitalarios, los facultativos aun rellenan historiales y recetas a mano. El modelo puede convertir esas notas en texto digital que se introduce en el sistema de historia clinica electronica, reduciendo la introduccion manual posterior.
- Procesamiento de formularios administrativos rellenados a mano: en la administracion publica y en empresas de seguros o banca, los formularios incluyen campos manuscritos (firmas, numeros, nombres). El modelo permite automatizar la extraccion de esos campos mediante OCR selectivo sobre las regiones correspondientes.
- Automatizacion de correspondencia postal: empresas de logistica que gestionan cartas y paqueteria podrian usar este modelo para leer direcciones y remitentes escritos a mano en sobres, integrándose en el sistema de clasificacion automatica.
- Digitalizacion de notas escolares y examenes manuscritos: centros educativos que conservan correcciones y pruebas en papel pueden transcribirlas a formato digital, facilitando la creacion de bases de datos de evaluaciones y el analisis posterior.
- Accesibilidad para personas con discapacidad visual: una aplicacion de movil podria capturar una pagina de un cuaderno o libro escrito a mano y convertirla en voz mediante este modelo + sintesis de texto a voz, o simplemente mostrar el texto en braille.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni metricas de OCR como CER o WER en la model card ni en los resultados de la busqueda web. Se recomienda evaluar el modelo en un conjunto de prueba propio, comparando con modelos como EasyOCR o TrOCR base en ingles, en terminos de tasa de error de caracteres (CER) y tasa de error de palabras (WER).

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,4 GB en FP16 (333,9 M de parametros), por lo que puede ejecutarse en cualquier GPU con al menos 2 GB de memoria. Con cuantizacion INT8 o INT4 se reducira el consumo, aunque no se han publicado pesos cuantizados en el repo.
- GPU recomendadas: RTX 3050 o superior, o cualquier tarjeta con 4 GB de VRAM; en entornos de produccion, una A100 o H100 es suficiente para procesar lotes grandes (por ejemplo, varios cientos de paginas por minuto).
- Si cabe en consumer GPU: si, sin problemas. Es un modelo pequeno que corre en tarjetas como una RTX 3060 o incluso en CPU mediante la libreria Transformers con precision reducida.
- Opciones de despliegue: se puede servir con Hugging Face Transformers (pipeline de image-to-text), o en produccion con Text Generation Inference (TGI) o vLLM si se adapta a una API compatible. Tambien puede exportarse a ONNX o TorchScript para servidores sin Python.
- Latencia y throughput estimados: no disponibles. No se publicaron mediciones. Como referencia, en una RTX 4090 la inferencia de una unica imagen de 256x256 suele tardar entre 50 y 200 ms, pero este dato no es oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrOCR Spanish Handwritten (este) | 333,9 M | no disponible | espanol manuscrito | MIT | HuggingFace |
| TrOCR Base | 334 M | no disponible | ingles (etapa 1) | MIT | HuggingFace |
| EasyOCR | ~100 M (variable) | no disponible | 80+ idiomas incl. espanol | Apache 2.0 | Open source |
| Azure OCR API | no disponible | no disponible | 80+ idiomas | Comercial | API cloud |

El modelo presenta una ventaja clara frente a TrOCR Base por su adaptacion al español manuscrito, que no esta cubierto por el modelo original. Frente a EasyOCR, un modelo generico, la diferencia es menor, aunque los estudios de Qantev indican que el TrOCR fine-tuneado supera a EasyOCR en escritura a mano española. Azure OCR es una alternativa comercial que no es open source y requiere conexion a internet.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado; se presupone que el modelo hereda sesgos del dataset de entrenamiento, que en este caso es un conjunto de imagenes sinteticas. La escritura de personas con disgrafia o con estilos muy particulares puede ser tratada de manera inconsistente.
- Riesgo de alucinacion: en textos manuscritos ambiguos, el modelo puede "inventar" caracteres o palabras que no estan en la imagen, un comportamiento habitual en decodificadores autoregresivos.
- Limitaciones de contexto: al ser un modelo de OCR, no mantiene contexto conversacional ni recuerda documentos anteriores. Solo procesa la imagen de entrada.
- Limitaciones de idioma: el modelo esta entrenado exclusivamente para español; si se usa con otros idiomas, la precision caera drásticamente.
- Restricciones de licencia: licencia MIT permite uso comercial y redistribucion, pero no se incluyen datos de entrenamiento ni certificaciones de la fuente. El autor no ofrece garantias.
- Caveat para produccion: no hay informacion sobre el rendimiento en documentos con ruido, rotaciones o diferentes resoluciones. Se recomienda un preprocesado de imagen (binarizacion, desenfoque, normalizacion de tamano) antes de la inferencia.

## Enlaces

- HuggingFace: https://huggingface.co/ifesther/trocr-spanish-handwritten
- Documentacion de TrOCR en Transformers: https://huggingface.co/docs/transformers/model_doc/trocr
- Articulo sobre TrOCR en español (Qantev): https://www.qantev.com/post/spanish-trocr-leveraging-transfer-learning-for-language-adaptation
- Modelo TrOCR base español (imprenta): https://model.aibase.com/models/details/1915694430700593153
