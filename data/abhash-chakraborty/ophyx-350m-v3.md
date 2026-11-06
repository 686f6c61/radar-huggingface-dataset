# abhash-chakraborty/ophyx-350m-v3

## Resumen

Ophyx 350M v3 es un modelo de generacion de codigo Python de 349.237.760 parametros (aproximadamente 350M) desarrollado por Abhash Chakraborty y entrenado desde cero sobre computo gratuito: TPU v5e-8 de Kaggle y GPUs T4. Se distribuye bajo licencia Apache-2.0 y esta disenado especificamente para resolver peticiones cotidianas de programacion en Python, incluyendo seguimientos conversacionales y correcciones, un escenario donde su predecesor, Ophyx 350M v2, fallaba al no mantener el contexto del codigo previo ni generar docstrings.

La version v3 parte de v2 y anade un pipeline de ajuste en tres fases: fine-tuning supervisado sobre 4.498 conversaciones verificadas en sandbox, optimizacion por preferencias directas (DPO) con 2.497 pares y una media ponderada final (30% del modelo DPO y 70% de v2) para preservar las puntuaciones de referencia. El resultado mantiene los resultados de v2 en HumanEval+ (44,5 frente a 43,9) y MBPP+ (48,7 frente a 47,4) mientras mejora sustancialmente en tareas conversacionales y en la documentacion del codigo generado.

El modelo emplea la arquitectura de Qwen3 con 28 capas, hidden size de 1.024, atencion GQA con 16 cabezas de consulta y 4 de clave-valor, embeddings atados y una ventana de contexto de 4.096 tokens. Es relevante ahora porque demuestra que es posible obtener un modelo de codigo funcional y con licencia permisiva en el rango de los 350M de parametros usando exclusivamente recursos gratuitos, lo que lo convierte en una opcion viable para entornos con hardware muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, layout Qwen3 (28 capas, hidden size 1.024, GQA con 16 cabezas Q y 4 KV de tamano 64, MLP 2.816, embeddings atados) |
| Parametros totales | 349.237.760 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existen pesos GGUF para llama.cpp en el repo `ophyx-350m-v3-gguf` |
| Idiomas soportados | Ingles (prompts); genera exclusivamente codigo Python |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3: 28 capas transformer decoder-only con hidden size de 1.024, 16 cabezas de consulta y 4 cabezas de clave-valor de dimension 64 (atencion con query grouping), MLP de 2.816, embeddings atados entre entrada y salida, vocabulario de 32.768 tokens, RoPE con base 100.000 y 4.096 tokens de contexto. Los pesos se distribuyen en float32.

El entrenamiento de v3 parte de Ophyx 350M v2 y se articula en cuatro etapas. Primero, se generaron 5.381 peticiones cotidianas con un modelo abierto mayor, con respuestas en un estilo homogeneo (docstring de modulo y docstring en cada funcion y clase), incluyendo seguimientos y correcciones a respuestas erroneas de v2; cada respuesta se ejecuto en sandbox contra una comprobacion escrita junto a la peticion, y 4.498 conversaciones pasaron (3.399 peticiones, 730 seguimientos y 369 correcciones). Segundo, fine-tuning supervisado durante dos epocas sobre esas conversaciones con learning rate 5e-5 y un replay de 1,5 tokens de los datos de fine-tuning previos de v2 por cada token nuevo. Tercero, DPO con 2.497 pares que enfrentan respuestas que pasan la comprobacion y llevan docstrings frente a respuestas fallidas o sin documentacion, con learning rate 2e-6, beta 0,05, 144 pasos y 48 minutos en una T4. Cuarto, una media ponderada de 30% del modelo DPO y 70% de v2, capa por capa, ya que el modelo DPO aislado perdia 1,8 puntos de HumanEval+.

## Capacidades

- Generacion de funciones y scripts cortos en Python a partir de peticiones en lenguaje natural.
- Conversacion multi-turno con seguimientos: acepta turnos previos en el formato `<|user|>\n{prompt}\n<|python|>\n{answer}\n<|end|>\n`.
- Correccion de codigo erroneo cuando se le indica explicitamente que algo falla.
- Generacion de docstrings: documenta funciones y clases, con docstring de modulo, en aproximadamente la mitad de sus respuestas.
- Estilo de respuesta fijo que termina con el token especial `<|end|>`.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo de razonamiento extendido.
- Multilingue limitado: solo entiende prompts en ingles y solo genera Python.

## Casos de uso

- Generacion de funciones utilitarias en Python: el modelo produce funciones cortas y autocontenidas (validacion, parseo, transformacion de datos) a partir de una descripcion en ingles, con docstrings en buena parte de los casos, lo que reduce el tiempo de escritura de codigo boilerplate.
- Asistente de correccion en editores: ante un error reportado por el usuario, se le puede pasar el codigo previo como turno anterior y la indicacion del fallo para que proponga una version corregida, aprovechando los 369 ejemplos de correccion del dataset de entrenamiento.
- Generacion de scripts de automatizacion: tareas de manejo de ficheros, procesamiento de texto y scripting de sistema en Python, donde el modelo rinde mejor que en tareas de mayor alcance.
- Educacion y aprendizaje de Python: al generar docstrings y codigo legible en un estilo homogeneo, sirve como apoyo para explicar la estructura de funciones y clases a estudiantes.
- Prototipado rapido en entornos con hardware minimo: con 349M de parametros y pesos float32 (1,4 GB de repo), puede ejecutarse en CPU o en GPUs de gama baja para pruebas de concepto y generacion asistida en local.
- Despliegue en pipelines de generacion de tests o ejemplos: puede producir ejemplos de uso de funciones y fragmentos de codigo de prueba en Python para documentacion tecnica.
- Integracion en herramientas de linea de comandos: mediante llama.cpp y los pesos GGUF, se puede incorporar en utilidades de terminal para generar snippets sin conexion.

