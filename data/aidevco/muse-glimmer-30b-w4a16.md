# aidevco/Muse-Glimmer-30B-W4A16

## Resumen

Muse-Glimmer-30B-W4A16 es una cuantizacion de solo pesos en int4 del modelo multimodal denso Muse-Glimmer-30B, desarrollado originalmente por Meta Superintelligence Lab. La cuantizacion la firma aidevco y su objetivo es concreto: hacer que un modelo de 30B parametros con torre de vision quepa y se sirva en una unica GPU NVIDIA L4 de 22,5 GiB (arquitectura Ada, sm89), donde el checkpoint en bf16 (59,6 GB) y el de fp8 (unos 30 GB) no entran.

El modelo resultante ocupa 22,2 GB en disco y mantiene en bf16 tanto el tokenizador de embeddings (`embed_tokens`), como la cabeza de salida (`lm_head`, sin atar), las normalizaciones, la torre de vision y el adaptador. Solo las capas lineales del decodificador (MLP y atencion, 52 capas, 416 modulos) se comprimen a int4 con grupo de 128 y esquema simetrico, en formato `pack-quantized` de compressed-tensors, que Marlin consume directamente sin repacking.

La relevancia practica es que permite desplegar un modelo image-text-to-text de 29.776.626.688 parametros en hardware de gama media de datacenter, con licencia Apache 2.0 y compatibilidad con vLLM 0.27 o superior. Todo lo relativo a arquitectura, entrenamiento, benchmarks y uso previsto del modelo original queda remitido a la model card de Meta; esta ficha cubre la variante cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text) con torre de vision y adaptador; arquitectura `muse_glimmer` en vLLM |
| Parametros totales | 29.776.626.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la configuracion de servicio de ejemplo usa `--max-model-len=32768` |
| Tipos de cuantizacion | W4A16 (int4 solo pesos, simetrico, grupo 128, `pack-quantized` de compressed-tensors, compatible con Marlin); el resto del checkpoint en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la del modelo original; se incluyen `LICENSE` y `USAGE_POLICY.md` sin cambios) |
| Formato de pesos | safetensors (compressed-tensors), libreria transformers |
| Tamano del repo | 22,2 GB |
| Modulos cuantizados | 416 modulos: `gate_proj`, `up_proj`, `down_proj` del MLP y `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj` y `output_gate_proj` de la atencion, en 52 capas |
| Modulos en bf16 | `embed_tokens` (2,69 GB), `lm_head` sin atar (2,69 GB), normas, torre de vision (aprox. 4,5 GB) y adaptador |
| Revision del modelo base | `cec94fcfd6512f2cfe708138c32533b346ea4f69` |
| Herramienta de cuantizacion | llm-compressor 0.14.0 (`model_free_ptq`) con compressed-tensors 0.19.0 |

## Arquitectura y entrenamiento

La variante cuantizada no modifica la arquitectura del modelo original: se trata de un transformer denso multimodal con torre de vision y adaptador, que procesa entradas de imagen y texto y genera texto. La model card de esta version no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO; toda esa informacion se remite a la model card de `meta-models/Muse-Glimmer-30B`, que no forma parte de la informacion disponible.

