# NGA-KR/law-embed-0.6b-r70

## Resumen

NGA-KR/law-embed-0.6b-r70 es un modelo de embeddings para recuperación de información jurídica desarrollado por NextGenAI (NGA-KR). Se trata de una release de investigación del sistema R70, construido sobre el backbone litillabs/litil-embed-0.6b (a su vez derivado de Octen), al que se añaden tres adaptadores ligeros de 98.304 parámetros FP32 cada uno. El modelo genera embeddings de 1.024 dimensiones con una ventana de contexto máxima de 32.768 tokens.

Su propósito es resolver la recuperación semántica de textos legales (estatutos, sentencias, contratos, documentos en alemán y chino) con un modelo pequeño de 0,6B de parámetros, evitando recurrir a modelos grandes en inferencia: un profesor de 4B (Qwen3-Embedding-4B) se usó solo durante el entrenamiento mediante destilación relacional. Es relevante porque demuestra que adaptadores enrutados por tarea sobre un backbone compacto pueden competir en MTEB(Law) sin despliegues costosos.

La arquitectura se basa en Qwen3 y el modelo se distribuye en formato safetensors bajo licencia Apache-2.0, con soporte para sentence-transformers y text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone tipo Qwen3 (transformer) con task-routed adapters |
| Parametros totales | 595.776.512 (backbone) + 98.304 por adaptador (3 adaptadores FP32) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (evaluado en BF16) |
| Idiomas soportados | ingles, aleman, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un backbone transformer de 595.776.512 parámetros (R37, fine-tuned desde litillabs/litil-embed-0.6b) con tres adaptadores pequeños enrutados por tarea (task-routed adapters). Esta路由 no es una función de embedding única agnóstica a la tarea: por ejemplo, las consultas de GerDaLIRSmall usan el query adapter seguido del symmetric adapter, mientras que sus documentos usan solo el symmetric adapter; LeCaRDv2 usa el relational-distilled symmetric adapter tanto para consultas como para documentos. El resto de tareas usan el backbone con prompts fijos. Esta configuración de inferencia exacta forma parte del sistema y debe conservarse para reproducir resultados.

El entrenamiento del backbone incluyó pares públicos de recuperación legal de las fuentes Billsum, CAIL, ECtHR, GerLayQA, IndianStatute, LEDGAR y SCOTUS, además de pares legales en alemán y chino y los datos de entrenamiento de GerDaLIR. La preparación de datos empleó filtrado de solapamientos exactos/cercanos y splits por componentes conexos. El adaptador de LeCaRDv2 se entrenó con pares equilibrados CAIL/chinos mediante destilación KL relacional desde Qwen/Qwen3-Embedding-4B (solo en entrenamiento), junto con pérdida de recuperación positiva y regularización de deriva coseno (rank 16, regularización 10). El propio autor advierte que el modelo no es zero-shot en GerDaLIRSmall y LeCaRDv2, ya que el entrenamiento base heredado los incluye.

## Capacidades

- Generación de embeddings de texto para similitud de frases y recuperación (pipeline sentence-similarity), con salidas de 1.024 dimensiones.
- Recuperación jurídica especializada: emparejamiento de consultas con estatutos, sentencias y contratos en ingles, aleman y chino.
- Contexto largo: hasta 32.768 tokens por entrada, adecuado para documentos legales extensos.
- Enrutamiento por tarea mediante tres adaptadores especializados (query, symmetric y relational-distilled symmetric).
- Compatibilidad con sentence-transformers, text-embeddings-inference y endpoints de Hugging Face.
- No genera texto: es un modelo de embeddings, sin capacidades de generación, razonamiento ni tool calling.

## Casos de uso

- Busqueda de precedentes judiciales: dado un caso, el modelo recupera sentencias similares en colecciones grandes (tipo AILA Casedocs) gracias a su especializacion en pares caso-estatuto.
- Recuperacion de estatutos y normativa: emparejamiento consulta-ley (AILAStatutes, 89,97 en MTEB Law), util para asistentes legales que deben citar la norma aplicable.
- Sistemas RAG juridicos en aleman: recuperacion sobre corpora legales alemanes (GerDaLIRSmall, LegalQuAD) con soporte nativo del idioma.
- Recuperacion de documentos legales chinos: LeCaRDv2 con el adaptador destilado relacional, entrenado con datos CAIL equilibrados.
- QA sobre contratos y documentos de consumo: LegalBenchConsumerContractsQA (82,09) para localizar respuestas dentro de contratos.
- Analisis de resumenes legales: LegalSummarization (73,15) para recuperar o alinear resumenes con sus documentos fuente.
- Indexacion semantica de grandes corpus juridicos multilingues (en/de/zh) en bases vectoriales, con contexto de 32.768 tokens para documentos largos.

