# dronefreak/bdd100k-period-repvit_m2_3

## Resumen

RepViT-M2.3 afinado sobre BDD100K Period es un clasificador de imágenes de cuatro clases que determina la franja horaria de una escena de conducción: daytime, night, dawn or dusk y unknown. Lo publica el usuario dronefreak como parte de BDD100K-Toolkit, una herramienta orientada a preparar el dataset BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y los mismos splits. La tarea no es oficial dentro de BDD100K: se deriva del campo attributes.timeofday de cada imagen y sigue el planteamiento de un dataset de Kaggle homónimo.

El modelo parte del checkpoint timm/repvit_m2_3.dist_300e_in1k, una red RepViT de 22,4 millones de parámetros preentrenada en ImageNet-1k con destilación durante 300 épocas, y se ha reentrenado para la clasificación de franja horaria. El resultado es un modelo pequeño (repo de 0,1 GB) y ligero, pensado para inferencia en entornos con recursos limitados, con licencia Apache-2.0.

Su relevancia práctica está en el preprocesado y el enrutado condicional de pipelines de visión para conducción autónoma: etiquetar automáticamente la franja horaria de grandes volúmenes de imágenes permite filtrar subconjuntos, medir robustez por condición de iluminación o activar modelos especializados cuando se detecta una escena nocturna. Declara un 93,89 % de top-1 y un 82,35 % de macro F1 en el split de test de 10 000 imágenes, con métricas no verificadas por un tercero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RepViT-M2.3 (red convolucional móvil, base timm/repvit_m2_3.dist_300e_in1k) |
| Parámetros totales | 22,4 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes, sin contexto textual) |
| Tipos de cuantización | no disponible; la model card solo publica el checkpoint en precisión original |
| Idiomas soportados | no aplica (modelo de visión, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt); el repo contiene best.pt con state_dict, model_name, class_names, imgsz, mean y std |
| Tarea | clasificación de imágenes (image-classification), 4 clases |
| Clases | daytime, night, dawn or dusk, unknown |
| Framework | timm / PyTorch |
| Tamaño del repo | 0,1 GB |
| Dataset de evaluación | dronefreak/BDD100K-Period-Classification |

## Arquitectura y entrenamiento

La model card identifica el modelo base como timm/repvit_m2_3.dist_300e_in1k, es decir, una RepViT-M2.3 con preentrenamiento en ImageNet-1k mediante destilación durante 300 épocas. RepViT es una familia de redes convolucionales móviles cuyo diseño de bloques se inspira en los transformadores de visión, y la referencia arXiv asociada en las etiquetas del repo es 2307.09283 (artículo de RepViT). El fine-tuning sustituye la cabeza de clasificación original por una de cuatro clases, definidas a partir del campo attributes.timeofday de BDD100K. La segunda referencia arXiv etiquetada, 1805.04687, corresponde al artículo de BDD100K.

El checkpoint distribuido incluye toda la información necesaria para reconstruir el preprocesado: nombre del modelo timm, resolución de entrada (imgsz), media y desviación típica de normalización y lista de nombres de clase. No se documentan en la información disponible el número de épocas de fine-tuning, el optimizador, la estrategia de aumento de datos, el tamaño del split de entrenamiento ni si se aplicaron técnicas de reequilibrado de clases, algo relevante dado el fuerte desbalance entre clases del conjunto de test. Tampoco se indica ningún mecanismo de RLHF, DPO u optimización por preferencias, que no aplican a esta tarea.

## Capacidades

- Clasificación de imágenes en cuatro categorías de franja horaria: daytime, night, dawn or dusk y unknown.
- Devuelve una distribución de probabilidad por clase (softmax), lo que permite aplicar umbrales de confianza propios.
- Entrada en RGB con redimensionado a la resolución fija almacenada en el checkpoint y normalización con los valores mean/std del propio checkpoint.
- Inferencia ligera: 22,4 M de parámetros, apta para CPU y para GPU de gama baja.
- No soporta tool calling ni function calling: es un clasificador de imágenes, no un modelo generativo.
- No soporta agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües: no procesa lenguaje.
- No realiza detección de objetos, segmentación, profundidad ni ninguna otra tarea densa.
- No dispone de modo "thinking" ni salidas multimodales más allá de la etiqueta de clase.

## Casos de uso

