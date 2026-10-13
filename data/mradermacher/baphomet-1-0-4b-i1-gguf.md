# mradermacher/Baphomet-1.0-4B-i1-GGUF

## Resumen

Baphomet-1.0-4B-i1-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo CloudGoat/Baphomet-1.0-4B, publicadas por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una recolección de pesos comprimidos con el objetivo de reducir el espacio en disco y los requisitos de memoria para poder ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados. El repositorio incluye tanto cuantizaciones estáticas como cuantizaciones generadas con matriz de importancia (imatrix), esta última variante con mejor relación calidad-tamano en rangos bajos de bits.

El modelo subyacente tiene 4.326.350.848 parámetros (aproximadamente 4,33 mil millones) según los pesos en safetensors del modelo base, y la model card de la cuantización lo etiqueta como modelo de visión y lenguaje (vision-language). Las etiquetas del repositorio apuntan a una arquitectura de la familia qwen3_5 y a que el modelo se ha construido mediante técnicas de fusión de modelos: goatmerge, task-vector y linear-merge. La licencia declarada es Apache 2.0 y el único idioma soportado declarado es el inglés.

La relevancia de esta ficha está en que permite desplegar un modelo multimodal de ~4B en GPU de consumo o incluso en CPU con las cuantizaciones de menor tamaño (desde 2,1 GB para i1-Q2_K hasta 3,7 GB para i1-Q6_K), lo cual es útil para prototipado local y evaluación rápida. Sin embargo, conviene señalar que la model card no documenta datos de entrenamiento, longitud de contexto, composición del dataset ni resultados de benchmarks, por lo que la mayor parte de las especificaciones técnicas quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del repo apuntan a qwen3_5 y vision-language, sin confirmacion en la model card) |
| Parametros totales | 4.326.350.848 (~4,33B) segun safetensors del modelo base |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; quants estaticos adicionales en el repo secundario (Q2_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ1_S, IQ1_M, IQ2_M, IQ3_XXS, IQ3_XS, Q4_K_S, Q5_K_S, Q6_K, entre otros) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (imatrix y estaticos); el modelo original esta en safetensors |
| Tamano del repo | 39,2 GB (incluye todas las cuantizaciones) |
| Rango de tamano de los quants i1 | 2,1 GB (i1-Q2_K) a 3,7 GB (i1-Q6_K) |
| Fichero imatrix | Baphomet-1.0-4B.imatrix.gguf, 0,1 GB |
| Descargas / likes | 845 descargas, 1 like |
| Fecha de creacion del repo | 2026-10-13 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Las etiquetas del repositorio incluyen qwen3_5, vision-language, merge, goatmerge, task-vector y linear-merge. Esto sugiere que Baphomet-1.0-4B es el resultado de una fusion de modelos basada en vectores de tarea y fusion lineal (goatmerge), sobre una base de la familia Qwen 3.5 con capacidades de vision, pero la model card no confirma ninguno de estos extremos ni detalla la topologia de capas, el tipo de atencion o la estrategia de fusion.

Tampoco se documenta el proceso de entrenamiento: no hay numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion tecnica relevante del repositorio es de naturaleza operativa: las cuantizaciones se han generado con imatrix (matriz de importancia), un procedimiento que pondera los pesos segun su impacto en la perplejidad y que, segun el propio autor, ofrece mejor calidad que las cuantizaciones estaticas de tamano equivalente en rangos bajos. La model card incluye ademas una nota sobre el orden de calidad de los tipos de quant, indicando por ejemplo que IQ3_S "beats Q3_K*" o que IQ4_XS es preferible a IQ4_NL.

## Capacidades

