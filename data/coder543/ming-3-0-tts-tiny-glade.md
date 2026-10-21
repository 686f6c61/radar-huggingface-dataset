# coder543/ming-3.0-tts-tiny-glade

## Resumen

Ming 3.0 TTS Tiny for Glade es una conversión híbrida del modelo de síntesis de voz inclusionAI/Ming-3.0-tts-tiny, publicada por el usuario coder543. No se trata de un modelo nuevo ni de un reentrenamiento: es un empaquetado de inferencia que reorganiza el checkpoint original para ejecutarse en Apple Silicon, combinando una red de lenguaje de mezcla de expertos (MoE) de 7,9 mil millones de parámetros ejecutada mediante Swift MLX en la GPU, con grafos de Core AI para la agregación de audio, la inferencia de flujo y el AudioVAE, que se ejecutan en el Neural Engine.

El checkpoint completo contiene 8.980.997.932 parámetros aprendidos antes de la cuantización, excluyendo buffers registrados y el codificador de hablante CAMP+, que se distribuye por separado. A pesar del sufijo "tiny" en el nombre, es un modelo grande: la conversión está cualificada en un MacBook Air M3 con 16 GB de memoria unificada. Genera audio mono a 44,1 kHz y cubre siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés.

Su relevancia es acotada pero clara: demuestra que un backbone TTS MoE de casi 9B parámetros puede ejecutarse en un portátil Apple Silicon doméstico, a costa de un rendimiento inferior al tiempo real (RTFx mediano de 0,451×) y de una dependencia estricta de macOS 27 o iOS 27. La licencia MIT del repositorio facilita su uso comercial, aunque las condiciones del modelo base deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas de lenguaje que alternan 3 capas Kimi Delta Attention (KDA) con 1 capa de multi-latent attention (MLA); feed-forward de mezcla de expertos en las capas posteriores a la primera |
| Parametros totales | 8.980.997.932 parámetros aprendidos antes de cuantización (backbone de lenguaje de 7,9B); excluye buffers registrados y el codificador de hablante CAMP+ |
| Parametros activos | No disponible el número exacto; el enrutamiento selecciona 8 de 128 expertos enrutados por capa más un experto compartido, con la primera capa feed-forward densa |
| Longitud de contexto | 4.096 posiciones compartidas entre el prompt y las posiciones generadas |
| Tipos de cuantizacion | Expertos enrutados en 4 bits afín con grupos de 64; resto de matrices aprendidas en BF16; estado recurrente, pesos del router y parámetros de decay en FP32; grafos de audio con pesos INT8 y activaciones FP16 |
| Idiomas soportados | Chino, inglés, alemán, español, francés, coreano y japonés (siete controles de idioma) |
| Licencia | MIT |
| Formato de pesos | Pesos de lenguaje MLX con mapeo de memoria (`language/`), grafos Core AI para flujo, agregación y AudioVAE (`audio/`) y pesos CAMP+ con descripción de red MLX nativa (`speaker/`); no se distribuye en GGUF ni safetensors estándar de PyTorch |

## Arquitectura y entrenamiento

El backbone de lenguaje consta de 24 capas que alternan tres capas de Kimi Delta Attention con una capa de multi-latent attention, es decir, una combinación de atención lineal con estado recurrente y atención latente clásica. La primera capa feed-forward es densa y las siguientes son de mezcla de expertos: cada token selecciona 8 de 128 expertos enrutados y suma la salida de un experto compartido. El modelo consume estados ocultos finales para producir latentes acústicos, por lo que la cabeza de vocabulario no se incluye en la conversión. La generación emite entre 13 y 250 latentes a 12,5 Hz mediante el bucle de generación con desplazamiento terminal heredado del modelo original, y la síntesis de waveform corre a cargo de un AudioVAE y grafos de flujo en Core AI.

