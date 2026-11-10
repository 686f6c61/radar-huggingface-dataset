# p99lab/turn-1-mini

## Resumen

turn-1-mini (v2) es un modelo de detección de fin de turno (end-of-turn, EOT) e interrupción (INT) para agentes de voz, desarrollado por Kollaikal Rupesh en p99lab. Con solo 5,4 millones de parámetros, resuelve un problema muy concreto y crítico en sistemas conversacionales de audio: decidir cuándo un hablante ha terminado su turno y cuándo otro está tomando la palabra, operando en streaming sobre audio crudo, sin transcripción y en tiempo real sobre CPU.

La versión 2 mantiene la clase de tamaño y coste de la v1 y añade soporte multipartícipe: recibe el canal de cada hablante y decide que el turno termina cuando el hablante propio ha callado y otro ha empezado a tomar la palabra. Incorpora además una salida de interrupción (probabilidad de que el hablante esté reclamando el turno, distinguiéndolo de un backchannel como "yeah" o "mm-hm"), salidas de actividad de voz y reclamación de turno por canal, y una entrada REST opcional con los demás canales de la llamada o la reproducción del propio agente.

Es relevante ahora porque los agentes de voz necesitan latencias de endpointing bajas y tasas de falsos cortes controladas para sonar naturales. El modelo se distribuye con licencia Apache-2.0, en formato safetensors y ONNX, y con un paquete Python (`p99turn`) que facilita su integración en pipelines de voz en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de detección de turno en streaming sobre audio (detalles internos no disponibles) |
| Parametros totales | 5,4 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesamiento en streaming por tramas de audio) |
| Tipos de cuantizacion | Pesos safetensors en FP (21 MB) y copia de 8 bits; grafos ONNX de streaming |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`turn-1-mini-v2.safetensors`, `turn-1-mini.safetensors`), ONNX |

## Arquitectura y entrenamiento

El modelo es un detector binario/multicanal que consume audio en streaming y emite puntuaciones de fin de turno (EOT), interrupción (INT), actividad de voz (VAD) y reclamación de turno (floor-claim) por canal. La v2 añade una entrada REST opcional que recibe los demás canales de la conversación o la reproducción del propio agente; sin ella, opera en modo monocanal idéntico a la v1. La lectura de fin de turno multicanal ("fast-onset") se diseñó tras inspeccionar falsos positivos en el split de desarrollo de MultiPartyTurnBench y se confirmó en el dev de TurnBench antes de evaluar el test.

No se detallan en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La model card menciona el uso de AMI Meeting Corpus (CC BY 4.0) en la ilustración y en el slice de reuniones reales, y advierte que cinco series de reuniones de ese slice pertenecieron a un conjunto de entrenamiento previo de p99lab cuya relación con el tronco de la v1 no se ha reverificado. Los umbrales de operación se seleccionaron sobre el split de desarrollo con un presupuesto de falsos positivos del 5,5 %, más estricto que el 10 % estándar del benchmark.

## Capacidades

- Detección de fin de turno (EOT) en streaming sobre audio crudo, sin transcripción.
- Detección de interrupción (INT): distingue toma de palabra de backchannels ("yeah", "mm-hm") y risas.
- Soporte multipartícipe con 2 a 5 hablantes, un canal por hablante.
- Salidas de actividad de voz (VAD) y reclamación de turno (floor-claim) por canal.
- Entrada REST opcional con los demás canales de la llamada o la reproducción del agente.
- Ejecución en tiempo real sobre CPU con PyTorch.
- Grafos ONNX de streaming para despliegue sin dependencia de PyTorch.
- Solo inglés; no soporta otros idiomas según la model card.

## Casos de uso

- Agentes de voz en atención al cliente: el modelo decide en unos 210 ms (p50 en MultiPartyTurnBench) si el usuario ha terminado de hablar, lo que permite respuestas naturales sin esperas artificiales ni cortes prematuros.
- Gestión de barge-in en asistentes telefónicos: la salida INT permite al agente detectar cuándo el usuario le interrumpe de verdad frente a una muletilla de confirmación, y pausar su reproducción en consecuencia.
- Reuniones multipartícipe con transcripción en vivo: con un canal por participante, el modelo marca los límites de turno para segmentar la transcripción y atribuir intervenciones, con 92,2 % de recall y 3,8 % de falsos positivos en MultiPartyTurnBench.
- Endpointing en pipelines de ASR en producción: al ejecutarse en CPU y en streaming, puede insertarse antes del reconocedor para cerrar el turno sin depender de silencios fijos, reduciendo la latencia percibida.
- Diarización ligera y análisis de reuniones: las salidas de VAD y floor-claim por canal permiten construir líneas de tiempo de quién habla y cuándo reclama la palabra, útil en herramientas de actas automáticas.
- Sistemas de voz embebidos o de bajo coste: con 5,4 M de parámetros y 21 MB en safetensors, cabe en dispositivos sin GPU y en contenedores con recursos limitados.
- Moderación de turnos en salas de voz multijugador: la detección de interrupciones permite aplicar políticas de silencio o prioridad de palabra en entornos con varios hablantes simultáneos.

## Benchmarks y rendimiento

