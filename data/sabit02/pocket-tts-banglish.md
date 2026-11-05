# Sabit02/pocket-tts-banglish

## Resumen

Pocket-TTS Bangla & Banglish es un checkpoint afinado del modelo de síntesis de voz Pocket-TTS de Kyutai Labs, adaptado para la síntesis de habla en bengalí puro (বাংলা) y en banglish, es decir, texto con mezcla de código entre inglés y bengalí, un fenómeno muy extendido en la comunicación digital de Bangladés y Bengala Occidental. Lo desarrolla el usuario Sabit02 y se publica con licencia Apache 2.0 en Hugging Face.

El modelo combina el códec neural de audio Mimi de Kyutai, que comprime audio a 24 kHz en tramas de 12,5 Hz con un espacio latente de 32 dimensiones, con un transformer autorregresivo FlowLM de 24 capas y una red de flow matching de 6 capas. El resultado es un sistema de text-to-speech que parte de un prompt de voz de referencia de 3 a 5 segundos para condicionar el timbre y genera audio en bengalí o en texto mixto inglés-bengalí.

Su relevancia radica en cubrir un caso poco atendido por los TTS multilingües convencionales: la alternancia de idiomas dentro de una misma frase, habitual en contextos laborales y tecnológicos de la región. El entrenamiento se realizó con recursos limitados (una única GPU T4 de 16 GB en Kaggle durante 2.000 pasos), lo que sitúa al modelo como un experimento de adaptación de bajo coste más que como un sistema listo para producción a gran escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo FlowLM de 24 capas (d_model 1024, 16 cabezas, hidden_scale 4) + red de flow matching de 6 capas; códec neural Mimi |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bengalí (bn) e inglés (en), incluido texto code-mixed banglish |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (configuración YAML compatible con la librería pocket-tts) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Pocket-TTS de Kyutai: un transformer autorregresivo FlowLM de 24 capas con dimensión de modelo 1024, 16 cabezas de atención y escala oculta 4, acoplado a una red de flow matching de 6 capas que genera los latentes acústicos. La salida se decodifica con el códec neural Mimi, que representa audio a 24 kHz como tramas de 12,5 Hz en un espacio latente de 32 dimensiones. El tokenizador es un SentencePiece unigram bilingüe con vocabulario de 4.000 unidades, compuesto por 3.538 subpalabras bengalíes, 452 subpalabras inglesas o latinas, 260 mecanismos de fallback a bytes y 404 tokens compartidos inicializados por calentamiento (warm-start) a partir del modelo profesor en inglés.

El entrenamiento utiliza el objetivo de Lagrangian Self-Distillation (LSD) con un multiplicador de lote de flow de 4 y un peso de pérdida EOS de 0,1. El ajuste fino se ejecutó durante 2.000 pasos en una GPU Nvidia T4 de 16 GB en Kaggle, con batch_size 8 y acumulación de gradiente de 4 pasos (lote efectivo de 32), sobre los conjuntos OpenSLR 104 (Large Bengali Speech) y AI4Bharat IndicTTS. Las pérdidas reportadas son de -0,6318 en entrenamiento y -0,3488 en validación. La hoja de ruta del autor contempla una destilación de profundidad a 6 capas para inferencia en CPU en tiempo real, aún no publicada.

## Capacidades

- Síntesis de voz en bengalí puro a partir de texto en escritura bengalí.
- Síntesis de texto code-mixed banglish, con alternancia de palabras en inglés y bengalí dentro de la misma frase.
- Clonación de voz zero-shot mediante un prompt de audio de referencia de 3 a 5 segundos que condiciona el perfil acústico completo a través del códec Mimi.
- Control de fidelidad acústica mediante hiperparámetros de inferencia: temperatura (recomendada 0,15) y pasos de decodificación del sampler (recomendados 2).
- Generación de audio a 24 kHz con salida en formato WAV a través de la API de Python o la CLI de pocket-tts.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá del prompt de condicionamiento de voz.

## Casos de uso

- Atención al cliente en bengalí: el modelo puede generar respuestas habladas naturales para sistemas de IVR o asistentes telefónicos dirigidos a usuarios de Bangladés y Bengala Occidental, usando un prompt de voz corporativo para mantener un timbre consistente.
- Lectura de notificaciones y mensajes con jerga tecnológica: en entornos donde los usuarios mezclan inglés y bengalí ("meeting", "boss", "inform"), el modelo pronuncia la frase completa sin cambiar de motor, algo que los TTS monolingües no resuelven bien.
- Accesibilidad para personas con discapacidad visual: conversión de contenido web o documentos en banglish a audio, aprovechando la clonación de voz para ofrecer una voz familiar o preferida por el usuario.
- Dooblaje y locución de bajo coste: generación de pistas de voz para vídeos cortos, pódcasts o material educativo en bengalí con una referencia de voz de 3 a 5 segundos, sin necesidad de un estudio de grabación.
- Prototipado de asistentes conversacionales para el mercado bengalí: integración en pipelines de agentes de voz donde el texto proviene de un LLM y la salida debe sonar natural en registro coloquial mixto.
- Investigación en code-switching y TTS multilingüe: el checkpoint sirve como base para estudiar la calidad de síntesis en alternancia de idiomas y para experimentos de destilación hacia modelos más pequeños, dado su origen abierto y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta las pérdidas de entrenamiento (-0,6318) y validación (-0,3488) del objetivo LSD, sin métricas objetivas de calidad de síntesis como MOS, WER de ASR sobre el audio generado o similitud de hablante.

