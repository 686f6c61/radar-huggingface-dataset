# cyttic/hmt-htrvt-geom3-s42

## Resumen

`cyttic/hmt-htrvt-geom3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el usuario `cyttic`, publicado en Hugging Face con licencia MIT. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en su primera ola (*wave 1*), con el modelo base `htrvt`, la estrategia de aumento `geom3` y la semilla 42. El modelo está entrenado sobre el conjunto `cyttic/hhd-optionb-split` (partición de entrenamiento sin los escritores de desarrollo) y evaluado sobre el test HHD Option-B.

Con 13.821.574 parámetros (unos 13,8 millones), se trata de un modelo compacto orientado a una tarea muy específica: la transcripción de texto manuscrito en hebreo (`he`). Utiliza una arquitectura de reconocimiento con cabecera CTC (*Connectionist Temporal Classification*), según indican sus etiquetas, y se distribuye en formato `safetensors` con un tamaño de repositorio de aproximadamente 0,1 GB.

Su relevancia es acotada y experimental: no es un modelo de propósito general, sino un artefacto de investigación para medir la transferencia de métricas bajo distintas estrategias de aumento de datos. El resultado reportado en la model card es un CER de 0,0635 y un WER de 0,2828 con decodificación voraz (*greedy*) y sin modelo de lenguaje, lo que permite comparar el efecto del aumento `geom3` frente a otras variantes del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (reconocimiento de texto manuscrito con cabecera CTC, segun etiquetas) |
| Parametros totales | 13.821.574 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que indican `htr` (reconocimiento de texto manuscrito) y `ctc` (Connectionist Temporal Classification). Esto sugiere un modelo de reconocimiento de secuencias (tipicamente una red convolucional o un transformer sobre imagenes de lineas de texto) con una cabecera CTC para alinear secuencias de caracteres sin segmentacion explicita. El numero de parametros (13,8 millones) es coherente con un modelo ligero de este tipo.

El entrenamiento se realizo sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, con la estrategia de aumento de datos `geom3` y semilla 42. No se especifican el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF/DPO (no aplicables en un modelo HTR). La evaluacion reportada usa decodificacion voraz sin modelo de lenguaje, lo que aísla el rendimiento del acustico/visual puro.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo sobre imagenes de lineas de texto.
- Decodificacion CTC con alineamiento implicito de caracteres.
- Evaluacion con decodificacion voraz (*greedy*) sin modelo de lenguaje.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades de vision general mas alla del reconocimiento de escritura.
- No dispone de modo *thinking* ni de procesamiento de audio.
- Monolingue: unicamente hebreo.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo puede transcribir lineas de texto escaneadas procedentes de colecciones historicas o administrativas, dado que esta entrenado especificamente sobre el corpus HHD.
- Investigacion sobre aumento de datos en HTR: sirve como punto de comparacion reproducible (semilla 42, aumento `geom3`) frente a otras variantes del estudio `htr-metrics-transfer`.
- Evaluacion de metricas de transferencia: permite medir CER y WER bajo decodificacion voraz sin modelo de lenguaje, aislando el efecto del aumento geometrico.
- Prototipado de pipelines OCR/HTR para hebreo: al ser un modelo de 13,8 millones de parametros y 0,1 GB, puede integrarse en entornos con recursos limitados para pruebas de concepto.
- Reproduccion de experimentos academicos: la semilla y la configuracion estan fijadas, lo que facilita la replicacion de resultados.
- Generacion de transcripciones base para post-procesado con un modelo de lenguaje externo: el modelo produce la salida CTC y un LM posterior podria corregir errores de diccionario.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0635 | Test HHD Option-B, decodificacion greedy, sin LM |
| WER | 0,2828 | Test HHD Option-B, decodificacion greedy, sin LM |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 13,8 millones de parametros en fp32 el modelo ocupa aproximadamente 55 MB, y en fp16 unos 28 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: si, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090 y similares.
- Opciones de despliegue: al ser `safetensors` con cabecera CTC, requiere el codigo de inferencia del autor o un framework compatible (PyTorch); no se indica soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (HTR en hebreo con CTC) ni sus metricas.

## Limitaciones y advertencias

- Modelo experimental de un estudio de aumento de datos; no esta pensado como producto final.
- Monolingue (hebreo) y entrenado sobre un corpus concreto (`hhd-optionb-split`); el rendimiento fuera de esa distribucion puede degradarse.
- WER de 0,2828 sin modelo de lenguaje, lo que implica una tasa de error por palabra considerable en produccion sin post-procesado.
- Riesgo de alucinacion y de sustituciones de caracteres propio de los modelos CTC, especialmente en escritura ambigua o degradada.
- Sesgos desconocidos: no se documentan sesgos especificos, pero el corpus de entrenamiento condiciona el estilo de escritura reconocido.
- Licencia MIT: permite uso comercial, pero no se ofrecen garantias sobre el rendimiento en dominios distintos al de entrenamiento.
- No se documentan requisitos de preprocesado de imagen ni formato de entrada, lo que exige revisar el codigo del autor para un uso correcto.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-geom3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
