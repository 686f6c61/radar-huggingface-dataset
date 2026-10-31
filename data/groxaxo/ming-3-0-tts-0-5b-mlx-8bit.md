# groxaxo/Ming-3.0-tts-0.5B-MLX-8bit

## Resumen

Ming-3.0-tts-0.5B-MLX-8bit es una cuantización a 8 bits, en formato MLX, del modelo de texto a voz Ming-3.0-tts-0.5B desarrollado por inclusionAI. La conversión ha sido realizada por el usuario groxaxo de forma local a partir de los pesos originales en BF16, usando la implementación nativa "dense" de MLX Audio 0.6.2, y está pensada específicamente para ejecutarse en hardware Apple Silicon (Mac con chips M1 a M5) mediante el framework MLX.

El modelo base es un sistema TTS compacto (aproximadamente 0,5 B de parámetros según su denominación, con 1,48 mil millones de parámetros totales en el checkpoint cuantizado, que incluye backbone tipo Qwen, VAE de audio y cabecera de flow-matching) capaz de sintetizar voz en siete idiomas: inglés, chino, alemán, español, francés, coreano y japonés. Soporta clonación de voz mediante audio de referencia y embeddings de hablante, con salida a 44.100 Hz.

Su relevancia radica en que permite ejecutar un TTS multilingüe con clonación de voz completamente en local en un Mac, sin PyTorch ni ONNX Runtime, con un tamaño de pesos de 1,57 GB (frente a 2,96 GB en BF16) y una velocidad superior al tiempo real (RTF de 0,37 en inglés según la validación del autor). La licencia MIT heredada de inclusionAI permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con backbone tipo Qwen, VAE de audio, cabecera flow-matching, agregador, proyección de hablante y stop head |
| Parametros totales | 1.479.454.868 (en el checkpoint cuantizado, safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín, group size 64 (646 módulos cuantizados; algunos tensores permanecen en coma flotante) |
| Idiomas soportados | inglés, chino, alemán, español, francés, coreano, japonés |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX, cuantizado a 8 bits) |

Otros datos: tamaño del repo 1,6 GB; archivo de pesos de 1,573 GB frente a 2,959 GB en BF16; frecuencia de muestreo de salida de 44.100 Hz; biblioteca de ejecución mlx-audio 0.6.2.

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje tipo Qwen (cuantizado en esta conversión junto con el VAE de audio, la cabecera de flow-matching, el agregador, la proyección de hablante y la stop head) con un decodificador de audio basado en VAE y generación mediante flow-matching. La síntesis se condiciona mediante voz integrada (por ejemplo "US_Emma"), audio de referencia con su transcripción para clonación de voz, o un embedding de hablante de 192 dimensiones precalculado (originalmente con el codificador CAM++ en ONNX, que la implementación dense de MLX Audio no extrae automáticamente).

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), ya que esta ficha describe una cuantización posterior realizada por un tercero. Como innovación de la conversión: cuantización afín de 8 bits con group size 64, verificación byte a byte de los 534 tensores no cuantizados contra la exportación BF16, y una validación del decodificador con latentes idénticos que arroja 33,27 dB de SNR y correlación 0,999765.

## Capacidades

- Síntesis de texto a voz multilingüe en siete idiomas: inglés, chino, alemán, español, francés, coreano y japonés.
- Clonación de voz mediante audio de referencia con transcripción exacta (`ref_audio` + `ref_text`).
- Condicionamiento por embedding de hablante de 192 valores (`spk_emb`), calculado externamente (p. ej., CAM++ ONNX).
- Voces integradas (built-in voices) como "US_Emma" sin necesidad de audio de referencia.
- Salida de audio a 44.100 Hz en formato WAV.
- Selección de idioma explícita mediante `lang_code` (por ejemplo, "es" para español).
- Ejecución sin PyTorch ni ONNX Runtime: solo MLX y mlx-audio.
- No soporta (no consta): tool calling, agentes, razonamiento multi-paso ni procesamiento de visión; es un modelo exclusivamente TTS.

## Casos de uso

- Narración de audiolibros y artículos en español: con `lang_code="es"` y un audio de referencia, puede generar locuciones largas por encima del tiempo real (RTF 0,363 en español) en un Mac, sin coste de API.
- Asistentes de voz locales y offline: su tamaño de 1,57 GB y su ejecución nativa en Apple Silicon lo hacen adecuado para agentes de voz que respetan la privacidad, sin enviar texto a servicios externos.
- Prototipado rápido de interfaces de voz: la API de mlx-audio permite generar muestras en pocas líneas de Python, útil para probar diálogos de IVR o asistentes antes de producción.
- Producción de contenido multilingüe: soporte de siete idiomas con el mismo modelo permite generar versiones en inglés, francés, alemán, japonés, coreano o chino de un mismo guion.
- Clonación de voz para personalización de marca: con una grabación de referencia y su transcripción, se puede sintetizar una voz coherente para podcasts o vídeos.
- Generación por lotes en servidores Mac: la validación offline (carga desde copia reubicada con caché vacía y modo Hub offline) indica que puede desplegarse en entornos aislados sin red.
- Accesibilidad: lectura de documentos para usuarios con dificultades visuales, ejecutándose íntegramente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, MMLU, etc.) en la información disponible. El autor sí publicó mediciones locales de rendimiento en un Apple M5 con 24 GiB de memoria unificada (cinco frases cortas por idioma, mismas condiciones entre precisiones; RTF = tiempo total de síntesis / duración total del audio generado; valores menores que 1 son más rápidos que el tiempo real):

