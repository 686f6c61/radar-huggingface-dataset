# AnalogVector/voxdicta-models

## Resumen

AnalogVector/voxdicta-models no es un modelo único, sino un repositorio espejo que agrupa los artefactos de inferencia que consume Voxdicta, una aplicación de reconocimiento de voz. Incluye conversiones a GGUF y binarios GGML de varios sistemas de ASR, alineamiento forzado, detección de actividad de voz (VAD) y diarización de hablantes, todos ellos empaquetados para ejecutarse sobre el motor speech.cpp (derivado de whisper.cpp). El repositorio no entrena ningún modelo propio: redistribuye pesos de OpenAI (Whisper Large v3 Turbo), NVIDIA (Canary 1B v2 y Nemotron 3 Diarization), Qwen (Qwen3-ASR-1.7B y Qwen3-ForcedAligner-0.6B) y Silero (VAD v6.2), en la mayoría de los casos cuantizados a 8 bits.

El dato de parámetros totales reportado por Hugging Face (979.949.072, es decir, aproximadamente 980 millones) corresponde a los tensores safetensors presentes en el repositorio y no representa un único modelo, sino la suma agregada de los componentes publicados. El tamaño del repositorio es de 9,0 GB y acumula 262 descargas en el momento de la consulta. La licencia es heterogénea: cada fichero conserva los términos de su origen (MIT para Whisper y Silero VAD, CC-BY-4.0 para Canary, Apache 2.0 para los componentes Qwen y OpenMDW 1.1 para Nemotron), y el campo `license: other` solo apunta al fichero NOTICE.

