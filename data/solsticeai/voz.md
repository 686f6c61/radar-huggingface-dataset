# SolsticeAI/voz

## Resumen

Voz es un modelo de reconocimiento automático del habla (ASR) orientado a ejecución en dispositivo, publicado por SolsticeAI bajo la licencia Desert Ant Labs Source Available 1.0. Transcribe audio a texto con marcas temporales a nivel de palabra en 25 idiomas y está diseñado exclusivamente para el ecosistema de Apple: todo el grafo de cómputo reside en la Neural Engine a través de Core ML, sin fallback a CPU ni a GPU.

La arquitectura es una cascada de tres etapas sobre Core ML (frontend log-mel, encoder acústico de tipo conformer y decoder transducer) que trabaja con ventanas fijas de 15 s y encadena ventanas consecutivas para audio largo. Ocupa 467 MB en disco y, según la model card, transcribe 10 minutos de audio en 2,1 s en un M3 Ultra (unas 290 veces tiempo real en archivos largos) con un WER medio del 7,40% sobre seis conjuntos del Open ASR Leaderboard.

Su relevancia está en el nicho: reconocimiento multilingüe con timestamps por palabra que cabe en aplicaciones iOS, iPadOS, macOS, tvOS y visionOS, con memoria pico que no crece con la duración de la grabación. El precio de esa integración es la renuncia total a plataformas no Apple: no hay rutas documentadas para CUDA, ROCm ni runtimes de inferencia genéricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cascada Core ML de tres etapas: frontend log-mel + encoder acústico tipo conformer + decoder transducer sobre ventana fija de 15 s |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana acústica fija de 15 s por pasada; el audio más largo se trocea en ventanas consecutivas cortadas en pausas, sin límite documentado de duración total |
| Tipos de cuantización | no disponible; la tabla de embeddings se distribuye en f16 (`embedding.f16`) y los artefactos Core ML se entregan ya compilados (`.mlmodelc`) |
| Idiomas soportados | 25: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | desert-ant-labs-source-available-1.0 (license: other); texto en https://license.desertant.com/1.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`) más `meta.json`, `vocab.json` y `embedding.f16`. Los tags del repositorio mencionan tflite y onnx, pero la model card solo documenta artefactos Core ML |

Otros datos del repositorio: tamaño del repo 2,1 GB, pipeline `automatic-speech-recognition`, 0 descargas y 0 likes en el momento de la consulta, fecha de creación indicada 2026-09-26.

## Arquitectura y entrenamiento

La model card describe una cascada de tres etapas despachada desde Swift. El frontend calcula un espectrograma log-mel dentro de Core ML, normalizado sobre los frames que contienen audio en lugar de sobre toda la ventana rellenada. El encoder es un modelo acústico de estilo conformer que opera sobre una ventana fija de 15 s y produce un frame cada 80 ms. El decoder es un transducer que emite en cada paso un token y una duración, y se ejecuta con dieciséis ventanas independientes batcheadas en las líneas de un único dispatch. El audio más largo se corta en ventanas consecutivas en las pausas, se transcribe de forma independiente y se une tomando la secuencia de palabras más larga en la que coinciden dos ventanas vecinas. Todas las etapas se ejecutan en la Neural Engine, sin fallback a CPU o GPU.

