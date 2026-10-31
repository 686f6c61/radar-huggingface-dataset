# LiquidAI/LFM3-Audio-2B-MLX-4bit

## Resumen

LFM3-Audio-2B-MLX-4bit es la versión cuantizada a 4 bits en formato MLX del modelo de audio LFM3-Audio-2B de Liquid AI, optimizada para ejecutarse de forma nativa en Apple Silicon (Mac con chips M1/M2/M3/M4). El modelo base pertenece a la familia LFM3 (Liquid Foundation Models) de Liquid AI y es un modelo any-to-any centrado en audio: reconocimiento de voz (ASR), síntesis de voz (TTS) y conversación voz-a-voz, con salida de texto y audio intercaladas.

El modelo resuelve el problema de ejecutar un modelo de audio multimodal compacto (unos 2.000 millones de parámetros) completamente en local sobre hardware de consumo de Apple, sin depender de la nube. La cuantización a 4 bits reduce los pesos a 1,58 GB, más 0,15 GB del códec de audio, lo que lo hace viable en portátiles y escritorios Mac.

Su relevancia actual radica en la creciente demanda de asistentes de voz locales y privados: LFM3-Audio-2B ofrece ASR, TTS y chat de voz en un único modelo con soporte para 18 idiomas, incluido el castellano. Cabe señalar que, según la propia model card, esta variante de 4 bits pierde algo de precisión y Liquid AI recomienda la versión de 8 bits como mejor equilibrio calidad-tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Any-to-any de audio (backbone de lenguaje + codificador de audio + proyector + depth decoder + códec de audio); detalles completos no disponibles en esta ficha |
| Parametros totales | 1.977.548.032 (~1,98 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits afín con grupos de 64 (backbone de lenguaje); proyecciones value y feed-forward down a 6 bits en capas equivalentes a Q4_K_M de llama.cpp; embedding de tokens y capa de salida a 6 bits; codificador de audio, proyector, depth decoder y codebook embedding en BF16; códec de audio sin cuantizar |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (18 idiomas) |
| Licencia | LFM1.0 (licencia propia de Liquid AI, tipo "other") |
| Formato de pesos | MLX (safetensors), 4 bits; tamaño del repo: 1,7 GB (1,58 GB de pesos + 0,15 GB del tokenizador de audio) |

## Arquitectura y entrenamiento

El modelo base, LFM3-Audio-2B, es un modelo any-to-any de audio que combina un backbone de lenguaje con un codificador de audio, un proyector, un depth decoder y un tokenizador/códec de audio. En esta versión MLX 4-bit, el backbone de lenguaje está cuantizado a 4 bits con afinidad y grupos de 64, mientras que los componentes de audio (codificador, proyector, depth decoder y codebook embedding) se mantienen en BF16 para preservar la calidad de la señal de audio. El códec de audio se distribuye sin cuantizar en el directorio `audio_tokenizer/`.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación (RLHF/DPO) para este modelo. Los detalles completos de arquitectura y uso se remiten a la model card del modelo original LFM3-Audio-2B.

## Capacidades

- Reconocimiento de voz (ASR): transcribe audio de entrada a texto, configurable por idioma mediante el system prompt.
- Síntesis de voz (TTS): genera audio a partir de texto, con control de voz (por ejemplo, "voz femenina en inglés americano") y salida a fichero WAV.
- Conversación voz-a-voz (speech-to-speech): acepta audio de entrada y responde con audio, habilitando chat hablado de extremo a extremo.
- Salida intercalada de texto y audio: puede responder combinando ambos formatos en una misma interacción.
- Soporte multilingüe en 18 idiomas, incluido el castellano, tanto para entrada como para salida de voz (según la model card del modelo original).
- Parámetros de generación específicos de audio: `audio_temperature`, `audio_top_k` y `audio_repetition_penalty` (valores por defecto: 1.0, 128 y 1.1).
- No hay información disponible sobre soporte de tool calling, capacidades de agentes, visión ni procesamiento de audio musical o no verbal.

## Casos de uso

- Transcripción local y privada de notas de voz: un usuario puede transcribir grabaciones o dictados en su Mac sin enviar audio a la nube, usando ASR con temperature 0 para máxima fidelidad.
- Generación de locuciones y narraciones: producción de archivos WAV a partir de texto (TTS) para podcasts, vídeos o prototipos de contenido, eligiendo voz e idioma mediante el system prompt.
- Asistente de voz conversacional en el dispositivo: chat de voz a voz sin latencia de red, adecuado para aplicaciones de escritorio que priorizan la privacidad.
- Prototipado de agentes de voz multilingües: gracias a los 18 idiomas soportados, se puede construir un prototipo de atención al cliente hablada que atienda en castellano, inglés u otros idiomas desde el mismo modelo.
- Accesibilidad: herramientas de lectura de texto en voz alta o de transcripción en tiempo real para usuarios con necesidades de accesibilidad, ejecutándose sin conexión.
- Desarrollo y pruebas en Apple Silicon: la cuantización a 4 bits permite iterar rápidamente en un portátil Mac antes de escalar a la versión completa o de 8 bits en producción.
- Aplicaciones con salida mixta texto-audio: interfaces que combinan respuestas escritas con fragmentos hablados (por ejemplo, tutoriales interactivos o guías de aprendizaje de idiomas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que esta variante de 4 bits "pierde algo de precisión" respecto al modelo original y que la versión de 8 bits es el equilibrio recomendado.

## Requisitos de hardware

- Memoria unificada estimada: aproximadamente 1,73 GB de pesos (1,58 GB del modelo + 0,15 GB del códec de audio), más la memoria para el contexto de generación; en la práctica, cualquier Mac con 8 GB de RAM unificada debería ser suficiente para inferencia.
- Hardware recomendado: Apple Silicon (M1, M2, M3 o M4), ya que el formato MLX está diseñado específicamente para la arquitectura de memoria unificada de Apple. No es adecuado para GPUs NVIDIA en su formato MLX.
- Consumer hardware: sí, está diseñado precisamente para ordenadores de consumo Mac; no requiere GPU dedicada.
- Despliegue: mediante MLX y la herramienta `mlx_vlm` (soporte de LFM3-Audio en MLX-VLM en progreso según la model card, con ejemplos de uso ya documentados). No hay información disponible sobre compatibilidad con vLLM, llama.cpp, TGI u Ollama para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Modalidades | Idiomas | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| LFM3-Audio-2B-MLX-4bit (este modelo) | ~1,98 B | 4 bits (MLX) | Audio: ASR, TTS, voz a voz | 18 | LFM1.0 | Apple Silicon |
| LFM3-Audio-2B-MLX-8bit | ~1,98 B | 8 bits (MLX) | Audio: ASR, TTS, voz a voz | 18 | LFM1.0 | Apple Silicon |
| LFM3-Audio-2B (base) | ~1,98 B | BF16 | Audio: ASR, TTS, voz a voz | 18 | LFM1.0 | Multiplataforma |

La versión de 8 bits es la alternativa recomendada por el propio autor cuando se dispone de algo más de memoria, ya que ofrece mejor precisión con un tamaño aún reducido. No hay información disponible sobre alternativas de otros fabricantes con datos comparables de benchmarks.

## Limitaciones y advertencias

- Pérdida de precisión: la propia model card reconoce que esta variante de 4 bits "pierde algo de precisión" respecto al original; Liquid AI recomienda la versión de 8 bits como mejor equilibrio. Para producción con requisitos de calidad de voz altos, conviene evaluar ambas versiones.
- Soporte en MLX-VLM en progreso: la integración de LFM3-Audio en la librería MLX-VLM aún no está en una release estable, lo que puede complicar el despliegue.
- Sesgos: no hay información publicada sobre sesgos específicos del modelo; al tratarse de un modelo de voz, deben considerarse posibles variaciones de rendimiento por acento, género o registro de habla.
- Alucinaciones: en tareas de ASR, el modelo puede generar transcripciones incorrectas en audio ruidoso o con acentos no representados; no hay datos cuantificados disponibles.
- Idiomas: aunque soporta 18 idiomas, no hay datos públicos sobre la calidad relativa del castellano frente al inglés; conviene validarla en el caso de uso concreto.
- Licencia: se distribuye bajo la licencia LFM1.0, una licencia propia ("other") cuyo texto debe revisarse antes de cualquier uso comercial, ya que puede incluir restricciones específicas.
- Contexto: la longitud de contexto no está publicada en la información disponible; verificarla en la model card del modelo original antes de procesar audios largos.

## Enlaces

- Modelo MLX 4-bit: https://huggingface.co/LiquidAI/LFM3-Audio-2B-MLX-4bit
- Modelo base LFM3-Audio-2B: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Versión MLX 8-bit (recomendada): https://huggingface.co/LiquidAI/LFM3-Audio-2B-MLX-8bit
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- API de Liquid AI: https://console.liquid.ai/dashboard
