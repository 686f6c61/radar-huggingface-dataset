# raahemnabeel/cohost-ornith-122b-qwen3vl

## Resumen

cohost-ornith-122b-qwen3vl es un paquete de despliegue (no un modelo entrenado desde cero) publicado por el usuario raahemnabeel que empaqueta tres modelos independientes en un único proceso de servicio sobre hardware Tenstorrent Blackhole. Concretamente, sirve ornith-ai/Ornith-1.5-122B (chat, razonamiento, tool calling y visión), Qwen/Qwen3-VL-Embedding-8B (embeddings de recuperación de 4096 dimensiones) y Qwen/Qwen3-VL-Reranker-8B (puntuación de relevancia), cada uno en su propio endpoint, compartiendo las cuatro chips de un QuietBox 2 (dos placas p300).

El interés técnico reside en el "co-hosting": los dos modelos de 8B comparten una única torre de texto Qwen3-VL cuyos pesos se reparten por chip (chips 0-1 para el embedder, chips 2-3 para el reranker), de modo que cada chip aloja una copia de 8B y una sola pasada puede atender peticiones de ambos modelos. El paquete se distribuye con tt-model-manager (esquema de manifiesto 5.1, tipo `cohost`) e incluye perfiles de servicio seleccionables (`ornith122b`, `ornith122b-lean`, `ornith122b-vision`, `ornith122b-solo`, `qwen3vl-solo`).

Es relevante para equipos que construyen agentes de investigación profunda o pipelines RAG que necesitan simultáneamente un LLM grande de razonamiento, un embedder y un reranker en una sola máquina con aceleradores Tenstorrent, sin depender de GPUs NVIDIA. El repositorio de HuggingFace pesa 2,1 GB (solo configuración y manifiestos; los pesos se descargan aparte, unos 34 GB más otros 40 GB de caché fragmentada por chip).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (paquete de servicio; subyacente: Ornith-1.5-122B + 2x Qwen3-VL-8B) |
| Parametros totales | No disponible de forma agregada (122B + 8B + 8B segun modelos base) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible para Ornith; pares embedder/reranker hasta 8192 tokens (4096 en trazas capturadas) |
| Tipos de cuantizacion | Conversion a menor precision al cargar; perfil `lean` usa bfp4 para MLPs de los 8B |
| Idiomas soportados | No disponible |
| Licencia | mit-and-apache-2.0 (declarada como `other` en metadatos) |
| Formato de pesos | No disponible (caché fragmentada por chip generada al arrancar) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: es un stack de serving. Ornith-1.5-122B se ejecuta "exactamente como en su propio paquete" (raahemnabeel/ornith-1.5-122b), con checkpoints sin modificar convertidos a menor precisión en la carga. Los dos modelos Qwen3-VL-8B comparten una torre de texto cuyos pesos se reparten entre chips (0-1 embedder, 2-3 reranker), y los modelos se turnan en las chips. El empaquetado usa tt-model-manager con grupos mixtos vLLM + app, una funcionalidad que en la fecha de publicación aún requería instalar desde una rama específica (`raahem/cohost-mixed-groups`).

El perfil por defecto ocupa 28,21 GiB de DRAM por chip tras el arranque: 8,03 GiB para el par Qwen3-VL, 17,01 GiB para pesos de Ornith, 2,22 GiB para la KV de Ornith y 0,14 GiB para trazas. El perfil `lean` mueve los MLPs de los 8B a bfp4 (unos 2,6 GiB menos por chip) y cede esa DRAM al pool KV de Ornith, a cambio de pequeñas variaciones en embeddings y scores. El perfil `vision` (experimental) añade las torres visuales de ambos 8B en tensor-parallel sobre las cuatro chips. No se detallan datos de entrenamiento, composición del dataset ni si hubo RLHF/DPO; la model card remite a las fichas originales.

## Capacidades

- Generación de texto, razonamiento y tool calling mediante Ornith-1.5-122B en el puerto base (+0), con API compatible con OpenAI (chat/completions).
- Modo de razonamiento expuesto en el campo `reasoning` de la respuesta.
- Entrada de imágenes en Ornith: hasta 4 imágenes por petición (perfil por defecto); el perfil `vision` habilita además imágenes para embedder y reranker.
- Embeddings de recuperación de 4096 dimensiones con dimensiones Matryoshka desde 64 (endpoint `/v1/embeddings`, puerto +5).
- Reranking de documentos mediante `/v1/rerank` y `/v1/score` (puerto +4), con pares de hasta 8192 tokens.
- Endpoint de estado del co-host (puerto +6) con readiness, DRAM y L1 por miembro.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de investigación profunda en una sola máquina: el stack combina el LLM de razonamiento con recuperación (embedder) y reordenación (reranker) en el mismo proceso, evitando saltos de red entre servicios y simplificando el despliegue en un QuietBox 2.
- Pipelines RAG con reordenación: el embedder genera vectores de 4096 dimensiones (reducibles vía Matryoshka a 64 para índices ligeros) y el reranker puntúa hasta 30 documentos en 1,40 s, adecuado para reordenar candidatos antes de pasarlos a Ornith.
- Búsqueda semántica sobre documentación técnica: el embedder responde en 0,28 s por consulta y 2,40 s para 64 documentos, lo que permite indexación por lotes y consulta interactiva.
- Asistentes con entrada visual: Ornith acepta hasta 4 imágenes por petición, útil para soporte técnico con capturas de pantalla o análisis de diagramas.
- Automatización con tool calling: Ornith expone tool calls vía API OpenAI, integrable en orquestadores de agentes que necesiten razonamiento multi-paso con acceso a herramientas.
- Validación y benchmarking en hardware Tenstorrent: los perfiles `ornith122b-solo` y `qwen3vl-solo` permiten comparar el rendimiento del co-host frente a los paquetes individuales en la misma máquina.
- Servicio concurrente para varios usuarios: con 8 usuarios simultáneos, Ornith mantiene 21,9 tok/s por usuario (134 tok/s agregados) mientras el embedder y el reranker siguen respondiendo (0,09 s y 2,57 s/1,65 s respectivamente).

