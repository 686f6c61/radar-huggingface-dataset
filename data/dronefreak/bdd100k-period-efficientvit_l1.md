# dronefreak/bdd100k-period-efficientvit_l1

## Resumen

EfficientViT-L1 finetuned on BDD100K Period es un clasificador de imágenes de 4 clases desarrollado por el usuario dronefreak (dronefreak/bdd100k-period-efficientvit_l1) que predice el momento del día (daytime, night, dawn or dusk, unknown) a partir de una única imagen de escena de conducción. Está construido sobre el backbone timm/efficientvit_l1.r224_in1k, preentrenado en ImageNet-1k a 224x224, y reentrenado sobre el dataset dronefreak/BDD100K-Period-Classification, derivado del campo attributes.timeofday de BDD100K.

El modelo tiene 49,5 M de parámetros y se distribuye como un checkpoint de PyTorch que incluye no solo los pesos, sino también los nombres de clase, la resolución de entrada y las estadísticas de normalización, lo que simplifica su integración en cualquier pipeline con timm. Se publica bajo licencia Apache-2.0, con un tamaño de repositorio de 0,2 GB.

Su relevancia es práctica: con 93,98 % de top-1 y 82,68 % de F1 macro en el split de test (10 000 imágenes), ofrece un clasificador de iluminación ligero y rápido que puede actuar como etapa de enrutado o preprocesado dentro de sistemas de percepción para conducción autónoma, análisis de flotas o curación de datasets, sin necesidad de GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer de la familia EfficientViT (backbone base timm/efficientvit_l1.r224_in1k) |
| Parametros totales | 49,5 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 224x224 px, valor `imgsz` almacenado en el checkpoint) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; el checkpoint distribuido es PyTorch en coma flotante) |
| Idiomas soportados | no aplica (clasificacion de imagenes, sin entrada ni salida de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`best.pt`, con `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std`) |
| Tarea | Clasificacion de imagenes, 4 clases |
| Clases | dawn or dusk, daytime, night, unknown |
| Modelo base | timm/efficientvit_l1.r224_in1k (preentrenado en ImageNet-1k) |
| Dataset de ajuste | dronefreak/BDD100K-Period-Classification |
| Tamano del repositorio | 0,2 GB |
| Libreria | timm |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer de vision de la familia EfficientViT. Los tags del repositorio referencian el paper arXiv:2205.14756, que describe esta familia como una arquitectura de atencion disenada especificamente para reducir el coste de memoria y computo en inferencia, en lugar de optimizar unicamente el numero de parametros. El punto de partida es el checkpoint timm/efficientvit_l1.r224_in1k, preentrenado de forma supervisada en ImageNet-1k con resolucion 224x224; ese backbone se ha ajustado despues para una cabeza de clasificacion de 4 clases. El checkpoint publicado conserva `model_name`, `imgsz`, `mean` y `std`, de modo que el preprocesado exacto empleado en el entrenamiento queda fijado por el propio artefacto.

La tarea es una clasificacion derivada del campo `attributes.timeofday` de BDD100K (paper arXiv:1805.04687), etiquetada por el autor como tarea no oficial. La evaluacion se realiza sobre el split `test` del dataset, con 10 000 imagenes. No se dispone de informacion sobre el numero de imagenes de entrenamiento, la composicion exacta del split de entrenamiento, el numero de epochs, la tasa de aprendizaje, el esquema de aumentacion de datos ni si se aplicaron tecnicas de regularizacion o ajuste fino selectivo de capas. Tampoco procede hablar de RLHF o DPO, ya que no es un modelo generativo de lenguaje. El toolkit que genera y evalua el modelo, BDD100K-Toolkit, se presenta como una utilidad sin dependencias externas pesadas que garantiza splits y metricas identicas entre todos los modelos comparados.

## Capacidades

