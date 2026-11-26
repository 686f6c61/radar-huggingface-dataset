# mavis-ai/Qwen3.6-35B-MoE-Q3T

## Resumen

Qwen3.6-35B-MoE-Q3T es una compilación cuantizada del modelo multimodal Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) desarrollado originalmente por el equipo Qwen de Alibaba. La cuantización la publica mavis-ai, un proyecto independiente asociado a R.E.V.I.S., un sistema operativo cognitivo local para Mac orientado a IA multiagente. El modelo base combina procesamiento de texto e imagen, con 40 capas, tamaño oculto de 2048, 256 expertos enrutados (8 activos más un experto compartido) y una ventana de contexto de 262.144 tokens.

La particularidad de esta versión es su formato propietario Q3T: los expertos enrutados se almacenan con codificación trellis de 3 bits por peso (K3), mientras que el resto de proyecciones lineales usan cuantización afín de 6 bits con grupo 64 (N6). El resultado pesa 15,15 GB (14,1 GiB) e incluye borradores de decodificación especulativa (MTP y DFlash) en 8 bits. Es una cuantización sin datos de calibración (data-free), derivada directamente del checkpoint oficial sin ningún tipo de entrenamiento adicional.

Su relevancia actual radica en que permite ejecutar un MoE multimodal de 35.000 millones de parámetros en hardware Apple Silicon con un consumo de memoria contenido, a costa de depender de un motor de inferencia específico (R.E.V.I.S., a partir de una versión posterior a la v1.3.0). No funciona con mlx-lm, mlx-vlm, transformers ni vLLM, lo que limita seriamente su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (qwen3_5_moe), 40 capas, hidden size 2048, 256 expertos enrutados con 8 activos + 1 compartido |
| Parametros totales | 9.013.368.176 (según safetensors del repo cuantizado); el modelo base se denomina 35B-A3B |
| Parametros activos | No disponible en la información proporcionada (el nombre del modelo base sugiere ~3B activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q3T: expertos enrutados 3-bit trellis (K3) + denso/atención/embeddings/LM head 6-bit afín g64 (N6); routers y torre de visión en BF16; KV cache runtime en 8 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (trellis-coded para expertos: `.trellis`, `.suh`, `.svh`); requiere decodificación trellis específica |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos con 40 capas, dimensión oculta de 2048, 256 expertos enrutados (top-8 activos) más un experto compartido, y una ventana de contexto de 262.144 tokens. Incorpora atención lineal en algunas proyecciones (`in_proj_a`/`in_proj_b`) y una torre de visión para entrada de imagen, lo que lo convierte en un modelo image-text-to-text. La selección de expertos se realiza mediante una compuerta top-k (`mlp.gate`) que se mantiene en BF16 por su naturaleza discontinua.

Esta compilación Q3T no aplica ningún entrenamiento: es una cuantización data-free derivada del checkpoint oficial (revisión `995ad96eacd98c81ed38be0c5b274b04031597b0`). Los expertos enrutados se codifican en teselas de 16x16 con códigos trellis de 3 bits (codebook MCG), rotación Hadamard de 128 puntos y vectores de signo por canal; el resto de tensores lineales se cuantizan a 6 bits afín con grupo 64 usando `mx.quantize` (redondeo al más cercano). La torre de visión, las normas, los routers y las proyecciones de atención lineal se conservan en BF16. El paquete incluye dos borradores de decodificación especulativa en 8 bits: un drafter MTP con cabeza de propuesta (`ProposalHead`) y un drafter de bloques DFlash, que suman 1,60 GB. La decodificación trellis y sus kernels residen en el motor de inferencia de R.E.V.I.S., no en librerías estándar.

## Capacidades

- Generación de texto y conversación multi-turno con contexto muy largo (hasta 262.144 tokens).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), incluyendo preprocesado de vídeo según los ficheros de configuración incluidos.
- Razonamiento y matemáticas heredados del modelo base Qwen3.6.
- Generación de código y soporte previsible de tool calling / function calling, aunque no se detalla explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso, alineadas con el enfoque de R.E.V.I.S. como sistema multiagente.
- Decodificación especulativa integrada mediante borradores MTP y DFlash para acelerar la generación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking): no confirmado en la información disponible.

