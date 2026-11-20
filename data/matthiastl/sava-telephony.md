# matthiastl/sava-telephony

## Resumen

SAVA Telephony es un ajuste fino no oficial del modelo SAVA de Inworld, un detector de actividad de voz (VAD) semántico y de detección de fin de turno diseñado para audio telefónico. El modelo original de Inworld funciona bien en audio de banda ancha (16 kHz), pero degrada su rendimiento cuando se enfrenta a audio telefónico comprimido (8 kHz, códec G.711 mu-law o GSM). Este ajuste fino, desarrollado por el usuario matthiastl, entrena el modelo sobre líneas telefónicas simuladas para recuperar la precisión perdida, manteniendo el mismo contrato de entrada/salida y la misma arquitectura que el modelo base.

El modelo tiene 25,5 millones de parámetros y emplea una arquitectura híbrida con un tronco basado en Mamba-2 y atención de ventana deslizante, con cabezas separadas para detección de habla y detección de fin de turno. Procesa audio en frames de 40 ms (640 muestras a 16 kHz) y emite, para cada frame, un logit de habla, un logit de lookahead (que evalúa el frame tres posiciones atrás) y cuatro logits de fin de turno a horizontes de 0, 5, 10 y 20 frames. El resultado es un detector de turno en streaming con latencia de 40 ms, adecuado para agentes conversacionales en tiempo real.

La relevancia de este ajuste radica en su aplicación práctica: los sistemas de atención al cliente y asistentes telefónicos necesitan distinguir con precisión cuándo un usuario ha terminado de hablar, y el audio telefónico degrada esta capacidad en los modelos VAD genéricos. Este modelo mejora la precisión de fin de turno del 89,5% al 93,0% en líneas fijas simuladas y del 88,5% al 92,4% en códec GSM, con un impacto mínimo en banda ancha. Se distribuye en formato ONNX (float32 e int8) y safetensors, con licencia Apache 2.0, lo que facilita su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: tronco Mamba-2 + atención de ventana deslizante, con cabezas de habla y fin de turno |
| Parametros totales | 25,5 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesamiento en streaming frame a frame; estado recurrente de 798.707 floats) |
| Tipos de cuantizacion | float32 (ONNX y safetensors), int8 (cuantización dinámica en 27 capas lineales grandes) |
| Idiomas soportados | No disponible (depende del audio de entrada; el modelo detecta habla y turnos, no transcribe idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), ONNX (float32 e int8) |
| Audio de entrada | 16 kHz mono float32 en [-1, 1]; remuestrear audio telefónico de 8 kHz a 16 kHz |
| Frame de procesamiento | 40 ms (640 muestras) |
| Opset ONNX | 20, solo operadores estándar |
| Modelo base | inworld/sava (revisión 1beae7c1dd0d) |
| Dataset de ajuste | pipecat-ai/smart-turn-data-v3.2-train |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del SAVA original de Inworld: un tronco híbrido que combina capas Mamba-2 (modelo de espacio de estados) con atención de ventana deslizante, seguido de dos cabezas de salida. La cabeza de habla emite un logit por frame indicando si el frame contiene voz, mientras que la cabeza de fin de turno emite cuatro logits que predicen si el turno ha terminado en horizontes de 0, 5, 10 y 20 frames (0, 200, 400 y 800 ms). El modelo mantiene un estado recurrente de 798.707 valores float32 que se pasa entre frames, lo que permite el procesamiento en streaming sin necesidad de reprocesar el historial completo.

El ajuste fino se realizó sobre el dataset `pipecat-ai/smart-turn-data-v3.2-train`, que contiene clips de audio etiquetados para detección de fin de turno. Según la model card, el entrenamiento se centró en simular condiciones telefónicas: audio a 8 kHz con banda 300–3400 Hz, comprimido con G.711 mu-law y con el códec GSM 06.10 de tasa completa. No se usó audio GSM real en el ajuste fino, solo simulado. El modelo no aprende capacidades nuevas, sino que adapta el comportamiento del original a las condiciones de la línea telefónica, donde el modelo base se vuelve demasiado conservador y pierde detecciones de habla.

