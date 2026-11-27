# ilsvls/gigaam-multilingual-v2-coreml

## Resumen

GigaAM Multilingual-v2 Core ML FP16 es una conversión del modelo de reconocimiento automático del habla ai-sage/GigaAM-Multilingual-v2 al formato Core ML, optimizada para ejecutarse en hardware de Apple Silicon (chips M-series) aprovechando la Neural Engine. La conversión la firma el usuario ilsvls como trabajo independiente durante la evaluación de modelos para la aplicación Dictate it, sin reentrenamiento: se parte del checkpoint RNNT original y se transforma a FP16.

El modelo resuelve la transcripción de voz a texto multilingüe (21 idiomas, con foco en ruso y lenguas de la órbita postsoviética) en entornos locales de macOS, sin dependencia de servicios en la nube. Frente a alternativas como Whisper, el autor reporta mejor precisión en su corpus técnico local: 8,85 % de WER en clips cortos y 17,06 % en grabaciones largas, frente al 17,60 % y 15,61 % respectivamente de su baseline Turbo Core AI.

Es relevante porque demuestra que un modelo ASR de calidad puede empaquetarse en 1,58 GB y ejecutarse íntegramente en un portátil Apple, con timestamps válidos y un pipeline completo (encoder, cabezas RNNT raw/e2e, tokenizer, extracción de features y VAD). La licencia MIT del modelo original facilita su uso comercial, aunque requiere un runtime nativo compatible con el formato propietario de Core ML.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer) convertido a Core ML; encoder + cabezas RNNT raw/e2e |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (perfil de 1024 frames mel) |
| Tipos de cuantización | FP16 (conversión única documentada) |
| Idiomas soportados | ru, en, kk, ky, uz, be, fr, es, ba, ka, hy, ro, tk, az, tg, de, it, nl, pl, pt, tt |
| Licencia | MIT |
| Formato de pesos | Core ML (FP16); repo de 1,6 GB con manifiesto y checksums SHA-256 |
| Tamaño del artefacto | 1,58 GB |
| Plataforma objetivo | Apple Silicon (ANE / CPU) |

## Arquitectura y entrenamiento

El modelo subyacente es un RNNT (transducer), una arquitectura clásica de ASR que combina un encoder acústico con un predictor y una red conjunta para alinear secuencias de audio y tokens de texto de forma monotónica. La conversión a Core ML preserva esta estructura e incluye el encoder, las cabezas RNNT en variantes raw y e2e, el tokenizer, la extracción de features mel (perfil de 1024 frames) y un módulo de detección de actividad de voz (VAD).

No se ha reentrenado el modelo: la conversión parte del checkpoint original ai-sage/GigaAM-Multilingual-v2 (revisión upstream `c21483b5e185ff32f6fb2e2c801f92f4e7fbfee8`) y se limita a transformar los pesos a FP16 para su ejecución en Apple Silicon. El autor indica que una etapa numéricamente sensible puede ejecutarse en CPU para mejorar la precisión, lo que sugiere que parte del grafo se delega fuera de la Neural Engine. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en 21 idiomas, con especial cobertura del ruso y lenguas de Asia Central y el Cáucaso (kazajo, kirguís, uzbeko, tártaro, azerí, armenio, georgiano, etc.).
- Generación de timestamps alineados con el audio: el autor reporta que todas las pruebas devolvieron timestamps válidos.
- Detección de actividad de voz (VAD) integrada en el paquete.
- Tokenizer incluido, lo que permite un pipeline de extremo a extremo sin dependencias externas.
- Cabezas RNNT en dos variantes (raw y e2e) para distintos modos de decodificación.
- Ejecución local en Apple Silicon con posible offload parcial a CPU para etapas sensibles.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni razonamiento multi-paso.

## Casos de uso

- Dictado por voz en macOS: integración en aplicaciones nativas como la mencionada Dictate it, transcribiendo en local sin enviar audio a la nube, lo que reduce latencia y preserva la privacidad.
- Subtitulado y transcripción de reuniones: con 63 minutos de audio procesados en las pruebas del autor y timestamps válidos, es adecuado para generar actas o subtítulos de grabaciones largas.
- Atención al cliente con grabaciones multilingües: la cobertura de 21 idiomas permite transcribir llamadas de usuarios en ruso, inglés, español, francés, alemán, etc., dentro de un mismo pipeline.
- Investigación lingüística en lenguas de baja representación: la inclusión de tártaro, baskír, turcomano, tayiko o kirguís facilita la creación de corpus transcritos para idiomas con pocos recursos.
- Herramientas de accesibilidad: transcripción en tiempo real de voz a texto para personas con discapacidad auditiva en un portátil Apple, sin coste de API.
- Procesamiento por lotes en estaciones de trabajo Mac: al ejecutarse sobre ANE, permite transcribir grandes volúmenes de audio sin GPU dedicada ni servidores externos.
- Prototipado de asistentes de voz offline: combinado con VAD integrado, sirve como front-end de reconocimiento en aplicaciones de escritorio que no pueden depender de conectividad.

