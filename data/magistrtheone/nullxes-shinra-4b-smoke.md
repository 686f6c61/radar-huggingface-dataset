# MagistrTheOne/NULLXES-SHINRA-4B-SMOKE

## Resumen

NULLXES SHINRA-4B es un modelo de lenguaje denso, decoder-only, de 3.926.076.416 parametros (3,93B) publicado por MagistrTheOne bajo la licencia propietaria "nullxes-research". Segun su model card, se trata de la "capa de inteligencia linguistica" del sistema NULLXES, un conjunto de modelos donde RAIDEN cubre razonamiento, CERBER vision, SHINRA lenguaje y AION inteligencia encarnada. El checkpoint distribuido en HuggingFace lleva el sufijo SMOKE, mientras que la model card describe la variante INSTRUCT, lo que sugiere que el artefacto publicado podria ser una ejecucion de prueba y no el modelo final.

Tecnicamente emplea una arquitectura propietaria denominada `ShinraForCausalLM`, que el autor declara explicitamente no derivada de Llama, Mistral, Qwen ni GPT-NeoX. Usa 32 capas, hidden size 3072, atencion GQA con 24 cabezas de consulta y 8 de clave/valor, MLP SwiGLU con intermedio 9216, RMSNorm con pre-norm y QK-norm, y RoPE con theta 1e6 preparado para YaRN. El vocabulario es de 131.072 tokens con SentencePiece Unigram y byte fallback.

