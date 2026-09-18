# mradermacher/Bielik-PL-Minitron-7B-v3.0-Instruct-ungated-i1-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una coleccion de cuantizaciones GGUF del modelo `cpral/Bielik-PL-Minitron-7B-v3.0-Instruct-ungated`, publicada por el usuario mradermacher. El modelo original es una variante instruct de 7.476.678.656 parametros (dato real tomado del indice de safetensors) perteneciente a la familia Bielik-PL-Minitron, con licencia Apache 2.0 y orientacion multilingue declarada para polaco (`pl`), ingles (`en`) y otros idiomas. El trabajo de mradermacher se limita a la conversion y cuantizacion, no al entrenamiento ni al ajuste fino.

La relevancia practica de este repositorio es que permite ejecutar un modelo de ~7,5B parametros en hardware de consumo mediante cuantizacion de 1 a 6 bits. El autor ofrece dos familias de cuantizaciones: las estaticas (`...-GGUF`) y las ponderadas con imatrix que nos ocupan (`...-i1-GGUF`), que emplean una matriz de importancia para reducir la perdida de calidad en bits bajos. Los ficheros van desde 1,8 GB en `i1-IQ1_S` hasta tamanos superiores a 4,6 GB en `i1-Q4_K_M` y mas alla (el listado completo del repositorio ocupa 84,5 GB).

El modelo base incorpora la etiqueta `extra_gated_fields` en su model card original, pidiendo al usuario aceptar ser contactado para recibir feedback sobre los modelos Bielik. El repositorio cuantizado se marca como `ungated` (sin control de acceso), de ahi el sufijo del nombre. No se dispone de datos publicados sobre longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; el modelo base es un transformer de 7,48B parametros) |
| Parametros totales | 7.476.678.656 (dato real del indice de safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion ponderada por imatrix (prefijo `i1`): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | polaco (`pl`), ingles (`en`), multilingue (segun etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros cuantizados); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 84,5 GB |
| Fichero imatrix incluido | si (`...imatrix.gguf`, 0,1 GB), para generar cuantizaciones propias |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento. Lo unico verificable es que se trata de un modelo de 7.476.678.656 parametros con pesos almacenados originalmente en safetensors, que la model card del repositorio base declara licencia Apache 2.0 y que la variante se comercializa como `Instruct`, es decir, ajustada para seguir instrucciones y mantener conversaciones (la etiqueta `conversational` aparece en los tags del repositorio).

El sufijo `Minitron` del nombre remite a la convencion de nomenclatura empleada por NVIDIA para modelos obtenidos mediante poda estructurada y destilacion a partir de un modelo mayor, pero no hay confirmacion de ese procedimiento en la documentacion disponible, por lo que debe tratarse como una hipotesis de nomenclatura y no como un dato verificado. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

En lo que respecta a este repositorio concreto, la innovacion tecnica es la cuantizacion con imatrix: el autor genera una matriz de importancia a partir de datos de calibracion y la usa para ponderar el error de cuantizacion, lo que mejora la calidad respecto a las cuantizaciones estaticas del mismo tamano, especialmente en los niveles IQ1 a IQ3. El autor indica explicitamente que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y anota en la tabla que `i1-IQ3_S` "beats Q3_K*", que `i1-Q4_K_M` es la opcion "fast, recommended" y que `i1-Q4_K_S` ofrece la relacion optima entre tamano, velocidad y calidad.

## Capacidades

- Generacion de texto conversacional en formato instruct: el modelo base esta etiquetado como `Instruct`, por lo que responde a indicaciones y mantiene dialogos multi-turno.
- Generacion de texto general en polaco e ingles, con soporte multilingue declarado en los metadatos.
- Ejecucion local en CPU y GPU mediante el formato GGUF, con 24 niveles de cuantizacion distintos para adaptar el consumo de recursos.
- Uso como modelo base para cuantizaciones propias: el repositorio incluye el fichero imatrix necesario para replicar el proceso.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) para su despliegue como servicio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.
- Capacidades especificas de codigo o matematicas: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en polaco: el modelo esta ajustado para instrucciones y declara soporte nativo de polaco, lo que permite desplegar un asistente conversacional que responda a consultas de usuarios polacos sin necesidad de traduccion intermedia. El coste de inferencia es bajo gracias a las cuantizaciones de 4 bits de ~4,4-4,6 GB.
- Procesamiento de documentacion administrativa polaca: generacion de resumenes, reformulaciones y extraccion de respuestas a partir de textos en polaco, ejecutable en una estacion de trabajo con una unica GPU de consumo. Requiere validar previamente la longitud de contexto, que no esta documentada.
- Traduccion asistida polaco-ingles: al declarar ambos idiomas y capacidades multilingues, puede emplearse como motor de traduccion en flujos internos donde no se necesita calidad de modelo frontera pero si control sobre los datos (inferencia local, sin envio a terceros).
- Despliegue en entornos con hardware limitado: las cuantizaciones `i1-IQ2_*` y `i1-Q3_*` (2,2-4,1 GB) permiten ejecutar el modelo en GPUs con 4-8 GB de VRAM o incluso en CPU con RAM suficiente, lo que habilita su uso en portatiles y equipos de gama media.
- Investigacion sobre cuantizacion: el repositorio sirve como material de estudio para medir el impacto de la cuantizacion con imatrix frente a la estatica, ya que el autor publica ambas familias y el fichero imatrix de calibracion.
- Evaluacion comparativa de modelos polacos: sirve como punto de referencia de 7,5B parametros para comparar tecnicas de poda y destilacion (nomenclatura Minitron) frente a modelos polacos de tamano similar, siempre que se disponga de un conjunto de evaluacion propio en polaco.
- Generacion de contenido en pipelines internos: redaccion de borradores, clasificacion de textos y reformulacion de parrafos en lote, integrable mediante llama.cpp o servidores compatibles con la API de OpenAI.
- Base para ajuste fino adicional: con licencia Apache 2.0 y pesos en safetensors disponibles en el repositorio base, es posible aplicar LoRA o ajuste completo sobre el modelo original y cuantizar despues con las herramientas de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces recuperados corresponden a listados y fichas del automovil Volkswagen Tiguan (volkswagen.fr, lacentrale.fr, fr.wikipedia.org), completamente ajenos al ambito de la consulta. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: igual al tamano del fichero GGUF mas el cache KV y overhead del runtime. Con contexto desconocido, una estimacion conservadora es sumar entre 1 y 3 GB adicionales al tamano del fichero.

