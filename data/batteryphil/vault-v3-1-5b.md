# batteryphil/VAULT-v3-1.5B

## Resumen

VAULT v3 es un rework orientado a despliegue del modelo VAULT, construido sobre el backbone congelado de Qwen2.5-1.5B-Instruct. Lo desarrolla el autor independiente batteryphil y su objetivo central es la inferencia en CPU y en entornos x86_64 freestanding (sin libc ni heap), con un runtime en C99 que no depende de ningún framework. Sustituye la atención causal completa por atención de ventana deslizante por bloques y añade un mecanismo de memoria asociativa denominado Kenyon Vault, que almacena los tokens que salen de la ventana.

El modelo mantiene los 28 layers del backbone original (d=1536, 12 cabezas de query y 2 de KV, head_dim 128, SwiGLU 8960) pero congela sus pesos: solo se entrena el Vault, con 1.921.416 parámetros repartidos en 5 tensores por capa. Los pesos se distribuyen en un formato binario propio (VLT3) en BF16, Q8_0 y Q4_0, con cabecera de tamaño fijo y CRC32, y el tokenizer Qwen2.5 ChatML queda embebido como binario VTOK.

Su relevancia es acotada pero específica: demuestra que un transformer de 1.5B puede ejecutarse con un estado de inferencia de tamaño fijo (360,75 MB de arena estática) independientemente de la longitud de contexto, sin malloc, y con paridad numérica entre la implementación de referencia en PyTorch y el runtime en C. Para inputs de hasta 2.048 tokens el modelo calcula la misma función que Qwen2.5-1.5B-Instruct, por lo que las puntuaciones cortas no reflejan ganancias de la arquitectura VAULT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GQA estándar (RMSNorm, RoPE, SwiGLU) con block sliding-window attention y Kenyon Vault |
| Parametros totales | 1,54B (backbone congelado) + 1.921.416 parámetros entrenables del Vault |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana deslizante de W=1024 tokens por bloque, con 4 attention-sink tokens; posiciones RoPE re-basadas en cada frontera de bloque (distancias relativas acotadas a [0, 2W+4]) |
| Tipos de cuantizacion | BF16 (tensores del Vault en F32), Q8_0 (bloques de 32 pesos + escala fp16 = 34 B), Q4_0 (18 B por 32 pesos; embedding atado en Q8_0) |
| Idiomas soportados | en, fr |
| Licencia | vault-dual-agpl-3.0-or-commercial (AGPL-3.0 o comercial) |
| Formato de pesos | Binario propietario VLT3 (BF16, Q8_0, Q4_0); también `vault_params/vault_v3_stage_a_best.pt` en PyTorch para los tensores del Vault |

## Arquitectura y entrenamiento

El backbone Qwen2.5-1.5B-Instruct (28 layers, d=1536, 12 cabezas de query y 2 de KV, head_dim 128, SwiGLU 8960) se mantiene congelado. La atención causal completa se reemplaza por atención de ventana deslizante por bloques: cada bloque de W=1024 tokens ve el bloque anterior más el prefijo causal de su propio bloque, más 4 tokens de attention sink. Las posiciones RoPE se re-basan en cada frontera de bloque para que las distancias relativas permanezcan dentro de [0, 2W+4] de forma indefinida. Los tokens que salen de la ventana se escriben en el Kenyon Vault: por capa y cabeza KV, 49 celdas asociativas en tres bancos coprimos (13, 17, 19), direccionadas mediante una proyección aleatoria ternaria fija, actualizadas con la regla delta y leídas a través de una puerta por cabeza tanh(α) que arranca en 0. Solo se entrena el Vault (1.921.416 parámetros, 5 tensores por capa).

