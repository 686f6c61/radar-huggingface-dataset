# myteaalreadyexists/nom-ocr-group9

## Resumen

`myteaalreadyexists/nom-ocr-group9` es el repositorio de código del proyecto "Group 9 (projectg9) — Confidence-Weighted Nôm OCR", concretamente de su **etapa de detección de caracteres**. No es un modelo de lenguaje: es un detector de objetos basado en **YOLO11n** (Ultralytics) entrenado para localizar caracteres de escritura chữ Nôm en imágenes de páginas manuscritas o impresas, como paso previo a un reconocedor de texto que no forma parte de este repositorio. El modelo se apoya en el repositorio de arranque del curso `ntcuong2103/nom-ocr-project` y se organiza en scripts semanales (semanas 1 a 5) con flujos de preparación de datos, entrenamiento, fine-tuning, análisis de errores y generación de recortes.

El checkpoint publicado en la model card es un YOLO11n entrenado a resolución 1280 px sobre el conjunto **MTHv2**, con resultados declarados de precisión 0,978, recall 0,974 y mAP@50 0,993 en validación tras **una sola época**. Con ese checkpoint se procesaron las 2.953 páginas de **NomNaOCR**, generando 471.510 cajas frente a 460.432 caracteres transcritos, y se produjeron 461.525 recortes de 128 × 128 px (confianza ≥ 0,25) listos para alimentar una etapa de reconocimiento.

Su relevancia es acotada y de nicho: cubre la digitalización de patrimonio documental en Nôm, un dominio con muy pocos recursos abiertos, y lo hace con un detector nano de coste computacional bajo. Conviene subrayar que el repositorio tiene **0,0 GB** y que, según la propia model card, **ni los datasets ni los pesos están incluidos**; el material disponible es código y documentación de resultados, no artefactos ejecutables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de objetos de una etapa basado en CNN |
| Parametros totales | no disponible en la model card (variante "n" de YOLO11) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión); resolución de entrada de 1280 px según el nombre del checkpoint (`yolo11n-1280-mthv2`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la model card; el dominio de entrenamiento es escritura chữ Nôm (MTHv2, NomNaOCR, NakagawaLab) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoint Ultralytics `best.pt`); los pesos no están incluidos en el repositorio |
| Tarea | detección de caracteres (cajas delimitadoras), no reconocimiento de texto |
| Clases | una sola clase (`single-class`) en el flujo de preparación de NakagawaLab |
| Framework y dependencias | Python 3.11, `torch` cu128, `ultralytics`, `python-pptx`, gestionado con `uv` |
| Fecha de creación del repo | 2026-10-27 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es YOLO11n, la variante nano del detector de Ultralytics: un modelo convolucional de una etapa que predice cajas y puntuaciones de confianza directamente sobre la imagen redimensionada. El repositorio no documenta el número de parámetros ni la configuración exacta de anchors, aumentos de datos o hiperparámetros de entrenamiento; lo que sí queda fijado en el nombre del checkpoint es la resolución de trabajo, 1280 px, coherente con la densidad de caracteres de una página Nôm completa.

El entrenamiento se realizó sobre **MTHv2** con un único epoch, según la tabla de estado de la model card (P 0,978, R 0,974, mAP@50 0,993 sobre la validación de MTHv2). No se menciona ninguna fase de alineación, RLHF ni preferencias, algo que no aplica a un detector. El flujo posterior incluye evaluación zero-shot del checkpoint MTHv2 sobre NakagawaLab, fine-tuning sobre ese corpus y comparación antes/después mediante `metrics.json` y `metrics.md` con P, R, mAP@50 y mAP@50-95; sin embargo, la propia ficha indica que esos scripts están "validated end-to-end on a stand-in" y **todavía no se han ejecutado sobre NakagawaLab**. Como innovación destacable dentro del proyecto figura el mapeo de texto a **IDS** (Ideographic Description Sequences), validado sobre los caracteres 心恊順洪惟 con una cobertura del 98,4 % de los tokens de carácter y del 94,1 % de los caracteres distintos, y la generación de recortes con umbral de confianza para la siguiente etapa del pipeline.

