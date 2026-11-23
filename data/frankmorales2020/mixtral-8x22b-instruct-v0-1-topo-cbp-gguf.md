# frankmorales2020/mixtral-8x22b-instruct-v0.1-topo-cbp-GGUF

## Resumen

`Mixtral-8x22B-Instruct-v0.1-topo-cbp-GGUF` es una cuantizacion GGUF en 4 bits (`Q4_K_M`) del modelo `mistralai/Mixtral-8x22B-Instruct-v0.1`, publicada por el usuario frankmorales2020 bajo la etiqueta de "Sovereign Machine Laboratory (SOMALA)". Se trata de un artefacto de inferencia derivado, no de un modelo entrenado desde cero: la arquitectura, los pesos y el comportamiento linguistico provienen integramente del modelo base de Mistral AI, mientras que el autor aporta un pipeline de cuantizacion con reglas de preservacion de precision en los routers del MoE y un conjunto de verificaciones de determinismo.

El modelo base es un transformer disperso de tipo Mixture of Experts con 56 capas, 8 expertos por capa y activacion de 2 expertos por token (top-2 routing). Con 141 mil millones de parametros totales y unos 39 mil millones activos por token, ofrece una ventana de contexto de hasta 65.536 tokens y esta orientado a generacion de texto e instrucciones en ingles. La licencia del artefacto es Apache 2.0, heredada del modelo base.

