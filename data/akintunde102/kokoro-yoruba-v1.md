# Akintunde102/kokoro-yoruba-v1

## Resumen

Kokoro Yorùbá v1 es un modelo de síntesis de voz (text-to-speech) específico para el idioma yoruba, desarrollado por el usuario Akintunde102 y publicado en Hugging Face. Se construye sobre la arquitectura StyleTTS2 con el diseño de tokens de Kokoro-82M, un modelo TTS ligero que ha demostrado buena calidad con un coste computacional reducido. El modelo incorpora un frontend fonológico propio, `oro-g2p`, que convierte grafemas yoruba en fonemas con codificación explícita de tonos y vocales nasales, un aspecto crítico en una lengua tonal como el yoruba.

El modelo resuelve un problema concreto: la escasez de sistemas TTS nativos para lenguas africanas de bajos recursos. La mayoría de los TTS multilingües comerciales no cubren el yoruba con precisión tonal, lo que degrada la inteligibilidad. Esta versión v1 es un prototipo que prioriza la corrección fonológica (0 tokens perdidos en el vocabulario de 178 slots) sobre la cobertura de datos, ya que se entrenó con solo 2,70 horas de audio.

Es relevante ahora porque demuestra que es posible adaptar arquitecturas TTS ligeras y abiertas a lenguas tonales con un frontend G2P especializado, y porque publica los pesos y el pipeline bajo licencia CC BY-SA 4.0, permitiendo su reutilización y mejora por parte de la comunidad de NLP africano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 con diseño de tokens de Kokoro-82M |
| Parametros totales | no disponible (pesos de 526 MB; Kokoro-82M como referencia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por cláusulas, con chunking integrado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | yoruba (yo) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | checkpoints PyTorch (`.pt`) para StyleTTS2; voicepacks `voicepack_spk8_bible.pt` y `voicepack_spk2_waxal.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS2, un sistema TTS de dos etapas que combina un codificador de estilo y un decodificador acústico con un modelo de duración basado en difusión, y adopta el layout de tokens de Kokoro-82M. El frontend fonológico es `oro-g2p`, un conversor grafema-fonema basado en reglas que codifica los tres tonos del yoruba (alto ˊ, medio ˉ, bajo ˋ), las vocales nasales (ã, ɛ̃, ĩ, ɔ̃, ũ), las nasales silábicas homorgánicas (ń/ǹ/m) y las oclusivas kp/gb, con un vocabulario atómico de 178 slots y 0 tokens perdidos.

El entrenamiento se realizó con solo 2,70 horas de habla: aproximadamente el 92 % proviene del hablante 8 del corpus BibleTTS (`AfriSpeech/open-bible-speech-african`, CC BY-SA 4.0) y cerca del 1 % del hablante 2 de WaxalNLP (`google/WaxalNLP`, CC-BY / CC-BY-SA-4.0). Se partió de un PLBERT preentrenado en inglés, y la pérdida F0 reportada es de 1,76. El pipeline incluye chunking por cláusulas y control de velocidad implementados en `tts_yoruba.py`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en yoruba a partir de texto con diacríticos y marcas tonales.
- Dos voces incluidas: `spk8` (voz de estudio, corpus BibleTTS) y `spk2` (voz conversacional, corpus WaxalNLP).
- Conversión grafema-fonema con codificación completa de tonos altos, medios y bajos, vocales nasales y nasales silábicas.
- Chunking automático por cláusulas para narración de textos largos.
- Control de velocidad de habla.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es un modelo puramente TTS.

## Casos de uso

- Narración de textos bíblicos y religiosos: el modelo está entrenado mayoritariamente con BibleTTS, por lo que su dominio principal es la lectura de pasajes escritos, con buena precisión en frases cortas del dominio.
- Audiolibros y contenido educativo en yoruba: el chunking por cláusulas y el control de velocidad permiten generar narraciones de documentos largos de forma automatizada.
- Accesibilidad para hablantes de yoruba: conversión de texto a voz para lectores de pantalla o interfaces de accesibilidad en aplicaciones dirigidas a comunidades yoruba.
- Prototipado de asistentes de voz en yoruba: sirve como base para experimentar con interfaces conversacionales en esta lengua, aunque la calidad de la voz `spk2` es limitada por el bajo volumen de datos.
- Investigación en NLP africano: punto de partida reproducible para estudiar adaptación de StyleTTS2/Kokoro a lenguas tonales y para evaluar frontends G2P como `oro-g2p`.
- Generación de avisos y anuncios cortos: frases breves y en dominio, donde el modelo muestra su mejor precisión tonal.
- Docencia y preservación lingüística: producción de material audio con pronunciación tonal controlada para aprendizaje del yoruba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida F0 de entrenamiento (1,76) y métricas de cobertura del frontend G2P (0 tokens perdidos sobre 178 slots), sin comparaciones objetivas tipo MOS, WER o MCD.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con pesos de 526 MB, la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo exacto depende del backend StyleTTS2.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060 o superior es suficiente para inferencia interactiva. Para entrenamiento o fine-tuning se recomienda una GPU de 16 GB o más.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4-8 GB de VRAM; no se especifica el mínimo exacto.
- Opciones de despliegue: el repositorio usa la librería `styletts2` con el script `tts_yoruba.py`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro Yorùbá v1 | yoruba | StyleTTS2 / Kokoro-82M | 2,70 h (BibleTTS + WaxalNLP) | CC BY-SA 4.0 | Hugging Face, 0 descargas |
| Kokoro-82M | multilingüe (inglés y otros) | StyleTTS2-like | no disponible | Apache 2.0 (según modelo original) | Hugging Face, ampliamente usado |
| StyleTTS2 (original) | inglés | StyleTTS2 | no disponible | MIT (código) | GitHub |
| TTS multilingües comerciales | varios, cobertura yoruba limitada | propietaria | no disponible | propietaria | APIs comerciales |

La comparación cuantitativa de calidad (MOS, inteligibilidad tonal) no está disponible para este modelo. Frente a Kokoro-82M, la diferencia clave es la especialización fonológica en yoruba mediante `oro-g2p` y el uso de datos nativos, a costa de un volumen de entrenamiento muy reducido.

## Limitaciones y advertencias

- Entrenado con solo 2,70 horas de audio, lo que limita la generalización fuera del dominio y de las frases cortas.
- La voz `spk2` suena más baja y menos definida debido al escaso volumen de datos (~1 % del corpus).
- Compuestos largos no vistos de 4-6 sílabas pueden perder la marca tonal correcta.
- El texto de entrada debe incluir diacríticos y marcas tonales yoruba (ẹ, ọ, ṣ, á, à); sin ellos la pronunciación será incorrecta.
- Riesgo de alucinación acústica y artefactos en entradas fuera de distribución; no se documentan evaluaciones formales de robustez.
- Licencia CC BY-SA 4.0: permite uso comercial pero obliga a atribución y a compartir obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Es un prototipo v1; no se documentan sesgos específicos más allá de la sobrerrepresentación del dominio bíblico.
- Todas las salidas son voz sintética generada por IA; debe indicarse así en aplicaciones finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akintunde102/kokoro-yoruba-v1
- Frontend G2P `oro-g2p` (PyPI): https://pypi.org/project/oro-g2p/
- Repositorio `oro-g2p` (GitHub): https://github.com/Akintunde102/oro-g2p
- StyleTTS2 (GitHub): https://github.com/yl4579/StyleTTS2
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Dataset BibleTTS / Open.Bible: https://huggingface.co/datasets/AfriSpeech/open-bible-speech-african
- Dataset WaxalNLP: https://huggingface.co/datasets/google/WaxalNLP
