# matbee/LFM2.5-Audio-1.5B-ONNX-Vulkan

## Resumen

LFM2.5-Audio-1.5B-ONNX-Vulkan es una adaptación del modelo de audio LFM2.5-Audio-1.5B de Liquid AI, preparada por el usuario matbee para ejecutarse sobre el runtime Vulkan `onnx-vulkan-rs`. El modelo original es un sistema multimodal de audio que combina reconocimiento de voz (ASR), síntesis de voz (TTS) y conversación intercalada de texto y audio en un único modelo compacto de 1.500 millones de parámetros. Esta versión concreta se ha optimizado para reducir el uso de memoria en dispositivos como la Steam Deck, manteniendo la compatibilidad byte a byte con el release oficial de ONNX de Liquid AI.

La relevancia de esta adaptación radica en que permite ejecutar un modelo de audio completo con razonamiento integrado en hardware de consumo, sin depender de servicios en la nube. Al cuantizar la capa final `lm_head` a q4 simétrico y convertir las tablas de embeddings a bfloat16 nativo, se reduce el peso total del bundle de 3,55 GiB a aproximadamente 2,5 GiB, lo que facilita su despliegue en dispositivos con memoria gráfica limitada. El modelo mantiene la fidelidad de salida respecto al original, como se demuestra en las pruebas de paridad bit a bit realizadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de audio, decoder de lenguaje, detokenizador de audio y vocoder Depthformer (arquitectura completa no documentada) |
| Parametros totales | 1.500 millones (según nombre del modelo, no verificado en la documentación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4 simétrico (MatMulNBits, block_size=32) para capas GEMM y lm_head; tablas de embeddings en bfloat16 nativo |
| Idiomas soportados | No disponibles (el modelo original soporta multilingüe, pero no se especifica lista) |
| Licencia | LFM Open License v1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | ONNX (archivos `.onnx` y `.onnx_data`) con pesos en ficheros binarios separados |

## Arquitectura y entrenamiento

La arquitectura de LFM2.5-Audio-1.5B se basa en un transformer de lenguaje con un codificador de audio y un detokenizador de audio propio, junto con un vocoder Depthformer para síntesis de forma de onda. El modelo está diseñado para procesar secuencias intercaladas de texto y audio en una sola pasada, lo que permite tareas de ASR, TTS y diálogo de voz con razonamiento integrado. La variante ONNX-Vulkan exporta todos los componentes (decoder, audio encoder, audio detokenizer, vocoder) como grafos ONNX separados que se ejecutan en el runtime Vulkan.

El entrenamiento original no se detalla en la documentación de esta adaptación, pero el modelo se basa en el trabajo de Liquid AI, que emplea técnicas de entrenamiento con datos de audio y texto intercalados. La conversión a ONNX se realizó sobre el release oficial `LiquidAI/LFM2.5-Audio-1.5B-ONNX`, manteniendo los ficheros originales byte a byte excepto dos reducciones de memoria: la cuantización q4 del `lm_head` (que era el único componente en f32 de la capa final) y la conversión de las tablas de embeddings de f32 a bfloat16 nativo, que resultan bit-exactas respecto al checkpoint original.

## Capacidades

- Generación de voz natural (TTS) a partir de texto, con calidad de síntesis comparable a modelos dedicados.
- Reconocimiento automático de voz (ASR) de audio a texto, con soporte multilingüe (idiomas no especificados).
- Conversación intercalada: acepta entradas de audio y texto en cualquier orden y genera respuestas en audio o texto, permitiendo diálogos de voz completos.
- Razonamiento integrado: el modelo incluye una base de razonamiento completa, lo que permite responder preguntas complejas dentro de la conversación de voz.
- Tool calling: no disponible en la documentación de esta adaptación, aunque el modelo original podría soportarlo (no confirmado).
- Capacidad de ejecución en GPU Vulkan: optimizado para hardware de consumo como la Steam Deck, con cuantización q4 en todas las capas GEMM.

## Casos de uso

- Asistente de voz en dispositivos portátiles: el modelo puede ejecutarse localmente en una Steam Deck o similar para proporcionar un asistente conversacional de voz sin conexión, con latencia de respuesta en torno a 0,72-0,95 RTF (tiempo de decodificación real).
- Transcripción de reuniones y notas: con ASR integrado, se puede transcribir audio en tiempo real a texto, aprovechando la ventana de contexto (no especificada) para conversaciones largas.
- Síntesis de voz para accesibilidad: el TTS permite generar audios naturales para aplicaciones de lectura de pantalla o narración, con control de tono y ritmo mediante el vocoder.
- Chat de voz en videojuegos o aplicaciones de entretenimiento: la conversación intercalada permite al jugador hablar con NPCs o compañeros de equipo, con respuestas generadas en voz.
- Traducción de voz a voz: combinando ASR y TTS en el mismo modelo, se puede traducir un discurso de un idioma a otro sin necesidad de un pipeline externo.
- Prototipado de interfaces de voz: desarrolladores pueden integrar el modelo en aplicaciones de escritorio o móviles mediante el runtime Vulkan, probando flujos de conversación sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor de la adaptación proporciona validaciones propias:

- Paridad CPU: 4/4 prompts con resultados bit idénticos al modelo original con lm_head f32.
- Paridad GPU: 14/14 casos de prueba superados, con cinco turnos de TTS con decode_rtf entre 0.72 y 0.95, y una mejora en el tiempo de generación de un turno (12.5 s → 10.9 s).
- Validación de cuantización: error máximo de 0.023 frente al checkpoint bf16, por debajo de medio paso de cuantización (0.0306).

Estos datos son específicos de la adaptación y no se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada: el bundle completo (dual role) ocupa ~2.5 GiB en disco; en memoria, la cuantización q4 y las tablas bf16 reducen el consumo respecto al original. Se estima que requiere al menos 3-4 GiB de VRAM para inferencia completa, dependiendo de la resolución de audio.
- GPU recomendadas: cualquier GPU compatible con Vulkan 1.2, incluyendo la iGPU de la Steam Deck (AMD Van Gogh), NVIDIA GTX 10xx o superior, AMD RX 5000 o superior, y GPUs Intel integradas recientes.
- Se puede ejecutar en hardware de consumo de gama baja-media, siendo el objetivo principal la Steam Deck.
- Opciones de despliegue: el runtime específico es `onnx-vulkan-rs` (fork de matbeedotcom), con un multiplexor de decodificador para el rol dual. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia: en la prueba GPU, el tiempo de decodificación por turno TTS varía entre 10.9 s y 12.5 s (para turnos de audio de duración no especificada), con un factor de real-time (RTF) de 0.72-0.95.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de audio del mismo tamaño. Como referencia, el modelo original LFM2.5-Audio-1.5B se posiciona como un modelo compacto que integra TTS/ASR en un solo modelo, frente a alternativas que suelen combinar componentes separados (por ejemplo, Whisper para ASR + Tortoise o VITS para TTS). No se pueden dar cifras de rendimiento de estas alternativas.

## Limitaciones y advertencias

- Licencia: la licencia es "other" (LFM Open License v1.0). No se especifican los términos exactos de uso comercial; se debe consultar el texto de la licencia en el repositorio original de Liquid AI.
- Sesgos: al ser un modelo de voz, puede presentar sesgos en el reconocimiento de acentos o dialectos, aunque no hay datos específicos.
- Riesgo de alucinación: en la síntesis de voz, el modelo puede generar contenido no solicitado o errores en la transcripción, especialmente en ruido o habla superpuesta.
- Limitaciones de idioma: no se ha documentado la lista de idiomas soportados, por lo que la cobertura multilingüe no está confirmada.
- Dependencia del runtime Vulkan: la adaptación solo funciona con el fork específico `onnx-vulkan-rs-edge`; no es compatible con otros runtimes ONNX sin modificaciones.
- El repositorio no incluye el rol "instruct" (solo el rol "audio" del bundle dual); para tareas de instrucción general, se necesita el repositorio hermano.
- La cuantización del lm_head q4 puede degradar ligeramente la calidad en tareas de generación de texto de precisión, aunque la validación muestra paridad bit a bit en los prompts probados.

## Enlaces

- Repositorio de la adaptación: https://huggingface.co/matbee/LFM2.5-Audio-1.5B-ONNX-Vulkan
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- Exportación ONNX oficial: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B-ONNX
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-audio-1.5b
- Modelo en ModelScope: https://www.modelscope.cn/models/LiquidAI/LFM2.5-Audio-1.5B-ONNX
