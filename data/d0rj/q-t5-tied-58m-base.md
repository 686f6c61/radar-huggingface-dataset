# d0rj/q-t5-tied-58M-base

## Resumen

q-t5-tied-58M-base es un modelo encoder-decoder diminuto de 57.707.040 parametros, desarrollado por el usuario d0rj dentro de una linea de trabajo denominada "tiny llm ablation", cuyo objetivo es medir el efecto de decisiones arquitectonicas concretas en modelos entrenados desde cero a muy pequeña escala. Se trata de una variante de la arquitectura T5 con pesos de embedding atados (tied embeddings, de ahi el sufijo "tied") y con integracion de etiquetas UL2, distribuida a traves de la libreria transformers con codigo personalizado (`custom_code`, tipo de modelo `qt5_tied`).

El modelo se entrena exclusivamente en ingles sobre el corpus HuggingFaceFW/fineweb-edu y su pipeline declarado es `text-generation`, aunque por arquitectura es un modelo text2text de tipo encoder-decoder, es decir, un modelo base sin ajuste por instrucciones ni RLHF. Su relevancia no esta en el rendimiento absoluto, sino en su papel como punto de comparacion reproducible frente a otros miembros de la misma ablacion, como d0rj/t5-moe-55M-base (54.858.240 parametros) y d0rj/q-51M-base (50.878.208 parametros), entrenados ambos con exactamente 3.932.160.000 tokens de origen en 15.000 pasos de optimizacion.

Al tratarse de un modelo de menos de 60 millones de parametros, es ejecutable en CPU, en GPUs de consumo muy modestas e incluso en dispositivos embebidos, lo que lo convierte en una pieza util para experimentacion academica sobre escalado, atado de embeddings y comparativas de arquitectura, pero no para tareas de produccion que exijan calidad de generacion o razonamiento. El repositorio no declara licencia y no acumula descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 con embeddings atados (tipo de modelo `qt5_tied`, etiquetas `ul2` y `encoder-decoder`), codigo personalizado |
| Parametros totales | 57.707.040 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible; las evaluaciones publicadas usan `max_length` de 2048 tokens (1024 en ArithMark-3) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder en la tradicion T5, con la particularidad de que los embeddings de entrada y de salida estan atados, lo que reduce el recuento de parametros y es precisamente la variable que esta ablacion pretende aislar. El modelo incorpora etiquetas UL2 y esta registrado como `Qt5Tied` con codigo personalizado, por lo que requiere `trust_remote_code=True` al cargarse desde transformers. No hay informacion publica disponible sobre el numero de capas, dimension del modelo, numero de cabezas de atencion ni vocabulario en la informacion proporcionada.

El entrenamiento se realizo desde cero (`from-scratch`) sobre el dataset HuggingFaceFW/fineweb-edu, un corpus educativo filtrado en ingles. Los modelos hermanos de la misma ablacion declaran exactamente 3.932.160.000 tokens de origen y 15.000 pasos de optimizacion, cifra que cabe atribuir tambien a este modelo como miembro del mismo experimento, aunque la model card consultada no la repite de forma explicita. No se documenta uso de RLHF, DPO ni ajuste por instrucciones: es un modelo estrictamente base o `pretrained`. Se registran trazas de TensorBoard en los metadatos del repositorio.

## Capacidades

- Generacion de texto en ingles mediante continuacion y formulaciones text2text, en su condicion de modelo base sin ajuste de instrucciones.
- Modelado de lenguaje y puntuacion de verosimilitud de continuaciones, que es precisamente el protocolo con el que se han publicado sus resultados.
- Tareas encoder-decoder clasicas: resumen extractivo, traduccion (solo hacia y desde ingles, sin garantias), respuesta a preguntas extractiva y reformulacion sencilla.
- Razonamiento de sentido comun limitado, con resultados cercanos al azar en la mayoria de las pruebas publicadas.
- Aritmetica basica de pocos digitos, con rendimiento bajo segun ArithMark-3.
- Soporte de tool calling / function calling: no disponible; no hay plantilla de chat ni formato de herramientas declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, exclusivamente ingles.
- Capacidades especiales (modo thinking, vision, audio): ninguna.