La innovación técnica principal es la preservación del contrato de entrada/salida del modelo original, lo que permite sustituir los pesos sin cambiar el código de integración. Además, la cuantización int8 dinámica se aplica solo a las 27 capas lineales grandes, dejando el front-end, la atención y la recurrencia en float32, lo que reduce el tamaño del archivo a 27 MB sin pérdida medible de precisión (diferencias de ±0,02 puntos porcentuales en los benchmarks). El modelo se exportó a ONNX con opset 20 y solo operadores estándar, lo que facilita su despliegue en entornos de producción.

## Capacidades

- Detección de actividad de voz (VAD) en streaming: emite un logit de habla por cada frame de 40 ms, con un logit de lookahead que evalúa el frame tres posiciones atrás para mayor precisión.
- Detección de fin de turno (end-of-turn): emite cuatro logits que predicen si el turno ha terminado en horizontes de 0, 5, 10 y 20 frames, lo que permite decidir cuándo el usuario ha acabado de hablar.
- Procesamiento en tiempo real: el estado recurrente permite procesar audio de forma incremental sin reprocesar el historial, con latencia de un frame (40 ms).
- Robustez ante códecs telefónicos: entrenado para mantener precisión en audio 8 kHz con G.711 mu-law y GSM 06.10, condiciones típicas de líneas telefónicas.
- Compatibilidad con audio de banda ancha: mantiene el rendimiento del modelo original en audio de 16 kHz, con una precisión de fin de turno del 93,5%.
- Integración sencilla: el archivo ONNX tiene un contrato de entrada/salida fijo (`pcm`, `state` → `speech`, `lookahead`, `turn`, `new_state`) que facilita su uso en pipelines existentes.
- Cuantización int8: versión de 27 MB con precisión equivalente al float32, adecuada para despliegues con recursos limitados.
- No soporta tool calling, agentes multi-step, visión, audio (más allá de VAD) ni generación de texto; es un modelo especializado exclusivamente en detección de habla y turnos.

## Casos de uso

- **Atención al cliente telefónica automatizada**: el modelo se integra en un agente conversacional para detectar cuándo el usuario ha terminado de hablar y activar la respuesta del bot. Su entrenamiento en códecs telefónicos (G.711, GSM) reduce los falsos negativos en llamadas reales, lo que evita que el agente interrumpa al usuario o espere demasiado.
- **Sistemas de IVR (respuesta de voz interactiva)**: en menús telefónicos, el modelo puede distinguir entre silencio, ruido de fondo y habla real, y determinar el final del turno del usuario para avanzar en el flujo de forma natural, incluso en líneas de baja calidad.
- **Transcripción de llamadas en tiempo real**: integrado en un pipeline de ASR (reconocimiento automático del habla), el modelo segmenta el audio en turnos de habla, lo que mejora la precisión de la transcripción al evitar cortes prematuros o solapamientos.
- **Análisis de calidad de llamadas**: en herramientas de supervisión, el modelo puede detectar automáticamente si el agente y el cliente se solapan, si hay silencios prolongados o si la llamada se corta, proporcionando métricas objetivas de la interacción.
- **Asistentes de voz en centralitas IP**: en sistemas de telefonía sobre IP (VoIP), el modelo puede procesar el audio en streaming y decidir cuándo el usuario ha terminado de hablar para activar comandos de voz o respuestas del asistente, con latencia de 40 ms.
- **Detección de habla en grabaciones telefónicas**: para el post-procesado de grabaciones, el modelo permite eliminar silencios y segmentar el audio por turnos, lo que reduce el tamaño de los archivos y facilita la indexación y búsqueda.
- **Integración en plataformas de agentes conversacionales**: gracias a su formato ONNX y a su contrato de entrada/salida, el modelo se puede incorporar en frameworks como Pipecat, que ya utiliza modelos similares para la detección de fin de turno, sin necesidad de reescribir la lógica de integración.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo con el SAVA original y con Smart Turn v3.2 de Pipecat. Las métricas de fin de turno se calculan sobre los 31.527 clips de `pipecat-ai/smart-turn-data-v3.2-test`, con umbral 0,5 y lectura en el último frame del clip. Las condiciones son: banda ancha (16 kHz), línea fija simulada (8 kHz, 300–3400 Hz, G.711 mu-law) y móvil (misma banda, códec GSM 06.10). La precisión se presenta con AUC entre paréntesis.

