# open-edge-platform/gemma-4-e2b-it-int4-ov-dls

## Resumen

Gemma-4-E2B-it INT4 (OpenVINO) es una distribución optimizada del modelo vision-language Gemma-4-E2B-it de Google, publicada por open-edge-platform (Intel) en formato OpenVINO IR con cuantización INT4 de pesos. El artefacto está pensado para inferencia en el borde (edge) sobre hardware Intel, con soporte para CPU, GPU y NPU mediante OpenVINO GenAI, y para CPU/GPU a través de Intel DLStreamer. El caso de uso principal que documenta el autor es la descripción en lenguaje natural de vídeo de cámaras de tráfico en entornos de ciudad inteligente (smart city) y metro.

El modelo resuelve el problema de ejecutar un VLM multimodal en equipos cliente (AI PCs y dispositivos de borde) sin necesidad de exportación ni cuantización local: los artefactos ya vienen pre-exportados y pre-cuantizados. La arquitectura base es la "Gemma 4 edge client architecture" de Google, descrita por el autor como diseñada para razonamiento multimodal eficiente en el lado cliente. La información disponible no detalla el número exacto de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento.

La relevancia actual reside en la combinación de un VLM de Google con el stack de inferencia de Intel (OpenVINO GenAI y DLStreamer), orientado a despliegues de videovigilancia y análisis de tráfico en tiempo real sobre hardware de borde, un nicho donde las alternativas suelen requerir GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (Gemma 4 edge client architecture, Google); transformer multimodal, detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (compresión de pesos); artefactos separados para CPU/GPU y para NPU |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (pre-exportado y pre-cuantizado); tokenizer/detokenizer en formato OpenVINO |
| Framework de inferencia | OpenVINO GenAI (CPU, GPU, NPU); Intel DLStreamer (CPU, GPU) |
| Modelo base | google/gemma-4-E2B-it |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El autor describe el modelo base como un vision-language model de Google basado en la "Gemma 4 edge client architecture", concebida para razonamiento multimodal eficiente en AI PCs y dispositivos cliente. La información proporcionada no especifica la arquitectura interna (número de capas, tipo de atención, mecanismo de fusión visión-lenguaje), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica destacable de esta distribución no está en el entrenamiento, sino en el empaquetado para despliegue: se ofrecen dos artefactos OpenVINO IR pre-cuantizados en INT4, uno orientado a CPU/GPU (`OpenVINO/gemma-4-E2B-it-int4-ov`) y otro optimizado para NPU (`OpenVINO/gemma-4-E2B-it-int4-cw-ov`). El script de descarga re-convierte el tokenizer y detokenizer con la versión activa de OpenVINO Tokenizers si el tokenizer incluido es más reciente que el runtime, evitando un fallo del elemento `gvagenai` al cargarlo. El sample de DLStreamer procesa vídeo de una cámara de tráfico y superpone subtítulos descriptivos sobre los fotogramas.

## Capacidades

