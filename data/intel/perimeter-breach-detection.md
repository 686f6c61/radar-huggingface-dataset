# Intel/perimeter-breach-detection

## Resumen

Perimeter Breach Detection es un paquete de inferencia para OpenVINO publicado por Intel que implementa un caso de uso de analítica de vídeo orientado a la detección de intrusiones en perímetros delimitados por cinta de seguridad amarilla y negra. No se trata de un modelo de lenguaje, sino de un detector de objetos de la clase `person` (clase 0 de COCO) combinado con un tracker multiobjeto y una capa de analítica de zonas (GstAnalytics) que evalúa si el centro de la caja delimitadora de una persona cae dentro de un polígono de exclusión. El resultado es una señal de "brecha de perímetro" lista para integrarse en pipelines de videovigilancia.

El componente de detección se basa en YOLO26 de Ultralytics (variantes `yolo26n`, `yolo26s`, `yolo26m` y `yolo26l`), con DETR (`detr-resnet-50` de Facebook) como alternativa transformer sin NMS. Los pesos se exportan a OpenVINO IR y se pueden cuantizar a INT8 mediante NNCF, con soporte declarado para CPU, GPU y NPU. El repositorio ocupa 0.0 GB según Hugging Face, lo que sugiere que los pesos no se alojan directamente en el Hub sino que se descargan y exportan mediante el script `export_and_quantize.sh`.

Su relevancia actual radica en que empaqueta un caso de uso completo (detección + tracking + lógica de zona) sobre el stack Intel DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0, apuntando a despliegues en el borde (edge AI) para entornos metro ferroviarios, obras y recintos industriales. La licencia del repositorio es MIT, aunque conviene revisar la licencia de los pesos base (YOLO26 es AGPL-3.0; DETR es Apache-2.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO26 (CNN, Ultralytics) o DETR ResNet-50 (transformer, sin NMS); tracker multiobjeto y analítica de zonas GstAnalytics |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de visión) |
| Tipos de cuantizacion | FP32, FP16, INT8 (mixed-precision vía NNCF post-training quantization) |
| Idiomas soportados | en (metadatos del repositorio) |
| Licencia | MIT (repositorio); pesos base: AGPL-3.0 (YOLO26) o Apache-2.0 (DETR) |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); exportación desde PyTorch (Ultralytics o Transformers) |

## Arquitectura y entrenamiento

El pipeline combina tres etapas. La primera es un detector: por defecto YOLO26 en sus variantes n/s/m/l con entrada de 640 x 640 y salida `[1, 300, 6]`, o bien DETR ResNet-50 con entrada de 800 x 800 y salida `[1, 100, 6]`. El script de exportación embebe en el IR de OpenVINO la normalización, la decodificación de cajas y el remapeo de clases de DETR, de modo que ambos modelos producen el mismo layout de salida y los mismos identificadores de clase, lo que permite intercambiarlos con una constante `MODEL` en los ejemplos. La segunda etapa es un tracker multiobjeto que asigna identificadores persistentes entre fotogramas. La tercera es la analítica de zona de GstAnalytics, que comprueba si el centro de la persona cae dentro de un polígono que traza la cinta de seguridad.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens (no aplica), ni sobre fases de RLHF o DPO. El modelo base YOLO26 se entrena sobre COCO según la documentación referenciada de Ultralytics, y la clase detectada se limita a `person` (clase 0 de COCO). La innovación técnica destacable es la cuantización INT8 con NNCF y la integración con DLStreamer para acelerar la inferencia en CPU, GPU y NPU de Intel. El stack objetivo es una release candidate (DLStreamer 2026.3.0 RC1 con OpenVINO 2026.5.0.0.dev20261030), no una versión estable.

## Capacidades

- Detección de personas (clase `person` de COCO) en vídeo, con variantes de distinto tamaño para equilibrar precisión y velocidad.
- Tracking multiobjeto con identificadores persistentes entre fotogramas.
- Analítica de zona: evaluación de pertenencia del centro de la caja a un polígono de exclusión definido sobre la imagen.
- Generación de alertas de brecha de perímetro cuando una persona entra en la zona restringida.
- Ejecución en CPU, GPU y NPU mediante OpenVINO, con precisión configurable (FP32, FP16, INT8).
- Integración con pipelines de Intel DLStreamer y GstAnalytics para procesamiento de vídeo en tiempo real.
- Alternativa de detector transformer (DETR) con licencia permisiva Apache-2.0.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto ni capacidades multimodales más allá de la visión.

## Casos de uso

