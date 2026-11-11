# Intel/intrusion-detection

## Resumen

Intrusion Detection es un paquete de inferencia para OpenVINO publicado por Intel dentro de su suite Metro Analytics, orientado a la deteccion de intrusiones en zonas restringidas mediante vision por computador en el borde. No es un modelo de lenguaje: es un detector de objetos de la clase `person` (clase 0 de COCO) construido sobre YOLO26 de Ultralytics (variantes `yolo26n`, `yolo26s`, `yolo26m` y `yolo26l`) como opcion por defecto, con DETR (`detr-resnet-50`, Facebook) como alternativa transformer sin NMS. El artefacto se distribuye como IR de OpenVINO en precisiones FP32, FP16 e INT8, y se integra con DLStreamer para combinar deteccion, tracking multiobjeto y analitica de zonas.

El problema que resuelve es concreto: marcar como evento de intrusion el momento en que una persona rastreada cruza por primera vez el poligono de una zona protegida. El elemento `gvaanalytics` de DLStreamer define la zona y adjunta metadatos `GstAnalyticsZoneMtd` a cada persona cuyo centro cae dentro del poligono; una sonda en Python lee esos metadatos y dispara el evento. Esto permite desplegar vigilancia de perimetro en CPU, GPU o NPU de Intel sin depender de la nube.

