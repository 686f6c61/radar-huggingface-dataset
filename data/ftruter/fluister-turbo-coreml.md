# FTruter/fluister-turbo-coreml

## Resumen

Fluister-turbo-coreml es un artefacto de inferencia en formato Core ML del modelo de reconocimiento automático del habla (ASR) whisper-large-v3-turbo de OpenAI, ajustado para afrikaans y convertido para ejecutarse sobre el Neural Engine (ANE) y la GPU Metal de los chips Apple Silicon. Lo publica el usuario FTruter en HuggingFace y comparte pesos fusionados con las variantes de DigiPhyte `digiphyte/fluister-turbo` (CTranslate2) y `digiphyte/fluister-turbo-transformers` (safetensors fp16), de modo que es la misma familia "Fluister" distribuida en tres formatos distintos.

El problema que resuelve es concreto: permitir transcripción de voz en afrikaans de forma local, sin enviar audio a servicios en la nube, aprovechando la aceleración hardware de los Mac y dispositivos Apple. El repositorio ocupa aproximadamente 1,6 GB sin comprimir e incluye los ficheros `.mlmodelc` para encoder y decoder, pero omite deliberadamente `TextDecoderContextPrefill.mlmodelc` porque la conversión no superaba el umbral de PSNR que aplica la herramienta de verificación de WhisperKit.

