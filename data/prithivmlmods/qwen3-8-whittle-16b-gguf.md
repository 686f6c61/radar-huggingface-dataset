# prithivMLmods/Qwen3.8-Whittle-16B-GGUF

## Resumen

Qwen3.8-Whittle-16B-GGUF es la distribucion en formato GGUF del modelo Qwen3.8-Whittle-16B, una version comprimida del modelo Qwen3.8-27B (26.9B parametros) desarrollada por David Aylward con Claude como coautor y publicada por el usuario prithivMLmods en Hugging Face. El proceso de compresion elimina 20 de las 64 capas del modelo original mediante poda de profundidad guiada por el coste de frontera medido con logit lens, y recorta un 25% del ancho de cada MLP restante, resultando en una reduccion de 10.1B parametros sin reentrenamiento completo. Posteriormente se aplica un "heal" corto con QLoRA (r=64 en todas las capas lineales, 110 pasos, unos 11M tokens) para recuperar capacidades dañadas por la poda.

El modelo resultante tiene 16.344.368.864 parametros (16.3B) y se distribuye bajo licencia Apache 2.0. Esta etiquetado con el tag `qwen3_5` y `gated-deltanet`, lo que sugiere una arquitectura hibrida basada en Qwen 3.5 con componentes de tipo DeltaNet con compuertas, aunque la model card no detalla la arquitectura interna. Es un modelo de razonamiento (thinking model) que requiere presupuestos generosos de tokens y flags anti-bucle en el muestreo.