## Capacidades

- Detección de caracteres Nôm en imágenes de página completa: devuelve cajas delimitadoras con puntuación de confianza.
- Entrenamiento e inferencia a 1280 px, lo que permite localizar caracteres de pequeño tamano en digitalizaciones de manuscritos.
- Preparación de datos para YOLO: conversión de manifiestos de MTHv2 y NakagawaLab a formato de detección de una sola clase.
- Evaluación automática con métricas estándar de detección (precisión, recall, mAP@50, mAP@50-95) y comparación antes/después de fine-tuning.
- Análisis de errores semiautomático: etiquetado de casos de fusión (*merge*), división (*split*), espurios (*spurious*) y omitidos (*missed*), con exportación a `errors.csv` y galería de recortes.
- Generación de recortes de caracteres normalizados a 128 × 128 px con umbral de confianza configurable y `manifest.csv` asociado.
- Mapeo de texto a secuencias IDS para describir caracteres fuera de vocabulario, con validación de cobertura.
- Generación automática de presentaciones (`make_slides.py`) a partir de las salidas de `runs/`.
- No incluye reconocimiento de texto, traducción, tool calling, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Digitalización de fondos Nôm en bibliotecas y archivos: el detector localiza cada carácter de una página escaneada y entrega las coordenadas que necesita el OCR posterior, evitando segmentar manualmente miles de páginas; el proyecto ya lo aplicó a las 2.953 páginas de NomNaOCR.
- Construcción de un corpus de entrenamiento para reconocimiento: `prepare_crops.py` genera recortes de 128 × 128 px con manifiesto, de modo que un equipo puede entrenar su propio clasificador o recognizer sin partir de cero; en el proyecto se produjeron 461.525 recortes.
- Adaptación a una nueva colección con fine-tuning: el flujo de la semana 4 (evaluación zero-shot, ajuste fino y evaluación del `best.pt`) está pensado para trasladar el modelo de MTHv2 a NakagawaLab, un escenario habitual cuando se incorpora un fondo documental con tipografía o soporte distinto.
- Control de calidad de transcripciones existentes: comparar el número de cajas detectadas con el número de caracteres transcritos (471.510 frente a 460.432 en NomNaOCR) sirve para detectar páginas con discrepancias y priorizar la revisión humana.
- Investigación en humanidades digitales: la galería de errores y las etiquetas de fusión/división permiten estudiar qué clases de caracteres o qué tipos de escritura degradan la detección, con datos exportables en CSV.
- Anotación asistida: preanotar páginas nuevas con el detector y corregir después en una herramienta de etiquetado reduce el coste frente a la anotación desde cero.
- Docencia y reproducibilidad de pipelines: los scripts semanales, el `LAB_TUTORIAL.md` y la generación automática de diapositivas permiten reutilizar el flujo como material de curso o como plantilla de proyecto de visión aplicada.

## Benchmarks y rendimiento

| Conjunto | Epocas | Precisión | Recall | mAP@50 | mAP@50-95 |
|---|---|---|---|---|---|
| MTHv2 (validación) | 1 | 0,978 | 0,974 | 0,993 | no disponible |

No se han publicado en la información disponible resultados sobre NakagawaLab, ni métricas de mAP@50-95, latencia o throughput. Los valores de NakagawaLab (antes y después de fine-tuning) están contemplados en `metrics.json` / `metrics.md`, pero la model card confirma que ese trabajo aún no se ha ejecutado sobre el corpus real.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Se trata de un detector de escala nano con pesos de pocos megabytes, por lo que la inferencia es viable en GPU de consumo, pero no se aportan medidas.
- GPU recomendadas: no disponible. El proyecto se ejecuta en un servidor de curso con CUDA 12.8 (`torch cu128`) y utiliza `sbatch` (Slurm) para los trabajos de la semana 4.
- GPU de consumo: no se documenta ninguna prueba. Por el tamano del modelo y la resolución de 1280 px, es esperable que quepa en tarjetas de 8-12 GB, pero es una inferencia, no un dato de la ficha.
- Despliegue: el repositorio usa `ultralytics` para entrenamiento e inferencia; exportación a otros formatos (ONNX, TensorRT, etc.) no está documentada en la model card.
- Latencia y throughput: no disponibles.
- Almacenamiento: los recortes de la semana 5 ocupan aproximadamente 1,5 GB; el repositorio en sí es de 0,0 GB porque no contiene pesos ni datos.

