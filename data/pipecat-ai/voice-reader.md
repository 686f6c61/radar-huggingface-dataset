# pipecat-ai/voice-reader

## Resumen

Pipecat Voice Reader es un modelo de clasificación de audio de tipo ONNX desarrollado por pipecat-ai, diseñado para extraer señales paralingüísticas del habla de un usuario: tono emocional, sarcasmo, energía vocal (arousal), risa, tristeza y velocidad de habla. No es un modelo generativo, sino un clasificador pequeño (28,6 MB en int8 para la variante `base`, 14,2 MB para `tiny`) que se ejecuta en CPU y se integra en el pipeline de Pipecat como un procesador de percepción. Su función es enriquecer los mensajes del usuario hacia el LLM con anotaciones de cómo suena su voz, siguiendo el estándar RCS de Pipecat.

El modelo deriva de `laion/whisper-tiny-base-emotion-voice-burst`, con arquitectura basada en Whisper tiny adaptada a clasificación multi-cabecera. Está entrenado exclusivamente para inglés y se distribuye bajo licencia BSD-2-Clause. Es una release candidate (rc6) marcada explícitamente como experimental por el autor: sus salidas son señales que el LLM debe ponderar, no veredictos.

Su relevancia actual reside en la creciente demanda de conversaciones por voz con LLMs que entiendan no solo las palabras sino también la prosodia. Pipecat lo ejecuta sobre los últimos 8 segundos de habla del usuario cada vez que este deja de hablar, con latencias de 50-160 ms en CPU de un solo hilo, lo que lo hace viable para despliegues de baja latencia sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Whisper tiny (transformer encoder), adaptada a clasificación multi-cabecera con calibración por salida |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 4, 6 u 8 segundos según el turno (`read_secs`) |
| Tipos de cuantizacion | int8 (por defecto) y fp32 (`model.onnx`) |
| Idiomas soportados | Inglés (en) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (`model.int8.onnx`, `model.onnx`) |
| Tamano del repo | 1,2 GB |
| Variantes | `base` (28,6 MB int8) y `tiny` (14,2 MB int8) |
| Pipeline | audio-classification |
| Modelo base | laion/whisper-tiny-base-emotion-voice-burst |

## Arquitectura y entrenamiento

El modelo se construye sobre el encoder de Whisper tiny de OpenAI, adaptado para producir múltiples salidas de clasificación y regresión en lugar de transcripción. Cada salida (tone, sarcasm, laughter, sad, arousal, upset, speech_rate) tiene su propia cabecera y calibración declarada en `config.json`. Los valores finales salen del grafo ONNX ya calibrados, sin post-procesado adicional. El modelo lee ventanas de audio de 4, 6 u 8 segundos según la longitud del turno, y el pipeline de Pipecat consulta al modelo en cada pausa del usuario, conservando el valor máximo de cada señal a lo largo del turno.

El entrenamiento se realizó sobre habla real y actuada. Las etiquetas de sarcasmo y risa en habla real provienen de dos jueces LLM de audio (Gemini 3.1 Pro preview y OpenAI gpt-audio-1.5), y un turno se considera sarcástico solo cuando ambos jueces coinciden. Los hablantes de test nunca aparecen en entrenamiento. El conjunto de evaluación de conversación para sarcasmo incluye 3.945 turnos seleccionados por dificultad, con 203 sarcásticos. También se evalúa sobre Emolia y CREMA-D (actuado). No se especifica en la información disponible el número de tokens de audio ni la composición completa del dataset de entrenamiento.

## Capacidades

- Clasificación de tono de voz en cuatro clases: positive, neutral, sad, frustrated (distribución de probabilidad).
- Detección de sarcasmo vocal (`sarcasm`) como probabilidad, con umbral calibrado (0,066 para `base`, 0,068 para `tiny`).
- Detección de risa (`laughter`) como probabilidad.
- Detección de tristeza (`sad`) como probabilidad (opcional, activable con `sad=True`).
- Estimación de energía vocal (`arousal`) en escala 0-1.
- Estimación de grado de molestia (`upset`) en escala 0-1 (respondido por `PipecatVoiceClassifier`, no escrito por defecto por el Voice Reader).
- Estimación de velocidad de habla (`speech_rate`) en sílabas por segundo.
- Integración como procesador de percepción en pipelines de Pipecat 1.16 o superior, escribiendo las lecturas al inicio del mensaje del usuario bajo el estándar RCS.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un clasificador de audio.

