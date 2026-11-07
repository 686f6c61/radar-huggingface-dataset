# johnpattern/safenotes-moss-hq

## Resumen

safenotes-moss-hq es una conversión de formato del modelo MOSS-Transcribe-Diarize 0.9B de OpenMOSS / MOSI.AI, publicada por johnpattern (Safenotes) para su ejecución sobre hardware Intel mediante OpenVINO. El modelo original realiza transcripción de audio con identificación de turnos de hablante (speaker diarization), y esta versión lo empaqueta como OpenVINO IR: encoder de audio en fp16, modelo de lenguaje con pesos int8 (cuantizado con NNCF), tabla de embeddings en fp16 y tokenizadores convertidos a IR.

La relevancia de esta ficha no está en un nuevo entrenamiento, sino en el formato: permite ejecutar un modelo de reconocimiento de voz con diarización de forma local en CPU/GPU Intel sin necesidad de PyTorch, lo que facilita el despliegue en aplicaciones de escritorio. Safenotes lo utiliza para generar la transcripción "HQ" con hablantes tras una reunión, procesando el audio en fragmentos de 120 o 60 segundos completamente en el equipo del usuario.

No es un lanzamiento oficial de los autores originales y no ha sido validado por ellos. No se dispone de información sobre idiomas soportados, benchmarks ni detalles del entrenamiento original en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio + modelo de lenguaje (transcripción con diarización); conversión a OpenVINO IR |
| Parametros totales | 0.9B (según model card del autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Encoder fp16; LM int8 (NNCF); embeddings fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml/.bin), .npy para embeddings y filtros mel |

## Arquitectura y entrenamiento

El modelo base, MOSS-Transcribe-Diarize, combina un encoder de audio con un modelo de lenguaje para producir transcripciones con turnos de hablante. Esta conversión no implica reentrenamiento: se transforman los pesos PyTorch originales a OpenVINO IR, con el encoder en fp16, el LM en int8 mediante NNCF, la tabla de embeddings guardada como `embed_tokens_fp16.npy` y el tokenizador convertido a IR de tokenización/detokenización. También se incluye el filtro mel de 80 bins estilo Whisper (`whisper_mel80_filters.npy`).

El layout del prompt y el parseo de la salida se reimplementan en la aplicación Safenotes, no en este repositorio. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo original.

## Capacidades

- Reconocimiento automático de voz (ASR) con transcripción de audio.
- Diarización de hablantes: identificación de turnos de hablante en la transcripción.
- Procesamiento por fragmentos de audio de 120 s o 60 s.
- Ejecución local sobre hardware Intel mediante OpenVINO (CPU/GPU).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Actas de reuniones locales: Safenotes usa el modelo para generar la transcripción "HQ" con hablantes después de la reunión, procesando el audio en fragmentos de 120 s o 60 s sin que el audio salga del PC.
- Notetaking de escritorio en equipos Intel: al estar en OpenVINO IR, se ejecuta en CPU/GPU Intel sin stack PyTorch, reduciendo dependencias en aplicaciones de escritorio.
- Transcripción con atribución de hablante en entrevistas: la diarización permite separar interlocutores en grabaciones de dos o más personas.
- Procesamiento por lotes de grabaciones largas: la división en fragmentos de 60/120 s permite encadenar transcripciones de audio extenso.
- Aplicaciones de privacidad estricta: todo el procesamiento ocurre en el equipo del usuario, sin envío de audio ni texto a servidores.
- Integración en pipelines de verificación de integridad: el repositorio publica sha256 por archivo, lo que permite comprobar la integridad de los pesos antes de usarlos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 1.5 GB; el encoder fp16 (~625 MB) y el LM int8 (~598 MB) sugieren un consumo de memoria del orden de 1.5-2 GB en inferencia, aunque no se proporcionan cifras oficiales.
- Hardware objetivo: Intel (OpenVINO), típicamente CPU con instrucciones modernas o GPU Intel integrada/discreta.
- Compatibilidad con GPU consumer: no se documenta; al ser OpenVINO, la ruta natural es CPU Intel o GPU Intel, no NVIDIA.
- Despliegue: OpenVINO Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Diarizacion | Licencia | Formato |
|---|---|---|---|---|---|
| safenotes-moss-hq (este) | 0.9B | no disponible | Sí | Apache-2.0 | OpenVINO IR |
| OpenMOSS-Team/MOSS-Transcribe-Diarize | 0.9B | no disponible | Sí | Apache-2.0 | PyTorch |
| Whisper (variantes) | no disponible | no disponible | No nativa | MIT/Apache-2.0 | PyTorch/GGUF/ONNX |
| pyannote (diarización) | no disponible | no disponible | Sí | no disponible | PyTorch |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial: los autores originales no lo respaldan ni lo han validado.
- Sin garantías: se distribuye "as is", sin garantía de precisión de la salida.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad ASR o de diarización.
- Dependencia de OpenVINO: no es portable directamente a otros runtimes sin reconversión.
- El layout del prompt y el parseo de salida viven en la aplicación Safenotes, no en este repositorio, lo que limita su reutilización directa.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento original (no documentado).
- Uso comercial permitido por Apache-2.0, pero conviene revisar la licencia del modelo base y las condiciones de atribución.

## Enlaces

- Hugging Face: https://huggingface.co/johnpattern/safenotes-moss-hq
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Revisión del modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize/tree/704aa4a9c304e8520be88901e0d1960158ef5b15
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
