# ntu-paslab-llm2/gemma-4-31B-it-RTL-DPO-f4sig

## Resumen

Gemma-4-31B-it-RTL-DPO-f4sig es un ajuste fino del modelo instructivo multimodal google/gemma-4-31B-it, desarrollado por el grupo ntu-paslab-llm2 (Universidad Nacional de Taiwán, laboratorio PASLAB). El modelo está especializado en diseño RTL (Verilog y SystemVerilog): generación de RTL a partir de especificaciones, escritura de testbenches y sesiones agénticas de diseño en las que el modelo lee, escribe y simula ficheros mediante herramientas. Se distribuye como sustituto directo del modelo base: mismo tokenizador, misma plantilla de chat y misma arquitectura Gemma4ForConditionalGeneration en bf16 con 31.273.088.876 parámetros repartidos en dos shards de safetensors.

La especialización se consigue mediante cuatro rondas iterativas de DPO on-policy (sin término SFT), en las que cada ronda parte del checkpoint de la anterior y construye los pares de preferencia a partir de los propios rollouts del modelo, sin profesor externo. La receta usa pérdida DPO sigmoide, beta 0.1, learning rate 5e-7, batch efectivo 16, 2 épocas y longitud máxima de secuencia de 20.480 tokens, entrenando en 2 nodos de 8 H100 en bf16. Solo se emplearon datos de texto; los pesos de visión se heredan sin modificar y no fueron evaluados.

