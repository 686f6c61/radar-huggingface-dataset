# cmh/Qwen3.8-Flash-Next-5.33bpw-PLEQ8_0

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo denominado Qwen3.8-Flash-Next, publicada por el usuario cmh bajo el identificador cmh/Qwen3.8-Flash-Next-5.33bpw-PLEQ8_0. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a formato GGUF con una receta de cuantizacion mixta que combina tipos de 8, 4 y 3 bits junto con tensores preservados en F32 y BF16. El resultado es un unico archivo de aproximadamente 109,80 GiB con una media de 5,33 bits por peso (BPW).

La relevancia de esta ficha es practica: la receta de cuantizacion revela la estructura interna del modelo original, ya que los nombres de los tensores incluyen componentes de atencion, de espacio de estados (ssm_conv1d, ssm_a, ssm_dt, ssm_norm, ssm_alpha, ssm_beta), de mezcla de expertos (ffn_gate_inp, ffn_gate_exps, ffn_up_exps, ffn_down_exps, ffn_gate_inp_shexp) y de un modulo indexador (indexer.q_norm, indexer.k_norm), ademas de modulos PLE (per_layer_token_embd, ple_norm_conv, ple_norm_key, ple_norm_query, ple_conv1d). Los indices de bloque llegan hasta blk.47, lo que implica 48 bloques.

El autor documenta una configuracion probada de llama-server para 64 GB de RAM y 12 GB de VRAM, con contexto de 131 072 tokens, cache KV cuantizada a q8_0 y decodificacion de razonamiento con esfuerzo xhigh. No hay informacion sobre licencia, idiomas, parametros totales confirmados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida con componentes de atencion, SSM (tensores ssm_*) y mezcla de expertos (MoE con experto compartido); no confirmada por el autor |
| Parametros totales | No disponible en la model card; estimacion aritmetica a partir de 109,80 GiB y 5,33 BPW: ~165 000 millones (no confirmado) |
| Parametros activos | No disponible (la estructura MoE implica activacion parcial, pero no se especifica la relacion expertos activos/totales) |
| Longitud de contexto | Al menos 131 072 tokens (valor usado en la configuracion de llama-server recomendada por el autor); maximo nativo no disponible |
| Tipos de cuantizacion | Mixta: F32, BF16, Q8_0, Q4_K, IQ4_NL, IQ4_XS, IQ3_S, IQ3_XXS |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (un unico archivo) |
| Tamano de archivo | ~109,80 GiB |
| BPW medio | ~5,33 |
| Numero de bloques | 48 (indices blk.0 a blk.47) |
| Numero de tensores | 1 224 en total (557 F32, 499 Q8_0, 50 IQ3_S, 48 IQ4_NL, 26 IQ3_XXS, 24 BF16, 18 IQ4_XS, 2 Q4_K) |
| Imatrix | imatrix_unsloth.gguf_file, procedente de unsloth/Qwen3.8-Flash-Next-GGUF |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

No hay informacion sobre el proceso de entrenamiento de Qwen3.8-Flash-Next: la model card de este repositorio solo describe la conversion a GGUF, no el preentrenamiento, el ajuste fino ni posibles fases de RLHF o DPO. Toda la informacion estructural disponible procede de los nombres de los tensores incluidos en la receta de cuantizacion.

Esa receta permite inferir varios rasgos del modelo subyacente. La presencia de tensores ssm_a, ssm_conv1d, ssm_dt.bias, ssm_norm, ssm_alpha y ssm_beta por bloque apunta a capas de espacio de estados (estilo Mamba o similar) conviviendo con mecanismos de atencion, lo que situaria al modelo en la categoria de arquitecturas hibridas. La existencia de ffn_gate_inp, ffn_gate_inp_shexp, ffn_gate_exps, ffn_up_exps y ffn_down_exps indica una capa de mezcla de expertos con experto compartido (shared expert) ademas de enrutador. Los tensores indexer.q_norm y indexer.k_norm sugieren un modulo de indexacion asociado a un esquema de atencion dispersa. Los tensores con prefijo PLE (per_layer_token_embd, ple_norm_conv, ple_norm_key, ple_norm_query, ple_conv1d) corresponden a modulos de embedding por capa. Los tensores hc_* (hc_attn_norm, hc_ffn_norm, hc_attn_inject, hc_ffn_inject) no se pueden interpretar con la informacion disponible.

