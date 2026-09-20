# bielquants/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

El modelo identificado como `bielquants/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF` es una publicación de cuantizaciones GGUF realizada por el usuario bielquants sobre el modelo original de DavidAU `Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP`. Se trata, por tanto, de un derivado de terceros y no de un entrenamiento desde cero: el repositorio contiene los pesos ya entrenados por DavidAU, convertidos y cuantizados a distintos formatos GGUF (variantes "regular" y "MTP", generadas con imatrix) para facilitar su ejecución en hardware de consumo.

El modelo base es un fine tune multi-etapa y multi-fusión sobre la familia Qwen 3.6 de 27B parámetros (26.895.998.464 parámetros reales según los safetensors del repositorio). Según la model card del autor original, el objetivo del entrenamiento fue mejorar el seguimiento de instrucciones y la resolución de problemas sin degradar el modelo original, incorporando trazas de razonamiento (entre ellas datos descritos como provenientes de Claude Opus y GPT-5 vía el dataset Polaris) y un proceso previo de "abliteración" o *heretic* para eliminar rechazos. El autor afirma que es el primer fine tune de este tamaño en superar los 700 puntos en ARC-C tanto en 8 bits como en 4 bits, de ahí el sufijo "711".

Su relevancia actual es doble: por un lado, ofrece un modelo de ~27B con capacidades declaradas de razonamiento, código, escritura creativa y visión en un único paquete; por otro, la existencia de cuantizaciones de 4 bits y de variantes "MTP" apunta a un interés explícito por el despliegue local en GPUs de consumo. Conviene subrayar que toda la información de rendimiento disponible procede de la model card del autor original y no ha sido verificada de forma independiente en los datos consultados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de la familia Qwen 3.6 (transformer denso de ~27B segun el recuento de parametros). El autor no especifica capas, cabezas ni atencion |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica; no se describe una arquitectura MoE en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, en variantes "regular" y "MTP" (imatrix). La model card menciona explicitamente cuantizaciones de 8 bits y 4 bits, ademas de "otras adicionales". No se enumeran los niveles concretos (Q2_K, Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 465,1 GB con multiples cuantizaciones). El modelo base se entrena en bfloat16 |
| Pipeline declarado | image-text-to-text (soporte de vision) |
| Modelo base | DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP |
| Fecha de publicacion | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna en los datos proporcionados. El modelo hereda la estructura de la familia Qwen 3.6 de 27B (transformer denso, a juzgar por el recuento de parametros y por la ausencia de referencias a expertos o parametros activos), pero la model card no especifica numero de capas, dimension de la atencion, tipo de positional encoding ni longitud de contexto nativa. Tampoco se documenta la tokenizacion ni el vocabulario.

Respecto al entrenamiento, el autor describe el proceso como un "multi-stage fine tune, multi-fine tune y multi-stage merge": varias rondas de ajuste fino y varias fusiones de pesos, con evaluacion en cada etapa. La colaboracion incluye a Nightmedia (fusión y benchmarks), TeichAI (dataset Polaris), armand0e (trazas "Light Fable 5") y trohrbaugh (proceso *heretic* o de abliteración). Los datasets citados son `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`. Se menciona la inclusion de trazas ligeras de tipo Fable, trazas de razonamiento descritas como provenientes de Claude Opus y datos de GPT-5 no razonadores a traves de Polaris. El autor afirma explicitamente que no se hizo *benchmaxing* y que se realizaron pruebas humanas comparativas (lado a lado contra el modelo base) como validacion final. El sufijo "MTP" de las cuantizaciones se asocia habitualmente en el ecosistema a multi-token prediction o decodificacion especulativa, pero la informacion disponible no detalla su implementacion concreta. Este repositorio, en cualquier caso, solo contiene la conversion a GGUF: no aporta informacion nueva sobre el entrenamiento.

## Capacidades

