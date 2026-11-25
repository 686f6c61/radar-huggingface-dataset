# FDU-INS/ClosureRAG

## Resumen

ClosureRAG es una familia de tres cross-encoders de reordenación (reranking) entrenados por FDU-INS para responder preguntas cuya resolución depende de un conjunto de normas interdependientes. El modelo parte de Qwen/Qwen3-Reranker-0.6B y se especializa en el dominio asegurador y de cumplimiento regulatorio. La idea central es la "clausura de evidencia" (evidence closure): una pregunta solo se responde correctamente si el sistema de recuperación obtiene el conjunto completo de pasajes normativos que la determinan, no solo los más similares léxicamente.

El repositorio contiene tres checkpoints completos de transformers: un ranker de cobertura de nivel 1, un rescorer condicionado por contexto de nivel 2 y una ablación pointwise del nivel 1. Cada carpeta incluye pesos en safetensors, tokenizador, configuraciones y el registro de entrenamiento. El modelo se usa dentro del pipeline de recuperación del repositorio de GitHub del proyecto, que orquesta construcción de peticiones, puntuación de nivel 1, fusión de rankings, rescoring de nivel 2 y ranking final.

Es relevante porque aborda un fallo típico de los sistemas RAG en dominios regulados: recuperar pasajes parcialmente relevantes pero omitir normas auxiliares necesarias para decidir el caso. Con 0,6 mil millones de parámetros y licencia Apache-2.0, es desplegable en hardware modesto, aunque su uso está ligado al formato de entrada y al pipeline específicos del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer decoder (Qwen3-Reranker-0.6B), puntuación por diferencia de logits sí/no en la última posición |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-Reranker-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; el repo ocupa 3,6 GB para los tres checkpoints) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoints completos de transformers) |

## Arquitectura y entrenamiento

Los tres modelos son cross-encoders derivados de Qwen3-Reranker-0.6B. Cada par (caso, pasaje) se codifica conjuntamente y se puntúa mediante la diferencia de logits entre las respuestas "sí" y "no" en la última posición. El nivel 1 puntúa cada candidato del pool de 400 pasajes de forma independiente y sus puntuaciones se fusionan con el ranking de primera etapa (μ = 1,0). El nivel 2 reordena el top-60 fusionado condicionado por los demás pasajes mejor rankeados (m = 8) y se mezcla con la puntuación fusionada (λ = 0,5). La ablación de nivel 1 sustituye la pérdida group-wise por una pérdida pointwise (fusión con μ = 1,5).

El entrenamiento se realizó en una A100-40GB en bf16 con AdamW (learning rate 1e-5) y 8 listas por actualización. El nivel 1 usó 2.058 listas, 2 épocas y 516 actualizaciones, con pérdida group-wise (τ = 1), hasta dos miembros por grupo gold, 24 negativos duros y 8 aleatorios, y un término pointwise de peso 0,2. El nivel 2 usó 6.174 listas (tres contextos por pregunta), 1 época y 772 actualizaciones, con 12 negativos duros y 6 aleatorios y un término pointwise de peso 0,05. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición completa del corpus.

## Capacidades

