# pakutoma/hiragana-parakeet-reazonspeech-v2

## Resumen

`hiragana-parakeet-reazonspeech-v2` es un modelo de reconocimiento automático del habla (ASR) para japones, desarrollado por el usuario pakutoma, especializado en transcribir audio a **lectura en hiragana** en lugar de a texto con kanji. Se trata de un ajuste fino (SFT) del modelo `kizuna-intelligence/hiragana-parakeet-tdt-ctc-0.6b-ja-beta`, que a su vez deriva del `nvidia/parakeet-tdt_ctc-0.6b-ja`. El objetivo no es la transcripcion ortografica convencional, sino generar la pronunciacion fonetica en hiragana, un paso intermedio necesario para construir datasets de lectura (furigana) a gran escala.

El modelo resuelve un problema concreto: la generacion automatica de etiquetas de lectura fiables para corpus de voz japoneses. La model card indica que se uso para inferir la lectura de los 21.932.215 enunciados del dataset `pakutoma/reazonspeech-v2-reading`, partiendo de un ajuste fino sobre 791.247 enunciados de ReazonSpeech v2 con etiquetas estrictas de hiragana (lecturas de numerales corregidas y particulas ortograficas `は`/`へ`/`を` unificadas).

Arquitectonicamente es un modelo compacto (aproximadamente 0,6B de parametros, segun la nomenclatura del modelo base) basado en un encoder Conformer de 24 capas con `d_model=1024` y decodificacion hibrida RNNT/TDT mas CTC auxiliar. Su relevancia actual radica en que permite generar etiquetas de pronunciacion a escala de millones de horas sin supervision manual, un cuello de botella habitual en la construccion de sistemas TTS, furigana y evaluacion de lectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo `EncDecHybridRNNTCTCBPEModel` (encoder Conformer de 24 capas, `d_model=1024`, RNNT/TDT + CTC auxiliar) |
| Parametros totales | no disponible (la nomenclatura del modelo base indica 0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana dependiente del audio de entrada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato `.nemo`; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | japones (`ja`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (`hiragana-parakeet-strict-final.nemo`, 2.466.969.600 bytes / ~2,30 GiB) |
| Frecuencia de muestreo | 16.000 Hz |
| Tokenizador | Unigram/BPE de hiragana, vocabulario de 512 (heredado del modelo base) |
| Decodificacion recomendada | TDT greedy (`decoding.model_type = tdt`, `strategy = greedy_batch`) |
| SHA256 del archivo | `5708b457237e0bd67bb380e11a2fcaef1fc20f589b4f524f887f8b2462c835ba` |

## Arquitectura y entrenamiento

El modelo emplea la clase `EncDecHybridRNNTCTCBPEModel` de NVIDIA NeMo, con un encoder Conformer de 24 capas y dimension de modelo 1024. La cabeza de decodificacion es hibrida: RNNT con decodificacion TDT (Token-and-Duration Transducer) como modo principal, mas una cabeza CTC auxiliar. El tokenizador es un Unigram/BPE de 512 tokens restringido a hiragana, lo que fuerza la salida a caracteres de lectura y evita la ambiguedad ortografica del kanji.

El ajuste fino se realizo sobre 791.247 enunciados de ReazonSpeech v2 seleccionados por contener candidatos a numerales, con 197.808 pasos de entrenamiento. Los segmentos de audio se recortaron previamente usando los timestamps de caracteres de `nvidia/parakeet-tdt_ctc-0.6b-ja` para eliminar desbordamientos fuera de los subtitulos. Las etiquetas docente se construyeron a partir de las salidas de `Parakeet-Inc/furigana_whisper_small_jsut`, corrigiendo los tramos de numerales verificados y unificando a forma escrita las particulas `は`, `へ` y `を` que Sudachi identificaba como independientes. No se documenta uso de RLHF ni DPO; se trata de aprendizaje supervisado clasico sobre etiquetas corregidas.

## Capacidades

- Reconocimiento automatico del habla en japones con salida exclusiva en hiragana (lectura fonetica).
- Manejo correcto de lecturas de numerales, un punto historicamente problematico en la conversion a lectura.
- Normalizacion de particulas ortograficas (`は`/`へ`/`を`) a su forma escrita cuando Sudachi las clasifica como particulas independientes.
- Decodificacion TDT greedy por lotes, adecuada para inferencia a gran escala.
- Cabeza CTC auxiliar disponible para decodificacion alternativa.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento.
- Capacidad multilingue limitada al japones.

## Casos de uso

- **Generacion de datasets de lectura (furigana) a escala**: es el uso documentado por el autor; permite inferir la lectura en hiragana de millones de enunciados (21,9M en el dataset asociado) para alimentar corpus de entrenamiento de TTS o de anotacion de furigana.
- **Anotacion de corpus para TTS en japones**: al producir pronunciacion directa en hiragana, elimina el paso de conversion kanji-a-lectura y reduce errores en sistemas de sintesis de voz.
- **Evaluacion de lectura y sistemas educativos**: puede transcribir la lectura de un estudiante y compararla con la referencia esperada, util en aplicaciones de aprendizaje de japones.
- **Preprocesado de pipelines de subtitulado fonetico**: integrado en un pipeline con NeMo, permite generar subtitulos de pronunciacion para contenido audiovisual japones.
- **Investigacion en ASR japones**: sirve como modelo base o de referencia para estudiar el efecto de etiquetas estrictas de lectura en la calidad del reconocimiento.
- **Construccion de lexicos de pronunciacion**: combinado con la seleccion del candidato mas cercano del diccionario Sudachi, la model card reporta una CER del 0,978 % y un 85 % de coincidencia exacta en la evaluacion provisional, lo que lo hace viable para generar entradas lexicas curadas.
- **Alineacion y segmentacion de audio**: los timestamps de caracteres del modelo base asociado permiten recortar y alinear segmentos de audio con su transcripcion.

## Benchmarks y rendimiento

Evaluacion provisional del autor sobre 100 audios extraidos aleatoriamente de ReazonSpeech v2, con lectura de referencia asignada de forma provisional por un LLM a partir de audio y texto original:

| Modelo / configuracion | CER | Coincidencia exacta |
|---|---:|---:|
| Base: `kizuna-intelligence/hiragana-parakeet-tdt-ctc-0.6b-ja-beta` | 13,43 % | 10 / 100 |
| **Este modelo (`hiragana-parakeet-strict-final.nemo`) solo** | **5,43 %** | **42 / 100** |
| Este modelo + seleccion del vecino mas cercano entre candidatos del diccionario Sudachi | 0,978 % | 85 / 100 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo `.nemo` ocupa aproximadamente 2,30 GiB; en FP32 la huella en memoria ronda los 2,5-3 GiB, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas. Tambien puede ejecutarse en CPU con `map_location="cpu"`, aunque con mayor latencia.
- Cabe en GPU de consumo: si, practicamente en cualquier modelo moderno con 4 GB o mas.
- Opciones de despliegue: NVIDIA NeMo (`nemo_toolkit[asr]`) es la via documentada. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (evaluacion provisional) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo** | ~0,6B | no disponible | 5,43 % (solo) / 0,978 % (con Sudachi) | CC-BY-4.0 | Hugging Face |
| `kizuna-intelligence/hiragana-parakeet-tdt-ctc-0.6b-ja-beta` | ~0,6B | no disponible | 13,43 % | Apache-2.0 | Hugging Face |
| `nvidia/parakeet-tdt_ctc-0.6b-ja` | ~0,6B | no disponible | no disponible | CC-BY-4.0 | Hugging Face |
| `Parakeet-Inc/furigana_whisper_small_jsut` | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a la familia Parakeet; no se dispone de datos de benchmarks de alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion reportada es **provisional**: la referencia de lectura fue asignada por un LLM a partir de audio y texto, no por anotacion humana, por lo que las cifras de CER deben tomarse con cautela.
- El modelo solo produce hiragana; no genera kanji ni texto ortografico convencional, lo que lo inutiliza para transcripcion estandar.
- Solo soporta japones; no hay capacidades multilingues.
- Puede heredar sesgos del corpus ReazonSpeech v2 y de los modelos docentes empleados en la construccion de etiquetas.
- Riesgo de alucinacion en pasajes con ruido, habla solapada o numerales ambiguos; la correccion con diccionario Sudachi mitiga parte del problema pero no lo elimina.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; es necesario citar tanto este modelo como los modelos base de Kizuna Intelligence y NVIDIA Corporation.
- El entrenamiento uso ReazonSpeech v2 bajo CDLA-Sharing-1.0 y el articulo 30-4 de la ley de derechos de autor japonesa; conviene revisar las obligaciones de atribucion en despliegues comerciales.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento; su uso esta acotado a ASR.
- El formato `.nemo` requiere NeMo para su carga; no hay conversiones oficiales a GGUF u otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pakutoma/hiragana-parakeet-reazonspeech-v2
- Dataset generado: https://huggingface.co/datasets/pakutoma/reazonspeech-v2-reading
- Modelo base directo: https://huggingface.co/kizuna-intelligence/hiragana-parakeet-tdt-ctc-0.6b-ja-beta
- Modelo base upstream (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- Modelo docente de etiquetas: https://huggingface.co/Parakeet-Inc/furigana_whisper_small_jsut
- Dataset de entrenamiento: https://huggingface.co/datasets/reazon-research/reazonspeech
