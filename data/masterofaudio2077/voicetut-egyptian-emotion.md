# masterofaudio2077/voicetut-egyptian-emotion

# Voicetut-egyptian-emotion

## Resumen

Voicetut-egyptian-emotion es un modelo de síntesis de voz (text-to-speech) especializado en árabe egipcio coloquial con control explícito de emoción. Se trata de un ajuste fino (fine-tuning) del modelo VoiceTut-TTS de mohammedaly22, que a su vez se basa en la arquitectura OmniVoice 0.6B del proyecto k2-fsa. El autor, masterofaudio2077, lo publica bajo licencia Apache 2.0 con 612,6 millones de parámetros en formato safetensors.

El problema que resuelve es concreto: la mayoría de sistemas TTS para árabe generan habla neutra y formal (árabe estándar moderno), mientras que el uso real en redes sociales, doblaje, audiolibros o asistentes conversacionales exige dialecto egipcio y variación prosódica. Este modelo acepta una etiqueta de emoción antepuesta al texto y reproduce la frase con esa carga emocional, incluyendo matices como suspiros, risas o susurros.

Es relevante por su carácter de nicho: existen pocos modelos abiertos de TTS emocional específicos para un dialecto árabe, y menos aún con licencia permisiva. El entrenamiento se hizo sobre un corpus propio de 19.480 clips (46,4 horas) en una única voz y 20 emociones. Como contrapartida, el modelo no publica benchmarks, no tiene descargas ni validación de la comunidad y está limitado a un solo hablante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OmniVoice 0.6B (modelo base VoiceTut-TTS); detalles internos de la arquitectura no disponibles |
| Parámetros totales | 612.577.288 (~0,61 mil millones) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-voz); longitud máxima de texto por frase no documentada |
| Tipos de cuantización | no se documentan cuantizaciones oficiales (solo pesos safetensors) |
| Idiomas soportados | árabe, exclusivamente dialecto egipcio (`ar`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Emociones | 20 etiquetas (entre las mostradas: tired, calm, happy, surprised, urgent, excited, playful, sarcastic, tender, sad, whisper, shouting) más modificadores (`+ sighs`, `+ gasps`, `+ chuckles`, `+ laughs`) |
| Voces | una única voz (single-speaker) |
| Tamaño del repositorio | 12,3 GB (incluye pesos y muestras de audio) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 28 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de VoiceTut-TTS, un checkpoint de OmniVoice 0.6B orientado a árabe egipcio, y se ajusta de forma supervisada sobre el dataset `masterofaudio2077/egyptian-emotion-tts`. Ese corpus consta de 19.480 clips en árabe egipcio que suman 46,4 horas de audio, grabados en una sola voz y anotados con 20 emociones. La interfaz de control es textual: la etiqueta de emoción se antepone a la frase y el modelo condiciona la prosodia en consecuencia.

| Dato de entrenamiento | Valor |
|---|---|
| Clips | 19.480 |
| Duración total | 46,4 horas |
| Idioma | árabe egipcio |
| Voces | 1 |
| Emociones anotadas | 20 |
| Dataset | masterofaudio2077/egyptian-emotion-tts |

No se documentan en la información disponible el número de tokens o pasos de entrenamiento, la composición exacta del dataset, la técnica de ajuste (full fine-tuning, LoRA u otra), ni si hubo etapas de RLHF o preferencias. Tampoco se describe ninguna innovación técnica adicional más allá de la herencia de OmniVoice y del condicionamiento por emoción. El repositorio ocupa 12,3 GB pese a que los pesos declarados en safetensors suman cientos de millones de parámetros, lo que sugiere la presencia de material adicional (muestras de audio y posiblemente más de un checkpoint), aunque esto no se detalla en la model card.

## Capacidades

- Síntesis de voz en árabe egipcio coloquial a partir de texto escrito.
- Control de emoción mediante etiqueta antepuesta al texto (20 emociones declaradas).
- Modificadores paralingüísticos adicionales: suspiros, jadeos, risitas y risas, combinables con la emoción base.
- Modos de entrega vocal extremos: susurro (`whisper`) y grito (`shouting`).
- Interpretación de guiones multi-frase con cambios de emoción entre líneas, según los ejemplos de la model card (escenas de desayuno, compras, bromas y recuerdo).
- Generación de audio en formato WAV a través del ecosistema OmniVoice (k2-fsa).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo generativo de audio, no un LLM.
- No dispone de capacidades de visión ni de audio-a-audio (no es un modelo de clonación de voz).

## Casos de uso

- Doblaje y localización de contenido egipcio: el modelo permite reemitir diálogos en dialecto con la emoción original del guion (enfado, sarcasmo, ternura), algo que un TTS neutro no cubre y que resulta crítico para que el doblaje suene natural en series y vídeos cortos.
- Audiolibros y ficción sonora: al soportar 20 emociones y modificadores como suspiros o risas, se puede narrar un mismo capítulo alternando `sad`, `tender` y `calm` sin cambiar de motor ni de voz, manteniendo la coherencia tímbrica al ser un modelo de hablante único.
- Asistentes de voz y sistemas IVR en Egipto: la emoción `calm` o `urgent` permite adaptar el tono de mensajes de espera, avisos de incidencia o confirmaciones, mejorando la percepción de cercanía frente a una voz sintética plana.
- Videojuegos y experiencias interactivas: NPCs con líneas etiquetadas por emoción (`shouting`, `playful`, `whisper`) pueden generar variaciones de audio en tiempo de ejecución sin almacenar un banco de voces completo, siempre que la latencia del pipeline resulte aceptable.
- Generación de datos sintéticos para entrenamiento: el modelo sirve para producir corpus de voz etiquetados emocionalmente en árabe egipcio, un recurso escaso, que después alimenten clasificadores de emoción o sistemas ASR con etiquetas prosódicas.
- Publicidad y contenido para redes: piezas de audio breve donde el matiz (`excited`, `sarcastic`) es el mensaje, con la ventaja de que la licencia Apache 2.0 permite uso comercial sin royalties.
- Accesibilidad: lectura en voz alta de texto en árabe egipcio para usuarios con discapacidad visual, con la posibilidad de marcar énfasis emocional en fragmentos concretos del documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, SIM, RTF) ni comparaciones numéricas con otros sistemas. La única evidencia de calidad son las muestras de audio publicadas en el repositorio para cuatro escenas (desayuno, compras, bromas y recuerdo), que no constituyen una evaluación sistemática.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 612,6 M de parámetros): en fp32 aproximadamente 2,5 GB solo de pesos; en fp16/bf16 en torno a 1,3 GB; con cuantización de 8 bits, unos 0,7 GB. No se publican requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería acomodar el modelo en precisión reducida, incluyendo RTX 3060, RTX 4060, RTX 4090; para despliegue en servidor, A100 o H100 con capacidad de sobra. Dato no confirmado por el autor.
- Inferencia en CPU: viable en teoría por el tamaño del modelo, aunque no se documenta el rendimiento; el repositorio de 12,3 GB debe descargarse completo.
- Opciones de despliegue: el autor indica instalar OmniVoice desde `github.com/k2-fsa/OmniVoice` y cargar los pesos con `huggingface_hub` y PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican de forma estándar a un modelo TTS.
- Latencia y throughput: no disponibles. No se publica RTF ni tiempo de generación por segundo de audio.
- Almacenamiento: prever más de 12 GB de disco para el snapshot del repositorio, además del entorno de OmniVoice y sus dependencias (PyTorch, soundfile).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / alcance | Idiomas | Emoción | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| voicetut-egyptian-emotion | 612,6 M | TTS, frase a frase (longitud no documentada) | Árabe egipcio | 20 etiquetas + modificadores | Apache 2.0 | HuggingFace, 0 descargas |
| VoiceTut-TTS (modelo base) | no disponible en la información proporcionada | TTS | Árabe egipcio | no documentado | no disponible en la información proporcionada | HuggingFace |
| Alternativas de TTS multilingüe con soporte de árabe | no disponible | TTS | varios | control limitado o nulo | varía | no verificado |

