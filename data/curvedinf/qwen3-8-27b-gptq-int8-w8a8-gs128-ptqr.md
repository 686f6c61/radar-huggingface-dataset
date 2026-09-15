# curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR

## Resumen

Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR es un checkpoint cuantizado del modelo multimodal Qwen/Qwen3.8-27B, publicado por el usuario independiente curvedinf el 15 de septiembre de 2026. Se trata de una cuantizacion GPTQ de 8 bits en formato W8A8 con grupo de escalas de 128 (GS128), retrabajada mediante PTQR (post-training quantization with rounding-dither retraining), una tecnica de destilacion consciente de la propia cuantizacion. El objetivo declarado por el autor es servir como reemplazo directo del checkpoint GPTQ original del mismo autor, con el mismo formato y la misma configuracion pero con menor error de cuantizacion.

El modelo base es un transformer hibrido denso de 27.781.427.952 parametros (27,8B) organizado en 64 capas: 48 de atencion lineal GDN y 16 de atencion completa, en un patron repetido 3:1, con dimension oculta de 5120, vocabulario de 248.320 tokens y contexto nativo de 262.144 tokens. La relevancia de esta publicacion es doble: por un lado documenta un flujo completo de cuantizacion y validacion sobre hardware AMD Instinct MI100 (gfx908/CDNA1), poco frecuente en el ecosistema; por otro, se distribuye junto a una pila de serving especifica (forks de vLLM y de AITER) y a un modelo draft DFlash2 para decodificacion especulativa.

El checkpoint esta disenado para operarse con una receta fija: tensor parallel 4, concurrencia 8, KV cache en INT8 con grupos de 128 y 13 tokens especulativos. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido denso multimodal (model_type qwen3_5): 64 capas, 48 de atencion lineal GDN + 16 de atencion completa, patron 3:1 |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base; la receta de serving documentada usa --max-model-len 65536 |
| Tipos de cuantizacion | GPTQ INT8 W8A8, group_size 128, simetrica, desc_act false, true_sequential true; KV cache INT8 block g128; lm_head en fp16; encoder de vision y modulo MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 31,8 GB) |
| Modelo base | Qwen/Qwen3.8-27B |
| Dimension oculta | 5120 |
| Vocabulario | 248.320 tokens |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Hardware de validacion | 4x AMD Instinct MI100 (gfx908 / CDNA1) sobre XGMI |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina atencion lineal GDN (Gated Delta Net) con atencion completa en una proporcion 3:1: de las 64 capas, 48 usan atencion lineal y 16 atencion completa. Se trata de un modelo denso (no MoE) y multimodal, con un encoder de vision y un modulo MTP. La model card del checkpoint indica que el encoder de vision se conserva en BF16 "por completitud", pero la receta de serving recomendada activa unicamente el modelo de lenguaje (--language-model-only).

La innovacion tecnica principal de esta publicacion es PTQR. El proceso parte de la malla de cuantizacion GPTQ INT8 GS128 del GPTQModel 7.3.4 y afina los pesos directamente bajo la cuantizacion desplegada: un estudiante cuya pasada forward replica los kernels INT8 reales de serving (malla de pesos G128, cuantizacion dinamica de activaciones por token, KV cache INT8) se destila contra un profesor BF16 congelado, aplicando un dither geometricamente anealing sobre cada decision de redondeo, de forma que las primeras fases exploran puntos vecinos de la malla y las ultimas son bit-identicas al serving. El entrenamiento es SGD solo sobre pesos, con las escalas de grupo congeladas, sin pasada de calibracion. Los pesos reentrenados se recuantizan y exportan a traves del mismo envoltorio GPTQ GS128, por lo que el checkpoint resultante mantiene formato y configuracion identicos a los del original de una pasada. El autor no especifica en esta pagina el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base: esos datos figuran como no disponibles.

## Capacidades

- Generacion de texto conversacional: el checkpoint declara la etiqueta conversational y esta pensado para dialogos multi-turno.
- Contexto largo: el modelo base soporta 262.144 tokens; la receta de serving validada limita a 65.536 tokens con KV cache INT8.
- Atencion lineal hibrida: 48 de las 64 capas usan atencion lineal GDN, lo que reduce el coste de atencion frente a un transformer denso puro en secuencias largas.
- Multimodalidad en origen: la arquitectura es image-text-to-text y el checkpoint incluye el encoder de vision en BF16, pero la receta de serving documentada sirve solo el modelo de lenguaje, por lo que la capacidad de vision no queda habilitada en esa configuracion.
- Decodificacion especulativa: compatible con el draft curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128-PTQR mediante el metodo dflash, con 13 tokens especulativos.
- Tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo de razonamiento explicito (thinking), audio u otras capacidades especiales: no disponible (no documentado).

