# HAizelf/speecht5_tts_voxpopuli_nl

## Resumen

speecht5_tts_voxpopuli_nl es un modelo de sintesis de voz (text-to-speech) obtenido mediante fine-tuning de microsoft/speecht5_tts sobre el subconjunto neerlandes (`nl`) del corpus VoxPopuli. Lo publica el usuario HAizelf en Hugging Face y esta pensado para generar audio en neerlandes a partir de texto, con control de locutor mediante embeddings de voz. El modelo resuelve el problema de disponer de un TTS en neerlandes razonablemente entrenado sin partir de cero, reutilizando un checkpoint preentrenado multilingue y adaptandolo a un unico idioma.

La arquitectura es SpeechT5, un modelo encoder-decoder basado en transformer que combina un encoder de texto y un decoder autorregresivo que produce espectrogramas mel, posteriormente convertidos a forma de onda de 16 kHz mediante el vocoder HiFi-GAN de Microsoft. El checkpoint tiene 144.433.890 parametros y un tamano de repositorio de aproximadamente 0,6 GB. No es un modelo de lenguaje general: su unica tarea es la sintesis de voz.

Su relevancia es acotada pero concreta: cubre un hueco de recursos TTS abiertos para neerlandes con licencia MIT, un idioma con menos oferta que el ingles o el castellano. La model card lo enmarca como ejercicio del curso de audio de Hugging Face (Unidad 6), por lo que conviene tratarlo como un modelo experimental mas que como un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder transformer para texto-a-espectrograma mel) |
| Parametros totales | 144.433.890 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entradas de texto limitadas a menos de 200 tokens durante el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | neerlandes (`nl`) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

SpeechT5 es una arquitectura encoder-decoder tipo transformer disenada especificamente para tareas de habla. El encoder procesa la secuencia de tokens de texto y el decoder genera de forma autorregresiva un espectrograma mel; la sintesis final a audio la realiza un vocoder separado, en este caso `microsoft/speecht5_hifigan`, que produce una forma de onda de 16 kHz. El modelo incorpora un mecanismo de condicionamiento por locutor: se le pasa un vector x-vector de 512 dimensiones que determina la identidad vocal del audio generado.

El fine-tuning se realizo sobre el subconjunto `nl` de VoxPopuli, filtrando locutores con entre 100 y 400 intervenciones y entradas de texto de menos de 200 tokens, con un total de 7.433 ejemplos de entrenamiento y 826 de test (particion `train_test_split(test_size=0.1, seed=42)`). Los embeddings de locutor son x-vectors de 512 dimensiones obtenidos con `speechbrain/spkrec-xvect-voxceleb`. Los caracteres acentuados ausentes del vocabulario de SpeechT5 se mapearon a letras planas (à→a, ç→c, è/ë→e, í/ï→i, ö→o, ü→u). El entrenamiento uso AdamW con betas (0,9; 0,999), learning rate 1e-5, batch efectivo de 32 (batch 4 con 8 pasos de acumulacion), scheduler lineal con 500 pasos de warmup, precision mixta nativa AMP y 4.000 pasos totales. Se subio el mejor checkpoint por perdida de evaluacion (paso 3500). No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Sintesis de voz (text-to-speech) en neerlandes a partir de texto plano.
- Control de identidad del locutor mediante embeddings x-vector de 512 dimensiones.
- Generacion de espectrogramas mel compatibles con el vocoder `microsoft/speecht5_hifigan` para obtener audio a 16 kHz.
- Manejo de texto con caracteres acentuados mediante el mapeo a letras planas descrito en la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene modo de razonamiento (thinking), vision ni audio de entrada.
- Capacidad multilingue: no disponible; el modelo esta entrenado solo para neerlandes.

## Casos de uso

- Lectura de articulos y boletines en neerlandes: el modelo convierte texto a voz con un locutor controlable mediante un x-vector precalculado, util para servicios de noticias o accesibilidad web en flamenco y neerlandes.
- Audiolibros y contenido largo en neerlandes: se puede trocear el texto en fragmentos de menos de 200 tokens (limite del entrenamiento) y sintetizar cada uno con el mismo embedding de locutor para mantener coherencia vocal.
- Sistemas de aviso y locucion automatizada: mensajes de transporte publico, megafonia o asistentes de voz en neerlandes donde se necesita una voz sintetica con licencia permisiva (MIT).
- Generacion de datos de audio sintetico para entrenar o aumentar modelos ASR en neerlandes: al poder fijar el locutor con x-vectors, se generan muestras controladas de texto-audio para data augmentation.
- Prototipado de asistentes conversacionales en neerlandes: integrado en un pipeline con un LLM que produzca el texto de respuesta y este modelo que lo vocalice, con el vocoder HiFi-GAN como etapa final.
- Investigacion en TTS de bajo recurso: sirve como linea base reproducible (hiperparametros y particion documentados) para comparar fine-tunings de SpeechT5 en otros idiomas o corpus.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son la perdida de evaluacion sobre el split de test de VoxPopuli `nl` (10 % reservado, semilla 42).

