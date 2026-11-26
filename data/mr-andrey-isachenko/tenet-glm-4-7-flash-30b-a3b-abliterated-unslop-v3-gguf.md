# mr-andrey-isachenko/Tenet-GLM-4.7-Flash-30B-A3B-Abliterated-Unslop-v3-GGUF

## Resumen

Tenet-GLM-4.7-Flash-30B-A3B-Abliterated-Unslop-v3-GGUF es una cuantizacion GGUF de un fine-tune quirurgico del modelo `zai-org/GLM-4.7-Flash`, un transformer MoE de 30.000 millones de parametros totales con 3.000 millones activos por token (de ahi el sufijo A3B). El autor, mr-andrey-isachenko, aplica su pipeline "Lancet" para eliminar comportamientos de rechazo (de-refusal, conocido como *abliteration*) y reducir el estilo redundante o servil denominado *slop*, y despues publica los pesos en formato GGUF listos para llama.cpp, Ollama y LM Studio.

La particularidad de esta publicacion no es el fine-tune en si, sino la receta de cuantizacion. En lugar de un `llama-quantize` uniforme, emplea una estrategia mixta guiada por analisis CKA (centered kernel alignment) que mantiene a alta precision (Q8_0 y Q6_K) las capas donde vive el subespacio quirurgico del fine-tune, ademas de congelar en BF16/Q8_0 los tensores del router MoE (`ffn_gate_inp`) y los expertos compartidos. El objetivo declarado es que el comportamiento de de-rechazo no se degrade al bajar a 4-6 bits.

Es relevante para desarrolladores que quieran desplegar en hardware de consumo un MoE de 30B con contexto largo y capacidades de codigo y tool-use, sin depender de GPUs de datacenter, y que necesiten control fino sobre el comportamiento del modelo. La licencia es Apache 2.0. La model card no especifica idiomas soportados ni longitud de contexto exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) |
| Parametros totales | 30B (30.000 millones) |
| Parametros activos | 3B (3.000 millones) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (mezcla guiada por CKA en capas 26-33) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); checkpoint padre en FP8 |

## Arquitectura y entrenamiento

El modelo base `zai-org/GLM-4.7-Flash` es un transformer con arquitectura de mezcla de expertos: 30B parametros totales de los cuales solo 3B se activan por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano. Sobre ese checkpoint, el autor aplica un fine-tune "Lancet" descrito como *surgical de-refusal / de-slop*: modifica selectivamente un subespacio de activaciones para suprimir respuestas de rechazo y el estilo verboso, en lugar de reentrenar el modelo completo.

La innovacion tecnica destacable esta en la cuantizacion. La receta `cka_quant_recipe.json` identifica las capas 26 a 33 como portadoras del subespacio quirurgico; de ellas, las 26-29 se mantienen en Q8_0 y las 30-33 en Q6_K, mientras el resto del modelo puede comprimirse mas agresivamente. Ademas, los tensores de routing del MoE (`ffn_gate_inp`) y los pesos de `shared_expert` se conservan en BF16/Q8_0 para que los logits de la compuerta permanezcan identicos a los del checkpoint tras la cirugia; el autor advierte que un paso uniforme de `llama-quantize` degrada silenciosamente estos tensores. No se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y matematicas: la model card reporta GSM8K estricto de 0.83 y MMLU-Pro de 0.56.
- Generacion de codigo: la etiqueta `coding` figura entre las capacidades declaradas.
- Tool calling / function calling: etiqueta `tool-use` explicita.
- Uso agentico y razonamiento multi-paso: etiquetas `agentic` y `conversational`.
- Comportamiento "abliterated"/"uncensored": supresion deliberada de rechazos por el fine-tune.
- Reduccion de estilo redundante ("unslop"): respuestas menos verbosas y serviles.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede mantener dialogos multi-turno en local con llama.cpp u Ollama; la cuantizacion Q4_K_M es el punto de equilibrio recomendado por el autor para uso en portatil.
- Generacion de codigo en pipelines de CI/CD: con soporte de tool calling puede integrarse como agente que invoca herramientas de build, tests o linters dentro de un flujo automatizado.
- Agentes autonomos de multiples pasos: la etiqueta `agentic` y la arquitectura MoE con solo 3B activos permiten iteraciones rapidas en bucles de razonamiento sin el coste de un modelo denso de 30B.
- Investigacion sobre alineacion y refusal: al ser un modelo abliterated, sirve para estudiar como varia la tasa de rechazo segun la cuantizacion, dado que la receta CKA pretende preservar ese comportamiento a 4-6 bits.
- Evaluacion de tecnicas de cuantizacion: la publicacion incluye la receta `cka_quant_recipe.json` y capas protegidas documentadas, lo que la convierte en un caso de estudio reproducible para comparar cuantizacion uniforme frente a mixta guiada por CKA.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las variantes IQ4_XS y Q4_K_M estan pensadas para VRAM de portatil, permitiendo prototipado local de aplicaciones de texto sin coste de API.
- Filtrado y reescritura de texto: el fine-tune "unslop" reduce el estilo verboso, util para tareas de resumen o normalizacion de contenido.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre el checkpoint padre en FP8; la escalera CKA los mantiene, segun el autor, dentro del ruido de medicion.