El entrenamiento (Stage A) consistió en 200 pasos de optimizador × 32.768 tokens (secuencias de 8.192 tokens, ~6,5M tokens en total), con el backbone congelado, destilación KL hacia el backbone de atención completa y entropía cruzada con tramos de recuperación de largo alcance sobrerrepresentados. Se ejecutó en una única Radeon RX 9060 XT de 16 GB. El empaquetado usa 479 tensores (3 globales + 17 por capa), cabecera C fija de 4.096 B, entradas de directorio de 128 B, alineación de 64 B y CRC32 en todo el fichero. El runtime en C99 se compila con `-ffreestanding -nostdlib`, sin símbolos externos, con AVX2/FMA opcionales, y usa mmap más arenas estáticas proporcionadas por el llamante.

## Capacidades

- Generación de texto conversacional en inglés y francés sobre el tokenizer ChatML de Qwen2.5 (151.665 tokens).
- Razonamiento y conocimiento general heredados del backbone Qwen2.5-1.5B-Instruct en inputs cortos (hasta 2.048 tokens, donde la función computada equivale a la del backbone).
- Recuperación de información de largo alcance mediante el Kenyon Vault, que retiene representaciones de tokens fuera de la ventana deslizante.
- Inferencia en CPU sin dependencias: runtime C99 freestanding con cero `malloc` y estado de tamaño fijo.
- Cuantización a 8 y 4 bits con formato binario verificado por CRC32.
- Paridad numérica entre la implementación de referencia en PyTorch (`src/vault_v3_model.py`) y el runtime en C, con rutas paralela y streaming.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Inferencia en entornos bare-metal o embebidos x86_64: el runtime freestanding sin libc ni heap permite desplegar generación de texto en sistemas donde no hay sistema operativo completo, usando arenas estáticas de 360,75 MB.
- Despliegue en CPU sin GPU: los ficheros Q8_0 (1.652,4 MB) y Q4_0 (997,3 MB) están pensados para ejecución exclusiva en CPU con AVX2/FMA, útil en servidores sin acelerador o en estaciones de trabajo modestas.
- Procesamiento de documentos largos con memoria acotada: la ventana deslizante más el Vault mantienen un estado de inferencia de tamaño constante a cualquier longitud de contexto, lo que evita el crecimiento de KV cache típico de la atención completa.
- Asistentes conversacionales en inglés y francés: el tokenizer ChatML de Qwen2.5 y el formato de chat con system prompt permiten integrar el modelo en interfaces de diálogo multi-turno.
- Validación y auditoría de artefactos de modelo: las herramientas `tools/` (lector/escritor VLT3, cuantizador, exportador) y los tests de rechazo de ficheros corruptos sirven para verificar integridad de pesos en pipelines de distribución.
- Investigación en mecanismos de memoria asociativa: el Vault entrenable de 1,9M parámetros sobre un backbone congelado es un banco de pruebas de bajo coste (6,5M tokens de entrenamiento) para estudiar recuperación de largo alcance.
- Referencia para portar transformers a C: la especificación `docs/VAULT_v3_SPEC.md` incluye tabla de tensores, layout byte-exacto de VLT3/VTOK y guía de portado bare-metal.

## Benchmarks y rendimiento

Los resultados de contexto corto (≤2.048 tokens) corresponden al backbone Qwen2.5-1.5B-Instruct bajo el harness del autor, ya que en ese rango la función computada es idéntica (hasta redondeo BF16). Harness: `benchmarks/bench_vault_traditional.py`, zero-shot, BF16, LAMBADA/HellaSwag/BoolQ limitados a 1.500 ítems.

| Tarea (métrica) | VAULT v2.5 180M | Mamba-1 130M | Mamba-2 130M | Mamba-3 MIMO 187M | SmolLM 135M | VAULT v3 1.54B |
|---|---:|---:|---:|---:|---:|---:|
| WikiText-2 word PPL ↓ | 313,75 | 37,10 | 36,04 | 45,55 | 36,60 | 16,49 |
| LAMBADA acc | 13,73 | 42,33 | 42,93 | 33,47 | 36,87 | 59,73 |
| ARC-Easy acc_norm | 45,37 | 42,26 | 42,38 | 57,87 | 57,41 | 76,60 |
| ARC-Challenge acc_norm | 23,72 | 24,74 | 23,81 | 29,44 | 28,92 | 47,10 |
| SciQ (with passage) acc_norm | 71,80 | 69,40 | 73,20 | 80,40 | 76,40 | 95,00 |
| SciQ (closed book) acc_norm | 50,70 | 45,70 | 46,70 | 63,10 | 64,70 | 84,30 |
| PIQA acc_norm | 58,22 | 63,60 | 63,71 | 67,74 | 68,44 | 76,12 |
| HellaSwag acc_norm | 37,13 | 41,73 | 43,07 | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

