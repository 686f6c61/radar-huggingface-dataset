# aaronpham/speakilo-cpu-models

## Resumen

`aaronpham/speakilo-cpu-models` no es un modelo único, sino un paquete de despliegue privado que agrupa varios artefactos de voz pensados para ejecutarse en CPU: detección de actividad de voz (VAD), identificación de idioma (LID), síntesis de voz (TTS), reconocimiento automático del habla (ASR) y traducción automática (MT). El autor, `aaronpham`, indica explícitamente que el repositorio replica artefactos de terceros y no reclama autoría ni derechos más allá de los términos de cada proyecto upstream. El paquete está pensado para el stack interno "Speakilo", con formato dominante ONNX/onnxruntime y algunos GGUF para llama.cpp.

El contenido combina componentes de proyectos conocidos: Silero VAD v6 (MIT), SpeechBrain VoxLingua107 ECAPA (Apache-2.0), voces Piper de `rhasspy/piper-voices`, un bundle AISHELL3 vía sherpa-onnx, un modelo Ppaso coreano de `akamotaco/ppaso-tts-v1` (Apache-2.0), un GIPFormer 1.5 68M RNN-T INT8 para vietnamita (MIT) y un SenseVoiceSmall INT8 de sherpa-onnx sin licencia declarada. Además incluye un GGUF Q4_0 de `tencent/Hy-MT2-1.8B` (Apache-2.0 en el modelo base) para traducción.

Su relevancia es práctica: ofrece un conjunto coherente de piezas de voz listas para inferencia en CPU con onnxruntime, útil para pipelines de conversación de baja latencia sin GPU. No obstante, la licencia del repositorio no está disponible y varios artefactos tienen términos ambiguos o restricciones (investigación, licencia desconocida), lo que limita su uso comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: VAD (Silero v6, ONNX), LID (SpeechBrain ECAPA-TDNN), TTS (sherpa-onnx VITS para Piper/AISHELL, adaptador ONNX para Ppaso), ASR (GIPFormer 1.5 RNN-T INT8 y SenseVoiceSmall INT8), MT (Hy-MT2-1.8B GGUF) |
| Parametros totales | 1.791.080.448 (dato agregado de safetensors; no aplica a todos los submodelos por separado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ASR), Q4_0 con imatrix y q8emb/allq40 (GGUF de MT); ONNX sin cuantización declarada para VAD/LID/TTS |
| Idiomas soportados | Vietnamita (ASR GIPFormer), chino/inglés/japonés/coreano/cantonés (SenseVoiceSmall), coreano (TTS Ppaso), voces Piper con datasets VI, Lessac y VAIS1000; LID VoxLingua107 cubre 107 idiomas; idiomas globales del paquete no disponibles |
| Licencia | no disponible para el repositorio; componentes con MIT, Apache-2.0, CC-BY-4.0, uso de investigación y licencia desconocida según el artefacto |
| Formato de pesos | ONNX, GGUF, safetensors (agregado), checkpoints SpeechBrain/PyTorch |

## Arquitectura y entrenamiento

El paquete no define un entrenamiento propio: es un espejo byte a byte de una instalación local de Speakilo, con un `checksums.json` que registra SHA-256, tamaño, ruta de origen y metadatos upstream. La arquitectura es, por tanto, la suma de las arquitecturas de cada componente: Silero VAD v6 en ONNX para detección de voz, un ECAPA-TDNN de SpeechBrain para LID sobre VoxLingua107, VITS de sherpa-onnx para las voces Piper y AISHELL3, un adaptador ONNX CPU para Ppaso, RNN-T GIPFormer 1.5 de 68M en INT8 para ASR vietnamita, SenseVoiceSmall INT8 para ASR multilingüe y un GGUF de Hy-MT2-1.8B para traducción.

No se dispone de información sobre número de tokens de entrenamiento, composición de datasets ni procesos de RLHF/DPO en la información proporcionada. La model card menciona linajes de datos relevantes para licencias: el dataset vietnamita de 25 horas está marcado como desconocido, Lessac tiene linaje de uso de investigación y VAIS1000 es CC-BY-4.0 pero afinado desde Lessac. El bundle AISHELL3 descargado no tiene licencia de modelo/datos verificada.

## Capacidades

