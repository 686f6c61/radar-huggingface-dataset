# RumiLabs/rumi-cerberus-4b-mlx-4bit

## Resumen

rumi-cerberus-4b es un paquete de voz-a-texto y razonamiento multimodal desarrollado por RumiLabs, orientado a inferencia completamente local en dispositivos de clase iPhone. Combina en un único bundle cuatro módulos que comparten un codificador de audio congelado: un encoder de audio (Stage-2.2), un LLM Qwen3-4B-Thinking-2507 con LoRA fusionado, una cabeza CTC de reconocimiento de voz y una cabeza de clasificación de emociones en cuatro clases. La distribucion en INT4 ocupa aproximadamente 2,6 GB en disco.

El modelo resuelve el problema de desplegar un pipeline de voz completo (transcripcion, deteccion de emociones, razonamiento y tool calling) sin depender de la nube, manteniendo una calidad de transcripcion competitiva con Whisper. Segun la model card, supera a whisper-small en LibriSpeech test_clean (WER 0,0269 frente a 0,0339) con un tamano en disco unas 40 veces menor que whisper-large-v3-turbo, y con extensiones de decodificacion alcanza 0,0254.

La relevancia actual reside en su enfoque de reutilizacion: la etapa de rescoring del STT reutiliza el mismo Qwen3-4B del bundle, sin coste adicional de tamano, y las tres cabezas comparten una sola pasada forward del encoder de audio. Esta disponible en formato MLX (safetensors) con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle multimodal: encoder de audio congelado + adaptador + mergers DeepStack, LLM transformer Qwen3-4B-Thinking-2507 con LoRA fusionado, cabeza CTC STT y cabeza de emociones de 4 clases |
| Parametros totales | 4B (LLM base Qwen3-4B-Thinking-2507); desglose del bundle: encoder ~430 MB, LLM ~2,1 GB, STT ~39 MB, emociones ~3 MB en INT4 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (MLX); pesos BF16 disponibles en repo separado |
| Idiomas soportados | en, zh, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); BF16 en repo separado |

## Arquitectura y entrenamiento

El bundle se compone de un encoder de audio congelado (Stage-2.2) con adaptador y mergers DeepStack, acoplado mediante LoRA (Stage 2.1) a un LLM Qwen3-4B-Thinking-2507. Sobre esa representacion compartida se montan dos cabezas ligeras: una cabeza CTC de reconocimiento de voz (receta Phase E, con atencion deslizante de 4 vias) y una cabeza de clasificacion de emociones de 4 clases. Las tres cabezas consumen una unica pasada forward del encoder de audio, lo que reduce el coste computacional del pipeline completo.

El entrenamiento parte del modelo base OpenMOSS-Team/MOSS-Audio-4B-Thinking y de Qwen/Qwen3-4B-Thinking-2507. La innovacion tecnica principal es la etapa de rescoring del STT, que reutiliza el propio Qwen3-4B del bundle con la formula `score(h) = ctc_logit(h) + 0.5 * mean_log_prob_per_token_of_Qwen3(h) * len(h)`, combinando puntuacion LLM sum-not-mean con beam-200 y normalizador de texto de Whisper. Las extensiones de decodificacion anaden condicionamiento por contexto de capitulo (los dos transcripts previos, legal en streaming) y escalado con compuerta por margen para el 30% de utterances con menor margen. No se detalla en la informacion disponible el volumen de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Reconocimiento de voz (speech-to-text) con calidad cercana a Whisper large-v3-turbo y tamano muy reducido.
- Deteccion de emociones en habla en 4 clases.
- Razonamiento de texto con modo thinking (Qwen3-4B-Thinking-2507).
- Tool calling y function calling (BFCL v3 con 91,17% de media en 3 categorias).
- Chat condicionado por audio (audio in → razonamiento LLM out).
- Capacidades multilingues limitadas a ingles, chino y coreano.
- Pipeline completo de voz a voz: microfono → encoder → STT + emociones → razonamiento LLM → respuesta TTS en streaming (Qwen3-TTS).
- Guards de robustez en la capa de integracion: deteccion de silencio, limites de tasa de palabras y cap de propagacion de contexto a 2 turnos.

## Casos de uso

- Dictado y transcripcion en dispositivo: el modo de maxima calidad (rescore + extensiones de decodificacion) alcanza WER 0,0254 en test_clean, adecuado para flujos de dictado donde la latencia p95 puede degradarse en el 30% de utterances con menor margen.
- Asistentes de voz offline en iPhone: el bucle completo de voz a voz esta validado en iPhone 16 Pro Max con acknowledgment en menos de 0,5 s, razonamiento en 2,5-4 s y primera respuesta de audio en 4,1-4,4 s.
- Atencion al cliente con deteccion emocional: la cabeza de emociones de 4 clases permite adaptar la respuesta del LLM al estado afectivo del usuario en conversaciones multi-turno.
- Agentes con tool calling en movil: BFCL v3 del 91,17% habilita agentes que invocan funciones externas desde el dispositivo sin enviar audio a la nube.
- Analisis de llamadas y reuniones: transcripcion con rescoring condicionado por contexto de capitulo, pensado para flujos secuenciales de transcripcion larga.
- Aplicaciones de accesibilidad: transcripcion local de baja latencia y respuesta hablada sintetizada en el propio dispositivo, sin dependencia de conectividad.
- Investigacion en eficiencia de despliegue: referencia para estudiar reutilizacion de un LLM como rescorer de un CTC y comparticion de encoder entre cabezas.

