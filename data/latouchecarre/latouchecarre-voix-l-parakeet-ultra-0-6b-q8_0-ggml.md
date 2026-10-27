# LaToucheCarre/LaToucheCarre-Voix-L-Parakeet-Ultra-0.6B-Q8_0-GGML

## Resumen

Parakeet Ultra 0.6B Q8_0 GGML es un modelo de reconocimiento automático del habla (ASR) en formato ggml, publicado por LaToucheCarre para su asistente de escritura local «La Touche Carré» (Windows). No es un modelo de lenguaje: es un transductor TDT de 0,6 B de parámetros derivado de `moondream/parakeet-ultra`, que a su vez es un post-entrenamiento de `nvidia/parakeet-tdt-0.6b-v3`. Este repositorio concreto contiene únicamente la conversión a ggml y la cuantización Q8_0, con un fichero de 668.757.119 bytes (0,7 GB) y SHA-256 verificado por la aplicación que lo descarga.

Su interés práctico está en la relación entre memoria y precisión: según el banco de voz del autor (487 palabras de referencia, unos 2.830 caracteres en francés e inglés), Q8_0 obtiene un 0,89 % de CER y un 4,11 % de WER, idénticos a F16 carácter a carácter, con 1.080 MB de VRAM frente a 1.667 MB. Por debajo, Q3_K ya alcanza la misma precisión con 746 MB, mientras que Q2_K se degrada hasta un 25,19 % de CER. El modelo está pensado para dictado y transcripción totalmente local, sin salida de audio ni texto de la máquina, con licencia CC-BY-4.0 que permite uso comercial con atribución.

La relevancia es doble: por un lado, ofrece una alternativa ligera y offline a Whisper en francés (en el banco del autor, 95,10 % de palabras correctas en FLEURS frente a 93,73 % de un Whisper large-v3 destilado en francés); por otro, sirve como ejemplo reproducible de conversión de pesos NeMo/transformers a ggml con verificación por similitud coseno. La contrapartida es que se trata de un repositorio con validación exclusivamente del autor, sin descargas ni evaluaciones independientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transductor TDT (token-and-duration transducer) con red de predicción LSTM (sesgos ih/hh y puertas [i,f,g,o] → [i,f,o,g] en la conversión); el encoder no se detalla en la información disponible |
| Parámetros totales | 0,6 B nominales (según el nombre del modelo); desglose por componente no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: es un modelo ASR; la model card no fija un límite de duración de audio (las pruebas usan clips de 17 s, 25 s y 2 min 26 s) |
| Tipos de cuantización | Este repositorio: Q8_0. Familia publicada por el mismo autor: Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y F16 |
| Idiomas soportados | Francés e inglés; etiqueta `multilingual`; sin función de traducción |
| Licencia | CC-BY-4.0 (hereda de NVIDIA y Moondream) |
| Formato de pesos | ggml binario (`.bin`) para `parakeet-cli` de whisper.cpp; origen `model.safetensors` convertido a ggml f32 y luego cuantizado |
| Tamaño del fichero | 668.757.119 bytes (`ggml-parakeet-ultra-0.6b-q8_0.bin`) |
| SHA-256 | `fa28ec8c6afd9893da9829ec9f2fa908a60bc0fbebd37fd60bbd2f0953076fb2` |
| Audio de entrada | WAV, 16 kHz, mono |
| Modelo base | `moondream/parakeet-ultra` (revisión `73175eb7ae`), derivado de `nvidia/parakeet-tdt-0.6b-v3` |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento original, sino la cadena de derivación. El punto de partida es `nvidia/parakeet-tdt-0.6b-v3`, un transductor TDT de NVIDIA: en lugar de predecir solo tokens, el decodificador predice conjuntamente el token y su duración, lo que permite emitir varios fotogramas por paso y reduce el coste de decodificación. La red de predicción es una LSTM, tal como evidencia el proceso de conversión (los sesgos `ih` se pliegan en `hh` y las puertas se reordenan de [i,f,g,o] a [i,f,o,g], igual que en `convert-parakeet-to-ggml.py` de whisper.cpp). Sobre esa base, Moondream publica `moondream/parakeet-ultra` como post-entrenamiento; no se especifican en la model card ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF/DPO.

