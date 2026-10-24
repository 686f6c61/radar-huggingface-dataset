# NewGame/libritts_esp2_gan_tts_train_vits_libritts

## Resumen

`NewGame/libritts_esp2_gan_tts_train_vits_libritts` es un checkpoint de síntesis de voz (TTS) empaquetado con ESPnet3 dentro del sistema `esp2_gan_tts`, generado a partir de la receta `egs3/libritts/esp2_gan_tts` y del corpus LibriTTS. No es un modelo de lenguaje: es un modelo texto-a-onda end-to-end de tipo VITS (autoencoder variacional condicional con flujo normalizador, predictor estocástico de duración y decodificador tipo HiFi-GAN) entrenado de forma adversarial contra un discriminador multi-escala y multi-periodo.

El bundle contiene 96.378.782 parámetros, todos entrenables y en `torch.float32` (385,52 MB de pesos, 0,4 GB de repositorio). El modelo opera a 22.050 Hz, consume fonemas (59 unidades, G2P `espeak_ng_english_us_vits` y limpiador `tacotron`) y se condiciona por un embedding de hablante de 192 dimensiones extraído con `speechbrain/spkrec-ecapa-voxceleb`, por lo que es multi-hablante dentro del dominio de LibriTTS.

Su interés es de nicho: es uno de los pocos artefactos públicos con el nuevo formato de publicación de ESPnet3 (`model_pack` + API `espnet3.publication.InferenceModel`) y sirve como referencia reproducible para estudiar el pipeline VITS completo (texto → espectrograma lineal 513 bins → onda) con vocoder integrado. Conviene señalar desde el principio que el repositorio no declara licencia, no incluye métricas de evaluación y acumula 0 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text encoder transformer + posterior encoder + flujo normalizador + predictor estocastico de duracion + decodificador HiFi-GAN), entrenamiento GAN con discriminador multi-escala y multi-periodo |
| Parametros totales | 96.378.782 (100 % entrenables, 0 no entrenables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de texto; el entrenamiento filtro enunciados de 1,0 a 20,0 s de audio |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye solo en float32 (sin variantes GGUF, ONNX ni int8 publicadas) |
| Idiomas soportados | no disponible en la model card; el corpus es LibriTTS (ingles) y el G2P configurado es `espeak_ng_english_us_vits` |
| Licencia | no disponible |
| Formato de pesos | bundle `model_pack` de ESPnet3 (checkpoint PyTorch float32, 385,52 MB); safetensors no confirmado |
| Frecuencia de muestreo | 22.050 Hz (hop 256, n_fft 1024, ventana ≈ 11,6 ms) |
| Entrada de texto | fonemas (59 tokens, incluidos `<blank>`, `<unk>`, `<sos/eos>`), limpiador `tacotron` |
| Condicionamiento de hablante | x-vector de 192 dimensiones (ECAPA-TDNN, VoxCeleb); `global_channels: 256` |
| Vocabulario | 59 unidades foneticas |
| Corpus de entrenamiento | LibriTTS (audiolibros en ingles) |
| Sistema / receta | `esp2_gan_tts` / `egs3/libritts/esp2_gan_tts`, rama `libritts_vits`, commit `913f8e9` (dirty) |
| Clase del modelo | `ESPnetGANTTSModel` |
| Tamano del repositorio | 0,4 GB (buffers: 41.040, 164,16 KB; 1.129 modulos, 819 hojas) |

## Arquitectura y entrenamiento

El modelo sigue la formulacion VITS de forma literal: un text encoder de 6 bloques transformer con atencion relativa y codificacion posicional relativa (2 cabezas, `conv1d` positionwise de kernel 3, estilo macaron, activacion swish, pre-normalizacion), un posterior encoder de 16 capas con kernel 5 y weight norm que aprende la distribucion latente a partir del espectrograma lineal de 513 bins, un flujo normalizador de 4 pasos (`flow_flows: 4`, 4 capas por paso, `use_only_mean_in_flow: true`) y un predictor estocastico de duracion con 4 flujos y 3 capas convolucionales DDS. El decodificador es un generador HiFi-GAN de 512 canales con escalas de submuestreo 8/8/2/2 (factor total 256, coherente con hop 256 y 22.050 Hz), bloques residuales de kernel 3, 7 y 11 con dilataciones (1, 3, 5) y weight norm. El discriminador es un `hifigan_multi_scale_multi_period_discriminator` con 128 canales base y hasta 1.024 canales tras el submuestreo.

El entrenamiento se realizo sobre LibriTTS, con filtrado previo de enunciados fuera del rango 1-20 s, tokenizacion fonemica mediante `espeak_ng_english_us_vits` y limpieza `tacotron`, y condicionamiento por hablante con embeddings ECAPA precalculados sobre los splits train/valid/test. No se especifica el numero de tokens, horas efectivas ni la composicion final del dataset. No hay fases de RLHF ni DPO: el paradigma es puramente GAN + VAE (perdida adversarial, KL y perdida de duracion), y no se documenta ninguna innovacion adicional como decodificacion especulativa o atencion lineal. El propio autor indica que el estado de Git era "dirty" al empaquetar y que las metricas no se incluyeron en el bundle (habria que ejecutar la etapa `measure` antes de `pack_model`).

## Capacidades

- Sintesis de voz multi-hablante en ingles a 22.050 Hz a partir de texto, con salida de onda directa (vocoder integrado, sin etapa separada).
- Control de identidad vocal mediante x-vector de 192 dimensiones: se puede fijar, intercambiar o interpolar embeddings de hablante.
- Conversion texto → fonemas con `espeak_ng_english_us_vits` y normalizacion `tacotron` para el texto de entrada.
- Modelado de prosodia y duracion estocastica (predictor de duracion con flujos), lo que permite variabilidad natural entre muestras.
- Generacion de audio en un solo paso de inferencia, sin decodificacion autorregresiva.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades de vision, audio de entrada, código, matematicas ni dialogo conversacional.
- Capacidad multilingue: no declarada; la configuracion de G2P y el corpus apuntan exclusivamente al ingles.

## Casos de uso

- Locucion de articulos y audiolibros en ingles: el modelo convierte texto plano en onda a 22,05 kHz con un solo pase, lo que abarata la generacion por lotes de horas de audio; conviene trocear el texto en fragmentos por debajo de los 20 s de audio, limite usado durante el entrenamiento.
- Prototipado y reproduccion de la receta ESPnet3: al ser un bundle `model_pack` completo con configuracion YAML, sirve para validar el flujo `esp3` de entrenamiento, medicion y empaquetado antes de escalar a corpus propios.
- Punto de partida para fine-tuning de dominio: con 96,4 M de parametros y 385 MB en fp32, se puede reentrenar el generador sobre un corpus pequeno (por ejemplo, voces corporativas) en una unica GPU consumer.
- Aumento de datos para ASR: generar variaciones de voz y prosodia controladas por x-vector para ampliar el material de entrenamiento de reconocedores de habla en ingles.
- Evaluacion comparativa de sistemas TTS: sirve como baseline VITS "de referencia" frente a arquitecturas mas recientes (flow matching, difusion) en pruebas internas de naturalidad y RTF, siempre que se ejecute antes la etapa `measure`.
- Accesibilidad y lectura asistida: integracion en lectores de pantalla o sistemas de lectura de documentos en ingles donde se requiere baja latencia y no se depende de servicios en la nube.
- Investigacion en privacidad y consentimiento vocal: al exponer el condicionamiento por embedding de hablante, permite estudiar hasta que punto un x-vector reproduce caracteristicas de hablantes del corpus de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas no se empaquetaron ("Metrics were not bundled. Run the `measure` stage before `pack_model` to include evaluation results"), por lo que no existen valores de MOS, MCD, WER ni comparaciones numericas verificables para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp32 para lote unitario (0,39 GB de pesos mas activaciones y contexto CUDA); es una estimacion por tamano, no una medida publicada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria sirve para inferencia; para fine-tuning conviene una RTX 3090/4090 (24 GB) o una A100/H100 si se entrena con lotes grandes y audio de hasta 20 s.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna (GTX 1060 6 GB, RTX 3060, RTX 4060, etc.), al ser un modelo de 96 M de parametros.
- Inferencia en CPU: viable por tamano, aunque no hay medidas de RTF publicadas; para produccion en CPU conviene exportar a ONNX o usar los binarios de ESPnet con hilos ajustados.
- Opciones de despliegue: API `espnet3.publication.InferenceModel` (la documentada en la model card), scripts de `espnet2.bin.tts_inference`, exportacion ONNX mediante las utilidades de ESPnet. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; no se han publicado medidas de RTF ni de tiempo por caracter.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada / frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NewGame/libritts_esp2_gan_tts_train_vits_libritts | VITS + HiFi-GAN (GAN end-to-end) | 96,4 M (fp32) | Fonemas, 22.050 Hz | no disponible | HuggingFace, bundle ESPnet3, 0 descargas |
| Receta oficial `egs2/libritts/tts1` (ESPnet) | VITS / FastSpeech2 + vocoder | no disponible | Texto/fonemas, frecuencia segun configuracion | codigo Apache 2.0 (ESPnet); pesos no publicados como checkpoint unico | Repositorio GitHub, requiere entrenamiento |
| Coqui TTS VITS (checkpoints publicos) | VITS | no disponible | Texto/fonemas, 22.050 Hz en configuraciones habituales | codigo MPL-2.0; licencia de cada checkpoint no especificada | Repositorio GitHub y zoo de modelos |
| NewGame/libritts_f5tts_training | F5-TTS (flow matching + DiT) | no disponible | Texto, condicionamiento por referencia de audio | no disponible | HuggingFace |
| speechbrain/tts-hifigan-libritts-22050Hz | Vocoder HiFi-GAN (no es TTS completo) | no disponible | Espectrograma → onda, 22.050 Hz | Apache 2.0 | HuggingFace |

Nota: la comparacion con `speechbrain/tts-hifigan-libritts-22050Hz` es solo de complementariedad (vocoder suelto frente a sistema completo); las cifras de parametros de los modelos alternativos no estan disponibles en la informacion consultada.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no hay autorizacion clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue en produccion.
- Ausencia total de metricas: no hay MOS, MCD ni evaluacion subjetiva que respalde la calidad del checkpoint; el autor no ejecuto la etapa `measure`.
- El nombre contiene "esp2", que puede confundirse con espanol; el G2P configurado es `espeak_ng_english_us_vits` y el corpus es LibriTTS (ingles), por lo que no hay evidencia de soporte de castellano.
- Riesgo de pronunciacion incorrecta en palabras fuera del vocabulario fonetico, siglas, numeros y nombres propios, dado que la tokenizacion depende de `espeak-ng` y del limpiador `tacotron`.
- Artefactos tipicos de VITS: repeticiones, omisiones de palabras y ruido en el decodificador con entradas fuera de dominio o frases muy largas; hay que trocear el texto (limite practico cercano a los 20 s de audio vistos en entrenamiento).
- Sesgos del corpus: LibriTTS procede de audiolibros de dominio publico (LibriVox), con una distribucion de voces y acentos desequilibrada hacia ingles estadounidense y lectores adultos; el modelo heredara esas caracteristicas y puede reproducir peor otras variedades.
- Riesgo de suplantacion de identidad: el condicionamiento por x-vector permite aproximar voces del corpus; el uso para clonacion sin consentimiento es un problema etico y potencialmente legal.
- Procedencia y cadena de suministro: el bundle se genero desde un fork personal (`github.com/NewGamezzz/espnet`) con estado Git "dirty", 0 descargas y 1 like; conviene inspeccionar los pesos antes de usarlos en entornos sensibles.
- Sin soporte documentado de cuantizacion ni de formatos alternativos, lo que limita el despliegue en entornos con restricciones de memoria estrictas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NewGame/libritts_esp2_gan_tts_train_vits_libritts
- Receta oficial ESPnet LibriTTS TTS (egs2): https://github.com/espnet/espnet/blob/master/egs2/libritts/tts1/README.md
- Repositorio ESPnet: https://github.com/espnet/espnet
- Fork declarado en el bundle: https://github.com/NewGamezzz/espnet
- Documentacion de VITS en Coqui TTS: https://github.com/coqui-ai/TTS/blob/dev/docs/source/models/vits.md
- Vocoder HiFi-GAN LibriTTS 22.050 Hz (SpeechBrain): https://huggingface.co/speechbrain/tts-hifigan-libritts-22050Hz
- Otro checkpoint del mismo autor (F5-TTS sobre LibriTTS): https://huggingface.co/NewGame/libritts_f5tts_training
- Paper de VITS (Kim et al., 2021): https://arxiv.org/abs/2106.06103
- Paper de HiFi-GAN (Kong et al., 2020): https://arxiv.org/abs/2010.05646
