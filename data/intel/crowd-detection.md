# Intel/crowd-detection

## Resumen

Crowd Detection es un modelo de deteccion de objetos especializado en la identificacion y el conteo de personas en flujos de video, publicado por Intel en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje, sino de un detector de objetos optimizado para despliegue en el borde (edge AI), cuyo proposito es estimar ocupacion y detectar aglomeraciones en entornos de transporte publico, particularmente en estaciones de metro. El modelo se distribuye como artefacto OpenVINO IR y se apoya en YOLO26 de Ultralytics como base por defecto, con DETR (ResNet-50) como alternativa.

La relevancia del modelo reside en su enfoque de despliegue: se exporta a OpenVINO IR en precisiones FP32, FP16 e INT8 (cuantizacion mixta con NNCF), lo que permite ejecutarlo en CPU, GPU y NPU de Intel. Incluye variantes de YOLO26 (`yolo26n`, `yolo26s`, `yolo26m`, `yolo26l`) para ajustar el compromiso entre throughput y recall en aglomeraciones densas, y se integra con Intel DLStreamer para pipelines de video en tiempo real.

El modelo filtra en tiempo de ejecucion la clase `person` (clase 0 de COCO) y produce un recuento de personas por fotograma. Su target declarado es la pila Intel DLStreamer 2026.3.0 RC1 junto con OpenVINO GenAI 2026.5.0.0.dev20261030, marcada explicitamente como pila de desarrollo y no como version estable, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos: YOLO26 (Ultralytics, por defecto) o DETR ResNet-50 (alternativa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16, INT8 (cuantizacion post-entrenamiento mixta con NNCF) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto) |
| Licencia | MIT (modelo empaquetado); YOLO26 subyacente AGPL-3.0; DETR Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); exportacion desde PyTorch (Ultralytics o Transformers) |
| Entrada | 640 x 640 (YOLO26); 800 x 800 (DETR) |
| Salida | `[1, 300, 6]` (YOLO26); `[1, 100, 6]` (DETR) |
| Clase detectada | `person` (clase 0 de COCO) |
| Hardware soportado | CPU, GPU, NPU (Intel) |
| Motor de inferencia | OpenVINO |

## Arquitectura y entrenamiento

El modelo no entrena una red propia: empaqueta y exporta detectores preentrenados en COCO. La variante por defecto es YOLO26 de Ultralytics, un detector en tiempo real disponible en cuatro escalas (`n`, `s`, `m`, `l`); las variantes pequenas (`yolo26n`, `yolo26s`) se recomiendan para despliegue de alto FPS en el borde, mientras que las mayores mejoran el recall en aglomeraciones densas. Como alternativa se ofrece DETR (DEtection TRansformer) con backbone ResNet-50, un detector basado en transformer y libre de NMS, entrenado en COCO y publicado bajo Apache-2.0.

El pipeline de exportacion convierte los pesos PyTorch a OpenVINO IR y, opcionalmente, aplica cuantizacion post-entrenamiento con NNCF para producir un modelo INT8. En el caso de DETR, el script de exportacion embebe la normalizacion, la decodificacion de cajas y el remapeo de clases dentro del IR, de modo que ambos modelos producen el mismo layout de salida y los mismos identificadores de clase; esto permite que las mismas muestras de OpenVINO y DLStreamer funcionen con cualquiera de los dos. La calibracion INT8 incluida usa una unica imagen de muestra, y la propia model card advierte que en produccion debe sustituirse por un conjunto representativo de fotogramas del sitio de despliegue. No se proporcionan datos sobre el numero de tokens, composicion del dataset de entrenamiento ni sobre fases de RLHF/DPO, ya que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de personas en imagenes y flujos de video, filtrando la clase `person` (clase 0 de COCO).
- Conteo de personas por fotograma para estimar ocupacion.
- Deteccion de aglomeraciones y generacion de alertas cuando el recuento supera un umbral configurable.
- Analitica de flujo de entrada y salida en puertas y tornos.
- Ejecucion en CPU, GPU y NPU de Intel mediante OpenVINO.
- Compatibilidad con pipelines de video de Intel DLStreamer.
- Intercambiabilidad entre YOLO26 y DETR con el mismo layout de salida y los mismos identificadores de clase.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto; es exclusivamente un detector visual.

## Casos de uso

