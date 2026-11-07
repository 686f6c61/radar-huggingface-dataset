# kusuriya-labs/Qwen3.8-Flash-Next-EXL3-INT8-3.05bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-INT8-3.05bpw es una cuantizacion del modelo multimodal Qwen/Qwen3.8-Flash-Next publicada por el usuario kusuriya-labs en Hugging Face. Se trata de una conversion a 3,05 bits por peso (bpw) mediante el formato EXL3 de ExLlamaV3, pero con el codebook modificado para que cada peso decodificado caiga sobre una rejilla INT8 fija. El resultado es un checkpoint de aproximadamente 80 GB (85,2 GB de repositorio, incluyendo una tabla de embeddings n-gram de 32,6 GB) que no es cargable por el ExLlamaV3 estandar ni por Transformers o vLLM.

El modelo base es un transformer multimodal de tipo image-text-to-text con 26.168.065.536 parametros totales, orientado a conversacion y con capacidades de vision. Esta cuantizacion conserva la licencia Qwen Community License 1.0 del modelo original y esta pensada para ejecutarse en hardware AMD mediante una build parcheada de ExLlamaV3 para ROCm (objetivos gfx1201/RDNA4 y gfx1030/RDNA2), si bien en el momento de la publicacion no existe runtime publico para este formato.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion poco habitual (trellis EXL3 con codebook INT8) y, por otro, advierte de que el artefacto no es directamente desplegable con las herramientas estandar, lo que lo convierte en material de investigacion mas que en un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | 26.168.065.536 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3-INT8 3,05 bpw (lineales del LM, incluidos todos los expertos enrutados); LM head a 5 bits EXL3-INT8; vision/MTP a 5/3 bits EXL3-INT8; tabla de embeddings n-gram (PLE) en trellis EXL3 estandar (no INT8); embeddings, norms y controles sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0) |
| Formato de pesos | safetensors (EXL3 trellis con codebook INT8, no compatible con ExLlamaV3 upstream) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es, segun la informacion disponible, un transformer multimodal que introduce mejoras en atencion, residuales, embeddings y optimizacion, orientadas a mejorar capacidad y eficiencia computacional. No se dispone de detalles sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada. La cuantizacion conserva la estructura del modelo original, incluyendo una tabla de embeddings n-gram (PLE) de 32,6 GB que se decodifica por filas y no participa en operaciones GEMM.

La innovacion tecnica de esta publicacion es el formato EXL3-INT8: se parte del trellis EXL3 de ExLlamaV3 modificando el codebook para que cada peso decodificado caiga en una rejilla INT8 fija. El estado del trellis se multiplica por la constante de 24 bits `0xDCD12D` (una instruccion `v_mul_u32_u24`), se suman los cuatro bytes del producto y se aplica `q = (B - 509) >> 2` para obtener el peso INT8; el valor real es `q * 4 * 887 * 2^-17`. Los pesos decodificados alimentan directamente instrucciones `iu8` de dot-product/WMMA con activaciones INT8 (escala por grupo de 128, epilogo fp32 con el `svh` original). El multiplicador se almacena en el tensor `.mul1` de cada capa lineal (`0x00DCD12D` en lugar del estandar `0x83DCD12D`) y `quantization_config.json` declara `"codebook": "exl3-int8"`. La calibracion se realizo con 250 muestras de 2048 tokens. No es convertible desde un checkpoint EXL3 estandar, ya que el codebook forma parte de la cuantizacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (image-text-to-text, conversational).
- Procesamiento de imagenes y texto combinados (entrada image-text-to-text).
- Capacidades de vision heredadas del modelo base; el modulo de vision se cuantiza a 5 bits EXL3-INT8.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en cuantizacion de precisión extrema: el checkpoint sirve para estudiar el efecto de un codebook INT8 sobre un trellis EXL3 a 3,05 bpw, comparando la divergencia KL frente a BF16 con la de una cuantizacion EXL3 estandar del mismo modelo.
- Evaluacion de hardware AMD para inferencia: al estar implementada la decodificacion nativa para gfx1201 (RDNA4) y gfx1030 (RDNA2) en una build parcheada de ExLlamaV3, permite medir rendimiento en GPUs Radeon como la R9700 o la V620 con reparto por capas.
- Pruebas de pipelines multimodales de bajo coste de memoria: con unos 80 GB totales y la tabla n-gram en RAM de host, se puede ejecutar en configuraciones de 2x V620 de 32 GB para experimentar con entrada image-text-to-text sin disponer de BF16 completo.
- Referencia para desarrolladores de runtimes: el formato documenta el contrato del tensor `.mul1` y la constante `0xDCD12D`, util para implementar kernels INT8 agrupados para expertos en runtimes propios.
- Analisis de degradacion por cuantizacion en tareas de texto: los datos de KLD por caso (incluido el outlier `wiki2_r7` con 0,601 frente a 0,158) permiten estudiar que tipos de texto son mas sensibles a la rejilla INT8.
- Docencia y formacion tecnica: como ejemplo practico de cuantizacion trellis, calibracion y evaluacion con divergencia KL y acuerdo top-1 en un modelo de 26B parametros.

