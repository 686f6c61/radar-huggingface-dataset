# open-edge-platform/internvl2-1B-int4-ov-dls

## Resumen

InternVL2-1B INT4 (OpenVINO) es una distribucion optimizada del modelo vision-lenguaje InternVL2-1B de OpenGVLab, empaquetada por el equipo open-edge-platform de Intel para su ejecucion en dispositivos de borde mediante OpenVINO GenAI. El modelo original combina un codificador visual con un modelo de lenguaje de aproximadamente mil millones de parametros, y esta version concreta se distribuye como representacion intermedia (IR) de OpenVINO con pesos comprimidos a INT4 mediante NNCF, lo que reduce el peso a unos 761 MB.

El caso de uso principal que documenta el autor es la descripcion automatica de video en entornos de ciudad inteligente: dada una secuencia de una camara de trafico y un prompt en lenguaje natural, el modelo genera subtitulos continuos describiendo vehiculos, peatones y flujo de trafico. Se integra con OpenVINO GenAI y con Intel DLStreamer, y esta pensado para despliegues tipo Metro en vigilancia urbana, triaje de incidentes y asistencia a operadores.

Su relevancia actual radica en que permite ejecutar un VLM multimodal en CPU o GPU de consumo sin pasos adicionales de exportacion ni cuantizacion local: el artefacto descargado ya esta listo para inferencia. La contrapartida es un alcance limitado (solo ingles, contexto corto, tarea de captioning) y la ausencia de soporte para NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (InternVL2), codificador visual + modelo de lenguaje transformer; distribuido como IR de OpenVINO |
| Parametros totales | 1B (modelo base InternVL2-1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (compresion de pesos con NNCF); unica precision soportada en este artefacto |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4), ~761 MB |
| Motor de inferencia | OpenVINO GenAI |
| Hardware soportado | CPU y GPU; NPU no soportado |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base InternVL2-1B sigue la arquitectura InternVL2, que empareja un codificador visual con un modelo de lenguaje de aproximadamente mil millones de parametros para tareas de comprension imagen-texto. Esta distribucion no reentrena el modelo: parte del build pre-cuantizado OpenVINO/InternVL2-1B-int4-ov y lo empaqueta junto con scripts de descarga y ejemplos de inferencia. La cuantizacion INT4 se realiza con NNCF (Neural Network Compression Framework) de Intel, comprimiendo los pesos para reducir el tamano y acelerar la inferencia en CPU y GPU.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion especulativa ni tecnicas de atencion alternativa. La innovacion principal de este artefacto es de despliegue: un IR INT4 listo para usar con OpenVINO GenAI y DLStreamer, sin exportacion ni cuantizacion local.

## Capacidades

- Generacion de descripciones en lenguaje natural a partir de imagenes y fotogramas de video (image-text-to-text).
- Descripcion de escenas urbanas: vehiculos, peatones, flujo de trafico y actividad en cruces.
- Respuesta a prompts libres en ingles sobre el contenido visual.
- Procesamiento de video mediante muestreo de fotogramas (el ejemplo usa un stride de 15 fotogramas) y generacion periodica de subtitulos.
- Integracion con OpenVINO GenAI (VLMPipeline) y con Intel DLStreamer para pipelines de video.
- Ejecucion en CPU y GPU; no soporta NPU.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe fotogramas de camaras de trafico y genera descripciones en tiempo real de intersecciones y rotondas, adecuado por su huella de 761 MB y su ejecucion en CPU/GPU de borde.
- Triaje de incidentes: analisis automatico de escenas callejeras para detectar y describir eventos anormales, con salida en texto que puede registrarse o alertar a operadores.
- Analisis de trafico: registro multimodal de densidad de vehiculos, flujo de peatones y actividad en pasos de cebra, generando trazas textuales consultables.
- Asistencia a operadores: preguntas y respuestas visuales conversacionales sobre feeds de camara en directo, usando el modelo como capa de descripcion bajo demanda.
- Procesamiento de video en el borde con DLStreamer: integracion en pipelines GStreamer de Intel para superponer subtitulos generados sobre los fotogramas, sin depender de la nube.
- Prototipado de aplicaciones VLM multimodales: al ser un IR INT4 listo para OpenVINO GenAI, sirve para validar flujos image-text-to-text en hardware Intel sin pasos de exportacion.
- Demo educativa o de evaluacion: el ejemplo incluido procesa un clip de 10 segundos y superpone el texto generado, util para verificar el stack OpenVINO en un equipo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el artefacto pesa ~761 MB en INT4, por lo que la huella de pesos es inferior a 1 GB y el consumo adicional depende del runtime y de las activaciones.
- Hardware soportado: CPU y GPU. NPU no soportado.
- GPU de consumo: no se especifican modelos concretos; al tratarse de un modelo de 1B en INT4, es plausible su ejecucion en GPU de consumo, pero el autor no publica una lista validada.
- Despliegue: OpenVINO GenAI (VLMPipeline) y Intel DLStreamer. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Requisitos de software: Python 3.11+ y FFmpeg para transcodificar el video de ejemplo.
- Latencia y throughput: no disponibles. El ejemplo limita la generacion a 40 tokens nuevos por fotograma y evalua uno de cada 15 fotogramas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| InternVL2-1B INT4 (OpenVINO) | 1B | no disponible | OpenVINO IR INT4 / OpenVINO GenAI | MIT | Optimizado para CPU/GPU de borde; solo ingles |
| InternVL2-1B (OpenGVLab) | 1B | no disponible | PyTorch / Transformers | no disponible en la informacion | Modelo base sin cuantizar |
| OpenVINO/InternVL2-1B-int4-ov | 1B | no disponible | OpenVINO IR INT4 | no disponible en la informacion | Build INT4 del que deriva este artefacto |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan capacidades multilingues.
- Tarea acotada a descripcion visual y respuesta a prompts sobre imagenes o video; no se documenta tool calling, agentes ni razonamiento multi-paso.
- No soporta NPU; el despliegue queda restringido a CPU y GPU.
- Unica precision disponible: INT4. La cuantizacion agresiva puede degradar la calidad de las descripciones frente al modelo en precision completa.
- Riesgo de alucinacion inherente a los VLM: puede describir objetos o eventos no presentes en la escena, especialmente con fotogramas ambiguos o de baja calidad.
- El ejemplo evalua solo uno de cada 15 fotogramas y limita la salida a 40 tokens, lo que puede perder eventos breves en video.
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0.0 GB, lo que sugiere que los pesos se descargan desde el repositorio OpenVINO/InternVL2-1B-int4-ov mediante el script incluido, no que esten alojados aqui.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base InternVL2-1B de OpenGVLab, cuya licencia no se detalla en la informacion disponible.
- Uso en vigilancia: la aplicacion sobre camaras urbanas implica consideraciones de privacidad y cumplimiento normativo que el autor no aborda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/internvl2-1B-int4-ov-dls
- Modelo base InternVL2-1B: https://huggingface.co/OpenGVLab/InternVL2-1B
- Build INT4 de OpenVINO: https://huggingface.co/OpenVINO/InternVL2-1B-int4-ov
- Documentacion de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
