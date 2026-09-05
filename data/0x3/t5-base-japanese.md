# 0x3/t5-base-japanese

## Resumen

El modelo `0x3/t5-base-japanese` es una adaptación al japonés del T5 (Text-to-Text Transfer Transformer), desarrollada originalmente por sonoisa y publicada en HuggingFace bajo el identificador `sonoisa/t5-base-japanese`. El repositorio `0x3/t5-base-japanese` es una copia espejo de ese modelo, con los mismos pesos y configuración. Se trata de un modelo encoder-decoder preentrenado sobre aproximadamente 100 GB de texto japonés procedente de Wikipedia, OSCAR y CC-100, con el objetivo de servir como base para tareas de procesamiento de lenguaje natural en japonés mediante fine-tuning.

El modelo tiene 222 millones de parámetros, un tamaño intermedio dentro de la familia T5, y está pensado para tareas secuencia a secuencia como clasificación, respuesta a preguntas, resumen o traducción. Al ser un modelo solo preentrenado, no está listo para uso directo en producción sin un ajuste posterior. Su relevancia radica en que ofrece una alternativa ligera y específica para japonés frente a modelos multilingües más grandes, con un rendimiento competitivo en benchmarks como la clasificación de noticias de livedoor y el conjunto de preguntas JSQuAD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (Text-to-Text Transfer Transformer), encoder-decoder |
| Parametros totales | 222.903.552 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | safetensors (PyTorch/JAX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 original, un transformer encoder-decoder que unifica todas las tareas de NLP como problemas de transformación de texto a texto. Esta arquitectura permite entrenar el modelo en múltiples tareas con el mismo objetivo de preentrenamiento, lo que simplifica el fine-tuning posterior. El tokenizer empleado es SentencePiece, entrenado sobre la totalidad de los datos de Wikipedia japonesa.

El preentrenamiento se realizó sobre un corpus japonés de aproximadamente 100 GB compuesto por tres fuentes: el dump de Wikipedia japonesa del 6 de julio de 2020, el corpus japonés de OSCAR y el corpus japonés de CC-100. No se ha aplicado ningún proceso de alineación posterior como RLHF o DPO. El modelo se publica únicamente con pesos preentrenados, sin fine-tuning en tareas específicas, por lo que cualquier aplicación práctica requiere un ajuste supervisado previo.

## Capacidades

- Generacion de texto en japones: el modelo puede producir texto coherente en japones tras un fine-tuning adecuado.
- Clasificacion de texto: gracias a la arquitectura text-to-text, puede adaptarse a tareas de clasificacion de documentos, noticias o sentiment.
- Respuesta a preguntas: ha demostrado buen rendimiento en JSQuAD, un conjunto de preguntas y respuestas en japones.
- Resumen de documentos: puede generar resumenes de textos largos si se entrena con datos de resumen.
- Traduccion automatica: al ser un modelo secuencia a secuencia, puede fine-tunearse para traduccion japones-ingles u otros pares.
- Reescritura y correccion de texto: apto para tareas de parafraseo o correccion gramatical.
- No soporta tool calling, ni vision, ni audio, ni multimodalidad.
- No dispone de modo de razonamiento explicito (thinking mode).

## Casos de uso

- Clasificacion de noticias en japones: el modelo puede fine-tunearse sobre corpus como livedoor news para predecir la categoria de un articulo. La model card reporta una exactitud de 0.97 en este tipo de tarea, superando a google/mt5-small.
- Atencion al cliente automatizada: tras el fine-tuning con datos de conversaciones en japones, el modelo puede gestionar consultas de usuarios en entornos de texto, gracias a su arquitectura encoder-decoder que permite generar respuestas contextuales.
- Respuesta a preguntas sobre documentos internos: en combinacion con un sistema de recuperacion (RAG), el modelo puede extraer respuestas de un corpus de documentos corporativos en japones. El resultado de JSQuAD (EM=0.900, F1=0.945) indica una capacidad solida en extraccion de respuestas.
- Resumen automatico de articulos o actas: el modelo puede entrenarse para condensar textos largos en resumenes breves, util en medios de comunicacion o en entornos empresariales que manejan documentacion extensa.
- Traduccion de documentos comerciales: con un dataset paralelo japones-ingles, el modelo puede fine-tunearse para traducir correos, manuales o documentacion tecnica, manteniendo un coste computacional moderado al tener solo 222 millones de parametros.
- Correccion y reescritura de textos en japones: puede emplearse como asistente de redaccion para revisar gramatica o estilo en textos japoneses, tanto en entornos editoriales como en herramientas de productividad.
- Generacion de titulos o etiquetas: el modelo puede generar titulares o etiquetas a partir de un contenido, lo que resulta util para sistemas de recomendacion de contenido o para automatizar metadatos en CMS.

## Benchmarks y rendimiento

La model card incluye resultados de dos benchmarks en japones, comparando el modelo con google/mt5-small.

| Benchmark | Metrica | t5-base-japanese (222M) | google/mt5-small (300M) |
|---|---|---|---|
| livedoor news classification | Accuracy | 0.97 | 0.91 |
| livedoor news classification | Macro F1 | 0.96 | 0.90 |
| JSQuAD | EM | 0.900 | no disponible |
| JSQuAD | F1 | 0.945 | no disponible |

No se han publicado resultados en benchmarks genericos como MMLU, HumanEval, GSM8K o similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en precision FP32 (222M parametros x 4 bytes) y unos 0.5 GB en FP16. En la practica, con overhead del runtime, se recomienda entre 2 y 4 GB de VRAM para inferencia.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM, como una RTX 2060 o superior. Para fine-tuning se recomienda una GPU con 8-12 GB de VRAM, por ejemplo RTX 3060, RTX 4070 o A100.
- Si cabe en GPU de consumo: si, el modelo es ligero y puede ejecutarse en GPUs de gama media o incluso en CPU para inferencia de baja demanda.
- Opciones de despliegue: HuggingFace Transformers con PyTorch, JAX, y Text Generation Inference (TGI) para servicios de inferencia. Tambien puede ejecutarse en entornos CPU con la libreria transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en livedoor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0x3/t5-base-japanese | 222M | no disponible | Accuracy 0.97 | CC-BY-SA 4.0 | HuggingFace |
| google/mt5-small | 300M | no disponible | Accuracy 0.91 | Apache 2.0 | HuggingFace |
| google/t5-base | 220M | no disponible | no evaluado en japones | Apache 2.0 | HuggingFace |

El modelo se diferencia de google/mt5-small por estar entrenado exclusivamente en japones, lo que le permite alcanzar mayor precision en tareas de este idioma con un 25% menos de parametros. Frente a google/t5-base, que es un modelo en ingles, este modelo esta especializado en japones.

## Limitaciones y advertencias

- Sesgos conocidos: la model card advierte que el modelo puede generar contenido sesgado, eticamente cuestionable o danino debido a los sesgos presentes en los datos de entrenamiento. Se recomienda evaluar los resultados antes de su uso en aplicaciones reales.
- Riesgo de alucinacion: al ser un modelo de lenguaje generativo, existe riesgo de producir informacion falsa o inventada, especialmente si se usa sin un sistema de verificacion externo.
- Limitaciones de idioma: el modelo solo soporta japones. No puede procesar ni generar texto en otros idiomas.
- Longitud de contexto no especificada: no se ha publicado la ventana de contexto maxima. Se desconoce si el modelo soporta secuencias largas, por lo que debe validarse en cada caso de uso.
- Licencia CC-BY-SA 4.0: requiere atribucion y distribucion de obras derivadas bajo la misma licencia. El uso comercial es posible, pero debe cumplirse con los terminos de la licencia. Ademas, el modelo card indica que deben respetarse los terminos de uso de Common Crawl.
- Modelo solo preentrenado: no esta listo para uso en produccion sin fine-tuning. Cualquier aplicacion directa sin ajuste producira resultados de baja calidad.
- Repositorio con 0 descargas y 0 likes: es posible que se trate de una copia espejo del modelo original, lo que puede implicar que no se ha validado de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/0x3/t5-base-japanese
- Modelo original: https://huggingface.co/sonoisa/t5-base-japanese
- Repositorio de transferencia de aprendizaje: https://github.com/sonoisa/t5-japanese
- Pagina de overview: https://www.aimodels.fyi/models/huggingFace/t5-base-japanese-sonoisa
- Benchmark JGLUE: https://github.com/yahoojapan/JGLUE
