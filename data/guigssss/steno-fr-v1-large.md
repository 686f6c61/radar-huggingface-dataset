# guigssss/steno-fr-v1-large

## Resumen

Sténo v1 large es un modelo de reconocimiento automático del habla (ASR) especializado exclusivamente en francés, desarrollado por el usuario independiente guigssss. Se construye sobre la torre de audio del modelo de embeddings de Google EmbeddingGemma 2, a la que se añade un lector CTC entrenado que transforma los estados ocultos en piezas de palabra del tokenizador de Gemma, incluyendo mayúsculas y puntuación en una única pasada no autorregresiva. Con 163 millones de parámetros, se posiciona como una alternativa ligera y rápida frente a los modelos ASR autorregresivos de mayor tamaño.

La propuesta técnica es poco convencional: en lugar de entrenar un encoder acústico desde cero, reutiliza la torre de audio de un modelo de embeddings multilingüe y solo ajusta las capas 10 a 12 de dicha torre, congelando el resto. Sobre esa representación opera un lector CTC de 10 bloques de anchura 768. El resultado es un modelo que transcribe varias veces más rápido que tiempo real y que puede combinarse con un modelo de lenguaje KenLM de 4-gramas para reducir el error de palabra.

Es relevante para quienes necesitan transcripción de francés en producción con requisitos de latencia y coste bajos, o para investigadores interesados en reutilizar torres de audio de modelos multimodales para tareas de ASR. El autor lo describe explícitamente como un experimento: la versión large parte de la versión base y añade unas 17 horas de GPU de entrenamiento, por lo que parte de la mejora puede deberse a la mayor duración del entrenamiento y no al aumento de capacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Torre de audio de EmbeddingGemma 2 (parcialmente ajustada) + lector CTC de 10 bloques de anchura 768 + cabeza de 30 002 filas de 512 |
| Parámetros totales | 163.007.423 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa bloques de audio de hasta 30 s) |
| Tipos de cuantización | no disponible (pesos publicados en fp32); el LM KenLM va cuantizado a 8 bits |
| Idiomas soportados | francés (fr) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, fp32, 652 MB) |

## Arquitectura y entrenamiento

El modelo es un sistema híbrido CTC: la entrada de audio se procesa con la torre de audio de google/embeddinggemma-2 (revisión 914f7f8), de la que se ajustan únicamente las capas 10, 11 y 12 (índices 9 a 11 en el checkpoint); el resto de capas permanecen congeladas y se cargan desde el modelo base en tiempo de inferencia, por lo que no se incluyen en el repositorio. Sobre los estados ocultos de esa torre opera un lector CTC de 10 bloques de anchura 768, seguido de una cabeza de salida de 30 002 unidades que corresponden al vocabulario del tokenizador de Gemma (30 000 piezas más blank y unknown), lo que permite emitir mayúsculas y puntuación de forma nativa. La decodificación es no autorregresiva, en una sola pasada, lo que explica la velocidad del sistema.

El entrenamiento se realizó sobre aproximadamente 3 200 horas de francés de fuentes abiertas: Multilingual LibriSpeech, Common Voice 19, VoxPopuli, FLEURS, YODAS y YODAS-Granary. La versión base se entrenó en una única NVIDIA L40S durante unas 38 horas de GPU; la versión large parte de base y añade seis pasadas más sobre los mismos datos (unas 17 horas de GPU adicionales), primero ajustando una capa más de la torre (la 10) y después ampliando el lector de 6 a 10 bloques. El autor advierte que no se ha realizado un ablation control que separe el efecto del entrenamiento extra del de la mayor capacidad. Se incluye además un modelo de lenguaje KenLM de 4-gramas cuantizado a 8 bits (trie, 0,85 GB) para decodificación con LM.

## Capacidades

- Transcripción de voz a texto en francés con mayúsculas y puntuación incluidas en la salida.
- Decodificación CTC no autorregresiva en una sola pasada, con velocidad muy superior a tiempo real.
- Segmentación automática del audio en bloques de hasta 30 s cortados en el punto de menor energía, procesados por lotes, manteniendo las marcas temporales en la línea de tiempo original.
- Salida con marcas temporales a nivel de palabra (inicio, fin y confianza por palabra) y exportación a SRT.
- Decodificación opcional con modelo de lenguaje KenLM de 4-gramas para reducir el WER.
- Manejo de audio y vídeo como entrada (mp3, mp4, etc.) a través del paquete steno_asr, que requiere ffmpeg.
- No soporta tool calling, agentes, visión, audio generation ni modos de razonamiento: es un modelo puramente ASR y monolingüe.

## Casos de uso

- Subtitulado automático de vídeo y audio: el modelo genera marcas temporales por palabra y exportación directa a SRT mediante `to_srt`, lo que permite producir subtítulos en francés para entrevistas, charlas o vídeos corporativos con una sola pasada.
- Transcripción de reuniones y entrevistas: el corte en bloques de 30 s en el punto de menor energía y el procesamiento por lotes permiten transcribir grabaciones largas de forma eficiente, con texto puntuado y en mayúsculas listo para revisión.
- Indexación y búsqueda de archivos audiovisuales: al ser un modelo de 163 M de parámetros con inferencia no autorregresiva, puede desplegarse en volúmenes altos para generar transcripciones que alimenten motores de búsqueda o sistemas de recuperación sobre archivos de audio en francés.
- Análisis de sesiones parlamentarias y discurso público: el modelo se ha evaluado en VoxPopuli (Parlamento Europeo) con un WER de 11,1 % con LM, lo que lo hace adecuado para procesar corpus institucionales en francés.
- Procesamiento de audio con acentos africanos: se ha evaluado en el conjunto African Accented French con un WER de 15,0 % con LM, útil para proyectos de inclusión lingüística en África Occidental y Central.
- Prototipado e investigación en ASR de bajo coste: al reutilizar la torre de audio de EmbeddingGemma 2 y publicar pesos en fp32 con licencia Apache 2.0, sirve como base para experimentos de ajuste fino o para estudiar el rendimiento de lectores CTC sobre representaciones de modelos de embeddings.
- Transcripción en entornos con recursos limitados: con 163 M de parámetros y 652 MB de pesos, puede ejecutarse en hardware modesto, lo que facilita su despliegue en servidores pequeños o en flujos de trabajo por lotes sin GPU de gran tamaño.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), WER en porcentaje sobre las primeras 2 000 muestras de cada conjunto de test (FLEURS: las 675), tras normalización común (minúsculas, sin puntuación, números como palabras):

