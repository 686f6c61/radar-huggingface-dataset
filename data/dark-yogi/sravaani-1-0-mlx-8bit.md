# dark-yogi/SraVaani-1.0-mlx-8bit

## Resumen

SraVaani-1.0-mlx-8bit es una conversión comunitaria no oficial a MLX del modelo de reconocimiento automático de voz ARTPARK-IISc/SraVaani-1.0, publicada por el usuario dark-yogi. Se trata de un modelo de transcripción de audio (ASR) basado en la arquitectura FastConformer híbrida con decodificación TDT-CTC, orientado principalmente al hindi y con cobertura declarada de otras lenguas indias como el bengalí y el tamil. El modelo base procede de ARTPARK-IISc y viene descrito en el artículo arXiv:2608.08235, centrado en escalar el reconocimiento de voz inclusivo para lenguas indias.

La aportación de esta ficha es puramente de despliegue: no hay reentrenamiento, sino una cuantización a 8 bits de los pesos Linear y Embedding (con grupo 64), manteniendo convoluciones y normalizaciones en precisión completa. El resultado es un fichero safetensors de 501 MB y un recuento de 166.215.866 parámetros en los pesos publicados (la model card del modelo base declara aproximadamente 430 M para el FastConformer original, una discrepancia que conviene tener presente). La licencia es MIT, heredada del modelo base.

Su relevancia actual es práctica: permite ejecutar un sistema ASR indic de calidad cercana al original en portátiles y equipos Apple Silicon sin depender de CUDA ni de GPUs dedicadas, con inferencia sin torch. El autor reporta paridad casi exacta con la versión CUDA original en el benchmark Fleurs hindi, con una velocidad aproximada de 50 veces el tiempo real en un M5 Max.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer híbrida con decodificación TDT-CTC (transducer), portada a MLX |
| Parámetros totales | 166.215.866 según los pesos safetensors publicados; la model card del modelo base declara ~430 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Es un modelo ASR: procesa audio por ventanas mediante un frontend de mel-espectrograma; no se especifica duración máxima de audio |
| Tipos de cuantización | 8 bits (grupo 64) en capas Linear y Embedding; convoluciones y normalizaciones en precisión completa. Existe una versión hermana en bf16 sin cuantizar |
| Idiomas soportados | Hindi (hi), bengalí (bn) y tamil (ta) declarados en la metadata; el modelo base cubre 65 lenguas indias |
| Licencia | MIT |
| Formato de pesos | safetensors (int8 cuantizado, 501 MB) + frontend.npz; requiere la librería MLX y un cargador específico (`load_quantized`) |
| Tokenizador | SentencePiece BPE, 5001 tokens más el token blank |
| Tamaño del repositorio | 0,5 GB |
| Fecha de publicación | 12 de octubre de 2026 (según metadata de HuggingFace) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer híbrido con cabezas TDT y CTC, un diseño habitual en ASR moderno por su eficiencia computacional: el bloque FastConformer reduce el coste de atención mediante downsampling y convoluciones profundamente separables, y la decodificación TDT (Token-and-Duration Transducer) predice simultáneamente el token y su duración, lo que acelera la inferencia frente a transducers clásicos. El modelo original cubre, según su documentación, 65 lenguas indias y ronda los 430 M de parámetros.

Esta ficha concreta no implica ningún entrenamiento nuevo. La model card indica explícitamente que es una conversión comunitaria no oficial sin reentrenamiento: solo se cuantizan a 8 bits con grupo 64 los pesos de las capas Linear y Embedding, dejando convoluciones y normalizaciones en precisión completa. Los detalles sobre el corpus de entrenamiento del modelo original, número de tokens de audio y uso de técnicas de ajuste fino no están disponibles en la información proporcionada y deben consultarse en el artículo arXiv:2608.08235.

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto) en hindi como idioma principal, con bengalí y tamil declarados.
- Cobertura potencial del resto de lenguas indias del modelo base (hasta 65 según la documentación del original), aunque no verificada en esta conversión.
- Decodificación greedy incluida en el código de ejemplo (`greedy_decode`) y soporte de las dos cabezas del modelo híbrido, TDT y CTC.
- Inferencia sin torch: el frontend de mel-espectrograma está portado a MLX y se distribuye como `frontend.npz`.
- Ejecución local en Apple Silicon mediante la librería mlx-audio, con CLI incluida (`transcribe.py`) y opción `--quant` para pesos cuantizados.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio generativo ni generación de texto libre: es exclusivamente un sistema ASR.
- Requiere audio de entrada a 16 kHz y mono; el ejemplo de uso fuerza esa frecuencia con una aserción.

