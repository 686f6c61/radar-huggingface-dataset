# mykor/kanana-2-3b-embedding-GGUF

## Resumen

kanana-2-3b-embedding-GGUF es una cuantizacion en formato GGUF del modelo de embeddings kakaocorp/kanana-2-3b-embedding, desarrollado por Kakao y convertido a GGUF por el usuario mykor. Se trata de un modelo de extraccion de caracteristicas (sentence-similarity) orientado a generar representaciones vectoriales de texto, con soporte de embeddings matryoshka y evaluado sobre el benchmark MTEB. Su proposito es permitir ejecutar este modelo de embeddings en entornos locales y de bajos recursos mediante backends como llama.cpp.

La relevancia de esta version radica en la portabilidad: el formato GGUF permite usar el modelo sin depender de PyTorch ni de la libreria sentence-transformers original, facilitando su integracion en aplicaciones de busqueda semantica, RAG y clustering en hardware de consumo. El modelo base tiene 3.180.636.672 parametros y esta orientado principalmente a coreano e ingles, lo que lo hace especialmente util para aplicaciones con contenido en coreano, un idioma con menos opciones de embeddings de calidad.

Cabe destacar que el autor del repositorio documenta una verificacion de fidelidad: compara los embeddings generados por el modelo original (via sentence-transformers) con los generados por la version GGUF (via llama-cpp-python), obteniendo una similitud coseno de aproximadamente 0,927 en su ejemplo, lo que indica una ligera desviacion respecto al modelo base que conviene tener en cuenta en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador adaptado para embeddings (detalle especifico no disponible) |
| Parametros totales | 3.180.636.672 (aprox. 3,18 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el ejemplo usa n_ctx=0 en llama.cpp) |
| Tipos de cuantizacion | BF16 (archivo kanana-2-3B-embedding-BF16.gguf); otras variantes no especificadas |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | kanana-open-license (licencia personalizada, "other") |
| Formato de pesos | GGUF (modelo base en safetensors con custom_code) |

## Arquitectura y entrenamiento

El modelo base, kanana-2-3b-embedding de Kakao, es un modelo de embeddings de aproximadamente 3,18 mil millones de parametros derivado de la familia Kanana. La ficha original no detalla la arquitectura exacta ni el proceso de entrenamiento, aunque las etiquetas indican compatibilidad con MTEB (Massive Text Embedding Benchmark) y soporte de embeddings matryoshka, una tecnica que permite truncar el vector de salida a dimensiones menores manteniendo buena calidad, util para reducir almacenamiento y acelerar busquedas por similitud.

Esta version concreta es una conversion a GGUF del modelo base. El repositorio incluye al menos una variante en BF16. El autor demuestra su uso mediante llama-cpp-python con el modo de embeddings activado (embedding=True), y la conversion requiere trust_remote_code=True en el modelo original, lo que indica que el modelo base emplea codigo personalizado para la extraccion de embeddings (probablemente pooling especifico).

## Capacidades

- Generacion de embeddings de texto (feature extraction) para tareas de similitud semantica entre frases y documentos.
- Soporte de embeddings matryoshka: dimensiones truncables para balancear calidad y coste de almacenamiento (dimensiones exactas no disponibles).
- Evaluado en el marco de MTEB, el estandar para benchmarks de embeddings.
- Soporte de coreano e ingles, siendo especialmente relevante para texto en coreano.
- Ejecucion local via llama.cpp / llama-cpp-python sin dependencia de PyTorch.
- No es un modelo generativo: no produce texto, no soporta chat, ni tool calling.

## Casos de uso

