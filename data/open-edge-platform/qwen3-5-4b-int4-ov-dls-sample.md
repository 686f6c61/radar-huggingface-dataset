# open-edge-platform/qwen3.5-4B-int4-ov-dls-sample

## Resumen

Qwen3.5-4B INT4 (OpenVINO) es una distribución optimizada del modelo vision-language Qwen3.5-4B de Alibaba, empaquetada por el equipo open-edge-platform de Intel para su ejecución en hardware Intel mediante OpenVINO GenAI. El modelo combina comprensión de imagen y texto para generar descripciones en lenguaje natural de contenido de vídeo, y se distribuye como una representación intermedia (IR) de OpenVINO con pesos cuantizados a INT4 mediante NNCF, lo que elimina la necesidad de exportar o cuantizar localmente.

El caso de uso principal documentado es la descripción de vídeo en entornos de ciudad inteligente: dada una secuencia de vídeo de una cámara de tráfico y un prompt en lenguaje natural, el modelo genera subtítulos continuos que describen vehículos, peatones y flujo de tráfico. El modelo base es un VLM multimodal de 4B parámetros con capacidades destacadas de OCR, grounding espacial y comprensión de escenas.

La relevancia de esta ficha radica en que muestra el patrón de despliegue de un VLM de última generación en el edge con cuantización INT4 y runtime OpenVINO, orientado a cargas de trabajo de visión por computador en tiempo real sobre CPU y GPU Intel (la NPU no está soportada). El repositorio en Hugging Face es un ejemplo de despliegue (sample) más que un artefacto de pesos autónomo, y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformer multimodal) basado en Qwen3.5-4B; no se detalla la arquitectura interna en la información disponible |
| Parametros totales | 4B (según denominación del modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (compresión de pesos mediante NNCF); precisiones soportadas: INT4 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4), con tokenizer/detokenizer OpenVINO; tamaño del IR: 3,33 GB |
| Framework de inferencia | OpenVINO GenAI |
| Hardware soportado | CPU y GPU Intel; NPU no soportada |
| Pipeline | image-text-to-text |
| Tarea | Descripción de vídeo en lenguaje natural (video-description) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B ni los datos de entrenamiento empleados. Se sabe que se trata de un modelo vision-language multimodal (VLM) de 4B parámetros desarrollado por Alibaba, distribuido originalmente en PyTorch/Transformers y convertido a OpenVINO IR por el equipo de OpenVINO. La variante aquí descrita aplica cuantización de pesos a INT4 mediante NNCF (Neural Network Compression Framework), lo que reduce el tamaño del artefacto a 3,33 GB y permite su ejecución directa con OpenVINO GenAI sin pasos adicionales de exportación o cuantización.

El modelo base destaca, según la model card, por su precisión en OCR, grounding espacial y comprensión de escenas, capacidades que se aprovechan en el caso de uso de descripción de vídeo de tráfico urbano. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El pipeline de ejemplo procesa fotogramas de vídeo con un stride configurable (por defecto 15) y genera descripciones periódicas con un máximo de 40 tokens nuevos por invocación.

## Capacidades

