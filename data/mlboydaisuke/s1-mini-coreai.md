# mlboydaisuke/S1-mini-CoreAI

## Resumen

S1-mini es un normalizador de texto para transcripciones de reconocimiento de voz (ASR) de 0,6 mil millones de parámetros, desarrollado originalmente por Superwhisper y convertido al formato Apple Core AI por mlboydaisuke. Su función es única: recibe una transcripción cruda de ASR y devuelve texto escrito limpio, con rellenos eliminados, falsos comienzos resueltos, puntuación y capitalización aplicadas, y números, fechas, horas, monedas y direcciones de correo renderizados en forma escrita. No es un modelo de chat; se controla mediante una línea de control al inicio de la entrada.

La relevancia actual del modelo reside en que completa el stack de dictado en dispositivo de Apple: Core AI ya incluye ASR (Parakeet, Nemotron-3.5-ASR-Streaming, Whisper, Qwen3-ASR), pero carecía de un post-procesador que convierta la transcripción en bruto en texto publicable sin que los datos salgan del dispositivo. Esta conversión corre íntegramente en iPhone y Mac, con un bundle de 759 MB y cuantización int8 en el cuerpo del modelo.

La arquitectura está basada en Qwen3, con una cabeza atada al embedding en fp16. En iOS, el motor limita la suma de prompt y generación a 1024 tokens, por lo que es necesario trocear la entrada en fragmentos de aproximadamente 450-500 tokens. En macOS no existe ese límite.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen3 |
| Parametros totales | 0,6 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada; en iOS el motor limita prompt+generación a 1024 tokens |
| Tipos de cuantizacion | int8 (cuerpo, per-block-32), fp16 (embedding y cabeza), int4 no publicado |
| Idiomas soportados | Ingles |
| Licencia | s1-mini-license (Apache-2.0 con clausula de atribucion) |
| Formato de pesos | Core AI bundle (gpu-pipelined) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 0,6 mil millones de parametros basado en la familia Qwen3, segun los tags del repositorio. Su entrenamiento se ha orientado a una unica tarea: la normalizacion de transcripciones ASR. La entrada sigue un formato fijo con un prompt de sistema y una linea de control con tres ejes independientes — estilo (`casual`, `semi-casual`, `semi-formal`, `formal`), estructura (`prose`, `lists`) y contexto (`general`, `email`) — y todas las combinaciones fueron entrenadas. Los datos de entrenamiento no estan disponibles en la informacion publicada.

La innovacion tecnica principal es la cuantizacion: el cuerpo se cuantiza a int8 con esquema `symmetric_with_clipping` por bloques de 32, mientras que las normas, RoPE, SDPA y el embedding se mantienen en precision completa. La cabeza esta atada al embedding y se conserva en fp16 deliberadamente, porque desatarla para cuantizarla anadiria un tensor en lugar de reducirlo (fp16 atado: 311 MB; fp16 + int8 desatado: 467 MB). La cuantizacion int4 se descarto por corromper digitos en la normalizacion inversa de texto (por ejemplo, `$23,450` se convertia en `$2,345`).

## Capacidades

- Normalizacion de transcripciones ASR: elimina rellenos ("um", "uh"), resuelve falsos comienzos y autocorrecciones, y aplica puntuacion y capitalizacion.
- Normalizacion inversa de texto: convierte numeros hablados, fechas, horas, monedas y direcciones de correo a su forma escrita (por ejemplo, "twenty three thousand four hundred and fifty dollars" → "$23,450").
- Control de estilo, estructura y contexto mediante linea de control con tres ejes independientes y combinables.
- Generacion de texto limitada a la tarea de normalizacion; no es un modelo de chat ni responde preguntas.
- No soporta tool calling, agentes, vision ni audio; su unica entrada es texto.
- Multilingue: no, solo ingles.

## Casos de uso

