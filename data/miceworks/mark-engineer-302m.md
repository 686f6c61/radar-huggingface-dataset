# miceworks/Mark-Engineer-302M

## Resumen

Mark-Engineer-302M es un checkpoint experimental de tipo "narrow" desarrollado por miceworks, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de lenguaje de arquitectura DeepSeek2 con Mixture-of-Experts (MoE) y Multi-Head Latent Attention (MLA), diseñado específicamente para tareas de ingeniería de sistemas: generación de código POSIX C, stubs de llamadas al sistema Linux, semántica de barreras de memoria y scripts de enlazador bare-metal. Su nomenclatura "302M" hace referencia a la familia, aunque el modelo contiene 534.549.600 parámetros físicos totales y activa 138.187.872 por token a través de 8 capas.

El modelo destaca por su extrema eficiencia: el contenedor GGUF cuantizado a IQ4_NL ocupa solo 286,99 MiB, lo que permite ejecutarlo en dispositivos edge de baja potencia como una Raspberry Pi 5 (8 GB) o GPUs de entrada como la RTX 2060 Super, consumiendo menos del 4% de una asignación de 8 GB de VRAM. Su ventana de contexto es de 4096 tokens y emplea un vocabulario reducido de 4311 tokens BPE activos, optimizado para prosa técnica y código de sistemas.

