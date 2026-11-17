# anand-k-maurya/prakriti-v1

## Resumen

Prakriti v1 es un modelo de síntesis de voz (text-to-speech) de 82 millones de parámetros desarrollado por anand-k-maurya, orientado a hindi, hinglish (hindi-inglés mezclado) e inglés indio. Se trata de un fine-tune de Kokoro-82M entrenado con la receta de dos etapas de StyleTTS 2, e incorpora diez voces con estilos emocionales por voz y un front-end de texto específico para hindi que cubre números, moneda, expresiones horarias indias, acrónimos, eliminación de schwa basada en reglas, sonidos nukta y un léxico de pronunciación verificado contra audio grabado.

El modelo resuelve un problema concreto: la mayoría de sistemas TTS ligeros no manejan bien el code-switching hindi-inglés ni las particularidades fonéticas del hindi. Prakriti v1 añade esa capa de normalización lingüística manteniendo el tamaño reducido (82M) y la velocidad del modelo base: aproximadamente 36 veces más rápido que tiempo real en GPU y 2,6 veces en CPU con cuatro hilos.

Es relevante ahora porque demuestra que un fine-tune pequeño y con licencia Apache-2.0 puede cubrir un nicho lingüístico mal atendido con calidad medible, a un coste de cómputo de una sola RTX A6000. El repositorio ocupa 0,7 GB y la librería de inferencia es `kokoro`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (fine-tune de Kokoro-82M) |
| Parametros totales | 82M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, procesa texto por frases con streaming) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi), inglés (en), hinglish (code-mixed) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 0,7 GB, librería `kokoro`) |

## Arquitectura y entrenamiento

El modelo parte de Kokoro-82M y se afina con la receta de dos etapas de StyleTTS 2, adaptada de kikiri-tts. StyleTTS 2 combina un codificador de estilo y un decodificador acústico con un discriminador de estilo; en esta adaptación se añaden vectores de estilo emocional por voz que se promedian para condicionar la prosodia. La salida es audio mono a 24 kHz en float32.

El conjunto de entrenamiento suma 54,7 horas tras filtrado (41 592 clips de hasta 12 segundos). Se compone de Rasa Hindi (voz de estudio expresiva real, CC-BY-4.0) y 32 000 frases sintetizadas con Maya 2 Native en ocho voces; el texto se generó con Qwen3-32B para cubrir hindi, hinglish e inglés, once emociones y el 99,4 % de las 20 000 palabras hindi más frecuentes. El filtro de calidad aplica coincidencia de transcripción con Whisper, comprobaciones de señal (clipping, silencio, velocidad de habla) y puntuación emocional. Para la pronunciación, cada palabra donde eSpeak y las reglas hindi de Prakriti discrepan se etiqueta con la variante que coincide con el audio grabado (puntuada con un reconocedor de fonemas), y las votaciones mayoritarias forman `lexicon.json`. Todo el entrenamiento se ejecutó en una única RTX A6000 de 48 GB.

## Capacidades

- Síntesis de voz en hindi, hinglish e inglés indio con diez voces (seis femeninas, cuatro masculinas).
- Estilos emocionales por voz: angry, calm, empathetic, excited, fear, happy, sad, serious, surprised y whisper, con control de intensidad.
- Front-end de texto hindi: normalización de números, moneda, expresiones horarias indias (साढ़े पाँच, पौने सात), acrónimos, eliminación de schwa basada en reglas, sonidos nukta y léxico de pronunciación verificado.
- Marcadores no verbales en el texto: `[laugh]`, `[sigh]`, `[gasp]`, `[hmm]`, `[breath]`.
- Streaming por frases para asistentes de voz: `tts.stream(long_text, voice=...)` devuelve fragmentos de audio a medida que están listos.
- Ejecución en CPU o GPU, en Linux, Windows y macOS.
- Interfaz de línea de comandos (`prakriti "texto" -v Rasa_F -e happy -o salida.wav`) y API de Python.
- Calibración de tono: tras el ajuste, cada voz habla dentro de unos pocos Hz de sus grabaciones de entrenamiento, sin cambio en error ni naturalidad.

## Casos de uso

- Asistentes de voz para el mercado indio: el streaming por frases permite empezar a reproducir audio antes de terminar de sintetizar el texto completo, con un factor de 36,6x en GPU y 2,6x en CPU de cuatro hilos, adecuado para respuestas conversacionales de baja latencia.
- Atención al cliente automatizada en hindi e hinglish: el front-end normaliza números de pedido, importes y horas, y el code-switching permite frases como "कल मेरी office में meeting है" sin cambiar de modelo.
- Audiolibros y contenido narrado: los diez estilos emocionales y el control de intensidad permiten variar la prosodia por pasaje; las voces de estudio `Rasa_F` y `Rasa_M` son las más naturales (UTMOS 4,15 y 4,12 en hindi y hinglish).
- Localización de vídeo y e-learning: generación de pistas de voz en hindi e inglés indio a partir de guiones, con salida WAV a 24 kHz lista para mezcla.
- Integración en dispositivos embebidos: el tamaño de 82M y la ejecución en CPU con dos hilos (1,6x tiempo real, 2,5 s por frase) lo hacen viable en hardware sin GPU dedicada.
- Prototipado de interfaces de voz: la instalación vía `pip install "git+https://huggingface.co/anand-k-maurya/prakriti-v1"` y la API `Prakriti.from_pretrained` permiten integrar TTS en aplicaciones Python con caché local tras la primera descarga.
- Pruebas A/B de prosodia: el parámetro `intensity` y los estilos por voz permiten generar variantes del mismo texto para evaluar preferencia de usuarios.