| Benchmark | Puntuacion |
|---|---|
| IFEval (strict) | 0.78 |
| IFEval (instruction strict) | 0.85 |
| MATH-500 | 0.00 |
| GSM8K (strict) | 0.83 |
| GPQA Diamond | 0.33 |
| MMLU-Pro | 0.56 |

El valor de 0.00 en MATH-500 es llamativo y sugiere un fallo sistematico en ese formato de evaluacion o una degradacion introducida por el fine-tune; no se ofrece explicacion en la model card. No hay comparacion con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; las variantes IQ4_XS y Q4_K_M se describen como aptas para VRAM de portatil, lo que situa el rango practico en torno a 16-24 GB para Q4 y menos para IQ4_XS, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPU de consumo: si, segun el autor, al menos las variantes IQ4_XS y Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/...`), LM Studio y Jan. El autor no menciona vLLM ni TGI, coherente con el formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Tenet-GLM-4.7-Flash-30B-A3B (este) | 30B | 3B | no disponible | Apache 2.0 | GGUF |
| zai-org/GLM-4.7-Flash (base) | 30B | 3B | no disponible | no disponible | no disponible |
| Tenet-30B-A3B-GLM4.7-Unslop-v3 (padre) | 30B | 3B | no disponible | Apache 2.0 | FP8 |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo es un fine-tune abliterated: suprime rechazos de forma deliberada, lo que implica un riesgo elevado de generar contenido inapropiado, danino o no alineado con politicas de uso en produccion.
- La puntuacion de 0.00 en MATH-500 indica una posible regresion grave en razonamiento matematico simbólico; conviene validar antes de usar en tareas cuantitativas.
- Riesgo de alucinacion no cuantificado en la model card; al ser un fine-tune de comportamiento, la fidelidad factual puede diferir del modelo base.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar calidad en castellano o en ventanas largas.
- Las cifras de benchmarks proceden del checkpoint FP8, no de los GGUF; el autor afirma que se mantienen, pero no aporta mediciones directas sobre las cuantizaciones.
- El autor advierte que la cuantizacion uniforme degrada el router MoE y el comportamiento quirurgico; usar recetas distintas a la publicada puede alterar el comportamiento de forma impredecible.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin rechazos recae en el desplegador.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-GLM-4.7-Flash-30B-A3B-Abliterated-Unslop-v3-GGUF
- Modelo padre (fine-tune): https://huggingface.co/mr-andrey-isachenko/Tenet-30B-A3B-GLM4.7-Unslop-v3
- Modelo base original: https://huggingface.co/zai-org/GLM-4.7-Flash
