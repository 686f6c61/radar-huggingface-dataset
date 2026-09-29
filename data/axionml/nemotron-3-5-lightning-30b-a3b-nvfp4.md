# AxionML/Nemotron-3.5-Lightning-30B-A3B-NVFP4

## Resumen

AxionML/Nemotron-3.5-Lightning-30B-A3B-NVFP4 es un espejo (mirror) del checkpoint cuantizado en NVFP4 publicado por NVIDIA para su modelo Nemotron 3.5 Lightning. Se trata de un LLM con arquitectura hibrida de tipo Mixture-of-Experts que combina capas Mamba-2 con capas MoE y capas de atencion seleccionadas, y que incorpora prediccion multi-token (MTP) integrada. El modelo declara 30B parametros totales con solo 3B activos por token, lo que lo situa en la categoria de modelos "grandes en capacidad, pequenos en coste de inferencia".

El repositorio de AxionML no introduce modificaciones: es una copia sin alterar del checkpoint de NVIDIA (revision bee7596271d1495f6992ae224aefde4410e816b8), redistribuida para facilitar su despliegue con SGLang y vLLM. Su relevancia actual reside en que permite servir un modelo de 1M de tokens de contexto en una sola GPU, con licencia OpenMDW-1.1 que autoriza uso comercial, y con recetas de decodificacion especulativa ya publicadas (MTP, DSpark, DFlash) para reducir latencia.

