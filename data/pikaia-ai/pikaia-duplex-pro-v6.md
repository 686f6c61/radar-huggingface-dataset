# pikaia-ai/pikaia-duplex-pro-v6

## Resumen

Pikaia-Duplex Pro v6 (C2) es un modelo de clasificación de audio especializado en la gestión de turnos de conversación (turn-taking) en modo full-duplex, desarrollado por Pikaia AI. No genera texto ni transcribe voz: detecta de forma estrictamente causal tres eventos acústicos sobre audio estéreo de dos canales (uno por interlocutor): fin de turno (End-of-Turn, EOT), disponibilidad de respuesta (Response-Ready, RR) e interrupción (Interruption, INT). Su pipeline declarado en Hugging Face es `audio-classification`.

El modelo desacopla el timing acústico rápido (una corriente de reflejos a 25 Hz, 40 ms por trama, 18,3M de parámetros) de una comprensión semántica más lenta (una corriente a 160 ms de cadencia causal sobre un backbone de audio de Qwen3-ASR-0.6B al que se le han eliminado el vocabulario de texto y la cabeza `lm_head`). El conjunto suma 672,6M de parámetros activos en tiempo de ejecución y opera sin decodificación ASR: no produce texto intermedio.

Su relevancia actual reside en que aborda el problema del barge-in y la latencia de respuesta en asistentes de voz conversacionales sin depender de un ASR en cascada. Los pesos se mantienen privados por Pikaia AI; el repositorio público es documentación técnica y la presentación al leaderboard TurnBench, no una distribución de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida causal de dos corrientes: encoder acústico estéreo dual (PikaiaStereoNet) a 25 Hz + backbone de audio Qwen3-ASR-0.6B sin vocabulario de texto a 160 ms, con sidecar de atención cruzada de solo lectura (memoria de interlocutor) y puente temporal delta-acústico |
| Parametros totales | 672,6M activos en tiempo de ejecución (18,3M corriente rápida + 637,1M backbone semántico congelado) |
| Parametros activos | No es MoE; 672,6M activos en inferencia |
| Longitud de contexto | Prefijos causales de hasta 8,0 s en la corriente semántica; buffer circular causal de 24,0 s para la memoria de interlocutor; anillo de reflejos de 12 tramas (480 ms) en el puente |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | other (pesos privados; repositorio público de documentación) |
| Formato de pesos | No disponible (pesos no publicados) |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes acoplados sobre un reloj común de 25,0 Hz. La corriente rápida (`PikaiaStereoNet`, 18,3M de parámetros) procesa formas de onda estéreo de dos canales con banda limitada a 4 kHz y banda ancha a 16 kHz, con una guarda causal de 10 ms (160 muestras a 16 kHz) detrás de cada frontera de trama para evitar lookahead en los filtros polifásicos/FIR. Emite representaciones estéreo rápidas por trama, logits de reflejo EOT/INT, logits de estado de turno de cuatro clases (Silence, FloorTurn, Backchannel, Attempt) y señales de energía y sangrado entre canales.

La corriente semántica lenta (637,1M de parámetros congelados) reutiliza un backbone Qwen3-ASR-0.6B al que se le han eliminado 155,6M de filas del vocabulario de texto y la cabeza `lm_head`, conservando 8 filas de prompt fijas. Opera sobre prefijos causales de hasta 8,0 s sin decodificar ASR. Un sidecar de memoria de interlocutor (`M^1`) mantiene un buffer circular causal de 24,0 s alimentado por los encoders del canal del interlocutor, con una compuerta anti-sangrado basada en la relación de energía entre canales (`rms_partner > 0.009` y `rms_partner > 0.42 * rms_self` sobre el prefijo causal de 480 muestras), de modo que el ruido ambiental o el sangrado de sala no vacían el contexto del interlocutor. El sidecar de atención cruzada de 4 bloques es de solo lectura y no modifica los pesos congelados de la corriente propia (contribución exacta de 0,0 cuando el canal del interlocutor está en silencio). El puente temporal delta-acústico enlaza cada última instantánea semántica disponible (`t_k <= t`) con un anillo de reflejos rápido de 12 tramas (480 ms), registra la obsolescencia (`t - t_k`) y calcula una estadística de reanudación de voz posterior a `t_k` con orden temporal (`cummin`) que veta completaciones semánticas obsoletas si el hablante vuelve a hablar.

El entrenamiento usa `otoSpeech-full-duplex-turn-104h` (solo split de train; `val` y `quarantine` excluidos), segmentos verificados de handoff y backchannel de `OpenYap`, un corpus interno bilingüe ZH/EN de entrevistas con turnos (`split2085_expanded`) y pares sintéticos bilingües de preguntas-respuestas y contraste entre contextos con sangrado de sala RIR físico aleatorizado (0 de solapamiento verificado contra TurnBench, `oto_val`, LiveKit EOT-Bench y Pikaia v1.0.0). No se documenta en la información disponible el uso de RLHF, DPO ni el número total de tokens de entrenamiento. La causalidad estricta se verificó con pruebas de invariancia a truncamiento sobre audio crudo a 48 kHz (cortes a 4,0 s y 44,0 s frente a conversaciones completas de 52,0 s, con diferencia máxima absoluta de probabilidad <= 3,87e-7).

## Capacidades

- Detección de fin de turno (EOT) con punto de operación calibrado (`theta_eot = 0.75609`).
- Detección de interrupción (INT) con punto de operación calibrado (`theta_int = 0.04810`).
- Detección de disponibilidad de respuesta (Response-Ready, RR).
- Clasificación de estado de turno en cuatro clases: Silence, FloorTurn, Backchannel y Attempt.
- Procesamiento estéreo de dos canales, con un canal por interlocutor, y memoria de contexto del interlocutor de 24,0 s.
- Modo full-duplex: procesa simultáneamente ambos canales sin turnos de escucha forzados.
- Causalidad estricta verificada, apta para streaming en tiempo real sin lookahead.
- Sin decodificación ASR: no genera transcripción, solo decisiones acústicas de timing.
- Bilingüe inglés-chino.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM generativo; su salida son logits de clasificación y marcas temporales de decisión.

