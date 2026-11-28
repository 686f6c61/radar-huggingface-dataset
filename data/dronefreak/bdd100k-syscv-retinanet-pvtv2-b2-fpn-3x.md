# dronefreak/bdd100k-syscv-retinanet-pvtv2-b2-fpn-3x

## Resumen

RetinaNet PVTv2-B2-FPN 3x sobre BDD100K es un detector de objetos de una etapa para escenas de conduccion, publicado originalmente por el grupo SysCV de la ETH Zurich dentro de su zoo de modelos BDD100K. Este repositorio de Hugging Face no es el original: es un espejo creado por el usuario `dronefreak` que recupera los pesos desde la Wayback Machine (captura del 19 de febrero de 2025) porque el host `dl.cv.ethz.ch` ya no esta operativo. Ademas del checkpoint, anade un entorno Python fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script de inferencia para imagen, video y webcam.

La arquitectura combina un backbone Pyramid Vision Transformer v2 (variante B2) con un cuello FPN y la cabeza de deteccion densa de RetinaNet, todo implementado sobre mmdetection. Con 33,6 millones de parametros, el modelo detecta diez clases propias de BDD100K (peatones, ciclistas, coches, camiones, autobuses, trenes, motos, bicicletas, semaforos y senales de trafico) a resolucion nativa de 1280x720.

Su relevancia actual es practica: el zoo original de SysCV estaba caido y este espejo verifica reproduccion exacta contra las predicciones publicadas (mismos 1890 boxes y scores en 20 imagenes de validacion) y coincidencia de MD5 de los pesos. Es util como linea base reproducible para investigacion en deteccion en conduccion autonoma, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet de una etapa con backbone PVTv2-B2 y cuello FPN |
| Parametros totales | 33.647.678 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 1280x720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa) |
| Idiomas soportados | no aplica (deteccion visual; clases en ingles) |
| Licencia | BDD100K (uso educativo, investigacion y sin animo de lucro); config SysCV Apache-2.0 |
| Formato de pesos | safetensors (equivalente al `.pth` original) y `.pth` en `original/` |

## Arquitectura y entrenamiento

RetinaNet clasico de una etapa: backbone PVTv2-B2 (transformer piramidal con atencion lineal y convoluciones depthwise), FPN de cinco niveles y cabezas de clasificacion y regresion ancladas con focal loss. La entrada es la resolucion nativa de BDD100K (1280x720, sin redimensionado), en RGB con media y desviacion tipica de ImageNet. En test se aplica umbral de score 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen.

El entrenamiento usa las 70.000 imagenes de train de BDD100K durante 36 epocas (esquema 3x), con AdamW (lr 0,0001, weight decay 0,0001), decaimiento de learning rate en las epocas 24 y 33, batch 32 (8 GPUs x 2 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). El backbone se inicializa con pesos de ImageNet (`pvt_v2_b2.pth`). No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa; es un detector supervisado de forma estandar.

## Capacidades

- Deteccion de objetos en imagenes individuales, carpetas de imagenes, ficheros de video y flujo de webcam.
- Diez clases de BDD100K: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Salida en formato BDD100K mediante `--json out.json`, ademas de visualizacion con umbral de score configurable (por defecto 0,3).
- Procesamiento de video con limite opcional de fotogramas (`--max-frames`).
- Inferencia en CPU (8 hilos) y en GPU CUDA 11.8.
- No soporta tool calling, agentes, texto, vision-lenguaje ni capacidades multilingues: es exclusivamente un detector visual.

## Casos de uso

- Linea base reproducible para investigacion en deteccion en conduccion: permite comparar nuevos metodos contra un resultado publicado (AP 33,0 en val) sin depender del host original caido, gracias a la verificacion de MD5 y de predicciones.
- Preetiquetado de datasets de trafico: ejecutar `infer.py` sobre carpetas de imagenes y exportar JSON en formato BDD100K para acelerar el etiquetado manual de nuevos conjuntos de escenas viales.
- Analisis offline de video de dashcam: procesar ficheros `.mov` con `--max-frames` para extraer detecciones por fotograma y estudiar la presencia de peatones, vehiculos y senales en trayectos concretos.
- Prototipado de sistemas ADAS en laboratorio: usar las detecciones de semaforos y senales como entrada a un pipeline de percepcion simulado, asumiendo sus limitaciones de precision en clases minoritarias.
- Demostraciones educativas de deteccion de una etapa: el entorno fijado y el script de inferencia permiten reproducir el modelo en un portatil o en una sola GPU consumer sin configurar mmdetection a mano.
- Auditoria de modelos de conduccion: al ser un espejo verificado, sirve para contrastar predicciones de otros detectores sobre BDD100K val con una referencia estable y congelada.

