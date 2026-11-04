# PellelNitram/xournalpp-htr-word-detector-online

## Resumen

`xournalpp-htr-word-detector-online` es un detector de palabras basado en trazos (no en imágenes) desarrollado por PellelNitram como componente del proyecto Xournal++ HTR, un pipeline de reconocimiento de escritura manuscrita para documentos de la aplicación de toma de notas Xournal++. El modelo resuelve un problema concreto de segmentación: dado un conjunto de trazos de lápiz óptico ordenados por escritura, decide qué pares de trazos consecutivos pertenecen a la misma palabra y dónde cortar la secuencia para obtener palabras disjuntas. No reconoce texto; solo delimita palabras para que un reconocedor posterior, como SimpleHTR, las transcriba.

Técnicamente no es una red neuronal profunda al uso, sino un conjunto de 100 árboles de regresión con boosting de gradiente (gradient boosted trees) que puntúan cada par de trazos consecutivos con una probabilidad de "misma palabra". La secuencia se corta allí donde la puntuación cae por debajo de un umbral de fusión configurable. El modelo se distribuye como arrays NumPy puros en `model.npz`, sin dependencia de scikit-learn ni de ONNX Runtime en inferencia.

Es relevante en el nicho de la HTR online (reconocimiento de escritura con información temporal y de presión de los trazos) porque demuestra que un modelo ligero y determinista puede superar a un detector basado en visión (YOLO) en la misma tarea dentro de este pipeline, con una puntuación combinada de detección y reconocimiento de 63,6% frente a 52,5% del enfoque visual. El repositorio es de tamaño 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosted regression trees (100 árboles), puntuación por pares de trazos consecutivos |
| Parámetros totales | no disponible (no es una red neuronal; 100 árboles en `model.npz`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre la secuencia completa de trazos de una página) |
| Tipos de cuantización | no disponible (arrays NumPy en coma flotante; sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (el modelo no procesa texto; la cobertura idiomática depende del reconocedor posterior) |
| Licencia | no disponible (la model card indica "To be added by the maintainer") |
| Formato de pesos | `model.npz` (arrays NumPy sin pickle) y `config.json` |
| Librería | numpy |
| Entrada | Lista de arrays `(x, y)` en orden de escritura y unidades de documento (puntos) |
| Salida | Conjuntos disjuntos de índices de trazo, uno por palabra |
| Umbral de fusión | Configurable en `config.json` (valor no especificado en la información disponible) |

## Arquitectura y entrenamiento

El modelo es un conjunto de 100 árboles de regresión con boosting de gradiente que actúa como clasificador pairwise: para cada par de trazos consecutivos en la secuencia de escritura calcula una puntuación de "misma palabra". La segmentación final se obtiene recorriendo la secuencia y cortando donde la puntuación cae por debajo de un umbral de fusión. Las características de entrada se derivan de la geometría y la temporalidad de los trazos (nombres de features en `config.json`, no detallados en la información disponible), y la inferencia se ejecuta íntegramente en NumPy, sin scikit-learn ni ONNX Runtime.

El entrenamiento se realizó sobre 700 formularios aleatorios de IAM-OnDB cosidos en páginas, con un factor de compresión aleatorio entre 0,3 y 1,0 aplicado a los huecos entre palabras de cada línea, de modo que el modelo aprenda también espaciados ajustados. Ningún documento del benchmark de Xournal++ se usó en entrenamiento, lo que hace que la evaluación sea out-of-domain respecto a los datos de entrenamiento. El umbral de fusión se ajustó sobre probabilidades out-of-fold de las páginas de entrenamiento.

## Capacidades

- Detección de límites de palabra sobre trazos de lápiz óptico en orden de escritura, devolviendo conjuntos disjuntos de índices de trazo.
- Funcionamiento sobre datos de trazo nativos (online handwriting), no sobre renderizados de la página.
- Inferencia determinista y ligera en NumPy puro, sin dependencias de frameworks de aprendizaje profundo.
- Integración como etapa previa de un pipeline HTR: la salida alimenta a un reconocedor como SimpleHTR, que lee cada palabra a partir de los trazos agrupados.
- Umbral de fusión configurable para ajustar el compromiso entre precisión y recall de detección.
- No realiza reconocimiento de texto, clasificación semántica, tool calling ni razonamiento multi-paso.

## Casos de uso

- Segmentación previa en pipelines HTR de Xournal++: el modelo agrupa los trazos de una página en palabras antes de pasarlas a SimpleHTR, reduciendo el trabajo del reconocedor a unidades léxicas bien delimitadas.
- Digitalización de apuntes manuscritos tomados con tableta gráfica: al disponer de trazos con coordenadas, el detector separa palabras para su posterior transcripción y búsqueda en el texto resultante.
- Indexación y búsqueda en cuadernos digitales: una vez transcritas las palabras segmentadas, se puede construir un índice de búsqueda sobre notas manuscritas sin necesidad de OCR sobre imágenes.
- Procesamiento por lotes de formularios manuscritos digitales: al entrenarse con formularios IAM-OnDB cosidos en páginas, es adecuado para segmentar documentos con líneas de escritura y espaciados variables.
- Evaluación comparativa de detectores de palabras: sirve como referencia ligera frente a detectores basados en visión (YOLO) en experimentos de segmentación de escritura online.
- Preprocesado en herramientas de anotación o corrección: los conjuntos de índices de trazo por palabra permiten resaltar, editar o reetiquetar palabras individuales en un editor de notas.
- Prototipado e investigación en HTR online: su formato NumPy y su reducido tamaño facilitan la inspección, la modificación del umbral y la experimentación sin infraestructura de GPU.

## Benchmarks y rendimiento

Evaluación sobre 7 documentos manuscritos de Xournal++ de 7 escritores (406 palabras), con el detector seguido de SimpleHTR-OnDB sobre recortes renderizados a partir de los trazos de cada palabra (pipeline `2026-11-02_online_pairwise_gbm_iam_squeezed_isolated_simple_htr_ondb`):

| Métrica | Este modelo | Detector YOLO basado en visión + SimpleHTR |
|---|---|---|
| Precisión de detección | 84,1% | 77,0% |
| Recall de detección | 87,4% | 72,4% |
| CER (insensible a mayúsculas) | 27,3% | 27,5% |
| Recall × (1 − CER) | 63,6% | 52,5% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia es en CPU con NumPy y el repositorio ocupa 0,0 GB.
- GPU recomendadas: ninguna necesaria; no se requiere aceleración por GPU.
- Cabe en cualquier equipo consumer: el coste computacional es el de evaluar 100 árboles de regresión sobre pares de trazos consecutivos.
- Opciones de despliegue: uso directo mediante la clase `OnlineWordDetectorModel` del paquete `xournalpp_htr` (`from_pretrained()` y `group_strokes()`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada | Precisión detección | Recall detección | Recall × (1 − CER) | Licencia |
|---|---|---|---|---|---|---|
| xournalpp-htr-word-detector-online | GBM pairwise sobre trazos | Trazos online | 84,1% | 87,4% | 63,6% | no disponible |
| Detector YOLO del mismo pipeline | Visión sobre renderizado | Imagen de página | 77,0% | 72,4% | 52,5% | no disponible |
| SimpleHTR-OnDB (reconocedor, no detector) | CNN + RNN sobre recortes | Imagen de palabra | no aplica | no aplica | no aplica | no disponible |

No se dispone de información sobre otros detectores de palabras online comparables fuera del pipeline Xournal++ HTR.

## Limitaciones y advertencias

- Requiere datos de trazo; no puede leer escritura escaneada o fotografiada.
- Los trazos de flechas, subrayados y diagramas próximos al texto a veces se fusionan en una palabra o se notifican como palabra propia.
- El benchmark es pequeño (7 documentos y 7 escritores), por lo que diferencias de pocos puntos porcentuales no son fiables.
- El CER de 27,3% en la evaluación refleja el pipeline completo con SimpleHTR-OnDB; el detector por sí solo no transcribe texto.
- La licencia no está especificada en la model card ("To be added by the maintainer"), lo que impide confirmar condiciones de uso comercial.
- No se documentan sesgos específicos ni tasas de alucinación, ya que el modelo no genera texto; el riesgo de error se concentra en la segmentación incorrecta de palabras.
- La cobertura idiomática no está documentada y depende del reconocedor que se use aguas abajo.
- El repositorio no registra descargas ni likes, y la fecha de creación indicada (2026-11-04) debe tratarse con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/PellelNitram/xournalpp-htr-word-detector-online
- Código y entrenamiento: https://github.com/PellelNitram/xournalpp_htr (directorio `xournalpp_htr/training/word_detector_online/`)
- Documentación del modelo: `docs/models/word_detector_online.md` en el repositorio anterior
