# Chungulus/Qwen3.8-27B-Q2_K-GGUF

## Resumen

El modelo `Chungulus/Qwen3.8-27B-Q2_K-GGUF` es una cuantización GGUF en formato Q2_K del modelo vision-lenguaje Qwen3.8-27B, desarrollado por Qwen y publicado originalmente en Hugging Face. Esta versión, creada por el usuario Chungulus, es una cuantización vanilla sin modificaciones sobre los pesos oficiales, pensada para ejecución local eficiente con llama.cpp y herramientas compatibles. El modelo base es un transformer denso de 27 000 millones de parámetros con arquitectura híbrida Gated DeltaNet y atención completa, que incorpora un codificador de visión, soporte para razonamiento configurable y una ventana de contexto nativa de 262 000 tokens.

La relevancia de esta ficha radica en que ofrece una opción de despliegue en hardware modesto: el archivo GGUF principal ocupa 10,9 GB, lo que permite ejecutar el modelo en GPUs de consumo con 12-16 GB de VRAM o incluso en sistemas con memoria unificada. La cuantización Q2_K reduce drásticamente el tamaño frente a los pesos originales en FP16, a costa de una posible pérdida de calidad. El repositorio incluye también el proyector de visión en FP16 (`mmproj-Qwen3.8-27B-F16.gguf`), necesario para tareas de imagen y vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet + atención completa) con codificador de visión y MTP (Multi-Token Prediction) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (nativo del modelo base; no verificado en esta cuantización) |
| Tipos de cuantizacion | Q2_K (este repo); el modelo base admite otras cuantizaciones GGUF (ver repo principal) |
| Idiomas soportados | No disponible (el modelo base de Qwen suele ser multilingüe, pero no se especifica en la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) + proyector de visión en FP16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas con Gated DeltaNet (una variante de atención lineal eficiente) con capas de atención completa tradicional. Esta mezcla busca reducir el coste computacional en contextos largos manteniendo la calidad. Además, incorpora un codificador de visión y un proyector para tareas de imagen y vídeo, así como tensores y metadatos MTP (Multi-Token Prediction) que permiten aceleración especulativa, aunque el autor de esta cuantización no la anuncia como funcional.

El proceso de cuantización se realizó con llama.cpp (revisión `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`) utilizando cuantización K/IQ. No se aplicó calibración para los K-quants; solo se usaron prompts locales representativos donde la conversión IQ lo requería. Los pesos fuente están fijados al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del checkpoint oficial. El autor validó la generación de texto, el tool calling (cinco casos nativos), la visión y vídeo (tres casos deterministas), y los controles de thinking, confirmando que la estructura híbrida y los tensores MTP se conservan.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (`enable_thinking`, `reasoning_effort`, `preserve_thinking`).
- Comprensión de imágenes y vídeo a través del proyector de visión incluido.
- Tool calling / function calling en formato nativo de Qwen (validado en cinco casos).
- Soporte para agentes y tareas de razonamiento multi-paso gracias a la ventana de contexto larga (262K tokens).
- Capacidades multilingües no documentadas explícitamente en esta cuantización, pero heredadas del modelo base.
- Chat template preservado y verificado contra la fuente original.

## Casos de uso

