# OpensourceWTF/GLM-5.3-Flash-streaming-repack-exl3

## Resumen

GLM-5.3-Flash-streaming-repack-exl3 es un repositorio de empaquetados (packs) de cuantizaciones EXL3 del modelo GLM-5.3-Flash de Z.ai, reempaquetadas por OpensourceWTF (David Tai) para que el servidor de inferencia mlx-serve pueda servir los expertos enrutados directamente desde el SSD en Apple Silicon. No se trata de un modelo nuevo ni de una cuantizacion propia: los pesos son exactamente los de las cuantizaciones autocalibradas que publica turboderp en turboderp/GLM-5.3-Flash-exl3, generadas con exllamav3, y el reempaquetado no modifica ningun byte de los pesos.

El modelo subyacente, GLM-5.3-Flash, es un transformer de mezcla de expertos (MoE) de Z.ai con 42 capas MoE, cada una con 288 expertos enrutados y 8 activos por token, mas una capa MTP (multi-token prediction) que propone tokens borrador. El repositorio ofrece cuatro ramas de cuantizacion (4.10, 3.10, 2.60 y 2.10 bits por peso, sin contar embeddings ni cabeza de salida), cada una con su propio tamano y su divergencia KL media frente al modelo original.

La relevancia practica es que permite ejecutar un MoE de gran tamano en un Mac con memoria unificada limitada, manteniendo solo una parte de los expertos en memoria y leyendo el resto del SSD bajo demanda. El autor solo ha validado y medido la rama `sc_3.10bpw` en un Mac de 128 GB, con aproximadamente 925 tok/s de prefill y 39,7 tok/s de decodificacion sobre un prompt de 16K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (42 capas MoE, 288 expertos enrutados por capa, 8 activos por token) con capa MTP; pesos EXL3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (8 de 288 expertos enrutados por token y capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4.10, 3.10, 2.60 y 2.10 bpw (autocalibradas por turboderp) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (tronco y tensores no enrutados) + `experts.bin` y `mtp-experts.bin` (registros binarios con manifiestos de offset, tamano y sha256) |

## Arquitectura y entrenamiento

GLM-5.3-Flash es un modelo MoE de Z.ai. Cada una de sus 42 capas MoE contiene 288 expertos enrutados (redes feed-forward pequenas) y un router selecciona 8 por token. El modelo incorpora ademas una capa MTP (multi-token prediction) que propone tokens borrador, lo que habilita decodificacion especulativa. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde al modelo original de Z.ai y no esta disponible en la informacion proporcionada.

El reempaquetado separa los expertos enrutados de las capas MoE 3 a 44 en `experts.bin`, un registro por experto con las proyecciones gate, up y down en los bytes originales de turboderp, y los 288 expertos de la capa MTP (capa 45) en `mtp-experts.bin`, que permanece en memoria. El resto de tensores se mantiene en shards safetensors con los nombres, dtypes y bytes de turboderp. El servidor mlx-serve, mediante el modelo integrado `glm5_next` y el plugin externo `turboexl3_glm53f`, mantiene solo parte de los expertos en memoria y lee los demas del SSD cuando un token los requiere. Las cuantizaciones se generaron con exllamav3 y son autocalibradas; el autor no publica perplejidad para estas ramas, solo la divergencia KL media frente al modelo original.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation.
- Razonamiento y decodificacion especulativa mediante la capa MTP, que propone tokens borrador.
- Ejecucion de un MoE de gran tamano con expertos en streaming desde SSD en Apple Silicon.
- Cuatro niveles de cuantizacion con distinta fidelidad frente al modelo original (KLD de 0,0288 a 0,1570).
- Plantilla de chat incluida en cada rama (la de `sc_4.10bpw` es mas reciente, 10.950 bytes, frente a 8.617 bytes de las otras tres).
- Tool calling, function calling, capacidades de agente, vision, audio y soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local de un MoE grande en un Mac de 128 GB: usar la rama `sc_3.10bpw` con mlx-serve, que mantiene el tronco y los expertos MTP en memoria (12,4 GB) y hace streaming del resto desde el SSD, permitiendo servir un modelo que no cabria completo en RAM.
- Despliegue en estaciones de trabajo Apple Silicon con requisitos de fidelidad alta: la rama `sc_4.10bpw` ofrece el KLD mas bajo (0,0288) a costa de 167,85 GB en disco y 14,2 GB de tronco y MTP en memoria, adecuada cuando la precision importa mas que el rendimiento.
- Entornos con disco y memoria muy limitados: `sc_2.10bpw` ocupa 88,31 GB y deja el tronco y MTP en 11,0 GB, util para prototipado y pruebas de integracion donde la calidad no es critica.
- Evaluacion de decodificacion especulativa: la capa MTP empaquetada en `mtp-experts.bin` permite medir el impacto del borrador de tokens sobre la latencia de decodificacion en mlx-serve.
- Reproducibilidad y auditoria de cuantizaciones: los manifiestos con offset, tamano y sha256 de cada registro permiten verificar file-by-file que los packs coinciden con las ramas de turboderp, util en pipelines de validacion.
- Investigacion sobre streaming de expertos: los scripts de conversion en `glm53f/` y el formato documentado en `LAYOUT.md` sirven como referencia para adaptar otros MoE a este esquema de lectura desde SSD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son de velocidad y fidelidad de cuantizacion:

| Metrica | sc_4.10bpw | sc_3.10bpw | sc_2.60bpw | sc_2.10bpw |
|---|---:|---:|---:|---:|
| Bits por peso (sin embeddings ni cabeza) | 4.10 | 3.10 | 2.60 | 2.10 |
| Tamano de rama | 167,85 GB | 128,07 GB | 109,04 GB | 88,31 GB |
| KLD media (turboderp) | 0,0288 | 0,0574 | 0,0929 | 0,1570 |
| Tronco + expertos MTP en memoria | 14,2 GB | 12,4 GB | 12,4 GB | 11,0 GB |
| Prefill medido | no disponible | ~925 tok/s (prompt 16K) | no disponible | no disponible |
| Decodificacion medida | no disponible | 39,7 tok/s (prompt 16K) | no disponible | no disponible |

Las cifras de velocidad corresponden a un unico Mac de 128 GB (M5) con la rama `sc_3.10bpw`; el autor no midio las otras tres ramas.

## Requisitos de hardware

- Memoria: solo se ha probado un Mac con 128 GB de memoria unificada. El tronco y los expertos MTP ocupan 11,0 GB (`sc_2.10bpw`), 12,4 GB (`sc_2.60bpw` y `sc_3.10bpw`) o 14,2 GB (`sc_4.10bpw`), a lo que se suma el espacio para los slots de expertos en memoria.
- Almacenamiento: entre 88,31 GB y 167,85 GB por rama, segun el bitrate, mas el repositorio completo de 493,1 GB si se descargan todas las ramas.
- GPU: exclusivamente Apple Silicon (mlx-serve); no hay soporte documentado para A100, H100 ni RTX 4090 en esta informacion.
- Cabe en GPU consumer: solo en equipos Apple Silicon con memoria unificada suficiente (el autor valido 128 GB); no hay datos para configuraciones menores.
- Despliegue: mlx-serve con el modelo `glm5_next` y el plugin `turboexl3_glm53f`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~925 tok/s de prefill y 39,7 tok/s de decodificacion con `sc_3.10bpw` en un M5 de 128 GB sobre un prompt de 16K tokens; sin datos para el resto de ramas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpensourceWTF/GLM-5.3-Flash-streaming-repack-exl3 | no disponible (MoE 288 expertos, 8 activos) | no disponible | EXL3 2.10-4.10 bpw con streaming | MIT | Hugging Face, 0 descargas |
| turboderp/GLM-5.3-Flash-exl3 | mismo modelo base | no disponible | EXL3 2.10-4.10 bpw (sin streaming) | no disponible | Hugging Face |
| zai-org/GLM-5.3-Flash | mismo modelo base | no disponible | pesos originales | no disponible | Hugging Face |
| OpensourceWTF/GLM-5.3-Flash-streaming-repack-exl3-3.05bpw | mismo modelo base | no disponible | pack anterior con tronco FP8/BF16 y MTP NVFP4 | MIT | Hugging Face (stub que apunta al repositorio actual) |

La diferencia clave frente a turboderp/GLM-5.3-Flash-exl3 es el reempaquetado para streaming de expertos desde SSD; frente al pack anterior de 3.05 bpw, este repositorio usa exclusivamente los bytes de turboderp, por lo que su KLD es aplicable, mientras que el anterior no lo era por provenir de otra release y usar MTP en NVFP4.

## Limitaciones y advertencias

- Solo se ha validado la rama `sc_3.10bpw`; las otras tres usan el plan de memoria por defecto de mlx-serve, que mantiene menos expertos en memoria, y el autor no tiene resultados para ellas.
- Solo se ha probado en un Mac de 128 GB (M5); el comportamiento en otros equipos Apple Silicon no esta documentado.
- Dependencia estricta de mlx-serve y del plugin `turboexl3_glm53f`; no hay soporte documentado para otros runtimes.
- El rendimiento depende de la velocidad del SSD: el streaming de expertos introduce latencia variable segun el almacenamiento.
- La rama `sc_2.10bpw` tiene un KLD de 0,1570, notablemente mas alta que las demas; su fidelidad frente al modelo original es limitada.
- Las plantillas de chat difieren entre ramas (10.950 bytes en `sc_4.10bpw` frente a 8.617 bytes en las otras tres), lo que puede afectar a la reproducibilidad de resultados entre ramas.
- No hay datos publicados de benchmarks de calidad, perplejidad, sesgos, riesgo de alucinacion ni cobertura idiomatica en la informacion disponible.
- La licencia del repositorio es MIT, pero la licencia del modelo original de Z.ai no esta disponible en la informacion proporcionada; conviene verificarla antes de un uso comercial.
- El credito de las cuantizaciones corresponde a turboderp; el repositorio solo reempaqueta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OpensourceWTF/GLM-5.3-Flash-streaming-repack-exl3
- Cuantizaciones de turboderp: https://huggingface.co/turboderp/GLM-5.3-Flash-exl3
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- mlx-serve: https://github.com/ddalcu/mlx-serve
- exllamav3: https://github.com/turboderp-org/exllamav3
- Scripts de conversion y formato de pack: https://github.com/OpenSourceWTF/mlx-serve-streaming-pack-converters/tree/main/glm53f
- Pack anterior (stub): https://huggingface.co/OpensourceWTF/GLM-5.3-Flash-streaming-repack-exl3-3.05bpw