No se han publicado en la información disponible resultados de benchmarks de recuperación de largo alcance que aíslen la contribución del Kenyon Vault frente a la atención completa.

## Requisitos de hardware

- VRAM/espacio en disco de pesos: BF16 3.099,5 MB; Q8_0 1.652,4 MB; Q4_0 997,3 MB.
- Estado de inferencia: arena estática fija de 360,75 MB a cualquier longitud de contexto, sin `malloc`.
- Inferencia exclusivamente en CPU según la model card; no se documenta soporte GPU.
- CPU con AVX2/FMA opcional para acelerar los kernels del runtime C99.
- Entrenamiento de referencia: una Radeon RX 9060 XT de 16 GB para el Stage A (solo Vault entrenable).
- Despliegue: runtime propio `runtime/vault3_host` (CLI POSIX con `--chat`, `--threads`, `--bench-prefill`, `--bench`, `--verify`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada (los resultados crudos están en `benchmarks/*.json`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| VAULT v3 1.5B | 1,54B (1,9M entrenables) | Ventana W=1024 + Vault | AGPL-3.0 o comercial | VLT3 BF16/Q8_0/Q4_0, runtime C99 | CPU-only, freestanding, estado fijo |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (modelo base) | Apache 2.0 (modelo base) | Safetensors, ecosistema estándar | Backbone de VAULT v3; atención completa |
| Mamba-2 130M | 130M | Estado recurrente | no disponible en la información proporcionada | no disponible | Alternativa SSM de menor tamaño |
| SmolLM 135M | 135M | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible | Alternativa transformer pequeña |

La comparación directa con Qwen2.5-1.5B-Instruct es la más relevante: VAULT v3 conserva su comportamiento en contextos de hasta 2.048 tokens y añade memoria asociativa y un runtime portable, pero cambia la licencia a AGPL-3.0/comercial y restringe el despliegue al runtime propio.

## Limitaciones y advertencias

- Las puntuaciones de benchmarks cortos no son ganancias de la arquitectura VAULT: en inputs de hasta 2.048 tokens el modelo equivale a Qwen2.5-1.5B-Instruct.
- El Vault solo se entrenó 200 pasos (~6,5M tokens); su calidad en recuperación de largo alcance no está cuantificada en los datos disponibles.
- Idiomas limitados a inglés y francés; no se documenta soporte de español.
- Licencia dual AGPL-3.0 o comercial: el uso comercial bajo AGPL-3.0 impone obligaciones de copyleft sobre el software que lo integre; se requiere licencia comercial para otros términos.
- Formato de pesos propietario VLT3 y runtime propio: no hay integración con ecosistemas estándar (llama.cpp, vLLM, TGI), lo que limita la portabilidad fuera del runtime del autor.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- Riesgo de alucinación inherente al backbone de 1,5B, no mitigado específicamente en el rework.
- Sesgos del backbone Qwen2.5-1.5B-Instruct heredados sin evaluación adicional en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y validación externa inexistentes.
- La fecha de creación del repositorio (2026-11-06) y el estado de publicación deben verificarse antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/batteryphil/VAULT-v3-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Especificación técnica: `docs/VAULT_v3_SPEC.md` (incluido en el repositorio)
- Runtime: `runtime/vault3.h`, `runtime/vault3.c`, `runtime/vault3_host.c`, `Makefile` (incluidos en el repositorio)
- Referencia PyTorch: `src/vault_v3_model.py` (incluido en el repositorio)
- Benchmarks: `benchmarks/` (JSON crudos y scripts, incluidos en el repositorio)
- No se han encontrado papers, blogs ni demos externos en la información disponible.
