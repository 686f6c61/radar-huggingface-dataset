# DuoNeural/Qwen2.5-Coder-7B-Instruct-CodeInfused-IQ3_XXS-GGUF

## Resumen

DuoNeural/Qwen2.5-Coder-7B-Instruct-CodeInfused-IQ3_XXS-GGUF es una cuantizacion GGUF en precision IQ3_XXS (aproximadamente 3,2 bits por peso) del modelo Qwen/Qwen2.5-Coder-7B-Instruct, publicada por DuoNeural Research Lab (Jesse Caldwell, Archon y Aura). El objetivo declarado es resolver el colapso sintactico que sufren los modelos especializados en codigo al bajar de 4 bits con tecnicas de cuantizacion post-entrenamiento convencionales, mediante una Hessiana de activaciones "infundida con codigo" de 131.072 tokens y un metodo propio denominado G-TAP v3 con amortiguamiento de cavidad de Onsager.

El checkpoint conserva los 7.615.616.512 parametros del modelo base (28 capas, atencion GQA con 28 cabezas de consulta y 4 de clave/valor, FFN SwiGLU, RoPE y RMSNorm) y ocupa 2,90 GiB en disco, frente a los 14,19 GiB del control en BF16. El autor declara una perplejidad de 2,8301 en un conjunto de validacion continuo de 131.000 tokens (frente a 2,8039 del BF16) y una velocidad de decodificacion de 138,1 t/s en una NVIDIA RTX 4080 Super, aproximadamente tres veces la del modelo sin cuantizar.

Es relevante porque apunta a un nicho muy concreto: ejecutar un modelo de codigo de 7B en hardware de gama de consumo con una perdida de calidad declarada muy baja. Ahora bien, la propia model card lo etiqueta como "lanzamiento experimental, pendiente de verificacion y validacion empirica adicional", y el repositorio no tiene descargas ni valoraciones, por lo que las cifras deben tratarse como afirmaciones del autor y no como resultados replicados de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, GQA (28 cabezas Q / 4 KV), SwiGLU FFN y RMSNorm; 28 capas |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ3_XXS (~3,2 bpw, 2,90 GiB) en este repositorio; el autor referencia tambien Q4_K_M (~4,5 bpw, 4,36 GiB) en sus comparativas, pero no se publica en esta ficha |
| Idiomas soportados | No disponible en la informacion proporcionada para este checkpoint |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 3,1 GB) |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Metodo de cuantizacion | G-TAP v3 (DuoNeural) con imatrix de 131.072 tokens "code-infused" (`qwen7b_coder_gtap.imatrix`) |
| Fecha de publicacion | 2026-09-28 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 28 capas con embeddings posicionales rotatorios (RoPE), normalizacion RMSNorm, activaciones SwiGLU en la red feed-forward, sesgo en las proyecciones QKV y atencion agrupada (GQA) con una relacion 28:4 entre cabezas de consulta y de clave/valor. No hay innovaciones arquitectonicas en este checkpoint: el trabajo de DuoNeural se situa integramente en la fase de cuantizacion post-entrenamiento (PTQ), no en el preentrenamiento ni en el ajuste por instrucciones, que hereda del modelo original de Qwen.

La aportacion tecnica declarada es el uso de una matriz Hessiana de activaciones de 131.072 tokens obtenida sobre codigo (`qwen7b_coder_gtap.imatrix`), combinada con el metodo G-TAP v3 y amortiguamiento de cavidad de Onsager, para preservar el comportamiento algoritmico del modelo en regimen sub-4-bit. Segun la model card, esta combinacion evita el "acantilado de colapso sintactico" que aparece con cuantizacion estandar por debajo de 4 bits en modelos de codigo. Los unicos datos de calibracion publicados son los del conjunto de validacion continuo de 131.000 tokens; no se documentan ni el volumen total de tokens de calibracion, ni la composicion del dataset, ni procesos de RLHF o DPO adicionales sobre este checkpoint (el ajuste por instrucciones procede del modelo base de Qwen).

## Capacidades

- Generacion de codigo en multiples lenguajes, heredada de Qwen2.5-Coder-7B-Instruct; el autor valida explicitamente Python en sus pruebas.
- Resolucion de problemas algoritmicos: los tests AST publicados cubren programacion dinamica (`coin_change`, `longest_increasing_subsequence`, `edit_distance`), estructuras de datos (`LRUCache` con O(1), arbol de prefijos `Trie`) y grafos (`topological_sort` con deteccion de ciclos), todos con 100 % de exito segun la model card.
- Razonamiento matematico multi-paso: el autor reporta 25/25 aciertos en GSM8K.
- Tool calling / function calling: validado con el formato Hermes (15/15 en el arm G-TAP v3 IQ3_XXS).
- Modo conversacional (etiqueta `conversational` en el repositorio y variante instruct del modelo base).
- Capacidades multilingues: no disponibles en la informacion proporcionada para este checkpoint.
- No se documentan capacidades de vision, audio, modo "thinking" explicito ni decodificacion especulativa.

