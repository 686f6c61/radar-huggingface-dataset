# openeurollm/tokenizer-256k-reason

## Resumen

OpenEuroLLM Tokenizer (256k) con tokens de razonamiento es un tokenizador SentencePiece basado en BPE con un vocabulario de 262.144 tokens, desarrollado por el proyecto OpenEuroLLM. No es un modelo de lenguaje, sino el componente de tokenizacion que acompana a la familia de modelos OpenEuroLLM, disenado especificamente para cubrir de forma eficiente todas las lenguas oficiales de la Union Europea y otras lenguas europeas adicionales (38 idiomas en total, incluyendo bulgaro, catalan, euskera, gallego, islandes, maltes y ucraniano, entre otros).

Esta variante concreta es un parche del tokenizador base de 256k en el que se han anadido tokens especiales para el razonamiento y el uso de herramientas: delimitadores de turno de chat estilo ChatML (`<|im_start|>`, `<|im_end|>`), marcadores de herramientas (`<tools>`, `</tools>`, `<tool_response>`, `</tool_response>`) y etiquetas de modo pensamiento (`<think>`, `</think>`). El tokenizador fue entrenado sobre 173 GB de texto multilingue curado del catalogo de datos de OpenEuroLLM, procesado en el superordenador LUMI.

Su relevancia radica en que proporciona una base de tokenizacion unificada y multilingue para modelos europeos que necesitan soportar razonamiento explicito y tool calling sin sacrificar eficiencia en lenguas de bajos recursos. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece BPE (tokenizador, no modelo generativo) |
| Parametros totales | no disponible (no aplica: es un tokenizador) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no disponible (no aplica a tokenizadores) |
| Idiomas soportados | 38: bg, bs, ca, cs, cy, da, de, el, en, es, et, eu, fi, fr, ga, gl, hr, hu, is, it, lb, lt, lv, mk, mt, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, tr, uk |
| Licencia | Apache 2.0 |
| Formato de pesos | SentencePiece (modelo BPE); el repositorio figura con 0.0 GB, sin artefactos listados en la informacion disponible |

## Arquitectura y entrenamiento

El tokenizador emplea SentencePiece con algoritmo BPE y un vocabulario de 262.144 tokens. Fue entrenado sobre 173 GB de texto multilingue curado procedente del catalogo de datos de OpenEuroLLM, con el procesamiento realizado en el superordenador LUMI. El objetivo de diseno es maximizar la eficiencia de tokenizacion en las lenguas oficiales de la UE, incluyendo aquellas con menor volumen de datos, evitando la fragmentacion excesiva que sufren los tokenizadores centrados en ingles.

Esta version parchea el tokenizador base reutilizando identificadores de tokens no usados para insertar tokens especiales de control. Segun la model card, los cambios son: `<|im_start|>` (ID 3, inicio de turno), `<|im_end|>` (ID 4, fin de turno), `<tools>` (ID 13), `</tools>` (ID 14), `<tool_response>` (ID 15), `</tool_response>` (ID 16), `</think>` (ID 15) y `<think>` (ID 16). Conviene senalar que la tabla de la model card asigna los IDs 15 y 16 tanto a `<tool_response>`/`</tool_response>` como a `</think>`/`<think>`, lo que constituye una inconsistencia documentada que debe verificarse contra los ficheros reales del repositorio antes de usarlo en produccion.

## Capacidades

