# dronefreak/bdd100k-scenario-tiny_vit_21m_224

## Resumen

TinyViT-21M finetuned on BDD100K Scenario Classification es un clasificador de imágenes desarrollado por el usuario dronefreak que asigna cada fotografía de conducción a una de siete categorías de escenario: calle urbana, autopista, zona residencial, aparcamiento, gasolinera, túnel y desconocido. Parte del checkpoint preentrenado timm/tiny_vit_21m_224.dist_in22k, un TinyViT de aproximadamente 20,6 millones de parámetros con entrada de 224x224 píxeles, y se ha ajustado sobre la tarea derivada del campo attributes.scene de BDD100K.

El modelo forma parte de BDD100K-Toolkit, un conjunto de herramientas sin dependencias pesadas para preparar BDD100K, entrenar modelos y evaluarlos con las mismas métricas sobre los mismos splits. Se trata de una tarea no oficial, inspirada en el dataset homónimo publicado en Kaggle, y su propósito es servir como referencia ligera y reproducible dentro de ese ecosistema.

Su relevancia práctica radica en el equilibrio entre tamano y rendimiento: con solo 20,6 M de parámetros alcanza un 77,99 % de top-1 y un 99,96 % de top-5, y obtiene el mejor macro F1 (62,52 %) y la mejor exactitud balanceada (66,21 %) de todo el model zoo comparado, lo que lo hace atractivo para clasificación de escenas en pipelines de conducción autónoma donde el coste computacional es crítico y las clases están desbalanceadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (vision transformer jerarquico con atencion local y bloques convolucionales) |
| Parametros totales | ~20,6 M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 224x224 pixeles) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica el checkpoint en punto flotante; no se distribuyen variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt, archivo best.pt con state_dict, class_names, mean, std, imgsz y model_name) |
| Numero de clases | 7 (city street, gas stations, highway, parking lot, residential, tunnel, unknown) |
| Resolucion de entrada | 224x224 |
| Framework | timm |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo base es TinyViT-21M, una arquitectura de vision transformer jerarquica disenada para ser eficiente. Combina bloques convolucionales con mecanismos de atencion por ventanas en etapas tempranas y atencion global en etapas profundas, reduciendo el coste cuadratico de la atencion sobre imágenes de alta resolución. El checkpoint de partida, timm/tiny_vit_21m_224.dist_in22k, se preentreno mediante destilacion de un modelo mayor sobre ImageNet-22k, segun la linea de trabajo descrita en el articulo TinyViT (arXiv:2207.10666).

Sobre ese backbone se ha realizado un ajuste fino supervisado de clasificación con 7 clases sobre el dataset BDD100K Scenario Classification, derivado del campo de atributos de escena de BDD100K (arXiv:1805.04687). La model card no detalla el numero de tokens de imagen vistos, la composicion exacta del split de entrenamiento, ni si se emplearon tecnicas de alineacion como RLHF o DPO, por lo que esos datos deben considerarse no disponibles. La evaluacion se realiza sobre el split test de 10.000 imágenes, que segun el autor corresponde al conjunto de validacion oficial de BDD100K. El preprocesado es el estandar de timm: redimensionado a 224x224, conversion a tensor y normalizacion con la media y desviacion incluidas en el propio checkpoint.

## Capacidades

- Clasificación de imágenes en 7 categorías de escena de conducción, con salida de probabilidades por clase.
- Distincion entre entornos estructuralmente distintos: calle urbana, autopista, residencial, aparcamiento, gasolinera, túnel y desconocido.
- Inferencia reproducible: el checkpoint incluye class_names, media, desviacion tipica, tamano de imagen y nombre de modelo, lo que permite reconstruir el pipeline exacto de preprocesado.
- Integracion directa con timm y PyTorch, sin dependencias propietarias.
- Ejecucion en CPU y GPU, con un coste de memoria muy bajo dado su tamano.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de imágenes.
- No dispone de capacidades multilingues ni de procesamiento de audio o vídeo de forma nativa; el modelo opera fotograma a fotograma sobre imágenes sueltas.

## Casos de uso

