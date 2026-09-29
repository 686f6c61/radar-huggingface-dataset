# myned-ai/pocket-tts-greek

## Resumen

Pocket TTS Greek es un modelo de síntesis de voz (text-to-speech) para griego moderno y griego chipriota, desarrollado por myned-ai como ajuste fino del modelo base kyutai/pocket-tts de Kyutai Labs. Se trata de un modelo compacto de unos 110 millones de parámetros (109.502.146 según el archivo de safetensors) que genera audio a velocidad superior al tiempo real en una CPU de portátil, con salida en streaming. Su objetivo es cubrir un hueco poco atendido: la síntesis de voz de calidad en griego con acento y voces chipriotas, que la mayoría de modelos multilingües trata de forma marginal.

La arquitectura es la de Pocket TTS, un modelo de texto a voz con tokenizador propio (SentencePiece de 4.000 tokens entrenado sobre transcripciones griegas correctamente puntuadas) y un estudiante de 6 capas obtenido por destilación en profundidad desde un profesor de 24 capas. El entrenamiento utilizó 2.395 horas de habla griega (766.000 enunciados, más de 3.900 hablantes, 50 % voces femeninas), de las cuales 115 horas son chipriotas, combinando pódcasts transcritos automáticamente y Mozilla Common Voice (el, el-CY).

Su relevancia actual es doble: por un lado, ofrece clonación de voz a partir de una muestra de 10-15 segundos junto con ocho voces curadas (dos chipriotas); por otro, su huella es mínima y puede ejecutarse en dispositivos sin GPU, lo que lo hace viable para asistentes embebidos, IVR telefónico y accesibilidad. Según la evaluación del autor, su inteligibilidad medida con Whisper large-v3 (11,2 % de WER) es comparable a la de grabaciones reales de las mismas frases (12,5 %), aunque con matices que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS (text-to-speech); estudiante de 6 capas destilado en profundidad desde un profesor de 24 capas |
| Parámetros totales | 109.502.146 (aproximadamente 110 M) |
| Parámetros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | No aplica: modelo de texto a voz, sin ventana de contexto autoregresiva de texto |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; los pesos se distribuyen en safetensors) |
| Idiomas soportados | Griego (el), incluido griego chipriota |
| Licencia | CC BY 4.0 (uso comercial permitido con atribución) |
| Formato de pesos | safetensors (tamaño del repositorio: 0,4 GB) |

## Arquitectura y entrenamiento

El modelo parte del base kyutai/pocket-tts y se entrena en dos etapas. Primero se ajusta un profesor de 24 capas desde el checkpoint inglés `english_2026-04_24l`, sustituyendo el embedding de texto por uno nuevo adaptado al griego, durante 300.000 pasos. Después se destila un estudiante de 6 capas a partir del profesor, con la guía de destilación incorporada en el propio modelo, durante 250.000 pasos. El tokenizador es un SentencePiece de 4.000 tokens entrenado sobre las transcripciones griegas; el autor corrige explícitamente un detalle relevante, y es que las transcripciones automáticas marcaban las preguntas con el signo latino `?` en lugar del signo griego `;`, y se convirtieron antes del entrenamiento.

Los datos de entrenamiento suman 2.395 horas de habla griega (766.000 enunciados de más de 3.900 hablantes, con un 50 % de voces femeninas), de las cuales 115 horas corresponden a chipriota. La composición es mayoritariamente pódcasts griegos transcritos y alineados automáticamente, más Mozilla Common Voice en sus variantes el y el-CY. Todo el entrenamiento se realizó en una única GH200 en aproximadamente 23 horas, con el código de entrenamiento público de Pocket TTS. Las innovaciones destacables son la destilación en profundidad desde un profesor de 24 capas hasta 6 capas (que reduce el coste de inferencia en CPU), la salida en streaming y un prompt de locutor que actúa como referencia de clonación.

## Capacidades

