# Noobbbbb/egemma2-bn-conformer-ctc

## Resumen

`egemma2-bn-conformer-ctc` es un modelo de reconocimiento automático del habla (ASR) para bengalí (bn) desarrollado por Md Hasibur Rahman (Evan), publicado bajo el identificador `Noobbbbb`. Su planteamiento es poco habitual: reutiliza `google/embeddinggemma-2`, un modelo multimodal de embeddings orientado a búsqueda, como codificador de audio **congelado**, y entrena únicamente una cabeza Conformer-CTC de 19,9 millones de parámetros. El objetivo declarado es medir cuánta información fonética y léxica conserva un modelo de retrieval en sus capas internas y si una cabeza pequeña puede leerla como texto.

El modelo trabaja sobre audio a 16 kHz, extrae los estados ocultos de las capas 8, 16 y 23 del backbone en las posiciones del token `<|audio|>` (25 frames por segundo, 512 dimensiones), los mezcla con pesos fijos y los decodifica mediante CTC con un vocabulario SentencePiece de 2.500 piezas. Sobre FLEURS bengalí (`bn_in`, test) declara un WER del 25,69 % y un CER del 8,51 % con beam search y modelo de lenguaje de trigramas, y un WER del 28,90 % en decodificación greedy.

Su relevancia es doble: por un lado, es una prueba de concepto sobre la reutilización de encoders de embeddings para tareas generativas de secuencia; por otro, ofrece un ASR bengalí ligero (19,9 M de parámetros, 0,1 GB de repo) con licencia Apache 2.0 y un factor de tiempo real de 108x en GPU de portátil, lo que lo hace viable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (8 bloques Conformer) sobre encoder congelado `google/embeddinggemma-2` |
| Parametros totales | 19.929.604 (solo la cabeza entrenada; el encoder no se cuenta en ese total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por frames a 25 fps; sin límite de contexto declarado) |
| Tipos de cuantizacion | int8 dinámica en capas Linear (medida por el autor); bf16 y fp32 en inferencia |
| Idiomas soportados | bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch (`pytorch`) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido en dos partes. El codificador es `google/embeddinggemma-2` congelado: se carga la torre de audio y el backbone de 24 capas, pero no la torre de visión. El audio se introduce como el placeholder de texto `<|audio|>` junto con la forma de onda, y el procesador lo expande a un token cada 40 ms. De las capas 8, 16 y 23 se toman los estados ocultos en las posiciones de esos tokens (512 dimensiones, 25 frames/s) y se combinan con una mezcla lineal fija de pesos 0,3186 / 0,4617 / 0,2197, con redondeo int8 por frame. La capa 24 se descarta por ser la proyección de salida de 768 dimensiones. La cabeza entrenada consta de LayerNorm, una proyección lineal 512→320, 8 bloques Conformer (feed-forward macaron, self-attention de 4 cabezas y convolución depthwise con kernel 15, es decir, 600 ms de recepción, con posiciones sinusoidales) y una proyección final 320→2500, seguida de CTC con blank en el id 0.

El entrenamiento usó un subconjunto de 103,4 horas (84.838 clips) de los datos de la competición Bengali.AI Speech Recognition (OOD-Speech, Rakib et al., 2023), que en total rondan las 1.200 horas; se limitó por cómputo y disco, y se descartaron clips con más tokens que frames. El vocabulario es un SentencePiece de 2.500 piezas de `Noobbbbb/whisper-tiny-bn-custom-spm`. Para la decodificación se emplea un modelo de lenguaje de trigramas de palabras con suavizado Kneser-Ney interpolado (descuento 0,75) implementado en Python puro y usado con `pyctcdecode` en shallow fusion (alpha 0,5, beta 1,0, penalización OOV de -10 en log10); se descartó KenLM por no tener wheel para Windows. El LM se construyó solo con las transcripciones del subconjunto de entrenamiento (84.942 frases, 63.925 palabras, 615.503 trigramas), eliminando las frases presentes en validación y en el test de FLEURS, y sus recuentos no se incluyen en el repo.

## Capacidades

- Reconocimiento de voz en bengalí (transcripción de audio a texto).
- Decodificación CTC greedy y beam search (anchura 48) con fusión de un modelo de lenguaje de trigramas de palabras.
- Manejo de audio a 16 kHz con tokenización por frames a 25 fps.
- Inferencia en GPU (bf16) y CPU (fp32 e int8 dinámico).
- Vocabulario SentencePiece de 2.500 piezas específico para bengalí.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni capacidades multilingües más allá del bengalí.

## Casos de uso

- Transcripción de audio en bengalí en entornos con recursos limitados: con 19,9 M de parámetros y 0,1 GB de repo, el modelo cabe en una GPU de portátil de 8 GB y corre a 108x tiempo real en bf16, lo que permite procesar horas de audio en minutos.
- Subtitulado automático de contenido audiovisual bengalí: la decodificación con beam search y LM reduce el WER del 28,90 % al 25,69 % en FLEURS, útil cuando se prioriza precisión sobre latencia.
- Investigación sobre reutilización de encoders de embeddings: sirve como banco de pruebas reproducible para medir cuánta información de habla conservan las capas de un modelo de retrieval y cómo afecta la selección de capas.
- Prototipado de asistentes de voz en bengalí: el modelo puede integrarse como etapa ASR en un pipeline mayor, con la ventaja de una huella de memoria mínima y despliegue en CPU.
- Procesamiento por lotes en servidores sin GPU: con int8 dinámico alcanza 19,6x tiempo real en CPU, adecuado para transcripciones nocturnas o archivado masivo.
- Evaluación comparativa de arquitecturas ligeras: al separar encoder congelado y cabeza entrenada, permite aislar el efecto de la cabeza Conformer frente a otros enfoques CTC en bengalí.
- Docencia y experimentación: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en cursos y talleres de ASR sin restricciones de uso comercial.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre FLEURS bengalí (`bn_in`, test: 920 clips, 3,43 h), dominio fuera del entrenamiento:

