# ruisv/rcdl-yolo

## Resumen

`ruisv/rcdl-yolo` es una colección de modelos YOLO precompilados en formato RKNN (`.rknn`) para la NPU del SoC Rockchip RK3588 / RK3588S. No es un modelo entrenado desde cero, sino un conjunto de builds int8 derivados de los modelos nano de Ultralytics (YOLOv8n, YOLO11n y YOLO26n) en sus variantes de detección, segmentación de instancias, estimación de pose, detección de cajas orientadas y clasificación de imagen. El autor, `ruisv`, los publica junto a RCDL, una librería en C++17 y Python que orquesta NPU, RGA y VPU en un pipeline de copia cero.

El interés práctico es que elimina toda la cadena de exportación: no hace falta pasar por ONNX, ni calibrar, ni usar `rknn-toolkit2` en el host. Cada fichero es un artefacto listo para cargar en la placa, con el layout de cabecera, el número de clases y el tipo de cuantización embebidos y leídos en tiempo de construcción del motor. Los modelos cubren cinco tareas con entradas de 640×640 (224×224 para clasificación) en RGB uint8, con la normalización `/255` dentro del grafo.

La relevancia es doble: por un lado, ofrece una vía directa para desplegar visión por computador en placas RK3588 con aceleración NPU; por otro, documenta con mediciones reales que en esta NPU concreta los modelos más nuevos no son necesariamente más rápidos (YOLO11n y YOLO26n infieren más lento que YOLOv8n y encuentran los mismos objetos en la imagen de prueba). Todo el conjunto está bajo licencia AGPL-3.0 heredada de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo YOLO (cabeceras de detección, segmentación, pose, OBB y clasificación) sobre YOLOv8n / YOLO11n / YOLO26n |
| Parametros totales | no disponible (variantes "n" de Ultralytics; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no lingüístico) |
| Tipos de cuantizacion | int8 (builds de `rknn-toolkit2` 2.3.2, calibración `normal` por defecto) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.rknn` (compilado para NPU RK3588/RK3588S) |

Detalle de ficheros publicados:

| Fichero | Tarea | Tamano |
|---|---|---|
| `yolov8n_rk3588.rknn` | detección, 80 clases COCO | 4.1 MB |
| `yolo11n_rk3588.rknn` | detección, 80 clases COCO | 4.1 MB |
| `yolo26n_rk3588.rknn` | detección, 80 clases COCO, cabecera sin NMS | 4.1 MB |
| `yolov8n-seg_rk3588.rknn` | segmentación de instancias | 4.5 MB |
| `yolo26n-seg_rk3588.rknn` | segmentación de instancias | 4.6 MB |
| `yolov8n-pose_rk3588.rknn` | pose de persona, 17 keypoints | 5.0 MB |
| `yolo26n-pose_rk3588.rknn` | pose de persona, 17 keypoints | 4.7 MB |
| `yolov8n-obb_rk3588.rknn` | cajas orientadas, 15 clases DOTA | 4.2 MB |
| `yolo26n-obb_rk3588.rknn` | cajas orientadas, 15 clases DOTA | 4.2 MB |
| `yolo26n-cls_rk3588.rknn` | clasificación, 1000 clases ImageNet | 3.5 MB |

## Arquitectura y entrenamiento

Los modelos subyacentes son las variantes nano de la familia YOLO de Ultralytics: YOLOv8n, YOLO11n y YOLO26n. La arquitectura es una CNN con extractor de características multiescala y cabeceras específicas por tarea. En detección, las versiones v8 y v11 usan una rama de cajas con DFL (Distribution Focal Loss); YOLO26 sustituye esa rama por regresión LTRB directa y elimina la necesidad de NMS en la cabecera. La segmentación añade una rama de máscaras por instancia; la pose regresa 17 keypoints por persona; la variante OBB regresa cajas rotadas con ángulo; la clasificación usa un cabezal con softmax dentro del grafo.

Los datos de entrenamiento son los estándares de Ultralytics, no reentrenados por el autor: COCO para detección, segmentación y pose; DOTA v1 para cajas orientadas; ImageNet para clasificación. La aportación propia es la compilación: cada fichero es un build int8 generado con `rknn-toolkit2` 2.3.2 y calibración `normal`, con el layout de salida de Rockchip (`rknn_model_zoo`), donde las ramas de cajas, clases y scores de cada escala son tensores separados para mantener la cuantización de cajas independiente de la de scores. El autor advierte que la calibración `normal` puede degradar los scores de YOLO26 hasta aproximadamente 0.64× respecto al modelo PyTorch, y que `kl_divergence` más fp16 en las dos últimas etapas de la rama de clasificación y en la rama de cajas recupera casi toda la precisión perdida.

Una innovación destacable es que la cabecera se lee del propio fichero: tamaños de rejilla, número de clases, uso de DFL o LTRB, orden de canales y cuantización se extraen del artefacto, de modo que un fichero emparejado con un decodificador incompatible falla en la construcción imprimiendo su firma de salida en lugar de decodificar basura. Además, YOLO26 requiere tres convenciones que no están en el fichero y que el autor documenta explícitamente (decodificación de keypoints `cell_relative_whole`, ángulo en radianes con `angle_bias=0, angle_scale=1`, y `apply_softmax=False` en clasificación).

## Capacidades

- Detección de objetos en 80 clases COCO (YOLOv8n, YOLO11n y YOLO26n), con salida de cajas, clases y scores.
- Segmentación de instancias (YOLOv8n-seg y YOLO26n-seg) con máscaras por objeto.
- Estimación de pose de persona con 17 keypoints (YOLOv8n-pose y YOLO26n-pose).
- Detección de cajas orientadas en 15 clases DOTA (YOLOv8n-obb y YOLO26n-obb), útil para vistas aéreas.
- Clasificación de imagen en 1000 clases ImageNet (YOLO26n-cls).
- Entrada uint8 RGB a 640×640 (224×224 en clasificación) con normalización `/255` incorporada en el grafo.
- Letterboxing y mapeo de coordenadas de vuelta a píxeles de origen realizados por RCDL sobre el RGA.
- Ejecución acelerada en NPU RK3588/RK3588S con pipeline de copia cero NPU + RGA + VPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente visual.

## Casos de uso

- Videovigilancia en placa embebida: usar `yolov8n_rk3588.rknn` para detección de personas y vehículos en tiempo cuasi real (33.3 ms por tarea completa en RK3588S), adecuado para cámaras IP conectadas a una RK3588 sin GPU dedicada.
- Analítica de aforo y conteo: la variante de detección con 80 clases COCO permite contar personas y vehículos por fotograma; el pipeline de copia cero de RCDL reduce el coste de preprocesado en CPU.
- Seguimiento de personas y análisis de postura: `yolo26n-pose_rk3588.rknn` o `yolov8n-pose_rk3588.rknn` extraen 17 keypoints por persona, útiles para ergonomía, gimnasia o detección de caídas en dispositivos de borde.
- Inspección aérea con dron: la variante OBB (`yolo26n-obb_rk3588.rknn`) detecta 15 clases DOTA con cajas rotadas, apropiada para imágenes cenitales de barcos, aviones o vehículos en aparcamientos.
- Segmentación para recorte o edición: `yolov8n-seg_rk3588.rknn` y `yolo26n-seg_rk3588.rknn` generan máscaras por instancia que se pueden usar para sustituir fondos o aislar objetos en un flujo de postproducción local.
- Clasificación rápida en el borde: `yolo26n-cls_rk3588.rknn` clasifica en 3.8 ms por tarea completa (1000 clases ImageNet), útil como filtro previo antes de invocar modelos más caros.
- Prototipado y validación de pipelines: al estar precompilados y con la cabecera autodescriptiva, sirven para validar la cadena RCDL + NPU en una placa nueva sin pasar por el proceso de exportación y calibración.
- Robótica móvil: la baja latencia de detección (18.4 ms de NPU en YOLOv8n) permite cerrar bucles de control reactivos en robots con RK3588 a bordo.

## Benchmarks y rendimiento

Mediciones del autor en RK3588S con `librknnrt` 2.3.2, driver NPU 0.9.8, un núcleo NPU, mediana de cinco ejecuciones tras calentamiento. "NPU" es solo inferencia; "tarea completa" añade preprocesado y decodificación en CPU.

| Modelo | NPU (ms) | Tarea completa (ms) | Resultado en imagen de prueba |
|---|---|---|---|
| `yolov8n` | 18.4 | 33.3 | 1 autobús, 4 personas |
| `yolo11n` | 27.7 | 67.9 | 1 autobús, 4 personas |
| `yolo26n` | 36.9 | 70.5 | 1 autobús, 4 personas |
| `yolov8n-seg` | 31.3 | 122.1 | 5 instancias |
| `yolov8n-pose` | 35.2 | 79.7 | 4 personas |
| `yolov8n-obb` | 21.7 | 70.0 | 33 cajas rotadas |
| `yolo26n-cls` | 2.9 | 3.8 | space shuttle, 0.931 |

No se han publicado resultados de benchmarks estándar (mAP en COCO, precisión de keypoints, etc.) en la información disponible; las cifras anteriores son de latencia y de una única imagen de prueba.

## Requisitos de hardware

- SoC objetivo: Rockchip RK3588 o RK3588S con NPU integrada; los ficheros `.rknn` no se ejecutan en GPU de escritorio ni en CPU x86 sin emulación.
- Memoria: los ficheros pesan entre 3.5 y 5.0 MB, por lo que el modelo en sí ocupa muy poca memoria; el consumo dominante es el de los búferes de entrada/salida y el pipeline de vídeo.
- No cabe ni está pensado para GPU de consumo (RTX 4090, etc.): el formato RKNN es específico de la NPU de Rockchip.
- Despliegue: librería RCDL (C++17 / Python), disponible vía conda en `https://mirrors.ruis.ai/conda` para `linux-aarch64`; también se puede descargar el conjunto con `hf download ruisv/rcdl-yolo --local-dir models`.
- No se mencionan soporte para vLLM, llama.cpp, Ollama ni TGI: son herramientas para modelos de lenguaje, no aplicables aquí.
- Latencia y throughput: ver tabla de benchmarks; el autor no publica FPS agregados ni cifras de throughput multi-stream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en RK3588S | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ruisv/rcdl-yolo` (YOLOv8n) | no disponible (variante "n") | 640×640 RGB uint8 | 18.4 ms NPU / 33.3 ms tarea | AGPL-3.0 | Hugging Face, `.rknn` |
| `ruisv/rcdl-yolo` (YOLO26n) | no disponible (variante "n") | 640×640 RGB uint8 | 36.9 ms NPU / 70.5 ms tarea | AGPL-3.0 | Hugging Face, `.rknn` |
| Ultralytics YOLOv8n (`.pt`) | no disponible | 640×640 | no medido en esta NPU | AGPL-3.0 / Enterprise | GitHub, PyTorch |
| Ultralytics YOLO26n (`.pt`) | no disponible | 640×640 | no medido en esta NPU | AGPL-3.0 / Enterprise | GitHub, PyTorch |

La comparación con los `.pt` originales no está cuantificada en la información disponible más allá de la advertencia de que la calibración `normal` puede reducir los scores de YOLO26 a ~0.64× respecto a PyTorch. No se dispone de comparación con otras implementaciones RKNN de terceros.

## Limitaciones y advertencias

- Licencia AGPL-3.0 heredada de Ultralytics: cualquier software que distribuya estos ficheros o los sirva por red queda sujeto a AGPL-3.0; un producto cerrado o comercial requiere licencia Enterprise de Ultralytics.
- Los builds int8 con calibración `normal` pueden degradar los scores de YOLO26 (hasta ~0.64× del modelo PyTorch), lo que reduce el recall a un umbral de confianza fijo; el autor recomienda comparar contra el `.pt` en imágenes propias antes de fijar el umbral.
- YOLO26 requiere tres convenciones no embebidas en el fichero (decodificación de keypoints, ángulo en radianes y softmax ya aplicado); usar los valores por defecto de RCDL (convención v8) produce salidas que parecen plausibles pero son incorrectas.
- El layout de salida no es el de la exportación estándar de Ultralytics, sino el de `rknn_model_zoo` de Rockchip, con ramas separadas por escala.
- Modelos de visión: no procesan lenguaje, no soportan tool calling ni razonamiento multi-paso.
- Clases limitadas a los conjuntos de entrenamiento: 80 COCO, 15 DOTA, 1000 ImageNet; no hay clases personalizadas.
- Riesgo de falsos positivos y negativos inherente a modelos "nano" de detección; el autor no publica métricas de precisión/recall en COCO.
- Solo ejecutable en NPU RK3588/RK3588S; no hay soporte para otras plataformas en la información disponible.
- No se documentan sesgos específicos del modelo; al derivar de COCO, DOTA e ImageNet, hereda los sesgos de esos conjuntos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.

## Enlaces

- Hugging Face: https://huggingface.co/ruisv/rcdl-yolo
- Repositorio RCDL: https://github.com/ruisv/rcdl
- Benchmarks de RCDL: https://github.com/ruisv/rcdl/blob/main/benchmarks/RESULTS.md
- Ultralytics: https://github.com/ultralytics/ultralytics
- Licencia Enterprise de Ultralytics: https://www.ultralytics.com/license
- `rknn_model_zoo` de Rockchip: https://github.com/airockchip/rknn_model_zoo
