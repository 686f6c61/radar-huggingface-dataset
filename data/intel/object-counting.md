# Intel/object-counting

## Resumen

Object Counting es un caso de uso de analitica para entornos Metro publicado por Intel en Hugging Face. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un pipeline de deteccion de objetos empaquetado como artefacto OpenVINO que detecta objetos en imagenes o fotogramas de video y agrega el recuento por clase sobre las 80 categorias de COCO. La implementacion se apoya en YOLO26 de Ultralytics como detector base por defecto, con DETR (facebook/detr-resnet-50) como alternativa transformer sin NMS, y anade una capa fina de agregacion que mantiene la precision del detector subyacente y permite reutilizarlo entre clases.

El paquete se distribuye como modelo OpenVINO IR con soporte para FP32, FP16 e INT8 mediante cuantizacion post-entrenamiento con NNCF, y esta pensado para ejecutarse en CPU, GPU y NPU de Intel a traves de OpenVINO Runtime y DLStreamer. Las variantes disponibles de YOLO26 (n, s, m, l) permiten ajustar el compromiso entre throughput y recall: las mas pequenas para despliegues de alto FPS en el borde y las mayores para objetos pequenos o lejanos.

Su relevancia actual radica en que cubre un patron de despliegue muy comun en videovigilancia e infraestructura urbana (ocupacion de andenes, conteo de vehiculos en intersecciones, inventario en zonas delimitadas) con un stack de inferencia especifico para hardware Intel y una licencia MIT para el artefacto publicado, aunque el detector YOLO26 subyacente se distribuya bajo AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO26 (Ultralytics, por defecto) o DETR ResNet-50 (alternativa); capa de agregacion de conteo por clase |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 640x640 en YOLO26, 800x800 en DETR) |
| Tipos de cuantizacion | FP32, FP16, INT8 (cuantizacion post-entrenamiento con NNCF) |
| Idiomas soportados | en (etiquetas de clase en ingles) |
| Licencia | MIT (artefacto publicado); YOLO26 subyacente AGPL-3.0; DETR Apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml / .bin); pesos fuente PyTorch via Ultralytics o Hugging Face Transformers |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: envuelve un detector preentrenado en COCO y le anade una capa de agregacion que cuenta detecciones por clase en cada imagen o fotograma. La ruta por defecto usa YOLO26, un detector en tiempo real de Ultralytics con salida `[1, 300, 6]` para entrada 640x640. La ruta alternativa emplea DETR ResNet-50, un detector transformer sin NMS con salida `[1, 100, 6]` para entrada 800x800; el script de exportacion integra en el IR de OpenVINO la normalizacion, la decodificacion de cajas y el remapeo de clases de DETR, de modo que ambos modelos producen el mismo layout de salida y los mismos identificadores de clase, lo que permite intercambiarlos sin cambiar el codigo de la aplicacion.

El flujo de preparacion descarga los pesos PyTorch originales, exporta a OpenVINO IR en FP16 por defecto y, opcionalmente, aplica cuantizacion INT8 de mixed-precision con NNCF. El stack objetivo es DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030 y OpenVINO Runtime 2026.5.0.dev20261030, una combinacion de desarrollo y no una release estable. No se documentan en la informacion disponible los volumenes de datos de entrenamiento, la composicion del dataset ni si hubo ajuste fino adicional: se heredan los pesos COCO de los detectores base.

## Capacidades

- Deteccion de objetos sobre las 80 clases de COCO en imagenes sueltas y en fotogramas de video.
- Recuento agregado por clase: devuelve cuantas instancias de cada categoria aparecen en la imagen o en cada fotograma.
- Ejecucion en CPU, GPU y NPU de Intel mediante OpenVINO Runtime.
- Soporte de precisiones FP32, FP16 e INT8 con cuantizacion NNCF.
- Integracion con DLStreamer para pipelines de video en tiempo real.
- Intercambio de detector (YOLO26 o DETR) sin cambios en el codigo consumidor gracias al layout de salida unificado.
- No incluye tool calling, function calling, razonamiento multi-paso ni generacion de texto: es un componente de vision, no un modelo de lenguaje.
- No soporta audio ni modalidad de texto; el unico idioma de etiquetas es el ingles.

## Casos de uso

