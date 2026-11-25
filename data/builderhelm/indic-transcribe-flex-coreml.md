# BuilderHelm/indic-transcribe-flex-coreml

## Resumen

Indic-Transcribe Flex para Core ML es una conversión del modelo de reconocimiento automático del habla (ASR) Indic-Transcribe Flex, desarrollado por Bodhan AI en colaboración con AI4Bharat, a formato Core ML para su ejecución local en hardware de Apple. El paquete lo distribuye BuilderHelm y está pensado para transcripción en dispositivo (on-device) en macOS 15 o superior, sin necesidad de endpoint remoto ni conexión a servicios en la nube.

El modelo subyacente está especializado en lenguas de la India y en inglés indio, con cobertura de 27 códigos de idioma que incluyen hindi, bengalí, tamil, telugu, maratí, urdu, guyaratí, kannada, malayalam, panyabí, asamés, oriya, sánscrito y varias lenguas minoritarias como bhilí, haryanví, konkaní, maithili, bodo, dogri, cachemir, manipurí, santali y nepalí. El paquete Core ML ocupa 2,4 GB e incluye tres paquetes Core ML (frontend de audio en FP32, encoder en FP16 y decoder con estado en FP16), además del tokenizador y la licencia original.

La relevancia de esta ficha radica en que permite integrar un ASR multilingüe de la familia Indic en aplicaciones nativas de Apple con aceleración por GPU y Neural Engine, manteniendo la licencia Indic Open Model License del modelo original. No se trata de un modelo nuevo, sino de una reempaquetado para inferencia local en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR basado en el checkpoint Bodhan Indic-Transcribe Flex (upstream: NVIDIA Canary 1B v2); encoder-decoder con frontend de audio |
| Parametros totales | no disponible (heredados del modelo base Bodhan Indic-Transcribe Flex; el repo pesa 2,4 GB en FP16/FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; acepta hasta 30 segundos de audio de 16 kHz mono por petición |
| Tipos de cuantizacion | FP32 (frontend de audio), FP16 (encoder y decoder con estado) |
| Idiomas soportados | as, bgc, bhb, bho, bn, brx, doi, en, gu, hi, hne, kn, kok, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | indic-open-model-license (Indic Open Model License) |
| Formato de pesos | paquetes Core ML (.mlpackage / .mlmodelc), con tokenizador y manifest.json con checksums SHA-256 |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Bodhan Indic-Transcribe Flex, que a su vez se apoya en NVIDIA Canary 1B v2 (créditos bajo CC BY 4.0). Se trata de un sistema ASR encoder-decoder con un frontend de audio dedicado. En esta conversión Core ML, el frontend de audio se ejecuta en FP32 sobre CPU, mientras que el encoder y el decoder con estado se ejecutan en FP16 y pueden usar la GPU de Apple. El checkpoint de Bodhan utilizado está fijado al commit `ecba9bac9013c0340fe814b336897ee51ed80be9`.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si hubo fases de RLHF o DPO en el modelo base. La model card únicamente documenta el proceso de conversión, la política de detección de idioma y los detalles de empaquetado. La innovación técnica destacable en esta ficha es el propio pipeline de conversión a Core ML con un decoder con estado (stateful) en FP16 y un frontend de audio en FP32, que permite inferencia local en Apple Silicon con aceleración por GPU.

## Capacidades

- Reconocimiento automático del habla (ASR) para 27 códigos de idioma, con salida en escritura nativa por defecto.
- Soporte de inglés indio mediante el código `en`.
- Soporte de hindi en devanagari (`hi` con modo nativo) y de Hinglish romanizado (`hi` con modo romanizado).
- Modo mixto expuesto por el SDK de BuilderHelmAudio.
- Detección automática de idioma, que produce la salida en la escritura nativa del idioma detectado.
- Selección explícita de idioma para haryanví (`bgc`) y bhilí (`bhb`), que requieren activación manual en la política de detección de Bodhan.
- Procesamiento de audio de 16 kHz mono, con un máximo de 30 segundos por petición; las grabaciones largas deben dividirse en ventanas desde la aplicación anfitriona.
- Inferencia puramente local en macOS 15 o superior, con frontend en CPU y encoder/decoder acelerables por GPU.
- No incluye endpoint de inferencia alojado.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del propio ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en aplicaciones macOS: el modelo procesa ventanas de hasta 30 segundos y la app anfitriona puede segmentar grabaciones largas, manteniendo todo el audio en el dispositivo sin enviarlo a la nube.
- Subtitulado local de contenido en lenguas de la India: útil para creadores que publican vídeo en hindi, tamil, telugu, bengalí o maratí y necesitan subtítulos sin depender de servicios externos.
- Asistentes de voz para aplicaciones de productividad en Apple Silicon: al ejecutarse con Core ML y GPU, permite dictado en tiempo real en macOS 15 con latencia local y sin coste por petición.
- Herramientas de accesibilidad: transcripción en vivo de conversaciones para personas con dificultades auditivas en entornos donde no se permite enviar audio a servidores de terceros.
- Digitalización de archivos orales y entrevistas en lenguas minoritarias: cobertura de idiomas como bodo, dogri, cachemir, konkaní, maithili, manipurí, santali y sánscrito, poco habituales en ASR comerciales.
- Aplicaciones de atención al ciudadano o servicios públicos en India: transcripción de llamadas o audiencias en lengua local con procesamiento on-device para cumplir requisitos de privacidad.
- Investigación lingüística de campo: grabación y transcripción de muestras en lenguas con pocos recursos usando hardware Apple estándar, sin infraestructura de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una comprobación de paridad de conversión frente al runner de Bodhan fijado: la salida nativa coincidió en 26 de 27 clips de idioma, con una diferencia vocálica en sindhi, y tres clips de Hinglish romanizado coincidieron. ZenVoice reprodujo las 33 salidas Core ML registradas tras aplicar el preprocesado de audio de referencia. El propio autor advierte que estas comprobaciones son pequeñas y no estiman la tasa de error de palabras (WER) poblacional ni garantizan el rendimiento entre acentos, dominios o condiciones de grabación.

## Requisitos de hardware

- VRAM/unified memory estimada: no disponible de forma explícita; el repositorio ocupa 2,4 GB, por lo que se recomienda al menos 4 GB de memoria unificada libre para cargar los tres paquetes Core ML junto con el resto del sistema.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y posteriores) con macOS 15 o superior.
- GPU: la model card indica que Core ML puede usar la GPU para encoder y decoder; el frontend de audio se ejecuta en CPU.
- No está pensado para GPUs NVIDIA (A100, H100, RTX 4090) ni para CUDA; el formato es Core ML.
- Despliegue: SDK BuilderHelmAudio mediante `swift run bhaudio indic-transcribe`, con opciones `--language`, `--mode` (native/romanized) y `--cached`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Indic-Transcribe Flex Core ML (esta ficha) | no disponible (repo 2,4 GB) | 30 s por petición, 16 kHz mono | 27 códigos (Indic + en) | Indic Open Model License | Core ML (.mlpackage) |
| Bodhan Indic-Transcribe Flex (original) | no disponible | no disponible | 27 códigos (Indic + en) | Indic Open Model License | safetensors / framework original |
| NVIDIA Canary 1B v2 (upstream) | 1B | no disponible | múltiples (ver model card de NVIDIA) | CC BY 4.0 | NeMo / safetensors |
| Whisper (variantes) | 39M–1,55B | 30 s por ventana | ~99 idiomas | MIT (variantes OpenAI) | safetensors, GGUF, Core ML (comunidad) |

