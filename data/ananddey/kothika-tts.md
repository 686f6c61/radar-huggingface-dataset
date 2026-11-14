# ananddey/kothika-tts

## Resumen

Kothika-TTS es un modelo de síntesis de voz (text-to-speech) centrado en el idioma asamés, desarrollado por Anand Dey y publicado en Hugging Face bajo licencia Apache 2.0. El modelo convierte directamente texto Unicode en asamés a voz natural, sin necesidad de transliteración ni de normalización de texto externa, lo que simplifica enormemente su integración en aplicaciones reales. Está construido sobre la arquitectura de síntesis de voz de Zyphra, un enfoque que combina modelado acústico neuronal con un códec de audio neuronal (descript-audio-codec) y un módulo de normalización de texto (zyphra-textnorm).

El modelo destaca por ofrecer inferencia completamente local, clonación de voz zero-shot a partir de audio de referencia y 16 voces integradas (9 femeninas y 7 masculinas), todas verificadas auditivamente para claridad y pronunciación correcta del asamés. Aunque el foco principal es el asamés, también soporta inglés, hindi, bengalí, tamil, telugu, marathi, gujarati, kannada, malayalam, punyabí, odia y urdu, lo que lo convierte en una herramienta útil para el ecosistema de lenguas indias.

El repositorio ocupa 1,8 GB, pero la primera síntesis descarga aproximadamente 8 GB de pesos del códec, que quedan cacheados localmente. El modelo puede ejecutarse tanto en CPU (con tiempos de generación de 20-30 segundos por utterance) como en GPU (mucho más rápido). Es relevante ahora porque cubre una lengua con escasa representación en el ecosistema TTS open source y ofrece control expresivo fino mediante parámetros de loudness, fmax, speaking_rate y temperature.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en la arquitectura de síntesis de voz de Zyphra (modelo acústico neuronal + códec descript-audio-codec) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | asamés (principal), inglés, hindi, bengalí, tamil, telugu, marathi, gujarati, kannada, malayalam, punyabí, odia, urdu |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 1,8 GB; pesos del códec ~8 GB descargados aparte) |

## Arquitectura y entrenamiento

Kothika-TTS se construye sobre la arquitectura de síntesis de voz de Zyphra, que combina un modelo acústico neuronal con un códec de audio neuronal (descript-audio-codec versión 1.0.0) y un módulo de normalización de texto (zyphra-textnorm versión 0.1.0). El modelo procesa directamente texto Unicode en asamés, evitando la transliteración y la normalización externa, lo que reduce la complejidad del pipeline y preserva la fidelidad lingüística. La clonación de voz zero-shot se logra a partir de audio de referencia, lo que sugiere un mecanismo de condicionamiento por hablante integrado en el modelo acústico.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card no especifica el número de tokens de entrenamiento ni la procedencia de los datos de audio. La innovación técnica destacable es la capacidad de control expresivo mediante parámetros explícitos (loudness, fmax, speaking_rate, temperature) y la estabilidad del condicionamiento de voz en las 16 voces integradas.

## Capacidades

- Síntesis de voz en asamés a partir de texto Unicode directo, sin transliteración ni normalización externa.
- Clonación de voz zero-shot a partir de audio de referencia (archivo WAV).
- 16 voces integradas: 9 femeninas (Anamika, Bidisha, Sonali, Rajshri, Indrani, Anita, Jonali, Trishna, Isha) y 7 masculinas (Arup, Gautam, Joydip, Sameer, Diganta, Pranjal, Bishnu).
- Control expresivo mediante parámetros: loudness (−36 a −18), fmax (2500 a 16000), speaking_rate (14 a 35) y temperature (0.6 a 1.0).
- Soporte multilingüe para 13 idiomas de la India, además del asamés como idioma principal.
- Inferencia completamente local, sin dependencia de servicios en la nube.
- Ejecución en CPU y GPU (detección automática con `device="auto"`).

## Casos de uso

