# INCModel4/gemma-4-26B-A4B-it-W4A16-AutoRound

## Resumen

Este repositorio contiene una version cuantizada a 4 bits (W4A16) del modelo multimodal `google/gemma-4-26B-A4B-it`, publicada por el usuario INCModel4. La cuantizacion se ha generado con la herramienta AutoRound de Intel, aplicando redondeo de pesos con descenso de gradiente con signo sobre 200 iteraciones de ajuste y un grupo simetrico de tamano 32. El resultado es un checkpoint que reduce el peso en disco a unos 16,8 GB y mantiene los pesos en formato safetensors, listo para servirse con vLLM 0.32.0 o superior.

El modelo base es un Mixture-of-Experts de Google con 26B parametros nominales y 4B parametros activos por token, orientado a tareas de imagen-texto a texto (image-text-to-text) y conversacion. Esta version cuantizada preserva en BF16 los componentes criticos para la estabilidad y la calidad multimodal: el router, las embeddings, la torre de vision y las normas. Solo se cuantizan los expertos enrutados, el MLP compartido y las capas de atencion.

La relevancia practica de esta ficha radica en que permite desplegar un modelo multimodal MoE de gran tamano en infraestructura mas modesta, manteniendo una recuperacion media del 101,35 % respecto al BF16 en los benchmarks reportados por el autor. Es una opcion interesante para entornos de investigacion y prototipado que necesitan vision y contexto largo sin disponer de un cluster de GPUs de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, derivada de google/gemma-4-26B-A4B-it |
| Parametros totales | 5.243.680.206 en el checkpoint cuantizado (nominal del base: 26B) |
| Parametros activos | 4B (A4B, segun nomenclatura del modelo base) |
| Longitud de contexto | 131.072 tokens (max_model_len usado en la evaluacion del autor) |
| Tipos de cuantizacion | W4A16, group_size 32, simetrica, 4 bits en pesos, activaciones en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (formato AutoRound, compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: 26B parametros totales con 4B activos por token, lo que reduce el coste computacional por inferencia frente a un denso equivalente. Incorpora una torre de vision para entrada de imagenes y texto, y un router que selecciona los expertos enrutados en cada capa. El checkpoint cuantizado mantiene en BF16 el router, las embeddings, la torre de vision y las capas de normalizacion, y aplica cuantizacion W4A16 (pesos a 4 bits, activaciones a 16 bits) a los expertos enrutados, al MLP compartido y a la atencion.

El proceso de cuantizacion se realizo con AutoRound de Intel, que optimiza el redondeo de pesos mediante descenso de gradiente con signo (paper arXiv:2309.05516). Se usaron 200 iteraciones de ajuste, 128 muestras de calibracion, grupo simetrico de tamano 32 y se excluyeron explicitamente la torre de vision y el router (`--ignore_layers vision_tower,router`). No se dispone de informacion sobre el dataset de entrenamiento original del modelo base, el numero de tokens, ni si hubo RLHF o DPO; esos datos corresponden a la model card de Google y no se incluyen en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento matematico y resolucion de problemas, con un rendimiento destacado en GSM8K (94,69 en la version cuantizada).
- Razonamiento de sentido comun y conocimiento general, medido en PIQA, HellaSwag y MMLU.
- Soporte de contexto largo de hasta 131.072 tokens, util para documentos extensos o conversaciones prolongadas.
- Compatibilidad con vLLM y con el ecosistema transformers, incluido `trust_remote_code`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible; la evaluacion se ejecuto con `enable_thinking=False`.

## Casos de uso

- Asistente visual para atencion al cliente: el modelo puede recibir capturas de pantalla o fotos de productos junto con texto y responder consultas multi-turno, aprovechando la torre de vision y la ventana de 131.072 tokens para mantener el historial completo de la conversacion.
- Analisis de documentos escaneados con contexto largo: al soportar 131.072 tokens, permite procesar informes, contratos o expedientes completos junto con imagenes de las paginas, resumiendo y extrayendo datos en una sola pasada.
- Prototipado de aplicaciones multimodales en investigacion: al reducir el peso a 16,8 GB y requerir vLLM 0.32.0, permite levantar un endpoint compatible con la API de OpenAI en una o dos GPUs de gama media para experimentar con vision y lenguaje.
- Generacion asistida de codigo y explicaciones tecnicas a partir de diagramas: el modelo puede interpretar esquemas de arquitectura o capturas de errores y generar codigo o explicaciones, combinando la entrada visual con el razonamiento textual.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia practica para estudiar la recuperacion de calidad de AutoRound W4A16 frente al BF16 en un MoE multimodal, con los scripts de `lm_eval` incluidos en la model card.
- Despliegue en entornos con restricciones de VRAM: al mantener en BF16 solo router, embeddings, torre de vision y normas, el checkpoint encaja en configuraciones de 2 GPUs con tensor parallelism, segun los parametros de evaluacion del autor.
- Sistemas de moderacion o descripcion de contenido visual: la combinacion de vision y contexto largo permite clasificar y describir lotes de imagenes con instrucciones textuales detalladas.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, comparando BF16 frente a W4A16:

| Benchmark | BF16 | W4A16 | Recuperacion |
|---|---:|---:|---:|
| PIQA | 72,58 | 73,67 | 101,50 % |
| HellaSwag | 47,34 | 48,77 | 103,01 % |
| MMLU | 46,44 | 48,08 | 103,53 % |
| GSM8K | 95,30 | 94,69 | 99,36 % |
| Media | 65,41 | 66,30 | 101,35 % |

No se han publicado en la informacion disponible resultados de benchmarks frente a modelos alternativos, ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 16,8 GB en disco; en vLLM con `dtype=bfloat16` y `gpu_memory_utilization=0.9`, el autor emplea `tensor_parallel_size=2`, lo que sugiere un despliegue en 2 GPUs. No se especifica la VRAM total necesaria.
- GPUs recomendadas: no disponible de forma explicita; el uso de FlashInfer como backend de atencion y tensor parallelism 2 apunta a GPUs de datacenter (A100, H100, L40S) o a dos GPUs consumer de gama alta con suficiente VRAM.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible; el peso del checkpoint (16,8 GB) mas el KV cache para 131.072 tokens hace inviable una unica GPU de 24 GB en configuracion completa.
- Opciones de despliegue: vLLM 0.32.0 (comando incluido en la model card) y transformers con `trust_remote_code=True`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Parametros de inferencia usados en la evaluacion: `max_model_len=131072`, `max_num_seqs=64`, `max_num_batched_tokens=32768`, `max_gen_toks=2048`, `kv_cache_dtype=auto`, `attention_backend=FLASHINFER`, `enable_prefix_caching=False`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| INCModel4/gemma-4-26B-A4B-it-W4A16-AutoRound | 26B nominales (5,24B en checkpoint) | 4B | 131.072 | W4A16 AutoRound | apache-2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it (BF16) | 26B | 4B | 131.072 | BF16 | licencia Gemma 4 | Hugging Face |
| Otras cuantizaciones W4A16 del mismo base | 26B | 4B | 131.072 | W4A16 | segun autor | no disponible en la informacion |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de otros fabricantes en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a variantes de cuantizacion del mismo.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de informacion veraz sin verificacion.
- Riesgo de generar contenido sesgado, ofensivo o inapropiado heredado del modelo base y de sus datasets de entrenamiento; se recomienda realizar pruebas de seguridad antes de desplegar.
- La cuantizacion W4A16 puede degradar tareas no cubiertas por los benchmarks reportados (PIQA, HellaSwag, MMLU, GSM8K); no hay evaluacion de tareas multimodales ni de contexto largo en la model card.
- Los idiomas soportados no estan documentados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- La licencia del checkpoint es apache-2.0, pero el modelo base remite a la licencia de Gemma 4 de Google; es necesario revisar y cumplir ambas antes de un uso comercial.
- El autor declara explicitamente que la licencia no constituye asesoramiento legal y recomienda consultar a un abogado antes de usar el modelo con fines comerciales.
- El despliegue requiere vLLM 0.32.0 o superior y el backend FlashInfer; configuraciones distintas pueden no funcionar o dar resultados diferentes.
- El repositorio tiene un numero muy bajo de descargas (40) y ningun like, por lo que no existe validacion comunitaria significativa del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INCModel4/gemma-4-26B-A4B-it-W4A16-AutoRound
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Repositorio de AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
