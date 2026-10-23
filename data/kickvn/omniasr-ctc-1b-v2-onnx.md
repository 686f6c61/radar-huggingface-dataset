# kickvn/omniASR-CTC-1B-v2-ONNX

## Resumen

omniASR-CTC-1B-v2-ONNX es la exportación a ONNX (fp32, opset 17) del checkpoint CTC `omniASR_CTC_1B_v2` de Meta, perteneciente a la familia Omnilingual ASR. El modelo original se distribuye en formato fairseq2 desde los servidores de Meta y no está publicado en Hugging Face; esta conversión, realizada por el usuario `kickvn`, lo empaqueta en un grafo ONNX con datos externos para poder ejecutarlo con `onnxruntime` sin dependencias de fairseq2. El uso declarado por el autor es el alineado forzado (forced alignment) de letras de canciones en KICK Studio, con cobertura de más de 1600 idiomas.

Arquitectónicamente es un modelo de reconocimiento de voz con cabecera CTC sobre un codificador de tipo wav2vec2, de aproximadamente 1000 millones de parámetros (de ahí el sufijo "1B" del checkpoint). La salida son logits por frame sobre un vocabulario de 10288 clases de carácter, con una resolución temporal de 20 ms por frame (50 frames por segundo), lo que permite obtener marcas temporales a nivel de carácter. La entrada es audio mono a 16 kHz en float32, normalizado por ventana (media 0, varianza 1).

