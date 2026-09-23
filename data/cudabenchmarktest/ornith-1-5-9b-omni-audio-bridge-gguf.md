# cudabenchmarktest/Ornith-1.5-9B-Omni-Audio-Bridge-GGUF

## Resumen

Ornith 1.5 9B Omni Audio Bridge es una release de tipo *audio-bridge* publicada por el usuario `cudabenchmarktest` para el runtime [`qwen-omni-adapters`](https://github.com/robit-man/qwen-omni-adapters). No es un modelo entrenado desde cero, sino un ensamblaje coordinado de tres componentes: mantiene `ornith-ai/Ornith-1.5-9B` como único tronco de lenguaje, conserva la ruta nativa de visión del objetivo, reutiliza la torre de audio congelada de `Qwen/Qwen3-Omni-30B-A3B-Instruct` y sustituye únicamente la proyección de audio final de 1.280 dimensiones por un *bridge* entrenado. `Qwen/Qwen3-TTS-12Hz-1.7B-Base` se ejecuta como grafo de salida independiente en un sidecar ligero.

El problema que resuelve es el coste operativo de desplegar la ruta Omni completa: la release anterior con router completo ocupaba 34.466.121.317 bytes (32,10 GiB), mientras que el conjunto de pesos desplegable actual suma 8.751.744.576 bytes (8,15 GiB), un 74,6 % menos en artefactos. Esto permite planteamientos de despliegue en hardware de gama media o en dispositivos tipo Jetson, aunque el autor advierte explícitamente de que la comparación es de pesos residentes, no de pico de proceso (la caché KV, los espacios de trabajo del grafo y las reservas de CUDA consumen memoria adicional).

La relevancia de la ficha es doble: por un lado documenta un patrón de composición modular (tronco de lenguaje propio + percepción ajena congelada + proyección entrenada) que está ganando tracción en el ecosistema open source; por otro, conviene señalar que el repositorio no tiene descargas ni *likes* y que el autor no es el desarrollador original del tronco. El nombre comercial sugiere 9B, pero el campo de safetensors del repositorio declara 2.040.866.561 parámetros, y el bridge entrenado aporta 5.246.976 parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Composición modular: tronco de lenguaje denso (Ornith-1.5-9B) + torre de audio congelada de Qwen3-Omni + proyección de audio *bridge* entrenada (1.280 dimensiones) + sidecar TTS independiente |
| Parámetros totales | 2.040.866.561 según el campo de safetensors del repositorio; el nombre del modelo y el tronco base declaran 9B (discrepancia no aclarada en la model card) |
| Parámetros activos | No aplica al tronco de lenguaje (denso). La torre de audio reutilizada procede de Qwen3-Omni-30B-A3B, cuya nomenclatura indica 30B totales y 3B activos, y se usa congelada |
| Longitud de contexto | 256K tokens según fuentes externas para Ornith-1.5-9B; no confirmado en la model card de esta release |
| Tipos de cuantización | Q4_K_M (lenguaje y TTS), BF16 (proyector combinado visión/audio y TTS code2wav); el repositorio incluye la etiqueta imatrix |
| Idiomas soportados | No disponible en la ficha de HuggingFace; fuentes externas describen el tronco base como orientado a inglés |
| Licencia | `other`, con nombre `mit-and-apache-2.0-components` (componentes bajo MIT y Apache 2.0; el autor pide revisar la licencia de cada componente aguas arriba antes de redistribuir) |
| Formato de pesos | GGUF en tres artefactos coordinados |

Artefactos de pesos de la release:

| Artefacto | Tamaño | SHA-256 |
|---|---:|---|
| `ornith-1.5-9b-q4_k_m.gguf` | 5,24 GiB | `852922174ee4f76621df26105333f1dfe2171cdfb60ebe5a4b013836681a8a77` |
| `mmproj-ornith15-omni-audio-bridge-bf16.gguf` | 1,53 GiB | `7e2d6fe7e80c4538e961e592d954d1c47d64e087139db03043741a0238af2c1c` |
| `ornith-1.5-9b-omni-audio-bridge-tts-sidecar.gguf` | 1,38 GiB | `56b58150b06c9ee1b915f6a545638b1e7d7b0ba6e360b69711cb7abbde3e8a01` |

## Arquitectura y entrenamiento

El diseño separa explícitamente percepción y generación de lenguaje. El tronco lingüístico es `ornith-ai/Ornith-1.5-9B`, descrito por fuentes externas como un modelo denso de 9B parámetros orientado a tareas agénticas de código, con ventana de 256K. Sobre ese tronco se conserva la ruta nativa de visión del propio modelo y se acopla la torre de audio congelada de Qwen3-Omni-30B-A3B: lo único entrenado es la proyección final de audio, de 1.280 dimensiones de ancho, sustituida por un *bridge* afinado. La síntesis de voz queda fuera del grafo principal: Qwen3-TTS-12Hz-1.7B-Base se ejecuta como grafo de salida independiente en un sidecar ligero.

El entrenamiento documentado se limita al bridge. La model card reporta 3.636 muestras de entrenamiento, un vocabulario de recuperación independiente de 8.321 palabras más numerales sistemáticos hasta 1.000, 482 enunciados de recuperación sintetizados y 5.246.976 parámetros entrenables en el bridge. El mejor *checkpoint* por pérdida de validación fue el paso 200, mientras que se liberó el *checkpoint* con *behaviour gating* del paso 50. No se especifican en la información disponible el número de tokens totales, la composición del dataset ni si hubo RLHF o DPO sobre el tronco; el autor tampoco indica innovaciones de atención ni decodificación más allá del soporte de decodificación especulativa `ngram-simple` sin pesos adicionales, que el runtime ofrece pero recomienda mantener bajo control de *benchmark* en el dispositivo objetivo.

## Capacidades

- Generación de texto y razonamiento a través del tronco Ornith-1.5-9B (las puertas de capacidad de lenguaje y herramientas del autor confirman que las capacidades anunciadas están presentes).
- Canal de *thinking* separado: la model card indica que se devuelve un canal de pensamiento independiente.
- *Tool calling* estructurado: se reporta la devolución de 1 llamada estructurada en la puerta de herramientas, con todas las puertas superadas.
- Comprensión de audio y vídeo: requiere el runtime adaptador `qwen-omni-adapters`; no funciona con Ollama estándar.
- Reconocimiento automático de habla (ASR) con evidencia emitida en etiquetas separadas `<speech_transcript>` y `<audio_observation>`.
- Visión nativa de imágenes: la puerta de visión reporta un 1,0000 de tasa exacta de salida etiquetada visual y 0 fallos por medios obsoletos.
- Síntesis de voz (TTS) mediante el sidecar Qwen3-TTS-12Hz-1.7B-Base, con salida en WAV mono PCM16 a 24 kHz.
- Capacidades multilingües: no disponibles en la información de la ficha.
- Decodificación especulativa sin pesos (`ngram-simple`) soportada por el runtime.

## Casos de uso

- Transcripción de reuniones y actas: el componente de ASR emite la transcripción en `<speech_transcript>` y una observación de audio separada en `<audio_observation>`, lo que permite separar lo dicho de lo inferido y auditar el resultado.
- Asistentes de voz conversacionales: combinando ASR, razonamiento del tronco y TTS en el sidecar, se puede construir un bucle de voz completo sin depender de servicios externos, siempre que se despliegue el runtime adaptador.
- Análisis de vídeo con narración: la ruta Omni aporta comprensión de audio y vídeo; la puerta de visión confirma que las afirmaciones visuales no se contaminan con entradas solo de audio (0 casos de afirmaciones visuales desde audio).
- Accesibilidad y lectura de documentos: descripción de contenido visual junto a la locución de la respuesta por el sidecar TTS, útil para lectores de pantalla locales.
- Indexación y búsqueda sobre archivos multimedia: extracción de transcripciones etiquetadas que se pueden almacenar y consultar después, con el vocabulario de recuperación de 8.321 palabras como referencia de cobertura.
- Aplicaciones de voz en el borde: el conjunto de pesos de 8,15 GiB abre la puerta a despliegue en equipos con memoria limitada, aunque el autor condiciona cualquier afirmación de funcionamiento en Jetson de 32 GB sin desalojo a una ejecución de producción medida en ese dispositivo.
- Asistencia a la programación con contexto largo: si se confirma la ventana de 256K del tronco, encaja en revisión de repositorios extensos y tareas multi-paso con *tool calling*.
- Transcripción de vocabulario especializado: la model card reporta WER de 0,0951 en la puerta de audio retenida, con recuerdo de palabras únicas de 0,8307 y de palabras raras de 0,8079, lo que da una referencia concreta para dominios técnicos o con jerga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible. Las únicas métricas son las puertas internas de validación del autor, que se reproducen a continuación tal cual:

| Puerta | Métrica | Valor |
|---|---|---|
| Audio retenida | Muestras / WER de habla | 155 / 0,0951 |
| Audio retenida | Tasa de transcripción falsa sin habla | 0,0000 |
| Audio retenida | Tasa exacta de salida etiquetada | 1,0000 |
| Audio retenida | Afirmaciones visuales desde entrada solo de audio | 0 |
| Audio retenida | Vocabulario de recuperación | 8.321 palabras + numerales hasta 1.000 |
| Visión nativa | Rojo -> azul -> rojo correcto | verdadero |
| Visión nativa | Tasa exacta de salida etiquetada visual | 1,0000 |
| Visión nativa | Fallos por medios obsoletos | 0 |
| Lenguaje y herramientas | Capacidades anunciadas presentes | verdadero |
| Lenguaje y herramientas | Llamadas estructuradas devueltas | 1 |
| Lenguaje y herramientas | Canal de pensamiento separado | verdadero |
| TTS | WER medio de transcripción A -> B -> A | 0,1111 |
| TTS | Fallos de retardo de un turno | 0 |
| TTS | Recuerdo de palabras únicas | 0,8307 |
| TTS | Recuerdo de palabras raras | 0,8079 |
| TTS | WER medio de lote de vocabulario | 0,1512 |
| TTS | WAV PCM16 mono 24 kHz válidos | 457/457 |
| TTS | Transcripciones vacías en auditoría estricta | 0 |

Todas las puertas configuradas se declaran superadas. La huella SHA-256 de la política de comprensión es `9f73862652e0226ec3f9690f0a783d1c21dc1113285b4dc18d0edd51f2766758`.

## Requisitos de hardware

- Peso del conjunto desplegable: 8,15 GiB (5,24 GiB de lenguaje en Q4_K_M, 1,53 GiB de proyector visión/audio en BF16 y 1,38 GiB de sidecar TTS).
- A esa cifra hay que sumar caché KV, espacios de trabajo del grafo, reservas de CUDA, el sistema operativo y el portal; el autor no extrapola el ajuste en 8 GB a partir del tamaño de fichero.
- Fuentes externas indican que el tronco Ornith-1.5-9B en cuantización de 4 bits cabe en una GPU de 8 GB o en un Mac de 16 GB; esta release, con los tres artefactos, es sensiblemente más pesada que ese escenario aislado.
- El autor menciona un escenario de Jetson de 32 GB sin desalojo, pero condiciona cualquier afirmación a una ejecución de producción medida en ese dispositivo.
- Opciones de despliegue: Ollama (la distribución preferida es la etiqueta `robit/ornith-1.5-omni-audio-bridge:q4km`), más el runtime `qwen-omni-adapters` clonado desde GitHub y arrancado con `./scripts/bootstrap.sh` y `.venv/bin/qwen-omni doctor --deployment`. Ollama estándar ejecuta las rutas de lenguaje, visión de imagen nativa, herramientas y pensamiento; la comprensión de audio y vídeo y la salida de voz requieren el runtime adaptador enlazado.
- No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El runtime soporta decodificación especulativa `ngram-simple` sin pesos, pero el autor recomienda mantenerla bajo control de *benchmark* en el dispositivo objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith 1.5 9B Omni Audio Bridge (esta ficha) | 2.040.866.561 declarados en safetensors; nombre comercial 9B; bridge de 5.246.976 | 256K según fuentes externas para el tronco (no confirmado en la model card) | Texto, visión, audio, ASR, TTS, herramientas | `other`, `mit-and-apache-2.0-components` | GGUF en Ollama y HuggingFace, con 0 descargas y 0 *likes* |
| `ornith-ai/Ornith-1.5-9B` (base) | 9B densos | 256K según fuentes externas | Texto y visión nativa | No disponible en la información proporcionada | Modelo base aguas arriba |
| `Qwen/Qwen3-Omni-30B-A3B-Instruct` | 30B totales, 3B activos (MoE) | No disponible | Texto, visión, audio | No disponible en la información proporcionada | Modelo base aguas arriba, del que solo se reutiliza la torre de audio congelada |
| `cudabenchmarktest/Ornith-1.5-9B-Omni-GGUF` (release hermana) | No disponible | No disponible | Texto, visión, audio, ASR, herramientas | `mixed-mit-and-apache-2` | GGUF en HuggingFace |

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 *likes*, y el autor no es el desarrollador de los componentes base; conviene tratarlo como una release experimental de terceros.
- Los tres ficheros GGUF son una release coordinada y no un único GGUF cargable con una sola arquitectura. El sidecar TTS es un contenedor GGUF con espacios de nombres, no un objetivo `FROM` estándar de Ollama; requiere el runtime enlazado para materializar sus vistas ejecutables.
- La comprensión de audio y vídeo y la salida de voz no funcionan con Ollama estándar.
- El propio autor advierte de que la reducción de tamaño del 74,6 % es una comparación exacta de artefactos o pesos residentes, no un pico de proceso.
- Existe una discrepancia no aclarada entre el nombre comercial (9B) y el recuento de parámetros declarado en safetensors (2.040.866.561).
- Idiomas soportados no disponibles en la ficha; fuentes externas apuntan a un tronco orientado al inglés, por lo que el uso en castellano no está garantizado.
- Riesgo de alucinación: no cuantificado en la información disponible. La puerta de audio reporta 0 afirmaciones visuales desde entrada solo de audio, lo que sugiere control de procedencia, pero no mide alucinación textual general.
- Las métricas de TTS muestran un WER medio de lote de vocabulario de 0,1512 y recuerdo de palabras raras de 0,8079, valores que indican degradación apreciable en vocabulario poco frecuente.
- Licencia compuesta (`mit-and-apache-2.0-components`): antes de redistribuir o desplegar comercialmente hay que revisar los términos de cada componente aguas arriba, incluidos los términos de uso aceptable.
- El modelo nunca supera la puerta Omni Thinker: la model card indica explícitamente que no está incluida.
- Los pesos están publicados en cuantización Q4_K_M, con la pérdida de calidad que ello implica frente a BF16.

## Enlaces

- [Repositorio HuggingFace de la ficha](https://huggingface.co/cudabenchmarktest/Ornith-1.5-9B-Omni-Audio-Bridge-GGUF)
- [Release hermana `cudabenchmarktest/Ornith-1.5-9B-Omni-GGUF`](https://huggingface.co/cudabenchmarktest/Ornith-1.5-9B-Omni-GGUF)
- [Árbol de ficheros de la release hermana](https://huggingface.co/cudabenchmarktest/Ornith-1.5-9B-Omni-GGUF/tree/main)
- [Runtime `qwen-omni-adapters`](https://github.com/robit-man/qwen-omni-adapters)
- [Guía de Atomic Chat: cómo ejecutar Ornith 1.5 9B en local](https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally)
- [Página de modelo de Atomic Chat](https://atomic.chat/models/ornith-1-5-9b)
- [Análisis de MindStudio: resultados en local y brecha de benchmarks](https://www.mindstudio.ai/blog/ornith-1-5-9b-local-test)
- Modelo base: `ornith-ai/Ornith-1.5-9B`
- Modelo base: `Qwen/Qwen3-Omni-30B-A3B-Instruct`
- Modelo base: `Qwen/Qwen3-TTS-12Hz-1.7B-Base`
