# Kansallisarkisto/cyrillic-latin-textline-classifier

## Resumen

`cyrillic-latin-textline-classifier` es un clasificador de imágenes de líneas de texto que decide si la escritura de la línea es cirílica o latina. Lo desarrolla Kansallisarkisto (Archivo Nacional de Finlandia) en el marco del proyecto ArchXAI, financiado por el Central Baltic Programme, y se publica con licencia Apache 2.0. Su función no es reconocer texto, sino actuar como paso de enrutado dentro de una cadena de HTR/OCR: cada línea se envía al modelo de reconocimiento adecuado según su escritura.

Técnicamente es una red convolucional ConvNeXt Tiny (torchvision) inicializada con pesos de ImageNet-1k y afinada para clasificación binaria, con entrada RGB redimensionada a 96 x 768 píxeles y salida de dos logits (`0 = cyrillic`, `1 = latin`). El repositorio ocupa 0,2 GB y contiene el checkpoint en PyTorch. No es un modelo de lenguaje: no tiene ventana de contexto ni genera texto, por lo que las métricas de benchmarks tipo MMLU o HumanEval no aplican.

Su relevancia práctica está en archivos y bibliotecas con fondos históricos plurilingües (finés, sueco, estonio, letón, alemán y cirílico), donde mezclar modelos de reconocimiento produce errores sistemáticos. El autor reporta 97,6 % de balanced accuracy y AUC 0,996 sobre el conjunto de validación, aunque sin conjunto de test independiente en esta versión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt Tiny (CNN), base `torchvision.models.convnext_tiny` con cabecera de clasificación reemplazada por `Linear(768, 2)` |
| Parametros totales | Aproximadamente 28,6 M (arquitectura ConvNeXt Tiny de torchvision; la model card no lo explicita) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificador de imágenes; entrada fija de 96 x 768 píxeles) |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en precisión completa de PyTorch (float32). No se documenta ni evalúa cuantización int8/FP16 |
| Idiomas soportados | No disponible en los metadatos de HuggingFace. El autor indica que la clase `latin` cubre las lenguas latinas presentes en el entrenamiento (finés, sueco, estonio, letón, alemán); el modelo clasifica escritura, no idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (checkpoint PyTorch con `model_state_dict` e `idx2label`). No se ofrecen safetensors ni GGUF |
| Tarea (pipeline) | `image-classification` (clasificación binaria de escritura) |
| Entrada | Una imagen RGB de una línea de texto horizontal, redimensionada a 96 x 768 sin mantener la relación de aspecto, con normalización ImageNet |
| Salida | Dos logits; índice 0 = `cyrillic`, índice 1 = `latin` |
| Tamano del repositorio | 0,2 GB |
| Version del modelo | 26102026 |

## Arquitectura y entrenamiento

La arquitectura es una ConvNeXt Tiny completa, es decir, una red puramente convolucional con diseño inspirado en Vision Transformer (convoluciones depthwise de 7x7, capas de normalización LayerNorm y activación GELU). Se parte de los pesos preentrenados en ImageNet-1k de torchvision y se sustituye la capa final por una proyección lineal de 768 a 2 clases. El entrenamiento usa imágenes de 96 x 768 píxeles, lo que aplana la relación de aspecto de la línea original: un compromiso que reduce coste computacional y homogeneiza la entrada, a cambio de distorsionar líneas muy cortas o muy alargadas.

Los datos proceden de documentos históricos manuscritos e impresos de los archivos nacionales de Estonia, Finlandia y Letonia, más algunas líneas latinas tipográficas generadas sintéticamente. El conjunto de entrenamiento tiene 210 435 líneas (157 069 latinas, 53 366 cirílicas) y el de validación 16 651 líneas (14 051 latinas, 2 600 cirílicas), provenientes de colecciones distintas. Las etiquetas se derivan mayoritariamente de las transcripciones de referencia, complementadas con metadatos a nivel de documento y etiquetado asistido por OCR con revisión manual parcial.

El ajuste fino emplea Adam con tasa 1e-4 sin weight decay, batch de 32, 15 épocas de 120 000 líneas muestreadas, scheduler ReduceLROnPlateau (factor 0,5, paciencia 2) monitorizando el AUC de validación, media móvil exponencial de pesos (decay 0,9997) y semilla 42. La aumentación incluye rotación de hasta 2,5 grados (p=0,4), inclinación de hasta 5 grados (p=0,3), márgenes extra (p=0,3), reescalado (p=0,15), artefactos JPEG (p=0,15), jitter de brillo/contraste/saturación (p=0,5) y desenfoque (p=0,15). El punto de control seleccionado es el de mejor AUC de validación, que también se usa para programar la tasa de aprendizaje.

