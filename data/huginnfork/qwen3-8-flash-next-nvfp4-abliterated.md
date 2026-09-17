# huginnfork/Qwen3.8-Flash-Next-NVFP4-Abliterated

## Resumen

`huginnfork/Qwen3.8-Flash-Next-NVFP4-Abliterated` es una edicion de direccion de rechazo (abliteration) aplicada directamente sobre un checkpoint ya cuantizado, no sobre su version BF16. El punto de partida es `local-inference-lab/Qwen3.8-Flash-Next-NVFP4`, un artefacto derivado de `Qwen/Qwen3.8-Flash-Next` que no es una cuantizacion posterior al entrenamiento, sino una destilacion consciente de la cuantizacion (quantization-aware distillation): 2.500 actualizaciones del tronco mas 1.500 actualizaciones de refinamiento conjunto contra el profesor BF16 a lo largo de 200 millones de tokens. El autor argumenta que abliterar el modelo BF16 y recuantizar habria descartado esa destilacion y producido un artefacto distinto y mas debil; editar los pesos cuantizados in situ es, segun la model card, la unica via para obtener una version abliterada de ese checkpoint concreto.

El modelo tiene 92.676.653.971 parametros (unos 92,7 mil millones) en un repositorio de 105,9 GB, con 48 capas de decodificador y una ventana de contexto declarada en la receta de servicio de 262.144 tokens. La edicion afecto a 25.188 tensores que escriben en el flujo residual, conservando cada tensor su dtype, sus tensores de escala por bloques y su tamano en bytes originales; los shards no editados estan hardlinked desde el modelo padre y son identicos byte a byte.

