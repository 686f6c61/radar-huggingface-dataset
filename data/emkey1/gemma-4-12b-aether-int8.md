# emkey1/Gemma-4-12B-Aether-int8

## Resumen

Gemma-4-12B-Aether-int8 es una cuantizacion a 8 bits del modelo emkey1/Gemma-4-12B-Aether, un ajuste fino mediante LoRA de google/gemma-4-12B-it orientado a la generacion de programas en Aether, un lenguaje de programacion pequeno, de tipado estatico y con efectos explicitos. El modelo resuelve un problema muy concreto: los modelos generalistas no conocen Aether y necesitan un guia de aproximadamente 14.000 tokens en cada prompt para escribir codigo correcto; este ajuste internaliza ese conocimiento en los pesos y elimina la necesidad de dicha guia.

La arquitectura subyacente es la de Gemma 4 (transformer denso, no MoE) con 11.959.730.224 parametros totales. El repositorio contiene los tensores en formato MLX con cuantizacion int8, pensados para su uso con Ollama en equipos Apple Silicon, con una descarga de aproximadamente 12,8 GB. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Es relevante ahora porque demuestra un caso de especializacion extrema via LoRA sobre un modelo base abierto: el ajuste pasa de 0 tareas resueltas al primer intento sin guia (modelo base sin entrenar) a 63 de 73 en el conjunto principal, a costa de degradar notablemente su capacidad en Python y otros lenguajes. Es, por tanto, un especialista de proposito unico, no un modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4, tag `gemma4_unified`) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (este repositorio); el modelo base dispone de bf16 y, segun la model card, existen variantes nvfp4 (8,0 GB) y mxfp4 (7,7 GB) de la primera release |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en layout MLX (libreria `mlx`), empaquetado para Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre google/gemma-4-12B-it, un transformer denso de la familia Gemma 4. El adaptador (emkey1/Gemma-4-12B-Aether-LoRA) se fusiono con el modelo base para producir emkey1/Gemma-4-12B-Aether, y este repositorio es la cuantizacion int8 de dicho modelo fusionado. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre la composicion completa del dataset.

El entrenamiento se centra en pares de tareas de programacion en Aether. La revision del 2026-11-07 anade 298 pares de entrenamiento adicionales extraidos de tareas nuevas que la primera release resolvia mal, manteniendo la misma receta. Segun la model card, no esta claro si la mejora proviene de dirigir los pares hacia los fallos o de anyadir pares de ese tipo en general. No se menciona el uso de RLHF ni DPO. La evaluacion se realiza con el compilador de Aether 1.0 (version de lenguaje 2026-10-30-1), con temperatura 0, semilla 42, una muestra por tarea y hasta dos rondas de reparacion en las que el modelo ve el diagnostico del compilador y la salida observada.

## Capacidades

- Generacion de programas en Aether: lenguaje con tipado estatico, efectos explicitos en bloques `fx { }`, contratos `@pre` / `@post`, registros con metodos, arrays y arrays bidimensionales, mapas `Map[Text, T]` y API integrada de JSON/TOON.
- Resolucion de tareas algorítmicas en Aether (ordenacion, estructuras de datos, procesamiento de datos TOON).
- Reparacion iterativa de codigo a partir de diagnosticos del compilador y de la salida observada.
- Generacion de texto y conversacion (pipeline `text-generation`, tag `conversational`).
- Escritura de codigo en Python y otros lenguajes: tecnicamente posible, pero degradada de forma significativa respecto al modelo base; el autor recomienda no usarlo para ello.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el unico bucle multi-paso descrito es el de reparacion con feedback del compilador.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo Aether sin guia en el prompt: sustitucion directa del modelo base mas un guia de 14.000 tokens por un unico modelo que escribe Aether correctamente al primer intento en el 86 % de las tareas del conjunto principal (63 de 73). Reduce el coste de prefill y simplifica el pipeline.
- Asistentes de programacion en Aether integrados en el editor: el modelo puede recibir el diagnostico del compilador y la salida observada y reparar el programa en hasta dos rondas, lo que encaja con un flujo de "escribir, compilar, corregir" dentro del IDE.
- Procesamiento de datos TOON: el conjunto `hard: TOON data processing` lo resuelve en 12 de 14 tareas al primer intento, por lo que es adecuado para tareas de transformacion y serializacion de datos en ese formato mediante la API integrada del lenguaje.
- Entornos con recursos limitados en Apple Silicon: con 12,8 GB de descarga y ejecucion via MLX/Ollama, cabe en equipos donde el hermano mayor Qwen3.6-35B-A3B-Aether a 4 bits (20,9 GB) no es viable, a costa de menor velocidad (el 35B genera unas 5,6 veces mas rapido segun el autor).
- Evaluacion y ensenanza del lenguaje Aether: al ser un especialista entrenado sobre el compilador 1.0, sirve para generar ejemplos y programas de referencia del lenguaje en pipelines de documentacion o tests.
- Prototipado de herramientas internas de DSL: el patron (LoRA sobre un modelo abierto para internalizar un guia largo) es replicable; este modelo sirve como referencia de hasta donde llega la especializacion y de su coste en capacidades generales.
- Generacion de codigo en Python en produccion: no recomendado; el autor indica explicitamente que el ajuste escribe Python mucho peor y que para cualquier uso fuera de Aether debe emplearse el modelo base.

