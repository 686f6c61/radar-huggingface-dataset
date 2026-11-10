# naklecha/caramel-1

## Resumen

`caramel-1` es un modelo de conversación *speech-to-speech* de 413 millones de parámetros desarrollado por naklecha, entrenado exclusivamente con audio de habla, sin haber visto nunca texto. El modelo aprende a mantener diálogos hablados en tiempo real a partir de grabaciones de personas conversando, y es capaz de predecir tanto el contenido como el momento de hablar o callar, sin detector de actividad de voz ni reglas de turnos explícitas.

La relevancia del modelo reside en su enfoque metodológico: demuestra que un transformer puede aprender dinámicas conversacionales (solapamientos, backchannels, pausas) directamente de datos de audio con dos pistas separadas por hablante, y que dos copias del mismo modelo pueden conversar entre sí en tiempo real. Genera audio unas 11 veces más rápido que tiempo real en GPU y unas 4 veces en un MacBook Pro M3 Pro con ambas copias.

Se publica bajo licencia Apache 2.0 con pesos en safetensors y código de entrenamiento abierto, lo que lo convierte en una referencia útil para investigación en diálogo hablado full-duplex, aunque el propio autor advierte que la mayor parte de lo que dice aún no tiene sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos etapas: encoder/reader de ancho 1024 (cada 80 ms) y decoder/writer de ancho 512 que emite 8 tokens por frame |
| Parametros totales | 413.198.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa todo lo dicho hasta el momento, sin cifra publicada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado solo con habla; la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo es un transformer de dos etapas con dos flujos de entrada: la voz del propio modelo y la del interlocutor. Cada 80 ms, un transformer de ancho 1024 lee todo lo que ambos han dicho hasta ese momento; a continuación, un transformer más pequeño de ancho 512 escribe los 8 tokens del siguiente frame uno a uno. El primer token transporta principalmente el contenido lingüístico y los siete restantes la voz y la sala.

La entrada no es audio crudo: un códec neural convierte el audio de cada hablante en 12,5 frames por segundo con 8 tokens por frame (360.000 tokens por hora de una persona). El entrenamiento usó unas 5.743 horas de conversaciones de dos personas (4,1B tokens únicos) y 5.812 horas de habla individual (2,1B tokens únicos), totalizando 11.555 horas y 6,2B tokens únicos; el modelo procesó unos 33B tokens al ver los datos varias veces. Las fuentes fueron 66.824 feeds de pódcast y 3.216 canales de YouTube con licencia Creative Commons, con separación por hablante en pistas independientes. Cada conversación se usa dos veces en entrenamiento, una desde cada lado, de modo que los mismos pesos pueden interpretar cualquiera de los dos papeles. No hay detector de actividad de voz ni regla de turnos: el modelo predice cuándo hablar igual que predice el audio.

## Capacidades

- Generación de voz conversacional en tiempo real (speech-to-speech, audio-to-audio).
- Diálogo full-duplex: dos copias del modelo pueden conversar entre sí, escuchándose y decidiendo cada 80 ms si hablar o callar.
- Predicción implícita de turnos, solapamientos y backchannels sin reglas explícitas.
- Modelado de voz y características de la sala en los tokens 2 a 8 de cada frame.
- Generación aproximadamente 11 veces más rápida que tiempo real en GPU.
- Ejecución en hardware de consumo (MacBook Pro M3 Pro, ~4x tiempo real con dos copias).
- No soporta texto: no hay capacidad de tool calling, function calling ni razonamiento basado en lenguaje escrito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en diálogo hablado full-duplex: sirve como base reproducible para estudiar cómo emergen turnos, solapamientos y backchannels a partir de datos, dado que el código y la receta de entrenamiento son abiertos.
- Evaluación de métricas de conversación: la metodología de *closeness score* (13 estadísticas de timing y grabación comparadas contra bandas objetivo de Dessa) puede reutilizarse para puntuar otros sistemas de diálogo.
- Simulación de interlocutores para pruebas: dos copias del modelo pueden generar conversaciones sintéticas continuas para probar sistemas de reconocimiento de voz, diarización o detección de actividad de voz.
- Prototipado de agentes de voz en local: al correr a ~4x tiempo real en un portátil con Apple Silicon, permite experimentar con diálogo hablado sin infraestructura de servidor.
- Generación de audio conversacional para *data augmentation*: produce habla con estructura de diálogo (pausas, solapamientos) útil para aumentar datasets de ASR o diarización.
- Demostración educativa de la "bitter lesson": el modelo ilustra empíricamente que más horas de datos y más pasadas reducen la loss en conversaciones no vistas (de 1,954 con 1.356 horas a 1,809 con 5.743 horas y 5,65 pasadas) y mejoran la claridad de las palabras.
- Base para *fine-tuning* sobre dominios concretos: su tamaño de 413M y licencia Apache 2.0 facilitan adaptarlo a estilos conversacionales específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas propias de entrenamiento y evaluación:

