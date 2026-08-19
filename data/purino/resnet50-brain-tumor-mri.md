# Purino/resnet50-brain-tumor-mri

## Resumen

El modelo `Purino/resnet50-brain-tumor-mri` es un clasificador de imágenes médicas desarrollado por el usuario Purino, que consiste en una arquitectura ResNet50 preentrenada en ImageNet y ajustada (fine-tuning) sobre el dataset público *Brain Tumor MRI Dataset* de Kaggle. El modelo distingue entre cuatro clases de resonancias magnéticas cerebrales: glioma, meningioma, ausencia de tumor y tumor pituitario. Su propósito es servir como herramienta de investigación y educación en el ámbito del diagnóstico asistido por imagen, no como dispositivo clínico.

La relevancia de este modelo reside en su tamaño compacto (23,5 millones de parámetros) y su facilidad de integración en flujos de trabajo de PyTorch, lo que lo convierte en un punto de partida accesible para experimentos de clasificación de imágenes médicas. Publicado en agosto de 2026, el modelo reporta una precisión de test del 91,92% y una pérdida de 0,3549, sin especificar detalles sobre el particionado del dataset ni el proceso de entrenamiento más allá del ajuste fino.

Al tratarse de un `state_dict` de PyTorch en formato `safetensors`, no es un modelo compatible directamente con la API de `transformers`, sino que requiere reconstruir la arquitectura manualmente. Su uso está pensado para desarrolladores e investigadores con experiencia en visión por computador que necesiten una base ligera y reproducible para tareas de clasificación de tumores cerebrales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (red neuronal convolucional residual, 50 capas) |
| Parametros totales | 23.569.348 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16, cuantizacion no documentada) |
| Idiomas soportados | no aplica (procesa imagenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (state_dict de PyTorch, no modelo transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ResNet50, una red neuronal convolucional profunda con conexiones residuales que permiten entrenar redes de 50 capas sin degradacion del gradiente. La capa totalmente conectada original (de 1000 clases de ImageNet) se sustituye por una capa lineal con 4 salidas, correspondientes a las clases del dataset de tumores cerebrales. Los pesos se inicializan a partir del checkpoint de ImageNet proporcionado por `torchvision` y se ajustan mediante fine-tuning sobre el dataset de MRI.

El dataset de entrenamiento es el *Brain Tumor MRI Dataset* de Kaggle, que contiene imagenes de resonancia magnetica en cuatro categorias (glioma, meningioma, no tumor y pituitary). No se especifica el numero total de imagenes, el particionado train/test, ni si se aplicaron tecnicas de aumento de datos. Tampoco se detalla el proceso de optimizacion (optimizador, tasa de aprendizaje, epocas) ni si se emplearon tecnicas como regularizacion o normalizacion por lotes adicionales. El preprocesado requerido es el estandar de torchvision para ResNet: redimensionado a 224x224 píxeles, conversion a RGB y normalizacion con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]`.

No se menciona el uso de tecnicas como RLHF, DPO ni otras metodologias de alineacion, ya que se trata de un modelo de clasificacion supervisada clasica. La unica innovacion destacable es la adaptacion de una arquitectura generica de vision a un dominio especifico mediante transferencia de aprendizaje, un enfoque estandar en imagenes medicas.

## Capacidades

- Clasificacion de imagenes de resonancia magnetica cerebral en cuatro categorias: glioma, meningioma, ausencia de tumor y tumor pituitario.
- Inferencia sobre imagenes de entrada de 224x224 píxeles en formato RGB, con normalizacion segun los parametros de ImageNet.
- Salida de probabilidades sobre las 4 clases mediante una capa softmax (aunque no se indica explicitamente, es el comportamiento tipico de un clasificador).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto, al ser un modelo exclusivamente visual.
- No tiene capacidades multilingues ni de procesamiento de lenguaje natural.
- Es un modelo ligero que puede ejecutarse en CPU o GPU con requisitos minimos de memoria.

## Casos de uso

- Investigacion academica en deteccion de tumores cerebrales: el modelo puede servir como baseline reproducible para comparar nuevas arquitecturas o tecnicas de aumento de datos en datasets de MRI. Su tamano reducido permite iterar rapidamente en entornos de investigacion sin necesidad de infraestructura costosa.
- Desarrollo de prototipos de asistencia diagnostica: integrable en aplicaciones de software que procesen imagenes de resonancia magnetica para pre-seleccionar casos sospechosos, siempre bajo supervision medica y con las advertencias legales correspondientes.
- Educacion en vision por computador aplicada a medicina: el codigo de carga y uso es sencillo y documentado, lo que lo hace adecuado para cursos o talleres sobre clasificacion de imagenes medicas con PyTorch.
- Evaluacion de tecnicas de explicabilidad: al ser un modelo ResNet50, puede combinarse con metodos como Grad-CAM para visualizar las regiones de la imagen que influyen en la prediccion, como se describe en la literatura cientifica.
- Pruebas de concepto en entornos clinicos simulados: permite demostrar la viabilidad de la clasificacion automatica de tumores en flujos de trabajo hospitalarios de prueba, sin reemplazar el juicio de radiologos.
- Generacion de datasets sinteticos o aumento de datos: el modelo puede utilizarse como pseudo-etiquetador para ampliar conjuntos de datos de MRI cuando se dispone de imagenes sin anotar, aunque con cautela por su naturaleza experimental.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de test del dataset utilizado:

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,9192 |
| Perdida (loss) | 0,3549 |

No se proporcionan resultados desglosados por clase (precision, recall, F1) ni comparaciones con otros modelos. Tampoco se especifica el tamaño del conjunto de test ni las condiciones de evaluacion. No se han publicado benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 23,5 millones de parametros, lo que ocupa aproximadamente 94 MB en FP32 y 47 MB en FP16. La inferencia de una sola imagen de 224x224 requiere menos de 1 GB de VRAM en GPU, y puede ejecutarse en CPU con tiempos de respuesta de decenas de milisegundos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Tarjetas consumer como GTX 1050, RTX 2060 o superiores funcionan sin problemas. En entornos profesionales, una A100 o H100 no aportan ventaja significativa para un modelo de este tamano.
- Compatibilidad con GPU consumer: si, el modelo cabe en cualquier GPU moderna, incluso en las de gama baja.
- Opciones de despliegue: al ser un `state_dict` de PyTorch, el despliegue se realiza mediante el framework PyTorch o TorchScript. No es compatible directamente con vLLM, Ollama o TGI, que estan orientados a modelos de lenguaje. Se puede exportar a ONNX para inferencia en otros runtimes.
- Latencia y throughput estimados: en una GPU consumer (por ejemplo, RTX 3060), la inferencia de una imagen tarda entre 5 y 15 ms. En CPU (por ejemplo, un i7 moderno), entre 50 y 200 ms. El throughput depende del batch, pero con batch de 32 se pueden procesar cientos de imagenes por segundo en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos en la misma categoria (clasificacion de tumores cerebrales en MRI con ResNet50). Los articulos encontrados en la busqueda web describen enfoques similares pero no proporcionan resultados cuantitativos comparables. Se puede mencionar que el modelo base ResNet50 preentrenado en ImageNet tiene 25,6 millones de parametros y una top-1 accuracy del 76,1% en ImageNet, pero no es directamente comparable al tratarse de dominios distintos. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Purino/resnet50-brain-tumor-mri | 23,5 M | 224x224 | Acc. 0,9192 (test) | no disponible |
| ResNet50 (torchvision, ImageNet) | 25,6 M | 224x224 | Top-1 76,1% en ImageNet | BSD-3-Clause |
| Otros fine-tunes de ResNet50 en MRI | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no es un dispositivo medico y no debe utilizarse para diagnostico clinico real ni para decisiones de tratamiento. La model card lo indica explicitamente.
- Solo esta entrenado en el dataset *Brain Tumor MRI Dataset* de Kaggle, que puede no ser representativo de la poblacion general ni de todas las variantes de tumores cerebrales. La generalizacion a otros hospitales, equipos de resonancia o protocolos de adquisicion es incierta.
- No se especifican sesgos potenciales del dataset, pero es probable que existan desequilibrios entre clases (por ejemplo, mas imagenes de "no tumor" que de tumores) y limitaciones en la diversidad demografica.
- Riesgo de alucinacion: no aplica directamente al ser un clasificador, pero puede producir falsos positivos o negativos en la deteccion de tumores, lo que en un contexto clinico tendria consecuencias graves.
- La licencia no esta disponible, lo que impide conocer las restricciones de uso comercial o redistribucion. Se recomienda contactar al autor antes de cualquier uso productivo.
- El formato de pesos es un `state_dict` de PyTorch sin integracion con `transformers`, lo que limita su uso en pipelines estandar de Hugging Face y requiere codigo adicional para cargar el modelo.
- No se proporcionan detalles sobre el proceso de entrenamiento (epocas, optimizador, aumento de datos), lo que dificulta la reproducibilidad exacta.
- El modelo solo acepta imagenes de 224x224 RGB; imagenes de mayor resolucion o en escala de grises requieren preprocesado adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Purino/resnet50-brain-tumor-mri
- Dataset utilizado (Kaggle): https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset
- Articulo cientifico sobre ResNet50 y Grad-CAM en deteccion de tumores: https://link.springer.com/article/10.1186/s12880-024-01292-7
- Articulo cientifico sobre ResNet50 para deteccion de tumores cerebrales: https://www.sciencedirect.com/science/article/pii/S3050475924001039
- PDF del articulo de Springer: https://link.springer.com/content/pdf/10.1186/s12880-024-01292-7.pdf
- Publicacion en ResearchGate: https://www.researchgate.net/publication/380517632_Enhancing_brain_tumor_detection_in_MRI_images_through_explainable_AI_using_Grad-CAM_with_Resnet_50
