# GetcharZp/go-ocr

## Resumen

go-ocr es una biblioteca de reconocimiento optico de caracteres (OCR) escrita en Go que actua como envoltorio sobre modelos ONNX preentrenados de PaddleOCR y DdddOCR. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un conjunto de pesos de vision por computador distribuidos en formato ONNX junto con las librerias dinamicas de ONNX Runtime necesarias para su ejecucion. El repositorio en HuggingFace (GetcharZp/go-ocr) actua como almacen de artefactos: modelos de deteccion de texto (det.onnx), modelos de reconocimiento (rec.onnx), ficheros de diccionario (dict.txt) y binarios de ONNX Runtime para Linux, Windows y macOS.

El problema que resuelve es la ausencia de una via sencilla para integrar OCR en aplicaciones escritas en Go. La mayoria de soluciones OCR de calidad (PaddleOCR, EasyOCR, Tesseract con bindings) estan orientadas a Python o C++, lo que complica su uso en servicios backend en Go. go-ocr expone una interfaz `ocr.Engine` con metodos `RunOCR()` (deteccion y reconocimiento completos) y `RunDetect()` (solo deteccion de regiones de texto), y permite seleccionar entre dos motores: PaddleOCR para documentos generales y DdddOCR para captchas.

El modelo esta etiquetado como `image-to-text`, soporta ingles y chino, se distribuye bajo licencia MIT y ocupa aproximadamente 0,5 GB en el repositorio. Es relevante para equipos que despliegan microservicios en Go y necesitan extraccion de texto de imagenes sin depender de un runtime Python ni de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales convolucionales de deteccion y reconocimiento de texto (PaddleOCR: deteccion + reconocimiento; DdddOCR: deteccion), ejecutadas via ONNX Runtime |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`) + fichero de diccionario `dict.txt` + librerias dinamicas de ONNX Runtime (`.so`, `.dll`, `.dylib`) |
| Tamano del repositorio | ~0,5 GB |
| Runtime | ONNX Runtime (librerias incluidas para Linux amd64, Windows y macOS amd64) |
| Lenguaje de integracion | Go (via `github.com/getcharzp/go-ocr`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo unico sino un conjunto de artefactos de inferencia. El motor PaddleOCR sigue el esquema clasico de dos etapas: un modelo de deteccion (`det.onnx`) que localiza regiones de texto en la imagen, probablemente basado en la arquitectura DBNet empleada por PaddleOCR, y un modelo de reconocimiento (`rec.onnx`) que transcribe cada region recortada, tipicamente con una arquitectura CRNN o SVTR con cabecera CTC. El motor DdddOCR aporta un modelo de deteccion (`common_det.onnx`) orientado a captchas y elementos graficos con ruido.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento, ni sobre procesos de ajuste fino, RLHF o DPO, ya que los pesos proceden de los proyectos originales PaddleOCR y DdddOCR y no se documentan en la model card. La innovacion tecnica del proyecto no reside en el entrenamiento sino en la distribucion: pesos ONNX autocontenidos mas binarios de ONNX Runtime empaquetados por plataforma, con un espejo en ModelScope para China continental, lo que elimina la friccion de compilar dependencias nativas.

El diseno de la API en Go es minimalista: una interfaz `Engine` con `RunOCR(img)` y, en el caso de DdddOCR, `Detect(img)` que devuelve cajas delimitadoras (`Box` con coordenadas min/max). El campo `ThreadCount` del `Config` de Paddle permite abrir sesiones de reconocimiento en paralelo, con valor por defecto 1.

## Capacidades

- Deteccion de regiones de texto en imagenes (bounding boxes) mediante `RunDetect()` o el motor DdddOCR.
- Reconocimiento optico de caracteres sobre las regiones detectadas mediante `RunOCR()`, devolviendo el texto transcrito.
- Reconocimiento de texto en ingles y chino.
- Deteccion y reconocimiento de captchas con el motor DdddOCR.
- Procesamiento por lotes mediante `ThreadCount` para sesiones de reconocimiento concurrentes.
- Integracion nativa en aplicaciones Go sin necesidad de un interprete Python.
- Ejecucion local sobre ONNX Runtime, sin llamadas a servicios externos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: no es un modelo generativo.

## Casos de uso

- Extraccion de texto de facturas y albaranes en un backend Go: se carga la imagen, se invoca `RunOCR()` con el motor PaddleOCR y se obtienen las lineas transcritas para su posterior parseo estructurado, sin salir del proceso Go ni depender de un servicio OCR externo.
- Digitalizacion de documentos escaneados en pipelines ETL: el modelo de deteccion localiza cada bloque de texto y el de reconocimiento lo transcribe, lo que permite indexar PDFs escaneados en un motor de busqueda interno manteniendo todo el flujo en Go.
- Resolucion de captchas en tareas de automatizacion y testing: el motor DdddOCR esta especificamente orientado a este escenario y devuelve las cajas de los caracteres para su posterior clasificacion.
- Enriquecimiento de imagenes subidas por usuarios en una plataforma: al recibir una foto, el servicio en Go ejecuta OCR para extraer texto embebido (carteles, pantallazos, documentos fotografiados) y lo anade como metadatos buscables.
- Procesamiento de pantallazos en herramientas de monitorizacion o soporte: un agente en Go puede capturar la pantalla, pasar la imagen por `RunOCR()` y extraer mensajes de error o etiquetas de interfaz para clasificacion automatica.
- Moderacion de contenido asistida: deteccion de texto en imagenes enviadas por usuarios (por ejemplo, numeros de telefono o direcciones en fotos) antes de aplicar politicas de contenido.
- Servicios de digitalizacion para mercado hispanohablante y chino: apropiado para documentos en ingles y chino; para espanol el reconocimiento dependera de la cobertura del diccionario del modelo PaddleOCR subyacente, no documentada en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Los modelos ONNX de PaddleOCR y DdddOCR para deteccion y reconocimiento son ligeros (tipicamente cientos de MB en total), por lo que es esperable que quepan en GPUs de gama baja o incluso en CPU, pero no se documentan cifras en la informacion proporcionada.
- GPU recomendadas: no disponible en la model card.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; la ejecucion via ONNX Runtime en CPU es viable dado el tamano reducido de los pesos, aunque no se aportan mediciones.
- Plataformas soportadas por las librerias dinamicas incluidas: Linux `onnxruntime_amd64.so`, Windows `onnxruntime.dll`, macOS `onnxruntime_amd64.dylib`.
- Opciones de despliegue: ONNX Runtime embebido en un binario Go mediante cgo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Idiomas | Formato | Licencia | Integracion en Go | Disponibilidad |
|---|---|---|---|---|---|---|
| go-ocr (PaddleOCR/DdddOCR) | OCR deteccion + reconocimiento via ONNX | en, zh | ONNX + binarios runtime | MIT | Nativa | HuggingFace, ModelScope |
| PaddleOCR (original) | OCR deteccion + reconocimiento | multi-idioma (segun modelo) | Paddle / ONNX | Apache 2.0 | Via cgo o servicio externo | GitHub, PaddlePaddle |
| DdddOCR (original) | OCR orientado a captchas | en, zh | ONNX | MIT | No nativa | GitHub, PyPI |
| Tesseract | OCR clasico con LSTM | multilingue | Modelos propios | Apache 2.0 | Bindings de terceros | GitHub, paquetes del sistema |

go-ocr no aporta un modelo nuevo sino un empaquetado de PaddleOCR y DdddOCR para el ecosistema Go; la comparacion justa es con esos proyectos originales y con Tesseract. Su ventaja es la integracion nativa en Go y la distribucion autocontenida; su desventaja es la dependencia de los pesos y capacidades de los proyectos subyacentes.

## Limitaciones y advertencias

- Solo soporta ingles y chino de forma declarada; el rendimiento en espanol u otros idiomas no esta documentado y dependera de los diccionarios de PaddleOCR subyacentes.
- El repositorio tiene 0 descargas y 5 likes en el momento de la consulta, lo que indica un proyecto joven y con poca validacion externa; conviene evaluar su robustez antes de usarlo en produccion critica.
- La API depende de cgo y de librerias dinamicas de ONNX Runtime especificas por plataforma (amd64 en Linux y macOS); no se documenta soporte para arm64 ni otras arquitecturas.
- No se publican benchmarks, tasas de error (CER/WER), ni comparativas de precision con Tesseract o PaddleOCR original, por lo que el rendimiento real es desconocido.
- El motor DdddOCR esta orientado a captchas y elementos graficos con ruido; no es adecuado para documentos densos.
- Riesgo de errores de reconocimiento en imagenes de baja resolucion, rotadas o con tipografias no vistas durante el entrenamiento de los pesos originales.
- Licencia MIT permisiva para uso comercial, pero los pesos derivan de PaddleOCR (Apache 2.0) y DdddOCR (MIT); conviene verificar las condiciones de los proyectos originales si se redistribuyen.
- El tamano del repositorio (~0,5 GB) incluye binarios de ONNX Runtime para varias plataformas; en despliegues conviene descargar solo los ficheros necesarios, como indica la propia model card.
- La model card advierte de que no es necesario descargar todo el repositorio; descargar artefactos innecesarios incrementa el tamano de la imagen de contenedor.

## Enlaces

- HuggingFace: https://huggingface.co/GetcharZp/go-ocr
- Espejo en ModelScope: https://www.modelscope.cn/getcharzp/go-ocr
- Repositorio GitHub: https://github.com/getcharzp/go-ocr
- Documentacion en chino: https://github.com/getcharzp/go-ocr/blob/main/docs/README_zh.md
- Dependencia Go auxiliar: https://github.com/up-zero/gotool
