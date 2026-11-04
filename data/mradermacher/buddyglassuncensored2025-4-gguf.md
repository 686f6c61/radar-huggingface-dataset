# mradermacher/BuddyGlassUncensored2025.4-GGUF

## Resumen

BuddyGlassUncensored2025.4-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo darkc0de/BuddyGlassUncensored2025.4, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje conversacional en ingles de aproximadamente 23.570 millones de parametros (23,57B), generado mediante la herramienta mergekit a partir de la fusion de otros modelos, y posteriormente convertido a GGUF para facilitar su ejecucion en hardware de consumo mediante llama.cpp y derivados.

El modelo se distribuye en diez variantes de cuantizacion que van desde Q2_K (9,0 GB) hasta Q8_0 (25,2 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. El repositorio completo ocupa 161,4 GB e incluye unicamente pesos en formato GGUF; no se publican pesos originales en safetensors dentro de esta ficha, aunque el dato de parametros totales (23.572.403.200) se ha verificado a partir de los safetensors del modelo base.

La relevancia de este modelo es limitada y de nicho: se trata de un merge comunitario sin model card tecnica detallada, sin benchmarks publicados, sin licencia declarada y con muy pocas descargas (6) y likes (1) en el momento de la consulta. Resulta util principalmente para experimentacion local con modelos conversacionales sin censura en ingles, no para despliegues en produccion con garantias de calidad o cumplimiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit; detalles no disponibles) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base darkc0de/BuddyGlassUncensored2025.4. Por los tags del repositorio (mergekit, merge) y por el tamano de parametros (23,57B), se trata de un modelo resultante de la fusion de pesos de otros modelos mediante mergekit, una tecnica que combina los tensores de varios checkpoints sin reentrenamiento adicional. No se especifica la receta de merge (SLERP, TIES, DARE, model stock, etc.), ni los modelos de origen, ni la composicion del dataset de entrenamiento original.

Tampoco se documentan procesos de RLHF, DPO u otras fases de alineamiento posteriores al entrenamiento base. El calificativo "Uncensored" en el nombre sugiere que el merge busca reducir o eliminar los filtros de rechazo tipicos de modelos alineados, pero no hay evidencia tecnica publicada que lo respalde. La unica innovacion tecnica documentada es la propia cuantizacion realizada por mradermacher, que incluye variantes IQ (IQ4_XS) y una version separada con quants ponderados/imatrix en el repositorio hermano BuddyGlassUncensored2025.4-i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, segun el comportamiento tipico de modelos de ~24B, aunque sin benchmarks que lo verifiquen.
- Capacidad de codigo y matematicas: no documentada explicitamente; no disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Modo "uncensored": presumiblemente menor tasa de rechazos, sin garantia tecnica publicada.

## Casos de uso

- Experimentacion local con modelos conversacionales: el modelo puede ejecutarse en un equipo de sobremesa con GPU de 24 GB usando Q4_K_M (14,4 GB) o Q5_K_M (16,9 GB) mediante llama.cpp u Ollama, lo que permite probar un modelo de ~24B sin infraestructura de servidor.
- Investigacion sobre merges de modelos: util para estudiar el comportamiento de fusiones con mergekit y comparar la calidad de distintas recetas de cuantizacion (Q4 frente a Q6 frente a Q8) sobre el mismo checkpoint.
- Generacion creativa de ficcion y roleplay: el enfoque "uncensored" y conversacional encaja con tareas de escritura creativa sin restricciones tematicas, siempre que se asuma la falta de garantias de calidad y la ausencia de licencia clara.
- Pruebas de pipelines de inferencia GGUF: sirve como banco de pruebas para validar configuraciones de llama.cpp, vLLM (con soporte GGUF experimental) o servidores compatibles con la API de OpenAI (tag endpoints_compatible).
- Evaluacion comparativa de cuantizaciones: al ofrecer diez variantes del mismo modelo, permite medir la degradacion de perplejidad entre Q2_K y Q8_0 en un caso real.
- Prototipado de asistentes conversacionales en ingles: para demos internas o pruebas de concepto donde no se requiere soporte multilingue ni cumplimiento estricto de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 9,0 GB (Q2_K), 13,6-14,4 GB (Q4_K_S / Q4_K_M), 16,4-16,9 GB (Q5_K_S / Q5_K_M), 19,4 GB (Q6_K) y 25,2 GB (Q8_0). Anadir entre 1 y 4 GB adicionales para KV cache segun contexto.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con comodidad; A100 40 GB o H100 para Q8_0 y contextos largos; RTX 4080 (16 GB) solo alcanza Q4_K_S ajustado o Q3_K_L.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB con Q3_K_L o IQ4_XS; en GPUs de 12 GB solo con Q2_K y contexto reducido, con riesgo de offload a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y servidores compatibles con la API de OpenAI (tag endpoints_compatible). vLLM con soporte GGUF es experimental.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BuddyGlassUncensored2025.4-GGUF | 23,57B | no disponible | GGUF | no disponible | Merge comunitario sin benchmarks ni model card tecnica |
| Mistral Small 24B (referencia) | 24B | 32k-128k segun version | safetensors, GGUF | Apache 2.0 | Modelo oficial con benchmarks y soporte |
| Gemma 2 27B (referencia) | 27B | 8k | safetensors, GGUF | Gemma Terms | Modelo oficial de Google con evaluaciones publicadas |
| Qwen2.5 32B (referencia) | 32,5B | 32k-128k | safetensors, GGUF | Apache 2.0 (mayoria variantes) | Multilingue, con benchmarks y tool calling documentado |

La comparativa es orientativa: los tres modelos de referencia cuentan con documentacion tecnica, licencia explicita y evaluaciones publicadas, mientras que BuddyGlassUncensored2025.4 carece de todos esos elementos. En tamano, se situa entre Mistral Small 24B y Gemma 2 27B.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; en la practica, el modelo queda en un limbo legal que desaconseja su uso en produccion.
- Sin model card tecnica del modelo base: se desconocen los datos de entrenamiento, la receta de merge y los modelos de origen, lo que impide evaluar sesgos o procedencia de los pesos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Riesgo elevado de alucinacion: al ser un merge sin alineamiento documentado, la fiabilidad factual no esta garantizada.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- El calificativo "Uncensored" implica posible generacion de contenido sensible o inapropiado; requiere moderacion externa en cualquier despliegue publico.
- Muy baja adopcion (6 descargas, 1 like): sin comunidad que reporte errores ni validacion independiente.
- Repositorio de 161,4 GB: descarga pesada si se quieren todas las cuantizaciones; conviene bajar solo la variante necesaria.
- Fecha de actualizacion del repositorio (2026-11-04) posterior a la de creacion (2025-03-02): conviene verificar integridad de los archivos antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BuddyGlassUncensored2025.4-GGUF
- Modelo base: https://huggingface.co/darkc0de/BuddyGlassUncensored2025.4
- Quants ponderados/imatrix: https://huggingface.co/mradermacher/BuddyGlassUncensored2025.4-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#BuddyGlassUncensored2025.4-GGUF
- Preguntas frecuentes y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
