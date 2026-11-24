# BadDiamond/faster-whisper-small

## Resumen
BadDiamond/faster-whisper-small es una conversión del modelo openai/whisper-small al formato de CTranslate2, publicada por el usuario BadDiamond. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue que empaqueta los pesos originales de Whisper small (un transformer encoder-decoder de reconocimiento automático del habla, ASR) en el formato binario optimizado de CTranslate2, con pesos guardados en FP16. Su utilidad principal es servir como motor de inferencia para faster-whisper y otros proyectos construidos sobre CTranslate2.

El modelo hereda las capacidades del Whisper small original: transcripción multilingüe, detección de idioma y traducción al inglés, con una ventana de audio de 30 segundos procesada por bloques y un vocabulario multilingüe. La conversión a CTranslate2 permite ejecutar la inferencia con menor uso de memoria y mayor velocidad que la implementación original en PyTorch, especialmente en CPU, gracias a las optimizaciones de CTranslate2 en operadores y cuantización.

Es relevante para desarrolladores que necesitan desplegar ASR en producción con recursos limitados, ya que el repositorio ocupa aproximadamente 0,5 GB y puede ejecutarse en hardware modesto. La licencia MIT facilita su integración en productos comerciales. No obstante, el repositorio no incluye documentación propia más allá de la conversión, y no se han publicado métricas de rendimiento específicas para esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 244 millones (modelo original Whisper small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento |
| Tipos de cuantizacion | FP16 en los pesos; CTranslate2 permite float32, int8, int8_float16, int16 en carga |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (binario propio de CTranslate2), con tokenizer.json |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder con atención multi-cabeza estándar, entrenado por OpenAI sobre 680.000 horas de audio etiquetado y no etiquetado, con una combinación de datos de ASR supervisado y pseudo-etiquetado. El modelo original incluye detección de idioma, transcripción multilingüe y traducción al inglés como tareas conjuntas. No se ha realizado ningún entrenamiento adicional en esta conversión: el autor únicamente ejecutó `ct2-transformers-converter` sobre openai/whisper-small con cuantización float16 y copió el tokenizer.

La innovación técnica de esta ficha no reside en el modelo en sí, sino en el formato de despliegue. CTranslate2 aplica optimizaciones de grafos, fusión de operadores y soporte de cuantización en tiempo de carga mediante la opción `compute_type`, lo que permite reducir el consumo de memoria y acelerar la inferencia en CPU y GPU. El modelo conserva la ventana de 30 segundos y el mecanismo de decodificación autoregresiva del Whisper original, incluyendo la posibilidad de usar decodificación por lotes y detección automática de idioma.

## Capacidades
- Transcripción automática del habla (ASR) en 99 idiomas, con detección automática del idioma de entrada.
- Traducción de audio a texto en inglés para los idiomas soportados (tarea de traducción de Whisper).
- Segmentación temporal de la transcripción con marcas de inicio y fin por segmento.
- Procesamiento de audio en ventanas de 30 segundos, con manejo de audios más largos mediante segmentación interna de faster-whisper.
- Soporte de decodificación por lotes y ajuste de parámetros de decodificación (beam size, temperatura, umbrales de compresión).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente de ASR.
- No incluye modo thinking, visión ni audio generation; solo entrada de audio y salida de texto.

## Casos de uso
- Transcripción de reuniones y videollamadas: el modelo puede procesar el audio de una reunión en segmentos de 30 segundos y generar actas con marcas temporales, usando faster-whisper para gestionar audios largos y la detección automática de idioma en entornos multilingües.
- Subtitulado automático de vídeo: integrado en un pipeline de postproducción, genera subtítulos con tiempos de inicio y fin por segmento, adecuado para contenido en castellano y otros idiomas europeos gracias a la cobertura multilingüe.
- Atención al cliente basada en voz: transcripción de llamadas en tiempo casi real para alimentar sistemas de análisis de sentimiento o bases de conocimiento, con despliegue en CPU mediante CTranslate2 para reducir costes de infraestructura.
- Dictado y accesibilidad: aplicación de escritorio o móvil que convierte voz en texto para personas con movilidad reducida, ejecutando el modelo en local con cuantización int8 para minimizar el uso de memoria.
- Indexación y búsqueda de archivos de audio: transcripción masiva de podcasts o archivos de audio de archivo para construir índices de búsqueda textual, aprovechando el formato CTranslate2 para procesar lotes en servidores sin GPU dedicada.
- Análisis de llamadas de contact center: extracción de texto de grabaciones para cumplimiento normativo y análisis de calidad, con la ventaja de que la licencia MIT permite uso comercial sin restricciones adicionales.
- Transcripción de clases y conferencias: generación de apuntes automáticos en entornos educativos, con la posibilidad de ejecutar el modelo en portátiles con CPU moderna gracias al reducido tamaño del repositorio (0,5 GB).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de WER, latencia ni throughput para esta conversión específica, y la model card remite a la model card del modelo original de OpenAI para más información.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP16; alrededor de 0,25 GB con cuantización int8. El modelo original tiene 244 millones de parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 y H100. El modelo es pequeño y no requiere GPU de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con soporte CUDA, e incluso en iGPU mediante CPU.
- Opciones de despliegue: faster-whisper (recomendado), CTranslate2 directamente, y servidores compatibles con CTranslate2. No es compatible con llama.cpp, Ollama ni TGI, que no soportan el formato CTranslate2.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El rendimiento depende del hardware y de la cuantización elegida en `compute_type`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BadDiamond/faster-whisper-small | 244 M | 30 s por segmento | 99 | MIT | CTranslate2 |
| openai/whisper-small | 244 M | 30 s por segmento | 99 | MIT | PyTorch (safetensors) |
| openai/whisper-base | 74 M | 30 s por segmento | 99 | MIT | PyTorch |
| openai/whisper-medium | 769 M | 30 s por segmento | 99 | MIT | PyTorch |

La comparativa se limita a la familia Whisper porque no se dispone de datos de rendimiento de esta conversión frente a alternativas como Wav2Vec2 o Conformer. La principal diferencia frente a openai/whisper-small es el formato de pesos y el motor de inferencia: la versión CTranslate2 está pensada para despliegue optimizado, mientras que la versión PyTorch es la referencia para entrenamiento y experimentación.

## Limitaciones y advertencias
- Al ser una conversión del modelo original, hereda los sesgos y errores de Whisper small, incluidas alucinaciones en audio con ruido, silencios largos o música.
- Riesgo de alucinación: Whisper puede generar texto plausible pero incorrecto en segmentos de audio ambiguos o de baja calidad, especialmente en idiomas con pocos datos.
- Limitación de contexto: la ventana de audio es de 30 segundos por segmento; audios más largos requieren segmentación externa, que faster-whisper gestiona pero puede introducir errores en los cortes.
- Cobertura desigual entre idiomas: el rendimiento es mejor en inglés y lenguas europeas con muchos datos, y notablemente inferior en idiomas de bajos recursos incluidos en la lista de 99.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el usuario debe verificar las condiciones del modelo original de OpenAI, que también es MIT.
- Caveat de producción: el repositorio no incluye pruebas de calidad ni métricas de esta conversión concreta; se recomienda validar el WER en el dominio específico antes de desplegar.
- El autor del repositorio (BadDiamond) no es el desarrollador original del modelo; la conversión no está avalada oficialmente por OpenAI ni por el equipo de faster-whisper.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/BadDiamond/faster-whisper-small
- Modelo original: https://huggingface.co/openai/whisper-small
- Repositorio faster-whisper: https://github.com/systran/faster-whisper
- Repositorio CTranslate2: https://github.com/OpenNMT/CTranslate2
- Documentación de cuantización de CTranslate2: https://opennmt.net/CTranslate2/quantization.html
- Paper de Whisper: https://arxiv.org/abs/2212.04356
