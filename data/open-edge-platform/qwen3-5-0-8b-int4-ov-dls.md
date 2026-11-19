# open-edge-platform/qwen3.5-0.8B-int4-ov-dls

## Resumen

Qwen3.5-0.8B INT4 (OpenVINO) es una distribución optimizada del modelo vision-lenguaje Qwen3.5-0.8B de Alibaba, publicada por open-edge-platform (Intel) en formato OpenVINO Intermediate Representation con pesos cuantizados a INT4 mediante NNCF. El modelo está pensado para entender y describir contenido visual (imágenes y fotogramas de vídeo) a partir de un prompt en lenguaje natural, y su caso de uso de referencia es la descripción automática de escenas de tráfico urbano en entornos de ciudad inteligente.

La propuesta de valor es el despliegue en el edge: con 0,8 mil millones de parámetros y un footprint de pesos de aproximadamente 878 MB, el modelo ofrece arranques en frío rápidos y consumo bajo, ejecutándose sobre CPU y GPU de Intel a través de OpenVINO GenAI y DLStreamer. El modelo base es un VLM de la familia Qwen3.5, y esta variante elimina los pasos de exportación y cuantización local: los pesos ya vienen comprimidos y listos para cargar directamente en el runtime.

Es relevante ahora porque traslada capacidades de descripción visual multimodal a hardware de borde sin GPU de datacenter, habilitando casos como vigilancia urbana, triaje de incidentes y análisis de flujo de tráfico con anotación en lenguaje natural sobre el propio flujo de vídeo. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada en la model card publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformer multimodal); detalles internos no disponibles |
| Parámetros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT4 (compresión de pesos con NNCF); solo se distribuye INT4 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4), con tokenizer/detokenizer OpenVINO |
| Motor de inferencia | OpenVINO GenAI |
| Hardware soportado | CPU y GPU (NPU no soportado) |
| Tamaño de pesos | ~878 MB |
| Tarea (pipeline) | image-text-to-text |
| Librería | openvino |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base Qwen3.5-0.8B más allá de su naturaleza vision-lenguaje: procesa imágenes junto con un prompt de texto y genera descripciones en lenguaje natural. Esta distribución concreta es una conversión del checkpoint original en PyTorch (Transformers) a OpenVINO IR, con los pesos comprimidos a INT4 mediante NNCF (Neural Network Compression Framework). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

El componente técnico diferencial de esta publicación no es el entrenamiento sino el pipeline de despliegue: el modelo se sirve con OpenVINO GenAI a través de `VLMPipeline`, y se integra también con Intel DLStreamer para procesar flujos de vídeo y superponer subtítulos generados sobre los fotogramas. El script de descarga re-convierte el tokenizer y detokenizer OpenVINO si la versión empaquetada es más reciente que el runtime activo, un detalle necesario para evitar fallos al cargar el tokenizer en el elemento `gvagenai`. No se describen innovaciones de decodificación (especulativa, atención lineal, etc.) en la documentación proporcionada.

## Capacidades