| Modelo | Banda ancha | Línea fija | Móvil |
|---|---:|---:|---:|
| `inworld/sava` (original) | 93,36% (0,9795) | 89,52% (0,9575) | 88,52% (0,9493) |
| `sava-telephony.safetensors` | 93,50% (0,9797) | 93,03% (0,9772) | 92,42% (0,9740) |
| `sava-telephony.onnx` | 93,50% (0,9797) | 93,03% (0,9772) | 92,42% (0,9740) |
| `sava-telephony-int8.onnx` | 93,52% (0,9796) | 93,02% (0,9771) | 92,44% (0,9738) |
| Pipecat Smart Turn v3.2 (referencia) | 93,71% (0,9825) | 91,71% (0,9724) | 90,48% (0,9664) |

Las diferencias de precisión, emparejadas por clip, con intervalos de confianza del 95%, son:

| Comparación | Banda ancha | Línea fija | Móvil |
|---|---|---|---|
| Este modelo menos original | +0,15 (-0,00 a +0,28) | +3,51 (+3,23 a +3,81) | +3,90 (+3,58 a +4,21) |
| Este modelo menos Smart Turn v3.2 | -0,20 (-0,48 a +0,08) | +1,33 (+1,01 a +1,64) | +1,94 (+1,59 a +2,27) |
| int8 menos float32 | +0,02 (-0,06 a +0,10) | -0,02 (-0,10 a +0,07) | +0,02 (-0,08 a +0,11) |

En las 5.863 grabaciones reales del conjunto de test (el resto es habla sintética), el modelo obtiene 95,7% en banda ancha, 95,3% en línea fija y 94,6% en móvil; el original obtiene 95,8%, 90,2% y 89,5%; Smart Turn obtiene 94,8%, 93,1% y 92,3%.