## Benchmarks y rendimiento

Evaluación sobre las mismas 65 frases de test para todos los sistemas (Prakriti y Maya con todas sus voces; Kokoro con sus 4 voces hindi y 4 inglesas).

| Sistema | Error hindi | Error hinglish | Error inglés | Naturalidad (UTMOS) | Tamano |
|---|---|---|---|---|---|
| Prakriti v1 | 2,7 % | 14,1 % | 0,0 % | 3,75 (hindi), 4,11 (inglés) | 82M |
| Kokoro-82M (stock) | 2,6 % | 11,3 % | 0,0 % | 4,26 (hindi), 4,38 (inglés) | 82M |
| Maya 2 Native (teacher) | 3,1 % | 11,0 % | 0,9 % | 3,45 (hindi), 3,75 (inglés) | 2,5B |

Las dos voces de estudio obtienen la mayor naturalidad: `Rasa_F` 4,15 y `Rasa_M` 4,12 en frases hindi y hinglish (8,3 % de error combinado para ambas), frente a 3,63-3,93 de las otras ocho.

| Dispositivo | Veces más rápido que tiempo real | Tiempo mediano por frase |
|---|---|---|
| GPU (RTX A6000) | 36,6x | 0,11 s |
| CPU, 4 hilos | 2,6x | 1,6 s |
| CPU, 2 hilos | 1,6x | 2,5 s |

El error es la tasa de error de caracteres de Whisper large-v3 tras transliteración neutral al alfabeto (hindi, hinglish) o la tasa de error de palabras (inglés); menor es mejor, y las cifras de hinglish incluyen ruido de transliteración en todos los sistemas. La naturalidad es UTMOS, un predictor automático entrenado en inglés: sirve para comparar sistemas, no como puntuación absoluta.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Naturalidad (UTMOS) | Error hindi | Disponibilidad |
|---|---|---|---|---|---|---|
| Prakriti v1 | 82M | hi, en, hinglish | Apache-2.0 | 3,75 (hi), 4,11 (en) | 2,7 % | Hugging Face, `kokoro` |
| Kokoro-82M | 82M | múltiples, incl. hi/en | Apache-2.0 | 4,26 (hi), 4,38 (en) | 2,6 % | Hugging Face, `kokoro` |
| Maya 2 Native | 2,5B | hi, en | no disponible | 3,45 (hi), 3,75 (en) | 3,1 % | modelo profesor citado, no disponible en el repositorio |

Kokoro-82M supera a Prakriti v1 en naturalidad automática y en error hinglish, pero no ofrece estilos emocionales por voz ni el front-end hindi específico (normalización horaria, léxico verificado). Maya 2 Native, 30 veces mayor, obtiene peor naturalidad medida y se usó como profesor para destilar ocho de las diez voces.

## Limitaciones y advertencias

- La emoción es moderada: los estilos son vectores de estilo promediados; tristeza y sorpresa se perciben, pero enfado, miedo y excitación son sutiles. La actuación emocional fuerte requiere entrenamiento condicionado por emoción.
- Los sonidos no verbales son débiles: `[laugh]` solo tuvo 42 ejemplos de entrenamiento, por lo que la risa puede ser tenue o ausente.
- El hinglish romanizado ("kya haal hai") se lee con reglas inglesas; para mejores resultados hay que escribir las palabras hindi en devanagari.
- Las ocho voces destiladas suenan menos naturales que las dos de estudio e heredan artefactos del modelo profesor.
- No evaluado en NPU Rockchip; el factor de tiempo real en CPU sobre ARM no está disponible.
- Riesgo de alucinación acústica: como todo TTS, puede producir pronunciaciones incorrectas en palabras fuera del léxico o en nombres propios no cubiertos.
- Sesgos: el dataset se limita a hindi, hinglish e inglés indio; no hay evaluación de sesgos de género, acento regional o dialecto.
- Licencia Apache-2.0 permite uso comercial, pero el dataset Rasa Hindi es CC-BY-4.0 y las voces destiladas derivan de Maya 2 Native, cuyos términos de uso no se detallan en la información disponible.
- No se especifican tipos de cuantización ni formatos de pesos alternativos; el despliegue depende de la librería `kokoro` y de `espeak-ng` para el fonemizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anand-k-maurya/prakriti-v1
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Dataset Rasa (ai4bharat): https://huggingface.co/datasets/ai4bharat/Rasa
- Repositorio kikiri-tts (receta StyleTTS 2 adaptada): no disponible en la información proporcionada
- espeak-ng (dependencia del fonemizador): https://github.com/espeak-ng/espeak-ng/releases
