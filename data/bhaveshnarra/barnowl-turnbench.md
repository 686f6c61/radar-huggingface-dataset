# bhaveshnarra/barnowl-turnbench

## Resumen

BarnOwl es el sistema de *turn-taking* (gestión de turnos de palabra) que Joveo presenta como entrada a TurnBench, un benchmark centrado en la detección de fin de turno e interrupciones en agentes de voz. No se trata de un modelo único, sino de un sistema con dos componentes diferenciados: por un lado, una política causal de decisión sobre tramas de actividad de voz para la tarea de fin de turno (EOT); por otro, un modelo neuronal en streaming de dos canales y 12 M de parámetros para la tarea de interrupción (INT). El autor del repositorio es `bhaveshnarra` y la model card está firmada como trabajo de Joveo.

La relevancia de este modelo reside en su enfoque de ingeniería para un problema clásico en agentes conversacionales de voz: decidir cuándo el usuario ha terminado de hablar y cuándo está interrumpiendo. En lugar de emplear un modelo de lenguaje grande para esta tarea, BarnOwl combina un detector de actividad de voz ampliamente utilizado (Silero VAD v5) con una política de reglas ajustada y un pequeño transformer causal de dos canales. El resultado es un sistema ligero, de baja latencia y diseñado para operar en *full-duplex*.

Es importante señalar que los pesos del modelo no están publicados. La model card describe la arquitectura y el proceso de entrenamiento, pero no ofrece un artefacto descargable, por lo que su uso directo en producción no es posible a partir de este repositorio. La información disponible es fundamentalmente descriptiva y metodológica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema híbrido: Silero VAD v5 + política de reglas causales (EOT); transformer causal de 4 capas y 256 de ancho con atención entre canales sobre encoder Whisper-tiny causal (INT) |
| Parámetros totales | 12,0 M (núcleo BarnOwl); 7,7 M corresponden al encoder |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana causal de 128 tramas en el núcleo; pasos de 160 ms sobre reloj de tramas de 20 ms |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | No disponible (pesos no publicados) |

## Arquitectura y entrenamiento

El sistema se divide en dos rutas. Para la detección de fin de turno (EOT), BarnOwl no emplea un modelo aprendido de turnos: utiliza Silero VAD v5 con ventanas de 512 muestras a 16 kHz sobre cada canal de hablante, precedido de un control automático de ganancia causal. La ganancia se recalcula cada 160 ms a partir del percentil 95 del RMS de tramas de 32 ms en los 10 s previos, con objetivo de −20 dBFS y recorte en [−12, +24] dB. Se considera habla cuando la probabilidad de Silero es ≥ 0,35. Sobre esa señal se aplica una política de reglas reimplementada a partir de `turn-1-mini` (Apache-2.0) y reajustada en el conjunto de desarrollo de TurnBench: un candidato de pausa se abre al terminar la vocalización del hablante, se puentean huecos menores de 0,2 s y el habla propia de 0,3 s cancela el candidato. El primer evento se dispara en la primera trama al menos 0,5 s después de la parada si el otro hablante lleva vocalizando ≥ 0,2 s, si el silencio dura 2,0 s, o si el otro hablante empezó ≥ 1,0 s antes de la parada y sigue hablando. A los 2,5 s se emite un segundo evento de confirmación si el candidato sigue abierto.

Para la interrupción (INT), el núcleo BarnOwl es un modelo en streaming de dos canales con 12,0 M de parámetros (7,7 M en el encoder). Cada canal se codifica con un encoder Whisper-tiny causal inicializado con pesos de OpenAI; después, un transformer de 4 capas y 256 de ancho con atención entre canales atiende causalmente sobre una ventana de 128 tramas, operando en pasos de 160 ms sobre un reloj de tramas de 20 ms. Sus cabezas predicen, por trama: actividad de voz de cada hablante, quién tiene el turno, fin de turno, proyección de actividad de voz futura de ambos hablantes y tipo de inicio. La señal de interrupción (E2) es la raíz cuadrada del producto de dos términos: la longitud de la racha de habla propia iniciada mientras el otro hablante hablaba (con puenteo de caídas de hasta 60 ms y tope de 1 s) y la probabilidad del modelo de que ese hablante tenga el turno. La regla de confirmación emite un evento por flanco ascendente por encima de θ = 0,62 con un refractario de 1,0 s.

El núcleo se preentrenó y ajustó con voz conversacional y de lectura pública, además de diálogos sintéticos propios generados con un LLM y sintetizados con TTS comercial en 14 idiomas. Los conjuntos incluyen Smart Turn v3.2, otoSpeech full-duplex (280 h y task-oriented v2), Snorbyte Indic, AMI, AliMeeting, YODAS2, Emilia-YODAS, FLEURS, Multilingual LibriSpeech y MediaSpeech, todos con licencias CC-BY o CC-BY-SA. No se usaron datos de clientes de Joveo ni audio de TurnBench; el conjunto de desarrollo se excluyó mediante un *leak guard* y el de test se descargó después de construir los datos de entrenamiento. La model card documenta una comprobación de fugas basada en duraciones y huellas de envolvente de energía logarítmica de 30 s, con coincidencia máxima de 0,94 frente a 1,0 para una copia exacta.

## Capacidades

- Detección de fin de turno (EOT) en conversaciones de dos hablantes mediante política causal sobre actividad de voz.
- Detección de interrupciones (INT) en tiempo real con un modelo en streaming de dos canales.
- Predicción de actividad de voz por hablante, incluyendo proyección de habla futura de ambos canales.
- Estimación de quién posee el turno de palabra en cada trama.
- Clasificación del tipo de inicio de habla (onset type).
- Operación en modo *full-duplex* con pasos de 160 ms y reloj de tramas de 20 ms.
- Procesamiento causal, apto para despliegue de baja latencia en agentes de voz.
- Soporte exclusivo de inglés según los metadatos del repositorio.
- No se documenta soporte de *tool calling*, agentes multi-paso, visión ni audio más allá del procesamiento de voz descrito.

