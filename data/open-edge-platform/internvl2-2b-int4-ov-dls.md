# open-edge-platform/internvl2-2B-int4-ov-dls

## Resumen

InternVL2-2B INT4 (OpenVINO) es una distribucion optimizada del modelo vision-lenguaje InternVL2-2B de OpenGVLab, empaquetada por el equipo open-edge-platform de Intel para su ejecucion mediante OpenVINO GenAI. El modelo original combina un encoder visual con un modelo de lenguaje para tareas de comprension de imagen y video; esta variante concreta se distribuye como representacion intermedia (IR) de OpenVINO con pesos comprimidos a INT4 mediante NNCF, de modo que puede descargarse y ejecutarse directamente sin pasos adicionales de exportacion o cuantizacion local.

El caso de uso destacado por el autor es la descripcion de video en entornos de ciudad inteligente (smart city) y vigilancia en el borde (edge): dada una secuencia de video de una camara de trafico y un prompt en lenguaje natural, el modelo genera subtitulos continuos describiendo vehiculos, peatones y flujo de trafico. La distribucion incluye ejemplos tanto para OpenVINO GenAI como para Intel DLStreamer.

Es relevante ahora porque ofrece una via de despliegue de un VLM compacto (2B parametros) en CPU y GPU de Intel sin necesidad de GPU de datacenter, con un peso de descarga de aproximadamente 1,44 GB en INT4. La licencia es MIT y el unico idioma declarado es el ingles. El soporte de NPU no esta contemplado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (InternVL2: encoder visual + LLM); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 2B (segun nombre del modelo base InternVL2-2B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (compresion de pesos con NNCF); unica precision soportada en esta distribucion |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4), consumible via OpenVINO GenAI |
| Hardware soportado | CPU y GPU; NPU no soportada |
| Tamano de descarga | ~1,44 GB (IR INT4) |
| Framework de inferencia | OpenVINO GenAI; tambien Intel DLStreamer |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Esta ficha describe una distribucion optimizada, no un entrenamiento nuevo. El modelo base es InternVL2-2B de OpenGVLab, un modelo vision-lenguaje que combina un encoder visual con un modelo de lenguaje para tareas de comprension de imagen y texto. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica de esta distribucion es el pipeline de despliegue: los pesos del modelo base se convierten a OpenVINO IR y se comprimen a INT4 mediante NNCF (Neural Network Compression Framework), produciendo un artefacto listo para OpenVINO GenAI. El ejemplo incluido procesa video con OpenCV, muestrea frames cada `FRAME_STRIDE` (15 por defecto), ejecuta inferencia VLM por frame con un `max_new_tokens` de 40 y superpone el subtitulo resultante sobre el video. El modelo puede ejecutarse en GPU (con cache opcional via `CACHE_DIR`) o en CPU cambiando la variable `DEVICE`.

## Capacidades

- Descripcion de imagenes y video en lenguaje natural a partir de un prompt de texto.
- Respuesta a preguntas visuales (visual question answering) sobre frames de camara.
- Generacion de subtitulos continuos para streams de video (captioning por frame muestreado).
- Comprension de escenas urbanas: vehiculos, peatones, flujo de trafico e intersecciones.
- Inferencia en CPU y GPU de Intel mediante OpenVINO GenAI.
- Integracion con Intel DLStreamer para pipelines de video.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): vision si; audio y thinking mode no disponibles.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe frames de camaras de trafico y genera descripciones en lenguaje natural de vehiculos, peatones y actividad en intersecciones, adecuado por su tamano compacto (2B en INT4) para despliegue en el borde.
- Triaje y monitorizacion de incidentes: analisis automatico de escenas callejeras para detectar y describir eventos anormales, con el modelo ejecutandose sobre CPU o GPU local en la camara o en un nodo cercano.
- Analisis de trafico: registro multimodal de densidad de vehiculos, flujo de peatones y actividad en pasos de cebra, generando texto estructurado a partir de video.
- Asistencia a operadores: pregunta-respuesta visual conversacional sobre feeds de camara en directo, permitiendo a un operador consultar en lenguaje natural que ocurre en una escena.
- Pipelines de video con DLStreamer: integracion del modelo en cadenas de procesamiento de video de Intel para anadir subtitulos descriptivos a streams existentes.
- Prototipado y demos de VLM en hardware Intel: al distribuirse como IR INT4 lista para OpenVINO GenAI, sirve para validar rapidamente casos de vision-lenguaje en portatiles o equipos de escritorio con CPU/GPU Intel sin infraestructura de datacenter.
- Enriquecimiento de metadatos de video: generacion automatica de descripciones textuales indexables para busqueda y archivo de grabaciones de vigilancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no se especifica de forma explicita; el artefacto INT4 pesa ~1,44 GB, por lo que la huella de pesos es reducida y el consumo adicional depende de las activaciones y del encoder visual.
- GPU recomendadas: no se listan modelos concretos; el autor indica soporte generico de GPU (arquitecturas Intel) y CPU.
- Cabe en GPU consumer: si, segun el soporte declarado de GPU y el tamano del artefacto INT4 (~1,44 GB); no se enumeran modelos concretos de GPU consumer.
- NPU: no soportada.
- Opciones de despliegue: OpenVINO GenAI (`openvino_genai.VLMPipeline`) e Intel DLStreamer.
- Requisitos de software: Python 3.11+, FFmpeg para transcodificar el video de ejemplo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El ejemplo usa `max_new_tokens = 40` y muestreo cada 15 frames, lo que sugiere inferencia por frame a baja frecuencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| InternVL2-2B INT4 (OpenVINO) | 2B | no disponible | MIT | OpenVINO IR INT4, OpenVINO GenAI / DLStreamer | Distribucion optimizada para CPU/GPU Intel; solo ingles |
| InternVL2-2B (OpenGVLab) | 2B | no disponible | no disponible en esta ficha | PyTorch / Transformers | Modelo base sin cuantizar |
| OpenVINO/InternVL2-2B-int4-ov | 2B | no disponible | no disponible en esta ficha | OpenVINO IR INT4 | Build INT4 de referencia usado como fuente por esta distribucion |

No se dispone de datos de benchmarks para establecer una comparacion de rendimiento con alternativas.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en otros idiomas no esta garantizado.
- No hay resultados de benchmarks publicados en la informacion disponible, por lo que la calidad real en tareas concretas no puede verificarse a priori.
- Riesgo de alucinacion inherente a los modelos vision-lenguaje: las descripciones pueden incluir elementos no presentes en la escena.
- La cuantizacion INT4 puede degradar la precision respecto al modelo base en FP16/BF16; no se aportan mediciones de esa perdida.
- No soporta NPU; limitado a CPU y GPU.
- El ejemplo de video descrito se centra en escenas urbanas; el comportamiento fuera de ese dominio no esta documentado.
- Longitud de contexto no disponible, lo que dificulta planificar conversaciones multi-turno largas o videos extensos.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base InternVL2-2B de OpenGVLab antes de un despliegue en produccion.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta y un tamano de repo de 0.0 GB; el artefacto real se descarga mediante el script `export_and_quantize.sh`.
- El autor indica que la validacion previa se realizo con el stack de desarrollo RC1, lo que implica posibles cambios de compatibilidad con versiones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/internvl2-2B-int4-ov-dls
- Modelo base InternVL2-2B (OpenGVLab): https://huggingface.co/OpenGVLab/InternVL2-2B
- Build INT4 de referencia en OpenVINO: https://huggingface.co/OpenVINO/InternVL2-2B-int4-ov
- Documentacion de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
