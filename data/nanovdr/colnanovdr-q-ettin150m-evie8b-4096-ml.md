# nanovdr/ColNanoVDR-Q-Ettin150M-EVIE8B-4096-ML

## Resumen

ColNanoVDR-Q-Ettin150M-EVIE8B-4096-ML es una torre de consulta (query tower) de 149.014.272 parámetros para recuperación multi-vector de documentos visuales. Lo desarrolla el proyecto nanovdr y se distribuye bajo licencia Apache 2.0. Su función es sustituir el codificador de consultas de un recuperador visual de documentos basado en late interaction, en concreto el del modelo tencent/EVIE-8B (8,4B parámetros), por un encoder de texto pequeño de 150M parámetros derivado de jhu-clsp/ettin-encoder-150m (familia ModernBERT). La parte de documentos no se toca: el índice de páginas lo sigue generando EVIE-8B.

El problema que resuelve es de coste en tiempo de servicio. En un recuperador multi-vector clásico, la consulta debe atravesar la torre de visión del modelo grande para producir sus embeddings, lo que exige GPU en la ruta crítica de cada búsqueda. ColNanoVDR elimina esa necesidad: al ser un encoder solo de texto, la consulta se puede codificar en CPU y después puntuarse con MaxSim contra un índice de páginas ya construido. Según la model card, conserva el 94,0% del NDCG@5 y el 94,0% del NDCG@10 del maestro en ViDoRe v3.

La relevancia actual es práctica: permite desplegar búsqueda documental multimodal sobre índices de un retriever de 8,4B sin pagar inferencia de visión por consulta, a cambio de un modelo de 0,6 GB y de mantener la indexación offline con el maestro. El entrenamiento se hace por destilación sin documentos, usando el objetivo de transporte óptimo OTW sobre los embeddings de consulta del profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de texto (backbone jhu-clsp/ettin-encoder-150m, familia ModernBERT) + proyeccion lineal sin sesgo a 4096 dimensiones + normalizacion L2 por token + cabecera de pesos aprendidos por token; recuperacion por late interaction multi-vector (MaxSim) |
| Parametros totales | 149.014.272 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Ingles mas cinco idiomas europeos de escritura latina (la model card no detalla cuales); mezcla de entrenamiento "ML" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 0,6 GB) |

## Arquitectura y entrenamiento

La torre de consulta encadena el encoder Ettin de 150M parámetros con una proyección lineal sin sesgo a 4096 dimensiones, aplica normalización L2 por token y añade una cabecera de pesos (una capa lineal sobre los estados ocultos previos a la proyección, con softmax sobre los tokens de la consulta). Cada token se escala por su peso, de modo que los vectores emitidos no son unitarios y sus normas suman 1 por consulta; los tokens especiales quedan excluidos del scoring. El lado de documentos permanece intacto y se codifica con EVIE-8B a 1024 tokens visuales por página.

El entrenamiento usa destilación sin documentos: nunca se codifica una imagen de página y no se emplean etiquetas de relevancia. El dataset nanovdr/NanoVDR-Train contiene 1,49M de consultas (711K en inglés y 778K traducciones automáticas a cinco idiomas europeos de escritura latina); solo se usa el texto de la consulta, y los embeddings del profesor EVIE-8B se cachean una sola vez, de modo que el maestro no se ejecuta durante el entrenamiento. La pérdida OTW trata cada conjunto de tokens como un conjunto ponderado sobre la esfera unitaria y minimiza el coste de transporte óptimo entrópico con `c(s,t) = 1 - <s,t>`, resolviendo el plan de transporte con Sinkhorn (`eps = 0.05`, 50 iteraciones). Se optimiza con AdamW one-cycle, LR máximo 3e-4, 3% de warmup, batch efectivo 1024 (128 por GPU x 2 GPUs x 4 de acumulación) y 10 épocas.

## Capacidades

