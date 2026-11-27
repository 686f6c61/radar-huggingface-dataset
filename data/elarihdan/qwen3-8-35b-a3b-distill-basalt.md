# Elarihdan/Qwen3.8-35B-A3B-Distill-Basalt

## Resumen

Qwen3.8-35B-A3B-Distill-Basalt es un empaquetado en formato Basalt del modelo empero-ai/Qwen3.8-35B-A3B-Distill, un modelo de lenguaje de tipo mezcla de expertos (MoE) de 35.900 millones de parametros totales con aproximadamente 3.000 millones activos por token. El autor del empaquetado es Elarihdan, mientras que el modelo original procede de Empero, construido sobre la base tecnica de la familia Qwen3.6-35B-A3B del equipo Qwen. El repositorio no modifica los pesos del modelo, solo su formato de almacenamiento y cuantizacion.

El modelo original es una destilacion de la arquitectura Qwen3.6-35B-A3B, con 40 capas: 30 basadas en Gated DeltaNet (atencion lineal) y 10 de atencion clasica, con 256 expertos enrutados de los cuales se activan 8 por token. Incorpora una capa de prediccion multi-token (MTP) que se reutiliza como drafter para decodificacion especulativa. Soporta una ventana de contexto de hasta 262.144 tokens.

La relevancia de este empaquetado concreto reside en su formato NVFP4 (expertos enrutados a 4 bits con escalas por bloque E4M3), que permite alojar el modelo completo en una unica GPU Blackwell de 32 GB (por ejemplo, una RTX 5090) con 8 ranuras de 65.000 tokens de contexto, manteniendo una divergencia KL muy baja respecto al modelo BF16 de referencia. Esta orientado a generacion de codigo y despliegue en hardware de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 30 capas Gated DeltaNet (atencion lineal) + 10 capas de atencion; capa MTP para decodificacion especulativa |
| Parametros totales | 35.900 millones (35,9B) |
| Parametros activos | Aproximadamente 3.000 millones por token (256 expertos, 8 activos) |
| Longitud de contexto | Hasta 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), Q8_0 (matrices densas, atencion, Gated DeltaNet y experto compartido), BF16 (router, gate, embeddings, normas), FP8 E4M3 (cabeza de vocabulario); cache KV en int8 o nvfp4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Basalt (fichero unico `Qwen3.8-35B-A3B-Distill-NVFP4.basalt`, 21,1 GiB); GGUF disponible en el repositorio base |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos con 40 capas, combinando 30 capas de Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente) y 10 capas de atencion clasica, con 256 expertos enrutados y 8 activos por token. El modelo incluye una capa de prediccion multi-token (MTP) que actua como drafter para decodificacion especulativa, con una tasa de aceptacion de borradores de aproximadamente el 80 % en tareas de codigo. Esta capa se conserva del modelo base y no se ha reentrenado.

El empaquetado se realizo mediante conversion directa desde los safetensors BF16 con la herramienta `tools/convert/convert.py --checkpoint` del conversor `qwen35moe` de Basalt. Los expertos enrutados se almacenan en NVFP4 con una escala FP32 por matriz y una escala E4M3 por cada 16 valores, elegida por minimo error cuadratico; las matrices de atencion, Gated DeltaNet y experto compartido en Q8_0; el router y el gate del experto compartido en BF16; la cabeza de vocabulario en FP8 E4M3 con escala por fila; y los embeddings y normas en BF16/FP32. No se fusiona ningun LoRA. El proyector de vision se incluye tal como estaba en el modelo base, sin probar. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset del modelo original.

## Capacidades

- Generacion de texto y razonamiento en ingles.
- Generacion y finalizacion de codigo, con buen rendimiento en HumanEval+ y MBPP+ y en un conjunto privado de tareas en Go y TypeScript.
- Modo de razonamiento (thinking mode) activable, que mejora los resultados en codigo a costa de aproximadamente cuatro veces mas tokens (unos 1.380 frente a 330 por tarea).
- Decodificacion especulativa integrada mediante la capa MTP del propio modelo, activada por defecto (ventana de 8).
- Soporte de multiples ranuras concurrentes (hasta 8 ranuras de 65.000 tokens de contexto en 32 GB con cache KV nvfp4).
- Capacidades multimodales potenciales a traves del proyector de vision incluido, aunque no probadas.
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.

