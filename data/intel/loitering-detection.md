# Intel/loitering-detection

## Resumen

Loitering Detection es un caso de uso de analítica de vídeo para entornos de metro publicado por Intel en Hugging Face. No es un modelo entrenado desde cero, sino un pipeline empaquetado que combina un detector de personas (YOLO26 de Ultralytics por defecto, o DETR de Facebook como alternativa) con un tracker multiobjeto y el elemento `gvaanalytics` de DLStreamer, que define zonas poligonales de interés y adjunta metadatos `GstAnalyticsZoneMtd` a cada persona rastreada. Una sonda en Python acumula el tiempo de permanencia por individuo y dispara un evento de merodeo cuando se supera un umbral configurable.

El paquete se distribuye como modelo OpenVINO en formato IR, listo para ejecutarse en CPU, GPU y NPU de Intel, con soporte de precisiones FP32, FP16 e INT8 mediante cuantización post-entrenamiento con NNCF. Está pensado para despliegues en el borde (edge AI) en estaciones, andenes, salas técnicas, cajeros automáticos y pasillos de evacuación, donde interesa detectar presencia prolongada en zonas restringidas sin enviar vídeo a la nube.

Su relevancia actual radica en que ejemplifica el patrón de analítica de vídeo con metadatos espacio-temporales sobre hardware Intel, integrando detección, seguimiento y reglas de negocio en un único flujo DLStreamer/GStreamer. El repositorio es de tamaño mínimo (0,0 GB) porque los pesos se descargan y exportan mediante el script incluido, no se almacenan en el propio repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de detección + tracking + analítica de zonas; detector base YOLO26 (Ultralytics) o DETR ResNet-50 (Facebook) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16, INT8 (cuantización mixta con NNCF) |
| Idiomas soportados | en (etiquetas y documentación) |
| Licencia | MIT (el paquete); YOLO26 subyacente AGPL-3.0; DETR Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); exportación desde PyTorch (Ultralytics o Transformers) |

## Arquitectura y entrenamiento

El pipeline no entrena un modelo nuevo: reutiliza detectores preentrenados en COCO y los exporta a OpenVINO IR. Por defecto emplea YOLO26 en sus variantes `yolo26n`, `yolo26s`, `yolo26m` y `yolo26l`, con entrada de 640 x 640 y salida `[1, 300, 6]`. Como alternativa ofrece DETR ResNet-50, un detector transformer sin NMS, con entrada de 800 x 800 y salida `[1, 100, 6]`; el script de exportación incrusta en el IR la normalización, la decodificación de cajas y el remapeo de clases, de modo que ambos modelos producen el mismo layout de salida y los mismos identificadores de clase. Solo se explota la clase `person` (clase 0 de COCO).

Sobre la detección se añade un tracker multiobjeto que asigna identificadores persistentes entre fotogramas, y el elemento `gvaanalytics` de DLStreamer gestiona la zona de interés poligonal. La lógica de merodeo se implementa en una sonda Python que lee los metadatos `GstAnalyticsZoneMtd` y acumula el dwell time por persona. La cuantización INT8 se realiza con NNCF sobre fotogramas del vídeo de ejemplo `VIRAT_S_000101.mp4`; la model card advierte explícitamente de que en producción debe recalibrarse con un conjunto representativo del dominio objetivo.

## Capacidades

- Detección de personas en vídeo en tiempo real (clase `person` de COCO).
- Seguimiento multiobjeto con identificadores persistentes entre fotogramas.
- Definición de zonas de interés poligonales y asociación automática de metadatos de zona a cada persona rastreada.
- Acumulación de tiempo de permanencia (dwell time) por individuo y disparo de eventos al superar un umbral configurable.
- Ejecución en CPU, GPU y NPU de Intel mediante OpenVINO, con FP32, FP16 e INT8.
- Integración en pipelines GStreamer/DLStreamer, lo que permite encadenar fuentes de vídeo, inferencia y consumidores de eventos.
- Alternativa de detector transformer (DETR) con licencia permisiva para entornos que no aceptan AGPL.
- No incluye capacidades de lenguaje, tool calling, agentes ni multimodalidad texto-imagen.

## Casos de uso

