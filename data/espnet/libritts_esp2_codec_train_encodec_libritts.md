# espnet/libritts_esp2_codec_train_encodec_libritts

## Resumen

`espnet/libritts_esp2_codec_train_encodec_libritts` es un códec neuronal de audio entrenado con ESPnet3 sobre el corpus LibriTTS. No es un modelo de lenguaje: es un códec de voz que convierte una forma de onda en códigos discretos y la reconstruye de nuevo, siguiendo el esquema de EnCodec (codificador convolucional, cuantizador vectorial residual y decodificador). Lo publica el proyecto ESPnet dentro de su receta `egs3/libritts/esp2_codec`, con autoría del usuario `thanapattrachu`.

El modelo es pequeño: 20.175.980 parámetros entrenables (unos 80,7 MB en float32), más 33,6 millones de valores en buffers (normalizaciones y estadísticas del cuantizador). Trabaja a 24 kHz, mono, y ofrece un cuantizador residual de 32 etapas con 1024 entradas por etapa, con anchos de banda objetivo de 2, 4, 8, 16 y 32 kbps. Su relevancia es la de un componente de infraestructura: sirve como tokenizador acústico para modelos de voz generativos (TTS, codec language models) y como base reproducible para experimentar con códecs neuronales en ESPnet.

La model card no documenta idiomas, licencia ni pipeline de Hugging Face, y el repositorio tiene un uso muy bajo (26 descargas, 0 likes). Conviene tratarlo como un artefacto de investigación reproducible dentro del ecosistema ESPnet, no como un producto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Códec neuronal tipo EnCodec: codificador y decodificador convolucionales con LSTM, cuantizador vectorial residual (RVQ) y discriminadores multi-escala (MS-STFT) en entrenamiento |
| Parámetros totales | 20.175.980 (todos entrenables; 80,7 MB en float32) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio; procesa formas de onda por segmentos) |
| Tipos de cuantización | No disponible (pesos publicados en float32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No disponible (entrenado sobre LibriTTS, corpus de lectura en inglés; la card no lo declara) |
| Licencia | No disponible |
| Formato de pesos | Bundle de ESPnet (`model_pack`) para `espnet3.publication.InferenceModel`; no se indica safetensors ni GGUF |
| Frecuencia de muestreo | 24.000 Hz, mono (la entrada se remuestrea y se promedia a un canal) |
| Cuantizador | RVQ con 32 etapas, 1024 bins por etapa, EMA con decay 0,99, inicialización k-means (50 iteraciones) |
| Anchos de banda objetivo | 2, 4, 8, 16 y 32 kbps |
| Canales del codificador | `encdec_n_filters` 32, `hidden_dim` 512, ratios (8, 5, 4, 2), 3 capas residuales, LSTM de 2 capas |
| Corpus | LibriTTS (splits train y valid) |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de EnCodec. El codificador es una pila convolucional con `n_filters` de 32, dimensión oculta de 512, ratios de submuestreo (8, 5, 4, 2), tres capas residuales, activación ELU, normalización `weight_norm`, `pad_mode` reflect y dos capas de LSTM. El decodificador invierte esa pila con `decoder_trim_right_ratio` de 1,0 y sin activación final. Entre ambos se sitúa un cuantizador vectorial residual de 32 etapas y 1024 entradas, con actualización por media móvil exponencial, inicialización k-means y umbral de código muerto de 2, configurado para operar a 2, 4, 8, 16 y 32 kbps.

El entrenamiento es adversarial con pérdidas complementarias: pérdida adversarial MSE sobre discriminadores MS-STFT de cinco escalas (FFT de 1024, 2048, 512, 256 y 128), feature matching, pérdida mel (80 bandas, ventana Hann, bandas 6 a 11) con peso 45,0, pérdida de reconstrucción y de compromiso del cuantizador (`lambda_commit` 1,0, `lambda_quantization` 0,0). Se usan dos optimizadores AdamW (generador y discriminador) con lr 3e-4, betas (0,5; 0,9) y scheduler exponencial con gamma 0,999875 por época. El criterio de mejor modelo es `valid/mel_loss` (min). La configuración declara un solo dispositivo y un solo nodo (`num_device: 1`, `num_nodes: 1`), y el dataset se organiza con `DataOrganizer` y `CodecPreprocessor` forzando mono. No se documenta el número de tokens ni de horas de audio consumidas, ni si hubo ajuste por preferencias.

## Capacidades

- Codificación y decodificación de voz: transforma una señal de audio en códigos discretos y la resintetiza, con la API `InferenceModel.from_pretrained(...)` y salida en `output["wav"]`.
- Entrada flexible: acepta una ruta a fichero, una tupla `(rate, samples)` o un array; remuestrea a 24 kHz y promedia a mono antes de codificar.
- Operación a varios anchos de banda: el cuantizador está configurado para 2, 4, 8, 16 y 32 kbps, lo que permite explorar el compromiso tasa-calidad.
- Tokenización acústica para modelos generativos: los códigos discretos sirven como objetivo de entrenamiento para modelos de lenguaje de audio (codec language modeling).
- Reconstrucción de voz con métricas objetivas de calidad publicadas (SDR, SI-SNR, UTMOS, DNSMOS P808, PLCMOS).
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio como entrada semántica: es un códec, no un modelo generativo de texto.

## Casos de uso

- Tokenización acústica para TTS generativo: los códigos RVQ del modelo pueden usarse como etiquetas discretas para entrenar un modelo de lenguaje autorregresivo o no autorregresivo que genere voz, con el códec como decodificador final a 24 kHz.
- Investigación reproducible en códecs neuronales: al estar empaquetado como receta ESPnet3 (`egs3/libritts/esp2_codec`), permite reproducir el entrenamiento y comparar variantes de cuantizador, ratios o pérdidas.
- Compresión de voz para almacenamiento o transmisión: con anchos de banda de 2 a 32 kbps, es adecuado para experimentos de codificación a baja tasa en pipelines de comunicación.
- Evaluación de métricas de calidad de audio: sus resultados publicados (ci_sdr 5,992; dns_overall 3,115; plcmos 4,3182; sdr 6,0536; si_snr 3,4668; utmos 3,9874 en test) sirven como línea base para comparar otros códecs.
- Preprocesado en pipelines de voz: convertir grandes corpus de audio a códigos discretos para reducir el espacio de almacenamiento y acelerar el entrenamiento de modelos posteriores.
- Prototipado de mejora o resíntesis de voz: la reconstrucción tras codificar y decodificar permite estudiar artefactos y pérdidas de calidad, útil en tareas de restauración o aumento de datos.

## Benchmarks y rendimiento

Resultados publicados en la model card para el split de test:

| Métrica | Valor |
|---|---|
| ci_sdr | 5,992 |
| dns_overall | 3,115 |
| dns_p808 | 3,771 |
| plcmos | 4,3182 |
| sdr | 6,0536 |
| si_snr | 3,4668 |
| utmos | 3,9874 |

No se han publicado comparaciones con otros códecs ni resultados por ancho de banda en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 20,2 M de parámetros en float32 (unos 80,7 MB) más buffers de 134,7 MB, el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU moderna (RTX 3060 en adelante, A100, H100) es suficiente. La latencia vendrá dominada por la longitud del audio, no por el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM; también puede ejecutarse en CPU para audios cortos.
- Opciones de despliegue: la vía documentada es `espnet3.publication.InferenceModel`; no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI (no aplican a un códec de audio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Frecuencia | Cuantizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| espnet/libritts_esp2_codec_train_encodec_libritts | 20,2 M | 24 kHz | RVQ 32 etapas, 1024 bins | No disponible | Hugging Face (ESPnet) |
| EnCodec (Meta) | No disponible en la información | 24/48 kHz | RVQ, múltiples configuraciones | No disponible en la información | Referencia arquitectónica; este modelo sigue su diseño |
| Otros códecs ESPnet (`esp2_codec`) | No disponible | No disponible | No disponible | No disponible | Repositorio ESPnet |

La comparación cuantitativa con alternativas no está disponible porque la card no publica resultados frente a otros códecs.

## Limitaciones y advertencias

- La licencia no está declarada en la model card: no se puede asumir uso comercial sin verificarlo con el repositorio de ESPnet.
- Entrenado sobre LibriTTS, corpus de lectura en inglés; el comportamiento en otros idiomas o en habla espontánea no está documentado.
- Es un códec, no un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier expectativa en ese sentido es un error de uso.
- Riesgo de artefactos y pérdida de calidad en la resintesis, especialmente a anchos de banda bajos (2-4 kbps); las métricas publicadas (UTMOS 3,99; DNSMOS P808 3,77) indican calidad moderada, no de estudio.
- El repositorio tiene un uso muy bajo (26 descargas, 0 likes) y no hay validación externa ni comunidad documentada.
- No se documentan sesgos demográficos ni de acento; al derivar de LibriTTS, probablemente herede su distribución de hablantes.
- El formato de pesos es un bundle propietario de ESPnet3; la portabilidad a otros runtimes requiere conversión no documentada.
- La fecha de creación del repositorio (2026-09-05) y la del modelo (2026-10-27) son posteriores a la fecha actual de referencia habitual; conviene verificar su vigencia antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/espnet/libritts_esp2_codec_train_encodec_libritts
- Repositorio de origen del código: https://github.com/NewGamezzz/espnet.git (rama `espnet3/recipe/libritts_codec`, commit `72b2c80db99`)
- Proyecto ESPnet: https://github.com/espnet/espnet
- Receta citada: `egs3/libritts/esp2_codec` (no se proporciona URL directa en la información disponible)