| Cuantizacion | Tamano del fichero (GB) | VRAM estimada en inferencia |
|---|---|---|
| i1-IQ1_S | 1,8 | ~3-4 GB |
| i1-IQ2_M | 2,7 | ~4-5 GB |
| i1-IQ3_M | 3,5 | ~5-6 GB |
| i1-IQ4_XS | 4,1 | ~5-7 GB |
| i1-Q4_K_S | 4,4 | ~6-7 GB |
| i1-Q4_K_M | 4,6 | ~6-8 GB |

Las cifras de VRAM son estimaciones derivadas del tamano de fichero declarado por el autor, no datos oficiales del repositorio.

- Cabe en GPU de consumo: si. `i1-Q4_K_M` (4,6 GB) entra con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs de 8 GB con contexto moderado. Las variantes `i1-IQ2_*` (2,2-2,7 GB) caben en GPUs de 4-6 GB y, con RAM suficiente, en ejecucion totalmente en CPU.
- GPUs recomendadas: para uso individual, RTX 3060 12 GB o RTX 4060 Ti 16 GB con `i1-Q4_K_S` o `i1-Q4_K_M`; para servicio con varias peticiones concurrentes, A100 40/80 GB o H100 siempre que se use el modelo sin cuantizar o cuantizaciones altas. Las cuantizaciones de 1-2 bits no aportan ventaja en GPUs con VRAM abundante.
- Opciones de despliegue: llama.cpp (runtime de referencia para GGUF), Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM y TGI soportan GGUF solo de forma parcial o mediante conversion, por lo que no son la via natural para estos ficheros; para vLLM o TGI conviene partir del modelo base en safetensors.
- Ficheros multiparte: el autor remite a los README de TheBloke para instrucciones sobre como concatenar ficheros divididos, lo que implica que algunas cuantizaciones pueden distribuirse en varias partes.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks, contexto o rendimiento de modelos alternativos, por lo que no es posible establecer una comparativa de rendimiento fiable. La unica comparacion sustentada en datos es entre las distintas versiones del mismo modelo:

