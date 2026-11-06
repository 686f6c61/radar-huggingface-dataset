# DreamBlooms/JAD-S1-7B-A1B-v0.3

## Resumen

JAD-S1-7B-A1B-v0.3 es un adaptador LoRA publicado por DreamBlooms sobre el modelo base `inclusionAI/LLaDA-MoE-7B-A1B-Instruct`, un transformer de difusión con arquitectura MoE (7B parámetros totales, 1B activos). El adaptador transforma el modelo base en un clasificador de decisión de opción múltiple: recibe un estado, una pregunta y una lista de opciones etiquetadas de `A` a `Z`, y en un único forward pass devuelve una distribución normalizada de probabilidad sobre las letras disponibles, sin generar texto ni requerir parseo de la salida.

La propuesta es relevante porque sustituye el paradigma de generación libre por un readout restringido de una sola posición enmascarada, lo que reduce latencia y elimina errores de formato en tareas de decisión. El adaptador se distribuye con licencia Apache-2.0 (comercialmente usable) y está entrenado únicamente con datos públicos abiertos y sintéticos generados para el proyecto.

El repositorio contiene solo el adaptador (311 MB, LoRA con `r=8` y `alpha=16`), no los pesos base. La versión v0.3 (5 de noviembre de 2026) sustituye a v0.2 y mejora los resultados en el benchmark JevBench v1.2.2 hasta 195/231 (84,4%), frente a los 155/231 (67,1%) del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión MoE (LLaDA-MoE) con adaptador LoRA |
| Parametros totales | 7B (modelo base); adaptador de 311 MB |
| Parametros activos | 1B (modelo base MoE) |
| Longitud de contexto | 4.096 tokens recomendados; hasta 8.192 soportados |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 (adaptador, código y documentación) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | inclusionAI/LLaDA-MoE-7B-A1B-Instruct |
| Configuracion LoRA | r=8, alpha=16, targets q/k/v/o/gate/up/down |
| Readout | one-step restricted-label (single mask slot) |
| Opciones por tarea | 2–26 (etiquetas A–Z); 6 recomendadas |
| Temperatura de calibracion | T = 1.33 (ajustada en held-out) |
| Descargas | 51 |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo base es LLaDA-MoE, un transformer de difusión de lenguaje (dLLM) con mezcla de expertos: 7B parámetros totales y 1B activos por token. A diferencia de los modelos autorregresivos, LLaDA genera mediante un proceso de difusión con enmascaramiento. El adaptador explota esta propiedad colocando un único marcador de máscara en la posición del asistente y leyendo directamente la distribución de probabilidad sobre las letras de opción válidas tras un solo paso de denoising, lo que constituye el mecanismo que el autor denomina "one-step restricted-label readout".

El adaptador es un LoRA con rango 8 y alpha 16 aplicado sobre las proyecciones de atención (q, k, v, o) y las proyecciones del FFN (gate, up, down). Se entrenó exclusivamente con datos públicos de licencia abierta y datos sintéticos generados para el proyecto, sin datos no comerciales ni de solo investigación. Las probabilidades se calibran con una temperatura única ajustada sobre datos held-out (T = 1.33), que reduce el error de calibración esperado de 0,047 a 0,016 sin alterar la letra elegida. El adaptador incluye además una ruta entrenada de verificación de afirmaciones (claim verification) bajo la misma licencia.

## Capacidades

- Decisión de opción múltiple: dado un estado, una pregunta y entre 2 y 26 opciones etiquetadas, devuelve una distribución normalizada sobre las letras válidas y selecciona la de mayor probabilidad.
- Inferencia en un solo forward pass, sin generación de texto ni parseo de la salida.
- Probabilidades calibradas (T = 1.33) para usar la confianza reportada en umbrales o sistemas de abstención.
- Verificación de afirmaciones (claim verification) mediante una ruta entrenada específica.
- Soporte bilingüe inglés y chino.
- Integración estándar con PEFT (`PeftModel.from_pretrained`) y con el script de referencia `inference.py` del repositorio.
- Capacidad de procesar contextos de hasta 8.192 tokens con `--max-seq-len 8192`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Enrutamiento de decisiones en pipelines: clasificar una situación descrita en texto entre un conjunto fijo de acciones (por ejemplo, escalar a humano, reintentar, descartar) en un solo forward pass, con la latencia de una única pasada de inferencia.
- Moderación y triaje de contenido: dado un estado y una pregunta con opciones de política (permitir, revisar, bloquear), obtener una distribución calibrada que permita fijar umbrales de derivación a revisión humana.
- Verificación de afirmaciones en RAG: comprobar si una respuesta generada está respaldada por el contexto recuperado usando la ruta de claim verification entrenada en el adaptador.
- Sistemas de decisión con abstención: gracias a la calibración de probabilidades (ECE 0,016), usar la confianza reportada para derivar casos ambiguos a un modelo mayor o a un humano.
- Evaluación comparativa de modelos de decisión: servir como referencia reproducible en JevBench v1.2.2 con el harness del proyecto, útil para investigar readouts restringidos frente a generación libre.
- Asistentes conversacionales con selección de siguiente paso: en dominios acotados (soporte técnico, atención al cliente) donde las respuestas posibles están predefinidas como opciones, evitando respuestas fuera de catálogo.
- Investigación en modelos de difusión de lenguaje: el adaptador permite estudiar el comportamiento de LLaDA-MoE como clasificador sin modificar los pesos base, al ser un LoRA independiente y redistribuible.

## Benchmarks y rendimiento