La comparación se limita a datos públicos de los modelos citados; no se dispone de cifras de WER comparativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo acepta audio de 16 kHz mono y un máximo de 30 segundos por petición; las grabaciones más largas requieren segmentación por parte de la aplicación anfitriona.
- Haryanví (`bgc`) y bhilí (`bhb`) exigen selección explícita de idioma; la detección automática no los cubre por defecto.
- La comprobación de paridad es muy reducida (27 clips nativos y 3 romanizados) y no constituye una estimación de WER; el rendimiento puede degradarse con acentos, dominios o condiciones de grabación distintas a las de referencia.
- El paquete está atado a macOS 15 o superior y a Apple Silicon; no es portable a Linux, Windows ni GPUs NVIDIA.
- La licencia Indic Open Model License no es una licencia permisiva estándar; es necesario revisar `LICENSE.md` antes de un uso comercial. El modelo upstream NVIDIA Canary 1B v2 se cita bajo CC BY 4.0, lo que puede imponer obligaciones de atribución adicionales.
- No se documentan sesgos específicos ni tasas de alucinación; en ASR, los errores típicos incluyen sustituciones de palabras, omisiones en audio con ruido y confusiones entre lenguas cercanas.
- El modelo no incluye endpoint de inferencia alojado; cualquier despliegue en producción requiere integrar el SDK BuilderHelmAudio o el runtime Core ML directamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/BuilderHelm/indic-transcribe-flex-coreml
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Upstream NVIDIA Canary 1B v2: https://huggingface.co/nvidia/canary-1b-v2
- SDK BuilderHelmAudio: https://github.com/BuilderHelm/BuilderHelmAudio
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia del modelo: LICENSE.md (incluido en el repositorio)
- Manifiesto con checksums: manifest.json (incluido en el repositorio)
