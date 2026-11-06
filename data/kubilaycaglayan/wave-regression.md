# kubilaycaglayan/wave-regression

## Resumen

Wave Regression es un modelo de regresión de imagen publicado por el desarrollador independiente kubilaycaglayan. Su función es estimar la "ondulación visual relativa" del agua del mar en una fotografía, devolviendo una puntuación continua entre 0 (aspecto tranquilo) y 1 (aspecto agitado) a partir de valoraciones manuales. No estima altura física de ola ni asigna una categoría de estado del mar.

El modelo no es un LLM ni un transformer generativo: es un pipeline de inferencia compuesto por dos redes convolucionales en formato ONNX. El regresor principal es un EfficientNet-B0 con backbone congelado preentrenado en ImageNet y una cabeza de regresión sigmoide entrenada; se complementa con un segmentador SegFormer-B0 que aísla la región de agua antes de la predicción. El artefacto publicado corresponde al perfil "fast-v2.2", seleccionado por defecto en el proyecto de desarrollo del autor.

Es relevante ahora por su enfoque de contrato de preprocesado explícito y reproducible: el repositorio publica hashes SHA-256 de los artefactos, métricas de validación y test, y un fichero `preprocessing.json` con umbrales exactos. Aun así, se trata de un experimento de aprendizaje con un conjunto de datos muy reducido y etiquetas subjetivas de un único anotador, por lo que su uso en producción está fuertemente limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (backbone congelado ImageNet) con cabeza de regresión sigmoide; segmentador auxiliar SegFormer-B0 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224 RGB tras preprocesado) |
| Tipos de cuantizacion | FP16 en el segmentador (MIGraphX); regresor en ONNX Runtime CPU (precisión no especificada) |
| Idiomas soportados | en (etiquetas y documentación en inglés; la tarea es visual, no lingüística) |
| Licencia | MIT |
| Formato de pesos | ONNX (`regressor-fast-v2.2.onnx`, `segformer-b0-step1-448.onnx`); checkpoint PyTorch legacy `model.ckpt` (v19) |

## Arquitectura y entrenamiento

El pipeline consta de dos etapas. Primero, un segmentador SegFormer-B0 a resolución 448×448 genera una máscara de agua; después, un selector de recorte prioriza la retención del 35% inferior del agua detectada y descarta casos sin recorte fiable. El recorte se proyecta a la foto original, se redimensiona con Lanczos4, se centra en un lienzo negro de 224×224 y se enmascaran los píxeles no acuáticos. Finalmente, el regresor EfficientNet-B0 con backbone congelado y cabeza sigmoide produce la puntuación.

El entrenamiento corresponde a la ejecución `20261102T102000Z`, con época 15 seleccionada. Las etiquetas son valoraciones manuales de una sola persona sobre una colección pequeña de fotos, mayoritariamente desde puntos de vista costeros recurrentes. No se documenta el volumen exacto del dataset de entrenamiento ni la composición de tokens (no aplica). El autor indica que existe un checkpoint PyTorch v21 más reciente como ejecución de entrenamiento, pero no es el seleccionado por el predictor por defecto; el v19 permanece como artefacto legacy.

## Capacidades

- Regresión visual de ondulación del mar: salida continua en [0, 1] a partir de una fotografía.
- Segmentación de agua como etapa auxiliar del pipeline (SegFormer-B0).
- Preprocesado determinista y documentado: decodificación JPEG/PNG/HEIC/HEIF, orientación EXIF, normalización ImageNet, reencode JPEG calidad 95 con submuestreo de croma 4:4:4.
- Ejecución en CPU mediante ONNX Runtime para el regresor y en GPU AMD vía MIGraphX FP16 para el segmentador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modos de pensamiento, visión general o audio.

## Casos de uso

- Monitorización costera experimental: procesar capturas periódicas de una cámara fija en un mismo punto de la costa para obtener una serie temporal de ondulación relativa, aprovechando que el modelo fue entrenado con vistas recurrentes similares.
- Filtrado y triaje de archivos fotográficos: clasificar automáticamente lotes de imágenes marinas por aspecto calmado o agitado para seleccionar material en flujos de edición o catalogación.
- Investigación sobre percepción visual del oleaje: usar la puntuación como proxy subjetivo comparable entre imágenes en estudios piloto, siempre con validación humana.
- Prototipado de aplicaciones de observación marina: integrar el pipeline ONNX en una app o servicio que muestre un indicador cualitativo de "aspecto del mar" a partir de una foto del usuario.
- Docencia y experimentación en visión por computador: ejemplo completo de pipeline con segmentación, selección de recorte, contrato de preprocesado y métricas de regresión reproducible.
- Verificación de pipelines de inferencia: los hashes SHA-256 y el `preprocessing.json` permiten auditar que la implementación desplegada coincide exactamente con los artefactos publicados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MAE validación | 0,0985 |
| RMSE validación | 0,1241 |
| MAE test held-out | 0,1324 (46 fotos) |
| RMSE test held-out | 0,1788 (46 fotos) |

