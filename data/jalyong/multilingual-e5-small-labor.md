# Jalyong/multilingual-e5-small-labor

## Resumen

Jalyong/multilingual-e5-small-labor es un modelo de embeddings de frases (sentence-transformers) especializado en la recuperación de artículos legales laborales en coreano. Lo desarrolla el usuario independiente Jalyong mediante fine-tuning del modelo base intfloat/multilingual-e5-small, un transformer BERT de 117,6 millones de parámetros que genera representaciones densas de 384 dimensiones. El modelo resuelve un problema concreto: dado un enunciado coloquial de un trabajador (por ejemplo, una duda sobre permisos o salarios), recuperar el artículo de la ley laboral coreana que responde a esa consulta.

La relevancia del modelo reside en su especialización de dominio. Frente al modelo base multilingüe genérico, este ajuste se ha entrenado con pares de consulta y pasaje extraídos de normativa laboral, lo que mejora la precisión en la primera posición (Accuracy@1 del 65,9 % y Recall@5 del 90,2 % sobre el conjunto de evaluación declarado por el autor). El contexto de entrada está limitado a 512 tokens, incluyendo prefijos y tokens especiales, y los vectores resultantes son de 384 dimensiones.

Se trata de un modelo pequeño (0,5 GB de repositorio, pesos en safetensors) pensado para desplegarse como servicio de recuperación en pipelines RAG o motores de búsqueda semántica sobre corpus legales. La licencia MIT permite uso comercial sin restricciones significativas. No obstante, el conjunto de entrenamiento es reducido (663 ejemplos) y la evaluación se ha realizado únicamente sobre el dominio laboral coreano, por lo que su generalización a otros dominios o idiomas no está validada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), modelo de embeddings de frases |
| Parámetros totales | 117.653.760 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo prefijos y tokens especiales) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko); el modelo base es multilingüe, pero el ajuste se ha realizado solo en coreano |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión del embedding | 384 |
| Función de pérdida | MultipleNegativesRankingLoss |
| Tamaño del conjunto de entrenamiento | 663 pares |
| Modelo base | intfloat/multilingual-e5-small |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia BERT con 117,6 millones de parámetros, heredado de intfloat/multilingual-e5-small. La arquitectura sigue el esquema estándar de los modelos E5: cada entrada se prefija con `query:` (para consultas) o `passage:` (para documentos), y la salida se normaliza para obtener un vector de 384 dimensiones que se compara mediante similitud coseno. El ajuste se ha realizado con la librería sentence-transformers y la pérdida MultipleNegativesRankingLoss, una función de contrastive learning que trata los negativos del propio lote como ejemplos negativos en la clasificación.

El conjunto de entrenamiento, Jalyong/labor-embedding-data, contiene 663 pares de consulta y pasaje sobre normativa laboral coreana. El autor indica que el corpus general del mismo repositorio de datos se reservó únicamente para comprobar la degradación en otros dominios y no se utilizó en el entrenamiento de los pesos. No se documenta el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas adicionales de ajuste (RLHF, DPO u otras). No se declaran innovaciones arquitectónicas propias: el valor del modelo está en la especialización del dominio mediante fine-tuning supervisado.

## Capacidades

- Generación de embeddings densos de frases para búsqueda semántica y recuperación de información.
- Recuperación de artículos legales laborales coreanos a partir de consultas en lenguaje natural y coloquial.
- Similitud semántica entre consultas y pasajes mediante similitud coseno sobre vectores normalizados.
- Extracción de características (feature-extraction) para tareas posteriores de clasificación o clustering.
- Compatibilidad con text-embeddings-inference y con endpoints compatibles, según las etiquetas del repositorio.
- Soporte de prefijos `query:` y `passage:` para separar el espacio de consultas y el de documentos.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por sí mismo.

## Casos de uso