Su relevancia es limitada pero concreta: es un modelo de clase 4B con ventana nativa de 32.768 tokens y un entrenamiento declarado de tres etapas (pretrain, SFT y DPO) sobre 200.000 millones de tokens, con soporte de plantilla de chat y tokens especiales para razonamiento, codigo, herramientas y documentos. Al ser un artefacto con licencia propietaria, codigo personalizado y solo 81 descargas en el momento de redactar esta ficha, debe tratarse como material de investigacion cerrada y no como una opcion de produccion contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, clase propietaria `ShinraForCausalLM` |
| Parametros totales | 3.926.076.416 (3,93B), embeddings atados (tied embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en entrenamiento; 32.768 tokens de ventana nativa (ampliable con YaRN) |
| Tipos de cuantizacion | No disponible: el autor solo publica pesos en BF16. No se anuncian GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Ingles, ruso, aleman, frances, espanol, chino, japones, coreano y arabe (9 idiomas declarados) |
| Licencia | `other` / `nullxes-research` (codigo fuente bajo NULLXES Research License; pesos declarados activo propietario de NULLXES) |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |
| Tamano del repositorio | 7,9 GB |
| Hidden size | 3072 |
| Numero de capas | 32 |
| Atencion | GQA: 24 cabezas de consulta / 8 cabezas KV, dimension de cabeza 128 |
| MLP | SwiGLU, tamano intermedio 9216 |
| Normalizacion | RMSNorm, pre-norm + QK-norm |
| Posiciones | RoPE con theta = 1e6, preparado para YaRN |
| Vocabulario | 131.072 tokens, SentencePiece Unigram con byte fallback |
| Precision | BF16 |
| Kernels de atencion | PyTorch SDPA Flash / FlashAttention-2 |
| Descargas / likes | 81 descargas, 0 likes |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

El bloque de la arquitectura sigue el patron `RMSNorm → GQA+RoPE → residual → RMSNorm → SwiGLU → residual`, con una RMSNorm final y una cabeza LM atada a los embeddings. La atencion agrupada (24/8) reduce el coste de cache KV frente a atencion multi-cabeza completa, y la incorporacion de QK-norm busca estabilizar el entrenamiento a precision BF16. El modelo se distribuye con `custom_code`, por lo que su carga en `transformers` exige `trust_remote_code=True`; ademas, la model card referencia el identificador `NULLXES/SHINRA-4B-INSTRUCT` en los ejemplos de carga, distinto del identificador real del repositorio publicado.

El entrenamiento se describe en tres etapas. El pretrain (NULLXES SHINRA-4B-BASE) usa la mezcla SHINRA_PRETRAIN_V1: 40% FineWeb-Edu, 20% codigo (python-edu y Stack con licencia), 15% matematicas y ciencia (OpenWebMath, ProofPile-2, peS2o y cuerpos completos de arXiv), 10% libros (PG19 y Gutenberg, sin TinyStories), 10% Wikipedia en ruso, aleman y frances, y 5% ingenieria interna de NULLXES (robotica, CUDA y documentacion). El presupuesto declarado es de 200.000 millones de tokens, con cuotas por idioma de 75% ingles, 15% ruso y 10% otros. El pipeline de filtrado incluye ftfy, heuristicas de calidad Gopher/FineWeb, identificacion de script e idioma, heuristicas de toxicidad, filtros AST/minificado para codigo y deduplicacion MinHash-LSH con umbral de Jaccard 0,80.

La etapa SFT mezcla 30% conversacion (Tulu y SmolTalk), 25% codigo, 20% matematicas, 15% herramientas y JSON (function calling de Hermes) y 10% general (OpenHermes), empaquetada a 8.192 tokens con la perdida calculada solo sobre los tokens del asistente. La alineacion posterior usa DPO con 40% UltraFeedback, 30% preferencias de codigo Python, 20% mezcla de instrucciones y herramientas y 10% formato (Orca), con beta = 0,10. El entrenamiento se realizo sobre NVIDIA A100 de 80 GB en configuracion de 8 GPU con FSDP FULL_SHARD, BF16, gradient checkpointing y AdamW fusionado. La model card indica que los pesos exactos de la mezcla se encuentran en `configs/data_mix.yaml`, archivo no incluido en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat propia y tokens de rol (`<|system|>`, `<|user|>`, `<|assistant|>`).
- Seguimiento de instrucciones, incluida la variante alineada con DPO descrita en la model card.
- Generacion de codigo, con un 25% de la mezcla SFT dedicado a codigo y un 30% de la mezcla DPO orientada a preferencias de codigo Python.
- Razonamiento matematico y cientifico basico, con un 20% de la mezcla SFT en matematicas y un 15% del pretrain en matematicas y ciencia.
- Soporte de tool calling y function calling, con tokens dedicados `<|tool_call|>` y `<|tool_response|>` y un 15% de la mezcla SFT en herramientas y JSON (formato Hermes).
- Salidas estructuradas en JSON, segun la seccion de uso previsto de la model card.
- Modo de razonamiento explicito mediante el token `<|reasoning|>`.
- Procesamiento de documentos con tokens `<|document|>` y `<|end_of_text|>` como secuencia de parada de documento.
- Capacidades multilingues declaradas en 9 idiomas: ingles, ruso, aleman, frances, espanol, chino, japones, coreano y arabe.
- Preparacion para agentes: la model card posiciona SHINRA como capa de lenguaje de los agentes RAIDEN y AION, aunque no detalla un bucle de agente implementado.
- Ventana de contexto de 32.768 tokens en inferencia (frente a 8.192 en entrenamiento), mediante extrapolacion RoPE tipo YaRN.

## Casos de uso

- Asistente conversacional multilingue: el modelo cubre 9 idiomas declarados y mantiene conversaciones multi-turno con 32.768 tokens de ventana nativa, suficiente para hilos largos de soporte sin resumir el historial.
- Generacion de codigo asistida en editor: el 25% de la mezcla SFT y el 30% de la mezcla DPO se orientan a codigo, por lo que puede usarse para autocompletado, explicacion de funciones y generacion de tests en Python y otros lenguajes.
- Extraccion de datos estructurados: con tokens de tool call y un 15% de SFT en JSON, es adecuado para convertir texto libre en esquemas JSON validables dentro de un pipeline de ETL.
- Orquestacion de herramientas en agentes internos: los tokens `<|tool_call|>` y `<|tool_response|>` permiten modelar el ciclo peticion-respuesta de una herramienta, util para prototipos de agentes con funciones acotadas y validadas externamente.
- Resumen y analisis de documentos tecnicos: la ventana de 32.768 tokens admite articulos, informes o documentacion extensa en una sola pasada, con tokens `<|document|>` para delimitar el material de entrada.
- Traduccion y localizacion entre los idiomas soportados: util para borradores de contenido en pares como ingles-ruso, ingles-aleman o ingles-espanol, siempre con revision humana por tratarse de un modelo de 3,93B.
- Generacion de borradores de razonamiento matematico paso a paso: el token `<|reasoning|>` permite separar la traza intermedia de la respuesta final en aplicaciones educativas o de verificacion.
- Clasificacion y enrutado de tickets con contexto largo: dado su coste de inferencia bajo y su ventana de 32k, encaja en tareas de etiquetado y triaje donde no se requiere razonamiento multi-salto profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la suite de evaluacion prevista y los comandos para ejecutarla, pero no incluye ninguna cifra:

- Suite declarada: ARC-Challenge, HellaSwag, WinoGrande, TruthfulQA, MMLU, GSM8K, HumanEval, MBPP y needle-in-a-haystack entre 2k y 32k.
- Comandos indicados: `python -m evaluation.perplexity`, `python -m evaluation.harness` y `python -m evaluation.needle`.
- No se proporcionan valores de perplejidad, puntuaciones por tarea ni comparaciones con otros modelos.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 7,9 GB (coincide con el tamano del repositorio de 7,9 GB).
- Pesos en FP16: aproximadamente 7,9 GB. Pesos en INT8: aproximadamente 4 GB. Pesos en INT4: aproximadamente 2 GB. Estas cifras son estimaciones derivadas del numero de parametros; el autor no publica cuantizaciones.
- Cache KV (estimacion derivada de la arquitectura, BF16): 128 KB por token (32 capas x 8 cabezas KV x 128 de dimension x 2 tensores x 2 bytes). Esto supone aproximadamente 1 GB a 8.192 tokens y aproximadamente 4 GB a 32.768 tokens, adicionales a los pesos.
- GPU consumer: cabe en BF16 en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado; en una RTX 3060 de 12 GB queda muy ajustado en BF16 (7,9 GB de pesos mas cache KV) y requeriria cuantizacion, no publicada por el autor.
- GPU de datacenter: A100 80 GB y H100 son las opciones naturales para servicio con lotes concurrentes y contexto completo de 32k. El autor indica que el entrenamiento se hizo en 8x A100 80 GB con FSDP.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via soportada explicitamente. vLLM, TGI, llama.cpp u Ollama requeririan soporte de la arquitectura propietaria o conversion a GGUF; ninguna de las dos cosas se anuncia en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, latencia de primer token ni rendimiento con procesamiento por lotes.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus model cards publicas y deben verificarse antes de tomar decisiones. Para NULLXES SHINRA-4B no hay resultados de benchmarks publicados, por lo que la comparacion se limita a parametros, contexto y licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NULLXES SHINRA-4B (SMOKE) | 3,93B | 8k entrenamiento / 32k nativo | `nullxes-research` (propietaria) | HuggingFace, requiere `trust_remote_code` |
| Qwen2.5-3B | 3,09B | 32k nativo, ampliable a 128k | Apache-2.0 | HuggingFace, amplio ecosistema de cuantizaciones |
| Llama-3.2-3B | 3,21B | 128k | Llama 3.2 Community License | HuggingFace, soporte en vLLM, llama.cpp y Ollama |
| Phi-3.5-mini-instruct | 3,8B | 128k | MIT | HuggingFace, soporte amplio en runtimes de inferencia |

Diferencias relevantes: SHINRA-4B es el unico de los cuatro con licencia propietaria, el unico que exige ejecucion de codigo remoto para cargarse y el unico sin cuantizaciones publicadas ni resultados de benchmarks. Su ventana nativa de 32k queda por debajo de las alternativas comparadas. El rendimiento relativo en tareas concretas no puede evaluarse con la informacion disponible.

## Limitaciones y advertencias

- Capacidad densa de 3,93B: la propia model card reconoce que es mas debil que modelos de clase 70B en razonamiento multi-salto y lenguas poco representadas.
- Presupuesto de pretrain de 200.000 millones de tokens: por encima del optimo Chinchilla para su tamano, pero muy por debajo de los volumenes de entrenamiento de modelos frontera.
- Riesgo de alucinacion: no se publica ningun resultado en TruthfulQA ni en tareas de factualidad, por lo que no hay evidencia cuantitativa de fiabilidad factual.
- Contexto: por encima de 8.192 tokens el modelo depende de extrapolacion RoPE tipo YaRN. La model card recomienda explicitamente repetir pruebas de needle-in-haystack despues de cualquier extension.
- Idiomas: aunque se declaran 9 idiomas, las cuotas de pretrain concentran el 75% en ingles y el 15% en ruso; el resto de idiomas, incluido el espanol, cuentan con una cuota agregada del 10%, lo que anticipa un rendimiento desigual.
- Sesgos y toxicidad: los filtros aplicados son heuristicas mas clasificadores opcionales; el autor advierte de posible contenido danino residual.
- Licencia: los pesos se declaran activo propietario de NULLXES y la redistribucion de checkpoints requiere autorizacion escrita. El uso comercial no se autoriza de forma generica y no hay una licencia estandar verificable.
- Codigo remoto: la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio. Debe auditarse antes de usarlo en cualquier entorno.
- Ambiguedad del artefacto: el repositorio se llama `NULLXES-SHINRA-4B-SMOKE` mientras que la model card describe `NULLXES SHINRA-4B-INSTRUCT` y los ejemplos de carga apuntan a `NULLXES/SHINRA-4B-INSTRUCT`. El sufijo SMOKE sugiere una prueba de humo, no un checkpoint final.
- Falta de validacion externa: 81 descargas y 0 likes en el momento de redactar esta ficha, sin resultados de benchmarks ni evaluaciones de terceros.
- Uso fuera de alcance declarado: el autor excluye decisiones autonomas de alto riesgo, asesoramiento medico o legal y agentes de internet abiertos sin restricciones, sin capas adicionales de alineacion y politica.

## Enlaces

- HuggingFace: https://huggingface.co/MagistrTheOne/NULLXES-SHINRA-4B-SMOKE
- Licencia referenciada en el repositorio: archivo `LICENSE` (NULLXES Research License)
- Repositorio de codigo, paper, blog o demo: no disponible
- Los resultados de busqueda web proporcionados no contienen ninguna referencia relevante al modelo (devuelven paginas de fabricantes de falsos techos y plafones), por lo que no hay enlaces adicionales que citar.
