# handy-computer/smart-turn-v3.2-gguf

## Resumen
smart-turn-v3.2-gguf es una conversión a formato GGUF del modelo pipecat-ai/smart-turn-v3, un clasificador binario de audio disenado para detectar el final de turno (end-of-turn) en conversaciones habladas. Lo desarrolla handy-computer como parte del ecosistema transcribe.cpp, una implementación en C/C++ para inferencia de modelos de audio en CPU. No es un modelo de transcripción: recibe la forma de onda cruda de un turno de habla (los últimos 8 segundos) y devuelve la probabilidad de que el hablante haya terminado su intervención o simplemente haya hecho una pausa.

El modelo resuelve un problema clásico en sistemas de voz conversacional: los detectores de actividad de voz (VAD) tradicionales confunden pausas naturales con el final del turno, lo que provoca interrupciones prematuras o latencias artificiales. smart-turn-v3 analiza la semántica acústica del habla, no el texto transcrito, para decidir con mayor precisión. Con solo 8 millones de parámetros y un backbone basado en el encoder de Whisper Tiny, es extremadamente ligero y está pensado para ejecutarse en CPU con latencias muy bajas.

La relevancia actual radica en su utilidad para pipelines de agentes de voz en tiempo real: permite implementar turn-taking natural sin depender de GPUs ni de modelos pesados. La conversión a GGUF y su integración en transcribe.cpp facilitan el despliegue en entornos C/C++ con dependencias mínimas, lo que lo hace atractivo para sistemas embebidos, aplicaciones de escritorio y servicios de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper Tiny + clasificador lineal superficial |
| Parametros totales | 8.016.866 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 segundos de audio por turno |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | ar, bn, zh, da, nl, de, en, fi, fr, hi, id, it, ja, ko, mr, no, pl, pt, ru, es, tr, uk, vi (23 idiomas) |
| Licencia | BSD-2-Clause |
| Formato de pesos | GGUF (para transcribe.cpp); ONNX en el modelo base |

## Arquitectura y entrenamiento
El modelo emplea el encoder de Whisper Tiny como backbone, seguido de un clasificador lineal superficial que produce una probabilidad escalar. Con 8 millones de parámetros, está optimizado para clasificación binaria de audio: la entrada es un fragmento de audio mono a 16 kHz correspondiente a un turno de habla (hasta 8 segundos), y la salida es la probabilidad de que el turno haya finalizado. No genera texto ni transcribe; su única tarea es la clasificación de estado de turno.

La información disponible no detalla el número de tokens de audio ni la composición exacta del dataset de entrenamiento, aunque el modelo base (pipecat-ai/smart-turn-v3) fue entrenado con datos de audio conversacional multilingüe y validado contra el conjunto de test Smart Turn v3.2 (31.527 clips). La conversión a GGUF fue validada contra la referencia ONNX fp32 de onnxruntime 1.23.2, con una diferencia máxima de probabilidad de 2.4e-05 en F32, 0.0038 en F16 y 0.13 en Q8_0. No se menciona el uso de RLHF ni DPO; se trata de un clasificador supervisado.

## Capacidades
- Detección de final de turno (end-of-turn) en audio conversacional: devuelve una probabilidad de que el hablante haya terminado su intervención.
- Clasificación de audio basada en la forma de onda cruda, sin depender de transcripción.
- Soporte multilingüe para 23 idiomas (árabe, bengalí, chino, danés, neerlandés, alemán, inglés, finés, francés, hindi, indonesio, italiano, japonés, coreano, maratí, noruego, polaco, portugués, ruso, español, turco, ucraniano y vietnamita).
- Inferencia en CPU por defecto, con backend C/C++ (transcribe.cpp).
- Integración mediante API C (`transcribe_turn_run`) que devuelve probabilidad y decisión binaria.
- No soporta streaming (campo `streaming: false` en la model card).
- No soporta traducción ni detección de idioma.
- No genera timestamps.

