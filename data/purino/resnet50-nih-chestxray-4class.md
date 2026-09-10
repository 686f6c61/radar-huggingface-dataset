# Purino/resnet50-nih-chestxray-4class

## Resumen

`Purino/resnet50-nih-chestxray-4class` es un clasificador de imagen médica basado en ResNet50, ajustado (*fine-tuning*) desde pesos de ImageNet1k para distinguir entre cuatro patologías torácicas frecuentes del conjunto NIH ChestX-ray14: Infiltration, Atelectasis, Effusion y Nodule. Lo desarrolla el usuario Purino y se publica bajo licencia MIT con pesos en `safetensors`, lo que lo convierte en un recurso abierto y ligero (23.569.348 parámetros, unos 0,1 GB de repositorio) para experimentación en imagen de tórax.

Su planteamiento es deliberadamente restrictivo: solo se entrenó con imágenes que contienen exactamente una de esas cuatro patologías, descartando las imágenes "No Finding" y las multi-patología, y sobre un subconjunto equilibrado de 8.000 imágenes en lugar de las 112.120 originales. Es un modelo **single-label** con salida softmax de 4 clases, no un clasificador multi-etiqueta de los 14 hallazgos del dataset original.

Su relevancia actual es doble: por un lado sirve como *baseline* reproducible y de bajo coste computacional para pipelines de clasificación de radiografía de tórax; por otro, su diseño minimalista (un único `Linear` final, sin capas densas intermedias) lo hace directamente compatible con técnicas de explicabilidad como CAM y Grad-CAM, algo que el propio autor documenta con un script de ejemplo. No está pensado para uso clínico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (CNN con bloques residuales tipo bottleneck), fine-tune desde ImageNet1k |
| Parametros totales | 23.569.348 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); resolución de entrada no documentada en la información disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas); al ser una CNN estándar admite FP16/INT8 mediante conversión externa (PyTorch, ONNX Runtime, TensorRT) |
| Idiomas soportados | no disponible / no aplica (modelo de clasificación de imagen; las etiquetas están en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), cargable como `state_dict` de `torchvision.models.resnet50`; el repositorio también incluye `config.json` y scripts de ejemplo en Python. No se publican GGUF ni ONNX |

Otros datos: pipeline declarado `image-classification`, librería `pytorch`, repo de 0,1 GB, creado y actualizado el 10 de septiembre de 2026. Descargas y *likes* registrados: 0 en el momento de la consulta.

## Arquitectura y entrenamiento

La red es una ResNet50 estándar: `layer1` → `layer2` → `layer3` → `layer4` de bloques convolucionales residuales, seguida de `AdaptiveAvgPool2d` y una única capa `Linear` (`model.fc`) con 4 salidas y softmax. No hay capas fully-connected intermedias, lo que la convierte en la arquitectura canónica para CAM (Zhou et al. usaron ResNet/GoogLeNet en el artículo original) y para Grad-CAM, enganchando la *feature map* de 2048 canales de `model.layer4[-1]` justo antes del *global average pooling*.

El entrenamiento parte de pesos preentrenados en ImageNet1k y se realiza sobre un subconjunto equilibrado de **8.000 imágenes** del dataset NIH ChestX-ray14, restringido a imágenes con una sola patología entre las 4 clases seleccionadas. Se aplica *early stopping* guiado por la macro-AUROC de validación. La partición train/val/test se hizo **por Patient ID** para evitar fuga de datos, y los ficheros `train_split.csv`, `val_split.csv` y `test_split.csv` documentan qué imágenes pertenecen a cada conjunto. No se especifican en la información disponible la resolución de entrada, las transformaciones de *augmentation*, el optimizador, el número de épocas ni la estrategia de desbalanceo más allá del submuestreo equilibrado; tampoco hay fases de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación de imagen única en una de 4 clases (Infiltration, Atelectasis, Effusion, Nodule) con salida softmax y probabilidades por clase.
- Generación de mapas de activación compatibles con CAM y Grad-CAM sobre `model.layer4[-1]`; el repositorio incluye `inference_gradcam_example.py`, ejecutable directamente.
- Carga sencilla vía `huggingface_hub` + `safetensors.torch.load_file`, con `config.json` que expone `num_labels`.
- Uso como extractor de características: el *backbone* ResNet50 puede reutilizarse para *fine-tuning* sobre otros conjuntos o para ampliar el número de clases.
- No soporta *tool calling* ni *function calling*.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni generación de texto.
- No realiza detección de *bounding boxes*, segmentación ni clasificación multi-etiqueta.

