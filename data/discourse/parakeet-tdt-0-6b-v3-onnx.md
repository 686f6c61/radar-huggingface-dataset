# Discourse/parakeet-tdt-0.6b-v3-onnx

## Resumen

El modelo `Discourse/parakeet-tdt-0.6b-v3-onnx` es un empaquetado en formato ONNX del sistema de reconocimiento automático de voz (ASR) `parakeet-tdt-0.6b-v3` desarrollado por NVIDIA. El modelo original es un transductor de 600 millones de parámetros basado en la arquitectura FastConformer-TDT, diseñado para transcripción de voz a texto multilingüe con alta productividad. Esta versión ONNX, publicada por Discourse, ofrece los pesos canónicos en tres precisiones (FP32, FP16 e INT8) y reconstruye el grafo `nemo128.onnx` a partir de los preprocesadores de `onnx-asr`, lo que facilita su despliegue en entornos de inferencia que usan ONNX Runtime, tanto en CPU como en GPU.

La relevancia de este modelo radica en que combina la calidad de un ASR de NVIDIA entrenado sobre 25 idiomas europeos con la portabilidad del formato ONNX, lo que permite ejecutarlo en infraestructura de consumo sin necesidad de una GPU dedicada. El repositorio de Discourse se presenta como un empaquetado canónico con procedencia documentada, pensado para desarrolladores que necesitan una versión estable y reproducible del modelo para integraciones en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT |
| Parametros totales | 600 millones (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 |
| Idiomas soportados | 25 idiomas europeos (detección automática) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (archivos .onnx, incluye `nemo128.onnx`) |

## Arquitectura y entrenamiento

El modelo base `parakeet-tdt-0.6b-v3` emplea la arquitectura FastConformer-TDT, una variante de los transductores de audio que combina un codificador FastConformer con un decodificador TDT (Token-and-Duration Transducer). Esta arquitectura está optimizada para inferencia de baja latencia y alto rendimiento, especialmente en tareas de transcripción en tiempo real. La versión v3 amplía el soporte de la v2, que era exclusivamente inglés, a 25 idiomas europeos, con detección automática del idioma de entrada.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación) no se detallan en la información disponible. La conversión a ONNX se realizó a partir de los pesos originales de PyTorch, y el repositorio incluye un script de reconstrucción del grafo de preprocesamiento para garantizar la coherencia con los pipelines de `onnx-asr`. Las cuantizaciones FP16 e INT8 se generaron a partir del modelo FP32, manteniendo la compatibilidad con los tiempos de ejecución estándar de ONNX Runtime.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con detección automática de idioma.
- Inferencia de alta velocidad en CPU mediante ONNX Runtime, con rendimiento comparable a `faster-whisper` en GPU según la documentación del wrapper FastAPI.
- Soporte de procesamiento en tiempo real y por lotes para integraciones en pipelines de audio.
- Compatible con las herramientas del ecosistema `onnx-asr`, incluyendo preprocesado y postprocesado estándar.
- Formatos de precisión múltiple (FP32, FP16, INT8) para adaptarse a distintos requisitos de memoria y velocidad.
- Empaquetado canónico con procedencia documentada (archivos `ATTRIBUTION.md` y `provenance/manifest.json`).

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar audio de conferencias en varios idiomas europeos, transcribiendo automáticamente con alta velocidad y sin necesidad de una GPU, lo que permite su ejecución en servidores CPU convencionales.
- Subtitulado automático de vídeos: se puede integrar en flujos de trabajo de postproducción para generar subtítulos en múltiples idiomas, aprovechando la detección automática del idioma y la salida en formato texto.
- Asistentes de voz y comandos dictados: al ejecutarse en tiempo real, sirve para aplicaciones de dictado o asistentes que requieren baja latencia, especialmente en entornos sin aceleración por GPU.
- Servicios de transcripción para atención al cliente: puede desplegarse tras una API FastAPI (como el wrapper existente) para transcribir llamadas o mensajes de voz en varios idiomas europeos, integrando la salida en sistemas de análisis de sentimiento o búsqueda.
- Sistemas de accesibilidad: transcripción de contenido hablado para personas con discapacidad auditiva en aplicaciones web o móviles, con la ventaja de poder ejecutarse en hardware modesto.
- Investigación en lingüística y procesamiento de voz: al ser un modelo de código abierto con pesos ONNX, se puede usar como referencia para comparaciones de rendimiento o para experimentos con cuantizaciones y optimizaciones de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está optimizado para ejecutarse en CPU con ONNX Runtime. El wrapper FastAPI reporta velocidades en tiempo real superiores a las de `openai/whisper` y comparables a `faster-whisper` en GPU, aunque no se especifican cifras exactas.
- VRAM estimada: no disponible, pero al ser un modelo de 0,6B parámetros, la versión FP16 en GPU requeriría aproximadamente 1,2 GB de VRAM (600M × 2 bytes). La versión INT8 ocuparía unos 600 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) para FP16; para FP32 se necesitarían unos 2,4 GB.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), integrable con FastAPI, Flask o directamente en aplicaciones de servidor. También compatible con `onnx-asr` para uso en proyectos de reconocimiento de voz.
- Latencia y throughput: no disponible de forma cuantificada, pero la documentación del wrapper indica que alcanza velocidades en tiempo real en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3 (ONNX) | 600M | no disponible | 25 europeos | CC-BY-4.0 | ONNX |
| openai/whisper (variante base) | 74M–1.5B | 30 s de audio | 99 idiomas | MIT | PyTorch/ONNX |
| faster-whisper (variante large-v3) | 1.5B | 30 s de audio | 99 idiomas | MIT | CTranslate2 |

