# Nikhil-09/turnwave

## Resumen

TurnWave es un modelo de clasificación de audio diseñado para la detección de fin de turno (*end-of-turn detection*) en agentes de voz. Desarrollado por Nikhil-09, resuelve el problema de decidir si un interlocutor ha terminado de hablar o solo está haciendo una pausa, sustituyendo los temporizadores fijos de silencio de 300-700 ms que usan la mayoría de los pipelines actuales. Su objetivo es evitar tanto las interrupciones como los silencios incómodos en conversaciones humano-agente.

El modelo está entrenado desde cero, sin pesos preentrenados, con una arquitectura híbrida que combina un transformer causal con RoPE, RMSNorm y SwiGLU sobre la cola de la transcripción, y una CNN sobre espectrogramas log-mel para captar la prosodia. El front-end log-mel está implementado manualmente sobre `torch.stft`, sin dependencias externas como torchaudio o librosa. El modelo principal (`audio_eot_v2.onnx`) tiene 3,49 millones de parámetros, un tamaño de 14 MB y lee los últimos 2 segundos de audio a 16 kHz, con el punto de decisión situado a 0,2 segundos dentro de la pausa.

TurnWave es relevante porque ofrece una alternativa ligera y de baja latencia (inferencia en CPU de ~4,8 ms) frente a soluciones basadas en modelos de lenguaje de gran tamaño o encoders preentrenados. En el benchmark eot-bench de LiveKit, supera al baseline de VAD clásico en todas las métricas, aunque queda por detrás de modelos comerciales como SmartTurn o el Turn Detector de LiveKit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (RoPE, RMSNorm, SwiGLU) sobre transcripción + CNN sobre espectrogramas log-mel |
| Parametros totales | 3,49 millones (modelo `audio_eot_v2`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2 segundos de audio a 16 kHz (ventana deslizante) |
| Tipos de cuantizacion | FP32 (predeterminado), INT8 dinámico (solo para rama de texto) |
| Idiomas soportados | Inglés (entrenado principalmente en inglés; otros idiomas presentes pero no evaluados) |
| Licencia | Apache 2.0 (modelo `audio_eot_v2`); otros modelos: CC BY 4.0 (`audio_eot`) y CC BY-NC-SA 4.0 (`text_eot`, `fusion_eot`) |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

TurnWave se compone de dos ramas principales: una rama de audio que procesa espectrogramas log-mel mediante una CNN, y una rama de texto que procesa la cola de la transcripción con un transformer causal equipado con RoPE (rotary position embeddings), RMSNorm y SwiGLU. El modelo `audio_eot_v2` (el recomendado) usa únicamente la rama de audio. El front-end log-mel está construido a mano sobre `torch.stft`, eliminando dependencias de torchaudio o librosa.

El entrenamiento se realizó desde cero, sin pesos preentrenados, sobre tres conjuntos de datos: `pipecat-ai/smart-turn-data-v3.2-train` (clips conversacionales), `Scicom-intl/semantic-vad-eot` (fase 4, licencia CC BY 4.0) y `li2017dailydialog/daily_dialog` (para la rama de texto). Un hallazgo clave del proyecto fue que el primer modelo, entrenado sobre un corpus de habla leída (etiquetado como TTS), obtenía AUC 0.563 en eot-bench, apenas mejor que el azar, mientras que su propia métrica interna alcanzaba AP 0.945. Al reentrenar con datos conversacionales, el AUC subió a 0.770, demostrando la importancia de evaluar en benchmarks externos.

## Capacidades

- Detección de fin de turno en conversaciones de voz, distinguiendo entre pausas de pensamiento y finalizaciones reales.
- Clasificación binaria sobre audio de 16 kHz, con salida en el rango [0,1] (umbral típico 0.5).
- Inferencia de baja latencia en CPU: ~4.8 ms por decisión en el modelo `audio_eot_v2`.
- Funcionamiento en tiempo real: procesa los últimos 2 segundos de audio hasta el punto de decisión.
- No requiere transcripción previa ni ASR para la rama de audio.
- Implementación ONNX, portable a múltiples entornos de inferencia.
- Entrenamiento desde cero, sin dependencia de pesos preentrenados.

## Casos de uso

- Agentes de voz en atención al cliente: TurnWave permite que un IVR o chatbot de voz sepa cuándo el cliente ha terminado de hablar, reduciendo interrupciones y mejorando la fluidez de la conversación. Su baja latencia (4.8 ms) lo hace apto para decisiones en tiempo real.
- Asistentes virtuales personales: integrado en altavoces inteligentes o aplicaciones móviles, el modelo evita que el asistente responda antes de que el usuario termine de formular su petición, incluso con pausas naturales.
- Sistemas de transcripción y subtitulado: puede marcar los puntos de cambio de turno en conversaciones grabadas, facilitando la segmentación de diálogos y la generación de subtítulos con turnos etiquetados.
- Robótica de servicios: robots que interactúan con humanos en mostradores o recepciones pueden usar TurnWave para sincronizar sus respuestas con el habla del usuario, mejorando la naturalidad de la interacción.
- Juegos y aplicaciones de entretenimiento con voz: para personajes no jugadores (NPC) que conversan con el jugador, el modelo permite respuestas en el momento adecuado sin cortar las frases del jugador.
- Pruebas de usabilidad y análisis de conversaciones: en herramientas de evaluación de calidad de llamadas, TurnWave puede detectar solapamientos y silencios incómodos, proporcionando métricas objetivas sobre la fluidez del diálogo.

## Benchmarks y rendimiento

El modelo fue evaluado con el harness eot-bench de LiveKit sobre datos reales de conversación humano-agente. Los resultados declarados por el autor son:

| Metrica | Valor |
|---|---|
| AUC (ROC) | 0.770 |
| Average precision | 0.602 |
| False cutoffs @300 ms de presupuesto de latencia (%) | 42.1 |
| False cutoffs @600 ms de presupuesto de latencia (%) | 17.2 |

Comparación con baselines publicados (mismos datos y metodología, menor es mejor):

| Modelo | False cutoffs @300 ms | False cutoffs @600 ms | Latencia @5% cutoff |
|---|---|---|---|
| VAD baseline | 55.6% | 21.7% | 1600 ms |
| TurnWave (audio branch) | 42.1% | 17.2% | 1195 ms |
| SmartTurn v3.2 | 35.2% | 14.8% | 1051 ms |
| LiveKit Turn Detector v1 | 9.9% | 4.5% | 543 ms |

TurnWave supera al baseline de VAD en todas las métricas, pero queda por detrás de los modelos de producción. El autor señala que la comparación no es completamente justa: SmartTurn parte de un encoder Whisper preentrenado y LiveKit usa un LLM de 0.5B destilado de un profesor de 7B, mientras que TurnWave tiene solo 3.49M de parámetros desde inicialización aleatoria.

## Requisitos de hardware

- Inferencia en CPU: latencia media de 4.81 ms para `audio_eot_v2` (FP32) en hardware de referencia no especificado. Suficiente para tiempo real en cualquier CPU moderna.
- Tamaño del modelo: 14 MB (`audio_eot_v2`), 7.2 MB (`text_eot` INT8), 42.4 MB (`fusion_eot`). No requiere GPU ni VRAM dedicada.
- Puede ejecutarse en dispositivos edge, Raspberry Pi, teléfonos móviles o servidores sin aceleración GPU.
- Opciones de despliegue: al ser ONNX, es compatible con ONNX Runtime, TensorRT, OpenVINO y otros motores de inferencia. No hay soporte nativo para vLLM, llama.cpp u Ollama al no ser un modelo de lenguaje.
- El modelo está diseñado para inferencia de baja latencia; en producción puede integrarse en pipelines de voz mediante el paquete `turnwave` (instalable desde GitHub) o directamente con ONNX Runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | False cutoffs @300 ms | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurnWave (`audio_eot_v2`) | 3.49M | 2 s de audio | 42.1% | Apache 2.0 | ONNX en HuggingFace |
| VAD baseline (típico) | no aplica | no aplica | 55.6% | variable | variable |
| SmartTurn v3.2 | no publicado | no publicado | 35.2% | no publicado | comercial |
| LiveKit Turn Detector v1 | 0.5B (LLM destilado) | no publicado | 9.9% | no publicado | comercial |

TurnWave es significativamente más pequeño y ligero que las alternativas de producción, con licencia permisiva para su rama de audio. Sin embargo, su rendimiento en corte de falsos positivos es notablemente peor que el de LiveKit, lo que puede ser crítico en aplicaciones donde una interrupción errónea sea inaceptable.

## Limitaciones y advertencias

- Solo inglés: aunque otros idiomas aparecen en los datos de entrenamiento, no han sido evaluados; el rendimiento en otros idiomas es desconocido.
- Rendimiento inferior a modelos de producción: SmartTurn y LiveKit Turn Detector obtienen mejores métricas, aunque con arquitecturas mucho más grandes y costosas.
- El modelo de fusión (`fusion_eot`) está desactualizado: fue entrenado con el corpus de habla leída, que el benchmark demostró ser la tarea incorrecta. Requiere ASR para reentrenar con datos conversacionales.
- Licencias mixtas: solo `audio_eot_v2` es Apache 2.0. Los modelos `text_eot` y `fusion_eot` derivan de DailyDialog (CC BY-NC-SA 4.0) y no pueden usarse comercialmente.
- Riesgo de alucinación no aplica directamente (no es un modelo generativo), pero la detección puede fallar con acentos, ruido de fondo o patrones de habla poco comunes.
- La métrica de false cutoffs al 42.1% a 300 ms implica que en casi la mitad de las pausas de 300 ms el modelo cortaría incorrectamente; puede ser inaceptable para aplicaciones de alta sensibilidad.
- No se proporcionan datos sobre sesgos demográficos o de acento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nikhil-09/turnwave
- Repositorio de código y documentación completa: https://github.com/Nikhils-G/turnwave
- Harness de benchmark eot-bench: https://github.com/livekit/eot-bench