Resultados en JevBench v1.2.2 (231 tareas de decisión de opción múltiple), mismo harness, mismo readout one-step y contexto de 4.096 tokens:

| Modelo | easy | original | hard | all |
|---|---:|---:|---:|---:|
| Base (LLaDA-MoE-7B-A1B-Instruct) | 48/48 | 62/72 | 45/111 | 155/231 (67,1%) |
| JAD-S1 Early Preview | 48/48 | 67/72 | 60/111 | 175/231 (75,8%) |
| JAD-S1 v0.3 (este adaptador) | 48/48 | 70/72 | 77/111 | 195/231 (84,4%) |

Intervalo de confianza al 95% para 195/231: 79,2%–88,5%. El adaptador elimina el 49% de los errores del modelo base (de 76 a 39 respuestas incorrectas) y eleva el tier difícil del 40,5% al 69,4%.

Puntos de referencia públicos en las mismas 231 tareas (protocolo del índice Open-Jev, con límite de 16.384 tokens, por lo que los readouts difieren del one-step usado aquí):

| Modelo | all (231) |
|---|---:|
| GPT-5.6 Luna (none) | 206/231 (89,2%) |
| Jev 1.13.0 | 200/231 (86,6%) |
| Open-Jev 27B v1.1 | 197/231 (85,3%) |
| CLEF Flash | 191/231 (82,7%) |
| Open-Jev-9B | 179/231 (77,5%) |
| Dohnuts-0.1.0-0.8B | 152/231 (65,8%) |
| Laya Vision | 111/231 (48,1%) |
| Laya multilingual | 110/231 (47,6%) |

Otras métricas reportadas por el autor: Kev 75,44% por decisión (75,8% con pesos iguales) y VitaminC-dev 83,1%. La model card menciona benchmarks externos reportados por la tarjeta de NeoHorse-Jev-4B, pero los valores concretos no están completos en la información disponible.

## Requisitos de hardware

- El adaptador pesa 311 MB; los pesos base (7B totales, 1B activos) deben descargarse aparte.
- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa del modelo base de 7B, en fp16 requeriría del orden de 14 GB y en cuantización de 4 bits del orden de 4–5 GB, pero estas cifras no las publica el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, una GPU consumer de 16–24 GB (RTX 4090, RTX 4080) sería suficiente en fp16, y GPUs de datacenter (A100, H100) para servir en producción con mayor throughput.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo base, aunque el autor no lo confirma.
- Opciones de despliegue: `transformers` + `peft` (soporte oficial documentado), con `attn_implementation="sdpa"` y `trust_remote_code=True`; el script `inference.py` del repositorio reconstruye el rotary embedding del modelo base en el dispositivo destino. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La ventaja estructural es que la decisión se resuelve en un único forward pass sin generación autorregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench v1.2.2 (231) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JAD-S1-7B-A1B-v0.3 | 7B (1B activos) + LoRA | 4.096–8.192 | 195/231 (84,4%) | Apache-2.0 | Hugging Face |
| Open-Jev 27B v1.1 | 27B | no disponible | 197/231 (85,3%) | no disponible | Hugging Face |
| Open-Jev-9B | 9B | no disponible | 179/231 (77,5%) | no disponible | Hugging Face |
| Jev 1.13.0 | no disponible | no disponible | 200/231 (86,6%) | no disponible | no disponible |
| Dohnuts-0.1.0-0.8B | 0,8B | no disponible | 152/231 (65,8%) | no disponible | Hugging Face |

JAD-S1 v0.3 iguala prácticamente a Open-Jev 27B (84,4% frente a 85,3%) con un modelo base de 7B y solo 1B de parámetros activos, y supera claramente a Open-Jev-9B. Los datos de licencia y contexto de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- El modelo no genera texto: está diseñado exclusivamente para seleccionar entre opciones predefinidas de 2 a 26 etiquetas. No sirve para generación abierta, resumen ni diálogo libre.
- El límite recomendado es de 4.096 tokens; por encima de esa longitud debe activarse `--max-seq-len 8192` y el rendimiento en ese régimen no está documentado.
- La reproducción exacta de los resultados requiere usar `inference.py`, que reconstruye el rotary embedding del modelo base en el dispositivo destino; sin ese paso, algunas decisiones ajustadas pueden cambiar.
- La calibración de probabilidades depende de la temperatura T = 1.33 ajustada en held-out; recalibrar sobre otro dominio puede ser necesario.
- Riesgo de alucinación y sesgos: no documentados por el autor en la información disponible. Al ser un clasificador restringido, el riesgo de inventar opciones es bajo, pero la distribución puede concentrarse erróneamente en dominios alejados de los datos de entrenamiento.
- El adaptador depende del modelo base `inclusionAI/LLaDA-MoE-7B-A1B-Instruct` (Apache-2.0) y de `trust_remote_code=True`, lo que implica ejecutar código del repositorio base.
- El número de descargas (51) y de likes (0) es bajo, por lo que la validación comunitaria es escasa.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene revisar el fichero `NOTICE` del repositorio para las atribuciones de los datos de entrenamiento.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/DreamBlooms/JAD-S1-7B-A1B-v0.3
- Árbol de ficheros: https://huggingface.co/DreamBlooms/JAD-S1-7B-A1B-v0.3/tree/main
- Modelo base: https://huggingface.co/inclusionAI/LLaDA-MoE-7B-A1B-Instruct
- Tarjeta de NeoHorse-Jev-4B (referencia de benchmarks externos): https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B
