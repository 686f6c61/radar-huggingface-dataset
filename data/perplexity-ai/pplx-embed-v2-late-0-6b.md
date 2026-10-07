# perplexity-ai/pplx-embed-v2-late-0.6b

## Resumen

`pplx-embed-v2-late-0.6b` es un modelo de recuperación (retrieval) multimodal de tipo late-interaction, desarrollado por Perplexity AI, que genera un vector de 128 dimensiones por token en lugar de un único embedding por documento. Está construido sobre una base Qwen3.5 con atención bidireccional y puntúa la similitud consulta-documento mediante MaxSim, el esquema clásico de ColBERT. Su principal novedad es que cubre texto, imágenes y documentos visuales (páginas escaneadas, capturas, PDF renderizados) dentro del mismo espacio de representación.

El modelo tiene 594.321.600 parámetros totales según los pesos publicados en safetensors (aproximadamente 0,6B) y 340M parámetros activos. Forma parte de una familia de dos tamaños junto a `pplx-embed-v2-late-9b`; ambos comparten espacio de embeddings, de modo que el modelo pequeño puede consultar un índice construido con el grande sin reindexar. Se distribuye bajo licencia MIT, con pesos en safetensors y soporte nativo en `sentence-transformers` (clase `MultiVectorEncoder`), lo que elimina la necesidad de código Python personalizado para exportar o servir el modelo.

Su relevancia ahora es doble: por un lado, populariza la recuperación multivector en un tamaño que cabe en GPU de consumo; por otro, extiende ese paradigma al dominio visual, donde los embeddings de vector único suelen perder detalle en documentos densos (tablas, formularios, diagramas). Los resultados publicados en ViDoRe v3 (nDCG@10 de 62,3% en imagen y 61,2% en Markdown) sitúan al 0.6B a solo 2,9 y 3,5 puntos del modelo de 9B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de late-interaction (ColBERT), basado en Qwen3.5 con atención bidireccional; un vector de 128 dimensiones por token y scoring MaxSim |
| Parametros totales | 594.321.600 (segun safetensors) |
| Parametros activos | 340M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | multilingue (segun la model card y los tags del repositorio) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repositorio: 2,4 GB) |

Otros datos del repositorio: pipeline `feature-extraction`, libreria `sentence-transformers`, 251 descargas y 13 likes, creado el 2026-08-03 y actualizado el 2026-10-05. Requiere `sentence-transformers >= 6.0.0` y `transformers >= 5.4.0`.

## Arquitectura y entrenamiento

La familia `pplx-embed-v2-late` es multimodal y de late-interaction: en lugar de comprimir cada documento en un vector, el modelo emite una matriz de embeddings (uno de 128 dimensiones por token) y calcula la similitud mediante MaxSim, sumando sobre la consulta el maximo producto escalar contra cada token del documento. La base es Qwen3.5 con atención bidireccional, e incorpora un codificador de visión que permite indexar imágenes y documentos visuales con la misma interfaz que el texto. Los modelos 0.6B y 9B comparten espacio de embeddings, lo que habilita indexar con el 9B y consultar con el 0.6B.

En cuanto al entrenamiento, ambos modelos se destilaron de un profesor ColBERT interno de 18B entrenado con datos de pares y tripletas. La destilación empleó un objetivo a nivel de token de estilo LEAF. El modelo 0.6B se ajustó por completo (fine-tuning completo); en el 9B solo se ajustaron por completo las ocho últimas capas del transformer, mientras que el resto de capas y el codificador de visión se adaptaron con LoRA. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Recuperación de texto multilingüe mediante representaciones multivector y scoring MaxSim.
- Recuperación multimodal: indexa imágenes y documentos visuales (páginas escaneadas, capturas, PDF renderizados) en el mismo espacio que el texto.
- Búsqueda sobre documentos en formato Markdown con resultados medidos en ViDoRe v3.
- Interoperabilidad con índices construidos con el modelo hermano de 9B gracias al espacio de embeddings compartido.
- Integración nativa con `sentence-transformers` (`MultiVectorEncoder`) mediante `encode_query`, `encode_document` y `similarity`, sin código personalizado.
- Codificación separada de lotes de texto y de imagen; no se admite mezcla de texto e imagen en la misma llamada.
- Compatibilidad con PyLate, con el matiz de que este modelo espera los marcadores Q/D en la primera posición, mientras que PyLate los inserta en la segunda.
- No dispone de generación de texto, tool calling, capacidades de agente ni modo de razonamiento: es exclusivamente un modelo de representación (feature-extraction).

## Casos de uso

- RAG multimodal sobre documentación corporativa: indexar PDF escaneados, presentaciones y capturas junto a texto plano, y recuperar pasajes relevantes con MaxSim. El modelo es adecuado porque evita el paso intermedio de OCR a texto en documentos con tablas o diagramas.
- Búsqueda de evidencia en expedientes legales o normativos: el ejemplo de la propia model card consulta "what statute governs limitations?"; el modelo devuelve pasajes concretos en lugar de un resumen difuso, lo que encaja con flujos de revisión documental.
- Indexación de facturas y formularios: al operar sobre imagen y Markdown, permite recuperar campos y cláusulas en documentos administrativos heterogéneos sin pipelines de extracción estructurada previos.
- Búsqueda semántica multilingüe en bases de conocimiento técnicas: al ser multilingüe, una consulta en castellano puede recuperar documentación en inglés u otros idiomas dentro del mismo índice.
- Recuperación para agentes de código: usar el modelo como retriever en un pipeline de CI/CD que alimente a un LLM generador con fragmentos de repositorio, issues o documentación interna; el 0.6B permite desplegarlo en la misma GPU que el generador.
- Búsqueda visual de productos o inventario: indexar imágenes de catálogo y consultar por texto o por imagen, útil en comercio electrónico donde la descripción textual es incompleta.
- Archivado y descubrimiento científico: recuperar figuras, tablas y ecuaciones de artículos a partir de consultas textuales, un escenario donde el vector único pierde información.
- Migración progresiva de índice: construir el índice con `pplx-embed-v2-late-9b` para maxima calidad y servirlo con el 0.6B durante picos de carga, ya que ambos comparten espacio de embeddings.

