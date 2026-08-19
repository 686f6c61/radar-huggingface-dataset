# Chungulus/Qwen3.8-27B-IQ4_NL-GGUF

## Resumen

El repositorio `Chungulus/Qwen3.8-27B-IQ4_NL-GGUF` contiene una cuantización GGUF del modelo multimodal Qwen3.8-27B, desarrollado por Alibaba Qwen. Se trata de una conversión vanilla (sin fine-tuning, merge ni modificación de plantilla de chat) realizada con llama.cpp, que preserva la arquitectura híbrida del modelo original: una combinación de Gated DeltaNet y atención completa, junto con una torre de visión y un proyector multimodal. El modelo base tiene 27.320.697.856 parámetros (27,3B) y una ventana de contexto de 256K tokens según la documentación oficial, aunque esta cuantización no ha sido validada más allá de 73 tokens de prompt.

La relevancia de esta ficha radica en que Qwen3.8-27B es uno de los primeros modelos abiertos de tamaño medio que integra visión, razonamiento y soporte de herramientas en un solo checkpoint, y esta cuantización IQ4_NL permite ejecutarlo en hardware de consumo con aproximadamente 21 GB de memoria. El repositorio incluye el archivo GGUF principal (16,131 GB) y el proyector de visión en F16 (`mmproj-Qwen3.8-27B-F16.gguf`), necesario para entrada de imágenes. La licencia es Apache-2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + atención completa, con torre de visión y proyector multimodal; incluye tensores MTP (Multi-Token Prediction) retenidos |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (según documentación del modelo base; no verificado en esta cuantización) |
| Tipos de cuantizacion | IQ4_NL (llama.cpp K/IQ quantization); existen otras cuantizaciones en repositorios como bartowski/Qwen3.8-27B-GGUF |
| Idiomas soportados | No disponible (el modelo base Qwen suele ser multilingüe, pero no se especifica en la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con archivo mmproj separado para visión en F16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas con Gated DeltaNet (una variante de atención lineal eficiente) con capas de atención completa tradicional. Esta mezcla busca equilibrar eficiencia computacional y capacidad de modelado de dependencias de largo alcance. Además, incorpora una torre de visión (vision tower) y un proyector multimodal que permiten procesar imágenes, y retiene tensores MTP (Multi-Token Prediction) que podrían habilitar decodificación especulativa, aunque el autor de esta cuantización no anuncia dicha aceleración.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada. Esta cuantización es una conversión directa de los pesos oficiales, fijados en el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, sin calibración adicional para los K-quants (solo se usaron prompts locales representativos para la conversión IQ). El autor confirma que la estructura interna del checkpoint usa el identificador `Qwen3_5ForConditionalGeneration`, pero aclara que no se trata de un modelo Qwen3.5.

## Capacidades

- Generación de texto y razonamiento: el modelo base está diseñado para tareas de chat, razonamiento y codificación, con soporte de modo de pensamiento (thinking) controlable mediante los parámetros `enable_thinking`, `reasoning_effort` y `preserve_thinking`.
- Entrada multimodal de imagen: el proyector de visión permite procesar imágenes y responder a preguntas sobre ellas. La validación incluyó tres casos de imagen local deterministas, todos superados.
- Tool calling / function calling: se validaron cinco casos de formato nativo de Qwen, todos superados, lo que permite integrar el modelo en flujos de agentes que invocan herramientas externas.
- Soporte de agentes y multi-step reasoning: gracias al modo de pensamiento y al tool calling, el modelo puede encadenar pasos de razonamiento y llamadas a herramientas.
- Capacidades multilingües: no especificadas en la documentación, pero el modelo base Qwen suele ofrecer soporte multilingüe amplio.
- Capacidades especiales: retención de tensores MTP (aunque no se anuncia decodificación especulativa), y posible soporte de video (la model card menciona "vision and video", pero solo se probaron imágenes locales).

## Casos de uso

- Atención al cliente automatizada: con una ventana de contexto de 256K tokens, el modelo puede gestionar conversaciones multi-turno con historiales extensos, resumiendo interacciones previas y manteniendo el estado del diálogo. Su capacidad de tool calling permite conectarlo a sistemas de ticketing o bases de conocimiento.
- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para generar o revisar código, aprovechando el modo de razonamiento para explicar cambios y el tool calling para ejecutar comandos o consultar APIs.
- Análisis de documentos con imágenes: al aceptar entrada de imagen, puede extraer información de capturas de pantalla, diagramas o formularios escaneados, combinando visión y texto para tareas de extracción de datos.
- Asistentes de investigación: con contexto largo, puede procesar artículos completos o libros, resumir secciones y responder preguntas con referencias, ayudando a investigadores a revisar literatura.
- Agentes autónomos de automatización: su soporte de tool calling y razonamiento multi-paso permite construir agentes que planifican y ejecutan tareas como envío de correos, gestión de calendarios o consultas a bases de datos.
- Chatbots educativos: el modo de pensamiento controlable permite explicar razonamientos paso a paso, útil para tutorías de matemáticas o ciencias, y la entrada de imagen facilita resolver problemas con figuras o gráficos.
- Despliegue en edge con GPU de consumo: al ser una cuantización IQ4_NL de 16 GB, puede ejecutarse en una RTX 4090 o similar, permitiendo prototipos locales de aplicaciones multimodales sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que esta cuantización no incluye una nueva ejecución de benchmarks; solo se realizaron pruebas de humo (smoke tests) que verificaron generación de texto, tool calling, visión y controles de pensamiento. El autor reporta una velocidad de generación de 13,99 tokens/s en el host de validación, pero no se especifican las características de dicho hardware. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF principal pesa 16,131 GB y el proyector de visión en F16 añade aproximadamente 1 GB. Con overhead de runtime y caché KV, se recomienda al menos 21 GB de memoria disponible (la model card sugiere esta cifra como guía de planificación).
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ejecutar el modelo con margen para la caché KV. También es viable en A100 de 40 GB o H100. En GPUs de 16 GB (como RTX 4080) podría ser ajustado, dependiendo del contexto.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 24 GB, y posiblemente en algunas de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con la revisión `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`), Ollama (según el artículo de yottalabs), y otros runners compatibles con GGUF como LM Studio o text-generation-webui.
- Latencia y throughput: el autor reporta 13,99 tokens/s en su host de validación, pero no se especifica el hardware. En una GPU moderna, se esperan cifras similares o superiores, aunque dependen del contexto y de la arquitectura híbrida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | 256K | Apache-2.0 | safetensors | Modelo original sin cuantizar, requiere ~54 GB en FP16 |
| Chungulus/Qwen3.8-27B-IQ4_NL-GGUF | 27,3B | 256K (teórico) | Apache-2.0 | GGUF (IQ4_NL) | Cuantización de esta ficha, ~16 GB + mmproj |
| Qwen2.5-32B-Instruct | 32,5B | 128K | Apache-2.0 | safetensors | Modelo anterior de tamaño similar, sin visión nativa |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a especificaciones técnicas. Existen otras cuantizaciones de Qwen3.8-27B en el repositorio de bartowski (por ejemplo, Q4_K_M, Q5_K_M, etc.) que ofrecen diferentes equilibrios entre tamaño y calidad, pero no se han evaluado en esta ficha.

