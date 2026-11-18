# Baekpica/MiniMax-M3.1-Flash-VQ-GGUF

## Resumen

MiniMax-M3.1-Flash-VQ-GGUF es una cuantización vectorial (VQ) del modelo multimodal MiniMax-M3.1-Flash, desarrollada por el usuario Baekpica sobre el checkpoint original de MiniMaxAI. Se trata de un modelo Mixture-of-Experts (MoE) nativo multimodal de 428B parámetros totales con capacidades de visión y vídeo, atención dispersa (MSA) en las 60 capas y una ventana de contexto nativa de 1.048.576 tokens. El objetivo del proyecto es hacer viable la ejecución del modelo completo en una única GPU DGX Spark de 128 GB, algo imposible con el checkpoint original de 236 GB.

La conversión reduce el checkpoint de 236 GB a 115,5 GB de partes GGUF, de las cuales 111,3 GB (103,7 GiB) permanecen residentes en memoria. La técnica central es una cuantización vectorial de 8 dimensiones con codebooks E4M3 por capa para los expertos enrutados, con una etapa residual de 8 bits en 20 de las 57 capas MoE, alcanzando 1,98 bits por peso de media. El resto de componentes (atención, expertos compartidos, FFN densa, cabeza de salida) se cuantiza a Q4_K con importancia por columna, mientras que el router, las normalizaciones y el token embedding se mantienen a mayor precisión.