- Motor de búsqueda semántica sobre textos legales laborales: indexar los artículos como pasajes con prefijo `passage:` y consultar con `query:` para devolver los fragmentos más relevantes; el modelo está ajustado específicamente para este emparejamiento.
- Asistente RAG para trabajadores: recuperar el artículo aplicable a una duda en lenguaje natural (permisos, salarios, jornada) y pasarlo como contexto a un LLM generativo que redacte la respuesta.
- Clasificación y enrutamiento de consultas laborales: usar los embeddings para agrupar o etiquetar consultas entrantes en un servicio de atención al ciudadano o a empleados.
- Deduplicación y clustering de normativa: calcular similitudes entre artículos para detectar duplicados o agrupar disposiciones relacionadas dentro de un corpus legal.
- Búsqueda interna en portales de recursos humanos: indexar políticas internas o convenios y ofrecer búsqueda semántica a los empleados, con la ventaja de que el modelo cabe en cualquier servidor modesto.
- Evaluación de sistemas de recuperación: servir como componente de referencia en experimentos de RAG legal, ya que su tamaño reducido permite iterar y desplegar réplicas con bajo coste.
- Filtrado previo en pipelines de compliance: recuperar los artículos candidatos antes de una revisión humana, reduciendo el volumen de documentos a examinar.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluación "labor" (tarea de recuperación de información, métricas de similitud coseno). No están verificados de forma independiente.

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6589 |
| Cosine Accuracy@3 | 0,8551 |
| Cosine Accuracy@5 | 0,9019 |
| Cosine Accuracy@10 | 0,9393 |
| Cosine Precision@1 | 0,6589 |
| Cosine Precision@5 | 0,1804 |
| Cosine Recall@1 | 0,6589 |
| Cosine Recall@5 | 0,9019 |
| Cosine NDCG@10 | 0,8047 |
| Cosine MRR@10 | 0,7607 |
| Cosine MAP@100 | 0,7625 |

No se han publicado comparaciones con el modelo base ni con otras alternativas en la información disponible. La Precision@5 baja (0,18) es coherente con un corpus de pasajes cortos y muchos candidatos por consulta; conviene interpretarla junto al Recall@5 y al NDCG@10.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB para pesos y activaciones; en fp16 o int8, por debajo de 0,3 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090), así como en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes; para uso interactivo, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: sentence-transformers (referencia), text-embeddings-inference (etiqueta oficial del repositorio), integración en vLLM o TGI no está documentada para este modelo concreto; llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un coste por lote bajo en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Especialización |
|---|---|---|---|---|---|
| Jalyong/multilingual-e5-small-labor | 117,6 M | 512 tokens | 384 | MIT | Recuperación legal laboral en coreano |
| intfloat/multilingual-e5-small (base) | 117,6 M | 512 tokens | 384 | MIT | Multilingüe general |
| intfloat/multilingual-e5-base | no disponible | 512 tokens | 768 | MIT | Multilingüe general |

La comparación cuantitativa con el modelo base y con alternativas no está disponible en la información proporcionada: el autor no publica métricas del base sobre el mismo conjunto de evaluación. La ventaja esperada del ajuste es la mejora en el dominio laboral coreano; la contrapartida es el posible retroceso en otros dominios, que el autor reconoce al reservar un corpus general para comprobarlo, aunque no publica esos resultados.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (663 pares), lo que limita la cobertura de casuísticas y aumenta el riesgo de sobreajuste al estilo de las consultas de entrenamiento.
- La evaluación se ha realizado únicamente sobre el dominio laboral coreano; el rendimiento en otros dominios, en otros idiomas o con artículos nuevos no está validado y debe evaluarse por separado.
- El autor advierte explícitamente de que una similitud alta no garantiza que el documento sea la respuesta legal correcta y de que el modelo no sirve como asesoramiento jurídico.
- Riesgo de alucinación indirecta: al integrarse en un pipeline RAG, un pasaje recuperado incorrectamente puede inducir respuestas erróneas en el modelo generativo posterior.
- Contexto máximo de 512 tokens: los artículos o pasajes más largos deben truncarse o dividirse, lo que puede perder información relevante.
- Idiomas: aunque el modelo base es multilingüe, el ajuste se ha hecho solo en coreano; el uso en castellano no está respaldado por el autor.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar las condiciones del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jalyong/multilingual-e5-small-labor
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/Jalyong/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
