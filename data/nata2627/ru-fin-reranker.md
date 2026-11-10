# nata2627/ru-fin-reranker

## Resumen

`ru-fin-reranker` es un cross-encoder de reordenación (reranking) para recuperación de información en ruso, especializado en normativa del Banco de Rusia. Lo desarrolla la usuaria de Hugging Face `nata2627` como parte del proyecto `ru-fin-rag`, y parte del modelo `BAAI/bge-reranker-v2-m3`, sobre el que se aplica un ajuste fino completo. Su función es reordenar los 50 mejores candidatos devueltos por un recuperador híbrido (BM25 más un codificador denso bge-m3 fusionados por RRF) para mejorar la precisión de los resultados en la primera posición.

El modelo tiene 567.755.777 parámetros y se distribuye en formato safetensors con pesos en fp16, con una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. Está entrenado exclusivamente con preguntas reales en ruso sobre la sección de explicaciones de cbr.ru, y su ámbito de aplicación está declarado de forma explícita: normativa del Banco de Rusia en ruso, sin mediciones fuera de ese dominio.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de dominio muy concreto con una evaluación rigurosa sobre 674 preguntas reales. Por otro, el propio autor declara que el modelo **no superó la regla de aceptación fijada antes del entrenamiento**: la mejora de +0.0127 NDCG@10 queda por debajo del umbral de +0.025 exigido, por lo que el servicio del proyecto mantiene el modelo base en producción. Los pesos se publican con esa cifra y con el informe completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer XLM-RoBERTa (fine-tune de `BAAI/bge-reranker-v2-m3`) |
| Parametros totales | 567.755.777 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (longitud de truncado usada en entrenamiento e inferencia) |
| Tipos de cuantizacion | No disponible (el repo publica pesos safetensors en fp16; no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2.3 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe un par (consulta, fragmento) y produce un logit de relevancia, de modo que la puntuación se calcula conjuntamente para ambos textos en lugar de comparar embeddings independientes. Se obtiene por ajuste fino completo de `BAAI/bge-reranker-v2-m3`, que a su vez se apoya en la familia XLM-RoBERTa. La entrada se trunca a 512 tokens y la inferencia se realiza con autocast en fp16.

El entrenamiento usa 123 preguntas reales de la sección de explicaciones de cbr.ru, excluidas de los conjuntos de desarrollo y test, con positivos, ceros etiquetados procedentes del top 50 del recuperador híbrido y fragmentos aleatorios de otras actas. Se excluyeron 4.458 fragmentos que fueran positivos de cualquier pregunta de test, desarrollo o benchmark anterior. La función de pérdida es entropía cruzada softmax sobre grupos de un positivo, hasta cinco negativos etiquetados y dos aleatorios. Se ejecutó un epoch con LR 2e-5 dentro de un schedule de diez epochs con 10% de warmup, sobre una única GPU T4. El checkpoint se eligió por desarrollo (224 preguntas): 0.7088 frente a 0.6964 del modelo base, cifra que el autor advierte como optimista por haber sido usada para la selección. Dos estrategias empeoraron el resultado: añadir 2.882 preguntas sintéticas generadas por un modelo de lenguaje hizo que todos los checkpoints quedaran por debajo del base en desarrollo, y más epochs sobre preguntas reales provocaron sobreajuste a partir del segundo o cuarto epoch (0.6607 en el epoch diez).

## Capacidades

- Reordenación de pares consulta-fragmento en ruso mediante puntuaciones logit; mayor valor indica mayor relevancia.
- Recuperación de información especializada en normativa del Banco de Rusia y textos legales y financieros en ruso.
- Integración en pipelines de RAG como segunda etapa tras un recuperador híbrido (BM25 + denso con fusión RRF).
- Clasificación de texto (`text-classification`) con `AutoModelForSequenceClassification` de transformers.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, según las etiquetas del repo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un cross-encoder de relevancia, no un modelo generativo.
- Multilingüismo: únicamente ruso; no se documenta capacidad en otros idiomas.

## Casos de uso

- Búsqueda normativa interna en entidades financieras: reordenar los fragmentos recuperados de la normativa del Banco de Rusia para que el fragmento correcto aparezca en la primera posición, mejorando la precisión de la primera respuesta que ve el analista.
- Asistente de cumplimiento normativo (compliance): integrar el reranker en un RAG que responda consultas de empleados sobre requisitos regulatorios, usando las cláusulas del acta como unidad de acierto, tal como se evalúa el modelo.
- Soporte a auditoría y revisión documental: dado un conjunto de actas y una consulta concreta, priorizar los pasajes relevantes antes de la revisión humana, reduciendo el número de fragmentos que el revisor debe leer.
- Enriquecimiento de un buscador corporativo sobre documentación legal: aplicar el modelo como etapa de reordenación sobre el top 50 de un recuperador híbrido ya existente, sin cambiar la infraestructura de indexación.
- Generación aumentada con recuperación en ruso para atención al cliente bancaria: usar el reranker para seleccionar el contexto normativo que se pasa al modelo generativo, con el objetivo de reducir respuestas basadas en pasajes irrelevantes.
- Evaluación comparativa de pipelines de recuperación: servir como referencia de dominio para medir si un recuperador alternativo mejora o no sobre el estado base en preguntas reales de normativa rusa.
- Filtrado previo en procesos de extracción de obligaciones regulatorias: ordenar fragmentos candidatos antes de un paso de extracción estructurada, de modo que solo los mejores pasajes lleguen al extractor.

## Benchmarks y rendimiento

Evaluación sobre 674 preguntas reales (test en vivo), con NDCG@10 contado por cláusulas del acta. El modelo base en el mismo pipeline es la referencia.

| Test | Preguntas | Reranker base | Este modelo | Diferencia |
|---|---|---|---|---|
| Todas | 674 | 0.6664 | 0.6791 | +0.0127 [+0.0054; +0.0200], p 0.0012 |
| Sin preguntas filtradas | 672 | 0.6662 | 0.6784 | +0.0122 [+0.0048; +0.0197] |

Para contextualizar la escala, en el mismo test BM25 obtiene 0.4992 y el pipeline híbrido sin reordenación 0.5305. La mejora es estadísticamente significativa pero inferior al umbral de aceptación de +0.025 fijado antes del entrenamiento, que el autor sitúa un escalón por encima de la resolución del test. En desarrollo (224 preguntas) el checkpoint elegido obtiene 0.7088 frente a 0.6964 del base, cifra marcada como optimista por la selección de checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB solo para pesos; con activaciones y overhead de runtime, entre 2 y 3 GB para lotes pequeños.
- VRAM estimada en fp32: aproximadamente 2,3 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequeños; A100, H100 o L4 para alto throughput por lotes.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también en GPUs de 4 GB con lotes reducidos.
- El entrenamiento se realizó en una única T4, lo que confirma que el ajuste fino es viable en hardware modesto.
- Opciones de despliegue: transformers (uso documentado en la model card), text-embeddings-inference y endpoints compatibles según las etiquetas del repo; vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| `nata2627/ru-fin-reranker` | 567,8 M | 512 tokens | Ruso | Apache 2.0 | NDCG@10 0.6791 en test de 674 preguntas de normativa del Banco de Rusia |
| `BAAI/bge-reranker-v2-m3` (base) | No disponible en la información | No disponible en la información | Multilingüe | No disponible en la información | NDCG@10 0.6664 en el mismo test; referencia del pipeline |
| BM25 (recuperador léxico) | No aplica | No aplica | Dependiente del corpus | No aplica | NDCG@10 0.4992 en el mismo test |
| Híbrido BM25 + bge-m3 con RRF, sin reranker | No aplica | No aplica | Dependiente del corpus | No aplica | NDCG@10 0.5305 en el mismo test |

No se dispone de datos de otros rerankers especializados en ruso financiero en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- El modelo no superó la regla de aceptación fijada antes del entrenamiento (+0.025 NDCG@10); la mejora real es de +0.0127 y el servicio del proyecto mantiene el modelo base en producción.
- Las etiquetas de relevancia del test las generó un modelo de lenguaje con una única instrucción. El autor etiquetó 200 pares a ciegas y obtuvo concordancia en 182 de 200, con kappa de Cohen 0.782 [0.678; 0.867]; el etiquetador automático añade positivos que el humano no ve (13 casos) más a menudo de lo que los omite (3), por lo que los valores absolutos de NDCG están inflados, sesgo que comparten ambos pipelines.
- El corpus contiene las actas tal como se publicaron en el Vestnik Banka Rossii, no su redacción vigente; el modelo puede priorizar normativa derogada o modificada.
- Solo 123 preguntas de entrenamiento; la curva de aprendizaje (30, 60 y 123 preguntas) muestra que la ganancia aparece solo con 123, y tres puntos no permiten distinguir su forma del ruido.
- Dominio estrictamente limitado a normativa del Banco de Rusia en ruso; no se ha medido nada fuera de ese ámbito.
- Idioma único: ruso. No hay evidencia de funcionamiento en otros idiomas.
- Contexto de 512 tokens: los fragmentos más largos se truncan, lo que puede perder información relevante en actas extensas.
- Riesgo de alucinación no aplica en sentido generativo (no produce texto), pero sí de falsos positivos en la puntuación de relevancia.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el rendimiento en producción fuera del dominio evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nata2627/ru-fin-reranker
- Repositorio del proyecto e informe completo: https://github.com/nata2627/ru-fin-rag/tree/main/retrieval
- Informe técnico (en ruso): `docs/19-pereranzhirovshchik.md` dentro del repositorio anterior
- Test en vivo, etiquetas y partición: `data/queries/live12.jsonl`, `data/queries/qrels_live12_punkt.tsv`, `data/queries/podvyborki_live12.json` en el mismo repositorio
- Copia en ruso de la model card: `docs/MODEL_CARD.md`
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Dataset de recuperación: https://huggingface.co/datasets/nata2627/ru-fin-retrieval
