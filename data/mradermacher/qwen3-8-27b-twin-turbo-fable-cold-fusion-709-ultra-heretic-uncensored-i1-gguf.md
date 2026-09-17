# mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-i1-GGUF

## Resumen

Esta ficha describe la publicacion GGUF `mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-i1-GGUF`, una cuantizacion en formato GGUF del modelo `DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored`. El autor de la cuantizacion es mradermacher (nethype GmbH), mientras que el modelo original es un ajuste fino publicado por DavidAU. El recuento real de parametros, tomado de los safetensors del modelo base, es de 27.320.697.856 parametros (aproximadamente 27,3 mil millones), con un tamano de repositorio de 39,5 GB.

El nombre del modelo y las etiquetas (`qwen3_8`, `qwen3_6`) apuntan a la familia Qwen3 como origen, pero en la informacion disponible no se documenta de forma explicita cual es el checkpoint base oficial ni la arquitectura exacta. Se trata de un ajuste fino orientado a la eliminacion de restricciones de contenido ("uncensored", "heretic"), con entrenamiento declarado en multiples etapas ("Cold Fusion", "GAIN Training", "Multi-stage tuning") sobre datasets propios del autor (`Polar-STRICT`, `F451-STRICT`, `THE-DECKARD`).

La relevancia de esta publicacion es practica: pone a disposicion del ecosistema llama.cpp versiones cuantizadas con imatrix de un modelo de 27B que de otro modo requeriria hardware de gama alta. La model card afirma ademas que se trata de un modelo de vision, en cuyo caso los ficheros `mmproj` estarian en el repositorio de cuantizaciones estaticas. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags `qwen3_8` y `qwen3_6` sugieren arquitectura transformer de la familia Qwen3, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB) en este repositorio; ademas IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, IQ3_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K en el repositorio de cuantizaciones estaticas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1, es decir, con importance matrix); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 39,5 GB |
| Fichero imatrix | `Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored.imatrix.gguf` (0,1 GB) |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

No se proporciona informacion tecnica detallada sobre la arquitectura en la model card disponible. Los parametros totales (27.320.697.856) y las etiquetas `qwen3_8` y `qwen3_6` apuntan a un transformer denso de aproximadamente 27B derivado de la familia Qwen3, pero no se confirma el modelo base original, el tipo de atencion, el uso de GQA, la longitud de contexto nativa ni si incorpora componentes MoE. La model card del cuantizador tampoco especifica si el modelo base es multimodal real o si el texto "This is a vision model" es parte de la plantilla generica de mradermacher; en cualquier caso, los ficheros `mmproj`, si existen, no estan en este repositorio sino en el de cuantizaciones estaticas.

Respecto al entrenamiento, la informacion disponible indica un ajuste fino en multiples etapas ("Multi-stage tuning", "Cold Fusion", "GAIN Training") realizado por DavidAU sobre tres datasets propios: `DavidAU/Polar-STRICT-Datasets`, `DavidAU/F451-STRICT-Datasets` y `DavidAU/THE-DECKARD-Datasets`. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas `heretic` y `uncensored` describen la intencion del ajuste: reducir los rechazos y filtros de contenido del modelo original, presumiblemente mediante tecnicas de ablacion o fine-tuning dirigido. La cuantizacion se ha realizado con `unsloth` y con importance matrix (imatrix), lo que mejora la calidad frente a cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat (la etiqueta `conversational` esta presente y el modelo base esta pensado para uso general, "all use cases").
- Ajuste orientado a contenido sin censura: el modelo esta entrenado explicitamente para reducir rechazos ante peticiones que el modelo original rechazaria.
- Capacidad de vision: la model card afirma que es un modelo de vision, con ficheros `mmproj` en el repositorio de cuantizaciones estaticas. No verificable con la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades de codigo y matematicas: no documentadas en la informacion disponible.

## Casos de uso

- Generacion de texto conversacional en ingles con despliegue local: al estar disponible en GGUF cuantizado (desde 11,0 GB en i1-Q2_K), se puede ejecutar en estaciones de trabajo sin GPU de datacenter usando llama.cpp u Ollama, manteniendo los datos en la maquina del usuario.
- Investigacion sobre alineacion y censura: el modelo es util como sujeto de estudio para comparar el comportamiento de un checkpoint "uncensored" frente a su equivalente alineado, midiendo tasas de rechazo, degradacion de calidad y sesgos inducidos por el ajuste.
- Prototipado de asistentes de escritorio: integrable en aplicaciones tipo LM Studio o interfaces locales que consumen GGUF mediante llama.cpp, con el modelo como motor de generacion de texto.
- Generacion de texto creativo en ingles: narrativa, guiones o dialogos donde los filtros de contenido estrictos del modelo original resultan limitantes, aprovechando el ajuste "heretic".
- Evaluacion comparativa de cuantizaciones: la publicacion incluye fichero imatrix y varias quants, lo que permite medir la perdida de perplejidad entre i1-Q2_K, i1-IQ3_M y cuantizaciones mayores del repositorio estatico.
- Procesamiento por lotes de texto sin conexion: con 27,3B de parametros y cuantizaciones de 11-13 GB, es viable ejecutar tareas de generacion por lotes en una unica GPU de 24 GB o en CPU con RAM suficiente.
- Experimentacion con modelos multimodales, si se confirma la capacidad de vision: cargando el fichero `mmproj` del repositorio estatico, se podria usar para tareas de descripcion de imagenes o VQA en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador se limita a indicar los tamanos de los ficheros y a enlazar graficos genericos de comparacion de tipos de cuantizacion (perplejidad frente a tamano), sin cifras concretas para este modelo.

