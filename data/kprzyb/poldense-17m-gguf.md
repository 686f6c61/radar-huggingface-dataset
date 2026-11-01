# kprzyb/PolDense-17M-GGUF

## Resumen

PolDense-17M-GGUF es la conversión a formato GGUF del modelo OPI-PIB/PolDense-17M, un modelo de embeddings densos para recuperación de información (dense retrieval) en polaco, construido sobre la arquitectura ModernBERT. Lo desarrolla el usuario kprzyb como conversión no oficial, no afiliada al equipo original de OPI-PIB, y su propósito es permitir la ejecución del modelo en llama.cpp y en las herramientas que se construyen sobre él (llama-server, node-llama-cpp, etc.).

El modelo resuelve una necesidad concreta: disponer de un encoder ligero (16,8 millones de parámetros) capaz de generar embeddings de alta calidad para búsqueda semántica y similitud de frases en polaco, con un coste computacional mínimo. Al estar en GGUF con pooling CLS y soporte de contexto largo en una sola micro-batch, resulta adecuado para despliegues en CPU o en hardware modesto dentro de pipelines RAG.

La relevancia actual radica en que la mayoría de los modelos de embeddings de calidad están orientados al inglés o son multilingües de gran tamaño; este modelo ofrece una alternativa específica para polaco con un peso de 19 MiB en Q8_0 y 34 MiB en F16, lo que facilita su integración en sistemas locales y en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) |
| Parametros totales | 16.797.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8192 tokens en llama.cpp (configurado con `-c 8192`); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16 y Q8_0 (ficheros GGUF incluidos) |
| Idiomas soportados | polaco (pl) |
| Licencia | Gemma Terms of Use (restricciones de uso de la seccion 3.2 y politica de usos prohibidos) |
| Formato de pesos | GGUF (F16: 34 MiB; Q8_0: 19 MiB) |

## Arquitectura y entrenamiento

El modelo base OPI-PIB/PolDense-17M emplea la arquitectura ModernBERT, un transformer encoder bidireccional modernizado que incorpora mejoras de eficiencia respecto a BERT clásico (atención optimizada, RoPE y otras modificaciones propias de la familia ModernBERT). Con 16,8 millones de parámetros, se trata de un modelo compacto orientado a generar representaciones vectoriales densas para tareas de similitud semántica y recuperación.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp (commit `4a80943`, `--outtype f32`) y posteriormente se cuantizó con `llama-quantize` (release b9297) a F16 y Q8_0. No se modificó nada más allá de la conversión y cuantización. El pooling es CLS y queda almacenado en los metadatos del GGUF. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada; la model card remite a la del modelo original.

Una particularidad técnica importante: al usar atención bidireccional, llama.cpp debe procesar todo el texto en una sola micro-batch (`-ub` y `-b` iguales o superiores a la longitud del input en tokens), de lo contrario el vector resultante solo cubriría el último fragmento. Además, los runtimes GGUF no leen los prompts de `config_sentence_transformers.json`, por lo que los prefijos deben añadirse manualmente en el código.

## Capacidades

- Generación de embeddings densos para similitud semántica de frases y recuperación de información en polaco.
- Extracción de características (feature-extraction) y representaciones vectoriales con pooling CLS.
- Soporte de tareas asimétricas de recuperación mediante prefijo `"[query]: "` en las consultas (los documentos no llevan prefijo).
- Soporte de tareas simétricas de similitud semántica mediante prefijo `"[sts]: "` en ambos textos.
- Procesamiento de textos largos (verificado con un texto polaco de 3052 tokens) siempre que se configure la micro-batch adecuadamente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo exclusivamente de embeddings.
- Capacidad multilingüe limitada: el idioma declarado es únicamente polaco.

## Casos de uso

