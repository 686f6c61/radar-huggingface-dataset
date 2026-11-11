# Intel/worker-safety-detection

## Resumen

Worker Safety Detection es un modelo de detección de objetos especializado en verificar el cumplimiento de equipos de protección individual (EPI) en entornos laborales. Lo desarrolla Intel y se distribuye a través de Hugging Face bajo el identificador `Intel/worker-safety-detection`. Detecta dos clases concretas: `safety_jacket` (chaleco de alta visibilidad) y `safety_helmet` (casco de seguridad). El modelo está entrenado con Intel Geti y exportado como OpenVINO IR en precisión FP32, listo para desplegarse en CPU, GPU y NPU de Intel sin conversión adicional.

El modelo resuelve un problema acotado pero crítico en entornos industriales: la verificación automática de que los trabajadores llevan el EPI obligatorio antes de acceder a zonas activas. Se integra en pipelines de vídeo mediante Intel DLStreamer, con el elemento `gvadetect`, que autodescubre el tipo de modelo en los IR exportados por Geti y aplica el post-procesado y las etiquetas embebidas sin necesidad de un `model-proc` externo.

Es relevante ahora porque forma parte del stack de edge AI de Intel (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5), lo que permite ejecutar inferencia en tiempo real sobre hardware Intel sin GPU dedicada. El repositorio es pequeño (0,1 GB) y la licencia MIT facilita su integración comercial. No es un modelo generativo ni un LLM: es un detector convolucional de dos clases, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado por Intel Geti como OpenVINO IR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | FP32 (incluido); variante INT8 disponible en el directorio de modelos INT8 de Intel Edge AI Resources |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (`model.xml` + binarios); modelo base en FP32 descargable como ZIP |
| Categoría | Object Detection (PPE / Safety Compliance) |
| Modelo base | Worker Safety Gear Detection (Intel Edge AI Resources, entrenado con Geti) |
| Motor de inferencia | OpenVINO |
| Hardware soportado | CPU, GPU, NPU |
| Clases detectadas | `safety_jacket` (clase 0), `safety_helmet` (clase 1) |
| Pipeline | object-detection |
| Librería | openvino |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna de la red (tipo de backbone, número de capas o parámetros) en la información proporcionada. El modelo se describe como un detector de objetos entrenado con Intel Geti, la plataforma de entrenamiento con anotación asistida de Intel, sobre imágenes de seguridad laboral, y exportado como OpenVINO IR. El IR incluye el post-procesado y las etiquetas embebidas, de modo que DLStreamer puede autodescubrir el tipo de modelo sin configuración externa.

No se especifican el número de tokens ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de aumento de datos, destilación o ajuste fino posteriores. La información disponible tampoco detalla el proceso de cuantización a INT8 más allá de la existencia de una variante en el directorio INT8 de Intel Edge AI Resources. El modelo base en FP32 se distribuye como ZIP dentro del repositorio de recursos de Intel Edge AI.

## Capacidades