La innovación técnica documentada está en la conversión, no en el entrenamiento: se reutiliza el gabarito ggml f32 oficial de Parakeet TDT 0.6B v3 (`ggml-org/parakeet-GGUF`), copiando la cabecera tal cual (hiperparámetros, banco de filtros mel, ventana, duraciones TDT y vocabulario) y sustituyendo cada tensor por su homólogo de `parakeet-ultra` con los nombres mapeados de transformers a NeMo. El control de calidad es una similitud coseno ≥ 0,954 frente al tensor v3 original en todos los tensores; la cabeza VAD se descarta. La cuantización se hace con `parakeet-quantize` de whisper.cpp (revisión `c44b60b`) desde el f32, nunca desde f16, porque `decoder.prediction.embed.weight` saldría con el doble de tamaño. No hay datos sobre datos de entrenamiento, régimen de alineación, puntuación ni idiomas adicionales más allá de francés e inglés.

## Capacidades

- Reconocimiento de voz en francés e inglés sobre audio WAV de 16 kHz mono, con salida de texto plano.
- Transcripción de audio real con homófonos y dictado espontáneo: en el banco del autor, 25 errores de carácter sobre 2.830 caracteres con Q8_0.
- Ejecución totalmente local: CPU o GPU vía Vulkan con `parakeet-cli`, sin llamadas de red.
- Rendimiento en GPU de gama alta: 188 s de audio procesados en 3,6–4,4 s con una RTX 5090 (Vulkan), independientemente de la cuantización usada.
- Ejecución en CPU a aproximadamente 0,1–0,2× del tiempo real, lo que permite desplegar sin GPU.
- Etiqueta `multilingual` en la model card, aunque la validación publicada se limita a francés e inglés.
- Sin traducción: el inglés forzado en modo francés se transcribe tal cual, igual que en Parakeet v3.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de código, matemáticas ni visión.
- No se documentan puntuación automática, mayúsculas, marcas de tiempo ni diarización de hablantes.
- La cabeza VAD del modelo original se ignora en esta conversión, por lo que no hay detección de actividad de voz integrada.

## Casos de uso

- Dictado integrado en el asistente La Touche Carré (Windows): es el caso real para el que se publica el repositorio. La aplicación descarga el `.bin`, comprueba el SHA-256 y lo ejecuta con `parakeet-cli` en local, de modo que ni el audio ni el texto salen del equipo; encaja por su huella de 713 MB de RAM en CPU y 1.080 MB de VRAM en GPU.
- Transcripción de reuniones y notas de voz confidenciales: en entornos con requisitos de confidencialidad (despachos legales, consultas médicas, I+D), el modelo se ejecuta en un portátil o estación sin conexión y procesa clips de minutos con un CER por debajo del 1 % en el banco del autor.
- Subtitulado por lotes de vídeo en francés e inglés: un pipeline puede extraer audio a WAV 16 kHz mono, pasarlo por `parakeet-cli` con Vulkan y generar los segmentos de texto; con 188 s de audio en 3,6–4,4 s en una RTX 5090, el cuello de botella pasa a ser el resto del pipeline, no el ASR.
- Accesibilidad y dictado para usuarios con movilidad reducida: al caber en CPU (0,1–0,2× tiempo real) funciona en equipos sin GPU dedicada, y la licencia CC-BY-4.0 permite distribuir el binario dentro de una aplicación de escritorio con la atribución correspondiente.
- Control de calidad de atención telefónica en local: transcripción por lotes de grabaciones en servidores sin GPU, con coste de memoria de 713 MB de RAM, útil cuando no se permite enviar audio a una API externa.
- Investigación en ASR y evaluación de cuantizaciones: el repositorio incluye fichero verificable, SHA-256 y una tabla comparativa entre Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y F16, lo que permite reproducir el estudio memoria/precisión y contrastarlo con Parakeet v3 y Whisper.
- Etiquetado y transcripción de corpus académicos francés/inglés: el resultado de 95,10 % de palabras correctas en FLEURS (lectura, 2 min 26 s) lo hace apto para preanotar corpus que luego se revisan manualmente, con la salvedad de que la métrica procede de un único banco del autor.

