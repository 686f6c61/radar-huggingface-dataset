# fcmeyer/drama-3-MLX-4bit-HQ

## Resumen

drama-3-MLX-4bit-HQ es una conversión no oficial del modelo de síntesis de voz fishaudio/drama-3 (revision e0a9218) al formato MLX, pensada para ejecutarse en Apple Silicon. La firma el usuario fcmeyer y no está avalada ni revisada por Fish Audio. El modelo base es un TTS de diálogo multihablante con arquitectura de mezcla de expertos (MoE) que incorpora capas DeltaNet, además de nueve cabezas de codebook residual para generar audio a 44,1 kHz. La conversión cuantiza únicamente los expertos a 4 bits (afín, group size 64) y mantiene en bf16 la atención, las capas DeltaNet, el router, los expertos compartidos, el tower, las cabezas y los embeddings.

El objetivo del repositorio es ofrecer una variante de 4 bits con mayor fidelidad que la conversión de referencia de mlx-community: según el autor, mantiene el resto de componentes en bf16 en lugar de 8 bits, lo que reduce un 19 % la KL del codebook residual (diferencia pareada de 0,0018 [0,0016, 0,0020]) a cambio de 2,3 GB más de pesos y un 25 % menos de velocidad. La tasa de fallos en generación libre y el WER son estadísticamente indistinguibles entre ambas.

Es relevante ahora porque permite ejecutar localmente un TTS de diálogo expresivo (etiquetas de hablante y acotaciones como `[whispering]`) en un Mac, sin depender de APIs externas. El repositorio ocupa 26,1 GB, con 24,5 GB de pesos y 1,6 GB de codec, y requiere 39 GB de memoria pico en clips de hasta 28 segundos. No se publican el número de parámetros, la longitud de contexto ni los idiomas soportados de forma oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con capas DeltaNet (atención lineal), nueve cabezas de codebook residual y codec de audio |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero no se publican cifras) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos en 4-bit affine con group size 64; atención, DeltaNet, router, expertos compartidos, tower, cabezas y embeddings en bf16. Existen variantes comparables en 8, 6 y 3 bits mixtos |
| Idiomas soportados | no disponible en los metadatos; el conjunto de evaluación del autor incluye inglés, alemán, español, francés, chino y japonés |
| Licencia | fish-audio-community-license-v1.0 (etiquetada como "other") |
| Formato de pesos | Pesos MLX (safetensors) más codec de audio de 1,6 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento de este repositorio: es una conversión de pesos, no un entrenamiento nuevo. Lo que sí se detalla es la receta de cuantización aplicada sobre fishaudio/drama-3: los expertos se cuantizan a 4 bits en formato affine con group size 64, mientras que la atención, las capas DeltaNet, el router, los expertos compartidos, el tower, las cabezas y los embeddings permanecen en bf16. El resultado ocupa 24,5 GB en disco, a los que se suman 1,6 GB del codec.

La arquitectura del modelo base combina mezcla de expertos con DeltaNet y genera audio mediante un token semántico principal más nueve cabezas de codebook residual, lo que da una salida a 44,1 kHz. Según el autor, el modelo MLX en bf16 coincide con el original en PyTorch FP8 en torno al 86 % de top-1 semántico. No se indican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El muestreo recomendado, que corresponde a los ajustes de benchmark de Fish Audio, es temperatura 1,0, top-p 0,9 y top-k 30.

## Capacidades

- Síntesis de voz (text-to-speech) con salida de audio a 44.100 Hz, consumible como `result.audio` (mx.array) o mediante CLI.
- Diálogo multihablante: admite etiquetas de hablante en el texto, por ejemplo `<|speaker:0|>` y `<|speaker:1|>`.
- Control expresivo mediante acotaciones entre corchetes, como `[whispering]`.
- Uso multilingüe: el conjunto de evaluación del autor cubre inglés, alemán, español, francés, chino y japonés, aunque la model card no declara una lista oficial de idiomas soportados.
- Clonación de voz: el modelo base la soporta, pero el autor indica explícitamente que las salidas con voz clonada no han sido evaluadas.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni texto generativo general.

## Casos de uso

