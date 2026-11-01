# kheimerl/hushword-referee-gguf

## Resumen

Hushword referee es una cuantizacion GGUF IQ4_XS de Qwen/Qwen2.5-1.5B-Instruct, publicada por el usuario kheimerl. No se trata de un modelo nuevo ni de un fine-tuning: es el modelo base de 1,5 mil millones de parametros convertido a formato GGUF y cuantizado a 4 bits con una matriz de importancia (imatrix) construida especificamente a partir de 1200 prompts de arbitraje si/no del juego de palabras Hushword. El modelo resultante se ejecuta en el dispositivo con llama.cpp para decidir si una palabra encaja en una pregunta de pista, calculando P(Yes) / (P(Yes) + P(No)) y aceptando con umbral 0,5.

La relevancia de esta publicacion es practica y muy acotada: demuestra que una imatrix derivada de la tarea concreta permite mantener la calidad de un Q4_K_M oficial con un 20 % menos de tamano (896 MB frente a 1117 MB), a costa de un incremento de latencia de aproximadamente 1,29x en 4 hilos de CPU y 1,21x en Vulkan. Es, por tanto, un artefacto de despliegue para un caso de uso muy especifico, no una alternativa generalista al modelo base.

El repositorio incluye dos ficheros: el GGUF cuantizado (895.731.808 bytes) y la propia imatrix en formato GGUF de llama.cpp (4.137.728 bytes), lo que permite reproducir o reutilizar la matriz. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), cuantizado a GGUF IQ4_XS |
| Parametros totales | 1.020.404 (dato reportado en safetensors del repo; corresponde al modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta contextos largos, pero la ficha no confirma el valor para este artefacto) |
| Tipos de cuantizacion | IQ4_XS con imatrix de tarea (unico quant publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), mas fichero imatrix en formato GGUF |

## Arquitectura y entrenamiento

El artefacto no introduce cambios arquitectonicos: es un transformer decoder-only Qwen2.5 de 1,5B parametros, convertido desde los safetensors originales de HuggingFace a f16 con `convert_hf_to_gguf.py` y posteriormente cuantizado con `llama-quantize --imatrix ... IQ4_XS` usando llama.cpp b12014 (commit `aa588a3463357ee990b314f41dda242869130704`). No se ha recuantizado desde un quant existente, lo que evita la acumulacion de error de una doble cuantizacion.