La relevancia de este modelo radica en su enfoque de nicho: no compite en capacidades generales, sino que se posiciona como una herramienta especializada y reproducible para tareas de ingeniería de bajo nivel, con partición de expertos por dominio (sistemas, matemáticas, seguridad, datos estructurados) y soporte para tool calling y razonamiento multi-paso mediante tokens de control epistémico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek2 (MoE con Multi-Head Latent Attention) |
| Parametros totales | 534.549.600 (137 tensores) |
| Parametros activos | 138.187.872 por token |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | IQ4_NL (4-bit no lineal, GGUF) |
| Idiomas soportados | en (ingles; la model card solo declara ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del contenedor | 286,99 MiB (300.929.536 bytes) |
| Capas | 8 |
| Dimension oculta | 1024 |
| Cabezas de atencion | 16 |
| Rangos MLA | q_lora_rank=512, kv_lora_rank=256, qk_rope_head_dim=32 |
| Expertos MoE | 16 enrutados + 1 compartido (2 activos por token) |
| Dimension FFN de experto | 1536 |
| Vocabulario | 4311 tokens BPE activos (3981 merges) + 27721 slots reservados |
| SHA-256 | 63ab6f386de740afe4502ac73a7c2cb87c8c2a09b39914cb150ffc11f9e800a7 |

## Arquitectura y entrenamiento

El modelo emplea una topologia DeepSeek2 MoE con Multi-Head Latent Attention (MLA), que proyecta los estados de clave y valor a una representación latente de bajo rango compartida para desacoplar el escalado de memoria de la longitud de contexto. El KV cache por token en FP16 es de 4608 bytes (8 * (256 + 32) * 2), lo que supone un ahorro de memoria de 7,1x frente a una atención MHA estándar: 18 MiB frente a 128 MiB para 4096 tokens. Los embeddings rotatorios desacoplados se concatenan en una dimensión separada de 32.

La capa MoE cuenta con 16 expertos enrutados (top-2) más 1 experto compartido siempre activo, con enrutamiento aux-loss-free basado en sesgos por experto almacenados en FP32. La regla de actualización de sesgos es b_i ← b_i + γ · sign(f̄ − f_i) con γ = 0,001, donde f_i es la frecuencia empírica del experto en el batch y f̄ la frecuencia uniforme objetivo. Los 16 expertos se particionan en 4 "clanes" funcionales de 4 expertos cada uno: Clan 0 (sistemas, kernel, concurrencia), Clan 1 (matemáticas, lógica formal, STEM), Clan 2 (seguridad, protocolos, validación) y Clan 3 (datos estructurados, tool calling, lógica simbólica).

El entrenamiento se realizó sobre currículos abiertos alojados en Hugging Face: miceworks/Mark-Open-SLM-Curriculum, miceworks/Mark-Cyber-Curriculum y miceworks/Mark-Ultra-Curriculum, con foco en interfaces POSIX C, stubs de llamadas al sistema Linux, semántica de barreras de memoria y scripts de enlazador bare-metal. Se usó el optimizador AdamW (β1=0,9, β2=0,95, weight decay 0,1, gradient clipping 1,0). El estado de entrenamiento se etiqueta explícitamente como EXPERIMENTAL_NARROW_CHECKPOINT. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto técnico en inglés, con foco en prosa de ingeniería y documentación de sistemas.
- Generación de código C POSIX, stubs de llamadas al sistema Linux y scripts de enlazador bare-metal.
- Razonamiento matemático y lógico formal (Clan 1 de expertos).
- Seguridad, protocolos y validación (Clan 2 de expertos).
- Datos estructurados, tool calling y lógica simbólica (Clan 3 de expertos).
- Soporte de tool calling / function calling mediante delimitadores `<tool_call>` y `</tool_call>`.
- Modo de razonamiento con tokens `<think>` y `</think>`.
- Razonamiento multi-paso y self-RAG mediante tokens epistémicos `[RETRIEVE]`, `[/RETRIEVE]`, `[EVALUATE]`, `[ACCEPT]`, `[REJECT]`.
- Capacidades multilingües limitadas: solo se declara inglés; la fertilidad medida en prosa técnica portuguesa (≈2,57 caracteres/token) sugiere cierta competencia, pero no se declara oficialmente.
- No se declaran capacidades de visión ni audio.

## Casos de uso

- Generación de stubs de llamadas al sistema Linux: el modelo está entrenado específicamente sobre interfaces POSIX C y stubs de syscalls, por lo que puede producir firmas y esqueletos de implementación coherentes para integración en proyectos de sistemas operativos o emuladores.
- Asistencia en desarrollo de código de bajo nivel: dado su entrenamiento en semántica de barreras de memoria y scripts de enlazador, resulta adecuado para generar fragmentos de código C con requisitos de concurrencia o para revisar linker scripts en proyectos bare-metal.
- Validación sintáctica de esquemas en pipelines de CI: con 4096 tokens de contexto y soporte de tool calling, puede integrarse como validador de esquemas POSIX o de protocolos en pasos automatizados de integración continua.
- Automatización de tareas de razonamiento simbólico y datos estructurados: el Clan 3 de expertos está orientado a tool calling y lógica simbólica, lo que permite usarlo en agentes ligeros que transforman datos estructurados o invocan herramientas externas.
- Despliegue en dispositivos edge y Raspberry Pi 5: con un contenedor de 286,99 MiB y consumo inferior al 4% de 8 GB de VRAM, es viable para asistentes locales de documentación técnica o generación de código en entornos sin GPU dedicada.
- Filtrado y clasificación de seguridad en revisiones de código: el Clan 2 (seguridad, protocolos, validación) permite usar el modelo para detectar patrones inseguros en código C o validar protocolos en entornos de desarrollo.
- Prototipado rápido de agentes con self-RAG: los tokens epistémicos `[RETRIEVE]`, `[EVALUATE]`, `[ACCEPT]` y `[REJECT]` permiten construir bucles de recuperación y evaluación en aplicaciones de documentación técnica o soporte a desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. La model card indica únicamente que el modelo fue "validado en interfaces de ingeniería de sistemas de bajo nivel con validez de esquema sintáctico en generación de POSIX C y stubs de kernel", sin proporcionar métricas numéricas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 320 MiB en cuantización IQ4_NL (contenedor de 286,99 MiB), más el KV cache (18 MiB para 4096 tokens en FP16).
- GPU recomendadas: NVIDIA GeForce RTX 2060 Super (8 GB GDDR6, 256-bit, 448 GB/s) como referencia mínima según el autor; cualquier GPU con al menos 1 GB de VRAM libre es suficiente.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna, así como en Raspberry Pi 5 (8 GB) y dispositivos edge de baja potencia.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), y por extensión cualquier runtime compatible con GGUF como Ollama; la model card menciona endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mark-Engineer-302M | 534,5M | 138,2M | 4096 | Apache 2.0 | GGUF (IQ4_NL) |
| Modelos comparables de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos directamente comparables en la misma categoría (SLM MoE especializados en ingeniería de sistemas con arquitectura DeepSeek2 y MLA). La comparativa cuantitativa con alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental: el checkpoint se etiqueta explícitamente como EXPERIMENTAL_NARROW_CHECKPOINT, por lo que no está validado para uso en producción general.
- Contexto limitado: 4096 tokens, insuficiente para tareas que requieran ventanas largas (análisis de repositorios completos, conversaciones multi-turno extensas).
- Idioma: solo se declara inglés; el soporte de otros idiomas no está garantizado, aunque la fertilidad medida en portugués técnico sugiere cierta capacidad no oficial.
- Vocabulario muy reducido (4311 tokens BPE activos): puede degradar el rendimiento en texto fuera del dominio técnico y aumentar la longitud efectiva de las secuencias.
- Fidelidad de espacios en blanco: la model card advierte que la tokenización de indentación requiere byte-fallback y que los 4 espacios iniciales pueden ser eliminados por el tokenizador BPE, lo que puede afectar a la generación de código Python u otros lenguajes sensibles a indentación.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: no cuantificado; al ser un modelo pequeño y especializado, el riesgo en dominios fuera de su entrenamiento es presumiblemente alto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado experimental y la falta de benchmarks desaconsejan su uso en producción sin validación previa.
- Caveat de producción: la ausencia de métricas de benchmarks y de datos sobre tokens de entrenamiento limita la evaluación rigurosa de su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miceworks/Mark-Engineer-302M
- Repositorio de código y pipelines: https://github.com/thu12dta3/Mark-AI/tree/main/scripts
- Dataset Mark-Open-SLM-Curriculum: https://huggingface.co/datasets/miceworks/Mark-Open-SLM-Curriculum
- Dataset Mark-Cyber-Curriculum: https://huggingface.co/datasets/miceworks/Mark-Cyber-Curriculum
- Dataset Mark-Ultra-Curriculum: https://huggingface.co/datasets/miceworks/Mark-Ultra-Curriculum
