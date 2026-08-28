# jlkivey/Qwen3.8-Flash-Next-MTP-PR27836-GGUF

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un componente auxiliar: el head MTP (Multi-Token Prediction, también llamado NextN) del modelo Qwen/Qwen3.8-Flash-Next, exportado a formato GGUF en la disposición de tensores que espera el pull request #27836 de llama.cpp (`--spec-type draft-mtp` para la arquitectura `qwen4exp`). El autor, jlkivey, incluye además un script Python (`graft-mtp-shard.py`) que injerta este head como una shard adicional en un GGUF dividido del modelo principal (por ejemplo, los cuantizados de Unsloth), que no incluyen el head de serie.

El problema que resuelve es la aceleración de la inferencia mediante decodificación especulativa: el head MTP predice varios tokens futuros que el modelo principal verifica en paralelo, reduciendo la latencia de generación, especialmente en código y salida estructurada. El modelo base Qwen3.8-Flash-Next es un MoE ultra-sparse de 125 000 millones de parámetros (6 000 millones activos por token) con una ventana de contexto de 262 144 tokens, basado en la arquitectura Qwen4. Este head, por sí solo, no genera texto; debe combinarse con el modelo base cuantizado y una build de llama.cpp que incluya el PR #27836.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Head MTP (NextN) para Qwen3.8-Flash-Next (MoE ultra-sparse, GDN + QSA) |
| Parametros totales | 3 878 549 248 (head, en bf16 original; exportado a Q8_0) |
| Parametros activos | No aplica (head denso, no es MoE) |
| Longitud de contexto | No aplica directamente; el modelo base soporta 262 144 tokens |
| Tipos de cuantizacion | Q8_0 (solo el head; el modelo base se cuantiza aparte) |
| Idiomas soportados | No disponibles (heredados del modelo base) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El head MTP se extrae del checkpoint oficial de Qwen3.8-Flash-Next mediante el script `convert_hf_to_gguf.py --remote --mtp` de la rama del PR #27836. Consta de 34 tensores: 32 correspondientes a un bloque adicional `blk.48.*`, más `token_embd` y `output` que el script de injerto descarta por duplicados. La capa MTP está fusionada en tensores `nextn.*` (por ejemplo, `nextn.eh_proj` fusiona `fc_embedding` y `fc_hidden`, y `nextn.hc_head_{norm,down,up}` implementa el mezclador de hiperconexión). El head tiene un único bloque MTP que atiende densamente, sin aplicar la atención sparse del tronco principal.

No hay entrenamiento adicional: los pesos se derivan directamente del modelo base, que fue entrenado por Qwen con una combinación de Gated DeltaNet (GDN) en tres de cada cuatro capas y Qwen Sparse Attention (QSA) en la cuarta, junto con una tabla de embeddings N-gram de 51 000 millones de parámetros. El modelo base se entrenó con aproximadamente 1/9 del coste de Qwen3.7-Plus, según el repositorio oficial.

## Capacidades

- Decodificación especulativa (drafting) para el modelo Qwen3.8-Flash-Next: predice hasta 3 tokens futuros que el modelo principal verifica en lote.
- Compatible exclusivamente con llama.cpp PR #27836 (`--spec-type draft-mtp`); no funciona con otras implementaciones de heads MTP para este modelo.
- Acelera la generación de código y salida estructurada entre un 30 % y un 40 % en las pruebas del autor (Apple M5 Max, Metal).
- En prosa, la velocidad es aproximadamente neutra respecto a decodificación greedy, debido a la caída de aceptación y al coste del LM head de 248 000 vocabulario.
- El script `graft-mtp-shard.py` permite añadir el head a un GGUF dividido existente sin modificar los shards originales (copia por escritura en APFS/btrfs/xfs).
- No es un modelo de generación independiente: requiere el modelo base cuantizado y una build específica de llama.cpp.

## Casos de uso

- Inferencia local acelerada en Apple Silicon: en un M5 Max con 128 GB y Metal, el head eleva la generación de código de 35.9 a 50.4 t/s (n-max 3), útil para desarrolladores que ejecutan el modelo en portátiles de gama alta.
- Servidores de inferencia con llama.cpp: integrar `--spec-type draft-mtp` en `llama-server` reduce la latencia de generación de código y JSON en entornos de producción con GPU NVIDIA o AMD, siempre que se compile la rama del PR.
- Generación de código en pipelines de CI/CD: la mayor velocidad de drafting permite validar o generar fragmentos de código en tiempo real dentro de herramientas de integración continua, sin sacrificar calidad (la equivalencia greedy se mantiene en la mayoría de casos).
- Asistentes de programación locales: combinar el head con un cuantizado IQ4_XS del modelo base ofrece una mejora perceptible en la velocidad de autocompletado y generación multi-línea en editores.
- Procesamiento de documentos largos: aunque el head no añade contexto, el modelo base soporta 262K tokens; la decodificación especulativa reduce el tiempo de resumen o extracción de información en documentos extensos.
- Investigación en decodificación especulativa: este repo sirve como referencia de implementación para heads MTP en MoE ultra-sparse, y permite reproducir las mediciones de aceptación y throughput documentadas.

