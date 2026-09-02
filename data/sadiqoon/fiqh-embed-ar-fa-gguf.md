# sadiqoon/fiqh-embed-ar-fa-gguf

## Resumen

Fiqh-Embed AR/FA es un modelo de embeddings bilingüe (árabe y persa) especializado en búsqueda semántica sobre jurisprudencia islámica de la tradición Ja'fari (imamí). Desarrollado por Sadiqoon Technologies, el modelo mapea preguntas y pasajes en ambos idiomas a un espacio vectorial compartido de 1024 dimensiones, de modo que una pregunta formulada en árabe coloquial pueda recuperar la respuesta contenida en un texto persa de referencia, sin necesidad de traducción intermedia.

El modelo continúa el entrenamiento de BAAI/bge-m3 (568 millones de parámetros, contexto de 8.192 tokens) mediante fine-tuning completo sobre un corpus curado de obras de referencia de la escuela Ja'fari, incluyendo *Taḥrīr al-Wasīla*, *Tawḍīḥ al-Masāʾil* y otras. Se distribuye en formato GGUF (Q8_0 y F16) para su uso con llama.cpp, Ollama y LM Studio, además de los pesos originales en safetensors. Su relevancia radica en ofrecer una alternativa de código abierto (licencia MIT) y de integración directa como reemplazo de bge-m3 en sistemas de recuperación existentes, con una mejora medida del 12,6 % en nDCG@10 sobre el modelo base en su dominio de aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en BAAI/bge-m3) |
| Parametros totales | 566.703.104 (568 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Q8_0 (0,6 GB), F16 (1,1 GB) |
| Idiomas soportados | arabe (ar), persa (fa) |
| Licencia | MIT |
| Formato de pesos | GGUF (Q8_0, F16), safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer denso, heredado de BAAI/bge-m3, con 568 millones de parametros y una ventana de contexto de 8.192 tokens. Utiliza pooling CLS para generar representaciones de 1024 dimensiones, sin necesidad de prefijos de instruccion ni configuraciones especiales de pooling, lo que lo hace compatible con cualquier pipeline que ya use bge-m3.

El entrenamiento se realizo mediante fine-tuning completo de todos los pesos con un objetivo contrastivo InfoNCE, combinando hard negatives minados y negativos in-batch, con mezcla de arabe y persa en cada lote. El corpus de entrenamiento consta de 40.183 pasajes extraidos de las obras de referencia de la escuela Ja'fari, emparejados con aproximadamente 3.300 preguntas reales de usuarios (recopiladas de trafico real de un asistente de fiqh) y unas 8.800 consultas en arabe escritas especificamente para pasajes en persa, con el fin de ensenar la correspondencia interlinguistica. No se menciona el uso de RLHF ni DPO; el enfoque es puramente contrastivo.

## Capacidades

- Busqueda semantica bilingue arabe-persa: recupera pasajes en persa a partir de preguntas en arabe y viceversa, sin traduccion intermedia.
- Comprension de arabe coloquial y dialectal: entrenado con preguntas reales, a menudo imprecisas o en registro informal, lo que mejora la robustez frente a variaciones linguisticas.
- Recuperacion de pasajes juridicos especificos: localiza citas y referencias exactas dentro de las obras de la tradicion Ja'fari.
- Clasificacion de consultas por categoria: distingue entre preguntas conceptuales, terminologicas, de prohibicion/negacion, y de aplicacion practica.
- Integracion directa como reemplazo de bge-m3: misma dimensionalidad (1024), mismo pooling (CLS) y misma interfaz, sin cambios en el codigo de recuperacion.
- Compatibilidad con herramientas de inferencia locales: llama.cpp, Ollama, LM Studio y Transformers/sentence-transformers.

## Casos de uso

- Asistente virtual de consultas religiosas: un chatbot o aplicacion movil puede usar el modelo para recuperar la respuesta mas relevante de un corpus de textos juridicos cuando un usuario formula una pregunta en arabe coloquial o persa, incluso si la pregunta es imprecisa o contiene errores gramaticales.
- Sistema de busqueda en bibliotecas digitales de fiqh: indexar las obras de referencia (por ejemplo, *Tahrir al-Wasila* o *Tawdih al-Masa'il*) y permitir busquedas semanticas en ambos idiomas, superando las limitaciones de busqueda por palabras clave.
- Traduccion asistida de textos juridicos: dado que el modelo alinea arabe y persa en el mismo espacio, puede servir para encontrar pasajes paralelos entre versiones arabes y persas de una misma obra, facilitando la labor de traductores especializados.
- Filtrado y clasificacion de preguntas en centros de atencion al fiel: clasificar consultas entrantes por categoria (prohibicion, terminologia, aplicacion practica) para derivarlas al especialista adecuado, usando los embeddings como caracteristicas para un clasificador.
- Motor de recomendacion de contenidos: en plataformas de formacion religiosa, recomendar articulos o capitulos relevantes a partir de la consulta del usuario, aprovechando la capacidad de recuperacion interlinguistica.
- Verificacion de citas y referencias: localizar la fuente exacta de una afirmacion juridica dentro del corpus, comparando el embedding de la cita con los pasajes indexados, util para control de calidad editorial.

## Benchmarks y rendimiento

La model card reporta resultados de evaluacion sobre un conjunto de validacion de 292 preguntas reales, con etiquetas de relevancia agrupadas (estilo TREC, top-10 de cinco sistemas de recuperacion). La metrica principal es nDCG@10, comparando Fiqh-Embed con su modelo base bge-m3 en las mismas condiciones (misma tokenizacion, ventana de pasaje de 384 tokens).

| Categoria | n | bge-m3 | Fiqh-Embed |
|---|---|---|---|
| Todas | 292 | 0,446 | 0,502 |
| Preguntas coloquiales / dialectales | 25 | 0,377 | 0,467 |
| Reglas de prohibicion / negacion | 60 | 0,469 | 0,545 |
| Preguntas conceptuales y aplicadas | 110 | 0,450 | 0,520 |
| Terminologia y definiciones | 45 | 0,484 | 0,503 |
| Pregunta en arabe → pasaje en persa | 45 | 0,422 | 0,441 |
| Busqueda de citas precisas | 7 | 0,336 | 0,339 |

No se han publicado resultados en benchmarks genericos como MMLU, HumanEval o GSM8K, ya que el modelo no es generativo sino de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 0,6 GB y el F16 1,1 GB, por lo que caben en cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs integradas o tarjetas antiguas.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A10, A100) ejecutara el modelo sin problemas; tambien funciona en CPU con llama.cpp, con latencias de milisegundos por consulta.
- Compatibilidad con hardware de consumo: si, cabe en GPUs de consumo desde 2 GB de VRAM, y tambien en sistemas sin GPU gracias a la cuantizacion Q8_0.
- Opciones de despliegue: llama.cpp (comando `llama-embedding`), Ollama (via `ollama pull hf.co/sadiqoon/fiqh-embed-ar-fa-gguf:Q8_0`), LM Studio (servidor compatible con OpenAI `/v1/embeddings`), y Python con `llama-cpp-python` o Transformers/sentence-transformers para los pesos safetensors.
- Latencia y throughput: al ser un encoder de 568 M de parametros, la inferencia es rapida; en una GPU moderna se pueden procesar cientos de consultas por segundo, y en CPU decenas por segundo, dependiendo de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | nDCG@10 (dominio fiqh) |
|---|---|---|---|---|---|---|
| Fiqh-Embed AR/FA | 568 M | 8.192 | ar, fa | MIT | GGUF, safetensors | 0,502 |
| BAAI/bge-m3 | 568 M | 8.192 | 100+ | MIT | safetensors, ONNX | 0,446 |
| multilingual-e5-large | 560 M | 512 | 100+ | MIT | safetensors | no disponible |

Fiqh-Embed es un fine-tuning de bge-m3, por lo que la comparativa principal es contra su modelo base: mejora el nDCG@10 en 0,056 puntos absolutos (12,6 % relativo) en el dominio de jurisprudencia Ja'fari, con especial ganancia en preguntas coloquiales y reglas de prohibicion. Frente a modelos multilingues generales como multilingual-e5-large, no se dispone de datos comparativos en este dominio, pero su especializacion y su contexto de 8.192 tokens (frente a 512) lo hacen mas adecuado para recuperacion de pasajes largos.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta entrenado exclusivamente sobre jurisprudencia Ja'fari; su rendimiento fuera de este ambito (por ejemplo, derecho general, medicina o tecnologia) sera significativamente inferior al de un modelo multilingue generico.
- Idiomas limitados: solo soporta arabe y persa; no maneja otros idiomas, aunque podria transferir parcialmente a variantes dialectales cercanas.
- Riesgo de alucinacion en tareas generativas: al ser un modelo de embeddings, no genera texto, pero si se usa como componente de un sistema RAG, la calidad de las respuestas finales depende del generador; el modelo puede recuperar pasajes irrelevantes si la consulta es muy ambigua.
- Sesgos del corpus: las obras de referencia y las preguntas reales pueden reflejar sesgos teologicos o interpretativos propios de la escuela Ja'fari; no es adecuado para otras escuelas islamicas sin reentrenamiento.
- Contexto limitado a 8.192 tokens: aunque es amplio, para documentos muy largos se requiere truncamiento o chunking, lo que puede perder informacion relevante.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo no ofrece garantias de exactitud juridica; cualquier uso en asesoria legal o religiosa debe ser supervisado por expertos.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/sadiqoon/fiqh-embed-ar-fa-gguf
- Modelo base safetensors: https://huggingface.co/sadiqoon/fiqh-embed-ar-fa
- Sitio web de Sadiqoon Technologies: https://sadiqoon.uk
- Documentacion de GGUF en HuggingFace: https://huggingface.co/docs/hub/gguf
- Repositorio de BAAI/bge-m3 (modelo base): https://huggingface.co/BAAI/bge-m3
