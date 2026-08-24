# SassyDiffusion/Qwen3.8-27B-heretic-GGUF

## Resumen

Qwen3.8-27B-heretic-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.8-27B tras un proceso de abliteración, publicada por el usuario SassyDiffusion en Hugging Face. El modelo base, desarrollado por el equipo de Qwen (Alibaba), es un modelo denso de 27 000 millones de parámetros con arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención clásica, e incorpora un codificador visual para comprender imágenes y vídeos. La variante heretic elimina los mecanismos de rechazo del modelo original mediante una técnica de abliteration, reduciendo las negativas de 99/100 a 4/100, manteniendo una divergencia KL de 0,0902 respecto al original.

Esta ficha es relevante porque el modelo ofrece una ventana de contexto nativa de 262 144 tokens (extensible hasta 1 000 000), soporte nativo de visión y razonamiento con modo de pensamiento controlable, y una licencia Apache 2.0 que permite uso comercial. La versión GGUF facilita su despliegue en hardware de consumo mediante llama.cpp, Ollama o LM Studio, aunque el repositorio ocupa 109 GB y requiere seleccionar una cuantización adecuada para cada GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention |
| Parámetros totales | 26 895 945 464 (26,9 B) |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantización | No disponible (repositorio GGUF de 109 GB, probablemente múltiples variantes) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de 64 capas organizadas en 16 bloques, cada uno con tres subbloques de Gated DeltaNet seguidos de FFN y un subbloque de Gated Attention. La Gated DeltaNet usa 48 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64. El FFN tiene dimensión intermedia de 17 408 y la salida LM está padded a 248 320 tokens. Incluye MTP (multi-token prediction) entrenado con múltiples pasos.

El entrenamiento original incluye pre-training y post-training, con capacidades de visión integradas mediante un codificador de imágenes y vídeo. La versión heretic aplica abliteration con el fork ara (commit edc3b12) sobre las capas 17 a 64, usando pesos de preservación de comportamiento bueno de 0,7648, de dirección de comportamiento malo de 0,0009 y de sobrecorrección de 1,0682, con 15 vecinos. El resultado reduce las negativas de 99/100 a 4/100 manteniendo una divergencia KL de 0,0902 respecto al modelo original.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas con calidad mejorada respecto a Qwen3.6-27B, especialmente en tareas de programación y trabajo profesional.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de larga duración (hasta horas).
- Modo de pensamiento (thinking mode) activado por defecto, con control por petición mediante `reasoning_effort` y preservación del contexto de razonamiento con `preserve_thinking`.
- Ejecución de agentes con planificación autónoma y manejo de feedback del entorno para tareas multi-paso.
- Soporte de tool calling integrado (el API gestionado ofrece herramientas incorporadas; el modelo local es compatible con harnesses populares).
- Capacidades multilingües no documentadas en la información proporcionada, pero heredadas del modelo base Qwen3.8.

## Casos de uso

- Razonamiento sobre documentos técnicos con imágenes: el modelo puede analizar diagramas, figuras y tablas dentro de documentos extensos de hasta 262K tokens, útil para revisión de artículos científicos o informes de ingeniería.
- Análisis de vídeo largo: con la ventana de contexto ampliada, puede resumir y responder preguntas sobre vídeos de una hora, como grabaciones de reuniones o material de formación.
- Agente autónomo con visión: combina la comprensión de imágenes con planificación multi-paso para tareas como inspección visual de código, análisis de capturas de pantalla o navegación asistida en interfaces.
- Generación de código en repositorios grandes: el contexto de 262K permite mantener visibles múltiples archivos de un proyecto, facilitando refactorizaciones y generación de código consistente.
- Asistencia profesional en investigación: razonamiento matemático y comprensión de documentos académicos para apoyar la redacción de resúmenes o la extracción de conclusiones.
- Desarrollo de asistentes conversacionales sin filtros de contenido: la versión abliterada permite desplegar chatbots con respuestas menos restrictivas en dominios como creatividad literaria o análisis de temas controvertidos, aunque requiere supervisión humana.
- Procesamiento de contratos y documentos legales: la ventana de contexto amplia permite analizar contratos extensos completos y extraer cláusulas relevantes con razonamiento multi paso.

## Benchmarks y rendimiento

No se han publicado resultados completos de benchmarks en la información proporcionada. La model card del modelo base incluye una tabla de rendimiento comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los datos numéricos no están disponibles en el texto extraído. La única métrica publicada para esta versión GGUF es la divergencia KL de 0,0902 respecto al modelo original y la tasa de negativas de 4/100, indicando que el proceso de abliteration apenas degrada el comportamiento general mientras elimina la mayoría de los rechazos.

## Requisitos de hardware

- VRAM estimada: con cuantización de 4 bits (típica en GGUF), se requieren aproximadamente 16–20 GB de VRAM; con 8 bits, entre 28–32 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantización 4 bits; A100 o H100 (80 GB) para cuantizaciones más altas o despliegue con contexto extendido.
- Compatible con GPUs de consumo: sí, con cuantización 4 bits y ventana de contexto reducida (por ejemplo, 32K–64K tokens).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. AMD ha confirmado soporte Day 0 para Ryzen AI Max y Radeon GPUs mediante LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la cuantización y la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 26,9 B | 262K (1M) | Apache 2.0 | Hugging Face, API |
| Qwen3.6-27B | 27 B (aprox.) | No disponible | Apache 2.0 | Hugging Face |
| Qwen3.7-Plus | No disponible | No disponible | Propietaria (API) | API comercial |
| Muse Glimmer-30B | 30 B (estimado) | No disponible | No disponible | No disponible |
| Qwen3.8-27B-heretic-GGUF | 26,9 B | 262K (1M) | Apache 2.0 | Hugging Face (GGUF) |

La comparativa se basa en los nombres citados en la tabla de benchmarks del modelo base, pero no se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa. Qwen3.8-27B destaca por su ventana de contexto nativa de 262K y el soporte multimodal, mientras que la versión heretic añade la eliminación de rechazos manteniendo la licencia Apache 2.0.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo de contenido, lo que puede generar respuestas con contenido dañino, ilegal o no ético. No se recomienda su uso sin supervisión humana en aplicaciones públicas.
- La divergencia KL de 0,0902 indica una desviación leve del modelo original, pero no se han evaluado exhaustivamente los sesgos ni la calidad de las respuestas en dominios sensibles.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente con contextos largos y tareas complejas.
- La ventana de contexto de 262K es nativa, pero el uso extendido a 1M puede degradar la calidad de las respuestas si no se gestiona adecuadamente la memoria.
- El repositorio GGUF de 109 GB no especifica qué cuantizaciones incluye, por lo que es necesario descargar y probar para seleccionar la adecuada.
- No se ha documentado el rendimiento en idiomas distintos del inglés; el modelo base Qwen3.8 es multilingüe, pero la versión heretic no especifica su comportamiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en producción requiere validar el cumplimiento de normativas de seguridad y ética, especialmente por el carácter no alineado del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SassyDiffusion/Qwen3.8-27B-heretic-GGUF
- Modelo base abliterado: https://huggingface.co/SassyDiffusion/Qwen3.8-27B-heretic
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Genaihub - variante similar: https://genaihub.net/agents/hf-model-0bserverx-qwen3-8-27b-heretic-abliterated-uncensored-gguf
