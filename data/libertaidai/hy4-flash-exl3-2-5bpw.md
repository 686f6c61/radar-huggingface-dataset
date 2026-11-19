# LibertAIDAI/Hy4-flash-EXL3-2.5bpw

## Resumen

Hy4-flash EXL3 2.5 bpw es una cuantizacion de tipo EXL3 (formato de exllamav3) del modelo base `tencent/Hy4-flash`, publicada por el usuario LibertAIDAI. Se trata de la variante mas agresiva de una familia de cuatro builds (4, 3.5, 3.0 y 2.5 bits por peso) que rebajan el peso de los expertos enrutados de un modelo MoE de 220.000 millones de parametros totales y 12.000 millones activos, manteniendo el resto de tensores (atencion, indexer comprimido, experto compartido, proyecciones LatentMoE, router, capa densa 0, iHC y tablas Engram) en BF16 byte a byte identico al checkpoint original.

El objetivo de esta publicacion es hacer que un modelo de ese tamano quepa en una unica GPU de 96 GB o en una configuracion de 1x128 GB, reduciendo el "trunk" (lo que debe residir en VRAM) a 58,92 GiB y los expertos a 43,6 GiB, para un total de 177,12 GiB en 22 shards safetensors. Las tablas Engram (118 GiB en BF16) no necesitan estar residentes: el runtime de exllamav3 las lee por filas desde disco.