## Casos de uso

- Serving on-premise sobre hardware AMD: el caso de uso central del checkpoint es desplegar un LLM de 27,8B en INT8 sobre 4x MI100 con la pila vLLM/AITER validada por el autor, en organizaciones que ya tienen aceleradores CDNA1 y quieren exprimir su VRAM con cuantizacion W8A8.
- Procesamiento de documentos largos: con 65.536 tokens de contexto en la receta validada (y 262.144 en el modelo base), permite analisis de contratos, informes tecnicos o expedientes completos sin trocear el documento, apoyandose en las 48 capas de atencion lineal para contener el coste de atencion.
- Asistente conversacional multi-turno: el modelo esta etiquetado como conversational y puede mantener dialogos con historial extenso gracias al contexto disponible; con licencia Apache 2.0 es viable desplegarlo en atencion al cliente interna sin coste de licencia.
- Investigacion en cuantizacion post-entrenamiento: PTQR se puede reproducir sobre este checkpoint y comparar su divergencia KL (0,0069) frente al GPTQ de una pasada (0,0110), usando el ledger de experimentos publicado en el fork de vLLM.
- Aceleracion de inferencia con decodificacion especulativa: emparejar el target con el draft DFlash2 (13 tokens especulativos) para aumentar los tokens aceptados por paso; el autor reporta una aceptacion de 3,88 frente a 3,67 del baseline BF16.
- Banco de pruebas de kernels INT8 en gfx908: la receta activa AITER W8A8 en todos los GEMM, atencion unificada de AITER, all-reduce personalizado de vLLM y KV INT8, lo que permite medir y comparar rutas de kernels alternativas sobre el mismo modelo.
- Despliegue en plataformas compatibles con endpoints: el repositorio declara la etiqueta endpoints_compatible y pesos safetensors en formato transformers, lo que facilita su carga en plataformas que acepten ese formato, siempre que se respete la receta de serving.
- Evaluacion de arquitecturas hibridas de atencion: util para medir el comportamiento real de un modelo con proporcion 3:1 entre atencion lineal y completa en cargas de contexto largo, frente a alternativas de atencion densa.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.). Los unicos datos cuantitativos disponibles son las pruebas de puerta de calidad del propio autor:

| Metrica | Este checkpoint (PTQR) | GPTQ original | Referencia / umbral |
|---|---|---|---|
| Divergencia KL con teacher forcing | 0,0069 | 0,0110 | Umbral de puerta: 0,02 |
| Acierto greedy | 42/52 | 38/52 | No disponible para otras variantes |
| Aceptacion en decodificacion especulativa | 3,88/13 | No disponible | Baseline BF16: 3,67 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar.

## Requisitos de hardware

