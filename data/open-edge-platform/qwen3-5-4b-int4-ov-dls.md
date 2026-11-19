# open-edge-platform/qwen3.5-4B-int4-ov-dls

## Resumen

Qwen3.5-4B INT4 (OpenVINO) es una distribución optimizada del modelo vision-language Qwen3.5-4B de Alibaba, publicada por el equipo open-edge-platform de Intel. El paquete no contiene los pesos en formato original, sino una representación intermedia (IR) de OpenVINO con los pesos comprimidos a INT4 mediante NNCF, lista para ejecutarse directamente con OpenVINO GenAI sin pasos adicionales de exportación o cuantización. Está orientada a despliegues en el edge sobre CPU y GPU Intel, con casos de uso centrados en descripción de vídeo para ciudades inteligentes.

El modelo base, Qwen3.5-4B, es un modelo multimodal de aproximadamente 4.000 millones de parámetros que combina comprensión de imagen y texto. Esta build concreta se etiqueta explícitamente como una muestra de referencia (`qwen3.5-4B-int4-ov-dls-sample`) para el pipeline de Intel DLStreamer y OpenVINO GenAI, aplicada a la descripción en lenguaje natural de flujos de vídeo de cámaras de tráfico urbanas.

Su relevancia radica en que demuestra un flujo completo de VLM en el edge: descarga del IR pre-cuantizado (3,33 GB), ejecución sobre GPU o CPU (el NPU no está soportado) y superposición de subtítulos generados sobre los fotogramas de vídeo. Es una pieza de infraestructura más que un modelo nuevo, pensada para integradores que despliegan analítica visual en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base Qwen3.5-4B); empaquetado como IR de OpenVINO |
| Parametros totales | ~4B (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (compresión de pesos con NNCF); solo se distribuye INT4 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4), con tokenizer/detokenizer OpenVINO; no incluye safetensors ni GGUF |
| Tarea (pipeline) | image-text-to-text (descripción de vídeo) |
| Hardware soportado | CPU y GPU Intel; NPU no soportado |
| Motor de inferencia | OpenVINO GenAI; integración con Intel DLStreamer |
| Tamaño del IR | 3,33 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B más allá de su naturaleza multimodal (comprensión de imagen y texto). La build publicada es una conversión a OpenVINO IR con pesos comprimidos a INT4 mediante NNCF, orientada a inferencia en CPU y GPU Intel. No se especifican en la documentación el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo base.

La innovación técnica de este paquete no reside en el entrenamiento sino en el pipeline de despliegue: el IR pre-cuantizado se descarga y ejecuta directamente con `openvino_genai.VLMPipeline`, con caché de compilación para GPU (`CACHE_DIR`), y se integra en DLStreamer mediante el elemento `gvagenai`. El script de descarga re-convierte el tokenizer si la versión empaquetada es más reciente que el runtime activo, un detalle necesario para evitar fallos de carga. La muestra procesa vídeo con OpenCV, aplica un `FRAME_STRIDE` configurable (15 por defecto) y genera descripciones periódicas con `max_new_tokens` ajustable.

## Capacidades

- Descripción en lenguaje natural de escenas de vídeo a partir de un prompt textual (image-text-to-text).
- Comprensión de imagen y texto en un único modelo multimodal.
- OCR de alta precisión sobre imágenes, según declara la model card.
- Grounding espacial y comprensión de escena (vehículos, peatones, flujo de tráfico).
- Generación de subtítulos libres superpuestos sobre fotogramas de vídeo.
- Ejecución en CPU y GPU Intel mediante OpenVINO GenAI.
- Integración con Intel DLStreamer para pipelines de vídeo.
- Idiomas: únicamente inglés.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe fotogramas de cámaras de tráfico y genera descripciones continuas de vehículos, peatones e intersecciones, adecuado por su tamaño de 4B y su ejecución INT4 en hardware Intel de borde.
- Triaje y monitorización de incidentes: descripción automática de escenas anómalas en la calle, útil para priorizar la revisión humana en centros de control.
- Análisis de tráfico: registro multimodal de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, aprovechando la comprensión de escena del modelo.
- Asistencia a operadores: preguntas y respuestas visuales conversacionales sobre feeds de cámara en directo, con el prompt en lenguaje natural como interfaz.
- Pipelines de vídeo con DLStreamer: integración del elemento `gvagenai` para añadir subtítulos generados sobre el stream, demostrado con el vídeo de rotonda urbana de Pexels.
- Prototipado de VLM en el edge: servir como referencia reproducible para validar latencia y calidad en CPU/GPU Intel antes de escalar a producción, gracias al IR pre-cuantizado y al script de descarga incluido.
- Procesamiento por lotes de clips cortos: la muestra de 10 segundos y el `FRAME_STRIDE` configurable permiten generar descripciones periódicas de clips de vigilancia sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el IR INT4 ocupa 3,33 GB, por lo que se necesita al menos ese espacio para los pesos más memoria adicional para activaciones, caché KV y el pipeline de vídeo.
- GPU recomendadas: GPU Intel (la muestra usa `DEVICE = "GPU"` por defecto); no se especifican modelos concretos de GPU Intel ni de otras marcas.
- CPU: soportada como alternativa (`DEVICE = "CPU"`); no se detallan requisitos mínimos de núcleos ni de instrucciones.
- NPU: no soportado explícitamente.
- Cabe en GPU de consumo: no disponible la confirmación; el tamaño de 3,33 GB en INT4 sugiere que podría caber en GPUs de consumo con suficiente memoria, pero la información no lo confirma ni enumera modelos.
- Despliegue: OpenVINO GenAI (`VLMPipeline`), Intel DLStreamer (elemento `gvagenai`), Python 3.11+, FFmpeg para transcodificar el vídeo de muestra, OpenCV para el procesamiento de fotogramas.
- Latencia y throughput: no disponibles. La muestra usa `max_new_tokens = 40` y `FRAME_STRIDE = 15`, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| open-edge-platform/qwen3.5-4B-int4-ov-dls | ~4B | no disponible | OpenVINO IR INT4 | MIT | Build de muestra para DLStreamer/edge Intel |
| OpenVINO/Qwen3.5-4B-int4-ov | ~4B | no disponible | OpenVINO IR INT4 | no disponible en la informacion | IR INT4 genérico del que deriva esta build |
| Qwen/Qwen3.5-4B | ~4B | no disponible | PyTorch/Transformers | no disponible en la informacion | Modelo base original de Alibaba |

No se dispone de datos de benchmarks ni de contexto para comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- No soporta NPU; únicamente CPU y GPU Intel.
- Es una muestra de referencia (`-sample`) para DLStreamer, no necesariamente una build de producción validada a gran escala.
- Solo se distribuye en INT4; no hay variantes FP16, FP32 ni GGUF, lo que limita su uso fuera de OpenVINO.
- El pipeline depende de la versión del runtime: si el tokenizer empaquetado es más nuevo que OpenVINO, el elemento `gvagenai` falla al cargar y requiere re-conversión.
- La validación previa se realizó con el stack de desarrollo RC1, según la model card.
- Riesgo de alucinación inherente a los VLM: las descripciones de escenas pueden incluir objetos o acciones no presentes.
- Sesgos: no documentados en la información disponible.
- Licencia MIT, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B de Alibaba, no detalladas en esta ficha.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/open-edge-platform/qwen3.5-4B-int4-ov-dls
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- IR INT4 de origen: https://huggingface.co/OpenVINO/Qwen3.5-4B-int4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