## Comparativa con modelos similares

La comparación directa es difícil porque este repositorio cubre solo la etapa de detección, mientras que la mayoría de alternativas son pipelines OCR completos.

| Modelo / proyecto | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nom-ocr-group9 (este) | Detector de caracteres YOLO11n | no disponible | imagen 1280 px | no disponible | repo sin pesos |
| ntcuong2103/nom-ocr-project | Repositorio base del curso, OCR Nôm | no disponible | no disponible | no disponible | GitHub público |
| DeepSeek-OCR | OCR multimodal extremo a extremo | no disponible | no disponible | no disponible | mencionado en ranking de OCR local |
| PaddleOCR-VL | OCR y comprensión de documentos | no disponible | no disponible | no disponible | mencionado en ranking de OCR local |
| GLM-OCR | OCR multimodal | no disponible | no disponible | no disponible | mencionado en ranking de OCR local |

No se dispone de datos verificables de parámetros, contexto o rendimiento de las alternativas en la información proporcionada; la comparación solo puede establecerse a nivel de función (detección aislada frente a reconocimiento extremo a extremo).

## Limitaciones y advertencias

- El repositorio contiene únicamente código: no incluye pesos ni datasets, por lo que no puede usarse tal cual sin entrenar o sin obtener el checkpoint del equipo autor.
- El resultado de 0,993 de mAP@50 corresponde a **un solo epoch** sobre MTHv2; un valor tan alto con tan poco entrenamiento sugiere evaluar con cautela, comprobar la partición de validación y descartar fuga de datos antes de dar el número por bueno.
- El fine-tuning sobre NakagawaLab no se ha ejecutado: los scripts están validados solo con datos de sustitución, según reconoce la propia model card.
- Solo detecta; no reconoce caracteres ni produce texto. El proyecto lo describe como "detection stage" de un pipeline mayor.
- La cobertura del mapeo IDS es del 98,4 % de tokens y 94,1 % de caracteres distintos: existe un porcentaje residual de caracteres sin representación.
- Dependencias fuertes del entorno del curso: rutas absolutas como `/data/shared/project2026`, enlaces simbólicos a `datasets/` y la necesidad del repositorio hermano `../nom-ids/` para la semana 5.
- Licencia no especificada: no hay autorización explícita de uso comercial; hay que contactar con el autor antes de integrarlo en un producto.
- Idiomas no declarados formalmente; el dominio es chữ Nôm, y no hay evidencia de generalización a otros sistemas de escritura o a documentos latinos.
- Riesgo de alucinación no aplica (no genera texto), pero sí de falsos positivos y cajas espurias, especialmente con umbral de confianza 0,25.
- Tareas pendientes declaradas por los autores: revisar al menos 10 etiquetas de la galería y escribir la nota de media página en `errors/note.md`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myteaalreadyexists/nom-ocr-group9
- Repositorio base del curso: https://github.com/ntcuong2103/nom-ocr-project
- Ranking de modelos OCR locales (contexto de alternativas): https://local-ai-zone.github.io/guides/best-ai-ocr-models-ultimate-ranking-2026.html
- Modelo prebuilt de reconocimiento de texto de AI Builder (referencia de OCR comercial): https://learn.microsoft.com/en-us/ai-builder/flow-text-recognition
- Tutorial de object detection en AI Builder (referencia metodológica): https://www.youtube.com/watch?v=jV8FyA-ppQ0
- Calendario de lanzamientos de modelos de IA (contexto temporal): https://www.scriptbyai.com/ai-model-release-calendar/

Nota: la búsqueda web realizada no ha devuelto páginas específicas sobre este modelo; los enlaces anteriores son fuentes tangenciales sobre OCR y detección de objetos. No se han encontrado paper, blog técnico ni demo asociados al proyecto.
