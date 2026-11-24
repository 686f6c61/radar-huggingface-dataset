# ESpeech/ECodec-FAST

## Resumen

ECodec-FAST es un códec neuronal de audio extraído del sistema TTS ESpeech-V9-ECodec-FAST y publicado de forma independiente por ESpeech. Su función es comprimir audio de voz en una representación discreta de baja frecuencia de trama (10 codebooks RVQ a 21,53 Hz) y reconstruir la señal mediante un decodificador neural. No es un modelo generativo de lenguaje, sino un componente de infraestructura para pipelines de voz: tokeniza audio para modelos de lenguaje de audio y lo vuelve a sintetizar.

El modelo combina un encoder ECodec con cuantizador residual (RVQ) de 10 codebooks, un frontend que incluye un destilado del post-VQ (14,7 M de parámetros) con upsampling a 86 Hz, y un decodificador NSF (nano-NSF v2) con predicción de F0 por clasificación en bins (binned F0). Esta última decisión técnica evita la deriva de tono típica de los decodificadores con regresión de F0 de la versión anterior. El audio de entrada es a 44,1 kHz y la salida a 24 kHz, en mono.

Es relevante porque expone de forma aislada y reutilizable un componente que normalmente queda enterrado dentro de un TTS, con un pipeline causal que permite decodificación en streaming por chunks. El repositorio ocupa 1,5 GB y el código solo requiere torch, torchaudio y numpy, lo que facilita su integración como tokenizador de audio en arquitecturas de modelado de habla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Códec neuronal: encoder ECodec + cuantizador RVQ (10 codebooks) + frontend post-VQ destilado + decodificador NSF nano-NSF v2 con binned F0 |
| Parámetros totales | No disponible (desglose por componente: encoder+cuantizador 398 MB, decodificador 181 MB, post-VQ destilado 56 MB, cuantizador slim 81 MB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (códec); tramas a 21,53 Hz, decodificación causal por chunks |
| Tipos de cuantización | Pesos en fp16 en disco, cálculo en fp32; RVQ con cb0 de 4096 entradas y cb1–cb9 de 1024; `nq` configurable (mínimo 3 codebooks) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | `.pth` / `.pt` (PyTorch) |

## Arquitectura y entrenamiento

El pipeline es el siguiente: audio de entrada a 44,1 kHz pasa por el encoder ECodec y el cuantizador RVQ, que produce 10 codebooks a 21,53 tramas por segundo (cb0 semántico con 4096 entradas; cb1 a cb9 con 1024 cada uno). Los códigos se introducen en un frontend (`from_codes` + destilado post-VQ de 14,7 M + upsample) que genera una representación latente `z` a 86 Hz. Finalmente, el decodificador NSF con binned F0 reconstruye la señal a 24 kHz. La decodificación es causal y puede ejecutarse en streaming por chunks, requiriendo al menos 3 codebooks (`nq >= 3`).

La innovación destacada es la predicción de pitch mediante clasificación sobre bins (binned F0) en lugar de regresión, lo que según el autor evita que el tono "flote" respecto al decodificador v1. El post-VQ del frontend es un estudiante destilado (56 MB) de un teacher de 109 M de parámetros que no se incluye en el repositorio; se puede activar con las variables `ESP_POSTVQ=teacher` y `ESP_POSTVQ_TEACHER=<ruta>`. El `ISTFTHead` proviene del proyecto vocos (MIT) y está embebido en `ecodec_fast/istft_head.py`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Codificación de audio de voz a tokens discretos: `LongTensor [10, T]` a 21,53 tramas/s.
- Decodificación de tokens a audio a 24 kHz, mono, con reconstrucción de pitch.
- Decodificación causal con streaming por chunks.
- Control de número de codebooks usados (`nq`, mínimo 3) para ajustar calidad/bitrate.
- Ajuste del pitch al rango vocal de un hablante de referencia mediante `speaker_ref` (requiere `torchcrepe`).
- Uso del decodificador de forma aislada (`NanoDecoderV2().from_codes(codes)`).
- Interfaz CLI (`codec_fast.py`) y API Python (`ECodecFast`).
- No soporta tool calling, agentes ni razonamiento: es un códec, no un LLM.
- Capacidad multilingüe: no disponible; declarado para ruso.

## Casos de uso

- Tokenización de audio para modelos de lenguaje de audio: el códec convierte voz en secuencias discretas de 10 codebooks a 21,53 Hz, un régimen de baja trama adecuado para alimentar un LLM de audio que genere o manipule habla.
- Reconstrucción de voz en pipelines TTS: integrado tras un modelo generador de códigos, el decodificador NSF produce audio a 24 kHz con pitch controlado por bins, evitando la deriva tonal del decodificador v1.
- Streaming de voz de baja latencia: la decodificación causal por chunks permite emitir audio conforme llegan los códigos, útil en asistentes conversacionales y agentes de voz en tiempo real.
- Compresión y almacenamiento de voz: representar el audio como `[10, T]` a 21,53 Hz reduce el volumen de datos frente al PCM y facilita el almacenamiento y la transmisión de corpus de habla.
- Ajuste de timbre por hablante: con `speaker_ref` y `torchcrepe` se restringe el rango de pitch al de un hablante concreto, útil en clonación de voz o doblaje donde se requiere consistencia tonal.
- Investigación en códecs neuronales: al estar separado del TTS y con código mínimo (torch, torchaudio, numpy), sirve como banco de pruebas para comparar RVQ, destilación post-VQ y decodificadores NSF.
- Preprocesado de datasets de voz para entrenamiento: la codificación bit-a-bit reproducible (fijando `torch.manual_seed` por el ruido del NSF) permite generar tokens consistentes para entrenar modelos downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos suman aproximadamente 716 MB en disco en fp16 (398 + 181 + 56 + 81 MB), con cálculo en fp32.
- GPU recomendadas: no especificadas por el autor; el código admite `device="cuda"` o `device="cpu"`.
- Cabe en GPU de consumo: por el tamaño de los pesos (inferior a 1 GB en fp16), es plausible en GPUs consumer, aunque no se confirma en la información disponible.
- Opciones de despliegue: uso directo con PyTorch (`ecodec_fast`), CLI `codec_fast.py`, y variables de entorno `ECODEC_WEIGHTS` y `ESP_POSTVQ`/`ESP_POSTVQ_TEACHER`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento frente a otros códecs neuronales.

## Limitaciones y advertencias

- El modelo está declarado únicamente para ruso; el comportamiento en otros idiomas no está documentado.
- La licencia es "other" sin texto de licencia en la información disponible: es imprescindible revisar los términos antes de uso comercial.
- El decodificador NSF incorpora ruido en la fuente, por lo que la salida no es determinista salvo que se fije `torch.manual_seed` tras cargar el decodificador.
- El teacher post-VQ (109 M) no está incluido en el repositorio; solo se distribuye el estudiante destilado.
- Requiere al menos 3 codebooks (`nq >= 3`) para decodificar; con menos no funciona.
- El ajuste de pitch por hablante depende de `torchcrepe`, una dependencia adicional.
- No hay datos publicados de benchmarks, sesgos ni evaluaciones de calidad objetiva (MOS, WER de reconstrucción).
- Al ser un códec, no razona ni genera contenido: cualquier expectativa de capacidades de LLM es inaplicable.
- Riesgo de artefactos o pérdida de calidad en la reconstrucción a 24 kHz respecto a la entrada a 44,1 kHz, inherente al diseño.

## Enlaces

- Hugging Face: https://huggingface.co/ESpeech/ECodec-FAST
- Modelo TTS del que se extrae: https://huggingface.co/ESpeech/ESpeech-V9-ECodec-FAST
- vocos (origen del `ISTFTHead`, MIT): https://github.com/gemelo-ai/vocos
