# Intel/vehicle-entry-exit-logging

## Resumen

Vehicle Entry/Exit Logging es un paquete de inferencia publicado por Intel en Hugging Face bajo el pipeline de detección de objetos. No es un modelo fundacional entrenado desde cero, sino un artefacto de despliegue que combina un detector de vehículos (YOLO26 de Ultralytics por defecto, con DETR ResNet-50 como alternativa) con una capa fina de post-procesado que realiza seguimiento multi-objeto mediante BoT-SORT y registro de eventos direccionales cuando un vehículo cruza una línea virtual configurable. El resultado se exporta a OpenVINO IR y se cuantiza a INT8 con NNCF para ejecutarse en CPU, GPU y NPU de Intel.

El caso de uso declarado es Metro Analytics: gestión de aparcamientos, analítica de peajes, monitorización de flotas y análisis de flujo direccional en intersecciones. El modelo detecta únicamente cuatro clases del conjunto COCO (coche, motocicleta, autobús y camión) y está pensado para despliegues de borde de alto FPS, con variantes que van desde `yolo26n` hasta `yolo26l` para equilibrar latencia y recall en vehículos lejanos.

La relevancia actual radica en su enfoque "short-term imageless": el seguimiento y el cruce de línea se resuelven como post-procesado determinista sobre las detecciones, evitando dependencias de modelos generativos y facilitando la integración con Intel DLStreamer 2026.3.0 RC1. El repositorio tiene un tamaño declarado de 0,0 GB, lo que sugiere que los pesos se generan en tiempo de exportación mediante el script incluido en lugar de distribuirse como binarios en el repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO26 (Ultralytics) o DETR ResNet-50 (alternativa), con post-procesado de tracking BoT-SORT y cruce de línea |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16, INT8 (post-training quantization con NNCF) |
| Idiomas soportados | en (etiquetas y documentación) |
| Licencia | MIT (repo); los pesos base YOLO26 son AGPL-3.0 y DETR es Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); exportación desde PyTorch (Ultralytics / Transformers) |
| Entrada | 640 x 640 (YOLO26) o 800 x 800 (DETR) |
| Salida | `[1, 300, 6]` (YOLO26) o `[1, 100, 6]` (DETR) |
| Clases detectadas | `car` (2), `motorcycle` (3), `bus` (5), `truck` (7) |
| Hardware soportado | CPU, GPU, NPU Intel |
| Motor de inferencia | OpenVINO (con DLStreamer 2026.3.0 RC1) |

## Arquitectura y entrenamiento

El componente de detección es YOLO26, un detector en tiempo real de la familia Ultralytics que sigue el linaje de las arquitecturas YOLO con backbone convolucional y cabeza de predicción densa. Como alternativa se ofrece DETR ResNet-50, un detector transformer sin NMS entrenado sobre COCO y publicado bajo Apache-2.0; el script de exportación embebe la normalización, la decodificación de cajas y el remapeo de clases dentro del IR de OpenVINO, de modo que ambos modelos producen el mismo layout de salida y los mismos identificadores de clase. Esto permite intercambiar el detector con una constante `MODEL` en los ejemplos sin tocar el resto del pipeline.

No se especifican en la información disponible los detalles de entrenamiento propios (número de tokens, composición del dataset, RLHF/DPO), porque el paquete no entrena un modelo nuevo: reutiliza pesos preentrenados sobre COCO y añade lógica de seguimiento. La innovación técnica destacable es la separación estricta entre detección y analítica: el tracking BoT-SORT y la lógica de cruce de línea se ejecutan como capa de post-procesado determinista, lo que mantiene el sistema extensible a otras formas de zona (polígonos, regiones) y permite cuantización INT8 agresiva sin degradar la lógica de eventos. El flujo de exportación usa NNCF para cuantización post-entrenamiento y produce un IR listo para CPU, GPU o NPU.

## Capacidades

- Detección de vehículos en cuatro clases COCO: coche, motocicleta, autobús y camión.
- Seguimiento multi-objeto entre fotogramas con BoT-SORT, asignando identificadores de track estables.
- Registro de eventos de entrada y salida direccionales al cruzar una línea virtual configurable, con marca de tiempo de reloj de pared dentro del vídeo.
- Procesamiento de vídeo en streaming a través de Intel DLStreamer, con soporte de CPU, GPU y NPU.
- Cuantización INT8 con NNCF para maximizar throughput en hardware Intel.
- Intercambio de detector (YOLO26 o DETR) sin cambios en el pipeline de analítica.
- Variantes de tamaño (`yolo26n`, `yolo26s`, `yolo26m`, `yolo26l`) para ajustar latencia frente a recall en vehículos lejanos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un componente de visión por computador, no un modelo de lenguaje.

