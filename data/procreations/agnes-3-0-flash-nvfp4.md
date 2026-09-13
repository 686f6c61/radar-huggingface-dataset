# ProCreations/Agnes-3.0-Flash-NVFP4

## Resumen

Agnes-3.0-Flash-NVFP4 es una cuantizacion del checkpoint Agnes-3.0-Flash Preview publicada por el usuario ProCreations sobre el modelo base Agnes-AI/Agnes-3.0-Flash. Se trata de una conversion a NVFP4 (W4A4) sin datos de calibracion: no hubo entrenamiento, ni dataset de calibracion, ni optimizacion MSE/Hessiana. El objetivo es reducir el peso en disco y en memoria de un modelo multimodal de gran contexto, pasando de 66,18 GB en BF16 a 32,54 GB en este checkpoint, un 50,8 % menos.

El modelo base es un transformer hibrido con atencion global y atencion recurrente (18 capas de atencion global y 54 capas recurrentes, 72 capas de decodificador en total), con ramas FFN paralelas en cada capa, vision encoder y tensores MTP (multi-token prediction) retenidos en BF16. El pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto, y admite tool calling. El checkpoint fuente soporta una longitud de contexto de 262.144 tokens.

Su relevancia es acotada pero clara: es una de las primeras cuantizaciones NVFP4 publicadas de este modelo, con validacion tensor a tensor contra la fuente BF16 (1.017 tensores sin cuantizar verificados como identicos y 288 matrices empaquetadas con comprobaciones estructurales). La model card advierte de forma explicita de que estos pesos son distintos del checkpoint de produccion/API mas reciente de Agnes, cuyo contexto de 1M tokens y resultados no describen a este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion global y atencion recurrente (72 capas: 18 globales + 54 recurrentes), ramas FFN paralelas por capa, vision encoder y tensores MTP |
| Parametros totales | 20.963.694.128 (~21B) segun safetensors; la model card describe el checkpoint fuente como "33B" (discrepancia no explicada en la informacion disponible) |
| Parametros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | 262.144 tokens (checkpoint fuente) |
| Tipos de cuantizacion | NVFP4 W4A4 (E2M1, escalas de bloque E4M3, bloques de 16, escalado de pesos basado en maximo, escalas de activacion globales fijas en 1.0 con escalas dinamicas por bloque). No cuantizados: capas recurrentes, vision encoder, embeddings, cabeza de salida, normas y tensores MTP (BF16). KV cache sin cuantizacion a nivel de checkpoint |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 32,5 GB; ficheros de pesos de 32,54 GB), libreria modelopt, custom_code |

## Arquitectura y entrenamiento

El checkpoint base combina dos mecanismos de atencion en un mismo decodificador de 72 capas: 18 capas de atencion global y 54 capas de atencion recurrente. Cada capa de decodificador incorpora un FFN principal de anchura 17.408 y un FFN paralelo de anchura 2.048. Antes de cuantizar, ProCreations concateno ambas ramas en una anchura de 19.456 usando exactamente la concatenacion de tensores del cargador BF16 de SGLang (gate/up por filas y down por columnas), preservando su funcion algebraica y alineandose con la referencia BF16 servida; la model card advierte de que la aritmetica BF16 puede diferir ligeramente de evaluar y sumar ambas ramas por separado. El modelo incluye un vision encoder (capacidad image-text-to-text) y 15 tensores MTP para decodificacion especulativa, retenidos en BF16 aunque su uso no fue validado.

En cuanto al proceso de cuantizacion, es una conversion "data-free": los cuantizadores y las estadisticas de calibracion estaban desactivados y el export de ModelOpt solo inspecciono el grafo con dos tokens ficticios. Se cuantizaron a W4A4 NVFP4 los 72 MLP del decodificador (incluidas sus ramas FFN paralelas) y las proyecciones de las 18 capas de atencion global; las 54 capas de atencion recurrente con sus proyecciones y puertas permanecen en BF16 original. No hay informacion sobre el dataset de entrenamiento del modelo base, ni sobre fases de RLHF/DPO, ni sobre el numero de tokens utilizados: no disponible.

## Capacidades

- Generacion de texto y razonamiento en tareas de conocimiento y matematicas, con modo de pensamiento configurable (la evaluacion uso "thinking" de nivel `xhigh` en razonamiento general y lo desactivo en tareas cortas de formato exacto).
- Generacion de codigo ejecutable: la comparativa secundaria incluye HumanEval+ con codigo ejecutado (7/8 en NVFP4 y 7/8 en FP8), aunque la comparativa principal de codigo quedo sin terminar.
- Tool calling / function calling: soporte declarado en las etiquetas del repo y evaluado con casos de llamadas simples (32/32 en ambos formatos) y BFCL multi-turno.
- Agentes y razonamiento multi-paso: evaluado con BFCL multi-turn base y BFCL de contexto largo; la comparativa de flujos de trabajo sinteticos con herramientas largas quedo sin completar.
- Procesamiento de documentos e imagenes: pipeline image-text-to-text, con vision encoder en BF16 y prueba DocumentVQA por coincidencia exacta (90,62 % en NVFP4).
- Recuperacion en contexto largo: 12/12 en recuperacion simple con prompts de hasta 256.036 tokens reales.
- Salida estructurada multilingue: 32/32 en la prueba de JSON multilingue, identico al BF16.
- Capacidad multimodal adicional de video: los procesadores de imagen/video se conservan, pero las tareas de video no fueron evaluadas.
- Decodificacion especulativa mediante tensores MTP: presentes en el checkpoint, pero no validados.

