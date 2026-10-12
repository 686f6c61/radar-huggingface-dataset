# KienNguyen2k1/DEIMv2_nano_license_plate

## Resumen

DEIMv2_nano_license_plate es un modelo de deteccion de objetos especializado en la localizacion de matriculas de vehiculos (bounding box), desarrollado por el usuario KienNguyen2k1. Se trata de un fine-tune del modelo base Intellindust-AI-Lab/DEIMv2 en su variante Nano, empleando el backbone HGNetv2-B0 preentrenado en COCO, y ajustado sobre el conjunto de datos License Plate Recognition de Roboflow Universe. El modelo resuelve la tarea de deteccion en tiempo real de matriculas sin necesidad de NMS durante la inferencia, gracias a su arquitectura DETR.

La relevancia del modelo radica en su naturaleza compacta y su orientacion a despliegue en produccion: trabaja con entradas de 640 x 640 pixeles, admite exportacion a ONNX y TensorRT, y esta publicado bajo licencia MIT, lo que facilita su integracion en sistemas comerciales de vision por computador. Reporta un mAP@50:95 de 0,684 y un mAP@50 de 0,961 sobre su conjunto de validacion, si bien las metricas de objetos pequenos son notablemente inferiores (AP@50:95 small de 0,468).

Es importante subrayar que no es un modelo de lenguaje: no genera texto ni mantiene conversaciones. Su funcion es exclusivamente detectar la region de la matricula; la lectura de caracteres (OCR) debe realizarse en una etapa posterior. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DEIMv2 Nano, DETR en tiempo real (sin NMS), backbone HGNetv2-B0 |
| Parametros totales | no disponible (variante Nano de la familia DEIMv2; la familia cubre desde ~1,5 M hasta tamanos superiores) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos; entrada de imagen de 640 x 640) |
| Tipos de cuantizacion | exportacion a ONNX y TensorRT; no se documentan cuantizaciones especificas (INT8, FP16) mas alla de las soportadas por esos runtimes |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT (el codigo fuente original de DEIMv2 es Apache-2.0) |
| Formato de pesos | PyTorch (.pth), exportable a ONNX y TensorRT |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DEIMv2, una familia de detectores DETR en tiempo real que prescinde del post-procesado NMS. La variante Nano emplea el backbone HGNetv2-B0. En las variantes mayores de la familia (S, M, L y X) DEIMv2 incorpora backbones preentrenados o destilados de DINOv3 junto con un adaptador de ajuste espacial (STA, Spatial Tuning Adapter) que convierte la salida monoescala de DINOv3 en caracteristicas multiescala; no se especifica en la informacion disponible si la variante Nano utiliza este componente. El checkpoint de partida es un modelo preentrenado en COCO.

El ajuste fino se realizo sobre el dataset License Plate Recognition de Roboflow Universe, con etiquetas en formato YOLO (class_id cx cy w h, normalizadas 0-1). Los hiperparametros por defecto son 100 epocas, batch size de 32, learning rate de 2e-4, precision mixta (AMP) activada e inicializacion desde el checkpoint COCO (las cabezas con numero de clases distinto se descartan y se reinicializan). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo coherente con la naturaleza del modelo.

## Capacidades

- Deteccion de matriculas de vehiculos mediante bounding boxes sobre imagenes de entrada de 640 x 640.
- Inferencia en tiempo real sin NMS, lo que simplifica la latencia del pipeline.
- Exportacion a ONNX y TensorRT para despliegue optimizado.
- Deteccion multiescala, con rendimiento diferenciado por tamano de objeto.
- No realiza reconocimiento de caracteres (OCR): solo delimita la region de la matricula.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa texto).
- No incorpora modo de razonamiento (thinking mode), vision generativa ni audio.

## Casos de uso

- Control de acceso en parkings: el modelo detecta la matricula en la imagen capturada por la camara de la barrera; la region resultante se envia despues a un motor OCR que lee los caracteres y consulta la base de datos de vehiculos autorizados.
- Gestion de peajes y trafico: deteccion de la matricula en el carril de peaje como paso previo a la lectura y facturacion, aprovechando la ausencia de NMS para mantener baja la latencia.
- Preprocesado para OCR: recorte automatico de la region de la matricula para alimentar un modelo de reconocimiento de caracteres, reduciendo el area de busqueda y mejorando la precision de la lectura.
- Vigilancia de trafico urbano: extraccion de matriculas de camaras de trafico para analitica de flujos, deteccion de vehiculos en infraccion o conteo por carril.
- Despliegue en dispositivos de borde (edge): por su tamano reducido y la exportacion a ONNX/TensorRT, puede ejecutarse en equipos con recursos limitados en puntos de captura distribuidos.
- Analitica de flotas y logistica: registro automatico de entradas y salidas de vehiculos en instalaciones, generando trazas horarias para control operativo.
- Integracion en pipelines de vision existentes: al exportarse a ONNX, se puede insertar como etapa de deteccion dentro de un sistema mayor junto con clasificadores o lectores de matriculas.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validacion con el estandar COCO eval (IoU metric: bbox):

