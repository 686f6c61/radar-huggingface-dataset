# aystream/GigaAM-VAD-mlx

## Resumen

GigaAM-VAD-mlx es un port a Apple MLX del modelo de deteccion de actividad de voz (VAD) oficial de GigaAM, publicado por el usuario aystream. Se trata de un Conformer de 5 capas y 1,33 millones de parametros (unos 5,3 MB de pesos) cuyo unico proposito es segmentar audio en tramos de habla y silencio, produciendo probabilidades a 25 Hz (pasos de 40 ms) y marcas temporales de inicio y fin de locucion. Su interes radica en que elimina por completo la dependencia del runtime de PyTorch, lo que permite ejecutar el modelo de forma nativa sobre Apple Silicon con el framework MLX.

El modelo reproduce fielmente el comportamiento del GigaAM VAD original de Salute Developers (Sber), con una paridad numerica declarada de `max |Δprob| < 1e-4` frente a la implementacion en PyTorch y marcas temporales identicas. En una M2 Max en FP32 procesa 22 minutos de audio (1319,4 segundos) en aproximadamente 0,26 segundos, lo que lo hace adecuado para preprocesar grandes volumenes de grabaciones antes de pasarlas a un sistema ASR.

Es relevante ahora porque cubre un hueco concreto: la mayoria de pipelines de reconocimiento de voz dependen de PyTorch para tareas auxiliares como el VAD, y este port permite montar cadenas de audio completas en MLX sobre macOS sin arrastrar ese stack. La licencia MIT, heredada del modelo original, facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (5 capas, `d_model=128`, `n_heads=4`, `ff_expansion_factor=2`, `conv_kernel_size=15`, subsampling Conv1d 4x, RoPE `base=10000`) |
| Parametros totales | 1,33 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas independientes de 10 s de audio |
| Tipos de cuantizacion | no disponible (la model card solo documenta ejecucion en FP32) |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | pesos MLX (repositorio de 0,0 GB segun Hugging Face; ~5,3 MB de pesos) |

## Arquitectura y entrenamiento

El modelo es un Conformer de 5 capas orientado exclusivamente a clasificacion binaria de habla por trama. Internamente usa `d_model=128` con 4 cabezas de atencion, factor de expansion de feed-forward de 2, kernel de convolucion de 15 y un subsampling de cuatro capas Conv1d. La atencion emplea embeddings rotatorios (RoPE) con base 10000. El audio se procesa en ventanas independientes de 10 segundos, lo que acota el coste de atencion y facilita el procesamiento en streaming por bloques.

La salida son probabilidades de habla a 25 Hz (un paso cada 40 ms), a partir de las cuales la libreria `gigaam-mlx` deriva intervalos de habla mediante `speech_timestamps`. No se dispone de informacion sobre el dataset de entrenamiento, el numero de horas de audio, la composicion linguistica ni si se aplicaron tecnicas de aumento de datos o ajuste fino; la model card se limita a describir la arquitectura y a remitir al paper original (arXiv:2506.01192) y al repositorio de Salute Developers. La innovacion tecnica destacable no esta en el entrenamiento sino en la reimplementacion: un port puro a MLX con paridad numerica verificada frente a PyTorch y sin dependencia alguna del ecosistema de Meta.

## Capacidades

- Deteccion de actividad de voz con salida de probabilidad por trama a 25 Hz (pasos de 40 ms).
- Extraccion de marcas temporales de inicio y fin de habla (`speech_timestamps`).
- Segmentacion directa del audio en tramos de habla (`segment_audio_vad`).
- Integracion automatica como preprocesador del pipeline ASR del propio paquete (`transcribe(..., vad=True)`).
- Uso como CLI sobre ficheros de audio y video (`gigaam-mlx recording.mkv --vad`).
- Ejecucion nativa en Apple Silicon mediante MLX, sin runtime de PyTorch.
- Soporte de audio en ruso e ingles segun los metadatos del modelo.
- No dispone de generacion de texto, razonamiento, codigo, vision, tool calling ni modo de pensamiento; es un modelo puramente acustico de clasificacion.

## Casos de uso

