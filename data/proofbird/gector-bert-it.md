# proofbird/gector-bert-it

## Resumen

`gector-bert-it` es un modelo de corrección gramatical del italiano desarrollado por Proofbird, el equipo detrás de la aplicación de asistencia a la escritura del mismo nombre. Se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder `dbmdz/bert-base-italian-xxl-cased` y exportado a ONNX en fp32 para ejecutarse en CPU, sin necesidad de GPU ni de conexión a un servicio externo. El modelo se publica con el objetivo declarado de que cualquiera pueda auditar qué se ejecuta en su máquina, ya que forma parte del motor local de la aplicación Proofbird.

A diferencia de los modelos generativos de corrección, GECToR no reescribe el texto: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar por una palabra, añadir una palabra, cambiar mayúsculas o cambiar la forma verbal), aplica las ediciones y vuelve a etiquetar la frase hasta cinco iteraciones. Esto lo hace especialmente adecuado para interfaces de sugerencia donde el usuario decide si acepta cada cambio, ya que el modelo nunca parafrasea ni reformula.

El modelo se entrenó exclusivamente con datos sintéticos generados mediante reglas de error escritas a mano sobre corpus italianos limpios (Wikipedia, Europarl y Tatoeba), sin corpus de aprendices ni datos de usuario. La versión publicada es la 1.1.2 (archivos de modelo de la 1.1.0), con pesos finales de una única época de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base) con cabeza de etiquetado de ediciones (2 932 etiquetas) y cabeza de detección de errores; paradigma GECToR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son ONNX fp32) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32); tokenizer compatible con la librería `tokenizers` |

## Arquitectura y entrenamiento

El modelo sigue el esquema GECToR: un encoder BERT base italiano (`dbmdz/bert-base-italian-xxl-cased`, licencia MIT) sobre el que se montan dos cabezas, una de etiquetado de ediciones con 2 932 etiquetas posibles y otra de detección de errores. La inferencia es iterativa: se etiqueta la frase, se aplican las ediciones propuestas y se vuelve a etiquetar el resultado hasta un máximo de cinco pasadas. El modelo no genera texto libre, solo propone ediciones locales sobre tokens existentes.

El entrenamiento utilizó únicamente datos sintéticos, 3 250 000 frases en total: 1 500 000 de Wikipedia italiana (`wikimedia/wikipedia`, `20231101.it`), 1 500 000 de los procedimientos del Parlamento Europeo (Europarl v8, sesiones anteriores a mayo de 2011) y 250 000 de Tatoeba. Las frases se corrompieron con reglas de error italianas escritas a mano, en su mayoría un error por frase independientemente de su longitud, dejando aproximadamente un 10 % sin corromper para que el modelo aprenda a no tocar texto correcto. Cada regla se validó previamente contra texto limpio para no marcar como error variantes que el italiano admite (por ejemplo, `di applicazione` y `d'applicazione`). Se añadieron además frases reales con el error colocado exactamente en el patrón necesario (repartidas entre 502 verbos) y 210 000 frases de plantilla para cubrir preguntas, imperativos, primera y segunda persona y errores en una cláusula posterior. El entrenamiento consistió en una época, 142 588 pasos, batch 64 y tasa de aprendizaje 3e-5, con run id `2026-11-23-1032`; los pesos publicados corresponden al paso final. No se usaron corpus de aprendices ni datos no comerciales, ni texto de usuarios.

## Capacidades

- Corrección de concordancia de género y número en artículos, adjetivos y participios, incluso entre cláusulas.
- Concordancia sujeto-verbo (`Gli infermieri controlla` → `controllano`, `La legge vietano` → `vieta`).
- Corrección de la persona de los auxiliares `essere` y `avere` (`Noi è stanchi` → `siamo`).
- Preposiciones articuladas (`di il` → `del`).
- Elisión (`lo amico` → `l'amico`, `una analisi` → `un'analisi`).
- Acentuación (`perche`/`perchè` → `perché`, `e` → `è` cuando la frase lo requiere).
- Selección de artículo determinado (`il`/`lo`, `i`/`gli`: `il studente` → `lo studente`).
- Plurales de palabras terminadas en `-co/-go/-ca/-ga`.
- Detección de palabras duplicadas y capitalización al inicio de frase.
- Errores de registro coloquial en preguntas, imperativos y primera y segunda persona.
- Salida estructurada de sugerencias con posición de carácter (`start`, `length`), texto original y reemplazo, apta para subrayar y ofrecer la corrección en una interfaz.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un etiquetador de tokens especializado en una única tarea.

