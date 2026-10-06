# dronefreak/bdd100k-period-efficientvit_b3

## Resumen

Este modelo es un clasificador de imágenes EfficientViT-B3 afinado por el usuario dronefreak para la clasificación del periodo del día (time-of-day) en escenas de conducción del dataset BDD100K. Distingue cuatro clases: daytime (día), night (noche), dawn or dusk (amanecer o atardecer) y unknown (desconocido), derivadas del campo `attributes.timeofday` de BDD100K.

Se apoya en el checkpoint base `timm/efficientvit_b3.r224_in1k`, de 46,1 millones de parámetros y entrada de 224x224 píxeles. Forma parte de BDD100K-Toolkit, un conjunto de herramientas que prepara el dataset, entrena modelos sobre él y los evalúa con las mismas métricas y las mismas particiones. Sobre el split de test (10.000 imágenes) declara un 93,77% de top-1 accuracy y un 81,04% de macro F1.

Su interés practico esta en el etiquetado automatico y el enrutado condicional dentro de pipelines de vision para conduccion autonoma: es un modelo pequeno (repositorio de 0,2 GB, licencia Apache 2.0) que cabe en hardware modesto y que puede actuar como etapa de preprocesado barata antes de modelos de percepcion mas costosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-B3 (vision transformer con cascaded group attention, segun el paper arXiv:2205.14756) |
| Parametros totales | 46,1 M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada de 224x224 px) |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es un state dict en precision completa) |
| Idiomas soportados | no disponible (etiquetas en ingles: daytime, night, dawn or dusk, unknown) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best.pt` con state_dict, model_name, class_names, imgsz, mean y std) |

## Arquitectura y entrenamiento

La arquitectura es EfficientViT-B3, un vision transformer orientado a eficiencia de memoria descrito en el paper "EfficientViT: Memory Efficient Vision Transformer with Cascaded Group Attention" (arXiv:2205.14756). El backbone parte de pesos preentrenados en ImageNet-1k (`timm/efficientvit_b3.r224_in1k`) y se le sustituye la cabeza de clasificacion por una de 4 clases, tal como muestra el ejemplo de uso de la model card con `timm.create_model(..., num_classes=len(ckpt["class_names"]))`.

El ajuste fino se realiza sobre la tarea BDD100K Period (Time-of-Day) Classification, una tarea no oficial derivada del campo `attributes.timeofday` de BDD100K (arXiv:1805.04687) y que sigue el dataset de Kaggle del mismo nombre. El preprocesado es el habitual de timm: redimensionado a `imgsz` (224 px), conversion a tensor y normalizacion con la media y la desviacion tipica almacenadas en el propio checkpoint. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset de ajuste, el numero de epocas, el optimizador ni el uso de tecnicas de alineacion como RLHF o DPO (no aplicables a una tarea de clasificacion supervisada). Tampoco se documentan innovaciones adicionales de decodificacion o atencion mas alla de las propias del backbone EfficientViT.

## Capacidades

- Clasificacion de imagenes en 4 clases de periodo del dia: dawn or dusk, daytime, night y unknown.
- Inferencia sobre imagenes de escenas de conduccion en formato RGB a 224x224 px.
- Integracion directa con la libreria timm y PyTorch, cargando el checkpoint con `hf_hub_download` y `torch.load`.
- Extraccion de probabilidades por clase mediante softmax para umbralizar o combinar con otras etapas del pipeline (por ejemplo, descartar predicciones de baja confianza).
- Uso como etiquetador automatico masivo para anotar clips de video o lotes de imagenes de conduccion.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni vision multimodal; es exclusivamente un clasificador de imagen unica.
- No se documenta soporte multilingue ni de audio.

## Casos de uso

- Etiquetado automatico de datasets de conduccion: dado un lote de imagenes BDD100K o de cualquier corpus de escenas de trafico, el modelo asigna la etiqueta de periodo del dia para preanotar el conjunto y reducir el trabajo de revision manual posterior.
- Enrutado condicional en pipelines de percepcion: usar la prediccion como primera etapa para decidir que submodelo activar despues (por ejemplo, un detector ajustado especificamente para escenas nocturnas), aprovechando el coste bajo de un clasificador de 46,1 M de parametros.
- Curado y filtrado de datos de entrenamiento: descartar o separar imagenes nocturnas, diurnas o de transicion crepuscular antes de entrenar detectores o segmentadores, garantizando una mezcla equilibrada por condicion de iluminacion.
- Ajuste de parametros de camara en plataformas embebidas: la senal de periodo del dia puede alimentar el control de exposicion, balance de blancos o activacion de modos HDR en sistemas ADAS y sistemas de vision para vehiculos.
- Monitorizacion de flotas y analisis operativo: clasificar imagenes o fotogramas muestreados de grabaciones de flota para agregar estadisticas de operacion por franja horaria (por ejemplo, proporcion de kilometros nocturnos por ruta).
- Investigacion en robustez de modelos de vision: utilizar el clasificador como referencia reproducible de una condicion de dominio (iluminacion) para estudiar la degradacion de otros modelos bajo cambios de dominio.
- Sistemas de registro documental para aseguradoras y peritajes: clasificar fotografias de siniestros de trafico por condicion de luz, ya que en la tarea nocturna el modelo alcanza 98,00% de precision y 98,68% de recall.
- Robots de reparto y vehiculos de logistica de baja velocidad: integrar el modelo en una placa con GPU integrada o incluso CPU para decidir si se activan luces, alertas o rutinas de navegacion dependientes de la luz ambiental.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, evaluados sobre el split `test` (10.000 imagenes) del dataset `dronefreak/BDD100K-Period-Classification`. Todos los valores tienen `verified: false`, es decir, no han sido verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Top-1 accuracy (test split) | 93,77% |
| Macro F1 (test split) | 81,04% |
| Macro precision (test split) | 88,43% |
| Macro recall (test split) | 76,29% |
| Balanced accuracy (test split) | 76,29% |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 71,48% | 49,61% | 58,57% | 778 |
| daytime | 92,92% | 96,86% | 94,85% | 5.258 |
| night | 98,00% | 98,68% | 98,34% | 3.929 |
| unknown | 91,30% | 60,00% | 72,41% | 35 (muy pocas) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares) en la informacion disponible; no son aplicables a un clasificador de imagenes.

## Requisitos de hardware

- Pesos del modelo: ~184 MB en FP32 y ~92 MB en FP16/BF16 (calculado a partir de los 46,1 M de parametros). Tamano del repositorio en HuggingFace: 0,2 GB.
- VRAM estimada para inferencia: inferior a 1 GB incluyendo activaciones a 224x224 px; la cifra exacta no esta publicada, es una estimacion basada en el numero de parametros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; por ejemplo NVIDIA T4, RTX 3060, RTX 4090, A100 o H100. En estas ultimas el modelo quedara limitado por el ancho de banda de memoria y el preprocesado de imagenes, no por la capacidad de computo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas. Tambien es viable la inferencia en CPU para lotes pequenos.
- Opciones de despliegue: PyTorch + timm (ruta oficial del autor), exportacion a ONNX o TorchScript y ejecucion con ONNX Runtime o TensorRT. Ollama y llama.cpp no aplican, al ser herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por imagen ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

El propio autor publica un "Model Zoo" con modelos entrenados y evaluados sobre el mismo split de test y con las mismas metricas, lo que permite una comparacion directa. Extracto ordenado por top-1 accuracy:

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 94,01% | 83,19% | 79,63% | 87,95% |
| EfficientViT-L1 | 93,98% | 82,68% | 78,45% | 88,75% |
| ConvNeXt-Atto | 93,95% | 80,75% | 76,82% | 86,39% |
| EfficientViT-B2 | 93,92% | 82,53% | 78,88% | 87,49% |
| RepViT-M2.3 | 93,89% | 82,35% | 78,49% | 87,72% |
| EfficientViT-B1 | 93,77% | 82,63% | 78,93% | 88,38% |
| EfficientViT-B3 (este modelo) | 93,77% | 81,04% | 76,29% | 88,43% |
| MobileNetV4-Conv-Small | 93,57% | 80,22% | 76,22% | 86,06% |

Comparativa de ficha tecnica frente a las alternativas mas cercanas:

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| EfficientViT-B3 (este modelo) | 46,1 M | 224x224 px | Apache 2.0 | HuggingFace (timm, `best.pt`) |
| TinyViT-21M | no disponible | no disponible | no disponible | dentro del Model Zoo del BDD100K-Toolkit |
| EfficientViT-L1 | no disponible | no disponible | no disponible | dentro del Model Zoo del BDD100K-Toolkit |
| EfficientViT-B2 | no disponible | no disponible | no disponible | dentro del Model Zoo del BDD100K-Toolkit |

En rendimiento bruto, TinyViT-21M y EfficientViT-L1 superan a este modelo en top-1 y macro F1, mientras que EfficientViT-B3 destaca en macro precision (88,43%), solo por debajo de MobileNetV4-Conv-Large (89,57%) y EfficientViT-L1 (88,75%) en la tabla publicada. No hay informacion disponible sobre licencias, numero de parametros ni requisitos de hardware de los modelos comparados.

## Limitaciones y advertencias

- Desequilibrio de clases: daytime (5.258 imagenes) y night (3.929) dominan el test, frente a dawn or dusk (778) y unknown (35). Esto explica la brecha entre el 93,77% de top-1 y el 81,04% de macro F1.
- La clase dawn or dusk es el punto debil claro del modelo: recall del 49,61% y F1 del 58,57%, con una precision del 71,48%. Es previsible que confunda amanecer/atardecer con daytime o night.
- La clase unknown apenas tiene 35 imagenes de test y un recall del 60,00%, por lo que sus metricas son poco fiables y no deben extrapolarse.
- Metricas no verificadas: todos los valores del model-index tienen `verified: false`; proceden del propio autor del modelo.
- Tarea no oficial: la clasificacion de periodo del dia se deriva del campo `attributes.timeofday` de BDD100K y sigue un dataset de Kaggle del mismo nombre; no es una tarea oficial del benchmark BDD100K, por lo que la comparabilidad con otros trabajos depende de replicar exactamente la definicion de clases y las particiones.
- Riesgo de sobreajuste al dominio: entrenado sobre escenas de conduccion de BDD100K, por lo que puede degradarse en otros dominios (camaras de vigilancia, interiores, imagenes aereas) o en condiciones de iluminacion intermedias poco representadas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de prediccion erronea con alta confianza, especialmente en la clase unknown y en transiciones crepusculares.
- Sesgos geograficos y de captura: heredados de BDD100K (recopilado principalmente en Estados Unidos), lo que puede afectar a condiciones de iluminacion, tipos de via y climatologia de otras regiones.
- Licencia del modelo Apache 2.0, permisiva para uso comercial. Debe revisarse por separado la licencia del dataset BDD100K y del dataset derivado `dronefreak/BDD100K-Period-Classification`, cuyos terminos no se detallan en la informacion disponible.
- No se documentan el numero de epocas, la estrategia de ajuste fino ni la semilla, lo que dificulta la reproducibilidad exacta de las cifras declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-efficientvit_b3
- Repositorio BDD100K-Toolkit (codigo fuente y Model Zoo): https://github.com/dronefreak/bdd100k-toolkit
- Dataset de la tarea: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Modelo base en timm: https://huggingface.co/timm/efficientvit_b3.r224_in1k
- Paper de EfficientViT (cascaded group attention): https://arxiv.org/abs/2205.14756
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
