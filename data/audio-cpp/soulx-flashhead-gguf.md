# audio-cpp/SoulX-FlashHead-GGUF

## Resumen

SoulX-FlashHead Lite GGUF es el empaquetado en formato GGUF del modelo SoulX-FlashHead-1_3B de Soul-AILab, orientado a la generación de vídeo de retrato parlante (talking-head) en streaming a partir de una imagen de referencia y una pista de audio de voz. El empaquetado lo mantiene el proyecto audio.cpp, un runtime en C++ para modelos de audio, que integra el modelo con backend GGML y soporte opcional de cuDNN para acelerar la inferencia en CUDA.

El modelo resuelve el problema de la animación facial audio-a-vídeo con latencia baja: procesa el audio en fragmentos de 0,96 segundos y emite 24 fotogramas RGB24 por fragmento a 25 FPS, manteniendo continuidad de movimiento entre fragmentos. La arquitectura combina un DiT (Diffusion Transformer) con un VAE de vídeo LTX y un codificador de voz Wav2Vec2, con un total de 2.040.429.105 parámetros.

Es relevante para desarrolladores que necesitan integrar avatares parlantes en pipelines locales sin depender de servicios en la nube, gracias a su licencia Apache 2.0 y a la disponibilidad de pesos en GGUF que permiten despliegue en C++ con backends Vulkan o CUDA. El repositorio incluye únicamente la variante Lite, con pesos en Q8_0 y BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) + VAE de vídeo LTX + codificador Wav2Vec2 |
| Parámetros totales | 2.040.429.105 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (DiT), BF16 (DiT y VAE), F32 (Wav2Vec2) |
| Idiomas soportados | no disponible (el audio de entrada es voz; demo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se compone de tres bloques: un DiT que actúa como generador de difusión para los fotogramas, un VAE de vídeo LTX que codifica y decodifica el espacio latente visual, y un codificador de voz Wav2Vec2 (facebook/wav2vec2-base-960h) que extrae las representaciones del audio de entrada. La generación es por difusión con cuatro pasos de denoising por defecto, y el pipeline procesa el audio en fragmentos de 0,96 segundos con continuidad de movimiento entre fragmentos consecutivos.

El empaquetado GGUF incluye configuración y contrato de modelo embebidos. El checkpoint upstream corresponde a la revisión `5fbd2e44ba08ab2deb28bd55cff2c15523e51ba5` de Soul-AILab/SoulX-FlashHead-1_3B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de vídeo de retrato parlante (talking-head) a partir de una imagen de referencia y audio de voz.
- Generación en streaming con fragmentos de audio de 0,96 segundos y continuidad de movimiento entre fragmentos.
- Salida de 24 fotogramas RGB24 por fragmento a 25 FPS, con resolución por defecto de 512×512.
- Generación con difusión de cuatro pasos de denoising configurables.
- Procesamiento de audio mono a 16 kHz; el modo offline remezcla y convierte la entrada cuando es necesario.
- Integración con el runtime audio.cpp mediante CLI (`audiocpp_cli`) con backends CUDA y Vulkan.
- Soporte opcional de cuDNN para el VAE en CUDA, con aproximadamente el doble de velocidad en inferencia en caliente y menor VRAM pico.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas más allá del audio de entrada.

## Casos de uso

- Avatares parlantes para atención al cliente: el modelo puede animar un retrato de referencia con la voz sintetizada o grabada de un agente, generando vídeo en streaming con latencia baja gracias al procesamiento en fragmentos de 0,96 segundos.
- Generación de contenido para redes sociales: a partir de una foto y una narración de audio se obtiene un vídeo de retrato parlante a 512×512 y 25 FPS, adecuado para piezas cortas sin necesidad de estudio de grabación.
- Doblaje y localización de vídeo: sustituir la pista de audio de un presentador por otra voz manteniendo la imagen de referencia, con continuidad de movimiento entre fragmentos para evitar saltos visuales.
- Asistentes virtuales embebidos: integración en aplicaciones C++ mediante audio.cpp y backend Vulkan o CUDA, sin depender de APIs en la nube, con licencia Apache 2.0 para uso comercial.
- Prototipado de investigación en generación audio-a-vídeo: el empaquetado GGUF con Q8_0 y BF16 permite comparar precisiones y medir RTF y VRAM pico en distintas GPUs.
- Presentadores sintéticos para formación o documentación: generar vídeos explicativos con un retrato fijo y narración de audio, procesando la pista completa en modo offline o en streaming.
- Demos interactivas de baja latencia: el modo streaming con chunks de 0,96 segundos y RTF en caliente de 0,215 con cuDNN en RTX 5090 permite animar un retrato en tiempo casi real.

## Benchmarks y rendimiento

Rendimiento medido en audio.cpp sobre RTX 5090 con el paquete Q8, salida 512×512, cuatro pasos de denoising y la demo en inglés de 42,24 segundos (44 fragmentos de streaming), build de depuración y ocho hilos de CPU:

| Implementación del VAE | RTF en caliente ↓ | RTF de ejecución completa ↓ | VRAM pico |
|---|---:|---:|---:|
| cuDNN (recomendado) | 0,215 | 0,430 | 5.168 MiB |
| GGML (por defecto) | 0,490 | 0,706 | 9.152 MiB |

El RTF es el tiempo de generación dividido por la duración del vídeo; cuanto menor, más rápido. El RTF en caliente cubre el pipeline completo de codificador de audio, DiT, VAE, corrección de color y salida RGB, excluyendo los dos primeros fragmentos y la serialización de artefactos de la CLI. El RTF de ejecución completa incluye además la inicialización, los fragmentos en frío y la serialización de artefactos. Ambos excluyen la carga del modelo y la codificación MP4. El VAE con cuDNN usa activaciones F16 con acumulación F32.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 5.168 MiB en pico con VAE cuDNN y Q8 en RTX 5090; 9.152 MiB en pico con la ruta GGML por defecto.
- GPU recomendadas: RTX 5090 para el rendimiento medido; se recomienda una GPU NVIDIA con soporte CUDA y cuDNN para aprovechar la ruta acelerada. No se proporcionan datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, con el paquete Q8 y la ruta cuDNN (unos 5,2 GiB de VRAM pico); la ruta GGML requiere aproximadamente 9,2 GiB.
- Opciones de despliegue: `audiocpp_cli` del runtime audio.cpp con backends CUDA o Vulkan; para CUDA con cuDNN es necesario compilar desde fuente con `-DGGML_CUDA_CUDNN_CONV3D=ON` y seleccionar `--session-option 'soulx_flashhead.exec_plan={"vae":{"impl":"cudnn"}}'`. Los binarios precompilados no incluyen soporte cuDNN.
- Latencia y throughput: RTF en caliente de 0,215 y RTF de ejecución completa de 0,430 con cuDNN; RTF en caliente de 0,490 y de ejecución completa de 0,706 con GGML. Salida de 24 fotogramas por fragmento a 25 FPS.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. El modelo upstream SoulX-FlashHead-1_3B de Soul-AILab es la referencia directa, del que este repositorio es un empaquetado GGUF para audio.cpp.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SoulX-FlashHead Lite GGUF (este) | 2.040.429.105 | no disponible | Apache 2.0 | GGUF | HuggingFace (audio-cpp) |
| SoulX-FlashHead-1_3B (upstream) | no disponible | no disponible | no disponible | no disponible | HuggingFace (Soul-AILab) |

## Limitaciones y advertencias

- El repositorio incluye únicamente la variante Lite; no se empaquetan otras variantes del modelo upstream.
- Los binarios precompilados de audio.cpp no incluyen soporte cuDNN; sin compilación desde fuente con cuDNN, la inferencia CUDA es aproximadamente 2× más lenta y consume más VRAM.
- El rendimiento medido corresponde a una RTX 5090 con build de depuración y ocho hilos de CPU; no se garantizan los mismos valores en otros hardware o builds.
- La salida por defecto es 512×512 con cuatro pasos de denoising; no se documentan resoluciones o calidades superiores.
- El audio de entrada en streaming debe ser mono a 16 kHz; el modo offline remezcla y convierte, lo que puede introducir artefactos.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del modelo; la demo disponible es en inglés.
- La licencia Apache 2.0 permite uso comercial, pero la arquitectura y los pesos son de Soul-AILab y la integración C++ de audio.cpp; conviene revisar las condiciones del proyecto upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del empaquetado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/audio-cpp/SoulX-FlashHead-GGUF
- Modelo upstream: https://huggingface.co/Soul-AILab/SoulX-FlashHead-1_3B/tree/5fbd2e44ba08ab2deb28bd55cff2c15523e51ba5
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Documentación de uso y conversión: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/soulx_flashhead.md
- Repositorio upstream SoulX-FlashHead: https://github.com/Soul-AILab/SoulX-FlashHead
- Codificador de voz Wav2Vec2: https://huggingface.co/facebook/wav2vec2-base-960h
- Demo en inglés: https://huggingface.co/audio-cpp/SoulX-FlashHead-GGUF/resolve/main/demo/english.mp4
- Audio de entrada de la demo: https://huggingface.co/audio-cpp/SoulX-FlashHead-GGUF/resolve/main/demo/english.wav
- Retrato de referencia de la demo: https://huggingface.co/audio-cpp/SoulX-FlashHead-GGUF/resolve/main/demo/portrait.png
