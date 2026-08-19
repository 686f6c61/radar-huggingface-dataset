# Chungulus/Qwen3.8-27B-Q5_K_S-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso desarrollado por Qwen, con arquitectura híbrida que combina atención completa y capas Gated DeltaNet, e incorpora un codificador de visión para entrada de imágenes y vídeo. Este repositorio concreto contiene una cuantización GGUF en formato Q5_K_S del checkpoint oficial, realizada por Chungulus sin modificaciones sobre los pesos originales (ni fine-tuning, ni cambios de alineación ni del chat template). El modelo base tiene 27.320 millones de parámetros y una ventana de contexto de 256K tokens según la documentación oficial de Qwen3.8.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de visión-lenguaje de 27B en hardware de consumo, con un tamaño de archivo de aproximadamente 19 GB (incluyendo el proyector de visión en F16). El modelo conserva todas las capacidades del original: tool calling nativo, controles de pensamiento (enable_thinking, reasoning_effort, preserve_thinking), entrada de imágenes y vídeo, y los tensores MTP (Multi-Token Prediction) aunque no se anuncia aceleración especulativa. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida Gated DeltaNet + atención completa) con vision tower y proyector multimodal |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K (según documentación de Qwen3.8; no verificado en esta cuantización) |
| Tipos de cuantizacion | Q5_K_S (GGUF, K-quant de llama.cpp) |
| Idiomas soportados | No disponible (el modelo base de Qwen suele ser multilingüe, pero no se especifica en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo principal Q5_K_S + proyector de visión mmproj en F16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención completa con capas Gated DeltaNet, una variante de atención lineal que reduce el coste computacional en contextos largos. Además, incorpora un codificador de visión (vision tower) y un proyector multimodal (mmproj) que permiten procesar imágenes y vídeo como entrada adicional al texto. El checkpoint oficial incluye tensores MTP (Multi-Token Prediction) que podrían habilitar decodificación especulativa, aunque en esta cuantización no se anuncia dicha aceleración.

Esta cuantización es una conversión vanilla realizada con llama.cpp (revisión `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`) sin calibración adicional para los K-quants, y con prompts locales representativos solo donde la conversión IQ lo requería. No se ha realizado ningún entrenamiento adicional, fine-tuning, merge ni modificación del chat template. El inventario de tensores incluye 1.199 tensores, de los cuales 333 corresponden a la parte de visión y 15 a los tensores MTP. Los pesos fuente están fijados al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo original.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes y vídeo como entrada además de texto, y puede describir, analizar o responder sobre contenido visual.
- Tool calling nativo: validado con cinco casos del formato nativo de Qwen, lo que permite integrar el modelo en flujos de agentes que invocan funciones externas.
- Controles de pensamiento: soporta `enable_thinking`, `reasoning_effort` y `preserve_thinking` para activar o desactivar el modo de razonamiento explícito y ajustar el esfuerzo de razonamiento.
- Chat template preservado: el formato de conversación original de Qwen se mantiene intacto, lo que facilita su uso con la mayoría de frameworks compatibles con GGUF.
- Procesamiento de vídeo: el modelo puede recibir secuencias de vídeo como entrada, aunque la validación en esta cuantización solo cubrió tres casos deterministas de imagen local.
- Contexto largo: con 256K tokens de ventana teórica, puede manejar documentos extensos o conversaciones multi-turno muy largas, aunque el contexto máximo no fue probado en esta cuantización.

## Casos de uso

- Análisis de imágenes en entornos industriales: el modelo puede recibir fotografías de líneas de producción o inspección de calidad y generar informes descriptivos o detectar anomalías, gracias a su capacidad de visión y razonamiento multimodal.
- Asistentes de atención al cliente con soporte visual: integrado en un chatbot, puede procesar capturas de pantalla o fotos enviadas por usuarios para diagnosticar problemas técnicos o guiar en la resolución de incidencias.
- Agentes autónomos con tool calling: al soportar el formato nativo de Qwen, puede orquestar llamadas a APIs, bases de datos o servicios externos en flujos multi-paso, por ejemplo para automatizar tareas de gestión de proyectos o consultas empresariales.
- Generación de código con contexto de repositorio: con 256K de contexto, puede analizar un repositorio completo y generar o modificar código, integrándose en pipelines de CI/CD como asistente de revisión o generación de parches.
- Transcripción y resumen de vídeos: dado su soporte de entrada de vídeo, puede procesar grabaciones de reuniones o tutoriales y producir resúmenes estructurados o extraer acciones concretas.
- Investigación académica en visión-lenguaje: al ser una cuantización fiel del modelo original, permite experimentar con arquitecturas híbridas y multimodales en hardware de gama media sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización Q5_K_S. La model card indica que la validación funcional pasó las pruebas de generación de texto, tool calling (5 casos), visión/vídeo (3 casos) y controles de pensamiento, pero no se realizó una evaluación de rendimiento comparativa.

Según la búsqueda web, el modelo base Qwen3.8-27B (sin cuantizar) obtiene los siguientes resultados en benchmarks de agente y visión, aunque estos datos no corresponden a esta cuantización y deben tomarse como referencia del modelo original:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE (agente de código) | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

La velocidad de generación medida en el host de validación fue de 12,11 tokens/s, aunque no se especifica el hardware utilizado, por lo que este valor no es generalizable.

## Requisitos de hardware

- Memoria total necesaria: aproximadamente 23 GB para el modelo (18,97 GB), el proyector de visión (0,94 GB) y overhead de runtime. La caché KV crece con el contexto.
- GPU recomendada: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000) puede cargar el modelo completo. También es posible ejecutarlo en configuraciones de doble GPU con 12 GB cada una, o en CPU con 32 GB de RAM.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama alta de consumo (24 GB) y en algunas estaciones de trabajo con múltiples GPUs.
- Opciones de despliegue: llama.cpp (usando `llama-mtmd-cli` con el flag `--mmproj`), y cualquier runtime compatible con GGUF que soporte la arquitectura híbrida y el proyector de visión (por ejemplo, Ollama si se añade el modelo manualmente, o servidores basados en llama.cpp).
- Latencia y throughput: la validación reportó 12,11 tokens/s en el host de prueba, pero este valor depende fuertemente del hardware y no se puede extrapolar sin más datos.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa detallada con otras cuantizaciones del mismo modelo o con modelos alternativos. Se puede señalar lo siguiente:

