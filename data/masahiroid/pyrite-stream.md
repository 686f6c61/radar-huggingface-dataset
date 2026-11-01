# masahiroid/pyrite-stream

## Resumen

Pyrite-stream es un motor de inferencia para modelos Mixture-of-Experts (MoE) sobre Apple Silicon, publicado por Masahiro Nakatsugawa (n.p.minerva & Co. / AntenneFrance) bajo el paraguas del "Project Pyrite Phase 2: MoE-Stream Engine". No se trata de un modelo con pesos propios entrenados desde cero, sino de un runtime empaquetado como repositorio de Hugging Face con librería MLX que permite ejecutar modelos MoE de gran tamano (Mixtral-8x22B-Instruct de 141B parametros, DeepSeek-Coder-V2-Lite de 15,7B) en Macs con 16 GB de memoria unificada mediante streaming de expertos desde NVMe.

El problema que aborda es el coste de memoria de los MoE: en lugar de mantener todos los pesos residentes, el motor separa el "working set" estatico (attention, LayerNorm/RMSNorm, routers de gating, embeddings y LM head) del conjunto dinamico de expertos enrutados. Solo los Top-K expertos activos por token se cargan bajo demanda desde SSD mediante `mmap` con slicing de bytes cero-copia (latencia reportada de 68 microsegundos) y una cache LRU en memoria. El autor cifra reducciones de RAM del 83% al 98% frente a la inferencia convencional.