## Casos de uso

- Agentes de voz en atención al cliente: el componente EOT permite decidir cuándo el usuario ha terminado de hablar combinando la actividad de voz con reglas temporales (0,5 s, 2,0 s, 2,5 s), lo que reduce respuestas prematuras en conversaciones telefónicas multi-turno.
- Sistemas de *barge-in* en asistentes: la señal de interrupción del núcleo BarnOwl, basada en la racha de habla propia solapada y la probabilidad de posesión del turno, permite que el agente se detenga cuando el usuario empieza a hablar encima.
- Reuniones y transcripción diarizada: el modelo predice actividad de voz por hablante y posesión del turno, útil para segmentar intervenciones en grabaciones de dos canales (por ejemplo, AMI o AliMeeting en el entrenamiento).
- Telefonía y centros de contacto: el control automático de ganancia causal y el umbral de Silero (≥ 0,35) están pensados para señales con niveles variables, habituales en líneas telefónicas.
- Evaluación de sistemas de voz: la descripción de la política y de la regla de confirmación (θ = 0,62, refractario de 1,0 s) sirve como referencia metodológica para replicar puntos de operación en TurnBench.
- Investigación en *turn-taking*: el desglose de la señal E2 y de las cabezas del núcleo permite estudiar el solapamiento de habla y la proyección de actividad futura en diálogos simulados.
- Síntesis de datos conversacionales: la metodología de generación de diálogos con LLM y TTS en 14 idiomas es reutilizable para construir corpus de entrenamiento de sistemas de turnos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los puntos de operación se ajustaron en el conjunto de desarrollo de TurnBench y describe convenciones de evaluación (eventos de confirmación a 2,5 s y evento al final del stream), pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El núcleo tiene 12,0 M de parámetros (7,7 M en el encoder), lo que en teoría supone un footprint muy reducido, pero no se publican pesos ni requisitos oficiales.
- GPU recomendadas: no disponible. Por tamaño, el núcleo podría ejecutarse en GPU de consumo, pero es una inferencia no confirmada por el autor.
- Compatibilidad con GPU de consumo: no confirmada; el sistema incluye además Silero VAD v5, cuyo coste es bajo pero no se cuantifica en la información disponible.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo es de audio en streaming y no un LLM.
- Latencia y throughput: no disponibles. Se conoce el paso de 160 ms sobre reloj de tramas de 20 ms y la ventana causal de 128 tramas, pero no se publican medidas de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| BarnOwl (TurnBench) | 12,0 M (núcleo) | 128 tramas causales, pasos de 160 ms | EOT e interrupción en voz | No disponible | No |
| Silero VAD v5 | No disponible | Ventanas de 512 muestras a 16 kHz | Actividad de voz | No disponible en la información | No disponible en la información |
| turn-1-mini (P99Lab) | No disponible | No disponible | Política de turnos basada en reglas | Apache-2.0 | No disponible en la información |
| Smart Turn v3.2 | No disponible | No disponible | Detección de fin de turno | CC-BY-4.0 (datos) | No disponible en la información |

La comparación se limita a los componentes citados en la model card; no se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- Los pesos no están publicados: el repositorio es descriptivo y no permite descargar ni ejecutar el modelo.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido.
- El sistema solo declara soporte de inglés; el entrenamiento incluyó datos en 14 idiomas, pero los metadatos restringen el uso a `en`.
- La ruta EOT no emplea un modelo aprendido de turnos, sino reglas ajustadas a un front-end concreto (Silero VAD v5 y AGC propio); su comportamiento puede degradarse con otro front-end o con condiciones acústicas distintas.
- La política EOT depende de umbrales fijos (0,35 de Silero, 0,5 s, 2,0 s, 2,5 s) que pueden requerir reajuste en dominios distintos a TurnBench.
- La señal de interrupción usa un umbral θ = 0,62 y un refractario de 1,0 s, distintos del valor por defecto de 2,0 s de TurnBench; los resultados no son directamente comparables con configuraciones estándar.
- La model card reconoce que una única ventana de huella (mejor coincidencia 0,94) no descarta por sí sola una copia degradada, aunque el análisis de alineación se presenta como complementario.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de falsos positivos y negativos en la detección de eventos de turno.
- No se documentan sesgos demográficos, acentos o condiciones de ruido más allá de la composición de los datasets de entrenamiento.
- El uso en producción requiere validación propia: no hay métricas publicadas de latencia, throughput ni precisión en dominios reales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bhaveshnarra/barnowl-turnbench
- turn-1-mini (P99Lab): https://github.com/P99Lab/turn-1-mini
- Smart Turn v3.2 train: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- otoSpeech full-duplex 280h: https://huggingface.co/datasets/otoearth/otoSpeech-full-duplex-280h
- otoSpeech full-duplex task-oriented v2: https://huggingface.co/datasets/otoearth/otoSpeech-full-duplex-task-oriented-v2
- Snorbyte Indic audio dialog (sample): https://huggingface.co/datasets/snorbyte/indic-audio-dialog-sample
- AMI meeting corpus (headset mix): https://huggingface.co/datasets/edinburghcstr/ami
- AliMeeting (near-field): https://www.openslr.org/119/
- YODAS2: https://huggingface.co/datasets/espnet/yodas2
- Emilia-YODAS: https://huggingface.co/datasets/amphion/Emilia-Dataset
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- MediaSpeech: https://www.openslr.org/108/
