# Nasochec/YOLO-1D_ECRv1

## Resumen

YOLO-1D_ECRv1 es un checkpoint preentrenado de YOLO-1D, un detector 1-D sin anclas de estilo YOLO desarrollado por Nasochec para la deteccion de elementos constructivos de via en defectogramas multicanal de corrientes inducidas (eddy current testing). El modelo recibe una senal cruda de 15 canales en `int16` (1 muestra = 1 mm de via, aproximadamente 50 000 muestras por registro) y devuelve los objetos detectados como intervalos `[begin, end]` con una clase y una puntuacion de confianza. Resuelve un problema de inspeccion no destructiva ferroviaria: identificar soldaduras, juntas y elementos de via a partir de senales electromagneticas en lugar de inspeccion visual.

Este checkpoint corresponde al modelo `large` de la serie de ablacion de aumentacion, entrenado con el conjunto completo de aumentacion de corrientes inducidas (configuracion A8, 50 epocas, semilla 0) y evaluado sobre el split de test publico de ECRv1. Con 14,5 M de parametros y 111 MB de pesos, alcanza un mAP@0.5:0.95 macro de 0,824 y un mAP@0.5 de 0,962 sobre 294 senales de test, lo que lo situa como una referencia practica para deteccion de eventos en series temporales de inspeccion.

