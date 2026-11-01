# kprzyb/PolDense-400M-GGUF

## Resumen

PolDense-400M-GGUF es la conversión no oficial al formato GGUF del modelo PolDense-400M, un modelo de embeddings densos para recuperación de información en polaco desarrollado por OPI-PIB y basado en la arquitectura ModernBERT. Esta versión, publicada por el usuario kprzyb, permite ejecutar el modelo en llama.cpp y en cualquier herramienta construida sobre dicho runtime, lo que facilita su despliegue en entornos locales sin dependencia de PyTorch ni de sentence-transformers.

El modelo resuelve el problema de generar representaciones vectoriales de alta calidad para tareas de búsqueda semántica, similitud de frases y extracción de características en lengua polaca. Con 394.781.696 parámetros totales y una ventana de contexto que en la práctica se configura hasta 8192 tokens en llama.cpp, está orientado a pipelines de retrieval donde el polaco es el idioma principal. Su relevancia actual radica en que cubre un nicho poco poblado: embeddings densos específicos para polaco con licencia Gemma y compatibilidad con el ecosistema GGUF.

La conversión se ofrece en dos cuantizaciones, F16 (755 MiB) y Q8_0 (402 MiB), y el autor documenta una verificación numérica de la fidelidad de los embeddings respecto al modelo original en fp32, con similitudes coseno mínimas de 0,99962 (F16) y 0,99853 (Q8_0) en textos cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer bidireccional con atención bidireccional) |
| Parametros totales | 394.781.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | configurable en llama.cpp hasta 8192 tokens (ejemplo del autor: `-c 8192`); longitud máxima nativa del modelo base no disponible |
| Tipos de cuantizacion | F16 y Q8_0 |
| Idiomas soportados | polaco (pl) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (F16 y Q8_0); pesos originales del modelo base no disponibles en esta ficha |

## Arquitectura y entrenamiento

El modelo base PolDense-400M emplea la arquitectura ModernBERT, un transformer encoder bidireccional modernizado. Al ser un modelo de embeddings y no un modelo generativo, utiliza atención bidireccional sobre la secuencia completa y produce un vector de representación mediante pooling CLS, tal como se almacena en los metadatos del GGUF. Esta naturaleza bidireccional tiene una consecuencia operativa importante en llama.cpp: el texto completo debe procesarse en un único micro-batch, ajustando `-ub` y `-b` al menos a la longitud del input más largo en tokens.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden a la model card del modelo original OPI-PIB/PolDense-400M, que no se incluye en la información proporcionada. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp (commit `4a80943`, `--outtype f32`) y posteriormente se cuantizó con `llama-quantize` (release b9297) a F16 y Q8_0, sin modificar nada más que el formato y la precisión. El autor documenta la verificación de fidelidad frente al modelo original en fp32 ejecutado con sentence-transformers.

## Capacidades

- Generación de embeddings de frases y documentos para búsqueda semántica y recuperación densa en polaco.
- Similitud semántica entre textos mediante similitud coseno sobre vectores normalizados.
- Extracción de características (feature extraction) a partir de representaciones vectoriales.
- Soporte de prefijos específicos por tarea: `"[query]: "` para consultas de retrieval y `"[sts]: "` para tareas simétricas de similitud semántica; los documentos no llevan prefijo.
- Procesamiento de textos largos en una sola pasada (verificado con un texto polaco de 3052 tokens).
- Compatibilidad con la API de embeddings de `llama-server` (`/v1/embeddings`) y con herramientas basadas en llama.cpp.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es un modelo exclusivamente de representaciones.
- Capacidad multilingüe limitada: el idioma declarado es únicamente polaco, aunque la verificación incluyó textos en inglés sin que se documente rendimiento en dicho idioma.

## Casos de uso

