# dronefreak/bdd100k-period-tiny_vit_21m_224

## Resumen

El modelo `dronefreak/bdd100k-period-tiny_vit_21m_224` es un clasificador de imágenes basado en TinyViT-21M, fine-tuneado por el usuario dronefreak sobre el dataset BDD100K Period (Time-of-Day) Classification. Resuelve una tarea de clasificación de 4 clases que predice el momento del día en imágenes de escenas de conducción: daytime (día), night (noche), dawn or dusk (amanecer o atardecer) y unknown (desconocido). La etiqueta se deriva del campo `attributes.timeofday` de BDD100K y sigue la tarea homónima publicada en Kaggle, marcada por el propio autor como no oficial.

TinyViT-21M es un transformer de visión jerárquico con 20,6 millones de parámetros, diseñado para ser eficiente en dispositivos con recursos limitados. El checkpoint base `timm/tiny_vit_21m_224.dist_in22k` fue preentrenado mediante destilación sobre ImageNet-22k y después ajustado con imágenes de 224x224 píxeles para esta tarea de clasificación.

Su relevancia práctica es la de un componente auxiliar en pipelines de conducción autónoma: conocer el momento del día permite condicionar el comportamiento de otros módulos (detección de objetos, segmentación, control de exposición) y mejora la robustez frente a condiciones de iluminación adversas. El modelo se distribuye con licencia Apache-2.0 y se integra de forma nativa en el ecosistema `timm`, lo que simplifica su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer jerarquico (TinyViT) |
| Parametros totales | 20,6 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de imagen 224x224 px) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch `best.pt` (diccionario con `state_dict`, `model_name`, `class_names`, `imgsz`, `mean`, `std`) |

## Arquitectura y entrenamiento

El modelo se basa en TinyViT, un transformer de visión jerárquico presentado en el articulo arXiv:2207.10666 ("TinyViT: Fast Pretraining Distillation for Small Vision Transformers"). El checkpoint base `timm/tiny_vit_21m_224.dist_in22k` fue preentrenado con destilacion sobre ImageNet-22k, una estrategia que transfiere conocimiento de modelos mayores a redes pequenas. La variante empleada trabaja con entradas de 224x224 píxeles y cuenta con 20,6 millones de parametros.

El fine-tuning se realizo sobre el dataset BDD100K Period (Time-of-Day) Classification, derivado de las anotaciones de atributos de BDD100K (arXiv:1805.04687). El conjunto de test utilizado contiene 10000 imagenes y las clases tienen una distribucion muy desequilibrada: 5258 imagenes de daytime, 3929 de night, 778 de dawn or dusk y solo 35 de unknown. No se dispone de informacion sobre el numero de epocas, la tasa de aprendizaje, el esquema de aumento de datos ni si se aplicaron tecnicas de rebalanceo de clases; estos datos figuran como no disponibles en la informacion proporcionada. Todo el pipeline forma parte de BDD100K-Toolkit, una herramienta que prepara, entrena y evalua siempre sobre los mismos splits y con las mismas metricas.

## Capacidades

- Clasificacion de imagenes de escenas de conduccion en 4 categorias de momento del dia: `daytime`, `night`, `dawn or dusk` y `unknown`.
- Prediccion de probabilidad por clase (la salida del modelo se pasa por Softmax, como se muestra en el ejemplo de uso de la model card).
- Inferencia sobre imagenes RGB individuales a resolucion 224x224.
- Integracion nativa con `timm` para carga del modelo y con `huggingface_hub` para la descarga del checkpoint.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes, razonamiento multi-paso ni cadenas de herramientas.
- No tiene capacidades multilingues: no procesa texto.
- No dispone de modo "thinking", vision generativa, audio ni segmentacion; la unica tarea implementada es clasificacion de imagen.

## Casos de uso

