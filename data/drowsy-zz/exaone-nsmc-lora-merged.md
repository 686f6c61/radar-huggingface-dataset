# Drowsy-zZ/exaone-nsmc-lora-merged

## Resumen

`Drowsy-zZ/exaone-nsmc-lora-merged` es un modelo de generacion de texto publicado en HuggingFace por el usuario Drowsy-zZ. Se trata de un merge de un adaptador LoRA sobre una base de la familia EXAONE 4 (etiqueta `exaone4` en el repositorio), con 1.279.391.488 parametros totales segun los safetensors publicados y un repositorio de 2,6 GB. El nombre del repositorio sugiere que el ajuste se ha realizado sobre NSMC (Naver Sentiment Movie Corpus), un corpus de resenas de cine en coreano, aunque la model card no lo confirma en ningun momento.

La relevancia del modelo es limitada y muy especifica: no es un modelo fundacional ni una publicacion de investigacion, sino un artefacto derivado (fine-tune + merge) subido al Hub con 192 descargas y 0 likes en el momento de redactar esta ficha. Su interes practico esta en el nicho de clasificacion de sentimiento en coreano con modelos pequenos que caben en hardware de consumo, y como caso de estudio de la tecnica de fusion de adaptadores LoRA.

El principal problema a la hora de evaluarlo es documental: la model card es la plantilla automatica de HuggingFace sin cumplimentar, con todos los campos marcados como `[More Information Needed]`. No hay informacion sobre datos de entrenamiento, hiperparametros, licencia, idiomas, evaluacion ni uso previsto. Cualquier despliegue en produccion exige verificar primero la licencia de la familia base y validar el comportamiento real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia EXAONE 4 (etiqueta `exaone4`); detalles no disponibles |
| Parametros totales | 1.279.391.488 (dato extraido de los safetensors del repositorio) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors (~2,6 GB, consistente con pesos en fp16/bf16) |
| Idiomas soportados | no disponible (el nombre `nsmc` apunta a coreano, sin confirmacion en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta mas alla de la etiqueta `exaone4` del repositorio, que lo vincula a la familia EXAONE 4 de LG AI Research. El recuento de parametros (aproximadamente 1,28 mil millones) y el tamano del repositorio (2,6 GB) son compatibles con un transformer decoder-only denso de esa escala en precision de 16 bits. La ficha no documenta si se emplearon atencion con ventana deslizante, atencion global, GQA ni ninguna otra variante, por lo que no se puede confirmar.

Tampoco se detallan los datos de entrenamiento, el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO. El unico indicio sobre el ajuste es el propio nombre del repositorio: `nsmc` remite al Naver Sentiment Movie Corpus, y `lora-merged` indica que se entreno un adaptador de bajo rango y posteriormente se fusiono con los pesos base para producir un unico checkpoint. No se especifican el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni la estrategia de fusion. La model card no menciona ninguna innovacion tecnica ni resultados de validacion del merge.

## Capacidades

- Generacion de texto autoregresiva dentro de la clase `text-generation` y con etiqueta `conversational`, es decir, admite el formato de chat de la plantilla de transformers.
- Clasificacion de sentimiento como tarea generativa: por el nombre del repositorio, el ajuste apunta a etiquetado de polaridad (positiva/negativa) sobre resenas, presumiblemente en coreano.
- Conversacion multi-turno: la etiqueta `conversational` sugiere soporte de historial de mensajes, aunque no hay ejemplos de uso ni plantilla documentada.
- Compatibilidad con HF Inference Endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio ni modo de razonamiento explicito (`thinking mode`).
- Capacidades multilingues: no disponibles; no se declara ningun idioma en el repositorio.

## Casos de uso

- Clasificacion de resenas en coreano: el modelo se puede emplear para etiquetar resenas de productos o peliculas como positivas o negativas, con la advertencia de que la evaluacion del ajuste no esta publicada y habria que medir exactitud y F1 sobre un conjunto de validacion propio antes de usarlo.
- Analitica de opinion en pipelines de datos: integrado como paso de etiquetado dentro de un pipeline tipo Spark, Airflow o similar, con inferencia por lotes sobre grandes volumenes de texto, aprovechando que el modelo es lo bastante pequeno para no requerir GPU dedicada.
- Moderacion de comentarios: deteccion de tono negativo o agresivo en foros y secciones de comentarios en coreano, siempre como filtro de primera pasada con revision humana posterior dado que no hay datos de precision publicados.
- Prototipado local en portatil: con 1,28 mil millones de parametros, sirve para iterar sobre prompts y formatos de salida en una maquina sin GPU, algo util para equipos que necesitan validar una idea de NLP coreano antes de invertir en un modelo mayor.
- Punto de partida para fine-tuning adicional: al ser un merge de LoRA, es un candidato razonable para seguir ajustando con QLoRA sobre dominios concretos (hoteleria, comercio electronico) si la licencia base lo permite.
- Investigacion sobre fusion de adaptadores: util como ejemplo empirico para estudiar como se comporta un merge de LoRA respecto al adaptador sin fusionar, comparando perplejidad y salidas sobre el mismo conjunto de prueba.
- Analisis de encuestas abiertas: procesamiento de respuestas de texto libre en coreano para agregar polaridad por pregunta, con muestreo manual de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye seccion de evaluacion, no reporta metricas sobre NSMC ni sobre conjuntos estandar como MMLU, GSM8K o HumanEval, y no hay ninguna comparacion con el modelo base sin ajustar.

## Requisitos de hardware

- Pesos en fp16/bf16: aproximadamente 2,56 GB de VRAM solo para los pesos (1.279.391.488 x 2 bytes), mas la cache KV segun la longitud de contexto, que no esta declarada.
- Pesos en int8: del orden de 1,3 GB; en int4, del orden de 0,7 GB, en ambos casos con conversion propia, ya que el repositorio no publica checkpoints cuantizados.
- Cabe en cualquier GPU de consumo actual: RTX 3060, RTX 4060, RTX 4070, RTX 4090, e incluso en GPUs de 4-6 GB si se cuantiza a 4 bits.
- Inferencia en CPU perfectamente viable; con 1,28 mil millones de parametros es un modelo manejable en un portatil moderno, con latencias mayores pero funcionales para procesos por lotes.
- GPU de centro de datos (A100, H100, L4, T4) sobredimensionadas para este tamano, salvo que se necesite un throughput muy alto con batching agresivo.
- Opciones de despliegue: `transformers` (libreria declarada en el repositorio), text-generation-inference y HF Inference Endpoints (etiqueta `endpoints_compatible`). Para vLLM, llama.cpp u Ollama habria que verificar el soporte de la arquitectura `exaone4` en la version correspondiente y, en el caso de llama.cpp y Ollama, convertir previamente los pesos a GGUF, conversion que no esta publicada en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos comparables, por lo que la tabla siguiente solo recoge lo verificable y marca el resto como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Drowsy-zZ/exaone-nsmc-lora-merged | 1.279.391.488 | no disponible | no disponible | Publicado en HuggingFace, 192 descargas, 0 likes |
| Modelo base EXAONE 4 de 1,2B (LG AI Research) | del mismo orden (no confirmado en esta busqueda) | no disponible | no disponible en esta busqueda | Referencia externa no verificada |
| Otras alternativas de ~1-2B (familia Qwen, Llama, Gemma) | no disponible en esta busqueda | no disponible | no disponible en esta busqueda | No evaluadas en esta ficha |

No se dispone de resultados de benchmarks que permitan situar este modelo frente a alternativas de su misma categoria, ni de datos que confirmen cual es exactamente el checkpoint base sobre el que se hizo el merge.

## Limitaciones y advertencias

- La model card es la plantilla automatica de HuggingFace sin editar: todos los campos relevantes (autoria, datos, licencia, idiomas, evaluacion) figuran como `[More Information Needed]`. No debe tratarse como documentacion fiable.
- Licencia no declarada. Al derivar de un modelo de la familia EXAONE, se heredan las condiciones de la licencia del modelo base, que hay que verificar en su repositorio oficial antes de cualquier uso, y muy especialmente antes de un uso comercial.
- No hay ninguna evaluacion publicada: se desconoce la calidad del ajuste, si el merge ha degradado las capacidades del modelo base o si el modelo conserva competencia general mas alla de la tarea de sentimiento.
- Riesgo de olvido catastrofico: al ser un fine-tune con LoRA fusionado sobre una tarea concreta, es esperable una perdida de capacidades generales y un sesgo fuerte hacia el formato de salida de la tarea de ajuste.
- Riesgo de alucinacion y de salidas mal calibradas en tareas conversacionales abiertas, ya que el ajuste apunta a clasificacion y no a dialogo general.
- Idioma: el nombre del repositorio apunta a coreano (NSMC), pero no se declara ningun idioma soportado. El comportamiento en castellano es desconocido y probablemente deficiente.
- Dominio estrecho: NSMC son resenas de cine; extrapolar su rendimiento a resenas de producto, redes sociales o texto informal no esta justificado sin validacion propia.
- Posibles sesgos procedentes del corpus de entrenamiento (NSMC contiene resenas polarizadas y ruido de etiquetado) y del modelo base, no documentados por el autor.
- Trazabilidad nula del proceso de entrenamiento: sin repositorio de codigo, sin dataset declarado, sin hiperparametros y sin semilla, el resultado no es reproducible.
- Validacion comunitaria practicamente inexistente: 0 likes y 192 descargas, sin issues ni discusiones.
- Para produccion, se recomienda tratar el modelo como un prototipo no auditado y no como un componente critico sin una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Drowsy-zZ/exaone-nsmc-lora-merged
- Referencia arXiv citada en las etiquetas del repositorio: https://arxiv.org/abs/1910.09700 (corresponde a Lacoste et al., sobre la estimacion de emisiones de carbono en aprendizaje automatico; aparece en la plantilla de la model card y no describe este modelo)
- Referencia externa no verificada a la familia base: https://huggingface.co/LGAI-EXAONE (no aparece en la busqueda web realizada; consultar la model card oficial del modelo base para licencia y especificaciones)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su autor: los resultados obtenidos correspondian a temas sin relacion (TikTok, archivos de fuentes tipograficas y foros de electronica), por lo que no se incluyen.
