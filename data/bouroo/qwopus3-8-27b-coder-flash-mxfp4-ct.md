# bouroo/Qwopus3.8-27B-Coder-Flash-MXFP4-CT

## Resumen

Qwopus3.8-27B-Coder-Flash-MXFP4-CT es una cuantizacion de 4 bits del checkpoint Jackrong/Qwopus3.8-27B-Coder-Flash, un modelo multimodal de tipo image-text-to-text orientado a generacion de codigo, razonamiento y uso de herramientas. Lo publica el usuario bouroo en HuggingFace y no introduce cambios arquitectonicos: replica el modelo base (27.781 millones de parametros, BF16, aproximadamente 56 GB) en formato MXFP4 con compresion de tensores, reduciendo el peso en disco a 19,6 GB (repositorio de 19,8 GB).

La relevancia de esta ficha es practica: se trata de un checkpoint cuantizado listo para servirse con vLLM sobre ROCm en GPUs gfx1201, con soporte declarado para contexto de hasta 262.144 tokens, decodificacion especulativa mediante MTP y parsers de tool calling y razonamiento de la familia Qwen3. La cuantizacion es RTN (round-to-nearest, sin calibracion), lo que la hace reproducible en minutos y sin dataset de calibracion, a costa de una precision algo inferior a la de esquemas GPTQ.