## Benchmarks y rendimiento

Resultados declarados por SysCV (Box AP estilo COCO, %), no verificados de forma independiente por el autor del espejo mas alla de la reproduccion de predicciones:

| Metrica | Val | Test |
|---|---|---|
| AP | 33,0 | 32,6 |
| AP50 | 58,9 | 56,9 |
| AP75 | 31,3 | 31,8 |
| APs | 15,0 | 15,7 |
| APm | 38,4 | 38,3 |
| APl | 55,4 | 50,8 |

AP por clase en val:

| Clase | AP |
|---|---|
| pedestrian | 36,0 |
| rider | 26,9 |
| car | 51,6 |
| truck | 45,7 |
| bus | 49,4 |
| train | 0,7 |
| motorcycle | 26,5 |
| bicycle | 27,4 |
| traffic light | 25,4 |
| traffic sign | 40,1 |

Rendimiento de inferencia declarado: 0,07 s/imagen en una RTX 4070 SUPER y 2,2 s/imagen en CPU con 8 hilos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano (33,6 M de parametros) y entrada 1280x720, el checkpoint cabe holgadamente en GPUs consumer, aunque la memoria real depende del framework y del batch.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA 11.8; el autor valida en RTX 4070 SUPER. GPUs de datacenter (A100, H100) no estan probadas en la informacion disponible.
- Cabe en GPU consumer: si, segun la validacion del autor en RTX 4070 SUPER.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10 (entornos `env/requirements-cu118.txt` o `env/requirements-cpu.txt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,07 s/imagen en RTX 4070 SUPER (aproximadamente 14 imagenes/s); 2,2 s/imagen en CPU con 8 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaNet PVTv2-B2-FPN 3x (este) | 33,6 M | 1280x720 | 33,0 | BDD100K (no comercial) | Espejo en HF; original caido |
| Otros modelos del zoo SysCV BDD100K | no disponible | no disponible | no disponible | BDD100K | Host original offline |
| Alternativas de deteccion en BDD100K | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de modelos comparables para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia BDD100K: solo uso educativo, de investigacion y sin animo de lucro; el uso comercial no esta permitido sin autorizacion adicional.
- Rendimiento muy bajo en la clase train (AP 0,7), practicamente inutilizable para esa categoria.
- Precision moderada en clases pequenas o frecuentes en escenas nocturnas (APs 15,0; traffic light 25,4; bicycle 27,4), lo que limita su uso en percepcion real.
- Riesgo de falsos negativos y positivos inherente a un detector de una etapa con umbral bajo (0,05) y NMS agresivo; requiere ajuste de umbral por caso de uso.
- Modelo puramente visual: no procesa texto, no tiene capacidades multilingues ni de razonamiento; no admite tool calling.
- Es un espejo no oficial: aunque verifica MD5 y predicciones, no hay garantia de mantenimiento futuro ni de soporte del autor original (SysCV).
- Entorno fijado a versiones antiguas (torch 2.0.1, mmdetection 2.28.2); la integracion con stacks modernos puede requerir trabajo adicional.
- No se han publicado datos sobre sesgos demograficos o geograficos del dataset BDD100K en esta ficha; deben consultarse en la documentacion del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvtv2-b2-fpn-3x
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_pvtv2-b2_fpn_3x_det_bdd100k.py
- Paper PVTv2: https://arxiv.org/abs/2106.13797
- Pesos ImageNet del backbone PVTv2-B2: https://github.com/whai362/PVT/releases/download/v2/pvt_v2_b2.pth
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvtv2-b2-fpn-3x/blob/main/LICENSE.txt