## Benchmarks y rendimiento

Datos del banco de voz del autor (27/10/2026), sobre Ryzen 7 7800X3D y RTX 5090 con `parakeet-cli` Vulkan en una sola pasada. Corpus: dictado doméstico (17 s), voz real con homófonos (25 s) y FLEURS leído (2 min 26 s); unas 2.830 referencias de carácter y 487 palabras. Los errores se cuentan tras normalización de números.

| Palier | Cuantización | Bytes | Errores | CER % | WER % | FLEURS % palabras | RAM / VRAM (MB) |
|---|---|---|---|---|---|---|---|
| — | Q2_K (descartado) | 272.917.479 | 708 | 25,19 | 41,48 | 53,95 | 396 / 684 |
| XS | Q3_K | 334.751.719 | 25 | 0,89 | 3,90 | 95,64 | 395 / 746 |
| — | Q4_K (descartado) | 415.611.879 | 29 | 1,03 | 4,52 | 94,55 | 470 / 827 |
| S | Q5_K | 491.715.559 | 25 | 0,89 | 4,11 | 95,10 | 543 / 903 |
| M | Q6_K | 572.575.719 | 25 | 0,89 | 4,11 | 95,10 | 621 / 984 |
| L | Q8_0 (este repo) | 668.757.119 | 25 | 0,89 | 4,11 | 95,10 | 713 / 1.080 |
| XL | F16 | 1.255.897.319 | 25 | 0,89 | 4,11 | 95,10 | 1.098 / 1.667 |
| Ref. | Parakeet TDT 0.6B v3 Q3_K | 334.751.719 | 31 | 1,10 | 4,72 | 94,55 | 396 / 746 |
| Ref. | Whisper large-v3 french distil Q5_0 | 791.369.259 | 36 | 1,28 | 4,72 | 93,73 | 843 / 1.207 |

Observaciones del autor que conviene retener: de Q3_K a F16 la puntuación varía en pocos caracteres, de modo que la escala de paliers es de memoria y no de precisión; Q8_0 y F16 producen el mismo texto carácter a carácter; Q2_K se degrada de forma inservible (41,48 % de WER). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de LLM, y no aplican a este modelo.

## Requisitos de hardware

