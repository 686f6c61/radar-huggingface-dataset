# Intel/fight-and-violence-detection

## Resumen

Fight and Violence Detection es un caso de uso de analítica para entornos de metro publicado por Intel en Hugging Face, empaquetado como modelo de visión-lenguaje listo para inferencia local. No se trata de un detector entrenado desde cero, sino de un *wrapper* de despliegue sobre Qwen2-VL-2B-Instruct (Alibaba, Apache-2.0), exportado a OpenVINO y comprimido en pesos a INT4 (por defecto) o INT8. El modelo recibe un fotograma y un *prompt* en lenguaje natural del tipo "Is there a physical fight between people in this image?" y devuelve una respuesta sí/no que dispara una alerta en pantalla.

La relevancia actual reside en su enfoque: en lugar de un clasificador estrecho entrenado con un dataset no verificado, reutiliza un VLM generalista y permite reorientar el caso de uso (por ejemplo, vandalismo o aglomeraciones agresivas) editando únicamente el *prompt*, sin reentrenamiento. Está pensado para ejecutarse íntegramente en local sobre un Intel Core Ultra (CPU o GPU), sin NPU, dentro del stack DLStreamer 2026.3.0 RC1 y OpenVINO GenAI 2026.5.0.

El repositorio es pequeño (0,1 GB), con 42 descargas y 1 *like* en el momento de la consulta, licencia MIT y soporte exclusivo de inglés. Es, por tanto, una pieza de referencia y demostración de Intel para despliegue en el *edge*, no un modelo fundamental ni un benchmark de detección de violencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (Qwen2-VL-2B-Instruct) exportado a OpenVINO |
| Parametros totales | 2B (modelo base Qwen2-VL-2B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (por defecto), INT8, FP16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (modelo empaquetado); base Qwen2-VL-2B-Instruct bajo Apache-2.0 |
| Formato de pesos | OpenVINO IR (exportado via optimum-cli); no se distribuyen safetensors ni GGUF en el repo |
| Hardware soportado | CPU y GPU Intel; NPU no soportado |
| Motor de inferencia | OpenVINO GenAI |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2-VL-2B-Instruct, un transformer multimodal con codificador visual y modelo de lenguaje de 2.000 millones de parametros, publicado por Alibaba bajo Apache-2.0. Intel no aporta entrenamiento adicional documentado: el artefacto de este repositorio es una exportación a OpenVINO IR mediante `optimum-cli export openvino` con compresión de pesos por NNCF, más scripts de ejemplo para DLStreamer y OpenVINO GenAI. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación técnica del paquete no está en el modelo, sino en el patrón de despliegue: se muestrea un fotograma cada `FRAME_STRIDE` fotogramas, se envía al VLM junto a un *prompt* corto de violencia, y la respuesta sí/no se mantiene entre muestras y se superpone como banner "VIOLENCE DETECTED" en la parte superior de cada fotograma. Esto reduce la carga computacional en comparación con inferencia por fotograma y mantiene la alerta visualmente estable. El caso de uso es reconfigurable cambiando el *prompt*, sin reentrenar.

## Capacidades

- Detección de violencia y peleas en imágenes y flujos de vídeo mediante *prompt* en lenguaje natural, con respuesta sí/no.
- Clasificación binaria de comportamiento físico agresivo (peleas, reyertas, *sparring*) en fotogramas muestreados.
- Reorientación a comportamientos relacionados (vandalismo, aglomeraciones agresivas) editando el *prompt*, sin reentrenamiento.
- Superposición de alertas en vídeo (banner "VIOLENCE DETECTED") mediante los ejemplos de OpenVINO y DLStreamer.
- Inferencia local en CPU y GPU Intel, sin dependencia de servicios en la nube.
- Capacidades generales heredadas del VLM base (descripción de imagen, respuesta a preguntas visuales) en la medida en que el *prompt* las solicite.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo *thinking*, visión, audio: visión sí (VLM); audio y *thinking* no documentados.

## Casos de uso

- **Seguridad en andenes y vestíbulos de metro**: el modelo analiza fotogramas muestreados de cámaras y dispara una alerta cuando el *prompt* de violencia obtiene respuesta afirmativa, permitiendo respuesta rápida del operador en escaleras, andenes y zonas de tránsito.
- **Monitorización de tornos y taquillas**: detección de confrontaciones físicas en colas y accesos de pago, donde la densidad de personas eleva el riesgo de altercados.
- **Vigilancia de cocheras e instalaciones restringidas**: aplicación del mismo VLM a zonas de acceso limitado y áreas internas, reutilizando el *prompt* de violencia sin reentrenar.
- **Escalado automatizado de incidentes**: al confirmarse violencia, el sistema puede disparar la alerta y la captura de vídeo asociada, integrándose en flujos de operaciones de seguridad.
- **Reorientación a otros comportamientos**: sustituyendo el *prompt* por uno de vandalismo o aglomeración agresiva, el mismo despliegue cubre nuevas políticas de seguridad sin coste de entrenamiento.
- **Prototipado en *edge* sobre Intel Core Ultra**: validación de pipelines de visión-lenguaje en hardware de consumo profesional (CPU/GPU integradas) antes de escalar a flotas mayores, gracias a la cuantización INT4 e INT8.
- **Demostración y evaluación de OpenVINO GenAI + DLStreamer**: referencia para equipos que quieran medir latencia y viabilidad de un VLM de 2B en el *edge* con el stack de Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; el modelo base es de 2B parámetros y el repo ocupa 0,1 GB, por lo que en INT4 el *footprint* de pesos es del orden de 1 GB y en FP16 del orden de 4 GB (estimación a partir del tamaño de parámetros, no dato publicado).
- GPU recomendadas: no se listan modelos concretos; la model card indica soporte de CPU y GPU Intel y descarta NPU.
- Hardware objetivo declarado: Intel Core Ultra (CPU o GPU integrada), ejecución completamente local.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos ~4 GB para FP16 y ~1-2 GB para INT4; no se confirma lista de modelos compatibles.
- Opciones de despliegue: OpenVINO GenAI, Intel DLStreamer (elemento `gvagenai`), exportación vía `optimum-cli export openvino`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Stack de referencia: DLStreamer 2026.3.0 RC1, OpenVINO GenAI 2026.5.0.0.dev20261030, OpenVINO Runtime 2026.5.0.dev20261030, Python 3.11+, FFmpeg.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intel/fight-and-violence-detection | 2B (Qwen2-VL-2B) | no disponible | VLM + *prompt* para alertas de violencia, OpenVINO | MIT (base Apache-2.0) | Hugging Face, 42 descargas |
| Qwen/Qwen2-VL-2B-Instruct | 2B | no disponible en esta ficha | VLM generalista multimodal | Apache-2.0 | Hugging Face, ampliamente adoptado |
| Detectores dedicados de violencia (p. ej. clasificadores CNN) | variable, típicamente <100M | N/A | Clasificación binaria entrenada *ad hoc* | variable | variable; requieren dataset propio |

La comparación cuantitativa de rendimiento no está disponible: no se publican métricas de precisión, *recall* ni latencia frente a detectores especializados, por lo que no es posible establecer una superioridad objetiva.

## Limitaciones y advertencias

- Solo soporta inglés; los *prompts* en otros idiomas no están garantizados.
- No soporta NPU en ninguna precisión (INT4, INT8, FP16); solo CPU y GPU Intel.
- Depende de un stack en desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO GenAI 2026.5.0.0.dev20261030), no de una versión estable; puede haber cambios incompatibles.
- El muestreo por `FRAME_STRIDE` implica que eventos muy breves entre fotogramas muestreados pueden no detectarse; la alerta se mantiene entre muestras, lo que puede producir falsos positivos sostenidos.
- Riesgo de alucinación inherente al VLM base: respuestas sí/no pueden ser erróneas en escenas ambiguas, con oclusión o con personas en actitudes que se confundan con violencia (deporte, abrazos, coreografías).
- No se documentan sesgos demográficos, de iluminación ni de ángulo de cámara; al ser un VLM generalista, hereda los sesgos del modelo base Qwen2-VL.
- No se publican métricas de precisión/*recall* ni validación con datasets de referencia, lo que impide evaluar su idoneidad para producción sin pruebas propias.
- La licencia MIT del paquete no exime del cumplimiento de la licencia Apache-2.0 del modelo base Qwen2-VL-2B-Instruct ni de la normativa de videovigilancia y protección de datos aplicable (RGPD en la UE).
- Uso comercial permitido por licencia, pero la fiabilidad en producción no está respaldada por benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/fight-and-violence-detection
- Modelo base Qwen2-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Paper de Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Instalación de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalación de OpenVINO GenAI: https://docs.openvino.ai/2026/get-started/install-openvino/install-openvino-genai.html
- Inferencia con OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- Guía de instalación de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- FFmpeg: https://ffmpeg.org/
- Página corporativa de Intel: https://www.intel.com/content/www/us/en/homepage.html