La innovacion tecnica esta en la matriz de importancia: se genero con `llama-imatrix` sobre 1200 prompts de arbitraje renderizados (aproximadamente 620 KB de texto) procedentes unicamente del split de entrenamiento del conjunto de evaluacion del juez del juego. Esto sesga la calibracion de la cuantizacion hacia la distribucion exacta de la tarea (preguntas de pista con respuestas si/no), en lugar de hacia texto generico. No hay informacion sobre el entrenamiento original del modelo base (tokens, composicion del dataset, RLHF/DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto y clasificacion binaria si/no en el contexto del arbitraje de palabras del juego Hushword.
- Puntuacion probabilistica mediante P(Yes) / (P(Yes) + P(No)) con umbral fijo de 0,5, sin ajuste de umbral.
- Capacidad de tolerar errores tipograficos en respuestas validas (78 % de aceptacion de respuestas correctas mal escritas en la evaluacion del autor).
- Hereda las capacidades del modelo base Qwen2.5-1.5B-Instruct (razonamiento basico, codigo, matematicas, multilingueismo), aunque la cuantizacion con imatrix de tarea puede degradar el rendimiento fuera de la distribucion de arbitraje.
- Ejecucion en CPU y en GPU via Vulkan con llama.cpp; no probado en WebGPU.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en esta ficha.

## Casos de uso

- Arbitraje de respuestas en juegos de palabras: el modelo recibe una pregunta de pista y una palabra candidata y devuelve una probabilidad de encaje; es su uso previsto y el unico validado por el autor con el conjunto de 259 casos retenidos.
- Despliegue en dispositivos con recursos limitados: con 896 MB en disco y ejecucion en 4 hilos de CPU, cabe en moviles, Raspberry Pi o portatiles sin GPU dedicada, manteniendo la calidad del Q4_K_M oficial.
- Filtrado de respuestas en formularios o encuestas: la logica si/no con umbral 0,5 puede adaptarse a validacion de respuestas abiertas donde se requiera una decision binaria calibrada.
- Prototipado de clasificadores binarios especificos de dominio: la inclusion de la imatrix permite reutilizar la receta (generar prompts de la tarea, construir imatrix, cuantizar a IQ4_XS) para otros dominios con presupuesto de almacenamiento reducido.
- Inferencia en entornos con GPU integrada o Vulkan: el autor reporta funcionamiento en Vulkan con una penalizacion de latencia de 1,21x frente a Q4_K_M, adecuado para equipos sin CUDA.
- Reproducibilidad de cuantizaciones: el repositorio incluye la imatrix en formato GGUF, lo que permite a terceros reproducir el quant o inspeccionar la calibracion sin regenerar los 1200 prompts.

## Benchmarks y rendimiento

Evaluacion del juez del propio juego, mismo prompt y umbral 0,5 sin ajuste, sobre un conjunto retenido de 259 casos. Se reporta la proporcion de respuestas validas aceptadas (Fits), respuestas validas con errores tipograficos aceptadas (Typos), respuestas no validas aceptadas (Misses) y la separacion media entre puntuaciones de respuestas validas y no validas (Separation).

| Quant | MB | Fits | Typos | Misses | Separation |
|---|---:|---:|---:|---:|---:|
| Q4_K_M (oficial) | 1117 | 97% | 78% | 13% | 0,955 |
| IQ4_XS, task imatrix (este) | 896 | 95% | 78% | 13% | 0,958 |

Ademas, el autor reporta que el modelo supera la comprobacion de sanidad de arranque del juego y que una prueba con respuestas incorrectas mal escritas no mostro una tendencia adicional a aceptarlas (-1 pp, frente a -2 pp de Q4_K_M). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el fichero GGUF ocupa 896 MB, por lo que la huella en memoria rondara ese orden mas el overhead de llama.cpp.
- GPU recomendadas: no se especifican; el autor solo reporta pruebas en CPU (4 hilos) y Vulkan.
- Cabe en GPU de consumo: si, dado el tamano del fichero (inferior a 1 GB), es compatible con practicamente cualquier GPU consumer con al menos 1-2 GB de memoria libre.
- Opciones de despliegue: llama.cpp (version b12014 o compatible), con soporte de CPU y Vulkan; no probado en WebGPU.
- Latencia y throughput: aproximadamente 1,29x mas lento que Q4_K_M en 4 hilos de CPU y 1,21x mas lento en Vulkan; no se reportan valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Calidad en la tarea | Licencia |
|---|---|---:|---:|---|---|
| Hushword referee IQ4_XS (este) | 1,5B | no disponible | 896 MB | Fits 95 %, Typos 78 %, Misses 13 %, Separation 0,958 | Apache 2.0 |
| Qwen2.5-1.5B-Instruct Q4_K_M (oficial) | 1,5B | no disponible | 1117 MB | Fits 97 %, Typos 78 %, Misses 13 %, Separation 0,955 | Apache 2.0 |
| Qwen2.5-1.5B-Instruct (safetensors originales) | 1,5B | no disponible | no disponible | no evaluado en la tarea por el autor | Apache 2.0 |

La comparativa se limita al quant oficial Q4_K_M y al modelo base, que son los unicos terminos de referencia aportados por el autor. No se dispone de datos frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion esta calibrada con una imatrix derivada exclusivamente de prompts de arbitraje del juego Hushword; el rendimiento fuera de esa distribucion puede degradarse respecto al modelo base o a un quant generico.
- La evaluacion se limita a 259 casos retenidos del propio juego, sin benchmarks estandar; no hay evidencia de calidad en tareas generales de generacion, codigo o matematicas.
- La tasa de aceptacion de respuestas validas baja del 97 % al 95 % frente a Q4_K_M, lo que implica un pequeno aumento de falsos negativos en el arbitraje.
- Es mas lento que Q4_K_M (1,29x en CPU, 1,21x en Vulkan), lo que puede ser relevante en despliegues con requisitos de latencia estrictos.
- No se ha probado en WebGPU, por lo que el soporte en navegador no esta validado.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de contexto o idioma para este artefacto.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-1.5B-Instruct; conviene revisar la licencia original para confirmar obligaciones de atribucion.
- El campo de parametros totales reportado (1.020.404) parece corresponder a un recuento parcial o a un error de metadatos del repo; el modelo base tiene 1,5B parametros segun su denominacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kheimerl/hushword-referee-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Herramienta de cuantizacion: https://github.com/ggerganov/llama.cpp (commit `aa588a3463357ee990b314f41dda242869130704`, version b12014)
