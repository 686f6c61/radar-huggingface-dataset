# crele/nimbus-v1

## Resumen

Nimbus v1 es un modelo de decisión sobre audio en tiempo real desarrollado por Crele. A diferencia de un detector de actividad de voz convencional, responde preguntas de sí/no formuladas en lenguaje natural sobre lo que se está escuchando en cada momento ("¿hay música?", "¿alguien está escribiendo en un teclado?", "¿alguien está silbando?") y devuelve una respuesta cada 40 ms, junto con eventos de inicio y fin de cada sonido. Además, incorpora dos señales permanentes de identificación de hablante: `user` (la voz enrolada del usuario) y `other` (cualquier otra voz, incluida la de un televisor o altavoz).

El modelo está afinado a partir de `mispeech/dasheng-base` y se distribuye con licencia Apache 2.0, con un tamaño de repositorio de 0,4 GB y soporte únicamente para inglés. Su relevancia actual radica en que cubre necesidades concretas de los agentes de voz: barge-in selectivo (detener el habla del agente solo cuando interrumpe el usuario, no cuando habla alguien de fondo), detección del fin de turno del usuario incluso con otras voces presentes, y detección de solapamiento de habla.

La propuesta técnica es poco habitual: en lugar de un clasificador cerrado con etiquetas fijas, Nimbus acepta preguntas arbitrarias en inglés y las evalúa contra una representación de audio compartida, de modo que añadir preguntas nuevas tiene un coste computacional casi nulo. La latencia declarada es de 80 a 120 ms de audio tras el instante descrito, más el tiempo de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo afinado desde `mispeech/dasheng-base`; codificador de audio compartido por flujo más codificador de texto para las preguntas) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (procesamiento por flujos con pasos de 40 ms; ventana no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 0,4 GB; la primera ejecución descarga unos 1,5 GB entre el modelo y el codificador de texto) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna en la información disponible. El modelo parte de `mispeech/dasheng-base` mediante fine-tuning y se ejecuta a través de la librería propia `crele-nimbus`. El diseño funcional descrito en la model card separa dos componentes: un codificador de audio que procesa el flujo una sola vez por sesión y un codificador de texto que transforma cada pregunta del usuario en una consulta evaluada contra esa representación de audio. Esta separación explica que pasar de 8 a 32 preguntas simultáneas añada solo alrededor de 1 ms por paso de 80 ms.

El sistema incorpora además un modelo de embeddings de hablante que compara las voces del flujo con la huella de voz (voiceprint) generada en el enrolamiento. No se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Las cifras de calidad publicadas se midieron sobre 500 clips reales de AudioSet con los ajustes por defecto.

## Capacidades

- Detección de eventos sonoros mediante preguntas abiertas de sí/no en inglés, con respuesta `yes`, `no` o `cant_tell` y su probabilidad asociada.
- Respuesta continua cada 40 ms sobre el flujo de audio, con eventos de `started` y `stopped` por pregunta.
- Detección de actividad de voz (VAD) y verificación de hablante integradas: señales `user` y `other` siempre activas.
- Enrolamiento de la voz del usuario a partir de unos segundos de audio (float32, mono, 16 kHz), grabado en directo o desde fichero.
- Distinción entre el usuario y terceras voces, incluidas voces procedentes de televisores o altavoces.
- Detección de habla solapada: ambas señales pueden estar activas a la vez.
- Aceptación de audio en fragmentos de cualquier tamaño, sin restricción de chunking.
- Preguntas formuladas con palabras distintas a las del entrenamiento, con degradación medida de 0,911 a 0,892 de AUROC medio sobre 40 sonidos.
- Ajuste por pregunta de cuatro parámetros: `threshold` (0,70 por defecto), `start_secs` (0,12), `stop_threshold` (0,35) y `stop_secs` (0,30).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio-question-answering generativo más allá de las preguntas booleanas.

## Casos de uso

- Barge-in selectivo en agentes de voz: la señal `user` permite detener la locución del agente solo cuando interrumpe el usuario enrolado, ignorando voces de fondo o de un televisor, lo que evita cortes falsos en entornos domésticos ruidosos.
- Detección del fin de turno del usuario: la señal `user` baja de umbral mientras `other` puede seguir activa, de modo que el agente sabe cuándo ha terminado de hablar el usuario aunque haya otras personas conversando en la sala.
- Detección de solapamiento de habla: al poder estar `user` y `other` activas simultáneamente, un sistema de reuniones o de transcripción puede marcar tramos de habla cruzada y atribuirlos correctamente.
- Enrutado por contexto acústico: preguntas como "¿hay música?" o "¿alguien está escribiendo en un teclado?" permiten a un asistente adaptar el volumen de respuesta, pausar la reproducción multimedia o cambiar el modo de interacción según el entorno.
- Alertas de sonidos críticos: preguntas del tipo "¿está sonando una sirena?" con umbral ajustable permiten construir avisos de seguridad en dispositivos domésticos o industriales, con latencia declarada de unos 0,2 s tras el inicio del sonido.
- Atención al cliente telefónica: la combinación de VAD y verificación de hablante permite separar al cliente del agente humano o de voces de fondo en una llamada, mejorando la segmentación de turnos en la transcripción.
- Detección de incorporación de terceros: la transición de `other` de inactiva a activa señala que alguien se ha unido a la conversación o que se ha encendido una fuente de audio, lo que permite al agente cambiar de estrategia.
- Filtrado previo en pipelines de ASR: usar las señales de VAD y de hablante para recortar y etiquetar segmentos antes de enviarlos a un motor de reconocimiento de habla, reduciendo coste y falsos positivos.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre 500 clips reales de AudioSet con los ajustes por defecto:

