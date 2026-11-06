# raahemnabeel/cohost-qwen38-27b-qwen3vl

## Resumen

`cohost-qwen38-27b-qwen3vl` es un paquete de despliegue, no un modelo entrenado desde cero, publicado por el usuario raahemnabeel. Empaqueta y sirve simultáneamente tres modelos de la familia Qwen: el LLM Qwen3.8-27B (con decodificación especulativa DFlash2 y torre de visión), el embedder Qwen3-VL-Embedding-8B y el reranker Qwen3-VL-Reranker-8B. Los pesos se mantienen sin modificar y se convierten a menor precisión en el momento de la carga. El objetivo es ofrecer, en una sola máquina, la terna completa de un pipeline RAG (generación, recuperación densa y reordenación) para agentes de investigación profunda.

El artefacto está diseñado específicamente para hardware Tenstorrent: una QuietBox 2 con dos placas p300 (cuatro chips Blackhole). El LLM ocupa los cuatro chips y los dos modelos de 8B comparten una única torre de texto Qwen3-VL cuyos pesos se reparten por chip (chips 0-1 para el embedder, 2-3 para el reranker), con una copia de 8B por chip. Los modelos se turnan en los chips. La orquestación se realiza mediante `tt-model-manager` (esquema de manifiesto 5.1, tipo `cohost`) y el runtime es vLLM 0.30 con ttnn 0.79.0.

Es relevante ahora porque demuestra el patrón de "co-host" en aceleradores Tenstorrent: varios modelos heterogéneos conviviendo en un mismo proceso y reparto de memoria, algo poco habitual fuera de GPUs convencionales. No obstante, el propio autor advierte de que el paquete no está validado aún en hardware real: solo se ha comprobado un arranque sin dispositivo sobre una malla simulada de cuatro chips.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B con decodificación especulativa DFlash2 y torre de visión; embedder y reranker Qwen3-VL de 8B) |
| Parametros totales | 27B (LLM) + 8B (embedder) + 8B (reranker); no disponible el desglose exacto del drafter |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Pool KV compartido de 262.144 tokens (8 slots); el bundle original soporta 524.288, que no cabe junto a los modelos de 8B |
| Tipos de cuantizacion | Conversión a menor precisión en carga; perfil `lean` con pesos MLP de los 8B en bfp4; no se detallan más formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints originales convertidos en carga; caché de pesos sharding por chip para los 8B (no se indica safetensors/GGUF explícitamente) |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo: reutiliza checkpoints publicados por Qwen (Qwen3.8-27B, Qwen3-VL-Embedding-8B y Qwen3-VL-Reranker-8B) y un drafter de decodificación especulativa de incoai (Qwen3.8-27B-DFlash2). La innovación está en el runtime de servicio: un proceso único que expone cuatro endpoints (LLM en el puerto base, reranker en +4, embedder en +5 y estado del co-host en +6) sobre los cuatro chips Blackhole de una QuietBox 2. El LLM ejecuta el bundle "v6 thin" con vLLM 0.30 y ttnn 0.79.0, con su propio plugin y wheels de operaciones horneados en la imagen. La decodificación especulativa DFlash2 acelera la generación del LLM.

Los dos modelos de 8B comparten una torre de texto Qwen3-VL con pesos particionados por chip y una copia de 8B por chip; los modelos se turnan en los chips. El paquete incluye cuatro perfiles de servicio: `qwen38` (por defecto, LLM + embedder + reranker), `qwen38-lean` (MLP de los 8B en bfp4, unos 2,6 GiB menos por chip), `qwen38-solo` (solo LLM, validación) y `qwen3vl-solo` (solo embedder y reranker). No se detallan datos de entrenamiento ni procesos de RLHF/DPO, ya que corresponden a los modelos base de Qwen.

## Capacidades

- Generación de texto, razonamiento y código mediante Qwen3.8-27B.
- Llamada a herramientas (tool calling) con el formato `qwen3_coder`.
- Modo de razonamiento con presupuesto de pensamiento opcional (`TT_THINK_BUDGET`).
- Visión en el LLM: hasta 4 imágenes por petición.
- Embeddings de texto mediante Qwen3-VL-Embedding-8B (endpoint `/v1/embeddings`).
- Reordenación de documentos mediante Qwen3-VL-Reranker-8B (endpoint `/v1/rerank`).
- Endpoint de estado del co-host para monitorización.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Embedder y reranker son solo texto: las entradas de imagen devuelven HTTP 400.

## Casos de uso

