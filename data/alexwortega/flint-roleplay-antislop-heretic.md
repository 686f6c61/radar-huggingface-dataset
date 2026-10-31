# AlexWortega/flint-roleplay-antislop-heretic

## Resumen

flint-roleplay-antislop-heretic es un ajuste de RecursiveSI/flint, un modelo de lenguaje MoE de 39,8 mil millones de parámetros (unos 2,5 mil millones activos), orientado a roleplay y escritura creativa. El autor, AlexWortega, ha aplicado dos modificaciones sobre el modelo base: un post-entrenamiento con GRPO (Group Relative Policy Optimization) sobre tareas de escritura "antislop" —es decir, destinadas a eliminar el estilo repetitivo y genérico típico de los LLM— y un proceso de "decensurado" mediante la herramienta Heretic v2.0.0.dev0, que reduce drásticamente las negativas del modelo (de 97/100 a 0/100 en las pruebas del autor).

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat de Flint, por lo que es compatible directo con los ecosistemas ya existentes para ese modelo. Está pensado para escritura de ficción, roleplay de personajes y escritura creativa en general, y se distribuye en BF16 (safetensors) y en GGUF (BF16, Q8_0 y Q4_K_M), lo que lo hace desplegable tanto en servidores con GPU como en estaciones locales con llama.cpp. Su relevancia actual radica en la combinación de un MoE eficiente (2,5B activos), un entrenamiento específico contra el "slop" narrativo y una ablación de alineamiento documentada con métricas de divergencia KL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlintForCausalLM (transformer MoE, 49 capas, hidden 2048, 32 cabezas Q / 4 KV, atención deslizante 513 + completa, QK-norm por cabeza y attention sinks) |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | ~2,5B (MoE de 256 expertos, top-6, más experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 15 shards, 79,6 GB) y GGUF (BF16 79,6 GB, Q8_0 44,1 GB, Q4_K_M 25,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de RecursiveSI/flint, un MoE de 39,8B de parametros totales con 256 expertos de los que se activan 6 por token, ademas de un experto compartido. La atencion combina ventanas deslizantes de 513 tokens con atencion completa, usa QK-norm por cabeza y attention sinks, y mantiene 32 cabezas de query frente a 4 de KV (GQA). El tokenizador y la plantilla de chat son identicos a los de Flint; el modo de razonamiento se desactiva emitiendo un `<think></think>` vacio.

El post-entrenamiento antislop se realizo con GRPO (4 muestras por prompt, learning rate 1e-5, KL beta 0,04) sobre prompts de continuacion de tweets. La recompensa se calcula puntuando cada respuesta con Claude Opus 5.5 segun una rubrica de escritura por tarea, calibrada mediante un ajuste sigmoide sobre la distribucion de puntuaciones de textos de referencia por dominio (esquema calibrated-v1), de modo que la recompensa mide la mejora relativa frente a la escritura tipica del modelo y no la escala bruta del juez. La recompensa se multiplica por un factor de longitud. Adicionalmente, la version "heretic" aplica Arbitrary-Rank Ablation (ARA) sobre las capas 16 a 42 (preserve_good_behavior_weight 0,6791, steer_bad_behavior_weight 0,1063, overcorrect_relative_weight 0,9919, neighbor_count 8) para eliminar las conductas de rechazo sin reentrenar el modelo completo.

## Capacidades

- Generacion de texto y escritura creativa optimizada contra patrones repetitivos ("slop"), con mejora medida en rubrica de calidad de 4,92 a 5,90 sobre el modelo base.
- Roleplay de personajes y ficcion interactiva, con plantilla de chat de Flint y modo de razonamiento desactivable.
- Conversacion multi-turno orientada a personajes de ficcion con caracteres adultos.
- Sin mecanismos de rechazo activos (0/100 negativas tras la ablacion con Heretic), lo que permite contenido maduro en contexto de ficcion.
- Compatibilidad con llama.cpp mediante GGUF y con vLLM en BF16.
- No hay informacion sobre tool calling, agentes, capacidades de vision ni audio: no disponible.

## Casos de uso

- Roleplay de personajes interactivo: el modelo esta afinado especificamente para escenas de personajes con tarjetas de personaje (character cards), manteniendo estilo y coherencia narrativa sin rechazos que interrumpan la escena.
- Ficcion interactiva y novelas por capitulos: la reduccion de "slop" medida en +0,98 puntos de rubrica lo hace adecuado para prosa continua donde el estilo repetitivo es el principal problema.
- Escritura creativa casual y continuacion de textos cortos: el entrenamiento con continuaciones de tweets lo hace util para generar continuaciones estilisticamente coherentes de textos breves.
- Generacion de dialogos con tonos concretos (romance, flirteo, fantasia): las escenas personalizadas de romance muestran resultados competitivos frente al modelo base en evaluacion a ciegas.
- Modelo base para post-entrenamientos adicionales: la ficha lo recomienda explicitamente como punto de partida para futuros ajustes, gracias a su licencia Apache 2.0 y a conservar la arquitectura original.
- Despliegue local de escritura sin censura para usuarios avanzados: la disponibilidad de Q4_K_M (25,3 GB) permite ejecutarlo en estaciones de trabajo con GPU de consumo, manteniendo una fidelidad razonable (KLD 0,050 frente a BF16).

## Benchmarks y rendimiento

No existen benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) publicados para este modelo. Los datos disponibles son evaluaciones propias del autor, medidas sobre estos pesos exactos frente al RecursiveSI/flint oficial, servidos con vLLM (BF16, temperatura 1,0, mismos prompts y semillas), con Claude Opus 5.5 como juez:

