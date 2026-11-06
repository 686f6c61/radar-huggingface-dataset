# ankush13r/prelude-base-iter_1192093-yarn-160k

## Resumen

`ankush13r/prelude-base-iter_1192093-yarn-160k` es una reparametrizacion del checkpoint final de `openeurollm/prelude-base`, un modelo denso de 9B parametros con arquitectura estilo Qwen3 entrenado sobre aproximadamente 10 billones de tokens (1.192.093 iteraciones). El autor, ankush13r, no ha modificado los pesos: unicamente ha ajustado la configuracion de RoPE con escalado YaRN para extender la ventana de contexto efectiva desde los 4096 tokens nativos hasta 163.840 tokens.

La relevancia de esta ficha radica en que documenta un ejercicio de busqueda de hiperparametros de RoPE (alrededor de 1000 configuraciones evaluadas en tres fases) para exprimir la longitud de contexto de un modelo sin reentrenamiento adicional. El resultado es una ventana de 160k con un coste en perplejidad a corto alcance de +0.31 nats, y una perplejidad de 4.85 en la banda 64k-128k y 6.45 en 128k-160k, muy lejos de la degradacion catastrofica del modelo base sin escalado (perplejidad 11.929 y 43.651 en esas mismas bandas).

Se trata de un modelo base (no instruct), solo en ingles, con licencia Apache 2.0, publicado en noviembre de 2026 y con cero descargas en el momento de redactar esta ficha. Es adecuado para experimentacion con contexto largo y como punto de partida para fine-tuning, no como asistente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Qwen3 (36 capas, hidden 4096, FFN 12288, 32 cabezas de atencion / 8 grupos KV, head dim 128, RMSNorm con QK-norm, SwiGLU, embeddings no atados) |
| Parametros totales | 9.094.607.872 (9,09B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 163.840 tokens (configurado con YaRN; ventana nativa de entrenamiento 4096) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | ingles (segun la model card y los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 262.145 tokens (padded a 262.272) |
| RoPE | theta 813000, factor 11.9, beta_fast 1448.0, beta_slow 32.44, attention_factor 1.322513, attn_factor 1.06 |
| Tamano del repositorio | 18,2 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 9B parametros con una arquitectura muy proxima a Qwen3: 36 capas, dimension oculta de 4096, FFN de 12288 con activacion SwiGLU, 32 cabezas de atencion con 8 grupos de clave-valor (GQA), dimension de cabeza 128, normalizacion RMSNorm con QK-norm y embeddings de entrada y salida no atados. El vocabulario es de 262.145 tokens. Fue entrenado por OpenEuroLLM con 4096 posiciones nativas y RoPE base 100000, acumulando aproximadamente 10 billones de tokens a lo largo de 1.192.093 iteraciones (revision `anneal2t_multilingual1_dominant1_iter_1192093`).

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la reparametrizacion de RoPE. El autor realizo una busqueda de aproximadamente 1000 configuraciones combinando YaRN y LongRoPE (factor, theta, betas, escalado de atencion, truncado) en tres fases: un barrido global de YaRN, un barrido local por ventana objetivo y una conversion exacta de LongRoPE desde los mejores puntos YaRN. La configuracion elegida mantiene el factor 11.9 pero declara `original_max_position_embeddings` como 16384 con betas multiplicadas por 4 (362/8.11 en la forma equivalente con original 4096), de modo que se satisface la comprobacion de arranque de vLLM (`factor × original_max_position_embeddings >= max_model_len`). El `attention_factor` 1.322513 es la temperatura de atencion completa de YaRN, mientras que `attn_factor` 1.06 es el multiplicador extra que necesitan implementaciones como vLLM que calculan `0.1 · ln(factor) + 1` por su cuenta. No hubo entrenamiento adicional ni continuacion de preentrenamiento: los pesos son identicos al checkpoint base.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base `openeurollm/prelude-base`.
- Procesamiento de contexto largo de hasta 163.840 tokens, validado por curva de perplejidad por posicion (no por benchmark de tarea).
- Razonamiento y conocimiento general propios de un modelo base de 9B entrenado con ~10T tokens; sin ajuste instruct, por lo que no sigue instrucciones de forma fiable sin fine-tuning.
- Capacidad multilingue limitada: la model card y los tags declaran unicamente ingles, aunque el checkpoint base se entreno con datos multilingues (revision `multilingual1`); no hay evaluacion publicada al respecto.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documenta ninguna capacidad especial adicional (thinking mode, decodificacion especulativa, atencion lineal).

## Casos de uso

- Experimentacion con contexto largo: servir el modelo con `vllm serve --max-model-len 163840` para estudiar como se comporta un modelo de 9B con 160k tokens de ventana, midiendo perplejidad y coherencia en documentos largos.
- Base para fine-tuning con contexto extendido: el autor indica que la configuracion YaRN se eligio precisamente porque es compatible con los stacks de entrenamiento Megatron y NeMo, de modo que un fine-tuning posterior puede realizarse bajo la misma configuracion con la que se sirve el modelo.
- Analisis de documentos tecnicos extensos: articulos, informes o codigo fuente que superen los 100k tokens, aprovechando la perplejidad estable (4.85) en la banda 64k-128k.
- Investigacion sobre RoPE y escalado de posiciones: el repositorio documenta la metodologia de busqueda, las tablas comparativas entre YaRN y LongRoPE y las trampas de medir perplejidad por bandas, lo que lo convierte en material de referencia para replicar el proceso.
- Generacion de codigo tras fine-tuning: al ser un modelo base de 9B con vocabulario amplio (262k) y contexto de 160k, es un punto de partida razonable para adaptar a tareas de codigo con repositorios completos en contexto, aunque requiere ajuste instruct previo.
- Clasificacion y extraccion de informacion en corpus largos: pasar documentos completos en un solo forward pass (sin generacion) para obtener representaciones o puntuaciones de perplejidad sobre pasajes extensos.
- Evaluacion comparativa de configuraciones de contexto: usar el modelo como banco de pruebas para comparar YaRN frente a LongRoPE en terminos de coste a corto alcance y perplejidad por banda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor lo indica explicitamente: la validacion mide si RoPE esta intacto, no rendimiento en tareas, y no se ha probado en ningun benchmark downstream ni en un test de recuperacion.

Los unicos datos publicados son curvas de perplejidad por posicion, medidas sobre 5 documentos (el predecesor de la busqueda se confirmo sobre 20):

| Configuracion | Coste corto (nats) | ppl 16-32k | ppl 32-64k | ppl 64-128k | ppl 128-160k | ppl 160-256k |
|---|---|---|---|---|---|---|
| Base sin escalado | 0 | 1580 | 5099 | 11929 | 43651 | 23229 |
| YaRN 128k | +0.30 | 4.81 | 6.59 | 4.86 | 12.0 | 576 |
| LongRoPE 128k | +0.25 | 4.42 | 6.50 | 4.96 | 60.6 | 637 |
| **YaRN 160k (este modelo)** | **+0.31** | **4.68** | **6.66** | **4.85** | **6.45** | **235** |
| LongRoPE 256k | +0.42 | 4.90 | 7.43 | 5.27 | 6.71 | 5.77 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 18,2 GB solo para pesos, mas cache KV; con 160k tokens de contexto y GQA de 8 grupos KV (head dim 128, 36 capas), la cache KV es del orden de decenas de GB, por lo que en la practica se necesita una GPU de 80 GB (A100, H100) para la ventana completa.
- En cuantizacion de 8 bits los pesos bajan a ~9 GB y en 4 bits a ~5 GB, pero el autor no publica cuantizaciones; habria que generarlas con llama.cpp o similar, y la ventana maxima realista se reduce mucho por la cache KV.
- GPU consumer: los pesos en bf16 caben en una RTX 4090 (24 GB) de forma ajustada, pero solo con contextos cortos; para 160k tokens no es viable en consumer sin tecnicas de offload o cuantizacion agresiva de la cache.
- Despliegue recomendado: vLLM con `--max-model-len 163840` (el autor da el comando exacto y advierte de no superar ese limite). Tambien es compatible con `transformers` en versiones antiguas y nuevas, ya que `rope_scaling` contiene el mismo diccionario que `rope_parameters`.
- No se publican datos de latencia ni throughput.
- Advertencia de despliegue: no configurar mas de 163.840 tokens; la banda 160k-256k tiene perplejidad 235, lo que indica que RoPE esta roto mas alla de esa longitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| **prelude-base-iter_1192093-yarn-160k** | 9,09B denso | 163.840 (YaRN) | Apache 2.0 | Base, solo ingles, sin benchmarks de tarea publicados |
| openeurollm/prelude-base | 9,09B denso | 4096 nativo | Apache 2.0 | Mismo checkpoint sin reparametrizar; contexto corto |
| prelude-base-iter_0989075-yarn-128k | 9,09B denso | 131.072 (YaRN) | Apache 2.0 | Checkpoint anterior (anneal300b); reemplazado por este |
| Qwen3-8B (referencia arquitectonica) | ~8B denso | 32.768 nativo (extensible) | Apache 2.0 | Arquitectura de la que deriva el diseno; no disponible comparacion de rendimiento en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks de tarea) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Reparametrizacion unicamente: no hay preentrenamiento continuado ni fine-tuning; el autor subraya que ninguna eleccion de parametros sustituye a ese entrenamiento y que existe un compromiso duro entre alcance y calidad (+0.31 nats a corto alcance para ganar la ventana de 160k).
- Modelo base, no instruct: no sigue instrucciones de forma fiable sin un ajuste posterior.
- Solo ingles declarado; el comportamiento en otros idiomas no esta evaluado.
- La validacion se hizo sobre 5 documentos para esta configuracion (20 para su predecesora); las bandas altas se alimentan con menos documentos y una bajada en una banda puede deberse a la composicion del corpus, no a una mejora del modelo.
- No hay validacion en benchmarks downstream ni en tests de recuperacion: no se puede afirmar calidad en tareas reales de contexto largo.
- No superar los 163.840 tokens: la banda 160k-256k presenta perplejidad 235, indicando RoPE roto.
- Cero descargas y cero likes en el momento de la publicacion: sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin evaluacion de sesgos ni de alucinacion, cualquier despliegue en produccion requiere evaluacion propia y, previsiblemente, fine-tuning instruct y de seguridad.
- El tokenizer es el del modelo base, con `add_bos_token` en false; hay que respetar esa configuracion para no degradar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ankush13r/prelude-base-iter_1192093-yarn-160k
- Modelo base: https://huggingface.co/openeurollm/prelude-base
- Version anterior con YaRN 128k: https://huggingface.co/ankush13r/prelude-base-iter_0989075-yarn-128k
- Repositorio `openeurollm/prelude`: https://huggingface.co/openeurollm/prelude
- Paper de YaRN: no disponible en la informacion proporcionada
- Paper de LongRoPE: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
