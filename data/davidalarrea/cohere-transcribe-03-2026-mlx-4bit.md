# davidalarrea/cohere-transcribe-03-2026-mlx-4bit

## Resumen

davidalarrea/cohere-transcribe-03-2026-mlx-4bit es una version cuantizada a 4 bits del modelo de reconocimiento automatico del habla (ASR) CohereLabs/cohere-transcribe-03-2026, convertida al formato MLX de Apple para su ejecucion nativa en chips de la serie M. El checkpoint deriva de la conversion intermedia en fp16 publicada por el usuario beshkenadze (beshkenadze/cohere-transcribe-03-2026-mlx-fp16) y emplea cuantizacion afin con tamano de grupo de 64, un esquema habitual en el ecosistema MLX para reducir peso y memoria sin recurrir a kernels de terceros.

El modelo cuenta con 2.064.722.176 parametros (aproximadamente 2,06 mil millones) y el repositorio ocupa 1,5 GB, una cifra coherente con pesos de 4 bits mas tokenizador y ficheros de configuracion. Se distribuye en formato safetensors para la libreria mlx, con licencia Apache 2.0 y soporte declarado unicamente para ingles. Su relevancia practica esta en que permite ejecutar un sistema de transcripcion de unos 2.000 millones de parametros en un Mac de consumo con un pico de memoria medido de 1,96 GB y un rendimiento de generacion de 394,6 tokens por segundo en la muestra de referencia del propio autor.

Se trata, por tanto, de un artefacto de inferencia y no de un modelo entrenado desde cero: la model card indica explicitamente que solo contiene pesos y ficheros auxiliares, y que los detalles de entrenamiento, datos y evaluacion deben consultarse en la model card original de Cohere. Esto condiciona todas las secciones siguientes, donde buena parte de los datos tecnicos figuran como no disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo ASR etiquetado como cohere_asr con custom_code (requiere codigo personalizado); la topologia concreta del encoder y decoder no se detalla en la informacion proporcionada |
| Parametros totales | 2.064.722.176 (aproximadamente 2,06 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, modo affine, group size 64 (MLX). El autor referencia variantes fp16 y 8 bits en las pruebas de paridad |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), mas tokenizer.model, config.json, tokenizer_config.json, preprocessor_config.json, special_tokens_map.json, key_map.json y conversion_summary.json |
| Tamano del repositorio | 1,5 GB |
| Pipeline | automatic-speech-recognition |
| Libreria | mlx |
| Modelo base | CohereLabs/cohere-transcribe-03-2026 (via beshkenadze/cohere-transcribe-03-2026-mlx-fp16) |

## Arquitectura y entrenamiento

La informacion disponible no describe la topologia interna del modelo (numero de capas, dimension del encoder de audio, tipo de atencion ni estrategia de decodificacion). Lo unico verificable es que se trata de un sistema de reconocimiento automatico del habla con pipeline automatic-speech-recognition, etiquetado con la familia cohere_asr y que depende de custom_code, es decir, de codigo de modelado distribuido fuera de las clases estandar de transformers o mlx. El vocabulario se entrega como tokenizer.model, lo que apunta a un tokenizador de tipo SentencePiece, aunque no se especifica su tamano.

Tampoco hay datos sobre el numero de horas de audio empleadas en el entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado. Esta ficha corresponde a una cuantizacion, no a un entrenamiento: el autor declara que los pesos se generaron a partir del checkpoint fp16 compatible con Swift y que el repositorio contiene exclusivamente artefactos de inferencia. La unica innovacion tecnica documentada es, por tanto, la propia conversion a MLX con cuantizacion afin de 4 bits y grupo 64, acompanada de una validacion de paridad semantica entre runtime Swift MLX (fp16, 8 bits y 4 bits), runtime Python MLX (fp16 y 4 bits) y la ruta de referencia CUDA con transformers nativo de Cohere.

## Capacidades

