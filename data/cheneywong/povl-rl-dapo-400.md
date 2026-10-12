# CheneyWong/povl-rl-dapo-400

## Resumen

`povl-rl-dapo-400` es un checkpoint de un modelo de visión-lenguaje (image-text-to-text) especializado en reconocimiento de tablas dentro de documentos, publicado por el usuario CheneyWong en HuggingFace. Corresponde a la primera ronda de aprendizaje por refuerzo con el algoritmo DAPO tras 400 pasos de entrenamiento, aplicada sobre el checkpoint `CheneyWong/povl-dpo-2ep`, que a su vez desciende del modelo base PaddleOCR-VL-1.6. El modelo tiene 905.601.648 parámetros (~906 M) según los pesos en safetensors y se distribuye con licencia Apache 2.0.

La tarea que resuelve es muy acotada: recibe una única imagen de tabla junto con el prompt textual `Table Recognition:` y, en una sola pasada, emite marcado OTSL mediante los tokens especiales `<fcel>`, `<ecel>`, `<ucel>`, `<lcel>`, `<xcel>` y `<nl>`. No es un modelo conversacional generalista ni un agente, sino un componente de parsing de documentos orientado a la extracción de estructura tabular (table recognition, document parsing).

Su interés actual es fundamentalmente metodológico y experimental: sirve como ejemplo reproducible de aplicación de RL a escala sobre un modelo pequeño de menos de mil millones de parámetros. Conviene señalar que los resultados publicados por el propio autor muestran una degradación del TEDS frente al modelo base en todos los conjuntos evaluados, por lo que este checkpoint debe considerarse un artefacto de investigación más que una mejora lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión-lenguaje image-text-to-text; linaje PaddleOCR-VL; requiere `custom_code` en Transformers) |
| Parametros totales | 905.601.648 (~906 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 1.8 GB) |

## Arquitectura y entrenamiento

El modelo es un VLM (modelo de visión-lenguaje) derivado de PaddleOCR-VL-1.6 y entrenado para una tarea única de reconocimiento de tablas. La entrada es una imagen de tabla más el prompt `Table Recognition:`; la salida es una secuencia de marcado OTSL (Open Table Structure Language) que codifica la estructura de celdas y filas mediante tokens dedicados. El repositorio incluye código personalizado, por lo que la carga requiere `trust_remote_code=True` y una versión de Transformers compatible con el modelo base.

El entrenamiento corresponde a la ronda 1 de refuerzo con el algoritmo DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization), a lo largo de 400 pasos, partiendo del checkpoint `povl-dpo-2ep` (a su vez resultado de un ajuste DPO de 2 épocas). El autor documenta un fallo relevante en el primer intento con GSAPO: el 78 % de los grupos aportaban gradiente cero (49,0 % saturados, 16,5 % con recompensas idénticas y 12,6 % completamente inválidos), con una desviación típica de recompensa de 0,10-0,25; el muestreo dinámico de DAPO elevó esa desviación hasta 0,70. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles de la arquitectura interna (número de capas, dimensión oculta, resolución de imagen o codificador visual).

## Capacidades

