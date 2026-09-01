# litert-community/yolox-s-litert

## Resumen

YOLOX-S LiteRT es una conversión del detector de objetos YOLOX-S de Megvii, reescrito para ejecutarse de forma nativa en GPU mediante LiteRT, el sucesor de TensorFlow Lite. El modelo original es una CNN pura entrenada sobre COCO 2017, y esta versión ha sido reautorizada con el flujo oficial `litert_torch` para eliminar operaciones incompatibles con el delegado GPU, como `GATHER_ND` o tensores de más de 4 dimensiones. El resultado es un archivo `.tflite` de 18,2 MB en FP16, con entrada de 640×640 píxeles y salida de 8400 anclas con 85 valores cada una (4 coordenadas de caja, 1 puntuación de objeto y 80 clases).

La relevancia de este modelo radica en su idoneidad para despliegue en dispositivos móviles y edge: todo el grafo se ejecuta en GPU sin caídas a CPU, y se ha verificado en un Pixel 8a con una correlación superior a 0,999 entre la salida GPU y la referencia CPU/PyTorch. Además, al ser Apache-2.0, ofrece una alternativa permisiva a la familia YOLO (AGPL), lo que facilita su integración en productos comerciales. La decodificación de cajas y el NMS se realizan en el host, manteniendo el grafo limpio para aceleradores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-S (CNN pura, Focus stem reemplazado por conv 6×6 stride-2) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT) |

## Arquitectura y entrenamiento

YOLOX-S es un detector de una etapa basado en una CNN pura. La conversión a LiteRT ha requerido reescribir el grafo: el stem Focus original, que usa operaciones de espacio a profundidad con stride 2, se ha fusionado con la convolución 3×3 posterior en una única convolución 6×6 stride-2 numéricamente equivalente. Esto elimina cualquier operación `GATHER`, `GATHER_ND`, `TopK` o `Cast`, así como tensores de más de 4 dimensiones, que el delegado GPU rechaza. Las activaciones SiLU se han convertido en combinaciones de `LOGISTIC` y `MUL`.

El modelo fue entrenado por Megvii sobre el conjunto de datos COCO 2017 (train2017), un dataset académico público bajo licencia Creative Commons. Los pesos son la versión oficial de Megvii; solo se ha reautorizado el grafo de operaciones, sin modificar los pesos. No se ha utilizado ningún dato adicional o privado. El modelo emite únicamente identificadores de clase y coordenadas de caja, sin información personal.

## Capacidades

- Detección de objetos en 80 clases COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Salida cruda de 8400 anclas con 85 valores: 4 coordenadas de caja (cx, cy, w, h en unidades de celda de rejilla), 1 puntuación de objeto y 80 puntuaciones de clase, ya sigmoidizadas.
- Decodificación de cajas y NMS realizados en el host (Kotlin o Python), lo que mantiene el grafo libre de operaciones no soportadas por GPU.
- Ejecución completa en GPU con delegado LiteRT (CompiledModel) o TFLite OpenCL, sin caídas a CPU.
- Compatible con aceleración NPU (Hexagon) en dispositivos Snapdragon, con latencias notablemente menores que GPU.
- Preprocesamiento simple: entrada BGR de 0 a 255, sin normalización, con letterbox y relleno gris 114.

## Casos de uso

- Detección de objetos en tiempo real en aplicaciones móviles: el modelo puede integrarse en una app Android mediante la API `CompiledModel` de LiteRT, procesando cada frame en unos 11 ms en GPU (Galaxy S26) o 46 ms en un Pixel 8a, suficiente para vídeo en tiempo real.
- Vigilancia y seguridad perimetral: al ejecutarse en el dispositivo, permite detectar personas o vehículos sin depender de la nube, preservando la privacidad y reduciendo la latencia.
- Conteo y análisis de tráfico: con la salida de 8400 anclas y 80 clases, se pueden contar vehículos o peatones en imágenes de cámaras fijas, usando la decodificación en host para filtrar por clase y confianza.
- Automatización industrial: inspección visual de piezas o productos en líneas de montaje, donde la licencia Apache-2.0 facilita su uso en software propietario.
- Asistencia a personas con discapacidad visual: una app puede describir objetos del entorno en tiempo real usando la detección local, sin necesidad de conexión.
- Robótica educativa y de bajo coste: al pesar solo 18,2 MB y requerir poca memoria, puede ejecutarse en placas como Raspberry Pi con acelerador Coral o en smartphones antiguos, permitiendo prototipos de navegación autónoma.

