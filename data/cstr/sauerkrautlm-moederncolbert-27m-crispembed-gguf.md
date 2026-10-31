# cstr/SauerkrautLM-MoEdernColBERT-27M-CrispEmbed-GGUF

## Resumen

SauerkrautLM-MoEdernColBERT-27M-CrispEmbed-GGUF es un repositorio de cuantización/reempaquetado en formato GGUF del modelo VAGOsolutions/SauerkrautLM-MoEdernColBERT-27M, publicado por el usuario cstr en HuggingFace. No se trata de un modelo nuevo entrenado desde cero, sino de un empaquetado F32 "byte-preserving" (sin aritmética sobre los tensores) diseñado para ser consumido por la API de texto crudo MoEdern de CrispEmbed, activada mediante variables de entorno de la familia `CRISPEMBED_MOEDERN_*`.

El modelo base es un ColBERT de 27,1 millones de parámetros desarrollado por VAGOsolutions, es decir, un modelo de embeddings orientado a recuperación de información con interacción tardía (late interaction) mediante el mecanismo MaxSim, en lugar de un modelo generativo de lenguaje. Su tamaño reducido lo hace adecuado para despliegues ligeros de búsqueda semántica y RAG en CPU o hardware modesto.

La relevancia de esta ficha radica en el uso concreto: servir embeddings ColBERT en entornos donde se requiere el formato GGUF y compatibilidad con el ecosistema CrispEmbed. El autor documenta verificación numérica en Linux x64 (vectores dentro de 4,47e-07 del original y puntuaciones MaxSim dentro de 0,002), aunque advierte explícitamente que la calidad de recuperación no ha sido validada y que las puertas de integración permanecen desactivadas por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (late interaction / MaxSim), variante "MoEdern" según el autor upstream; detalles no disponibles |
| Parametros totales | 27.124.000 |
| Parametros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 (empaquetado byte-preserving; sin cuantizaciones de menor precisión verificadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `moedern-27m-text-f32.gguf`, 109.596.000 bytes); original en safetensors |

## Arquitectura y entrenamiento

El modelo base, VAGOsolutions/SauerkrautLM-MoEdernColBERT-27M, pertenece a la familia ColBERT: modelos de embeddings que representan cada token del documento y de la consulta como vectores independientes y calculan la relevancia mediante MaxSim (para cada token de la consulta se toma su similitud máxima contra los tokens del documento y se suma). Este enfoque de interacción tardía ofrece mejor calidad de ranking que los embeddings de un solo vector, a costa de mayor coste de almacenamiento e indexación. Los detalles concretos de la variante "MoEdern" (dimensión de embedding, número de capas, si emplea arquitectura híbrida o MoE) no están disponibles en la información proporcionada.

Sobre el entrenamiento del modelo base no se dispone de datos: no consta el número de tokens, la composición del corpus, ni si hubo etapas de ajuste fino tipo RLHF o DPO (habitualmente irrelevantes para modelos de embeddings). En cuanto al repositorio cuantizado aquí descrito, el proceso fue puramente mecánico: empaquetado F32 que preserva los bytes del modelo original y sus metadatos de tokenizador, sin ninguna aritmética sobre tensores. La verificación del autor confirma IDs de token y máscaras exactos, y vectores en diez casos congelados con desviación máxima de 4,47e-07 respecto al original.

## Capacidades

- Generacion de embeddings densos por token para consultas y documentos, según el paradigma ColBERT de interacción tardía.
- Calculo de puntuaciones de relevancia mediante MaxSim para ranking de pasajes.
- Integración opt-in con la API de texto crudo MoEdern de CrispEmbed (mediante las variables `CRISPEMBED_MOEDERN_*`, incluida `CRISPEMBED_MOEDERN_FAMILY`); las puertas están desactivadas por defecto.
- Ejecución verificada en CPU Linux x64 (C/Python/CLI), lo que permite inferencia sin GPU.
- No es un modelo generativo: no produce texto, no soporta chat, ni tool calling, ni agentes.

## Casos de uso

