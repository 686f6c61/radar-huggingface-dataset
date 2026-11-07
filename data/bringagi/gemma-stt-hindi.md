# bringagi/gemma-stt-hindi

## Resumen

gemma-stt-hindi es un modelo de reconocimiento automático del habla (ASR) para hindi, desarrollado por Tushar Anand bajo el alias bringagi y publicado en Hugging Face. Se trata de un modelo pequeño y de arquitectura no autorregresiva que combina el codificador de audio de Google EmbeddingGemma 2 (un conformer de 12 capas y unos 305 M de parámetros) con un "lector" CTC de 6 capas que emite caracteres en devanagari. El modelo completo suma 348.583.537 parámetros y se distribuye en fp16 dentro de un repositorio de 0,9 GB.

El modelo resuelve el problema de la transcripción de voz en hindi con un coste computacional muy bajo: una sola pasada hacia delante transcribe un clip completo, sin decodificador autorregresivo. Según el autor, procesa un clip de 5,6 segundos en unos 40 ms en una RTX 3050 para portátiles (4 GB), lo que equivale a unas 140 veces más rápido que el tiempo real, con 1,2 GB de VRAM en fp16. Incorpora además un modelo de lenguaje KenLM opcional (3-gramas de palabra) que reduce aproximadamente un 25 % los errores de palabra.

La relevancia actual del modelo reside en su estrategia de entrenamiento: se destilaron dos modelos ASR hindi de mayor tamaño (Hima-ASR e Indic-Transcribe-core) sobre 1.810 horas de audio de YouTube de YODAS v3, todo ello entrenado en GPUs gratuitas de Kaggle T4. El resultado es un modelo que, con el LM, alcanza un 5,4 % de CER en Lahaja-100, a la par que Qwen3-ASR-1.7B pero con un coste de inferencia muy inferior. La licencia es la Indic Open Model License v1.0, derivada del uso de transcripciones de Indic-Transcribe-core.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer de audio (EmbeddingGemma 2, 12 capas, 305 M parametros) con las 2 capas superiores ajustadas + lector CTC de 6 capas pre-norm (d=768) |
| Parametros totales | 348.583.537 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clips de audio de 12 s o menos durante el entrenamiento) |
| Tipos de cuantizacion | fp16 (pesos distribuidos en fp16); no se documentan otras cuantizaciones |
| Idiomas soportados | hindi (hi) |
| Licencia | Indic Open Model License v1.0 |
| Formato de pesos | safetensors (model.safetensors en fp16) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline híbrido de codificador congelado y lector entrenable. La entrada es un espectrograma log-mel configurado según EmbeddingGemma 2. El codificador es el codificador de audio de EmbeddingGemma 2, un conformer de 12 capas y 305 M de parámetros del que se congelan las 10 capas inferiores y se entrenan las 2 superiores. Sobre las 13 representaciones ocultas del codificador se aplica una mezcla softmax aprendida. El lector consta de una capa lineal, una convolución depthwise causal y 6 capas transformer pre-norm; la cabeza proyecta a 512 dimensiones y multiplica contra 66 filas de caracteres inicializadas desde los embeddings de texto de Gemma, más los tokens blank y unk. El entrenamiento usa CTC, de modo que no hay decodificador autorregresivo.

Los datos de entrenamiento son 1.810 horas de audio hindi de YouTube procedente de YODAS v3 (CC-BY-3.0), cortadas en clips de 12 segundos o menos. Como los subtítulos de YouTube son demasiado ruidosos, las etiquetas se generaron por destilación: Hima-ASR reetiquetó 874 horas (780 horas tras filtrar dígitos, texto latino y velocidades de habla implausibles) e Indic-Transcribe-core en fp16 reetiquetó las otras 970 horas, sumando unas 1.750 horas de transcripciones de profesor. El entrenamiento se realizó en una única Kaggle T4 en fp16 con GradScaler durante 605 minutos, lo que supone 143.000 pasos con lotes de 48 segundos y aproximadamente 1,2 pasadas sobre los datos, con learning rate de 1e-3 para el lector y 5e-5 para las capas del codificador, y 500 pasos de calentamiento. Se seleccionó el checkpoint con mejor CER en Kathbath-valid. El modelo de lenguaje KenLM es un 3-gramas de palabra construido con las mismas transcripciones de profesor: 690.000 frases, 17,6 M de palabras y un vocabulario de 261.000 palabras, con Kneser-Ney modificado interpolado y poda de trigramas de cuenta única; los hiperparámetros alpha 0,6 y beta 1,0 se ajustaron sobre 800 clips de desarrollo.