- VRAM medida para Q8_0: 1.080 MB en una RTX 5090 con backend Vulkan; RAM en CPU: 713 MB.
- Alternativas de menor huella de la misma familia: Q3_K con 746 MB de VRAM / 395 MB de RAM y la misma precisión observada; Q2_K no es recomendable (25,19 % de CER).
- GPU recomendadas: cualquier GPU con al menos ~1,1 GB de VRAM libre según la medición del autor; solo se documenta la RTX 5090, no hay pruebas publicadas en A100, H100, RTX 4090 ni GPUs de gama de entrada. Por el tamaño del fichero (0,7 GB) es razonable esperar que quepa en GPUs de consumo con 2 GB o más, pero es una inferencia, no un dato verificado.
- Ejecución en CPU: soportada con `-ng`, a un ritmo de aproximadamente 0,1–0,2× del tiempo real (entre 5 y 10 veces más lento que el tiempo real).
- Despliegue: `parakeet-cli` de whisper.cpp con backend Vulkan o CPU (`-dev N` para elegir dispositivo). No se mencionan soportes en vLLM, TGI, llama.cpp ni Ollama; la única vía documentada es `parakeet-cli`.
- Latencia y throughput: 188 s de audio en 3,6–4,4 s en RTX 5090 Vulkan (del orden de 43–52× tiempo real, calculado a partir de los datos del autor); sin cambios apreciables entre cuantizaciones en la misma tarjeta.
- Comando de referencia: `parakeet-cli -m ggml-parakeet-ultra-0.6b-q8_0.bin -f audio.wav -t 8 -np`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Cuantización comparada | CER % / WER % (banco del autor) | VRAM (MB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Parakeet Ultra 0.6B Q8_0 (este repo) | 0,6 B | fr, en | Q8_0 | 0,89 / 4,11 | 1.080 | CC-BY-4.0 | HuggingFace, 0 descargas, 0 likes |
| Parakeet TDT 0.6B v3 | 0,6 B | multilenguaje (según model card original) | Q3_K | 1,10 / 4,72 | 746 | CC-BY-4.0 | HuggingFace (NVIDIA) |
| Whisper large-v3 french distil | No disponible en la información | fr | Q5_0 | 1,28 / 4,72 | 1.207 | No disponible en la información | No disponible en la información |
| Parakeet Ultra F16 (misma familia) | 0,6 B | fr, en | F16 | 0,89 / 4,11 (texto idéntico a Q8_0) | 1.667 | CC-BY-4.0 | HuggingFace (mismo autor) |

A igual cuantización, el autor indica que Parakeet Ultra y Parakeet v3 tienen memoria y velocidad idénticas, y que la mejora está en la precisión (25 errores frente a 31). El repositorio concreto tiene una ventaja operativa frente a sus competidores: fichero único verificado por SHA-256 y descarga estable para integrarlo en una aplicación de escritorio.

## Limitaciones y advertencias

- Modelo ASR, no generativo: no responde preguntas, no razona, no escribe código y no sigue instrucciones; cualquier uso como LLM es un error de categoría.
- Validación muy limitada: el banco del autor tiene 487 palabras de referencia y ~2.830 caracteres, con clips de 17 s, 25 s y 2 min 26 s; las diferencias entre Q3_K y F16 están dentro de pocos caracteres y no son estadísticamente robustas.
- Sin evaluación independiente: 0 descargas y 0 likes en el momento de la consulta; la precisión publicada procede únicamente del autor.
- Sesgos desconocidos: no se documentan datos de entrenamiento, composición del corpus, acentos cubiertos ni demografía, por lo que no se puede evaluar el sesgo por variedad dialectal, edad o género.
- Riesgo de alucinación en audio ruidoso o con solapamiento de hablantes: no se publican métricas con ruido, música o reverberación; el corpus es lectura y dictado relativamente limpio.
- Cobertura de idiomas: la etiqueta dice `multilingual`, pero solo se aportan pruebas en francés (y la observación de que el inglés forzado se transcribe literalmente). No hay evidencia de otros idiomas.
- Sin traducción ni cambio de idioma forzado: el modo inglés sobre audio francés devuelve el texto tal cual, igual que Parakeet v3.
- Requisitos de formato estrictos: WAV, 16 kHz, mono; otros formatos o frecuencias requieren preprocesado externo.
- No se documentan puntuación, mayúsculas, marcas de tiempo ni diarización, lo que limita su uso directo en subtitulado sin postproceso.
- La cabeza VAD se descarta en la conversión: la detección de actividad de voz debe hacerse fuera del modelo.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a NVIDIA y Moondream (y al autor de la conversión si se redistribuye el `.bin`); el repositorio declara explícitamente que ni Moondream ni NVIDIA están asociados a él.
- Al ser una conversión de un post-entrenamiento de terceros, las garantías de soporte y mantenimiento dependen de un único publicador.
- Q2_K está descartado por el propio autor: no debe desplegarse en producción (25,19 % de CER, 41,48 % de WER).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LaToucheCarre/LaToucheCarre-Voix-L-Parakeet-Ultra-0.6B-Q8_0-GGML
- Producto del autor: https://latouchecarre.fr
- whisper.cpp (incluye `parakeet-cli` y `parakeet-quantize`): https://github.com/ggml-org/whisper.cpp
- Gabarito ggml de Parakeet TDT 0.6B v3: https://huggingface.co/ggml-org/parakeet-GGUF
- Modelo base intermedio: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