Su relevancia es acotada pero concreta: no es un modelo nuevo ni un entrenamiento propio, sino una pieza de infraestructura que hace utilizable un checkpoint de Meta fuera del ecosistema fairseq2, con verificación de paridad numérica frente al original. El repositorio tiene 0 descargas y 0 likes, y no se han publicado benchmarks de calidad ASR, por lo que debe evaluarse como un artefacto de conversión, no como un modelo validado de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de habla tipo wav2vec2 con cabecera CTC, exportado a ONNX (base original en fairseq2) |
| Parametros totales | ~1B (checkpoint `omniASR_CTC_1B_v2`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana declarada; la validación del autor cubre entradas de 20 s y 7,3 s. Resolución de salida: 1 frame por 20 ms |
| Tipos de cuantizacion | Solo fp32 en este repositorio; no se incluyen variantes int8, fp16 ni GGUF |
| Idiomas soportados | Más de 1600 idiomas según la model card del autor (heredado de Omnilingual ASR); los metadatos de Hugging Face no declaran idiomas |
| Licencia | Apache 2.0 (modelo original © Meta Platforms, Inc.) |
| Formato de pesos | ONNX opset 17 con datos externos (`model.onnx` + `model.onnx.data`), más `vocab.json` y `profile.json` |

Otros datos técnicos relevantes:

| Elemento | Valor |
|---|---|
| Entrada | `wave`: float32 `[batch, samples]`, 16 kHz mono, normalizada por ventana (media 0, varianza 1) |
| Salida | `logits`: float32 `[batch, frames, 10288]` |
| Tokenizador | `omniASR_tokenizer_written_v2`, basado en caracteres |
| Clase blank CTC | Índice 0 (según `profile.json`: `kind: chars`, `normalize: true`) |
| Tamaño del repositorio | 3,9 GB |
| Runtime declarado | `onnxruntime` |

## Arquitectura y entrenamiento

El modelo sigue el esquema clásico de ASR auto-supervisado: un codificador convolucional y transformer que transforma la señal de audio en una secuencia de representaciones latentes, seguido de una proyección lineal que produce logits CTC sobre un vocabulario de caracteres de 10288 clases. El entrenamiento corresponde íntegramente a Meta (familia Omnilingual ASR); esta ficha no dispone de información sobre el número de tokens de audio, la composición del corpus, ni si se aplicaron etapas de ajuste fino supervisado, RLHF o similares. No se dispone tampoco de detalles sobre innovaciones de decodificación o atención en el checkpoint original.

La aportación del repositorio es exclusivamente de ingeniería de conversión: traslado del checkpoint fairseq2 a un grafo ONNX en opset 17 manteniendo los pesos en fp32 y el conjunto completo de caracteres, con los pesos de más de 2 GB almacenados como datos externos (`model.onnx.data`) junto al grafo. El autor declara una comprobación de paridad frente al modelo fairseq2 original con argmax idéntico en todos los frames para entradas de 20 s y 7,3 s. No se documenta ningún reentrenamiento, destilación ni calibración de cuantización.

## Capacidades

- Reconocimiento automático de voz con salida CTC a nivel de carácter, sobre un vocabulario de 10288 clases.
- Alineado forzado (forced alignment) de transcripciones o letras sobre audio, con marcas temporales cada 20 ms (50 frames por segundo).
- Cobertura multilingüe amplia: la model card declara más de 1600 idiomas, incluyendo presumiblemente lenguas de bajos recursos por la naturaleza del proyecto Omnilingual ASR.
- Salida de logits completa (no solo la hipótesis), lo que permite calcular posteriormente probabilidades, confianzas por frame y rutas de alineado alternativas propias de CTC.
- Entrada de audio mono a 16 kHz con normalización por ventana, apta para procesar fragmentos independientes en streaming por bloques.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio generation ni modo "thinking": es un modelo puramente audio-a-texto.
- No se documentan capacidades de puntuación, capitalización, diarización ni detección de idioma explícita.

## Casos de uso

- Alineado forzado de letras de canciones: es el caso de uso declarado por el autor (KICK Studio). Se pasa la letra como secuencia objetivo y el audio normalizado, y el decodificador CTC obtiene la ruta de alineado para generar karaoke sincronizado a nivel de carácter.
- Generación de subtítulos sincronizados: a partir de una transcripción existente se obtienen marcas de tiempo por carácter o palabra (agrupando caracteres), útiles para subtitulado de vídeo donde se requiere precisión inferior al segundo.
- Anotación de corpus de habla: creación de datasets con timestamps a nivel de carácter para entrenamiento posterior de modelos TTS o ASR, aprovechando la resolución de 20 ms.
- Control de calidad de transcripciones: comparar la ruta de alineado CTC con la transcripción de entrada para detectar desajustes, omisiones o segmentos donde la confianza cae, señalando posibles errores de transcripción humana o automática.
- Segmentación de audio largo por alineación: dado un audio de programa o entrevista y su transcripción, localizar los límites exactos de cada intervención para trocear el material en clips.
- Investigación lingüística en lenguas de bajos recursos: obtener alineados y posteriores CTC para análisis fonético o de duraciones en idiomas sin herramientas específicas, gracias a la cobertura declarada de más de 1600 idiomas.
- Preprocesado para pipelines de TTS: extracción de duraciones por carácter o fonema a partir del alineado forzado, necesarias para sistemas de síntesis basados en duraciones.
- Despliegue en entornos ONNX: integración en servicios que ya usan `onnxruntime` (incluido el entorno web o edge) sin arrastrar la pila fairseq2, con un único artefacto de 3,9 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER, MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo documenta una prueba de equivalencia numérica con el modelo original:

| Prueba | Entrada | Resultado declarado |
|---|---|---|
| Paridad de argmax por frame frente a fairseq2 | Audio de 20 s | Idéntico en todos los frames |
| Paridad de argmax por frame frente a fairseq2 | Audio de 7,3 s | Idéntico en todos los frames |

No hay datos de WER por idioma, ni de latencia, ni comparación con otros sistemas ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB solo para pesos fp32 (1B parámetros), con un pico realista de 5-7 GB al añadir activaciones y buffers de audio; no disponible una medición oficial.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100). En GPUs de 8 GB puede requerir limitar el tamaño de lote o la longitud de audio por invocación.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más; en 6 GB o menos es ajustado en fp32 y no se ofrecen variantes cuantizadas en el repositorio.
- Inferencia en CPU: viable con `onnxruntime` al ser un grafo ONNX estándar, aunque no se han publicado cifras de latencia ni throughput.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), ONNX Runtime con proveedores de ejecución CUDA/TensorRT/DirectML, y servidores compatibles con ONNX. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo (no es un LLM ni se distribuye en GGUF).
- Requisito operativo: el runtime debe soportar datos externos de ONNX, ya que el modelo supera los 2 GB y los pesos viven en `model.onnx.data`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| kickvn/omniASR-CTC-1B-v2-ONNX | ~1B | No disponible (validado con 20 s y 7,3 s) | ONNX fp32 con datos externos | Apache 2.0 | Exportación comunitaria, 0 descargas, 0 likes |
| facebook/omniASR-CTC-1B (original) | ~1B | No disponible | Checkpoint fairseq2 (`.pt`) | Apache 2.0 | Publicado por Meta en su servidor, no en Hugging Face |
| facebook/omniASR-CTC-1B-v2 (original) | ~1B | No disponible | Checkpoint fairseq2 `omniASR-CTC-1B-v2.pt` | Apache 2.0 | Publicado por Meta en su servidor; es la referencia de paridad |
| Alternativas de otras familias (p. ej. Whisper, MMS) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No se aportan datos comparativos verificables en esta ficha |

