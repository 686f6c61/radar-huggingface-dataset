# bradharrison/Qwen3.8-Flash-Next-W4A8-INT4-PLE

## Resumen

Qwen3.8-Flash-Next W4A8-INT4-PLE es una cuantizacion GPTQ de 4 bits (W4A8: pesos de 4 bits, activaciones int8) del checkpoint BF16 original de Qwen3.8-Flash-Next, publicado por Qwen bajo la arquitectura interna `qwen4_exp`. El trabajo lo firma Brad Harrison, un tercero no afiliado a Qwen, y esta pensado para servir el modelo en hardware AMD (etiqueta `rdna2` explicita en la model card) mediante una build de vLLM con soporte para la arquitectura `qwen4_exp` y para el offload del modulo PLE a CPU.

El checkpoint original pesa 128.799.735.699 parametros (unos 128,8 mil millones) e incluye una tabla de embeddings n-gram PLE en bf16 de 95,4 GiB, lo que lo hace inviable en GPUs de consumo. Esta version elimina esa tabla del checkpoint principal y la externaliza como un sidecar int4 de grupo 16 (unos 30 GB, 128 shards), reduciendo el payload del modelo a unos 75 GB repartidos en 19 shards de safetensors. Es, por tanto, una pieza de infraestructura mas que un modelo nuevo: no cambia tokenizer, plantilla de chat ni configuraciones, solo el formato numerico y el empaquetado del PLE.