## Benchmarks y rendimiento

Resultados segun la model card: sin guia en el prompt, temperatura 0, semilla 42, una muestra por tarea, hasta dos rondas de reparacion. Formato: primer intento (tras reparacion).

| Suite | Tareas | Base sin entrenar, sin guia | Fusionado bf16 | Este modelo int8 | Base sin entrenar + guia 14K |
|---|---:|---:|---:|---:|---:|
| core | 35 | 0 (3) | 33 (34) | 33 (34) | 29 (35) |
| hard: TOON data processing | 14 | 0 (0) | 13 (14) | 12 (14) | 3 (11) |
| hard: other | 5 | 0 (0) | 0 (3) | 0 (2) | 2 (4) |
| algorithms | 19 | 0 (1) | 19 (19) | 18 (18) | 14 (17) |
| **Total principal** | **73** | **0 (4)** | **65 (70), 89 %** | **63 (68), 86 %** | **48 (67)** |
| held-out: surface | 15 | 0 (0) | 10 (12) | 10 (11) | 10 (13) |
| held-out: algorithmic | 14 | 0 (0) | 11 (11) | 10 (11) | 6 (11) |
| held-out: specification | 12 | 0 (0) | 8 (9) | 8 (8) | 6 (8) |
| held-out: TOON / memory streams | 12 | 0 (0) | 4 (5) | 4 (4) | 4 (9) |
| **Total held-out** | **53** | **0 (0)** | **33 (37), 62 %** | **32 (34), 60 %** | **26 (41)** |

Datos adicionales de la model card:

- La cuantizacion int8 apenas degrada: solo 5 de 126 primeros intentos difieren del bf16 (1 ganado, 4 perdidos). No se puede separar el efecto de la cuantizacion del de la pila de servicio, que tambien difiere.
- No bajar de 8 bits: medido sobre la primera release, nvfp4 (8,0 GB) obtiene 58 (65) en el conjunto principal y 21 (26) en held-out; mxfp4 (7,7 GB) obtiene 55 (59) y 22 (28).
- Sobre 1.026 tareas nuevas, dos ejecuciones de esta receta fallan 134 y 141 primeros intentos frente a 188 y 163 de la primera release (unas 3,7 puntos menos de media), aunque estos pesos se seleccionaron sobre esas mismas tareas, por lo que la cifra sobrestima la mejora.
- Sobre 126 tareas de benchmark, esta a la par de la primera release: 95 frente a 93 al primer intento, 102 frente a 106 tras reparacion, sin significacion estadistica.
- Una segunda semilla no publicada de la misma receta difiere en 15 de 126 primeros intentos y obtiene 99 (109) a 16 bits.

