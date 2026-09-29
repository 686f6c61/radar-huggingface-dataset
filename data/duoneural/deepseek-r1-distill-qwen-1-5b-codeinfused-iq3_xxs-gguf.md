# DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-CodeInfused-IQ3_XXS-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicada por DuoNeural (Jesse Caldwell, Archon y Aura) como artefacto experimental de su programa de cuantizacion basado en mecanica estadistica. El modelo base es un transformer denso de 1.777.088.000 parametros derivado de Qwen2.5-1.5B y destilado por DeepSeek para razonamiento con test-time compute. La contribucion del repositorio no es el modelo en si, sino el metodo de cuantizacion: una calibracion de segundo orden denominada G-TAP v3 (etiquetas gtap, tap-dpq, imatrix) construida sobre un Hessiano de activaciones de 131.000 tokens "infundido con codigo".

El resultado principal que declara la model card es un IQ3_XXS de aproximadamente 3,2 bits por peso y 0,72 GiB que, segun sus mediciones, alcanza un 96,0% en GSM8K con chain-of-thought nativo (24 de 25 problemas) y una perplejidad de holdout de 4,7596 sobre 131.000 tokens, frente a 4,3724 del control BF16 sin cuantizar. En la variante Q4_K_M (1,04 GiB) el autor afirma una perplejidad de 4,3641, ligeramente inferior a la del modelo BF16, y el doble de acierto en matematicas de olimpiada (40,0% frente a 20,0%).

