# Myric/Flint-APEX-GGUF

## Resumen

Flint-APEX-GGUF es una escalera de cuantizaciones (quant ladder) en formato GGUF del modelo [RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint), un modelo de lenguaje MoE orientado a agentes de codigo desarrollado por Recursive y cuantizado por el usuario Myric con llama.cpp. El modelo base tiene 39,8 mil millones de parametros totales y aproximadamente 2,5 mil millones activos por token, lo que permite un rendimiento de agente de programacion con un coste de inferencia mucho menor que el de un modelo denso equivalente.

El repositorio ofrece tres niveles de cuantizacion (5, 4 y 3 bits por peso efectivos) construidos con recetas personalizadas y una matriz de importancia (imatrix) ponderada por codigo, algo especialmente relevante dado el enfoque agentic-coding del modelo. La cuantizacion de 5 bpw fue evaluada con la suite agéntica OpenCode de 42 tareas, alcanzando un 100% de acierto con contexto de hasta 262.144 tokens.

Su relevancia actual radica en la combinación de una arquitectura MoE eficiente (expertos enrutados con top-6, atencion hibrida deslizante y completa), una licencia Apache 2.0 totalmente abierta y cuantizaciones agresivas que permiten ejecutar un modelo de 39,8B en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only MoE (mixture of experts) |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | ~2,5B (top-6 expertos de 256 por capa MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 5 bpw (4,76 efectivos, 23 GB), 4 bpw (3,95 efectivos, 19 GB), 3 bpw (2,99 efectivos, 14 GB); cuantizacion con imatrix ponderada por codigo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

Flint es un modelo decoder-only de tipo mixture-of-experts con 49 capas: 2 densas y 47 MoE. Cada capa MoE contiene 256 expertos enrutados (se activan 6 por token) mas 1 experto compartido, lo que explica la gran diferencia entre parametros totales (39,8B) y activos (~2,5B). La atencion es hibrida: 35 capas usan atencion deslizante con ventana de 513 tokens y 14 capas usan atencion completa, una configuracion que reduce el coste de contextos largos manteniendo capacidad de razonamiento global. Usa GQA con 32 cabezas de consulta y 4 de clave-valor, dimension de cabeza 128, RMSNorm por cabeza sobre Q y K, y attention sinks aprendidos. Las capas deslizantes usan RoPE, mientras que las de atencion completa carecen de codificacion posicional. El vocabulario tiene 150.144 tokens y el contexto maximo es de 262.144 tokens.

Sobre los datos y el proceso de entrenamiento del modelo base, la informacion disponible no detalla el numero de tokens ni la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. En cuanto a la cuantizacion, el repositorio emplea llama.cpp con una imatrix ponderada por codigo: el nivel de 5 bpw se construyo de forma estructural, mientras que los niveles de 4 y 3 bpw usan tipos IQ para los expertos y la imatrix calculada contra el artefacto de 5 bpw.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Agentic coding: el modelo esta optimizado explicitamente para flujos de trabajo de agente de programacion, segun la evaluacion con la suite OpenCode de 42 tareas.
- Contexto largo: hasta 262.144 tokens, con uso verificado de 120.829 tokens en la evaluacion sin huecos ni slots truncados.
- Razonamiento con niveles configurables: la evaluacion se realizo con reasoning en modo high y limite de salida de 32.768 tokens.
- Eficiencia de inferencia: solo ~2,5B de parametros activos por token gracias al enrutado MoE top-6.
- Compatibilidad con llama.cpp y el ecosistema GGUF.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada (el uso agéntico en OpenCode sugiere capacidad de uso de herramientas, pero no esta documentado).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Agentes de programacion autonomos: el modelo ha superado el 100% de la suite OpenCode agentic de 42 tareas (incluyendo tareas hard, frontier y tier4a), por lo que es adecuado para integrarse en herramientas de codigo agéntico tipo OpenCode, con edicion multi-archivo y bucles de razonamiento-accion.
- Asistentes de codigo en local: con la cuantizacion de 5 bpw (23 GB) cabe en una GPU de gama alta de consumo, permitiendo autocompletado y refactorizacion asistida sin depender de APIs externas.
- Analisis de repositorios grandes: su ventana de 262.144 tokens permite cargar bases de codigo extensas o historiales largos de conversacion agéntica; en la evaluacion se usaron mas de 120.000 tokens de contexto sin degradacion.
- Procesamiento por lotes economico: con solo ~2,5B de parametros activos por token, el throughput por GPU es alto comparado con modelos densos de tamaño similar, util para tareas masivas de revision de codigo o generacion de tests.
- Despliegue en hardware limitado: las cuantizaciones de 4 y 3 bpw (19 y 14 GB) permiten ejecutar el modelo en configuraciones con menos VRAM, por ejemplo para prototipado o equipos sin GPU de servidor.
- Chatbots tecnicos con RAG: la atencion hibrida deslizante/completa y el contexto largo lo hacen idoneo para combinar recuperacion de documentacion con razonamiento sobre codigo.
- Automatizacion de CI/CD: puede integrarse en pipelines para revisar pull requests, proponer parches y ejecutar razonamiento multi-paso sobre fallos de build.

## Benchmarks y rendimiento

Resultados publicados en la model card para la cuantizacion de 5 bpw, obtenidos con la suite OpenCode agentic en hardware GB10, con temp 1.0, top_p 0.95, top_k 20, contexto 262.144, limite de salida 32.768, reasoning high, un slot y compaction desactivada:

| Suite | Resultado |
|---|---:|
| opencode_tasks | 25/25 |
| opencode_tasks_hard | 5/5 |
| opencode_tasks_frontier | 9/9 |
| opencode_tasks_tier4a | 3/3 |
| **Total** | **42/42 (100%)** |

Contexto pico utilizado: 120.829 de 262.144 tokens, sin huecos (voids) ni slots truncados. El informe completo esta en el [repositorio de benchmarks APEX](https://huggingface.co/Myric/apex-quant-benchmarks). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos):
  - 5 bpw: ~23 GB
  - 4 bpw: ~19 GB
  - 3 bpw: ~14 GB
  - Añadir margen para la KV cache, especialmente con contextos largos (hasta 262.144 tokens).
- GPU recomendadas: la evaluacion oficial se realizo en un sistema GB10 (NVIDIA Grace Blackwell). Para consumo, una RTX 4090 (24 GB) o RTX 5090 (32 GB) puede alojar la variante de 5 bpw; las variantes de 4 y 3 bpw caben en GPUs de 16-24 GB. No se han publicado mediciones en otras GPUs.
- Consumer GPUs: la variante de 5 bpw cabe en una RTX 4090 de 24 GB (con margen limitado para KV cache); las de 4 y 3 bpw son mas holgadas en GPUs de 16-24 GB. Tambien es viable la ejecucion en CPU o hibrida CPU+GPU con llama.cpp dada la baja cantidad de parametros activos.
- Despliegue: llama.cpp de forma nativa (formato GGUF); por extension, Ollama y otros runtimes compatibles con GGUF. No hay informacion sobre soporte en vLLM o TGI para estos GGUF.
- Latencia y throughput: no disponibles; el diseño MoE con ~2,5B parametros activos sugiere buena velocidad de generacion, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Caracteristica | Flint (APEX 5 bpw) | Qwen3-30B-A3B | Mixtral 8x7B |
|---|---|---|---|
| Parametros totales | 39,8B | 30,5B | 46,7B |
| Parametros activos | ~2,5B | ~3,3B | ~12,9B |
| Contexto | 262.144 | 32.768 (128k con YaRN) | 32.768 |
| Atencion | Hibrida (sliding + full) | Estandar (GQA) | Estandar (GQA) |
| Enfoque | Agentic coding | General / codigo | General |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Formato | GGUF (esta cuantizacion) | Safetensors + GGUF comunitarios | Safetensors + GGUF comunitarios |

Flint se diferencia por su contexto mucho mayor, su menor numero de parametros activos y su especializacion verificada en tareas agenticas de codigo. No hay comparativas directas publicadas contra estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta el analisis de sesgos del modelo base.
- Riesgo de alucinacion: no cuantificado; al ser un modelo orientado a codigo agéntico, conviene validar siempre los parches generados antes de aplicarlos.
- Idiomas: no se especifican los idiomas soportados; la imatrix ponderada por codigo sugiere un enfoque principal en codigo, posiblemente a costa de capacidades en lenguaje natural.
- Contexto: aunque el maximo es 262.144 tokens, la atencion deslizante con ventana de 513 en 35 de las 49 capas puede limitar el acceso a informacion muy lejana en el contexto; la atencion completa solo esta presente en 14 capas.
- Estado de la subida: en el momento de redaccion, las variantes de 4 y 3 bpw estaban en cola de subida junto con sus recetas y la imatrix; verificar la disponibilidad actual en el repositorio.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base (RecursiveSI/flint), tambien bajo Apache 2.0.
- Benchmarks: el resultado 42/42 proviene del propio autor de la cuantizacion con una suite especifica (OpenCode); no hay evaluaciones independientes ni benchmarks estandarizados publicados.
- Cuantizacion agresiva: los niveles de 4 y 3 bpw usan tipos IQ para expertos y heredan una imatrix calculada contra el artefacto de 5 bpw; la calidad en tareas fuera del dominio de codigo no esta evaluada.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/Myric/Flint-APEX-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Informe de benchmarks APEX: https://huggingface.co/Myric/apex-quant-benchmarks
