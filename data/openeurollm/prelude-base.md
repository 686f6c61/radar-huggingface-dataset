# openeurollm/prelude-base

## Resumen

Prelude-base 9B es un modelo de lenguaje base de tipo denso, autoregresivo y decoder-only desarrollado por OpenEuroLLM, un consorcio europeo centrado en construir infraestructura de IA abierta con especial énfasis en cobertura lingüística europea. El modelo sigue de cerca la arquitectura Qwen3 y se ha entrenado desde cero sobre 10 billones de tokens en el supercomputador Leonardo (CINECA), con una mezcla aproximada del 80 % en inglés, código y matemáticas y un 20 % multilingüe repartido entre los 36 idiomas objetivo iniciales del proyecto (41 códigos de idioma/escritura en la mezcla de datos).

Con 9.094.607.872 parámetros totales (unos 9,1 B), 36 capas, tamaño oculto de 4096 y una ventana de contexto de 4096 tokens, Prelude-base es un checkpoint de tipo *base*, es decir, sin ajuste por instrucciones ni alineación por preferencias. Su relevancia actual reside en que constituye la base sobre la que OpenEuroLLM construirá sus modelos afinados, y en que ofrece pesos abiertos bajo licencia Apache 2.0 con un vocabulario de 262.145 tokens y embeddings de entrada y salida no atados, una configuración poco habitual en modelos de este tamaño.