## Benchmarks y rendimiento

LibriSpeech (conjuntos completos, normalizador EnglishTextNormalizer):

| Configuracion | test_clean | test_other |
|---|---:|---:|
| mlx_stt greedy CTC | 0,0342 | 0,0856 |
| mlx_stt + rescore con Qwen3-4B | 0,0269 | 0,0708 |
| mlx_stt + rescore + extensiones de decodificacion | 0,0254 | 0,0692 |
| whisper-small (referencia, 459 MB) | 0,0339 | 0,0791 |
| whisper-large-v3-turbo (referencia, ~1,6 GB; greedy / full decode) | 0,0216 / 0,0200 | 0,0425 / 0,0419 |

Otros resultados declarados:

| Metrica | Valor |
|---|---|
| BFCL v3 (media de 3 categorias) | 91,17% |
| Fixture clips de audio | 7/7 superados |
| Decodificacion en iPhone 16 Pro Max | 17,85 tokens/s |
| TTFT del LLM en iPhone 16 Pro Max | 0,51 s |

## Requisitos de hardware

- VRAM/disco: ~2,6 GB en INT4 en iPhone 16 Pro Max; el repo ocupa 2,8 GB.
- Despliegue validado en iPhone 16 Pro Max con kernels Metal (Release equivalente a debug).
- GPU recomendadas: no se especifican GPU de escritorio; el objetivo declarado es iPhone-class on-device. El formato MLX es propio de Apple Silicon.
- Cabe en dispositivos moviles de gama alta Apple; no se documenta compatibilidad con GPU consumer NVIDIA.
- Opciones de despliegue: MLX (libreria del repo), con scripts de inferencia en `inference.py` y capa Swift en `swift/` (incluye `LLMRescorer.swift` y `swift/tts/`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: acknowledgment < 0,5 s tras parar el microfono; razonamiento ~2,5-4 s; primera respuesta de audio ~4,1-4,4 s; rescore plano ~2,5 s/utterance; escalado de utterances de bajo margen +5-8 s.
- Throughput TTS: RTF 1,27-1,31 en frio, ~0,65 bajo carga termica; 0 underruns en validacion, incluidas respuestas de 22,5 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | STT test_clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rumi-cerberus-4b (INT4) | 4B (LLM) | no disponible | 0,0254-0,0269 | Apache 2.0 | MLX, on-device |
| whisper-small | ~244M | no disponible | 0,0339 | MIT (referencia) | amplia |
| whisper-large-v3-turbo | ~809M | no disponible | 0,0200-0,0216 | MIT (referencia) | amplia |
| Qwen3-4B-Thinking-2507 | 4B | no disponible | no aplica (solo texto) | Apache 2.0 | amplia |

La comparativa se limita a las referencias citadas en la model card; no se dispone de datos de otros bundles equivalentes de voz-a-texto con razonamiento integrado.

## Limitaciones y advertencias

- Idiomas: solo ingles, chino y coreano; no hay soporte declarado de castellano.
- El modo de extensiones de decodificacion condiciona sobre los dos transcripts previos, por lo que un turno erroneo puede propagarse (limitado a 2).
- El prompt de estilo del condicionamiento puede sesgar hacia emitir texto en entradas ruidosas o corruptas; se incluyen guards de silencio y tasa de palabras.
- Parte de la mejora de las extensiones de decodificacion es especifica del corpus (contexto secuencial y prompt de estilo); el delta en dominio conversacional no esta cuantificado.
- El escalado por margen degrada la latencia p95 en el ~30% de utterances (+5-8 s).
- Riesgo de alucinacion inherente al LLM Qwen3-4B en razonamiento y tool calling; no se documentan evaluaciones de sesgo.
- Las cifras de STT se han medido con un normalizador concreto; comparaciones con otros normalizadores no son directamente equiparables (la propia card corrige una referencia previa de turbo 0,0285).
- Despliegue limitado al ecosistema MLX/Apple; no hay soporte documentado para CUDA ni para servidores tradicionales.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones de los modelos base (MOSS-Audio-4B-Thinking y Qwen3-4B-Thinking-2507) deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/RumiLabs/rumi-cerberus-4b-mlx-4bit
- Repo de staging con checkpoints intermedios: https://huggingface.co/RumiLabs/MOSS-Audio-4B-Thinking-2507-MLX-4bit-v2
- Pesos BF16: https://huggingface.co/RumiLabs/rumi-cerberus-4b-bf16
- Modelo base de audio: OpenMOSS-Team/MOSS-Audio-4B-Thinking
- Modelo base LLM: Qwen/Qwen3-4B-Thinking-2507
