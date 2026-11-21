# bpx03/Qwen3.8-Flash-Next-QEngine

## Resumen

Qwen3.8-Flash-Next-QEngine es una conversión de pesos del modelo Qwen3.8-Flash-Next, publicada por el usuario bpx03, empaquetada en el formato propietario del motor de inferencia QEngine. No se trata de un modelo nuevo, sino de una redistribución de la cuantización INT4 AutoRound de Intel (Intel/Qwen3.8-Flash-Next-W4A16-AutoRound) reagrupada por capas para que QEngine la cargue directamente sin paso de conversión. El modelo suma 75.054.203.539 parámetros reales según los safetensors del repositorio, que ocupa 195,2 GB.

El interés de esta ficha no está en la arquitectura del modelo base, sino en la combinación de empaquetado y motor: QEngine es un motor de inferencia open source (MIT) diseñado específicamente para funcionar sobre 3× NVIDIA RTX 3090 de 24 GB, con soporte de decodificación especulativa mediante cabezal de predicción multi-token, tabla de embeddings n-gram en INT8 y caché KV opcional en RAM del host. La model card menciona además un modo de contexto opcional de hasta 1M tokens y soporte de entrada de imagen con `--vision 1`.

Es relevante ahora porque demuestra una vía práctica de servir un modelo de 75B parámetros en hardware de consumo (3 tarjetas de 24 GB) combinando cuantización mixta W4A16, offload de la tabla n-gram a RAM del host y paralelismo tensorial sin P2P. La licencia de los pesos es Qwen Community License 1.0, no una licencia permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), atención QSA y proyecciones DeltaNet; incluye cabezal de predicción multi-token (MTP) |
| Parámetros totales | 75.054.203.539 |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 1M tokens (opcional en QEngine 1.3.4, opt-in); valor nativo del modelo base no disponible |
| Tipos de cuantización | W4A16 mixta: INT4 (expertos enrutados, experto compartido, proyecciones DeltaNet y n-gram), INT8 (atención QSA q/k/v/o y lm_head, convertidos al cargar), BF16 (hyper-connections, router, embeddings, indexer, gates, norms); tabla n-gram en INT8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (base.safetensors, layer-00 … layer-47, mtp.safetensors, mtp-int4.safetensors, ngram_int8.safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos que combina atención QSA y proyecciones DeltaNet, según la estructura de tensores descrita en la model card (in_proj_qkv, in_proj_z, in_proj_out, n-gram key/value projections). Incluye hyper-connections, un router de expertos y un indexer. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original Qwen/Qwen3.8-Flash-Next y no se reproducen aquí.

La innovación técnica de esta publicación es el empaquetado para QEngine: los pesos se reagrupan por capa (48 capas, layer-00 a layer-47) y se aplica precisión mixta. Los expertos enrutados se copian bit-exact desde el checkpoint AutoRound de Intel en INT4; el experto compartido, las proyecciones DeltaNet y las proyecciones n-gram se cuantizan a INT4 con RTN y grupo 128; la atención QSA y el lm_head se guardan en BF16 y se convierten a INT8 al cargar. Se incluye un cabezal MTP para decodificación especulativa y una tabla de embeddings n-gram en INT8 que ocupa 51,8 GB frente a 102,4 GB en BF16; según el autor, la divergencia KL de siguiente token respecto a la tabla BF16 queda por debajo del ruido entre ejecuciones del propio motor.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento (thinking) activable; el motor permite fijar un presupuesto duro de tokens de razonamiento.
- Procesamiento de entrada de imagen mediante el flag `--vision 1` de QEngine 1.3.4.
- Decodificación especulativa mediante cabezal MTP integrado.
- Soporte de prompts de sistema fijados (pinned) orientado a agentes.
- Conversaciones multi-turno con caché KV opcional en RAM del host y archivo de conversación de 48 GB.
- Contexto extendido opcional de hasta 1M tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 75B en un servidor de 3× RTX 3090: QEngine está diseñado para ese hardware exacto, con paralelismo tensorial sin P2P y reparto automático de memoria, lo que permite servir el modelo sin clúster de datacenter.
- Asistentes de agente con prompts de sistema persistentes: la función de prompts fijados en memoria evita recargar instrucciones largas en cada petición y reduce la latencia de arranque en flujos de agente multi-paso.
- Análisis de documentos extensos: con el contexto opcional de hasta 1M tokens y la caché KV en RAM del host, se pueden procesar expedientes o bases de código completas en una sola sesión.
- Atención al cliente multi-turno: el archivo de conversación de 48 GB permite mantener historial de sesiones sin reenviar todo el contexto al modelo en cada turno.
- Prototipado e investigación en cuantización: el repositorio sirve como referencia de una receta W4A16 mixta con AutoRound, RTN grupo 128 y conversión selectiva a INT8, útil para reproducir o comparar estrategias de compresión.
- Evaluación de decodificación especulativa: el cabezal MTP incluido permite medir el impacto del draft model en throughput sobre hardware de consumo.
- Servicio en hosts con poca RAM: el modo page-cache (`FLASH_NGRAM_PIN=0`) permite ejecutar con 12 GB de RAM a costa de aproximadamente el doble de latencia en peticiones cortas (127 frente a 262 tok/s).

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Solo aporta métricas internas del motor sobre el conjunto "club-3090 8-pack" (150 escenarios, 3 ejecuciones en 3× RTX 3090):

| Métrica | QEngine 1.3.1 | QEngine 1.3.4 |
|---|---|---|
| Puntuación media, thinking off | 110 | 114,7 |
| Puntuación media, thinking on | 126 | 128,7 |

Datos de rendimiento del motor:

| Escenario | Valor |
|---|---|
| Prefill de 90K tokens, 3 tarjetas, sin P2P | 17,0 s |
| Prefill de 90K tokens, 3 tarjetas, con P2P | 13,1 s |
| Decode con y sin P2P | diferencia dentro del 4 % |
| Throughput, tabla n-gram fijada en RAM | 262 tok/s |
| Throughput, modo page-cache con 12 GB de RAM | 127 tok/s (peticiones cortas) |
| Throughput, tabla en page cache | 250 tok/s |
| Tiempo hasta primer token, modo fijado | 0,22 s |
| Tiempo hasta primer token, modo page-cache | 1,7 s (mediana) |

No se han publicado resultados de benchmarks estándar del modelo en la información disponible.

## Requisitos de hardware

- GPU: 3× NVIDIA RTX 3090 de 24 GB, o 2 de ellas. El P2P entre GPU ayuda pero no es obligatorio; sin P2P las transferencias usan memoria del host fijada por DMA.
- RAM del host: unos 140 GB con 3 tarjetas o 160 GB con 2 para usar los valores por defecto completos (tabla n-gram INT8 de ~52 GB fijada, archivo de conversación de 48 GB, 8 GB de prompts de sistema fijados). Desde QEngine 1.3.4, hosts desde 64 GB reciben un plan dimensionado al arranque sin swap.
- Hosts con poca RAM: modo page-cache con `FLASH_NGRAM_PIN=0`, seleccionado automáticamente cuando la tabla no cabe fijada; la tabla permanece en disco y se lee por page cache. Medido con el servidor limitado a 12 GB de RAM sobre NVMe.
- Disco: unos 120 GB.
- Opciones de despliegue: exclusivamente QEngine 1.3 o superior (se recomienda 1.3.4). Los archivos no funcionan con otros motores como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ver la tabla de la sección anterior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor compatible |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-QEngine (esta ficha) | 75,05B | hasta 1M (opt-in en QEngine) | W4A16 mixta + INT8 | Qwen Community License 1.0 | solo QEngine |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | no disponible | no disponible | W4A16 AutoRound | no disponible | motores compatibles con safetensors estándar |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | BF16 original | Qwen Community License 1.0 | vLLM, TGI y otros |

Los datos de parámetros, contexto y licencia de las dos alternativas no se detallan en la información proporcionada; solo se conoce su relación como modelo origen y cuantización intermedia. No se dispone de comparativas de rendimiento frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Los archivos solo funcionan con QEngine; no son portables a vLLM, llama.cpp, Ollama ni TGI, lo que limita la integración en pilas existentes.
- El hardware objetivo es muy concreto (2-3× RTX 3090); no se documenta soporte para otras GPU.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE incluido antes de desplegar en producción.
- El modelo es una cuantización INT4/INT8: cabe esperar degradación respecto al BF16 original, aunque no se publican métricas de esa pérdida.
- El modo page-cache duplica la latencia en peticiones cortas y eleva el tiempo hasta primer token de 0,22 s a 1,7 s.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La model card menciona un fallo corregido en 1.3.3.1 por el que una respuesta podía recoger texto de otra conversación simultánea; usar versiones anteriores a esa revisión conlleva riesgo de fuga de contexto entre sesiones.
- El contexto de 1M tokens es una opción del motor, no una especificación verificada del modelo base.
- El repositorio tiene 940 descargas y 6 likes en el momento de la consulta, con un único mantenedor; el soporte comunitario es limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bpx03/Qwen3.8-Flash-Next-QEngine
- Modelo base de la cuantización: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor QEngine: https://github.com/bpx03/QEngine