## Casos de uso

- Atencion al cliente con historial largo: el modelo puede mantener conversaciones multi-turno apoyandose en su ventana de 262.144 tokens y en la recuperacion en contexto largo validada a 256.036 tokens reales, lo que permite adjuntar historiales completos de tickets sin trocear.
- Extraccion de datos de documentos con vision: al aceptar entradas image-text-to-text y conservar el vision encoder en BF16, es adecuado para digitalizar facturas, formularios o informes escaneados y devolver JSON estructurado, tarea en la que obtuvo 90,62 % de coincidencia exacta en DocumentVQA.
- Agente con tool calling en backoffice: las etiquetas del repo y las pruebas de llamadas simples y BFCL lo orientan a agentes que invocan APIs internas; conviene limitar el numero de pasos hasta completar la validacion de flujos largos, que quedo sin terminar.
- Asistente de codigo sobre repositorios: la puntuacion de 7/8 en HumanEval+ con codigo ejecutado sugiere uso viable para generacion y correccion de funciones, integrable en revisiones automatizadas.
- Razonamiento matematico y analisis cuantitativo: con 94,79 % en el subconjunto GSM8K de 96 casos, sirve para tutoria o verificacion de calculos en flujos donde el error residual es tolerable.
- Procesamiento multilingue de formularios y APIs: al obtener 32/32 en JSON multilingue, es apropiado para normalizar respuestas de servicios externos y generar payloads consistentes.
- Despliegue autoalojado en hardware Blackwell: al reducir el peso a 32,54 GB y no cuantizar el KV cache a nivel de checkpoint, encaja en nodos con GPU de generacion Blackwell donde se quiera servir un modelo multimodal de gran contexto con menor huella de memoria.
- Recuperacion aumentada sobre corpus extensos: los 12/12 en recuperacion larga lo hacen util para RAG con documentos completos en el prompt, si bien la recuperacion simple no garantiza retencion en flujos agenticos largos.

## Benchmarks y rendimiento

Comparativa principal: nueve subconjuntos diagnosticos completados, 408 casos emparejados, ejecutados sobre la fuente BF16 fijada y este checkpoint empaquetado, ambos en una RTX PRO 6000 con el mismo runtime SGLang, mismos prompts y mismos evaluadores. Son subconjuntos y diagnosticos propios, no puntuaciones oficiales de benchmark completo.

| Diagnostico | Casos | Fuente BF16 | NVFP4 simple |
|---|---:|---:|---:|
| GSM8K | 96 | 96,88 % | 94,79 % |
| MMLU-Pro | 84 | 79,76 % | 77,38 % |
| DocumentVQA (coincidencia exacta) | 64 | 92,19 % | 90,62 % |
| JSON multilingue | 32 | 100,00 % | 100,00 % |
| Llamadas a herramientas simples | 32 | 100,00 % | 100,00 % |
| Recuperacion larga | 12 | 100,00 % | 100,00 % |
| LongBench v2 | 24 | 54,17 % | 50,00 % |
| BFCL multi-turn base | 32 | 62,50 % | 59,38 % |
| BFCL contexto largo | 32 | 46,88 % | 43,75 % |

En los subconjuntos completados, NVFP4 obtuvo entre cero y dos casos correctos menos que BF16 por subconjunto. La suite ampliada se detuvo antes de terminar: codigo, uso de herramientas con parametros/funciones ausentes y flujos de trabajo sinteticos largos con herramientas quedaron incompletos (BF16 devolvio 439 casos y NVFP4 473, con 435 identificadores coincidentes).

Comparativa secundaria FP8 frente a NVFP4: 40 casos emparejados por modelo, una ejecucion cada uno, mismos prompts, tipo de GPU y runtime. En esta muestra pequena no aparecio una ventaja clara de calidad a favor de FP8.

| Diagnostico | FP8 | NVFP4 |
|---|---:|---:|
| GSM8K matematicas | 8/8 | 8/8 |
| MMLU-Pro razonamiento/conocimiento | 5/8 | 5/8 |
| HumanEval+ codigo ejecutable | 7/8 | 7/8 |
| Flujos de trabajo con herramientas personalizados | 6/8 | 7/8 |
| JSON multilingue | no disponible (fragmento truncado en la informacion proporcionada) | no disponible (fragmento truncado en la informacion proporcionada) |

No se midieron perplejidad ni KL de logits del profesor. No se evaluaron tareas de video, el limite exacto de 262.144 tokens, la decodificacion especulativa MTP ni agentes reales de repositorio o navegador.

