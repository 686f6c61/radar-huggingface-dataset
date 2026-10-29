# FluidInference/nemotron-3.5-transcribe-lite-coreml

## Resumen

Nemotron 3.5 Transcribe Lite es un port comunitario, no oficial, del modelo de reconocimiento de voz NVIDIA Nemotron 3.5 Transcribe 30B-A4B, publicado por FluidInference para Apple Silicon. No se distribuye el modelo completo: se ha eliminado el LLM MoE de 30B del modelo base y solo se conservan las partes acústicas, el codificador ASR de aproximadamente 600 M de parámetros y la cabeza CTC de timestamps, convertidas a Core ML y Core AI. El autor advierte explícitamente de que no está afiliado ni respaldado por NVIDIA ni por Apple, y de que "Lite" es una denominación propia de este montaje, no un modelo de NVIDIA.

El paquete resuelve la transcripción on-device en macOS con dos capacidades que suelen requerir infraestructura de servidor: timestamps a nivel de palabra con resolución de 40 ms (la cabeza CTC devuelve un token cada 40 ms) y etiquetado de hablante, este último delegado a un diarizador separado que FluidAudio descarga desde otro repositorio. La arquitectura resultante es un codificador transformer NeMo más una cabeza CTC greedy que, en el modelo original, servía como alineador temporal de la salida del LLM.

Su relevancia actual es de nicho pero concreta: permite ejecutar ASR en el GPU y el Neural Engine de un Mac sin conexión ni envío de audio a terceros. El autor reporta que una reunión de 49,5 minutos con tres personas se transcribe con etiquetas de hablante y marcas de tiempo en unos 6 segundos con los modelos precargados y calientes en un MacBook Pro M5 Pro, aproximadamente 500 veces el tiempo real. El precio es una transcripción notablemente más basta que la del modelo completo, porque no hay LLM que puntúe, normalice ni corrija la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer NeMo (~600 M) + cabeza CTC, empaquetados como Core ML / Core AI; el LLM MoE del modelo base se ha eliminado |
| Parametros totales | no disponible (el codificador ronda los 600 M; la cabeza CTC no publica recuento de parametros) |
| Parametros activos | no aplica: el LLM MoE A4B del modelo base no forma parte de este port |
| Longitud de contexto | ventana de audio de 30 s en los modelos unificados; 48 s en la variante w48 (nucleo de 40 s con 4 s de contexto a cada lado); entrada de 4800 tramas mel en w48 y 3000 en el resto |
| Tipos de cuantizacion | fp16 (por defecto en todos los ML Program), int8 lineal simetrico por canal y 4 bits palettizado (k-means, grupos de 16) |
| Idiomas soportados | ingles (en) |
| Licencia | openmdw-1.1 |
| Formato de pesos | Core ML (.mlpackage y .mlmodelc compilado) y Core AI (.aimodel); assets auxiliares en .npz, .bin float32 LE, SentencePiece .model y .json |

## Arquitectura y entrenamiento

El modelo es un codificador transformer de estilo NeMo, de unos 600 M de parámetros, seguido de una cabeza CTC con proyección de salida de 23.863 x 1280 y un vocabulario SentencePiece de 23.862 piezas (el indice 23862 queda reservado para el blank). Los pesos del codificador son los de NVIDIA sin modificar más allá de la conversión de formato. La cabeza CTC fue entrenada por NVIDIA como alineador de timestamps de la salida del LLM del modelo base; aquí se reutiliza directamente como reconocedor CTC greedy, un uso distinto para el que fue concebida.

El diseño de ventana sigue el esquema long-form de NeMo: ventanas de 48 s compuestas por un núcleo de 40 s más 4 s de contexto por cada lado, de las que la demo conserva únicamente las tramas del núcleo. El frontend mel es el del checkpoint original (ventana de 400 muestras y filterbank de 128 x 257), distribuido en `assets/frontend.npz` y en crudo como float32 little-endian para poder reimplementar el preprocesado sin PyTorch. La demo de reuniones está escrita en NumPy puro sobre coremltools, sin dependencia de PyTorch.

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovación de decodificación propia: el pipeline es mel, codificador, CTC greedy y, en paralelo, el diarizador en el Neural Engine.

## Capacidades