## Casos de uso

- Transcripción local en portátiles Mac: investigadores y desarrolladores que trabajan con audio en hindi pueden transcribir ficheros WAV de 16 kHz directamente en un Mac con Apple Silicon, sin GPU ni conexión a la nube, aprovechando la velocidad reportada de ~50× tiempo real en un M5 Max.
- Subtitulado y localización de contenido audiovisual indic: generación de subtítulos en hindi para vídeo, podcasts o material educativo, con la ventaja de que el procesamiento ocurre en local y el coste marginal por hora de audio es prácticamente nulo.
- Análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones de centros de contacto en India para alimentar análisis de calidad, detección de motivos de contacto o sistemas de búsqueda sobre el texto transcrito.
- Documentación clínica y administrativa dictada: conversión de notas de voz en hindi a texto para su posterior indexación, siempre con revisión humana dado el riesgo de error en nombres propios y terminología técnica.
- Accesibilidad y dictado en aplicaciones macOS: integración como motor ASR dentro de apps de escritorio para usuarios que dictan en hindi, con procesamiento en el dispositivo y sin envío de audio a servidores externos.
- Anotación y pseudo-etiquetado de corpus: generación de transcripciones preliminares sobre grandes volúmenes de audio en lenguas indias para acelerar el trabajo de anotación humana o crear datos de entrenamiento para otros modelos.
- Investigación en ASR multilingüe: punto de partida para experimentos de evaluación y comparación en hindi, bengalí y tamil, con la ventaja de un despliegue sencillo en hardware de consumo.
- Procesamiento con requisitos de privacidad o soberanía del dato: entornos donde el audio no puede salir del dispositivo por motivos legales o de confidencialidad.

## Benchmarks y rendimiento

El autor publica una validación comparativa contra la versión CUDA original del modelo, sobre el benchmark Fleurs en hindi (418 ficheros de audio):

| Métrica | Resultado |
|---|---|
| WER normalizado, MLX 8 bits | 7,51 % |
| WER normalizado, original CUDA | 7,46 % |
| Diferencia absoluta de WER | 0,0005 |
| WER de paridad entre ambas salidas | 0,0038 |
| Transcripciones exactas a nivel de carácter | 387 de 418 |
| Velocidad de inferencia | ~50× tiempo real en M5 Max |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros): no son aplicables a un modelo ASR. Tampoco hay cifras de WER para bengalí ni tamil.

## Requisitos de hardware

- Almacenamiento: 0,5 GB de repositorio; el fichero de pesos cuantizados ocupa 501 MB.
- Memoria: al tratarse de un modelo de 166 M de parámetros en int8, el peso de los pesos ronda los 0,5 GB y el consumo total de RAM durante la inferencia es bajo (previsiblemente por debajo de 2 GB contando frontend y activaciones). No se publica una cifra oficial de VRAM o memoria unificada requerida.
- Hardware compatible: exclusivamente Apple Silicon (M1 y posteriores) con memoria unificada, ya que MLX requiere Metal. No funciona en GPUs NVIDIA ni en CPU x86 sin una reescritura del port.
- GPU dedicadas: no aplica (A100, H100, RTX 4090 no son compatibles con este port; para esas plataformas debe usarse el modelo base ARTPARK-IISc/SraVaani-1.0).
- Cabe en cualquier Mac con Apple Silicon: no requiere GPU dedicada ni memoria unificada alta; la cifra reportada de ~50× tiempo real corresponde a un M5 Max.
- Opciones de despliegue: mlx-audio como librería principal, más los scripts incluidos (`transcribe.py` para CLI y `sravaani_mlx.py` / `frontend_mlx.py` para uso programático). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no cubren este tipo de modelo ASR.
- Dependencias: Python 3.10 o superior, mlx>=0.20, mlx-audio, sentencepiece, soundfile y numpy. torch no es necesario en inferencia.
- Nota crítica de despliegue: los pesos usan el formato QuantizedLinear y deben cargarse obligatoriamente con `load_quantized()`; cargarlos con `load_weights` en un modelo en coma flotante falla.
- Latencia y throughput: no se publican valores absolutos en milisegundos por segundo de audio; solo la referencia de ~50× tiempo real en M5 Max.

