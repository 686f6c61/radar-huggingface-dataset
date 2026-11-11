# Intel/heatmap-generation

## Resumen

Heatmap Generation es un caso de uso de analitica de metro (transporte urbano) publicado por Intel en Hugging Face. No se trata de un modelo de lenguaje, sino de un pipeline de deteccion de objetos y agregacion de mapas de calor de velocidad: detecta objetos en cada fotograma de video y colorea cada region de la escena segun la velocidad a la que se desplaza el trafico. El resultado es una capa superpuesta codificada por color (rojo para trafico rapido, amarillo/verde para velocidad media, azul para trafico lento o detenido).

El componente de deteccion se construye sobre YOLO26 de Ultralytics (variantes `yolo26n`, `yolo26s`, `yolo26m` y `yolo26l`), con DETR (`detr-resnet-50` de Facebook) como alternativa basada en transformer y sin NMS. Los pesos se exportan a OpenVINO IR y se cuantizan a INT8 mediante NNCF para inferencia eficiente en CPU, GPU y NPU de Intel. El repositorio ocupa aproximadamente 0,1 GB y esta etiquetado con licencia MIT.

Su relevancia actual radica en el despliegue en el borde (edge AI): forma parte del stack Intel DLStreamer 2026.3.0 RC1 junto con OpenVINO GenAI 2026.5.0.0.dev20261030, lo que permite ejecutar analitica de video en tiempo real sobre hardware Intel sin depender de aceleradores dedicados. Es una pieza practica para equipos que construyen soluciones de movilidad, seguridad vial o analisis de flujos peatonales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos YOLO26 (CNN, Ultralytics) o DETR ResNet-50 (transformer, sin NMS); agregacion de heatmap por desplazamiento entre fotogramas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP32, FP16, INT8 (cuantizacion post-entrenamiento con NNCF) |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo no procesa texto) |
| Licencia | MIT (repositorio); los pesos base YOLO26 son AGPL-3.0 y DETR es Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); exportacion desde PyTorch (Ultralytics y Hugging Face Transformers) |

## Arquitectura y entrenamiento

El pipeline combina dos etapas. La primera es un detector de objetos: por defecto YOLO26, un detector en tiempo real de la familia Ultralytics con variantes de distinto tamano (`n`, `s`, `m`, `l`), entrada de 640 x 640 y salida de tensor `[1, 300, 6]`. Como alternativa se ofrece DETR ResNet-50, un detector basado en transformer, sin supresion de no maximos, con entrada de 800 x 800 y salida `[1, 100, 6]`; el script de exportacion incorpora la normalizacion, la decodificacion de cajas y el remapeo de clases dentro del IR de OpenVINO, de modo que ambos modelos producen el mismo formato de salida y los mismos identificadores de clase. La segunda etapa estima la velocidad a partir del desplazamiento por fotograma de cada deteccion, lo deposita sobre la huella del objeto y lo promedia por localizacion con suavizado gaussiano para generar la capa coloreada.

No se dispone de informacion sobre el volumen de datos de entrenamiento ni sobre el proceso de ajuste, ya que el repositorio reutiliza pesos preentrenados en COCO (80 clases) y no entrena un modelo nuevo. La innovacion tecnica destacable es la conversion a OpenVINO IR con cuantizacion INT8 mediante NNCF, que habilita inferencia en CPU, GPU y NPU de Intel, y la integracion con DLStreamer para procesamiento de video por etapas.

## Capacidades

- Deteccion de objetos sobre las 80 clases de COCO en flujos de video.
- Estimacion de velocidad por objeto a partir del desplazamiento entre fotogramas consecutivos.
- Generacion de mapas de calor de velocidad con suavizado gaussiano y esquema de color rojo (rapido), amarillo/verde (medio) y azul (lento o estacionario).
- Seguimiento implicito de objetos entre fotogramas para calcular desplazamientos.
- Ejecucion en CPU, GPU y NPU de Intel mediante OpenVINO.
- Cuantizacion INT8 con NNCF para maximizar el rendimiento en el borde.
- Seleccion entre dos detectores (YOLO26 y DETR) con la misma interfaz de salida.
- Integracion con Intel DLStreamer para pipelines de analitica de video.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidad de texto; es exclusivamente vision por computador.

## Casos de uso

