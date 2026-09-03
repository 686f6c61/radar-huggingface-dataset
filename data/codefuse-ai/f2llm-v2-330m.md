# codefuse-ai/F2LLM-v2-330M

## Resumen

F2LLM-v2-330M es un modelo de embeddings multilingüe de propósito general desarrollado por el equipo CodeFuse de Alibaba. Forma parte de la familia F2LLM-v2, que incluye ocho tamaños desde 80M hasta 14B parámetros, todos liberados de forma completamente abierta (código, datos, pesos y checkpoints intermedios). Este modelo concreto, de 330 millones de parámetros, es uno de los tres modelos instruct más pequeños de la familia, obtenido mediante poda y fine-tuning a partir del modelo base de 0.6B.

El modelo está diseñado para tareas de extracción de características (feature extraction) y recuperación de información, con soporte para más de 200 idiomas, con especial atención a lenguas de bajos y medios recursos tradicionalmente desatendidas. Su arquitectura se basa en Qwen3, según los tags del repositorio, y se entrena sobre un conjunto curado de 60 millones de muestras públicas de alta calidad. Su relevancia actual radica en ofrecer un modelo de embeddings pequeño, eficiente y multilingüe, con licencia Apache 2.0, ideal para entornos con recursos limitados o despliegues en producción que requieran búsqueda semántica en múltiples idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en Qwen3 (según tags del repositorio) |
| Parametros totales | 334.349.184 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se recomienda bfloat16 nativo) |
| Idiomas soportados | Más de 200, incluyendo en, zh, ru, es, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, my, hy, km, ne, hu, eu, he, lo, sw, az, lv, si, sk, tg, et, lt, ms, hr, is, sl, sr, ur, bn, af, ta, ka, te, ml, mn, nn, kk, cy, mr, sq, nb, mk, jv, kn, eo, la, gu, uz, am, oc, be, mg, vo, pa, lb, ht, br, ga, xh, tt, bs, yo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

F2LLM-v2-330M es un modelo encoder transformer, derivado de la arquitectura Qwen3, adaptado para producir embeddings de texto de dimensión 896. El proceso de creación consistió en podar el modelo base F2LLM-v2-0.6B-Preview hasta reducirlo a 330M parámetros, seguido de un fine-tuning específico para tareas de instrucción (instruct). El entrenamiento se realizó sobre un conjunto de datos compuesto por 60 millones de muestras públicas curadas, con un enfoque particular en idiomas de bajos y medios recursos. No se han publicado detalles sobre técnicas como RLHF o DPO; el modelo se presenta como un encoder de embeddings con capacidad de seguir instrucciones de consulta mediante un prompt específico.

## Capacidades

- Generación de embeddings densos de 896 dimensiones para texto, optimizados para búsqueda semántica y recuperación de información.
- Soporte multilingüe extenso: más de 200 idiomas, con énfasis en lenguas de bajos recursos (p. ej., sw, yo, xh, tt, bs, etc.).
- Capacidad de seguir instrucciones de consulta mediante un prompt predefinido (p. ej., "Instruct: Given a question, retrieve passages that can help answer the question.\nQuery: ").
- Integración nativa con Sentence Transformers y Transformers, así como con el servidor de inferencia text-embeddings-inference (TEI).
- No es un modelo generativo: no admite generación de texto, tool calling, agentes ni razonamiento multi-paso. Su función es exclusivamente la extracción de características.

## Casos de uso

- Búsqueda semántica multilingüe: el modelo puede indexar documentos en decenas de idiomas y recuperar los más relevantes para una consulta en cualquier idioma soportado, gracias a su entrenamiento multilingüe y su prompt de instrucción.
- Recuperación de información en bases de conocimiento: permite construir sistemas de pregunta-respuesta sobre corpus técnicos o científicos, utilizando los embeddings para ranking por similitud coseno.
- Clasificación de texto: los embeddings generados pueden alimentar clasificadores supervisados (regresión logística, SVM, etc.) para tareas como análisis de sentimiento o categorización de documentos en entornos multilingües.
- Deduplicación y agrupación de documentos: al calcular similitudes entre embeddings, se pueden detectar duplicados o agrupar documentos por tema en grandes colecciones multilingües.
- Sistemas de recomendación basados en contenido: los embeddings de ítems (artículos, productos, noticias) permiten recomendar elementos similares según su representación semántica.
- Búsqueda en entornos con recursos limitados: al ser un modelo de solo 330M parámetros, puede desplegarse en CPU o GPUs de gama baja, lo que lo hace adecuado para aplicaciones edge o servidores sin aceleración dedicada.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que la familia F2LLM-v2 establece un nuevo estado del arte en varios benchmarks MTEB (Code, Europeo, Escandinavo, Alemán, Francés, Español, Polaco, Neerlandés, Japonés, Vietnamita, Tailandés, Índico, Persa, entre otros), pero no se proporcionan cifras concretas para este modelo específico. Se recomienda consultar el leaderboard de MTEB para datos actualizados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bfloat16 (334M parámetros × 2 bytes), más overhead de activaciones y tokenización, lo que supone un uso total de entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso integradas con suficiente memoria compartida. También puede ejecutarse en CPU con razonable velocidad para lotes pequeños.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: Sentence Transformers, Transformers, text-embeddings-inference (TEI), y compatible con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado su tamaño reducido, se espera una latencia de pocos milisegundos por lote en GPU y throughput alto en CPU con batching.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de embeddings de tamaño similar (p. ej., BGE-small, E5-small, GTE-small). La model card menciona superioridad en varios benchmarks MTEB, pero sin cifras. Se recomienda evaluar el modelo en el conjunto de datos objetivo antes de elegirlo frente a alternativas.

## Limitaciones y advertencias

- Al ser un modelo de solo 330M parámetros, su rendimiento en tareas complejas de razonamiento o dominios muy especializados puede ser inferior al de modelos más grandes de la misma familia (p. ej., 1.7B, 4B, 8B).
- No se han documentado sesgos específicos, pero al entrenarse con datos públicos, puede heredar sesgos presentes en dichos datos, especialmente en idiomas de bajos recursos donde la representación es menor.
- Riesgo de alucinación: no aplica, ya que no genera texto, solo produce embeddings.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente la autoría.
- El tamaño del repositorio (34,1 GB) sugiere que incluye checkpoints intermedios o datos adicionales; para uso en producción, basta con descargar los pesos safetensors del modelo final.

## Enlaces

- [HuggingFace: codefuse-ai/F2LLM-v2-330M](https://huggingface.co/codefuse-ai/F2LLM-v2-330M)
- [Paper (arXiv:2603.19223)](https://arxiv.org/abs/2603.19223)
- [Dataset de entrenamiento: codefuse-ai/F2LLM-v2](https://huggingface.co/datasets/codefuse-ai/F2LLM-v2)
- [Modelo base: codefuse-ai/F2LLM-v2-0.6B-Preview-Pruned-330M](https://huggingface.co/codefuse-ai/F2LLM-v2-0.6B-Preview-Pruned-330M)
- [Leaderboard MTEB](https://huggingface.co/spaces/mteb/leaderboard)