## Requisitos de hardware

- VRAM estimada para inferencia: los ficheros de pesos ocupan 32,54 GB, por lo que se necesita al menos ese espacio solo para pesos, mas buffers de runtime y memoria de contexto. La KV cache no esta cuantizada a nivel de checkpoint, por lo que su coste crece con la longitud de contexto.
- GPU recomendadas: la evaluacion se ejecuto en una RTX PRO 6000. NVFP4 es un formato de la generacion Blackwell; en GPUs anteriores seria necesario reconvertir los pesos. No se dispone de datos de rendimiento en A100, H100 ni otras GPU.
- GPU de consumo: no cabe en GPUs de consumo con 24 GB de VRAM (RTX 4090 y similares), ya que solo los pesos superan los 32 GB. No hay datos para GPUs de consumo con 32 GB o mas.
- Opciones de despliegue: SGLang con el cargador incluido en el repo (libreria modelopt y custom_code); el cargador se adapto para reconocer las ramas ya combinadas y preservar las exclusiones de precision. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Ajustes de memoria documentados: BF16 uso `--mem-fraction-static 0.94 --max-mamba-cache-size 16` para prompts grandes; NVFP4 uso `--mem-fraction-static 0.88`. Las peticiones reanudadas emplearon un limite HTTP de 1.800 segundos.
- Latencia y throughput: no disponible. La informacion proporcionada no incluye medidas de tokens por segundo ni de tiempo por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Agnes-3.0-Flash-NVFP4 (este) | ~21B segun safetensors (la model card cita "33B" para la fuente) | 262.144 tokens | NVFP4, 32,54 GB | GSM8K 94,79 %; MMLU-Pro 77,38 %; JSON multilingue 100 % | apache-2.0 |
| Agnes-3.0-Flash Preview BF16 (fuente) | identico al anterior | 262.144 tokens | BF16, 66,18 GB | GSM8K 96,88 %; MMLU-Pro 79,76 %; JSON multilingue 100 % | no disponible en la informacion proporcionada |
| Variante FP8 acotada de Agnes-3.0-Flash | no disponible | no disponible | FP8 | GSM8K 8/8; MMLU-Pro 5/8; HumanEval+ 7/8; herramientas 6/8 | no disponible en la informacion proporcionada |
| Checkpoint de produccion/API de Agnes | no disponible | 1M tokens (no describe a este modelo) | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos de terceros de la misma categoria en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Cuantizacion sin calibracion: al no haber dataset de calibracion ni optimizacion MSE/Hessiana, y con escalas de activacion globales fijas en 1.0, la perdida de calidad puede variar de forma impredecible en cargas de trabajo no cubiertas por los diagnosticos.
- Cobertura de evaluacion incompleta: la suite ampliada se detuvo antes de terminar. Codigo, uso de herramientas con parametros o funciones ausentes y flujos agenticos sinteticos largos carecen de comparacion completada, y no se midieron perplejidad ni KL frente al profesor.
- La recuperacion simple no demuestra retencion en flujos agenticos largos: aunque ambos formatos pasaron 12/12 en recuperacion con prompts de hasta 256.036 tokens, la comparacion de flujos de trabajo largos con herramientas no tiene casos emparejados completados.
- No validado: decodificacion especulativa MTP (los tensores se conservan pero no se comprobo su funcionamiento), tareas de video, el limite exacto de 262.144 tokens y agentes reales de repositorio o navegador.
- Identidad del modelo: la model card advierte de que estos pesos son distintos del checkpoint de produccion/API mas reciente de Agnes y de que los resultados y el contexto de 1M tokens de ese checkpoint no describen a este modelo.
- Discrepancia de parametros: safetensors declara 20.963.694.128 parametros mientras la model card describe el checkpoint fuente como "33B"; la informacion disponible no explica la diferencia.
- Idiomas soportados: no disponible. Solo se ha validado una prueba de JSON multilingue sin detalle de los idiomas cubiertos.
- Riesgo de alusion y de sesgos: no hay informacion proporcionada sobre sesgos del modelo base ni sobre tasas de alucinacion en produccion.
- Licencia: el repositorio declara apache-2.0, pero conviene verificar los terminos del modelo base Agnes-AI/Agnes-3.0-Flash antes de un uso comercial, ya que la informacion proporcionada no incluye su licencia.
- Madurez del artefacto: el repositorio tiene 0 descargas y 1 "like" en el momento de la consulta, y depende de custom_code mas modelopt, lo que implica una ruta de despliegue menos estandarizada que un checkpoint BF16 convencional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/Agnes-3.0-Flash-NVFP4
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Comparativa completa por caso (referenciada en la model card como `native_comparison.json`, ruta relativa dentro del repositorio): https://huggingface.co/ProCreations/Agnes-3.0-Flash-NVFP4/blob/main/native_comparison.json
- Bibliografia, papers o repos adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo (unicamente paginas no pertinentes sobre citas y aforismos), por lo que no se pueden aportar enlaces externos verificados.