## Casos de uso
- Agentes de voz en tiempo real: integrar el modelo en un pipeline de ASR + LLM + TTS para decidir cuándo el usuario ha terminado de hablar y evitar respuestas prematuras. Su latencia en CPU (RTF de 158,49 en Apple M1 y 125,39 en Ryzen 4750U) permite operar en tiempo real sin GPU.
- Sistemas de atención al cliente telefónica: sustituir o complementar el VAD tradicional para gestionar pausas naturales en conversaciones multi-turno, reduciendo interrupciones y mejorando la naturalidad del diálogo.
- Asistentes de voz embebidos: al ser un modelo de 8 MB en Q8_0 y ejecutarse en CPU, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, routers, sistemas empotrados) para turn-taking local.
- Herramientas de transcripción con diarización: usar la detección de final de turno para segmentar audio de reuniones o entrevistas antes de pasarlo a un modelo de ASR, mejorando la precisión de los cortes.
- Plataformas de reuniones y videoconferencia: detectar cuándo un participante ha terminado de hablar para activar subtítulos en vivo o transcripciones por turnos con menor latencia.
- Investigación en interacción humano-máquina: evaluar y comparar estrategias de turn-taking en estudios de conversación hablada, gracias a su licencia permisiva BSD-2-Clause y su naturaleza ligera.
- Integración en pipelines de CI/CD para pruebas de regresión de sistemas de voz: al ser determinista y ligero, puede usarse como referencia en tests automatizados de detección de turno.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| Precisión (Smart Turn v3.2 test, 31.527 clips) | 93,71% | 93,70% | 93,68% |
| Intervalo de confianza 95% | 93,45–93,97 | 93,44–93,97 | 93,43–93,96 |
| Falsos positivos | 3,51% | 3,51% | 3,53% |
| Falsos negativos | 2,78% | 2,78% | 2,78% |
| AUC | 0,98252 | 0,98252 | 0,98249 |
| Misma decisión que la referencia | 31.527/31.527 | 31.525/31.527 | 31.478/31.527 |
| Diferencia máxima de probabilidad | 2,4e-05 | 0,0038 | 0,13 |

Referencia: modelo ONNX fp32 de Pipecat (precisión publicada del 93,71%; int8 ONNX: 92,63%). El umbral de decisión es p > 0,5. Rendimiento en CPU: RTF de 158,49 en Apple M1 y 125,39 en Ryzen 4750U (mayor es mejor).

## Requisitos de hardware
- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no necesarias; el backend por defecto es CPU.
- Cabe en cualquier GPU consumer y en dispositivos sin GPU, dado su tamaño (11 MB en Q8_0, 17 MB en F16, 32 MB en F32).
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y API C `transcribe_turn_run`); el modelo base también está disponible en ONNX para onnxruntime.
- Latencia y throughput: RTF de 158,49 en Apple M1 y 125,39 en Ryzen 4750U, lo que indica inferencia en tiempo real con amplio margen. El blog de Pipecat menciona inferencia en CPU en 12 ms para el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión | Licencia | Formato |
|---|---|---|---|---|---|
| smart-turn-v3.2-gguf | 8M | 8 s de audio | 93,71% (F32) | BSD-2-Clause | GGUF |
| pipecat-ai/smart-turn-v3 (ONNX fp32) | 8M | 8 s de audio | 93,71% | BSD-2-Clause | ONNX |
| pipecat-ai/smart-turn-v3 (ONNX int8) | 8M | 8 s de audio | 92,63% | BSD-2-Clause | ONNX |
| VAD tradicional (p. ej. Silero VAD) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con VAD tradicionales no está disponible en la información proporcionada; estos operan a nivel de actividad de voz, no de semántica de turno, por lo que no son directamente comparables.

## Limitaciones y advertencias
- No es un modelo de transcripción: solo clasifica si un turno ha terminado; no genera texto.
- No soporta streaming (`streaming: false`), por lo que requiere disponer del audio del turno (hasta 8 s) antes de inferir.
- No soporta traducción ni detección de idioma.
- No proporciona timestamps.
- Ventana de audio limitada a 8 segundos; turnos más largos pueden requerir estrategias de segmentación.
- Riesgo de falsos positivos (3,51%) y falsos negativos (2,78%) incluso en la mejor cuantización; en producción conviene calibrar el umbral según el caso de uso.
- La cuantización Q8_0 introduce una diferencia máxima de probabilidad de 0,13 respecto a la referencia, lo que puede alterar decisiones en casos límite.
- Sesgos conocidos: no se detallan en la información disponible; al entrenarse con datasets conversacionales multilingües, puede presentar sesgos dependientes de la composición de dichos datos.
- Licencia BSD-2-Clause: permisiva para uso comercial, pero se recomienda revisar los términos del modelo base y de los datasets de entrenamiento.
- El modelo es una conversión no oficial del modelo base; la fuente autoritativa es pipecat-ai/smart-turn-v3.

## Enlaces
- Hugging Face (este modelo): https://huggingface.co/handy-computer/smart-turn-v3.2-gguf
- Modelo base: https://huggingface.co/pipecat-ai/smart-turn-v3
- Commit del modelo base: https://huggingface.co/pipecat-ai/smart-turn-v3/commit/f766f81
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/smart-turn-v3.2.md
- Documentación de detección de turno: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/turn.md
- Repositorio de Pipecat smart-turn: https://github.com/pipecat-ai/smart-turn
- Blog de Pipecat sobre Smart Turn v3: https://www.daily.co/blog/announcing-smart-turn-v3-with-cpu-inference-in-just-12ms/
- Datasets de Pipecat: https://huggingface.co/pipecat-ai/datasets
- Liva AI: https://www.theliva.ai/
- Midcentury: https://www.midcentury.xyz/
- MundoAI: https://mundoai.world/
