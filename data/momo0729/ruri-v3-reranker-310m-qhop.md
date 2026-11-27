# momo0729/ruri-v3-reranker-310m-qhop

## Resumen

ruri-v3-reranker-310m-qhop es un modelo de reranking (reordenación de resultados de búsqueda) para japonés, publicado por el usuario momo0729 en Hugging Face. Se trata de un ajuste fino del modelo cl-nagoya/ruri-v3-reranker-310m, un reranker basado en la arquitectura ModernBERT con aproximadamente 315 millones de parámetros. La modificación consiste exclusivamente en los pesos: la estructura y el tokenizador son idénticos al modelo original, por lo que es intercambiable con él en cualquier pipeline existente.

El problema que aborda es específico del retrieval aumentado por generación (RAG) en japonés: mejorar la capacidad del reranker para puntuar correctamente fragmentos de evidencia en consultas de tipo multi-hop, es decir, preguntas cuya respuesta requiere combinar información de varios pasajes. Para ello, el autor construyó consultas derivadas (la pregunta original, su primera mitad, o una pregunta reconstruida que une una respuesta intermedia con la segunda mitad) y entrenó el modelo con entropía cruzada para que el fragmento de evidencia correcto puntúe por encima de los fragmentos recuperados que no contienen evidencia.

Su relevancia es doble: por un lado, aplica una técnica de aumento de datos orientada a multi-hop sobre un reranker compacto y desplegable en hardware modesto; por otro, mantiene la licencia Apache 2.0 del modelo base. El repositorio tiene un tamaño de 1,3 GB y, en el momento de la consulta, no registra descargas ni likes, lo que indica que es una publicación muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, según tags del repositorio) |
| Parametros totales | 315.203.329 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura ModernBERT del reranker original cl-nagoya/ruri-v3-reranker-310m. ModernBERT es un encoder transformer con atención de contexto largo y mejoras de eficiencia respecto a BERT clásico; el autor confirma que la estructura y el tokenizador son idénticos al modelo base y que solo se han modificado los pesos. Al ser un reranker, la salida es una puntuación de relevancia para un par consulta-documento, no texto generado.

El entrenamiento se realizó sobre datos derivados de dos fuentes en japonés: cl-nagoya/auto-wiki-qa (CC BY-SA 4.0), del que se combinaron por regla pares de preguntas en consultas de dos saltos (two-hop) y se filtraron por límites de palabra, respuestas cortas, ausencia de atajos y presencia de evidencia en los fragmentos distribuidos; y JEMHopQA (RIKEN, CC BY-SA 4.0), del que se usaron las preguntas con evidencia localizada en el corpus. Los fragmentos de evidencia actuaron como positivos y los fragmentos recuperados sin evidencia como negativos, con una función de pérdida de entropía cruzada sobre un positivo y varios negativos. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables de forma típica a un reranker). Tampoco se detalla ninguna innovación arquitectónica adicional más allá del esquema de aumento de consultas.

## Capacidades

