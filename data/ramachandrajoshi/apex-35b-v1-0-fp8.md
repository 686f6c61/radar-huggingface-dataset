# ramachandrajoshi/Apex-35B-V1.0-FP8

## Resumen

Apex-35B-V1.0-FP8 es una cuantización en FP8 (W8A8, con escalas por bloques) del modelo Apex-35B-V1.0, desarrollado por Apex Intelligence y publicado en Hugging Face por el usuario ramachandrajoshi. Se trata del primer modelo de dicha organización y está construido sobre la arquitectura Qwen3.6-35B-A3B, un transformer híbrido de tipo Mixture-of-Experts (MoE) con atención lineal Gated DeltaNet combinada con atención completa. El modelo está orientado a generación de código, uso de herramientas, respuesta a preguntas, búsqueda profunda, investigación en IA, ciencia computacional y simulación robótica, e incorpora un modo de razonamiento dinámico.

La versión FP8 conserva intactos en BF16 el codificador visual (ViT de 27 capas) y la cabeza de predicción multi-token (MTP), lo que permite entrada de imagen y vídeo, así como decodificación especulativa nativa en SGLang y vLLM. Con 35.951.822.704 parámetros totales y aproximadamente 3B activos por token, el modelo mantiene una ventana de contexto nativa de 262.144 tokens. La cuantización reduce el peso en disco de unos 72 GB en BF16 a unos 38 GB, lo que permite servirlo en dos GPU de 48 GB o en una sola GPU de 80 GB.

Su relevancia actual radica en que combina un modelo MoE multimodal de gran contexto con una cuantización FP8 lista para producción en los motores de inferencia más usados (vLLM y SGLang), incluyendo soporte de tool calling y decodificación especulativa, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (transformer MoE híbrido: 30 capas de atención lineal Gated DeltaNet + 10 capas de atención completa con intervalo 4) |
| Parametros totales | 35.951.822.704 (~35B) |
| Parametros activos | ~3B |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | FP8 E4M3 W8A8 con escalas por bloques 128×128 en pesos y dinámicas por grupo de tokens 1×128 en activaciones; visión, embeddings, lm_head, router MoE y cabeza MTP en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, float-quantized; pesos almacenados por experto; `model_mtp.safetensors` en BF16) |

## Arquitectura y entrenamiento

El modelo base Apex-35B-V1.0 emplea una arquitectura MoE híbrida con 40 capas en total: 30 capas de atención lineal Gated DeltaNet y 10 capas de atención completa con un patrón de intervalo 4. Cuenta con 256 expertos enrutados (8 activos por token) más 1 experto compartido, con tamaño intermedio de experto de 512 y dimensión oculta de 2048. La atención usa 16 cabezas Q y 2 cabezas KV, con dimensión de cabeza 256 y RoPE parcial de 0,25. El vocabulario es de 248.320 tokens. Incluye un codificador visual ViT de 27 capas con parche 16 y fusión espacial 2, además de una cabeza MTP de 1 capa para decodificación especulativa.

La cuantización se realizó con `llm-compressor` mediante `oneshot` y el esquema `FP8_BLOCK`, sin datos de calibración (min-max libre de datos). Se cuantizaron todas las proyecciones de atención y atención lineal, los expertos compartidos y las 10.240 MLP de expertos enrutados. Se mantuvieron en BF16 la torre visual, `embed_tokens`, `lm_head`, el router MoE (`mlp.gate`), `shared_expert_gate`, `linear_attn.in_proj_a/b`, las normas, los parámetros de convolución/SSM y la totalidad de la cabeza MTP. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento dinámico por defecto (bloques `<think>…</think>`).
- Generación de código y tareas de programación, con parser de tool calls específico (`qwen3_coder`).
- Uso de herramientas y function calling (tool calling) compatible con API OpenAI.
- Capacidades de agente y razonamiento multi-paso.
- Comprensión de imagen y vídeo mediante el codificador visual ViT de 27 capas conservado en BF16.
- Decodificación especulativa nativa mediante la cabeza MTP en SGLang y vLLM.
- Capacidades multilingües limitadas al inglés según la model card.
- Contexto largo de hasta 262.144 tokens para conversaciones y documentos extensos.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD y asistentes de programación gracias a su soporte de tool calling y al parser `qwen3_coder`, con contexto suficiente para repositorios completos.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo (262.144 tokens) y razonamiento explícito antes de responder.
- Análisis de documentos e imágenes: al aceptar entrada image-text-to-text, puede procesar capturas, facturas o diagramas junto a texto para extracción y descripción (OCR verificado por el autor).
- Investigación asistida y búsqueda profunda: el modo de pensamiento y el contexto extendido permiten sintetizar grandes volúmenes de fuentes en tareas de deep search.
- Simulación robótica y ciencia computacional: caso de uso declarado por el autor para generar y razonar sobre código de simulación.
- Agentes autónomos multi-paso: con soporte de tool calling y decodificación especulativa para reducir latencia en bucles de agente.
- Servicio de inferencia de alto rendimiento: despliegue en vLLM o SGLang con FP8 nativo en GPU Ada, Hopper y Blackwell para reducir coste de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo base (Apexintelligence-AI/Apex-35B-V1.0) para detalles y benchmarks, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada: ~38 GB de pesos en FP8; ~19 GB por GPU con tensor parallelism de 2.
- Configuraciones recomendadas: 2× 48 GB (L40S, A6000 Ada, RTX 6000 Ada) con TP=2, o 1× 80 GB (H100, A100 80G) en un solo GPU.
- Cómputo FP8 nativo en Ada (sm89), Hopper (sm90) y Blackwell; en Ampere, vLLM recurre a FP8 solo de pesos (Marlin).
- No se indica que quepa en GPU de consumo de 24 GB en FP8; no disponible para GPUs de menor VRAM en este formato.
- Despliegue: SGLang (probado con v0.5.23) y vLLM, ambos con soporte de decodificación especulativa MTP; API compatible con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Apex-35B-V1.0-FP8 | 35B totales, ~3B activos | 262.144 | Apache 2.0 | Cuantización FP8 del modelo Apex; multimodal y MTP |
| Qwen3.6-35B-A3B-FP8 | 35B totales, ~3B activos | no disponible en esta ficha | no disponible | Referencia arquitectónica y de esquema de cuantización citada por el autor |
| Apexintelligence-AI/Apex-35B-V1.0 | 35B totales, ~3B activos | 262.144 | Apache 2.0 | Modelo base en BF16 (~72 GB) |

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos; el modo de pensamiento no elimina este riesgo.
- La cuantización FP8 puede introducir degradación respecto al modelo base en BF16; no se aportan métricas comparativas.
- La plantilla de chat es propia de Apex y debe mantenerse sin sobrescribir con plantillas genéricas de Qwen; hacerlo puede romper el formato de razonamiento y tool calls.
- En GPU Ampere no hay cómputo FP8 nativo; vLLM usa FP8 solo de pesos (Marlin), con posible impacto en rendimiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento (no disponibles).
- No se dispone de información sobre sesgos conocidos ni sobre composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ramachandrajoshi/Apex-35B-V1.0-FP8
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Referencia de cuantización Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- llm-compressor: https://github.com/vllm-project/llm-compressor
