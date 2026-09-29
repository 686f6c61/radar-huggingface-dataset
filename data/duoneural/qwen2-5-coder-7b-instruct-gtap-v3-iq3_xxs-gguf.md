# DuoNeural/Qwen2.5-Coder-7B-Instruct-GTAP-v3-IQ3_XXS-GGUF

# DuoNeural/Qwen2.5-Coder-7B-Instruct-GTAP-v3-IQ3_XXS-GGUF

## Resumen

Se trata de una cuantizacion GGUF de tipo IQ3_XXS (~3,2 bits por peso, 2,90 GiB) del modelo de codigo Qwen2.5-Coder-7B-Instruct, publicada por el laboratorio DuoNeural. El interes no esta en el modelo base, que es un transformer decoder-only de 7.615.616.512 parametros ya conocido, sino en el metodo de cuantizacion aplicado: G-TAP v3 (Generalized Thouless-Anderson-Palmer) con amortiguamiento de cavidad de Onsager sobre la matriz W_down de las capas SwiGLU, calculado a partir de un Hessiano de activaciones de 131.072 tokens enriquecido con codigo.

El objetivo declarado es reducir el colapso de sintaxis que sufre la cuantizacion post-entrenamiento (PTQ) por debajo de 4 bits en modelos especializados en codigo. Segun los datos autoinformados por el autor, el checkpoint mantiene 15/15 en tool calling con plantilla Hermes, 17/20 en tests unitarios de algoritmos en Python y una perplejidad en holdout de 2,8264 frente a 2,8301 del mismo tamano con cuantizacion IQ3_XXS estandar.