- Codificación de consultas de texto para recuperación de documentos visuales (páginas, PDF, capturas) mediante late interaction multi-vector de 4096 dimensiones.
- Puntuación MaxSim (media de MaxSim) contra índices de páginas generados por tencent/EVIE-8B.
- Inferencia de la consulta en CPU: la ruta online no necesita torre de visión, procesador de imagen ni GPU.
- Consultas multilingües: inglés más cinco idiomas europeos de escritura latina, según la mezcla de entrenamiento ML.
- Acepta la consulta en texto plano, sin prefijo de instrucción y sin re-normalizar la salida (los pesos aprendidos ya están plegados en las normas de los vectores).
- No es un modelo generativo: no produce texto, no soporta tool calling, function calling, agentes ni razonamiento multi-paso. Esas capacidades no aplican a este modelo.
- No procesa imágenes ni audio: solo codifica texto de consulta; la parte visual recae exclusivamente en el maestro.

## Casos de uso

- Búsqueda sobre archivos de PDF escaneados: una empresa indexa una vez sus facturas, contratos o informes con EVIE-8B y responde las consultas en línea con esta torre, evitando ejecutar el modelo de 8,4B por cada búsqueda.
- Recuperación aumentada por generación (RAG) sobre documentos visuales: las consultas se codifican en CPU y se puntúan contra el índice de páginas; el texto recuperado se pasa después a un modelo generativo, con lo que la ruta de recuperación no consume GPU.
- Consulta multilingüe en corpus europeos: al cubrir inglés y cinco idiomas europeos de escritura latina, permite lanzar la misma pregunta en distintos idiomas contra un único índice de páginas sin reindexar.
- Análisis financiero sobre informes anuales y tablas: las páginas con gráficos y tablas quedan representadas por el índice visual del maestro, y las preguntas del analista se resuelven con un encoder de 150M.
- Búsqueda de patentes y documentación técnica: consultas cortas y precisas contra miles de páginas con diagramas, donde el coste por consulta debe ser mínimo para permitir uso interactivo.
- Despliegue de bajo coste en infraestructura existente: al requerir solo 0,6 GB de pesos y poder ejecutarse en CPU, se puede servir la búsqueda desde contenedores sin GPU, reservando la GPU para la indexación offline.
- Atención al cliente con base documental interna: preguntas de usuarios contra manuales y fichas de producto, con la latencia de un encoder pequeño en lugar de una torre multimodal completa.
- Sistemas de cumplimiento y auditoría documental: verificación de si un documento concreto responde a una consulta regulatoria, aprovechando el índice visual del maestro y una torre de consulta barata y cacheable.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son agregados sobre ViDoRe v3 (8 datasets públicos, todas las lenguas de consulta, con páginas codificadas por EVIE-8B a 1024 tokens visuales). La tabla por dataset que aparece en la model card está truncada en la información proporcionada, por lo que sus valores no están disponibles.

| Metrica (ViDoRe v3, agregada) | EVIE-8B (maestro) | ColNanoVDR | Retencion |
|---|---|---|---|
| NDCG@5 | No disponible | No disponible | 94,0% |
| NDCG@10 | 66,44 (arnés del autor); 66,75 (informe propio de EVIE) | No disponible | 94,0% |

Nota metodológica de la model card: el error del estudiante se atribuye íntegramente a la torre de consulta, ya que las páginas son las mismas en ambos casos.

## Requisitos de hardware