- Reconocimiento de estructura de tablas en imágenes: genera marcado OTSL con celdas completas (`<fcel>`), celdas vacías (`<ecel>`), celdas fusionadas horizontal y verticalmente (`<lcel>`, `<ucel>`) y celdas de encabezado o especiales (`<xcel>`).
- Parsing de documentos centrado en tablas: orientado a flujos de digitalización y extracción de datos tabulares desde capturas o páginas escaneadas.
- Inferencia de un solo turno y una sola imagen: no mantiene historial de conversación ni procesa múltiples imágenes por petición de forma documentada.
- Integración con el ecosistema Transformers mediante pipeline `image-text-to-text` y código personalizado.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, matemáticas, generación de código, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes con tablas: el modelo convierte una captura o un render de la página en OTSL estructurado, que después se puede post-procesar a CSV, JSON o HTML para alimentar un ERP. Es adecuado porque la salida es estructura pura, sin texto libre que requiera parsing adicional.
- Extracción de tablas de informes financieros y anuales: en pipelines de análisis documental, la salida OTSL preserva el anidamiento de filas y columnas, lo que permite reconstruir la jerarquía de encabezados antes de volcar los datos a una base analítica.
- Preprocesado de documentación técnica y fichas de producto: conversión de catálogos escaneados con tablas de especificaciones a formatos tabulares consultables, aprovechando que el modelo trabaja con una imagen y un prompt fijo, fácil de encadenar en lotes.
- Investigación en aprendizaje por refuerzo aplicado a VLMs pequeños: el checkpoint es un caso de estudio reproducible de DAPO sobre un modelo de ~906 M de parámetros, útil para experimentar con muestreo dinámico y funciones de recompensa basadas en similitud estructural.
- Evaluación comparativa de métricas de tabla: sirve como punto de referencia para medir TEDS y TEDS-S en conjuntos como PubTabNet, OmniDocBench o OCRBench-v2, y para estudiar el efecto del RL sobre un modelo ya ajustado con DPO.
- Prototipado de herramientas de accesibilidad documental: transcripción de tablas contenidas en documentos escaneados a marcado estructurado que después puede re-renderizarse como HTML accesible para lectores de pantalla.
- Generación de datos sintéticos de estructura tabular: al producir OTSL a partir de imágenes, puede emplearse para etiquetar automáticamente corpus de imágenes de tablas, siempre con revisión humana dado el riesgo de error estructural.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos públicos. "Base" es el modelo base sin modificar. La columna "Ours" corresponde a este checkpoint. Los conjuntos marcados con "?" no tienen cifras publicadas.

| Dataset | n | Base TEDS | Ours TEDS | d TEDS | Base TEDS-S | Ours TEDS-S | d TEDS-S |
|---|---:|---:|---:|---:|---:|---:|---:|
| PubTabNet / ICDAR | 2000 | 0.9297 | 0.9294 | -0.0003 | 0.9464 | 0.9426 | -0.0037 |
| TableVerse-5K | 4951 | 0.8608 | 0.8368 | -0.0240 | 0.9101 | 0.8920 | -0.0181 |
| OmniDocBench v1.5 | 512 | 0.9580 | 0.9308 | -0.0272 | 0.9797 | 0.9626 | -0.0171 |
| OmniDocBench v1.6 | 665 | 0.9492 | 0.9162 | -0.0331 | 0.9753 | 0.9540 | -0.0213 |
| CC-OCR | 300 | 0.8304 | 0.7823 | -0.0481 | 0.8762 | 0.8312 | -0.0450 |
| OCRBench-v2 | 681 | 0.8120 | 0.8016 | -0.0104 | 0.8526 | 0.8402 | -0.0124 |
| Real5 (re-shot OmniDoc) | 1320 | 0.8930 | 0.8562 | -0.0368 | 0.9307 | 0.8954 | -0.0353 |
| Overall (peso igual) | - | 0.8904 | 0.8647 | -0.0257 | 0.9244 | 0.9026 | -0.0218 |
| PubTables-1M | ? | ? | ? | ? | ? | ? | ? |
| PubTables-v2 | ? | ? | ? | ? | ? | ? | ? |
| FinTabNet (OTSL) | ? | ? | ? | ? | ? | ? | ? |
| SynthTabNet | ? | ? | ? | ? | ? | ? | ? |
| SPRINT-MUSTARD | ? | ? | ? | ? | ? | ? | ? |
| TABLET | ? | ? | ? | ? | ? | ? | ? |

