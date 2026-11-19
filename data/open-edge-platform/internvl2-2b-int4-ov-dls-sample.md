# open-edge-platform/internvl2-2B-int4-ov-dls-sample

## Resumen

InternVL2-2B INT4 (OpenVINO) es una distribución pre-cuantizada del modelo vision-lenguaje InternVL2-2B de OpenGVLab, empaquetada por el equipo open-edge-platform de Intel como Intermediate Representation (IR) de OpenVINO con pesos comprimidos en INT4 mediante NNCF. El artefacto está pensado para ejecutarse directamente con OpenVINO GenAI o con Intel DLStreamer sin pasos adicionales de exportación o cuantización local, y está orientado a cargas de trabajo de edge computing en CPU y GPU (sin soporte de NPU).

El caso de uso principal que documenta el autor es la descripción en lenguaje natural de vídeo de vigilancia urbana en entornos smart city: dada una secuencia de vídeo de una cámara de tráfico y un prompt en lenguaje natural, el modelo genera subtítulos continuos describiendo vehículos, peatones y flujo de tráfico. Se incluye un ejemplo funcional que procesa un clip de diez segundos de una rotonda urbana y superpone los subtítulos sobre los fotogramas.

La relevancia del artefacto es fundamentalmente de despliegue: convierte un VLM de 2B parámetros en un binario de 1,44 GB ejecutable en hardware modesto, con licencia MIT y etiquetado explícito para pipelines de videovigilancia (metro, dlstreamer, smart-city). No introduce cambios arquitectónicos respecto al modelo base; su valor está en el formato, la cuantización y los ejemplos de integración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer (InternVL2-2B base, OpenGVLab) |
| Parámetros totales | 2B (modelo base InternVL2-2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (compresión de pesos con NNCF) |
| Idiomas soportados | inglés (etiqueta `en`) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4) |
| Framework de inferencia | OpenVINO GenAI, Intel DLStreamer |
| Hardware soportado | CPU y GPU (NPU no soportado) |
| Tamaño del artefacto | 1,44 GB (IR INT4 descargado por el script) |
| Tarea (pipeline) | image-text-to-text |
| Librería | openvino |

## Arquitectura y entrenamiento

El modelo subyacente es InternVL2-2B de OpenGVLab, un vision-lenguaje model de tipo transformer que combina un codificador visual con un modelo de lenguaje para tareas de comprensión imagen-texto. Esta distribución no modifica la arquitectura: parte del checkpoint original en PyTorch/Transformers, lo exporta a OpenVINO IR y comprime los pesos a INT4 mediante NNCF (Neural Network Compression Framework). No se documentan en la información disponible los detalles del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO en el modelo base.

La innovación técnica relevante de este artefacto es de despliegue, no de modelado: la cuantización INT4 reduce el peso a 1,44 GB y permite inferencia en CPU y GPU de Intel a través de OpenVINO GenAI, con un pipeline `VLMPipeline` que acepta tensores de imagen y un prompt de texto. El ejemplo incluido procesa vídeo fotograma a fotograma con un `FRAME_STRIDE` configurable (15 por defecto), invoca el modelo cada N fotogramas y reutiliza el último subtítulo entre inferencias, lo que reduce la carga computacional en secuencias de vídeo.

## Capacidades

- Descripción de imágenes y fotogramas de vídeo en lenguaje natural a partir de un prompt de texto.
- Generación de subtítulos continuos sobre secuencias de vídeo (video description).
- Respuesta a prompts libres sobre el contenido visual (vehículos, peatones, actividad en escena).
- Integración con OpenVINO GenAI mediante `VLMPipeline` y con Intel DLStreamer para pipelines de vídeo.
- Ejecución en CPU y GPU Intel; NPU explícitamente no soportado.
- Capacidad multilingüe limitada: el artefacto está etiquetado únicamente para inglés.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni matemáticas avanzadas.

## Casos de uso

