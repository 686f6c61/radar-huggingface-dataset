# SinhaSpeech/whisper-small-sinhala-run12-best

## Resumen

`SinhaSpeech/whisper-small-sinhala-run12-best` es un ajuste fino completo (full fine-tune) de `openai/whisper-small` para reconocimiento automático del habla (ASR) en cingalés (sinhala, código `si`). Lo desarrolla SinhaSpeech, autor identificado en la cita como Yohan Jayasinghe, y es el duodécimo experimento de una serie de entrenamientos (run10, run11, run12) sobre el mismo conjunto de datos. Con 241.734.912 parámetros, reutiliza la arquitectura encoder-decoder transformer de Whisper y la especializa en un único idioma de bajos recursos, donde el modelo original multilingüe rinde de forma insuficiente.

El modelo alcanza un 15,52 % de WER y un 4,36 % de CER sobre un conjunto de test de 15.860 enunciados con separación por hablante (speaker-disjoint), lo que lo convierte, según el autor, en el mejor resultado del proyecto SinhaSpeech. La mejora sobre las ejecuciones anteriores es atribuible en gran medida a la búsqueda de hiperparámetros con Optuna (20 trials) y al cambio a decaimiento coseno del learning rate (8,56e-5) frente al decaimiento lineal empleado en run10 y run11.

Su relevancia práctica es la de un componente cerrado y ligero para pipelines de transcripción en cingalés: 244M de parámetros, licencia Apache-2.0 y pesos en safetensors compatibles con `transformers`, lo que permite desplegarlo en hardware de gama media, incluso en CPU, algo inviable con modelos ASR multilingües de mayor tamaño. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto reciente con validación externa limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), full fine-tune de `openai/whisper-small` |
| Parametros totales | 241.734.912 (244M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | Ventana de audio de 30 segundos por pasada (1500 frames de mel spectrogram, 80 canales); maximo de 448 tokens de decodificacion |
| Tipos de cuantizacion | No publicados por el autor; el repo contiene solo pesos en precision completa. Al derivar de `whisper-small` admite conversiones de la comunidad a int8/GGUF (whisper.cpp, CTranslate2) |
| Idiomas soportados | Cingales (sinhala, `si`) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper (Radford et al., 2022): un encoder transformer que procesa espectrogramas mel logaritmicos de 30 segundos y un decoder autorregresivo que genera texto, con posiciones sinusoidales aprendidas y sin mecanismos de atencion lineal ni decodificacion especulativa. El ajuste es completo: se actualizan todos los pesos del modelo base, no se emplean adaptadores LoRA ni capas congeladas.

El entrenamiento se realizo sobre el conjunto `SinhaSpeech/sinhala-asr-data-v6` (`stratified_v6`), con 123.205 muestras de entrenamiento, 15.763 de validacion y 15.860 de test, con particionado speaker-disjoint (ningun hablante aparece en varios splits). La configuracion usada fue: 6 epocas y 11.556 pasos, learning rate 8,56e-5 con decaimiento coseno y 500 pasos de warmup, tamano de lote efectivo 64 (64 por dispositivo, sin acumulacion de gradiente), precision bf16 y entrenamiento sobre AMD Instinct MI300X con ROCm. Se aplico aumento de datos con SpecAugment, ruido, estiramiento temporal y variacion de tono, con probabilidad 0,2 cada uno. Los hiperparametros se seleccionaron mediante barrido Optuna TPE de 20 trials; la ficha no indica el numero total de horas de audio del corpus.

El WER de validacion evoluciono de 31,18 % en la epoca 1 a 18,70 % en la epoca 6, con un CER asociado de 9,92 % a 6,07 %, lo que indica que el modelo seguia mejorando al final del entrenamiento y que un regimen mas largo podria seguir aportando.

## Capacidades

- Transcripcion de voz a texto en cingales con salida de texto plano, mediante el pipeline `automatic-speech-recognition` de `transformers`.
- Reconocimiento robusto entrenado con aumentos de datos (ruido, estiramiento, tono), lo que ayuda en audio con condiciones no ideales.
- Procesamiento de audio de duracion arbitraria mediante chunking por ventanas de 30 segundos (`chunk_length_s=30`).
- Salida de segmentos temporizados y probabilidades por token, capacidades heredadas del decoder de Whisper.
- Tarea de traduccion al ingles heredada del modelo base: la ficha solo declara y valida la tarea `transcribe` en cingales, por lo que el uso de `task="translate"` no esta respaldado por ninguna evaluacion.
- No dispone de tool calling, function calling ni soporte de agentes: es un modelo exclusivamente de voz a texto.
- No soporta vision, audio understanding multimodal ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado de medios audiovisuales en cingales: el modelo transcribe locucion continua y, gracias al chunking de 30 segundos, permite procesar programas completos generando subtitulos con marcas temporales para television, YouTube o plataformas de streaming de Sri Lanka.
- Transcripcion de centros de atencion al cliente: integrado en un pipeline posterior al motor de telefonia (por ejemplo, Asterisk o Twilio), transcribe llamadas grabadas en cingales para su analisis, clasificacion y control de calidad, con un WER del 15,52 % que hace viable la busqueda por palabras clave aunque no la transcripcion literal sin revision.
- Indexacion y busqueda en archivos de audio: con 244M de parametros y ejecucion rapida en GPU de gama media, se puede usar para transcribir de forma masiva un catalogo de podcasts o noticias y alimentar un indice de texto buscable.
- Accesibilidad para personas con discapacidad auditiva: generacion automatica de subtitulos en directo o diferido para eventos, aulas y retransmisiones, al ser un modelo ligero desplegable en el propio servidor sin depender de APIs externas.
- Documentacion clinica y legal dictada: transcripcion de notas de voz de profesionales que trabajan en cingales, con revision posterior obligatoria dada la tasa de error residual del 15,52 % de WER.
- Aplicaciones de voz para el mercado cingales: como primera etapa de un asistente de voz (ASR en cingales seguido de un LLM de texto), permite construir interfaces habladas locales sin enviar audio a servicios en la nube.
- Generacion de datos etiquetados: la salida del modelo puede emplearse como preanotacion en procesos de etiquetado humano para ampliar corpus de cingales destinados a futuros entrenamientos.
- Investigacion en ASR de bajos recursos: sirve como linea base reproducible (con hiperparametros y particiones documentados) para comparar tecnicas de fine-tuning en idiomas con pocos datos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica no verificada de forma independiente, `verified: false`):

