# Chungulus/Qwen3.8-27B-Q3_K_L-GGUF

## Resumen

El repositorio `Chungulus/Qwen3.8-27B-Q3_K_L-GGUF` contiene una cuantización GGUF en formato `Q3_K_L` del modelo vision-lenguaje `Qwen/Qwen3.8-27B`, desarrollado por Qwen (Alibaba). Se trata de una cuantización vanilla, sin fine-tuning ni modificaciones de alineación, que preserva byte a byte los pesos del checkpoint oficial. El modelo base es un transformer denso de 27 320 millones de parámetros con arquitectura híbrida (Gated DeltaNet y atención completa), capacidad de visión y razonamiento, y una ventana de contexto nativa de 262 000 tokens según las fuentes consultadas.

Esta cuantización es relevante porque permite ejecutar un modelo de 27B con capacidades multimodales en hardware de consumo, reduciendo el tamaño de los pesos de aproximadamente 55 GB (en FP16) a unos 14,56 GB para el tensor principal, más el proyector de visión en F16. El autor, Chungulus, ha validado el artefacto con pruebas funcionales de generación de texto, tool calling, visión y video, y controles de pensamiento, aunque no se publican resultados de benchmarks. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet / atención completa (Qwen3.8) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (nativo, según fuentes externas) |
| Tipos de cuantizacion | Q3_K_L (llama.cpp K/IQ quantization) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifica en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tensor principal) + GGUF (proyector de visión F16) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` emplea una arquitectura híbrida que combina capas con Gated DeltaNet (una variante de atención lineal eficiente) con capas de atención completa, lo que reduce el coste computacional en contextos largos. Incluye un codificador de visión y un proyector multimodal, así como tensores MTP (multi-token prediction) que permiten aceleración especulativa, aunque el autor de esta cuantización no la anuncia como soportada. El modelo soporta controles de pensamiento (`enable_thinking`, `reasoning_effort`, `preserve_thinking`) y un formato nativo de tool calling.

Esta cuantización no ha sido entrenada: es una conversión directa de los pesos oficiales mediante llama.cpp (revisión `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`). La cuantización `Q3_K_L` utiliza K-quants sin calibración, salvo en los tensores que requieren IQ (integrated quantization) donde se emplearon prompts locales representativos. El repositorio contiene 1199 tensores, incluyendo 333 de visión y 15 de MTP.

## Capacidades

- Generación de texto y razonamiento multi-step con control de esfuerzo de razonamiento configurable.
- Comprensión de imágenes y video: el modelo acepta entradas visuales a través del proyector de visión (validado con tres casos de imagen local deterministas).
- Tool calling / function calling: soporta el formato nativo de Qwen, validado en cinco casos.
- Control de pensamiento: permite activar o desactivar el modo de razonamiento explícito y preservar cadenas de pensamiento.
- Capacidades multilingües: no documentadas en esta ficha, pero el modelo base Qwen3.8 es conocido por su soporte multilingüe amplio.
- Arquitectura híbrida con Gated DeltaNet: eficiencia en contextos largos (262K tokens) con menor coste de atención.

## Casos de uso

- Asistencia al cliente con contexto largo: con 262K tokens de ventana, el modelo puede mantener conversaciones multi-turno extensas y recordar detalles de interacciones previas, integrándose en sistemas de ticketing o chat en vivo.
- Generación de código en producción: soporta tool calling y puede conectarse a APIs de desarrollo, generando, revisando y depurando código en pipelines de CI/CD.
- Análisis de documentos visuales: al aceptar imágenes, puede extraer información de capturas de pantalla, diagramas o formularios escaneados, útil en automatización de oficina.
- Agentes autónomos de larga duración: su capacidad de razonamiento y contexto amplio permite planificar y ejecutar tareas multi-paso, como navegación web o gestión de proyectos.
- Asistente de investigación: combinando lectura de papers (texto) y figuras (imágenes), puede resumir artículos científicos y responder preguntas técnicas.
- Despliegue en hardware de consumo: al ser una cuantización Q3_K_L, cabe en GPUs de 16-24 GB, permitiendo prototipado local de aplicaciones multimodales sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la validación se limitó a pruebas funcionales (generación de texto, tool calling, visión) y a una medición de velocidad de 14,77 tokens/s en el host de validación, pero no se proporcionan métricas estándar como MMLU, HumanEval o GSM8K. Tampoco se comparan con el modelo base sin cuantizar.

## Requisitos de hardware

- Memoria total recomendada: aproximadamente 19 GB (modelo + proyector de visión + overhead de runtime), según la model card. El archivo GGUF principal pesa 14,56 GB y el proyector F16 unos 0,94 GB (diferencia con el tamaño total del repo de 15,5 GB).
- VRAM estimada para inferencia: con cuantización Q3_K_L, el modelo cabe en GPUs con 16 GB de VRAM (p. ej., RTX 4080, RTX 4090) si se gestiona el KV cache con moderación. Para contextos largos (cercanos a 262K) se necesitaría más memoria o técnicas de offloading.
- GPU recomendadas: RTX 4090 (24 GB) para uso cómodo, o GPUs de 16 GB con limitación de contexto. También es viable en Apple Silicon con Metal (el ejemplo de compilación incluye `GGML_METAL=ON`).
- Opciones de despliegue: llama.cpp (cliente `llama-mtmd-cli`), compatible con servidores que soporten GGUF (llama.cpp server, Ollama, LM Studio). No se menciona vLLM ni TGI en la documentación.
- Latencia y throughput: la validación reporta 14,77 tokens/s en el host de prueba, pero este valor depende del hardware y no es una garantía.

## Comparativa con modelos similares

No se dispone de datos de comparación con otras cuantizaciones del mismo modelo (p. ej., Q2_K, Q4_K_M) ni con modelos alternativos de tamaño similar (como Qwen2.5-VL-32B o Llama-3.2-Vision-11B) en la información proporcionada. La cuantización Q3_K_L es una de las más agresivas dentro de la familia GGUF, priorizando el ahorro de memoria sobre la fidelidad. Para una comparativa rigurosa se necesitarían benchmarks del modelo base y de las distintas cuantizaciones, que no están disponibles en este repositorio.

## Limitaciones y advertencias

- La cuantización Q3_K_L reduce la calidad de salida respecto al modelo en FP16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- El contexto máximo no ha sido probado: la validación solo utilizó prompts de hasta 73 tokens, por lo que no se garantiza el funcionamiento correcto en ventanas largas.
- El runtime debe soportar la arquitectura híbrida de Qwen3.8 (Gated DeltaNet + atención completa), el codificador de visión, el tokenizador y los metadatos MTP. No basta con cargar solo el tensor de lenguaje.
- La aceleración especulativa mediante MTP no está anunciada como soportada en esta cuantización, aunque los tensores se conservan.
- No se han publicado benchmarks de rendimiento, por lo que no es posible evaluar la degradación exacta frente al modelo original.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y cualquier dependencia adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Qwen3.8-27B-Q3_K_L-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio combinado con validación: https://huggingface.co/Chungulus/Qwen3.8-27B-GGUF/tree/f519a212d6c15cd3292b6ca835dd8ebf235642c0
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de LM Studio: https://lmstudio.ai/models/qwen3.8
- Artículo de Yottalabs sobre ejecución local: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Artículo de Ofox sobre requisitos de VRAM: https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
