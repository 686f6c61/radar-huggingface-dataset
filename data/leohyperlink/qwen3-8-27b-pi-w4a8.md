# LeoHyperlink/Qwen3.8-27B-Pi-W4A8

## Resumen

Qwen3.8-27B-Pi-W4A8 es una cuantizacion de tipo W4A8 del modelo bytkim/Qwen3.8-27B-pi, publicada por el usuario LeoHyperlink. No se trata de un modelo entrenado desde cero: el autor no realizo entrenamiento alguno, sino que comprimio los pesos del modelo base con Intel auto-round 0.15.1 y los exporto en formato compressed-tensors pack-quantized, con pesos int4 simetricos en grupos de 128 y activaciones int8 dinamicas por token. El objetivo declarado es servir texto con baja latencia en GPUs Intel Arc, y el resultado se valido sobre una unica Intel Arc Pro B70 de 32 GB con un fork vLLM-XPU 0.32.0.

El modelo base pertenece a la familia Qwen3.8 (etiqueta de arquitectura `qwen3_5`) y es un transformer hibrido con capas Mamba y mezcla de expertos (MoE), con torre visual para entrada imagen-texto. Llama la atencion la discrepancia entre el nombre comercial ("27B") y el recuento real de parametros del checkpoint, que asciende a 6.240.231.632 (unos 6,24 mil millones); no se dispone de informacion sobre cuantos de ellos son activos por token.

Su relevancia practica es acotada pero concreta: documenta una receta de cuantizacion reproducible, ofrece mediciones de velocidad reales (no estimadas) y demuestra decodificacion especulativa con un draft de 1,9B sobre el mismo quant. Como contrapartida, no se ha publicado ninguna metrica de calidad, y todo el trabajo de validacion esta atado a un stack XPU especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Mamba y mezcla de expertos (MoE); incluye torre visual (tag `qwen3_5`) |
| Parametros totales | 6.240.231.632 (segun safetensors); el nombre del repo indica "27B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas de servicio usaron `--max-model-len 8192` y `1024` en el caso especulativo) |
| Tipos de cuantizacion | W4A8: pesos int4 simetricos, grupo 128; activaciones int8 dinamicas por token; formato compressed-tensors pack-quantized |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards, ~18,5 GB, con cabezas MTP `mtp.*`) + `model_extra_tensors.safetensors` (849 MB) + `quantization_config.json` |

## Arquitectura y entrenamiento

El autor no llevo a cabo ningun entrenamiento: la ficha es una cuantizacion post-entrenamiento del checkpoint bytkim/Qwen3.8-27B-pi. El pipeline empleado fue Intel auto-round 0.15.1 con el modo `auto_round:llm_compressor` y exportacion CT pack-quantized. Los pesos se cuantizaron a int4 simetrico en grupos de 128 y las activaciones a int8 dinamico (8 bits, por token). La calibracion se hizo con nvidia/OpenCodeInstruct, 128 muestras de 2048 tokens. Se mantuvieron en BF16 el `lm_head` y la torre visual (`model.visual.*` quedo excluida de la cuantizacion). `torch.compile` se desactivo explicitamente por un fallo de Triton inductor en XPU. El proceso completo consumio aproximadamente 6,5 horas en una sola Intel Arc Pro B70.

La arquitectura subyacente es un hibrido Mamba + MoE con capacidad de entrada imagen-texto, segun las etiquetas y la nota del autor sobre la cache Mamba (solo caben 159 bloques de cache Mamba con `gpu-memory-utilization 0.9`, lo que obliga a mantener `max_num_seqs` en 159 o menos; el valor por defecto de 256 hace fallar el arranque del motor). El checkpoint incluye cabezas MTP (multi-token prediction) en el fichero principal, aunque esta cuantizacion no las habilita. La innovacion destacable del repo no es arquitectonica sino de despliegue: la validacion de decodificacion especulativa con un drafter de difusion por bloques (DFlash) servido junto al quant en la misma GPU.

## Capacidades

