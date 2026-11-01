# mradermacher/Qwen3.6-Candid-Coder-35B-A3B-i1-GGUF

## Resumen

Qwen3.6-Candid-Coder-35B-A3B-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo DarkKitsune/Qwen3.6-Candid-Coder-35B-A3B, un modelo de lenguaje orientado a programacion y uso agentico con arquitectura de mezcla de expertos (MoE). El modelo base declara 35.505.251.456 parametros totales (unos 35,5 mil millones) y esta etiquetado por su autor como derivado de la familia Qwen 3.5/3.6, con capacidades de razonamiento, tool calling y vision.

Este repositorio no contiene pesos en precision original, sino las versiones cuantizadas en formato GGUF (conjunto i1, generadas con fichero imatrix) pensadas para su ejecucion con llama.cpp y herramientas compatibles. El autor del modelo base lo describe como "abliterated" y "uncensored", terminos que indican que se han eliminado o atenuado las capas de rechazo del modelo original, lo que tiene implicaciones importantes para su uso en produccion.

El interes practico del repositorio radica en que permite ejecutar un modelo de 35B con activacion dispersa en hardware de consumo o en servidores modestos, gracias a las cuantizaciones de 2 a 4 bits. La informacion disponible es limitada: no se publican resultados de benchmarks, ni detalles del dataset de entrenamiento, ni la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, segun los tags del modelo base (qwen3.5/3.6); detalles no disponibles |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible (el sufijo "A3B" sugiere aproximadamente 3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (en este repositorio); el autor lista ademas Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos (MoE) de aproximadamente 35,5B parametros totales, segun los datos de safetensors publicados. El sufijo "A3B" del nombre sugiere en la convencion habitual de la familia Qwen que se activan alrededor de 3B parametros por token, aunque la informacion proporcionada no lo confirma explicitamente. Los tags del modelo base incluyen referencias a qwen3.5, kat-coder, ornith, sage, reasoning y tool-use, lo que indica un entrenamiento orientado a tareas de codigo y flujos agenticos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. El modelo base se presenta como "abliterated" y "uncensored", lo que implica una modificacion post-entrenamiento destinada a eliminar los comportamientos de rechazo; no se detalla la metodologia empleada para ello. Este repositorio es una cuantizacion: mradermacher ha generado los ficheros GGUF a partir del modelo base usando ficheros imatrix, un proceso que optimiza la asignacion de bits por tensor para preservar la calidad en tasas de compresion bajas.

## Capacidades

- Generacion de texto y codigo, con enfasis declarado en programacion (tags coding y code).
- Razonamiento multi-paso (tags reasoning y agent).
- Soporte de tool calling / function calling (tag tool-use).
- Capacidades de agente para tareas encadenadas.
- Vision: el autor de la cuantizacion indica que es un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico; la informacion no confirma la arquitectura visual.
- Multilingue limitado: la model card declara unicamente ingles (en).
- Modo "uncensored"/"abliterated": ausencia o atenuacion de rechazos, segun los tags del autor.

## Casos de uso

- Asistencia de programacion en local: el modelo puede generar y completar codigo en entornos sin conexion usando llama.cpp con las cuantizaciones i1-Q4_K_S (20,5 GB), adecuadas para estaciones de trabajo con GPU de 24 GB.
- Agentes de automatizacion de tareas de desarrollo: el soporte declarado de tool calling permite integrarlo en pipelines que invocan herramientas externas (compiladores, linters, APIs de repositorios) dentro de bucles de razonamiento.
- Prototipado de asistentes tecnicos en ingles: al declarar solo ingles, es apropiado para documentacion tecnica, comentarios de codigo y conversaciones de soporte en ese idioma.
- Investigacion sobre modelos sin censura: util para estudiar el comportamiento de modelos abliterated en tareas de red teaming y evaluacion de seguridad, siempre en entornos controlados.
- Despliegue en hardware de consumo: las cuantizaciones de 2 y 3 bits (13,3 y 15,9 GB) permiten ejecutar un modelo de 35B en GPUs de 16-24 GB, con la perdida de calidad asociada.
- Generacion de codigo en flujos CI/CD: puede integrarse como servicio local compatible con la API de OpenAI (tag endpoints_compatible) para revisiones automatizadas de parches o generacion de tests.
- Analisis de capturas o diagramas: si se confirma la capacidad de vision mediante los ficheros mmproj del repositorio estatico, podria emplearse para interpretar diagramas de arquitectura o errores en pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: i1-Q2_K 13,3 GB; i1-IQ3_M 15,9 GB; i1-Q4_K_S 20,5 GB. Hay que anadir el espacio de contexto KV, que depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: RTX 4090 (24 GB) para i1-Q4_K_S; RTX 4080/4070 Ti Super (16 GB) para i1-IQ3_M; GPUs de 12-16 GB para i1-Q2_K con contexto reducido.
- Cabe en GPU de consumo: si, en las cuantizaciones de 2 y 3 bits en tarjetas de 16 GB o mas; la de 4 bits requiere 24 GB o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio y servidores compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con APIs tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-Candid-Coder-35B-A3B (este) | 35,5B totales (MoE) | no disponible | no disponible | GGUF / safetensors | Abliterated, orientado a codigo y agentes, solo ingles declarado |
| Qwen2.5-Coder-32B | 32,5B densos | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Referencia open source en codigo, multilingue |
| DeepSeek-Coder-V2-Lite | 15,7B totales (2,4B activos, MoE) | 128.000 tokens | licencia propia | safetensors, GGUF | MoE eficiente para codigo |
| Codestral-22B | 22B densos | 32.000 tokens | licencia no comercial | safetensors | Orientado a codigo, sin uso comercial libre |

La comparativa con Qwen2.5-Coder-32B y DeepSeek-Coder-V2-Lite se basa en caracteristicas publicas de esos modelos; no hay datos de rendimiento del modelo de esta ficha para confrontarlos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas con datos verificables.
- Modelo "abliterated" y "uncensored": se han atenuado los rechazos, lo que incrementa el riesgo de generar contenido danino, sesgado o inseguro; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Solo declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial; hay que contactar con el autor del modelo base antes de desplegarlo en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la ausencia de datos de evaluacion.
- La informacion sobre contexto, parametros activos y capacidades de vision es incompleta o inferida de los tags; conviene verificarla en el repositorio del modelo base.
- Las cuantizaciones de 2 y 3 bits degradan la calidad de forma notable; el propio autor recomienda IQ3_XXS sobre Q2_K.
- El repositorio ocupa 171,2 GB en total; la descarga de todas las variantes es costosa en disco y ancho de banda.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1): https://huggingface.co/mradermacher/Qwen3.6-Candid-Coder-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.6-Candid-Coder-35B-A3B-GGUF
- Modelo base: https://huggingface.co/DarkKitsune/Qwen3.6-Candid-Coder-35B-A3B
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-Candid-Coder-35B-A3B-i1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
