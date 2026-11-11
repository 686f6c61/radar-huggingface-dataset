# Intel/delivery-package-verification

## Resumen

Delivery/Package Verification es un caso de uso de deteccion de objetos publicado por Intel dentro de su catalogo de modelos optimizados para OpenVINO. No se trata de un modelo de lenguaje, sino de un detector de imagenes en tiempo real orientado a la verificacion de paquetes y equipaje en entornos de videovigilancia, con aplicaciones tipicas en andenes de carga, conteo de bultos en cintas transportadoras, deteccion de equipaje abandonado y prevencion de robos.

El modelo se construye sobre YOLO26 de Ultralytics (variantes `yolo26n`, `yolo26s`, `yolo26m` y `yolo26l`), entrenado originalmente sobre COCO, y se exporta a OpenVINO IR con soporte de cuantizacion INT8 mediante NNCF. En tiempo de ejecucion se filtran las clases COCO `backpack`, `handbag` y `suitcase`, que se reetiquetan como una unica clase `package`. Como alternativa se ofrece DETR (`detr-resnet-50` de Facebook), un detector transformer sin NMS, con licencia Apache-2.0.

La relevancia actual del modelo reside en su orientacion a despliegue en el borde: soporta CPU, GPU y NPU de Intel, se integra con DLStreamer 2026.3.0 RC1 y esta pensado para pipelines de analitica de video de alta tasa de fotogramas. Su licencia declarada es MIT, aunque el modelo base YOLO26 se distribuye bajo AGPL-3.0, lo que introduce una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos: YOLO26 (Ultralytics) por defecto; DETR (ResNet-50) como alternativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP32, FP16, INT8 (post-training quantization con NNCF) |
| Idiomas soportados | en (etiquetas y documentacion) |
| Licencia | MIT (modelo empaquetado); YOLO26 base bajo AGPL-3.0; DETR bajo Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); pesos PyTorch de origen para exportacion |

## Arquitectura y entrenamiento

El modelo base por defecto es YOLO26, un detector de objetos en tiempo real de la familia YOLO de Ultralytics, entrenado sobre el dataset COCO. No se proporcionan en la informacion disponible detalles sobre el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset mas alla de COCO, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no procede en un detector). La innovacion tecnica principal del paquete es el pipeline de exportacion y cuantizacion: el script `export_and_quantize.sh` descarga los pesos PyTorch, los exporta a OpenVINO IR y, opcionalmente, aplica cuantizacion post-entrenamiento INT8 con NNCF.

La variante DETR (`detr-resnet-50`) es un detector transformer sin supresion no maxima (NMS), entrenado sobre COCO y con licencia Apache-2.0. El script de exportacion embebe la normalizacion de DETR, la decodificacion de cajas y el remapeo de clases dentro del IR de OpenVINO, de modo que DETR produce el mismo layout de salida y los mismos ids de clase que YOLO26. Esto permite que las mismas muestras de OpenVINO y DLStreamer funcionen con cualquiera de los dos modelos, seleccionandolo mediante la constante `MODEL` en cada muestra. YOLO26 usa entrada de 640 x 640 con salida `[1, 300, 6]`, mientras que DETR usa 800 x 800 con salida `[1, 100, 6]`.

## Capacidades

- Deteccion de objetos de la clase `package`, mapeada desde las clases COCO `backpack`, `handbag` y `suitcase`.
- Conteo de paquetes y equipaje en flujos de camara.
- Verificacion de paquetes colocados o retirados en areas de carga.
- Deteccion de equipaje abandonado en plataformas y zonas monitorizadas.
- Alertas de desaparicion de paquetes para prevencion de robos.
- Inferencia en CPU, GPU y NPU de Intel mediante OpenVINO.
- Soporte de precisiones FP32, FP16 e INT8 con cuantizacion NNCF.
- Integracion con pipelines de analitica de video mediante Intel DLStreamer.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector visual.
- Capacidades multilingues: no disponibles; el modelo no procesa lenguaje.

## Casos de uso

