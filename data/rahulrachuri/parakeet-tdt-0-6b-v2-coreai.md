# rahulrachuri/parakeet-tdt-0.6b-v2-coreai

## Resumen

El modelo `parakeet-tdt-0.6b-v2-coreai` es una exportación del sistema de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v2` al formato propietario Core AI (`.aimodel`) de Apple, realizada por el desarrollador Rahul Rachuri. El modelo original, desarrollado por NVIDIA, emplea una arquitectura FastConformer combinada con un decodificador Transducer de Token y Duración (TDT) y cuenta con aproximadamente 600 millones de parámetros. Esta versión para Apple Silicon divide el modelo en tres grafos independientes (encoder, predictor y joint) que el host debe orquestar para realizar la inferencia.

La relevancia de esta conversión radica en que permite ejecutar un ASR de alta calidad directamente en dispositivos Apple (iPhone, iPad, Mac con chips M-series) sin depender de la nube. Según las mediciones del autor, en un Apple M4 Pro el pipeline alcanza un factor de 291x tiempo real a plena precisión, lo que permite transcribir una hora de audio en menos de 15 segundos. Es, según el autor, el primer port público de la versión v2 de Parakeet al formato Core AI, y mantiene los mismos pesos del modelo original sin reentrenamiento, solo con cambios de precisión (fp16 para el encoder y fp32 para las redes predictor y joint).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + Transducer TDT (Token-and-Duration) |
| Parametros totales | 600 millones (modelo original); pesos exportados en fp16/fp32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana fija de 2885 frames de mel (28.85 segundos a 16 kHz) |
| Tipos de cuantizacion | fp16 (encoder), fp32 (predictor y joint) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.aimodel` (Core AI), binarios raw fp32 para predictor/joint, tokenizer JSON |

## Arquitectura y entrenamiento

El modelo base `nvidia/parakeet-tdt-0.6b-v2` emplea un encoder FastConformer (una variante del conformer con atencion eficiente) que procesa caracteristicas de mel de 128 bandas con normalizacion por ventana completa. El decodificador es un Transducer TDT que predice simultaneamente el token de salida y su duracion (0 a 4 frames), lo que permite una decodificacion greedy sin busqueda en haz. El modelo fue entrenado por NVIDIA sobre un corpus de habla inglesa con puntuacion y capitalizacion, y soporta prediccion de timestamps.

La exportacion a Core AI no modifica los pesos ni realiza reentrenamiento; solo convierte los tensores a los formatos requeridos por el runtime de Apple. El encoder se exporta con una ventana estatica de 2885 frames de mel (equivalente a 28.85 segundos), tras tres submuestreos de stride 2 que reducen la salida a 361 frames. El predictor y el joint se mantienen en fp32 con estado LSTM explicito de entrada y salida. El front-end exige un calculo de mel muy concreto: preemphasis 0.97, ventana Hann centrada de 400 muestras en un frame de 512 con padding constante, hop de 160, 128 bandas slaney con fmax 8000 y logaritmo natural, seguido de normalizacion por media y varianza sobre toda la ventana.

## Capacidades

- Reconocimiento automatico del habla en ingles con puntuacion y capitalizacion.
- Prediccion de timestamps a nivel de token mediante las duraciones emitidas por el decodificador TDT.
- Decodificacion greedy sin busqueda en haz, lo que reduce la latencia.
- Ejecucion nativa en Apple Silicon (M-series) mediante el framework Core AI, con soporte para CPU y GPU.
- Alta velocidad de inferencia: 291x tiempo real en M4 Pro a plena precision.
- Compatible con audio de 16 kHz mono, con entrada de hasta 28.85 segundos por pasada (audio mas largo debe segmentarse).
- No soporta tool calling, agentes ni capacidades multimodales; es exclusivamente un modelo de transcripcion.

## Casos de uso