- Monitorización de áreas restringidas en estaciones: el pipeline detecta personas que permanecen junto a vías, cuartos de equipos o zonas de acceso vetado más allá del umbral de dwell time, generando alertas para el centro de control.
- Seguridad en el borde del andén: se define un polígono sobre la franja amarilla y se alerta cuando alguien permanece dentro más de lo esperado, aprovechando el tracking para no duplicar eventos por persona.
- Vigilancia de cajeros automáticos y máquinas expendedoras: se detecta presencia sospechosa o prolongada en kioscos desatendidos, con la ventaja de que el procesamiento ocurre en el dispositivo y no se transmite vídeo a la nube.
- Control de pasillos y salidas de emergencia: se monitorizan zonas que deben permanecer libres y se emiten avisos cuando alguien se estaciona en ellas, útil en horarios de baja afluencia.
- Despliegue en hardware de borde Intel: al soportar NPU e INT8, el pipeline puede ejecutarse en equipos de bajo consumo en la propia estación, reduciendo ancho de banda y latencia frente a soluciones centralizadas.
- Integración en sistemas de videovigilancia existentes: al basarse en GStreamer/DLStreamer, los eventos pueden publicarse en MQTT, Kafka o un VMS mediante los consumidores habituales del ecosistema, sin reescribir la capa de captura.
- Prototipado rápido de analítica de zonas: el script `export_and_quantize.sh` permite pasar de pesos PyTorch a IR cuantizado en INT8 en un solo comando, lo que facilita pruebas de concepto con vídeos propios antes de industrializar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validación de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas de precisión, latencia ni throughput en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de detectores ligeros (variantes `n` y `s` de YOLO26) y de un modelo DETR ResNet-50, el consumo de memoria es moderado, pero no se han publicado cifras.
- GPU recomendadas: no se especifican modelos concretos; la model card indica soporte para CPU, GPU y NPU de Intel a través de OpenVINO.
- Compatibilidad de precisión por dispositivo: FP32 en CPU y GPU (no en NPU); FP16 en CPU, GPU y NPU; INT8 en CPU, GPU y NPU.
- Cabe en GPU de consumo: no confirmado en la información disponible; el enfoque declarado es edge AI sobre hardware Intel, no GPU discretas de consumo.
- Opciones de despliegue: OpenVINO Runtime con DLStreamer 2026.3.0 RC1 y el bundle OpenVINO GenAI 2026.5.0.0.dev20261030; pipelines GStreamer con los elementos `gvaanalytics` y `gstanalytics`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La model card recomienda las variantes `yolo26n` y `yolo26s` para despliegues de alto FPS en el borde, y señala que DETR es más pesado y corre a menor tasa de fotogramas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (variantes n/s/m/l) | Detector CNN | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Máximo throughput en el borde; opción por defecto |
| DETR ResNet-50 | Detector transformer sin NMS | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Más pesado y menor FPS; licencia permisiva |
| Loitering Detection (este paquete) | Pipeline detección + tracking + zonas | Según detector | Eventos de merodeo | MIT (paquete) | Añade tracking persistente y lógica de dwell time sobre los detectores anteriores |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Solo detecta la clase `person`; no reconoce otros objetos ni atributos (edad, género, uniforme, comportamiento).
- El umbral de dwell time y la geometría de la zona deben calibrarse por escenario; una mala configuración genera falsos positivos o negativos.
- La cuantización INT8 se calibra por defecto con fotogramas de `VIRAT_S_000101.mp4`; la model card advierte de que en producción debe sustituirse por un conjunto representativo del dominio, o la precisión puede degradarse.
- El stack objetivo es una versión de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.dev), no una release estable; no se recomienda para producción sin validar.
- La licencia MIT del paquete no cubre el modelo YOLO26 subyacente, que es AGPL-3.0; para uso comercial que no acepte AGPL debe elegirse la variante DETR (Apache-2.0).
- Riesgo de sesgos del detector base: los modelos COCO pueden tener menor precisión en personas con determinadas poses, oclusiones, iluminación nocturna o vestimenta, lo que afecta al tracking y al cálculo de dwell time.
- El seguimiento multiobjeto puede perder identificadores en oclusiones prolongadas o aglomeraciones, fragmentando el cómputo de permanencia.
- El pipeline no incorpora reconocimiento facial ni identificación biométrica; solo tracking anónimo por identificador efímero.
- Idioma de la documentación y etiquetas: inglés.
- No se han publicado métricas de precisión, latencia ni throughput en la información disponible, lo que dificulta estimar el rendimiento real antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/loitering-detection
- Documentación de YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 en Hugging Face: https://huggingface.co/facebook/detr-resnet-50
- Paper de DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
- Guía de instalación de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Página principal de Intel: https://www.intel.com/content/www/us/en/homepage.html