## Casos de uso

- Atención al cliente por voz en tiempo real: el modelo detecta el fin de turno del cliente con una latencia mediana de 406,0 ms y permite al agente virtual responder sin esperar silencios fijos, reduciendo la latencia percibida en conversaciones multi-turno.
- Gestión de barge-in en asistentes de voz: la detección de interrupción con latencia mediana de 375,0 ms permite que el asistente ceda el turno cuando el usuario empieza a hablar encima de él, en lugar de terminar su respuesta.
- Orquestación de agentes conversacionales: las señales EOT/RR/INT pueden alimentar la lógica de un agente que decide cuándo responder, cuándo callar y cuándo retomar, con marcas temporales exactas de decisión sobre un reloj de 40 ms.
- Sistemas de subtitulado o transcripción en directo con gestión de turnos: el modelo aporta la segmentación acústica de hablantes (quién tiene el suelo, cuándo cambia) que un ASR en cascada puede usar para alinear y segmentar la transcripción.
- Call centers y análisis de conversaciones: la clasificación de estados (FloorTurn, Backchannel, Attempt) permite medir solapamiento de habla, interrupciones y backchannels en grabaciones estéreo para control de calidad y analítica.
- Reuniones y entrevistas grabadas en estéreo: la memoria de interlocutor de 24,0 s y la compuerta anti-sangrado permiten distinguir voz del interlocutor de ruido de sala, útil para diarización asistida y detección de handoffs.
- Evaluación de pipelines de voz full-duplex: como referencia de turn-taking en benchmarks tipo TurnBench, sirve para comparar sistemas de diálogo por voz en recall, FPR y latencia de decisión.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre `mundo-ai/turn-benchmark-dev` (38 conversaciones), calibrados bajo el protocolo oficial de FPR <= 10% en Dev:

| Tarea | Punto de operacion | Recall | FPR | Latencia mediana |
|---|---|---|---|---|
| EOT | `theta_eot = 0.75609` | 92,49% | 9,88% | 406,0 ms |
| EOT (5-Fold OOF @ 10%) | — | 92,65% | 9,88% | — |
| INT | `theta_int = 0.04810` | 97,69% | 4,66% | 375,0 ms |

No se han publicado en la información disponible resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otros modelos de turn-taking.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 672,6M de parámetros activos, una estimación en FP16 rondaría 1,35 GB de pesos, pero no se documenta el consumo real del pipeline completo (buffers estéreo, sidecar de atención cruzada y estado de streaming).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros sería viable en GPUs de consumo con memoria suficiente, pero no hay datos oficiales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de clasificación de audio con pesos privados, no hay formato de pesos publicado.
- Latencia y throughput: la latencia de decisión reportada es de 406,0 ms mediana para EOT y 375,0 ms mediana para INT; no se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pikaia-Duplex Pro v6 (C2) | 672,6M activos | Prefijo causal 8,0 s; memoria 24,0 s | EOT/RR/INT full-duplex estéreo | other (pesos privados) | Solo documentación pública |
| LiveKit EOT-Bench (referencia de evaluación) | no disponible | no disponible | Evaluación de EOT | no disponible | Benchmark público citado en la model card |
| otoSpeech-full-duplex-turn-104h (dataset) | no aplica | no aplica | Corpus de entrenamiento full-duplex | no disponible | Dataset citado en la model card |

No se dispone en la información proporcionada de comparativas numéricas con modelos alternativos de turn-taking de tamaño o tarea equivalente.

## Limitaciones y advertencias

- Pesos no publicados: el repositorio es documentación; no se puede descargar ni ejecutar el modelo.
- Licencia `other` sin texto de licencia visible en la información disponible: el uso comercial no está confirmado y requiere consulta con Pikaia AI.
- Solo dos idiomas (inglés y chino); no hay soporte documentado para castellano ni otras lenguas.
- No produce transcripción ni texto: no sustituye a un ASR; debe combinarse con uno para aplicaciones que requieran contenido semántico.
- Riesgo de alucinación en el sentido de falsos positivos de EOT/INT: el punto de operación acepta hasta un 9,88% de FPR en EOT bajo el protocolo Dev, lo que puede provocar respuestas prematuras en producción.
- Umbrales calibrados sobre un conjunto Dev de 38 conversaciones; la generalización a dominios, acentos o condiciones acústicas distintas no está documentada.
- Dependencia de entrada estéreo de dos canales con separación por interlocutor; el rendimiento con audio mono o con mezcla de hablantes no está documentado.
- La compuerta anti-sangrado usa umbrales de energía fijos (`rms_partner > 0.009` y `rms_partner > 0.42 * rms_self`), sensibles a niveles de grabación y ruido de sala fuera de las condiciones de entrenamiento.
- Sin datos publicados sobre sesgos demográficos, de acento o de género.
- Fecha de creación del repositorio (2026-11-17) y cero descargas/likes: sin validación comunitaria ni reportes independientes.

## Enlaces

- Hugging Face: https://huggingface.co/pikaia-ai/pikaia-duplex-pro-v6
- Dataset de entrenamiento citado: `otoSpeech-full-duplex-turn-104h` (no se proporciona URL)
- Dataset citado: `OpenYap` (no se proporciona URL)
- Benchmark citado: `mundo-ai/turn-benchmark-dev` (no se proporciona URL)
- Benchmark citado: LiveKit EOT-Bench (no se proporciona URL)
