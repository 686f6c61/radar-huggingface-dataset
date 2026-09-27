# aoiandroid/nb-whisper-small-whisperkit-coreml-macos

## Resumen

`aoiandroid/nb-whisper-small-whisperkit-coreml-macos` es un espejo (mirror) de la conversión a Core ML para WhisperKit del modelo de reconocimiento automático del habla (ASR) `NbAiLab/nb-whisper-small`, desarrollado originalmente por la Biblioteca Nacional de Noruega (NbAiLab). El repositorio no aporta pesos nuevos ni reentrenamiento: redistribuye sin modificaciones los artefactos Core ML generados por el conversor `Barrymanalow/nb-whisper-coreml` junto con el tokenizador original, todo bajo licencia Apache 2.0.

El propósito de esta publicación es permitir la ejecución local y offline del sistema ASR noruego sobre hardware de Apple (macOS e iOS) a través de WhisperKit, un runtime que aprovecha Core ML y el Neural Engine de los chips Apple Silicon. El modelo base está especializado en noruego (variantes `no` y `nb`) y deriva de la arquitectura Whisper de OpenAI.

Por su naturaleza (espejo de una conversión de formato para un runtime concreto), su relevancia es práctica más que investigadora: sirve para desplegar transcripción en noruego en aplicaciones nativas Apple sin depender de servicios en la nube. No se han publicado datos de benchmarks ni métricas de rendimiento en la información disponible, y el repositorio registra cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper de OpenAI, heredada del modelo base NbAiLab/nb-whisper-small) |
| Parámetros totales | No disponible en la información proporcionada (el modelo base deriva de OpenAI Whisper small) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la arquitectura Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantización | No disponible; son artefactos Core ML de WhisperKit y no se detallan los niveles de cuantización aplicados |
| Idiomas soportados | Noruego (`no`) y noruego bokmål (`nb`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (WhisperKit); incluye `tokenizer.json` y `tokenizer_config.json` |
| Tamaño del repositorio | 0,5 GB |
| Modelo base | NbAiLab/nb-whisper-small |
| Pipeline | automatic-speech-recognition |
| Biblioteca | whisperkit |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una redistribución sin modificaciones de una conversión previa a Core ML. La arquitectura subyacente es la de OpenAI Whisper, un transformer encoder-decoder diseñado para ASR y traducción de voz, del que NbAiLab derivó su variante `nb-whisper-small` como ajuste especializado en noruego. Según la información pública del modelo base, la serie NB-Whisper se entrenó durante 250.000 pasos sobre un conjunto de datos diverso de aproximadamente 8 millones de muestras, partiendo del trabajo de OpenAI Whisper (que a su vez se entrenó sobre 680.000 horas de audio etiquetado).

La innovación técnica de esta publicación concreta no está en el modelo, sino en el formato: la conversión a Core ML permite ejecutar la inferencia en dispositivos Apple aprovechando el Neural Engine mediante WhisperKit, habilitando transcripción local, offline y con baja latencia, sin depender de servidores externos. No se documenta en la información disponible si hubo etapas de RLHF, DPO u otras técnicas de alineación, ni la composición detallada del dataset más allá de los datos citados.

## Capacidades

- Reconocimiento automático del habla (ASR) en noruego (`no`) y noruego bokmål (`nb`).
- Transcripción de audio a texto en modo local y offline sobre hardware Apple.
- Traducción de voz: la serie NB-Whisper de NbAiLab está descrita como orientada a ASR y traducción de voz, aunque esta conversión concreta se publica bajo el pipeline de ASR.
- Ejecución en dispositivos Apple mediante WhisperKit y Core ML (Neural Engine / CPU).
- No dispone de soporte de tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No incorpora capacidades de visión ni de audio más allá de la transcripción de voz.
- No dispone de modo de razonamiento (thinking mode).
- Cobertura multilingüe limitada a las variantes de noruego indicadas; no se documentan otros idiomas en esta ficha.

## Casos de uso

- Transcripción de audio en noruego en aplicaciones de escritorio para macOS: el modelo se integra mediante WhisperKit y ejecuta la inferencia en local, lo que evita enviar contenido sensible a servicios en la nube.
- Subtitulado automático de vídeo en noruego: se puede procesar la pista de audio y generar subtítulos para publicaciones o archivos audiovisuales sin coste por minuto de API.
- Dictado por voz en apps nativas Apple: al ser un formato Core ML orientado a macOS/iOS, permite incorporar entrada por voz en aplicaciones de productividad con procesamiento en el dispositivo.
- Digitalización y archivado de patrimonio oral: encaja con el origen del modelo (Biblioteca Nacional de Noruega) para transcribir grabaciones históricas o colecciones de audio en noruego.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo casi real de conversaciones o contenidos hablados en noruego sobre dispositivos Apple.
- Notas de reuniones y actas automáticas: transcripción de reuniones en noruego en local, aprovechando la ejecución offline para cumplir con requisitos de privacidad.
- Traducción asistida de voz noruego a otros idiomas: dado el enfoque de la serie NB-Whisper hacia la traducción de voz, puede emplearse como base para pipelines de traducción, siempre que se valide su comportamiento en esta conversión concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Naturaleza del formato: los pesos son artefactos Core ML para WhisperKit, por lo que el destino principal son dispositivos Apple con macOS o iOS.
- Hardware recomendado: chips Apple Silicon (familia M) con Neural Engine; también puede ejecutarse en CPU de Apple, con mayor latencia.
- VRAM estimada: no disponible en la información proporcionada; como referencia, el repositorio completo ocupa 0,5 GB, un tamaño compatible con dispositivos de gama alta y con muchos equipos de gama media.
- GPU no Apple: el formato Core ML no está pensado para GPUs NVIDIA o AMD; para ese hardware sería necesario usar los pesos originales de NbAiLab/nb-whisper-small en otro runtime.
- Opciones de despliegue: WhisperKit (runtime nativo para Core ML). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, orientados a otros formatos de pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| aoiandroid/nb-whisper-small-whisperkit-coreml-macos | No disponible (deriva de Whisper small) | No disponible (ventanas de 30 s) | Noruego (`no`, `nb`) | Core ML (WhisperKit) | Apache 2.0 | Espejo comunitario, 0 descargas |
| NbAiLab/nb-whisper-small | No disponible en la información | No disponible (ventanas de 30 s) | Noruego (`no`, `nb`) | Pesos originales (formato no detallado) | Apache 2.0 (según la información del espejo) | Modelo de referencia de la Biblioteca Nacional de Noruega |
| openai/whisper-small | No disponible en la información suministrada | No disponible (ventanas de 30 s) | Multilingüe (amplia cobertura) | Pesos originales PyTorch | Apache 2.0 | Ampliamente usado y documentado |
| openai/whisper-large-v3 | No disponible en la información suministrada | No disponible (ventanas de 30 s) | Multilingüe (amplia cobertura) | Pesos originales PyTorch | Apache 2.0 | Modelo de mayor tamaño de la familia Whisper |

Nota: no se dispone de datos de parámetros ni de benchmarks en la información proporcionada para completar una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Es un espejo comunitario no oficial: el autor (`aoiandroid`) redistribuye una conversión de terceros, no el modelo original de NbAiLab; conviene verificar la integridad de los artefactos antes de usarlos en producción.
- Cero descargas y cero valoraciones en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- Cobertura lingüística restringida a noruego (`no`, `nb`); no es adecuado para otros idiomas.
- Al ser un sistema ASR, existe riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla solapada, un comportamiento conocido en la familia Whisper.
- No se documentan métricas de precisión (WER, etc.) para esta conversión Core ML, por lo que el rendimiento real puede diferir del modelo base en PyTorch.
- Fecha de creación y actualización registradas en 2026 (según los metadatos de HuggingFace), un dato que puede resultar confuso y que conviene contrastar.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige mantener los avisos de copyright y atribución correspondientes a NbAiLab y al conversor original.
- El formato Core ML limita su uso a entornos Apple; no es portable a infraestructuras con GPU NVIDIA sin reconvertir los pesos.
- No apto para tareas de razonamiento, generación de código, tool calling ni agentes; su única función es la transcripción de voz.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aoiandroid/nb-whisper-small-whisperkit-coreml-macos
- Modelo base (NbAiLab): https://huggingface.co/NbAiLab/nb-whisper-small
- Conversión Core ML de origen (Barrymanalow): https://huggingface.co/Barrymanalow/nb-whisper-coreml
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Guía de tamaños de modelos Whisper: https://openwhispr.com/blog/whisper-model-sizes-explained
- Ejemplo de despliegue en Android con Whisper (referencia de ecosistema): https://github.com/vilassn/whisper_android