- Preprocesado de reuniones y entrevistas largas: el modelo procesa 22 minutos de audio en unos 0,26 s en una M2 Max, de modo que se puede aplicar a horas de grabacion antes de pasarlas al ASR y evitar transcribir silencios, reduciendo coste y latencia del pipeline posterior.
- Transcripcion automatica con VAD integrado: mediante `transcribe(model, tokenizer, "meeting.wav", vad=True)` se encadena la deteccion de habla con el reconocimiento, de forma que el ASR solo recibe tramos con voz y disminuye el riesgo de alucinaciones sobre silencio o ruido.
- Segmentacion de corpus para anotacion: `speech_timestamps` genera intervalos listos para alimentar herramientas de etiquetado o para trocear audios en clips de duracion homogenea.
- Filtrado de llamadas en centros de contacto: al ser un modelo de 1,33 M de parametros y ~5,3 MB, se puede ejecutar en local sobre un Mac para descartar audios sin habla antes de enviarlos a servicios en la nube, lo que ayuda con requisitos de privacidad.
- Aplicaciones de dictado y asistentes de voz en macOS: el modelo corre en MLX sin PyTorch, lo que simplifica el empaquetado de una app nativa que necesita saber cuando el usuario habla.
- Investigacion en procesamiento de audio: su tamano minimo y su paridad con la implementacion de referencia lo hacen util como baseline reproducible de VAD en experimentos comparativos.
- Procesamiento por lotes en pipelines de datos: el CLI `gigaam-mlx recording.mkv --vad` permite encadenar la segmentacion en scripts de preprocesado masivo sin escribir codigo Python.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks academicos (MMLU, HumanEval, GSM8K y similares no aplican a un VAD). Los unicos datos de rendimiento disponibles son los siguientes:

| Metrica | Valor |
|---|---|
| Velocidad (M2 Max, FP32) | 1319,4 s de audio procesados en ~0,26 s |
| Paridad con PyTorch (probabilidad) | `max |Δprob| < 1e-4` |
| Paridad con PyTorch (marcas temporales) | identicas a `gigaam.load_model("vad")` |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de estas cifras de velocidad y paridad.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; al ejecutarse en MLX sobre Apple Silicon, el modelo usa memoria unificada. Con 1,33 M de parametros y ~5,3 MB de pesos, el consumo es negligible incluso en FP32.
- GPU recomendadas: cualquier chip de Apple Silicon con soporte MLX (serie M1 en adelante). El dato de rendimiento publicado corresponde a una M2 Max.
- Cabe holgadamente en cualquier Mac con Apple Silicon, incluidos modelos de gama baja con 8 GB de memoria unificada.
- Opciones de despliegue: paquete `gigaam-mlx` (instalable via `pip install -U git+https://github.com/aystream/gigaam-mlx.git`), con API Python (`load_vad_model`, `speech_probs`, `speech_timestamps`, `segment_audio_vad`) y CLI (`gigaam-mlx`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: ~0,26 s para 1319,4 s de audio en M2 Max en FP32, es decir, mas de 5000x tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Notas |
|---|---|---|---|---|
| GigaAM-VAD-mlx (este) | 1,33 M | ventanas de 10 s | MIT | Port MLX, sin PyTorch, paridad verificada con el original |
| GigaAM VAD original (Salute Developers) | 1,33 M | ventanas de 10 s | MIT | Implementacion de referencia en PyTorch |
| Silero VAD | no disponible | no disponible | no disponible | Referencia habitual de VAD ligero; no se dispone de datos comparativos en la informacion proporcionada |
| WebRTC VAD | no disponible | tramas cortas | no disponible | VAD clasico basado en energia/espectro; no comparable en precision |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se documentan el ruso y el ingles; el rendimiento en otros idiomas no esta caracterizado.
- Es un modelo exclusivamente de VAD: no transcribe, no traduce y no genera texto. Cualquier expectativa de ASR debe cubrirse con el modelo CTC del mismo paquete.
- No se publican datos sobre el dataset de entrenamiento, lo que impide evaluar sesgos acusticos por dominio, canal o acento.
- El procesamiento por ventanas independientes de 10 s puede producir discontinuidades en las fronteras entre ventanas en grabaciones muy largas; conviene validar los intervalos generados en el caso de uso concreto.
- La licencia MIT permite uso comercial, pero se hereda del modelo original de Salute Developers; conviene revisar las condiciones del repositorio upstream por si hubiera terminos adicionales.
- El rendimiento publicado corresponde a una M2 Max en FP32; en chips inferiores el throughput sera menor, aunque el modelo es lo bastante pequeno para que la diferencia sea poco relevante.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB en Hugging Face; conviene verificar la integridad de los pesos antes de usarlo en produccion.
- Al ser un port comunitario no oficial, las actualizaciones y el mantenimiento dependen de un unico autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aystream/GigaAM-VAD-mlx
- Implementacion MLX y CLI: https://github.com/aystream/gigaam-mlx
- Modelo original y repositorio upstream: https://github.com/salute-developers/GigaAM
- Paper: https://arxiv.org/abs/2506.01192