## Benchmarks y rendimiento

Resultados reportados por el autor en pruebas locales (no son benchmarks oficiales), sobre un corpus técnico propio y comparados con su baseline histórico Whisper Large-v3 Turbo Core AI:

| Métrica | GigaAM Multilingual-v2 Core ML | Baseline Turbo Core AI |
|---|---|---|
| WER en clips cortos (272 clips) | 8,85 % | 17,60 % |
| WER en grabaciones largas (5 grabaciones, ~63 min) | 17,06 % | 15,61 % |

Hardware de prueba: M3 Pro con macOS 27.2.1. El autor advierte que se trata de una prueba de ingeniería local, no de un benchmark oficial, y que en el baseline un fallo de petición se contabilizó como error. No se han publicado resultados de benchmarks estándar (MLS, Common Voice, FLEURS) en la información disponible.

## Requisitos de hardware

- VRAM/espacio: el artefacto ocupa 1,58 GB en FP16; en Apple Silicon la memoria unificada debe acomodar el modelo más los buffers de inferencia.
- Hardware recomendado: chips Apple M-series (probado en M3 Pro); se espera funcionamiento en M1/M2/M4 con rendimiento variable según generación y número de núcleos de Neural Engine.
- Cabe en GPU de consumo: no aplica directamente, ya que el formato Core ML está orientado a Apple Silicon; no se documenta ejecución en GPUs NVIDIA o AMD.
- Despliegue: requiere un runtime nativo compatible con GigaAM (ver FORMAT.md y release.json del repo); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles de forma numérica; el autor solo reporta el tiempo total de procesamiento de ~63 minutos de audio sin cifra de factor de tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamaño | Licencia | Plataforma |
|---|---|---|---|---|---|
| GigaAM Multilingual-v2 Core ML (este) | RNNT ASR | 21 | 1,58 GB | MIT | Apple Silicon |
| Whisper Large-v3 Turbo Core AI (baseline del autor) | Transformer ASR | ~99 | no disponible en la ficha | MIT (Whisper) | Apple Silicon |
| ai-sage/GigaAM-Multilingual-v2 (original) | RNNT ASR | 21 | no disponible | MIT | Genérica (PyTorch) |
| Whisper Large-v3 (referencia) | Transformer ASR | ~99 | ~1,55 B parámetros | MIT | Multiplataforma |

La comparación se limita a lo documentado: el baseline del autor ofrece mayor cobertura de idiomas pero peor WER en clips cortos según sus propias pruebas, mientras que el modelo original GigaAM sirve como referencia de precisión sin conversión. No se dispone de datos de benchmarks cruzados con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de WER proceden de un corpus técnico local del autor, no de benchmarks estándar; la generalización a otros dominios y acentos no está validada.
- El rendimiento en grabaciones largas (17,06 %) es peor que en clips cortos (8,85 %) y, en ese caso, inferior al baseline Whisper en el mismo corpus (15,61 %).
- Requiere un runtime nativo específico para GigaAM; no es un modelo plug-and-play en frameworks ASR convencionales.
- La conversión a Core ML puede introducir degradación numérica; el autor mitiga parte con offload a CPU de una etapa sensible, lo que afecta al rendimiento.
- La cobertura de idiomas es amplia pero desigual: el foco está en ruso y lenguas postsoviéticas; para idiomas como el español o el francés no se reportan métricas específicas.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o vocabulario técnico no visto en entrenamiento; no se documenta diarización.
- La licencia MIT permite uso comercial, pero conviene verificar los términos del modelo base y de las dependencias del runtime.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilsvls/gigaam-multilingual-v2-coreml
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual-v2
- Conversión alternativa Core AI: https://huggingface.co/ilsvls/gigaam-multilingual-v2-coreai
- Conversión v4 Core ML: https://huggingface.co/ilsvls/gigaam-v4-coreml
- Conversión v4 Core AI: https://huggingface.co/ilsvls/gigaam-v4-coreai
- Baseline Turbo Core AI: https://huggingface.co/ilsvls/whisper-large-v3-turbo-coreai-pal8-ane
- FORMAT.md y release.json: referenciados en el repositorio del modelo (no se proporcionan URL directas)
