# npario/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next es el primer modelo open-weight basado en la arquitectura que dará lugar a Qwen4, desarrollado por QwenLM. Esta ficha cubre la versión cuantizada a GGUF publicada por AtomicChat (usuario npario en HuggingFace), que ha sido auto-cuantizada desde los pesos originales en BF16 utilizando una importance matrix propia y publicada junto a los quants. El modelo es un MoE multimodal de aproximadamente 177 000 millones de parámetros, de los cuales solo unos 6 000 millones se activan por token, más una tabla n-gram de 51 000 millones de parámetros que se pagina desde SSD, lo que permite ejecutarlo en equipos con memoria limitada.

La relevancia de este lanzamiento radica en que introduce una arquitectura híbrida GDN + QSA (attention con gating y query-key attention) que mejora la eficiencia computacional y la capacidad del modelo, además de incorporar una tabla de búsqueda n-gram que reduce drásticamente los requisitos de memoria en inferencia. La versión GGUF aquí descrita está pensada para ejecutarse con llama.cpp en hardware de consumo, incluyendo Apple Silicon, con soporte de visión mediante un proyector multimodal separado. El repositorio incluye tres niveles de cuantización (IQ4_XS, Q4_K_M y Q5_K_M) y una importance matrix de calibración pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con GDN + QSA (attention con gating y query-key attention) |
| Parametros totales | 176 943 899 520 (~177B) |
| Parametros activos | ~6B por token (expertos) + lectura de tabla n-gram (~2,7 KB por token) |
| Longitud de contexto | 32 768 tokens (configuración de ejemplo en llama.cpp; el modelo base puede soportar más, no confirmado) |
| Tipos de cuantizacion | IQ4_XS (3,84 bpw), Q4_K_M (4,27 bpw), Q5_K_M (5,00 bpw), mmproj F16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (shards; el shard 2 contiene exclusivamente la tabla n-gram) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next emplea una arquitectura MoE híbrida que combina dos mecanismos de atención: GDN (gated attention) y QSA (query-key attention), junto con mejoras en los residuales, embeddings y la optimización del entrenamiento. Según el repositorio oficial de QwenLM, estas mejoras buscan incrementar la capacidad del modelo a la vez que se optimiza la eficiencia computacional y la estabilidad del entrenamiento. El modelo tiene 177B parámetros en total, de los cuales 51B corresponden a una tabla de búsqueda n-gram que no son pesos convencionales: el modelo hashea los últimos tres tokens y accede a 16 filas de 160 valores (aproximadamente 2,7 KB por token) en una tabla de 39 GB. Esta tabla se lee una vez por forward pass y está diseñada para paginarse desde SSD, lo que reduce drásticamente la memoria necesaria en inferencia.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. La cuantización GGUF fue realizada por AtomicChat con su propia importance matrix, calculada sobre pesos BF16 (nunca sobre proxies cuantizados), utilizando un corpus de calibración público de 4 967 044 tokens en 3 004 documentos. Los quants se evaluaron contra las logits del modelo BF16 sobre un conjunto neutral de 87 chunks a contexto 4096, con una PPL de referencia de 4,0445 ± 0,0216.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de modo thinking (según la descripción de Wiro AI).
- Capacidades multimodales: el modelo acepta imágenes mediante un proyector de visión (mmproj) que se proporciona en formato F16.
- Soporte de tool calling y function calling: no confirmado explícitamente en la documentación disponible, pero es una capacidad habitual en los modelos recientes de la familia Qwen.
- Ejecución local eficiente gracias a la tabla n-gram paginada desde SSD, lo que permite usar el modelo en equipos con menos RAM que el tamaño del archivo.
- Compatible con llama.cpp y con Atomic Chat, que ya lo integra.
- Multilingüismo: no se especifican los idiomas soportados en la información disponible.

## Casos de uso

