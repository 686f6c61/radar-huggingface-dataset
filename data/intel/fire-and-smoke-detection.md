# Intel/fire-and-smoke-detection

## Resumen

Fire and Smoke Detection es un caso de uso de visión-lenguaje publicado por Intel en Hugging Face, empaquetado como modelo OpenVINO listo para inferencia local. No se trata de un modelo entrenado desde cero, sino de un ajuste de despliegue de Qwen2-VL-2B-Instruct (Alibaba, Apache-2.0) exportado a OpenVINO y comprimido en pesos a INT4 (por defecto) o INT8, de modo que pueda ejecutarse íntegramente en un Intel Core Ultra sin conexión a la nube. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja la compresión de pesos del modelo base de 2 mil millones de parámetros.

El modelo resuelve un problema clásico de seguridad industrial y ferroviaria: la detección temprana de llama abierta y columnas de humo en imágenes y flujos de vídeo. En lugar de entrenar un detector de objetos específico sobre un conjunto de datos no verificado, Intel aprovecha las capacidades de un VLM general y formula la tarea como una pregunta en lenguaje natural ("Is there fire or smoke in this image?"), cuya respuesta sí/no dispara la alerta. Esta aproximación permite reorientar el mismo modelo a otros peligros (vapor, chispas, neblina densa) editando únicamente el prompt, sin reentrenamiento.