## Casos de uso

- Agentes de voz empáticos: el modelo permite que un LLM de atención al cliente reciba señales de frustración o tristeza junto al texto transcrito, ajustando el tono de respuesta. Por ejemplo, si `tone frustrated=0.71`, el LLM puede optar por un tono más calmado y empático.
- Detección de sarcasmo en asistentes conversacionales: combinado con el Tone Reader de Pipecat (que lee el sarcasmo de las palabras), permite distinguir un "Oh, great" sarcástico de uno genuino, mejorando la comprensión en diálogos ambiguos.
- Moderación y análisis de sentimiento en centros de llamadas: el modelo puede procesar los últimos 8 segundos de cada turno para detectar molestia (`upset`) o arousal elevado, generando alertas en tiempo real para supervisores.
- Análisis de interacciones en investigación: al ser un modelo pequeño y determinista con salidas calibradas, permite etiquetar corpus de conversación con señales prosódicas (arousal, speech_rate, risa) de forma reproducible y a bajo coste.
- Detección de risa en aplicaciones de entretenimiento: en bots de compañía o juegos conversacionales, la señal `laughter` permite reaccionar con respuestas adecuadas cuando el usuario ríe, con AUROC de 0,920-0,963 en conversación.
- Despliegue en entornos de un solo vCPU: la variante `tiny` (14,2 MB int8, 35-85 ms de latencia) permite integrar percepción prosódica en dispositivos edge o contenedores sin GPU, manteniendo un sarcasmo AUROC de 0,910.
- Enriquecimiento de datasets para fine-tuning de LLMs conversacionales: las lecturas RCS generadas pueden usarse como anotaciones auxiliares para entrenar modelos que respondan mejor a estados emocionales del usuario.

## Benchmarks y rendimiento

| Metrica | base | tiny |
|---|---|---|
| Sarcasmo AUROC, conversación (3.945 turnos, 203 sarcásticos) | 0,923 | 0,910 |
| Sarcasmo en umbral de envío: recall / falsos positivos | 0,86 / 14,9 % | 0,78 / 12,7 % |
| Sarcasmo en 0,5: recall / falsos positivos | 0,47 / 1,1 % | 0,42 / 0,8 % |
| Turnos aleatorios sobre umbral de envío / sobre 0,5 (512 turnos, 0,8 % sarcásticos) | 2,3 % / 0,2 % | 2,3 % / 0,0 % |
| Tono macro-F1: conversación / Emolia / CREMA-D (actuado) | 0,736 / 0,677 / 0,874 | 0,732 / 0,638 / 0,880 |
| `sad` AUROC: conversación / Emolia | 0,759 / 0,933 | 0,744 / 0,925 |
| Upset, AUROC medio sobre tres conjuntos | 0,875 | 0,857 |
| Arousal CCC | 0,89 | 0,88 |
| Risa AUROC contra Gemini, dos conjuntos de conversación (4.366 turnos, 769 con risa; 5.778 turnos, 1.360) | 0,920 / 0,963 | 0,919 / 0,959 |
| Risa en 0,5: recall, falsos positivos | 0,59, 1,0 % / 0,81, 1,5 % | 0,58, 1,1 % / 0,79, 1,5 % |
| Risa en 0,5, Emolia (4.512 clips, 500 con risa): recall, falsos positivos | 0,43, 1,3 % | 0,44, 1,3 % |
| Turnos aleatorios ≥0,5 en risa (530 y 565 turnos; Gemini oyó risa en 5,1 % y 4,1 %) | 4,3 % / 3,7 % | 4,5 % / 3,0 % |
| Clips CREMA-D ≥0,5 en risa (349 clips actuados, ninguno con risa) | 0,0 % | 0,0 % |

Latencia de lectura en 1 hilo de CPU x86: `base` ~50-75 ms (turno hasta 4 s), ~75-115 ms (hasta 6 s), ~100-160 ms (hasta 8 s); `tiny` ~35 ms (4 s), ~55-60 ms (6 s), ~75-85 ms (8 s).

## Requisitos de hardware