| Benchmark | Medida | v1 (1.2.3) | v2 |
|---|---|---:|---:|
| MultiPartyTurnBench test (2-5 hablantes) | EOT | 86,9 % recall, 25,3 % FPR, p50 1087 ms | 92,2 % recall, 3,8 % FPR, p50 210 ms |
| MultiPartyTurnBench test (2-5 hablantes) | INT | 31,3 % recall, 9,5 % FPR, p50 777 ms | 28,5 % recall, 5,5 % FPR, p50 1021 ms (mismo umbral anterior: 40,9 %, 9,0 %, 810 ms) |
| TurnBench dev (2 hablantes) | EOT | 54,6 % recall, 9,9 % FPR, p50 811 ms | 82,1 % recall, 10,0 % FPR, p50 525 ms con REST (monocanal: 54,6 %, 9,9 %, 811 ms) |
| TurnBench dev (2 hablantes) | INT | 96,0 % recall, 4,2 % FPR, p50 688 ms | 96,8 % recall, 5,4 % FPR, p50 850 ms con REST (monocanal: 96,0 %, 3,6 %, 1083 ms) |
| eot-bench inglés (monocanal) | falsos cortes a 300 / 600 ms | 22,6 % / 9,6 % | 22,6 % / 9,6 % (sin cambios por construcción) |
| eot-bench inglés (monocanal) | latencia a 5 % / 10 % de cortes | 849 / 581 ms | 849 / 581 ms (sin cambios por construcción) |

En MultiPartyTurnBench EOT, con 192 conversaciones de test y bootstrap agrupado por conversación (B = 10 000), el recall es 92,2 % [91,6 %, 92,8 %], los falsos positivos en pausas intra-turno 3,8 % [1,2 %, 6,7 %] y la latencia mediana 210 ms [200, 221]. El paper del benchmark reporta VAP con 92,6 % de recall, 7,5 % de falsos positivos y 143 ms: el recall de v2 está a la par (intervalos solapados), su tasa de falsos positivos es menor y VAP decide unos 70 ms antes. En el slice de reuniones reales AMI (15 reuniones de cuatro personas, 7,1 h), el EOT alcanza 82,4 % de recall con 9,3 % de falsos positivos (p50 800 ms) e INT 86,2 % con 8,7 %; el paper reporta VAP con 52,1 % / 8,2 % (EOT) y 35,9 % / 5,3 % (INT), aunque el slice no tiene split dev/test y dos de sus reuniones están en el conjunto de desarrollo propio.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; los pesos v2 ocupan 21 MB en safetensors y el modelo corre en CPU en tiempo real.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente para streaming. No se publican requisitos de GPU.
- Cabe en cualquier GPU consumer y en dispositivos embebidos por su tamaño (5,4 M de parámetros).
- Opciones de despliegue: PyTorch en CPU mediante el paquete `p99turn` (extra `[torch]`), o grafos ONNX de streaming con `Turn1MiniOnnx` para entornos sin PyTorch.
- Latencia: mediana de 210 ms para EOT en MultiPartyTurnBench y 525 ms en TurnBench dev con REST; el throughput no se especifica en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento EOT | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| turn-1-mini v2 | Detección de turno en streaming | 5,4 M | No disponible | 92,2 % recall, 3,8 % FPR, p50 210 ms (MultiPartyTurnBench) | Apache-2.0 | Hugging Face, paquete `p99turn` |
| VAP (referencia del paper) | Predicción de actividad de voz/turno | No disponible | No disponible | 92,6 % recall, 7,5 % FPR, 143 ms (MultiPartyTurnBench) | No disponible | No disponible |
| Kyutai semantic VAD | VAD semántico | No disponible | No disponible | INT 56,2 % a 6,6 % FPR (MultiPartyTurnBench) | No disponible | No disponible |
| turn-1-mini v1 (1.2.3) | Detección de turno monocanal | 5,4 M | No disponible | 86,9 % recall, 25,3 % FPR, p50 1087 ms (MultiPartyTurnBench) | Apache-2.0 | Hugging Face (revisión e3c8bc7) |

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La detección de interrupción (INT) no es un punto fuerte: 28,5 % de recall con 5,5 % de falsos positivos en MultiPartyTurnBench, frente al 56,2 % a 6,6 % de Kyutai semantic VAD.
- El punto de operación se eligió con un presupuesto de falsos positivos del 5,5 % en el dev de MultiPartyTurnBench, y la lectura "fast-onset" se diseñó tras inspeccionar falsos positivos en ese mismo dev; la familia v2 se ha evaluado cuatro veces sobre el test split, lo que puede inflar ligeramente los resultados.
- Los números de TurnBench son sobre su dev público (las etiquetas de test no se publican) y su tasa de falsos positivos (10,0 %) está en el límite del presupuesto del benchmark.
- En el slice AMI de reuniones reales no hay split dev/test, por lo que las cifras son optimistas; además, dos reuniones están en el conjunto de desarrollo propio y cinco series pertenecieron a un conjunto de entrenamiento previo cuya relación con el tronco de v1 no se ha reverificado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de decisiones erróneas de turno (cortes prematuros o esperas excesivas) en dominios de audio distintos de los evaluados.
- No se documentan sesgos por acento, género o calidad de micrófono; la evaluación se limita a los corpus citados (AMI, TurnBench, MultiPartyTurnBench, eot-bench).
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los corpus de evaluación si se redistribuyen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/p99lab/turn-1-mini
- Model card de la v1 (revisión e3c8bc7): https://huggingface.co/p99lab/turn-1-mini/blob/e3c8bc794a00ebe58c3649ca236078fef4d7b9aa/README.md
- Paquete `p99turn` (wheel 2.0.0): https://huggingface.co/p99lab/turn-1-mini/resolve/main/dist/p99turn-2.0.0-py3-none-any.whl
- Pesos v2 (safetensors): https://huggingface.co/p99lab/turn-1-mini/resolve/main/turn-1-mini-v2.safetensors
- Pesos v1 (safetensors): https://huggingface.co/p99lab/turn-1-mini/resolve/main/turn-1-mini.safetensors
- AMI Meeting Corpus (CC BY 4.0): no disponible en la información proporcionada
