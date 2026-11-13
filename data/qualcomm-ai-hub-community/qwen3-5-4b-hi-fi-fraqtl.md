# qualcomm-ai-hub-community/Qwen3.5-4B-Hi-Fi-fraQtl

## Resumen

Qwen3.5-4B-Hi-Fi-fraQtl es una cuantizacion GGUF de 4 bits del modelo Qwen3.5-4B (4.205.751.296 parametros), publicada por el usuario fraQtl y redistribuida en el espacio qualcomm-ai-hub-community. No es un modelo nuevo: es una version comprimida del modelo base de Qwen, empaquetada en formato Q4_K para llama.cpp y orientada explicitamente a inferencia en dispositivo (on-device) y en el borde (edge). El repositorio ocupa 2,7 GB y contiene un unico fichero GGUF de 2.732.070.048 bytes.

Su propuesta de valor es la fidelidad respecto al modelo original en bf16. El autor afirma que este build queda mas cerca del modelo base que cualquier otro GGUF de 4 bits del mismo tamano que midio, con una divergencia KL de 0,01817 en tareas de instrucciones y tool calling, y 0,01217 en conocimiento y razonamiento. Frente al Q4_K_M de referencia de unsloth, la mejora es del 22,7% y del 17,3% respectivamente, con un fichero ligeramente mas pequeno.

Es relevante ahora porque demuestra que la cuantizacion de 4 bits puede mejorarse sin cambiar de formato ni de runtime: el fichero funciona en llama.cpp estandar y esta pensado para despliegues en Snapdragon NPU mediante un repositorio hermano. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; fichero en formato GGUF para llama.cpp) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (mezcla interna: tensores en Q4_K, Q5_K y Q6_K) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico: Qwen3.5-4B-fraQtl-Hi-Fi-Q4_K.gguf) |

## Arquitectura y entrenamiento

El fichero es una cuantizacion del modelo Qwen3.5-4B, no un modelo entrenado de nuevo. El autor no detalla la arquitectura interna del modelo base (tipo de transformer, atencion, datos de entrenamiento ni fases de alineacion), por lo que esa informacion no esta disponible en la documentacion proporcionada. Lo que si se documenta es el proceso de cuantizacion, que consta de dos pasos.

Primero, redondeo GPTQ ponderado por Hessiana (Frantar et al., 2022) aplicado dentro de los propios bloques Q4_K, Q5_K y Q6_K de llama.cpp, usando las escalas y minimos de bloque de llama-quantize, con estadisticas y una importance matrix derivadas de un corpus de calibracion propio. Segundo, asignacion de bits: el autor midio el coste de comprimir cada tensor y subio los 8 tensores mas costosos a Q5_K, manteniendose dentro del presupuesto de bytes de Q4_K_M. La calibracion se valido con divergencia KL de vocabulario completo sobre 144 ventanas de texto reservadas, con intervalos de confianza del 95% por bootstrap emparejado (2.000 remuestreos). El corpus de calibracion, la importance matrix y la tabla de coste por tensor no se publican.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Seguimiento de instrucciones y tool calling, segun la evaluacion IFEval del autor.
- Razonamiento y conocimiento general, medido con GSM8K y con KL sobre texto general.
- Inferencia en llama.cpp estandar, sin runtime personalizado (probado con b12079).
- Despliegue en NPU de Snapdragon mediante el repositorio hermano del autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponibles en la informacion proporcionada (la evaluacion se hizo con thinking desactivado).

## Casos de uso

- Asistentes conversacionales en dispositivo: el fichero de 2,7 GB cabe en moviles y portatiles con 4-6 GB de RAM libre, y el autor lo orienta a despliegue edge y NPU de Snapdragon, lo que permite conversacion multi-turno sin conexion.
- Agentes con tool calling en el borde: la evaluacion se centra en instrucciones y llamadas a herramientas, de modo que sirve para agentes ligeros que consultan APIs o ejecutan acciones locales con latencia baja.
- Clasificacion y extraccion de informacion en local: al ser un modelo de 4B con cuantizacion fiel, es adecuado para tareas de etiquetado, resumen y extraccion de entidades en pipelines que no pueden enviar datos a la nube.
- Prototipado rapido con llama.cpp: el comando `llama-cli -hf fraQtl/Qwen3.5-4B-Hi-Fi-GGUF` permite arrancar el modelo en un solo paso, util para validar prompts e integraciones antes de invertir en infraestructura.
- Razonamiento matematico basico: en GSM8K obtuvo 226 de 250 preguntas, por lo que puede resolver problemas aritmeticos de varios pasos en entornos educativos o de calculo asistido.
- Despliegue en hardware heterogeneo: al mantener el formato GGUF estandar, se puede servir con llama.cpp, Ollama o bindings compatibles en CPU, GPU consumer y NPU, lo que facilita distribuir una misma build entre dispositivos.
- Evaluacion de calidad de cuantizaciones: el repositorio incluye recibos de fidelidad (tabla KL y resumen de respuestas por pregunta), lo que lo convierte en una referencia util para comparar estrategias de cuantizacion en proyectos propios.