- Inferencia exclusivamente en CPU: no requiere GPU. El modelo está diseñado para ejecutarse en CPU de servidor x86 con un solo hilo.
- VRAM estimada: 0 GB (no usa GPU).
- RAM estimada: no disponible explícitamente, pero el tamaño de los archivos int8 (28,6 MB y 14,2 MB) sugiere un consumo muy bajo, adecuado para contenedores pequeños.
- GPU recomendadas: no aplica; el modelo no está pensado para GPU.
- Cabe en cualquier hardware consumer: sí, incluso en dispositivos edge de un solo vCPU con la variante `tiny`.
- Opciones de despliegue: ONNX Runtime a través de Pipecat (`pipecat-ai[expressivity]`), con el procesador `PipecatVoiceReader`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador ONNX de este tipo).
- Latencia: 35-160 ms por lectura según variante y longitud de ventana, en un hilo de CPU x86.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| pipecat-ai/voice-reader (base) | Clasificador ONNX (Whisper tiny) | no disponible | 4-8 s audio | en | BSD-2-Clause | Tono, sarcasmo, risa, arousal, tristeza, velocidad |
| pipecat-ai/tone-models | Clasificador de texto | no disponible | no disponible | no disponible | no disponible | Sarcasmo y tono a partir de palabras |
| laion/whisper-tiny-base-emotion-voice-burst | Clasificador de emociones (Whisper tiny) | no disponible | audio | en | no disponible | Emociones vocales |
| Modelos SER genéricos (p. ej. wav2vec2-based) | Clasificador de emociones | variable | audio | variable | variable | Emociones discretas |

La comparación directa con alternativas es limitada porque el modelo combina señales que normalmente se reparten entre varios clasificadores (emociones, sarcasmo, risa, arousal y velocidad de habla) en un único grafo ONNX pequeño y calibrado. Frente a modelos SER clásicos, su ventaja es la integración con Pipecat y el estándar RCS; su desventaja es que solo soporta inglés y está marcado como experimental.

## Limitaciones y advertencias

- Modelo experimental (release candidate rc6): los nombres de salida, la calibración y los umbrales pueden cambiar entre versiones.
- Las salidas son señales para que un LLM las pondere, no veredictos; no deben usarse para decisiones automatizadas críticas.
- Un pipeline que lee en cada pausa rinde peor que la evaluación de la model card: el sarcasmo AUPRC de `base` cae de 0,60 a 0,50 en un conjunto y de 0,35 a 0,24 en otro; el macro-F1 de tono baja 0,01-0,03. La risa apenas se ve afectada.
- Ruido de fondo (5-25 dB), salas sintéticas y canales telefónicos o de baja tasa de bits degradan la precisión: `base` pierde 0,04-0,05 de AUPRC en sarcasmo y 0,02 de macro-F1 en tono; el recall de tristeza cae de 0,75 a 0,69 en un conjunto.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de falsos positivos en sarcasmo: en el umbral de envío, la tasa de falsos positivos es del 14,9 % (`base`) y 12,7 % (`tiny`) en conversación difícil.
- La detección de risa tiene recall moderado (0,43-0,44 en Emolia) y puede pasar por alto risas sutiles.
- No soporta tool calling, agentes ni generación: es exclusivamente un clasificador.
- Licencia BSD-2-Clause: permisiva para uso comercial, pero al derivar de un modelo base (`laion/whisper-tiny-base-emotion-voice-burst`) conviene verificar la licencia de este último antes de producción.
- El modelo `upset` no lo escribe por defecto el Voice Reader; lo responde `PipecatVoiceClassifier`, lo que puede generar confusión en la integración.

## Enlaces

- Hugging Face: https://huggingface.co/pipecat-ai/voice-reader
- Modelo base: https://huggingface.co/laion/whisper-tiny-base-emotion-voice-burst
- Repositorio Pipecat: https://github.com/pipecat-ai/pipecat
- Documentación del estándar RCS: https://docs.pipecat.ai/api-reference/standards/real-time-context-standard
- Referencia del Voice Reader: https://docs.pipecat.ai/api-reference/server/expressive/pipecat-voice
- Ejemplo de bot expresivo: https://github.com/pipecat-ai/pipecat/blob/main/examples/expressive-conversation/expressive-conversation-voice-reader.py
- Tone Reader (modelos de tono): https://huggingface.co/pipecat-ai/tone-models
