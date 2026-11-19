# open-edge-platform/llava-v1.6-mistral-7b-hf-int4-ov-dls-sample

## Resumen

llava-v1.6-mistral-7b-hf-int4-ov-dls-sample es un artefacto de despliegue publicado por open-edge-platform (Intel) que empaqueta el modelo vision-lenguaje LLaVA-v1.6-Mistral-7B en formato OpenVINO IR con pesos cuantizados a INT4 mediante NNCF. No es un modelo entrenado desde cero, sino una build pre-cuantizada del checkpoint original llava-v1.6-mistral-7b-hf de llava-hf, pensada para ejecutarse directamente con OpenVINO GenAI e Intel DLStreamer sin pasos adicionales de exportación ni cuantización local. El repositorio incluye además scripts de descarga, un vídeo de ejemplo de tráfico urbano y código de inferencia listo para ejecutar.

El modelo resuelve un caso de uso muy concreto: la descripción en lenguaje natural de flujos de vídeo procedentes de cámaras de vigilancia urbana (smart city), generando subtítulos continuos sobre vehículos, peatones y tráfico. Combina un encoder visual (CLIP, según la familia LLaVA-NeXT) con el LLM Mistral-7B como decodificador, e incorpora una innovación de despliegue relevante: la distribución como IR INT4 de 3,93 GB que cabe y se ejecuta en CPU y GPU de Intel, sin soporte para NPU.