| Conjunto de test | Descripción | Greedy | Con LM de 4-gramas |
|---|---|---|---|
| FLEURS fr test | frases leídas | 12,8 | 9,7 |
| Multilingual LibriSpeech fr test | audiolibros | 10,1 | 8,8 |
| Common Voice 19 fr test | voluntarios, micrófonos variados | 13,9 | 11,6 |
| VoxPopuli fr test | Parlamento Europeo | 12,5 | 11,1 |
| African Accented French test | acentos de África Occidental y Central | 16,2 | 15,0 |
| FLEURS fr dev (validación) | frases leídas | 11,4 | 9,0 |

Comparativa interna entre las dos versiones publicadas, según la model card:

| Versión | Lector | Capas de torre ajustadas | Parámetros | FLEURS test greedy / + LM |
|---|---|---|---|---|
| base | 6 bloques de anchura 768 | 11–12 | 110 M | 13,2 / 10,0 |
| large | 10 bloques de anchura 768 | 10–12 | 163 M | 12,8 / 9,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados ocupan 652 MB en fp32; con la torre congelada cargada desde EmbeddingGemma 2 y el modelo de lenguaje KenLM de 0,85 GB, el consumo total estimado se sitúa en el rango de 2 a 4 GB, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: el autor entrenó en una NVIDIA L40S; para inferencia, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 4 GB o más de VRAM, dado el tamaño reducido del modelo.
- Opciones de despliegue: el paquete oficial `steno_asr` (instalable desde el repositorio de GitHub del autor) es la vía documentada; requiere ffmpeg en el PATH y autenticación con Hugging Face para aceptar los términos de EmbeddingGemma 2. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor indica que transcribe "muchas veces más rápido que tiempo real" gracias a la decodificación no autorregresiva, pero no se publican cifras concretas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / entrada | Licencia | Notas |
|---|---|---|---|---|---|
| steno-fr-v1-large | 163 M | francés | bloques de hasta 30 s | Apache 2.0 | CTC sobre torre de EmbeddingGemma 2; WER FLEURS 9,7 con LM |
| steno-fr-v1-base | 110 M | francés | bloques de hasta 30 s | Apache 2.0 | Misma arquitectura con lector de 6 bloques; WER FLEURS 10,0 con LM |
| Whisper large-v3 (OpenAI) | 1 550 M | multilingüe | 30 s | MIT | Referencia ASR autorregresiva; no se dispone de cifras comparativas en la información proporcionada |
| Wav2Vec2 / XLS-R (Meta) | 300 M – 2 000 M | multilingüe | audio variable | MIT / CC-BY-NC según variante | Encoders CTC clásicos; no se dispone de cifras comparativas en la información proporcionada |

No se han publicado en la información disponible comparaciones directas con otros modelos sobre los mismos conjuntos de test, por lo que las cifras de terceros no se incluyen.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe francés; no soporta otros idiomas.
- El autor califica la versión large como un experimento: parte de la mejora frente a base puede deberse al entrenamiento adicional y no al mayor tamaño del lector o a la capa extra ajustada, ya que no se realizó un ablation control.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados; no han sido reproducidos de forma independiente.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; el WER sube hasta el 15,0 % en el conjunto de acentos africanos.
- El modelo depende de EmbeddingGemma 2: es necesario aceptar los términos de uso de Google y autenticarse en Hugging Face para cargar las capas congeladas de la torre, que no se incluyen en el repositorio.
- La licencia Apache 2.0 del checkpoint no exime de las condiciones del modelo base subyacente; conviene revisar los términos de EmbeddingGemma 2 antes de un uso comercial.
- Requiere ffmpeg en el PATH para el procesamiento de audio y vídeo con el paquete oficial.
- El modelo de lenguaje KenLM añade 0,85 GB y una dependencia opcional (`steno-asr[lm]`); sin él, el WER empeora entre 1,3 y 2,5 puntos según el conjunto.
- No dispone de marcas temporales a nivel de carácter ni de diarización de hablantes.
- El repositorio tiene un uso muy bajo (6 descargas, 0 likes en el momento de la consulta), por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guigssss/steno-fr-v1-large
- Versión base: https://huggingface.co/guigssss/steno-fr-v1-base
- Modelo base EmbeddingGemma 2: https://huggingface.co/google/embeddinggemma-2
- Paquete de inferencia steno_asr: https://github.com/GuigsEvt/steno-asr
- Dataset Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Dataset Common Voice 19: https://huggingface.co/datasets/fsicoli/common_voice_19_0
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset YODAS: https://huggingface.co/datasets/espnet/yodas
- Dataset YODAS-Granary: https://huggingface.co/datasets/espnet/yodas-granary