- Reranking de pares consulta-documento en japonés: asigna una puntuación de relevancia a cada fragmento candidato para reordenar los resultados de un retriever.
- Manejo de consultas multi-hop: entrenado específicamente con preguntas de dos saltos y con variantes derivadas de la pregunta original.
- Robustez ante consultas parciales: el entrenamiento incluye la primera mitad de la pregunta y preguntas reconstruidas a partir de una respuesta intermedia, lo que mejora la puntuación cuando la consulta del usuario está incompleta o reformulada.
- Integración en pipelines RAG: sustituye al reranker base sin cambios de tokenizador ni de estructura.
- Capacidad multilingüe: limitada al japonés según la model card; no se documentan otros idiomas.
- Tool calling / function calling: no disponible; es un modelo de scoring, no un modelo generativo.
- Soporte de agentes y razonamiento multi-step: no disponible como tal; su contribución al razonamiento multi-step se limita a la fase de recuperación.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- RAG sobre Wikipedia en japonés: reordenar los fragmentos recuperados por un retriever denso o léxico antes de pasarlos al generador, usando la puntuación del modelo para descartar pasajes sin evidencia y reducir el contexto irrelevante enviado al LLM.
- Preguntas de dos saltos en asistentes documentales: en consultas que requieren combinar dos hechos (por ejemplo, identificar una entidad y luego un atributo de esa entidad), el entrenamiento específico con consultas two-hop mejora la selección del fragmento que contiene la evidencia final.
- Búsqueda empresarial interna en japonés: reordenar resultados de un buscador sobre documentación corporativa, con la ventaja de que el modelo cabe en una GPU de consumo y puede desplegarse on-premise sin depender de APIs externas.
- Atención al cliente con base de conocimiento: puntuar artículos de ayuda candidatos para una consulta de usuario y presentar primero los fragmentos que contienen la respuesta, incluso si la consulta está mal formulada o truncada.
- Evaluación y depuración de pipelines de retrieval: usar las puntuaciones del reranker como señal para comparar retrievers, analizar qué fragmentos se recuperan sin evidencia y ajustar la estrategia de chunking.
- Filtrado de contexto en sistemas de QA extractiva: seleccionar los mejores fragmentos antes de un modelo de extracción de respuestas, reduciendo el ruido y el coste computacional del paso posterior.
- Prototipado e investigación en recuperación multilingüe con foco en japonés: servir como baseline ajustado para experimentos de aumento de datos con consultas derivadas, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 315 millones de parámetros en fp16, aproximadamente 0,7 GB de pesos; en fp32, unos 1,3 GB. A ello hay que sumar el overhead de activaciones y del tokenizador, por lo que un presupuesto realista de 1,5-2 GB en fp16 es suficiente para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para alto throughput en servidor, A100 o H100 no son necesarias pero permiten lotes grandes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un encoder con pesos safetensors, es compatible con librerías de transformers; para serving de rerankers se puede usar un servidor de inferencia basado en transformers, ONNX Runtime o TensorRT. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| momo0729/ruri-v3-reranker-310m-qhop | 315 M | no disponible | japonés | Apache 2.0 | Ajuste fino multi-hop del reranker ruri-v3 |
| cl-nagoya/ruri-v3-reranker-310m | 310 M (aprox.) | no disponible | japonés | Apache 2.0 (según modelo base) | Modelo original sin el ajuste multi-hop; misma estructura y tokenizador |
| Rerankers multilingües de gran tamano (p. ej. familia bge-reranker) | variable | variable | multilingüe | variable | Alternativas genéricas; no se dispone de datos comparativos específicos en la información proporcionada |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: el modelo está entrenado y documentado únicamente para japonés; su comportamiento en otros idiomas no está validado.
- Sesgos de los datos: el entrenamiento se basa en Wikipedia en japonés y en JEMHopQA, por lo que hereda los sesgos de cobertura y de perspectiva de esas fuentes.
- Riesgo de falsos positivos y negativos: al ser un reranker, una puntuación alta no garantiza que el fragmento contenga la respuesta; en dominios alejados de Wikipedia (documentación técnica, jurídica o médica) el rendimiento puede degradarse.
- Ausencia de benchmarks publicados: no hay métricas de nDCG, MRR ni comparaciones con el modelo base, lo que impide cuantificar la mejora del ajuste multi-hop.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, pero los datos de entrenamiento incluyen conjuntos bajo CC BY-SA 4.0 (auto-wiki-qa, JEMHopQA y los fragmentos de Wikipedia), lo que conviene revisar antes de un uso comercial a gran escala.
- Madurez: repositorio con cero descargas y creado recientemente; no hay evidencia de uso en producción ni de mantenimiento.
- Contexto máximo no documentado: se desconoce la longitud máxima de secuencia soportada, dato relevante para elegir el tamaño de los fragmentos en un pipeline RAG.
- No es un modelo generativo: no debe usarse para generar respuestas ni para tool calling; su función es exclusivamente puntuar pares consulta-documento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/momo0729/ruri-v3-reranker-310m-qhop
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- JEMHopQA (RIKEN): https://github.com/aiishii/JEMHopQA
- Paper de JEMHopQA (Ishii et al., LREC-COLING 2024): no disponible como enlace directo en la información proporcionada
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
