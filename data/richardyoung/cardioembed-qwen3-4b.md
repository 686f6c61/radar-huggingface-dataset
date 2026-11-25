# richardyoung/CardioEmbed-Qwen3-4B

## Resumen

CardioEmbed-Qwen3-4B es un adaptador LoRA sobre el modelo de embeddings Qwen3-Embedding-4B, especializado en representaciones vectoriales de texto clinico de cardiologia. Lo desarrolla Richard J. Young (DeepNeuro) como parte de un estudio comparativo de diez arquitecturas de embeddings para texto clinico de cardiologia, publicado en arXiv (2511.19739). El modelo resuelve el problema de la baja calidad de los embeddings genericos en terminologia medica especializada: en lugar de reentrenar un modelo completo, aplica una adaptacion de dominio ligera que desplaza el espacio vectorial hacia el lexico y las relaciones semanticas propias de la cardiologia.

Tecnicamente es un adaptador PEFT (LoRA con r=16 y alpha=32) que se carga sobre el modelo base Qwen3-Embedding-4B, un transformer de aproximadamente 4.000 millones de parametros orientado a la generacion de embeddings de frases. El adaptador se entrena con Multiple Negatives Ranking Loss (InfoNCE) sobre 106.535 pares de texto de cardiologia extraidos de libros de texto medicos. Su relevancia actual radica en que demuestra que la adaptacion de dominio con LoRA sobre modelos de embeddings modernos es una via eficiente para tareas de recuperacion y similitud semantica en entornos clinicos, sin necesidad de reentrenar el modelo completo.

El modelo esta pensado para tareas de sentence-similarity y recuperacion de informacion en ingles, con licencia Apache 2.0 y un unico metrica publicada por el autor: una Separation Score de 0,446. No se publican resultados de benchmarks estandar (MTEB, MMLU, etc.) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3-Embedding-4B |
| Parametros totales | No disponible (adaptador LoRA con r=16, alpha=32; el modelo base Qwen3-Embedding-4B tiene aproximadamente 4.000 millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-Embedding-4B; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) con rango r=16 y alpha=32 aplicado sobre Qwen3-Embedding-4B, un transformer denso de aproximadamente 4.000 millones de parametros especializado en generar embeddings de frases. El adaptador modifica los pesos del modelo base mediante matrices de baja dimension, lo que permite una adaptacion de dominio con un coste computacional y de almacenamiento muy reducido frente al ajuste completo. El repositorio ocupa 0,0 GB, coherente con un adaptador ligero.

El entrenamiento se realizo sobre 106.535 pares de texto de cardiologia provenientes de libros de texto medicos, con la funcion de perdida Multiple Negatives Ranking Loss (InfoNCE), habitual en el entrenamiento de modelos de similitud de frases y recuperacion. No se especifica en la informacion disponible el numero total de tokens, la composicion detallada del dataset, ni si se aplicaron etapas de RLHF o DPO (no procede en un modelo de embeddings). La innovacion principal es la adaptacion de dominio mediante LoRA sobre un modelo de embeddings moderno, evaluada dentro de un estudio comparativo de diez arquitecturas.

## Capacidades

- Generacion de embeddings de texto para similitud semantica (pipeline sentence-similarity).
- Recuperacion de informacion y busqueda semantica en textos de cardiologia en ingles.
- Representacion de terminologia medica especializada gracias a la adaptacion de dominio.
- Agrupamiento (clustering) y clasificacion de documentos clinicos por similitud vectorial.
- Deteccion de duplicados y near-duplicates en corpus de cardiologia.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Busqueda semantica en literatura cardiologica: indexar articulos y guias clinicas en una base vectorial y recuperar fragmentos relevantes por similitud, aprovechando la adaptacion al lexico cardiaco.
- Sistemas de preguntas y respuestas sobre documentacion clinica: usar los embeddings para recuperar el contexto mas relevante antes de pasarlo a un LLM generativo, mejorando la precision del RAG en dominio medico.
- Deduplicacion de registros clinicos: detectar historias o notas de cardiologia duplicadas o casi identicas mediante similitud coseno sobre los embeddings.
- Clasificacion y enrutamiento de documentos: agrupar notas clinicas por subtema cardiaco (arritmias, insuficiencia cardiaca, valvulopatias) mediante clustering sobre los vectores generados.
- Motor de recomendacion de contenido medico: sugerir articulos o casos clinicos relacionados a partir de la similitud entre embeddings de consultas y documentos.
- Evaluacion de calidad de traducciones o resumenes clinicos: medir la similitud semantica entre el texto original y su resumen o traduccion en el dominio de cardiologia.
- Construccion de ontologias y mapas semanticos: explorar relaciones entre terminos cardiacos mediante la geometria del espacio de embeddings adaptado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Separation Score | 0,446 |

No se han publicado resultados de benchmarks estandar (MTEB, MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento proporcionado por el autor es la Separation Score de 0,446, sin comparativa numerica con los otros nueve modelos del estudio en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es minimo; el modelo base Qwen3-Embedding-4B requiere aproximadamente 8 GB en FP16 y unos 4-5 GB en cuantizacion de 8 bits (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090 o RTX 3090 para inferencia en una sola GPU consumer.
- Cabe en GPU consumer: si, previsiblemente en RTX 4090, RTX 3090 y GPUs con 8 GB o mas de VRAM en cuantizacion (estimacion orientativa).
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), sentence-transformers, vLLM y TGI para servir el modelo base con el adaptador fusionado; llama.cpp/Ollama solo si se convierte el modelo fusionado a GGUF (no documentado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed-Qwen3-4B | Adaptador sobre ~4B | No disponible | Cardiologia (ingles) | Apache 2.0 | Hugging Face |
| Qwen3-Embedding-4B (base) | ~4B | No disponible | General | Apache 2.0 | Hugging Face |
| Otros modelos del estudio comparativo (9 arquitecturas) | No disponible | No disponible | Cardiologia | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos numericos de los modelos alternativos del estudio (arXiv:2511.19739) ni de otros embeddings medicos comparables, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Especializado en cardiologia: puede degradar el rendimiento en dominios medicos distintos o en texto general frente al modelo base.
- El unico dato de evaluacion publicado es una Separation Score de 0,446, sin benchmarks estandar que permitan una comparacion objetiva con alternativas.
- No es un modelo generativo: no responde preguntas ni produce texto, solo genera embeddings.
- Riesgo de sesgos heredados del corpus de libros de texto medicos y del modelo base Qwen3-Embedding-4B.
- No debe usarse como sustituto del juicio clinico; cualquier aplicacion en entorno sanitario requiere validacion y supervision profesional.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse tambien la licencia del modelo base Qwen3-Embedding-4B.
- El repositorio tiene muy pocas descargas y likes (20 y 1 respectivamente), lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/CardioEmbed-Qwen3-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Paper: https://arxiv.org/abs/2511.19739
- Perfil del autor: https://deepneuro.ai/richard
