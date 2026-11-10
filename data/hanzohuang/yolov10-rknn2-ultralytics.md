# HanzoHuang/YOLOv10-RKNN2-Ultralytics

## Resumen

YOLOv10-RKNN2-Ultralytics es un conjunto de pesos del detector de objetos YOLOv10 ya convertidos al formato RKNN2 para su ejecucion sobre las NPU de los SoC Rockchip RK3576 y RK3588. Lo publica el usuario HanzoHuang en Hugging Face y no introduce un modelo nuevo: parte de los checkpoints oficiales de Ultralytics y los transforma con el exportador de Ultralytics 8.4.184 y RKNN Toolkit2 2.3.2, la cadena oficial de Rockchip. El resultado son ficheros `model.rknn` listos para desplegar en placas embebidas sin tener que repetir la conversion.

El repositorio cubre las seis variantes de la familia YOLOv10 (n, s, m, b, l y x) en dos precisiones, FP16 e INT8, para cada uno de los dos chips, lo que da 24 combinaciones organizadas en `models/detect/<checkpoint>/<chip>/<precision>/`. Cada carpeta incluye el binario `model.rknn` y un `metadata.yaml` con los metadatos de entrada y clases. El tamano total del repositorio es de 1,0 GB.

Su relevancia es practica: YOLOv10 es un detector transformer-free de la familia YOLO con eliminacion de NMS mediante entrenamiento consistente dual, y llevarlo a NPU Rockchip permite inferencia de deteccion de objetos de baja latencia en dispositivos de borde (vigilancia, robotica, industrial) sin GPU dedicada. La licencia AGPL-3.0 heredada de Ultralytics condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10 (CNN, deteccion de objetos, NMS-free) exportada a RKNN2 |
| Parametros totales | no disponible (depende de la variante n/s/m/b/l/x) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo de texto) |
| Tipos de cuantizacion | FP16 e INT8 (calibracion con COCO128, `--calibration-limit 128`) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (`.rknn`), con `metadata.yaml`; checkpoints originales `.pt` de Ultralytics en `source/weights` |
| Variantes | yolov10n, yolov10s, yolov10m, yolov10b, yolov10l, yolov10x |
| Chips objetivo | Rockchip RK3576 y RK3588 |
| Tamano de entrada | 640 px (`--imgsz 640` en el script de conversion) |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo subyacente es YOLOv10, un detector de objetos de una sola etapa basado en CNN. Su innovacion principal es el entrenamiento consistente dual (consistent dual assignments), que elimina la necesidad de supresion no maxima (NMS) en inferencia alineando las asignaciones de etiquetas de las cabezas one-to-one y one-to-many durante el entrenamiento. Esto reduce la latencia de post-proceso, algo especialmente relevante en NPU donde el NMS suele ejecutarse en CPU y penaliza el rendimiento.

Este repositorio no reentrena el modelo: solo lo convierte. El proceso documentado usa Ultralytics 8.4.184 y RKNN Toolkit2 2.3.2. Para FP16 se exporta el grafo directamente; para INT8 se cuantiza el grafo usando un manifiesto de calibracion con imagenes de COCO128 (`train2017`), limitado a 128 muestras por defecto. El repositorio incluye el script `source/convert-model.py`, los checkpoints de entrada, las versiones de paquetes y los hashes de calibracion, ademas de un `manifest.json` con hashes de ficheros, precision y tamano de entrada, lo que permite reproducir la conversion de forma verificable. No se especifican en la informacion disponible los datos de entrenamiento originales de YOLOv10 ni si hubo RLHF/DPO (no aplica a un detector).

## Capacidades

- Deteccion de objetos en imagenes con las seis variantes de YOLOv10 (n a x), permitiendo elegir el equilibrio precision/latencia.
- Inferencia NMS-free, lo que simplifica el pipeline en dispositivos de borde.
- Ejecucion sobre NPU Rockchip RK3576 y RK3588 en FP16 e INT8.
- Salida con cajas delimitadoras y clases segun el `metadata.yaml` de cada variante.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-step ni capacidades multilingues: es exclusivamente un modelo de vision para deteccion.
- No incluye segmentacion, pose ni clasificacion; solo la tarea de deteccion (`pipeline_tag: object-detection`).
- La version INT8 permite reducir el uso de memoria y aumentar el throughput a costa de una posible perdida de precision frente a FP16.

## Casos de uso

