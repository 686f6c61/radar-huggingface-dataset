# lionellee/Qwen3-ForcedAligner-0.6B-4bit

## Resumen

Qwen3-ForcedAligner-0.6B-4bit es una versión cuantizada a 4 bits del modelo Qwen/Qwen3-ForcedAligner-0.6B, publicada por el usuario lionellee para su ejecución en Apple Silicon mediante la librería MLX. No es un modelo generativo general: es un alineador forzado (forced aligner) que, dada una pareja de audio y texto, predice las marcas temporales a nivel de palabra en una única pasada forward no autorregresiva. El modelo base procede de la familia Qwen3 de Alibaba y se distribuye con licencia Apache 2.0.

La relevancia de esta variante es fundamentalmente práctica: reduce el peso del repositorio a 979 MB (frente a 1,84 GB en bf16) manteniendo el codificador de audio y la cabeza de clasificación en float16 para preservar la precisión, y cuantiza únicamente el decodificador de texto. Esto permite ejecutar alineamiento de audio en portátiles y equipos Apple Silicon sin GPU dedicada, un escenario habitualmente reservado a infraestructura con CUDA.

El modelo cuenta con 414.756.480 parámetros reales según los safetensors del repositorio y soporta nueve idiomas (inglés, chino, japonés, coreano, alemán, francés, español, italiano y ruso). No debe confundirse con un sistema ASR completo: su función es asignar tiempos a un texto ya conocido, no transcribir audio libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de alineamiento forzado: codificador de audio (24 capas, d_model=1024, 16 cabezas, FFN=4096, float16) + decodificador de texto (28 capas, hidden=1024, 16 cabezas Q / 8 KV, 4-bit) + cabeza de clasificación Linear(1024, 5000) en float16 |
| Parametros totales | 414.756.480 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la resolución temporal es de 80 ms por clase, con 5000 clases = 400 s máximos por pasada) |
| Tipos de cuantizacion | 4-bit con cuantización por grupos (group_size=64) en el decodificador de texto; codificador de audio y cabeza de clasificación en float16 |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, it, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de un alineador forzado basado en Qwen3: un codificador de audio de 24 capas procesa la señal acústica y un decodificador de texto de 28 capas con atención de 16 cabezas de consulta y 8 de clave/valor procesa la secuencia combinada. A diferencia de un ASR autorregresivo, el decodificador ejecuta la secuencia completa en una sola pasada forward; en cada posición de token `<timestamp>` la cabeza de clasificación produce un argmax sobre 5000 clases, y cada clase se traduce a tiempo mediante `indice_de_clase × 80 ms`, lo que fija una resolución temporal de 80 ms y un límite de 400 segundos por alineamiento.

La cuantización aplicada en esta variante afecta a las proyecciones de atención, al MLP y a los embeddings del decodificador de texto, mientras que el codificador de audio y la cabeza de clasificación se mantienen en float16 para no degradar la precisión temporal. El proceso de conversión se realizó con el script `convert_forced_aligner.py` del repositorio del autor. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; esos datos corresponden al modelo original de Qwen y no se detallan en la información disponible.

## Capacidades

- Alineamiento forzado a nivel de palabra: asigna tiempos de inicio y fin a cada palabra de un texto dado sobre un audio correspondiente.
- Predicción no autorregresiva en una sola pasada forward, lo que reduce la latencia frente a esquemas token a token.
- Resolución temporal de 80 ms por clase, con un máximo de 400 segundos de audio por alineamiento.
- Soporte multilingüe en nueve idiomas: inglés, chino, japonés, coreano, alemán, francés, español, italiano y ruso.
- Integración con la librería Swift `speech-swift` mediante la API `Qwen3ForcedAligner.fromPretrained()` y la CLI `qwen3-asr-cli`.
- Modo de alineamiento con texto proporcionado (`--align --text`) o transcripción previa seguida de alineamiento (`--align`).
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto libre: es un modelo especializado de clasificación temporal.

## Casos de uso

