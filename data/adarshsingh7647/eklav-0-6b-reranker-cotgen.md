# AdarshSingh7647/Eklav-0.6B-Reranker-CotGen

## Resumen

Eklav-0.6B-Reranker-CotGen es un modelo de reranking de pasajes (pointwise) obtenido por ajuste fino supervisado del modelo base Qwen/Qwen3-0.6B. Lo publica el usuario AdarshSingh7647 dentro del proyecto Eklavya, y su particularidad es que el modelo no responde con una etiqueta seca de relevancia, sino que genera una cadena de razonamiento interna que termina en `</think> true` o `</think> false`; la puntuación de relevancia se obtiene como la probabilidad normalizada del token `true` en ese punto. La model card lo identifica como la variante «Std-SFT» del reranker, frente a la variante «Eklav» publicada por separado.

El modelo resuelve un problema concreto de los pipelines RAG y de búsqueda: decidir si un pasaje recuperado es relevante para una consulta, con la posibilidad de inspeccionar el razonamiento que justifica la decisión. Al partir de Qwen3-0.6B, sus 596 millones de parámetros lo sitúan en un rango muy ligero, apto para desplegarse en GPU de consumo y para reordenar decenas o cientos de candidatos por consulta con coste reducido.

Su relevancia actual radica en la comparación que reporta el autor en BRIGHT nDCG@10: la receta Eklav mejora de forma consistente a la receta Std-SFT sobre bases Qwen3-4B, Qwen3-8B, GLM-Z1-9B y Qwen3-14B, lo que sugiere que la ganancia proviene del método de entrenamiento más que del tamaño. No obstante, la información pública disponible es escasa: no hay licencia declarada, no se detallan idiomas ni composición del dataset, y los benchmarks se limitan a la tabla agregada de BRIGHT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `max_model_len=16000` en vLLM |
| Tipos de cuantizacion | no disponible (repo con pesos safetensors; no se listan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | text-generation |
| Libreria | transformers |
| Tamano del repositorio | 1.2 GB |
| Modelo base | Qwen/Qwen3-0.6B |
| Fecha de creacion / actualizacion | 2026-08-26 / 2026-10-15 |
| Descargas / likes | 347 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B, un transformer decoder-only denso de 596 millones de parámetros. El ajuste fino no introduce cambios estructurales: el modelo conserva el tokenizador y el formato de chat del base, y aprende un comportamiento de razonamiento seguido de una decisión binaria de relevancia. La innovación está en la formulación de la tarea, no en el bloque de atención: el reranker es pointwise, al estilo de Rank1, y emite su veredicto como el token `true` o `false` inmediatamente después de cerrar el bloque de pensamiento.

El entrenamiento se describe como Std-SFT, con la función de pérdida aplicada tanto al razonamiento del profesor como a la respuesta final. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, el origen de las trazas de razonamiento del profesor, ni si hubo una fase posterior de RLHF o DPO. Tampoco se documenta ninguna técnica de decodificación especulativa ni atención lineal. El prompt de inferencia que publica el autor fija la instrucción «Answer only with 'true' or 'false'» y abre el bloque `<think>` para forzar la generación del razonamiento antes del veredicto.

## Capacidades

- Reranking de pasajes pointwise: dada una consulta y un pasaje, produce una puntuación de relevancia continua a partir de la probabilidad del token `true`.
- Generación de razonamiento explícito antes de la decisión, terminado en `</think> true` o `</think> false`, lo que permite auditar por qué un pasaje se considera relevante.
- Extracción de logprobs por token: el flujo de puntuación depende de `logprobs` en la salida, por lo que requiere un motor de inferencia que los exponga.
- Generación de texto conversacional heredada del modelo base Qwen3-0.6B.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso más allá del reranking: no disponible.
- Capacidades multilingües: no disponible.
- Visión o audio: no disponibles.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación inicial densa o híbrida, el modelo reordena los candidatos puntuando cada par consulta-pasaje y se conservan los mejores para el generador final. Su tamaño de 0.6B permite procesar muchos pares por consulta sin dominar el coste de latencia.
- Filtrado de contexto para modelos grandes: en arquitecturas de dos etapas, este reranker actúa como compuerta barata que descarta pasajes irrelevantes antes de enviarlos a un modelo de 30B o superior, reduciendo tokens de entrada y riesgo de distracción.
- Búsqueda empresarial sobre documentación interna: se puede integrar como etapa de reordenación en un buscador sobre wikis o manuales, aprovechando la salida de razonamiento para depurar por qué ciertos documentos se priorizan.
- Evaluación de calidad de recuperación: al ser un scorer determinista con `temperature=0`, sirve para construir conjuntos de evaluación de retrievers comparando las puntuaciones del reranker contra juicios humanos.
- Destilación de razonamiento en recuperación: las trazas generadas antes del `true`/`false` pueden usarse como datos de entrenamiento para modelos de reranking más pequeños o para analizar patrones de relevancia.
- Despliegue en hardware modesto: al caber en GPU de consumo, es adecuado para prototipos locales de asistentes documentales donde no hay presupuesto para un reranker de 7B o 14B.
- Clasificación binaria de pares consulta-documento en moderación de contenido o deduplicación semántica, reutilizando el mismo esquema de puntuación.

## Benchmarks y rendimiento

La model card reporta únicamente resultados agregados en BRIGHT nDCG@10, comparando la receta Std-SFT con la receta Eklav sobre distintos modelos base. No se publican resultados de MMLU, HumanEval, GSM8K ni métricas por tarea de BRIGHT.

| BRIGHT nDCG@10 | Qwen3-4B | Qwen3-8B | GLM-Z1-9B | Qwen3-14B |
|---|---|---|---|---|
| Std-SFT | 29.3 | 31.5 | 30.1 | 32.5 |
| Eklav | 31.5 | 34.2 | 33.2 | 34.7 |

No se han publicado en la información disponible resultados de benchmark para este checkpoint concreto de 0.6B; la tabla anterior corresponde a las recetas aplicadas a otros modelos base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1.2 GB solo para pesos, más overhead de KV cache y activaciones; con `max_model_len=16000` el consumo adicional de caché es apreciable pero manejable.
- Cuantización a 8 bits: aproximadamente 0.6 GB de pesos; a 4 bits, en torno a 0.3-0.4 GB. No se distribuyen pesos cuantizados en el repositorio, por lo que habría que generarlos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto largo; RTX 3060, RTX 4060, RTX 4090, L4, A10, A100 y H100 son válidas. Cabe en GPU de consumo sin problema.
- Despliegue: el ejemplo oficial usa vLLM con `max_model_len=16000` y `SamplingParams(logprobs=20)`. También es compatible con TGI (tag `text-generation-inference`) y con transformers. Para llama.cpp u Ollama haría falta convertir los pesos a GGUF, conversión no documentada por el autor.
- Latencia y throughput: no disponibles. Al generar hasta 8192 tokens de razonamiento por par, el coste por puntuación es mayor que el de un cross-encoder clásico; conviene limitar `max_tokens` en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eklav-0.6B-Reranker-CotGen | 0.6B | no disponible (ejemplo a 16k) | Reranker pointwise con razonamiento | no disponible | Hugging Face |
| Rank1-7B (jhu-clsp) | 7B | no disponible | Reranker pointwise con razonamiento, referenciado por el autor | no disponible en esta ficha | Hugging Face |
| Qwen3-0.6B base | 0.6B | no disponible en esta ficha | LLM generativo, sin entrenamiento de reranking | no disponible en esta ficha | Hugging Face |
| Eklav-Passage-0.6B | 0.6B | no disponible | Variante Eklav del mismo reranker | no disponible | Hugging Face |

La comparación cuantitativa solo está disponible frente a las recetas aplicadas a Qwen3-4B, Qwen3-8B, GLM-Z1-9B y Qwen3-14B en BRIGHT nDCG@10 (ver sección de benchmarks); no hay una tabla directa frente a Rank1-7B ni frente a cross-encoders clásicos.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o verificar el repo antes de integrarlo en producción.
- Idiomas no documentados: el comportamiento fuera del inglés es incierto, ya que la model card no especifica cobertura lingüística.
- Riesgo de alucinación en el razonamiento: al generar cadenas de pensamiento antes del veredicto, el modelo puede producir justificaciones plausibles pero incorrectas; la puntuación final puede ser menos fiable si el razonamiento se desvía.
- Coste de inferencia elevado por par: el ejemplo permite hasta 8192 tokens de generación, lo que encarece el reranking frente a un cross-encoder de una sola pasada. Es necesario acotar `max_tokens` y validar la calidad con presupuestos menores.
- Dependencia de logprobs y de un motor compatible: la puntuación requiere acceso a `logprobs` y a un stop string concreto; motores que no expongan logprobs no pueden usar el flujo tal cual.
- Fragilidad del parseo: el propio autor advierte de un posible desfase de un token en la coincidencia del stop string de vLLM, lo que obliga a escanear los logprobs en orden inverso y añade complejidad al código de integración.
- Contexto máximo no confirmado: el `max_model_len=16000` del ejemplo es una configuración de despliegue, no una especificación verificada del modelo; pasajes muy largos pueden truncarse.
- Escasa trazabilidad del entrenamiento: sin datos de dataset, tokens ni proceso de anotación, es difícil evaluar sesgos o generalización fuera del dominio de BRIGHT.
- Métricas limitadas: solo hay nDCG@10 agregado en BRIGHT para las recetas sobre otros modelos base; no hay evaluación publicada de este checkpoint de 0.6B ni de tareas fuera de BRIGHT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/Eklav-0.6B-Reranker-CotGen
- Variante Eklav: https://huggingface.co/AdarshSingh7647/Eklav-Passage-0.6B
- Repositorio de código Eklavya: https://github.com/AdarshSingh7647/Eklavya
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Rank1 (referencia de enfoque): https://huggingface.co/jhu-clsp/rank1-7b