En cuanto a la innovacion de la conversion, el autor aplica una asignacion diferenciada por capa: los tensores de mezcla (ffn_down_exps, ffn_gate_exps, ffn_up_exps) se reparten entre q4_k en el bloque 47, iq4_xs en los bloques 1-5 y 43-46, iq3_xxs en los bloques 0 y 31-42, e iq3_s en los bloques 6-30. Los tensores de embedding de tokens se mantienen en q8_0 y todos los parametros pequenos y sensibles (normalizaciones, coeficientes SSM, modulos PLE, indexadores) se preservan en f32. La model card no indica que se haya aplicado una fase de calibracion adicional mas alla del uso del archivo imatrix de unsloth.

## Capacidades

- Generacion de texto y razonamiento: el autor incluye en la configuracion de llama-server los parametros --reasoning-preserve y --reasoning-effort xhigh, lo que indica compatibilidad con un modo de razonamiento extendido y con la preservacion del bloque de razonamiento en el historial. No se documentan capacidades concretas adicionales.
- Procesamiento de contexto largo: la configuracion recomendada usa -c 131072 con cache KV cuantizada a q8_0, lo que permite ventanas de 128 000 tokens en el hardware objetivo indicado.
- Soporte de tool calling / function calling: no disponible en la documentacion del repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentacion del repositorio, aunque el modo de razonamiento configurable es un indicio indirecto que no conviene dar por confirmado.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Estrategia de decodificacion: el autor fija temperatura 0, top-k 20, top-p 0,95 y min-p 0,1 en el ejemplo de servidor, valores orientados a generacion determinista.

## Casos de uso