No se han publicado comparaciones con otros modelos en la información disponible. El conjunto de test es de solo 46 fotografías, por lo que la variabilidad de estas métricas es alta.

## Requisitos de hardware

- VRAM estimada: el segmentador SegFormer-B0 a 448×448 en FP16 requiere del orden de 1-2 GB; el regresor EfficientNet-B0 a 224×224 es muy ligero (menos de 1 GB en FP32).
- GPU recomendadas: el autor documenta MIGraphX/ROCm sobre GPU AMD para el segmentador; el regresor corre en CPU con ONNX Runtime. Cualquier GPU consumer moderna (RTX 3060 o superior) es sobrada para el segmentador.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más, e incluso en CPU para el regresor.
- Opciones de despliegue: ONNX Runtime (CPU), ONNX Runtime con MIGraphX (GPU AMD), y cualquier runtime compatible con ONNX (por ejemplo, TensorRT u OpenVINO) previa validación del contrato de preprocesado.
- Latencia y throughput: no disponibles. El tamaño del repositorio es de 0,1 GB.
- Entorno de referencia: Python 3.12 con MIGraphX/ROCm según el repositorio de desarrollo del autor.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wave Regression (este) | Regresión de ondulación visual del mar | EfficientNet-B0 + SegFormer-B0 | no disponible | 224×224 RGB preprocesado | MIT | Hugging Face, ONNX |
| EfficientNet-B0 (ImageNet) | Clasificación de imagen general | CNN | ~5,3 M | 224×224 | Apache-2.0 (referencia) | Amplia |
| SegFormer-B0 (ADE20K) | Segmentación semántica | Transformer jerárquico | ~3,7 M | resolución variable | NVIDIA Source Code License | Amplia |
| CLIP ViT-B/32 | Embeddings imagen-texto | Transformer dual | ~151 M | 224×224 | MIT | Amplia |

La comparación es orientativa: los modelos de referencia son componentes genéricos, no alternativas directas a la tarea de regresión de oleaje. No se conocen modelos públicos equivalentes específicos para esta tarea en la información disponible.

## Limitaciones y advertencias

- Etiquetas subjetivas asignadas por una sola persona sobre un conjunto pequeño de fotos, principalmente desde puntos de vista costeros recurrentes; el rendimiento en otras localizaciones, ángulos, cámaras e iluminación es desconocido.
- La salida es una estimación de apariencia visual, no de altura física de ola ni de estado del mar; no debe usarse para navegación, baño, surf, avisos o seguridad.
- Riesgo elevado de sobreajuste a los encuadres y condiciones de entrenamiento; el test held-out es de solo 46 imágenes.
- El preprocesado es obligatorio y estricto: redimensionar directamente una foto a 224×224 y pasarla al regresor produce resultados inválidos.
- El entorno de referencia requiere Python 3.12 con MIGraphX/ROCm; portar el pipeline a otros runtimes exige replicar el contrato de `preprocessing.json` y validar los hashes.
- El checkpoint v21 PyTorch es más reciente como entrenamiento pero no es el desplegado por defecto; no debe asumirse equivalencia entre artefactos.
- Licencia MIT: permite uso comercial, pero el autor declara el proyecto como material de aprendizaje y experimentación, sin garantías de idoneidad.
- Idiomas: la documentación y etiquetas están en inglés; la tarea no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kubilaycaglayan/wave-regression
- Repositorio de desarrollo: https://github.com/kubilaycaglayan/wave-regression-model
- Servidor de referencia Step 7 MIGraphX: https://github.com/kubilaycaglayan/wave-regression-model/blob/main/step_7_i_migraphx_server.py
- Punto de entrada de predicción: https://github.com/kubilaycaglayan/wave-regression-model/blob/main/step_7_a_predict.py
- Artefacto del regresor: https://huggingface.co/kubilaycaglayan/wave-regression/blob/main/regressor-fast-v2.2.onnx
- Artefacto del segmentador: https://huggingface.co/kubilaycaglayan/wave-regression/blob/main/segformer-b0-step1-448.onnx
- Configuración: https://huggingface.co/kubilaycaglayan/wave-regression/blob/main/config.json
- Contrato de preprocesado: https://huggingface.co/kubilaycaglayan/wave-regression/blob/main/preprocessing.json