| Split | mAP@50 | mAP@75 | mAP@50:95 | AR@50:95 (maxDets=100) |
|---|---|---|---|---|
| Validation | 0,961 | 0,811 | 0,684 | 0,800 |

Desglose por tamano de objeto:

| Metrica | Small | Medium | Large |
|---|---|---|---|
| AP@50:95 | 0,468 | 0,720 | 0,775 |
| AR@50:95 | 0,598 | 0,835 | 0,887 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, fuera del conjunto de validacion propio) en la informacion disponible.

## Requisitos de hardware

- No se han publicado cifras oficiales de VRAM ni de latencia para este fine-tune en la informacion disponible.
- Por tratarse de una variante Nano (DEIMv2) orientada a tiempo real, es previsible que quepa en GPUs de consumo (por ejemplo, gama RTX consumer) y en dispositivos de borde, aunque no se aportan valores concretos.
- Opciones de despliegue documentadas: PyTorch nativo (scripts del repositorio kienkk-0808/DEIMv2-nano-custom), exportacion a ONNX y exportacion a TensorRT.
- La familia DEIMv2 base dispone de una conversion a NPU de AXERA (AX650) con cuantizacion w8a16, si bien no se confirma que este fine-tune concreto haya sido convertido.
- No se dispone de datos de throughput ni de latencia medidos para este modelo.

## Comparativa con modelos similares

No se dispone de resultados comparables de otros detectores de matriculas en la informacion proporcionada. A modo de referencia de la familia base DEIMv2 sobre COCO (tarea distinta y dataset distinto al de este fine-tune, por lo que no son directamente comparables):

| Modelo | Parametros | AP (COCO) | Licencia | Disponibilidad |
|---|---|---|---|---|
| DEIMv2-Pico | ~1,5 M | 38,5 AP | Apache-2.0 | GitHub y Hugging Face (familia base) |
| DEIMv2-S | 9,71 M | 50,9 AP | Apache-2.0 | GitHub y Hugging Face (familia base) |
| DEIMv2_nano_license_plate | no disponible | 68,4 mAP@50:95 (validacion propia de matriculas) | MIT | Hugging Face |

## Limitaciones y advertencias

- Objetos pequenos: el AP@50:95 para objetos small es de 0,468, notablemente inferior al de objetos medium (0,720) y large (0,775). El autor sugiere aumentar `eval_spatial_size` y el `Resize` en la configuracion para mejorar en este caso.
- El modelo unicamente detecta la caja delimitadora de la matricula; no reconoce caracteres (no realiza OCR).
- El rendimiento depende fuertemente del dataset de entrenamiento: condiciones de baja luminosidad, angulos muy inclinados o matriculas atipicas fuera de la distribucion de entrenamiento pueden degradar la precision.
- Al tratarse de un dataset pequeno, el autor advierte del riesgo de sobreajuste y recomienda reducir el learning rate y/o el numero de epocas.
- No se han publicado datos sobre sesgos (por ejemplo, geograficos o por tipo de matricula) en la informacion disponible.
- Existe riesgo de falsos positivos y negativos propio de cualquier detector; conviene validar el umbral de confianza en el dominio de despliegue concreto.
- Licencia MIT para este modelo, con la salvedad de que el codigo original de DEIMv2 es Apache-2.0 y el dataset de Roboflow se rige por la licencia de su autor. Verificar la compatibilidad de licencias antes de un uso comercial.
- Modelo sin descargas ni likes en el momento de redactar la ficha, lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KienNguyen2k1/DEIMv2_nano_license_plate
- Modelo base: https://huggingface.co/Intellindust-AI-Lab/DEIMv2
- Repositorio DEIMv2 (Intellindust-AI-Lab): https://github.com/Intellindust-AI-Lab/DEIMv2
- Pagina de proyecto DEIMv2: https://intellindust-ai-lab.github.io/projects/DEIMv2/
- Repositorio DEIM (CVPR 2025): https://github.com/Intellindust-AI-Lab/DEIM
- Repositorio de train, inferencia y exportacion: https://github.com/kienkk-0808/DEIMv2-nano-custom
- Dataset (Roboflow Universe): https://universe.roboflow.com/roboflow-universe-projects/license-plate-recognition-rxg4e
- Documentacion DEIMv2 en Hugging Face: https://hf-p-cfw.fyan.top/docs/transformers/model_doc/deimv2
- Conversion a NPU de AXERA (variante base): https://huggingface.co/AXERA-TECH/DEIMv2
