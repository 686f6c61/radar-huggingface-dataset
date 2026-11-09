# HROMIUM/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con codificador de visión, publicado por HROMIUM en Hugging Face bajo licencia Apache 2.0. Se presenta como la generación más capaz de la familia Qwen de modelos abiertos, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y flujos agénticos de largo horizonte. El modelo combina atención lineal (Gated DeltaNet) con atención clásica con compuerta (Gated Attention) en una disposición híbrida de 64 capas, lo que le permite manejar contextos nativos de 262.144 tokens extensibles hasta 1.000.000.

Con 27.781.427.952 parámetros reales (27,78B) y un tamaño de repositorio de 55,6 GB en safetensors, el modelo se posiciona como una alternativa densa y desplegable frente a modelos de mayor tamaño. Incorpora un codificador de visión nativo que le permite comprender imágenes y vídeos, incluidos vídeos de hasta una hora, y un mecanismo de predicción multi-token (MTP) entrenado con múltiples pasos que acelera la decodificación.

La relevancia actual del modelo radica en su combinación de control flexible del razonamiento (modo thinking activado por defecto, desactivable por petición, con `reasoning_effort` ajustable y `preserve_thinking` para retener contexto de razonamiento histórico), su soporte para agentes autónomos con planificación y realimentación del entorno, y su compatibilidad con los principales harnesses de despliegue (Transformers, vLLM, SGLang, TokenSpeed). La model card menciona además una versión alojada en Qwen Cloud con contexto de 1M por defecto y herramientas integradas, aunque el servicio está anunciado como "próximamente".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 16 bloques de (3 × Gated DeltaNet → FFN) + 1 × (Gated Attention → FFN) |
| Parámetros totales | 27.781.427.952 (27,78B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión, entrenado en dos etapas (pre-entrenamiento y post-entrenamiento). La dimensión oculta es 5120, con 64 capas organizadas en 16 bloques que alternan tres subcapas de Gated DeltaNet (atención lineal) seguidas de una subcapa de Gated Attention (atención clásica con compuerta). La Gated DeltaNet emplea 48 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La red feed-forward tiene dimensión intermedia de 17.408, y el embedding de tokens (así como la salida LM) es de 248.320 entradas (con padding).

La innovación técnica más destacable es la hibridación entre atención lineal y atención clásica, que reduce el coste computacional en contextos largos manteniendo la calidad de recuperación de información. El modelo incorpora además MTP (Multi-Token Prediction) entrenado con múltiples pasos, una técnica que permite predecir varios tokens por paso y acelerar la decodificación, especialmente útil en despliegues de inferencia. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking activado por defecto y desactivable por petición.
- Control flexible del razonamiento mediante `reasoning_effort` (profundidad ajustable) y `preserve_thinking` (retención del contexto de razonamiento de mensajes históricos).
- Programación y tareas de terminal agénticas, con mejoras declaradas en coding y trabajo profesional.
- Comprensión nativa de imágenes y vídeos, incluidos diagramas STEM, documentos y vídeos de hasta una hora.
- Ejecución agéntica autónoma: planificación, manejo de realimentación del entorno y finalización de tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares para integración en stacks existentes.
- Soporte de tool calling / function calling: no se detalla explícitamente en la model card, pero la mención de "official built-in tools" en la versión alojada y la orientación agéntica sugieren soporte, sin confirmación directa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Programación agéntica en terminal: el modelo puede ejecutar tareas de codificación de extremo a extremo en entornos de terminal, gestionando comandos, errores y realimentación del entorno, gracias a su entrenamiento específico en Terminal Bench 2.1 y su planificación autónoma.
- Automatización de flujos de trabajo profesionales: con contexto de 262K tokens nativo, puede procesar documentos largos, informes y correos encadenados para tareas de investigación y síntesis, manteniendo coherencia multi-turno.
- Análisis de documentos técnicos y diagramas STEM: el codificador de visión permite interpretar diagramas, gráficos y documentación técnica, integrándose en pipelines de ingeniería y ciencia.
- Procesamiento de vídeo de larga duración: al soportar vídeos de hasta una hora, puede resumir reuniones, analizar grabaciones de clases o extraer eventos de material audiovisual extenso.
- Agentes autónomos de investigación: con `reasoning_effort` ajustable y `preserve_thinking`, puede encadenar pasos de búsqueda, verificación y redacción manteniendo el hilo de razonamiento entre mensajes históricos.
- Asistente de atención al cliente multi-turno: la ventana de contexto extensible hasta 1M tokens permite mantener conversaciones largas con historial completo, aunque la latencia en contextos extremos debe validarse en producción.
- Integración en pipelines CI/CD: al ser compatible con vLLM, SGLang y TokenSpeed, puede desplegarse como servicio de generación de código y revisión automatizada dentro de infraestructuras existentes.
- Extracción de información de documentos escaneados: combinando visión y contexto largo, puede procesar lotes de documentos con imágenes y texto asociado en una sola pasada.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los datos numéricos de la tabla están truncados en la información proporcionada (solo se muestra la cabecera y la fila de "Agentic terminal coding / Terminal Bench 2.1 (Terminus)" sin valores). No se pueden extraer resultados numéricos fiables.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Resto de benchmarks | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo denso de 27,78B en safetensors (55,6 GB en FP16/BF16), se requiere aproximadamente 56 GB de VRAM solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits se reduciría a ~28 GB y en 4 bits a ~14-16 GB, aunque estas cifras son estimaciones genéricas y no confirmadas por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría en A100 80GB, H100 80GB y configuraciones multi-GPU; en consumer GPU quedaría ajustado incluso en cuantización 4 bits en tarjetas de 24 GB (RTX 4090), dependiendo de la longitud de contexto.
- ¿Cabe en consumer GPU?: no confirmado; probablemente solo con cuantización agresiva y contextos moderados.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El uso de MTP entrenado con múltiples pasos sugiere aceleración de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B (denso) | 262K nativo, hasta 1M | Apache 2.0 | Pesos abiertos en HF | Visión nativa, MTP, thinking control |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Generación anterior de la familia Qwen |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Variante "Plus" de la familia |
| Muse Glimmer-30B | ~30B (según nombre) | No disponible | No disponible | No disponible | Modelo comparable de ~30B |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Referencia propietaria de alto rendimiento |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la comparativa se limita a la existencia de estos modelos en la tabla de la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado sobre datos web a gran escala, es probable que herede sesgos sociales y culturales, pero no hay confirmación oficial.
- Riesgo de alucinación: no cuantificado; los modelos de razonamiento con modo thinking pueden generar cadenas de razonamiento plausibles pero incorrectas, especialmente en tareas de investigación abierta.
- Limitaciones de contexto o idioma: el contexto nativo es de 262K tokens; la extensión a 1M se anuncia pero no se detalla el método ni la degradación esperada. Los idiomas soportados no están listados, lo que impide confirmar cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantengan los avisos de copyright y se indiquen los cambios; no incluye cláusulas de uso responsable específicas más allá de las obligaciones estándar.
- Caveats para producción: el modelo se publicó el 9 de noviembre de 2026 con 0 descargas y 0 likes, lo que indica una adopción comunitaria aún no validada. La versión alojada en Qwen Cloud está anunciada como "próximamente", por lo que no hay servicio gestionado disponible. Los benchmarks completos no están publicados en la información accesible, lo que limita la evaluación objetiva. La tabla de benchmarks truncada impide verificar las afirmaciones de mejora frente a generaciones anteriores.
- Compatibilidad: se anuncia soporte para Transformers, vLLM, SGLang y TokenSpeed, pero no se confirma compatibilidad con llama.cpp, Ollama o TGI, lo que puede limitar opciones de despliegue en entornos con hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/HROMIUM/Qwen3.8-27B
- Qwen Cloud (overview del modelo): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio): https://www.qwencloud.com
- Repositorio de Transformers: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