## Benchmarks y rendimiento

Resultados publicados por el autor en MTEB(Law, v1) con MTEB 2.20.11, BF16, batch size 4, GPU RTX PRO 6000. Son resultados calculados localmente, pendientes de revision de los mantenedores de MTEB, sin reclamo de ranking. No se incluyen comparaciones con otros modelos en la informacion disponible.

| Task | Score |
|---|---:|
| AILACasedocs | 56,609 |
| AILAStatutes | 89,970 |
| GerDaLIRSmall | 45,473 |
| LeCaRDv2 | 74,769 |
| LegalBenchConsumerContractsQA | 82,088 |
| LegalBenchCorporateLobbying | 95,727 |
| LegalQuAD | 70,249 |
| LegalSummarization | 73,149 |
| Media (tarea) | 73,504 |

Advertencia del autor: se evaluaron multiples candidatos previos sobre el mismo conjunto de test publico de MTEB Law y el objetivo de 73,50 se alcanzo en R70, por lo que el resultado no debe interpretarse como una estimacion untouched de holdout final.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB para los pesos del backbone en BF16 (595,77 M de parametros), mas los tres adaptadores FP32 y overhead de activaciones; el repositorio completo ocupa 1,2 GB.
- GPU recomendadas: cabe holgadamente en GPUs de consumo; la evaluacion oficial se realizo en una RTX PRO 6000. No se requieren A100 ni H100 para inferencia.
- Consumer GPUs: compatible con RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090 y superiores; incluso GPUs con 4-6 GB de VRAM deberian ser suficientes para cargas ligeras.
- Despliegue: sentence-transformers (via `nga_law.NGALawEncoder` incluido en el repo), text-embeddings-inference y Hugging Face Endpoints (tag endpoints_compatible). No hay evidencia de soporte directo en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Notas |
|---|---|---|---|---|---|
| NGA-KR/law-embed-0.6b-r70 | 595,78 M + 3 adaptadores | 32.768 | 1.024 | Apache-2.0 | Especializado en dominio legal (en/de/zh), enrutamiento por tarea |
| Qwen/Qwen3-Embedding-4B | ~4B (profesor) | no disponible | no disponible | no disponible | Usado como profesor en destilacion; modelo generalista |
| litillabs/litil-embed-0.6b | 595,78 M | no disponible | no disponible | Apache-2.0 | Backbone base, sin adaptadores legales |

No hay datos de benchmarks comparativos directos en la informacion disponible para las alternativas.

## Limitaciones y advertencias

- No es un modelo zero-shot en GerDaLIRSmall ni LeCaRDv2: el entrenamiento base heredado incluye datos de ambos conjuntos de test, lo que infla potencialmente sus puntuaciones en esas tareas.
- El resultado medio de 73,50 no es una estimacion holdout intacta: se evaluaron multiples candidatos sobre el mismo test publico y se fijo 73,50 como objetivo de parada (test-reuse y enrutamiento declarados para revision de los mantenedores de MTEB).
- Los resultados de MTEB estan pendientes de revision y aceptacion en el leaderboard; no hay reclamo de ranking.
- El autor no garantiza la ausencia total de solapamiento semantico entre entrenamiento y validacion pese al filtrado aplicado.
- Los adaptadores exigen una configuracion de inferencia exacta (prompts fijos, rutas de adaptadores por tarea); usar solo el backbone produce resultados distintos y no documentados.
- El modelo recupera texto y no proporciona asesoramiento juridico ni verifica la correccion legal de forma independiente.
- Idiomas limitados a ingles, aleman y chino; no hay soporte declarado para castellano.
- Es un modelo de embeddings: no sirve para generacion de texto ni para tareas que no sean similitud/recuperacion.
- Licencia Apache-2.0 sin restricciones de uso comercial, pero se pide retener las atribuciones upstream y revisar las limitaciones heredadas del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGA-KR/law-embed-0.6b-r70
- Modelo base: https://huggingface.co/litillabs/litil-embed-0.6b
- Modelo profesor usado en destilacion: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Paper, blog y demo: no disponibles en la informacion proporcionada.
