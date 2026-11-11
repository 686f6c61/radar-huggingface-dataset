# Intel/object-detection

## Resumen

Object Detection es un paquete de modelos de deteccion de objetos publicado por Intel en Hugging Face bajo el identificador `Intel/object-detection`. No se trata de un modelo linguistico generativo, sino de un conjunto de detectores exportados al formato OpenVINO IR para su despliegue en hardware Intel (CPU, GPU y NPU). El modelo por defecto es YOLO26 de Ultralytics, con variantes `yolo26n`, `yolo26s`, `yolo26m` y `yolo26l`, y se ofrece DETR (`detr-resnet-50` de Facebook) como alternativa basada en transformer y sin NMS.

El modelo cubre las 80 clases de la taxonomia COCO y esta orientado a casos de uso de analitica de video en el ambito del transporte metropolitano ("Metro Analytics"): comprension de escena, monitorizacion de inventario, deteccion de anomalias y analitica multiclase. La entrada es de 640 x 640 para YOLO26 y de 800 x 800 para DETR, con una salida de `[1, 300, 6]` y `[1, 100, 6]` respectivamente.

Su relevancia actual radica en que Intel lo distribuye ya cuantizado (FP32, FP16 e INT8 con cuantizacion post-entrenamiento via NNCF) y empaquetado para el stack DLStreamer 2026.3.0 RC1 y OpenVINO GenAI 2026.5.0, lo que facilita el despliegue en el borde. La licencia del repositorio es MIT, aunque conviene revisar la licencia del modelo base YOLO26 (AGPL-3.0) frente a la de DETR (Apache-2.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLO26, por defecto) o transformer detector sin NMS (DETR, alternativa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no linguistico) |
| Tipos de cuantizacion | FP32, FP16, INT8 (mixed-precision, NNCF post-training quantization) |
| Idiomas soportados | en (etiquetas de clase en ingles) |
| Licencia | MIT (repositorio); YOLO26: AGPL-3.0; DETR: Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); exportacion desde PyTorch (Ultralytics / Transformers) |

## Arquitectura y entrenamiento

El modelo por defecto, YOLO26, es un detector de objetos en tiempo real de la familia Ultralytics, con variantes de distinto tamano (`n`, `s`, `m`, `l`) que equilibran velocidad y recall. La alternativa DETR es un detector basado en transformer, sin supresion de no maximos (NMS), entrenado sobre COCO. El script de exportacion de Intel integra la normalizacion, la decodificacion de cajas y el remapeo de clases dentro del IR de OpenVINO, de modo que DETR produce el mismo esquema de salida y los mismos ids de clase que YOLO26, permitiendo intercambiar ambos modelos en las mismas muestras de OpenVINO y DLStreamer.

No se detalla en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento mas alla de COCO (80 clases). La cuantizacion INT8 se realiza con NNCF mediante cuantizacion post-entrenamiento, calibrada por defecto con una imagen de muestra incluida; el autor advierte que para produccion debe sustituirse por un conjunto representativo de fotogramas del sitio de despliegue.

## Capacidades

- Deteccion y clasificacion de objetos en las 80 clases de COCO (personas, vehiculos, animales, objetos cotidianos).
- Inferencia en CPU, GPU y NPU de Intel mediante OpenVINO.
- Soporte de precisiones FP32, FP16 e INT8 (la tabla de compatibilidad indica que FP32 no esta soportado en NPU).
- Variantes de distinto tamano para priorizar FPS (yolo26n, yolo26s) o recall en objetos pequenos (yolo26m, yolo26l).
- Alternativa DETR con licencia permisiva (Apache-2.0) para entornos que requieran un detector transformer.
- Integracion con DLStreamer para pipelines de video.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas o multimodales generativas.

## Casos de uso

