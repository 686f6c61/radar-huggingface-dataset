# ethansipark/Qwen3-ForcedAligner-0.6B-8enc4dec-MLX

## Resumen

Qwen3-ForcedAligner-0.6B-8enc4dec-MLX es un checkpoint cuantizado del alineador forzado de Qwen3, publicado por el usuario ethansipark, que permite obtener marcas temporales a nivel de palabra a partir de un audio y su transcripcion. No es un ajuste fino ni un modelo nuevo: es una recuantizacion reproducible del checkpoint completo en 8 bits de mlx-community, en la que el codificador de audio se mantiene a 8 bits y el decodificador de texto se recuantiza a 4 bits.

El modelo resuelve un problema muy concreto dentro de los pipelines de voz: sincronizar con precision un texto ya transcrito con la senal de audio. Su relevancia practica es el ahorro de espacio y de ancho de banda: el fichero de pesos pasa de 979,5 MB (version completa en 8 bits) a 678,9 MB, un 30,7% menos, sin degradar la atribucion de hablante ni la secuencia de texto en la validacion publicada por el autor.

El nombre comercial indica 0,6B, pero el recuento real de parametros en safetensors es de 1.229.680.256 (aproximadamente 1,23 mil millones). El modelo se distribuye en formato MLX, esta licenciado bajo Apache-2.0 y esta pensado para ejecutarse en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Alineador forzado basado en Qwen3: torre de audio (encoder) mas decodificador de texto tipo transformer |
| Parametros totales | 1.229.680.256 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX affine, group size 64: encoder a 8 bits, decoder a 4 bits; lm_head a 4 bits |
| Idiomas soportados | Coreano validado por el autor; otros idiomas no documentados |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos empaquetados para MLX) |
| Tamano de pesos | 678.885.348 bytes (678,9 MB); repo de 0,7 GB |
| Libreria | mlx (probado con mlx-qwen3-asr==0.4.4) |
| Modelo base | ethansipark/Qwen3-ForcedAligner-0.6B-8bit-full-MLX (revision 4207462b32f62c498b12dd97d4d9ef56e411e04b) |
| Creado | 2026-09-27 |

Desglose de pesos por grupo:

| Grupo de pesos | Precision | Bytes empaquetados |
|---|---:|---:|
| audio_tower.* (encoder) | 8 bits, group 64 | 311.951.360 |
| model.* (decoder) | 4 bits, group 64 | 298.057.728 |
| lm_head.* | 4 bits, group 64 | 2.560.000 |
| Total | | 678.885.348 |

## Arquitectura y entrenamiento

El modelo no introduce arquitectura propia: es una recuantizacion. Los tensores del decodificador y de lm_head se toman sin cambios de mlx-community/Qwen3-ForcedAligner-0.6B-4bit (revision 2f652af86ae0c73fe189b9429225c908ce4bf020) y los tensores del codificador se toman sin cambios del checkpoint completo en 8 bits. Ambas fuentes se cuantizaron a partir de los mismos pesos BF16 con cuantizacion afina de MLX a group size 64, de modo que mezclar los grupos es equivalente a ejecutar mlx_qwen3_asr.convert.quantize_model(bits=4, encoder_bits=8), receta que la propia libreria documenta como recomendada para los modelos de 0,6B. El script reproducible se incluye como build_8enc4dec.py.

No hay entrenamiento ni ajuste adicional en este repositorio, y tampoco se publican datos sobre el corpus de entrenamiento original del alineador. La mezcla de precisiones se resuelve sin cambios de codigo: la libreria deduce la cuantizacion por modulo a partir de la forma de los tensores empaquetados, por lo que encoder en 8 bits y decoder en 4 bits conviven en un mismo fichero.

## Capacidades

- Alineacion forzada a nivel de palabra: recibe audio mono a 16 kHz mas una transcripcion y devuelve las marcas temporales de cada palabra.
- Segmentacion por fragmentos (chunking): permite procesar audios largos dividiendolos en fragmentos con su texto correspondiente.
- Manejo de etiquetas de hablante: en la validacion se compararon cambios en las etiquetas de hablante entre checkpoints.
- Reconstruccion de saltos de linea de transcripcion mediante una regla de fusion de 1,5 s de silencio.
- Soporte de coreano, con parametro de idioma explicito en la API (`align(audio, transcript, "Korean")`).
- Capacidad multilingue potencial por herencia del modelo base, aunque no validada ni documentada para otros idiomas.
- No dispone de generacion de texto libre, razonamiento, codigo, matematicas, vision, tool calling ni comportamiento de agente. Es una utilidad de alineacion, no un modelo conversacional.

