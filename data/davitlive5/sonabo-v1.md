# davitlive5/sonabo-v1

## Resumen

Sonabo-v1 es un modelo de síntesis de voz (text-to-speech) especializado en armenio oriental, desarrollado por Davit Ghazaryan (usuario `davitlive5`) como parte de un esfuerzo open source por dotar a ese idioma de infraestructura de voz. Se trata de un fine-tune del modelo base Qwen3-TTS-12Hz-0.6B-Base de Alibaba, que no soporta armenio de forma nativa; este ajuste le permite leer texto armenio con una tasa de error de palabra de aproximadamente el 5 % en una prueba de ida y vuelta mediante ASR, además de clonar voces a partir de una grabación corta de referencia.

El modelo combina un componente "talker" de 0,6B parámetros con un tokenizador y codec de voz de 12,5 Hz, y genera audio mono a 24 kHz. Su rasgo más diferencial es el streaming: servido con vLLM-Omni alcanza un tiempo hasta el primer audio de unos 30 ms en una RTX 5070, lo que lo hace apto para aplicaciones conversacionales en tiempo real. El repositorio ocupa 2,5 GB y los pesos suman 914.643.008 parámetros reales según safetensors.

Es relevante ahora porque el armenio es un idioma de bajos recursos en el ecosistema TTS y las alternativas comerciales son escasas o cerradas. Sonabo-v1 ofrece clonación de voz, streaming de baja latencia y licencia Apache-2.0, lo que permite uso comercial y despliegue en producción sin restricciones adicionales, algo poco habitual en modelos de voz para idiomas minoritarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TTS (Qwen3-TTS): talker de 0,6B + tokenizador/codec de voz a 12,5 Hz |
| Parametros totales | 914.643.008 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Armenio oriental (hy / hy-AM) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `qwen-tts`) |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Clonacion de voz | x-vector (embedding de hablante) a partir de 3-30 s de audio de referencia |
| Streaming | Si (vLLM-Omni o API de streaming de `qwen-tts`) |
| Hardware recomendado | 1 GPU con >= 6 GB de VRAM; funciona en CPU pero por debajo de tiempo real |

## Arquitectura y entrenamiento

Sonabo-v1 hereda la arquitectura Qwen3-TTS del modelo base: un componente generativo tipo transformer ("talker") que produce tokens de voz a 12,5 Hz, los cuales se decodifican a audio mediante el codec correspondiente. El modelo base fue entrenado por Alibaba y no incluye armenio; el autor realizó un fine-tune sobre datos privados para adaptarlo al armenio oriental, sin publicar el volumen de tokens ni la composición exacta del dataset de entrenamiento.

El ajuste incorpora decisiones de inferencia documentadas por el autor que afectan directamente a la calidad: el modo `non_streaming_mode=True` es obligatorio porque el armenio consume aproximadamente un token BPE por carácter, de modo que en el modo de texto en streaming la entrada se queda rezagada respecto al audio y el WER sube hasta el 50 %; con la frase completa por delante el WER baja al 5 %. La clonación x-vector (`x_vector_only_mode=True`) supera claramente a la clonación en contexto (audio de referencia más transcripción), que en armenio arroja un WER del 12 %. Además, el repositorio incluye `hy_norm.normalize`, un normalizador que convierte dígitos, fechas, horas, moneda, porcentajes y abreviaturas a palabras, ya que el modelo se entrenó con texto escrito con palabras. Para textos largos se recomienda sintetizar oración por oración.

## Capacidades

- Síntesis de voz en armenio oriental (hy-AM) a partir de texto, con salida mono a 24 kHz.
- Clonación de voz zero-shot a partir de 3-30 s de audio limpio de un solo hablante, sin necesidad de transcripción.
- Streaming de audio con latencia baja (unos 30 ms hasta el primer audio en RTX 5070 con vLLM-Omni).
- Normalización de texto integrada (`hy_norm`) para números, fechas, horas, moneda, porcentajes y abreviaturas comunes.
- Manejo de textos largos mediante división en oraciones (script `inference.py` incluido).
- Despliegue como servidor compatible con la API `/v1/audio/speech` de vLLM-Omni, con respuesta PCM en streaming.
- Ejecución en CPU (más lenta que tiempo real) además de GPU.
- No dispone de control explícito de emoción o estilo, ni de capacidades de visión, audio de entrada o tool calling.

