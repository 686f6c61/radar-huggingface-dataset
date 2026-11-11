# Intel/crowd-analysis

## Resumen

Crowd Analysis es un paquete de modelos de detección de objetos publicado por Intel en Hugging Face, orientado a un caso de uso concreto de analítica de metro: estimar la densidad de personas y los patrones de movimiento en flujos de vídeo. No es un modelo de lenguaje ni un transformer generativo, sino un detector de personas (clase `person`, id 0 de COCO) exportado a OpenVINO IR y filtrado en tiempo de ejecución para esa única clase. El paquete se construye sobre YOLO26 de Ultralytics como opción por defecto, con DETR (detr-resnet-50) como alternativa transformer sin NMS.

El sistema detecta personas fotograma a fotograma, emite un recuento por fotograma con un nivel de densidad discreto (LOW / MEDIUM / HIGH, con umbrales por defecto de menos de 10, entre 10 y 25, y más de 25 personas) y realiza seguimiento entre fotogramas para estimar la dirección dominante del flujo de la multitud. Está pensado para despliegues en el borde (CPU, GPU y NPU de Intel) con Intel DLStreamer y OpenVINO, y su relevancia actual radica en que ofrece una tubería completa de analítica de multitudes con licencia MIT sobre el contenedor, aunque las licencias de los pesos base difieren (AGPL-3.0 para YOLO26, Apache-2.0 para DETR).

El repositorio es pequeño (0,1 GB) y tiene un uso muy bajo en la plataforma (20 descargas y 1 like en el momento de la consulta). La pila objetivo es explícitamente de desarrollo: DLStreamer 2026.3.0 RC1 con OpenVINO 2026.5.0.0.dev20261030, no una versión estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos: YOLO26 (Ultralytics, por defecto) o DETR con backbone ResNet-50 (alternativa) |
| Parametros totales | No disponible (depende de la variante: yolo26n, yolo26s, yolo26m, yolo26l, o detr-resnet-50) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto); entrada de imagen 640 x 640 para YOLO26 y 800 x 800 para DETR |
| Tipos de cuantizacion | FP32, FP16, INT8 (mixed-precision mediante NNCF post-training quantization) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto, solo imágenes) |
| Licencia | MIT para el repositorio; pesos base: AGPL-3.0 (YOLO26) y Apache-2.0 (DETR) |
| Formato de pesos | OpenVINO IR (exportado desde PyTorch/Ultralytics y Hugging Face Transformers) |

## Arquitectura y entrenamiento

El paquete no entrena un modelo propio: envuelve detectores preentrenados en COCO y los exporta a OpenVINO IR. La variante por defecto es YOLO26, un detector en tiempo real de la familia Ultralytics disponible en cuatro tamaños (n, s, m, l), con entrada de 640 x 640 y salida de forma `[1, 300, 6]`. La alternativa es DETR (detr-resnet-50), un detector transformer sin supresión de no máximos (NMS) con entrada de 800 x 800 y salida `[1, 100, 6]`; el script de exportación incrusta en el IR la normalización, la decodificación de cajas y el remapeo de clases de DETR, de modo que ambos modelos producen el mismo formato de salida y los mismos ids de clase.

El pipeline de exportación descarga los pesos originales de PyTorch (Ultralytics para YOLO26, Transformers para DETR), los convierte a OpenVINO IR en FP32 o FP16 y, opcionalmente, aplica cuantización post-entrenamiento INT8 con NNCF. En tiempo de ejecución se filtra la clase `person` y se aplica seguimiento entre fotogramas para calcular el flujo dominante. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de COCO, ni si hubo ajuste fino adicional, RLHF o DPO (no aplicables a un detector).

## Capacidades

- Detección de personas fotograma a fotograma sobre flujos de vídeo, restringida a la clase `person` de COCO.
- Recuento de personas por fotograma con clasificación de densidad en tres niveles (LOW, MEDIUM, HIGH) según umbrales configurables.
- Seguimiento de cada persona entre fotogramas para estimar la dirección dominante del flujo de la multitud.
- Ejecución en CPU, GPU y NPU de Intel mediante OpenVINO, con precisión FP32, FP16 e INT8.
- Integración con Intel DLStreamer para tuberías de vídeo en el borde.
- Intercambiabilidad de detector (YOLO26 o DETR) sin cambiar el código de las muestras, seleccionando el modelo con una constante `MODEL`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking: es un detector de objetos especializado.

## Casos de uso

