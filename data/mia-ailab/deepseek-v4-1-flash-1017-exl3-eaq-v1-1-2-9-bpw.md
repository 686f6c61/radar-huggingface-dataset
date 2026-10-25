# Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1.1-2.9-bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1.1-2.9-bpw es un pack cuantizado en formato EXL3 del modelo multimodal `deepseek-ai/DeepSeek-V4.1-Flash-1017` (revisión `1bae0e10`), publicado por Mia-AiLab. No es un modelo nuevo: es un derivado de 105.325.358.290 parámetros totales (~105,3 mil millones, según los safetensors) que comprime el cuerpo del modelo base a 2,90 bits por peso de media, manteniendo la torre de visión incluida y la arquitectura de mezcla de expertos con atención dispersa del original.

El interés técnico del pack está en su tratamiento del indexer de la atención dispersa, la ruta que decide qué tokens previos puede leer cada cabeza. La versión 1 de EAQ cuantizaba esa ruta a 5 y 8 bits; la v1.1 la almacena a precisión de origen (BF16) en las ocho capas del indexer (2, 8, 14, 20, 24, 28, 32 y 36) y en las capas de compresión que lo alimentan. Según las mediciones del autor, eso hace que el indexer seleccione exactamente el mismo conjunto de tokens que el modelo original (403.560 de 403.560 filas a partir de 16k tokens), frente al 94,95 % de coincidencia de la v1.

El autor marca explícitamente este checkpoint como experimental y recomienda seguir usando EAQ v1. Además, no es una sustitución directa del original: las tablas de embedding Engram no están en el repositorio y hay que tomarlas de los shards 47 y 48 del modelo base, de unos 95 GiB cada uno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y atención dispersa con indexer; la model card menciona expertos enrutados y compartidos, capas de compresión, bloques MTP/DSpark y tablas de embedding Engram, sin más detalle |
| Parámetros totales | 105.325.358.290 (~105,3 B), dato real de safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card solo describe pruebas a partir de 16k tokens y ausencia de comparaciones más allá de 32k) |
| Tipos de cuantización | EXL3 (`trellis`/`suh`/`svh`/`mul1`), codebook `mul1`, `out_scales=always`; media de 2,90 bpw sobre el cuerpo cuantizado; cabeza a 6 bits; MTP/DSpark a 4 bits; expertos enrutados a 3 bits (capas 18-22 a 2 bits); 35 tensores de la ruta del indexer y compresores en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base; la cuantización no la cambia) |
| Formato de pesos | safetensors en pack EXL3, 39 shards; 27 módulos se almacenan como lineales BF16 planos dentro del pack |
| Tamaño de tensores | 210.735.685.708 bytes (~196,3 GiB) |
| Número de tensores | 192.414, de los cuales 47.873 son tensores `trellis` |
| Visión | incluida; torre de visión a precisión nativa |
| Tablas Engram | no incluidas; requieren los shards 47 y 48 del modelo base (~95 GiB cada uno) |
| Motor requerido | exllamav3 con soporte de lineales float dentro de un pack EXL3 |
| Modelo base | `deepseek-ai/DeepSeek-V4.1-Flash-1017` @ `1bae0e1088993b9b82de08f59de5be5a34e42170` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atención dispersa: un indexer selecciona, para cada cabeza de atención, qué tokens anteriores puede leer, y unas capas de compresión alimentan esa ruta. A ello se suman expertos compartidos y enrutados, bloques MTP/DSpark y tablas de embedding Engram. La model card del pack no aporta datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni detalles adicionales de la arquitectura; esa información correspondería al modelo original y no está incluida en la documentación proporcionada.

El aporte de este checkpoint es puramente de cuantización. EAQ v1.1 mantiene las mismas anchuras de bits que EAQ v1 en todo el cuerpo (2,90 bpw, expertos enrutados a 3 bits, capas 18-22 a 2 bits, cabeza a 6 bits, MTP/DSpark a 4 bits) y cambia solo 35 tensores, 27 de los cuales estaban cuantizados en v1: `attn.wq_a` en las 8 capas del indexer, `attn.indexer.wq_b` (8 capas), `attn.indexer.wk` (capas 2, 8, 14 y 20), `attn.compressor.wkv` (capas 2, 8, 14 y 20) y `attn.compressor.wgate` (capas 2, 8 y 14) pasan a BF16 con los valores exactos de origen. Los 8 tensores `attn.indexer.weights_proj` ya eran BF16 y no cambian.