- Generacion de texto conversacional en modo chat, con plantilla de chat incluida (`chat_template.jinja`) y soporte de `enable_thinking` como kwarg de la plantilla.
- Capacidad declarada de entrada imagen-texto (pipeline `image-text-to-text` en los tags), con torre visual presente en el repo pero no cuantizada y no ejercitada por el autor.
- Razonamiento con modo thinking desactivable mediante `--default-chat-template-kwargs '{"enable_thinking": false}'`.
- Servicio compatible con la API OpenAI (`/v1/chat/completions`) a traves de vLLM, incluido streaming.
- Decodificacion especulativa soportada por la via del draft externo DFlash (`--spec-method dflash`, block 8), con resultados verificados.
- Soporte de cabezas MTP en los pesos, si bien la ruta `--spec-method qwen3_5_mtp` existe en el build de servicio y no fue probada.
- Soporte de tool calling / function calling y de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no documenta idiomas.

## Casos de uso

- Servicio de chat de baja latencia en hardware Intel Arc: el modelo arranca con vLLM-XPU y ofrece 0,08 s de TTFT y 33 t/s de decodificacion en una unica Arc Pro B70, suficiente para asistentes interactivos en entornos con GPUs Intel ya desplegadas.
- Evaluacion de cuantizaciones W4A8 frente a W4A16: el repo incluye una referencia medida con la misma caja y el mismo protocolo (Sage-1.5-W4A16 a 104,3 t/s), lo que permite cuantificar el coste de la cuantizacion dinamica de activaciones (unas 3 veces mas lento) antes de adoptar una u otra ruta.
- Despliegue con decodificacion especulativa en produccion: combinando el draft DFlash de 1,9B se alcanzan unos 55 t/s (1,7x), util para reducir coste por token cuando la latencia de generacion es el cuello de botella. Hay que dimensionar la VRAM para alojar target y draft juntos.
- Prototipado de pipelines multimodales: el checkpoint conserva la torre visual en BF16, de modo que un equipo puede validar entradas de imagen sin volver al modelo original, siempre que su stack soporte la carga de los tensores extra.
- Reproduccion de recetas de cuantizacion: la ficha documenta herramienta, calibracion, tiempos y decisiones de empaquetado, y sirve como plantilla para cuantizar otros checkpoints de la misma familia con auto-round.
- Generacion de codigo asistida: la calibracion se hizo sobre OpenCodeInstruct, lo que orienta el quant hacia cargas de trabajo de codigo; es un uso plausible pero sin medicion de calidad que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor lo indica de forma explicita: todos los numeros son de velocidad.

Mediciones de velocidad publicadas (decodificacion de un solo stream, 128 tokens solicitados, 76 generados con parada natural, temperatura 0, prompt "Explain why the sky is blue in one short paragraph", tokens contados tras el time-to-first-token):

| Checkpoint | Decodificacion | TTFT | Backend |
|---|---:|---:|---|
| Este repo (W4A8 dinamico) | 33,0 t/s (3/3 ejecuciones) | 0,08 s | ruta de cuantizacion dinamica de activaciones |
| Este repo + draft DFlash (block 8) | ~55 t/s (54,6-56,4; 3 ejecuciones) | 0,09 s en caliente (1,33 s en frio) | decodificacion especulativa, aceptacion 2,71/8 |
| LeoHyperlink/Sage-1.5-W4A16 (referencia W4A16, misma maquina) | 104,3 t/s | 0,06 s | `XPUwNa16LinearKernel` (fusionado) |

