# byteknotlabs/AksharSTT-V4

## Resumen

AksharSTT v4 es un modelo de reconocimiento automático del habla (ASR) desarrollado por byteknotlabs, especializado en hindi, inglés y habla code-mixed hindi-inglés (hinglish). Se trata de un fine-tuning de Cactus-Compute/whistle, un encoder-decoder de 8 capas de encoder y 8 de decoder con anchura 512 y aproximadamente 55 millones de parámetros, destilado a partir del modelo Shruti como profesor. Su propuesta principal es ejecutarse íntegramente en dispositivo (on-device), sin red, sobre CPUs convencionales y teléfonos, en un único fichero de 29,5 MB con pesos de 4 bits.

El modelo aborda un problema concreto: la transcripción fiable de habla india real, incluyendo el cambio de código hindi-inglés que domina la conversación cotidiana y los tutoriales técnicos, algo que los ASR genéricos suelen resolver mal. Frente a AksharSTT v1 y frente a Shruti, el autor declara mejoras en las seis pruebas de evaluación publicadas, con un WER medio de 20,78 frente a 21,78 de Shruti a 4 bits.

La relevancia actual del modelo reside en su perfil de despliegue: 55 millones de parámetros, cuantización nativa de 4 bits mediante entrenamiento consciente de cuantización (QAT) y un runtime ligero (needle) que se integra en Windows, macOS, Linux, Android, iOS y aplicaciones web. Esto lo sitúa en la categoría de ASR embebido para mercados con conectividad limitada o requisitos de privacidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo Whistle: 8 capas de encoder y 8 de decoder, anchura 512 |
| Parametros totales | ~55 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (acepta audio de cualquier duración; no se especifica ventana máxima) |
| Tipos de cuantizacion | 4 bits nativa (quantisation-aware training); no se listan otros formatos |
| Idiomas soportados | Hindi (`hi`), inglés (`en`) y code-mixed hindi-inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (fichero único de 29,5 MB para el motor needle) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de 55 millones de parámetros con 8 capas en cada bloque y dimensión oculta de 512, derivado de Cactus-Compute/whistle. El vocabulario parte del de Whistle y se amplía con 714 piezas Devanagari procedentes de Shruti, además de una etiqueta de idioma `hi` que permite seleccionar el modo de decodificación. Los pesos se entrenaron directamente en 4 bits mediante quantisation-aware training, de modo que la precisión de inferencia coincide con la de entrenamiento y no requiere un paso de cuantización posterior.

El entrenamiento se realizó sobre aproximadamente 3.900 horas de audio, con Shruti como modelo profesor (destilación). Los conjuntos de datos declarados incluyen IndicVoices, Vaani-transcription-part (ARTPARK-IISc), Shrutilipi, Kathbath, Rural_Women_ASR_v2, NPTEL, FLEURS, LibriSpeech, MUCS-Hinglish y Lahaja. Una innovación destacable es la normalización de la transcripción para hinglish: una lista curada de 2.900 palabras inglesas, marcas y topónimos determina qué términos se escriben en alfabeto latino, mientras que el resto del hindi se escribe en Devanagari, reproduciendo la convención de escritura real de los hablantes. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en hindi, inglés y habla code-mixed hindi-inglés, con selección explícita de idioma mediante la etiqueta `hi` o `en`.
- Entrada de audio de cualquier duración, en fichero WAV o muestras float mono a 16 kHz en el rango [-1, 1].
- Salida con marcas de tiempo a nivel de palabra y probabilidades por palabra cuando se activa `word_timestamps=True`.
- Estilo de salida unificado: hindi en Devanagari, palabras inglesas en latín minúscula, números escritos como palabras y sin puntuación.
- Robustez ante silencio y ruido tenue: en 100 clips de silencio y ruido débil el modelo no genera texto.
- Ejecución totalmente offline en dispositivo, sin llamadas de red, a través del motor needle (`cactus-needle` en PyPI).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado y transcripción de tutoriales técnicos en hinglish: el modelo está evaluado específicamente en MUCS 2021 (WER 34,07) y produce la mezcla Devanagari-latín que los hablantes esperan, lo que lo hace adecuado para generar subtítulos de contenido formativo indio sin postprocesado manual de cambio de código.
- Dictado y notas de voz en aplicaciones móviles sin conectividad: con 29,5 MB y ejecución en CPU, puede embeberse en apps Android e iOS para transcribir notas de voz en zonas con red limitada, sin enviar audio a servidores externos.
- Atención al cliente en centros de contacto indios: permite transcribir conversaciones en hindi e inglés con marcas de tiempo por palabra, útiles para auditoría de calidad y análisis de sentimiento sobre la transcripción.
- Documentación clínica o administrativa en zonas rurales: el entrenamiento incluye Rural_Women_ASR_v2 y Vaani, lo que orienta el modelo a voces rurales y femeninas, un segmento habitualmente infrarrepresentado en ASR comerciales.
- Privacidad y cumplimiento normativo: al ejecutarse on-device sin red, el audio no abandona el dispositivo, lo que facilita el cumplimiento en entornos sanitarios, legales o gubernamentales.
- Transcripción de clases y conferencias en hindi: con entrada de audio de cualquier duración y marcas de tiempo por palabra, puede generar actas alineadas temporalmente con la grabación para plataformas educativas.
- Integración en aplicaciones web mediante el runtime needle: permite añadir dictado en hinglish a herramientas web sin infraestructura de GPU en servidor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Conjunto de evaluación | Metrica | Valor |
|---|---|---|
| Monsoon Hindi (public split) | OIWER | 19,47 |
| FLEURS Hindi (`hi_in`, test) | WER | 18,45 |
| Lahaja (test) | WER | 25,45 |
| MUCS 2021 Hindi-English (test) | WER | 34,07 |
| Svarah (test) | WER | 21,41 |
| LibriSpeech test-clean | WER | 5,82 |

