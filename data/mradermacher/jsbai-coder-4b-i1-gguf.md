# mradermacher/JSBAI-Coder-4B-i1-GGUF

## Resumen

JSBAI-Coder-4B-i1-GGUF es el repositorio de cuantizaciones GGUF publicado por mradermacher sobre el modelo base jsbaicenter/JSBAI-Coder-4B, un modelo de 4.205.751.296 parametros (aproximadamente 4,2B) orientado a codigo agentico, razonamiento y uso de herramientas. El autor del modelo base es jsbaicenter y la cuantizacion la realiza mradermacher, conocido por generar versiones cuantizadas con imatrix para su ejecucion en hardware de consumo.

La relevancia de esta ficha radica en que se trata de un modelo de escala portatil ("laptop-scale", "on-device" segun las etiquetas del repositorio), disenado para ejecutarse localmente en equipos sin GPU de datacenter. El repositorio ofrece 25 variantes de cuantizacion que van desde 1,5 GB (IQ1_S) hasta 3,6 GB (Q6_K), lo que permite desplegarlo en portatiles con memoria unificada modesta o GPUs consumer de gama media.

El modelo fue entrenado con SFT y aprendizaje por refuerzo sobre el dataset nvidia/Nemotron-Post-Training-Dataset-v2, segun la model card. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. No se dispone de informacion publica en este repositorio sobre la longitud de contexto, la arquitectura interna ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card del repositorio de cuantizacion no la especifica) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (mas fichero imatrix .gguf para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El modelo base (jsbaicenter/JSBAI-Coder-4B) no incluye en este repositorio especificaciones sobre el tipo de transformer, el mecanismo de atencion ni la composicion exacta del dataset de preentrenamiento. Las etiquetas del repositorio indican que se emplearon tecnicas de SFT (supervised fine-tuning) y aprendizaje por refuerzo (reinforcement-learning como pipeline declarado), y el unico dataset de post-entrenamiento citado es nvidia/Nemotron-Post-Training-Dataset-v2.

La innovacion tecnica aportada por este repositorio concreto no esta en el modelo en si, sino en el proceso de cuantizacion: se emplean cuantizaciones ponderadas con imatrix (importancia matricial), calculadas a partir de un fichero imatrix de 0,1 GB generado especificamente para este modelo. Las cuantizaciones de la serie i1 con IQ (importance-aware quantization) suelen ofrecer mejor relacion tamano/calidad que las cuantizaciones estaticas equivalentes del mismo tamano, especialmente en rangos bajos (IQ2, IQ3). Ademas, el repositorio incluye un conjunto estatico de cuantizaciones alternativo en mradermacher/JSBAI-Coder-4B-GGUF.

## Capacidades

- Generacion de codigo: el modelo esta orientado a tareas de programacion, segun las etiquetas "agentic-coding" y su nombre (Coder).
- Razonamiento: la etiqueta "reasoning" y el pipeline de reinforcement learning sugieren capacidad de razonamiento multi-paso, aunque no se detalla el modo exacto (por ejemplo, si existe un modo "thinking" explicito).
- Uso de herramientas: la etiqueta "tool-use" indica soporte declarado de tool calling o function calling, requisito habitual en flujos agenticos.
- Flujos agenticos: las etiquetas "agentic-coding" y "tool-use" apuntan a integracion en agentes que planifican, ejecutan herramientas y verifican resultados.
- Ejecucion local: etiquetas "on-device" y "laptop-scale" indican que el modelo esta pensado para inferencia en dispositivo, no solo en servidor.
- Conversacional: la etiqueta "conversational" indica que esta ajustado para dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia basados en llama.cpp o similares.
- Idiomas: unicamente ingles declarado; no se anuncia soporte multilingue.
- Vision, audio u otras modalidades: no disponible (no se declaran).

## Casos de uso

- Asistente de programacion en el IDE: con una cuantizacion Q4_K_M (2,8 GB) el modelo puede ejecutarse en un portatil y ofrecer autocompletado, explicaciones y refactorizaciones de codigo sin enviar el codigo a un servicio externo, lo que es relevante en entornos con requisitos de confidencialidad.
- Agente de codigo con tool calling: gracias al soporte declarado de uso de herramientas, puede integrarse en agentes que invocan un interprete de comandos, un linter o una API de control de versiones para completar tareas de varios pasos (por ejemplo, crear un fichero, ejecutar tests y corregir errores).
- Revision automatizada en pipelines de CI/CD: el modelo puede analizar diffs y generar comentarios de revision sobre posibles errores o malas practicas; al ser pequeno y local, se puede ejecutar en runners sin GPU dedicada usando la cuantizacion IQ3_S (2,2 GB).
- Generacion de tests unitarios: el modelo puede producir esqueletos de tests y casos borde a partir de funciones existentes, integrándose en un flujo de pre-commit o en una tarea programada.
- Asistente de aprendizaje de programacion: en un entorno educativo o de autoformacion, un modelo de 4B ejecutado en local permite explicar fragmentos de codigo y responder dudas sin coste por token.
- Automatizacion de tareas de mantenimiento de repositorios: migracion de sintaxis obsoleta, actualizacion de dependencias en ficheros de configuracion o generacion de documentacion a partir de docstrings, ejecutado como proceso batch en una maquina de desarrollo.
- Prototipado rapido de herramientas CLI: desarrolladores que necesiten incrustar un asistente de codigo en una herramienta de linea de comandos pueden usar llama.cpp con la cuantizacion Q4_0 (2,6 GB) para obtener baja latencia en CPU.
- Despliegue en dispositivos con recursos limitados: las cuantizaciones IQ1_S e IQ1_M (1,5 GB) permiten probar el modelo en portatiles antiguos o en placas con memoria reducida, a costa de una perdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizacion ni los metadatos asociados incluyen puntuaciones de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluacion. Tampoco se proporcionan comparaciones con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del tamano de los ficheros GGUF, sin contar el contexto): aproximadamente 1,5-1,6 GB para IQ1_S/IQ1_M/IQ2_XXS; 1,7-1,8 GB para IQ2_XS/IQ2_S/IQ2_M; 2,0-2,5 GB para Q2_K, Q2_K_S, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M y Q3_K_L; 2,6-2,9 GB para IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M y Q4_1; 3,1-3,6 GB para Q5_K_S, Q5_K_M y Q6_K.
- Memoria adicional: hay que sumar el espacio para la cache KV, que depende de la longitud de contexto configurada (no disponible en la informacion proporcionada) y del numero de capas del modelo (tambien no disponible).
- GPU recomendadas: no se especifican en la informacion disponible. Por el rango de memoria, cabria en GPUs consumer con 4 GB o mas de VRAM para las cuantizaciones bajas y medias, y requeriria 6-8 GB para las cuantizaciones altas con contexto amplio.
- Cabe en GPU consumer: si, es el objetivo declarado del repositorio (etiquetas "on-device" y "laptop-scale"). Es viable en GPUs de gama media y en equipos con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con GGUF y el propio motor de Hugging Face con soporte GGUF. La etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia tipo llama.cpp. No se confirma soporte de vLLM o TGI para este repositorio concreto.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Fichero imatrix: el repositorio incluye un fichero imatrix de 0,1 GB util para generar cuantizaciones propias con el mismo conjunto de calibracion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| JSBAI-Coder-4B-i1-GGUF (este repositorio) | 4,2B | GGUF (25 cuantizaciones i1/imatrix) | apache-2.0 | no disponible | Cuantizaciones ponderadas con imatrix, tamano 1,5-3,6 GB |
| jsbaicenter/JSBAI-Coder-4B | 4,2B | safetensors (pesos originales) | apache-2.0 | no disponible | Modelo base sin cuantizar |
| mradermacher/JSBAI-Coder-4B-GGUF | 4,2B | GGUF (cuantizaciones estaticas) | apache-2.0 | no disponible | Alternativa al conjunto i1 de este repositorio |