- Transcripcion de voz a texto en ingles a partir de audio de entrada, con salida de texto plano.
- Procesamiento de audio conversacional; la muestra de referencia del repositorio es un fichero Tests/media/conversational_a.wav.
- Ejecucion en runtime MLX tanto en Python como en Swift, con paridad semantica verificada entre ambas rutas y frente a la implementacion de referencia en CUDA.
- Funcionamiento con pesos de 4 bits, lo que reduce el peso a 1,5 GB y el pico de memoria medido a 1,96 GB.
- Capacidad de generar transcripciones largas de forma fluida: en la muestra del repositorio la salida incluye una frase completa sobre el origen del cafe, sin cortes aparentes.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; es un modelo ASR, no un modelo de proposito general.
- Capacidades multilingues: no, el modelo declara unicamente ingles.
- Capacidades especiales (vision, audio generativo, modo thinking): no disponible; la unica modalidad de entrada documentada es audio y la de salida, texto.

## Casos de uso

- Transcripcion de reuniones en local sobre un Mac: con un pico de memoria de 1,96 GB, el modelo puede mantener un proceso de dictado o transcripcion por lotes en un portatil Apple Silicon sin depender de servicios en la nube, lo que resulta adecuado cuando el audio contiene informacion confidencial.
- Generacion de subtitulos para contenido en ingles: el modelo produce texto continuo y bien puntuado a partir de audio, de modo que puede integrarse en un pipeline que extraiga la pista de audio, transcriba y genere ficheros SRT o VTT para postproduccion.
- Analitica de conversaciones de atencion al cliente: transcripcion de llamadas grabadas para alimentar busquedas de texto, clasificadores de intencion o cuadros de mando de calidad, aprovechando que el modelo se ejecuta con recursos modestos y puede desplegarse en paralelo en varios procesos.
- Creacion de conjuntos de datos para entrenamiento de ASR: al ser un modelo cuantizado y rapido (394,6 tokens por segundo en la muestra del autor), puede usarse para preetiquetar grandes volumenes de audio en ingles antes de una revision humana.
- Accesibilidad y notas de voz: conversion de notas de voz o grabaciones de clases a texto editable en aplicaciones de escritorio para macOS mediante el runtime MLX Swift, sin salir del dispositivo.
- Dictado integrado en herramientas de desarrollo: transcripcion de especificaciones o comentarios hablados que se insertan en el editor, siempre que el contenido sea en ingles y no se requiera diarizacion.
- Preprocesado de podcasts y contenido editorial: transcripcion de episodios para generar resumenes, indices de busqueda o articulos derivados, con coste marginal nulo una vez desplegado en hardware propio.
- Prototipado rapido en investigacion: comparacion de la variante de 4 bits frente a fp16 y 8 bits para estudiar el impacto de la cuantizacion en la calidad de transcripcion, dado que el autor publica notas de paridad y una regresion lexica concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento aportado por el autor es el benchmark sobre la muestra del propio repositorio:

| Metrica | Valor | Condiciones |
|---|---|---|
| Generation TPS | 394,6 | Muestra Tests/media/conversational_a.wav; hardware no especificado |
| Peak memory | 1,96 GB | Misma muestra; hardware no especificado |
| Paridad semantica | Coincidencia exacta | Verificada en una frase fija en ingles entre Swift MLX fp16/8-bit/4-bit, Python MLX fp16/4-bit y la ruta CUDA de referencia |
| Regresion lexica | 1 caso conocido | En la muestra del repositorio la variante 4 bits transcribe "Khaldi" donde la referencia espera "Kaldi" |

No se dispone de tasas de error de palabra (WER) sobre conjuntos publicos como LibriSpeech, Common Voice o Fleurs, por lo que no es posible comparar la calidad de transcripcion con otros sistemas con rigor.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 1,96 GB de pico medido durante la inferencia sobre la muestra del repositorio, mas el espacio del runtime y del audio de entrada.
- Compatibilidad con GPU: el formato es MLX, por lo que la ejecucion esta ligada a Apple Silicon. No se documenta soporte para CUDA ni ROCm en esta variante; para GPU NVIDIA habria que usar el checkpoint original de Cohere con transformers.
- GPU recomendadas: no se especifican. El modelo esta pensado para el motor unificado de memoria de los chips Apple M1, M2, M3 o M4 y posteriores.
- Cabe en GPU de consumo: si, en el sentido de que un Mac con 8 GB o mas de memoria unificada es suficiente segun el pico medido de 1,96 GB. No hay datos de ejecucion en tarjetas graficas de consumo tipo RTX 4090 porque el formato no es compatible con ellas.
- Opciones de despliegue: runtime MLX en Python y en Swift (ambos citados en la validacion de paridad). No hay evidencia de soporte para vLLM, TGI, llama.cpp, Ollama ni whisper.cpp en la informacion proporcionada.
- Latencia y throughput: 394,6 tokens por segundo en la muestra de referencia, sin que se especifique el chip empleado; no es posible extrapolar a otros equipos.
- Nota sobre el codigo: al estar etiquetado como custom_code, la carga requiere habilitar la ejecucion de codigo remoto (trust_remote_code) en el runtime correspondiente.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de documentacion publica ampliamente difundida y no han sido verificados en la informacion proporcionada; se incluyen como referencia orientativa, no como resultado de una evaluacion propia.