La cuantizacion NVFP4 es el elemento diferencial: usa un codebook E2M1 de 4 bits con escalas por bloques de 16 elementos en FP8 (E4M3), en lugar de escalas de potencia de dos, y acumulacion en FP32 en los Tensor Cores. El checkpoint ocupa aproximadamente 22 GB, frente a los ~60 GB que requeriria la version BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida MoE: Mamba-2 + MoE + atencion, con MTP |
| Parametros totales | 30B declarados por la model card; el recuento de safetensors de HuggingFace indica 17.820.210.764 (~17,8B). Discrepancia no explicada en la informacion disponible |
| Parametros activos | 3B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (Four-Over-Six, W4A16 en expertos enrutados y compartidos), escalas FP8 por tensor dinamicas en Mamba in_proj/out_proj, cache KV en FP8. Calibracion MSE estatica |
| Idiomas soportados | Ingles y lenguajes de programacion como idiomas principales; espanol, frances, aleman, italiano y japones tambien soportados |
| Licencia | OpenMDW-1.1 (la model card la declara como "other" con license_name openmdw-1.1) |
| Formato de pesos | safetensors (libreria transformers; tamano del repo 21,6 GB, checkpoint ~22 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido con capas Mamba-2 y capas MoE intercaladas, mas un subconjunto de capas de atencion completa. Los expertos (enrutados y compartidos) estan cuantizados en NVFP4 con esquema Four-Over-Six y calibracion estatica de tipo MSE, mientras que las proyecciones in_proj y out_proj de los bloques Mamba mantienen precision FP8 con escalas dinamicas por tensor. La cache KV tambien se almacena en FP8. La cuantizacion se realizo con NVIDIA Model Optimizer sobre 1.000 muestras de 32K tokens procedentes de un subconjunto de validacion de Nemotron Ultra.

La innovacion tecnica principal es doble. Por un lado, NVFP4 combina un codebook E2M1 (magnitudes representables hasta mas o menos 6, con saturacion en lugar de codificaciones IEEE NaN/Inf) con escalas por micro-bloques de 16 elementos en FP8 E4M3, lo que permite escalas fraccionarias y seleccion de escala con minimo error; los multiplicadores FP4 nativos de los Tensor Cores de Blackwell se apoyan en acumulacion FP32. Por otro lado, el modelo integra MTP para decodificacion especulativa y NVIDIA publica ademas drafters separados DSpark y DFlash. No se han facilitado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno con ventana de hasta 1.000.000 de tokens.
- Razonamiento explicito: la model card cita resultados en GPQA Diamond, HLE, AA-LCR y PinchBench, y las recetas de despliegue incluyen un parser de razonamiento (`nemotron_3` / `nemotron_v3`).
- Generacion y edicion de codigo en repositorios reales: evaluado en SWE-bench Verified, SWE-bench Multilingual y SciCode.
- Uso de terminal y tareas de agente en entorno de shell: evaluado en Terminal-Bench 2.1.
- Tool calling / function calling estructurado, con parser de tool calls `qwen3_coder` y soporte de `--enable-auto-tool-choice` en vLLM.
- Flujos agenticos de largo recorrido, incluida navegacion web (BrowseComp) y seguimiento de instrucciones (IFBench).
- Despliegue como sub-agente o modelo local en hardware de una sola GPU, con decodificacion especulativa integrada (MTP) o externa (DSpark, DFlash).
- Capacidades multilingues limitadas: ingles y codigo como idiomas principales, con soporte adicional de espanol, frances, aleman, italiano y japones.
- No se menciona soporte de vision, audio ni otras modalidades.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 1M tokens permite mantener el historial completo de una conversacion larga o cargar documentacion de producto extensa sin troceado agresivo, y el modelo cabe en una sola GPU para despliegues por instancia.
- Agentes autonomos de larga duracion: el diseno para "long-running agents" y la ventana extendida permiten mantener estado de tareas multi-paso con muchas llamadas a herramientas sin perder contexto; el soporte de tool calling con parser dedicado facilita la integracion con frameworks de agentes.
- Agentes de codigo en CI/CD: con SWE-bench Verified reportado en 52,80 en NVFP4, el modelo es adecuado para reparar tests fallidos, resolver issues etiquetados o revisar pull requests dentro de un pipeline automatizado.
- Automatizacion de operaciones en terminal: Terminal-Bench 2.1 mide ejecucion de tareas en shell; el modelo puede pilotar sesiones interactivas de administracion de sistemas con verificacion de resultados.
- Analisis de repositorios y bases de codigo extensas: la combinacion de contexto de 1M tokens y buen rendimiento en SWE-bench Multilingual permite indexar y razonar sobre monorepos grandes en una sola pasada.
- Procesamiento de documentos largos con preguntas y respuestas: AA-LCR evalua comprension de contexto largo; el caso tipico es revision contractual, analisis de informes tecnicos o extraccion estructurada sobre expedientes completos.
- Investigacion asistida con busqueda web: BrowseComp mide la capacidad de localizar informacion poco accesible; se puede desplegar como componente de un sistema RAG agentico que combine busqueda y sintesis.
- Inferencia local con requisitos de privacidad: al ocupar ~22 GB y requerir una sola GPU (la model card cita DGX Spark GB10, H100 y RTX 5090), encaja en estaciones de trabajo y nodos de borde donde no es viable enviar datos a la nube.

## Benchmarks y rendimiento

Resultados publicados por NVIDIA (NeMo Gym / NeMo Evaluator), comparando la version BF16 con el checkpoint NVFP4:

| Benchmark | BF16 | NVFP4 |
|---|---|---|
| MMLU Pro | 81,94 | 81,62 |
| GPQA Diamond (sin herramientas) | 75,44 | 75,57 |
| HLE (solo texto) | 11,72 | 10,47 |
| SciCode | 32,60 | 31,38 |
| SWE-bench Verified | 51,56 | 52,80 |
| SWE-bench Multilingual | 39,33 | 36,47 |
| Terminal-Bench 2.1 | 24,58 | 23,46 |
| PinchBench | 85,37 | 83,43 |
| BrowseComp | 36,97 | 36,81 |
| IFBench (loose) | 71,88 | 72,88 |
| AA-LCR | 52,00 | 49,19 |

Configuracion de muestreo recomendada: `temperature=1.0`, `top_p=0.95`. La degradacion respecto a BF16 es inferior a 3 puntos en la mayoria de tareas, con mejoras puntuales en GPQA Diamond, SWE-bench Verified e IFBench. No se han publicado datos de throughput ni latencia en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos: ~22 GB en NVFP4 (21,6 GB de repositorio). Es una estimacion en disco; en VRAM hay que sumar cache KV en FP8 y activaciones.
- GPU citadas explicitamente por la model card para despliegue en una sola GPU: 1x DGX Spark (GB10), 1x H100 y RTX 5090.
- Recetas oficiales: SGLang sobre 1x B200 (imagen `lmsysorg/sglang:dev-nemotron3-5-lightning`) y vLLM sobre DGX Spark (imagen `vllm/vllm-openai:v0.27.1`).
- Aceleracion nativa de FP4: los multiplicadores FP4 forman parte de los Tensor Cores de la generacion Blackwell. La receta de vLLM usa `--moe-backend marlin`, lo que indica que existe una ruta de ejecucion con backend alternativo; no se especifica el rendimiento en arquitecturas no Blackwell.
- GPU de consumo: RTX 5090 (32 GB) figura como plataforma soportada. Para RTX 4090 (24 GB) no hay confirmacion en la informacion disponible; el margen sobre los ~22 GB de pesos es estrecho una vez anadida cache KV.
- Opciones de despliegue documentadas: SGLang (con `--mamba-backend flashinfer`, `--mamba-ssm-dtype float16`, `--enable-mamba-cache-stochastic-rounding`, `--mamba-cache-philox-rounds 5`, `--mem-fraction-static 0.85`) y vLLM (con `--kv-cache-dtype fp8`, `--enable-prefix-caching`, `--gpu-memory-utilization 0.85`, `--mamba-backend flashinfer`, `--mamba-cache-mode align`). El modelo tambien aparece en NVIDIA NIM.
- Decodificacion especulativa: MTP integrado, activable en SGLang mediante `--speculative-algorithm EAGLE --speculative-num-steps 5 --speculative-eagle-topk 1 --speculative-num-draft-tokens 6`; en vLLM mediante `--speculative_config.model nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark --speculative_config.num_speculative_tokens 3`. Se mencionan ademas drafters DFlash.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AxionML Nemotron-3.5-Lightning-30B-A3B-NVFP4 (este) | 30B declarados / ~17,8B en safetensors | 3B | 1M tokens | Ver tabla de benchmarks (NVFP4) | OpenMDW-1.1 | HuggingFace, espejo de NVIDIA |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B | 3B | 1M tokens | Identico (mismos pesos) | OpenMDW-1.1 | HuggingFace, repositorio upstream |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B | 3B | 1M tokens | Ver columna BF16 de la tabla | OpenMDW-1.1 | HuggingFace, repositorio upstream |
| Modelos MoE de ~30B totales y ~3B activos de otros fabricantes (por ejemplo, la familia Qwen3-30B-A3B) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo no aporta diferencias funcionales respecto al checkpoint upstream de NVIDIA: es una copia byte a byte redistribuida. La eleccion entre ambos es logistica (disponibilidad del repositorio), no tecnica. Frente a la version BF16, NVFP4 reduce el espacio de pesos de aproximadamente 60 GB a 22 GB con una perdida media inferior a 3 puntos en los benchmarks publicados.

## Limitaciones y advertencias

- Sesgos: el modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales; el checkpoint cuantizado hereda esas caracteristicas.
- Alucinacion: la model card advierte explicitamente de que el modelo puede generar contenido inexacto, sesgado u ofensivo. No se documentan mecanismos de mitigacion.
- Idiomas: el soporte principal es ingles y lenguajes de programacion; el resto de idiomas (espanol, frances, aleman, italiano, japones) se describen como soporte adicional, sin benchmarks de calidad por idioma.
- Idiomas no listados: no hay confirmacion de soporte para otras lenguas, incluido el catalan, el gallego o el euskera.
- Cuantizacion: la degradacion es pequena en agregado, pero alcanza 2,86 puntos en SWE-bench Multilingual y 2,81 puntos en AA-LCR respecto a BF16. En tareas de codigo multilingue y contexto largo conviene validar el comportamiento antes de produccion.
- Dependencia de hardware: el formato NVFP4 esta disenado para Tensor Cores Blackwell; en otras arquitecturas el rendimiento y la ruta de ejecucion dependen del backend empleado (`marlin` en la receta de vLLM) y no se documentan cifras.
- Contexto de 1M tokens: no se detallan estrategias de extrapolacion, coste de atencion ni degradacion efectiva a longitudes extremas. La cache KV en FP8 tambien introduce un error adicional no cuantificado en la informacion disponible.
- Licencia: OpenMDW-1.1 permite uso comercial y no comercial segun la propia model card, pero es una licencia especifica de NVIDIA que conviene revisar en el enlace oficial antes de integrarla en un producto.
- Procedencia: al ser un espejo de terceros, la verificacion de integridad de los pesos (hash de revision `bee7596271d1495f6992ae224aefde4410e816b8`) es responsabilidad de quien lo despliega.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con fechas de creacion y actualizacion muy proximas entre si; no hay historial de uso comunitario que sirva como validacion independiente.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/AxionML/Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Checkpoint NVFP4 upstream de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Cookbook de uso (NVIDIA-NeMo): https://github.com/NVIDIA-NeMo/Nemotron/tree/main/usage-cookbook/Nemotron-3.5-Lightning
- Herramienta de cuantizacion NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Espejo adicional del mismo checkpoint: https://huggingface.co/lactroiii/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Ficha en SourceForge: https://sourceforge.net/projects/nemotron-3-5-lightning/
