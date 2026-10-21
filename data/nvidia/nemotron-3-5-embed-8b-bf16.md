# nvidia/Nemotron-3.5-Embed-8B-BF16

## Resumen

Nemotron-3.5-Embed-8B-BF16 es un modelo de embeddings multimodal y multilingüe desarrollado por NVIDIA para recuperación densa (retrieval) en aplicaciones de pregunta-respuesta sobre corpus grandes. Genera vectores densos a partir de texto, de imágenes de páginas de documentos o de combinaciones imagen-texto, lo que permite construir sistemas de búsqueda semántica, RAG y RAG agéntico sin necesidad de un pipeline de OCR previo, ya que el modelo procesa directamente páginas con texto, tablas, gráficos e infografías.

Es un transformer de tipo bi-encoder con 8.381.155.328 parámetros (~8,38 B) y 32.768 tokens de contexto. Su codificador de visión procede de Ministral-3-8B-Instruct-2512-BF16 y su componente de lenguaje se inicializa (congelado) desde Nemotron-3-Embed-8B-BF16, con lo que comparte espacio de embeddings con ese modelo y produce embeddings de texto idénticos. Resulta relevante por sus resultados declarados como estado del arte en benchmarks de recuperación multilingüe y multimodal, y por su licencia abierta (OpenMDW-1.1), que habilita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder con codificador de visión + LLM (no generativo) |
| Parámetros totales | 8.381.155.328 (~8,38 B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | BF16 (variante nativa); no hay variantes cuantizadas publicadas de la versión 8B (NVFP4 solo existe en la variante 1B de la familia) |
| Idiomas soportados | 34 idiomas para recuperación de texto y 18 para recuperación de imágenes (detalle en Capacidades) |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial); el modelo base Ministral-3-8B-Instruct-2512-BF16 está bajo Apache 2.0 |
| Formato de pesos | safetensors en BF16 (tamaño del repositorio: 16,8 GB) |
| Dimensión del embedding | no disponible |
| Modalidades de entrada | Texto (string) e imagen RGB; consultas solo en texto, documentos en imagen, texto o imagen+texto |
| Resolución de imagen | Lado largo de 1.120 px por defecto, ampliable hasta 1.540 px |
| Modelo base | mistralai/Ministral-3-8B-Instruct-2512-BF16 (visión) y nvidia/Nemotron-3-Embed-8B-BF16 (LLM, congelado) |

## Arquitectura y entrenamiento

El modelo es un bi-encoder transformer: codifica cada entrada (consulta o documento) de forma independiente en un vector denso de tamaño fijo, de modo que la relevancia se calcula por similitud entre embeddings (típicamente con una base de datos vectorial). El componente de lenguaje se inicializa desde Nemotron-3-Embed-8B-BF16 y se mantiene congelado durante el entrenamiento, preservando la precisión de recuperación en texto de ese modelo; el codificador de visión se inicializa desde Ministral-3-8B-Instruct-2512-BF16. Durante el fine-tuning solo se entrenaron el codificador de visión y el proyector multimodal, sobre conjuntos de datos de imágenes y de imagen+texto combinados. Como consecuencia, ambos modelos comparten el mismo espacio de embeddings y generan embeddings de texto idénticos.

La salida es un vector unidimensional por entrada, obtenido mediante pooling de los estados ocultos a nivel de token (la model card se trunca en ese punto de la información disponible). No se ha publicado el número de tokens de entrenamiento, la composición del dataset ni detalles adicionales del proceso. Técnicas como decodificación especulativa o attention lineal no aparecen mencionadas; el contexto máximo es de 32.768 tokens y las imágenes se procesan con un lado largo de 1.120 px por defecto (ampliable a 1.540 px).

## Capacidades

