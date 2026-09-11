# erdemKocaogluu/byt5-small-tr-normalizer

## Resumen

byt5-small-tr-normalizer es un modelo de normalizacion de texto en turco desarrollado por el usuario erdemKocaogluu, obtenido mediante ajuste fino de google/byt5-small. Su tarea es reescribir frases en turco informal, con faltas de ortografia, sin diacriticos turcos o con rasgos dialectales, y devolverlas en turco escrito estandar, conservando el significado y el orden de las palabras del original.

El modelo parte de la arquitectura byT5, un transformer encoder-decoder de tipo T5 con tokenizacion a nivel de byte: cada byte UTF-8 es un token y no existe vocabulario ni fusiones BPE. Esa decision lo hace robusto frente a escritura no estandar y errores mecanicos de tecleo. El checkpoint publicado tiene 299.637.760 parametros (unos 300 millones, equivalente a byT5-small) y se distribuye bajo licencia Apache 2.0.

Su relevancia practica esta en el preprocesado: buena parte del texto turco real que circula en redes, foros, chats y formularios web llega sin caracteres turcos (ç, ğ, ı, ö, ş, ü), con contracciones coloquiales y con erratas. Este modelo se situa como un paso de limpieza previo a otros sistemas de NLP, con evaluacion publicada sobre tres conjuntos de referencia humanamente escritos. La adopcion es todavia muy baja: a fecha del repositorio acumula 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 con tokenizacion a nivel de byte (byT5) |
| Parametros totales | 299.637.760 (aproximadamente 300 M) |
| Longitud de contexto | No disponible de forma explicita; byT5 usa embeddings posicionales relativos y el ejemplo de uso del autor genera con max_length=384 |
| Tipos de cuantizacion | No disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de byT5-small: un transformer encoder-decoder con atencion relativa, identico en estructura a T5 pero sustituyendo el tokenizador SentencePiece por una tokenizacion a nivel de byte. No hay vocabulario aprendido ni merges BPE; el modelo razona directamente sobre caracteres, lo que explica su resistencia a texto con erratas, caracteres ausentes y escritura puramente ASCII. El formato de entrada requiere prefijar la frase con `"düzelt: "` antes de pasarla al modelo.

Los datos de entrenamiento combinan dos fuentes. Por un lado, varios corpus publicos turcos que ya incluyen pares ruidoso/limpio: Turkish-OSCAR-GEC, GECTurk-generation, Turkish-GPT-GEC, turkish-chat-normalization-mini, turkish-text-normalization-1m, turkish_typo_validation, NoisyWikiTr y las filas en turco de noisy-sentences. Por otro, un generador de ruido basado en reglas construido para el proyecto, que inyecta errores controlados y etiquetados con precision en seis categorias: erratas a nivel de caracter, problemas de espaciado y fronteras de palabra, letras repetidas, fallos de armonia vocalica y diacriticos turcos, confusion entre la conjuncion `de/da` y el sufijo homografo, y desasciificacion (texto escrito sin caracteres turcos). Un conjunto de datos de restauracion de diacriticos fue evaluado pero descartado de la mezcla final.

El procedimiento de seleccion de checkpoint no se basa solo en la capacidad de corregir: durante el entrenamiento se evaluaron checkpoints periodicos sobre una particion de validacion con una puntuacion combinada que premia corregir frases ruidosas y penaliza alterar frases ya correctas, para desincentivar la sobrecorreccion. El checkpoint publicado es el de mayor puntuacion y sus pesos fueron verificados por hash antes de la publicacion. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Normalizacion de texto turco: convierte frases informales, dialectales o mal escritas en turco estandar escrito.
- Correccion de erratas a nivel de caracter y de palabras con espaciado incorrecto o unido.
- Restauracion de caracteres turcos (desasciificacion): reconstruye ç, ğ, ı, ö, ş, ü a partir de texto tecleado como c, g, i, o, s, u.
- Resolucion de la distincion ortografica entre la conjuncion `de/da` y el sufijo homografo.
- Correccion de fallos de armonia vocalica y de diacriticos.
- Reescritura de contracciones verbales coloquiales a su forma estandar.
- Generacion seq2seq pura: no dispone de tool calling, function calling, modo agentico ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Monolingue: entrenado y evaluado unicamente en turco.
- Preserva el significado y el orden de las palabras; no reordena ni reestructura la oracion.

