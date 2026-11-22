# desert-ant-labs/uhm

## Resumen

Uhm es un modelo de clasificación de audio especializado en la detección de muletillas y disfluencias del habla ("uh", "um", "hmm") con precisión de frame, hasta 20 ms. Lo desarrolla Desert Ant Labs y se distribuye a través de Hugging Face con una licencia propia de código disponible (*source available*). No es un modelo de lenguaje generativo: es un detector acústico que identifica segmentos de relleno en audio sin necesidad de transcripción previa.

El modelo se ha entrenado en inglés y aplica transferencia acústica a español, francés, alemán y neerlandés, lo que lo hace útil para pipelines de edición de audio y vídeo multilingües. Su propuesta diferencial es la ejecución totalmente *on-device*: se distribuye en formatos Core ML (fp16, 45 MB), LiteRT/TFLite (int8 weight-only, 24 MB), ONNX y Core AI, con SDKs nativos para Swift, Kotlin y JavaScript (navegador y Node).

La relevancia actual del modelo radica en su enfoque práctico: elimina la dependencia de la nube para una tarea de post-proceso de audio muy común en podcasting, entrevistas y generación de contenido, ofreciendo latencias bajas y un tamaño reducido que permite ejecutarlo en dispositivos móviles y navegadores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de clasificación de audio; se distribuye en Core ML, LiteRT/TFLite, ONNX y Core AI) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio; resolución temporal de 20 ms por frame) |
| Tipos de cuantización | fp16 (Core ML, Core AI), int8 weight-only (LiteRT/TFLite), ONNX (precisión no especificada), fp16 para build web |
| Idiomas soportados | Alemán, inglés, español, francés, neerlandés |
| Licencia | desert-ant-labs-source-available (código disponible, no open source) |
| Formato de pesos | Core ML (`uhm.mlmodelc`), Core AI (`uhm.aimodel`), LiteRT (`uhm.tflite`), ONNX (`uhm.onnx`), build web fp16 |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo (tipo de red, número de capas, mecanismo de atención, etc.). Lo que sí se especifica es su comportamiento: opera sobre audio decodificado a 16 kHz mono y produce detecciones a nivel de frame con granularidad de 20 ms, etiquetando cada muletilla con un tipo (`.uh`, `.um`, `.hmm`, `.and`, `.other`) mediante un etiquetador que en Apple platforms se apoya en el framework SoundAnalysis.

El entrenamiento se realizó en inglés y el modelo generaliza a español, francés, alemán y neerlandés mediante transferencia acústica, según indica la model card. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste fino supervisado o preferencias. Tampoco se documenta ninguna innovación arquitectónica más allá de la optimización para inferencia en dispositivo (cuantización int8, compilación Core ML, ejecución WASM en navegador).

## Capacidades

- Detección de muletillas y disfluencias ("uh", "um", "hmm") con precisión temporal de hasta 20 ms.
- Funcionamiento sin transcripción: analiza directamente la señal de audio.
- Etiquetado del tipo de muletilla (solo en plataformas Apple mediante SoundAnalysis).
- Control del equilibrio entre precisión y exhaustividad mediante presets (`precision` 0.75, `balanced` 0.65, `recall` 0.50).
- Filtrado por duración mínima del segmento (0,12 s por defecto, configurable hasta 0,08 s).
- Reconciliación con transcripciones: ajusta palabras del transcript para eliminar muletillas sin cortar palabras reales (elimina, recorta o divide palabras según corresponda).
- Soporte multilingüe acústico: inglés (entrenamiento) con transferencia a español, francés, alemán y neerlandés.
- Ejecución on-device en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Progreso de análisis y cancelación de tareas en Swift.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un clasificador de audio, no un LLM.

## Casos de uso

