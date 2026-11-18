# open-edge-platform/motion-tracking

## Resumen
Motion Tracking es un caso de uso de analitica para entornos metro (transporte urbano) publicado por open-edge-platform (Intel) que combina deteccion de objetos en tiempo real con seguimiento multiobjeto persistente a lo largo de fotogramas. El paquete no es un modelo unico, sino una receta de exportacion y despliegue: parte de YOLO26 (Ultralytics) como detector por defecto, con DETR (facebook/detr-resnet-50) como alternativa, y los convierte a OpenVINO IR en FP32, FP16 o INT8 para ejecucion en CPU, GPU y NPU de Intel.

El componente de seguimiento se delega en DLStreamer mediante el elemento `gvatrack` con `tracking-type=short-term-imageless`, un tracker basado en filtro de Kalman que asigna un `track_id` persistente a cada objeto visible y produce trayectorias utilizables para analisis de rutas, calculo de tiempos de permanencia y disparadores de eventos por zona. La salida del detector se normaliza a un layout comun (`[1, 300, 6]` para YOLO26, `[1, 100, 6]` para DETR) para que ambas variantes sean intercambiables en el mismo pipeline.

Es relevante ahora porque ejemplifica el patron actual de despliegue de vision por computador en el borde: cuantizacion INT8 con NNCF, inferencia con OpenVINO y orquestacion con DLStreamer sobre hardware Intel sin GPU dedicada. La licencia del repositorio es MIT, aunque conviene revisar la licencia del detector subyacente (YOLO26 es AGPL-3.0; DETR es Apache-2.0), un matiz importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO26 (CNN, Ultralytics) por defecto; DETR (transformer, ResNet-50) como alternativa; tracker `gvatrack` con filtro de Kalman (`short-term-imageless`) |
| Parametros totales | no disponible (depende de la variante: yolo26n, yolo26s, yolo26m, yolo26l, o detr-resnet-50) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16, INT8 (mixed-precision via NNCF post-training quantization) |
| Idiomas soportados | en (etiquetas y documentacion) |
| Licencia | MIT (repositorio); YOLO26 AGPL-3.0; DETR Apache-2.0 |
| Formato de pesos | OpenVINO IR (exportado desde PyTorch/Ultralytics y Hugging Face Transformers) |

## Arquitectura y entrenamiento
El detector por defecto, YOLO26, es una red convolucional de deteccion de objetos en tiempo real de Ultralytics, disponible en cuatro escalas (n, s, m, l). El exportador descarga los pesos PyTorch originales y los convierte a OpenVINO IR, opcionalmente aplicando cuantizacion post-entrenamiento con NNCF para INT8. La alternativa DETR es un detector transformer sin NMS entrenado sobre COCO; el script de exportacion embebe la normalizacion, la decodificacion de cajas y el remapeo de clases dentro del IR, de modo que la salida es homogenea con la de YOLO26.

El seguimiento no forma parte del modelo neuronal: lo realiza DLStreamer con `gvatrack`. El modo por defecto `short-term-imageless` usa un filtro de Kalman y no requiere extraccion de caracteristicas de imagen, lo que reduce coste computacional. Para reidentificacion mas robusta se ofrece `tracking-type=deep-sort`, que incorpora un modelo de extraccion de caracteristicas (por ejemplo mars-small128). No se detallan en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento de los detectores; se sabe que YOLO26 y DETR se entrenan sobre COCO (80 clases por defecto).

## Capacidades
- Deteccion de objetos en imagenes y video con 80 clases COCO configurables por defecto.
- Seguimiento multiobjeto con asignacion de `track_id` persistente entre fotogramas.
- Generacion de trayectorias por objeto para analisis de rutas y tiempos de permanencia.
- Disparadores de eventos basados en zonas (entrada/salida de areas definidas).
- Ejecucion en CPU, GPU y NPU de Intel mediante OpenVINO.
- Cuantizacion INT8 con NNCF para maximizar throughput en el borde.
- Intercambiabilidad de detectores (YOLO26 o DETR) en el mismo pipeline DLStreamer.
- Soporte de reidentificacion opcional mediante `deep-sort` con modelo de features.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso
- Analisis de trayectorias de peatones en estaciones: el pipeline detecta personas y asigna `track_id` persistente, permitiendo reconstruir rutas de caminantes y optimizar flujos dentro de la estacion.
- Medicion de tiempos de permanencia: combinando las trayectorias con zonas definidas se calcula cuanto tiempo pasa cada individuo en un area concreta, util para estudios de ocupacion.
- Deteccion de eventos por zona: se disparan alertas cuando un objeto rastreado entra o sale de un area delimitada, aplicable a control de accesos o seguridad.
- Analitica de flujo de trafico: seguimiento de vehiculos en intersecciones para ajustar tiempos de semaforo y estudiar patrones de congestion.
- Reproduccion forense de incidentes: reconstruccion de las trayectorias de objetos tras un evento para revision posterior.
- Despliegue en borde sin GPU dedicada: gracias a la cuantizacion INT8 y a OpenVINO, el pipeline corre en CPU y NPU de Intel, adecuado para dispositivos empotrados en estaciones.
- Prototipado rapido de pipelines de vision: el script de exportacion y cuantizacion permite cambiar entre variantes de YOLO26 y DETR con un solo argumento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas en el material proporcionado.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el stack esta orientado a CPU, GPU integrada y NPU de Intel, no exclusivamente a GPU dedicada.
- GPU recomendadas: no se especifican modelos concretos; se soportan GPU y NPU de Intel via OpenVINO.
- Compatibilidad con GPU de consumo: no se detalla; el enfasis esta en hardware Intel y despliegue en el borde.
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer 2026.3.0 RC1, OpenVINO GenAI 2026.5.0.0.dev20261030, con exportacion via Ultralytics o Hugging Face Transformers.
- Requisitos de software: Python 3.11+, ffmpeg, OpenVINO y DLStreamer instalados; se recomienda un entorno virtual con `--system-site-packages`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (default) | CNN detector | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Maximo throughput en el borde; variantes n, s, m, l |
| DETR (detr-resnet-50) | Transformer detector | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Mas pesado, menor frame rate, licencia permisiva |
| Motion Tracking (este paquete) | Pipeline deteccion + tracking | segun detector | trayectorias con `track_id` | MIT (repo) | Combina detector OpenVINO + `gvatrack` de DLStreamer |

## Limitaciones y advertencias
- El stack objetivo es una version de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev), no una release estable; puede haber cambios incompatibles.
- La licencia MIT del repositorio no cubre los pesos del detector: YOLO26 es AGPL-3.0, lo que impone obligaciones de copyleft para uso comercial; DETR (Apache-2.0) es la opcion permisiva.
- El tracker por defecto `short-term-imageless` no realiza reidentificacion tras oclusiones prolongadas; para escenarios con reapariciones conviene `deep-sort`.
- Riesgo de fallos de deteccion y confusion de clases inherente a los detectores COCO, especialmente en condiciones de baja iluminacion u oclusion.
- La informacion disponible esta en ingles y no se documentan sesgos especificos ni evaluaciones de equidad.
- No se proporcionan cifras de precision, latencia ni throughput; es necesario validar en el hardware objetivo antes de produccion.
- Requiere ffmpeg y dependencias del sistema; el uso de `--system-site-packages` es obligatorio para acceder a OpenVINO y DLStreamer.

## Enlaces
- Hugging Face: https://huggingface.co/open-edge-platform/motion-tracking
- YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50: https://huggingface.co/facebook/detr-resnet-50
- Paper DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