## Benchmarks y rendimiento

Pass@1 en porcentaje, decodificacion greedy, mismo harness y mismo sandbox offline para todos los modelos.

| Modelo | HumanEval+ | MBPP+ | Hands-on (42) | Real-world (33) | BigCodeBench instruct |
|---|---|---|---|---|---|
| Ophyx 350M v3 | 44,5 | 48,7 | 12 | 2 | 20,6 |
| Ophyx 350M v2 | 43,9 | 47,4 | 9 | 2 | 21,0 |
| Qwen2.5-Coder-0.5B-Instruct | 54,9 | 42,1 | 5 | no ejecutado | 11,3 |
| Qwen3-0.6B | 36,6 | 46,6 | 6 | no ejecutado | 10,1 |

En 239 prompts de chat reservados (200 peticiones cotidianas, 37 seguimientos y correcciones, 2 de un registro real de chat), cada respuesta verificada ejecutandola:

| Modelo | Aprobadas | Seguimientos y correcciones aprobados | Todas las funciones documentadas |
|---|---|---|---|
| Ophyx 350M v3 | 140 | 16 | 114 |
| Ophyx 350M v2 | 132 | 8 | 29 |

El autor advierte que el mismo modelo abierto genero los prompts y los datos de entrenamiento, por lo que estas cifras miden el estilo homogeneo tanto como la habilidad general. Los 2 prompts del registro real de chat siguen fallando.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 2 GB.
- VRAM estimada con cuantizacion GGUF (Q4/Q5, disponible en `ophyx-350m-v3-gguf`): por debajo de 1 GB, aunque el tamano exacto no se detalla en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, T4) es sobradamente suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en Raspberry Pi y sistemas embebidos con llama.cpp.
- Opciones de despliegue: transformers (requiere transformers 5 o superior para el tokenizer; en 4.x hay que cargar el tokenizer con `PreTrainedTokenizerFast(tokenizer_file=hf_hub_download(repo, "tokenizer.json"))`), llama.cpp mediante los pesos GGUF, y text-generation-inference (el repo incluye el tag `text-generation-inference`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ | MBPP+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ophyx 350M v3 | 349M | 4.096 | 44,5 | 48,7 | Apache-2.0 | Hugging Face (safetensors y GGUF) |
| Ophyx 350M v2 | aproximadamente 350M | 4.096 | 43,9 | 47,4 | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | no disponible en la informacion | 54,9 | 42,1 | Apache-2.0 | Hugging Face |
| Qwen3-0.6B | 0,6B | no disponible en la informacion | 36,6 | 46,6 | Apache-2.0 | Hugging Face |

Ophyx v3 supera a Qwen3-0.6B en HumanEval+ y en tareas Hands-on, y a Qwen2.5-Coder-0.5B-Instruct en MBPP+, Hands-on y BigCodeBench instruct, aunque queda por detras de este ultimo en HumanEval+. Su ventaja principal frente a ambos es el menor tamano y la capacidad de ejecutarse en hardware mas modesto.

## Limitaciones y advertencias

- Solo genera Python: si se le pide JavaScript, C++ o Bash, responde con Python.
- Solo acepta prompts en ingles.
- Rendimiento limitado en tareas de mayor alcance: resuelve 12 de 42 tareas Hands-on y solo 2 de 33 tareas Real-world.
- No aborda trabajo multi-archivo ni razonamiento largo.
- Aproximadamente la mitad de sus respuestas incluyen docstrings completos; el modelo DPO aislado documentaba 236 de 239 pero perdia rendimiento en benchmarks, por lo que v3 sacrifica parte de esa capacidad.
- Riesgo de alucinacion en el codigo generado: el autor recomienda tratar la salida como codigo no probado.
- Sesgos: no se documentan sesgos especificos en la informacion disponible, aunque al estar entrenado con datos generados por un modelo abierto mayor puede heredar sus sesgos.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero no hay garantias de idoneidad para produccion.
- Requiere transformers 5 o superior para el tokenizer; en 4.x es necesario un workaround manual.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhash-chakraborty/ophyx-350m-v3
- Pesos GGUF para llama.cpp: https://huggingface.co/abhash-chakraborty/ophyx-350m-v3-gguf
- Modelo base (v2): https://huggingface.co/abhash-chakraborty/ophyx-350m-v2
- Repositorio GitHub con resultados de evaluacion: https://github.com/Abhash-Chakraborty/ophyx/blob/main/eval/R1_RESULTS.md