- Etiquetado automático de franjas horarias en datasets de conducción: dada una colección de imágenes sin anotar (por ejemplo, un volcado de dashcam), el modelo asigna una de las cuatro etiquetas y permite construir subconjuntos por condición de iluminación sin anotación manual.
- Curado y filtrado de datos para entrenamiento de percepción: seleccionar únicamente muestras nocturnas o de amanecer/atardecer para entrenar o evaluar detectores en condiciones de baja luminosidad, donde el rendimiento suele degradarse.
- Enrutado condicional en un pipeline de conducción autónoma: si la clasificación devuelve night con alta confianza, el sistema puede conmutar a un modelo de detección o de mejora de imagen especializado en escenas nocturnas.
- Análisis de robustez por dominio: cruzar la salida del clasificador con métricas de otro modelo para cuantificar la caída de precisión en daytime frente a dawn or dusk o night.
- Análisis de distribución de datasets de investigación: medir el reparto de franjas horarias de un corpus (por ejemplo, comprobar si un dataset es mayoritariamente diurno) y documentarlo en la ficha del dataset.
- Pre-etiquetado en flujos de anotación humana: generar etiquetas iniciales y priorizar la revisión manual en las clases con peor F1 (dawn or dusk, 60,72 %, y unknown, 75,41 %).
- Monitorización de flotas con cámara: clasificar fotogramas de vídeo a intervalos regulares para generar informes de actividad nocturna, cumplimiento de turnos o condiciones de operación.
- Despliegue en dispositivos embebidos o edge: con 22,4 M de parámetros y unas decenas de megabytes de pesos, cabe en plataformas con memoria limitada, aunque el throughput concreto no está documentado.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split test (10 000 imágenes) del dataset dronefreak/BDD100K-Period-Classification. Las métricas están marcadas como no verificadas (verified: false) en el model-index.

| Métrica | Valor | Split |
|---|---|---|
| Top-1 accuracy | 93,89 % | test (10 000 imágenes) |
| Macro F1 | 82,35 % | test |
| Balanced accuracy | 78,49 % | test |
| Macro precision | 87,72 % | test |
| Macro recall | 78,49 % | test |

Desglose por clase en el mismo split:

| Clase | Precision | Recall | F1 | Imágenes de test |
|---|---|---|---|---|
| dawn or dusk | 71,16 % | 52,96 % | 60,72 % | 778 |
| daytime | 93,51 % | 96,41 % | 94,93 % | 5 258 |
| night | 97,76 % | 98,88 % | 98,32 % | 3 929 |
| unknown | 88,46 % | 65,71 % | 75,41 % | 35 |

Comparativa con otros modelos evaluados por el autor en el mismo split (tabla Model Zoo de la model card, ordenada por top-1; la lista original aparece truncada en la fuente):

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 94,01 % | 83,19 % | 79,63 % | 87,95 % |
| EfficientViT-L1 | 93,98 % | 82,68 % | 78,45 % | 88,75 % |
| ConvNeXt-Atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % |
| EfficientViT-B2 | 93,92 % | 82,53 % | 78,88 % | 87,49 % |
| RepViT-M2.3 (este modelo) | 93,89 % | 82,35 % | 78,49 % | 87,72 % |
| YOLO11n | 93,79 % | 80,13 % | 75,19 % | 88,20 % |
| EfficientViT-B1 | 93,77 % | 82,63 % | 78,93 % | 88,38 % |
| EfficientViT-B3 | 93,77 % | 81,04 % | 76,29 % | 88,43 % |
| YOLO11s | 93,73 % | 81,22 % | 77,49 % | 86,42 % |
| EfficientViT-B0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % |
| YOLO26n | 93,61 % | 80,41 % | 77,72 % | 83,88 % |
| MobileNetV4-Conv-Small | 93,57 % | 80,22 % | 76,22 % | 86,06 % |
| YOLOv8n | 93,56 % | 80,85 % | 76,26 % | 87,87 % |
| MobileNetV4-Conv-Large | 93,46 % | 80,21 % | 74,88 % | 89,57 % |
| YOLOv8s | 93,46 % | 79,94 % | 75,66 % | 86,39 % |

No se han publicado en la información disponible resultados en benchmarks genéricos de visión (ImageNet, COCO u otros) para este checkpoint afinado.

## Requisitos de hardware

- VRAM estimada: con 22,4 M de parámetros, los pesos ocupan aproximadamente 90 MB en FP32 y 45 MB en FP16 (cálculo derivado del número de parámetros, no un dato publicado). La inferencia en lotes pequeños cabe holgadamente por debajo de 1 GB de VRAM, sumando activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre es suficiente; no requiere A100 ni H100. Modelos como RTX 4090, RTX 3060, T4 o incluso GPUs integradas modernas son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de las últimas generaciones, y también en CPU para volúmenes moderados.
- Opciones de despliegue: el uso documentado es timm + PyTorch, cargando best.pt y reconstruyendo el modelo con timm.create_model. No se documentan en la model card rutas de despliegue con vLLM, llama.cpp, Ollama o TGI (no aplican a un clasificador de imágenes). Al ser un modelo timm estándar, es exportable a ONNX o TorchScript con las utilidades habituales del ecosistema, aunque el autor no documenta ni verifica ese flujo.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por imagen ni de imágenes por segundo en ninguna configuración de hardware.

