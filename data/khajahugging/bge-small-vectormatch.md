# KhajaHugging/bge-small-vectormatch

## Resumen

bge-small-vectormatch es un modelo de embeddings de frases derivado de BAAI/bge-small-en-v1.5, afinado por el desarrollador independiente KhajaHugging para una tarea concreta: emparejar currículums (CV) con ofertas de empleo. Mantiene la arquitectura BERT de 33,36 millones de parámetros y la dimensión de embedding de 384 del modelo base, por lo que funciona como sustituto directo en cualquier base de datos vectorial sin cambios en la infraestructura de recuperación.

El modelo se entrena sobre 8.702 tripletas (CV, oferta relevante, oferta negativa dura) extraídas del conjunto de datos Djinni (ofertas y perfiles de candidatos en inglés, licencia MIT), con pérdida InfoNCE y enmascaramiento de falsos negativos por categoría. El resultado declarado por el autor es una mejora del 17 % en precisión@10 frente al modelo base, manteniendo el mismo tamaño, latencia y vectores de 384 dimensiones.

Es relevante para equipos que construyen motores de búsqueda de empleo o sistemas de recomendación de candidatos y quieren una mejora específica de dominio sin asumir el coste de un modelo de embeddings mayor. Forma parte del proyecto VectorMatch, un motor híbrido de emparejamiento semántico comparado en seis bases de datos vectoriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), fine-tuning de BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el entrenamiento usa un máximo de 256 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización estándar de sentence-transformers, no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT pequeño (33,36 M de parámetros) heredado de bge-small-en-v1.5, que produce embeddings de 384 dimensiones L2-normalizados. La innovación no está en la arquitectura, sino en el procedimiento de ajuste: se construyen 8.702 tripletas a partir del conjunto Djinni, cada una con un CV, una oferta de la misma categoría y un negativo duro (la oferta con mayor puntuación BM25 de una categoría distinta, es decir, léxicamente parecida pero de rol incorrecto). El autor afirma que los CV y las ofertas de entrenamiento son disjuntos de los usados en evaluación y del corpus de búsqueda.

El entrenamiento usa pérdida InfoNCE con temperatura τ = 0,05 sobre negativos en lote y negativos duros, con enmascaramiento de falsos negativos por categoría: otras ofertas en lote de la misma categoría que el CV se enmascaran en lugar de empujarse como negativas. Se realiza una época con batch 32, AdamW con lr 2e-5, calentamiento y decaimiento lineal, máximo de 256 tokens, gradient checkpointing y ejecución en CPU. El checkpoint se selecciona únicamente sobre la mitad de desarrollo de los CV de evaluación (P@10 de desarrollo pasa de 0,565 a 0,689). El código de construcción del conjunto, ajuste fino y evaluación está publicado en el repositorio VectorMatch.

## Capacidades

- Generación de embeddings de frases y documentos para recuperación semántica densa (feature-extraction, sentence-similarity).
- Emparejamiento CV-oferta de empleo en inglés, con instrucción de consulta específica de bge ("Represent this sentence for searching relevant passages: ") para CV y sin prefijo para ofertas.
- Recuperación de información (information-retrieval) sobre corpus de hasta decenas de miles de documentos, según la evaluación realizada con 25.000 ofertas.
- Búsqueda híbrida combinable con BM25 mediante fusión RRF ponderada, según los resultados del autor.
- Vectores L2-normalizados, aptos para producto interno o similitud coseno en bases de datos vectoriales.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es exclusivamente un modelo de embeddings.
- Multilingüismo limitado al inglés; no se declaran capacidades en otros idiomas.

## Casos de uso

