# AravArun/dhara-reranker

## Resumen

Dhara reranker es un cross-encoder para reordenamiento (reranking) de pasajes legales, especializado en derecho penal indio. Desarrollado por AravArun, se trata de un ajuste fino de BAAI/bge-reranker-base (278 millones de parametros) entrenado sobre pares pregunta-pasaje extraidos del corpus Dhara, que comprende sentencias penales del Tribunal Supremo de la India y secciones de los codigos penales (BNS, BNSS y BSA, que sustituyeron a IPC, CrPC y Evidence Act el 1 de julio de 2024).

El problema que resuelve es muy concreto: las preguntas se formulan con numeros de seccion del nuevo codigo, pero la mayoria de sentencias citan los codigos antiguos, por lo que el modelo debe evaluar la relevancia de un pasaje por su contenido semantico, no por el numero de seccion que cita. Esto lo hace especialmente util en sistemas RAG juridicos donde la terminologia legal cambia con el tiempo.

El modelo forma parte de la herramienta de investigacion Dhara (disponible en GitHub y con demo publica), donde reordena los 50 pasajes principales resultantes de una fusion de rangos (rank fusion) de BM25, un retriever basado en grafos de citas y busqueda densa y dispersa con bge-m3. Es relevante como ejemplo documentado de reranker especializado en un dominio vertical, con una metodologia de entrenamiento bien explicada (seleccion cuidadosa de negativos duros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder (XLM-RoBERTa) para text-ranking |
| Parametros totales | 278.044.417 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length usado en inferencia y entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en bge-reranker-base, que a su vez utiliza XLM-RoBERTa como backbone. A diferencia de los bi-encoders, un cross-encoder procesa pregunta y pasaje conjuntamente en una sola pasada, lo que permite interacciones de atencion mas finas entre ambos textos a costa de mayor coste computacional; por eso se emplea tipicamente como segunda etapa de reranking sobre un conjunto reducido de candidatos.

El entrenamiento se realizo sobre 1.596 preguntas y 9.235 pares (aproximadamente 4,8 negativos por pregunta), generados exclusivamente a partir de sentencias y secciones del split de entrenamiento. Los positivos son pasajes de la sentencia fuente que citan las disposiciones relevantes, o el texto propio de la norma en preguntas sobre estatutos. Los negativos duros proceden del retriever en produccion, con una decision metodologica clave: nunca se usan como negativos pasajes de otras sentencias que citan la misma ley (suelen ser respuestas correctas) ni el equivalente antiguo/nuevo de una norma. Se entreno con binary cross-entropy con positivos ponderados por la ratio de negativos, 2 epocas, learning rate 2e-5, batch efectivo de 16 y 512 tokens. El autor documenta que una primera version con negativos de misma ley y una epoca a 320 tokens rendia peor que el propio retriever; eliminar esos negativos fue la mejora decisiva.

## Capacidades

- Puntuacion de relevancia pregunta-pasaje (text-ranking) mediante `CrossEncoder.predict()`, con puntuaciones donde un valor mas alto indica mayor relevancia.
- Reranking de pasajes juridicos: sentencias penales del Tribunal Supremo de la India y secciones de los codigos penales (BNS, BNSS, BSA y sus predecesores IPC, CrPC, Evidence Act).
- Correspondencia semantica entre numeracion de secciones nueva y antigua: evalua el contenido del pasaje, no el numero de seccion citado.
- Filtrado de ambito (scope): en Dhara, la puntuacion maxima sobre las secciones recuperadas se usa para rechazar preguntas ajenas al derecho penal; con un umbral ajustado para responder al 95% de las preguntas in-scope, rechaza cerca de la mitad de las fuera de ambito (derecho civil, fiscal, familiar).
- Integracion con la libreria sentence-transformers y compatibilidad con text-embeddings-inference.

No soporta generacion de texto, tool calling, agentes ni capacidades multimodales: es un modelo discriminativo de ranking.

## Casos de uso

- Reranking en sistemas RAG juridicos sobre derecho penal indio: como segunda etapa tras BM25, busqueda densa o fusion de rangos, reordena los candidatos (en Dhara, los 50 primeros) para mejorar la precision del contexto entregado al LLM.
- Busqueda de jurisprudencia con codigos actualizados: permite formular consultas con secciones del BNS/BNSS/BSA y encontrar sentencias que citan las normas antiguas equivalentes (IPC, CrPC, Evidence Act).
- Investigacion academica en NLP juridico: el dataset, el benchmark DharaBench y la metodologia de negativos duros documentados sirven de referencia para entrenar rerankers de dominio vertical.
- Filtrado de consultas fuera de dominio en asistentes legales: la puntuacion del cross-encoder puede actuar como clasificador de ambito para rechazar preguntas no penales antes de generar respuesta.
- Analisis de corpus de sentencias: puntuacion automatica de la relevancia de pasajes de sentencias respecto a cuestiones juridicas concretas, util para revision de literatura o preparacion de casos.
- Construccion de pipelines de recuperacion hibrida: se integra facilmente con sentence-transformers junto a retrievers densos (bge-m3), dispersos y de grafos de citas.

## Benchmarks y rendimiento

Resultados publicados en DharaBench (split de test: 150 preguntas formuladas con numeros del nuevo codigo cuya respuesta es una sentencia que cita solo el codigo antiguo). Metrica: Recall@10 de la sentencia correcta.

| Setup | Recall@10 |
|---|---|
| BM25, pregunta tal cual | 0,27 |
| Denso solo (bge-m3) | 0,31 |
| BM25 + grafo de citas + bge-m3, rank fusion (grafo x2) | 0,38 |
| Reranker LLM sobre la fusion | 0,37 |
| Primera version fine-tuned sobre la fusion | 0,36 |
| Este modelo sobre la fusion | 0,43 |

En el split de desarrollo alcanza 0,49 frente a 0,47 de la fusion ponderada. Con 150 preguntas por split, las cifras tienen un ruido aproximado de ±0,04. El autor senala que rinde mejor desde la fusion simple que desde la ponderada con grafo de citas, y que no mejora el ranking de estatutos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278 millones de parametros en fp32, alrededor de 1,1 GB de pesos (tamano del repo); en fp16, aproximadamente 0,6 GB. Cualquier GPU moderna con 4 GB de VRAM o mas es suficiente; tambien funciona en CPU para lotes pequenos.
- GPU recomendadas: no requiere GPU dedicada; una RTX 3060/4060 o superior sobra ampliamente. Para reranking de alto throughput (miles de pares por segundo), GPUs tipo A10G, A100 o T4 en servicion.
- Cabe con holgura en GPUs de consumo; incluso es viable su ejecucion en portatiles y CPU gracias a su tamano contenido.
- Opciones de despliegue: sentence-transformers (CrossEncoder), text-embeddings-inference (TEI, marcado como compatible), y de forma indirecta cualquier stack que sirva cross-encoders (por ejemplo, integrandolo en LangChain, LlamaIndex o pipelines RAG propios). No hay evidencia de soporte directo en llama.cpp u Ollama al no ser un LLM generativo.
- Latencia y throughput estimados: no disponible. Como referencia general, un cross-encoder de 278M procesa del orden de decenas a cientos de pares por segundo en GPU de consumo con 512 tokens por par.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| AravArun/dhara-reranker | 278M | 512 tokens | Derecho penal indio (fine-tune de bge-reranker-base) | MIT |
| BAAI/bge-reranker-base (base) | 278M | 512 tokens | Generalista, multilingue | Apache 2.0 |
| BAAI/bge-reranker-large | 560M | 512 tokens | Generalista, multilingue | Apache 2.0 |
| jinaai/jina-reranker-v2-base-multilingual | 278M | 8.192 tokens | Generalista, multilingue | CC-BY-NC 4.0 |

Frente a su modelo base, dhara-reranker ofrece la misma arquitectura y tamano pero con rendimiento superior en su dominio (0,43 frente a 0,38 de Recall@10 en DharaBench con el mismo retriever, segun los datos publicados). Frente a bge-reranker-large, es la mitad de grande y, por tanto, mas barato de servir, aunque no hay comparativa directa publicada. Frente a jina-reranker-v2, pierde en longitud de contexto y multilingüidad, y la licencia de este ultimo restringe el uso comercial.

## Limitaciones y advertencias

- Dominio restringido: entrenado solo con sentencias penales del Tribunal Supremo de la India y los seis codigos penales. Otros tribunales y otras areas del derecho quedan fuera de su ambito y su rendimiento en ellos no esta evaluado.
- Solo ingles: no hay soporte para otras lenguas, incluidas las lenguas oficiales de la India.
- Las preguntas de entrenamiento se generaron a partir de headnotes, por lo que son mas limpias y estructuradas que las consultas reales de usuarios; el rendimiento con consultas informales podria degradarse.
- No mejora el ranking de estatutos (secciones de ley), solo el de jurisprudencia, segun los datos de evaluacion.
- Margen de error alto en la evaluacion: 150 preguntas por split implican un ruido de aproximadamente ±0,04 en Recall@10.
- Riesgo de alucinacion: no aplicable directamente al no ser generativo, pero las puntuaciones de relevancia no garantizan correccion juridica.
- Uso en produccion: el autor lo define explicitamente como ayuda de investigacion, no como asesoramiento legal; no debe usarse para tomar decisiones juridicas reales.
- Licencia MIT: sin restricciones para uso comercial, aunque los datos de entrenamiento proceden de un corpus especifico cuya procedencia conviene revisar en usos sensibles.
- Adopcion muy temprana: 26 descargas y 1 like en Hugging Face, sin comunidad de revision externa; conviene validar en el propio caso de uso antes de producir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AravArun/dhara-reranker
- Dataset de entrenamiento (Dhara corpus): https://huggingface.co/datasets/AravArun/dhara-indian-criminal-law
- Modelo base: https://huggingface.co/BAAI/bge-reranker-base
- Repositorio de la herramienta Dhara: https://github.com/Arav-Arun/Dhara
- Demo en linea: https://dhara.aravarun.in
- Tablas completas de evaluacion: https://github.com/Arav-Arun/Dhara/tree/main/eval/results