- Clasificacion de imagenes en 4 clases de momento del dia: daytime, night, dawn or dusk y unknown.
- Salida de probabilidades por clase mediante softmax, lo que permite aplicar umbrales de confianza o descartar predicciones de baja certeza.
- Etiquetado por fotograma suelto: no requiere secuencia de video ni informacion temporal.
- Uso como backbone de extraccion de caracteristicas, ya que la arquitectura base es un modelo timm estandar.
- Integracion directa con timm y PyTorch, incluyendo `torch.compile` o exportacion a ONNX/TensorRT si se desea.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues porque no procesa texto.
- No incorpora modo thinking, vision-language, audio ni ninguna otra modalidad adicional.

## Casos de uso

- Etiquetado automatico de datasets de conduccion: dado un directorio de imagenes de salpicadero, el modelo asigna la condicion de iluminacion a cada fotograma en una sola pasada, con 93,98 % de top-1, lo que reduce drasticamente el coste de anotacion manual del campo timeofday.
- Enrutado previo en pipelines de percepcion autonoma: la salida de 4 clases puede activar modulos especializados (por ejemplo, un detector entrenado para escenas nocturnas) antes de ejecutar el modelo principal, ahorrando computo en los casos mayoritarios de dia.
- Curación y control de calidad de anotaciones: comparar la prediccion del modelo con la etiqueta humana permite detectar imagenes mal etiquetadas; la clase unknown, con solo 35 imagenes de test y un recall del 65,71 %, es la candidata natural a revision manual.
- Analisis de flotas y telemetria de video: procesar las grabaciones de una flota para obtener la distribucion horaria real de circulacion (porcentaje de kilometros nocturnos, por ejemplo), informacion util para planificacion de mantenimiento o seguros.
- Ajuste automatico de camara en sistemas ADAS o de grabacion: la prediccion de night frente a day puede disparar cambios de exposicion, ganancia ISO o modos HDR en la captura, mejorando la calidad del material aguas abajo.
- Seleccion de datos para entrenamiento de modelos mayores: usar la clase predicha como criterio de muestreo estratificado para construir lotes balanceados por condicion de iluminacion en el entrenamiento de detectores o segmentadores.
- Investigacion en robustez y dominio: servir como linea base ligera (49,5 M de parametros) para estudiar el impacto del cambio de iluminacion en tareas de vision y comparar arquitecturas sobre un split fijo.
- Procesado en el borde: al ser un modelo pequeno con entrada de 224x224, puede ejecutarse en dispositivos con recursos limitados o en CPU, etiquetando video en tiempo real sin depender de la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split `test` (10 000 imagenes) del dataset BDD100K Period (Time-of-Day) Classification. Todos los valores figuran como no verificados (`verified: false`) en el model-index.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 93,98 % |
| Macro F1 | 82,68 % |
| Balanced accuracy | 78,45 % |
| Macro precision | 88,75 % |
| Macro recall | 78,45 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 71,63 % | 52,57 % | 60,64 % | 778 |
| daytime | 93,45 % | 96,67 % | 95,04 % | 5258 |
| night | 97,93 % | 98,83 % | 98,38 % | 3929 |
| unknown | 92,00 % | 65,71 % | 76,67 % | 35 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de vision (ImageNet, COCO, etc.) para este checkpoint ajustado, mas alla de las metricas de la tarea propia.

## Requisitos de hardware

- VRAM estimada: 49,5 M de parametros ocupan aproximadamente 198 MB en FP32, unos 99 MB en FP16/BF16 y unos 50 MB en INT8, a lo que hay que sumar activaciones y el overhead del runtime; en la practica, el modelo cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU moderna sirve; para maximizar throughput, tarjetas como RTX 4090, L4, A10G, A100 o H100 son mas que suficientes y estaran limitadas por el preprocesado de imagenes, no por el modelo.
- GPU de consumo: si, cabe en todas las gamas actuales, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- CPU: la inferencia en CPU es viable dado el tamano del modelo y la resolucion de 224x224, especialmente con exportacion a ONNX Runtime o con `torch.compile`.
- Opciones de despliegue: timm y PyTorch de forma nativa (es el metodo documentado en la model card), exportacion a ONNX o TensorRT, TorchScript, `torch.compile` y servicios de inferencia genericos. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