## Capacidades

- Transcripción de voz en hindi a texto en escritura devanagari, sin puntuación ni dígitos (los números se emiten como palabras).
- Decodificación CTC greedy en una sola pasada hacia delante, sin decodificador autorregresivo.
- Decodificación con beam search y modelo de lenguaje KenLM opcional, que según el autor reduce aproximadamente un 25 % los errores de palabra.
- Entrada de audio a 16 kHz mono; otras frecuencias se remuestrean si scipy está instalado.
- Procesamiento por lotes desde línea de comandos (`python gemma_stt.py a.wav b.wav --lm`).
- No soporta tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento; es exclusivamente ASR.
- Capacidad multilingüe limitada al hindi: las palabras en inglés se transcriben en devanagari.

## Casos de uso

- Subtitulado y transcripción de contenido en hindi: el modelo transcribe clips completos en una sola pasada a unas 140 veces el tiempo real en una GPU de portátil, lo que permite procesar archivos de audio o vídeo de forma masiva sin infraestructura dedicada.
- Transcripción en el dispositivo o en el borde: con 1,2 GB de VRAM en fp16 y unos 40 ms por clip de 5,6 s, cabe en portátiles con GPU de 4 GB como la RTX 3050, lo que habilita dictado y notas de voz sin conexión.
- Generación de conjuntos de datos de voz etiquetados: sirve como etiquetador rápido y barato para audio hindi en pipelines de datos, dado su bajo coste por hora de audio procesada.
- Búsqueda y análisis de archivos de audio: al transcribir con KenLM se obtienen transcripciones con menos errores de palabra (15,9 % de WER en Lahaja-100), adecuadas para indexar y buscar contenido hablado.
- Prototipado de asistentes de voz en hindi: la latencia de decenas de milisegundos permite integrar la transcripción en bucles de diálogo por turnos sin que el ASR sea el cuello de botella.
- Investigación en destilación de ASR: el repositorio incluye el código de arquitectura e inferencia y el autor publica el diario de entrenamiento en GitHub, lo que lo convierte en una referencia reproducible para experimentos de destilación de ASR en GPUs de gama baja.

## Benchmarks y rendimiento

CER / WER tras eliminar puntuación; lattice-WER cuenta como correcta cualquier grafía aceptada.

| Modelo | 15 clips de micrófono de portátil (voz del autor) | Lahaja-100 (CER / WER) | Monsoon-hi lattice-WER | GPU y tiempo por clip |
|---|---|---|---|---|
| gemma-stt-hindi + KenLM | 25,3 % / 40,6 % | 5,4 % / 15,9 % | 20,9 % | RTX 3050 laptop, ~50 ms |
| gemma-stt-hindi, greedy | 26,8 % / 53,1 % | 6,4 % / 21,3 % | 28,9 % | RTX 3050 laptop, ~40 ms |
| Qwen3-ASR-1.7B | 15,4 % / 23,1 % | 6,4 % / 17,4 % | 12,8 % | L4, 2,5–4 s |
| Hima-ASR (profesor) | 14,2 % / 22,5 % | 3,4 % / 11,2 % | 10,6 % | L4, ~0,9 s |
| IndicConformer-600M | 11,3 % / 23,8 % | 3,3 % / 10,9 % | 12,0 % | L4, 0,25–0,38 s |
| Indic-Transcribe-core (profesor) | 9,3 % / 13,8 % | 2,9 % / 9,8 % | 5,3 % | L4, 0,54–0,72 s |

