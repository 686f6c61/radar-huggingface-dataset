# Prahaladha/hima-decide-head

## Resumen

hima-decide-head es una cabeza de clasificación de audio de 17,5 millones de parámetros desarrollada por Prahaladha, diseñada para operar sobre el modelo base de reconocimiento automático del habla (ASR) abierto Hima ASR (Prahaladha/hima-asr). Su función es responder preguntas en lenguaje natural sobre un clip de audio leyendo directamente la salida del codificador de Hima, en lugar de trabajar sobre la transcripción. De este modo, el modelo puede extraer información que el texto transcrito no contiene: tono de voz, género del hablante, idioma o si la persona ha terminado de hablar.

El modelo resuelve un problema clave en sistemas de agentes de voz: la detección de fin de turno (end-of-turn). Como Hima ASR genera texto en minúsculas y sin puntuación, un modelo de lenguaje que solo vea la transcripción no puede saber si el hablante ha terminado. Esta cabeza escucha directamente la señal acústica y proporciona esa señal con alta fiabilidad. Además, en una sola pasada por clip responde a múltiples preguntas (entre cuatro y cinco respuestas), con un tiempo de inferencia aproximado de 0,14 segundos por clip en la GPU de un MacBook, según la model card.

El modelo cubre 13 idiomas (12 indios más inglés, incluyendo habla con mezcla de código), tiene licencia Apache-2.0 y se distribuye como un único archivo Python junto con el modelo base abierto. El repositorio ocupa 0,1 GB y está publicado en noviembre de 2026, con cero descargas en el momento de la consulta. Se trata, por tanto, de un componente muy reciente y poco adoptado, pero funcionalmente especializado en el ecosistema de voz multilingüe de la India.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de clasificación sobre codificador de ASR (base: Prahaladha/hima-asr, congelado) + capas writer |
| Parametros totales | 17,5 M (cabeza); el modelo base Hima ASR es independiente |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre un clip de audio; el base model define el contexto acústico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 13: hindi, bengalí, telugu, tamil, marathi, gujarati, kannada, malayalam, punyabí, odia, assamés, inglés y habla con mezcla de código |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 0,1 GB; el pipeline declarado es audio-classification) |

## Arquitectura y entrenamiento

El modelo es una cabeza de clasificación de 17,5 M de parámetros montada sobre el modelo Hima ASR, que permanece congelado. La cabeza no consume la transcripción, sino las representaciones del codificador y de las capas writer del ASR, de forma que la decisión se toma sobre información acústica y prosódica. La interfaz es de tipo "audio question answering": el usuario formula una pregunta en inglés sencillo y ofrece una lista de opciones, y la cabeza devuelve la probabilidad de cada opción. Una sola ejecución del backbone por clip sirve para responder a todas las preguntas planteadas (cuatro o cinco en los ejemplos de la model card).

El entrenamiento se realizó sobre conjuntos de test retenidos que el modelo no vio durante su ajuste, según la model card, entre los que se incluyen grabaciones reales y voces sintéticas actuadas. No se especifica en la información proporcionada el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal es la lectura directa del codificador con preguntas parametrizables, que permite reutilizar el mismo forward para múltiples tareas de clasificación sin reentrenar.

## Capacidades

- Detección de fin de turno (end-of-turn): determina si el hablante ha terminado de hablar o si la frase ha sido cortada, a partir de la prosodia y no del texto.
- Identificación de idioma: clasifica entre 13 idiomas (12 indios más inglés) y habla con mezcla de código.
- Clasificación de género del hablante: hombre o mujer, a partir de la voz.
- Reconocimiento de tono o emoción: entre nueve tonos predefinidos (calm, polite, angry, frustrated, anxious, sad, rushed, confused, cheerful).
- Clasificación multimodal de preguntas: responde preguntas en inglés natural con opciones, reutilizando una única pasada del backbone.
- Soporte multilingüe con mezcla de código (por ejemplo, telugu e inglés en la misma frase).
- No se documenta soporte de tool calling, function calling, agentes multi-step ni generación de texto; es un modelo exclusivamente de clasificación de audio.

## Casos de uso

- Agentes de voz y detección de barge-in: en un sistema de atención telefónica, la cabeza indica si el usuario ha terminado de hablar, permitiendo que el agente tome la palabra en el momento adecuado sin interrumpir ni provocar pausas artificiales. Está pensado específicamente para este escenario y la model card reporta 12/12 en clips completos y 24/24 en clips cortados.
- Enrutamiento multilingüe en call centers: al identificar el idioma con alta precisión (35/36 en test real), permite derivar la llamada al agente o al modelo ASR adecuado sin depender de la transcripción.
- Análisis de sentimiento en conversaciones de soporte: la clasificación de tono entre nueve categorías permite detectar clientes frustrados, ansiosos o enfadados y priorizar la escalada.
- Analítica de contact center: clasificación de género y tono por llamada para informes agregados de calidad y segmentación de clientes.
- Detección de corte en grabaciones automáticas: en pipelines de transcripción por lotes, marcar clips truncados o incompletos antes de enviarlos a un modelo de lenguaje.
- Sistemas de voz para mercados indios: en asistentes bancarios o de comercio electrónico que operan en hindi, tamil, telugu y otros idiomas indios, el modelo puede gestionar la identificación de idioma y el turno dentro de una misma pasada de cómputo.
- Evaluación de calidad de agentes sintéticos: al clasificar tono y género en voces actuadas, sirve para auditar la naturalidad de respuestas generadas por TTS en pruebas internas.

