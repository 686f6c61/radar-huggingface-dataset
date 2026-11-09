# futo-org/asr4all-l-plus

## Resumen

asr4all-l-plus es un modelo de reconocimiento automático del habla (ASR) desarrollado por FUTO, una organización centrada en software de código abierto y herramientas de privacidad. Se trata de la variante "plus" de la familia asr4all, que añade módulos específicos para diarización, verificación de hablante y segmentación de hablante sobre la base del modelo asr4all-l. El modelo resuelve el problema del reconocimiento de voz en inglés con un enfoque en despliegue en dispositivo (on-device) y en el borde (edge), con soporte para streaming.

La arquitectura es un transformer CTC (Connectionist Temporal Classification) con aproximadamente 104,3 millones de parámetros totales, de los cuales 96,8 millones corresponden a la ruta de transcripción y el resto a las cabezas adicionales. El modelo está diseñado para funcionar en entornos con recursos limitados, con exportaciones a ONNX y ExecuTorch, y se distribuye bajo la licencia FUTO Ethical Use 1.0, que permite uso comercial con limitaciones éticas.

La relevancia actual del modelo radica en su combinación de ASR de alta precisión con capacidades de diarización integradas en un paquete ligero, lo que lo hace adecuado para aplicaciones de transcripción de reuniones, atención al cliente y análisis de audio en tiempo real sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer CTC con cabezas adicionales de verificación y segmentación de hablante, VAD FSMN |
| Parametros totales | 104.285.780 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; VAD con ~800 ms de contexto causal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | futo-ethical-use-1.0 |
| Formato de pesos | safetensors, ONNX, ExecuTorch |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer con decodificación CTC, orientada a reconocimiento de voz en streaming y en dispositivo. La ruta de transcripción cuenta con 96,8 millones de parámetros, mientras que los módulos adicionales incluyen una cabeza de verificación de hablante (`sv`) que genera embeddings de voz de 512 dimensiones, una cabeza de segmentación de hablante (`seg`) que indica quién habla en cada frame, y un detector de actividad de voz (VAD) FSMN de 429k parámetros proveniente de FunASR (Apache-2.0) que proporciona una probabilidad de habla cada 10 ms con aproximadamente 800 ms de contexto causal.

Los datos de entrenamiento incluyen una amplia variedad de corpus: espnet/yodas, MLCommons/peoples_speech, mozilla-foundation/common_voice_25_0, openslr/librispeech_asr, pkufool/libriheavy, facebook/voxpopuli, edinburghcstr/ami, qmeeus/slurp, distil-whisper/earnings22, Revai/earnings21, edinburghcstr/edacc, farukclk/voxpopuli-en-accented-split, ylacombe/english_dialects y apptek-com/apptek_callcenter_dialogues. No se especifica en la información disponible el número total de tokens de audio ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la integración de múltiples cabezas en un único modelo para tareas de diarización y verificación de hablante, junto con exportaciones optimizadas para ExecuTorch y ONNX que permiten inferencia en el borde.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés con decodificación CTC.
- Detección de actividad de voz (VAD) mediante FSMN, con probabilidad de habla cada 10 ms y contexto causal de ~800 ms.
- Verificación de hablante: genera embeddings de voz de 512 dimensiones.
- Segmentación de hablante: indica quién habla en cada frame (powerset).
- Diarización de hablantes: incluye un pipeline de ejemplo (`diarize.py`) que combina VAD, embeddings y segmentación.
- Soporte de streaming y despliegue en dispositivo (on-device) y edge.
- Exportación a ONNX y ExecuTorch para inferencia en entornos con recursos limitados.
- Capacidades multilingües: solo inglés (según la model card).
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Transcripción de reuniones con diarización: el modelo puede procesar audio de reuniones y, gracias a sus cabezas de segmentación y verificación de hablante, identificar quién habla en cada momento, generando transcripciones etiquetadas por hablante sin necesidad de módulos externos.
- Atención al cliente automatizada: permite transcribir llamadas en tiempo real en inglés, con detección de actividad de voz para segmentar turnos de habla y verificación de hablante para autenticación básica, todo en dispositivo para preservar la privacidad.
- Análisis de llamadas de centros de contacto: el modelo puede procesar grabaciones de call centers (entrenado con apptek-com/apptek_callcenter_dialogues) para extraer transcripciones y métricas de participación por hablante, útil para control de calidad y análisis de sentimiento.
- Subtitulado en vivo en aplicaciones de escritorio: gracias a su tamaño reducido (104M parámetros) y exportación a ExecuTorch, puede integrarse en aplicaciones de videoconferencia para generar subtítulos en tiempo real en inglés sin conexión a la nube.
- Investigación en lingüística computacional: el modelo proporciona embeddings de voz y segmentación por hablante que pueden usarse para estudios de variación dialectal (entrenado con ylacombe/english_dialects y voxpopuli-en-accented-split).
- Sistemas de seguridad y verificación de identidad por voz: la cabeza de verificación de hablante permite comparar embeddings de voz para autenticación biométrica en dispositivos con recursos limitados.
- Transcripción de podcasts y medios: el modelo puede transcribir audio largo con detección de actividad de voz para filtrar silencios y segmentación para identificar interlocutores, adecuado para generar índices searchables.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (no verificados) son los siguientes:

| Dataset | WER (%) |
|---|---|
| LibriSpeech clean | 2,38 |
| LibriSpeech other | 5,94 |
| VoxPopuli (cleaned) | 4,05 |
| SPGISpeech | 4,61 |
| Monsoon en-IN | 7,40 |
| Earnings-22 (cleaned, chunked) | 9,15 |
| GigaSpeech (cleaned) | 9,84 |
| AMI (cleaned) | 9,94 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 104M parámetros, la inferencia en FP32 requiere aproximadamente 0,4 GB de VRAM; en FP16, unos 0,2 GB. Estas cifras son estimaciones basadas en el tamaño del modelo y no están confirmadas en la información disponible.
- GPU recomendadas: el modelo está diseñado para despliegue en dispositivo y edge, por lo que puede ejecutarse en CPU y en GPUs de gama baja. Para inferencia en servidor, una GPU consumer como RTX 3060 o superior es más que suficiente. No se especifican GPUs de datacenter (A100, H100) en la información disponible.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPUs y dispositivos móviles gracias a las exportaciones a ExecuTorch y ONNX.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), ONNX Runtime, ExecuTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos ASR.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede mencionar que el modelo base asr4all-l (sin las cabezas adicionales) es una alternativa directa dentro de la misma familia, con las mismas capacidades de ASR pero sin diarización ni verificación de hablante. Otros modelos ASR como Whisper de OpenAI o wav2vec 2.0 de Meta no se comparan en la información disponible.

| Modelo | Parámetros | Contexto | WER (LibriSpeech clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asr4all-l-plus | 104,3M | no disponible | 2,38% | futo-ethical-use-1.0 | Hugging Face |
| asr4all-l | no disponible | no disponible | no disponible | futo-ethical-use-1.0 | Hugging Face |
| Whisper (no comparado) | no disponible | no disponible | no disponible | MIT | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta inglés, lo que limita su uso en entornos multilingües.
- Al ser un modelo CTC, puede producir errores en palabras poco frecuentes, nombres propios y acrónimos.
- Riesgo de alucinación: como todo modelo ASR, puede generar transcripciones plausibles pero incorrectas en audio con ruido o acentos no representados en el entrenamiento.
- La licencia FUTO Ethical Use 1.0 permite uso comercial pero con restricciones éticas; es necesario revisar los términos completos antes de su uso en producción.
- El VAD FSMN incluido está diseñado para delimitar habla con precisión, pero no es adecuado para detección de palabras de activación (wake detection), según la model card.
- El pipeline de diarización proporcionado no utiliza el VAD; se incluye para otras aplicaciones.
- No se especifican sesgos conocidos en la información disponible, pero al entrenarse con datos mayoritariamente en inglés, puede presentar sesgos hacia variedades dialectales sobrerrepresentadas.
- El modelo tiene 60 descargas y 1 like en Hugging Face, lo que sugiere una adopción limitada y poca validación comunitaria.

## Enlaces

- [Hugging Face: futo-org/asr4all-l-plus](https://huggingface.co/futo-org/asr4all-l-plus)
- [Modelo base: futo-org/asr4all-l](https://huggingface.co/futo-org/asr4all-l)
- [FunASR FSMN VAD](https://huggingface.co/funasr/fsmn-vad)
- [Licencia FUTO Ethical Use 1.0](https://huggingface.co/futo-org/asr4all-l-plus/blob/main/LICENSE)