## Benchmarks y rendimiento

Datos publicados en la model card (recuperación pública ViDoRe v3, nDCG@10):

| Modelo | Parametros activos | Dimension | ViDoRe v3, imagen, nDCG@10 | ViDoRe v3, Markdown, nDCG@10 |
|---|---|---|---|---|
| pplx-embed-v2-late-0.6b | 340M | 128 | 62,3% | 61,2% |
| pplx-embed-v2-late-9b | 7,4B | 128 | 65,2% | 64,7% |

No se han publicado otros resultados de benchmarks (MMLU, MTEB, BEIR u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,2 GB en fp16/BF16 y 2,4 GB en fp32, calculado a partir de los 594.321.600 parametros. A esto hay que sumar el codificador de visión y las activaciones, cuyo consumo exacto no está documentado.
- En cuantizacion de 8 bits la estimacion ronda 0,6 GB, y en 4 bits en torno a 0,35 GB; no se publican pesos cuantizados oficiales, por lo que estas cifras son estimaciones del coste de los parametros, no artefactos disponibles.
- Cabe sin dificultad en GPU de consumo: RTX 3060 de 12 GB, RTX 4070, RTX 4090 o superiores. En GPU de datacenter, A100 y H100 son sobredimensionadas para el modelo, aunque útiles si comparten nodo con otros componentes del pipeline.
- Coste de indice a tener en cuenta: al ser multivector, cada documento consume 128 dimensiones por token. Un documento de 1.000 tokens ocupa aproximadamente 512 KB en fp32 o 256 KB en fp16, muy por encima de un embedding de vector único.
- Opciones de despliegue documentadas: `sentence-transformers >= 6.0.0` con `transformers >= 5.4.0` (clase `MultiVectorEncoder`) y compatibilidad con PyLate. No hay evidencia en la información disponible de soporte para vLLM, llama.cpp, Ollama o TGI, ni de pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ViDoRe v3 imagen / Markdown | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-embed-v2-late-0.6b | 594M totales, 340M activos | no disponible | 62,3% / 61,2% | MIT | HuggingFace, safetensors |
| pplx-embed-v2-late-9b | activos 7,4B (mismo autor) | no disponible | 65,2% / 64,7% | MIT (segun repositorio del modelo pequeno; verificar en su ficha) | HuggingFace |
| ColBERT clasico (familia de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible |
| ColPali / ColQwen2 (retrievers visuales de late-interaction) | no disponible | no disponible | no disponible | no disponible | no disponible |
| jina-colbert-v2 (retriever multilingue multivector) | no disponible | no disponible | no disponible | no disponible | no disponible |

Los únicos datos cuantitativos disponibles en la información proporcionada corresponden a los dos modelos de la propia familia. Para el resto de alternativas no se han facilitado especificaciones ni resultados, por lo que se marcan como no disponibles.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce representaciones y puntuaciones de similitud. No soporta tool calling, agentes ni razonamiento multi-paso.
- No admite entradas mixtas de texto e imagen en la misma llamada; hay que codificar por separado los lotes de texto y de imagen.
- Diferencia de comportamiento con PyLate: PyLate inserta los marcadores Q/D en la segunda posición, mientras que este modelo los espera en la primera. Un uso incorrecto degrada la calidad de recuperación.
- El coste de almacenamiento del índice es elevado por el esquema multivector (128 dimensiones por token); en corpus grandes conviene planificar compresión o pruning de tokens.
- Los resultados publicados son nDCG@10 sobre ViDoRe v3 y no permiten extrapolar rendimiento a dominios específicos como legislación local, informes médicos o documentación industrial.
- Riesgo de alucinación: no aplica a generación de texto, pero sí existe riesgo de recuperaciones espurias cuando el corpus contiene documentos visualmente similares o plantillas repetidas.
- Sesgos: la model card no documenta análisis de sesgo ni evaluación de equidad; la base Qwen3.5 y el profesor interno de 18B pueden arrastrar sesgos de sus datos de entrenamiento, no especificados.
- Cobertura lingüística: se declara multilingüe de forma genérica, sin lista de idiomas ni métricas por idioma; no hay garantía cuantificada para el castellano.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones de la base Qwen3.5 y de los pesos derivados antes de un despliegue en produccion.
- Cifras de VRAM por cuantizacion: son estimaciones derivadas del numero de parametros, no medidas oficiales; no existen pesos cuantizados publicados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Modelo hermano de 9B: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-9b
- Blog de Perplexity sobre embeddings multimodales: https://www.perplexity.ai/hub/blog/multimodal-embeddings-beyond-a-single-vector
- Paper de referencia del objetivo LEAF: https://aclanthology.org/2026.acl-long.2008/
- Pagina principal de Perplexity: https://www.perplexity.ai/
- Guia de inicio de Perplexity: https://www.perplexity.ai/fr/hub/getting-started
- Perplexity en redes: https://www.social.perplexity.ai/
- Entrada de Perplexity AI en Wikipedia: https://fr.wikipedia.org/wiki/Perplexity_AI
- Articulo divulgativo sobre Perplexity AI: https://www.lesnumeriques.com/science-espace/qu-est-ce-que-perplexity-ai-et-comment-l-utiliser-a230994.html
