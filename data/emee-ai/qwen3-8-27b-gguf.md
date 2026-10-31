# emee-ai/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen, perteneciente a la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha. Este repositorio, publicado por emee-ai, contiene las cuantizaciones GGUF con el método Unsloth Dynamic 3.0 del modelo base Qwen/Qwen3.8-27B, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama o Unsloth Desktop.

El modelo combina una arquitectura híbrida que alterna capas de atención lineal (Gated DeltaNet) con capas de atención estándar (Gated Attention), un contexto nativo de 262.144 tokens extensible hasta 1.000.000, y comprensión nativa de imágenes y vídeos. Está orientado a tareas de código, trabajo profesional, investigación y tareas agénticas de largo recorrido, con control flexible del modo de razonamiento (thinking on/off por petición).

Esta variante GGUF es relevante porque reduce drásticamente los requisitos de memoria respecto a los pesos originales en bf16, y según el autor, las cuantizaciones Dynamic 3.0 de Unsloth superan en precisión a las de otros proveedores en más de un 10 % en el percentil superior para el mismo tamaño de archivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con codificador de visión |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | GGUF con Unsloth Dynamic 3.0 (imatrix); cuantizaciones concretas no detalladas en la ficha |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo de lenguaje tiene 27B de parámetros, dimensión oculta de 5.120, 64 capas y un vocabulario de 248.320 tokens (con padding). La disposición de capas es híbrida: 16 bloques, cada uno compuesto por 3 módulos (Gated DeltaNet → FFN) seguidos de 1 módulo (Gated Attention → FFN). El Gated DeltaNet usa 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; el Gated Attention emplea 24 cabezas Q y 4 KV (GQA), dimensión de cabeza 256 y RoPE de 64. Las FFN tienen dimensión intermedia de 17.408. Esta mezcla de atención lineal y atención completa reduce el coste de contexto largo manteniendo calidad de recuperación.

El modelo fue entrenado con pre-entrenamiento y post-entrenamiento, e incorpora MTP (Multi-Token Prediction) entrenado con múltiples pasos, lo que habilita decodificación especulativa para acelerar la inferencia. La comprensión multimodal es nativa (imágenes y vídeos, incluidos vídeos de duración de horas). No se ha publicado información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento con control flexible: thinking mode activado por defecto, desactivable por petición, con profundidad de razonamiento ajustable mediante `reasoning_effort` y retención del contexto de razonamiento histórico vía `preserve_thinking`.
- Comprensión de imágenes y vídeos: desde diagramas STEM y documentos hasta vídeos de escala horaria.
- Generación y edición de código, con mejoras específicas en tool calling (parseo de objetos anidados).
- Ejecución agéntica: planificación autónoma y manejo de feedback del entorno para completar tareas multi-paso de extremo a extremo.
- Soporte de rol de desarrollador (developer role), compatible con herramientas agénticas como Codex.
- Compatibilidad amplia con harnesses y herramientas de desarrollo habituales.
- Contexto muy largo (262K nativo, 1M extensible) para documentos extensos y conversaciones largas.

## Casos de uso

- Análisis de vídeos largos: gracias a la comprensión nativa de vídeo a escala horaria, puede resumir, indexar o responder preguntas sobre grabaciones de reuniones, vigilancia o contenido educativo completo sin fragmentación manual.
- Asistentes de documentación técnica: con 262K tokens de contexto nativo, puede ingerir manuales o bases de código enteras y responder preguntas con citas del contenido.
- Agentes de ejecución de tareas multi-paso: su entrenamiento en planificación autónoma y manejo de feedback del entorno lo hace adecuado para pipelines agénticos que navegan, ejecutan comandos o usan APIs de forma iterativa.
- Integración en herramientas de código tipo Codex: el soporte de developer role y las mejoras en tool calling con objetos anidados facilitan su uso como backend de asistentes de programación en IDEs.
- Extracción y análisis de documentos con diagramas: la comprensión nativa de imágenes permite procesar PDFs con figuras STEM, gráficos y tablas escaneadas.
- Chatbot de razonamiento ajustable: el parámetro `reasoning_effort` permite balancear latencia frente a profundidad de razonamiento según la consulta, útil en productos con SLAs variables.
- Inferencia local en hardware de consumo: las cuantizaciones GGUF Dynamic 3.0 permiten desplegar el modelo en estaciones de trabajo con GPU única de gama alta o incluso en configuraciones CPU+GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la cuantización indica que Unsloth Dynamic 3.0 supera en precisión (>10 % mejor en el top-1 %) a otras cuantizaciones GGUF del mismo modelo a igual tamaño de archivo, pero no se aportan métricas concretas de MMLU, HumanEval, GSM8K ni otras suites.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repo es 472,1 GB (incluye múltiples cuantizaciones y probablemente variantes de alta fidelidad). Para una cuantización Q4_K_M de un modelo de 27B, la estimación habitual ronda los 16-17 GB de archivo, más overhead de contexto KV.
- GPU recomendadas: para FP16/bf16, A100 40GB u H100; para las cuantizaciones GGUF de 4 bits, una RTX 3090/4090 (24 GB) es suficiente para la mayoría de cargas, con offload parcial a CPU posible en GPUs de 16 GB.
- Consumer GPU: sí, cabe en una RTX 4090 de 24 GB con cuantizaciones de 4 bits; con offload a RAM del sistema también es viable en GPUs de 12-16 GB a costa de throughput.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Unsloth Desktop (con toggles de thinking), y cualquier runtime compatible con GGUF. Para el modelo original en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles; el MTP (Multi-Token Prediction) entrenado sugiere soporte de decodificación especulativa para acelerar la generación en runtimes compatibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B (denso) | 262K nativo / 1M extensible | Imagen y vídeo nativos | Apache 2.0 | GGUF (este repo) y pesos base en HuggingFace |
| Gemma 3 27B | 27B (denso) | 128K | Imagen | Gemma license (restricciones de uso) | HuggingFace, GGUF comunitarios |
| Qwen3-VL 30B-A3B | 30B (MoE, 3B activos) | no disponible | Imagen y vídeo | Apache 2.0 | HuggingFace, GGUF comunitarios |

Frente a Gemma 3 27B, Qwen3.8-27B ofrece un contexto nativo mucho mayor y thinking mode integrado, con una licencia menos restrictiva. Frente a variantes MoE de tamaño similar, el modelo denso de 27B requiere más cómputo activo por token pero evita la complejidad de servir expertos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: inherente a modelos de lenguaje; el uso de presencia_penalty entre 0 y 2 se recomienda para evitar repeticiones infinitas, aunque valores altos pueden provocar mezcla de idiomas y ligera degradación del rendimiento.
- Idiomas: la lista de idiomas soportados no está disponible en la ficha; verificar antes de desplegar en castellano.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables, aunque conviene revisar los términos del modelo base Qwen.
- Contexto: aunque extensible a 1M tokens, el rendimiento más allá de los 262K nativos puede degradarse y los requisitos de memoria KV crecen sustancialmente.
- Esta ficha corresponde a la cuantización GGUF de un tercero (emee-ai); la calidad de la conversión depende del método Unsloth Dynamic 3.0 y no del propio equipo Qwen.
- Las capturas y afirmaciones de precisión provienen del autor de la cuantización y no han sido verificadas de forma independiente en la información disponible.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/emee-ai/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de ejecución de Qwen3.8 (Unsloth): https://unsloth.ai/docs/models/qwen3.8
- Documentación de Unsloth Dynamic 3.0 GGUFs: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Unsloth Desktop: https://unsloth.ai/docs/new/desktop
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
