# cloud0day3/kuroko

## Resumen

Kuroko es un sistema de *turn-taking* (gestión de turnos de palabra) para conversación en inglés con dos canales de audio, desarrollado por PatientDesk AI como participación en TurnBench, el benchmark de Sesame AI Labs. El modelo resuelve dos problemas concretos en sistemas de voz conversacionales: decidir cuándo ha terminado el turno de un hablante y clasificar si un sonido del interlocutor es una interrupción real o un simple *backchannel* (un "mhm", un asentimiento).

El sistema no es un modelo único, sino una combinación de un detector de actividad de voz (Silero VAD 6.2.3), un conjunto de reglas temporales derivadas del trabajo de p99lab para turn-1-mini y un transformer causal de 14,9 millones de parámetros que procesa ambos canales como tramas log-mel de 80 bandas y emite una decisión 25 veces por segundo sobre si el sonido actual reclama el turno. El modelo pequeño se entrenó con 1.025 horas de conversación a dos voces (786 horas del corpus Open Yap 1K y unas 240 horas de grabaciones propias de PatientDesk).

La relevancia del proyecto es doble: por un lado, ataca un problema clásico y mal resuelto en agentes de voz (la latencia y los falsos positivos al detectar el fin de turno); por otro, es un caso poco habitual de publicación que incluye predicciones verificables y un registro de entrenamiento, pero no los pesos ni el código. El repositorio de Hugging Face solo contiene artefactos de evaluación, no el modelo en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de 14,9 M de parametros sobre tramas log-mel de 80 bandas; sistema hibrido con Silero VAD 6.2.3 y reglas temporales |
| Parametros totales | 14,9 M (solo el componente neuronal; el sistema completo incluye VAD y reglas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en flujo continuo, sin ventana declarada) |
| Tipos de cuantizacion | no disponible (los pesos no son publicos) |
| Idiomas soportados | Ingles |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio solo contiene JSON: predicciones, politica y registro de entrenamiento) |

## Arquitectura y entrenamiento

El sistema se organiza en tres etapas encadenadas. Primero, Silero VAD 6.2.3 analiza cada canal en pasos de 32 ms y marca tramos de sonido; un tramo se considera cerrado con certeza 0,26 s después de su último sonido. Después, un conjunto de reglas temporales (las publicadas por p99lab para turn-1-mini, sin sus componentes aprendidos y con los umbrales reajustados sobre el split de desarrollo) abre un candidato de fin de turno con cada parada, que se confirma cuando el interlocutor toma la palabra o cuando transcurren 2,45 s, salvo que el hablante vuelva. Finalmente, el transformer causal de 14,9 M de parámetros escucha ambos hablantes como tramas log-mel de 80 bandas y responde 25 veces por segundo si el sonido actual reclama el turno; esa respuesta permite confirmar una interrupción antes de que el sonido alcance los 1,3 s que exige la regla de duración, y avisa a las reglas de fin de turno de que el interlocutor ha tomado el relevo.

El entrenamiento usó 1.025 horas de conversación a dos hablantes: 786 horas del corpus con licencia Open Yap 1K y unas 240 horas de grabaciones propias de PatientDesk realizadas por contribuyentes que aceptaron ese uso. Las etiquetas provienen de una regla temporal aplicada a posteriori (en *hindsight*), verificada contra los anotadores humanos según el write-up del autor. Los objetivos de actividad futura del modelo siguen el trabajo de *voice activity projection* de Ekstedt y Skantze (2022). No se entrenó con audio ni etiquetas de los splits de desarrollo o test de TurnBench, y no se usó el conjunto otoSpeech.

## Capacidades

- Detección de fin de turno (*end-of-turn*) en conversación a dos canales, con una latencia mediana de 630 ms en el split de desarrollo.
- Clasificación de interrupciones frente a *backchannels*: distingue una toma de palabra real de un "mhm" o asentimiento.
- Detección de actividad de voz por canal mediante Silero VAD, con marcas de inicio y fin de tramos de sonido.
- Decisión en flujo continuo a 25 Hz sobre si el sonido actual reclama el turno.
- Procesamiento de audio de dos hablantes en paralelo, un canal limpio por hablante.
- No soporta *tool calling*, generación de texto, razonamiento, código, matemáticas, visión ni audio más allá de la clasificación de turnos.
- Sin capacidades multilingües: solo inglés.

## Casos de uso

- **Agentes de voz en atención al cliente**: el sistema puede integrarse en la lógica de *barge-in* de un agente telefónico para decidir cuándo el usuario ha terminado de hablar y cuándo lo está interrumpiendo, reduciendo la latencia percibida frente a un temporizador fijo.
- **Análisis de conversaciones grabadas**: procesar entrevistas o llamadas con dos canales para segmentar turnos, medir solapamientos y cuantificar interrupciones en estudios de interacción.
- **Evaluación de sistemas de diálogo**: usar las predicciones como referencia o componente de comparación en pruebas de *turn-taking* con audio de dos hablantes.
- **Investigación en interacción conversacional**: estudiar la distribución de *backchannels* e interrupciones en corpus anotados, aprovechando la salida a 25 Hz del componente neuronal.
- **Prototipos de asistentes presenciales**: en entornos con micrófonos separados por hablante (por ejemplo, cabinas o puestos de atención), alimentar la lógica de escucha activa de un asistente.
- **Sistemas de transcripción con diarización**: enriquecer transcripciones con marcas de fin de turno e interrupciones para mejorar la legibilidad y el análisis posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de desarrollo de TurnBench: 38 conversaciones, 1.904 fines de turno y 347 interrupciones, con los umbrales elegidos dentro de un presupuesto de falsa alarma del 8 %. La columna "held-out" repite la elección sobre la mitad de las conversaciones y evalúa en la otra mitad, con 500 particiones aleatorias. No hay puntuación de test.

