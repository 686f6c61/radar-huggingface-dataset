# raahemnabeel/cohost-ornith-35b-qwen3vl

## Resumen

cohost-ornith-35b-qwen3vl es un paquete de despliegue (no un modelo entrenado desde cero) publicado por raahemnabeel que empaqueta tres modelos bajo un mismo proceso de servicio sobre hardware Tenstorrent Blackhole. Concretamente, sirve ornith-ai/Ornith-1.5-35B-A3B (chat, razonamiento, tool calling y visión), Qwen/Qwen3-VL-Embedding-8B (embeddings de recuperación) y Qwen/Qwen3-VL-Reranker-8B (puntuaciones de relevancia) de forma simultánea en las cuatro chips de un QuietBox 2 (dos placas p300). Los checkpoints se sirven sin modificar, convertidos a menor precisión en carga.

El interés técnico está en el co-hosting: los dos modelos de 8B comparten una torre de texto Qwen3-VL cuyos pesos se reparten por chip (chips 0-1 para el embedder, chips 2-3 para el reranker), de modo que cada chip aloja una copia de 8B y una sola pasada puede atender peticiones de ambos modelos. El stack está pensado para agentes de investigación profunda y RAG que necesitan a la vez un LLM grande de razonamiento, un embedder y un reranker en una sola máquina, cuando el LLM requiere las cuatro chips.

El repositorio ocupa 2,1 GB y se empaqueta con tt-model-manager (esquema de manifiesto 5.1, tipo `cohost`, grupo mixto vLLM + app). Es relevante como referencia de ingeniería de despliegue multi-modelo en aceleradores Tenstorrent, aunque en la fecha de publicación no se ha validado en hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de tres modelos: Ornith-1.5-35B-A3B (LLM, presumiblemente MoE por el sufijo A3B) + Qwen3-VL-Embedding-8B + Qwen3-VL-Reranker-8B; empaquetado como grupo co-host en tt-model-manager |
| Parámetros totales | 35B (Ornith) + 8B (embedder) + 8B (reranker); no disponible el desglose exacto de parámetros activos de Ornith |
| Parámetros activos | no disponible (el nombre A3B sugiere ~3B activos en Ornith, sin confirmación en la información proporcionada) |
| Longitud de contexto | Ornith: pool KV compartido de 1.048.576 tokens, hasta 32 secuencias simultáneas, un usuario puede alcanzar 262.144 tokens; embedder/reranker: pares de hasta 8.192 tokens (hasta 4.096 en trazas capturadas) |
| Tipos de cuantización | Conversión a menor precisión en carga; perfil `lean` con pesos MLP de los 8B en bfp4; política de precisión `p0_bfp8_hifi2` para embedder y reranker |
| Idiomas soportados | no disponible |
| Licencia | mit-and-apache-2.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | no disponible explícitamente; checkpoints originales de los modelos base convertidos en carga; caché de pesos shardeados por chip (~40 GB) generada en el primer arranque |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: es una pila de servicio. Ornith-1.5-35B-A3B es un LLM de ornith-ai (chat, razonamiento, tool calls, imágenes), y los dos modelos Qwen3-VL de 8B son el embedder y el reranker de Qwen. Los checkpoints se sirven sin modificar, con conversión a menor precisión al cargar, y los detalles de entrenamiento y evaluación remiten a las model cards originales.

La innovación está en el empaquetado: un único proceso sirve los tres modelos en las cuatro chips Blackhole de un QuietBox 2, con los dos 8B compartiendo una torre de texto Qwen3-VL cuyos pesos se reparten por chip (chips 0-1 embedder, chips 2-3 reranker). Los modelos se turnan en las chips: un prefill largo de Ornith retrasa las peticiones de embedding y rerank, y viceversa. El paquete usa tt-model-manager con manifiesto de esquema 5.1 y grupo mixto vLLM + app, e incluye perfiles de servicio (`ornith35b`, `ornith35b-lean`, `ornith35b-vision` experimental, y los baselines `ornith35b-solo` y `qwen3vl-solo`).

## Capacidades