Su relevancia actual es de infraestructura mas que de investigacion: ejemplifica el patron de despliegue edge-first de Intel (OpenVINO + DLStreamer + NNCF) para casos de metro, subestaciones electricas y perimetros vallados, con variantes ligeras pensadas para alto FPS en hardware de borde. El repositorio es pequeno (0,0 GB) y acumula 16 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos: YOLO26 (Ultralytics, por defecto) o DETR (`detr-resnet-50`, Facebook, alternativa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 640 x 640 en YOLO26 y 800 x 800 en DETR) |
| Tipos de cuantizacion | FP32, FP16, INT8 (mixed-precision, via NNCF post-training quantization) |
| Idiomas soportados | en (etiquetas y documentacion) |
| Licencia | MIT (el modelo publicado); YOLO26 subyacente es AGPL-3.0 y DETR es Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`) y directorio `*_openvino_model/`; exportado desde PyTorch (Ultralytics / Hugging Face Transformers) |

## Arquitectura y entrenamiento

El componente de deteccion es YOLO26, un detector de una etapa de la familia Ultralytics, o bien DETR, un detector transformer sin supresion no maxima. El script de exportacion embebe en el IR de OpenVINO la normalizacion, la decodificacion de cajas y el remapeo de clases de DETR, de modo que ambos modelos producen el mismo layout de salida y los mismos ids de clase: `[1, 300, 6]` para YOLO26 y `[1, 100, 6]` para DETR. La clase detectada es unicamente `person` (COCO class 0).

No se detallan en la informacion disponible el numero de tokens ni la composicion del dataset de entrenamiento de los detectores base; se sabe que YOLO26 y DETR se entrenan sobre COCO. La innovacion tecnica del paquete no esta en el detector sino en la cadena de analitica: tracking multiobjeto con IDs persistentes entre fotogramas, definicion de zona protegida mediante `gvaanalytics`, metadatos `GstAnalyticsZoneMtd` adjuntos a cada persona rastreada y una sonda Python que emite el evento de intrusion en el primer cruce. La cuantizacion INT8 se realiza con NNCF usando fotogramas del video de vigilancia de ejemplo (`VIRAT_S_000101.mp4`) como conjunto de calibracion.

## Capacidades

- Deteccion de personas (clase unica `person`, COCO class 0) en fotogramas de video.
- Tracking multiobjeto con asignacion de IDs persistentes entre fotogramas.
- Analitica de zona: definicion de poligonos restringidos y evaluacion de la posicion del centro de cada persona rastreada.
- Emision de eventos de intrusion en el primer cruce del limite de la zona, leyendo metadatos `GstAnalyticsZoneMtd` desde una sonda Python.
- Inferencia en CPU, GPU y NPU de Intel mediante OpenVINO, con precisiones FP32, FP16 e INT8.
- Seleccion intercambiable de detector (YOLO26 o DETR) manteniendo el mismo layout de salida y los mismos ids de clase.
- No soporta tool calling, agentes, razonamiento multi-paso, vision generativa, audio ni capacidades multilingues; es un componente de vision por computador de proposito especifico.

## Casos de uso

- Monitorizacion de areas restringidas en metro: el modelo detecta personas y el tracker mantiene su ID; `gvaanalytics` evalua si el centro de la persona entra en el poligono de la via o de una sala tecnica y la sonda Python dispara la alerta en el primer cruce.
- Proteccion de instalaciones de servicios: deteccion de entrada en subestaciones, casetas de bombeo e infraestructura vallada, desplegando `yolo26n` o `yolo26s` en INT8 sobre CPU o NPU para vigilancia continua sin GPU dedicada.
- Control de perimetro de seguridad: disparo cuando alguien cruza una linea de valla o un limite de distancia de seguridad, usando los IDs persistentes del tracker para no repetir la alerta mientras la misma persona permanece dentro.
- Cumplimiento de zonas prohibidas: monitorizacion de salidas de emergencia, tuneles y pasillos de mantenimiento que deben permanecer despejados, con alerta al primer cruce del poligono configurado.
- Vigilancia fuera de horario: el mismo pipeline aplicado a franjas horarias concretas, reutilizando el detector y variando unicamente la configuracion de zona y la logica de la sonda.
- Despliegue en borde con requisitos de privacidad: al ejecutarse en OpenVINO sobre hardware Intel local, el video no sale del dispositivo; las variantes `yolo26n` y `yolo26s` estan recomendadas para alto FPS en hardware de borde.
- Evaluacion comparativa de detectores en un pipeline real: el mismo sample ejecuta YOLO26 o DETR cambiando la constante `MODEL`, lo que permite medir throughput y tasa de deteccion en el hardware objetivo antes de fijar la variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras en el material proporcionado. Tampoco se detallan latencias ni throughput concretos.

## Requisitos de hardware

- Hardware soportado: CPU, GPU y NPU de Intel mediante OpenVINO.
- Compatibilidad por precision: FP32 funciona en CPU y GPU pero no en NPU; FP16 e INT8 funcionan en CPU, GPU y NPU.
- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB y las variantes `yolo26n` y `yolo26s` estan pensadas para alto FPS en hardware de borde, pero no se publican cifras de memoria.
- GPU recomendadas: no disponible. La model card no especifica modelos concretos de GPU Intel.
- Encaje en GPU de consumo: no disponible; la informacion no confirma ni descarta el soporte en GPU de consumo.
- Opciones de despliegue: OpenVINO Runtime (2026.5.0.dev20261030), Intel DLStreamer 2026.3.0 RC1 con los elementos `gvaanalytics` y `gstanalytics`, y el bundle OpenVINO GenAI 2026.5.0.0.dev20261030. Requiere Python 3.11 o superior y un entorno virtual creado con `--system-site-packages`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (variantes n/s/m/l) | Detector de una etapa (Ultralytics) | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Opcion por defecto; maximo throughput en borde |
| DETR (`detr-resnet-50`) | Detector transformer sin NMS (Facebook) | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Alternativa con licencia permisiva; mas pesado y con menor tasa de fotogramas |

La model card solo compara internamente estas dos opciones. No se proporcionan datos de otros detectores de personas ni cifras de rendimiento comparativas.

## Limitaciones y advertencias

- Modelo de proposito especifico: solo detecta la clase `person`; no reconoce otros objetos ni genera texto.
- La licencia MIT del artefacto publicado no cubre el modelo base YOLO26, distribuido bajo AGPL-3.0. Para uso comercial con requisitos de licencia permisiva debe seleccionarse la variante DETR (Apache-2.0), que es mas pesada y funciona a menor tasa de fotogramas.
- El stack objetivo es una version candidata de desarrollo: DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.dev20261030. No es una release estable y puede cambiar.
- La calibracion INT8 se realiza con fotogramas de un unico video de vigilancia (`VIRAT_S_000101.mp4`); la precision en dominios visuales distintos puede degradarse y requerir recalibracion.
- La logica de zona depende del centro de la persona dentro del poligono, lo que puede producir falsos negativos en cruces parciales y falsos positivos en personas situadas justo en el limite.
- No se publican datos de sesgo, tasas de alucinacion (no aplica en el sentido generativo) ni evaluaciones de robustez en condiciones de iluminacion, oclusion o angulos de camara adversos.
- Documentacion e idioma de trabajo unicamente en ingles.
- Requiere Python 3.11 o superior y acceso a los paquetes de sistema de OpenVINO y DLStreamer; el entorno virtual debe crearse con `--system-site-packages`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/intrusion-detection
- Documentacion de YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR resnet-50 en Hugging Face: https://huggingface.co/facebook/detr-resnet-50
- Paper de DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
- Guia de instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Intel (sitio corporativo): https://www.intel.com/content/www/us/en/homepage.html
- Centro de descargas de Intel: https://www.intel.fr/content/www/fr/fr/download-center/home.html
