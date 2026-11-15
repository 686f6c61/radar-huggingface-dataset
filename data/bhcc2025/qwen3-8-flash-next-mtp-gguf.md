# BHCC2025/Qwen3.8-Flash-Next-MTP-GGUF

## Resumen

Qwen3.8-Flash-Next-MTP-GGUF es un fichero GGUF de 1,41 GiB que contiene exclusivamente la cabeza de prediccion multi-token (MTP) del modelo Qwen/Qwen3.8-Flash-Next, empaquetada por el usuario BHCC2025 en formato compatible con llama.cpp (arquitectura `qwen4exp`). No es un modelo autonomo: aloja solo el bloque MTP (`blk.48.*`, 32 tensores), sin embeddings, sin cabeza de salida y sin capas del tronco. El borrador lee los embeddings de tokens y la cabeza de salida del modelo principal, por lo que necesita siempre un checkpoint Flash-Next completo al lado.

Su proposito concreto es servir de modelo borrador en decodificacion especulativa junto a los ficheros cuantizados IQ1_M de ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF, que no incluyen bloque MTP. El motor de inferencia previsto es Ferrite (repositorio BHCC2025/ferrite), que carga ambos ficheros tal como se publican. La redaccion es sin perdida: la salida greedy es identica token a token con y sin borrador, solo cambia la velocidad.