## Comparativa con modelos similares

Los datos de los modelos alternativos no proceden de la información proporcionada, sino de referencias públicas generales, y pueden variar según la versión consultada.

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SraVaani-1.0-mlx-8bit | 166.215.866 en safetensors (base ~430 M declarados) | Audio por ventanas, 16 kHz mono, duración máxima no disponible | Hindi, bengalí, tamil (base: 65 lenguas indias) | MIT | MLX / Apple Silicon |
| SraVaani-1.0 (base, ARTPARK-IISc) | ~430 M | Audio por ventanas | 65 lenguas indias | MIT | PyTorch / CUDA, precisión completa |
| Whisper large-v3 (OpenAI) | ~1.550 M | Ventanas de 30 s de audio | ~99 idiomas (incluye hindi, no centrado en lenguas indias) | MIT | PyTorch, múltiples formatos de despliegue |
| Whisper small (OpenAI) | ~244 M | Ventanas de 30 s de audio | ~99 idiomas | MIT | PyTorch, múltiples formatos |
| IndicConformer (AI4Bharat) | No disponible en la información proporcionada | No disponible | Lenguas indias | No disponible | No disponible |

La comparación directa de rendimiento entre estos modelos no es posible con los datos disponibles: solo se publica WER en Fleurs hindi para el par MLX frente a CUDA, sin comparación contra Whisper ni IndicConformer.

## Limitaciones y advertencias

- Conversión no oficial: no está respaldada por el equipo autor del modelo base; no hay garantía de mantenimiento ni de soporte ante incidencias.
- Cuantización con pérdida: el autor reconoce que 31 de los 418 ficheros de validación no coinciden carácter a carácter con la salida original y atribuye las diferencias a ruido de cuantización, sin pérdida estructural detectada.
- Marco de evaluación limitado: la validación se realiza solo en hindi (Fleurs). No hay datos de WER para bengalí ni tamil, pese a estar declarados en la metadata, ni información sobre dialectos, acentos regionales o audio con ruido de fondo.
- Dependencia estricta del cargador: usar `load_weights` en lugar de `load_quantized()` provoca fallos, lo que añade fricción en integraciones propias.
- Formato de audio obligatorio: 16 kHz mono en WAV; otro tipo de entrada requiere preprocesado previo.
- Plataforma única: solo Apple Silicon con MLX. No hay soporte CUDA, ROCm ni CPU genérica en este port.
- Naturaleza del modelo: es un sistema ASR, no un modelo de lenguaje. No soporta instrucciones, razonamiento, generación de texto libre, tool calling ni agentes, por lo que no debe evaluarse con benchmarks de LLM.
- Riesgo de alucinación: como todo modelo ASR basado en transducer, puede producir palabras plausibles en tramos de silencio, ruido o habla solapada; conviene aplicar umbrales de confianza o puntuación de probabilidad en producción.
- Sesgos potenciales: el comportamiento depende por completo de la distribución del corpus de entrenamiento del modelo base, no documentada en esta ficha; es esperable un rendimiento inferior en variedades dialectales o registros poco representados.
- Terminología y entidades nombradas: los nombres propios, siglas y vocabulario técnico en hindi son puntos típicos de error; en entornos clínicos, legales o financieros se recomienda revisión humana.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar la licencia del modelo base (ARTPARK-IISc/SraVaani-1.0) antes de desplegarlo en producto.
- Recuento de parámetros discrepante: los 166 M de los safetensors frente a los ~430 M declarados para el base pueden inducir a error al planificar recursos; no se explica el motivo de la diferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dark-yogi/SraVaani-1.0-mlx-8bit
- Modelo base: https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- Versión hermana en bf16: https://huggingface.co/dark-yogi/SraVaani-1.0-mlx-bf16
- Artículo del modelo base: https://arxiv.org/abs/2608.08235
- Cita BibTeX recogida en la model card: Pulikodan, S.; Basu, A.; Kumar J, P.; Bhat, P. D.; Shukla, S.; Desai, N.; Ghosh, P. K. — "SraVaani 1.0: Scaling Inclusive Speech Recognition for Indic Languages", 2026, arXiv:2608.08235 (eess.AS).
