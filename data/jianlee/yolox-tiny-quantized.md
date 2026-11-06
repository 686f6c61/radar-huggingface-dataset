# jianlee/yolox-tiny-quantized

## Resumen

YOLOX-Tiny quantized es una familia de variantes cuantizadas del detector de objetos YOLOX-Tiny de Megvii, publicada por el usuario jianlee. El modelo original es un detector anchor-free de la familia YOLOX, entrenado sobre COCO para 80 clases, con resolución de entrada de 416x416 píxeles. Esta publicación no entrena un detector nuevo, sino que exporta los pesos oficiales a ONNX y genera versiones INT8 mediante cuantización post-entrenamiento (PTQ) y entrenamiento con cuantización consciente (QAT), con el objetivo de reducir el coste computacional en CPU sin degradar de forma significativa la precisión.

El interés práctico está en el binomio tamaño/latencia: el modelo FP32 ocupa 20,3 MB y tarda 115,6 ms por inferencia en un hilo de CPU, mientras que la variante PTQ INT8 baja a 5,6 MB y 45,4 ms, con una pérdida de mAP50-95 de en torno a 0,7 puntos (33,47 a 32,75). Es, por tanto, una opción relevante para despliegues de detección en tiempo real sobre hardware sin GPU, edge devices y pipelines embebidos donde el presupuesto de memoria y el consumo son críticos.

La salida del grafo es un tensor `(1, 3549, 85)` con la decodificación de cajas incluida dentro del modelo; la supresión de no máximos (NMS) se ejecuta fuera, en el código del repositorio del autor (`rtod.detect.postprocess`). La entrada es una imagen BGR con letterbox a 416x416, float32 en rango 0-255 y formato NCHW. La licencia es Apache-2.0, heredada de los pesos originales de YOLOX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-Tiny (detector anchor-free, CNN, con decodificacion de cajas en el grafo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 416x416) |
| Tipos de cuantizacion | FP32, INT8 PTQ estatica (ONNX Runtime, 32 imagenes de calibracion), INT8 QAT (grafo fake-quant como QDQ) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32, PTQ INT8, QAT INT8) y checkpoint PyTorch `.pt` para QAT |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOX-Tiny, un detector de objetos de una etapa con diseño anchor-free y cabecera desacoplada (decoupled head), tal como se define en el repositorio oficial de Megvii. El modelo parte del checkpoint oficial YOLOX-Tiny entrenado sobre COCO (80 clases) y se exporta a ONNX con la decodificación de cajas integrada en el grafo, de modo que la salida ya contiene las predicciones por celda y la NMS queda fuera del modelo.

Sobre esa base se generan dos variantes cuantizadas. La PTQ aplica cuantización estática INT8 con ONNX Runtime usando 32 imágenes de calibración. La QAT realiza un ajuste fino con cuantización simulada (fake-quant) y un learning rate de 2e-6, produciendo un grafo QDQ y un checkpoint con pesos plegados y rangos de observadores. Los datos de calibración y ajuste provienen de COCO train2017 (anotaciones CC BY 4.0, imágenes bajo sus licencias de Flickr). No se especifica el número de tokens ni composición de dataset más allá de COCO, ni se documenta uso de RLHF/DPO, por tratarse de un modelo de visión.

## Capacidades

- Detección de objetos en 80 clases de COCO (personas, vehículos, animales, objetos cotidianos).
- Salida con decodificación de cajas integrada en el grafo ONNX: tensor `(1, 3549, 85)`.
- Inferencia sobre CPU con latencias medidas en un hilo (45,4 ms para PTQ INT8, 115,6 ms para FP32).
- Cuantización INT8 con dos estrategias (PTQ y QAT) para distintos compromisos de tamaño y latencia.
- Entrada estandarizada: imagen BGR con letterbox a 416x416, float32, rango 0-255, NCHW.
- NMS externa al modelo, lo que permite ajustar el umbral y la implementación según el despliegue.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Detección en tiempo real en dispositivos edge: la variante PTQ INT8 (5,6 MB, 45,4 ms en un hilo de CPU) permite procesar vídeo a varias FPS en placas tipo Raspberry Pi o mini-PC sin GPU, integrando el modelo en un pipeline con ONNX Runtime.
- Vigilancia y analítica de vídeo en servidores sin GPU: al ejecutarse en CPU con latencias de decenas de milisegundos, se pueden desplegar múltiples instancias por núcleo para procesar cámaras concurrentes.
- Automatización industrial y control de calidad: detección de defectos o presencia de piezas en líneas de producción, donde el bajo tamaño del modelo facilita su inclusión en controladores embebidos.
- Procesamiento por lotes de imágenes en pipelines de datos: la variante FP32 (20,3 MB) sirve como referencia de precisión para etiquetado automático o pre-anotación de datasets.
- Aplicaciones móviles y de escritorio: el modelo ONNX puede integrarse en apps con ONNX Runtime Mobile, con la variante INT8 para minimizar el tamaño del binario y el consumo.
- Investigación en cuantización: el par PTQ/QAT con métricas publicadas (mAP y latencia) sirve como caso de estudio reproducible para comparar estrategias de cuantización en detectores ligeros.
- Sistemas de conteo y seguimiento: combinado con un tracker externo, el detector aporta las cajas por fotograma para conteo de personas o vehículos en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados en la model card. `val_test` es la mitad reservada de COCO val2017 (2.476 imágenes); el símbolo ± es el error estándar jackknife. Latencia medida con ONNX Runtime en un hilo de un Intel i7-13620H, en una misma sesión.

