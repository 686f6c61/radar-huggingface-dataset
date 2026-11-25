# masterofaudio2077/voicetut-egyptian-tashkeel

## Resumen

voicetut-egyptian-tashkeel es un modelo de síntesis de voz (text-to-speech) especializado en árabe egipcio con soporte explícito de tashkeel (vocales cortas o diacríticos). Lo desarrolla el usuario masterofaudio2077 como un fine-tuning del modelo base mohammedaly22/VoiceTut-TTS, que a su vez se apoya en la arquitectura OmniVoice de aproximadamente 0,6 mil millones de parámetros. El modelo resuelve un problema concreto del árabe escrito: la omisión habitual de las vocales cortas en el texto, que provoca ambigüedad en la pronunciación. Aquí, si el texto lleva tashkeel, el modelo lo respeta al sintetizar.

El ajuste se realizó sobre el conjunto de datos Rabe3/egyptian-arabic-tts-diacritized, compuesto por 17.546 clips de árabe egipcio (58,6 horas, 9 hablantes) en los que aproximadamente la mitad de las palabras llevan vocales cortas anotadas. El resultado es un modelo que mantiene las 19 voces integradas de VoiceTut y la clonación a partir de un clip de referencia, y que además admite texto sin vocalizar con el comportamiento previo.

Es relevante ahora porque cubre un nicho poco atendido: TTS de alta calidad para un dialecto árabe específico (egipcio) con control prosódico fino mediante diacríticos, bajo licencia Apache 2.0 y con un tamaño (612 millones de parámetros) que permite despliegue en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniVoice (modelo de TTS; detalles internos de la arquitectura no disponibles) |
| Parametros totales | 612.577.288 (~0,61 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ar (árabe, dialecto egipcio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint mohammedaly22/VoiceTut-TTS, que emplea la arquitectura OmniVoice en su variante de 0,6 B de parámetros. La información disponible no detalla la composición interna de la arquitectura (tipo de encoder de texto, decoder acústico, vocoder ni mecanismo de condicionamiento por voz), por lo que esos extremos quedan como no disponibles.

El entrenamiento de ajuste utilizó el dataset Rabe3/egyptian-arabic-tts-diacritized: 17.546 clips de árabe egipcio, 58,6 horas de audio y 9 hablantes, con texto parcialmente vocalizado (tashkeel en torno a la mitad de las palabras). Durante el ajuste se conservó el prompt de voz, de modo que se mantienen tanto las 19 voces integradas del modelo base como la clonación por clip de referencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz en árabe egipcio a partir de texto.
- Respeto del tashkeel: si el texto incluye vocales cortas, el modelo las pronuncia según lo escrito.
- Funcionamiento con texto plano sin vocalizar, manteniendo el comportamiento del modelo base.
- 19 voces integradas heredadas de VoiceTut-TTS.
- Clonación de voz a partir de un clip de referencia (voice prompt).
- Control de prosodia y pronunciación mediante anotación manual de diacríticos.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Audiolibros y narración en árabe egipcio: el modelo permite vocalizar el texto con tashkeel para fijar una pronunciación consistente en pasajes largos, algo crítico en lectura literaria.
- Locución para medios y publicidad: con 19 voces integradas y clonación por referencia, se pueden generar cuñas en dialecto egipcio con la voz de un locutor concreto a partir de un clip.
- Contenido educativo de árabe: al respetar las vocales cortas, sirve para materiales de aprendizaje donde la pronunciación correcta es el objetivo pedagógico.
- Asistentes de voz y atención al cliente en Egipto: el dialecto egipcio es el registro natural del usuario; el modelo permite respuestas habladas con voces variadas y consistentes.
- Doblaje y localización de vídeo: generación de pistas de voz en egipcio para contenido subtitulado, con control de pronunciación mediante tashkeel en términos ambiguos.
- Accesibilidad: conversión de texto a voz para lectores de pantalla en árabe egipcio, con la posibilidad de elegir voz y ajustar la vocalización del texto de entrada.
- Prototipado rápido de aplicaciones de voz: el tamaño de 0,6 B y la licencia Apache 2.0 facilitan integrar el modelo en demos y productos sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (612 M de parámetros), en fp32 los pesos ocupan unos 2,4 GB y en fp16 unos 1,2 GB, a lo que hay que sumar el coste del vocoder y del pipeline de audio.
- GPU recomendadas: no disponibles en la información; por tamaño, una GPU consumer de gama media-alta (por ejemplo, RTX 3060/4070 o superiores) debería ser suficiente para inferencia en fp16.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: no se documentan en la información disponible (no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI; el pipeline declarado es text-to-speech).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| voicetut-egyptian-tashkeel | ~0,61 B | no disponible | ar (egipcio) | Apache 2.0 | Fine-tuning con tashkeel y clonación de voz |
| mohammedaly22/VoiceTut-TTS (base) | ~0,6 B (OmniVoice) | no disponible | ar | no disponible en esta ficha | Modelo base sin ajuste específico de tashkeel |
| Alternativas de TTS multilingüe | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- El modelo está especializado en árabe egipcio; no se documenta rendimiento en árabe estándar moderno ni en otros dialectos.
- El beneficio del tashkeel depende de que el texto de entrada esté vocalizado; con texto plano se comporta como el modelo base y persiste la ambigüedad de pronunciación.
- Riesgo de alucinación acústica y de errores de pronunciación en palabras no vistas durante el ajuste, especialmente en nombres propios y términos técnicos.
- El dataset de ajuste es reducido (58,6 horas, 9 hablantes), lo que puede limitar la diversidad de estilos y acentos dentro del egipcio.
- No se documentan sesgos específicos, pero al derivar de un corpus limitado pueden aparecer sesgos de hablante, género o registro.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de origen antes de producción.
- No hay información sobre latencia, throughput ni calidad objetiva (MOS) que permita garantizar un SLA en producción.
- El repositorio ocupa 12,3 GB, lo que sugiere la presencia de múltiples artefactos (checkpoints, muestras de audio) además de los pesos; conviene revisar qué ficheros se descargan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/voicetut-egyptian-tashkeel
- Modelo base VoiceTut-TTS: https://huggingface.co/mohammedaly22/VoiceTut-TTS
- Dataset de ajuste: https://huggingface.co/datasets/Rabe3/egyptian-arabic-tts-diacritized
- Muestras de audio del modelo: https://huggingface.co/masterofaudio2077/voicetut-egyptian-tashkeel/tree/main/samples
