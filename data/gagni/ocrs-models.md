# gagni/ocrs-models

## Resumen

`gagni/ocrs-models` es un repositorio espejo que aloja una copia byte a byte del modelo `text-detection.onnx` publicado originalmente por el proyecto [ocrs](https://github.com/robertknight/ocrs) de Robert Knight. No se trata de un modelo de lenguaje generativo, sino de un modelo especializado de vision por computador para la deteccion de texto (text detection) en imagenes de documentos, que constituye la primera etapa del pipeline OCR de ocrs. El autor del espejo, `gagni`, lo publica para dar servicio a un complemento PDF de aSup.

El modelo recibe una imagen de pagina y devuelve las palabras y lineas de texto detectadas, es decir, las regiones donde hay texto, sin realizar reconocimiento de caracteres (eso lo hace un segundo modelo del pipeline). Esta separacion en etapas es habitual en sistemas OCR modernos y permite optimizar por separado deteccion y reconocimiento.

La relevancia de este repositorio es fundamentalmente practica: ofrece un artefacto ONNX portable, verificado por hash SHA-256, que puede ejecutarse con `onnxruntime` en multiples plataformas sin depender del bucket S3 original del proyecto ocrs. La informacion disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es muy limitada, ya que la model card es un simple espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de deteccion de texto en formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero ONNX) |
| Idiomas soportados | no disponible |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`text-detection.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. La model card indica unicamente que se trata del modelo de deteccion de texto del proyecto ocrs, empaquetado como grafo ONNX. Por el tipo de tarea (deteccion de palabras y lineas en una imagen de pagina), es previsible que se trate de una red convolucional o de un detector tipo segmentacion, pero no se confirma en la informacion disponible.

Tampoco se detallan los datos de entrenamiento, el numero de tokens o imagenes procesadas, la composicion del dataset ni si hubo ajuste fino con tecnicas de RLHF o DPO (lo cual seria inusual en un modelo de vision de este tipo). La unica garantia tecnica documentada es la integridad del artefacto: el fichero `text-detection.onnx` tiene hash SHA-256 `a917b23dbd9524b465df7e922641b3ff2981623df4ded5a0234004ef2fee7cfe`, identico al publicado por el proyecto original.

## Capacidades

- Deteccion de palabras y lineas de texto en imagenes de paginas de documentos.
- Salida de regiones o cajas delimitadoras de texto, no de caracteres reconocidos (el reconocimiento es una etapa posterior del pipeline ocrs).
- Ejecucion portable mediante ONNX Runtime en CPU y, potencialmente, en aceleradores compatibles con ONNX.
- Integracion en pipelines OCR completos junto al modelo de reconocimiento de ocrs.
- No soporta generacion de texto, razonamiento, codigo, tool calling ni capacidades de agente.
- No se documentan capacidades multilingues especificas; la deteccion de texto es en principio independiente del idioma, pero no se confirma en la informacion disponible.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo localiza las regiones de texto en cada pagina y las pasa al reconocedor de ocrs para extraer el contenido, permitiendo construir un pipeline OCR completo con componentes ONNX.
- Preprocesado en sistemas de archivo y gestion documental: deteccion de areas con texto para recortar, indexar o clasificar paginas antes de aplicar OCR, reduciendo el coste de procesar zonas sin texto.
- Extraccion de texto en aplicaciones de escritorio o moviles: al ser un artefacto ONNX portable, puede embeberse en aplicaciones que necesiten OCR local sin depender de servicios en la nube.
- Automatizacion de facturas y recibos: localizacion de lineas de texto para alimentar etapas posteriores de reconocimiento y extraccion de campos estructurados.
- Procesamiento por lotes de PDFs: integracion en herramientas que conviertan PDFs a texto, usando la deteccion para delimitar regiones antes del reconocimiento.
- Investigacion y prototipado en vision por computador: uso del detector como componente de referencia en experimentos de OCR o como baseline para comparar detectores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamano del modelo ni el numero de parametros).
- GPU recomendadas: no disponible; al ser un modelo ONNX de deteccion, es probable que funcione en CPU, pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (CPU o GPU segun proveedor de ejecucion); el proyecto ocrs ofrece integracion nativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| gagni/ocrs-models (text-detection) | Deteccion de texto OCR | ONNX | CC BY-SA 4.0 | Imagen de pagina | Hugging Face (espejo) |
| robertknight/ocrs-models | Deteccion y reconocimiento OCR | ONNX | CC BY-SA 4.0 | Imagen de pagina | Hugging Face (original) |
| Tesseract (modelos LSTM) | OCR completo | Propietario (traineddata) | Apache 2.0 | Imagen de linea | GitHub / repositorios de sistema |

La comparativa se limita a alternativas del mismo dominio (OCR). No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Se trata de un espejo no oficial: la fuente de verdad es el repositorio `robertknight/ocrs-models` y el proyecto ocrs; conviene verificar el hash SHA-256 antes de usarlo en produccion.
- El modelo solo detecta texto; no reconoce caracteres. Requiere un segundo modelo de reconocimiento para obtener texto utilizable.
- No hay informacion sobre sesgos, tasas de error ni robustez frente a idiomas, tipografias o calidades de imagen.
- La licencia CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial y la redistribucion.
- El repositorio tiene 0 descargas y 0 likes, y un tamano declarado de 0.0 GB, lo que sugiere que la informacion de metadatos puede estar incompleta o que el artefacto no esta correctamente subido; conviene comprobar la integridad de los ficheros.
- No se documentan limitaciones de contexto ni de idioma porque no aplican al tipo de modelo, pero tampoco se aportan garantias de calidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gagni/ocrs-models
- Repositorio original de modelos ocrs: https://huggingface.co/robertknight/ocrs-models
- Proyecto ocrs en GitHub: https://github.com/robertknight/ocrs
- Origen del artefacto: https://ocrs-models.s3-accelerate.amazonaws.com/text-detection.onnx