## Casos de uso

- Asistente de escritura integrado en el navegador o en el editor: el modelo se ejecuta en CPU vía ONNX Runtime y devuelve sugerencias con posiciones de carácter, de modo que la interfaz puede subrayar cada error y ofrecer el reemplazo sin enviar el texto a ningún servidor. Es el caso de uso original de Proofbird.
- Corrección de textos académicos o periodísticos en italiano: al no parafrasear y limitarse a ediciones locales, preserva el estilo y la voz del autor, algo crítico en contenido editorial donde una reescritura generativa introduciría cambios no deseados.
- Pretratamiento de corpus italianos antes de tareas de PLN: normalizar acentos, elisiones y concordancias en textos de redes sociales o foros mejora la calidad de embeddings y clasificadores posteriores sin alterar el contenido semántico.
- Herramienta de aprendizaje de italiano para estudiantes: las sugerencias explícitas (original y reemplazo) permiten mostrar al alumno exactamente qué error cometió y cuál es la forma correcta, con la posición exacta en su texto.
- Corrección en aplicaciones de mensajería o correo con requisitos de privacidad: al ser un modelo ONNX de 0,9 GB que corre en CPU, puede desplegarse en el propio dispositivo del usuario sin dependencia de la nube, cumpliendo requisitos de soberanía del dato.
- Validación automática en pipelines de publicación: integrado como paso previo a la publicación de contenido en italiano, detecta concordancias y errores ortográficos recurrentes antes de la revisión humana, reduciendo el coste de corrección manual.
- Corrección de subtítulos y transcripciones: los errores de concordancia y de auxiliares son frecuentes en transcripciones automáticas; el modelo los corrige con ediciones locales sin reescribir el texto transcrito.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Conjunto de oro (700 frases escritas a mano: 528 con un error cada una, 172 correctas) | 528 corregidas, 172 intactas, 0 no detectadas, 0 empeoradas |
| Correcciones erróneas sobre 4 000 frases cotidianas de Tatoeba | dato truncado en la información disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está exportado a ONNX fp32 y diseñado para ejecutarse en CPU.
- GPU recomendadas: no necesarias; el modelo está pensado para CPU. Cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero no es un requisito.
- Cabe en GPU de consumo: sí, aunque su diseño es para CPU; el tamaño del repositorio es de 0,9 GB.
- Opciones de despliegue: ONNX Runtime (vía `onnxruntime`), con el script `quickstart.py` proporcionado por el autor; también puede ejecutarse desde la línea de comandos con `python quickstart.py "frase"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `proofbird/gector-bert-it` | GECToR sobre BERT base | italiano | no disponible | Apache 2.0 | ONNX fp32 | Corrección local por ediciones, sin generación |
| `dbmdz/bert-base-italian-xxl-cased` | BERT base | italiano | no disponible | MIT | safetensors | Modelo base del anterior; no es un corrector por sí mismo |
| Correctores generativos multilingües (p. ej. basados en LLM) | LLM decoder | varios | variable | variable | safetensors/GGUF | Pueden reescribir y parafrasear; mayor coste computacional y riesgo de cambios no deseados |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo corrige italiano; no soporta otros idiomas.
- El modelo solo propone ediciones locales y no reescribe ni parafrasea; errores que requieran reestructurar la frase quedan fuera de su alcance.
- Entrenado exclusivamente con datos sintéticos generados por reglas: puede no cubrir fenómenos de error no contemplados en dichas reglas.
- No se han publicado métricas de sesgo; al derivar del encoder BERT italiano y de corpus enciclopédicos y parlamentarios, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación bajo en el sentido generativo (no produce texto libre), pero puede proponer ediciones incorrectas en contextos ambiguos o de registro muy informal.
- La longitud de contexto no está documentada; para frases muy largas el comportamiento no está especificado.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar el aviso de licencia y verificar la licencia del modelo base (MIT) y de los corpus de entrenamiento.
- Para producción, fijar la revisión `v1.1.2` (`revision="v1.1.2"`) y validar el comportamiento sobre el dominio concreto, ya que el conjunto de oro es reducido (700 frases).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-it
- Aplicación Proofbird: https://proofbird.app
- Demo en el navegador (Hugging Face Space): https://huggingface.co/spaces/proofbird/try-grammar
- Modelo base: https://huggingface.co/dbmdz/bert-base-italian-xxl-cased
- Dataset de Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Quickstart en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-it/blob/main/quickstart.ipynb
- Repositorio (revisión fijada): https://huggingface.co/proofbird/gector-bert-it/tree/v1.1.2
