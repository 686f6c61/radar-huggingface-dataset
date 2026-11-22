# moonbox-dev/s2-pro-GGUF

## Resumen

Fish Audio S2 Pro GGUF es una compilación en formato GGUF del modelo de síntesis de voz Fish Audio S2 Pro, preparada por Moonbox para su ejecución local con llama.cpp en Metal, CUDA, Vulkan y CPU. El modelo original lo desarrolla Fish Audio y está orientado a text-to-speech de alta calidad con clonación de voz zero-shot y control fino mediante etiquetas de hablante e instrucciones inline. Esta versión cuantizada permite desplegar el sistema en hardware de consumo, algo inviable con los pesos originales en BF16.

El sistema no es un transformer monolítico: se compone de un modelo autorregresivo lento de 4.032.298.496 parámetros (backbone Qwen3) que genera tokens semánticos, y un modelo autorregresivo rápido de 4 capas junto con un códec de audio (encoder para clonación de voz y decoder para la waveform), empaquetado aparte en el fichero `mmproj`. La compilación GGUF divide, por tanto, los pesos en dos artefactos que deben usarse conjuntamente.

La relevancia actual reside en que traslada un TTS multilingüe con clonación de voz y control expresivo a un formato ejecutable con llama.cpp, con cuantizaciones desde Q4_K_M (2,51 GB) hasta F16 (8,07 GB), manteniendo según el autor una tasa de error de transcripción del 0,0 % y una similitud de hablante cercana a la del modelo original en su conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS de dos etapas: AR lento de 4B con backbone Qwen3 + AR rápido de 4 capas + códec de audio |
| Parametros totales | 4.032.298.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | multilingüe (inglés y chino evaluados en el benchmark del autor); lista completa no disponible |
| Licencia | fish-audio-research-license (other, solo investigación, no comercial) |
| Formato de pesos | GGUF (modelo principal + `mmproj` en BF16 con códec en F16/F32) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de generación de audio en dos niveles. Un modelo autorregresivo lento de 4B parámetros, construido sobre un backbone Qwen3, produce la secuencia de tokens semánticos a partir del texto y de la referencia de voz. Un modelo autorregresivo rápido de 4 capas, incluido en el fichero `mmproj`, refina esa secuencia y un códec neuronal se encarga de la síntesis final de la waveform; la mitad encoder del códec se usa para extraer el embedding de la voz de referencia en la clonación y la mitad decoder para reconstruir el audio.

La conversión a GGUF, realizada con llama.cpp `b12621` sobre la revisión `1de9996b6b` del checkpoint original, reordena tres tipos de tensores sin alterar sus valores: separa los pesos fusionados `wqkv` en q/k/v, reordena las filas q/k y sus normas desde el layout rotary intercalado del checkpoint al de llama.cpp, y recorta la cabeza de salida del AR rápido a sus primeras 1024 filas (el tamaño del codebook). El autor verificó que los 358 tensores del checkpoint original aparecen con los mismos valores en los ficheros BF16 y `mmproj`. No se empleó importance matrix en la cuantización; las precisiones distintas de BF16 se generaron con las mezclas estándar de `llama-quantize`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Síntesis de voz (text-to-speech) de alta calidad a partir de texto.
- Clonación de voz zero-shot a partir de un clip de referencia y su transcripción (`--tts-speaker-file` y `--tts-speaker-text`).
- Control de hablante mediante etiquetas `<|speaker:0|>`, `<|speaker:1|>`, etc., para diálogos multi-hablante.
- Instrucciones expresivas inline entre corchetes, como `[laughing]` o `[whisper]`.
- Soporte multilingüe (inglés y chino verificados en la evaluación del autor; cobertura adicional no confirmada).
- Generación conversacional de audio, según la etiqueta `conversational` del repositorio.
- Servicio mediante API HTTP con `llama-server` en el endpoint `/tts`, con parámetros `input`, `speaker_ref_b64`, `speaker_ref_text` y `seed`.
- Ejecución en Metal, CUDA, Vulkan y CPU a través de llama.cpp.

## Casos de uso

