# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen3.6-35B-A3B-Uncensored-Genesis-Final, un modelo de lenguaje de arquitectura MoE (mixture of experts) con aproximadamente 35.505 millones de parámetros totales, publicado originalmente por el usuario LuffyTheFox. Las cuantizaciones han sido generadas por mradermacher mediante el método imatrix (importance matrix), lo que produce versiones de menor precisión con una pérdida de calidad más controlada que las cuantizaciones estáticas convencionales. El modelo se distribuye con licencia Apache 2.0 y está etiquetado como multimodal, con soporte declarado de visión, además de compatibilidad con transformers, vLLM y llama.cpp.

La relevancia de este repositorio es práctica: el modelo base en bfloat16 ocupa del orden de 71 GB, lo que lo hace inviable en hardware de consumo. Las cuantizaciones GGUF aquí publicadas reducen el peso a un rango que va desde aproximadamente 13,3 GB (i1-Q2_K) hasta más de 25 GB (Q5_K_M, Q6_K), permitiendo su despliegue en GPUs de consumo como la RTX 4090 o en configuraciones con memoria unificada. Al tratarse de una variante "uncensored" (sin alineamiento restrictivo declarado), resulta de interés para investigación sobre generación sin filtros, aunque esto conlleva implicaciones de seguridad que se detallan más abajo.

