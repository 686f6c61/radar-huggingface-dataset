# appautomaton/audio8-asr-infinite-int8-mlx

## Resumen

Audio8-ASR-Infinite (int8, MLX) es una conversión cuantizada del modelo de reconocimiento automático del habla desarrollado por Edge0, adaptada por App Automaton para su ejecución nativa sobre Apple Silicon mediante la librería MLX. El modelo resuelve la transcripción en streaming de audio de duración ilimitada en chino y en inglés, sin necesidad de invocar PyTorch ni Transformers durante la inferencia. Con aproximadamente 4.086 millones de parámetros, se posiciona como una alternativa práctica para aplicaciones de dictado, subtitulado y asistentes de voz que deban correr íntegramente en un Mac.

La arquitectura combina un codificador de audio causal de tipo Voxtral-Realtime, un proyector de audio y un decodificador de texto Qwen2.5-3B condicionado por retardo, que emite un token por cada paso de audio. El contexto nativo es de 30 segundos, pero una ventana deslizante mantiene constante el coste por paso y la memoria para audio de cualquier longitud. La cuantización int8 affine (grupo de 64) se aplica a las proyecciones de atención, MLP y al embedding de tokens, que también actúa como cabeza de salida; convoluciones, proyector, normalizaciones y cabezas de VAD semántico permanecen en bf16.