- Búsqueda de ofertas para candidatos: dado el texto de un CV, generar su embedding con la instrucción de consulta y recuperar las ofertas más próximas en una base vectorial; el modelo está ajustado exactamente para esta dirección CV → oferta.
- Recomendación inversa de candidatos a una oferta: indexar CV con el mismo encoder y consultar con el texto de la vacante, aprovechando que las representaciones comparten espacio semántico.
- Sustitución directa en pipelines existentes de bge-small: al conservar 384 dimensiones y el mismo tokenizador, se puede reemplazar el modelo base sin reindexar la arquitectura ni cambiar la latencia.
- Motor de búsqueda híbrido en producción: combinar la recuperación densa con BM25 y fusión RRF; el autor reporta P@10 de 0,667 y MRR de 0,755 en modo híbrido frente a 0,664 y 0,740 en denso puro.
- Filtrado previo en portales de empleo: reducir un corpus de decenas de miles de ofertas a un top-10 o top-50 antes de una revisión manual o de un reordenamiento con un modelo mayor.
- Deduplicación y agrupación de ofertas o CV similares mediante similitud coseno sobre los embeddings generados.
- Despliegue ligero en CPU: el entrenamiento se ejecutó en CPU y el modelo ocupa 0,1 GB, lo que permite servir la extracción de embeddings en entornos sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre conjunto de prueba retenido: 25.000 ofertas reales y 500 CV reales no vistos en entrenamiento ni en selección de modelo. Una oferta se considera relevante si su categoría de rol coincide con la del CV (etiquetas del conjunto de datos, no generadas por un LLM). Los valores de la model-index no están verificados de forma independiente.

| Modelo | Recuperación | P@10 | nDCG@10 | MRR | Hit@1 |
|---|---|---:|---:|---:|---:|
| BM25 | por palabras clave | 0,436 | 0,439 | 0,575 | 0,444 |
| bge-small-en-v1.5 (base) | densa | 0,566 | 0,570 | 0,695 | 0,598 |
| bge-small-vectormatch | densa | 0,664 | 0,661 | 0,740 | 0,642 |
| bge-small-vectormatch | híbrida (+ BM25, RRF ponderada) | 0,667 | 0,667 | 0,755 | 0,666 |

La mejora declarada es de +17 % en P@10 respecto al modelo base, con el mismo tamaño, latencia y vectores de 384 dimensiones.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (33,36 M de parámetros); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el modelo es viable en GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin problema de capacidad.
- Cabe holgadamente en GPU de consumo y también se ejecuta en CPU, como demuestra el propio entrenamiento del autor.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (el modelo declara compatibilidad con endpoints), y exportación a ONNX o cuantización para llama.cpp/Ollama no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo afirma que la latencia es la misma que la del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | P@10 (CV → oferta) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bge-small-vectormatch | 33,36 M | máx. 256 tokens en entrenamiento | 0,664 | MIT | Hugging Face |
| bge-small-en-v1.5 (base) | 33,36 M | no disponible | 0,566 | MIT | Hugging Face |
| BM25 (referencia léxica) | no aplica | no aplica | 0,436 | no aplica | implementación propia |

No se dispone de datos comparativos con otros modelos de embeddings de tamaño similar (por ejemplo, variantes de E5 o GTE small) en esta tarea concreta, por lo que la comparación se limita a los tres sistemas evaluados por el autor.

## Limitaciones y advertencias

- Entrenado con un único portal de empleo centrado en IT (Djinni, roles tecnológicos mayoritariamente de Europa del Este y textos en inglés); se espera una transferencia más débil a otros dominios y sectores.
- La relevancia se aproxima mediante la coincidencia de categoría de rol, y las etiquetas de categoría son gruesas (por ejemplo, Python frente a Data Science); la precisión medida es conservadora.
- El modelo refleja patrones, incluidos sesgos, de las ofertas históricas; el autor advierte explícitamente de que no debe usarse como única base para decisiones de contratación.
- Solo admite inglés; no hay soporte declarado para otros idiomas.
- Es un modelo de embeddings, no generativo: no produce texto, no razona, no ejecuta herramientas ni mantiene conversaciones.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Licencia MIT, que permite uso comercial sin restricciones adicionales más allá de la atribución habitual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KhajaHugging/bge-small-vectormatch
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio VectorMatch: https://github.com/KhajaRaheelAhmedMohiuddin/vectormatch
- Script de construcción del conjunto de entrenamiento: https://github.com/KhajaRaheelAhmedMohiuddin/vectormatch/blob/main/scripts/build_training_set.py
- Script de ajuste fino del embedder: https://github.com/KhajaRaheelAhmedMohiuddin/vectormatch/blob/main/scripts/finetune_embedder.py
- Script de evaluación de calidad: https://github.com/KhajaRaheelAhmedMohiuddin/vectormatch/blob/main/scripts/eval_quality.py
- Conjunto de ofertas de empleo: https://huggingface.co/datasets/lang-uk/recruitment-dataset-job-descriptions-english
- Conjunto de perfiles de candidatos: https://huggingface.co/datasets/lang-uk/recruitment-dataset-candidate-profiles-english