La innovacion tecnica de esta ficha es el proceso de cuantizacion. Se aplico un esquema W4A16 data-free (sin conjunto de calibracion), simetrico, con estrategia de grupo de tamano 128 y observador `memoryless-mse`, ejecutado solo en CPU con dos procesos trabajadores en 28 minutos. El grupo de 128 divide exactamente todas las dimensiones de entrada cuantizadas (4096, 6656 y 19968). Los 50,3 GB de pesos bf16 de las capas lineales pasaron a 13,0 GB. Tras la construccion se verificaron los campos del esquema, los objetivos en las dos formas de nombres que vLLM reconoce (`model.layers...` y `language_model.model.layers...`), la presencia de todos los shards y una comprobacion numerica de dequantizacion sobre un shard, con error relativo de 0,103, valor normal para int4.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline `image-text-to-text` y la etiqueta `conversational`.
- Comprension de imagenes combinada con texto: la torre de vision y el adaptador se conservan en bf16, por lo que la entrada multimodal sigue operativa si no se pasa `--language-model-only`.
- Razonamiento y generacion de codigo: no disponible de forma explicita en la informacion proporcionada; debe consultarse la model card del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue multimodal en una sola NVIDIA L4: el caso de uso principal declarado por el autor. El checkpoint de 22,2 GB cabe en los 22,5 GiB de la GPU, lo que permite servir el modelo completo con vLLM 0.27 o superior y `--gpu-memory-utilization=0.92` sin recurrir a multi-GPU.
- Servicio de descripcion y analisis de imagenes: manteniendo la torre de vision activa (sin `--language-model-only`), el modelo puede recibir pares imagen-texto y generar descripciones, resumenes o respuestas sobre el contenido visual.
- Asistente conversacional de contexto largo: la configuracion de referencia usa `--max-model-len=32768` con cache KV en fp8, adecuada para dialogos multi-turno o documentos extensos que quepan en esa ventana.
- Inferencia economica en entornos de laboratorio o prototipado: al reducir el peso de 59,6 GB en bf16 a 22,2 GB, permite evaluar un modelo de 30B en infraestructura modesta antes de escalar a despliegues mayores.
- Pipelines de solo texto con ahorro de memoria: con `--language-model-only` se omite el codificador de vision, liberando los aproximadamente 4,5 GB de la torre y dejando mas VRAM para cache KV y batching.
- Base para ajuste fino o evaluacion comparativa de cuantizaciones: al estar en formato compressed-tensors estandar y con licencia Apache 2.0, sirve como referencia para medir la perdida de calidad frente a bf16 o fp8 en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la variante cuantizada no incluye tablas de MMLU, HumanEval, GSM8K ni equivalentes, y remite explicitamente a la model card del modelo original para cualquier dato de rendimiento. El unico dato numerico de calidad es la comprobacion de dequantizacion sobre un shard, con error relativo de 0,103.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 22,2 GB; el autor lo disena para una NVIDIA L4 de 22,5 GiB. En la practica hay que dejar margen para cache KV (fp8 en la configuracion recomendada) y activaciones, por lo que el ajuste es estrecho y depende de `--max-model-len`, `--max-num-batched-tokens` y `--gpu-memory-utilization`.
- GPU recomendadas: NVIDIA L4 (objetivo declarado). Cualquier GPU con mas de 24 GB de VRAM ofrece margen adicional para contextos y lotes mayores.
- GPU de consumo: no disponible. La informacion no confirma el funcionamiento en GPUs consumer; con 22,2 GB de pesos, una GPU de 24 GB queda al limite y las de 16 GB o menos no son viables con esta cuantizacion.
- Opciones de despliegue: vLLM 0.27 o superior (imprescindible por la arquitectura `muse_glimmer`); la cuantizacion se detecta desde la configuracion y no debe pasarse `--quantization`. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Parametros de servicio de referencia: `--max-model-len=32768 --gpu-memory-utilization=0.92 --kv-cache-dtype=fp8 --max-num-batched-tokens=8192 --language-model-only`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-W4A16 (esta ficha) | 29,78B | no disponible (ejemplo de servicio a 32768) | W4A16 int4, grupo 128, Marlin | Apache 2.0 | Hugging Face, vLLM 0.27+ |
| Muse-Glimmer-30B (bf16) | 29,78B | no disponible | bf16 (59,6 GB) | Apache 2.0 | Hugging Face |
| Muse-Glimmer-30B (fp8) | 29,78B | no disponible | fp8 (aprox. 30 GB) | Apache 2.0 | no disponible en la informacion proporcionada |

Las tres variantes comparten arquitectura, parametros y licencia; la diferencia esta en el peso del checkpoint y en el hardware necesario. No se dispone de informacion sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el paso a int4 en las capas lineales introduce error numerico (error relativo de dequantizacion de 0,103 en el shard verificado); el impacto real en tareas no esta medido en la informacion disponible.
- Cuantizacion data-free: al no usar conjunto de calibracion, no hay garantia de que el esquema sea optimo para la distribucion de activaciones real del modelo.
- Ajuste de memoria muy estrecho en L4: 22,2 GB de pesos sobre 22,5 GiB deja poco margen; contextos largos o lotes grandes pueden provocar OOM.
- Requisito estricto de version: necesita vLLM 0.27 o superior; versiones anteriores no soportan la arquitectura `muse_glimmer`.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue ni el comportamiento en castellano.
- Sesgos y alucinacion: no hay informacion especifica en la model card de esta variante; deben consultarse las advertencias del modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repositorio incluye un `USAGE_POLICY.md` del modelo original que conviene revisar antes de desplegar en produccion.
- Obra derivada: solo se cuantizaron los pesos; cualquier problema de comportamiento del modelo es atribuible al modelo base de Meta Superintelligence Lab.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/aidevco/Muse-Glimmer-30B-W4A16
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Herramienta de cuantizacion llm-compressor: no disponible en la informacion proporcionada
- compressed-tensors: no disponible en la informacion proporcionada
- vLLM: no disponible en la informacion proporcionada
- Papers, blogs y demos: no disponible en la informacion proporcionada