- Preprocesado en pipelines de conduccion autonoma: clasificar el momento del dia de cada fotograma antes de pasarlo a un detector o segmentador, de modo que el sistema pueda activar parametros especificos para condiciones nocturnas o de baja luz.
- Ajuste adaptativo de sistemas ADAS: usar la prediccion `night` para forzar el encendido de faros, cambiar el perfil de exposicion de la camara o modificar los umbrales de alerta de colision segun la iluminacion.
- Curado y filtrado de datasets de conduccion: etiquetar automaticamente imagenes de grandes repositorios para equilibrar la proporcion de escenas diurnas y nocturnas antes de entrenar otros modelos.
- Analisis de datos de flotas: procesar grabaciones de vehiculos para generar estadisticas de uso por franja horaria (porcentaje de conduccion nocturna, distribucion horaria) sin necesidad de etiquetado manual.
- Etiquetado asistido: generar etiquetas previas de momento del dia sobre nuevos datasets de conduccion, que despues se revisan y corrigen por anotadores humanos, reduciendo el coste de anotacion.
- Deteccion de cambio de dominio: identificar en tiempo real si la distribucion visual de entrada cambia (por ejemplo, un salto brusco en la proporcion de predicciones nocturnas) y disparar la seleccion de un modelo especializado en baja iluminacion.
- Prototipado rapido en investigacion: modelo ligero (20,6 M de parametros) que permite realizar experimentos de clasificacion de escenas en portatiles o GPUs de gama media sin infraestructura pesada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split `test` (10000 imagenes) del dataset `dronefreak/BDD100K-Period-Classification`. Todos los valores estan marcados como no verificados (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 94,01 % |
| Macro F1 | 83,19 % |
| Balanced accuracy | 79,63 % |
| Macro precision | 87,95 % |
| Macro recall | 79,63 % |

Metricas por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 71,24 % | 54,76 % | 61,92 % | 778 |
| daytime | 93,56 % | 96,44 % | 94,98 % | 5258 |
| night | 98,10 % | 98,75 % | 98,43 % | 3929 |
| unknown | 88,89 % | 68,57 % | 77,42 % | 35 (muy pocas) |

Comparacion con otros modelos del mismo zoo (mismo split, ordenado por Top-1):

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| TinyViT-21M (este modelo) | 94,01 % | 83,19 % | 79,63 % | 87,95 % |
| EfficientViT-L1 | 93,98 % | 82,68 % | 78,45 % | 88,75 % |
| ConvNeXt-Atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % |
| EfficientViT-B2 | 93,92 % | 82,53 % | 78,88 % | 87,49 % |
| RepViT-M2.3 | 93,89 % | 82,35 % | 78,49 % | 87,72 % |
| YOLO11n | 93,79 % | 80,13 % | 75,19 % | 88,20 % |
| EfficientViT-B1 | 93,77 % | 82,63 % | 78,93 % | 88,38 % |
| EfficientViT-B3 | 93,77 % | 81,04 % | 76,29 % | 88,43 % |
| YOLO11s | 93,73 % | 81,22 % | 77,49 % | 86,42 % |
| EfficientViT-B0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % |
| YOLO26n | 93,61 % | 80,41 % | 77,72 % | 83,88 % |
| MobileNetV4-Conv-Small | 93,57 % | 80,22 % | 76,22 % | 86,06 % |
| YOLOv8n | 93,56 % | 80,85 % | 76,26 % | 87,87 % |
| MobileNetV4-Conv-Large | 93,46 % | 80,21 % | 74,88 % | 89,57 % |
| YOLOv8s | 93,46 % | 79,94 % | 75 % (valor truncado en la model card) | no disponible |

No se aportan resultados en benchmarks ajenos a este dataset (por ejemplo, MMLU, HumanEval o GSM8K, que no aplican a un modelo de vision). No se han publicado metricas de latencia ni throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 20,6 M de parametros, los pesos ocupan aproximadamente 82 MB en FP32 y 41 MB en FP16, sin contar activaciones ni buffers. La huella total en inferencia es del orden de unos cientos de MB.
- GPU recomendadas: cualquier GPU moderna es suficiente. Se puede ejecutar sin problemas en NVIDIA T4, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de estas GPU de gama alta.
- Cabe en GPU de consumo: si, cabe ampliamente en cualquier GPU de consumo con al menos 1 GB de VRAM (GTX 1050 Ti, RTX 2050, RTX 3060, etc.), e incluso en iGPU recientes.
- Tambien es viable en CPU: el modelo puede ejecutarse en CPU para inferencia por lotes pequenos, dado su reducido numero de parametros.
- Opciones de despliegue: al estar implementado en `timm` y PyTorch, puede exportarse a ONNX, TorchScript o TensorRT para inferencia optimizada. No se mencionan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria presentes en el model zoo del autor y evaluadas sobre el mismo split de test:

| Modelo | Parametros | Contexto | Top-1 | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TinyViT-21M (este modelo) | 20,6 M | 224x224 px | 94,01 % | 83,19 % | Apache-2.0 | HuggingFace + timm |
| EfficientViT-L1 | no disponible | no disponible | 93,98 % | 82,68 % | no disponible en la informacion proporcionada | no disponible |
| ConvNeXt-Atto | no disponible | no disponible | 93,95 % | 80,75 % | no disponible en la informacion proporcionada | no disponible |
| YOLO11n | no disponible | no disponible | 93,79 % | 80,13 % | no disponible en la informacion proporcionada | no disponible |

En terminos de Top-1 y Macro F1, TinyViT-21M se situa en cabeza del ranking del zoo, aunque las diferencias con EfficientViT-L1 y ConvNeXt-Atto en Top-1 son de decimas (0,03 y 0,06 puntos respectivamente). La ventaja es mas clara en Macro F1, donde supera a EfficientViT-L1 en 0,51 puntos y a ConvNeXt-Atto en 2,44 puntos. No se dispone de datos de tamano de parametros, licencia ni disponibilidad de los competidores mas alla de lo indicado en la model card.

## Limitaciones y advertencias

- La clase `dawn or dusk` presenta un rendimiento notablemente inferior: precision 71,24 %, recall 54,76 % y F1 61,92 %, muy por debajo de las clases `daytime` y `night`. Es probable que los errores del modelo se concentren en amaneceres y atardeceres.
- La clase `unknown` solo tiene 35 imagenes en test; las metricas asociadas (88,89 % de precision, 68,57 % de recall) tienen una varianza muy alta y no son fiables.
- Existe un fuerte desequilibrio de clases en el dataset (5258 / 3929 / 778 / 35 imagenes), lo que puede sesgar las predicciones hacia las clases mayoritarias.
- Tarea no oficial: la clasificacion del momento del dia en BDD100K no forma parte del benchmark oficial de BDD100K, sino que sigue una version publicada en Kaggle. Los resultados no son directamente comparables con otros trabajos que usen splits o etiquetas distintas.
- Metricas no verificadas: todos los resultados del `model-index` figuran con `verified: false`; no han sido validados por un tercero independiente.
- Sesgo geografico del dataset: BDD100K fue recogido principalmente en Estados Unidos, por lo que el modelo podria degradarse en escenas de otras regiones con iluminacion, senalizacion o arquitectura urbana distintas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza en imagenes fuera de distribucion (por ejemplo, escenas de interior, imagenes sinteticas o aereas).
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de licencia y el archivo NOTICE correspondiente. Conviene verificar la licencia del dataset BDD100K por separado, ya que sus terminos de uso son independientes de la del modelo.
- Caveat para produccion: al ser un modelo pequeno con solo 4 clases, no debe usarse como unico criterio de decision en sistemas criticos de seguridad; conviene combinarlo con otros sensores (LDR, sensor de luz) y con logica de consenso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-tiny_vit_21m_224
- Modelo base: https://huggingface.co/timm/tiny_vit_21m_224.dist_in22k
- Dataset de entrenamiento: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Paper de TinyViT (arXiv:2207.10666): https://arxiv.org/abs/2207.10666
- Paper de BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
