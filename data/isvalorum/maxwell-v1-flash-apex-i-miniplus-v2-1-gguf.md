# IsValorum/Maxwell-V1-Flash-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Maxwell-V1-Flash-APEX-I-MiniPlus-V2.1-GGUF es una cuantizacion GGUF del modelo base `maxwell-model/Maxwell-V1-Flash`, publicada por el usuario independiente IsValorum dentro de su serie "APEX Quantization". No se trata de un modelo entrenado desde cero, sino de una conversion a formatos de baja precision (Q3_K, IQ3_XXS, IQ4_XS, Q4_K, Q5_K y Q6_K) orientada a su ejecucion local mediante llama.cpp. El modelo base emplea una arquitectura denominada `maxwell-moe` (mezcla de expertos) con aproximadamente 35.970 millones de parametros totales, segun los datos de safetensors del repositorio.

La relevancia de esta publicacion reside en su estrategia de cuantizacion "quirurgica": en lugar de aplicar una precision uniforme, asigna distintos tipos de cuantizacion a cada grupo de tensores (proyecciones de atencion, MLP densa, expertos compartidos y expertos enrutados) con el objetivo de preservar la calidad en las capas mas sensibles. Ademas, utiliza una matriz de importancia (imatrix) calculada sobre 4.766.918 tokens para guiar la cuantizacion. El repositorio ocupa 15,4 GB y esta publicado bajo licencia Apache 2.0.

El modelo esta pensado para inferencia local en llama.cpp y para integrarse en el agente de escritorio V-Agent del mismo autor. Al tratarse de una cuantizacion de una version muy reciente (creada en noviembre de 2026) y sin descargas ni valoraciones registradas, la informacion disponible sobre capacidades, benchmarks e idiomas es muy limitada; los apartados correspondientes se completan indicando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `maxwell-moe` (mezcla de expertos, transformer con expertos enrutados y compartidos) |
| Parametros totales | 35.970.737.539 (~36 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K, IQ3_XXS, IQ3_S, IQ4_XS, Q4_K, Q5_K, Q6_K (mezcla por tensor); protecciones recurrentes en F32 (271 tensores) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); origen de cuantizacion en BF16 |
| Tamano del repositorio | 15,4 GB |
| Imatrix | `AtomicChat/Maxwell-V1-Flash-GGUF-metrics imatrix/imatrix.gguf`, 4.766.918 tokens |
| Modelo base | `maxwell-model/Maxwell-V1-Flash` |

## Arquitectura y entrenamiento

La arquitectura del modelo base es de tipo mezcla de expertos (`maxwell-moe`), con 45 bloques (`blk.0` a `blk.44`) segun el mapa de tensores auditado del GGUF. La estructura revelada por ese mapa indica una combinacion de capas densas iniciales (bloques 0 a 2, con proyecciones `ffn_down`, `ffn_gate` y `ffn_up` convencionales) seguidas de bloques con expertos compartidos (`ffn_*_shexp`, presentes en los bloques 3 a 44) y expertos enrutados (`ffn_*_exps`, en los bloques 3 a 44). Cada bloque incluye proyecciones de atencion `attn_q`, `attn_k`, `attn_v` y `attn_output`. El repositorio menciona "protecciones recurrentes" en F32 sobre 271 tensores, lo que sugiere la presencia de componentes de tipo recurrente o de estado que se mantienen en alta precision para evitar degradacion.

Respecto al entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), no se dispone de informacion en la documentacion proporcionada. La innovacion tecnica destacable de esta publicacion es la cuantizacion por capas: las proyecciones de atencion de salida (`attn_output`) y `output.weight` se mantienen en Q6_K; las proyecciones `attn_q`, `attn_k`, `attn_v` y los embeddings en Q4_K; los expertos compartidos en Q5_K; y los expertos enrutados en Q3_K o IQ3_XXS segun el bloque (los bloques centrales 13 a 34 reciben la cuantizacion mas agresiva, IQ3_XXS, mientras que los bloques 3 a 12 y 35 a 44 usan Q3_K). La matriz de importancia se calculo sobre 4.766.918 tokens para guiar la asignacion de bits.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: `text-generation`, etiqueta `conversational`).
- Razonamiento y generacion de codigo: no confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: la model card promociona su uso dentro de V-Agent, agente de escritorio con siete servidores MCP (ficheros, comandos, busqueda web, navegador autonomo, herramientas de escritorio, descargas HTTP y Hugging Face), lo que implica compatibilidad con flujos de agente, aunque no se detallan las capacidades nativas del modelo para ello.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local en llama.cpp con backend CUDA, Vulkan o CPU.

