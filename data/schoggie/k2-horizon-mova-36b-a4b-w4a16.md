# schoggie/K2-Horizon-MoVA-36B-A4B-W4A16

## Resumen

K2-Horizon-MoVA-36B-A4B-W4A16 es un checkpoint cuantizado del modelo IFM/K2-Horizon-MoVA-36B-A4B, desarrollado por MBZUAI (Institute of Foundation Models) y cuantizado por el usuario schoggie. Se trata de un transformer decoder-only de tipo Mixture of Experts (MoE) de aproximadamente 37.400 millones de parametros totales, con una longitud de contexto nativa de 524.288 tokens. La innovacion estructural del modelo base es MoVA (Mixture of Value Attention): la atencion sustituye la proyeccion `v_proj` por un router (`v_router`) que selecciona entre 64 expertos de valor por capa, ademas de 45 capas MoE en el bloque MLP con 100 expertos enrutados cada una.

La aportacion concreta de este repositorio es una cuantizacion W4A16 con `compressed-tensors` que aplica INT4 simetrico con grupo de 128 exclusivamente a los expertos MoE enrutados (`mlp.experts.*`), dejando el resto de la red, y de forma critica todo el mecanismo MoVA, en BF16. El autor documenta que una cuantizacion GPTQ Int4 de la comunidad que si cuantiza los expertos de valor y el router degrada HumanEval de 92,1% a 15,2%, con fallos sistematicos de parentesis duplicados. Este checkpoint es, por tanto, un caso de estudio sobre que partes de una arquitectura con atencion tipo MoE no admiten cuantizacion agresiva de pesos.

