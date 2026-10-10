# danish-foundation-models/edda-v0.2-large

## Resumen

Edda v0.2 large es un modelo de reconocimiento automático del habla (ASR) especializado en danés, desarrollado por danish-foundation-models. Se trata de un ajuste fino completo de openai/whisper-large-v3 (1.543.490.560 parámetros, decodificador de 32 capas) sobre 2.600 horas de habla danesa transcrita, reutilizando la receta de entrenamiento de Edda v0.2. Su objetivo es cubrir un hueco claro: la mayoría de modelos ASR multilingües funcionan de forma mediocre en danés, y este modelo concentra toda su capacidad en un único idioma.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad directa con la librería transformers y con el pipeline `automatic-speech-recognition`. En el arnés del ranking abierto de ASR danés (`RyeAI/danish-asr-leaderboard`) obtiene un WER medio de 8,65 sobre cinco conjuntos de prueba, incluyendo dominios exigentes como conversación espontánea (CoRal-v3 conversation, WER 15,97) y lectura en voz alta (WER 8,65).

Es relevante ahora porque la comunidad danesa ha producido corpus de referencia recientes (CoRal-v3, FTSpeech, NST) que permiten entrenar ASR específico de idioma con calidad competitiva, y porque el modelo está pensado para integrarse en pipelines de producción vía transformers o faster-whisper, con soporte explícito de prompting por texto previo e indicaciones de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (fine-tune completo de openai/whisper-large-v3; decodificador de 32 capas) |
| Parametros totales | 1.543.490.560 (1,54 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible como cifra en la informacion proporcionada; el modelo procesa audio en ventanas de 30 s (`chunk_length_s=30`) y dispone de la ranura de prompt de Whisper (`<\|startofprev\|>`) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones oficiales de este modelo) |
| Idiomas soportados | Danes (`da`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,1 GB; libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder con decodificador autorregresivo de 32 capas, entrenado originalmente por OpenAI para ASR multilingüe y traducción de voz. En este caso no hay cambios estructurales, sino un ajuste fino completo sobre 2.600 horas de audio danés, con la receta del modelo Edda v0.2. La elección del decodificador de 32 capas (frente a las 4 capas de la variante turbo de Edda v0.2) es lo que explica su mejor rendimiento en habla leída y en FLEURS, donde las palabras raras y de contenido deciden la puntuación, y su peor comportamiento relativo en conversación espontánea.

Los datos de entrenamiento son seis corpus públicos, usando solo las particiones de entrenamiento y solo transcripciones gold (sin pseudo-etiquetas): FTSpeech (parlamento, 983.989 clips / 1.690 h, 43 % de los pasos de entrenamiento), CoRal-v3 read-aloud (299.253 clips / 521 h, 24 %), NST Danish (182.575 clips / 239 h, 16 %), CoRal-v3 conversation (147.184 clips / 144 h, 12 %), FLEURS da_dk (2.463 clips / 7,5 h, 3 %) y Common Voice. Tras el filtrado quedan 1,62 millones de clips.

Dos detalles tecnicos destacables: primero, se entrenó al modelo para usar la ranura de texto previo de Whisper (`<|startofprev|>`), condicionando la mitad de los clips de entrenamiento con el enunciado anterior del mismo hablante, de modo que un prompt de contexto ayuda y un prompt irrelevante apenas penaliza; segundo, `generation_config.json` fija `num_beams=5`, que es la configuración con la que se midieron todas las cifras de la model card, de modo que una llamada directa a `model.generate()` en versiones antiguas de transformers podría decodificar de forma greedy y empeorar el resultado.

## Capacidades

- Transcripcion de voz a texto en danes, con salida en mayusculas/minusculas y puntuacion segun el estilo de los corpus de entrenamiento (FTSpeech es minuscula sin puntuacion; el resto esta mayoritariamente puntuado).
- Procesamiento de audios largos: con `chunk_length_s=30` los clips de mas de 30 s se transcriben en ventanas consecutivas de 30 s que despues se unen, sin truncar el audio.
- Acepta cualquier frecuencia de muestreo que el pipeline pueda leer; el audio se remuestrea internamente a 16 kHz.
- Prompting por texto previo o vocabulario de dominio en la ranura de prompt (equivalente a `initial_prompt` / `hotwords` en faster-whisper; ejemplo de la model card: "Folketinget, finansloven, Dansk Industri").
- Configuracion de generacion predefinida para transcripcion en danes (`language="da"`, `task="transcribe"`) y busqueda por haces con 5 beams.
- No se documentan en la informacion disponible capacidades de traduccion, diarizacion de hablantes, marcado de timestamps, tool calling ni agentes.

## Casos de uso

- Subtitulado y transcripcion de medios daneses: el modelo genera texto con puntuacion y mayusculas para audio largo mediante ventanas de 30 s, lo que permite procesar podcasts, informativos o programas completos con un unico pipeline.
- Documentacion de reuniones y actas en empresas danesas: el uso de prompts con vocabulario de dominio (nombres de productos, terminologia interna) reduce errores en palabras poco frecuentes, que es precisamente donde el decodificador de 32 capas rinde mejor.
- Transcripcion de sesiones parlamentarias y actos publicos: FTSpeech aporta el 43 % de los pasos de entrenamiento, por lo que el registro formal y parlamentario danes es el dominio mejor representado del modelo.
- Atencion al cliente y analitica de llamadas: el WER de 15,97 en CoRal-v3 conversation indica que el habla espontanea es el escenario mas dificil, pero sigue siendo utilizable para clasificacion de intenciones, busqueda de palabras clave y analitica agregada.
- Accesibilidad y dictado para hablantes de danes: al ser un modelo pequeno (1,54 B), puede ejecutarse en local en una GPU de consumo, lo que permite aplicaciones de dictado con requisitos de privacidad.
- Generacion de conjuntos de datos de habla etiquetados: transcripcion a escala de archivos de audio daneses para entrenar otros modelos (por ejemplo, sistemas de texto a voz o clasificadores de audio), siempre que se respeten las condiciones de las licencias de los corpus de origen.
- Investigacion en ASR de bajo recurso: sirve como linea base fuerte y reproducible en el ranking danes, con un arnes publico y configuracion de decodificacion declarada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (campo `verified: false` en todos los casos). Medidos con el arnes del ranking danes y busqueda por haces con 5 beams.

| Conjunto de prueba | WER | CER |
|---|---|---|
| CoRal-v3 conversation (test) | 15,97 | 9,20 |
| CoRal-v3 read-aloud (test) | 8,65 | 3,51 |
| Common Voice Danish (leaderboard set, 2.756 clips) | 5,69 | 1,94 |
| FLEURS da_dk (test) | 7,13 | 2,89 |
| FTSpeech (test_balanced) | 5,80 | 3,23 |
| Media | 8,65 | 4,15 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable al tratarse de un modelo puramente de reconocimiento de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp16 los pesos ocupan aproximadamente 3,1 GB, por lo que cabe en GPUs con 6-8 GB de VRAM contando activaciones y buffers de audio; en fp32 serian unos 6,2 GB solo de pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB, como RTX 3060, RTX 4060 Ti, RTX 4070 o superiores; para despliegue con lotes grandes, A100, H100 o L40S.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas. Edda v0.2 (variante turbo, decodificador de 4 capas) es aproximadamente el doble de rapida y puede ser preferible en entornos muy limitados.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de transformers (documentado en la model card), faster-whisper / CTranslate2 (con soporte de `initial_prompt` y `hotwords`), y en general los runners compatibles con pesos Whisper. La model card no documenta despliegue con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. La unica referencia cuantitativa es comparativa: Edda v0.2 es aproximadamente el doble de rapida que Edda v0.2 large.

## Comparativa con modelos similares

| Modelo | Parametros | Decodificador | Idiomas | WER danes | Licencia |
|---|---|---|---|---|---|
| Edda v0.2 large | 1,54 B | 32 capas | da | 8,65 (media en 5 conjuntos) | Apache 2.0 |
| Edda v0.2 | No disponible en la informacion proporcionada | 4 capas (turbo) | da | No disponible; la model card indica que es peor en lectura y FLEURS, pero mejor en conversacion, y unas dos veces mas rapido | Apache 2.0 |
| Edda v0.2 duo | No disponible en la informacion proporcionada | Combinacion de los dos anteriores | da | No disponible; se indica que es mas preciso que cualquiera de los dos por separado | Apache 2.0 |
| openai/whisper-large-v3 | 1,54 B | 32 capas | Multilingue (~99 idiomas) | No disponible en la informacion proporcionada; es el modelo base sin ajuste en danes | Apache 2.0 |

La comparativa con alternativas no danesas del mismo tamano (por ejemplo, otros fine-tunes de Whisper large-v3 para idiomas escandinavos) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Monolingue: solo danes (`da`). No se documenta soporte de cambio de codigo (code-switching) ni de otros idiomas escandinavos, y forzar el idioma podria degradar la salida.
- El escenario de conversacion es claramente el mas debil: WER de 15,97 en CoRal-v3 conversation frente a 5,69-8,65 en los conjuntos de lectura o de habla preparada.
- Sesgo de dominio: el 43 % de los pasos de entrenamiento proviene de FTSpeech (parlamento danes), por lo que el registro formal y politico esta sobrerrepresentado frente a registros coloquiales, jerga o acentos regionales.
- Formato de salida heterogeneo: como los corpus de entrenamiento mezclan estilos, la puntuacion y el uso de mayusculas siguen el estilo de cada corpus y pueden no ser consistentes en un mismo audio.
- Riesgo de alucinacion tipico de Whisper en segmentos con silencio, ruido o musica; conviene validar la salida en produccion en esos tramos.
- Las cifras de la model card estan marcadas como no verificadas (`verified: false`), y el comportamiento del prompting se midio sobre Edda v0.2, no sobre esta variante.
- Si se hace una llamada directa a `model.generate()` sin respetar `generation_config.json`, la decodificacion puede volverse greedy y empeorar la calidad respecto a los numeros publicados.
- Licencia Apache 2.0 para el modelo, lo que permite uso comercial; sin embargo, los corpus de entrenamiento tienen sus propias condiciones (Common Voice, FLEURS, CoRal v3, FTSpeech, NST) que deben revisarse si se reutilizan datos derivados.
- No se documentan limites de longitud mas alla del troceado en ventanas de 30 s, ni soporte de timestamps o diarizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danish-foundation-models/edda-v0.2-large
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Edda v0.2: https://huggingface.co/danish-foundation-models/edda-v0.2
- Edda v0.2 duo: https://huggingface.co/danish-foundation-models/edda-v0.2-duo
- Ranking abierto de ASR danes (Space): https://huggingface.co/spaces/RyeAI/danish-asr-leaderboard
- Arnes del ranking (GitHub): https://github.com/Rye-A1/danish-asr-leaderboard
- Corpus CoRal-v3: https://huggingface.co/datasets/CoRal-project/coral-v3
- Corpus FTSpeech: https://huggingface.co/datasets/alexandrainst/ftspeech
- Corpus NST Danish: https://huggingface.co/datasets/alexandrainst/nst-da
- Corpus FLEURS: https://huggingface.co/datasets/google/fleurs
- Corpus Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Contexto sobre el idioma danes: https://en.wikipedia.org/wiki/Danish_language
- Contexto sobre Dinamarca: https://en.wikipedia.org/wiki/Denmark
