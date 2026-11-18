# SoAIHQ/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.5-4B desarrollado por Qwen (Alibaba), preparada por SoAIHQ para su uso con llama.cpp y entornos compatibles. Se trata de un modelo denso de 4.326.350.848 parámetros (aproximadamente 4B) con una arquitectura híbrida que combina Gated DeltaNet con atención estándar, lo que le permite manejar una ventana de contexto de 262.144 tokens (256K) manteniendo un coste computacional contenido.

El modelo es multimodal (entrada de imagen y texto), soporta razonamiento explícito mediante modo thinking activado por defecto, y dispone de tool calling nativo. Su tamaño reducido lo hace apto para ejecutarse en portátiles y estaciones de trabajo con GPU de consumo, algo relevante para desarrolladores que necesitan un modelo local con capacidades de agente y contexto largo sin depender de infraestructura en la nube.

La relevancia actual de esta ficha radica en que combina tres capacidades poco habituales en la franja de 4B: contexto de 256K, visión y razonamiento con tool calling, todo bajo licencia Apache 2.0 y con cuantizaciones calibradas mediante importance matrix sobre un corpus propio de SoAI (chat multi-turno, código, tool calls y matemáticas). El repositorio acumula más de 113.000 descargas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Densa, híbrida Gated DeltaNet + atención |
| Parámetros totales | 4.326.350.848 (~4B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | Q4_K_M (2,8 GB), Q8_0 (4,6 GB); mmproj F16 (672,4 MB) para visión |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |
| Pipeline | image-text-to-text |
| Entrada multimodal | Texto e imagen (audio no soportado) |
| Razonamiento | Thinking activado por defecto, desactivable por petición |
| Tool calling | Sí, sintaxis nativa |
| Versión de llama.cpp de referencia | v0.5.0 |
| Tamaño del repositorio | 8,1 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa con capas híbridas que combinan Gated DeltaNet (un mecanismo de estado recurrente lineal) con atención estándar. Esta combinación busca reducir el coste de atención en secuencias muy largas, lo que hace viable la ventana de 262.144 tokens sin el crecimiento cuadrático típico de la atención completa. Al ser un modelo denso, todos los parámetros se activan en cada paso de inferencia, a diferencia de las variantes MoE.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; estos datos deben consultarse en la model card original de Qwen. La model card de la cuantización sí especifica el proceso de calibración: la imatrix de Q4_K_M se calcula sobre un corpus propio de SoAI formateado con la plantilla de chat del modelo, que incluye conversaciones multi-turno en 21 idiomas, ediciones de código en 22 lenguajes de programación, tool calls con sus resultados, matemáticas paso a paso y prosa web. Q8_0 se cuantiza sin imatrix porque el formato de llama.cpp no la utiliza. Antes de cuantizar, el pipeline verifica que los marcadores de chat, thinking y tool call se almacenen como tokens especiales y que la plantilla embebida coincida con la original.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, desactivable por petición mediante `chat_template_kwargs`.
- Comprensión de imágenes (image-text-to-text) mediante el proyector mmproj en F16.
- Tool calling y function calling con sintaxis nativa incluida en la plantilla de chat.
- Razonamiento multi-paso orientado a agentes.
- Capacidades multilingües amplias: 201 idiomas y dialectos según la model card.
- Generación y edición de código en múltiples lenguajes de programación (el corpus de calibración cubre 22).
- Matemáticas paso a paso.
- Ventana de contexto de 256K tokens para documentos largos y conversaciones extensas.
- API compatible con OpenAI a través de llama-server.
- No soporta entrada de audio.

## Casos de uso

- Asistente local en portátil: con Q4_K_M (2,8 GB) el modelo cabe en la memoria de un portátil moderno y permite conversaciones multi-turno con razonamiento, útil para desarrolladores que trabajan sin conexión o con requisitos de privacidad.
- Análisis de documentos largos: la ventana de 256K permite procesar informes, contratos o bases de código extensas en una sola pasada, resumiendo o extrayendo información sin fragmentar el contexto.
- Agente con tool calling: la sintaxis nativa de tool calls y el modo thinking permiten construir agentes que encadenan llamadas a APIs, consultas a bases de datos y ejecución de comandos, con el razonamiento intermedio visible para depuración.
- Automatización de atención al cliente: conversaciones multi-turno con contexto largo para recordar el historial completo del cliente y capacidades multilingües para atender en varios idiomas sin modelos separados.
- Asistencia de código en CI/CD: integración vía API compatible con OpenAI en pipelines que generan parches, revisan diffs o resuelven tareas de edición de código en 22 lenguajes, con la cuantización Q8_0 para máxima fidelidad si hay memoria suficiente.
- Procesamiento de imágenes en local: con el mmproj cargado, el modelo puede describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas sin enviar datos a servicios externos.
- Prototipado de investigación: al ser Apache 2.0 y ejecutable en CPU/GPU mixto con llama.cpp, sirve para experimentar con razonamiento y agentes en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere unos 2,8 GB para los pesos más la memoria del contexto, que crece con la longitud configurada; Q8_0 requiere unos 4,6 GB más contexto.
- Visión: añadir 672,4 MB del mmproj F16 si se usa entrada de imagen.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU consumer con al menos 6-8 GB de VRAM puede alojar Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores para Q4_K_M; Q8_0 requiere 8 GB o más.
- Despliegue: llama.cpp (llama-server, con UI de chat y API compatible con OpenAI), con reparto de capas entre CPU y GPU.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de contexto: Qwen recomienda al menos 128K tokens de contexto para dejar espacio al thinking y hasta 32K tokens de salida para la mayoría de consultas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado benchmarks que permitan verificar el rendimiento real frente a modelos de tamaño similar.
- El modo thinking está activado por defecto; en producción conviene desactivarlo por petición cuando no sea necesario para reducir latencia y consumo de tokens.
- La memoria necesaria crece con la longitud de contexto configurada; usar 256K tokens exige planificación de VRAM/RAM.
- SoAI no publica cuantizaciones por debajo de 4 bits, por lo que no hay opciones para hardware con menos de ~3 GB de memoria.
- Riesgo de alucinación inherente a modelos de 4B; no se documentan tasas específicas.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse en el repositorio original de Qwen.
- La información sobre idiomas (201) proviene de la model card y no se ha verificado de forma independiente.
- El soporte de audio no existe; no debe asumirse multimodalidad completa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SoAIHQ/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Sitio de SoAI: https://soai.to
- llama.cpp: https://github.com/ggml-org/llama.cpp