| Conjunto | WER (%) | CER (%) |
|---|---|---|
| Test (15.860 enunciados, speaker-disjoint) | 15,52 | 4,36 |
| Validacion (epoca 6) | 18,70 | 6,07 |

Evolucion del WER en validacion por epoca:

| Epoca | WER validacion (%) | CER validacion (%) |
|---|---|---|
| 1 | 31,18 | 9,92 |
| 2 | 26,12 | 8,21 |
| 3 | 22,52 | 7,02 |
| 4 | 20,22 | 6,48 |
| 5 | 18,75 | 6,06 |
| 6 | 18,70 | 6,07 |

Comparativa interna entre ejecuciones del mismo proyecto:

| Ejecucion | Configuracion | WER test (%) | CER test (%) |
|---|---|---|---|
| run10 | datos v6, learning rate lineal 3e-5, 5 epocas | 17,17 | 4,71 |
| run11 | datos v6, learning rate lineal 3e-5, 6 epocas | 16,38 | 4,43 |
| run12 (este modelo) | datos v6, learning rate coseno 8,56e-5, 6 epocas | 15,52 | 4,36 |

No se han publicado en la informacion disponible resultados de benchmarks frente a otros modelos ASR (MMLU, HumanEval, GSM8K u otros no aplican a esta tarea, y no hay comparaciones con modelos de terceros).

## Requisitos de hardware