- Reconocimiento de voz en inglés con decodificación CTC greedy sobre tramas mel de 16 kHz.
- Marcas de tiempo a nivel de palabra con granularidad de 40 ms, derivadas de un token por cada 40 ms de audio.
- Puntuación de confianza por token mediante la salida `token_logprob`, útil para filtrado y para detectar tramos dudosos.
- Diarización de hablantes delegada a Nemotron-3-Diarization, que no está en este repositorio y se descarga como port Core ML aparte desde FluidInference.
- Procesamiento por ventanas deslizantes con contexto de 4 s, lo que permite transcripciones de audio largo sin recortes arbitrarios.
- Ejecución on-device en Apple Silicon repartiendo codificador y cabeza CTC en GPU y diarizador en Neural Engine de forma simultánea.
- No incluye tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio generation.
- No incluye puntuación, mayúsculas ni normalización textual: esas tareas las hacía el LLM del modelo base, que aquí no existe.
- No soporta otros idiomas distintos del inglés según la model card.

## Casos de uso

- Transcripción de reuniones on-device: la demo `demo/lite_meeting.py` procesa un WAV de 16 kHz y emite un transcriptor con etiquetas `<spk:N>` y tiempos de inicio por palabra, lo que permite generar actas con atribución de intervenciones sin que el audio salga del portátil.
- Subtitulado y postproducción: los timestamps de 40 ms por palabra son suficientemente finos para generar ficheros de subtítulos con sincronización ajustada en flujos de edición que luego se revisan manualmente.
- Indexación y búsqueda local de archivos de audio: al ejecutarse sobre GPU y Neural Engine de un Mac, se puede transcribir una biblioteca de grabaciones y construir un índice de texto sin depender de APIs externas, algo relevante para material confidencial.
- Investigación cualitativa y entrevistas: entrevistas semiestructuradas de una o varias personas se transcriben con separación de hablantes, lo que reduce el trabajo de segmentación previa en estudios con decenas de horas de material.
- Preprocesado en pipelines con LLM posterior: la salida CTC con marcas de tiempo y log-probabilidades sirve como entrada a un modelo de lenguaje aparte que añada puntuación, corrección o resumen, separando la parte acústica de la parte lingüística.
- Transcripción por streaming de baja latencia: la variante de 30 s con ventana deslizante y el rendimiento de aproximadamente 500x tiempo real permiten procesar en continuo con un retardo acotado por la ventana configurada.
- Aplicaciones de accesibilidad en macOS: dictado y subtitulado en vivo dentro de apps nativas distribuidas como `.mlmodelc` para FluidAudio en Swift, sin requisito de conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER ni comparaciones con otros sistemas de ASR; solo menciona que el repositorio incluye scripts de evaluación sobre LibriSpeech, sin resultados.

El autor sí reporta una medición de throughput, que se reproduce a continuación como dato de rendimiento de ingeniería y no como benchmark de precisión:

| Metrica | Valor | Condiciones |
|---|---|---|
| Audio procesado | 49,5 min, reunion de 3 personas | M5 Pro MacBook Pro |
| Tiempo de transcripcion | ~6 s | Modelos precargados y calientes |
| Factor de tiempo real | ~500x | Codificador y CTC en GPU, diarizador en Neural Engine en paralelo |
| Resolucion de timestamps | 40 ms por token | CTC head, vocabulario de 23.862 piezas |
| Compilacion del diarizador en Neural Engine | ~80 s, una sola vez | No incluida en la cifra de 6 s |
| Carga y warm-up de modelos | no cuantificado en la model card | Excluido de la cifra de 6 s |

## Requisitos de hardware

