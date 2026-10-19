# hacktogone/parakeet-tdt-0.6b-v3

## Resumen

Parakeet TDT 0.6B v3 es un modelo de reconocimiento automático del habla (ASR) de tipo transducer, con unos 627 millones de parámetros, que combina un encoder FastConformer con un decoder TDT (Token-and-Duration Transducer). Está diseñado para transcribir audio en 25 idiomas europeos (entre ellos el castellano) con un coste computacional bajo, lo que lo sitúa en la franja de modelos "pequeños pero competitivos" frente a alternativas de más de mil millones de parámetros. Según los tags, los datasets y las referencias arXiv, el repositorio reproduce la ficha y los pesos del modelo Parakeet TDT 0.6B v3 de NVIDIA, publicado bajo licencia CC BY 4.0.

El problema que resuelve es doble: por un lado, ofrecer una única red multilingüe para lenguas europeas con qualidade razonable (WER de 3,45 en castellano sobre FLEURS), y por otro, mantener el coste de inferencia lo bastante contenido como para desplegar transcripción masiva en GPUs de consumo. Frente a arquitecturas encoder-decoder autoregresivas, el decoder TDT predice conjuntamente token y duración, lo que reduce el número de pasos de decodificación y permite derivar marcas temporales de forma natural.

Es relevante ahora por tres motivos: la cobertura de 25 idiomas europeos en un solo checkpoint, la licencia CC BY 4.0 que permite uso comercial sin restricciones de tipo NC, y su tamaño, que lo hace viable en una sola GPU consumer. El repositorio analizado es una redistribución no oficial, con 0 descargas en el momento de la consulta, por lo que conviene contrastarlo con el checkpoint original antes de llevarlo a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer (familia Conformer, transformer con convoluciones depthwise) + decoder TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.057.286 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; es un modelo de audio y la model card no declara ventana máxima de entrada |
| Tipos de cuantizacion | safetensors en precisión original; se declara GGUF en los tags, pero no se detallan niveles ni se confirma su publicación efectiva |
| Idiomas soportados | 25 lenguas europeas: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors; GGUF declarado en tags; artefactos NeMo (tag "nemo"); tamaño del repo 5,7 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema transducer: un encoder FastConformer procesa las features acústicas y un decoder TDT genera directamente tokens de texto junto con su duración, evitando el bucle autoregresivo token a token de los modelos attention encoder-decoder. Esta formulación es la que describe el trabajo "Efficient Sequence Transduction by Jointly Predicting Tokens and Durations" (arXiv 2304.06795), referencia incluida en la model card, mientras que el encoder FastConformer procede de arXiv 2305.05084. La combinación reduce la latencia de decodificación y proporciona alineamientos temporales implícitos, lo que habilita marcas de tiempo a nivel de token sin un modelo de alineamiento adicional.

En cuanto a los datos, la model card declara los corpus `nvidia/Granary` y `nemo/asr-set-3.0` como datasets de entrenamiento. Granary es el conjunto multilingüe de NVIDIA orientado a lenguas europeas, coherente con la lista de 25 idiomas. No se especifican en la información proporcionada el número total de horas, la composición exacta del dataset, ni si hubo etapas de ajuste fino supervisado adicionales, RLHF o DPO. Tampoco se detallan innovaciones de decodificación más allá del propio esquema TDT (no hay mención a decodificación especulativa ni a atención lineal en la información disponible).

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con un único checkpoint, sin necesidad de seleccionar un modelo por idioma.
- Alineamiento temporal derivado de las duraciones predichas por el decoder TDT, apto para generar marcas de tiempo por token o segmento.
- Extracción de características acústicas del encoder (el repositorio incluye el tag `feature-extraction`).
- Procesamiento por lotes de audio, con la eficiencia propia de un modelo de 627 M de parámetros.
- No soporta tool calling ni function calling: es un modelo ASR, no un modelo de lenguaje generativo.
- No soporta razonamiento multi-paso, uso de agentes ni planificación.
- No soporta visión, audio comprensivo (audio-LLM) ni generación de texto libre.
- No traduce: transcribe en el idioma detectado; no se documenta capacidad de traducción speech-to-text.
- La presencia de puntuación y mayúsculas en la salida no se confirma en la información disponible.

## Casos de uso