- Peso de la torre de consulta: repositorio safetensors de 0,6 GB. En fp32 ocupa aproximadamente 0,60 GB (149M parámetros) y en fp16/bf16 unos 0,30 GB; son estimaciones derivadas del recuento de parámetros, no cifras publicadas.
- Inferencia en CPU: soportada explícitamente por la model card en la ruta de consulta; basta con memoria RAM suficiente para los pesos más el overhead del runtime (del orden de 1-2 GB).
- GPU: cabe en cualquier GPU de consumo actual, e incluso en iGPU, dado el tamaño del modelo. No hay cifras de producto recomendado publicadas.
- Indexación de documentos: requiere ejecutar EVIE-8B (8,4B parámetros) sobre las imágenes de página, en la model card con bfloat16 y `device="cuda"`. Los requisitos concretos de VRAM de esa fase no están disponibles en la información proporcionada.
- Opciones de despliegue: `sentence-transformers` (clase `MultiVectorEncoder`, requiere `sentence-transformers>=6.0` y `transformers>=5.0`, probado con 6.1 y 5.13.1), integración con Text Embeddings Inference (etiqueta `text-embeddings-inference`) y endpoints compatibles. No aplican vLLM, llama.cpp ni Ollama, al no ser un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Dim. late interaction | Indice requerido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ColNanoVDR-Q-Ettin150M-EVIE8B-4096-ML (este modelo) | Torre de consulta | 149M | 4096 | Paginas indexadas por EVIE-8B | apache-2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| ColNanoVDR-Q-Ettin150M-EVIE45B-2048-ML | Torre de consulta | Backbone Ettin150M | 2048 | Paginas indexadas por EVIE-4.5B; indice mas pequeno (Prefix-MRL + compresion HAC) | No disponible en la informacion proporcionada | HuggingFace |
| tencent/EVIE-8B | Recuperador visual completo (maestro) | 8,4B | 4096 | Se codifica a si mismo | No disponible en la informacion proporcionada | HuggingFace |
| jhu-clsp/ettin-encoder-150m | Encoder de texto general (backbone) | 150M | No aplica (no es multi-vector) | No aplica | No disponible en la informacion proporcionada | HuggingFace |

Alternativas de la misma categoría (torres de consulta destiladas para recuperación visual de documentos) distintas a las de la familia nanovdr: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo no generativo: no redacta respuestas, no razona ni ejecuta herramientas. Debe combinarse con un generador o con lógica de negocio para producir salidas legibles.
- Dependencia estricta del maestro: la torre solo es válida con el profesor del que se destiló. En este caso exige páginas indexadas por tencent/EVIE-8B. Usarla con otro índice invalida los resultados.
- Solo cubre el lado de la consulta. No indexa documentos, no procesa imágenes y no sustituye a EVIE-8B en la fase offline.
- Restricciones de uso: no pasar prefijo de instrucción a la consulta y no re-normalizar la salida; los pesos aprendidos por token ya están incorporados en las normas de los vectores. Ignorar esto degrada la puntuación.
- Cobertura lingüística limitada a inglés y cinco idiomas europeos de escritura latina; no hay soporte documentado para otras lenguas ni para escrituras no latinas.
- Parte del corpus de entrenamiento (778K de 1,49M consultas) son traducciones automáticas, lo que puede introducir ruido de traducción en las lenguas no inglesas.
- No se han publicado datos de sesgo ni evaluaciones de equidad en la información disponible.
- Riesgo de error de recuperación en lugar de alucinación: al no generar texto, el fallo típico es devolver páginas no relevantes, que en un pipeline RAG puede propagarse como respuesta incorrecta.
- Longitud de contexto no documentada: se desconoce el límite de tokens de consulta admitido.
- El desglose de resultados por dataset y el comportamiento por idioma no están disponibles (tabla truncada en la información consultada).
- Señales de adopción muy bajas (0 descargas y 0 likes en el momento de la consulta) y ausencia de validación independiente; conviene evaluar en el dominio propio antes de producción.
- La licencia del maestro EVIE-8B debe verificarse por separado si se va a usar en producción; no está disponible en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nanovdr/ColNanoVDR-Q-Ettin150M-EVIE8B-4096-ML
- Paper (arXiv): https://arxiv.org/abs/2609.34899
- Codigo: https://github.com/Ryenhails/NanoVDR
- Dataset de entrenamiento: https://huggingface.co/datasets/nanovdr/NanoVDR-Train
- Organizacion nanovdr (resto de torres): https://huggingface.co/nanovdr
- Torre hermana para EVIE-4.5B: https://huggingface.co/nanovdr/ColNanoVDR-Q-Ettin150M-EVIE45B-2048-ML
- Maestro tencent/EVIE-8B: https://huggingface.co/tencent/EVIE-8B
- Backbone jhu-clsp/ettin-encoder-150m: https://huggingface.co/jhu-clsp/ettin-encoder-150m