Su relevancia actual es doble: por un lado, demuestra que el DPO iterativo on-policy sobre un modelo grande puede aportar mejoras medibles en una tarea de nicho (diseño de hardware) sin degradar capacidades generales de razonamiento o de uso de herramientas; por otro, ofrece una alternativa abierta (licencia Apache 2.0) para pipelines de generación de código HDL que hasta ahora dependían de modelos propietarios o de ajustes menos reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer multimodal, pesos en bf16) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa --max-model-len 65536 y el entrenamiento usó secuencias de hasta 20.480 tokens |
| Tipos de cuantizacion | no disponible (el repo publica pesos en bf16) |
| Idiomas soportados | no disponible (entrenado y evaluado solo en inglés para tareas de diseño de hardware) |
| Licencia | apache-2.0, con los términos de Gemma 4 enlazados en la model card |
| Formato de pesos | safetensors (dos shards, bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 4 instructiva de 31.270 millones de parámetros, que en el modelo base es multimodal (image-text-to-text) y se carga mediante Gemma4ForConditionalGeneration. El ajuste no altera la arquitectura: mantiene tokenizador, plantilla de chat y pesos de visión originales, y solo modifica los pesos mediante DPO sobre datos de texto de diseño RTL. El repositorio ocupa 62,6 GB, coherente con dos shards en bf16.

El entrenamiento consiste en cuatro rondas consecutivas de DPO on-policy: f1sig (6.511 pares, desde el modelo base), f2sig (2.459 pares, desde f1sig), f3sig (2.348 pares, desde f2sig) y f4sig (1.530 pares, desde f3sig). Los pares elegido/rechazado provienen de los propios rollouts del checkpoint de partida; cuando existe un testbench ejecutable, la preferencia se decide por simulación, y en caso contrario por mayoría 2-de-3 de los propios juicios del modelo. Las tareas cubren generación de RTL desde especificación, escritura de testbenches y sesiones agénticas multiturno con herramientas sobre un currículo de módulos RTL de código abierto. La innovación principal es el bucle iterativo de autoetiquetado con verificación por simulación, que evita depender de un modelo profesor y permite refinar preferencias específicas del dominio HDL.

## Capacidades

- Generación de RTL en Verilog y SystemVerilog a partir de especificaciones en lenguaje natural.
- Escritura de testbenches para verificación de módulos HDL.
- Sesiones agénticas multiturno: el modelo lee, escribe y simula ficheros mediante herramientas (evaluado con el arnés CVDP en modo agentic).
- Razonamiento con modo thinking habilitado (la evaluación usa thinking enabled y hasta 32.768 tokens nuevos por turno).
- Uso de herramientas y function calling conversacional (evaluado con BFCL v4 multiturno).
- Razonamiento matemático general (evaluado con AIME 2026, avg@16).
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque los pesos de visión no se ajustaron ni evaluaron.
- Capacidades multilingües: no disponibles; el ajuste y la evaluación se limitan a inglés.

## Casos de uso

- Generación de RTL desde especificación: el modelo transforma descripciones funcionales en módulos Verilog/SystemVerilog; es adecuado porque el DPO se entrenó específicamente con pares de esta tarea y mejora el pass@1 de CVDP one-shot de 43,87 a 45,70.
- Escritura automática de testbenches: genera bancos de pruebas para módulos existentes, aprovechando que durante el entrenamiento los pares se validaron por simulación cuando había testbench ejecutable.
- Sesiones agénticas de diseño: integrado en un agente que lee, escribe y simula ficheros, mejora el pass@1 de CVDP agentic de 50,65 a 53,12 y el pass@10 de 68,24 a 70,00, por lo que es la modalidad donde más rinde.
- Asistente de refactorización y revisión de HDL: puede reescribir módulos, añadir aserciones o completar código incompleto en un flujo conversacional con contexto de hasta 65.536 tokens en despliegue vLLM.
- Automatización de pipelines de verificación en CI: conectado a herramientas de simulación mediante function calling, puede generar y ejecutar testbenches dentro de un pipeline, con la advertencia de fijar siempre max_tokens por los bucles de repetición.
- Docencia y prototipado de hardware: útil para generar ejemplos de módulos y ejercicios de verificación en cursos de diseño digital, dado que el modelo conserva las capacidades generales del base (AIME 2026 sube de 88,75 a 91,25).
- Sustituto directo en despliegues existentes de Gemma 4 31B: al compartir tokenizador, plantilla de chat y arquitectura, puede reemplazar al modelo base en un servicio vLLM sin cambios de integración.

## Benchmarks y rendimiento

Evaluación con el arnés oficial CVDP de NVIDIA (categorías cid002 y cid003), decodificación con temperatura 1.0, top_p 0.95, top_k 64, thinking habilitado y 32.768 tokens nuevos máximos por turno. Los deltas son diferencias de pass@1 con intervalo bootstrap del 95 %.

| Benchmark | Métrica | Base gemma-4-31B-it | f4sig | Delta |
|---|---|---|---|---|
| CVDP one-shot (respuesta única) | pass@1 / 3 / 5 / 10 | 43,87 / 54,31 / 58,25 / 62,83 | 45,70 / 57,00 / 60,29 / 63,65 | +1,83 [-0,3, +4,1] |
| CVDP agentic (sesiones con herramientas, 10 muestras por problema) | pass@1 / 3 / 5 / 10 | 50,65 / 61,64 / 64,99 / 68,24 | 53,12 / 63,12 / 66,31 / 70,00 | +2,47 [+0,3, +4,6] |

Controles de regresión (no RTL):

| Benchmark | Base | f4sig |
|---|---|---|
| AIME 2026, avg@16 | 88,75 | 91,25 |
| BFCL v4 multiturno (media de 3 ejecuciones) | 66,34 | 65,42 |

La ganancia one-shot queda dentro del ruido del intervalo; la ganancia agentic es pequeña pero cae fuera del intervalo. Según el autor, la mayor parte de la mejora agentic apareció en la primera ronda y las rondas posteriores alargaron principalmente el razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62,6 GB solo de pesos, más caché KV; se recomienda al menos 80 GB por GPU o tensor parallelism.
- El autor entrenó con 2 nodos de 8 H100; el ejemplo de despliegue usa vLLM con --tensor-parallel-size 2 y --max-model-len 65536, lo que encaja en 2 GPU de 80 GB (A100 80GB, H100 80GB) o más.
- No cabe en GPU de consumo (RTX 4090 de 24 GB) en bf16; no se han publicado cuantizaciones GGUF ni versiones de menor precisión en la información disponible.
- Opciones de despliegue: vLLM (recomendado por el autor) o carga directa con transformers usando la plantilla de chat incluida.
- Latencia y throughput: no disponibles; el autor advierte de que las trazas de razonamiento son más largas que en el modelo base, por lo que el tiempo por tarea aumenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31B-it-RTL-DPO-f4sig | 31,27 B | no disponible (despliegue a 65.536) | RTL Verilog/SystemVerilog vía DPO | Apache 2.0 (términos Gemma 4) | Hugging Face |
| google/gemma-4-31B-it | 31,27 B | no disponible | Modelo instructivo general multimodal | Apache 2.0 (términos Gemma 4) | Hugging Face |
| Alternativas especializadas en RTL de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es contra el propio modelo base: f4sig mejora CVDP agentic pass@1 en +2,47 puntos y mantiene o mejora los controles de regresión (AIME 2026 +2,5; BFCL v4 -0,92). No se dispone de datos de otros modelos especializados en RTL en la información proporcionada.

## Limitaciones y advertencias

- Trazas de razonamiento más largas que el modelo base, lo que incrementa el tiempo de reloj por tarea.
- Riesgo de bucles de repetición en generaciones muy largas; es obligatorio fijar max_tokens.
- Entrenado y evaluado solo en inglés y en tareas de diseño de hardware; no hay garantías en otros idiomas.
- Ajustado únicamente en Verilog/SystemVerilog; no se reclama nada sobre otros lenguajes de descripción de hardware ni sobre la calidad de síntesis más allá de superar los testbenches del benchmark.
- Los pesos de visión se heredan sin ajustar y no fueron evaluados; el rendimiento multimodal no está validado.
- No se han publicado datos sobre sesgos, tasa de alucinación ni cuantizaciones; el repositorio no incluye versiones GGUF.
- La licencia Apache 2.0 remite a los términos de Gemma 4; conviene revisar dichos términos antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 12 de noviembre de 2026; se trata de una publicación muy reciente y poco validada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ntu-paslab-llm2/gemma-4-31B-it-RTL-DPO-f4sig
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Términos de licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
