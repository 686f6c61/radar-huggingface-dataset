# AmSach/Inkling-2-Mini-MAPLE-Sub5GB-GGUF

## Resumen

Inkling 2 Mini MAPLE es una compresión del modelo base `thinkingmachines/Inkling-2-Mini` (26.400 millones de parámetros totales, 3.400 millones activos) mediante la técnica MAPLE (Mass-Aware Pruning of Looped MoEs), desarrollada por el usuario AmSach. El objetivo es reducir el peso del modelo por debajo de los 5 GB para que pueda ejecutarse íntegramente en VRAM en GPUs de gama de entrada con 6 GB, como la RTX 4050 o 3050 para portátiles, eliminando el cuello de botella del offload a CPU.

El modelo base emplea una arquitectura de mezcla de expertos (MoE) con bucle: 24 capas físicas donde las capas 6 a 17 se repiten 3 veces, generando 48 capas virtuales de enrutamiento y unos 5.400 millones de parámetros efectivos. MAPLE poda los expertos enrutados por capa (de 128 a 64 o 56, según la variante) y aplica una cuantización agresiva IQ2_XXS calibrada con imatrix, preservando las rutas de enrutamiento que el bucle necesita para no colapsar.

Se publican dos variantes GGUF: una orientada a razonamiento y código (64 expertos, 4,85 GB, 78,0 % en HumanEval con 50 tareas) y otra orientada a contexto largo (56 expertos, 4,39 GB, hasta 16.384 tokens en 6 GB de VRAM). La licencia es Apache 2.0 y está pensada para llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas (looped MoE), 24 capas fisicas, capas 6-17 repetidas 3 veces (48 capas virtuales) |
| Parametros totales | 12.306.990.080 en el checkpoint publicado; 26.4B en el modelo base original |
| Parametros activos | 3.4B en el modelo base; 5.4B efectivos por el bucle 3x (no disponible el dato exacto tras la poda) |
| Longitud de contexto | 8.192 tokens (variante 64exp-Work); 16.384 tokens (variante 56exp-Blended) |
| Tipos de cuantizacion | IQ2_XXS con imatrix (variantes publicadas); el base tiene UD-IQ2_XXS y UD-IQ3_XXS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (v3, quant personalizada) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de mezcla de expertos con una innovación estructural: las 12 capas centrales (6 a 17) se ejecutan tres veces de forma secuencial por token, lo que crea 48 capas virtuales de enrutamiento sobre 24 capas físicas. Esto multiplica la capacidad efectiva de razonamiento sin incrementar el coste de memoria proporcionalmente. La compresión MAPLE actúa sobre los expertos enrutados por capa, reduciendo de 128 a 64 (50,0 % de retención) o a 56 (43,8 %) según la variante, y aplica cuantización IQ2_XXS calibrada con imatrix sobre un corpus libre de fugas de código y conversación multi-turno.

El hallazgo técnico destacado por el autor es el "acantilado de inanición de expertos" (expert starvation cliff): con 44 expertos (34,4 % de retención) el enrutamiento colapsa en bucles repetitivos a lo largo de las 48 capas virtuales y HumanEval cae a 0 %. Con 64 expertos el colector de enrutamiento se mantiene diverso en las tres pasadas del bucle y se preserva el razonamiento de alto orden. No se detalla en la información disponible el volumen de tokens de entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento con traza paso a paso (soporta `reasoning_effort` en llama.cpp).
- Generación de código: 78,0 % en HumanEval con 50 tareas (variante 64exp-Work).
- Razonamiento matemático básico: 22,0 % en GSM8K con 50 tareas.
- Formato de chat compatible con plantilla tipo ChatML (`<|im_start|>` / `<|im_end|>`) y flag `--jinja`.
- Compatible con endpoint OpenAI en `llama-server` (tags `endpoints_compatible`).
- Ejecución local en GPU de 6 GB con todos los pesos en VRAM.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Sin capacidades de visión ni audio: 0 % en ARC-AGI v1 y v2 (transformaciones visuales-espaciales de rejilla).

## Casos de uso

- Asistente de código en portátil de gama de entrada: con 78,0 % en HumanEval y 4,85 GB, se puede ejecutar un copiloto de autocompletado de funciones Python en una RTX 4050 Laptop sin offload, con 35,8 tokens/s de generación.
- Servidor local compatible con OpenAI para prototipado: `llama-server` expone un endpoint OpenAI en 127.0.0.1:8080 con 8.192 tokens de contexto, útil para probar aplicaciones que consumen la API de OpenAI sin coste ni latencia de red.
- Razonamiento con traza en entornos con recursos limitados: el modo `reasoning_effort` permite obtener cadenas de razonamiento paso a paso para depuración de lógica o tutoría, dentro de 4,4 GB de VRAM.
- Procesamiento de documentos largos: la variante 56exp-Blended soporta 16.384 tokens en 6 GB de VRAM (4.684 MiB totales), adecuada para resumir o extraer información de contratos, artículos o hilos de conversación extensos.
- Chat multi-turno de atención al cliente en local: la plantilla ChatML y el contexto de 8k permiten mantener conversaciones con historial en una máquina sin GPU dedicada de gama alta, con 1,3 GB de margen de VRAM.
- Evaluación e investigación de técnicas de poda MoE: el checkpoint sirve como referencia reproducible para estudiar el efecto de la retención de expertos en modelos con bucle de capas, comparando 64 frente a 56 expertos con el mismo runtime.
- Despliegue en entornos air-gapped: al ser GGUF con licencia Apache 2.0 y ejecutarse en llama.cpp, se puede distribuir en equipos sin conexión para tareas de generación de texto y código.

