# CoreEpoch/rfdetr-base-int8-onnx

## Resumen

RF-DETR Base INT8 ONNX es una versión cuantizada a INT8 del detector de objetos RF-DETR Base de Roboflow, publicada por CoreEpoch mediante su herramienta propietaria de cuantización Kenosis. El modelo original (Robinson et al., ICLR 2026, arXiv:2511.09554) es un detector transformer en tiempo real cuya arquitectura fue descubierta mediante búsqueda de arquitectura neuronal (NAS); esta variante conserva la licencia Apache-2.0 del modelo base y se distribuye como un único fichero ONNX de 36,3 MB.

El interés de esta ficha radica en su propuesta de despliegue: cuantización de pesos y activaciones a INT8 sin reentrenamiento, usando solo 128 imágenes de COCO para calibración, con una pérdida de precisión declarada del 0,4 % respecto al modelo FP32 (53,12 AP frente a 53,32 AP en COCO val2017). Está pensada para inferencia en CPU con ONNX Runtime u OpenVINO, sin acelerador dedicado.

La entrada es una imagen RGB de 560x560 píxeles y la salida son 300 cajas normalizadas en formato cxcywh más 300 logits indexados por categoría COCO (91 clases). El repositorio ocupa 0,1 GB y el modelo acumula 19 descargas y 2 likes en HuggingFace en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer detector (RF-DETR, familia DETR con NAS), exportado a ONNX opset 17 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 1x3x560x560) |
| Tipos de cuantizacion | INT8 (pesos y activaciones), calibración con 128 imágenes COCO |
| Idiomas soportados | no aplica (detección de objetos; etiquetas COCO en inglés) |
| Licencia | Apache-2.0 (ficheros del modelo); la herramienta Kenosis es propietaria |
| Formato de pesos | ONNX (fichero único `rfdetr_base_560_int8_kenosis.onnx`, 36.325.518 bytes) |

## Arquitectura y entrenamiento

El modelo base RF-DETR es un detector de la familia DETR (transformer encoder-decoder con consultas de objeto) cuya arquitectura fue optimizada mediante búsqueda de arquitectura neuronal para operar en régimen de tiempo real, según el paper de Robinson et al. publicado en ICLR 2026. Esta variante no introduce cambios arquitectónicos: es una exportación del checkpoint FP32 de Roboflow (versión `rfdetr` 1.8.3, resolución 560x560) convertida a ONNX y posteriormente cuantizada.

La cuantización la realiza Kenosis, el cuantizador propietario de Core Epoch, aplicando INT8 tanto a pesos como a activaciones con un conjunto de calibración de 128 imágenes de COCO, sin reentrenamiento ni ajuste fino posterior. El autor declara una precisión de 53,12 AP en ONNX Runtime y 53,05 AP en OpenVINO frente a 53,32 AP del baseline FP32, evaluados sobre 4.800 imágenes de COCO val2017 (excluyendo las 200 de las que se extrajeron las 128 de calibración; la lista está en `eval_images.json`). No se documentan detalles sobre los datos de entrenamiento originales del modelo base ni sobre el uso de RLHF/DPO, que no aplican a un detector.

## Capacidades

- Detección de objetos en una sola pasada sobre imágenes RGB de 560x560, con hasta 300 cajas por imagen.
- Clasificación sobre las 91 categorías de COCO (índice de logits `labels [1,300,91]`), con scores obtenidos mediante sigmoide.
- Salida de cajas normalizadas en formato cxcywh (`dets [1,300,4]`), lista para postproceso con NMS o filtrado por umbral.
- Inferencia en CPU sin acelerador, con soporte declarado para ONNX Runtime (CPUExecutionProvider) y OpenVINO.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.
- No dispone de modo thinking, visión-lenguaje, audio ni capacidades multilingües más allá de las etiquetas COCO.

## Casos de uso

- Monitorización de vídeo en dispositivos sin GPU: al ejecutarse en CPU con ONNX Runtime y ocupar 36,3 MB, puede desplegarse en mini-PC, Raspberry Pi o contenedores ligeros para detectar personas, vehículos o animales en streams de cámaras IP.
- Preprocesado en pipelines de visión industrial: detección de piezas o defectos visibles en líneas de producción donde el coste de una GPU dedicada no está justificado y se prioriza la latencia sobre la precisión máxima.
- Anonimización de imágenes y vídeo: localización de personas u objetos sensibles antes de aplicar desenfoque, aprovechando la salida de cajas normalizadas para recortar regiones.
- Análisis de imágenes en el borde (edge computing) para aplicaciones de domótica o ciudades inteligentes, donde el modelo cabe en memoria y no requiere conexión a la nube.
- Etiquetado asistido y preanotación de datasets: generación de cajas candidatas sobre grandes volúmenes de imágenes en CPU para revisión humana posterior, reduciendo el coste frente a un modelo FP32 más pesado.
- Prototipado rápido en entornos sin GPU: validación de una idea de producto de detección de objetos con un único fichero ONNX y unas pocas líneas de Python, sin dependencias de CUDA.
- Despliegue en entornos con requisitos de tamaño estrictos (contenedores, sistemas embebidos) donde los 115,1 MB del FP32 son un lastre y los 36,3 MB del INT8 facilitan la distribución.