## Capacidades

- Clasificación binaria de escritura (`cyrillic` / `latin`) sobre imágenes de líneas de texto, con dos logits y probabilidad obtenible por softmax.
- Enrutado dentro de pipelines HTR/OCR: separar líneas que deben ir a un modelo de reconocimiento cirílico de las que deben ir a uno latino.
- Funciona sobre material manuscrito e impreso histórico, no solo sobre tipografía moderna.
- Definición operativa de etiqueta: una línea es `cyrillic` si contiene al menos una letra cirílica, incluso si es una única palabra dentro de una línea por lo demás latina.
- Cubre documentos de los archivos nacionales de Estonia, Finlandia y Letonia, con mezcla de lenguas latinas (finés, sueco, estonio, letón, alemán) y cirílicas.
- Inferencia ligera: el modelo cabe en CPU y en cualquier GPU consumer, con entrada de tamaño fijo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión general, audio ni modo "thinking"; no es un modelo generativo.
- Capacidades multilingües: limitadas a la identificación de escritura; no identifica el idioma concreto de la línea.

## Casos de uso

- Enrutado en cadenas de HTR de archivos nacionales: cada línea recortada se clasifica y se envía al modelo de transcripción cirílico o latino. Es el caso para el que fue diseñado y evita que un reconocedor latino procese texto cirílico, donde produciría basura sistemática.
- Digitalización de fondos históricos plurilingües del Báltico y del antiguo Imperio ruso: documentos con mezcla de finés, alemán, estonio, letón y ruso en la misma colección, donde una regla por colección no basta y se necesita decisión línea a línea.
- Prensa histórica y publicaciones administrativas: separar secciones o números completos en escritura cirílica de los latinos antes de aplicar OCR especializado, reduciendo coste al no ejecutar ambos reconocedores sobre todo el corpus.
- Control de calidad de recortes: líneas con probabilidad cercana a 0,5 o clasificaciones incoherentes con el resto de la página pueden señalar recortes defectuosos, lomo de encuadernación o ruido, y activar revisión manual.
- Generación de metadatos de escritura para catálogos e indexación: agregar las predicciones por página o por documento para etiquetar la escritura predominante de cada unidad documental y facilitar la búsqueda y el filtrado en el catálogo.
- Planificación de proyectos de transcripción: estimar de antemano qué proporción de un lote requiere modelo cirílico y dimensionar el trabajo, las licencias de software y los recursos humanos en consecuencia.
- Despliegue en instituciones sin GPU: al ser un ConvNeXt Tiny de unos 28,6 M de parámetros, la inferencia en CPU es viable para lotes pequeños o medianos, lo que permite integrarlo en estaciones de digitalización locales.
- Investigación en lingüística histórica y humanidades digitales: construir subcorpus separados por escritura antes del reconocimiento, de modo que los análisis posteriores no mezclen alfabetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a este modelo. La model card sí incluye una evaluación sobre el conjunto de validación de 16 651 líneas, con umbral 0,5:

| Metrica | Lineas | Resultado |
|---|---|---|
| Cirílicas detectadas (recall de `cyrillic`) | 2 600 | 96,6 % |
| Latinas correctas | 14 051 | 98,5 % |
| Balanced accuracy | — | 97,6 % |
| Exactitud global | 16 651 | 98,2 % |
| AUC (cirílico frente a latino) | — | 0,996 |

Advertencia del propio autor: no existe conjunto de test independiente en esta versión, porque las antiguas colecciones de test se incorporaron al entrenamiento. Además, la validación se usó para seleccionar el checkpoint y programar la tasa de aprendizaje, por lo que las cifras son ligeramente optimistas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en float32 para el modelo y un lote pequeño; el checkpoint completo ocupa 0,2 GB en disco. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con 2 GB o más (GTX 1650, RTX 3050, RTX 4090, A100, H100) sirve; las GPU grandes solo aportan ventaja en lotes muy grandes.
- Cabe en GPU consumer: sí, en todas las del mercado actual, y también en CPU para lotes moderados.
- Opciones de despliegue: PyTorch nativo siguiendo el código de la model card (`torch.load` con `weights_only=True`, `convnext_tiny(weights=None)` y carga de `model_state_dict`); exportación a TorchScript u ONNX no documentada, pero factible por hacerse con torchvision; servidores de inferencia tipo TorchServe, Triton o FastAPI con worker PyTorch; integración como paso previo en pipelines de HTR/OCR (por ejemplo, junto a Kraken, eScriptorium o servicios propios) enviando cada imagen de línea al modelo.
- Latencia y throughput: no se han publicado mediciones. El coste por línea es bajo por el tamaño de entrada (96 x 768) y los 28,6 M de parámetros, pero no hay cifras oficiales que citar.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni rendimiento cuantitativo de las alternativas en la información proporcionada; se comparan a nivel funcional.

