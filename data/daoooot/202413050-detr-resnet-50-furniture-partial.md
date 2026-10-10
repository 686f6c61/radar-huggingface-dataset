# daoooot/202413050-detr-resnet-50-furniture-partial

## Resumen

DETR furniture partial es un modelo de deteccion de objetos basado en la arquitectura DETR (Detection Transformer) con backbone ResNet-50, afinado a partir de facebook/detr-resnet-50 para detectar muebles en imagenes. Lo publica el usuario daoooot (identificado en la model card como el estudiante 김한별, matricula 202413050) y esta pensado como un detector de caracter educativo dentro de un trabajo academico. El repositorio tiene un tamano de 0,2 GB y contiene pesos en formato safetensors compatibles con la libreria transformers.

El modelo se entrena sobre el dataset Francesco/furniture-ngpea (procedente de Roboflow) en una revision fijada, con particiones de entrenamiento, validacion y test separadas. Se trata de un ajuste "partial": de los 41.608.649 parametros totales solo 18.047.497 (un 43,49 %) fueron entrenables, lo que sugiere una congelacion parcial del backbone o de parte de la red. El entrenamiento se realizo durante 100 epocas sobre una GPU Tesla T4, con un pico de VRAM de solo 0,885 GB y una duracion de sesion de 3374 s.

Es relevante como ejemplo reproducible de fine-tuning de DETR en un dominio cerrado (mobiliario), con metricas de test publicadas por el propio autor. No es un modelo generalista: esta especializado en las clases del dataset de muebles (Sofa y Table tienen AP reportado; Chair y la clase generica "furniture" aparecen como null). La licencia es Apache 2.0, aunque la model card advierte de que la licencia del dataset debe consultarse en su pagina original de Roboflow.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (Detection Transformer) con backbone ResNet-50 |
| Parametros totales | 41.608.649 |
| Parametros activos | no aplica (no es MoE); parametros entrenables: 18.047.497 (43,49 %) |
| Longitud de contexto | no disponible (modelo de deteccion de objetos, no generativo) |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones; el modelo es exportable a fp16/int8/ONNX, pero no hay artefactos oficiales) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DETR original: un backbone convolucional ResNet-50 que extrae caracteristicas de la imagen, un encoder-decoder Transformer que modela las relaciones globales entre regiones y un cabezal de prediccion que produce un conjunto fijo de detecciones mediante matching bipartito (sin anchors ni NMS). El modelo base es facebook/detr-resnet-50. En esta version "partial" solo se actualizaron 18.047.497 de los 41.608.649 parametros, lo que indica que una parte de la red permanecio congelada durante el ajuste; el resto de la arquitectura se mantiene intacta.

El entrenamiento uso el dataset Francesco/furniture-ngpea con revision fijada 5c0e1d3d0f5a95bb916995c8ad34778cd2ca6c7c, con particiones de entrenamiento, validacion y test separadas. Se configuro un perfil "final" de 100 epocas, resolucion de imagen de 480 px, batch efectivo de 8 y semilla 42. La seleccion del mejor checkpoint se hizo por perdida de validacion (mejor valor: 0,1884; checkpoint-4104). La sesion duro 3374,34 s en una Tesla T4 con torch 2.11.0+cu130, con un pico de VRAM de 0,885 GB y un throughput de 13,456 muestras/s (1,689 pasos/s). La perdida final de entrenamiento fue 0,2154. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni fases de RLHF/DPO, que no aplican a un detector.

## Capacidades

- Deteccion de objetos en imagenes dentro del dominio de mobiliario, con prediccion conjunta de cajas y clases.
- Deteccion de las clases presentes en el dataset de entrenamiento (la model card reporta metricas desglosadas para Sofa y Table; Chair y "furniture" aparecen como null).
- Inferencia end-to-end sin necesidad de supresion de no maximos (NMS), caracteristica propia de DETR.
- Integracion directa con el pipeline object-detection de transformers.
- No se documenta soporte de tool calling ni function calling (no aplica a un modelo de vision).
- No se documenta soporte de agentes ni razonamiento multi-paso (no aplica).
- Capacidades multilingues: no disponible (el modelo no procesa ni genera texto).
- No se documentan capacidades especiales como modo thinking, vision-lenguaje, audio u OCR.

## Casos de uso

- Inventario de mobiliario en interiores: el modelo puede procesar fotografias de habitaciones y devolver cajas y etiquetas de muebles, util para catalogacion automatica de activos en fotos de inmuebles.
- Analisis de imagenes en portales inmobiliarios: deteccion de sofas y mesas para etiquetado automatico de anuncios y filtrado por contenido.
- Verificacion de montaje o entrega: comparar la presencia de piezas de mobiliario esperadas frente a lo detectado en una fotografia de la estancia.
- Prototipado academico y docencia: sirve como ejemplo reproducible de fine-tuning de DETR con particiones separadas, metricas de validacion y test y trazabilidad de la revision del dataset.
- Preprocesado para pipelines de vision mayores: usar las detecciones como regiones de interes antes de un segundo modelo (por ejemplo, clasificacion o segmentacion de cada mueble).
- Control de calidad en fabricacion de muebles: comprobar la presencia y posicion de componentes en imagenes de linea de produccion, siempre que las clases coincidan con las del dataset de entrenamiento.
- Generacion de datos anotados asistida: preetiquetar imagenes de muebles para revision humana posterior en herramientas de anotacion.

