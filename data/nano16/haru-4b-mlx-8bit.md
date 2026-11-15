# nano16/Haru-4B-mlx-8bit

## Resumen

Haru-4B MLX 8-bit es una conversión comunitaria cuantizada del modelo de diálogo hablado full-duplex Haru-4B, desarrollado originalmente por Higurashi. El modelo base resuelve el problema de la conversación de voz bidireccional en tiempo real: procesa audio de entrada y genera audio de salida de forma simultánea y continua, sin la alternancia rígida turno-a-turno de los sistemas de speech-to-speech convencionales. Esta versión MLX, publicada por el usuario nano16, está optimizada para Apple Silicon y reduce el peso en disco de 10,5 GB a 6,6 GB.

La arquitectura combina un backbone Qwen3.5 de 32 capas con mecanismos Gated DeltaNet, una cabeza de audio MeanFlow y el códec VibeVoice. El checkpoint safetensors declara 2.247.808.257 parámetros (aproximadamente 2,25 mil millones), aunque la denominación comercial del modelo base es "4B"; esta discrepancia no se explica en la información disponible. La cuantización es de 8 bits afín con grupo de 64 para las matrices del backbone y la tabla de embeddings, mientras que normas, proyectores de audio, cabeza MeanFlow y códec se mantienen en precisión del checkpoint original.

Su relevancia actual radica en que demuestra que la cuantización a 8 bits en MLX preserva la fidelidad del modelo bf16 (97,6 % de coincidencia en el token de texto más probable por fotograma) mientras acelera la inferencia aproximadamente 1,5 veces en un M4 Pro. No se ofrece versión de 4 bits porque colapsa en salidas incoherentes. La licencia es Apache 2.0 y soporta nueve idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3.5 (32 capas) con Gated DeltaNet, cabeza de audio MeanFlow y codec VibeVoice; diálogo full-duplex |
| Parametros totales | 2.247.808.257 (según safetensors; el nombre comercial indica 4B) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín, group size 64 (backbone y embeddings); resto en bf16/fp32. No se ofrece 4-bit |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout MLX, autocontenido con backbone, cabeza y codec) |

## Arquitectura y entrenamiento

El modelo base Haru-4B emplea un backbone Qwen3.5 de 32 capas con mecanismos Gated DeltaNet, una variante de atención lineal recurrente que reduce el coste computacional en secuencias largas de audio. Sobre ese backbone se sitúa una cabeza de audio MeanFlow que genera latentes de audio, y un códec VibeVoice que convierte esos latentes en forma de onda. El paradigma es full-duplex: el modelo consume y produce audio de forma continua a 7,5 Hz (un fotograma cada 133 ms), lo que permite solapamiento entre escucha y habla.

Esta conversión concreta no reentrena el modelo: aplica la misma cuantización que el modo `HaruModel.quantize(bits=8)` del código upstream, pero la persiste en disco para evitar descargar y recuantizar el checkpoint bf16 en cada carga. Las matrices del backbone y la tabla de embeddings (con cabeza de salida atada) se cuantizan a 8 bits afín con grupo de 64; las ganancias de norma, la convolución y compuertas de Gated DeltaNet, los proyectores de audio, la cabeza MeanFlow y el códec VibeVoice conservan la precisión del checkpoint (bf16/fp32). El archivo `model.safetensors` está en layout MLX y no en el layout de claves original de Hugging Face, por lo que requiere el cargador `load_haru_8bit.py` incluido en el repositorio. No se dispone de información sobre el dataset de entrenamiento, número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Diálogo hablado full-duplex: entrada y salida de audio simultáneas, con presupuesto de 133 ms por fotograma a 7,5 Hz.
- Speech-to-speech de extremo a extremo: recibe wav y produce wav, con flujo de texto intermedio y flujo de audio.
- Generación de texto alineada con el audio: el modelo emite un token de texto por fotograma que corresponde a lo que verbaliza.
- Multilingüe en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Personalización por tarjeta de personaje (`system-prompt-file`) y voz de referencia (`--reference`), lo que permite fijar estilo conversacional y timbre.
- Salida estéreo opcional (`--stereo`).
- Tool calling / function calling: no disponible en la información.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información.
- Modo thinking, visión o audio de entrada distinto del diálogo: no disponible en la información.

