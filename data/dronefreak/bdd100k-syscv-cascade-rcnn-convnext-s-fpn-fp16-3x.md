# dronefreak/bdd100k-syscv-cascade-rcnn-convnext-s-fpn-fp16-3x

## Resumen

Cascade R-CNN ConvNeXt-S-FPN FP16 3x es un detector de objetos de dos etapas entrenado sobre el conjunto de datos BDD100K para escenas de conduccion autonoma. Lo publica el usuario dronefreak como espejo de un modelo del zoo oficial de SysCV (ETH Zurich), cuyo host `dl.cv.ethz.ch` esta fuera de servicio; los pesos se recuperaron de una captura de Wayback Machine del 19 de febrero de 2025 y se reempaquetaron con un entorno fijado y un script de inferencia.

El modelo combina el detector Cascade R-CNN con una FPN y un backbone ConvNeXt. Aunque SysCV lo etiqueta como ConvNeXt-S, la configuracion usa `arch='tiny'` y el checkpoint contiene realmente un backbone ConvNeXt-T (bloques 3, 3, 9, 3, 96 canales de stem), con 72.878.556 parametros, coherente con los modelos Cascade ConvNeXt-T del mismo zoo. Es un checkpoint distinto del Cascade ConvNeXt-T 3x de SysCV (MD5 distinto); la unica diferencia de configuracion es el decaimiento de learning rate por capas (`num_layers` 12 en lugar de 6).

Su relevancia es practica: recupera y hace reproducible un peso de investigacion que ya no estaba accesible desde su origen, con verificacion de MD5, predicciones de validacion archivadas y un script que procesa imagenes, video o webcam. Esta pensado para investigacion en deteccion de trafico, no para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN con FPN y backbone ConvNeXt-T (etiquetado como ConvNeXt-S por SysCV) |
| Parametros totales | 72.878.556 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 1280 x 720) |
| Tipos de cuantizacion | no disponible; pesos en FP16 y safetensors |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | bdd100k (uso educativo, investigacion y sin animo de lucro); config de SysCV Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original |
| Libreria | mmdetection 2.28.2 (mmcv-full 1.7.2, mmcls 0.25.0, torch 2.0.1, Python 3.10) |
| Tarea | object-detection (10 clases de BDD100K) |
| Resolucion de entrada | 1280 x 720 nativa, RGB, media y desviacion tipica de ImageNet |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

Cascade R-CNN es un detector de dos etapas con una cascada de cabezas de clasificacion y regresion donde cada etapa se entrena con un umbral de IoU progresivamente mayor, lo que mejora la calidad de las cajas frente a un Faster R-CNN simple. Sobre el backbone ConvNeXt-T se aplica una FPN que alimenta las cabezas en cascada. El backbone se inicializa con pesos de ImageNet (`convnext-tiny_3rdparty_32xb128-noema_in1k`).

El entrenamiento usa el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con AdamW a learning rate 1e-4, weight decay 0.05, decaimiento en las epocas 27 y 33, batch 32 (8 GPU x 4 imagenes), entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720) y precision mixta FP16. En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen; el autor reporta 2,6 s por imagen en 8 hilos de CPU.

La verificacion del espejo es parcial: el MD5 del checkpoint (`53c23041305de0a8d4a582a65fa3cd6b`) coincide con el de SysCV y todas las claves cargan en la configuracion original, pero sobre 20 imagenes aleatorias de validacion solo 87 de las 695 cajas publicadas son identicas en esta copia, aunque 694 coinciden con IoU >= 0.5 y la diferencia maxima de score es 0.0179. El autor desconoce la causa y no la investigo; el entorno CUDA no se ha probado.

## Capacidades

- Deteccion de objetos en imagenes y video de escenas de conduccion, con 10 clases: peatones, ciclistas, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico.
- Salida en formato BDD100K mediante la opcion `--json`, ademas de visualizacion sobre imagen.
- Procesamiento de imagen suelta, carpeta de imagenes, fichero de video y webcam en directo (`infer.py 0 --show`).
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de fotogramas (`--max-frames`).
- Rendimiento razonable en escenas nocturnas y diurnas; el autor incluye un video de demostracion con clips de dia y de noche.
- No soporta tool calling, agentes, razonamiento multi-paso, texto ni audio: es exclusivamente un detector visual.

## Casos de uso

