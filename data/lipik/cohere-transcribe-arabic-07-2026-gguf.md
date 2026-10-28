# lipik/cohere-transcribe-arabic-07-2026-gguf

## Resumen

`lipik/cohere-transcribe-arabic-07-2026-gguf` es una conversión a formato GGUF del modelo `CohereLabs/cohere-transcribe-arabic-07-2026`, un sistema de reconocimiento automático del habla (ASR) de tipo audio-in/text-out desarrollado por Cohere y Cohere Labs. El modelo original es una adaptación centrada en árabe de la arquitectura Cohere Transcribe 03-2026, con un codificador Conformer y una cabeza Transformer encoder-decoder con atención cruzada y embeddings de tokens atados. Cuenta con 2.049.026.832 parámetros (aproximadamente 2.05 mil millones) y está optimizado para árabe dialectal y para el cambio de código árabe-inglés, con el inglés como idioma secundario.

La relevancia de esta publicación concreta es práctica: permite ejecutar el modelo fuera de PyTorch, mediante `transcribe.cpp`, en CPU, Metal y Vulkan, con cuantizaciones que van de BF16 (4.10 GB) a Q4_K_M (1.56 GB). El autor reporta una degradación de calidad prácticamente nula respecto a la referencia en Transformers: 11.02 % de WER en BF16 frente a 11.00 % de la referencia nativa sobre el split de test completo de FLEURS árabe (`ar_eg`, 428 enunciados).

Es un modelo pensado para transcripción offline por lotes: la model card indica explícitamente que no soporta streaming, ni marcas de tiempo, ni detección de idioma, ni traducción. El idioma se pasa como bandera (`-l ar` o `-l en`) y la entrada debe ser un WAV mono a 16 kHz, aunque el modelo remuestrea internamente el audio. La licencia heredada es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer encoder + cabeza Transformer encoder-decoder (atención cruzada, embeddings de tokens atados) |
| Parámetros totales | 2.049.026.832 (aproximadamente 2.05 B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el audio se procesa por fichero completo; sin streaming) |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | árabe (`ar`, con foco en dialectal) e inglés (`en`), incluido cambio de código árabe-inglés |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF para `transcribe.cpp`; pesos originales en safetensors en el repositorio upstream |
| Entrada | waveform de audio, remuestreada automáticamente a 16 kHz mono; log-Mel spectrogram |
| Salida | transcripción de texto, decodificación autorregresiva |
| Tamaño del repositorio | 2.4 GB |
| Librería | `transcribe.cpp` |
| Pipeline | `automatic-speech-recognition` |
| Modelo base | `CohereLabs/cohere-transcribe-arabic-07-2026` (relación: quantized) |
| Commit upstream | `0a8193c`, fijado el 2026-07-07 |
| Commit de validación `transcribe.cpp` | `d89ecb7`, validado el 2026-07-07 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cohere Transcribe 03-2026: un codificador Conformer que consume el espectrograma log-Mel del audio y una cabeza Transformer encoder-decoder que genera la transcripción de forma autorregresiva mediante atención cruzada sobre la salida del codificador. Los embeddings de tokens están atados entre el decodificador y la proyección de salida, lo que reduce el número de parámetros sin penalizar la cobertura del vocabulario. El total de 2.049.026.832 parámetros corresponde a los safetensors del modelo original, del que esta publicación es una conversión cuantizada.

No se dispone, en la información proporcionada, del número de horas o tokens de audio empleados en el entrenamiento, de la composición exacta del dataset ni de si se aplicaron etapas de RLHF, DPO o ajuste supervisado adicionales. La model card original sí explicita el enfoque: optimización para árabe y para escenarios de code-switching árabe-inglés, con el inglés como idioma secundario. La model card incluida en la información está truncada a partir del apartado de entrada, por lo que los detalles de preprocesado y de datos quedan como no disponibles.