| Decodificacion | CER | WER |
|---|---|---|
| Greedy CTC | 9,79 % | 28,90 % |
| Beam search (anchura 48) + LM de trigramas | 8,51 % | 25,69 % |

Validación en dominio (500 clips reservados de los mismos datos de Bengali.AI que el entrenamiento):

| Decodificacion | CER | WER |
|---|---|---|
| Greedy CTC | 6,22 % | 20,39 % |
| Beam search + LM de trigramas | 5,08 % | 16,33 % |

El autor advierte que 55 de las 500 frases de validación (11 %) también aparecen en el conjunto de entrenamiento, pronunciadas por otros hablantes, por lo que esas cifras son optimistas; recomienda usar FLEURS para comparaciones. La normalización de referencias e hipótesis aplica Unicode NFC, sustituye todo lo que quede fuera del bloque bengalí (U+0980–U+09FF) por espacios y colapsa espacios en blanco, lo que elimina puntuación (incluido el danda `।`) y texto latino; cifras publicadas con otra normalización no son directamente comparables.

Velocidad medida en un portátil con NVIDIA RTX 2000 Ada Laptop GPU (8 GB), Intel Core i7-13800H y 14 hilos de PyTorch:

| Configuracion | Factor de tiempo real | Velocidad | WER greedy en los mismos 20 clips de FLEURS |
|---|---|---|---|
| GPU, encoder + cabeza en bf16 | 0,0093 | 108x tiempo real | 25,68 % |
| CPU, fp32 | 0,0899 | 11,1x tiempo real | 25,68 % |
| CPU, cuantización dinámica int8 (capas Linear) | 0,0510 | 19,6x tiempo real | 26,67 % |

La decodificación con beam search y LM corre en CPU a aproximadamente 1.100x tiempo real.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repo completo ocupa 0,1 GB y la cabeza tiene 19,9 M de parámetros, por lo que la mayor parte del consumo proviene del encoder `embeddinggemma-2` congelado.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor midió con una RTX 2000 Ada Laptop (8 GB). Para mayor throughput, A100 o H100 no son necesarias dado el tamaño, pero acelerarían el procesamiento por lotes.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 2000 Ada y previsiblemente en cualquier GPU con 8 GB o más.
- Opciones de despliegue: PyTorch nativo (librería declarada); `pyctcdecode` para beam search con LM; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo CTC de este tamaño).
- Latencia y throughput: 108x tiempo real en GPU bf16, 11,1x en CPU fp32 y 19,6x en CPU int8; beam search con LM a ~1.100x tiempo real en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS bn | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `egemma2-bn-conformer-ctc` | 19,9 M (cabeza) + encoder congelado | no disponible | 25,69 % (beam + LM) | Apache 2.0 | Hugging Face |
| `openai/whisper-small` | 244 M | 30 s de audio | no disponible en la informacion | MIT | Hugging Face |
| `openai/whisper-tiny` | 39 M | 30 s de audio | no disponible en la informacion | MIT | Hugging Face |
| `ai4bharat/indicwav2vec` | no disponible | no disponible | no disponible en la informacion | no disponible | Hugging Face |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible; la comparativa se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo solo soporta bengalí; no es multilingüe.
- El encoder es un modelo de embeddings de retrieval congelado, no un encoder de habla entrenado para ASR; el WER del 25,69 % en FLEURS es notablemente superior al de sistemas ASR dedicados, lo que refleja la pérdida de información al reutilizar capas de un modelo no diseñado para transcripción.
- Las cifras de validación en dominio son optimistas: un 11 % de las frases de validación aparecen en entrenamiento con otros hablantes.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`).
- La normalización de puntuación elimina el danda y el texto latino, lo que puede ocultar errores de puntuación y de palabras extranjeras en la evaluación.
- El modelo de lenguaje de trigramas no se incluye en el repo (sus recuentos derivan de las transcripciones de la competición); para reproducir la decodificación con LM hay que reconstruirlo con `build_lm.py` a partir de una copia propia de `train.csv`.
- KenLM no se usó por falta de wheel para Windows; el LM en Python puro puede ser más lento en otros entornos.
- Riesgo de alucinación y de errores en nombres propios, números y términos fuera del vocabulario de entrenamiento, habitual en modelos CTC pequeños.
- Sesgos potenciales derivados del subconjunto de entrenamiento (103,4 h de 1.200 h de Bengali.AI), que puede no representar toda la variación dialectal y de hablantes del bengalí.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `google/embeddinggemma-2` tiene sus propias condiciones que deben revisarse antes de desplegar en producción.
- No apto para tool calling, agentes ni tareas multimodales más allá de la transcripción de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noobbbbb/egemma2-bn-conformer-ctc
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Vocabulario SentencePiece: https://huggingface.co/Noobbbbb/whisper-tiny-bn-custom-spm
- Perfil del autor en Hugging Face: https://huggingface.co/Noobbbbb
- GitHub del autor: https://github.com/evan-cse
- LinkedIn del autor: https://www.linkedin.com/in/evan-shareef/
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Competición Bengali.AI Speech Recognition: https://www.kaggle.com/competitions/bengaliai-speech