Su relevancia actual radica en que aplica el paradigma de deteccion de objetos (backbone, FPN, cabeza sin anclas, DFL) a senales 1-D en lugar de imagenes, con un pipeline de preprocesado especifico de dominio que incluye supresion de interferencias mediante FastICA y sustitucion de canales muertos. La licencia Apache 2.0 y la publicacion del dataset y del codigo fuente facilitan su reproduccion y su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO-1D `large`: backbone 1-D estilo DarkNet (bloques CSP, SPP, atencion PSA), cuello FPN, cabeza sin anclas con Distribution Focal Loss (16 bins) |
| Parametros totales | 14,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 30 canales x 49 152 muestras (registro crudo de ~50 000 muestras) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en `best.pt`; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | en (etiquetas y documentacion; la tarea es de senal, no linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best.pt`, diccionario `torch.save` con claves `model`, `ema`, `epoch`; inferencia con pesos EMA) |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO adaptado a senales 1-D. El backbone es de estilo DarkNet con bloques CSP, Spatial Pyramid Pooling y atencion PSA; le sigue un cuello FPN y una cabeza sin anclas que usa Distribution Focal Loss con 16 bins para la regresion de los limites de los intervalos. Los strides de la cabeza son 32, 128 y 256 sobre la senal de entrada. La entrada tiene 30 canales x 49 152 muestras: los 15 canales crudos del sensor mas 15 canales con interferencia suprimida generados por la etapa de preprocesado, que incluye estandarizacion de referencia, deteccion y sustitucion de canales muertos, supresion de interferencias con FastICA, alineamiento en baja frecuencia por Fourier, normalizacion por umbral, padding a 50 000 y redimensionado a 49 152.

El entrenamiento se realizo sobre el dataset ECRv1 (2953 fragmentos de defectogramas de 89 pasadas de inspeccion anonimizadas, 15 canales, 11 646 elementos anotados) con su split fijo: 56 pasadas y 2099 senales en train (103,6 km, 8256 objetos), 25 pasadas y 560 senales en val (27,7 km, 2183 objetos) y 16 pasadas y 294 senales en test (14,4 km, 1207 objetos). Se usaron SGD con momentum 0,937, weight decay 3,9e-4, learning rate de 0,01 a 1e-4, 3 epocas de warm-up, batch de 50 y precision mixta durante 50 epocas (mejor epoca, la 48). Las perdidas ponderan box 10, cls 0,5 y DFL 3 con un asignador alineado a la tarea. La aumentacion se aplica con probabilidad 0,5 por muestra e incluye redimensionado y recorte aleatorios, ruido de espectro de fase, jitter, inversion de amplitud, escalado y enmascarado de canales, enmascarado temporal, mosaic, mix-up e interferencias sinusoidales y de onda cuadrada. El post-procesado aplica NMS 1-D con IoU 0,65 y reescala las cajas a la rejilla de muestras original; opcionalmente suprime detecciones de contador de ejes y cruce anidadas dentro de un cruce con umbral 0,8.

## Capacidades

- Deteccion de objetos en senales 1-D: devuelve intervalos `[begin, end]` con clase y confianza sobre defectogramas multicanal de corrientes inducidas.
- Clasificacion en 6 clases de elementos de via: soldadura por chispa a tope (`flashbutt`), soldadura aluminotermica (`aluminothermic`), junta atornillada (`rail end`), contador de ejes (`axle counter`), cruce (`crossing`) y soldadura por arco manual (`manual arc`).
- Procesamiento de senal multicanal: integra en su transformada el preprocesado de dominio (estandarizacion, sustitucion de canales muertos, FastICA, alineamiento por Fourier, normalizacion).
- Robustez frente a interferencias: se ha evaluado con interferencia sintetica de onda cuadrada anadida al split de test.
- Post-procesado de objetos anidados: opcion de suprimir detecciones de contador de ejes y cruce contenidas en un cruce.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente; es un detector de senal puro.
- Capacidades multilingues: no aplica; el modelo no procesa lenguaje.

## Casos de uso

- Inspeccion automatizada de via ferroviaria: el modelo procesa registros de corrientes inducidas de aproximadamente 50 000 muestras (unos 50 m de via por registro) y localiza soldaduras, juntas y cruces con precision a nivel de milimetro, lo que permite sustituir la revision manual de defectogramas en el analisis posterior a la pasada de inspeccion.
- Control de calidad de soldaduras: la deteccion de soldaduras por chispa a tope (AP@0.5:0.95 de 0,858) y aluminotermicas (0,911) permite inventariar y verificar la presencia de soldaduras en tramos nuevos o rehabilitados, comparando lo detectado con el registro documental de la via.
- Inventario de elementos de via: la clasificacion de juntas atornilladas, contadores de ejes y cruces facilita mantener un catalogo georreferenciado de infraestructura a partir de las pasadas de inspeccion, con las coordenadas derivadas del indice de muestra (1 muestra = 1 mm).
- Deteccion de eventos en series temporales industriales: la misma arquitectura sin anclas puede reutilizarse, reentrenando con otro dataset, para localizar eventos en otras senales 1-D multicanal (vibracion, ultrasonidos, sensores de proceso) donde se necesiten intervalos con clase y confianza.
- Analisis de robustez en entornos ruidosos: el checkpoint incluye metricas con interferencia de onda cuadrada anadida, lo que permite evaluar el comportamiento del detector en condiciones de ruido electromagnetico antes de desplegarlo en campo.
- Preetiquetado asistido para anotacion: las detecciones con confianza alta pueden usarse para preanotar nuevos defectogramas y reducir el coste de anotacion manual, dado el mAP@0.5 de 0,962 en el split de test.
- Integracion en pipelines de mantenimiento predictivo: el modelo devuelve intervalos y confianzas que pueden alimentar un sistema de alertas o un registro de activos, con el post-procesado de objetos anidados activable para evitar detecciones redundantes dentro de un cruce.

## Benchmarks y rendimiento

Evaluacion sobre el split de test de ECRv1 (294 senales, 1206 objetos), con AP estilo COCO a umbrales de IoU 0,50:0,05:0,95 e interpolacion PR de 101 puntos, promediado macro sobre las 6 clases. Precision y recall a umbral de confianza 0,5 e IoU >= 0,5, con NMS simple.

| Clase | Objetos | AP@0.5:0.95 | AP@50 | Precision | Recall |
|---|---:|---:|---:|---:|---:|
| flashbutt | 481 | 0,858 | 0,985 | 0,947 | 0,958 |
| aluminothermic | 543 | 0,911 | 0,994 | 0,969 | 0,987 |
| rail end (bolted joint) | 43 | 0,906 | 0,973 | 0,915 | 1,000 |
| axle counter | 58 | 0,603 | 0,977 | 0,964 | 0,931 |
| crossing | 39 | 0,852 | 0,924 | 0,655 | 0,923 |
| manual arc | 42 | 0,815 | 0,917 | 0,921 | 0,833 |
| **Media macro** | 1206 | **0,824** | **0,962** | 0,895 | 0,939 |

El checkpoint tambien incluye `metrics_pp.json` con las metricas tras el post-procesado de objetos anidados y `noisy_test.json` con las metricas sobre el test con interferencia sintetica de onda cuadrada; los valores concretos de ambos ficheros no se detallan en la informacion disponible. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 14,5 M de parametros y 111 MB de pesos, el checkpoint cabe holgadamente en cualquier GPU consumer, pero el consumo real depende de la longitud de entrada (30 x 49 152 muestras) y del batch.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano del modelo, una RTX 4090, A100 o H100 son mas que suficientes, y el modelo probablemente se ejecuta en GPU consumer de gama media o incluso en CPU para inferencia por lotes.
- Cabe en GPU consumer: si, por el tamano del checkpoint (111 MB); la viabilidad practica depende de la memoria necesaria para las activaciones con entradas de 49 152 muestras.
- Opciones de despliegue: el autor solo documenta inferencia con PyTorch cargando `best.pt` y `args.yaml` desde el repositorio de codigo (https://github.com/BystrovGladkov/YOLO_1d, rama `EKG`); no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con otros detectores 1-D de defectogramas de corrientes inducidas en la informacion proporcionada. Como referencia estructural, se puede comparar con las familias YOLO 2-D originales, de las que hereda el diseno (backbone CSP, FPN, cabeza sin anclas, DFL), pero no se dispone de metricas equivalentes sobre ECRv1 para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto / entrada | mAP@0.5:0.95 en ECRv1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO-1D_ECRv1 (este) | 14,5 M | 30 x 49 152 muestras | 0,824 | Apache 2.0 | Hugging Face |
| Alternativas 1-D comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy especifico: el modelo esta entrenado exclusivamente sobre defectogramas de corrientes inducidas de via ferroviaria; no es un detector de objetos generico ni procesa imagenes, texto ni audio.
- Clases desbalanceadas: `axle counter` (58 objetos en test) y `crossing` (39 objetos) tienen pocas instancias, y su AP@0.5:0.95 es notablemente inferior (0,603 y 0,852) a la de las soldaduras; la precision de `crossing` a umbral 0,5 es solo 0,655.
- Dependencia del preprocesado: el modelo requiere el pipeline completo de transformacion (FastICA, sustitucion de canales muertos, alineamiento por Fourier, padding y resize) definido en `args.yaml`; usarlo con una entrada procesada de otra forma degrada las detecciones.
- Requiere `args.yaml` para construir la arquitectura antes de cargar `best.pt`; no es un checkpoint autocontenido en ese sentido.
- Riesgo de falsos positivos y negativos en senales con ruido no representado en el entrenamiento; el autor solo documenta una prueba de robustez con interferencia de onda cuadrada sintetica, no con ruido real de campo.
- Limitacion de idioma: la documentacion y las etiquetas estan en ingles; no hay soporte multilinguue porque el modelo no procesa lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion (ver `NOTICE.txt`); no se documentan restricciones adicionales.
- Sin garantias de produccion documentadas: no se publican latencias, throughput, ni validacion en despliegues reales; se recomienda validar sobre datos propios antes de integrarlo en un sistema critico de mantenimiento ferroviario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso independiente ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nasochec/YOLO-1D_ECRv1
- Dataset ECRv1: https://huggingface.co/datasets/Nasochec/ECRv1
- Codigo fuente (rama `EKG`): https://github.com/BystrovGladkov/YOLO_1d
- Paper: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
