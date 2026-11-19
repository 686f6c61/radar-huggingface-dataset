# open-edge-platform/qwen3.5-2B-int4-ov-dls

## Resumen
Qwen3.5-2B INT4 (OpenVINO) es una distribucion pre-cuantizada del modelo vision-lenguaje Qwen3.5-2B de Alibaba, empaquetada por open-edge-platform (Intel) para su ejecucion en hardware Intel mediante OpenVINO GenAI. El modelo combina comprension de imagen y video con generacion de texto en un unico transformer de 2B parametros, y se distribuye como representacion intermedia (IR) de OpenVINO con pesos comprimidos a INT4 mediante NNCF, lo que permite descargarlo y ejecutarlo directamente sin exportacion ni cuantizacion local.

El caso de uso principal documentado es la descripcion en lenguaje natural de video de vigilancia urbana (smart city): dada una secuencia de una camara de trafico y un prompt en lenguaje natural, el modelo genera subtitulos continuos describiendo vehiculos, peatones y flujo de trafico. Esta orientado a despliegues edge en CPU y GPU Intel, con soporte de integracion en Intel DLStreamer y OpenVINO GenAI.

Es relevante ahora porque reduce la barrera de entrada para VLM en analitica de video en el borde: el artefacto INT4 ocupa 1,99 GB, no requiere NPU (solo CPU y GPU), y se integra con pipelines de vision por computador existentes mediante el elemento `gvagenai`. La licencia MIT facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (Qwen3.5-2B base, multimodal image-text-to-text) |
| Parametros totales | 2B (modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (compresion de pesos con NNCF); unica precision soportada |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4), con tokenizer/detokenizer OpenVINO; tamano del artefacto 1,99 GB |

## Arquitectura y entrenamiento
El modelo es una adaptacion del Qwen3.5-2B de Alibaba, un VLM compacto de tipo image-text-to-text que procesa imagenes (frames de video) junto con un prompt textual y genera descripciones en lenguaje natural. La ficha del autor no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO; esa informacion no esta disponible en la documentacion proporcionada.

La innovacion tecnica de este artefacto no esta en la arquitectura del modelo base, sino en el pipeline de despliegue: los pesos se comprimen a INT4 con NNCF y se exportan a IR de OpenVINO, de modo que OpenVINO GenAI puede cargar el modelo directamente. El ejemplo incluido procesa video con OpenCV, aplica un `FRAME_STRIDE` de 15 (una inferencia cada 15 frames), limita la generacion a `max_new_tokens = 40` y superpone el subtitulo generado en un banner superior del frame. Se advierte de que si el tokenizer incluido es mas nuevo que el runtime OpenVINO activo, es necesario reconvertir `openvino_tokenizer`/`openvino_detokenizer` para evitar un fallo del elemento `gvagenai`.

## Capacidades
- Comprension de imagen y video con generacion de texto libre (image-text-to-text).
- Descripcion de escenas urbanas: vehiculos, peatones, flujo de trafico y actividad en intersecciones.
- Respuesta a prompts en lenguaje natural sobre el contenido visual (preguntas visuales).
- Generacion de subtitulos continuos sobre streams de video para analitica en tiempo real.
- Integracion en pipelines de vision con OpenVINO GenAI y el elemento `gvagenai` de DLStreamer.
- Ejecucion en CPU y GPU Intel; NPU no soportada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.

## Casos de uso
- Vigilancia smart city: procesar el stream de una camara de trafico y generar descripciones continuas de vehiculos, peatones y actividad en la calzada, aprovechando el bajo coste del artefacto INT4 para ejecucion en el borde.
- Triaje de incidentes: detectar y describir automaticamente eventos anomalos en la via (aglomeraciones, vehiculos detenidos) a partir de las descripciones generadas sobre frames muestreados.
- Analisis de trafico: registrar de forma multimodal la densidad de vehiculos, el flujo de peatones y la actividad en pasos de cebra, con salida textual apta para indexacion y busqueda.
- Asistencia a operadores: responder preguntas en lenguaje natural sobre una camara en directo ("describe lo que ocurre en esta escena") mediante el pipeline VLM.
- Integracion en pipelines de video existentes: usar el elemento `gvagenai` de DLStreamer para anadir subtitulos generados por el modelo a un pipeline GStreamer de analitica ya desplegado.
- Prototipado en estaciones de trabajo Intel: ejecutar el ejemplo de OpenVINO GenAI en GPU o CPU de consumo para validar casos de analitica visual antes de escalar a produccion.
- Despliegue en dispositivos sin NPU: al soportar solo CPU y GPU, encaja en equipos edge Intel donde la NPU no esta disponible o no se desea usar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de video, y tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el artefacto INT4 pesa 1,99 GB, por lo que la huella de memoria del modelo es del orden de esa cifra mas las activaciones y el buffer de frames.
- Dispositivos soportados: CPU y GPU Intel. NPU no soportada.
- GPU recomendadas: no se especifican modelos concretos; la documentacion remite a la matriz de soporte de dispositivos del repositorio padre.
- GPU de consumo: no se confirma compatibilidad con modelos concretos (RTX 4090, etc.); el ejemplo usa `DEVICE = "GPU"` con OpenVINO, orientado a hardware Intel.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`) y DLStreamer (elemento `gvagenai`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de software: Python 3.11+, FFmpeg (para transcodificar el video de ejemplo), OpenVINO y OpenVINO GenAI; el ejemplo usa OpenCV para lectura y escritura de video.
- Latencia y throughput: no disponibles. El ejemplo limita la generacion a 40 tokens nuevos y evalua un frame cada 15, lo que sugiere un uso de baja frecuencia de inferencia sobre el stream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B INT4 (OpenVINO) | 2B | no disponible | OpenVINO IR INT4 / OpenVINO GenAI | MIT | VLM edge para CPU/GPU Intel, solo ingles |
| Qwen3.5-2B (base) | 2B | no disponible | PyTorch / Transformers | no disponible | Modelo original de Alibaba, sin cuantizar |
| OpenVINO/Qwen3.5-2B-int4-ov | 2B | no disponible | OpenVINO IR INT4 | no disponible | Build INT4 de referencia usado como fuente por este artefacto |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria (otros VLM de 2B); esa comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- NPU no soportada: la ejecucion queda restringida a CPU y GPU Intel.
- Unica precision disponible: INT4, lo que implica una perdida de calidad respecto al modelo base en precision completa; no se ofrecen variantes FP16/FP32 en este artefacto.
- El modelo esta orientado a descripcion de escenas de smart city; su rendimiento en otros dominios visuales no esta documentado.
- Riesgo de alucinacion en las descripciones generadas: al ser un modelo de 2B, puede inventar detalles sobre vehiculos o peatones no presentes en el frame.
- El muestreo de frames (por ejemplo, uno cada 15) puede perder eventos breves entre frames.
- La configuracion del ejemplo limita la salida a 40 tokens, insuficiente para descripciones detalladas.
- Posible incompatibilidad del tokenizer incluido con runtimes OpenVINO mas antiguos; requiere reconversion.
- El repositorio muestra 0 descargas y 0 likes, y el tamano reportado es 0.0 GB, lo que sugiere que el artefacto se descarga mediante el script desde el repositorio `OpenVINO/Qwen3.5-2B-int4-ov` y no esta alojado integramente aqui.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B de Alibaba, cuya licencia no se detalla en esta ficha.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/qwen3.5-2B-int4-ov-dls
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Build INT4 de referencia: https://huggingface.co/OpenVINO/Qwen3.5-2B-int4-ov
- Documentacion de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