## Benchmarks y rendimiento

Evaluacion realizada con la build ROCm de ExLlamaV3 sobre 2x V620 (gfx1030), reparto por capas y tabla n-gram en RAM de host. Solo se evaluo la variante de 3,05 bpw.

| Metrica | EXL3-INT8 3,05 bpw | EXL3 estandar 3,05 bpw (referencia) |
|---|---|---|
| Divergencia KL macro (21 casos, 32.359 posiciones) | 0,1530 | 0,1314 |
| Acuerdo top-1 | 0,8688 | 0,8999 |
| Caso outlier `wiki2_r7` (KLD) | 0,601 | 0,158 |
| Prefill (512 / 2048 / 8192 tokens) | 258 / 412 / 389 tok/s | identico |
| Decode | 25 tok/s | identico |

La variante de 4 bpw no se evaluo por no caber en dos V620 de 32 GB. La ruta de computo INT8 (activaciones INT8) no se evaluo en este modelo. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 85,2 GB y el modelo completo unos 80 GB; con la tabla n-gram (32,6 GB) en RAM de host, el resto debe caber en VRAM. La evaluacion se hizo con 2x V620 de 32 GB (64 GB totales) con reparto por capas.
- GPUs recomendadas: AMD Radeon V620 (gfx1030, RDNA2) y R9700 (gfx1201, RDNA4), que son los objetivos con decodificacion nativa implementada.
- GPU de consumo: no disponible; no se documenta soporte para GPUs consumer NVIDIA ni para gfx de escritorio distintas de las citadas.
- Opciones de despliegue: build parcheada de ExLlamaV3 para ROCm y el runtime `shelf`; ninguno de los dos esta publicado. ExLlamaV3 upstream, vLLM, llama.cpp, Ollama y TGI no pueden cargar este formato. Ademas, la ruta MoE de `shelf` no dispone de kernel INT8 agrupado, por lo que en ese runtime el modelo no es utilizable.
- Latencia y throughput: prefill de 258/412/389 tok/s a 512/2048/8192 tokens y decode de 25 tok/s en la configuracion 2x V620 descrita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad de runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-INT8-3.05bpw (este) | 26,17 B | no disponible | EXL3-INT8 3,05 bpw | Qwen Community 1.0 | Solo builds no publicadas (ExLlamaV3 ROCm parcheado, `shelf`) |
| Qwen/Qwen3.8-Flash-Next (base) | 26,17 B | no disponible | BF16 | Qwen Community 1.0 | Ecosistema estandar |
| Cuantizacion EXL3 estandar 3,05 bpw del mismo modelo | 26,17 B | no disponible | EXL3 trellis 3,05 bpw | Qwen Community 1.0 | ExLlamaV3 upstream |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es cargable por ExLlamaV3 upstream: el decodificador aplicaria el multiplicador estandar (`0x83DCD12D`) y produciria pesos corruptos.
- No existe runtime publico para el formato en el momento de la publicacion; las builds parcheadas de ExLlamaV3 para ROCm y el runtime `shelf` no estan liberados.
- En el runtime `shelf` el modelo no es utilizable porque su ruta MoE carece de kernel INT8 agrupado para expertos EXL3-INT8.
- La calidad medida es inferior a la de una cuantizacion EXL3 estandar del mismo modelo (KLD 0,1530 frente a 0,1314; top-1 0,8688 frente a 0,8999), aunque la comparacion mezcla el efecto del codebook con ruido entre ejecuciones de cuantizacion.
- Existe un caso outlier no analizado (`wiki2_r7`, KLD 0,601) que sugiere sensibilidad del formato a ciertos textos.
- La ruta de computo INT8 con activaciones INT8 no fue evaluada; el rendimiento reportado corresponde a la ruta FP16.
- La variante de 4 bpw no se evaluo por limitaciones de memoria.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni restricciones adicionales de la licencia mas alla de la Qwen Community License 1.0; debe consultarse el fichero `LICENSE` del repositorio.
- La model card original del modelo base se conserva en `SOURCE_MODEL_CARD.md` y sus afirmaciones describen el modelo upstream, no esta cuantizacion.
- Los ficheros `config.json`, `quantization_config.json`, `model.safetensors.index.json` y los del tokenizer/preprocesador deben mantenerse juntos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kusuriya-labs/Qwen3.8-Flash-Next-EXL3-INT8-3.05bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