- Analisis de documentacion tecnica extensa: con una ventana configurada de 131 072 tokens y cache KV cuantizada, el modelo puede procesar manuales completos, expedientes o bases de codigo de gran tamano en una sola pasada, siempre que el operador disponga de suficiente memoria combinada de CPU, GPU y almacenamiento.
- Asistentes de razonamiento paso a paso: el modo de razonamiento con esfuerzo xhigh permite obtener cadenas de razonamiento largas antes de la respuesta final, util en tareas de verificacion matematica, planificacion o diagnostico donde interesa auditar el proceso intermedio.
- Procesamiento por lotes en servidor local: la configuracion de llama-server con -np 1 indica una orientacion a una unica secuencia simultanea; es adecuada para colas de trabajos secuenciales de alto valor donde prima la calidad sobre el throughput.
- Generacion asistida por recuperacion (RAG): la ventana larga permite insertar muchos fragmentos recuperados con sus metadatos sin truncar el contexto, reduciendo la necesidad de reordenar o resumir pasajes antes de la consulta.
- Evaluacion e investigacion de arquitecturas hibridas: al conservar en f32 los tensores SSM, los modulos PLE y los indexadores, esta cuantizacion resulta util para estudiar el comportamiento de modelos hibridos MoE+SSM en entornos con recursos limitados sin recurrir a los pesos originales de mayor precision.
- Despliegue en estaciones de trabajo con GPU de gama alta de consumo: con 12 GB de VRAM, 64 GB de RAM y descarga de expertos a CPU (-ncmoe 47) y mmap, el modelo puede funcionar en un equipo de sobremesa bien equipado, lo que habilita prototipado local de aplicaciones que de otro modo requeririan un nodo multi-GPU.
- Sustitucion de APIs externas en flujos con datos sensibles: al ejecutarse integramente en infraestructura propia, permite tratar informacion confidencial sin enviarla a terceros, siempre que la licencia del modelo original lo autorice (dato no disponible en este repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de este repositorio no incluye ninguna medicion de MMLU, HumanEval, GSM8K, MATH ni de tareas multimodales, y tampoco reporta cifras de latencia o throughput medidas. El unico dato de rendimiento operativo es la configuracion de referencia probada por el autor (64 GB de RAM y 12 GB de VRAM, contexto de 131 072 tokens, -t 8, -b 512, -ub 512), sin valores de tokens por segundo asociados.

## Requisitos de hardware

- Almacenamiento: al menos 109,80 GiB libres para el archivo GGUF. Se recomienda almacenamiento NVMe, ya que la configuracion del autor usa -lm mmap y parte de los pesos se leen desde disco.
- Memoria combinada probada por el autor: 64 GB de RAM mas 12 GB de VRAM, junto con los ajustes -ngl 99 (todas las capas en GPU para los tensores no expertos) y -ncmoe 47 (expertos descargados a CPU), mas -fit off.
- Residencia completa en memoria: no confirmada. Con ~110 GiB de pesos, una ejecucion sin paginacion a disco exigiria del orden de 110-120 GB de memoria combinada, cifra estimada a partir del tamano de archivo y no verificada por el autor.
- GPU recomendadas: no disponible. El unico dato aportado es que funciona con una GPU de 12 GB de VRAM en el esquema con descarga de expertos a CPU. No hay informacion sobre A100, H100, RTX 4090 ni otros modelos concretos.
- Cabe en GPU de consumo: si, segun la configuracion probada, siempre que se combine con 64 GB de RAM y se descarguen los expertos a CPU. No se especifica que GPU de 12 GB concreta se utilizo.
- Opciones de despliegue: llama.cpp / llama-server es la unica opcion documentada por el autor, con los parametros -fit, -t, -np, -lzm, -lm, -b, -ub, -kvu, -ctk, -ctv, -ngl, -ncmoe, --reasoning-preserve, --reasoning-effort, --temp, --top-k, --top-p, --min-p, --presence-penalty, -cram, --ctx-checkpoints, --checkpoint-min-step y -c. Al ser un GGUF, es teoricamente compatible con otros ejecutores de llama.cpp (Ollama, LM Studio, koboldcpp), aunque no se ha verificado en ellos.
- Latencia y throughput: no disponible.
- Gestion de contexto: el autor recomienda cache KV en q8_0 y el uso de --ctx-checkpoints 8 con --checkpoint-min-step 1024, util para reanudar conversaciones largas sin reprocesar todo el contexto.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La busqueda web realizada devuelve resultados no relacionados con el modelo (siglas CMH asociadas a una escuela de hosteleria, una revista de hepatologia, el complejo mayor de histocompatibilidad, el Centre Maurice Halbwachs y un campus en Paris), por lo que no aportan datos tecnicos utiles.

La unica comparacion posible con los datos disponibles es entre variantes de pesos del mismo modelo:

| Variante | Formato | Tamano / precision | Licencia | Disponibilidad |
|---|---|---|---|---|
| cmh/Qwen3.8-Flash-Next-5.33bpw-PLEQ8_0 (este repositorio) | GGUF, cuantizacion mixta ~5,33 BPW | ~109,80 GiB | No disponible | Publicado, 0 descargas y 0 likes en el momento de la ficha |
| unsloth/Qwen3.8-Flash-Next-GGUF | GGUF; solo se referencia su archivo imatrix | No disponible | No disponible | Repositorio referenciado por el autor para la imatrix |
| Pesos originales de Qwen3.8-Flash-Next | No disponible (presumiblemente safetensors en BF16 o similar) | No disponible | No disponible | No referenciado en la model card de este repositorio |

## Limitaciones y advertencias

- Ausencia total de informacion sobre licencia: no se puede determinar si el uso comercial esta permitido. Es imprescindible consultar el repositorio del modelo original antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: no hay forma de saber si el modelo rinde de manera uniforme en castellano u otras lenguas, ni de anticipar sesgos linguisticos.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de veracidad ni de tasa de alucinacion para este modelo o esta cuantizacion.
- Perdida de calidad por cuantizacion: los tensores de mezcla se distribuyen entre iq3_s, iq3_xxs, iq4_xs y q4_k, con lo que las capas 6-30 quedan en 3 bits para los expertos. Aunque el autor preserva en f32 los componentes sensibles (SSM, PLE, indexadores, normalizaciones), no se aportan mediciones comparativas frente a cuantizaciones de mayor precision o frente a los pesos originales.
- Dependencia de memoria externa: en la configuracion probada, 47 capas descargan expertos a CPU y se usa mmap, de modo que el rendimiento depende criticamente de la velocidad del subsistema de memoria y del almacenamiento. Un disco lento degradara la latencia de forma acusada.
- Concurrencia limitada: la configuracion recomendada usa -np 1, es decir, una sola ranura de procesamiento. No esta pensada para servir cargas con muchas peticiones simultaneas.
- Cifras de rendimiento ausentes: sin datos de tokens por segundo, latencia de primer token ni consumo energetico, la planificacion de capacidad en produccion es especulativa.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas etiquetados en HuggingFace. Se trata de una publicacion reciente y sin validacion por parte de la comunidad.
- Interpretacion de arquitectura: los detalles de arquitectura de esta ficha se derivan de los nombres de tensores de la receta de cuantizacion y no estan confirmados por el autor del modelo original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cmh/Qwen3.8-Flash-Next-5.33bpw-PLEQ8_0
- Archivo imatrix de referencia: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF/blob/main/imatrix_unsloth.gguf_file
- Repositorio GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