| Metrica | Valor |
|---|---|
| Latencia mediana de detección de inicio de sonido | 0,24 s |
| Latencia mediana de detección de inicio de habla | 0,21 s |
| Tasa de detección de inicios de habla | 97 % de 181 inicios |
| AUROC medio con la formulación propia (40 sonidos) | 0,911 |
| AUROC medio con preguntas reformuladas no vistas (40 sonidos) | 0,892 |
| Respuesta en reposo máxima en sala silenciosa (12 preguntas) | 0,03 |
| Factor de tiempo real (CPU Apple M4 Pro, un flujo) | 0,7 (0,7 s de cómputo por segundo de audio) |
| Coste de pasar de 8 a 32 preguntas | ~1 ms por paso de 80 ms |
| Retardo de la respuesta respecto al instante descrito | 80-120 ms de audio más cómputo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,4 GB y la primera ejecución descarga unos 1,5 GB en total (modelo más codificador de texto), lo que sugiere un consumo de memoria moderado, pero no se especifica la huella en VRAM.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada explícitamente; el rendimiento publicado corresponde a CPU (Apple M4 Pro), con factor de tiempo real 0,7, lo que indica que el modelo puede ejecutarse sin GPU dedicada al menos en ese hardware.
- Opciones de despliegue: paquete Python `crele_nimbus` instalable desde el repositorio de GitHub, con API `Nimbus.from_pretrained` y sesiones por flujo. Incluye un playground en navegador (`python -m crele_nimbus.playground`) para probar con micrófono o fichero de audio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,7 en CPU Apple M4 Pro con un flujo y entre 8 y 32 preguntas; latencia de respuesta de 80 a 120 ms de audio más cómputo. No se publican cifras de throughput para GPU ni para múltiples flujos concurrentes.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| crele/nimbus-v1 | Detección de eventos y hablante en streaming | No disponible | No disponible | Inglés | Apache 2.0 | Preguntas abiertas de sí/no, señales `user`/`other`, RTF 0,7 en CPU |
| mispeech/dasheng-base | Modelo base de audio | No disponible | No disponible | No disponible | No disponible | Base sobre la que se afina Nimbus; sin datos de rendimiento en la información disponible |
| Detectores VAD clásicos (p. ej. Silero VAD) | VAD binario | No disponible | No disponible | Independiente del idioma | No disponible | Solo responden "¿hay voz?"; no distinguen hablantes ni responden preguntas abiertas |
| Clasificadores de eventos sonoros AudioSet (p. ej. PANNs, AST) | Clasificación cerrada | No disponible | No disponible | No disponible | No disponible | Etiquetas fijas de AudioSet; no admiten preguntas en lenguaje natural ni operan por eventos en streaming con esta latencia |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés: las preguntas y el comportamiento del modelo están entrenados y evaluados en inglés.
- Sin enrolamiento previo, la señal `user` devuelve `cant_tell` y `other` no puede distinguir al usuario de otras voces; el enrolamiento es obligatorio para cualquier caso de uso basado en identidad de hablante.
- La huella de voz generada en el enrolamiento constituye dato personal en muchas jurisdicciones; se requiere consentimiento del usuario y almacenamiento conforme a la normativa de protección de datos.
- Riesgo de alucinación en el sentido de falsos positivos y negativos en las respuestas: la model card documenta ajustes explícitos de umbral para mitigar detecciones perdidas o disparos excesivos, lo que implica que los valores por defecto no cubren todos los entornos.
- Las métricas publicadas se obtuvieron sobre 500 clips de AudioSet, un conjunto limitado y no representativo de todas las condiciones acústicas; no se documenta evaluación en dominios como telefonía de banda estrecha, audio con ruido industrial o habla con acento marcado.
- La formulación libre de preguntas degrada ligeramente el rendimiento (0,892 frente a 0,911 de AUROC), por lo que conviene validar el fraseo en producción.
- El rendimiento de latencia y RTF publicado corresponde a un único flujo en CPU Apple M4 Pro; no hay datos sobre concurrencia, GPU ni otros procesadores.
- No se documentan sesgos demográficos, acústicos ni de otro tipo en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre el modelo base `mispeech/dasheng-base`; conviene verificar la licencia de este último antes de un despliegue comercial.
- El paquete y la API se describen como provisionales en la propia model card ("the package's names are settled with the GitHub repository"), lo que implica riesgo de cambios incompatibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crele/nimbus-v1
- Página del modelo en Crele: https://crele.co/models/nimbus
- Repositorio de código: https://github.com/Crele-AI/nimbus
- Modelo base: https://huggingface.co/mispeech/dasheng-base
- Sitio de Crele: https://www.crele.co/
- Herramienta de aislamiento de voz de Crele: https://www.crele.co/isolate-a-speaker