## Benchmarks y rendimiento

El modelo alcanza un AP de 40,5 en COCO val2017 (referencia FP32). Las latencias medidas se resumen a continuación:

| Entorno | Backend | Latencia media |
|---|---|---|
| Pixel 8a (Tensor G3) | GPU (OpenCL, TFLite benchmark_model) | 46,0 ms |
| Pixel 8a (Tensor G3) | CPU (XNNPACK, 4 hilos) | 319,0 ms |
| Galaxy S26 (Snapdragon 8 Elite Gen 5) | NPU (Hexagon v81) | 2,91 ms (mediana) |
| Galaxy S26 (Snapdragon 8 Elite Gen 5) | GPU (Adreno) | 11,19 ms (mediana) |

Nota: las cifras de Pixel 8a se obtuvieron con la herramienta estándar `benchmark_model` de TFLite, mientras que las de Galaxy S26 se midieron con el runtime LiteRT `CompiledModel`. No son directamente comparables entre sí.

## Requisitos de hardware

- VRAM estimada: no aplica (modelo de visión para edge, no requiere VRAM dedicada; usa memoria compartida del dispositivo).
- GPU recomendadas: Adreno (Qualcomm), Mali (ARM), Tensor G3 (Google) o cualquier GPU compatible con OpenCL o Vulkan en dispositivos móviles.
- CPU: puede ejecutarse en CPU con XNNPACK, aunque con latencia mucho mayor (319 ms en Pixel 8a).
- NPU: compatible con Hexagon (Qualcomm) mediante LiteRT, con latencias de ~3 ms.
- Opciones de despliegue: LiteRT (CompiledModel), TFLite (Interpreter), benchmark_model para mediciones.
- Tamaño del archivo: 18,2 MB, lo que permite incluirlo en assets de aplicaciones sin problemas.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, YOLOX-S se posiciona como una alternativa Apache-2.0 a la familia YOLO (AGPL), con un tamaño y rendimiento similares a YOLOv8s. En el repositorio de LiteRT-Models se menciona YOLOX-Nano como una variante más ligera, pero no se aportan especificaciones numéricas. Para una comparación rigurosa, se necesitarían mediciones adicionales no disponibles en esta ficha.

## Limitaciones y advertencias

- El modelo fue entrenado únicamente con COCO 2017, por lo que su rendimiento puede degradarse en dominios muy diferentes (imágenes médicas, satelitales, etc.).
- La salida no incluye NMS; es responsabilidad del desarrollador implementar la decodificación y supresión de no máximos en el host, lo que añade complejidad al pipeline.
- El preprocesamiento exige letterbox con relleno gris 114 y conversión BGR; cualquier desviación puede afectar a la precisión.
- Las latencias reportadas dependen del runtime y del dispositivo; las cifras de Pixel 8a y Galaxy S26 no son comparables entre sí por usar herramientas distintas.
- Aunque la licencia Apache-2.0 permite uso comercial, los pesos derivan de COCO, que tiene sus propias condiciones de uso (Creative Commons) para el dataset, no para el modelo.
- No se han documentado sesgos específicos, pero al ser un detector de objetos, puede presentar errores en clases poco representadas o en condiciones de iluminación extremas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/yolox-s-litert
- Repositorio LiteRT (sucesor de TFLite): https://github.com/google-ai-edge/litert
- Muestras y script de conversión: https://github.com/google-ai-edge/litert-samples (compiled_model_api/object_detection)
- Repositorio con YOLOX-Nano para LiteRT: https://github.com/john-rocky/LiteRT-Models/tree/main/yolox
- Documentación de LiteRT: https://developers.google.com/edge/litert
