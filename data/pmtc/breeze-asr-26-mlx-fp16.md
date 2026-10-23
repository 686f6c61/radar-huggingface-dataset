# PMTC/Breeze-ASR-26-mlx-fp16

## Resumen

Breeze-ASR-26-mlx-fp16 es una conversión a formato MLX en precisión fp16 del modelo MediaTek-Research/Breeze-ASR-26, un ajuste fino de Whisper-large-v2 especializado en hokkien taiwanés (台語 / taigi). La conversión la publica el usuario PMTC y no altera los pesos más allá del casting a float16: únicamente renombra las claves al esquema de `mlx-community/whisper-*`, elimina las posiciones sinusoidales del encoder y genera un `tokenizer.json` a partir del `vocab.json` y `merges.txt` originales, que el repositorio upstream no incluye.

El modelo resuelve un problema muy concreto: la transcripción automática de una lengua de bajos recursos y escasa cobertura comercial como el taigi, con salida escrita en caracteres mandarineses en lugar de ortografía taigi. Al estar empaquetado para MLX, el destino principal es la inferencia en dispositivo (iPhone, iPad, Mac con Apple Silicon) dentro de la aplicación SettleVoice mediante `mlx-audio-swift`, sin depender de servidores externos.

Su relevancia es doble: por un lado, acerca ASR de calidad Whisper-large a un segmento lingüístico que apenas tiene modelos públicos; por otro, demuestra un patrón de conversión reproducible (script incluido en el repositorio SettleVoice) que permite portar ajustes finos de Whisper al ecosistema MLX. El repositorio es de 2026, cuenta con 0 descargas y 0 likes en el momento de la consulta, y no publica benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-large-v2 (transformer encoder-decoder con atención completa; encoder sobre espectrograma mel) |
| Parametros totales | 1.541.384.960 (~1,54 mil millones, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | ventana de audio fija de 30 s por segmento (1.500 posiciones de encoder) y 448 posiciones de decoder, heredadas de Whisper-large-v2 |
| Tipos de cuantizacion | solo fp16 en este repositorio; no se publican variantes de 8 o 4 bits |
| Idiomas soportados | hokkien taiwanés (`nan`) y chino (`zh`); salida en caracteres mandarineses |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), claves `mlx_whisper`, conv en `[out, kernel, in]` |
| Modelo base | MediaTek-Research/Breeze-ASR-26 |
| Libreria / runtime | MLX (Apple Silicon) |
| Vocabulario | heredado de Whisper-large-v2 (51.865 tokens); `tokenizer.json` generado en la conversion |
| Tamano del repositorio | 3,1 GB |
| Pipeline | automatic-speech-recognition |
| Fecha de publicacion | 2026-10-23 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-large-v2: un transformer encoder-decoder con 32 capas de encoder y 32 de decoder, atencion multi-cabeza completa y normalizacion previa. La entrada es un espectrograma log-mel de 80 canales calculado sobre ventanas de 30 segundos; el decoder genera tokens de texto de forma autorregresiva con un presupuesto de 448 posiciones. El ajuste fino llevado a cabo por MediaTek Research adapta este backbone al hokkien taiwanés, manteniendo el esquema general de Whisper y la cabeza de idioma del tokenizer original.

Sobre el proceso de entrenamiento no hay información en la documentación disponible: se desconoce el volumen de horas de audio, la composición del corpus, si hubo aumento de datos o si se aplicaron etapas de ajuste con RLHF/DPO (poco habituales en ASR). La conversión publicada aquí no es un reentrenamiento: se limita al casting a float16, al renombrado de claves al esquema MLX, a la eliminación de las posiciones sinusoidales del encoder (recalculadas o no necesarias en la implementación MLX) y a la construcción del tokenizer a partir de los ficheros `vocab.json` y `merges.txt` upstream. No hay innovaciones técnicas propias del conversor más allá de la portabilidad del formato.

## Capacidades

- Reconocimiento automático del habla (ASR) en hokkien taiwanés con salida en caracteres mandarineses.
- Transcripción de audio en mandarín dentro del mismo modelo, según los idiomas declarados (`nan`, `zh`).
- Procesamiento de segmentos de audio de hasta 30 segundos por pasada, con troceado externo para audios más largos.
- Ejecución en dispositivo sobre Apple Silicon mediante MLX, sin llamadas a servicios externos.
- Integración directa con `mlx-audio-swift` (caso de uso declarado: app SettleVoice) y con el ecosistema `mlx-whisper`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio generation ni modo "thinking": es un modelo puramente acústico-a-texto.

## Casos de uso

