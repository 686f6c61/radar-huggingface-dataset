# anuj-inavlabs/Kupe-ThinkSpark-Realtime-270M

## Resumen

Kupe-ThinkSpark-Realtime-270M es un modelo de clasificación de audio desarrollado por Kupe (a través de iNavLabs Research) que actúa como árbitro de conversación en tiempo real para agentes de voz. Su función no es transcribir audio (ASR), generar lenguaje (LLM) ni sintetizar voz (TTS), sino decidir quién tiene el turno de palabra en cada momento y qué debe hacer el agente: escuchar, esperar, interrumpir, continuar o preparar una respuesta. Resuelve el problema clásico de los agentes de voz que hablan por encima del usuario, esperan demasiado tras una pausa o no detectan interrupciones.

El modelo procesa tramas de audio de 80 ms a 24 kHz y emite una bandera de control entre diez posibles (LISTEN, HOLD, INCOMPLETE, TURN_END, BARGE_SOFT, BARGE_HARD, CONTINUE, PREFETCH_LLM, COMMIT_LLM, SILENCE_BREAK). Tiene 270 millones de parámetros según su nombre, aunque la model card no detalla la arquitectura interna. Su relevancia actual radica en que es una pieza ligera (decodificación de ~3 ms en GPU) que puede integrarse en pipelines de voz en tiempo real para mejorar la naturalidad y la robustez de la interacción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de clasificación de audio) |
| Parámetros totales | 270M (según el nombre del modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: procesa tramas de 80 ms de audio |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en), hindi (hi), guyaratí (gu) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

La model card no proporciona información sobre la arquitectura interna del modelo, los datos de entrenamiento ni el proceso de optimización. Se sabe que es un clasificador de audio que opera sobre tramas de 80 ms y que se describe como un modelo pequeño de 270M de parámetros, pero no se especifica si se trata de un transformer, una red convolucional u otra arquitectura. Tampoco se detalla el conjunto de datos utilizado, aunque existen repositorios públicos de fases de entrenamiento (por ejemplo, `kupe-thinkspark-270m-phase1-data`) que podrían contener parte de los datos. La ausencia de esta información es una limitación para quienes necesiten comprender el funcionamiento interno o replicar el entrenamiento.

## Capacidades

- Clasificación de control de turno en audio en tiempo real: emite una bandera por trama de 80 ms.
- Detección de actividad de voz (VAD): distingue si el usuario está hablando o no.
- Detección de interrupción (barge-in): diferencia entre interrupción suave (BARGE_SOFT) y dura (BARGE_HARD).
- Detección de final de turno: indica cuándo el usuario ha terminado de hablar (TURN_END).
- Detección de pausas incompletas: señala si el usuario ha hecho una pausa pero no ha terminado (HOLD, INCOMPLETE).
- Gestión de silencio: detecta silencio prolongado y sugiere al agente que diga algo (SILENCE_BREAK).
- Soporte de precomputación de LLM: emite PREFETCH_LLM y COMMIT_LLM para permitir llamadas especulativas al modelo de lenguaje.
- Funciona en CPU y GPU, con latencia de decodificación de ~3 ms en GPU (p50) y ~4.2 ms en p95.
- No es un modelo de ASR, LLM ni TTS; es una capa de control independiente.

## Casos de uso

- Atención al cliente telefónica: el modelo gestiona el turno de palabra en tiempo real, evitando que el agente hable por encima del usuario o espere en exceso tras una pausa. Se integraría entre el STT y el TTS, usando las banderas TURN_END y BARGE_HARD para sincronizar la respuesta.
- Asistentes de voz en aplicaciones móviles: permite interacciones de voz full-duplex donde el usuario puede interrumpir al asistente en cualquier momento; BARGE_HARD detiene la síntesis de voz al instante.
- Reemplazo de IVR (respuesta de voz interactiva): en sistemas de menú telefónico, el modelo decide cuándo el usuario ha terminado de hablar y cuándo debe el sistema continuar, mejorando la fluidez de la navegación.
- Asistentes de voz en vivo (p. ej., en vehículos o dispositivos domésticos): el modelo detecta el final de la frase del usuario y activa la respuesta del agente sin necesidad de pulsar botones.
- Plataformas de telemedicina: en consultas por voz, el modelo asegura que el profesional y el paciente no se pisen al hablar, y gestiona los silencios para que el agente pueda hacer preguntas de seguimiento.
- Herramientas de doblaje o subtitulado en directo: aunque no es ASR, puede usarse como capa de control para sincronizar la locución de un agente con la entrada de un usuario en tiempo real, por ejemplo en interpretación simultánea.

