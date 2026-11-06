# sansaks/tutur

## Resumen

Tutur es un modelo de síntesis de voz (text-to-speech) para indonesio desarrollado por el usuario sansaks (sandi ardiansyah) y publicado en Hugging Face bajo licencia MIT. Su rasgo diferencial es el tamaño: 7,62 MB en FP16, lo que lo sitúa por debajo de los 10 MB y permite ejecutarlo íntegramente en CPU usando NumPy puro, sin necesidad de GPU ni de PyTorch durante la inferencia. Está pensado para despliegues con recursos muy limitados, como dispositivos embebidos, entornos de servidor sin acelerador o aplicaciones donde el tamaño del binario es crítico.

El modelo se compone de dos módulos: un modelo acústico (`TuturAcoustic`) que convierte texto en mel-espectrogramas de 100 bins a 24 kHz, y un vocoder (`TuturVocos`) que reconstruye la forma de onda mediante STFT inversa exacta. La arquitectura se basa en bloques ConvNeXt1D con predictores explícitos de duración, tono (F0) y energía, e incorpora un tokenizador fonémico específico para indonesio que distingue la vocal pepet `ə` del `e` y el glottal stop `ʔ`.

El modelo se entrenó sobre el dataset `X-lord/Dataset-Text-To-Speech-Indonesia` (16,38 horas de audio de estudio a 22–24 kHz) y mediante destilación de espectro complejo desde el vocoder `charactr/vocos-mel-24khz`. La relevancia actual radica en su propuesta de TTS neuronal de calidad razonable con un coste computacional mínimo, aunque con un alcance limitado a un único idioma y un ecosistema de uso todavía incipiente (28 descargas en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acústico ConvNeXt1D (encoder de texto + decoder Mel-100 + post-net armónico de 5 capas) y vocoder ConvNeXt1D de 8 bloques con STFT inversa exacta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | FP16 (pesos en `tutur_fp16.npz`) |
| Idiomas soportados | Indonesio (id) |
| Licencia | MIT |
| Formato de pesos | NPZ (NumPy) |

## Arquitectura y entrenamiento

Tutur sigue un esquema clásico de dos etapas para TTS neuronal. La primera etapa, `TuturAcoustic`, recibe texto tokenizado a nivel fonémico y lo procesa con un encoder ConvNeXt1D, tras lo cual aplica un mecanismo de alineación monotónica anclada en silencios (Silence-Anchored Monotonic Alignment Search, MAS). Sobre esa alineación se entrenan predictores explícitos de duración, pitch (F0) y energía, que alimentan un decoder ConvNeXt1D que genera mel-espectrogramas de 100 bins a 24 kHz, refinados por un post-net armónico de 5 capas. La segunda etapa, `TuturVocos`, es un vocoder de 8 bloques ConvNeXt1D que aplica una STFT inversa exacta con `n_fft=1024`, `hop_length=256` y `sample_rate=24000`.

El entrenamiento se realizó sobre el dataset `X-lord/Dataset-Text-To-Speech-Indonesia`, compuesto por 16,38 horas de audio de estudio a 22–24 kHz, con referencia al modelo `Eempostor/F5-TTS-INDO-FINETUNE-V2`. La innovación técnica principal es la destilación de espectro complejo desde el vocoder profesor `charactr/vocos-mel-24khz`, que combina pérdidas de log-magnitud, fase instantánea, STFT multi-resolución y feature matching del backbone. No se documenta en la información disponible el uso de RLHF o DPO, ni el número exacto de tokens de entrenamiento.

## Capacidades

- Síntesis de voz en indonesio a partir de texto, con salida de audio float32 a 24 kHz.
- Tokenización fonémica específica del indonesio, con distinción entre la vocal pepet `ə` y la `e`, y del glottal stop `ʔ`.
- Control explícito de duración, tono (F0) y energía mediante predictores dedicados.
- Inferencia en CPU con NumPy puro, sin GPU ni PyTorch en tiempo de ejecución.
- Huella de almacenamiento muy reducida (7,62 MB en FP16), adecuada para entornos con restricciones de tamaño.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documenta capacidad multilingüe más allá del indonesio.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: el modelo cabe en 7,62 MB y se ejecuta en CPU con NumPy, por lo que puede integrarse en sistemas con memoria y cómputo muy limitados donde no es viable un TTS basado en GPU.
- Lectura de notificaciones y alertas en aplicaciones móviles o de escritorio: la síntesis a 24 kHz con control de duración y energía permite generar avisos breves en indonesio con una latencia baja y sin dependencia de servicios en la nube.
- Accesibilidad para usuarios con discapacidad visual en entornos de habla indonesia: la inferencia local en CPU evita el envío de texto a servidores externos y reduce el coste operativo.
- Sistemas de información pública y megafonía automatizada: el control explícito de pitch y energía facilita ajustar la prosodia a mensajes de anuncio, y el reducido tamaño permite desplegarlo en hardware de bajo coste.
- Prototipado e investigación en TTS de bajos recursos: al ser MIT y ejecutarse sin PyTorch, sirve como base reproducible para experimentos de destilación de vocoders y alineación fonémica en indonesio.
- Generación de audiolibros o contenido educativo en indonesio por lotes: el modelo puede procesar texto por fragmentos en CPU, con un coste de infraestructura mínimo frente a soluciones basadas en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (inferencia en CPU con NumPy puro; no requiere GPU).
- GPU recomendadas: no aplica; el modelo está diseñado para ejecutarse en CPU.
- Cabe en cualquier CPU consumer, incluidos dispositivos de bajo consumo, dado el tamaño de 7,62 MB en FP16.
- Opciones de despliegue: motor propio `tutur_engine` (clase `IndoNanoSynthesizer`) cargando `tutur_fp16.npz` y `config.json`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tutur (sansaks) | no disponible (7,62 MB FP16) | no aplica | sin benchmarks publicados | MIT | Hugging Face, 28 descargas |
| charactr/vocos-mel-24khz | no disponible | no aplica | no disponible | no disponible en la información | Hugging Face (usado como profesor en la destilación) |
| Eempostor/F5-TTS-INDO-FINETUNE-V2 | no disponible | no aplica | no disponible | no disponible en la información | Hugging Face (referencia para el entrenamiento) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El modelo solo soporta indonesio; no hay evidencia de capacidades multilingües.
- No se han publicado benchmarks objetivos (MOS, inteligibilidad, similitud de hablante), por lo que la calidad percibida no está cuantificada.
- El alcance es TTS de un único hablante o conjunto limitado; no se documenta clonación de voz ni control de identidad del hablante.
- Al ser un modelo muy comprimido (7,62 MB), es esperable una menor naturalidad y expresividad frente a modelos TTS de mayor tamaño, aunque no se aportan métricas que lo confirmen.
- Riesgo de errores de pronunciación en palabras no representadas en el dataset de entrenamiento (16,38 horas), especialmente en préstamos léxicos y nombres propios.
- La licencia MIT permite uso comercial, pero el autor no documenta garantías ni soporte; conviene validar la calidad en el dominio de producción concreto.
- La API de uso depende del paquete `tutur_engine`, que no se detalla en la información disponible (versión, dependencias, mantenimiento).
- El repo tiene 0,0 GB reportados y 28 descargas, lo que sugiere un ecosistema incipiente y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sansaks/tutur
- Perfil del autor: https://huggingface.co/sansaks
- Dataset de entrenamiento: https://huggingface.co/datasets/X-lord/Dataset-Text-To-Speech-Indonesia
- Modelo de referencia para el entrenamiento: https://huggingface.co/Eempostor/F5-TTS-INDO-FINETUNE-V2
- Vocoder profesor: https://huggingface.co/charactr/vocos-mel-24khz