Su relevancia actual radica en que ofrece transcripción continua de baja latencia (retardo objetivo por defecto de 480 ms) en hardware de consumo Apple, con un tamaño de repo de 4,4 GB y una velocidad declarada de 4× tiempo real en un M5 Max. Es el build por defecto de Audio8 en `mlx-speech` y, según las comprobaciones del autor, produce transcripciones idénticas al build bf16 con la mitad de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio causal Voxtral-Realtime + proyector de audio + decodificador de texto Qwen2.5-3B condicionado por retardo |
| Parametros totales | 4.086.290.208 (aprox. 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 s nativos de audio; ventana deslizante para audio ilimitado |
| Tipos de cuantizacion | int8 affine con group size 64 en proyecciones de atención, MLP y embedding de tokens; convoluciones, proyector, normalizaciones y cabezas VAD en bf16 |
| Idiomas soportados | chino (zh) e inglés (en); el idioma debe indicarse explícitamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Entrada de audio | mono, 16 kHz (el adaptador de fichero remuestrea; las sesiones en vivo reciben muestras a 16 kHz) |
| Runtime | MLX, batch uno, Apple Silicon |
| Tamaño del repo | 4,4 GB |
| Modos de latencia | frame_len 4 (reloj 80 ms), 6 (120 ms), 8 (160 ms); retardos objetivo 240, 320, 480 (por defecto) y 560 ms según configuración |

## Arquitectura y entrenamiento

El modelo es un sistema encoder-decoder específico para ASR en streaming. El codificador de audio es causal, de tipo Voxtral-Realtime, y alimenta un proyector que alinea la representación acústica con el espacio del decodificador de texto, un Qwen2.5-3B condicionado por retardo. El decodificador toma una decisión de texto por cada paso de audio (el reloj), de modo que el retardo entre audio y texto se controla mediante el parámetro `target_delay_ms`. El checkpoint fue post-entrenado específicamente para las combinaciones de `frame_len` y `target_delay_ms` documentadas; otras combinaciones funcionan pero no fueron objeto de post-entrenamiento.

La cuantización es int8 affine con tamaño de grupo 64 sobre las proyecciones de atención y MLP y sobre el embedding de tokens, que se reutiliza como cabeza de salida. Convoluciones, proyector, normalizaciones y las cabezas de VAD semántico se mantienen en bf16. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo upstream. La validación de release se hizo con dos párrafos sintéticos generados con Fish S2 Pro, ambos por encima de los 30 s de contexto nativo para activar la ventana deslizante, y arrojó transcripciones idénticas entre bf16 e int8. La decodificación es greedy, batch uno, sin timestamps.

## Capacidades

- Reconocimiento automático del habla en streaming para chino e inglés, con salida de texto incremental token a token.
- Transcripción de audio de duración ilimitada mediante ventana deslizante con coste por paso y memoria constantes.
- Control explícito de latencia: el retardo del texto respecto al audio se ajusta con `target_delay_ms` (240, 320, 480 o 560 ms en el reloj de 80 ms).
- API de sesión en vivo (`stream_session`, `feed`, `finalize`) que acepta fragmentos PCM de tamaño arbitrario y devuelve los ids de token decodificados hasta el momento.
- Adaptador de fichero que remuestrea audio mono a 16 kHz para transcripción de ficheros completos.
- Exposición de probabilidades de VAD semántico por paso (no usadas para endpointing en esta versión).
- Ejecución sin PyTorch ni Transformers: runtime completo en MLX sobre Apple Silicon.
- No soporta tool calling, function calling, agentes ni multi-step reasoning; es un modelo exclusivamente ASR.
- No dispone de modo thinking, visión ni audio generation.

## Casos de uso

- Dictado en vivo en aplicaciones de escritorio para macOS: la API de sesión en streaming permite alimentar el micrófono en fragmentos PCM arbitrarios y consumir tokens conforme se generan, con un retardo configurable de 480 ms por defecto, adecuado para escritura asistida en tiempo real.
- Subtitulado de reuniones y videollamadas: con ventana deslizante y contexto de audio ilimitado, el modelo puede transcribir sesiones de horas sin degradar el coste por paso, emitiendo texto en chino o inglés según se configure el idioma.
- Transcripción por lotes de ficheros de audio: el adaptador de fichero remuestrea a 16 kHz y permite procesar grabaciones completas en local, útil para actas, entrevistas y archivos de podcast sin enviar audio a la nube.
- Asistentes de voz locales con requisitos de privacidad: al ejecutarse íntegramente en Apple Silicon con MLX y sin dependencias de PyTorch, el audio no abandona el dispositivo, lo que encaja en entornos sanitarios, legales o corporativos con restricciones de datos.
- Búsqueda y análisis de contenido audiovisual: la transcripción en streaming permite indexar audio conforme llega y construir pipelines de búsqueda sobre material en chino e inglés sin esperar al procesamiento completo.
- Prototipado e investigación en ASR en Apple Silicon: el build int8 sirve como referencia ligera (4,4 GB) para experimentar con latencias, tamaños de frame y estrategias de decodificación, con un build bf16 de 8,2 GB disponible como referencia sin cuantizar.
- Integración en herramientas de accesibilidad: transcripción continua de bajo retardo para subtitulado en vivo de conversaciones presenciales o contenido reproducido en el equipo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son la validación de release del autor sobre dos párrafos sintéticos generados con Fish S2 Pro, comparando bf16 e int8:

| Idioma | Audio | bf16 | int8 |
|---|---:|---:|---:|
| Chino | 36,9 s | 1,24 % CER | 1,24 % CER |
| Inglés | 41,7 s | 0,75 % WER | 0,75 % WER |

El autor indica que los dos errores en chino son homófonos (再→在, 她→他) y el error en inglés es un artículo. Se trata de voz sintética y de una puerta de validación local, no de precisión en condiciones reales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

En cuanto a velocidad, el autor declara 4× tiempo real en un M5 Max para el build int8 y 3× tiempo real para el bf16.

## Requisitos de hardware

- VRAM equivalente: el repo int8 ocupa 4,4 GB en disco; el bf16 ocupa 8,2 GB. La memoria unificada necesaria para inferencia será del orden del tamaño de los pesos más overhead de activaciones y ventana deslizante, no especificado por el autor.
- Hardware obligatorio: Apple Silicon con MLX. No hay soporte para CUDA ni para CPU x86 en esta conversión.
- GPU recomendadas: chips de la familia M de Apple; el autor reporta 4× tiempo real en un M5 Max con int8 y 3× tiempo real con bf16.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon con memoria unificada suficiente para alojar 4,4 GB de pesos más overhead; el autor no publica el mínimo de memoria unificada requerido.
- Opciones de despliegue: `mlx-speech` (librería Python y CLI `mlx-speech asr`), con API de fichero y de sesión en streaming. No se documentan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia: retardo objetivo por defecto de 480 ms con `frame_len` 4 (reloj de 80 ms); configuraciones alternativas de 240, 320 y 560 ms, y relojes de 120 y 160 ms con sus retardos post-entrenados.
- Throughput: 4× tiempo real en M5 Max con int8 según el autor; no se publican cifras para otros chips.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Runtime / hardware | Notas |
|---|---|---|---|---|---|---|
| `appautomaton/audio8-asr-infinite-int8-mlx` (este) | ~4B | 30 s nativos, ilimitado con ventana deslizante | zh, en | Apache 2.0 | MLX, Apple Silicon | int8, 4,4 GB, 4× tiempo real en M5 Max |
| `appautomaton/audio8-asr-infinite-bf16-mlx` | ~4B | 30 s nativos, ilimitado con ventana deslizante | zh, en | Apache 2.0 | MLX, Apple Silicon | bf16, 8,2 GB, 3× tiempo real en M5 Max, transcripciones idénticas al int8 |
| `Edge0/Audio8-ASR-Infinite` (upstream) | ~4B | 30 s nativos, ilimitado con ventana deslizante | zh, en | Apache 2.0 | no disponible en la información proporcionada | Modelo original del que deriva esta conversión |

No se dispone en la información proporcionada de datos sobre otros modelos ASR comparables (por ejemplo, Whisper u otros) para establecer una comparación cuantitativa de precisión o latencia.

## Limitaciones y advertencias

- Solo admite chino e inglés, y el idioma debe especificarse de forma explícita; no hay detección automática.
- Requiere Apple Silicon y MLX; no es desplegable en CUDA, CPU x86 ni entornos sin MLX.
- Decodificación greedy con batch uno y sin timestamps; no apta para casos que requieran alineamiento temporal por palabra.
- Las sesiones en vivo devuelven ids de token: un token a nivel de byte puede partir un carácter chino poco frecuente, por lo que debe decodificarse el acumulado de ids y no cada id por separado.
- Las probabilidades de VAD semántico se exponen por paso pero no se usan para endpointing en esta versión.
- Los benchmarks publicados proceden de voz sintética (Fish S2 Pro) y constituyen una puerta de validación local, no una medida de precisión en condiciones reales; el riesgo de alucinación o de errores en audio ruidoso, con acentos o con solapamiento de hablantes no está cuantificado en la información disponible.
- No se documentan sesgos conocidos del modelo upstream en la información proporcionada; al ser un derivado de Edge0, conviene consultar la model card original para advertencias actualizadas.
- Licencia Apache 2.0, que permite uso comercial; al ser un derivado cuantizado de `Edge0/Audio8-ASR-Infinite`, deben respetarse los términos del modelo upstream.
- El autor no publica el volumen ni la composición del dataset de entrenamiento, ni si hubo RLHF o DPO, lo que limita la evaluación de riesgos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appautomaton/audio8-asr-infinite-int8-mlx
- Variante bf16: https://huggingface.co/appautomaton/audio8-asr-infinite-bf16-mlx
- Modelo upstream: https://huggingface.co/Edge0/Audio8-ASR-Infinite
- Código upstream: https://github.com/Edge0-AI/Audio8-ASR-Infinite
- Runtime MLX: https://github.com/appautomaton/mlx-speech
- Guía del runtime: https://github.com/appautomaton/mlx-speech/blob/main/docs/audio8-asr-infinite.md
- Página del proyecto: https://appautomaton.com/mlx-speech/
- Perfil del autor: https://huggingface.co/appautomaton
- Web del autor: https://appautomaton.com