- Vigilancia smart city en tiempo real: el modelo recibe fotogramas de una cámara de tráfico y genera descripciones en lenguaje natural de vehículos, peatones y flujo circulatorio, adecuado por su tamaño reducido y su formato INT4 ejecutable en edge.
- Triaje y monitorización de incidentes: descripción automática de escenas anómalas en la vía pública, con el texto resultante enviado a un sistema de alertas o a un operador humano.
- Análisis de tráfico multimodal: registro continuo de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, combinando los subtítulos generados con metadatos de la cámara.
- Asistencia a operadores: pregunta-respuesta visual conversacional sobre feeds de cámara en directo, usando el modelo como capa de descripción en lenguaje natural.
- Procesamiento de vídeo con DLStreamer: integración en pipelines GStreamer/DLStreamer de Intel para añadir una etapa de captioning sobre el flujo de vídeo existente.
- Despliegue en hardware de borde sin GPU dedicada: al ejecutarse en CPU Intel con OpenVINO y un artefacto de 1,44 GB, encaja en equipos de campo con recursos limitados.
- Prototipado y evaluación de VLM en edge: el ejemplo incluido (`openvino_sample.py`) sirve como base para validar latencia y calidad antes de escalar a un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto INT4 ocupa 1,44 GB en disco; la huella en memoria para inferencia no se documenta explícitamente, pero el peso comprimido sitúa el requisito en el orden de pocos GB.
- Hardware soportado: CPU y GPU Intel; NPU no soportado (indicado explícitamente en la model card).
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible; el diseño apunta a iGPU/CPU de borde más que a aceleradores de datacenter.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el soporte declarado es "GPU" genérico dentro del ecosistema OpenVINO.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`), Intel DLStreamer; el ejemplo usa OpenCV para lectura/escritura de vídeo y FFmpeg para transcodificar el clip de prueba.
- Latencia y throughput: no disponibles. El ejemplo usa `max_new_tokens = 40` y un `FRAME_STRIDE` de 15 fotogramas, lo que sugiere un régimen de inferencia espaciada más que por fotograma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| InternVL2-2B INT4 (OpenVINO) | 2B | no disponible | OpenVINO IR INT4 | MIT | Este artefacto; orientado a edge CPU/GPU |
| InternVL2-2B (OpenGVLab) | 2B | no disponible | PyTorch/Transformers | no disponible en la información | Modelo base sin cuantizar |
| OpenVINO/InternVL2-2B-int4-ov | 2B | no disponible | OpenVINO IR INT4 | no disponible en la información | Build INT4 de referencia que descarga este artefacto |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: el artefacto está etiquetado únicamente para inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos: no documentados en la información disponible; al ser un modelo de descripción visual entrenado con datos no especificados, puede heredar sesgos de representación de personas y escenas urbanas.
- Alucinación: riesgo inherente a los VLM de 2B parámetros; las descripciones de escenas pueden incluir objetos o acciones no presentes, especialmente con prompts ambiguos o imágenes de baja calidad.
- Contexto: la longitud de contexto no está documentada; el ejemplo limita la generación a 40 tokens nuevos, lo que sugiere descripciones cortas.
- Licencia: MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base InternVL2-2B de OpenGVLab, cuya licencia no se detalla en la información disponible.
- Hardware: sin soporte de NPU; el rendimiento en GPU no Intel no está garantizado por el stack OpenVINO.
- Precisión: la cuantización INT4 puede degradar la calidad de las descripciones frente al modelo en FP16/BF16; no se aportan métricas de esa degradación.
- Producción: el artefacto se presenta como muestra (`dls-sample`) con un stack de validación RC1; no hay garantías de estabilidad de API ni de soporte a largo plazo indicadas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/internvl2-2B-int4-ov-dls-sample
- Modelo base InternVL2-2B: https://huggingface.co/OpenGVLab/InternVL2-2B
- Build INT4 de referencia: https://huggingface.co/OpenVINO/InternVL2-2B-int4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