- Investigacion en deteccion de trafico: punto de partida reproducible para comparar variantes de backbone o de cabezas sobre BDD100K, con configuracion y predicciones de referencia archivadas.
- Analisis offline de video de dashcam: procesar un `.mov` con `infer.py` para extraer cajas en formato BDD100K y estudiar densidad de trafico o presencia de peatones por fotograma.
- Reproduccion de resultados academicos: el entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) permite volver a ejecutar la inferencia sin resolver dependencias rotas.
- Docencia en vision por computador: ejemplo completo de detector de dos etapas con FPN y backbone moderno, con pesos verificados por MD5.
- Prototipado de sistemas ADAS en laboratorio: evaluar umbrales de confianza y comportamiento de la cascada en condiciones diurnas y nocturnas antes de disenar un pipeline propio.
- Generacion de pseudoetiquetas para otros conjuntos de imagenes de carretera, usando la salida JSON como punto de partida para anotacion asistida.
- Pruebas de integracion de mmdetection 2.x en entornos legacy: el repo sirve como referencia de una pila de dependencias que aun funciona con configuraciones antiguas.

## Benchmarks y rendimiento

Resultados declarados por SysCV (Box AP en formato COCO, %, sobre BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 36,1 | 61,0 | 35,8 | 17,4 | 40,9 | 59,9 |
| test | 35,4 | 58,9 | 36,4 | 18,2 | 42,4 | 53,7 |

AP por clase en validacion (%):

| Clase | AP |
|---|---|
| pedestrian | 39,8 |
| rider | 30,4 |
| car | 54,1 |
| truck | 49,1 |
| bus | 52,3 |
| train | 7,3 |
| motorcycle | 29,2 |
| bicycle | 30,0 |
| traffic light | 26,8 |
| traffic sign | 42,1 |

El valor de 36,11 de mAP en validacion figura en el model-index como no verificado (`verified: false`). No se han publicado en la informacion disponible resultados de otros benchmarks ni comparaciones directas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 72,9 M de parametros en FP16 y entradas de 1280 x 720, el peso de los pesos ronda los 150 MB y el consumo dominante es el de las activaciones a esa resolucion.
- GPU recomendadas: no especificadas por el autor. El entorno incluye requisitos para CUDA 11.8 (`env/requirements-cu118.txt`) y una variante solo CPU (`env/requirements-cpu.txt`).
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque el autor no publica medidas de VRAM ni pruebas en tarjetas concretas.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2; el script `infer.py` cubre imagen, video y webcam. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 2,6 s por imagen en 8 hilos de CPU, segun el autor. No hay datos de throughput en GPU ni el entorno CUDA ha sido probado.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Cascade R-CNN ConvNeXt-T, 3x) | 72,9 M | 1280 x 720 | 36,1 | bdd100k (investigacion) | Hugging Face, espejo verificado por MD5 |
| Cascade ConvNeXt-T 3x de SysCV | mismo orden (no disponible el dato exacto) | 1280 x 720 | no disponible en esta ficha | bdd100k | Solo via zoo de SysCV; host original caido |
| Otras variantes del zoo SysCV BDD100K | no disponible | no disponible | no disponible | bdd100k | Parcial, dependiente de espejos |

La comparacion con alternativas de otros autores no esta disponible en la informacion proporcionada; no se aportan numeros que no consten en la model card.

## Limitaciones y advertencias

- El nombre del modelo induce a error: se etiqueta como ConvNeXt-S pero el backbone es ConvNeXt-T. Conviene no asumir las cifras de un ConvNeXt-S real.
- La verificacion del espejo es aproximada: solo 87 de 695 cajas coinciden exactamente con las publicadas por SysCV, aunque el 99,9 % coincide con IoU >= 0.5. La causa no se investigo.
- El entorno CUDA no ha sido probado por el autor; solo se valido la inferencia en CPU.
- Rendimiento muy bajo en la clase `train` (AP 7,3) y flojo en objetos pequenos (APs 17,4), lo que limita su uso en escenas con objetos lejanos o poco frecuentes.
- Licencia BDD100K: uso educativo, de investigacion y sin animo de lucro. El uso comercial no esta permitido sin autorizacion adicional.
- Riesgo de falsos positivos y negativos con umbrales bajos de score; el umbral por defecto del script (0,3) es mas alto que el usado en evaluacion (0,05), lo que cambia el numero de cajas devueltas.
- Entrenado exclusivamente con datos de BDD100K, con la distribucion geografica y de condiciones de ese conjunto; puede degradarse en otros paises, climas o camaras.
- No es un modelo de lenguaje: no procesa texto, no admite instrucciones en lenguaje natural y no tiene capacidades de agente.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-convnext-s-fpn-fp16-3x
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-convnext-s-fpn-fp16-3x/blob/main/LICENSE.txt
- Zoo de modelos BDD100K de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/cascade_rcnn_convnext-s_fpn_fp16_3x_det_bdd100k.py
- Paper de ConvNeXt, A ConvNet for the 2020s (CVPR 2022): https://arxiv.org/abs/2201.03545
- Pesos de inicializacion ConvNeXt-Tiny en ImageNet: https://download.openmmlab.com/mmclassification/v0/convnext/downstream/convnext-tiny_3rdparty_32xb128-noema_in1k_20220301-795e9634.pth
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
