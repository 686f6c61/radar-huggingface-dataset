# oruk/orukeet-r15-0100

## Resumen

Orukeet R15-0100 es un modelo de reconocimiento automatico del habla (ASR) publicado por el usuario oruk en Hugging Face, construido como un ajuste del modelo nvidia/parakeet-tdt-0.6b-v3. Se distribuye en formato nativo de NeMo (`.nemo`) y su proposito declarado es preservar el checkpoint original R15-0100 como propuesta de checkpoint anterior para el envio n.º 221 del leaderboard Open ASR de Hugging Face. El artefacto es identico al modelo archivado el 6 de septiembre de 2026 y no incorpora las etapas de entrenamiento posteriores (la continuacion FT-4035 y el ajuste directo sobre LibriSpeech test-other que dio lugar al checkpoint r3).

Tecnicamente se trata de un encoder FastConformer con decodificador TDT, heredado del modelo base de NVIDIA, sobre el que se ha aplicado adaptacion multilingue y de acentos, ademas de integrar kernels de Gabor temporales ajustados directamente en los pesos nativos. El autor no declara un recuento propio de parametros, pero al derivar del modelo base de 0,6B el orden de magnitud es de unos 600 millones de parametros. El fichero `orukeet-r15-0100.nemo` ocupa 2.509.342.720 bytes (SHA-256 `4295a6d820a40b99786331d1c7a6b6c328916c8329b23d39415b0649a5d42811`).

Su relevancia actual es metodologica mas que de rendimiento: la ficha documenta de forma explicita el historial de entrenamiento y la exposicion a conjuntos de evaluacion (LibriSpeech test-other, test-clean y VoxPopuli), algo poco habitual en modelos ASR publicados, y reporta resultados propios sobre los ocho conjuntos publicos en ingles del leaderboard Open ASR con un WER agregado del 4,90 % y un RTFx agregado de 5689,99 sobre NVIDIA H200. La aceptacion por parte de los mantenedores del leaderboard sigue pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | Aproximadamente 600 millones (heredados de nvidia/parakeet-tdt-0.6b-v3; no se declara recuento propio) |
| Longitud de contexto | No disponible. Modelo ASR, no aplica ventana de tokens; no se especifica duracion maxima de audio |
| Tipos de cuantizacion | No disponible. La evaluacion publicada se realizo en BF16 |
| Idiomas soportados | No disponible. La model card menciona "multilingual/accent adaptation" sin enumerar idiomas; toda la evaluacion publica es en ingles |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `.nemo` (formato nativo de NeMo, incluye pesos y configuracion). No se publican safetensors ni GGUF |
| Tamano del repositorio | 2,5 GB (fichero `orukeet-r15-0100.nemo`, 2.509.342.720 bytes) |
| Libreria | NeMo |
| Pipeline | automatic-speech-recognition |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Revision del repositorio | 073489c0619cd7939e327bebfc6c5d4ace4b69bf |
| Fecha de creacion | 19 de septiembre de 2026 |
| Ultima actualizacion | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: encoder FastConformer (variante de Conformer con atencion por bloques de complejidad lineal en el encoder, segun la descripcion del propio autor) y decodificador TDT, que predice de forma conjunta el token y su duracion. Sobre esta base, el autor indica que se aplico adaptacion multilingue y de acentos, y que los pesos nativos incorporan "fitted temporal Gabor kernels" materializados. El modelo se carga sin codigo personalizado mediante `ASRModel.restore_from(path)` de NeMo, lo que implica que la topologia y la configuracion son compatibles con el ecosistema estandar de NVIDIA.