| Tarea | Recall | Tasa de falsa alarma | Retardo mediano | Recall held-out | Falsa alarma held-out |
|---|---|---|---|---|---|
| Fin de turno | 0,987 (1.879 de 1.904) | 0,079 (84 de 1.063) | 630 ms | 0,983 | 0,082 |
| Interrupción | 1,000 (347 de 347) | 0,073 (272 de 3.733) | 545 ms | 0,988 | 0,061 |

Ablación sobre el mismo split (recall / falsa alarma / retardo mediano):

| Sistema | Fin de turno | Interrupción |
|---|---|---|
| Reglas con los ajustes publicados de turn-1-mini sobre el detector propio | 0,968 / 0,051 / 879 ms | 0,899 / 0,026 / 1.579 ms |
| Reglas con ajustes elegidos en dev | 0,983 / 0,080 / 692 ms | 0,977 / 0,076 / 1.078 ms |
| Kuroko (reglas y modelo) | 0,987 / 0,079 / 630 ms | 1,000 / 0,073 / 545 ms |

Con los eventos separados al menos 1 s, las cifras quedan en 0,975 de recall con 0,074 de falsa alarma en fines de turno y 1,000 con 0,070 en interrupciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El componente neuronal tiene 14,9 M de parámetros, lo que en fp32 ocupa aproximadamente 60 MB, pero los pesos no son públicos y no se han publicado requisitos oficiales.
- GPU recomendadas: no disponible. El autor no ha medido el sistema en CPU ni en streaming en vivo.
- Cabe en cualquier GPU de consumo por tamaño del componente neuronal, pero esta afirmación es una estimación a partir del recuento de parámetros, no un dato publicado.
- Opciones de despliegue: no disponible. Al no publicarse pesos ni código de entrenamiento, no hay integración conocida con vLLM, llama.cpp, Ollama o TGI; el sistema incluye Silero VAD 6.2.3, disponible por separado.
- Latencia y throughput: no disponibles. El retardo mediano de decisión (630 ms en fin de turno, 545 ms en interrupción) es una métrica de calidad del sistema, no una medida de latencia de inferencia.

## Comparativa con modelos similares

| Sistema | Parametros | Enfoque | Contexto | Recall fin de turno (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kuroko | 14,9 M (componente neuronal) | VAD + reglas + transformer causal | Flujo continuo | 0,987 | no disponible | Solo predicciones y ajustes |
| turn-1-mini (reglas publicadas, sobre el detector de Kuroko) | no disponible | Reglas temporales | Flujo continuo | 0,968 | no disponible | Reglas publicadas por p99lab |
| Silero VAD 6.2.3 | no disponible | Detector de actividad de voz | Pasos de 32 ms | no aplica (no decide turnos) | no disponible | Pesos y código públicos |

La comparación con turn-1-mini no es del todo equivalente: las cifras de la tabla corresponden a las reglas de turn-1-mini ejecutadas sobre el detector de Kuroko, según la ablación del autor, no al sistema original completo. No se dispone de datos de otros sistemas de *turn-taking* en la información proporcionada.

## Limitaciones y advertencias

- Las cifras son de desarrollo sobre 38 conversaciones y con los umbrales elegidos sobre ese mismo split; el recall de 1,000 en interrupciones es una medida *in-sample* y baja a 0,988 en la evaluación held-out. No hay puntuación de test.
- TurnBench graba a dos personas, de modo que las reglas de fin de turno pueden esperar a que la segunda empiece a hablar. En un agente de voz, el agente es el segundo hablante y esas reglas quedarían reducidas al temporizador de 2,45 s.
- Un fin de turno puede confirmarse dos veces y se confirma una interrupción por cada sonido interpretado como reclamación del turno; el scorer solo cuenta una falsa alarma por pausa y busca interrupciones únicamente cerca de interrupciones y *backchannels* anotados.
- Solo se ha medido con audio de estudio, un canal limpio por hablante y en inglés. No hay mediciones con audio telefónico, con eco, en streaming en vivo ni en CPU.
- Los pesos y el código de entrenamiento no son públicos, lo que impide reproducir el sistema o desplegarlo directamente.
- La licencia no está declarada, por lo que no puede confirmarse el uso comercial de los artefactos publicados.
- Riesgo de sesgo: el corpus de entrenamiento combina un conjunto licenciado y grabaciones propias, sin análisis publicado de sesgos por acento, género o edad.
- Riesgo de alucinación: no aplica en el sentido habitual, pero el modelo puede clasificar erróneamente sonidos no vocales o ruidos como reclamaciones del turno.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cloud0day3/kuroko
- Write-up del autor: https://spero.patientdesk.ai/blog/kuroko
- TurnBench (Sesame AI Labs): https://turnbench.sesame.com
- Scorer de desarrollo de TurnBench: https://turnbench.sesame.com/dev
- Silero VAD: https://github.com/snakers4/silero-vad
- Reglas de turn-1-mini (p99lab): https://github.com/P99Lab/turn-1-mini
- Open Yap 1K (The Agentic Data Company): https://theagenticdatacompany.com/open-yap-1k
- Paper de voice activity projection (Ekstedt y Skantze, 2022): https://arxiv.org/abs/2205.09812
- Paper de otoSpeech (Jiang et al., 2026): https://arxiv.org/abs/2608.25218
