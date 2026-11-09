# femartip/microfibres-glass-mask-rcnn

## Resumen
`femartip/microfibres-glass-mask-rcnn` es un conjunto de cinco checkpoints de deteccion y segmentacion de instancias basados en Mask R-CNN, entrenados con la libreria Detectron2 para detectar microfibras de vidrio (Glass) en imagenes de filtros. Lo desarrolla el usuario femartip y se publica como artefacto de investigacion reproducible: no es un modelo de lenguaje ni un modelo generativo, sino un detector de vision por computador orientado a un dominio cientifico muy concreto (analisis de microfibras).

El repositorio no contiene pesos en formato safetensors ni GGUF, sino cinco ficheros `model_final.pth` de PyTorch (uno por fold, `fold0` a `fold4`), acompanados de las configuraciones resueltas de Detectron2, los registros COCO originales de entrenamiento y test, y un manifiesto con hashes SHA-256. El tamano total del repositorio es de 1,8 GB.

Su relevancia es metodologica: el autor documenta explicitamente la procedencia de los splits, advierte que los checkpoints no permiten demostrar la pertenencia historica al conjunto de entrenamiento y proporciona un mapeo entre indices de fila del dataset de Hugging Face e identificadores originales de imagen. Es un ejemplo de publicacion cuidadosa de artefactos de vision con trazabilidad, mas que un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN sobre Detectron2 (backbone no especificado en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos `.pth` en precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (checkpoints de Detectron2) |
| Tarea | Segmentacion de instancias (`image-segmentation`) |
| Numero de checkpoints | 5 (`fold0` a `fold4`) |
| Dataset asociado | `femartip/microfibres_Glass_filter` |
| Tamano del repositorio | 1,8 GB |
| Libreria | Detectron2 |

## Arquitectura y entrenamiento
La arquitectura es Mask R-CNN, un detector de dos etapas que extiende Faster R-CNN con una rama de segmentacion de mascaras a nivel de instancia. Se implementa sobre Detectron2, con configuraciones resueltas incluidas en cada fold (`config.yaml`). La informacion disponible no detalla el backbone concreto, el numero de clases, la resolucion de entrada ni los hiperparametros de entrenamiento mas alla de lo que figura en esas configuraciones.

El autor indica que los cinco checkpoints son detectores originales ya entrenados, no reentrenamientos nuevos sobre particiones aleatorias del dataset de Hugging Face. Los ficheros `train_coco.json` y `test_coco.json` de cada fold son registros recuperados del repositorio publico del autor original, con el commit de origen documentado en `training_records_source.json`. El repositorio incluye tambien `original_coco.json` como referencia de anotaciones e identificadores de imagen, `hf_image_mapping.csv` para traducir indices de fila de HF a IDs originales, y `manifest.json` con SHA-256 y tamano en bytes de cada fichero. No se aportan datos sobre volumen de tokens (no aplica), composicion del dataset ni uso de RLHF/DPO (no aplica a vision).

## Capacidades
- Deteccion de objetos de la clase Glass (microfibras de vidrio) en imagenes de filtros.
- Segmentacion de instancias: genera mascaras por objeto ademas de cajas delimitadoras.
- Inferencia mediante `DefaultPredictor` de Detectron2 con umbral de confianza configurable (`MODEL.ROI_HEADS.SCORE_THRESH_TEST`, por defecto 0.5 en el ejemplo).
- Cinco variantes (folds) que permiten explorar variabilidad entre particiones de entrenamiento.
- Reproducibilidad de la evaluacion: configuraciones resueltas, registros COCO y entorno Poetry incluidos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual y de dominio especifico.

## Casos de uso
- Analisis de calidad de filtros: detectar y cuantificar microfibras de vidrio en imagenes de filtros para control de calidad en laboratorio, usando las mascaras para medir numero y area de fibras.
- Investigacion en ciencia de materiales: extraer estadisticas de poblacion de microfibras (conteo, distribucion de tamanos) a partir de lotes de imagenes, apoyandose en los cinco folds para estimar variabilidad del detector.
- Reproduccion de experimentos publicados: reejecutar la evaluacion con las configuraciones y registros COCO incluidos, verificando resultados contra los checkpoints originales.
- Etiquetado asistido: usar las predicciones como preanotaciones para acelerar el etiquetado manual de nuevas imagenes de filtros antes de revision humana.
- Benchmark de segmentacion en dominio cientifico: comparar Mask R-CNN frente a otros segmentadores sobre el dataset `microfibres_Glass_filter`, con particiones documentadas.
- Auditoria de artefactos de vision: emplear el manifiesto SHA-256 y los registros de procedencia como caso de estudio de trazabilidad y reproducibilidad en publicaciones de modelos.
- Integracion en pipelines de microscopia: procesar por lotes imagenes capturadas por instrumentos y almacenar mascaras y cajas en formato COCO para analisis posterior.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del backbone y de la resolucion de entrada definidos en `config.yaml`, que no se detallan.
- GPU recomendadas: no disponible. Detectron2 con Mask R-CNN se ejecuta habitualmente en GPU NVIDIA con CUDA (`cfg.MODEL.DEVICE = "cuda"` en el ejemplo de carga); el modelo puede ejecutarse en CPU con `cfg.MODEL.DEVICE = "cpu"`, a costa de mayor latencia.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio ocupa 1,8 GB en total (cinco checkpoints mas metadatos), por lo que cada checkpoint individual es sustancialmente menor, pero no se especifica su tamano exacto.
- Opciones de despliegue: Detectron2 (`DefaultPredictor`) es la via documentada. No se mencionan exportaciones a ONNX, TorchScript, TensorRT ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Entorno: el repositorio incluye una especificacion y lock de Poetry que describe el entorno de evaluacion, no el entorno historico de entrenamiento.

## Comparativa con modelos similares
No se dispone de datos de rendimiento ni de especificaciones comparables en la informacion proporcionada. Como referencia cualitativa de categoria:

| Modelo | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| femartip/microfibres-glass-mask-rcnn | Mask R-CNN (Detectron2) | Segmentacion de instancias (microfibras) | no disponible | Hugging Face, 5 checkpoints |
| Mask R-CNN estandar (Detectron2 model zoo) | Mask R-CNN | Segmentacion de instancias COCO | licencia del proyecto Detectron2 | Publico |
| Otros detectores de dominio cientifico | no disponible | Segmentacion especifica | no disponible | no disponible |

No se dispone de cifras de precision, recall o mAP para establecer una comparacion cuantitativa.

## Limitaciones y advertencias
- Dominio muy restringido: el detector esta entrenado para la clase Glass en imagenes de filtros; no es un modelo de proposito general.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Los checkpoints `.pth` de PyTorch pueden contener cargas de pickle; el propio autor advierte de usar solo checkpoints de confianza y cargarlos con precaucion.
- Las configuraciones originales contienen rutas locales historicas; es obligatorio sobrescribir `MODEL.WEIGHTS` con la ruta descargada.
- Los identificadores de imagen originales no coinciden con los indices de fila de Hugging Face; es necesario usar `hf_image_mapping.csv`.
- Algunas imagenes originales (incluidas imagenes Glass sin anotar) no estan presentes en Hugging Face; los JSON originales se conservan sin filtrar y las imagenes no se incluyen en el repositorio.
- Los hashes de los checkpoints no permiten demostrar la pertenencia historica al conjunto de entrenamiento; la procedencia de los splits se basa en registros recuperados, no en el interior de los checkpoints.
- Las particiones de evaluacion de la meta-regresion de poblacion completa no se incluyen como splits de test originales; 86 imagenes Glass estan presentes en los cinco conjuntos de entrenamiento recuperados, por lo que no son estrictamente held-out.
- No se garantiza un reentrenamiento identico bit a bit; el entorno Poetry describe la evaluacion, no el entrenamiento historico.
- Riesgo de falsos positivos y negativos fuera de la distribucion de imagenes de filtros; sin datos de benchmarks no es posible cuantificar la robustez.
- No aplica sesgo linguistico ni de idioma, pero si posibles sesgos de adquisicion de imagen (iluminacion, microscopio, preparacion de muestra) no documentados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/femartip/microfibres-glass-mask-rcnn
- Dataset asociado: https://huggingface.co/datasets/femartip/microfibres_Glass_filter
- Detectron2 (libreria): https://github.com/facebookresearch/detectron2
- Paper de Mask R-CNN: https://arxiv.org/abs/1703.06870
- Paper de Faster R-CNN: https://arxiv.org/abs/1506.01497