- Asistente conversacional local con visión: el modelo puede procesar imágenes y mantener conversaciones multi-turno, ejecutándose en un MacBook M5 Max con 64 GB de RAM a 36 tok/s, lo que lo hace viable para uso personal sin depender de la nube.
- Generación de código en entornos de desarrollo: con 32K de contexto y capacidades de razonamiento, puede asistir en tareas de programación, revisión de código y generación de tests, integrándose en flujos de trabajo con llama.cpp.
- Análisis de documentos técnicos con imágenes: la combinación de visión y texto permite extraer información de diagramas, capturas de pantalla o documentos escaneados, útil en entornos de investigación o soporte técnico.
- Prototipado de aplicaciones de IA en hardware de consumo: al poder ejecutarse en equipos con 64 GB de RAM (o menos con el quant de 3,84 bpw), es adecuado para desarrolladores que quieran experimentar con un MoE de gran tamaño sin acceso a GPUs de datacenter.
- Razonamiento multi-step para agentes: su capacidad de razonamiento y su ventana de contexto permiten construir agentes que planifican y ejecutan tareas complejas, aunque la documentación no confirma explícitamente el soporte de tool calling.
- Despliegue en servidores con GPUs de gama alta: con los quants de mayor fidelidad (Q4_K_M o Q5_K_M), puede servir aplicaciones de chat o análisis en producción utilizando vLLM o TGI, siempre que se disponga de suficiente VRAM (más de 56 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de fidelidad de cuantización y rendimiento de inferencia medidos en un MacBook M5 Max con 64 GB de RAM:

| Build | In memory | On SSD | Total | Mean KLD | Same top-1 | PPL ratio |
|---|---|---|---|---|---|---|
| AD-3.84bpw-IQ4_XS-M64 | 45,8 GB | 39,1 GB | 84,9 GB | 0,2277 | 82,68% | 1,102 |
| AD-4.27bpw-Q4_K_M-M64 | 54,5 GB | 38,4 GB | 92,9 GB | 0,0842 | 89,49% | 1,026 |
| AD-5.00bpw-Q5_K_M-M64 | 56,1 GB | 54,4 GB | 110,5 GB | 0,0837 | 89,55% | 1,026 |

Rendimiento medido en el MacBook M5 Max: pp512 517,9 tok/s, tg128 36,0 tok/s. El build AD-4.27bpw es el recomendado por el autor por ofrecer una fidelidad equivalente al de 5,00 bpw con un tamaño 17,6 GB menor.

## Requisitos de hardware

- AD-3.84bpw: 45,8 GB de memoria GPU, 39,1 GB en SSD. Adecuado para equipos con 64 GB de RAM o menos.
- AD-4.27bpw: 54,5 GB de memoria GPU, 38,4 GB en SSD. Requiere al menos 64 GB de RAM en Apple Silicon.
- AD-5.00bpw: 56,1 GB de memoria GPU, 54,4 GB en SSD. Para equipos con más de 64 GB de RAM.
- En GPUs NVIDIA, se necesita una con al menos 46-56 GB de VRAM (A100 80GB, H100, etc.) o usar offloading a CPU, aunque la tabla n-gram debe permanecer en SSD para que el mecanismo de paginación funcione.
- En Apple Silicon, es imprescindible que la tabla n-gram esté en su propio shard GGUF (shard 2) y que se mantenga mmap activado; además, se requiere `-fit off` en llama.cpp para evitar errores de asignación de memoria.
- Opciones de despliegue: llama.cpp (llama-cli y llama-mtmd-cli), Atomic Chat, y potencialmente vLLM o TGI si se adaptan a esta arquitectura (no confirmado).
- Latencia: 36 tok/s en generación y 517,9 tok/s en prefill en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos por token | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16 original) | 177B | ~6B | no disponible | qwen-community-1.0 | safetensors |
| Qwen3.8-Flash-Next GGUF (AtomicChat) | 177B | ~6B | 32K (ejemplo) | qwen-community-1.0 | GGUF |
| Qwen3.8-Flash-Next GGUF (Unsloth) | 177B | ~6B | no disponible | qwen-community-1.0 | GGUF |

No se dispone de datos de rendimiento comparativos con otros modelos MoE de tamaño similar (por ejemplo, Qwen3-235B-A22B o DeepSeek-V3) en la información proporcionada. La principal diferencia frente al modelo base es el formato GGUF y la cuantización, que reduce el tamaño de 354 GB (BF16 estimado) a entre 85 y 110 GB, con una pérdida de fidelidad medida por KLD y PPL ratio.

## Limitaciones y advertencias

- Requiere una build de llama.cpp con soporte específico para la arquitectura Qwen3.8-Flash-Next; sin ella, el modelo no puede ejecutarse.
- En Apple Silicon, el shard 2 debe contener exclusivamente la tabla n-gram; si se intercala con otros tensores, el sistema falla con un error de memoria de GPU (`kIOGPUCommandBufferCallbackErrorOutOfMemory`).
- Es obligatorio desactivar el ajuste automático de parámetros de llama.cpp (`-fit off`), ya que el ajuste automático no dimensiona correctamente esta arquitectura.
- El quant de 3,84 bpw presenta una pérdida de fidelidad notablemente mayor (KLD 0,2277 frente a 0,0842 del de 4,27 bpw), lo que puede afectar a tareas que requieran precisión.
- La tabla n-gram depende de un SSD NVMe con baja latencia; en discos más lentos, el rendimiento puede degradarse significativamente.
- La licencia qwen-community-1.0 es una licencia comunitaria de Qwen; se deben revisar sus términos antes de un uso comercial.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) que permitan comparar el modelo con alternativas de forma objetiva.
- Los idiomas soportados no están documentados en la información disponible.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/npario/Qwen3.8-Flash-Next-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de QwenLM: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guía de Atomic Chat para ejecución local: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Dataset de calibración de AtomicChat: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Repositorio de Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Comunidad Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- GGUF de Unsloth del mismo modelo base: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
