# emkey1/Gemma-4-12B-Aether-LoRA

## Resumen

Gemma-4-12B-Aether-LoRA es un adaptador LoRA de PEFT publicado por el usuario emkey1 sobre el modelo base google/gemma-4-12B-it. Su proposito es especializar un modelo general en la generacion de programas escritos en Aether, un lenguaje de programacion pequeno, de tipado estatico y con efectos explicitos (`fx { }`), contratos (`@pre` / `@post`), registros con metodos, arrays bidimensionales, mapas (`Map[Text, T]`) y una API integrada de JSON/TOON. Como Aether es un lenguaje nuevo, los modelos generales no lo conocen; este fine-tune internaliza en los pesos el conocimiento que de otro modo requeriria un prompt de aproximadamente 14K tokens.

El adaptador se distribuye bajo licencia Apache 2.0, ocupa 0.6 GB en el repositorio y esta pensado para cargarse junto al modelo base Gemma-4-12B-it. Segun la model card, a 8 bits el modelo completo ocupa unos 12 GB y es el miembro mas pequeno de la familia Aether del autor, que incluye tambien variantes sobre Qwen3.6-35B-A3B y Qwen3.8-27B. La relevancia actual radica en que demuestra una via practica para dotar a un modelo denso de tamano medio de competencia en un lenguaje de dominio especifico sin necesidad de guias extensas en el prompt.

