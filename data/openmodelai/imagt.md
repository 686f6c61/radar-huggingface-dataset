# openmodelai/Imagt

## Resumen

`openmodelai/Imagt` es un repositorio de HuggingFace que publica «Image», una herramienta de extracción de texto desde imágenes (OCR) construida sobre el pipeline **PP-OCRv4** en su variante de tres etapas: detección de cajas de texto, clasificación de orientación y reconocimiento de caracteres. No es un modelo de lenguaje ni un modelo generativo de imagen: es un encapsulado listo para ejecutar con pesos ONNX embebidos en el wheel `rapidocr-onnxruntime` y extraídos a una carpeta `model/` local.

Su propuesta de valor es la autosuficiencia: funciona sin conexión a internet, sin GPU y sin PyTorch, y expone tres interfaces (paquete Python `image_text`, CLI y servidor HTTP con `POST /ocr`). El alfabeto de reconocimiento cubre chino y latino (incluidos dígitos); el cirílico no está soportado y la model card remite a Tesseract para texto en ruso.

La relevancia es acotada: el repositorio no declara pipeline, licencia ni idiomas en los metadatos de HuggingFace (0 descargas, 1 like, creado el 2026-10-24), no publica métricas de precisión y su utilidad real depende del paquete PyPI subyacente. Es una opción práctica para OCR offline chino/inglés en CPU, no un modelo evaluable con benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR PP-OCRv4 de tres etapas (detección de texto + clasificación de orientación + reconocimiento), ejecutado con ONNX Runtime |
| Parametros totales | no disponible (no se documenta el recuento de parámetros de los ficheros ONNX) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; procesa una imagen por petición) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX para CPU; no se documentan variantes int8 o FP16) |
| Idiomas soportados | Chino y alfabeto latino (inglés, dígitos y signos latinos). Cirílico no soportado |
| Licencia | Pesos PP-OCR: Apache-2.0. Código: MIT. El campo de licencia del repositorio HuggingFace figura como no disponible |
| Formato de pesos | ONNX (`.onnx`) más ficheros de configuración, extraídos del wheel a `model/` |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 1 |
| Fecha de creación del repositorio | 2026-10-24 (última actualización: 2026-10-24) |

## Arquitectura y entrenamiento

La arquitectura es una cascada OCR clásica de tres componentes —detección (`det`), clasificación de orientación (`cls`) y reconocimiento (`rec`)— empaquetada como artefactos ONNX. El motor carga rutas absolutas a esos ficheros en `RapidOCR(...)`, de modo que la inferencia se ejecuta en CPU mediante ONNX Runtime, sin dependencia de torch ni de CUDA. La model card no detalla los backbones concretos de cada etapa, el resolutor de entrenamiento ni el tamaño de los modelos.

No hay información sobre el corpus de entrenamiento, el número de tokens o imágenes, ni sobre ajuste posterior (RLHF/DPO no aplican). El autor tampoco documenta fine-tuning propio: los pesos son los de PP-OCRv4 tal cual, extraídos del paquete `rapidocr-onnxruntime` mediante `scripts/build_model.py` para que el ZIP resultante sea autocontenido. La innovación técnica, por tanto, no está en el modelo sino en el empaquetado: distribución offline, CLI, servidor HTTP con interfaz web mínima y test de extremo a extremo (`tests/smoke_test.py`) sobre `examples/sample.png`.

## Capacidades

- Extracción de texto impreso en imágenes (OCR) con salida en texto plano o JSON estructurado (`{text, lines: [...]}`).
- Detección de regiones de texto y clasificación de orientación previas al reconocimiento, lo que permite manejar imágenes con texto rotado dentro de los límites del clasificador.
- Reconocimiento de chino y alfabeto latino, incluidos dígitos y signos de puntuación latinos.
- Ejecución completamente offline: los pesos viajan dentro del wheel y se materializan en `model/`.
- Inferencia en CPU sin GPU, sin torch y sin CUDA.
- CLI: `python -m image_text.cli <imagen> [--json]`.
- Servicio HTTP: `GET /` sirve una interfaz de subida en navegador y `POST /ocr` acepta el cuerpo binario de la imagen y devuelve JSON con líneas detectadas.
- No soporta tool calling, agentes, razonamiento multi-paso ni modo «thinking»: no es un modelo de lenguaje.
- No realiza captioning ni descripción de imágenes; solo transcribe texto presente en ellas.

## Casos de uso

- Digitalización de facturas y albaranes en inglés o chino: el motor recibe la imagen y devuelve las líneas de texto con estructura de lista, suficiente para un pipeline posterior de extracción de campos con reglas o expresiones regulares.
- Ingesta de documentos escaneados en un backend sin GPU: al ejecutarse con ONNX Runtime en CPU, puede desplegarse en contenedores pequeños o en el mismo nodo que la API de negocio, sin aprovisionar aceleradores.
- Automatización de archivo documental en entornos aislados: al no requerir descarga de pesos ni acceso a internet, encaja en redes air-gapped donde no se permite tráfico saliente hacia repositorios de modelos.
- Microservicio OCR interno: el servidor incluido (`--port 8001`, `POST /ocr`) permite exponer la transcripción como endpoint HTTP para que otras aplicaciones envíen imágenes y consuman JSON.
- Preprocesado para RAG sobre documentos escaneados en chino/inglés: la salida por líneas se puede concatenar y enviar a un modelo de embeddings, usando este componente únicamente como extractor.
- Lectura de cartelería, etiquetas o capturas de pantalla en aplicaciones de escritorio: la CLI y el paquete Python permiten invocarlo desde scripts locales o integraciones de sistema sin servicio externo.
- Tests de regresión de calidad OCR: `tests/smoke_test.py` y `examples/sample.png` sirven como base para verificar que una actualización de dependencias no rompe la transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de precisión, exactitud por carácter, CER/WER, ni comparaciones con otros motores OCR; únicamente menciona un test de humo funcional sobre una imagen de ejemplo.