## Benchmarks y rendimiento

Medidos por el autor en una NVIDIA GeForce RTX 4050 6 GB Laptop (6.141 MiB, bus de 96 bits, 192 GB/s, 50 W TGP) con llama.cpp b12774+, Flash Attention y CUDA 12.4.

| Suite | Muestra | Resultado | IC 95 % |
|---|---|---|---|
| HumanEval | 50 tareas | 78,0 % (39/50) | [66,0 %, 88,0 %] |
| GSM8K | 50 tareas | 22,0 % (11/50) | [12,0 %, 34,0 %] |
| WikiText-2 perplejidad | 40 fragmentos (512 ctx) | 30,006 ± 0,876 | no disponible |
| ARC-AGI v1 | 40 tareas | 0,0 % (0/40) | [0,0 %, 0,0 %] |
| ARC-AGI v2 | 40 tareas | 0,0 % (0/40) | [0,0 %, 0,0 %] |

Rendimiento de inferencia (`llama-bench -r 10`):

| Configuración | Tamano | Capas en GPU | pp512 (t/s) | tg128 (t/s) |
|---|---|---|---|---|
| Base UD-IQ3_XXS sin poda | 11,66 GB | 18/49 | 12,36 ± 0,59 | 3,38 ± 0,51 |
| Base UD-IQ2_XXS sin poda | 8,49 GB | 14/49 | 83,04 ± 0,50 | 12,13 ± 0,84 |
| MAPLE 64exp-Work | 4,85 GB | 49/49 | 546,41 ± 1,94 | 35,83 ± 1,17 |
| MAPLE 56exp-Blended | 4,39 GB | 49/49 | 550,04 ± 1,34 | 36,08 ± 0,13 |

## Requisitos de hardware

- VRAM para la variante 64exp-Work: 4.826 MiB totales a 8.192 tokens de contexto con KV cache Q8_0 (4.082 MiB de pesos + 242 MiB de KV + 502 MiB de overhead CUDA).
- VRAM para la variante 56exp-Blended: 4.684 MiB totales a 16.384 tokens con KV Q8_0 (3.698 MiB de pesos + 484 MiB de KV + 502 MiB de overhead).
- GPU objetivo: NVIDIA GeForce RTX 4050 / 3050 Laptop GPU con 6 GB. Cabe con 1,3-1,5 GB de margen.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 3050/4050/4060, RTX 2060, A100/H100 sobran para esta variante). No cabe en GPUs de 4 GB.
- Cabe en GPU consumer: sí, en las mencionadas de 6 GB. En 8 GB o más hay margen para contexto mayor o KV cache sin cuantizar.
- Despliegue: llama.cpp (build b12774 o posterior, requerido para MoE con bucle y GGUF v3 personalizado), `llama-cli` y `llama-server`; tags de compatibilidad con Ollama.
- Throughput medido: 35,8 t/s de generación y 546 t/s de procesamiento de prompt en RTX 4050 Laptop (10,6x y 44,2x frente al base IQ3_XXS sin poda).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini MAPLE 64exp-Work | 12,3B totales (MoE podado) | 8.192 | 78,0 % (50 tareas) | Apache 2.0 | GGUF IQ2_XXS |
| Inkling-2-Mini MAPLE 56exp-Blended | no disponible tras poda | 16.384 | no disponible | Apache 2.0 | GGUF IQ2_XXS |
| Inkling-2-Mini base UD-IQ3_XXS | 26,4B totales / 3,4B activos | no disponible | no disponible | Apache 2.0 | GGUF |
| Inkling-2-Mini base UD-IQ2_XXS | 26,4B totales / 3,4B activos | no disponible | no disponible | Apache 2.0 | GGUF |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada; la comparativa se limita a las variantes del propio modelo y su base.

## Limitaciones y advertencias

- Razonamiento matemático limitado: 22,0 % en GSM8K con 50 tareas, insuficiente para producción en tareas aritméticas o de varios pasos.
- Sin capacidades visuales ni de razonamiento abstracto sobre rejillas: 0 % en ARC-AGI v1 y v2.
- La poda a 44 expertos colapsa el enrutamiento y lleva HumanEval a 0 %; no se recomienda bajar de 64 expertos en esta arquitectura con bucle.
- La cuantización IQ2_XXS es muy agresiva y puede degradar la coherencia en contextos largos o dominios especializados; la perplejidad en WikiText-2 es de 30,006, relativamente alta.
- El contexto máximo práctico es de 8.192 tokens en la variante flagship; 16.384 solo en la variante de 56 expertos.
- Idiomas soportados no documentados; no se garantiza calidad fuera del inglés.
- Riesgo de alucinación inherente a modelos de este tamaño y cuantización; requiere validación en producción.
- Requiere llama.cpp b12774 o posterior; versiones anteriores pueden no manejar correctamente el MoE con bucle y la quant personalizada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus derivados deben cumplir también las condiciones del modelo original `thinkingmachines/Inkling-2-Mini`.
- Solo 2 likes y 0 descargas en el momento de la ficha: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/AmSach/Inkling-2-Mini-MAPLE-Sub5GB-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del base: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
