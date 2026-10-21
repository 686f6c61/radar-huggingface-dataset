# audio-cpp/Ming-3.0-Audio-Tiny-GGUF

## Resumen

Ming-3.0-Audio-Tiny-GGUF es la conversión al formato GGUF del checkpoint `inclusionAI/Ming-3.0-audio-tiny`, publicada por el proyecto audio.cpp. No se trata de un modelo nuevo, sino de un empaquetado de inferencia: un único fichero GGUF que contiene el encoder de audio, el Thinker (MoE con atención KDA/MLA), el Talker, el VAE de audio, el encoder de locutor CAMPPlus, los tokenizadores y la configuración. El objetivo es permitir ejecutar el pipeline completo de audio (reconocimiento de voz, comprensión de audio, síntesis de voz, clonación de voz y diálogo voz a voz) sin depender del stack Python de PyTorch/Transformers.

El modelo resuelve un problema práctico de despliegue: el checkpoint original requiere PyTorch y Transformers, mientras que esta conversión se ejecuta con el CLI `audiocpp_cli` de audio.cpp sobre backend CUDA (y también CPU para pruebas cortas), con opciones de offload de expertos a memoria de host. Está pensado para aplicaciones que necesitan ASR y TTS en la misma pila, con salida de voz mono a 44,1 kHz y soporte de voces con nombre y clonación a partir de audio de referencia.

Es relevante ahora porque demuestra que un modelo de audio con arquitectura híbrida (encoder + MoE Thinker + Talker generativo) puede portarse a C++ con cuantización selectiva de los bancos de expertos (Q8_0, Q4_K) manteniendo el resto de componentes en precisión de origen. El repo ocupa 43,8 GB e incluye tres precisiones; la licencia es MIT, lo que facilita el uso comercial, aunque con solo 1 like y 0 descargas en el momento de la consulta la validación por parte de la comunidad es prácticamente inexistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida de audio: encoder de audio + Thinker MoE con atención KDA/MLA + Talker + VAE de audio + encoder de locutor CAMPPlus |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el Thinker es MoE, pero no se publica el reparto total/activo) |
| Longitud de contexto | no disponible (en las pruebas de transcripción y resumen de una reunión completa se usó una allowance de 32.768 tokens) |
| Tipos de cuantización | BF16 (tensores originales, routers de expertos y CAMPPlus en F32), Q8_0 (bancos de expertos del Thinker), Q4_K (bancos de expertos del Thinker + cabeza de salida de texto en Q8_0) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero único por precisión, con todos los submodelos, tokenizadores y configuración) |

## Arquitectura y entrenamiento

La arquitectura combina varios componentes en un solo grafo: un encoder de audio para la entrada, un Thinker basado en mezcla de expertos (MoE) con atención KDA/MLA que produce el razonamiento y el texto, un Talker que sintetiza la señal de voz, un VAE de audio y un encoder de locutor CAMPPlus para la identidad de la voz. Esta separación permite reutilizar el mismo Thinker tanto para ASR y comprensión de audio como para generar respuestas que el Talker convierte en habla (modo `s2s`). La salida de voz es mono a 44,1 kHz.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se documentan en la información disponible; la model card de esta conversión solo describe el empaquetado y el comportamiento de inferencia, no el proceso de entrenamiento del checkpoint original. La innovación técnica destacable de esta ficha es la cuantización selectiva: solo se cuantizan los bancos de expertos del Thinker, mientras que el encoder de audio, las proyecciones de atención y MLP del Thinker, el Talker, el VAE y el encoder de locutor conservan la precisión de origen. Como consecuencia, la memoria necesaria para la ruta TTS no se reduce al bajar la cuantización de los expertos.

## Capacidades

- Transcripción de voz offline (ASR) con decodificación greedy; en las pruebas se usó una allowance de 256 tokens para audio corto.
- Comprensión de audio: el Thinker puede responder preguntas sobre el contenido del audio de entrada.
- Síntesis de voz (TTS) con voces con nombre identificadas por `voice_id` (por ejemplo, `US_James`) y selección de idioma (`language=en`).
- Clonación de voz a partir de un audio de referencia (`--voice-ref`); el audio condiciona la identidad del locutor y, opcionalmente, se puede aportar `reference_text` para usar también el prefijo acústico.
- Diálogo voz a voz (`s2s`): entrada de audio, respuesta del Thinker sintetizada por el Talker.
- Salida de audio mono a 44,1 kHz.
- Soporte bilingüe chino-inglés, con recomendación de usar referencias en el idioma objetivo para una pronunciación más fiable.
- Troceado de texto para salidas largas controlable mediante `text_chunk_size` (valor por defecto, 100).
- Offload de expertos a disco/host mediante `ming3_audio.disk_experts=true`, con 8 slots de expertos por capa por defecto.
- En modo offload, el almacenamiento KV del Thinker crece según el uso real de contexto en lugar de reservar toda la allowance.