- Generación de descripciones en lenguaje natural de contenido visual (imágenes y fotogramas de vídeo).
- Comprensión de escenas urbanas: vehículos, peatones, flujo de tráfico, intersecciones y pasos de cebra.
- OCR de alta precisión (según la model card del modelo base).
- Grounding espacial: localización y relación espacial de objetos en la escena.
- Respuesta a prompts en lenguaje natural de forma libre (free-form text description).
- Procesamiento de flujo de vídeo continuo con generación periódica de subtítulos.
- Integración con Intel DLStreamer para pipelines de vídeo (elemento `gvagenai`).
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso orientado a agentes, audio ni modo thinking explícito.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe fotogramas de cámaras de tráfico y genera descripciones continuas de la actividad en intersecciones, adecuado por su capacidad de comprensión de escenas urbanas y su despliegue en edge con INT4.
- Triaje y monitorización de incidentes: descripción automática de eventos anómalos en la vía pública (por ejemplo, aglomeraciones o vehículos detenidos), aprovechando la generación de texto libre sobre fotogramas sucesivos.
- Análisis de tráfico: registro multimodal de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, integrable en pipelines de DLStreamer.
- Asistencia a operadores: pregunta-respuesta visual conversacional sobre feeds de cámara en directo, con prompts en lenguaje natural adaptados al operador.
- Procesamiento de vídeo en el edge con OpenVINO: despliegue en CPU o GPU Intel sin necesidad de GPU dedicada de datacenter, gracias a la cuantización INT4 y al runtime OpenVINO GenAI.
- Subtitulado automático de vídeo para accesibilidad o documentación: superposición de leyendas generadas sobre los fotogramas (como hace el sample con la función `draw_caption`).
- Prototipado de pipelines VLM multimodales: el repositorio sirve como ejemplo reproducible de integración de un VLM con OpenVINO GenAI y DLStreamer para equipos que evalúan despliegues en edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el IR INT4 ocupa 3,33 GB en disco; la memoria en tiempo de ejecución no se especifica en la información disponible.
- Hardware soportado: CPU y GPU Intel. La NPU no está soportada.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible; el sample usa `DEVICE = "GPU"` por defecto y permite `DEVICE = "CPU"`.
- ¿Cabe en GPU de consumo? No se indica explícitamente; el tamaño del artefacto (3,33 GB) sugiere que podría ejecutarse en GPUs con memoria suficiente, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`), Intel DLStreamer (elemento `gvagenai`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El sample configura `max_new_tokens = 40` y `FRAME_STRIDE = 15`, pero no se publican métricas de rendimiento.
- Requisitos de software: Python 3.11+, FFmpeg, OpenVINO y OpenVINO GenAI; el script de descarga re-convierte el tokenizer si la versión empaquetada es más reciente que el runtime activo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa. A modo orientativo, se indica lo que se conoce:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B INT4 (OpenVINO) | 4B | no disponible | MIT | OpenVINO IR INT4 | VLM optimizado para edge Intel |
| Qwen3.5-4B (base) | 4B | no disponible | no disponible en la información | PyTorch/Transformers | Modelo original de Alibaba |
| OpenVINO/Qwen3.5-4B-int4-ov | 4B | no disponible | no disponible en la información | OpenVINO IR INT4 | Build INT4 de referencia usado por este sample |

No se dispone de información sobre otros VLMs comparables (por ejemplo, variantes de la familia Qwen2-VL, LLaVA o Phi-3-Vision) en los datos proporcionados.

## Limitaciones y advertencias

- Idiomas: el repositorio declara únicamente inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Hardware: la NPU no está soportada; solo CPU y GPU Intel.
- Naturaleza del repositorio: es un sample de despliegue, no un artefacto de pesos autónomo; requiere ejecutar el script de descarga para obtener el IR INT4.
- Tokenizer: si el tokenizer empaquetado es más reciente que el runtime OpenVINO activo, el elemento `gvagenai` de DLStreamer falla al cargarlo; es necesario re-convertirlo con la versión activa de OpenVINO Tokenizers.
- Cuantización INT4: puede degradar la precisión respecto al modelo en precisión completa; no se publican métricas de degradación en la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas de fidelidad en este repositorio.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Longitud de contexto: no disponible; el sample limita la generación a 40 tokens nuevos por invocación.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B de Alibaba, cuya licencia no se detalla en la información disponible.
- Validación: la versión previa se validó con el stack de desarrollo RC1; conviene revisar la matriz de soporte de dispositivos antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/open-edge-platform/qwen3.5-4B-int4-ov-dls-sample
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Build INT4 de referencia: https://huggingface.co/OpenVINO/Qwen3.5-4B-int4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
