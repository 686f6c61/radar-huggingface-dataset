# mradermacher/Holotron4-30B-A3B-GGUF

## Resumen

Holotron4-30B-A3B-GGUF es el repositorio de cuantizaciones en formato GGUF del modelo Hcompany/Holotron4-30B-A3B, publicado por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos de modelos abiertos. No se trata de un modelo nuevo, sino de una distribucion derivada: el modelo original lo desarrolla Hcompany y este repositorio ofrece once variantes GGUF de distintos tamanos para facilitar su ejecucion en hardware de consumo y en entornos de inferencia local.

El modelo cuenta con 31.577.940.288 parametros totales segun los datos de safetensors (aproximadamente 31,6B), y la nomenclatura "30B-A3B" del nombre apunta a una arquitectura de mezcla de expertos con del orden de 3B parametros activos por token, aunque la model card no confirma ni detalla esta arquitectura. La ficha del autor lo etiqueta con los terminos multimodal, computer-use, agent y conversational, lo que situa al modelo en el segmento de agentes capaces de interactuar con interfaces y ejecutar tareas multi-paso, no solo de generacion de texto.

Su relevancia practica esta en la disponibilidad de cuantizaciones que van desde los 18,0 GB (Q2_K, Q3_K_S) hasta los 33,7 GB (Q8_0), lo que permite desplegarlo desde una unica GPU de 24 GB hasta configuraciones de 40-80 GB, o incluso con offload parcial a CPU. La licencia es la NVIDIA Open Model Agreement, con implicaciones relevantes para uso comercial que conviene revisar antes de ponerlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; la nomenclatura "A3B" del nombre sugiere mezcla de expertos (MoE) con aproximadamente 3B parametros activos, dato no confirmado por el autor |
| Parametros totales | 31.577.940.288 (~31,6B) segun safetensors del modelo base |
| Parametros activos | no disponible oficialmente; el nombre indica "A3B" (aproximadamente 3B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estaticas: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-agreement (etiquetada como license:other) |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens utilizados, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, modos de razonamiento explicito, etc.). Toda la informacion arquitectonica disponible se reduce a lo que se deduce de la nomenclatura y de las etiquetas: "30B-A3B" apunta a un modelo de mezcla de expertos de unos 30B parametros totales con aproximadamente 3B activos, y las etiquetas "multimodal", "computer-use" y "agent" indican que el modelo esta disenado para tareas de agente con posible entrada visual (capturas de pantalla o interfaces), aunque el repositorio no detalla el componente de vision ni si se incluye un proyector multimodal (mmproj) junto a las cuantizaciones.

En cuanto al proceso de cuantizacion, mradermacher indica que se trata de cuantizaciones estaticas (quantize_version 2, salida con tensor quantised y conversion de tipo hf) y senala que las cuantizaciones ponderadas o con imatrix no estan disponibles por el momento, aunque pueden solicitarse mediante una discusion comunitaria. Las variantes publicadas cubren once niveles de compresion; la tabla del autor recomienda Q4_K_S y Q4_K_M como opciones "rapidas y recomendadas", Q6_K como "muy buena calidad" y Q8_0 como "rapida y mejor calidad", con Q3_K_M marcada explicitamente como de calidad inferior.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" y el pipeline declarado indican uso en dialogos multi-turno.
- Capacidades de agente: el modelo esta etiquetado como "agent", lo que apunta a ejecucion de tareas multi-paso y planificacion, si bien no se detallan protocolos concretos en la model card.
- Uso de ordenador (computer-use): la etiqueta "computer-use" sugiere interaccion con interfaces graficas, navegadores o entornos de escritorio, presumiblemente mediante entradas visuales.
- Multimodalidad: la etiqueta "multimodal" indica manejo de mas de una modalidad, aunque el repositorio no especifica que modalidades ni el formato de las entradas.
- Soporte de tool calling / function calling: no disponible como dato explicito; la orientacion a agentes lo hace plausible, pero no esta confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles ("language: en"). No se declara soporte de castellano ni de otros idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras capacidades especiales: no disponible mas alla de la etiqueta generica "multimodal".

## Casos de uso