## Casos de uso

- Transcripción y resumen de reuniones: el pipeline ASR transcribe y el Thinker resume en la misma ejecución; en las pruebas se procesó una reunión completa con una allowance de 32.768 tokens y finalización natural, lo que encaja en actas automáticas y sistemas de notas internas.
- Síntesis de voz para audiolibros y contenido largo: el troceado de texto (`text_chunk_size`) y las voces con nombre permiten generar narraciones de varios minutos de forma estable; en las pruebas, un texto inglés de 1.518 caracteres produjo 79,7 s de audio con `US_James`.
- Clonación de voz para doblaje y localización: con un audio de referencia y su transcripción se condiciona la identidad del locutor, útil para doblar contenido entre chino e inglés manteniendo la voz del hablante original (requiere consentimiento explícito).
- Asistentes de voz integrados en aplicaciones nativas: el binario `audiocpp_cli` y el backend C++ permiten incorporar ASR + TTS en aplicaciones de escritorio o servicios sin desplegar PyTorch ni Transformers.
- Sistemas de atención telefónica o IVR: TTS con voces fijas y baja variabilidad (en las pruebas, dos generaciones con la misma voz resultaron byte-idénticas) para mensajes pregrabados dinámicamente.
- Subtitulado y accesibilidad: transcripción offline de grabaciones con detección de idioma zh/en, adecuada para generar subtítulos en postproducción sin conexión a servicios externos.
- Despliegue con memoria GPU limitada: con `disk_experts=true` los pesos de expertos residen en memoria de host y se cargan en una caché GPU acotada, lo que permite ejecutar el modelo en GPUs por debajo del requisito de VRAM del modo residente.
- Evaluación comparativa Python vs C++: útil para equipos que quieran verificar paridad de salidas entre el stack oficial y una implementación nativa antes de migrar producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos que sí se aportan son mediciones de inferencia comparando el checkpoint BF16 oficial en Python (PyTorch 2.11.0+cu128, Transformers 5.12.1, atención SDPA) con audio.cpp, sobre una RTX 5090 y build C++17 en modo Debug (por tanto, no representativo de un build optimizado):

| Medición | Python (BF16) | audio.cpp | Notas |
|---|---|---|---|
| WER en clonación larga (Whisper turbo) | 0 % | 0,40 % | Con presupuesto de troceado de 100 caracteres en audio.cpp |
| WER en TTS con voz con nombre (Whisper medium) | 1,98 % | 0 % | Mismo texto de 1.518 caracteres, seed 42, guidance 2, sigma 0,25, temperatura 0 |
| Duración de salida en clonación | 65,4 s | 63,9 s | Incluye preparación de la referencia |
| Duración de salida en voz con nombre | 78,1 s | 79,7 s | — |
| Determinismo | no disponible | Byte-idéntico entre dos generaciones de la misma petición | — |
| RTF y VRAM pico | no disponible en texto (publicados solo como gráfico `assets/performance.png`) | no disponible en texto | Medidos en RTX 5090 |

Además, se indica que las transcripciones cortas de ASR coinciden exactamente con Python, que en el caso de reunión las respuestas con Q4 difieren de BF16 (las mediciones son de rendimiento con la misma entrada, no de paridad de salida) y que la inferencia en CPU supera comprobaciones funcionales de ASR y TTS cortos.

## Requisitos de hardware