- Búsqueda semántica en corpus polacos: indexar documentos con embeddings sin prefijo y consultar con el prefijo `"[query]: "`, usando similitud coseno para recuperar los pasajes más relevantes. Adecuado por su entrenamiento específico para retrieval en polaco.
- Motor de preguntas y respuestas sobre documentación interna: combinar el modelo con una base vectorial para recuperar fragmentos de manuales o bases de conocimiento en polaco antes de pasarlos a un LLM generativo.
- Deduplicación y agrupación de contenido: calcular similitud entre artículos, tickets o registros para detectar duplicados o agrupar temáticamente, usando el prefijo `"[sts]: "` en ambos textos.
- Clasificación y clustering de textos: emplear los vectores como features de entrada para clasificadores o algoritmos de clustering en pipelines de análisis de opiniones o moderación en polaco.
- Búsqueda en atención al cliente: indexar FAQs y artículos de ayuda en polaco y resolver consultas de usuarios mediante recuperación semántica, con despliegue local vía llama-server.
- Filtrado y recomendación de contenido: comparar la similitud entre el perfil o consulta de un usuario y un catálogo de artículos para generar recomendaciones en lengua polaca.
- Despliegue en entornos con recursos limitados: la cuantización Q8_0 (402 MiB) permite ejecutar el modelo en CPU o en GPUs de gama baja, útil para prototipos y servicios de bajo volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente documenta una verificación de fidelidad de la conversión frente al modelo original en fp32, medida como similitud coseno entre embeddings:

| Archivo | Cos mínimo, textos cortos | Cos, texto largo (3052 tokens) |
|---|---|---|
| F16 | 0,99962 | 0,99994 |
| Q8_0 | 0,99853 | 0,99955 |

No se proporcionan métricas de retrieval (Recall@k, nDCG, MRR) ni comparaciones con otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB para Q8_0 y 0,75 GB para F16, más el overhead del contexto configurado (hasta 8192 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo es viable en GPUs de consumo como GTX 1650, RTX 3060 o superiores. También funciona en CPU.
- Cabe en cualquier GPU de consumo actual gracias a su tamaño inferior a 1 GB en ambos formatos.
- Opciones de despliegue: llama.cpp (`llama-server` con `--embedding --pooling cls`), y herramientas construidas sobre llama.cpp. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor solo indica que la verificación se realizó en CPU con llama-server b9297.
- Configuración crítica: usar `-c 8192 -b 8192 -ub 8192` (o valores al menos iguales a la longitud del input más largo) para evitar que el texto se divida en fragmentos de 512 tokens y el vector cubra solo el último fragmento.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría (embeddings densos para polaco). Los datos del modelo base (contexto nativo, rendimiento en retrieval) tampoco están incluidos en esta ficha.

## Limitaciones y advertencias

- Es una conversión no oficial, no afiliada a OPI-PIB; el autor no garantiza soporte ni actualizaciones.
- Los runtimes GGUF no leen los prompts desde `config_sentence_transformers.json`, por lo que el prefijo (`"[query]: "` o `"[sts]: "`) debe añadirse manualmente en el código; omitirlo degrada la calidad de los embeddings.
- Riesgo de vectores incorrectos si el runtime divide el input en fragmentos de 512 tokens (por ejemplo, qmd ≤ 2.8.3 vía node-llama-cpp); es imprescindible configurar el batch completo.
- Modelo exclusivamente de embeddings: no genera texto ni soporta tool calling, agentes o razonamiento.
- Idioma limitado al polaco; el rendimiento en otros idiomas no está documentado.
- Licencia Gemma Terms of Use: sujeto a las restricciones de uso de la sección 3.2 y a la Gemma Prohibited Use Policy; si se redistribuyen los archivos o derivados, deben incluirse las restricciones de uso como provisión exigible y transmitir el aviso y una copia de los términos.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica generación de texto, pero sí posibles sesgos en los espacios de representación).
- El repositorio tiene un volumen de descargas muy bajo (97) y ningún like, lo que sugiere poca validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kprzyb/PolDense-400M-GGUF
- Modelo base: https://huggingface.co/OPI-PIB/PolDense-400M
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Issue de qmd sobre el batch de 512 tokens: https://github.com/tobi/qmd/issues/897