## Casos de uso

- Asistente de codigo en local para desarrolladores individuales: con 2,90 GiB de pesos, el modelo cabe en GPUs de consumo y portatiles con GPU discreta, lo que permite tener un asistente de autocompletado y generacion de funciones sin enviar codigo propietario a servicios externos.
- Servidor de completado de codigo en el IDE: mediante `llama-server` con `-c 4096 -ngl 99 -fa on`, el modelo puede exponerse como endpoint compatible con OpenAI y consumirse desde extensiones de editor para sugerencias de bloque completo.
- Generacion de tests unitarios y funciones auxiliares en pipelines de CI: el rendimiento en pruebas AST de programacion dinamica y estructuras de datos lo hace util para generar borradores de tests que luego se validan en el propio pipeline.
- Refactorizacion y traduccion entre lenguajes en entornos con recursos limitados: la naturaleza instruct del modelo base permite tareas de reescritura y conversion de fragmentos, con la ventaja de un consumo de VRAM muy inferior al BF16.
- Prototipado en estaciones de trabajo sin GPU de datacenter: al ocupar menos de 3 GiB, puede convivir con otros servicios en una unica GPU de 8-16 GB, algo inviable con el modelo sin cuantizar (14,19 GiB).
- Despliegue en el borde o en contenedores pequenos: el peso reducido reduce el tiempo de arranque y el uso de disco, util para entornos de demo, pruebas de integracion o entornos efimeros.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como artefacto de referencia para reproducir (o refutar) las cifras de perplejidad y ejecucion AST declaradas por el autor frente al control BF16 y al IQ3_XXS naive.
- Agentes con tool calling: la validacion con el formato Hermes abre la puerta a flujos de agente que invocan funciones, siempre que se asuma el riesgo de que las cifras no esten verificadas de forma independiente.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor (RTX 4080 Super, 32 GB de VRAM). No hay verificacion independiente publicada.

| Arm de evaluacion | Codebook | Huella | Perplejidad (131k tokens) | GSM8K | AST Python (20 tests) | Tool calling (Hermes) | Velocidad de decodificacion |
|---|---|---|---|---|---|---|---|
| Base BF16 (control) | BF16 | 14,19 GiB | 2,8039 | 25/25 (100,0 %) | 20/20 (100,0 %) | 15/15 (100,0 %) | 43,3 t/s |
| Coder7B IQ3_XXS naive | IQ3_XXS (~3,2 bpw) | 2,90 GiB | 2,8301 | 25/25 (100,0 %) | 17/20 (85,0 %) | 15/15 (100,0 %) | 138,0 t/s |
| Coder7B G-TAP v3 IQ3_XXS | IQ3_XXS (~3,2 bpw) | 2,90 GiB | 2,8264 | 23/25 (92,0 %) | 17/20 (85,0 %) | 15/15 (100,0 %) | 138,8 t/s |
| Coder7B G-TAP v3 Q4_K_M | Q4_K_M (~4,5 bpw) | 4,36 GiB | 2,8209 | 25/25 (100,0 %) | 16/20 (80,0 %) | 14/15 (93,3 %) | 109,1 t/s |