- Transcripción de archivo audiovisual en taigi: el modelo convierte entrevistas, documentales o programas de televisión en texto mandarín, adecuado para subtitulado posterior, troceando el audio en ventanas de 30 s con solapamiento para no perder continuidad en los cortes.
- Aplicaciones móviles de dictado y notas de voz en iOS/macOS: al estar en formato MLX fp16 y ocupar unos 3 GB, puede ejecutarse en el dispositivo dentro de una app Swift vía `mlx-audio-swift`, manteniendo el audio del usuario sin salir del teléfono.
- Digitalización de patrimonio oral: archivos sonoros de taigi en bibliotecas y universidades pueden transcribirse en lote para construir índices buscables, con la ventaja de que la licencia Apache 2.0 permite uso institucional y comercial sin restricciones adicionales.
- Investigación lingüística y sociolingüística: permite obtener alineaciones texto-audio de forma masiva para estudiar variación dialectal, aunque la salida en caracteres mandarineses exige una capa de normalización a ortografía taigi antes de cualquier análisis fonológico.
- Atención al cliente en Taiwán: un centro de contacto con población mayor que habla taigi puede transcribir llamadas para control de calidad y búsqueda posterior, siempre que se combine con un traductor o un LLM aparte, ya que este modelo no genera respuestas.
- Preprocesado de corpus para entrenamiento: sirve para pseudoetiquetar horas de audio taigi y alimentar después un modelo mayor o un ajuste adicional, un flujo habitual cuando no existe transcripción humana disponible.
- Accesibilidad: generación de subtítulos para vídeo bajo demanda dirigido a hablantes de taigi, con revisión humana por el riesgo de alucinación en pasajes musicales o con ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio de conversión ni la model card proporcionan cifras de WER, CER ni comparaciones con otros sistemas, y tampoco se especifican métricas de latencia o throughput en Apple Silicon.

## Requisitos de hardware

- Pesos en fp16: 1.541.384.960 parámetros × 2 bytes ≈ 3,08 GB; el repositorio completo ocupa 3,1 GB.
- Memoria estimada para inferencia: en torno a 3,5-4 GB de memoria unificada, sumando pesos, activaciones del encoder sobre 1.500 posiciones y el estado del decoder (estimación a partir del tamaño de pesos, no medida publicada).
- GPU compatibles: exclusivamente Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra) a través de MLX. No hay soporte CUDA en este repositorio; para NVIDIA habría que usar el modelo base en PyTorch.
- Cabe en hardware de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada, y en iPhone/iPad recientes con margen suficiente para un modelo de ~3 GB.
- Opciones de despliegue: `mlx-whisper`, `mlx-audio` y `mlx-audio-swift` (SettleVoice). No es compatible con vLLM, TGI, llama.cpp, whisper.cpp ni Ollama sin una conversión adicional a otro formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato / runtime | Benchmarks publicados |
|---|---|---|---|---|---|---|
| PMTC/Breeze-ASR-26-mlx-fp16 | 1,54 B | 30 s por segmento | nan, zh | Apache 2.0 | safetensors MLX (fp16) | no disponible |
| MediaTek-Research/Breeze-ASR-26 (upstream) | 1,54 B | 30 s por segmento | nan, zh | Apache 2.0 | safetensors PyTorch | no disponible |
| openai/whisper-large-v2 | ~1,55 B | 30 s por segmento | multilingue (~99 idiomas) | MIT | safetensors, GGUF vía terceros | sí, WER publicados en la model card original |
| openai/whisper-large-v3 | ~1,55 B | 30 s por segmento | multilingue (~99 idiomas) | MIT | safetensors, GGUF vía terceros | sí, WER publicados en la model card original |

Frente a Whisper-large-v2 genérico, este modelo sacrifica cobertura multilingüe a cambio de especialización en taigi; frente a whisper-large-v3, parte de una generación anterior del backbone, lo que en principio limita su calidad en idiomas distintos del objetivo. La ventaja diferencial es el empaquetado MLX listo para dispositivo y la licencia Apache 2.0, más permisiva que la MIT en cuanto a cláusulas de patentes.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no responde preguntas, no razona, no hace tool calling ni genera código; solo transcribe audio.
- La salida se escribe en caracteres mandarineses y no en ortografía taigi, lo que impide usarla directamente en aplicaciones de escritura en taigi sin una capa de conversión.
- Solo declara dos idiomas (`nan`, `zh`); el comportamiento con inglés, japonés u otras lenguas presentes en el Whisper original no está documentado y puede degradarse o producir transliteraciones erróneas.
- Ventana fija de 30 segundos: audios largos requieren troceado externo con solapamiento, y los cortes mal gestionados generan duplicaciones o pérdidas de palabras.
- Riesgo de alucinación típico de la familia Whisper: en silencios, música o ruido el decoder puede emitir frases completas no pronunciadas, incluidas repeticiones en bucle.
- Sesgos desconocidos: no se documenta la composición del corpus de entrenamiento (género, edad, variedad dialectal de taigi), por lo que se desconoce su comportamiento con acentos o registros poco representados.
- El `tokenizer.json` fue generado por el conversor a partir de `vocab.json` y `merges.txt`, ya que upstream no lo incluye; conviene validar que la tokenización coincide con la del modelo original antes de comparar resultados.
- Este repositorio concreto está atado a MLX y por tanto a Apple Silicon; no hay artefactos para CUDA, ROCm ni CPU genérica.
- Repositorio sin tracción: 0 descargas y 0 likes, publicado y actualizado en el mismo instante, sin validación independiente de la conversión.
- Licencia Apache 2.0 permite uso comercial y modificación, con obligación de conservar avisos de copyright y de licencia, y con la cláusula habitual de concesión de patentes; el mérito del modelo corresponde a MediaTek Research y las condiciones del modelo base deben respetarse igualmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PMTC/Breeze-ASR-26-mlx-fp16
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-26
- Aplicación de destino (SettleVoice): https://github.com/philomath-app/settle-voice
- Script de conversión: `scripts/convert_whisper_hf_to_mlx.py` dentro del repositorio SettleVoice
- Ecosistema MLX Whisper: https://github.com/ml-explore/mlx-examples/tree/main/whisper
