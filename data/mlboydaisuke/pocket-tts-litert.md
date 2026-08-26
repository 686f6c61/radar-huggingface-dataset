# mlboydaisuke/Pocket-TTS-LiteRT

## Resumen

Pocket-TTS-LiteRT es una conversión del modelo de síntesis de voz Pocket TTS de Kyutai (~100 millones de parámetros) a grafos LiteRT `CompiledModel` diseñados para ejecutarse íntegramente en la GPU de un teléfono móvil. El modelo original es un sistema de text-to-speech basado en flow-matching sobre latentes continuos de Mimi, que genera audio de 24 kHz a partir de texto en inglés. Esta versión reescribe el pipeline en cuatro grafos sin estado más una orquestación en el host, logrando una ejecución varias veces más rápida que el tiempo real en hardware Snapdragon con GPU Adreno.

La relevancia de esta conversión radica en que permite desplegar un TTS de calidad en dispositivos móviles sin depender de la nube, con una latencia suficientemente baja para aplicaciones interactivas. El autor, mlboydaisuke, ha verificado la fidelidad numérica de la conversión frente a la implementación de referencia, con una correlación de audio de 0.997 y diferencias máximas del orden de 1e-4 en las etapas intermedias. El modelo se distribuye bajo licencia CC-BY-4.0 y está pensado para su uso en Android mediante LiteRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching LM sobre latentes continuos de Mimi (transformer causal de 6 capas y 1024 de ancho + MLP AdaLN de 6 bloques + decodificador Mimi de 20M) |
| Parametros totales | ~100 millones (modelo base Pocket TTS) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 posiciones de KV cache (según la implementación del grafo) |
| Tipos de cuantizacion | fp16 (grafos LiteRT), pesos de embedding en fp16, proyecciones en fp32 |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | LiteRT CompiledModel (tflite) + binarios fp16/fp32 para embeddings y proyecciones |

## Arquitectura y entrenamiento

El modelo base Pocket TTS, desarrollado por Kyutai, es un sistema de flow-matching sobre latentes continuos de 32 dimensiones del codec Mimi. Por cada frame de 12.5 Hz, un transformer causal de 6 capas y 1024 unidades de ancho condiciona un MLP AdaLN de 6 bloques que transforma una muestra gaussiana en el siguiente latente (LSD, un solo paso). Un decodificador Mimi de 20 millones de parámetros (upsampling ConvTranspose ×16, transformer de 2 capas y SEANet) convierte los latentes en audio de 24 kHz.

La conversión a LiteRT reescribe el pipeline en cuatro grafos sin estado: `pt_flowlm_fused` (un paso AR completo con head de flujo fusionado), `pt_flowlm_step` (paso AR con cache KV en host), `pt_flow_head` (head de flujo con embeddings de tiempo horneados) y `pt_mimi_dec_tx` (decodificador Mimi en bloques de 64 frames con solapamiento de 32). El host se encarga de la tokenización con sentencepiece, la proyección de embeddings, el cálculo de RoPE, la gestión de la cache KV y la generación de ruido gaussiano. La única diferencia numérica respecto a la referencia es la sustitución de erf-GELU por un polinomio tanh impar ajustado, con un error máximo de 7.1e-5.

No se dispone de información sobre los datos de entrenamiento originales del modelo Pocket TTS en la documentación proporcionada.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con dos voces predefinidas: alba y marius.
- Ejecución completamente on-device en GPU de teléfono, sin conexión a la nube ni post-procesado.
- Generación de audio de 24 kHz con calidad comparable a la implementación de referencia.
- Soporte de chunking de texto en segmentos de hasta 50 tokens respetando límites de frase.
- Sin clonación de voz: el modelo base es la variante `pocket-tts-without-voice-cloning`, por lo que solo reproduce las voces incluidas.
- Integración con LiteRT (TensorFlow Lite Runtime) para Android, con requisito de versión ≥2.1.5 en GPUs Mali.

## Casos de uso