## Casos de uso

- Gestión de aparcamientos: contar vehículos que entran y salen de un lote mediante una línea virtual en la entrada; la variante `yolo26n` en INT8 permite procesar varias cámaras por dispositivo de borde.
- Analítica de peajes: registrar cada vehículo que cruza el punto de peaje con su identificador de track y marca temporal, generando un log direccional apto para conciliación de tarifas.
- Monitorización de flotas y depósitos: contabilizar entradas y salidas de autobuses y camiones en un depósito, usando `yolo26m` o `yolo26l` si los vehículos aparecen a distancia.
- Análisis de flujo direccional en intersecciones: medir el volumen de vehículos por sentido colocando líneas virtuales ortogonales; la salida `[1, 300, 6]` facilita el post-procesado por frame.
- Despliegue en infraestructura Intel existente: al exportarse a OpenVINO IR y validarse en CPU, GPU y NPU, se integra en equipos de borde sin GPU dedicada.
- Sustitución por licencia permisiva: cuando el uso comercial estricto impide AGPL-3.0, se selecciona DETR ResNet-50 (Apache-2.0) manteniendo el mismo pipeline de tracking y cruce de línea, a costa de menor frame rate.
- Prototipado rápido de analítica de tráfico: el script `export_and_quantize.sh` descarga pesos, exporta a IR y cuantiza en un solo paso, lo que permite validar un caso de uso con vídeo de muestra antes de invertir en integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validación de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero esos valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un detector pequeño exportado a OpenVINO IR, el consumo es bajo y depende de la variante (`yolo26n` a `yolo26l`).
- GPU recomendadas: no se listan modelos concretos; la model card declara soporte genérico de CPU, GPU y NPU Intel.
- Compatibilidad por precisión: FP32 funciona en CPU y GPU pero no en NPU; FP16 e INT8 funcionan en CPU, GPU y NPU.
- Cabe en hardware de consumo: sí, siempre que sea Intel con soporte OpenVINO; no se especifican modelos domésticos concretos.
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer 2026.3.0 RC1, exportación vía Ultralytics (YOLO26) o Hugging Face Transformers (DETR) y cuantización con NNCF. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; la model card recomienda `yolo26n` y `yolo26s` para despliegues de borde de alto FPS.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (variantes n/s/m/l) | Detector CNN en tiempo real | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Máximo throughput en borde; opción por defecto |
| DETR ResNet-50 | Detector transformer sin NMS | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Más pesado y con menor frame rate; licencia permisiva |
| Vehicle Entry/Exit Logging (este paquete) | Detector + tracking + cruce de línea | Según detector | Eventos de entrada/salida | MIT (repo) | Añade BoT-SORT y lógica de línea sobre el detector |

No se dispone de datos de benchmarks que permitan comparar precisión o latencia entre estas opciones; la model card solo indica cualitativamente que YOLO26 prioriza throughput y DETR prioriza permisividad de licencia.

## Limitaciones y advertencias

- Solo detecta cuatro clases de vehículos (coche, motocicleta, autobús, camión); no reconoce peatones, matrículas ni otros objetos.
- El tracking es de corto plazo y sin memoria de apariencia a largo plazo ("short-term imageless"), por lo que oclusiones prolongadas pueden fragmentar tracks y duplicar eventos de entrada o salida.
- La lógica de cruce de línea depende de una configuración geométrica correcta; una línea mal situada o una perspectiva de cámara oblicua puede generar falsos positivos.
- La licencia MIT del repositorio no cubre los pesos base: YOLO26 se distribuye bajo AGPL-3.0, lo que impone obligaciones de copyleft en uso comercial y de red; para evitarlo debe seleccionarse DETR (Apache-2.0), con menor rendimiento.
- El stack objetivo es una versión candidata (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev), no una release estable; no se recomienda para producción sin validación previa.
- El repositorio tiene un tamaño declarado de 0,0 GB: los pesos no se distribuyen como binarios y deben generarse ejecutando el script de exportación, lo que añade pasos y dependencias.
- Los idiomas declarados se limitan al inglés en documentación y etiquetas.
- No se han publicado métricas de precisión, recall ni latencia en la información disponible, lo que impide estimar el riesgo de alucinación o de falsos positivos con datos objetivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/vehicle-entry-exit-logging
- Documentación de YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 en Hugging Face: https://huggingface.co/facebook/detr-resnet-50
- Instalación de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalación de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Paper de DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
- Paper de BoT-SORT (arXiv:2206.14651): https://arxiv.org/abs/2206.14651
