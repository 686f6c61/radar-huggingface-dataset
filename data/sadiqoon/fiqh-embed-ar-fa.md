# sadiqoon/fiqh-embed-ar-fa

## Resumen

Fiqh-Embed AR/FA es un modelo de embeddings bilingüe (árabe-persa) desarrollado por Sadiqoon Technologies, una empresa con sede en Londres, especializado en búsqueda semántica sobre jurisprudencia islámica chií (tradición Ja'fari o Imami). El modelo continúa el fine-tuning de BAAI/bge-m3, un encoder multilingüe de 568 millones de parámetros con una ventana de contexto de 8.192 tokens, y lo adapta a un corpus de obras de referencia como *Taḥrīr al-Wasīla*, *Tawḍīḥ al-Masāʾil* y otras. Su objetivo es que preguntas formuladas en árabe coloquial o persa encuentren el pasaje que las responde, sin necesidad de traducción previa, mapeando ambos idiomas en un espacio vectorial compartido de 1024 dimensiones.

El modelo se presenta como un reemplazo directo de bge-m3: misma dimensionalidad, mismo pooling CLS y sin prefijos de instrucción, lo que facilita su integración en sistemas de recuperación existentes. Está disponible en formato safetensors para Transformers y sentence-transformers, y también en GGUF para llama.cpp, Ollama y LM Studio. Su licencia MIT permite uso comercial sin restricciones. La relevancia actual radica en que aborda un dominio muy específico —la jurisprisdicción islámica— con un enfoque de recuperación entrenado sobre preguntas reales de usuarios, algo poco común en los modelos de embeddings generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base bge-m3) |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | GGUF (cuantizaciones específicas no detalladas; disponibles en repo separado) |
| Idiomas soportados | arabe (ar), persa (fa) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-m3, un encoder transformer basado en XLM-RoBERTa con 568 millones de parámetros y una ventana de contexto de 8.192 tokens. bge-m3 originalmente combina objetivos de embeddings densos, dispersos y multi-vector, pero este fine-tuning se centra exclusivamente en la representación densa, manteniendo el pooling CLS y la normalización L2. La dimensionalidad de salida es de 1024, idéntica a la del modelo base.

El entrenamiento se realizó con un corpus de 40.183 pasajes extraídos de las obras de referencia de la escuela Ja'fari, tanto en árabe como en persa. Se usaron aproximadamente 3.300 pares de preguntas reales de usuarios con sus pasajes correspondientes, emparejados mediante citas textuales y referencias de página, más unas 8.800 consultas en árabe escritas para pasajes en persa con el fin de enseñar el mapeo interlingüístico. El objetivo de entrenamiento fue contraste InfoNCE con hard negatives minados dentro del batch, mezclando árabe y persa en cada lote. Se realizó un fine-tuning completo de todos los pesos, sin congelar capas.

## Capacidades

- Busqueda semantica bilingue arabe-persa: permite recuperar pasajes en persa a partir de preguntas en arabe y viceversa, sin traduccion intermedia.
- Recuperacion de pasajes de jurisprudencia islamica chií: entrenado sobre preguntas reales de usuarios, incluyendo lenguaje coloquial y dialectal.
- Compatible con sentence-transformers y Transformers: misma interfaz que bge-m3, sin prefijos de instruccion ni pooling especial.
- Soporte de cuantizacion GGUF: disponible para llama.cpp, Ollama y LM Studio, lo que permite ejecucion en CPU y GPUs modestas.
- Embeddings normalizados: salida lista para similitud coseno o producto escalar.
- Sin generacion de texto: es un modelo de embeddings puro, no un LLM generativo.

## Casos de uso

- Asistente de consultas fiqh en aplicaciones moviles: un chatbot que recibe preguntas en arabe coloquial o persa y recupera el pasaje relevante de las obras de referencia, mostrando la cita exacta. El modelo es adecuado porque fue entrenado con preguntas reales de este tipo.
- Sistema de busqueda en bibliotecas digitales de jurisprudencia: indexar los 40.183 pasajes del corpus y permitir busquedas semanticas en ambos idiomas, superando las limitaciones de busqueda por palabras clave.
- Herramienta de estudio para estudiantes de seminarios: un plugin que, dado un tema o pregunta, encuentra pasajes relacionados en *Tawḍīḥ al-Masāʾil* o *Taḥrīr al-Wasīla*, facilitando la comparacion de fuentes.
- Traduccion asistida de textos juridicos: al alinear preguntas y pasajes en ambos idiomas, puede servir como base para sistemas de traduccion automatica o verificacion de terminologia.
- Motor de recuperacion para un sistema RAG (Retrieval-Augmented Generation) sobre fiqh: integrar el modelo en un pipeline de generacion aumentada por recuperacion para producir respuestas fundamentadas con citas, como se describe en el paper de Fanar-Sadiq.
- Evaluacion de similitud entre fatwas o dictamenes: medir la cercania semantica entre diferentes textos juridicos para detectar coincidencias o divergencias entre escuelas.

