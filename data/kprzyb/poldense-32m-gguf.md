# kprzyb/PolDense-32M-GGUF

## Resumen

PolDense-32M-GGUF es la conversión no oficial al formato GGUF del modelo OPI-PIB/PolDense-32M, un modelo de embeddings densos para recuperación de información en polaco construido sobre la arquitectura ModernBERT. Lo publica el usuario kprzyb, sin vinculación con el equipo original OPI-PIB, y su propósito es permitir ejecutar el modelo en llama.cpp y en las herramientas construidas sobre dicho runtime (llama-server, wrappers de node-llama-cpp, etc.). El modelo resuelve la tarea de generar representaciones vectoriales densas para búsqueda semántica, similitud de frases y feature extraction en textos en polaco.

El modelo base tiene 31.883.136 parámetros (aproximadamente 32 millones), lo que lo sitúa en la gama muy ligera: el repositorio completo ocupa 0,1 GB y los ficheros GGUF publicados pesan 63 MiB en F16 y 34 MiB en Q8_0. La conversión mantiene la atención bidireccional de ModernBERT, lo que impone una restricción operativa importante en llama.cpp: todo el texto debe procesarse en un único micro-batch, con `-b` y `-ub` iguales o superiores a la longitud del input en tokens.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para desplegar un modelo de embeddings polaco sin depender de PyTorch ni de sentence-transformers; por otro, advierte de los errores silenciosos más habituales en este tipo de conversiones (falta de prefijos de consulta, división automática del texto en trozos de 512 tokens), que degradan la calidad de los vectores sin producir ningún error visible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder bidireccional) |
| Parametros totales | 31.883.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la verificacion incluye un texto de 3052 tokens y la configuracion de ejemplo usa `-c 8192` |
| Tipos de cuantizacion | F16 y Q8_0 |
| Idiomas soportados | polaco (pl) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (F16, Q8_0); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base es ModernBERT, un transformer encoder con atención bidireccional optimizado para eficiencia en secuencias largas. El modelo está especializado en generación de embeddings densos para recuperación (dense retrieval) y similitud semántica. El pooling configurado es CLS, y dicho valor queda almacenado en los metadatos del GGUF, por lo que en llama-server basta con indicar `--pooling cls` para hacerlo explícito.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card original de OPI-PIB/PolDense-32M, que no se ha incluido en la información proporcionada. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` del commit `4a80943` de llama.cpp usando `--outtype f32`, seguida de `llama-quantize` (release b9297) para producir F16 y Q8_0. La revisión exacta del modelo fuente es `ca70494a25dad90d980db7c735658dc7bf88ed25`. No se modificó nada más allá de la conversión y la cuantización.

Una innovación operativa destacable es la verificación numérica publicada: se comparó la similitud coseno entre los embeddings generados por llama-server en CPU y los del modelo original con sentence-transformers en fp32, obteniendo una similitud mínima de 0,99999 en textos cortos y 0,99995 en un texto largo para F16, y de 0,99940 y 0,99933 respectivamente para Q8_0. El texto largo de prueba tenía 3052 tokens (artículo «Białystok» de la Wikipedia polaca).

## Capacidades

- Generación de embeddings densos para similitud semántica entre frases (tareas simétricas) y para recuperación asimétrica consulta-documento.
- Feature extraction: representaciones vectoriales reutilizables para clasificación, clustering y deduplicación de textos en polaco.
- Recuperación de información (retrieval) con prefijos específicos: `"[query]: "` para consultas y sin prefijo para documentos.
- Tareas simétricas de similitud con prefijo `"[sts]: "` en ambos textos.
- Soporte de entradas largas: la verificación cubre un texto de 3052 tokens y la configuración recomendada admite hasta 8192 tokens en una sola pasada.
- Compatibilidad con la API `/v1/embeddings` de llama-server (endpoint compatible con el formato de OpenAI).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión ni audio: es un modelo exclusivamente de embeddings.
- Capacidad multilingüe limitada: el idioma declarado es únicamente polaco, aunque la verificación incluyó textos cortos en polaco e inglés.

## Casos de uso

- Búsqueda semántica en corpus polacos: indexar documentos con el modelo (sin prefijo) y consultar con `"[query]: "` para obtener los vectores de consulta; el tamaño de 32M parámetros permite indexar grandes volúmenes con un coste de almacenamiento reducido (34 MiB en Q8_0 para el modelo, más el vector por documento).
- Motor de preguntas frecuentes (FAQ) en atención al cliente: comparar la consulta del usuario con las preguntas canónicas mediante similitud coseno; el modelo cabe en CPU y responde con latencia baja, lo que permite desplegarlo en el mismo servidor que la aplicación sin GPU.
- Deduplicación y clustering de textos: generar embeddings de artículos, tickets o reseñas en polaco y agrupar por similitud coseno para detectar duplicados o temas recurrentes.
- Filtrado previo en pipelines RAG: usar PolDense-32M como recuperador de primera etapa sobre un corpus polaco antes de pasar los candidatos a un modelo generativo de mayor tamaño, reduciendo el coste computacional del pipeline.
- Clasificación de texto por vecino más cercano: calcular el embedding de un texto y asignarle la etiqueta del ejemplo de entrenamiento más próximo, útil para moderación o enrutamiento de tickets cuando no se dispone de datos suficientes para entrenar un clasificador supervisado.
- Búsqueda en documentación técnica o bases de conocimiento internas en polaco: desplegar llama-server con `--embedding --pooling cls -c 8192 -b 8192 -ub 8192` y consumir el endpoint `/v1/embeddings` desde el servicio de búsqueda.
- Evaluación de similitud entre pares de frases (parafraseo, traducción, respuestas candidatas): usar el prefijo `"[sts]: "` en ambos textos y comparar los vectores normalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye la verificación de equivalencia numérica entre la conversión GGUF y el modelo original:

| Fichero | Similitud coseno mínima, textos cortos | Similitud coseno, texto largo (3052 tokens) |
|---|---|---|
| F16 | 0,99999 | 0,99995 |
| Q8_0 | 0,99940 | 0,99933 |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantización. El fichero F16 ocupa 63 MiB y el Q8_0 34 MiB; el consumo real de memoria lo determina el tamaño del batch y la longitud de contexto configurada, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; el modelo está pensado para ejecutarse en CPU. Una RTX 4090 o una A100 están sobredimensionadas para este modelo y solo se justifican si se comparten con otras cargas.
- Cabe en cualquier GPU de consumo, e incluso en entornos sin GPU: la verificación publicada se realizó íntegramente en CPU.
- Opciones de despliegue: llama.cpp (llama-server con `--embedding --pooling cls`), y cualquier herramienta construida sobre llama.cpp o node-llama-cpp. No se documenta soporte para vLLM, TGI ni Ollama en la información disponible.
- Configuración crítica: `-c 8192 -b 8192 -ub 8192` (o valores superiores a la longitud del input más largo). Con valores inferiores, llama-server rechaza las entradas largas con error, y algunos wrappers dividen el texto en fragmentos de 512 tokens y devuelven un vector que solo cubre el último fragmento, sin avisar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PolDense-32M-GGUF | 31,9 M | no disponible (verificado hasta 3052 tokens; configuración de ejemplo 8192) | pl | Gemma Terms of Use | GGUF (F16, Q8_0) |
| OPI-PIB/PolDense-32M | 31,9 M | no disponible | pl | Gemma Terms of Use | safetensors (modelo original) |
| Alternativas de embeddings multilingües (p. ej. familia multilingual-e5) | no disponible | no disponible | multilingüe | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de modelos comparables, por lo que no es posible establecer una comparación cuantitativa. La comparación más directa y fiable es con el modelo original OPI-PIB/PolDense-32M, del que esta conversión es una cuantización con equivalencia numérica verificada.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada a OPI-PIB y no cuenta con su validación. Para detalles de entrenamiento y benchmarks hay que remitirse a la model card original.
- Licencia Gemma Terms of Use: los ficheros están sujetos a las restricciones de uso de la sección 3.2 y a la Gemma Prohibited Use Policy. Si se redistribuyen los ficheros o derivados, hay que incluir las restricciones de uso como cláusula exigible en los propios términos y entregar el aviso y una copia de las condiciones.
- El prefijo de consulta no se aplica automáticamente: los runtimes GGUF no leen los prompts de `config_sentence_transformers.json`, por lo que el código cliente debe añadir `"[query]: "` o `"[sts]: "` según la tarea. Omitirlo degrada la calidad de la recuperación sin generar errores.
- Riesgo de vectores silenciosamente incorrectos: si el runtime divide la entrada en fragmentos (por ejemplo, el tamaño de batch por defecto de 512 tokens de node-llama-cpp, caso documentado en qmd ≤ 2.8.3), el embedding devuelto solo representa el último fragmento. Hay que verificar la configuración de `-b` y `-ub`.
- Cobertura lingüística limitada al polaco: el rendimiento en otros idiomas no está garantizado, aunque la verificación incluyó textos cortos en inglés.
- Modelo exclusivamente de embeddings: no genera texto, no razona y no soporta tool calling; no debe emplearse como sustituto de un modelo generativo.
- No se dispone de información sobre sesgos del corpus de entrenamiento ni sobre tasas de alucinación (concepto poco aplicable a un modelo de embeddings, pero relevante si los vectores se usan para recuperar contexto que alimente a un generador).
- La información disponible no detalla la longitud máxima de contexto del modelo base; conviene consultar la model card original antes de fijar `-c` en producción.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/kprzyb/PolDense-32M-GGUF
- Modelo base: https://huggingface.co/OPI-PIB/PolDense-32M
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Incidencia de qmd sobre el troceado silencioso en 512 tokens: https://github.com/tobi/qmd/issues/897
