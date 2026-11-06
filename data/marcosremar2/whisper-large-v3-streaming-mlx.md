# marcosremar2/whisper-large-v3-streaming-mlx

## Resumen

Whisper large-v3 streaming MLX es una implementación de decodificación en streaming del modelo de reconocimiento automático del habla Whisper large-v3 de OpenAI, adaptada para ejecutarse sobre Apple Silicon mediante la librería MLX. No se trata de un modelo entrenado desde cero ni de un fine-tuning: el repositorio contiene únicamente código y mediciones, y reutiliza los pesos estándar de `mlx-community/whisper-large-v3-mlx-8bit`. El autor es marcosremar2 y lo publica como experimento para el servicio de subtitulado en vivo ucast.me.

La innovación principal es la aplicación de la política AlignAtt, procedente de Simul-Whisper y de ufal SimulStreaming, reimplementada sobre mlx-whisper y ajustada para minimizar la latencia en el hardware de Apple. El resultado declarado es que las palabras aparecen aproximadamente 1 segundo después de ser pronunciadas (mediana) y ninguna supera los 2 segundos en las pruebas realizadas, sin revisión posterior de las palabras ya mostradas.

El modelo resuelve el problema de la transcripción simultánea de baja latencia en equipos de consumo con chip de Apple, un escenario donde las soluciones basadas en LocalAgreement-2 con ventanas de 30 segundos presentaban latencias de 6 a 22 segundos. Es relevante por su enfoque práctico: demuestra que un modelo de 1.550 millones de parámetros puede ofrecer subtitulado casi en tiempo real en un Mac con GPU integrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) con decodificación streaming AlignAtt |
| Parámetros totales | 1.550 millones (large-v3; dato no explicitado en la model card, derivado del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 8 s por defecto (10 s en configuración de calidad); ventana nativa del encoder de 30 s |
| Tipos de cuantización | 8 bits (pesos `whisper-large-v3-mlx-8bit`) |
| Idiomas soportados | Multilingüe; evaluado específicamente en portugués y francés |
| Licencia | MIT |
| Formato de pesos | Pesos MLX (repositorio de código; pesos en `mlx-community/whisper-large-v3-mlx-8bit`) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3, un transformer encoder-decoder entrenado por OpenAI para reconocimiento automático del habla multilingüe. Sobre él, este repositorio implementa una capa de decodificación en streaming que no modifica los pesos. Cada 0,5 segundos de audio nuevo, el búfer crece hasta un máximo de 8 segundos y descarta el audio más antiguo de segundo en segundo, reinyectando las palabras ya mostradas como prompt del decodificador con un límite de tokens de contexto.

La pieza técnica central es AlignAtt: antes de emitir cada token, se consulta la atención cruzada de las cabezas de alineamiento de Whisper para determinar en qué punto del audio está leyendo el modelo. Cuando ese punto se sitúa a menos de 0,3 segundos del final del audio disponible, la decodificación se detiene y espera más entrada. La última palabra se retiene cuando la parada se debe a la atención, y se libera de inmediato si hay un fin de texto seguido de al menos 0,5 segundos de silencio. No hay revisión de palabras, por lo que se elimina la necesidad de esperar a que dos pasadas coincidan como en LocalAgreement.

Entre las optimizaciones destacadas: el encoder se ejecuta solo sobre el audio real redondeado a segundos enteros en lugar de rellenarse a 30 segundos (882 ms frente a unos 200 ms en un M4), se calienta cada longitud de búfer al cargar el modelo (sin ello las primeras pasadas tardaban 4-5 segundos de más), la atención se lee solo sobre fotogramas con audio real, y `finish()` añade 0,5 segundos de silencio antes de la última pasada. No se documenta entrenamiento adicional, RLHF ni DPO; es inferencia sobre pesos preexistentes.

## Capacidades

- Reconocimiento automático del habla en streaming con latencia mediana de aproximadamente 1 segundo por palabra.
- Transcripción simultánea sin revisión posterior de las palabras ya emitidas.
- Soporte multilingüe, con evaluación específica en portugués y francés.
- Gestión de conversaciones con respuestas cortas, nombres propios y frases encadenadas.
- Ejecución local en GPU de Apple Silicon mediante MLX.
- Procesamiento de audio a 16 kHz mono en float32 por fragmentos de aproximadamente 0,5 segundos.
- API programática con `insert_audio`, `process` y `finish` para integración en pipelines propios.
- Herramientas de evaluación incluidas: simulación desde fichero, cálculo de tiempos de referencia, latencia y WER.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Subtitulado en vivo para conferencias y charlas: el modelo emite cada palabra aproximadamente 1 segundo después de pronunciarse, lo que permite mostrar subtítulos sincronizados sin esperar al cierre de la frase, adecuado para eventos presenciales o retransmisiones en un Mac.
- Accesibilidad en reuniones y clases: la transcripción simultánea con latencia máxima inferior a 2 segundos facilita el seguimiento en tiempo real para personas con discapacidad auditiva, ejecutándose localmente sin enviar audio a la nube.
- Atención al cliente con transcripción en directo: la ventana de 8 segundos y el prompt de contexto permiten mantener coherencia en conversaciones con respuestas cortas y nombres propios, útil para generar actas o resúmenes posteriores.
- Documentación clínica o legal dictada: la baja latencia y la ejecución local permiten transcribir dictados en entornos con requisitos de privacidad, manteniendo el audio en el dispositivo.
- Investigación en decodificación streaming: el repositorio incluye scripts de simulación y evaluación de WER y latencia, lo que lo convierte en una base reproducible para comparar políticas como AlignAtt frente a LocalAgreement.
- Prototipado de asistentes de voz: la API de fragmentos permite integrar la transcripción en un bucle de captura de micrófono y alimentar etapas posteriores de comprensión del lenguaje.
- Generación de subtítulos para vídeo pregrabado simulando streaming: el script `simulate.py` reproduce un fichero como si fuera en directo y produce un JSONL con las palabras y sus tiempos.

## Benchmarks y rendimiento

Mediciones sobre Apple M4, 24 GB, macOS, mlx 0.32.4, mlx-whisper 0.4.3, pesos de 8 bits, con carga de máquina 3-4. Audio sintético (Kyutai Pocket TTS): portugués (50 s, 122 palabras) y francés (38 s, 126 palabras), dos ejecuciones por configuración. La latencia se mide como tiempo de visualización menos tiempo de pronunciación según timestamps DTW offline.

| Configuración | Idioma | WER | Mediana | p90 | p99 | Máx. | Palabras > 2 s | Pasada (mediana) |
|---|---|---|---|---|---|---|---|---|
| Por defecto (búfer 8 s, umbral 0,3 s) | pt | 0,0 % / 0,0 % | 1,04 / 0,99 s | 1,38 / 1,31 s | 1,64 / 1,57 s | 1,74 / 1,71 s | 0 % | 370-390 ms |
| Por defecto (búfer 8 s, umbral 0,3 s) | fr | 3,3 % / 3,3 % | 1,17 / 1,01 s | 1,46 / 1,28 s | 1,85 / 1,49 s | 1,97 / 1,56 s | 0 % | 376-483 ms |
| Calidad (búfer 10 s, umbral 0,5 s) | pt | 0,0 % / 0,0 % | 1,25 / 1,21 s | 1,56 / 1,55 s | 1,78 / 1,84 s | 1,94 / 1,89 s | 0 % | 428-438 ms |
| Calidad (búfer 10 s, umbral 0,5 s) | fr | 0,8 % / 2,5 % | 1,24 / 1,25 s | 1,59 / 1,55 s | 1,77 / 1,76 s | 2,10 / 2,11 s | 0,9 % | 452-455 ms |

Evolución de la latencia (misma máquina y audio, mediana / máximo):

| Configuración | Mediana | Máximo |
|---|---|---|
| LocalAgreement-2 (whisper_streaming), ventana 30 s | 6-22 s | 12-40 s |
| AlignAtt con encoder rellenado a 30 s, fragmentos de 1 s | 2,8-2,9 s | 4,6-5,2 s |
| + encoder sobre audio real, búfer 10 s, fragmentos de 0,5 s | 1,5 s | 3,0 s |
| + calentamiento, atención solo sobre audio real, retención solo en parada por atención, 8 bits | 1,3 s | 2,0-2,4 s |
| + umbral 0,3 s, búfer 8 s, corte seguro de búfer (este repositorio) | 1,0 s | 1,6-2,0 s |

## Requisitos de hardware

- VRAM/unified memory estimada: no se publica cifra exacta; las pruebas se realizaron en un Apple M4 con 24 GB de memoria unificada usando pesos de 8 bits.
- GPU recomendadas: Apple Silicon (M4 en las mediciones); no se documentan pruebas en A100, H100 ni RTX 4090, ya que la implementación depende de MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no aplica a GPU discretas de consumo porque MLX no las soporta.
- Opciones de despliegue: MLX y mlx-whisper; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: pasada mediana de 370-390 ms en configuración por defecto, latencia de palabra mediana de aproximadamente 1,0 s y máxima de 1,6-2,0 s en las pruebas citadas.
- Dependencias: `mlx`, `mlx-whisper` y `numpy`, instalables mediante `requirements.txt`.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto de audio | Latencia documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-large-v3-streaming-mlx (este) | 1.550 M (large-v3) | AlignAtt sobre MLX, sin revisión | Búfer 8 s (10 s en calidad) | Mediana ~1,0 s; máx. 1,6-2,0 s | MIT | Hugging Face, código y mediciones |
| whisper_streaming (ufal) | Depende del modelo Whisper | LocalAgreement-2 | Ventana 30 s | Mediana 6-22 s; máx. 12-40 s | no disponible en la información | Repositorio GitHub |
| Simul-Whisper / SimulStreaming (ufal) | Depende del modelo Whisper | AlignAtt | no disponible | no disponible | no disponible | Repositorio GitHub y paper |
| Whisper large-v3 (OpenAI) | 1.550 M | Decodificación offline | 30 s | No streaming (no aplica) | MIT (según modelo base) | Hugging Face, referencia |

## Limitaciones y advertencias

- Las mediciones se realizaron con voz sintética (Kyutai Pocket TTS) en portugués y francés, no con habla real ni con acentos diversos; la generalización a otros idiomas y condiciones acústicas no está documentada.
- El WER en francés con configuración por defecto fue del 3,3 %, con errores como "entiers" por "en entier", una "où" adicional y "madame" escrito "Mme"; en configuración de calidad se observó hasta un 2,5 % en una ejecución y un 0,9 % de palabras por encima de 2 segundos.
- Las palabras nunca se revisan una vez mostradas, por lo que un error de decodificación temprano persiste en la salida.
- large-v3-turbo no es compatible con esta política: cae en bucles de repetición ("Claro. Claro. Claro…") con WER superior al 100 %, según el autor.
- Dependencia exclusiva de Apple Silicon y MLX; no hay soporte documentado para CUDA, ROCm ni CPU genérica.
- La ventana de contexto de audio es corta (8-10 s), lo que puede afectar a la coherencia en discursos con frases muy largas o referencias lejanas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción más allá del servicio ucast.me del propio autor.
- Licencia MIT, que permite uso comercial, pero los pesos subyacentes provienen de OpenAI Whisper large-v3 y de `mlx-community`; conviene verificar las condiciones de esos repositorios.
- No se documentan sesgos específicos del modelo ni evaluaciones de robustez frente a ruido, solapamiento de hablantes o audio de baja calidad.

## Enlaces

- Hugging Face: https://huggingface.co/marcosremar2/whisper-large-v3-streaming-mlx
- Pesos base en MLX: https://huggingface.co/mlx-community/whisper-large-v3-mlx-8bit
- Paper Simul-Whisper: https://arxiv.org/abs/2406.10052
- Repositorio ufal SimulStreaming: https://github.com/ufal/SimulStreaming
- Repositorio ufal whisper_streaming: https://github.com/ufal/whisper_streaming
- mlx-whisper (mlx-examples): https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Servicio del autor: https://ucast.me
- Papers adicionales citados en los tags: https://arxiv.org/abs/2507.10860 y https://arxiv.org/abs/2508.12301
