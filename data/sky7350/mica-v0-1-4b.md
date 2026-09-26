# sky7350/Mica-v0.1-4B

## Resumen

Mica v0.1 4B es un modelo de decisión de 4.215.122.944 parámetros desarrollado por el usuario sky7350 (repositorio `sky7350/Mica-v0.1-4B`). No es un modelo generativo: recibe un estado, una pregunta y un conjunto cerrado de respuestas permitidas, y devuelve una probabilidad para cada respuesta. Admite tres modos: binario sí/no, elección entre 2 y 255 opciones, y puntuación con 2 a 10 niveles. Al no generar texto, cada decisión cuesta un único prefill, lo que reduce la latencia frente a un LLM que razona por tokens.

El modelo parte de `Qwen/Qwen3.5-4B` (revisión `851bf6e`) y le aplica un LoRA de rango 16 fusionado sobre las 32 capas, con pesos publicados en safetensors BF16 y en GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0). Habla el formato TypeSafe `/v1/systemone`, de modo que los clientes escritos para Jev funcionan sin cambios. Está entrenado en inglés y coreano, y se distribuye bajo licencia Apache-2.0.

Su relevancia práctica está en el nicho de los modelos de decisión pequeños y «typesafe»: un componente de 4B que emite una etiqueta con distribución de probabilidad, útil como guardián, juez o enrutador dentro de agentes, con un coste de inferencia bajo. En el benchmark público JevBench obtiene 1.000 en easy, 1.000 en original y 0.649 en hard, con un ECE de 0.064 sobre una RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (base `Qwen/Qwen3.5-4B`, revision `851bf6e`) con LoRA de rango 16 fusionado en las 32 capas; detalles internos del base no disponibles |
| Parametros totales | 4.215.122.944 (4,22 B, dato real de safetensors) |
| Longitud de contexto | Entrada limitada a 8.192 tokens por el servidor de referencia (las entradas mayores se rechazan con HTTP 400, no se truncan); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | BF16 (safetensors y GGUF), Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache-2.0 (ver fichero `NOTICE` en el repositorio) |
| Formato de pesos | safetensors (BF16 fusionado) y GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0) |
| Tamano del repositorio | 38,0 GB |
| Pipeline declarado | text-classification (tambien etiquetado como text-generation, decision-model, judge) |
| Descargas / likes | 1.128 descargas / 17 likes |
| Fechas | Creado el 2026-09-25, actualizado el 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-4B`, un transformer decoder-only de la familia Qwen3.5, sobre el que se ha entrenado un LoRA de rango 16 aplicado a las 32 capas y posteriormente fusionado en los pesos BF16. Mica no genera texto: la salida es una distribución de probabilidad sobre el conjunto de respuestas permitidas, lo que se traduce en un solo prefill por decisión. El modelo se sirve a través del endpoint TypeSafe `/v1/systemone`, con un adaptador `typesafe` ya existente para JevBench.

El conjunto de entrenamiento consta de 77.732 filas. El autor declara que ningún ítem de JevBench se usó para entrenamiento: las comprobaciones de coincidencia exacta y de 8-gramas contra los 231 ítems públicos no encuentran ninguno en las filas de entrenamiento. Sin embargo, la mitad de los ítems públicos de la categoría hard, junto con Kev transfer v9 y SemIf, se usaron para comparar recetas durante el desarrollo y para fijar la escala del LoRA, que se mantuvo en 1.0. No se documentan en la información disponible detalles sobre composición exacta del dataset, uso de RLHF o DPO, ni innovaciones tipo decodificación especulativa o atención lineal.

## Capacidades

- Decisión binaria sí/no sobre un estado y una pregunta dados.
- Elección cerrada entre 2 y 255 opciones, devolviendo una probabilidad por opción.
- Puntuación en escala de 2 a 10 niveles (por ejemplo, valoraciones graduadas).
- Salida sin generación de texto: una única pasada de prefill por decisión.
- Compatibilidad con el formato TypeSafe `/v1/systemone`, lo que permite reutilizar clientes escritos para Jev sin modificaciones.
- Funciona como modelo juez o clasificador en flujos de evaluación automática (etiquetas `judge` y `classification`).
- Capacidades multilingües limitadas a inglés y coreano, incluyendo estilo de chat en coreano (86,7 % en el conjunto «Korean chat style»).
- Robustez relativa ante entradas perturbadas: en el conjunto «Perturbed inputs» (texto irrelevante añadido, relleno largo, caso enterrado, opciones reordenadas) obtiene 77,3 %, frente a 73,3 % del modelo hospedado JEV 1.13.
- No soporta tool calling, function calling ni razonamiento multi-paso generativo: su interfaz es la decisión puntuada.

## Casos de uso

- Guardián de acciones de agentes: antes de que un agente ejecute una operación sensible (por ejemplo, borrar una base de datos de staging), se envía el estado y la pregunta «¿debería el agente borrarla ahora?» y el modelo devuelve la probabilidad de sí/no. El ejemplo aparece literalmente en la documentación del autor.
- Enrutamiento de decisiones en pipelines multi-agente: elegir entre 2 y 255 herramientas, ramas o políticas según el estado de la conversación, aprovechando que la salida es una distribución y no texto libre.
- Evaluación automática de respuestas (LLM-as-judge): asignar una puntuación de 2 a 10 niveles a una respuesta generada por otro modelo, con ECE de 0.064 en JevBench, lo que indica una calibración razonable para umbrales automáticos.
- Moderación de contenido: clasificación binaria o multinivel de mensajes, con la ventaja de que la decisión no depende de una generación de texto que pueda desviarse.
- Triaje de tickets y correo entrante: elección cerrada entre categorías predefinidas, con contexto de hasta 8.192 tokens, suficiente para hilos de conversación largos (75,6 % en el conjunto «Long inputs, many options»).
- Control de acceso y motores de políticas: dado un estado con atributos del usuario y del recurso, decidir si se concede o deniega una acción concreta, integrándolo en un servicio HTTP propio.
- Encuestas y puntuación de sentimiento graduada: convertir texto en una escala de 2 a 10 niveles en inglés o coreano, sin generación de texto y con latencias p50 de 54 ms en RTX 3090.
- Verificación de hechos binaria en pipelines de curación de datos: marcar si una afirmación está respaldada por el contexto aportado en el campo de estado.

## Benchmarks y rendimiento

Datos del autor, precisión en % con el modelo BF16 en PyTorch. Cuando un modelo no puede aceptar una entrada (idioma, longitud, formato), el ítem cuenta como fallo. JEV 1.13 es el modelo hospedado de TypeSafe.

Conjuntos públicos:

| Conjunto | n | Mica | JEV 1.13 | Qwen3.5-4B | JevK5 4B | Kev 4B | Nimble 9B | Laya |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| JevBench easy | 48 | 100,0 | 100,0 | 100,0 | 100,0 | 100,0 | 100,0 | 97,9 |
| JevBench original | 72 | 100,0 | 98,3 | 91,7 | 93,3 | 91,7 | 91,7 | 65,0 |
| JevBench hard | 111 | 69,5 | 74,3 | 61,0 | 76,2 | 52,4 | 23,8 | 10,5 |
| SemIf | 252 | 94,4 | 98,4 | 80,2 | 86,1 | 89,3 | 93,2 | 65,1 |
| Kev transfer v9 | 1.264 | 69,2 | 82,0 | 66,1 | 70,5 | 73,5 | – | 53,8 |
| MMLU-Pro | 10.032 | 53,0 | 82,3 | 45,2 | 53,5 | 49,7 | – | – |

Conjuntos propios del autor (inglés y coreano):

| Conjunto | n | Mica | JEV 1.13 | Qwen3.5-4B | JevK5 4B | Kev 4B | Nimble 9B | Laya |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Held-out | 7.328 | 67,4 | 74,7 | 54,4 | 25,5 | 56,4 | 53,9 | 25,3 |
| Held-out, solo inglés | 3.044 | 67,0 | 74,1 | 55,0 | 61,0 | 57,0 | 54,8 | 32,6 |
| Held-out, solo coreano | 4.284 | 67,7 | 75,2 | 54,1 | – | 55,9 | 53,3 | 20,1 |
| Dev | 2.222 | 78,9 | 79,2 | 60,1 | 29,3 | 65,1 | 67,0 | 34,8 |
| Entradas perturbadas | 2.752 | 77,3 | 73,3 | 51,6 | 29,6 | 48,7 | 44,5 | 20,8 |
| Estilo chat coreano | 105 | 86,7 | 81,0 | 55,2 | – | 69,5 | 75,2 | 21,9 |
| Entradas largas, muchas opciones | 1.904 | 75,6 | 77,8 | 54,1 | 18,9 | 59,9 | 36,8 | 14,2 |
| Conocimiento | 322 | 81,1 | 91,9 | 65,2 | 42,2 | 68,0 | 73,9 | 39,1 |
| Transferencia de conceptos | 344 | 71,8 | 72,1 | 48,0 | 47,1 | 51,4 | 51,7 | 25,3 |

Resultados de JevBench a través del servidor llama.cpp y del runner de JevBench (RTX 3090, GGUF BF16, una petición a la vez, 231 ítems públicos, todos con respuesta válida): easy 1.000, original 1.000, hard 0.649, ECE 0.064, p50 54 ms, p95 552 ms. En el tier hard se observa una caída de 69,5 (PyTorch) a 64,9 (llama.cpp).

Dato adicional del conjunto perturbado: ante una nota dentro del estado que indica al modelo que elija una opción incorrecta, Mica acierta el 69,1 %, JEV 1.13 el 17,5 %, Kev 4B el 31,4 % y el Qwen3.5-4B base el 1,0 %. La misma nota apuntando a la opción correcta eleva a Mica al 88,7 %.

## Requisitos de hardware

- Peso del GGUF BF16: 9,7 GB (dato del autor). El peso de los ficheros Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0 no se publica (no disponible); para un modelo de 4,22 B de parámetros, una cuantización Q4_K_M suele ocupar en torno a 2,5-3 GB, cifra estimada y no confirmada por el autor.
- Los safetensors BF16 requieren, como referencia, unos 8,4 GB de pesos en memoria más caché KV y overhead del runtime: estimación, no publicada por el autor.
- GPU validada por el autor: RTX 3090 (24 GB), con GGUF BF16 y una petición simultánea.
- La imagen Docker se compila para arquitecturas CUDA 86, 89 y 90, ajustables con `--build-arg CUDA_ARCH=...`.
- Al ser un modelo de 4B, cabe en GPU de consumo con cuantizaciones bajas (Q4/Q5) en tarjetas de 8-12 GB; el autor no publica una matriz de VRAM por GPU (no disponible).
- Opciones de despliegue documentadas: servidor propio sobre llama.cpp b11010 compilado en `./runtime`, imagen Docker con `docker run --gpus all -p 8010:8010`, y ejecución en PyTorch con transformers para evaluación.
- Endpoint de servicio: `http://127.0.0.1:8010/v1/systemone`. Se puede forzar un fichero menor con `-e MICA_GGUF=mica-v0.1-4b-Q5_K_M.gguf`.
- Latencia medida (RTX 3090, GGUF BF16, una petición a la vez): p50 54 ms, p95 552 ms. No se publica throughput agregado en concurrencia (no disponible).
- No se documenta soporte para vLLM, TGI, Ollama ni TensorRT-LLM en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench hard | MMLU-Pro | Held-out | Licencia / disponibilidad |
|---|---|---|---|---|---|---|
| Mica v0.1 4B | 4,22 B | 8.192 tokens (límite del servidor) | 69,5 | 53,0 | 67,4 | Apache-2.0, pesos abiertos en HF (safetensors + GGUF) |
| JEV 1.13 | no disponible | no disponible | 74,3 | 82,3 | 74,7 | Modelo hospedado de TypeSafe, no disponible como pesos abiertos |
| Qwen3.5-4B (base) | 4 B (aprox.) | no disponible | 61,0 | 45,2 | 54,4 | Licencia del modelo base (no detallada aquí) |
| JevK5 4B | 4 B (aprox.) | no disponible | 76,2 | 53,5 | 25,5 | Solo inglés; muchas filas de los conjuntos propios no soportadas |
| Kev 4B | 4 B (aprox.) | no disponible | 52,4 | 49,7 | 56,4 | no disponible |
| Nimble 9B | 9 B (aprox.) | no disponible | 23,8 | – | 53,9 | no disponible |
| Laya | no disponible | 1.024 tokens | 10,5 | – | 25,3 | Muchas filas no soportadas por límite de contexto |