- Clonación de voz para audiolibros y narración: se aporta un clip de referencia de pocos segundos y su transcripción, y el modelo genera capítulos completos con la misma identidad vocal, usando la cuantización Q8_0 (4,29 GB) para preservar la similitud de hablante.
- Doblaje y localización de contenido: el soporte multilingüe y las etiquetas de hablante permiten generar pistas de voz en inglés y chino manteniendo el timbre del locutor original, con control de expresividad mediante instrucciones inline.
- Asistentes de voz conversacionales en local: el despliegue con `llama-server` expone `/tts` como servicio HTTP, lo que permite integrar la síntesis en un pipeline de agente sin depender de APIs en la nube y sin enviar audio del usuario a terceros.
- Prototipado de videojuegos y personajes interactivos: las etiquetas `<|speaker:N|>` y las instrucciones `[laughing]` o `[whisper]` permiten generar diálogos multi-personaje con variaciones emocionales desde un único modelo.
- Accesibilidad y lectura de textos: la cuantización Q4_K_M (2,51 GB) cabe en GPUs de consumo y permite generar voz sintética en equipos de escritorio para lectores de pantalla o conversión de documentos a audio.
- Investigación en TTS y evaluación de cuantizaciones: el repositorio incluye un conjunto de evaluación con WER, CER, similitud de hablante (WavLM) y DNSMOS por precisión, lo que facilita reproducir experimentos de degradación por cuantización en un RTX 3080 Laptop.
- Generación de voces para preproducción de podcast y demos: el RTF inferior a 1 en Q8_0, Q6_K, Q5_K_M y Q4_K_M sobre CUDA (0,77–0,85) permite generar audio más rápido que tiempo real en hardware de consumo.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre un conjunto de 6 frases en inglés y 4 en chino, con semillas 0–3, tarea de clonación de voz con el clip y la transcripción del conjunto, ejecutada con `llama-server` `/tts` sobre CUDA en una RTX 3080 Laptop. Las métricas son WER/CER de la transcripción de Whisper large-v3-turbo (inglés/chino), similitud de hablante con WavLM y DNSMOS. BF16 y F16 se ejecutaron con 18 de las 36 capas en GPU para ajustarse a la memoria del portátil.

| Precision | Tamano | WER / CER | Similitud hablante | DNSMOS | RTF |
|---|---|---|---|---|---|
| F16 | 8,07 GB | 0,0 % / 0,0 % | 0,953 / 0,957 | 3,25 / 2,95 | 4,4 (mitad de capas en CPU) |
| BF16 | 8,07 GB | 0,0 % / 0,0 % | 0,957 / 0,949 | 3,30 / 2,92 | 4,7 (mitad de capas en CPU) |
| Q8_0 | 4,29 GB | 0,0 % / 0,0 % | 0,956 / 0,952 | 3,29 / 2,96 | 0,85 (CUDA) |
| Q6_K | 3,31 GB | 0,0 % / 0,0 % | 0,953 / 0,953 | 3,29 / 2,88 | 0,81 |
| Q5_K_M | 2,90 GB | 0,0 % / 0,0 % | 0,949 / 0,957 | 3,30 / 3,04 | 0,79 |
| Q4_K_M | 2,51 GB | 0,0 % / 0,0 % | 0,953 / 0,950 | 3,28 / 2,93 | 0,77 |

