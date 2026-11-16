# aidendle94/Inkling-2-Small-DGX-Spark

## Resumen

Inkling-2-Small es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Thinking Machines, con 594.000 millones de parámetros totales y 17.000 millones activos por token. Se distribuye en formato NVFP4 con un peso de 394 GB y una ventana de contexto por defecto de 262.144 tokens, ampliable a 524.288. El repositorio aquí descrito, `aidendle94/Inkling-2-Small-DGX-Spark`, no contiene pesos: es una receta de despliegue experimental que sirve el checkpoint oficial mediante SGLang sobre un clúster de cuatro nodos NVIDIA DGX Spark (GB10, 128 GB cada uno) interconectados por RoCE.

La aportación del repositorio es un conjunto de hooks en Python (licencia MIT) que se montan sobre la imagen sin modificar `lmsysorg/sglang:dev-inkling-2-small`, junto con un lanzador y un watchdog para los cuatro nodos. Estos parches abordan problemas concretos de la plataforma GB10: el kernel de decodificación de la imagen lee slots de caché de otras peticiones cuando comparten batch, los kernels NVFP4 son exclusivos de SM100 y el draft de decodificación especulativa (DSpark) se almacena en BF16 por defecto.

El resultado es un variante de serving con decodificación especulativa reworkada: cuantización int8 de los pesos densos del draft, gating de las filas que el target verifica, caché KV del draft en FP8 y una colocación distinta de los expertos entre nodos. Según las mediciones del autor (13-16 de noviembre de 2026), se alcanzan 59-61 tok/s en un solo stream en modo greedy y 130-143 tok/s con ocho streams concurrentes. El estado se declara explícitamente como experimental, con cuatro días de serving sobre una única flota y problemas abiertos documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, con decodificación especulativa DSpark (draft interno `mtp.safetensors`) |
| Parametros totales | 594.000 millones |
| Parametros activos | 17.000 millones por token |
| Longitud de contexto | 262.144 tokens por defecto; 524.288 con la configuración extendida |
| Tipos de cuantizacion | NVFP4 (checkpoint oficial); FP8 e4m3 para caché KV del target; int8 para pesos densos del draft; atención del target empaquetada en 12 bits |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | No incluidos en este repositorio; el checkpoint oficial se sirve tal cual (NVFP4, 394 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 594.000 millones de parámetros totales y 17.000 millones activos por token, distribuido por Thinking Machines en formato NVFP4. Incluye un modelo draft interno (`mtp.safetensors`) para decodificación especulativa: propone hasta 7 tokens que el modelo target verifica en un único forward. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO.

La innovación técnica de este repositorio no está en el modelo sino en la ruta de serving. Se aplican varios parches sobre SGLang: `paged_decode.py` corrige la lectura de slots de caché ajenos en GB10 cuando dos peticiones comparten batch; `fi_moe.py` redirige las 40 capas de expertos NVFP4 al grouped GEMM SM120 de FlashInfer (los kernels de la imagen son solo SM100), elevando el prefill de unos 440 a unos 2.000 tok/s; `roce_collectives.py` implementa los all-reduce sobre RoCE entre las cuatro máquinas; `fp8_kv.py` habilita caché KV FP8 para el target con lector SM12x (1,9x el pool a la misma velocidad); `dense_p12.py` empaqueta los pesos de atención del target en 12 bits sin redondeo (−4,5 % de tiempo por step en un stream); y `tp_shard.py` reparte los 384 expertos a un cuarto de su anchura en cada nodo en lugar de 96 completos (−18 % de tiempo por step, con redondeo pero NLL medio sin cambios). Para el draft, se aplican copias int8 de sus pesos densos (+5 % de decodificación), gating de filas confiadas con `GATE=0.4` (+15 %) y caché KV FP8 e4m3 con lector propio (`SPARK_DRAFT_KV_FP8=1`), que permite 793.000 tokens de pool frente a 716.000 y mantiene 60 tok/s tras 500K tokens de contexto.

## Capacidades

- Generación de texto y razonamiento en inglés, con modo de razonamiento explícito (el parche `reasoning_cache.py` reinserta el razonamiento de una respuesta en turnos de historial que el cliente envía sin él).
- Tool calling / function calling: 250 aciertos sobre 283 casos en cinco formatos de cable y dos ensayos (20 blandos, 13 fallos, de los cuales 10 corresponden a `tool_choice: none`, que no funciona).
- Decodificación especulativa con draft interno de hasta 7 tokens por step.
- Contexto largo: 262.144 tokens por defecto y 524.288 configurable, con decodificación a 68 tok/s tras 130K tokens y 60 tok/s tras 500K.
- Serving multi-stream: 4 y 8 peticiones concurrentes con throughput agregado de 95-106 y 130-143 tok/s respectivamente.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistente de código en producción: con 59-61 tok/s en un stream y tool calling funcional en cinco formatos de cable, el modelo puede integrarse en pipelines de revisión y generación de código donde la latencia por token es crítica.
- Análisis de repositorios completos: la ventana de 524.288 tokens permite cargar bases de código extensas o documentación técnica completa en una sola petición, con decodificación sostenida de 60 tok/s tras 500K tokens de contexto.
- Atención al cliente multi-turno: el parche `reasoning_cache.py` mantiene la coherencia del razonamiento entre turnos aunque el cliente no reenvíe el historial de pensamiento, lo que simplifica la integración con frontends existentes.
- Serving batch en laboratorio: con 130-143 tok/s agregados en ocho streams sobre cuatro DGX Spark, es viable para evaluación masiva de prompts o generación de datasets sintéticos en un clúster de laboratorio.
- Agentes multi-step con herramientas: el soporte de tool calling y la ventana larga permiten cadenas de razonamiento con múltiples llamadas a APIs externas dentro de un mismo contexto.
- Despliegue en hardware de borde empresarial: cuatro nodos GB10 de 128 GB ofrecen una alternativa de menor consumo frente a GPUs de centro de datos para servir un MoE de 594B en NVFP4.
- Prefill de prompts largos: con 2.400-2.500 tok/s en prompts de ~15K tokens, es adecuado para tareas de resumen y extracción sobre documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los datos medidos por el autor son de rendimiento de serving, sobre cuatro DGX Spark en una única flota entre el 13 y el 16 de noviembre de 2026:

| Metrica | Valor medido |
|---|---|
| Decodificacion, 1 stream, greedy, preguntas de codigo de 400 tokens | 59-61 tok/s (37 con el step de decodificacion de la imagen original) |
| Decodificacion, 1 stream, temperatura 0.7 | 56,6 tok/s |
| Decodificacion, 4 streams concurrentes, greedy | 95-106 tok/s agregados |
| Decodificacion, 8 streams concurrentes, greedy | 130-143 tok/s agregados |
| Prefill, prompts de ~15K tokens | 2.400-2.500 tok/s |
| Prefill en frio de 130K / 260K / 500K tokens | 61 / 142 / 348 s |
| Decodificacion tras 130K / 500K tokens de contexto | 68 / 60 tok/s |
| Pool KV | 793.000 tokens con la configuracion extendida; 493K-805K por defecto segun el arranque |
| Tool calls (283 casos, 5 formatos, 2 ensayos) | 250 correctos, 20 blandos, 13 fallidos |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint NVFP4 ocupa 394 GB, distribuidos entre cuatro nodos DGX Spark de 128 GB cada uno (512 GB agregados).
- GPU recomendadas: NVIDIA DGX Spark con GB10 (128 GB por nodo), cuatro unidades en un clúster con interconexión RoCE conmutada.
- No cabe en GPU de consumo convencional (RTX 4090, 24 GB) ni en una única GPU de centro de datos A100/H100 por el tamaño del checkpoint.
- Opciones de despliegue: SGLang sobre la imagen `lmsysorg/sglang:dev-inkling-2-small` con los hooks del repositorio, más lanzador y watchdog para los cuatro nodos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 59-61 tok/s en un stream greedy, 130-143 tok/s agregados con ocho streams, prefill de 2.400-2.500 tok/s en prompts de ~15K tokens y 348 s para un prefill en frío de 500K tokens.
- El repositorio no contiene pesos; es necesario descargar el checkpoint oficial `thinkingmachines/Inkling-2-Small` en la revisión `b0e7afb8892a07897c78ce1c5b801a0d9cbd5e7b`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad del modelo base en la información proporcionada, por lo que no es posible establecer una comparación rigurosa con alternativas. A modo de referencia estructural:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small | 594B | 17B | 262.144 (ampliable a 524.288) | MIT | Checkpoint oficial en Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado experimental: la receta se ha validado durante cuatro días sobre una única flota, con una imagen de desarrollo como base y problemas abiertos documentados en `RECIPE.md`.
- El repositorio no contiene pesos; requiere descargar el checkpoint oficial por separado (394 GB en NVFP4).
- Solo soporta inglés según la model card, lo que limita su uso en entornos multilingües.
- `tool_choice: none` no funciona: de los 13 fallos en la prueba de tool calling, 10 corresponden a este caso.
- El gating del draft (`GATE=0.4`) desplaza el texto greedy en empates cercanos, con cambios menores a una segunda petición en el batch.
- `TP_SHARD=half,fp8` no es bit-idéntico a la colocación estándar (solo por redondeo; el NLL medio no cambia).
- El parche `paged_decode.py` es imprescindible en GB10: sin él, las peticiones concurrentes producen salida corrupta.
- No se han publicado evaluaciones de sesgos, alucinación ni robustez en la información disponible.
- La licencia MIT del repositorio cubre los hooks y scripts, no necesariamente el checkpoint oficial, cuya licencia debe verificarse en su propia model card.
- El despliegue exige cuatro nodos DGX Spark con RoCE, lo que restringe su aplicabilidad a entornos con ese hardware específico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aidendle94/Inkling-2-Small-DGX-Spark
- Checkpoint oficial: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Receta completa (RECIPE.md): https://huggingface.co/aidendle94/Inkling-2-Small-DGX-Spark/blob/main/RECIPE.md
- Notas de laboratorio con todas las mediciones (docs/results.md): https://huggingface.co/aidendle94/Inkling-2-Small-DGX-Spark/blob/main/docs/results.md
- Receta en el blog del autor: https://aidenle.com/recipes/inkling-2-small-sglang-4x-dgx-spark/
- Blog del autor: https://aidenle.com/
- Repositorio GitHub con los mismos ficheros: https://github.com/aidendle94/sparkrun-recipes/tree/main/recipes/inkling-2-small/sglang
