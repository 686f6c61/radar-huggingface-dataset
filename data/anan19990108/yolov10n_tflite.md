# anan19990108/yolov10n_tflite

## Resumen

El repositorio `anan19990108/yolov10n_tflite` contiene tres exportaciones TensorFlow Lite (TFLite) del detector de objetos YOLOv10n, preparadas para experimentación en dispositivos de borde. Los tres artefactos operan a una resolución fija de 640×640 píxeles y producen hasta 300 detecciones por imagen, cada una codificada como un vector de 6 valores. La diferencia principal entre los archivos radica en los tipos de datos de las fronteras de entrada y salida: solo `yolov10n_full_integer_quant.tflite` utiliza tensores INT8 tanto en entrada como en salida, mientras que los otros dos exponen fronteras FP32 aunque contienen tensores internos cuantizados.

El autor del repositorio, `anan19990108`, indica que la conversión y verificación fue realizada por Andrew Chiao, pero la procedencia del checkpoint original no ha sido recuperada. Esto significa que no se puede confirmar si el modelo base es exactamente YOLOv10n de THU-MIG o alguna variante, aunque el nombre de los archivos y el repositorio apuntan a ello. Esta falta de trazabilidad es una limitación importante para uso en producción.

La relevancia de este repositorio radica en ofrecer versiones TFLite ya cuantizadas de un detector moderno, listas para ser integradas en aplicaciones Android, Raspberry Pi o sistemas con aceleradores como Qualcomm QNN HTP. Sin embargo, al no incluir benchmarks de precisión ni latencia, su utilidad práctica queda condicionada a que el desarrollador realice sus propias validaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10n (no confirmado; la procedencia del checkpoint no ha sido recuperada) |
| Parametros totales | no disponible (YOLOv10n tiene aproximadamente 2,3 millones, pero no se ha verificado para estos binarios) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | INT8 (tensores internos); fronteras INT8 o FP32 segun el archivo |
| Idiomas soportados | no aplica (deteccion de objetos) |
| Licencia | AGPL-3.0 (segun el repositorio; requiere confirmacion de la procedencia del checkpoint) |
| Formato de pesos | TensorFlow Lite (.tflite) |

Detalle de los tres archivos incluidos:

| Archivo | Entrada | Salida | Tensores cuantizados | Tamano |
|---|---|---|---|---|
| `yolov10n_full_integer_quant.tflite` | INT8 `[1,640,640,3]`, escala 1/255, zero point -128 | INT8 `[1,300,6]`, escala 0.310396, zero point -128 | 504 | 3.092.615 bytes |
| `yolov10n_integer_quant.tflite` | FP32 `[1,640,640,3]` | FP32 `[1,300,6]` | 503 | 3.092.559 bytes |
| `yolov10n_int8.tflite` | FP32 `[1,640,640,3]` | FP32 `[1,300,6]` | 77 | 3.125.847 bytes |

## Arquitectura y entrenamiento

YOLOv10 es una familia de detectores de objetos de una sola etapa que introduce el entrenamiento sin NMS (non-maximum suppression) mediante un mecanismo de asignacion dual de etiquetas y una estrategia de consistencia de la cabeza de deteccion. El modelo base YOLOv10n es la variante mas pequena de la familia, disenada para ejecucion en tiempo real en dispositivos con recursos limitados. Sin embargo, en este repositorio no se proporciona informacion sobre el proceso de entrenamiento, el dataset utilizado ni el numero de epocas. El autor indica explicitamente que la procedencia del checkpoint original no ha sido recuperada y que los metadatos del modelo base se omiten intencionalmente para no inferirlos.

La conversion a TFLite se realizo mediante post-training quantization, dando lugar a tres variantes con diferentes grados de cuantizacion. La variante `full_integer_quant` es la mas adecuada para aceleradores de hardware que requieren entradas y salidas enteras, como los que se encuentran en telefonos Android con NPU o DSP. Las otras dos variantes, aunque contienen tensores cuantizados internamente, mantienen fronteras FP32, lo que simplifica la integracion con pipelines de preprocesado estandar en Python o C++.

