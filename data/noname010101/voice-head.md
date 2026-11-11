# Noname010101/voice-head

## Resumen

`voice-head` es un repositorio de pesos publicado por el usuario Noname010101 en Hugging Face que agrupa, sin modificaciones, los componentes de dos stacks de inferencia multimodal: el stack VOICE (reconocimiento de voz con faster-whisper large-v3 y síntesis de voz con OmniVoice) y el stack HEAD (generación de cabeza parlante con SoulX-FlashHead Lite y extracción de características de audio con wav2vec2). No se trata de un modelo entrenado desde cero, sino de un espejo ("plain mirror") de ficheros upstream organizados en la misma estructura de carpetas que espera el código de carga, lo que facilita el despliegue reproducible de un pipeline completo de voz y animación facial.

El repositorio ocupa 15,0 GB e incluye pesos en formato safetensors y binarios CTranslate2, además de ficheros de configuración y tokenizadores copiados byte a byte de las revisiones upstream indicadas (hashes sha256 idénticos a los originales). La licencia es mixta por componente ("mixed-per-component"), con una restricción crítica: los pesos de OmniVoice son CC-BY-NC y no pueden usarse comercialmente.

Su relevancia actual radica en que empaqueta en un único artefacto los cuatro modelos necesarios para construir un asistente conversacional con cara animada (ASR, TTS, generación de vídeo facial y encoder de audio), evitando al desarrollador la tarea de rastrear revisiones concretas y verificar la compatibilidad de layouts entre repositorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixta por componente: CTranslate2 (Whisper large-v3), transformer TTS (OmniVoice), DiT + VAE (SoulX-FlashHead Lite), transformer convolucional (wav2vec2-base) |
| Parametros totales | No disponible (suma de componentes: Whisper large-v3 ~1550 M, OmniVoice no disponible, FlashHead Lite ~1300 M segun nombre del repo, wav2vec2-base ~95 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper large-v3 procesa ventanas de 30 s de audio; contexto de texto de OmniVoice no disponible) |
| Tipos de cuantizacion | No disponible (Whisper en CTranslate2 admite int8/float16 en tiempo de ejecucion; no se documentan variantes pre-cuantizadas en el repo) |
| Idiomas soportados | No disponible en la ficha; Whisper large-v3 upstream soporta multilingue, pero el repo no declara lista de idiomas |
| Licencia | Mixta por componente: Apache-2.0 (Whisper large-v3, wav2vec2, DiT de FlashHead, VAE_Wan), MIT (conversion faster-whisper), CC-BY-NC (OmniVoice, no comercial), Open-RAIL-M (VAE_LTX de LTX-Video 0.9) |
| Formato de pesos | safetensors (OmniVoice, wav2vec2, FlashHead Model_Lite y VAE_LTX), model.bin CTranslate2 (faster-whisper), .pth (VAE_Wan) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo; agrega cuatro componentes con arquitecturas independientes. El primero es `voice/faster-whisper-large-v3`, conversion a CTranslate2 de `openai/whisper-large-v3` realizada por Systran, que implementa un transformer encoder-decoder para reconocimiento de voz con ventanas de 30 segundos. El segundo es `voice/OmniVoice` de k2-fsa, un sistema TTS con su propio tokenizador de audio (`audio_tokenizer/model.safetensors`, 805 MB), cuyos pesos preentrenados derivan de datos como Emilia y están liberados bajo CC-BY-NC.

El stack HEAD lo componen `head/SoulX-FlashHead-1_3B`, un modelo de difusión basado en DiT (variante Lite, 6,1 GB en safetensors) con dos VAE alternativos (VAE_LTX de LTX-Video 0.9, 1,7 GB, y VAE_Wan de Wan2.1, 508 MB), y `head/wav2vec2-base-960h` de Facebook (378 MB), un transformer convolucional preentrenado para representaciones de audio que actúa como extractor de características. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO para ninguno de los componentes; esos datos corresponden a las fichas upstream, no incluidas aquí.

## Capacidades

- Reconocimiento de voz (ASR) multilingüe mediante faster-whisper large-v3, con salida de transcripciones y marcas temporales a nivel de segmento y palabra según la configuración de CTranslate2.
- Síntesis de voz (TTS) mediante OmniVoice, con tokenizador de audio propio para generar waveform a partir de texto.
- Generación de cabeza parlante (talking head) condicionada por audio, mediante SoulX-FlashHead Lite en modo `model_type="lite"`.
- Extracción de representaciones de audio con wav2vec2-base-960h, típicamente usada como condicionamiento o alineamiento en el pipeline de animación facial.
- Integración en un pipeline único ASR → TTS → animación facial, al compartir el repo el layout de carpetas que espera el código de carga.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking" en la información disponible.
- No se documentan capacidades de visión general (el componente FlashHead genera vídeo facial, no comprensión visual).

## Casos de uso

