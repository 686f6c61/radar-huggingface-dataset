# netprojects/nemotron-dory1.0-4b-mlx-bf16

## Resumen

Dory 1.0 4B es un modelo de razonamiento de NVIDIA (Nemotron-Labs) publicado el 16 de octubre de 2026, con 3.974.103.040 parámetros. Su rasgo distintivo es que es un *looped language model*: un bloque compartido de capas se ejecuta entre 1 y 4 veces (2 por defecto), de modo que un unico conjunto de pesos ofrece un dial entre velocidad y precision. El modelo razona primero dentro de `<think>...</think>` y despues responde, por lo que las salidas son mas largas que las de un chat model convencional.

La ficha que nos ocupa, `netprojects/nemotron-dory1.0-4b-mlx-bf16`, no es el modelo original sino una conversion a MLX en bf16 sin cuantizacion, publicada por NetProjects (Internet Projects Ltd) el 17 de octubre de 2026 para ejecutar el modelo en Apple Silicon. Ocupa 8,0 GB, usa la libreria `mlx` y requiere el paquete `dory-mlx`, que anade la arquitectura `dory` al runtime de MLX. La conversion esta verificada contra una implementacion independiente en PyTorch fp32 con una coincidencia top-1 del 100 % y una divergencia KL de 0,001 a 0,003.