## Casos de uso

- Ablacion academica de atado de embeddings: comparar directamente este modelo con d0rj/q-51M-base y d0rj/t5-moe-55M-base sobre los mismos conjuntos de evaluacion permite cuantificar el efecto de atar embeddings y de la eleccion de arquitectura con presupuesto de tokens constante (3.932.160.000 tokens, 15.000 pasos).
- Docencia de arquitecturas encoder-decoder: al ser un T5 de menos de 60 millones de parametros con codigo accesible, sirve para ilustrar el flujo completo de preentrenamiento, tokenizacion y evaluacion en un portatil sin GPU.
- Pruebas de infraestructura y CI de despliegue: su tamano permite validar extremo a extremo pipelines de transformers, serializacion safetensors y configuraciones de cuantizacion en segundos, antes de escalar a modelos grandes.
- Baselines de investigacion: cualquier trabajo que proponga una mejora sobre modelos pequenos en ingles puede usarlo como referencia reproducible y barata frente a HellaSwag, ARC, PIQA, WinoGrande o BoolQ.
- Generacion de texto de bajo riesgo y alto volumen donde la calidad no es critica, como relleno de plantillas, etiquetado automatico preliminar o generacion de datos sinteticos para filtrar despues con un modelo mayor.
- Prototipado de puntuacion de verosimilitud: sirve para construir filtros de calidad de corpus (perplexity-based filtering) o detectores de texto improbable en ingles, aprovechando su naturaleza de modelo base.
- Inferencia en el borde o sin red: al ocupar del orden de 116 MB en bfloat16, cabe en dispositivos con recursos muy limitados donde no es viable ningun modelo de varios miles de millones de parametros.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card, todos con `num_few_shot = 0` y `dtype = bfloat16`. Las metricas no estan verificadas de forma independiente (`verified: false`) y la fecha de evaluacion declarada es 2026-10-01.

| Dataset | Metrica | Valor | Error estandar | IC 95% |
|---|---|---|---|---|
| HellaSwag (validation) | acc_norm | 0,2809 | 0,00449 | 0,2722 - 0,2898 |
| ARC-Easy (test) | acc_norm | 0,3771 | 0,00995 | 0,3578 - 0,3968 |
| ARC-Challenge (test) | acc_norm | 0,2295 | 0,01229 | 0,2064 - 0,2545 |
| PIQA (validation) | acc_norm | 0,5718 | 0,01154 | 0,5491 - 0,5943 |
| WinoGrande (validation) | acc | 0,5107 | 0,01405 | 0,4831 - 0,5381 |
| OpenBookQA (test) | acc_norm | 0,2720 | 0,01992 | 0,2348 - 0,3126 |
| BoolQ (validation) | acc | 0,5917 | 0,00860 | 0,5748 - 0,6085 |
| LAMBADA OpenAI (test) | acc | 0,2598 | 0,00611 | 0,2481 - 0,2720 |
| ArithMark-3 (train) | acc_norm | 0,3630 | 0,01521 | 0,3338 - 0,3933 |
| Balanced COPA (train) | acc | no disponible (dato truncado en la informacion proporcionada) | - | - |