## Benchmarks y rendimiento

Los únicos resultados disponibles proceden de la model card y corresponden a conjuntos de test retenidos, no a benchmarks públicos estándar:

| Tarea | Resultado reportado |
|---|---|
| Fin de turno, clips completos reales | 12/12 |
| Fin de turno, clips cortados al 45 % o 60 % | 24/24 |
| Fin de turno, conjunto completo (real y actuado) | 36/36 y 68/72 |
| Género del hablante, grabaciones reales | 12/12 |
| Idioma (13 clases), clips de test | 35/36 (el fallo fue un clip de 1 segundo con una sola palabra) |
| Tono (9 clases), clips actuados | 21/24 (confusiones entre vecinos: frustrado por enfadado, ansioso por triste, apresurado por ansioso) |
| Latencia por clip | ~0,14 s en GPU de MacBook para 4-5 respuestas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no realiza tareas de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la cabeza de 17,5 M de parámetros es muy ligera, pero requiere cargar el backbone Hima ASR completo para funcionar. El repositorio ocupa 0,1 GB, lo que sugiere que los pesos de la cabeza son pequeños y el coste principal recae en el modelo base.
- GPU recomendadas: la model card reporta ejecución en GPU de MacBook; por tamaño, debería caber en GPUs de consumo como RTX 3060, RTX 4090 o superiores, aunque no se especifican requisitos oficiales.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de la cabeza y el repo de 0,1 GB, siempre que el backbone Hima ASR quepa en memoria. No confirmado en la información disponible.
- Opciones de despliegue: la model card menciona "un archivo Python" para ejecutarlo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a LLM y no a este tipo de cabeza).
- Latencia y throughput: ~0,14 s por clip en GPU de MacBook para 4-5 preguntas, según la model card. No se reporta throughput por lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La categoría (cabezas de clasificación acústica sobre ASR para end-of-turn, género, idioma y emoción) no tiene alternativas citadas en la model card, y no se han encontrado datos de otros modelos en la búsqueda. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hima-decide-head | 17,5 M (cabeza) | no disponible | Apache-2.0 | HuggingFace |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo depende del backbone Hima ASR congelado; cualquier limitación o sesgo de ese modelo base afecta a las decisiones de la cabeza.
- Los resultados reportados son sobre conjuntos de test pequeños (12 a 36 clips según la tarea) y en parte con voces sintéticas actuadas, por lo que la generalización a dominios reales diversos no está validada.
- El tono se evaluó sobre voces sintéticas y con nueve categorías predefinidas; las confusiones entre tonos cercanos (frustrado/enfadado, ansioso/triste) sugieren sensibilidad a la definición de las etiquetas.
- La clasificación de género es binaria (hombre/mujer) y puede no representar adecuadamente voces no binarias o ambiguas; no se documentan sesgos demográficos.
- La identificación de idioma se evaluó con 13 clases y un fallo en un clip de 1 segundo con una sola palabra; clips muy cortos pueden degradar la precisión.
- El modelo no genera texto ni realiza razonamiento; no debe usarse para tareas de lenguaje, tool calling ni agentes autónomos.
- Aunque la licencia es Apache-2.0 (permite uso comercial), conviene verificar la licencia del modelo base Hima ASR, que no se detalla en la información proporcionada.
- El repositorio tiene cero descargas y Likes en el momento de la consulta; se trata de un artefacto muy reciente y sin validación independiente por parte de la comunidad.
- No se documentan requisitos de memoria ni compatibilidad con frameworks de despliegue estándar, lo que puede complicar la integración en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Prahaladha/hima-decide-head
- Modelo base: https://huggingface.co/Prahaladha/hima-asr
- Demos de audio (referenciadas en la model card): https://huggingface.co/Prahaladha/hima-decide-head/resolve/main/demos/ (archivos como english_woman.mp3, english_cut.mp3, hindi_man.mp3, tamil_woman.mp3, bengali_man.mp3, kannada_woman.mp3, malayalam_woman.mp3, angry_marathi.mp3, cheerful_gujarati.mp3, confused_punjabi.mp3, rushed_telugu_english.mp3, calm_odia.mp3)
- Archivo de respuestas de demo: https://huggingface.co/Prahaladha/hima-decide-head/resolve/main/demos/answers.json
- Paper, blog, repositorio o demo adicional: no disponible en la información proporcionada