## Benchmarks y rendimiento

La model card proporciona las siguientes métricas de rendimiento, medidas por trama de 80 ms en una GPU:

| Métrica | Resultado | Objetivo |
|---|---|---|
| VAD F1 | 0.976 | ≥ 0.85 |
| Barge-in F1 | 0.861 | ≥ 0.85 |
| False-barge rate | 0.000 | ≤ 0.05 |
| Control macro-F1 (±240 ms) | 0.860 | — |
| Decode latency p50 | 2.9 ms | p95 ≤ 40 ms |
| Decode latency p95 | 4.2 ms | p95 ≤ 40 ms |

No se han publicado comparaciones con otros modelos de control de turno o VAD. La latencia se mide por trama en GPU; en CPU, el modelo se mantiene dentro del presupuesto de tiempo real, aunque no se especifican valores numéricos.

## Requisitos de hardware

- No se especifica la VRAM necesaria en la documentación. Dado que el modelo tiene 270M de parámetros, en FP32 ocuparía aproximadamente 1.08 GB y en FP16 unos 0.54 GB, por lo que cabría en la mayoría de GPUs de consumo (p. ej., RTX 3060 con 12 GB, RTX 4090, etc.), pero esto es una estimación basada en el tamaño, no un dato oficial.
- Funciona en CPU y GPU; la latencia medida en GPU es de ~3 ms por trama, y en CPU se mantiene dentro del presupuesto de tiempo real (80 ms por trama).
- Se puede desplegar con la librería `transformers` de Hugging Face, usando el pipeline `ThinkSparkPipeline` y el `Orchestrator` proporcionados por el paquete `kupe-thinkspark`.
- No se mencionan requisitos específicos de memoria RAM ni de almacenamiento; el repositorio pesa 0.6 GB.
- Al ser un modelo pequeño, es adecuado para despliegue en edge (dispositivos móviles, Raspberry Pi) o en servidores con GPUs modestas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para control de turnos en conversaciones de voz. Los VAD tradicionales (p. ej., Silero VAD, WebRTC VAD) resuelven solo la detección de voz, pero no emiten señales como BARGE_SOFT, PREFETCH_LLM o SILENCE_BREAK. Tampoco se han encontrado referencias a alternativas de la misma categoría en la documentación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Solo soporta inglés, hindi y guyaratí. El comportamiento en otros idiomas no está probado y no es compatible.
- La bandera `CANCEL_LLM` existe en el espacio de etiquetas pero el modelo no la emite; no debe construirse lógica de cancelación basada en ella.
- Espera audio mono a 24 kHz. Es necesario remuestrear antes de usar.
- Diseñado para conversaciones de dos participantes; salas con múltiples hablantes no están probadas.
- Las decisiones son locales a cada trama; el estado de diálogo a largo plazo debe gestionarse en el orquestador.
- No se han publicado detalles sobre sesgos o alucinaciones, pero al ser un clasificador de audio, el riesgo de alucinación es bajo (no genera texto). Aun así, la dependencia de un VAD puede fallar en entornos ruidosos.
- La licencia Apache 2.0 permite uso comercial, pero la documentación no especifica limitaciones de uso en producción más allá de las indicadas.

## Enlaces

- [HuggingFace: anuj-inavlabs/Kupe-ThinkSpark-Realtime-270M](https://huggingface.co/anuj-inavlabs/Kupe-ThinkSpark-Realtime-270M)
- [Página de investigación de Kupe](https://www.kupe.in/research/kupe-thinkspark-realtime-270m)
- [Documentación de Kupe](https://docs.kupe.in)
- [Sitio web de Kupe](https://www.kupe.in)
- [GitHub: iNavLabsResearch/kupe-thinkspark](https://github.com/iNavLabsResearch/kupe-thinkspark)
- [GitHub: iNavLabsResearch/kupe-thinkspark-v2-270m](https://github.com/iNavLabsResearch/kupe-thinkspark-v2-270m)
- [Dataset: anuj-inavlabs/kupe-thinkspark-270m-phase1-data](https://huggingface.co/datasets/anuj-inavlabs/kupe-thinkspark-270m-phase1-data)