No se especifica en la información disponible el número de parámetros, el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste con preferencias. Los artefactos se distribuyen compilados (`.mlmodelc`) y la propia model card advierte de que deben mantenerse así, porque un `.mlpackage` se recompila en cada arranque y carga mucho más lento. Los nombres de los artefactos describen roles (`encoder`, `decoder`, `mel`) en lugar de la red concreta, de modo que sustituir el reconocedor es una nueva subida de ficheros y no un cambio de SDK.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con detección y mezcla de idiomas según la lista de lenguas declarada.
- Marcas temporales a nivel de palabra: cada palabra lleva un inicio y un fin en segundos, lo que permite cortar por rangos directamente.
- Audio largo sin límite de duración documentado, mediante troceado en ventanas de 15 s cortadas en pausas y unión por solapamiento de palabras coincidentes.
- Memoria pico constante: no crece con la longitud de la grabación, según la model card.
- Entrada de audio mono a cualquier frecuencia de muestreo; el SDK remuestrea y hace downmix.
- Ejecución íntegra en la Neural Engine (100% de residencia declarada), sin fallback a CPU ni GPU.
- Distribución como paquete Swift Package Manager para iOS, iPadOS, Mac Catalyst, macOS, tvOS y visionOS, con descarga y caché de modelos bajo demanda.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento: es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones en apps iOS y macOS: el modelo gestiona audio largo troceando por pausas y mantiene la memoria pico constante, de modo que una reunión de una hora no dispara el consumo de RAM del dispositivo; su WER de 11,84% en AMI es mejor que el de Whisper large-v3-turbo (13,87%) en ese conjunto.
- Subtitulado y edición de vídeo: los timestamps por palabra (error absoluto medio de 83 ms en inicios y 95 ms en fines en inglés) permiten generar subtítulos y marcas de corte sin un alineador forzado externo.
- Búsqueda y navegación dentro de audio: al disponer de inicio y fin por palabra, se pueden construir índices de texto con anclaje temporal para saltar a la frase exacta dentro de un pódcast o una clase grabada.
- Dictado y accesibilidad: integrable en apps de Apple como SDK Swift, con carga en caliente de ~0,2 s, adecuado para dictado por voz en interfaces de usuario.
- Archivado y transcripción masiva en local: al no salir el audio del dispositivo y no crecer la memoria con la duración, encaja en flujos con requisitos de privacidad o de coste cero de API por minuto.
- Análisis de llamadas de resultados y pódcasts: con la advertencia de que en estos dominios el WER sube al 10-13% (12,97% en Earnings-22), sirve para extracción de temas y búsqueda tolerante a errores, no para transcripción literal certificada.
- Aprendizaje de idiomas y lectura sincronizada: los timestamps por palabra permiten resaltar el texto a medida que se reproduce el audio, en los 25 idiomas declarados.
- Pipeline de preprocesado para un LLM local: la transcripción con marcas temporales se puede encadenar a un modelo de lenguaje para resumen o extracción, con el ASR ejecutándose en la Neural Engine y el LLM en otro backend.

## Benchmarks y rendimiento

Velocidad y métricas declaradas por el autor (M3 Ultra, build de release, en caliente):

| Métrica | Valor |
|---|---|
| Velocidad en archivos largos | 2,1 s para 611 s de audio (~290x tiempo real) |
| Velocidad en enunciados cortos | 50-62x tiempo real (cada clip paga una ventana completa de 15 s) |
| Media hora de narración | ~7 s |
| WER medio (6 conjuntos del Open ASR Leaderboard) | 7,40% |
| WER en formato largo (media hora de narración) | 2,83% |
| Timestamps de palabra, inicio | 83 ms de error absoluto medio frente a alineador forzado |
| Timestamps de palabra, fin | 95 ms de error absoluto medio |
| Residencia en Neural Engine | 100%, sin fallback a CPU ni GPU |
| Tamaño en disco | 467 MB |
| Carga | ~0,2 s en caliente; ~20 s una vez por instalación mientras Core ML especializa |

Inglés, Open ASR Leaderboard (normalizador de texto propio del modelo; cifras de Whisper tomadas del leaderboard con las mismas configuraciones de dataset):

| Dataset | Voz | Whisper large-v3-turbo |
|---|---:|---:|
| LibriSpeech test-clean | 2,19% | 2,13% |
| LibriSpeech test-other | 3,86% | 3,70% |
| GigaSpeech | 9,70% | 8,47% |
| SPGISpeech | 3,86% | 2,79% |
| Earnings-22 | 12,97% | 11,07% |
| AMI | 11,84% | 13,87% |
| Media | 7,40% | 7,00% |

Timestamps por palabra frente al alineador forzado MMS_FA de torchaudio:

| Idioma | Palabras | Inicio | Fin | Fines dentro de 80 ms | Dentro de 200 ms |
|---|---:|---:|---:|---:|---:|
| Inglés, LibriSpeech | 6295 | 83 ms | 95 ms | 60% | 90% |
| Alemán, FLEURS | 939 | 80 ms | 92 ms | 62% | 92% |

El autor omite VoxPopuli y TEDLIUM del leaderboard: en el primer caso los scripts del leaderboard apuntan a un shard de 628 enunciados que no corresponde al audio de la cifra publicada, y en el segundo la configuración no contiene filas. No se publican resultados de WER en los otros 23 idiomas declarados, ni benchmarks de tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- Plataforma obligatoria: Apple con Neural Engine. La model card indica que el SDK maneja Core ML directamente para mantener el grafo en la Neural Engine y que no existe equivalente en otros backends; no hay fallback a CPU ni GPU.
- VRAM: no disponible en cifras explícitas. El modelo ocupa 467 MB en disco y el pico de memoria no crece con la longitud de la grabación; el repositorio completo ocupa 2,1 GB.
- GPU compatibles: no se documenta soporte de CUDA ni ROCm. La única plataforma medida es un M3 Ultra; el resto de la familia Apple Silicon y los dispositivos iOS/tvOS/visionOS compatibles no se detallan.
- Cabe en hardware de consumo: sí, en el sentido de que el destino son dispositivos Apple, pero no es ejecutable en GPUs de consumo NVIDIA o AMD.
- Opciones de despliegue: SDK Swift como paquete Swift Package Manager (Desert-Ant-Labs/desert-ant-core) sobre Core ML, con los modelos descargados bajo demanda y cacheados. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime, pese a que los tags del repositorio mencionen tflite y onnx.
- Latencia y throughput: ~290x tiempo real en archivos largos, 50-62x en enunciados sueltos, media hora en ~7 s (M3 Ultra). La primera carga tras la instalación tarda ~20 s por la especialización de Core ML; las siguientes, ~0,2 s en caliente.