## Casos de uso

- Generacion de codigo en produccion sobre hardware de consumo: el modelo alcanza 565 tokens/s en una sola peticion y 1.018 tokens/s agregados con 8 peticiones concurrentes en una RTX 5090, lo que permite servir un asistente de codigo de baja latencia en una unica GPU.
- Autocompletado y finalizacion de codigo en IDE: con una ventana de 65.000 tokens por ranura y 16.800 tokens/s de procesamiento de prompt, puede ingerir ficheros y contexto de repositorio extensos para sugerencias contextualizadas.
- Revision y correccion de codigo en Go y TypeScript: el modelo obtiene 17,5 de 24 tareas en el conjunto privado con thinking activado, adecuado para pipelines de revision automatizada de pull requests.
- Despliegue multiinquilino en una sola tarjeta: las 8 ranuras de 65.000 tokens con cache KV nvfp4 permiten atender a varios usuarios simultaneamente sin paginacion de memoria.
- Experimentacion e investigacion en cuantizacion: el empaquetado NVFP4 con divergencia KL media de 0,0130 respecto a BF16 sirve como referencia para estudiar el impacto de la cuantizacion de 4 bits en modelos MoE.
- Generacion de tests y ejecucion de benchmarks de codigo: con HumanEval+ al 93,3 % y MBPP+ al 78,6 % en modo thinking, es util para generar y validar soluciones ejecutables contra suites de pruebas.
- Prototipado de asistentes tecnicos en ingles: el modelo solo soporta ingles, por lo que encaja en herramientas internas de documentacion tecnica y explicacion de codigo en ese idioma.

## Benchmarks y rendimiento

Rendimiento de inferencia (RTX 5090 32 GB a 450 W, driver 621.01, Windows 11; peticiones de escritura de codigo, temperatura 0,6, top-p 0,95, top-k 20, thinking desactivado, respuestas de 300 tokens):

| Metrica | Basalt NVFP4 | llama.cpp Q4_K_M | llama.cpp Q4_K_M + draft-mtp (3) |
|---|---|---|---|
| Una peticion (tokens/s) | 565 | 275 | 371 |
| Prompt de 5,4k tokens (tokens/s) | 16.800 | 10.200 | 9.400 |
| 8 peticiones simultaneas (tokens/s total) | 1.018 | 746 | 589 |
| 1 / 2 / 4 peticiones simultaneas (tokens/s total) | 544 / 603 / 872 | 266 / n/a / 566 | 336 / n/a / 518 |

Calidad frente al modelo BF16 (wikitext-2, 100 fragmentos de 512 tokens; perplejidad BF16 de referencia 6,6994):

| Variante | Perplejidad | KL media | KL percentil 99 | Acuerdo top-1 |
|---|---|---|---|---|
| Este pack, cache KV int8 | 6,7336 (+0,51 %) | 0,0130 | 0,115 | 94,5 % |
| Este pack, cache KV nvfp4 | 6,7477 (+0,72 %) | 0,0164 | 0,129 | 94,2 % |
| llama.cpp Q4_K_M | 6,8086 (+1,63 %) | 0,0285 | 0,234 | 92,5 % |

Rendimiento en codigo (HumanEval+ 164 problemas, MBPP+ 378 problemas, una muestra, soluciones ejecutadas; conjunto privado de 24 tareas Go/TS):