## Benchmarks y rendimiento

Rendimiento medido en un QuietBox 2 (4x Blackhole p300c) el 2026-11-04, perfil `ornith122b`, todo en caliente:

| Métrica | Valor |
|---|---|
| DRAM por chip tras arranque | 28,21 GiB (Qwen3-VL 8,03; Ornith pesos 17,01; Ornith KV 2,22; trazas 0,14) |
| L1 por core | 254,3 KiB |
| Tiempo hasta listo (cachés calientes) | ~16 min (carga de pesos de Ornith ~11 min) |
| Ornith, 1 usuario, 128 tokens de salida | TTFT 0,39 s, 31,5 tok/s |
| Ornith, 8 usuarios | TTFT 1,78 s, 21,9 tok/s por usuario, 134 tok/s total |
| Embedder: 1 consulta / 64 documentos | 0,28 s / 2,40 s |
| Reranker: 30 documentos | 1,40 s |
| Embedder/reranker con 8 streams de Ornith decodificando | 0,09 s / 2,57 s (64 docs) / 1,65 s (rerank 30) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible; la model card remite a las fichas de los modelos base.

## Requisitos de hardware

- Hardware específico: QuietBox 2 con dos placas p300 (cuatro chips Blackhole) y todas las chips libres. No es desplegable en GPU convencionales.
- Disco: ~34 GB para los pesos de Ornith-1.5-122B más los dos checkpoints de 8B, y ~40 GB adicionales para la caché de pesos fragmentada por chip escrita en el primer arranque.
- DRAM: 28,21 GiB por chip en el perfil por defecto; el perfil `lean` reduce ~2,6 GiB por chip si se agota la DRAM.
- Software: Docker y tt-model-manager con soporte de grupos mixtos (instalación desde la rama `raahem/cohost-mixed-groups` o desde un checkout local).
- Despliegue: `tt-model pull ... --with-weights` y `tt-model serve ... --port 8000`, con endpoints en +0 (Ornith), +4 (reranker), +5 (embedder) y +6 (estado).
- Throughput: 31,5 tok/s con un usuario y 134 tok/s agregados con ocho; sensiblemente inferior al paquete individual de Ornith (133 tok/s con un usuario) por la sobrecarga del runtime co-host (dos round-trips por socket Unix por paso de decodificación, sin solapamiento asíncrono de pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cohost-ornith-122b-qwen3vl | 122B + 8B + 8B | No disponible (pares 8192) | 31,5 tok/s (1 usuario) en QuietBox 2 | mit-and-apache-2.0 | HuggingFace, requiere hardware Tenstorrent |
| raahemnabeel/ornith-1.5-122b (paquete individual) | 122B | No disponible | 133 tok/s (1 usuario) | No disponible | HuggingFace |
| Qwen/Qwen3-VL-Embedding-8B | 8B | No disponible | No disponible | No disponible | HuggingFace |
| Qwen/Qwen3-VL-Reranker-8B | 8B | No disponible | No disponible | No disponible | HuggingFace |

La comparación relevante es contra los paquetes individuales de los mismos modelos: el co-host sacrifica velocidad de Ornith (31,5 frente a 133 tok/s) a cambio de servir los tres modelos a la vez en una sola caja.

## Limitaciones y advertencias

- Validación parcial: la model card reconoce que no se ejecutaron evaluaciones de calidad ni la comparación A/B de Ornith contra su paquete individual en la misma máquina.
- Fidelidad del embedder: coseno medio de 0,9993 (mínimo 0,9984) frente al paquete individual en 16 textos; el reranker acierta el top-1 en 8/8 consultas pero el orden completo solo en 7/8.
- Rendimiento degradado de Ornith respecto a su paquete individual por la sobrecarga del runtime co-host.
- El perfil `ornith122b-vision` está marcado como EXPERIMENTAL.
- Requiere una versión de tt-model-manager aún no publicada en release (rama específica), lo que añade riesgo de mantenimiento.
- Dependencia de hardware propietario Tenstorrent Blackhole; no hay soporte para GPU NVIDIA/AMD documentado.
- Licencia declarada como `other` con nombre `mit-and-apache-2.0`: conviene verificar los términos de los tres modelos base antes de uso comercial.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos de los modelos base: no evaluados en esta ficha.
- Tiempo de arranque de ~16 minutos con cachés calientes y ~40 GB de caché adicional en disco.

## Enlaces

- HuggingFace: https://huggingface.co/raahemnabeel/cohost-ornith-122b-qwen3vl
- Paquete individual de Ornith: https://huggingface.co/raahemnabeel/ornith-1.5-122b
- Modelo base Ornith: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Embedder: https://huggingface.co/Qwen/Qwen3-VL-Embedding-8B
- Reranker: https://huggingface.co/Qwen/Qwen3-VL-Reranker-8B
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Rama con grupos mixtos: https://github.com/rnabeelTT/tt-kernel-package-manager/tree/raahem/cohost-mixed-groups