- Pipeline RAG completo en una sola máquina: el LLM genera respuestas, el embedder indexa y recupera documentos y el reranker reordena los candidatos, todo servido desde un único proceso y con endpoints separados.
- Agentes de investigación profunda (deep research): el LLM con tool calling y razonamiento multi-paso consulta fuentes, mientras el embedder y el reranker filtran y priorizan la evidencia recuperada.
- Asistentes con entrada de imágenes: el LLM acepta hasta 4 imágenes por petición, útil para tareas de documentación técnica o análisis visual combinado con texto.
- Generación de código asistida: el soporte de `qwen3_coder` permite integrar el LLM en flujos de desarrollo con llamadas a herramientas y ejecución de acciones.
- Búsqueda semántica sobre corpus técnicos: el embedder de 8B genera vectores densos y el reranker afina el orden final de resultados.
- Evaluación comparativa de stacks de aceleración: los perfiles `qwen38-solo` y `qwen3vl-solo` permiten medir cada componente por separado frente al modo co-host.
- Prototipado en hardware Tenstorrent: validación de despliegues multi-modelo en Blackhole antes de trasladarlos a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el rendimiento no se ha medido aún en hardware. Los únicos datos son las estimaciones de memoria del arranque simulado (malla de 4 chips, sin trazar, 2026-11-04):

| Componente | GiB por chip |
|---|---:|
| Pesos Qwen3.8-27B + drafter DFlash2 + visión | 10,91 |
| Pool KV (262.144 tokens, 8 slots), incl. 5,10 de estado recurrente (120 x 43,5 MiB) | 7,95 |
| Buffers de servicio DFlash (calentamiento) | 2,23 |
| Embedder + reranker Qwen3-VL (una copia de 8B por chip) | 8,03 |
| **Total antes de transitorios de petición** | **29,13** (de unos 29,8 asignables junto a una región de traza de 2 GiB) |

L1 retenida por núcleo por Qwen3.8: 89,6 KiB. Velocidad esperada: la del LLM en modo monomodelo mientras los 8B están inactivos, según lo medido para el paquete co-host Ornith-1.5-122B (147 tok/s solo y en grupo).

## Requisitos de hardware

- Hardware objetivo: QuietBox 2 con dos placas p300 (cuatro chips Blackhole) y los cuatro chips libres.
- DRAM: 29,13 GiB por chip de 29,8 asignables antes de transitorios; el autor advierte que es ajustado y recomienda el perfil `qwen38-lean` si falla el arranque o un prefill largo.
- Pesos en disco: unos 56 GB para Qwen3.8-27B, unos 34 GB para el drafter y los dos checkpoints de 8B, más unos 40 GB de caché de pesos sharding por chip generada en el primer arranque.
- Región de traza: 2 GiB (el bundle original usa 1 GiB); las trazas de texto de los 8B la comparten.
- No cabe en GPU de consumo: requiere el hardware Tenstorrent especificado.
- Despliegue: Docker más `tt-model-manager` (rama `raahem/cohost-mixed-groups` de rnabeelTT/tt-kernel-package-manager, commit 1008ca2 o posterior); comandos `tt-model pull --with-weights` y `tt-model serve --port 8000`.
- Latencia y throughput reales: no medidos en hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cohost-qwen38-27b-qwen3vl | 27B + 8B + 8B | 262.144 tokens (pool compartido) | Apache 2.0 | Hugging Face (0 descargas) | Paquete de servicio para Tenstorrent; sin validar en hardware |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | Hugging Face | Modelo base del LLM; sin embedder ni reranker integrados |
| Qwen3-VL-Embedding-8B (base) | 8B | no disponible | no disponible | Hugging Face | Embedder de referencia; se sirve por separado |
| Qwen3-VL-Reranker-8B (base) | 8B | no disponible | no disponible | Hugging Face | Reranker de referencia; se sirve por separado |

## Limitaciones y advertencias

- No validado en hardware: solo se ha comprobado el arranque sin dispositivo sobre una malla simulada de cuatro chips; no se han verificado el arranque trazado, el servicio DFlash, la velocidad ni la numeridad.
- DRAM muy ajustada (29,13 de 29,8 GiB por chip antes de transitorios); riesgo de agotamiento en el arranque o en prefills largos.
- El contexto se reduce a 262.144 tokens frente a los 524.288 del bundle original, que no caben junto a los modelos de 8B.
- Embedder y reranker son solo texto; las entradas de imagen devuelven HTTP 400.
- La imagen parchea la lista de permitidos del ejecutor del plugin para admitir el RemoteExecutor del co-host en modelos de salida por bloques (DFlash).
- La plantilla de chat modifica el checkpoint original para no fallar cuando el último mensaje no es del usuario (bucles de agente que terminan en un resultado de herramienta).
- Los modelos se turnan en los chips: la concurrencia entre LLM, embedder y reranker está limitada por el reparto de recursos.
- Riesgo de sesgos y alucinaciones: no documentado en la información disponible; heredado de los modelos base de Qwen.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los checkpoints base y del drafter de terceros.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/raahemnabeel/cohost-qwen38-27b-qwen3vl
- Modelo base LLM: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter especulativo: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Embedder: https://huggingface.co/Qwen/Qwen3-VL-Embedding-8B
- Reranker: https://huggingface.co/Qwen/Qwen3-VL-Reranker-8B
- Código de servicio Qwen3.8: https://huggingface.co/mando2222/qwen3.8-27b-dflash2-vision-p300x2-q4kv-v6-thin-cp4
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Paquete co-host de referencia: https://huggingface.co/raahemnabeel/cohost-ornith-122b-qwen3vl
