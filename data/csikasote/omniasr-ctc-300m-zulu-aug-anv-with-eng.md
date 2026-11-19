# csikasote/omniASR-CTC-300m-Zulu-AUG-ANV-with-ENG

## Resumen

omniASR-CTC-300m-Zulu-AUG-ANV-with-ENG es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2 con cabecera CTC, publicado por el usuario csikasote en Hugging Face. Se trata de una conversión del checkpoint original `omniASR_CTC_300M_v2` del proyecto OmniLingual de Meta (facebookresearch/omnilingual-asr), originalmente entrenado en fairseq2 y convertido al formato de `transformers` con verificación de paridad numérica (tolerancia `atol=1e-4` sobre una muestra de audio reservada).

El modelo cuenta con 325.983.920 parámetros (aproximadamente 326 M) y está diseñado para transcribir voz en múltiples idiomas, con un enfoque particular en zulú (según indica el nombre, con variantes AUG/ANV y presencia de inglés en el entrenamiento). Su relevancia radica en ser una adaptación lista para usar con la librería `transformers` de un modelo multilingüe de ASR de Meta, lo que facilita su integración en pipelines existentes sin necesidad de fairseq2.

La ficha se basa únicamente en la información disponible en la model card y los metadatos de Hugging Face; muchos datos (licencia, idiomas exactos, benchmarks, datos de entrenamiento) no están publicados y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + encoder transformer) con cabecera CTC |
| Parametros totales | 325.983.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana dependiente de la longitud de la señal de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible de forma oficial; el nombre sugiere zulú e inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura (de la model card):

| Parametro | Valor |
|---|---|
| Clase HF | `Wav2Vec2ForCTC` |
| Capas del encoder | 24 |
| Tamano oculto | 1024 |
| Cabezas de atencion | 16 |
| FFN intermedio | 4096 |
| Tamano de vocabulario | 10288 (SentencePiece) |
| Framework origen | fairseq2 |
| Checkpoint origen | `omniASR_CTC_300M_v2` |
| Verificacion de paridad | Verificada (atol=1e-4) |
| Tamano del repo | 1,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2: un extractor de características convolucional que procesa la forma de onda a 16 kHz y un encoder transformer de 24 capas con 1024 dimensiones ocultas, 16 cabezas de atención y FFN de 4096. Sobre el encoder se aplica una cabecera CTC que emite logits sobre un vocabulario SentencePiece de 10 288 tokens. Es un modelo de reconocimiento (no generativo autoregresivo), por lo que la decodificación es greedy o mediante beam search sobre la salida CTC.

El entrenamiento original corresponde al checkpoint `omniASR_CTC_300M_v2` del proyecto OmniLingual de Meta, orientado a ASR multilingüe a gran escala. No se dispone en la información proporcionada de detalles sobre el número de tokens de audio, la composición del dataset, ni si se aplicaron técnicas de aumento de datos (el sufijo AUG podría sugerir data augmentation, pero no está confirmado). Tampoco se documenta el uso de RLHF/DPO, algo poco habitual en modelos ASR. La innovación destacable es la conversión fiel desde fairseq2 a `transformers` con paridad numérica verificada, lo que permite usar el modelo con el ecosistema estándar de Hugging Face.

## Capacidades

- Reconocimiento automático del habla (ASR) mediante CTC sobre audio a 16 kHz.
- Transcripción multilingüe (el nombre indica zulú e inglés; el alcance exacto de idiomas no está documentado).
- Salida de logits CTC decodificables con el procesador SentencePiece asociado.
- Integración nativa con `transformers` (`Wav2Vec2ForCTC` y `AutoProcessor`).
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente de transcripción).
- No dispone de modo de razonamiento (thinking), visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y notas de voz en zulú: el modelo puede convertir grabaciones de audio a texto con un pipeline ASR estándar, útil para documentación interna en organizaciones que operan en Sudáfrica.
- Subtitulado automático de vídeo: integrado en un pipeline de ffmpeg + `transformers`, permite generar subtítulos para contenido en zulú o mezclas zulú-inglés.
- Atención al cliente por voz: como componente ASR en un sistema de IVR, transcribe la consulta del usuario para su posterior procesamiento por un LLM.
- Investigación lingüística y preservación de lenguas: permite generar corpus transcritos de zulú para estudios de fonética, morfología o entrenamiento de modelos posteriores.
- Indexación y búsqueda de archivos de audio: transcripción masiva de archivos para hacerlos buscables por texto en repositorios o archivos periodísticos.
- Evaluación comparativa de ASR multilingüe: sirve como baseline de 300 M parámetros frente a modelos más grandes (Whisper, MMS) en tareas de bajo recurso.
- Preentrenamiento o fine-tuning posterior: al estar en formato `transformers`, puede usarse como punto de partida para adaptación a dominios específicos (médico, legal) con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 1,3 GB de pesos más activaciones; en fp16, en torno a 0,7 GB. Con audio de varios minutos, las activaciones del encoder aumentan el consumo, pero sigue siendo manejable en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; para alto throughput en servidor, A100 o H100 permiten procesar lotes grandes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: `transformers` (PyTorch), Hugging Face Inference Endpoints (tag `endpoints_compatible`), integración en pipelines con `torchaudio`. No se documentan exportaciones a ONNX, vLLM (no aplica a ASR CTC) ni llama.cpp/Ollama (no aplica).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omniASR-CTC-300m-Zulu-AUG-ANV-with-ENG | 326 M | ventana dependiente de la señal | zulú/inglés (según nombre) | no disponible | Hugging Face |
| MMS (facebook/mms-1b-all) | ~1 B | ventana dependiente de la señal | >1000 idiomas | CC-BY-NC 4.0 | Hugging Face |
| Whisper large-v3 | ~1,55 B | 30 s por ventana | ~99 idiomas | MIT (código) / pesos con restricciones | OpenAI / Hugging Face |
| Wav2Vec2-base-960h | 95 M | ventana dependiente de la señal | inglés | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo (WER) para este modelo en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor o consultar el repositorio original de OmniLingual antes de desplegarlo en producción.
- Idiomas no documentados oficialmente: el nombre sugiere zulú e inglés, pero no hay una lista oficial de idiomas soportados ni métricas por idioma.
- Riesgo de alucinación y errores de transcripción: como todo modelo CTC, puede producir salidas incorrectas en audio con ruido, acentos no vistos o cambios de dominio.
- Sin datos de entrenamiento publicados: no se puede evaluar el sesgo demográfico, dialectal o de género del corpus.
- Modelo de 300 M: menor precisión esperada que modelos más grandes (Whisper large, MMS-1B) en condiciones difíciles.
- Sin soporte de puntuación ni normalización avanzada: la salida CTC sobre SentencePiece puede requerir post-procesado para formato legible.
- Conversión reciente y sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación por parte de la comunidad.
- No apto para tareas generativas, agentes ni tool calling: es exclusivamente un modelo ASR.

## Enlaces

- Hugging Face: https://huggingface.co/csikasote/omniASR-CTC-300m-Zulu-AUG-ANV-with-ENG
- Repositorio OmniLingual (Meta): https://github.com/facebookresearch/omnilingual-asr
- Checkpoint origen: `omniASR_CTC_300M_v2` (fairseq2, proyecto OmniLingual)
