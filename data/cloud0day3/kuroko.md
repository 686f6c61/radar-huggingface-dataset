# cloud0day3/kuroko

## Resumen

Kuroko es un sistema de *turn-taking* (gestión de turnos de palabra) para conversación en inglés con dos canales de audio, desarrollado por PatientDesk AI para el benchmark [TurnBench](https://turnbench.sesame.com). Su función es decidir cuándo ha terminado el turno de un hablante y si un sonido del interlocutor constituye una interrupción real o una simple señal de escucha activa ("mhm"). Según la model card, el 17 de noviembre de 2026 ocupaba la primera posición por *recall* entre las 27 entradas del leaderboard de test en ambas tareas de TurnBench.

El modelo es un transformer causal de 14,9 millones de parámetros que procesa ambos canales de audio de forma conjunta y emite 25 respuestas por segundo y por hablante, usando únicamente el pasado (streaming estricto). No es un modelo de reconocimiento de voz ni de diálogo: es un componente especializado que se integra en un pipeline junto a un detector de actividad de voz (Silero VAD 6.2.3) y un conjunto de reglas temporales derivadas de turn-1-mini.

Su relevancia actual reside en que aborda un problema clásico de los asistentes de voz: la latencia artificial que introducen los sistemas que esperan silencios largos para ceder el turno, y la incapacidad de distinguir una interrupción genuina de un *backchannel*. Kuroko publica pesos, código de inferencia, configuración y predicciones sobre el split de desarrollo, con licencia Apache 2.0, aunque el código y los datos de entrenamiento no son públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención por capas (8 capas, 6 cabezas, dimensión 64), entrada mel y memoria KV |
| Parametros totales | 14.945.451 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 500 respuestas recordadas en el ejemplo de streaming (20 s); ventana de audio procesada en bloques de 40 s en modo offline |
| Tipos de cuantizacion | no disponible (pesos en safetensors; exportación ONNX en FP32) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (ONNX Runtime para streaming), PyTorch |

## Arquitectura y entrenamiento

Kuroko es un transformer causal de 14,9 M de parámetros que recibe audio de dos canales a 16 kHz (procedente de grabaciones originales a 48 kHz y 16 bits, una persona por canal) y produce 11 salidas probabilísticas por hablante a 25 Hz. Las 11 respuestas son `voice` (el hablante emite sonido), `claim` (ese sonido reclama el turno, la señal que se usa para disparar eventos), `hold` (el hablante mantiene el turno, pausas incluidas) y ocho predicciones adicionales sobre si el hablante y su interlocutor hablarán durante al menos la mitad de las ventanas de 0–0,2 s, 0,2–0,6 s, 0,6–1,2 s y 1,2–2 s hacia delante. La inferencia es estrictamente causal: cada respuesta en el instante *k* solo ha visto el audio hasta *(k+1)/25* segundos.

El modelo se entrena con audio de 16 bits a 48 kHz convertido a 16 kHz mediante `kuroko.features`, y la model card indica que el código y los datos de entrenamiento no son públicos, por lo que no se detalla el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable es la exportación a un único paso de streaming en ONNX (`onnx/kuroko-stream.onnx`) que consume 40 ms de ambos canales y devuelve las 11 respuestas del primer canal, manteniendo externamente la memoria de frames y las claves/valores por capa; esto permite ejecución en navegador con ONNX Runtime y sin dependencias adicionales, ya que las tramas mel se generan dentro del propio grafo.

## Capacidades

- Predicción de fin de turno (*end-of-turn*) a 25 Hz por hablante, con resolución temporal de 40 ms.
- Detección de interrupciones: la señal `claim` supera 0,9 desde 0,32 s después de iniciarse un sonido, antes de que se cumpla la regla de longitud de 1,3 s.
- Distinción entre interrupción y *backchannel* ("mhm"), usando la señal `claim` frente al umbral 0,5 para el sonido del interlocutor.
- Predicción anticipada de actividad de habla en cuatro horizontes temporales (hasta 2 s hacia delante).
- Procesamiento conjunto de dos canales (un hablante por canal) con atención causal sobre ambos.
- Modo streaming real mediante el grafo ONNX de un solo paso, con memoria KV gestionada por el llamante.
- Modo offline sobre conversaciones grabadas (12,6 minutos procesados en 11 s con cuatro hilos de CPU en tramos de 40 s).
- No soporta *tool calling*, agentes, visión, audio generation ni capacidades multilingües más allá del inglés.

## Casos de uso

- **Asistentes de voz en tiempo real**: Kuroko permite al asistente ceder el turno en cuanto el usuario termina, sin esperar silencios artificialmente largos, y detectar cuándo el usuario le interrumpe para detener la respuesta. La señal `claim` con umbral 0,9 desde 0,32 s es la que habilita esa reacción rápida.
- **Atención al cliente telefónica automatizada**: en conversaciones de dos canales (agente humano y cliente, o bot y cliente), el modelo distingue un "mhm" de una interrupción real, evitando que el bot se corte ante señales de escucha activa y permitiendo turnos más naturales en llamadas multi-turno.
- **Sistemas de transcripción con diarización en directo**: integrado con Silero VAD y reglas temporales, Kuroko aporta la decisión de fin de turno que los sistemas ASR necesitan para segmentar y atribuir intervenciones en reuniones o *call centers*.
- **Análisis de conversaciones grabadas**: el modo offline procesa una conversación de 12,6 minutos en 11 s con cuatro hilos de CPU, lo que lo hace adecuado para pipelines de análisis post-llamada (métricas de interrupciones, tiempos de habla, solapamientos).
- **Evaluación de agentes conversacionales**: al predecir actividad de habla hasta 2 s hacia delante, sirve como señal auxiliar para medir la naturalidad de un agente de voz en pruebas automatizadas de *turn-taking*.
- **Ejecución en el navegador o en el borde**: el grafo ONNX de un solo paso corre en navegador con ONNX Runtime, lo que permite prototipos de interfaz de voz sin backend, útil para demos y para entornos con requisitos de privacidad.
- **Investigación en *turn-taking***: los pesos, la configuración `policy.json` y las predicciones del split de desarrollo permiten reproducir y comparar contra TurnBench sin reentrenar.

## Benchmarks y rendimiento

La model card no publica cifras numéricas de benchmarks (MMLU, HumanEval, GSM8K u otros no aplican a esta tarea). El único dato de rendimiento declarado es cualitativo y de ranking: el 17 de noviembre de 2026, Kuroko tenía el mayor *recall* de las 27 entradas del leaderboard de test de TurnBench en ambas tareas. No se dispone de los valores concretos de *recall* ni de las métricas del split de test, ya que las predicciones de test no se publican a petición del benchmark.

Datos de rendimiento de inferencia declarados:

| Escenario | Medición |
|---|---|
| Offline, conversación de 12,6 min | 11 s con 4 hilos de CPU, en tramos de 40 s |
| Reproducibilidad en GPU | Las respuestas liberadas coinciden en las 38 conversaciones de dev |
| Reproducibilidad en CPU | Diferencia < 0,001 por respuesta (puede desplazar un cruce de umbral en 40 ms) |
| Audio de más bits leído como float | Desviación de hasta 0,02 por respuesta |

## Requisitos de hardware

- **VRAM estimada**: con 14,9 M de parámetros en FP32, los pesos ocupan aproximadamente 60 MB; la memoria KV y los buffers de frames son pequeños (en el ejemplo, 500 posiciones de contexto × 8 capas × 6 cabezas × 64 dimensiones). Cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: no se especifican requisitos mínimos; el modelo se ejecuta en CPU con cuatro hilos para el modo offline y en GPU para generar las predicciones de referencia. Una RTX 4090, A100 o H100 están sobradamente dimensionadas; una GPU integrada o una CPU moderna son suficientes para streaming.
- **Consumer GPU**: sí, en cualquier GPU con al menos unos cientos de MB libres; también en CPU.
- **Opciones de despliegue**: PyTorch con `safetensors` y `soundfile` (modo offline), ONNX Runtime (modo streaming de un paso, incluido navegador). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de audio.
- **Latencia y throughput**: 25 respuestas por segundo por hablante; en streaming, cada paso consume 40 ms de audio de ambos canales. No se publican cifras de latencia por paso ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kuroko | 14,9 M | 500 respuestas (20 s) en streaming; 40 s por tramo offline | *Turn-taking*, fin de turno e interrupciones | Apache 2.0 | Pesos, ONNX y predicciones dev en HF |
| turn-1-mini (P99Lab) | no disponible | no disponible | *Turn-taking* basado en reglas y partes aprendidas | no disponible en la información | Repositorio público en GitHub |
| Silero VAD 6.2.3 | no disponible | no disponible | Detección de actividad de voz por canal | no disponible en la información | Repositorio público en GitHub |

La comparación con modelos de la misma categoría (gestión de turnos) es limitada porque la información proporcionada no incluye parámetros ni métricas de turn-1-mini o Silero VAD. Kuroko se distingue por publicar pesos y exportación ONNX, mientras que turn-1-mini se usa en el pipeline como fuente de las reglas temporales y Silero VAD como detector previo. No se dispone de comparativas con otros sistemas de *turn-taking* del leaderboard de TurnBench.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Solo se ha medido la señal `claim` contra anotaciones; las otras 10 respuestas no tienen validación pública contra etiquetas.
- El modelo es una pieza de un pipeline de tres partes: requiere Silero VAD 6.2.3 y las reglas de `policy.json` para producir eventos de fin de turno e interrupción. Usarlo aislado no genera eventos.
- El código y los datos de entrenamiento no son públicos, lo que impide auditar sesgos o reproducir el entrenamiento.
- Las predicciones del split de test no se publican a petición del benchmark, por lo que la reproducibilidad completa de los resultados del leaderboard no es posible.
- Sensibilidad a la entrada: audio de más bits leído como float desvía las respuestas hasta 0,02, y en CPU la diferencia de 0,001 puede mover un cruce de umbral en 40 ms (un paso).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos/negativos en la detección de interrupciones, con impacto directo en la naturalidad del diálogo.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni limitaciones de responsabilidad más allá de las estándar de la licencia.
- No se especifican sesgos demográficos, acústicos ni de idioma más allá del inglés; no hay información sobre robustez ante ruido, acentos o canales cruzados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cloud0day3/kuroko
- Write-up del autor: https://spero.patientdesk.ai/blog/kuroko
- TurnBench: https://turnbench.sesame.com
- Silero VAD: https://github.com/snakers4/silero-vad
- turn-1-mini (P99Lab): https://github.com/P99Lab/turn-1-mini
- ONNX Runtime: https://onnxruntime.ai
- Paper de referencia citado en tags (arXiv:2608.25218): https://arxiv.org/abs/2608.25218
- Paper de referencia citado en tags (arXiv:2205.09812): https://arxiv.org/abs/2205.09812