Su relevancia es práctica: ofrece a desarrolladores hispanohablantes un conjunto coherente y versionado (con fijación por revisión y SHA-256) de modelos de voz listos para ejecución local en formato GGUF, lo que simplifica el despliegue de pipelines de transcripción, subtitulado y diarización sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: Whisper (encoder-decoder transformer), Canary (FastConformer encoder + Transformer decoder), Qwen3-ASR (transformer ASR), Qwen3-ForcedAligner, Silero VAD (red neuronal ligera para VAD) y Nemotron 3 Diarization |
| Parámetros totales | 979.949.072 (suma agregada de los tensores safetensors del repositorio; no corresponde a un único modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (la mayoría de los GGUF); F32 para Silero VAD; convoluciones, normas y sesgos de Canary en F32 con matrices lineales en 8 bits |
| Idiomas soportados | no disponible (la model card no detalla idiomas por fichero) |
| Licencia | per-file: MIT (Whisper, Silero VAD), CC-BY-4.0 (Canary y tokenizer de timestamps), Apache 2.0 (Qwen3-ASR, Qwen3-ForcedAligner), OpenMDW 1.1 (Nemotron 3 Diarization) |
| Formato de pesos | GGUF y GGML (`.gguf`, `.bin`); revisiones anteriores incluyen ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos; agrega artefactos ya entrenados por terceros y, en algunos casos, los convierte y cuantiza. Los componentes principales son: `ggml-large-v3-turbo-q8_0.bin`, el artefacto de Whisper Large v3 Turbo en formato whisper.cpp (MIT, © OpenAI); `canary-1b-v2-Q8_0.gguf`, conversión del checkpoint `model_weights.ckpt` del archivo `.nemo` de NVIDIA Canary 1B v2, con encoder FastConformer y decoder Transformer, manteniendo convoluciones, normas y sesgos en F32 y cuantizando a 8 bits las matrices lineales; `canary-1b-v2-timestamps-Q8_0.gguf`, conversión del modelo CTC de timestamps incluido en el mismo archivo `.nemo`, empleado para alinear palabras; y `Qwen3-ASR-1.7B-Q8_0.gguf`, conversión Q8_0 de Qwen3-ASR-1.7B realizada por terceros y espejada sin cambios.

Completan el conjunto `qwen3-forced-aligner-0.6b-speechcpp-q8_0.gguf`, alineador forzado Qwen3-ForcedAligner-0.6B cuyos tensores y metadatos fueron renombrados y reescritos al layout de speech.cpp sin modificar los pesos cuantizados; `silero-vad-309K-v6.2-F32.gguf`, detector de actividad de voz Silero v6.2 a 16 kHz en F32; y `Nemotron-3-Diarization-99M-Q8_0.gguf`, modelo de diarización de NVIDIA de 99 millones de parámetros en Q8_0. Se incluyen además `timestamps-vocab.txt` y `timestamps-tokenizer.model`, vocabulario y tokenizer del modelo CTC de timestamps. No se documentan en la información disponible detalles sobre datasets de entrenamiento, número de tokens, composición de datos ni uso de RLHF/DPO, ya que se trata de artefactos derivados de modelos publicados por sus autores originales.

## Capacidades

- Reconocimiento automático de voz (ASR) mediante Whisper Large v3 Turbo, Canary 1B v2 y Qwen3-ASR-1.7B.
- Alineamiento forzado de palabras y generación de timestamps por palabra mediante Qwen3-ForcedAligner-0.6B y el modelo CTC de timestamps de Canary.
- Detección de actividad de voz (VAD) a 16 kHz con Silero VAD v6.2, usada por la aplicación Windows de Canary para localizar regiones con habla.
- Diarización de hablantes (separación de quién habla en cada momento) con Nemotron 3 Diarization de 99M de parámetros.
- Ejecución local sobre el motor speech.cpp, con pesos cuantizados a 8 bits para reducir requisitos de memoria.
- Versionado reproducible: cada fichero se fija por revisión y SHA-256, y las revisiones anteriores permanecen disponibles.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento en la información disponible.

## Casos de uso

- Transcripción local de reuniones y entrevistas: combinando Whisper Large v3 Turbo o Canary 1B v2 con Silero VAD para segmentar el audio y Qwen3-ForcedAligner para obtener timestamps por palabra, se puede generar un acta con marcas temporales sin enviar audio a la nube.
- Subtitulado automático de vídeo: el pipeline ASR más alineador forzado produce marcas de tiempo por palabra aptas para formatos de subtítulos (SRT/VTT), ejecutándose íntegramente en local sobre speech.cpp.
- Diarización de conversaciones multipartícipe: Nemotron 3 Diarization (99M, Q8_0) separa hablantes en grabaciones de reuniones o llamadas, lo que permite atribuir cada fragmento transcrito a su interlocutor.
- Aplicaciones de escritorio de dictado: el binario de Whisper Large v3 Turbo en GGML y los GGUF de Qwen3-ASR permiten dictado en tiempo real en equipos de usuario final, con VAD para recortar silencios y reducir cómputo.
- Procesamiento por lotes de archivos de audio en servidores: los GGUF Q8_0 reducen el uso de memoria frente a los pesos originales, lo que facilita ejecutar transcripciones masivas en CPU o GPU modestas mediante speech.cpp.
- Integración en pipelines de accesibilidad: transcripción y subtitulado en directo para personas con discapacidad auditiva, con VAD y alineamiento para sincronizar el texto con el audio.
- Archivado y búsqueda de audio: transcribir y alinear grandes volúmenes de grabaciones para indexarlas y permitir búsquedas por palabra con marcas temporales precisas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; al tratarse de modelos de 99M a 1,7B parámetros en Q8_0, cada componente individual es ligero (del orden de centenares de MB a unos 2 GB por modelo), pero la información proporcionada no incluye cifras oficiales de memoria.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; los formatos GGUF/GGML y la cuantización Q8_0 sugieren viabilidad en hardware de consumo, pero no se documentan requisitos concretos.
- Opciones de despliegue: motor speech.cpp (layout al que se adaptan varios ficheros); whisper.cpp para el artefacto `ggml-large-v3-turbo-q8_0.bin`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para estos artefactos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnalogVector/voxdicta-models (conjunto) | 979.949.072 agregados | no disponible | GGUF, GGML | per-file (MIT, CC-BY-4.0, Apache 2.0, OpenMDW 1.1) | Hugging Face, 262 descargas |
| openai/whisper-large-v3-turbo | no disponible en la información | no disponible | safetensors, GGML (vía whisper.cpp) | MIT | Hugging Face |
| nvidia/canary-1b-v2 | no disponible en la información | no disponible | NeMo (.nemo), GGUF (conversión) | CC-BY-4.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B | 1,7B (según nombre) | no disponible | safetensors, GGUF (conversión) | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos de origen citados en la model card; no se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo único ni un repositorio oficial: es un espejo independiente, no afiliado a NVIDIA, OpenAI ni sherpa-onnx; al redistribuir cualquier fichero deben conservarse las atribuciones y licencias de origen.
- Licencia heterogénea por fichero: el campo `license: other` solo remite al NOTICE; es obligatorio revisar `LICENSES/` antes de cualquier uso comercial, ya que coexisten MIT, CC-BY-4.0, Apache 2.0 y OpenMDW 1.1.
- Los idiomas soportados no están documentados en la información disponible; no debe asumirse cobertura multilingüe sin verificar cada componente por separado.
- Riesgo de alucinación inherente a los sistemas ASR (transcripciones plausibles pero incorrectas), especialmente en audio con ruido, acentos o solapamiento de hablantes; no se documentan tasas de error en la información disponible.
- Los ficheros cuantizados a 8 bits pueden presentar una ligera degradación de precisión frente a los pesos originales en F32; la model card no cuantifica esa pérdida.
- Dependencia del layout de speech.cpp: varios ficheros han sido renombrados o reescritos para ese motor, por lo que no son directamente intercambiables con otras herramientas sin conversión.
- Las revisiones anteriores incluyen ficheros ONNX retirados de la cabeza del repositorio; las builds que los fijan siguen funcionando, pero no reciben actualizaciones.
- No se documentan sesgos específicos, límites de contexto ni latencias en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AnalogVector/voxdicta-models
- Fichero NOTICE de licencias: https://huggingface.co/AnalogVector/voxdicta-models/blob/main/NOTICE
- whisper.cpp (origen de Whisper Large v3 Turbo): https://huggingface.co/ggerganov/whisper.cpp
- NVIDIA Canary 1B v2: https://huggingface.co/nvidia/canary-1b-v2
- Tokenizer y vocabulario de timestamps: https://huggingface.co/ysdede/nemo-canary-1b-v2-onnx-timestamped
- Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Conversión GGUF de Qwen3-ASR-1.7B: https://huggingface.co/sakasegawa/Qwen3-ASR-1.7B-GGUF
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Conversión GGUF de Silero VAD: https://huggingface.co/sakasegawa/silero-vad-GGUF
- Qwen3-ForcedAligner-0.6B: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Conversión GGUF de Qwen3-ForcedAligner-0.6B: https://huggingface.co/cstr/qwen3-forced-aligner-0.6b-GGUF
- NVIDIA Nemotron 3 Diarization: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Conversión GGUF de Nemotron 3 Diarization: https://huggingface.co/sakasegawa/Nemotron-3-Diarization-GGUF
