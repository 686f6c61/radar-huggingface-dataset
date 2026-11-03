# emkey1/Gemma-4-12B-Aether

## Resumen

Gemma-4-12B-Aether es un ajuste fino por LoRA del modelo google/gemma-4-12B-it, desarrollado por el usuario emkey1 y publicado en HuggingFace. Su proposito concreto es generar programas en Aether, un lenguaje de programacion pequeno, de tipado estatico, con efectos explicitos (`fx { }`), contratos (`@pre`/`@post`), registros con metodos, arrays bidimensionales, mapas (`Map[Text, T]`) y una API integrada de JSON/TOON. Como Aether es un lenguaje nuevo, los modelos generalistas no lo conocen; este ajuste incorpora ese conocimiento directamente en los pesos, eliminando la necesidad de incluir una guia de aproximadamente 14.000 tokens en cada prompt.

El modelo cuenta con 11.959.730.224 parametros (aproximadamente 12B) en una arquitectura densa derivada de Gemma 4, y se distribuye en formato safetensors bf16 con un tamano de repositorio de 24 GB. La model card indica que a 8 bits ocupa unos 12 GB, lo que lo convierte en el miembro mas pequeno de la familia Aether del autor, que incluye tambien variantes basadas en Qwen3.6-35B-A3B y Qwen3.8-27B.

Es relevante ahora porque demuestra un caso de especializacion extrema: un modelo denso de 12B que supera ampliamente a su base sin guia en las suites principales (67 de 73 tareas frente a 0 de 73 del base sin guia) y se aproxima al rendimiento del base con guia completa, con un coste de memoria y latencia mucho menor en el prompt. La contrapartida es que el ajuste degrada notablemente su capacidad en otros lenguajes como Python, por lo que el autor lo presenta explicitamente como un especialista de un solo dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4, tag `gemma4_unified`); sin datos adicionales de capas o atencion |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32K tokens (mencionado en las pruebas de memoria del autor); no se especifica el maximo oficial |
| Tipos de cuantizacion | bf16, int8 (q8_0), nvfp4, mxfp4; el autor desaconseja bajar de 8 bits |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); el autor menciona despliegue via Ollama con `q8_0` |
| Modelo base | google/gemma-4-12B-it |
| Tipo de ajuste | LoRA fusionado en los pesos base (bf16) |
| Repositorio asociado | emkey1/Gemma-4-12B-Aether-LoRA (adaptador) |
| Tamano del repositorio | 24,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 12B parametros, derivado de google/gemma-4-12B-it mediante un ajuste LoRA posteriormente fusionado en los pesos base. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO; unicamente indica que se libera el ultimo paso de tres epocas de entrenamiento y que se entreno con una sola semilla (el autor senala que reentrenar la familia produce variaciones de aproximadamente 9 de 126 primeros intentos, por lo que diferencias de pocas tareas no son significativas).

La innovacion tecnica central no esta en la arquitectura sino en el objetivo del ajuste: internalizar en los pesos el conocimiento de Aether que de otro modo requeriria una guia de unos 14.000 tokens en el prompt. El modelo soporta el pipeline `image-text-to-text` segun los tags de HuggingFace, aunque la model card se centra exclusivamente en la generacion de codigo Aether. El autor documenta tambien el uso de rondas de reparacion (hasta dos), en las que el modelo recibe el diagnostico del compilador y la salida observada para corregir el programa, y evalua con el compilador de la version 1.0 de Aether (version de lenguaje 2026-10-30-1), temperatura 0, semilla 42 y una muestra por tarea.

## Capacidades

