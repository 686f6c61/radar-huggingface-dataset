# shuHernow/ettin-encoder-1b

## Resumen

El modelo `shuHernow/ettin-encoder-1b` es una copia del encoder de 1.000 millones de parámetros de la suite Ettin, desarrollada por el Johns Hopkins University CLSP en colaboración con LightOn. Esta suite, presentada en el artículo "Ettin: an Open Suite of Paired Encoders and Decoders" (arXiv:2507.11412), ofrece por primera vez una comparación controlada entre arquitecturas encoder-only y decoder-only, entrenadas con los mismos datos, arquitectura y receta de entrenamiento. El encoder de 1B está basado en la arquitectura ModernBERT, un transformer bidireccional optimizado para eficiencia, y está diseñado para tareas de extracción de características, clasificación y embeddings, superando a modelos como ModernBERT en varios benchmarks según los autores.

La relevancia de este modelo radica en su transparencia total: los datos de entrenamiento (2T tokens), los checkpoints y el orden de entrenamiento son públicos, lo que permite estudiar dinámicas de entrenamiento y comparar arquitecturas de forma justa. Aunque la copia de `shuHernow` no añade información adicional, mantiene la misma licencia MIT y las mismas capacidades que el original. Es una opción interesante para investigadores que necesitan un encoder de 1B con licencia permisiva y datos abiertos, aunque su uso comercial debe verificarse con la licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (Transformer encoder-only, atencion bidireccional) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (se espera 8192 tokens segun la arquitectura ModernBERT, pero no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (se carga con `AutoModel` de Transformers; el repositorio ocupa 4.1 GB, compatible con safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ModernBERT, un transformer encoder-only con atencion bidireccional y optimizaciones como la atencion con ventana deslizante y la eliminacion de sesgos posicionales. A diferencia de los decoders, no genera texto, sino que produce representaciones contextuales de tokens o secuencias completas.

El entrenamiento se realizo en tres fases con un total de 2T tokens: pre-entrenamiento con 1.7T tokens de una mezcla diversa, extension con 250B tokens de datos filtrados de mayor calidad, y una fase de decaimiento con 100B tokens de fuentes premium. Todos los datos son publicos y se proporciona el orden de entrenamiento a nivel de batch. No se aplicaron tecnicas de RLHF ni DPO; el objetivo fue exclusivamente el modelado de lenguaje enmascarado (MLM), lo que lo hace adecuado para fine-tuning en tareas downstream.

## Capacidades

- Extraccion de caracteristicas y embeddings contextuales para texto en ingles.
- Clasificacion de texto (sentimiento, topicos, intencion) mediante fine-tuning.
- Busqueda semantica y recuperacion de informacion usando embeddings de secuencia.
- Soporte para tareas de codigo (CodeSearchNet) y contextos largos (MLDR) segun los autores.
- Compatible con la API de Transformers (`AutoModel`, `AutoTokenizer`) y con `text-embeddings-inference`.
- No soporta generacion de texto, tool calling ni agentes, al ser un modelo encoder-only.

## Casos de uso

- Busqueda semantica en corpus documentales: el modelo puede generar embeddings de documentos y consultas para recuperar pasajes relevantes en sistemas RAG, aprovechando su capacidad de contexto largo (si se confirma).
- Clasificacion de tickets de soporte: fine-tuning con pocos ejemplos para categorizar incidencias en ingles, con buena precision gracias a su tamano.
- Deteccion de spam o contenido inapropiado: al ser un encoder, puede entrenarse para clasificacion binaria o multiclase con datos etiquetados.
- Extraccion de entidades nombradas: fine-tuning para NER en textos legales o medicos, con la ventaja de la licencia MIT para uso interno.
- Analisis de sentimiento en redes sociales: embeddings de tweets o comentarios para monitorizar opinion publica en ingles.
- Investigacion academica sobre arquitecturas de lenguaje: al tener datos de entrenamiento abiertos, permite estudiar el comportamiento de encoders frente a decoders en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la variante `ettin-encoder-1b` en la informacion disponible. La suite Ettin reporta mejoras sobre ModernBERT en GLUE (88.9 vs 88.4 para Base; 90.8 vs 90.4 para Large) y en MTEB v2 English Retrieval (45.7 vs 43.9 para Base; 48.4 vs 47.0 para Large), pero estos datos corresponden a las variantes de 150M y 400M, no al modelo de 1B. Tampoco hay comparativas publicas con otros encoders de tamano similar (p. ej., BERT-large, RoBERTa-large) en la documentacion consultada.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM ni latencia para este modelo.
- Al ser un encoder de 1B de parametros, se estima que requiere aproximadamente 4 GB de VRAM en precision FP16 sin cuantizacion, y menos con cuantizacion (2-3 GB en 8 bits, 1-2 GB en 4 bits). Estas cifras son orientativas y no han sido verificadas por los autores.
- Puede ejecutarse en GPUs consumer como RTX 3060 (12 GB) o superiores, asi como en GPUs de datacenter como A10G o T4.
- Para despliegue en produccion, se recomienda usar `transformers` con `torch.compile` o servidores como `text-embeddings-inference` (compatible segun los tags).
- El uso de cuantizacion (bitsandbytes, GPTQ) permitiria ejecutarlo en GPUs con 4-6 GB de VRAM, aunque no hay garantias de compatibilidad al no estar documentado.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros encoders de 1B en la informacion proporcionada. Los modelos comparables serian:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BERT-large | 340M | 512 | Apache 2.0 | Modelo clasico, menos eficiente y con contexto corto |
| RoBERTa-large | 355M | 512 | MIT | Mejora de BERT con mas datos, contexto limitado |
| ModernBERT-base | 149M | 8192 | Apache 2.0 | Base de Ettin, mas pequeño pero con contexto largo |
| Ettin-encoder-1b (este) | 1B | no disponible | MIT | Datos abiertos, entrenamiento transparente |

Sin datos de benchmarks del 1B, no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles; no es util para otros idiomas sin fine-tuning adicional.
- Al ser un encoder, no puede generar texto; su uso se limita a tareas de representacion y clasificacion.
- No se han documentado sesgos especificos, pero al entrenarse con datos web abiertos puede heredar sesgos sociales, de genero o raciales presentes en el corpus.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero los embeddings pueden reflejar sesgos en tareas downstream.
- La licencia MIT permite uso comercial, pero es necesario verificar que la copia de `shuHernow` no tenga restricciones adicionales (aunque la model card indica MIT).
- No se garantiza la longitud de contexto real; se recomienda validar antes de usarlo en aplicaciones de contexto largo.
- La ausencia de benchmarks publicos para esta variante dificulta la evaluacion objetiva de su rendimiento.

## Enlaces

- Modelo original en HuggingFace: [jhu-clsp/ettin-encoder-1b](https://huggingface.co/jhu-clsp/ettin-encoder-1b)
- Modelo copia (este): [shuHernow/ettin-encoder-1b](https://huggingface.co/shuHernow/ettin-encoder-1b)
- Articulo en arXiv: [2507.11412](https://arxiv.org/abs/2507.11412)
- Blog de HuggingFace sobre la suite: [Ettin Suite: SoTA Paired Encoders and Decoders](https://huggingface.co/blog/ettin)
- Repositorio GitHub: [JHU-CLSP/ettin-encoder-vs-decoder](https://github.com/JHU-CLSP/ettin-encoder-vs-decoder)
- Datos de pre-entrenamiento: [jhu-clsp/ettin-pretraining-data](https://huggingface.co/datasets/jhu-clsp/ettin-pretraining-data)
- Datos de extension: [jhu-clsp/ettin-extension-data](https://huggingface.co/datasets/jhu-clsp/ettin-extension-data)
- Datos de decay: [jhu-clsp/ettin-decay-data](https://huggingface.co/datasets/jhu-clsp/ettin-decay-data)
- Orden de entrenamiento: [jhu-clsp/ettin-data-order](https://huggingface.co/datasets/jhu-clsp/ettin-data-order)