- Detección de actividad de voz (VAD) en tiempo real sobre CPU mediante Silero VAD v6 en ONNX.
- Identificación de idioma (LID) con cobertura de 107 idiomas según VoxLingua107 ECAPA.
- Síntesis de voz (TTS) con cinco bundles de voces CPU: voces Piper, Ppaso coreano y AISHELL3 vía sherpa-onnx VITS.
- Reconocimiento automático del habla (ASR) vietnamita con GIPFormer 1.5 68M RNN-T INT8.
- ASR multilingüe (chino, inglés, japonés, coreano, cantonés) con SenseVoiceSmall INT8 de sherpa-onnx.
- Traducción automática con Hy-MT2-1.8B en GGUF Q4_0, orientado al runtime llama.cpp Hexagon/HTP.
- Compatibilidad con endpoints (`endpoints_compatible`) según los tags del repositorio.
- Ejecución en CPU sin GPU, con onnxruntime como librería principal.
- No se declaran capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Asistentes de voz embebidos en CPU: combinación de Silero VAD para segmentar turnos, LID para enrutar por idioma y TTS para respuesta, todo sin GPU en dispositivos de gama baja.
- Transcripción de audio vietnamita en local: GIPFormer 1.5 68M RNN-T INT8 permite ASR de bajo coste en servidores sin acelerador, adecuado para actas o subtítulos internos.
- Transcripción multilingüe asiática: SenseVoiceSmall INT8 cubre chino, inglés, japonés, coreano y cantonés en un único modelo compacto para pipelines de subtitulado.
- Traducción local con llama.cpp: el GGUF de Hy-MT2-1.8B Q4_0 permite traducción en CPU o en runtime Hexagon/HTP, útil para entornos con requisitos de privacidad.
- Síntesis de voz para audiolibros o avisos: las voces Piper y AISHELL3 con sherpa-onnx VITS ofrecen TTS ligero en CPU para contenido pregrabado o anuncios dinámicos.
- Prototipado de pipelines conversacionales: el paquete sirve como base para montar un flujo VAD → ASR → MT → TTS en una sola máquina CPU, con checksums para verificar integridad antes del despliegue.
- Evaluación interna de LID: VoxLingua107 ECAPA permite clasificar idioma en grabaciones antes de decidir qué ASR o TTS aplicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en su mayoría; el paquete está orientado a CPU. El GGUF de Hy-MT2-1.8B Q4_0 requiere aproximadamente 1-2 GB de RAM según cuantización, aunque no se dispone de cifra oficial.
- GPU recomendadas: no se especifican; el diseño es CPU-first (onnxruntime, sherpa-onnx, llama.cpp Hexagon/HTP).
- Cabe en consumer GPU: no disponible; el foco es CPU.
- Opciones de despliegue: onnxruntime para VAD/LID/TTS/ASR, sherpa-onnx para VITS y SenseVoice, SpeechBrain/PyTorch para LID, llama.cpp para el GGUF de MT.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aaronpham/speakilo-cpu-models` | Paquete de voz CPU (VAD, LID, TTS, ASR, MT) | 1.791.080.448 agregados | no disponible | no disponible (componentes con MIT, Apache-2.0, CC-BY-4.0 y desconocida) | Hugging Face, 0 descargas |
| Silero VAD | VAD | no disponible | no disponible | MIT | Upstream `snakers4/silero-vad` |
| SpeechBrain VoxLingua107 ECAPA | LID | no disponible | no disponible | Apache-2.0 | Upstream `speechbrain/lang-id-voxlingua107-ecapa` |
| Piper voices | TTS | no disponible | no disponible | variable por voz | Upstream `rhasspy/piper-voices` |
| Hy-MT2-1.8B | MT | 1.8B | no disponible | Apache-2.0 (base) | Upstream `tencent/Hy-MT2-1.8B` |

## Limitaciones y advertencias

- El repositorio no declara licencia propia; el uso comercial queda condicionado a los términos de cada artefacto upstream.
- El bundle AISHELL3 no tiene licencia de modelo/datos verificada; la model card recomienda mantener el repositorio privado salvo que se establezcan derechos de forma independiente.
- SenseVoiceSmall carece de licencia declarada en los metadatos de Hugging Face; también se recomienda mantenerlo privado.
- El dataset vietnamita de 25 horas está marcado como desconocido y Lessac tiene linaje de uso de investigación, lo que puede restringir usos comerciales de las voces Piper asociadas.
- Riesgo de alucinación y errores de transcripción/traducción inherente a los modelos de ASR y MT, sin métricas publicadas que permitan cuantificarlo.
- Cobertura de idiomas fragmentada: el ASR vietnamita y el TTS coreano son específicos, mientras que el LID cubre 107 idiomas; no hay un idioma global único garantizado.
- No se dispone de información sobre sesgos, contexto máximo ni rendimiento medido; la evaluación en producción requeriría pruebas propias.
- El paquete es un espejo de una instalación local, con 0 descargas y 0 likes; no hay garantía de mantenimiento o soporte por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/aaronpham/speakilo-cpu-models
- Silero VAD: https://github.com/snakers4/silero-vad
- VoxLingua107 ECAPA: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Ppaso TTS: https://huggingface.co/akamotaco/ppaso-tts-v1
- Piper voices: https://huggingface.co/rhasspy/piper-voices
- GIPFormer 1.5 68M RNN-T: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt
- SenseVoiceSmall sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17
- Hy-MT2-1.8B: https://huggingface.co/tencent/Hy-MT2-1.8B