En detección de habla sobre llamadas reales, el modelo original pierde el 28% del habla y genera un 8% de falsas alarmas; este ajuste fino pierde el 15% del habla y genera un 13% de falsas alarmas. La model card advierte que la mayor parte de la mejora en detección de habla es un efecto de umbral: el original se acerca si se baja su umbral de 0,5 a 0,17.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 25,5 M de parámetros. En float32, los pesos ocupan aproximadamente 102 MB; en int8, 27 MB. El estado recurrente añade 798.707 floats (aproximadamente 3,2 MB en float32) por stream. La VRAM total es inferior a 200 MB en float32 y a 50 MB en int8, incluyendo overhead.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente. Para despliegues de producción con múltiples streams concurrentes, se recomiendan GPUs como NVIDIA T4, L4, A10G o RTX 4090, que pueden manejar cientos de streams simultáneos gracias al bajo coste computacional por frame.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo moderna (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en CPU, dado su reducido tamaño. La versión int8 es especialmente adecuada para dispositivos embebidos o entornos con recursos limitados.
- **Opciones de despliegue**: el modelo se distribuye en ONNX, por lo que se puede ejecutar con ONNX Runtime (CPU o GPU), TensorRT, OpenVINO o cualquier runtime compatible con ONNX. También se puede cargar con el paquete `inworld-sava` en PyTorch. Para pipelines de streaming, se recomienda ONNX Runtime con ejecución en GPU para minimizar la latencia.
- **Latencia y throughput estimados**: la latencia por frame es de 40 ms (un frame de audio). El coste computacional por frame es muy bajo (25,5 M de parámetros, la mayoría en capas lineales), por lo que en una GPU moderna se pueden procesar cientos o miles de streams en tiempo real. No se han publicado cifras exactas de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión fin de turno (banda ancha / fija / móvil) | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `sava-telephony` (este modelo) | 25,5 M | Streaming (estado recurrente) | 93,5% / 93,0% / 92,4% | Apache 2.0 | Hugging Face (ONNX, safetensors) |
| `inworld/sava` (original) | 25,5 M | Streaming (estado recurrente) | 93,4% / 89,5% / 88,5% | Apache 2.0 | Hugging Face |
| Pipecat Smart Turn v3.2 | No disponible | No disponible (ventana de 8 s en su código de inferencia) | 93,7% / 91,7% / 90,5% | No disponible | Hugging Face (ONNX) |

La comparativa se limita a estos tres modelos porque son los que aparecen en la model card. No se dispone de información sobre otros modelos VAD o de detección de fin de turno con los que comparar en la información proporcionada.

## Limitaciones y advertencias

- **Ajuste fino no oficial**: este modelo no está hecho ni respaldado por Inworld. Es un ajuste fino de la comunidad sobre el modelo original, por lo que no cuenta con el soporte oficial del desarrollador.
- **Datos de evaluación simulados**: los números de fin de turno en línea fija y móvil provienen de líneas telefónicas simuladas, no de llamadas reales. La model card indica que no se pudo medir el fin de turno en llamadas reales porque no hay un conjunto de test con etiquetas para ello. Se recomienda probar el modelo con audio de llamadas propias antes de confiar en él.
- **Mejora en detección de habla dependiente del umbral**: en llamadas reales, la mayor parte de la mejora en detección de habla se debe a un efecto de umbral. El modelo original se acerca si se baja su umbral de 0,5 a 0,17. Este ajuste fino no enseña nada nuevo al modelo, solo adapta su comportamiento a la línea telefónica.
- **Falsas alarmas**: en llamadas reales, el modelo genera un 13% de falsas alarmas (frente al 8% del original), lo que puede provocar activaciones no deseadas en sistemas de detección de voz.
- **Sesgos conocidos**: no se han publicado análisis de sesgos en la información disponible. Al ser un modelo de detección de habla, puede verse afectado por sesgos acústicos (por ejemplo, en función del género, el acento o el ruido de fondo), pero no se dispone de datos al respecto.
- **Riesgo de alucinación**: no aplica en el sentido tradicional, ya que el modelo no genera texto. Sin embargo, puede producir falsos positivos o falsos negativos en la detección de habla y de fin de turno, lo que en un sistema conversacional podría provocar interrupciones o esperas innecesarias.
- **Limitaciones de idioma**: no se especifican idiomas soportados. El modelo detecta habla de forma acústica, por lo que en principio es independiente del idioma, pero no se han publicado evaluaciones por idioma.
- **Restricciones de licencia**: la licencia es Apache 2.0, lo que permite uso comercial, modificación y distribución, siempre que se mantenga el aviso de licencia y el aviso de Inworld para los pesos originales (archivo NOTICE). No obstante, al ser un ajuste fino no oficial, el usuario debe evaluar si el uso comercial es adecuado para su caso.
- **Caveat para producción**: el modelo está diseñado para audio de 16 kHz; el audio telefónico de 8 kHz debe remuestrearse a 16 kHz antes de la inferencia. El estado recurrente debe inicializarse a ceros al inicio de cada stream y pasarse entre frames; un manejo incorrecto del estado puede degradar el rendimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/matthiastl/sava-telephony)
- [Modelo base inworld/sava](https://huggingface.co/inworld/sava)
- [Dataset pipecat-ai/smart-turn-data-v3.2-train](https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train)
- [Pipecat Smart Turn v3.2 (modelo de referencia)](https://huggingface.co/pipecat-ai/smart-turn-v3.2-gpu.onnx)
- [Repositorio de Pipecat](https://github.com/pipecat-ai/pipecat) (no confirmado en la información, pero mencionado como contexto)
