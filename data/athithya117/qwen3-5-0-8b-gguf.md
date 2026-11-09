# Athithya117/Qwen3.5-0.8B-GGUF

## Resumen

Qwen3.5-0.8B es el modelo mas pequeno de la familia Qwen3.5, desarrollada por el equipo Qwen de Alibaba. Se trata de un modelo causal con codificador de vision, disenado para prototipado, ajuste fino especifico de tarea e investigacion. Combina una arquitectura hibrida de Gated DeltaNet (atencion lineal) y Gated Attention (atencion completa) con una longitud de contexto nativa de 262.144 tokens, lo que resulta notable para su escala de parametros.

El repositorio analizado (Athithya117/Qwen3.5-0.8B-GGUF) es una cuantizacion GGUF generada con Unsloth Dynamic 2.0 a partir de los pesos oficiales de Qwen/Qwen3.5-0.8B. El modelo base cuenta con 752.393.024 parametros (aproximadamente 0,8B) y esta disenado para ejecucion local en hardware de consumo, manteniendo capacidades multimodales de imagen-texto y una ventana de contexto muy amplia.

Su relevancia actual radica en tres factores: la integracion temprana de vision y lenguaje en un modelo de menos de mil millones de parametros, el soporte declarado de 201 idiomas y dialectos, y una licencia Apache 2.0 que permite uso comercial sin restricciones significativas. El repositorio GGUF concreto tiene cero descargas y cero likes en el momento de la consulta, por lo que debe considerarse una publicacion reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; hibrida Gated DeltaNet + Gated Attention |
| Parametros totales | 752.393.024 (0,8B) |
| Parametros activos | no disponible (no se especifica si el FFN es MoE en esta variante) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); niveles concretos no disponibles |
| Idiomas soportados | 201 idiomas y dialectos (segun model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base original |
| Dimension oculta | 1024 |
| Capas | 24 |
| Layout oculto | 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Cabezas de atencion lineal (Gated DeltaNet) | 16 para V y 16 para QK, dimension 128 |
| Cabezas de atencion (Gated Attention) | 8 para Q y 2 para KV, dimension 256 |
| Dimension intermedia FFN | 3584 |
| Embedding de tokens | 248.320 (padded, atado a la salida LM) |
| RoPE | dimension 64 |
| MTP | entrenado con multiples pasos |
| Tamano del repo | 14,1 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que intercala bloques de Gated DeltaNet, una forma de atencion lineal con compuertas, y bloques de Gated Attention clasica. El patron de 24 capas sigue un layout de 6 grupos, cada uno con tres bloques de Gated DeltaNet seguidos de un bloque de Gated Attention. Esta combinacion busca reducir el coste computacional del contexto largo manteniendo la calidad de recuperacion de informacion de la atencion completa. El FFN tiene dimension intermedia de 3584, y la salida LM esta atada al embedding de tokens de 248.320 entradas.

Segun la model card del modelo base, el entrenamiento incluye pre-entrenamiento y post-entrenamiento, con fusion temprana de tokens multimodales (vision y texto) y una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto. Se menciona tambien escalado de reinforcement learning en entornos multiagente con distribuciones de tarea progresivamente complejas. El modelo incorpora MTP (multi-token prediction) entrenado con multiples pasos, una tecnica que puede favorecer la decodificacion especulativa. No se dispone de datos concretos sobre numero de tokens de entrenamiento, composicion del dataset ni detalles de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en modo no-thinking (la tabla de benchmarks del modelo base incluye una seccion Non-Thinking Mode).
- Comprension de imagenes y texto (pipeline image-text-to-text), con codificador de vision integrado.
- Razonamiento, codigo y matematicas, con paridad declarada frente a Qwen3 y mejora frente a Qwen3-VL en benchmarks de razonamiento, codigo, agentes y comprension visual.
- Soporte multilingue amplio: 201 idiomas y dialectos segun la model card.
- Capacidades de agente y entornos multiagente, reforzadas mediante RL escalado.
- Multi-token prediction (MTP) entrenado con multiples pasos, util para decodificacion especulativa.
- Compatibilidad con transformers, vLLM, SGLang y KTransformers segun la model card del modelo base.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Prototipado rapido de asistentes multimodales: el modelo acepta imagen y texto y cabe en hardware de consumo, lo que permite validar ideas de producto (por ejemplo, descripcion de capturas o extraccion de datos de formularios) sin infraestructura dedicada.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto nativo, se pueden analizar contratos, informes o transcripciones extensas en una sola pasada en un portatil con GPU consumer.
- Ajuste fino especifico de tarea: al ser un modelo de 0,8B con licencia Apache 2.0, es viable entrenar clasificadores, extractores o asistentes de dominio con Unsloth en una unica GPU, segun la guia de fine-tuning enlazada en la model card.
- Clasificacion y etiquetado de imagenes a escala: el pipeline image-text-to-text permite generar descripciones y etiquetas para catalogos de producto o moderacion de contenido con coste de inferencia bajo.
- Asistente de codigo ligero en IDE: el modelo declara capacidades de codigo y agentes; con cuantizacion GGUF puede ejecutarse junto al editor para autocompletado y explicacion de fragmentos, aunque su escala limita tareas complejas.
- Traduccion y atencion multilingue: con soporte declarado de 201 idiomas, es adecuado para preprocesar o traducir contenido en pipelines donde el coste por token es critico.
- Educacion y experimentacion: sirve como banco de pruebas para investigar atencion lineal hibrida, MTP y fusion temprana multimodal en un modelo pequeno y abierto.

## Benchmarks y rendimiento

Datos extraidos de la model card del modelo base (Qwen3.5-0.8B). La tabla original fue truncada en la informacion proporcionada; solo se dispone de los valores de MMLU-Pro en modo no-thinking.

| Benchmark (Non-Thinking) | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | no disponible (truncado) |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks para Qwen3.5-0.8B. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,8B parametros, en cuantizacion Q4 el peso ronda los 0,5 GB; en Q8 aproximadamente 0,8-0,9 GB; en FP16 alrededor de 1,5-1,6 GB. La cache KV para 262.144 tokens puede dominar el consumo y requerira cuantizacion de cache o contextos reducidos en hardware consumer.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para pesos en Q4/Q8; para contexto completo de 262K se recomienda A100 40/80 GB o H100.
- Cabe en GPU consumer: si, en la mayoria de GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama y otros runners GGUF para el repo cuantizado; vLLM, SGLang, KTransformers y transformers para los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. La arquitectura hibrida con atencion lineal sugiere ventajas de throughput en contextos largos, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (este) | 0,8B | 262.144 | Apache 2.0 | safetensors / GGUF | Multimodal, hibrido DeltaNet + Attention |
| Qwen3.5-2B | no disponible | no disponible | Apache 2.0 (presumible) | safetensors | Misma familia, mayor escala; MMLU-Pro 55,3 |
| Qwen3-1.7B | 1,7B | no disponible | Apache 2.0 (presumible) | safetensors | Generacion anterior; MMLU-Pro 40,2 |
| Qwen3-4B-2507 | 4B | no disponible | Apache 2.0 (presumible) | safetensors | Generacion anterior, mayor escala; MMLU-Pro 69,6 |

La comparativa se limita a la familia Qwen porque la informacion proporcionada no incluye datos de modelos de otros fabricantes en esta categoria. No se dispone de contexto ni licencia verificados para las variantes Qwen3 listadas mas alla de lo indicado.

## Limitaciones y advertencias

- Escala reducida: con 0,8B parametros, el rendimiento en razonamiento complejo, matematicas avanzadas y codigo de produccion sera inferior al de modelos de mayor tamano; la propia model card lo orienta a prototipado e investigacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, agravado en tareas de conocimiento factual y en contextos muy largos donde la recuperacion puede degradarse.
- Contexto largo: aunque la ventana nativa es de 262.144 tokens, el coste de cache KV en hardware consumer puede obligar a reducir el contexto efectivo; no se han publicado mediciones de calidad de recuperacion a esa longitud.
- Idiomas: se declaran 201 idiomas, pero no se aportan evaluaciones por idioma; el rendimiento en lenguas de bajos recursos puede ser desigual.
- Repositorio GGUF no validado: el repo Athithya117/Qwen3.5-0.8B-GGUF tiene 0 descargas y 0 likes, sin garantias de integridad de las cuantizaciones; se recomienda verificar checksums o preferir el repo oficial.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el LICENSE del modelo base enlazado en la model card por si hubiera terminos adicionales de la familia Qwen.
- Tool calling: no confirmado en la informacion disponible; verificar antes de disenar pipelines de agentes que dependan de function calling.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Athithya117/Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guia de ejecucion local (Unsloth): https://unsloth.ai/docs/models/qwen3.5
- Guia de fine-tuning (Unsloth): https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Documentacion de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Qwen Chat: https://chat.qwen.ai
