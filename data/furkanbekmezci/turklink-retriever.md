# furkanbekmezci/turklink-retriever

## Resumen

TurkLink-retriever es un modelo de embeddings (bi-encoder) orientado a *entity linking* sobre Wikidata en turco. Lo publica el usuario furkanbekmezci y forma parte de un pipeline mayor denominado `frcturus/turklink-el`; el propio autor advierte que las métricas de la model card corresponden al pipeline completo y no a este componente aislado. Se construye por *fine-tuning* del modelo multilingüe `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` y produce vectores de 384 dimensiones, con *mean pooling* y normalización L2.

El modelo resuelve la fase de recuperación de candidatos: dada una mención extraída de un texto turco, devuelve un ranking de Q-IDs de Wikidata sobre un catálogo de 3.958.456 entidades. Está entrenado con negativos en lote (*in-batch*) y negativos duros minados, e incorpora plantillas de consulta que codifican rasgos morfológicos del turco, como el caso y el uso del apóstrofo. Es un *pilot*: el autor indica explícitamente que la receta completa de corpus no se ejecutó y que los resultados son de una muestra, no los del artículo de TurkLink.

Su relevancia es doble. Por un lado, cubre una carencia concreta: existen pocos recursos de *entity linking* turco de código abierto con catálogo Wikidata a gran escala. Por otro, es un modelo pequeño (117,6 millones de parámetros, repositorio de 0,5 GB) que cabe en CPU y en cualquier GPU de consumo, lo que lo hace utilizable como componente de recuperación en pipelines de anotación, búsqueda semántica o enriquecimiento de datos. La licencia CC BY-SA 4.0 del checkpoint condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder transformer tipo BERT (MiniLM-L12); *mean pooling* y normalizacion L2 |
| Parametros totales | 117.653.760 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | Turco (tr) |
| Licencia | CC BY-SA 4.0 (checkpoints y artefactos derivados del corpus); codigo fuente Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 384 |
| Modelo base | sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | sentence-similarity (uso real: recuperacion para entity linking) |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints compatibles |

## Arquitectura y entrenamiento

Se trata de un bi-encoder basado en la arquitectura BERT de MiniLM (12 capas), heredado de `paraphrase-multilingual-MiniLM-L12-v2`. Las representaciones se obtienen mediante *mean pooling* sobre las salidas del encoder y se normalizan con L2, dando lugar a vectores de 384 dimensiones comparables por similitud coseno. El entrenamiento emplea negativos en lote y negativos duros minados, una estrategia habitual para mejorar la discriminación entre entidades semánticamente próximas en espacios de recuperación densos.

Los datos proceden del corpus TurkLink (Akdaş y Tantuğ, 2026, DOI 10.1016/j.procs.2026.01.041), con revisión `c8d7fe7bdd0ae934268d30ef64f6444940bdf6dc`. Se preserva la pertenencia oficial a los *splits* y el muestreo se hace por documento: 28.310 documentos de entrenamiento, 2.350 de validación y 2.353 de test, con semilla 42. El catálogo de entidades contiene 3.958.456 Q-IDs; además se recuperaron 449 entidades de entrenamiento ausentes mediante respaldo de etiquetas en turco, multilingüe e inglés de Wikidata, cuya instantánea congelada se distribuye en `wikidata-supplement.jsonl`. El autor afirma que no se usaron etiquetas de test para esa reparación y que no se envió texto de usuario a ningún LLM externo durante el entrenamiento. La receta completa sobre el corpus íntegro no se ejecutó en este *pilot*.

## Capacidades

- Generación de embeddings de similitud semántica para menciones textuales y entidades de Wikidata, con salida normalizada de 384 dimensiones.
- Recuperación de candidatos (*candidate retrieval*) sobre un catálogo de 3.958.456 Q-IDs, con métricas de Recall@1, @5, @10 y @32.
- Codificación específica de menciones turcas mediante plantillas de consulta que contemplan morfología de caso y apóstrofo.
- Uso como componente dentro del pipeline `frcturus/turklink-el`, junto a detección de menciones y otras piezas del sistema completo.
- Compatibilidad con `sentence-transformers` y con *text-embeddings-inference* para servir embeddings por HTTP.
- No es un modelo generativo: no produce texto libre, no implementa *tool calling* ni *function calling*, no soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de razonamiento (*thinking mode*).
- El multilingüismo del modelo base no se declara como capacidad del modelo ajustado: la model card fija el turco como único idioma soportado.

## Casos de uso