Su relevancia es acotada pero concreta: permite desplegar un modelo multimodal de ~129B con ventana de contexto larga en nodos con GPUs AMD de gama alta, algo que el checkpoint BF16 original no permite sin un cluster mucho mayor. La contrapartida es una dependencia estricta de un fork de vLLM y de un contrato de sidecar muy especifico, lo que limita su portabilidad fuera de ese entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`qwen4_exp`) con modulo MTP drafter y tabla PLE n-gram externalizada |
| Parametros totales | 128.799.735.699 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A8 (pesos int4, activaciones int8, simetrica, group size 128, `desc_act=false`, true-sequential, activation-group-aware); sidecar PLE int4 grupo 16 con escalas fp16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (heredada del release OEM) |
| Formato de pesos | safetensors (19 shards, ~75 GB) + sidecar int4 PLE en `ple-int4/` (128 shards + META.json, ~30 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint original de Qwen3.8-Flash-Next: un transformer multimodal con torre de vision y merger, modulo MTP (multi-token prediction) para decodificacion especulativa, y una tabla de embeddings n-gram PLE de gran tamano (248.320 x 2.560 entradas por tensor de embedding y lm_head) que se usa como memoria de recuperacion externa. El autor no documenta el entrenamiento del modelo base; esta ficha solo cubre el proceso de cuantizacion, realizado con `gptqmodel 7.6.0` sobre un corpus de calibracion propio no detallado.

El alcance de la cuantizacion es selectivo: los 74.028 lineales del modelo de lenguaje se convierten a W4A8 (el 83,8 % de los bytes del payload son pesos empaquetados de 4 bits y el 2,6 % escalas fp16). Se mantienen en bf16, por diseno, el modulo MTP drafter (~5,2 GB, para preservar la tasa de aceptacion de los drafts), `embed_tokens` y `lm_head` (~2,5 GB), la torre de vision y el merger (~0,9 GB), las normas, sesgos y las 9 proyecciones PLE pequenas. La tabla PLE grande se sustituye por un sidecar cuantizado con RTN de grupo 16, escalas fp16, zero-point fijo en 8 y nibble bajo primero, disenado para ser compatible byte a byte con el contrato del worker de offload PLE en CPU de vLLM.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (`image-text-to-text`): incluye torre de vision y merger en bf16.
- Generacion de codigo y matematicas (capacidades heredadas del modelo base, no verificadas en esta cuantizacion).
- Decodificacion especulativa mediante el modulo MTP drafter conservado en bf16.
- Recuperacion de contexto largo mediante la tabla PLE n-gram externalizada y offloaded a CPU.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal de ~129B en nodos AMD: el sidecar int4 PLE y los 19 shards de ~75 GB permiten cargar el modelo en un servidor con varias GPUs RDNA2 de gama alta y CPU con suficiente RAM para el worker de offload, algo imposible con el checkpoint BF16 de 95,4 GiB solo en la tabla PLE.
- Procesamiento de documentos con imagenes en produccion: al conservar la torre de vision en bf16 y aceptar entradas image-text, sirve para extraccion de datos de facturas, tickets o formularios combinando OCR implicito con razonamiento sobre el texto.
- Asistentes conversacionales de contexto largo: la tabla PLE n-gram actua como memoria de recuperacion externa, adecuada para dialogos multi-turno con historial extenso y base de conocimiento fija.
- Generacion de codigo asistida en pipelines internos: el modelo base soporta generacion de codigo; esta cuantizacion reduce el coste por token al mantener los pesos en int4, aunque requiere validar la calidad tras la cuantizacion antes de usarlo en CI/CD.
- Investigacion en cuantizacion y offload: el repositorio documenta dos validaciones independientes del sidecar (divergencia media de 0,20 pasos y peor caso de 1,20 sobre 3.072 filas x 48 shards frente a `primitive-ai/Qwen3.8-Flash-Next-PLE-quant`, y 48/48 shards dentro de banda frente al ground truth bf16), lo que lo convierte en material de referencia para estudiar cuantizacion de tablas de embeddings gigantes.
- Evaluacion comparativa de backends de inferencia: util para medir el rendimiento de vLLM con soporte `qwen4_exp` y offload PLE en AMD frente a alternativas en NVIDIA.
- Prototipado de asistentes multimodales en entornos con licencia qwen-community-1.0: valido para uso interno y desarrollo, con revision legal previa si se plantea explotacion comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye metricas de validacion del sidecar PLE (divergencia media de 0,20 pasos, peor caso de 1,20 sobre 3.072 filas x 48 shards; 48/48 shards dentro de banda frente al ground truth bf16), que miden fidelidad de la cuantizacion, no calidad de tarea.

## Requisitos de hardware

- VRAM estimada: el payload del modelo son ~75 GB en pesos (4 bits dominantes mas bf16 en MTP, embeddings, vision y normas). Con cache KV y margen de activaciones, se necesita un nodo multi-GPU; no cabe en una sola GPU de 80 GB en configuracion holgada.
- RAM de sistema: el sidecar PLE int4 (~30 GB) se sirve desde CPU mediante el worker de offload, por lo que se recomienda al menos 64 GB de RAM dedicada al proceso.
- GPU recomendadas: el autor apunta a hardware AMD con soporte `rdna2`; no se documentan modelos NVIDIA validados. Para el checkpoint base sin cuantizar harian falta varios nodos; esta version esta pensada para un nodo AMD de gama alta.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni similares por el tamano del payload.
- Opciones de despliegue: exclusivamente vLLM con una build que incluya `qwen4_exp` y soporte de offload PLE en CPU (worker `rdna2`), configurando `VLLM_PLE_QUANT_DIR=<repo>/ple-int4`. No hay soporte documentado para llama.cpp, Ollama, TGI ni transformers puro pese a la etiqueta `transformers` del repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bradharrison/Qwen3.8-Flash-Next-W4A8-INT4-PLE | 128,8B | no disponible | GPTQ W4A8 + sidecar PLE int4 | qwen-community-1.0 | HuggingFace, requiere vLLM parcheado |
| Qwen/Qwen3.8-Flash-Next (OEM) | 128,8B | no disponible | bf16 | qwen-community-1.0 | HuggingFace, checkpoint oficial |
| primitive-ai/Qwen3.8-Flash-Next-PLE-quant | no disponible | no disponible | AWQ-derived para PLE | no disponible | HuggingFace, citado como referencia de validacion |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes. La comparacion se limita a formato, empaquetado y requisitos de despliegue.

## Limitaciones y advertencias

- Dependencia estricta de un fork de vLLM con soporte `qwen4_exp` y del contrato del worker PLE `rdna2`; no funciona con transformers estandar ni con otros servidores de inferencia.
- La cuantizacion W4A8 puede degradar calidad en tareas sensibles (matematicas, codigo, razonamiento largo); no se han publicado evaluaciones que lo cuantifiquen.
- El modulo MTP se conserva en bf16, pero su tasa de aceptacion tras la cuantizacion del resto del modelo no esta documentada.
- El sidecar PLE introduce un punto de fallo adicional: si la ruta `VLLM_PLE_QUANT_DIR` o el formato de los 128 shards no coinciden exactamente, el modelo no arranca o produce salidas corruptas.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del checkpoint base.
- Riesgo de alucinacion: no evaluado para esta variante.
- Idiomas soportados: no disponibles.
- Licencia qwen-community-1.0: es una licencia "other" con terminos comunitarios; conviene revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones de atribucion o de despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros independientes del autor.
- Fecha de creacion en 2026: verificar que el checkpoint base y el fork de vLLM sigan disponibles y mantenidos.

## Enlaces

- HuggingFace: https://huggingface.co/bradharrison/Qwen3.8-Flash-Next-W4A8-INT4-PLE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Referencia de validacion del sidecar PLE: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-PLE-quant
- Licencia: LICENSE dentro del repositorio de HuggingFace
- gptqmodel: no se proporciona enlace en la informacion disponible
- vLLM con soporte `qwen4_exp`: no se proporciona enlace en la informacion disponible