## Requisitos de hardware

- VRAM estimada en FP16 (modelo base en safetensors): aproximadamente 54,6 GB, calculado a partir de 27.320.697.856 parametros a 2 bytes por parametro (estimacion propia, no dato de la model card).
- VRAM estimada segun cuantizacion (estimaciones a partir del recuento de parametros; los dos primeros valores son tamanos de fichero reales publicados):
  - i1-Q2_K: 11,0 GB de fichero.
  - i1-IQ3_M: 12,9 GB de fichero.
  - Q4_K_M: aproximadamente 16-17 GB (estimado).
  - Q5_K_M: aproximadamente 19-20 GB (estimado).
  - Q6_K: aproximadamente 22-23 GB (estimado).
  - Q8_0: aproximadamente 29 GB (estimado).
- GPU recomendadas: para FP16, A100 80 GB o H100 80 GB. Para cuantizaciones de 4 bits, una RTX 4090 o RTX 3090 de 24 GB es suficiente. Para i1-Q2_K e i1-IQ3_M, cabe en GPUs de 16 GB (RTX 4080, A4000) y, en el caso de i1-Q2_K, en GPUs de 12 GB con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti Super con cuantizaciones Q4 o inferiores. En GPUs de 8 GB no cabe ninguna cuantizacion publicada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa; requeririan el modelo base en safetensors.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

La informacion disponible no incluye benchmarks ni contexto nativo, por lo que una comparacion de rendimiento no es posible. La siguiente tabla recoge unicamente datos estructurales verificables o de referencia publica ampliamente conocida; los campos no documentados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored (i1-GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF (i1) y safetensors en el modelo base |
| Qwen2.5-32B (referencia de la misma familia) | 32,5B | 131.072 tokens | Apache 2.0 | safetensors, GGUF en repositorios de terceros |
| Gemma 2 27B (referencia de tamano equivalente) | 27B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF en repositorios de terceros |
| Mistral Small 24B (referencia de tamano equivalente) | 24B | 32.768 tokens | Apache 2.0 | safetensors, GGUF en repositorios de terceros |

Nota: los datos de las tres alternativas proceden de conocimiento general de esos modelos y no de la busqueda web realizada, que no devolvio informacion relacionada con este modelo.

## Limitaciones y advertencias

- Modelo "uncensored": el ajuste elimina deliberadamente filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o danino. No es apto para aplicaciones orientadas al publico general sin capas adicionales de moderacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es el comportamiento esperado en modelos de 27B sin verificacion factual; el ajuste "uncensored" tiende ademas a reducir la cautela del modelo al expresar incertidumbre.
- Idiomas: unicamente ingles segun el campo `language`. El rendimiento en castellano no esta documentado y probablemente sea degradado.
- Contexto: no disponible. No se puede planificar un caso de uso con documentos largos sin conocer la ventana real del modelo base.
- Licencia: Apache 2.0 declarada en este repositorio y en el modelo base. Apache 2.0 permite uso comercial, pero conviene verificar que todos los componentes del modelo base (incluido el checkpoint Qwen3 subyacente) mantienen esa misma licencia, ya que la model card no lo detalla.
- Benchmarking inexistente: cero descargas y cero likes en el momento de la consulta, sin evaluaciones independientes publicadas. El ajuste "Cold Fusion" / "GAIN Training" no esta descrito tecnicamente, por lo que no se puede evaluar que se ha modificado respecto al modelo original.
- Fecha de creacion anomala (2026-09-17) en los metadatos del repositorio, lo que dificulta situar la publicacion en una cronologia fiable.
- Vision no confirmada: la afirmacion "This is a vision model" proviene de una plantilla del cuantizador; los ficheros `mmproj` no estan en este repositorio y su existencia no se verifica en la informacion disponible.
- Cadena de custodia opaca: el modelo base es a su vez un ajuste de un modelo no identificado explicitamente, lo que complica la trazabilidad de datos de entrenamiento y posibles sesgos heredados.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye posibles ficheros `mmproj`): https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Pagina de resumen y descargas de mradermacher para este modelo: https://hf.tst.eu/model#Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-i1-GGUF
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de comparacion de tipos de cuantizacion (perplejidad): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente paginas sobre la hora local en Londres, sin relacion con el contenido solicitado).
