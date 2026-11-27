# existentialbirds/Inkling-2-Mini-mlx-vlm-4bit

## Resumen

Inkling-2-Mini-mlx-vlm-4bit es una cuantizacion de precision mixta del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario existentialbirds para su uso con la libreria mlx-vlm sobre hardware Apple Silicon. El modelo original lo desarrolla Thinking Machines Lab y es un VLM (vision-language model) con arquitectura MoE y un esquema de capas recurrentes denominado inkling2_loop, con 26.388.641.280 parametros totales y 48 visitas de capa por token. Esta version empaqueta los pesos en formato MLX (safetensors) con un peso total de 17,3 GB en el repositorio y una precision efectiva de 5,24 bits por peso.

El checkpoint resuelve el problema de ejecutar un modelo multimodal de gran tamano en equipos de consumo con memoria unificada (probado en un Apple M4 Max de 40 nucleos GPU y 48 GB), manteniendo los expertos MoE enrutados en sus formatos originales nvfp4 y mxfp8 y cuantizando solo las capas densas de texto a 4 bits afines. La model card reporta validacion con coseno de logits de primer token de 0,9986-0,9996 frente al modelo base NVFP4 y KL de 0,00000 nats, ademas de recuperacion exacta en pruebas needle a 33,2K y 132,8K tokens de contexto.

Es relevante ahora porque demuestra que un VLM MoE de 26B puede servirse en local con decodificacion especulativa opcional (54,3 tok/s en generacion de codigo con un drafter companero), tool calling y vision, con licencia Apache 2.0 y un consumo de memoria pico de 23,9 GiB en contextos de hasta 33K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes (inkling2_loop), vision tower inkling2_vision |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | 131K (hasta 132,8K validado en pruebas needle) |
| Tipos de cuantizacion | 4-bit afines (group_size=64) en capas densas de texto; expertos MoE enrutados en nvfp4 (group_size=16, capas 0..19) y mxfp8 (group_size=32, capas 20..23); vision tower y estado de router/loop en BF16/FP32 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout mlx-vlm: language_model.*, vision_tower.*, processor_config.json, tiktoken/tokenizer.model) |

## Arquitectura y entrenamiento

El modelo base es un VLM con arquitectura MoE y un mecanismo de capas recurrentes (inkling2_loop) que realiza 48 visitas de capa por token, lo que implica reutilizacion de pesos y un coste computacional distinto al de un transformer denso convencional. Incluye un vision tower independiente (inkling2_vision) para el procesamiento de imagenes y un router de mezcla de expertos. La model card de esta cuantizacion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO; esa informacion corresponderia a la model card del modelo base thinkingmachines/Inkling-2-Mini, no incluida en la informacion disponible.

La innovacion tecnica de este checkpoint es la estrategia de cuantizacion de precision mixta: los expertos MoE enrutados conservan sus formatos de origen (nvfp4 y mxfp8) para que el kernel inkling2_grouped_expert_qmv opere sin recuantizar, mientras que las capas densas de texto (atencion, embed_tokens y lm_head) se cuantizan a 4 bits afines con group_size=64, reduciendo la lectura en decodificacion de 6,30 a 3,03 GB por token. Ademas, el autor mantiene un fork de mlx-vlm (rama perf/inkling2-serving) con optimizaciones de serving: limite de asignacion de mascaras de atencion relativa global (6,1 GiB con prefill-step-size 512 frente a 24,3 GiB con 2048 para 131K de contexto) y soporte de decodificacion especulativa con un modelo drafter (Inkling-2-Mini-DSpark-mlx-vlm-4bit, draft-kind dflash, block-size 5).

## Capacidades

- Generacion de texto conversacional y razonamiento con niveles de esfuerzo configurables mediante reasoning_effort ("none", "low", "medium", "high"; por defecto 0.9).
- Procesamiento de imagen y texto (pipeline image-text-to-text): acepta entradas image_url junto a prompts de texto.
- Tool calling nativo con el formato inkling, validado en las pruebas de la model card.
- Generacion de codigo, con soporte de decodificacion especulativa optimizada para este caso (54,3 tok/s a T=0.6).
- Capacidad de contexto largo: recuperacion exacta en pruebas needle a 33,2K y 132,8K tokens.
- Soporte de concurrencia multi-stream (validado con 2 flujos de 67,3K tokens, 6/6 exactos).
- Multilingue: solo ingles declarado (en).

## Casos de uso

- Asistente de codigo en local sobre Mac: el modelo puede integrarse en un servidor mlx_vlm.server con el drafter DSpark activado para generacion de codigo a 54,3 tok/s, adecuado para autocompletado y generacion de funciones en estaciones de trabajo Apple Silicon sin GPU dedicada.
- Analisis de documentos e imagenes en contexto largo: con 131K tokens de ventana y vision integrada, permite procesar capturas, diagramas o PDFs escaneados junto a texto extenso en una sola pasada, validado con recuperacion exacta a 132,8K tokens.
- Agente con tool calling: el soporte del formato inkling permite encadenar llamadas a funciones en flujos multi-paso, por ejemplo para automatizar consultas a APIs o ejecucion de scripts desde un asistente local.
- Razonamiento con esfuerzo ajustable: el parametro reasoning_effort permite degradar a "none" para respuestas rapidas de bajo coste o subir a "high" para tareas analiticas, lo que facilita equilibrar latencia y calidad en produccion.
- Servicio concurrente de bajo volumen: con max-num-seqs 4 y cache-limit de 4 GiB, puede atender varias sesiones simultaneas en un solo equipo de 48 GB, validado con dos flujos de 67,3K tokens sin perdida de exactitud.
- Prototipado e investigacion de VLMs en MLX: al ser un checkpoint cuantizado con licencia Apache 2.0 y validacion documentada frente al base, sirve como banco de pruebas reproducible para estudiar efectos de cuantizacion mixta en modelos MoE multimodales.
- Despliegue en entornos con memoria unificada limitada: con un pico de 23,9 GiB en contextos de hasta 33K tokens, cabe en equipos de 32-48 GB de memoria unificada donde un checkpoint BF16 no cabria.

