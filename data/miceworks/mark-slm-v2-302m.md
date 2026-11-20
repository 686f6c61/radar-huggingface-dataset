# miceworks/Mark-SLM-V2-302M

## Resumen
Mark-SLM-V2-302M es un checkpoint experimental de tipo "narrow" desarrollado por miceworks, publicado bajo licencia Apache 2.0. Se trata de un modelo de lenguaje de arquitectura `deepseek2` con 329.132.000 parámetros físicos totales y 155.723.744 parámetros activos por token, organizado como una mezcla de expertos (MoE) con 16 expertos enrutados y 1 experto compartido, activando 2 expertos enrutados por token a lo largo de 16 capas.

El modelo emplea Multi-Head Latent Attention (MLA) con rangos latentes reducidos (`q_lora_rank=384`, `kv_lora_rank=192`, `qk_rope_head_dim=32`), lo que reduce drásticamente el consumo de memoria de la caché KV: 7.168 bytes por token en FP16, con un ahorro de 6,9x frente a una caché MHA estándar. Su ventana de contexto es de 4.096 tokens y su vocabulario de 49.152 filas (de las cuales solo 4.311 son tokens BPE activos).

Es relevante ahora por su enfoque de eficiencia extrema: cuantizado en IQ4_NL ocupa 178,33 MiB y puede ejecutarse en GPUs de consumo con 8 GB de VRAM. No obstante, el autor lo etiqueta explícitamente como `EXPERIMENTAL_NARROW_CHECKPOINT` entrenado sobre un currículo pequeño, con pérdida final de 0,263975 atribuida a memorización multiepoca más que a generalización abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek2` (transformer MoE con Multi-Head Latent Attention) |
| Parametros totales | 329.132.000 (329132000 físicos en 281 tensores) |
| Parametros activos | 155.723.744 por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | IQ4_NL (4-bit no lineal); pesos también en safetensors |
| Idiomas soportados | Inglés (`en`); fertilidad medida también en portugués técnico |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |
| Estado de entrenamiento | `EXPERIMENTAL_NARROW_CHECKPOINT` |
| Tamaño del binario cuantizado | 178,33 MiB (186.993.472 bytes) |
| Vocabulario | 49.152 filas (4.311 tokens BPE activos + 27.721 slots reservados) |
| Capas | 16 |
| Dimensión oculta | 768 |
| Cabezas de atención | 12 |
| Rangos MLA | `q_lora_rank=384`, `kv_lora_rank=192`, `qk_rope_head_dim=32` |
| Expertos MoE | 16 enrutados + 1 compartido (2 activos/token) |
| Dimensión FFN de experto | 384 |
| SHA-256 | `3c8c59547297bece64b49a08f39eac57cda23a47e47016283c5a63f3b31f174d` |

## Arquitectura y entrenamiento
El modelo es un transformer MoE de 16 capas con dimensión oculta 768 y 12 cabezas de atención. La atención usa Multi-Head Latent Attention: las proyecciones de clave y valor se comprimen en una representación latente compartida de baja dimensión (`c_KV` de 192), mientras que las queries se proyectan a un latente de 384 (`c_Q`). El componente rotatorio desacoplado (`qk_rope_head_dim=32`) se concatena en una dimensión separada. El resultado es una caché KV de 7.168 bytes por token en FP16, lo que a 4.096 tokens supone 28 MiB frente a 192 MiB de una MHA estándar.

La capa MoE cuenta con 16 expertos enrutados y 1 compartido, con enrutamiento Top-2 sin pérdida auxiliar (aux-loss-free). El sesgo del router se actualiza por paso con la regla de signo `b_i ← b_i + γ·sign(f̄ − f_i)` con γ = 0,001, almacenándose en FP32 para estabilidad. Los 16 expertos se particionan en 4 "clanes" funcionales de 4 expertos: Clan 0 (código de sistemas, semántica de kernel, concurrencia), Clan 1 (matemáticas, lógica formal, razonamiento STEM), Clan 2 (seguridad, protocolos, validación) y Clan 3 (datos estructurados, tool calling, lógica simbólica).

El entrenamiento se realizó durante 10.000 pasos sobre el currículo `miceworks/Mark-Ultra-Curriculum`, con optimizador AdamW (β1=0,9, β2=0,95, weight decay 0,1, gradient clipping 1,0), alcanzando una pérdida final de 0,263975. El propio autor advierte que ese valor refleja memorización multiepoca sobre un conjunto de prueba pequeño y no generalización abierta. El código de entrenamiento está en el repositorio Mark-AI.

## Capacidades
- Generación de texto conversacional en inglés, con soporte de etiquetas de razonamiento `<think>`/`</think>`.
- Tool calling y function calling mediante delimitadores `<tool_call>`/`</tool_call>`.
- Razonamiento autorreflexivo con Self-RAG: etiquetas `[RETRIEVE]`, `[/RETRIEVE]`, `[EVALUATE]`, `[ACCEPT]`, `[REJECT]`.
- Especialización por clanes de expertos en código de sistemas (C, Rust), matemáticas y lógica formal, seguridad y protocolos, y datos estructurados.
- Capacidad multilingüe limitada: el modelo está etiquetado solo para inglés, aunque el tokenizador se evaluó también con prosa técnica en portugués.
- No dispone de visión, audio ni modalidades adicionales según la información disponible.
- Integración con `llama.cpp` y endpoints compatibles.

## Casos de uso
- Asistente técnico de sistemas en local: el modelo puede desplegarse en una GPU de consumo de 8 GB y responder consultas sobre semántica de kernel o concurrencia, aprovechando el clan de expertos especializado en código de sistemas.
- Generación de código C y Rust en entornos con recursos limitados: su compresión de 2,02 caracteres/token en código fuente y su tamaño de 178 MiB lo hacen apto para integración en editores o CLI sin infraestructura dedicada.
- Enrutamiento de tool calling en pipelines ligeros: los delimitadores `<tool_call>` permiten integrarlo como capa de decisión en agentes que necesiten invocar funciones con contexto de hasta 4.096 tokens.
- Filtrado y validación de protocolos: el clan 2 (seguridad, protocolos, validación) se orienta a tareas de comprobación de mensajes y estructuras de red en herramientas de análisis.
- Prototipado de pipelines RAG con Self-RAG: las etiquetas `[RETRIEVE]`/`[EVALUATE]` permiten experimentar con flujos de recuperación y evaluación sin coste de infraestructura.
- Extracción de datos estructurados: el clan 3 (datos estructurados, lógica simbólica) puede emplearse para transformar texto en JSON o validar esquemas en entornos de bajo consumo.
- Docencia y experimentación con arquitecturas MoE: al ser reproducible y de tamaño reducido, sirve para estudiar MLA, enrutamiento aux-loss-free y particionado por clanes en un solo equipo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación es la pérdida de validación final de 0,263975 sobre el currículo `miceworks/Mark-Ultra-Curriculum`, que el autor describe como artefacto de memorización.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 178,33 MiB de pesos en IQ4_NL, más la caché KV (28 MiB a 4.096 tokens en FP16) y overhead del runtime.
- Cabe en GPUs de consumo con 8 GB de VRAM según el autor, con consumo mínimo.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Despliegue: `llama.cpp` (formato GGUF con IQ4_NL) y endpoints compatibles; también hay pesos en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de comparaciones oficiales con otros modelos en la información proporcionada. Como referencia estructural, se puede contrastar con alternativas MoE de tamaño similar, aunque sin cifras de rendimiento verificables:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mark-SLM-V2-302M | 329,1 M | 155,7 M | 4.096 | Apache 2.0 | GGUF, safetensors |
| Alternativas MoE de ~300M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible modelos comparables con datos verificables de rendimiento.

## Limitaciones y advertencias
- Checkpoint experimental y estrecho: el autor lo etiqueta como `EXPERIMENTAL_NARROW_CHECKPOINT`, entrenado solo 10.000 pasos sobre un currículo pequeño.
- La pérdida de 0,263975 refleja memorización multiepoca, no generalización; el rendimiento fuera de la distribución de entrenamiento es incierto.
- Riesgo elevado de alucinación y de respuestas erróneas en dominios no cubiertos por el currículo.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idioma principal inglés; el soporte multilingüe no está garantizado más allá de la fertilidad medida en portugués.
- Tokenizador con solo 4.311 tokens BPE activos sobre 49.152 filas: puede producir tokenización ineficiente en vocabulario no técnico.
- Fidelidad de espacios en blanco limitada: la tokenización con fallback de bytes puede eliminar los 4 espacios iniciales de indentación con el decodificador ByteLevel.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental desaconseja producción sin validación adicional.
- No se documentan sesgos específicos en la información disponible.

## Enlaces
- [Hugging Face: miceworks/Mark-SLM-V2-302M](https://huggingface.co/miceworks/Mark-SLM-V2-302M)
- [Repositorio Mark-AI (scripts de entrenamiento)](https://github.com/thu12dta3/Mark-AI/tree/main/scripts)
- [Dataset miceworks/Mark-Open-SLM-Curriculum](https://huggingface.co/datasets/miceworks/Mark-Open-SLM-Curriculum)
- [Dataset miceworks/Mark-Cyber-Curriculum](https://huggingface.co/datasets/miceworks/Mark-Cyber-Curriculum)
- [Dataset miceworks/Mark-Ultra-Curriculum](https://huggingface.co/datasets/miceworks/Mark-Ultra-Curriculum)