- Reordenación de pasajes para preguntas de dominio regulatorio y de seguros, puntuando la necesidad de cada pasaje para decidir el caso.
- Cobertura de conjuntos de evidencia interdependientes: el nivel 1 prioriza cubrir todos los grupos normativos necesarios, no solo el pasaje más relevante.
- Rescoring condicionado por contexto: el nivel 2 ajusta la puntuación de un pasaje en función de los demás pasajes ya seleccionados.
- Fusión con un ranking de primera etapa mediante parámetros configurables (μ y λ).
- Integración en pipelines RAG de recuperación multi-etapa.
- Soporte de evaluación sobre el benchmark InsClosure (1.160 preguntas de test) mediante los scripts del repositorio.
- Idioma: únicamente inglés.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Preguntas de cumplimiento normativo en seguros: el pipeline recupera el conjunto completo de cláusulas y normas que determinan la respuesta, evitando respuestas basadas en un único artículo parcialmente relevante. El nivel 2 es clave cuando la decisión depende de la interacción entre varias normas.
- Asistencia a analistas de siniestros: dado un caso descrito en texto, el sistema ordena los pasajes de la base normativa por necesidad para la decisión, lo que permite al analista revisar la evidencia completa antes de resolver.
- Auditoría de respuestas RAG existentes: se puede usar el reranker para medir si la evidencia recuperada por un sistema previo constituye una clausura completa, comparando la cobertura frente al pool de candidatos.
- Construcción de bases de conocimiento regulatorias: el ranker de nivel 1 ayuda a identificar grupos de normas que suelen aparecer juntos en la resolución de casos, útil para curar ontologías y grafos de dependencias.
- Evaluación de recuperadores de primera etapa: la fusión con μ permite comparar el efecto de distintos retrievers iniciales sobre la cobertura final, usando el benchmark InsClosure como referencia.
- Investigación en recuperación multi-salto: el par de modelos nivel 1 y nivel 2 sirve como línea base reproducible para experimentos sobre evidencia interdependiente, con código y datos públicos.

## Benchmarks y rendimiento

Resultados sobre el test de InsClosure (1.160 preguntas), según la model card. FullCov@5/10/20 y Recall@5/10/20:

| Modelo | FullCov@5 | FullCov@10 | FullCov@20 | R@5 | R@10 | R@20 |
|---|---|---|---|---|---|---|
| ClosureRAG-L1 (nivel 1) | 20,8 | 38,3 | 75,1 | 60,4 | 76,2 | 91,1 |
| ClosureRAG (nivel 1 + nivel 2) | 27,6 | 52,2 | 81,3 | 69,1 | 82,0 | 93,5 |
| Ablación pointwise (nivel 1) | 15,7 | 31,4 | 66,2 | 61,3 | 72,2 | 87,6 |

El nivel 2 aporta una mejora de 6,8 puntos en FullCov@5 y de 8,7 puntos en Recall@5 respecto al nivel 1. No se han publicado en la información disponible resultados comparativos con otros rerankers externos.

## Requisitos de hardware

- VRAM estimada: un checkpoint de 0,6 mil millones de parámetros en bf16 ocupa aproximadamente 1,2 GB de pesos; con activaciones y el pool de candidatos, cabe holgadamente en GPUs de 8-16 GB.
- GPU recomendadas: A100-40GB para ejecutar el pipeline completo de evaluación (el autor indica aproximadamente una hora para las 1.160 preguntas de test); cualquier GPU con al menos 8 GB para inferencia puntual.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, al menos para puntuar pares individuales.
- Opciones de despliegue: transformers con los scripts del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma desagregada; el único dato es el tiempo total del pipeline de evaluación en A100-40GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClosureRAG | 0,6 B | no disponible | Reranking de evidencia para dominios regulados | Apache-2.0 | Hugging Face y GitHub |
| Qwen3-Reranker-0.6B | 0,6 B | no disponible | Reranking general | Apache-2.0 | Hugging Face |
| BGE-reranker-base | no disponible | no disponible | Reranking general | MIT | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los resultados publicados se limitan a las variantes internas de ClosureRAG.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado en castellano ni en otros idiomas.
- Está especializado en el dominio de seguros y regulación; su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al de rerankers generales.
- El uso requiere el formato de entrada específico del proyecto (texto del caso, tarjeta de documento, procedencia y, en nivel 2, tarjetas de contexto y relaciones del grafo); no es un reranker plug-and-play.
- Depende del repositorio de GitHub para construir peticiones, fusionar rankings y evaluar; la model card no documenta una API estándar de puntuación fuera de ese pipeline.
- Riesgo de alucinación y de sesgo: no se han publicado análisis específicos; al ser un reranker, el riesgo se traslada al generador que consuma los pasajes recuperados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la calidad en dominios distintos al asegurador no está garantizada.
- No se documentan límites de longitud de contexto ni comportamiento con secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FDU-INS/ClosureRAG
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Código, datos del benchmark InsClosure y resultados: https://github.com/vivilinx66-maker/ClosureRAG
