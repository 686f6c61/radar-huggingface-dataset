# MostafaAhmed98/Sabeq-ASR

## Resumen

Sabeq-ASR es un modelo de reconocimiento automático del habla (ASR) especializado en árabe, desarrollado por MostafaAhmed98 y publicado en HuggingFace bajo licencia CC-BY-4.0. Se basa en una arquitectura híbrida FastConformer con cabezas de decodificación RNN-T (Transducer) y CTC, construida sobre NVIDIA NeMo. Con 113 millones de parámetros, está diseñado para transcribir árabe estándar moderno y dialectos (golfo, egipcio, levantino y magrebí) en condiciones acústicas reales, incluyendo ruido.

El modelo aborda el problema de la transcripción precisa de árabe dialectal, un ámbito donde los modelos generativos grandes (Jais-ASR de 6B, Audar-ASR-V1-Turbo de 2,35B, Sygma-ASR-Arabic y Cohere Transcribe Arabic de 2B) dominaban el panorama. Sabeq-ASR logra un WER medio de 20,40% en los seis conjuntos de test del Open Universal Arabic ASR Leaderboard con beam search RNN-T, superando a esos modelos pese a ser entre 16 y 50 veces más pequeño.

Su relevancia actual radica en la eficiencia: un RTF medio de 0,01631 (aproximadamente 61 veces más rápido que tiempo real) y un pico de memoria de inferencia de 0,45 GB lo hacen apto para despliegue en producción de bajo coste, transcripción por lotes y aplicaciones de baja latencia sin necesidad de GPUs de gran capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido con decodificadores RNN-T (Transducer) y CTC |
| Parametros totales | 113M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de audio a 16 kHz mono) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Árabe (estándar moderno y dialectos: golfo, egipcio, levantino, magrebí) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo); no se indica conversión a safetensors o GGUF |

## Arquitectura y entrenamiento

Sabeq-ASR emplea un encoder FastConformer, una variante del Conformer con atención por bloques que reduce el coste computacional en secuencias largas, combinado con dos cabezas de decodificación: una RNN-T (Transducer) y una CTC. Esta configuración híbrida permite elegir entre decodificación greedy (CTC o RNN-T) y beam search RNN-T con `beam_size=20` y normalización de puntuaciones. El tokenizador es de tipo Unigram con un vocabulario de 1024 tokens, y la entrada de audio es mono a 16 kHz.

El modelo parte de un FastConformer base de 113M de parámetros y se ajusta finamente con NVIDIA NeMo sobre datos que cubren árabe estándar moderno y los dialectos del golfo, egipcio, levantino y magrebí, incluyendo condiciones acústicas ruidosas del mundo real. La model card no detalla el número exacto de horas de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal más allá del propio diseño FastConformer.

## Capacidades

- Reconocimiento automático del habla en árabe estándar moderno y dialectos regionales (golfo, egipcio, levantino, magrebí).
- Transcripción robusta en condiciones de ruido, con degradación medida y documentada (MASC-clean 5,43% WER frente a MASC-noisy 18,13% WER).
- Decodificación dual: greedy (más rápida) y RNN-T beam search con `beam_size=20` y normalización de puntuaciones (mayor precisión, 0,71 puntos de WER de mejora).
- Salida con métricas de WER y CER evaluables; el modelo reporta CER medio de 9,12% con beam search y 9,79% con greedy.
- Inferencia de alta eficiencia: RTF medio de 0,01631, aproximadamente 61 veces más rápido que tiempo real.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de visión o audio más allá del ASR.
- Capacidad multilingüe limitada exclusivamente al árabe; no se declaran otros idiomas.

## Casos de uso

- Transcripción por lotes de archivos de audio: con un RTF de 0,01631, el modelo procesa aproximadamente 61 horas de audio por hora de cómputo, lo que permite transcribir grandes volúmenes de grabaciones (entrevistas, reuniones, archivos históricos) en pipelines offline con GPUs modestas.
- Subtitulado y generación de actas en árabe: la ventana de audio a 16 kHz y la decodificación beam search RNN-T proporcionan transcripciones con WER competitivo (20,40% medio) aptas para generar subtítulos automáticos en contenido audiovisual en árabe estándar y dialectal.
- Atención al cliente y centros de contacto: el modelo maneja dialectos del golfo, egipcio, levantino y magrebí, lo que permite transcribir llamadas reales de clientes para análisis de calidad, búsqueda de palabras clave y cumplimiento normativo.
- Sistemas de voz a texto en dispositivos con recursos limitados: con 113M de parámetros y un pico de memoria de inferencia de 0,45 GB, puede desplegarse en GPUs de consumo o entornos edge para dictado y asistentes de voz en árabe.
- Investigación lingüística y dialectología: la evaluación desagregada por dialectos (MGB-2 9,89% WER, SADA22 28,29% WER, Casablanca 53,63% WER) permite a investigadores analizar el rendimiento diferencial por variedad y orientar la recogida de datos.
- Indexación y búsqueda de contenido audiovisual: la transcripción rápida habilita motores de búsqueda sobre archivos de audio y vídeo en árabe, con integración directa mediante la API de NVIDIA NeMo en pocas líneas de Python.
- Evaluación comparativa de ASR árabe: al publicar resultados en el Open Universal Arabic ASR Leaderboard con seis conjuntos de test, sirve como línea base ligera para comparar futuros modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto de evaluacion | Metrica | Valor |
|---|---|---|
| Media de seis benchmarks (in-domain) | WER (RNN-T beam search) | 20,40% |
| Media de seis benchmarks | CER (RNN-T beam search) | 9,12% |
| Media de seis benchmarks | WER (greedy) | 21,11% |
| Media de seis benchmarks | CER (greedy) | 9,79% |
| MASC-clean | WER | 5,43% |
| MASC-noisy | WER | 18,13% |
| CommonVoice 18 (árabe) | WER | 7,01% |
| MGB-2 | WER | 9,89% |
| SADA22 | WER | 28,29% |
| Casablanca | WER | 53,63% |