En las evaluaciones de entrenamiento retenidas obtiene 4,87 % de CER en Kathbath-valid y 7,63 % de CER en Lahaja en modo greedy. El autor advierte que los tiempos no son estrictamente comparables: los demás modelos se cronometraron clip a clip en una L4 en la nube incluyendo la lectura del archivo, mientras que este modelo se cronometró en el portátil con el audio ya en memoria.

## Requisitos de hardware

- VRAM estimada: 1,2 GB en fp16 para el modelo completo, incluido el codificador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor lo ejecuta en una RTX 3050 para portátiles de 4 GB. Para lotes grandes o servicio concurrente, A100, H100 o L4 son sobredimensionadas para el modelo pero permiten mayor paralelismo.
- Cabe en GPU de consumo: sí, en tarjetas de 4 GB o más (RTX 3050, RTX 3060, RTX 4060 y superiores).
- Opciones de despliegue: el repositorio proporciona `gemma_stt.py` con la clase `GemmaSTT` y una interfaz de línea de comandos; requiere transformers con soporte de audio de Gemma 4 (probado con transformers 5.21.0 y torch 2.14.1), safetensors y soundfile; para el modo LM, pyctcdecode y KenLM. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 40 ms por clip de 5,6 s en modo greedy y unos 50 ms con KenLM en una RTX 3050 para portátiles; el beam search con KenLM añade unos 10 ms de CPU por clip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Lahaja-100 CER / WER | Monsoon-hi lattice-WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma-stt-hindi | 348,6 M | no disponible | 5,4 % / 15,9 % (con LM) | 20,9 % | Indic Open Model License v1.0 | Hugging Face |
| Qwen3-ASR-1.7B | 1.700 M | no disponible | 6,4 % / 17,4 % | 12,8 % | no disponible | no disponible en la información |
| Hima-ASR | no disponible | no disponible | 3,4 % / 11,2 % | 10,6 % | no disponible | no disponible en la información |
| IndicConformer-600M | 600 M | no disponible | 3,3 % / 10,9 % | 12,0 % | no disponible | no disponible en la información |
| Indic-Transcribe-core | no disponible | no disponible | 2,9 % / 9,8 % | 5,3 % | no disponible | no disponible en la información |

## Limitaciones y advertencias

- Es más débil con habla informal captada por micrófono de portátil: 25 % de CER en los clips del propio autor, con grafías casi correctas como साथ/सात.
- No produce puntuación ni dígitos; los números se escriben como palabras.
- Es exclusivamente hindi: las palabras en inglés se transcriben en devanagari.
- No se ha probado con audio ruidoso, de campo lejano ni telefónico.
- Precisión inferior a la de sus profesores: aproximadamente el doble de error que Indic-Transcribe-core en Lahaja-100 (5,4 % frente a 2,9 % de CER).
- Licencia Indic Open Model License v1.0: el modelo es derivado por el uso de transcripciones de Indic-Transcribe-core e Hima-ASR, por lo que el uso comercial está sujeto a los términos de dicha licencia; conviene revisar `LICENSE` y `NOTICE` antes de desplegarlo en producción.
- Riesgo de alucinación y de errores de sustitución en palabras homófonas, especialmente en decodificación greedy sin LM.
- Requiere una versión de transformers con soporte de audio de Gemma 4 (probado con 5.21.0), lo que puede limitar la compatibilidad con entornos existentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bringagi/gemma-stt-hindi
- Perfil del autor: https://huggingface.co/bringagi
- Repositorio de código y diario de entrenamiento: https://github.com/neoandmatrix/gemma-stt-hindi
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset YODAS v3: https://huggingface.co/datasets/espnet/yodas3
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- KenLM: https://github.com/kpu/kenlm