## Casos de uso

- **Preanotación y triaje de grandes volúmenes de radiografías en investigación**: el modelo etiqueta rápidamente imágenes hacia una de las 4 patologías, lo que permite priorizar revisiones humanas y reducir el coste de curación de datasets. Es adecuado porque su inferencia es de milisegundos en GPU y el modelo ocupa menos de 100 MB en FP32.
- **Explicabilidad y validación de técnicas XAI**: gracias a su estructura sin capas densas intermedias, se puede obtener Grad-CAM sobre la *feature map* de 2048 canales y contrastar cualitativamente las regiones activadas con `BBox_List_2017.csv`, que contiene *bounding boxes* anotadas por radiólogos en unas 1.000 imágenes del dataset original.
- **Baseline reproducible para comparativas académicas**: sirve como punto de partida medido (macro-AUROC de test 0,7919) frente a alternativas más ligeras, como el propio autor sugiere al proponer una comparación directa con MobileNetV2.
- **Destilación de conocimiento y preentrenamiento de dominio**: al ser un ResNet50 entrenado en radiografía de tórax en lugar de solo en ImageNet, puede actuar como profesor para modelos pequeños o como inicialización de un clasificador de 14 hallazgos (aumentando `NUM_SELECTED_CLASSES`).
- **Prototipos de despliegue en hardware modesto**: con 23,5 M de parámetros cabe en GPU de gama de entrada e incluso en CPU para lotes pequeños, lo que habilita demos y entornos de laboratorio sin acelerador dedicado, previa conversión a ONNX o TensorRT.
- **Docencia en imagen médica e IA**: el script de Grad-CAM permite mostrar de forma visual qué regiones de la radiografía activan la predicción, útil en asignaturas de radiología o de aprendizaje profundo aplicado, siempre con supervisión experta y sin uso diagnóstico.
- **Filtrado previo en estudios retrospectivos**: para cohortes que requieran únicamente pacientes con una de las cuatro patologías seleccionadas, el modelo puede usarse como filtro de inclusión antes de una revisión manual.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Metrica | Valor |
|---|---|
| Val Macro-AUROC (OVR), mejor epoca | 0,7756 |
| Test Macro-AUROC (OVR) | 0,7919 |
| Test Accuracy | 0,5381 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; además, esas métricas no aplican a un clasificador de imagen. La comparación de la macro-AUROC con modelos multi-etiqueta de 14 clases no es metodológicamente equivalente, ya que aquí el azar se sitúa en torno al 25 % de acierto por clase y el etiquetado es excluyente.

## Requisitos de hardware