- Generación de voz en griego moderno y griego chipriota a partir de texto, con salida en audio y streaming.
- Clonación de voz zero-shot a partir de una muestra limpia y continua de 10-15 segundos; el modelo replica la calidad, el ruido de sala y el ritmo de la grabación de referencia.
- Ocho voces curadas integradas: Eleni, Athina, Katerina y Sophia (femeninas, Sophia chipriota) y Spyros, Kostas, Nikos y Giorgos (masculinas, Giorgos chipriota).
- Control de expresividad mediante temperatura: 0,3 por defecto (entrega uniforme) y 0,5-0,7 para un resultado más vivo pero menos regular.
- Inferencia en CPU más rápida que el tiempo real (3× según el autor), sin necesidad de GPU.
- Manejo de puntuación específica del griego (signo de interrogación `;` conservado en la configuración).
- Gestión de números escrita como palabras para mejorar la pronunciación ("στις δέκα και μισή", no "στις 10:30").
- Integración vía CLI (`uvx pocket-tts generate`) y vía API de Python (`pocket_tts.TTSModel`).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada; es exclusivamente texto a voz.

## Casos de uso

- Atención al cliente automatizada en griego: el modelo permite construir agentes de voz multi-turno que leen respuestas generadas por un LLM con voces consistentes, y su evaluación específica sobre 59 frases de estilo agente (87 % leídas limpiamente) apunta a este escenario. La clonación a partir de 10-15 segundos facilita mantener la voz corporativa de una marca.
- Sistemas IVR y centralitas telefónicas: al ejecutarse en CPU más rápido que el tiempo real y con salida en streaming, puede desplegarse en el mismo servidor que gestiona la llamada sin consumir GPU, lo que reduce costes en entornos de alto volumen de llamadas en griego.
- Audiolibros y contenido editorial griego: con voces curadas estables y control de temperatura para una lectura uniforme, es adecuado para convertir textos largos en audio; conviene previamente normalizar números a palabras y revisar la entonación interrogativa.
- Accesibilidad y lectores de pantalla: dado su tamaño (0,4 GB de repositorio) y su ejecución en CPU, puede integrarse en aplicaciones de escritorio o móviles para leer en voz alta interfaces y documentos en griego sin depender de servicios en la nube.
- Doblaje y localización con voces propias: la clonación zero-shot permite replicar la voz de un locutor con permiso para doblar vídeo o materiales formativos al griego, incluyendo variante chipriota con las voces Sophia y Giorgos.
- Asistentes embebidos y domótica: el modelo cabe en dispositivos con recursos limitados y no requiere acelerador, por lo que puede dar voz a dispositivos del hogar, kioscos o terminales de punto de venta que operen en griego.
- Generación de datos sintéticos para ASR: puede producir audio etiquetado en griego y chipriota para aumentar datasets de reconocimiento de voz, útil dado que el propio autor señala que Whisper falla en torno al 46 % de las palabras en habla chipriota real.
- Contenido para comunidades chipriotas: al cubrir una variante con poca representación en modelos multilingües, sirve para medios locales, podcasts y aplicaciones dirigidas a Chipre.

## Benchmarks y rendimiento

Evaluación sobre 80 frases griegas de 10 hablantes de Common Voice no vistos en entrenamiento; el prompt de voz es una grabación distinta del mismo hablante. El juez es Whisper large-v3 con temperatura 0,3.

| Métrica | Este modelo | Grabaciones reales |
|---|---|---|
| Word error rate (Whisper large-v3, temp. 0,3) | 11,2 % (excluida una alucinación de Whisper) | 12,5 % |
| Similitud de hablante (WavLM) | 0,912 | 0,937 (dos clips reales) |
| UTMOS | 2,98 | 2,46 |