- Configuracion validada: 4x AMD Instinct MI100 (gfx908 / CDNA1) conectadas por XGMI, con --tensor-parallel-size 4 y --max-num-seqs 8.
- VRAM estimada: el repositorio ocupa 31,8 GB, de los que aproximadamente 28 GB corresponden a los pesos INT8 de los 27,8B parametros. A eso hay que anadir la KV cache INT8, el estado Mamba/GDN en fp32, el encoder de vision y el modulo MTP en BF16 y las activaciones. La model card no detalla el consumo de VRAM por tarjeta.
- GPU de consumo: por el volumen de pesos, no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) sin offload a CPU o sin una cuantizacion mas agresiva que no se ha publicado. Seria necesario un acelerador de 40-48 GB o superior en una sola tarjeta, o el reparto en varias.
- GPU de datacenter: el autor solo valida la receta en MI100. No hay evidencia publicada de funcionamiento validado en A100, H100 u otras GPUs NVIDIA, ni en generaciones AMD posteriores a gfx908.
- Opciones de despliegue: el autor proporciona dos forks. vLLM: curvedinf/int8-vllm, rama main (GEMM AITER W8A8 INT8 en todas las formas, gather de embeddings INT8, KV INT8, custom all-reduce de vLLM). AITER: curvedinf/int8-aiter, rama main (kernels de atencion unificada INT8 y ajuste para gfx908).
- Variables de entorno de la receta: VLLM_ROCM_USE_AITER=1, VLLM_ROCM_USE_AITER_UNIFIED_ATTENTION=1, VLLM_GFX908_INT8_LM_HEAD=1, VLLM_GFX908_ACT_QUANT=round, VLLM_DISABLED_KERNELS=TritonW8A16LinearKernel.
- Restricciones de la receta: el autor advierte de no sustituir TRITON_ATTN, W8A16, RCCL ni el all-reduce CAR de AITER, ni usar KV en fp16, ni prescindir de la especulacion, ni cambiar el tamano de TP ni la concurrencia.
- Otras opciones (llama.cpp, Ollama, TGI, vLLM estandar): no disponibles; no hay documentacion de compatibilidad con estas rutas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KLD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR (este) | 27,8B | 262.144 (65.536 en la receta) | GPTQ INT8 W8A8 GS128 con reentrenamiento PTQR | 0,0069 | Apache 2.0 | HuggingFace, 0 descargas |
| curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128 (original del mismo autor) | 27,8B | 262.144 | GPTQ INT8 W8A8 GS128 de una pasada | 0,0110 | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (modelo base) | 27,8B | 262.144 | ninguna (BF16) | Referencia de profesor | Apache 2.0 | HuggingFace |
| curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128-PTQR (draft) | no disponible | no disponible | GPTQ INT8 W8A8 GS128 PTQR | no disponible | Apache 2.0 | HuggingFace |

Frente al GPTQ original, este checkpoint mejora la fidelidad al profesor BF16 (KLD 0,0069 frente a 0,0110), el acierto greedy (42/52 frente a 38/52) y mantiene una aceptacion especulativa de 3,88 frente al baseline BF16 de 3,67. En cuanto a alternativas de otras familias del mismo tamano, no hay informacion disponible en la documentacion proporcionada.

## Limitaciones y advertencias

- Validacion de la comunidad practicamente nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 15 de septiembre de 2026.
- Acoplamiento extremo a una receta concreta: TP4, concurrencia 8, AITER W8A8 en todos los GEMM, atencion unificada de AITER, all-reduce personalizado, KV INT8 y decodificacion especulativa. El autor prohibe explicitamente sustituir TRITON_ATTN, W8A16, RCCL, el all-reduce CAR, el KV en fp16, el tamano de TP o la concurrencia.
- Compatibilidad limitada: solo esta validado en gfx908 (MI100 / CDNA1). No hay evidencia de funcionamiento en otras GPUs AMD ni en NVIDIA.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de veracidad, sesgo o seguridad. La metrica de KLD mide fidelidad al modelo base, no correccion factual.
- Perdida de calidad por cuantizacion: aunque reducida, la divergencia KL no es nula (0,0069), por lo que existe una degradacion medible respecto al BF16.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue sin datos.
- Vision no habilitada en la receta: aunque el pipeline declarado es image-text-to-text y el encoder se incluye en BF16, la receta documentada usa --language-model-only, por lo que la entrada de imagenes no esta operativa en esa configuracion.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar los terminos aplicables al modelo base Qwen/Qwen3.8-27B antes de un despliegue en produccion.
- Coste de almacenamiento y transferencia: 31,8 GB de repositorio, con los pesos en safetensors.
- Ausencia de benchmarks academicos: no hay datos de MMLU, HumanEval, GSM8K ni similares, lo que dificulta comparar su calidad con alternativas de otros autores.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR
- Modelo draft DFlash2 para decodificacion especulativa: https://huggingface.co/curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128-PTQR
- Checkpoint GPTQ original del mismo autor: https://huggingface.co/curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de vLLM con la pila INT8 y el entrenador PTQR: https://github.com/curvedinf/int8-vllm (docs/recipes/README.md y docs/recipes/surface_experiments_ledger.jsonl)
- Fork de AITER con kernels de atencion unificada INT8 y ajuste gfx908: https://github.com/curvedinf/int8-aiter
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los unicos resultados devueltos corresponden a paginas de inicio de sesion y perfiles corporativos de LinkedIn, sin relacion con el modelo.