La comparación con modelos de otras familias no puede cuantificarse con la información disponible: no hay WER publicado para este checkpoint ni cifras propias que permitan situarlo frente a alternativas. La única diferencia verificable frente al original es el formato (ONNX frente a fairseq2) y el mecanismo de distribución.

## Limitaciones y advertencias

- No existe ninguna evaluación de calidad ASR publicada: ni WER global ni por idioma. La única validación es la paridad de argmax en dos audios concretos (20 s y 7,3 s), lo que no garantiza comportamiento equivalente en otras condiciones, duraciones o idiomas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.
- Es un artefacto de conversión, no un modelo entrenado por el autor: los sesgos, la cobertura real por idioma y los fallos del checkpoint original se heredan sin cambios.
- Riesgo de alucinación en sentido ASR: inserciones de caracteres en tramos con ruido, música o silencio, y degradación previsible en audio con solapamiento de hablantes. No cuantificado.
- El alineado forzado exige que la transcripción use caracteres presentes en el vocabulario de 10288 clases del tokenizador `omniASR_tokenizer_written_v2`; caracteres fuera de ese conjunto no pueden alinearse y requieren normalización previa.
- La normalización por ventana (media 0, varianza 1) es obligatoria según el autor; alterarla cambia la salida respecto al modelo de referencia.
- No se documenta el tratamiento de audio largo: la ventana no está declarada y el consumo de memoria crece con los samples de entrada, por lo que es necesario trocear manualmente.
- El grafo supera los 2 GB y usa datos externos: runtimes que no soportan `external_data` no podrán cargarlo, y el despliegue en navegador o edge requiere verificación adicional.
- No hay variantes cuantizadas en el repositorio: no es posible reducir el footprint de 3,9 GB sin convertir el modelo uno mismo.
- Licencia Apache 2.0 permite uso comercial, pero se deben conservar `LICENSE` y `NOTICE` y atribuir el modelo original a Meta Platforms, Inc.
- No hay soporte declarado de puntuación, mayúsculas, diarización ni detección de idioma: cualquier funcionalidad de ese tipo debe añadirse en una capa posterior.
- Modelo no apto como LLM: no admite instrucciones, tool calling ni razonamiento; utilizarlo fuera del ámbito audio-a-texto no es viable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kickvn/omniASR-CTC-1B-v2-ONNX
- Modelo base declarado: https://huggingface.co/facebook/omniASR-CTC-1B
- Checkpoint original v2 (fairseq2, servidor de Meta): https://dl.fbaipublicfiles.com/mms/omniASR-CTC-1B-v2.pt
- Model card / repositorio de Omnilingual ASR: https://github.com/facebookresearch/omnilingual-asr