- Ocupacion de andenes: contar pasajeros en espera en plataformas de metro mediante el recuento de la clase `person` por fotograma, lo que permite estimar la ocupacion en tiempo real y alimentar paneles de operacion.
- Flujo de entrada y salida: monitorizar el throughput de peatones en puertas y tornos, agregando los conteos por intervalo para detectar cuellos de botella en horas punta.
- Alertas de aglomeracion: disparar notificaciones cuando el recuento de personas cruza un umbral definido, apoyandose en las variantes `yolo26m` o `yolo26l` para mejorar el recall en escenas densas.
- Seguridad publica en intercambiadores: proporcionar conciencia situacional en nodos de transporte e instalaciones con alta afluencia, desplegando el modelo en NPU para liberar la CPU del equipo.
- Despliegue de alto FPS en el borde: usar `yolo26n` o `yolo26s` en FP16 o INT8 sobre CPU o NPU de Intel para procesar multiples camaras con baja latencia.
- Analitica de aforo en recintos: reutilizar el detector para estimar ocupacion en venues y espacios cerrados, integrandolo en pipelines de DLStreamer existentes.
- Evaluacion de alternativas con licencia permisiva: emplear la variante DETR (Apache-2.0) cuando se prefiera un detector transformer con licencia permisiva, asumiendo un frame rate inferior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo esta pensado para ejecucion en CPU, GPU y NPU de Intel mediante OpenVINO; no se publican cifras de memoria.
- GPU recomendadas: no se especifican modelos concretos. El soporte declarado es generico para GPU Intel a traves de OpenVINO.
- Compatibilidad con GPU de consumo: no disponible. No se confirma ni descarta el funcionamiento en GPUs de consumo.
- Precisiones por dispositivo: FP32 en CPU y GPU (no en NPU); FP16 e INT8 en CPU, GPU y NPU.
- Opciones de despliegue: OpenVINO Runtime, OpenVINO GenAI, Intel DLStreamer; exportacion desde Ultralytics (YOLO26) o Transformers y PyTorch (DETR); cuantizacion con NNCF.
- Stack objetivo: DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030 y OpenVINO Runtime 2026.5.0.dev20261030. Requiere Python 3.11 o superior.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Salida | Licencia | Motor | Notas |
|---|---|---|---|---|---|---|
| Crowd Detection (YOLO26) | YOLO26 (CNN en tiempo real) | 640 x 640 | `[1, 300, 6]` | MIT (empaquetado); AGPL-3.0 subyacente | OpenVINO | Maximo throughput en el borde; variantes n/s/m/l |
| Crowd Detection (DETR) | DETR ResNet-50 (transformer, sin NMS) | 800 x 800 | `[1, 100, 6]` | MIT (empaquetado); Apache-2.0 subyacente | OpenVINO | Mas pesado y con menor frame rate; licencia permisiva |
| YOLO26 (Ultralytics original) | YOLO26 | 640 x 640 | no disponible | AGPL-3.0 | PyTorch / Ultralytics | Modelo base sin empaquetado OpenVINO ni filtrado a `person` |
| DETR ResNet-50 (Facebook) | DETR | 800 x 800 | no disponible | Apache-2.0 | PyTorch / Transformers | Modelo base sin empaquetado OpenVINO ni remapeo de clases |

## Limitaciones y advertencias

- La licencia MIT del repositorio empaqueta un modelo base YOLO26 cuya licencia es AGPL-3.0; el uso comercial del pipeline completo puede quedar condicionado por esa licencia subyacente. La variante DETR evita esta restriccion al ser Apache-2.0.
- La calibracion INT8 incluida usa una unica imagen de muestra; la model card advierte que en produccion debe sustituirse por un conjunto representativo de fotogramas del sitio de despliegue para mantener la precision.
- El stack objetivo es una version de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030), no una release estable, lo que implica riesgo de cambios de API y de comportamiento.
- El modelo solo detecta la clase `person`; no reconoce otras clases de COCO ni atributos como genero, edad o direccion de movimiento.
- No se publican cifras de benchmarks ni de latencia/throughput, lo que dificulta estimar el rendimiento antes del despliegue.
- No se documentan sesgos conocidos ni tasas de error en escenas con oclusiones, iluminacion adversa o aglomeraciones extremas.
- El modelo no procesa texto ni lenguaje natural; la etiqueta de idioma `en` no implica capacidades multilingues.
- Requiere Python 3.11 o superior y un entorno virtual creado con `--system-site-packages` para acceder a los paquetes del sistema de OpenVINO y DLStreamer.

## Enlaces

- Hugging Face: https://huggingface.co/Intel/crowd-detection
- YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 (Facebook): https://huggingface.co/facebook/detr-resnet-50
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Paper de DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