La relevancia actual es doble: por un lado, demuestra que la cuantizacion EXL3 a 2,5 bpw es viable sobre arquitecturas MoE hibridas con atencion MLA y modulos personalizados; por otro, es una de las pocas vias practicas de ejecutar un modelo de esta escala en hardware de una sola tarjeta de gama alta para workstation, a costa de renunciar a la torre de vision (el build es solo texto) y de asumir que no se han publicado benchmarks de calidad ni de throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion MLA dispersa/deslizante, LatentMoE, iHC y modulo Engram (`hy_v4_flash`) |
| Parametros totales | 95.081.174.950 (safetensors del repo); el modelo base declara 220 B totales y 12 B activos |
| Parametros activos | 12 B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 2,5 bpw (`mul1`) solo en expertos enrutados; resto en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License, Version 1.0 (derivada de Apache-2.0, con terminos MaaS en la seccion 10) |
| Formato de pesos | safetensors (22 shards), libreria exllamav3 |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy4-flash` es un MoE con 220.000 millones de parametros totales y 12.000 millones activos, 42 capas, atencion MLA hibrida (combinacion de atencion dispersa y deslizante) con un indexer comprimido, proyecciones LatentMoE, un mecanismo denominado iHC y un modulo Engram con 63.500 millones de parametros distribuidos en cuatro tablas de embedding de 164-165 millones de filas por 96 dimensiones. Esta publicacion no entrena ni ajusta nada: es una conversion de pesos.

La innovacion tecnica de este artefacto es el esquema de cuantizacion. Solo los 62.976 modulos de expertos enrutados (41 expertos x 512 x gate/up/down) se cuantizan a 2,5 bpw con codebook `mul1`, almacenados como trellis I16 mas factores `suh`/`svh` en F16; cada modulo conserva su marcador `mul1` y no quedan tensores `.weight` residuales de experto. Todo lo demas (atencion, indexer, experto compartido, proyecciones LatentMoE, router, capa densa 0, iHC, proyecciones Engram, normas por cabeza, tabla de lookup, embedding de tokens y lm_head) permanece en BF16. El autor verifica que esos tensores no experto y las filas de las tablas Engram son byte a byte identicos al checkpoint base, y que un slice de 3 capas (0-2, incluida la tabla Engram de 31,7 GB de la capa 1) carga y produce logits finitos con correlacion 0,999844 y 100 % de coincidencia de argmax frente al slice BF16. No se aportan datos sobre el dataset de entrenamiento original ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en ingles y chino; el build es explicitamente solo texto.
- Modo de razonamiento con dos niveles: `reasoning_effort="no_think"` para respuestas directas y un modo por defecto de "high-effort thinking".
- Plantilla de chat Jinja incluida (`chat_template.jinja`) con tokens especiales `hy_start`, `hy_middle` y `hy_end`.
- Soporte de cache paginada (paged cache) para prefill y decodificacion, segun el script de humo incluido.
- Capacidad de ejecucion multi-GPU mediante layer split (`-gs`) de exllamav3; no soporta tensor parallelism por el diseno de los modulos personalizados de atencion y Engram.
- Vision: la torre de vision y los tensores DFly2 se incluyen en el repositorio pero no estan conectados por el runtime actual.
- Tool calling, function calling, uso como agente y capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE de gran escala en una sola GPU de 96 GB: el trunk de 58,92 GiB mas los expertos de 43,6 GiB caben en una tarjeta unica, lo que permite servir el modelo sin infraestructura multi-nodo.
- Estaciones de trabajo con 1x128 GB (por ejemplo GB10): el autor indica que esta configuracion es "comoda" para el build de 2,5 bpw, adecuada para prototipado e investigacion local con modelos de 220 B totales.
- Evaluacion comparativa de cuantizaciones: al existir cuatro builds (4, 3,5, 3 y 2,5 bpw) con los mismos tensores no experto en BF16, sirve para medir el impacto aislado de la cuantizacion de expertos sobre la calidad.
- Procesamiento de texto en ingles y chino con contexto gestionado por cache paginada: util para pipelines de traduccion, resumen o analisis documental bilinguee en entornos con VRAM limitada.
- Experimentacion con modos de razonamiento: el doble modo (`no_think` frente a thinking de alto esfuerzo) permite comparar coste y calidad en tareas de razonamiento sin cambiar de checkpoint.
- Investigacion sobre arquitecturas MoE hibridas: el repositorio expone la implementacion de atencion MLA, LatentMoE, iHC y Engram en el fork de exllamav3 (commit `1af65c4`), util para estudiar estos mecanismos en inferencia real.
- Escenarios con almacenamiento NVMe rapido: las tablas Engram de 118 GiB se leen por filas desde SSD, lo que habilita despliegues donde la memoria de GPU es el cuello de botella y el almacenamiento es abundante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no reclama ningun benchmark de throughput ni de calidad para este artefacto. La unica verificacion publicada es de correccion numerica: correlacion 0,999844 y 100 % de acuerdo de argmax en un slice de 3 capas frente al equivalente BF16.

## Requisitos de hardware

- VRAM estimada: el trunk (lo que debe residir en GPU) es de 58,92 GiB y los expertos de 43,6 GiB, para 177,12 GiB totales en disco; las tablas Engram (118 GiB) se transmiten por filas y no necesitan estar en VRAM.
- GPU recomendadas: una unica tarjeta de 96 GB es suficiente para este build; una GB10 de 128 GB resulta comoda; en dos GPU se usa layer split (`-gs`), no tensor parallelism.
- Cabe en consumer GPU: no; el modelo completo requiere 96-128 GB de VRAM o un layer split en varias tarjetas.
- Opciones de despliegue: exclusivamente exllamav3 (fork con la arquitectura `hy_v4_flash`, commit `1af65c4`); se incluye el script `run_smoke.py` y un parche `hy4-exllamav3.patch` para instalaciones existentes. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: se recomienda mantener las tablas Engram en SSD por el streaming de filas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Hardware minimo |
|---|---|---|---|---|---|
| Hy4-flash EXL3 2.5 bpw (este) | 220 B / 12 B (95,08 B en safetensors) | no disponible | EXL3 2,5 bpw en expertos, BF16 en el resto | Tencent Hy 1.0 | 1x96 GB |
| Hy4-flash EXL3 3.0 bpw | 220 B / 12 B | no disponible | EXL3 3,0 bpw en expertos | Tencent Hy 1.0 | 1x96 GB |
| Hy4-flash EXL3 3.5 bpw | 220 B / 12 B | no disponible | EXL3 3,5 bpw en expertos | Tencent Hy 1.0 | 1x96 GB con KV ajustada |
| Hy4-flash EXL3 4.0 bpw | 220 B / 12 B | no disponible | EXL3 4,0 bpw en expertos | Tencent Hy 1.0 | 1x128 GB o 2x96 GB |

Las cuatro variantes comparten el mismo modelo base, la misma licencia y el mismo runtime; solo cambia el peso de los expertos y, en consecuencia, el presupuesto de VRAM disponible para la cache KV. No se dispone de datos de benchmarks para comparar la calidad entre builds ni frente a modelos de otras familias.

## Limitaciones y advertencias

- El autor recomienda preferir los builds de 3,0 o 3,5 bpw cuando el presupuesto de KV lo permita; 2,5 bpw es el de menor trunk y presumiblemente el de mayor perdida de calidad, aunque no se cuantifica.
- Build solo texto: la torre de vision y los tensores DFly2 se incluyen pero no estan conectados por el runtime; no se puede usar para tareas multimodales.
- Idiomas limitados a ingles y chino; no hay evidencia de calidad en castellano.
- Sin benchmarks publicados de calidad ni de throughput: no se puede estimar la degradacion frente al modelo BF16 ni planificar capacidad en produccion con datos del autor.
- Dependencia estricta de un fork de exllamav3 (commit `1af65c4`); no hay soporte para otros motores de inferencia, lo que limita portabilidad y opciones de escalado.
- El layer split es la unica via multi-GPU; los modulos personalizados de atencion y Engram no se pueden shardear con tensor parallelism.
- El campo `quantization_config.bits` del `config.json` es un entero por compatibilidad con transformers; los bits reales por modulo (incluidos medios pasos) estan en `quantization_config.json` bajo `tensor_storage.*.bits_per_weight`.
- Licencia Tencent Hy 1.0: derivada de Apache-2.0 pero con terminos adicionales para MaaS en la seccion 10; conviene revisar las condiciones antes de ofrecer el modelo como servicio.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; se trata de una publicacion reciente y sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-2.5bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Coleccion de la familia EXL3: https://huggingface.co/collections/LibertAIDAI/hy4-flash-exl3-6afe62b412b76248d8d29b0b
- Variante 4,0 bpw: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-4bpw
- Variante 3,5 bpw: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-3.5bpw
- Variante 3,0 bpw: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-3bpw
- Runtime exllamav3 (fork con soporte `hy_v4_flash`): https://github.com/moshemalawach/exllamav3