El autor afirma que supera a Jais-ASR, Sygma-ASR-Arabic, Audar-ASR-V1-Turbo y Cohere Transcribe Arabic tanto con decodificación greedy como con beam search, y que lidera en SADA22, MASC-clean y MASC-noisy. No se han publicado en la información disponible los valores numéricos de esos modelos comparados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 0,63 GB en memoria y el pico de inferencia es de 0,45 GB, por lo que cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM libre.
- GPU recomendadas: cualquier GPU NVIDIA moderna; el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090, así como en A100 o H100 (donde el rendimiento estará limitado por la CPU y el I/O más que por la GPU).
- Cabe en GPU de consumo: sí, en cualquier GPU con 1-2 GB de VRAM; también es viable en CPU para transcripción por lotes, aunque con mayor latencia.
- Opciones de despliegue: NVIDIA NeMo (framework nativo, carga en pocas líneas de Python); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo ASR de este tipo.
- Latencia y throughput: RTF medio de 0,01631, equivalente a unas 61 veces la velocidad de tiempo real; el beam search con `beam_size=20` añade coste frente a greedy pero mejora el WER en 0,71 puntos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER medio (segun autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sabeq-ASR | 113M | Audio 16 kHz mono | 20,40% (beam search) | CC-BY-4.0 | HuggingFace (NeMo) |
| Jais-ASR | 6B | no disponible | no disponible (el autor afirma que Sabeq-ASR lo supera) | no disponible | no disponible |
| Audar-ASR-V1-Turbo | 2,35B | no disponible | no disponible (el autor afirma que Sabeq-ASR lo supera) | no disponible | no disponible |
| Sygma-ASR-Arabic | 2B | no disponible | no disponible (el autor afirma que Sabeq-ASR lo supera) | no disponible | no disponible |
| Cohere Transcribe Arabic | 2B | no disponible | no disponible (el autor afirma que Sabeq-ASR lo supera) | no disponible | no disponible |

Los datos de los modelos competidores no se detallan en la información proporcionada; solo se conoce su tamaño y la afirmación del autor de que Sabeq-ASR obtiene el menor WER medio del leaderboard pese a ser 16-50 veces más pequeño.

## Limitaciones y advertencias

- El rendimiento cae drásticamente en dialectos magrebíes: el WER en Casablanca es del 53,63%, más del doble que la media, lo que desaconseja su uso sin supervisión en ese dominio.
- El WER en SADA22 (28,29%) también supera ampliamente la media de 20,40%, lo que indica variabilidad significativa según el conjunto de evaluación.
- El ruido degrada sustancialmente la precisión: MASC-noisy (18,13% WER) frente a MASC-clean (5,43% WER), una diferencia de más de 12 puntos.
- Todos los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El modelo solo soporta árabe; no cubre otros idiomas ni tareas de traducción.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos dialectales y de dominio público, puede heredar sesgos de representación de las variedades dialectales menos representadas.
- Riesgo de alucinación inherente a los modelos ASR: en segmentos con ruido extremo o audio ininteligible puede generar texto plausible pero incorrecto.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor y la licencia en productos derivados.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita opciones de despliegue fuera del ecosistema NeMo.
- No se especifican los datos exactos de entrenamiento ni el número de horas, lo que dificulta evaluar la cobertura dialectal real y el riesgo de sobreajuste a los conjuntos de test.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MostafaAhmed98/Sabeq-ASR
- NVIDIA NeMo (repositorio): https://github.com/NVIDIA/NeMo
- Open Universal Arabic ASR Leaderboard (Space): https://huggingface.co/spaces/elmresearchcenter/open_universal_arabic_asr_leaderboard
- Open Universal Arabic ASR Leaderboard (GitHub): https://github.com/Natural-Language-Processing-Elm/open_universal_arabic_asr_leaderboard
