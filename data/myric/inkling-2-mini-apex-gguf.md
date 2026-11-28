# Myric/Inkling-2-Mini-APEX-GGUF

## Resumen

Inkling-2-Mini-APEX-GGUF es una cuantizacion en formato GGUF del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario Myric. Se trata de una arquitectura MoE con transformer con bucles (looped transformer): las capas 6 a 17 se ejecutan tres veces por token compartiendo pesos, lo que reduce el numero de parametros necesarios para una profundidad efectiva mayor. El modelo completo tiene 26.070.385.152 parametros (26,1B) y el autor lo distribuye en un unico archivo de 13,96 GB a 4,28 bits por peso.

La relevancia de esta ficha no esta en el modelo base sino en el trabajo de cuantizacion: el autor construye una matriz de importancia ponderada hacia codigo y realiza un barrido de sensibilidad por rol de tensor para asignar tipos de cuantizacion distintos a cada grupo de pesos, en lugar de aplicar un esquema uniforme. El resultado, segun sus propias mediciones, queda un 24% mas cerca del BF16 en divergencia KL que la variante I-Compact del proveedor con un tamano practicamente identico.

El modelo esta pensado para generacion de texto en ingles, con enfasis en tareas de codigo y flujos agenticos. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Esta ficha se basa exclusivamente en la model card y los metadatos publicados; no se dispone de informacion sobre el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con looped transformer (capas 6-17 ejecutadas 3 veces por token, pesos compartidos) |
| Parametros totales | 26.070.385.152 (26,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | 64K en la configuracion de servicio recomendada; el modelo base soporta 1M segun el autor |
| Tipos de cuantizacion | Mezcla por rol de tensor: Q6_K (attention), Q4_K y Q3_K (expertos FFN), IQ4_NL (ffn_down_exps), Q4_K (embeddings y output), F32 (normas, convoluciones, routers, controles de bucle) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un unico archivo de 13,96 GB, 4,28 bpw) |

## Arquitectura y entrenamiento

La arquitectura es un mezcla de expertos (MoE) sobre un transformer con bucles. El rasgo estructural mas destacable es que las capas 6 a 17 se ejecutan tres veces por token con el mismo conjunto de pesos (`loop.start=6`, `loop.end=18`, `loop.count=3`), de modo que la profundidad efectiva es mayor que el numero de capas fisicas. El autor de la cuantizacion no detalla el numero de expertos ni la dimension de los mismos, aunque si revela que `ffn_down_exps` tiene `ne0 = 1152` y que los expertos de `ffn_gate_up_exps` representan una parte sustancial de los 26,1B de parametros.

No hay informacion en la model card sobre el volumen de datos de entrenamiento, la composicion del dataset, el proceso de alineamiento (RLHF, DPO) ni innovaciones como decodificacion especulativa. Lo unico documentado es el proceso de cuantizacion: matriz de importancia `llama-imatrix` ponderada al 70% hacia codigo sobre 349 fragmentos, barrido de sensibilidad por rol de tensor y asignacion contra un presupuesto de bytes, con 702 de 704 tensores nombrados explicitamente en el archivo de receta. La cuantizacion requiere `llama.cpp` upstream con `src/models/inkling2-loop.cpp` (commit `1fe1c97` o posterior); no hace falta un fork.

## Capacidades

- Generacion de texto y razonamiento en ingles, con un parametro `reasoning_effort` que admite valores de `minimal` a `max`.
- Generacion de codigo: el modelo esta descrito como un modelo de codigo y la matriz de importancia se pondero hacia codigo deliberadamente.
- Ejecucion de tareas agenticas de multiples pasos: el autor reporta 42/42 tareas y 253/253 items en su suite agentica de 42 tareas.
- Soporte de plantillas de chat mediante `--jinja` en `llama-server`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multimodales en el modelo base (imagenes, audio y video) segun el autor; **no evaluadas** en esta cuantizacion, que es solo texto.
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Generacion de codigo en produccion: el modelo esta optimizado para codigo y su cuantizacion usa una imatrix ponderada hacia codigo, por lo que es adecuado para autocompletado, generacion de funciones y refactorizacion en pipelines de CI/CD con 64K de contexto.
- Agentes autonomos de multiples pasos: la suite agentica del autor (42 tareas, 253 items, 0 fallos) demuestra que el modelo completa cadenas de razonamiento y accion sin bucles ni salidas vacias, lo que lo hace apto para orquestacion de tareas.
- Asistente de desarrollo integrado en IDE: con 13,96 GB cabe en estaciones de trabajo con GPU de 24 GB, permitiendo servir un modelo de 26,1B en local con latencia aceptable para autocompletado interactivo.
- Procesamiento de repositorios completos: la ventana de 64K configurable permite analizar modulos y archivos de gran tamano en una sola pasada, util para revision de codigo y generacion de documentacion tecnica.
- Despliegue en hardware de gama alta de consumo: la cuantizacion a 4,28 bpw permite ejecutar un modelo MoE de 26B en una RTX 4090 o similar, algo inviable con el BF16 de 52 GB.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye la receta de 704 tensores, la imatrix y los scripts de reproduccion, lo que lo convierte en una referencia util para investigadores que estudien asignacion de bits por rol de tensor.
- Servicio de inferencia con `llama-server`: la configuracion recomendada (`--jinja -fa on -c 65536`) permite exponer el modelo como API compatible con endpoints.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantizacion. PPL y KL sobre el corpus `ppl_mixed_code_heavy.raw`, 64 fragmentos de 512 tokens de contexto, con logits BF16 como referencia.

