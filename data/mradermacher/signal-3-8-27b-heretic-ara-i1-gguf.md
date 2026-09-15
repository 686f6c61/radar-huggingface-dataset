# mradermacher/Signal-3.8-27b-Heretic-ara-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo **Shockem/Signal-3.8-27b-Heretic-ara**, publicadas por el usuario mradermacher bajo el esquema de cuantización con matriz de importancia (imatrix, prefijo `i1`). No es un modelo entrenado desde cero: se trata de una conversión de pesos ya existentes a formatos GGUF de 1 a 6 bits, pensada para ejecución con llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python, KoboldCpp), no para entrenamiento ni ajuste fino.

El modelo base pertenece a la familia de modelos "Heretic", es decir, versiones sometidas a un proceso de *abliteration* (eliminación de direcciones de rechazo en el espacio de activaciones) que produce un modelo descensurado. Los tags del repositorio lo etiquetan como `uncensored`, `abliteration` y `qwen3_5`, lo que sitúa su arquitectura en la línea de Qwen 3.5, con 27.320.697.856 parámetros totales según los safetensors del modelo original (~27,3 mil millones). La model card del cuantizador indica además que se trata de un modelo con capacidad de visión, cuyos ficheros `mmproj` se alojan en el repositorio estático hermano.

La relevancia práctica de esta ficha es acotada pero clara: permite ejecutar un modelo de 27B en hardware de consumo mediante cuantización agresiva (desde 11,0 GB en i1-Q2_K hasta 15,9 GB en i1-Q4_K_S), con licencia Apache 2.0 heredada del modelo base. El repositorio no incluye resultados de benchmarks, ni ficha técnica de contexto, ni documentación propia sobre el entrenamiento; toda la información de arquitectura y datos de entrenamiento procede del modelo original, cuya model card no se ha proporcionado en esta consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` apunta a la familia Qwen 3.5; el repositorio no documenta la arquitectura concreta) |
| Parametros totales | 27.320.697.856 (~27,3 B), dato de safetensors del modelo base |
| Parametros activos | no disponible (no se confirma si el modelo base es MoE o denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Repositorio `i1` (imatrix): i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q4_K_S (15,9 GB), mas el fichero imatrix (0,1 GB). La model card comenta una lista mas amplia: Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (unico idioma declarado en la model card y en los metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (ficheros cuantizados) + fichero imatrix `.gguf`; el modelo base esta en safetensors via transformers (`convert_type: hf`) |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo. Este repositorio es exclusivamente un artefacto de cuantizacion: el cuantizador aplica el pipeline de mradermacher sobre `Shockem/Signal-3.8-27b-Heretic-ara`, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica una conversion desde pesos HuggingFace a GGUF seguida de cuantizacion ponderada por matriz de importancia (imatrix). El fichero imatrix se distribuye en el propio repositorio para que terceros puedan generar sus propias cuantizaciones. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento.

El unico elemento tecnicamente relevante que si esta documentado es la naturaleza del modelo base: una variante *abliterated* (tags `abliteration` y `uncensored`), obtenida eliminando la direccion de rechazo en el espacio de activaciones, lo que altera el comportamiento de rechazo de peticiones sin reentrenar los pesos completos. El tag `qwen3_5` sugiere una base de la familia Qwen 3.5, y la model card del cuantizador afirma explicitamente que el modelo es multimodal ("This is a vision model"), con los ficheros `mmproj` alojados en el repositorio estatico. El sufijo `ara` del nombre no viene explicado en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: la model card incluye el tag `conversational`, y el pipeline de cuantizacion esta orientado a uso en inferencia tipo chat.
- Vision: el cuantizador indica explicitamente que el modelo base es un modelo de vision, con ficheros `mmproj` separados en el repositorio estatico. La cuantizacion `i1` de este repositorio no incluye los `mmproj` (`skip_mmproj` esta vacio en los metadatos, pero la propia model card remite al repositorio estatico para ellos).
- Generacion sin filtros de rechazo: por el proceso de abliteration del modelo base, se espera una tasa de rechazo reducida en peticiones que un modelo alineado estandar rechazaria.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que los ficheros pueden servirse mediante infraestructura de inferencia compatible con la API de HuggingFace Endpoints.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo "thinking" explicito: no disponible.
- Capacidades multilingues: unicamente ingles declarado (`language: en`); no hay evidencia de soporte multilingue.
- Capacidades de codigo o matematicas: no disponible.

## Casos de uso

- Ejecucion local de un modelo de 27B en una GPU de consumo: con i1-Q4_K_S (15,9 GB) el modelo cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) y, con cuantizaciones menores (i1-IQ3_M, i1-Q2_K), en tarjetas de 16 GB. Es el caso de uso principal de este repositorio: inferencia privada, sin conexion a servicios externos.
- Procesamiento por lotes en CPU o con offload parcial: el formato GGUF permite dividir capas entre GPU y CPU mediante llama.cpp, de modo que un equipo sin GPU de gama alta puede ejecutar la cuantizacion i1-Q2_K (11,0 GB) con RAM suficiente y un rendimiento de pocos tokens por segundo.
- Generacion de datos sinteticos y destilacion: al ser un modelo abliterated, resulta util para generar corpus de texto que otros modelos alineados rechazarian, por ejemplo conjuntos de datos para investigacion sobre robustez, seguridad o sesgo, siempre que el uso cumpla con la legislacion aplicable.
- Investigacion sobre abliteration y evaluacion de sesgos: comparar las respuestas de este modelo con las del modelo original sin abliterar (si estuviera disponible) permite medir el efecto de la eliminacion de la direccion de rechazo sobre el comportamiento y la calidad general.
- Analisis de documentos con componente visual: dado que el modelo base es multimodal, cargando los ficheros `mmproj` del repositorio estatico se puede usar para tareas de descripcion de imagenes o extraccion de informacion de capturas y diagramas, sujeto a la verificacion previa de que el `mmproj` es compatible con la cuantizacion empleada.
- Despliegue en entornos con restricciones de red: al ser ficheros unicos descargables y ejecutables con llama.cpp u Ollama, encaja en infraestructuras aisladas (air-gapped) donde no se permite enviar datos a APIs de terceros.
- Creacion de cuantizaciones propias: el repositorio incluye el fichero imatrix (0,1 GB), pensado para que terceros generen sus propios GGUF con la matriz de importancia ya calculada, por ejemplo en tipos de cuantizacion no publicados en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo base no aporta resultados en la informacion proporcionada. Tampoco se documentan mediciones de perplexidad para las distintas cuantizaciones, mas alla de la referencia grafica externa sobre calidad relativa de tipos de cuantizacion enlazada por el autor.

## Requisitos de hardware

Estimaciones calculadas a partir del tamano de los ficheros GGUF publicados; no son datos confirmados por el autor:

- VRAM para los pesos: i1-Q2_K requiere ~11,0 GB; i1-IQ3_M ~12,9 GB; i1-Q4_K_S ~15,9 GB.
- VRAM total en inferencia: hay que sumar la cache KV (dependiente del contexto configurado y del numero de capas, no documentado) y, si se usa vision, el fichero `mmproj` (ubicado en el repositorio estatico). Como referencia prudente, anadir 2-4 GB sobre el tamano de los pesos para contextos moderados.
- GPU de 24 GB (RTX 3090, RTX 4090, A100 40/80 GB en sobredimensionado): permiten cargar i1-Q4_K_S completo con margen para contexto.
- GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000): adecuadas para i1-IQ3_M o i1-Q2_K; i1-Q4_K_S exigiria offload parcial.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070): solo i1-Q2_K con contexto corto, o cualquier cuantizacion con offload de capas a CPU.
- GPU de 8 GB o menos: requiere offload mayoritario a CPU y RAM del sistema acorde al tamano del fichero.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con infraestructura tipo HuggingFace Endpoints. No se dispone de datos de compatibilidad con vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La comparacion se limita a las variantes del mismo modelo base, ya que no se dispone de datos verificables de otros modelos de la misma categoria en la informacion proporcionada.

| Repositorio | Formato | Tamano minimo | Cuantizaciones | Vision | Licencia |
|---|---|---|---|---|---|
| mradermacher/Signal-3.8-27b-Heretic-ara-i1-GGUF (este) | GGUF con imatrix | 11,0 GB (i1-Q2_K) | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S + imatrix | `mmproj` en el repositorio estatico | apache-2.0 |
| mradermacher/Signal-3.8-27b-Heretic-ara-GGUF (estatico) | GGUF estatico | no disponible | no disponible | `mmproj` incluidos en este repositorio | apache-2.0 |
| Shockem/Signal-3.8-27b-Heretic-ara (base) | safetensors (transformers) | ~53,0 GB en repositorio | no aplica | si, segun el cuantizador | apache-2.0 |
| Otros modelos de ~27B de la familia Qwen 3.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias clave dentro de la familia: las cuantizaciones `i1` usan una matriz de importancia calculada sobre el propio modelo, lo que en la practica suele traducirse en menor perdida de calidad a igual tamano que las cuantizaciones estaticas equivalentes; el precio es una disponibilidad mas limitada de tipos intermedios en este repositorio concreto.

## Limitaciones y advertencias

- Modelo descensurado por diseno: el proceso de abliteration elimina el comportamiento de rechazo, de modo que el modelo puede generar contenido ofensivo, ilegal, inseguro o factualmente falso sin filtros. No es apto para despliegues orientados al publico general sin capas de moderacion externas.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de calibracion. Un modelo abliterated no conserva necesariamente la calidad de razonamiento del modelo original, ya que la intervencion sobre las activaciones puede degradar capacidades generales.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento en tareas estandar, por lo que cualquier decision de produccion deberia basarse en una evaluacion propia sobre el dominio objetivo.
- Cobertura idiomatica limitada: solo ingles declarado. No se garantiza un comportamiento correcto en castellano ni en otros idiomas, y el proceso de cuantizacion puede degradar adicionalmente el rendimiento fuera del ingles.
- Contexto no documentado: se desconoce la ventana de contexto real del modelo base y si se preserva integra tras la conversion a GGUF. Conviene verificar el valor configurado en el fichero antes de disenar aplicaciones con contexto largo.
- Vision condicionada: los ficheros `mmproj` no estan en este repositorio, sino en el estatico. Ademas, el autor no garantiza que el `mmproj` disponible sea compatible con todas las cuantizaciones `i1`, por lo que la ruta multimodal requiere verificacion previa.
- Perdida de calidad en cuantizaciones bajas: i1-Q2_K e i1-IQ3_M implican degradacion medible frente a Q4_K_S o superiores; el propio autor recomienda i1-Q4_K_S por su relacion tamano/velocidad/calidad, y senala que IQ3_XXS suele ser preferible a Q2_K.
- Licencia: apache-2.0, que permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. Esta licencia es la declarada en este repositorio; conviene confirmar que el modelo base mantiene la misma licencia, ya que una restriccion adicional en el modelo original prevaleceria.
- Fechas de publicacion: los metadatos indican creacion el 2026-09-15 y actualizacion el mismo dia, con 0 descargas y 0 likes en el momento de la consulta. El repositorio no ha sido validado por la comunidad.
- Sin garantia de mantenimiento: es un repositorio de cuantizacion de un tercero, sin pipeline declarado, sin model card detallada y sin historial de revisiones mas alla de `readme_rev: 1`.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/Signal-3.8-27b-Heretic-ara-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Signal-3.8-27b-Heretic-ara-GGUF
- Modelo base: https://huggingface.co/Shockem/Signal-3.8-27b-Heretic-ara
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Signal-3.8-27b-Heretic-ara-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Signal-3.8-27b-Heretic-ara-i1-GGUF/resolve/main/Signal-3.8-27b-Heretic-ara.imatrix.gguf
- Cuantizacion i1-Q2_K: https://huggingface.co/mradermacher/Signal-3.8-27b-Heretic-ara-i1-GGUF/resolve/main/Signal-3.8-27b-Heretic-ara.i1-Q2_K.gguf
- Cuantizacion i1-IQ3_M: https://huggingface.co/mradermacher/Signal-3.8-27b-Heretic-ara-i1-GGUF/resolve/main/Signal-3.8-27b-Heretic-ara.i1-IQ3_M.gguf
- Cuantizacion i1-Q4_K_S: https://huggingface.co/mradermacher/Signal-3.8-27b-Heretic-ara-i1-GGUF/resolve/main/Signal-3.8-27b-Heretic-ara.i1-Q4_K_S.gguf
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
