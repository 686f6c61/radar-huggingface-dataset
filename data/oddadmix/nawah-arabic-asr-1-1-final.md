# oddadmix/nawah-arabic-asr-1.1-final

## Resumen

Nawah Arabic ASR 1.1-final es un modelo de reconocimiento automático del habla (ASR) para árabe desarrollado por el usuario oddadmix y publicado en Hugging Face. Se distribuye como un paquete autocontenido de inferencia: un único script `transcribe.py` de 21 KB, los pesos en `model.pt` (251 MB), un tokenizador y un modelo de lenguaje externo `lm.npz` (362 MB) que alimenta la decodificación por defecto. El modelo resuelve la transcripción de audio en árabe a texto sin diacríticos, con soporte de CPU y GPU, y no requiere código adicional más allá de las dependencias declaradas.

El modelo tiene 62,7 millones de parámetros, lo que lo sitúa en la gama ligera y permite ejecutarlo en hardware modesto. Acepta cualquier frecuencia de muestreo y número de canales (se remuestrea a 16 kHz y se convierte a mono), lee los formatos soportados por `libsndfile` (wav, flac, ogg y mp3 en compilaciones recientes) y segmenta automáticamente audios largos en fragmentos de hasta 20 segundos cortados en puntos silenciosos.

Su relevancia actual radica en el rendimiento reportado por el autor: con decodificación por defecto (beam search de 4 con modelo de lenguaje), obtiene un WER medio de 30,00 y un CER medio de 11,62 sobre seis conjuntos de prueba árabes que suman 46.846 clips y 60,3 horas. Según sus propias mediciones, eso lo situaría en sexta posición por WER y segunda por CER frente a los 38 sistemas del Open Universal Arabic ASR Leaderboard a fecha de 25 de septiembre de 2026, aunque no se trata de un envío oficial al leaderboard. El punto débil es el habla conversacional y dialectal: el WER sube al 56,10 en Casablanca y al 47,02 en SADA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR; pesos en `model.pt`, sin detalle de arquitectura en la model card) |
| Parametros totales | 62,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa fragmentos de hasta 20 s; audios de más de 45 s se cortan en puntos silenciosos) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` de 251 MB; no se documentan variantes cuantizadas) |
| Idiomas soportados | árabe (ar) |
| Licencia | no disponible; la model card indica explícitamente "No license is granted" |
| Formato de pesos | `model.pt` (PyTorch), más `tokenizer.json` y `lm.npz` (modelo de lenguaje para decodificación) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo (tipo de encoder, número de capas, mecanismo de atención ni estrategia de entrenamiento). Lo que sí se documenta es el pipeline de inferencia: un modelo acústico de 62,7 M de parámetros que emite tokens sobre un tokenizador propio (`tokenizer.json`) y una decodificación por defecto con beam search de anchura 4 combinada con un modelo de lenguaje n-grama o similar empaquetado en `lm.npz`, con peso de LM 0,1 y bonus de longitud 1,0. Existe también un modo greedy (`--greedy`) que prescinde de `lm.npz` y es varias veces más rápido.

No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del corpus, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El preprocesado sí está descrito con precisión: mezcla a mono, remuestreo a 16 kHz, segmentación de audios largos en trozos de hasta 20 s cortados en puntos de silencio y agrupación en lotes de 8 ordenados por longitud (el padding dentro del lote altera ligeramente las salidas, por lo que se recomienda mantener `--batch-size 8` para reproducir los números publicados).

## Capacidades

- Transcripción de voz a texto en árabe, con salida sin diacríticos y posibilidad de incluir puntuación ligera (`.`, `،`, `؟`) y letras latinas o dígitos cuando aparecen en el habla.
- Entrada de audio flexible: cualquier frecuencia de muestreo y número de canales; formatos wav, flac, ogg y mp3 en compilaciones recientes de `libsndfile`.
- Procesamiento de audio largo mediante segmentación automática en fragmentos de hasta 20 s cortados en puntos silenciosos, con unión posterior de las transcripciones.
- Selección de tramos concretos dentro de un fichero mediante los campos `t0` y `t1` (en segundos) en el manifiesto JSONL.
- Procesamiento por lotes vía manifiesto JSONL (`--manifest`) con salida en el mismo orden de entrada y campo `pred_text` añadido.
- Dos modos de decodificación: beam search con modelo de lenguaje (más preciso) y greedy (varias veces más rápido y sin necesidad de `lm.npz`).
- Ejecución en GPU CUDA o CPU con selección automática de dispositivo y posibilidad de forzarlo con `--device`.
- API de Python (`from transcribe import ASR`) y uso por línea de comandos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en árabe: el modelo acepta cualquier formato leído por `libsndfile` y segmenta automáticamente grabaciones largas en trozos de hasta 20 s, lo que permite transcribir conversaciones de duración arbitraria sin preprocesado manual.
- Subtitulado y archivado de contenido broadcast: es en habla limpia y de radiodifusión donde el modelo rinde mejor (WER de 12,21 en MASC clean y 17,37 en MGB-2), por lo que encaja en pipelines de generación de subtítulos para medios informativos o programas de radio.
- Indexación y búsqueda de archivos de audio: la salida en JSONL con `pred_text` por línea facilita volcar transcripciones a un índice de búsqueda o a una base de datos documental para recuperar fragmentos por texto.
- Procesamiento por lotes en servidor modesto: con 62,7 M de parámetros y 251 MB de pesos, el modelo cabe en CPU y en GPUs de consumo, lo que permite ejecutar lotes nocturnos de transcripción sin infraestructura dedicada.
- Prototipado rápido y evaluación de datasets árabes: el paquete autocontenido (un script, pesos, tokenizador y LM) permite montar un baseline de ASR árabe en minutos y comparar contra los seis conjuntos de referencia reportados (SADA, Common Voice 18, MASC clean/noisy, Casablanca, MGB-2).
- Extracción de tramos concretos para anotación: los campos `t0`/`t1` del manifiesto permiten transcribir solo segmentos de interés de una grabación, útil para revisión manual o para generar datos de entrenamiento a partir de porciones seleccionadas.
- Transcripción en tiempo casi real en modo greedy: al prescindir de `lm.npz` y ser varias veces más rápido, el modo greedy sirve para aplicaciones interactivas donde prima la latencia sobre la precisión (el WER medio sube de 30,00 a 30,75).

## Benchmarks y rendimiento

Resultados publicados por el autor sobre seis conjuntos de prueba árabes (46.846 clips, 60,3 horas), con la normalización de texto del Open Universal Arabic ASR Leaderboard. Las medias son medias no ponderadas sobre los seis conjuntos.

Decodificación por defecto (beam search + modelo de lenguaje):

| Conjunto de prueba | Clips | WER | WER (ة plegada) | CER |
|---|---:|---:|---:|---:|
| SADA | 6.186 | 47,02 | 42,27 | 21,27 |
| Common Voice 18 | 10.471 | 22,94 | 17,83 | 7,19 |
| MASC clean | 8.612 | 12,21 | 9,71 | 3,51 |
| MASC noisy | 9.394 | 24,38 | 22,49 | 8,68 |
| Casablanca | 6.818 | 56,10 | 53,58 | 22,90 |
| MGB-2 | 5.365 | 17,37 | 13,61 | 6,17 |
| **Media** | | **30,00** | **26,58** | **11,62** |

Decodificación greedy (`--greedy`):

| Conjunto de prueba | Clips | WER | WER (ة plegada) | CER |
|---|---:|---:|---:|---:|
| SADA | 6.186 | 47,87 | 43,35 | 22,11 |
| Common Voice 18 | 10.471 | 23,55 | 18,51 | 7,28 |
| MASC clean | 8.612 | 12,74 | 10,47 | 3,71 |
| MASC noisy | 9.394 | 25,14 | 23,48 | 9,11 |
| Casablanca | 6.818 | 56,77 | 54,32 | 23,47 |
| MGB-2 | 5.365 | 18,46 | 14,29 | 6,81 |
| **Media** | | **30,75** | **27,40** | **12,08** |

La columna "ة plegada" aplica una normalización que mapea ة a ه y ى a ي tanto en la referencia como en la hipótesis antes de puntuar, para eliminar la variabilidad ortográfica en las terminaciones de palabra. Según el autor, frente al leaderboard tal como estaba el 25 de septiembre de 2026 (38 sistemas), la media con decodificación por defecto situaría al modelo en sexta posición por WER y segunda por CER; se trata de mediciones propias, no de un envío oficial.

## Requisitos de hardware

- Pesos: 251 MB en `model.pt`; el modelo de lenguaje opcional `lm.npz` añade 362 MB (solo necesario para la decodificación por defecto).
- VRAM estimada para inferencia: no disponible de forma explícita; con 62,7 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,25 GB, por lo que la huella en GPU es muy reducida.
- GPU: no se especifican modelos recomendados; el código usa CUDA cuando está disponible y CPU en caso contrario.
- GPU de consumo: por tamaño, cabe holgadamente en cualquier GPU de consumo actual; no se publican cifras de VRAM medidas.
- Despliegue: el paquete incluye su propio script `transcribe.py` con CLI y API de Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Dependencias: `torch`, `torchaudio`, `tokenizers`, `numpy`, `soundfile`.
- Latencia y throughput: no se publican cifras concretas; solo se indica que el modo greedy es "varias veces más rápido" que la decodificación por defecto y que no necesita `lm.npz`. El procesamiento por lotes usa tamaño 8 con ordenación por longitud.

## Comparativa con modelos similares

No se dispone de datos de otros modelos ASR árabes en la información proporcionada (parámetros, contexto, licencia o rendimiento) que permitan una comparación rigurosa. La única referencia comparativa disponible es la posición relativa que el autor atribuye al modelo en el Open Universal Arabic ASR Leaderboard a fecha de 25 de septiembre de 2026 (38 sistemas): sexto por WER y segundo por CER, con la salvedad de que son mediciones propias y no un envío oficial.

| Modelo | Parámetros | Contexto | WER medio | CER medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nawah Arabic ASR 1.1-final | 62,7 M | no disponible (fragmentos de 20 s) | 30,00 | 11,62 | no disponible ("No license is granted") | Hugging Face (oddadmix/nawah-arabic-asr-1.1-final) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia: la model card declara explícitamente "No license is granted". No hay autorización de uso documentada, lo que impide asumir permisos para uso comercial o redistribución; conviene contactar con el autor antes de cualquier despliegue en producción.
- Rendimiento muy dependiente del tipo de audio: fuerte en habla limpia y de radiodifusión (WER 12,21 en MASC clean) y débil en habla conversacional y dialectal (WER 56,10 en Casablanca, 47,02 en SADA). No es adecuado como solución única para dialectos sin evaluación previa.
- Sesgos: no se documentan análisis de sesgo por género, edad, acento o región; dado el comportamiento por conjunto de prueba, es previsible un sesgo hacia el árabe estándar y el habla de radiodifusión frente a dialectos.
- Alucinación: no se documenta evaluación específica de alucinaciones en ASR; en decodificación con modelo de lenguaje, el peso del LM (0,1) y el bonus de longitud (1,0) pueden inducir texto plausible no presente en el audio, y el autor advierte que ambos parámetros interactúan y deben modificarse juntos.
- Idiomas: solo árabe (ar); no hay soporte multilingüe documentado.
- Formato de salida: texto sin diacríticos, lo que limita aplicaciones que requieran vocalización completa; la puntuación es ligera y opcional.
- Reproducibilidad: el padding dentro de los lotes altera ligeramente las salidas; para reproducir exactamente los números publicados hay que mantener `--batch-size 8`.
- Arquitectura y entrenamiento no documentados: no se especifican datos de entrenamiento, composición del corpus ni detalles del modelo acústico, lo que dificulta evaluar riesgos de contaminación de datos o generalización.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con una única versión publicada; no hay evidencia de mantenimiento ni de comunidad que valide los resultados de forma independiente.
- No se documentan variantes cuantizadas ni soporte para runtimes de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue escalado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/nawah-arabic-asr-1.1-final
- Open Universal Arabic ASR Leaderboard (referencia de evaluación citada por el autor): no disponible en la información proporcionada
- Paper, blog o repositorio adicional del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
