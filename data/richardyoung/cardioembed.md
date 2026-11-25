# richardyoung/CardioEmbed

## Resumen

CardioEmbed es un adaptador LoRA de especializacion de dominio sobre el modelo de embeddings Qwen3-Embedding-8B, desarrollado por Richard J. Young (DeepNeuro.AI) y publicado en noviembre de 2025. Su proposito es generar representaciones semanticas de alta calidad para texto clinico de cardiologia, un area en la que los modelos biomedicos genericos entrenados sobre literatura PubMed no capturan bien el vocabulario procedimental y la terminologia que los cardiologos emplean en la practica asistencial.

El modelo parte de la arquitectura transformer densa de Qwen3-Embedding-8B (8.000 millones de parametros, embeddings de 4096 dimensiones) y anade un adaptador LoRA de 117 MB entrenado sobre 106.432 pares de frases extraidos de libros de texto de cardiologia. Se distribuye con la base cuantizada a 8 bits para reducir los requisitos de memoria en produccion, manteniendo una licencia Apache 2.0 que permite uso comercial.

Su relevancia actual radica en que la enfermedad cardiovascular es la primera causa de mortalidad global (aproximadamente 18 millones de muertes anuales) y en que la recuperacion semantica fiable es un componente critico de los sistemas de soporte a la decision clinica. El autor reporta mejoras de hasta 26,4 puntos porcentuales frente a la base en recuperacion especifica de cardiologia y una mejora media de 5,1 puntos de MRR en benchmarks biomedicos generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-Embedding-8B) con adaptador LoRA |
| Parametros totales | 8.000 millones (modelo base) + adaptador LoRA de 117 MB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Base cuantizada a 8 bits; adaptador LoRA en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-Embedding-8B |
| Dimension del embedding | 4096 |
| Libreria | peft (compatible con transformers y sentence-transformers) |
| Tamano del repositorio | 0,1 GB |
| Pooling | Token EOS (ultimo token) |

## Arquitectura y entrenamiento

CardioEmbed no es un modelo independiente, sino un adaptador LoRA acoplado a Qwen3-Embedding-8B, un transformer denso de 8.000 millones de parametros disenado para generar embeddings de frases y documentos. La adaptacion se realiza mediante LoRA sobre la base cuantizada a 8 bits, lo que permite conservar la mayor parte de las capacidades del modelo original con un incremento de almacenamiento de apenas 117 MB. La generacion de embeddings emplea pooling sobre el token EOS (ultima posicion de la secuencia), produciendo vectores de 4096 dimensiones comparables mediante similitud coseno.

El entrenamiento se llevo a cabo sobre 106.432 pares de frases especificos de cardiologia extraidos de libros de texto de referencia, con el objetivo de alinear el espacio de representaciones con el registro linguistico clinico. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; unicamente indica la naturaleza de adaptacion de dominio supervisada mediante pares de similitud. La metodologia esta documentada en el paper arXiv:2511.10930.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion de informacion (pipeline sentence-similarity).
- Representacion especializada de terminologia cardiologica clinica: diagnostico, procedimientos, farmacologia y criterios clinicos.
- Recuperacion semantica sobre corpus biomedicos y cardiologicos (BIOSSES, SciFact, NFCorpus).
- Busqueda semantica y ranking de documentos clinicos mediante similitud coseno.
- Soporte de integracion con sentence-transformers y transformers + peft.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito; es un modelo exclusivamente de embeddings.

## Casos de uso

- Busqueda semantica en guias clinicas de cardiologia: indexar el corpus de guias y libros de texto en una base vectorial y recuperar los fragmentos mas relevantes ante consultas en lenguaje natural, aprovechando el ajuste de dominio sobre vocabulario cardiologico.
- Sistemas de soporte a la decision clinica: dada una descripcion de caso de paciente, recuperar criterios diagnosticos, contraindicaciones o recomendaciones terapeuticas de la literatura, con la ventaja de que el modelo distingue matices entre patologias cardiacas similares.
- Deduplicacion y agrupacion de registros clinicos: generar embeddings de notas, diagnosticos o resumenes y agrupar casos equivalentes o detectar duplicados en historiales electronicos.
- Recuperacion aumentada para asistentes medicos (RAG): servir como recuperador en pipelines RAG donde un LLM genera respuestas fundamentadas en literatura cardiologica, mejorando la precision del contexto recuperado frente a embeddings genericos.
- Clasificacion y triaje de textos cardiologicos: usar los embeddings como caracteristicas de entrada para clasificadores de severidad, subtipo de patologia o urgencia en pipelines de procesamiento de informes.
- Analisis de literatura y revisiones sistematicas: localizar articulos o pasajes relevantes para una pregunta de investigacion cardiovascular mediante busqueda semantica sobre grandes colecciones.
- Emparejamiento de preguntas y respuestas en plataformas de formacion medica: alinear preguntas de examenes de cardiologia con las respuestas o pasajes de texto correspondientes.

