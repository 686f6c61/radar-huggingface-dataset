# FluidInference/lfm3-audio-2b-coreai

## Resumen

FluidInference/lfm3-audio-2b-coreai es un paquete de despliegue del modelo LiquidAI/LFM3-Audio-2B, no un modelo entrenado desde cero. Concretamente, exporta el backbone del modelo de lenguaje de LFM3-Audio-2B a formato Core AI (`.aimodel`, macOS 27 / iOS 27) y lo cuantiza para su ejecución en Apple Silicon, junto con el decodificador de profundidad para síntesis de voz (TTS). El objetivo es permitir ASR y TTS totalmente en dispositivo dentro del framework FluidAudio, con el códec y el codificador de LiveASR permaneciendo en Core ML y ejecutándose en la Neural Engine.

El modelo base, LFM3-Audio-2B, es un modelo de audio de Liquid AI con un backbone de 2048 dimensiones y 24 capas. Esta variante concreta resuelve el problema de llevar ese modelo a producción en el ecosistema Apple sin depender de servidores: el backbone se exporta a Core AI con cuantización asimétrica uint8 por bloques de 32, manteniendo las capas 20-23 en fp16 para preservar la fidelidad de los códigos de habla en TTS.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización específica para audio generativo (el int8 plano es aceptable en ASR pero degrada demasiado los códigos en TTS). Por otro, ofrece datos de paridad y rendimiento medidos en un Apple M5 Pro que permiten evaluar si el despliegue en dispositivo es viable para un caso de uso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone LFM3 de 2048 x 24 capas) exportado a Core AI; decodificador de profundidad MaskGIT en fp16 |
| Parametros totales | no disponible (el repo ocupa 2,4 GB; el backbone cuantizado pesa 2,16 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | uint8 asimetrico con block size 32; capas 20-23 en fp16; decodificador de profundidad en fp16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), con restriccion para organizaciones con ingresos anuales >= 10 M USD |
| Formato de pesos | `.aimodel` (Core AI bundle); el codificador de audio y el codec en Core ML (repo separado) |

## Arquitectura y entrenamiento

El modelo base es LFM3-Audio-2B de Liquid AI, del que esta ficha solo cubre la exportación. El backbone tiene 2048 dimensiones y 24 capas, y en el bundle Core AI recibe `inputs_embeds` con tres entrypoints: `prefill` (actualización de estado), `main` (logits de la última fila) y `hidden` (hidden final tras la normalización, para frames de habla). Mantiene estados `keyCache`, `valueCache` y `convStates`, lo que sugiere atención con caché KV y algún componente convolucional de estado.

El decodificador de profundidad es un MaskGIT en fp16 que FluidAudio ejecuta mediante `depth_frame`: tres pasadas más penalización de presencia, temperatura, top-k 128 y Gumbel-max en una sola llamada por frame de habla, con entradas `h`, `sched` [3, 12], `noise`/`present` [12, 2017] y `params`, y salida `codes` [12]. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO; esos datos corresponden a la model card del modelo base, no incluida aquí. La innovación técnica destacable es la estrategia de cuantización: int8 plano (por canal o por bloque) es suficiente para ASR, pero invierte demasiados códigos de habla en TTS, por lo que las últimas capas se mantienen en fp16.

## Capacidades

- Reconocimiento automático de habla (ASR) offline sobre audio completo.
- ASR en streaming o LiveASR con piezas de 160 ms.
- Síntesis de voz (TTS) a partir de texto, con decodificador de profundidad MaskGIT.
- Ejecución totalmente en dispositivo en Apple Silicon (macOS 27 / iOS 27).
- Integración con FluidAudio mediante `LFM3AudioManager` y `backend: .coreAI`.
- El códec y el codificador de LiveASR se ejecutan en la Neural Engine vía Core ML.
- Soporte de tool calling, agentes, visión o audio de entrada adicional: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).

## Casos de uso

- Transcripción de reuniones en local: el modelo procesa audio completo con un WER de 1,32 % en LibriSpeech test-clean y un RTFx de 24,6, lo que permite transcribir 901 s de audio en aproximadamente 37 s en un M5 Pro, sin enviar datos a la nube.
- Subtitulado en tiempo real: con LiveASR sobre piezas de 160 ms y un RTFx de 13,3, es adecuado para generar subtítulos con latencia baja en aplicaciones de accesibilidad.
- Asistentes de voz en apps iOS: la síntesis con primer audio a 37 ms (mediana) y un round-trip WER de 2,5 % permite respuestas habladas naturales en un asistente integrado.
- Dictado por voz en macOS: el ASR en dispositivo evita depender de conectividad y cumple requisitos de privacidad para aplicaciones que manejan datos sensibles.
- Lectura de textos largos (TTS): el modelo sintetiza frases con una calidad verificada por round-trip, útil para lectores de pantalla o audiolibros ligeros.
- Prototipado de pipelines de audio en Apple Silicon: al estar empaquetado como bundle Core AI con paridad medida frente al modelo fp32, sirve para validar arquitecturas de ASR/TTS antes de invertir en infraestructura de servidor.
- Evaluación de cuantización en audio generativo: la comparativa entre int8 plano y uint8 con capas finales en fp16 es un caso práctico para estudiar el impacto de la cuantización en códecs de habla.

## Benchmarks y rendimiento