- Asistente conversacional con avatar animado: encadenar faster-whisper para transcribir la entrada del usuario, un LLM externo para la respuesta, OmniVoice para sintetizar la voz y SoulX-FlashHead para generar el vídeo de la cabeza parlante sincronizado con el audio. El repo proporciona los cuatro modelos con el layout exacto que espera el código.
- Subtitulado y transcripción de reuniones: usar `voice/faster-whisper-large-v3` con CTranslate2 para transcribir audio de forma eficiente en CPU o GPU con cuantización int8, aprovechando que el binario ya está convertido y listo para `WhisperModel("voice/faster-whisper-large-v3")`.
- Generación de locuciones para vídeo corporativo: OmniVoice permite sintetizar narración a partir de texto; debe limitarse a entornos no comerciales por la licencia CC-BY-NC de sus pesos.
- Prototipos de investigación en avatares digitales: combinar wav2vec2-base-960h como extractor de features de audio con FlashHead Lite para experimentar con generación de vídeo facial condicionada por voz, usando el VAE_LTX o VAE_Wan según los requisitos de licencia del proyecto.
- Doblaje automático de contenido audiovisual en investigación: pipeline ASR (Whisper) → traducción externa → TTS (OmniVoice) → animación facial (FlashHead), todo con modelos empaquetados en un solo artefacto reproducible.
- Reproducibilidad de experimentos académicos: al fijar revisiones upstream concretas y verificar hashes sha256, el repo sirve como snapshot inmutable para publicaciones que necesiten citar versiones exactas de los pesos.
- Pruebas de integración de servidores TTS/ASR: `omnivoice-server --model voice/OmniVoice` y `WhisperModel(...)` permiten levantar servicios locales de voz sin gestionar descargas individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el stack completo: los pesos suman aproximadamente 15 GB en disco; en memoria, cargar Whisper large-v3 (3,1 GB), OmniVoice (2,45 GB + 0,8 GB de tokenizador), FlashHead Lite (6,1 GB) y wav2vec2 (0,38 GB) requiere del orden de 13-15 GB en float16, más overhead de activaciones y del pipeline de difusión.
- GPU recomendadas: A100 40/80 GB o H100 para ejecutar el pipeline completo con holgura; RTX 4090 (24 GB) es suficiente para cargar todos los componentes en float16, aunque la generación de vídeo con DiT puede consumir VRAM adicional según resolución y número de pasos.
- Consumer GPU: sí cabe en RTX 4090 y, con cuantización int8 de Whisper y carga secuencial de componentes, potencialmente en GPUs de 16 GB; no se documentan requisitos oficiales.
- Opciones de despliegue: `faster-whisper`/CTranslate2 para ASR, `omnivoice-server` para TTS, `diffusers` para FlashHead (el repo declara la librería diffusers) y `transformers` para wav2vec2. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a estos componentes).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voice-head (este repo) | Paquete ASR + TTS + talking head | Suma no disponible (~3B+ entre componentes) | No disponible | Mixta (CC-BY-NC en OmniVoice, Open-RAIL-M en VAE_LTX) | Hugging Face, 0 descargas |
| openai/whisper-large-v3 | ASR | ~1550 M | Ventanas de 30 s | Apache-2.0 | Hugging Face, ampliamente usado |
| Systran/faster-whisper-large-v3 | ASR (CTranslate2) | ~1550 M | Ventanas de 30 s | MIT (conversion) | Hugging Face |
| k2-fsa/OmniVoice | TTS | No disponible | No disponible | CC-BY-NC (pesos) | Hugging Face + GitHub |
| Soul-AILab/SoulX-FlashHead-1_3B | Talking head (DiT) | ~1300 M (Lite) | No aplica | Apache-2.0 (DiT), Open-RAIL-M (VAE_LTX) | Hugging Face |

La comparativa relevante es contra los repositorios upstream individuales: `voice-head` no aporta pesos nuevos ni mejoras de rendimiento, solo empaquetado reproducible. Frente a descargar cada componente por separado, la ventaja es la verificación de hashes y el layout unificado; la desventaja es el tamaño del repo (15 GB) y la mezcla de licencias que obliga a revisar cada componente.

## Limitaciones y advertencias

- Restricción comercial crítica: los pesos de OmniVoice son CC-BY-NC y no pueden usarse en productos comerciales; el propio autor lo advierte explícitamente en la model card.
- VAE_LTX está bajo Open-RAIL-M, no Apache-2.0; su redistribución debe mantener esa licencia y cumplir sus términos de uso.
- El repo no entrena ni modifica nada: cualquier sesgo, alucinación o limitación de los componentes es la de los modelos upstream (Whisper puede alucinar en audio con ruido o silencios largos; los TTS pueden generar prosodia inconsistente).
- No se declaran idiomas soportados en la ficha; la cobertura multilingüe depende de Whisper large-v3 y de OmniVoice, sin garantía documentada en este repo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- El pipeline completo requiere coordinar cuatro modelos con dependencias distintas (CTranslate2, diffusers, transformers, servidor OmniVoice), lo que aumenta la superficie de fallo en despliegue.
- La fecha de creación indicada (2026-11-07) es futura respecto a la mayoría de referencias; conviene verificar la integridad de los hashes antes de confiar en el repo.
- No hay benchmarks publicados en este repo; el rendimiento debe evaluarse por componente contra sus fichas upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Noname010101/voice-head
- Licencias del repo: https://huggingface.co/Noname010101/voice-head/tree/main/LICENSES
- Systran/faster-whisper-large-v3: https://huggingface.co/Systran/faster-whisper-large-v3
- openai/whisper-large-v3: https://huggingface.co/openai/whisper-large-v3
- k2-fsa/OmniVoice (modelo): https://huggingface.co/k2-fsa/OmniVoice
- k2-fsa/OmniVoice (codigo): https://github.com/k2-fsa/OmniVoice
- Soul-AILab/SoulX-FlashHead-1_3B: https://huggingface.co/Soul-AILab/SoulX-FlashHead-1_3B
- facebook/wav2vec2-base-960h: https://huggingface.co/facebook/wav2vec2-base-960h