| Metrica | Base (flint) | Este modelo |
|---|---:|---:|
| Puntuacion de rubrica de escritura (held-out, 24 prompts, 0-10) | 4,92 | 5,90 |
| Recompensa calibrada (0-1) | 0,12 | 0,31 |
| Rechazos (de 100) | 97 | 0 |
| Divergencia KL respecto al modelo original | 0 (por definicion) | 2,1426 |
| Roleplay pairwise a ciegas (n=64) | 22 victorias | 28 victorias (14 empates) |
| Roleplay romance/flirteo (n=16) | 7 victorias | 6 victorias (3 empates) |
| Rubrica absoluta de roleplay (n=24) | 6,38 | 6,13 |

Fidelidad de cuantizacion (KLD medio respecto a BF16 de este modelo; menor es mejor):

| GGUF | Receta | KLD medio | Mismo token top |
|---|---|---:|---:|
| Q8_0 | expertos Q8_0; embeddings, salida, atencion, expertos compartidos y capas densas en BF16 | 0,0077 | 96% |
| Q4_K_M | layout por tensor de Flint de bartowski + imatrix | 0,050 | 90% |

El propio autor advierte de que las muestras son pequenas y hay un unico juez, por lo que los numeros de roleplay deben leerse como orientativos.

## Requisitos de hardware

- BF16 (safetensors o GGUF): ~79,6 GB de pesos; se necesita al menos una GPU con 80 GB de VRAM (A100/H100 80 GB) para servirlo completo en BF16, o multiples GPUs (por ejemplo 2x RTX 4090 con offload, con penalizacion de rendimiento).
- Q8_0 (GGUF): 44,1 GB; cabe en una A100 80 GB o en 2x RTX 3090/4090 (48 GB combinados) con ajustes.
- Q4_K_M (GGUF): 25,3 GB; cabe en una RTX 3090 o RTX 4090 de 24 GB estando muy al limite, y con holgura en una RTX 5090 (32 GB) o en 2x GPUs de 16 GB.
- Gracias a la arquitectura MoE con ~2,5B de parametros activos, el throughput y la latencia por token deberian ser comparables a los de un modelo denso de ese tamano, muy por debajo de un denso de 39,8B; no se publican cifras concretas de tokens/segundo.
- Despliegue: vLLM (BF16, formato usado en las evaluaciones del autor), llama.cpp y derivados (Ollama, LM Studio, koboldcpp) mediante los GGUF de la carpeta `gguf/`. No hay informacion sobre compatibilidad con TGI.

## Comparativa con modelos similares

| | flint-roleplay-antislop-heretic | RecursiveSI/flint (base) | Mistral Small 3 (24B, referencia de rol) |
|---|---|---|---|
| Parametros totales | 39,8B (MoE) | 39,8B (MoE) | 24B (denso) |
| Parametros activos | ~2,5B | ~2,5B | 24B |
| Especializacion | Roleplay y escritura antislop, sin rechazos | Modelo base con alineamiento original | Generalista, con variantes de roleplay comunitarias |
| Rechazos (pruebas del autor) | 0/100 | 97/100 | Con alineamiento estandar |
| Licencia | Apache 2.0 | Apache 2.0 (segun ficha del derivado) | Apache 2.0 |
| Formatos | safetensors BF16, GGUF (BF16/Q8_0/Q4_K_M) | safetensors | safetensors, GGUF comunitarios |
| Contexto | no disponible | no disponible | 32k |

Comparado con el modelo base, ofrece escritura de mayor calidad segun rubrica (5,90 frente a 4,92) y elimina las negativas, con una ligera perdida en la rubrica absoluta de roleplay (6,13 frente a 6,38). Frente a alternativas densas de 20-30B usadas en roleplay, su ventaja esta en el coste de inferencia (2,5B activos) y en el entrenamiento antislop especifico; a cambio, carece de benchmarks estandar publicados que permitan comparar capacidades generales.

## Limitaciones y advertencias

- El decensurado mediante Heretic elimina practicamente todas las negativas (0/100), incluidas posiblemente las relativas a contenido sensible: es imprescindible anadir una capa propia de moderacion si se expone a usuarios finales.
- El contenido de roleplay puede incluir temas maduros; el modelo esta pensado para ficcion con personajes adultos.
- Las evaluaciones de roleplay usan muestras pequenas (n=64 y n=16) y un unico juez (Claude Opus 5.5); los resultados son orientativos, no concluyentes.
- La divergencia KL de 2,1426 respecto al modelo base indica una desviacion sustancial del comportamiento original, que puede haber degradado capacidades no evaluadas (razonamiento general, codigo, matematicas): no hay benchmarks que lo confirmen o desmientan.
- El idioma soportado declarado es solo el ingles; el rendimiento en castellano no esta documentado.
- La longitud de contexto no esta especificada en la ficha; la atencion deslizante de 513 tokens combinada con atencion completa sugiere un diseno hibrido, pero el limite efectivo debe verificarse en la documentacion del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir la legislacion aplicable al contenido generado.
- La ablacion de alineamiento se centra en las capas 16 a 42; no hay garantias de estabilidad en dominios fuera de escritura creativa y conversacion.

## Enlaces

- Modelo: https://huggingface.co/AlexWortega/flint-roleplay-antislop-heretic
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Heretic (herramienta de ablacion): https://heretic-project.org
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