- Plataforma exclusiva Apple Silicon. Los modelos son ML Programs fp16 que requieren macOS 15 o superior; la variante Core AI (`coreai/lite_ctc_gpu.aimodel`) es beta y exige macOS 26 o superior.
- No hay soporte para GPU NVIDIA, AMD ni para CUDA/ROCm: al ser Core ML, el despliegue queda atado al ecosistema Apple.
- Huella en disco según variante: 1,36 GB para `lite_ctc_fp16`, 683 MB para `lite_ctc_w8` (int8), 389 MB para `lite_ctc_p4` (4 bits palettizado) y 1,36 GB para el `.aimodel`. La variante w48 usada en la demo son 1,26 GB de codificador más 101 MB de cabeza CTC.
- Repositorio completo: 5,2 GB. La descarga selectiva para la demo baja aproximadamente 1,4 GB con los `--include` indicados en la model card.
- El diarizador se descarga aparte en el primer uso y ocupa unos 200 MB adicionales.
- Memoria unificada: la model card no publica cifras de VRAM ni de RAM necesaria. A modo de referencia de orden de magnitud, los pesos de la variante fp16 de 1,36 GB deben caber en memoria unificada junto con el estado intermedio `states` (1, 1280, 600) en fp16.
- Opciones de despliegue: FluidAudio en Swift (soporte en el PR #1069, identificador `nemotron35-transcribe`), demo en Python con coremltools 9.0 y NumPy, y `coreai-torch` para la variante Core AI.
- Python 3.10 a 3.13 para la demo: coremltools 9.0 no tiene wheel para Python 3.14.
- Latencia y throughput: aproximadamente 500x tiempo real en un M5 Pro con los modelos calientes, según el autor. No hay mediciones publicadas para otros chips de la gama M.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este port (Nemotron 3.5 Transcribe Lite Core ML) | ~600 M (codificador) + cabeza CTC | 30 s, o 48 s en w48 | en | openmdw-1.1 | Core ML / Core AI, solo Apple Silicon |
| nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B (base) | 30B totales, ~4B activos (MoE) | no disponible | no disponible | no disponible en la informacion | Servidor GPU |
| nvidia/Nemotron-3-Diarization (complementario) | no disponible | no disponible | no disponible | no disponible | Core ML via port de FluidInference |
| NVIDIA Parakeet TDT 0.6B (referencia de la misma familia de tamano) | ~600 M | audio largo en una pasada | en | CC-BY-4.0 | NeMo, GPU |
| Whisper large-v3 via WhisperKit (referencia Core ML) | ~1550 M | 30 s | multilingue | MIT | Core ML, Apple Silicon |

Las filas de Parakeet y Whisper proceden de la documentación pública de esos proyectos y no de la información proporcionada en esta búsqueda; se incluyen solo como referencia de categoría. La comparación relevante es con el modelo base: este port sacrifica el LLM de 30B a cambio de ejecución local, y el propio autor advierte de que la transcripción resultante es mucho más basta.

## Limitaciones y advertencias

- No es el modelo completo. Sin el LLM, la salida no lleva puntuación, mayúsculas ni normalización, y la calidad de transcripción es notablemente inferior a la del modelo base.
- Uso de la cabeza CTC fuera de su propósito original: NVIDIA la entrenó como alineador temporal de la salida del LLM y aquí se emplea como reconocedor greedy, lo que puede degradar la precisión respecto a una decodificación pensada para ese fin.
- Solo inglés. La model card declara `language: en`; no hay soporte multilingüe.
- Solo Apple Silicon y macOS 15 o superior, con macOS 26 para la ruta Core AI en beta. No es desplegable en servidores Linux con GPU, lo que descarta su uso en backend convencional.
- Port no oficial: no está afiliado ni respaldado por NVIDIA ni por Apple, y no hay garantía de mantenimiento. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, es decir, sin validación comunitaria.
- Licencia openmdw-1.1: hay que revisar los términos concretos antes de un uso comercial, especialmente por lo que respecta a la redistribución de pesos derivados del modelo de NVIDIA.
- La cuantización a 4 bits palettizado (389 MB) puede degradar la precisión frente a fp16; la model card no publica comparativas de WER entre variantes.
- El diarizador no está incluido. Sin descargar `FluidInference/nemotron-3-diarization-coreml`, no hay etiquetado de hablante, y su primera compilación en el Neural Engine añade unos 80 s.
- Riesgo de alucinación y de errores en tramos con ruido, música, solapamiento de voces o silencios largos, inherente a la decodificación CTC greedy sin un modelo de lenguaje que corrija.
- El repositorio no incluye evaluador de reuniones AMI, solo scripts de evaluación sobre LibriSpeech, por lo que no hay una métrica publicada de calidad en audio conversacional real.
- No dispone de tool calling, agentes ni capacidades multimodales; cualquier flujo que las necesite debe añadir un LLM externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/nemotron-3.5-transcribe-lite-coreml
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Modelo de diarizacion: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Port Core ML del diarizador: https://huggingface.co/FluidInference/nemotron-3-diarization-coreml
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- Soporte en FluidAudio (PR #1069): https://github.com/FluidInference/FluidAudio/pull/1069