El autor indica explícitamente que no se aplica entrenamiento adicional: la conversión es puramente de representación y runtime. La cuantización afecta solo a los expertos enrutados (4 bits, grupos de 64); el resto de matrices conservan BF16 y los estados recurrentes, el router y los parámetros de decay se mantienen en FP32. El muestreo usa diez pasos Euler EPSS con guía `unconditional + 2 * (conditional - unconditional)`, sigma 0,25, temperatura 0 y sway -1, con ruido y estado en FP32 y límites de redondeo BF16 reproducidos en velocidad, guía e incrementos de tiempo. Los controles numéricos reportados muestran diferencias de RMS en la condición final retenida de entre 3,31 % y 12,42 % respecto al código original en los pasos y particiones de prefill examinados, atribuidas en parte a la amplificación de pequeñas diferencias aritméticas por el enrutamiento discreto de expertos. No se detalla en la información disponible la composición del dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto plano en siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés.
- Salida de audio mono a 44,1 kHz con lautterance completa del modelo original, preservando su silencio.
- Presets integrados de chino e inglés (`US_James` entre ellos) que no requieren grabación de referencia.
- Síntesis con prompt que requiere audio de referencia y su transcripción correspondiente.
- Controles de solo hablante, diseño de voz, instrucciones libres, habla paralingüística y guiones multi-hablante ordenados, con contratos de tarea heredados del modelo original.
- Interfaz de sesión TTS ordenada y API de producto opcional `GladeMingTiny` (`MingTinyModelBundle` y `MingTinySynthesizer`), invocable desde Swift sin dependencia de Python en la aplicación.
- Ejecución por fases con liberación de pesos de lenguaje antes del renderizado de waveform, o ejecución residente en memoria.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Síntesis de narración en aplicaciones macOS nativas: el bundle se integra vía `MingTinySynthesizer` en una app Swift y produce un WAV completo por petición, adecuado para audiolibros cortos, avisos o contenido pregrabado donde no se requiere streaming.
- Doblaje y localización a siete idiomas: el control de idioma permite generar la misma locución en chino, inglés, alemán, español, francés, coreano y japonés desde un único checkpoint, simplificando pipelines de localización de vídeo o e-learning por lotes.
- Clonación de voz controlada en producción: con el modo prompted, el sistema acepta audio de referencia más su transcripción para reproducir el timbre de un locutor concreto, útil para mantener consistencia de marca en campañas de audio.
- Diseño de voces para personajes: los controles de voice design e instrucciones libres permiten generar voces sintéticas nuevas sin grabación previa, aplicable a videojuegos y prototipos de asistentes.
- Generación de guiones multi-hablante: el contrato de tareas ordenadas con varios hablantes sirve para producir diálogos completos de pódcast o material formativo en una sola sesión.
- Pruebas de accesibilidad y lectura de pantalla offline: al ejecutarse en local sobre Apple Silicon sin depender de servicios en la nube, encaja en herramientas de lectura para usuarios con discapacidad visual que requieran privacidad del texto.
- Investigación en TTS sobre hardware de consumo: sirve como banco de pruebas para estudiar el comportamiento de un MoE de 7,9B en inferencia cuantizada a 4 bits sobre Neural Engine y GPU integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de síntesis de voz. La única medición cuantitativa aportada es el rendimiento en un MacBook Air M3 de 16 GB con macOS 27.0.1, runtime Glade en Release, voz `US_James`, semilla 1234 y ejecución por fases, sobre el texto "Sunlight pours through the trees. A gentle breeze moves across the clearing. Welcome to Glade.":

| Pasada | Audio generado | Tiempo de generacion | RTFx |
|---|---:|---:|---:|
| 1 | 6,72 s | 14,895 s | 0,451× |
| 2 | 6,72 s | 18,717 s | 0,359× |
| 3 | 6,72 s | 13,535 s | 0,497× |
| Mediana | 6,72 s | 14,895 s | 0,451× |

Como control de calidad, el autor reporta que Cohere Transcribe recupera todas las palabras del texto de origen en la salida corta en inglés nativo, y que ejecuciones repetidas producen PCM idéntico (por lo que cuentan como una sola comprobación de audio distinta). Un trazado de hardware independiente confirma prefill y decode de lenguaje en GPU y ejecución en ANE de las 840 llamadas de flujo, 83 de agregación y 22 del decodificador de waveform, sin intervalos de GPU dentro de esos ámbitos.

## Requisitos de hardware