Las comprobaciones publicadas sobre el pack final incluyen la integridad del índice (192.414 claves en el índice y en las cabeceras de los 39 shards), la igualdad del conjunto de claves con v1 salvo los 27 módulos sustituidos por un único `.weight`, cero discrepancias de dtype y forma frente a v1, y la verificación de que los 35 tensores exactos coinciden con el origen: 19 idénticos byte a byte y 16 iguales a la dequantización FP32 independiente de las fuentes FP8 + E8M0.

## Capacidades

- Generación de texto condicionada por imagen: el pipeline declarado es `image-text-to-text` y la torre de visión se conserva a precisión nativa en el pack.
- Procesamiento de contexto largo mediante atención dispersa con indexer, que reduce el coste de atención seleccionando un subconjunto de tokens previos por cabeza.
- Ruta del indexer preservada a precisión de origen: en las filas medidas (a partir de 16k tokens) selecciona el mismo conjunto de tokens que el modelo original.
- Predicción multitoken: el modelo base incorpora bloques MTP/DSpark, cuantizados a 4 bits en este pack; la model card no detalla su uso en inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se publica lista de idiomas).
- Modo thinking, audio u otras modalidades: no disponibles; la única modalidad documentada además del texto es la de imagen de entrada.

## Casos de uso

- Investigación en cuantización extrema de MoE: sirve para estudiar cómo afecta un cuerpo a 2,90 bpw (con capas de expertos a 2 bits) a la calidad de un modelo de 105 B, comparando directamente contra EAQ v1 sobre los mismos tensores.
- Auditoría de rutas críticas en atención dispersa: al conservar el indexer en BF16, permite aislar el efecto de la cuantización del resto del modelo frente al efecto de cuantizar la selección de tokens, con una métrica de acuerdo de selección ya definida por el autor.
- Reproducción de las comprobaciones del pack: verificación de claves, dtypes, formas y bytes contra el índice y contra v1, útil en pipelines de control de calidad de cuantizaciones publicadas por terceros.
- Despliegue multimodal de bajo bpw en clústeres con memoria abundante: para servir prototipos image-text-to-text cuando se necesita el modelo completo pero se quiere reducir el espacio de pesos frente al checkpoint original en FP8/FP4.
- Experimentos de contexto largo en laboratorio: la arquitectura de atención dispersa y las pruebas a partir de 16k tokens lo hacen adecuado para reproducir experimentos de recuperación en ventanas largas, asumiendo que el autor no validó el recall en los 315 haystacks congelados.
- Docencia y formación técnica: caso práctico de cuantización con mezcla de precisión dentro de un mismo pack (tensores trellis, lineales BF16 y tensores BF16 planos conviviendo en 39 shards).
- Base para derivados: al ser MIT, se puede partir de este pack para generar otras cuantizaciones o adaptadores, siempre que se añadan las tablas Engram del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye verificaciones de integridad y de fidelidad del indexer, que se recogen a continuación como datos medidos, no como benchmarks de calidad:

| Comprobación | Resultado |
|---|---|
| Acuerdo de selección del indexer frente al original (≥16k tokens) | 403.560 / 403.560 filas; EAQ v1: 94,95 % |
| Recall@512 sobre el hidden state generado por cada pack | ~0,73 en ambos packs |
| Claves del índice frente a cabeceras de shard | 192.414 = 192.414 en 39 shards |
| Conjunto de claves frente a v1 | idéntico salvo los 27 módulos sustituidos por un único `.weight` |
| Dtype y forma frente a v1 | 0 discrepancias; exactamente 35 tensores cambiados, todos BF16 |
| Anchuras de bits | 47.873 tensores `trellis`, coincidentes con las anchuras previstas |
| Tensores exactos | 35/35 iguales al origen: 19 byte a byte y 16 iguales a la dequantización FP32 de las fuentes FP8 + E8M0 |
| Tamaño | bytes de tensores = `total_size` del índice = total de v1 + 154.982.292 bytes |
| Configuración | `config.json` idéntico a v1; `quantization_config.json` difiere solo en los 35 módulos esperados |
| Acuerdo de selección más allá de 32k | no medido |

## Requisitos de hardware