El propio autor publica un model zoo con todos los modelos evaluados sobre el mismo split de test con el mismo toolkit. La comparativa mas fiable es, por tanto, interna a ese zoo:

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision | Parametros |
|---|---|---|---|---|---|
| TinyViT-21M | 94,01 % | 83,19 % | 79,63 % | 87,95 % | no disponible (la nomenclatura sugiere ~21 M) |
| EfficientViT-L1 (este modelo) | 93,98 % | 82,68 % | 78,45 % | 88,75 % | 49,5 M |
| EfficientViT-B2 | 93,92 % | 82,53 % | 78,88 % | 87,49 % | no disponible |
| RepViT-M2.3 | 93,89 % | 82,35 % | 78,49 % | 87,72 % | no disponible |
| ConvNeXt-Atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % | no disponible |
| YOLO11n | 93,79 % | 80,13 % | 75,19 % | 88,20 % | no disponible |

Todas estas variantes son alternativas de la misma categoria (clasificadores ligeros de imagenes para escenas de conduccion) y comparten licencia y disponibilidad dentro del repositorio BDD100K-Toolkit; se diferencian sobre todo en el equilibrio entre coste computacional y F1 macro. La diferencia entre el mejor resultado (TinyViT-21M, 94,01 % top-1) y este modelo es de 0,03 puntos de top-1 y 0,51 puntos de F1 macro, dentro del margen esperable de variabilidad. No se dispone de comparaciones con clasificadores genericos externos (por ejemplo, variantes de ViT o ConvNeXt preentrenadas en ImageNet y ajustadas a esta tarea por terceros).

## Limitaciones y advertencias

- La clase unknown apenas tiene 35 imagenes en test y su recall es del 65,71 %, por lo que su comportamiento es estadisticamente poco fiable.
- La clase dawn or dusk es el principal punto debil: recall del 52,57 % y F1 del 60,64 %, es decir, casi la mitad de las imagenes de amanecer o atardecer se clasifican en otra categoria. La exactitud global (93,98 %) esta inflada por el fuerte desequilibrio de clases (5258 imagenes de daytime frente a 778 de dawn or dusk).
- El modelo esta entrenado exclusivamente con imagenes de BDD100K (escenas de conduccion con camara frontal); su rendimiento fuera de ese dominio (camaras de vigilancia, interiores, imagenes aereas) no esta caracterizado y probablemente se degrade.
- Es un modelo puro de vision: no genera texto y, por tanto, no tiene riesgo de alucinacion en el sentido habitual. Si se usa su salida para superponer leyendas o metadatos, el riesgo reside en la clase predicha, no en el texto.
- Sesgos potenciales: los derivados de la composicion geografica y de captura de BDD100K (principalmente Estados Unidos), que pueden no representar condiciones de iluminacion, clima o geografia de otras regiones.
- Los resultados del model-index estan marcados como no verificados y el repositorio no tiene descargas ni likes, por lo que no existe validacion independiente de las metricas.
- La tarea se declara explicitamente como no oficial dentro de BDD100K, de modo que las cifras no son comparables con las del benchmark oficial del dataset.
- Los pesos se publican bajo Apache-2.0, lo que permite uso comercial; sin embargo, el dataset de origen (BDD100K) tiene sus propias condiciones de uso que conviene revisar antes de un despliegue productivo.
- No hay informacion sobre cuantizacion, calibracion ni latencia medida, por lo que cualquier estimacion de rendimiento en produccion debe validarse con una prueba propia.
- El checkpoint se distribuye en formato `best.pt` (pickle de PyTorch); al cargarlo conviene usar `weights_only=True`, como hace el propio ejemplo de la model card, para evitar riesgos de deserializacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-efficientvit_l1
- Modelo base: https://huggingface.co/timm/efficientvit_l1.r224_in1k
- Dataset de ajuste: https://huggingface.co/dronefreak/BDD100K-Period-Classification
- Repositorio del toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Paper de EfficientViT (arXiv:2205.14756): https://arxiv.org/abs/2205.14756
- Paper de BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