Referencia del modelo original (`fish-speech` en bf16 sobre CUDA, mismo conjunto): error 0,0 % / 0,0 %, similitud 0,958 / 0,945, DNSMOS 3,28 / 2,62. El criterio de aceptación fijado por el autor exige un error máximo 2 puntos por encima del original, una similitud como máximo 0,03 por debajo y un DNSMOS como máximo 0,2 por debajo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB para Q4_K_M, 2,9 GB para Q5_K_M, 3,3 GB para Q6_K, 4,3 GB para Q8_0 y 8,1 GB para F16/BF16, más 2,05 GB adicionales del fichero `mmproj` compartido en todas las precisiones.
- GPU recomendadas: RTX 3080 Laptop es la referencia medida por el autor; cualquier GPU con 6–8 GB de VRAM puede ejecutar Q4_K_M o Q5_K_M con el `mmproj` completo en memoria. Para F16/BF16 conviene una GPU de 16 GB o más (RTX 4090, A100, H100) o bien repartir capas entre GPU y CPU como hizo el autor.
- Cabe en GPU de consumo: sí, desde Q4_K_M en adelante; las cuantizaciones Q4_K_M a Q8_0 son las más adecuadas para portátiles y equipos de gama media.
- Opciones de despliegue: llama.cpp (`llama-tts` para CLI y `llama-server` para el endpoint `/tts`), con backends Metal, CUDA, Vulkan y CPU. Requiere llama.cpp `b12621` o posterior.
- Latencia y throughput: RTF de 0,77–0,85 en CUDA para Q4_K_M a Q8_0 (más rápido que tiempo real en la RTX 3080 Laptop); RTF de 4,4–4,7 para F16/BF16 con reparto de capas entre GPU y CPU, es decir, entre 4 y 5 veces más lento que tiempo real en esa configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Clonacion de voz | Licencia | Formato local |
|---|---|---|---|---|---|
| Fish Audio S2 Pro GGUF (este) | 4,03 B (AR lento) + AR rápido y códec | no disponible | Sí, zero-shot | fish-audio-research-license (no comercial) | GGUF (llama.cpp) |
| Fish Audio S2 Pro original | 4,03 B (AR lento) + AR rápido y códec | no disponible | Sí, zero-shot | fish-audio-research-license (no comercial) | safetensors (fish-speech, bf16) |
| Alternativas TTS open source comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos TTS con los que establecer una comparación cuantitativa fiable de parámetros, contexto o rendimiento. La única comparación directa disponible es frente al propio modelo original en bf16, cuyos resultados se recogen en la sección de benchmarks.

## Limitaciones y advertencias

- Licencia de investigación de Fish Audio: el uso comercial está restringido; los ficheros son un derivado del modelo original y heredan su licencia, que gobierna su uso. Verificar `LICENSE.md` antes de cualquier despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de los resultados publicados por el autor.
- El benchmark del autor es reducido (6 frases en inglés y 4 en chino, semillas 0–3) y se ejecutó en un único equipo (RTX 3080 Laptop); los valores de WER, similitud y DNSMOS no deben extrapolarse sin cautela a otros dominios, acentos o idiomas.
- La cobertura lingüística completa no está documentada; solo se verifican inglés y chino en la evaluación.
- Riesgo de alucinación y artefactos en la voz generada: no se documentan tasas de fallo en textos largos, números, nombres propios o cambios de código de idioma.
- Riesgo de uso indebido de la clonación de voz: la clonación zero-shot permite imitar voces sin consentimiento; es responsabilidad del desplegador aplicar controles y cumplir la normativa aplicable.
- La cuantización Q4_K_M y Q5_K_M muestran ligeras variaciones en similitud y DNSMOS respecto a BF16 (por ejemplo, DNSMOS chino 3,04 en Q5_K_M frente a 2,62 del original), pero el conjunto de evaluación es demasiado pequeño para concluir que la cuantización mejora la calidad.
- No se dispone de información sobre sesgos demográficos o de acento del modelo original.
- Requiere dos ficheros (modelo y `mmproj`) y una versión concreta de llama.cpp (`b12621` o superior); versiones anteriores pueden no cargar correctamente los tensores reordenados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/s2-pro-GGUF
- Modelo base original: https://huggingface.co/fishaudio/s2-pro
- Fichero F16: https://huggingface.co/moonbox-dev/s2-pro-GGUF/blob/main/fish-audio-s2-pro-F16.gguf
- Fichero BF16: https://huggingface.co/moonbox-dev/s2-pro-GGUF/blob/main/fish-audio-s2-pro-BF16.gguf
- Fichero Q8_0: https://huggingface.co/moonbox-dev/s2-pro-GGUF/blob/main/fish-audio-s2-pro-Q8_0.gguf
- Fichero Q6_K: https://huggingface.co/moonbox-dev/s2-pro-GGUF/blob/main/fish-audio-s2-pro-Q6_K.gguf
- Fichero Q5_K_M: https://huggingface.co/moonbox-dev/s2-pro-GGUF/blob/main/fish-audio-s2-pro-Q5_K_M.gguf
- Fichero Q4_K_M: https://huggingface.co/moonbox-dev/s2-pro-GGUF/blob/main/fish-audio-s2-pro-Q4_K_M.gguf
- Fichero mmproj (encoder y códec): https://huggingface.co/moonbox-dev/s2-pro-GGUF/blob/main/mmproj-fish-audio-s2-pro-BF16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia (arXiv:2603.08823): https://arxiv.org/abs/2603.08823