- Vigilancia perimetral en camaras IP: desplegar `yolov10n` o `yolov10s` en INT8 sobre un RK3588 permite deteccion en tiempo real en un dispositivo de bajo consumo, sin GPU ni servidor central.
- Robotica movil y AGV: usar `yolov10m` en FP16 para deteccion de obstaculos y personas con mayor precision, aprovechando la NPU para no cargar la CPU del controlador.
- Inspeccion industrial en linea de produccion: `yolov10l` o `yolov10x` en FP16 para detectar defectos en piezas, donde prima la precision sobre la latencia y el RK3588 ofrece NPU suficiente.
- Analitica de video en el borde (retail, aforo): contar personas y objetos en multiples flujos con `yolov10s` INT8, reduciendo el ancho de banda al no enviar video a la nube.
- Drones y dispositivos autonomos: `yolov10n` en INT8 por su bajo consumo y tamano, para deteccion de objetos en vuelo sobre placas Rockchip.
- Prototipado rapido de productos de vision: el repositorio ya incluye los binarios convertidos, de modo que un equipo puede validar la precision y latencia en su placa antes de invertir en su propia cadena de conversion.
- Integracion en pipelines de video con GStreamer/Rockchip MPP: los `.rknn` se cargan directamente con la libreria RKNN Runtime, facilitando su inclusion en aplicaciones C/C++ o Python existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de mAP ni de latencia para las variantes ni para los chips; solo documenta el proceso de conversion y los hashes de los ficheros.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3576 o RK3588 con NPU integrada; no esta pensado para GPU NVIDIA ni CPU generica.
- VRAM: no aplica; el modelo se ejecuta sobre la NPU y la memoria compartida del SoC. El consumo depende de la variante (n a x) y de la precision (FP16 o INT8); no se proporcionan cifras concretas.
- GPU recomendadas: no aplica. Para el flujo de conversion se requiere un entorno con RKNN Toolkit2 2.3.2, habitualmente sobre Linux x86.
- Cabe en consumer GPU: no aplica; el formato `.rknn` no se ejecuta en GPU de consumo. Los checkpoints `.pt` originales de Ultralytics si podrian ejecutarse en GPU, pero no es el objetivo del repositorio.
- Opciones de despliegue: RKNN Runtime de Rockchip (libreria `librknnrt`), integrable con GStreamer y el framework multimedia de Rockchip. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la variante, la precision y el chip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv10-RKNN2-Ultralytics (este) | segun variante n-x | no aplica | RKNN | AGPL-3.0 | Hugging Face |
| YOLOv10 oficial (Ultralytics) | segun variante n-x | no aplica | PyTorch (.pt) | AGPL-3.0 | GitHub / Ultralytics |
| YOLOv8 | segun variante n-x | no aplica | PyTorch, exportable a RKNN | AGPL-3.0 | Ultralytics |
| YOLO11 | segun variante n-x | no aplica | PyTorch, exportable a RKNN | AGPL-3.0 | Ultralytics |

La diferencia clave frente a los modelos oficiales es que este repositorio ya entrega los binarios RKNN2 para RK3576/RK3588, evitando al usuario la conversion. Frente a YOLOv8 o YOLO11, YOLOv10 aporta la eliminacion de NMS; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en productos distribuidos o en servicios en red puede obligar a liberar el codigo fuente; revisar con asesoria legal antes de produccion.
- Solo deteccion de objetos: no sirve para segmentacion, pose, clasificacion ni tareas de lenguaje.
- La cuantizacion INT8 puede degradar la precision respecto a FP16; conviene validar con el dataset propio antes de desplegar.
- La calibracion INT8 se hizo con COCO128 (128 imagenes), lo que puede no representar dominios muy distintos (industrial, medico, nocturno).
- Dependencia de la NPU Rockchip: los `.rknn` no son portables a otras plataformas; para GPU o CPU hay que usar los `.pt` originales.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay falsos positivos y negativos propios de cualquier detector.
- Sesgos: no se documentan sesgos especificos; los hereda del entrenamiento de YOLOv10 (COCO y datos de Ultralytics).
- No se especifican idiomas ni contexto porque el modelo no procesa texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validacion comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/HanzoHuang/YOLOv10-RKNN2-Ultralytics
- Script de conversion: https://huggingface.co/HanzoHuang/YOLOv10-RKNN2-Ultralytics/tree/main/source
- Manifiesto del modelo: https://huggingface.co/HanzoHuang/YOLOv10-RKNN2-Ultralytics/blob/main/manifest.json
- Origen de checkpoints: https://huggingface.co/HanzoHuang/YOLOv10-RKNN2-Ultralytics/blob/main/source/weights.json
- Ultralytics 8.4.184 en PyPI: https://pypi.org/project/ultralytics/8.4.184/#files
- RKNN Toolkit2 2.3.2: https://github.com/airockchip/rknn-toolkit2/tree/v2.3.2
- Ultralytics (repositorio oficial): https://github.com/ultralytics/ultralytics