Datos medidos en Apple M5 Pro (24 GB), macOS 27.0, build release de FluidAudio, con tiempo de pared incluyendo warm-up tras la carga.

| Tarea | Datos | Resultado |
|---|---|---|
| ASR offline | LibriSpeech test-clean, primeras 100 utterances (901 s) | WER 1,32 %, RTFx 24,6 (LM Core ML: 18,4); 98/100 transcripciones idénticas al modelo original |
| LiveASR (piezas de 160 ms) | LibriSpeech test-clean, primeras 20 utterances | WER 1,46 %, RTFx 13,3 (LM Core ML: 10,4) |
| TTS (decodificador Core AI) | 20 frases (71 s de habla) | RTFx 5,07, primer audio 37 ms (mediana), WER round-trip con Parakeet 2,5 % (backend Core ML: RTFx 4,3-4,5) |

Paridad frente al modelo fp32 original:

| Comprobación | Resultado |
|---|---|
| ASR, 20 clips dorados de LibriSpeech (greedy) | 18/20 idénticos a nivel de token (2 difieren en una coma), WER 1,46 % = original |
| TTS, 319 frames de habla con teacher forcing | coseno del hidden del LM mínimo 0,99988 / medio 0,999985; códigos 98,35 % idénticos (referencia fp32) |
| Decodificador de profundidad `depth_frame`, 319 frames dorados | códigos 99,40 % idénticos; 3,24 ms por frame en GPU |

Memoria pico en ASR: 1,9 GB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo de audio.

## Requisitos de hardware

- VRAM/unificada estimada: el backbone cuantizado ocupa 2,16 GB y el decodificador 208 MB; la memoria pico medida en ASR es de 1,9 GB. La caché de especialización del grafo ocupa unos 3,3 GB en `~/Library/Caches/coreai-cache`.
- GPU recomendadas: Apple Silicon con macOS 27 o iOS 27. Las mediciones se realizaron en un Apple M5 Pro de 24 GB.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no está pensado para GPU NVIDIA ni AMD.
- Opciones de despliegue: FluidAudio con `backend: .coreAI` (Swift); el códec y el codificador de LiveASR requieren Core ML. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTFx 24,6 en ASR offline, 13,3 en LiveASR y 5,07 en TTS; 3,24 ms por frame en el decodificador de profundidad; primer audio TTS a 37 ms (mediana).
- Nota de implementación: FluidAudio carga un `AIModel` por entrypoint compartiendo estados; con un único `AIModel` compartido, macOS 27.0 aborta en `GPUMemrefOps` al reutilizar funciones con formas consecutivas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FluidInference/lfm3-audio-2b-coreai | no disponible (repo 2,4 GB) | no disponible | ASR + TTS en dispositivo, Core AI | LFM Open License v1.0 | Hugging Face, macOS 27 / iOS 27 |
| FluidInference/lfm3-audio-2b-coreml | mismo modelo base | no disponible | ASR + TTS en dispositivo, Core ML | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-Audio-2B | 2B (según nombre) | no disponible | Modelo de audio original en fp32 | LFM Open License v1.0 | Hugging Face |

La comparación relevante es frente a la variante Core ML del mismo autor: el backend Core AI mejora el RTFx de ASR de 18,4 a 24,6 y el de TTS de 4,3-4,5 a 5,07, con paridad de precisión prácticamente total. No se dispone de comparación con modelos de ASR/TTS de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo base LiquidAI/LFM3-Audio-2B y los componentes de FluidInference/lfm3-audio-2b-coreml (códec y codificador).
- Dependencia estricta de plataforma: macOS 27 / iOS 27 y Apple Silicon; no hay ruta para GPU NVIDIA, AMD ni CPU genérica.
- La licencia LFM Open License v1.0 exige licencia separada de Liquid AI para organizaciones con ingresos anuales de 10 M USD o más.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no disponible; no se puede planificar para audio de duración arbitraria sin validación empírica.
- Los benchmarks se limitan a LibriSpeech test-clean (inglés, dominio acotado) y a 20 frases de TTS; no hay evaluación en dominios ruidosos, acentos o audio espontáneo.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- La cuantización uint8 con capas finales en fp16 es un compromiso: en TTS, int8 plano invierte demasiados códigos de habla, por lo que reducir más la precisión degradará la calidad.
- La caché de especialización del grafo (~3,3 GB) puede purgarse bajo presión de almacenamiento, lo que obliga a recargar; hay que gestionarla explícitamente con `LFM3AudioModels.clearCoreAICache()`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez de adopción muy baja.

## Enlaces

- Hugging Face: https://huggingface.co/FluidInference/lfm3-audio-2b-coreai
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Componentes Core ML: https://huggingface.co/FluidInference/lfm3-audio-2b-coreml
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- Issue FluidAudio #49: https://github.com/FluidInference/FluidAudio/issues/49#issuecomment-6501658263
- Pull request FluidAudio #1076: https://github.com/FluidInference/FluidAudio/pull/1076
- Commit inicial: https://huggingface.co/FluidInference/lfm3-audio-2b-coreai/commit/e89ebdabaf2bd52044d753e8c87f9579d5520b72
- Commit del decodificador: https://huggingface.co/FluidInference/lfm3-audio-2b-coreai/commit/6dc374f303e5f04cc6bbc4bd044cdd800b065818
