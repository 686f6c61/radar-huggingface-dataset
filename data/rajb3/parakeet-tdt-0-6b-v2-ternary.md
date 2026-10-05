# rajb3/parakeet-tdt-0.6b-v2-ternary

## Resumen

Parakeet-TDT-0.6B-v2-ternary es una versión con pesos ternarios del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-tdt-0.6b-v2, publicada por el usuario rajb3. El modelo original, desarrollado por NVIDIA, es un sistema de transcripción de voz a texto en inglés de aproximadamente 600 millones de parámetros basado en una arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer). Esta variante cuantizada reduce el tamaño del fichero de pesos de 2.472 MB a 180,8 MB restringiendo las proyecciones de atención, las proyecciones feed-forward y las convoluciones pointwise del codificador de 24 capas a tres valores posibles (-1, 0, +1), lo que representa en torno al 98 por ciento de los parámetros del modelo.

La relevancia de esta ficha radica en que demuestra que es posible aplicar cuantización ternaria extrema a un modelo ASR de producción manteniendo una degradación de precisión moderada. Según los datos declarados por el autor, el WER medio en los siete conjuntos de prueba del Open ASR Leaderboard que se pudieron evaluar pasa del 6,45 por ciento en FP32 al 6,84 por ciento en la versión ternaria, un incremento de 0,39 puntos. La recuperación de precisión se logra mediante entrenamiento consciente de cuantización (QAT) con destilación de conocimiento desde el modelo original.