Es relevante ahora porque ejemplifica el patrón de despliegue de VLMs pequeños en el borde (edge AI) para tareas de seguridad crítica, con licencia MIT sobre el artefacto publicado y soporte de CPU y GPU Intel mediante OpenVINO GenAI y DLStreamer. La model card advierte de que el stack objetivo es una versión de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO GenAI 2026.5.0.0.dev20261030), no una release estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en Qwen2-VL-2B-Instruct (transformer multimodal con encoder visual y decoder de lenguaje) |
| Parametros totales | 2 mil millones (modelo base Qwen2-VL-2B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (por defecto), INT8, FP16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (artefacto publicado); modelo base Apache-2.0 |
| Formato de pesos | OpenVINO IR (directorio con modelo de lenguaje, encoder visual, tokenizer y preprocessor config) |

## Arquitectura y entrenamiento

El artefacto no incluye entrenamiento propio: es una exportación de Qwen2-VL-2B-Instruct a OpenVINO mediante `optimum-cli export openvino`, seguida de compresión de pesos con NNCF. Qwen2-VL es un transformer multimodal que combina un encoder visual con un decoder de lenguaje; la model card no detalla la composición del dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO, por lo que esos datos deben consultarse en la model card del modelo base de Alibaba.

La innovación técnica del artefacto está en el pipeline de despliegue, no en el entrenamiento. El sample de OpenVINO GenAI muestrea un fotograma cada `FRAME_STRIDE` fotogramas, lo envía al VLM con un prompt corto de fuego/humo y mantiene la respuesta sí/no entre muestras, superponiendo un banner de alerta en la parte superior de cada fotograma (sin dibujar cajas delimitadoras). El sample de DLStreamer usa el elemento `gvagenai` con la misma lógica. La compresión a INT4 reduce huella y latencia en CPU Core Ultra, a costa de precisión frente a INT8 y FP16.

## Capacidades

- Respuesta visual a preguntas (VQA) en inglés sobre presencia de fuego y humo en imágenes y fotogramas de vídeo.
- Clasificación binaria sí/no guiada por prompt, sin necesidad de cabeza de clasificación dedicada.
- Reorientación a otros peligros (vapor, chispas, neblina densa) editando el prompt, sin reentrenamiento.
- Procesamiento de flujos de vídeo con muestreo de fotogramas y persistencia de la última respuesta entre muestras.
- Inferencia local en CPU y GPU Intel mediante OpenVINO GenAI; integración con pipelines de DLStreamer.
- Capacidades generales heredadas de Qwen2-VL-2B-Instruct (descripción de imágenes, razonamiento visual básico), limitadas por el prompt y el caso de uso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio: no disponible.

## Casos de uso

- Seguridad en depósitos y túneles ferroviarios: el modelo se ejecuta sobre el flujo de cámaras del depósito o túnel y levanta una alarma temprana cuando aparece llama abierta o humo en una bahía de mantenimiento, con inferencia local que evita enviar vídeo a la nube.
- Incendios de vegetación junto a la vía: el muestreo de fotogramas permite vigilar el derecho de paso y detectar matorral o fuego forestal antes de que alcance la infraestructura, usando el banner de alerta como señal para el operador.
- Vigilancia de instalaciones: monitorización continua de subestaciones, patios de almacenamiento y andenes para eventos de ignición y humo, con el modelo desplegado en un Core Ultra junto a la cámara.
- Escalado automatizado de incidentes: al confirmarse una detección de `fire` o `smoke`, el pipeline puede disparar alertas y captura de vídeo, integrándose con los sistemas de gestión de incidentes existentes.
- Reutilización para otros peligros: el mismo binario OpenVINO sirve para detectar vapor, chispas o neblina densa editando el prompt, lo que abarata la cobertura de nuevos riesgos sin reentrenar.
- Prototipado y validación en borde: investigadores y equipos de integración pueden usar el sample de OpenVINO GenAI o el de DLStreamer para evaluar latencia y precisión en CPU/GPU Intel antes de comprometerse con un detector dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una matriz de compatibilidad precisión/dispositivo (INT4, INT8 y FP16 funcionan en CPU y GPU; NPU no está soportado) y remite a una matriz de validación de dispositivos externa (`DEVICE_SUPPORT_MATRIX.md`) para resultados medidos, sin cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa aproximadamente 0,1 GB con pesos INT4, lo que sugiere una huella de memoria muy reducida, adecuada para ejecución en CPU.
- GPU recomendadas: GPU integradas de Intel Core Ultra (el caso de uso objetivo); no se especifican modelos discretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: el artefacto está pensado para CPU y GPU Intel, no para GPUs de consumo NVIDIA; no hay datos de compatibilidad con estas últimas.
- NPU: no soportada para ninguna precisión en este caso de uso.
- Opciones de despliegue: OpenVINO GenAI (sample `openvino_sample.py`) e Intel DLStreamer 2026.3.0 RC1 con el elemento `gvagenai`; requiere Python 3.11+, OpenVINO, OpenVINO GenAI y FFmpeg.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el diseño muestrea un fotograma cada `FRAME_STRIDE` para mantener la inferencia responsiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Intel/fire-and-smoke-detection | 2B (Qwen2-VL-2B-Instruct) | no disponible | MIT (artefacto) / Apache-2.0 (base) | Hugging Face, OpenVINO IR | VLM en borde para fuego/humo, CPU y GPU Intel |
| Qwen/Qwen2-VL-2B-Instruct | 2B | no disponible en esta ficha | Apache-2.0 | Hugging Face, Transformers | Modelo base sin compresión ni prompt de seguridad |
| Detectores de objetos específicos de fuego/humo | no disponible | no aplica | variable | variable | Requieren entrenamiento y dataset verificado; el VLM evita ese paso |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El stack objetivo es una versión de desarrollo (DLStreamer 2026.3.0 RC1, OpenVINO GenAI 2026.5.0.0.dev20261030), no una release estable; no debería asumirse para producción sin validación.
- La detección se basa en la respuesta sí/no de un VLM general, no en un detector entrenado y validado sobre un dataset de fuego/humo; el riesgo de falsos positivos y falsos negativos no está cuantificado en la model card.
- Riesgo de alucinación inherente al modelo base: el VLM puede responder de forma incorrecta ante imágenes ambiguas, con poca luz o con elementos que se parezcan a humo.
- Solo se soporta inglés en los prompts según la model card.
- La NPU no está soportada; el despliegue queda restringido a CPU y GPU Intel.
- La licencia MIT aplica al artefacto publicado; el modelo base Qwen2-VL-2B-Instruct se distribuye bajo Apache-2.0, cuyas condiciones deben respetarse.
- El banner de alerta no incluye cajas delimitadoras, por lo que no localiza la fuente de fuego o humo en la imagen.
- No se han publicado métricas de precisión, recall ni latencia en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/fire-and-smoke-detection
- Modelo base Qwen2-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Paper de Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Instalación de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalación de OpenVINO GenAI: https://docs.openvino.ai/2026/get-started/install-openvino/install-openvino-genai.html
- Inferencia con OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- Guía de instalación de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- FFmpeg: https://ffmpeg.org/
- Página corporativa de Intel: https://www.intel.com/content/www/us/en/homepage.html