No hay datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de otros desarrolladores de tamano similar (por ejemplo, modelos coder de 3B-4B de otras familias). La comparacion se limita, por tanto, a las variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- Idiomas: el unico idioma declarado es el ingles. No se garantiza un rendimiento correcto en castellano ni en otros idiomas, y es probable que la generacion de codigo con comentarios o documentacion en espanol degrade la calidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible. Los modelos de codigo entrenados sobre corpus publicos de repositorios tienden a reproducir sesgos presentes en ese material (estilos, licencias y practicas dominantes).
- Alucinacion: no se publican metricas de fiabilidad. En tareas de codigo, la alucinacion se manifiesta como APIs inexistentes, funciones inventadas o dependencias falsas; es necesario validar la salida con tests o revision humana.
- Longitud de contexto: no disponible. Esto impide planificar tareas que requieran analizar ficheros grandes o repositorios completos.
- Rendimiento: no hay benchmarks publicados, por lo que no se puede verificar la calidad frente a modelos de tamano comparable ni justificar su eleccion con datos objetivos.
- Trazabilidad de la cuantizacion: las cuantizaciones de baja precision (IQ1_S, IQ1_M, Q2_K, IQ2_XXS) implican una perdida de calidad significativa; la propia model card las etiqueta como "for the desperate" o "very low quality". Para uso en produccion se recomienda Q4_K_M o superior.
- Proceso de cuantizacion de terceros: el repositorio es obra de mradermacher, no del autor del modelo base. Aunque la licencia Apache 2.0 lo permite, conviene verificar la integridad de los ficheros.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el fichero de cambios. No se documentan restricciones adicionales de uso aceptable en la informacion proporcionada.
- Adopcion: solo 39 descargas y 0 "likes" en el momento de los datos, lo que indica una validacion comunitaria practicamente nula. Conviene tratarlo como un modelo experimental.
- Idiomas y contexto de entrenamiento del dataset de post-entrenamiento (nvidia/Nemotron-Post-Training-Dataset-v2) no se detallan en la informacion disponible, por lo que no se puede estimar el sesgo de dominio.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones i1: https://huggingface.co/mradermacher/JSBAI-Coder-4B-i1-GGUF
- Modelo base: https://huggingface.co/jsbaicenter/JSBAI-Coder-4B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/JSBAI-Coder-4B-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#JSBAI-Coder-4B-i1-GGUF
- Dataset de post-entrenamiento citado: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