## Casos de uso

- Atención al cliente por voz en tiempo real: el modelo puede mantener una conversación hablada continua con solapamiento natural entre turnos, adecuado para centralitas y asistentes telefónicos donde la latencia por fotograma de 34 ms en M4 Pro queda muy por debajo del presupuesto de 133 ms.
- Asistentes personales locales en macOS: al ejecutarse sobre MLX en Apple Silicon con un pico de memoria de 7,7 GB, cabe en un Mac de 16 GB y permite desplegar un asistente de voz privado sin conexión a servicios en la nube.
- Prototipado de agentes conversacionales con personalidad: la tarjeta de personaje y la voz de referencia permiten iterar rápidamente sobre personajes con estilo y timbre definidos, útil en investigación de interacción humano-máquina.
- Doctores o entrenadores de idiomas simulados: con soporte de nueve idiomas y diálogo full-duplex, sirve para construir interlocutores de práctica conversacional que reaccionan mientras el usuario habla.
- Evaluación de modelos speech-to-speech en investigación: al ser una conversión fiel del bf16 (97,6 % de acuerdo top-1 en texto), permite reproducir experimentos del modelo original con menor huella de memoria y mayor velocidad.
- Demos y aplicaciones de accesibilidad: un asistente de voz local de baja latencia puede integrarse en herramientas de lectura o acompañamiento para personas con dificultades motoras o visuales, sin depender de red.
- Integración en pipelines de generación de audio conversacional: el cargador devuelve un `HaruModel` compatible con `DuplexSession`, lo que facilita incorporar el modelo a flujos de síntesis de diálogo ya existentes en `haru_mlx`.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión, medidos en un M4 Pro (24 GB) con `haru_mlx`, en modo wav-a-wav offline con el mismo bucle fotograma a fotograma que una llamada en vivo. Entradas: 6 líneas de apertura en inglés (TTS de macOS, rellenadas a 20 s = 150 fotogramas), tarjeta de personaje en inglés y voz de referencia de 23 s. Muestreo por defecto (temperatura 0,7, top-k 25, guidance 1,5).

| Precisión | ms/fotograma (mediana) | p95 | Factor tiempo real | Memoria MLX pico | Tiempo de carga | Pesos en disco |
|---|---|---|---|---|---|---|
| bf16 (original) | 50,4 | 51,4 | 0,38 | 11,6 GB | 5,7 s | 10,5 GB |
| 8-bit (este repo) | 34,1 | 35,0 | 0,26 | 7,7 GB | 1,3 s | 6,6 GB |

Fidelidad frente a bf16 (6 conversaciones, 900 fotogramas, forzando la misma trayectoria):

| vs bf16 | Acuerdo top-1 en texto | KL texto (media) | KL texto (p99) | Coseno latente audio | Error rel. latente audio |
|---|---|---|---|---|---|
| 8-bit (este repo) | 97,6 % | 0,004 | 0,085 | 0,992 | 0,08 |
| 4-bit (referencia, no publicado) | 46,9 % | 3,03 | 17,9 | 0,706 | 0,76 |

Respuestas de extremo a extremo (18 conversaciones por precisión, audio transcrito con faster-whisper small.en):

| Precisión | Respuestas con 3+ palabras | Palabras por respuesta | WER texto-vs-audio |
|---|---|---|---|
| bf16 (original) | 16/18 | 22,2 | 21,3 % |
| 8-bit (este repo) | 16/18 | 28,2 | 14,6 % |

