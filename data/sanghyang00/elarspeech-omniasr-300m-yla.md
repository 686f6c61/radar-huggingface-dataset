# Sanghyang00/ELARSpeech-OmniASR-300M-yla

## Resumen

ELARSpeech-OmniASR-300M-yla es un modelo de reconocimiento automático del habla (ASR) monolingüe para el ulwa (código ISO 639-3 `yla`), una lengua de la familia misumalpa hablada en la costa caribeña de Nicaragua. Lo publica el usuario Sanghyang00 dentro del proyecto ELARSpeech, y se distribuye como un ajuste fino del checkpoint `aadel4/omniASR-CTC-300M-v2` sobre HuggingFace. El repositorio está etiquetado con `transformers`, `safetensors` y el pipeline `automatic-speech-recognition`.

Técnicamente es un `Wav2Vec2ForCTC`: un extractor convolucional de características de audio seguido de un encoder transformer y una cabeza de clasificación CTC. El recuento real de parámetros en los pesos publicados es de 325.984.945 (unos 326 millones), aunque el autor lo denomina "300M". El repo ocupa 1,3 GB en safetensors en precisión completa. No hay datos publicados sobre el número de tokens o horas de audio usados en el ajuste fino, ni sobre la composición del corpus de ulwa.

Su relevancia es acotada pero clara: se trata de un modelo para una lengua de bajos recursos, un ámbito donde la mayoría de los sistemas ASR comerciales no ofrecen cobertura alguna. La model card indica que el artefacto exportado se verificó contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluación, con estado **PASS** en verificación de transcripción exacta. No se han publicado resultados de benchmarks ni métricas de WER/CER.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (extractor convolucional de audio + encoder transformer + cabeza CTC) |
| Parámetros totales | 325.984.945 (~326 M; denominado comercialmente como 300 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; la entrada es audio mono a 16 kHz, no una secuencia de tokens |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors en precisión completa) |
| Idiomas soportados | ulwa (ISO 639-3: `yla`); modelo monolingüe |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repo: 1,3 GB) |
| Librería | transformers |
| Pipeline | automatic-speech-recognition |
| Modelo base | aadel4/omniASR-CTC-300M-v2 |
| Fecha de publicación | 2026-10-14 (última actualización: 2026-10-14) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es `Wav2Vec2ForCTC`, el esquema clásico de ASR sin decodificador autorregresivo: una pila de capas convolucionales convierte la forma de onda en una secuencia de representaciones latentes, un encoder transformer las contextualiza y una capa lineal proyecta cada fotograma sobre el vocabulario de caracteres, entrenándose con la pérdida CTC. Esto implica que la decodificación típica es greedy (`argmax` sobre los logits) o con búsqueda por haz, y que la alineación audio-texto es implícita, sin necesidad de transcripciones alineadas a nivel de fonema.

No hay información publicada sobre el proceso de entrenamiento: ni el volumen de horas de audio, ni el número de tokens vistos, ni la composición del corpus de ulwa, ni si se aplicaron técnicas como especulación de velocidad, aumento de datos o ajuste de la tasa de aprendizaje. Tampoco se documenta si el ajuste partió de un fine-tuning completo o de un entrenamiento con capas congeladas. Lo único verificable es la relación de parentesco con el checkpoint `aadel4/omniASR-CTC-300M-v2` y el resultado de la verificación de transcripción exacta (**PASS**) frente a ese checkpoint original sobre una muestra fija de evaluación.

## Capacidades

- Reconocimiento de voz a texto en ulwa, con salida a nivel de carácter mediante decodificación CTC.
- Procesamiento de audio mono a 16 kHz como formato de entrada obligatorio.
- Inferencia por lotes mediante `processor` y decodificación con `batch_decode`.
- Integración nativa en el ecosistema `transformers` (`AutoProcessor` + `Wav2Vec2ForCTC`), lo que facilita su uso dentro de pipelines de `datasets` y `pipeline("automatic-speech-recognition")`.
- Capacidad de *fine-tuning* posterior sobre el propio checkpoint, al ser un modelo abierto en safetensors.
- No se documenta soporte de *tool calling*, *function calling*, uso como agente, razonamiento multi-paso, visión, audio generativo, diarización de hablantes, puntuación automática ni etiquetado de mayúsculas.
- No se documenta multilingüismo: la etiqueta de idioma es exclusivamente `yla`.

## Casos de uso