| Precision | RTF ingles | RTF espanol | Pico de asignacion MLX |
|---|---:|---:|---:|
| MLX BF16 | 0,572 | 0,472 | 3,89 GB |
| MLX 8-bit | 0,372 | 0,363 | 2,19 GB |

Otras validaciones cuantitativas del autor: 10/10 clips con parada normal y salida finita, no silenciosa y sin clipping; 10/10 secuencias de palabras coincidentes con ASR Parakeet tras normalización (no es una evaluación de escucha humana); decodificador con latentes idénticos a 33,27 dB de SNR y correlación 0,999765.

## Requisitos de hardware

- Memoria: pico de asignación MLX de 2,19 GB en 8-bit (frente a 3,89 GB en BF16), medido en un Apple M5 con 24 GiB de memoria unificada. Un Mac con 8-16 GiB debería ser suficiente para inferencia.
- GPU: no requiere GPU dedicada; está diseñado para Apple Silicon (MLX). No hay datos de rendimiento en GPU NVIDIA ni en CPU x86.
- Consumer: cabe cómodamente en cualquier Mac moderno con Apple Silicon; no procede hablar de VRAM de tarjetas gráficas convencionales.
- Despliegue: mediante la biblioteca mlx-audio 0.6.2 (`pip install "mlx-audio==0.6.2"`), con carga vía `mlx_audio.tts.utils.load_model`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Velocidad: RTF de 0,372 (inglés) y 0,363 (español) en Apple M5, es decir, aproximadamente 2,7 veces más rápido que el tiempo real, incluyendo carga de referencia, codificación y evaluación de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/plataforma | Idiomas | Licencia |
|---|---|---|---|---|
| Ming-3.0-tts-0.5B-MLX-8bit (este) | ~1,48 B (checkpoint cuantizado; base 0,5 B) | MLX 8-bit, Apple Silicon | en, zh, de, es, fr, ko, ja | MIT |
| inclusionAI/Ming-3.0-tts-0.5B (base) | ~0,5 B (denominación) | BF16, PyTorch/ONNX | en, zh, de, es, fr, ko, ja | MIT |
| Kokoro-82M | 82 M | ONNX/PyTorch, multiplataforma | varios (sin chino/japonés/coreano nativos) | Apache 2.0 |
| Piper TTS | modelos de 10-100 M | ONNX, CPU | más de 30 idiomas | MIT |

Nota: Kokoro y Piper son considerablemente más pequeños y no ofrecen clonación de voz con audio de referencia; Ming destaca en multilingüe asiático y occidental con clonación, a cambio de mayores requisitos de memoria. No se dispone de benchmarks comparativos directos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Acento: la inteligibilidad en español no implica acento argentino; el autor señala que las muestras en español del runtime original resultaron poco naturales o con aire de España, y esta cuantización no mejora el acento ni la naturalidad. Conviene evaluar el resultado por uno mismo.
- Normalización de texto no portada: hay que escribir números, fechas y unidades con letras; de lo contrario la pronunciación puede ser incorrecta.
- Stop head: puede dejar ocasionalmente colas largas de audio en algunos prompts.
- Extracción de embeddings de hablante no automática: la implementación dense de MLX Audio no extrae embeddings CAM++; hay que calcularlos aparte con el codificador ONNX original si se quiere usar `spk_emb`.
- Evaluación limitada: solo se validó un conjunto breve bilingüe y una comprobación numérica del decodificador; no hay evaluación perceptual exhaustiva ni por idioma.
- Plataforma: el formato MLX está orientado a Apple Silicon; no hay datos de funcionamiento en otras plataformas con este checkpoint.
- Licencia MIT: sin restricciones para uso comercial, pero conviene revisar también los términos del modelo base de inclusionAI.
- Riesgo de clonación de voz: como todo modelo con clonación por referencia, puede usarse para suplantar voces; el responsable del uso es quien lo despliega.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/groxaxo/Ming-3.0-tts-0.5B-MLX-8bit
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- MLX Audio (runtime, implementación dense): https://github.com/Blaizzy/mlx-audio/tree/main/mlx_audio/tts/models/dense
- Repositorio upstream de inclusionAI Ming TTS: https://github.com/inclusionAI/Ming-3.0-tts
