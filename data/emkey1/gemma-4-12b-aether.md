# emkey1/Gemma-4-12B-Aether

## Resumen

Gemma-4-12B-Aether es un ajuste fino por LoRA de google/gemma-4-12B-it, desarrollado por el usuario emkey1, especializado en la generación de programas en Aether, un lenguaje de programación pequeño y de tipado estático con efectos explícitos, contratos y una API integrada de JSON/TOON. El modelo parte de la arquitectura Gemma 4 con 11.959.730.224 parámetros totales (aproximadamente 12B) y se distribuye en formato bf16 fusionado, con variantes adicionales en int8 y como adaptador LoRA.

El problema que resuelve es concreto: Aether es un lenguaje nuevo que los modelos generales no conocen, y hasta ahora la única forma de obtener resultados aceptables era incluir una guía de unos 14K tokens en cada prompt. Este fine-tune internaliza ese conocimiento en los pesos, de modo que el modelo puede escribir Aether correctamente sin guía en el prompt, lo que reduce drásticamente el coste de contexto y mejora la latencia efectiva.

Es relevante ahora porque demuestra un patrón útil para lenguajes y DSLs de nicho: en lugar de depender de prompting extenso, se puede especializar un modelo base de tamaño medio mediante LoRA y obtener un especialista que, a 8 bits (12 GB), cabe en hardware de consumo. La contrapartida es que el modelo empeora notablemente en Python y probablemente en otros lenguajes, por lo que es un especialista y no un sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, tag `gemma4_unified`); detalles internos no disponibles |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (repo principal), int8 (repo `-int8` para Ollama), nvfp4 medido en la primera release (8,0 GB); no se recomienda bajar de 8 bits |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); variante int8 para Ollama; adaptador LoRA disponible por separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre google/gemma-4-12B-it, un transformer decoder-only de la familia Gemma 4 con capacidad image-text-to-text segun los tags del repositorio. El repositorio principal contiene los pesos fusionados en bf16 (el adaptador plegado sobre los pesos base); el adaptador LoRA se publica por separado en `emkey1/Gemma-4-12B-Aether-LoRA`. No se detallan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion exacta del dataset, ni si hubo RLHF o DPO.

La innovacion tecnica es el enfoque de destilacion de conocimiento de lenguaje en los pesos: en lugar de inyectar una guia de ~14K tokens en cada prompt, el fine-tune entrena al modelo para escribir Aether directamente. La revision del 2026-11-07 reemplaza la primera release con la misma receta mas 298 pares de entrenamiento adicionales, extraidos de tareas frescas que la primera version fallaba. Segun el autor, apuntar los pares a los fallos mejora el rendimiento en primeras tentativas, aunque no se ha aislado si el beneficio viene de ese enfoque o de anadir pares de ese tipo en general. Las evaluaciones se hicieron con temperatura 0, semilla 42, una muestra por tarea y hasta dos rondas de reparacion con el diagnostico del compilador.

## Capacidades