El autor advierte que la diferencia de WER entre ambas precisiones está dentro del ruido de 18 muestras y debe leerse como "sin pérdida medible", no como mejora. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: pico de 7,7 GB en MLX para la versión 8-bit; 11,6 GB para el bf16 original.
- GPU recomendadas: Apple Silicon; el autor solo ha probado un M4 Pro con 24 GB. No hay datos para A100, H100 ni RTX 4090, ya que el formato MLX está orientado a Apple Silicon.
- Compatibilidad con GPU de consumo: un Mac con 16 GB de RAM debería alojar el pico de 7,7 GB según el autor, aunque no se ha verificado experimentalmente.
- Opciones de despliegue: `haru_mlx` (implementación MLX del modelo, Python 3.10+) con el cargador `load_haru_8bit.py` incluido; la app nativa de macOS y `haru_mlx.models.load_model` de upstream no pueden leer este checkpoint por el cambio de layout de claves. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 34,1 ms por fotograma de mediana (p95 de 35,0 ms) frente a un presupuesto de tiempo real de 133 ms; factor de tiempo real de 0,26. Tiempo de carga de 1,3 s con archivos en caché del sistema operativo; la primera carga en frío tarda más.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haru-4B MLX 8-bit (este repo) | 2,25 B declarados (nombre comercial 4B) | no disponible | Speech-to-speech full-duplex, MLX | Apache 2.0 | Hugging Face, conversión comunitaria |
| higurashi-ai/Haru-4B (bf16) | 4B (según nombre) | no disponible | Speech-to-speech full-duplex | Apache 2.0 | Hugging Face, oficial |
| Haru-4B cuantizado 4-bit (referencia no publicada) | no disponible | no disponible | Speech-to-speech full-duplex | Apache 2.0 | No publicado; colapsa en salidas incoherentes |

No se dispone en la información proporcionada de otros modelos speech-to-speech full-duplex comparables con datos verificables de parámetros, contexto o rendimiento, por lo que la comparativa se limita a las variantes del propio Haru-4B.

## Limitaciones y advertencias

- Conversión no oficial: es una cuantización comunitaria de nano16, no del equipo de Higurashi; los autores originales no la respaldan según la model card.
- Layout de pesos incompatible: `model.safetensors` no usa el layout de claves de Hugging Face, por lo que la app nativa de macOS y `haru_mlx.models.load_model` no pueden cargarlo; es obligatorio usar `load_haru_8bit.py`.
- Solo Apple Silicon: el formato MLX no es portable a GPU NVIDIA ni a CPU convencional sin reconversión.
- No hay versión 4-bit: el autor documenta que a 4 bits el modelo colapsa en "mixed-script nonsense" (46,9 % de acuerdo top-1 en texto frente a bf16).
- Evaluación limitada: los benchmarks se hicieron en una sola máquina (M4 Pro), solo en inglés, con entradas y voz sintéticas (TTS) y una muestra pequeña (18 conversaciones, 900 fotogramas de fidelidad). No hay validación multilingüe ni con habla real.
- Respuestas cortas ocasionales: se observan réplicas de una o dos palabras ("Yeah,") y una ejecución silenciosa en 2 de 18 casos, comportamiento heredado del modelo base.
- WER inflado por nombres y números: el 14,6 % de WER texto-vs-audio incluye errores de transcripción de nombres ("Kavin" oído como "Kevin") y cifras ("22" frente a "twenty two").
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo conversacional de voz, puede generar contenido verbal no fundamentado.
- Sesgos: no documentados en la información disponible.
- Contexto: la longitud de contexto no se especifica, lo que impide evaluar conversaciones de larga duración.
- Licencia Apache 2.0: permite uso comercial, pero al ser una conversión no oficial conviene verificar la licencia y condiciones del modelo base antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/nano16/Haru-4B-mlx-8bit
- Modelo base original: https://huggingface.co/higurashi-ai/Haru-4B
- Código de Haru: https://github.com/higurashi-ai/Haru
- Blog técnico de Haru-4B: https://blog.higurashi.ai/melte/haru4b/
- MLX (framework de Apple): https://github.com/ml-explore/mlx