- **Actas de reuniones multilingües en entornos corporativos europeos**: el modelo obtiene 11,31 % de WER en AMI (ihm), un corpus de reuniones con solapamiento de hablantes y ruido de sala; con un único modelo se cubren equipos que alternan castellano, francés, alemán e inglés.
- **Subtitulado y postproducción de vídeo**: las duraciones predichas por el decoder TDT permiten generar subtítulos con marcas temporales sin un forzado de alineamiento posterior, lo que simplifica el pipeline respecto a un encoder-decoder puro.
- **Análisis de centros de contacto y control de calidad**: con 627 M de parámetros y decodificación no autoregresiva, se pueden mantener varios flujos concurrentes por GPU; el WER de 6,14 % en Vox Populi (discurso parlamentario, audio espontáneo) da una referencia del rendimiento en habla natural ruidosa.
- **Archivado y cumplimiento normativo de audio**: la licencia CC BY 4.0 permite uso comercial y procesamiento de grabaciones de clientes sin las restricciones no comerciales de otras licencias de modelos ASR; la cobertura de 25 lenguas europeas encaja con requisitos de accesibilidad y documentación multilingüe.
- **Dictado y asistentes de voz en local**: el checkpoint en fp16 ocupa del orden de 1,25 GB de pesos, por lo que cabe en GPUs de gama media e incluso en CPU con cuantización, habilitando transcripción sin salida a la nube.
- **Pseudo-etiquetado de corpus de audio**: uso como generador de transcripciones preliminares para datasets propios en lenguas europeas poco representadas (esloveno, letón, maltés, estonio), que después se revisan y se emplean para ajuste fino de modelos mayores.
- **Accesibilidad en directo**: transcripción de clases, ponencias o comparecencias con una latencia baja gracias al esquema transducer, con la salvedad de que el modo streaming no está documentado en la información disponible.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. Todos figuran con `verified: false`, es decir, no han sido validados por un tercero. Los valores son WER en porcentaje (menor es mejor).

| Conjunto de evaluacion | Idioma | WER (%) |
|---|---|---|
| LibriSpeech (test-clean / test-other) | en | 1,93 / 3,59 |
| TED-LIUM v3 (test) | en | 2,75 |
| SPGI Speech (test) | en | 3,97 |
| Vox Populi (test) | en | 6,14 |
| GigaSpeech (test) | en | 9,59 |
| AMI Meetings (ihm, test) | en | 11,31 |
| Earnings-22 (test) | en | 11,42 |
| FLEURS (es_419) | es | 3,45 |
| FLEURS (en_us) | en | 4,85 |
| FLEURS (de_de) | de | 5,04 |
| FLEURS (fr_fr) | fr | 5,15 |
| FLEURS (cs_cz) | cs | 11,01 |
| FLEURS (bg_bg) | bg | 12,64 |
| FLEURS (fi_fi) | fi | 13,21 |
| FLEURS (et_ee) | et | 17,73 |
| FLEURS (da_dk) | da | 18,41 |
| FLEURS (el_gr) | el | 20,70 |

Notas sobre la tabla: en el `model-index` original, los dos valores de LibriSpeech (1,93 y 3,59) aparecen bajo una misma entrada con `config: other`, por lo que la asignación a test-clean y test-other es la convención habitual pero no está desambiguada en la información proporcionada. La lista de FLEURS está truncada en el idioma `hr` (croata): no se dispone de los valores de hu, it, lv, lt, mt, nl, pl, pt, ro, sk, sl, sv, ru y uk.

## Requisitos de hardware

- **Pesos**: 627 M de parámetros. En fp16/BF16 los pesos ocupan aproximadamente 1,25 GB; en fp32, unos 2,5 GB. El repositorio completo pesa 5,7 GB porque incluye varios artefactos.
- **VRAM estimada para inferencia**: del orden de 2-3 GB con lote 1 en fp16 incluyendo activaciones y buffers de decodificación; entre 8 y 16 GB para lotes grandes o audio de entrada largo.
- **GPU recomendadas**: cualquier GPU con 8 GB o más sirve para producción con lotes moderados (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4, A10). Para throughput alto, A100 40/80 GB o H100 permiten muchos flujos concurrentes por dispositivo.
- **GPU de consumo**: sí cabe, y con margen. Una RTX 3060 de 12 GB o incluso una GPU de 4-6 GB pueden ejecutar el modelo en fp16 con lote 1.
- **CPU**: viable en fp32 con un solo hilo de proceso para audio corto; el cuello de botella es el encoder convolucional, no el decoder.
- **Opciones de despliegue**: NeMo Toolkit (formato nativo del modelo), `transformers` con la clase `parakeet_tdt` (librería declarada), exportación a ONNX Runtime mediante NeMo, y servidores de inferencia tipo Triton o Riva. El soporte en vLLM, llama.cpp u Ollama no está confirmado en la información disponible, pese al tag GGUF.
- **Latencia y throughput**: no disponibles. No se han publicado cifras de RTFx ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Arquitectura | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 (este repo) | 627 M | 25 europeos | CC BY 4.0 | FastConformer + TDT | HuggingFace (redistribución no oficial) |
| NVIDIA Canary-1B | ~1 B | 4 (en, de, es, fr) | CC BY-NC 4.0 | FastConformer + decoder transformer | HuggingFace, NeMo |
| NVIDIA Canary-1B-v2 | ~1 B | 25 europeos | CC BY 4.0 | FastConformer + decoder transformer | HuggingFace, NeMo |
| OpenAI Whisper large-v3 | ~1,55 B | ~99 | MIT | Transformer encoder-decoder | HuggingFace, OpenAI |