## Capacidades

- Deteccion de objetos en imagenes RGB de 640×640 píxeles, con salida de hasta 300 detecciones por imagen.
- Cada deteccion se representa como un vector de 6 valores, tipicamente `[x1, y1, x2, y2, score, class_id]`, aunque esta convencion debe verificarse con una imagen de prueba conocida.
- Inferencia en dispositivos de borde gracias a la cuantizacion INT8 y al tamano reducido de los archivos (alrededor de 3 MB).
- Compatibilidad con el delegado QNN de Qualcomm para aceleracion en hardware HTP (Hexagon Tensor Processor), como se muestra en el fragmento de codigo Java del README.
- Posibilidad de ejecucion en CPU mediante TensorFlow Lite sin dependencias adicionales, aunque con mayor latencia que en aceleradores dedicados.

## Casos de uso

- Inspeccion visual en fabricas: el modelo puede integrarse en un sistema de camara industrial para detectar defectos o piezas ausentes en una linea de montaje. Su tamano reducido permite ejecutarlo en un PLC con capacidades de IA o en un mini-PC de bajo consumo, procesando imagenes a 640×640 con una latencia aceptable para control de calidad en tiempo real.
- Vigilancia perimetral con privacidad local: al ejecutarse en un dispositivo de borde (por ejemplo, una Raspberry Pi 5 o un telefono Android), el video nunca sale del dispositivo, evitando problemas de proteccion de datos. La cuantizacion INT8 reduce el consumo energetico y permite alimentar el sistema con baterias o paneles solares.
- Robotica movil: un robot autonomo puede usar este modelo para detectar obstaculos u objetos de interes en su entorno. La salida estandarizada de cajas delimitadoras permite alimentar un modulo de planificacion de trayectorias sin necesidad de post-procesado complejo.
- Agricultura de precision: deteccion de frutas, plagas o malas hierbas en imagenes capturadas por drones o tractores. El modelo puede ejecutarse en el propio dron para tomar decisiones en vuelo, reduciendo la cantidad de datos que hay que transmitir a una estacion base.
- Aplicaciones Android de realidad aumentada: el modelo puede anadirse a una app Android mediante el delegado QNN para detectar objetos en la camara en tiempo real y superponer informacion virtual. La variante `full_integer_quant` es la recomendada para aprovechar al maximo el hardware HTP de los SoC Snapdragon.
- Prototipado rapido de sistemas de deteccion: gracias a los tres formatos disponibles, un investigador puede probar rapidamente el modelo en diferentes plataformas (Python, Android, C++) sin necesidad de convertir el modelo desde cero, comparando el rendimiento de cada variante en su hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la verificacion se limito a comprobar formas, dtypes, parametros de cuantizacion, tamanos y hashes con TensorFlow Lite, pero no se incluyen metricas de precision (mAP, recall) ni de latencia en ningun dispositivo. Por tanto, no es posible comparar este modelo con otras implementaciones de YOLOv10n en terminos de rendimiento real.

## Requisitos de hardware

- Tamano de los archivos: aproximadamente 3 MB, lo que permite almacenarlos en memorias flash de dispositivos embebidos sin problema.
- VRAM estimada para inferencia: no aplica directamente, ya que TFLite se ejecuta en CPU, GPU o NPU. En una CPU movil, el modelo puede requerir entre 200 MB y 500 MB de RAM durante la inferencia, dependiendo del runtime y de las optimizaciones.
- GPU recomendadas: no es necesario; el modelo esta disenado para CPU y aceleradores de bajo consumo. En una GPU de escritorio se puede ejecutar con TensorFlow Lite, pero no es el caso de uso previsto.
- Compatibilidad con consumer GPU: no relevante; el objetivo son dispositivos de borde.
- Opciones de despliegue:
  - TensorFlow Lite Runtime en Python (como se muestra en el README).
  - Delegado QNN en Android para SoC Qualcomm con HTP (Snapdragon 8 Gen 1 y posteriores, entre otros).
  - LiteRT (anteriormente TensorFlow Lite) en C++ para sistemas embebidos.
  - Posible uso con NNAPI en Android para aceleracion generica.