- Automatizacion de tareas de interfaz grafica: dado su etiquetado como "computer-use", el modelo puede emplearse para interpretar pantallas y ejecutar secuencias de clics y escritura en flujos de trabajo repetitivos, como alta de registros en sistemas internos o extraccion de datos de aplicaciones de escritorio.
- Agentes autonomos multi-paso: en pipelines donde un agente debe planificar, invocar herramientas y verificar resultados, el modelo encaja por su orientacion a agentes, con la salvedad de que el soporte formal de function calling no esta documentado.
- Despliegue en hardware de una sola GPU de consumo: la cuantizacion Q4_K_M (24,6 GB) o Q3_K_S (18,0 GB) permite ejecutar el modelo en una estacion con 24 GB de VRAM, util para prototipado de agentes sin depender de APIs externas.
- Asistente conversacional en ingles para soporte interno: la etiqueta "conversational" y su naturaleza MoE (baja carga de computo por token) lo hacen adecuado para atender volumen alto de consultas en entornos restringidos a ingles.
- Entornos con requisitos de privacidad de datos: al poder ejecutarse en local con llama.cpp u Ollama, el modelo permite procesar informacion sensible sin enviarla a servicios en la nube, siempre que la licencia NVIDIA lo permita para el caso de uso concreto.
- Evaluacion e investigacion de modelos MoE: los once niveles de cuantizacion disponibles permiten estudiar la degradacion de calidad frente al modelo base en formato safetensors, por ejemplo comparando Q3_K_M con Q6_K sobre el mismo conjunto de tareas.
- Integracion en pipelines de CI/CD con hardware dedicado: las variantes Q4_K_S y Q4_K_M estan marcadas como "fast, recommended" por el autor y pueden desplegarse en nodos con GPU para tareas automatizadas de QA o generacion asistida, sujeto a la revision de licencia.
- Despliegue con offload parcial a CPU: las cuantizaciones mas bajas (Q2_K y Q3_K_S, 18,0 GB) permiten dividir capas entre GPU y RAM, habilitando escenarios de pruebas en equipos sin GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los resultados de busqueda web incluyen datos de MMLU, HumanEval, GSM8K, SWE-bench, OSWorld ni de ninguna otra evaluacion, ni para el modelo base Hcompany/Holotron4-30B-A3B ni para las variantes GGUF. Tampoco se proporcionan mediciones de perplejidad por tipo de cuantizacion; el autor solo enlaza un grafico generico de comparacion de tipos de cuantizacion (elaborado por ikawrakow) que no es especifico de este modelo.

## Requisitos de hardware

- VRAM estimada por cuantizacion (tamano de fichero en disco; hay que sumar entre 1 y 3 GB adicionales para cache KV y sobrecarga, mas el margen que consuma el contexto):
  - Q2_K: 18,0 GB.
  - Q3_K_S: 18,0 GB.
  - IQ4_XS: 18,3 GB.
  - Q3_K_M: 19,9 GB.
  - Q3_K_L: 20,8 GB.
  - Q4_K_S: 22,0 GB.
  - Q5_K_S: 23,9 GB.
  - Q4_K_M: 24,6 GB.
  - Q5_K_M: 26,1 GB.
  - Q6_K: 33,6 GB.
  - Q8_0: 33,7 GB.
- Cabe en GPU de consumo: las variantes de 18,0 a 22,0 GB (Q2_K, Q3_K_S, IQ4_XS, Q3_K_M, Q3_K_L, Q4_K_S) entran en una GPU de 24 GB como la RTX 4090 o la RTX 3090, con contexto limitado. Q4_K_M (24,6 GB) queda justo por encima de los 24 GB y exige ajustar contexto o hacer offload de algunas capas.
- GPU recomendadas: para Q4_K_M y Q5_K_* se recomienda una GPU de 32 GB o superior, o repartir el modelo entre dos GPU de 24 GB; para Q6_K y Q8_0 conviene una GPU de 40-48 GB (A100 40 GB, L40S 48 GB) o directamente una A100/H100 de 80 GB si se quiere contexto amplio y concurrencia.
- Alternativa con offload: llama.cpp permite dividir capas entre GPU y CPU, de modo que las variantes Q2_K y Q3_K_S pueden ejecutarse en equipos con 16 GB de VRAM y 32 GB de RAM del sistema, a costa de una latencia notablemente mayor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El soporte de vLLM y TGI para GGUF es limitado; para produccion con alto throughput probablemente convenga partir del modelo base en safetensors. La libreria declarada en el repositorio es transformers, orientada al uso del modelo base, no de los ficheros GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones ni para configuraciones de hardware concretas. Como referencia estructural, un modelo MoE con aproximadamente 3B parametros activos tiende a ofrecer un throughput alto por token generado, pero se trata de una estimacion general y no de un dato medido para este modelo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de sus cuantizaciones, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria (modelos MoE de alrededor de 30B parametros orientados a agentes y uso de ordenador). La informacion proporcionada no incluye ningun modelo de referencia con el que contrastar rendimiento, contexto o calidad.

