# nexiloopofficial/nexi-voice

## Resumen

NEXI-Voice es un stack de voz local en tiempo real que combina síntesis de voz (TTS) y reconocimiento de voz (STT) en un único driver de streaming con servidor HTTP de loopback. Lo desarrolla el usuario `nexiloopofficial` bajo licencia Apache-2.0. No se trata de un modelo de pesos propios: el repositorio contiene el código del driver, los arneses de benchmark y los resultados medidos, mientras que los pesos se descargan de los publicadores originales en el momento de la instalación (Kyutai Pocket TTS para TTS y Moonshine vía sherpa-onnx para STT, ambos con licencias permisivas Apache-2.0/MIT).

El valor diferencial declarado por el autor es la integración: selección de modelos, pegamento de streaming, servidor HTTP con endpoints `/speak` y `/transcribe` con parciales basados en VAD, y mediciones honestas sobre hardware sin GPU (8 vCPU). El objetivo es ofrecer una pila de voz totalmente offline, gratuita y en tiempo real que quepa en menos de 1 GB de RAM, algo relevante para productos de llamadas y asistentes embebidos en hardware de consumo.

El proyecto es muy reciente (creado el 25 de noviembre de 2026) y no registra descargas ni likes en el momento de redactar esta ficha. La documentación incluye cifras concretas de RTF, latencia al primer audio y WER, pero el propio autor advierte que la comparación de calidad subjetiva frente a ElevenLabs o Fish no ha sido evaluada a ciegas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stack de integración: TTS (Kyutai Pocket TTS) + STT (Moonshine vía sherpa-onnx); alternativas faster-whisper y Rumble-2-Flash |
| Parametros totales | No disponible (depende del motor: TTS ~2M, ~18M y ~100M; STT Moonshine base, faster-whisper tiny.en, Rumble-2-Flash 0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesamiento por chunks de audio en streaming) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los benchmarks de STT usan LibriSpeech clean, en inglés; la voz TTS de ejemplo es "alba") |
| Licencia | Apache-2.0 (pesos upstream Apache-2.0/MIT) |
| Formato de pesos | No disponible (los pesos se descargan de los publicadores upstream en la instalación) |

## Arquitectura y entrenamiento

NEXI-Voice no entrena modelos propios: es una capa de orquestación sobre modelos existentes. Para TTS emplea Kyutai Pocket TTS en modo streaming con voz "alba" a 24 kHz, con tres variantes de tamaño (english_2m, english_18m por defecto y flagship de ~100M parámetros). Para STT utiliza Moonshine base a través de sherpa-onnx en modo chunked streaming, y ofrece como alternativas medidas faster-whisper tiny.en (por lotes) y Rumble-2-Flash 0.5B (solo perfil offline).

La innovación técnica está en el pegamento: un servidor HTTP de loopback con endpoints `/speak` y `/transcribe`, parciales basados en detección de actividad de voz (VAD) y un arnés de benchmark reproducible. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO, ya que el autor no entrena ningún modelo. El repositorio incluye la metodología completa y los JSON en bruto en `BENCHMARKS.md` del repositorio de GitHub asociado.

## Capacidades

- Síntesis de voz (TTS) en streaming a 24 kHz con la voz "alba".
- Reconocimiento de voz (STT) en streaming por chunks con parciales basados en VAD.
- Servidor HTTP local con endpoints `/speak` y `/transcribe` para integración en aplicaciones.
- Funcionamiento totalmente offline sobre CPU, sin GPU.
- Perfiles de TTS con distintos compromisos de latencia/calidad: 2M, 18M (por defecto) y ~100M.
- Alternativas de STT intercambiables: Moonshine base, faster-whisper tiny.en y Rumble-2-Flash 0.5B.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada más allá del STT, ni modo thinking.

## Casos de uso

- Productos de llamadas de voz: el driver ya expone `/speak` y `/transcribe` con parciales VAD, por lo que se puede montar un bucle conversacional completo en local sin depender de APIs externas.
- Asistentes offline en hardware de consumo: con un pico de RSS de 627 MB en TTS (english_18m) y 949 MB en STT (Moonshine base), cabe en equipos de 8 vCPU sin GPU.
- Transcripción en streaming de reuniones o notas de voz: Moonshine base ofrece RTF de 0.065 y WER del 8,79% sobre LibriSpeech clean, adecuado para dictado en tiempo real.
- Atención al cliente automatizada en entornos con requisitos de privacidad: al ser totalmente offline y Apache-2.0, permite procesar audio sin enviar datos a terceros.
- Lectura de textos largos o accesibilidad: TTS streaming con time-to-first-audio de ~72 ms en la variante por defecto, apto para lectores de pantalla.
- Prototipado e investigación en voz: el arnés de benchmark y los JSON en bruto permiten reproducir y comparar motores de TTS/STT sobre el mismo hardware.
- Transcripción por lotes de alta precisión: con Rumble-2-Flash 0.5B se obtiene WER del 4,05% a costa de RTF 7,2 y 3,5 GB de RSS, útil cuando la latencia no es crítica.