- Generacion de texto generalista, con enfasis declarado en el seguimiento de instrucciones (instruction following) y en la resolucion de problemas.
- Modo de razonamiento o *thinking*: la model card y las etiquetas indican soporte explicito de razonamiento y de "thinking mode".
- Generacion de codigo: la etiqueta `coder` figura entre las capacidades declaradas.
- Escritura creativa y ficcion: narrativa, relato corto y roleplaying, aunque el autor aclara que el modelo no fue disenado especificamente para ello.
- Capacidades multimodales de vision: el pipeline declarado es `image-text-to-text` y la lista de caracteristicas incluye "Vision".
- Soporte multilingue limitado a ingles y chino.
- Sin censura / *uncensored*: el modelo ha sido sometido a un proceso de abliteracion (*heretic*) antes del ajuste, de modo que no aplica rechazos por contenido.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructura de inferencia tipo API.
- No se documenta en la informacion disponible soporte de tool calling, function calling ni de flujos de agentes multi-paso.

## Casos de uso

- Razonamiento local en hardware de consumo: gracias a las cuantizaciones de 4 bits, el modelo puede ejecutarse en una unica GPU de gama alta (RTX 4090/5090) con llama.cpp u Ollama, lo que permite disponer de un modelo de ~27B con modo de razonamiento sin enviar datos a servicios en la nube.
- Asistencia a la programacion en local: la etiqueta `coder` y el enfasis en resolucion de problemas lo hacen adecuado para autocompletado, explicacion de fragmentos de codigo y refactorizacion dentro de un IDE con backend local, evitando la fuga de codigo propietario a terceros.
- Escritura creativa y narrativa larga: para autores que necesitan generar ficcion sin filtros de contenido, con control de tono, genero y perspectiva de personaje. El autor incluye ejemplos de generacion orientados a escritura visceral y a roleplaying.
- Roleplay y personajes interactivos: el modelo mantiene personalidad y estilo en conversaciones multi-turno, lo que encaja en aplicaciones de entretenimiento conversacional o en simulaciones de personajes.
- Analisis de documentos con imagenes: el pipeline `image-text-to-text` permite tareas de descripcion de imagenes, extraccion de informacion de capturas o diagramas y respuesta sobre contenido visual combinado con texto.
- Investigacion sobre abliteracion y alineacion: resulta util como objeto de estudio para comparar el comportamiento de un modelo *uncensored* frente a su version alineada, evaluando que capacidades se conservan y cuales se degradan tras el proceso.
- Entornos con requisitos de soberania del dato: al poder desplegarse integramente en infraestructura propia (on-premise), es apto para organizaciones que no pueden usar APIs externas por motivos regulatorios o de confidencialidad.
- Generacion de texto en ingles y chino: traduccion, redaccion y resumen bilingue en esos dos idiomas, que son los unicos declarados.

## Benchmarks y rendimiento

No se han publicado resultados numericos detallados de benchmarks en la informacion disponible. La model card original ofrece afirmaciones cualitativas y relativas, pero no las tablas con puntuaciones concretas (MMLU, HumanEval, GSM8K, etc.). Lo unico verificable en el material aportado se resume a continuacion:

| Afirmacion del autor | Valor numerico publicado |
|---|---|
| Puntuacion ARC-C en 8 bits | Superior a 700 (de ahi el sufijo "711"); cifra exacta no disponible |
| Puntuacion ARC-C en 4 bits | Superior a 700; cifra exacta no disponible |
| Comparacion con Qwen 3.6 27B base | Supera el modelo base en 6 de 7 benchmarks y lo iguala en el septimo; las cifras por benchmark no se detallan |
| Comparacion con Qwen3.6-35B-A3B | Supera los 7 benchmarks de ese modelo; las cifras no se detallan |
| Metodologia | Pruebas en cada etapa de fine tune y fusion, mas validacion humana comparativa contra el modelo base |

Cualquier cifra adicional deberia considerarse no verificada. Los resultados proceden exclusivamente del autor del modelo base y de colaboradores citados, sin evaluacion independiente en los datos consultados.

## Requisitos de hardware

Las estimaciones siguientes son calculos a partir del recuento de parametros (26,9B) y no cifras publicadas por el autor.

| Cuantizacion | VRAM estimada (solo pesos) | GPU de referencia |
|---|---|---|
| BF16 | ~54 GB | A100 80 GB, H100 80 GB, 2x A6000 |
| Q8_0 | ~29 GB | A100 40 GB, 2x RTX 4090/3090 |
| Q6_K | ~22 GB | RTX 4090 24 GB con contexto reducido |
| Q5_K_M | ~19 GB | RTX 4090, RTX 5090 |
| Q4_K_M | ~16 GB | RTX 4090, 5090, 4080; contexto limitado |
| Q3_K_M | ~13 GB | RTX 4070 Ti, RTX 3080 12 GB |
| Q2_K | ~10 GB | GPUs de 12 GB o menos, con perdida de calidad apreciable |