## Casos de uso

- Preprocesado de pipelines de NLP en turco: normalizar el texto de entrada antes de tareas de etiquetado morfologico, analisis de dependencias, NER o analisis de sentimiento, de modo que los modelos posteriores no fallen por caracteres ausentes o palabras mal escritas.
- Moderacion y analisis de contenido generado por usuarios: limpiar comentarios de foros, redes sociales y secciones de noticias antes de clasificarlos o indexarlos, ya que el modelo reduce el WER a aproximadamente la mitad respecto a no corregir en los conjuntos tweets y wnut.
- Busqueda y recuperacion de informacion: normalizar las consultas escritas de forma rapida o sin caracteres turcos antes de enviarlas al motor de busqueda, aumentando la coincidencia con documentos escritos correctamente.
- Atencion al cliente en chat: corregir los mensajes entrantes de los usuarios antes de pasarlos a un clasificador de intenciones o a un sistema de respuestas, sin alterar el significado ni el orden de las palabras.
- Normalizacion de transcripciones ASR: las salidas de reconocimiento de voz en turco suelen carecer de diacriticos y puntuacion; este modelo es especialmente fuerte en correcciones mecanicas y deterministas como la desasciificacion, donde el mapeo de reglas es inequivoco.
- Limpieza de corpus scrapeados para entrenamiento: restaurar caracteres turcos y corregir erratas en texto extraido de la web antes de usarlo como datos de preentrenamiento o ajuste fino, tarea para la que se alimenta de los mismos corpus publicos que uso el autor.
- Correccion en aplicaciones de mensajeria y formularios: reescritura en tiempo real de textos cortos escritos con prisa, con una huella de memoria que permite ejecucion en CPU.
- Generacion de pares ruidoso/limpio para aumento de datos: aplicar el modelo en sentido inverso o combinarlo con el generador de ruido por reglas descrito en la model card para construir datasets supervisados de correccion gramatical en turco.

## Benchmarks y rendimiento

La model card publica evaluacion sobre tres conjuntos de referencia (gold sets) escritos por humanos, no vistos durante el entrenamiento. Se comparan frente a una linea base de "no corregir" usando WER (word error rate, menor es mejor), F1 y tasa de sobrecorreccion.

| Conjunto | n | WER (modelo) | WER (sin corregir) | F1 | Sobrecorreccion |
|---|---|---|---|---|---|
| tweets | 1.742 | 0,161 | 0,336 | 0,667 | 0,6 % |
| wnut | 713 | 0,216 | 0,399 | 0,621 | 1,2 % |
| boun | 507 | 0,093 | 0,129 | 0,590 | 4,3 % |

Segun el autor, el modelo aproximadamente reduce a la mitad el WER respecto a no aplicar ninguna correccion en los tres conjuntos, con una tasa de sobrecorreccion baja salvo en boun (4,3 %). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; los unicos datos numericos son los de esta tabla y el grafico `gold_wer_comparison.png` referenciado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,2 GB en precision completa (fp32) y aproximadamente 0,6 GB en fp16. La inferencia cabe holgadamente en menos de 2 GB de VRAM con fp16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. No se requiere A100, H100 ni tarjetas de gama alta. Una T4, una RTX 3060 o integradas modestas son suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y en muchas generaciones anteriores.
- CPU: la inferencia es apta para CPU segun el autor, lo que permite despliegue en servidores sin GPU.
- Apple Silicon (MPS): la model card advierte de que en MPS el modelo puede producir ocasionalmente salidas degeneradas; se recomienda CPU o CUDA.
- Opciones de despliegue: la referencia es transformers con `AutoTokenizer` y `AutoModelForSeq2SeqLM`. El autor no documenta integraciones con vLLM, TGI, llama.cpp, Ollama ni exportaciones GGUF u ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos directamente comparables con metricas publicadas sobre normalizacion de turco. La comparacion mas directa es con el modelo base del que deriva.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| erdemKocaogluu/byt5-small-tr-normalizer | 299,6 M | No especificado | WER 0,093-0,216 en tres gold sets turcos | Apache 2.0 | HuggingFace, 0 descargas, 1 like |
| google/byt5-small | 300 M (aproximado) | No especificado en la informacion disponible | No aplica a la tarea sin ajuste fino | Apache 2.0 | HuggingFace (modelo base oficial) |
| Otros correctores de turco ajustados sobre los corpus citados | No disponible | No disponible | No disponible | No disponible | No se han identificado en la busqueda web realizada |