| Modelo / enfoque | Enfoque | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cyrillic-latin-textline-classifier` (este) | ConvNeXt Tiny afinado, clasificación binaria de escritura por línea | Aproximadamente 28,6 M | Imagen de línea 96 x 768 | Apache 2.0 | Pesos en HuggingFace (0,2 GB) |
| Tesseract OSD | Detección de orientación y escritura integrada en Tesseract, sobre imagen de página | No disponible | Imagen de página o bloque | Apache 2.0 | Incluido en Tesseract |
| Heurística sobre rangos Unicode | Reglas sobre el texto ya transcrito por un OCR previo | No aplica | Texto | No aplica | Trivial de implementar, pero requiere una transcripción previa fiable |
| Identificadores de idioma sobre texto (fastText, CLD3) | Clasificación de idioma a partir de texto transcrito | No disponible | Texto | No disponible | Requiere OCR previo; no distinguen escritura, sino idioma |

La diferencia relevante frente a las alternativas es que este modelo decide antes del reconocimiento y a nivel de línea, con etiquetas derivadas de transcripciones reales de archivo y una definición explícita de línea cirílica (presencia de al menos una letra cirílica).

## Limitaciones y advertencias

- No hay conjunto de test independiente en esta versión: las métricas publicadas son de validación y están ligeramente sesgadas al alza porque ese conjunto se usó para seleccionar checkpoint y programar la tasa de aprendizaje.
- Desbalance de clases acusado en entrenamiento y validación (unas tres líneas latinas por cada cirílica), lo que favorece la clase mayoritaria y hace que el recall cirílico (96,6 %) sea inferior a la precisión latina aparente.
- Las líneas compuestas solo por dígitos o puntuación se etiquetan como `latin` por convención, sin tener escritura propia; el autor advierte que no debe confiarse en la decisión del modelo para esos casos.
- Clasifica escritura, no idioma: no distingue finés de sueco ni ruso de búlgaro, y no identifica la lengua de la línea.
- La regla de etiquetado marca como `cyrillic` cualquier línea con una sola palabra cirílica, de modo que líneas mixtas (por ejemplo, latinas con una cita en cirílico) se enrutan al modelo cirílico y pueden transcribirse peor.
- Dominio limitado a documentos históricos manuscritos e impresos de archivos de Estonia, Finlandia y Letonia; no hay datos sobre su comportamiento en texto moderno, capturas de pantalla, formularios o imágenes de baja calidad.
- Redimensionado a 96 x 768 sin respetar la relación de aspecto: líneas muy cortas, muy altas o con anotaciones verticales pueden degradarse.
- No se distribuyen los datos de entrenamiento, lo que limita la reproducibilidad y la auditoría de sesgos por colección, lengua o época.
- No hay información publicada sobre sesgos demográficos, geográficos o de otro tipo, ni sobre robustez frente a dominios distintos de los archivos báltico-nórdicos.
- Riesgo de alucinación no aplica (no genera texto), pero sí de errores silenciosos de enrutado: una línea cirílica clasificada como latina se enviará al reconocedor equivocado y producirá una transcripción inválida sin aviso explícito.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación de avisos; no se especifican restricciones adicionales ni cláusulas de uso responsable más allá de las de la propia licencia.
- El proyecto está financiado por un programa público (Central Baltic Programme) y el modelo tiene un único "like" y cero descargas en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kansallisarkisto/cyrillic-latin-textline-classifier
- Documentación de ConvNeXt Tiny en torchvision (modelo base): https://docs.pytorch.org/vision/main/models/generated/torchvision.models.convnext_tiny.html
- Proyecto ArchXAI (Central Baltic Programme): https://centralbaltic.eu/project/archxai/
- Repositorio o paper del modelo: no disponible en la información proporcionada.
- Demo o Space asociado: no disponible.
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