- Dictado en iPhone y Mac: integrado como post-procesador tras el ASR de Core AI, convierte la transcripcion en bruto en texto listo para enviar sin salida de datos del dispositivo. Su velocidad en iPhone 17 Pro (62,4 tok/s en decode) permite uso interactivo.
- Transcripcion de reuniones: limpia transcripciones crudas de herramientas de grabacion, eliminando muletillas y normalizando cifras y fechas para actas legibles.
- Subtitulado automatico: normaliza transcripciones ASR para generar subtitulos con puntuacion correcta y numeros en forma escrita, mejorando la legibilidad.
- Asistentes de voz: como etapa de post-procesado en pipelines de comandos por voz, asegura que la salida final tenga formato correcto antes de pasarla a un sistema de ejecucion.
- Accesibilidad: facilita el dictado para personas con movilidad reducida, produciendo texto limpio y bien formateado directamente desde la voz.
- Redaccion de correos por voz: con el contexto `email` y estructura `prose`, genera borradores de correo normalizados a partir de dictados informales.
- Documentacion formal: con estilo `formal` y contexto `general`, produce texto normalizado apto para informes o notas profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no es de proposito general. La model card reporta metricas de velocidad y fidelidad de conversion:

| Metrica | M4 Max (Mac Studio, macOS 27.0) | iPhone 17 Pro (A19 Pro, Release) |
|---|---|---|
| Decode | 268,4 tok/s | 62,4 tok/s (30,5 bajo carga sostenida) |
| Prefill | 4161 tok/s | 69,0 tok/s (34,9 bajo carga sostenida) |
| Token-exact vs oracle fp32 HF | 16/16 | 276/276 + 27/27 vs motor Mac |
| Precision en formato propio | 13/14 (un fallo de puntuacion) | — |

La carga del modelo tarda entre 0,2 y 1,0 segundos en dispositivo. El unico error observado en la tarea fue de puntuacion: `$23,450 and` en lugar de `$23,450, and`.

## Requisitos de hardware

- Bundle de 759 MB en formato Core AI (`gpu-pipelined`), sin necesidad de compilacion AOT.
- Compatible con macOS e iOS; probado en M4 Max (Mac Studio) y iPhone 17 Pro (A19 Pro).
- No requiere GPU dedicada; usa el Neural Engine y la GPU de Apple.
- En iOS, el motor limita prompt + generacion a 1024 tokens; hay que trocear la entrada a 450-500 tokens como maximo.
- En macOS no existe limite de contexto impuesto por el motor.
- Despliegue mediante Core AI framework y CoreAIKit en Swift; no compatible con vLLM, llama.cpp u Ollama al ser un formato propietario de Apple.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros normalizadores de texto ASR (como NeMo Inverse Text Normalization o modelos de puntuacion dedicados). La unica referencia directa es el modelo original:

| Modelo | Parametros | Formato | Precision | Licencia |
|---|---|---|---|---|
| superwhisper/s1-mini (original) | 0,6B | fp32 (Hugging Face) | Oracle de referencia | s1-mini-license |
| mlboydaisuke/S1-mini-CoreAI | 0,6B | Core AI int8/fp16 | Token-exact vs original | s1-mini-license |

La conversion mantiene fidelidad total respecto al original en las pruebas reportadas, con la ventaja de ejecutarse en dispositivo.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilingue.
- No es un modelo de chat: intentar usarlo como tal devuelve una cadena vacia si se activa el modo thinking (`enable_thinking=False` es obligatorio).
- En iOS, el limite de 1024 tokens (prompt + generacion) puede truncar transcripciones largas; es necesario trocear la entrada.
- La cuantizacion int4 corrompe digitos y no se publica; usar solo la version int8.
- Riesgo de alucinacion en la normalizacion de puntuacion y cifras, como el error observado en `$23,450, and`.
- La licencia s1-mini-license (Apache-2.0 con clausula adicional) exige que cualquier uso, distribucion o integracion del producto mantenga la identificacion del modelo como "S1-mini" de "Superwhisper" con esa capitalizacion exacta.
- El formato Core AI es propietario de Apple; no es portable a otros entornos de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/S1-mini-CoreAI
- Modelo original: https://huggingface.co/superwhisper/s1-mini
- Repositorio de recetas de exportacion de Apple: https://github.com/apple/coreai-models
- Zoo de modelos Core AI de la comunidad: https://github.com/john-rocky/coreai-model-zoo
- Catalogo de artefactos Core AI en PyPI: https://pypi.org/project/coreai-catalog/
