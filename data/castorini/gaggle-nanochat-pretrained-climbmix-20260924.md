# castorini/gaggle-nanochat-pretrained-climbmix-20260924

## Resumen

gaggle-nanochat-pretrained-climbmix-20260924 es un modelo de lenguaje base de 3.286.633.962 parametros, decoder-only, desarrollado por la organizacion castorini y entrenado desde cero con el framework nanochat de Andrej Karpathy. Se trata de un modelo causal puro, sin post-entrenamiento: no ha pasado por instruction tuning ni por RLHF, por lo que su comportamiento es el de continuar texto en lugar de seguir instrucciones. Emplea una arquitectura transformer de profundidad 34 con anchura 2.176, 17 cabezas de atencion de dimension 128 y una ventana de contexto de 2.048 tokens.

El modelo se entrena con una sola pasada sobre ClimbMix (287.000 millones de tokens) y esta pensado como pieza de investigacion reproducible en la seccion de pre-entrenamiento del articulo de sus autores. Su interes practico esta en que las mismas pesos se cargan de tres formas distintas (transformers con `trust_remote_code=True`, vLLM mediante un plugin y el codigo original de nanochat), lo que lo convierte en un banco de pruebas util para estudiar arquitecturas poco convencionales dentro del ecosistema estandar.

Los resultados publicados son modestos en terminos absolutos (CORE 0.458, MMLU 0.493, MMLU-Pro 0.178), coherentes con un presupuesto de computo de aproximadamente 1.600 horas de H100 y un contexto corto de 2.048 tokens. Su relevancia no reside en el rendimiento bruto, sino en ser un artefacto de investigacion abierto (licencia MIT) que documenta una arquitectura nanochat con value embeddings en capas alternas y atencion con sliding window en tres de cada cuatro capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only nanochat depth-34 (34 capas, anchura 2.176, 17 cabezas de atencion de dimension 128) |
| Parametros totales | 3.286.633.962 (3,29 B) |
| Parametros activos | No aplica (no es MoE). Computo por token equivalente a un modelo denso de ~2 B, porque los value embeddings son tablas de busqueda |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (el modelo se publica en safetensors; en la informacion no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere codigo personalizado: `configuration_gaggle.py` y `modeling_gaggle.py`) |

Desglose de parametros por componente: 1,93 B en los bloques del transformer, 1,21 B en las tablas de value embeddings y 0,14 B en los embeddings de entrada y salida (no atados).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 34 capas con una anchura de 2.176 y 17 cabezas de atencion de dimension 128. Incorpora rotary position embeddings (RoPE), normalizacion QK, RMSNorm sin parametros, MLP con activacion squared-ReLU, embeddings de entrada y salida no atados y logit soft-capping. Dos elementos la distinguen: en primer lugar, cada dos capas incorpora un value embedding adicional, y esas tablas de busqueda suman 1,21 B de parametros (por eso el coste por token es el de un modelo denso de ~2 B pese a tener 3,29 B); en segundo lugar, tres de cada cuatro capas aplican una sliding window de 512 tokens en lugar de atencion completa sobre los 2.048 tokens de contexto. El tokenizador es un byte-level BPE de 32.768 entradas, entrenado sobre los primeros 2.000 millones de caracteres del split de entrenamiento. El codigo de referencia es `karpathy/nanochat` en el commit `92d63d4`.

El entrenamiento usa ClimbMix (`karpathy/climbmix-400b-shuffle`) con una unica pasada de 287.000 millones de tokens; el ultimo de los 6.543 shards se reserva para validacion. Los documentos se empaquetan en secuencias de 2.048 tokens con el BOS-aligned best-fit packing de nanochat. El optimizador es el de nanochat sin cambios: Muon para las matrices de pesos de los bloques del transformer y AdamW para embeddings y parametros escalares, con un calentamiento breve, tasa constante y decaimiento lineal posterior. La unica modificacion respecto a nanochat es el tamano de batch, que crece de 262.144 a 2.097.152 tokens, manteniendo los valores pico de learning rate sin reescalarlos con la raiz cuadrada del batch. El computo total fue de un nodo de ocho GPUs NVIDIA H100 con multiplicaciones matriciales en FP8, aproximadamente 1.600 horas de H100. El checkpoint publicado corresponde al paso 227.158, tras 283.000 millones de tokens, elegido por ser el de mayor CORE medido durante el entrenamiento (el checkpoint final, a 287.000 millones de tokens, obtuvo 0,004 menos).

