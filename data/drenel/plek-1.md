# Drenel/plek-1

## Resumen

Plek-1 es un modelo de decisión denominado por su autor "System One Decision Model", publicado en Hugging Face por el usuario Drenel bajo licencia Apache 2.0. A diferencia de los modelos generativos autorregresivos que producen texto token a token, Plek-1 está diseñado para evaluar un conjunto de opciones candidatas de forma no autorregresiva, mediante una única pasada de puntuación de verosimilitud de secuencia, y devolver una distribución de probabilidad calibrada junto con una decisión estructurada en JSON. Su tarea declarada es la clasificación zero-shot.

El modelo cuenta con 783.150.080 parámetros (aproximadamente 783 millones) según los pesos en safetensors, y el repositorio ocupa 3,1 GB, un tamaño coherente con pesos almacenados en precisión de 32 bits. Está etiquetado únicamente para inglés y se distribuye con código personalizado, por lo que requiere `trust_remote_code=True` para cargarse con Transformers. La model card no especifica la arquitectura interna, la longitud de contexto soportada ni los datos de entrenamiento.

Su relevancia potencial reside en el enfoque: al no generar texto libre, el autor afirma que evita el riesgo de alucinación textual, algo atractivo para tareas de enrutamiento, triaje y clasificación en producción donde se necesita una salida determinista y estructurada. No obstante, el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha y no se han publicado resultados de benchmarks, por lo que su rendimiento real no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; descrito como modelo de decision no autorregresivo ("System One"), con puntuacion de verosimilitud de secuencia en una sola pasada |
| Parametros totales | 783.150.080 |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors en precision completa, 3,1 GB) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo personalizado (`custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La model card lo describe como un "System One Decision Model" de clasificacion no autorregresiva: en lugar de generar texto token a token, evalua en paralelo las opciones candidatas mediante una unica pasada de puntuacion de verosimilitud de secuencia y devuelve una distribucion de probabilidad calibrada. Por el numero de parametros (783 millones) y el tamano del repositorio, se trata de un modelo de escala media, pero se desconoce si la base es un transformer encoder, un decoder o una arquitectura hibrida.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de ajuste con RLHF, DPO u otra tecnica de alineacion, ni sobre innovaciones adicionales como decodificacion especulativa o atencion lineal. Tampoco se documenta el procedimiento de calibracion de probabilidades que el autor menciona en la model card.

## Capacidades

- Clasificacion zero-shot: asigna una etiqueta a un texto de entrada a partir de una lista de opciones candidatas definidas en tiempo de inferencia, sin reentrenamiento.
- Puntuacion de verosimilitud en una sola pasada: evalua todas las opciones candidatas en paralelo, de forma no autorregresiva.
- Salida de distribucion de probabilidad calibrada: devuelve `prediction`, `confidence` y `probabilities` para cada candidata.
- Decision estructurada multi-campo: mediante `predict_structured`, permite definir un esquema con varios campos (por ejemplo `intent`, `urgency` y `sentiment`) y obtener una salida JSON con una decision por campo.
- Orientacion a evitar alucinacion textual: al no generar texto libre, la salida se limita al espacio de etiquetas definido por el usuario.
- Soporte de tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no; el modelo esta etiquetado unicamente para ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una incidencia, el modelo puede asignar una categoria de una lista cerrada (por ejemplo, "Billing Issue", "Technical Bug", "Feature Request", "Spam"), tal y como muestra el ejemplo de la model card, y devolver la confianza asociada para enrutar el caso al equipo correcto.
- Clasificacion multi-etiqueta de mensajes de clientes: con `predict_structured` se puede obtener de una sola pasada la intencion, la urgencia y el sentimiento de un mensaje, lo que simplifica pipelines que de otro modo requeririan varios clasificadores independientes.
- Moderacion de contenido: evaluar un texto contra categorias predefinidas (spam, abuso, contenido valido) y usar el umbral de confianza para decidir si se requiere revision humana.
- Enrutamiento de intenciones en asistentes conversacionales: determinar la intencion del usuario antes de invocar un flujo o herramienta concreta, aprovechando que la salida es una etiqueta controlada y no texto generado.
- Etiquetado asistido de datos: usar el modelo como anotador preliminar en corpus en ingles para preclasificar ejemplos y reducir el trabajo de revision manual, siempre con validacion posterior.
- Analisis de encuestas y feedback abierto: mapear respuestas de texto libre a categorias cerradas (satisfaccion, motivo de queja, area de producto) para agregar resultados de forma cuantitativa.
- Filtrado previo en pipelines RAG: clasificar la consulta entrante para decidir si debe recuperarse documentacion, escalarse a un humano o descartarse, reduciendo coste antes de llamar a un modelo generativo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritmeticas derivadas del numero de parametros (783 millones), no datos publicados por el autor.

- Pesos en FP32: aproximadamente 3,1 GB (coincide con el tamano del repositorio).
- Pesos en FP16/BF16: aproximadamente 1,6 GB.
- Pesos en INT8: aproximadamente 0,8 GB.
- Pesos en INT4: aproximadamente 0,4 GB.
- VRAM total estimada: sumese a lo anterior el overhead de activaciones, el runtime de PyTorch y el codigo personalizado; en la practica, entre 2 y 4 GB en FP16 para lotes pequenos.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB pueden alojarlo con holgura, incluso en FP32. Tambien es probable que quepa en GPUs de 4-6 GB en cuantizacion, aunque esto no esta documentado.
- GPU de datacenter: A100, H100 o L40S no son necesarias por memoria, pero pueden aportar throughput en lotes grandes.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la via documentada. vLLM, TGI, llama.cpp y Ollama no estan soportados de forma nativa segun la informacion disponible, ya que el modelo no es autorregresivo y no se distribuye en GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Plek-1 para una comparacion cuantitativa. La tabla siguiente recoge caracteristicas publicas de alternativas habituales de clasificacion zero-shot, segun sus model cards; los datos de Plek-1 se limitan a lo publicado por su autor.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Plek-1 (Drenel) | 783.150.080 | no disponible | Apache 2.0 | Clasificacion no autorregresiva con decision estructurada |
| facebook/bart-large-mnli | 407 millones | 1024 tokens | MIT | NLI zero-shot autorregresivo (encoder-decoder) |
| MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli | aproximadamente 184 millones | 512 tokens | MIT | NLI zero-shot con encoder |
| microsoft/deberta-v3-large | aproximadamente 435 millones | 512 tokens | MIT | Encoder de proposito general, base para clasificacion |

Plek-1 es el unico de la lista que declara una salida estructurada multi-campo y un modo de decision no autorregresivo, pero tambien es el unico sin benchmarks publicados ni adopcion verificable.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 valoraciones en Hugging Face en el momento de redactar la ficha, y ningun benchmark publicado.
- Idiomas: unicamente ingles. No hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento con entradas largas, algo critico en clasificacion de documentos o conversaciones extensas.
- Riesgo de alucinacion: el autor afirma que la generacion no autorregresiva elimina la alucinacion textual, pero la salida sigue siendo una distribucion de probabilidad y puede asignar alta confianza a una etiqueta incorrecta. La calibracion declarada no esta verificada de forma independiente.
- Codigo personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio. Debe auditarse antes de usarlo en produccion.
- Sesgos: no disponibles. Al no documentarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de dominio, genero, raza u otros.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia. No se documentan restricciones adicionales de uso aceptable.
- Idoneidad para produccion: dado que no hay benchmarks, ni pruebas de robustez, ni historial de mantenimiento, no se recomienda desplegarlo en flujos criticos sin una evaluacion propia sobre datos representativos del dominio objetivo.
- Fecha de publicacion: el repositorio aparece creado y actualizado en septiembre de 2026, con una unica revision, lo que sugiere un proyecto en fase muy temprana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Drenel/plek-1
- La busqueda web realizada no devolvio ningun enlace relevante sobre el modelo: los resultados obtenidos trataban sobre fraudes relacionados con notarios y no guardan relacion con Plek-1 ni con inteligencia artificial. No se han encontrado papers, blogs, repositorios ni demos adicionales.
