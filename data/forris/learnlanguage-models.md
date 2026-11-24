# Forris/learnlanguage-models

## Resumen

LearnLanguage models es un repositorio de modelos cuantizados que la aplicación de aprendizaje de idiomas LearnLanguage descarga en el teléfono del usuario para ejecutar la inferencia en local. No se trata de un modelo único, sino de un paquete de tres artefactos con propósitos distintos: un corrector de respuestas, un sistema de reconocimiento de voz para serbio y un compañero conversacional. El autor es Forris y el repositorio está publicado en Hugging Face con licencia por fichero.

El componente con más peso técnico es `grader.gguf`, un ajuste fino mediante LoRA (fusionado) de Qwen3-1.7B, con 1.720.574.976 parámetros, cuantizado en Q4_K_M, que evalúa si la respuesta libre de un estudiante cumple el enunciado del ejercicio y devuelve un código de idioma junto con un 1/0 por ítem. El segundo es `whisper.bin`, un modelo whisper.cpp en formato ggml (q5_0) derivado de openai/whisper-large-v3-turbo y ajustado para serbio con LoRA fusionado, que transcribe en alfabeto latino con mayúsculas y puntuación. El tercero, `partner.gguf`, es una copia sin modificar de Gemma 4 E4B de Google en Q4_K_M.

La relevancia del repositorio es doble: por un lado demuestra un patrón de despliegue móvil con modelos cuantizados y ficheros anclados a commits concretos; por otro, ofrece datos concretos de mejora en reconocimiento de voz en serbio, un idioma con poca cobertura, con una reducción del error de palabra del 39,8 % al 9,4 % en Common Voice sr. El tamaño total del repositorio es de 6,7 GB y acumula 372 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B para `grader.gguf`; Whisper large-v3-turbo para `whisper.bin`; Gemma 4 E4B para `partner.gguf`) |
| Parametros totales | 1.720.574.976 (dato de safetensors; corresponde a `grader.gguf`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (`grader.gguf`, `partner.gguf`); q5_0 ggml (`whisper.bin`) |
| Idiomas soportados | sr (serbio); el corrector y el compañero conversacional no declaran idiomas adicionales en la model card |
| Licencia | per-file: Apache 2.0 (`grader.gguf`), MIT (`whisper.bin`), Apache 2.0 (`partner.gguf`) |
| Formato de pesos | GGUF (`grader.gguf`, `partner.gguf`); ggml/whisper.cpp (`whisper.bin`) |

## Arquitectura y entrenamiento

El repositorio agrupa tres artefactos con arquitecturas distintas. `grader.gguf` parte de Qwen3-1.7B, un transformer decoder-only de 1.720.574.976 parámetros, ajustado con LoRA y posteriormente fusionado para la tarea de verificación de respuestas; el entrenamiento se realizó con datos generados por los propios scripts de la aplicación (plantillas escritas para ello), sin datos de terceros, y la salida es un código de idioma más un 1/0 por ítem evaluado. `whisper.bin` parte de openai/whisper-large-v3-turbo, un modelo encoder-decoder de reconocimiento de voz, ajustado con LoRA fusionado sobre FLEURS sr_rs (CC BY 4.0, Google) y Common Voice 27.0 sr (CC0, Mozilla), y exportado a ggml q5_0 para whisper.cpp. `partner.gguf` es Gemma 4 E4B sin modificaciones, cuantizado en Q4_K_M.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta de las plantillas del corrector ni si hubo etapas de RLHF o DPO. La innovación destacable es operativa: los ficheros están anclados por la aplicación a commits concretos del repositorio, lo que garantiza reproducibilidad del binario que se descarga en el dispositivo, y la licencia se gestiona por fichero en lugar de por repositorio.

## Capacidades

- Verificación de respuestas: `grader.gguf` determina si una respuesta libre cumple lo que pide un ejercicio y emite un código de idioma junto con un 1/0 por ítem.
- Reconocimiento de voz en serbio: `whisper.bin` transcribe audio a texto en alfabeto latino, con mayúsculas y puntuación.
- Conversación: `partner.gguf` actúa como compañero conversacional sin ajuste adicional, con las capacidades del modelo base Gemma 4 E4B.
- Ejecución en dispositivo: los tres artefactos están pensados para inferencia local en teléfono mediante whisper.cpp y runtimes compatibles con GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el repositorio declara únicamente `sr`; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): solo el reconocimiento de voz de `whisper.bin`; no se documentan otras.

## Casos de uso

