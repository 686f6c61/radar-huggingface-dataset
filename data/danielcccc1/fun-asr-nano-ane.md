# DanielCCCC1/Fun-ASR-Nano-ANE

## Resumen

Fun-ASR-Nano-ANE es una conversión comunitaria a Core ML del codificador y el adaptador del modelo de reconocimiento de voz Fun-ASR-Nano, publicado originalmente por Tongyi Lab / FunAudioLLM. El paquete no contiene el modelo completo: únicamente exporta la parte del encoder que se ejecuta sobre la Apple Neural Engine (ANE) de los chips Apple Silicon, mientras que el decodificador Qwen3 de 0,6 mil millones de parámetros en cuantización Q4_K_M sigue ejecutándose mediante llama.cpp sobre Metal. Está pensado para integrarse en Stet, una implementación de transcripción local, y no funciona como reconocedor de voz autónomo.

La relevancia del artefacto es de ingeniería más que de modelado: demuestra cómo desacoplar el codificador acústico de un ASR moderno para acelerarlo por hardware en equipos de consumo, manteniendo el decodificador en un runtime GGUF ya existente. El repositorio distribuye los `.mlpackage` de origen (sin `.mlmodelc` específicos de dispositivo), un `manifest.json` con hashes SHA-256 por fichero y cuatro buckets de longitud (64, 128, 256 y 512 frames) que Stet compila localmente en el momento de la instalación.