- Descripción de vídeo e imagen en texto libre a partir de un prompt en lenguaje natural (pipeline image-text-to-text).
- Comprensión visual de escenas urbanas: vehículos, peatones, flujo de tráfico, pasos de cebra.
- Generación de subtítulos continuos superpuestos sobre flujos de vídeo (integración con DLStreamer).
- Respuesta a preguntas visuales (visual question answering) sobre fotogramas o secuencias de vídeo.
- Procesamiento por lotes de fotogramas con muestreo configurable (`FRAME_STRIDE` en el sample).
- Ejecución en CPU, GPU y NPU mediante OpenVINO GenAI; en CPU/GPU mediante DLStreamer.
- Capacidades de tool calling, agentes, matemáticas, código o audio: no disponibles en la información proporcionada.
- Multilingüe: no; el modelo declara únicamente inglés (`en`).

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe el flujo de una cámara de tráfico y genera descripciones en lenguaje natural de vehículos, peatones y flujo circulatorio, adecuado porque el artefacto INT4 está optimizado para inferencia en tiempo real sobre hardware Intel de borde.
- Triaje y monitorización de incidentes: descripción automática de eventos anómalos en la vía (por ejemplo, aglomeraciones o vehículos detenidos) para priorizar la revisión del operador, aprovechando la generación de texto libre sobre fotogramas muestreados.
- Análisis de tráfico multimodal: registro textual de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, que puede indexarse y consultarse posteriormente como logs en lenguaje natural.
- Asistencia al operador de sala de control: preguntas y respuestas conversacionales sobre una señal de cámara en directo, usando el modelo como capa de descripción accesible para personal no técnico.
- Despliegue en AI PCs y equipos de borde sin GPU de datacenter: el artefacto INT4 con OpenVINO GenAI permite ejecutar el VLM en CPU, GPU integrada o NPU de Intel, reduciendo el coste de infraestructura frente a soluciones en cloud.
- Integración en pipelines de vídeo con DLStreamer: el sample oficial demuestra cómo insertar el modelo como etapa de descripción dentro de un grafo de procesamiento de vídeo GStreamer, con superposición de subtítulos sobre los fotogramas.
- Prototipado de aplicaciones de videovigilancia en metro y transporte urbano: los scripts de descarga y los samples de OpenVINO GenAI y DLStreamer permiten validar el modelo sobre un clip de vídeo de 10 segundos antes de escalar a un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo se distribuye en INT4 y está diseñado para ejecutarse en CPU, GPU integrada y NPU, por lo que no requiere una GPU dedicada de gran capacidad.
- GPU recomendadas: no se especifican modelos concretos; el autor indica soporte para GPU Intel mediante OpenVINO GenAI y DLStreamer.
- NPU: requiere el artefacto específico `OpenVINO/gemma-4-E2B-it-int4-cw-ov` y seleccionar `DEVICE = "NPU"` en el sample; DLStreamer no soporta NPU con este artefacto (el smoke test de NPU pasó con OpenVINO 2026.4.1 pero no con la imagen oficial de DLStreamer 2026.2.0).
- CPU: soportada tanto por OpenVINO GenAI como por DLStreamer.
- Opciones de despliegue: OpenVINO GenAI (`openvino_genai.VLMPipeline`), Intel DLStreamer; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de software: Python 3.11+, FFmpeg para transcodificar el vídeo de muestra, y el stack de runtime OpenVINO indicado en la documentación del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-int4-ov-dls (esta ficha) | no disponible | no disponible | OpenVINO IR INT4 | MIT | Hugging Face (open-edge-platform) |
| OpenVINO/gemma-4-E2B-it-int4-ov | no disponible | no disponible | OpenVINO IR INT4 | no disponible en la información | Hugging Face (OpenVINO) |
| OpenVINO/gemma-4-E2B-it-int4-cw-ov | no disponible | no disponible | OpenVINO IR INT4 (optimizado NPU) | no disponible en la información | Hugging Face (OpenVINO) |
| google/gemma-4-E2B-it | no disponible | no disponible | PyTorch (Transformers) | no disponible en la información | Hugging Face (Google) |

Los tres artefactos OpenVINO comparten el mismo modelo base y difieren en el destino de hardware (CPU/GPU frente a NPU) y en el empaquetado de muestra (este repositorio incluye el sample de DLStreamer para smart city). No se dispone de datos de rendimiento para comparar numéricamente con alternativas.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; las descripciones y respuestas en otros idiomas no están garantizadas.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; un VLM entrenado con datos de internet puede reflejar sesgos en la descripción de personas y escenas urbanas.
- Alucinación: al ser un modelo generativo de descripción visual, puede inventar detalles no presentes en el fotograma; en vigilancia e incidentes conviene validar las descripciones con el operador o con detectores deterministas.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar conversaciones multi-turno largas o secuencias de vídeo extensas.
- Licencia: el artefacto se publica bajo MIT, pero el modelo base pertenece a Google y puede estar sujeto a sus propios términos de uso; conviene revisar la licencia del modelo base antes de un uso comercial.
- NPU: el artefacto NPU no funciona con la imagen oficial de DLStreamer 2026.2.0; solo pasó el smoke test con OpenVINO 2026.4.1.
- Tokenizer: si el tokenizer incluido es más reciente que el runtime OpenVINO activo, es necesario reconvertirlo o el elemento `gvagenai` falla al cargar.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB; verificar la integridad de los artefactos antes de usarlo en producción.
- El sample de DLStreamer procesa un clip de demostración de 10 segundos; no se documentan métricas de latencia ni de throughput para despliegues reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/gemma-4-E2B-it-int4-ov-dls
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Artefacto INT4 para CPU/GPU: https://huggingface.co/OpenVINO/gemma-4-E2B-it-int4-ov
- Artefacto INT4 optimizado para NPU: https://huggingface.co/OpenVINO/gemma-4-E2B-it-int4-cw-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