## Casos de uso

- Asistencia conversacional local: el modelo puede gestionar dialogos multi-turno en un equipo de escritorio mediante llama.cpp, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Agente de escritorio con herramientas: integrado en V-Agent, puede orquestar los siete servidores MCP (lectura de ficheros, ejecucion de comandos, busqueda web, navegacion autonoma) para tareas como resumir documentos locales o descargar y verificar modelos desde Hugging Face.
- Prototipado de aplicaciones con modelos MoE: util para desarrolladores que quieran evaluar el comportamiento de una arquitectura de mezcla de expertos de ~36 B en hardware de consumo antes de comprometerse con despliegues mayores.
- Generacion de texto en pipelines por lotes: su formato GGUF permite ejecutarlo con llama.cpp en CPU o GPU para tareas de generacion de texto por lotes donde la latencia no sea critica.
- Experimentacion con tecnicas de cuantizacion: el mapa de tensores auditado y la imatrix publicada lo convierten en un caso de estudio para investigar el impacto de la cuantizacion por capas en modelos MoE.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: con 15,4 GB de pesos, puede ejecutarse en equipos con suficiente memoria RAM o VRAM, sirviendo como asistente local para redaccion o consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos ocupan 15,4 GB; para inferencia completa se recomienda al menos 16 GB de VRAM (o memoria unificada) para cargar el modelo en GPU, o bien 16-24 GB de RAM si se ejecuta en CPU con offload parcial.
- GPU recomendadas: no hay datos especificos del autor; por tamano, encaja en GPU de 24 GB (RTX 3090, RTX 4090) con margen para contexto, y en GPU profesionales (A100 40 GB, H100) para mayor velocidad y ventana de contexto.
- GPU de consumo: si cabe en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) con contexto reducido; en tarjetas de 12 GB requeriria offload parcial a RAM.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), V-Agent (motor llama.cpp integrado), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Maxwell-V1-Flash-APEX-I-MiniPlus-V2.1 | ~36 B (MoE) | no disponible | Apache 2.0 | GGUF (15,4 GB) | Cuantizacion por capas con imatrix |
| Maxwell-V1-Flash-APEX-I-NanoPlus-V2.1 | no disponible | no disponible | Apache 2.0 | GGUF (12,08 GiB) | Variante mas pequena de la misma familia |
| Modelos MoE de ~30-40 B de otros autores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La unica comparacion directa disponible es la variante NanoPlus de la misma familia (12,08 GiB frente a 14,31 GiB de MiniPlus). No se dispone de datos de rendimiento para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo original: la calidad final depende del modelo base y de la perdida introducida por la cuantizacion, especialmente en los expertos enrutados de los bloques centrales, cuantizados a IQ3_XXS.
- No hay descargas ni valoraciones registradas (0 descargas, 0 likes), por lo que no existe validacion comunitaria de su calidad.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma del modelo base.
- La longitud de contexto no esta documentada; no debe asumirse una ventana amplia sin verificacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `maxwell-model/Maxwell-V1-Flash` antes de un despliegue en produccion.
- El modelo esta pensado para llama.cpp; otros runtimes pueden no soportar la arquitectura `maxwell-moe` o las protecciones en F32.
- La model card incluye promocion de V-Agent y de donaciones; es material del autor y no constituye una evaluacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/IsValorum/Maxwell-V1-Flash-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Variante NanoPlus: https://huggingface.co/IsValorum/Maxwell-V1-Flash-APEX-I-NanoPlus-V2.1-GGUF
- Repositorio V-Agent: https://github.com/IsValorum/V-Agent
- Releases de V-Agent: https://github.com/IsValorum/V-Agent/releases
- Arquitectura de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/docs/ARCHITECTURE.md
- Licencia de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/LICENSE
- Apoyo al autor: https://ko-fi.com/isvalorum