- Monitorizacion de andenes de carga: el modelo detecta paquetes colocados o retirados en un area de carga, permitiendo verificar que cada envio se ha entregado o recogido correctamente. Es adecuado por su baja latencia en CPU/NPU y su integracion con DLStreamer.
- Deteccion de equipaje abandonado: en plataformas de metro o estaciones, el detector identifica bolsos y maletas sin vigilancia durante un periodo configurable, disparando alertas al sistema de seguridad.
- Conteo de paquetes en cinta transportadora: con las variantes ligeras (`yolo26n`, `yolo26s`) se puede procesar video a alta tasa de fotogramas para contar bultos en un punto de entrega o clasificacion.
- Prevencion de robos: comparando detecciones entre fotogramas, el sistema alerta cuando un paquete desaparece de una zona monitorizada, lo que encaja con despliegues en comercio minorista y logistica de ultima milla.
- Verificacion en puntos de entrega: en taquillas o puntos de recogida, el modelo confirma la presencia del paquete antes de registrar la entrega, reduciendo disputas.
- Analitica de video en el borde: al soportar NPU y GPU integradas de Intel, el modelo puede ejecutarse en dispositivos de bajo consumo en tiendas y almacenes sin depender de la nube.
- Combinacion con OCR: la model card recomienda emparejarlo con el caso de uso `ocr-text-recognition` para leer etiquetas o textos en los paquetes, habilitando verificacion por identificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un detector de objetos de tamano contenido y con soporte INT8, se espera un consumo de memoria reducido, pero no se proporcionan cifras.
- GPU recomendadas: no se especifican modelos concretos; el modelo declara soporte para GPU de Intel a traves de OpenVINO.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible. El soporte declarado es para CPU, GPU y NPU de Intel.
- Precisiones por dispositivo: FP32 en CPU y GPU (no en NPU); FP16 e INT8 en CPU, GPU y NPU.
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer 2026.3.0 RC1, OpenVINO GenAI 2026.5.0.0.dev20261030. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector visual).
- Latencia y throughput estimados: no disponibles. La model card recomienda las variantes `yolo26n` y `yolo26s` para despliegues de alto FPS en el borde, y las variantes mayores (`yolo26m`, `yolo26l`) para mejorar el recall en paquetes lejanos o parcialmente ocluidos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (variantes n/s/m/l) | CNN detector en tiempo real | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Maximo throughput en el borde; opcion por defecto |
| DETR (detr-resnet-50) | Transformer detector sin NMS | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Mas pesado y con menor tasa de fotogramas; licencia permisiva |

No se dispone de informacion sobre otros detectores comparables (por ejemplo, variantes de la familia YOLO anteriores, RT-DETR o modelos especializados en paqueteria) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no detecta cajas de carton como clase nativa de COCO: se apoya en `backpack`, `handbag` y `suitcase` reetiquetados como `package`, lo que puede generar falsos positivos con mochilas o bolsos que no sean paquetes.
- No lee etiquetas ni texto en los paquetes; para ello es necesario combinarlo con un modelo de OCR.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero existen riesgos de falsos positivos y falsos negativos propios de un detector.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse sobre COCO, hereda los sesgos de composicion y anotacion de dicho dataset.
- Limitaciones de idioma: el modelo solo declara `en`; no procesa lenguaje natural.
- Restriccion de licencia importante: aunque el repositorio declara MIT, el modelo base YOLO26 se distribuye bajo AGPL-3.0, lo que puede imponer obligaciones de copyleft en uso comercial. La alternativa DETR es Apache-2.0 y evita esta restriccion, a costa de menor rendimiento.
- El stack objetivo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030) es una version de desarrollo, no una release estable, lo que desaconseja su uso directo en produccion sin validacion.
- El repositorio tiene un tamano de 0.0 GB y solo 24 descargas, lo que sugiere un modelo reciente y poco contrastado por la comunidad.
- El modelo esta pensado para analitica de video en el borde; no es adecuado para tareas de generacion, razonamiento o procesamiento de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Intel/delivery-package-verification
- Documentacion de YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 (Facebook): https://huggingface.co/facebook/detr-resnet-50
- Paper de DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Pagina principal de Intel: https://www.intel.com/content/www/us/en/homepage.html
