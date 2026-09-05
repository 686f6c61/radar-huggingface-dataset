# ankush13r/prelude-base-iter_0989075-yarn-128k

## Resumen

`prelude-base-iter_0989075-yarn-128k` es una variante de contexto largo del modelo base `openeurollm/prelude`, publicada por el usuario `ankush13r`. El modelo original es un transformer denso de 9.094.607.872 parámetros, con arquitectura estilo Qwen3 (36 capas, hidden size 4096, FFN 12288, 32 cabezas de atención con 8 grupos KV, head dim 128, RMSNorm con QK-norm, SwiGLU y embeddings no compartidos). Esta variante concreta aplica una reparametrización RoPE mediante la técnica YaRN para ampliar la ventana útil hasta 131.072 tokens (128K), sin realizar ningún entrenamiento adicional. Los pesos son exactamente los mismos que los del checkpoint `anneal300b_iter_0989075`; solo cambia el mapeo de posiciones. La relevancia de este modelo radica en que permite evaluar el impacto de la interpolación de RoPE sobre un modelo base de 9B, y ofrece una configuración que funciona de forma estable en todo su rango declarado, con una perplexidad de 2.340 en la banda de 65K-131K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dense estilo Qwen3 |
| Parametros totales | 9.094.607.872 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base `openeurollm/prelude` es un transformer denso de 9B con configuracion estilo Qwen3: 36 capas, hidden size 4096, FFN 12288, 32 cabezas de atencion agrupadas en 8 grupos KV (head dim 128), normalizacion RMSNorm con QK-norm y activacion SwiGLU. El vocabulario tiene 262.145 entradas, rellenado a 262.272. Se entreno con 4096 posiciones nativas y RoPE base 100000.

Esta variante `yarn-128k` no ha sido entrenada. Es una reparametrizacion de RoPE aplicando el metodo YaRN con factor 9.0, `original_max_position_embeddings` 16384, `rope_theta` 1000000 y betas `beta_fast` 512 / `beta_slow` 16. Segun el autor, el parametro `original_max_position_embeddings` se eleva de 4096 a 16384 unicamente para satisfacer la comprobacion de arranque de vLLM, y se compensa multiplicando los betas por el mismo factor para no alterar el comportamiento. No se realizo continued pretraining ni fine-tuning; la calidad se sacrifica en favor del rango de contexto.

## Capacidades

- Generacion de texto autoregresiva: al ser un modelo base, puede generar texto continuando un prompt, pero no esta instruido para seguir ordenes conversacionales.
- Contexto largo: mantiene perplexidad razonable hasta 131.072 tokens. La perplexidad medida por bandas es 3.133 (4K-8K), 2.871 (8K-16K), 2.642 (16K-32K), 2.629 (32K-65K) y 2.340 (65K-131K).
- Compatibilidad con vLLM: el README proporciona el comando `vllm serve <model> --max-model-len 131072` para servir el modelo en toda su ventana.
- Soporte de tool calling: no disponible; el modelo no ha sido fine-tuned para function calling.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: solo ingles.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion en extension de contexto: este modelo permite estudiar como la reparametrizacion YaRN afecta a un modelo base de 9B, comparando su perplexidad por bandas con la del modelo sin escalar o con otras configuraciones de factor. Es util para validar el efecto de los parametros `beta_fast` y `beta_slow`.
- Base para fine-tuning posterior: al ser un checkpoint intermedio con ventana ampliada, puede servir como punto de partida para entrenar modelos especializados en documentos largos, aunque requerira un fine-tuning con datos de instrucciones para tareas concretas.
- Evaluacion de recuperacion de informacion en textos extensos: permite probar tecnicas de retrieval o needle-in-a-haystack sobre una ventana de 128K, siempre que se haga un estudio especifico mas alla de la perplexidad.
- Experimentos de interpolacion de RoPE: la variante proporciona una configuracion documentada y medida, util para comparar el comportamiento de distintos factores YaRN sobre el mismo checkpoint.
- Servicio de inferencia con vLLM: puede desplegarse directamente con `vllm serve` para procesar prompts de hasta 131K tokens, si se acepta la degradacion de calidad en los primeros tramos de contexto.
- Analisis de documentos largos sin segmentacion: con la ventana de 128K, un documento de unas 200.000 palabras podria procesarse en una sola pasada, aunque al ser un modelo base la salida requerira un prompt muy estructurado o un posterior fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento son las mediciones de perplexidad por posicion de token, presentadas en el README del autor.