- Etiquetado previo de datasets de conducción: el modelo puede clasificar automaticamente grandes volumenes de fotogramas por escenario antes de una revision humana, reduciendo el coste de anotacion en tareas como deteccion de objetos o segmentacion.
- Enrutado contextual en sistemas ADAS: dado un fotograma, el clasificador decide si el vehiculo circula por autopista o por calle urbana, lo que permite activar distintas politicas de asistencia (por ejemplo, limites de velocidad o comportamiento de cambio de carril).
- Filtrado y curacion de corpus de vídeo: al procesar secuencias a baja frecuencia (por ejemplo, 1 fps), se puede segmentar un clip largo en tramos de autopista, túnel y zona residencial y generar indices navegables.
- Seleccion de escenas para validacion de seguridad: identificar fotogramas de túnel, gasolinera o aparcamiento permite construir conjuntos de prueba especificos para escenarios minoritarios y potencialmente criticos.
- Monitorizacion de flotas: clasificar imágenes de camaras a bordo para generar informes agregados sobre el tipo de entorno donde opera cada vehiculo, con bajo coste de computo embebido.
- Componente ligero en un pipeline de percepción por etapas: al ocupar pocos recursos, puede ejecutarse en paralelo a un detector de objetos y aportar la etiqueta de escena como contexto adicional para el modulo de planificacion.
- Prototipado e investigacion: sirve como baseline reproducible para comparar nuevas tecnicas de clasificacion de escenas dentro del ecosistema BDD100K-Toolkit, ya que todas las variantes se evaluan sobre el mismo split y con las mismas métricas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split test (10.000 imágenes). El campo verified esta marcado como false en el model-index, por lo que no han sido validados de forma independiente.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 77,99 % |
| Top-5 accuracy | 99,96 % |
| Macro F1 | 62,52 % |
| Exactitud balanceada (macro recall) | 66,21 % |
| Macro precision | 59,66 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| city street | 85,59 % | 80,30 % | 82,86 % | 6112 |
| gas stations | 57,14 % | 57,14 % | 57,14 % | 7 |
| highway | 73,91 % | 76,19 % | 75,03 % | 2499 |
| parking lot | 48,48 % | 65,31 % | 55,65 % | 49 |
| residential | 60,29 % | 72,94 % | 66,02 % | 1253 |
| tunnel | 71,88 % | 85,19 % | 77,97 % | 27 |
| unknown | 20,29 % | 26,42 % | 22,95 % | 53 |

Comparativa dentro del model zoo del propio autor (mismo split y mismas métricas, ordenado por top-1):

| Modelo | Top-1 | Macro F1 | Exactitud balanceada | Macro precision |
|---|---|---|---|---|
| EfficientViT-B3 | 79,32 % | 57,70 % | 53,59 % | 71,54 % |
| YOLO11n | 78,58 % | 49,47 % | 46,05 % | 60,98 % |
| YOLO11s | 78,58 % | 49,18 % | 45,24 % | 61,98 % |
| MobileNetV4-Conv-Small | 78,20 % | 52,89 % | 48,69 % | 61,41 % |
| MobileNetV4-Conv-Large | 78,15 % | 50,00 % | 45,48 % | 63,03 % |
| EfficientViT-B1 | 78,01 % | 54,15 % | 49,41 % | 70,13 % |
| TinyViT-21M (este modelo) | 77,99 % | 62,52 % | 66,21 % | 59,66 % |
| YOLO26s | 77,81 % | 52,24 % | 49,23 % | 58,28 % |
| ConvNeXt-Atto | 77,44 % | 61,06 % | 60,34 % | 67,92 % |
| YOLOv8s | 77,15 % | 48,43 % | 46,64 % | 51,16 % |
| ResNet-18 | 77,14 % | 47,29 % | 44,83 % | 54,25 % |

La tabla del model zoo aparece truncada en la informacion proporcionada a partir de YOLO26n, por lo que no se incluyen las entradas restantes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 20,6 M de parámetros, los pesos en FP32 ocupan aproximadamente 82 MB y en FP16 unos 41 MB; el grueso del consumo proviene de las activaciones y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente. Modelos como NVIDIA T4, GTX 1650, RTX 3050 o superiores funcionan sin problemas. Para lotes grandes o inferencia de alto throughput, una RTX 4090, A100 o H100 ofrecen un margen muy amplio.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en aceleradores integrados o en CPU.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch para timm, por lo que la via natural es PyTorch en Python. Al no publicarse pesos ONNX, TensorRT ni GGUF, no hay soporte directo documentado en llama.cpp, Ollama, vLLM o TGI; la exportacion a ONNX o TensorRT requeriria una conversion manual por parte del usuario.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de latencia, throughput ni rendimiento por hardware.