- Tamaño del repo: 43,8 GB, repartido en tres ficheros GGUF (BF16, Q8_0, Q4_K). El tamaño individual de cada fichero no está disponible en la información proporcionada.
- VRAM estimada: no disponible como cifra concreta; las gráficas de VRAM pico solo se publican como imagen. Las mediciones se realizaron en una RTX 5090.
- La cuantización Q8_0/Q4_K no reduce la memoria de la ruta TTS, porque el encoder de audio, el Talker, el VAE y el encoder de locutor se mantienen en la precisión de origen; solo se comprimen los bancos de expertos del Thinker.
- Reducción de memoria GPU: `--session-option ming3_audio.disk_experts=true` mantiene los expertos en memoria de host y los carga en una caché GPU acotada (8 slots por capa por defecto), con el cálculo neuronal en la GPU seleccionada.
- GPU recomendadas: no se especifican oficialmente; la única referencia publicada es RTX 5090 con backend CUDA.
- Viabilidad en GPU de consumo: no confirmada con cifras. El modo de offload de expertos está pensado explícitamente para reducir el uso de VRAM, lo que sugiere que el modo residente completo puede superar GPUs de consumo.
- CPU: se han superado comprobaciones funcionales de ASR y TTS cortos en CPU, pero no forma parte de la comparativa de rendimiento CUDA publicada.
- Opciones de despliegue: CLI `audiocpp_cli` con `--family ming3_audio` y `--backend cuda` (tareas `asr`, `tts`, `clon`, `s2s`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; el GGUF está adaptado al runtime audio.cpp.
- Latencia y throughput: RTF no disponible en texto. Como referencia de duración, un texto de 1.518 caracteres generó entre 63,9 y 79,7 s de audio según el modo, en un build Debug.

## Comparativa con modelos similares

No se han publicado comparativas oficiales con otros modelos en la información disponible, y los resultados de benchmarks estándar no están presentes, por lo que cualquier comparación de calidad sería especulativa. A continuación se comparan solo características verificables de la ficha y alternativas de la misma categoría (audio omnicomprensivo con salida de voz), marcando como "no disponible" lo que no se puede confirmar:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| Ming-3.0-Audio-Tiny (esta conversión GGUF) | no disponible (MoE) | no disponible | zh, en | MIT | GGUF para audio.cpp |
| Alternativas tipo Qwen-Omni / GLM-4-Voice / Moshi | no disponible en esta ficha (verificar en sus model cards) | no disponible | no disponible | varía según modelo (verificar) | safetensors + stack Python |

No se dispone de datos suficientes para establecer una comparación cuantitativa fiable con esas alternativas; se recomienda consultar sus fichas oficiales antes de decidir.

## Limitaciones y advertencias

- Solo cubre chino e inglés; no hay soporte documentado de otros idiomas.
- No se publican resultados de benchmarks estándar ni comparativas con modelos equivalentes, lo que dificulta evaluar su calidad objetiva.
- El repo tiene 0 descargas y 1 like en el momento de la consulta: validación externa prácticamente nula.
- Las mediciones de rendimiento se hicieron con un build C++ Debug, por lo que las cifras de latencia no representan un build de producción.
- En el caso de reunión, las respuestas con Q4_K difieren de BF16: no hay garantía de paridad de salida entre precisiones.
- El frontend nativo no ejecuta el normalizador de texto FST opcional de Python y usa troceado por caracteres en lugar del buffering palabra/carácter de Python; para pronunciaciones correctas conviene escribir los números con letras.
- La cuantización de expertos no reduce la VRAM de la ruta TTS, lo que puede causar expectativas erróneas sobre el ahorro de memoria.
- La clonación de voz permite imitar identidades: implica riesgos de suplantación y obligaciones legales y éticas (consentimiento del locutor, derechos de imagen y voz) que la licencia MIT no resuelve.
- Riesgo de alucinación en transcripción y, especialmente, en las respuestas del Thinker sobre audio ambiguo o con ruido; no se documentan tasas de error más allá de las pruebas puntuales con Whisper.
- El despliegue está ligado al runtime audio.cpp: no hay soporte documentado para vLLM, TGI, llama.cpp u Ollama, lo que limita la portabilidad.
- Licencia MIT permite uso comercial, pero la responsabilidad sobre los datos de audio procesados y sobre las voces clonadas recae en el integrador.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (solo sitios de audio de consumo), por lo que no hay fuentes externas independientes que contrasten la información.

## Enlaces

- HuggingFace (esta conversión GGUF): https://huggingface.co/audio-cpp/Ming-3.0-Audio-Tiny-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-audio-tiny (revisión fijada `25b96e30be3739849bf76c0f48ac11db4a262fb3`)
- Repositorio de inferencia audio.cpp: https://github.com/0xShug0/audio.cpp
- Guía del modelo en audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/ming3_audio.md
- Código upstream del modelo: https://github.com/inclusionAI/Ming-3.0-audio-flash
- Gráfico de rendimiento: `assets/performance.png` dentro del repo de HuggingFace
- Resultados de búsqueda web: sin enlaces relevantes (solo dominios de audio de consumo: audiofanzine.com, audio.com, audiophonics.fr, audilab.fr, son-video.com)
