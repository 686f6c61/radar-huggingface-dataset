# Erog0291/stew-audio-0.1

## Resumen

Stew Audio 0.1 es un sistema de reconocimiento automático del habla (ASR) publicado en HuggingFace por el desarrollador Erog0291 (Rejoice Gideon Emmanuel, «Erogian») bajo licencia Apache-2.0. Está diseñado específicamente para cinco lenguas habladas en Nigeria: igbo (ig), yoruba (yo), hausa (ha), pidgin nigeriano (pcm) e inglés nigeriano (en). El modelo se presenta como una «capa de inteligencia del habla» unificada con enrutamiento por idioma, en lugar de un único checkpoint monolítico: la model card menciona un `router.json` y checkpoints ASR por idioma publicados en el mismo espacio de nombres (`stew-audio-0.1-asr-ig`, `-yo`, `-ha`).

El problema que aborda es la cobertura deficiente de las lenguas nigerianas en los sistemas ASR globales, tanto en cobertura de idioma como en robustez frente a acentos locales. La propuesta del autor combina transcripción, identificación de idioma y enrutamiento, con la intención declarada de ofrecer checkpoints ligeros aptos para despliegue en móvil y servidor.

La información técnica disponible es muy limitada: no se especifican arquitectura, número de parámetros, longitud de contexto, esquemas de cuantización ni formato de pesos. Los benchmarks de Word Error Rate están marcados como «pending final run» en la propia model card, por lo que no existen resultados de rendimiento verificables publicados. El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, lo que indica un modelo recién publicado y sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica el tipo de red; se describe como sistema unificado con enrutador y adaptadores ligeros) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | igbo (ig), yoruba (yo), hausa (ha), pidgin nigeriano (pcm), ingles nigeriano (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se mencionan los ficheros `router.json` y `eval_benchmarks.json`, pero no el formato de los pesos) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura de red. Describe el sistema como un «speech brain» unificado con enrutamiento entre lenguas, apoyado en checkpoints ASR independientes por idioma (`stew-audio-0.1-asr-ig`, `stew-audio-0.1-asr-yo`, `stew-audio-0.1-asr-ha`) y en un fichero de configuración de enrutador (`router.json`). También menciona «adaptadores ligeros» orientados a despliegue en Edge, lo que sugiere una arquitectura modular con componentes específicos por lengua, aunque no se confirma ni el backbone acústico ni el tipo de decodificador.

No se publican datos sobre volumen de tokens de audio, composición del corpus, horas de entrenamiento, ni sobre el uso de técnicas de alineación o ajuste fino supervisado. Tampoco se indica si hubo entrenamiento con datos sintéticos, aumentación o etiquetado manual. La evaluación declarada se realizó sobre conjuntos de test de hablantes nativos y FLEURS-NG, con una metodología descrita como «mismo audio, misma normalización de texto, mismos hablantes de test», pero los resultados numéricos no están disponibles.

## Capacidades

- Transcripción de voz a texto (ASR) ajustada a habla nigeriana nativa, según declara el autor.
- Generación de voz (text-to-speech) con acento nigeriano: anunciada como «capa de generación de voz», sin checkpoint TTS identificado en la información disponible.
- Comprensión de audio con identificación de idioma y enrutamiento entre las cinco lenguas objetivo.
- Pipeline conversacional completo de entrada y salida de voz (voice interaction).
- Enrutamiento multilingüe mediante `router.json` para dirigir el audio al checkpoint correspondiente.
- Orientación a despliegue en Edge y en la nube mediante checkpoints ligeros.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo «thinking», visión o audio-video: no disponible.

## Casos de uso