- Generación de texto, razonamiento y tool calling vía endpoint compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`), con el razonamiento expuesto en el campo `reasoning`.
- Entrada de imágenes en Ornith: hasta 4 imágenes por petición.
- Embeddings de recuperación con Qwen3-VL-Embedding-8B: salida de 4096 dimensiones, con dimensiones Matryoshka desde 64 (`/v1/embeddings`).
- Reranking de relevancia con Qwen3-VL-Reranker-8B: endpoints `/v1/rerank` y `/v1/score`.
- Perfil `ornith35b-vision` experimental: añade las torres de visión de ambos modelos de 8B (entradas de imagen al embedder y al reranker), en tensor-parallel sobre las cuatro chips.
- Estado de co-host en el puerto +6: readiness, DRAM y L1 por miembro.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de investigación profunda (deep research): un mismo proceso ofrece el LLM de razonamiento, el embedder para recuperación y el reranker para ordenar evidencias, sin saltos entre máquinas ni serialización de pipelines.
- RAG sobre documentación técnica: el embedder genera vectores de 4096 dimensiones (reducibles con Matryoshka) y el reranker puntúa los candidatos antes de pasarlos a Ornith para la respuesta final.
- Asistentes con entrada visual: Ornith acepta hasta 4 imágenes por petición, útil para soporte técnico sobre capturas o diagramas, con el perfil `ornith35b-vision` para búsqueda multimodal.
- Automatización con tool calling: Ornith expone tool calls en formato OpenAI, integrable en orquestadores de agentes que encadenen búsqueda, recuperación y razonamiento multi-paso.
- Búsqueda semántica interna: el embedder con dimensiones Matryoshka desde 64 permite índices ligeros en memoria y recálculo a mayor dimensión cuando se necesita precisión.
- Evaluación y prototipado en aceleradores Tenstorrent: los perfiles `ornith35b-solo` y `qwen3vl-solo` permiten aislar cada componente como baseline de validación del co-hosting.
- Despliegue en una sola caja para entornos con requisitos de localización de datos: todo el stack (LLM, embedder, reranker) reside en un QuietBox 2, sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el rendimiento no se ha medido en hardware. Los únicos datos son de arranque sin dispositivo (malla simulada de 4 chips, sin trazas, 2026-11-04), con DRAM por chip según el asignador simulado:

| Componente | GiB por chip |
|---|---:|
| Qwen3-VL embedder + reranker (una copia 8B por chip) | 8,03 |
| Pesos de Ornith-1.5-35B-A3B (cuatro dies) | 9,18 |
| Pool KV de Ornith (1.048.576 tokens) | 6,32 |
| **Total tras carga** | **23,54** (el warmup añade ~1 GiB; ~5 GiB de margen) |

L1 retenido por núcleo por Ornith-35B: 173,1 KiB (los programas de 8B caben junto a los 254,3 KiB del 122B en hardware). Velocidad esperada: Ornith a la velocidad de su paquete monomodelo p300x2 mientras los 8B están inactivos, sin coste de co-host según lo medido para el paquete co-host del 122B.

## Requisitos de hardware

- Hardware objetivo: QuietBox 2 (dos placas p300) con las cuatro chips Blackhole libres. No es un despliegue para GPU convencionales.
- Disco: ~34 GB para los pesos de los tres modelos más ~40 GB de caché de pesos shardeados por chip generada en el primer arranque.
- DRAM por chip tras carga: 23,54 GiB según el asignador simulado, con ~5 GiB de margen; el perfil `lean` libera ~2,6 GiB por chip al pasar los MLP de los 8B a bfp4.
- Software: Docker, tt-model-manager con soporte de grupos mixtos co-host (instalación desde la rama `raahem/cohost-mixed-groups` mientras no haya release), y `tt-model` para pull y serve.
- Puertos: Ornith en +0 (por defecto 8000), reranker en +4 (8004), embedder en +5 (8005), estado co-host en +6 (8006).
- Latencia y throughput: no medidos en hardware; no disponibles.
- VRAM en GPU consumer, despliegue con vLLM/llama.cpp/Ollama/TGI: no aplicable ni disponible para este paquete, que depende del runtime de Tenstorrent.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cohost-ornith-35b-qwen3vl | 35B + 8B + 8B (tres modelos) | 1.048.576 tokens de pool KV (Ornith); 8.192 por par en embedder/reranker | mit-and-apache-2.0 | Hugging Face, requiere QuietBox 2 |
| ornith-ai/Ornith-1.5-35B-A3B | 35B (A3B) | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-VL-Embedding-8B | 8B | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-VL-Reranker-8B | 8B | no disponible | no disponible | Hugging Face |
| raahemnabeel/cohost-ornith-122b-qwen3vl | 122B + 8B + 8B | no disponible | no disponible | Hugging Face, validado en hardware según la model card |

## Limitaciones y advertencias

- No validado en hardware: las comprobaciones son sin dispositivo sobre una malla simulada de 4 chips, que se detiene en el warmup de Ornith porque el all-reduce en anillo requiere el enlace de placa a placa del QuietBox 2 que la topología simulada no tiene.
- Los modelos se turnan en las chips: un prefill largo de Ornith retrasa las peticiones de embedding y rerank, y al contrario; no hay paralelismo real entre miembros.
- Ornith sirve como máximo 32 secuencias simultáneas con el pool KV compartido de 1.048.576 tokens, para dejar DRAM a los modelos de 8B.
- Embedder y reranker ejecutan un programa en cada chip y comparten la política de precisión del embedder (`p0_bfp8_hifi2`), lo que puede alterar ligeramente las puntuaciones respecto al paquete monomodelo del reranker.
- El perfil `ornith35b-vision` es experimental; el perfil `lean` cambia ligeramente embeddings y puntuaciones de rerank.
- Dependencia de una rama no publicada de tt-model-manager para grupos mixtos co-host.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas: no disponibles en la información proporcionada; deben consultarse en las model cards de los modelos base.
- Restricciones de licencia comercial: la licencia se declara como `other` con nombre `mit-and-apache-2.0`; conviene verificar los términos de cada modelo base antes de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/raahemnabeel/cohost-ornith-35b-qwen3vl
- Modelo base Ornith: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Embedder: https://huggingface.co/Qwen/Qwen3-VL-Embedding-8B
- Reranker: https://huggingface.co/Qwen/Qwen3-VL-Reranker-8B
- Paquete monomodelo de Ornith: https://huggingface.co/raahemnabeel/ornith-1.5-35b-a3b
- Paquete co-host del 122B (validado en hardware): https://huggingface.co/raahemnabeel/cohost-ornith-122b-qwen3vl
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Rama con grupos mixtos co-host: https://github.com/rnabeelTT/tt-kernel-package-manager/tree/raahem/cohost-mixed-groups
