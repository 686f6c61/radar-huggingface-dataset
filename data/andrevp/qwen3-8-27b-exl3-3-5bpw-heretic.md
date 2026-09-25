# andrevp/Qwen3.8-27B-EXL3-3.5bpw-heretic

## Resumen

Qwen3.8-27B-EXL3-3.5bpw-heretic es una version abliterada (decensored) del modelo cuantizado Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw, publicada por el usuario andrevp. La intervencion se ha realizado con Heretic 2.0.0.dev0 (commit 3521f86) ejecutando las pasadas forward directamente sobre el modelo EXL3 cuantizado, no sobre los pesos en bf16. Pertenece a la familia Qwen3.5 (etiqueta qwen3_5) y usa una arquitectura hibrida con atencion clasica, capas Gated DeltaNet y bloques MLP, segun se deduce de las proyecciones ablacionadas que detalla la model card.

La innovacion principal es el modo de aplicar la ablacion: los pesos EXL3 a 3,5 bits por peso son identicos bit a bit a los originales (sha256 verificados) y la modificacion se guarda en un fichero sidecar de 2,9 MB (`abliteration.safetensors`) que se aplica en tiempo de inferencia sobre la salida de las proyecciones cuantizadas, sin tocar ni refusionar los tensores. Esto permite activar y desactivar la abliteracion sin recargar el modelo, algo que no ofrecen las exportaciones habituales de Heretic que integran un SVD de bajo rango en pesos bf16.

Es relevante para investigacion en seguridad (red teaming, analisis de mecanismos de rechazo) porque elimina los rechazos duros manteniendo casi intacto el rendimiento: MMLU pasa de 81,7% a 80,9%, GSM8K de 96,0% a 95,6% y la perplejidad en wikitext-2 de 7,179 a 7,190. El repositorio esta etiquetado con licencia apache-2.0, tiene 15,4 GB y requiere la libreria exllamav3 para su ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion (o_proj) y Gated DeltaNet (out_proj) mas MLP (down_proj); etiqueta de familia qwen3_5 |
| Parametros totales | 7.669.052.656 segun safetensors del repositorio (el nombre del modelo indica 27B; discrepancia no resuelta, ver limitaciones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible. El ejemplo de uso de la model card configura `Cache(model, max_num_tokens = 32768)` |
| Tipos de cuantizacion | EXL3 3,5 bpw (unica variante publicada) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3 cuantizado, 2 shards) + sidecar `abliteration.safetensors` (2,9 MB) y `abliteration_directions.safetensors` |
| Numero de bloques | 65 (deducido de la forma del tensor de direcciones: (65, 5120)) |
| Dimension oculta | 5120 (deducido del tensor de direcciones) |
| Proyecciones ablacionadas | 100 |
| Tamano del repositorio | 15,4 GB |
| Libreria de inferencia | exllamav3 (ExLlamaV3) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo base sobre el que se trabaja es un Qwen3.5 con arquitectura hibrida: los bloques combinans atencion, capas Gated DeltaNet (una forma de atencion lineal con estado recurrente) y MLP. La model card confirma esta composicion al enumerar las proyecciones que escriben en el residual stream y que Heretic modifica: `o_proj` de atencion, `out_proj` de Gated DeltaNet y `down_proj` del MLP. No se proporciona informacion sobre el numero de tokens de preentrenamiento, la composicion del dataset, ni si el modelo base paso por RLHF o DPO. Tampoco se detalla el proceso de cuantizacion original a EXL3 3,5 bpw, mas alla de que lo realizo Mia-AiLab.

La abliteracion no es un reentrenamiento: es una edicion post-hoc de las proyecciones de salida. Con normalizacion de filas completa (`row_normalization = "full"`) la proyeccion modificada se define como `W' = diag(n / m) · (I − λ v vᵀ) · Wn`, donde `Wn` es W con filas normalizadas a longitud unitaria, `n` contiene las normas de fila originales y `m` las normas de fila de `(I − λ v vᵀ) Wn`. La aplicacion en inferencia se reduce a `W' x = y ⊙ s − b · ⟨y, a⟩`, con `a = v / n`, `b = λ · n ⊙ v / m` y `s = 1 / m` precalculados por proyeccion desde los pesos EXL3 desquantizados y almacenados bajo las claves `<block>.abl_attn.{a,b,s}` y `<block>.abl_mlp.{a,b,s}`.

El proceso de busqueda uso 200 trials de Optuna TPE (60 de arranque aleatorio, semilla 1337) mas 5 configuraciones encoladas de un barrido manual. Las direcciones de rechazo se calcularon como la diferencia media de residuos por capa entre 400 prompts daninos (mlabonne/harmful_behaviors) y 400 inofensivos (mlabonne/harmless_alpaca), tomadas en la posicion posterior a un bloque de pensamiento cerrado y ortogonalizadas contra la media de los inofensivos. Los objetivos se midieron sobre los primeros 160 tokens de razonamiento (rechazos) y sobre el primer token de razonamiento en 100 prompts inofensivos (divergencia KL). El trial seleccionado fue el 198, con 4/100 rechazos frente a 96/100 de la linea base y KL de 0,021.