- Densidad en andenes y vestíbulos de metro: el modelo cuenta personas por fotograma y asigna un nivel LOW/MEDIUM/HIGH, lo que permite avisar de acumulaciones antes de que se vuelvan inseguras; los umbrales se ajustan al campo de visión de cada estación.
- Análisis de flujo peatonal en corredores, tornos y cruces: el seguimiento entre fotogramas estima la dirección dominante del movimiento, útil para detectar contraflujos o cuellos de botella.
- Ocupación de recintos públicos: estadios, intercambiadores de transporte y entradas de eventos pueden monitorizar la densidad con las mismas variantes del modelo.
- Conciencia situacional para operadores: la combinación de nivel de densidad y flujo alimenta paneles de decisión en instalaciones de transporte y recintos públicos.
- Despliegue en el borde con alta tasa de fotogramas: las variantes pequeñas (yolo26n, yolo26s) están recomendadas para despliegues de alto FPS en dispositivos Intel, incluidos NPU.
- Procesamiento de vídeo con DLStreamer: integración en tuberías GStreamer de Intel para ingesta, inferencia y metadatos en entornos de videovigilancia existentes.
- Recuento con mayor recall en multitudes densas: las variantes mayores (yolo26m, yolo26l) mejoran la detección en aglomeraciones a costa de throughput.
- Sustitución por un detector con licencia permisiva: cuando se prefiere un transformer con licencia Apache-2.0, DETR ofrece el mismo formato de salida a menor tasa de fotogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validación de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero esos valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- Hardware soportado: CPU, GPU y NPU de Intel mediante OpenVINO.
- VRAM estimada: no disponible; depende de la variante (yolo26n a yolo26l o detr-resnet-50) y de la precisión (FP32, FP16, INT8).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el stack está orientado a aceleradores Intel (iGPU, NPU) más que a GPU discretas de NVIDIA.
- Cabe en hardware de consumo: sí, previsiblemente en equipos con CPU Intel modernas e iGPU/NPU, dado el enfoque edge y la disponibilidad de INT8; no se detallan modelos concretos.
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer 2026.3.0 RC1, exportación vía Ultralytics o Transformers y cuantización con NNCF. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; la model card indica que las variantes n y s son las recomendadas para alto FPS y que DETR es más pesado y corre a menor tasa de fotogramas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Salida | Licencia de pesos | Notas |
|---|---|---|---|---|---|
| YOLO26 (variantes n/s/m/l) | CNN detector en tiempo real (Ultralytics) | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Máximo throughput en el borde; mayor recall con variantes grandes |
| DETR (detr-resnet-50) | Transformer sin NMS (Facebook) | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Más pesado y menor FPS; licencia permisiva |
| Crowd Analysis (este paquete) | Envoltorio OpenVINO sobre YOLO26 o DETR | Según detector base | Recuento, densidad y flujo | MIT (repo) | Añade seguimiento, niveles de densidad y ejemplos DLStreamer |

No se dispone de datos de benchmarks para comparar el rendimiento numérico con alternativas.

## Limitaciones y advertencias

- Solo detecta la clase `person`; no reconoce otros objetos ni proporciona identificación individual.
- Los niveles de densidad dependen de umbrales fijos por defecto (10 y 25 personas) que deben recalibrarse según el campo de visión y la ocupación esperada del sitio.
- El rendimiento en multitudes densas puede degradarse con las variantes pequeñas; la model card recomienda variantes mayores para mejorar el recall en aglomeraciones.
- La licencia MIT del repositorio no cubre necesariamente los pesos base: YOLO26 se distribuye bajo AGPL-3.0, lo que impone obligaciones de copyleft para uso en red y comercial; DETR es Apache-2.0 y evita ese problema a costa de rendimiento.
- La pila objetivo es de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030), no una versión estable; no se recomienda para producción sin validación previa.
- El modelo declara únicamente el idioma `en`, aunque al no procesar texto esta etiqueta tiene relevancia limitada.
- Riesgo de sesgos y de falsos negativos/positivos inherente a los detectores entrenados en COCO, especialmente con oclusiones, iluminación adversa o ángulos de cámara no habituales; no se documentan evaluaciones de sesgo en la información disponible.
- Uso en espacios públicos: la captación y el análisis de personas están sujetos a normativa de protección de datos (RGPD y normativa equivalente); el paquete no incluye mecanismos de anonimización.
- El repositorio tiene un uso muy bajo en la plataforma (20 descargas, 1 like), lo que limita la evidencia comunitaria sobre su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/crowd-analysis
- YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR (facebook/detr-resnet-50): https://huggingface.co/facebook/detr-resnet-50
- Instalación de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalación de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Vídeo de muestra (Pexels): https://www.pexels.com/video/pedestrians-crossing-the-street-27700659/
- Paper de DETR (referencia arXiv citada en los tags): https://arxiv.org/abs/2005.12872
