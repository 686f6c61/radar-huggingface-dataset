# pikaia-ai/smart-turn-v3.2-interview

## Resumen

Smart Turn v3.2-Interview es un clasificador de audio de 8.000.386 parámetros desarrollado por pikaia-ai que detecta el final de turno (end-of-utterance, EOU) y la disponibilidad de respuesta en entrevistas habladas bilingües (mandarín e inglés). Se trata de un fine-tuning del checkpoint pipecat-ai/smart-turn-v3, sobre el que se preserva la arquitectura exacta: un encoder Whisper-Tiny con un clasificador de pooling por atención. El modelo se publica junto al artículo *Pikaia Interview EOU Benchmark: Evaluating Response Readiness in Bilingual Spoken Interviews*.

El problema que resuelve es concreto: en un agente de voz, decidir cuándo el interlocutor ha terminado de hablar y el sistema puede responder sin interrumpir ni esperar de más. El modelo emite una probabilidad de "response-ready" a partir de una ventana de audio de 16 kHz mono, y está pensado para integrarse como drop-in en pipelines de ONNX Runtime y Pipecat.

Su relevancia actual radica en que demuestra que un encoder de 8 millones de parámetros, sin cambios estructurales, mejora de forma medible mediante un fine-tuning de una sola época sobre 3.891 puntos de decisión de entrevistas reales: +0,0575 de ROC-AUC en el split de test Tier 2 y una reducción de 161,4 ms en la latencia de espera en cascada. Es, por tanto, una pieza ligera y desplegable en CPU para sistemas de voz conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-Tiny + clasificador con attention pooling (audio-classification) |
| Parametros totales | 8.000.386 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio; ventana de decisión evaluada a 300 ms de pausa) |
| Tipos de cuantizacion | No disponible (checkpoint publicado en FP32 ONNX) |
| Idiomas soportados | zh, en |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (FP32) y safetensors (79 tensores) |

## Arquitectura y entrenamiento

La arquitectura es la de pipecat-ai/smart-turn-v3 sin modificaciones: un encoder Whisper-Tiny que extrae características del audio y un clasificador con attention pooling que produce una probabilidad binaria de final de turno. El checkpoint base se restauró de forma lossless desde `smart-turn-v3.2-gpu.onnx` (rev. `f766f81d`), sin reinicio de la cabeza ni cambios estructurales, lo que aísla el efecto del fine-tuning.

El entrenamiento consistió en una sola época con AdamW (lr=1e-5, weight_decay=0.01, batch efectivo de 8, gradient norm clip de 1.0) y entropía cruzada binaria con pesos inversos a la frecuencia de clase dentro de cada idioma. El corpus son 3.891 puntos de decisión de entrevistas habladas: 2.757 en mandarín (2.047 EOT / 710 HOLD) y 1.134 en inglés (773 EOT / 361 HOLD), distribuidos en 291 grupos de hablante/entrevista y sin solapamiento verificado con los splits del benchmark ni con LiveKit eot-bench. Las etiquetas combinan 238 pausas revisadas manualmente, 2.483 revisadas mediante transcripciones asistidas por ASR con consenso de tres LLM y 1.170 retenidas bajo consenso unánime de tres LLM. Se publican tres semillas (7, 17 y 29) para reproducir los resultados de media ± desviación estándar y del ensemble.

## Capacidades

- Detección de final de turno (EOU) y de disponibilidad de respuesta sobre audio de 16 kHz mono.
- Clasificación binaria EOT / HOLD con salida de probabilidad calibrada.
- Funcionamiento bilingüe en mandarín e inglés, incluyendo entrevistas con cambio de idioma.
- Interfaz drop-in compatible con pipelines de Pipecat y ONNX Runtime para Smart Turn v3.
- Inferencia en CPU sin dependencias de GPU gracias al checkpoint ONNX FP32.
- Ensemble de tres semillas disponible para reducir varianza en producción.
- No soporta tool calling, agentes, visión ni generación de texto: es exclusivamente un clasificador de audio.

## Casos de uso

- Turn-taking en agentes de voz: el modelo decide si el usuario ha terminado de hablar antes de que el sistema responda, reduciendo interrupciones en conversaciones multi-turno.
- Entrevistas habladas automatizadas: permite detectar cuándo el entrevistado ha completado su respuesta y avanzar a la siguiente pregunta con una latencia de espera en cascada de 555,1 ms en el split Tier 2.
- Atención al cliente telefónica: sustituye heurísticas de silencio por un clasificador entrenado, con una tasa de recall del 62,07 % a un 5 % de falsos positivos en el conjunto de test.
- Transcripción y diarización en tiempo real: al marcar los límites de turno, facilita el corte de segmentos para ASR y la atribución de hablantes.
- Voicebots bilingües mandarín-inglés: cubre escenarios de atención en los que el interlocutor alterna idiomas dentro de la misma conversación.
- Evaluación de pipelines de voz: sirve como referencia reproducible (tres semillas y umbrales congelados) para comparar estrategias de detección de fin de turno.
- Despliegue en dispositivos con recursos limitados: con 8 millones de parámetros y formato ONNX, cabe en entornos de CPU sin GPU dedicada.

