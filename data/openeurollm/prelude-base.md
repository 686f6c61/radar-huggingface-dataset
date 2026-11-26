# openeurollm/prelude-base

## Resumen

Prelude-base 9B es un modelo de lenguaje de tipo dense, autoregresivo y decoder-only desarrollado por OpenEuroLLM, un consorcio europeo centrado en construir modelos de lenguaje abiertos con cobertura amplia de lenguas europeas. El modelo sigue de cerca la arquitectura Qwen3 y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo ha sido entrenado sobre aproximadamente 10 billones de tokens, con una mezcla que dedica en torno al 80% a ingles, codigo y matematicas, y el 20% restante a contenido multilingue distribuido entre 36 lenguas objetivo de OpenEuroLLM (41 codigos de lengua/escritura en la mezcla de datos). Esta composicion lo posiciona como una alternativa abierta para aplicaciones multilingues en el contexto europeo, un nicho tradicionalmente dominado por modelos propietarios.

Con 9.095 millones de parametros, 36 capas y una ventana de contexto de 4096 tokens, Prelude-base es un checkpoint base (no instruido ni alineado) pensado como punto de partida para fine-tuning posterior. El entrenamiento se realizo en el supercomputador Leonardo (CINECA), y el repositorio publica checkpoints intermedios por iteracion, ademas del checkpoint final tras la fase de annealing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only dense, estilo Qwen3, con embeddings de entrada/salida no atados (untied) |
| Parametros totales | 9.094.607.872 (~9.095 B) |
| Parametros activos | no aplica (modelo dense) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 36 lenguas objetivo (41 codigos lengua/escritura): en, es, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

Detalles adicionales de arquitectura: 36 capas, hidden size 4096, FFN hidden size 12288 (dense), 32 cabezas de atencion, 8 grupos KV (GQA), head dim 128, RoPE con base 100000, RMSNorm con eps 1e-5 y QK-norm, activacion SwiGLU, vocabulario de 262.145 tokens (tokenizer de 256k, padding a 262.272 por eficiencia de tensor parallelism). El cuerpo transformer suma 6.946.075.648 parametros; embeddings y lm_head aportan 1.074.266.112 cada uno, sin atar.

## Arquitectura y entrenamiento

Prelude-base emplea una arquitectura Transformer decoder-only densa que replica de cerca el diseno de Qwen3: atencion con GQA (32 cabezas de query, 8 grupos KV), normalizacion RMSNorm con QK-norm, RoPE con base 100000 y FFN densa con SwiGLU. Los embeddings de entrada y la cabeza de salida estan desacoplados (untied), lo que incrementa el recuento total de parametros respecto a variantes con pesos atados. El modelo se entreno en bf16 sin token `<bos>`: los documentos se empaquetan consecutivamente y cada uno termina en `<eos>`, por lo que el tokenizer tiene `add_bos_token: false`.

El entrenamiento consumio aproximadamente 10 billones de tokens con un batch global de 2048, micro-batch de 4 y secuencia de 4096 tokens. La mezcla de datos combina mayoritariamente ingles, codigo y matematicas (~80%) con un 20% multilingue repartido entre las 36 lenguas objetivo. El proceso incluyo una fase de annealing posterior a las iteraciones base, cuyo resultado es el checkpoint final de la rama `main` (`stage2-step_1192093`). La composicion completa del dataset y el desglose de tokens por lengua estan documentados en el repositorio `training-data-collection` del proyecto. El entrenamiento se ejecuto en el supercomputador Leonardo (CINECA) mediante la infraestructura Megatron del proyecto `oellm-autoexp`.

## Capacidades

