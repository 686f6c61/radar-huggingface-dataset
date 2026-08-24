# HB16888/MonkeyOCRv2_det

## Resumen

MonkeyOCRv2_det es un conjunto de modelos de deteccion de texto en escena que integra el encoder visual de MonkeyOCRv2-AS (ViTAEv2-S, 21 millones de parametros) en los detectores DBNet y PSENet del ecosistema MMOCR. El desarrollo corre a cargo de HB16888 y se publica bajo licencia Apache 2.0. El modelo resuelve el problema de la deteccion de texto en imagenes naturales y documentos, un paso previo indispensable para sistemas de OCR completos.

La relevancia de este trabajo radica en que sustituye el backbone clasico ResNet-50 preentrenado en ImageNet por un encoder especificamente preentrenado para imagenes de documentos, lo que mejora consistentemente la F-score en los tres benchmarks de referencia: Total-Text, CTW1500 e ICDAR2015. El repositorio incluye 12 checkpoints (baselines, variantes con oCLIP y variantes con MonkeyOCRv2) junto con los configs de entrenamiento y un parche para MMOCR v1.0.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DBNet y PSENet con backbone ViTAEv2-S (MonkeyOCRv2-AS) |
| Parametros totales | no disponible (encoder: 21M, cabezas de deteccion no especificadas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no texto) |
| Tipos de cuantizacion | no disponible (checkpoints en formato .pth) |
| Idiomas soportados | no disponible (deteccion de texto independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch / MMOCR) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder visual ViTAEv2-S de cuatro etapas (strides 4/8/16/32) que expone las features como res2-res5, alimentando los necks estandar FPNC (para DBNet) y FPNF (para PSENet) sin modificar las cabezas de deteccion. El backbone se carga mediante Transformers AutoModel con trust_remote_code=True, y la normalizacion de imagen (media/desviacion ViTAE) y el particionado en patches se realizan dentro del propio backbone.

El entrenamiento sigue los protocolos oficiales de MMOCR sobre los datasets Total-Text, CTW1500 e ICDAR2015. El entorno reproducido usa Python 3.11, PyTorch 2.9.0, CUDA 12.8, MMEngine 0.10.7, MMCV 2.0.1, MMOCR 1.0.1 y Transformers 4.57. Los modelos baseline y oCLIP se entrenaron en 2 GPUs, mientras que los de MonkeyOCRv2 con PSENet usaron 4 GPUs NVIDIA GeForce RTX 3090. Ademas, el paquete incluye una correccion en el postprocesador PSE (cambio de `or` a `and` en la condicion de filtrado por `score_threshold`) que mejora la calidad del postprocesamiento.

## Capacidades

- Deteccion de texto en escena en imagenes naturales y documentos.
- Soporte para textos curvos y multi-orientados (Total-Text, CTW1500).
- Deteccion de texto en escenarios de conduccion y fotografias de calle (ICDAR2015).
- Integracion con MMOCR v1.0.1 mediante parche automático (install.sh).
- Compatible con los necks FPNC y FPNF estandar de MMOCR.
- No incluye reconocimiento de texto: es exclusivamente un detector (bounding boxes o poligonos).

## Casos de uso

- Preprocesamiento para OCR completo: el detector genera las bounding boxes o poligonos de texto que luego se alimentan a un modulo de reconocimiento (por ejemplo, el propio MonkeyOCRv2 de reconocimiento) para obtener transcripciones.
- Digitalizacion de documentos con diseno complejo: PSENet con MonkeyOCRv2 alcanza F-score de 85.1 en CTW1500, que incluye texto curvado, por lo que es adecuado para escanear facturas, recibos o formularios con texto no alineado.
- Sistemas de extraccion de datos en imagenes de calle: el checkpoint de DBNet en ICDAR2015 (F-score 88.5) permite localizar carteles, senales o numeros de establecimientos en fotografias urbanas.
- Automatizacion de procesos de QA en OCR: al comparar las salidas del detector con ground truth de los tres datasets, se pueden validar regresiones en pipelines de OCR.
- Investigacion academica: el repositorio incluye configs y checkpoints reproducibles para experimentar con backbones preentrenados en documentos dentro de MMOCR.
- Evaluacion de backbones visuales: sirve como banco de pruebas para comparar ViTAEv2-S frente a ResNet-50 y oCLIP en tareas de deteccion de texto.

## Benchmarks y rendimiento

