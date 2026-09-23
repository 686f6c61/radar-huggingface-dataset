# mrfakename/MuVAE

## Resumen

MuVAE es un autoencoder variational (VAE) convolucional continuo para audio musical estéreo a 48 kHz, publicado por el desarrollador mrfakename en HuggingFace. No es un modelo generativo de texto ni un modelo de lenguaje: su funcion es actuar como codec latente, es decir, comprimir una forma de onda a una representacion latente de 64 canales a 25 fotogramas por segundo (un factor de compresion de 1920×) y reconstruirla de vuelta al dominio temporal. Esto lo convierte en la pieza de espacio latente que necesitan los modelos de generacion musical basados en difusion o transformers sobre latentes.

El modelo se entreno desde cero sobre la arquitectura del VAE de YuE2/Oobleck, con 132.616.130 parametros en FP32 (66,2 M en el encoder y 66,4 M en el decoder). Los pesos liberados corresponden a la media exponencial (EMA) del entrenamiento. La arquitectura emplea activaciones SnakeBeta, canales 64 × (1, 2, 4, 8, 16, 32) y strides (2, 2, 4, 4, 5, 6), con decodificacion por tiles que permite procesar canciones completas con memoria acotada.

Su relevancia es doble: por un lado, ofrece un espacio latente de alta fidelidad para pipelines de generacion musical; por otro, su licencia CC-BY-4.0 y su integracion directa con `transformers` facilitan su reutilizacion en investigacion. La adopcion en el momento de la ficha es baja (14 descargas, 1 like), y no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variational convolucional (encoder/decoder Oobleck con activaciones SnakeBeta); no es transformer ni MoE |
| Parametros totales | 132.616.130 (encoder 66,2 M; decoder 66,4 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM. Entrenado con recortes de 2,56 s; la decodificacion por tiles permite audio de longitud arbitraria |
| Tipos de cuantizacion | No se publican versiones cuantizadas. Pesos liberados en FP32 (EMA); se pueden convertir a FP16/BF16 para inferencia, sin cuantizaciones oficiales |
| Idiomas soportados | No disponible (modelo de audio; no procesa texto) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |
| Audio de entrada/salida | 48 kHz, estereo (2 canales) |
| Latentes | 64 canales × 25 fotogramas/s (factor de submuestreo 1920×) |
| Tamano del repositorio | 0,6 GB |
| Pipeline declarado | audio-to-audio |
| Libreria | transformers (codigo personalizado) |

## Arquitectura y entrenamiento

MuVAE sigue la familia de autoencoders Oobleck, procedente de `stable-audio-tools` (MIT, © 2023 Stability AI), con activaciones SnakeBeta tomadas de BigVGAN (MIT, © 2022 NVIDIA). El encoder y el decoder son convolucionales, con una progresion de canales 64 × (1, 2, 4, 8, 16, 32) y strides (2, 2, 4, 4, 5, 6), que dan lugar al factor de compresion 1920× y a latentes de 64 dimensiones a 25 Hz. La arquitectura y el codigo de inferencia siguen el VAE de YuE, pero los pesos se entrenaron desde cero: no es un fine-tuning del modelo de YuE. La distribucion latente es un posterior gaussiano del que se puede tomar la media (`encode`) o muestrear (`encode(x, sample=True)`).

El entrenamiento utilizo aproximadamente 10.000 horas de audio musical, presentadas como recortes aleatorios estereo de 2,56 s a 48 kHz, durante 116.228 pasos con 128 recortes por paso (unos 5,5 minutos de audio por paso). Las perdidas combinan STFT multirresolucion (tamanos de FFT de 2048 a 64, magnitud logaritmica y convergencia espectral, sobre suma y diferencia estereo), una divergencia KL con peso 1e-4, y un discriminador STFT multirresolucion con perdida adversaria (peso 0,1) y feature matching (peso 5,0) activado a partir del paso 5.000, con balanceo de gradientes entre los tres terminos. La optimizacion se hizo en bf16 con AdamW (β = 0,8 y 0,99), learning rate de 1,5e-4 para el generador y 3e-4 para el discriminador, 1.000 pasos de warmup seguidos de tasa constante, recorte de gradiente en 10 y EMA de pesos con decaimiento 0,999. La innovacion practica mas relevante es la decodificacion por tiles con contexto suficiente para igualar una decodificacion completa, lo que permite decodificar canciones enteras sin agotar memoria. La reconstruccion esta alineada con la entrada desplazada 32 muestras (`x[..., 32:32 + y.shape[-1]]`), un detalle critico para pipelines que concatenan fragmentos.

## Capacidades

- Codificacion de audio musical a latentes: convierte waveform estereo de 48 kHz en tensores `(1, 64, frames)` a 25 Hz.
- Decodificacion de latentes a audio: reconstruye waveform estereo a 48 kHz desde el espacio latente, con modo por tiles o en una sola pasada (`chunked=False`).
- Muestreo estocastico del posterior: `encode(x, sample=True)` permite obtener muestras de la distribucion latente en lugar de la media, util para aumentacion de datos y regularizacion.
- Carga parcial del decoder: `from_pretrained(..., decoder_only=True)` permite usar solo el decoder, util cuando los latentes ya existen.
- Extraccion de caracteristicas: etiquetado como `feature-extraction`, sirve como extractor de representaciones para tareas musicales.
- Audio-to-audio: tarea principal declarada en el pipeline; soporta reconstruccion y transformacion en el dominio latente.
- Procesamiento de audio largo: la decodificacion por tiles mantiene el uso de memoria acotado independientemente de la duracion.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de vision o texto: es exclusivamente un codec/autoencoder de audio.

## Casos de uso

- Espacio latente para generacion musical: un modelo de difusion o un transformer autorregresivo puede operar sobre los latentes de 64 × 25 Hz en lugar de sobre muestras de audio, reduciendo la longitud de secuencia en un factor de 1920× y haciendo viables arquitecturas de generacion sobre canciones completas.
- Compresion y almacenamiento de audio musical: 64 canales a 25 Hz suponen 1.600 valores por segundo frente a 96.000 muestras por segundo del PCM estereo a 48 kHz; util para cachear datasets de entrenamiento en disco o memoria.
- Preprocesado de pipelines de entrenamiento: codificar un corpus de miles de horas una sola vez y entrenar sobre latentes, reduciendo el coste de E/S y de computo por paso.
- Investigacion sobre representaciones latentes de audio: al ser un VAE con posterior gaussiano, permite estudiar interpolaciones, aritmetica latente y estructuras de manifold en musica, con la ventaja de que la reconstruccion es fiel.
- Edicion y manipulacion musical en dominio latente: decodificar solo fragmentos modificados (por ejemplo, para sustituir o reparar una seccion de una pista) aprovechando la decodificacion por tiles.
- Recuperacion de musica por similitud: usar las medias latentes como embeddings compactos para busqueda de pistas similares o clustering de catalogos musicales.
- Aumentacion de datos: muestrear del posterior con `encode(x, sample=True)` para generar variaciones controladas de una misma pista que preservan su contenido musical global.
- Reconstruccion de alta fidelidad en herramientas de produccion: al estar entrenado a 48 kHz estereo, encaja en cadenas de mastering donde los codecs a 44,1 kHz o mono no son aceptables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de audio. El autor si publica curvas de entrenamiento, con metricas promediadas sobre 50 pasos:

| Paso | Perdida STFT multirresolucion | Feature matching | Perdida del discriminador |
|---|---|---|---|
| 6.400 | 2,15 | 0,80 | 1,54 |
| 20.000 | 1,95 | 0,85 | 1,02 |
| 50.000 | 1,84 | 0,82 | 0,93 |
| 80.000 | 1,80 | 0,81 | 0,84 |
| 116.200 | 1,79 | 0,79 | 0,74 |

Ademas, la model card incluye cuatro pares de muestras (audio original y reconstruccion) a 48 kHz estereo, que son la unica evidencia cualitativa de calidad disponible. No se han publicado metricas objetivas de fidelidad (PESQ, SI-SDR, FAD) ni comparaciones cuantitativas con otros codecs.

## Requisitos de hardware

- VRAM para inferencia: con 132,6 M de parametros, los pesos en FP32 ocupan aproximadamente 0,53 GB; en FP16 o BF16, unos 0,27 GB. El repositorio completo pesa 0,6 GB.
- Memoria adicional: dominada por las activaciones. La decodificacion por tiles acota este consumo, por lo que la huella depende del tamano de tile mas que de la duracion de la cancion. Los latentes de una cancion de 5 minutos son 300 × 25 × 64 = 480.000 valores, despreciables en memoria.
- GPU recomendadas: cualquier GPU con 2-4 GB de VRAM libre es suficiente, incluidas GTX 1650, RTX 3060, RTX 4060 o superiores. Para procesamiento por lotes de grandes volumenes, A100 o H100 reducen el tiempo total, pero no son necesarias por capacidad de memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna, e incluso en CPU para audio de duracion moderada.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no aplican a este modelo. Tampoco se documenta exportacion a ONNX, TorchScript u otros formatos.
- Latencia y throughput: no disponible. No se han publicado mediciones de tiempo de codificacion o decodificacion, ni de factor en tiempo real (RTF). La decodificacion por tiles anade cierta sobrecarga frente a la decodificacion en una sola pasada.

## Comparativa con modelos similares

| Modelo | Tipo | Audio | Latentes | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MuVAE | VAE convolucional (Oobleck + SnakeBeta) | 48 kHz estereo | 64 canales a 25 Hz (1920×) | 132,6 M | CC-BY-4.0 | HuggingFace, via `transformers` |
| VAE de YuE / YuE2 | VAE convolucional (arquitectura de referencia) | No disponible | No disponible | No disponible | No disponible | Repositorio GitHub de YuE |
| Oobleck de stable-audio-tools | Autoencoder convolucional (arquitectura base) | No disponible | No disponible | No disponible | MIT (codigo, © 2023 Stability AI) | GitHub de Stability AI |
| SnakeBeta de BigVGAN | Activacion (componente reutilizado) | No disponible | No disponible | No disponible | MIT (codigo, © 2022 NVIDIA) | GitHub de NVIDIA |

No se dispone de datos publicados de parametros, latentes o rendimiento de otros codecs de musica 48 kHz estereo en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas como EnCodec, DAC o el VAE de Stable Audio Open. Cualquier cifra al respecto seria especulativa.

## Limitaciones y advertencias

- Adopcion muy baja: 14 descargas y 1 like en el momento de la ficha, lo que implica poca validacion externa, escasez de reportes de terceros y ausencia de ecosistema alrededor del modelo.
- Sin benchmarks objetivos: no hay metricas de fidelidad (PESQ, SI-SDR, FAD) ni comparaciones con codecs establecidos, solo curvas de entrenamiento y cuatro demos cualitativas.
- Dominio restringido: entrenado con aproximadamente 10.000 horas de musica. No hay evidencia de que generalize bien a voz hablada, efectos de sonido, audio ambiental o grabaciones de campo.
- Naturaleza con perdida: es un VAE con KL y un factor de compresion de 1920×; la reconstruccion no es identica al original y puede introducir artefactos audibles en contenidos con mucha informacion transitoria o alta densidad espectral.
- Alineacion temporal: la reconstruccion esta desplazada 32 muestras respecto a la entrada. Ignorar este detalle produce desalineaciones en pipelines de comparacion, entrenamiento o metricas.
- Sin datos de sesgo: no se ha publicado ningun analisis de sesgo por genero, cultura o region en los datos de entrenamiento musical, lo que puede sesgar modelos generativos entrenados sobre este espacio latente.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto. El equivalente es la invencion de contenido espectral en la reconstruccion, mas probable en pasajes con muchas transitorios.
- Idoneidad para tiempo real: no hay datos de latencia ni de RTF, y la arquitectura convolucional no causal y la decodificacion por tiles sugieren que no esta disenada como codec de baja latencia para streaming o comunicaciones.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion, pero obliga a citar al autor y a indicar los cambios. Es mas permisiva que las licencias no comerciales de otros codecs de audio, pero exige cumplir la atribucion de los componentes de terceros (stable-audio-tools y BigVGAN, ambos MIT), documentados en `THIRD_PARTY_NOTICES.md` y en el directorio `licenses/`.
- Dependencia de codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo publicado por el autor; conviene auditar el repositorio antes de usarlo en produccion.
- Sin version cuantizada ni exportada: no hay GGUF, ONNX ni pesos en FP16 publicados, por lo que quien quiera reducir el tamano o integrarlo en runtimes no-PyTorch debe hacer la conversion por su cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrfakename/MuVAE
- Demo 1, audio original: https://huggingface.co/mrfakename/MuVAE/resolve/main/demos/sample1-source.wav
- Demo 1, reconstruccion: https://huggingface.co/mrfakename/MuVAE/resolve/main/demos/sample1-reconstruction.wav
- Demo 2, audio original: https://huggingface.co/mrfakename/MuVAE/resolve/main/demos/sample2-source.wav
- Demo 2, reconstruccion: https://huggingface.co/mrfakename/MuVAE/resolve/main/demos/sample2-reconstruction.wav
- Demo 3, audio original: https://huggingface.co/mrfakename/MuVAE/resolve/main/demos/sample3-source.wav
- Demo 3, reconstruccion: https://huggingface.co/mrfakename/MuVAE/resolve/main/demos/sample3-reconstruction.wav
- Demo 4, audio original: https://huggingface.co/mrfakename/MuVAE/resolve/main/demos/sample4-source.wav
- Demo 4, reconstruccion: https://huggingface.co/mrfakename/MuVAE/resolve/main/demos/sample4-reconstruction.wav
- Repositorio de YuE (arquitectura de referencia del VAE): https://github.com/multimodal-art-projection/YuE
- stable-audio-tools (autoencoder Oobleck, MIT): https://github.com/Stability-AI/stable-audio-tools
- BigVGAN (activacion SnakeBeta, MIT): https://github.com/NVIDIA/BigVGAN
- Paper o publicacion tecnica de MuVAE: no disponible
- Datos de benchmarks de MuVAE: no disponible