- Recuperación densa en sistemas RAG: generación de embeddings ColBERT para indexar corpus de documentos y rerankear pasajes candidatos con MaxSim, mejorando la precisión frente a embeddings de vector único en pipelines de generación aumentada.
- Búsqueda semántica local y ligera: con solo 27 millones de parámetros y ~110 MB en F32, puede ejecutarse en CPU sin GPU, adecuado para búsquedas en aplicaciones de escritorio o servidores pequeños.
- Reranking de segundo nivel: usar el modelo como reranker sobre los top-k resultados de un retriever BM25 o de un embedding de un solo vector, aprovechando la interacción tardía para puntuaciones más finas.
- Integración en el ecosistema CrispEmbed: despliegue directo vía la API MoEdern para aplicaciones que ya usan ese framework de embeddings.
- Indexación de documentación técnica o bases de conocimiento internas: el formato GGUF facilita su distribución junto a la aplicación sin dependencias pesadas de PyTorch.
- Experimentación y auditoría de embeddings: la verificación byte-preserving y los vectores congelados con desviación conocida permiten comparar implementaciones y reproducir resultados exactos en pruebas de regresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del repositorio indica explícitamente que la calidad de recuperación (retrieval quality) no ha sido verificada para este empaquetado, y solo documenta verificación numérica: desviación máxima de 4,47e-07 en vectores de diez casos congelados y diferencia de hasta 0,002 en tres puntuaciones MaxSim respecto al original.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere VRAM; el archivo GGUF pesa ~110 MB (109.596.000 bytes) y se ha verificado su ejecución en CPU Linux x64. La RAM necesaria será del orden de unos cientos de MB.
- GPU recomendadas: no disponibles; el empaquetado solo está verificado en CPU, y el autor no ha validado GPU.
- Consumer GPU: no verificado; al ser un modelo de 27M de parámetros, teóricamente cabría en cualquier GPU moderna, pero sin validación del autor.
- Opciones de despliegue: la vía prevista es CrispEmbed (API MoEdern opt-in). No consta compatibilidad verificada con llama.cpp, Ollama, vLLM o TGI, aunque el formato GGUF sugiere posible compatibilidad con tooling de ese ecosistema; no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SauerkrautLM-MoEdernColBERT-27M-CrispEmbed-GGUF | 27,1M | ColBERT (late interaction) | Apache-2.0 | GGUF F32 | Empaquetado byte-preserving para CrispEmbed; retrieval no verificado |
| colbert-ir/colbertv2.0 | ~29M (base BERT) | ColBERT v2 | MIT | PyTorch | Referencia estándar de ColBERT; ecosistema maduro |
| answerdotai/answerai-colbert-small-v1 | ~33M | ColBERT | Apache-2.0 | PyTorch/Safetensors | ColBERT pequeño con buen rendimiento en benchmarks de recuperación públicos |

Nota: los datos de la fila de este modelo provienen de la ficha del repositorio; los de los comparables son cifras públicas aproximadas y pueden variar.

## Limitaciones y advertencias

- La calidad de recuperación de este empaquetado no ha sido verificada por el autor; solo se validó la equivalencia numérica de vectores y puntuaciones MaxSim en casos congelados.
- Verificación limitada a Linux x64 en CPU (C/Python/CLI); no probado en otras plataformas, ni en GPU, ni con cuantizaciones distintas de F32.
- Las puertas de integración CrispEmbed (`CRISPEMBED_MOEDERN_*`) están desactivadas por defecto; hay que activarlas explícitamente.
- No es un modelo generativo: cualquier intento de usarlo para chat o generación de texto carece de sentido.
- Los detalles del modelo base (idiomas, contexto, datos de entrenamiento) no están disponibles en la información proporcionada; conviene consultar la ficha upstream de VAGOsolutions.
- Licencia Apache-2.0: permite uso comercial, pero el repositorio es un trabajo derivado del checkpoint upstream (reempaquetado según la sección 4 de Apache-2.0); el LICENSE y README originales se conservan en `upstream/`.
- Repositorio de muy baja adopción (61 descargas, 1 like en el momento de la ficha), sin comunidad de validación externa.
- Riesgo de alucinación: no aplicable al no ser un modelo generativo, aunque embeddings defectuosos pueden degradar silenciosamente la calidad de un sistema RAG.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/cstr/SauerkrautLM-MoEdernColBERT-27M-CrispEmbed-GGUF
- Modelo base upstream: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-27M
- Commit upstream referenciado: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-27M/tree/d2b7b1feaaac1bf87510ca9525208c3daeabcc5a
- Paper, blog y demo: no disponibles