| Dataset | Metodo | Precision (P) | Recall (R) | F-score |
|---|---|---|---|---|
| Total-Text | DBNet* (ResNet-50) | 82.6 | 78.4 | 80.4 |
| Total-Text | DBNet + oCLIP | 85.1 | 81.7 | 83.4 |
| Total-Text | **DBNet + MonkeyOCRv2** | **87.7** | 80.1 | **83.7** |
| CTW1500 | PSENet* (ResNet-50) | 80.1 | 82.7 | 81.4 |
| CTW1500 | PSENet + oCLIP | 82.1 | 85.5 | 83.8 |
| CTW1500 | **PSENet + MonkeyOCRv2** | **88.3** | 82.0 | **85.1** |
| ICDAR2015 | PSENet* (ResNet-50) | 84.0 | 76.2 | 79.9 |
| ICDAR2015 | PSENet + oCLIP | 87.3 | 82.6 | 84.9 |
| ICDAR2015 | **PSENet + MonkeyOCRv2** | **90.4** | 80.3 | **85.0** |
| ICDAR2015 | DBNet* (ResNet-50) | 88.8 | 81.5 | 85.0 |
| ICDAR2015 | DBNet + oCLIP | 90.9 | 84.1 | 87.4 |
| ICDAR2015 | **DBNet + MonkeyOCRv2** | **91.2** | **86.0** | **88.5** |

Los asteriscos indican resultados reproducidos por el autor con MMOCR. El modelo supera tanto al baseline ResNet-50 como a la variante con oCLIP en todos los datasets.

## Requisitos de hardware

- VRAM estimada: no disponible (depende del detector y del tamaño de imagen; con 2-4 GPUs de 24 GB se entreno correctamente).
- GPUs recomendadas: NVIDIA GeForce RTX 3090 (usadas en entrenamiento), o GPUs con al menos 16 GB de VRAM para inferencia en lotes.
- En consumer GPU: si, cabe en GPUs de gama alta (RTX 3090, 4090) con un modelo de deteccion estandar.
- Opciones de despliegue: MMOCR, PyTorch, Transformers (para el backbone). No se mencionan formatos ONNX o TensorRT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Parametros backbone | Mejor F-score (ICDAR2015) | Licencia |
|---|---|---|---|---|
| DBNet + ResNet-50 | ResNet-50 | 25M | 85.0 | Apache 2.0 |
| DBNet + oCLIP | oCLIP | no disponible | 87.4 | Apache 2.0 |
| **DBNet + MonkeyOCRv2** | ViTAEv2-S | 21M | **88.5** | Apache 2.0 |
| PSENet + ResNet-50 | ResNet-50 | 25M | 79.9 | Apache 2.0 |
| PSENet + oCLIP | oCLIP | no disponible | 84.9 | Apache 2.0 |
| **PSENet + MonkeyOCRv2** | ViTAEv2-S | 21M | **85.0** | Apache 2.0 |

El modelo mejora sistematicamente a las alternativas con el mismo detector, manteniendo la misma licencia permisiva y un backbone con menos parametros que ResNet-50.

## Limitaciones y advertencias

- No incluye reconocimiento de texto: solo produce localizaciones (bounding boxes o poligonos), no transcripciones.
- El encoder se carga via trust_remote_code=True desde HuggingFace, lo que implica ejecutar codigo remoto y requiere revision de seguridad en entornos corporativos.
- Los resultados se basan en tres datasets de texto en escena; el rendimiento en otros dominios (documentos escaneados, texto en tablas) no esta evaluado.
- El entrenamiento de PSENet con MonkeyOCRv2 requirio 4 GPUs frente a las 2 de los baselines, lo que puede indicar mayor consumo de memoria.
- El paquete es un add-on que parchea MMOCR v1.0.1; es necesario verificar la compatibilidad con versiones posteriores de MMOCR, MMCV o MMEngine.
- No se proporcionan pesos en formato GGUF, ONNX o TensorRT, lo que limita el despliegue en entornos de produccion optimizados.
- Los checkpoints son la mejor epoca en el conjunto de test, lo que puede introducir una leve sobreestimacion del rendimiento en comparacion con la validacion estricta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HB16888/MonkeyOCRv2_det
- ModelScope (checkpoints alternativos): https://modelscope.cn/models/WangXinhan/MonkeyOCRv2_det
- Encoder visual MonkeyOCRv2-AS: https://huggingface.co/zenosai/MonkeyOCRv2-AS
- Codigo fuente MMOCR: https://github.com/open-mmlab/mmocr
- Repositorio GitHub MonkeyOCRv2: https://github.com/Yuliang-Liu/MonkeyOCRv2
- Paper MonkeyOCRv2 (arXiv): https://arxiv.org/abs/2607.11562
- HTML del paper: https://arxiv.org/html/2607.11562
- Coleccion HuggingFace: https://huggingface.co/collections/zenosai/monkeyocrv2
- Referencia oCLIP: https://github.com/alkan25/oclip