Datos de aceptacion del draft DFlash: longitud media 2,71 por bloque de 8 tokens, tasa de acierto del 21,4 % (48/224 tokens en 28 pasos). El autor atribuye el valor moderado a que el draft se entreno para el Qwen3.8 base y no para el quant pi.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan ~18,5 GB en disco; target mas draft suman 20,3 GB de pesos y 4,9 GB de grafos, lo que deja practicamente sin margen para cache KV en una tarjeta de 32 GB. Con `--max-model-len 1024` y `--max-num-seqs 16` la necesidad de KV era de 1,68 GB frente a 1,64 GB disponibles (con 64 secuencias), de ahi el recorte. Cualquier cifra de VRAM para contexto largo es una estimacion no publicada.
- GPU recomendadas segun el autor: Intel Arc Pro B70 de 32 GB (Battlemage Xe2). Es el unico hardware probado.
- GPU NVIDIA: no disponible. El autor no valida CUDA; la ruta de activaciones int8 dinamicas esta verificada en vLLM-XPU y su comportamiento en otros backends no se documenta.
- GPU de consumo: el checkpoint completo no cabe en tarjetas de 16 GB. En 24 GB el margen para cache KV seria muy justo y no hay pruebas publicadas; no se puede afirmar soporte.
- Limite operativo: al ser un hibrido Mamba, solo caben 159 bloques de cache Mamba a 0,9 de utilizacion, por lo que `--max-num-seqs` debe quedar en 159 o menos (el valor por defecto de 256 falla al inicializar).
- Despliegue: vLLM-XPU 0.32.0 (fork) con `--trust-remote-code`. Flags del autor: `--max-model-len 8192 --max-num-seqs 128 --gpu-memory-utilization 0.9 --language-model-only --kv-cache-dtype fp8 --enable-prefix-caching`. `ZE_AFFINITY_MASK=0.0` provoca un fallo de inicializacion en este build; la GPU se fija con `ONEAPI_DEVICE_SELECTOR=level_zero:N`.
- Tensor parallel: bloqueado en la maquina del autor por un fallo de inicializacion de IPC en oneCCL (`mem_to_ipc_handle: invalid_fd`); todas las pruebas son a una sola GPU.
- Latencia y throughput: 33 t/s en decodificacion plana y ~55 t/s con especulacion; TTFT de 0,08-0,09 s en caliente. No hay datos de throughput agregado con lotes grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento medido | Licencia |
|---|---|---|---|---|---|
| LeoHyperlink/Qwen3.8-27B-Pi-W4A8 | 6,24B (recuento real) | no disponible | W4A8 int4/int8 dinamico | 33,0 t/s; ~55 t/s con DFlash | Apache-2.0 |
| bytkim/Qwen3.8-27B-pi (modelo base) | no disponible | no disponible | BF16 original | no disponible | Apache-2.0 |
| LeoHyperlink/Sage-1.5-W4A16 | no disponible | no disponible | W4A16 | 104,3 t/s en la misma maquina | no disponible |
| incoai/Qwen3.8-27B-DFlash2 (draft) | 1,9B | no disponible | BF16 | no aplica (es drafter) | no disponible |

## Limitaciones y advertencias

- No existe ninguna evaluacion de calidad sobre este quant: no hay MMLU, HumanEval ni pruebas de regresion que confirmen que la cuantizacion W4A8 preserve la precision del modelo base. El autor lo declara explicitamente.
- La cuantizacion dinamica de activaciones resulta unas tres veces mas lenta que la ruta W4A16 fusionada en el mismo hardware (33,0 frente a 104,3 t/s), un coste que hay que justificar antes de desplegar.
- Las cabezas MTP viajan en el checkpoint pero no estan habilitadas; la ruta `qwen3_5_mtp` no se ha probado. La especulacion validada depende de un draft externo entrenado para el modelo base, con una tasa de aceptacion baja (21,4 %).
- El fichero `model_extra_tensors.safetensors` (849 MB) no se puede cargar junto al checkpoint principal en vLLM 0.32.0; el servicio solo de texto no lo necesita, pero cualquier uso multimodal queda sin validar.
- La torre visual se distribuye sin cuantizar y no se ejercio: las capacidades de imagen son teoricas en este repo.
- Todo el soporte esta atado a un fork XPU concreto (vLLM-XPU 0.32.0, torch +XPU, oneCCL). Tensor parallel no funciona en la configuracion del autor, lo que limita el escalado a una sola GPU en ese entorno.
- La discrepancia entre el nombre ("27B") y el recuento real de parametros (6,24B) puede inducir a error al planificar recursos; conviene verificar el `config.json` del modelo base antes de asumir un tamano.
- Licencia Apache-2.0, permisiva para uso comercial, heredada del modelo base. No se documentan sesgos, riesgos de alucinacion ni cobertura idiomatica, por lo que no hay garantias declaradas en esos ambitos.
- El repo tiene cero descargas y cero likes en el momento de la consulta y no ha pasado revision independiente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LeoHyperlink/Qwen3.8-27B-Pi-W4A8
- Modelo base: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Draft para decodificacion especulativa: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Referencia W4A16 del mismo autor: https://huggingface.co/LeoHyperlink/Sage-1.5-W4A16
- Dataset de calibracion: nvidia/OpenCodeInstruct (referenciado en la model card, sin URL proporcionada)
- Herramienta de cuantizacion: Intel auto-round 0.15.1 (referenciada en la model card, sin URL proporcionada)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