El modelo base pertenece a la estirpe Qwen3.8 / Qwen3.5 segun los tags del autor, e incorpora una torre de vision, embeddings y tensores de una capa GDN (probablemente atencion lineal del tipo Gated DeltaNet) que se mantienen en BF16 para preservar su comportamiento numerico. La licencia es Apache-2.0, heredada del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de vision, capa GDN y cabeza MTP; familia Qwen3.8/Qwen3.5 segun tags del autor |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 262.144 tokens (segun el comando de servicio del autor; no confirmado en la model card del modelo base) |
| Tipos de cuantizacion | MXFP4 (OCP, grupo de 32, simetrica, E2M1 con escalas E8M0); pesos en 4 bits, activaciones en 16 bits (W4A16). Tensores excluidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (`mxfp4-pack-quantized`), 18 shards; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo base, no un entrenamiento nuevo. La arquitectura subyacente es un transformer multimodal con torre de vision, tabla de embeddings, una cabeza MTP (multi-token prediction) usada para decodificacion especulativa y tensores propios de una capa GDN (`A_log`, `dt_bias`, convolucion `conv1d`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base Jackrong/Qwopus3.8-27B-Coder-Flash y no se detallan en la informacion proporcionada.

La innovacion tecnica de este repositorio es el procedimiento de cuantizacion: se uso `model_free_ptq` de llmcompressor con el esquema `MXFP4A16`, recorriendo los shards safetensors uno a uno en CPU, de modo que el checkpoint BF16 de 56 GB nunca se materializa en memoria. La ejecucion completo en 2 minutos y 50 segundos sobre un Apple M4 Pro. Cada capa Linear cuantizada se almacena como `weight_packed` (uint8, dos codigos E2M1 por byte, nibble bajo primero) y `weight_scale` (uint8, exponentes E8M0, uno por grupo de 32 pesos). Se mantienen en BF16 `lm_head`, toda la torre de vision, la cabeza MTP, la tabla de embeddings, los vectores `A_log`/`dt_bias` y la convolucion GDN. La verificacion del autor, descomprimiendo 12 tensores y comparando con el BF16 original, arroja un error absoluto medio relativo de 0,109 a 0,126, coherente con la resolucion del codigo E2M1 a grupo 32; los tensores no cuantizados son identicos byte a byte al origen.

## Capacidades

- Generacion de texto y codigo: el modelo base esta etiquetado como coder y el checkpoint conserva esa orientacion.
- Razonamiento: incluye parser de razonamiento `qwen3` en la configuracion de servicio, lo que implica modo de pensamiento estructurado.
- Vision: pipeline `image-text-to-text` y torre visual mantenida en BF16, por lo que acepta imagenes junto a texto.
- Tool calling / function calling: soporte nativo mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Uso como agente: tags `agent` y `tool-use`; la cabeza MTP permite decodificacion especulativa para acelerar generacion multi-paso.
- Contexto largo: configurado hasta 262.144 tokens con KV cache en FP8.
- Multilingue: no hay lista de idiomas declarada; no disponible.

## Casos de uso

- Generacion de codigo en produccion: servir el checkpoint con vLLM y el parser `qwen3_coder` permite integrarlo en pipelines de CI/CD para autocompletar, revisar parches o generar tests, con tool calling para consultar repositorios o ejecutar linters.
- Agente de refactorizacion sobre repositorios grandes: la ventana de 262.144 tokens admite cargar varios ficheros y el historial de cambios en una sola conversacion, y la decodificacion especulativa MTP reduce la latencia en cadenas largas de pasos.
- Asistente de analisis de capturas y diagramas: al ser image-text-to-text, puede recibir capturas de pantalla de errores, diagramas de arquitectura o mockups y devolver codigo o diagnosticos junto al texto.
- Automatizacion de soporte tecnico para desarrolladores: conversaciones multi-turno con contexto largo y tool calling para consultar documentacion o tickets internos.
- Generacion de documentacion tecnica a partir de codigo: el modelo puede resumir modulos y producir docstrings o guias, aprovechando el contexto extendido.
- Evaluacion local en hardware AMD: al estar pensado para ROCm y gfx1201, sirve para prototipar agentes de codigo en estaciones con GPU AMD sin depender de CUDA.
- Extraccion estructurada de datos desde imagenes y texto combinados: por ejemplo, convertir tablas escaneadas o diagramas en JSON mediante function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la verificacion de cuantizacion (error absoluto medio relativo de 0,109 a 0,126 frente al BF16 en una muestra de 12 tensores) y el tiempo de cuantizacion (2 minutos 50 segundos en M4 Pro). No hay datos de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 19,6 GB en disco; con KV cache en FP8 y contexto largo, el consumo crece de forma proporcional a la longitud de contexto y al numero de secuencias simultaneas. Para contexto moderado se puede estimar un rango de 24 a 32 GB, aunque el autor no publica cifras exactas.
- GPU recomendadas: el autor apunta a ROCm sobre gfx1201 (familia RDNA 4 de AMD). No se documentan requisitos para NVIDIA.
- GPU de consumo: 19,6 GB de pesos no caben en GPUs de 16 GB; encajan en tarjetas de 24 GB o mas, siempre que el backend soporte el formato MXFP4.
- Opciones de despliegue: vLLM mediante la imagen `ghcr.io/slybase/vllm-sly-radiance:1.8.1-rocm10.1`, con variables `RADIANCE_MXFP4=1`, `RADIANCE_MXFP4_W4A8=1`, `RADIANCE_MXFP4_W4A8_MIN_M=0` y `VLLM_ROCM_USE_AITER=1`. El autor no menciona llama.cpp, Ollama ni TGI para este formato.
- Parametros de servicio sugeridos por el autor: `--kv-cache-dtype fp8`, `--gpu-memory-utilization 0.93`, `--max-model-len 262144`, `--max-num-seqs 8`, `--max-num-batched-tokens 4096`, `--attention-backend R4D`, decodificacion especulativa MTP con 4 tokens, `temperature 0.7`, `top_p 0.95`, `top_k 20`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| bouroo/Qwopus3.8-27B-Coder-Flash-MXFP4-CT | 27,78 B | 262.144 (configurado) | MXFP4 W4A16, RTN | Apache-2.0 | Vision, MTP y GDN en BF16; orientado a ROCm |
| Jackrong/Qwopus3.8-27B-Coder-Flash | 27,78 B | no disponible | BF16 | Apache-2.0 | Modelo base sin cuantizar, 56 GB |
| slybase/Swift-1.5-Qwen3.8-27B-heretic-MXFP4-GPTQ | no disponible | no disponible | MXFP4 GPTQ | no disponible | Mismo layout y campos de config; calibrado y con vision/embedding/GDN cuantizados |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion es RTN sin calibracion, por lo que la perdida de precision puede ser mayor que en esquemas GPTQ calibrados, especialmente en tareas sensibles a pesos de atencion.
- El error de cuantizacion medido (0,109 a 0,126 de error absoluto medio relativo) es el esperado para E2M1 a grupo 32, pero puede acumularse en cadenas largas de razonamiento o generacion de codigo.
- El autor advierte, citando al modelo base, que las evaluaciones reportadas son ejecuciones locales pequenas y que el codigo y las acciones de herramientas generadas pueden ser incorrectos.
- Riesgo de alucinacion en APIs, librerias y comandos de shell; conviene validar la salida antes de ejecutarla en produccion.
- No hay lista de idiomas declarada; el comportamiento multilingue no esta verificado.
- El contexto de 262.144 tokens es una configuracion de servicio, no una especificacion confirmada del modelo base; a contextos muy largos la calidad puede degradarse.
- El despliegue documentado esta atado a ROCm, gfx1201 y una imagen concreta de vLLM; no hay soporte documentado para CUDA, llama.cpp u Ollama.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar su model card para condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente del checkpoint.

## Enlaces

- HuggingFace del checkpoint: https://huggingface.co/bouroo/Qwopus3.8-27B-Coder-Flash-MXFP4-CT
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Imagen de servicio vLLM: https://github.com/SlyBase/vllm-sly-radiance
- Checkpoint de referencia con el mismo layout: https://huggingface.co/slybase/Swift-1.5-Qwen3.8-27B-heretic-MXFP4-GPTQ
- Drafter especulativo para el launcher MXFP4: https://huggingface.co/tcclaviger/Qwen3.8-27B-DFlash2-FP8
- Drafter especulativo general: https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