- Comprension de escena en videovigilancia: el modelo identifica y clasifica todos los objetos visibles en un flujo de camara usando las 80 clases COCO, adecuado para paneles de situacion en estaciones.
- Monitorizacion de inventario en andenes: deteccion de objetos concretos como bolsas, maletas o botellas para control de equipajes o stocks, aprovechando la taxonomia completa.
- Deteccion de anomalias en zonas restringidas: identificacion de objetos inesperados mediante umbrales de confianza sobre clases no permitidas en un area.
- Analitica multiclase: recuento y estadisticas agregadas de personas, vehiculos y otras categorias para informes operativos.
- Despliegue en el borde de alta tasa de fotogramas: las variantes yolo26n y yolo26s, cuantizadas a INT8, permiten inferencia en CPU/NPU Intel a alto FPS.
- Deteccion con requisitos de licencia permisiva: uso de la variante DETR (Apache-2.0) cuando la AGPL-3.0 de YOLO26 no sea aceptable, asumiendo menor tasa de fotogramas.
- Integracion en pipelines DLStreamer: procesamiento de video en directo con el stack OpenVINO GenAI y DLStreamer 2026.3.0 RC1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible (no se publican tamanos de pesos por variante).
- Aceleradores soportados: CPU, GPU y NPU de Intel mediante OpenVINO.
- Compatibilidad por precision: FP32 en CPU y GPU (no en NPU); FP16 e INT8 en CPU, GPU y NPU.
- Cabe en hardware de consumo Intel con iGPU o NPU; no se especifican modelos concretos de GPU (A100, H100, RTX 4090) porque el stack esta orientado a hardware Intel.
- Opciones de despliegue: OpenVINO Runtime, OpenVINO GenAI, DLStreamer; exportacion desde Ultralytics (YOLO26) o Transformers (DETR).
- Latencia y throughput: no disponibles; el autor recomienda yolo26n/yolo26s para despliegues de alto FPS en el borde y advierte que DETR es mas pesado y corre a menor tasa de fotogramas.
- Requisitos de software: Python 3.11+, OpenVINO y DLStreamer; el stack indicado (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030) es de desarrollo, no una version estable.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (Intel, por defecto) | CNN | 640 x 640 | [1, 300, 6] | AGPL-3.0 | Maximo throughput en el borde; variantes n/s/m/l |
| DETR resnet-50 (Intel, alternativa) | Transformer sin NMS | 800 x 800 | [1, 100, 6] | Apache-2.0 | Mas pesado, menor FPS; licencia permisiva |
| DETR resnet-50 (Facebook, original) | Transformer sin NMS | 800 x 800 | no disponible | Apache-2.0 | Modelo base de referencia en PyTorch |

No se dispone de datos de rendimiento comparativo (mAP, FPS) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de vision para deteccion de objetos: no genera texto ni razona; no debe evaluarse como modelo linguistico.
- La cuantizacion INT8 se calibra por defecto con una unica imagen de muestra; para produccion debe recalibrarse con fotogramas representativos del sitio, o la precision puede degradar.
- El stack de software indicado (DLStreamer 2026.3.0 RC1, OpenVINO 2026.5.0.0.dev) es de desarrollo y no una version estable, con riesgo de cambios de API.
- Licencia del modelo base YOLO26: AGPL-3.0, con implicaciones para uso comercial y distribucion; la licencia MIT del repositorio no sustituye a la del modelo base. Para uso comercial con licencia permisiva, usar la variante DETR (Apache-2.0).
- Limitado a las 80 clases de COCO; objetos fuera de esa taxonomia no se detectan.
- Etiquetas e idioma limitados al ingles.
- Riesgo de falsos positivos y negativos inherente a la deteccion; requiere umbrales de confianza ajustados por caso de uso.
- No se publican cifras de precision ni de rendimiento en la informacion disponible, lo que dificulta la evaluacion previa al despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Intel/object-detection
- YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR resnet-50 (Facebook): https://huggingface.co/facebook/detr-resnet-50
- Paper DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Intel (web corporativa): https://www.intel.com/content/www/us/en/homepage.html