Se trata de un artefacto de nicho y muy reciente (publicado el 17 de septiembre de 2026 según los metadatos, con 0 descargas y 0 valoraciones en el momento de redactar esta ficha), pensado para desarrolladores que ya trabajan con WhisperKit y necesitan un pipeline de ASR en afrikaans. No incluye datos de evaluación publicados ni una model card extensa más allá de la nota de conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (heredada de `openai/whisper-large-v3-turbo`) |
| Parámetros totales | No declarados en la model card; el modelo base `openai/whisper-large-v3-turbo` tiene del orden de 809 M de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada; arquitectura Whisper con ventanas de audio de 30 s y hasta 448 tokens de destino por ventana |
| Tipos de cuantización | No documentados; el artefacto publicado está sin comprimir para ANE/Metal. Las variantes hermanas del mismo ajuste se distribuyen en fp16 (safetensors) y en CTranslate2 |
| Idiomas soportados | Afrikáans (`af`), declarado como único idioma objetivo en los tags y en la model card |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlmodelc`, paquete compilado para ANE/Metal); no se distribuyen safetensors ni GGUF en este repositorio |
| Tamaño del repositorio | ~1,6 GB (sin comprimir) |
| Librería / runtime | `whisperkit` (WhisperKit, de Argmax) |
| Pipeline declarado | `automatic-speech-recognition` |
| Modelo base | `openai/whisper-large-v3-turbo` |
| Herramienta de conversión | `argmaxinc/whisperkittools` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder con espectrograma log-Mel como entrada, donde el encoder procesa ventanas de audio de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. La variante "turbo" de OpenAI reduce el número de capas del decoder respecto a large-v3, lo que disminuye el coste de inferencia manteniendo el encoder completo; el resultado es un modelo del orden de 800 millones de parámetros con una latencia notablemente inferior a la de large-v3. No se especifican en la información disponible ni el número de tokens de audio vistos durante el ajuste en afrikaans, ni la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado clásico sobre pares audio-transcripción.

La innovación de este repositorio no está en el entrenamiento, sino en el empaquetado: la conversión a Core ML permite delegar el encoder y el decoder en el Apple Neural Engine y en Metal, en lugar de ejecutar en CPU o GPU genérica. Los pesos son los mismos que los de las variantes de DigiPhyte, fusionados y convertidos con `whisperkittools`. La única modificación documentada respecto a una conversión estándar es la omisión de `TextDecoderContextPrefill.mlmodelc`, un componente opcional para el prellenado del contexto del decoder, descartado porque su PSNR quedaba por debajo del control de calidad de la herramienta. Esto implica que el pipeline de WhisperKit que consuma este repositorio debe funcionar sin ese fichero o proporcionarlo por otra vía.

## Capacidades

- Transcripción de voz a texto en afrikáans, el único idioma objetivo declarado.
- Ejecución local sobre Apple Silicon mediante WhisperKit y Core ML, con delegación en ANE/Metal.
- Procesamiento de audio en ventanas de 30 segundos, con agregación de segmentos para audios más largos por parte del runtime.
- Salida de texto con puntuación y capitalización propias del formato Whisper.
- Compatible con las utilidades de WhisperKit (segmentación, agregación de resultados y, según la configuración del runtime, marcas de tiempo a nivel de palabra o segmento).
- Tarea de traducción al inglés heredada de Whisper (`task=translate`), aunque no hay evaluación publicada de su calidad en esa modalidad para este ajuste.
- No dispone de tool calling ni function calling: es un modelo puramente de ASR.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades de visión, audio comprensivo (solo transcripción), ni generación de texto libre condicionada por prompt más allá de los tokens de tarea de Whisper.
- No se documentan capacidades multilingües adicionales; el ajuste está orientado a un solo idioma.

## Casos de uso

- Transcripción de reuniones internas en empresas sudafricanas: el modelo convierte audio de salas o videollamadas en afrikáans a texto sin salir del dispositivo, lo que evita exponer conversaciones confidenciales a APIs externas.
- Subtitulado de contenido audiovisual en afrikáans: se puede integrar en un pipeline de postproducción sobre macOS que genere ficheros de subtítulos a partir de los segmentos producidos por WhisperKit.
- Atención al cliente y análisis de llamadas: transcripción por lotes de grabaciones de call center para clasificación posterior, análisis de calidad o búsqueda sobre el texto generado.
- Dictado en aplicaciones nativas de Apple: al estar empaquetado en Core ML, puede embeberse en una app de macOS o iOS para dictado en afrikáans con latencia baja y sin conexión a internet.
- Archivado y búsqueda de audio histórico: transcripción de un archivo de podcasts, entrevistas o emisiones de radio en afrikáans para habilitar búsqueda full-text sobre el contenido.
- Documentación clínica o jurídica dictada: profesionales que trabajan en afrikáans pueden transcribir notas de voz en local, cumpliendo requisitos de residencia de datos al no enviar audio a terceros.
- Generación de corpus anotados: investigadores que necesitan transcribir grandes volúmenes de audio en afrikáans pueden usar este artefacto como paso previo a una revisión humana, aprovechando la aceleración por ANE.
- Asistentes de voz embebidos: integración en dispositivos o aplicaciones con reconocimiento de comandos en afrikáans, siempre que el runtime gestione el troceado de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que el PSNR de la conversión de `TextDecoderContextPrefill.mlmodelc` quedaba justo por debajo del control de calidad de `whisperkittools`, pero no se aportan cifras de WER, CER ni comparaciones con otras variantes del mismo ajuste.

## Requisitos de hardware

- Al tratarse de un paquete Core ML sin comprimir de ~1,6 GB, el peso en disco y en memoria es aproximadamente ese tamaño más el overhead del runtime de WhisperKit.
- Diseñado específicamente para Apple Silicon: chips de la familia M1, M2, M3 y M4 (y sus variantes Pro, Max y Ultra), que disponen de Neural Engine y GPU Metal.
- No es ejecutable directamente en GPU NVIDIA, AMD ni en CPU x86 sin una reconversión previa a otro formato (por ejemplo, CTranslate2 o safetensors con PyTorch).
- Memoria unificada recomendada: al menos 8 GB para cargar el modelo junto al resto de la aplicación; 16 GB o más si se procesan audios largos en paralelo o se combina con otros modelos.
- Opciones de despliegue: WhisperKit como runtime principal; alternativas equivalentes del mismo ajuste mediante CTranslate2 (`digiphyte/fluister-turbo`) o transformers con safetensors fp16 (`digiphyte/fluister-turbo-transformers`). vLLM, llama.cpp, Ollama y TGI no aplican a este formato.
- Latencia y throughput: no disponibles. Dependerán del chip concreto, del uso efectivo del ANE frente a Metal y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana / contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `FTruter/fluister-turbo-coreml` | No declarados (~809 M según el modelo base) | Ventanas de audio de 30 s | Afrikáans (`af`) | Core ML (`.mlmodelc`) | MIT | Optimizado para ANE/Metal en Apple Silicon; sin `TextDecoderContextPrefill.mlmodelc` |
| `digiphyte/fluister-turbo` | No declarados | Ventanas de audio de 30 s | Afrikáans | CTranslate2 | No disponible en la información proporcionada | Mismos pesos fusionados, orientado a inferencia eficiente en CPU/GPU |
| `digiphyte/fluister-turbo-transformers` | No declarados | Ventanas de audio de 30 s | Afrikáans | safetensors fp16 | No disponible en la información proporcionada | Mismos pesos fusionados, ejecutable con la librería transformers |
| `openai/whisper-large-v3-turbo` | ~809 M | Ventanas de audio de 30 s | Multilingüe (decenas de idiomas) | safetensors / múltiples | No disponible en la información proporcionada | Modelo base sin ajuste específico; mayor cobertura de idiomas, presumiblemente peor WER en afrikáans que el ajuste Fluister |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: el ajuste está pensado para afrikáans; no hay evidencia publicada de su comportamiento en otros idiomas, y podría degradarse respecto al modelo base en ellos.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio musical, especialmente cuando no hay habla clara.
- Artefacto de conversión, no un modelo nuevo: cualquier sesgo presente en `openai/whisper-large-v3-turbo` y en el ajuste de DigiPhyte se hereda íntegramente.
- Dependencia de Apple Silicon: sin una reconversión, no puede desplegarse en infraestructura con GPU NVIDIA ni en servidores x86 convencionales.
- Componente ausente: la falta de `TextDecoderContextPrefill.mlmodelc` puede afectar al rendimiento o requerir configuración adicional en el pipeline de WhisperKit.
- Ausencia de benchmarks: no hay WER ni CER publicados para este ajuste, por lo que no es posible estimar su calidad frente a alternativas sin una evaluación propia.
- Madurez del repositorio: 0 descargas y 0 valoraciones, sin historial de uso en producción; conviene validar antes de integrarlo en un sistema crítico.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda revisar el fichero NOTICE del repositorio por la atribución a DigiPhyte y las condiciones del modelo base de OpenAI.
- Fecha de creación registrada como 2026-09-17 en los metadatos, posterior a la fecha habitual de publicación; conviene verificar la vigencia del repositorio antes de depender de él.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FTruter/fluister-turbo-coreml
- Variante CTranslate2: https://huggingface.co/digiphyte/fluister-turbo
- Variante transformers (fp16 safetensors): https://huggingface.co/digiphyte/fluister-turbo-transformers
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Herramienta de conversión: https://github.com/argmaxinc/whisperkittools
