# femartip/microfibres-ca-mask-rcnn

## Resumen

`femartip/microfibres-ca-mask-rcnn` es un conjunto de cinco checkpoints de deteccion y segmentacion de instancias basados en Mask R-CNN, entrenados con Detectron2 para la deteccion de microfibres en imagenes de microscopia. El modelo no es un modelo de lenguaje ni un modelo fundacional: es un detector de objetos especializado en un dominio cientifico muy concreto (analisis de microfibres, presumiblemente en muestras ambientales o textiles), empaquetado junto con sus configuraciones originales de Detectron2 y los registros COCO de entrenamiento y test recuperados del repositorio publico del autor original.

El repositorio incluye cinco particiones (`fold0` a `fold4`), cada una con su checkpoint `model_final.pth`, su `config.yaml` resuelto y los ficheros `train_coco.json` y `test_coco.json` originales. Ademas se aportan artefactos de trazabilidad: `manifest.json` con hashes SHA-256, `hf_image_mapping.csv` para mapear indices de fila del dataset de Hugging Face a IDs de imagen originales, y un entorno Poetry que describe el entorno de evaluacion (no el de entrenamiento historico).

Su relevancia es acotada pero clara: proporciona checkpoints reproducibles y trazables para un pipeline de segmentacion de microfibres, con documentacion honesta sobre las limitaciones de procedencia de los splits. No hay informacion publica sobre arquitectura backbone concreta, numero de parametros ni metricas de rendimiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN (Detectron2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (checkpoints Detectron2) |

## Arquitectura y entrenamiento

El modelo es una implementacion de Mask R-CNN sobre Detectron2, orientada a segmentacion de instancias (`pipeline_tag: image-segmentation`). Mask R-CNN combina un detector de objetos de dos etapas (region proposals + clasificacion/regresion de cajas) con una rama de prediccion de mascaras por instancia. La informacion proporcionada no especifica el backbone (ResNet, ResNeXt, etc.), la resolucion de entrada ni el numero de clases del detector; estos datos estarian en los `config.yaml` incluidos en cada fold, pero no se reproducen en la model card.

El entrenamiento se realizo originalmente sobre el dataset `femartip/microfibres_CA_filter`, con cinco particiones (folds 0 a 4). Los registros COCO de entrenamiento y test incluidos son recuperados del repositorio publico del autor original, no extraidos de los checkpoints. El autor advierte explicitamente que los hashes de los checkpoints no pueden probar la pertenencia historica de las imagenes a los conjuntos de entrenamiento. Las imagenes no se incluyen en el repositorio; solo los registros de anotaciones y el mapeo de IDs. No se documenta el numero de tokens (no aplica), la composicion del dataset ni si hubo aumentos de datos o tecnicas de regularizacion.

## Capacidades

- Deteccion de instancias de microfibres en imagenes de microscopia.
- Segmentacion de instancias (mascaras por objeto) ademas de cajas delimitadoras.
- Inferencia sobre imagenes individuales mediante `DefaultPredictor` de Detectron2.
- Umbral de confianza configurable (`MODEL.ROI_HEADS.SCORE_THRESH_TEST`, por defecto 0.5 en el ejemplo de carga).
- Cinco checkpoints independientes (folds 0 a 4) que permiten evaluacion cruzada o ensemble.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual y de dominio especifico.

## Casos de uso

- Analisis automatizado de muestras de microfibres en laboratorio: el detector permite contar y localizar microfibres en imagenes de microscopia, sustituyendo el conteo manual y reduciendo el tiempo de analisis por muestra.
- Control de calidad en industria textil: deteccion de contaminacion por microfibres en muestras de tejidos o en efluentes de procesos, usando los cinco folds para validar robustez del detector.
- Monitorizacion ambiental: segmentacion de microfibres en muestras de agua o sedimento, integrable en pipelines de analisis de imagen scientificos con salida COCO.
- Investigacion academica sobre contaminacion por microplasticos: los checkpoints y los registros COCO permiten reproducir experimentos y comparar contra nuevas arquitecturas con el mismo protocolo.
- Ensemble de detectores: combinacion de las predicciones de los cinco folds para reducir varianza en la deteccion de instancias dificiles o de bajo contraste.
- Generacion de datasets anotados: uso del modelo como anotador asistido para pre-etiquetar nuevas imagenes de microfibres, que luego un experto revisa, acelerando la creacion de conjuntos de entrenamiento ampliados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; un Mask R-CNN tipico en Detectron2 con backbone ResNet-50 requiere del orden de 4-8 GB de VRAM para inferencia a resoluciones estandar, pero este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible; el ejemplo de carga usa `cfg.MODEL.DEVICE = "cuda"`, lo que implica GPU con CUDA.
- Compatibilidad con GPU de consumo: probable en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3060 o superiores), aunque no confirmado por el autor.
- Opciones de despliegue: Detectron2 (`DefaultPredictor`), con descarga de pesos via `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| femartip/microfibres-ca-mask-rcnn | Mask R-CNN (Detectron2) | Segmentacion de microfibres | no disponible | no aplica | no disponible | Hugging Face (5 checkpoints) |
| Mask R-CNN COCO (Detectron2 model zoo) | Mask R-CNN | Segmentacion de instancias general | ~44M (ResNet-50 FPN) | no aplica | Apache 2.0 (Detectron2) | Detectron2 model zoo |
| YOLOv8-seg | CNN de una etapa | Segmentacion de instancias general | variable (3M-68M) | no aplica | AGPL-3.0 / Enterprise | Ultralytics |
| SAM (Segment Anything) | ViT + prompt encoder | Segmentacion promptable | 91M-636M | no aplica | Apache 2.0 | Meta |

La comparativa es orientativa: los tres alternativos son modelos generales, mientras que este checkpoint esta especializado en microfibres y su ventaja potencial es el dominio, no la arquitectura ni la escala.

## Limitaciones y advertencias

- Procedencia de los splits no verificable: los registros COCO son recuperados del repositorio del autor original, no extraidos de los checkpoints; los hashes no prueban la pertenencia historica de las imagenes al entrenamiento.
- Los IDs de imagen originales no coinciden con los indices de fila del dataset de Hugging Face; es obligatorio usar `hf_image_mapping.csv` para mapear correctamente.
- Algunas imagenes originales (incluidas imagenes de Glass sin anotar) no estan presentes en Hugging Face; los registros JSON originales se conservan sin filtrar.
- Las imagenes no se incluyen en el repositorio; solo los registros de anotaciones y el mapeo.
- Las particiones de evaluacion de meta-regresion de poblacion completa no se incluyen como splits de test originales: incluyen 309 imagenes CA presentes en los cinco conjuntos de entrenamiento recuperados, por lo que no son imagenes held-out del detector.
- Las configuraciones originales contienen rutas locales historicas; es necesario sobrescribir `MODEL.WEIGHTS`.
- Los ficheros `.pth` de PyTorch pueden contener payloads pickle: solo deben cargarse checkpoints de fuentes de confianza.
- El entorno Poetry incluido describe la evaluacion, no el entorno de entrenamiento historico; no se garantiza un reentrenamiento bit-identico.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- No hay informacion sobre sesgos, tasas de alucinacion (no aplica a vision) ni metricas de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/femartip/microfibres-ca-mask-rcnn
- Dataset asociado: https://huggingface.co/datasets/femartip/microfibres_CA_filter
- Detectron2 (framework): https://github.com/facebookresearch/detectron2
- Mask R-CNN (paper original): https://arxiv.org/abs/1703.06870
