# mitslabo/Qwen3.8-Flash-Next-FP4-Local-Zh-Banned

## Resumen

Qwen3.8-Flash-Next-FP4-Local-Zh-Banned es una modificacion del checkpoint cuantizado NVFP4 publicado por NVIDIA (nvidia/Qwen3.8-Flash-Next-FP4-Local), que a su vez es un repack del modelo base Qwen3.8-Flash-Next. El autor de esta variante es el usuario de Hugging Face mitslabo, y su objetivo es concreto: eliminar la mezcla de caracteres y palabras en chino simplificado que el modelo base produce ocasionalmente en respuestas en japones, sin alterar el resto del comportamiento del checkpoint.

La intervencion consiste en dos cambios acotados. Primero, se sobrescriben en `lm_head.weight` las 25.451 filas correspondientes a tokens exclusivamente chinos, sustituyendolas byte a byte por una fila sobrante del vocabulario (la 248077) para que esos tokens reciban logits despreciables. Segundo, se reemplaza la plantilla de chat por una version corregida de la comunidad que arregla errores de renderizado, invalidacion de cache KV y problemas con tool calls.

El modelo tiene 187.931.804.131 parametros totales y un repositorio de 102,3 GB en safetensors, lo que lo situa en la categoria de modelos de gran escala. Esta pensado para servir con vLLM sobre hardware Blackwell (DGX Spark), con decodificacion especulativa MTP y parsers de razonamiento y tool calling de la familia Qwen. Su relevancia practica es la de un ajuste quirurgico para despliegues en japones que necesitan evitar contaminacion linguistica sin reentrenar ni recuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8-Flash-Next); no se detalla en la informacion disponible |
| Parametros totales | 187.931.804.131 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (checkpoint cuantizado con ModelOpt); `lm_head.weight` almacenado en BF16 y excluido de la cuantizacion |
| Idiomas soportados | japones (ja), ingles (en); el chino simplificado queda bloqueado a nivel de capa de salida |
| Licencia | NVIDIA Open Model Agreement (checkpoint derivado); modelo base subyacente bajo Qwen Community License 1.0; plantilla de chat Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint deriva del repack NVFP4 de NVIDIA sobre Qwen3.8-Flash-Next. La informacion disponible no detalla la arquitectura interna del modelo base (numero de capas, atencion, posible estructura MoE), por lo que ese dato queda como no disponible. Lo que si se documenta es que el checkpoint FP4 fue reentrenado con destilacion consciente de cuantizacion (quantization-aware distillation), lo que explicaria que su tasa de mezcla de chino (5,0%) sea muy inferior al 27% reportado para el checkpoint MLX en el articulo de referencia.

La modificacion de mitslabo no reentrena nada: actua exclusivamente sobre la capa de salida. Se identifican 25.451 tokens exclusivamente chinos y se sobrescriben sus filas en `lm_head.weight` con la fila 248077, la primera fila sobrante mas alla de los 248.077 tokens del tokenizer, de modo que esos tokens producen logits practicamente nulos y quedan fuera de la distribucion de muestreo. El autor verifico la operacion comparando los checkpoints completos byte a byte: el conjunto de filas modificadas coincide exactamente con la lista de bloqueo y no hay ninguna otra diferencia en los tensores. Adicionalmente se sustituye `chat_template.jinja` por la plantilla corregida de froggeric/Qwen-Fixed-Chat-Templates (v22.5), que corrige errores de renderizado, invalidacion de cache KV, envenenamiento por bloques de pensamiento vacios y fallos en tool calls de la plantilla oficial.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking) activable, segun los ajustes de generacion documentados (temperature 1.0, top_p 0.95, top_k 20, hasta 8192 tokens).
- Respuestas en japones e ingles sin contaminacion por caracteres o palabras exclusivas del chino simplificado, que es precisamente el fallo que corrige esta variante.
- Tool calling y function calling, con parser `qwen3_xml` en vLLM y plantilla de chat corregida que arregla los problemas de tool calls de la plantilla oficial.
- Razonamiento multi-paso y uso como agente, con parser de razonamiento `qwen3`.
- Decodificacion especulativa mediante MTP (multi-token prediction) con 4 tokens, soportada por la receta de despliegue.
- Capacidades multilingues limitadas a japones e ingles en la practica; el resto de idiomas no esta documentado.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Documentacion clinica en japones: el modelo se evaluo con 40 preguntas tipo JMMLU en las que explica su eleccion y 20 prompts libres de explicacion a pacientes y cartas de derivacion. Es adecuado porque el bloqueo de tokens chinos elimina las interpolaciones de caracteres que en un contexto medico resultan especialmente problematicas.
- Atencion al cliente en japones: conversaciones multi-turno servidas con vLLM y la plantilla de chat corregida, que evita la invalidacion de cache KV y los fallos de renderizado que degradan el contexto en dialogues largos.
- Asistentes con tool calling en produccion: integracion en pipelines donde el modelo debe invocar funciones externas; el parser `qwen3_xml` y la plantilla v22.5 estan pensados para que las llamadas se rendericen de forma fiable.
- Traduccion y redaccion ja-en: al estar el vocabulario chino neutralizado en la salida, es util en flujos de traduccion donde una fuga de caracteres chinos obliga a postprocesar o revisar manualmente.
- Despliegue en hardware Blackwell de un solo nodo: la receta `qwen3.8-flash-next-nvfp4-solo.yaml` de spark-vllm-docker permite servir el modelo en un DGX Spark, lo que encaja en entornos de laboratorio o prototipado con presupuesto de infraestructura acotado.
- Evaluacion comparativa de robustez linguistica: sirve como referencia para medir la tasa de mezcla de idiomas frente al checkpoint base (0/60 frente a 3/60 en el conjunto de prueba del autor).
- Generacion de cartas de derivacion y documentos administrativos: el modo thinking con hasta 8192 tokens permite producir textos estructurados y justificados, y la ausencia de tokens chinos reduce el riesgo de artefactos en documentos formales.

