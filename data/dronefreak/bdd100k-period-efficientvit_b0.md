# dronefreak/bdd100k-period-efficientvit_b0

## Resumen

El modelo `dronefreak/bdd100k-period-efficientvit_b0` es un clasificador de imágenes derivado de la arquitectura EfficientViT-B0 y ajustado por el usuario dronefreak para una tarea concreta: clasificar escenas de conducción en cuatro franjas horarias (daytime, night, dawn or dusk y unknown) a partir de una única imagen RGB. Se trata de un modelo pequeño, de aproximadamente 2,1 millones de parámetros, entrenado y evaluado dentro del proyecto BDD100K-Toolkit, una herramienta orientada a preparar el conjunto de datos BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y particiones.

La relevancia del modelo es practica y de nicho: resuelve una tarea auxiliar de etiquetado automatico de condiciones de iluminacion en escenas de conduccion, util como paso previo en pipelines de percepcion para automocion, curaduria de datasets o enrutado de frames hacia modelos especializados. Su tamano reducido (2,1 M de parametros, entrada de 224x224) lo hace desplegable en hardware muy modesto, incluso en CPU o en SoC embarcados, algo poco habitual en modelos de vision de proposito general.

La tarea que cubre es no oficial dentro de BDD100K: se deriva del campo `attributes.timeofday` de cada imagen y sigue el planteamiento del dataset de Kaggle del mismo nombre. El modelo se distribuye bajo licencia Apache-2.0 y solo como checkpoint de PyTorch (`.pt`) compatible con `timm`, sin variantes cuantizadas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-B0 (vision transformer con atencion lineal multi-escala), segun el backbone disponible en `timm` |
| Parametros totales | 2,1 M (aproximadamente; dato declarado por el autor en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de una unica imagen; entrada fija de 224x224 pixeles) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica el checkpoint `best.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`) con un diccionario que incluye `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std`; cargable con `timm.create_model` |
| Tarea | Clasificacion de imagenes (image-classification), 4 clases |
| Clases | daytime, night, dawn or dusk, unknown |
| Tamano de entrada | 224x224 |
| Framework | timm / PyTorch |

## Arquitectura y entrenamiento

El modelo parte de EfficientViT-B0, un backbone de vision transformer con atencion lineal multi-escala disenado para prediccion densa de alta resolucion con bajo coste computacional (paper arXiv:2205.14756). Sobre ese backbone se anade una cabeza de clasificacion con `num_classes=4` y se ajusta de extremo a extremo sobre el dataset BDD100K-Period-Classification, derivado del campo de atributos de momento del dia de BDD100K (paper arXiv:1805.04687). No se documenta ningun tipo de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de vision supervisado.

Los hiperparametros de entrenamiento si estan publicados: un maximo de 50 epocas con parada temprana de paciencia 10, de las cuales se completaron 17; el mejor checkpoint (`best.pt`) corresponde a la epoca 7 y se selecciono por macro F1 sobre la particion de validacion. Se uso tamano de imagen 224, batch de 128, optimizador AdamW resuelto automaticamente con learning rate maximo de 3e-04 y pesos promediados por EMA. El modelo se evaluo sobre la particion `test` de 10.000 imagenes. No se especifica el numero de imagenes de entrenamiento ni la composicion exacta de las particiones de train y validacion.

## Capacidades

- Clasificacion de imagenes en cuatro categorias de franja horaria: daytime, night, dawn or dusk y unknown.
- Reconocimiento de condiciones de iluminacion en escenas de conduccion (carreteras, entorno urbano y autopista).
- Inferencia sobre una unica imagen RGB de 224x224, sin necesidad de informacion temporal ni de secuencias de video.
- Elevada precision en las clases mayoritarias: 96,58 % de recall en daytime y 98,73 % en night sobre la particion de test.
- Ejecucion en CPU y en hardware de bajisima potencia gracias a sus 2,1 M de parametros.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de vision.
- No dispone de modo de razonamiento (thinking mode), vision de alto nivel, audio ni capacidades multilingues.

## Casos de uso

- Etiquetado automatico de datos de flotas: procesar por lotes miles de frames de dashcam y anotar la franja horaria de cada uno para construir indices o filtros de busqueda en el dataset.
- Enrutado condicional en pipelines de percepcion: usar la clase predicha para decidir si un frame se envia a un detector optimizado para luz diurna o a uno entrenado para conduccion nocturna, mejorando la precision global del sistema.
- Curaduria y balanceo de datasets de conduccion autonomo: identificar y separar imagenes nocturnas o de amanecer/atardecer para equilibrar particiones de entrenamiento de otros modelos.
- Monitorizacion de robustez de sistemas ADAS: detectar cambios de iluminacion en tiempo real (por ejemplo, entrada en tunel o cambio de franja horaria) y registrar eventos para auditar el comportamiento del sistema.
- Inferencia embarcada: con 2,1 M de parametros y entrada de 224x224, el modelo es candidato a ejecutarse en SoC de automocion o en dispositivos tipo Jetson o Raspberry Pi tras exportarlo a ONNX o TensorRT.
- Analisis de video para peritaje de siniestros: clasificar la iluminacion predominante en las grabaciones aportadas por aseguradoras para contextualizar la reconstruccion de un accidente.
- Preprocesado de bajo coste en pipelines de datos a gran escala: al ser ejecutable en CPU, permite etiquetar millones de imagenes sin consumir GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card y en el model-index. Los valores estan marcados como no verificados (`verified: false`). Particion `test` de 10.000 imagenes.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 93,71 % |
| Macro F1 | 80,98 % |
| Balanced accuracy | 77,14 % |
| Macro precision | 86,44 % |
| Macro recall | 77,14 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 70,13 % | 50,39 % | 58,64 % | 778 |
| daytime | 93,11 % | 96,58 % | 94,81 % | 5258 |
| night | 97,93 % | 98,73 % | 98,33 % | 3929 |
| unknown | 84,62 % | 62,86 % | 72,13 % | 35 |