## Casos de uso

- **Atención al cliente automatizada en armenio**: el modelo puede leer respuestas dinámicas generadas por un LLM en armenio oriental y transmitirlas en streaming con ~30 ms hasta el primer audio, lo que permite conversaciones telefónicas o de chat de voz fluidas sin esperas perceptibles.
- **Locución de contenidos y noticias**: para portales de noticias o podcasts en armenio, el modelo sintetiza artículos largos oración por oración con una inteligibilidad del ~95 %, y la clonación de voz permite mantener una voz de marca consistente a partir de una grabación corta del locutor.
- **Sistemas de megafonía y avisos automatizados**: avisos de turnos, transporte o emergencias con números, horas y fechas frecuentes; el normalizador `hy_norm` convierte esos elementos a palabras antes de la síntesis, lo que reduce los errores en el conjunto específico de números y fechas (WER 6,11).
- **Accesibilidad y lectura de pantalla**: integración en lectores de pantalla o aplicaciones de accesibilidad para usuarios armenios, con la ventaja de que el modelo cabe en una GPU de 6 GB de VRAM o incluso puede ejecutarse en CPU para uso personal.
- **Doblaje y localización de vídeo**: generación de pistas de voz en armenio para contenido formativo o corporativo, clonando la voz del presentador original a partir de una muestra y segmentando el guion por frases para sincronizar con el vídeo.
- **Asistentes de voz embebidos y agentes conversacionales**: despliegue con vLLM-Omni para atender hasta 16 flujos concurrentes con un factor de tiempo real de 0,41 por flujo en una RTX 5070, lo que permite ofrecer un servicio multiusuario en hardware de gama media.
- **Investigación en tecnologías del habla para armenio**: al ser Apache-2.0 y estar basado en un modelo abierto, sirve como punto de partida para experimentos de TTS, evaluación con ASR (Lapillus-v2) o desarrollo de variantes dialectales.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Conjunto de evaluación: 112 frases por voz (habla leída, dominios mixtos, no vistas en entrenamiento) más 20 frases con números, fechas y horas; inteligibilidad medida con WER de ida y vuelta usando el ASR Lapillus-v2; naturalidad con UTMOS (1-5); similitud de voz con coseno de embeddings WavLM. Ajustes: prompt x-vector, `non_streaming_mode=True`, temperatura 0,9.

| Voz | WER ↓ | CER ↓ | UTMOS ↑ | Similitud de hablante ↑ |
|---|---|---|---|---|
| Voz femenina | 4,89 | 1,04 | 3,70 | 0,860 |
| Voz masculina | 5,03 | 1,20 | 4,10 | 0,854 |
| Conjunto de números/fechas (femenina) | 6,11 | 2,88 | 3,88 | 0,839 |

Velocidad de servicio (RTX 5070 12 GB, vLLM-Omni 0,32, PCM en streaming):

| Flujos concurrentes | Tiempo hasta primer audio (mediana / peor) | Factor de tiempo real por flujo |
|---|---|---|
| 1 | 30 / 35 ms | 0,14 |
| 8 | 70 / 154 ms | 0,26 |
| 16 | 144 / 405 ms | 0,41 |
| 32 | 476 / 826 ms | 0,68 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de voz y no de texto.

## Requisitos de hardware