Observaciones sobre los propios numeros del autor: el checkpoint publicado (G-TAP v3 IQ3_XXS) no es el mejor de la tabla en GSM8K (92,0 % frente al 100 % del naive y del Q4_K_M) y empata con el naive en AST Python (85,0 %). El Q4_K_M, pese a ocupar un 50 % mas, obtiene 80,0 % en AST, es decir, peor que ambas variantes de 3,2 bpw segun estos mismos datos. Esa falta de monotonia entre precision y calidad es una senal de que el conjunto de evaluacion es muy pequeno (20 y 25 preguntas), con una resolucion estadistica baja. No se publican resultados de MMLU, HumanEval, MBPP ni de benchmarks multilingues.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 2,90 GiB; con la cache KV en fp16 y contexto moderado (4.096 tokens) cabe esperar un uso total en el entorno de 3,5-4,5 GiB. Las cifras exactas de cache KV no estan documentadas en la informacion proporcionada, por lo que son estimaciones a partir del tamano de pesos.
- GPU del autor: NVIDIA GeForce RTX 4080 Super (la model card indica 32 GB de VRAM, configuracion que no coincide con las especificaciones comerciales habituales de esa tarjeta; se reproduce tal cual aparece).
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 6 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4080, RTX 4090) puede ejecutarlo con `-ngl 99`. Tambien es viable la inferencia parcial en CPU con GPU de gama baja o iGPU.
- GPU de datacenter: A100, H100 o L40S funcionan sin problema, pero estan sobredimensionadas para un modelo de 2,90 GiB; su interes aqui seria el batching masivo, no la capacidad por instancia.
- Despliegue: `llama.cpp` (llama-cli, llama-server), y por compatibilidad de formato, otros runners GGUF como Ollama, LM Studio o text-generation-webui. El soporte de GGUF en vLLM es limitado, por lo que no es la via recomendada.
- Throughput declarado: 138,1 t/s de decodificacion (138,8 t/s en la variante G-TAP v3 IQ3_XXS) en la RTX 4080 Super del autor, frente a 43,3 t/s del control BF16. No se publican datos de prefill, latencia de primer token ni comportamiento con batching concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Huella | Perplejidad (131k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DuoNeural Qwen2.5-Coder-7B-Instruct-CodeInfused IQ3_XXS | 7,61 B | IQ3_XXS (~3,2 bpw) | 2,90 GiB | 2,8264 (declarada) | Apache 2.0 | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen2.5-Coder-7B-Instruct (BF16) | 7,61 B | BF16 | 14,19 GiB | 2,8039 | Apache 2.0 | Modelo oficial de Qwen |
| QuantFactory/Qwen2.5-Coder-7B-Instruct-GGUF | 7,61 B | Varias (llama.cpp estandar) | No disponible | No disponible | Apache 2.0 | Publico en HuggingFace y ModelScope |
| DuoNeural Qwen2.5-7B-Instruct-CodeInfused IQ3_XXS | 7,61 B | IQ3_XXS | No disponible | No disponible | Apache 2.0 | Publico en HuggingFace; variante no-Coder del mismo programa |

Frente a las cuantizaciones GGUF estandar de Qwen2.5-Coder-7B-Instruct, la diferencia declarada de este checkpoint es la preservacion del rendimiento algoritmico por debajo de 4 bits. No hay datos publicos que permitan comparar directamente ambas rutas de cuantizacion con la misma metodologia de evaluacion, y el propio autor no incluye un arm de Q4_K_M estandar de llama.cpp como referencia, solo su propia variante G-TAP.

## Limitaciones y advertencias

- Estado experimental: la model card indica explicitamente "Pending Further Verification / Empirical Validation". Las cifras de perplejidad, GSM8K, AST y velocidad no estan verificadas por terceros.
- Bases de evaluacion muy pequenas: 25 preguntas de GSM8K y 20 pruebas AST son suficientes para detectar colapsos groseros, pero no para estimar con precision diferencias de pocos puntos porcentuales.
- Perdida de calidad en codigo: el autor reconoce un 85,0 % (17/20) en pruebas AST frente al 100 % del control BF16; presumiblemente se degradan mas las tareas de generacion libre de codigo largo, no cubiertas por la evaluacion.
- Riesgo de alucinacion: inherente al modelo base Qwen2.5-Coder-7B-Instruct; la cuantizacion agresiva puede incrementarlo en tareas de razonamiento largo. No hay datos de evaluacion especificos.
- Sesgos: no se aporta ninguna evaluacion de sesgo, toxicidad o sesgo de codigo (por ejemplo, recomendacion de practicas inseguras). No disponible.
- Idiomas: no se documenta el reparto multilingue de este checkpoint; la cuantizacion puede afectar de forma desigual a idiomas con menos representacion en el corpus de calibracion.
- Longitud de contexto: no disponible en la informacion proporcionada; los 131.000 tokens que aparecen en la model card corresponden al conjunto de calibracion y evaluacion de perplejidad, no a una ventana de contexto soportada.
- Licencia: Apache 2.0, lo que permite uso comercial sin restricciones adicionales, siempre que se mantengan los avisos de licencia y atribucion correspondientes a Qwen y a DuoNeural.
- Produccion: dado el estado experimental y la ausencia de descargas y validacion externa, no es recomendable sustituir una cuantizacion estable por este checkpoint en un sistema en produccion sin una evaluacion propia sobre el dominio objetivo.
- Advertencia sobre la model card: contiene referencias a "pruebas de fisica" y a un "cono de luz cognitivo" sin relevancia tecnica demostrable; conviene separar esas afirmaciones de los datos empiricos medibles.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/DuoNeural/Qwen2.5-Coder-7B-Instruct-CodeInfused-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Variante no-Coder del mismo programa de cuantizacion: https://huggingface.co/DuoNeural/Qwen2.5-7B-Instruct-CodeInfused-IQ3_XXS-GGUF
- Repositorio GGUF de DuoNeural para Qwen2.5-Coder-7B-Instruct: https://huggingface.co/DuoNeural/Qwen2.5-Coder-7B-Instruct-GGUF/tree/main
- Ficha descriptiva del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen2.5-coder-7b-instruct-qwen
- Cuantizaciones GGUF de terceros (QuantFactory) en ModelScope: https://www.modelscope.cn/models/QuantFactory/Qwen2.5-Coder-7B-Instruct-GGUF
- GGUF oficial de Qwen2.5-Coder-7B-Instruct en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/summary
