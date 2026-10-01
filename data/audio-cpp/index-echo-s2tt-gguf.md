# audio-cpp/Index-Echo-S2TT-GGUF

## Resumen

Index-Echo-S2TT-GGUF es un paquete de pesos en formato GGUF que empaqueta los checkpoints oficiales IndexTeam/Index-Echo-S2TT-2B y IndexTeam/Index-Echo-S2TT-9B para su ejecución en audio.cpp, un motor de inferencia nativo en C++ construido sobre ggml. El modelo resuelve traducción de voz a texto (speech-to-text translation, S2TT): a partir de audio en chino genera transcripciones en chino con marcas de tiempo y traducciones a inglés, español o japonés. No genera voz traducida; solo texto y subtítulos.

La colección ofrece cinco ficheros: 2B en precisión original (4,76 GiB), 2B Q8_0 (2,97 GiB), 2B Q4_K (2,14 GiB), 9B en precisión original (17,95 GiB) y 9B Q8_0 (10,44 GiB). Cada GGUF incorpora la torre de audio, el conector, el decodificador de texto, el tokenizador, la configuración y la especificación del modelo para audio.cpp; las ponderaciones de visión no utilizadas quedan excluidas.

El atractivo del port es la paridad funcional con la implementación oficial de PyTorch sin dependencias de Python, con un mismo camino de traducción (prompt, encoder de audio, decoder y muestreador greedy) compartido entre 2B y 9B. El propio autor advierte de que la variedad 9B presenta derivas de salida y de calidad en cuantización que aún no están resueltas, por lo que recomienda Q8_0 o precisión original cuando la fidelidad de los subtítulos sea crítica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con torre de audio (encoder), conector y decodificador de texto. 2B: 24 capas con embeddings de token y salida atados; 9B: 32 capas con LM head separado. Se mencionan proyecciones QKV con atención lineal |
| Parámetros totales | 2 000 millones (2B) y 9 000 millones (9B), en dos variantes |
| Parámetros activos | no aplica (modelos densos, no son MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión original del checkpoint, Q8_0 y Q4_K (Q4_K solo para 2B; el 9B Q4_K no se publica) |
| Idiomas soportados | Entrada: chino. Salida: transcripción en chino y traducciones a inglés, español y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamaño del repositorio | 41,1 GB |
| Librería | audio.cpp |
| Pipeline declarado | automatic-speech-recognition |
| Modelo base | IndexTeam/Index-Echo-S2TT-2B, IndexTeam/Index-Echo-S2TT-9B |

## Arquitectura y entrenamiento

El modelo es una arquitectura multimodal de audio compuesta por una torre de audio (encoder), un conector que proyecta las representaciones acústicas al espacio del decodificador de texto y un decoder autoregresivo. Los GGUF empaquetan los tres componentes junto con el tokenizador, la configuración y la especificación del modelo para audio.cpp. Las dos variantes difieren estructuralmente: la de 2B usa 24 capas con embeddings de token y salida atados, mientras que la de 9B usa 32 capas y un LM head independiente. El autor señala que esta diferencia puede alterar la sensibilidad a las discrepancias numéricas, aunque no ha demostrado que sea la causa de la deriva observada en el 9B.

La inferencia en C++ emplea el mismo camino para 2B y 9B: mismo prompt, mismo encoder de audio, misma implementación de decoder y mismo muestreador greedy. Se menciona que las proyecciones QKV de atención lineal se mantienen en Q8_0 dentro del paquete 2B Q4_K. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y si hubo RLHF o DPO no están disponibles en la información proporcionada; la model card se centra en la conversión y la verificación numérica, no en el proceso de entrenamiento del modelo base.

## Capacidades

- Reconocimiento automático de voz en chino con transcripción de origen.
- Traducción de voz a texto (S2TT) desde chino a inglés, español y japonés.
- Generación de subtítulos con marcas de tiempo para las cues de origen y de traducción.
- Funcionamiento con ventanas de audio segmentadas mediante VAD (en las pruebas se usó Silero VAD con recorte de ventanas).
- Decodificación greedy como estrategia de muestreo en la ruta C++.
- Inferencia nativa en C++ a través de audio.cpp, sin dependencia de Python.
- No genera voz traducida: la salida es exclusivamente texto y subtítulos.
- No incluye las ponderaciones de visión.

## Casos de uso

- Subtitulado automático de contenido en chino para distribución internacional: el modelo produce cues con marcas de tiempo y traducciones a inglés, español o japonés, lo que permite generar ficheros de subtítulos listos para revisión.
- Transcripción y traducción de reuniones o ponencias en chino: las cues temporizadas facilitan el alineado con el audio original y la posterior corrección humana.
- Postproducción audiovisual: integración en un pipeline C++ nativo para generar borradores de subtítulos multilingües antes de la revisión por un traductor profesional.
- Indexación y búsqueda multilingüe de archivos de audio: la transcripción en chino y su traducción permiten construir índices de texto sobre material hablado.
- Documentación de soporte y atención al cliente en mercados de habla china: conversión de llamadas grabadas en transcripciones traducidas para análisis de calidad.
- Investigación en traducción de voz: comparación de la implementación C++ frente a la de PyTorch con entradas idénticas y decodificación greedy, útil como referencia de portado.
- Despliegue en entornos sin Python: al ejecutarse sobre audio.cpp con pesos GGUF, encaja en sistemas donde no se desea gestionar entornos Conda o dependencias de PyTorch.

## Benchmarks y rendimiento

Los datos de la model card corresponden a un conjunto diagnóstico de 20 clips de chino del test split de FLEURS, con ventanas recortadas mediante Silero VAD. Las puntuaciones de WER y CER miden únicamente la transcripción de origen, no la calidad de la traducción. El clip `zh_016` provocó repeticiones en todas las variantes 9B y se excluye de sus puntuaciones.

| Checkpoint y ajuste | Clips completados | WER / CER en Python | WER / CER en C++ |
|---|---:|---:|---:|
| 2B original, greedy | 20/20 | 16,23 % / 17,26 % | 16,23 % / 17,26 % |
| 2B Q8_0, greedy | 20/20 | 16,23 % / 17,26 % | 9,55 % / 12,12 % |
| 2B Q4_K, greedy | 20/20 | 16,23 % / 17,26 % | 9,07 % / 11,87 % |
| 9B original, greedy | 19/20 | 7,77 % / 11,02 % | 8,27 % / 11,28 % |
| 9B Q8_0, greedy | 19/20 | 7,77 % / 11,02 % | 8,27 % / 11,41 % |

El autor aclara que el WER más bajo de Q8_0 y Q4_K se debe en gran medida a que esas variantes terminan tras dos cues en `zh_000`, por lo que no constituye evidencia de mejor calidad de transcripción.

Comparación de cues guardadas (texto ignorando mayúsculas, espacios y puntuación; marcas de tiempo contadas si inicio y fin coinciden dentro de 0,1 s):

| Paquete C++ frente a Python oficial | Cues de origen idénticos | Cues de traducción idénticos | Marcas de tiempo a menos de 0,1 s |
|---|---:|---:|---:|
| 2B original | 52/52 | 49/52 | 103/104 |
| 2B Q8_0 | 47/47 | 42/47 | 93/94 |
| 2B Q4_K | 41/47 | 26/47 | 89/94 |
| 9B original | 45/48 | 42/48 | 94/96 |
| 9B Q8_0 | 47/48 | 42/48 | 96/96 |

Rendimiento en CUDA (NVIDIA RTX 5090, build Debug de audio.cpp frente a inferencia oficial de PyTorch): tras una petición de 6,2 segundos para calentar el modelo cargado, se ejecutó una petición larga de 180,3 segundos sobre un WAV que concatena los 20 clips de FLEURS; se trata de una carga de trabajo de formato largo, no de una grabación continua natural. La tabla de tiempos solo mide esa segunda petición, excluyendo la carga del modelo y el calentamiento. El detalle del RTF y la comparación completa de tiempo de pared aparecen truncados en la información disponible.

## Requisitos de hardware

- 2B original: fichero de 4,76 GiB; requiere aproximadamente 5-6 GB de VRAM o memoria unificada para cargar los pesos.
- 2B Q8_0: 2,97 GiB; cabe con holgura en GPU de consumo con 6-8 GB.
- 2B Q4_K: 2,14 GiB; la opción más ligera, apta para GPU de gama media y para CPU con RAM suficiente.
- 9B original: 17,95 GiB; necesita alrededor de 18-20 GB de VRAM, lo que requiere GPU de gama alta o profesional.
- 9B Q8_0: 10,44 GiB; opción recomendada para 9B, viable en GPU con 12-16 GB.
- GPU empleada en las pruebas: NVIDIA RTX 5090.
- Despliegue: audio.cpp (motor nativo en C++ sobre ggml, compatible con Windows, Linux y macOS). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: en la prueba sobre RTX 5090, una petición de formato largo de 180,3 segundos con los 20 clips concatenados; no se dispone del RTF ni de cifras de throughput completas.

## Comparativa con modelos similares

No se dispone de comparaciones con otras familias de modelos (por ejemplo, Whisper) en la información proporcionada. La comparación posible es entre las variantes publicadas en este repositorio y los checkpoints base originales:

| Variante | Parámetros | Formato | Tamaño | WER / CER en C++ | Licencia |
|---|---|---:|---:|---:|---|
| Index-Echo-S2TT-2B original (GGUF) | 2B | GGUF | 4,76 GiB | 16,23 % / 17,26 % | Apache 2.0 |
| Index-Echo-S2TT-2B Q8_0 | 2B | GGUF | 2,97 GiB | 9,55 % / 12,12 % | Apache 2.0 |
| Index-Echo-S2TT-2B Q4_K | 2B | GGUF | 2,14 GiB | 9,07 % / 11,87 % | Apache 2.0 |
| Index-Echo-S2TT-9B original (GGUF) | 9B | GGUF | 17,95 GiB | 8,27 % / 11,28 % | Apache 2.0 |
| Index-Echo-S2TT-9B Q8_0 | 9B | GGUF | 10,44 GiB | 8,27 % / 11,41 % | Apache 2.0 |
| Index-Echo-S2TT-2B (PyTorch) | 2B | safetensors (no confirmado) | no disponible | 16,23 % / 17,26 % | no disponible |
| Index-Echo-S2TT-9B (PyTorch) | 9B | safetensors (no confirmado) | no disponible | 7,77 % / 11,02 % | no disponible |

Los checkpoints base se cargan desde los commits `72fd8bdc9bf8251f1c35f6d6289a950eda154395` (2B) y `05f86cb7a38684916e193282b6cc02462ace4043` (9B).

## Limitaciones y advertencias

- El port soporta únicamente S2TT: no genera voz traducida.
- Deriva de salida en 9B: el autor indica que el 2B original es fiable en cuanto a paridad, mientras que el 9B original presenta desviaciones. No se ha determinado la causa.
- Repeticiones: el modelo puede repetir fragmentos en algunos audios incluso en precisión original; hay que revisar los subtítulos antes de usarlos como referencia.
- El 9B Q4_K no se publica porque repetía u omitía habla en clips cortos y fallaba en una petición de formato largo con cues de subtítulo incompletas.
- El 2B Q4_K completó los 20 clips de prueba, pero el propio autor advierte que ese conjunto reducido no establece fiabilidad general y que oculta más cambios en la traducción pese a un WER de origen similar.
- Los resultados de WER y CER provienen de 20 clips de FLEURS: es un diagnóstico pequeño, no un benchmark amplio de calidad, y mide solo la transcripción de origen.
- La comparación de cues no es una puntuación independiente de calidad de traducción ni una afirmación de paridad byte a byte: en el 2B original, las traducciones difieren en 3 de 52 cues.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no cuantificado en la información disponible, pero el propio autor advierte de repeticiones y de que se inspeccionen los subtítulos antes de tratarlos como verdad de referencia.
- Idiomas: la entrada está limitada a chino; las salidas de traducción documentadas son inglés, español y japonés.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del motor audio.cpp y de los checkpoints base antes de desplegar en producción.
- Longitud de contexto máxima: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audio-cpp/Index-Echo-S2TT-GGUF
- Repositorio audio.cpp: https://github.com/0xShug0/audio.cpp
- README de audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/README.md
- Colección audio.cpp-gguf en Hugging Face: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Checkpoint base 2B: https://huggingface.co/IndexTeam/Index-Echo-S2TT-2B (commit 72fd8bdc9bf8251f1c35f6d6289a950eda154395)
- Checkpoint base 9B: https://huggingface.co/IndexTeam/Index-Echo-S2TT-9B (commit 05f86cb7a38684916e193282b6cc02462ace4043)
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Ficha de audio.cpp en Hysen Labs: https://hysenlabs.com/projects/0xshug0-audio-cpp
- Ficha de audio.cpp en local-ai-zone: https://local-ai-zone.github.io/models/audio-cpp.html
