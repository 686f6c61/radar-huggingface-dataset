# DRUPEs/CherryPit-1.1-2B-WebDev-Preview-1024-GGUF

## Resumen

CherryPit-1.1-2B-WebDev-Preview es un modelo de lenguaje pequeño (SLM) especializado en desarrollo web, entrenado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems) sobre la base de openbmb/MiniCPM5-2B. Se trata de una versión preliminar (checkpoint 1024, del 24 de octubre de 2026) cuyo objetivo es resolver un problema concreto: generar componentes de React que pasen tests dados, una tarea en la que mejora drásticamente a su predecesor CherryPit-1.0 (de 1,6 a 80,1 en el benchmark WebApp1K).

El modelo mantiene un rendimiento de propósito general competitivo para su tamaño en código Python (MBPP+, HumanEval+) y matemáticas (MATH-500), de modo que la especialización en web no degrada sus capacidades generales. Con unos 2,5 mil millones de parámetros y distribución en formato GGUF cuantizado (Q4_K_M, 1,56 GB), está pensado para ejecutarse en local, en portátiles y equipos de consumo, mediante Ollama, LM Studio o llama.cpp.

Su relevancia reside en la tendencia actual hacia modelos pequeños on-device: un modelo de 2B capaz de escribir componentes de React a partir de tests puede integrarse en flujos de desarrollo frontend sin depender de APIs en la nube, con latencia baja y coste cero por token. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal de lenguaje (transformer, basado en MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no disponible (no se indica arquitectura MoE; se asume densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (más cuantizaciones previstas para la versión final 1.1) |
| Idiomas soportados | Ingles (las evaluaciones se realizaron en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix) |

## Arquitectura y entrenamiento

CherryPit-1.1 se construye sobre MiniCPM5-2B de OpenBMB, un modelo causal de lenguaje de aproximadamente 2B de parametros. La ficha oficial no detalla la estructura interna (numero de capas, dimension de embedding, GQA, etc.) ni el metodo exacto de ajuste fino (SFT, RLHF, DPO), aunque el salto en WebApp1K sugiere un entrenamiento dirigido a generacion de codigo React guiado por tests. El nombre del repo incluye el sufijo "1024", correspondiente al checkpoint 1024 usado para esta version preliminar.

La distribucion se realiza en formato GGUF con cuantizacion por matriz de importancia (imatrix), lo que reduce el tamaño a 1,56 GB en Q4_K_M y permite inferencia eficiente en CPU y GPU de consumo a traves de llama.cpp. No se ha publicado informacion sobre el dataset de entrenamiento ni el numero de tokens de ajuste fino.

## Capacidades

- Generacion de componentes de React a partir de un conjunto de tests, su capacidad destacada (80,1 en WebApp1K).
- Generacion de codigo Python: funciones que resuelven problemas de programacion (MBPP+ 68,2, HumanEval+ 84,2).
- Resolucion de problemas algoritmicos (LiveCodeBench 31,6).
- Razonamiento y resolucion de matematicas de nivel competicion (MATH-500 80,4).
- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento (tag reasoning en la model card), aunque sin detalles publicos sobre modo thinking.
- Ejecucion on-device gracias al formato GGUF y su tamaño reducido.

No hay informacion sobre soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Generacion de componentes React guiada por tests (TDD asistido): dado un fichero de tests, el modelo escribe el componente que los pasa; es su caso de uso principal y donde muestra la mayor mejora respecto a la version 1.0.
- Prototipado rapido de interfaces en local: al caber en 1,56 GB cuantizado, un desarrollador puede generar y refinar UI en su portatil sin conexion ni coste de API.
- Autocompletado y generacion de codigo Python en editores: su nivel en MBPP+ y HumanEval+ lo hace util como asistente de codigo ligero integrado en el IDE.
- Resolucion de ejercicios de matematicas y algoritmia: util como tutor o verificador de soluciones en entornos educativos con hardware limitado.
- Integracion en pipelines de CI para propuestas de implementacion: puede generar candidatos de componentes que luego se validan con la suite de tests automatizada, descartando los que no pasan.
- Asistentes de codigo embebidos en aplicaciones: su tamaño y licencia Apache 2.0 permiten redistribuirlo dentro de productos comerciales que ejecutan inferencia en el dispositivo del usuario.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando con CherryPit-1.0 bajo la misma configuracion de evaluacion:

| Benchmark | Tarea | CherryPit-1.0 | 1.1 WebDev Preview | Δ |
|---|---|---:|---:|---:|
| WebApp1K | Componentes React a partir de tests | 1,6 | 80,1 | +78,5 |
| MBPP+ | Funciones Python | 64,5 | 68,2 | +3,7 |
| LiveCodeBench | Problemas algoritmicos | 31,7 | 31,6 | −0,1 |
| HumanEval+ | Funciones Python | 85,4 | 84,2 | −1,2 |
| MATH-500 | Matematicas de competicion | 78,0 | 80,4 | +2,4 |

No se han publicado comparaciones directas con otros modelos de la misma categoria en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: unos 1,6 GB para el peso Q4_K_M, mas overhead de contexto; ejecutable con holgura en equipos con 8 GB de RAM.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPUs de consumo (RTX 3060, RTX 4060 o superiores) la inferencia sera muy rapida dada la cuantizacion de 4 bits.
- Consumer GPUs: cabe sobradamente en cualquier GPU moderna con 4 GB de VRAM o mas; tambien es viable completamente en CPU mediante llama.cpp.
- Despliegue: Ollama (`ollama run hf.co/DRUPEs/CherryPit-1.1-2B-WebDev-Preview-1024-GGUF:Q4_K_M`), LM Studio (pestaña Discover) y llama.cpp (`llama-cli -hf DRUPEs/CherryPit-1.1-2B-WebDev-Preview-1024-GGUF:Q4_K_M`).
- Latencia y throughput: no disponible; por tamaño y cuantizacion se espera respuesta rapida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

Comparativa orientativa con modelos pequeños de codigo; los datos de CherryPit provienen de su model card y los de las alternativas de sus fichas publicas, no de una evaluacion conjunta:

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| CherryPit-1.1-2B-WebDev-Preview | ~2,5B | Codigo web (React), codigo general, matematicas | Apache 2.0 | GGUF |
| Qwen2.5-Coder-1.5B/3B | 1,5B / 3B | Codigo general multilenguaje | Qwen Research (uso comercial sujeto a condiciones en algunas variantes) / Apache 2.0 (algunas) | safetensors, GGUF |
| StarCoder2-3B | 3B | Codigo general (The Stack v2) | BigCode OpenRAIL-M | safetensors, GGUF |

CherryPit se diferencia por su enfoque especifico en generacion de componentes React validados por tests, una tarea donde los modelos genericos de tamaño similar rinden notablemente peor segun el autor. En codigo general, Qwen2.5-Coder suele liderar la categoria de modelos pequenos, pero no se dispone de una comparacion directa en la informacion disponible.

## Limitaciones y advertencias

- Es una version preview: los pesos y resultados pueden cambiar antes del lanzamiento final de CherryPit-1.1.
- La mejora principal se concentra en React y desarrollo web; en codigo general rinde igual o ligeramente peor que la 1.0 (HumanEval+ baja 1,2 puntos, LiveCodeBench 0,1).
- Al ser un modelo de 2B, comete errores factuales y genera codigo con bugs; es imprescindible revisar su salida antes de usarla en produccion.
- Entrenado y evaluado en ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Longitud de contexto no documentada en esta ficha; el sufijo "1024" del nombre podria referirse al checkpoint y no a la ventana de contexto, pero no hay confirmacion.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene atribuir segun los terminos de la licencia.
- Solo hay una cuantizacion disponible (Q4_K_M); otras llegaran con la version final.
- Los benchmarks fueron publicados por el propio autor y no estan verificados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DRUPEs/CherryPit-1.1-2B-WebDev-Preview-1024-GGUF
- Version anterior (CherryPit-1.0-2B-GGUF): https://huggingface.co/DRUPEs/CherryPit-1.0-2B-GGUF
- Modelo base (MiniCPM5-2B): https://huggingface.co/openbmb/MiniCPM5-2B
- Paper, blog o demo: no disponible