## Casos de uso

- Subtitulado automatico con marcas por palabra: dado un audio y su transcripcion, el modelo devuelve los limites temporales de cada palabra, lo que permite generar subtitulos en formato SRT/VTT con resaltado tipo karaoke o con ajuste fino de tiempos.
- Postproceso de pipelines ASR: se ejecuta un sistema de reconocimiento de voz para obtener el texto y despues este alineador para fijar los tiempos, mejorando la precision temporal sin reentrenar el ASR.
- Analisis de entrevistas y contenido periodistico: con sus etiquetas de hablante y su salida por palabra, permite construir transcripciones navegables y citas con marca temporal exacta a partir de grabaciones largas de un solo hablante, como la discusion de 48 minutos y 8.477 palabras usada en la validacion.
- Generacion de corpus para TTS: los pares audio-texto con tiempos por palabra son material directo para entrenar o evaluar sintetizadores de voz que necesitan alineacion fonetica previa.
- Diarizacion y atribucion de hablante: el autor reporta una precision de atribucion de 0,9377 frente a la transcripcion de AI Hub, con la salvedad de que el limite lo marca el modelo de diarizacion, no el alineador.
- Busqueda por palabra dentro de archivos de audio: indexar el audio con tiempos por palabra permite localizar y reproducir el fragmento exacto donde se pronuncia un termino.
- Control de calidad de doblaje y localizacion: comparar los tiempos alineados de la pista original y de la doblada para detectar desajustes de duracion.
- Investigacion linguistica y fonetica: analisis de duracion de palabras, pausas y ritmo del habla sobre corpus etiquetados temporalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER sobre testsets publicos) en la informacion disponible. El autor si publica una validacion propia sobre diez fragmentos coreanos de una grabacion de AI Hub 464 (discusion de un solo hablante de 48 minutos, 8.477 palabras), alineados tres veces con audio y texto identicos usando tres checkpoints distintos:

| Metrica | Full 8-bit | Este checkpoint | All 4-bit |
|---|---:|---:|---:|
| Secuencia de texto por palabra | referencia | identica, 10/10 fragmentos | identica, 10/10 fragmentos |
| Desplazamiento medio de limites, ms | referencia | 2,2 - 10,0 | 3,7 - 11,2 |
| Limites movidos mas de 100 ms | referencia | 59 (0,70%) | 82 (0,97%) |
| Palabras desplazadas mas que su propia duracion | referencia | 50 (0,59%) | 75 (0,88%) |
| Etiquetas de hablante modificadas | referencia | 5 | 6 |
| Saltos de linea de transcripcion modificados (regla de fusion de 1,5 s) | referencia | 11 | 14 |
| Intervalos de duracion cero o invertidos | 0 | 0 | 0 |
| Precision de atribucion de hablante frente al transcrito de AI Hub | 0,9377 | 0,9377 | 0,9376 |

Tiempo de reloj de alineacion en esos fragmentos: 7,5 - 14,4 s (full 8-bit), 10,5 - 25,4 s (este checkpoint) y 9,6 - 16,3 s (all 4-bit), sin un orden consistente entre ejecuciones.

## Requisitos de hardware

- Tamano del fichero de pesos: 678,9 MB; el repositorio completo ocupa 0,7 GB, por lo que la VRAM o memoria unificada necesaria para los pesos es inferior a 1 GB.
- Memoria pico de ejecucion: no disponible de forma oficial; el autor advierte de que la cifra de 678,9 MB es una comparacion de ficheros de pesos, no de memoria pico en tiempo de ejecucion.
- Plataforma: MLX, por lo que esta pensado para Apple Silicon (series M1, M2, M3, M4 y posteriores). No se distribuyen pesos GGUF ni safetensors estandar de PyTorch, de modo que vLLM, TGI, llama.cpp y Ollama no pueden cargar este repositorio tal cual.
- GPU Nvidia (A100, H100, RTX 4090): no soportadas por el formato MLX sin conversion previa a otro runtime.
- Cabe sobradamente en equipos de consumo con Apple Silicon, incluidos Mac con memoria unificada de 8 GB.
- Integracion de codigo: `from mlx_qwen3_asr import ForcedAligner`, con `aligner.align(audio_16khz_mono, transcript, "Korean")`, probado con mlx-qwen3-asr==0.4.4.
- Latencia: entre 10,5 s y 25,4 s para alinear los diez fragmentos de validacion en Apple Silicon (full 8-bit: 7,5 - 14,4 s; all 4-bit: 9,6 - 16,3 s). El throughput no se especifica por segundo de audio.