El resultado es relevante porque demuestra que un modelo frontera de 428B parámetros con contexto de un millón de tokens puede ejecutarse en hardware de escritorio profesional (una DGX Spark), manteniendo una fidelidad medida de KL 0.150 y un 88,2% de coincidencia en el siguiente token frente al original. La release incluye decodificación especulativa mediante la cabeza DSpark de MiniMax y un runtime específico (ds4-dfm-rs) que gestiona la memoria híbrida RAM/SSD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención dispersa (MSA) en todas las capas; 60 capas (3 densas + 57 MoE), hidden 6.144, GQA 64 query / 4 KV heads × 128, RoPE parcial (64 de 128 dims, θ 1e7), QK-norm por cabeza |
| Parámetros totales | 11.835.010.176 según safetensors del repo; 428B según la model card (413,1B en pesos de expertos enrutados) |
| Parámetros activos | 128 expertos enrutados top-4 + 1 experto compartido por capa; FFN de experto 3.072, SwiGLU-OAI |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantización | VQ 8-dim con codebooks E4M3 (13 bits, K=8.192, en 57 capas; +8 bits residual, K=256, en 20 capas); Q4_K para atención, expertos compartidos, FFN densa y cabeza de salida; Q8_0 para proyecciones del indexador MSA y cabeza DSpark; F32 para router y correction bias; BF16 para token embedding y torre de visión |
| Idiomas soportados | en, ko, zh, ja |
| Licencia | minimax-community (other) |
| Formato de pesos | GGUF (61 partes independientes, 115.526.325.376 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 60 capas con 3 capas densas y 57 capas MoE. Cada capa MoE dispone de 128 expertos enrutados con top-4 (activación sigmoide con correction bias ×2,0) más un experto compartido, con FFN de experto de 3.072 dimensiones y activación SwiGLU-OAI. La atención usa GQA con 64 cabezas de query y 4 de KV (128 dimensiones por cabeza), QK-norm estilo Gemma por cabeza y RoPE parcial sobre 64 de las 128 dimensiones con θ=1e7. Todas las capas incorporan MiniMax Sparse Attention (MSA), que permite el contexto de un millón de tokens mediante un indexador que selecciona bloques de K/V. El vocabulario es de 200.064 tokens.

La cuantización del checkpoint original (expertos enrutados en NVFP4, atención/densas/compartidos en MXFP8, entrenado con quantization-aware training) aplica una receta VQ denominada `minimax-m31f-vq8-r13x57-r8x20-q4k-nvfp4idx-ssdkv-embssd-v1`. Los expertos enrutados usan VQ de 8 dimensiones con un codebook E4M3 por capa compartido entre los 128 expertos y las proyecciones gate/up/down, más una ganancia F16 por fila. Los codebooks, asignaciones y ganancias se ajustaron con Lloyd ponderado por calibración (una importance matrix para VQ) usando estadísticas de 4,18M tokens de texto, imagen y vídeo. La etapa residual de 8 bits en 20 capas se eligió mediante medición end-to-end. La torre de visión/vídeo (632M ViT + proyector + MLP de fusión 2×2) se mantiene en BF16 y se lee de SSD solo cuando llega una imagen o vídeo. La cabeza de borrador especulativa DSpark (5 capas, bloque 7, cabeza Markov) se mantiene residente en Q8_0 (2,03 GiB).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (`<mm:think>`, thinking adaptativo, `reasoning_effort`).
- Comprensión de imágenes y vídeo mediante torre ViT nativa y placeholders multimodales en la plantilla de chat.
- Tool calling y function calling con llamadas XML y namespace `]<]minimax[>[`.
- Razonamiento multi-paso y uso como agente gracias al contexto de 1M tokens.
- Decodificación especulativa integrada mediante la cabeza DSpark.
- Capacidades multilingües en inglés, coreano, chino y japonés.
- Procesamiento de sesiones largas con K/V de atención principal en SSD, direccionado por bloques mediante el indexador MSA.

## Casos de uso

- Análisis de documentos extensos: el contexto de 1.048.576 tokens permite procesar libros completos, expedientes o bases de código en una sola pasada sin truncamiento, manteniendo el K/V en SSD para no agotar la VRAM.
- Asistentes de atención al cliente multi-turno: conversaciones largas con historial persistente y recuperación de contexto mediante MSA, adecuado para soporte técnico especializado.
- Comprensión de vídeo y documentos escaneados: la torre ViT de 632M parámetros procesa imágenes y vídeo bajo demanda, útil para moderación de contenido, análisis de grabaciones o extracción de datos de formularios.
- Agentes autónomos con tool calling: el soporte de llamadas XML y el razonamiento multi-paso permiten construir pipelines de agentes que consultan APIs, ejecutan código o navegan fuentes externas.
- Investigación en razonamiento de contexto largo: el modelo permite experimentar con tareas que requieren más de 256K tokens (LOCA-Bench 256K, Automation-Bench) en hardware de una sola GPU.
- Despliegue en entornos con restricciones de memoria: al caber en una DGX Spark de 128 GB, es viable para laboratorios o equipos que no disponen de clústeres multi-GPU.
- Evaluación comparativa de cuantizaciones: sirve como referencia para estudiar el impacto de VQ frente a cuantizaciones escalares en modelos MoE multimodales.

## Benchmarks y rendimiento

La model card reporta únicamente comparaciones frente al modelo original, no frente a modelos de la competencia.

| Benchmark | MiniMax-M3.1-Flash-VQ-GGUF | Original MiniMax-M3.1-Flash | Ratio |
|---|---|---|---|
| CharXiv RQ | 77,5 | 82,5 | 93,9% |
| HLE | en ejecución | no disponible | no disponible |
| LOCA-Bench 256K | pendiente | no disponible | no disponible |
| Automation-Bench | pendiente | no disponible | no disponible |

Métricas de fidelidad de la cuantización (teacher-forced sobre chats retenidos, turnos del asistente):

| Métrica | Valor |
|---|---|
| KL divergencia | 0,150 |
| Coincidencia top-1 | 88,2% |
| KL con 13 bits en todas las capas | 0,223 |

Rendimiento en DGX Spark (GB10, ds4-dfm-rs, medición del 2026-10-29):

| Escenario | Valor |
|---|---|
| Prefill 2K–64K emparejado | 1.001,85 → 1.020,29 tok/s (+1,84%) |
| Últimos 2K a 64K | 990,08 tok/s (+2,87%) |
| Prompt histórico de 1.048.319 tokens | prefill a 580 tok/s y decodificación correcta |

## Requisitos de hardware

- VRAM/RAM: 111,3 GB (103,7 GiB) residentes en memoria; el resto (embedding BF16, torre de visión, K/V de sesión larga) se lee de SSD.
- GPU recomendada: una NVIDIA DGX Spark (GB10, 128 GB) es el objetivo de diseño y el hardware de las mediciones.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, RTX 5090 de 32 GB) por el tamaño del checkpoint residente.
- Despliegue: runtime ds4-dfm-rs, familia `minimax_m3_vq` (PR #110 fusionado; PR #126 para las mejoras de prefill). No se documenta soporte en llama.cpp, vLLM, Ollama ni TGI.
- Almacenamiento: SSD rápido necesario para el streaming de embedding, torre de visión y K/V de sesiones largas.
- Throughput medido: ~1.000 tok/s de prefill en el rango 2K–64K en DGX Spark; no se reporta throughput de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-VQ-GGUF | 428B (11,8B declarados en safetensors) | 1.048.576 | Sí (imagen y vídeo) | minimax-community | GGUF en HF |
| MiniMax-M3.1-Flash (original) | 428B | 1.048.576 | Sí | minimax-community | Pesos originales en HF |
| Otras cuantizaciones GGUF del mismo modelo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores (por ejemplo, otros MoE multimodales de contexto largo), por lo que no se incluyen datos de rendimiento cruzado.

## Limitaciones y advertencias

- La licencia `minimax-community` es de tipo "other"; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- El modelo está pensado para ejecutarse exclusivamente con el runtime ds4-dfm-rs; no hay soporte documentado para llama.cpp, vLLM, Ollama o TGI.
- La fidelidad no es perfecta: KL 0,150 y 88,2% de coincidencia top-1 implican divergencias respecto al original, con mayor riesgo en tareas de razonamiento sensible.
- El rendimiento en benchmarks propios (CharXiv RQ 77,5 frente a 82,5) muestra una degradación del 6,1% respecto al original; HLE, LOCA-Bench 256K y Automation-Bench aún no están publicados.
- Idiomas limitados a inglés, coreano, chino y japonés; no se declara soporte de español.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- El uso de contexto largo depende de un SSD rápido; un almacenamiento lento degradará el prefill y la decodificación.
- Las mejoras de prefill de PR #126 estaban abiertas en el momento de la publicación, por lo que la reproducibilidad requiere fijar la revisión `1358c3d3`.
- El tamaño declarado en safetensors (11,8B) no coincide con los 428B de la model card; conviene verificar el conteo real de parámetros antes de planificar recursos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Baekpica/MiniMax-M3.1-Flash-VQ-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Revisión del modelo base citada: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash/tree/54e4e69dfc452b1e94a426c24a4fdeeaa8e3ad5e
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- PR #110 (soporte `minimax_m3_vq`): https://github.com/Baekpica/ds4-dfm-rs/pull/110
- PR #126 (mejoras de prefill): https://github.com/Baekpica/ds4-dfm-rs/pull/126
- Tablón de discusión / incidencias: https://huggingface.co/Baekpica/MiniMax-M3.1-Flash-VQ-GGUF/discussions
- Manifiesto de tensores: `tensor-manifest.json` (incluido en el repositorio)
- Receta de cuantización: `recipe.json` (incluido en el repositorio)