- Peso de los parametros: aproximadamente 967 MB en fp32, 483 MB en fp16/bf16 y 242 MB en int8.
- VRAM estimada para inferencia: en torno a 1,5-2 GB en fp16 sumando pesos, activaciones y buffers de audio para ventanas de 30 segundos; alrededor de 1 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona sin problemas en RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100 o MI300X. Para el ajuste fino completo, el autor empleo AMD Instinct MI300X con ROCm y bf16.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna de Nvidia o AMD con 4 GB o mas, e incluso en iGPU con memoria unificada.
- Inferencia en CPU: viable, ya que 244M de parametros permiten transcripcion en tiempo razonable, aunque con latencia muy superior a GPU.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`, servidores de inferencia compatibles con Whisper como vLLM y TGI, y runtimes optimizados que requieren conversion previa de pesos como faster-whisper (CTranslate2) y whisper.cpp (GGUF). El tag `endpoints_compatible` del repositorio indica compatibilidad con los endpoints de HuggingFace.
- Latencia y throughput: no disponible. No se proporcionan medidas de factor de tiempo real ni de transcripciones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER en cingales |
|---|---|---|---|---|---|
| whisper-small-sinhala-run12-best (este) | 244M | 30 s por ventana | Cingales | Apache-2.0 | 15,52 % (test declarado) |
| openai/whisper-small (base) | 244M | 30 s por ventana | Multilingue (99 idiomas) | Apache-2.0 | no disponible en la informacion proporcionada |
| openai/whisper-base | 74M | 30 s por ventana | Multilingue | Apache-2.0 | no disponible |
| openai/whisper-medium | 769M | 30 s por ventana | Multilingue | Apache-2.0 | no disponible |

La comparacion relevante es contra el propio `openai/whisper-small`, del que este modelo deriva: comparten arquitectura y numero de parametros, y la diferencia es el ajuste completo sobre 123.205 muestras en cingales. No hay datos en la informacion disponible que permitan comparar su WER con el de los modelos originales de OpenAI ni con alternativas especificas para cingales de terceros.

## Limitaciones y advertencias

- El WER del 15,52 % implica aproximadamente una palabra erronea de cada seis; no es apto para transcripcion literal sin revision humana en contextos criticos (legal, medico, financiero).
- Las metricas declaradas no estan verificadas de forma independiente (`verified: false`) y proceden del propio autor sobre un conjunto de test de su mismo proyecto.
- Modelo monoidioma: solo reconoce cingales. No debe esperarse buen rendimiento con ingles, tamil ni otros idiomas presentes en Sri Lanka.
- Sesgo de dominio: al entrenarse exclusivamente con `sinhala-asr-data-v6`, el rendimiento fuera de esa distribucion (acentos regionales, jerga, audio telefonico de baja calidad, solapamiento de voces) puede degradarse de forma notable.
- Whisper es propenso a alucinaciones en tramos sin voz, musica o ruido, y a repetir frases; conviene activar umbrales de no-speech y revision de salidas largas.
- La ventana de 30 segundos obliga a trocear el audio; el chunking puede cortar palabras y degradar la precision en los limites.
- El modelo solo ha sido validado en la tarea `transcribe`; la traduccion al ingles u otras tareas de Whisper no estan evaluadas.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y de atribucion. La cita recomendada por el autor es Jayasinghe (2026).
- El repositorio presenta 0 descargas y 0 likes, sin validacion de la comunidad ni informes de terceros; conviene tratarlo como artefacto experimental.
- No se documenta el volumen total de horas de audio ni la procedencia de las grabaciones del dataset, lo que dificulta evaluar posibles sesgos demograficos o de canal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SinhaSpeech/whisper-small-sinhala-run12-best
- Modelo base: https://huggingface.co/openai/whisper-small
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/SinhaSpeech/sinhala-asr-data-v6
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio de whisper.cpp (conversiones GGUF, no oficial): https://github.com/ggerganov/whisper.cpp
- faster-whisper / CTranslate2 (runtime optimizado, no oficial): https://github.com/SYSTRAN/faster-whisper