- Mapa de velocidad del trafico: procesar grabaciones de camaras de trafico y generar una capa coloreada que identifique corredores rapidos y carriles congestionados; la variante `yolo26n` o `yolo26s` permite alta tasa de fotogramas en dispositivos de borde.
- Deteccion de congestion: identificar zonas persistentemente azules (velocidad baja) para planificacion de seguridad vial y priorizacion de intervenciones.
- Analisis de flujo peatonal: comparar vias de paso rapido con areas de permanencia en estaciones de metro o intercambiadores, usando la velocidad estimada por desplazamiento.
- Deteccion de incidentes: marcar movimientos inusualmente rapidos o detenidos que puedan indicar accidentes, vehiculos averiados o comportamientos anomalos.
- Analitica en el borde para ciudades: desplegar el pipeline en hardware Intel (CPU, GPU integrada o NPU) en farolas o armarios de comunicaciones, sin enviar video a la nube.
- Monitorizacion de aparcamientos y zonas de carga: distinguir vehiculos estacionarios (azul) de trafico en movimiento para gestion de ocupacion.
- Integracion en plataformas de video analitico: usar DLStreamer para encadenar deteccion, seguimiento y agregacion de heatmap en un pipeline reproducible con OpenVINO.
- Evaluacion comparativa de detectores: emplear el mismo codigo de muestra con YOLO26 y DETR para medir throughput y recall en el hardware objetivo antes de decidir el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un detector de objetos y no un modelo de lenguaje, los requisitos dependen de la variante elegida; las variantes `yolo26n` y `yolo26s` estan pensadas para despliegue de alto FPS en el borde.
- GPU recomendadas: no se especifican modelos concretos; la model card indica soporte para CPU, GPU y NPU de Intel.
- Compatibilidad de precision por dispositivo: FP32 en CPU y GPU (no en NPU); FP16 en CPU, GPU y NPU; INT8 en CPU, GPU y NPU.
- Cabe en GPU de consumo: no disponible como dato explicito; el enfasis del repositorio es el despliegue en hardware Intel integrado y de borde.
- Opciones de despliegue: OpenVINO Runtime, OpenVINO GenAI, Intel DLStreamer y scripts de exportacion propios (`export_and_quantize.sh`).
- Stack requerido: Python 3.11 o superior, OpenVINO, Intel DLStreamer 2026.3.0 RC1 y OpenVINO GenAI 2026.5.0.0.dev20261030 (entorno de desarrollo, no version estable).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (por defecto) | Detector CNN en tiempo real | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Maximo throughput en el borde; variantes `n`, `s`, `m`, `l` |
| DETR ResNet-50 (alternativa) | Detector transformer sin NMS | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Mas pesado y con menor tasa de fotogramas; licencia permisiva |
| Heatmap Generation (este repositorio) | Pipeline de deteccion + agregacion de velocidad | Segun detector | Capa de heatmap coloreada | MIT (repositorio) | Envuelve ambos detectores con la misma interfaz de salida |

No se dispone de comparativas con otros pipelines de generacion de heatmaps de trafico en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia MIT del repositorio no cubre los pesos base: YOLO26 se distribuye bajo AGPL-3.0, lo que impone obligaciones de copyleft para uso en red y puede condicionar el uso comercial. DETR, bajo Apache-2.0, es la opcion si se requiere una licencia permisiva.
- La estimacion de velocidad se basa en el desplazamiento por fotograma, no en calibracion metrologica de la escena; las velocidades son relativas y dependen de la tasa de fotogramas y de la perspectiva de la camara.
- El detector se limita a las 80 clases de COCO; objetos fuera de ese conjunto no se detectan ni contribuyen al heatmap.
- El stack requerido (DLStreamer 2026.3.0 RC1 y OpenVINO GenAI 2026.5.0.0.dev20261030) es una version de desarrollo, no una release estable, con el riesgo de cambios de API y menor soporte.
- FP32 no esta soportado en NPU, lo que restringe la precision en ese dispositivo.
- Riesgo de falsos positivos y de oclusiones en escenas densas, con impacto directo en el mapa de velocidad agregado.
- No se han publicado evaluaciones de sesgo ni de robustez en condiciones de iluminacion adversas, lluvia o vision nocturna.
- El repositorio tiene un numero muy bajo de descargas (21) y ningun "like", lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/heatmap-generation
- Documentacion de YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 en Hugging Face: https://huggingface.co/facebook/detr-resnet-50
- Paper de DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