## Benchmarks y rendimiento

Datos publicados por el autor. La divergencia KL se mide contra el modelo bf16 original sobre 144 ventanas reservadas; menor es mejor. Las respuestas se evaluaron con decodificacion greedy, thinking desactivado, llama.cpp b12079 y una GPU por fichero.

| Fichero | Bytes | KL tareas | KL general |
|---|---|---|---|
| fraQtl Hi-Fi Q4_K (este repo) | 2.732.070.048 | 0,01817 | 0,01217 |
| Q4_K_M (unsloth/Qwen3.5-4B-GGUF) | 2.740.937.888 | 0,02351 | 0,01472 |
| Q4_K_S (mismo repo) | 2.590.430.368 | 0,02842 | 0,01729 |
| IQ4_NL (mismo repo) | 2.579.944.608 | 0,03276 | 0,01908 |

| Fichero | GSM8K /250 | IFEval /250 |
|---|---|---|
| Q4_K_M (unsloth) | 227 | 194 |
| fraQtl Hi-Fi Q4_K (este repo) | 226 | 193 |

El autor senala que las diferencias en GSM8K e IFEval no son significativas (p = 1,00) y que el modelo bf16 original no se ejecuto sobre ese conjunto de 500 preguntas. La mejora frente a Q4_K_M es de -22,7% en KL de tareas (intervalo -28,2 a -16,0) y -17,3% en KL general (-27,2 a -8,4).

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 2,73 GB; en la practica conviene reservar entre 3,5 y 4,5 GB para pesos, cache KV y overhead del runtime, en funcion de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede alojar el modelo completo; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin problema, aunque el modelo no aprovecha su capacidad.
- GPU consumer: si, cabe en GPU consumer de gama media y en iGPU con memoria unificada; tambien en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (probado con b12079), Ollama y cualquier runtime compatible con GGUF; el autor remite a un repositorio especifico para NPU de Snapdragon.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Hi-Fi-fraQtl | 4,2B | no disponible | Q4_K mixta (2,73 GB) | 0,01817 | Apache 2.0 | GGUF en HF |
| Qwen3.5-4B Q4_K_M (unsloth) | 4,2B | no disponible | Q4_K_M (2,74 GB) | 0,02351 | Apache 2.0 | GGUF en HF |
| Qwen3.5-4B Q4_K_S (unsloth) | 4,2B | no disponible | Q4_K_S (2,59 GB) | 0,02842 | Apache 2.0 | GGUF en HF |
| Qwen3.5-4B IQ4_NL (unsloth) | 4,2B | no disponible | IQ4_NL (2,58 GB) | 0,03276 | Apache 2.0 | GGUF en HF |

La comparativa se limita a builds del mismo modelo base porque el autor no midio otras familias. Frente a las alternativas de unsloth, este fichero ofrece la menor divergencia KL con un tamano practicamente identico al Q4_K_M.

## Limitaciones y advertencias

- La evaluacion de fidelidad se hizo con una sola build y 144 ventanas; el propio autor advierte que la KL mide cercania al modelo original, no precision en tareas.
- En GSM8K, este fichero alcanzo el limite de 768 tokens de respuesta en 11 preguntas frente a 6 del Q4_K_M: las respuestas son mas largas con la misma puntuacion, lo que puede afectar a latencia y coste.
- Solo se compara con los ficheros de unsloth; otras builds comunitarias no se midieron.
- El modelo es exclusivamente de texto; no se documentan capacidades multimodales.
- No se publican el corpus de calibracion, la importance matrix ni la tabla de coste por tensor, lo que limita la reproducibilidad del proceso.
- No hay datos sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion; al ser una cuantizacion de 4 bits, es esperable cierta degradacion respecto a bf16 en tareas de conocimiento fino.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y del runtime llama.cpp.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el campo de inferencia esta marcado como `false`: no hay validacion independiente de los resultados del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qualcomm-ai-hub-community/Qwen3.5-4B-Hi-Fi-fraQtl
- Repositorio canonico del autor: https://huggingface.co/fraQtl/Qwen3.5-4B-Hi-Fi-GGUF
- Version para NPU de Snapdragon: https://huggingface.co/fraQtl/Qwen3.5-4B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- GGUFs de referencia: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