## Benchmarks y rendimiento

TTS (Kyutai Pocket TTS, streaming, voz alba, 24 kHz, 8 vCPU sin GPU):

| Variante | Peak RSS | RTF | Time-to-first-audio | Tiempo real |
|---|---|---|---|---|
| english_2m | 603 MB | 0,10 | ~36 ms | sí, ~10x |
| english_18m (por defecto) | 627 MB | 0,17 | ~72 ms | sí, ~6x |
| english flagship (~100M) | 1.179 MB | 0,46 | ~181 ms | sí, ~2x |

STT (LibriSpeech clean, n=40):

| Motor | Peak RSS | WER | RTF | Streaming |
|---|---|---|---|---|
| Moonshine base (por defecto) | 949 MB | 8,79% | 0,065 | sí, por chunks |
| faster-whisper tiny.en | 505 MB | 13,3% | 0,076 | no (por lotes) |
| Rumble-2-Flash 0.5B | 3,5 GB | 4,05% | 7,2 | no, solo perfil offline |

No se han publicado resultados de benchmarks de calidad subjetiva (comparación a ciegas con ElevenLabs o Fish) en la información disponible.

## Requisitos de hardware

- CPU: 8 vCPU sin GPU es el entorno de referencia medido.
- RAM: entre ~600 MB y ~1,2 GB para TTS según variante; entre ~500 MB y 3,5 GB para STT según motor.
- GPU: no se documentan requisitos ni pruebas en GPU; el diseño es CPU-only.
- Cabe en hardware de consumo: sí, en equipos con al menos ~1,5 GB de RAM libre para el perfil por defecto (TTS 18M + Moonshine base).
- Despliegue: servidor HTTP de loopback propio del driver; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este stack).
- Latencia y throughput: RTF 0,17 y ~72 ms al primer audio en TTS por defecto; RTF 0,065 y WER 8,79% en STT por defecto.

## Comparativa con modelos similares

| Sistema | Tipo | Parámetros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NEXI-Voice (Moonshine base) | Stack TTS+STT | ~18M TTS + Moonshine base | No disponible | WER 8,79%, RTF 0,065, 949 MB | Apache-2.0 | Hugging Face / GitHub |
| faster-whisper tiny.en | STT | tiny (~39M) | No disponible | WER 13,3%, RTF 0,076, 505 MB | MIT (upstream) | Integrado como alternativa |
| Rumble-2-Flash 0.5B | STT | 0,5B | No disponible | WER 4,05%, RTF 7,2, 3,5 GB | No disponible | Integrado como alternativa offline |
| ElevenLabs / Fish | TTS comercial | No disponible | No disponible | Sin comparación a ciegas | Propietaria | No aplica |

## Limitaciones y advertencias

- El repositorio no contiene pesos propios: la disponibilidad y el comportamiento dependen de los publicadores upstream (Kyutai, Moonshine, sherpa-onnx, faster-whisper).
- La comparación de calidad subjetiva frente a ElevenLabs o Fish no ha sido evaluada a ciegas, según admite el propio autor.
- Los benchmarks de STT se limitan a LibriSpeech clean (n=40), un conjunto pequeño y en inglés; no hay datos de WER en audio ruidoso ni en otros idiomas.
- Los idiomas soportados no están documentados; la voz TTS de ejemplo es "alba" y los benchmarks de STT usan inglés.
- Rumble-2-Flash 0.5B no es apto para streaming (RTF 7,2) y requiere 3,5 GB de RAM.
- faster-whisper tiny.en funciona por lotes, no en streaming, y su WER (13,3%) es superior al de Moonshine base.
- Riesgo de alucinación en STT no cuantificado en la información disponible.
- Proyecto muy reciente y sin tracción (0 descargas, 0 likes en el momento de la ficha); madurez y mantenimiento no verificables.
- La licencia Apache-2.0 del repositorio no cubre necesariamente los pesos upstream, que deben revisarse por separado (Apache-2.0/MIT según el autor).

## Enlaces

- Hugging Face: https://huggingface.co/nexiloopofficial/nexi-voice
- Benchmarks y metodología: https://github.com/PupppyLoverr/NEXI-Models-Drivers/blob/main/nexi-voice/BENCHMARKS.md
- Repositorio de drivers: https://github.com/PupppyLoverr/NEXI-Models-Drivers