## Comparativa con modelos similares

| Modelo | Tamaño en disco | WER medio (Open ASR Leaderboard) | WER en AMI | Licencia | Plataformas | Timestamps por palabra |
|---|---|---|---|---|---|---|
| Voz (SolsticeAI) | 467 MB | 7,40% | 11,84% | Desert Ant Labs Source Available 1.0 (source-available) | Solo Apple, vía Core ML y Neural Engine | Sí, con error absoluto medio de 83/95 ms |
| Whisper large-v3-turbo | 1,6 GB | 7,00% | 13,87% | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

Las cifras de Whisper de la tabla de benchmarks son las del leaderboard citado por el autor en la model card. No se han proporcionado datos de otros reconocedores comparables (Parakeet, Canary, Conformer-CTC u otros), por lo que la comparativa se limita a estas dos entradas. En términos cualitativos, Voz es dos puntos mejor en reuniones (AMI) y va por detrás en habla preparada y leída (SPGISpeech, GigaSpeech, Earnings-22), con una huella de disco aproximadamente 3,4 veces menor.

## Limitaciones y advertencias

- Licencia de tipo source-available, no aprobada por OSI: la licencia es `desert-ant-labs-source-available-1.0` con texto en https://license.desertant.com/1.0. Hay que revisar los términos concretos de uso comercial antes de integrarlo en un producto; en la información disponible no se detalla qué permite y qué restringe.
- Dependencia total de Apple: sin Neural Engine no hay ejecución. La model card afirma explícitamente que no hay fallback a CPU ni GPU, lo que descarta servidores x86, CUDA, ROCm y entornos Linux.
- Sesgo de dominio: el propio autor advierte de que hay que esperar las cifras conversacionales, no las de LibriSpeech. Habla leída en grabación limpia ronda el 2%, mientras que reuniones, llamadas de resultados y pódcasts se sitúan en el 10-13%; para un pódcast, la expectativa honesta que da el autor es que aproximadamente una palabra de cada diez requerirá revisión.
- Riesgo de error en textos largos: no se documentan medidas de mitigación de alucinación o de bucles de repetición, habituales en decoders ASR. El WER de 2,83% en formato largo es una media sobre media hora de narración y no garantiza el mismo comportamiento en dominios ruidosos.
- Precisión desigual en timestamps: los fines son más difíciles que los inicios. El reconocedor informa de cuánto saltar tras cada token en lugar de dónde termina la palabra, lo que se pasa hacia la pausa siguiente y obliga a recortar; solo el 60% de los fines en inglés y el 62% en alemán caen dentro de 80 ms.
- Cobertura de evaluación limitada: solo hay WER publicado en inglés (seis conjuntos) y timestamps en inglés y alemán. Para los otros 23 idiomas declarados no se aportan cifras de error, y los conjuntos VoxPopuli y TEDLIUM se omiten del leaderboard.
- Artefactos compilados: los `.mlmodelc` deben mantenerse compilados; convertirlos a `.mlpackage` provoca recompilación en cada arranque y cargas mucho más lentas.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, con fecha de creación 2026-09-26, por lo que no hay evidencia externa de uso en producción ni comunidad que reporte fallos.
- Diferencia entre tamaño de descarga y tamaño en dispositivo: el repositorio ocupa 2,1 GB frente a los 467 MB declarados en disco, un factor a tener en cuenta para la distribución.
- La model card proporcionada está truncada en la sección de timestamps de palabra, por lo que parte de la explicación técnica sobre el recorte de los fines no está disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SolsticeAI/voz
- Documentación del SDK, instalación y ejemplos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/voz.md
- Repositorio del SDK Swift: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/1.0
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Alineador forzado MMS_FA de torchaudio: https://pytorch.org/audio/stable/generated/torchaudio.pipelines.MMS_FA.html
- Resultados de búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo; las búsquedas devolvieron únicamente listados de sitios para adultos sin relación con el modelo, por lo que no se incluyen.
