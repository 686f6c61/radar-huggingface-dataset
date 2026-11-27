# dronefreak/bdd100k-syscv-fcos-r50-fpn-3x

## Resumen

FCOS R50-FPN 3x sobre BDD100K es un detector de objetos de una sola etapa pensado para escenas de conduccion. Se trata de un espejo del checkpoint original publicado por el grupo SysCV (ETH Zurich) en su zoo de modelos para BDD100K, recuperado desde la Wayback Machine despues de que el host `dl.cv.ethz.ch` quedara fuera de linea. El repositorio anade un entorno de dependencias fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script de inferencia que acepta imagenes, video y webcam.

El modelo emplea la arquitectura FCOS (Fully Convolutional One-Stage Object Detection, ICCV 2019), un detector denso y anchor-free con backbone ResNet-50 y cuello FPN. Detecta diez clases propias de BDD100K: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico. Con 32,2 millones de parametros y un peso de repositorio de 0,6 GB, es un modelo compacto y desplegable en CPU, aunque su interes es principalmente de investigacion y reproduccion de resultados.

Su relevancia actual es la preservacion de un checkpoint que ya no se puede descargar de su origen institucional y la verificacion de su integridad (MD5 coincidente con el archivo de SysCV). No obstante, el propio autor advierte que la copia no es exacta en inferencia: sobre 20 imagenes de validacion, 1762 de las 1993 cajas publicadas son identicas y 1821 coinciden con IoU >= 0,5, con una diferencia maxima de score de 0,0489.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCOS (one-stage, anchor-free) con backbone ResNet-50 y FPN |
| Parametros totales | 32.187.087 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (el autor solo distribuye pesos en safetensors y `.pth`) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | bdd100k (uso educativo, investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), `.pth` equivalente y predicciones de validacion archivadas |

## Arquitectura y entrenamiento

FCOS es un detector completamente convolucional que prescinde de anchors y resuelve la deteccion mediante prediccion por pixel de la distancia a los bordes de la caja, junto con una rama de centerness que pondera la calidad de las detecciones. El backbone es una ResNet-50 inicializada con pesos ImageNet (`open-mmlab://detectron/resnet50_caffe`), sobre la que se monta un FPN que alimenta las cabezas de clasificacion y regresion. La entrada es de 1280 x 720, el tamano nativo de BDD100K, sin redimensionado, con normalizacion ImageNet.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con SGD a learning rate 0,01, weight decay 0,0001, decaimientos en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). En test se aplica un umbral de score de 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. El autor reporta 1,2 s por imagen en 8 hilos de CPU. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, al no ser un modelo generativo.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion en las diez clases de BDD100K.
- Procesamiento de imagenes sueltas, carpetas de imagenes, archivos de video y streams de webcam mediante `infer.py`.
- Salida en formato BDD100K mediante la opcion `--json`.
- Control del umbral de confianza (`--score-thr`, por defecto 0,3) y del numero maximo de fotogramas procesados (`--max-frames`).
- Ejecucion en CPU y en GPU NVIDIA (entorno CUDA 11.8 disponible; el autor indica que el entorno CUDA no se ha probado).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, por ser un modelo puramente de vision.

## Casos de uso

- Reproduccion de resultados academicos: permite reejecutar la evaluacion de FCOS R50-FPN 3x sobre BDD100K val y test cuando el host original de SysCV no esta disponible, con pesos verificados por MD5.
- Deteccion de peatones y vehiculos en video de dashcam: el script de inferencia acepta archivos `.mov` y procesa fotogramas de forma secuencial, adecuado para prototipos de analisis de trafico.
- Anotacion asistida de datasets de conduccion: generar cajas previas con `--json` en formato BDD100K para acelerar el etiquetado manual, filtrando por umbral de score.
- Demostraciones en vivo con webcam: el modo `python infer.py 0 --show` permite visualizar detecciones en tiempo real en un portatil, util para docencia o validacion cualitativa.
- Baseline para comparativas de detectores en dominios de conduccion: al tener AP por clase y por tamano de objeto, sirve como referencia frente a modelos mas modernos.
- Analisis de escenas nocturnas y diurnas: el autor incluye clips de validacion de dia y de noche para comprobar el comportamiento del detector en condiciones de iluminacion distintas.
- Integracion en pipelines de mmdetection 2.x: al conservar la configuracion de SysCV, se puede reutilizar en flujos existentes de entrenamiento o evaluacion con esa version de la libreria.

## Benchmarks y rendimiento

Resultados declarados por SysCV y recogidos en la model card (AP estilo COCO, en porcentaje):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 30,6 | 55,3 | 28,6 | 13,4 | 35,6 | 51,0 |
| test | 29,0 | 51,9 | 27,7 | 13,4 | 35,3 | 45,6 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 33,2 |
| rider | 21,1 |
| car | 50,4 |
| truck | 45,4 |
| bus | 47,5 |
| train | 0,0 |
| motorcycle | 21,3 |
| bicycle | 21,9 |
| traffic light | 26,2 |
| traffic sign | 39,0 |

No se han publicado en la informacion disponible resultados comparativos con otros detectores sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 32,2 millones de parametros y entrada 1280 x 720, el checkpoint en FP32 ocupa aproximadamente 0,13 GB, por lo que el consumo dominante es el de las activaciones y el grafo de mmdetection.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU NVIDIA con soporte CUDA 11.8 deberia poder ejecutar el entorno fijado; una RTX 4090 o A100 es sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer moderna con suficiente VRAM para mmdetection 2.x; el autor no publica una cifra concreta.
- Despliegue: el repositorio usa mmdetection 2.28.2 con mmcv-full 1.7.2 sobre Python 3.10, con requisitos separados para CUDA 11.8 y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 1,2 s por imagen en 8 hilos de CPU, segun el autor. No se publica throughput en GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores evaluados sobre BDD100K con la misma configuracion, por lo que no es posible establecer una comparativa numerica fiable. Como referencia cualitativa, FCOS R50-FPN 3x se situa en la familia de detectores one-stage anchor-free con backbone ResNet-50, alternativa a arquitecturas como Faster R-CNN o RetinaNet, pero no se aportan cifras comparativas.

| Modelo | Parametros | Contexto | AP (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FCOS R50-FPN 3x (este) | 32,2 M | no aplica | 30,6 | bdd100k | Hugging Face (espejo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro; el uso comercial requiere revisar los terminos del dataset original.
- La copia no reproduce exactamente las predicciones de SysCV: 1762 de 1993 cajas identicas y diferencias de score de hasta 0,0489 en la prueba de 20 imagenes; el autor no investigo la causa.
- El entorno CUDA no ha sido probado por el autor; solo se verifico la carga de pesos y la inferencia en CPU.
- La clase `train` obtiene AP 0,0 en validacion, lo que refleja un fallo sistematico en esa categoria.
- Rendimiento bajo en objetos pequenos (APs 13,4), lo que limita su uso en deteccion de elementos lejanos o de tamano reducido.
- Es un modelo de vision sin capacidades linguisticas, de razonamiento ni de tool calling; no debe presentarse como un LLM.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion adversas; el propio autor incluye clips nocturnos para inspeccion cualitativa, sin metricas separadas por condicion.
- No se han publicado evaluaciones de sesgo demografico ni de robustez mas alla de los splits estandar de BDD100K.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-fcos-r50-fpn-3x
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-fcos-r50-fpn-3x/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/fcos_r50_fpn_3x_det_bdd100k.py
- Paper de FCOS: https://arxiv.org/abs/1904.01355
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