- Producción de audiolibros y ficción sonora: el soporte de etiquetas de hablante y acotaciones expresivas permite generar diálogos con varios personajes en una sola pasada, con salida a 44,1 kHz apta para publicación.
- Doblaje y localización de prototipos: al cubrir en evaluación inglés, alemán, español, francés, chino y japonés, sirve para validar guiones doblados antes de contratar voces humanas.
- Locuciones para vídeo y pódcast: con un rendimiento de 2,26× tiempo real en un M5 Max, un clip de un minuto se genera en unos 27 segundos, lo que hace viable iterar sobre el guion.
- Asistentes de voz en local: al ejecutarse íntegramente en Apple Silicon mediante mlx-audio, permite añadir TTS a aplicaciones de escritorio sin enviar texto a servicios externos.
- Accesibilidad: conversión de documentos y artículos a audio en el propio equipo para personas con discapacidad visual o dislexia, sin coste por carácter.
- Generación de datos sintéticos de voz: creación de corpus de audio etiquetado por hablante para entrenar o evaluar sistemas de reconocimiento de habla, aprovechando las marcas `<|speaker:N|>`.
- Previsualización de personajes en videojuegos: generación de líneas de diálogo de ejemplo para validar tono y ritmo antes de grabar con actores.
- Maquetación de audiodescripciones y avisos de sistema en aplicaciones macOS, con procesamiento por lotes desde la línea de comandos.

## Benchmarks y rendimiento

Resultados publicados por el autor, obtenidos con el mismo arnés, la misma máquina (M5 Max, 128 GB) y el mismo muestreador (T=1,0, top-p 0,9, top-k 30, semillas fijas):

| Modelo | KL principal | Top-1 principal | KL de cabezas (media de 9) | Top-1 de cabezas | Fallos | WER/CER | Memoria pico (GB) | RTF |
|---|---|---|---|---|---|---|---|---|
| MLX bf16 (referencia) | 0,0000 | 100,0 | 0,0000 | 100,0 | 20/500 (4,0 %) | 3,9 % | 84,9 | 1,99× |
| Expertos 8-bit, resto bf16 (no publicado) | 0,0046 | 93,7 | 0,0025 | 93,5 | 31/500 (6,2 %) | 4,8 % | 54,7 | 2,08× |
| Expertos 6-bit, resto bf16 (no publicado) | 0,0062 | 92,6 | 0,0032 | 92,9 | 36/500 (7,2 %) | 5,6 % | 46,6 | 2,03× |
| **este repositorio** | 0,0190 | 86,7 | 0,0082 | 89,0 | 23/500 (4,6 %) | 4,0 % | 38,6 | 2,26× |
| mlx-community/fish-audio-drama-3-4bit | 0,0204 | 86,3 | 0,0101 | 87,7 | 22/500 (4,4 %) | 3,5 % | 36,3 | 3,02× |
| Nav8ha/drama-3-mlx-mixed-3bit | 0,0660 | 75,4 | 0,0271 | 80,4 | 15/500 (3,0 %) | 3,0 % | 32,2 | 3,11× |

Notas metodológicas aportadas en la model card: la KL se mide en modo teacher-forced entre bf16 y el modelo cuantizado sobre 64 secuencias generadas con bf16 (32 prompts × 2 semillas); las cifras entre corchetes en la model card son intervalos de confianza bootstrap del 95 %. Los fallos corresponden a 500 clips libres (100 prompts × 5 semillas) que alcanzaron el límite de 600 fotogramas, cubrieron menos del 60 % del texto o tuvieron WER/CER ≥ 50 %; casi todos los fallos, incluido bf16, son bloqueos en los que el modelo dice la primera frase y luego genera silencio en lugar de terminar. El WER se calcula con Whisper large-v3-turbo (CER para chino y japonés). La velocidad de bf16 procede de los últimos 150 de sus 500 clips. Toda la evaluación es solo texto, sin voz de referencia. No hay resultados de benchmarks estándar de TTS (como MOS o similitud de hablante) en la información disponible.

## Requisitos de hardware