- **Edición automática de podcasting y entrevistas**: el modelo detecta cada "uh" y "um" con precisión de 20 ms y permite cortar los segmentos automáticamente usando el preset `precision`, reduciendo el tiempo de post-producción sin revisión manual frame a frame.
- **Limpieza de audio en pipelines de vídeo para redes sociales**: integrado vía SDK de JavaScript en el navegador (WASM + LiteRT.js), permite procesar clips antes de subirlos, eliminando muletillas en el propio cliente sin enviar audio a servidores.
- **Transcripción sincronizada con limpieza**: combinando el modelo con una transcripción existente, la función de reconciliación de palabras ajusta los timestamps para que el subtítulo final no incluya las muletillas pero mantenga las palabras reales intactas.
- **Herramientas de accesibilidad y análisis del habla**: análisis de fluidez verbal en grabaciones de entrevistas, sesiones clínicas o evaluaciones de oratoria, cuantificando la densidad de disfluencias por minuto.
- **Aplicaciones móviles de grabación de voz**: integración nativa en iOS (Core ML/Core AI) y Android (LiteRT) para ofrecer limpieza de audio en tiempo de grabación o post-grabación sin conexión a internet.
- **Sistemas de dubbing y localización**: detección de rellenos en el audio original en inglés, español, francés, alemán o neerlandés para alinear y limpiar pistas antes de la síntesis de voz o el doblaje.
- **Investigación en lingüística computacional**: extracción de métricas objetivas de disfluencia (número, duración y tipo de muletillas) sobre corpus de audio multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la versión LiteRT int8 coincide con la versión ONNX en un 99,7-100 % de coincidencia por frame en el argmax, lo que es una métrica de consistencia entre formatos, no de calidad absoluta.

## Requisitos de hardware

- **VRAM estimada**: no aplica en el sentido tradicional; el modelo es de 24 MB (int8 LiteRT) o 45 MB (fp16 Core ML/Core AI), por lo que cabe holgadamente en cualquier dispositivo moderno.
- **GPU recomendadas**: no requiere GPU dedicada; está optimizado para CPU, NPU y aceleradores integrados (Core ML en Apple Silicon, LiteRT en Android, WASM en navegador).
- **Compatibilidad con GPU de consumo**: sí, en cualquier GPU de consumo moderna, aunque el modelo está pensado para ejecución en dispositivo (móvil, portátil, navegador).
- **Opciones de despliegue**: SDKs oficiales Swift (iOS/macOS/tvOS/visionOS), Kotlin (Android), JavaScript (navegador con LiteRT.js y Node con core nativo precompilado). También se puede usar el archivo ONNX directamente con runtimes compatibles.
- **Latencia y throughput**: no se publican cifras concretas. El SDK expone `phaseTimings.inferenceSec` para medir el tiempo de inferencia real por archivo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen detectores de disfluencias basados en ASR con post-procesado, pero no se aportan datos de rendimiento ni especificaciones que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Uhm (Desert Ant Labs) | No disponible | No aplica (audio, frames de 20 ms) | Source available | Hugging Face, SDKs oficiales |
| Alternativas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `desert-ant-labs-source-available` no es open source; es necesario revisar los términos en https://license.desertant.com/ antes de un uso comercial.
- **Idiomas**: el entrenamiento es en inglés y la transferencia a español, francés, alemán y neerlandés es acústica, no supervisada directamente; el rendimiento en estos idiomas puede ser inferior y no se publican métricas por idioma.
- **Dependencia de plataforma para el etiquetado de tipo**: la clasificación del tipo de muletilla (`.uh`, `.um`, `.hmm`) solo funciona en plataformas Apple (SoundAnalysis); en Kotlin y JavaScript el campo `type` es `null`.
- **Riesgo de falsos positivos**: sonidos como "and" o vocalizaciones similares pueden clasificarse como relleno; el preset `recall` aumenta este riesgo. Se recomienda `precision` para corte automático.
- **Sin transcripción contextual**: al no usar ASR, el modelo no distingue matices semánticos; puede marcar pausas o sonidos no verbales como muletillas.
- **Sin datos de sesgo publicados**: no se documentan sesgos por acento, edad, género o calidad de grabación.
- **Formato de audio**: requiere decodificación a 16 kHz mono; en plataformas no Apple el usuario debe proporcionar las muestras PCM.
- **Sin benchmarks públicos**: no hay métricas de precisión, recall o F1 publicadas, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/uhm
- Pesos v1.2.0: https://huggingface.co/desert-ant-labs/uhm/tree/v1.2.0
- Demo en navegador (Hugging Face Spaces): https://huggingface.co/spaces/desert-ant-labs/uhm-demo
- Demo oficial: https://desertant.com/models/uhm/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación del SDK (requisitos Swift): https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Documentación del SDK (Android): https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Documentación del SDK (JavaScript/TypeScript): https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descargas y caché del modelo: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Licencia: https://license.desertant.com/
