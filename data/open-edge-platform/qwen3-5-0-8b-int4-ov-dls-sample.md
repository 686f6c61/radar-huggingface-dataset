# open-edge-platform/qwen3.5-0.8B-int4-ov-dls-sample

## Resumen

Qwen3.5-0.8B INT4 (OpenVINO) es una distribución optimizada del modelo vision-language Qwen3.5-0.8B de Alibaba, publicada por open-edge-platform (Intel) en formato OpenVINO Intermediate Representation con cuantización INT4 de los pesos mediante NNCF. El objetivo no es ofrecer un modelo nuevo, sino un artefacto listo para desplegar en dispositivos de borde (edge) con un footprint inferior a 1 GB, orientado a la descripción automática de vídeo en entornos de ciudad inteligente.

El caso de uso principal documentado es la generación de descripciones en lenguaje natural de secuencias de vídeo procedentes de cámaras de tráfico: vehículos, peatones y flujo circulatorio. El modelo se integra con OpenVINO GenAI y con Intel DLStreamer, lo que permite procesar el mismo flujo de vídeo y superponer subtítulos generados sobre los fotogramas.

La relevancia de esta ficha radica en su naturaleza de muestra de referencia (dls-sample): el repositorio incluye scripts de exportación y cuantización, un vídeo de prueba y código de ejemplo que demuestran un pipeline completo de VLM en el borde. El modelo base tiene 0,8 mil millones de parámetros, lo que lo sitúa en la categoría de VLM ultra-ligeros con arranque en frío rápido y bajo consumo, aunque no se dispone de datos publicados sobre longitud de contexto ni sobre el proceso de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) transformer; detalles internos no disponibles |
| Parámetros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT4 (compresión de pesos con NNCF); se distribuye únicamente en INT4 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (Intermediate Representation); tokenizador en formato OpenVINO Tokenizers |
| Framework de inferencia | OpenVINO GenAI |
| Hardware soportado | CPU y GPU; NPU no soportado |
| Tamaño del artefacto | 878 MB (IR INT4) |
| Tarea | Image-text-to-text; descripción de vídeo |
| Modelo base | Qwen/Qwen3.5-0.8B (Alibaba) |
| Build pre-cuantizado | OpenVINO/Qwen3.5-0.8B-int4-ov |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-0.8B más allá de su naturaleza vision-language: procesa entradas de imagen (o fotogramas de vídeo) junto con un prompt textual y genera texto libre. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni el codificador visual empleado.

Tampoco se documentan los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo etapas de RLHF, DPO u otras técnicas de alineación. La innovación técnica destacable de esta distribución es el proceso de cuantización INT4 con NNCF y la conversión a OpenVINO IR, que permite ejecutar el modelo directamente con OpenVINO GenAI sin exportación ni cuantización local. El script `export_and_quantize.sh` descarga el IR pre-cuantizado y, si el tokenizador incluido es más reciente que el runtime de OpenVINO activo, reconvierte `openvino_tokenizer` y `openvino_detokenizer` con la versión activa de OpenVINO Tokenizers; sin este paso, el elemento `gvagenai` falla al cargar el tokenizador.

## Capacidades