La relevancia de esta publicacion es doble. Por un lado, demuestra una practica de cuantizacion consciente de la sensibilidad del routing en MoE: mantiene los tensores de gating en F32 sin comprimir y las proyecciones KV en `Q8_0` para evitar colapsos de activacion. Por otro lado, incluye un protocolo de verificacion determinista (decodificacion greedy con `temperature=0.0`, `top_k=1`, semilla fija y comparacion de hashes SHA-256 de los logits) que documenta reproducibilidad bit a bit entre dos ejecuciones. El resultado es un binario de 79,71 GB pensado para despliegue en estaciones de trabajo o nodos edge con al menos 88 GB de memoria unificada o RAM de host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture of Experts (MoE), 56 capas, 8 expertos, top-2 routing |
| Parametros totales | 140.620.634.112 (~141 mil millones) |
| Parametros activos | ~39 mil millones por token (2 de 8 expertos) |
| Longitud de contexto | Hasta 65.536 tokens |
| Tipos de cuantizacion | GGUF `Q4_K_M` mixto (4,87 BPW); routers y normalizaciones en F32; KV en `Q8_0`; cabeza de salida en `Q6_K`; expertos en `Q4_K`/`Q6_K` |
| Idiomas soportados | Ingles (segun model card y tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico binario de 79,71 GB / 85.592.265.120 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mixtral-8x22B-Instruct-v0.1 de Mistral AI: un transformer decoder-only con capas de atencion y bloques feed-forward sustituidos por capas MoE de 8 expertos, de los cuales se activan 2 por token. El modelo base fue entrenado por Mistral AI con datos no especificados en la informacion disponible, e incluye un ajuste de instrucciones (Instruct) cuyo detalle de dataset, numero de tokens y si hubo RLHF o DPO no esta documentado en la informacion proporcionada.

La contribucion tecnica de este artefacto es el pipeline de cuantizacion, denominado por el autor "Topological Continual Backpropagation (Topo-CBP)". Consiste en tres reglas: (1) mantener sin comprimir en F32 los 56 tensores de gating (`blk.X.ffn_gate_inp.weight`) y los 113 tensores de normalizacion RMS, para evitar que el ruido de redondeo invierta decisiones de routing; (2) cuantizar las proyecciones de atencion K y V en `Q8_0` para preservar el contexto largo; (3) aplicar una topologia mixta `Q4_K`/`Q6_K` sobre los arrays 3D de expertos, con `Q6_K` en las down-projections de capas ancla y `Q4_K` en el resto. El autor reporta una verificacion de "zero-drift" con dos pasadas greedy identicas (semilla 42, `temperature=0.0`, `top_k=1`, `penalty=1.15`) que producen hashes SHA-256 de logits identicos y un delta maximo absoluto de 0,0. No se documenta ningun reentrenamiento ni ajuste fino adicional sobre los pesos del modelo base.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del modelo base Mixtral-8x22B-Instruct-v0.1.
- Razonamiento multi-paso y respuesta a prompts complejos, gracias a la capacidad del modelo base.
- Generacion de codigo y matematicas, segun las capacidades conocidas del modelo base (no verificadas de forma independiente en este artefacto).
- Ventana de contexto larga de hasta 65.536 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Inferencia determinista reproducible con decodificacion greedy y semilla fija, segun el protocolo de verificacion del autor.
- Despliegue en `llama.cpp`, `Ollama` y otros runtimes compatibles con GGUF, segun los tags del repositorio.
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modos de "thinking" en la informacion disponible.

## Casos de uso

- Procesamiento de documentos largos: con 65.536 tokens de contexto, el modelo puede resumir o extraer informacion de contratos, informes tecnicos o expedientes completos en una sola pasada, sin trocear el texto.
- Asistencia a desarrolladores en local: al ejecutarse sobre GGUF con `llama.cpp` u `Ollama`, permite generar y explicar codigo en estaciones de trabajo sin enviar datos a servicios externos.
- Despliegue en estaciones de trabajo con memoria unificada: con 88 GB de RAM o memoria unificada (por ejemplo, Apple Silicon de 128 GB) se puede servir el modelo en un nodo unico, util para prototipado y entornos de investigacion.
- Pipelines de evaluacion reproducible: el protocolo de verificacion con hashes SHA-256 de logits permite auditar que dos ejecuciones producen la misma salida, util para tests de regresion en sistemas de IA.
- Generacion de texto tecnico en ingles: redaccion de documentacion, resumenes y respuestas a preguntas sobre dominios especializados, aprovechando el ajuste de instrucciones del modelo base.
- Investigacion sobre cuantizacion de MoE: el manifiesto de precision por tipo de tensor sirve como referencia para estudiar el impacto de la cuantizacion en el routing de expertos y en la estabilidad de activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta una auditoria de determinismo (dos pasadas con hashes SHA-256 de logits identicos y delta maximo absoluto de 0,0), no metricas de calidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 88 GB para cargar el binario de 79,71 GB con margen para el contexto y el estado del runtime.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, requiere configuraciones multi-GPU de clase profesional (A100 80 GB, H100 80 GB) o nodos con memoria unificada amplia.
- No cabe en GPU de consumo individual (RTX 4090 con 24 GB, RTX 3090 con 24 GB); seria necesario repartir capas entre varias GPU o usar CPU.
- Opciones de despliegue: `llama.cpp` y `Ollama` (segun tags); otros runtimes compatibles con GGUF como `vLLM` o `TGI` no estan confirmados en la informacion disponible.
- Hardware de referencia citado por el autor: Apple Silicon M-Series con 128 GB de memoria unificada, estaciones de trabajo con CPU y nodos edge multi-GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mixtral-8x22B-Instruct-v0.1-topo-cbp-GGUF (este artefacto) | 141 B / ~39 B | 65.536 | GGUF `Q4_K_M` (79,71 GB) | Apache 2.0 | Cuantizacion con routers en F32 y verificacion de determinismo |
| mistralai/Mixtral-8x22B-Instruct-v0.1 | 141 B / ~39 B | 65.536 | safetensors (pesos completos) | Apache 2.0 | Modelo base original; requiere ~280 GB en BF16 |
| mistralai/Mixtral-8x7B-Instruct-v0.1 | 46,7 B / ~12,9 B | 32.768 | safetensors, GGUF | Apache 2.0 | Alternativa mas ligera de la misma familia MoE |
| Meta Llama 3 70B Instruct | 70 B / 70 B (denso) | 8.192 | safetensors, GGUF | Llama 3 Community License | Denso, sin routing MoE; contexto menor |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al de modelos multilingues.
- Al ser una cuantizacion en 4 bits, puede haber perdida de calidad respecto a los pesos completos del modelo base, aunque el autor mitiga la degradacion del routing con routers en F32.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones de fidelidad factual en este artefacto.
- La model card incluye afirmaciones no verificadas de forma independiente (por ejemplo, "zero catastrophic forgetting" o preservacion de "LEFM operator" y "Arithmetic Spectral Theory") que no cuentan con evidencia publica mas alla del protocolo de determinismo del propio autor.
- El requisito de 88 GB de memoria limita el despliegue a hardware de gama alta; no es viable en GPU de consumo individual.
- Aunque la licencia es Apache 2.0, conviene revisar los terminos del modelo base de Mistral AI antes de un uso comercial en produccion.
- El repositorio tiene 442 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada y poca validacion por parte de la comunidad.
- No se documentan garantias de soporte, mantenimiento ni actualizaciones del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frankmorales2020/mixtral-8x22b-instruct-v0.1-topo-cbp-GGUF
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x22B-Instruct-v0.1
- Articulo 1: https://medium.com/ai-simplified-in-plain-english/the-invariance-of-sovereign-sparse-silicon-engineering-quantizing-and-deterministically-a045aa5a5044
- Articulo 2: https://medium.com/ai-simplified-in-plain-english/architecting-zero-drift-cognitive-systems-deployment-benchmarking-and-registry-traction-of-64641329b9aa
- Articulo 3: https://medium.com/ai-simplified-in-plain-english/the-architecture-of-determinism-governing-the-multi-agent-clinical-pipeline-5d83a08c36a7
- Codigo (cuantizacion): https://github.com/frank-morales2020/AST/blob/main/mixtral_to_gguf.ipynb
- Codigo (agentes): https://github.com/frank-morales2020/AST/blob/main/SIX_AGENTIC_GGUF.ipynb
- Codigo (benchmark): https://github.com/frank-morales2020/AST/blob/main/MIXTRAL_GGUF_BENCH.ipynb
- Codigo (GPU/CPU): https://github.com/frank-morales2020/AST/blob/main/MIXTRAL_GGUF_GPU_CPU.ipynb
