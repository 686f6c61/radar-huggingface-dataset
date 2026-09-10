# Purino/mobilenetv2-nih-chestxray-4class

## Resumen

MobileNetV2 fine-tuned on NIH ChestX-ray14 es un clasificador de imágenes médicas publicado por el usuario Purino en HuggingFace. Se trata de un MobileNetV2 preentrenado en ImageNet1k y ajustado para una tarea de clasificación **monoetiqueta** (single-label, softmax) sobre cuatro patologías torácicas frecuentes del conjunto NIH ChestX-ray14: Infiltration, Atelectasis, Effusion y Nodule. El modelo tiene 2.263.108 parámetros (unos 9 MB en fp32) y licencia MIT, lo que lo sitúa en la categoría de modelos ultraligeros aptos para CPU y dispositivos de borde.

El problema que aborda es el de la clasificación automática de radiografías de tórax con fines de investigación, con un interés especial en la **explicabilidad**: la arquitectura conserva un único clasificador lineal tras el pooling global, lo que la hace directamente compatible con CAM y Grad-CAM. El autor incluye un script de ejemplo (`inference_gradcam_example.py`) para generar mapas de calor y compararlos cualitativamente con las cajas delimitadoras anotadas por radiólogos en `BBox_List_2017.csv`.

Su relevancia es limitada pero concreta: es un modelo pequeño, reproducible y bien documentado en cuanto a sus limitaciones (subconjunto de 8.000 de las 112.120 imágenes originales, solo imágenes monoenfermedad, etiquetas generadas por NLP con ruido estimado del 10 %). No es un modelo de producción clínica ni compite con clasificadores multi-etiqueta entrenados sobre el dataset completo; su valor está en la experimentación académica, la docencia y la generación de heatmaps verificables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN convolucional, bloques residuales invertidos con cuellos de botella lineales), preentrenada en ImageNet1k |
| Parametros totales | 2.263.108 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada en píxeles, no secuencias de texto) |
| Resolución de entrada | no especificada en la model card (MobileNetV2 estándar de torchvision: 224 × 224) |
| Tipos de cuantizacion | no disponible: el autor no publica variantes cuantizadas; al ser un modelo de 2,26 M de parámetros es cuantizable a fp16/INT8 con las herramientas estándar de PyTorch |
| Idiomas soportados | no aplica: clasificación de imágenes; la model card no declara idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json`; compatible con `torchvision.models.mobilenet_v2` |
| Numero de clases | 4 (Infiltration, Atelectasis, Effusion, Nodule), salida softmax monoetiqueta |
| Metrica objetivo | Macro-AUROC (one-vs-rest) |
| Dataset de entrenamiento | nih-chest-xrays/data (subconjunto equilibrado de 8.000 imágenes) |
| Pipeline en HuggingFace | image-classification |
| Descargas / likes | 0 / 0 |
| Fecha de publicación en HuggingFace | 10/09/2026 (creación y última actualización) |
| Tamaño del repositorio | 0,0 GB (según metadatos) |

## Arquitectura y entrenamiento

La arquitectura es un MobileNetV2 estándar: extracción de características convolucionales en `model.features`, un `AdaptiveAvgPool2d` y un único clasificador lineal (`model.classifier[1]`) con 4 salidas y activación softmax. El autor justifica explícitamente esta elección por su compatibilidad con CAM (Zhou et al.) y Grad-CAM: al no existir capas totalmente conectadas intermedias, basta con enganchar un hook en `model.features[-1]` para obtener el mapa de características previo al pooling global. El recuento de parámetros es coherente con esa estructura: los 2,26 M de parámetros corresponden al extractor más un clasificador de 1.280 × 4 + 4 pesos, frente a los ~3,5 M del MobileNetV2 completo de 1.000 clases.

El entrenamiento parte de pesos preentrenados en ImageNet1k y se realiza sobre un subconjunto **equilibrado** de 8.000 imágenes del conjunto NIH ChestX-ray14 (112.120 imágenes en total), restringido a imágenes con una única patología de las cuatro seleccionadas; se descartan las imágenes "No Finding" y las multi-patología. La división train/val/test se hace por **Patient ID** para evitar fugas de datos (los ficheros `train_split.csv`, `val_split.csv` y `test_split.csv` documentan la asignación exacta). Se aplica precisión mixta, batch grande y *early stopping* según el Macro-AUROC de validación. No se documenta el uso de RLHF, DPO ni ningún ajuste por preferencias, algo esperable en un modelo de clasificación de imágenes. La model card no detalla el número de épocas, el optimizador, la tasa de aprendizaje ni las augmentaciones aplicadas.

## Capacidades

- Clasificación monoetiqueta de radiografías de tórax en 4 clases: Infiltration, Atelectasis, Effusion y Nodule.
- Salida probabilística por clase mediante softmax (4 logits), con índice de clase argmax.
- Explicabilidad integrada: compatible con CAM y Grad-CAM mediante hook en `model.features[-1]`; el repositorio incluye `inference_gradcam_example.py` funcional.
- Verificación cualitativa de los mapas de calor contra las cajas delimitadoras de `BBox_List_2017.csv` (anotaciones de radiólogos sobre ~1.000 imágenes del dataset original).
- Inferencia por lotes sobre imágenes individuales (clasificación de una etiqueta por imagen, no multi-etiqueta).
- Ejecución en CPU y en GPU de gama baja por su tamaño reducido (2,26 M de parámetros).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo "thinking", ni visión general (solo radiografía de tórax), ni audio.

## Casos de uso

- **Preanotación de datasets de investigación**: el modelo puede etiquetar automáticamente radiografías candidatas con una de las cuatro patologías para priorizar la revisión manual, teniendo en cuenta que su accuracy de test es 0,5339 y que se debe validar cada etiqueta.
- **Generación de mapas Grad-CAM para auditoría**: gracias a su estructura de un único clasificador lineal, se puede obtener el heatmap de la región que activa la predicción y contrastarlo con las cajas de `BBox_List_2017.csv` para medir si el modelo mira la zona anatómica correcta.
- **Docencia en imagen médica y cursos de XAI**: modelo lo bastante pequeño para entrenar y depurar en un portátil o en una GPU T4, con un script de Grad-CAM ya listo, lo que permite ilustrar el flujo completo (clasificación, atención visual, límites del etiquetado débil).
- **Filtrado y limpieza de corpus radiológicos**: como clasificador de descarte, sirve para separar imágenes que contienen una de las cuatro patologías de interés del resto, antes de un etiquetado más costoso o de un modelo mayor.
- **Línea base (baseline) en experimentos académicos**: al ser un MobileNetV2 con un clasificador lineal único, es un punto de comparación reproducible frente a alternativas más grandes (DenseNet-121, EfficientNet) en estudios sobre el mismo subconjunto de 8.000 imágenes.
- **Demostración en dispositivos de borde**: con unos 9 MB en fp32, cabe en una Raspberry Pi, un Jetson Nano o un móvil, de modo que puede servir para prototipos de triaje offline en entornos sin conectividad.
- **Estudios de robustez y sesgo**: permite medir cómo degrada el AUROC al aplicar el modelo a imágenes de otras fuentes (CheXpert, MIMIC-CXR) o a subgrupos demográficos, ya que el autor no reporta validación externa.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Métrica | Conjunto | Valor |
|---|---|---|
| Macro-AUROC (OVR), mejor época | Validación | 0,7697 |
| Macro-AUROC (OVR) | Test | 0,7895 |
| Accuracy | Test | 0,5339 |

No se han publicado resultados por clase (AUROC individual de Infiltration, Atelectasis, Effusion o Nodule), ni comparaciones con CheXNet u otros modelos sobre el mismo subconjunto, ni métricas de calibración, sensibilidad o especificidad. La model card no incluye resultados de benchmarks de propósito general porque el modelo no es un LLM. Como referencia, la línea base aleatoria en un problema balanceado de 4 clases es 0,25 de accuracy, de modo que el 0,5339 de test está por encima del azar pero lejos de un uso discriminativo fino, algo coherente con el Macro-AUROC de ~0,79.

## Requisitos de hardware

- **Peso del modelo**: 2.263.108 parámetros → aproximadamente 9 MB en fp32 y 4,5 MB en fp16 (sin contar el fichero de configuración).
- **VRAM para inferencia**: menos de 1 GB en cualquier configuración razonable (batch pequeño a 224 × 224); el cuello de botella real es la carga y el redimensionado de imágenes, no el modelo.
- **GPU recomendadas**: cualquiera con soporte CUDA, incluidas GTX 1050 Ti, RTX 3060, RTX 4090, T4, A100 o H100. Un modelo de este tamaño no aprovecha la capacidad de las GPU de gama alta salvo en lotes muy grandes.
- **GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo e integrada; también funciona en CPU y en placas como Raspberry Pi 4/5 o Jetson Nano.
- **Opciones de despliegue**: PyTorch + torchvision (ruta oficial de la model card), exportación a TorchScript u ONNX (no publicada por el autor, hay que generarla), servidores de inferencia tipo TorchServe, Triton o FastAPI/BentoML, y demos con Gradio o Streamlit para visualizar Grad-CAM. No aplican llama.cpp, Ollama, vLLM ni TGI, que son herramientas para modelos de lenguaje.
- **Latencia y throughput**: no disponible. El autor no publica mediciones. Como referencia del modelo base en la literatura, MobileNetV2 a 224 × 224 ronda los 300 millones de MACs, lo que se traduce en decenas de imágenes por segundo en CPU moderna y varios cientos en GPU, si bien esta cifra no ha sido verificada en este repositorio.

## Comparativa con modelos similares

Los valores de parámetros de las alternativas proceden de la literatura general de cada arquitectura y no han sido verificados en la búsqueda realizada; los del modelo de esta ficha proceden de su model card y de los metadatos de safetensors.

| Modelo | Parámetros | Clases / tarea | Etiquetado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Purino/mobilenetv2-nih-chestxray-4class | 2,26 M (dato real) | 4 clases, monoetiqueta | Débil (NLP sobre informes) | MIT | HuggingFace, 0 descargas |
| MobileNetV2 original (torchvision) | ~3,5 M (referencia) | 1.000 clases, imagen natural | Supervisado manual (ImageNet) | BSD-3 (torchvision) | Ampliamente disponible |
| CheXNet (DenseNet-121) | ~8 M (referencia) | 14 clases, multietiqueta | Débil (NLP) | Investigación / según implementación | Reproducciones de terceros |
| torchxrayvision (DenseNet-121 / ResNet-50) | ~8 M / ~25 M (referencia) | 14-18 clases, multietiqueta, varios datasets | Débil (NLP) | Según pesos (a menudo no comercial) | Repositorio público |

Diferencias clave: este modelo es **monoetiqueta** y cubre 4 de las 14 patologías, frente al enfoque multietiqueta de CheXNet o torchxrayvision; su ventana de aplicación es, por tanto, mucho más estrecha. A cambio, es entre tres y diez veces más pequeño, con licencia MIT permisiva para uso comercial, y su arquitectura de clasificador único simplifica la generación de CAM. No hay datos públicos que permitan comparar AUROC entre estas alternativas sobre el mismo subconjunto de 8.000 imágenes.

## Limitaciones y advertencias

- **Cobertura de entrenamiento muy reducida**: solo 8.000 de las 112.120 imágenes del dataset original, y únicamente imágenes con una única patología de las cuatro elegidas. El modelo no maneja imágenes multi-patología ni el resto de las 14 etiquetas de NIH ChestX-ray14.
- **Clasificación monoetiqueta forzada**: la salida softmax obliga a asignar una de las cuatro clases incluso cuando la imagen es normal ("No Finding") o presenta otra patología, lo que produce falsos positivos sistemáticos en esos casos.
- **Etiquetas ruidosas**: las anotaciones originales se extrajeron automáticamente de informes radiológicos mediante NLP (NegBio/DNorm), con una precisión estimada del 90 %; no hay revisión manual imagen por imagen. El techo de rendimiento del modelo está limitado por ese ruido.
- **Rendimiento modesto**: accuracy de test de 0,5339 en un problema equilibrado de 4 clases. Insuficiente para cualquier decisión con consecuencias clínicas.
- **Prohibido su uso diagnóstico**: el autor indica explícitamente que es un modelo de investigación y docencia, no una herramienta clínica. No dispone de marcado CE ni de autorización regulatoria como producto sanitario en la UE.
- **Sin validación externa**: no se reportan resultados sobre CheXpert, MIMIC-CXR ni otros conjuntos, por lo que se desconoce el comportamiento ante cambios de distribución, equipos o poblaciones.
- **Riesgo de sesgo**: el conjunto NIH ChestX-ray14 procede de una única institución y tiene una representación demográfica limitada; no se han evaluado sesgos por sexo, edad, etnia ni por dispositivo de adquisición.
- **Probabilidades no calibradas**: no se publican métricas de calibración (ECE, Brier), por lo que no conviene usar los valores de softmax como probabilidades clínicas.
- **Resolución de entrada no documentada**: la model card no especifica el tamaño de imagen usado en entrenamiento ni las augmentaciones, lo que dificulta reproducir exactamente el preprocesado.
- **Licencia MIT y uso comercial**: la licencia permite el uso comercial del artefacto, pero no exime de las obligaciones regulatorias aplicables si se integra en un producto sanitario.
- **Sin tracción comunitaria**: 0 descargas y 0 likes en el momento de la consulta, sin ninguna validación independiente publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Purino/mobilenetv2-nih-chestxray-4class
- Ficheros del repositorio: `config.json`, `model.safetensors`, `inference_gradcam_example.py`, `train_split.csv`, `val_split.csv`, `test_split.csv` (accesibles desde la pestaña Files del repositorio anterior)
- Dataset NIH ChestX-ray14 en HuggingFace: https://huggingface.co/datasets/nih-chest-xrays/data
- MobileNetV2, Sandler et al., 2018: https://arxiv.org/abs/1801.04381
- Grad-CAM, Selvaraju et al., 2017: https://arxiv.org/abs/1610.02391
- ChestX-ray8 (descripción del dataset NIH), Wang et al., 2017: https://arxiv.org/abs/1705.02315
- Búsqueda web realizada: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a perfiles personales de un homónimo del autor y no guardan relación con el modelo.