- Asistente de programación con contexto largo: el modelo puede manejar repositorios completos o archivos extensos gracias a su ventana de 262K tokens, facilitando tareas de refactorización, generación de código y revisión.
- Análisis de documentos técnicos con imágenes: al combinar visión y texto, permite extraer información de diagramas, capturas de pantalla o documentación escaneada.
- Automatización de atención al cliente: con tool calling nativo, puede integrarse en sistemas de tickets, consultar bases de conocimiento y gestionar conversaciones multi-turno.
- Agente autónomo para investigación: su capacidad de razonamiento y contexto largo le permite planificar y ejecutar búsquedas web, resumir artículos y sintetizar resultados.
- Procesamiento de vídeo para resúmenes: el soporte de vídeo (validado en casos deterministas) permite generar descripciones o transcripciones de contenido audiovisual.
- Despliegue en entornos con recursos limitados: al ser una cuantización Q2_K de 10,9 GB, puede ejecutarse en portátiles con GPU de 12 GB o en sistemas con memoria unificada (p. ej., Apple Silicon con 16 GB), ideal para prototipado y uso personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una prueba de humo por archivo con una velocidad de generación de 18,92 tokens/s en el host de validación, sin especificar el hardware. No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks para esta cuantización concreta. Se recomienda consultar los benchmarks del modelo base en la documentación oficial de Qwen.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF principal ocupa 10,9 GB; el proyector de visión en FP16 añade aproximadamente 0,9 GB. Con overhead de runtime y KV cache, se recomiendan al menos 15 GB de memoria disponible (según el autor).
- GPU recomendadas: tarjetas con 16 GB de VRAM (RTX 4080, RTX 4090, A100 40GB) o GPUs de 12 GB con cuantización más agresiva y contexto reducido. También es viable en Apple Silicon con 16 GB de memoria unificada.
- En consumer GPU: sí, cabe en RTX 4080/4090 y en GPUs de 12 GB (p. ej., RTX 3060) si se limita el contexto y se usa offloading parcial.
- Opciones de despliegue: llama.cpp (cliente `llama-mtmd-cli`), LM Studio, Ollama (si soporta el formato), y cualquier runtime compatible con GGUF y la arquitectura híbrida.
- Latencia y throughput: la validación reporta ~18,9 tokens/s en el host de prueba, pero el rendimiento real depende del hardware, la longitud de contexto y la configuración de thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | 262K | Apache-2.0 | safetensors | Modelo original sin cuantizar, requiere ~54 GB en FP16 |
| Qwen3.8-27B-Q2_K (este repo) | 27,3 B | 262K (no verificado) | Apache-2.0 | GGUF Q2_K | Cuantización agresiva, ~10,9 GB |
| Qwen3-30B-A3B (MoE) | 30 B (3 B activos) | 128K | Apache-2.0 | safetensors/GGUF | Alternativa MoE con menor coste de inferencia, pero sin visión |
| Qwen2.5-VL-32B | 32 B | 128K | Apache-2.0 | safetensors/GGUF | Modelo vision-lenguaje de generación anterior, mayor tamaño |

La comparativa se basa en datos públicos de los respectivos repositorios. No se dispone de benchmarks comparativos directos para esta cuantización.

## Limitaciones y advertencias

- La cuantización Q2_K es de muy baja precisión; puede degradar significativamente la calidad de generación, especialmente en tareas de razonamiento complejo o matemáticas.
- El contexto máximo de 262K tokens no ha sido verificado en esta cuantización; la validación solo probó prompts de hasta 73 tokens. El uso de contextos muy largos puede requerir más memoria de la estimada.
- El runtime debe soportar la arquitectura híbrida (Gated DeltaNet + atención completa), el codificador de visión, el tokenizador y los metadatos MTP. No basta con cargar solo el tensor de lenguaje.
- No se garantiza la aceleración especulativa mediante MTP; el autor no la anuncia como funcional.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente y revisar los términos del modelo base.
- Riesgo de alucinaciones y sesgos inherentes al modelo base, que pueden verse amplificados por la cuantización.
- No se han publicado benchmarks de rendimiento para esta cuantización; los resultados pueden variar notablemente respecto al modelo original.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/Chungulus/Qwen3.8-27B-Q2_K-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio combinado con validación: https://huggingface.co/Chungulus/Qwen3.8-27B-GGUF/tree/f519a212d6c15cd3292b6ca835dd8ebf235642c0
- Repositorio MTP GGUF: https://huggingface.co/Chungulus/Qwen3.8-27B-MTP-GGUF
- Documentación de LM Studio: https://lmstudio.ai/models/qwen3.8
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Seguimiento de benchmarks y especificaciones: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Documentación de Unsloth: https://unsloth.ai/docs/models/qwen3.8