Es relevante ahora porque documenta un procedimiento poco habitual (proyeccion de rango 1 restringida a la rejilla de cuantizacion, con resolucion de la restriccion `v · W = 0` columna a columna) y porque cuantifica el coste real de la edicion: el redondeo al vecino mas proximo solo retendria el 74 % de la edicion en MXFP8 y el 14 % en NVFP4. El resultado es un modelo de rechazo reducido, con una tasa de cumplimiento del 94,50 % en peticiones daninas frente al 10,50 % del padre, sin ninguna mitigacion de seguridad adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): expertos enrutados, expertos compartidos y atencion hibrida (`linear_attn` y `self_attn`); 48 capas de decodificador; prediccion multitoken (MTP3) |
| Parametros totales | 92.676.653.971 (92,7 B) |
| Parametros activos | no disponible (el modelo es MoE, pero la model card no publica el numero de parametros activos) |
| Longitud de contexto | 262.144 tokens (`--max-model-len 262144` en la receta de vLLM) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, `down_proj`), MXFP8 (proyecciones de salida de atencion y `down_proj` de expertos compartidos), BF16 (`embed_tokens`, `ple.value_proj`, proyecciones de escritura MTP), cache KV en FP8; layout mixto ModelOpt |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (campo `license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors (transformers); 8-bit en los metadatos del repositorio |
| Tamano del repositorio | 105,9 GB |
| Modelo base | `local-inference-lab/Qwen3.8-Flash-Next-NVFP4` (relacion: finetune) |
| Modelo BF16 de referencia | `Qwen/Qwen3.8-Flash-Next` (profesor de la destilacion, segun la model card) |
| Modalidad | image-text-to-text (torre de vision presente, no editada) |
| Fecha de publicacion | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 48 capas con mezcla de expertos: conviven expertos enrutados (25.088 tensores `down_proj` editados) y expertos compartidos (48 tensores `down_proj`), ademas de dos tipos de proyeccion de atencion (`linear_attn.out_proj` y `self_attn.o_proj`), lo que apunta a un esquema de atencion hibrida entre atencion lineal y atencion completa. Incluye prediccion multitoken (MTP) con tres tokens especulativos y una tabla de n-gramas PLE con proyeccion de valor propia, que en la receta de servicio se descarga a la RAM del host. El checkpoint tambien incorpora una torre de vision, que no fue editada.

El entrenamiento del padre no es una cuantizacion post-entrenamiento: es una destilacion consciente de la cuantizacion con 2.500 actualizaciones del tronco y 1.500 actualizaciones de refinamiento conjunto contra el profesor BF16 durante 200 millones de tokens. Sobre ese artefacto, este build aplica una unica proyeccion de direccion de rechazo, medida en la capa 37 de 48 (d de Cohen = 8,57) a partir de 128 indicaciones daninas (`mlabonne/harmful_behaviors`) y 128 inofensivas (`mlabonne/harmless_alpaca`), semilla 42, como diferencia normalizada de medias del flujo residual que entra en esa capa, con fuerza de proyeccion alpha = 1,0. La innovacion tecnica es el metodo de requantizacion restringida: como los pesos almacenados ya estan exactamente sobre la rejilla de cuantizacion, el redondeo simple destruye la mayor parte de la edicion (retencion del 74 % en MXFP8 y del 14 % en NVFP4). En su lugar, se elige por elemento el codigo que aproxima el peso editado y mantiene la restriccion `v · W = 0` en cada columna, recorriendo las filas en orden descendente de `|v_i|` para que cada una absorba el error de restriccion acumulado dentro de lo que permite un movimiento de una ULP. La fuga residual resultante es de 8,88e-07 como maximo en los 25.184 tensores cuantizados y de 6,87e-03 en los 4 tensores BF16; el error de peso anadido medio es del 3,966 % de la norma de cada tensor. No se documento ningun tensor cambiado de formato.

## Capacidades

- Generacion de texto conversacional en modo chat (etiqueta `conversational`, pipeline `text-generation`).
- Entrada multimodal imagen-texto: el repositorio declara `image-text-to-text` y mantiene la torre de vision, aunque esta no fue editada por la abliteracion.
- Recuperacion en contexto largo: el perfil de evaluacion `estonia` (recuperacion de contexto largo, n=30) obtiene 30/30 tanto en este build como en el padre, con ventana declarada de 262.144 tokens.
- Consistencia de libro mayor o ledger (perfil `lavd`): 58/60 = 96,7 %, con una ejecucion de cada 30 alcanzando el limite de generacion de 40.000 tokens.
- Decodificacion especulativa con MTP de 3 tokens (`--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`).
- Cumplimiento elevado de peticiones clasificadas como daninas por los evaluadores (94,50 % en el split harmful de `treadon/abliteration-eval`), por diseno.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: la model card reporta un 94,00 % de cumplimiento en el split multilingual de `treadon/abliteration-eval`, pero no se declara la lista de idiomas soportados.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion de seguridad y red-teaming: el modelo sirve como sujeto de prueba para medir direcciones de rechazo y su recuperabilidad, ya que la edicion se aplico en formato y el informe por tensor esta disponible en `abliteration_report.json` dentro del repositorio.
- Comparacion controlada de artefactos cuantizados: al conservar dtype, escalas por bloque y tamano en bytes, permite aislar el efecto de la edicion de rechazo del efecto de la cuantizacion al comparar contra `local-inference-lab/Qwen3.8-Flash-Next-NVFP4` en la misma configuracion de servicio.
- Recuperacion sobre corpus extensos: con 262.144 tokens de contexto y un resultado de 30/30 en el perfil de recuperacion de contexto largo, es apto para consulta sobre documentacion tecnica, expedientes o bases de conocimiento que no caben en ventanas de 32K o 128K.
- Analisis de documentos con imagen y texto: la modalidad image-text-to-text permite procesar capturas, diagramas o paginas escaneadas junto al texto asociado, siempre que el caso no dependa del comportamiento de rechazo, ya que la torre de vision no fue editada.
- Servicio conversacional de alta concurrencia sobre acelerador unico: la receta oficial usa `--max-num-seqs 16`, `--enable-prefix-caching` y `--enable-chunked-prefill`, lo que encaja en despliegues de chat con prompts repetidos o con prefijos compartidos.
- Auditoria de mecanismos de filtrado: sirve para comprobar si un filtro de salida o una politica de moderacion externa aguanta un modelo con cumplimiento del 94,50 % en el split danino, antes de decidir si ese filtro se despliega en produccion.
- Generacion de datos sinteticos etiquetados: util para construir conjuntos de evaluacion de cumplimiento y sobre-rechazo, dado el par de mediciones documentadas (10,50 % -> 94,50 % en harmful y 93,98 % -> 91,57 % en over_refusal).

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones internas del autor, ejecutadas en la misma sesion y con la misma configuracion de servicio que el modelo padre. No son comparables con resultados obtenidos en otras configuraciones, y no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Paridad de capacidades frente al modelo padre:

| Perfil | Padre | Este build |
|---|---|---|
| lavd (consistencia de libro mayor), n=10 | 10/10 | 9/10 |
| lavd (consistencia de libro mayor), n=30 | 29/30 (96,7 %) | 28/30 y 30/30 (58/60 = 96,7 %) |
| estonia (recuperacion de contexto largo), n=30 | 30/30 | 30/30 |

Comportamiento de rechazo en `treadon/abliteration-eval` (333 indicaciones):

| Split | Padre | Este build |
|---|---|---|
| harmful - cumplimiento (mas alto = mas abliterado) | 10,50 % | 94,50 % |
| over_refusal - cumplimiento (mas alto es mejor) | 93,98 % | 91,57 % |
| multilingual - cumplimiento | 90,00 % | 94,00 % |

Metricas del propio proceso de edicion:

| Metrica | Valor |
|---|---|
| Tensores que escriben en el flujo residual editados | 25.188 |
| Tensores cuantizados con fuga residual <= 8,88e-07 | 25.184 |
| Fuga residual en tensores BF16 (maximo) | 6,87e-03 |
| Error de peso anadido medio | 3,966 % de la norma del tensor |
| Retencion de la edicion con redondeo al vecino mas proximo (MXFP8) | 74 % |
| Retencion de la edicion con redondeo al vecino mas proximo (NVFP4) | 14 % |
| Capa de medicion de la direccion | 37 de 48 |
| d de Cohen de la direccion | 8,57 |

La model card indica que el detalle por ejecucion (per-run) queda truncado en el texto disponible, por lo que el desglose completo no puede reproducirse aqui.

## Requisitos de hardware

- Almacenamiento: 105,9 GB de repositorio; hay que anadir espacio para cache KV (FP8) y para la tabla PLE si se descarga a disco en lugar de a RAM.
- El autor indica que `VLLM_PLE_CPU_OFFLOAD=1` es obligatorio para que el modelo quepa en una unica tarjeta de 96 GB, ya que la tabla de n-gramas PLE se descarga a la RAM del host.
- GPU de 96 GB o superior: H100 96 GB, H200 (141 GB), RTX Pro 6000 (96 GB), B200. No hay datos publicados sobre VRAM necesaria en otras configuraciones.
- No cabe en GPU de consumo de 24 GB (RTX 4090, 5090) ni en tarjetas de 48 GB, segun la restriccion de 96 GB indicada por el autor.
- Despliegue documentado: vLLM con `--quantization modelopt_mixed --kv-cache-dtype fp8 --dtype bfloat16`, `--enable-prefix-caching`, `--enable-chunked-prefill`, `--language-model-only` y decodificacion especulativa MTP de 3 tokens.
- No se documenta soporte para llama.cpp, Ollama, TGI u otros motores en la informacion disponible; el layout mixto NVFP4/MXFP8 de ModelOpt limita las opciones de servidor.
- Latencia y throughput: no disponibles. La unica cifra de configuracion publicada es `--max-num-seqs 16` y `--max-num-batched-tokens 6019`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Edicion de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `huginnfork/Qwen3.8-Flash-Next-NVFP4-Abliterated` | 92,7 B | 262.144 tokens | safetensors NVFP4/MXFP8/BF16 mixto | Si, direccion unica en la capa 37; cumplimiento harmful 94,50 % | qwen-community-1.0 | Publicado; 0 descargas y 0 likes en el momento de redactar esta ficha |
| `local-inference-lab/Qwen3.8-Flash-Next-NVFP4` (padre) | 92,7 B | 262.144 tokens | safetensors NVFP4/MXFP8/BF16 mixto | No; cumplimiento harmful 10,50 % | no disponible en la informacion proporcionada | Publicado |
| `Qwen/Qwen3.8-Flash-Next` (profesor BF16) | no disponible | no disponible | BF16 | No | qwen-community-1.0 | Publicado |

No se dispone de datos de benchmarks estandar para ninguno de los tres artefactos en la informacion proporcionada, por lo que la comparacion se limita a formato, contexto declarado, licencia y comportamiento de rechazo medido por el autor.

## Limitaciones y advertencias

- Rechazo reducido de forma deliberada: el modelo cumple el 94,50 % de las peticiones del split harmful frente al 10,50 % del padre, y no incorpora mitigaciones de seguridad adicionales. Debe desplegarse detras de politicas de uso, filtrado, control de acceso y revision legal.
- Las tasas de rechazo publicadas son mediciones de comportamiento, no una validacion de seguridad.
- Degradacion minima pero observable en el perfil lavd: 28/30 en una ejecucion frente a 29/30 del padre (el agregado de 58/60 iguala el 96,7 % del padre, y el autor atribuye la diferencia a ruido binomial en n=10).
- Una de cada 30 ejecuciones alcanza el limite de generacion de 40.000 tokens tanto en el padre como en este build: la fuga ocasional es una propiedad de la tarea, no de la edicion.
- Error de peso introducido: 3,966 % de la norma del tensor de media. La fuga residual es mayor en los tensores BF16 (6,87e-03) que en los cuantizados (8,88e-07) por heredar la ULP relativa del bfloat16 (0,39 %).
- La torre de vision no fue editada y `lm_head` no se toco (lee del flujo residual en lugar de escribir en el): el comportamiento de rechazo editado solo esta garantizado en la ruta de texto, lo que abre la posibilidad de respuestas inconsistentes en entradas multimodales.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas soportados: no declarados, aunque existe una medicion de cumplimiento multilingue del 94,00 % sin desglose por idioma.
- Licencia `qwen-community-1.0`: es una licencia de tipo comunitario con condiciones especificas de uso; hay que revisar el texto enlazado antes de cualquier uso comercial. No se ofrece una declaracion explicita de permisos comerciales en la ficha.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion independiente del artefacto.
- El detalle por ejecucion de la evaluacion aparece truncado en la model card disponible, lo que impide auditar la totalidad de los resultados.
- Despliegue restringido: requiere vLLM con `modelopt_mixed` y al menos 96 GB de VRAM, lo que excluye hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huginnfork/Qwen3.8-Flash-Next-NVFP4-Abliterated
- Modelo padre: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4
- Licencia Qwen community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Informe de abliteracion por tensor: `abliteration_report.json` en el repositorio del modelo
- Dataset de indicaciones daninas: `mlabonne/harmful_behaviors`
- Dataset de indicaciones inofensivas: `mlabonne/harmless_alpaca`
- Suite de evaluacion de abliteracion: `treadon/abliteration-eval`
- Busqueda web: los resultados devueltos no guardan relacion con este modelo (corresponden a perfiles academicos de agronomia y a un directorio universitario), por lo que no se incluye ningun enlace adicional. No se han encontrado papers, blogs, repositorios ni demos asociados al modelo en la busqueda disponible.