- Enriquecimiento de corpus periodísticos en turco: el modelo permite enlazar menciones de personas, organizaciones y lugares con Q-IDs de Wikidata, generando anotaciones estructuradas sobre textos no etiquetados y habilitando análisis posteriores por entidad.
- Anotación asistida de conjuntos de datos de NLP: como recuperador de candidatos, propone las entidades más probables para cada mención y reduce el trabajo humano a validar un ranking corto en lugar de buscar en el catálogo completo.
- Búsqueda semántica de entidades: con 384 dimensiones y similitud coseno, permite indexar el catálogo en un índice vectorial (por ejemplo HNSW) y resolver consultas por texto libre con latencia baja.
- Desambiguación de entidades en redes sociales: los textos informales turcos contienen menciones ambiguas y variantes ortográficas; el modelo puede recuperar candidatos y dejar la desambiguación final a una capa posterior con umbral de abstención.
- Normalización y deduplicación de entidades en bases de datos corporativas: al proyectar nombres de entidades y menciones al mismo espacio, se pueden agrupar registros que se refieren a la misma entidad de Wikidata.
- Preprocesado para sistemas RAG: los vectores de entidad pueden usarse para vincular consultas o documentos a Q-IDs y así recuperar datos estructurados de Wikidata como contexto adicional.
- Integración en pipelines de verificación de hechos: el enlace a Q-IDs permite resolver afirmaciones sobre entidades concretas contra conocimiento estructurado, siempre que la precisión de la mención se valide externamente.

## Benchmarks y rendimiento

Resultados medidos del pipeline completo (no de este componente aislado), según la model card del autor. La exactitud coincide con el micro-F1 porque cada mención tiene un único Q-ID de referencia y una única predicción. Los aciertos ausentes en el catálogo cuentan como fallo.

| Dataset | Menciones | Accuracy / micro-F1 | R@1 | R@5 | R@10 | R@32 | Cobertura de catalogo |
|---|---:|---:|---:|---:|---:|---:|---:|
| mewsli-9-tr | 5811 | 0,8226 | 0,7567 | 0,8845 | 0,9029 | 0,9248 | 0,9955 |
| mewsli-x-tr-dev | 262 | 0,9008 | 0,7863 | 0,9389 | 0,9542 | 0,9656 | 0,9962 |
| mewsli-x-tr-test | 1215 | 0,8593 | 0,7778 | 0,8963 | 0,9185 | 0,9342 | 0,9951 |
| test | 2000 | 0,8020 | 0,7500 | 0,8695 | 0,8900 | 0,9050 | 0,9985 |
| validation | 2000 | 0,8335 | 0,7725 | 0,8900 | 0,9105 | 0,9335 | 0,9980 |

Proxy de extremo a extremo sobre texto crudo (incluye detección de menciones; las menciones correctas no anotadas se contabilizan como falsos positivos por la referencia de hipervínculos dispersa):

| Dataset | Ventanas | Precision EL | Recall EL | micro-F1 EL | micro-F1 de menciones |
|---|---:|---:|---:|---:|---:|
| test | 300 | 0,2286 | 0,6429 | 0,3372 | 0,4052 |
| validation | 300 | 0,2073 | 0,6559 | 0,3150 | 0,3669 |

No se han publicado resultados de benchmarks generales (MMLU, GSM8K, HumanEval u otros) en la información disponible: el modelo no es generativo y no se evalúa con ese tipo de pruebas. Los resultados de Mewsli corresponden a transferencia supervisada al turco contra este catálogo, no al protocolo *zero-shot* original de XTREME-R. Las métricas de extremo a extremo de TurkLink son proxies de hipervínculos dispersos y no deben presentarse como exactitud de NER exhaustiva.

## Requisitos de hardware