- Protección de línea de vallado en depósitos, patios ferroviarios y subestaciones: el detector identifica personas y el tracker mantiene su identidad mientras el módulo de zona comprueba si cruzan la barrera, disparando una alerta en el momento del cruce.
- Seguridad en instalaciones de transporte: monitorización de muelles de carga, andenes y bahías de mantenimiento delimitados con cinta, donde el polígono de exclusión se ajusta a la geometría de la cinta en la imagen de la cámara.
- Seguridad en zonas de obra: alerta cuando un trabajador o un viandante entra en un área de peligro señalizada cerca de equipos o de trabajos en vía, usando `yolo26n` o `yolo26s` para mantener FPS altos en hardware de borde.
- Aplicación de áreas restringidas: detección de entradas en perímetros de distanciamiento marcados con cinta, con registro del identificador de tracking para auditar la trayectoria de la persona infractora.
- Despliegue en edge con NPU o iGPU Intel: al exportar a INT8 y ejecutar sobre OpenVINO, el pipeline puede correr en dispositivos de bajo consumo en campo, sin depender de un servidor central.
- Integración en plataformas de videovigilancia existentes: al usar DLStreamer y GstAnalytics, el componente se inserta en pipelines GStreamer ya desplegados para añadir la lógica de zona sin reescribir la captura y el transporte de vídeo.
- Sustitución por DETR en entornos con requisitos de licencia permisiva: cuando la AGPL-3.0 de YOLO26 no es aceptable, se selecciona `detr-resnet-50` (Apache-2.0) manteniendo el mismo layout de salida y los mismos ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una matriz de validación de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un detector de una sola clase con entrada de 640 x 640 (YOLO26) u 800 x 800 (DETR), el consumo de memoria es bajo en comparación con modelos generativos, pero no se publican cifras concretas.
- Hardware soportado: CPU, GPU y NPU de Intel mediante OpenVINO.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090 u otras) en la información disponible; el enfoque es edge AI sobre hardware Intel.
- Cabe en GPU de consumo: no disponible como dato verificado; el diseño apunta a hardware de borde, lo que sugiere que las variantes pequeñas (`yolo26n`, `yolo26s`) están pensadas para dispositivos de baja potencia.
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer con GstAnalytics, exportación vía Ultralytics o Transformers y cuantización con NNCF. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. La model card indica que las variantes pequeñas corren a "high FPS" en hardware de borde, sin cifras concretas.
- Versiones del stack: Python 3.11+, DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030 (release candidate, no estable).

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (default en este repo) | CNN detector | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Máximo throughput en edge; variantes n/s/m/l |
| DETR ResNet-50 (alternativa en este repo) | Transformer detector sin NMS | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Más pesado y con menor frame rate; licencia permisiva |
| Otros detectores de personas genéricos | no disponible | no disponible | no disponible | no disponible | No se proporcionan comparativas con modelos de terceros |

La comparativa se limita a las dos opciones incluidas en el propio repositorio, ya que la información disponible no incluye datos de rendimiento frente a detectores alternativos.

## Limitaciones y advertencias

- Modelo de visión de una sola clase: solo detecta `person` (clase 0 de COCO); no reconoce vehículos, animales ni otros objetos.
- Dependencia de la geometría de la cámara: el polígono de zona se define sobre la imagen y asume una vista fija; cambios de encuadre o de perspectiva invalidan la configuración.
- La lógica de brecha se basa en el centro de la caja delimitadora, lo que puede producir falsos positivos o negativos en personas parcialmente ocluidas o en los bordes del polígono.
- Stack en release candidate: DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030 son versiones de desarrollo, no estables, con riesgo de cambios de API y de comportamiento.
- Licencia: el repositorio es MIT, pero los pesos de YOLO26 son AGPL-3.0, lo que impone obligaciones de copyleft en despliegues comerciales si se usa esa variante; DETR (Apache-2.0) evita esa restricción a costa de menor rendimiento.
- Idiomas: los metadatos declaran únicamente `en`; no hay soporte multilingüe declarado (aunque el modelo no procesa texto).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsas detecciones y de alertas espurias por oclusiones, cambios de iluminación o movimiento de la cinta de señalización.
- No se publican métricas de precisión, recall ni FPS en la información disponible, lo que dificulta la validación previa al despliegue en producción.
- No se han documentado sesgos específicos del modelo en la información proporcionada.

## Enlaces

- [Hugging Face: Intel/perimeter-breach-detection](https://huggingface.co/Intel/perimeter-breach-detection)
- [Documentación de YOLO26 (Ultralytics)](https://docs.ultralytics.com/models/yolo26/)
- [DETR ResNet-50 en Hugging Face (Facebook)](https://huggingface.co/facebook/detr-resnet-50)
- [Paper de DETR (arXiv:2005.12872)](https://arxiv.org/abs/2005.12872)
- [Instalación de OpenVINO](https://docs.openvino.ai/2026/get-started/install-openvino.html)
- [Instalación de Intel DLStreamer](https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html)
- [Centro de descargas de Intel](https://www.intel.fr/content/www/fr/fr/download-center/home.html)
- [Intel Corporation (Wikipedia)](https://fr.wikipedia.org/wiki/Intel)