## Benchmarks y rendimiento

El autor publica mediciones en Apple M5 Max (128 GB, Metal, Unsloth UD-IQ4_XS, contexto 128K, KV cache Q8_0, pesos mlocked) con generaciones de 1000 tokens y `reasoning_effort: low`:

| Configuracion | Prosa (t/s) | Codigo (t/s) | Aceptacion draft (prosa / codigo) |
|---|---|---|---|
| Decodificacion normal (build PR) | 38.5 | 35.9 | - |
| `draft-mtp`, n-max 2 | 37.0 | 47.5 | 61.5 % / 87.0 % |
| `draft-mtp`, n-max 3 | 36.2 | 50.4 | 57.4 % / 83.0 % |
| `draft-mtp,ngram-mod`, n-max 3 | 36.3 | 51.2 | 52.4 % / 83.0 % |

En pruebas de equivalencia greedy (temperatura 0, 600 tokens, 3 prompts de código), la salida fue idéntica a la decodificación normal en 1 de 3 prompts; en los otros dos, las divergencias ocurren solo en empates cercanos dentro del top-3 de la referencia (márgenes de 0.011 a 0.040 nats). El autor atribuye estas diferencias a la aritmética de verificación especulativa en un MoE de 512 expertos, no al head en sí.

## Requisitos de hardware

- El head en Q8_0 ocupa 4.1 GB en disco y añade aproximadamente 3.5 GiB de memoria residente durante la inferencia.
- Requiere el modelo base completo cuantizado (por ejemplo, Unsloth UD-IQ4_XS, que ocupa varios GB adicionales según la cuantización).
- Probado únicamente en Apple M5 Max con 128 GB unificados y Metal; no hay datos verificados en CUDA o ROCm.
- Para ejecutarlo se necesita compilar llama.cpp desde la rama `pr27836` (draft del PR), con `cmake` estándar.
- El script de injerto necesita Python con `gguf` y `numpy`, y un sistema de archivos que soporte copia por escritura (APFS, btrfs, xfs) para no duplicar los shards originales.
- La latencia y el throughput dependen del hardware y la cuantización del modelo base; en el M5 Max de las pruebas, se alcanzan 36-51 t/s según el tipo de contenido.

## Comparativa con modelos similares

Este head no tiene equivalente directo como producto independiente; se compara con otras implementaciones de heads MTP para el mismo modelo base:

| Implementacion | Compatibilidad | Formato | Estado |
|---|---|---|---|
| jlkivey/Qwen3.8-Flash-Next-MTP-PR27836-GGUF (este repo) | Solo llama.cpp PR #27836 | GGUF (Q8_0) + script de injerto | Probado en Metal |
| quimmedes/... (head MTP) | Parche distinto, incompatible | No especificado | No verificado |
| dzannotti/... (head MTP) | Parche distinto, incompatible | No especificado | No verificado |
| jockevaupptaget/... (head MTP) | Parche distinto, incompatible | No especificado | No verificado |

Frente a la decodificación greedy estándar del modelo base, este head ofrece una mejora de 30-40 % en código y salida estructurada, con coste de memoria adicional de 3.5 GiB. No hay datos públicos de otros heads MTP para comparar rendimiento.

## Limitaciones y advertencias

- El PR #27836 de llama.cpp es un borrador en el momento de la publicación; si su diseño de tensores cambia antes de fusionarse, el head debe re-exportarse con los comandos proporcionados.
- Solo se ha probado en Metal (Apple Silicon); no hay garantías de funcionamiento o rendimiento en CUDA, ROCm u otros backends.
- La decodificación especulativa en este MoE no es bit-idéntica a la decodificación greedy en ningún backend conocido; las divergencias son menores pero pueden afectar a aplicaciones que requieren reproducibilidad exacta.
- El head atiende densamente (sin atención sparse), lo que puede aumentar el coste computacional por paso de drafting en contextos muy largos.
- Licencia qwen-community-1.0: permite uso comercial, pero debe revisarse el texto completo de la licencia para obligaciones de atribución y redistribución.
- No es un modelo autónomo: sin el modelo base y la build específica de llama.cpp, los ficheros GGUF de este repo son inútiles.
- No se proporcionan datos de sesgos, alucinación o calidad de generación, ya que estos dependen del modelo base, no del head.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jlkivey/Qwen3.8-Flash-Next-MTP-PR27836-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- PR #27836 de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27836
- Cuantizados de Unsloth (modelo base sin head): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Documentación de Unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