- Asistente de voz en aplicaciones Android: el modelo puede generar respuestas habladas en tiempo real, con un factor de 5.0× real-time en Snapdragon SM8850, lo que permite conversaciones fluidas sin esperas perceptibles.
- Accesibilidad para personas con discapacidad visual: lectura de textos largos (artículos, mensajes) directamente en el dispositivo, sin necesidad de conexión a internet.
- Audiolibros y narración de contenido: la generación de voz de alta calidad a 24 kHz es adecuada para producir audiolibros de forma local, con la posibilidad de procesar capítulos completos en segundo plano.
- Aplicaciones de aprendizaje de idiomas: al ser un modelo de voz en inglés, puede usarse para practicar pronunciación y comprensión auditiva, con respuestas inmediatas.
- Sistemas de navegación y avisos en vehículos: la baja latencia y el funcionamiento sin conexión permiten integrarlo en sistemas embebidos de automoción.
- Prototipado rápido de productos de voz: los desarrolladores pueden integrar el modelo en aplicaciones móviles para validar experiencias de voz sin depender de APIs externas, reduciendo costes y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, al tratarse de un modelo de síntesis de voz. Sin embargo, la model card incluye mediciones de rendimiento en dispositivo:

| Dispositivo | GPU | Texto | Tiempo de generación | Factor real-time |
|---|---|---|---|---|
| Samsung SM-S942Q (Snapdragon SM8850) | Adreno | 8.2 s de voz (1 chunk, 42 tokens) | 1.63 s | 5.0× |
| Samsung SM-S942Q (Snapdragon SM8850) | Adreno | 13.0 s de voz (3 chunks) | 3.05 s | 4.3× |
| Pixel 8a (Tensor G3) | Mali-G715 | 7.9 s de voz (1 chunk) | 7.7 s | ~1.0× |
| Pixel 8a (Tensor G3) | Mali-G715 | 12.5 s de voz (3 chunks) | 13.1 s | ~1.0× |

Estas cifras son puntos de medición únicos, sujetos a variaciones por dispositivo, temperatura y longitud del texto.

## Requisitos de hardware

- GPU de teléfono compatible con LiteRT (Adreno, Mali) y versión de LiteRT ≥2.1.5 (recomendado 2.1.6 para Mali).
- VRAM estimada: no disponible, pero el modelo tiene ~100M de parámetros y los grafos se ejecutan en fp16, por lo que cabe en la memoria de cualquier GPU móvil moderna.
- No requiere GPU de escritorio; está diseñado para ejecutarse en dispositivos Android.
- Opciones de despliegue: LiteRT CompiledModel en Android (Kotlin/Java) o Python con `ai-edge-litert`.
- Latencia: en Snapdragon SM8850, genera 8.2 s de voz en 1.63 s; en Tensor G3, aproximadamente en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| Pocket-TTS-LiteRT (este) | ~100M | 512 posiciones KV | CC-BY-4.0 | LiteRT | TTS en inglés, on-device |
| Dia2-1B-LiteRT (mlboydaisuke) | 1B | no disponible | Apache-2.0 | LiteRT | TTS de diálogo entre dos hablantes |
| Pocket TTS original (Kyutai) | ~100M | no disponible | CC-BY-4.0 | PyTorch | TTS en inglés, CPU/GPU |

Dia2-1B-LiteRT es un modelo de diálogo con dos voces, más grande y con licencia Apache-2.0, mientras que Pocket-TTS-LiteRT es más ligero y se centra en una sola voz. El original de Kyutai requiere ejecución en CPU/GPU de escritorio, mientras que esta conversión está optimizada para GPU móvil.

## Limitaciones y advertencias

- Solo soporta inglés; no hay modelos multilingües en esta conversión.
- No incluye clonación de voz: solo las voces predefinidas alba y marius.
- El rendimiento varía significativamente entre GPUs: en Mali (Tensor G3) apenas alcanza tiempo real, mientras que en Adreno es 4-5× más rápido.
- Requiere LiteRT ≥2.1.5 en dispositivos Mali; versiones anteriores pueden fallar.
- La conversión sustituye erf-GELU por una aproximación polinómica, con un error máximo de 7.1e-5, que podría afectar a casos extremos no medidos.
- No se proporcionan datos sobre sesgos o alucinaciones del modelo de voz; al ser un TTS, el riesgo principal es la generación de audio con entonación o pronunciación incorrecta en textos ambiguos.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero es responsabilidad del usuario cumplir con los términos.

## Enlaces

- [HuggingFace: mlboydaisuke/Pocket-TTS-LiteRT](https://huggingface.co/mlboydaisuke/Pocket-TTS-LiteRT)
- [Modelo base: kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
- [Repositorio GitHub de Pocket TTS (Kyutai)](https://github.com/kyutai-labs/pocket-tts)
- [Dia2-1B-LiteRT (modelo similar)](https://huggingface.co/mlboydaisuke/Dia2-1B-LiteRT)
- [Matcha-TTS-LiteRT (modelo similar)](https://huggingface.co/mlboydaisuke/Matcha-TTS-LiteRT)