## Benchmarks y rendimiento

Metricas de test publicadas por el autor (dataset Francesco/furniture-ngpea, revision fijada):

| Metrica | Valor |
|---|---|
| AP | 0,8988 |
| AP50 | 0,9868 |
| AP75 | 0,9601 |
| AP_small | -1,0 (no evaluado) |
| AP_medium | -1,0 (no evaluado) |
| AP_large | 0,8988 |
| AR1 | 0,9279 |
| AR10 | 0,9304 |
| AR100 | 0,9304 |
| AR_small | -1,0 (no evaluado) |
| AR_medium | -1,0 (no evaluado) |
| AR_large | 0,9304 |

AP por clase reportado en la model card:

| Clase | AP |
|---|---|
| Sofa | 0,9138 |
| Table | 0,8839 |
| Chair | null (no reportado) |
| furniture | null (no reportado) |

No se han publicado resultados de benchmarks estandar (COCO, MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares sobre el mismo dataset. Los valores AP_small y AP_medium a -1,0 indican que esas franjas no se evaluaron (probablemente por ausencia de objetos de esos tamanos en el conjunto de test).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 41,6 M de parametros, los pesos ocupan aproximadamente 166 MB en fp32, 83 MB en fp16 y 42 MB en int8, mas el consumo de activaciones segun resolucion de entrada.
- Entrenamiento de referencia: se completo en una Tesla T4 con un pico de VRAM de 0,885 GB, resolucion 480 px y batch efectivo de 8.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia; la propia model card demuestra que una Tesla T4 (16 GB) es valida para el ajuste. Tambien cabe en GPUs de consumo como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores, e incluso en CPU para lotes pequenos.
- Cabe en GPU de consumo: si, con margen amplio dado el reducido tamano del modelo.
- Opciones de despliegue: transformers con pipeline object-detection; exportacion a ONNX o TensorRT para produccion; TorchScript. No aplican frameworks de LLM como llama.cpp, Ollama o vLLM, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no se publican datos de latencia de inferencia. El unico dato de rendimiento disponible es de entrenamiento (13,456 muestras/s y 1,689 pasos/s en Tesla T4 con batch efectivo 8), que no es extrapolable directamente a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| daoooot/202413050-detr-resnet-50-furniture-partial | 41,6 M | Deteccion de objetos (muebles) | no aplica | apache-2.0 | HuggingFace, 0 descargas |
| facebook/detr-resnet-50 | 41,5 M (aprox.) | Deteccion de objetos generalista (COCO) | no aplica | apache-2.0 | HuggingFace, ampliamente usado |
| DETR-resnet-101 | mayor que ResNet-50 | Deteccion de objetos generalista (COCO) | no aplica | apache-2.0 | HuggingFace |
| Modelos tipo YOLO (familia de detectores one-stage) | variable (desde pocos millones) | Deteccion de objetos en tiempo real | no aplica | variable segun version | Multiples repositorios |

La comparacion de rendimiento directo no es posible con los datos disponibles: las metricas publicadas corresponden a un dataset de muebles concreto (Francesco/furniture-ngpea) y no a un benchmark estandar, por lo que no se pueden contrastar con los valores de COCO de los modelos anteriores. En cuanto a disponibilidad, este modelo tiene 0 descargas y 0 likes, frente a los modelos base de referencia, mucho mas extendidos. La comparacion de parametros y licencia es la unica que puede hacerse con rigor a partir de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: solo reconoce las clases vistas en su dataset de muebles. Fuera de ese dominio se espera un rendimiento bajo.
- Metricas incompletas: AP por clase solo se reporta para Sofa y Table; Chair y la clase generica "furniture" aparecen como null, por lo que no hay evidencia publicada de su rendimiento en esas clases.
- Objetos pequenos y medianos: AP_small, AP_medium, AR_small y AR_medium valen -1,0, lo que indica que no se evaluaron. No hay garantia de deteccion fiable de muebles pequenos o a media distancia.
- Alucinacion y falsos positivos: como cualquier detector, puede producir cajas espurias en escenas con oclusiones, desorden o iluminacion atipica. La propia model card advierte de que el rendimiento puede diferir en habitaciones reales desordenadas.
- Sin resultados en benchmarks estandar: no hay metricas en COCO ni comparaciones reproducibles con otros detectores, lo que dificulta la evaluacion objetiva frente a alternativas.
- Licencia del modelo Apache 2.0, apta para uso comercial. Sin embargo, la model card indica expresamente que la licencia del dataset debe consultarse en su pagina original de Roboflow, y que la tarjeta del dataset lista "cc" sin detallar la variante; conviene verificar los terminos antes de un uso comercial.
- Contexto educativo: el autor declara que es un detector educativo y que su rendimiento puede diferir en entornos reales. No esta validado para produccion.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin documentacion adicional sobre composicion exacta del dataset, clases finales ni proceso de congelacion de parametros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/daoooot/202413050-detr-resnet-50-furniture-partial
- Modelo base: https://huggingface.co/facebook/detr-resnet-50
- Dataset: https://huggingface.co/datasets/Francesco/furniture-ngpea
- Pagina original del dataset en Roboflow: no disponible en la informacion proporcionada (la model card remite a ella sin enlace explicito)
- Paper de DETR (End-to-End Object Detection with Transformers): no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
