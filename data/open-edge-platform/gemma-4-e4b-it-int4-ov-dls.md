# open-edge-platform/gemma-4-e4b-it-int4-ov-dls

## Resumen

Gemma-4-E4B-it INT4 (OpenVINO) es una distribucion pre-cuantizada del modelo vision-lenguaje Gemma-4-E4B-it de Google, empaquetada por open-edge-platform (Intel) en formato OpenVINO IR con pesos comprimidos a INT4 mediante NNCF. El modelo base es la variante "edge" de la familia Gemma 4, orientada a cargas de trabajo multimodales en estaciones de trabajo de borde, y este paquete elimina la necesidad de exportar o cuantizar localmente: se descarga y se ejecuta directamente con OpenVINO GenAI sobre CPU o GPU.

La publicacion esta enfocada a un caso de uso concreto de ciudad inteligente: la descripcion en lenguaje natural de video procedente de camaras de trafico (vehiculos, peatones, flujo viario) mediante prompts en lenguaje natural. Incluye ejemplos funcionales tanto para OpenVINO GenAI como para Intel DLStreamer, con superposicion de subtitulos sobre los fotogramas. El repositorio tiene un tamano declarado de 0.0 GB, aunque el script de descarga referencia un IR INT4 de 6.09 GB.

Es relevante ahora porque demuestra el patron de despliegue de VLMs en el borde sin dependencia de CUDA ni de pasos de conversion: un artefacto listo para producir, con licencia MIT sobre el empaquetado y soporte explicito de CPU y GPU (NPU no soportada). La informacion disponible sobre arquitectura interna, contexto y datos de entrenamiento del modelo base es limitada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en Gemma 4; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona "expanded multimodal context" sin cifra) |
| Tipos de cuantizacion | INT4 (compresion de pesos con NNCF); unica precision publicada |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (empaquetado); licencia del modelo base no indicada en la informacion disponible |
| Formato de pesos | OpenVINO IR (INT4), con tokenizer y detokenizer OpenVINO |
| Framework de inferencia | OpenVINO GenAI, Intel DLStreamer |
| Hardware soportado | CPU y GPU; NPU no soportada |
| Tamano del artefacto | 6.09 GB (IR INT4 referenciado en el script de descarga) |
| Pipeline | image-text-to-text |
| Entrada | Video (fotogramas) o imagen + prompt en lenguaje natural |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base mas alla de identificarlo como un vision-lenguaje de Google de la familia Gemma 4, variante "E4B" orientada a borde, con contexto multimodal ampliado y razonamiento visual profundo. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Toda esa informacion debe consultarse en la model card del modelo base `google/gemma-4-E4B-it`, no incluida en la informacion proporcionada.

La innovacion tecnica de este paquete es el proceso de compresion y empaquetado: los pesos se comprimen a INT4 con NNCF y se serializan como OpenVINO IR, de modo que el usuario final no ejecuta exportacion ni cuantizacion. El pipeline de ejemplo procesa video con OpenCV, muestrea fotogramas con un stride configurable (15 por defecto) y ejecuta generacion con un limite de 40 tokens nuevos por invocacion, superponiendo el texto generado sobre el fotograma. El script de preparacion re-convierte el tokenizer si la version incluida es mas reciente que el runtime OpenVINO activo, evitando el fallo del elemento `gvagenai` al cargar el tokenizer.

## Capacidades