| Configuracion | 24 tareas Go/TS | HumanEval+ | MBPP+ | llama.cpp Q4_K_M 24 tareas |
|---|---|---|---|---|
| Greedy | 16 | 89,6 | 76,5 | 11 |
| Temp. 0,2, top-p 0,95, top-k 20 | 16,0 | n/a | n/a | 13,75 |
| Temp. 0,6, top-p 0,95, top-k 20 | 15,75 | 89,6 | 74,3 | 14,75 |
| Temp. 0,7, top-p 0,8, top-k 20 | 15,5 | 91,5 | 74,3 | 15,0 |
| Temp. 1,0, top-p 0,95, top-k 20 | 13,25 | n/a | n/a | 12,75 |
| Thinking activado, temp. 0,6 | 17,5 | 93,3 | 78,6 | no ejecutado |

Configuracion recomendada por el autor: temperatura 0,3, top-p 0,95, top-k 20, thinking desactivado para trabajo rapido y activado para problemas dificiles.

## Requisitos de hardware

- GPU NVIDIA Blackwell (sm_120), por ejemplo RTX 5090 de 32 GB; una sola tarjeta.
- CUDA 13.
- Fichero unico de 21,1 GiB; cabe en 32 GB de VRAM con 8 ranuras de 65.000 tokens usando cache KV nvfp4.
- La cache KV int8 en esa configuracion requiere unos 31 GiB y empieza a paginar.
- Motor de inferencia: Basalt (rama `qwen35moe`, no incluida aun en la rama principal), compilado con `-DBASALT_MODELS=qwen4exp;qwen35;qwen35moe`.
- Alternativa: llama.cpp con el GGUF Q4_K_M del repositorio base (8 ranuras de 32k, flash attention, una tarjeta).
- Latencia y throughput: 565 tokens/s en una peticion, 16.800 tokens/s de prompt, 1.018 tokens/s con 8 peticiones concurrentes (Basalt); sin drafting, 324 tokens/s en una peticion.
- No es compatible con GPU sin soporte sm_120 ni con despliegues en CPU documentados.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / hardware |
|---|---|---|---|---|---|
| Este modelo (Basalt NVFP4) | 35,9B | ~3B | 262.144 | Apache-2.0 | Basalt, GPU Blackwell 32 GB |
| empero-ai/Qwen3.8-35B-A3B-Distill (BF16) | 35,9B | ~3B | 262.144 | Apache-2.0 | Safetensors, requiere mas VRAM |
| empero-ai/Qwen3.8-35B-A3B-Distill-GGUF (Q4_K_M) | 35,9B | ~3B | 262.144 | Apache-2.0 | GGUF, llama.cpp |
| Qwen/Qwen3.6-35B-A3B (base de la familia) | 35B | ~3B | no disponible | Apache-2.0 | Safetensors |

En rendimiento medido, este pack supera al GGUF Q4_K_M en velocidad (565 frente a 275 tokens/s en una peticion) y en calidad (perplejidad +0,51 % frente a +1,63 %; KL media 0,0130 frente a 0,0285). No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoria distintos de los citados.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta soporte multilingue.
- Requiere hardware muy especifico: GPU Blackwell sm_120 y CUDA 13; no funciona en generaciones anteriores.
- El soporte `qwen35moe` de Basalt no esta en la rama principal del motor; hay que compilar una rama concreta, lo que anade riesgo de mantenimiento.
- La decodificacion greedy produce bucles ocasionales; se recomienda temperatura baja pero no nula.
- El modo thinking multiplica por cuatro el consumo de tokens, con el coste asociado.
- El proyector de vision se incluye pero no se ha probado; las capacidades multimodales no estan validadas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones especificas de sesgo.
- La licencia Apache-2.0 permite uso comercial, pero el empaquetado depende de un motor (Basalt, licencia MIT) y de una rama no principal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria.
- El conjunto de 24 tareas Go/TS es privado y varia en unas dos tareas entre ejecuciones; diferencias menores son ruido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Elarihdan/Qwen3.8-35B-A3B-Distill-Basalt
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- GGUF del modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF
- Modelo de referencia de la familia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor Basalt: https://github.com/jesdga95/basalt
- Rama con soporte qwen35moe: https://github.com/Icehunter/basalt
- Documentacion de calidad de Basalt: https://github.com/jesdga95/basalt/blob/main/docs/precision/quality.md
- EvalPlus: https://github.com/evalplus/evalplus