La busqueda web asociada a esta ficha no devolvio resultados relacionados con el modelo ni con normalizacion de texto en turco; los unicos resultados obtenidos fueron paginas financieras sin relacion con el tema.

## Limitaciones y advertencias

- Generaliza muy bien a correcciones mecanicas y deterministas, como la desasciificacion, donde el mapeo de reglas es inequivoco.
- Es comparativamente mas debil con ruido organico de estilo humano que no se parece a los patrones sinteticos usados en el entrenamiento, y con frases informales largas y con multiples clausulas.
- Corrige ortografia, espaciado y errores internos de palabra; no reordena palabras ni reescribe la estructura de la oracion. No debe esperarse de el parafraseo ni mejora estilistica.
- Tasa de sobrecorreccion del 4,3 % en el conjunto boun, es decir, puede alterar texto que ya era correcto.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible; como modelo generativo seq2seq puede producir salidas no fieles a la entrada, especialmente fuera del dominio de entrenamiento.
- En Apple Silicon (MPS) puede generar ocasionalmente salidas degeneradas; se recomienda CPU o CUDA.
- Limitacion idiomatica estricta: solo turco. No se ha entrenado ni evaluado en otros idiomas.
- Sesgos: no se documenta ningun analisis de sesgos demograficos, dialectales o de genero. El modelo tiende a imponer el turco estandar, lo que puede eliminar variacion dialectal legitima.
- Licencia Apache 2.0, igual que el modelo base: permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia y de copyright.
- Adopcion y validacion comunitaria muy bajas: 0 descargas y 1 like en el momento de la consulta. Aunque el autor indica que los pesos fueron verificados por hash, no hay reproduccion independiente de los resultados de evaluacion.
- El enlace a la demo publica en Hugging Face Spaces aparece como "link to be added" en la model card, por lo que no esta disponible.
- No se documentan versiones cuantizadas ni formatos alternativos de pesos, lo que limita su uso en runtimes que no sean transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erdemKocaogluu/byt5-small-tr-normalizer
- Modelo base: https://huggingface.co/google/byt5-small
- Dataset asimokby/Turkish-OSCAR-GEC: https://huggingface.co/datasets/asimokby/Turkish-OSCAR-GEC
- Dataset mcemilg/GECTurk-generation: https://huggingface.co/datasets/mcemilg/GECTurk-generation
- Dataset asimokby/Turkish-GPT-GEC: https://huggingface.co/datasets/asimokby/Turkish-GPT-GEC
- Dataset yagmurtuncer/turkish-chat-normalization-mini: https://huggingface.co/datasets/yagmurtuncer/turkish-chat-normalization-mini
- Dataset GoktugD/turkish-text-normalization-1m: https://huggingface.co/datasets/GoktugD/turkish-text-normalization-1m
- Dataset burakaytan/turkish_typo_validation: https://huggingface.co/datasets/burakaytan/turkish_typo_validation
- Demo en Hugging Face Spaces: no disponible (la model card indica "link to be added")
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo, a byT5 para turco ni a normalizacion de texto en turco.