| Metrica | Dataset | Valor |
|---|---|---|
| Eval loss (mejor checkpoint, paso 3500) | VoxPopuli `nl`, test 10 % (seed 42) | 0,4641 |
| Eval loss (reevaluado antes de subir) | VoxPopuli `nl`, test 10 % (seed 42) | 0,4642 |

Evolucion de la perdida de validacion durante el entrenamiento:

| Paso | Epoca | Validation loss |
|---|---|---|
| 500 | 2,15 | 0,5052 |
| 1000 | 4,29 | 0,4858 |
| 1500 | 6,44 | 0,4749 |
| 2000 | 8,59 | 0,4700 |
| 2500 | 10,73 | 0,4671 |
| 3000 | 12,88 | 0,4647 |
| 3500 | 15,02 | 0,4641 |
| 4000 | 17,17 | 0,4642 |

No se han publicado resultados de MMLU, HumanEval, GSM8K, MOS, WER ni otras metricas de calidad perceptual o inteligibilidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa unos 0,6 GB en safetensors (144,4 M de parametros en fp32); con el vocoder HiFi-GAN y los buffers intermedios, la inferencia cabe holgadamente en menos de 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior es mas que suficiente. Para lotes grandes o servicio concurrente, una A10, L4 o A100 aportan margen.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para uso no interactivo.
- Opciones de despliegue: transformers (SpeechT5Processor, SpeechT5ForTextToSpeech y SpeechT5HifiGan), y servidores compatibles con la API de inferencia de Hugging Face (el modelo esta marcado como `endpoints_compatible`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a esta arquitectura.
- Latencia y throughput estimados: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| HAizelf/speecht5_tts_voxpopuli_nl | 144,4 M | entradas < 200 tokens en entrenamiento | neerlandes | MIT | Fine-tuning especifico; eval loss 0,4641 |
| microsoft/speecht5_tts | no disponible | no disponible | multilingue (preentrenado) | MIT | Modelo base; calidad en neerlandes inferior sin fine-tuning |
| Otros TTS abiertos para neerlandes | no disponible | no disponible | neerlandes | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de comparativas con metricas objetivas (MOS, WER) frente a alternativas como Coqui TTS, Piper o VITS en neerlandes, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo experimental derivado de un ejercicio de curso; la model card deja secciones de usos previstos y datos como "More information needed".
- Entrenado exclusivamente con el subconjunto `nl` de VoxPopuli, un corpus de discursos parlamentarios: el dominio y el registro estan sesgados hacia habla formal y politica, y la cobertura de locutores es limitada (filtro de 100 a 400 intervenciones).
- El mapeo de caracteres acentuados a letras planas degrada la pronunciacion de palabras con diacriticos en neerlandes.
- Entradas de texto limitadas a menos de 200 tokens durante el entrenamiento; textos mas largos requieren troceado manual.
- Riesgo de artefactos acusticos, prosodia monotona y errores de pronunciacion en palabras fuera del vocabulario o nombres propios, habitual en TTS con pocos datos.
- Requiere pasar un x-vector de 512 dimensiones como `speaker_embeddings`; sin el, la generacion no es posible tal como se documenta.
- Licencia MIT, que permite uso comercial, pero el autor no ofrece garantias de calidad ni de idoneidad para produccion.
- El modelo no genera texto ni razona: no debe evaluarse con benchmarks de LLM ni usarse para tareas distintas de la sintesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HAizelf/speecht5_tts_voxpopuli_nl
- Modelo base: https://huggingface.co/microsoft/speecht5_tts
- Vocoder: https://huggingface.co/microsoft/speecht5_hifigan
- Embeddings de locutor: https://huggingface.co/speechbrain/spkrec-xvect-voxceleb
- Dataset: https://huggingface.co/datasets/facebook/voxpopuli
- Curso de audio de Hugging Face (Unidad 6): https://huggingface.co/learn/audio-course