No se dispone de datos verificados de benchmarks ni de especificaciones completas de modelos alternativos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable. La comparación cualitativa más sólida es con su propio modelo base: el fine-tuning añade control emocional sobre una única voz y mantiene el mismo tamaño.

## Limitaciones y advertencias

- Una sola voz: no permite elegir hablante ni clonar voces, lo que limita su uso en producciones con varios personajes.
- Idioma restringido al dialecto egipcio; no se garantiza un comportamiento correcto en árabe estándar moderno ni en otros dialectos (golfo, levantino, magrebí).
- Sin benchmarks ni métricas publicadas: la calidad real por emoción es desconocida y puede variar mucho entre las 20 etiquetas según la representación de cada una en el corpus.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; el modelo no ha sido auditado por terceros.
- Metadatos incompletos: no se especifican composición del dataset, horas por emoción, hablantes de origen del audio, proceso de anotación ni técnica de fine-tuning, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación prosódica: la etiqueta de emoción puede no respetarse en frases largas o con signos de puntuación atípicos; no hay documentación sobre longitud máxima de entrada.
- Sesgos potenciales heredados del corpus: una única voz implica un sesgo de edad, género y registro concretos; el modelo reproducirá ese perfil en todas las salidas.
- Uso dual y riesgo de suplantación: un TTS de alta calidad en un dialecto concreto puede emplearse para generar audio engañoso; conviene aplicar marcas de agua o divulgación en producciones públicas.
- Licencia: el modelo se declara Apache 2.0, permisiva para uso comercial, pero la licencia del modelo base VoiceTut-TTS y del dataset de entrenamiento no se detalla en la información disponible y debería verificarse antes de un despliegue comercial.
- Dependencia del ecosistema OmniVoice: el código de inferencia proviene de un repositorio externo (k2-fsa), por lo que la reproducibilidad depende de que ese proyecto mantenga compatibilidad con los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masterofaudio2077/voicetut-egyptian-emotion
- Dataset de entrenamiento: https://huggingface.co/datasets/masterofaudio2077/egyptian-emotion-tts
- Modelo base VoiceTut-TTS: https://huggingface.co/mohammedaly22/VoiceTut-TTS
- Repositorio OmniVoice (k2-fsa): https://github.com/k2-fsa/OmniVoice
- Muestras de audio, escena "morning": https://huggingface.co/masterofaudio2077/voicetut-egyptian-emotion/resolve/main/samples/morning_full.wav
- Muestras de audio, escena "shopping": https://huggingface.co/masterofaudio2077/voicetut-egyptian-emotion/resolve/main/samples/shopping_full.wav
- Muestras de audio, escena "joking": https://huggingface.co/masterofaudio2077/voicetut-egyptian-emotion/resolve/main/samples/joking_full.wav
- Muestras de audio, escena "memorial": https://huggingface.co/masterofaudio2077/voicetut-egyptian-emotion/resolve/main/samples/memorial_full.wav