## Comparativa con modelos similares

| Modelo | Precision | Parametros | Tamano de pesos | Licencia | Runtime |
|---|---|---|---|---|---|
| ethansipark/Qwen3-ForcedAligner-0.6B-8enc4dec-MLX (este) | 8 bits encoder / 4 bits decoder | 1.229.680.256 | 678.885.348 bytes (678,9 MB) | Apache-2.0 | MLX |
| ethansipark/Qwen3-ForcedAligner-0.6B-8bit-full-MLX (base directa) | 8 bits completo | 1.229.680.256 | 979.502.446 bytes (979,5 MB) | Apache-2.0 | MLX |
| mlx-community/Qwen3-ForcedAligner-0.6B-4bit | 4 bits | No disponible | No disponible | Apache-2.0 | MLX |
| mlx-community/Qwen3-ForcedAligner-0.6B-8bit | 8 bits | No disponible | No disponible | Apache-2.0 | MLX |
| Qwen/Qwen3-ForcedAligner-0.6B (original) | BF16 | No disponible | No disponible | Apache-2.0 | PyTorch / transformers |

Diferencia de tamano declarada por el autor: este checkpoint es 300,6 MB (30,7%) mas pequeno que el checkpoint completo en 8 bits. En la validacion, la secuencia de texto por palabra coincide con la referencia en 10 de 10 fragmentos y la precision de atribucion de hablante es identica (0,9377), mientras que la version all 4-bit pierde ligeramente (0,9376) y desplaza mas limites temporales.

## Limitaciones y advertencias

- Validacion muy limitada: diez fragmentos de una unica grabacion de radiodifusion coreana con un solo hablante. No dice nada sobre otros hablantes, acentos, ruido, habla solapada, musica ni otros idiomas.
- Las marcas temporales no son verdad de referencia verificada por humanos: se compararon contra otra ejecucion cuantizada del mismo modelo. Una repeticion del mismo checkpoint con un texto de entrada ligeramente distinto ya desplaza los limites unos 36-40 ms de media, lo que acota la sensibilidad del metodo.
- En el conjunto de validacion cambio aproximadamente un salto de linea de transcripcion por cada fragmento de cinco minutos respecto al checkpoint completo en 8 bits, en ambas direcciones; esa agrupacion depende de una regla fija de 1,5 s y es sensible al ruido de marcas temporales.
- La atribucion de hablante esta limitada por el modelo de diarizacion, no por el alineador: los fragmentos con precision entre 0,69 y 0,91 puntuaron igual en los tres checkpoints.
- No se incluye audio ni transcripcion de AI Hub en el repositorio.
- Es una recuantizacion, no un ajuste fino: no aporta ninguna capacidad nueva sobre el modelo base y hereda sus sesgos y limitaciones.
- Restriccion practica de despliegue: al estar en formato MLX, no es directamente utilizable en infraestructura Nvidia ni en servidores Linux con GPU.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones de los modelos de los que deriva y de cualquier dato de AI Hub usado en evaluaciones.
- El recuento de etiquetas de hablante y de saltos de linea modificados sugiere que, en produccion, la salida no debe considerarse determinista entre ejecuciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ethansipark/Qwen3-ForcedAligner-0.6B-8enc4dec-MLX
- Checkpoint base directo (8 bits completo): https://huggingface.co/ethansipark/Qwen3-ForcedAligner-0.6B-8bit-full-MLX
- Version comunitaria 8 bits: https://huggingface.co/mlx-community/Qwen3-ForcedAligner-0.6B-8bit
- Version comunitaria 4 bits: https://huggingface.co/mlx-community/Qwen3-ForcedAligner-0.6B-4bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