Los recuentos de parámetros de los modelos comparados no se detallan en la información disponible; las cifras marcadas como aproximadas proceden de la nomenclatura de sus nombres y no de datos verificados.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo distribuciones sobre respuestas permitidas. No sirve para chat, redacción ni razonamiento abierto.
- Límite duro de entrada: más de 8.192 tokens devuelve HTTP 400 en lugar de truncar, lo que obliga a gestionar la longitud en el cliente.
- Cobertura lingüística reducida a inglés y coreano. Otros idiomas no están soportados.
- Rendimiento inferior al modelo hospedado JEV 1.13 en la mayoría de conjuntos, con una diferencia notable en conocimiento (MMLU-Pro 53,0 frente a 82,3) y en Kev transfer v9 (69,2 frente a 82,0).
- Degradación al servir con llama.cpp: el tier hard de JevBench baja de 69,5 en PyTorch a 64,9 a través del servidor.
- Varios conjuntos de evaluación (entradas largas, estilo chat y conocimiento) están cerca de la distribución de entrenamiento; el propio autor indica que deben leerse como resultados in-distribution.
- Riesgo de contaminación parcial: la mitad de los ítems públicos hard, junto con Kev transfer v9 y SemIf, se usaron durante el desarrollo para comparar recetas y fijar la escala del LoRA, aunque se verificó que ningún ítem público de JevBench aparece en las 77.732 filas de entrenamiento.
- Sensibilidad a instrucciones inyectadas en el campo de estado: una nota que pide elegir una opción incorrecta reduce la precisión al 69,1 % (frente a 1,0 % del base Qwen3.5-4B), y la misma nota apuntando a la opción correcta la eleva al 88,7 %. El texto del estado influye de forma medible en la decisión.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en dominios alejados de los datos de entrenamiento.
- La licencia es Apache-2.0, lo que permite uso comercial, pero el repositorio remite a un fichero `NOTICE` que debe revisarse antes de desplegar en producción.
- El repositorio ocupa 38,0 GB, por lo que conviene descargar únicamente la revisión y el fichero de cuantización necesarios (`--revision ca36594...`).
- No se documentan sesgos específicos de género, raza o ideología en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sky7350/Mica-v0.1-4B
- Repositorio de código, Dockerfile y scripts: https://github.com/akivet/Mica-v0.1-4B
- Resultados por ítem del conjunto público de 231 elementos: https://github.com/akivet/Mica-v0.1-4B/blob/main/results/public231/mica-v0.1-4b.jsonl
- JevBench (runner y adaptador typesafe): https://github.com/fstandhartinger/jevbench
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revisión `851bf6e`)
- Revisión de pesos citada por el autor: `ca36594cc2067c7252704f9f304cc10ef11c7c5c`
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