## Benchmarks y rendimiento

Precisión declarada por el autor sobre COCO val2017 (4.800 imágenes), AP50:95 con pycocotools:

| Modelo | ONNX Runtime | OpenVINO | Tamano |
|---|---|---|---|
| FP32 baseline | 53,32 | 53,32 | 115,1 MB |
| Kenosis INT8 | 53,12 | 53,05 | 36,3 MB |

Velocidad relativa frente al FP32, medida en CPU con AVX-VNNI:

| Runtime | Hilos | Mejora |
|---|---|---|
| ONNX Runtime | 1 | 67 % más rápido |
| ONNX Runtime | 4 | 45 % más rápido |
| OpenVINO | 4 | 91 % más rápido |

No se han publicado resultados de benchmarks comparativos con otros detectores (YOLO, DETR estándar) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. El fichero ocupa 36,3 MB y la memoria en tiempo de ejecución es moderada (entrada 1x3x560x560 más activaciones INT8).
- GPU: no se documenta soporte ni rendimiento en GPU; el autor solo reporta mediciones en CPU con AVX-VNNI.
- Consumer GPU: no aplica según la información disponible; el modelo no requiere GPU y no se han publicado cifras para CUDA/TensorRT.
- Despliegue: ONNX Runtime (CPUExecutionProvider) y OpenVINO son los runtimes validados. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: solo se publican mejoras relativas frente al FP32 (67 % con 1 hilo en ONNX Runtime, 45 % con 4 hilos, 91 % con OpenVINO y 4 hilos); no se dan valores absolutos en milisegundos ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision COCO | Licencia | Formato |
|---|---|---|---|---|---|
| RF-DETR Base INT8 ONNX (este) | no disponible | 560x560 | 53,12 AP (val2017 parcial) | Apache-2.0 | ONNX INT8 |
| RF-DETR Base FP32 (Roboflow) | no disponible | 560x560 | 53,32 AP (val2017 parcial) | Apache-2.0 | safetensors / ONNX FP32 |
| YOLO (variantes) | no disponible en la informacion | no disponible | no disponible | varía (AGPL o comercial) | varios |
| DETR estandar | no disponible en la informacion | no disponible | no disponible | Apache-2.0 | varios |

Solo se dispone de datos comparativos frente al propio modelo base FP32. No hay información en la documentación consultada sobre comparaciones con YOLO, DETR canónico u otros detectores en tiempo real.

## Limitaciones y advertencias

- La evaluación se realiza sobre 4.800 imágenes de COCO val2017, excluyendo las 200 de las que se extrajeron las 128 de calibración; no es una evaluación completamente independiente del conjunto de calibración.
- La pérdida de precisión es pequeña (0,2 AP en ONNX Runtime, 0,27 AP en OpenVINO), pero existe; en dominios distintos de COCO el degradado por cuantización puede ser mayor y no está medido.
- Solo detecta las 91 categorías de COCO; no es un modelo abierto a vocabularios personalizados sin reentrenamiento del base.
- No se documentan sesgos específicos del modelo, pero al entrenarse sobre COCO hereda los sesgos de composición y anotación de ese dataset (sesgo geográfico y demográfico en las imágenes).
- Riesgo de alucinación en el sentido de falsos positivos: el modelo siempre emite 300 cajas con logits; es responsabilidad del usuario aplicar umbrales de confianza y NMS.
- La licencia Apache-2.0 cubre únicamente los ficheros del modelo; no concede derechos sobre Kenosis, el cuantizador propietario de Core Epoch. Para uso comercial del proceso de cuantización o cuantizaciones personalizadas hay que contactar con licensing@coreepoch.dev.
- El modelo está pensado para CPU; no se han validado rendimientos en GPU ni en aceleradores específicos, lo que limita su uso en pipelines de alto throughput basados en CUDA.
- La fecha de creación del repositorio (2026-09-28) y la referencia al paper en ICLR 2026 deben verificarse contra la publicación oficial antes de citarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CoreEpoch/rfdetr-base-int8-onnx
- Repositorio RF-DETR de Roboflow: https://github.com/roboflow/rf-detr
- Modelo base: https://huggingface.co/Roboflow/rf-detr-base
- Kenosis (cuantizador de Core Epoch): https://coreepoch.dev/kenosis/
- Licencia de Kenosis: https://coreepoch.dev/kenosis/#licensing
- Paper RF-DETR (arXiv): https://arxiv.org/abs/2511.09554
- Contacto de licencias: licensing@coreepoch.dev
