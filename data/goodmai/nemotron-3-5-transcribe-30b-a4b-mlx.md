# goodmai/Nemotron-3.5-Transcribe-30B-A4B-MLX

## Resumen

Nemotron-3.5-Transcribe-30B-A4B-MLX es una conversión a MLX del modelo de reconocimiento automático del habla (ASR) `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, publicada por el usuario goodmai para su ejecución nativa en Apple Silicon. El modelo original lo desarrolla NVIDIA y sigue una arquitectura híbrida con expertos mezclados (MoE) y componentes de espacio de estados (SSM), con 32.311.569.792 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (según el sufijo A4B), lo que permite un coste de cómputo por token muy inferior al de un modelo denso del mismo tamaño.

El problema que resuelve es la transcripción de audio a texto de alta calidad sobre hardware de consumo de Apple, sin depender de CUDA ni de Python en el caso de uso previsto por el autor. Para ello, la conversión aplica una cuantización mixta (expertos a 3 bits, LLM a 4 bits, encoders a 8 bits) que reduce el peso del modelo a unos 17 GB de memoria, con una penalización declarada de aproximadamente 0,1 puntos de WER en los conjuntos de evaluación del autor. Además, se incluye un kernel Metal personalizado para el bloque SSM fusionado que alcanza 154 tokens por segundo en un MacBook con chip M5 Pro.

Es relevante ahora porque demuestra que un modelo ASR de 30B con arquitectura híbrida MoE/SSM puede ejecutarse en un portátil Apple Silicon con una tasa de error competitiva (1,17 % WER en LibriSpeech test-clean y 2,80 % en test-other) y un RTFx de 23,6. El propio autor advierte que se trata de un experimento de investigación y que, para la mayoría de casos, conviene un modelo más pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida MoE + SSM (Nemotron Transcribe), conversión MLX con kernel Metal para SSM fusionado |
| Parametros totales | 32.311.569.792 |
| Parametros activos | ~4B (sufijo A4B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: expertos a 3 bits, LLM a 4 bits, encoders a 8 bits (repo etiquetado como 4-bit) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (MLX), repositorio de 15,7 GB |

## Arquitectura y entrenamiento

El modelo base es un sistema de transcripción de NVIDIA con arquitectura híbrida que combina capas de mezcla de expertos (MoE) con módulos de espacio de estados (SSM). La conversión a MLX mantiene esa estructura y añade un kernel Metal propio para el bloque SSM fusionado, que es la pieza que permite alcanzar 154 tok/s en un MacBook con M5 Pro. La cuantización se aplica de forma diferenciada por componente: 3 bits en los expertos, 4 bits en el LLM y 8 bits en los encoders, una elección que el autor justifica como el mejor compromiso entre WER y tamaño de memoria en sus conjuntos de evaluación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original empleó RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la innovación técnica del modelo base más allá de su naturaleza híbrida MoE/SSM. La información disponible se limita a la conversión MLX, la estrategia de cuantización y los resultados de evaluación del autor de la conversión.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, tarea principal del pipeline `automatic-speech-recognition`.
- Procesamiento de audio con encoders dedicados a 8 bits, preservando mayor precisión en la parte de extracción de características acústicas.
- Inferencia eficiente en Apple Silicon mediante MLX y kernel Metal personalizado para el bloque SSM.
- Ejecución sin Python a través de la aplicación macOS y CLI Basalt (macOS 27+).
- Integración como modelo de audio en un pipeline multimodal: el comando de ejemplo de la model card lo combina con un LLM (`goodmai/gemma-4-12B-it-qat-4bit`) para servir una pipeline de audio con API REST.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio de entrada distinto de voz ni modo thinking. No disponible.

## Casos de uso

- Transcripción local de reuniones en un MacBook: el modelo cabe en unos 17 GB de memoria y procesa audio a un RTFx de 23,6, por lo que una hora de audio se transcribe en aproximadamente 2,5 minutos en un M5 Pro, sin enviar datos a la nube.
- Subtitulado de vídeo en flujos de postproducción sobre macOS: la licencia OpenMDW 1.1 y la ejecución local permiten generar subtítulos en un equipo de edición sin depender de servicios externos.
- Investigación en ASR con arquitecturas híbridas MoE/SSM: el repositorio sirve como referencia reproducible para estudiar el impacto de la cuantización mixta (3/4/8 bits) en el WER.
- Prototipado de asistentes de voz en Apple Silicon: combinado con un LLM mediante Basalt, se puede montar una pipeline de audio a texto más generación de respuesta con API REST en local.
- Evaluación comparativa de cuantizaciones: el autor documenta que la combinación 3-bit expertos / 4-bit LLM / 8-bit encoders produce una penalización de ~0,1 puntos de WER, útil como punto de partida para experimentos propios.
- Dictado offline en entornos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo, el audio no sale del equipo, lo que encaja en contextos sanitarios, legales o industriales con datos sensibles.
- Docencia y demos de ASR en hardware de consumo: permite mostrar un modelo de 30B funcionando en un portátil, algo inviable con implementaciones CUDA convencionales.

## Benchmarks y rendimiento

| Benchmark | Resultado | Entorno |
|---|---|---|
| LibriSpeech test-clean WER | 1,17 % | M5 Pro, cuantización mixta 3/4/8 bits |
| LibriSpeech test-other WER | 2,80 % | M5 Pro, cuantización mixta 3/4/8 bits |
| Velocidad de decodificación | 154 tok/s | M5 Pro |
| RTFx (40 clips test-clean) | 23,6 | M5 Pro |

No se han publicado en la información disponible resultados comparativos con otros modelos ASR ni métricas del modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~17 GB según el autor para la cuantización mixta publicada; el repositorio ocupa 15,7 GB en disco.
- Hardware objetivo: Apple Silicon con macOS 27 o superior para la aplicación Basalt; el autor reporta pruebas en un MacBook con M5 Pro.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, el formato es MLX y está pensado para memoria unificada de Apple Silicon. No disponible para CUDA.
- Cabe en equipos Apple Silicon con al menos 24 GB de memoria unificada de forma holgada; con 16 GB el margen es muy ajustado y no está confirmado por el autor.
- Despliegue: MLX (`pip install -r requirements.txt` y `python transcribe.py audio.wav`), o Basalt (app macOS y CLI) con API REST. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 154 tok/s y RTFx de 23,6 en M5 Pro; no hay datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/Nemotron-3.5-Transcribe-30B-A4B-MLX | 32,3B totales (~4B activos) | no disponible | 1,17 % | OpenMDW 1.1 | MLX, Apple Silicon |
| nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B | 32,3B totales (~4B activos) | no disponible | no disponible | OpenMDW 1.1 | Pesos originales (formato no especificado) |
| divergentlabs/Nemotron-3.5-Transcribe-30B-A4B-MLX | 32,3B totales (~4B activos) | no disponible | no disponible | OpenMDW 1.1 | MLX, conversión upstream citada |

No se dispone de datos de benchmarks de modelos ASR alternativos en la información proporcionada, por lo que no se incluyen comparaciones de rendimiento con Whisper u otros sistemas.

## Limitaciones y advertencias

- El autor advierte explícitamente que es un experimento de investigación y que probablemente convenga usar un modelo más pequeño para producción.
- La cuantización mixta introduce una penalización de ~0,1 puntos de WER respecto al modelo sin cuantizar, según los conjuntos de evaluación del autor.
- Solo funciona en Apple Silicon con MLX; no hay soporte documentado para CUDA, ROCm ni CPU x86.
- El comando de ejemplo de la model card referencia `goodmai/gemma-4-12B-it-qat-4bit`, un identificador distinto del modelo de esta ficha; conviene verificar la configuración antes de usarlo.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; en ASR, los errores se manifiestan como sustituciones, omisiones e inserciones de texto, especialmente en audio con ruido o acentos no representados en el entrenamiento.
- La licencia OpenMDW 1.1 es distinta de las licencias permisivas habituales (Apache 2.0, MIT); es necesario revisar sus términos antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.
- No hay información sobre la longitud máxima de audio procesable ni sobre el comportamiento en audios largos.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Nemotron-3.5-Transcribe-30B-A4B-MLX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Conversión upstream citada: https://huggingface.co/divergentlabs/Nemotron-3.5-Transcribe-30B-A4B-MLX
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo Basalt (inglés): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FNemotron-3.5-Transcribe-30B-A4B-MLX&role=asr&lang=en
- Demo Basalt (ruso): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FNemotron-3.5-Transcribe-30B-A4B-MLX&role=asr
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