- Generacion de programas en Aether: lenguaje de tipado estatico con efectos explicitos (`fx { }`), contratos `@pre`/`@post`, registros con metodos, arrays y arrays bidimensionales, mapas `Map[Text, T]` y API integrada de JSON/TOON.
- Generacion de codigo sin guia en el prompt: el conocimiento del lenguaje reside en los pesos, lo que reduce drasticamente el coste en tokens de entrada.
- Reparacion iterativa de codigo: el modelo aprovecha diagnosticos del compilador y salidas observadas para corregir programas en rondas sucesivas.
- Procesamiento de datos TOON: una de las suites de evaluacion se centra en el procesamiento de datos TOON, con 13 de 14 tareas resueltas en primer intento en bf16.
- Generacion de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Capacidad multimodal declarada: el tag `image-text-to-text` sugiere soporte de entrada imagen-texto heredado del base, aunque no se documenta su uso en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; las rondas de reparacion con feedback del compilador constituyen un bucle iterativo limitado.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Generacion de codigo Aether en produccion: el modelo escribe programas en Aether sin necesidad de incluir la guia de 14K tokens, lo que reduce el coste por peticion y la latencia de prefill en pipelines automatizados de generacion de codigo para este lenguaje.
- Migracion o traduccion de especificaciones a Aether: dado su rendimiento en la suite de especificacion (6 de 12 tareas en primer intento, 6 tras reparacion en bf16), puede emplearse para convertir descripciones de comportamiento en programas Aether con contratos `@pre`/`@post`.
- Procesamiento de datos TOON: con 13 de 14 tareas resueltas en primer intento en la suite de procesamiento de datos TOON, es adecuado para tareas de transformacion y manipulacion de este formato mediante la API integrada del lenguaje.
- Reparacion automatica de codigo con feedback del compilador: integrado en un bucle que ejecute el compilador de Aether y devuelva el diagnostico al modelo, puede corregir programas fallidos; el autor documenta hasta dos rondas de reparacion en su evaluacion.
- Entornos con memoria limitada: a int8 ocupa unos 12 GB y el autor reporta 15 GB cargados y 21 GB al final de una pasada de evaluacion con contexto de 32K en un Mac de mayor capacidad, por lo que es una opcion para equipos donde las variantes de 35B o 27B no caben.
- Generacion de algoritmos en Aether: la suite de algoritmos muestra 18 de 19 tareas resueltas en primer intento en bf16 e int8, lo que lo hace util para implementar rutinas algoritmicas en este lenguaje.
- Desarrollo asistido de la propia biblioteca Aether: util para equipos que trabajan con el lenguaje y necesitan generar ejemplos, tests o programas de referencia sin depender de prompts largos.

## Benchmarks y rendimiento

Resultados de la model card del autor. Todas las puntuaciones sin guia en el prompt, temperatura 0, semilla 42, una muestra por tarea y hasta dos rondas de reparacion. Formato: primer intento (tras reparacion).

| Suite | Tareas | Base sin guia | Este modelo bf16 | Este modelo int8 | Base + guia 14K |
|---|---:|---:|---:|---:|---:|
| core | 35 | 0 (3) | 33 (34) | 33 (34) | 29 (35) |
| hard: procesamiento de datos TOON | 14 | 0 (0) | 13 (13) | 12 (14) | 3 (11) |
| hard: otros | 5 | 0 (0) | 3 (4) | 2 (4) | 2 (4) |
| algoritmos | 19 | 0 (1) | 18 (18) | 18 (18) | 14 (17) |
| **total principal** | **73** | **0 (4)** | **67 (69), 92%** | **65 (70), 89%** | **48 (67)** |
| held-out: superficie | 15 | 0 (0) | 10 (13) | 10 (13) | 10 (13) |
| held-out: algoritmico | 14 | 0 (0) | 8 (10) | 9 (11) | 6 (11) |
| held-out: especificacion | 12 | 0 (0) | 6 (6) | 5 (6) | 6 (8) |
| held-out: TOON / memory streams | 12 | 0 (0) | 6 (7) | 4 (6) | 4 (9) |
| **total held-out** | **53** | **0 (0)** | **30 (36), 57%** | **28 (36), 53%** | **26 (41)** |

Comparativa con cuantizaciones de 4 bits (primer intento, tras reparacion):

| Cuantizacion | Tamano | Principal (73) | Held-out (53) |
|---|---:|---|---|
| bf16 | 24 GB (repo) | 67 (69) | 30 (36) |
| int8 | ~12 GB | 65 (70) | 28 (36) |
| nvfp4 | 8,0 GB | 58 (65) | 21 (26) |
| mxfp4 | 7,7 GB | 55 (59) | 22 (28) |
| nvfp4 con activaciones 4-bit en vLLM | 8,25 GB | 53 (60) | 16 (23) |

Comparativa con los hermanos mayores de la familia (primer intento, tras reparacion, sin guia):

| Modelo | Tamano en disco | Principal (73) | Held-out (53) | Generacion en el mismo Mac |
|---|---:|---|---:|---:|
| Este modelo, int8 | 12 GB | 65 (70) | 28 (36) | 20 tok/s |
| Qwen3.6-35B-A3B-Aether, mxfp4 | 20,9 GB | 64 (68) | 33 (40) | 85 tok/s |
| Qwen3.6-35B-A3B-Aether, int8 | 39,1 GB | 65 (70) | 36 (44) | no medido |
| Qwen3.6-35B-A3B-Aether, bf16 | 67 GB | 65 (70) | 39 (47) | no medido |