| Modelo | Parámetros | Contexto | Cuantización | Tamaño archivo | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27,3B | 256K | safetensors (BF16) | ~55 GB | Apache-2.0 |
| Chungulus/Qwen3.8-27B-Q5_K_S-GGUF (este repo) | 27,3B | 256K (teórico) | Q5_K_S GGUF | 19,9 GB | Apache-2.0 |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | 256K | Múltiples (Q4_K_M, Q8_0, etc.) | Variable | Apache-2.0 |

Existen otras cuantizaciones del mismo modelo (por ejemplo, de Unsloth o la variante MTP de Chungulus) que ofrecen diferentes balances entre calidad y tamaño, pero no se dispone de sus especificaciones exactas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización Q5_K_S puede reducir la calidad de salida en comparación con el modelo en BF16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- El contexto máximo de 256K no fue verificado en esta cuantización; la validación solo probó prompts de hasta 73 tokens, por lo que no se garantiza el rendimiento con contextos muy largos.
- El runtime debe soportar la arquitectura híbrida (Gated DeltaNet + atención completa), el vision tower, el proyector y los tensores MTP; cargar solo el tensor de lenguaje no es suficiente.
- Los tensores MTP están presentes pero no se anuncia aceleración especulativa; su uso puede requerir soporte específico del runtime.
- No se han publicado benchmarks de rendimiento para esta cuantización, por lo que las cifras del modelo base no son directamente aplicables.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución y las condiciones de la licencia original de Qwen.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/Chungulus/Qwen3.8-27B-Q5_K_S-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio combinado con validación: https://huggingface.co/Chungulus/Qwen3.8-27B-GGUF/tree/f519a212d6c15cd3292b6ca835dd8ebf235642c0
- Cuantización MTP de Chungulus: https://huggingface.co/Chungulus/Qwen3.8-27B-MTP-GGUF
- Cuantizaciones de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