## Benchmarks y rendimiento

| Evaluacion | Upstream v3.2 (zero-shot) | v3.2-Interview (seed29) | Media ± SD 3 semillas | Ensemble 3 semillas |
|---|---|---|---|---|
| Tier 2 test, ROC-AUC a 300 ms (N=1.100) | 0,8414 | 0,8989 (+0,0575, p=0,0010) | 0,8918 ± 0,0071 | 0,8976 |
| Tier 2 test, R@5 % a 300 ms (N=1.100) | 40,23 % | 62,07 % (+21,84 pp) | 58,48 % ± 3,25 % | 63,36 % |
| Tier 2 cascade Wait@5 % (N=788) | 716,5 ms | 555,1 ms (-161,4 ms, p=0,0030) | 594,7 ± 35,4 ms | 578,9 ms |
| Dual-human blind Agreed Gold, AUC (N=42) | 0,8639 | 0,9705 (+0,1066, p=0,021) | 0,9592 ± 0,0099 | 0,9637 |
| Strict Causal-243, AUC (N=243) | 0,6905 | 0,8012 (+0,1107, p=0,0010) | 0,7593 ± 0,0393 | 0,7770 |
| LiveKit eot-bench, AUC a 300 ms (N=1.058) | 0,7998 | 0,8391 (+0,0394, p=0,0010) | 0,8425 ± 0,0054 | 0,8474 |
| LiveKit eot-bench, cascade Wait@5 % | 780,4 ms | 734,5 ms (-45,9 ms, p=0,44) | 761,2 ± 28,0 ms | 766,2 ms |

En el split de desarrollo Tier 1 (N=100), la semilla seleccionada (seed29) alcanzó un ROC-AUC a 300 ms de 0,8892, frente a 0,8844 de seed17 y 0,8738 de seed7.

## Requisitos de hardware

- VRAM estimada: el checkpoint ONNX FP32 ocupa aproximadamente 32 MB de pesos (8,0 M de parámetros), por lo que la inferencia en CPU es viable sin GPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime (por ejemplo, A100, H100 o RTX 4090) puede ejecutar el modelo, pero está diseñado para cargas ligeras.
- Cabe en cualquier GPU de consumo e incluso en CPU de un solo núcleo; el tamaño del repositorio completo es de 0,2 GB.
- Opciones de despliegue: ONNX Runtime (interfaz drop-in de Smart Turn v3), pipelines de Pipecat y el script `inference.py` incluido en el repositorio.
- Latencia y throughput: la card reporta latencias de espera en cascada (555,1 ms en Tier 2 y 734,5 ms en LiveKit eot-bench a un 5 % de falsos positivos), pero no publica métricas de throughput ni de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | ROC-AUC 300 ms (Tier 2 test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smart Turn v3.2-Interview | 8,0 M | zh, en | 0,8989 | BSD-2-Clause | Hugging Face (pikaia-ai) |
| Smart Turn v3.2 (upstream, zero-shot) | 8,0 M | zh, en | 0,8414 | BSD-2-Clause | Hugging Face (pipecat-ai) |
| LiveKit eot-bench (referencia externa) | No disponible | No disponible | 0,7998 (evaluado con upstream) | No disponible | No disponible |

La comparación directa con alternativas de la misma categoría (clasificadores de fin de turno) no está disponible en la información proporcionada más allá del modelo base y del conjunto de evaluación externo de LiveKit.

## Limitaciones y advertencias

- El modelo es exclusivamente un clasificador de audio: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Solo cubre mandarín e inglés; no hay evidencia de rendimiento en otras lenguas.
- El fine-tuning se hizo sobre entrevistas habladas, por lo que el dominio de aplicación está acotado a ese tipo de conversación; el rendimiento en otros dominios no está documentado.
- El conjunto de entrenamiento es privado y no se publica el audio, lo que limita la reproducibilidad completa del entrenamiento (aunque se publican las tres semillas).
- Las etiquetas se generaron en parte con asistencia de LLM y consenso automático, lo que introduce un posible sesgo de anotación; los autores lo mitigan con el subconjunto de oro ciego dual-humano de 42 ítems.
- La mejora en LiveKit eot-bench en latencia de cascada (-45,9 ms) no es estadísticamente significativa (p=0,44).
- No se han publicado datos sobre sesgos demográficos, acentos o calidad de audio degradada.
- Licencia BSD-2-Clause: permite uso comercial con atribución y sin garantías; conviene conservar el aviso de copyright.
- El modelo base y la atribución corresponden a Pipecat / Daily; cualquier redistribución debe mantener dicha atribución.

## Enlaces

- Hugging Face: https://huggingface.co/pikaia-ai/smart-turn-v3.2-interview
- Modelo base: https://huggingface.co/pipecat-ai/smart-turn-v3
- Dataset del benchmark: https://huggingface.co/datasets/pikaia-ai/interview-eou-benchmark
- Dataset de investigación: https://huggingface.co/datasets/pikaia-ai/interview-eou-benchmark-research
- Artículo (arXiv preprint, Lin 2026): https://huggingface.co/datasets/pikaia-ai/interview-eou-benchmark
- Repositorio de Pipecat: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
