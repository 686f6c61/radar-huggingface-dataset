# mr-andrey-isachenko/Tenet-gemma-4-26B-A4B-it-Abliterated-Unslop-v2-GGUF

## Resumen

Tenet-gemma-4-26B-A4B-it-Abliterated-Unslop-v2-GGUF es la distribucion en formato GGUF del fine-tune Tenet-26B-A4B-Gemma4-Unslop-v2, derivado de google/gemma-4-26B-A4B-it. El autor, mr-andrey-isachenko, aplica una receta de cuantizacion mixta guiada por CKA (analisis de similitud de representaciones) en lugar de un pase uniforme de llama-quantize, con el objetivo de preservar el comportamiento de "de-refusal" y "de-slop" introducido en el fine-tune. El modelo es un MoE de aproximadamente 25.230 millones de parametros totales, con una rama activa de 4B segun la nomenclatura A4B.

La relevancia de esta publicacion es doble. Por un lado, demuestra una tecnica de cuantizacion selectiva que mantiene capas criticas (router MoE, expertos compartidos y un subespacio de capas 15-22) en precision alta para evitar que el comportamiento quirurgico del fine-tune se degrade al comprimir a 4-6 bits. Por otro, ofrece una via practica para desplegar un modelo de ~26B en hardware de consumo mediante llama.cpp, Ollama, LM Studio o Jan, con licencia Apache 2.0.

El modelo esta orientado a conversacion, generacion de codigo, uso de herramientas (tool calling) y flujos agenticos, y se distribuye como cuantizaciones IQ4_XS, Q4_K_M, Q5_K_M, Q6_K y Q8_0. No se dispone de informacion sobre idiomas soportados ni de detalles del dataset de entrenamiento del fine-tune original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), derivada de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.233.142.046 (~25,23 B) |
| Parametros activos | ~4 B (denominacion A4B; no se detalla el numero exacto) |
| Longitud de contexto | no disponible (el ejemplo de llama-cli usa -c 16384) |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (receta mixta CKA, ~5,118 bpw de media) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) heredado de google/gemma-4-26B-A4B-it: 25,23 mil millones de parametros totales con una rama activa de aproximadamente 4B por token. Sobre esa base, el autor aplica un fine-tune denominado Lancet, orientado a eliminar comportamientos de rechazo ("de-refusal") y respuestas de baja calidad o plantilla ("de-slop"). No se han publicado en la informacion disponible detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO.

La innovacion tecnica destacable de esta publicacion no esta en el entrenamiento sino en la cuantizacion. La receta cka_quant_recipe.json mantiene en Q8_0 las capas 0, 15, 16, 17, 18 y 29, y en Q6_K las capas 19 a 22, con una tasa media estimada de 5,118 bits por peso. Ademas, congela en BF16/Q8_0 los tensores de routing del MoE (ffn_gate_inp) y los pesos de shared_expert, de modo que los logits de la compuerta permanecen identicos a los de la cirugia original. El autor advierte que un pase uniforme de llama-quantize degrada silenciosamente estos tensores y puede reintroducir el comportamiento de rechazo.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Generacion y asistencia de codigo (tag "coding").
- Razonamiento matematico basico y de nivel medio (MATH-500 con 0,75 en el checkpoint padre FP8).
- Uso de herramientas y function calling (tag "tool-use").
- Flujos agenticos y razonamiento multi-paso (tag "agentic").
- Comportamiento "uncensored"/"abliterated": supresion del rechazo por defecto en el fine-tune.
- Compatibilidad con endpoints (tag endpoints_compatible) y con el ecosistema llama.cpp (Ollama, LM Studio, Jan).
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en editores o pipelines de CI/CD mediante llama.cpp u Ollama para autocompletado, revision de parches y generacion de tests, aprovechando su rama activa de ~4B para mantener latencia baja en hardware de consumo.
- Agente con tool calling: al soportar function calling y flujos multi-paso, puede orquestar llamadas a APIs (busqueda, calculo, acceso a ficheros) en un bucle agentico desplegado con llama-server o vLLM.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto configurable (el ejemplo oficial usa 16384 tokens) para gestionar historiales largos sin salir de una unica GPU.
- Prototipado de investigacion sobre alineacion: al ser un modelo "abliterated" y "unslop", sirve para estudiar el efecto de la supresion de rechazo y comparar comportamiento antes y despues del fine-tune.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones IQ4_XS (15,38 GB) y Q4_K_M (17,44 GB) permiten ejecutar el modelo en GPUs consumer de 24 GB o en configuraciones con offload parcial a CPU.
- Generacion de documentacion tecnica y resumenes: con contexto de 16k tokens puede procesar ficheros de codigo o articulos largos y producir resumenes y explicaciones.
- Evaluacion comparativa de recetas de cuantizacion: util para medir como afecta la preservacion CKA de capas y router a la calidad frente a cuantizaciones uniformes del mismo tamano.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el checkpoint padre FP8 (mr-andrey-isachenko/Tenet-26B-A4B-Gemma4-Unslop-v2). El autor indica que la escalera CKA los mantiene dentro del ruido de medida, pero no se aportan cifras propias de cada cuantizacion GGUF.