## Limitaciones y advertencias

- La cuantización IQ4_NL puede reducir la calidad de generación, especialmente en tareas de razonamiento complejo o matemáticas, en comparación con el modelo en FP16.
- El contexto máximo de 256K no ha sido verificado en esta cuantización; la validación más larga fue de 73 tokens de prompt. No se debe asumir que el modelo maneja contextos extremos sin degradación.
- El runtime debe soportar la arquitectura híbrida completa (Gated DeltaNet, atención, torre de visión, tokenizador y metadatos MTP). Cargar solo el tensor de lenguaje no funcionará.
- El soporte de video se menciona en la model card, pero solo se probaron imágenes locales; no hay evidencia de funcionamiento con video real.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente al modelo base Qwen/Qwen3.8-27B.
- No se han publicado benchmarks independientes para esta cuantización, por lo que el rendimiento real en tareas estándar es desconocido.
- El autor advierte que la estructura interna usa el identificador `Qwen3_5ForConditionalGeneration`, lo que podría causar confusión con la familia Qwen3.5, pero no es un modelo de esa serie.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/Chungulus/Qwen3.8-27B-IQ4_NL-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de cuantizaciones alternativas (bartowski): https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Guía de ejecución local (yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Anuncio de Qwen3.8 (OpenLM): https://openlm.ai/qwen3.8/
- Guía de autoalojamiento (swfte): https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
