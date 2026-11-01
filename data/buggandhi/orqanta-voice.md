# buggandhi/Orqanta-Voice

## Resumen

Orqanta-Voice es un motor de síntesis de voz (text-to-speech) en streaming desarrollado por Gandhi Kalasi (usuario `buggandhi` en HuggingFace) y orientado a 11 lenguas indias principales más inglés. El modelo combina un backbone autorregresivo Qwen3 de 0,6B parámetros con el códec neural de audio Mimi a 24 kHz, un Depth Transformer dedicado de 8 capas y adaptación de hablante zero-shot mediante ECAPA-TDNN. Su propuesta de valor se centra en la latencia: el autor declara un Time-to-First-Audio de aproximadamente 14 ms con batch size 1 sobre una H100, y capacidad para servir 224 streams concurrentes sin cortes de reproducción.

El modelo resuelve un problema concreto: la escasez de motores TTS de calidad para lenguas indias con requisitos de tiempo real para aplicaciones conversacionales (IVR, asistentes de voz, bots telefónicos). Frente a soluciones genéricas multilingües que tratan las lenguas indias como ciudadanos de segunda clase, Orqanta-Voice incluye normalización nativa de números, divisas y fechas, y clonación de voz zero-shot con muestras de 3 a 10 segundos.

La relevancia actual del modelo radica en su licencia Apache 2.0, que permite uso comercial sin restricciones, y en su arquitectura de streaming con CUDA graphs y continuous batching. No obstante, el repositorio de HuggingFace tiene un tamaño declarado de 0,0 GB y 21 descargas, lo que sugiere que los pesos podrían no estar publicados en el hub o que la model card antecede a la subida efectiva de los artefactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (backbone autorregresivo) + códec Mimi + Depth Transformer de 8 capas + ECAPA-TDNN |
| Parámetros totales | 0,6B (backbone Qwen3); total del sistema no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en), hindi (hi), odia (or), bengalí (bn), telugu (te), marati (mr), tamil (ta), guyaratí (gu), canarés (kn), malabar (ml), panyabí (pa), asamés (as) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es híbrida y específica para TTS. El backbone lingüístico es Qwen3 con 0,6B parámetros, que procesa el texto y genera tokens de audio de forma autorregresiva. La síntesis de waveform se delega en el códec neural Mimi a 24 kHz, que produce audio de alta fidelidad. Un Depth Transformer de 8 capas se encarga de la generación de los tokens de profundidad del códec, y ECAPA-TDNN proporciona la adaptación de hablante zero-shot a partir de 3 a 10 segundos de audio de referencia.

El sistema incorpora optimizaciones de inferencia orientadas a producción: continuous batching con CUDA graphs para reducir la latencia de despacho, y un pipeline de streaming que emite audio antes de completar la síntesis total. El autor declara normalización nativa de texto para números, divisas y fechas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz en streaming con Time-to-First-Audio declarado de ~14 ms en H100 a batch size 1.
- Generación de audio a 24 kHz con calidad Hi-Fi.
- Clonación de voz zero-shot a partir de 3 a 10 segundos de audio de referencia.
- Soporte de 11 lenguas indias más inglés: hindi, odia, bengalí, telugu, marati, tamil, guyaratí, canarés, malabar, panyabí y asamés.
- Normalización nativa de texto para números, divisas y fechas.
- Soporte de múltiples voces predefinidas con características diferenciadas (por ejemplo, `Siddhant`, `Vaidehi`, `Sreekar`, `Kayal`, `Anirban`, `Nakul`, `Charvi`).
- Capacidad de servir hasta 224 streams concurrentes sin cortes de reproducción según el autor.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo exclusivamente de TTS.

## Casos de uso

- Asistentes de voz en tiempo real: la latencia de ~14 ms TTFA y el streaming permiten respuestas habladas casi instantáneas en asistentes conversacionales, adecuado para interacción natural sin pausas perceptibles.
- Sistemas IVR telefónicos: la capacidad de 224 streams concurrentes y la normalización de números y divisas facilitan menús interactivos y lectura de datos variables (saldos, fechas, importes) en lenguas indias.
- Clonación de voz para locución personalizada: con 3 a 10 segundos de audio de referencia se puede generar una voz consistente para narración de contenidos, audiolibros o marketing en hindi, tamil o bengalí.
- Accesibilidad y lectura de contenido: conversión de texto a voz para usuarios con discapacidad visual en lenguas indias donde las soluciones comerciales son escasas o caras.
- Localización de contenido multimedia: doblaje automatizado de vídeos o cursos a las 11 lenguas soportadas manteniendo una voz de marca clonada.
- Atención al cliente automatizada: bots de voz multi-turno que responden en la lengua del usuario con voz natural, aprovechando el streaming para reducir la percepción de latencia.
- Anuncios y alertas de emergencia: lectura de avisos meteorológicos o institucionales con normalización correcta de cifras y fechas, como se muestra en los ejemplos de odia del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara métricas operativas (TTFA de ~14 ms, 224 streams concurrentes, 24 kHz) pero no compara con otros modelos mediante conjuntos de evaluación estándar de TTS (MOS, WER, SIM).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con un backbone de 0,6B parámetros, la huella sería moderada, pero el códec Mimi y el Depth Transformer añaden consumo no cuantificado.
- GPU recomendadas: el autor cita H100 para las métricas de latencia y concurrencia declaradas. No se especifican otros modelos.
- ¿Cabe en GPU de consumo? No disponible. No se confirma soporte para RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor menciona CUDA graphs y continuous batching, lo que implica un runtime propio o adaptado.
- Latencia y throughput: ~14 ms TTFA a batch size 1 en H100; 224 streams concurrentes sin cortes según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas indios | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orqanta-Voice | 0,6B (backbone) | No disponible | 11 + inglés | Apache 2.0 | Repositorio HF (0,0 GB) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han incluido alternativas para no inventar datos.

## Limitaciones y advertencias

- El repositorio de HuggingFace declara un tamaño de 0,0 GB, lo que sugiere que los pesos podrían no estar efectivamente publicados; conviene verificar antes de integrar en producción.
- Solo 21 descargas y 0 likes en el momento de la consulta: tracción comunitaria muy baja, sin validación independiente conocida.
- No se han publicado benchmarks objetivos (MOS, SIM, WER) que respalden las afirmaciones de calidad y latencia del autor.
- Riesgo de alucinación en la pronunciación: la normalización de texto puede fallar en casos ambiguos (abreviaturas, números con formato irregular, nombres propios).
- La clonación de voz zero-shot plantea riesgos de suplantación y uso indebido; aunque la licencia Apache 2.0 permite uso comercial, el despliegue debe acompañarse de controles de consentimiento y marcas de agua.
- Cobertura limitada a lenguas indias e inglés; no se documenta soporte para otras familias lingüísticas.
- No se especifican requisitos de hardware para GPU de consumo, lo que dificulta la planificación de despliegues fuera de datacenter.
- No se documentan sesgos conocidos ni evaluación de robustez por lengua o dialecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/buggandhi/Orqanta-Voice
- Repositorio GitHub: https://github.com/GANDHIKALASI/Orqanta-Voice
- Licencia: https://github.com/GANDHIKALASI/Orqanta-Voice/blob/main/LICENSE
- Notebook de Colab: https://colab.research.google.com/github/GANDHIKALASI/Orqanta-Voice/blob/main/Orqanta_Voice_Colab.ipynb