El autor declara un WER medio de 20,78 en los seis conjuntos, frente a 21,78 de Shruti a 4 bits, con mejora en cada uno de los seis conjuntos sobre los mismos clips y con el mismo arnés de evaluación. En Svarah (inglés con acento indio) declara 21,41 frente a 24,68 de AksharSTT v1 y 22,45 de Shruti. No se han publicado en la información disponible resultados de benchmarks adicionales ni comparaciones con otros ASR comerciales.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso habitual; el modelo está diseñado para CPU. El fichero de pesos ocupa 29,5 MB en 4 bits.
- GPU recomendadas: no se especifican; el motor needle está orientado a CPU y dispositivos móviles. Cualquier GPU moderna podría ejecutarlo, pero no es el escenario objetivo.
- Cabe en cualquier CPU de consumo actual y en teléfonos; el requisito de memoria es del orden de decenas de megabytes.
- Opciones de despliegue: motor needle (`pip install cactus-needle==3.2.8`) con integración en Windows, macOS, Linux, Android, iOS y web. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato `.cact`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue | WER declarado |
|---|---|---|---|---|---|---|
| AksharSTT v4 | ~55 M | audio de cualquier duración | hi, en, hinglish | Apache-2.0 | on-device (needle), CPU/móvil | 20,78 medio en 6 conjuntos |
| Shruti | no disponible | no disponible | hi, en | no disponible | no disponible | 21,78 medio en los mismos 6 conjuntos (declarado por el autor) |
| AksharSTT v1 | no disponible | no disponible | hi, en | no disponible | on-device | 24,68 en Svarah (declarado por el autor) |
| Whisper (referencia genérica) | no disponible | no disponible | multilingüe | MIT | servidor/GPU y variantes locales | no disponible en esta ficha |

La comparación se limita a los datos declarados por el autor; no se dispone de evaluaciones independientes de Shruti ni de AksharSTT v1 en la información proporcionada.

## Limitaciones y advertencias

- Estilo de salida fijo: sin puntuación, números como palabras y una única convención de escritura; no es configurable según la model card.
- El WER en hinglish es notablemente superior al de hindi puro (34,07 en MUCS frente a 18,45 en FLEURS Hindi), por lo que la precisión en conversación code-mixed es menor.
- Los resultados de benchmarks son declarados por el autor y están marcados como no verificados; deben tratarse con cautela hasta que exista validación independiente.
- No se documentan sesgos concretos, pero el entrenamiento con datasets específicos (Rural_Women_ASR_v2, Vaani, NPTEL) puede introducir sesgos de dominio y de acento; no hay evaluación de sesgos publicada.
- Riesgo de alucinación en audio ruidoso: aunque el autor declara que no genera texto en silencio y ruido tenue, no se documenta el comportamiento en audio con habla solapada o ruido de fondo intenso.
- Cobertura lingüística limitada a hindi, inglés y su mezcla; no soporta otras lenguas indias.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende del runtime needle, cuyas condiciones de uso y telemetría (desactivable con `NEEDLE_TELEMETRY=0` y `DO_NOT_TRACK=1`) conviene revisar antes de producción.
- El formato `.cact` está atado al motor needle; no hay pesos en safetensors ni GGUF disponibles en la información proporcionada, lo que limita la portabilidad a otros stacks de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byteknotlabs/AksharSTT-V4
- Sitio web y demo en vivo: https://akshar.byteknotlabs.com
- Repositorio GitHub: https://github.com/byteknotlabsai/akshar
- AksharSTT Lite v4: https://huggingface.co/byteknotlabs/AksharSTT-Lite-V4
- AksharSTT v1: https://huggingface.co/byteknotlabs/AksharSTT-V1
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Modelo profesor Shruti: https://huggingface.co/udgamlabs/Shruti