## Benchmarks y rendimiento

La model card reporta una evaluacion sobre un conjunto de 292 preguntas reales, con etiquetas de relevancia agrupadas (estilo TREC, top-10 de cinco sistemas de recuperacion). La metrica es nDCG@10, comparando el modelo con bge-m3 en las mismas condiciones (misma tokenizacion, ventana de pasaje de 384 tokens).

| Categoria | n | bge-m3 | Fiqh-Embed |
|---|---|---|---|
| Todas | 292 | 0.446 | **0.502** |
| Preguntas coloquiales / dialectales | 25 | 0.377 | **0.467** |
| Dictamenes de prohibicion / negacion | 60 | 0.469 | **0.545** |
| Preguntas conceptuales y aplicadas | 110 | 0.450 | **0.520** |
| Terminologia y definiciones | 45 | 0.484 | **0.503** |
| Pregunta en arabe → pasaje en persa | 45 | 0.422 | **0.441** |
| Busqueda de cita precisa | 7 | 0.336 | 0.339 |

El modelo supera a bge-m3 en todas las categorias excepto en la de cita precisa, donde el resultado es practicamente identico. No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada: con 567 millones de parametros, en fp32 el modelo ocupa aproximadamente 2,3 GB; en fp16 unos 1,2 GB. Con cuantizacion GGUF de 8 bits, alrededor de 600 MB, y en 4 bits, unos 300 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, RTX 3050, RTX 4060). Para cuantizaciones mas bajas, incluso CPUs modernas son suficientes.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y baja gracias a su tamano moderado.
- Opciones de despliegue: sentence-transformers, Transformers, llama.cpp, Ollama, LM Studio, y Text Embeddings Inference (TEI) segun los tags del repositorio.
- Latencia y throughput: no se han publicado datos oficiales. Como referencia, bge-m3 en una GPU A100 procesa alrededor de 1.000 secuencias de 128 tokens por segundo en fp16; este modelo deberia tener un rendimiento similar al ser la misma arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| sadiqoon/fiqh-embed-ar-fa | 567,75 M | 8.192 | ar, fa | MIT | Jurisprudencia chií |
| BAAI/bge-m3 | 568 M | 8.192 | 100+ | MIT | General multilingue |
| intfloat/multilingual-e5-large | 560 M | 512 | 100+ | MIT | General multilingue |

La comparacion directa con bge-m3 es la mas relevante, ya que es el modelo base y el punto de referencia en la evaluacion. Fiqh-Embed mejora el nDCG@10 en el dominio especifico (0.502 frente a 0.446) manteniendo la misma interfaz. Frente a multilingual-e5-large, no hay datos comparativos publicados, pero la ventaja de Fiqh-Embed es su entrenamiento en el dominio y su ventana de contexto mucho mayor (8.192 frente a 512 tokens). No se conocen otros modelos de embeddings especializados en jurisprudencia islamica.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta entrenado exclusivamente sobre jurisprudencia chií Ja'fari. Su rendimiento en otros dominios o en otras escuelas islamicas (suní, por ejemplo) no esta garantizado y probablemente sea inferior al de un modelo generalista.
- Idiomas limitados: solo arabe y persa. No soporta otros idiomas, aunque el modelo base bge-m3 si los soportaba; este fine-tuning puede haber degradado las representaciones en otros idiomas.
- Riesgo de sesgo: al estar entrenado con un corpus de una tradicion juridica concreta, puede reflejar las interpretaciones y posiciones de esa escuela, lo que debe tenerse en cuenta en aplicaciones que requieran neutralidad.
- Alucinacion en recuperacion: aunque el modelo no genera texto, puede recuperar pasajes que no responden exactamente a la pregunta si la similitud semantica es alta pero el contenido no es correcto. La evaluacion muestra una caida en la categoria de cita precisa (nDCG@10 de 0.339), lo que sugiere que para busquedas de citas exactas se necesitan mecanismos adicionales de verificacion.
- Contexto limitado a 8.192 tokens: aunque es amplio, para documentos muy largos puede ser necesario dividirlos en fragmentos.
- Sin datos de rendimiento en produccion: no se han publicado metricas de latencia, throughput ni pruebas de estres en entornos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sadiqoon/fiqh-embed-ar-fa
- Repositorio GGUF: https://huggingface.co/sadiqoon/fiqh-embed-ar-fa-gguf
- Demo interactiva: https://huggingface.co/spaces/sadiqoon/fiqh-embed-demo
- Paper relacionado (Fanar-Sadiq, arquitectura multiagente para QA islamico): https://arxiv.org/pdf/2603.08501v3
- Sitio web de Sadiqoon Technologies: https://sadiqoon.uk
- Sitio web de Fiqh Tech (proyecto relacionado): https://www.aifiqh.com/
