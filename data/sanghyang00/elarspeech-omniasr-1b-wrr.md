# Sanghyang00/ELARSpeech-OmniASR-1B-wrr

## Resumen

ELARSpeech-OmniASR-1B-wrr es un modelo de reconocimiento automático del habla (ASR) especializado en wardaman (código ISO 639-3 `wrr`), una lengua aborigen australiana con una comunidad de hablantes muy reducida y en situación de peligro. Lo publica el usuario Sanghyang00 en HuggingFace como parte de la familia ELARSpeech, y se obtiene por ajuste fino del checkpoint aadel4/omniASR-CTC-1B-v2, un modelo acústico multilingüe de aproximadamente 1.000 millones de parámetros.

Técnicamente es un `Wav2Vec2ForCTC` clásico: un extractor convolucional de características seguido de un codificador transformer y una cabeza CTC. El repositorio contiene 975.681.460 parámetros reales en formato safetensors (3,9 GB), lo que sitúa al modelo en la gama de 1B y permite inferencia en GPU de consumo e incluso en CPU. La entrada debe ser audio mono a 16 kHz.

Su relevancia es doble. Por un lado, aporta cobertura ASR a una lengua con recursos digitales prácticamente inexistentes, un caso de uso típico de adaptación de modelos multilingües grandes a variedades de bajos recursos. Por otro, es un ejemplo de artefacto derivado con trazabilidad limitada: no declara licencia, no publica métricas de error (WER/CER) y acumula cero descargas y cero valoraciones, por lo que su calidad real más allá de la comprobación de exportación declarada por el autor no está verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (extractor convolucional + codificador transformer + cabeza CTC) |
| Parametros totales | 975.681.460 (dato real del repositorio safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la arquitectura no define una ventana explícita y el coste cuadrático del codificador limita la duración práctica del audio por fragmento |
| Tipos de cuantizacion | no declarados oficialmente; el repositorio se distribuye en safetensors (el tamano del repo, 3,9 GB, es coherente con fp32) |
| Idiomas soportados | wardaman (`wrr`) unicamente, segun la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos: pipeline `automatic-speech-recognition`, modelo base `aadel4/omniASR-CTC-1B-v2`, audio de entrada mono a 16 kHz, repositorio de 3,9 GB, creado el 16 de octubre de 2026 (fecha declarada en el repositorio).

## Arquitectura y entrenamiento

La arquitectura es la estándar de `Wav2Vec2ForCTC`: una pila de capas convolucionales que convierte la onda de audio en una secuencia de representaciones latentes, un codificador transformer que modela el contexto sobre esas representaciones y una proyección lineal con pérdida CTC que produce directamente la secuencia de tokens (caracteres o subunidades) sin modelo de lenguaje externo. Al ser un modelo CTC puro, la decodificación es greedy por defecto y no incorpora mecanismos de decodificación especulativa ni atención lineal.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus de wardaman, el número de tokens de audio, ni sobre si se aplicaron técnicas de adaptación como fine-tuning parcial de capas, congelación del extractor convolucional o regularización específica. Tampoco se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo por otra parte poco habitual en ASR. La model card únicamente indica que el artefacto exportado se comprobó contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluación, con resultado de verificación de transcripción exacta **PASS**; ese resultado acredita fidelidad del export, no calidad acústica medida en WER.

## Capacidades

- Transcripción de voz a texto en wardaman a partir de audio mono a 16 kHz.
- Salida a nivel de carácter o subunidad mediante decodificación CTC greedy (sin puntuación ni capitalización garantizadas).
- Inferencia por lotes (`batch_decode`) para procesar varios fragmentos en una sola pasada.
- Funcionamiento en CPU, dado el tamaño del modelo (menos de 1.000 millones de parámetros).
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No es multilingüe: está entrenado específicamente para wardaman.
- No ofrece modo de razonamiento (thinking), visión, audio-vision ni salida de marcas de tiempo alineadas.
- No realiza traducción ni identificación de hablante (diarización).

## Casos de uso

- Documentación y revitalización lingüística: transcripción de grabaciones de campo de hablantes de wardaman para construir corpus escritos anotados; el modelo cubre una lengua para la que apenas existen herramientas ASR y puede acelerar la transcripción manual, que después un lingüista revisa.
- Archivo sonoro de comunidades indígenas: conversión de cintas y grabaciones históricas digitalizadas a texto con fines de preservación, asumiendo revisión humana por la variabilidad de las condiciones de grabación.
- Etiquetado de datos para entrenar modelos mayores: generación de pseudo-transcripciones que sirvan como preentrenamiento o aumento de datos en un pipeline posterior de ajuste fino supervisado.
- Investigación en ASR de bajos recursos: línea base cuantificable para comparar estrategias de adaptación (fine-tuning completo, LoRA, adaptadores) sobre una lengua con muy pocos recursos digitales.
- Transcripción asistida en trabajo de campo: procesamiento local en un portátil con GPU de consumo para obtener un borrador inmediato de las grabaciones del día, sin depender de conectividad ni de servicios en la nube.
- Evaluación comparativa de checkpoints derivados: dado que el autor publica variantes por idioma de la misma receta, el modelo sirve para medir el efecto del ajuste por lengua frente al checkpoint base multilingüe.
- Subtitulado de material audiovisual en wardaman: generación de borradores de subtítulos para vídeos educativos o culturales, con revisión humana obligatoria por la ausencia de puntuación en la salida CTC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, CER ni comparaciones con otros sistemas, y solo declara el estado **PASS** de la verificación de transcripción exacta del artefacto exportado frente al checkpoint original sobre un conjunto fijo de evaluación, sin cifras asociadas.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 3,9 GB solo de pesos, más activaciones; en torno a 5-6 GB en total para fragmentos cortos de audio.
- VRAM estimada en fp16/bf16: aproximadamente 2 GB de pesos y 3 GB de uso total.
- VRAM estimada en int8: aproximadamente 1 GB de pesos; en int4, en torno a 0,5-0,6 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (RTX 3050, RTX 3060, RTX 4060, RTX 2070, GTX 1660 con cuantización). Con 8 GB o más (RTX 3070, RTX 4060 Ti, RTX 4090) se puede trabajar en fp16 con lotes mayores.
- GPU de centro de datos: A100, H100 o L40S son sobredimensionadas para este modelo; su uso tendría sentido solo para inferencia masiva por lotes.
- CPU: viable por el tamaño (<1.000 millones de parámetros), con latencia mayor y dependiente del número de hilos; útil para procesamiento por lotes no interactivo.
- Opciones de despliegue: `transformers` con PyTorch es la vía documentada en la model card; también es exportable a ONNX Runtime o TorchScript para inferencia optimizada. vLLM, TGI, Ollama y llama.cpp no ofrecen soporte nativo para `Wav2Vec2ForCTC` (no es un modelo de lenguaje generativo y no se distribuye en GGUF).
- Latencia y throughput: no disponibles. No se han publicado medidas de factor de tiempo real ni de audio procesado por segundo.

## Comparativa con modelos similares

Los datos de los modelos de comparación proceden de documentación pública de sus repositorios y deben verificarse antes de tomar decisiones; las cifras del modelo analizado provienen de la información del repositorio.

| Modelo | Parametros | Idiomas | Ventana de audio | Licencia | Formato |
|---|---|---|---|---|---|
| Sanghyang00/ELARSpeech-OmniASR-1B-wrr | 975.681.460 | wardaman (`wrr`) | no disponible | no disponible | safetensors |
| aadel4/omniASR-CTC-1B-v2 (modelo base) | ~1B (no confirmado) | multilingüe (no confirmado) | no disponible | no disponible | no disponible |
| facebook/mms-1b-all | ~965 M | mas de 1.100 lenguas | fragmentos cortos, sin ventana fija documentada | CC-BY-NC 4.0 (no comercial) | safetensors |
| openai/whisper-large-v3 | ~1.550 M | 99 lenguas | 30 s por fragmento | Apache 2.0 | safetensors |

Diferencias clave: frente a MMS-1B-all, este modelo es monolingüe pero potencialmente más preciso en wardaman si el ajuste fino se hizo con datos representativos; frente a Whisper large-v3, no cubre traducción, marcas de tiempo ni puntuación, y no se conoce su licencia, lo que complica su uso comercial. No se dispone de ningún benchmark que permita comparar el WER de estos sistemas en wardaman.

## Limitaciones y advertencias

- Modelo monolingüe: fuera del wardaman la salida no es fiable y probablemente degenerará en transcripciones sin sentido.
- Sin métricas publicadas: no hay WER ni CER, por lo que no se puede afirmar ningún nivel de precisión. El estado PASS se refiere a la verificación del export, no a la calidad del reconocimiento.
- Licencia no disponible: no se puede asumir uso comercial. Hay que verificar además la licencia del modelo base `aadel4/omniASR-CTC-1B-v2` y los términos del corpus ELARSpeech, que pueden restringir el uso.
- Tamaño de la comunidad de hablantes: cualquier sesgo del corpus de ajuste (pocos hablantes, una variedad dialectal concreta, un tipo de grabación concreto) se amplifica con facilidad.
- Variabilidad acústica: la precisión depende de las condiciones de grabación, el micrófono, el ruido de fondo y la población de hablantes, tal como reconoce el propio autor.
- Ortografía no normalizada: al ser un modelo CTC sobre una lengua con convenciones ortográficas en discusión, las transcripciones pueden mezclar variantes.
- Sin puntuación, sin capitalización y sin marcas de tiempo: la salida requiere postprocesado si se destina a subtitulado o a publicación.
- Audio mal preprocesado degrada la salida: es obligatorio remuestrear a 16 kHz y usar mono. Audio estéreo o a otras frecuencias de muestreo producirá resultados incorrectos.
- Riesgo de alucinación en sentido amplio: en tramos de silencio, ruido o habla solapada, un modelo CTC puede emitir caracteres espurios, por lo que conviene filtrar por confianza.
- Fragmentos largos: el codificador transformer escala de forma cuadrática en memoria, así que audios largos deben trocearse en fragmentos, con el riesgo de cortar palabras en las fronteras.
- Adopción nula: cero descargas y cero valoraciones en el momento de redactar esta ficha, sin validación independiente por parte de terceros.
- Uso responsable con comunidades indígenas: la grabación y transcripción de lenguas en peligro exige consentimiento informado y acuerdos de gobernanza de datos con la comunidad hablante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-wrr
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
- Documentación del proyecto ELARSpeech: no disponible
- Paper o informe técnico: no disponible
- Repositorio de código o demo: no disponible
- Referencia comparativa, MMS-1B-all: https://huggingface.co/facebook/mms-1b-all
- Referencia comparativa, Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