El historial de entrenamiento es el elemento mas documentado de la ficha. R15-0100 es anterior a dos etapas posteriores: la continuacion FT-4035 (cuyas particiones de entrenamiento se seleccionaron con una evaluacion que incluia Monsoon English) y el ajuste fino directo sobre LibriSpeech test-other que produjo el checkpoint r3. Ninguna de esas dos etapas esta presente en estos pesos. El autor declara explicitamente exposicion previa a evaluacion: la receta original de adaptacion incluia LibriSpeech test-other entre las entradas de validacion/evaluacion, y la seleccion de recuperacion que condujo a R15-0100 uso una suite de regresion con las 2.620 grabaciones de LibriSpeech test-clean. Tambien hubo evaluacion previa sobre VoxPopuli, cuyo solapamiento con la particion limpia actual no se ha establecido. El seguimiento de checkpoints estaba configurado en la receta inicial, pero la auditoria del autor no ha determinado si test-other afecto a la exportacion concreta de pasos fijos/EMA heredada por R15-0100, y el solapamiento con el preentrenamiento del modelo base no esta certificado de forma independiente.

## Capacidades

- Reconocimiento automatico del habla en ingles: transcripcion de audio a texto evaluada sobre los ocho conjuntos publicos en ingles del leaderboard Open ASR (AMI, Earnings22, GigaSpeech, LibriSpeech test-clean y test-other, SPGISpeech, VoiceArena Monsoon EN-IN y VoxPopuli).
- Adaptacion multilingue y de acentos: declarada por el autor, aunque sin enumeracion de idiomas ni resultados desglosados por lengua en la informacion disponible.
- Robustez ante acentos no nativos en ingles: el conjunto voicearena_monsoon_en_in se evalua con un WER del 3,98 %, lo que sugiere adaptacion especifica a habla con acento indio.
- Transcripcion con marcas de tiempo: el decodificador TDT puede emitir duraciones por token de forma nativa, lo que habilita alineaciones temporales a nivel de token o palabra (segun la topologia heredada del modelo base).
- Decodificacion por lotes: el perfil de evaluacion usa `greedy-batch` con `max_symbols=10` y lote de 128, lo que confirma soporte de inferencia batcheada eficiente.
- Reutilizacion de audio a resolucion original: la evaluacion respeta los limites originales del audio y el filtrado oficial de referencias.
- No soporta: generacion de texto libre, razonamiento, codigo, matematicas, vision, tool calling, function calling ni razonamiento multi-paso con agentes. Es exclusivamente un modelo ASR.

## Casos de uso

- Transcripcion de reuniones corporativas: el modelo puede procesar audio de reuniones con multiples hablantes y acentos variados con un coste bajo, dado que el checkpoint pesa 2,5 GB y se puede servir en una GPU unica. El WER del 6,50 % en earnings22_cleaned_aa_chunked (audio financiero con segmentacion larga) indica un comportamiento razonable en este dominio.
- Subtitulado automatico de video: con un RTFx agregado de 5689,99 sobre H200, una hora de audio se transcribe en el orden de fracciones de segundo en hardware de datacenter, lo que permite procesar catalogos completos en lote. La generacion de timestamps a nivel de token es util para sincronizar subtitulos.
- Analitica de contact center: transcripcion masiva de llamadas para posterior analisis de sentimiento o cumplimiento, con la ventaja de que el modelo se puede desplegar on-premise al distribuirse en NeMo, evitando enviar audio de clientes a APIs externas.
- Indexacion y busqueda de archivos de audio: transcripcion de podcasts, archivos de radio o grabaciones de voz para poblar indices de busqueda de texto completo. El rendimiento en gigaspeech_cleaned (7,95 % de WER) y spgispeech (3,39 %) es representativo de audio de dominio abierto y locucion profesional respectivamente.
- Investigacion en ASR y evaluacion reproducible: el autor publica el evaluador anclado, las instrucciones de reproduccion, los hashes de salida y los metadatos de evaluacion, lo que permite replicar los numeros y auditar la metodologia en lugar de aceptar cifras sin trazabilidad.
- Punto de partida para ajuste fino propio: al ser un `.nemo` cargable con `ASRModel.restore_from`, un equipo puede usarlo como inicializacion para adaptarlo a un dominio especifico (medico, legal, jerga industrial) usando las recetas de NeMo.
- Sistemas de accesibilidad: transcripcion en vivo de audio para personas con discapacidad auditiva en un despliegue local, aunque la latencia en streaming no esta documentada en la informacion disponible.