La comparación de WER entre estos modelos no se incluye porque no se dispone de resultados evaluados con un pipeline homogéneo en la información proporcionada; los valores de la tabla de benchmarks son declarados por el autor y no verificados. En términos cualitativos, Parakeet TDT 0.6B v3 es la opción más ligera del grupo y la única de las listadas que combina 25 idiomas europeos con licencia permisiva y menos de mil millones de parámetros. Canary-1B-v2 iguala la cobertura lingüística y la licencia pero duplica el tamaño; Whisper large-v3 ofrece mucha mayor cobertura idiomática a costa de triplicar los parámetros y de una arquitectura autoregresiva más lenta en decodificación.

## Limitaciones y advertencias

- **Repositorio no oficial**: la cuenta `hacktogone` no es el canal de NVIDIA. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y no hay verificación de integridad de los pesos. Para producción, usar el checkpoint original de NVIDIA.
- **Benchmarks sin verificar**: todos los resultados del `model-index` figuran con `verified: false` y proceden del propio autor.
- **Idiomas con WER alto**: griego (20,70), danés (18,41) y estonio (17,73) sobre FLEURS están lejos de los 3,45 del castellano. No es un modelo homogéneo entre lenguas.
- **Sesgos no documentados**: no se publica información sobre sesgos por acento, género, edad o variedad dialectal. El castellano evaluado es `es_419` (variante latinoamericana), no `es_ES`, lo que puede afectar al rendimiento con acentos peninsulares.
- **Riesgo de alucinación**: como todo modelo ASR, puede generar texto plausible en tramos de silencio, música o ruido extremo, y entrar en bucles de repetición con audio degradado.
- **Sin segmentación de hablantes**: no se documenta diarización; el WER de 11,31 en AMI refleja la dificultad de las reuniones con solapamiento, pero no resuelve quién habla.
- **Sin traducción**: transcribe, no traduce. Para casos speech-to-text multilingüe hay que combinarlo con un modelo de traducción.
- **Streaming no confirmado**: no se documenta soporte de inferencia en tiempo real por chunks; conviene validarlo antes de diseñar un producto de subtitulado en directo.
- **Licencia**: CC BY 4.0 permite uso comercial, redistribución y obras derivadas con atribución. No impone restricciones de tipo no comercial, pero exige citar autoría y conservar el aviso de licencia.
- **Formato GGUF**: el tag está presente, pero no se confirma la disponibilidad real de archivos GGUF ni su compatibilidad con llama.cpp, lo que puede romper pipelines que asuman ese formato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hacktogone/parakeet-tdt-0.6b-v3
- Dataset de entrenamiento (Granary): https://huggingface.co/datasets/nvidia/Granary
- Dataset de entrenamiento (NeMo ASR set 3.0): https://huggingface.co/datasets/nemo/asr-set-3.0
- Referencia TDT (Token-and-Duration Transducer): https://arxiv.org/abs/2304.06795
- Referencia FastConformer: https://arxiv.org/abs/2305.05084
- Reference adicional en la model card: https://arxiv.org/abs/2509.14128
- Referencia adicional en la model card: https://arxiv.org/abs/2505.13404
- Referencia adicional en la model card: https://arxiv.org/abs/2410.01036
- Referencia adicional en la model card: https://arxiv.org/abs/2406.00899
- Referencia adicional en la model card: https://arxiv.org/abs/2205.12446
- Referencia adicional en la model card: https://arxiv.org/abs/2012.03411
- Referencia adicional en la model card: https://arxiv.org/abs/2007.10310
- Referencia adicional en la model card: https://arxiv.org/abs/1510.08484
- NVIDIA NeMo Toolkit: https://github.com/NVIDIA/NeMo
- Leaderboard de ASR de Hugging Face: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