Es relevante ahora porque permite ejecutar localmente en un Mac un modelo de razonamiento de 4B con contexto largo (verificado con prompts de hasta 24K tokens y medido con 32K) sin depender de CUDA ni de GPUs dedicadas, manteniendo la fidelidad numerica respecto al checkpoint original de NVIDIA. El modelo trabaja exclusivamente en ingles y se distribuye bajo licencia OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloque de capas compartido y reutilizado (looped language model); implementacion MLX con layout fusionado (QKV+gate en una matriz, gate+up del MLP en una matriz) |
| Parametros totales | 3.974.103.040 (3,97B) |
| Parametros activos | No aplicable (no es MoE); el bloque compartido se ejecuta 1 a 4 veces |
| Longitud de contexto | Verificado con prompts de hasta 24K tokens; medido y probado con prompts de 32K tokens |
| Tipos de cuantizacion | Este repo: bf16 sin cuantizacion. Existen builds hermanos en 8-bit (`netprojects/nemotron-dory1.0-4b-mlx-q8`) y NVFP4 (`netprojects/nemotron-dory1.0-4b-mlx-nvfp4`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | OpenMDW-1.1 (misma que el modelo original); codigo de `dory-mlx` bajo Apache-2.0 |
| Formato de pesos | safetensors (MLX, bf16) |
| Tamano del repo | 8,0 GB |
| Libreria / runtime | MLX (Apple Silicon), paquete `dory-mlx` |
| Modelo base | `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16` (revision `208065f`) |
| Temperatura / top_p recomendados | 1,0 / 0,95 |

## Arquitectura y entrenamiento

Dory es un modelo de tipo *looped*: en lugar de apilar un numero fijo de capas distintas, define un bloque compartido que se aplica repetidamente, de 1 a 4 iteraciones, con 2 como valor por defecto. Esto reduce el numero de pesos necesarios para un determinado profundidad efectiva y convierte el numero de loops en un parametro de inferencia que intercambia velocidad por precision. Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada; la model card original de NVIDIA es la referencia para esos detalles.

La conversion de NetProjects mantiene los pesos en bf16 y adopta un layout fusionado (query, key, value y gate en una sola matriz; gate y up del MLP en otra) para acelerar la decodificacion. Los pesos se reconstruyen desde el checkpoint original de NVIDIA mediante `scripts/convert.py` del repositorio `dory-mlx`. La validacion incluye comparacion de logits contra una implementacion fp32 independiente (100 % de coincidencia top-1, KL 0,001-0,003), comparacion del build de 8 bits frente a bf16 (98 % top-1, KL 0,003) y comprobacion de las caches de ventana deslizante (ventana reducida a 64; prefill por chunks y decodificacion token a token frente a una pasada completa) con al menos 98,7 % de coincidencia top-1 y KL maximo de 0,0006. La perplejidad en WikiText-2 (primeros 64K tokens, ventanas de 1.024 tokens) es de 12,17 / 11,76 / 11,69 para 1 / 2 / 4 loops, lo que confirma que mas loops reducen la perplejidad.

## Capacidades

- Generacion de texto en ingles y razonamiento explicito: el modelo produce una cadena de razonamiento dentro de `<think>...</think>` antes de la respuesta final.
- Razonamiento matematico basico y de varios pasos (por ejemplo, productos de dos cifras), segun los ejemplos de uso del autor.
- Modo *thinking* controlable en coste mediante el numero de loops (1 a 4), que actua como dial velocidad/precision.
- Contexto largo: verificado con prompts de hasta 24K tokens y medido con prompts de 32K tokens.
- Conversacional (pipeline `text-generation`, tag `conversational`).
- Ejecucion local en Apple Silicon mediante MLX, con soporte de caches de ventana deslizante y prefill por chunks.
- Generacion por lotes a traves de MLX-LM (propuesta PR 1988): aproximadamente 200 tokens/s agregados con 4 peticiones y 450 tokens/s con 16 (build de 8 bits, 2 loops).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente de razonamiento local en un Mac: ejecutar el modelo con `dory-mlx` en un MacBook Pro con Apple Silicon para tareas de analisis y explicacion paso a paso, aprovechando que el razonamiento queda visible en `<think>` y auditable.
- Analisis de documentos largos en local: con contexto verificado de hasta 24K tokens y medido a 32K, se pueden procesar informes, contratos o hilos completos sin salir de la maquina; a 2 loops el modelo lee un prompt de 32K en unos 15 s y genera a 36 tokens/s en un M5 Max.
- Prototipado rapido de aplicaciones de razonamiento: usar los 4 ajustes de loops para calibrar coste frente a calidad antes de fijar la configuracion de produccion (perplejidad de 12,17 a 1 loop frente a 11,69 a 4 loops).
- Servicio de chat por lotes en Apple Silicon: con MLX-LM y el soporte propuesto en PR 1988, servir varias peticiones concurrentes (aproximadamente 200 tokens/s con 4 peticiones, 450 tokens/s con 16 en el build de 8 bits) para un equipo pequeno o un entorno de demostracion.
- Evaluacion y docencia: comparar directamente el efecto del numero de loops sobre la calidad (perplejidad WikiText-2) y sobre la latencia en un mismo hardware, como material para explicar modelos looped.
- Desarrollo de tooling MLX: servir como referencia para implementar y validar nuevas arquitecturas en MLX, ya que el repositorio incluye script de conversion y verificacion numerica contra PyTorch fp32.
- Inferencia con restricciones de memoria: el build NVFP4 hermano (2,6 GB, aproximadamente 1,4x mas rapido que 8 bits con la misma perplejidad que bf16) permite desplegar el modelo en equipos con menos memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este build. Los unicos datos numericos publicados son de fidelidad y rendimiento de la conversion:

| Prueba | Resultado |
|---|---|
| Logits frente a implementacion PyTorch fp32 independiente (pesos reales, 2 loops, 55 tokens) | top-1 100 %, KL 0,001-0,003 |
| Build 8 bits frente a este bf16 (5 textos cortos, 2 loops) | top-1 98 %, KL 0,003 |
| Perplejidad WikiText-2, loops 1 / 2 / 4 (bf16) | 12,17 / 11,76 / 11,69 |
| Perplejidad WikiText-2, loops 1 / 2 / 4 (8 bits) | 12,18 / 11,77 / 11,70 |
| Caches de ventana deslizante (ventana 64; prefill por chunks y decodificacion token a token frente a pasada completa) | top-1 >= 98,7 %, KL <= 0,0006 |

Rendimiento medido en un MacBook Pro M5 Max (128 GB), 20 de octubre de 2026, medianas de ejecuciones repetidas (dispersion aproximada del 2 %):

| Loops | Generacion, prompt corto | Generacion tras prompt de 32K | Lectura de prompt de 32K | Memoria pico con prompt de 32K |
|---|---|---|---|---|
| 1 | 58 tokens/s | 55 tokens/s | 3.270 tokens/s (10 s) | 11,3 GB |
| 2 | 39 tokens/s | 36 tokens/s | 2.180 tokens/s (15 s) | 12,6 GB |
| 4 | 23 tokens/s | 22 tokens/s | 1.270 tokens/s (26 s) | 15,1 GB |

Con MLX-LM directamente (PR 1988, commit 208065f, mismo M5 Max, 23 de octubre de 2026; bf16, 2 loops, cache por loop, decodificacion greedy, medianas de 3 ejecuciones, limite de cache MLX de 1 GiB, que cuesta aproximadamente 5-7 % de velocidad de lectura del prompt):

| Prompt -> respuesta | Lectura del prompt | Generacion | Memoria pico |
|---|---|---|---|
| 25 -> 512 tokens | 308 tokens/s | 39,0 tokens/s | 8,2 GB |
| 4.096 -> 192 tokens | 3.063 tokens/s | 39,0 tokens/s | 12,6 GB |
| 16.384 -> 192 tokens | 2.550 tokens/s | 37,8 tokens/s | 12,6 GB |
| 32.768 -> 192 tokens | 2.161 tokens/s | 36,0 tokens/s | 12,6 GB |

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con MLX; no hay soporte CUDA documentado para este build.
- Memoria unificada: entre 8,2 GB (prompt de 25 tokens, 2 loops, MLX-LM) y 15,1 GB (prompt de 32K, 4 loops) de pico, segun la configuracion.
- Hardware de referencia del autor: MacBook Pro con M5 Max y 128 GB de memoria unificada.
- Cabe en equipos consumer Apple: si, siempre que la memoria unificada disponible cubra el pico de 8-15 GB; conviene margen sobre esos valores.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable a este build MLX; para CUDA habria que usar el checkpoint original de NVIDIA con vLLM (PR 60149) o llama.cpp.
- Despliegue: paquete `dory-mlx` (CLI `python -m dory_mlx` y API Python `dory_mlx.load` / `dory_mlx.chat`), o MLX-LM con el soporte propuesto en PR 1988 para generacion por lotes.
- Latencia y throughput: 58/39/23 tokens/s de generacion con prompt corto para 1/2/4 loops; lectura de 32K tokens en 10/15/26 s para 1/2/4 loops; aproximadamente 200 tokens/s agregados con 4 peticiones y 450 tokens/s con 16 en el build de 8 bits a 2 loops.
- Alternativas de menor huella: build de 8 bits (mitad del tamano, KL 0,003 frente a bf16) y build NVFP4 (2,6 GB, aproximadamente 1,4x mas rapido que 8 bits, misma perplejidad que bf16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/nemotron-dory1.0-4b-mlx-bf16 (este) | 3,97B | Verificado a 24K; medido a 32K | bf16, safetensors MLX | OpenMDW-1.1 | Hugging Face, requiere `dory-mlx` |
| netprojects/nemotron-dory1.0-4b-mlx-q8 | 3,97B | No disponible | 8 bits, safetensors MLX | OpenMDW-1.1 | Hugging Face |
| netprojects/nemotron-dory1.0-4b-mlx-nvfp4 | 3,97B | No disponible | NVFP4, 2,6 GB | OpenMDW-1.1 | Hugging Face |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | 3,97B | No disponible | bf16, safetensors | OpenMDW-1.1 | Hugging Face (checkpoint original) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Dory 1.0 4B frente a modelos de otros autores de tamano equivalente; esa comparacion queda como no disponible.

## Limitaciones y advertencias

- Solo ingles: la model card declara `language: [en]`; no hay soporte multilingue documentado.
- Las respuestas incluyen la cadena de razonamiento completa, por lo que son mas largas y consumen mas tokens de salida que las de un chat model convencional.
- El contexto largo esta verificado con prompts de hasta 24K tokens; los valores a 32K proceden de mediciones, no de una garantia de calidad sostenida.
- La calidad numerica depende del build: el 8 bits presenta un 98 % de coincidencia top-1 y KL 0,003 frente a bf16, y el NVFP4 prioriza velocidad y memoria.
- El modelo requiere el paquete `dory-mlx` o el soporte de MLX-LM propuesto en PR 1988; no funciona con runtimes MLX genericos sin esa implementacion de la arquitectura `dory`.
- Este build esta limitado a Apple Silicon; para CUDA hay que acudir al checkpoint original de NVIDIA con vLLM o llama.cpp.
- Licencia OpenMDW-1.1: conviene revisar el texto completo en `LICENSE` antes de un uso comercial; el codigo de `dory-mlx` es Apache-2.0, pero los pesos mantienen la licencia del modelo original.
- No hay informacion disponible sobre sesgos, tasas de alucinacion ni datos de entrenamiento, por lo que no se pueden evaluar esos riesgos a partir de esta ficha.
- El proyecto no esta afiliado a NVIDIA; es una conversion de terceros y su soporte depende de NetProjects.
- Con MLX-LM y un limite de cache de 1 GiB se pierde aproximadamente 5-7 % de velocidad de lectura del prompt (la generacion no se ve afectada).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-bf16
- Modelo base original: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Build de 8 bits: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-q8
- Build NVFP4: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-nvfp4
- Repositorio `dory-mlx`: https://github.com/internet-projects/dory-mlx
- MLX: https://github.com/ml-explore/mlx
- Propuesta de soporte Dory en MLX-LM (PR 1988): https://github.com/ml-explore/mlx-lm/pull/1988
- Organizacion NetProjects en Hugging Face: https://huggingface.co/netprojects
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Sitio de NetProjects: https://netprojects.com
- H2O-Lightning-4B en MLX: https://huggingface.co/netprojects/h2o-lightning-4b-mlx-q8
- Articulo sobre H2O-Lightning-4B en Apple Silicon: https://netprojects.com/insights/h2o-lightning-4b-on-apple-silicon-mlx
