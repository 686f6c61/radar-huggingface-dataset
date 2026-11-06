# mostwanted002/Huihui-Qwen3.6-35B-A3B-abliterated-awq-q4

## Resumen

Huihui-Qwen3.6-35B-A3B-abliterated-awq-q4 es una cuantizacion AWQ de 4 bits (W4A16, group size 128) del modelo Huihui-Qwen3.6-35B-A3B-abliterated, publicado por el usuario mostwanted002. Se trata de un modelo MoE de 35.951.822.704 parametros totales (aproximadamente 35,95B) con unos 3B parametros activos por token, derivado de la familia Qwen3.6 y con atencion lineal hibrida. La variante "abliterated" implica que el modelo base ha sido modificado para eliminar (ablacionar) ciertas direcciones de rechazo en el espacio de activaciones, un procedimiento habitual en la comunidad para reducir negativas del modelo ante determinadas peticiones.

El checkpoint esta pensado especificamente para inferencia en GPUs AMD RDNA2 (gfx1030, como RX 6800/6900 XT y Radeon Pro V620) mediante la imagen Docker darkkernel/vllm-gfx1030 con vLLM v0.19.1 sobre ROCm 7.2. La eleccion de int4 con activaciones de 16 bits (en lugar de FP8 o MXFP4) responde a la ausencia de soporte nativo de FP8 en RDNA2. El modelo incluye el modulo MTP (multi-token prediction) para decodificacion especulativa, lo que puede mejorar el throughput en vLLM.

La relevancia de esta ficha radica en que documenta un caso poco frecuente: un modelo MoE grande cuantizado para hardware consumer AMD, con decodificacion especulativa integrada y licencia Apache 2.0. El repositorio ocupa 22,0 GB, lo que lo hace desplegable en GPUs con 24 GB de VRAM, aunque con limitaciones de longitud de contexto practica (el ejemplo de serving usa max-model-len 8192).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atencion lineal hibrida (tag `qwen3_5_moe`), modulo MTP de 1 capa |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de serving usa `--max-model-len 8192`) |
| Tipos de cuantizacion | AWQ W4A16 (int4 pesos, activaciones bf16), group size 128, duo scaling |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), libreria vLLM |

## Arquitectura y entrenamiento

El modelo es un MoE (Mixture of Experts) de aproximadamente 35,95B parametros totales con unos 3B activos por token, construido sobre una arquitectura transformer con atencion lineal hibrida (identificada por el tag `qwen3_5_moe`). Incluye una torre de vision, ya que la cuantizacion AWQ se aplica tanto al stack del decoder (incluidos los 256 expertos del MoE) como a la torre de vision. Ademas, incorpora un modulo MTP (multi-token prediction) de 1 capa, utilizado para decodificacion especulativa en vLLM.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre fases de RLHF/DPO del modelo original. La variante "abliterated" del modelo base huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated implica una modificacion post-entrenamiento orientada a eliminar direcciones de rechazo, aunque no se detalla el procedimiento concreto en la informacion disponible.

En cuanto a la cuantizacion, se uso llm-compressor con el `AWQModifier` (esquema `W4A16`), calibrado con 512 muestras de HuggingFaceH4/ultrachat_200k usando la plantilla de chat y contexto de 2048 tokens. Se mantienen en bf16 las embeddings, RMS norms, `lm_head`, capas Conv y los 19 tensores del modulo `mtp.*` (fallback documentado de llm-compressor); vLLM alinea automaticamente la cuantizacion del modelo draft.

## Capacidades

- Generacion de texto y razonamiento multi-turno, heredadas del modelo base Qwen3.6.
- Procesamiento de vision: el checkpoint incluye torre de vision cuantizada, por lo que se espera soporte multimodal (no detallado en la model card).
- Decodificacion especulativa mediante el modulo MTP integrado (1 capa), activable con `--num-speculative-tokens` en vLLM.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible, aunque plausibles por la familia base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (idiomas no listados).
- Modo "thinking": no disponible en la informacion proporcionada.
- Comportamiento "abliterated": se espera menor tasa de rechazos ante peticiones, con los riesgos asociados.

## Casos de uso