- Embeddings multimodales: acepta como documento una imagen de página (con texto, tablas, gráficos e infografías), texto (por ejemplo, OCR de una página o un fragmento) o una combinación imagen+texto; la consulta es siempre texto.
- Recuperación densa texto-texto evaluada en 34 idiomas: inglés, árabe, asamés, bengalí, búlgaro, chino, danés, neerlandés, finés, francés, alemán, hindi, hinglish, indonesio, italiano, japonés, coreano, malayo, maratí, nepalí, noruego, persa, portugués, rumano, ruso, español, suajili, sueco, tamil, telugu, tailandés, ucraniano, urdu y vietnamita.
- Recuperación multimodal (consulta de texto a documento en imagen) evaluada en 18 idiomas: árabe, bengalí, chino, inglés, persa, finés, francés, alemán, hindi, indonesio, japonés, coreano, ruso, español, suajili, telugu, tailandés y yoruba.
- Contexto largo: hasta 32.768 tokens por entrada, lo que permite indexar fragmentos extensos o páginas con mucho contenido.
- Espacio de embeddings compartido con Nemotron-3-Embed-8B-BF16: produce embeddings de texto idénticos, lo que habilita índices mixtos texto/imagen y migraciones sin reindexar corpus textuales existentes.
- Integración: librería sentence-transformers, compatible con transformers y vLLM; salida apta para almacenarse en bases de datos vectoriales junto al contenido original (imagen o texto).
- No es un modelo generativo: no soporta tool calling, function calling ni razonamiento multi-paso por sí mismo; está diseñado como componente de recuperación dentro de sistemas RAG y flujos agénticos, donde un LLM generador actúa aguas abajo.

## Casos de uso

- RAG multimodal sobre documentación empresarial: indexar páginas de PDF (escaneados o nativos) como imágenes y consultar en lenguaje natural. Es adecuado porque el codificador de visión captura tablas, gráficos e infografías que un pipeline OCR clásico degradaría o perdería.
- Búsqueda semántica multilingüe en corpora corporativos: un único índice vectorial para documentos en decenas de idiomas, con consultas en español sobre documentos en japonés, árabe o alemán, gracias a su cobertura de 34 idiomas en texto.
- Asistentes de preguntas sobre documentación técnica con diagramas: manuales de mantenimiento, fichas de producto o documentación de ingeniería con infografías; la combinación imagen+texto permite indexar páginas mixtas con su contexto completo.
- RAG agéntico: como retriever denso en pipelines de agentes que realizan consultas iterativas al corpus; el blog de NVIDIA presenta la familia Nemotron retriever precisamente para escenarios de recuperación agéntica.
- Atención al cliente y chatbots con base de conocimiento: recuperar los pasajes o páginas relevantes que se entregan como contexto al LLM generador, reduciendo alucinaciones al anclar las respuestas en fuentes reales; el contexto de 32.768 tokens admite chunks largos sin fragmentación agresiva.
- Cumplimiento, legal y auditoría: búsqueda en contratos, facturas e informes escaneados; la consulta textual localiza cláusulas o cifras aunque el documento original sea una imagen.
- Digitalización de archivos históricos: indexar fondos documentales escaneados sin construir un pipeline de OCR, haciéndolos consultables en lenguaje natural.
- Migración incremental de sistemas de búsqueda: dado que los embeddings de texto son idénticos a los de Nemotron-3-Embed-8B-BF16, se puede reutilizar un índice textual existente y añadir documentos en imagen sin reprocesar el corpus ya indexado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo alcanza resultados de estado del arte en múltiples benchmarks de recuperación multilingüe y multimodal, y remite al blog oficial para más detalles, pero no incluye cifras concretas (MTEB, MIRACL, ViDoRe u otros) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan 16,8 GB (tamaño del repositorio); con margen para activaciones, el proyector multimodal y el procesado de imágenes de hasta 1.540 px, se estima un mínimo práctico de 18-22 GB de VRAM (estimación a partir del tamaño de los pesos; no hay cifras oficiales).
- GPUs consumer: cabe en tarjetas de 24 GB como la RTX 3090 y la RTX 4090 (y en la RTX 5090 de 32 GB). No cabe en GPUs de 16 GB en BF16, y no hay variantes cuantizadas publicadas de la versión 8B que reduzcan este requisito.
- GPUs de datacenter: A100 (40/80 GB), H100, o tarjetas de 24 GB como L4 y A10.
- Opciones de despliegue: vLLM (soporte declarado en la ficha), transformers y sentence-transformers (librería declarada). No se menciona soporte oficial para llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B-BF16 (este modelo) | 8,38 B | 32.768 | Texto + imagen | OpenMDW-1.1 (uso comercial) | HF, sentence-transformers, vLLM |
| nvidia/Nemotron-3-Embed-8B-BF16 | ~8 B (según denominación) | no disponible | Solo texto | no disponible | HF |
| nvidia/Nemotron-3.5-Embed-1B-BF16 | ~1 B (según denominación) | no disponible | Texto + imagen | no disponible | HF (también variante NVFP4) |
| jinaai/jina-embeddings-v4 | 3,8 B | no disponible | Texto + imagen | CC-BY-NC-4.0 (no comercial) | HF |