- Tokenizacion multilingue eficiente para 38 lenguas europeas, con cobertura de las 24 lenguas oficiales de la UE.
- Soporte nativo de formato de chat estilo ChatML mediante `<|im_start|>` y `<|im_end|>`.
- Soporte de tool calling a nivel de tokenizador: delimitadores `<tools>`, `</tools>`, `<tool_response>` y `</tool_response>`.
- Soporte de modo de razonamiento explicito mediante `<think>` y `</think>`, pensado para modelos con cadenas de pensamiento.
- No genera texto, no razona ni ejecuta codigo por si mismo: es un componente de preprocesado para modelos de lenguaje.
- No dispone de capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Entrenamiento de modelos OpenEuroLLM: uso previsto como tokenizador de referencia para la familia de modelos europeos, garantizando cobertura equilibrada de las 38 lenguas del vocabulario.
- Fine-tuning multilingue de modelos europeos: permite adaptar modelos base a dominios concretos (legal, administrativo, sanitario) sin degradar la tokenizacion en lenguas minoritarias.
- Implementacion de asistentes con razonamiento: los tokens `<think>` y `</think>` permiten separar de forma estructurada la cadena de pensamiento de la respuesta final en el pipeline de entrenamiento e inferencia.
- Agentes con uso de herramientas: los delimitadores `<tools>` y `<tool_response>` facilitan el parseo determinista de llamadas a funciones y sus resultados en aplicaciones de agentes.
- Chat multi-turno en produccion: el formato ChatML (`<|im_start|>`/`<|im_end|>`) simplifica la construccion de plantillas de conversacion y el enmascarado de perdidas durante el entrenamiento.
- Investigacion en tokenizacion multilingue: util como linea base para comparar la eficiencia de compresion de tokens entre lenguas europeas y estudiar el sesgo hacia el ingles en tokenizadores comerciales.
- Despliegue de servicios de traduccion o resumen en lenguas de la UE: al reducir la fragmentacion de tokens en idiomas como el maltes, el estonio o el islandes, disminuye el coste computacional por documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un tokenizador, no requiere GPU para su uso en inferencia: la tokenizacion se ejecuta en CPU con la libreria SentencePiece.
- El coste computacional relevante es el del modelo de lenguaje que lo utilice, no el del tokenizador.
- El repositorio figura con un tamano de 0.0 GB y sin artefactos listados en la informacion disponible; debe verificarse la presencia de los ficheros `tokenizer.model`/`tokenizer.json` antes del despliegue.
- Opciones de despliegue: integracion via `transformers` (AutoTokenizer), `sentencepiece` o `tokenizers` de Hugging Face; no aplica vLLM, llama.cpp u Ollama como tales, aunque estos motores consumen el tokenizador del modelo correspondiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| OpenEuroLLM Tokenizer 256k (reason) | 262.144 | 38 europeos | Apache 2.0 | Tokens de razonamiento y tool calling anadidos |
| OpenEuroLLM Tokenizer 256k (base) | 262.144 | 38 europeos | Apache 2.0 | Version sin parche de tokens especiales |
| Tokenizadores de Llama 3 | 128.256 | ~8 principales | Licencia Llama | Menor cobertura de lenguas minoritarias europeas |
| Tokenizadores de Mistral | ~32.000-131.000 segun version | Principalmente europeas | Apache 2.0 (varia) | Cobertura menor del este y norte de Europa |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni resuelve tareas por si mismo; solo transforma texto en tokens.
- La model card presenta una inconsistencia en los IDs asignados a `<tool_response>`/`</tool_response>` y a `<think>`/`</think>` (ambos pares comparten los IDs 15 y 16); es imprescindible validar los identificadores reales antes de usarlo en produccion.
- El repositorio aparece con 0.0 GB y sin ficheros listados, por lo que la disponibilidad efectiva de los artefactos no esta confirmada en la informacion proporcionada.
- La eficiencia de tokenizacion depende de la lengua: aunque cubre 38 idiomas, las lenguas con menos datos de entrenamiento pueden presentar mayor fragmentacion.
- No se han publicado metricas de compresion de tokens por idioma en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribucion correspondiente.
- Al ser un componente de bajo nivel, cualquier cambio en el vocabulario invalida los embeddings de un modelo ya entrenado; solo debe usarse con modelos entrenados con este tokenizador exacto.

## Enlaces

- Hugging Face: https://huggingface.co/openeurollm/tokenizer-256k-reason
- Tokenizador base: https://huggingface.co/openeurollm/tokenizer-256k
- Organizacion OpenEuroLLM en Hugging Face: https://huggingface.co/openeurollm