- Descripción de imágenes y fotogramas de vídeo en texto libre a partir de un prompt en lenguaje natural.
- Generación de subtítulos continuos sobre flujos de vídeo (captioning en tiempo de ejecución).
- Comprensión de escenas urbanas: vehículos, peatones, flujo de tráfico e intersecciones.
- Respuesta a preguntas visuales (visual question answering) sobre fotogramas de cámara.
- Procesamiento multimodal imagen + texto con generación de hasta un número configurable de tokens nuevos (en el ejemplo, `max_new_tokens = 40`).
- Ejecución en CPU y GPU de Intel mediante OpenVINO GenAI; integración con DLStreamer para pipelines de vídeo.
- Soporte de idioma limitado al inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento explícito.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe fotogramas de cámaras de tráfico y genera descripciones en lenguaje natural de vehículos, peatones e intersecciones, con un footprint inferior a 1 GB que permite desplegarlo en nodos de borde junto a la cámara.
- Triaje y monitorización de incidentes: descripción automática de escenas anómalas en la vía pública, generando texto legible por operadores o por sistemas de alerta sin necesidad de un modelo grande en el datacenter.
- Análisis de tráfico: registro multimodal de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, procesando el vídeo con DLStreamer y anotando cada fotograma con un subtítulo generado.
- Asistencia a operadores: preguntas y respuestas visuales conversacionales sobre una señal de cámara en directo, donde el operador formula una pregunta en inglés y el modelo describe lo que aparece en el fotograma.
- Anotación y etiquetado de vídeo a escala: generación automática de descripciones para conjuntos de clips urbanos, útil para construir datasets de captioning o para indexar grabaciones por contenido.
- Prototipado y demos en hardware de borde: gracias a los arranques en frío rápidos y a la distribución INT4 lista para usar, sirve para validar pipelines de VLM en equipos Intel sin GPU dedicada antes de escalar a modelos mayores.
- Procesamiento en CPU en entornos sin acelerador: al soportar CPU además de GPU, puede desplegarse en estaciones o servidores sin acelerador gráfico para tareas de descripción por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos del modelo: ~878 MB en INT4, lo que permite almacenarlo y cargarlo en dispositivos con poca memoria.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; el footprint de pesos de 878 MB más las activaciones y el contexto de imagen sugiere un consumo moderado, pero no se publica una cifra oficial.
- GPU recomendadas: no se especifican modelos concretos; la documentación indica soporte de GPU Intel a través de OpenVINO (el ejemplo usa `DEVICE = "GPU"` con caché en disco mediante `CACHE_DIR`).
- CPU: soportada explícitamente como dispositivo de ejecución alternativo (`DEVICE = "CPU"`).
- NPU: no soportada.
- Cabe en GPU de consumo: no se confirma en la información disponible; el soporte declarado es CPU y GPU Intel vía OpenVINO, no CUDA.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`), Intel DLStreamer (elemento `gvagenai`), y los scripts de descarga/exportación incluidos (`export_and_quantize.sh`).
- Latencia y throughput: no disponibles. El ejemplo usa `FRAME_STRIDE = 15` y `max_new_tokens = 40`, lo que indica un procesamiento por muestreo de fotogramas más que por fotograma completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| open-edge-platform/qwen3.5-0.8B-int4-ov-dls (este) | 0,8B | No disponible | OpenVINO IR INT4 | MIT | Optimizado para edge Intel, CPU/GPU, caso de uso de vídeo urbano |
| OpenVINO/Qwen3.5-0.8B-int4-ov | 0,8B | No disponible | OpenVINO IR INT4 | No disponible en la información | Build INT4 de referencia del mismo modelo base, sin el empaquetado de caso de uso DLStreamer |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | PyTorch / Transformers | No disponible en la información | Modelo base original de Alibaba en precisión completa |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; las descripciones y prompts en castellano no están soportados oficialmente.
- Contexto: no se publica la longitud de contexto, lo que impide planificar conversaciones multi-turno largas o prompts extensos con garantías.
- Alucinación: al ser un modelo de 0,8B parámetros para descripción visual, existe riesgo de descripciones imprecisas o inventadas de objetos y actividades; en vigilancia o triaje de incidentes requiere validación humana.
- Precisión: la cuantización INT4 puede degradar la calidad de las descripciones frente al modelo base en precisión completa; no se publican métricas de dicha degradación.
- Hardware: no hay soporte de NPU ni de CUDA; el despliegue está atado al stack OpenVINO en CPU/GPU Intel.
- Tokenizer: si la versión empaquetada es más reciente que el runtime OpenVINO activo, es necesario re-convertir el tokenizer o el elemento `gvagenai` falla al cargar; la model card documenta este paso.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y la validación se realizó con un stack de desarrollo RC1, lo que indica un estado temprano y no probado en producción a gran escala.
- Licencia: MIT, lo que permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, que no se detalla en la información disponible.
- Tamaño de repo: la información indica 0.0 GB, aunque el script descarga 878 MB de pesos; conviene verificar el contenido real del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/qwen3.5-0.8B-int4-ov-dls
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Build INT4 de referencia: https://huggingface.co/OpenVINO/Qwen3.5-0.8B-int4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
