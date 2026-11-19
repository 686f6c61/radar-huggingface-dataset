# open-edge-platform/qwen3.5-2B-int4-ov-dls-sample

## Resumen

Qwen3.5-2B INT4 (OpenVINO) es una distribución optimizada del modelo visión-lenguaje Qwen3.5-2B de Alibaba, publicada por open-edge-platform (Intel) como un caso de ejemplo para analítica de vídeo en el borde (edge AI). El paquete incluye los pesos ya cuantizados a INT4 en formato OpenVINO IR, comprimidos con NNCF, de modo que puede ejecutarse directamente con OpenVINO GenAI sin pasos adicionales de exportación o cuantización local. El caso de uso principal documentado es la descripción en lenguaje natural de escenas de tráfico urbano (smart city, metro) a partir de flujos de vídeo de cámaras.

El modelo base es un VLM compacto de 2B parámetros que equilibra razonamiento visual con generación rápida de tokens, pensado para despliegues de alto rendimiento en hardware de borde. La distribución soporta CPU y GPU Intel, pero no NPU. El repositorio en sí es un ejemplo de integración (sample) que incluye scripts de descarga, un ejemplo con OpenVINO GenAI y otro con Intel DLStreamer, y un vídeo de prueba de una rotonda urbana.

Es relevante ahora porque demuestra un flujo completo de VLM cuantizado listo para producción en edge: descarga del IR INT4 (~1,99 GB), inferencia sobre frames de vídeo con overlays de subtítulos y despliegue con aceleración por hardware Intel, sin necesidad de infraestructura GPU de centro de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM); arquitectura interna del transformer no detallada en la información disponible |
| Parámetros totales | 2B (según nombre del modelo y model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (compresión de pesos con NNCF); única precisión soportada en esta distribución |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4), con tokenizer/detokenizer OpenVINO; no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer de Qwen3.5-2B (número de capas, dimensión oculta, mecanismo de atención, encoder visual). Se describe como un modelo visión-lenguaje de última generación de Alibaba que acepta imágenes y prompts en lenguaje natural y genera texto libre. La distribución de Intel aplica compresión de pesos INT4 mediante NNCF sobre el modelo original en PyTorch/Transformers, produciendo un IR de OpenVINO listo para inferencia con OpenVINO GenAI.

No se proporcionan datos sobre el corpus de entrenamiento (número de tokens, composición del dataset) ni sobre etapas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El valor técnico de esta distribución está en el pipeline de cuantización y empaquetado para edge, no en cambios arquitectónicos respecto al modelo base.

## Capacidades

- Generación de descripciones en lenguaje natural de contenido visual (imágenes y frames de vídeo) a partir de un prompt de texto.
- Comprensión de escenas urbanas: vehículos, peatones, flujo de tráfico, cruces e intersecciones.
- Procesamiento de flujos de vídeo frame a frame con inferencia periódica (el ejemplo usa un `FRAME_STRIDE` configurable).
- Respuesta a prompts libres de pregunta-respuesta visual sobre imágenes de cámara.
- Integración con OpenVINO GenAI mediante `VLMPipeline` y con Intel DLStreamer mediante el elemento `gvagenai`.
- Ejecución en CPU y GPU Intel; NPU no soportada.
- Soporte de tool calling, agentes, matemáticas o código: no documentado en la información disponible.
- Capacidades multilingües: solo inglés según el campo `language`.

## Casos de uso

- Vigilancia de smart city: el modelo procesa frames de cámaras de tráfico y genera subtítulos continuos describiendo vehículos, peatones y flujo circulatorio; adecuado por su tamaño de 2B y su ejecución en CPU/GPU de borde sin GPU de centro de datos.
- Triaje y monitorización de incidentes: descripción automática de escenas anómalas en la calle (por ejemplo, aglomeraciones o vehículos detenidos) para priorizar la revisión por operadores humanos.
- Análisis de tráfico multimodal: registro textual de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, que puede indexarse o agregarse en pipelines de analítica.
- Asistencia a operadores: pregunta-respuesta visual conversacional sobre feeds de cámara en directo, permitiendo consultas en lenguaje natural sobre lo que muestra la escena.
- Despliegue en infraestructura de metro/transporte: el caso está etiquetado explícitamente para despliegues Metro, con inferencia en hardware Intel existente en estaciones y centros de control.
- Prototipado rápido de VLM en edge: al distribuirse como IR INT4 pre-cuantizado de ~1,99 GB, permite validar un pipeline VLM completo (descarga, inferencia, overlay de resultados) en minutos con los scripts incluidos.
- Integración en pipelines de vídeo con DLStreamer: el elemento `gvagenai` permite encadenar el VLM con otras etapas de GStreamer/DLStreamer para analítica de vídeo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU y GPU Intel; NPU no soportada según la model card.
- Tamaño del IR INT4 descargado: 1,99 GB, lo que sitúa los requisitos de memoria en el entorno de ~2 GB para pesos más overhead de activaciones y caché KV (no cuantificado en la información disponible).
- El ejemplo usa por defecto `DEVICE = "GPU"` con `CACHE_DIR = "vlm_cache"`; se puede cambiar a `"CPU"`.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible; el diseño apunta a GPU integradas o de borde Intel.
- Despliegue: OpenVINO GenAI (`VLMPipeline`) e Intel DLStreamer (`gvagenai`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo limita la generación a `max_new_tokens = 40` por frame y usa un stride de 15 frames, lo que sugiere inferencia periódica más que por frame.
- Requisitos de software: Python 3.11+ y FFmpeg para transcodificar el vídeo de muestra.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada para establecer una comparación cuantitativa con alternativas. Como referencia estructural, esta distribución se diferencia de otras por su formato (IR INT4 pre-cuantizado con NNCF), su motor de inferencia (OpenVINO GenAI/DLStreamer) y su orientación explícita a edge en hardware Intel, frente a distribuciones habituales en safetensors o GGUF para GPUs de centro de datos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Motor |
|---|---|---|---|---|---|
| Qwen3.5-2B INT4 (OpenVINO) | 2B | no disponible | MIT | OpenVINO IR INT4 | OpenVINO GenAI, DLStreamer |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo inglés según la model card; no se garantiza calidad en castellano u otros idiomas.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar conversaciones multi-turno largas o vídeos de gran duración sin validación empírica.
- Hardware: no soporta NPU; requiere CPU o GPU Intel con el runtime OpenVINO adecuado.
- Tokenizer: si el tokenizer incluido es más reciente que el runtime OpenVINO activo, es necesario reconvertirlo; de lo contrario, el elemento `gvagenai` falla al cargarlo.
- Validación: la model card indica que la validación previa se hizo con el stack de desarrollo RC1, no con una versión estable; conviene verificar compatibilidad con el runtime release.
- Alucinación: como todo VLM, puede describir objetos o eventos ausentes en la escena; en vigilancia e incidentes esto exige supervisión humana.
- Sesgos: no documentados en la información disponible; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-2B de Alibaba, ya que esta distribución solo cubre el empaquetado.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con tamaño de repo de 0,0 GB (los pesos se descargan vía script desde `OpenVINO/Qwen3.5-2B-int4-ov`); es un sample, no un artefacto de producción consolidado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/qwen3.5-2B-int4-ov-dls-sample
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- IR INT4 de referencia: https://huggingface.co/OpenVINO/Qwen3.5-2B-int4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
