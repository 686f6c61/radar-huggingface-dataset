# open-edge-platform/running-detection

## Resumen

Running Detection es un caso de uso de analitica para entornos de metro (Metro Analytics) publicado por open-edge-platform (Intel) en Hugging Face. No se trata de un modelo de lenguaje, sino de un pipeline de deteccion de objetos, seguimiento (tracking) y estimacion de velocidad que identifica a personas que corren o se desplazan por encima de un umbral de velocidad configurable. El sistema se construye sobre YOLO26 (Ultralytics) como detector por defecto, con DETR (facebook/detr-resnet-50) como alternativa, y utiliza el tracker de filtro de Kalman `gvatrack` de DLStreamer para asignar identificadores persistentes a cada persona detectada.

El pipeline detecta la clase `person` (clase 0 de COCO), estima la velocidad de cada trayectoria a partir del desplazamiento del centro del bounding box entre fotogramas y marca a una persona como "corriendo" cuando la velocidad se mantiene por encima del umbral durante una ventana corta y sostenida, lo que suprime el ruido de un solo fotograma. Esta orientado a despliegue en el edge con OpenVINO sobre CPU, GPU y NPU de Intel, con precisiones FP32, FP16 e INT8.

Su relevancia actual radica en que ejemplifica el patron de despliegue de vision artificial en infraestructura Intel para analitica de seguridad y flujo de personas en estaciones, con variantes de modelo que permiten ajustar el equilibrio entre throughput y recall segun la densidad de escena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO26 (Ultralytics, por defecto) o DETR (facebook/detr-resnet-50, alternativa) + tracker `gvatrack` de DLStreamer (filtro de Kalman) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16, INT8 (mixed-precision, via NNCF post-training quantization) |
| Idiomas soportados | en (etiquetas de la model card) |
| Licencia | MIT (repo); YOLO26 AGPL-3.0, DETR Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); pesos fuente PyTorch |

Otros datos tecnicos: entrada de 640 x 640 para YOLO26 y 800 x 800 para DETR; salida `[1, 300, 6]` para YOLO26 y `[1, 100, 6]` para DETR; clase detectada `person` (COCO clase 0); motor de inferencia OpenVINO; hardware soportado CPU, GPU y NPU; variantes YOLO26 disponibles `yolo26n`, `yolo26s`, `yolo26m`, `yolo26l`.

## Arquitectura y entrenamiento

El sistema combina dos etapas. La primera es un detector de objetos: YOLO26, un detector en tiempo real de la familia Ultralytics entrenado sobre COCO, o bien DETR, un detector transformer sin NMS entrenado tambien sobre COCO. El script de exportacion integra en el IR de OpenVINO la normalizacion, la decodificacion de cajas y el remapeo de clases de DETR, de modo que ambos modelos producen el mismo layout de salida y los mismos identificadores de clase. La segunda etapa es el tracker `gvatrack` de DLStreamer, basado en filtro de Kalman, que asigna un ID persistente a cada persona a lo largo de los fotogramas.

Sobre las trayectorias se calcula la velocidad por track a partir del desplazamiento del centro del bounding box entre fotogramas consecutivos. La marca de "corriendo" se activa cuando la velocidad estimada supera el umbral configurado durante una ventana corta y sostenida, mecanismo disenado para suprimir el jitter de un unico fotograma. El flujo de trabajo incluye exportacion a OpenVINO IR y, opcionalmente, cuantizacion INT8 mediante NNCF post-training quantization usando un fotograma de calibracion extraido del video de muestra. No se dispone de informacion sobre el numero de tokens ni la composicion del dataset de entrenamiento mas alla de COCO, ni sobre si hubo RLHF o DPO (no aplica a un detector).

## Capacidades

- Deteccion de objetos de la clase `person` (COCO clase 0) en video.
- Tracking multi-objeto con ID persistente por persona mediante filtro de Kalman (`gvatrack`).
- Estimacion de velocidad por trayectoria a partir del desplazamiento del centro del bounding box.
- Clasificacion de comportamiento "corriendo" mediante umbral de velocidad sostenido en una ventana temporal.
- Ejecucion en CPU, GPU y NPU de Intel mediante OpenVINO.
- Soporte de precisiones FP32, FP16 e INT8 con cuantizacion post-entrenamiento.
- Variantes de detector intercambiables (YOLO26 n/s/m/l o DETR) con el mismo layout de salida.
- Integracion con DLStreamer para pipelines de video en el edge.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues propias de un LLM.