| Metrica | Este archivo (13,96 GB) | APEX I-Compact (14,10 GB) | BF16 (52 GB) |
|---|---:|---:|---:|
| PPL | 2,0435 | 2,0617 | 2,0386 |
| KLD media | 0,008638 ± 0,000266 | 0,011336 ± 0,000285 | — |
| RMS Δp | 3,046% | 3,540% | — |
| Mismo top p | 97,647% | 97,414% | — |
| pp512 / tg128 (GB10) | 818,7 / 35,2 | 764,6 / 36,6 | — |

Suite agentica de 42 tareas (general 25, hard 5, frontier 9, tier4a 3), con `reasoning=minimal`:

| Metrica | Este archivo | I-Compact | I-Quality (minimal) |
|---|---:|---:|---:|
| Tareas | 42/42 | 42/42 | 42/42 |
| Items | 253/253 | 253/253 | 253/253 |
| void / loop / fail | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Tiempo total | 49,1 min | 68,4 min | 34,1 min |
| Tokens de salida por tarea | 1.816 | 2.788 | 1.064 |

El propio autor advierte que la variante I-Quality, mas grande, sigue ganando en tiempo y tokens: un 30% menos de peso cuesta aproximadamente 1,7 veces mas salida. Esta cuantizacion es una respuesta al tamano, no a la velocidad. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB para el archivo completo a 4,28 bpw, mas el espacio de cache KV correspondiente al contexto configurado.
- GPU recomendadas: cualquier GPU con 16 GB o mas de VRAM; el autor reporta mediciones en GB10 (NVIDIA GB10 Grace Blackwell).
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB), RTX 4080 (16 GB) y modelos con 16 GB o mas. No cabe en GPUs de 12 GB o menos sin offloading a CPU.
- Opciones de despliegue: `llama.cpp` (upstream, commit `1fe1c97` o posterior), `llama-server` con `--jinja -fa on -c 65536`, y por extension cualquier frontend compatible con GGUF (Ollama, LM Studio, etc., aunque no se mencionan explicitamente).
- Throughput medido: 818,7 tokens/s en prefill (pp512) y 35,2 tokens/s en generacion (tg128) sobre GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---:|---:|---|---|
| Inkling-2-Mini-APEX-GGUF (este) | 26,1B | 64K configurado (1M base) | 13,96 GB | Apache 2.0 | 4,28 bpw, KLD 0,008638 |
| Inkling-2-Mini APEX I-Compact | 26,1B | 64K configurado (1M base) | 14,10 GB | Apache 2.0 | Cuantizacion del proveedor, KLD 0,011336 |
| Inkling-2-Mini APEX I-Quality | 26,1B | 64K configurado (1M base) | 18,68 GiB | Apache 2.0 | Cuantizacion del proveedor, mayor calidad y velocidad, mas peso |
| Inkling-2-Mini BF16 | 26,1B | 1M | 52 GB | Apache 2.0 | Referencia sin cuantizar |

No se dispone de informacion sobre modelos de otros fabricantes con los que comparar directamente en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo texto: aunque el modelo base acepta imagenes, audio y video, esta cuantizacion no ha evaluado esas rutas.
- Contexto: el modelo soporta hasta 1M de tokens segun el autor, pero no se ejecuto ninguna evaluacion de contexto largo; la configuracion recomendada es de 64K.
- Corpus de evaluacion sesgado hacia codigo: las cifras de PPL y KLD no son comparables con resultados sobre wikitext u otros corpus generales.
- La arquitectura con bucles (capas 6-17 ejecutadas tres veces) puede amplificar el error de cuantizacion; el autor reconoce que la interaccion no esta resuelta y que el nucleo del bucle mide menos sensible por GB que la banda exterior, un resultado confundido por el hecho de que esa banda incluye las primeras y ultimas capas.
- `ffn_down_exps` (8,2B de los 26,1B de parametros) no admite K-quants por su dimension (`ne0 = 1152`) y queda limitado a tipos legacy; el autor lo fija en IQ4_NL tras medir que es insensible entre Q4_0 y Q5_1.
- Riesgo de alucinacion: no documentado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idioma: solo ingles; el rendimiento en castellano no esta evaluado ni declarado.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor de la cuantizacion no ofrece garantias sobre el comportamiento en produccion.
- Requiere una version concreta de `llama.cpp` (commit `1fe1c97` o posterior) para cargar la arquitectura `inkling2-loop`.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/Myric/Inkling-2-Mini-APEX-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones del proveedor (mudler): https://huggingface.co/mudler/Inkling-2-Mini-APEX-GGUF
- GGUF BF16 de referencia (ggml-org): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Benchmarks de cuantizacion del autor: https://huggingface.co/Myric/apex-quant-benchmarks