- **Accesibilidad para hablantes de asamés**: conversión de textos digitales (noticias, libros, documentos) a audio para personas con discapacidad visual o dificultades de lectura, aprovechando la síntesis directa desde Unicode sin pasos intermedios.
- **Locución automatizada para medios locales**: generación de narraciones en asamés para radios comunitarias, podcasts o vídeos informativos, con control de expresividad (loudness, speaking_rate) para adaptar el tono al contenido.
- **Asistentes de voz en asamés**: integración en interfaces conversacionales locales para atención al ciudadano o servicios públicos en zonas donde el asamés es lengua principal, con inferencia local que evita dependencias de red.
- **Clonación de voz para preservación de locutores**: creación de réplicas de voz de locutores o narradores con fines de archivo cultural o entretenimiento, usando audio de referencia de pocos segundos.
- **Generación de audiolibros multilingües**: producción de audiolibros en asamés y otros idiomas indios soportados, con selección de voz y ajuste de velocidad para distintos géneros literarios.
- **Prototipado de aplicaciones de voz para lenguas indias**: desarrollo de demos y pruebas de concepto en entornos de investigación o startups que necesiten TTS para asamés u otras lenguas indias sin coste de licencia (Apache 2.0).
- **Doblaje y localización de contenido**: adaptación de vídeos o material educativo a asamés mediante síntesis de voz, con control de expresión para mantener el tono del original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. El repositorio ocupa 1,8 GB y la primera síntesis descarga ~8 GB de pesos del códec, que se cachean localmente. La VRAM necesaria para inferencia no se especifica en la model card.
- **GPU recomendadas**: no se indican modelos concretos. La model card menciona que una GPU funciona "mucho más rápido" que CPU, pero no detalla qué GPU.
- **CPU**: funciona, con tiempos de generación de aproximadamente 20-30 segundos por utterance.
- **Consumer GPU**: no se confirma compatibilidad con GPU de consumo; dado el tamaño de los pesos del códec (~8 GB), es plausible que quepa en GPUs con 8-12 GB de VRAM, pero no está verificado en la información disponible.
- **Opciones de despliegue**: el modelo se distribuye como repositorio clonable con un paquete Python propio (`kothika_tts`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables directamente a un modelo TTS de este tipo).
- **Latencia y throughput**: en CPU, ~20-30 s por generación; en GPU, significativamente más rápido, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Idiomas | Clonación de voz | Voces integradas | Licencia | Contexto |
|---|---|---|---|---|---|
| Kothika-TTS | asamés + 12 idiomas indios | Sí (zero-shot) | 16 | Apache 2.0 | no disponible |
| Modelos TTS multilingües comerciales (p. ej. ElevenLabs) | Amplio | Sí | Múltiples | Propietaria | no disponible |
| Coqui TTS (open source) | Varios | Limitada | Depende del modelo | MPL 2.0 | no disponible |
| IndicTTS (familia de modelos para lenguas indias) | Lenguas indias | Variable | Variable | Variable | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con modelos similares en la información proporcionada. La comparativa anterior es cualitativa y se basa en categorías generales, no en mediciones directas.

## Limitaciones y advertencias

- **Idioma principal**: el modelo está optimizado para asamés; el rendimiento en los otros 12 idiomas soportados no está cuantificado y podría ser inferior.
- **Riesgo de alucinación en TTS**: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, entonación extraña o artefactos en textos con nombres propios, siglas o términos técnicos no vistos en entrenamiento.
- **Dependencia de descarga externa**: la primera síntesis requiere descargar ~8 GB de pesos del códec, lo que puede ser problemático en entornos con ancho de banda limitado o sin conexión.
- **Sesgos**: no se documentan sesgos conocidos, pero al estar entrenado presumiblemente con voces de una región concreta, podría no representar toda la diversidad dialectal del asamés.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar las licencias de las dependencias (descript-audio-codec, zyphra-textnorm) para producción.
- **Madurez**: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que sugiere que no ha sido ampliamente validado por la comunidad.
- **Documentación limitada**: no se especifican parámetros totales, contexto, tipos de cuantización ni detalles de entrenamiento, lo que dificulta la reproducibilidad y la evaluación técnica profunda.

## Enlaces

- [Hugging Face: ananddey/kothika-tts](https://huggingface.co/ananddey/kothika-tts)
- [Repositorio clonable (git clone)](https://huggingface.co/ananddey/kothika-tts.git)
- [Demo de audio 1](https://huggingface.co/ananddey/kothika-tts/resolve/main/demo/1_Anamika_warm.wav)
- [Demo de audio 2](https://huggingface.co/ananddey/kothika-tts/resolve/main/demo/2_Sameer_bright_narrative.wav)
- [Demo de audio 3](https://huggingface.co/ananddey/kothika-tts/resolve/main/demo/3_Rajshri_dark_slow.wav)
- [Demo de audio 4](https://huggingface.co/ananddey/kothika-tts/resolve/main/demo/4_Jonali_intimate.wav)
- [Demo de audio 5](https://huggingface.co/ananddey/kothika-tts/resolve/main/demo/5_Joydip_energetic.wav)
