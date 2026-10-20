# loscrossos/Qwen3-TTS-12Hz-1.7B-VoiceDesign

## Resumen

Qwen3-TTS-12Hz-1.7B-VoiceDesign es un modelo de síntesis de voz (text-to-speech) de la familia Qwen3-TTS, desarrollada por el equipo Qwen de Alibaba. Esta variante concreta, publicada en el repositorio `loscrossos/Qwen3-TTS-12Hz-1.7B-VoiceDesign`, corresponde a la especialización en "voice design": generar una voz a partir de una descripción en lenguaje natural (timbre, emoción, prosodia), en lugar de clonar una referencia de audio o seleccionar un hablante predefinido. El problema que resuelve es el control fino del habla sintetizada sin necesidad de muestras de audio ni de ajuste por hablante.

El modelo emplea una arquitectura end-to-end de LM autorregresivo con múltiples codebooks discretos sobre un tokenizador acústico propio (Qwen3-TTS-Tokenizer-12Hz), con 1.916.676.352 parámetros totales (aproximadamente 1,7B) y pesos en safetensors. Cubre diez idiomas principales —entre ellos el español— y admite generación en streaming con una latencia extremo a extremo declarada de hasta 97 ms.

Su relevancia práctica está en que combina licencia Apache-2.0, un tamaño que cabe en GPU de consumo y control por instrucciones en lenguaje natural, lo que lo hace utilizable en productos de voz interactiva. Conviene señalar que el repositorio analizado es una republicación de un tercero (0 descargas, 0 likes en el momento de la consulta), no el repositorio oficial de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LM autorregresivo end-to-end con múltiples codebooks discretos (discrete multi-codebook LM) sobre el tokenizador acústico Qwen3-TTS-Tokenizer-12Hz |
| Parámetros totales | 1.916.676.352 (≈1,7B) |
| Parámetros activos | No aplica / no disponible (la información no describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors (4,5 GB, consistente con bf16/fp16) |
| Idiomas soportados | 10: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano, más perfiles de voces dialectales |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Librería | qwen-tts |

## Arquitectura y entrenamiento

La familia Qwen3-TTS abandona el esquema clásico de TTS en cascada (texto → fonemas → mel → vocoder) y plantea un modelo end-to-end que predice directamente tokens acústicos discretos organizados en varios codebooks. El tokenizador propio, Qwen3-TTS-Tokenizer-12Hz, comprime el audio a una tasa de 12 Hz y aporta simultáneamente representación acústica eficiente y modelado semántico de alta dimensión. Sobre esa representación, el LM genera la secuencia de tokens que luego se reconstruye como waveform; la card describe este diseño como una forma de evitar los cuellos de botella de información típicos de las arquitecturas en cascada.

El modelo está diseñado para streaming, con síntesis incremental y una latencia extremo a extremo declarada de 97 ms, lo que permite su uso en conversación en tiempo real. El control de timbre, emoción y prosodia se ejerce mediante instrucciones en lenguaje natural (`instruct` en la API de `qwen-tts`). No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre el uso de RLHF, DPO o preferencias humanas.

## Capacidades

- Generación de voz multilingüe en 10 idiomas, incluido el español, con perfiles dialectales adicionales.
- Voice design: creación de una voz nueva a partir de una descripción textual de sus características, sin audio de referencia.
- Control por instrucciones en lenguaje natural sobre timbre, emoción y prosodia (por ejemplo, indicar un tono concreto para una frase).
- Generación en streaming con baja latencia, apta para diálogo en tiempo real.
- Salida de audio sampleado (la API devuelve waveform y sample rate), integrable con `soundfile` para escritura a disco.
- La serie Qwen3-TTS incluye además variantes de clonación de voz (CustomVoice y otras), aunque esta ficha se refiere únicamente a la variante VoiceDesign.
- Tool calling / function calling: no disponible; es un modelo de audio, no un LLM de texto con soporte de herramientas.
- Razonamiento multi-paso o modo "thinking": no disponible.
- Visión o entrada de audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz conversacionales: la generación en streaming con latencia declarada de 97 ms permite respuestas habladas percibidas como inmediatas en atención al cliente o asistentes domésticos, sin esperar a sintetizar la frase completa.
- Audiolibros y narración con dirección artística: el control por instrucciones permite asignar emociones y ritmos distintos por pasaje ("con tono grave y pausado", "con sorpresa") sin regrabar ni disponer de un actor de voz por personaje.
- Diseño de voces de marca: crear un timbre coherente descrito en texto para un producto o campaña, iterando la descripción en lugar de contratar sesiones de locución.
- Locución automática de contenidos editoriales: convertir artículos o boletines en audio multilingüe (español, inglés, francés, alemán, italiano, portugués) desde un mismo pipeline.
- Videojuegos y experiencias interactivas: generación de líneas de diálogo para NPC con variación de emoción por instrucción, reduciendo el banco de audio pregrabado.
- Accesibilidad y lectura de pantalla: síntesis de contenidos largos en castellano con control de prosodia para mejorar la comprensión en usuarios con dificultades lectoras.
- Prototipado rápido de interfaces de voz: al estar empaquetado en la librería `qwen-tts` y licenciarse en Apache-2.0, se puede integrar en un backend Python con `device_map="cuda:0"` y `torch.bfloat16` sin fricción de licencias.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados en la model card corresponden a la variante Base de la familia, no a esta variante VoiceDesign. Se miden con Word Error Rate (WER, menor es mejor) en el conjunto de test Seed-TTS:

| Modelo | test-zh (WER ↓) | test-en (WER ↓) |
|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 0,77 | 1,24 |

No se han publicado resultados de benchmarks de la variante VoiceDesign (ni WER, ni métricas de similitud de hablante, ni evaluaciones de naturalidad MOS) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 4,5 GB; en bf16/fp16 se puede estimar un consumo de aproximadamente 6-8 GB incluyendo activaciones y buffers de audio (estimación propia a partir del tamaño de pesos, no un dato publicado).
- GPU recomendadas: para desarrollo, RTX 3090, RTX 4090, RTX 4080 o RTX 4060 Ti de 16 GB; para servicio con concurrencia, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 8 GB o más de VRAM en bf16; no se han publicado cifras oficiales mínimas.
- Despliegue: la vía documentada es el paquete oficial `qwen-tts` (`pip install -U qwen-tts`), con `Qwen3TTSModel.from_pretrained` y `attn_implementation="flash_attention_2"`. No se confirma soporte de vLLM, TGI, llama.cpp u Ollama, y no hay pesos GGUF publicados en este repositorio.
- Latencia: 97 ms extremo a extremo en modo streaming, según la model card. Throughput (tokens de audio por segundo, factor de tiempo real bajo concurrencia) no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | ≈1,7B | 10 | Control por instrucciones en lenguaje natural; streaming 97 ms | Apache-2.0 | safetensors + librería `qwen-tts` |
| CosyVoice 2 (0.5B) | ≈0,5B | Multilingüe (zh/en principalmente) | Clonación y control por instrucciones | Apache-2.0 | safetensors, repositorio oficial |
| XTTS-v2 (Coqui) | ≈0,47B | 17 | Clonación zero-shot; sin control por instrucciones | CPML (no comercial) | Pesos públicos; proyecto Coqui discontinuado |
| Fish Speech 1.5 | ≈0,5B | Multilingüe | Clonación zero-shot | CC-BY-NC-SA (no comercial) | Pesos públicos |

La ventaja diferencial de esta variante frente a las alternativas es la combinación de control por descripción textual, licencia Apache-2.0 y latencia de streaming declarada. Los datos de parámetros y licencias de los modelos comparados provienen de sus fichas públicas respectivas; los resultados de calidad no son directamente comparables porque no se han publicado métricas de esta variante VoiceDesign.

## Limitaciones y advertencias

- Repositorio de terceros: `loscrossos/Qwen3-TTS-12Hz-1.7B-VoiceDesign` es una republicación (0 descargas, 0 likes, creada y actualizada el mismo día) y no el repositorio oficial de Qwen; conviene verificar la integridad de los pesos frente a la colección oficial antes de usarlos en producción.
- La model card no documenta el proceso de entrenamiento ni los datos utilizados, por lo que no es posible evaluar sesgos de acento, género o registro presentes en el corpus.
- Riesgo de errores de pronunciación y de prosodia en textos con nombres propios, siglas, números o cambios de idioma dentro de la misma frase; no hay métricas publicadas de WER para esta variante.
- Idiomas: aunque cubre diez lenguas, el español no es la lengua principal de entrenamiento según la documentación disponible; la calidad relativa en castellano frente a chino e inglés no está cuantificada.
- Longitud de contexto y límite de caracteres por generación: no disponibles, lo que impide planificar la segmentación de textos largos con datos oficiales.
- Uso dual de la tecnología de voz: aunque esta variante diseña voces y no clona, la serie incluye clonación; deben aplicarse salvaguardas de consentimiento y trazabilidad si se combinan variantes.
- Licencia Apache-2.0 en este repositorio, pero al ser una copia de terceros se recomienda confirmar la licencia en el repositorio oficial de Qwen antes de un despliegue comercial.
- No hay soporte documentado de cuantización (GGUF/AWQ/GPTQ) ni de servidores de inferencia de alto throughput, lo que limita el escalado horizontal a lo que permita el paquete `qwen-tts`.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/loscrossos/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Colección oficial Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- Colección en ModelScope: https://modelscope.cn/collections/Qwen/Qwen3-TTS
- Blog de presentación: https://qwen.ai/blog?id=qwen3tts-0115
- Paper (arXiv 2601.15621): https://huggingface.co/papers/2601.15621
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-TTS
