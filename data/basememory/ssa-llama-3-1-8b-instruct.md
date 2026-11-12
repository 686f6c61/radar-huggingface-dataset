# BaseMemory/SSA-Llama-3.1-8B-Instruct

## Resumen

SSA-Llama-3.1-8B-Instruct es un adaptador LoRA (PEFT) sobre Meta Llama 3.1 8B Instruct que implementa atención dispersa adaptativa al contenido (SSA, *Sub-Quadratic Sparse Attention*) para inferencia de contexto largo. Lo desarrolla onlyaady como investigación independiente y se publica bajo la cuenta BaseMemory en Hugging Face. El objetivo declarado es preservar la capacidad de contexto largo de Llama 3.1 mientras la atención se vuelve progresivamente más eficiente a medida que crece la secuencia.

El checkpoint modifica un subconjunto de capas del transformer para que seleccionen regiones relevantes del historial en lugar de atender densamente sobre toda la secuencia. Según la model card, la configuración evaluada limita el soporte semántico a aproximadamente 8.196 claves por consulta, lo que reduce la aritmética de atención QK/PV entre 2× a 32K y 61× a 1M de tokens (medidas semánticas, no FLOPs totales del modelo).

Es relevante ahora porque propone una vía práctica para abaratar la inferencia en contextos de 64K-1M tokens sin reentrenar el modelo base desde cero, un problema abierto en despliegues de agentes y RAG con ventanas muy largas. No obstante, es un lanzamiento de investigación: requiere un runtime propio de atención dispersa que aún no se ha publicado y no sustituye a Llama 3.1 estándar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con atención dispersa adaptativa al contenido en un subconjunto de capas, empaquetado como adaptador LoRA |
| Parametros totales | 8B (modelo base); el adaptador LoRA ocupa 0,1 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado para 16K; evaluado en retrieval de 16K a 128K; operador evaluado hasta 1M |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos PEFT/LoRA en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base meta-llama/Llama-3.1-8B-Instruct |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B Instruct, un transformer decoder-only denso con RoPE y GQA. Sobre él se entrena un adaptador LoRA que introduce rutas de atención dispersa en una parte de las capas: en lugar de atender causalmente a todas las claves previas, el mecanismo localiza regiones históricas relevantes según el contenido de la consulta y combina contexto local con contexto seleccionado. La configuración evaluada fija un fanout máximo de 8.196 claves por consulta.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO adicionales sobre el base. La model card indica que el modelo se entrenó para soportar 16K de contexto y que la evaluación de retrieval se realizó con diagnósticos controlados *teacher-forced*. El adaptador se distribuye con PEFT 0.19.1 y Transformers, pero la atención dispersa depende de un operador personalizado cuyo paquete de inferencia reproducible se anunciará por separado.

## Capacidades

- Generación de texto en inglés heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones del modelo base, potencialmente alterados por el adaptador LoRA.
- Retrieval de contexto largo: recuperación de un solo hecho con NLL muy baja hasta 64K y Top-1 del primer token de respuesta del 100 % en los casos diagnósticos reportados.
- Retrieval multi-hecho fuerte hasta 48K, con degradación apreciable a 64K (NLL 0,06979).
- Atención dispersa adaptativa al contenido con ventaja computacional creciente según la longitud de contexto.
- Soporte de tool calling, function calling y agentes: no confirmado específicamente para este checkpoint; se heredaría del base solo si el adaptador no lo degrada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en atención dispersa: banco de pruebas para medir la relación calidad/computación de rutas SSA frente a atención densa en Llama 3.1, usando los diagnósticos de retrieval de 16K a 128K.
- Retrieval de documento único en corpus largos: indexación de informes o expedientes de hasta 64K tokens donde el modelo muestra NLL prácticamente nula en recuperación de un hecho concreto.
- Evaluación de operadores de atención: comparación del speedup del operador SSA (hasta ~14,2× a 1M tokens) con implementaciones FlashAttention en kernels aislados.
- Estudio de routing basado en contenido: análisis de cómo el modelo selecciona regiones históricas relevantes, útil para diseñar mecanismos de memoria en agentes.
- Prototipado de pipelines RAG de contexto extendido: pruebas controladas de recuperación multi-hecho hasta 48K antes de adoptar una solución de producción.
- Reproducción académica: base para replicar los resultados de la futura publicación sobre SSA y comparar con variantes de atención lineal o híbridas.
- Análisis de degradación multi-hecho: caracterización del punto de ruptura entre 48K y 64K para informar decisiones de truncado de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo incluye diagnósticos de retrieval *teacher-forced* y medidas del operador de atención.