No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/unificada estimada: aproximadamente 12,8 GB de descarga para int8; la model card indica un uso de memoria de 29 GB durante una pasada de evaluacion, frente a 21 GB de la primera release a 8 bits con la misma arquitectura.
- GPU recomendadas: no se especifican modelos de GPU dedicada; el modelo esta empaquetado para MLX y Ollama, lo que apunta a Apple Silicon con memoria unificada suficiente (los 29 GB observados sugieren 32 GB o mas para trabajar con holgura).
- Cabe en GPU de consumo: si, en tarjetas con al menos 16 GB de VRAM para la inferencia int8, aunque no hay datos publicados de rendimiento en ese escenario; en Apple Silicon requiere configuraciones de 32 GB o superiores segun la medicion citada.
- Opciones de despliegue: Ollama (objetivo declarado del repositorio) y MLX. No se mencionan vLLM, TGI ni llama.cpp; llama.cpp y Ollama podrian no soportar el layout MLX sin conversion.
- Latencia y throughput: no disponibles de forma absoluta; como referencia relativa, el hermano Qwen3.6-35B-A3B-Aether a 4 bits genera aproximadamente 5,6 veces mas rapido en el mismo Mac.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Aether (principal, primer intento / tras reparacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Gemma-4-12B-Aether-int8** (este) | 11,96 B denso | no disponible | 63 / 68 de 73 (86 %) | Apache 2.0 | Hugging Face, Ollama, MLX |
| Gemma-4-12B-Aether (bf16) | 11,96 B denso | no disponible | 65 / 70 de 73 (89 %) | Apache 2.0 | Hugging Face |
| Qwen3.6-35B-A3B-Aether a 4 bits | 35 B MoE (3 B activos, segun nombre) | no disponible | aproximadamente igual en las 126 tareas de benchmark; claramente mejor a tamano completo en held-out | no disponible | Hugging Face |
| google/gemma-4-12B-it (base sin ajuste, con guia 14K) | 11,96 B denso | no disponible | 48 / 67 de 73 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es un especialista de proposito unico: escribe Python mucho peor que el modelo base y probablemente peor en otros lenguajes. Para cualquier uso fuera de Aether debe emplearse google/gemma-4-12B-it.
- Solo declara ingles; no hay soporte multilingue documentado.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas con prompts largos.
- La mejora de la revision 2026-11-07 se midio sobre tareas muy cercanas a los nuevos pares de entrenamiento (mismo generador de tareas y mismas categorias), por lo que la ganancia real fuera de esa distribucion es incierta; con dos ejecuciones por lado, el tamano del efecto no esta acotado.
- Las diferencias de pocas tareas entre filas de la tabla de resultados no son significativas: una segunda semilla de la misma receta difiere en 15 de 126 primeros intentos.
- No bajar de 8 bits: las cuantizaciones nvfp4 y mxfp4 de la primera release pierden entre 5 y 8 tareas en el conjunto principal y alrededor de 10 en held-out.
- Riesgo de alucinacion en APIs del lenguaje: aunque el modelo conoce Aether, los fallos restantes se concentran en `hard: other` (0 de 5 al primer intento) y en las suites held-out de especificacion y TOON/memory streams, donde solo resuelve 8 de 12 y 4 de 12 respectivamente.
- Uso comercial: la licencia Apache 2.0 del repositorio lo permite, pero conviene verificar la licencia del modelo base google/gemma-4-12B-it, que no se detalla en la informacion disponible.
- El repositorio tiene 214 descargas y 0 likes, y fue creado en noviembre de 2026; es un artefacto reciente con poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emkey1/Gemma-4-12B-Aether-int8
- Modelo fusionado base: https://huggingface.co/emkey1/Gemma-4-12B-Aether
- Adaptador LoRA: https://huggingface.co/emkey1/Gemma-4-12B-Aether-LoRA
- Hermano mayor MoE: https://huggingface.co/emkey1/Qwen3.6-35B-A3B-Aether
- Hermano mayor denso: https://huggingface.co/emkey1/Qwen3.8-27B-Aether
- Modelo base original: https://huggingface.co/google/gemma-4-12B-it
- Repositorio del lenguaje Aether: https://github.com/emkey1/aether