## Benchmarks y rendimiento

Evaluacion publica en ingles del leaderboard Open ASR, realizada el 19 de septiembre de 2026 (UTC) sobre las 74.443 grabaciones elegibles de los ocho conjuntos publicos. Mediciones autoinformadas; la aceptacion oficial y la posicion en el conjunto privado estan pendientes.

Perfil de evaluacion: NVIDIA H200, NeMo 2.7.2, Torch 2.8.0, BF16, lote 128, decodificacion `greedy-batch`, `max_symbols=10`, un worker de carga de datos, limites de audio originales y filtrado oficial de referencias. Los tiempos corresponden a una pasada completa de transcripcion, delimitada por sincronizacion CUDA, tras hasta cuatro lotes de calentamiento.

| Conjunto de datos | WER (%) | RTFx en H200 |
|:--|--:|--:|
| ami_cleaned | 9,69 | 3625,50 |
| earnings22_cleaned_aa_chunked | 6,50 | 2980,66 |
| gigaspeech_cleaned | 7,95 | 5474,17 |
| librispeech_test_clean | 1,49 | 4076,97 |
| librispeech_test_other | 3,11 | 4144,22 |
| spgispeech | 3,39 | 6700,20 |
| voicearena_monsoon_en_in | 3,98 | 4862,19 |
| voxpopuli_cleaned_aa | 3,07 | 2620,26 |
| **Agregado de los ocho publicos** | **4,90** | **5689,99** |

Notas del autor: el RTFx agregado es el audio total dividido por el tiempo total de inferencia medido, no la media aritmetica de los RTFx por conjunto. Monsoon no tiene tarea de metrica registrada en el Hub, y los ocho resultados se conservan sin inventar un ID de tarea. El WER del 4,49 % en los ocho publicos corresponde al checkpoint r3 y no aplica a R15-0100.

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: con unos 600 millones de parametros en BF16, los pesos ocupan aproximadamente 1,2 GB. El fichero `.nemo` completo ocupa 2,5 GB, de modo que se puede esperar un uso de VRAM en el rango de 2 a 6 GB segun el tamano de lote y la duracion de los segmentos de audio. No se publican mediciones de VRAM en la informacion disponible.
- GPU de datacenter: la evaluacion oficial se ejecuto en NVIDIA H200. Tambien es adecuada cualquier GPU con soporte BF16 y suficiente memoria, como A100 o H100, donde el modelo queda holgadamente dentro de memoria.
- GPU de consumo: el modelo cabe sin dificultad en GPU de consumo con 8 GB o mas, como RTX 3060, RTX 4060, RTX 3080, RTX 4070, RTX 4080 o RTX 4090, dado el reducido tamano de parametros. No se publican mediciones de latencia especificas para estas tarjetas.
- Despliegue: NeMo (carga mediante `ASRModel.restore_from`). Tambien son viables NVIDIA Riva y Triton con el backend de NeMo. No hay soporte publicado para llama.cpp, Ollama, vLLM ni TGI, ya que el artefacto solo se distribuye en formato `.nemo` y no en GGUF ni safetensors.
- Rendimiento medido: RTFx agregado de 5689,99 en H200 con lote 128 y BF16, lo que equivale a procesar aproximadamente 5689 segundos de audio por segundo de computo agregado en ese perfil.
- Requisitos de software: NeMo 2.7.2 y Torch 2.8.0 en el entorno de evaluacion reportado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / idiomas | WER agregado (8 publicos EN) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oruk/orukeet-r15-0100 | Aprox. 600 M | No disponible; evaluacion solo en ingles | 4,90 % | CC BY-SA 4.0 | Hugging Face, formato `.nemo` |
| nvidia/parakeet-tdt-0.6b-v3 (modelo base) | Aprox. 600 M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face, NeMo |
| orukeet r3 (etapa posterior mencionada en la model card) | No disponible | No disponible; evaluacion en ingles | 4,49 % (autoinformado, ocho publicos) | No disponible | No disponible en la informacion proporcionada |
| orukeet FT-4035 (continuacion mencionada, no publicada en este repositorio) | No disponible | No disponible | No disponible | No disponible | No incluida en estos pesos |