Su relevancia actual reside en el enfoque edge-AI: permite llevar un VLM de 7B parámetros a entornos de borde con hardware Intel convencional, integrándose con DLStreamer para pipelines de vídeo en tiempo real. La licencia MIT y el formato OpenVINO lo hacen adecuado para prototipos de analítica visual en infraestructuras de movilidad y ciudades inteligentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (LLaVA-NeXT): encoder visual CLIP + LLM Mistral-7B como decodificador |
| Parámetros totales | 7B (según el modelo base Mistral-7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | INT4 (compresión de pesos con NNCF), distribuido como OpenVINO IR |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4, 3,93 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es LLaVA-v1.6-Mistral-7B, un VLM de la familia LLaVA-NeXT que acopla un encoder visual tipo CLIP con el transformer Mistral-7B como modelo de lenguaje. La variante publicada aquí no aporta entrenamiento propio: es una conversión del checkpoint PyTorch (Transformers) a OpenVINO IR con cuantización INT4 de pesos aplicada mediante NNCF, empaquetada por Intel para su ejecución con OpenVINO GenAI. El repositorio incluye un script `export_and_quantize.sh` que descarga el IR pre-cuantizado y un vídeo de prueba, de modo que el usuario no necesita ejecutar el pipeline de exportación ni de cuantización.

No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento original (número de tokens, composición, uso de RLHF/DPO) ni sobre innovaciones de decodificación específicas. La aportación técnica de este artefacto es de ingeniería de despliegue: una build INT4 que reduce el peso a 3,93 GB y se ejecuta en CPU y GPU de Intel, con integración directa en OpenVINO GenAI y en el sample de DLStreamer, ambos procesando el mismo vídeo de ejemplo y superponiendo subtítulos generados sobre los fotogramas.

## Capacidades

- Generación de texto libre a partir de imágenes y vídeo (image-text-to-text) mediante prompts en lenguaje natural.
- Descripción de escenas urbanas: vehículos, peatones, flujo de tráfico y actividad en intersecciones.
- Procesamiento de fotogramas de vídeo con inferencia periódica (el sample usa un `FRAME_STRIDE` de 15 fotogramas) y superposición de subtítulos sobre el vídeo.
- Respuesta a preguntas visuales en lenguaje natural (VQA) sobre fotogramas de cámara.
- Ejecución en CPU y GPU de Intel mediante OpenVINO GenAI; NPU no soportada.
- Integración con Intel DLStreamer para pipelines de vídeo.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni matemáticas avanzadas.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe fotogramas de cámaras de tráfico y genera descripciones en lenguaje natural de vehículos, peatones y flujo circulatorio, permitiendo indexar y buscar eventos en vídeo mediante texto.
- Triaje y monitorización de incidentes: descripción automática de escenas anómalas en la calle (aglomeraciones, vehículos detenidos, actividad inusual) para que un operador priorice la revisión, gracias a la inferencia sobre fotogramas muestreados.
- Análisis de tráfico multimodal: registro textual de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, útil para generar informes periódicos a partir de las descripciones del modelo.
- Asistencia a operadores: preguntas y respuestas visuales conversacionales sobre una señal de cámara en directo, usando el modelo como capa de comprensión de la escena antes de la decisión humana.
- Prototipado en el borde: despliegue en equipos con CPU o GPU Intel sin necesidad de GPUs de datacenter, gracias al IR INT4 de 3,93 GB y a OpenVINO GenAI.
- Pipelines de vídeo con DLStreamer: integración del VLM en cadenas de procesamiento de vídeo existentes para enriquecer cada flujo con subtítulos generados y metadatos textuales.
- Demostraciones y evaluación de VLM en edge: el repositorio incluye vídeo de prueba y scripts listos para ejecutar, lo que facilita comparar el comportamiento del modelo en hardware Intel antes de comprometerse con un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se trata de un "open benchmark standard multimodal model (LLaVA-NeXT)" con "strong zero-shot reasoning", pero no incluye cifras de MMLU, HumanEval, GSM8K ni de benchmarks multimodales, ni latencias o throughput medidos.

## Requisitos de hardware

- Peso del artefacto: IR INT4 de 3,93 GB, lo que reduce los requisitos de memoria frente al checkpoint original en FP16.
- Dispositivos soportados: CPU y GPU de Intel; NPU no soportada.
- VRAM/RAM estimada: no disponible de forma explícita; el tamaño del IR (3,93 GB) da una cota inferior orientativa para pesos, a la que hay que sumar memoria para activaciones y el encoder visual.
- GPUs recomendadas: no se especifican modelos concretos en la información disponible; el sample usa `DEVICE = "GPU"` por defecto con caché en disco (`CACHE_DIR = "vlm_cache"`).
- ¿Cabe en GPU de consumo? No confirmado en la información proporcionada; el diseño orientado a edge y el tamaño INT4 lo hacen plausible en GPUs Intel integradas o discretas de gama adecuada, pero no hay datos de validación publicados.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`), Intel DLStreamer; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El sample limita la generación a `max_new_tokens = 40` y procesa un fotograma de cada 15, lo que sugiere un uso orientado a descripciones breves y periódicas más que a inferencia densa por fotograma.
- Requisitos de software: Python 3.11+ y FFmpeg para transcodificar el vídeo de ejemplo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| llava-v1.6-mistral-7b-hf-int4-ov-dls-sample (este) | 7B | no disponible | OpenVINO IR INT4, OpenVINO GenAI / DLStreamer | MIT | Optimizado para CPU/GPU Intel en edge; solo inglés |
| llava-hf/llava-v1.6-mistral-7b-hf | 7B | no disponible | PyTorch / Transformers (safetensors) | no disponible en la información | Checkpoint base sin cuantizar; requiere exportación para OpenVINO |
| OpenVINO/llava-v1.6-mistral-7b-hf-int4-ov | 7B | no disponible | OpenVINO IR INT4 | no disponible en la información | Build INT4 de referencia que este repositorio reutiliza y acompaña de sample y vídeo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; las descripciones y respuestas en otros idiomas pueden degradarse.
- Es un VLM de 7B con riesgo de alucinación en la descripción de escenas: puede inventar objetos, conteos o actividades no presentes en el fotograma.
- La cuantización INT4 puede introducir pérdida de precisión respecto al checkpoint original en FP16/BF16; no se documentan evaluaciones de degradación.
- No soporta NPU; el despliegue queda restringido a CPU y GPU de Intel.
- El uso previsto es la descripción de vídeo de vigilancia urbana; aplicarlo a otros dominios (documentos, imágenes médicas, OCR) no está validado.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base LLaVA/Mistral y del encoder visual subyacente, cuyas licencias no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB (los pesos se descargan mediante script), lo que indica un artefacto de muestra más que un modelo listo para producción a gran escala.
- La model card referencia una pila de runtime RC1 y documentos auxiliares (matriz de soporte de dispositivos) que deben consultarse antes de elegir el runtime.
- Para producción en tiempo real, el muestreo de fotogramas (1 de cada 15 en el sample) y el límite de 40 tokens nuevos implican descripciones breves y no continuas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/open-edge-platform/llava-v1.6-mistral-7b-hf-int4-ov-dls-sample
- Modelo base: https://huggingface.co/llava-hf/llava-v1.6-mistral-7b-hf
- Build INT4 OpenVINO de referencia: https://huggingface.co/OpenVINO/llava-v1.6-mistral-7b-hf-int4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