- Cabe en GPU de consumo: si, en las cuantizaciones de 4 bits o inferiores, en tarjetas con 16 GB o mas de VRAM; en 2-3 bits en tarjetas de 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y llama-cpp-python. vLLM ofrece soporte de GGUF con limitaciones y puede no cubrir todas las variantes publicadas; TGI no soporta GGUF de forma nativa. La etiqueta `endpoints_compatible` del repositorio sugiere compatibilidad con plataformas de inferencia gestionada.
- Las variantes "MTP" se comercializan como la opcion mas rapida frente a las "regular", aunque no se aportan mediciones.
- Latencia y throughput: no disponibles. Dependeran de la cuantizacion, del ancho de banda de memoria de la GPU y de la longitud de contexto efectiva utilizada.
- Nota practica: el repositorio completo ocupa 465,1 GB, por lo que conviene descargar unicamente el archivo GGUF correspondiente a la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este modelo) | ~26,9B | No disponible | Supera al base en 6/7 benchmarks; ARC-C > 700 en 8 y 4 bits | Apache 2.0 | GGUF en HuggingFace |
| Qwen 3.6 27B (base, Team Qwen) | ~27B | No disponible | Referencia de comparacion; el fine tune afirma superarlo en 6 de 7 pruebas | Segun la licencia de Qwen | Pesos originales |
| Qwen3.6-35B-A3B | 35B totales (MoE, 3B activos) | No disponible | El autor afirma superarlo en los 7 benchmarks | Segun la licencia de Qwen | Pesos originales |
| Qwen3.6-40B-Fable-Fusion (variantes Eleanor-DECKARD y Grand Intelligence) | 40B | No disponible | Variantes mayores del mismo linaje | Apache 2.0 | GGUF en HuggingFace |

No se dispone de datos suficientes para comparar con modelos de otros fabricantes de tamano equivalente. Las cifras de rendimiento de la tabla proceden del autor y no de evaluaciones independientes.

## Limitaciones y advertencias

- Es un modelo *uncensored* / abliterated: no incorpora rechazos ante peticiones daninas o sensibles. Su uso en productos de cara al publico exige capas de moderacion externas.
- Riesgo de alucinacion no cuantificado: no se han publicado tasas de error ni evaluaciones de fidelidad factual.
- Proceso de abliteracion y fusion multiple de pesos: este tipo de intervenciones puede degradar capacidades de forma silenciosa. Aunque el autor afirma no haber danado el modelo base, no hay verificacion independiente.
- Idiomas limitados a ingles y chino. El rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de ventanas largas sin medirla previamente.
- Metricas no reproducibles en el material disponible: las afirmaciones sobre ARC-C por encima de 700 no incluyen cifras exactas ni configuracion de evaluacion en la informacion consultada.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial. Conviene revisar las condiciones de la licencia de la familia Qwen subyacente y de los datasets citados antes de un despliegue productivo.
- Repositorio de terceros: se trata de una cuantizacion, no de los pesos oficiales. La integridad de los archivos GGUF debe verificarse con los hashes publicados.
- Tamano del repositorio (465,1 GB) y numero de descargas registrado (0 en el momento de la consulta): el modelo es muy reciente y carece de validacion por parte de la comunidad.
- Contenido de la model card: incluye lenguaje promocional ("el modelo que temen", referencias a una supuesta "zona de inteligencia" propietaria). Estas afirmaciones no deben tomarse como evidencia tecnica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bielquants/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Variante de 40B Eleanor-DECKARD: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Variante de 40B Grand Intelligence: https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen 3.8 27B Cold Fusion: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen 3.8 27B TURBO Fable 738-882: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen 3.8 27B TWIN TURBO: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Modelo de control Qwen3.5 9B The Defiant Fable: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Dataset Polaris: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Resultados de la busqueda web: todas las referencias devueltas corresponden a fichas de seguridad y proveedores quimicos de n-decano (CAS 124-18-5) y no guardan ninguna relacion con el modelo. No se han encontrado papers, blogs ni repositorios adicionales relevantes para esta ficha.