- Frente a Nemotron-3-Embed-8B-BF16: añade recuperación de imágenes manteniendo embeddings de texto idénticos, lo que permite ampliar un índice existente sin reindexar.
- Frente a Nemotron-3.5-Embed-1B: la variante 8B ofrece mayor capacidad (presumiblemente a costa de requisitos de VRAM, ~17 GB frente a ~2 GB en BF16); la variante 1B dispone además de cuantización NVFP4 para despliegues con recursos limitados.
- Frente a jina-embeddings-v4: Nemotron 3.5 8B es mayor en parámetros y su licencia OpenMDW-1.1 permite uso comercial, mientras que jina-embeddings-v4 está restringida a uso no comercial; no hay cifras de rendimiento comparables publicadas en la información disponible.

## Limitaciones y advertencias

- Las consultas solo pueden ser texto: el modelo no admite imágenes como query, solo como documentos.
- No es generativo: no produce texto, no soporta tool calling ni razonamiento; debe combinarse con un LLM generador en arquitecturas RAG.
- Riesgo de alucinación: el modelo no genera texto, pero un sistema RAG mal calibrado (umbrales de similitud inadecuados, corpus desactualizado) puede recuperar pasajes irrelevantes que induzcan errores en el LLM aguas abajo.
- Idiomas: el rendimiento está evaluado en 34 idiomas para texto y 18 para imágenes; la propia model card indica que puede soportar idiomas adicionales sin garantía, por lo que conviene validar cualquier idioma fuera de esas listas (el hinglish, por ejemplo, solo aparece en la evaluación de texto).
- Resolución de imagen limitada a 1.540 px en el lado largo: páginas muy densas, con tipografía pequeña o planos detallados pueden perder fidelidad frente a un pipeline OCR de alta resolución.
- Licencia: OpenMDW-1.1 es una licencia de tipo "other" que, según la model card, habilita el uso comercial y no comercial; aun así, conviene revisar el texto completo de la licencia antes de despliegues en producción.
- Documentación incompleta en el material disponible: no se ha publicado la dimensión del embedding, los detalles del pooling ni cifras de benchmarks, lo que dificulta la evaluación comparativa objetiva.
- Modelo muy reciente (publicado en octubre de 2026) y con adopción inicial baja (899 descargas y 13 likes en el momento de la ficha): menor validación comunitaria y recetas de despliegue aún en evolución.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Blog de NVIDIA sobre la familia Nemotron retriever: https://huggingface.co/blog/nvidia/nemotron-retriever-world-class-agentic-retrieval
- Modelo base (codificador de visión): https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Predecesor solo-texto (componente LLM congelado): https://huggingface.co/nvidia/Nemotron-3-Embed-8B-BF16
- Variante 1B BF16: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Variante 1B NVFP4: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0 (modelo base Ministral-3): https://www.apache.org/licenses/LICENSE-2.0.txt