## Casos de uso

- Seguridad en andenes: detectar personas que corren hacia puertas de tren que se cierran, usando el tracking persistente para evitar falsos positivos por oclusiones momentaneas.
- Deteccion de incidentes: identificar carreras repentinas que puedan indicar una persecucion, altercado o emergencia, gracias a la ventana temporal sostenida que filtra el movimiento puntual.
- Monitorizacion de flujo de personas: distinguir el paso normal del movimiento rapido anormal en vestibulos y zonas de transito, con variantes `yolo26n`/`yolo26s` para alto FPS en edge.
- Zonas de velocidad restringida: hacer cumplir areas de solo caminar en escaleras mecanicas, rampas y escaleras, configurando el umbral de velocidad segun la zona.
- Analitica retrospectiva de video: procesar grabaciones con el pipeline OpenVINO + DLStreamer para generar eventos de carrera con marcas temporales y IDs de track.
- Despliegue en infraestructura Intel existente: ejecutar en CPU, GPU o NPU de estaciones sin aceleradores dedicados, aprovechando la cuantizacion INT8 para reducir requisitos de computo.
- Prototipado de analitica de metro: usar el script `export_and_quantize.sh` para generar variantes del detector y comparar throughput y recall en escenas densas antes de un despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card remite a una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican cifras por variante ni por precision).
- GPU recomendadas: no se especifican modelos concretos; el soporte declarado es CPU, GPU y NPU de Intel mediante OpenVINO.
- Cabe en GPU de consumo: no disponible; el diseno esta orientado a edge con aceleracion Intel (CPU/GPU/NPU integrados), no se confirma compatibilidad con GPU de consumo.
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer (con `gvatrack`), exportacion via Ultralytics y Hugging Face Transformers; el stack objetivo es DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030.
- Latencia y throughput estimados: no disponible; la model card indica que las variantes `yolo26n` y `yolo26s` estan recomendadas para despliegue edge de alto FPS, y que DETR es mas pesado y corre a menor tasa de fotogramas, sin cifras concretas.

Requisitos de software declarados: Python 3.11+, `ffmpeg`, OpenVINO y DLStreamer instalados a nivel de sistema, y un entorno virtual creado con `--system-site-packages`.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (por defecto) | Detector CNN en tiempo real | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Maximo throughput en edge; variantes n/s/m/l |
| DETR (detr-resnet-50) | Detector transformer sin NMS | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Mas pesado, menor FPS; licencia permisiva |
| Running Detection (pipeline completo) | Detector + tracker + estimacion de velocidad | Segun detector | Eventos de carrera | MIT (repo) | Anade tracking Kalman y umbral de velocidad |

La comparativa se limita a los dos detectores que el propio repositorio ofrece como alternativas; no se dispone de datos de rendimiento comparado con otros pipelines de deteccion de carrera.

## Limitaciones y advertencias

- El modelo detecta exclusivamente la clase `person`; no reconoce otros objetos ni comportamientos distintos de la carrera por umbral de velocidad.
- La estimacion de velocidad depende de la calibracion de la camara y de la tasa de fotogramas; no se documenta el metodo de conversion de pixeles a unidades fisicas.
- El umbral de velocidad y la ventana de sostenimiento son parametros configurables cuyo ajuste no se detalla; un umbral mal calibrado puede generar falsos positivos o negativos.
- La licencia del repositorio es MIT, pero YOLO26 se distribuye bajo AGPL-3.0, lo que puede imponer obligaciones de copyleft en uso comercial si se elige esa variante; DETR es Apache-2.0.
- El stack objetivo es una version de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030), no una release estable, lo que implica riesgo de inestabilidad en produccion.
- No se publican datos de sesgo, robustez ante condiciones de iluminacion adversas, oclusiones densas ni rendimiento en escenas con muchas personas.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.
- No se dispone de informacion sobre alucinacion (no aplica a un detector) ni sobre limitaciones de idioma mas alla de la etiqueta `en` de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/open-edge-platform/running-detection
- YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 (Facebook): https://huggingface.co/facebook/detr-resnet-50
- Paper DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Script de exportacion y cuantizacion: https://huggingface.co/open-edge-platform/running-detection/resolve/main/export_and_quantize.sh
