# 10X-Technologies/lyric-lite-tts-ml

## Resumen

Lyric Lite — Malayalam es un modelo de síntesis de voz (text-to-speech) monolingüe para malayalam desarrollado por 10X Technologies. Con 109,5 millones de parámetros, es la variante compacta de la familia Lyric, destilada del modelo Lyric Voice (336 M de parámetros) para conservar la precisión del original con un tercio del tamaño. Su propuesta central es la inferencia en dispositivo: funciona en CPU, sin GPU y sin conexión a internet, con una velocidad 1,9 veces superior al tiempo real en un solo hilo y 3,2 veces más rápido que Lyric Voice.

El modelo está pensado para escenarios de despliegue en hardware modesto —teléfonos Android de gama baja, portátiles y ordenadores pequeños— y mantiene una tasa de error de caracteres (CER) del 2,71 % en frases y del 2,1 % en párrafos de 17 frases, evaluada mediante transcripción automática con AI4Bharat IndicConformer 600M. Incluye una voz predefinida llamada Ahana y genera audio a 24 kHz.

Su relevancia actual radica en la combinación de tamaño reducido, licencia comunitaria propia y rendimiento en CPU, lo que lo sitúa como opción para aplicaciones de accesibilidad, lectura de texto y asistentes sin conectividad en el ecosistema malayalam, una lengua con cobertura limitada en el ámbito TTS. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS destilado de Lyric Voice; no se detalla la topología en la información disponible) |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto por frases y párrafos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | malayalam (ml) |
| Licencia | lyric-community-license (licencia comunitaria propia, etiquetada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su naturaleza de sistema text-to-speech y de su proceso de destilación: Lyric Lite se obtiene a partir de Lyric Voice, el modelo de 336 M de parámetros de la misma familia, reduciendo el tamaño a aproximadamente un tercio y conservando la precisión (CER de 2,71 % frente a 2,81 % del modelo grande). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

El modelo incorpora una voz predefinida (Ahana) mediante un clip de referencia (`voices/ahana.wav`), lo que sugiere un esquema de clonación o condicionamiento por prompt de voz, aunque los detalles técnicos de dicho mecanismo no se documentan en la información proporcionada. La evaluación se realizó sobre 254 clips por modelo con las mismas semillas, clip de voz y código, midiendo el CER mediante transcripción con AI4Bharat IndicConformer 600M (CTC, greedy, sin modelo de lenguaje).

## Capacidades

- Síntesis de voz monolingüe en malayalam a partir de texto escrito en escritura malayalam.
- Generación de audio a 24 kHz con una voz predefinida (Ahana) incluida en el repositorio.
- Inferencia en CPU sin GPU y sin conexión a internet.
- Procesamiento de texto largo: el script de inferencia divide el texto por `. ? !` y por comas en frases muy largas.
- Manejo de palabras inglesas siempre que estén escritas en escritura malayalam (no se admite inglés en caracteres latinos).
- Limpieza automática de caracteres invisibles y advertencia sobre caracteres no pronunciables.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectura de textos para accesibilidad: integración en aplicaciones de lectores de pantalla para usuarios con discapacidad visual que necesiten escuchar contenido en malayalam, aprovechando la inferencia en CPU y la velocidad superior al tiempo real en un solo hilo.
- Asistentes de voz sin conectividad: despliegue en teléfonos Android de gama baja para dar respuestas habladas en malayalam en entornos sin red, gracias a los 418 MB de pesos y a la ejecución sin GPU.
- Aplicaciones educativas de aprendizaje de malayalam: generación de audio para ejercicios de pronunciación y lectura de cuentos, con soporte para narraciones largas (se han publicado muestras de 45 segundos de narración).
- Sistemas de anuncios y avisos públicos: síntesis de mensajes en malayalam para transporte, comercio o administración local en dispositivos de bajo coste.
- Lectura de noticias y artículos: conversión de texto periodístico a voz en aplicaciones móviles, con división automática por puntuación para manejar párrafos extensos.
- Prototipado de interfaces conversacionales: uso como componente TTS en pipelines de voz para asistentes domésticos o chatbots de voz en malayalam, combinado con un ASR y un LLM externos.
- Generación de contenido audiovisual local: doblaje o narración de vídeos y podcasts en malayalam en equipos sin GPU.

## Benchmarks y rendimiento

| Medida | Lyric Lite | Lyric Voice |
|---|---|---|
| Tasa de error de caracteres (frases) | 2,71 % | 2,81 % |
| Tasa de error de caracteres (párrafos de 17 frases) | 2,1 % | no disponible |
| Fallos del modelo (palabras omitidas, finales cortados, ráfagas, bucles) | 0,4 % (1 de 254 clips) | no disponible |
| Velocidad en CPU (un hilo) | 1,9× tiempo real | no disponible |
| Velocidad frente a Lyric Voice | 3,2× más rápido | referencia |
| Velocidad en teléfono Android de gama baja | 3,2× tiempo real | no disponible |

La evaluación se realizó sobre 254 clips por modelo con las mismas semillas, clip de voz y código; el CER se midió transcribiendo el audio generado con AI4Bharat IndicConformer 600M (CTC, greedy, sin modelo de lenguaje). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de LLM, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU.
- Memoria necesaria: aproximadamente 420 MB de pesos en la primera carga.
- GPU recomendadas: no se requieren; no se documenta soporte GPU en la información disponible.
- Compatibilidad con GPU de consumo: no aplica (inferencia en CPU).
- Teléfonos Android de gama baja: soportado, con velocidad 3,2× superior al tiempo real según el autor.
- Opciones de despliegue: script `inference.py` incluido en el repositorio, con dependencias en `requirements.txt`; no se documenta integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 1,9× tiempo real en un solo hilo de CPU; 3,2× tiempo real en un teléfono Android de gama baja.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Enfoque |
|---|---|---|---|---|
| Lyric Lite — Malayalam | 109,5 M | malayalam | lyric-community-license | TTS en dispositivo, CPU |
| Lyric Voice — Malayalam | 336 M | malayalam | no disponible en la información | TTS de mayor expresividad, más cómputo |
| Lyric Lite — Telugu | no disponible | telugu | lyric-community-license | TTS en dispositivo, CPU |
| Lyric Lite — Hindi | no disponible | hindi | lyric-community-license | TTS en dispositivo, CPU |
| Lyric Lite — Tamil | no disponible | tamil | lyric-community-license | TTS en dispositivo, CPU |
| Lyric Lite — Kannada | no disponible | kannada | lyric-community-license | TTS en dispositivo, CPU |

No se dispone de datos de benchmarks comparativos con modelos TTS de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo admite malayalam; no soporta otros idiomas.
- No admite inglés escrito en caracteres latinos; las palabras inglesas deben transcribirse en escritura malayalam.
- No admite dígitos: los números deben escribirse como palabras.
- Requiere puntuación en textos largos; el texto sin puntuación debe dividirse antes de pasarlo al modelo.
- Riesgo de fallos de síntesis (palabras omitidas, finales cortados, ráfagas o bucles) estimado en un 0,4 % de los clips evaluados.
- Posible riesgo de alucinación en la pronunciación o en la interpretación de texto ambiguo, aunque no se documenta explícitamente.
- Sesgos conocidos: no se documentan en la información disponible.
- Licencia comunitaria propia (lyric-community-license): es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no se detallan en la información proporcionada.
- El modelo tiene un volumen muy bajo de adopción (2 descargas, 0 likes en el momento de la consulta), lo que limita la validación externa.
- No se documentan mecanismos de cuantización ni soporte para aceleración por GPU.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/10X-Technologies/lyric-lite-tts-ml)
- [Lyric Voice — Malayalam (modelo base de la destilación)](https://huggingface.co/10X-Technologies/lyric-voice-tts-ml)
- [Lyric Lite — Telugu](https://huggingface.co/10X-Technologies/lyric-lite-tts-te)
- [Lyric Lite — Hindi](https://huggingface.co/10X-Technologies/lyric-lite-tts-hi)
- [Lyric Lite — Tamil](https://huggingface.co/10X-Technologies/lyric-lite-tts-ta)
- [Lyric Lite — Kannada](https://huggingface.co/10X-Technologies/lyric-lite-tts-kn)
- [Licencia Lyric Community License](https://huggingface.co/10X-Technologies/lyric-lite-tts-ml/blob/main/LICENSE)
