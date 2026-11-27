# kindlingai/Qwen3-VL-Embedding-8B-exlr8-k4

## Resumen

Qwen3-VL-Embedding-8B-exlr8-k4 es una cuantización de 4 bits del modelo de embeddings multimodales Qwen/Qwen3-VL-Embedding-8B, publicada por el usuario kindlingai bajo el esquema propietario exlr8-v2 (trellis K4). El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de 8.144 millones de parámetros que combina una pila de texto de 36 capas con una pila de visión de 27 bloques, y produce embeddings de texto e imagen normalizados con dimensiones Matryoshka de 64 a 4096.

El problema que resuelve esta variante es el coste de despliegue del modelo original: reduce el peso en disco de 16,29 GB (BF16) a 4,66 GB, con una tasa efectiva de 4,58 bits por peso, manteniendo una pérdida media de solo -0,0010 en una batería de 15 tareas de recuperación y una similitud coseno media de 0,9918 frente a la referencia BF16. Está pensada para servir embeddings multimodales en hardware con VRAM limitada, incluyendo GPUs de consumo y estaciones compactas como la DGX Spark.

La relevancia actual radica en que permite ejecutar un modelo de embeddings de 8B con capacidades de visión (inyección DeepStack, pooling del último token, MRL) en entornos donde el checkpoint BF16 no cabe, con un motor nativo (`gr8`) que reporta latencias p50 de 46,72 ms por ítem y arranques en frío de 2,28 s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (pila de texto de 36 capas + pila de visión de 27 bloques ViT con DeepStack) |
| Parametros totales | 8.144.793.840 (749 tensores) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | exlr8-v2 trellis K4 (4 bits), int4_g32 (4 matrices), FP8_ROW (54 matrices ViT MLP + embedding de vocabulario), BF16 copiado (RMSNorm, LayerNorm, sesgos, pos_embed, patch_embed) |
| Idiomas soportados | No disponible en la informacion proporcionada (la calibracion incluye prosa en ingles y 14 idiomas adicionales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (65 ficheros alineados a 64 KiB, con checksums XXH64 por bloque y SHA-256 por fichero) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con dos pilas: una de texto de 36 capas (`hidden_size=4096`, `intermediate_size=12288`, 32 cabezas de consulta y 8 de clave/valor, `head_dim=128`, QK-norm y M-RoPE 3D intercalado con factores `[24, 20, 20]`) y una de visión de 27 bloques (`hidden_size=1152`, `intermediate_size=4304`, 16 cabezas, `patch_size=16`, `merge_size=2`). La inyección DeepStack toma características de los bloques ViT 8, 16 y 24 y las introduce en las capas 0, 1 y 2 del LLM. El pooling es del último token no padding con normalización L2, y las dimensiones Matryoshka cubren de 64 a 4096. El preprocesado de imagen se acota entre 4096 y 1.310.720 píxeles (de 4 a 1280 tokens visuales fusionados de 32×32).

La cuantización exlr8-v2 se aplicó con calibración basada en Hessians reales (`H = Σ xᵀx` acumulados en FP64 con TF32 desactivado), recogidos mediante pasadas forward multimodales completas con DeepStack sobre 43 conjuntos de datos públicos: 10.237 filas y 4,47 millones de tokens, con prosa en inglés y 14 idiomas, 13 lenguajes de código, matemáticas y razonamiento, JSON/HTML estructurado, 1.100 imágenes de documentos, interfaces y escenas, y 1.000 pares imagen+texto de QA, gráficos y tablas. El 85 % de los datos llevaba instrucciones de tarea en formato ChatML y el 15 % era texto crudo sin prefijo. Se reservaron 660 filas de documentos completos (279.000 tokens) estrictamente disjuntas de la calibración. La ablación con Hessian identidad (`k4-id`) frente a la calibrada (`k4-cal`) muestra una mejora de 3,23× en el error Held-Out (gmean `5.203e-4` frente a `1.681e-3`), sin regresiones en las 314 matrices trellis evaluadas.

La mezcla por tensor es: 310 matrices en trellis K4 con codebook FP8 E4M3 redondeado dentro de la búsqueda de Viterbi y resuelto con LDLQ; 4 excepciones `int4_g32` elegidas automáticamente por menor error de Hessian (`text` capa 1 `mlp.gate_proj`, capa 2 `mlp.down_proj` y `mlp.gate_proj`, capa 3 `mlp.gate_proj`); 54 matrices `FP8_ROW` en las MLP del ViT (268M parámetros) para evitar artefactos de padding al no ser 4304 divisible por 128; 1 embedding de vocabulario `FP8_ROW` (`[151936, 4096]`, 8,0078 bpw, NMSE 7,007e-4); 1 tabla BF16 copiada (`pos_embed`); y 379 tensores BF16 no 2D copiados.

## Capacidades

- Generación de embeddings de texto con dimensiones Matryoshka truncables de 64 a 4096, útil para indexación y búsqueda con distintos presupuestos de almacenamiento.
- Generación de embeddings de imagen y de pares imagen+texto, con inyección de características visuales DeepStack en las primeras capas del LLM.
- Recuperación multimodal documento-imagen, incluyendo gráficos, tablas e interfaces, según los conjuntos de evaluación empleados (document retrieval, chart/table QA).
- Recuperación de texto multilingüe: la calibración cubre inglés y 14 idiomas adicionales, aunque la model card no detalla la lista completa.
- Recuperación de código: la calibración incluye 13 lenguajes de programación.
- Razonamiento y matemáticas como dominio de calibración, orientado a la calidad del embedding, no a la generación.
- Pooling del último token no padding con normalización L2, lo que facilita la integración en pipelines de similitud coseno estándar.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking: es un modelo de extracción de características, no un modelo generativo de instrucciones.

## Casos de uso

- Búsqueda semántica de documentación técnica: indexar manuales, RFCs y notas de versión con embeddings de 4096 dimensiones (o truncados a 1024/512 para ahorrar almacenamiento) y recuperar por similitud coseno; el modelo cabe en 4,66 GB de pesos, por lo que puede servirse junto a otros componentes en una sola máquina.
- Recuperación aumentada (RAG) multimodal: almacenar embeddings de páginas escaneadas, capturas de interfaz y diagramas junto a sus pies de foto, aprovechando la vía imagen+texto para consultas que mezclan lenguaje natural e imagen.
- Deduplicación y agrupación de catálogos de imágenes: calcular embeddings de imagen con la pila ViT y agrupar por vecindad coseno; la similitud media de 0,9832 en imagen frente a BF16 indica que la cuantización preserva la estructura de vecindad (91,1 % de solapamiento Top-10).
- Moderación y clasificación de contenido por similitud: comparar embeddings de textos entrantes con prototipos de políticas, usando dimensiones Matryoshka reducidas para latencia baja en línea.
- Búsqueda de código en repositorios: indexar fragmentos de código en 13 lenguajes y recuperar por intención en lenguaje natural; útil en asistentes de IDE que necesitan un recuperador local sin depender de API externa.
- Despliegue en el borde o en estaciones compactas: servir el modelo en una DGX Spark GB10 con 6,73 GiB de memoria nativa `gr8` (4,23 GiB de pesos + 2,13 GiB de workspace) y arranque en frío de 2,28 s, adecuado para prototipos y demos sin GPU de centro de datos.
- Evaluación de calidad de recuperación en pipelines de CI: ejecutar la batería de 15 tareas con el checkpoint cuantizado y comparar contra la referencia BF16 para detectar regresiones antes de desplegar cambios en el índice.

## Benchmarks y rendimiento

Resultados de la model card en 15 tareas (pooling del último token no padding, L2, `min_pixels=4096`, `max_pixels=1310720`). Se muestran las filas completas disponibles en la información proporcionada; el resto de la tabla quedó truncado en el material de referencia.

| Tarea | Categoria | Metrica | BF16 | k4-cal (publicado) | Delta k4-cal | Solapamiento Top-10 | k4-id (ablacion) | Delta k4-id |
|---|---|---|---:|---:|---:|---:|---:|---:|
| SciFact | Recuperacion de texto | nDCG@10 | 0,7882 | 0,7902 | +0,0020 | 93,2 % | 0,7835 | -0,0047 |

Metricas agregadas reportadas:

| Metrica | BF16 | exlr8 K4 | Delta / ratio |
|---|---:|---:|---:|
| Tamano de pesos en disco | 16,29 GB (15,17 GiB) | 4,66 GB (4,34 GiB) | 3,50× menor |
| Bitrate efectivo | 16,00 bpw | 4,58 bpw (4,46 de payload) | — |
| Media de 15 tareas | 0,0000 | -0,0010 | 91,6 % solapamiento Top-10 |
| Coseno en 660 filas retenidas (d4096) | 1,0000 | 0,9918 (0,9942 texto / 0,9832 imagen / 0,9828 imagen+texto) | 91,1 % solapamiento Top-10 |
| Memoria GPU nativa `gr8` (DGX Spark GB10) | 15,17 GiB solo pesos | 6,73 GiB (4,23 pesos + 2,13 workspace) | 3,58× menos pesos |
| Arranque en frío / caliente hasta `/health` | 176,1 s frío / 40,1 s caliente | 2,28 s frío / 2,07 s caliente | 17,6×–19,3× más rápido |
| Latencia p50 por ítem | 60,54 ms (2B BF16 vLLM) | 46,72 ms (31,77 ms consulta / 29,80 ms texto crudo) | 1,30×–1,77× más rápido |

Error Held-Out por grupo (gmean):

| Grupo | Matrices cuantizadas | Calibrado | Identidad | Mejora |
|---|---:|---:|---:|---:|
| text (36 capas) | 252 | 7,201e-4 | 2,659e-3 | 3,69× |
| vision (27 bloques) | 108 | 2,499e-4 | 5,745e-4 | 2,30× |
| global (merger + 3 DeepStack mergers) | 8 | 3,708e-4 | 1,786e-3 | 4,82× |
| Todas las lineales | 368 | 5,203e-4 | 1,681e-3 | 3,23× |

No se han publicado en la informacion disponible resultados de benchmarks estandar de LLM como MMLU, HumanEval o GSM8K, dado que el modelo es de extracción de características y no generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,66 GB de pesos en disco; en el motor nativo `gr8` sobre DGX Spark GB10 el consumo reportado es de 6,73 GiB (4,23 GiB de pesos + 2,13 GiB de workspace). Para otras configuraciones no se detalla el pico de memoria.
- GPU recomendadas: DGX Spark GB10 es la plataforma validada en la model card. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: con 4,66 GB de pesos, cabe en GPUs de consumo con al menos 8 GB de VRAM, siempre que el runtime soporte el formato exlr8-v2; la model card no confirma compatibilidad con CUDA consumer.
- Opciones de despliegue: el motor nativo `gr8` (usado en las mediciones). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato; la librería declarada es `exlr8`.
- Latencia y throughput: p50 de 46,72 ms por ítem en DGX Spark GB10 (31,77 ms para consulta y 29,80 ms para texto crudo). No se reporta throughput agregado ni latencia en otras GPUs.
- Arranque: 2,28 s en frío y 2,07 s en caliente hasta `/health` (1,36 s y 1,16 s del motor con verificación de checksums).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / tamano | Notas |
|---|---|---:|---|---|---|
| Qwen3-VL-Embedding-8B-exlr8-k4 (este) | 8.144 M | No disponible | Apache 2.0 | safetensors exlr8-v2, 4,66 GB | Cuantizado 4 bits con calibracion multimodal; perdida media -0,0010 en 15 tareas |
| Qwen/Qwen3-VL-Embedding-8B (BF16) | 8.144 M | No disponible | Apache 2.0 | safetensors BF16, 16,29 GB | Referencia de calidad; requiere ~15,17 GiB solo para pesos |
| Qwen3-VL-Embedding-2B BF16 (vLLM) | No disponible | No disponible | No disponible | BF16 | Usado como referencia de latencia en la model card: 60,54 ms p50, arranque caliente 40,1 s, 11,50 GiB |

No se dispone en la informacion proporcionada de comparaciones con otros modelos de embeddings multimodales (por ejemplo, CLIP o SigLIP) ni de sus especificaciones, por lo que la comparativa se limita a las variantes del propio modelo base citadas por el autor.

## Limitaciones y advertencias

- Es un modelo de extracción de características: no genera texto, no soporta tool calling ni razonamiento multi-paso; no debe emplearse como LLM conversacional.
- La cuantización introduce una pérdida medible: coseno medio de 0,9918 frente a BF16 y solapamiento Top-10 del 91,1 %; en tareas sensibles a vecindades finas puede degradar la recuperación.
- El formato exlr8-v2 es propietario de la librería `exlr8`; no hay evidencia en la información disponible de soporte en vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 27 de noviembre de 2026: no hay validación independiente de la comunidad.
- La model card no documenta sesgos conocidos, tasas de alucinación ni el listado completo de idiomas soportados; la calibración menciona 14 idiomas además del inglés, pero no los enumera.
- La longitud de contexto no se especifica en la información proporcionada, lo que impide planificar el tamaño de los documentos a indexar.
- Los resultados de latencia y memoria se midieron exclusivamente en una DGX Spark GB10 con el motor `gr8`; no son extrapolables a otras GPU sin validación.
- La licencia Apache 2.0 del modelo base se mantiene, pero conviene verificar las condiciones de uso del formato exlr8-v2 y de la herramienta de codificación antes de un despliegue comercial.
- La tabla de benchmarks de 15 tareas está truncada en la información disponible; solo se pudo verificar la fila de SciFact, por lo que las cifras agregadas no son auditables tarea por tarea con este material.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kindlingai/Qwen3-VL-Embedding-8B-exlr8-k4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-Embedding-8B
- Commit del checkpoint base: `2c4565515e0f265c6511776e7193b22c0968ddc7` (referenciado en la model card; no se proporciona URL directa)
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de código ni demos adicionales.
