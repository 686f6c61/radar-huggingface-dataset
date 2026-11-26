# Abittee/amharic-speech-to-text-efa-v1-coreml

## Resumen

El modelo `Abittee/amharic-speech-to-text-efa-v1-coreml` es una conversión a Core ML con cuantización de 8 bits del modelo `Abittee/amharic-speech-to-text-efa-v1`, un sistema de reconocimiento automático del habla (ASR) especializado en amárico. Lo desarrolla Endrias F. Abitte y está pensado para inferencia en dispositivo (on-device) en iPhone, concretamente para la aplicación Amharic Notes. La conversión reduce el tamaño de los pesos de aproximadamente 2,4 GB a unos 609 MB, manteniendo prácticamente idéntica la precisión según la simulación en PyTorch reportada por el autor.

El modelo base parte de `facebook/w2v-bert-2.0`, un encoder transformer preentrenado con objetivos de predicción auto-supervisada sobre audio multilingüe, afinado con una cabeza CTC sobre datos de amárico de los conjuntos WAXAL y FLEURS. La arquitectura resultante es un encoder w2v-BERT 2.0 con decodificación CTC greedy, sin componente autoregresivo, lo que simplifica el despliegue y reduce la latencia en dispositivos móviles.

Su relevancia radica en dos factores: por un lado, cubre un idioma con escasa representación en herramientas ASR comerciales (el amárico, escrito en alfabeto etíope); por otro, demuestra un flujo de despliegue completo desde un modelo de investigación en PyTorch hasta un artefacto Core ML cuantizado listo para iOS 17 o superior, con métricas de degradación por cuantización explícitas (WER y CER sobre dos test sets completos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | w2v-BERT 2.0 (encoder transformer) + cabeza CTC |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada `input_features` de T = 12 a 500 frames, ~20 ms por fila) |
| Tipos de cuantización | 8 bits simétrica, por canal de salida, en todas las capas lineales y convolucionales |
| Idiomas soportados | amárico (`am`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`); el original en PyTorch |
| Tamaño del artefacto | ~609 MB (original ~2,4 GB) |
| Entrada | `input_features` float32 (1, T, 160), 80 bins log-mel Kaldi (ventana 25 ms, hop 10 ms), normalización por bin sobre el enunciado, dos frames apilados (20 ms por fila) |
| Salida | `logits` float32 (1, T', vocab), un frame cada 0,04 s |
| Decodificación | CTC greedy: argmax, colapso de repeticiones, descarte de blank (id 284), `|` como espacio |
| Requisito mínimo | iOS 17 |
| Librería | coreml |

## Arquitectura y entrenamiento

El modelo base es un w2v-BERT 2.0, un encoder transformer que combina aprendizaje auto-supervisado contrastivo y enmascarado sobre audio, preentrenado originalmente por Meta en `facebook/w2v-bert-2.0`. Sobre esa base, el autor aplicó un ajuste fino supervisado con una cabeza de clasificación CTC para transcripción de amárico, usando los corpus WAXAL (amh_asr) y FLEURS (am_et). No se especifica en la información disponible el número de tokens de audio de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR CTC).

La innovación principal de esta ficha concreta no está en el entrenamiento sino en la conversión y compresión: cuantización de 8 bits simétrica por canal de salida en todas las capas lineales y convolucionales, manteniendo la entrada y la salida en float32. El autor reporta que la simulación en PyTorch de esos pesos exactos produce una degradación prácticamente nula frente al modelo original (diferencias de 0,05 puntos de WER en WAXAL y 0,04 en FLEURS). El artefacto Core ML incluye `feature_extractor.json` con las ventanas y filtros mel, `vocab.json` con el vocabulario CTC y `model_info.json` con tamaños y SHA-256 de cada fichero.

## Capacidades

- Reconocimiento automático del habla en amárico, con salida de texto en alfabeto etíope.
- Transcripción de clips de audio de entre 0,5 y 20 segundos según los test sets reportados (T de 12 a 500 frames de entrada).
- Decodificación CTC greedy no autoregresiva, lo que permite procesar el audio en una sola pasada del encoder.
- Inferencia en dispositivo (on-device) en iPhone con iOS 17 o superior, sin conexión a red.
- Manejo de vocabulario CTC con token blank (id 284) y separador de palabras representado por `|`.
- Evalúa errores ignorando homófonos del alfabeto etíope (ሀ/ሐ/ኀ, ሰ/ሠ, አ/ዐ, ጸ/ፀ) y puntuación en las métricas reportadas.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá del ASR ni modo de razonamiento; es un modelo puramente ASR.

## Casos de uso

- **Transcripción de notas de voz en iOS**: la app Amharic Notes lo usa para convertir dictados de voz en texto dentro del propio dispositivo, sin enviar audio a servidores y con latencia baja gracias a la decodificación CTC en una pasada.
- **Accesibilidad para hablantes de amárico**: subtitulado en tiempo casi real de conversaciones o contenido pregrabado en iPhone, útil para personas con dificultades auditivas o para documentar reuniones.
- **Aplicaciones de campo sin conectividad**: al ejecutarse on-device, permite transcribir entrevistas, encuestas o informes en zonas con cobertura limitada, siempre que el clip no supere los ~20 s por inferencia.
- **Digitalización de archivos orales**: transcripción por lotes de grabaciones cortas en amárico (entrevistas, testimonios, material educativo) para su indexación y búsqueda textual.
- **Integración en apps de mensajería o productividad**: dictado de mensajes y documentos en amárico dentro de aplicaciones iOS nativas, usando el `.mlpackage` como dependencia del proyecto Xcode.
- **Prototipado de pipelines ASR multilingües**: como componente de amárico dentro de un sistema que enrute audio por idioma hacia distintos modelos, aprovechando su reducido tamaño (~609 MB) frente al original (~2,4 GB).
- **Investigación en cuantización para ASR móvil**: sirve como referencia reproducible de cuantización 8-bit por canal en w2v-BERT + CTC, con métricas de degradación publicadas.

## Benchmarks y rendimiento

Datos reportados por el autor con decodificación CTC greedy, test sets completos, clips de 0,5 a 20 s, sin contar errores en homófonos ni puntuación. La columna de 8 bits corresponde a una simulación en PyTorch de los pesos exactos del artefacto Core ML.

| Test set | Original WER / CER | 8 bits WER / CER |
|---|---|---|
| WAXAL amh_asr test (3031 clips) | 23,49 % / 9,55 % | 23,54 % / 9,56 % |
| FLEURS am_et test (505 clips) | 15,84 % / 4,56 % | 15,88 % / 4,59 % |

No se han publicado en la información disponible datos de latencia, throughput ni comparativas con otros modelos ASR de amárico.

## Requisitos de hardware

- **VRAM estimada**: no aplica en el sentido de GPU de escritorio; el artefacto está diseñado para el Neural Engine y la GPU integrada del iPhone. El tamaño de pesos es de ~609 MB, por lo que la memoria de trabajo debe acomodar el modelo más las activaciones del encoder para T de hasta 500 frames.
- **GPU recomendadas**: no disponible para despliegue en servidor; el formato Core ML está orientado a Apple Silicon y a los chips A-series/M-series con Neural Engine.
- **Compatibilidad consumer**: sí, en iPhone con iOS 17 o superior. No se indica compatibilidad con macOS, iPadOS ni con GPUs NVIDIA/AMD en la información disponible.
- **Opciones de despliegue**: Core ML (librería `coreml`, integración en Xcode). No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | WER FLEURS am_et |
|---|---|---|---|---|---|---|
| Abittee/amharic-speech-to-text-efa-v1-coreml | w2v-BERT 2.0 + CTC, 8 bits | am | ~609 MB | CC BY-SA 4.0 | Core ML | 15,88 % |
| Abittee/amharic-speech-to-text-efa-v1 (original) | w2v-BERT 2.0 + CTC | am | ~2,4 GB | CC BY-SA 4.0 | PyTorch | 15,84 % |
| facebook/w2v-bert-2.0 | w2v-BERT 2.0 (preentrenado) | multilingüe | no disponible | no disponible | PyTorch/safetensors | no disponible (no es ASR supervisado) |

No se dispone en la información proporcionada de otros modelos ASR específicos de amárico con los que establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- **Idioma único**: solo amárico; no transcribe otros idiomas ni cambia de idioma automáticamente.
- **Duración de audio**: los test sets cubren clips de 0,5 a 20 s y la entrada admite T de 12 a 500 frames; audios más largos requieren segmentación previa.
- **Errores en homófonos**: el WER reportado no penaliza confusiones entre ሀ/ሐ/ኀ, ሰ/ሠ, አ/ዐ y ጸ/ፀ, por lo que la tasa de error percibida por un usuario que exija ortografía estricta puede ser mayor.
- **Puntuación**: los errores de puntuación tampoco se contabilizan en las métricas; la salida CTC no genera puntuación de forma fiable.
- **Riesgo de alucinación**: en ASR CTC el riesgo se manifiesta como sustituciones o inserciones de tokens, especialmente en audio ruidoso o con acentos no representados en WAXAL/FLEURS.
- **Licencia CC BY-SA 4.0**: permite uso comercial, pero obliga a atribuir al autor original y a compartir las adaptaciones bajo la misma licencia (copyleft). Esto puede ser incompatible con productos propietarios que no quieran liberar sus modificaciones del modelo.
- **Plataforma**: requiere iOS 17 o superior y el runtime Core ML; no es portable directamente a Android ni a servidores Linux sin reconversión.
- **Cuantización**: la validación de los 8 bits es una simulación en PyTorch, no una medición sobre el artefacto Core ML ejecutándose en dispositivo; la degradación real en hardware Apple podría diferir.
- **Sesgos**: no se documentan análisis de sesgo por género, edad o variante dialectal del amárico; la cobertura depende de la composición de WAXAL y FLEURS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abittee/amharic-speech-to-text-efa-v1-coreml
- Modelo base en Hugging Face: https://huggingface.co/Abittee/amharic-speech-to-text-efa-v1
- Modelo preentrenado de origen: https://huggingface.co/facebook/w2v-bert-2.0
- WAXAL (corpus de entrenamiento): no disponible en la información proporcionada
- FLEURS (corpus de evaluación): no disponible en la información proporcionada
- Documentación de Core ML: no disponible en la información proporcionada