- Huella de memoria estimada a partir de los 117.653.760 parámetros: aproximadamente 471 MB en FP32, 235 MB en FP16 y 118 MB en INT8. Son cálculos derivados del recuento de parámetros, no cifras publicadas por el autor.
- Inferencia viable en CPU para lotes pequeños o moderados, dado el tamaño reducido del modelo y la ausencia de decodificación autoregresiva.
- GPU de consumo: cabe con holgura en cualquier GPU con 2 GB o más de VRAM, incluidas GTX 1650, RTX 3060, RTX 4090 y equivalentes.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para la inferencia; solo tendrían sentido para indexar el catálogo completo de 3.958.456 entidades a gran velocidad o para reentrenamiento.
- Despliegue: `sentence-transformers` para uso en proceso, *text-embeddings-inference* (TEI) para servicio HTTP con batching, y cualquier servidor compatible con la API de *embeddings* al estar marcado como `endpoints_compatible`. No se distribuyen pesos GGUF, por lo que `llama.cpp` y `Ollama` no son vías directas salvo conversión propia.
- El consumo de memoria en producción lo domina el índice vectorial del catálogo (3,96 millones de vectores de 384 dimensiones, aproximadamente 5,7 GB en FP32 o 2,9 GB en FP16 sin contar la estructura del índice), no el modelo en sí.
- Latencia y *throughput*: no disponible. La model card no publica mediciones de velocidad.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentación pública y no se han reproducido en esta ficha; el rendimiento de recuperación sobre el catálogo Wikidata turco no es comparable sin una evaluación común.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Uso |
|---|---:|---|---|---|---|---|
| furkanbekmezci/turklink-retriever | 117,65 M | No disponible | Turco | CC BY-SA 4.0 | safetensors | Entity linking a Wikidata en turco |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | Aprox. 118 M | No disponible | Multilingue | Apache-2.0 | safetensors | Similitud semantica general |
| intfloat/multilingual-e5-small | Aprox. 118 M | No disponible | Multilingue | MIT | safetensors | Recuperacion y similitud multilingue |
| BAAI/bge-m3 | Aprox. 568 M | No disponible | Multilingue | MIT | safetensors | Recuperacion densa, dispersa y multi-vector |

La diferencia principal frente a las alternativas es la especialización: TurkLink-retriever está ajustado para el formato de mención y entidad del pipeline TurkLink, mientras que los modelos multilingües generales no incluyen plantillas de consulta para morfología turca ni un catálogo Wikidata prealineado. Como contrapartida, su licencia CC BY-SA 4.0 es más restrictiva que las licencias permisivas de las alternativas.

## Limitaciones y advertencias

- Los rasgos de caso y apóstrofo del turco se comparten entre entrenamiento e inferencia mediante heurísticas; el autor subraya que no es un desambiguador morfológico completo.
- La supervisión de menciones es débil y no exhaustiva, lo que se traduce en ruido en las anotaciones de entrenamiento.
- El corpus, las anotaciones automáticas, las descripciones traducidas y el catálogo histórico pueden contener errores.
- El rendimiento puede degradarse en dominios nuevos, entidades nuevas, sustantivos comunes y menciones ambiguas.
- La confianza está calibrada para elegir un Q-ID dada una mención ya delimitada, no para validar si la mención es correcta, y puede desplazarse según el dominio.
- La abstención se basa en umbrales fijos: no es un detector de NIL entrenado, por lo que la decisión de no enlazar no es fiable por sí sola.
- Las métricas publicadas corresponden al pipeline completo y a un *pilot* muestreado; no deben atribuirse a este componente ni al artículo de TurkLink.
- El proxy de extremo a extremo muestra precisiones de enlace muy bajas (0,21-0,23) porque las menciones correctas no anotadas se cuentan como falsos positivos; no debe interpretarse como una estimación limpia de precisión en producción.
- Riesgo de alucinación: al ser un recuperador no genera texto, pero puede devolver un candidato incorrecto con puntuación alta. Cualquier uso que exija precisión alta necesita una etapa de verificación o abstención calibrada.
- Licencia: los checkpoints y los artefactos derivados del corpus se distribuyen bajo CC BY-SA 4.0 con atribución a TurkLink, lo que impone obligaciones de compartir igual y puede ser incompatible con despliegues comerciales cerrados. El código fuente es Apache-2.0, y las licencias de los modelos preentrenados (MiniLM, Apache-2.0; BERTurk, MIT) siguen aplicándose.
- El modelo solo declara soporte de turco, pese a que el modelo base sea multilingüe.
- Se trata de un modelo piloto con 0 descargas y 0 *likes* en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento continuado.
- Existe una discrepancia de nomenclatura entre el identificador del repositorio (`furkanbekmezci/turklink-retriever`) y el citado en la model card (`frcturus/turklink-retriever`), que conviene verificar antes de fijar una dependencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/furkanbekmezci/turklink-retriever
- Pipeline completo: https://huggingface.co/frcturus/turklink-el
- Dataset TurkLink: https://huggingface.co/datasets/yakdas/turklink-corpus
- Articulo de TurkLink (Akdaş y Tantuğ, 2026): https://doi.org/10.1016/j.procs.2026.01.041
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
