# jianlee/yolox-tiny-buildings

## Resumen

YOLOX-tiny-buildings es un detector de objetos de una sola clase (`building`) obtenido mediante fine-tuning de YOLOX-tiny sobre el conjunto de datos SpaceNet 2 de Jartum (AOI 5, Sudán), orientado a la detección de edificios en imágenes aéreas y de satélite. Lo desarrolla el usuario `jianlee` como componente del pipeline de geodatos `geo-pipeline`, y se distribuye exclusivamente en formato ONNX para ejecución en CPU.

El modelo no busca maximizar precisión, sino velocidad en inferencia sobre CPU. Según la model card, es 3,1 veces más rápido que un YOLOX-s afinado con el mismo dataset y conserva el 96% de su mAP@.5. Esto lo sitúa como una pieza adecuada para procesamiento por lotes de teselas de imagery a gran escala en entornos sin GPU dedicada.

La entrada es fija de `1x3x416x416` en float32 con orden de canales BGR y rango 0-255, con letterboxing sobre fondo gris (114). La salida es la cabeza cruda del detector (`1x3549x6`), de modo que la decodificación y el NMS deben implementarse en el consumidor; el repositorio de referencia incluye una implementación en Python (`stages/detector/yolox_onnx.py`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-tiny (detector de una etapa, anchor-free, cabeza desacoplada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 416x416) |
| Tipos de cuantizacion | FP32 y INT8 (QDQ estático de ONNX Runtime, calibrado con 30 teselas de entrenamiento) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`yolox_tiny_buildings.onnx`, `yolox_tiny_buildings_int8.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es YOLOX-tiny, un detector de una etapa con diseño anchor-free, cabeza desacoplada para clasificación y regresión, y asignación dinámica de etiquetas. Se parte del checkpoint COCO `yolox_tiny.pth` publicado por Megvii y se reentrena con el entrenador oficial de YOLOX para una única clase (`building`), con entrada de 416 px, 60 épocas (las últimas 10 sin mosaico), batch size 16, precisión fp16 y 240 teselas de entrenamiento. El comando de reproducción es `make train-yolox VARIANT=tiny SIZE=416` sobre el commit `a428f3398eabb069e47861939936bff95530e35e` de `geo-pipeline`.

Los datos proceden de SpaceNet 2 Khartoum (AOI 5). Las anotaciones son cajas alineadas con los ejes, convertidas a partir de las huellas de edificios del dataset; esto implica que los edificios rotados quedan sobre-representados en área y que los edificios pequeños y adyacentes son difíciles de separar. La exportación a ONNX incluye una variante INT8 mediante cuantización estática QDQ de ONNX Runtime.

## Capacidades

- Detección de objetos de una única clase: edificios en imagery aérea y satelital.
- Salida de cajas con puntuación de objetividad y probabilidad de clase, en formato de cabeza cruda que requiere decodificación externa.
- Inferencia en CPU con ONNX Runtime, con dos variantes (FP32 e INT8) y distinto coste por imagen.
- Procesamiento por teselas: el modelo opera sobre recortes de 416x416, lo que permite cubrir imágenes grandes mediante mosaico.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la imagen.
- No es multilingüe ni procesa texto.
- No incluye modo thinking, audio ni vídeo.

## Casos de uso

- Inventario de edificios a escala regional: procesar mosaicos de imagery satelital por teselas de 416 px en CPU, agregando las detecciones para estimar densidad construida o cambios en el tiempo.
- Monitorización de expansión urbana: comparar detecciones entre dos fechas sobre la misma zona para identificar nuevas construcciones, aprovechando el bajo coste por imagen (0,09 s/imagen con 4 hilos en FP32).
- Enriquecimiento de pipelines GIS: integrar el ONNX en un flujo de geodatos que convierta cajas a geometrías y las una a capas vectoriales, con el detector conectado mediante `DETECTOR_MODELS=yolox-tiny-buildings`.
- Despliegue en entornos sin GPU: servidores de bajo coste o nodos edge donde el INT8 a 0,06 s/imagen con 4 hilos permite procesar lotes grandes sin acelerador.
- Pre-filtrado en flujos de anotación: usar el modelo para proponer cajas candidatas y reducir el trabajo manual de etiquetado, aceptando la menor recall en edificios pequeños.
- Evaluación comparativa de detectores ligeros: servir como referencia de línea base al medir precisión y latencia frente a variantes mayores (YOLOX-s) en el mismo dataset.
- Prototipado rápido en cuadernos o scripts: cargar el ONNX con ONNX Runtime y validar la cadena de decodificación y NMS antes de integrar en producción.

## Benchmarks y rendimiento

Resultados sobre 30 teselas reservadas de SpaceNet Khartoum (510 edificios), teselas de 640 px, CPU y ONNX Runtime. La columna "s/imagen" corresponde al tiempo del modelo para una imagen de 650 px, que equivale a 4 teselas.

| Modelo | mAP@.5 | F1@.5 | s/imagen, 4 hilos | s/imagen, 1 hilo |
|---|---|---|---|---|
| yolox-tiny-buildings (FP32) | 0,564 | 0,562 | 0,09 | 0,26 |
| yolox-tiny-buildings-int8 | 0,559 | 0,548 | 0,06 | 0,11 |
| yolox-buildings (YOLOX-s, referencia) | 0,586 | 0,612 | 0,29 | 0,95 |

El criterio de aceptación declarado por el autor era alcanzar al menos el 90% del mAP@.5 del YOLOX-s afinado y ser al menos 2 veces más rápido; la variante INT8 debía quedar a menos de 2 puntos de su equivalente FP32.

## Requisitos de hardware

- Inferencia exclusivamente en CPU según la model card; no se documentan requisitos de VRAM ni ejecución en GPU.
- VRAM estimada: no disponible (el modelo se distribuye para CPU; una ejecución en GPU requeriría validación propia).
- GPU recomendadas: no disponibles.
- Cabe en cualquier CPU moderna: el coste medido es de 0,09 s/imagen (4 hilos) en FP32 y 0,06 s/imagen en INT8.
- Opciones de despliegue: ONNX Runtime (ruta validada por el autor), `geo-pipeline` con `DETECTOR_MODELS=stub,yolox-tiny-buildings` o `yolox-tiny-buildings-int8`. Otros runtimes ONNX no están documentados.
- Latencia y throughput: 0,26 s/imagen con 1 hilo en FP32 y 0,11 s/imagen con 1 hilo en INT8; el throughput agregado depende del número de hilos y del tamaño del mosaico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@.5 (Khartoum) | Licencia | Formato |
|---|---|---|---|---|---|
| yolox-tiny-buildings | no disponible | 416x416 | 0,564 | CC BY-SA 4.0 | ONNX |
| yolox-tiny-buildings-int8 | no disponible | 416x416 | 0,559 | CC BY-SA 4.0 | ONNX (INT8) |
| yolox-buildings (YOLOX-s) | no disponible | no disponible | 0,586 | no disponible | no disponible |
| YOLOX-tiny original (COCO) | no disponible | 416x416 | no aplica (80 clases COCO) | Apache-2.0 | PyTorch / ONNX |

La comparación directa solo es posible con las variantes del mismo autor y con el YOLOX-s afinado que sirve de referencia. No se dispone de datos de otros detectores de edificios en el mismo conjunto de evaluación.

## Limitaciones y advertencias

- Entrenado con una sola ciudad (Jartum), 240 teselas y una única ejecución: los resultados no demuestran generalización a otras ciudades, sensores o resoluciones.
- Las cajas son alineadas con los ejes a partir de huellas de edificios, por lo que los edificios rotados se sobreestiman y los pequeños y adyacentes son difíciles; la recall a IoU 0,5 es de 0,46.
- El autor advierte explícitamente que el modelo no debe usarse para decisiones sobre personas o propiedades sin validación independiente.
- La licencia CC BY-SA 4.0 es copyleft: obliga a atribución y a compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial y la integración en productos propietarios.
- La salida es la cabeza cruda del detector: sin decodificación y NMS correctos, los resultados no son utilizables; errores en esta etapa afectan directamente a la precisión.
- El letterboxing debe replicarse exactamente (fondo gris 114, entrada BGR, rango 0-255) para no degradar las detecciones.
- Riesgo de falsos positivos y negativos en imagery con techos de materiales, sombras o resoluciones distintas a las del entrenamiento.
- No hay información sobre sesgos geográficos más allá del propio dataset de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jianlee/yolox-tiny-buildings
- Repositorio geo-pipeline: https://github.com/leejianrong/geo-pipeline
- Implementación de decodificación y NMS: https://github.com/leejianrong/geo-pipeline/blob/main/stages/detector/yolox_onnx.py
- Informe de benchmarks: https://github.com/leejianrong/geo-pipeline/blob/main/docs/benchmarks/lightweight-detector.md
- Modelo base YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- SpaceNet Datasets: https://spacenet.ai/datasets/
