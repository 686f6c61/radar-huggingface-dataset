# KhangTruong/Detective-SAM-small-Casia-v2.0

## Resumen

Detective-SAM-small-Casia-v2.0 es un modelo de segmentación de imágenes orientado a la detección de imágenes sintéticas generadas por difusión. Lo publica el usuario KhangTruong en Hugging Face bajo licencia Apache 2.0 y se distribuye como checkpoints de PyTorch para la librería `sid-unet`, con pipeline declarado `image-segmentation`. El repositorio ocupa 0,6 GB e incluye configuración, manifiesto de versiones, checkpoints y reportes de evaluación.

El modelo se presenta como la versión v2.0 de una familia "Detective-SAM" con variante "small" y sufijo "Casia", lo que sugiere un entrenamiento o evaluación sobre el conjunto CASIA (habitual en detección de imágenes manipuladas o sintéticas). La información pública disponible es muy limitada: no se especifican parámetros, longitud de contexto (no aplica, al ser un modelo de visión), composición del dataset ni resultados de benchmarks más allá de una única métrica de validación.

La relevancia actual del modelo radica en su tarea: distinguir y localizar píxeles pertenecientes a imágenes generadas por modelos de difusión, un problema creciente para moderación de contenido, verificación de autenticidad y pipelines de datos. No obstante, el mejor score de validación reportado (0,2517 en la época 5) es bajo en términos absolutos, y el autor no documenta la métrica empleada, lo que limita seriamente su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SID-UNet (según tag `sid-unet`; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch `.pt`; no se publican versiones GGUF/ONNX) |
| Idiomas soportados | no disponible (no aplica a la tarea principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`: `checkpoint_best.pt`, `checkpoint_latest.pt`, `checkpoint_periodic.pt`) |

## Arquitectura y entrenamiento

La model card etiqueta el modelo con la arquitectura `sid-unet`, lo que apunta a una U-Net adaptada para segmentación de imágenes sintéticas (SID, *synthetic image detection*). No se detallan el número de parámetros, la profundidad del encoder/decoder, el uso de atención, ni si incorpora componentes de SAM (el nombre "Detective-SAM" sugiere alguna relación con Segment Anything, pero no se confirma en la documentación). El repositorio incluye un `config.yaml` que presumiblemente contiene la definición completa, pero su contenido no está disponible en la información proporcionada.

En cuanto al entrenamiento, la model card indica un total de 5 épocas y una mejor validación en la época 5 con un score de 0,25174492285173633. No se especifica el número de tokens o imágenes de entrenamiento, la composición del dataset, si se usó CASIA como fuente principal, ni si hubo etapas de ajuste fino, aumento de datos o entrenamiento adversarial. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal (no aplicables a este tipo de modelo). El flujo de trabajo se gestiona con las herramientas `sid-pull`, `sid-train` y `sid-push`, lo que indica un pipeline propietario de gestión de checkpoints.

## Capacidades

- Segmentación de imágenes a nivel de píxel para detectar regiones generadas por modelos de difusión.
- Clasificación implícita de imágenes como reales o sintéticas a partir del mapa de segmentación.
- Detección de imágenes sintéticas (*synthetic-image-detection*) y de difusión (*diffusion-detection*), según los tags del repositorio.
- Integración con el ecosistema `sid-unet` para entrenamiento, reanudación y publicación de checkpoints.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de segmentación).
- No se documentan capacidades multilingües, de texto, audio o vídeo.
- No se documenta un modo "thinking" ni capacidades generativas.

## Casos de uso

- Moderación de contenido en plataformas: el modelo puede generar máscaras de píxeles sospechosos de haber sido generados por difusión, lo que permite a los equipos de confianza y seguridad priorizar la revisión manual de las regiones marcadas en lugar de la imagen completa.
- Verificación de autenticidad en medios: en redacciones o agencias de verificación, el mapa de segmentación ayuda a documentar qué partes de una imagen son probablemente sintéticas, aportando evidencia visual al análisis periodístico.
- Filtrado de datasets de entrenamiento: antes de entrenar otros modelos generativos o de visión, se puede pasar el segmentador sobre el corpus para descartar o aislar imágenes sintéticas y reducir la contaminación del dataset.
- Detección de *deepfakes* estáticos en imágenes de perfil: en servicios de identidad o redes sociales, el modelo puede señalar regiones manipuladas en fotos de usuario como primera capa de un sistema de verificación.
- Investigación en forense digital: como baseline reproducible (Apache 2.0) para comparar técnicas de detección de difusión y estudiar la transferibilidad entre generadores.
- Análisis de procedencia en pipelines de datos científicos: para marcar figuras o imágenes sospechosas en preprints y repositorios, apoyando la revisión por pares.
- Integración en herramientas de anotación: el mapa de segmentación puede precargar máscaras en plataformas de etiquetado para acelerar la revisión humana.

## Benchmarks y rendimiento

La única métrica publicada es el mejor score de validación de la versión activa `v1`:

| Version | Best metric score | Best epoch | Updated |
|---|---|---|---|
| v1 | 0,25174492285173633 | 5 | 2026-11-04 |

No se especifica qué métrica corresponde ese valor (podría ser IoU, Dice, F1 o una métrica compuesta), ni se publican resultados en MMLU, HumanEval, GSM8K u otros benchmarks estándar (no aplicables). Tampoco se ofrecen comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al tratarse de una variante "small" de U-Net con repositorio de 0,6 GB (incluyendo checkpoints y reportes), es plausible que el checkpoint activo ocupe unos cientos de MB, pero no se confirma.
- GPU recomendadas: no disponibles; por el tamaño del repositorio, cabría esperar ejecución en GPUs de consumo (RTX 3060/4060 en adelante), pero es una inferencia no verificada.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del repositorio, pero no está documentado.
- Opciones de despliegue: el flujo oficial es `sid-pull` / `sid-train` / `sid-push` con PyTorch. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (estos últimos no aplican a un modelo de segmentación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada. Como referencia cualitativa de la categoría (detección/segmentación de imágenes sintéticas), podrían considerarse trabajos como *NPR* (Neighboring Pixel Relationships), *UniversalFakeDetect* o variantes de *CLIP-based detectors*, pero no se han proporcionado resultados de este modelo frente a ellos, por lo que la comparación numérica no está disponible.

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Detective-SAM-small-Casia-v2.0 | Segmentación de imágenes sintéticas | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Alternativas de la categoría | Detección de imágenes sintéticas | no disponible | no aplica | variable | no disponible |

## Limitaciones y advertencias

- El mejor score de validación reportado (0,2517) es bajo y no se especifica la métrica, lo que impide valorar su utilidad real en producción.
- Solo se han entrenado 5 épocas según la model card; es probable que el modelo esté infraentrenado.
- No se documenta el dataset de entrenamiento ni la procedencia de las imágenes "Casia", lo que dificulta evaluar sesgos y generalización.
- Riesgo de falsos positivos y negativos en imágenes reales con texturas, ruido o compresión que imiten artefactos de difusión.
- No se documentan sesgos demográficos, geográficos o de contenido; al ser un modelo de visión, pueden aparecer sesgos heredados del dataset no declarado.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el origen de los datos de entrenamiento puede plantear dudas de cumplimiento.
- No hay garantías de robustez frente a generadores de difusión no vistos durante el entrenamiento (problema conocido de generalización en detección de imágenes sintéticas).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por la comunidad.
- El pipeline `sid-unet` es poco común; la integración con herramientas estándar (PyTorch puro, ONNX) no está documentada.

## Enlaces

- Hugging Face: https://huggingface.co/KhangTruong/Detective-SAM-small-Casia-v2.0
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
