# NYSgpt/44b-reranker

## Resumen

El modelo `NYSgpt/44b-reranker` es un reranker de tipo cross-encoder desarrollado por NYSgpt (Brendan Stanton) y publicado en HuggingFace con licencia Apache 2.0. Está diseñado específicamente para tareas de reordenación de documentos científicos, con un enfoque particular en la revisión por pares: la consulta es el resumen que un revisor experto escribe sobre un artículo, y el documento positivo es el propio artículo al que se adjunta esa revisión. Esta supervisión inusual, generada por expertos de dominio que no conocían el modelo, busca capturar la relevancia semántica entre una descripción crítica y el texto original.

El modelo parte de `Alibaba-NLP/gte-reranker-modernbert-base`, una variante de ModernBERT optimizada para reranking, y se ha afinado sobre pares extraídos de un corpus de 44 mil millones de elementos (presumiblemente tokens o documentos). Con aproximadamente 150 millones de parámetros, es un modelo compacto que puede integrarse en pipelines de recuperación aumentada por generación (RAG) para mejorar la precisión de los resultados tras una búsqueda vectorial inicial. Su acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

La relevancia actual de este modelo radica en la creciente necesidad de sistemas de búsqueda semántica precisos en el ámbito académico, donde los resúmenes de revisores ofrecen una señal de relevancia difícil de obtener con métodos supervisados convencionales. Su tamaño reducido y su licencia permisiva lo convierten en una opción atractiva para equipos que necesitan desplegar reranking en producción sin depender de servicios propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (fine-tune de Alibaba-NLP/gte-reranker-modernbert-base) |
| Parametros totales | 149.605.633 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | No especificado (formato safetensors, cuantizable con herramientas estandar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe un par (consulta, documento) y produce una puntuación de relevancia. Su arquitectura se basa en ModernBERT, un transformer optimizado para eficiencia en tareas de recuperación, con atención bidireccional y mejoras en el manejo de secuencias largas. Al ser un fine-tune del checkpoint `gte-reranker-modernbert-base`, hereda las características de ese modelo, aunque no se han publicado detalles específicos sobre la configuración de capas, cabezas de atención o el mecanismo exacto de pooling.

El entrenamiento se realizó sobre pares "revisión por pares → paper" extraídos de un corpus de 44 mil millones de elementos. La supervisión es inusual: la consulta es el resumen que un revisor experto escribe sobre un artículo, redactado sin conocimiento previo del modelo, y el documento positivo es el artículo al que esa revisión está adjunta. Este enfoque proporciona una señal de relevancia basada en la evaluación humana experta, en lugar de depender de metadatos o anotaciones automáticas. No se han publicado detalles sobre el número de pasos de entrenamiento, la función de pérdida o si se emplearon técnicas adicionales como hard negative mining o data augmentation.

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuación de relevancia a cada par, permitiendo reordenar listas de candidatos recuperados por búsqueda vectorial.
- Especialización en documentos científicos: entrenado con resúmenes de revisores expertos, captura matices de relevancia en el ámbito académico, como la adecuación de una metodología o la solidez de los resultados.
- Integración con pipelines RAG: puede usarse como segunda etapa tras un retriever denso o BM25 para refinar los resultados y seleccionar los documentos más pertinentes.
- Compatibilidad con sentence-transformers: al estar basado en esa librería, se integra fácilmente con el ecosistema de embeddings y herramientas de HuggingFace.
- No es un modelo generativo: no produce texto, solo puntuaciones de relevancia, por lo que no aplican capacidades como generación de código, razonamiento multi-paso o tool calling.

## Casos de uso

- Búsqueda de literatura científica: un investigador formula una consulta sobre un tema específico y el sistema recupera decenas de papers mediante embeddings; el reranker reordena los resultados para destacar los artículos más relevantes, basándose en la señal de los resúmenes de revisores.
- Revisión por pares asistida: una plataforma de gestión de conferencias puede usar el modelo para sugerir revisores potenciales comparando el resumen de un manuscrito con los perfiles de expertos, o para priorizar la lista de papers que un revisor debe evaluar.
- Sistemas de recomendación de artículos: en portales como arXiv o repositorios institucionales, el modelo puede filtrar y ordenar artículos nuevos según el perfil de interés de un usuario, expresado como una consulta textual.
- RAG para investigación médica o técnica: un asistente de preguntas y respuestas sobre papers puede emplear el reranker para seleccionar los pasajes más relevantes antes de pasarlos a un LLM generativo, mejorando la fidelidad de las respuestas.
- Análisis de citas y bibliografía: al reordenar documentos candidatos, el modelo ayuda a identificar referencias clave en un campo, incluso cuando la consulta es una descripción cualitativa del trabajo deseado.
- Filtrado de candidatos en motores de búsqueda académicos: integrado en una API de búsqueda, puede reducir el ruido de resultados y presentar al usuario los documentos que un revisor experto consideraría pertinentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación estándar para este modelo. Tampoco se han comparado sus métricas de reranking (como nDCG@10 o MAP) con otros modelos en conjuntos públicos como BEIR o MS MARCO.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 150 millones de parámetros, su huella de memoria es reducida: en precisión fp32, los pesos ocupan alrededor de 600 MB; en fp16 o int8, el tamaño baja a ~300 MB o ~150 MB respectivamente, aunque no se han publicado valores oficiales.
- Puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, así como en CPUs modernas con suficiente RAM, gracias a su tamaño compacto.
- Para inferencia en producción, se recomienda usar bibliotecas como sentence-transformers, Text Embeddings Inference (TEI) o vLLM, que soportan cross-encoders y permiten batching eficiente.
- La latencia por par consulta-documento es del orden de milisegundos en GPU, pero depende de la longitud de las secuencias y del hardware; no se han publicado cifras específicas.
- El modelo está marcado como compatible con endpoints de Text Embeddings Inference y con la región "us", lo que sugiere que puede desplegarse en infraestructura cloud estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NYSgpt/44b-reranker | ~150M | No disponible | Apache 2.0 | Gated en HuggingFace |
| BAAI/bge-reranker-base | ~278M | 512 tokens | MIT | Abierto |
| Cohere Rerank (modelo propietario) | No publicados | 4096 tokens | Comercial | API de pago |

No se dispone de datos de rendimiento comparativos en benchmarks públicos para este modelo. BGE-reranker-base es una alternativa de código abierto ampliamente usada, mientras que Cohere Rerank ofrece un servicio gestionado con mayor contexto pero bajo licencia comercial. La ventaja diferencial de `44b-reranker` reside en su entrenamiento específico sobre resúmenes de revisores, que podría ofrecer mejor precisión en dominios científicos, aunque no hay evidencia pública que lo confirme.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace antes de poder descargarlo, lo que puede suponer una barrera para su uso inmediato.
- Dominio limitado: está entrenado principalmente con documentos científicos y resúmenes de revisores, por lo que su rendimiento en otros dominios (legales, financieros, conversacionales) podría ser inferior al de modelos más generales.
- Sesgos del corpus: al provenir de un corpus de publicaciones académicas, puede reflejar sesgos de publicación (idioma inglés predominante, áreas de investigación sobrerrepresentadas, etc.) y no generalizar bien a otros idiomas o estilos de escritura.
- Sin datos de evaluación pública: la ausencia de benchmarks publicados impide validar su rendimiento relativo frente a alternativas establecidas.
- No es un modelo generativo: no puede producir texto, resúmenes ni respuestas; solo puntúa pares, por lo que no es adecuado para tareas de generación.
- Longitud de contexto no confirmada: aunque ModernBERT soporta hasta 8192 tokens, no se ha especificado si el fine-tune mantiene ese límite; se recomienda verificar antes de usarlo con documentos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NYSgpt/44b-reranker
- Variante con nombre alternativo (misma arquitectura): https://huggingface.co/NYSgpt/44b-reranker-gte-modernbert
- Lista curada de modelos de reranking (referencia general): https://github.com/agentset-ai/awesome-rerankers
- Modelo base (Alibaba-NLP/gte-reranker-modernbert-base): https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base