## Capacidades

- Generacion de texto autoregresiva en ingles, en modo continuacion de texto (modelo base, no ajustado a instrucciones).
- Razonamiento en contexto: la evaluacion CORE mide 22 tareas de in-context learning con 500 ejemplos cada una.
- Conocimiento enciclopedico limitado evaluado mediante MMLU y MMLU-Pro en modo 5-shot, puntuando por verosimilitud de la letra de respuesta.
- Calculo de log-verosimilitud de continuaciones, util para puntuacion, ranking y evaluacion de hipotesis.
- Carga y ejecucion en tres runtimes distintos: transformers, vLLM (mediante plugin) y el codigo original de nanochat.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso entrenado.
- No dispone de modo "thinking", vision, audio ni otras modalidades.
- Capacidad multilingue: solo ingles declarado; no hay datos de rendimiento en otros idiomas.

## Casos de uso

- Investigacion en pre-entrenamiento reproducible: el modelo permite reproducir y auditar una arquitectura nanochat concreta con licencia MIT, comparando el efecto del presupuesto de tokens sobre el CORE frente al checkpoint oficial de nanochat d34.
- Puntuacion y ranking de textos: usando el calculo de log-verosimilitud de continuaciones, se puede emplear como scorer para seleccion de candidatos, filtrado de datos sinteticos o reranking, aprovechando que el modelo devuelve logits en fp32.
- Generacion de datos sinteticos para otros modelos: al ser un modelo base, resulta adecuado para producir continuaciones de documentos y aumentar corpus de entrenamiento en ingles, siempre con revision posterior por su tendencia a repetir.
- Pruebas de infraestructura de inferencia: sirve como caso de validacion de soporte de arquitecturas personalizadas en pipelines con transformers y vLLM, ya que las mismas pesos se cargan en ambos runtimes.
- Estudio de arquitecturas eficientes en atencion: las capas con sliding window de 512 tokens y los value embeddings en capas alternas permiten medir empiricamente el equilibrio entre coste por token y calidad.
- Experimentos academicos de comparacion de tokenizadores y empaquetado: el uso de BPE de 32.768 entradas y del BOS-aligned best-fit packing facilita analisis de eficiencia de tokenizacion y de utilizacion de secuencias.
- Base para fine-tuning downstream: al ser un modelo base de 3,29 B con licencia permisiva, puede servir de punto de partida para ajuste supervisado en tareas especificas en ingles, aunque el contexto de 2.048 tokens limita tareas de documento largo.

## Benchmarks y rendimiento

| Modelo | Tokens de entrenamiento | CORE | MMLU (5-shot) | MMLU-Pro (5-shot) |
|---|---:|---:|---:|---:|
| This model | 283 B | 0,458 | 0,493 | 0,178 |
| nanochat d34 | 89 B | 0,338 | 0,257 | 0,115 |