- Detección de dos clases de EPI: chaleco de alta visibilidad (`safety_jacket`) y casco de seguridad (`safety_helmet`).
- Detección de objetos sobre fotogramas de vídeo, pensada para pipelines de streaming en tiempo real.
- Post-procesado y etiquetas embebidos en el IR, lo que simplifica la integración con `gvadetect`.
- Inferencia en CPU, GPU y NPU de Intel mediante OpenVINO.
- Ejecución sobre vídeo con Intel DLStreamer mediante pipelines de GStreamer.
- Umbral de confianza configurable en el pipeline (el ejemplo usa `threshold=0.4`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un detector visual.
- No dispone de modo thinking, visión generativa, audio ni capacidades multilingües más allá de las etiquetas en inglés.

## Casos de uso

- **Seguridad en obra de construcción**: verificar que todos los trabajadores llevan casco y chaleco antes de entrar en zonas activas. El detector se ejecuta sobre el flujo de una cámara en la entrada y genera una alerta cuando una persona detectada no presenta las clases esperadas.

- **Cumplimiento de EPI en almacenes**: aplicar políticas de protección en muelles de carga y zonas de carretillas elevadoras. El modelo se despliega en un equipo Intel con DLStreamer y analiza el vídeo de las cámaras existentes sin necesidad de GPU dedicada.

- **Monitorización de zonas industriales**: escaneo continuo de cumplimiento en puntos de acceso a instalaciones, con el detector ejecutándose en CPU o NPU para minimizar el coste de hardware por cámara.

- **Generación automatizada de informes de incidentes**: cuando no se detecta `safety_helmet` o `safety_jacket` en una persona identificada, el sistema emite una alerta o registra el evento. El post-procesado embebido facilita conectar la salida del detector con un sistema de tickets o de registro de incidentes.

- **Integración en pipelines de videovigilancia con GStreamer**: usar `gvadetect` con `gvawatermark` para superponer cajas delimitadoras sobre el vídeo y guardar el resultado anotado (el ejemplo genera `output_dlstreamer.mp4` con codificación H.264). Útil para revisión humana posterior.

- **Despliegue en edge con requisitos de latencia baja**: al ejecutarse en NPU con `batch-size=1` y `nireq=4`, el modelo encaja en dispositivos Intel de borde donde no es viable enviar vídeo a la nube por ancho de banda o privacidad.

- **Prototipado rápido de casos de compliance**: el script `export_and_quantize.sh` descarga el modelo y un vídeo de prueba, lo que permite validar el detector en minutos antes de invertir en anotación o reentrenamiento con Geti.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a una matriz de validación de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas de precisión (mAP), latencia ni throughput en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio es de 0,1 GB, pero no se desglosa el tamaño del IR FP32 ni del INT8.
- **GPU recomendadas**: no se especifican modelos concretos. El modelo soporta GPU Intel mediante OpenVINO; el ejemplo de pipeline usa `device=GPU`.
- **CPU y NPU**: soportados explícitamente. Para NPU se recomienda `batch-size=1` y `nireq=4` según el ejemplo de la model card.
- **GPU de consumo**: no disponible. No se confirma compatibilidad con GPU NVIDIA ni AMD; el stack está orientado a hardware Intel.
- **Opciones de despliegue**: OpenVINO Runtime, Intel DLStreamer (elemento `gvadetect` sobre GStreamer), y scripts en Python con `openvino`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. La model card indica que existen mediciones en la matriz de validación de dispositivos, pero no se incluyen en la información proporcionada.
- **Requisitos de software**: Python 3.11+, OpenVINO (última versión), Intel DLStreamer (última versión). El stack objetivo es DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030, marcado como desarrollo y no como release estable.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de detección de EPI ni datos de rendimiento que permitan una comparación rigurosa con alternativas como YOLO-based PPE detectors u otros modelos de Intel Edge AI Resources.

## Limitaciones y advertencias

- **Alcance muy restringido**: solo detecta dos clases (`safety_jacket` y `safety_helmet`). No detecta otros EPI como guantes, gafas, calzado de seguridad o protección auditiva.
- **Dependencia de la lógica de negocio**: el modelo detecta la presencia de EPI, pero la inferencia de "no cumplimiento" (ausencia de detección en una persona) debe implementarse externamente; la model card lo describe como caso de uso, no como salida nativa del modelo.
- **Riesgo de falsos negativos y positivos**: no se publican métricas de precisión, recall ni mAP, por lo que no es posible evaluar la fiabilidad del detector sin una validación propia sobre el dominio objetivo.
- **Sesgos de dominio**: entrenado con imágenes de seguridad laboral de Geti; el rendimiento puede degradarse en condiciones de iluminación, ángulos de cámara, ocluisiones o tipos de EPI distintos a los del dataset de entrenamiento.
- **Idioma**: las etiquetas están en inglés; no hay soporte multilingüe.
- **Stack en estado RC**: el stack objetivo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5 dev) es de desarrollo, no una release estable. No se recomienda para producción sin validar la versión estable correspondiente.
- **Licencia MIT**: permisiva para uso comercial, pero conviene revisar el archivo `LICENSE` del repositorio y las condiciones del modelo base en Intel Edge AI Resources.
- **Sin garantías de precisión para decisiones críticas**: al tratarse de seguridad laboral, las alertas del modelo no deberían sustituir la supervisión humana ni los procedimientos formales de seguridad sin una validación exhaustiva y un análisis de riesgo.
- **Hardware**: orientado a CPU, GPU y NPU Intel; no se documenta soporte para aceleradores de otros fabricantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/worker-safety-detection
- Intel Edge AI Resources (modelo base y modelos INT8): https://github.com/open-edge-platform/edge-ai-resources
- Modelo base Worker Safety Gear Detection (FP32): https://github.com/open-edge-platform/edge-ai-resources/blob/main/models/FP32/worker-safety-gear-detection.zip
- Directorio de modelos INT8: https://github.com/open-edge-platform/edge-ai-resources/tree/main/models/INT8
- Intel Geti: https://geti.intel.com/
- Instalación de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Guía de instalación de Intel DLStreamer (Ubuntu): https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Matriz de validación de dispositivos (referenciada en la model card): `DEVICE_SUPPORT_MATRIX.md` dentro del repositorio del modelo
- Script de ejemplo: `dlstreamer_sample.py` y `export_and_quantize.sh` dentro del repositorio del modelo