- Ocupacion de andenes y salas de espera: el pipeline cuenta detecciones de la clase `person` por fotograma y agrega los conteos en series temporales para estimar aforo y ocupacion media en franjas horarias; encaja porque el conteo por clase es la operacion nativa del artefacto.
- Conteo de vehiculos en intersecciones: se cuentan `car`, `bus` y `truck` por fotograma para metricas de throughput; las variantes `yolo26n` y `yolo26s` permiten sostener alto FPS en dispositivos de borde.
- Inventario en zona delimitada: recuento de `bottle`, `bag` u otros objetos COCO dentro de una region de interes, util para control de stock en almacenes o lineas de produccion.
- Metricas de afluencia en transporte publico: agregacion de conteos por fotograma en series temporales para alimentar dashboards de capacidad y planificacion de frecuencias.
- Analitica de video en el borde sin envio a la nube: al ejecutarse en NPU o GPU integrada Intel con OpenVINO, el procesamiento puede residir en el propio dispositivo, lo que reduce latencia y exposicion de video fuera de la instalacion.
- Prototipado rapido de pipelines de vision: el script de exportacion y cuantizacion permite generar variantes FP16 e INT8 de YOLO26 o DETR en pocos pasos y comparar throughput y recall antes de fijar la configuracion de produccion.
- Deteccion con requisito de licencia permisiva: cuando el proyecto no puede asumir AGPL-3.0, la ruta DETR (Apache-2.0) ofrece un detector transformer con el mismo layout de salida, a costa de menor tasa de fotogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validacion por dispositivo (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero esos valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de detectores de vision de entrada fija (640x640 o 800x800), el consumo de memoria es muy inferior al de un LLM del mismo numero de parametros, pero no se publican cifras concretas.
- GPU recomendadas: no se especifican modelos; la model card declara soporte generico para GPU Intel a traves de OpenVINO.
- Soporte en NPU: si, declarado explicitamente junto a CPU y GPU.
- Cabe en GPU de consumo: no disponible como dato verificado; el artefacto esta orientado a hardware Intel (CPU, GPU integrada, NPU), no a GPU discretas de terceros.
- Opciones de despliegue: OpenVINO Runtime, OpenVINO GenAI y DLStreamer 2026.3.0 RC1. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; la model card indica que las variantes `yolo26n` y `yolo26s` son las recomendadas para despliegue de alto FPS en el borde y que las mayores mejoran el recall en objetos pequenos o lejanos, sin cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| Object Counting (YOLO26, por defecto) | Detector + agregacion de conteo | 640x640 | `[1, 300, 6]` | MIT el artefacto; AGPL-3.0 el detector | Maximo throughput en el borde; variantes n, s, m, l |
| Object Counting (DETR ResNet-50) | Detector transformer sin NMS + agregacion | 800x800 | `[1, 100, 6]` | MIT el artefacto; Apache-2.0 el detector | Mas pesado y menor tasa de fotogramas; licencia permisiva |
| YOLO26 (Ultralytics, sin envoltorio) | Detector | 640x640 | salida propia de Ultralytics | AGPL-3.0 | Requiere implementar el conteo por clase en la aplicacion |
| DETR ResNet-50 (facebook) | Detector transformer | 800x800 | salida propia de Transformers | Apache-2.0 | Requiere decodificacion de cajas y remapeo de clases propios |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El artefacto hereda los sesgos y los errores del detector base y del dataset COCO; no se documenta ninguna evaluacion de sesgo en la informacion disponible.
- Riesgo de falsos positivos y negativos inherente a la deteccion: objetos ocluidos, de pequeno tamano o lejanos pueden no contarse, y las variantes mayores solo mitigan parcialmente este problema.
- El conteo es por fotograma, no por identidad: no hay tracking, por lo que un mismo objeto puede contarse repetidamente a lo largo del video. Para conteos direccionales con cruce de linea, la model card remite al caso de uso `vehicle-entry-exit-logging`.
- Solo se cubren las 80 clases de COCO; objetos fuera de ese vocabulario no se detectan ni se cuentan.
- Etiquetas y documentacion unicamente en ingles.
- La licencia MIT del artefacto no cubre el detector YOLO26 subyacente, que es AGPL-3.0; un uso comercial sobre la ruta YOLO26 requiere revisar las obligaciones de esa licencia o optar por la ruta DETR (Apache-2.0).
- El stack objetivo es una release candidate de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030), no una version estable; no es recomendable como base de produccion sin validacion previa.
- El repositorio ocupa 0.0 GB y registra 19 descargas y 1 like, lo que indica una adopcion muy baja y poca validacion externa.
- El script de exportacion descarga pesos y videos de ejemplo de terceros; en entornos sin salida a Internet o con proxies restrictivos habra que preparar esos artefactos de antemano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/object-counting
- Documentacion de YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 en Hugging Face: https://huggingface.co/facebook/detr-resnet-50
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Guia de instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Video de ejemplo person-bicycle-car-detection: https://github.com/intel-iot-devkit/sample-videos/blob/master/person-bicycle-car-detection.mp4
- Paper de DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