| Modelo | Parametros | Idiomas | Licencia | Formato / runtime | Contexto |
|---|---|---|---|---|---|
| davidalarrea/cohere-transcribe-03-2026-mlx-4bit | 2,06 mil millones | Ingles | Apache 2.0 | safetensors, MLX (Apple Silicon) | no disponible |
| CohereLabs/cohere-transcribe-03-2026 | no disponible | no disponible | Apache 2.0 segun la variante derivada | transformers, custom_code | no disponible |
| beshkenadze/cohere-transcribe-03-2026-mlx-fp16 | no disponible (mismo modelo base) | Ingles | Apache 2.0 | safetensors, MLX | no disponible |
| Whisper large-v3 (OpenAI) | 1.550 millones | Multilingue | MIT | safetensors, GGUF, multiples runtimes | ventana de audio de 30 segundos |
| Whisper large-v3-turbo (OpenAI) | 809 millones | Multilingue | MIT | safetensors, GGUF, multiples runtimes | ventana de audio de 30 segundos |

La diferencia practica principal frente a las alternativas Whisper es el idioma (solo ingles) y el ecosistema (solo MLX), compensados por un peso reducido de 1,5 GB y un pico de memoria inferior a 2 GB. No hay datos de WER que permitan afirmar cual transcribe mejor.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce degradacion medible: el propio autor documenta una regresion lexica en la muestra del repositorio, donde se transcribe "Khaldi" en lugar de "Kaldi". No se han publicado metricas agregadas de ese deterioro.
- El modelo solo soporta ingles. Cualquier audio en otro idioma queda fuera de su ambito declarado y no hay datos sobre el comportamiento en esos casos.
- Riesgo de alucinacion en ASR: como cualquier sistema de transcripcion, puede generar texto plausible que no corresponde a lo dicho, especialmente con audio ruidoso, acentos no vistos en entrenamiento o silencios largos. No hay evaluacion especifica de este riesgo en la informacion disponible.
- Sesgos: no se documenta ninguna evaluacion de sesgos por acento, genero, edad o variedad dialectal del ingles.
- Longitud de contexto y duracion maxima de audio: no disponibles. No se puede garantizar el comportamiento en audios muy largos sin troceado previo.
- Dependencia de custom_code: la carga exige ejecutar codigo distribuido con el modelo, lo que implica una revision de seguridad antes de usarlo en produccion y complica la integracion con runtimes que no lo soportan.
- Portabilidad limitada: al ser pesos MLX, no se pueden desplegar directamente en servidores con GPU NVIDIA o AMD sin reconvertir al checkpoint original.
- Artefacto de inferencia: la model card indica que el repositorio no documenta el entrenamiento. Para trazabilidad, evaluacion de licencia y limitaciones del modelo original hay que acudir a CohereLabs/cohere-transcribe-03-2026.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base original y las condiciones del checkpoint fp16 intermedio de beshkenadze, dado que esta variante es una cadena de derivaciones.
- Fecha del repositorio: creado y actualizado el 18 de septiembre de 2026, con cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos no guardan relacion con la ficha y se han descartado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/davidalarrea/cohere-transcribe-03-2026-mlx-4bit
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Checkpoint fp16 de origen citado por el autor: https://huggingface.co/beshkenadze/cohere-transcribe-03-2026-mlx-fp16
- Paper, blog o demo especificos de esta cuantizacion: no disponible
- Resultados de busqueda web relevantes: no disponible (la busqueda no devolvio fuentes relacionadas con el modelo)