## Capacidades

- Generacion de texto y conversacion multi-turno en el formato de chat de la familia Qwen3.5, con modo de pensamiento explicito mediante el bloque `<think>` del chat template.
- Razonamiento y matematicas: 96,0% en GSM8K (250 preguntas, greedy, sin pensamiento) y 81,7% en MMLU (1000 preguntas, zero-shot) en el modelo original.
- Eliminacion de rechazos: 0% de rechazos duros en JailbreakBench-100 tanto en modo pensamiento como sin el, frente a 94% y 97,5% del modelo original.
- Conmutacion de comportamiento en caliente: la funcion `exl3_ablation.apply()` y `exl3_ablation.remove()` permiten pasar del modelo abliterado al original sin recargar pesos.
- Compatibilidad con decodificacion especulativa: el wrapper funciona con las rutas de decodificacion fusionada y con drafts DFlash2 / MTP.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no aparece en los metadatos).
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es text-generation.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo permite generar respuestas completas a prompts daninos de JailbreakBench sin rechazos, lo que sirve para construir conjuntos de ataque y medir la tasa de deteccion de clasificadores de contenido propios con 100 prompts de referencia ya evaluados en la model card.
- Investigacion sobre mecanismos de rechazo: al mantener los pesos EXL3 identicos y aplicar la ablacion como sidecar, se puede comparar la misma generacion con la ablacion activada y desactivada en el mismo proceso (generaciones greedy byte a byte identicas segun la model card), aislando el efecto de las 100 proyecciones modificadas sobre la KL de 0,0044 y el 96,9% de acuerdo en el token top-1.
- Generacion de datos sinteticos para ajuste fino: producir pares instruccion-respuesta sobre temas que el modelo base rechazaria sistematicamente, utiles para entrenar modelos con politicas de contenido mas permisivas o para aumentar la diversidad de datasets de instrucciones.
- Escritura creativa y ficcion sin bloqueos: novelas, guiones y roleplay con violencia, contenido adulto o temas controvertidos dentro de un marco legal, donde el 97% de rechazos por palabra clave del modelo original interrumpiria la generacion.
- Traduccion y localizacion de material sensible: adaptar textos que contienen lenguaje ofensivo, insultos o terminologia conflictiva sin que el modelo se niegue a reproducir el original.
- Evaluacion de guardrails en produccion: usar el modelo como adversario controlado para probar los filtros de entrada y salida de un sistema desplegado, comparando la tasa de evasion antes y despues de cada iteracion del filtro.
- Asistencia conversacional local de baja latencia: con 15,4 GB de pesos y una cache de 32.768 tokens, se puede servir en una unica GPU de 24 GB mediante exllamav3 o TabbyAPI, con un coste de decodificacion adicional del 1-2% por las 100 operaciones fusionadas de la ablacion.
- Razonamiento matematico asistido por ordenador: con un 95,6% en GSM8K sin modo pensamiento, es viable para resolver problemas aritmeticos encadenados en un pipeline interno, siempre que no se requiera el modo de reflexion explicita.

## Benchmarks y rendimiento

Todos los datos proceden de la model card del autor. Las mismas ponderaciones se cargaron en un unico proceso con la ablacion activada y desactivada; toda la decodificacion fue greedy.

| Metrica | Original | Heretic (este modelo) |
|---|---|---|
| wikitext-2, perplejidad (81.840 tokens, ventanas de 1024) | 7,179 | 7,190 |
| KL por token (original ‖ heretic), media | 0 | 0,0044 |
| Acuerdo en el token top-1 | 100% | 96,9% |
| MMLU (1000 preguntas aleatorias, zero-shot, logits de letra) | 81,7% | 80,9% |
| GSM8K (250 primeras preguntas, greedy, sin pensamiento) | 96,0% | 95,6% |
| JailbreakBench-100 sin pensamiento, rechazos duros | 94% | 0% |
| JailbreakBench-100 con pensamiento, rechazos duros | 97,5% | 0% |
| JailbreakBench-100 sin pensamiento, cualquier palabra clave de rechazo | 97% | 46% |