- Transcripción de atención al cliente en igbo, yoruba o hausa: el modelo recibiría el audio de la llamada, identificaría el idioma mediante el enrutador y devolvería texto para el sistema de ticketing. Es adecuado si se confirma la calidad ASR, hoy sin cifras públicas.
- Subtitulado de contenido audiovisual nigeriano (Nollywood, medios locales): el checkpoint por idioma permitiría generar subtítulos en yoruba o hausa, con la ventaja de estar ajustado a acentos locales frente a modelos globales.
- Asistentes de voz en movilidad: la orientación a checkpoints ligeros y despliegue en Edge hace plausible su integración en aplicaciones móviles para dictado o comandos por voz en pidgin y lenguas nigerianas.
- Digitalización de historiales clínicos dictados: transcripción de notas de voz de personal sanitario en hausa o yoruba, con revisión humana posterior dada la ausencia de métricas de error publicadas.
- Enrutamiento e identificación de idioma en centros de contacto: usar la capa de language identification para dirigir cada llamada al agente humano que domine la lengua detectada, sin necesidad de transcripción completa.
- Accesibilidad y lectura de documentos: pipeline de texto a voz para convertir contenidos escritos en audio con acento nigeriano, siempre que se publique el componente TTS anunciado.
- Investigación lingüística y creación de corpus: generación de transcripciones para anotación de variedades del pidgin y del inglés nigeriano, con verificación manual obligatoria.
- Integración en asistentes conversacionales de voz: combinación de ASR y TTS para diálogo por turnos en entornos con micrófono cercano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de Word Error Rate (%) para igbo, yoruba y hausa, pero las tres filas de la columna «Stew Audio 0.1» y de la columna «Generic multilingual model» figuran como «pending final run». La evaluación de fluidez se describe en tres ejes (WER sobre 180 enunciados nativos en tres lenguas, fidelidad de puntuación y diacríticos, y precisión de identificación de idioma con code-switching), pero tampoco se aportan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica tamaño de parámetros ni formato de pesos, por lo que no es posible calcular requisitos de memoria.
- GPU recomendadas: no disponible. El autor no indica hardware de referencia ni pruebas de latencia.
- Compatibilidad con GPU de consumo: no confirmada. La model card afirma que hay «checkpoints ligeros» para móvil y servidor, pero no aporta cifras que permitan verificar que quepa en una RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: la librería declarada es `transformers`; la model card muestra un wrapper propio (`stew_audio.StewAudio.load(...)`) con un método `transcribe(audio, language=...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni existe confirmación de que el repositorio publique pesos utilizables directamente con `transformers`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos verificables de modelos alternativos (Whisper, MMS de Meta u otros sistemas ASR para lenguas africanas), por lo que no es posible construir una comparación numérica sin inventar cifras.

| Criterio | Stew Audio 0.1 | Modelo multilingue generico citado en la model card | Alternativas ASR para lenguas africanas |
|---|---|---|---|
| Parametros | no disponible | no disponible (no nombrado por el autor) | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible | no disponible | no disponible en la informacion proporcionada |
| Idiomas | ig, yo, ha, pcm, en | no especificado | no disponible en la informacion proporcionada |
| WER publicado | pendiente («pending final run») | pendiente | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 | no disponible | no disponible en la informacion proporcionada |
| Disponibilidad | repositorio HuggingFace, 0 descargas | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- La versión 0.1 está optimizada para igbo, yoruba y hausa; el pidgin se enruta por la ruta de voz del inglés, lo que puede degradar la transcripción de pidgin puro.
- El code-switching intenso dentro de una misma frase puede reducir la precisión, según reconoce el propio autor.
- El audio lejano con ruido requiere micrófono cercano; no se documentan técnicas de robustez frente a reverberación o ruido de fondo.
- No hay resultados de WER publicados: las métricas están pendientes, de modo que no existe evidencia cuantitativa de mejora frente a modelos genéricos más allá de la afirmación cualitativa del autor.
- El repositorio presenta 0 descargas y 0 «likes», sin validación independiente ni informes de terceros.
- No se especifican arquitectura, tamaño ni formato de pesos, lo que impide estimar costes de despliegue, requisitos de memoria o viabilidad en producción.
- El componente TTS y el pipeline conversacional se anuncian en la model card, pero no se identifican checkpoints publicados para ellos en la información disponible.
- Riesgo de alucinación y de errores de puntuación o diacríticos: la propia evaluación de fluidez incluye fidelidad de puntuación y diacríticos, pero sin resultados; en lenguas tonales como el yoruba los diacríticos son críticos para el significado.
- Sesgos conocidos: no documentados. No se aporta información sobre composición demográfica de los hablantes de entrenamiento, variedades dialectales cubiertas ni equilibrio entre lenguas.
- Licencia Apache-2.0: permite uso comercial y de investigación con atribución; el autor solicita mención («star the repo») pero no impone restricción adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Erog0291/stew-audio-0.1
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados al modelo. Los resultados de búsqueda obtenidos no guardan relación con el modelo y se han descartado por no ser fuentes utilizables.