## Comparativa con modelos similares

Todos los modelos de la tabla siguiente fueron entrenados y evaluados por el mismo autor sobre el mismo split test de 10.000 imágenes, lo que permite una comparacion directa.

| Modelo | Parametros | Top-1 | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyViT-21M (este modelo) | ~20,6 M | 77,99 % | 62,52 % | Apache-2.0 | HuggingFace, timm |
| EfficientViT-B3 | no disponible en la informacion proporcionada | 79,32 % | 57,70 % | no disponible en la informacion proporcionada | HuggingFace, timm |
| ConvNeXt-Atto | no disponible en la informacion proporcionada | 77,44 % | 61,06 % | no disponible en la informacion proporcionada | HuggingFace, timm |
| MobileNetV4-Conv-Large | no disponible en la informacion proporcionada | 78,15 % | 50,00 % | no disponible en la informacion proporcionada | HuggingFace, timm |
| ResNet-18 | no disponible en la informacion proporcionada | 77,14 % | 47,29 % | no disponible en la informacion proporcionada | HuggingFace, timm |

La diferencia clave frente a los alternativas es que TinyViT-21M prioriza el equilibrio entre clases por encima del top-1 bruto: cede 1,33 puntos de top-1 frente a EfficientViT-B3, pero gana 4,82 puntos de macro F1 y 12,62 puntos de exactitud balanceada. ConvNeXt-Atto es el competidor mas cercano en macro F1, con 1,46 puntos menos y 3,13 puntos menos de top-1.

## Limitaciones y advertencias

- Las métricas estan marcadas como no verificadas (verified: false) en el model-index; proceden del autor y no han sido replicadas por terceros.
- Fuerte desbalanceo de clases: seis de las siete categorias tienen menos de 100 imagenes en el split de evaluacion, salvo highway, residential y city street. Las métricas de gas stations, parking lot y tunnel se calculan sobre 7, 49 y 27 imágenes respectivamente, por lo que su fiabilidad estadistica es muy baja.
- La clase unknown obtiene un F1 de solo 22,95 % y una precision del 20,29 %, lo que indica que el modelo confunde con frecuencia imagenes ambiguas con clases concretas.
- La clase parking lot presenta la precision mas baja entre las clases con tamano razonable (48,48 %), con abundantes falsos positivos.
- La tarea es no oficial y deriva de un campo de atributos de BDD100K, no de un benchmark estandar reconocido, lo que dificulta comparar estos numeros con resultados publicados en literatura.
- Segun el autor, el split denominado test corresponde al conjunto de validacion oficial de BDD100K, lo que conviene tener en cuenta al reproducir resultados.
- El modelo clasifica escenas a partir de imagenes individuales; no modela secuencia temporal ni contexto de vídeo, por lo que puede ser inestable en fotogramas de transicion entre escenarios.
- Riesgo de sesgo geografico y de dominio: BDD100K se recopilo principalmente en Estados Unidos, de modo que la clasificacion puede degradarse en entornos urbanos o senalizacion de otras regiones.
- No se documenta ningun proceso de mitigacion de sesgos, evaluacion de robustez ante condiciones adversas (lluvia, noche, deslumbramiento) ni analisis de subgrupos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset de origen pueden tener sus propias condiciones; conviene revisarlas por separado.
- Al no existir versiones cuantizadas ni exportaciones ONNX o TensorRT, el despliegue en entornos con restricciones de runtime requiere trabajo adicional de conversion y validacion.
- Para produccion en automocion, este modelo no debe usarse como componente de seguridad critica: es una herramienta de clasificacion de escena con precision limitada en clases minoritarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-scenario-tiny_vit_21m_224
- Dataset en HuggingFace: https://huggingface.co/datasets/dronefreak/BDD100K-Scenario-Classification
- Modelo base: https://huggingface.co/timm/tiny_vit_21m_224.dist_in22k
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Variante EfficientViT-B0 del mismo autor: https://huggingface.co/dronefreak/bdd100k-scenario-efficientvit_b0
- Publicacion del autor sobre el model zoo de deteccion de objetos BDD100K: https://huggingface.co/posts/dronefreak/988753800362571
- Model zoo oficial de BDD100K (SysCV): https://github.com/SysCV/bdd100k-models
- Articulo de TinyViT: https://arxiv.org/abs/2207.10666
- Articulo de BDD100K: https://arxiv.org/abs/1805.04687
