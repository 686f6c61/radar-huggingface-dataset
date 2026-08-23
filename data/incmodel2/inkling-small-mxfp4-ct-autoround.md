# INCModel2/Inkling-Small-MXFP4-CT-AutoRound

## Resumen

Inkling-Small-MXFP4-CT-AutoRound es una cuantizacion en formato MXFP4 (4 bits con escala microscaling) del modelo multimodal Inkling-Small de Thinking Machines Lab, generada por el equipo INCModel2 mediante la herramienta intel/auto-round en modo RTN (Round-To-Nearest). El modelo original, Inkling-Small, es un Mixture-of-Experts de 276 mil millones de parametros con 12 mil millones de parametros activos por token, entrenado por Thinking Machines Lab y liberado bajo licencia Apache-2.0. Esta version cuantizada reduce el peso del checkpoint de unos 532 GB en BF16 a 153,5 GB, lo que permite desplegarlo en un numero menor de GPUs de alta gama sin perdidas significativas de precision.

El modelo es multimodal nativo: acepta imagenes, texto y audio como entrada, y genera texto. Soporta razonamiento explicito (thinking mode), tool calling y ejecucion de agentes, y esta disenado para servir con vLLM mediante un tokenizer y parsers especificos de la familia Inkling. La cuantizacion MXFP4 mantiene la precision en benchmarks de matematicas y razonamiento, con ratios de rendimiento respecto a la version NVFP4 entre 0,997 y 1,013, lo que la convierte en una opcion viable para despliegues en produccion con multiples GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal nativo |
| Parametros totales | 265.956.439.090 (aprox. 266B) |
| Parametros activos | 12 mil millones (12B) por token |
| Longitud de contexto | 102.400 tokens (configuracion de ejemplo en vLLM) |
| Tipos de cuantizacion | MXFP4 (4 bits con escala microscaling), capas en BF16 (atencion, embeddings, router, normalizacion, componentes multimodales y capas 0-2) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (se debe respetar la licencia del modelo original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Inkling-Small, es un transformador MoE con arquitectura de mezcla de expertos que activa 12 mil millones de parametros por token de los 276 mil millones totales. Es multimodal nativo: procesa imagenes, audio y texto con el mismo modelo, sin modulos externos de vision o audio. La cuantizacion MXFP4 se aplica exclusivamente a las capas de expertos del MLP, mientras que las capas de atencion, los pesos del router, los embeddings, las normalizaciones, los componentes multimodales y los pesos de MTP (Multi-Token Prediction) se mantienen en BF16 para preservar la precision. El metodo de cuantizacion es RTN (Round-To-Nearest) implementado en intel/auto-round, sin reentrenamiento posterior. El checkpoint de la cuantizacion se publica en formato safetensors con licencia Apache-2.0.

## Capacidades

- Generacion de texto multimodal: acepta imagenes, texto y audio como entrada y genera texto.
- Razonamiento explicito (thinking mode): soporta un modo de razonamiento previo a la respuesta, configurable mediante el parametro `enable_thinking` y `reasoning_effort` en la plantilla de chat.
- Tool calling y function calling: integra un parser de herramientas especifico de Inkling (`--tool-call-parser inkling`) compatible con vLLM.
- Capacidades de agente: permite encadenar llamadas a herramientas y razonamiento multi-paso en un mismo contexto.
- Multilingue: no disponible la lista de idiomas soportados.
- Rendimiento en matematicas y razonamiento: mantiene resultados en benchmarks como AIME25, GPQA Diamond, GSM8K y PIQA tras la cuantizacion.

## Casos de uso

- Razonamiento avanzado en investigacion: el modo thinking con `reasoning_effort: max` permite resolver problemas de matematicas y logica de alto nivel, como los planteados en AIME25 y GPQA Diamond, por lo que es adecuado para asistentes de investigacion cientifica y educacion superior.
- Generacion de codigo en produccion: con tool calling y contexto de 102.400 tokens, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de pruebas y refactorizacion, manteniendo el estado completo del repositorio en memoria.
- Asistentes multimodales de atencion al cliente: procesa imagenes (capturas, diagramas) y texto en conversaciones multi-turno, lo que permite resolver incidencias tecnicas con evidencia visual sin perder contexto.
- Analisis de documentos cientificos y tecnicos: el contexto largo permite cargar articulos completos o informes extensos y extraer conclusiones, resumenes o comparativas con razonamiento explicito.
- Agentes de automatizacion de tareas: con tool calling y razonamiento multi-paso, puede orquestar llamadas a APIs, bases de datos y servicios externos en un bucle de agente.
- Despliegue de bajo coste de un modelo de 266B: la cuantizacion MXFP4 reduce el checkpoint a 153 GB, permitiendo servir un modelo de capacidad 266B en un nodo con 4 GPUs de alta capacidad (p. ej. H100 80GB) en lugar de un cluster grande.

## Benchmarks y rendimiento

La model card incluye resultados de evaluacion (repeats=3) comparando la version MXFP4 con la version NVFP4 del mismo modelo base:

| Benchmark | Inkling-Small-NVFP4 | Inkling-Small-MXFP4 | Ratio MXFP4/NVFP4 |
|---|---|---|---|
| AIME25 | 0,900 | 0,911 | 1,0123 |
| GPQA Diamond | 0,8737 | 0,8855 | 1,0135 |
| GSM8K | 0,9727 | 0,9699 | 0,9971 |
| PIQA | 0,9447 | 0,9452 | 1,0006 |

La cuantizacion MXFP4 mantiene o mejora ligeramente el rendimiento respecto a la version NVFP4 en AIME25 y GPQA Diamond, con una perdida minima en GSM8K (0,3 %) y practicamente nula en PIQA. No se dispone de resultados del modelo BF16 original en la informacion proporcionada.

## Requisitos de hardware

- Peso del checkpoint: 153,5 GB en formato safetensors cuantizado MXFP4.
- VRAM estimada: con cuantizacion MXFP4, el modelo requiere al menos 160-180 GB de VRAM para inferencia, por lo que necesita multiples GPUs. El ejemplo de vLLM usa 4 GPUs con `tensor-parallel-size 4` y `CUDA_VISIBLE_DEVICES=3,4,5,7`, lo que sugiere GPUs de 80 GB (p. ej. H100 o A100) para acomodar el contexto de 102.400 tokens.
- GPU recomendadas: NVIDIA H100 80GB o A100 80GB en configuracion de 4 GPUs; tambien es viable en nodos con 8 GPUs de 48 GB si se reduce el contexto.
- No cabe en una GPU de consumo (RTX 4090, 24 GB); requiere hardware de datacenter.
- Despliegue: vLLM con flags especificos (`--tokenizer-mode inkling`, `--reasoning-parser inkling`, `--tool-call-parser inkling`, `--kernel-config.enable_flashinfer_autotune=False`). Tambien compatible con el framework de evaluacion Evalscope para medir precision.
- Latencia y throughput: no disponible; el ejemplo configura `max-num-seqs 1024` y `max-num-batched-tokens 32768` con chunked prefill, lo que sugiere un throughput alto en inferencia batch.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Inkling-Small (BF16 original) | 276B | 12B | 102.400 tokens | BF16 | Apache-2.0 |
| Inkling-Small-NVFP4 | 276B | 12B | 102.400 tokens | NVFP4 (4 bits) | Apache-2.0 |
| Inkling-Small-MXFP4-CT-AutoRound | 266B (cuantizado) | 12B | 102.400 tokens | MXFP4 (4 bits) | Apache-2.0 |

La version MXFP4 presenta un rendimiento practicamente identico a la version NVFP4 en las cuatro metricas evaluadas, con una ligera ventaja en AIME25 y GPQA Diamond. La diferencia principal es el formato de cuantizacion: MXFP4 usa escala microscaling, mientras que NVFP4 usa escalado por bloque de 4 bits de NVIDIA. Ambos reducen el checkpoint a aproximadamente 153 GB frente a los 335 GB del BF16 original.

## Limitaciones y advertencias

- El modelo puede producir resultados factualmente incorrectos; no debe usarse como fuente de informacion fiable sin verificacion.
- Riesgo de generar contenido ofensivo o sesgado debido a las limitaciones del modelo pre-entrenado y los datasets de ajuste.
- La cuantizacion MXFP4 puede introducir perdidas de precision en tareas de razonamiento muy especificas, aunque los benchmarks muestran una perdida minima.
- La licencia Apache-2.0 de la cuantizacion no sustituye a la licencia del modelo original; se debe consultar y respetar la licencia de Inkling-Small antes de uso comercial.
- La configuracion de despliegue requiere GPUs de datacenter; no es ejecutable en equipos de consumo.
- Los datos de idiomas soportados no estan disponibles en la informacion proporcionada.
- El modelo puede generar respuestas largas y detalladas que requieren validacion antes de su uso en produccion.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/INCModel2/Inkling-Small-MXFP4-CT-AutoRound
- Model card de Inkling-Small (Thinking Machines Lab): https://thinkingmachines.ai/model-card/inkling-small/
- Pagina oficial de Inkling: https://thinkingmachines.ai/inkling/
- vLLM Recipes para Inkling-Small: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Repositorio de intel/auto-round: https://github.com/intel/auto-round
- Articulo sobre cuantizacion de LLMs: https://arxiv.org/abs/2309.05516
- Intel Neural Compressor: https://github.com/intel/neural-compressor
