# dronefreak/bdd100k-scenario-efficientvit_b3

## Resumen

EfficientViT-B3 finetuned on BDD100K Scenario Classification es un clasificador de imagenes de escenas de conduccion desarrollado por el usuario dronefreak. Parte del checkpoint preentrenado `timm/efficientvit_b3.r224_in1k` y se ajusta sobre el conjunto BDD100K Scenario Classification para resolver una tarea de 7 clases: city street, highway, residential, parking lot, gas stations, tunnel y unknown. Con 46,1 millones de parametros y una licencia Apache-2.0, es un modelo compacto orientado a inferencia eficiente en entornos con recursos limitados.

La relevancia de esta ficha esta en que el modelo forma parte de BDD100K-Toolkit, una herramienta no oficial que estandariza la preparacion de datos, el entrenamiento y la evaluacion de BDD100K sobre los mismos splits y metricas. Esto permite comparaciones reproducibles entre arquitecturas sobre la misma tarea, algo poco habitual en los ajustes publicados de forma aislada.

No es un modelo generativo ni multimodal: es un clasificador de imagen pura, por lo que no admite tool calling, agentes, contexto textual ni capacidades multilingues. Su valor practico esta en el etiquetado automatico de escenas de conduccion y en pipelines de vision para automocion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-B3 (vision transformer con atencion lineal multi-escala) |
| Parametros totales | 46,1 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes) |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones oficiales) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`best.pt` con `state_dict`, `class_names`, `mean`, `std`, `imgsz`) |
| Resolucion de entrada | 224 x 224 (heredada de la variante `r224_in1k`; el valor exacto se lee de `imgsz` en el checkpoint) |
| Numero de clases | 7 |
| Framework | timm / PyTorch |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo base es EfficientViT-B3, una familia de vision transformers disenada para prediccion densa de alta resolucion mediante atencion lineal multi-escala (paper arXiv:2205.14756). En lugar de la atencion softmax cuadratica de los ViT clasicos, EfficientViT usa una atencion lineal que reduce el coste computacional manteniendo capacidad de representacion. La variante B3 tiene 46,1 M de parametros y fue preentrenada en ImageNet-1K a 224 x 224 (`r224_in1k`).

El ajuste se realiza sobre el dataset BDD100K Scenario Classification, una tarea no oficial derivada del campo `attributes.scene` de BDD100K (arXiv:1805.04687). El autor solo documenta el proceso de finetuning y evaluacion mediante BDD100K-Toolkit; no se especifican en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del split de train, el numero de epocas, la estrategia de aumento de datos ni si se aplicaron tecnicas como label smoothing o class weighting. El checkpoint guarda la configuracion de preprocesado (media, desviacion estandar e `imgsz`) necesaria para reproducir la inferencia.

## Capacidades

- Clasificacion de imagenes en 7 categorias de escena de conduccion: city street, highway, residential, parking lot, gas stations, tunnel y unknown.
- Salida de probabilidades por clase (softmax), apta para umbralizar o para usar la confianza como filtro de calidad.
- Inferencia sobre imagenes individuales en formato RGB con preprocesado estandar (resize, ToTensor, Normalize).
- Modelo puramente discriminativo: no genera texto, no razona, no ejecuta herramientas ni mantiene conversaciones.
- No dispone de modo thinking, vision-language, audio ni capacidades de agente.
- No soporta tool calling ni function calling.
- No tiene capacidades multilingues al no procesar texto.

## Casos de uso

- Etiquetado automatico de escenas en datasets de conduccion: dado un lote de imagenes o frames extraidos de video, el modelo asigna una de las 7 clases y permite preanotar el campo `attributes.scene` a gran escala, reduciendo el trabajo manual de anotacion en proyectos de BDD100K.
- Filtrado y curaduria de datos para entrenamiento: clasificar un corpus de imagenes de carretera para equilibrar la distribucion de escenas o descartar las que caigan en la clase unknown antes de entrenar otros modelos.
- Preprocesado en pipelines de percepcion para conduccion autonoma: usar la etiqueta de escena como senal de enrutado que active modulos especializados (por ejemplo, un detector distinto para highway frente a parking lot).
- Analitica de flotas y video dashcam: procesar grabaciones de vehiculos para obtener estadisticas agregadas de los tipos de entorno recorridos por una flota, utiles para mantenimiento predictivo o planificacion de rutas.
- Control de calidad en sistemas de mapeo: verificar que las imagenes capturadas en campo corresponden realmente al tipo de escena declarado en los metadatos del levantamiento.
- Modulo de bajo coste para dispositivos embebidos: con 46,1 M de parametros, el modelo puede ejecutarse en CPU o en GPUs de gama baja dentro del vehiculo para tareas de clasificacion sencillas sin depender de conectividad.
- Investigacion comparativa de arquitecturas: servir como punto de referencia en estudios de eficiencia frente a ResNet-18, MobileNetV4, TinyViT o variantes de YOLO sobre la misma tarea y el mismo split.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split `test` (10 000 imagenes) de BDD100K Scenario Classification. No verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 79,32 % |
| Top-5 accuracy | 99,97 % |
| Macro F1 | 57,70 % |
| Balanced accuracy | 53,59 % |
| Macro precision | 71,54 % |
| Macro recall | 53,59 % |

Desglose por clase (mismo split):

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| city street | 81,10 % | 88,30 % | 84,55 % | 6112 |
| gas stations | 66,67 % | 28,57 % | 40,00 % | 7 |
| highway | 79,15 % | 70,63 % | 74,65 % | 2499 |
| parking lot | 70,00 % | 42,86 % | 53,16 % | 49 |
| residential | 68,66 % | 57,70 % | 62,71 % | 1253 |
| tunnel | 85,19 % | 85,19 % | 85,19 % | 27 |
| unknown | 50,00 % | 1,89 % | 3,64 % | 53 |

