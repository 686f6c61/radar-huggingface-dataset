# dronefreak/bdd100k-syscv-sparse-rcnn-r101-fpn-3x

## Resumen

Sparse R-CNN R101-FPN 3x sobre BDD100K es un detector de objetos de dos etapas basado en propuestas aprendidas (Sparse R-CNN) con backbone ResNet-101 y cuello FPN, entrenado especificamente para escenas de conduccion autonoma. El modelo original fue entrenado por el grupo SysCV de la ETH Zurich y publicado en su zoo de modelos BDD100K; este repositorio de Hugging Face es un espejo creado por el usuario `dronefreak` que recupera los pesos desde la Wayback Machine (captura del 19 de febrero de 2025), ya que el host original `dl.cv.ethz.ch` esta fuera de linea. El repositorio anade un entorno de ejecucion fijado y un script de inferencia.

El modelo resuelve la deteccion de 10 clases de objetos relevantes para conduccion: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico. Con 125,28 millones de parametros y una entrada nativa de 1280x720 (la resolucion original de BDD100K, sin redimensionado), esta pensado para evaluacion e investigacion sobre el benchmark BDD100K, no como producto listo para produccion.

Su relevancia actual es fundamentalmente de reproducibilidad: al estar caido el host original de SysCV, este espejo permite volver a ejecutar y verificar los resultados publicados del modelo. La verificacion incluida en la model card confirma que los pesos coinciden por MD5 con los originales y que las predicciones son practicamente identicas (1841 de 2000 cajas identicas en GPU sobre 20 imagenes de validacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse R-CNN (detector de dos etapas con propuestas aprendidas), backbone ResNet-101, cuello FPN |
| Parametros totales | 125.280.420 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1280x720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth` en precision original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BDD100K (`license: other`, uso educativo, investigacion y sin animo de lucro) |
| Formato de pesos | safetensors (`model.safetensors`), `.pth` original, config en `.py`/`.json` |

## Arquitectura y entrenamiento

Sparse R-CNN es un detector end-to-end que sustituye las propuestas densas de las RPN clasicas por un conjunto fijo de propuestas aprendidas (cajas y caracteristicas), refinadas en cascada por cabezas dinamicas. El backbone es ResNet-101 inicializado con pesos ImageNet (`torchvision://resnet101`), con FPN como cuello. La entrada es de 1280x720, el tamano nativo de BDD100K, en RGB con media y desviacion estandar de ImageNet y sin redimensionado.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (esquema 3x), con AdamW, learning rate de 2,5e-05, weight decay de 0,0001, decaimiento en las epocas 27 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). En test se emiten como maximo 100 cajas por imagen. La configuracion procede del repositorio de SysCV y esta publicada bajo Apache-2.0.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion con 10 clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagen suelta, carpeta de imagenes, fichero de video y webcam (via `infer.py`).
- Exportacion de detecciones en formato BDD100K (`--json`).
- Umbral de confianza configurable (`--score-thr`, por defecto 0,3) y limite de fotogramas para video (`--max-frames`).
- Ejecucion en GPU (CUDA 11.8) y en CPU (entorno `requirements-cpu.txt`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo generativo.

## Casos de uso

- Reproduccion de resultados academicos: permite volver a ejecutar el modelo de SysCV sobre BDD100K val y test para verificar el AP publicado (32,2 en val), util ahora que el host original esta caido.
- Linea base en investigacion de deteccion para conduccion autonoma: sirve como referencia Sparse R-CNN con backbone ResNet-101 para comparar nuevos detectores sobre BDD100K.
- Analisis de escenas diurnas y nocturnas: el modelo se ha validado sobre clips de val de dia y de noche, adecuado para estudiar el comportamiento del detector en condiciones de iluminacion distintas.
- Prototipado de pipelines de vision en vehiculo: el script de inferencia admite video y webcam, lo que permite probar detecciones sobre grabaciones reales antes de integrar en un sistema mayor.
- Etiquetado asistido y control de calidad de anotaciones: las detecciones exportadas en formato BDD100K pueden compararse con las etiquetas ground truth para detectar discrepancias.
- Docencia y demos de deteccion de objetos: el entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2 sobre Python 3.10) facilita montar un ejemplo reproducible en clase o en un taller.
- Evaluacion de robustez en CPU: con 1,7 s/imagen en 8 hilos de CPU, es viable para experimentos por lotes sin GPU.

## Benchmarks y rendimiento

Resultados declarados por SysCV (AP de cajas estilo COCO, en %, sobre BDD100K). El valor de validacion esta marcado como no verificado en el model-index.

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32,2 | 58,0 | 30,3 | 16,0 | 36,6 | 53,4 |
| test | 31,4 | no disponible | no disponible | no disponible | no disponible | no disponible |

AP por clase en validacion (%):

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 34,7 | 24,9 | 50,6 | 45,6 | 48,3 | 2,2 | 23,8 | 23,4 | 27,7 | 40,7 |

Rendimiento de inferencia declarado: 0,06 s/imagen en una RTX 4070 SUPER y 1,7 s/imagen en 8 hilos de CPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 125,28 M de parametros y entrada de 1280x720, el peso de los pesos en fp32 ronda los 0,5 GB y el consumo total depende del backend de mmdetection (activaciones y buffers). Cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos ~4-6 GB de VRAM deberia bastar; el autor reporta ejecucion en una RTX 4070 SUPER (0,06 s/imagen). A100 y H100 no son necesarias para inferencia.
- GPU de consumo: si, cabe en RTX 4070 SUPER y en tarjetas de gama media con VRAM suficiente; tambien funciona en CPU (1,7 s/imagen en 8 hilos).
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre torch 2.0.1 y Python 3.10, mediante el script `infer.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de este tipo).
- Latencia y throughput: 0,06 s/imagen en RTX 4070 SUPER; 1,7 s/imagen en CPU con 8 hilos.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K ni de sus especificaciones, por lo que la comparacion cuantitativa con alternativas (por ejemplo, Faster R-CNN, Cascade R-CNN o DETR entrenados sobre BDD100K) no esta disponible. Cualitativamente, Sparse R-CNN se distingue por eliminar la RPN y el post-procesado NMS denso gracias a sus propuestas aprendidas, a costa de una mayor complejidad de implementacion.

| Modelo | Parametros | Contexto/entrada | AP val BDD100K | Licencia |
|---|---|---|---|---|
| Sparse R-CNN R101-FPN 3x (este) | 125,28 M | 1280x720 | 32,2 | BDD100K (uso no comercial) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se entrenaron sobre BDD100K y heredan su licencia, limitada a uso educativo, de investigacion y sin animo de lucro. El uso comercial no esta permitido sin autorizacion.
- Clases con rendimiento muy bajo: `train` obtiene un AP de 2,2 %, y `motorcycle`, `bicycle` y `rider` quedan por debajo del 25 %. No es fiable para esas categorias.
- Objetos pequenos: APs de 16,0, muy inferior a APm (36,6) y APl (53,4); el modelo falla con objetos de pequeno tamano.
- Riesgo de alucinacion: como todo detector, puede producir falsas detecciones con confianza moderada; el umbral por defecto de 0,3 debe ajustarse segun la aplicacion.
- Sesgos del dataset: BDD100K esta sesgado hacia escenas de conduccion en determinadas regiones y condiciones; el rendimiento puede degradarse fuera de esa distribucion.
- Reproducibilidad no exacta: el autor documenta pequenas diferencias frente a las predicciones oficiales de SysCV (1841 de 2000 cajas identicas en GPU; causa desconocida), aunque todas coinciden con IoU >= 0,5.
- Entorno obsoleto: requiere mmdetection 2.x y mmcv-full 1.7.2, que no son compatibles con versiones recientes de PyTorch; es necesario un entorno virtual limpio con Python 3.10.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier uso debe ser de deteccion visual.
- Privacidad: en escenas reales puede detectar personas y vehiculos; el autor verifico que las demos no muestran matricula ni rostros identificables, pero en despliegues propios debe aplicarse el mismo cuidado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-sparse-rcnn-r101-fpn-3x
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/sparse_rcnn_r101_fpn_3x_det_bdd100k.py
- Paper Sparse R-CNN (CVPR 2021): https://arxiv.org/abs/2011.12450
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-sparse-rcnn-r101-fpn-3x/blob/main/LICENSE.txt