El modelo base declara 2.607.150.848 parametros totales en safetensors, pero ese dato corresponde al checkpoint original, no a este fichero derivado, que pesa 1,41 GiB y contiene unicamente el bloque MTP. La relevancia actual es practica: permite acelerar entre 1,4x y 1,8x la generacion sobre hardware consumer modesto (dos RTX 5060 Ti de 16 GB) sin alterar la distribucion de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque MTP de Qwen3.8-Flash-Next; metadatos GGUF `general.architecture = qwen4exp`, `qwen4exp.block_count = 49`, `qwen4exp.nextn_predict_layers = 1` |
| Parametros totales | No disponible para este fichero (el checkpoint base declara 2.607.150.848) |
| Parametros activos | No disponible (el checkpoint base es de arquitectura MoE con 512 expertos enrutados por capa segun los tensores `ffn_*_exps`) |
| Longitud de contexto | No especificada para el borrador; las mediciones se hicieron con 128K de contexto sobre el modelo principal |
| Tipos de cuantizacion | Mixta dentro del propio fichero: Q4_K (expertos gate/up), IQ4_NL (expertos down), Q8_0 (atencion, experto compartido, mezcladores de hiper-conexion, `nextn.eh_proj`), BF16 (proyecciones q/k del indexador QSA), F32 (normas, router, gate del experto compartido) |
| Idiomas soportados | No disponibles (el borrador no incluye tokenizer; depende del modelo principal) |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-license-1.0`) |
| Formato de pesos | GGUF (fichero unico `Qwen3.8-Flash-Next-MTP.gguf`, 1.517.334.816 bytes, sha256 `54ba284d7538c534e3d8e6231c1a8fa46715d27e56f0f31af66e2ac39ee7914b`) |

## Arquitectura y entrenamiento

El fichero no se ha entrenado: es una conversion y requantizacion de los 31 tensores `mtp.*` del checkpoint Qwen/Qwen3.8-Flash-Next en revision `de4b8e4d43b917e7706784d8bb445c9af86a3540` (BF16, 4,86 GiB). Esos tensores se leyeron mediante peticiones HTTP por rangos directamente de los safetensors del checkpoint, sin descargar el resto. La conversion se hizo con `convert_hf_to_gguf.py --mtp` (conversor `qwen4exp`, sin modificar, commit `74b104c9` de llama.cpp) en dos pasadas, `--outtype q8_0` y `--outtype bf16`. Un script posterior ensamblo el fichero final: expertos enrutados requantizados de Q8_0 a Q4_K (gate, up) e IQ4_NL (down) con los cuantizadores nativos de ggml (`ggml_quantize_chunk`, sin matriz de importancia), proyecciones del indexador QSA tomadas de la conversion BF16, y el resto en Q8_0/F32. El tensor fusionado `hc_*_down_inject` [10240 x 324] del conversor se dividio en sus 320 filas down y 4 filas inject, division exacta para Q8_0 porque los bloques nunca cruzan una fila.

El bloque corresponde a una unica capa MTP (`nextn_predict_layers = 1`) sobre un tronco de 49 bloques. Los tensores incluyen 512 expertos enrutados por capa con dimensiones 640 x 2560 en gate/up y down, atencion q/k/v/output, experto compartido, mezcladores de hiper-conexion (`hc_attn_down`/`hc_attn_inject`, `hc_ffn_down`/`hc_ffn_inject`) y `nextn.eh_proj`. La innovacion tecnica relevante no esta en el fichero en si, sino en su uso: decodificacion especulativa con aceptacion medida de aproximadamente el 92 % de los tokens propuestos en codigo, manteniendo equivalencia exacta con la salida greedy del modelo principal.

## Capacidades

- Aceleracion de decodificacion especulativa: propone tokens que el modelo principal verifica, elevando el throughput sin cambiar la salida greedy.
- Equivalencia lossless: la secuencia greedy es identica token a token con y sin borrador, comprobada en cuatro prompts de referencia de 39 a 20.000 tokens.
- Integracion con llama.cpp/ggml: nombres de tensor segun la convencion `qwen4exp` de llama.cpp y metadatos de hiper-parametros del checkpoint.
- Emparejamiento con cuantizaciones IQ1_M: pensado especificamente para los ficheros GSQ-RCO de ISTA-DASLab que carecen de bloque MTP.
- Sin tokenizer propio: hereda el vocabulario y la cabeza de salida del modelo principal.
- Sin capacidades autonomas de generacion, razonamiento, codigo, vision, tool calling ni agentes: no es un modelo independiente.

## Casos de uso

- Servicio de inferencia de codigo de baja latencia: cargando el IQ1_M de GSQ-RCO junto a este borrador en Ferrite, se pasa de 74,5-74,8 tok/s a 135,2-136,4 tok/s en generacion de codigo sobre dos RTX 5060 Ti, lo que reduce a casi la mitad el tiempo de respuesta en autocompletado y chat tecnico.
- Generacion de prosa interactiva: en el mismo hardware se obtiene 110,0-111,0 tok/s frente a 74,8-75,3 tok/s, adecuado para asistentes conversacionales donde el coste por token domina.
- Despliegue en hardware consumer con contexto largo: las mediciones se hicieron con 128K de contexto en GPUs de 16 GB, escenario en el que el borrador compensa la perdida de velocidad tipica de las cuantizaciones agresivas IQ1_M.
- Evaluacion reproducible de decodificacion especulativa: el fichero incluye sha256 y procedimiento de construccion documentado, lo que permite replicar las mediciones y comparar motores de inferencia.
- Pipeline de CI/CD para documentacion y tests: la equivalencia lossless garantiza que la salida de pruebas con borrador coincide con la del modelo base, de modo que puede activarse en produccion sin revalidar respuestas.
- Investigacion sobre cabezas MTP: al aislar el bloque MTP en 1,41 GiB con cuantizacion mixta, facilita experimentos sobre aceptacion de borradores y coste de memoria sin cargar el checkpoint completo en BF16.

## Benchmarks y rendimiento

| Escenario (GSQ-RCO IQ1_M, 2x RTX 5060 Ti 16 GB, tensor parallel, EPYC 7313, 128K, greedy, 256 tokens, 3 ejecuciones en caliente) | Sin borrador | Con borrador MTP |
|---|---|---|
| Codigo | 74,5-74,8 tok/s | 135,2-136,4 tok/s |
| Prosa | 74,8-75,3 tok/s | 110,0-111,0 tok/s |

Tasa de aceptacion de tokens propuestos en codigo: aproximadamente 92 %. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y en cualquier caso corresponderian al modelo principal, no a este fichero.

## Requisitos de hardware

- VRAM para el borrador: 1,41 GiB en disco y aproximadamente esa misma cifra residente en memoria al cargarlo, adicionales al checkpoint principal.
- VRAM total: depende del checkpoint Flash-Next cuantizado que se empareje; las mediciones usan IQ1_M en dos GPUs de 16 GB en tensor parallel.
- GPUs recomendadas: configuracion validada con 2x RTX 5060 Ti 16 GB; no se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, el borrador por si solo en cualquier GPU con 2 GB libres; el conjunto completo requiere capacidad suficiente para el modelo principal.
- Opciones de despliegue: Ferrite (motor previsto, con `scripts/fetch-flashnext.sh` que descarga ambos ficheros y verifica sha256); llama.cpp como origen del conversor y los cuantizadores, aunque la integracion del borrador MTP esta documentada para Ferrite.
- Latencia y throughput: ver tabla de benchmarks; ganancia de 1,4x en prosa y 1,8x en codigo sobre la configuracion medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BHCC2025/Qwen3.8-Flash-Next-MTP-GGUF (este) | Bloque MTP de 1,41 GiB | No especificado (medido a 128K con el principal) | Borrador especulativo | Qwen Community License 1.0 | Hugging Face, 0 descargas |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | No disponible | No disponible | Modelo principal cuantizado IQ1_M | No disponible | Hugging Face |
| Qwen/Qwen3.8-Flash-Next | 2.607.150.848 | No disponible | Modelo base BF16 | Qwen Community License 1.0 | Hugging Face |

No se dispone de datos sobre otros borradores MTP comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin embeddings, sin cabeza de salida y sin tronco, no genera texto por si mismo y falla si se carga solo.
- Dependencia estricta del emparejamiento: esta construido para los IQ1_M de ISTA-DASLab y para Ferrite; otros checkpoints o motores pueden no reconocer los tensores o los metadatos `qwen4exp`.
- Requantizacion sin matriz de importancia: los expertos enrutados pasaron de Q8_0 a Q4_K/IQ4_NL con cuantizadores genericos, lo que puede degradar ligeramente la calidad de los tokens propuestos (compensada por la verificacion del modelo principal, que preserva la salida greedy).
- Sin tokenizer ni metadatos de idiomas: no se puede evaluar cobertura linguistica del borrador de forma independiente.
- Licencia restrictiva: Qwen Community License 1.0 limita el uso comercial para negocios de "Model as a Service" y "AI Work Assistant"; debe leerse LICENSE-NOTE.md antes de ofrecer un servicio.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la ficha, con mediciones procedentes unicamente del autor.
- Beneficio variable segun carga: la aceleracion medida es de 1,4x-1,8x en codigo y prosa; no hay datos para otros dominios ni para contextos menores o mayores.
- Sin benchmarks estandar publicados para el modelo base en la informacion disponible, lo que impide contextualizar la calidad absoluta.

## Enlaces

- Hugging Face: https://huggingface.co/BHCC2025/Qwen3.8-Flash-Next-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint cuantizado emparejado: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Motor Ferrite: https://github.com/BHCC2025/ferrite
- Documentacion Flash-Next en Ferrite: `docs/flash-next.md` del repositorio anterior
- Licencia: LICENSE y LICENSE-NOTE.md en el repositorio de Hugging Face
- llama.cpp (conversor `qwen4exp`, commit `74b104c9`): https://github.com/ggml-org/llama.cpp