## Benchmarks y rendimiento

Resultados medidos en Apple M4 Max 40c GPU, 48 GB, macOS 26.6.1, con alimentacion de red, mlx 0.32.5, fork existential-birds/mlx-vlm@f871d0b7, T=0.6 y reasoning_effort="none":

| Metrica | Base NVFP4 | mlx-vlm stock + 4-bit | perf/inkling2-serving + flags |
|---|---:|---:|---:|
| Decodificacion c1 (mediana de 6) | 33,1 tok/s | 44,1 tok/s | 46,5 tok/s |
| Decodificacion agregada c4 | 16,2-34,7 tok/s (swap) | 79,4 tok/s | 93,3 tok/s |
| Prefill en frio (3,3K / 25,6K) | 333 / 307 tok/s | 551 / 524 tok/s | 591 / 547 tok/s |
| TTFT corto / arranque | 245 ms / 9,2 s | 198 ms / 7,3 s | 196 ms / 5,3 s |
| Memoria pico (<= 33K ctx) | 34,3 GiB | 29,9 GiB | 23,9 GiB |

Validacion adicional a T=0: coseno de logits de primer token de 0,9986-0,9996 frente al base NVFP4 y KL de softmax de 0,00000 nats; recuperacion needle 3/3 exacta a 33,2K (23,9 GiB) y 3/3 a 132,8K (22,7 tok/s de decodificacion, 30,1 GiB); soak concurrente 6/6 exacto con 2 flujos de 67,3K (25,2 GiB). Con decodificacion especulativa en codigo: 54,3 tok/s a T=0.6. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 17,27 GB (16,08 GiB) de pesos; memoria pico medida de 23,9 GiB con contextos de hasta 33K y 30,1 GiB a 132,8K.
- Hardware validado: Apple M4 Max con GPU de 40 nucleos y 48 GB de memoria unificada. No se documentan pruebas en GPU NVIDIA o AMD.
- Cabe en equipos Apple Silicon de 32 GB o mas de memoria unificada para contextos moderados; para 131K de contexto se recomienda 48 GB.
- Despliegue: mlx_vlm.server del fork existential-birds/mlx-vlm (rama perf/inkling2-serving), instalable con uv tool install. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Parametros de serving recomendados: --prefill-step-size 512, --cache-limit 4294967296, --max-num-seqs 4, --port 8080.
- Decodificacion especulativa opcional: --draft-model existentialbirds/Inkling-2-Mini-DSpark-mlx-vlm-4bit --draft-kind dflash --draft-block-size 5 (recomendada para codigo, no para prosa muestreada ni lotes c4).
- Latencia y throughput: TTFT de 196 ms y arranque de 5,3 s; 46,5 tok/s en decodificacion c1 y 93,3 tok/s agregados en c4 en el hardware citado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-mlx-vlm-4bit (este) | 26,4B | 131K | Apache 2.0 | safetensors MLX 4-bit mixto | 46,5 tok/s c1 en M4 Max 40c, 23,9 GiB pico |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B | 131K | Apache 2.0 | safetensors NVFP4 | Referencia de calidad; 33,1 tok/s c1, 34,3 GiB pico en el mismo hardware |
| existentialbirds/Inkling-2-Mini-DSpark-mlx-vlm-4bit | no disponible | no disponible | Apache 2.0 | safetensors MLX 4-bit | Drafter para decodificacion especulativa, no un modelo autonomo comparable |

No se dispone en la informacion proporcionada de datos de otros modelos multimodales MoE de tamano similar para una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta validado.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan tasas de error ni evaluaciones de factualidad en la informacion disponible.
- La cuantizacion a 4 bits introduce una desviacion minima pero no nula frente al base (coseno de logits de 0,9986-0,9996); para tareas de alta precision puede ser preferible el checkpoint NVFP4 original.
- Solo esta probado en Apple Silicon con MLX; no hay soporte documentado para CUDA, ROCm ni otros backends, lo que limita su uso en servidores tradicionales.
- Requiere un fork especifico de mlx-vlm (rama perf/inkling2-serving); la version stock de la libreria ofrece menor rendimiento (44,1 frente a 46,5 tok/s en c1 y 29,9 frente a 23,9 GiB de pico).
- La decodificacion especulativa solo se recomienda para generacion de codigo; en prosa muestreada o lotes c4 debe desactivarse.
- El uso esta sujeto a la Model Acceptable Use Policy de Thinking Machines Lab ademas de la licencia Apache 2.0, y se deben consultar las notas de seguridad y la documentacion de datos de entrenamiento del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria independiente.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/existentialbirds/Inkling-2-Mini-mlx-vlm-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter companero: https://huggingface.co/existentialbirds/Inkling-2-Mini-DSpark-mlx-vlm-4bit
- Fork de mlx-vlm (rama perf/inkling2-serving): https://github.com/existential-birds/mlx-vlm/tree/perf/inkling2-serving
- Repositorio de benchmarks Peregrine: https://github.com/existential-birds/peregrine
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Documentacion de datos de entrenamiento: https://thinkingmachines.ai/training-data-documentation/