## Benchmarks y rendimiento

Resultados reportados en la model card (MRR@10 en tareas de recuperacion biomedica):

| Benchmark | CardioEmbed | Qwen3-8B base | Mejora |
|---|---|---|---|
| BIOSSES | 89,3 % | 82,1 % | +7,2 % |
| SciFact | 72,4 % | 68,9 % | +3,5 % |
| NFCorpus | 38,7 % | 34,2 % | +4,5 % |
| MRR medio | 66,8 % | 61,7 % | +5,1 % |

Ademas, el autor reporta 99,60 % de Acc@1 en recuperacion especifica de cardiologia, lo que supone +15,94 puntos porcentuales frente a MedTE, presentado como el estado del arte en embeddings medicos. La model card no desglosa resultados adicionales por tarea ni intervalos de confianza; el detalle completo se remite al paper arXiv:2511.10930.

## Requisitos de hardware

- El adaptador LoRA ocupa 117 MB (repositorio de 0,1 GB), pero requiere cargar el modelo base Qwen3-Embedding-8B completo.
- VRAM estimada para inferencia en 8 bits: aproximadamente 8-10 GB para los pesos del modelo base, mas memoria adicional para activaciones y batch (dependiente de la longitud de secuencia).
- VRAM estimada en fp16/bf16: aproximadamente 16 GB solo para pesos, con margen adicional para activaciones.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion con lotes grandes; RTX 4090 (24 GB) suficiente para fp16 con batches moderados.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en fp16 y en GPUs de 12-16 GB si se mantiene la cuantizacion a 8 bits y se limita el tamano de batch.
- Opciones de despliegue: transformers + peft (referencia oficial), sentence-transformers, y servidores de embeddings compatibles con modelos Hugging Face; vLLM, llama.cpp u Ollama no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed | 8B (base) + LoRA | No disponible | Cardiologia clinica | Apache 2.0 | Hugging Face + paper |
| Qwen3-Embedding-8B | 8B | No disponible | General | Apache 2.0 | Hugging Face |
| MedTE | No disponible | No disponible | Medico general | No disponible | Referenciado como SOTA en el paper |
| Embeddings biomedicos genericos (p. ej., entrenados sobre PubMed) | Variable | Variable | Biomedico (literatura) | Variable | Variable |

CardioEmbed se diferencia de Qwen3-Embedding-8B por la especializacion de dominio (con mejora reportada de 5,1 puntos de MRR medio en benchmarks biomedicos) y de MedTE por el enfoque en cardiologia clinica (99,60 % frente a Acc@1 de MedTE, +15,94 puntos). La comparativa con otros modelos biomedicos concretos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su rendimiento en castellano ni en otros idiomas.
- Entrenado exclusivamente sobre libros de texto de cardiologia: puede degradar su rendimiento fuera del dominio cardiovascular o en texto biomedico general.
- Riesgo de sesgo derivado del corpus de entrenamiento (libros de texto concretos), que puede infrarepresentar poblaciones, subtipos de enfermedad o practicas clinicas no cubiertas.
- No sustituye el juicio clinico: los embeddings y la recuperacion que habilitan no constituyen diagnostico ni recomendacion medica.
- La cuantizacion a 8 bits del modelo base puede introducir una perdida de precision no cuantificada en la model card.
- No se documentan resultados de robustez ante texto ruidoso, abreviaturas clinicas o notas de historia clinica reales (el entrenamiento usa pares de frases de libros de texto).
- Aunque la licencia es Apache 2.0, el uso en entornos regulados (dispositivos medicos, HIPAA/RGPD) requiere evaluacion propia de conformidad.
- El modelo tiene muy poca adopcion publica (26 descargas, 0 likes en el momento de la consulta), por lo que carece de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/CardioEmbed
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Paper: https://arxiv.org/abs/2511.10930
- Repositorio GitHub: https://github.com/ricyoung/CardioEmbed
- Web del autor: https://deepneuro.ai/richard/
- Sitio del proyecto: https://deepneuro.ai
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