- Busqueda semantica en coreano e ingles: indexar documentos y consultas como vectores para recuperar contenido relevante por significado y no por coincidencia literal de palabras.
- Sistemas RAG con corpus coreano: usar el modelo como componente de recuperacion (retriever) para alimentar un LLM generativo con fragmentos relevantes, algo especialmente valioso dado el menor numero de embeddings de calidad para coreano.
- Deteccion de duplicados y near-duplicates: comparar embeddings por similitud coseno para identificar contenido repetido en corpus grandes.
- Clustering y organizacion de documentos: agrupar automaticamente textos (tickets, articulos, comentarios) por tematica usando los vectores como entrada de algoritmos como k-means o HDBSCAN.
- Clasificacion ligera de textos: entrenar clasificadores simples (regresion logistica, SVM) sobre los embeddings para tareas de etiquetado con pocos datos.
- Busqueda hibrida con filtros por dimension: aprovechar la propiedad matryoshka para usar dimensiones reducidas en una primera pasada rapida y dimensiones completas en el re-ranking.
- Aplicaciones en dispositivos con recursos limitados: gracias al formato GGUF, integrar el modelo en servicios ligeros basados en llama.cpp sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye la etiqueta "mteb" y una verificacion de consistencia entre el modelo original y la conversion GGUF: similitud coseno de 0,9269 entre embeddings del modelo base (sentence-transformers) y la version GGUF (llama.cpp) sobre un texto de ejemplo en coreano.

## Requisitos de hardware

- VRAM / memoria estimada: con 3,18 mil millones de parametros, la variante BF16 ocupa aproximadamente 6,4 GB; el tamano del repositorio completo es de 20,0 GB, lo que sugiere que pueden existir varias variantes de cuantizacion adicionales (no detalladas en la informacion disponible).
- Al ser un modelo de embeddings y no generativo, puede ejecutarse en CPU con latencias razonables para indexacion por lotes; para indexacion masiva a gran escala se recomienda GPU.
- Cabe en GPUs de consumo: una RTX 3060 de 12 GB o superior cubre la variante BF16 con holgura; en CPU, se necesita al menos 8 GB de RAM libres para la variante BF16.
- Despliegue: llama.cpp y llama-cpp-python (demonstrado en el README con Llama.from_pretrained y embedding=True). No hay evidencia de soporte directo en vLLM, TGI u Ollama para esta conversion concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia |
|---|---|---|---|---|
| kanana-2-3b-embedding (base) | 3,18 B | ko, en | safetensors (custom_code) | kanana-open-license |
| kanana-2-3b-embedding-GGUF (esta ficha) | 3,18 B | ko, en | GGUF (BF16) | kanana-open-license |
| BGE-M3 | aprox. 0,57 B | multilingue (100+) | safetensors, GGUF (comunidad) | MIT |
| multilingual-e5-large | aprox. 0,56 B | multilingue | safetensors, GGUF (comunidad) | MIT |

Comparado con alternativas multilingues como BGE-M3 o multilingual-e5-large, kanana-2-3b-embedding es considerablemente mayor (3,18 B frente a ~0,6 B), lo que sugiere mayor capacidad de representacion a costa de requisitos de memoria y latencia. Su ventaja diferencial es el enfoque en coreano; para corpus principalmente en castellano o multilingues, las alternativas menores pueden ser mas eficientes. Datos de rendimiento comparativo: no disponible.

## Limitaciones y advertencias

- Desviacion respecto al modelo base: la conversion GGUF produce embeddings con similitud coseno de ~0,927 frente al original en el ejemplo del autor; mezclar vectores de ambas versiones en un mismo indice no es recomendable.
- Licencia personalizada (kanana-open-license): no es una licencia estandar tipo Apache/MIT; debe revisarse el texto completo en el enlace de la licencia antes de cualquier uso comercial.
- custom_code: el modelo base requiere trust_remote_code=True, lo que implica ejecutar codigo arbitrario del repositorio; revisarlo antes de usar en entornos sensibles.
- Soporte linguistico limitado a coreano e ingles; el rendimiento en otros idiomas, incluido el castellano, no esta documentado.
- No es un modelo generativo: no sirve para chat, razonamiento ni generacion de codigo.
- Detalles tecnicos clave (longitud de contexto, dimensiones de embedding, variantes de cuantizacion, resultados MTEB) no estan documentados en la informacion disponible.
- Repositorio comunitario con pocas descargas (466) y sin likes: menor madurez y soporte que el modelo oficial de Kakao.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mykor/kanana-2-3b-embedding-GGUF
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-3b-embedding
- Licencia kanana-open-license: https://huggingface.co/kakaocorp/kanana-2-3b-embedding/blob/main/LICENSE