La unica comparacion que puede hacerse con datos verificables es entre el modelo base y las cuantizaciones de este repositorio:

| Version | Formato | Parametros totales | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hcompany/Holotron4-30B-A3B (base) | transformers / safetensors | 31.577.940.288 | no disponible | nvidia-open-model-agreement | repositorio del autor original |
| mradermacher/Holotron4-30B-A3B-GGUF. Q2_K | GGUF | 31.577.940.288 | 18,0 GB | nvidia-open-model-agreement | descarga directa, 24 descargas, 0 likes |
| mradermacher/Holotron4-30B-A3B-GGUF. Q4_K_M | GGUF | 31.577.940.288 | 24,6 GB | nvidia-open-model-agreement | descarga directa, marcada como "fast, recommended" |
| mradermacher/Holotron4-30B-A3B-GGUF. Q8_0 | GGUF | 31.577.940.288 | 33,7 GB | nvidia-open-model-agreement | descarga directa, marcada como "fast, best quality" |

## Limitaciones y advertencias

- Documentacion muy escasa: la model card del repositorio se limita a describir el proceso de cuantizacion; no hay informacion sobre arquitectura, datos de entrenamiento, contexto maximo ni alineacion.
- Idiomas: el modelo declara unicamente soporte de ingles. No hay evidencia de capacidades en castellano, por lo que no es adecuado para productos dirigidos a usuarios hispanohablantes sin una evaluacion previa.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de fidelidad ni de tasas de error en tareas de agente, donde los fallos pueden tener consecuencias reales sobre sistemas y ficheros.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S comprimen el modelo hasta 18,0 GB y el propio autor marca Q3_K_M como "lower quality". En tareas de agente multi-paso, pequenos errores de decision se acumulan, por lo que estos niveles no son recomendables para produccion.
- Ausencia de cuantizaciones ponderadas o con imatrix: el autor indica que no estan disponibles y que podrian no llegar a publicarse, lo que limita las opciones de calidad intermedia.
- Licencia NVIDIA Open Model Agreement: es una licencia "other", no una licencia de codigo abierto estandar. Incluye condiciones especificas sobre uso comercial, redistribucion y atribucion que deben revisarse antes de integrar el modelo en un producto. Este repositorio hereda esas condiciones al ser un derivado.
- Procedencia del repositorio: se trata de una cuantizacion de terceros (mradermacher) a partir de los pesos de Hcompany. La trazabilidad de los ficheros GGUF depende del autor de la conversion, no del desarrollador original.
- Adopcion muy baja: 24 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion comunitaria de las cuantizaciones publicadas.
- Compatibilidad multimodal incierta: las etiquetas indican multimodalidad, pero la lista de ficheros publicada solo incluye ficheros GGUF de pesos; no se confirma la presencia de un proyector multimodal, por lo que las capacidades de vision podrian no estar disponibles en estas cuantizaciones.
- Fechas de publicacion: la ficha del repositorio indica creacion y actualizacion el 29 de septiembre de 2026.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Holotron4-30B-A3B-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holotron4-30B-A3B
- Pagina resumen de descargas del autor para este modelo: https://hf.tst.eu/model#Holotron4-30B-A3B-GGUF
- Listado de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Guia de uso de ficheros GGUF (referencia de TheBloke citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Pagina de peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable del hosting de la cuantizacion: https://www.nethype.de/