- Despliegue en GPUs AMD RDNA2 consumer: el checkpoint esta calibrado y empaquetado para la imagen darkkernel/vllm-gfx1030 (ROCm 7.2, vLLM v0.19.1), permitiendo servir un MoE de ~36B en RX 6800/6900 XT o Radeon Pro V620 con 22 GB de pesos en int4.
- Servicio de API compatible OpenAI: el ejemplo de la model card expone `/v1/completions` en el puerto 8000, por lo que puede integrarse como backend en aplicaciones existentes que consumen la API de OpenAI.
- Inferencia con contexto moderado (8192 tokens): adecuado para chat multi-turno, resumen de documentos de longitud media y generacion de codigo en sesiones acotadas.
- Decodificacion especulativa para reducir latencia: activando `--num-speculative-tokens 1`, el modulo MTP permite acelerar la generacion en cargas interactivas donde la latencia por token es critica.
- Experimentacion con modelos "abliterated": util para investigadores que estudian el efecto de la ablacion de direcciones de rechazo en modelos MoE grandes, comparando comportamiento con el base no modificado.
- Prototipado multimodal: al incluir torre de vision, puede emplearse para tareas de descripcion de imagenes o VQA en entornos de laboratorio, siempre que se valide el soporte efectivo en vLLM.
- Evaluacion de cuantizacion AWQ en MoE: sirve como referencia practica para medir la degradacion de calidad de W4A16 group 128 frente al modelo bf16 en tareas de razonamiento y codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 22,0 GB, por lo que se necesita al menos ~22 GB de VRAM para cargar los pesos, mas overhead de KV cache y activaciones. Con `--max-model-len 8192` y lote pequeno, un GPU de 24 GB deberia ser suficiente; para contextos mayores o mayor concurrencia se requiere mas memoria.
- GPUs objetivo: AMD RDNA2 gfx1030, es decir RX 6800 XT, RX 6900 XT y Radeon Pro V620 (24 GB / 32 GB). La imagen Docker indicada es darkkernel/vllm-gfx1030:v0.19.1-rocm7.2.
- GPUs NVIDIA: no se documenta compatibilidad explicita; el checkpoint es AWQ W4A16 y podria cargarse en vLLM sobre CUDA, pero no esta validado en la informacion disponible.
- Consumer GPU: si, en GPUs AMD de 24 GB del segmento RDNA2. En NVIDIA consumer (RTX 4090 24 GB) la viabilidad es probable pero no confirmada.
- Opciones de despliegue: vLLM v0.19.1 (principal, con soporte MTP), imagen Docker darkkernel/vllm-gfx1030. Otros backends (llama.cpp, Ollama, TGI) no se mencionan y no estan confirmados para este formato compressed-tensors AWQ.
- Latencia y throughput: no disponibles. La decodificacion especulativa con MTP puede mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-abliterated-awq-q4 (este) | ~35,95B | ~3B | no disponible (ejemplo 8192) | AWQ W4A16 group 128 | Apache 2.0 | Orientado a gfx1030, incluye MTP |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated (base) | ~35,95B | ~3B | no disponible | bf16 | Apache 2.0 (segun heredado) | Version sin cuantizar, mayor VRAM |
| Qwen3.6-35B-A3B (familia original) | ~35B | ~3B | no disponible | bf16 / otras | no disponible | Modelo de referencia de la familia |
| Otros MoE ~30-40B cuantizados en AWQ | variable | variable | variable | AWQ W4A16 | variable | No se dispone de comparativa concreta en la informacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated": la ablacion de direcciones de rechazo puede aumentar la probabilidad de respuestas a peticiones que el modelo original rechazaria; requiere filtros de seguridad externos en produccion.
- Riesgo de alucinacion: inherente a modelos generativos de este tamano; no se aportan evaluaciones de factualidad.
- Cuantizacion W4A16: la perdida de precision int4 en pesos puede degradar tareas sensibles (matematicas, codigo, vision); no se han publicado benchmarks de calidad tras la cuantizacion.
- Contexto practico limitado: el ejemplo de serving usa `--max-model-len 8192`, muy por debajo de lo que la familia base podria soportar; contextos mayores incrementan el KV cache y pueden exceder 24 GB de VRAM.
- Idiomas: no se especifican; no se garantiza cobertura multilingue amplia.
- Compatibilidad de hardware restringida: validado solo para gfx1030 (RDNA2) con la imagen darkkernel/vllm-gfx1030; otros entornos no estan confirmados.
- Soporte de tool calling, agentes y modo thinking no documentado: no asumir estas capacidades sin validacion.
- Metricas de adopcion nulas (0 descargas, 0 likes) y publicacion muy reciente (1 de noviembre de 2026): escasa validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las condiciones del modelo base.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/mostwanted002/Huihui-Qwen3.6-35B-A3B-abliterated-awq-q4
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Imagen Docker de inferencia: https://hub.docker.com/r/darkkernel/vllm-gfx1030
- Herramienta de cuantizacion: https://github.com/vllm-project/llm-compressor
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