La relevancia practica es que comprime un modelo de codigo de 7B, que en BF16 ocupa 14,19 GiB, en 2,90 GiB, lo que permite ejecutarlo en GPUs de consumo modesto con un throughput de decodificacion de 138,8 t/s segun el autor. Conviene subrayar que es un artefacto de investigacion marcado explicitamente como experimental y pendiente de validacion empirica independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 28 capas, atencion GQA con proporcion 28:4, FFN SwiGLU (heredada de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (~7,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card de esta cuantizacion; el modelo base Qwen2.5-Coder-7B-Instruct declara 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | IQ3_XXS (~3,2 bpw) en este repositorio; el mismo autor publica G-TAP v3 Q4_K_M (~4,5 bpw, 4,36 GiB) |
| Idiomas soportados | No disponible en la model card; el modelo base esta orientado a ingles, chino y lenguajes de programacion |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Tamano del repositorio | 3,1 GB |
| Metodo de cuantizacion | G-TAP v3 con amortiguamiento de cavidad de Onsager sobre W_down de SwiGLU, Hessiano de activaciones de 131.072 tokens |
| Fecha de creacion del repositorio | 28/09/2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de 28 capas con atencion de consultas agrupadas (GQA) en proporcion 28 cabezas de consulta por 4 cabezas de clave/valor, y red feed-forward con activacion SwiGLU. Esta configuracion reduce de forma notable el tamano de la cache KV respecto a atencion multi-cabeza completa, lo que resulta determinante para desplegar el modelo con contextos largos en hardware limitado. Segun el informe tecnico publicado por Qwen, la familia Qwen2.5-Coder se preentreno sobre 5,5 billones de tokens e incluye ajuste por instrucciones posterior; estos datos de entrenamiento no se detallan en la model card de esta cuantizacion.

La innovacion tecnica declarada por DuoNeural no afecta al entrenamiento, sino al proceso de cuantizacion. El autor describe un preacondicionamiento con G-TAP v3 (una aproximacion derivada de la teoria de Thouless-Anderson-Palmer, empleada en fisica estadistica para sistemas desordenados) que aplica amortiguamiento de cavidad de Onsager a la matriz W_down de las capas SwiGLU. El objetivo es compensar la correlacion de errores entre pesos antes de redondear a IQ3_XXS. Como soporte, el autor indica que el Hessiano de activaciones se calculo sobre 131.072 tokens infusionados con codigo. No se aporta en la informacion disponible la formulacion matematica, el codigo de calibracion ni una prueba reproducible del metodo; la model card lo declara explicitamente como artefacto de investigacion pendiente de verificacion.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento matematico multi-paso: el autor reporta 23/25 (92,0 %) en GSM8K para este checkpoint.
- Ejecucion correcta de algoritmos clasicos segun los tests AST del autor: programacion dinamica (coin_change, longest_increasing_subsequence, edit_distance), estructuras de datos (LRUCache con O(1), arbol de prefijos Trie) y algoritmos de grafos (ordenacion topologica con deteccion de ciclos).
- Tool calling / function calling: 15/15 con plantilla de prompt Hermes segun el autor.
- Formato conversacional (variante Instruct), apto para dialogos multi-turno.
- Capacidades multilingues: no documentadas en la model card; el modelo base esta optimizado para ingles y chino.
- No se documenta modo de razonamiento extendido (thinking mode), vision, audio ni decodificacion especulativa.

## Casos de uso

- Asistente de codigo local en estacion de trabajo: con 2,90 GiB de pesos, el modelo se ejecuta integramente en GPU en equipos con 8 GB de VRAM, lo que permite autocompletado y generacion de funciones sin enviar codigo propiedad de la empresa a servicios en la nube.
- Servidor de inferencia de bajo coste multi-tenant: levantado con llama-server y `-ngl 99`, permite atender varias sesiones concurrentes con contexto de 4.096 tokens en una sola GPU de gama media.
- Generacion de tests unitarios en pipelines de CI: el checkpoint demuestra ejecucion correcta de algoritmos con estructuras de datos y grafos, por lo que puede generar y validar casos de prueba sobre funciones puras antes del merge.
- Revision automatizada de pull requests: con soporte de tool calling, puede invocarse desde un bot que consulte el diff y devuelva comentarios estructurados mediante llamadas a funciones.
- Refactorizacion y traduccion entre lenguajes: el modelo base cubre un espectro amplio de lenguajes; esta cuantizacion mantiene la cobertura a un coste de memoria muy inferior al BF16.
- Entornos aislados (air-gapped) y on-premise: el formato GGUF y la licencia Apache-2.0 permiten desplegarlo en infraestructura propia sin conexion externa.
- Docencia y prototipado rapido: un coste de 2,90 GiB hace viable desplegar el modelo en portatiles con GPU integrada o incluso en CPU, con velocidad reducida.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor y son autoinformados. Las muestras son pequenas (25 preguntas de GSM8K, 20 tests unitarios, 15 pruebas de tool calling), por lo que las diferencias de uno o dos aciertos no son estadisticamente significativas.

| Configuracion | Codebook | Huella | Perplejidad (131k tokens) | GSM8K | AST Python (20 tests) | Tool calling (Hermes) | Decodificacion |
|---|---|---|---|---|---|---|---|
| Base BF16 (control) | BF16 | 14,19 GiB | 2,8039 | 25/25 (100,0 %) | 20/20 (100,0 %) | 15/15 (100,0 %) | 43,3 t/s |
| Coder7B IQ3_XXS naive | IQ3_XXS (~3,2 bpw) | 2,90 GiB | 2,8301 | 25/25 (100,0 %) | 17/20 (85,0 %) | 15/15 (100,0 %) | 138,0 t/s |
| Coder7B G-TAP v3 IQ3_XXS (este repo) | IQ3_XXS (~3,2 bpw) | 2,90 GiB | 2,8264 | 23/25 (92,0 %) | 17/20 (85,0 %) | 15/15 (100,0 %) | 138,8 t/s |
| Coder7B G-TAP v3 Q4_K_M | Q4_K_M (~4,5 bpw) | 4,36 GiB | 2,8209 | 25/25 (100,0 %) | 16/20 (80,0 %) | 14/15 (93,3 %) | 109,1 t/s |

Todas las mediciones de velocidad se realizaron, segun el autor, sobre una NVIDIA GeForce RTX 4080 Super. No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, MBPP, LiveCodeBench u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: 2,90 GiB con IQ3_XXS y 4,36 GiB con Q4_K_M.
- Cache KV: estimacion propia a partir de la configuracion GQA 28:4 y precision fp16, aproximadamente 56 KiB por token. Esto supone unos 224 MiB a 4.096 tokens de contexto y unos 1,75 GiB a 32.768 tokens.
- VRAM total estimada: entre 4 y 5 GB con contexto moderado en IQ3_XXS, y entre 6 y 8 GB en Q4_K_M con contexto largo.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM. Cabe en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4080 y RTX 4090. Tambien es viable en CPU con llama.cpp a velocidad reducida.
- El autor reporta 138,8 t/s de decodificacion en IQ3_XXS y 109,1 t/s en Q4_K_M sobre RTX 4080 Super. No se aportan datos de latencia de prefill ni de throughput con lotes concurrentes.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, con los ejemplos de `-ngl 99 -fa on` documentados en la model card), Ollama mediante importacion del GGUF o Modelfile, LM Studio y otros servidores compatibles con GGUF. El soporte de vLLM y TGI para GGUF es limitado y no esta confirmado para este checkpoint.
- Nota: la model card indica "RTX 4080 Super 32GB"; el modelo comercial de esa GPU tiene 16 GB de VRAM, por lo que el dato de hardware de la prueba no es consistente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Huella | Perplejidad | GSM8K | AST Python | Tool calling | Licencia |
|---|---|---|---|---|---|---|---|---|
| Este repo (G-TAP v3 IQ3_XXS) | 7,6 B | No disponible (base: 32.768) | 2,90 GiB | 2,8264 | 92,0 % (23/25) | 85,0 % (17/20) | 100,0 % (15/15) | Apache-2.0 |
| G-TAP v3 Q4_K_M (mismo autor) | 7,6 B | No disponible (base: 32.768) | 4,36 GiB | 2,8209 | 100,0 % (25/25) | 80,0 % (16/20) | 93,3 % (14/15) | Apache-2.0 |
| IQ3_XXS naive | 7,6 B | No disponible (base: 32.768) | 2,90 GiB | 2,8301 | 100,0 % (25/25) | 85,0 % (17/20) | 100,0 % (15/15) | Apache-2.0 |
| Qwen2.5-Coder-7B-Instruct BF16 | 7,6 B | 32.768 nativos | 14,19 GiB | 2,8039 | 100,0 % (25/25) | 100,0 % (20/20) | 100,0 % (15/15) | Apache-2.0 |

Alternativas de la misma categoria como el GGUF oficial de Qwen (Qwen/Qwen2.5-Coder-7B-Instruct-GGUF), DeepSeek-Coder-6.7B o CodeLlama-7B: no disponible en la informacion proporcionada, ya que no se han aportado cifras comparables bajo el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- Artefacto experimental: la propia model card lo etiqueta como "Pending Further Verification / Empirical Validation". No debe tratarse como un checkpoint estable de produccion.
- Benchmarks autoinformados y con muestras muy pequenas (25, 20 y 15 elementos). Los intervalos de confianza son amplios y no permiten afirmar mejoras reales frente a la cuantizacion IQ3_XXS estandar.
- Ausencia total de validacion independiente: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han encontrado evaluaciones de terceros.
- El marco teorico invocado (G-TAP v3, amortiguamiento de cavidad de Onsager, "Cognitive Light Cone") no va acompanado de la formulacion matematica, el codigo de calibracion ni un protocolo reproducible en la informacion disponible.
- Inconsistencia en los metadatos: se declara una "RTX 4080 Super 32GB", configuracion que no corresponde al modelo comercial de esa GPU, y la fecha de creacion del repositorio (28/09/2026) es anomala.
- Riesgo de alucinacion y de errores de sintaxis: la cuantizacion por debajo de 4 bits degrada especialmente lenguajes poco representados en el corpus de calibracion y APIs recientes que no aparecen en los datos de entrenamiento.
- Idiomas: no documentados para este checkpoint. Fuera de ingles, chino y lenguajes de programacion, el comportamiento puede degradarse de forma notable, incluido el castellano.
- Restricciones de licencia: el checkpoint es Apache-2.0, igual que el modelo base, por lo que el uso comercial esta permitido; se mantienen las condiciones de atribucion de la licencia original y las obligaciones habituales de Qwen para la familia Qwen2.5.
- No hay garantia de compatibilidad con decodificacion especulativa, con cuantizacion de la cache KV ni con servidores de alto throughput tipo vLLM, dado que el formato publicado es GGUF destinado a llama.cpp.
- En produccion, conviene fijar una version concreta del repositorio y validar el modelo con un conjunto propio de pruebas antes de sustituir una cuantizacion mas alta (Q4_K_M o superior).

## Enlaces

- Repositorio del modelo: https://huggingface.co/DuoNeural/Qwen2.5-Coder-7B-Instruct-GTAP-v3-IQ3_XXS-GGUF
- Otro GGUF del mismo autor: https://huggingface.co/DuoNeural/Qwen2.5-Coder-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- GGUF oficial de Qwen en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
- Ficha de Qwen2.5-Coder-7B-Instruct-GGUF en Secret AI: https://secretai.io/models/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
- Pagina de Ollama para qwen2.5-coder:7b-instruct: https://ollama.com/library/qwen2.5-coder:7b-instruct