- Documentación y revitalización del ulwa: transcripción automática de grabaciones de hablantes nativos para construir corpus escritos que alimenten diccionarios, gramáticas y materiales didácticos, un escenario donde apenas existen herramientas específicas para esta lengua.
- Archivado de trabajo de campo lingüístico: procesar por lotes horas de entrevistas grabadas en 16 kHz mono para obtener transcripciones preliminares que el investigador corrige después, reduciendo el tiempo de transcripción manual.
- Pre-anotación para herramientas como ELAN o Praat: generar una capa de segmentos textuales que el lingüista alinea y refina, en lugar de transcribir desde cero.
- Generación de subtítulos para material audiovisual comunitario: vídeos, radio comunitaria o testimonios orales en ulwa, usando la salida CTC como base de subtítulos que después se revisan y sincronizan.
- Corpus para investigación fonética y fonológica: al emitir secuencias de caracteres alineables con los fotogramas de audio, permite estudiar patrones de duración, elisión o variación dialectal a partir de transcripciones masivas.
- Búsqueda por palabra clave en archivos de audio: indexar un archivo sonoro transcrito con el modelo para localizar pasajes concretos por término, útil en fonotecas y archivos orales.
- Educación bilingüe: apoyo a docentes que preparan materiales en ulwa a partir de grabaciones de clase o de cuentos tradicionales narrados.
- Prototipado de asistentes de voz en lengua minoritaria: con el modelo como primer eslabón de ASR, se puede construir un demostrador de dictado o de consulta por voz, asumiendo tasas de error no verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara que el artefacto exportado se comprobó contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluación, con estado **PASS** en verificación de transcripción exacta. No se proporcionan valores de WER, CER, MMLU, HumanEval ni de ningún otro conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 1,30 GB, por lo que con activaciones y buffers de audio conviene reservar entre 2 y 3 GB; en fp16/bf16 baja a unos 0,65 GB de pesos y alrededor de 1,5 GB de uso total; una cuantización a int8 reduciría los pesos a unos 0,33 GB, pero no hay artefactos cuantizados publicados.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 o H100; en estas dos últimas el modelo queda sobredimensionado y el cuello de botella será el preprocesado de audio y el I/O.
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta moderna con al menos 4 GB de VRAM; también es viable en CPU para clips cortos, aunque la latencia no está documentada.
- Opciones de despliegue: `transformers` con PyTorch es la vía soportada oficialmente (el ejemplo de la model card usa `AutoProcessor`, `Wav2Vec2ForCTC` y `librosa`). Es exportable a ONNX mediante `optimum` para servir con ONNX Runtime, algo habitual en modelos Wav2Vec2. No está soportado de forma nativa por vLLM ni por TGI, que no cubren el pipeline CTC de Wav2Vec2, y no tiene sentido en llama.cpp u Ollama porque no es un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponible. No se publican mediciones de RTF (factor de tiempo real), latencia por clip ni muestras por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-OmniASR-300M-yla | Wav2Vec2 + CTC | ~326 M | ulwa (`yla`) | no disponible | HuggingFace (0 descargas) |
| facebook/wav2vec2-xls-r-300m | Wav2Vec2 + CTC | ~317 M | 128 idiomas; cobertura de ulwa no confirmada | Apache-2.0 | HuggingFace, ampliamente usado |
| facebook/mms-300m | Wav2Vec2 + CTC | ~317 M | más de 1.100 idiomas; cobertura de ulwa no confirmada | CC-BY-NC 4.0 | HuggingFace |
| openai/whisper-small | Encoder-decoder transformer | 244 M | 99 idiomas; cobertura de ulwa no confirmada | Apache-2.0 | HuggingFace, múltiples runtimes |

La comparación es estructural: no existen métricas publicadas de este checkpoint frente a los anteriores, por lo que no puede afirmarse cuál transcribe mejor el ulwa. La ventaja diferencial del modelo es su especialización declarada en esa lengua frente a alternativas multilingües genéricas, a cambio de una licencia indeterminada y de cero adopción registrada.

## Limitaciones y advertencias

- Modelo monolingüe: no debe esperarse un comportamiento correcto fuera del ulwa, y la model card advierte explícitamente de que se trata de un ASR de una sola lengua.
- Precisión variable: el propio autor señala que la exactitud depende de las condiciones de grabación, la población de hablantes, la ortografía empleada y el dominio. No hay métricas cuantitativas que permitan acotar ese error.
- Sesgos potenciales: al no documentarse la composición del corpus de ajuste, no puede evaluarse el equilibrio por sexo, edad, dialecto o variante geográfica de los hablantes; es probable un sesgo hacia la variedad y las condiciones de grabación presentes en los datos de entrenamiento.
- Riesgo de errores de sustitución, inserción y omisión propios de CTC, especialmente con ruido de fondo, solapamiento de hablantes o audio telefónico; no existe un mecanismo de verificación de confianza más allá de los logits.
- Sin puntuación ni mayúsculas documentadas: la salida CTC suele ser texto plano en minúsculas, algo que hay que asumir si no se añade posprocesado.
- Preprocesado obligatorio: la entrada debe ser audio mono remuestreado a 16 kHz; usar otra frecuencia degrada la transcripción.
- Licencia no disponible: al no especificarse términos de uso, no puede confirmarse la legalidad del uso comercial ni las obligaciones de atribución. La model card remite a la documentación del proyecto ELARSpeech para los términos del conjunto de datos y al repositorio del modelo base para su licencia, enlaces que no se proporcionan.
- Estado de verificación: la verificación **PASS** se refiere a la coincidencia con el checkpoint original sobre una muestra fija, no a una validación independiente de calidad.
- Adopción nula y metadatos incompletos: cero descargas, cero interacciones y ausencia de ficha de vocabulario, por lo que conviene auditar los ficheros del tokenizador antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-300M-yla
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-300M-v2
- Documentación del proyecto ELARSpeech (citada en la model card, sin URL proporcionada): no disponible
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