- Generación de texto libre a partir de imágenes y fotogramas de vídeo (image-text-to-text).
- Descripción de escenas urbanas: vehículos, peatones, cruces y flujo de tráfico.
- Respuesta a prompts en lenguaje natural sobre el contenido visual (preguntas visuales conversacionales).
- Procesamiento de flujos de vídeo con generación periódica de subtítulos superpuestos sobre los fotogramas.
- Integración con OpenVINO GenAI (`VLMPipeline`) y con Intel DLStreamer (elemento `gvagenai`).
- Ejecución en CPU y GPU; no soporta NPU.
- Capacidades de tool calling, function calling, agentes multi-paso, razonamiento matemático avanzado, audio o modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües: únicamente inglés según la model card.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe fotogramas de cámaras de tráfico y genera descripciones en lenguaje natural de la actividad en intersecciones y rotondas, adecuado por su footprint inferior a 1 GB y su capacidad de ejecutarse en CPU/GPU de borde.
- Triaje y monitorización de incidentes: descripción automática de eventos anómalos en la vía pública, permitiendo a los operadores revisar logs textuales en lugar de visualizar vídeo continuo.
- Análisis de tráfico multimodal: registro textual de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, generado periódicamente cada N fotogramas (el ejemplo usa un stride de 15).
- Asistencia a operadores: preguntas y respuestas visuales sobre feeds de cámara en directo mediante prompts en lenguaje natural, útil en centros de control con personal no especializado en visión por computador.
- Procesamiento de vídeo en el borde con DLStreamer: integración del elemento `gvagenai` en pipelines GStreamer para enriquecer flujos de vídeo con metadatos textuales sin enviar datos a la nube.
- Prototipado y demos de VLM en hardware Intel: el repositorio incluye vídeo de prueba, script de descarga y código de ejemplo, lo que permite validar un pipeline completo de VLM en minutos sobre CPU o GPU integrada.
- Subtitulado automático de vídeo urbano: superposición de leyendas generadas sobre los fotogramas de salida, como demuestra el ejemplo que escribe `output_openvino.mp4` con un banner de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el artefacto INT4 ocupa 878 MB, por lo que el consumo de memoria en GPU será del orden de ese tamaño más las activaciones y el contexto, sin cifra oficial publicada.
- Hardware soportado oficialmente: CPU y GPU. NPU no soportado.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible; el diseño apunta a dispositivos de borde de bajo consumo.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, aunque el tamaño del artefacto (878 MB) sugiere que podría ejecutarse en GPUs integradas o de gama baja; no hay validación publicada.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`) e Intel DLStreamer (elemento `gvagenai`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card menciona "arranque en frío rápido" como objetivo de diseño, sin cifras.
- Requisitos de software: Python 3.11+, FFmpeg para transcodificar el vídeo de muestra, y el stack de runtime OpenVINO (la validación previa usó el stack de desarrollo RC1).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B INT4 (OpenVINO) | 0,8 B | No disponible | OpenVINO IR INT4 | MIT | Distribución edge de Intel; CPU/GPU, sin NPU |
| Qwen3.5-0.8B (base) | 0,8 B | No disponible | PyTorch/Transformers | No disponible en la información | Modelo original de Alibaba; requiere exportación y cuantización |
| OpenVINO/Qwen3.5-0.8B-int4-ov | 0,8 B | No disponible | OpenVINO IR INT4 | No disponible en la información | Build pre-cuantizado del que deriva esta muestra |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: solo inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar conversaciones multi-turno largas o vídeos de gran duración sin validación previa.
- Hardware: no soporta NPU; solo CPU y GPU. Esto excluye aceleradores de IA dedicados de Intel en despliegues de borde.
- Tokenizador: si el tokenizador incluido es más reciente que el runtime de OpenVINO activo, es necesario reconvertirlo; de lo contrario, el elemento `gvagenai` falla al cargarlo. Los ficheros originales se conservan en `original_tokenizer/`.
- Cuantización: solo se distribuye INT4, lo que puede degradar la calidad respecto al modelo en precisión completa; no se han publicado evaluaciones de la pérdida de calidad.
- Alucinación: no hay datos publicados sobre tasas de alucinación en descripción de vídeo; en entornos de vigilancia, las descripciones generadas no deben tratarse como evidencia sin verificación humana.
- Sesgos: no documentados en la información disponible.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales no reflejadas en esta distribución; conviene verificar la licencia del modelo original.
- Madurez: repositorio con 0 descargas y 0 likes, creado en noviembre de 2026; es una muestra de referencia, no un artefacto con validación comunitaria.
- Uso previsto acotado: la model card lo enmarca como muestra de descripción de vídeo para ciudad inteligente; no se documentan capacidades generales de razonamiento o código.

## Enlaces

- Hugging Face: https://huggingface.co/open-edge-platform/qwen3.5-0.8B-int4-ov-dls-sample
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Build pre-cuantizado: https://huggingface.co/OpenVINO/Qwen3.5-0.8B-int4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
