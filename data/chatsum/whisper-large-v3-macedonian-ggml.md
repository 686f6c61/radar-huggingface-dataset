# Chatsum/whisper-large-v3-macedonian-ggml

## Resumen

Whisper large-v3 Macedonian (BuzzASR) en formato whisper.cpp es una conversión de formato del modelo `BuzzASR/macedonian`, un ajuste fino monolingüe del macedonio sobre `openai/whisper-large-v3` realizado por los autores de BuzzASR (Shivam Singh, Aditya Yadavalli, Catherine Arnett y Alex Warstadt). El repositorio lo publica Chatsum, que únicamente realiza la conversión a GGML y la cuantización a 5 bits (`q5_0`) para poder ejecutar el modelo en local en un Mac, sin enviar audio ni texto a ningún servicio externo.

El modelo resuelve el problema de la transcripción automática de voz en macedonio, un idioma con poca cobertura en los modelos multilingües genéricos. Frente al Whisper large-v3 original, el ajuste fino de BuzzASR reduce la tasa de error de palabra (WER) en el conjunto de test FLEURS macedonio del 14,9 % al 9,9 % según las mediciones del propio autor de la conversión, y además produce correctamente caracteres específicos del alfabeto macedonio como ѕ, џ y љ.

La relevancia actual reside en que permite desplegar un ASR de calidad para macedonio en hardware de consumo mediante whisper.cpp, con un único fichero de 1,08 GB y licencia MIT, lo que facilita su integración en aplicaciones de transcripción local y privada. No obstante, se trata de un modelo monolingüe, entrenado sobre voz leída y con un rendimiento aproximadamente dos veces más lento que el large-v3 estándar en el mismo equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), convertido a GGML |
| Parametros totales | no disponible (heredados de whisper-large-v3; el fichero cuantizado ocupa 1.081.140.203 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos propia de Whisper) |
| Tipos de cuantizacion | q5_0 (5 bits), unico fichero publicado |
| Idiomas soportados | macedonio (mk) |
| Licencia | MIT |
| Formato de pesos | GGML (`ggml-macedonian-buzzasr-q5_0.bin`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper large-v3: un transformer encoder-decoder con atención completa que procesa espectrogramas mel de 30 segundos y genera texto de forma autorregresiva. El modelo base `BuzzASR/macedonian` es un ajuste fino monolingüe de ese checkpoint sobre datos de voz en macedonio. Según la model card, BuzzASR se entrenó con las frases de entrenamiento de FLEURS y con Common Voice, y forma parte de un conjunto de más de 100 modelos monolingües de reconocimiento de voz descrito en el paper arXiv:2609.09554 (Findings of EMNLP 2026).

La conversión a GGML se realizó de forma reproducible con whisper.cpp v1.9.4, usando el script `convert-h5-to-ggml.py` y los filtros mel de OpenAI Whisper, y posteriormente se cuantizó con `whisper-quantize` a `q5_0`. El resultado se verificó byte a byte contra el checksum SHA-256 publicado. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Transcripción de voz a texto (ASR) en macedonio, con salida de texto plano.
- Manejo correcto de caracteres específicos del alfabeto macedonio (ѕ, џ, љ), a diferencia de los modelos Whisper genéricos evaluados.
- Ejecución local y offline mediante whisper.cpp, sin envío de audio ni texto a servicios externos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No es multilingüe: únicamente macedonio.
- No dispone de modo thinking, visión ni audio más allá de la transcripción estándar.

## Casos de uso

- Transcripción de reuniones en macedonio en local: el modelo puede procesar audio de reuniones en un Mac sin conexión, manteniendo la privacidad de las conversaciones, tal como lo usa el propio autor de la conversión.
- Subtitulado de vídeo en macedonio: integración en pipelines de postproducción para generar subtítulos a partir de pistas de audio, con la ventaja de que el modelo escribe correctamente los caracteres específicos del idioma.
- Archivado y búsqueda de audio histórico: transcripción por lotes de grabaciones en macedonio para indexar y buscar contenido textualmente.
- Asistentes de voz para aplicaciones locales: transcripción en tiempo (casi) real en dispositivos de consumo, sin depender de APIs externas.
- Herramientas de accesibilidad: generación de transcripciones para personas con dificultades auditivas en contenido en macedonio.
- Investigación lingüística: análisis de corpus orales en macedonio con un modelo ajustado específicamente al idioma y con licencia MIT para uso académico y comercial.

## Benchmarks y rendimiento

Medición del autor de la conversión sobre las primeras 150 frases distintas del conjunto de test FLEURS macedonio (30 minutos de voz leída, 3.301 palabras), con su propio pipeline y sin pistas de vocabulario, usando WER de corpus:

| Modelo | Errores de palabra (WER) |
|---|---|
| Whisper large-v3-turbo, 5 bits | 18,2 % |
| Whisper large-v3, 5 bits | 14,9 % |
| **Este fichero (BuzzASR macedonio, q5_0)** | **9,9 %** |

Los autores de BuzzASR reportan un 10,74 % en FLEURS para el modelo original. El autor de la conversión indica que este fichero fue aproximadamente el doble de lento que el large-v3 estándar en el mismo Mac.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero cuantizado ocupa 1,08 GB, por lo que la inferencia cabe holgadamente en memoria unificada de un Mac o en GPU con al menos 2 GB libres.
- GPU recomendadas: no se especifican en la información disponible; el autor lo ejecuta en un Mac.
- Cabe en GPU de consumo: sí, dado el tamaño del fichero cuantizado.
- Opciones de despliegue: whisper.cpp (formato nativo GGML); no se indica soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles de forma numérica; el autor señala que es aproximadamente el doble de lento que el large-v3 estándar en el mismo Mac.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER FLEURS mk | Licencia | Formato |
|---|---|---|---|---|---|
| Este fichero (BuzzASR mk q5_0) | no disponible | 30 s de audio | 9,9 % | MIT | GGML |
| Whisper large-v3 (5 bits) | no disponible | 30 s de audio | 14,9 % | MIT | GGML |
| Whisper large-v3-turbo (5 bits) | no disponible | 30 s de audio | 18,2 % | MIT | GGML |

## Limitaciones y advertencias

- El conjunto de evaluación es FLEURS, voz leída; el rendimiento en reuniones espontáneas, dialectos y entornos con ruido puede ser peor.
- BuzzASR se entrenó con las frases de entrenamiento de FLEURS y Common Voice, por lo que la evaluación puede estar parcialmente contaminada por solapamiento de datos.
- Modelo monolingüe: solo macedonio.
- Es una conversión de formato; los pesos son obra de los autores de BuzzASR y este repositorio no está afiliado a ellos.
- Inferencia aproximadamente dos veces más lenta que el large-v3 estándar en el mismo equipo.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio o ruido; no se documenta en la información disponible.
- Licencia MIT, que permite uso comercial, pero se recomienda citar el paper de BuzzASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chatsum/whisper-large-v3-macedonian-ggml
- Modelo base: https://huggingface.co/BuzzASR/macedonian
- Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Paper BuzzASR: https://arxiv.org/abs/2609.09554
