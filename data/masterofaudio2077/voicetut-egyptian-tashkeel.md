# masterofaudio2077/voicetut-egyptian-tashkeel

## Resumen

VoiceTut-Egyptian-Tashkeel es un modelo de síntesis de voz (text-to-speech) especializado en árabe egipcio con soporte explícito de tashkeel, es decir, las vocales cortas diacríticas del árabe. Lo desarrolla el usuario masterofaudio2077 como un fine-tuning del modelo base VoiceTut-TTS de mohammedaly22, que a su vez se apoya en la arquitectura OmniVoice de aproximadamente 0,6 mil millones de parámetros. El problema que aborda es concreto: en árabe egipcio escrito, las vocales cortas suelen omitirse, lo que deja ambigüedad fonética y provoca lecturas incorrectas en los sistemas TTS convencionales.

El ajuste se ha realizado sobre el dataset Rabe3/egyptian-arabic-tts-diacritized, compuesto por 17.546 clips de audio en árabe egipcio (58,6 horas, 9 hablantes) en los que aproximadamente la mitad de las palabras llevan vocales cortas escritas. El resultado es un modelo que, cuando recibe texto vocalizado, respeta esas vocales en la pronunciación, y que mantiene además el comportamiento del modelo base cuando se le pasa texto sin vocalizar.

Su relevancia es acotada pero clara para el nicho del TTS en árabe dialectal: preserva las 19 voces integradas de VoiceTut y la clonación a partir de un clip de referencia, y ofrece una licencia Apache 2.0 que facilita su uso comercial. El repositorio ocupa 12,3 GB y el modelo tiene 612.577.288 parámetros en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniVoice (modelo base VoiceTut-TTS), text-to-speech |
| Parametros totales | 612.577.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe (dialecto egipcio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de VoiceTut-TTS, un sistema TTS basado en la arquitectura OmniVoice con unos 0,6 mil millones de parámetros, y se ha afinado mediante fine-tuning supervisado sobre el dataset Rabe3/egyptian-arabic-tts-diacritized. Ese corpus contiene 17.546 clips de árabe egipcio que suman 58,6 horas de audio y cubren 9 hablantes; en aproximadamente la mitad de las palabras del texto asociado aparecen vocales cortas (tashkeel) escritas de forma explícita.

La innovación técnica principal es el condicionamiento del modelo a la vocalización del texto de entrada: al escribir las vocales, el modelo las pronuncia, mientras que con texto sin vocalizar mantiene el comportamiento del modelo base. Durante el entrenamiento se conservó el mecanismo de prompt de voz, de modo que siguen operativas tanto las 19 voces integradas de VoiceTut como la clonación de voz a partir de un clip de referencia. No se dispone de información sobre el volumen total de tokens, la composición detallada del dataset más allá de lo indicado, ni sobre si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz en árabe egipcio a partir de texto, con soporte de vocales cortas (tashkeel) que el modelo respeta en la pronunciación.
- Funcionamiento en dos modos: texto vocalizado (total o parcialmente) y texto sin vocalizar, que reproduce el comportamiento del modelo base.
- 19 voces integradas heredadas de VoiceTut-TTS.
- Clonación de voz a partir de un clip de referencia, gracias a la conservación del prompt de voz durante el fine-tuning.
- Generación de audio en formato WAV, según los ejemplos publicados en la model card.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al árabe; el dialecto objetivo es el egipcio.

## Casos de uso

- Audiolibros y narración en árabe egipcio: el modelo permite vocalizar el texto para fijar la pronunciación correcta de palabras ambiguas y producir una lectura natural con una de las 19 voces integradas.
- Aplicaciones de accesibilidad para lectores en árabe dialectal: conversión de texto a voz con control fino de la vocalización, útil para usuarios que necesitan una pronunciación clara y no ambigua.
- Asistentes de voz y chatbots de atención al cliente en Egipto: el modelo puede generar respuestas habladas en dialecto egipcio, y la clonación de voz permite mantener una identidad sonora consistente con la marca.
- Contenido educativo de árabe: al respetar el tashkeel, sirve para materiales didácticos en los que la vocalización es parte del contenido, como ejercicios de lectura o enseñanza de pronunciación.
- Doblaje y locución para vídeo corto: la clonación a partir de un clip de referencia facilita generar locuciones con una voz concreta sin necesidad de grabación adicional.
- Prototipado de productos de voz en árabe egipcio: la licencia Apache 2.0 y el tamaño contenido (0,6 mil millones de parámetros) permiten integrar el modelo en pruebas de concepto y despliegues internos con requisitos moderados de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 612,6 millones de parámetros, una estimación orientativa en precisión completa ronda los 2,5 GB de pesos, y en cuantizaciones de 8 o 4 bits bajaría aproximadamente a 1,2 GB o 0,6 GB, respectivamente (cálculo teórico, no verificado por el autor).
- GPU recomendadas: no disponible; por tamaño, el modelo debería caber en GPU de consumo como RTX 3060, RTX 4060 o superiores, aunque no hay confirmación oficial.
- Cabe en GPU de consumo: probable por el número de parámetros, sin confirmación documentada.
- Opciones de despliegue: no disponible; la model card no detalla integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| voicetut-egyptian-tashkeel | 612.577.288 | no disponible | árabe (egipcio) | Apache 2.0 | Fine-tuning con soporte de tashkeel y clonación de voz |
| VoiceTut-TTS (modelo base) | no disponible | no disponible | árabe (egipcio) | no disponible | Sin ajuste específico para vocales cortas |
| Otros modelos TTS en árabe | no disponible | no disponible | árabe | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en árabe egipcio; no se ha documentado su comportamiento en árabe estándar moderno ni en otros dialectos.
- El soporte de tashkeel depende de que el texto de entrada incluya las vocales; con texto sin vocalizar el modelo se comporta como el base y puede producir pronunciaciones ambiguas.
- No hay datos publicados sobre sesgos, tasas de alucinación acústica ni métricas objetivas de calidad (MOS, WER), por lo que la evaluación cualitativa recae en el usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base VoiceTut-TTS y del dataset utilizado, ya que la ficha no detalla sus licencias originales.
- El tamaño del repositorio (12,3 GB) es notablemente superior al de los pesos del modelo, probablemente por los ejemplos de audio incluidos, lo que conviene tener en cuenta al descargarlo.
- No se documentan limitaciones de contexto, latencia ni requisitos de hardware, lo que dificulta planificar un despliegue en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/voicetut-egyptian-tashkeel
- Modelo base VoiceTut-TTS: https://huggingface.co/mohammedaly22/VoiceTut-TTS
- Dataset de entrenamiento: https://huggingface.co/datasets/Rabe3/egyptian-arabic-tts-diacritized
- Ejemplos de audio (escena 0): https://huggingface.co/masterofaudio2077/voicetut-egyptian-tashkeel/resolve/main/samples/tuned/scene0_full.wav
- Ejemplos de audio (escena 1): https://huggingface.co/masterofaudio2077/voicetut-egyptian-tashkeel/resolve/main/samples/tuned/scene1_full.wav