- **VRAM estimada**: en FP32 los pesos ocupan aproximadamente 94 MB; en FP16, unos 47 MB; en INT8, unos 24 MB. Con activaciones de un lote típico de clasificación de imagen, la inferencia cabe holgadamente por debajo de 1 GB de VRAM (dependiendo de la resolución de entrada, que no está documentada).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM. Para producción bastan NVIDIA T4, L4, RTX 3060/4060 en adelante; para lotes grandes y baja latencia, A100, H100 o L40S.
- **¿Cabe en GPU de consumo?**: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1650 4 GB y superiores). También es viable en CPU para inferencia puntual, aunque la latencia por imagen será mayor.
- **Opciones de despliegue**: PyTorch nativo, TorchScript, ONNX Runtime, TensorRT, NVIDIA Triton, TorchServe y FastAPI con `transformers`/`torchvision`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada (el autor no publica mediciones de latencia ni de imágenes por segundo). Para referencia, una ResNet50 a 224×224 suele procesar lotes con *throughput* de miles de imágenes por segundo en A100 y decenas por segundo en CPU, pero estos valores son estimaciones genéricas de la arquitectura y no mediciones de este modelo concreto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Clases | Tipo de etiquetado | AUROC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (Purino/resnet50-nih-chestxray-4class) | ResNet50 | 23.569.348 | 4 | single-label | 0,7919 (test, macro OVR) | MIT | HuggingFace |
| MobileNetV2 (alternativa sugerida por el autor) | CNN ligera con convoluciones separables | no disponible | no disponible | no disponible | no disponible | no disponible | torchvision / pesos ImageNet |
| CheXNet (DenseNet-121, referente de la literatura) | CNN densa | no disponible en la informacion proporcionada | 14 | multi-label | no disponible en la informacion proporcionada | no disponible | reimplementaciones de terceros; pesos oficiales no publicados |

La información proporcionada no incluye cifras comparativas verificables de modelos alternativos sobre este mismo subconjunto de 4 clases, por lo que no es posible establecer una comparación cuantitativa directa. Cualquier comparación con clasificadores de 14 etiquetas debe interpretarse con cautela: cambian el número de clases, el tipo de etiquetado (excluyente frente a múltiple) y el conjunto de evaluación.

## Limitaciones y advertencias

- **Cobertura muy reducida**: solo 4 de las 14 patologías del dataset original y únicamente imágenes con una sola enfermedad. El modelo no gestiona imágenes multi-patología ni la clase "No Finding".
- **Entrenamiento sobre 8.000 de las 112.120 imágenes** del conjunto completo, con submuestreo equilibrado que altera la prevalencia real de cada patología.
- **Etiquetas ruidosas**: las anotaciones originales se extrajeron automáticamente de informes radiológicos mediante NLP (NegBio/DNorm), con una precisión estimada del 90 %; no hubo anotación manual imagen a imagen.
- **Exactitud baja en términos absolutos**: 0,5381 de *accuracy* en test, con macro-AUROC de 0,7919, indica un margen de error considerable para cualquier uso automatizado.
- **No apto para diagnóstico clínico**: el propio autor lo declara como modelo de investigación y uso académico. No debe emplearse para decisiones médicas sin validación externa, regulatoria y supervisión profesional.
- **Riesgo de alucinación en la explicabilidad**: los mapas Grad-CAM son indicativos y pueden resaltar regiones no relacionadas con la lesión; su validación requiere contraste con anotaciones de radiólogos.
- **Ausencia de análisis de sesgos**: la información disponible no documenta evaluación por subgrupos demográficos ni por equipo de adquisición, algo crítico en datasets de rayos X de población estadounidense.
- **Detalles de preprocesado no documentados**: no se especifican resolución de entrada, normalización ni aumentos de datos, lo que dificulta reproducir exactamente las condiciones de inferencia.
- **Licencia MIT**: permite uso comercial y modificación con atribución, pero la licencia del modelo no exime de cumplir la normativa aplicable a datos médicos (RGPD, MDR) ni de las condiciones de uso del dataset NIH.
- **Dependencia del *split* por Patient ID**: usar particiones distintas de las publicadas puede provocar fuga de datos y resultados inflados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Purino/resnet50-nih-chestxray-4class
- Dataset NIH ChestX-ray14: https://huggingface.co/datasets/nih-chest-xrays/data
- Artículo original de CAM (Zhou et al., "Learning Deep Features for Discriminative Localization"): https://arxiv.org/abs/1512.04150
- Artículo original de Grad-CAM (Selvaraju et al.): https://arxiv.org/abs/1610.02391
- CheXNet (Rajpurkar et al.), referente de clasificación multi-etiqueta en ChestX-ray14: https://arxiv.org/abs/1711.05225
- Repositorio de referencia de torchvision para ResNet: https://github.com/pytorch/vision

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de referencias bibliográficas estándar, y no han podido verificarse mediante dicha búsqueda.
