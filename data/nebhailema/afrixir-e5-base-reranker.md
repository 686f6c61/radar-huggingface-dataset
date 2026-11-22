# nebhailema/afrixir-e5-base-reranker

## Resumen

AfriXIR E5 Base Reranker es un modelo cross-encoder para reordenamiento (reranking) de pasajes en tareas de recuperación de información multilingüe, especializado en ocho lenguas africanas: amárico (am), hausa (ha), oromo (om), shona (sn), somalí (so), suajili (sw), yoruba (yo) y zulú (zu). Lo desarrolla el usuario nebhailema y se obtiene por fine-tuning del modelo denso `intfloat/multilingual-e5-base` sobre el conjunto de datos AfriXIR, con la librería sentence-transformers.

El modelo resuelve la segunda fase de un pipeline de búsqueda: dado un par consulta-pasaje, devuelve una puntuación de relevancia que permite reordenar los candidatos recuperados por un retriever de primera fase. Con 278 millones de parámetros y una ventana de 510 tokens, es un modelo compacto pensado para desplegarse en infraestructura modesta, incluida GPU de consumo.

Su relevancia actual radica en la escasez de herramientas de recuperación de información de calidad para lenguas africanas de bajos recursos, donde los sistemas multilingües genéricos suelen rendir peor. La licencia Apache 2.0 y el formato safetensors facilitan su integración en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (`XLMRobertaForSequenceClassification`) con una única etiqueta de salida |
| Parámetros totales | 278.044.417 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 510 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | am, ha, om, sn, so, sw, yo, zu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre el transformer XLM-RoBERTa en configuración de clasificación de secuencias. A diferencia de un bi-encoder, procesa conjuntamente la consulta y el pasaje en una sola pasada y emite un logit escalar de relevancia, lo que permite capturar interacciones token a token entre ambos textos a costa de un mayor coste computacional por par evaluado.

El fine-tuning se realizó sobre el dataset AfriXIR (902.912 ejemplos según los metadatos del modelo) con la función de pérdida `BinaryCrossEntropyLoss`, partiendo del checkpoint `intfloat/multilingual-e5-base` en la revisión `d128750597153bb5987e10b1c3493a34e5a4502a`. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron etapas adicionales de alineación; tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Puntuación de relevancia consulta-pasaje para reordenamiento en pipelines de recuperación de información.
- Funcionamiento como cross-encoder de una sola etiqueta: devuelve un score continuo por par de textos.
- Cobertura de ocho lenguas africanas: amárico, hausa, oromo, shona, somalí, suajili, yoruba y zulú.
- Compatibilidad con la librería sentence-transformers mediante la clase `CrossEncoder`.
- Compatibilidad declarada con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints de Hugging Face.
- Soporte de prefijos de tarea estilo E5 (`query:` y `passage:`) en los pares de entrada, tal como se muestra en los ejemplos de la model card.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de ranking.

## Casos de uso

- Búsqueda web y motores de recuperación en lenguas africanas: se usa como segunda fase tras un retriever denso o BM25, reordenando los 50-100 candidatos iniciales con la puntuación del cross-encoder para mejorar la precisión en la parte alta del ranking.
- Atención al cliente en suajili, hausa o amárico: dado un conjunto de artículos de ayuda, el modelo puntúa cada fragmento frente a la consulta del usuario y permite devolver la respuesta documental más relevante sin generación.
- Sistemas de preguntas y respuestas sobre corpus documentales (RAG): actúa como reranker entre la recuperación y el modelo generador, reduciendo el contexto irrelevante que se envía al LLM y, con ello, el coste y las alucinaciones.
- Búsqueda jurídica o administrativa multilingüe: para corpus en somalí, oromo o zulú donde los modelos genéricos tienen poca cobertura, permite ordenar resoluciones o normativas por relevancia frente a una consulta.
- Evaluación y curación de datasets de recuperación: el score del cross-encoder sirve para filtrar pares consulta-documento de baja calidad en la construcción de corpus de entrenamiento.
- Despliegue en entornos con recursos limitados: con 278 millones de parámetros cabe en GPU de consumo y puede servirse con latencias bajas para volúmenes moderados de consultas, integrándose vía sentence-transformers o Text Embeddings Inference.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP32: en torno a 1,1 GB solo para pesos, más activaciones; aproximadamente 2-3 GB en total para lotes pequeños.
- VRAM estimada en FP16: alrededor de 0,6 GB para pesos; el modelo completo cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: para producción con throughput alto, A100 o H100; para desarrollo y volúmenes moderados, RTX 4090, RTX 3090 o incluso GPUs de gama media como RTX 3060.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con al menos 4 GB de VRAM en FP16; también puede ejecutarse en CPU con latencias mayores.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Text Embeddings Inference (declarado compatible por los tags), y exportación a ONNX u otros runtimes mediante herramientas estándar.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un cross-encoder, el coste escala linealmente con el número de pares a puntuar, por lo que conviene limitar el reranking a los candidatos top-k de la primera fase.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Tipo |
|---|---|---|---|---|---|
| AfriXIR E5 Base Reranker | 278 M | 510 tokens | 8 lenguas africanas | Apache 2.0 | Cross-encoder |
| intfloat/multilingual-e5-base (modelo base) | 278 M | 512 tokens | ~100 lenguas | MIT | Bi-encoder (embeddings) |
| BAAI/bge-reranker-base | ~278 M | 512 tokens | multilingüe (principalmente en/zh) | MIT | Cross-encoder |
| jinaai/jina-reranker-v2-base-multilingual | ~278 M | 1024 tokens | multilingüe (~100 lenguas) | CC BY-NC 4.0 | Cross-encoder |

La comparativa se limita a arquitecturas y licencias documentadas de forma pública; no se dispone de métricas de rendimiento comparadas en la información proporcionada. La ventaja diferencial de AfriXIR es su especialización en lenguas africanas frente a rerankers multilingües genéricos, a cambio de una cobertura idiomática mucho más reducida.

## Limitaciones y advertencias

- Cobertura idiomática restringida a ocho lenguas; el rendimiento fuera de ellas no está garantizado y probablemente degrade respecto al modelo base.
- Ventana de 510 tokens: los pasajes más largos deben truncarse, lo que puede perder información relevante.
- Es un modelo de ranking, no generativo: no produce respuestas ni texto, solo puntuaciones de relevancia.
- Riesgo de sesgo heredado del corpus de entrenamiento AfriXIR y del modelo base multilingüe; no se documentan análisis de sesgo específicos.
- No se han publicado benchmarks ni métricas de evaluación en la model card, por lo que su calidad relativa frente a alternativas no está verificada de forma independiente.
- El modelo tiene un número muy bajo de descargas y likes, lo que sugiere escasa validación por parte de la comunidad; conviene evaluarlo en el dominio objetivo antes de producción.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero debe conservarse el aviso de licencia y atribución.
- Al ser un cross-encoder, el coste de inferencia crece con el número de candidatos; un uso indiscriminado sobre rankings largos puede encarecer el pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebhailema/afrixir-e5-base-reranker
- Dataset AfriXIR: https://huggingface.co/datasets/nebhailema/AfriXIR
- Modelo base intfloat/multilingual-e5-base: https://huggingface.co/intfloat/multilingual-e5-base
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Cross Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia (Sentence-BERT, arXiv:1908.10084): https://arxiv.org/abs/1908.10084