- Generacion de texto conversacional: la etiqueta conversational y el pipeline de transformers indican uso como modelo de chat mediante plantilla de conversacion.
- Vision y lenguaje: la model card lo describe explicitamente como modelo de vision; los ficheros mmproj necesarios para el codificador visual se encuentran en el repositorio estatico (mradermacher/Baphomet-1.0-4B-GGUF), no en el repositorio i1.
- Fusion de modelos: el modelo base se ha construido mediante goatmerge, task-vector y linear-merge, lo que en la practica implica capacidades heredadas de los modelos combinados.
- Idiomas: unicamente ingles declarado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible; no se declaran.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion i1-Q4_K_M (2,9 GB) el modelo se puede cargar en llama.cpp u Ollama en un portatil con GPU integrada o CPU moderna, lo que permite iterar sobre prompts y plantillas de chat sin coste de API.
- Evaluacion de modelos fusionados: dado que el base es un merge con goatmerge y task-vector, sirve para experimentar si la combinacion de capacidades se conserva tras cuantizar a 2-4 bits y comparar contra el modelo original en safetensors.
- Inferencia en el borde o en dispositivos con poca VRAM: las variantes i1-IQ3_S (2,3 GB) o i1-IQ4_XS (2,7 GB) permiten ejecutar un modelo de ~4,3B en GPUs con 4-6 GB de memoria, incluyendo equipos de gama media.
- Tareas de vision-lenguaje en local: cargando el mmproj del repositorio estatico junto con el GGUF, se puede usar para descripcion de imagenes o respuesta a preguntas visuales sencillas, siempre que el frontend (por ejemplo llama.cpp con soporte multimodal) lo permita.
- Generacion de texto en ingles para pipelines offline: procesamiento por lotes de resumenes, clasificacion o reescritura donde no se requiere multilingue y se prioriza ejecucion sin conexion.
- Banco de pruebas de cuantizacion: el repositorio ofrece el fichero imatrix y una escala muy amplia de bits (de Q2_K a Q6_K), lo que lo hace util para estudios comparativos de degradacion de perplejidad frente al tamano.
- Despliegue en entornos con restricciones de memoria: en contenedores con limite de RAM, las variantes de 2,1-2,4 GB permiten servir el modelo en instancias pequenas sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se han encontrado datos de evaluacion del modelo base CloudGoat/Baphomet-1.0-4B en los resultados de busqueda proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): aproximadamente 2,1 GB con i1-Q2_K; 2,3 GB con i1-IQ3_S o i1-IQ3_M; 2,7 GB con i1-IQ4_XS o i1-Q4_K_S; 2,9 GB con i1-Q4_K_M; 3,3 GB con i1-Q5_K_M; 3,7 GB con i1-Q6_K. Hay que anadir la memoria de la cache KV, que depende del contexto configurado y no puede calcularse con los datos disponibles (longitud de contexto no documentada).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para las variantes de 2 bits; 6 GB o mas para Q4_K_M con contexto moderado; 8 GB o mas para Q5/Q6 con contexto amplio. Modelos como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. No se requieren A100 ni H100 para este tamano.
- Caben en GPU de consumo: si. Las variantes i1-Q2_K a i1-Q4_K_M caben en GPUs de 4-6 GB (GTX 1650, RTX 3050, RTX 3060, RTX 4060, entre otras). Las variantes Q5 y Q6 requieren 6-8 GB para operar con holgura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El repositorio declara compatibilidad con endpoints. vLLM y TGI no soportan GGUF de forma nativa; requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.
- Nota sobre vision: para usar la parte multimodal hay que descargar los ficheros mmproj del repositorio estatico mradermacher/Baphomet-1.0-4B-GGUF, que anaden un consumo de memoria no cuantificado en la informacion disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, contexto ni arquitectura confirmada del modelo base, y los resultados de busqueda web recibidos no contienen ninguna referencia al modelo ni a alternativas comparables de la misma categoria. La unica comparacion verificable es entre las propias cuantizaciones del repositorio:

| Quant | Tamano (GB) | Nota del autor |
|---|---|---|
| i1-Q2_K | 2,1 | IQ3_XXS probablemente mejor |
| i1-IQ3_S | 2,3 | beats Q3_K* |
| i1-IQ3_M | 2,3 | sin nota |
| i1-IQ4_XS | 2,7 | sin nota |
| i1-Q4_K_S | 2,7 | tamano/velocidad/calidad optimos |
| i1-Q4_K_M | 2,9 | rapido, recomendado |
| i1-Q5_K_M | 3,3 | sin nota |
| i1-Q6_K | 3,7 | practicamente como Q6_K estatico |

Para comparar con modelos alternativos de ~4B seria necesario disponer de los benchmarks del modelo base, que no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- No hay informacion sobre sesgos. La model card no documenta evaluaciones de sesgo ni la composicion del dataset de entrenamiento, por lo que no se puede estimar el sesgo de genero, raza, religion o ideologia.
- Riesgo de alucinacion no cuantificado. Al tratarse de un modelo de ~4B y de una fusion de modelos, la tasa de alucinacion no esta medida en la documentacion disponible.
- Limitacion idiomatica: el unico idioma declarado es el ingles. No hay evidencia de soporte fiable de castellano ni de otros idiomas.
- Las cuantizaciones de 2 y 3 bits degradan la calidad de forma apreciable. El propio autor desaconseja implicitamente las variantes i1-Q2_K y algunos Q3_K en favor de las equivalentes IQ.
- Los ficheros mmproj no estan en este repositorio. Si se necesita la parte de vision hay que descargar el repositorio estatico asociado, lo que complica el despliegue en un solo paso.
- Licencia: Apache 2.0, que permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la licencia y las condiciones del modelo base CloudGoat/Baphomet-1.0-4B y de los modelos fusionados que lo componen, ya que una fusion puede heredar obligaciones de licencias de sus componentes.
- Longitud de contexto desconocida. Sin este dato no se pueden planificar aplicaciones con documentos largos ni calcular el consumo de cache KV.
- La model card no documenta validacion del modelo cuantizado frente al original. No hay tabla de perplejidad que confirme la perdida de calidad de cada quant.
- Los resultados de busqueda web recibidos no contienen informacion relevante sobre el modelo (corresponden a un simulador ferroviario), por lo que no ha podido contrastarse ningun dato externo.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Baphomet-1.0-4B-i1-GGUF
- Repositorio de cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/Baphomet-1.0-4B-GGUF
- Modelo base: https://huggingface.co/CloudGoat/Baphomet-1.0-4B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Baphomet-1.0-4B-i1-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de quant de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Web de nethype GmbH: https://www.nethype.de/