Los numeros brutos estan en el directorio `eval/` del repositorio. La model card incluye una fila adicional para JailbreakBench-40 en modo pensamiento cuya cifra queda truncada en la informacion proporcionada. No se han publicado resultados de HumanEval, MMLU-Pro, MT-Bench ni de capacidades multilingues.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,4 GB en EXL3 a 3,5 bpw, por lo que se necesitan aproximadamente 16 GB solo para pesos. Hay que sumar la cache KV correspondiente a la ventana configurada (el ejemplo usa 32.768 tokens) y el overhead del runtime.
- GPU recomendadas: cualquier NVIDIA con CUDA y al menos 24 GB para operar con comodidad a 32k de contexto (RTX 3090, RTX 4090, L40S, A100 40 GB, H100). El runtime exllamav3 no soporta aceleracion en CPU ni en GPU de otros fabricantes.
- GPU de consumo: si cabe en una unica GPU de 24 GB, e incluso en tarjetas de 16 GB si se reduce la ventana de contexto. No hay datos publicados de ejecucion en GPUs de 8-12 GB.
- Opciones de despliegue: exllamav3 de serie (con `exl3_ablation.apply()` desde Python) y TabbyAPI. En TabbyAPI la ablacion solo se aplica si se anade manualmente `exl3_ablation.apply(self.model, model_dir)` tras la carga, o si se usa una build de exllamav3 que lea `abliteration.safetensors` de forma nativa; en caso contrario se sirve el modelo original sin avisar. No hay soporte para llama.cpp, Ollama ni TGI, ya que no se publican pesos GGUF.
- Latencia y throughput: el coste del sidecar es de 100 operaciones fusionadas pequenas por pasada forward, aproximadamente un 1-2% de la velocidad de decodificacion. No se publican tokens por segundo absolutos ni latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (andrevp/Qwen3.8-27B-EXL3-3.5bpw-heretic) | 7.669.052.656 segun safetensors | No disponible (ejemplo a 32.768 tokens) | EXL3 3,5 bpw | apache-2.0 | safetensors + sidecar | Abliterado; 0% de rechazos duros; MMLU 80,9%; GSM8K 95,6% |
| Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw (modelo base) | Pesos identicos bit a bit en los dos shards | No disponible | EXL3 3,5 bpw | no disponible en los metadatos consultados | safetensors | Mismo rendimiento con rechazos al 94% (sin pensamiento) y 97,5% (con pensamiento) |
| Exportacion estandar de Heretic (SVD de bajo rango fusionado en bf16) | No disponible | No disponible | bf16 | no disponible | safetensors | Aproxima la misma modificacion con un SVD de bajo rango e integra el cambio en los pesos; no permite conmutar en caliente |

No se dispone de datos verificables de otras alternativas comparables de la misma categoria (por ejemplo, variantes abliteradas de Qwen, Llama o Mistral de tamano similar), por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Modelo abliterado: el alineamiento de seguridad y la mayor parte de los rechazos han sido eliminados de forma deliberada. Generara contenido danino, ilegal o peligroso si se le solicita. La responsabilidad legal y etica del uso recae integramente en el operador.
- Las palabras clave de rechazo residuales siguen apareciendo en el 46% de los casos en modo sin pensamiento (frente al 97% del original), y la model card deja truncada la cifra de JailbreakBench-40 en modo pensamiento. El comportamiento no es completamente uniforme.
- Degradacion de calidad medible aunque pequena: -0,8 puntos en MMLU, -0,4 en GSM8K, +0,15% de perplejidad en wikitext-2 y 96,9% de acuerdo en el token top-1 frente al original. En tareas de cola larga el efecto puede ser mayor, pero no se ha medido.
- Discrepancia de datos sin resolver: el nombre del repositorio indica 27B, el recuento de safetensors da 7.669.052.656 parametros y el repositorio pesa 15,4 GB. EXL3 almacena los pesos empaquetados, por lo que el recuento de elementos de los ficheros puede no equivaler al numero logico de parametros, pero esto no se confirma en la informacion disponible. Tratar cualquier estimacion de VRAM como orientativa.
- Dependencia de codigo propietario del repositorio: la abliteracion solo se aplica si se ejecuta `exl3_ablation.py`. En TabbyAPI sin parchear el modelo se sirve como el original sin ninguna advertencia, lo que puede dar lugar a despliegues con comportamiento distinto al esperado.
- Riesgo de alucinacion: no se publican mediciones de fidelidad factual ni tasas de alucinacion. Al ser un modelo de 7,6B de elementos de safetensors (o 27B nominales), cabe esperar una tasa de alucinacion superior a la de modelos frontera, pero no hay datos que lo cuantifiquen.
- Idiomas: los idiomas soportados no estan declarados en los metadatos ni evaluados. No hay garantia de buen rendimiento en castellano mas alla de lo que herede la familia Qwen3.5.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos demograficos, politicos o culturales. La abliteracion puede incrementar la reproduccion de estereotipos al eliminar la capa de rechazo.
- Licencia: apache-2.0 permite uso comercial segun los terminos de esa licencia, pero no exime de cumplir la normativa aplicable al contenido generado. Conviene verificar tambien la licencia del modelo base y del modelo original de Qwen.
- Madurez del artefacto: creado el 2026-09-25, con 0 descargas y 0 likes en el momento de la consulta. No hay validacion externa ni replicacion independiente de los numeros de la model card.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces indexados disponibles pertenecen a foros y guias sin relacion con el proyecto, por lo que no se incluyen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andrevp/Qwen3.8-27B-EXL3-3.5bpw-heretic
- Modelo base cuantizado: https://huggingface.co/Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Dataset de prompts daninos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts inofensivos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Resultados brutos de evaluacion: directorio `eval/` dentro del repositorio de HuggingFace
- Parametros de la ablacion: ficheros `abliteration.json`, `abliteration.safetensors` y `abliteration_directions.safetensors` dentro del repositorio
- Resultados de busqueda web: no se encontraron enlaces relevantes sobre este modelo en la busqueda realizada
