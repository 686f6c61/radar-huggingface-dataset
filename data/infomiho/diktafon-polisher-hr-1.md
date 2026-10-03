# infomiho/diktafon-polisher-hr-1

## Resumen

Diktafon Polisher HR 1 es un modelo de normalización de texto en croata desarrollado por infomiho. Su función es convertir transcripciones crudas de dictado en texto escrito limpio: añade puntuación y mayúsculas, elimina muletillas ("ovaj", "znači", "ono"), resuelve correcciones habladas evidentes y convierte números, horas y fechas a dígitos. No responde al contenido ni añade información; cuando duda, mantiene el original. Está pensado para ejecutarse después de un modelo de reconocimiento de voz dentro de la aplicación local de dictado Diktafon para macOS.

Se trata de un fine-tune completo de Qwen3.5-0.8B, con 752.393.024 parámetros en formato safetensors (1,5 GB de repositorio). Es un modelo decoder-only de texto, orientado exclusivamente al idioma croata (hr), y se distribuye bajo licencia Apache 2.0 junto con una versión GGUF para llama.cpp.

Su relevancia radica en que aborda una tarea de post-procesado que los motores de ASR resuelven mal: la limpieza de dictado espontáneo. En la evaluación del propio autor, encadenar Diktafon Dictate HR 1 con este pulidor reduce la tasa de error de palabras frente al texto escrito del 9,7% al 6,5% en 50 clips, y del 9,3% al 1,9% en 358 dictados de reserva que cubren correcciones, muletillas, números e instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; los pares de entrenamiento tenian como maximo 1.024 tokens y se recomienda pulir transcripciones de hasta unas 450 tokens |
| Tipos de cuantizacion | no especificados; el autor publica una version GGUF para llama.cpp |
| Idiomas soportados | croata (hr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del modelo base Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 752 millones de parámetros. No se emplean arquitecturas MoE ni híbridas. La etiqueta de la libreria apunta a la clase qwen3_5_text, y el modelo se integra en el ecosistema transformers con plantilla de chat basada en el formato estándar de Qwen (`<|im_start|>` / `<|im_end|>`), con un bloque de pensamiento vacío (`<think></think>`) que forma parte fija del prompt de entrenamiento.

El entrenamiento se realizó sobre aproximadamente 66.000 pares con 1 época, a una tasa de aprendizaje de 1,5e-5 y con la pérdida calculada únicamente sobre la respuesta. Los datos combinan pares de transcripciones crudas de ASR de discurso de podcast en croata junto con su forma escrita limpia, además de dictados sintéticos en croata organizados por categorías: correcciones, retractaciones, comandos de edición ("briši to"), cambios de opinión con motivo (que se mantienen tal cual se dijeron), muletillas, números junto a días de la semana, ordinales e idioms numéricos que se conservan como palabras, cantidades vagas que se mantienen vagas, e instrucciones dirigidas a un asistente (que deben transcribirse, no responderse).

La innovación principal es el enfoque de la tarea: el modelo está entrenado para no responder ni ampliar el contenido, sino únicamente para normalizar. El prompt de sistema está fijado literalmente en la model card, y el autor advierte de que cualquier otro enunciado constituye un prompt no visto. La decodificación recomendada es greedy, con parada en `<|im_end|>` y un tope de nuevos tokens equivalente a 1,3 veces los tokens de la transcripción más 32; si se alcanza el tope, se debe usar la transcripción cruda.

## Capacidades

- Normalización de dictado en croata: inserción de puntuación y mayúsculas coherentes.
- Eliminación de muletillas y repeticiones del habla espontánea ("ovaj", "znači", "ono").
- Resolución de correcciones habladas obvias ("do četvrtka, ne, petka" pasa a "do petka").
- Conversión de números, horas, fechas y cantidades a formato con dígitos.
- Conservación de ordinales e idioms numéricos como palabras cuando corresponde.
- Mantenimiento de la instrucción transcrita sin responderla ni ejecutarla.
- No añade contenido ni responde al texto: solo devuelve el texto normalizado.
- En caso de duda, conserva el original en lugar de inventar.
- No soporta tool calling ni function calling (no mencionado).
- No incorpora capacidades de voz, visión ni agentes; es estrictamente texto a texto y opera después del motor de ASR.
- Multilingüe: no; está limitado al croata (hr).

## Casos de uso

- Post-procesado dentro de la app de dictado Diktafon en macOS: el modelo se sitúa después de Diktafon Dictate HR 1 y devuelve texto escrito limpio, con una latencia media de 0,32 s en un M2 Pro en estado caliente, lo que lo hace apto para dictado interactivo.
- Transcripción de reuniones en croata: tras pasar el audio por un motor de ASR, el pulidor convierte el resultado en actas legibles con puntuación, correcciones resueltas y cifras en dígitos, evitando el trabajo manual de limpieza.
- Notas de voz profesionales (sanitarias, jurídicas o de consultoría): normaliza dictados largos y elimina vacilaciones, manteniendo el significado intacto y sin añadir interpretaciones, algo crítico en contextos donde no se debe alterar el contenido.
- Generación de subtítulos o transcripciones para podcasts en croata: aplicado a transcripciones automáticas de discurso espontáneo, mejora la legibilidad de cara a publicación o indexación.
- Procesamiento por lotes de archivos de audio previamente transcritos: al ser un modelo de 752M con versión GGUF, puede ejecutarse en CPU sobre colas de trabajo sin GPU dedicada para limpiar grandes volúmenes de transcripciones.
- Interfaces de voz para asistentes personales: al convertir instrucciones habladas a texto normalizado sin responderlas, permite que un sistema posterior interprete comandos como "briši to" o "sutra u devet" de forma fiable.
- Diarización y actas de entrevistas: la resolución de correcciones y la normalización de fechas y números facilita el análisis posterior y la búsqueda sobre el texto resultante.

## Benchmarks y rendimiento

Datos publicados por el autor. La primera tabla mide la tasa de error de palabras (WER) frente al texto escrito de referencia en 50 clips de dictado con referencias revisadas manualmente.

| Pipeline | WER |
| --- | ---: |
| Canary 1B v2 | 12,1% |
| Dictate HR 1 | 9,7% |
| Dictate HR 1 + Polisher HR 1 | 6,5% |

Evaluación sobre 358 dictados de reserva que cubren correcciones, muletillas, números, cantidades vagas e instrucciones:

| Metrica | Valor |
| --- | ---: |
| WER antes (sin pulidor) | 9,3% |
| WER despues (con pulidor) | 1,9% |
| Coincidencia exacta con la referencia en textos limpios | 93% |
| Coincidencia exacta en textos que solo parecen correcciones | 78% |
| Coincidencia exacta en instrucciones a un asistente | 77% |
| Latencia de pulido en caliente (M2 Pro) | 0,32 s mediana |

No se han publicado resultados de benchmarks estandar adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 752M parametros, no facilitada por el autor): en fp16 en torno a 1,5-2 GB; en int8 alrededor de 0,8-1 GB; en cuantizaciones GGUF de 4 bits en torno a 0,5-0,9 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 4090, A100 o H100 lo ejecutan con holgura y margen para batching, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1650 y superiores con suficiente VRAM) y tambien en CPU y en Apple Silicon.
- Latencia medida: 0,32 s de mediana por pulido en caliente en un Apple M2 Pro.
- Opciones de despliegue: transformers (safetensors), llama.cpp y Ollama mediante la version GGUF publicada por el autor; vLLM y TGI son compatibles por tratarse de un modelo transformers estandar, aunque el autor no los menciona.
- El modelo esta etiquetado como endpoints_compatible, lo que indica compatibilidad con inferencia gestionada tipo endpoints.