## Casos de uso

- Asistente local en Mac para desarrollo: ejecutar un MoE multimodal de 35B en Apple Silicon con 14,1 GiB de pesos permite mantener conversaciones de código y razonamiento sin conexión, aprovechando el contexto de 262.144 tokens para cargar repositorios completos.
- Análisis de documentos técnicos largos: la ventana de contexto permite procesar manuales, papers o contratos extensos en una sola pasada, con entrada de imagen para capturas y diagramas.
- Agentes multi-paso en local: integrado en R.E.V.I.S., el modelo puede orquestar tareas con tool calling y decodificación especulativa para reducir latencia en flujos de varios pasos.
- Atención al cliente automatizada: conversaciones multi-turno con memoria larga gracias al contexto extendido, aunque la dependencia de R.E.V.I.S. limita el despliegue a entornos Mac.
- Prototipado de aplicaciones multimodales: la torre de visión en BF16 y el procesador de vídeo incluido permiten experimentar con image-text-to-text sin infraestructura GPU.
- Investigación en cuantización: el formato Q3T (trellis K3 + afín N6) sirve como caso de estudio para evaluar cuantización data-free en MoE, con manifiestos y checksums publicados.
- Inferencia en hardware con memoria unificada: equipos Apple con 32 GB o más pueden alojar el modelo y los borradores, evitando GPUs dedicadas.

## Benchmarks y rendimiento

La model card menciona una evaluación de divergencia KL frente a BF16 sobre 48 documentos y 17.877 posiciones puntuadas (WikiText-2, documentos técnicos y respuestas propias del modelo), con caché KV emulada a 8 bits, pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Benchmark | Resultado |
|---|---|
| KLD vs BF16 (48 documentos, 17.877 posiciones) | No disponible (cifras no incluidas) |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |

## Requisitos de hardware

- VRAM/memoria estimada: 14,1 GiB para los pesos del modelo más 1,60 GB de borradores; con caché KV a 8 bits y contexto largo, se recomienda un mínimo de 24-32 GB de memoria unificada.
- GPU recomendadas: el modelo está diseñado para Apple Silicon; no se indica soporte para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; el formato trellis requiere kernels del motor R.E.V.I.S.
- Opciones de despliegue: exclusivamente R.E.V.I.S. (versión posterior a v1.3.0). No funciona con vLLM, llama.cpp, Ollama, TGI, transformers, mlx-lm ni mlx-vlm.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-MoE-Q3T (esta ficha) | 9,01B en safetensors (base 35B-A3B) | 262.144 | Q3T trellis + afín 6-bit | Apache 2.0 | Solo R.E.V.I.S. |
| Qwen3.6-35B-A3B (base) | 35B totales, ~3B activos | 262.144 | BF16 | Apache 2.0 | transformers, vLLM, etc. |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Compatibilidad muy restringida: no se ejecuta en mlx-lm, mlx-vlm, transformers ni vLLM; requiere R.E.V.I.S. posterior a v1.3.0 con kernels trellis propietarios.
- El flag `runtime_forward_verified: false` en el manifiesto indica que la conversión verificó los pesos efectivos, no una pasada forward real del motor.
- Cuantización data-free sin calibración: puede degradar la calidad en dominios alejados de la distribución del modelo base, y la model card aún no compara con cuantización afín estándar.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta compilación.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Sesgos del modelo base no evaluados ni mitigados en esta derivación.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de R.E.V.I.S. condiciona la viabilidad en producción.
- El número de parámetros en safetensors (9,01B) difiere del nombre comercial (35B); conviene verificar el recuento real de parámetros activos antes de dimensionar hardware.

## Enlaces

- Hugging Face: https://huggingface.co/mavis-ai/Qwen3.6-35B-MoE-Q3T
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Web oficial de R.E.V.I.S.: https://mavis-ai.co.jp/revis/
- X (Twitter) de mavis-ai: https://x.com/mavis_ai_jp
- Paper referenciado (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