## Requisitos de hardware

- Peso de los parametros: aproximadamente 184 MB en FP32 y unos 92 MB en FP16, calculado sobre los 46,1 M de parametros.
- VRAM estimada para inferencia: menos de 1 GB en FP32 a 224 x 224 con batch pequeno. La memoria la domina el coste de activaciones, no los pesos.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en GPUs integradas y en CPU.
- GPU recomendadas para procesamiento por lotes a gran escala: A100, H100 o L4 para maximizar throughput cuando se etiquetan millones de frames.
- Opciones de despliegue: la model card proporciona un script de inferencia con timm y PyTorch. Al ser un modelo de clasificacion estandar de timm, es exportable a ONNX o TorchScript y desplegable con ONNX Runtime, TensorRT o TorchServe. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

El propio autor publica un model zoo evaluado sobre el mismo split `test` de BDD100K Scenario Classification. La informacion disponible esta truncada y solo incluye las filas superiores de la tabla, ordenadas por Top-1 accuracy.

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| EfficientViT-B3 (este modelo) | 79,32 % | 57,70 % | 53,59 % | 71,54 % |
| YOLO11n | 78,58 % | 49,47 % | 46,05 % | 60,98 % |
| YOLO11s | 78,58 % | 49,18 % | 45,24 % | 61,98 % |
| MobileNetV4-Conv-Small | 78,20 % | 52,89 % | 48,69 % | 61,41 % |
| MobileNetV4-Conv-Large | 78,15 % | 50,00 % | 45,48 % | 63,03 % |
| EfficientViT-B1 | 78,01 % | 54,15 % | 49,41 % | 70,13 % |
| TinyViT-21M | 77,99 % | 62,52 % | 66,21 % | 59,66 % |
| YOLO26s | 77,81 % | 52,24 % | 49,23 % | 58,28 % |
| ConvNeXt-Atto | 77,44 % | 61,06 % | 60,34 % | 67,92 % |
| YOLOv8s | 77,15 % | 48,43 % | 46,64 % | 51,16 % |
| ResNet-18 | 77,14 % | 47,29 % | 44,83 % | 54,25 % |

Lectura de la tabla: EfficientViT-B3 lidera en Top-1 y en macro precision entre los modelos listados, pero TinyViT-21M y ConvNeXt-Atto obtienen mejor macro F1 y balanced accuracy, lo que indica un comportamiento mas equilibrado en las clases minoritarias. Para tareas donde las clases raras importan, esos modelos pueden ser preferibles pese a un Top-1 ligeramente inferior. Para el resto de modelos comparables fuera de este model zoo (por ejemplo, ViT-B/16 o DeiT ajustados a la misma tarea) no hay datos disponibles.

## Limitaciones y advertencias

- Fuerte desequilibrio de clases: el F1 de la clase unknown es del 3,64 % y el recall del 1,89 %, con solo 53 imagenes en test. gas stations (7 imagenes), parking lot (49) y tunnel (27) son clases con soporte estadistico muy bajo, por lo que sus metricas son poco fiables y el modelo las detecta mal.
- La diferencia entre Top-1 accuracy (79,32 %) y balanced accuracy (53,59 %) indica que el rendimiento esta dominado por city street, que concentra 6112 de las 10 000 imagenes de test. La exactitud global sobreestima la calidad real del clasificador.
- Tarea no oficial: la taxonomia de 7 clases deriva del campo `attributes.scene` de BDD100K y sigue un dataset de Kaggle. No es una tarea de referencia del benchmark original, lo que dificulta la comparacion con literatura publicada.
- Metricas no verificadas: los resultados del model-index estan marcados como `verified: false`. No existe validacion independiente.
- Riesgo de confusion en escenas ambiguas o con mezcla de dominios (por ejemplo, tramos urbanos con aspecto de autovia), agravado por el desequilibrio de clases.
- Sesgos de dominio: el modelo hereda los sesgos geograficos y de condiciones de captura de BDD100K, mayoritariamente recogido en Estados Unidos. El rendimiento puede degradarse en otros paises, condiciones meteorologicas extremas o iluminacion nocturna no representadas.
- Detalles de entrenamiento no documentados: no se especifican epocas, aumentos de datos, estrategia de balanceo ni semillas, lo que limita la reproducibilidad estricta.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el usuario debe asumir la responsabilidad sobre el cumplimiento de las condiciones de uso del dataset BDD100K subyacente.
- No apto como unico sistema de decision en conduccion autonoma: es un clasificador de escena auxiliar, sin garantias de robustez ante casos adversarios ni ante entradas fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-scenario-efficientvit_b3
- Modelo base: https://huggingface.co/timm/efficientvit_b3.r224_in1k
- Dataset de la tarea: https://huggingface.co/datasets/dronefreak/BDD100K-Scenario-Classification
- BDD100K-Toolkit (codigo de entrenamiento y evaluacion): https://github.com/dronefreak/bdd100k-toolkit
- Variante menor de la misma familia (EfficientViT-B0): https://huggingface.co/dronefreak/bdd100k-scenario-efficientvit_b0
- Modelo comparable en el model zoo (YOLO11s ajustado a BDD100K): https://huggingface.co/dronefreak/bdd100k-yolo11s
- Repositorio oficial del dataset BDD100K: https://github.com/bdd100k/bdd100k
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- Paper de EfficientViT: https://arxiv.org/abs/2205.14756