- Latencia y throughput estimados: no disponibles. Dependen fuertemente del hardware y de la variante elegida. En un Snapdragon 8 Gen 2 con HTP, se esperan latencias de decenas de milisegundos, pero no hay datos verificados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que no es posible realizar una comparativa cuantitativa fiable. A nivel cualitativo, se puede situar frente a otras conversiones TFLite de detectores de una etapa:

| Modelo | Tamano (aprox.) | Cuantizacion | Frontera entrada/salida | Procedencia verificada |
|---|---|---|---|---|
| YOLOv10n TFLite (este repo) | 3,1 MB | INT8 | INT8 o FP32 segun archivo | No |
| YOLOv8n TFLite (exportacion oficial Ultralytics) | ~6 MB | FP32 o INT8 | FP32 o INT8 | Si |
| YOLO11n TFLite (exportacion oficial Ultralytics) | ~5 MB | FP32 o INT8 | FP32 o INT8 | Si |

La principal diferencia es la trazabilidad: las exportaciones oficiales de Ultralytics incluyen metadatos del modelo base y comandos de exportacion documentados, mientras que este repositorio carece de esa informacion. En terminos de tamano, los archivos de este repo son mas pequenos que las exportaciones de Ultralytics, probablemente debido a una cuantizacion mas agresiva o a la omision de cabeceras adicionales, pero no se puede confirmar sin analisis detallado.

## Limitaciones y advertencias

- Procedencia no confirmada: el autor no ha recuperado el checkpoint original ni el comando de exportacion. El repositorio y los nombres de archivo sugieren YOLOv10n, pero la model card anterior etiquetaba `Ultralytics/YOLO11` como base, lo que anade confusion. No se debe asumir que es el YOLOv10n oficial de THU-MIG sin verificacion adicional.
- Sin benchmarks de precision: no hay metricas mAP ni evaluaciones sobre datasets estandar como COCO. El modelo podria tener una precision significativamente degradada respecto al checkpoint original debido a la cuantizacion, pero no se ha medido.
- Convencion de salida no verificada: el formato `[x1, y1, x2, y2, score, class_id]` es el tipico, pero el autor advierte que debe confirmarse con una imagen de prueba conocida antes de usar el modelo en produccion. Es posible que la salida utilice coordenadas normalizadas o un orden diferente.
- Riesgo de alucinacion: aunque es un modelo de vision y no de lenguaje, la cuantizacion agresiva puede provocar falsos positivos o detecciones inexistentes, especialmente en objetos pequenos o con poco contraste.
- Licencia AGPL-3.0: si el checkpoint base es efectivamente YOLOv10n, la licencia AGPL-3.0 implica que cualquier aplicacion que use este modelo y se distribuya debe publicar su codigo fuente bajo la misma licencia. Esto puede ser problematico para proyectos comerciales cerrados. Ademas, al no estar confirmada la procedencia, la validez de la licencia es incierta.
- Sin soporte de idiomas: al ser un modelo de vision, no aplica. No obstante, la documentacion esta solo en ingles.
- Fechas futuras: el repositorio fue creado el 2026-03-30 y actualizado el 2026-08-18, lo que resulta extrano en el contexto actual (2025). Esto podria indicar un error en los metadatos o un repositorio con fecha manipulada. Se recomienda precaucion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anan19990108/yolov10n_tflite
- Arbol de archivos del repositorio: https://huggingface.co/anan19990108/yolov10n_tflite/tree/main
- Repositorio oficial de YOLOv10 (THU-MIG): https://github.com/THU-MIG/yolov10
- Documentacion de integracion TFLite de YOLOv10: https://github.com/THU-MIG/yolov10/blob/main/docs/en/integrations/tflite.md
- Guia de conversion a TFLite con cuantizacion int8 (Medium): https://medium.com/@salihamirza456/how-to-convert-yolov10n-model-to-tflite-with-int8-quantization-cefe8c86f5c3
- Repositorio de ejemplo ftyolov10n (GitHub): https://github.com/othrou/ftyolov10n