- Corrección automática de ejercicios de idiomas: `grader.gguf` recibe el enunciado y la respuesta libre del estudiante y devuelve un 1/0 por ítem, lo que permite dar retroalimentación inmediata sin conexión y sin enviar el texto del usuario a un servidor.
- Dictado y transcripción de voz en serbio: `whisper.bin` convierte audio del micrófono en texto con mayúsculas y puntuación, adecuado para ejercicios de pronunciación y de escritura guiada en la aplicación.
- Práctica conversacional: `partner.gguf` mantiene diálogos de práctica con el estudiante en el dispositivo, con la ventaja de que el contenido de la conversación no sale del teléfono.
- Evaluación de baterías de ejercicios: el formato de salida del corrector (un 1/0 por ítem) permite puntuar listas de respuestas en una sola pasada y agregar resultados en la interfaz de la app.
- Aplicaciones de aprendizaje sin conectividad: el conjunto de modelos, con 6,7 GB de repositorio y cuantizaciones Q4_K_M y q5_0, está diseñado para descargarse una vez y ejecutarse en local, útil en entornos con red limitada.
- Investigación sobre ajuste fino de ASR en idiomas de bajos recursos: `whisper.bin` sirve como referencia reproducible de un ajuste LoRA sobre whisper-large-v3-turbo para serbio, con metodología y datos citados (FLEURS y Common Voice).
- Prototipado de asistentes de voz locales: la combinación de `whisper.bin` para entrada de audio y `partner.gguf` para generación permite construir un pipeline de voz a texto y respuesta íntegramente en el dispositivo.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado | Base |
|---|---|---|---|
| Common Voice sr, hablantes reservados (WER, whisper.cpp, greedy) | `whisper.bin` | 9,4 % | 39,8 % (whisper-large-v3-turbo) |
| FLEURS sr_rs test (WER, whisper.cpp, greedy) | `whisper.bin` | 12,1 % | 13,3 % (whisper-large-v3-turbo) |

No se han publicado resultados de benchmarks para `grader.gguf` ni para `partner.gguf` en la información disponible.

## Requisitos de hardware

- `grader.gguf`: 1.720.574.976 parámetros en Q4_K_M; la VRAM estimada ronda 1,2-1,5 GB, por lo que cabe en GPU de consumo con 4 GB o más y en teléfonos de gama media-alta.
- `whisper.bin`: whisper-large-v3-turbo en q5_0 ggml; el tamaño exacto del fichero no está disponible, pero el repositorio completo ocupa 6,7 GB, por lo que se recomienda al menos 4-6 GB de memoria libre en el dispositivo.
- `partner.gguf`: Gemma 4 E4B en Q4_K_M; el tamaño exacto no está disponible en la información proporcionada.
- GPU recomendadas: no disponibles de forma específica; para escritorio, cualquier GPU con 8 GB o más permite ejecutar los tres artefactos, y para el corrector bastan 4 GB.
- Opciones de despliegue: whisper.cpp para `whisper.bin`; runtimes compatibles con GGUF (llama.cpp, Ollama y similares) para `grader.gguf` y `partner.gguf`. El repositorio incluye el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ASR sr (WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `whisper.bin` (este repo) | whisper-large-v3-turbo ajustado | no disponible | 9,4 % CV sr / 12,1 % FLEURS sr_rs | MIT | Hugging Face, formato ggml |
| openai/whisper-large-v3-turbo (base) | whisper-large-v3-turbo | no disponible | 39,8 % CV sr / 13,3 % FLEURS sr_rs | MIT | Hugging Face |
| `grader.gguf` (este repo) | 1.720.574.976 | no disponible | no aplica | Apache 2.0 | Hugging Face, GGUF Q4_K_M |
| Qwen/Qwen3-1.7B (base) | 1.720.574.976 | no disponible | no aplica | Apache 2.0 | Hugging Face |
| `partner.gguf` (este repo) | Gemma 4 E4B | no disponible | no aplica | Apache 2.0 | Hugging Face, GGUF Q4_K_M |

## Limitaciones y advertencias

- La licencia es por fichero y el repositorio figura como `license: other` con `license_name: per-file`; es obligatorio revisar la licencia de cada artefacto antes de redistribuirlo o usarlo comercialmente.
- `partner.gguf` es Gemma 4 E4B sin modificar: hereda los sesgos, el riesgo de alucinación y las limitaciones del modelo base de Google.
- `grader.gguf` se entrenó únicamente con datos generados por plantillas de la propia aplicación; su comportamiento fuera de esos formatos de ejercicio no está documentado y puede degradarse.
- El corrector emite un 1/0 por ítem y un código de idioma; no se documenta calibración de esa decisión ni métricas de precisión o recall.
- `whisper.bin` está ajustado para serbio y transcribe en alfabeto latino; no se documenta su comportamiento en otros idiomas ni en variedades distintas a las de FLEURS sr_rs y Common Voice 27.0 sr.
- Los resultados de WER publicados corresponden a decodificación greedy con whisper.cpp; otras configuraciones de decodificación pueden dar cifras distintas.
- No se dispone de información sobre longitud de contexto, número de tokens de entrenamiento ni latencia, lo que limita la planificación de capacidad en producción.
- El repositorio está pensado para descarga en dispositivo; el tamaño de 6,7 GB puede ser prohibitivo en planes de datos móviles o almacenamiento limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Forris/learnlanguage-models
- Modelo base del corrector: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base de reconocimiento de voz: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Common Voice (Mozilla): https://commonvoice.mozilla.org