- Generacion de texto autoregresiva en 36 lenguas europeas, con especial cobertura de lenguas de menor representacion (letón, letgaliano, estonio, albanés tosco, gaélico, maltés, islandés, entre otras).
- Modelo base sin alineacion: no incorpora instruction tuning, RLHF ni DPO, por lo que su uso directo en chat requiere fine-tuning o prompting cuidadoso.
- Capacidad de continuacion de texto y completado de frases, validada mediante un conjunto de 144 generaciones (4 prompts canonicos localizados a 36 lenguas) incluidas en el `validation.json` de cada checkpoint.
- Razonamiento basico y conocimiento general derivado del entrenamiento en ingles, codigo y matematicas.
- Soporte de tool calling / function calling: no disponible (modelo base, sin entrenamiento especifico de agentes).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriria fine-tuning.
- Capacidades multilingues: nucleo del diseno del modelo, con tokenizer de 256k tokens adaptado a las lenguas objetivo.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Fine-tuning para atencion al cliente multilingue: al ser un modelo base Apache 2.0 con cobertura de 36 lenguas europeas, sirve como punto de partida para entrenar asistentes conversacionales en mercados donde los modelos abiertos suelen tener poca representacion (por ejemplo, gaélico, maltés o letgaliano).
- Generacion de codigo tras instruction tuning: el 80% de la mezcla de datos se dedica a ingles, codigo y matematicas, lo que proporciona una base solida para derivar modelos especializados en programacion mediante SFT sobre datasets de codigo.
- Investigacion en modelos multilingues: la publicacion de checkpoints intermedios por iteracion (`iter_*`) y de annealing (`anneal_*`) permite estudiar la evolucion del aprendizaje por lengua y la dinamica de la mezcla de datos a lo largo del entrenamiento.
- Desarrollo de modelos europeos soberanos: organizaciones que necesitan desplegar infraestructura propia sin dependencias de proveedores estadounidenses pueden usar Prelude-base como base para modelos ajustados a dominios regulatorios (legal, sanitario, administracion publica) en lenguas locales.
- Traduccion automatica y parafraseo: con fine-tuning sobre pares de lenguas, el modelo puede adaptarse a tareas de traduccion entre las lenguas europeas cubiertas, especialmente aquellas con pocos recursos en modelos abiertos comparables.
- Generacion aumentada por recuperacion (RAG): con 4096 tokens de contexto, el modelo puede integrarse en pipelines RAG para responder preguntas sobre documentacion interna, previo fine-tuning instructivo.
- Experimentacion academica en eficiencia de entrenamiento: la configuracion Megatron publicada (`qwen3_dense_9b.yaml`) y los hiperparametros documentados permiten reproducir o extender el entrenamiento en clusters academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye generaciones de sanity-check (144 completados greedy sobre 4 prompts canonicos localizados a 36 lenguas) como verificacion cualitativa de coherencia, sin metricas cuantitativas tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,2 GB solo para pesos (18.189.215.744 bytes segun cabecera), mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas para contexto completo de 4096 tokens.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB para pesos; en 4 bits, en torno a 5-6 GB (estimaciones teoricas, no verificadas en la informacion disponible).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para inferencia en bf16 con batch; RTX 4090 (24 GB) para bf16 con contexto reducido o cuantizacion; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con cuantizacion o contexto reducido; en 16 GB requeriria cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (referencia oficial en la model card), vLLM y TGI para serving en bf16; llama.cpp y Ollama requeririan conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multilingue | Notas |
|---|---|---|---|---|---|
| OpenEuroLLM Prelude-base 9B | 9,095 B (dense) | 4096 | Apache 2.0 | 36 lenguas europeas | Base sin alinear; checkpoints intermedios publicados |
| Qwen3 8B (referencia arquitectonica) | ~8 B (dense) | no disponible en esta ficha | Apache 2.0 | principalmente ingles/chino | Arquitectura en la que se basa Prelude; incluye variantes instruct |
| Gemma 2 9B | ~9 B (dense) | no disponible en esta ficha | Gemma license | multilingue limitado | Requiere aceptacion de terminos; no Apache 2.0 |
| Llama 3.1 8B | ~8 B (dense) | 128k | Llama license | multilingue limitado | Contexto mucho mayor; licencia con restricciones de uso |

La comparativa se limita a parametros y licencia porque no hay benchmarks publicados de Prelude-base en la informacion disponible. Su principal diferenciador es la cobertura de 36 lenguas europeas bajo Apache 2.0, frente a alternativas con menor representacion de lenguas de bajos recursos y licencias mas restrictivas.

## Limitaciones y advertencias

- Modelo base sin alineacion: no esta entrenado para seguir instrucciones, rechazar peticiones daninas ni mantener formato conversacional; su uso directo en produccion requiere fine-tuning instructivo y evaluacion de seguridad.
- Riesgo de alucinacion: como todo modelo de lenguaje sin grounding, puede generar afirmaciones factualmente incorrectas, especialmente en lenguas de bajos recursos donde la cobertura de datos es menor.
- Ventana de contexto limitada a 4096 tokens, inferior a la de competidores como Llama 3.1 8B (128k); no apto para tareas que requieran contexto muy largo sin estrategias de chunking o RAG.
- Desequilibrio linguistico: el 80% de los datos es ingles, codigo y matematicas, por lo que el rendimiento en las lenguas europeas menos representadas puede ser notablemente inferior al del ingles.
- Sesgos conocidos: no documentados explicitamente en la informacion disponible; se recomienda auditoria antes de despliegues sensibles.
- Tokenizer sin `<bos>`: los pipelines que asuman la presencia de token de inicio de secuencia pueden comportarse de forma distinta; hay que respetar `add_bos_token: false`.
- Licencia Apache 2.0: permisiva para uso comercial, pero el modelo se distribuye "tal cual", sin garantias; la responsabilidad del cumplimiento normativo (por ejemplo, AI Act) recae en el integrador.
- Tamano del repositorio de 9,6 TB: descargar el repositorio completo es inviable; debe seleccionarse una revision concreta mediante el argumento `revision`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/prelude-base
- Lista de ramas y checkpoints: https://huggingface.co/openeurollm/prelude-base/tree/main
- Seguimiento del progreso de entrenamiento: https://huggingface.co/spaces/openeurollm/oellm_progress
- Repositorio de recoleccion de datos de entrenamiento: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md
- Configuracion del experimento `baby_9b_dense`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/experiments/baby/baby_9b_dense.yaml
- Configuracion de arquitectura `qwen3_dense_9b.yaml`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/backend/megatron/baby/models/qwen3_dense_9b.yaml
- Repositorio principal del proyecto: https://github.com/OpenEuroLLM