El autor advierte que en SPRINT-MUSTARD el ground truth no contiene texto de celda, por lo que su TEDS (~0,22) mide la reproducción de celdas vacías y debe ignorarse; solo la columna TEDS-S es significativa en ese conjunto. No se han publicado resultados en la información disponible para el resto de conjuntos listados como "?". Los benchmarks internos del proyecto quedan excluidos explícitamente de la model card.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,8-2,0 GB en FP16/BF16, en torno a 0,9-1,0 GB en cuantización de 8 bits y 0,5-0,6 GB en 4 bits, calculado a partir de los 906 M de parámetros. Hay que sumar la memoria de activaciones del codificador visual y de los tokens de imagen, no cuantificada en la información disponible.
- Cabe en GPU de consumo: cualquier tarjeta con 6-8 GB de VRAM o más debería ser suficiente para inferencia en FP16 (por ejemplo, RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090). En 4 bits cabría incluso en iGPU con memoria unificada, siempre que el runtime lo permita.
- GPU de centro de datos: A100, H100 o L40S son compatibles pero sobredimensionadas para el tamaño del modelo; su uso tendría sentido solo para servir lotes grandes en paralelo.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y el pipeline `image-text-to-text` es la vía documentada. vLLM, TGI, llama.cpp u Ollama no se mencionan en la información disponible; dada la dependencia de `custom_code` y la ausencia de pesos GGUF en el repositorio, no se puede confirmar su compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TEDS OmniDocBench v1.6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| povl-rl-dapo-400 | 906 M | no disponible | 0.9162 (TEDS-S 0.9540) | Apache 2.0 | HuggingFace (`CheneyWong/povl-rl-dapo-400`) |
| PaddleOCR-VL-1.6 (base del linaje) | no disponible | no disponible | 0.9492 (TEDS-S 0.9753) como "Base" | no disponible | no disponible en la información proporcionada |
| povl-dpo-2ep (predecesor directo) | no disponible | no disponible | no disponible | no disponible | HuggingFace (`CheneyWong/povl-dpo-2ep`) |

La información disponible no incluye cifras comparables de otros modelos de parsing de documentos (por ejemplo, alternativas de la familia PaddleOCR-VL, GOT-OCR2.0 o Nougat), por lo que no se puede establecer una comparativa cuantitativa con ellos. Los únicos puntos de referencia numéricos son el modelo base y el propio checkpoint, y en ambos casos el checkpoint RL queda por debajo del base.

## Limitaciones y advertencias

- Degradación frente al base: el checkpoint pierde TEDS en todos los conjuntos con datos publicados (Overall -0,0257 en TEDS y -0,0218 en TEDS-S), con caídas especialmente marcadas en CC-OCR (-0,0481) y OmniDocBench v1.6 (-0,0331).
- Dependencia del muestreo dinámico: el propio autor indica que el modelo "solo funciona con el muestreo dinámico de DAPO". El primer intento con GSAPO dejó el 78 % de los grupos con gradiente cero, por lo que reproducir el entrenamiento requiere esa configuración concreta.
- Tarea extremadamente restringida: entrada de una sola imagen más el prompt fijo `Table Recognition:`, una única pasada y salida limitada a marcado OTSL. No admite diálogo multi-turno, múltiples imágenes ni instrucciones libres.
- Riesgo de alucinación estructural: al generar estructura de celdas, el modelo puede inventar o fusionar celdas incorrectamente; los casos con ground truth sin texto de celda (SPRINT-MUSTARD) muestran que las métricas de texto pueden ser engañosas y que la fidelidad estructural debe validarse aparte.
- Idiomas soportados no declarados, lo que impide garantizar cobertura multilingüe en documentos reales.
- Ausencia de cuantizaciones publicadas: no hay pesos GGUF ni versiones cuantizadas en el repositorio, por lo que el despliegue en runtimes ligeros exige conversión propia.
- Licencia Apache 2.0: permite uso comercial del checkpoint, pero el modelo base y las dependencias del linaje PaddleOCR-VL pueden arrastrar condiciones propias que no se detallan en la información disponible.
- Madurez baja del artefacto: 4 descargas y 0 likes en el momento de la consulta, sin resultados publicados en varios de los conjuntos de referencia (PubTables, FinTabNet, SynthTabNet, TABLET) y con los benchmarks internos del proyecto excluidos explícitamente.
- No apto para producción sin validación previa: dado el retroceso medido frente al modelo base, no hay justificación documentada para sustituir al base por este checkpoint en un sistema en explotación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CheneyWong/povl-rl-dapo-400
- Checkpoint predecesor (DPO): https://huggingface.co/CheneyWong/povl-dpo-2ep
- Repositorio de DAPO: https://github.com/BytedTsinghua-SIA/DAPO
- Paper de DAPO en arXiv: https://arxiv.org/abs/2503.14476
- PDF de DAPO en NeurIPS 2025: https://papers.neurips.cc/paper_files/paper/2025/file/a4277440d50f1f15d2cb4c14f7e0c0d2-Paper-Conference.pdf
- Resumen divulgativo de DAPO: https://www.beri.net/learning/dapo-open-source-llm-rl-system
- Artículo sobre DAPO (AI前沿): https://www.ai-club.cn/frontier-article/29687