- Generacion de codigo en Aether: lenguaje estaticamente tipado con efectos explicitos (`fx { }`), contratos (`@pre` / `@post`), records con metodos, arrays y arrays 2D, maps (`Map[Text, T]`) y API integrada de JSON/TOON.
- Escritura de Aether sin guia en el prompt: la capacidad esta internalizada en los pesos, a diferencia del modelo base que necesita ~14K tokens de guia.
- Reparacion iterativa de codigo: el modelo aprovecha los diagnosticos del compilador y la salida observada para corregir programas en rondas sucesivas.
- Procesamiento de datos TOON: suite especifica de procesamiento de datos TOON con resultados destacados (13/14 en bf16 en la suite hard de TOON).
- Algoritmia: resolucion de tareas algoritmicas en Aether (19/19 en bf16 en la suite de algoritmos).
- Capacidad image-text-to-text heredada del modelo base (segun tags), aunque no se documenta su rendimiento tras el fine-tune.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Generacion de programas Aether en produccion: el modelo escribe codigo Aether valido sin necesidad de incluir la guia de 14K tokens, lo que reduce el coste por peticion y permite integrarlo en pipelines de generacion de codigo donde el contexto es limitado.
- Migracion o traduccion de logica a Aether: dado que el modelo conoce la sintaxis y las construcciones del lenguaje (efectos, contratos, records, maps), puede usarse para reescribir fragmentos de pseudocodigo o especificaciones en programas Aether compilables.
- Generacion de codigo con contratos formales: la capacidad de emitir bloques `@pre` / `@post` lo hace adecuado para entornos donde se exige verificación de precondiciones y postcondiciones, como sistemas con requisitos de correccion estrictos.
- Procesamiento de datos TOON: la suite hard de TOON data processing obtiene 13/14 en bf16, por lo que el modelo es util para tareas de transformacion y manipulacion de datos en formato TOON con la API integrada del lenguaje.
- Asistente de desarrollo para el ecosistema Aether: integrado en un IDE o en un bucle de compilacion, el modelo puede generar codigo, leer el diagnostico del compilador y reparar errores en rondas sucesivas, tal como se evaluo en el benchmark con dos rondas de reparacion.
- Despliegue en hardware de consumo: a 8 bits ocupa 12 GB, lo que permite ejecutarlo en una GPU consumer de gama alta o en un Mac, y usarlo como especialista local para tareas de Aether sin depender de la nube.
- Evaluacion y ensenanza del lenguaje: al ser un especialista que genera Aether de forma consistente, puede emplearse para producir ejemplos y ejercicios del lenguaje para documentacion o formacion.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todas las puntuaciones usan sin guia en el prompt, temperatura 0, semilla 42, una muestra por tarea y hasta dos rondas de reparacion. Columnas: primera tentativa (tras reparacion). Compilador Aether 1.0 (version de lenguaje 2026-10-30-1).

| Suite | Tareas | Base sin entrenar, sin guia | Este modelo, bf16 | Este modelo, int8 | Base sin entrenar + guia 14K |
|---|---:|---:|---:|---:|---:|
| core | 35 | 0 (3) | 33 (34) | 33 (34) | 29 (35) |
| hard: TOON data processing | 14 | 0 (0) | 13 (14) | 12 (14) | 3 (11) |
| hard: otros | 5 | 0 (0) | 0 (3) | 0 (2) | 2 (4) |
| algorithms | 19 | 0 (1) | 19 (19) | 18 (18) | 14 (17) |
| **total principal** | **73** | **0 (4)** | **65 (70), 89%** | **63 (68), 86%** | **48 (67)** |
| held-out: surface | 15 | 0 (0) | 10 (12) | 10 (11) | 10 (13) |
| held-out: algorithmic | 14 | 0 (0) | 11 (11) | 10 (11) | 6 (11) |
| held-out: specification | 12 | 0 (0) | 8 (9) | 8 (8) | 6 (8) |
| held-out: TOON / memory streams | 12 | 0 (0) | 4 (5) | 4 (4) | 4 (9) |
| **total held-out** | **53** | **0 (0)** | **33 (37), 62%** | **32 (34), 60%** | **26 (41)** |

Datos adicionales del autor:

