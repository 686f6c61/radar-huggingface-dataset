# marin-community/atlantic-cc-modernbert

## Resumen

Atlantic-CC ModernBERT es un clasificador de texto binario desarrollado por marin-community que estima la probabilidad de que una pagina web extraida de Common Crawl contenga contenido util (P(useful)). Es la ultima etapa de la cascada de clasificadores que construyo el corpus Atlantic-CC, un procesamiento de 17,1 billones de tokens de Common Crawl, y se encarga de decidir sobre las paginas que el clasificador anterior (un transformer con pooling) no pudo resolver con suficiente confianza.

El modelo es un fine-tuning del encoder Ettin-68M de jhu-clsp, que emplea la arquitectura ModernBERT. Con 68,4 millones de parametros, es un modelo encoder pequeno y eficiente, disenado especificamente para filtrado de datos a escala de web. Su funcion no es generar texto ni mantener conversaciones, sino puntuar paginas para decidir si se conservan o se descartan en un pipeline de construccion de datasets.

Su relevancia actual radica en que forma parte de la infraestructura de curacion de datos para entrenamiento de modelos de lenguaje a gran escala. La cascada completa (fastText, transformer con pooling y este ModernBERT) permite filtrar Common Crawl con alta precision, y este modelo aporta la etapa final de decision con un F1 de 0,8805 sobre un conjunto de evaluacion de 6.477 paginas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 68.408.322 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (truncacion en produccion) |
| Tipos de cuantizacion | no disponible (produccion en bfloat16) |
| Idiomas soportados | no disponible (no evaluado por idioma) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Ettin-68M, un encoder de la familia ModernBERT que incorpora mejoras sobre el transformer clasico como rotary position embeddings (RoPE), atencion con alternancia entre local y global, y un diseno optimizado para eficiencia en secuencias largas. Sobre esta base se anadio una cabeza de clasificacion de secuencia para producir una distribucion sobre dos clases (util / no util), de la que se extrae P(useful) mediante softmax.

El entrenamiento consistio en un fine-tuning de una sola epoca sobre 10 millones de paginas procedentes de 345 archivos WARC de Common Crawl, etiquetadas segun si un pipeline de extraccion basado en LLM conservo la pagina (dataset interno "ettin68-10M"). La evaluacion se realizo sobre 6.477 paginas de 89 WARC reservados, alcanzando un F1 de 0,8805. En produccion el modelo se ejecuto en bfloat16 sobre TPUs, y se verifico que ejecuciones en bfloat16 en otro hardware toman la misma decision de conservacion en el 99% o mas de los casos, con todas las diferencias dentro de 0,0055 del umbral.

## Capacidades

- Clasificacion binaria de texto: puntua la probabilidad de que una pagina web contenga contenido util.
- Filtrado de datos a escala de web: disenado para procesar grandes volumenes de paginas de Common Crawl en pipelines de curacion.
- Manejo de texto de contenido principal: espera texto extraido con resiliparse-rs (columna `text` de Atlantic-CC), con normalizacion especifica (espacios colapsados, minusculas, truncado a 65.536 caracteres).
- Decision con umbral calibrado: punto de operacion definido (P(useful) >= 0,4378 sobre los primeros 2.048 tokens) para integrarse en una cascada con etapas previas.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- Capacidades multilingues: no evaluadas ni garantizadas.

## Casos de uso

- Construccion de datasets de preentrenamiento: el modelo actua como etapa final de filtrado en un pipeline que procesa Common Crawl, decidiendo que paginas conservar para entrenar modelos de lenguaje. Es adecuado porque su punto de operacion esta calibrado para integrarse con las etapas previas de la cascada.
- Curacion de corpus web a gran escala: permite eliminar paginas de baja calidad (navegacion, plantillas, contenido vacio) de forma automatizada antes de indexar o entrenar, reduciendo el ruido en el dataset.
- Filtrado de datos para investigacion en NLP: investigadores que necesitan corpus web limpios pueden usar el modelo para puntuar y seleccionar paginas con contenido sustantivo, con un F1 de 0,8805 en la tarea.
- Reproduccion de Atlantic-CC: el modelo es pieza clave para replicar o extender el corpus Atlantic-CC de 17,1 billones de tokens, ya que implementa la ultima etapa de su cascada de clasificadores.
- Auditoria de calidad de extracciones web: se puede usar para evaluar la calidad del texto extraido por distintos extractores, aunque el modelo solo fue entrenado con textos de resiliparse-rs.
- Pipeline de limpieza en produccion con TPU: al disponer de una implementacion JAX que reproduce el comportamiento en TPUs, encaja en infraestructuras de procesamiento masivo en hardware especializado.

## Benchmarks y rendimiento

| Modelo | F1 |
|---|---|
| Atlantic-CC ModernBERT (este modelo) | 0,8805 |
| Atlantic-CC pooled transformer | 0,8483 |
| fastText | 0,8196 |

Evaluacion sobre 6.477 paginas de 89 WARC reservados. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no esta disenado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (68,4 M de parametros, aproximadamente 137 MB de pesos); en float32 unos 274 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en RTX 4090, A100, H100 y GPUs de consumo como RTX 3060 o superiores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM.
- Opciones de despliegue: transformers (referencia), text-embeddings-inference (tag `text-embeddings-inference`), endpoints compatibles; existe una implementacion JAX para TPUs en el repositorio de Atlantic-CC.
- Latencia y throughput: no disponibles de forma explicita; en produccion se ejecuto en bfloat16 sobre TPUs procesando el 34,5% de las paginas que pasaron fastText.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (tarea) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlantic-CC ModernBERT | 68,4 M | 2.048 tokens | 0,8805 | OpenMDW-1.1 | HuggingFace |
| Atlantic-CC pooled transformer | no disponible | no disponible | 0,8483 | no disponible | HuggingFace (marin-community/atlantic-cc-pooled-transformer) |
| fastText (clasificador) | no disponible | no aplica | 0,8196 | no disponible | no disponible |

La comparativa se limita a las etapas de la misma cascada, ya que no se dispone de datos de otros clasificadores de calidad web comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Hereda la nocion de "contenido util" de un unico pipeline de extraccion basado en LLM; no fue evaluado por idioma ni por dominio, ni sobre texto de otros extractores.
- No es un filtro de toxicidad, seguridad, informacion personal, valor educativo ni licencias.
- Las puntuaciones cercanas al umbral 0,4378 dependen de detalles de punto flotante; otro hardware puede decidir de forma distinta una pequena fraccion de paginas.
- El modelo es un artefacto de investigacion segun el autor: no ha sido probado ni evaluado adecuadamente y no es necesariamente seguro; uso en produccion bajo responsabilidad del usuario.
- No soporta generacion de texto ni tareas conversacionales; su unico proposito es la clasificacion binaria.
- La licencia OpenMDW-1.1 debe revisarse para uso comercial; el modelo base Ettin-68M es MIT y el tokenizador ModernBERT-base es Apache-2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marin-community/atlantic-cc-modernbert
- Repositorio Atlantic-CC (codigo e implementacion JAX): https://github.com/marin-community/atlantic-cc
- Documentacion de clasificadores: https://github.com/marin-community/atlantic-cc/blob/main/docs/classifiers.md
- Modelo base Ettin-68M: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Clasificador pooled transformer de la cascada: https://huggingface.co/marin-community/atlantic-cc-pooled-transformer