| Version | Parametros | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cpral/Bielik-PL-Minitron-7B-v3.0-Instruct-ungated (base) | 7.476.678.656 | safetensors | no indicado | Apache 2.0 | HuggingFace, con campo gated de feedback |
| mradermacher/Bielik-PL-Minitron-7B-v3.0-Instruct-ungated-GGUF | 7.476.678.656 | GGUF estatico | no indicado | Apache 2.0 | HuggingFace |
| mradermacher/Bielik-PL-Minitron-7B-v3.0-Instruct-ungated-i1-GGUF (este) | 7.476.678.656 | GGUF con imatrix | 1,8-4,6 GB en los niveles listados | Apache 2.0 | HuggingFace |

Comparativa con otras familias de modelos polacos o multilingues de ~7B: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El autor no documenta evaluaciones de sesgo ni de toxicidad.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de 7,5B parametros; no hay evaluaciones publicadas que cuantifiquen la tasa de alucinacion en este modelo.
- Perdida de calidad por cuantizacion: las variantes de 1 y 2 bits (`i1-IQ1_S`, `i1-IQ1_M`, `i1-IQ2_XXS`) degradan notablemente la coherencia. El propio autor las etiqueta como "for the desperate", "mostly desperate" o "very low quality". Para uso en produccion se recomienda `i1-Q4_K_S`, `i1-Q4_K_M` o superior.
- Longitud de contexto desconocida: al no estar documentada, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de resumen de documentos extensos. Debe medirse antes de desplegar.
- Cobertura idiomatica: aunque se declaran `pl`, `en` y multilingue, no hay evaluaciones que cuantifiquen la calidad en castellano ni en otros idiomas distintos del polaco y el ingles.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene conservar los avisos de atribucion correspondientes y verificar la licencia del modelo base, que puede incluir condiciones adicionales derivadas de los datos de entrenamiento.
- Campo gated en el modelo base: la model card original incluye un campo de aceptacion para recibir feedback. Aunque este repositorio cuantizado se marca como `ungated`, el uso del modelo base puede requerir aceptar esas condiciones.
- Coleccion de cuantizaciones incompleta en el fragmento disponible: la lista de ficheros aparece truncada, por lo que los tamanos de `i1-Q4_1`, `i1-Q5_K_S`, `i1-Q5_K_M` y `i1-Q6_K` no se pueden confirmar.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y ningun informe independiente de calidad.
- Fecha de creacion registrada: 2026-09-17, dato que conviene contrastar con el calendario real de publicacion del modelo base.

## Enlaces

- Repositorio cuantizado (este modelo): https://huggingface.co/mradermacher/Bielik-PL-Minitron-7B-v3.0-Instruct-ungated-i1-GGUF
- Modelo base: https://huggingface.co/cpral/Bielik-PL-Minitron-7B-v3.0-Instruct-ungated
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Bielik-PL-Minitron-7B-v3.0-Instruct-ungated-GGUF
- Pagina de resumen y lista de descargas del autor: https://hf.tst.eu/model#Bielik-PL-Minitron-7B-v3.0-Instruct-ungated-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Busqueda web: los resultados obtenidos corresponden a paginas sobre el Volkswagen Tiguan (volkswagen.fr, lacentrale.fr, fr.wikipedia.org) y no guardan relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales.