- **VRAM estimada**: el autor recomienda 1 GPU con al menos 6 GB de VRAM. El repositorio pesa 2,5 GB, por lo que en bfloat16 los pesos rondan esa cifra y 6 GB deja margen para el codec y el contexto de generación.
- **GPU recomendadas**: RTX 5070 12 GB (mediciones oficiales del autor), así como GPUs consumer con 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070) y GPUs de datacenter (A100, H100) para mayor concurrencia.
- **Cabe en GPU consumer**: sí, en cualquier GPU con 6-8 GB de VRAM o más. También funciona en CPU, pero por debajo de tiempo real.
- **Opciones de despliegue**: vLLM-Omni (recomendado para producción, con streaming y concurrencia), la librería `qwen-tts` en Python para inferencia directa, y el script `inference.py` incluido en el repositorio para textos largos y múltiples voces.
- **Latencia y throughput**: en RTX 5070 con vLLM-Omni, 30 ms de mediana hasta el primer audio con 1 flujo y factor de tiempo real de 0,14; con 32 flujos concurrentes, 476 ms de mediana y factor de 0,68. La configuración `codec_chunk_ramp: [4, 6, 10, 16, 25]` del YAML de despliegue elimina el hueco inicial de ~230 ms al enviar el primer audio tras 4 tramas de codec en lugar de 25.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion de voz | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sonabo-v1 | 0,6B (914,6M reales) | Armenio oriental | Si (x-vector, 3-30 s) | Si (~30 ms TTFA) | Apache-2.0 | Hugging Face |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6B | Multilingue (sin armenio) | Si | Si | Apache-2.0 | Hugging Face |
| Lapillus-v2 | No disponible | Armenio | No aplica (es ASR) | No aplica | No disponible | Hugging Face |

La comparación directa más pertinente es con el modelo base Qwen3-TTS-12Hz-0.6B-Base: Sonabo-v1 añade soporte de armenio oriental (ausente en el base) a costa de especializarse en un único idioma. Frente a Lapillus-v2, del mismo autor, la relación es complementaria: Lapillus-v2 es un modelo de reconocimiento de voz usado precisamente para evaluar la inteligibilidad de Sonabo-v1. No se dispone de datos de benchmarks de otros modelos TTS para armenio en la información proporcionada, por lo que no es posible una comparación cuantitativa adicional.

## Limitaciones y advertencias

- **Solo armenio oriental**: la pronunciación del armenio occidental no está modelada.
- **Nombres raros, palabras extranjeras y algunas abreviaturas** pueden pronunciarse mal; es necesario normalizar el texto con `hy_norm.normalize` antes de la síntesis.
- **Entradas muy cortas (1-2 palabras)** son menos estables; conviene añadir contexto o puntuación.
- **Sin control explícito de emoción o estilo**: no se puede dirigir la prosodia más allá de los parámetros de generación.
- **Modo de texto obligatorio**: usar `non_streaming_mode=True`; en el modo de texto en streaming el WER sube hasta ~50 % en armenio.
- **Riesgo de alucinación acústica**: como todo modelo generativo de voz, puede producir artefactos o pronunciaciones inventadas en texto atípico; parte del WER residual del ~5 % proviene del propio modelo ASR usado en la evaluación.
- **Sesgos**: no se documentan sesgos específicos, pero la calidad depende de la cantidad y diversidad de los datos privados de entrenamiento, no publicados.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero el usuario es responsable del consentimiento de las personas cuya voz se clone; el repositorio no incluye voces de referencia y exige aportar grabaciones de hablantes que hayan aceptado ser clonados.
- **Datos de benchmarks no verificados**: los resultados del model-index están marcados como `verified: false` y proceden del propio autor.
- **Concurrencia alta**: a partir de 32 flujos concurrentes la latencia hasta el primer audio supera los 476 ms de mediana y el factor de tiempo real se acerca a 0,68, lo que puede degradar la experiencia en despliegues muy cargados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davitlive5/sonabo-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Modelo ASR del mismo autor (Lapillus-v2): https://huggingface.co/davitlive5/Lapillus-v2
- Paper referenciado en los tags (arXiv:2601.15621): https://arxiv.org/abs/2601.15621
- Repositorio de vLLM-Omni: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
