# Intel/object-classification

## Resumen

Object Classification es un caso de uso de analitica urbana (Metro Analytics) publicado por Intel en Hugging Face. No se trata de un modelo de lenguaje, sino de un pipeline de deteccion y categorizacion de objetos orientado a videovigilancia de trafico: detecta personas y vehiculos en imagenes o flujos de camara y agrupa las 80 clases COCO en dos categorias semanticas de alto nivel, `People` y `Vehicles`, para ofrecer una vision operativa inmediata de la escena.

El componente de deteccion por defecto es YOLO26 de Ultralytics (variantes `yolo26n`, `yolo26s`, `yolo26m` y `yolo26l`), con DETR (`detr-resnet-50` de Facebook) como alternativa basada en transformer y sin NMS. Los pesos se exportan a OpenVINO IR y se cuantizan a INT8 mediante NNCF, de modo que la inferencia se ejecuta de forma eficiente sobre CPU, GPU y NPU de Intel. La salida se normaliza a un layout comun `[1, 300, 6]` para YOLO26 y `[1, 100, 6]` para DETR, con los mismos identificadores de clase.

Su relevancia actual radica en el despliegue en el borde: el modelo esta pensado para integrarse con Intel DLStreamer 2026.3.0 RC1 y OpenVINO GenAI 2026.5.0.0, lo que permite construir analiticas de trafico en tiempo real sobre hardware Intel sin depender de la nube. La licencia del repositorio es MIT, aunque conviene tener en cuenta que los pesos de YOLO26 subyacentes se distribuyen bajo AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO26 (Ultralytics) por defecto; DETR (transformer, sin NMS) como alternativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP32, FP16, INT8 (cuantizacion post-entrenamiento con NNCF) |
| Idiomas soportados | en (etiquetas y documentacion) |
| Licencia | MIT (repositorio); YOLO26 subyacente AGPL-3.0; DETR Apache-2.0 |
| Formato de pesos | OpenVINO IR (exportado desde PyTorch/Ultralytics o Hugging Face Transformers) |

## Arquitectura y entrenamiento

El pipeline combina un detector con una etapa de remapeo de clases. En la configuracion por defecto se emplea YOLO26, un detector en tiempo real de Ultralytics, en una de sus cuatro variantes de tamano (`n`, `s`, `m`, `l`); las variantes pequenas (`yolo26n`, `yolo26s`) se recomiendan para despliegues de alto FPS en el borde, mientras que las mayores mejoran el recall en objetos pequenos. Como alternativa se ofrece DETR (`detr-resnet-50`), un detector basado en transformer y sin supresion de no maximos, entrenado sobre COCO y publicado bajo Apache-2.0. El script de exportacion embebe en el IR de OpenVINO la normalizacion, la decodificacion de cajas y el remapeo de clases de DETR, de forma que ambos modelos producen el mismo layout de salida y los mismos identificadores de clase.

La etapa de categorizacion agrupa las clases COCO relevantes para trafico: `person` se mapea a `People`, y `bicycle`, `car`, `motorcycle`, `bus`, `train` y `truck` se mapean a `Vehicles`. El resto de clases COCO se descartan para mantener la salida centrada en situational awareness de trafico. El flujo de trabajo incluye la descarga de pesos PyTorch, la exportacion a OpenVINO IR y, opcionalmente, la cuantizacion INT8 con NNCF. No se dispone de informacion sobre el volumen de datos de entrenamiento ni sobre el proceso de ajuste, ya que el repositorio reutiliza detectores preentrenados en COCO.

## Capacidades

- Deteccion de objetos en imagenes y video con YOLO26 o DETR.
- Categorizacion de detecciones en dos grupos semanticos: `People` y `Vehicles`.
- Salida normalizada con layout comun entre ambos detectores: `[1, 300, 6]` para YOLO26 y `[1, 100, 6]` para DETR.
- Inferencia en CPU, GPU y NPU de Intel a traves de OpenVINO.
- Cuantizacion INT8 para reducir latencia y huella de memoria en el borde.
- Integracion con Intel DLStreamer para pipelines de video.
- Soporte de entrada de imagen a 640x640 (YOLO26) y 800x800 (DETR).
- Capacidades multilingues: no disponibles; el modelo no procesa texto.

## Casos de uso