Es importante subrayar que se trata de un especialista: el autor advierte explicitamente que el modelo fine-tuneado escribe Python mucho peor que el base y probablemente peor codigo en otros lenguajes, por lo que para cualquier tarea que no sea Aether debe usarse el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso google/gemma-4-12B-it |
| Parametros totales | no disponible (adaptador LoRA; el base es de 12B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens mencionados en las pruebas de memoria de la model card |
| Tipos de cuantizacion | bf16, int8, nvfp4, mxfp4 (probados por el autor); GGUF via Ollama (`q8_0` en el base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA entrenado sobre google/gemma-4-12B-it, un transformer denso de 12B parametros. No se dispone de detalles sobre el rango del adaptador, los modulos objetivo ni los hiperparametros de entrenamiento en la informacion proporcionada. El autor indica que se libera el ultimo paso de tres epocas, y que este supero al final de la epoca 2 en las cuatro metricas principales (67 frente a 64 en main y 30 frente a 36 en held-out tras reparacion).

El entrenamiento se orienta a que el modelo escriba programas Aether sin guia en el prompt. Los datos de entrenamiento no se detallan, pero la model card menciona que las suites held-out nunca se usaron para escribir datos de entrenamiento ni para minar fallos, lo que sugiere un proceso de curacion de datos a partir de fallos del modelo base con la guia de 14K tokens. No se menciona RLHF ni DPO. La evaluacion se realizo con el compilador de la version 1.0 de Aether (version de lenguaje 2026-10-30-1), temperatura 0, semilla 42, una muestra por tarea y hasta dos rondas de reparacion en las que el modelo ve el diagnostico del compilador y la salida observada.

## Capacidades

- Generacion de programas en el lenguaje Aether: efectos explicitos, contratos, registros con metodos, arrays y arrays 2D, mapas y API JSON/TOON.
- Procesamiento de datos TOON (una suite especifica de tareas dificiles).
- Razonamiento algoritmico aplicado a la sintaxis y semantica de Aether.
- Reparacion iterativa de codigo a partir de diagnosticos del compilador.
- Generacion de texto conversacional (pipeline text-generation).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de programas Aether en produccion sin prompt de guia: el modelo produce codigo Aether directamente, eliminando la necesidad de inyectar un prompt de aproximadamente 14K tokens en cada peticion, lo que reduce coste y latencia en pipelines de generacion de codigo.
- Reparacion automatica de codigo Aether: integrado en un bucle que recibe el diagnostico del compilador Aether 1.0, el modelo corrige errores de compilacion; en las pruebas, 14 de los fallos en primer intento en bf16 fueron diagnosticos del compilador, que son reparables con esta estrategia.
- Procesamiento de datos TOON: la suite hard de TOON data processing alcanzo 13 de 14 tareas en primer intento con bf16, lo que lo hace adecuado para tareas de transformacion y serializacion de datos en este formato.
- Generacion de algoritmos en Aether: la suite de algoritmos obtuvo 18 de 19 en primer intento con bf16, por lo que puede emplearse para generar implementaciones algoritmicas en este lenguaje.
- Despliegue en hardware limitado: a 8 bits ocupa unos 12 GB y puede ejecutarse en una Mac con Ollama, con un rendimiento de aproximadamente 20 tok/s en el mismo equipo donde el hermano MoE de 35B alcanza 85 tok/s; util cuando el modelo mayor no cabe en memoria.
- Evaluacion y desarrollo del propio lenguaje Aether: sirve como generador de referencia para probar el compilador, las suites de conformidad y las herramientas del ecosistema Aether.
- Asistencia a desarrolladores que aprenden Aether: el modelo puede generar ejemplos y programas de referencia en un lenguaje del que no hay documentacion abundante en los datos de entrenamiento de los modelos generales.

## Benchmarks y rendimiento

Resultados de la model card. Todas las puntuaciones sin guia en el prompt, temperatura 0, semilla 42, una muestra por tarea y hasta dos rondas de reparacion. Formato: primer intento (tras reparacion).

| Suite | Tareas | Base sin guia | Este modelo bf16 | Este modelo int8 | Base + guia 14K |
|---|---:|---:|---:|---:|---:|
| core | 35 | 0 (3) | 33 (34) | 33 (34) | 29 (35) |
| hard: TOON data processing | 14 | 0 (0) | 13 (13) | 12 (14) | 3 (11) |
| hard: other | 5 | 0 (0) | 3 (4) | 2 (4) | 2 (4) |
| algorithms | 19 | 0 (1) | 18 (18) | 18 (18) | 14 (17) |
| **main total** | **73** | **0 (4)** | **67 (69), 92%** | **65 (70), 89%** | **48 (67)** |
| held-out: surface | 15 | 0 (0) | 10 (13) | 10 (13) | 10 (13) |
| held-out: algorithmic | 14 | 0 (0) | 8 (10) | 9 (11) | 6 (11) |
| held-out: specification | 12 | 0 (0) | 6 (6) | 5 (6) | 6 (8) |
| held-out: TOON / memory streams | 12 | 0 (0) | 6 (7) | 4 (6) | 4 (9) |
| **held-out total** | **53** | **0 (0)** | **30 (36), 57%** | **28 (36), 53%** | **26 (41)** |

Comparativa con los hermanos mayores de la familia (primer intento, tras reparacion, sin guia; tamanos en disco):

| Modelo | Tamano | main (73) | held-out (53) | Generacion en la misma Mac |
|---|---:|---|---|---:|
| Este modelo, int8 | 12 GB | 65 (70) | 28 (36) | 20 tok/s |
| Qwen3.6-35B-A3B-Aether, mxfp4 | 20.9 GB | 64 (68) | 33 (40) | 85 tok/s |
| Qwen3.6-35B-A3B-Aether, int8 | 39.1 GB | 65 (70) | 36 (44) | no medido |
| Qwen3.6-35B-A3B-Aether, bf16 | 67 GB | 65 (70) | 39 (47) | no medido |

Notas del autor: a 4 bits el rendimiento cae de forma notable (nvfp4, 8.0 GB: 58 (65) en main y 21 (26) en held-out; mxfp4, 7.7 GB: 55 (59) y 22 (28)), por lo que recomienda no bajar de 8 bits. Las diferencias de pocas tareas entre filas no son significativas dado que un reentrenamiento de la familia cambio unas 9 de 126 primeras tentativas.

## Requisitos de hardware

- VRAM estimada: unos 12 GB a 8 bits (int8); 8.0 GB en nvfp4 y 7.7 GB en mxfp4, aunque con perdida de calidad; en bf16 el base de 12B requiere aproximadamente 24 GB, cifra no confirmada en la informacion disponible.
- Memoria observada: Ollama reporto 15 GB cargados y 21 GB al final de una pasada completa de evaluacion con contexto de 32K en una Mac de mayor capacidad.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; el autor reporta ejecuciones en Mac (Ollama) y en un host con una GPU para vLLM con NVFP4 y activaciones de 4 bits (8.25 GB, aproximadamente 3 veces la velocidad de 16 bits).
- Cabe en GPU de consumo: a 8 bits (12 GB) es viable en GPUs con 16 GB o mas de VRAM; el autor no confirma haberlo ejecutado en una maquina de 32 GB.
- Opciones de despliegue: Ollama (usado en las pruebas), vLLM (probado con NVFP4 y activaciones de 4 bits), PEFT para cargar el adaptador sobre el base; llama.cpp y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: aproximadamente 20 tok/s a int8 en una Mac; en una pareja de mediciones anterior y separada se leyeron 38.8 y 217 tok/s (5.6 veces) frente al hermano MoE, aunque el autor advierte usar la ratio y no los numeros absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | main (73) | held-out (53) | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| Gemma-4-12B-Aether-LoRA (este) | 12B (base denso) | 32K | 65 (70) int8 | 28 (36) int8 | Apache 2.0 | Hugging Face, adaptador PEFT |
| Qwen3.6-35B-A3B-Aether | 35B MoE (3B activos) | no disponible | 65 (70) int8 | 36 (44) int8 | no disponible | Hugging Face |
| Qwen3.8-27B-Aether | 27B | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| google/gemma-4-12B-it (base) | 12B | no disponible | 0 (4) sin guia | 0 (0) sin guia | no disponible | Hugging Face |

El hermano Qwen3.6-35B-A3B en mxfp4 (20.9 GB) iguala aproximadamente a este modelo en main (64 frente a 65) y lo supera en held-out (33 frente a 28), con 85 tok/s frente a 20 tok/s; la diferencia de velocidad se atribuye a la arquitectura MoE, que lee aproximadamente un cuarto de los pesos por token. En bf16, el hermano mayor es claramente superior en held-out tras reparacion (14 tareas frente a 3).

## Limitaciones y advertencias

- Es un especialista en Aether: el autor advierte que escribe Python mucho peor que el base y probablemente peor codigo en otros lenguajes; para uso general debe emplearse google/gemma-4-12B-it.
- Solo soporta ingles segun la model card.
- Riesgo de alucinacion en la API y semantica de Aether: los fallos en primer intento a bf16 incluyen 14 diagnosticos del compilador, 7 codigos de retorno erroneos y 8 salidas incorrectas; las salidas incorrectas no ofrecen diagnostico para la ronda de reparacion, por lo que conviene usar el compilador y tests propios.
- No bajar de 8 bits: a 4 bits (nvfp4, mxfp4) la calidad cae de forma sustancial, con perdidas de entre 5 y 19 tareas en primer intento frente a int8.
- Las puntuaciones se basan en una sola semilla de entrenamiento; un reentrenamiento de la familia cambio unas 9 de 126 primeras tentativas, por lo que diferencias de pocas tareas no son concluyentes.
- Rendimiento en held-out limitado: 57% en bf16 y 53% en int8, lo que indica que la generalizacion mas alla de las tareas de entrenamiento es parcial.
- Restricciones de licencia: Apache 2.0 en el adaptador, pero debe verificarse la licencia del modelo base google/gemma-4-12B-it para uso comercial, ya que no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Adaptador LoRA en Hugging Face: https://huggingface.co/emkey1/Gemma-4-12B-Aether-LoRA
- Modelo fusionado: https://huggingface.co/emkey1/Gemma-4-12B-Aether
- Hermano Qwen3.6-35B-A3B-Aether: https://huggingface.co/emkey1/Qwen3.6-35B-A3B-Aether
- Hermano Qwen3.8-27B-Aether: https://huggingface.co/emkey1/Qwen3.8-27B-Aether
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio del lenguaje Aether: https://github.com/emkey1/aether