El modelo conserva el pipeline de automatic-speech-recognition, la licencia cc-by-4.0 y el soporte exclusivo del idioma inglés. Al estar empaquetado en formato NeMo y no incluir cuantizaciones adicionales publicadas más allá de los pesos ternarios, su interés principal es la investigación sobre compresión de modelos y el despliegue en entornos con restricciones severas de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador de 24 capas) con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | Aproximadamente 600 millones (0,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos ternarios {-1, 0, +1} en el codificador con una escala FP32 por fila de salida; el resto de componentes en precision original |
| Idiomas soportados | Ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | NeMo (.nemo); tamano del fichero 180,8 MB frente a 2.472 MB del original |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo parakeet-tdt-0.6b-v2 de NVIDIA: un codificador FastConformer de 24 capas combinado con un decodificador TDT. FastConformer es una variante del transformer Conformer que reduce el coste computacional mediante downsampling de la secuencia de entrada, lo que permite procesar audio de forma eficiente en tareas de transcripción de alta capacidad. El decodificador TDT predice conjuntamente tokens y duraciones, lo que elimina la necesidad de modelos de lenguaje externos, puntuación o formatos de normalización inversa, ya que el propio modelo acústico genera puntuación, mayúsculas y formato de manera nativa.

La innovación de esta variante concreta es la aplicación de cuantización ternaria a todas las matrices grandes del codificador: las proyecciones de atención, las proyecciones feed-forward y las convoluciones pointwise, que en conjunto suponen alrededor del 98 por ciento de los parámetros. Cada fila de salida conserva una única escala en FP32, de modo que los pesos efectivos se reconstruyen como el producto de dicha escala por un valor ternario. Para recuperar la precisión perdida por la cuantización, el autor emplea entrenamiento consciente de cuantización (QAT) con destilación de conocimiento desde el modelo original en FP32. Los datos de entrenamiento y ajuste citados en la ficha son espnet/yodas-granary, openslr/librispeech_asr, MLCommons/peoples_speech, facebook/voxpopuli y edinburghcstr/ami. No se especifica el número exacto de tokens ni la composición detallada del dataset de destilación. Como referencia negativa, el propio autor indica que aplicar el mismo cuantizador ternario sin entrenamiento posterior degrada el WER al 100 por ciento en todos los conjuntos, lo que subraya la necesidad del proceso QAT con destilación.

## Capacidades

- Transcripcion de voz a texto en ingles a partir de audio, con salida de texto plano.
- Generacion nativa de puntuacion, mayusculas y formato inverso (ITN) sin modelos auxiliares.
- Decodificacion con el algoritmo TDT propio del modelo, configurada para decodificacion greedy.
- Procesamiento de audio de diversa procedencia: lectura de libros, reuniones, podcasts, discursos y llamadas telefonicas (segun los conjuntos de evaluacion empleados).
- No dispone de soporte de tool calling ni function calling (es un modelo ASR, no un modelo de lenguaje conversacional).
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles; no se declara soporte de otros idiomas.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede convertir grabaciones de reuniones en texto con puntuacion y mayusculas nativas, adecuado para generar actas automaticas; los conjuntos AMI y Earnings-22 del leaderboard son representativos de este tipo de audio.
- Subtitulado de contenido audiovisual: la generacion nativa de puntuacion y formato permite producir subtitulos listos para publicacion sin post-procesado adicional, con una latencia baja al tratarse de un modelo de 0,6B parametros.
- Analitica de voz en atencion al cliente: transcripcion de llamadas y conversaciones para su posterior analisis de sentimiento, busqueda de palabras clave o control de calidad, con un WER declarado del 11,72 por ciento en Earnings-22.
- Despliegue en dispositivos con memoria limitada: con un fichero de pesos de solo 180,8 MB, es viable ejecutar transcripcion en entornos de borde o en sistemas con VRAM reducida, algo impracticable con el modelo original de 2.472 MB.
- Investigacion en compresion de modelos: sirve como referencia para estudiar el impacto de la cuantizacion ternaria en tareas de ASR y comparar estrategias de QAT con destilacion.
- Generacion de transcripciones de alta fidelidad en ingles: con un WER del 2,05 por ciento en LibriSpeech test-clean, es adecuado para producir transcripciones de libros y contenido leido con minima intervencion humana.
- Procesamiento por lotes de archivos de audio: al reducir el peso del modelo, es posible desplegar varias instancias por GPU o procesar lotes grandes en infraestructura modesta.

## Benchmarks y rendimiento

Resultados declarados por el autor de la model card (WER en porcentaje, decodificacion greedy). La columna "Original FP32 (autor)" se refiere a la puntuacion del modelo original realizada por el propio autor del modelo ternario; "Original NVIDIA" son los valores publicados por NVIDIA.

| Modelo | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media de 7 | Common Voice |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Original NVIDIA (publicado) | 1,69 | 3,19 | 11,16 | 11,15 | 9,74 | 2,17 | 5,95 | 6,44 | n/d |
| Original FP32 (puntuacion del autor) | 1,70 | 3,19 | 11,15 | 11,24 | 9,78 | 2,14 | 5,94 | 6,45 | 8,50 |
| Mismo cuantizador ternario, sin entrenamiento | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 |
| Este modelo (ternario) | 2,05 | 4,20 | 10,42 | 11,72 | 10,35 | 2,94 | 6,19 | 6,84 | 12,56 |
| Diferencia frente a FP32 del autor (puntos) | +0,36 | +1,01 | -0,72 | +0,48 | +0,57 | +0,81 | +0,25 | +0,39 | +4,06 |
| Ratio frente a FP32 del autor | 1,21x | 1,32x | 0,94x | 1,04x | 1,06x | 1,38x | 1,04x | 1,06x | 1,48x |

Notas aportadas por el autor: los conjuntos de prueba proceden del bundle Open ASR Leaderboard hf-audio/esb-datasets-test-only-sorted (revision b6bdcd0beb, configuraciones originales); se evaluan todas las locuciones. La media de 7 es la media no ponderada sobre los ocho conjuntos que NVIDIA reporta para este modelo, excluyendo TED-LIUM, que no esta disponible en el bundle publico. Common Voice se reporta aparte y muestra la mayor brecha (+4,06 puntos) al no formar parte de la mezcla de entrenamiento. La puntuacion se realiza con WER a nivel de corpus usando el normalizador de texto de Whisper en ingles, en FP32 estricto (sin TF32).

Nota: estos resultados no estan verificados por una organizacion independiente (verified: false en el model-index).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Dado el tamano del fichero de pesos (180,8 MB) y que la mayor parte de los parametros estan en formato ternario con escalas FP32, la huella en memoria es sustancialmente inferior a la del modelo original de 0,6B parametros en FP32.
- GPU recomendadas: no disponible de forma especifica para esta variante cuantizada; el modelo original se sirve mediante NVIDIA NIM y el tenant NGC Parakeet de 0,6B.
- Compatibilidad con GPU de consumo: no disponible de forma explicita. El tamano reducido del fichero de pesos sugiere que podria caber en GPU de consumo con memoria modesta, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: NeMo (libreria declarada del modelo); NVIDIA NIM sirve la familia Parakeet TDT 0,6B. No se confirman otros runners (vLLM, llama.cpp, Ollama, TGI) para esta variante cuantizada, dado que el formato de pesos es .nemo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (LS clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v2-ternary (este modelo) | 0,6B (ternario en el 98 por ciento) | No disponible | 2,05 | cc-by-4.0 | HuggingFace (rajb3) |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6B | No disponible | 1,69 (publicado por NVIDIA) | No disponible en la informacion | HuggingFace (NVIDIA) |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | No disponible | No disponible | No disponible | HuggingFace (NVIDIA) |

La principal alternativa es el modelo original parakeet-tdt-0.6b-v2, del que esta variante deriva: comparte arquitectura, tamano de parametros y licencia base, pero sacrifica precision (incremento de la media de WER de 6,45 a 6,84 por ciento) a cambio de reducir el fichero de pesos un factor cercano a 13,7x. La version v3 amplia el soporte a 25 idiomas europeos con deteccion automatica de idioma, por lo que no es directamente comparable para tareas exclusivamente en ingles.

## Limitaciones y advertencias

- Soporte limitado exclusivamente al ingles; no cubre otros idiomas ni deteccion automatica de idioma.
- Degradacion de precision no uniforme: la mayor brecha se produce en Common Voice (+4,06 puntos de WER, ratio 1,48x), un conjunto que no forma parte de la mezcla de entrenamiento, lo que sugiere peor generalizacion fuera de dominio.
- Riesgo de alucinacion y errores de transcripcion, especialmente en audio con ruido, acentos no representados en el entrenamiento o dominios alejados de los datos usados.
- Los resultados de benchmarks no estan verificados de forma independiente (verified: false).
- Los conjuntos de entrenamiento citados (YODAS-Granary, LibriSpeech, People's Speech, VoxPopuli, AMI) pueden introducir sesgos de dominio y de acento; no se documenta la composicion exacta ni la distribucion demografica.
- La licencia cc-by-4.0 permite uso comercial con atribucion, pero es necesario revisar las condiciones del modelo base nvidia/parakeet-tdt-0.6b-v2, cuya licencia no se especifica en la informacion disponible.
- El formato de pesos es .nemo, lo que puede limitar la integracion con ecosistemas que esperan safetensors o GGUF; no se confirman conversiones a otros formatos.
- La aplicacion del cuantizador ternario sin el entrenamiento QAT con destilacion produce un colapso total del modelo (WER del 100 por ciento), lo que indica que la receta de recuperacion es critica y no debe alterarse sin revalidacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rajb3/parakeet-tdt-0.6b-v2-ternary
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Version multilingue v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- NVIDIA NIM (parakeet-tdt-0.6b-v2): https://build.nvidia.com/nvidia/parakeet-tdt-0_6b-v2
- NVIDIA NIM (despliegue): https://build.nvidia.com/nvidia/parakeet-tdt-0_6b/deploy
- Repositorio no oficial en GitHub: https://github.com/jasonhoblin/nvidia-parakeet-tdt-0.6b-v2
- Coleccion Parakeet 0.6B TDT en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- Bundle de evaluacion Open ASR Leaderboard: https://huggingface.co/datasets/hf-audio/esb-datasets-test-only-sorted
- Paper de referencia (arxiv:2406.00899)
- Paper de referencia (arxiv:2505.13404)