CORE es la precision media centrada de nanochat sobre 22 tareas de in-context learning con 500 ejemplos cada una; MMLU y MMLU-Pro se puntuan con el LM Evaluation Harness por verosimilitud de la letra de respuesta. La perdida de validacion en el shard reservado de ClimbMix es de 0,596 bits per byte. Todas las cifras proceden de la evaluacion de los autores, salvo el CORE de nanochat d34, que es la cifra publicada por su autor. No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks estandar, por lo que no se incluyen.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 6,6 GB solo para pesos, mas activaciones y cache KV para 2.048 tokens; en la practica, unos 8-10 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3,3-4 GB de pesos; en 4 bits, alrededor de 1,8-2,5 GB. No obstante, no hay cuantizaciones publicadas ni documentadas para este checkpoint.
- GPU recomendadas: el entrenamiento se realizo en ocho NVIDIA H100 con FP8; para inferencia se documenta una ejecucion de ejemplo en una NVIDIA H200. Cualquier GPU con al menos 10-12 GB de VRAM es suficiente en bf16.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas como RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090, asi como en GPUs de 16 GB o mas, siempre que se use bf16 y se limite la longitud de secuencia a 2.048 tokens.
- Opciones de despliegue: transformers (`>=4.57` con `torch>=2.5` y `trust_remote_code=True`), vLLM mediante un plugin de la propia organizacion, y el codigo original de nanochat cargando los ficheros de checkpoint originales. No hay evidencia de soporte de llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponible. La model card no publica medidas de latencia ni de tokens por segundo; el unico dato de rendimiento es el coste de entrenamiento de unas 1.600 horas de H100.
- Nota de precision: nanochat ejecuta la atencion con Flash Attention 3 en GPUs Hopper cuando el kernel esta disponible, mientras que este port usa siempre `scaled_dot_product_attention` de PyTorch. Con el mismo kernel los logits son identicos bit a bit; entre kernels, el redondeo en bf16 altera ligeramente las log-probabilidades.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | CORE | MMLU | MMLU-Pro | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---:|---:|---|---|
| gaggle-nanochat-pretrained-climbmix-20260924 | 3,29 B | 2.048 | 283 B | 0,458 | 0,493 | 0,178 | MIT | HuggingFace, transformers y vLLM |
| nanochat d34 | no disponible en la informacion | no disponible | 89 B | 0,338 | 0,257 | 0,115 | no disponible en la informacion | HuggingFace (`karpathy/nanochat-d34`) |
| Otros modelos base de ~3 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables es contra nanochat d34, del mismo autor y con la misma arquitectura de base, que con 89.000 millones de tokens obtiene cifras muy inferiores en las tres metricas, lo que refleja principalmente la diferencia de presupuesto de entrenamiento (283 B frente a 89 B). No se dispone en la informacion proporcionada de resultados comparables de otras familias de modelos de tamano similar.

## Limitaciones y advertencias

- Es un modelo base sin post-entrenamiento: no sigue instrucciones, no responde a formatos de dialogo y no ha pasado por RLHF ni DPO. No debe usarse como asistente conversacional sin ajuste previo.
- Riesgo alto de repeticion degenerativa: el propio ejemplo de la model card muestra la salida "The capital of France is Paris." repetida varias veces con decodificacion greedy.
- Ventana de contexto muy corta (2.048 tokens), lo que impide tareas de documento largo, resumen de articulos extensos o conversaciones multi-turno prolongadas.
- Solo se declara soporte de ingles; no hay evaluacion de rendimiento en castellano ni en otros idiomas.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni alineacion. Al entrenarse con un corpus web a gran escala, es esperable la presencia de sesgos y contenido problematico no filtrado.
- Alucinacion: como modelo base entrenado solo para predecir el siguiente token, no tiene mecanismo de abstencion ni de verificacion de hechos; puede producir afirmaciones falsas con fluidez.
- Requiere ejecutar codigo remoto (`trust_remote_code=True`) para cargar la arquitectura, ya que nanochat no forma parte de transformers. Conviene auditar `configuration_gaggle.py` y `modeling_gaggle.py` antes de usarlos en produccion.
- Las secuencias deben comenzar obligatoriamente con el token `<|bos|>`, tal como durante el entrenamiento; omitirlo degrada la calidad de la generacion.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion, sin clausulas de uso aceptable documentadas.
- El checkpoint publicado no es el final del entrenamiento: corresponde al paso 227.158 (283 B tokens) por criterio de CORE, no al ultimo paso.
- Las cifras de MMLU y MMLU-Pro se obtienen por verosimilitud de la letra de respuesta, no por generacion libre, por lo que no son directamente comparables con evaluaciones generativas de modelos instruct.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castorini/gaggle-nanochat-pretrained-climbmix-20260924
- Codigo de nanochat: https://github.com/karpathy/nanochat (commit `92d63d4`)
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Checkpoint de referencia nanochat d34: https://huggingface.co/karpathy/nanochat-d34
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, al paper ni a demos en la busqueda realizada.
