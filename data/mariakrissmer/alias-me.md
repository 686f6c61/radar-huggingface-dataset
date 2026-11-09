# mariakrissmer/ALIAS-ME

## Resumen

ALIAS-ME es un modelo de embeddings de frases (SentenceTransformer) basado en una arquitectura BERT, desarrollado por Maria Krissmer y publicado bajo la etiqueta "ME" en el manuscrito del proyecto ALIAS. Su propósito es proyectar descripciones de células y texto biomédico en un espacio vectorial compartido, de modo que términos equivalentes o relacionados (por ejemplo, "CD8 T cell" y "cytotoxic T lymphocyte") queden próximos en el espacio de representación. Con 109,48 millones de parámetros, es un encoder compacto orientado a similitud semántica en el dominio de la biología y la citometría de célula única.

El modelo parte de `NeuML/pubmedbert-base-embeddings`, un BERT base especializado en literatura biomédica, y se ajusta finamente mediante entrenamiento ALIAS para alinear descripciones celulares con texto biomédico general. Esto lo hace relevante para tareas de recuperación semántica, deduplicación de anotaciones celulares y búsqueda de términos equivalentes en bases de datos biológicas, donde la variabilidad terminológica es alta.

Se distribuye con licencia MIT, pesos en safetensors y compatibilidad con la librería `sentence-transformers` y con Text Embeddings Inference. Es un modelo de investigación exploratoria, no validado para uso clínico, y su adopción es aún incipiente (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), fine-tuned como SentenceTransformer |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT con 109,48 millones de parámetros, inicializado desde `NeuML/pubmedbert-base-embeddings` y fine-tuneado con el procedimiento ALIAS para producir embeddings de frases. La arquitectura sigue el esquema estándar de SentenceTransformer: el encoder genera representaciones por token y se aplica un pooling para obtener un vector de frase que puede compararse mediante similitud coseno. El identificador interno de entrenamiento es `MM_HIAI_Tcells_S2_N4_200k_lr5e5`, lo que sugiere un ajuste sobre datos de células T con 200.000 pasos o ejemplos y una tasa de aprendizaje de 5e-5, aunque la model card no detalla la composición exacta del dataset ni el número de tokens de entrenamiento.

No se documenta en la información disponible si hubo RLHF, DPO u otras técnicas de alineación, ni innovaciones como decodificación especulativa o atención lineal (no aplicables a un encoder de embeddings). La procedencia de código y datos se remite a la rama `manuscript-reproducibility` del repositorio de GitHub del proyecto ALIAS. El hash SHA-256 del archivo `model.safetensors` está publicado para verificación de integridad.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Codificación conjunta de descripciones celulares y texto biomédico en un espacio compartido.
- Búsqueda semántica de términos equivalentes o relacionados en dominios de biología y célula única.
- Agrupamiento (clustering) y deduplicación de anotaciones celulares.
- Compatibilidad con la API de `sentence-transformers` (`model.encode([...])`).
- Compatible con Text Embeddings Inference y endpoints compatibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un encoder, no un modelo generativo).
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Normalización de anotaciones celulares: dado un conjunto de etiquetas heterogéneas procedentes de distintos estudios de scRNA-seq, el modelo genera embeddings que permiten agrupar sinónimos ("CD8 T cell", "cytotoxic T lymphocyte") y reducir la variabilidad terminológica antes del análisis.
- Búsqueda semántica en bases de datos biomédicas: indexar descripciones de tipos celulares y recuperar las entradas más próximas a una consulta en lenguaje natural, usando similitud coseno sobre los embeddings.
- Deduplicación de ontologías y catálogos celulares: comparar pares de términos de ontologías (Cell Ontology, etc.) para detectar duplicados o equivalencias mediante umbrales de similitud.
- Enriquecimiento de pipelines de anotación automática: usar los embeddings como señal auxiliar en clasificadores de tipos celulares o en la validación de etiquetas asignadas por herramientas automáticas.
- Recuperación de literatura biomédica: indexar resúmenes o pasajes de PubMed y recuperar los más relevantes para una descripción celular o un término biológico concreto.
- Construcción de features para modelos downstream: emplear los vectores de 768 dimensiones (dimensión típica de BERT base, no confirmada explícitamente en la model card) como entrada para clasificadores, regresores o modelos de ranking en tareas biológicas.
- Verificación de integridad en producción: el hash SHA-256 publicado permite comprobar que los pesos desplegados coinciden con los del manuscrito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (109,5 M de parámetros × 4 bytes), alrededor de 0,25 GB en fp16 y menos de 0,15 GB en int8. Cifras estimadas a partir del número de parámetros; no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090, RTX 3060 o T4 funcionan sin problema.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 2060 y superiores, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `sentence-transformers` (Python), Text Embeddings Inference (TEI), y servidores compatibles con endpoints de embeddings. No se documenta soporte explícito para llama.cpp, Ollama o vLLM (orientados a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALIAS-ME | 109,48 M | no disponible | Biomédico / célula única | MIT | Hugging Face |
| NeuML/pubmedbert-base-embeddings | ~110 M (BERT base) | no disponible | Biomédico (PubMed) | Apache 2.0 | Hugging Face |
| BERT base (google-bert/bert-base-uncased) | ~110 M | 512 tokens | General | Apache 2.0 | Hugging Face |
| Sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | General | Apache 2.0 | Hugging Face |

La comparación con `pubmedbert-base-embeddings` es la más directa, ya que ALIAS-ME deriva de él mediante fine-tuning. Frente a BERT base y MiniLM, ALIAS-ME está especializado en terminología biomédica y celular, a costa de un dominio de aplicación más estrecho. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Modelo de investigación exploratoria: el autor indica explícitamente que no ha sido validado para uso clínico.
- Sesgos conocidos: no documentados en la model card; al derivar de PubMedBERT, puede heredar sesgos de la literatura biomédica publicada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias entre términos no relacionados si se usan umbrales inadecuados.
- Limitaciones de contexto e idioma: la longitud máxima de secuencia y los idiomas soportados no están documentados; se desconoce el comportamiento fuera del inglés biomédico.
- Restricciones de licencia: el modelo es MIT, pero el modelo base es Apache 2.0; se incluye el texto de la licencia upstream en el repositorio. Conviene conservar ambas licencias en redistribuciones.
- Adopción muy baja (0 descargas, 0 likes) y sin benchmarks publicados: la calidad real del modelo no está verificada de forma independiente.
- El identificador interno de entrenamiento sugiere un ajuste centrado en células T; su generalización a otros tipos celulares o dominios biológicos no está documentada.
- No es un modelo generativo: no debe usarse para tareas de generación de texto, razonamiento o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mariakrissmer/ALIAS-ME
- Modelo base: https://huggingface.co/NeuML/pubmedbert-base-embeddings
- Repositorio del manuscrito ALIAS (rama de reproducibilidad): https://github.com/MariaKrissmer/alias/tree/manuscript-reproducibility