La relevancia de esta ficha radica en que se trata de una propuesta de investigacion (research preview) que explora tecnicas de compresion agresiva de modelos grandes para despliegue en hardware de consumo. El autor reporta que el modelo cuantizado a Q4_K_M (10.3 GB) alcanza 112.97 tokens/s de generacion en una RTX PRO 6000 Blackwell, y unos 18.5-20.9 tokens/s en una configuracion con RTX 4060 + RTX 3050. No obstante, la model card advierte explicitamente de que la compresion ha dañado gravemente la capacidad de desarrollo web y que el modelo puede caer en bucles de repeticion inutilizables en usos multi-turno o de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con componentes gated-deltanet (tag `qwen3_5`), derivado de Qwen3.8-27B |
| Parametros totales | 16.344.368.864 (16.3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en la prueba reportada; no se especifica el maximo nativo |
| Tipos de cuantizacion | Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B (26.9B parametros), etiquetado como `qwen3_5` y con el tag `gated-deltanet`, lo que apunta a una arquitectura hibrida que combina atencion clasica con capas de tipo DeltaNet con compuertas. Sobre esa base se aplica un proceso de compresion en dos fases: primero, poda de profundidad eliminando 20 de las 64 capas, seleccionadas por intervalos completos segun el coste de frontera medido con logit lens; segundo, poda de anchura recortando el 25% de cada MLP restante. El resultado es una reduccion de 10.1B parametros sin reentrenamiento.

Tras la poda se realiza un "heal" corto con QLoRA: rango 64 en todas las capas lineales, 110 pasos y aproximadamente 11M tokens de datos de linaje limpio. Una segunda version del heal (v2) añade fluidez en code-fencing y three.js, y es la version recomendada por el autor para los GGUF. El autor reporta que el modelo curado obtiene 36/39 en su bateria de 39 tareas con decodificacion greedy, frente a 25/39 del corte sin reparar y 33/39 de un corte mayor de 20.8B y 48 capas. La version v2 de los GGUF baja ligeramente a 35/39 pero corrige el code-fencing y reduce los bucles de un solo turno. No se detalla la composicion exacta del dataset de heal ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional en ingles, con modo de razonamiento (thinking model) que requiere presupuestos amplios de tokens.
- Razonamiento matematico basico y resolucion de problemas verbales: las pruebas reportadas incluyen problemas de trenes y caminantes, dos tuberias llenando un deposito, estudiantes en aulas de examen y edades padre-hijo.
- Generacion de codigo en tareas estructuradas: la prueba incluida cubre la insercion de un nodo al final de una lista enlazada simple en C.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no recomendado; la model card advierte de bucles inutilizables en usos de agente y multi-turno largos.
- Capacidades multilingues: solo ingles declarado.
- Capacidad especial de "heal" v2 para code-fencing y fluidez en three.js.
- No se declaran capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Evaluacion de tecnicas de compresion de modelos: el modelo sirve como caso de estudio reproducible de poda de profundidad y anchura con heal QLoRA, util para investigadores que quieran medir la degradacion por capa y el coste de recuperacion con presupuestos pequenos (110 pasos, 11M tokens).
- Razonamiento matematico de un solo turno en local: con Q4_K_M (10.3 GB) cabe en GPUs de consumo y resuelve problemas verbales aritmeticos; adecuado para prototipos de tutoria o validacion de problemas de libro de texto donde no se requiere multi-turno.
- Generacion de codigo acotada en C y estructuras de datos: la prueba de lista enlazada sugiere utilidad en ejercicios de algoritmia y snippet generation para entornos educativos, no para produccion.
- Despliegue en hardware limitado con llama.cpp: al distribuirse en GGUF desde Q3_K_M (8.39 GB) hasta Q6_K (13.4 GB), permite experimentar en equipos con 8-16 GB de VRAM o RAM unificada usando `llama-cli` o `llama-server`.
- Benchmarking de velocidad en GPUs Blackwell: la configuracion reportada (626.28 tokens/s de prompt processing y 112.97 tokens/s de generacion en RTX PRO 6000) sirve como referencia para comparar builds de llama.cpp y configuraciones de KV cache q8_0.
- Investigacion sobre bucles de repeticion y muestreo anti-loop: el modelo es un caso practico para estudiar DRY, repeat penalty y presupuestos de thinking en modelos comprimidos, ya que el autor documenta fallos concretos en prompts creativos abiertos como haikus.
- Pruebas de regresion de pipelines de cuantizacion: util para validar que las herramientas de llama.cpp producen GGUF funcionales a distintas profundidades de bits sobre un modelo ya degradado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta una bateria propia de 39 tareas con decodificacion greedy:

| Modelo | Bateria del autor (39 tareas, greedy) |
|---|---|
| Qwen3.8-Whittle-16B (healed) | 36/39 |
| Qwen3.8-Whittle-16B (healed v2, GGUF recomendado) | 35/39 |
| Corte sin reparar (16.8B) | 25/39 |
| Corte mayor 20.8B / 48 capas | 33/39 |

Rendimiento de inferencia reportado para Q4_K_M en NVIDIA RTX PRO 6000 Blackwell (96 GB VRAM, `llama-cli`, `-ngl 99`, contexto 16.384, KV cache q8_0):

| Metrica | Valor |
|---|---|
| Velocidad media de prompt processing | 626,28 tokens/s |
| Velocidad media de generacion | 112,97 tokens/s |
| Tiempo total de pared | 29,5 s |
| VRAM pico | 10,31 GiB |
| Utilizacion de GPU pico | 94% |
| Decodificacion especulativa | No |

El autor menciona ademas 18,5-20,9 tokens/s en una configuracion con RTX 4060 y RTX 3050 usando el GGUF Q4_K_M de 10,1 GB.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q3_K_M 8,39 GB; Q3_K_L 9,11 GB; Q4_K_S 9,61 GB; Q4_K_M 10,3 GB; Q5_K_S 11,4 GB; Q5_K_M 11,8 GB; Q6_K 13,4 GB. Añadir espacio para KV cache (en la prueba, q8_0 con 16.384 tokens mantiene el pico en 10,31 GiB con Q4_K_M).
- GPU recomendadas: RTX PRO 6000 Blackwell (probada, 96 GB), A100 o H100 para despliegues con contexto largo y multiples peticiones; RTX 4090 (24 GB) para Q6_K con contexto amplio.
- Cabe en GPU de consumo: si. Q3_K_M y Q4_K_S caben en GPUs de 10-12 GB; Q4_K_M en 12 GB; Q5 y Q6 requieren 12-16 GB. El autor lo ejecuta repartido entre una RTX 4060 y una RTX 3050.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y cualquier runtime compatible con GGUF; el repo incluye tags `llama-cpp`, `text-generation-inference` y `endpoints_compatible`, aunque no se documenta configuracion para vLLM ni TGI.
- Latencia y throughput: 112,97 tokens/s de generacion y 626,28 tokens/s de prompt processing en RTX PRO 6000 Blackwell; 18,5-20,9 tokens/s en RTX 4060 + RTX 3050. No se reportan datos de latencia por peticion ni throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-16B (este) | 16,3B | 16.384 en prueba | 35-36/39 en bateria propia | Apache 2.0 | GGUF en HF |
| Qwen3.8-27B (base) | 26,9B | no disponible | no disponible | no disponible | no disponible en esta ficha |
| Corte Whittle 20.8B / 48 capas | 20,8B | no disponible | 33/39 en bateria propia | no disponible | no disponible |
| Corte sin reparar (16.8B) | 16,8B | no disponible | 25/39 en bateria propia | no disponible | no disponible |

No se dispone de datos de benchmarks estandar ni de comparaciones con modelos de la misma categoria (por ejemplo, Qwen 3.5 de tamano similar sin podar) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo explicitamente etiquetado como research preview, no como asistente terminado; no apto para produccion sin validacion exhaustiva.
- Puede caer en bucles de repeticion inutilizables en conversaciones multi-turno largas y en uso de agente. Requiere flags anti-loop (DRY y repeat penalty) y presupuestos generosos de tokens.
- La capacidad de desarrollo web quedo gravemente dañada por la compresion; no usar para generacion de frontend, HTML/CSS/JS complejo o three.js mas alla de lo que el heal v2 recupera.
- Los prompts creativos abiertos (por ejemplo, haikus) pueden agotar el presupuesto de thinking sin producir salida util.
- Solo soporta ingles declarado; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion no cuantificado en la model card; al ser un modelo podado y curado con solo 110 pasos de QLoRA, la fidelidad factica puede ser inferior a la del modelo base.
- No se documentan sesgos especificos, pero al derivar de Qwen3.8-27B hereda los del modelo original, no evaluados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explicitamente el uso en produccion por la inestabilidad del modelo.
- El contexto maximo nativo no se especifica; la prueba usa 16.384 tokens y no hay garantia de comportamiento estable mas alla.
- Los resultados de velocidad son de una unica configuracion de hardware y build de llama.cpp; no deben extrapolarse sin medir.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Qwen3.8-Whittle-16B-GGUF
- Modelo base: https://huggingface.co/whittleOrg/Qwen3.8-Whittle-16B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
- Archivos GGUF: https://huggingface.co/prithivMLmods/Qwen3.8-Whittle-16B-GGUF/tree/main