## Requisitos de hardware

- VRAM: no aplica. La inferencia es en CPU mediante ONNX Runtime y la model card indica explícitamente que funciona «sin GPU».
- GPU recomendadas: ninguna. No se documenta ruta de aceleración por GPU (CUDA, TensorRT, DirectML) en la información disponible.
- Compatibilidad con GPU de consumo: innecesaria; el cuello de botella es la CPU.
- Memoria RAM: no disponible (no se publica huella de memoria de los ficheros ONNX ni del proceso).
- Almacenamiento: los pesos se extraen del wheel a `model/`; el tamaño exacto no está documentado.
- Opciones de despliegue: entorno virtual + `requirements.txt`, CLI (`python -m image_text.cli`), servidor HTTP propio (`python -m image_text.server --port 8001`) y uso como paquete Python (`image_text`). vLLM, llama.cpp, Ollama y TGI no son aplicables a este componente.
- Latencia y throughput: no disponibles. No se publican mediciones por imagen ni peticiones por segundo.
- Dependencia relevante: `rapidocr-onnxruntime` arrastra `opencv-python`, que enlaza dinámicamente con libGL; el autor recomienda `opencv-python-headless` y ofrece el comando de reinstalación forzada si pip resuelve la variante con interfaz gráfica.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Ejecución |
|---|---|---|---|---|---|
| Image (openmodelai/Imagt) | OCR PP-OCRv4 (det + cls + rec), ONNX | no disponible | Chino y latino; sin cirílico | Pesos Apache-2.0, código MIT | CPU, ONNX Runtime, offline |
| Tesseract (`tessdata_fast`) | OCR LSTM por líneas | no disponible | Muy amplio, incluido ruso con `rus` + `eng` | Apache-2.0 | CPU, requiere toolchain para compilar |
| EasyOCR | OCR basado en deep learning (PyTorch) | no disponible | Decenas de idiomas, incluido cirílico | Apache-2.0 | CPU/GPU, requiere torch |
| RapidOCR (`rapidocr-onnxruntime`) | Envoltorio ONNX de PP-OCR | no disponible | Según modelos empaquetados (chino/latino) | Apache-2.0 | CPU, ONNX Runtime |

La comparación cuantitativa de precisión no es posible: ninguno de los proyectos citados publica en esta información métricas equiparables, y el repositorio analizado no aporta ninguna. La diferencia práctica es de empaquetado y cobertura de idiomas: Tesseract y EasyOCR cubren cirílico, mientras que este paquete no.

## Limitaciones y advertencias

- Cobertura de idiomas restringida: reconoce chino y latino; el cirílico no está soportado y la alternativa sugerida (Tesseract con `tessdata_fast`) queda fuera del paquete porque exige g++/cmake/ICU.
- No es un modelo de descripción de imágenes: cualquier expectativa de captioning, VQA o generación a partir de imagen queda fuera de alcance.
- Ausencia total de métricas: sin CER/WER ni curvas de precisión no se puede estimar la calidad en dominios concretos (documentos degradados, fuentes atípicas, manuscrito). Se recomienda evaluar con muestras propias antes de producción.
- Riesgo de error en imágenes de baja resolución, texto muy rotado, fondos con poco contraste o tipografías no latinas; el clasificador de orientación solo cubre rotaciones dentro de su rango entrenado.
- Metadatos incompletos en HuggingFace: sin pipeline declarado, sin licencia en el campo oficial y sin idiomas listados; la licencia debe tomarse de la model card (Apache-2.0 pesos / MIT código), no del formulario del repositorio.
- Validación comunitaria nula: 0 descargas y 1 like en el momento del análisis, sin issues ni discusión pública que permitan inferir robustez.
- Dependencia de terceros: los pesos se extraen de una versión concreta de `rapidocr-onnxruntime`; una actualización del paquete puede cambiar los artefactos en `model/` y alterar resultados. Conviene fijar la versión en `requirements.txt`.
- Fricción de instalación de OpenCV: si pip instala `opencv-python` en lugar de la variante headless, el proceso puede fallar por falta de libGL en servidores sin entorno gráfico.
- No se documentan límites de tamaño de imagen, número máximo de líneas devueltas, umbrales de confianza ni gestión de memoria en peticiones concurrentes al servidor HTTP.
- Sin información sobre sesgos: al no publicarse composición del dataset de entrenamiento, no es posible evaluar sesgos de reconocimiento por alfabeto, idioma o estilo tipográfico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/openmodelai/Imagt
- Paquete del que se extraen los pesos (citado en la model card): https://pypi.org/project/rapidocr-onnxruntime/
- Nota sobre la búsqueda web: los resultados devueltos (openmodeldb.info, developers.openai.com, docs.openmodel.ai, github.com/OpenModelDB/open-model-database) corresponden a proyectos de escalado de imagen, API de OpenAI y una plataforma homónima sin relación con este repositorio; no se han encontrado papers, blogs, demos ni repositorios adicionales asociados a `openmodelai/Imagt`.
