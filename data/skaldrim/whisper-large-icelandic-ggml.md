# skaldrim/whisper-large-icelandic-ggml

## Resumen

`skaldrim/whisper-large-icelandic-ggml` es una conversión al formato GGML de whisper.cpp del modelo de reconocimiento automático del habla `language-and-voice-lab/whisper-large-icelandic-62640-steps-967h`, desarrollado por el Language and Voice Lab de la Universidad de Reikiavik (Carlos Daniel Hernández Mena) en el marco del Programa de Tecnología Lingüística para el islandés 2019-2023 (Almannarómur). El modelo original es un fine-tuning de `openai/whisper-large` sobre 967 horas de audio en islandés.

El repositorio no introduce ningún cambio en los pesos ni en el entrenamiento: únicamente convierte los pesos a GGML de 16 bits mediante `models/convert-h5-to-ggml.py` y genera además una variante cuantizada a q5_0 con `whisper-quantize`, pensada para ejecución en dispositivos móviles dentro de la aplicación Skaldrim (subtitulado en el propio teléfono o PC del usuario). Es relevante porque permite desplegar un modelo Whisper large especializado en islandés en hardware sin GPU y en entornos de inferencia local.

La arquitectura subyacente es la de Whisper large: un transformer encoder-decoder de tipo seq2seq para ASR y traducción de voz, con aproximadamente 1550 millones de parámetros. El modelo está orientado exclusivamente al islandés (`is`), lo que lo hace útil para un nicho lingüístico con poca cobertura en los modelos ASR multilingües generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large), ASR seq2seq |
| Parametros totales | ~1550 millones (heredados de openai/whisper-large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no se detalla en la información) |
| Tipos de cuantizacion | GGML de 16 bits y q5_0 |
| Idiomas soportados | islandés (`is`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGML (`ggml-is-whisper-large-v1-icelandic.bin`, `ggml-is-whisper-large-v1-icelandic-q5_0.bin`) |

Detalle de ficheros:

| Fichero | Tamano | SHA-256 |
|---|---|---|
| `ggml-is-whisper-large-v1-icelandic.bin` | 3.094.623.708 bytes | `5aa7727e138de668a70f29631254a4f5bf731ac40e46530f77c0d9f2c746deb9` |
| `ggml-is-whisper-large-v1-icelandic-q5_0.bin` | 1.080.732.108 bytes | `733452d416641e1bb18320325958a10129aeec177f1885e933ffe01bb1de0d55` |

## Arquitectura y entrenamiento

La arquitectura es la de OpenAI Whisper large, un transformer encoder-decoder entrenado originalmente para transcripción y traducción de voz. El fine-tuning lo realizó el Language and Voice Lab sobre 967 horas de audio en islandés durante 62.640 pasos, partiendo de `openai/whisper-large`. No se detalla en la información disponible la composición exacta del corpus, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del propio fine-tuning supervisado.

La contribución de este repositorio es puramente de formato: conversión de los pesos a GGML de 16 bits con el script oficial de whisper.cpp y cuantización posterior a q5_0 para reducir el tamaño a ~1,08 GB y permitir inferencia en teléfonos. No hay reentrenamiento ni modificación de los pesos más allá de la cuantización.

## Capacidades

- Reconocimiento automático del habla (ASR) en islandés.
- Transcripción de audio con marcas de tiempo propias del pipeline de Whisper.
- Ejecución local en CPU mediante whisper.cpp, sin dependencia de servicios en la nube.
- Inferencia en dispositivos móviles gracias a la variante q5_0 (~1,08 GB).
- Selección de idioma explícita mediante el token `is`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio adicional ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado en directo en dispositivos móviles: la variante q5_0 (~1,08 GB) permite generar subtítulos en islandés en el propio teléfono dentro de la app Skaldrim, sin enviar audio a servidores externos.
- Transcripción de reuniones y entrevistas en islandés: la variante de 16 bits ofrece mayor fidelidad en un PC, adecuada para actas y documentación interna.
- Accesibilidad para contenido audiovisual islandés: generación de subtítulos para vídeos, pódcast y material educativo donde no existe pista de subtítulos previa.
- Archivística y preservación oral: transcripción de grabaciones históricas o entrevistas en islandés para su indexación y búsqueda textual.
- Investigación lingüística: generación de corpus transcritos en islandés para estudios fonéticos, léxicos o de variación dialectal.
- Herramientas de dictado y notas de voz: integración en aplicaciones de productividad que requieran entrada por voz en islandés sin conexión.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse con whisper.cpp en local, el audio no abandona el dispositivo, lo que facilita el cumplimiento de normativas de protección de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: la variante de 16 bits ocupa ~3,09 GB en disco y requiere del orden de 3-4 GB de memoria en ejecución; la variante q5_0 ocupa ~1,08 GB y puede ejecutarse con aproximadamente 1,5-2 GB de memoria.
- GPU recomendadas: no se especifican en la información; whisper.cpp prioriza ejecución en CPU. Cualquier GPU con soporte CUDA/Metal puede acelerar la inferencia, pero no hay datos publicados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM para la variante de 16 bits, y en dispositivos móviles para la q5_0.
- Opciones de despliegue: whisper.cpp (formato nativo GGML); no se indica compatibilidad con vLLM, TGI, Ollama u otros motores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| skaldrim/whisper-large-icelandic-ggml | ~1550 M | ventana Whisper (30 s) | islandés | cc-by-4.0 | GGML (16 bits, q5_0) |
| language-and-voice-lab/whisper-large-icelandic-62640-steps-967h | ~1550 M | ventana Whisper (30 s) | islandés | no disponible en la información | safetensors/HF |
| language-and-voice-lab/whisper-large-icelandic-30k-steps-1000h | ~1550 M | ventana Whisper (30 s) | islandés | no disponible en la información | safetensors/HF |
| openai/whisper-large | ~1550 M | ventana Whisper (30 s) | multilingüe | MIT (modelo original) | safetensors, GGML |

Las dos variantes del Language and Voice Lab se diferencian en horas de entrenamiento (967 h frente a ~1000 h) y pasos (62.640 frente a 30.000). Los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en islandés; no debe esperarse un rendimiento correcto en otros idiomas.
- La cuantización q5_0 introduce una pérdida de precisión respecto a los pesos de 16 bits; conviene validar la calidad en el dominio concreto antes de usarla en producción.
- Al derivar de Whisper large, hereda los sesgos del corpus original de OpenAI y del corpus islandés de fine-tuning, cuya composición no se detalla.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla solapada, comportamiento conocido en la familia Whisper.
- El repositorio solo cambia el formato; cualquier error de conversión es responsabilidad del autor de la conversión, no del modelo original.
- Licencia cc-by-4.0: permite uso comercial con atribución; es necesario citar a los autores originales y conservar el aviso de licencia.
- No se documentan limitaciones específicas de contexto ni de duración de audio más allá de la ventana nativa de Whisper.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/skaldrim/whisper-large-icelandic-ggml
- Modelo base: https://huggingface.co/language-and-voice-lab/whisper-large-icelandic-62640-steps-967h
- Variante relacionada (30k pasos, ~1000 h): https://huggingface.co/language-and-voice-lab/whisper-large-icelandic-30k-steps-1000h
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- OpenAI Whisper: https://github.com/openai/whisper