- En 1.026 tareas frescas a int8, dos ejecuciones de esta receta fallan 134 y 141 primeras tentativas, frente a 188 y 163 de dos ejecuciones de la primera release (unas 3,7 puntos menos de media). Con dos rondas de reparacion, 55 de los 134 fallos de este modelo pasan (15 en primera tentativa y 40 mediante reparacion).
- En las 126 tareas del benchmark, esta version esta a la par de la primera release: 95 frente a 93 en primeras tentativas, 102 frente a 106 tras reparacion, sin diferencias significativas.
- La cuantizacion a 8 bits apenas penaliza: solo 5 de 126 primeras tentativas difieren del bf16 (1 ganada, 4 perdidas).
- La cuantizacion a 4 bits penaliza mucho mas: el nvfp4 de Ollama (8,0 GB) de la primera release puntua 58 (dato truncado en la model card).
- El hermano mayor MoE de 35B a 4 bits (20,9 GB) puntua aproximadamente igual en las 126 tareas del benchmark y genera unas 5,6 veces mas rapido; a tamano completo es claramente mejor en las suites held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB a int8 (dato del autor); el repo bf16 completo ocupa 71,8 GB en disco, por lo que en bf16 requiere del orden de 24 GB o mas de VRAM segun overhead.
- No se recomienda bajar de 8 bits: la cuantizacion a 4 bits degrada notablemente el rendimiento (nvfp4 de 8,0 GB puntua 58 en la primera release).
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) permite int8 con holgura y bf16 ajustado; A100 y H100 son adecuadas para bf16.
- Cabe en GPU consumer: si, a int8 en GPUs de 12-16 GB o superiores; el autor menciona ejecucion en Mac.
- Opciones de despliegue: transformers (libreria declarada), Ollama mediante el repo `emkey1/Gemma-4-12B-Aether-int8`; el autor menciona que las formas bf16 e int8 difieren en stack de serving.
- Latencia y throughput: no disponibles de forma absoluta; el autor indica que el hermano MoE de 35B a 4 bits genera unas 5,6 veces mas rapido en el mismo Mac.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Aether (126 tareas) | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Gemma-4-12B-Aether (este) | ~12B | no disponible | 95 primeras tentativas / 102 tras reparacion | Apache 2.0 | HF (bf16, int8, LoRA) |
| google/gemma-4-12B-it (base) | ~12B | no disponible | 0 (4) en total principal sin guia; 48 (67) con guia 14K | no disponible en la informacion | HF |
| emkey1/Qwen3.6-35B-A3B-Aether | 35B (MoE, A3B) | no disponible | ~igual en las 126 tareas a 4 bits; mejor a tamano completo en held-out | no disponible en la informacion | HF (4 bits, 20,9 GB) |
| emkey1/Qwen3.8-27B-Aether | 27B | no disponible | no disponible | no disponible en la informacion | HF |

## Limitaciones y advertencias

- Es un especialista en Aether: el autor advierte que el modelo escribe Python mucho peor y probablemente peor codigo en otros lenguajes. Para cualquier tarea que no sea Aether, debe usarse el modelo base.
- Solo soporta ingles segun la model card; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion en APIs o construcciones de Aether no cubiertas por los datos de entrenamiento; las suites held-out muestran un rendimiento claramente inferior (62% en bf16) frente al total principal (89%).
- La suite hard de "otros" obtiene 0/5 en primera tentativa (3/5 tras reparacion), lo que indica dificultades en tareas fuera de las categorias entrenadas.
- El modelo esta pensado para usarse con rondas de reparacion: los resultados en primera tentativa son sensiblemente inferiores a los obtenidos tras dos rondas con el diagnostico del compilador.
- La cuantizacion por debajo de 8 bits degrada gravemente el rendimiento; no se recomienda su uso en produccion.
- El autor reconoce incertidumbre sobre la causa de la mejora de la revision 2026-11-07 y que los pesos fueron elegidos sobre las tareas de evaluacion, lo que puede sobreestimar la diferencia frente a la primera release.
- Consumo de memoria elevado en pasadas de scoring: 29 GB frente a 21 GB de la primera release a 8 bits, con la misma arquitectura.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base google/gemma-4-12B-it, cuyos terminos no se detallan en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emkey1/Gemma-4-12B-Aether
- Variante int8 para Ollama: https://huggingface.co/emkey1/Gemma-4-12B-Aether-int8
- Adaptador LoRA: https://huggingface.co/emkey1/Gemma-4-12B-Aether-LoRA
- Hermano MoE de 35B: https://huggingface.co/emkey1/Qwen3.6-35B-A3B-Aether
- Hermano de 27B: https://huggingface.co/emkey1/Qwen3.8-27B-Aether
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio del lenguaje Aether: https://github.com/emkey1/aether