La relevancia actual es que propone una via para ejecutar modelos de 100B+ parametros en hardware de consumo Apple (Mac mini, MacBook Air) sin GPU dedicada, algo que hasta ahora requeria estaciones de trabajo con 80-300 GB de RAM o multiples H100. El repositorio, sin embargo, tiene 0 descargas y 0 likes en el momento de la consulta, el tamano del repo es de 0,0 GB y no incluye pesos de modelo, por lo que debe evaluarse como propuesta tecnica y no como artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de inferencia MoE con streaming de expertos por NVMe; soporta arquitecturas Mixtral (8x22B) y DeepSeek (MLA/GQA, shared experts) sobre backend MLX/Metal |
| Parametros totales | No aplica al motor; modelos soportados: 141,0B (Mixtral-8x22B-Instruct) y 15,7B (DeepSeek-Coder-V2-Lite) |
| Parametros activos | Mixtral: Top-2 de 8 expertos; DeepSeek-Coder-V2-Lite: Top-6 de 64 expertos (segun model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits mencionado para calculo de tamano de experto (~150 MB por experto en Mixtral); no se detallan otros formatos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con slicing por offsets de bytes; no incluye pesos en el repositorio (0,0 GB) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino un motor de ejecucion. La arquitectura subyacente es un transformer MoE con enrutamiento Top-K: en Mixtral-8x22B se activan 2 de 8 expertos por token y en DeepSeek-Coder-V2-Lite 6 de 64, ademas de 2 expertos compartidos en el caso de DeepSeek. El motor divide la memoria en una zona residente (~1,5 GB para DeepSeek, ~2,3 GB para Mixtral-8x22B) que aloja atencion multi-cabeza (con MLA o GQA segun el modelo), RMSNorm, matrices de gating, embeddings y LM head, y una zona dinamica que contiene solo los tensores de los expertos activos.

La innovacion tecnica principal es el streaming bajo demanda desde NVMe mediante `mmap` con calculo de offsets lineales por experto (`Offset = Base + e × TotalBytes / N_experts`), lo que evita cargar shards completos de safetensors y permite extraer un experto en 68 microsegundos directamente a buffers de memoria unificada de Metal sin asignacion intermedia en heap. Se anade una cache LRU de expertos en memoria (2 a 4 expertos por capa) con tasa de acierto reportada del 40% al 60% en generacion secuencial, reduciendo el I/O por token a ~1,0-1,5 GB. No se dispone de informacion sobre datos de entrenamiento, tokens, RLHF/DPO ni proceso de alineacion, ya que el autor no entrena modelos en este repositorio.

## Capacidades

- Ejecucion de modelos MoE de gran escala (hasta 141B parametros) en Apple Silicon con 16 GB de memoria unificada.
- Streaming de expertos Top-K desde NVMe con slicing cero-copia y cache LRU.
- Soporte de arquitecturas Mixtral (8x22B) y DeepSeek (MLA/GQA, shared experts, 64 expertos).
- Backend MLX sobre Metal 4, orientado a chips de la serie M.
- Generacion de texto (pipeline text-generation) heredada de los modelos subyacentes.
- Verificacion de forward pass completo de 56 capas en Mixtral-8x22B segun la model card.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking propias del motor.
- Capacidades multilingues: no disponibles (dependen del modelo base cargado).

## Casos de uso

- Experimentacion con MoE de gran escala en portatiles: un MacBook Air o Mac mini de 16 GB puede ejecutar Mixtral-8x22B-Instruct con ~12 GB de RAM libre, lo que permite investigar comportamiento de modelos 141B sin acceso a clústeres.
- Prototipado de aplicaciones de codigo con DeepSeek-Coder-V2-Lite: el motor lo ejecuta en 1,55-2,01 GB de RAM a 2,83 tok/s, adecuado para pruebas funcionales de asistentes de codigo en local antes de desplegar en servidor.
- Desarrollo y depuracion de pipelines MoE: al separar working set residente y dinamico, permite instrumentar que expertos se activan por token y validar estrategias de enrutamiento sin cargar el modelo completo.
- Educacion e investigacion: reproducir el forward pass de un modelo de 141B en hardware de consumo facilita docencia sobre arquitecturas MoE y sparsity.
- Evaluacion comparativa de modelos MoE en Apple Silicon: sirve como banco de pruebas para medir tasas de acierto de cache LRU y latencias de I/O NVMe con distintos tamanos de cache.
- Inferencia de baja concurrencia en local: para tareas de generacion offline (resumen, borradores, analisis de documentos) donde 2,83 tok/s es aceptable y se prioriza no enviar datos a la nube.
- No es adecuado para servicios de produccion con alta concurrencia o baja latencia, dado el throughput reportado.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son mediciones de memoria y velocidad en un Apple M2 Pro de 16 GB, no benchmarks de calidad (MMLU, HumanEval, GSM8K) de los modelos subyacentes.

| Modelo | Parametros totales | RAM estandar requerida | RAM con Pyrite MoE-Stream | Reduccion | Velocidad |
|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite | 15,7B (64 expertos) | 12-32 GB | 1,55-2,01 GB | 83%-93% | 2,83 tok/s |
| Mixtral-8x22B-Instruct | 141,0B (8 expertos) | 80-280 GB | 2,84-3,61 GB | 95%-98% | Forward pass de 56 capas verificado (tok/s no reportado) |

Datos adicionales: latencia de extraccion de experto de 0,068 ms (68 µs); tasa de acierto de cache LRU del 40%-60%; I/O por token reducido a ~1,0-1,5 GB. No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- RAM: 16 GB de memoria unificada en Apple Silicon; consumo del motor de 1,55-3,61 GB segun modelo, dejando >12 GB libres.
- Almacenamiento: SSD NVMe con espacio para los pesos completos (70-280 GB en disco para Mixtral-8x22B; el repositorio en si ocupa 0,0 GB porque no incluye pesos).
- GPU: no requiere GPU dedicada; usa la GPU integrada Apple vía Metal 4 y MLX. Verificado en Apple M2 Pro; no se documentan pruebas en M1, M3, M4 ni en Mac Studio.
- No cabe en GPUs consumer NVIDIA (RTX 4090, etc.) porque el backend es MLX/Metal especifico de Apple Silicon.
- Despliegue: exclusivamente mediante MLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,83 tok/s en DeepSeek-Coder-V2-Lite sobre M2 Pro de 16 GB; para Mixtral-8x22B no se reporta tok/s, solo la verificacion del forward pass completo.

## Comparativa con modelos similares

| Solucion | Enfoque | Parametros soportados | RAM requerida | Hardware | Licencia |
|---|---|---|---|---|---|
| Pyrite-stream (este repo) | Streaming de expertos MoE por NVMe sobre MLX | Hasta 141B (Mixtral-8x22B) | 1,55-3,61 GB | Apple Silicon 16 GB | Apache 2.0 |
| AirLLM | Offloading de modelo completo por capas | Denso (p. ej. Llama-3-70B) | Depende del modelo | Multiples backends | No disponible en la informacion |
| Inferencia MoE estandar (p. ej. llama.cpp) | Pesos residentes o cuantizados en RAM/VRAM | Limitado por memoria disponible | 12-32 GB (DeepSeek-Lite), 80-280 GB (Mixtral) | CPU/GPU/NVIDIA | Segun modelo |
| Clúster multi-GPU (4x H100) | Paralelismo de tensor | 100B+ | 300 GB+ VRAM | Servidor | Segun modelo |

La comparativa se limita a lo citado en la model card; no se dispone de datos verificables de terceros sobre el rendimiento relativo de Pyrite-stream frente a estas alternativas mas alla de las cifras del propio autor.

## Limitaciones y advertencias

- Repositorio sin adopcion: 0 descargas y 0 likes en Hugging Face; sin validacion independiente de las cifras reportadas.
- El repositorio no contiene pesos (0,0 GB): es un motor, no un modelo listo para usar; el usuario debe aportar los safetensors de Mixtral o DeepSeek por separado.
- Rendimiento muy bajo: 2,83 tok/s en DeepSeek-Coder-V2-Lite sobre M2 Pro; inviable para interaccion en tiempo real o produccion con concurrencia.
- Dependencia de SSD NVMe rapido y de su vida util: el streaming continuo de 1,0-1,5 GB por token genera I/O intensivo y desgaste del disco a largo plazo.
- Solo Apple Silicon con MLX/Metal; no hay soporte para NVIDIA, AMD ni CPU x86.
- Las cifras de acierto de cache (40%-60%) y latencia (68 µs) son del autor y no han sido replicadas de forma independiente.
- No se documentan sesgos, tasas de alucinacion ni comportamiento multilingue del motor; dependen enteramente del modelo base cargado.
- Licencia Apache 2.0 permite uso comercial del motor, pero los pesos de los modelos subyacentes (Mixtral, DeepSeek) tienen sus propias licencias que deben respetarse.
- No se especifican longitudes de contexto soportadas ni limites de la cache LRU bajo contextos largos o prompts con alta dispersion de expertos.
- Ausencia de datos sobre datos de entrenamiento, alineacion o evaluacion de calidad; no debe interpretarse como un modelo nuevo con capacidades propias.

## Enlaces

- Hugging Face: https://huggingface.co/masahiroid/pyrite-stream
- Preprint DOI: https://doi.org/10.5281/zenodo.23811995
- Registro Zenodo: https://zenodo.org/records/23811995
- ORCID del autor: https://orcid.org/0009-0000-3224-0103
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