Dato adicional aportado por el autor: sobre 8 voces × 59 frases de estilo agente, el 87 % de los clips se leyeron limpiamente. El propio autor advierte que Whisper malinterpreta el 12,5 % de las palabras incluso en habla griega real y que las frases de prueba son en buena parte literarias, por lo que los errores absolutos no son comparables con los de modelos ingleses. No se han publicado resultados comparativos con otros sistemas TTS griegos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia estándar; el modelo está pensado para CPU. Como referencia de tamaño, 109,5 M de parámetros ocupan aproximadamente 440 MB en fp32 o 220 MB en fp16 si se convirtieran los pesos, aunque el autor no documenta esos formatos.
- GPU recomendadas: no se requieren para inferencia. Para entrenamiento, el autor empleó una única NVIDIA GH200 durante unas 23 horas.
- Compatibilidad con GPU de consumo: no aplica; el modelo está diseñado explícitamente para ejecutarse en CPU de portátil. Cualquier GPU de consumo puede alojarlo, pero no aporta una ventaja documentada.
- Opciones de despliegue: biblioteca `pocket-tts` (CLI con `uvx pocket-tts generate` y API de Python `pocket_tts.TTSModel`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que son motores orientados a modelos de lenguaje, no a este tipo de TTS.
- Latencia y throughput: 3× más rápido que el tiempo real en CPU de portátil, con salida en streaming, según el autor. No se publican cifras de latencia en milisegundos ni de throughput por segundo de audio.
- Almacenamiento: el repositorio completo ocupa 0,4 GB.

## Comparativa con modelos similares

No se han proporcionado datos de sistemas TTS griegos alternativos, por lo que la comparación se limita a la propia familia de modelos.

| Modelo | Parámetros | Idiomas | Licencia | Ejecución en CPU | Notas |
|---|---|---|---|---|---|
| myned-ai/pocket-tts-greek (este modelo) | 109,5 M (6 capas) | Griego y griego chipriota | CC BY 4.0 | Sí, 3× tiempo real | 8 voces curadas, 2 chipriotas; clonación de voz |
| kyutai/pocket-tts (base) | no disponible | Inglés | CC BY 4.0 | no disponible | Modelo base del ajuste; sus voces inglesas (alba, etc.) no funcionan con el modelo griego |
| Profesor interno de 24 capas | no disponible | Griego | no disponible (no distribuido) | No aplica | Usado solo como origen de la destilación; el estudiante de 6 capas es el que se publica |

Para alternativas de terceros (por ejemplo, otros sistemas TTS multilingües con soporte de griego), la información disponible no incluye datos de parámetros, contexto ni rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Respuestas muy cortas: según el autor, aproximadamente 1 de cada 5 respuestas breves ("Εντάξει.", "Χαίρετε.") sale poco clara. Recomienda usar formas completas como "Εντάξει, το κανονίζω.".
- Entonación interrogativa: las preguntas suben menos al final de lo que lo hace el habla natural.
- Vocabulario poco frecuente: palabras fuera de la conversación cotidiana ("πλησιέστερο") se leen mal en ocasiones.
- Griego chipriota sin evaluación automática: Whisper malinterpreta en torno al 46 % del habla chipriota real, así que esta variante solo se ha validado de oído.
- Normalización de entrada obligatoria: los números deben escribirse como palabras y el signo de interrogación griego `;` no debe convertirse; de lo contrario, la pronunciación se degrada.
- Idiomas: el modelo solo produce griego (y chipriota). Las voces inglesas predefinidas del modelo base no funcionan con este ajuste.
- Riesgo de alucinación de audio: el propio autor excluye una alucinación de Whisper en la evaluación, lo que sugiere que pueden aparecer artefactos o tramos generados no presentes en el texto, especialmente en frases cortas.
- Clonación de voz: solo debe clonarse a personas con permiso explícito. El consentimiento es responsabilidad del usuario.
- Voces integradas: proceden de grabaciones de Mozilla Common Voice (CC0); el autor pide no intentar identificar a los contribuyentes y evitar determinados usos, aunque la sección de licencia de la model card aparece truncada en la información disponible y no permite citar la restricción exacta.
- Licencia: CC BY 4.0 permite uso comercial con atribución; hay que respetar también la licencia del modelo base kyutai/pocket-tts.
- Madurez del modelo: publicado el 28 de septiembre de 2026, con 0 descargas y 2 likes en el momento de la consulta; no hay validación independiente de la comunidad ni resultados de terceros.
- Comparabilidad de métricas: los WER publicados no son equiparables a los de modelos ingleses, ya que el propio juez automático comete un 12,5 % de errores sobre habla griega real.
- Los resultados de búsqueda web obtenidos no contienen información relevante sobre este modelo; no se han podido contrastar datos con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myned-ai/pocket-tts-greek
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Repositorio de código de Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- Código de entrenamiento: https://github.com/kyutai-labs/pocket-tts/tree/main/training
- Listado de voces y limpieza aplicada: https://huggingface.co/myned-ai/pocket-tts-greek/blob/main/voices/voices.md
- Configuración griega del modelo: https://huggingface.co/myned-ai/pocket-tts-greek/blob/main/greek.yaml
- Muestras de audio de las voces: https://huggingface.co/myned-ai/pocket-tts-greek/tree/main/samples