| Modelo | Tamano | mAP50-95 (COCO val_test) | Latencia CPU, 1 hilo |
|---|---|---|---|
| `yolox_tiny_fp32.onnx` | 20,3 MB | 33,47 ± 0,49 | 115,6 ms |
| `yolox_tiny_ptq_int8_calib32.onnx` | 5,6 MB | 32,75 ± 0,45 | 45,4 ms |
| `yolox_tiny_qat_int8_pathA.onnx` | 20,5 MB | 32,81 ± 0,52 | 61,2 ms |
| `yolox_tiny_qat_lr2e-6.pt` | 21 MB | no disponible | no disponible |

El autor indica que diferencias inferiores a 1 punto de mAP están dentro del ruido y que, en este caso, la QAT no superó a una PTQ bien calibrada.

## Requisitos de hardware

- VRAM estimada: el modelo es de CPU-first; en GPU el consumo de memoria es mínimo (decenas de MB), pero no se publican cifras de VRAM.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) puede ejecutar el grafo, aunque el foco del autor es CPU.
- Cabe en GPU consumer: sí, con holgura; el modelo FP32 ocupa 20,3 MB y el INT8 5,6 MB, por lo que cabe en cualquier GPU con al menos 1 GB de memoria.
- Despliegue: ONNX Runtime (principal soportado), con posibilidad de usar TensorRT o OpenVINO como backends alternativos; no se mencionan vLLM, llama.cpp ni Ollama (no aplican a un detector de visión).
- Latencia y throughput: 115,6 ms (FP32), 45,4 ms (PTQ INT8) y 61,2 ms (QAT INT8) por inferencia en un hilo de Intel i7-13620H; el throughput escala con el número de hilos y de instancias.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP50-95 COCO | Licencia | Formato |
|---|---|---|---|---|---|
| YOLOX-Tiny quantized (PTQ INT8) | no disponible | 416x416 | 32,75 | Apache-2.0 | ONNX |
| YOLOX-Tiny (FP32 oficial) | no disponible | 416x416 | 33,47 (segun esta publicacion) | Apache-2.0 | PyTorch / ONNX |
| YOLOv8n (Ultralytics) | no disponible en la informacion | 640x640 | no disponible en la informacion | AGPL-3.0 | PyTorch / ONNX |
| YOLOv5n (Ultralytics) | no disponible en la informacion | 640x640 | no disponible en la informacion | GPL-3.0 | PyTorch / ONNX |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada; la comparación se limita a licencia, formato y resolución de entrada. La ventaja diferencial de esta publicación es la disponibilidad de variantes INT8 verificadas con métricas y latencias reproducibles.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; no cubre clases personalizadas sin reentrenamiento.
- La NMS es externa al modelo: es necesario implementarla en el pipeline de despliegue.
- La entrada debe preprocesarse exactamente como se especifica (letterbox 416x416, BGR, float32 0-255, NCHW); desviaciones degradan la precisión.
- La QAT no superó a la PTQ en este caso, por lo que la variante QAT no aporta ventaja de precisión ni de latencia.
- Diferencias de mAP inferiores a 1 punto se consideran ruido; no debe interpretarse la PTQ como una pérdida real de precisión.
- Las imágenes de COCO tienen licencias de Flickr individuales; el uso comercial de derivados debe revisarse aunque los pesos sean Apache-2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- Riesgo de sesgos heredados de COCO (desbalance de clases, contextos geográficos y demográficos del dataset original).
- No hay información sobre robustez ante dominios distintos de COCO (iluminación, cámaras, resoluciones), por lo que se recomienda validación propia antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/jianlee/yolox-tiny-quantized
- Repositorio del autor (código, benchmarks y write-up): https://github.com/leejianrong/real-time-object-detection
- Documento de resultados del autor: `docs/RESULTS.md` en el repositorio anterior
- YOLOX oficial (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Pesos base: https://huggingface.co/Megvii-BaseDetection/YOLOX
- Dataset COCO: https://cocodataset.org
- ONNX Runtime: https://onnxruntime.ai