No se realizó entrenamiento ni ajuste fino alguno: la conversión solo cambia el formato de ejecución y la disposición del grafo. El paquete ocupa aproximadamente 0,5 GB y está validado de forma limitada en un M4 Pro con macOS 27.2, sin pruebas de precisión sobre corpus amplios ni despliegue en otras variantes de chip.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder y adaptador de Fun-ASR-Nano exportados a Core ML; decodificador Qwen3-0.6B separado (GGUF Q4_K_M) |
| Parámetros totales | No disponible (el encoder no declara recuento; el decodificador asociado es de 0,6 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Buckets de frames de audio de 64, 128, 256 y 512 |
| Tipos de cuantización | Decodificador en Q4_K_M (GGUF); encoder exportado en Core ML sin cuantización declarada |
| Idiomas soportados | Chino (zh), inglés (en), japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` (Core ML) para el encoder; GGUF para el decodificador |

## Arquitectura y entrenamiento

El encoder emplea proyecciones channel-first, convolución depthwise FSMN (Feedforward Sequential Memory Network) y atención por cabeza, según la descripción del autor de la conversión. La interfaz expone tres entradas (`positioned_features`, `valid_mask`, `attention_bias`) y una salida `audio_embeds` con forma `[1, 1024, 1, frames]`. El host asume la responsabilidad del frontend de features, la codificación posicional, las máscaras y el recorte de longitud; el grafo no es intercambiable con un encoder CTC de SenseVoice. El contrato de integración se denomina `nano-gguf-ane-v1-buckets`.

No hubo entrenamiento ni fine-tuning: los pesos provienen de Fun-ASR-Nano-2512 a través de la versión GGUF de FunAudioLLM. La exportación se realizó con coremltools 9.0, torch 2.15.0, gguf 0.19.0 y numpy 2.5.4, con el código de conversión anclado al commit `8a485b4` de Stet. Coremltools advirtió que la versión de torch era más reciente que su rango probado; el autor indica que se ejecutaron comprobaciones de salida real y de runtime tras la exportación. El encoder de origen aceptado tiene SHA-256 `f92f91d0…68de8a2` y el decodificador emparejado `qwen3-0.6b-q4km.gguf` tiene SHA-256 `cc505755…c1e856f22`.

## Capacidades

- Reconocimiento automático de voz (ASR) en chino, inglés y japonés, heredado del modelo base Fun-ASR-Nano.
- Extracción de embeddings acústicos para su consumo por un decodificador Qwen3 externo.
- Ejecución del encoder sobre la Apple Neural Engine, con validación de plan de ejecución que exige al menos el 95 % del coste computacional estimado en ANE cuando hay estimaciones disponibles.
- Preparación por buckets de longitud (64, 128, 256, 512 frames) para adaptar la latencia al tamaño del audio.
- Integración con VAD y con un encoder de respaldo en CPU mediante assets GGUF separados.
- No soporta tool calling, function calling, agentes, visión ni audio más allá del propio pipeline ASR.
- No dispone de API independiente de transcripción ni de diarización de hablantes.

## Casos de uso

- Transcripción local en macOS sobre Apple Silicon: Stet usa el encoder en ANE y el decodificador Qwen3 en llama.cpp Metal, de modo que el usuario obtiene ASR sin enviar audio a la nube. Adecuado por el requisito de macOS 15+ y chip Apple Silicon.
- Reuniones y notas de voz en chino, inglés o japonés: los buckets de 256 y 512 frames cubren segmentos más largos, aunque el autor advierte que las reuniones reales largas no han pasado pruebas de aceptación.
- Integración en pipelines de subtitulado offline: el paquete se importa desde el directorio raíz en la configuración de transcripción de Stet, que verifica hashes, compila el `.mlpackage` y activa el encoder solo cuando la transcripción está inactiva.
- Evaluación de aceleración por ANE en proyectos de ASR: sirve como referencia para medir el reparto de cómputo entre encoder (ANE) y decodificador (Metal) en un mismo equipo.
- Desarrollo de builds compatibles de Stet: el PR 236 del repositorio de Stet constituye el punto de integración para quien quiera reproducir o extender la conversión.
- Pruebas de regresión de conversión Core ML: el `manifest.json` con SHA-256 por fichero y el contrato `nano-gguf-ane-v1-buckets` permiten verificar que una recompilación local produce el mismo grafo esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta comprobaciones de ingeniería: seis entradas cortas o derivadas produjeron transcripciones idénticas entre CPU y ANE en el experimento original de runtime, y el candidato final superó instalación local, preparación de los cuatro buckets, comparación de transcripción en chino a través del decodificador sin cambios, desactivación y repreparación. La preparación tardó unos 90 segundos en M4 Pro con macOS 27.2.

## Requisitos de hardware

- Chip Apple Silicon obligatorio; macOS 15 o superior.
- El encoder se ejecuta en la Apple Neural Engine; el decodificador Qwen3-0.6B Q4_K_M se ejecuta en Metal mediante llama.cpp.
- VRAM unificada: el paquete fuente ocupa 468 789 111 bytes (aproximadamente 0,44 GiB) y el repositorio completo unos 0,5 GB, sin contar los assets GGUF de VAD y del encoder de respaldo en CPU, que deben permanecer instalados.
- No está pensado para GPU NVIDIA, AMD ni para CPU x86; no se documentan requisitos para A100, H100 o RTX 4090.
- Despliegue únicamente a través de Stet con la implementación ANE compatible (PR 236); no se contemplan vLLM, TGI, Ollama ni llama.cpp para el encoder.
- La primera preparación puede tardar varios minutos y depende del dispositivo y de las cachés del sistema; no se publican cifras de latencia ni de throughput por frame.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Fun-ASR-Nano-ANE (este) | No disponible (decoder 0,6 B) | Buckets de 64–512 frames | zh, en, ja | Apache-2.0 | Core ML + GGUF | Solo encoder; requiere Stet y Apple Silicon |
| FunAudioLLM/Fun-ASR-Nano-GGUF | No disponible (decoder 0,6 B) | No disponible | zh, en, ja | Apache-2.0 | GGUF | Modelo base completo, ejecutable en CPU/GPU vía llama.cpp |
| FunAudioLLM/Fun-ASR-Nano-2512 | No disponible | No disponible | zh, en, ja | Apache-2.0 | No disponible | Release original de Tongyi Lab / FunAudioLLM |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- No es un reconocedor de voz autónomo: sin el decodificador Qwen3 y los assets GGUF de VAD y encoder CPU no produce transcripciones.
- No es una release oficial de FunAudioLLM; es una conversión comunitaria sin entrenamiento ni ajuste fino.
- Requiere una implementación de Stet aún en revisión (PR 236); las versiones públicas existentes pueden no soportar el paquete.
- Validación limitada: solo M4 Pro con macOS 27.2, seis entradas cortas o derivadas y una comparación de transcripción en chino. No hay pruebas en otras variantes de chip, en la versión mínima de macOS, en instalación por GUI, en reuniones largas reales ni de precisión multilingüe amplia.
- El grafo no es intercambiable con un encoder CTC de SenseVoice, lo que impide reutilizarlo en pipelines ASR distintos de Stet.
- No incluye API de diarización de hablantes ni de transcripción independiente.
- Riesgo de alucinación y sesgos del modelo base no evaluados en esta conversión; no se documentan análisis al respecto.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución a Tongyi Lab / FunAudioLLM según `LICENSE` y `NOTICE`.
- El autor no reclama preparación universal para producción; el paquete se publica como candidato para builds compatibles de Stet.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DanielCCCC1/Fun-ASR-Nano-ANE
- Modelo base GGUF: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-GGUF
- Release original: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Pull request de Stet con la implementación ANE: https://github.com/DengNaichen/Stet/pull/236
- Código de conversión anclado: https://github.com/DengNaichen/Stet/tree/8a485b448def9d751aaea688be2fbabac3b3b406/scripts/funasr-nano-ane