- Subtitulado automático de vídeo: dado un audio y su transcripción, el modelo genera marcas temporales por palabra que se pueden convertir directamente en subtítulos SRT o WebVTT con precisión de 80 ms, adecuado para contenido multilingüe en los nueve idiomas soportados.
- Sincronización de locuciones en doblaje: al conocer los tiempos exactos de cada palabra del audio original, se pueden ajustar las pistas dobladas para que coincidan con la cadencia del habla original, usando la resolución de 80 ms como granularidad.
- Análisis fonético y prosódico en investigación: los tiempos por palabra permiten calcular duraciones, pausas y ritmo del habla, útil en estudios lingüísticos y en la evaluación de la fluidez de aprendices de idiomas.
- Generación de datasets de habla etiquetados: el alineador permite anotar corpus de audio con tiempos por palabra de forma automática, alimentando posteriores entrenamientos de TTS o ASR con datos temporales de calidad.
- Karaoke y visualización de letras sincronizadas: la salida por palabra se puede mapear a una interfaz que resalte cada palabra conforme se pronuncia, con la ventaja de ejecutarse en un portátil Apple Silicon sin GPU dedicada.
- Búsqueda y recuperación en archivos de audio: con los tiempos por palabra se pueden indexar fragmentos de audio por término y construir búsquedas que devuelvan el instante exacto en el que se pronuncia una palabra, útil en archivos de reuniones o entrevistas.
- Evaluación de pronunciación en aplicaciones educativas: comparando los tiempos esperados con los observados se pueden detectar alargamientos, omisiones o pausas anómalas en la producción oral del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB y el modelo cuantizado pesa 979 MB, por lo que la huella de memoria en inferencia ronda 1-1,5 GB en función del audio procesado.
- GPU recomendadas: el modelo está diseñado para Apple Silicon mediante MLX; no se proporcionan requisitos para CUDA. Cualquier chip Apple Silicon (serie M) con al menos 8 GB de memoria unificada debería poder ejecutarlo, aunque no se especifican mínimos oficiales.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no se documenta compatibilidad con GPUs NVIDIA de consumo ni con CUDA.
- Opciones de despliegue: MLX a través de la librería Swift `speech-swift` y la CLI `qwen3-asr-cli`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La naturaleza no autorregresiva y la pasada única forward sugieren latencia baja, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| lionellee/Qwen3-ForcedAligner-0.6B-4bit | 414.756.480 | 80 ms por clase, 400 s maximo | 9 | apache-2.0 | safetensors (MLX) |
| Qwen/Qwen3-ForcedAligner-0.6B (base) | no disponible en la informacion | no disponible | no disponible | apache-2.0 | safetensors |
| mlx-community/Qwen3-ForcedAligner-0.6B-bf16 | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | safetensors (MLX, bf16) |

La comparación se limita a las variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de especificaciones de alineadores alternativos en la información proporcionada. Frente a la variante bf16, esta versión reduce el tamaño de 1,84 GB a 979 MB a costa de cuantizar el decodificador de texto, manteniendo el codificador de audio y la cabeza de clasificación en float16.

## Limitaciones y advertencias

- Es un alineador forzado, no un ASR: requiere un texto de entrada y no transcribe audio libre por sí mismo.
- Límite de 400 segundos por alineamiento debido a las 5000 clases de 80 ms; audios más largos deben segmentarse.
- Resolución temporal de 80 ms, insuficiente para aplicaciones que requieran precisión de milisegundos.
- La cuantización a 4 bits del decodificador puede introducir degradación en la precisión temporal frente a la variante bf16; no se han publicado métricas comparativas.
- Compatibilidad limitada a Apple Silicon y MLX; no se documenta soporte para CUDA, vLLM, llama.cpp ni otras plataformas.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo día (24 de noviembre de 2026), lo que indica ausencia de validación comunitaria.
- Riesgo de alucinación temporal en audio con ruido, solapamiento de hablantes o desajuste entre el texto proporcionado y el audio; no se documentan sesgos específicos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor de la conversión no ofrece garantías y la responsabilidad de validación recae en el usuario.
- La información sobre el modelo base (datos de entrenamiento, sesgos, benchmarks) no está disponible en la documentación proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lionellee/Qwen3-ForcedAligner-0.6B-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Variante bf16: https://huggingface.co/mlx-community/Qwen3-ForcedAligner-0.6B-bf16
- Librería Swift speech-swift: https://github.com/soniqo/speech-swift
- MLX: https://github.com/ml-explore/mlx
- Guía de alineamiento: https://soniqo.audio/guides/align
- Documentación: https://soniqo.audio
