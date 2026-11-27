# aystream/GigaAM-v4-e2e-ctc-mlx

## Resumen

GigaAM-v4-e2e-ctc-mlx es un port nativo a MLX del modelo de reconocimiento automatico del habla ai-sage/GigaAM-v4, en su revision CTC con cabeza end-to-end. Lo publica el usuario aystream y su objetivo es ejecutar inferencia de ASR sobre Apple Silicon sin depender de PyTorch, aprovechando el framework MLX de Apple para acelerar la computacion en GPU unificada. El modelo reconoce ruso e ingles, incluyendo cambios de codigo entre ambos idiomas, y produce transcripciones con puntuacion y normalizacion.

La arquitectura es Zapformer, una red convolucional causal con frontend ConvNeXt y modulos con RoPE intercalado y RMSNorm, rematada por una cabeza CTC a nivel de caracter. El modelo tiene aproximadamente 235 millones de parametros y un vocabulario de 146 clases. Ademas del modo de contexto completo, soporta streaming nativo con ventanas de contexto futuro de 160, 320 y 640 ms, lo que lo hace apto para transcripcion en tiempo real.

Su relevancia ahora es practica: demuestra que un ASR de calidad puede correr en un portatil Mac con aceleracion MLX a velocidades muy superiores a la referencia en CPU con PyTorch, manteniendo paridad de salida con el modelo original. La licencia MIT y el formato MLX lo convierten en una pieza util para prototipos y aplicaciones locales de dictado o subtitulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zapformer (frontend ConvNeXt causal, 3 etapas: 4x768d, 11x1024d @2x, 4x768d, RoPE intercalado, RMSNorm) + cabeza CTC de caracteres |
| Parametros totales | ~235M (234.613.293, cabeza e2e) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; streaming con contexto futuro de 160/320/640 ms) |
| Tipos de cuantizacion | no disponible (pesos en FP16 y FP32 segun la tabla de rendimiento) |
| Idiomas soportados | ruso (ru) e ingles (en), con cambio de codigo entre ambos |
| Licencia | MIT |
| Formato de pesos | MLX (libreria mlx); tamano del repo 0.5 GB |

## Arquitectura y entrenamiento

El modelo es un port del checkpoint ai-sage/GigaAM-v4 en su revision CTC. La arquitectura Zapformer combina un frontend ConvNeXt causal con tres etapas de bloques (4 capas de 768 dimensiones, 11 capas de 1024 dimensiones con factor 2x y 4 capas de 768 dimensiones), empleando RoPE intercalado y RMSNorm. La salida pasa por una cabeza CTC a nivel de caracter con un vocabulario de 146 clases (145 caracteres rusos, ingleses y de puntuacion, mas el simbolo blank).

El autor no detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo original ai-sage/GigaAM-v4. La innovacion destacable del port es la reimplementacion completa en MLX, que permite inferencia sin PyTorch y con paridad de salida verificada frente a la referencia (diferencia media absoluta del encoder menor o igual a 5e-6) en contexto completo y en los tres modos de streaming.

## Capacidades

- Reconocimiento automatico del habla en ruso e ingles, con soporte de cambio de codigo entre ambos idiomas.
- Transcripcion con puntuacion y normalizacion de texto.
- Modo de contexto completo (offline) sobre ficheros de audio de larga duracion.
- Streaming nativo con contexto futuro configurable de 160, 320 y 640 ms.
- Inferencia acelerada en Apple Silicon mediante MLX, con soporte de FP16 y FP32.
- Interfaz de linea de comandos (`gigaam-mlx`) y API de Python (`load_model`, `transcribe`, `create_stream`).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Dictado local en Mac: el modelo corre sobre la GPU unificada de Apple Silicon con MLX y permite transcribir notas de voz sin enviar audio a la nube, gracias a su licencia MIT y a su tamano de 0.5 GB.
- Subtitulado en tiempo real de reuniones o videollamadas: el modo streaming con contexto de 320 ms procesa paquetes de audio de forma incremental (unos 14,3 ms por paquete en FP32), lo que permite generar subtitulos con latencia baja.
- Transcripcion de archivos largos: con contexto completo procesa audio de 22 minutos en 16,3 s en un M2 Max, adecuado para procesar por lotes grabaciones de clases, entrevistas o podcasts en ruso.
- Atencion al cliente con habla rusa: la salida con puntuacion y normalizacion facilita el postprocesado y el analisis de conversaciones telefonicas transcritas.
- Prototipado de asistentes de voz en macOS: la API de Python y la CLI permiten integrar el modelo en aplicaciones de escritorio con MLX sin dependencias de PyTorch.
- Investigacion en ASR multilingue ru-en: el soporte de cambio de codigo y la paridad verificada con la referencia PyTorch lo hacen util para comparar backends y validar pipelines de evaluacion.