Es relevante ahora porque documenta con mediciones concretas un compromiso poco habitual: el modelo ocupa 35,5 GB en lugar de los 21 GB de la variante GPTQ, y a cambio mantiene la capacidad de generacion de codigo. Tambien describe con detalle el estado del ecosistema de servicio (limitaciones de SGLang y del plugin de vLLM) y ofrece un parche para ejecutarlo, lo que lo convierte en una referencia util para quien despliegue arquitecturas K2 Horizon cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE en el MLP y atencion MoVA (router sobre 64 expertos de valor por capa) |
| Parametros totales | 37.444.792.020 (~37,4 B), dato de safetensors |
| Parametros activos | ~4 B, deducido de la nomenclatura «36B-A4B» del modelo base; no confirmado explicitamente en la documentacion disponible |
| Longitud de contexto | 524.288 tokens (`max_position_embeddings`); la configuracion de servicio probada limita a 131.072 tokens por peticion |
| Tipos de cuantizacion | W4A16: INT4 simetrico group-128 (pack-quantized) solo en `mlp.experts.*`; el resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors`, requiere `custom_code` y `trust_remote_code` |
| Capas | 48 capas, atencion completa en todas ellas; 45 capas con expertos MoE |
| Expertos | 100 expertos enrutados por capa MoE (13.500 tensores cuantizados); 64 expertos de valor por capa en MoVA |
| Dimension oculta | 2.560 (`hidden`) |
| Cabezas KV | 8 cabezas de valor x 128 dimensiones de cabeza |
| Tamano del repositorio | 35,5 GB (33,6 GiB de pesos en memoria) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con dos mecanismos de mezcla de expertos. En el bloque MLP, 45 de las 48 capas contienen 100 expertos enrutados (`mlp.experts.*`), ademas de expertos compartidos (`mlp.shared_experts.*`), una compuerta (`mlp.gate`) y capas densas (`mlp_only_layers`) que no usan MoE. En la atencion, MoVA sustituye `v_proj` por 64 expertos de valor por capa con su propio router (`v_router`), del que se seleccionan los 4 mejores en la ruta dispersa. Con `E·kv_dim = 65.536` y `hidden = 2.560`, el autor calcula aproximadamente 0,13 GB de activaciones por cada 1.000 tokens en la ruta densa BF16 de MoVA. Todas las capas usan atencion completa, sin mecanismos hibridos tipo SSM ni atencion lineal, lo que encarece notablemente la cache KV (~192 KB por token en BF16 y ~96 KB por token en FP8, unas 6 veces mas que un modelo hibrido de tamano similar).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo base. Respecto a esta cuantizacion, el proceso es determinista y esta documentado: se cuantizan 13.500 tensores correspondientes a `gate_proj`, `up_proj` y `down_proj` de los 100 expertos de las 45 capas MoE, y se copian 3.498 tensores en BF16. El autor justifica la eleccion citando la propia configuracion de la release FP8 de IFM, cuyos `ignored_layers` (3.408 entradas) dejan en precision completa todos los `self_attn.v_experts.*`, el `v_router`, `q/k/o/gate_proj`, `mlp.gate`, `mlp.shared_experts.*`, las capas densas, todas las normalizaciones, `lm_head`, `embed_tokens` y `model.norm`. Esta W4A16 sigue ese mismo contrato.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Generacion de codigo: HumanEval pass@1 de 92,1% (151/164, decodificacion greedy) medido por el autor en una unica NVIDIA CMP 170HX.
- Contexto largo: ventana nativa de 524.288 tokens, con 131.072 tokens por peticion en la configuracion probada y una reserva de cache KV de 266.016 tokens con `--kv-cache-dtype fp8`.
- Razonamiento multistep: el autor describe que, en la cuantizacion GPTQ defectuosa, el modelo mantenia «fluent English and correct reasoning» pero fallaba en codigo, lo que sugiere capacidad de razonamiento conservada; no se aportan benchmarks de razonamiento.
- Soporte de tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Soporte de agentes: no disponible (no documentado).
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado y no hay evaluacion al respecto).
- Modo de razonamiento explicito (thinking), vision o audio: no disponible; no se menciona ningun modo especial de este tipo.
- Inferencia por lotes concurrentes: la tabla de rendimiento con `np` de 1 a 32 demuestra soporte de alta concurrencia con `--max-num-seqs 32`.
- Reutilizacion de prefijos: compatible con `--enable-prefix-caching` en la configuracion de vLLM documentada.

## Casos de uso

- Asistente de generacion de codigo en produccion: con un HumanEval pass@1 de 92,1% en decodificacion greedy, el modelo es adecuado para autocompletado, generacion de funciones y traduccion entre lenguajes. La eleccion de mantener MoVA en BF16 evita precisamente el fallo de parentesis duplicados que arruina la salida de codigo en cuantizaciones que si lo cuantizan.
- Analisis y refactorizacion de repositorios completos: la ventana de 524.288 tokens y el limite practico de 131.072 tokens por peticion permiten cargar varios ficheros fuente y su contexto en una sola pasada, con `--enable-prefix-caching` para reutilizar el preambulo comun entre peticiones de un mismo repositorio.
- Generacion de tests unitarios y documentacion tecnica a partir de codigo existente: el modelo produce codigo sintacticamente valido de forma fiable, lo que reduce la tasa de fallo al ejecutar los artefactos generados en un pipeline de CI/CD.
- Servicio conversacional de alto rendimiento: con `--max-num-seqs 32` el autor mide 874,7 tokens/s agregados en una sola CMP 170HX, suficiente para atender decenas de conversaciones concurrentes con un unico dispositivo.
- Investigacion sobre cuantizacion de mecanismos de atencion con expertos: el repositorio documenta de forma reproducible el impacto de cuantizar el router de MoVA (15,2% frente a 92,1% en HumanEval), lo que lo convierte en material de partida para estudios de sensibilidad por capa y por tensor.
- Validacion de pipelines de servicio de arquitecturas K2 Horizon: al requerir un parche especifico en el plugin de vLLM (`K2_MOVA_BF16=1`), sirve como banco de pruebas para verificar el soporte de MoVA en BF16 antes de adoptar el modelo en BF16 completo.
- Procesamiento por lotes de documentacion extensa: con 131.072 tokens por peticion y FP8 como tipo de cache KV, se pueden resumir o extraer informacion de manuales tecnicos completos sin trocear el documento.
- Comparacion de cuantizaciones en hardware heterogeneo: el autor realiza las mediciones en una CMP 170HX (GA100, sm_80, 64 GB), un perfil de hardware poco habitual que resulta representativo de GPUs de mineria reutilizadas para inferencia.

## Benchmarks y rendimiento

| Benchmark | Este checkpoint (W4A16, MoVA BF16) | GPTQ Int4 comunitario (MoVA cuantizado) |
|---|---|---|
| HumanEval pass@1 (greedy) | 92,1% (151/164) | 15,2% |
| Muestras con patron de parentesis duplicado | ninguna observada | 106/164 |
| Tamano | 35,5 GB | 21 GB |

El autor senala que el resultado de 15,2% se reprodujo de forma identica con CUDA graphs desactivados (15,9%) y con cache KV sin cuantizar (16,5%), lo que descarta ambas causas. No se han publicado resultados de otros benchmarks (MMLU, GSM8K, MATH, BLEU u otros) en la informacion disponible.

Rendimiento de inferencia medido en una sola NVIDIA CMP 170HX (GA100, sm_80, 64 GB), con `--kv-cache-dtype fp8` y 33,6 GiB de pesos residentes:

| Peticiones concurrentes (np) | 1 | 2 | 4 | 8 | 16 | 32 |
|---|---|---|---|---|---|---|
| Tokens/s agregados | 42,5 | 73,1 | 137,0 | 255,0 | 498,0 | 874,7 |

El autor indica que el rendimiento en un solo flujo esta aproximadamente un 42% por debajo de una build sparse-Marlin (que producia salidas corruptas), porque la ruta densa BF16 evalua los 64 expertos de valor en lugar de los 4 principales; una ruta de gather dispersa en BF16 recuperaria buena parte de esa diferencia, pero depende de los datos y por tanto no es segura con CUDA graphs.

## Requisitos de hardware

- Pesos: 33,6 GiB residentes en memoria de GPU con el checkpoint W4A16, ya que una parte sustancial de la red (incluido todo MoVA) permanece en BF16. El repositorio ocupa 35,5 GB en disco.
- Cache KV: aproximadamente 192 KB por token en BF16 y 96 KB por token en FP8. Para 8.192 tokens de contexto, unos 0,79 GB en FP8; para 32.768 tokens, unos 3,1 GB; para 131.072 tokens, unos 12,6 GB. El autor reporta una reserva total de 266.016 tokens de cache KV con FP8 en una GPU de 64 GB con `--gpu-memory-utilization 0.93`.
- GPU probada: una unica NVIDIA CMP 170HX (GA100, sm_80, 64 GB HBM2e). El autor no documenta otras plataformas.
- GPU recomendadas: cualquier GPU de 64 GB o mas con soporte sm_80 o superior; una H100 de 80 GB o una A100 de 80 GB son opciones holgadas. En GPUs de 48 GB (RTX A6000, L40S) los pesos dejarian del orden de 14 GB para cache KV y activaciones, lo que bastaria para contextos moderados con cache FP8, aunque no esta verificado por el autor.
- GPU de consumo: no cabe. Los 33,6 GiB de pesos excluyen tarjetas de 24 GB (RTX 4090, RTX 3090) y de 32 GB (RTX 5090); en configuraciones multigpu no se documenta particionado de este checkpoint.
- Modelo base en BF16: requiere aproximadamente 70 GB, por lo que necesita tensor parallelism de al menos 2 GPUs.
- Opciones de despliegue:
  - vLLM con el plugin fuera de arbol [k2-horizon-vllm](https://github.com/stefanskiasan/k2-horizon-vllm), mas un parche que anade la ruta BF16 para MoVA activada con `K2_MOVA_BF16=1`. Sin ese parche, el plugin upstream falla con `AttributeError: 'MergedColumnParallelLinear' object has no attribute 'qweight'`, porque asume que MoVA esta en 4 bits.
  - SGLang no es viable para este checkpoint: su ruta nativa K2 (`xllm.py`) lanza `"K2 Horizon MoVA supports unquantized bf16/fp16 weights only"` cuando `quant_config is not None`. SGLang solo sirve K2 en BF16.
  - No se mencionan soportes para llama.cpp, Ollama, TGI ni formato GGUF en la informacion disponible.
- Parametros de servicio documentados: `--trust-remote-code`, `--max-model-len 131072`, `--max-num-seqs 32`, `--gpu-memory-utilization 0.93`, `--attention-backend FLASHINFER`, `--kv-cache-dtype fp8`, `--enable-prefix-caching`.
- Coste de memoria de la ruta densa de MoVA: aproximadamente 0,13 GB de activaciones por cada 1.000 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion de MoVA | HumanEval pass@1 | Tamano | Licencia |
|---|---|---|---|---|---|---|
| Este checkpoint (schoggie W4A16) | ~37,4 B (≈4 B activos) | 524.288 | BF16 (no cuantizado) | 92,1% | 35,5 GB | Apache 2.0 |
| IFM/K2-Horizon-MoVA-36B-A4B (base) | ~37,4 B (≈4 B activos) | 524.288 | FP8 / BF16 (no cuantizado) | no disponible | ~70 GB en BF16 | Apache 2.0 |
| GPTQ Int4 comunitario de K2-Horizon | ~37,4 B (≈4 B activos) | no disponible | INT4 | 15,2% | 21 GB | no disponible |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoria (por ejemplo, MoE de tamano similar con licencia permisiva), ni de comparaciones con sus alternativas en MMLU, GSM8K u otras tareas. La comparacion se limita por tanto a las tres variantes del mismo modelo base documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint no carga en el plugin upstream de vLLM sin parche: el plugin asume `self.v_experts_fused.qweight` (MoVA en 4 bits) y lanza `AttributeError`. Es necesario aplicar el parche de la ruta BF16 (`K2_MOVA_BF16=1`).
- SGLang rechaza explicitamente cualquier K2 cuantizado, por lo que no es una via de despliegue para este checkpoint.
- La ruta densa de MoVA evalua los 64 expertos de valor en lugar de los 4 principales, lo que penaliza el rendimiento en un solo flujo en torno a un 42% frente a la build sparse-Marlin. Una ruta de gather dispersa no es compatible con CUDA graphs por depender de los datos.
- La cache KV es muy costosa: atencion completa en las 48 capas con 8 cabezas KV de 128 dimensiones, aproximadamente 6 veces mas que un modelo hibrido de tamano similar. Esto limita la longitud de contexto efectiva segun la VRAM disponible.
- El autor de la cuantizacion es un tercero (schoggie), no el equipo que entreno el modelo. No hay validacion independiente de los resultados de HumanEval ni del proceso de cuantizacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 11 de septiembre de 2026, por lo que hay poca evidencia de uso en produccion.
- No hay informacion sobre idiomas soportados, sesgos, tasas de alucinacion ni evaluacion de seguridad. Cualquier afirmacion al respecto seria especulativa.
- No se documenta soporte de tool calling ni de flujos de agentes, algo relevante si se pretende integrar el modelo en pipelines con llamadas a funciones.
- La licencia del checkpoint es Apache 2.0, heredada del modelo base, lo que en principio permite uso comercial; conviene verificar la licencia del modelo base y de sus pesos originales antes de un despliegue comercial, dado que este repositorio es una redistribucion derivada.
- El campo de idiomas no esta cumplimentado en la ficha de HuggingFace ni en la model card.
- Para despliegues en produccion hay que prever que la precision mixta (INT4 en expertos MoE y BF16 en el resto) exige motores de inferencia con soporte de `compressed-tensors` y de la arquitectura K2 Horizon; no es un checkpoint portable a cualquier runtime.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/schoggie/K2-Horizon-MoVA-36B-A4B-W4A16
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Plugin de vLLM para la arquitectura K2 Horizon: https://github.com/stefanskiasan/k2-horizon-vllm
- Resultados de busqueda web: la busqueda realizada no ha devuelto ningun enlace relevante sobre este modelo ni sobre K2 Horizon; los resultados obtenidos corresponden a contenidos sin relacion (restauracion) y se descartan. No se dispone de paper, blog o demo adicionales.