No se han publicado resultados de benchmarks en la informacion disponible para tareas ajenas a esta clasificacion (por ejemplo, MMLU, HumanEval o GSM8K, que no aplican a un modelo de vision).

## Comparativa con modelos similares

El autor publica un model zoo con todos los modelos evaluados sobre la misma particion `test`, ordenados por top-1 accuracy. Son las alternativas mas directamente comparables.

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| convnext_atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % |
| yolo11n-cls | 93,79 % | 80,13 % | 75,19 % | 88,20 % |
| efficientvit_b0 (este modelo) | 93,71 % | 80,98 % | 77,14 % | 86,44 % |
| yolo26n-cls | 93,61 % | 80,41 % | 77,72 % | 83,88 % |
| mobilenetv4_conv_small | 93,57 % | 80,22 % | 76,22 % | 86,06 % |
| yolov8n-cls | 93,56 % | 80,85 % | 76,26 % | 87,87 % |
| resnet18 | 93,32 % | 80,50 % | 76,72 % | 85,87 % |

El modelo se situa en tercera posicion por top-1 pero lidera en macro F1 entre los modelos listados, con un rendimiento equilibrado en balanced accuracy. No se dispone de datos de parametros, contexto ni licencia para los modelos alternativos de esta tabla mas alla de lo indicado, por lo que esos campos quedan como no disponibles. Existe ademas un model zoo oficial del dataset BDD100K mantenido por SysCV, aunque orientado a otras tareas (deteccion, segmentacion) y no directamente comparable con esta clasificacion de franja horaria.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en precision completa ocupan aproximadamente 8,4 MB (2,1 M de parametros a 4 bytes), por lo que el consumo esta dominado por las activaciones y el tamano de lote.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere hardware de gama alta. Una NVIDIA RTX 3060, RTX 4090, A100 o H100 estan enormemente sobredimensionadas para un modelo de este tamano.
- GPU de consumo: cabe sin problemas en cualquier GPU de consumo, incluida una GTX 1050 o integradas mas modestas. Tambien es viable la inferencia en CPU para lotes moderados.
- Opciones de despliegue: `timm` + PyTorch es la ruta soportada oficialmente segun la model card. La exportacion a ONNX, TorchScript, TensorRT, OpenVINO o CoreML no esta documentada, pero es tecnicamente factible al ser un modelo `timm` estandar. No aplican formatos GGUF ni runners tipo llama.cpp, Ollama, vLLM o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de imagenes por segundo en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy desigual entre clases: la clase `dawn or dusk` obtiene un recall del 50,39 % y un F1 de 58,64 %, frente al 98,33 % de F1 en `night`. Cerca de la mitad de las imagenes de amanecer o atardecer se clasifican incorrectamente.
- La clase `unknown` solo cuenta con 35 imagenes en la particion de test, por lo que su F1 de 72,13 % no es estadisticamente fiable.
- El top-1 accuracy del 93,71 % esta inflado por el fuerte desbalance del dataset: daytime y night suman 9.187 de las 10.000 imagenes de test. Para evaluar el modelo en condiciones reales conviene guiarse por la macro F1 y la balanced accuracy.
- Las metricas estan declaradas por el autor y marcadas como no verificadas (`verified: false`). No han sido reproducidas de forma independiente.
- Tarea no oficial dentro de BDD100K: las cuatro clases se derivan del campo `attributes.timeofday` de BDD100K y siguen el planteamiento de un dataset de Kaggle del mismo nombre, no una taxonomia oficial del benchmark.
- Sesgo geografico y de dominio: BDD100K se recopilo principalmente en Estados Unidos, por lo que el modelo puede degradarse en escenas de otras regiones, con otras condiciones de iluminacion, sensores o meteorologia.
- Clasificacion de fotograma unico: no explota informacion temporal, por lo que frames ambiguos (transiciones, tuneles, contraluz) pueden producir predicciones inestables entre fotogramas consecutivos.
- Sobreajuste al dominio: al estar ajustado exclusivamente sobre imagenes de conduccion, no se espera una generalizacion correcta a otros tipos de escena.
- Licencia Apache-2.0, permisiva y apta para uso comercial. Conviene comprobar aparte las condiciones de uso del dataset BDD100K original, ya que el modelo deriva de el y la model card no detalla restricciones adicionales de la fuente.
- El repositorio tiene un tamano declarado de 0,0 GB y no se documenta una version cuantizada; en produccion habra que gestionar la conversion y validacion del modelo por cuenta propia.
- Riesgo de alucinacion: concepto no aplicable a un clasificador, pero si existe riesgo de falsos positivos y errores de clasificacion con confianza alta, especialmente en la clase `dawn or dusk`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-efficientvit_b0
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset de clasificacion: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Paper de EfficientViT (arXiv:2205.14756): https://arxiv.org/abs/2205.14756
- Paper de BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
- Sitio oficial de BDD100K: http://bdd-data.berkeley.edu/
- Model zoo oficial de BDD100K (SysCV): https://github.com/SysCV/bdd100k-models
- Toolkit de BDD100K para tareas heterogeneas: https://github.com/bdd100k/bdd100k
- Coleccion de modelos de deteccion de objetos BDD100K del autor: https://huggingface.co/collections/dronefreak/bdd100k-object-detection-model-zoo
- Modelo relacionado del mismo autor: https://huggingface.co/dronefreak/bdd100k-yolov8s