| Contexto | NLL single-fact | NLL multi-fact |
|---:|---:|---:|
| 16K | 0,00001 | 0,00006 |
| 32K | 0,00005 | 0,00114 |
| 48K | 0,00026 | 0,00237 |
| 64K | 0,00015 | 0,06979 |

| Contexto | Claves/consulta densas (media causal) | Fanout SSA | Reducción aritmética atención | Trabajo QK/PV ahorrado |
|---:|---:|---:|---:|---:|
| 32K | 16.384 | 8.196 | 2,00× | 50,0 % |
| 64K | 32.768 | 8.196 | 4,00× | 75,0 % |
| 128K | 65.536 | 8.196 | 8,00× | 87,5 % |
| 256K | 131.072 | 8.196 | 15,99× | 93,75 % |
| 512K | 262.144 | 8.196 | 31,98× | 96,87 % |
| 1M | ~500.000 | 8.196 | 61,01× | 98,36 % |

| Contexto | Velocidad relativa del operador SSA |
|---:|---:|
| 64K | ~1,0× |
| 128K | ~1,9× |
| 256K | ~3,7× |
| 512K | ~7,3× |
| 1M | ~14,2× |

El Top-1 del primer token de respuesta se mantuvo en el 100 % en todos los casos diagnósticos. Estas cifras son medidas del operador de atención, no speedups extremo a extremo del LLM.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para este checkpoint; al ser un adaptador sobre Llama 3.1 8B, los requisitos son los del base más el runtime SSA personalizado.
- GPU recomendadas: no disponible en la información proporcionada. El modelo base Llama 3.1 8B suele ejecutarse en A100, H100 o RTX 4090, pero el operador SSA no documenta compatibilidad ni kernels optimizados por GPU.
- Cabe en GPU de consumo: no confirmado; depende de la implementación del operador disperso, no publicada.
- Opciones de despliegue: Transformers + PEFT 0.19.1 para cargar el adaptador, pero la atención dispersa requiere el runtime propietario pendiente de publicación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reportan medidas relativas del operador de atención (hasta ~14,2× a 1M tokens); no hay datos de latencia extremo a extremo ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Mecanismo de atención | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| SSA-Llama-3.1-8B-Instruct | 8B + adaptador LoRA | Entrenado 16K, evaluado hasta 128K | Dispersa adaptativa al contenido en subconjunto de capas | Apache 2.0 | Adaptador público; runtime pendiente |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Densa causal | Llama 3.1 Community License | Público y ampliamente soportado |
| Mistral-7B-Instruct-v0.3 | 7B | 32K | Densa causal con sliding window | Apache 2.0 | Público y ampliamente soportado |
| Qwen2.5-7B-Instruct | 7B | 128K | Densa causal | Apache 2.0 | Público y ampliamente soportado |

La comparación de rendimiento con estas alternativas no está disponible: no hay benchmarks estándar publicados para SSA-Llama-3.1-8B-Instruct que permitan una comparación directa.

## Limitaciones y advertencias

- Solo un subconjunto de capas usa la ruta dispersa SSA; el modelo no es completamente subcuadrático.
- Entrenado para 16K de contexto; el rendimiento a 64K-128K proviene de diagnósticos de retrieval, no de generación libre.
- El retrieval multi-hecho se degrada notablemente a 64K (NLL 0,06979 frente a 0,00237 a 48K).
- Los resultados de velocidad a 1M son medidas del operador de atención, no del modelo extremo a extremo.
- Cargar el adaptador con Transformers estándar no reproduce el comportamiento ni las métricas de atención dispersa; falta el runtime.
- Evaluaciones de generación libre y Needle-in-a-Haystack autorregresivo aún en curso.
- Idioma limitado al inglés.
- Riesgo de alucinación y sesgos heredados de Llama 3.1 8B Instruct, no reevaluados para este checkpoint.
- Licencia Apache 2.0 declarada para el adaptador, pero el modelo base se rige por la Llama 3.1 Community License, cuyos términos deben respetarse para uso comercial.
- Lanzamiento de investigación: no recomendado como sustituto de producción de Llama 3.1 estándar.
- Repositorio con 8 descargas y 1 like; validación externa prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/BaseMemory/SSA-Llama-3.1-8B-Instruct
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Referencia al checkpoint original citado en la model card: `onlyaady/SSA-Llama-3.1-8B-Instruct` (sin URL verificada en la información disponible)
- Paper: no disponible (manuscrito en preparación)
- Blog o demo: no disponible
- Repositorio de código o runtime SSA: no disponible (anunciado para publicación futura)
