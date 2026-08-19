# Neetu143/idfc-genai-extractor-models

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo Qwen2.5-VL-7B-Instruct, junto con un checkpoint YOLO entrenado para la detección de firmas y sellos. El conjunto se utiliza en el espacio IDFC GenAI extractor, orientado a la extracción de información de documentos. El adaptador LoRA permite ajustar el modelo base de visión-lenguaje para tareas específicas de procesamiento de documentos, como la lectura de campos en formularios, facturas o documentos bancarios, mientras que el detector YOLO identifica regiones de firma o sello dentro de las imágenes.

El modelo base Qwen2.5-VL-7B-Instruct es un modelo multimodal de 7 mil millones de parámetros, capaz de procesar texto e imágenes y generar respuestas en lenguaje natural. Al ser un adaptador LoRA, el repositorio no contiene los pesos completos del modelo, sino una actualización de bajo rango que se combina con el modelo base para obtener el comportamiento especializado. El tamaño del repositorio es de 0,3 GB, lo que indica que el adaptador es ligero y fácil de integrar en pipelines existentes.

La relevancia de este modelo radica en su aplicación práctica en el ámbito de la automatización de documentos, especialmente en el sector financiero (IDFC es un banco indio). La combinación de un modelo de visión-lenguaje con un detector de firmas/sellos permite extraer datos estructurados de documentos escaneados o fotografiados, reduciendo la intervención manual y acelerando procesos como la verificación de identidad o la validación de formularios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (modelo base transformer multimodal) |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido de parametros, no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 32.768 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el modelo base Qwen2.5-VL soporta multiples idiomas, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) y checkpoint YOLO (formato no especificado) |

## Arquitectura y entrenamiento

El adaptador LoRA se basa en Qwen2.5-VL-7B-Instruct, un modelo de la familia Qwen2.5-VL que combina un codificador de vision (ViT) con un decodificador transformer autoregresivo. El modelo base fue preentrenado con una gran cantidad de datos de texto e imagenes, y posteriormente ajustado con instrucciones para tareas de vision-lenguaje. El adaptador LoRA anade matrices de bajo rango a las capas atencionales, permitiendo un fine-tuning eficiente sin modificar todos los pesos del modelo.

El entrenamiento del adaptador no esta documentado en la informacion disponible. Se desconoce el numero de tokens de entrenamiento, la composicion del dataset o si se utilizaron tecnicas como RLHF o DPO. El checkpoint YOLO, por su parte, fue entrenado para detectar firmas y sellos en imagenes de documentos, probablemente con un dataset anotado de documentos financieros. No se proporcionan detalles sobre el numero de epocas, la arquitectura exacta de YOLO (version) ni los hiperparametros utilizados.

## Capacidades

- Extraccion de informacion de documentos: el modelo puede leer texto e imagenes y generar respuestas estructuradas, por ejemplo, extrayendo campos como nombre, fecha, numero de cuenta o importe.
- Deteccion de firmas y sellos: el checkpoint YOLO identifica regiones de firma o sello en una imagen, lo que permite localizar y posiblemente recortar esas areas para su posterior analisis.
- Comprension multimodal: al basarse en Qwen2.5-VL, el modelo puede razonar sobre imagenes y texto, respondiendo preguntas sobre el contenido visual.
- Generacion de texto en lenguaje natural: puede producir descripciones, resumenes o respuestas a partir de la informacion extraida.
- Integracion con pipelines de procesamiento de documentos: el adaptador LoRA se puede cargar con la libreria PEFT y combinar con el modelo base para su uso en aplicaciones de automatizacion.

## Casos de uso

- Automatizacion de la extraccion de datos en formularios bancarios: el modelo puede leer formularios escaneados, extraer campos como nombre, DNI, direccion y numero de cuenta, y devolverlos en formato JSON para su integracion en sistemas de gestion.
- Verificacion de firmas en contratos: el detector YOLO localiza la firma en un documento y el modelo de vision-lenguaje puede analizar si la firma esta presente o si coincide con una referencia, ayudando en procesos de validacion.
- Procesamiento de facturas y recibos: el modelo extrae importes, fechas, proveedores y otros datos relevantes de facturas, reduciendo la entrada manual de datos en sistemas contables.
- Digitalizacion de expedientes: al combinar OCR (a traves del modelo base) con deteccion de sellos, se pueden indexar documentos digitalizados y clasificarlos segun su contenido.
- Atencion al cliente en banca: el modelo puede interpretar documentos enviados por clientes (por ejemplo, justificantes de pago) y extraer la informacion necesaria para resolver consultas o reclamaciones.
- Auditoria y cumplimiento: la extraccion automatica de datos de documentos ayuda a verificar que los formularios esten completos y que las firmas esten presentes, facilitando auditorias internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador. El rendimiento especifico en tareas de extraccion de documentos tampoco esta documentado.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,3 GB) y se puede cargar sobre el modelo base Qwen2.5-VL-7B-Instruct, que requiere aproximadamente 16 GB de VRAM en precision FP16 para inferencia.
- Para ejecutar el modelo base con el adaptador, se recomienda una GPU con al menos 16 GB de VRAM, como una RTX 4090, A100 (40 GB) o H100.
- El checkpoint YOLO es independiente y puede ejecutarse en CPU o GPU con requisitos modestos (menos de 1 GB de VRAM).
- Opciones de despliegue: se puede usar con la libreria PEFT y transformers para cargar el adaptador, o con vLLM si se quiere servir el modelo base con el adaptador. Para el detector YOLO, se puede usar ultralytics u otras librerias de deteccion de objetos.
- La latencia dependera del hardware y del tamaño de las imagenes. En una GPU moderna, la inferencia del modelo base con el adaptador puede tardar entre 1 y 3 segundos por imagen, mientras que la deteccion YOLO es tipicamente mas rapida (menos de 100 ms).

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con otros modelos de extraccion de documentos. Al ser un adaptador especifico sobre Qwen2.5-VL, se puede comparar con otros fine-tunings de la misma familia, pero no hay datos publicos de rendimiento. Alternativas generales en el dominio de extraccion de documentos incluyen modelos como LayoutLMv3, Donut o PaddleOCR, pero no se pueden establecer comparaciones cuantitativas sin datos.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador ni del checkpoint YOLO, lo que puede limitar su uso comercial. Se debe contactar con el autor para aclarar los terminos.
- El modelo esta especializado en un dominio concreto (documentos financieros, probablemente del contexto indio) y puede no generalizar bien a otros tipos de documentos o idiomas.
- No hay informacion sobre sesgos o alucinaciones. Como cualquier modelo de lenguaje, puede generar respuestas incorrectas si la imagen es ambigua o de baja calidad.
- El adaptador LoRA no incluye los pesos completos del modelo base, por lo que es necesario descargar Qwen2.5-VL-7B-Instruct por separado, lo que aumenta los requisitos de almacenamiento y descarga.
- El checkpoint YOLO solo detecta firmas y sellos; no realiza otras tareas de deteccion de objetos.
- No se proporcionan instrucciones de uso ni ejemplos de codigo en la model card, lo que puede dificultar su integracion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Neetu143/idfc-genai-extractor-models
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Espacio asociado (IDFC GenAI extractor): no se proporciona URL directa, pero se menciona en la model card como "IDFC GenAI extractor Space".
