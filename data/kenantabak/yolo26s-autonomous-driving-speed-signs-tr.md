# kenantabak/yolo26s-autonomous-driving-speed-signs-tr

## Resumen

`yolo26s-autonomous-driving-speed-signs-tr` es un modelo de detección de objetos basado en la arquitectura `yolo26s` de Ultralytics, entrenado por Kenan Tabak y publicado en la plataforma EVREN (SSYZ). Resuelve una tarea concreta de visión por computador para conducción autónoma y sistemas ADAS: detectar en tiempo real señales de límite de velocidad (entre 20 y 120 km/h) y vehículos (coche, autobús, camión, motocicleta, furgoneta) junto con personas, en imágenes de cámaras de a bordo.

El modelo se ha ajustado sobre el dataset "Trafik Taşıtları ve Hız Sınırı Levhaları Tespiti (16 Clases)" (v1.0), compuesto por 2.519 imágenes y 7.099 anotaciones distribuidas en 16 clases. Con un peso de 19,4 MB, está pensado para inferencia en entornos con recursos limitados, como unidades de procesamiento embarcadas en vehículos. Declara un mAP@50 del 94,95 % y un F1 del 92,07 % en el conjunto de validación.

Su relevancia radica en el enfoque específico sobre señales de velocidad turcas, un dominio poco cubierto por los detectores genéricos, y en las decisiones de aumento de datos documentadas por el autor (desactivación del volteo horizontal para no invertir los dígitos de las señales). La licencia CC BY 4.0 facilita su reutilización, aunque el framework Ultralytics añade condiciones AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics, detector de objetos de una etapa) |
| Parametros totales | no disponible (peso del checkpoint: 19,4 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato nativo `.pt`; exportable a otros formatos vía Ultralytics) |
| Idiomas soportados | tr, en (etiquetas de clases y documentación) |
| Licencia | CC BY 4.0 (con condiciones AGPL-3.0 del framework Ultralytics) |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26s de Ultralytics, un detector de objetos de una sola etapa basado en red neuronal convolucional con extracción de características multiescala. El autor indica que la elección de la variante `s` (small) responde al tamaño del dataset y a la necesidad de un modelo ligero (19,4 MB) apto para inferencia en tiempo real. La entrada se configura a `imgsz=768`, un tamaño superior al habitual (640) porque el 40,3 % de las cajas corresponden a señales pequeñas y lejanas.

El entrenamiento se realizó durante 70 épocas con `batch=24`, `patience=22`, optimizador `auto` con `cos_lr=true`, y una política de aumento de datos muy restrictiva: `fliplr=0.0`, `flipud=0.0`, `degrees=0.0`, `erasing=0.0`, `hsv_h=0.01` y `hsv_s=0.4`. La desactivación del volteo horizontal es crítica porque los dígitos de las señales de velocidad (20–120) se leerían invertidos si se reflejaran. El coste de entrenamiento declarado es de 0,202 GPU-horas (2,02 CR). No se documenta el uso de RLHF, DPO ni técnicas de alineación, al no tratarse de un modelo generativo.

## Capacidades

- Detección de objetos en imágenes con 16 clases: diez señales de límite de velocidad (`speed_limit_20`, `30`, `40`, `50`, `60`, `70`, `80`, `100`, `120`), una señal de tráfico (`traffic_sign_90`) y cinco clases de actores viales (`car`, `bus`, `truck`, `motorbike`, `van`, `person`).
- Localización con cajas delimitadoras y puntuaciones de confianza por clase.
- Inferencia en tiempo real apta para vídeo de cámara de a bordo (diseño YOLO).
- Soporte de umbrales configurables de confianza (`conf`) e IoU (`iou`) en la API de Ultralytics.
- Capacidad multilingüe limitada a las etiquetas de clase en turco e inglés; no procesa texto ni lenguaje natural.
- No soporta tool calling, function calling, razonamiento multi-paso ni modos de pensamiento: es exclusivamente un detector visual.

## Casos de uso