- Búsqueda semántica en corpus polacos: indexar documentos con embeddings del modelo (sin prefijo) y consultar con el prefijo `"[query]: "`, usando similitud coseno para recuperar los pasajes más relevantes. El tamaño reducido permite indexar grandes volúmenes con coste mínimo.
- Pipelines RAG (retrieval-augmented generation) en polaco: usar el modelo como recuperador en un sistema que alimente a un LLM generativo, aprovechando los 19 MiB en Q8_0 para ejecutarlo en CPU junto al generador.
- Deduplicación y agrupación de documentos: calcular embeddings de cada texto con prefijo `"[sts]: "` y agrupar por similitud coseno para detectar duplicados o near-duplicates en bases documentales polacas.
- Motor de similitud de frases en aplicaciones locales: integrar en aplicaciones de escritorio o móviles mediante llama.cpp o node-llama-cpp, con requisitos de memoria mínimos (menos de 100 MiB).
- Filtrado y clasificación semántica de tickets o consultas: comparar la consulta del usuario con un conjunto de plantillas o categorías precalculadas para enrutar automáticamente en un sistema de atención al cliente en polaco.
- Búsqueda en documentación técnica o legal polaca: indexar fragmentos largos (hasta 8192 tokens configurados) y recuperar secciones relevantes con contexto amplio, gracias a la ventana extendida en llama.cpp.
- Evaluación de calidad de traducciones o paráfrasis: comparar el embedding del texto original y el generado con prefijo `"[sts]: "` para medir similitud semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente incluye una verificación de fidelidad de la conversión, que compara la similitud coseno entre los embeddings generados por llama-server (CPU) y el modelo original con sentence-transformers (fp32, CPU):

| Fichero | Similitud coseno mínima, textos cortos | Similitud coseno, texto largo (3052 tokens) |
|---|---|---|
| F16 | 0.99999 | 0.99995 |
| Q8_0 | 0.99925 | 0.99955 |

Estos datos confirman que la cuantización Q8_0 introduce una degradación mínima respecto al modelo original, pero no constituyen benchmarks de calidad en tareas de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el fichero Q8_0 ocupa 19 MiB y el F16 34 MiB. Cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; no requiere GPU dedicada. Funciona correctamente en CPU.
- Cabe en consumer GPU: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Opciones de despliegue: llama.cpp (llama-server con `--embedding --pooling cls`), node-llama-cpp y cualquier runtime compatible con GGUF. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Configuración recomendada en llama-server: `-c 8192 -b 8192 -ub 8192` para garantizar que el texto completo se procese en una sola micro-batch.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia muy baja en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de embeddings en polaco ni con alternativas de tamaño similar. El modelo base es OPI-PIB/PolDense-17M, del que esta ficha es una conversión cuantizada; no se dispone de datos de otros modelos comparables en la documentación consultada.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada a OPI-PIB y no cuenta con su respaldo; para detalles de entrenamiento y benchmarks debe consultarse la model card original.
- Licencia Gemma Terms of Use: sujeta a las restricciones de uso de la sección 3.2 y a la Gemma Prohibited Use Policy. Si se redistribuyen los ficheros o derivados, deben incluirse las restricciones de uso como provisión exigible y entregar una copia de los términos.
- Idioma limitado al polaco: no se declara soporte para otros idiomas, por lo que su uso en castellano u otras lenguas no está validado.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, pero puede producir representaciones poco discriminativas en dominios muy alejados de los datos de entrenamiento; no se dispone de información sobre sesgos.
- Requisito crítico de batching: si el runtime divide el texto en fragmentos (por ejemplo, node-llama-cpp con batch por defecto de 512), el embedding resultante solo cubrirá el último fragmento, produciendo resultados incorrectos de forma silenciosa.
- Prefijos manuales: los runtimes GGUF no leen los prompts de `config_sentence_transformers.json`, por lo que `"[query]: "` y `"[sts]: "` deben añadirse en el código; omitirlos degrada la calidad de la recuperación.
- Normalización: es necesario normalizar los vectores y usar similitud coseno para comparar embeddings.
- Contexto: aunque se configura hasta 8192 tokens en llama.cpp, el contexto nativo del modelo base no se especifica en la información disponible; superar el límite real puede degradar la calidad.
- Producción: la verificación de fidelidad se realizó con solo 6 textos cortos y un texto largo, por lo que la validación es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kprzyb/PolDense-17M-GGUF
- Modelo base: https://huggingface.co/OPI-PIB/PolDense-17M
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Issue de qmd sobre el troceado silencioso: https://github.com/tobi/qmd/issues/897