- Transcripcion de audiolibros: el autor demuestra la transcripcion de un audiolibro de 10 horas en un iPhone en 5 minutos, lo que permite generar texto completo de largas grabaciones sin conexion.
- Subtitulado automatico de video: el modelo puede generar subtitulos con timestamps precisos para videos de hasta 28.85 segundos por segmento, ideal para produccion de contenido.
- Transcripcion de reuniones y entrevistas: con una ventana de contexto de casi 29 segundos, puede procesar turnos de habla largos sin cortes frecuentes, manteniendo la puntuacion natural.
- Asistentes de voz en dispositivos Apple: al ejecutarse localmente, permite dictado y comandos de voz sin enviar audio a la nube, mejorando la privacidad y reduciendo la latencia.
- Analisis de llamadas de atencion al cliente: integrado en una app de iOS o macOS, puede transcribir conversaciones en tiempo real o de forma asincrona para su posterior analisis de sentimiento o extraccion de metricas.
- Generacion de actas medicas o legales: la alta precision (1.97% WER en LibriSpeech test-clean) y la puntuacion automatica facilitan la creacion de documentos a partir de dictados profesionales.
- Podcasting y periodismo: transcripcion rapida de episodios completos para generar articulos, resumenes o busqueda de contenido.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en LibriSpeech (conjunto completo de 5559 utterances) para la configuracion de exportacion:

| Dataset | WER |
|---|---|
| LibriSpeech test-clean | 1.97% |
| LibriSpeech test-other | 4.29% |

El autor indica que la ventana fija de 28.85 segundos penaliza las utterances muy cortas (por debajo de unos pocos segundos), mientras que en el rango de 10 a 20 segundos el rendimiento supera la cifra publicada por NVIDIA de 1.69% WER en test-clean. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Dispositivos Apple con chip M-series (M1, M2, M3, M4) o iPhone/iPad con Neural Engine; las mediciones se realizaron en un M4 Pro.
- VRAM estimada: el encoder en fp16 ocupa 1.1 GB, el predictor 29 MB y el joint 2.5 MB, por lo que cabe en la memoria unificada de cualquier Apple Silicon (minimo 8 GB recomendado para comodidad).
- GPU recomendada: GPU integrada del chip Apple Silicon; el autor recomienda fijar el predictor y el joint a la CPU (compute unit CPU) y mantener el encoder en GPU.
- No es compatible con CUDA, ROCm ni otras plataformas; solo Core AI en Apple.
- Opciones de despliegue: framework Core AI de Apple, con gestion manual de grafos mediante `ComputeStream`; no se soporta vLLM, llama.cpp ni Ollama.
- Latencia: 291x tiempo real a plena precision en M4 Pro (aproximadamente 284x tipico, 260x bajo carga de escritorio).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v2 (NVIDIA original) | 600M | Ventana dinamica (sin limite fijo) | 1.69% (publicado) | CC-BY-4.0 | PyTorch (HF) |
| parakeet-tdt-0.6b-v2-coreai (este modelo) | 600M | 28.85 s fijos | 1.97% (medido) | CC-BY-4.0 | Core AI (.aimodel) |
| Whisper small | 244M | 30 s | ~3.0% (aprox.) | MIT | PyTorch, ONNX, etc. |

Los datos de Whisper small son aproximados y no se han verificado en esta ficha; se incluyen solo como referencia orientativa. La comparacion directa entre el modelo original y esta exportacion muestra una pequena perdida de precision (1.97% frente a 1.69%) atribuible a la ventana fija y a la conversion de precision, pero a cambio se obtiene una velocidad muy superior en hardware Apple.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilingue.
- La ventana fija de 28.85 segundos requiere segmentacion previa del audio; audios mas cortos deben rellenarse con silencio a nivel de forma de onda, no con ceros en la matriz de mel, o la transcripcion se degrada notablemente.
- El front-end es muy especifico (preemphasis, ventana, normalizacion); cualquier desviacion en el preprocesado produce resultados incorrectos.
- No se incluye un pipeline completo de segmentacion; el usuario debe implementar la division del audio y la orquestacion de los tres grafos.
- Riesgo de alucinacion bajo pero presente en habla ambigua o ruidosa; no se han publicado evaluaciones de sesgo.
- La licencia CC-BY-4.0 permite uso comercial con atribucion a NVIDIA y al autor de la conversion.
- No es compatible con entornos de servidor tradicionales (CUDA, x86); esta limitado a ecosistema Apple.
- No se proporcionan pesos en formato GGUF, safetensors ni ONNX; solo `.aimodel` y binarios raw para el predictor/joint.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/rahulrachuri/parakeet-tdt-0.6b-v2-coreai
- Repositorio del modelo original (formato HF): https://huggingface.co/rahulrachuri/parakeet-tdt-0.6b-v2
- Modelo original de NVIDIA en HuggingFace: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Blog del autor con mediciones y detalles del port: https://rachuri.me/blog/parakeet-apple-silicon/
- Pagina del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/parakeet-tdt-0_6b-v2
- Repositorio GitHub de referencia (jasonhoblin): https://github.com/jasonhoblin/nvidia-parakeet-tdt-0.6b-v2