- Tamaño del pack: 210.735.685.708 bytes (~196,3 GiB) en 39 shards, más los shards 47 y 48 del modelo base (~95 GiB cada uno). Estimación derivada: en torno a 386 GiB (~415 GB) de pesos en disco si se quieren cargar todas las piezas.
- VRAM estimada: no hay medición publicada. Como referencia aritmética, la carga de pesos completa ronda esos ~386 GiB, a lo que habría que sumar la caché KV, cuyo tamaño no se documenta.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el despliegue exige agregados multi-GPU de clase centro de datos (por ejemplo, 8× H100 80 GB o 8× A100 80 GB, que suman 640 GB, o 4× H200 141 GB). Es una estimación por capacidad, no una configuración validada.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) ni de 32 GB.
- Opciones de despliegue: `exllamav3`, que es la librería declarada; el motor debe poder cargar lineales float dentro de un pack EXL3. TensorFold con un loader de packs mixtos imprime `mixed pack: 27 float linears` para este checkpoint. Las builds stock de exllamav3 que esperan todos los lineales cuantizados no han sido probadas.
- Otros motores: no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para este formato; la información disponible no los menciona.
- Latencia y throughput: no medidos; la model card incluye la velocidad en la lista de elementos no probados.

## Comparativa con modelos similares

No se han proporcionado datos de otros modelos comparables de la misma categoría. La comparación posible es con el modelo base y con el pack EAQ v1 del mismo autor:

| Modelo | Bits del cuerpo | Ruta del indexer | Tamaño de tensores | Tablas Engram | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base, FP8/FP4) | checkpoint original sin cuantizar en EXL3 | precisión de origen | no disponible | incluidas | MIT |
| EAQ v1 (2.9 bpw) | 2,90 bpw | 5 bits en `wq_a`, `wq_b`, `wkv`, `wgate`; 8 bits en `wk` | 210.580.703.416 bytes (~196,1 GiB) | no incluidas (conjunto de claves idéntico al de v1.1) | MIT |
| EAQ v1.1 (2.9 bpw), este pack | 2,90 bpw | BF16 exacto en 35 tensores | 210.735.685.708 bytes (~196,3 GiB) | no incluidas | MIT |

## Limitaciones y advertencias

- Carácter experimental: el propio autor indica que es un experimento y que el pack recomendado sigue siendo EAQ v1.
- No es una sustitución directa del checkpoint original: faltan las tablas de embedding Engram y hay que aportar los shards 47 y 48 del modelo base, de unos 95 GiB cada uno.
- Requisito de motor no trivial: contiene 27 lineales float dentro de un pack EXL3; las builds stock de exllamav3 no están probadas y la carga solo se ha verificado en un motor.
- Cuantización agresiva: 2,90 bpw de media, con expertos enrutados a 3 bits y las capas 18-22 a 2 bits. Es esperable degradación de calidad, pero no se ha medido.
- Pruebas pendientes declaradas por el autor: recall en los 315 haystacks congelados de contexto largo, conjunto nuevo de prompts frágiles y puerta NLL de tokens de respuesta.
- Cobertura del indexer limitada: el acuerdo de selección solo se comprobó a partir de 16k tokens y no se comparó más allá de 32k.
- Calidad de generación y velocidad no evaluadas; las comprobaciones publicadas son de integridad y de fidelidad de un subconjunto de tensores, no de comportamiento del modelo.
- Idiomas no documentados: no se publica lista de idiomas soportados ni evaluaciones por idioma.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación para el modelo base ni para este pack.
- Licencia: MIT, permite uso comercial y obras derivadas; el pack no altera los términos del modelo base, pero la licencia no exime de validar sesgos, procedencia de datos y cumplimiento normativo en producción.
- Confusión de nombre: el autor figura como Mia-AiLab; no se ha encontrado información adicional sobre él en la búsqueda web realizada.

## Enlaces

- Pack en HuggingFace: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1.1-2.9-bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Revisión del modelo base usada: `1bae0e1088993b9b82de08f59de5be5a34e42170`
- Repositorio de exllamav3 (formato y kernels): https://github.com/turboderp-org/exllamav3
- Búsqueda web: no se han encontrado enlaces relevantes sobre el modelo ni sobre el autor; los resultados devueltos corresponden a entidades homónimas sin relación (Maiia, la rapera M.I.A., artículos sobre el nombre propio).