- Asistencia a la conducción (ADAS): el modelo detecta señales de límite de velocidad en tiempo real desde la cámara frontal y puede alimentar un aviso al conductor o un limitador de velocidad adaptativo; su tamaño de 19,4 MB y su arquitectura YOLO permiten ejecución embebida.
- Sistemas de alerta de exceso de velocidad: integrado en un pipeline de vídeo, compara la velocidad detectada en la señal con la velocidad del vehículo (obtenida del CAN bus) para emitir alertas; las clases `speed_limit_*` alcanzan AP@50 superiores al 98 %.
- Inventario y auditoría de señalización vial: procesamiento por lotes de imágenes georreferenciadas de flotas de vehículos para mapear el estado y la ubicación de señales de velocidad en carretera.
- Detección de actores viales para planificación de trayectorias: las clases `car`, `bus`, `truck`, `person` y `motorbike` permiten a un módulo de percepción identificar obstáculos y peatones, aunque con menor precisión que las señales (AP@50 entre 81,9 % y 95,9 %).
- Análisis de tráfico urbano: conteo y clasificación de vehículos por tipo en grabaciones de cámaras fijas para estudios de movilidad; la clase `van` es la más débil (AP@50 84,49 %, precisión 62,59 %), por lo que conviene revisar sus detecciones.
- Prototipado rápido en investigación: al estar en formato `.pt` y ser compatible con la API de Ultralytics, se puede cargar con tres líneas de Python para experimentar con umbrales, tamaños de entrada o fine-tuning sobre nuevos datasets de señalización.
- Validación de datasets de señalización turca: servir como baseline para comparar anotaciones o entrenar modelos derivados en dominios similares.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de validación del dataset "Trafik Taşıtları ve Hız Sınırı Levhaları Tespiti (16 Clases)" (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 | 94,95 % |
| mAP@50-95 | 79,95 % |
| Precision | 92,43 % |
| Recall | 92,12 % |
| F1 | 92,07 % |
| Mejor época | 69 / 70 |

Rendimiento por clase (AP@50):

| Clase | AP@50 | Precision | Recall | F1 |
|---|---|---|---|---|
| `speed_limit_20` | 99,50 % | 98,38 % | 100,00 % | 99,18 % |
| `speed_limit_30` | 99,50 % | 98,78 % | 100,00 % | 99,38 % |
| `speed_limit_70` | 99,50 % | 98,39 % | 100,00 % | 99,19 % |
| `speed_limit_120` | 99,50 % | 99,73 % | 100,00 % | 99,87 % |
| `traffic_sign_90` | 99,50 % | 97,55 % | 100,00 % | 98,76 % |
| `speed_limit_80` | 99,44 % | 98,08 % | 98,50 % | 98,29 % |
| `speed_limit_50` | 99,29 % | 95,83 % | 97,06 % | 96,44 % |
| `speed_limit_40` | 99,17 % | 99,04 % | 98,08 % | 98,56 % |
| `speed_limit_60` | 98,98 % | 100,00 % | 98,39 % | 99,19 % |
| `speed_limit_100` | 98,53 % | 92,79 % | 96,92 % | 94,81 % |
| `bus` | 95,93 % | 87,87 % | 93,10 % | 90,41 % |
| `car` | 92,75 % | 87,27 % | 92,57 % | 89,84 % |
| `motorbike` | 86,80 % | 86,59 % | 79,31 % | 82,79 % |
| `person` | 85,35 % | 83,51 % | 80,68 % | 82,07 % |
| `van` | 84,49 % | 62,59 % | 78,16 % | 69,51 % |
| `truck` | 81,90 % | 88,13 % | 65,12 % | 74,90 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un checkpoint de 19,4 MB y entrada de 768 px, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo, es viable en RTX 3060/4060/4090, A100 o H100; la elección depende del throughput requerido.
- Cabe en GPU de consumo: sí, por el reducido tamaño del checkpoint y la arquitectura YOLO small.
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX, TensorRT, OpenVINO u otros formatos soportados por el framework; no se documenta integración con vLLM, llama.cpp ni Ollama (no aplicables a visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | mAP@50 | Licencia |
|---|---|---|---|---|---|
| `yolo26s-autonomous-driving-speed-signs-tr` | YOLO26s | no disponible (19,4 MB) | no aplica | 94,95 % (val. propia) | CC BY 4.0 + AGPL-3.0 |
| YOLO11s (Ultralytics, genérico) | YOLO11s | no disponible | no aplica | no disponible | AGPL-3.0 |
| YOLOv8s (Ultralytics, genérico) | YOLOv8s | no disponible | no aplica | no disponible | AGPL-3.0 |

No se dispone de resultados de benchmarks de los modelos alternativos sobre el mismo dataset, por lo que la comparación cuantitativa directa no está disponible. La ventaja del modelo evaluado es su ajuste específico al dominio de señalización turca y su política de aumento adaptada a dígitos de velocidad.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- El dataset es pequeño (2.519 imágenes), lo que limita la generalización a condiciones de iluminación, clima o geografía distintas de las del conjunto de entrenamiento.
- La clase `van` presenta una precisión baja (62,59 %) y `truck` un recall bajo (65,12 %), lo que puede generar falsos positivos y falsos negativos en esas categorías.
- El modelo está entrenado sobre señalización turca; su aplicación en otros países requiere validación y probablemente reentrenamiento.
- Riesgo de alucinación en el sentido de detecciones espurias con baja confianza; se recomienda ajustar el umbral `conf` según el caso de uso.
- Licencia dual: CC BY 4.0 para los pesos, pero el framework Ultralytics impone AGPL-3.0, lo que puede condicionar el uso comercial en productos derivados; conviene revisar las condiciones de Ultralytics antes de desplegar.
- No se documentan sesgos demográficos ni de otro tipo más allá de los derivados del dataset de entrenamiento.
- No es un modelo generativo: no admite instrucciones en lenguaje natural ni razonamiento; cualquier caso de uso debe plantearse como detección visual pura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-autonomous-driving-speed-signs-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/trafik-tasitlari-ve-hiz-siniri-levhalari-tespiti
- Dataset en EVREN: https://evren.ssyz.org.tr/datasets/u19979974710e/trafik-tasitlari-ve-hiz-siniri-levhalari-tespiti-16-sinif
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catálogo de datasets de visión turca: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Dataset original en Roboflow Universe: https://universe.roboflow.com/tfm-fsyyt/traffic-objects-nrll5