La innovación destacable de esta publicación no está en el modelo, sino en el port: la conversión a GGUF para `transcribe.cpp`, validada numéricamente contra la referencia de Transformers en el mismo manifiesto de evaluación, con decodificación greedy y sin modelo de lenguaje externo. Las diferencias de WER entre cuantizaciones son de décimas y todas caen dentro del intervalo de confianza del 95 % de la referencia, lo que sugiere que el port no introduce desviaciones relevantes en la salida.

## Capacidades

- Transcripción de voz a texto en árabe, incluyendo árabe dialectal (la evaluación se hizo sobre habla egipcia) y variantes coloquiales.
- Manejo de cambio de código árabe-inglés dentro de un mismo enunciado, con inglés como idioma secundario.
- Transcripción monolingüe en inglés mediante la bandera `-l en`.
- Decodificación autorregresiva con selección explícita de idioma en la invocación.
- Ejecución offline completa: no requiere servicios externos ni conexión de red.
- Inferencia en CPU, GPU mediante Metal (Apple Silicon) y GPU mediante Vulkan (integrada y dedicada en Windows/Linux).
- Cuantizaciones de 1.56 GB a 4.11 GB, lo que permite ajustar el equilibrio calidad/recursos.
- No soporta streaming (indicado como `streaming: false`).
- No soporta marcas de tiempo (`timestamps: none`).
- No soporta detección automática de idioma (`lang_detect: false`).
- No soporta traducción (`translate: false`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio en sentido inverso (texto a voz).

## Casos de uso

- Transcripción de contacto con clientes en centros de atención telefónica del mundo árabe: el modelo está entrenado con foco en dialectal, lo que permite transcribir conversaciones coloquiales que los sistemas entrenados solo con árabe formal (MSA) suelen degradar. Se procesaría el WAV de la llamada por lotes y se volcaría el texto a un sistema de analítica.
- Generación de corpus para entrenar modelos de lenguaje en árabe: al ejecutarse en CPU con cuantización Q4_K_M (1.56 GB) y un factor de velocidad de 3 a 9 veces tiempo real, permite transcribir archivos de audio grandes en máquinas sin GPU dedicada.
- Actas de reuniones corporativas con code-switching árabe-inglés: equipos que mezclan terminología técnica en inglés dentro de una frase en árabe pueden transcribirse con un único paso, sin segmentar manualmente por idioma.
- Digitalización de archivo audiovisual y patrimonio sonoro: entrevistas, programas de radio y registros históricos en dialectos árabes pueden transcribirse offline en infraestructura propia, sin enviar el audio a la nube.
- Transcripción con requisitos de confidencialidad (ámbito legal, sanitario, administración pública): el despliegue local con `transcribe.cpp` evita la salida de datos a terceros, requisito habitual en expedientes con datos personales sensibles.
- Accesibilidad y subtitulado diferido: para vídeo bajo demanda, el modelo genera el texto base que luego se alinea a marcas de tiempo con una herramienta externa, dado que el modelo no produce timestamps por sí mismo.
- Preprocesado en pipelines de análisis de opinión y moderación: transcripción de notas de voz de usuarios en aplicaciones de mensajería para su posterior clasificación con un LLM de texto.
- Evaluación comparativa de ASR en investigación: las cuantizaciones publicadas permiten medir el impacto de la compresión en WER sobre un manifiesto reproducible (FLEURS `ar_eg`, 428 enunciados, decodificación greedy, normalizador BasicTextNormalizer de Whisper).

## Benchmarks y rendimiento

Resultados de WER sobre el split de test completo de FLEURS árabe (`ar_eg`, 428 enunciados), decodificación greedy, sin modelo de lenguaje externo, normalizador `Whisper BasicTextNormalizer`:

| Cuantización | Tamaño | WER FLEURS árabe (test) |
|---|---:|---:|
| Referencia Transformers BF16 | — | 11.00 % |
| BF16 (GGUF) | 4.10 GB | 11.02 % |
| F16 (GGUF) | 4.11 GB | 11.00 % |
| Q8_0 | 2.41 GB | 11.06 % |
| Q6_K | 1.97 GB | 11.07 % |
| Q5_K_M | 1.77 GB | 10.95 % |
| Q4_K_M | 1.56 GB | 11.18 % |

El autor señala que todas las cuantizaciones caen dentro del intervalo de confianza del 95 % de la referencia y que los números publicados por el modelo upstream sobre otros conjuntos de test en árabe no son directamente comparables con estos. FLEURS árabe es habla en dialecto egipcio.

Factor de velocidad reportado por el autor (valores tal como aparecen en la model card; la card no explicita la definición exacta del RTF, pero valores mayores indican procesado más rápido que el tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 73 |
| Apple M4 Max | CPU | 9 |
| AMD Ryzen 7 4750U | Vulkan | 8 |
| AMD Ryzen 7 4750U | CPU | 3 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras tareas de texto, algo esperable al tratarse de un modelo puramente ASR. Tampoco hay WER publicado para inglés ni para otros dialectos árabes distintos del egipcio.

## Requisitos de hardware

- VRAM estimada: BF16/F16 en torno a 4.1 GB de pesos, más activaciones y buffers de decodificación; en la práctica requiere del orden de 5 a 6 GB para inferencia cómoda. Q8_0 (2.41 GB) se sitúa en torno a 3 a 3.5 GB; Q6_K (1.97 GB) en torno a 2.5 a 3 GB; Q4_K_M (1.56 GB) permite funcionar con aproximadamente 2 a 2.5 GB.
- Cabe en GPU de consumo: sí. Cualquier GPU con 6 GB o más puede ejecutar BF16; con 4 GB se puede usar Q8_0 o Q6_K; con 2 a 3 GB, Q4_K_M.
- GPU recomendadas: no hay una lista oficial en la información disponible. Por backend, el autor valida Metal en Apple Silicon (M4 Max) y Vulkan en AMD Ryzen 7 4750U (gráfica integrada). No se aportan mediciones en A100, H100 ni RTX 4090.
- Ejecución en CPU: viable y medida. El modelo funciona sin GPU, con factor de velocidad de 9 (M4 Max) y 3 (Ryzen 7 4750U) respecto al tiempo real.
- Opciones de despliegue: `transcribe.cpp` es la única librería declarada. Requiere compilar desde fuente (`cmake -B build && cmake --build build`) y ejecutar `build/bin/transcribe-cli -m <gguf> -l ar input.wav`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI; estos runtimes no cubren, según la información disponible, la arquitectura Conformer encoder-decoder de este modelo.
- Preprocesado obligatorio: audio en WAV mono a 16 kHz. Si la fuente no cumple, hay que convertirla previamente, por ejemplo con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- Latencia y throughput: ver tabla de RTF en la sección anterior. No hay datos de latencia por fragmento ni de rendimiento con lotes concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Marcas de tiempo | Traducción | Licencia | Formato / runtime |
|---|---:|---|---|---|---|---|
| `cohere-transcribe-arabic-07-2026` (este GGUF) | 2.05 B | ar, en | no | no | Apache-2.0 | GGUF / `transcribe.cpp` |
| Cohere Transcribe 03-2026 (modelo base de la familia) | no disponible en esta información | multilingüe (no detallado) | no disponible | no disponible | no disponible | safetensors / Transformers |
| Whisper large-v3 (OpenAI) | aproximadamente 1.55 B | multilingüe (amplia cobertura, incluido árabe) | sí | sí | permisiva (MIT en el repositorio original, Apache-2.0 en el repo de HuggingFace) | safetensors, GGUF vía `whisper.cpp` |
| MMS-1B-all (Meta) | aproximadamente 1 B | más de 1000 idiomas | no disponible | no | CC-BY-NC 4.0 (no comercial) | safetensors / fairseq |

No hay cifras de WER comparables entre estos modelos en la información proporcionada: el 11 % de FLEURS `ar_eg` de este modelo se midió con un manifiesto y un normalizador concretos, y el propio autor advierte que los números del modelo upstream en otros conjuntos árabes no son directamente comparables. Los datos de las filas de alternativas provienen de conocimiento general y no de la búsqueda realizada; conviene verificarlos antes de publicar la comparativa.

La diferencia funcional clave frente a Whisper es el alcance: Whisper ofrece marcas de tiempo y traducción, mientras que este modelo renuncia explícitamente a ambas y concentra su ajuste en árabe dialectal y code-switching. Frente a MMS-1B-all, la ventaja es la licencia Apache-2.0, que permite uso comercial sin las restricciones no comerciales de CC-BY-NC.

## Limitaciones y advertencias

- Sin streaming: la model card lo declara explícitamente. No es apto para transcripción en vivo ni para dictado interactivo; solo proceso por fichero.
- Sin marcas de tiempo: `timestamps: none`. Para subtitulado hace falta segmentar el audio previamente o alinear el texto con una herramienta externa.
- Sin detección automática de idioma: hay que pasar `-l ar` o `-l en`. Un audio con idioma mal declarado degradará la transcripción.
- Sin traducción: no convierte árabe a inglés ni a la inversa; solo transcribe en el idioma de origen.
- Calidad medida únicamente en dialecto egipcio: el 11 % de WER corresponde a FLEURS `ar_eg`. No hay datos publicados para dialectos del Golfo, magrebíes, levantinos ni para árabe formal (MSA), de modo que el rendimiento en esos registros es desconocido.
- El inglés es idioma secundario: no se publica WER para inglés, por lo que su calidad relativa frente a modelos específicos no está cuantificada.
- Riesgo de alucinación y de salida espuria en tramos de silencio, ruido o solapamiento de hablantes: es un riesgo habitual en modelos ASR autorregresivos; no se documentan mecanismos de mitigación en la información disponible.
- Sesgos: no se documenta ninguna evaluación de sesgos por género, acento, edad o clase social. El rendimiento puede degradarse con acentos alejados de la distribución de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial con atribución y conservación del aviso de licencia. La licencia se hereda del modelo base, por lo que conviene revisar los términos del repositorio upstream como fuente autoritativa.
- Dependencia de un runtime poco extendido: `transcribe.cpp` no es un ecosistema tan maduro como `whisper.cpp`, llama.cpp u Ollama, y no se documenta soporte en vLLM, TGI ni servidores de inferencia habituales. Hay que compilar desde fuente.
- Requisito estricto de entrada: WAV mono a 16 kHz. Cualquier otro formato o frecuencia debe convertirse antes, lo que añade un paso de preprocesado con `ffmpeg` u otra herramienta.
- Procedencia del repositorio: la publicación de `lipik` acumula 0 descargas y 0 likes, y los enlaces de descarga de la model card apuntan al repositorio `handy-computer/cohere-transcribe-arabic-07-2026-gguf`, no a `lipik`. Conviene comprobar que los ficheros GGUF están efectivamente alojados aquí y verificar su integridad (tamaños y hashes) antes de usarlos en producción.
- La model card original incluida en la información está truncada a partir del apartado de entrada, por lo que detalles de entrenamiento, preprocesado y evaluación quedan sin confirmar.

## Enlaces

- Repositorio GGUF (esta publicación): https://huggingface.co/lipik/cohere-transcribe-arabic-07-2026-gguf
- Repositorio GGUF de referencia del autor del port: https://huggingface.co/handy-computer/cohere-transcribe-arabic-07-2026-gguf
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Commit upstream sobre el que se hizo el port: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026/commit/0a8193c
- Modelo de la familia Cohere Transcribe 03-2026: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Runtime `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp/tree/d89ecb7
- Página de documentación del modelo en `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/cohere-transcribe-arabic-07-2026.md
- Cohere: https://cohere.com
- Cohere Labs: https://cohere.com/research