No se dispone de datos de comparacion con alternativas de otros desarrolladores (por ejemplo modelos de la familia Whisper) en la informacion proporcionada. Las unicas comparaciones trazables son internas a la propia linea de checkpoints del autor.

## Limitaciones y advertencias

- Exposicion a benchmarks no resuelta: el autor declara explicitamente que este checkpoint no es una reclamacion de ausencia de exposicion a benchmarks. La receta original incluia LibriSpeech test-other en validacion/evaluacion y la seleccion de recuperacion uso las 2.620 grabaciones de test-clean. El solapamiento con VoxPopuli cleaned no esta verificado.
- Influencia no determinada: la auditoria no ha establecido si test-other afecto a la exportacion concreta de pasos fijos/EMA heredada por R15-0100, ni si el monitor `val_wer` (que seguia FLEURS en los registros inspeccionados) interactuo con esa exportacion.
- Solapamiento con el preentrenamiento del modelo base no certificado de forma independiente.
- Resultados autoinformados: los WER y RTFx provienen del propio autor, no de una evaluacion oficial. La aceptacion por los mantenedores y la posicion en el conjunto privado del leaderboard estan pendientes.
- Alcance linguistico incierto: se declara adaptacion multilingue y de acentos, pero no se enumeran idiomas soportados ni se aportan resultados fuera del ingles. No se debe asumir cobertura multilingue verificada.
- Sin datos de cuantizacion: no se publican variantes cuantizadas ni formatos GGUF, lo que limita el despliegue en entornos con CPU o GPU de muy baja memoria.
- Dependencia de NeMo: la carga requiere la libreria NeMo y su pila de dependencias; no hay ruta de inferencia ligera equivalente a llama.cpp u Ollama.
- Licencia copyleft: CC BY-SA 4.0 exige atribucion y compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios. Conviene revisar la compatibilidad con la licencia del modelo base antes de un uso comercial.
- Riesgo de error de transcripcion: al ser un modelo ASR puro, puede producir alucinaciones de texto (inserciones o sustituciones) en audio con ruido, solapamiento de hablantes o dominios alejados del entrenamiento. El WER del 9,69 % en AMI evidencia el impacto de audio conversacional espontaneo.
- Sin soporte de instrucciones: no es un modelo generativo ni sigue instrucciones, por lo que no se debe usar para tareas de comprension, resumen o tool calling.
- Artefacto sin traccion en el Hub: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oruk/orukeet-r15-0100
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Pull request del leaderboard Open ASR: https://github.com/huggingface/open_asr_leaderboard/pull/221
- Space con el evaluador anclado y las instrucciones de reproduccion: https://huggingface.co/spaces/oruk/open-asr-leaderboard-orukeet
- Divulgacion completa de entrenamiento: https://huggingface.co/oruk/orukeet-r15-0100/blob/main/training-disclosure.md
- Procedencia del checkpoint: https://huggingface.co/oruk/orukeet-r15-0100/blob/main/checkpoint-provenance.json
- Resultados completos y hashes de salida: https://huggingface.co/oruk/orukeet-r15-0100/blob/main/evaluation/open_asr_20260919/public-eight-h200-results.json
- Metadatos de evaluacion en el Hub: https://huggingface.co/oruk/orukeet-r15-0100/blob/main/.eval_results/open_asr_leaderboard.yaml