La comparativa directa con Whisper es compleja porque Whisper es un modelo de secuencia a secuencia que procesa ventanas de 30 segundos, mientras que Parakeet TDT está diseñado para transcripción en streaming y con menor latencia. La ventaja de Parakeet TDT es su optimización para CPU y su soporte de 25 idiomas europeos, mientras que Whisper cubre muchos más idiomas pero con mayor coste computacional. La licencia CC-BY-4.0 permite uso comercial con atribución, mientras que Whisper usa la licencia MIT (código) y los pesos con licencia Apache 2.0.

## Limitaciones y advertencias

- El modelo solo soporta 25 idiomas europeos; no cubre otros idiomas como chino, árabe o japonés.
- La licencia CC-BY-4.0 exige atribución al autor original en cualquier redistribución o uso público.
- No se han publicado detalles sobre el conjunto de entrenamiento, por lo que pueden existir sesgos en la transcripción de acentos o dialectos regionales dentro de los idiomas soportados.
- Al ser una conversión ONNX, la calidad de la transcripción puede variar respecto a la versión original de PyTorch si el proceso de conversión no se ha validado exhaustivamente; el repositorio incluye un script de reconstrucción del preprocesado para mitigar este riesgo.
- La longitud de contexto no está documentada; se recomienda probar con fragmentos de audio de duración variable para verificar el comportamiento en casos de uso con audios largos.
- El modelo está orientado a voz hablada; el rendimiento con música o ruido de fondo puede degradarse significativamente.

## Enlaces

- Repositorio HuggingFace: [Discourse/parakeet-tdt-0.6b-v3-onnx](https://huggingface.co/Discourse/parakeet-tdt-0.6b-v3-onnx)
- Modelo original de NVIDIA: [nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- Wrapper FastAPI (GitHub): [groxaxo/parakeet-tdt-0.6b-v3-fastapi-openai](https://github.com/groxaxo/parakeet-tdt-0.6b-v3-fastapi-openai)
- Otra conversión ONNX: [s0me-0ne/parakeet-tdt-0.6b-v3-onnx](https://huggingface.co/s0me-0ne/parakeet-tdt-0.6b-v3-onnx)
- Repositorio con INT8: [yitaverse/parakeet-tdt-0.6b-v3](https://github.com/yitaverse/parakeet-tdt-0.6b-v3)
- Referencia de `onnx-asr`: [onnx-asr](https://github.com/onnx-asr/onnx-asr)