## Requisitos de hardware

- El ajuste fino se completó en una única GPU Nvidia T4 de 16 GB de VRAM, lo que da una cota superior orientativa del consumo de memoria durante el entrenamiento; la VRAM de inferencia no se especifica en la información disponible.
- Al tratarse de un transformer de 24 capas con d_model 1024 más la red de flow matching, es plausible su ejecución en GPU consumer, pero no se han publicado mediciones concretas de VRAM para inferencia ni de latencia.
- La hoja de ruta del autor incluye un estudiante destilado de 6 capas orientado a síntesis en CPU con un factor de tiempo real de 2 a 3 veces superior al tiempo real en CPUs de consumo estándar; ese modelo aún no está publicado.
- Opciones de despliegue: la librería oficial `pocket-tts` (instalable con `pip install pocket-tts`), que ofrece CLI y API de Python y carga la configuración directamente desde el Hub mediante `hf://Sabit02/pocket-tts-banglish/config.yaml`.
- No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni cifras de throughput o latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Licencia | Contexto / referencia de voz | Disponibilidad |
|---|---|---|---|---|---|
| Pocket-TTS Bangla & Banglish (Sabit02) | bn, en (banglish) | FlowLM 24 capas + Mimi | Apache 2.0 | Prompt de voz de 3-5 s | Hugging Face, librería pocket-tts |
| Pocket-TTS original (Kyutai Labs) | en (principalmente) | FlowLM + Mimi | no disponible en la información proporcionada | Prompt de voz | GitHub de Kyutai |
| TTS multilingües comerciales (p. ej. familias tipo XTTS o MMS) | decenas de idiomas, sin garantía de code-mixing | variable | variable | clonación variable | variable |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de calidad que permitan situar este checkpoint frente a otros sistemas de TTS en bengalí o en code-mixing.

## Limitaciones y advertencias

- El ajuste fino es muy corto (2.000 pasos con lote efectivo de 32) y se realizó en una sola GPU T4, por lo que la calidad de síntesis puede ser irregular fuera de los dominios cubiertos por OpenSLR 104 e IndicTTS.
- La pérdida de validación (-0,3488) es notablemente peor que la de entrenamiento (-0,6318), lo que sugiere cierto sobreajuste y riesgo de degradación en voces o textos no vistos.
- La calidad depende fuertemente del prompt de voz: la propia model card recomienda referencias de estudio o con bajo ruido, ya que Mimi condiciona sobre el perfil acústico completo y el ruido de fondo se propaga al audio generado.
- No se han publicado evaluaciones de sesgo demográfico, dialectal ni de género; el modelo puede reproducir sesgos presentes en los corpus de entrenamiento.
- Riesgo de alucinación acústica y de pronunciación incorrecta en palabras inglesas poco frecuentes o en topónimos y nombres propios bengalíes, dado el vocabulario limitado del tokenizador (4.000 unidades).
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin métricas de calidad publicadas; no se recomienda su uso en producción crítica sin una evaluación propia.
- El repositorio no contiene pesos visibles en el momento de la consulta (tamaño de 0,0 GB) y registra cero descargas, por lo que la disponibilidad efectiva de los artefactos debe verificarse antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sabit02/pocket-tts-banglish
- Repositorio de Kyutai Pocket-TTS: https://github.com/kyutai-labs/pocket-tts
- Ejecución de entrenamiento en Kaggle: https://www.kaggle.com/code/sabitkhan02/pocket-tts-banglish-training-runner
- Muestra de audio en bengalí puro (voz alba): https://huggingface.co/Sabit02/pocket-tts-banglish/resolve/main/sample_pure_bangla.wav
- Muestra de audio en banglish (voz alba): https://huggingface.co/Sabit02/pocket-tts-banglish/resolve/main/sample_banglish.wav
- Muestra de audio en bengalí puro (voz bengalimale): https://huggingface.co/Sabit02/pocket-tts-banglish/resolve/main/sample_bengali_voice_pure_bangla.wav
- Muestra de audio en banglish (voz bengalimale): https://huggingface.co/Sabit02/pocket-tts-banglish/resolve/main/sample_bengali_voice_banglish.wav
- Dataset OpenSLR 104 (Large Bengali Speech): no disponible en la información proporcionada
- Dataset AI4Bharat IndicTTS: no disponible en la información proporcionada