El metodo de intervalo es Wilson al 95 % con aproximacion de independencia entre items. Los valores de HellaSwag, ARC-Challenge, OpenBookQA y LAMBADA se situan en el entorno del azar o por debajo de referencias habituales de modelos de su tamano, lo que es coherente con un modelo base de 58 millones de parametros entrenado con menos de 4.000 millones de tokens.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,12 GB en bfloat16 / float16, 0,23 GB en float32, 0,06 GB en int8 y 0,03-0,04 GB en cuantizacion de 4 bits. El repositorio ocupa 0,2 GB.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria. Funciona en RTX 3060, RTX 4090, T4, A100 y H100 sin aprovechar practicamente su capacidad; el cuello de botella sera el lanzamiento de kernels, no la memoria.
- Cabe sobradamente en GPU de consumo, en iGPU y en CPU. Tambien es viable en placas tipo Raspberry Pi o en moviles con runtime adecuado.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere el codigo personalizado del repositorio); exportacion a ONNX u otros runtimes compatibles con transformers. No se han publicado pesos GGUF ni recetas oficiales para llama.cpp, Ollama, vLLM o TGI, aunque la conversion a estos formatos es tecnicamente factible por el tamano del modelo. Se recomienda bfloat16 en hardware Ampere o superior y float32 en CPU.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Comparativa con los otros dos miembros conocidos de la misma ablacion "tiny llm ablation", entrenados con el mismo presupuesto de 3.932.160.000 tokens y 15.000 pasos de optimizacion. Los datos de benchmark de los modelos hermanos no se han proporcionado.

| Modelo | Parametros | Arquitectura | Contexto | Idioma | Licencia | Formatos |
|---|---|---|---|---|---|---|
| d0rj/q-t5-tied-58M-base | 57.707.040 | T5 encoder-decoder con embeddings atados | no disponible (evaluado a 2048) | en | no disponible | safetensors |
| d0rj/t5-moe-55M-base | 54.858.240 | T5 con capas MoE | no disponible | en | no disponible | no disponible |
| d0rj/q-51M-base | 50.878.208 | transformer (variante no especificada) | no disponible | en | no disponible | no disponible |
| google-t5/t5-small (referencia externa) | ~60 millones | T5 encoder-decoder | 512 tokens | multilingue (incluye en) | Apache 2.0 | safetensors, GGUF y otros mediante conversion |

Frente a t5-small, la diferencia relevante no es el numero de parametros, practicamente identico, sino la licencia: t5-small declara Apache 2.0 mientras que este repositorio no especifica ninguna, lo que en la practica impide un uso comercial con garantias. Los datos de benchmark de t5-small con este mismo protocolo no se han proporcionado, por lo que no se ofrece comparacion numerica.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican terminos de uso, lo que genera incertidumbre juridica y desaconseja su empleo en produccion o en productos comerciales sin aclaracion previa del autor.
- Modelo base sin ajuste por instrucciones ni alineacion: no sigue ordenes de forma fiable, no dispone de plantilla de chat y puede producir texto incoherente o repetitivo.
- Riesgo elevado de alucinacion y de afirmaciones factualmente incorrectas, especialmente en tareas de conocimiento y en generacion libre.
- Rendimiento cercano al azar en varias pruebas de sentido comun y comprension: HellaSwag 0,2809, ARC-Challenge 0,2295, OpenBookQA 0,2720 y LAMBADA 0,2598, con intervalos de confianza que en algunos casos solapan con el nivel de azar.
- Limitacion idiomatica estricta: solo ingles. No hay evidencia de competencia en castellano ni en ningun otro idioma.
- Contexto maximo no confirmado en la documentacion; los resultados se han medido con `max_length` de 2048 tokens, pero no se garantiza que el modelo haya sido entrenado con esa longitud.
- Requiere `trust_remote_code=True` y el codigo personalizado del repositorio (`qt5_tied`), lo que implica ejecutar codigo de terceros no auditado.
- Resultados de benchmark no verificados de forma independiente (`verified: false`) y con fecha de evaluacion declarada de 2026-10-01.
- Sin senales de adopcion: cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe comunidad que haya reportado comportamiento en produccion.
- Sesgos: no hay estudios publicados sobre sesgos de genero, raza o ideologia en este modelo; al entrenarse sobre fineweb-edu, hereda los sesgos de ese corpus filtrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d0rj/q-t5-tied-58M-base
- Modelo hermano con MoE: https://huggingface.co/d0rj/t5-moe-55M-base
- Modelo hermano de 51M: https://huggingface.co/d0rj/q-51M-base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de evaluacion HellaSwag: https://huggingface.co/datasets/Rowan/hellaswag
- Dataset de evaluacion ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
