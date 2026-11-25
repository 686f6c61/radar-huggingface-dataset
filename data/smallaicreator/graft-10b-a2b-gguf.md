# SmallAICreator/GRAFT-10B-A2B-GGUF

## Resumen

GRAFT-10B-A2B es un modelo de chat de arquitectura *mixture-of-experts* (MoE) desarrollado por UltraLabs (publicado bajo la cuenta de Hugging Face `SmallAICreator`). Se construye a partir de Qwen3-30B-A3B-Instruct-2507 mediante GRAFT, un metodo propio de reduccion de modelos del autor, al que siguen fases de *healing*, destilacion y ajuste conversacional. El resultado es un modelo de aproximadamente 10.330 millones de parametros totales con solo unos 2.000 millones activos por token, lo que le permite generar texto a una velocidad cercana a la de un modelo de 2B conservando parte del conocimiento de uno de 30B.

La relevancia practica del modelo esta en su relacion calidad/tamano: cabe en un GGUF Q4_K_M de 6,27 GB, se ejecuta en CPU y en GPUs de consumo, y mantiene una ventana de contexto de 32K tokens con recall perfecto en pruebas *needle-in-a-haystack* (60/60). Incorpora plantilla ChatML con soporte de *tool calling* embebida en el propio archivo GGUF, lo que facilita su despliegue en llama.cpp, Ollama, LM Studio o Jan sin configuracion adicional.

La arquitectura es Qwen3-MoE con 48 capas, 40 expertos (5 activos por token) y tamano oculto de 2048. La licencia es Apache 2.0 y el idioma principal es el ingles. El autor advierte que la generacion de codigo es su punto mas debil y que aun no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (transformer *mixture-of-experts*), 48 capas, 40 expertos, 5 activos por token, hidden size 2048 |
| Parametros totales | 10.331.932.672 (~10,3B) |
| Parametros activos | ~2B por token |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | GGUF; el repositorio distribuye Q4_K_M (6,27 GB) |
| Idiomas soportados | Ingles (principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con plantilla de chat ChatML y tool calling embebidos) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de la familia Qwen3 con 48 capas, 40 expertos por capa y 5 expertos activos por token, con un tamano oculto de 2048. Se obtuvo reduciendo Qwen3-30B-A3B-Instruct-2507 a aproximadamente un tercio de su tamano mediante GRAFT, el metodo de *shrinking* del autor, y aplicando despues un proceso de *healing* (recuperacion de capacidad tras la reduccion), destilacion desde el modelo original y ajuste fino conversacional. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

Como metrica de fidelidad al modelo base, el autor reporta divergencia KL de las predicciones *next-token* frente a Qwen3-30B-A3B-Instruct-2507 sobre texto held-out (web, libros, codigo y chat): aproximadamente 0,31 para GRAFT-10B-A2B antes del ajuste conversacional, frente a 0,71 de Qwen3-1.7B, 0,40 de Qwen3-4B-Instruct-2507, 0,39 de Qwen3-8B y 0,34 de Qwen3-14B. El propio autor advierte que esta metrica mide similitud con el original, no rendimiento en benchmarks, y que al haber sido entrenado para imitarlo supone una prueba mas favorable para GRAFT que para los modelos Qwen de referencia.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas directas y concisas.
- Razonamiento de una sola pasada: no dispone de modo *thinking* ni de cadena de pensamiento explicita.
- Conocimiento factual general, incluidos datos poco frecuentes (el autor cita capitales como Uagadugu y Astana).
- Generacion de codigo basica (por ejemplo, funciones Python sencillas), aunque es su area mas debil segun el autor.
- *Tool calling* / *function calling* en formato `<tool_call>`, con plantilla ChatML embebida que procesa `tools` al estilo OpenAI.
- Despliegue compatible con servidor OpenAI-compatible mediante `llama-server --jinja`.
- Ventana de contexto de 32K tokens con recall perfecto en la prueba de aguja en pajar reportada (60/60).
- Capacidades multilingues limitadas: el modelo esta orientado a ingles.

## Casos de uso

- Asistente conversacional local en portatil: con 8 GB de RAM libre (16 GB recomendados) el modelo corre en CPU a unos 4-5 tokens/s de escritura y ~20 tokens/s de lectura de prompt en un i5, lo que permite un chatbot privado sin GPU ni conexion externa.
- Servidor de inferencia autoalojado con API compatible OpenAI: `llama-server --jinja` expone el modelo en `http://localhost:8080` con soporte de `tools`, util para integrarlo como backend en aplicaciones existentes sin cambiar el cliente.
- Agentes con *tool calling*: la plantilla embebida interpreta esquemas de funciones al estilo OpenAI, de modo que el modelo puede invocar herramientas (busqueda, calculo, APIs) en flujos de varios pasos dentro de un contexto de 32K.
- Analisis de documentos largos: el recall perfecto hasta 32K permite tareas de extraccion de datos o preguntas sobre informes, contratos o articulos extensos sin truncar el contenido.
- Despliegue en aplicaciones de escritorio GGUF: LM Studio, Jan u Ollama (`ollama run hf.co/SmallAICreator/GRAFT-10B-A2B-GGUF:Q4_K_M`) cargan el archivo y leen la plantilla de chat directamente, lo que simplifica prototipado y demos.
- Sustitucion de modelos densos de 8-14B en entornos con VRAM limitada: al activar solo ~2B parametros por token, ofrece velocidad de un modelo pequeno con un conocimiento derivado de un 30B, adecuado para asistentes de productividad en hardware modesto.
- Experimentacion e investigacion sobre reduccion de modelos: la metrica KL publicada frente al modelo base permite estudiar la degradacion de capacidades tras el *shrinking* y la destilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que "standard benchmarks are coming".