Se trata, en cualquier caso, de un repositorio con cero descargas y un solo "like" en el momento de la consulta, publicado el 4 de octubre de 2026 y actualizado el mismo día. No hay información publicada sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en transformer, segun etiquetas del repositorio; detalles no disponibles |
| Parametros totales | 35.505.251.456 (aproximadamente 35,5 mil millones) |
| Parametros activos | No disponible de forma explicita; la nomenclatura "A3B" del nombre sugiere alrededor de 3.000 millones de parametros activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, mas fichero imatrix |
| Idiomas soportados | Ingles y multilingue (segun etiquetas; sin desglose de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors con precision bfloat16 |
| Vision / multimodal | Si, segun etiquetas; los ficheros mmproj, si existen, estan en el repositorio estatico |
| Contexto de vLLM / transformers | Etiquetado como compatible con vLLM y transformers para la version bfloat16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de las etiquetas del repositorio, que indican que se trata de un modelo MoE (mixture of experts) con vision y capacidades multimodales, derivado de la familia Qwen (etiquetas qwen3.6 y qwen3.5). El nombre del modelo, "35B-A3B", sigue la convencion habitual en modelos MoE de indicar parametros totales y parametros activos por token, lo que situaria la activacion en torno a 3.000 millones de parametros, aunque este dato no se confirma de forma explicita en la informacion proporcionada.

Tampoco hay datos disponibles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineamiento como RLHF, DPO o similares. La etiqueta "uncensored" y "genesis" en el nombre sugiere que el modelo base fue sometido a un proceso de eliminacion o reduccion de los mecanismos de rechazo y filtrado de contenido, pero no se documenta el procedimiento. La innovacion tecnica relevante de este repositorio concreto no esta en el modelo, sino en el proceso de cuantizacion: el uso de una importance matrix (fichero imatrix) permite ponderar la cuantizacion segun la relevancia estadistica de cada peso, lo que mejora la perplejidad respecto a cuantizaciones estaticas equivalentes en tamano.

## Capacidades

- Generacion de texto conversacional, con etiqueta "conversational" en el repositorio.
- Razonamiento y generacion de codigo: presumiblemente heredadas del modelo base de la familia Qwen, aunque no se documentan de forma explicita.
- Procesamiento de vision: el modelo esta etiquetado como vision y multimodal, por lo que se espera soporte de entrada de imagenes junto a texto. No se confirma la naturaleza exacta del encoder visual.
- Soporte multilingue: etiquetado como "en" y "multilingual", sin lista detallada de idiomas.
- Compatibilidad con tool calling y agentes: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible.
- Generacion sin filtros de contenido: la variante "uncensored" implica una reduccion deliberada de las politicas de rechazo del modelo base.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM sin filtros declarados, comparando sus respuestas con las de variantes alineadas de la misma familia y analizando que tipos de contenido emergen cuando se retiran las capas de rechazo.
- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones i1-Q2_K (13,3 GB) e IQ3/IQ4 (en torno a 15-20 GB), el modelo puede ejecutarse en una RTX 4090 de 24 GB mediante llama.cpp u Ollama, sin necesidad de infraestructura en la nube.
- Analisis de documentos con componente visual: al estar etiquetado como modelo de vision, puede emplearse para extraer informacion de imagenes o capturas combinadas con texto, siempre que se disponga del fichero mmproj correspondiente y se valide su funcionamiento real.
- Prototipado de asistentes conversacionales sin restricciones tematicas: util en entornos de investigacion donde se necesita explorar respuestas sobre temas que los modelos alineados rechazan, como analisis de ficcion adulta o discurso sensible dentro de un marco controlado.
- Generacion de texto creativo sin censura: escritura de narrativa, guiones o contenido de ficcion con tematicas que los modelos con alineamiento estandar suelen declinar.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica tanto cuantizaciones estaticas como imatrix, lo que permite medir en un mismo modelo la degradacion de perplejidad segun el tipo y tamano de cuantizacion.
- Fine-tuning posterior sobre una base ya sin censura: util para investigadores que quieran partir de un checkpoint ya "desinhibido" y aplicar tecnicas de ajuste especificas sin tener que repetir el proceso de eliminacion de filtros.
- Procesamiento por lotes en servidor con vLLM: la version bfloat16 en safetensors es compatible con vLLM, lo que permite servir el modelo en produccion interna con throughput elevado si se dispone de GPUs de 80 GB o multiples GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las estimaciones de VRAM que siguen son orientativas y se derivan del numero de parametros y del tipo de cuantizacion, no de mediciones publicadas en el repositorio:

- i1-Q2_K: aproximadamente 13,3 GB de peso, segun el README. Cabria en GPUs de 16 GB o superiores, con contexto reducido.
- IQ2_M, IQ2_XS, IQ2_S: rango estimado de 13 a 15 GB.
- Q3_K_M, IQ3_M, IQ3_XS: rango estimado de 16 a 18 GB.
- IQ4_XS, small-IQ4_NL, Q4_K_S: rango estimado de 19 a 20 GB. Ajustado pero viable en una RTX 4090 de 24 GB con contexto moderado.
- Q4_K_M, Q4_0, Q4_1: rango estimado de 21 a 23 GB.
- Q5_K_S, Q5_K_M: rango estimado de 24 a 25 GB. Requiere 32 GB de VRAM o reparto entre GPU y CPU.
- Q6_K: rango estimado de 28 a 30 GB.
- bfloat16 (modelo base en safetensors): aproximadamente 71 GB de pesos, mas cache KV. Requiere una H100 de 80 GB, A100 de 80 GB, o dos GPUs de 48 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 e inferiores; A6000 o L40S (48 GB) para Q6 y Q8; H100 o A100 de 80 GB para bfloat16; configuraciones multi-GPU para servir en vLLM con contexto largo.
- Memoria unificada: los equipos con Apple Silicon de 32 GB o mas, o GPUs con memoria compartida, pueden ejecutar cuantizaciones Q4 y Q5 con velocidades inferiores a las de una GPU dedicada.
- Opciones de despliegue: llama.cpp y llama-server (soporte nativo de GGUF), Ollama mediante Modelfile, LM Studio, koboldcpp, y vLLM para la version bfloat16 en safetensors. Para el modo vision es imprescindible el fichero mmproj, que segun el README se aloja en el repositorio estatico de mradermacher.
- Latencia y throughput: no disponibles. En un modelo MoE con unos 3.000 millones de parametros activos, el throughput por token deberia ser sustancialmente mayor que el de un modelo denso de 35.000 millones, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento. La comparacion se limita a aspectos de formato y distribucion:

| Modelo o repositorio | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Este repositorio (i1-GGUF de mradermacher) | 35,5 mil millones totales | GGUF cuantizado con imatrix | Apache 2.0 | Cuantizaciones ponderadas por importance matrix |
| LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors | 35,5 mil millones totales | Safetensors, bfloat16 | Apache 2.0 | Modelo base, sin cuantizar |
| mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-GGUF | 35,5 mil millones totales | GGUF estatico | Apache 2.0 | Incluye los ficheros mmproj para vision, segun el README |
| Modelos MoE abiertos de la familia Qwen (por ejemplo, Qwen3-30B-A3B) | Variable | Safetensors y GGUF | Variable segun version | Referencia de categoria por tamano y arquitectura, pero sin datos comparativos disponibles en esta informacion |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ningun dato publicado de MMLU, HumanEval, GSM8K ni de evaluaciones de vision, por lo que el rendimiento real es desconocido.
- Falta de documentacion del modelo base: no se detalla la composicion del dataset, el numero de tokens de entrenamiento ni el proceso de alineamiento o desalineamiento aplicado.
- Naturaleza "uncensored": el modelo ha sido modificado para reducir los mecanismos de rechazo. Esto implica un riesgo elevado de generar contenido ofensivo, ilegal, peligroso o factualmente falso sin advertencia, y no es apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: sin datos de evaluacion no puede acotarse, pero los modelos sin alineamiento restrictivo tienden a mostrar una menor calibracion de la incertidumbre.
- Contexto desconocido: no se especifica la ventana de contexto, lo que dificulta planificar despliegues con documentos largos.
- Idiomas no desglosados: la etiqueta "multilingual" no incluye lista de idiomas ni garantia de calidad fuera del ingles.
- Soporte de vision no verificado: aunque el repositorio esta etiquetado como modelo de vision, los ficheros mmproj estan en un repositorio distinto y no se confirma que funcionen correctamente con todas las cuantizaciones.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad legal sobre el contenido generado, especialmente en jurisdicciones con normativa sobre contenido generado por IA.
- Traccion nula: cero descargas en el momento de la consulta, lo que significa que no hay validacion por parte de la comunidad ni informes de errores.
- Compatibilidad de la cuantizacion i1-Q2_K: el propio README advierte que IQ3_XXS suele ofrecer mejor calidad que i1-Q2_K, por lo que esta ultima debe considerarse una opcion de compromiso extremo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-i1-GGUF
- Modelo base: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-i1-GGUF
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
