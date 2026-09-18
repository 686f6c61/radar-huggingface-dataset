# kalyan-ks/ettin-tweet-emotion-32m-distilled

## Resumen

Ettin-tweet-emotion-32m-distilled es un clasificador de emociones en tuits desarrollado por el autor kalyan-ks. Se construye a partir del codificador jhu-clsp/ettin-encoder-32m (familia ModernBERT, segun las etiquetas del repositorio) y se afina sobre el conjunto de datos cardiffnlp/tweet_eval, tarea de clasificacion de emociones, mediante destilacion de conocimiento. El modelo profesor empleado en la destilacion es kalyan-ks/ettin-tweet-emotion-68m. La tarea consiste en asignar a cada tuit una de cuatro emociones: anger, joy, sadness u optimism.

El modelo cuenta con 32.032.516 parametros (aproximadamente 32 millones) y el repositorio ocupa 0,1 GB, por lo que esta disenado para inferencia de muy bajo coste. Alcanza 77,13 de accuracy y 73,62 de Macro F1 en el conjunto de test de emociones de TweetEval, segun la informacion publicada por el autor.

Su relevancia radica en ofrecer un clasificador ligero, con licencia MIT (uso comercial permitido) y compatible con el pipeline text-classification de Transformers y con text-embeddings-inference, para tareas de analisis emocional a gran escala sobre texto corto e informal en ingles. No es un modelo generativo: su unica funcion es la clasificacion en cuatro clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador (etiqueta modernbert; base jhu-clsp/ettin-encoder-32m) |
| Parametros totales | 32.032.516 (≈32 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer codificador bidireccional de tipo encoder-only (familia ModernBERT, segun la etiqueta del repositorio), adaptado a clasificacion de secuencias (text-classification) con una cabeza de clasificacion sobre cuatro clases. El punto de partida es el modelo jhu-clsp/ettin-encoder-32m, que aporta los pesos preentrenados del codificador.

El ajuste se realiza sobre el conjunto cardiffnlp/tweet_eval (tarea emotion) mediante destilacion de conocimiento, usando kalyan-ks/ettin-tweet-emotion-68m como modelo profesor. La destilacion permite que el estudiante de 32 M parametros aproxime el comportamiento del profesor de mayor tamano. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO (habitualmente no aplicables a un clasificador supervisado de este tipo). Tampoco se documentan innovaciones de atencion o decodificacion especulativa.

## Capacidades

- Clasificacion de texto en cuatro emociones: anger, joy, sadness y optimism.
- Inferencia sobre texto corto e informal, tipico de tuits (incluye ejemplos con hashtags y entidades HTML).
- Integracion directa con el pipeline text-classification de la libreria Transformers.
- Compatibilidad declarada con text-embeddings-inference y con endpoints compatibles de Hugging Face.
- Soporte multilingue: no; unicamente ingles (en).
- Generacion de texto: no; es un modelo discriminativo, no generativo.
- Tool calling / function calling: no disponible (no aplica a esta tarea).
- Soporte de agentes y razonamiento multi-paso: no; no es un modelo agentico.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Monitorizacion de redes sociales y opinion publica: clasificar grandes volumenes de tuits en tiempo real por emocion para detectar picos de enfado, tristeza u optimismo en torno a un tema o marca, aprovechando el bajo coste de un modelo de 32 M parametros.
- Analisis emocional de campanas de marketing: medir la reaccion emocional de la audiencia ante un lanzamiento, comparando la proporcion de joy frente a anger o sadness en las respuestas.
- Enrutamiento de tickets o menciones por tono emocional: usar la emocion detectada para priorizar quejas con carga de anger hacia equipos de soporte o gestion de crisis.
- Analisis de reacciones a lanzamientos de producto o eventos: procesar en lote (batch) miles de tuits tras un anuncio y construir series temporales de emocion.
- Investigacion academica en PLN y psicologia computacional: etiquetado automatico de corpus de texto corto para estudios de emocion, con un coste computacional que permite ejecutar el modelo en CPU.
- Etiquetado y preprocesado de datos a gran escala: generar anotaciones preliminares de emocion sobre corpus no etiquetados que despues se revisan manualmente (human-in-the-loop).
- Sistemas de alerta temprana en community management: detectar incrementos anormales de sadness o anger en menciones para activar protocolos de respuesta.
- Analisis de sentimiento emocional sobre datos historicos: aplicar retroactivamente el clasificador a archivos de tuits ya almacenados para enriquecerlos con etiquetas emocionales.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 77,13 | TweetEval emotion (test) |
| Macro F1 | 73,62 | TweetEval emotion (test) |

No se han publicado en la informacion disponible otros resultados de benchmarks (como MMLU, HumanEval o GSM8K), ni cifras del modelo profesor u otros comparables para contrastar estas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 aproximadamente 128 MB de pesos; en fp16 aproximadamente 64 MB; en int8 aproximadamente 32 MB. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo es viable incluso en iGPU y en CPU. No se requieren GPU de datacenter como A100 o H100.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en hardware muy limitado; tambien se puede ejecutar en CPU.
- Opciones de despliegue: pipeline text-classification de Transformers; text-embeddings-inference (etiqueta del repositorio); endpoints compatibles de Hugging Face.
- Latencia y throughput estimados: no disponible en la informacion proporcionada (el tamano reducido sugiere latencias de milisegundos y alto throughput en batch, pero no se aportan cifras oficiales).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ettin-tweet-emotion-32m-distilled | ≈32 M | no disponible | 77,13 | 73,62 | MIT | Hugging Face |
| ettin-tweet-emotion-68m (profesor) | ≈68 M | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Solo se dispone de datos del modelo profesor empleado en la destilacion. No se ha encontrado informacion de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse sobre tuits en ingles, puede heredar sesgos presentes en TweetEval relativos al registro, la demografia o los temas de ese corpus.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de clasificacion erronea (por ejemplo, ironia, sarcasmo o emociones mixtas).
- Limitaciones de contexto: la longitud maxima de contexto no se especifica en la informacion disponible.
- Limitaciones de idioma: solo ingles; el rendimiento en otros idiomas no esta garantizado.
- Limitacion de dominio: entrenado sobre texto corto e informal (tuits); puede degradarse en texto largo o formal.
- Solo cuatro clases: no distingue matices como miedo, sorpresa o disgusto, ni la intensidad de la emocion.
- Sensibilidad al preprocesado: los ejemplos de la model card muestran entidades HTML sin decodificar (por ejemplo, `&amp;`), lo que sugiere que la tokenizacion puede verse afectada por el formato del texto de entrada.
- Restricciones de licencia: licencia MIT, que permite uso comercial; no obstante, conviene verificar los terminos del dataset de origen (cardiffnlp/tweet_eval) si se redistribuyen datos.
- Caveats para produccion: la model card usa en el ejemplo de codigo la ruta `kalyan-ks/ettin-tweet-emotion-32m` (sin el sufijo `-distilled`), por lo que conviene confirmar el identificador exacto del repositorio antes de desplegarlo. Con 31 descargas y 0 likes en el momento de la consulta, el modelo tiene muy poca adopcion y validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kalyan-ks/ettin-tweet-emotion-32m-distilled
- Modelo profesor (ettin-tweet-emotion-68m): https://huggingface.co/kalyan-ks/ettin-tweet-emotion-68m
- Modelo base (ettin-encoder-32m): https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Conjunto de datos (TweetEval): https://huggingface.co/datasets/cardiffnlp/tweet_eval

La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre el modelo (los resultados se referian a la ciudad de Kalyan y a otros temas sin relacion).
