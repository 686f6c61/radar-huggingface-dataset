# nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF es un checkpoint de borrador (*draft*) para decodificacion especulativa, publicado por NVIDIA como parte de la familia Nemotron-3.5-Bolt. No es un modelo de lenguaje autonomo: propone candidatos de tokens que el modelo objetivo verifica, y es el objetivo quien produce el texto visible para el usuario. El checkpoint implementa el metodo LiLiCorr (Lightweight Likelihood Correlation of Parallel Drafts), descrito en el paper arXiv:2608.20530, y esta cuantizado con NVIDIA Model Optimizer.

El borrador tiene 1.113 millones de parametros (1.112.828.867 segun los pesos safetensors publicados), de los cuales 37 millones corresponden a la cabeza LiLiCorr de dos capas. Se distribuye en formato GGUF, con un repositorio de 1,0 GB, y esta pensado para emparejarse con el objetivo nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF, un modelo hibrido LatentMoE de vision-lenguaje con 74.000 millones de parametros totales, 9.000 millones activos y 256K tokens de contexto.

Su relevancia es practica: la decodificacion especulativa es una de las pocas tecnicas que reduce la latencia de inferencia sin alterar la distribucion de salida del modelo objetivo, y este checkpoint permite aplicarla sobre un objetivo ya cuantizado a un perfil de memoria de aproximadamente 24 GB (segun la nomenclatura del repositorio). El modelo se libera bajo licencia OpenMDW-1.1 y esta declarado como apto para uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense GQA (MLP denso + atencion GQA) en el borrador; objetivo hibrido LatentMoE vision-lenguaje |
| Parametros totales | 1.112.828.867 (borrador, ~1,113B), excluyendo embeddings compartidos del objetivo y la LM head |
| Parametros activos | 9B en el modelo objetivo (74B totales, 9B activos); el borrador es denso, no MoE |
| Longitud de contexto | 256K tokens en el modelo objetivo (maximo declarado); el borrador usa ventana deslizante de 1024 tokens por cabeza |
| Tipos de cuantizacion | GGUF cuantizado con NVIDIA Model Optimizer (commit b5f10f8); niveles concretos no disponibles |
| Idiomas soportados | El objetivo declara: ingles, frances, espanol, italiano, aleman, japones, hindi, coreano, portugues de Brasil y chino. El borrador no declara idiomas propios |
| Licencia | OpenMDW-1.1 (campo `license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (libreria `gguf`); el borrador de referencia BF16 del objetivo esta en safetensors |

## Arquitectura y entrenamiento

El borrador es una red densa de cinco capas feed-forward con atencion de consultas agrupadas (GQA, *grouped-query attention*). La atencion dentro del bloque de borrador es bidireccional. Las cinco capas emplean una ventana deslizante de 1024 tokens por cabeza junto con *attention sinks*, y cada subcapa de atencion y MLP va envuelta por una convolucion dinamica agrupada. Sobre esta base se anade una cabeza LiLiCorr independiente de dos capas que correlaciona los ocho mejores candidatos del borrador en cada ranura de borradorado; esa cabeza aporta 37M de los 1.113B parametros. El modelo objetivo con el que se empareja es un LatentMoE hibrido de vision-lenguaje con 74B totales y 9B activos.

El checkpoint es una version de decodificacion especulativa cuantizada con Model Optimizer (commit b5f10f8). La model card remite al *target card* para los detalles de entrenamiento del objetivo y no aporta datos propios sobre volumen de tokens, composicion del corpus ni si el borrador se entreno de forma supervisada sobre trazas del objetivo o mediante destilacion. Las fuentes de datos citadas corresponden al entrenamiento del objetivo: Nemotron-Post-Training-Dataset-v2, Nemotron-RL-Super-Training-Blends, Nemotron-Post-Training-v3, Nemotron-Instruction-Following-Chat-v1 y Nemotron-Science-v1, con la nota de que solo se usaron prompts y contexto de conversacion para la sintesis de datos. No se especifica en la informacion disponible si hubo RLHF, DPO u otra fase de alineamiento especifica para el borrador.

La innovacion tecnica principal es LiLiCorr, que correlaciona las probabilidades de multiples borradores paralelos en lugar de limitarse a una unica trayectoria de borradorado; el paper de referencia es arXiv:2608.20530.

## Capacidades

- El borrador no genera texto visible por si mismo: propone tokens candidatos que el objetivo verifica. La salida final la produce el modelo objetivo.
- Aceleracion de generacion de texto mediante decodificacion especulativa cuando se empareja con nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF.
- El objetivo asociado soporta razonamiento (trazas de cadena de pensamiento), chat, generacion aumentada por recuperacion (RAG), comprension visual y flujos de trabajo de agentes.
- Salida en formato JSON y soporte de *tool calling* / llamada a funciones en el objetivo.
- Soporte de razonamiento multi-paso y agentes en el objetivo.
- Capacidades multilingues heredadas del objetivo: diez idiomas declarados (ingles, frances, espanol, italiano, aleman, japones, hindi, coreano, portugues de Brasil y chino).
- Modo de razonamiento explicito con trazas de pensamiento y datos estructurados en la salida del objetivo.

## Casos de uso

- Reduccion de latencia en produccion sobre el objetivo de 24 GB: emparejar este borrador con Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF para servir el mismo texto que el objetivo con menos pasos de decodificacion, util en endpoints interactivos donde el tiempo hasta el primer token y el tiempo por token son criticos.
- Despliegue en hardware de gama de estacion de trabajo: al estar disenado para un objetivo de perfil ~24 GB y ser compatible con llama.cpp, permite montar un asistente de razonamiento local en una GPU consumer de 24 GB sin recurrir a un cluster.
- Inferencia en el borde con DGX Spark (GB10): la model card declara compatibilidad con la microarquitectura NVIDIA Blackwell, incluida DGX Spark, lo que habilita asistentes de razonamiento en un equipo compacto.
- Atencion al cliente automatizada con contexto largo: el objetivo admite hasta 256K tokens, de modo que el par borrador-objetivo puede gestionar conversaciones multi-turno con historial extenso y documentos de referencia sin truncar.
- Agentes con tool calling: el objetivo emite JSON y llamadas a herramientas, y la decodificacion especulativa reduce el coste por paso en bucles de agente con muchos turnos encadenados.
- Analisis de documentos con componentes visuales: el objetivo es un modelo vision-lenguaje, por lo que el par puede emplearse en extraccion de datos de capturas, diagramas o formularios junto con razonamiento sobre el contenido.
- Generacion de codigo asistida en pipelines de CI/CD: con `tool calling` y salida estructurada, el objetivo puede invocarse desde integraciones de revision de codigo o generacion de parches, usando el borrador para amortiguar el coste de las generaciones largas.
- RAG sobre corpus tecnicos multilingues: la cobertura de diez idiomas del objetivo permite indexar y consultar documentacion en varios idiomas manteniendo una unica pila de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de tasa de aceptacion de tokens, factor de aceleracion ni comparaciones de latencia frente a la decodificacion autoregresiva estandar del objetivo. Tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de vision para el modelo objetivo en la informacion proporcionada.

## Requisitos de hardware

- Borrador: 1.113B parametros y un repositorio de 1,0 GB en GGUF; su huella en VRAM es muy inferior a la del objetivo y cabe holgadamente en cualquier GPU consumer moderna.
- Objetivo: la nomenclatura del repositorio indica un perfil de aproximadamente 24 GB para el objetivo cuantizado, de modo que el conjunto borrador mas objetivo deberia caber en GPU de 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090), asumiendo que el resto del presupuesto de memoria se reserve para cache KV.
- GPU recomendadas: NVIDIA Blackwell, incluida DGX Spark (GB10), segun la model card. Para el objetivo de 24 GB son razonables tambien A100 de 40/80 GB, H100 y L40S si se quiere margen para contexto largo y lotes mayores.
- Compatibilidad consumer: si cabe en GPU consumer, segun el perfil de 24 GB del objetivo; no se especifica si cabe en GPU de 16 GB o menos.
- Opciones de despliegue: llama.cpp es el unico motor declarado explicitamente como soportado. No se mencionan vLLM, TGI, TensorRT-LLM ni Ollama en la informacion disponible.
- Sistemas operativos preferidos: Linux y Windows.
- Latencia y throughput: no disponibles. La model card afirma que el borrador acelera la generacion mediante decodificacion especulativa, pero no cuantifica el factor de aceleracion ni la tasa de aceptacion.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este checkpoint con los otros miembros de la propia familia Nemotron-3.5-Bolt. Los datos de modelos comparables de otros fabricantes (por ejemplo, asistentes de decodificacion especulativa tipo EAGLE o Medusa) no se incluyen en la informacion proporcionada.

| Modelo | Rol | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF (este) | Borrador especulativo LiLiCorr | 1,113B (borrador), 37M en la cabeza LiLiCorr | 256K heredados del objetivo | GGUF | OpenMDW-1.1 |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF | Objetivo cuantizado | 74B totales / 9B activos | 256K | GGUF | OpenMDW-1.1 |
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | Objetivo de referencia en precision completa | 74B totales / 9B activos | 256K | safetensors (BF16) | no disponible en la informacion proporcionada |
| Asistentes de decodificacion especulativa de terceros | Borrador alternativo | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: no puede usarse para generar texto por si solo. Requiere el objetivo compatible para verificar los candidatos y producir la salida final.
- El repositorio no incluye el modelo objetivo; desplegarlo exige descargar y servir por separado nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF.
- Cualquier sesgo, riesgo de alucinacion o limitacion de conocimiento del texto generado proviene del modelo objetivo, no del borrador. La model card no detalla sesgos conocidos ni tasas de alucinacion.
- Los idiomas declarados corresponden al objetivo; el borrador no declara cobertura linguistica propia, de modo que el comportamiento del borradorado en idiomas distintos del ingles no esta documentado.
- La longitud de contexto de 256K es una propiedad del objetivo. La atencion del borrador usa una ventana deslizante de 1024 tokens por cabeza, por lo que la calidad del borradorado en contextos muy largos no esta cuantificada en la informacion disponible.
- Uso comercial: la model card declara que el modelo esta listo para uso comercial y no comercial bajo OpenMDW-1.1 (https://openmdw.ai/license/1-1/). Conviene revisar los terminos completos de esa licencia, ya que el campo `license` aparece como `other`.
- El unico motor declarado es llama.cpp; no hay confirmacion de soporte para vLLM, TGI u otros servidores de inferencia.
- No se publican cifras de tasa de aceptacion ni de aceleracion, por lo que el beneficio real de latencia debe medirse en el caso de uso concreto antes de dimensionar infraestructura.
- NVIDIA advierte en la model card de que la integracion de modelos en sistemas de IA requiere pruebas adicionales con datos especificos del caso de uso y validacion siguiendo una metodologia en V antes del despliegue.
- Existe una discrepancia aparente entre el nombre del repositorio (74B-A9B-24GB) y el contenido real del checkpoint (1,113B parametros y 1,0 GB); el nombre describe la familia y el objetivo, no el borrador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF
- Modelo objetivo en GGUF: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Modelo objetivo de referencia en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Paper LiLiCorr (arXiv:2608.20530): https://arxiv.org/abs/2608.20530
- NVIDIA Model Optimizer (repositorio): https://github.com/NVIDIA/Model-Optimizer
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset Nemotron-RL-Super-Training-Blends: https://huggingface.co/datasets/nvidia/Nemotron-RL-Super-Training-Blends
- Coleccion Nemotron-Post-Training-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Dataset Nemotron-Instruction-Following-Chat-v1: https://huggingface.co/datasets/nvidia/Nemotron-Instruction-Following-Chat-v1
- Dataset Nemotron-Science-v1: https://huggingface.co/datasets/nvidia/Nemotron-Science-v1
