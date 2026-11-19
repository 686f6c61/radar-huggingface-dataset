# openeurollm/prelude-base

## Resumen

Prelude-base 9B es un modelo de lenguaje de tipo decoder-only denso desarrollado por OpenEuroLLM, un consorcio europeo cuyo objetivo es construir una familia de modelos abiertos con cobertura amplia de las lenguas europeas. El modelo sigue de cerca la arquitectura Qwen3 y se distribuye bajo licencia Apache 2.0, lo que lo convierte en una base atractiva para ajuste fino y uso comercial sin restricciones adicionales.

Con 9.094.607.872 parametros totales (aproximadamente 9,1 mil millones), el modelo se ha entrenado sobre 10 billones de tokens con una mezcla aproximada del 80% en ingles, codigo y matematicas, y un 20% multilingue repartido entre las 36 lenguas objetivo iniciales de OpenEuroLLM (41 codigos de lengua/escritura en la mezcla de datos). Esta orientacion multilingue europea es su principal diferenciador frente a otros modelos densos de tamano similar, habitualmente mucho mas centrados en ingles.

El checkpoint principal (`main`, correspondiente a `stage2-step_1192093`) es el resultado final tras la fase de annealing. El repositorio publica ademas checkpoints intermedios por rama (`iter_*` y `anneal_*`), cada uno autocontenido y acompanado de un `validation.json` con generaciones de comprobacion. El modelo se entreno en el supercomputador Leonardo (CINECA), lo que refuerza su caracter de iniciativa europea de infraestructura publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estilo Qwen3, con GQA y QK-norm |
| Parametros totales | 9.094.607.872 (~9,095 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en bf16 (compatible con cuantizaciones estandar de la comunidad, no confirmadas por el autor) |
| Idiomas soportados | 36 lenguas objetivo (41 codigos lengua/escritura): en, es, ka, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

Detalles arquitectonicos adicionales:

| Parametro | Valor |
|---|---|
| Capas | 36 |
| Hidden size | 4096 |
| FFN hidden size | 12288 (denso) |
| Cabezas de atencion | 32 |
| Grupos KV (GQA) | 8 |
| Head dim (kv_channels) | 128 |
| Position embedding | RoPE, base 100000 |
| Normalizacion | RMSNorm, eps 1e-5, con QK-norm |
| Activacion | SwiGLU |
| Vocab size | 262.145 (tokenizer de 256k, padding a 262.272 por eficiencia TP) |
| Dtype | bf16 |
| Embeddings entrada/salida | no atados (untied) |
| Numero de tensores | 399 |
| Bytes de pesos | ~18,19 GB |

## Arquitectura y entrenamiento

Prelude-base es un transformer autoregresivo decoder-only denso que replica fielmente el diseno de Qwen3: 36 capas, hidden size de 4096, FFN densa de 12288 con SwiGLU, atencion con 32 cabezas y 8 grupos KV (GQA), head dim de 128, RoPE con base 100000 y RMSNorm con QK-norm. Los embeddings de entrada y la `lm_head` estan desatados, lo que suma aproximadamente 2,15 mil millones de parametros solo en esas dos matrices y explica que el cuerpo transformer sea de unos 6,95 mil millones. El vocabulario es amplio (262.145 tokens), coherente con la cobertura de 36 lenguas y sus variantes.

El entrenamiento se realizo sobre 10 billones de tokens en el supercomputador Leonardo (CINECA), con batch global de 2048, micro-batch de 4 y secuencias de 4096 tokens. La mezcla de datos es aproximadamente 80% ingles, codigo y matematicas, y 20% multilingue repartido entre las lenguas europeas objetivo. Una particularidad relevante es que el modelo se entreno sin token `<bos>`: los documentos se empaquetan consecutivos y cada uno termina en `<eos>`, por lo que el tokenizer tiene `add_bos_token: false`. La fase de annealing produce el checkpoint final de la rama `main`. No se documentan en la informacion disponible fases de RLHF o DPO, lo que es coherente con que se trate de un modelo base.

## Capacidades

- Generacion de texto autoregresiva en 36 lenguas europeas, incluidas lenguas de menor recursos como georgiano, lituano, letrado (ltg), alsaciano (als) o gaélico (ga).
- Modelo base: no incluye ajuste de instrucciones ni modo de razonamiento explicito; su uso previsto es como punto de partida para ajuste fino supervisado y posteriores etapas de alineamiento.
- Capacidad de continuacion de texto y completado de frases coherente en las 36 lenguas, segun las generaciones de validacion publicadas.
- Cobertura de codigo y matematicas gracias al ~80% de la mezcla de entrenamiento orientada a ingles, codigo y matematicas.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriria ajuste fino.
- Capacidades multimodales (vision, audio): no disponibles.
- Contexto de 4096 tokens, adecuado para tareas de longitud media pero no para documentos largos.

## Casos de uso

- Ajuste fino para lenguas europeas de bajos recursos: al cubrir 36 lenguas con un vocabulario de 262k tokens, sirve como base para SFT en idiomas como georgiano, lituano, letrado o alsaciano, donde escasean modelos abiertos con cobertura nativa.
- Generacion y continuacion de texto multilingue: completado de articulos, resumenes o borradores en cualquiera de las lenguas objetivo, aprovechando que el modelo se entreno con convenciones nativas y no solo con traducciones literales.
- Base para asistentes conversacionales europeos: tras una fase de instruccion, puede desplegarse en atencion al cliente o asistentes internos que requieran operar en varias lenguas de la UE sin depender de APIs externas.
- Investigacion en equidad linguistica: permite estudiar el rendimiento por lengua y script (incluyendo variantes como bokmal/nynorsk o estandar/letrado) con un unico modelo y una mezcla de datos documentada publicamente.
- Generacion asistida de codigo y texto tecnico: la alta proporcion de codigo y matematicas en el entrenamiento lo hace util como base para tareas de completado de codigo y explicacion tecnica en ingles.
- Experimentacion academica reproducible: la publicacion de checkpoints intermedios (`iter_*`, `anneal_*`) con `validation.json` permite estudiar la evolucion del entrenamiento y la emergencia de capacidades por etapa.
- Ajuste fino para dominios regulados con requisitos de soberania de datos: al ser Apache 2.0 y entrenado en infraestructura europea, encaja en proyectos que exigen control sobre la cadena de custodia del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye comprobaciones cualitativas de coherencia (`validation.json`) con 144 generaciones (4 prompts por 36 lenguas) y no reporta metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para secuencias cortas.
- VRAM estimada con cuantizacion de 8 bits: en torno a 9-10 GB de pesos, mas overhead.
- VRAM estimada con cuantizacion de 4 bits: en torno a 5-6 GB de pesos, mas overhead (valores orientativos; el autor no publica cuantizaciones oficiales).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, o GPUs consumer de 24 GB (RTX 3090, RTX 4090) con cuidado en la longitud de contexto.
- Cabe en GPU consumer: si, en RTX 3090/4090 con bf16 para contextos moderados, y en GPUs de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (soporte nativo documentado), y previsiblemente vLLM, TGI, llama.cpp u Ollama mediante conversion a GGUF, aunque el autor no confirma soporte oficial de estos backends.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque multilingue | Disponibilidad |
|---|---|---|---|---|---|
| OpenEuroLLM Prelude-base 9B | ~9,1 B (denso) | 4096 | Apache 2.0 | 36 lenguas europeas (41 codigos) | Hugging Face, checkpoints intermedios |
| Qwen3 8B (referencia arquitectonica) | ~8 B (denso) | no disponible en esta ficha | Apache 2.0 (segun Qwen3) | Amplio pero centrado en ingles/chino | Hugging Face |
| Llama 3.1 8B | ~8 B (denso) | 128k (segun Llama 3.1) | Llama 3.1 Community License | Limitado en lenguas europeas de bajos recursos | Hugging Face |
| Gemma 2 9B | ~9 B (denso) | 8k (segun Gemma 2) | Gemma Terms of Use | Moderado | Hugging Face |

Nota: los datos de los modelos comparativos se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento publicadas entre Prelude-base y estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no responde de forma fiable a instrucciones directas ni mantiene formatos conversacionales sin un SFT previo.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en la informacion disponible.
- Sesgos potenciales derivados de la mezcla de datos (~80% ingles, codigo y matematicas), que puede infrarepresentar registros y dominios de las lenguas minoritarias.
- Ausencia de `<bos>` en el tokenizer: las integraciones deben respetar `add_bos_token: false` para evitar degradacion en la generacion.
- No se documentan evaluaciones de seguridad, toxicidad ni alineamiento; conviene realizar auditorias propias antes de un despliegue en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias de los datos de entrenamiento subyacentes si su caso de uso es sensible.
- El repositorio es muy grande (varios miles de GB por los multiples checkpoints), lo que complica la descarga y el almacenamiento si se quieren explorar todas las ramas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/prelude-base
- Lista de ramas/checkpoints: https://huggingface.co/openeurollm/prelude-base/tree/main
- Seguimiento del progreso de OpenEuroLLM: https://huggingface.co/spaces/openeurollm/oellm_progress
- Repositorio de recoleccion de datos de entrenamiento: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md
- Desglose de tokens por lengua: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md#per-language-breakdown-to-be-reviewed
- Repositorio de experimentos de entrenamiento (oellm-autoexp): https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/experiments/baby/baby_9b_dense.yaml
- Configuracion de arquitectura (qwen3_dense_9b.yaml): https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/backend/megatron/baby/models/qwen3_dense_9b.yaml
