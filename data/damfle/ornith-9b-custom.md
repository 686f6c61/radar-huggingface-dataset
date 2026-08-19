# damfle/ornith-9b-custom

## Resumen

Ornith-1.0-9B es un modelo de lenguaje denso de aproximadamente 9 000 millones de parámetros, desarrollado por el equipo de ornith-ai como parte de la familia Ornith 1.0, orientada a tareas de codificación agéntica (agentic coding). El modelo se distribuye bajo licencia MIT (aunque el repositorio concreto `damfle/ornith-9b-custom` declara licencia ISC) y está diseñado para ejecutarse en una única GPU de 80 GB, con una ventana de contexto de 256 000 tokens (262 144 exactamente). Su relevancia actual radica en ofrecer una alternativa abierta y auto-escalable (self-scaffolding) para flujos de trabajo de programación asistida por agentes, con una interfaz compatible con OpenAI.

La arquitectura es un transformer denso, sin mezcla de expertos, lo que simplifica su despliegue en comparación con los otros miembros de la familia (35B y 397B, que sí son MoE). El modelo está pensado para servir como backend de herramientas de codificación agéntica, soportando contextos largos y razonamiento multi-paso. Aunque la model card original en HuggingFace es prácticamente vacía, la documentación oficial del proyecto Ornith 1.0 proporciona detalles sobre su uso, requisitos de hardware y comparativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | ~9 000 millones (9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | GGUF (disponible en repos oficiales), bf16 (pesos originales) |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | MIT (según documentación oficial de Ornith 1.0); el repositorio `damfle/ornith-9b-custom` declara ISC |
| Formato de pesos | Safetensors (bf16), GGUF (cuantizado) |

## Arquitectura y entrenamiento

Ornith-1.0-9B es un modelo denso basado en la arquitectura transformer estándar, sin capas de mezcla de expertos. El tamaño de 9B parámetros y el peso en bf16 de aproximadamente 19 GB permiten su ejecución en una GPU de 80 GB (por ejemplo, A100 o H100) sin necesidad de particionado. La familia Ornith 1.0 incluye además dos variantes MoE de 35B y 397B parámetros, que requieren múltiples GPUs con tensor parallelism. El modelo está diseñado para tareas de codificación agéntica, lo que implica un entrenamiento orientado a razonamiento multi-paso, generación de código y uso de herramientas. No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO en la información disponible. La documentación oficial menciona que el modelo expone una interfaz compatible con OpenAI y soporta una ventana de contexto de 256K tokens, lo que sugiere un entrenamiento con atención de largo alcance o técnicas de extrapolación de contexto.

## Capacidades

- Generación de código y razonamiento multi-paso para tareas de programación agéntica.
- Soporte de tool calling / function calling, integrable en flujos de trabajo de agentes.
- Ventana de contexto de 262 144 tokens, adecuada para repositorios completos o conversaciones largas.
- Interfaz compatible con OpenAI, lo que facilita su integración con herramientas existentes.
- Capacidad de auto-escalado (self-scaffolding): el modelo puede estructurar sus propias tareas y sub-tareas en entornos agénticos.
- No se han documentado capacidades multimodales (visión, audio) ni modos de pensamiento explícitos en la información disponible.

## Casos de uso

- Asistente de programación en IDE: el modelo puede analizar un repositorio completo gracias a su contexto de 256K tokens, sugiriendo refactorizaciones, detectando errores y proponiendo implementaciones completas.
- Agente autónomo de resolución de issues: integrado en un pipeline de CI/CD, el modelo puede recibir un issue de GitHub, explorar el código relacionado, generar un parche y ejecutar pruebas, todo en un solo contexto.
- Generación de documentación técnica: con su capacidad de razonamiento y contexto largo, puede resumir APIs, generar docstrings y crear guías de uso a partir del código fuente.
- Revisión de código automatizada: el modelo puede actuar como revisor en pull requests, señalando problemas de estilo, posibles bugs y sugiriendo mejoras, manteniendo el contexto de todo el diff y del historial.
- Chatbot de soporte técnico para desarrolladores: alojado tras una API compatible con OpenAI, puede responder preguntas sobre APIs internas, ejemplos de código y mejores prácticas, con memoria de conversaciones largas.
- Automatización de tareas de refactorización masiva: el modelo puede procesar múltiples archivos de un proyecto, aplicando cambios consistentes (por ejemplo, renombrado de variables, migración de dependencias) gracias a su ventana de contexto amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial de Ornith 1.0 menciona que existen resultados comparativos, pero no se han proporcionado números concretos en los materiales consultados. Por tanto, no se incluye tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 19 GB, por lo que cabe en GPUs con 24 GB o más (por ejemplo, RTX 3090/4090) si se usa cuantización GGUF de 8 bits o inferior. Para bf16 completo se recomienda una GPU de 80 GB (A100, H100) para mayor comodidad.
- GPU recomendadas: A100 80GB, H100 80GB, o GPUs consumer de 24 GB con cuantización (RTX 3090, RTX 4090).
- En consumer GPU: sí, con cuantización GGUF (por ejemplo, Q4_K_M o Q5_K_M) se puede ejecutar en una RTX 3090/4090 con 24 GB de VRAM.
- Opciones de despliegue: vLLM (con soporte para tensor parallelism), llama.cpp, Ollama, TGI (Text Generation Inference). La documentación oficial proporciona recetas para levantar un servidor compatible con OpenAI.
- Latencia y throughput: no se han publicado cifras exactas. Se espera que en una A100 80GB con bf16, el throughput sea del orden de 20-40 tokens/s para generación, dependiendo de la longitud de contexto y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Ornith-1.0-9B | ~9B | 256K | MIT | Safetensors, GGUF | Codificacion agéntica |
| DeepSeek-Coder-6.7B | 6.7B | 16K | MIT | Safetensors, GGUF | Generación de código |
| CodeLlama-7B | 7B | 16K | Llama 2 license | Safetensors, GGUF | Generación de código |
| Qwen2.5-Coder-7B | 7B | 128K | Apache 2.0 | Safetensors, GGUF | Codificación y razonamiento |

Ornith-1.0-9B se diferencia por su contexto de 256K tokens, muy superior a los 16K de CodeLlama o DeepSeek-Coder, y por su orientación específica a flujos agénticos con tool calling. Qwen2.5-Coder-7B ofrece un contexto de 128K y licencia Apache 2.0, pero no está diseñado explícitamente para auto-escalado agéntico. La comparativa se basa en datos públicos de los respectivos repositorios; no se dispone de benchmarks comparativos directos.

## Limitaciones y advertencias

- La model card original de `damfle/ornith-9b-custom` no proporciona información sobre sesgos, alucinaciones o limitaciones de idioma. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- La licencia declarada en el repositorio de HuggingFace es ISC, mientras que la documentación oficial de Ornith 1.0 indica MIT. Esta discrepancia debe aclararse con el autor antes de un uso comercial.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos de contenido o cobertura idiomática.
- El modelo está optimizado para tareas de codificación; su rendimiento en otros dominios (texto general, matemáticas avanzadas, razonamiento no técnico) no está documentado.
- La ventana de contexto de 256K tokens puede degradar el rendimiento si se usa al máximo, y el coste computacional de atención crece cuadráticamente con la longitud de entrada.
- No se ha confirmado la disponibilidad de versiones cuantizadas oficiales para el repositorio `damfle/ornith-9b-custom`; los GGUF mencionados pertenecen a otros repositorios de la misma familia.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/damfle/ornith-9b-custom
- Sitio oficial de Ornith 1.0: https://ornith.site/
- Guía alternativa de Ornith AI: https://ornith.online/
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- GGUF oficial de Ornith-1.0-9B: https://huggingface.co/ornith-ai/Ornith-1.0-9B-GGUF
- GGUF de deepreinforce-ai: https://huggingface.co/deepreinforce-ai/Ornith-1.0-9B-GGUF