El repositorio publica checkpoints intermedios etiquetados por iteración de Megatron (`iter_*`) y por fase de *annealing* (`anneal_*`), además de la rama `main`, que contiene el checkpoint final tras el annealing (`stage2-step_1192093`). Esto lo hace útil tanto para inferencia como para investigación sobre dinámica de entrenamiento a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only, autoregresivo (estilo Qwen3) |
| Parametros totales | 9.094.607.872 (~9,1 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | 36 idiomas objetivo (41 códigos idioma/escritura): en, es, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

Detalles arquitectónicos adicionales:

| Parametro | Valor |
|---|---|
| Capas | 36 |
| Hidden size | 4096 |
| FFN hidden size | 12288 (denso) |
| Cabezas de atencion | 32 |
| Grupos KV (GQA) | 8 |
| Head dim (kv_channels) | 128 |
| Embedding de posicion | RoPE, base 100000 |
| Normalizacion | RMSNorm, eps 1e-5, con QK-norm |
| Activacion | SwiGLU |
| Vocab size | 262.145 (tokenizer de 256k, padding a 262.272 por eficiencia de TP) |
| Dtype | bf16 |
| Numero de tensores | 399 |
| Parametros de embed_tokens | 1.074.266.112 |
| Parametros de lm_head | 1.074.266.112 (no atado a embeddings) |
| Cuerpo del transformer | 6.946.075.648 |
| Bytes de pesos (cabecera) | 18.189.215.744 (~18,19 GB) |

## Arquitectura y entrenamiento

Prelude-base es un transformer denso decoder-only que replica fielmente la configuración de Qwen3: 36 capas con atención de 32 cabezas y 8 grupos KV (GQA), dimensión de cabeza de 128, FFN densa de 12288, activación SwiGLU, RMSNorm con epsilon 1e-5 y QK-norm, y RoPE con base 100000. Una decisión destacable es el uso de embeddings de entrada y salida no atados (`embed_tokens` y `lm_head` independientes, 1.074.266.112 parámetros cada uno), lo que eleva el total a ~9,1 B pese a que el cuerpo del transformer suma 6.946.075.648 parámetros. El vocabulario es de 262.145 tokens, con padding hasta 262.272 por eficiencia en tensor parallelism.

El entrenamiento se realizó en el supercomputador Leonardo (CINECA) sobre 10 billones de tokens, con batch global de 2048, micro-batch de 4 y secuencia de 4096 tokens. La mezcla de datos es aproximadamente 80 % inglés, código y matemáticas, y 20 % multilingüe repartido entre los 36 idiomas objetivo (41 códigos idioma/escritura, ya que algunos idiomas se desdoblan en macrolengua y variante específica: letón/letón estándar/latgaliano, estonio/estonio estándar, albanés/albanés tosco, noruego bokmål/nynorsk). El modelo se entrenó sin token `<bos>`: los documentos se empaquetan consecutivamente y cada uno termina en `<eos>`, por lo que los tokenizadores de todas las ramas tienen `add_bos_token: false`. El proceso incluye una fase de *annealing* cuyo resultado es el checkpoint de la rama `main` (`stage2-step_1192093`).

## Capacidades

- Generación de texto autoregresiva en 36 idiomas europeos, con especial cobertura de lenguas de bajos recursos (ga, mt, is, ltg, ekk, nn, als).
- Modelo base sin alineación: no está ajustado por instrucciones ni por preferencias humanas (no hay RLHF/DPO documentado), por lo que su uso natural es la continuación de texto y el *prompting* few-shot.
- Capacidades de código y matemáticas derivadas de la mezcla de entrenamiento (~80 % inglés + código + matemáticas).
- Razonamiento de sentido común y conocimiento general a nivel de modelo base de 9 B.
- Generación multilingüe con convenciones nativas: la batería de validación incluye prompts localizados con fórmulas propias de cada idioma (por ejemplo, la apertura de cuento tradicional de cada lengua) en lugar de traducciones literales.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo *thinking*.
- Compatible con la API de `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) y con selección de checkpoint mediante el argumento `revision`.

## Casos de uso

- Investigación sobre dinámica de entrenamiento a gran escala: el repositorio publica checkpoints intermedios (`iter_*`) y de annealing (`anneal_*`), lo que permite estudiar la evolución de las capacidades a lo largo de 10 T tokens sin necesidad de reproducir el entrenamiento.
- Punto de partida para fine-tuning supervisado: al ser un modelo base Apache 2.0 con 9 B parámetros, es adecuado como inicialización para SFT y DPO en dominios verticales (legal, sanitario, administración pública) en lenguas europeas.
- Generación y aumento de datos sintéticos multilingües: su cobertura de 36 idiomas permite crear corpus de continuación de texto para lenguas con pocos recursos (irlandés, maltés, islandés, latgaliano) donde los modelos comerciales rinden peor.
- Desarrollo de modelos específicos por país dentro del ecosistema OpenEuroLLM: sirve como *baseline* común para comparar adaptaciones lingüísticas entre socios del consorcio.
- Evaluación comparativa de arquitecturas Qwen3 a escala 9 B: al replicar la configuración de Qwen3 con embeddings no atados y vocabulario de 262k, permite aislar el efecto de decisiones de diseño concretas frente a modelos de tamaño similar.
- Prototipado de asistentes de escritura y autocompletado en entornos europeos: con 4096 tokens de contexto y licencia permisiva, encaja en herramientas de redacción multilingüe desplegadas on-premise sin dependencia de APIs externas.
- Experimentación con *annealing* y mezclas de datos: la separación entre checkpoints pre-annealing y post-annealing facilita estudiar el impacto de la fase final de entrenamiento en la calidad multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta una batería de validación cualitativa (`validation.json`) con 144 generaciones codificadas de forma greedy: 4 prompts canónicos de frase incompleta (conocimiento general, sentido común, ciencia y narrativa creativa) localizados a los 36 idiomas objetivo. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se necesitan del orden de 20-24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos, más overhead; en 4 bits, en torno a 5-6 GB de pesos, más overhead (no se publican cuantizaciones oficiales, por lo que estos valores son estimaciones a partir del tamaño de los pesos).
- GPU recomendadas para BF16: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto limitado y en GPUs de 16 GB solo mediante cuantización; en 8 GB no es viable sin cuantización agresiva.
- Opciones de despliegue: `transformers` con `device_map="auto"` es la vía documentada; al seguir la arquitectura Qwen3, es compatible con stacks habituales como vLLM, TGI o llama.cpp, aunque no se documenta soporte oficial verificado en la model card.
- Caché KV: con GQA de 8 grupos KV, 36 capas y head dim 128, la caché por token es relativamente compacta (8 × 128 × 2 × 36 × 2 bytes ≈ 147 KB por token en BF16), lo que permite servir contexto completo de 4096 tokens con un consumo de caché de aproximadamente 600 MB por secuencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| OpenEuroLLM Prelude-base 9B | ~9,1 B (denso) | 4096 | Transformer denso estilo Qwen3, embeddings no atados | Apache 2.0 | Base sin alinear, 36 idiomas europeos, 10 T tokens |
| Qwen3 8B | ~8 B (denso) | No disponible en la informacion proporcionada | Transformer denso con GQA y QK-norm | Apache 2.0 | Referencia arquitectonica directa de Prelude-base |
| Modelos europeos tipo EuroLLM | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Categoria comparable por enfoque multilingue europeo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parámetros, contexto, licencia y enfoque.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones de forma fiable, no está ajustado con RLHF/DPO y puede producir continuaciones incoherentes o inapropiadas si se usa como asistente directo.
- Riesgo de alucinación inherente a un modelo base de 9 B entrenado principalmente con datos web; no hay mecanismos de verificación factual.
- Ventana de contexto limitada a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas sin técnicas de recuperación externa.
- Cobertura multilingüe desigual: el 80 % de los datos está en inglés, código y matemáticas, por lo que los 36 idiomas restantes comparten solo ~20 % de la mezcla; las lenguas de muy bajos recursos (ltg, ekk, als, nn, mt) probablemente tengan una calidad notablemente inferior.
- Tokenizador sin `<bos>`: cualquier pipeline que espere un token de inicio de secuencia debe adaptarse, ya que `add_bos_token` es `false` en todas las ramas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no hay garantías de ningún tipo por parte de los autores.
- El tamaño del repositorio (9.604 GB según Hugging Face) refleja el conjunto de todas las ramas de checkpoints; descargar una sola revisión requiere bastante menos espacio, pero conviene seleccionar la rama concreta con `revision` para evitar descargas masivas.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad, por lo que se recomienda auditoría propia antes de cualquier despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/prelude-base
- Lista de ramas y checkpoints: https://huggingface.co/openeurollm/prelude-base/tree/main
- Seguimiento del progreso de entrenamiento OpenEuroLLM: https://huggingface.co/spaces/openeurollm/oellm_progress
- Repositorio de recolección de datos de entrenamiento: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md
- Desglose de tokens por idioma: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md#per-language-breakdown-to-be-reviewed
- Configuración del experimento `baby_9b_dense`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/experiments/baby/baby_9b_dense.yaml
- Configuración de arquitectura `qwen3_dense_9b.yaml`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/backend/megatron/baby/models/qwen3_dense_9b.yaml