Notas del autor: int8 pierde solo 8 de 126 primeros intentos frente a bf16 (2 ganados, 6 perdidos); 4 bits degrada sustancialmente el rendimiento; en bf16, de los fallos en primer intento, 14 son diagnosticos del compilador, 7 codigos de retorno incorrectos y 8 salidas erroneas. Una comparacion previa separada midio 38,8 frente a 217 tok/s (5,6 veces) entre este modelo y el hermano MoE.

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GB para bf16 (tamano del repositorio), unos 12 GB a int8, 8,0 GB a nvfp4 y 7,7 GB a mxfp4.
- Memoria observada: Ollama reporto 15 GB cargados y 21 GB al final de una pasada completa de evaluacion con contexto de 32K en un Mac de mayor capacidad; el autor indica que ni este modelo ni el hermano mxfp4 se han ejecutado en una maquina de 32 GB.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. El autor menciona ejecucion en Mac y en un host con una GPU para la variante nvfp4 con activaciones de 4 bits en vLLM (unas 3 veces la velocidad de 16 bits en ese host).
- Cabe en GPU de consumo: no confirmado en la informacion proporcionada; a int8 (~12 GB) seria viable en GPUs con 16 GB o mas, pero el autor no lo verifica.
- Opciones de despliegue: transformers (libreria declarada), Ollama (usado por el autor con `q8_0`) y vLLM (mencionado para nvfp4 con activaciones de 4 bits). llama.cpp y TGI no se mencionan.
- Throughput: 20 tok/s a int8 en un Mac ocupado; el autor advierte que las cifras absolutas no son fiables por la carga del sistema y que debe usarse la relacion (el hermano MoE mxfp4 alcanzo 85 tok/s en la misma sesion, y en una medicion anterior 217 frente a 38,8 tok/s). La diferencia se atribuye a la arquitectura densa, que lee todos los pesos por token, frente al MoE, que lee aproximadamente un cuarto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento documentado |
|---|---|---|---|---|---|
| Gemma-4-12B-Aether | ~12B denso | 32K (observado) | Apache 2.0 | Especialista en Aether | 67 (69) principal, 30 (36) held-out en bf16 |
| google/gemma-4-12B-it (base) | ~12B denso | no disponible | no disponible en esta ficha | Generalista | 0 (4) principal sin guia; 48 (67) con guia de 14K |
| Qwen3.6-35B-A3B-Aether | 35B totales, 3B activos (MoE) | no disponible | no disponible en esta ficha | Especialista en Aether | 65 (70) principal y 39 (47) held-out en bf16; 64 (68) y 33 (40) en mxfp4 |
| Qwen3.8-27B-Aether | 27B | no disponible | no disponible en esta ficha | Especialista en Aether | no disponible en la informacion proporcionada |

El modelo se posiciona como la opcion de menor huella de la familia Aether: iguala al hermano MoE de 35B en la suite principal en int8 (65 frente a 64 en mxfp4) pero queda por detras en held-out (28 frente a 33) y es entre 4 y 6 veces mas lento en generacion por su naturaleza densa.

## Limitaciones y advertencias

- Especializacion extrema: el autor advierte explicitamente que el ajuste escribe Python mucho peor y probablemente peor codigo en otros lenguajes; para cualquier tarea que no sea Aether debe usarse el modelo base.
- Solo ingles declarado; no hay soporte multilingue documentado.
- Cuantizacion: no bajar de 8 bits. nvfp4 y mxfp4 pierden entre 5 y 19 tareas en primer intento frente a int8 en la suite principal, y entre 6 y 22 en held-out.
- Alucinacion y correccion: de los fallos en primer intento en bf16, 8 son salidas erroneas sin diagnostico de compilador, por lo que una ronda de reparacion no puede corregirlas; el autor recomienda usar el compilador y tests propios.
- Rendimiento en held-out: solo 30 de 53 tareas (57%) en bf16 y 28 de 53 (53%) en int8, lo que indica que las ganancias no se generalizan por completo mas alla de las tareas contra las que se desarrollo el dataset.
- Variabilidad de entrenamiento: con una sola semilla, reentrenar la familia cambia aproximadamente 9 de 126 primeros intentos, por lo que diferencias pequenas entre modelos no son concluyentes.
- Memoria: no verificado en maquinas de 32 GB; el consumo observado llega a 21 GB en una pasada con contexto de 32K.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base google/gemma-4-12B-it, cuyos terminos no se detallan en la informacion proporcionada.
- Popularidad: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Fecha de creacion registrada: 2026-11-03, coherente con la version de lenguaje Aether 2026-10-30-1 citada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emkey1/Gemma-4-12B-Aether
- Adaptador LoRA: https://huggingface.co/emkey1/Gemma-4-12B-Aether-LoRA
- Hermano Qwen3.6-35B-A3B-Aether: https://huggingface.co/emkey1/Qwen3.6-35B-A3B-Aether
- Hermano Qwen3.8-27B-Aether: https://huggingface.co/emkey1/Qwen3.8-27B-Aether
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio del lenguaje Aether: https://github.com/emkey1/aether