La relevancia practica es que permite ejecutar un modelo de razonamiento con modo "thinking" en hardware de consumo con un coste de memoria inferior a 1 GiB, a velocidades de decodificacion declaradas de 317,9 t/s en una RTX 4080 Super. No obstante, se trata de un release marcado explicitamente como experimental y pendiente de verificacion empirica independiente, con tamanos de muestra muy reducidos, por lo que sus cifras deben tratarse como preliminares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base DeepSeek-R1-Distill-Qwen-1.5B, derivada de Qwen2.5-1.5B): 28 capas, GQA 12:2, FFN SwiGLU |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de uso emplean `-c 4096` |
| Tipos de cuantizacion | IQ3_XXS (este repositorio, ~3,2 bpw, 0,72 GiB); la model card menciona ademas Q4_K_M (1,04 GiB), IQ2_M (0,65 GiB) e IQ2_XXS (0,55 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tamano total del repositorio: 0,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso de 28 capas con atencion de consultas agrupadas (GQA) en proporcion 12:2 y red feed-forward con activacion SwiGLU, heredado de Qwen2.5-1.5B y ajustado por DeepSeek mediante destilacion a partir de DeepSeek-R1. El modelo incorpora razonamiento con test-time compute, es decir, genera cadenas de pensamiento internas antes de la respuesta final, activadas por una plantilla de prompt nativa (`<｜begin of sentence｜><｜User｜>{prompt}<｜Assistant｜><think>`).

No se han publicado en la informacion disponible detalles sobre el volumen de tokens de preentrenamiento, composicion del dataset, ni sobre las etapas de RLHF o DPO del modelo base. La innovacion tecnica de este repositorio se limita al proceso de cuantizacion posterior al entrenamiento (PTQ): una calibracion G-TAP v3 con un Hessiano de activaciones de 131.000 tokens "infundido con codigo" (`deepseek_r1_15b_gtap.imatrix`), que el autor describe como "cavity damping" y regularizacion por atractores, y que segun su model card reduce la longitud media de pensamiento de 409,0 a 229,7 tokens manteniendo un 88,0% en GSM8K. Esta descripcion teorica proviene unicamente del autor y no cuenta con validacion externa.

## Capacidades

- Generacion de texto conversacional, con plantilla nativa de DeepSeek-R1 y etiquetas `<｜User｜>` / `<｜Assistant｜>`.
- Razonamiento con cadena de pensamiento nativa (modo thinking via `<think>`), orientado a problemas matematicos paso a paso.
- Resolucion de problemas aritmeticos y de nivel escolar (GSM8K) y, en menor medida, de competicion tipo olimpiada.
- Capacidades de codigo: la calibracion se realizo con un Hessiano "infundido con codigo", aunque no se documentan benchmarks de generacion de codigo.
- Razonamiento multi-paso con test-time compute, con longitudes de pensamiento declaradas entre 125,9 y 1250,9 tokens segun la variante de cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Razonamiento matematico en el borde: con 0,72 GiB de pesos en IQ3_XXS, el modelo puede resolver problemas aritmeticos paso a paso en portatiles, mini-PC o incluso dispositivos con GPU integrada, sin depender de una API externa.
- Tutoria educativa de matematicas: el modo thinking permite mostrar el desarrollo completo de un problema antes de la respuesta final, util para generar explicaciones paso a paso en plataformas de aprendizaje.
- Prototipado rapido de agentes de razonamiento: al caber en memoria de una unica GPU de consumo, sirve para iterar sobre prompts, plantillas y flujos multi-paso antes de escalar a modelos mayores.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica varias variantes (IQ2_XXS, IQ2_M, IQ3_XXS, Q4_K_M con y sin G-TAP), lo que permite estudiar la degradacion de la perplejidad y del razonamiento segun los bits por peso en un mismo modelo base.
- Asistente local con requisitos de privacidad: al ejecutarse con llama.cpp sobre hardware propio, ningun dato del usuario sale de la maquina, adecuado para entornos con restricciones de confidencialidad.
- Generacion de codigo asistida en local: aunque no hay benchmarks especificos, el modelo base esta orientado a tareas tecnicas y el checkpoint se ha calibrado con activaciones de codigo, por lo que puede usarse para autocompletado y explicacion de fragmentos en editores con backend GGUF.
- Despliegue en CI/CD para comprobaciones de razonamiento: con 317,9 t/s declarados en una RTX 4080 Super, es viable ejecutar verificaciones automaticas de pasos logicos en pipelines sin coste de inferencia en la nube.
- Servicio HTTP ligero: `llama-server` expone el modelo en un puerto local con 99 capas descargadas a GPU y atencion flash activada, lo que permite integrarlo como microservicio compatible con endpoints de tipo OpenAI.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (mediciones nativas, test-time compute). Los tamanos de muestra son de 25 problemas en GSM8K y 10 en matematicas de olimpiada.

| Brazo de evaluacion | Huella | Perplejidad continua | GSM8K (CoT) | Pensamiento medio (GSM) | Clausura (GSM) | Olimpiada | Velocidad de decodificacion |
|---|---|---|---|---|---|---|---|
| Arm 0, control BF16 base | 3,32 GiB | 4,3724 | 20/25 (80,0%) | 409,0 tok | 100,0% | 2/10 (20,0%) | 141,8 t/s |
| Arm 1, IQ3_XXS naive | 0,72 GiB | 4,7596 | 24/25 (96,0%) | 308,1 tok | 100,0% | 3/10 (30,0%) | 317,9 t/s |
| Arm 3, GTAP v3 IQ3_XXS | 0,72 GiB | 4,7160 | 22/25 (88,0%) | 229,7 tok | 100,0% | 3/10 (30,0%) | 315,0 t/s |
| Arm 4, GTAP v3 Q4_K_M | 1,04 GiB | 4,3641 | 20/25 (80,0%) | 424,1 tok | 100,0% | 4/10 (40,0%) | 287,3 t/s |
| Arm 5, GTAP v3 IQ2_M | 0,65 GiB | 5,1392 | 19/25 (76,0%) | 238,9 tok | 96,0% | 0/10 (0,0%) | 304,9 t/s |
| Arm 6, GTAP v3 IQ2_XXS | 0,55 GiB | 9,4779 | 10/25 (40,0%) | 1250,9 tok | 8,0% | 2/10 (20,0%) | 326,9 t/s |

No se han publicado resultados de MMLU, HumanEval, MATH ni otros benchmarks estandar en la informacion disponible. Las cifras de latencia y throughput proceden de un unico banco de pruebas declarado como "NVIDIA RTX 4080 Super 32GB" y no han sido replicadas por terceros.

## Requisitos de hardware

- Pesos en disco y en VRAM: 0,72 GiB para IQ3_XXS (este repositorio), 1,04 GiB para Q4_K_M, 0,65 GiB para IQ2_M, 0,55 GiB para IQ2_XXS y 3,32 GiB para el control BF16.
- A titulo orientativo, el modelo completo cabe en cualquier GPU de consumo con 4 GB o mas de VRAM, e incluso en sistemas con memoria unificada o GPU integrada, siempre que se sume el espacio de la cache KV segun el contexto configurado.
- GPU utilizadas en las pruebas del autor: NVIDIA GeForce RTX 4080 Super (32 GB segun la model card). No se documentan pruebas en A100, H100 ni en GPUs de gama de entrada.
- Despliegue documentado: `llama-cli` y `llama-server` de llama.cpp, con flags como `-c 4096`, `-ngl 99`, `-fa on`, `--temp 0.6` y `--top-p 0.95`.
- Otros runners compatibles con GGUF (Ollama, LM Studio, koboldcpp) no estan documentados en la model card, aunque el formato lo permite.
- Rendimiento declarado: 317,9 t/s en IQ3_XXS naive y 315,0 t/s en GTAP v3 IQ3_XXS, frente a 141,8 t/s del BF16, sobre el mismo banco de pruebas. La latencia no se publica.
- Para contexto largo, el consumo de cache KV crece de forma lineal con la ventana configurada; los ejemplos del autor usan 4096 tokens, muy por debajo del contexto tipico de la familia base.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos publicados en la informacion proporcionada. La unica comparacion posible es interna, entre los brazos de cuantizacion del propio autor:

| Variante | Huella | Perplejidad | GSM8K (CoT) | Olimpiada | Velocidad |
|---|---|---|---|---|---|
| Control BF16 (sin cuantizar) | 3,32 GiB | 4,3724 | 80,0% | 20,0% | 141,8 t/s |
| GTAP v3 Q4_K_M | 1,04 GiB | 4,3641 | 80,0% | 40,0% | 287,3 t/s |
| IQ3_XXS naive (este repo) | 0,72 GiB | 4,7596 | 96,0% | 30,0% | 317,9 t/s |
| GTAP v3 IQ3_XXS | 0,72 GiB | 4,7160 | 88,0% | 30,0% | 315,0 t/s |
| GTAP v3 IQ2_M | 0,65 GiB | 5,1392 | 76,0% | 0,0% | 304,9 t/s |
| GTAP v3 IQ2_XXS | 0,55 GiB | 9,4779 | 40,0% | 20,0% | 326,9 t/s |

Comparacion con alternativas de la misma categoria (Qwen2.5-1.5B, Llama-3.2-1B/3B, Gemma-2-2B u otros destilados de R1 en formato GGUF): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Release marcado por el propio autor como experimental y "pendiente de verificacion adicional y validacion empirica"; las cifras no han sido replicadas de forma independiente.
- Tamanos de muestra muy reducidos: 25 problemas para GSM8K y 10 para matematicas de olimpiada. Diferencias de uno o dos aciertos cambian el resultado en 4-8 puntos porcentuales, por lo que el margen de error es amplio.
- Las afirmaciones teoricas ("regularizacion por atractores", "cavity damping", "pruebas fisicas") provienen unicamente de la model card y no cuentan con respaldo en un paper revisado ni en codigo de evaluacion publicado.
- Riesgo de alucinacion: es un modelo de 1,78 B parametros; aunque genere cadenas de pensamiento, su conocimiento factual es limitado y puede producir razonamientos plausibles pero incorrectos.
- Idiomas soportados no declarados: no hay garantia de un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- La cuantizacion agresiva degrada otras tareas: con IQ2_XXS la perplejidad sube a 9,4779 y GSM8K cae al 40,0%, con un 8,0% de clausura, lo que indica que las variantes de muy pocos bits no son aptas para razonamiento fiable.
- Uso comercial: la licencia del artefacto es Apache 2.0, pero conviene verificar la licencia del modelo base DeepSeek-R1-Distill-Qwen-1.5B y las condiciones de uso de los datos de destilacion antes de un despliegue en produccion.
- El repositorio no declara idiomas, contexto, ni plantilla de evaluacion reproducible; los comandos de ejemplo fijan contexto de 4096 tokens y temperatura 0,6.
- La fecha de creacion y actualizacion que consta en el repositorio (2026-09-29) es posterior a la fecha actual de consulta, lo que debe tenerse en cuenta al evaluar la trazabilidad del artefacto.
- Los resultados de busqueda web asociados a esta consulta no contienen material tecnico relacionado con el modelo; se han descartado por completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-CodeInfused-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper, blog, repositorio de codigo o demo: no disponible. Los resultados de la busqueda web no aportaron ningun enlace relevante sobre este modelo o sobre el metodo G-TAP.