| Metrica | Valor |
|---|---|
| Loss en conversaciones no vistas (1.356 h, 2,5 pasadas) | 1,954 |
| Loss en conversaciones no vistas (5.743 h, 2,4 pasadas) | 1,867 |
| Loss en conversaciones no vistas (5.743 h, 5,65 pasadas) | 1,809 |
| Claridad de palabra (1.356 h, 2,5 pasadas) | −0,47 |
| Claridad de palabra (5.743 h, 5,65 pasadas) | −0,29 |
| Claridad de palabra (personas reales, referencia) | −0,18 |
| Velocidad de generación en GPU | ~11x tiempo real |
| Velocidad en MacBook Pro M3 Pro (dos copias) | ~4x tiempo real |

La claridad de palabra se mide como la log-probabilidad media del transcript de un reconocedor de voz (más cerca de cero es más claro).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 413M parámetros en safetensors, el peso en precisión completa ronda los 1,6 GB (el repo completo ocupa 0,9 GB).
- GPU recomendadas: no se especifican modelos concretos; el autor reporta ejecución en GPU sin detallar cuál.
- Cabe en GPU de consumo: sí, según el autor, que lo ejecuta con dos copias simultáneas en un MacBook Pro M3 Pro a ~4x tiempo real.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; la librería indicada es PyTorch y el código está en github.com/naklecha/caramel.
- Latencia y throughput: ~11x tiempo real en GPU; ~4x tiempo real con dos copias en Apple Silicon M3 Pro; decisión de habla/callar cada 80 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caramel-1 | 413M | no disponible | Speech-to-speech full-duplex, solo audio | Apache 2.0 | Hugging Face + GitHub |
| Dessa | no disponible | no disponible | Conversación hablada (referencia inspiradora) | no disponible | no disponible |
| Modelos de diálogo texto (p. ej. familias LLM) | variable | variable | Texto, requieren ASR/TTS externos | variable | amplia |

No se dispone de datos de benchmarks comparables con otros modelos de speech-to-speech en la información proporcionada; la comparación con Dessa es cualitativa y metodológica (el autor usa sus conversaciones como banda de referencia para el *closeness score*).

## Limitaciones y advertencias

- Coherencia semántica limitada: el propio autor afirma que "la mayor parte de lo que dice caramel-1 no tiene sentido todavía"; las frases mejoran con más datos pero no son fiables.
- Entrenado solo con habla, sin texto: no puede razonar sobre lenguaje escrito, hacer tool calling ni seguir instrucciones textuales.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe ni de cobertura geográfica.
- Datos de origen web (pódcasts y YouTube CC): posibles sesgos de hablantes, acentos, estilos y temáticas sobrerrepresentados; no se documenta análisis de sesgo.
- Riesgo de alucinación conversacional: al predecir audio sin grounding semántico, puede producir contenido plausible acústicamente pero sin sentido.
- Sin detector de actividad de voz ni reglas de turnos: el comportamiento de turnos es emergente y puede fallar en dominios distintos al de entrenamiento.
- Longitud de contexto no publicada: no se especifica cuánto historial mantiene el transformer lector.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la calidad actual del habla generada no es apta para producción orientada a usuario final.
- Modelo de investigación: 0 descargas y 1 like en el momento de la consulta; sin validación externa ni comunidad establecida.

## Enlaces

- Hugging Face: https://huggingface.co/naklecha/caramel-1
- GitHub: https://github.com/naklecha/caramel
- Vídeo de muestras: https://huggingface.co/naklecha/caramel-1/resolve/main/docs/caramel_samples.mp4
- Gráfica de loss: https://huggingface.co/naklecha/caramel-1/resolve/main/docs/more_data.png
- Referencia Dessa: https://block.xyz/dessa
- The Bitter Lesson: http://www.incompleteideas.net/IncIdeas/BitterLesson.html