- Pesos en disco: 24,5 GB más 1,6 GB de codec (26,1 GB de repositorio total).
- Memoria pico medida: 38,6 GB con MLX y 39 GB en clips de hasta 28 segundos en un M5 Max de 128 GB.
- Mac recomendado por el autor: 64 GB de memoria unificada o más.
- Mac de 48 GB: solo con el límite de memoria cableada de la GPU elevado, por ejemplo `sudo sysctl iogpu.wired_limit_mb=42000`, y hasta el siguiente reinicio. El autor advierte de que dejar a macOS sin memoria puede congelar o reiniciar el equipo.
- No cabe en GPUs de consumo con menos de 40 GB de memoria: se descartan RTX 4060/4070/4080/4090 y equipos con 16-32 GB. El formato MLX es específico de Apple Silicon; no hay pesos GGUF ni safetensors para CUDA en este repositorio.
- Despliegue: mlx-audio (el autor fija el commit dad2087f790dfe96b07d5aac1405db4b578b411f), con API Python (`load_model`) o CLI (`python -m mlx_audio.tts.generate`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: RTF de 2,26, es decir, 2,26 segundos de audio por segundo de reloj, o aproximadamente 2,3× tiempo real en un M5 Max. No se publican datos de latencia de primer token ni de throughput para otras máquinas.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Memoria pico (GB) | RTF | KL principal | WER/CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este repositorio | 4-bit en expertos, resto bf16 | 38,6 | 2,26× | 0,0190 | 4,0 % | fish-audio-community-license-v1.0 | HuggingFace (0 descargas, 0 likes) |
| mlx-community/fish-audio-drama-3-4bit | 4-bit en expertos, resto 8-bit | 36,3 | 3,02× | 0,0204 | 3,5 % | derivada del modelo base | HuggingFace, mismo modelo base |
| Nav8ha/drama-3-mlx-mixed-3bit | 3-bit mixto | 32,2 | 3,11× | 0,0660 | 3,0 % | derivada del modelo base | HuggingFace, mismo modelo base |
| MLX bf16 (referencia) | Sin cuantizar | 84,9 | 1,99× | 0,0000 | 3,9 % | fish-audio-community-license-v1.0 | Conversión de referencia en MLX |

La comparación con alternativas de otras familias de TTS (por ejemplo, modelos de síntesis de voz con licencias permisivas) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: Fish Audio no ha avalado ni revisado el repositorio. No debe tratarse como una publicación del autor del modelo base.
- Licencia fish-audio-community-license-v1.0, etiquetada como "other". Las condiciones concretas de uso comercial no se detallan en la información disponible; hay que revisar el fichero LICENSE del repositorio antes de usarlo en producción.
- Tasa de fallos del 4,6 % [2,8, 7,0] en 500 clips libres, mayoritariamente bloqueos con silencio al final de la primera frase.
- Degradación por cuantización medible: KL principal de 0,0190 y top-1 del 86,7 % frente a bf16, lo que implica divergencia en la distribución de tokens semánticos.
- La clonación de voz no ha sido evaluada por el autor; solo se midió la generación a partir de texto.
- No hay lista oficial de idiomas soportados ni evaluación formal por idioma; el multilingüismo se infiere del conjunto de evaluación.
- No se publican parámetros totales, parámetros activos, longitud de contexto ni tokens de entrenamiento, lo que limita el análisis de escalado y de coste.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente de la comunidad.
- Riesgo operativo en macOS: en máquinas de 48 GB hay que elevar el límite de memoria cableada de la GPU, y el propio autor advierte de congelaciones o reinicios si el sistema se queda sin memoria.
- Solo ejecutable en Apple Silicon mediante MLX; no hay ruta de despliegue en CUDA, vLLM, llama.cpp, Ollama ni TGI.
- Todos los benchmarks proceden de una única máquina (M5 Max, 128 GB) y de clips de hasta 28 segundos; no se caracteriza el comportamiento en clips largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fcmeyer/drama-3-MLX-4bit-HQ
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- Commit de mlx-audio fijado por el autor: https://github.com/Blaizzy/mlx-audio/tree/dad2087f790dfe96b07d5aac1405db4b578b411f
- Conversión de referencia de mlx-community: https://huggingface.co/mlx-community/fish-audio-drama-3-4bit
- Cuantización de 3 bits mixtos de Nav8ha: https://huggingface.co/Nav8ha/drama-3-mlx-mixed-3bit
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados se limitaban a páginas de ChatGPT y de OpenAI, sin relación con drama-3 ni con mlx-audio. No se dispone de paper, blog técnico ni demo adicionales.