- Descripcion de video e imagen en lenguaje natural a partir de un prompt de texto.
- Respuesta a preguntas visuales (visual question answering) sobre fotogramas de camaras.
- Descripcion de escenas urbanas: vehiculos, peatones, flujo de trafico, pasos de peatones.
- Generacion de subtitulos continuos sincronizados con el flujo de video.
- Procesamiento por lotes de fotogramas con muestreo configurable (stride).
- Inferencia en CPU y GPU mediante OpenVINO GenAI.
- Integracion con Intel DLStreamer para pipelines de video.
- Capacidades de tool calling, agentes o modo thinking: no disponibles en la informacion proporcionada.
- Soporte multilingue: limitado a ingles segun los metadatos.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe fotogramas de camaras de trafico y genera descripciones textuales de intersecciones en tiempo real, utiles para indexar y buscar eventos en grabaciones.
- Triaje de incidentes: ante una escena anomala, el modelo produce una descripcion en lenguaje natural que puede enrutarse a operadores o sistemas de alerta, reduciendo el tiempo de revision manual.
- Analisis de trafico: registro multimodal de densidad de vehiculos, flujo de peatones y actividad en pasos de peatones, con salida textual apta para agregacion y analitica posterior.
- Asistencia a operadores: preguntas y respuestas conversacionales sobre feeds de camara en directo, permitiendo consultar el estado de una via sin revisar el video manualmente.
- Rotulacion automatica de video para archivo: generacion de metadatos y subtitulos descriptivos sobre clips grabados, aprovechando el procesamiento por fotogramas con stride para controlar coste.
- Despliegue en estaciones de borde sin GPU dedicada: al funcionar en CPU y GPU con OpenVINO, puede ejecutarse en equipos Intel de campo donde no hay CUDA disponible.
- Prototipado rapido de pipelines de vision-lenguaje: el paquete pre-cuantizado y los ejemplos de OpenVINO GenAI y DLStreamer permiten validar un flujo completo de video a texto sin pasos de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el IR INT4 ocupa 6.09 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, mas overhead de activaciones y cache KV.
- GPU: se recomienda GPU Intel integrada o discreta compatible con OpenVINO; no se especifican modelos concretos en la informacion disponible.
- CPU: soportada como dispositivo de inferencia alternativo (basta cambiar `DEVICE` a `"CPU"` en el ejemplo).
- NPU: no soportada explicitamente.
- Despliegue: OpenVINO GenAI (`VLMPipeline`) e Intel DLStreamer (elemento `gvagenai`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Aceleracion de cache: el ejemplo habilita `CACHE_DIR` en GPU para cachear el modelo compilado.
- Latencia y throughput: no disponibles; el ejemplo limita la generacion a 40 tokens nuevos por fotograma y usa stride de 15 fotogramas.
- Requisitos de software: Python 3.11+ y FFmpeg para transcodificar el video de ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-e4b-it-int4-ov-dls (este) | no disponible | no disponible | OpenVINO IR INT4 | MIT (empaquetado) | Optimizado para CPU/GPU Intel, ejemplo DLStreamer |
| OpenVINO/gemma-4-E4B-it-int4-ov | no disponible | no disponible | OpenVINO IR INT4 | no disponible | Mismo IR base sin el ejemplo de ciudad inteligente |
| google/gemma-4-E4B-it | no disponible | no disponible | PyTorch/Transformers | no disponible | Modelo base sin cuantizar |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- No soporta NPU, lo que restringe el hardware a CPU y GPU compatibles con OpenVINO.
- La cuantizacion INT4 puede degradar la calidad de las descripciones frente al modelo en precision completa; no se documenta la perdida medida.
- El ejemplo limita la generacion a 40 tokens nuevos, insuficiente para descripciones detalladas si no se ajusta.
- El muestreo por stride (15 fotogramas) puede perder eventos breves entre fotogramas analizados.
- Riesgo de alucinacion inherente a los modelos generativos: puede describir objetos o acciones no presentes en la escena.
- La licencia MIT cubre el empaquetado, pero la licencia del modelo base Gemma no se detalla en la informacion disponible; verificar antes de uso comercial.
- El repositorio declara 0.0 GB de tamano pese a referenciar un IR de 6.09 GB, lo que sugiere que los pesos se descargan desde otro repositorio en tiempo de ejecucion.
- El script de preparacion puede requerir re-conversion del tokenizer si la version incluida es mas nueva que el runtime; sin ese paso el elemento `gvagenai` falla.
- La validacion se realizo con el stack de desarrollo RC1, no con una version estable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/open-edge-platform/gemma-4-e4b-it-int4-ov-dls
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- IR INT4 de referencia: https://huggingface.co/OpenVINO/gemma-4-E4B-it-int4-ov
- Documentacion de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