## Comparativa con modelos similares

No se han proporcionado alternativas de la misma categoria (normalizacion de texto para dictado en croata). La model card solo ofrece comparativas de pipeline frente a componentes de reconocimiento de voz, que no son equivalentes al pulidor:

| Elemento comparado | Tipo | WER en 50 clips | Licencia |
| --- | --- | ---: | --- |
| Canary 1B v2 | Modelo de ASR | 12,1% | no disponible en la informacion facilitada |
| Dictate HR 1 | Modelo de ASR en croata | 9,7% | no disponible |
| Dictate HR 1 + Polisher HR 1 | Pipeline ASR + normalizacion | 6,5% | Apache 2.0 (Polisher) |

Comparativa con el modelo base:

| Modelo | Parametros | Idioma | Tarea | Licencia |
| --- | ---: | --- | --- | --- |
| Qwen3.5-0.8B | ~752M | multilingue | generacion de texto general | Apache 2.0 |
| Diktafon Polisher HR 1 | 752.393.024 | croata (hr) | normalizacion de dictado | Apache 2.0 |

## Limitaciones y advertencias

- Aproximadamente la mitad de las correcciones habladas se resuelven de forma exacta; muchas quedan tal como se dijeron, lo que conserva el significado pero no produce el texto mas limpio posible.
- Riesgo de error con frases numericas: "jedno petsto eura" (unas 500) puede salir como "1500 eura", y "preko milijun" puede entrar en bucle generando ceros hasta alcanzar el tope de tokens, que debe reconducirse a la transcripcion cruda.
- No adivina palabras mal oidas, por lo que los errores del reconocimiento de voz pasan directamente al texto de salida.
- Dependencia estricta del prompt de entrenamiento: usar otro enunciado de sistema produce comportamiento fuera de distribucion, ya que el modelo nunca lo ha visto.
- Limite practico de longitud: los pares de entrenamiento no superaban los 1.024 tokens, por lo que se recomienda pulir transcripciones de hasta unas 450 tokens y dejar pasar las mas largas sin procesar.
- Decodificacion condicionada: requiere decodificacion greedy, parada en `<|im_end|>` y un tope de tokens de aproximadamente 1,3 veces los de la transcripcion mas 32; no seguirlo degrada la salida.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, aunque al entrenarse sobre discurso de podcast y dictados sinteticos en croata puede reflejar el registro y las convenciones de esas fuentes.
- Idioma: solo croata (hr); no cubre otras lenguas ni variantes.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, heredada del modelo base Qwen3.5-0.8B, tambien Apache 2.0.
- Para produccion, conviene aplicar la estrategia de respaldo descrita por el autor (usar la transcripcion cruda si se alcanza el tope de tokens o si la salida no es fiable).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infomiho/diktafon-polisher-hr-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de dictado previo en la pipeline: https://huggingface.co/infomiho/diktafon-dictate-hr-1
- Version GGUF para llama.cpp: https://huggingface.co/infomiho/diktafon-polisher-hr-1-GGUF
- Aplicacion Diktafon: https://diktafon.miho.dev