- Situational awareness en camaras urbanas: el pipeline resume cada feed como conteos en vivo de `People` y `Vehicles`, lo que permite a los operadores interpretar una escena de un vistazo sin revisar las 80 clases COCO individuales.
- Operaciones urbanas automatizadas: los conteos por categoria se pueden inyectar en logicas de temporizacion semaforica, gestion de congestion o despacho de servicios, ya que la salida es compacta y facil de consumir por sistemas posteriores.
- Monitorizacion de intersecciones y rotondas: el modelo distingue la mezcla de peatones y vehiculos en cruces concurridos, util para analizar patrones de movilidad y seguridad vial.
- Analitica de tendencias: la agregacion temporal de conteos por categoria permite estudiar patrones de trafico a lo largo del dia o de la semana.
- Despliegue en el borde de alta densidad: las variantes `yolo26n` y `yolo26s` cuantizadas a INT8 estan pensadas para camaras o gateways con CPU, GPU o NPU Intel, donde el FPS y el consumo importan.
- Procesamiento de video con DLStreamer: el modelo se integra en pipelines de Intel DLStreamer 2026.3.0 RC1, lo que facilita conectar la deteccion con fuentes de video, seguimiento y publicacion de resultados.
- Escenarios con requisitos de licencia permisiva: la variante DETR, bajo Apache-2.0, es la opcion cuando se prefiere un detector transformer con licencia mas laxa, a costa de un menor frame rate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una matriz de validacion de dispositivos (DEVICE_SUPPORT_MATRIX.md) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- Inferencia soportada en CPU, GPU y NPU de Intel mediante OpenVINO.
- VRAM estimada: no disponible. Al ser un detector pequeno (variantes `n` y `s`) cuantizado a INT8, la huella es reducida, pero no se proporcionan cifras.
- GPU recomendadas: no disponible. El stack objetivo son dispositivos Intel con OpenVINO; no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer 2026.3.0 RC1, exportacion a OpenVINO IR desde Ultralytics o Hugging Face Transformers, cuantizacion con NNCF.
- Latencia y throughput: no disponibles. La model card remite a la matriz de validacion de dispositivos para resultados medidos.
- Requisitos de software: Python 3.11 o superior, OpenVINO y DLStreamer instalados en el sistema, entorno virtual con `--system-site-packages`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| Object Classification (YOLO26, por defecto) | Detector YOLO26 (n/s/m/l) | 640x640 | `[1, 300, 6]` | Repositorio MIT; YOLO26 AGPL-3.0 | Maximo throughput en el borde; categorias People/Vehicles |
| Object Classification (DETR) | Transformer sin NMS | 800x800 | `[1, 100, 6]` | Apache-2.0 | Mas pesado, menor frame rate; licencia permisiva |
| YOLO26 sin remapeo | Detector YOLO26 | 640x640 | 80 clases COCO | AGPL-3.0 | Reporta todas las clases COCO en lugar de agruparlas |
| DETR-resnet-50 original | Transformer sin NMS | 800x800 | 80 clases COCO | Apache-2.0 | Sin la normalizacion ni el remapeo embebidos en el IR |

## Limitaciones y advertencias

- Solo se conservan las categorias `People` y `Vehicles`; el resto de clases COCO se descartan, por lo que no sirve para deteccion generica de objetos.
- El modelo esta pensado para trafico urbano y no se documentan sesgos especificos; al reutilizar detectores entrenados en COCO, hereda los sesgos de ese dataset.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existen falsos positivos y falsos negativos propios de la deteccion.
- Limitaciones de idioma: las etiquetas y la documentacion estan en ingles; el modelo no procesa texto.
- Restricciones de licencia: el repositorio es MIT, pero los pesos de YOLO26 estan bajo AGPL-3.0, lo que condiciona el uso comercial y la distribucion de derivados. DETR es Apache-2.0.
- El stack objetivo es una version de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030), no una release estable, lo que implica riesgo de cambios de API.
- El repositorio ocupa 0.0 GB, lo que sugiere que los pesos no estan alojados directamente en el hub y deben generarse con el script de exportacion.
- No se proporcionan cifras de precision ni de latencia en la informacion disponible; conviene validar en el hardware objetivo antes de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Intel/object-classification
- Documentacion de YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR-resnet-50 en Hugging Face: https://huggingface.co/facebook/detr-resnet-50
- Paper de DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Guia de instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