## Comparativa con modelos similares

Comparación con las alternativas del mismo zoo evaluadas en el mismo split de test. Los datos de parámetros y licencia de los modelos comparados no se detallan en la información disponible.

| Modelo | Parámetros | Top-1 | Macro F1 | Balanced accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RepViT-M2.3 (este modelo) | 22,4 M | 93,89 % | 82,35 % | 78,49 % | Apache-2.0 | HuggingFace (dronefreak/bdd100k-period-repvit_m2_3) |
| TinyViT-21M | ~21 M (según el nombre) | 94,01 % | 83,19 % | 79,63 % | no disponible | referenciado en el Model Zoo del autor |
| EfficientViT-L1 | no disponible | 93,98 % | 82,68 % | 78,45 % | no disponible | referenciado en el Model Zoo del autor |
| ConvNeXt-Atto | no disponible | 93,95 % | 80,75 % | 76,82 % | no disponible | referenciado en el Model Zoo del autor |
| YOLO11n | no disponible | 93,79 % | 80,13 % | 75,19 % | no disponible | referenciado en el Model Zoo del autor |

En términos de top-1, TinyViT-21M y EfficientViT-L1 quedan ligeramente por delante (94,01 % y 93,98 % frente a 93,89 %), mientras que RepViT-M2.3 supera en macro F1 a ConvNeXt-Atto, YOLO11n, MobileNetV4 y las variantes de YOLOv8. Las diferencias entre los primeros puestos son de décimas de punto, por lo que la elección debería depender de requisitos de latencia, tamaño y disponibilidad de pesos, datos que no están publicados para la mayoría de alternativas.

## Limitaciones y advertencias

- Métricas no verificadas: el model-index marca todos los resultados como verified: false; proceden del propio autor y no han sido replicados por terceros.
- Desbalance de clases severo en el test: daytime (5 258 imágenes) y night (3 929) dominan frente a dawn or dusk (778) y unknown (35). La accuracy global de 93,89 % está inflada por las clases mayoritarias.
- Rendimiento pobre en dawn or dusk: F1 de 60,72 % y recall de 52,96 %, lo que implica que casi la mitad de las imágenes de amanecer/atardecer se clasifican mal. Es la clase más relevante para casos de iluminación límite.
- Clase unknown poco fiable: la estimación se basa en 35 imágenes de test, insuficiente para extraer conclusiones robustas sobre esa clase.
- Tarea no oficial: la clasificación de franja horaria se deriva del campo attributes.timeofday de BDD100K; no existe una definición canónica del problema ni un protocolo de evaluación acordado por la comunidad.
- Sesgo de dominio: entrenado sobre BDD100K, un dataset de conducción con cámaras y geografía concretas. Puede degradarse con otras cámaras, otras regiones, condiciones meteorológicas atípicas o escenas no viales.
- Sin información sobre sesgos geográficos, demográficos o de composición del dataset de entrenamiento en la model card.
- Riesgo de alucinación: no aplica a un clasificador, pero sí existe riesgo de falsos positivos y de confianza mal calibrada; no se documenta ninguna calibración de probabilidades.
- Sin datos de entrenamiento reproducibles: no se especifican épocas, optimizador, aumentos ni composición del split de entrenamiento, lo que dificulta reproducir el resultado.
- Licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial del modelo. El dataset subyacente BDD100K tiene su propia licencia y condiciones de uso que deben revisarse por separado antes de un despliegue comercial.
- No hay garantías de mantenimiento: el repo registra 0 descargas y 0 likes, y no se documenta soporte ni actualizaciones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-repvit_m2_3
- Repositorio BDD100K-Toolkit (código de entrenamiento y evaluación): https://github.com/dronefreak/bdd100k-toolkit
- Dataset de clasificación de franja horaria: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Modelo base en HuggingFace: https://huggingface.co/timm/repvit_m2_3.dist_300e_in1k
- Artículo de RepViT (arXiv:2307.09283): https://arxiv.org/abs/2307.09283
- Artículo de BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
- Dataset de Kaggle homónimo mencionado en la model card: no disponible (la model card no incluye URL)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a conversores de unidades sin relación con el contenido.