- Plataforma obligatoria Apple Silicon: el runtime MLX más Core AI requiere macOS 27 o iOS 27; no hay soporte CUDA ni ROCm.
- Memoria unificada: cualificado en un MacBook Air M3 con 16 GB. El archivo de lenguaje mapeado ocupa 5,8 GB (decimal) y MLX reporta picos de 5,9 GB activos y 0,9 GB en caché, medidos por separado y no sumables como pico simultáneo.
- El ledger de huella física del proceso más el Neural Engine sin huella alcanza 1,4 GB, pero el autor advierte que no cubre el requisito completo de memoria del modelo mapeado en GPU.
- La ejecución en iPhone y el ajuste de memoria en ese dispositivo no están cualificados según la model card.
- VRAM estimada en GPUs dedicadas: no disponible; el modelo no está empaquetado para CUDA.
- Opciones de despliegue: runtime Glade con el comando `glade tts`, o la API Swift `GladeMingTiny` (`MingTinyModelBundle`, `MingTinySynthesizer`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTFx mediano de 0,451× (14,895 s para 6,72 s de audio), con variación entre 0,359× y 0,497× en tres pasadas medidas.
- El mapeo de memoria permite al sistema operativo gestionar páginas respaldadas por archivo, pero no elimina el conjunto de trabajo del modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coder543/ming-3.0-tts-tiny-glade | 8,98B (backbone 7,9B), expertos en 4 bits | 4.096 posiciones | RTFx 0,451× en M3 de 16 GB | MIT | Hugging Face, runtime Glade para Apple Silicon |
| inclusionAI/Ming-3.0-tts-tiny (modelo base) | 8,98B, pesos sin cuantizar | 4.096 posiciones (heredado) | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face |
| Otras alternativas TTS de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible solo permite comparar la conversión con su modelo base: misma arquitectura, mismo presupuesto de contexto y mismo contrato de tareas, con la diferencia de la cuantización 4 bits de los expertos y el empaquetado para MLX y Core AI. No se han proporcionado datos de otros modelos TTS comparables (parametrazación, contexto, calidad o licencia), por lo que no se incluyen cifras que no puedan verificarse.

## Limitaciones y advertencias

- Rendimiento inferior al tiempo real en el hardware cualificado (RTFx mediano 0,451×), lo que descarta su uso en conversación interactiva de baja latencia sobre un MacBook Air M3.
- Entrega por petición completa: el orden en línea despacha peticiones terminadas y no transmite tramas latentes sin finalizar, por lo que no hay streaming parcial de audio.
- Una utterance que alcanza el tope de latentes se reporta como "runout" en la interfaz común en lugar de presentarse como habla completa.
- El modo prompted exige audio de referencia y su transcripción exacta; el repositorio no incluye ninguna grabación de voz.
- Solo hay presets integrados sin referencia para chino e inglés; el resto de idiomas depende de los contratos de tarea del modelo original.
- Dependencia estricta de macOS 27 o iOS 27 para Core AI; el autor no cualifica la ejecución en iPhone ni el ajuste de memoria en ese dispositivo.
- Divergencia numérica respecto al código original con diferencias de RMS de 3,31 % a 12,42 % en la condición final; el propio autor advierte que el RMS interno no es una puntuación perceptiva de calidad de voz.
- El enrutamiento discreto de expertos puede amplificar pequeñas diferencias aritméticas, con impacto potencial en la consistencia de la salida.
- La validación con reconocimiento automático se limita a una salida corta en inglés nativo; no hay verificación publicada para el resto de idiomas.
- La licencia MIT cubre este repositorio, pero no se detallan en la información disponible las condiciones del modelo base inclusionAI/Ming-3.0-tts-tiny ni del codificador CAMP+, que conviene revisar antes de un uso comercial.
- Riesgo de sesgos y de alucinación acústica (pronunciación incorrecta, prosodia anómala) no cuantificado en la documentación aportada; no hay evaluación de sesgos por idioma, acento o género.
- La conversión no ha sido reentrenada: cualquier limitación del modelo original en cobertura léxica o calidad de voz se hereda íntegramente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coder543/ming-3.0-tts-tiny-glade
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relación con el contenido técnico de esta ficha y se omiten.