Los unicos datos cuantitativos publicados son los siguientes:

| Prueba | Resultado |
|---|---|
| Needle-in-a-haystack, 4K/8K/16K/32K (5 profundidades x 3 codigos) | 60/60 aciertos (15/15 en cada longitud) |
| Divergencia KL frente a Qwen3-30B-A3B-Instruct-2507 (antes del ajuste conversacional) | ~0,31 |
| Partida de Go Fish frente a GPT-OSS-20B | 9 libros a 4 (una sola partida, con ventaja de reparto inicial) |

La comparacion KL con modelos densos de referencia es la siguiente:

| Modelo | KL frente a Qwen3-30B-A3B-Instruct-2507 |
|---|---|
| Qwen3-1.7B | 0,71 |
| Qwen3-4B-Instruct-2507 | 0,40 |
| Qwen3-8B | 0,39 |
| Qwen3-14B | 0,34 |
| GRAFT-10B-A2B (antes de chat-tuning) | ~0,31 |

## Requisitos de hardware

- RAM: 8 GB libres; 16 GB totales recomendados para el archivo Q4_K_M de 6,27 GB.
- CPU: funciona en modo solo CPU; en un portatil con i5 se observan aproximadamente 4-5 tokens/s de generacion y ~20 tokens/s de procesamiento de prompt.
- GPU: mucho mas rapido; conviene descargar a VRAM tantas capas como permita la GPU. No se especifican modelos de GPU concretos ni cifras de VRAM en la informacion disponible.
- GPU de consumo: el tamano del archivo (6,27 GB) sugiere que puede caber en GPUs con 8 GB o mas de VRAM, aunque el autor no confirma modelos concretos.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan y cualquier aplicacion compatible con GGUF.
- Parametros de muestreo recomendados: temperatura 0,7, top-p 0,8, top-k 20, repeat penalty 1,05.
- Latencia y throughput: solo se publican las cifras de CPU mencionadas; no hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GRAFT-10B-A2B | ~10,3B | ~2B | 32K | Apache 2.0 | Derivado de Qwen3-30B-A3B mediante GRAFT; sin benchmarks estandar publicados |
| Qwen3-30B-A3B-Instruct-2507 | 30B | ~3B | no disponible en la informacion | no disponible en la informacion | Modelo base; mayor tamano y conocimiento, requiere mas recursos |
| Qwen3-14B | 14B | denso | no disponible en la informacion | no disponible en la informacion | KL de 0,34 frente al 30B; denso, mas costoso por token que un MoE |
| Qwen3-8B | 8B | denso | no disponible en la informacion | no disponible en la informacion | KL de 0,39 frente al 30B; menor huella pero menor fidelidad al original |
| GPT-OSS-20B | 20B | no disponible | no disponible | no disponible | Usado como rival en la partida de Go Fish; dispone de razonamiento explicito |

La comparacion se limita a los datos publicados por el autor; no hay resultados de benchmarks que permitan una comparacion de rendimiento objetiva con estas alternativas.

## Limitaciones y advertencias

- Generacion de codigo: el autor la senala como el area mas debil del modelo.
- Sin modo de razonamiento: no hay cadena de pensamiento ni *thinking mode*; cada respuesta se produce en una sola pasada.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; como modelo pequeno destilado, la fiabilidad en dominios especializados no esta verificada.
- Identidad: sin *system prompt*, el modelo a veces se presenta con el nombre de su modelo base; se recomienda incluir "You are GRAFT-10B-A2B, a helpful AI assistant made by UltraLabs."
- Idioma: orientado principalmente al ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Ausencia de benchmarks estandar: no hay datos de MMLU, HumanEval, GSM8K ni similares, lo que impide validar su calidad frente a alternativas.
- Evidencia empirica limitada: la partida de Go Fish es un unico enfrentamiento con ventaja de reparto; el propio autor reconoce que la suerte pudo influir.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Qwen3-30B-A3B-Instruct-2507 y conviene verificar las condiciones del modelo base.
- Cuantizacion unica: el repositorio solo distribuye Q4_K_M; no hay variantes de mayor o menor precision en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SmallAICreator/GRAFT-10B-A2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Perfil del autor: https://huggingface.co/SmallAICreator