| Benchmark | Resultado |
|---|---|
| IFEval (strict) | 0,86 |
| IFEval (instruction strict) | 0,90 |
| MATH-500 | 0,75 |
| GSM8K (strict) | 0,21 |
| GPQA Diamond | 0,29 |
| MMLU-Pro | 0,26 |

No se han publicado resultados de benchmarks especificos para los ficheros GGUF de esta publicacion.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ4_XS 15,38 GB; Q4_K_M 17,44 GB; Q5_K_M 19,66 GB; Q6_K 22,66 GB; Q8_0 26,86 GB (tamanos de fichero indicados por el autor; la VRAM real debe sumar overhead de contexto KV).
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40 GB, H100 o RTX A6000 para Q8_0 y contextos largos.
- Cabe en GPU consumer: si, en tarjetas de 24 GB con IQ4_XS o Q4_K_M; en tarjetas de 16 GB requeriria offload parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio y Jan; el tag endpoints_compatible sugiere compatibilidad con APIs tipo OpenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-gemma-4-26B-A4B-it-Abliterated-Unslop-v2-GGUF | 25,23 B totales / ~4 B activos | no disponible | Apache 2.0 | GGUF | Fine-tune abliterated/unslop con cuantizacion CKA selectiva |
| google/gemma-4-26B-A4B-it | ~26 B totales / ~4 B activos | no disponible | Gemma (terminos propios) | safetensors | Modelo base oficial, sin modificaciones de rechazo |
| Tenet-26B-A4B-Gemma4-Unslop-v2 (padre FP8) | 25,23 B totales / ~4 B activos | no disponible | Apache 2.0 | FP8 | Checkpoint del que derivan estas cuantizaciones |

No se dispone de datos suficientes para comparar rendimiento con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": la supresion del rechazo puede producir contenido inapropiado, inseguro o fuera de politica; requiere filtros externos en produccion.
- Riesgo de alucinacion: los benchmarks de conocimiento (MMLU-Pro 0,26, GPQA Diamond 0,29) y de matematica aplicada (GSM8K strict 0,21) son bajos, lo que sugiere fiabilidad limitada en tareas de conocimiento y calculo.
- La receta de cuantizacion es especifica del autor; usar un pase uniforme de llama-quantize puede degradar el comportamiento del fine-tune segun advierte la model card.
- Idiomas soportados no documentados; no se recomienda asumir cobertura multilingue amplia.
- Longitud de contexto oficial no disponible; el valor de 16384 aparece solo como ejemplo de ejecucion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base google/gemma-4-26B-A4B-it puede estar sujeto a terminos adicionales de Gemma que conviene revisar.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.
- Fecha de creacion en el repositorio (2026-11-25) posterior a la fecha de referencia habitual; verificar la vigencia de los artefactos antes de desplegar.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mr-andrey-isachenko/Tenet-gemma-4-26B-A4B-it-Abliterated-Unslop-v2-GGUF
- Modelo base del fine-tune: https://huggingface.co/mr-andrey-isachenko/Tenet-26B-A4B-Gemma4-Unslop-v2
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Jan: https://jan.ai