## Benchmarks y rendimiento

Datos publicados por el autor en MacBook Pro M2 Max, sobre un fragmento de 19 segundos de habla rusa densa (295 caracteres, media de 3 ejecuciones en caliente):

| Backend | Precision | Tiempo | Tiempo real |
|---|---|---|---|
| MLX v4 CTC (este modelo) | FP16 | 0,038 s | ~507x |
| MLX v4 CTC (este modelo) | FP32 | 0,043 s | ~440x |
| PyTorch CPU v4 CTC | FP32 | 0,417 s | ~46x |

- Audio completo de 22 minutos (1319,4 s end-to-end): 16,3 s (~81x tiempo real).
- Streaming con contexto de 320 ms, fragmento denso, FP32: 14,3 ms por paquete (~22x tiempo real).
- Paridad con PyTorch: texto decodificado y deltas de paquetes de streaming identicos frente a la referencia `ai-sage/GigaAM-v4` en CPU, con diferencia media absoluta del encoder menor o igual a 5e-6.
- Los tiempos MLX miden solo codificacion y decodificacion; la extraccion mel con librosa anade ~3,0 ms. Los tiempos PyTorch incluyen su FeatureExtractor.

No se han publicado resultados de benchmarks academicos (WER, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (el autor reporta mediciones en MacBook Pro M2 Max); no se documenta soporte para GPU NVIDIA o AMD.
- VRAM/memoria unificada: no disponible de forma explicita; el repositorio ocupa 0,5 GB y el modelo tiene ~235M parametros, por lo que en FP16 el peso de los parametros ronda los 0,5 GB y en FP32 aproximadamente 1 GB, a lo que se suma el estado de inferencia.
- Cabe en cualquier Mac con Apple Silicon moderno; no aplica a GPU de consumo tipo RTX 4090 por depender de MLX.
- Despliegue: paquete `gigaam-mlx` instalable desde GitHub (`pip install git+https://github.com/aystream/gigaam-mlx.git`), CLI `gigaam-mlx` y API de Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~507x tiempo real en FP16 y ~440x en FP32 para fragmentos cortos; ~81x en audio de 22 minutos; ~22x en streaming con 320 ms de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Framework | Licencia |
|---|---|---|---|---|---|
| GigaAM-v4-e2e-ctc-mlx (este) | ~235M | ru, en | Si (160/320/640 ms) | MLX | MIT |
| ai-sage/GigaAM-v4 (CTC, original) | ~235M | ru, en | Si (160/320/640 ms) | PyTorch | MIT |
| Whisper (variantes de OpenAI) | no disponible en la informacion | multilingue | no disponible en la informacion | PyTorch y otros | no disponible en la informacion |

La comparacion con Whisper no puede completarse con datos de la informacion proporcionada; el unico contraste cuantificado es frente a la referencia PyTorch del mismo modelo, donde el port MLX es aproximadamente 11 veces mas rapido en CPU frente a la GPU unificada en el fragmento de 19 segundos.

## Limitaciones y advertencias

- Solo cubre ruso e ingles; no se documenta soporte de castellano ni de otros idiomas.
- Depende de MLX y, por tanto, de hardware Apple Silicon; no es portable a CUDA sin reimplementacion.
- El rendimiento medido corresponde a un unico equipo (M2 Max) y a fragmentos concretos; no hay evaluacion de WER publicada en la informacion disponible.
- Riesgo de alucinacion y errores en audio con ruido, acentos marcados o solapamiento de hablantes no cuantificado en la model card.
- El modelo es un port de un checkpoint de terceros; la calidad final hereda las limitaciones y sesgos del modelo original ai-sage/GigaAM-v4.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un uso comercial en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aystream/GigaAM-v4-e2e-ctc-mlx
- Codigo del port MLX: https://github.com/aystream/gigaam-mlx
- Modelo original: https://huggingface.co/ai-sage/GigaAM-v4
- Repositorio original: https://github.com/salute-developers/GigaAM