| Banda de posiciones | Perplexidad (`yarn-128k`) | Perplexidad (`yarn-32k`) | Perplexidad (base sin escalar) |
|---|---|---|---|
| 2048-4096 | no medido | 2.140 | 2.366 |
| 4096-8192 | 3.133 | 2.449 | 182.5 |
| 8192-16384 | 2.871 | 2.228 | 575.7 |
| 16384-32768 | 2.642 | 2.140 | 503.2 |
| 32768-65536 | 2.629 | 123.7 | — |
| 65536-131072 | 2.340 | 519.2 | — |

Nota: la tabla del autor indica que `yarn-32k` tiene mejor calidad dentro de su ventana (32K) pero falla despues, mientras que `yarn-128k` es el unico que funciona de forma estable hasta 131K. La caida de perplexidad en la banda final de `yarn-128k` puede deberse a la composicion del corpus de evaluacion y no a una mejora del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en bf16, el modelo ocupa aproximadamente 18.2 GB, como indica el tamano del repositorio. Con cuantizacion a 4 bits se estima que cabria en torno a 6-7 GB de VRAM, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para servir el modelo en bf16 a 128K de contexto, se recomienda una GPU con al menos 40 GB de VRAM, como A100 40GB o A100 80GB, debido al crecimiento de la cache KV. En consumer GPU, una RTX 4090 de 24 GB podria servir el modelo con cuantizacion 4-bit, pero con limitaciones de longitud de contexto.
- Opciones de despliegue: el README indica expresamente vLLM. Tambien puede usarse llama.cpp, Ollama o TGI si se generan cuantizaciones GGUF, que no estan disponibles en el repositorio actual.
- Latencia y throughput: no disponibles; no se proporcionan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto util | Perplexidad 16K-32K | Perplexidad 65K-131K | Licencia |
|---|---|---|---|---|---|
| `prelude-base-iter_0989075-yarn-32k` | 9.094.607.872 | 32.768 | 2.140 | 519.2 | Apache 2.0 |
| `prelude-base-iter_0989075-yarn-128k` | 9.094.607.872 | 131.072 | 2.642 | 2.340 | Apache 2.0 |
| `prelude-base-iter_0989075-yarn-160k` | 9.094.607.872 | 163.840 | 2.720 | 2.363 | Apache 2.0 |
| `openeurollm/prelude` (base sin escalar) | 9.094.607.872 | 4.096 | 503.2 (despues de 16K) | — | Apache 2.0 |

Las tres variantes comparten los mismos pesos; la diferencia esta en la configuracion YaRN. `yarn-128k` es la que ofrece un compromiso entre calidad dentro de su ventana y estabilidad en todo el rango declarado.

## Limitaciones y advertencias

- Reparametrizacion solamente: no hay continued pretraining ni fine-tuning. Ninguna reparametrizacion sustituye un entrenamiento real con datos largos; existe un equilibrio entre rango y calidad que no puede evitarse con solo ajustar parametros.
- Falla silenciosa fuera de la ventana: aunque `max_position_embeddings` es 131072, el autor advierte que no se debe superar esta longitud, ya que no se ha medido por encima y configuraciones similares con factor 8 dieron perplexidades de 43.1 en esa banda.
- Sin validacion en tareas downstream: las mediciones de perplexidad solo verifican que RoPE esta intacto, no que el modelo funcione bien en tareas reales de recuperacion o razonamiento.
- Limitaciones del modelo base: `openeurollm/prelude` es un checkpoint intermedio de investigacion, lo que implica que puede tener sesgos o comportamientos no corregidos. Estos caveats se heredan en esta variante.
- Idioma limitado: el modelo solo esta declarado para ingles; su comportamiento en otros idiomas no ha sido evaluado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no garantiza idoneidad para produccion sin una evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ankush13r/prelude-base-iter_0989075-yarn-128k
- Modelo base: https://huggingface.co/openeurollm/prelude
- Paper de referencia sobre extension de contexto con YaRN (encontrado en la busqueda web, posiblemente relacionado con la tecnica): https://arxiv.org/html/2605.31268v1
