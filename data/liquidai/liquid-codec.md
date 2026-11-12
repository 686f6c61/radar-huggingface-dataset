# LiquidAI/Liquid-Codec

## Resumen

LiquidCodec es un códec de audio compacto y orientado a streaming desarrollado por Liquid AI. Comprime voz en tokens discretos y los reconstruye de vuelta a audio, actuando como tokenizador de audio para los modelos LFM3-Audio-2B y LFM3-Omni-2B de la misma familia. Con unos 74 millones de parametros, esta disenado para entornos de borde (edge) y despliegue en tiempo real, no como modelo generativo de texto.

Su relevancia tecnica esta en la cuantizacion escalar finita agrupada (GFSQ), que genera codebooks sin dependencias secuenciales. Esto permite que un modelo de voz prediga todos los codebooks de una trama en paralelo, simplificando el modelado y acelerando la inferencia. Segun el autor, alcanza codificacion a unas 361 veces tiempo real y decodificacion a unas 87 veces tiempo real en FP32 sobre un solo hilo de CPU de un Apple M4 Max.

La ficha describe un componente de infraestructura para pipelines de voz (ASR, TTS, modelos omni), con licencia LFM 1.0 y soporte declarado para seis idiomas: ingles, chino, aleman, frances, japones y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder y decoder LFM3 simetricos y totalmente causales con cuantizacion escalar finita agrupada (GFSQ) |
| Parametros totales | 73.559.090 (~74M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32; el decoder admite entrenamiento consciente de cuantizacion y ejecucion en Q4_0 (huella 3,5 veces menor) |
| Idiomas soportados | en, zh, de, fr, ja, ko |
| Licencia | LFM 1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

LiquidCodec emplea un encoder y un decoder LFM3 simetricos y completamente causales, lo que habilita el procesamiento en streaming sin mirar al futuro de la senal. La innovacion central es la cuantizacion escalar finita agrupada (GFSQ), que produce codebooks independientes entre si: a diferencia de los esquemas de cuantizacion residual con dependencias secuenciales, aqui todos los codebooks de una trama pueden predecirse en paralelo. Esto reduce la complejidad para los modelos de voz que consumen sus tokens.

El autor declara entrenamiento consciente de cuantizacion solo en el decoder, lo que permite ejecutarlo en Q4_0 con una huella 3,5 veces menor y perdida de calidad minima, un requisito clave para despliegue en borde. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Compresion de voz a tokens discretos (codificacion) y reconstruccion de audio a partir de tokens (decodificacion).
- Prediccion paralela de todos los codebooks de una trama gracias a GFSQ, sin dependencias secuenciales.
- Procesamiento causal apto para streaming de audio en tiempo real.
- Alta fidelidad de reconstruccion: el autor reporta el mejor ViSQOL y la menor distancia mel entre los codecs comparados en ocho conjuntos de prueba de reconstruccion.
- Mejora de la generacion de voz: en experimentos TTS emparejados, los modelos entrenados con tokens de LiquidCodec alcanzan el mayor UTMOSv2 en los ocho conjuntos de prueba.
- Soporte multilingue declarado para en, zh, de, fr, ja y ko.
- Inferencia eficiente en CPU: ~361x tiempo real en codificacion y ~87x en decodificacion (FP32, un hilo de Apple M4 Max).
- No es un modelo de texto: no soporta tool calling, agentes ni generacion de lenguaje.

## Casos de uso

- Tokenizacion para modelos de voz: convertir audio en tokens discretos antes de alimentar LFM3-Audio-2B o LFM3-Omni-2B, que estan construidos sobre este codec.
- ASR en streaming: el caracter causal del encoder permite transcribir audio por tramas con baja latencia en pipelines de reconocimiento de voz.
- TTS en produccion: generar tokens con un modelo de voz y decodificarlos a audio con LiquidCodec, aprovechando su alta naturalidad medida con UTMOSv2.
- Despliegue en dispositivos de borde: el decoder en Q4_0 con huella 3,5 veces menor permite ejecutar la decodificacion en hardware con recursos limitados.
- Procesamiento por lotes en CPU: su velocidad de codificacion (~361x tiempo real) permite preprocesar grandes volumenes de audio sin GPU.
- Compresion de audio para almacenamiento o transmision: representar la voz como tokens discretos reduce el ancho de banda frente al audio sin comprimir.
- Investigacion en modelado de voz: servir como tokenizador de referencia en experimentos de modelos generativos de audio multilingues.

## Benchmarks y rendimiento

El autor reporta resultados cualitativos y de velocidad, pero no cifras numericas por conjunto de prueba en la informacion disponible.

| Metrica | Resultado reportado |
|---|---|
| ViSQOL | Mejor entre los codecs comparados en ocho conjuntos de reconstruccion |
| Distancia mel | La mas baja entre los codecs comparados |
| UTMOSv2 (TTS emparejado) | El mas alto en los ocho conjuntos de prueba |
| Velocidad de codificacion | ~361x tiempo real (FP32, 1 hilo de Apple M4 Max) |
| Velocidad de decodificacion | ~87x tiempo real (FP32, 1 hilo de Apple M4 Max) |
| Huella del decoder en Q4_0 | 3,5 veces menor que FP32 |

No se han publicado valores numericos detallados de benchmarks (por ejemplo, puntuaciones ViSQOL o UTMOSv2 concretas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~74M de parametros; en FP32 ocupa aproximadamente 0,3 GB y en Q4_0 alrededor de 0,08 GB, por lo que cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) sobra para este tamano. El caso de uso principal es CPU.
- Cabe en GPU consumer: si, en todas las gamas actuales, e incluso en dispositivos de borde.
- Opciones de despliegue: transformers con `custom_code`; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: ~361x tiempo real en codificacion y ~87x en decodificacion en FP32 sobre un hilo de CPU de Apple M4 Max; el resto de plataformas no esta documentado.

## Comparativa con modelos similares

No se dispone de datos de otros codecs de audio (parametros, contexto, licencia) en la informacion proporcionada para construir una comparativa fiable. El autor menciona comparaciones con otros codecs en su blog, pero no se detallan aqui sus especificaciones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LiquidCodec | ~74M | no disponible | LFM 1.0 | Hugging Face |
| Alternativas de codec de audio | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Ambito limitado a audio de voz; su comportamiento con musica u otros tipos de audio no esta documentado.
- Idiomas declarados limitados a seis (en, zh, de, fr, ja, ko); el rendimiento fuera de ellos no esta garantizado.
- Riesgo de artefactos o perdida de fidelidad en la reconstruccion, especialmente con cuantizacion Q4_0, aunque el autor la describe como de perdida minima.
- La licencia LFM 1.0 es de tipo "other"; es necesario revisar el archivo LICENSE para confirmar las condiciones de uso comercial.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones independientes.
- Los benchmarks reportados proceden del propio autor y no se han verificado de forma externa.

## Enlaces

- Hugging Face: https://huggingface.co/LiquidAI/LiquidCodec
- Blog del modelo: https://www.liquid.ai/blog/liquidcodec
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/talk
- LFM3-Audio-2B: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- LFM3-Omni-2B: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Web de Liquid AI: https://www.liquid.ai/
- Pagina de modelos: https://www.liquid.ai/models
- Perfil de Hugging Face: https://huggingface.co/LiquidAI