## Benchmarks y rendimiento

El unico dato de evaluacion publicado en la informacion disponible es la tasa de mezcla de chino sobre un conjunto de 60 preguntas japonesas de ambito medico (40 JMMLU de opcion multiple con explicacion y 20 prompts libres), con thinking activado, temperature 1.0, top_p 0.95, top_k 20 y maximo de 8192 tokens. Se considera respuesta mixta si el texto (excluyendo el bloque de pensamiento) contiene un caracter o palabra exclusivo del chino simplificado.

| Modelo | Respuestas mixtas | Tasa |
|---|---|---|
| Base (nvidia/Qwen3.8-Flash-Next-FP4-Local) | 3 / 60 | 5,0% |
| Este modelo | 0 / 60 | 0,0% |

Las tres respuestas mixtas del modelo base correspondieron a prompts libres y los caracteres detectados fueron 这 y 长. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 102,3 GB en safetensors, por lo que se necesita un acelerador con al menos esa capacidad mas margen para cache KV y activaciones; el calculo exacto de VRAM segun longitud de contexto no esta disponible.
- GPU recomendadas: el autor documenta ejecucion en un unico DGX Spark (hardware Blackwell) con vLLM. No se especifican otras GPU compatibles con NVFP4 en la informacion disponible.
- Cabe en GPU de consumo: no disponible; NVFP4 requiere soporte de hardware Blackwell y el tamano del checkpoint (102,3 GB) excede la memoria de las GPU de consumo habituales.
- Opciones de despliegue: vLLM mediante la receta `recipes/qwen3.8-flash-next-nvfp4-solo.yaml` de spark-vllm-docker, con parser de razonamiento `qwen3`, parser de tool calls `qwen3_xml` y decodificacion especulativa MTP de 4 tokens. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Mezcla de chino (60 prompts ja) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mitslabo/Qwen3.8-Flash-Next-FP4-Local-Zh-Banned | 187.931.804.131 | no disponible | NVFP4 + lm_head BF16 | 0,0% | NVIDIA Open Model Agreement | Hugging Face, 25 descargas |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | 187.931.804.131 | no disponible | NVFP4 | 5,0% | NVIDIA Open Model Agreement | Hugging Face (modelo base) |
| Checkpoint MLX de Qwen3.8-Flash-Next citado en el articulo de CAPHTECH | no disponible | no disponible | MLX | 27% (segun el articulo) | no disponible | no disponible |

No se dispone de datos de benchmarks estandar ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El bloqueo de tokens chinos es una intervencion sobre la capa de salida: impide que esos tokens se generen, pero no elimina el sesgo linguistico en las representaciones internas ni garantiza que el modelo no produzca contenido culturalmente sesgado hacia el chino en otros niveles.
- La evaluacion se limita a 60 prompts de dominio medico en japones; no hay evidencia sobre otros dominios, otros idiomas ni conversaciones multi-turno largas.
- El modelo conserva el riesgo de alucinacion propio de la familia base; no se ha publicado ninguna evaluacion de veracidad.
- La longitud de contexto no esta documentada, lo que dificulta planificar despliegues con ventanas largas.
- La licencia es la NVIDIA Open Model Agreement, no una licencia open source permisiva; el uso comercial esta sujeto a los terminos de dicho acuerdo, y el modelo base subyacente queda bajo la Qwen Community License 1.0. Es imprescindible revisar ambas antes de un despliegue en produccion.
- La plantilla de chat es una version de la comunidad (Apache-2.0), no la oficial de Qwen; aunque corrige fallos conocidos, conviene validar el comportamiento con los propios prompts antes de usarla.
- El modelo esta pensado para hardware Blackwell con NVFP4; su portabilidad a otras plataformas no esta documentada.
- Solo se declaran japones e ingles como idiomas soportados; el rendimiento en castellano no esta evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mitslabo/Qwen3.8-Flash-Next-FP4-Local-Zh-Banned
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Articulo de CAPHTECH sobre el metodo de bloqueo: https://zenn.dev/caphtech/articles/qwen38-zh-ban
- Repositorio Kestrom (herramienta de bloqueo de filas): https://github.com/CAPHTECH/kestrom
- Plantillas de chat corregidas: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Receta de despliegue en DGX Spark: https://github.com/eugr/spark-vllm-docker
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
